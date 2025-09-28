import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  Button,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Snackbar,
  CircularProgress,
  Stack,
  Avatar,
  Fade,
  TextField,
  InputAdornment,
  Tooltip
} from '@mui/material';
import {
  Delete,
  Visibility,
  Refresh,
  Dashboard,
  Timeline,
  Search,
  Schedule,
  Assignment,
  Person,
  PlayArrow,
  Settings as ManageIcon,
  Business
} from '@mui/icons-material';
import { DataGrid, GridRenderCellParams } from '@mui/x-data-grid';
import { useNavigate } from 'react-router-dom';
import { 
  getApiDraftQuotesOptions, 
  deleteApiDraftQuotesByIdMutation 
} from '@features/offer/api/@tanstack/react-query.gen';

interface DraftQuote {
  id: string;
  draftQuoteId?: string;
  requestQuoteId?: string;
  resumeToken?: string;
  createdAt?: Date;
  updatedAt?: Date;
  status?: string;
  currency?: string;
  incoterm?: string;
  customer?: {
    type?: string;
    name?: string;
    vat?: string;
    emails?: string[];
    phones?: string[];
    address?: {
      line1?: string;
      line2?: string;
      city?: string;
      zip?: string;
      country?: string;
    };
    contactPerson?: {
      fullName?: string;
      phone?: string;
      email?: string;
    };
  };
  shipment?: {
    origin?: {
      location?: string;
      country?: string;
    };
    destination?: {
      location?: string;
      country?: string;
    };
    requestedDeparture?: Date;
    cargoType?: string;
    goodsDescription?: string;
    containers?: Array<{
      containerType?: string;
      quantity?: number;
    }>;
  };
  attachments?: Array<{
    id?: string;
    name?: string;
    mime?: string;
  }>;
  commercialTerms?: any;
  wizard?: {
    currentStep?: number;
    completedSteps?: number[];
  };
  options?: Array<{
    optionId?: string;
    name?: string;
    label?: string;
    description?: string;
    validUntil?: string;
    currency?: string;
    isPreferred?: boolean;
    optionType?: string;
    containers?: any[];
    planning?: any;
    seafreights?: any[];
    haulages?: any[];
    services?: any[];
    totals?: any;
    terms?: any;
  }>;
  // Champs calculés pour l'affichage
  currentStep?: number;
  totalSteps?: number;
  completedSteps?: string[];
  assignedTo?: string;
}

const formatDate = (dateValue: any): string => {
  try {
    if (!dateValue) return 'Date non définie';
    
    let date: Date;
    if (typeof dateValue === 'string') {
      date = new Date(dateValue);
    } else if (dateValue instanceof Date) {
      date = dateValue;
    } else {
      return 'Format de date invalide';
    }
    
    if (isNaN(date.getTime())) {
      return 'Date invalide';
    }
    
    return date.toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch (error) {
    console.error('[DraftQuotes] Erreur formatage date:', error, dateValue);
    return 'Date invalide';
  }
};


const DraftQuotes: React.FC = () => {
  const navigate = useNavigate();
  
  const [drafts, setDrafts] = useState<DraftQuote[]>([]);
  
  // Utiliser React Query avec les options du SDK pour charger les brouillons
  const { 
    data: draftsResponse, 
    isLoading: loading, 
    error,
    refetch: loadDrafts 
  } = useQuery(getApiDraftQuotesOptions({
    query: {
      page: 1,
      pageSize: 100
    }
  }));
  const [searchTerm, setSearchTerm] = useState('');
  const [assignDialog, setAssignDialog] = useState(false);
  const [selectedDraft, setSelectedDraft] = useState<DraftQuote | null>(null);
  const [assignTo, setAssignTo] = useState('');
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error' | 'warning' | 'info';
  }>({
    open: false,
    message: '',
    severity: 'success'
  });
  
  const [viewMode, setViewMode] = useState<'card' | 'table'>('card');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingDraft, setDeletingDraft] = useState<DraftQuote | null>(null);
  
  // Mutation pour supprimer un draft
  const queryClient = useQueryClient();
  const deleteDraftMutation = useMutation(deleteApiDraftQuotesByIdMutation());

  // Traiter les données quand elles arrivent via React Query
  useEffect(() => {
    if (draftsResponse) {
      console.log('🔍 [DraftQuotes] Données reçues via useQuery:', draftsResponse);
      console.log('🔍 [DraftQuotes] Structure complète de la réponse:', JSON.stringify(draftsResponse, null, 2));
      processDraftsData(draftsResponse);
    }
  }, [draftsResponse]);

  // Gérer les erreurs React Query
  useEffect(() => {
    if (error) {
      console.error('[DraftQuotes] Erreur React Query:', error);
      setSnackbar({
        open: true,
        message: 'Erreur lors du chargement des brouillons',
        severity: 'error'
      });
    }
  }, [error]);

    const processDraftsData = (response: any) => {
    try {
      console.log('[DraftQuotes] Traitement des données reçues via useQuery:', response);
      
      // Extraire les données avec la nouvelle structure API: { code: 200, message: 'Success', data: [...] }
      let draftsData = [];
      if (response?.data && Array.isArray(response.data)) {
        draftsData = response.data;
        console.log('[DraftQuotes] Extraction depuis response.data (tableau direct)');
      } else if (Array.isArray(response)) {
        draftsData = response;
        console.log('[DraftQuotes] Extraction depuis response (tableau direct)');
      } else {
        console.warn('[DraftQuotes] Structure de données non reconnue:', response);
        console.log('[DraftQuotes] Type de response.data:', typeof response?.data);
        console.log('[DraftQuotes] Contenu de response.data:', response?.data);
      }
      
      if (draftsData && Array.isArray(draftsData)) {
        console.log('[DraftQuotes] Nombre de brouillons trouvés:', draftsData.length);
        
        const draftQuotes = draftsData
          .filter((quote: any) => {
            // Utiliser draftQuoteId comme ID principal
            const mongoId = quote.draftQuoteId;
            if (!mongoId) {
              console.warn(`[DraftQuotes] Brouillon sans ID MongoDB - ignoré:`, quote);
              return false;
            }
            return true;
          })
          .map((quote: any, index: number) => {
            console.log(`[DraftQuotes] Brouillon ${index} - Structure complète:`, {
              draftQuoteId: quote.draftQuoteId,
              requestQuoteId: quote.requestQuoteId,
              status: quote.status,
              createdAt: quote.createdAt,
              updatedAt: quote.updatedAt,
              customer: quote.customer,
              shipment: quote.shipment,
              wizard: quote.wizard,
              options: quote.options
            });
            
            // Extraire les données wizard
            const wizardData = quote.wizard || {};
            const persistedCurrentStep = wizardData.currentStep || 1;
            const persistedCompletedSteps = wizardData.completedSteps || [];
            
            // Calculer les étapes finales
            const finalCurrentStep = persistedCurrentStep;
            const finalCompletedSteps = persistedCompletedSteps.map((step: number) => `${step}/6 Étape ${step}`);
            
            // Extraire les informations du client
            const customerName = quote.customer?.name || 'Non défini';
            const customerEmail = quote.customer?.contactPerson?.email || 
                                (quote.customer?.emails && quote.customer.emails.length > 0 ? quote.customer.emails[0] : 'Non défini');
            
            // Extraire les informations de l'expédition
            const origin = quote.shipment?.origin?.location || 'Non défini';
            const destination = quote.shipment?.destination?.location || 'Non défini';
            
            console.log(`[DraftQuotes] Brouillon ${quote.draftQuoteId} - Données extraites:`, {
              customerName,
              customerEmail,
              origin,
              destination,
              finalCurrentStep,
              finalCompletedSteps
            });
            
            return {
              id: quote.draftQuoteId,
              draftQuoteId: quote.draftQuoteId,
              requestQuoteId: quote.requestQuoteId,
              resumeToken: quote.resumeToken,
              createdAt: quote.createdAt,
              updatedAt: quote.updatedAt,
              status: quote.status || 'DRAFT',
              currency: quote.currency,
              incoterm: quote.incoterm,
              customer: quote.customer,
              shipment: quote.shipment,
              attachments: quote.attachments,
              commercialTerms: quote.commercialTerms,
              wizard: quote.wizard,
              options: quote.options,
              // Champs calculés pour l'affichage
              currentStep: finalCurrentStep,
              totalSteps: 6,
              completedSteps: finalCompletedSteps,
              assignedTo: '', // Pas encore supporté par l'API
              // Champs de compatibilité pour l'affichage
              clientNumber: customerName,
              emailUser: customerEmail,
              created: quote.createdAt,
              lastModified: quote.updatedAt
            };
          });
        
        console.log('[DraftQuotes] Nombre d\'éléments traités:', draftQuotes.length);
        console.log('[DraftQuotes] Brouillons traités:', draftQuotes);
        
        setDrafts(draftQuotes);
      } else {
        console.warn('[DraftQuotes] Les données reçues ne sont pas un tableau:', draftsData);
        setDrafts([]);
      }
    } catch (error) {
      console.error('Erreur lors du traitement des brouillons:', error);
      setSnackbar({ 
        open: true, 
        message: 'Erreur lors du traitement des brouillons', 
        severity: 'error' 
      });
    }
  };

  const showSnackbar = (message: string, severity: 'success' | 'error' | 'warning' | 'info') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleAssignDraft = (draft: DraftQuote) => {
    setSelectedDraft(draft);
    setAssignTo(draft.assignedTo || '');
    setAssignDialog(true);
  };

  const handleAssignSubmit = async () => {
    if (!selectedDraft || !assignTo) return;

    try {
      // TODO: L'assignation n'est pas encore supportée par l'API OptimizedUpdateWizardDraftRequest
      // Il faudra attendre que le backend ajoute le support pour assignedTo
      console.warn('[DraftQuotes] Assignation non supportée par l\'API actuelle');
      
      setAssignDialog(false);
      showSnackbar('Assignation non supportée pour le moment', 'warning');
    } catch (error) {
      console.error('Erreur lors de l\'assignation:', error);
      showSnackbar('Erreur lors de l\'assignation', 'error');
    }
  };

  const handleContinueDraft = (draft: DraftQuote) => {
    if (!draft.id) {
      console.error('[DraftQuotes] Impossible de continuer le brouillon: ID manquant');
      showSnackbar('Erreur: ID du brouillon manquant', 'error');
      return;
    }
    
    console.log('[DraftQuotes] Continuer le brouillon:', draft.id);
    console.log('[DraftQuotes] Étape actuelle:', draft.currentStep);
    console.log('[DraftQuotes] Données du draft:', draft);

    // Naviguer vers le nouveau wizard avec le draftId dans l'URL
    // Le wizard fera lui-même l'appel API pour récupérer les données
    // Format: /request-wizard/draft/{draftId}/{step}
    const step = draft.currentStep && draft.currentStep > 1 ? draft.currentStep : 'basics';
    const url = `/request-wizard/draft/${draft.id}/${step}`;
    
    console.log('[DraftQuotes] URL de navigation:', url);
    console.log('[DraftQuotes] DraftId passé au wizard:', draft.id);
    console.log('[DraftQuotes] Étape initiale:', step);
    
    navigate(url, {
      state: {
        initialStep: step
        // Plus besoin de passer draftData, le wizard fera l'appel API
      }
    });
  };



  const handleViewDraft = (draft: DraftQuote) => {
    if (!draft.id) {
      console.error('[DraftQuotes] Impossible de voir le brouillon: ID manquant');
      showSnackbar('Erreur: ID du brouillon manquant', 'error');
      return;
    }
    // Naviguer vers le wizard pour voir/éditer le brouillon
    // Format: /request-wizard/draft/{draftId}/review
    const url = `/request-wizard/draft/${draft.id}/review`;
    console.log('[DraftQuotes] Navigation vers le wizard pour voir le brouillon:', url);
    navigate(url);
  };

  const handleManageQuote = (draft: DraftQuote) => {
    if (!draft.id) {
      console.error('[DraftQuotes] Impossible de gérer le devis: ID manquant');
      showSnackbar('Erreur: ID du brouillon manquant', 'error');
      return;
    }
    
    // Naviguer vers le wizard pour gérer le brouillon
    // Format: /request-wizard/draft/{draftId}/options
    const url = `/request-wizard/draft/${draft.id}/options`;
    console.log('[DraftQuotes] Navigation vers le wizard pour gérer le brouillon:', url);
    navigate(url);
  };

  const handleDeleteDraft = (draft: DraftQuote) => {
    setDeletingDraft(draft);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!deletingDraft) return;
    
    try {
      await deleteDraftMutation.mutateAsync({
        path: { id: deletingDraft.id }
      });
      
      // Invalider le cache pour recharger les données
      queryClient.invalidateQueries({ queryKey: ['getApiDraftQuotes'] });
      
      setDeleteDialogOpen(false);
      setDeletingDraft(null);
      showSnackbar('Brouillon supprimé avec succès', 'success');
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
      showSnackbar('Erreur lors de la suppression', 'error');
    }
  };

  const handleCancelDelete = () => {
    setDeleteDialogOpen(false);
    setDeletingDraft(null);
  };

  // Filtrer les brouillons selon le terme de recherche
  const filteredDrafts = drafts.filter(draft => {
    const searchLower = searchTerm.toLowerCase();
    const customerEmail = draft.customer?.contactPerson?.email || 
                        (draft.customer?.emails && draft.customer.emails.length > 0 ? draft.customer.emails[0] : '');
    return (
      customerEmail?.toLowerCase().includes(searchLower) ||
      draft.requestQuoteId?.toLowerCase().includes(searchLower) ||
      draft.assignedTo?.toLowerCase().includes(searchLower) ||
      draft.customer?.name?.toLowerCase().includes(searchLower) ||
      draft.draftQuoteId?.toLowerCase().includes(searchLower) ||
      draft.status?.toLowerCase().includes(searchLower)
    );
  });

  if (loading) {
    return (
      <Box 
        display="flex" 
        justifyContent="center" 
        alignItems="center" 
        minHeight="400px"
        flexDirection="column"
        gap={2}
      >
        <CircularProgress size={60} thickness={4} />
        <Typography variant="h6" color="text.secondary">
          Chargement des brouillons...
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* En-tête avec titre et actions */}
      <Paper 
        elevation={0} 
        sx={{ 
          p: 3, 
          mb: 3, 
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          borderRadius: 2
        }}
      >
        <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Box>
            <Typography variant="h4" fontWeight="bold" gutterBottom>
              📝 Brouillons de Devis
                </Typography>
            <Typography variant="body1" sx={{ opacity: 0.9 }}>
              Gérez vos brouillons en cours de création
                </Typography>
              </Box>
          <Stack direction="row" spacing={1}>
                <Button
              variant="contained"
                  startIcon={<Refresh />}
              onClick={() => loadDrafts()}
              sx={{ 
                bgcolor: 'rgba(255,255,255,0.2)', 
                '&:hover': { bgcolor: 'rgba(255,255,255,0.3)' }
              }}
                >
                  Actualiser
                </Button>
              </Stack>
        </Stack>
      </Paper>

      {/* Barre de recherche et filtres */}
      <Paper elevation={1} sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={6}>
              <TextField
                fullWidth
              placeholder="Rechercher par email, ID de demande ou assigné à..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search />
                    </InputAdornment>
                  ),
                }}
              />
          </Grid>
          <Grid item xs={12} md={6}>
            <Stack direction="row" spacing={2} justifyContent="flex-end">
              <Button
                variant={viewMode === 'card' ? 'contained' : 'outlined'}
                onClick={() => setViewMode('card')}
                startIcon={<Dashboard />}
              >
                Vue Cartes
              </Button>
              <Button
                variant={viewMode === 'table' ? 'contained' : 'outlined'}
                onClick={() => setViewMode('table')}
                startIcon={<Timeline />}
              >
                Vue Tableau
              </Button>
            </Stack>
          </Grid>
        </Grid>
          </Paper>

      {/* Affichage des statistiques */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ p: 2, textAlign: 'center' }}>
            <Avatar sx={{ bgcolor: 'primary.main', mx: 'auto', mb: 1 }}>
              <Assignment />
            </Avatar>
            <Typography variant="h4" fontWeight="bold">
              {drafts.length}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Total Brouillons
            </Typography>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ p: 2, textAlign: 'center' }}>
            <Avatar sx={{ bgcolor: 'warning.main', mx: 'auto', mb: 1 }}>
              <Schedule />
            </Avatar>
            <Typography variant="h4" fontWeight="bold">
              {drafts.filter(d => !d.assignedTo).length}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Non Assignés
            </Typography>
          </Card>
        </Grid>
      </Grid>

      {/* Contenu principal */}
      {filteredDrafts.length === 0 ? (
        <Paper 
          elevation={1} 
          sx={{ 
            p: 4, 
            textAlign: 'center',
            borderRadius: 2
          }}
        >
          <Avatar sx={{ bgcolor: 'grey.100', mx: 'auto', mb: 2, width: 80, height: 80 }}>
            <Assignment sx={{ fontSize: 40, color: 'grey.400' }} />
          </Avatar>
          <Typography variant="h6" gutterBottom>
            Aucun brouillon trouvé
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {searchTerm ? 
              'Aucun brouillon ne correspond à votre recherche.' : 
              'Aucun brouillon trouvé. Les brouillons sont créés automatiquement lors de l\'utilisation du wizard de demande de devis.'
            }
          </Typography>
        </Paper>
      ) : (
        <>
          {viewMode === 'card' ? (
            // Vue en cartes
                <Grid container spacing={3}>
                  {filteredDrafts.map((draft) => (
                <Grid item xs={12} sm={6} md={4} key={draft.id}>
                  <Fade in={true} timeout={300}>
                      <Card 
                      elevation={2}
                        sx={{ 
                        borderRadius: 2,
                          transition: 'all 0.3s ease',
                          '&:hover': {
                            transform: 'translateY(-4px)',
                          boxShadow: 4
                        }
                      }}
                    >
                      <CardContent>
                        {/* En-tête de la carte */}
                        <Stack direction="row" justifyContent="space-between" alignItems="flex-start" sx={{ mb: 2 }}>
                          <Box>
                            <Typography variant="h6" fontWeight="bold">
                              Brouillon #{draft.draftQuoteId?.substring(0, 8) || 'N/A'}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              ID: {draft.draftQuoteId ? draft.draftQuoteId.substring(0, 8) + '...' : 'N/A'}
                            </Typography>
                          </Box>
                            <Chip 
                            label={draft.status || 'DRAFT'}
                            color="warning"
                              size="small"
                          />
                        </Stack>

                        {/* Informations principales */}
                        <Stack spacing={1} sx={{ mb: 2 }}>
                          {/* Nom du client */}
                          {draft.customer?.name && (
                            <Box display="flex" alignItems="center" gap={1}>
                              <Business fontSize="small" color="action" />
                              <Typography variant="body2" sx={{ fontWeight: 500, color: '#2c3e50' }}>
                                {draft.customer.name}
                              </Typography>
                            </Box>
                          )}
                          
                          {/* Email utilisateur */}
                          <Box display="flex" alignItems="center" gap={1}>
                            <Person fontSize="small" color="action" />
                            <Typography variant="body2">
                              {draft.customer?.contactPerson?.email || 
                               (draft.customer?.emails && draft.customer.emails.length > 0 ? draft.customer.emails[0] : 'Email non défini')}
                            </Typography>
                          </Box>
                          
                          {/* Informations d'expédition */}
                          {draft.shipment && (
                            <Box display="flex" alignItems="center" gap={1}>
                              <Assignment fontSize="small" color="action" />
                              <Typography variant="body2">
                                {draft.shipment.origin?.location || 'N/A'} → {draft.shipment.destination?.location || 'N/A'}
                              </Typography>
                            </Box>
                          )}
                          
                          {/* Date de création */}
                          <Box display="flex" alignItems="center" gap={1}>
                            <Schedule fontSize="small" color="action" />
                            <Typography variant="body2">
                              {formatDate(draft.createdAt)}
                            </Typography>
                          </Box>
                        </Stack>


                        {/* Actions */}
                        <Stack direction="row" spacing={1}>
                          <Button
                              size="small"
                            variant="contained"
                              onClick={() => handleContinueDraft(draft)}
                            startIcon={<PlayArrow />}
                          >
                            Continuer
                          </Button>
                          <Tooltip title="Voir les détails">
                            <IconButton
                              size="small"
                              onClick={() => handleViewDraft(draft)}
                            >
                              <Visibility />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Gérer le devis">
                            <IconButton
                              size="small"
                              onClick={() => handleManageQuote(draft)}
                            >
                              <ManageIcon />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Assigner">
                            <IconButton
                              size="small"
                              onClick={() => handleAssignDraft(draft)}
                            >
                              <Person />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Supprimer">
                            <IconButton
                              size="small"
                              color="error"
                              onClick={() => handleDeleteDraft(draft)}
                            >
                              <Delete />
                            </IconButton>
                          </Tooltip>
                        </Stack>
                      </CardContent>
                      </Card>
                  </Fade>
                    </Grid>
                  ))}
                </Grid>
          ) : (
            // Vue en tableau (DataGrid)
            <Paper elevation={1} sx={{ borderRadius: 2 }}>
              <DataGrid
                rows={filteredDrafts}
                columns={[
                  {
                    field: 'draftQuoteId',
                    headerName: 'Numéro',
                    width: 120,
                    renderCell: (params: GridRenderCellParams) => (
                      <Typography variant="body2" fontWeight="medium">
                        #{params.value?.substring(0, 8) || 'N/A'}
                      </Typography>
                    )
                  },
                  {
                    field: 'customer',
                    headerName: 'Utilisateur',
                    width: 200,
                    renderCell: (params: GridRenderCellParams) => {
                      const customer = params.value;
                      const email = customer?.contactPerson?.email || 
                                  (customer?.emails && customer.emails.length > 0 ? customer.emails[0] : 'Non défini');
                      return (
                        <Box display="flex" alignItems="center" gap={1}>
                          <Avatar sx={{ width: 24, height: 24, fontSize: 12 }}>
                            {email?.charAt(0)?.toUpperCase() || 'U'}
                          </Avatar>
                          <Typography variant="body2">
                            {email}
                          </Typography>
                        </Box>
                      );
                    }
                  },
                  {
                    field: 'customer',
                    headerName: 'Client',
                    width: 200,
                    renderCell: (params: GridRenderCellParams) => {
                      const customer = params.value;
                      const clientName = customer?.name;
                      
                      return clientName ? (
                        <Box display="flex" alignItems="center" gap={1}>
                          <Business fontSize="small" color="action" />
                          <Typography variant="body2" sx={{ fontWeight: 500 }}>
                            {clientName}
                          </Typography>
                        </Box>
                      ) : (
                        <Typography variant="body2" color="text.secondary">
                          Non défini
                        </Typography>
                      );
                    }
                  },
                  {
                    field: 'status',
                    headerName: 'Statut',
                    width: 120,
                    renderCell: (params: GridRenderCellParams) => (
                          <Chip
                        label={params.value}
                        color="warning"
                        size="small"
                      />
                    )
                  },
                  {
                    field: 'assignedTo',
                    headerName: 'Assigné à',
                    width: 130,
                    renderCell: (params: GridRenderCellParams) => (
                      params.value ? (
                        <Chip 
                          label={params.value}
                            size="small"
                            color="primary"
                          />
                      ) : (
                          <Typography variant="body2" color="text.secondary">
                          Non assigné
                          </Typography>
                      )
                    )
                  },
                  {
                    field: 'createdAt',
                    headerName: 'Créé le',
                    width: 130,
                    renderCell: (params: GridRenderCellParams) => (
                            <Typography variant="body2">
                        {formatDate(params.value)}
                            </Typography>
                    )
                  },
                  {
                    field: 'actions',
                    headerName: 'Actions',
                    width: 200,
                    sortable: false,
                    renderCell: (params: GridRenderCellParams) => (
                      <Stack direction="row" spacing={0.5}>
                        <Tooltip title="Continuer">
                          <IconButton
                            size="small"
                            onClick={() => handleContinueDraft(params.row)}
                          >
                            <PlayArrow />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Voir">
                          <IconButton
                            size="small"
                            onClick={() => handleViewDraft(params.row)}
                          >
                            <Visibility />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Gérer le devis">
                          <IconButton
                            size="small"
                            onClick={() => handleManageQuote(params.row)}
                          >
                            <ManageIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Assigner">
                          <IconButton
                            size="small"
                            onClick={() => handleAssignDraft(params.row)}
                          >
                            <Person />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Supprimer">
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => handleDeleteDraft(params.row)}
                          >
                            <Delete />
                          </IconButton>
                        </Tooltip>
                      </Stack>
                    )
                  }
                ]}
                autoHeight
                disableRowSelectionOnClick
                pageSizeOptions={[10, 25, 50]}
                initialState={{
                  pagination: { paginationModel: { pageSize: 10 } }
                }}
                sx={{
                  border: 0,
                  '& .MuiDataGrid-cell': {
                    borderBottom: '1px solid #f0f0f0'
                  }
                }}
              />
          </Paper>
          )}
        </>
      )}

      {/* Dialog d'assignation */}
      <Dialog open={assignDialog} onClose={() => setAssignDialog(false)}>
        <DialogTitle>Assigner le brouillon</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Assigner à"
            fullWidth
            variant="outlined"
            value={assignTo}
            onChange={(e) => setAssignTo(e.target.value)}
            placeholder="Entrez l'email de l'utilisateur"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAssignDialog(false)}>Annuler</Button>
          <Button onClick={handleAssignSubmit} variant="contained">
            Assigner
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog de confirmation de suppression */}
      <Dialog open={deleteDialogOpen} onClose={handleCancelDelete}>
        <DialogTitle>Confirmer la suppression</DialogTitle>
        <DialogContent>
          <Typography>
            Êtes-vous sûr de vouloir supprimer ce brouillon ? Cette action est irréversible.
                </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancelDelete}>Annuler</Button>
          <Button onClick={handleConfirmDelete} color="error" variant="contained">
            Supprimer
          </Button>
        </DialogActions>
      </Dialog>



      {/* Snackbar pour les notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert 
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          variant="filled"
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default DraftQuotes; 
