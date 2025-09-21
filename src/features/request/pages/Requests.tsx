import Add from "@mui/icons-material/Add";
import ChevronRight from "@mui/icons-material/ChevronRight";
import Refresh from "@mui/icons-material/Refresh";
import Breadcrumbs from "@mui/material/Breadcrumbs";
import Button from "@mui/material/Button";
import ButtonGroup from "@mui/material/ButtonGroup";
import Divider from "@mui/material/Divider";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import { ColumnDef, createColumnHelper } from "@tanstack/react-table";
import { useState, useEffect, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { RequestQuoteListViewModel } from '@features/request/api/types.gen';
import Chip from "@mui/material/Chip";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getApiRequestOptions } from '@features/request/api/@tanstack/react-query.gen';
// import { getContactGetContactsOptions } from '@features/crm/api/@tanstack/react-query.gen'; // REMOVED: Not used
import EditableTable from '@components/common/EditableTable';
import { Autorenew, Block, DoneAll, NewReleases, RemoveCircle, AutoFixHigh, LocalOffer } from "@mui/icons-material";
import { styled } from "@mui/material/styles";
import { IconButton, Tooltip, ToggleButton, ToggleButtonGroup } from "@mui/material";
import Pagination from '@mui/material/Pagination';
import Box from '@mui/material/Box';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import Paper from '@mui/material/Paper';
import InputAdornment from '@mui/material/InputAdornment';
import SearchIcon from '@mui/icons-material/Search';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import Inventory2Icon from '@mui/icons-material/Inventory2';
import LocalOfferIcon from '@mui/icons-material/LocalOffer';
import Fade from '@mui/material/Fade';
import Grid from '@mui/material/Grid';
import { getApiRequestById } from '@features/request/api/sdk.gen';
import { getApiAssignee } from '@features/request/api';
import { putApiRequestUpdateById, getUserGroupUsersByUserId } from '@features/request/api/sdk.gen';
import { safeGetUserDetails } from '@utils/userUtils';
import { getApiQuotes } from '@features/offer/api';
// import debounce from 'lodash.debounce'; // REMOVED: Not used currently
import TuneIcon from '@mui/icons-material/Tune';
import CircularProgress from '@mui/material/CircularProgress';
import TableBodySkeleton from '../../../components/skeletons/TableBodySkeleton';
import { useTranslation } from 'react-i18next';

const columnHelper = createColumnHelper<RequestQuoteListViewModel>()

const RotatingIcon = styled(Autorenew)`
  animation: spin 1s linear infinite;
  @keyframes spin {
    100% { transform: rotate(360deg); }
  }
`;

// Définir le type de la réponse paginée
interface PagedRequestQuoteList {
  items: RequestQuoteListViewModel[];
  totalCount: number;
  page: number;
  pageSize: number;
}

/**
 * OPTIMISATIONS POUR LES CONTACTS (à implémenter quand nécessaire) :
 * 
 * 1. PAGINATION :
 *    - getContactGetContactsOptions({ query: { page: 1, pageSize: 50 } })
 * 
 * 2. RECHERCHE AVEC DEBOUNCE :
 *    - Rechercher seulement quand l'utilisateur tape (3+ caractères)
 *    - getContactSearchOptions({ query: { search: searchTerm, limit: 20 } })
 * 
 * 3. AUTOCOMPLETE AU LIEU DE LISTE COMPLÈTE :
 *    - Utiliser un composant Autocomplete avec recherche asynchrone
 *    - Charger les résultats à la demande
 * 
 * 4. CACHE INTELLIGENT :
 *    - Mettre en cache seulement les contacts récemment utilisés
 *    - Utiliser staleTime approprié (ex: 5 minutes)
 * 
 * 5. LAZY LOADING :
 *    - Charger les contacts seulement quand le champ est focus
 *    - useQuery avec enabled: false, puis refetch manuellement
 */

const Requests = () => {
    //console.log("Requests.tsx mounted");
    // const [globalFilter, setGlobalFilter] = useState('') // REMOVED: Not used
    const navigate = useNavigate();
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(25);
    const [filters, setFilters] = useState({
      search: '',
      pickupCity: '',
      deliveryCity: '',
      incoterm: '',
      productName: '',
      trackingNumber: '',
    });
    const [loadingWizardId, setLoadingWizardId] = useState<string | null>(null);
    const [searchMode, setSearchMode] = useState<'simple' | 'advanced'>('simple');
    const [localSearch, setLocalSearch] = useState('');
    const queryClient = useQueryClient();
    const { t } = useTranslation();
    const [assignees, setAssignees] = useState<any[]>([]);
    const [loadAssignees, setLoadAssignees] = useState<boolean>(true);
    const [updatingAssigneeId, setUpdatingAssigneeId] = useState<string | null>(null);
    const [assigneeDetails, setAssigneeDetails] = useState<{ [id: string]: any }>({});
    const [requestQuotes, setRequestQuotes] = useState<{ [requestId: string]: any[] }>({});
    const [loadingQuotes, setLoadingQuotes] = useState<{ [requestId: string]: boolean }>({});

    useEffect(() => {
      async function fetchAssignees() {
        setLoadAssignees(true);
        try {
          const response = await getApiAssignee();
          // Adapter selon la structure réelle de la réponse
          if (Array.isArray(response)) {
            setAssignees(response);
          } else if (response && Array.isArray(response.data)) {
            setAssignees(response.data);
          } else if (response && response.data && response.data.data && Array.isArray(response.data.data)) {
            setAssignees(response.data.data);
          } else {
            setAssignees([]);
          }
        } catch (e) {
          setAssignees([]);
        }
        setLoadAssignees(false);
      }
      fetchAssignees();
    }, []);

    // REMOVED: Debounce not used in current implementation
    // const debouncedSetSearch = useState(() => debounce((value) => {
    //   setFilters(f => ({ ...f, search: value }));
    // }, 400))[0];

    const getApiRequestConfig = getApiRequestOptions({
      query: {
        page,
        pageSize,
        search: filters.search,
        pickupCity: filters.pickupCity,
        deliveryCity: filters.deliveryCity,
        incoterm: filters.incoterm,
        productName: filters.productName,
        trackingNumber: filters.trackingNumber,
      }
    });
   /* console.log("getApiRequestOptions config", getApiRequestConfig);
    console.log("Query parameters:", {
      page,
      pageSize,
      search: filters.search,
      pickupCity: filters.pickupCity,
      deliveryCity: filters.deliveryCity,
      incoterm: filters.incoterm,
      productName: filters.productName,
      trackingNumber: filters.trackingNumber,
    });*/

    const {data, isLoading, refetch, error, isError} = useQuery({
        ...getApiRequestConfig,
        staleTime: Infinity
    })

    // Extraire le tableau items de la réponse paginée
    const safeData = useMemo(() => {
        if (!data) return [];
        // Si data est déjà un tableau (ancien format)
        if (Array.isArray(data)) return data;
        // Si data est un objet avec items (nouveau format paginé)
        if (data && typeof data === 'object' && 'items' in data && Array.isArray(data.items)) {
            return data.items;
        }
        return [];
    }, [data]);

    // Extraire les informations de pagination
    const paginationInfo = useMemo(() => {
        if (!data || Array.isArray(data)) return null;
        if (data && typeof data === 'object' && 'totalCount' in data) {
            return {
                totalCount: data.totalCount || 0,
                page: data.page || 1,
                pageSize: data.pageSize || 25,
                totalPages: Math.ceil((data.totalCount || 0) / (data.pageSize || 25))
            };
        }
        return null;
    }, [data]);

 

    // Log supplémentaire quand les états changent
    /*useEffect(() => {
        console.log("=== STATE CHANGE ===");
        console.log("Loading state changed:", { isLoading, isError });
        if (error) {
            console.error("API Error:", error);
        }
        console.log("==================");
    }, [isLoading, isError, error]);

    useEffect(() => {
        //console.log('useEffect data:', data);
       // console.log('useEffect safeData:', safeData);
        if (safeData.length > 0) {
            console.log('API Response - Liste des demandes:', safeData);
            console.log('Structure des données:', safeData.map((item: RequestQuoteListViewModel) => ({
                requestQuoteId: item.requestQuoteId,
                companyName: item.companyName,
                customerId: item.customerId,
                pickupCity: item.pickupCity,
                deliveryCity: item.deliveryCity,
                status: item.status,
                createdAt: item.createdAt
            })));
        }
    }, [data, safeData]);*/

    // Charger les infos détaillées des assignés affichés
    useEffect(() => {
      const ids = Array.from(new Set(safeData.map(r => r.assigneeId).filter(Boolean)));
      ids.forEach(async (id) => {
        if (id && !assigneeDetails[id]) {
          const userDetails = await safeGetUserDetails(
            id, 
            (userId) => getUserGroupUsersByUserId({ path: { userId } })
          );
          setAssigneeDetails(prev => ({ ...prev, [id]: userDetails }));
        }
      });
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [safeData]);

    // Vérifier les devis liés pour chaque demande affichée
    useEffect(() => {
      const requestIds = safeData.map(r => r.requestQuoteId).filter(Boolean);
      requestIds.forEach(async (requestId) => {
        if (requestId && requestQuotes[requestId] === undefined) {
          await checkQuotesForRequest(requestId);
        }
      });
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [safeData]);

    console.log('isLoading:', isLoading);

    // REMOVED: Chargement inutile de tous les contacts
    // const {data: contacts} = useQuery({
    //     ...getContactGetContactsOptions(),
    //     staleTime: Infinity
    // });
    // console.log("Contacts data:", contacts);

    // Fonction pour vérifier s'il y a des devis liés à une demande
    const checkQuotesForRequest = async (requestId: string) => {
        if (requestQuotes[requestId] !== undefined) {
            return requestQuotes[requestId]; // Déjà vérifié
        }

        setLoadingQuotes(prev => ({ ...prev, [requestId]: true }));
        
        try {
            const response = await getApiQuotes({
                query: {
                    requestQuoteId: requestId,
                    page: 1,
                    pageSize: 100
                }
            });
            
            // Extraire les quotes de la réponse paginée
            const quotes = response?.data?.items || response?.data?.data || response?.data || [];
            setRequestQuotes(prev => ({ ...prev, [requestId]: quotes }));
            return quotes;
        } catch (error) {
            console.error(`[Requests] Erreur lors de la vérification des devis pour la demande ${requestId}:`, error);
            setRequestQuotes(prev => ({ ...prev, [requestId]: [] }));
            return [];
        } finally {
            setLoadingQuotes(prev => ({ ...prev, [requestId]: false }));
        }
    };

    const handleViewQuotes = (request: RequestQuoteListViewModel) => {
        // Navigation vers la page de gestion des devis avec filtre sur la demande
        navigate('/manage-price-offers', {
            state: {
                filterRequestId: request.requestQuoteId,
                requestData: request
            }
        });
    };

    const handleLaunchWizard = async (request: RequestQuoteListViewModel) => {
        setLoadingWizardId(request.requestQuoteId ?? '');
        try {
            // Toujours charger la demande complète
            const res = await getApiRequestById({ path: { id: request.requestQuoteId ?? '' } });
            if (res && res.data) {
                // Patch : si companyName est vide dans la réponse API, on le récupère depuis la ligne de la liste
                const patchedData = {
                    ...res.data,
                    companyName: res.data.companyName || request.companyName // Priorité à la donnée API, sinon fallback sur la liste
                };
                navigate('/request-wizard', {
                    state: {
                        requestData: patchedData,
                        source: 'api'
                    }
                });
            }
        } finally {
            setLoadingWizardId(null);
        }
    };

    const handleAssigneeChange = async (requestId: string, newAssigneeId: string) => {
      setUpdatingAssigneeId(requestId);
      try {
        await putApiRequestUpdateById({
          path: { id: requestId },
          body: { assigneeId: newAssigneeId }
        });
        // Refetch the list after update
        refetch();
        // Charger les infos détaillées du nouvel assigné si besoin
        if (newAssigneeId && !assigneeDetails[newAssigneeId]) {
          const userDetails = await safeGetUserDetails(
            newAssigneeId, 
            (userId) => getUserGroupUsersByUserId({ path: { userId } })
          );
          setAssigneeDetails(prev => ({ ...prev, [newAssigneeId]: userDetails }));
        }
      } catch (e) {
        // Optionally: show error feedback
        console.error(e);
      }
      setUpdatingAssigneeId(null);
    };

    // Mappings pour l'affichage des statuts (doivent être dans le composant pour accéder aux icônes)
    const statusColorMap: Record<string, 'default' | 'primary' | 'success' | 'warning' | 'error' | 'info'> = {
      New: 'info',
      EnAttente: 'warning',
      Valider: 'success',
      Rejeter: 'error',
      EnCoursDeTraitement: 'warning',
      EnTransit: 'info',
      EnDouane: 'info',
      LivraisonEnCours: 'info',
      Livre: 'success',
      Annule: 'default',
      Retour: 'default',
      Problème: 'error',
      EnAttenteDeFacturation: 'info',
      // fallback anglais
      NEW: 'info',
      PENDING: 'warning',
      VALIDATED: 'success',
      REJECTED: 'error',
      CANCELLED: 'default',
      BLOCKED: 'error',
    };
    const statusIconMap: Record<string, JSX.Element> = {
      New: <NewReleases />,
      EnAttente: <RotatingIcon />,
      Valider: <DoneAll />,
      Rejeter: <RemoveCircle />,
      EnCoursDeTraitement: <RotatingIcon />,
      EnTransit: <LocalShippingIcon />,
      EnDouane: <Inventory2Icon />,
      LivraisonEnCours: <LocalShippingIcon />,
      Livre: <DoneAll />,
      Annule: <Block />,
      Retour: <Block />,
      Problème: <Block />,
      EnAttenteDeFacturation: <Autorenew />,
      // fallback anglais
      NEW: <NewReleases />,
      PENDING: <RotatingIcon />,
      VALIDATED: <DoneAll />,
      REJECTED: <RemoveCircle />,
      CANCELLED: <Block />,
      BLOCKED: <Block />,
    };

    const columns: ColumnDef<RequestQuoteListViewModel, unknown>[] = [
        columnHelper.accessor('status', {
            header: "Status",
            cell: ({ getValue }) => {
                const rawStatus = getValue() || 'NEW';
                // On tente d'abord la version "propre" (ex: EnAttente), sinon fallback sur la version uppercased
                const statusKey = statusColorMap[rawStatus] ? rawStatus : (rawStatus || '').toUpperCase();
                const label = String(t(`status.${statusKey}`, statusKey));
                const color = statusColorMap[statusKey] || 'default';
                const icon = statusIconMap[statusKey] || <NewReleases />;
                return <Chip icon={icon} size="small" label={label} variant="outlined"
                    color={color as "default" | "primary" | "secondary" | "error" | "info" | "success" | "warning"} />
            }
        }),
        // Nouvelle colonne Assigné à
        columnHelper.display({
            id: 'assignee',
            header: "Assigné à",
            cell: ({ row }) => {
                const displayName = row.original.assigneeDisplayName || 'Non assigné';
                return displayName;
            }
        }),
        columnHelper.accessor('trackingNumber', {
            header: "Quote number",
            cell: ({ row, getValue }) => 
                <Link to={`/request/${row.original.requestQuoteId}`}>
                    {getValue<string | null | undefined>()}
                </Link>
        }),
        columnHelper.display({
            id: 'customer',
            header: "Customer",
            cell: ({ row }) => row.original.companyName || 'N/A'
        }),
        columnHelper.display({
            id: 'departure',
            header: "Departure",
            cell: ({ row }) => row.original.pickupCity || 'N/A'
        }),
        columnHelper.display({
            id: 'arrival',
            header: "Arrival",
            cell: ({ row }) => row.original.deliveryCity || 'N/A'
        }),
        columnHelper.display({
            id: 'incoterm',
            header: "Incoterm",
            cell: ({ row }) => row.original.incoterm || 'N/A'
        }),
        columnHelper.display({
            id: 'created',
            header: "Created",
            cell: ({ row }) => {
                const createdAt = row.original.createdAt;
                if (!createdAt) return 'N/A';
                const date = new Date(createdAt);
                const yyyy = date.getFullYear();
                const mm = String(date.getMonth() + 1).padStart(2, '0');
                const dd = String(date.getDate()).padStart(2, '0');
                const hh = String(date.getHours()).padStart(2, '0');
                const min = String(date.getMinutes()).padStart(2, '0');
                return `${yyyy}-${mm}-${dd} ${hh}:${min}`;
            }
        }),
        columnHelper.display({
            id: 'actions',
            header: "Actions",
            cell: ({ row }) => {
                const requestId = row.original.requestQuoteId;
                const hasQuotes = requestQuotes[requestId]?.length > 0;
                const isLoadingQuotes = loadingQuotes[requestId];
                
                return (
                    <Stack direction="row" spacing={1}>
                        <Tooltip title="Lancer l'assistant commande">
                            <span>
                            <IconButton
                                size="small"
                                color="primary"
                                onClick={() => handleLaunchWizard(row.original)}
                                sx={{ 
                                    '&:hover': { 
                                        backgroundColor: 'rgba(25, 118, 210, 0.08)',
                                        transform: 'scale(1.1)',
                                        transition: 'all 0.2s'
                                    }
                                }}
                                disabled={loadingWizardId === requestId}
                            >
                                {loadingWizardId === requestId ? <Autorenew className="spin" fontSize="small" /> : <AutoFixHigh fontSize="small" />}
                            </IconButton>
                            </span>
                        </Tooltip>
                        
                        {/* Bouton pour voir les devis liés - affiché seulement s'il y en a */}
                        {hasQuotes && (
                            <Tooltip title={`Voir les ${requestQuotes[requestId]?.length} devis liés`}>
                                <span>
                                <IconButton
                                    size="small"
                                    color="secondary"
                                    onClick={() => handleViewQuotes(row.original)}
                                    sx={{ 
                                        '&:hover': { 
                                            backgroundColor: 'rgba(156, 39, 176, 0.08)',
                                            transform: 'scale(1.1)',
                                            transition: 'all 0.2s'
                                        }
                                    }}
                                >
                                    <LocalOfferIcon fontSize="small" />
                                </IconButton>
                                </span>
                            </Tooltip>
                        )}
                        
                        {/* Indicateur de chargement des devis */}
                        {isLoadingQuotes && (
                            <CircularProgress size={20} sx={{ ml: 1 }} />
                        )}
                    </Stack>
                );
            }
        })
    ]
    
    function applyLocalFilter(items: RequestQuoteListViewModel[], search: string) {
      if (!search) return items;
      const lower = search.toLowerCase();
      return items.filter((item: RequestQuoteListViewModel) =>
        Object.values(item).some(val =>
          typeof val === 'string' && val.toLowerCase().includes(lower)
        )
      );
    }

    function handleResetFilters() {
      setFilters({
        search: '',
        pickupCity: '',
        deliveryCity: '',
        incoterm: '',
        productName: '',
        trackingNumber: '',
      });
    }

    // Préchargement des données au montage
    useEffect(() => {
        queryClient.prefetchQuery(
            getApiRequestOptions({
                query: {
                    page: 1,
                    pageSize: 25,
                    search: '',
                    pickupCity: '',
                    deliveryCity: '',
                    incoterm: '',
                    productName: '',
                    trackingNumber: '',
                }
            })
        );
    }, [queryClient]);
    
    return (
        <>
            <Breadcrumbs separator={<ChevronRight fontSize='small' />} aria-label="breadcrumb">
                <Typography key="3" sx={{ color: 'text.primary' }}>
                    Request quotes
                </Typography>
            </Breadcrumbs>
            <Divider sx={{ mb: 1 }} />

            <Stack direction='row' alignItems='center' justifyContent='space-between' mb={1}>
                <ButtonGroup color='info' variant='text' size='small' aria-label='text button group'>
                    <Button startIcon={<Add />} to='/request' component={Link}>
                        Nouvelle demande
                    </Button>
                    {/* <Button disabled={uniqueSelectedIds.length === 0} startIcon={<DeleteForever />} onClick={handleDeleteHaulages} loading={deleting}>
                        Delete
                    </Button> */}
                    <Button startIcon={<Refresh />} onClick={()=>refetch()}>
                        Refresh
                    </Button>
                </ButtonGroup>
            </Stack>

            <Divider sx={{ mb: 2 }} />

            <Box sx={{ mb: 3, textAlign: 'center' }}>
                <ToggleButtonGroup
                    value={searchMode}
                    exclusive
                    onChange={(_, val) => val && setSearchMode(val)}
                    sx={{ mb: 0, boxShadow: '0 2px 12px 0 rgba(102,126,234,0.10)', borderRadius: 3, background: '#f5f7fa', p: 0.5 }}
                >
                    <ToggleButton
                        value="simple"
                        sx={{
                            px: 4,
                            py: 2,
                            borderRadius: 2,
                            fontWeight: 600,
                            fontSize: 18,
                            color: searchMode === 'simple' ? 'white' : 'primary.main',
                            background: searchMode === 'simple' ? 'linear-gradient(90deg, #667eea 0%, #764ba2 100%)' : 'transparent',
                            boxShadow: searchMode === 'simple' ? '0 2px 8px 0 #764ba233' : 'none',
                            transition: 'all 0.2s',
                            '&:hover': {
                                background: searchMode === 'simple' ? 'linear-gradient(90deg, #5a67d8 0%, #6b46c1 100%)' : '#e3e9f7',
                            },
                            mr: 2
                        }}
                    >
                        <SearchIcon sx={{ mr: 1, fontSize: 28 }} />
                        Recherche simple
                    </ToggleButton>
                    <ToggleButton
                        value="advanced"
                        sx={{
                            px: 4,
                            py: 2,
                            borderRadius: 2,
                            fontWeight: 600,
                            fontSize: 18,
                            color: searchMode === 'advanced' ? 'white' : 'primary.main',
                            background: searchMode === 'advanced' ? 'linear-gradient(90deg, #667eea 0%, #764ba2 100%)' : 'transparent',
                            boxShadow: searchMode === 'advanced' ? '0 2px 8px 0 #764ba233' : 'none',
                            transition: 'all 0.2s',
                            '&:hover': {
                                background: searchMode === 'advanced' ? 'linear-gradient(90deg, #5a67d8 0%, #6b46c1 100%)' : '#e3e9f7',
                            }
                        }}
                    >
                        <TuneIcon sx={{ mr: 1, fontSize: 28 }} />
                        Recherche avancée
                    </ToggleButton>
                </ToggleButtonGroup>
            </Box>

            {searchMode === 'simple' && (
                <Box sx={{
                    background: '#f5f7fa',
                    borderRadius: 2,
                    p: 2,
                    mb: 2,
                    boxShadow: '0 1px 4px 0 rgba(102,126,234,0.07)'
                }}>
                    <TextField
                        fullWidth
                        size="medium"
                        variant="outlined"
                        value={localSearch || ''}
                        onChange={e => setLocalSearch(e.target.value)}
                        placeholder="Filtrer les demandes affichées…"
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <SearchIcon color="primary" />
                                </InputAdornment>
                            ),
                        }}
                    />
                </Box>
            )}

            {searchMode === 'advanced' && (
                <Paper
                    elevation={2}
                    sx={{
                        p: { xs: 2, md: 3 },
                        borderRadius: 3,
                        background: '#fff',
                        boxShadow: '0 2px 12px 0 rgba(0,0,0,0.07)',
                        mb: 2
                    }}
                >
                    <Grid container spacing={2} alignItems="center">
                        <Grid item xs={12} md={10}>
                            <TextField
                                label="Recherche globale"
                                value={filters.search || ''}
                                onChange={e => setFilters(f => ({ ...f, search: e.target.value }))}
                                onKeyDown={e => {
                                    if (e.key === 'Enter') refetch();
                                }}
                                variant="outlined"
                                size="medium"
                                fullWidth
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <SearchIcon color="primary" />
                                        </InputAdornment>
                                    ),
                                }}
                            />
                        </Grid>
                        <Grid item xs={12} md={2} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 1 }}>
                            <Button
                                variant="contained"
                                color="primary"
                                onClick={() => refetch()}
                                startIcon={<SearchIcon />}
                                sx={{ minWidth: 120, borderRadius: 2 }}
                                disabled={isLoading}
                            >
                                Rechercher
                            </Button>
                            {isLoading && <CircularProgress size={28} sx={{ ml: 2 }} />}
                        </Grid>
                        <Grid item xs={12} md={2.4}>
                            <TextField
                                label="Numéro de suivi"
                                value={filters.trackingNumber}
                                onChange={e => setFilters(f => ({ ...f, trackingNumber: e.target.value }))}
                                variant="outlined"
                                size="medium"
                                fullWidth
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <SearchIcon color="primary" />
                                        </InputAdornment>
                                    ),
                                }}
                            />
                        </Grid>
                        <Grid item xs={12} md={2.4}>
                            <TextField
                                label="Ville de collecte"
                                value={filters.pickupCity}
                                onChange={e => setFilters(f => ({ ...f, pickupCity: e.target.value }))}
                                variant="outlined"
                                size="medium"
                                fullWidth
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <LocationOnIcon color="primary" />
                                        </InputAdornment>
                                    ),
                                }}
                            />
                        </Grid>
                        <Grid item xs={12} md={2.4}>
                            <TextField
                                label="Ville de livraison"
                                value={filters.deliveryCity}
                                onChange={e => setFilters(f => ({ ...f, deliveryCity: e.target.value }))}
                                variant="outlined"
                                size="medium"
                                fullWidth
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <LocalShippingIcon color="primary" />
                                        </InputAdornment>
                                    ),
                                }}
                            />
                        </Grid>
                        <Grid item xs={12} md={2.4}>
                            <TextField
                                label="Produit"
                                value={filters.productName}
                                onChange={e => setFilters(f => ({ ...f, productName: e.target.value }))}
                                variant="outlined"
                                size="medium"
                                fullWidth
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <Inventory2Icon color="primary" />
                                        </InputAdornment>
                                    ),
                                }}
                            />
                        </Grid>
                        <Grid item xs={12} md={2.4}>
                            <TextField
                                label="Incoterm"
                                value={filters.incoterm}
                                onChange={e => setFilters(f => ({ ...f, incoterm: e.target.value }))}
                                variant="outlined"
                                size="medium"
                                fullWidth
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <LocalOfferIcon color="primary" />
                                        </InputAdornment>
                                    ),
                                }}
                            />
                        </Grid>
                        <Grid item xs={12} md="auto" sx={{ display: 'flex', gap: 1, justifyContent: { md: 'flex-end' } }}>
                            <Button
                                variant="outlined"
                                color="secondary"
                                onClick={handleResetFilters}
                            >
                                Réinitialiser
                            </Button>
                        </Grid>
                    </Grid>
                </Paper>
            )}

            {safeData && (
              <Typography variant="body2" sx={{ mb: 1 }}>
                {paginationInfo ? 
                  `${safeData.length} demande${safeData.length > 1 ? 's' : ''} affichée${safeData.length > 1 ? 's' : ''} sur ${paginationInfo.totalCount} au total` :
                  `${safeData.length} demande${safeData.length > 1 ? 's' : ''} trouvée${safeData.length > 1 ? 's' : ''}`
                }
              </Typography>
            )}
            <EditableTable<RequestQuoteListViewModel>
                data={searchMode === 'simple' ? applyLocalFilter(safeData, localSearch) : safeData}
                columns={columns}
                isLoading={isLoading}
            />

            {paginationInfo && (
              <Box display="flex" justifyContent="center" alignItems="center" mt={2} gap={2}>
                <Pagination
                  count={paginationInfo.totalPages}
                  page={page}
                  onChange={(_, value) => setPage(value)}
                  color="primary"
                />
                <Select
                  value={pageSize}
                  onChange={e => { setPageSize(Number(e.target.value)); setPage(1); }}
                  size="small"
                  sx={{ ml: 2, minWidth: 80 }}
                >
                  {[10, 25, 50, 100].map(size => (
                    <MenuItem key={size} value={size}>{size} / page</MenuItem>
                  ))}
                </Select>
              </Box>
            )}
            <style>{`.spin { animation: spin 1s linear infinite; } @keyframes spin { 100% { transform: rotate(360deg); } }`}</style>
        </>
    )
}

export default Requests;