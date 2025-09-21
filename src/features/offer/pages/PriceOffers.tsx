import React, { useEffect, useState } from 'react';
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
  Divider,
  Stack,
  Avatar,
  Fade,
  Zoom,
  TextField,
  InputAdornment
} from '@mui/material';
import {
  Delete,
  Edit,
  Visibility,
  Refresh,
  Dashboard,
  Timeline,
  Search,
  FilterList,
  TrendingUp,
  Assessment,
  Euro,
  Business,
  Warning,
  CheckCircle,
  Schedule,
  Info
} from '@mui/icons-material';
import { DataGrid, GridColDef, GridRenderCellParams } from '@mui/x-data-grid';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { statusLabel, colorsTypes } from '@utils/functions';
import { getApiDraftQuotes } from '@features/offer/api';
import QuoteDisplay from '@features/offer/components/QuoteDisplay';
import QuoteActionButtons from '@features/offer/components/QuoteActionButtons';
// import { QuoteOfferStatus } from '@features/offer/api/types.gen';

const PriceOffers: React.FC = () => {
  // const { t } = useTranslation(); // Commenté car non utilisé
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [quotes, setQuotes] = useState<any[]>([]);
  // Variables de suppression supprimées - pas de suppression pour les devis finalisés
  // const [deleteDialog, setDeleteDialog] = useState(false);
  // const [selectedQuoteId, setSelectedQuoteId] = useState<string>("");
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
    open: false,
    message: '',
    severity: 'success'
  });

  useEffect(() => {
    loadQuotes();
  }, []);

  const loadQuotes = async () => {
    try {
      setLoading(true);
      // TODO: Remplacer par l'endpoint de recherche une fois créé dans le backend
      const response: any = await getApiDraftQuotes({
        query: {
          pageNumber: 1,
          pageSize: 100
        }
      });
      if (response?.data) {
        const quotes = response.data.items || response.data.data || response.data || [];
        console.log('[PriceOffers] Données reçues:', quotes);
        
        // S'assurer que quotes est un tableau
        if (Array.isArray(quotes)) {
          // S'assurer que chaque devis a un ID cohérent
          const quotesWithId = quotes.map((quote: any) => ({
            ...quote,
            id: quote.id || quote.quoteOfferNumber || `quote-${Date.now()}` // Fallback si pas d'ID
          }));
          setQuotes(quotesWithId.reverse());
        } else {
          console.warn('[PriceOffers] Les données reçues ne sont pas un tableau:', quotes);
          setQuotes([]);
        }
      }
    } catch (error) {
      console.error('Erreur lors du chargement des devis:', error);
      showSnackbar('Erreur lors du chargement des devis', 'error');
    } finally {
      setLoading(false);
    }
  };

  const showSnackbar = (message: string, severity: 'success' | 'error') => {
    setSnackbar({ open: true, message, severity });
  };

  // Les devis finalisés ne peuvent pas être supprimés
  // const handleDeleteQuote = async () => {
  //   // Fonctionnalité désactivée : on ne peut pas supprimer des devis finalisés
  // };

  const handleQuoteAction = (action: string, quoteId: string) => {
    console.log('[PriceOffers] Action:', action, 'QuoteId:', quoteId);
    
    switch (action) {
      case 'edit':
      case 'edit-direct':
      case 'view':
        // Toutes les actions pointent vers l'édition directe unifiée
        navigate(`/quote-offers/${quoteId}`);
        break;
      case 'viewer':
        console.log('[PriceOffers] Navigation vers QuoteViewer avec ID:', quoteId);
        navigate(`/quote-viewer/${quoteId}`);
        break;
      case 'delete':
        // Suppression désactivée pour les devis finalisés
        showSnackbar('Les devis finalisés ne peuvent pas être supprimés', 'error');
        break;
    }
  };

  const getFilteredQuotes = () => {
    // S'assurer que quotes est un tableau
    const quotesArray = Array.isArray(quotes) ? quotes : [];
    let filtered = quotesArray;

    // Exclure les devis en cours (DRAFT et PENDING_APPROVAL)
    filtered = filtered.filter(quote => 
      quote.status !== 'DRAFT' && quote.status !== 'PENDING_APPROVAL'
    );

    // Filtre par recherche
    if (searchTerm) {
      filtered = filtered.filter(quote => 
        quote.quoteOfferNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        quote.emailUser?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        quote.customer?.contactName?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filtre par statut
    if (statusFilter !== 'all') {
      filtered = filtered.filter(quote => quote.status === statusFilter);
    }

    return filtered;
  };

  const getStatistics = () => {
    // Utiliser les devis filtrés (sans les devis en cours)
    const filteredQuotesArray = getFilteredQuotes();
    const total = filteredQuotesArray.length;
    const byStatus = {
      draft: filteredQuotesArray.filter(q => q.status === 'DRAFT').length,
      pendingApproval: filteredQuotesArray.filter(q => q.status === 'PENDING_APPROVAL').length,
      approved: filteredQuotesArray.filter(q => q.status === 'APPROVED').length,
      sentToClient: filteredQuotesArray.filter(q => q.status === 'SENT_TO_CLIENT').length
    };
    
    const totalValue = filteredQuotesArray.reduce((sum, q) => {
      const option = q.options?.[0];
      const total = option?.totals?.grandTotal || 0;
      return sum + total;
    }, 0);

    return { total, byStatus, totalValue };
  };

  const stats = getStatistics();
  const filteredQuotes = getFilteredQuotes();

  if (loading) {
    return (
      <Box sx={{ 
        display: 'flex', 
        flexDirection: 'column',
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '50vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white'
      }}>
        <CircularProgress size={60} sx={{ color: 'white', mb: 2 }} />
        <Typography variant="h6" sx={{ color: 'white' }}>
          Chargement des devis...
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ 
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      py: 3,
      '@keyframes fadeInUp': {
        '0%': {
          opacity: 0,
          transform: 'translateY(30px)'
        },
        '100%': {
          opacity: 1,
          transform: 'translateY(0)'
        }
      }
    }}>
      {/* Header moderne */}
      <Box sx={{ px: 3, mb: 4 }}>
        <Fade in timeout={800}>
          <Paper sx={{ 
            p: 4, 
            background: 'rgba(255,255,255,0.95)', 
            backdropFilter: 'blur(10px)',
            borderRadius: 4,
            boxShadow: '0 8px 32px rgba(0,0,0,0.1)'
          }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Box>
                <Typography variant="h3" fontWeight="bold" color="primary" gutterBottom>
                  Tous les Devis
                </Typography>
                <Typography variant="h6" color="text.secondary">
                  {filteredQuotes.length} devis finalisés
                </Typography>
              </Box>
              <Stack direction="row" spacing={2}>
                <Button
                  variant={viewMode === 'grid' ? 'contained' : 'outlined'}
                  startIcon={<Dashboard />}
                  onClick={() => setViewMode('grid')}
                >
                  Grille
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'contained' : 'outlined'}
                  startIcon={<Timeline />}
                  onClick={() => setViewMode('list')}
                >
                  Liste
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<Refresh />}
                  onClick={loadQuotes}
                >
                  Actualiser
                </Button>
              </Stack>
            </Box>

            {/* Filtres et recherche */}
            <Box sx={{ mb: 3 }}>
              <Grid container spacing={2} alignItems="center">
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    placeholder="Rechercher par numéro, utilisateur ou client..."
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
                <Grid item xs={12} md={3}>
                  <TextField
                    fullWidth
                    select
                    label="Filtrer par statut"
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                  >
                    <option value="all">Tous les statuts</option>
                    <option value="APPROVED">Approuvé</option>
                    <option value="SENT_TO_CLIENT">Envoyé au client</option>
                    <option value="ACCEPTED">Accepté</option>
                    <option value="REJECTED">Rejeté</option>
                    <option value="NO_RESPONSE">Pas de réponse</option>
                    <option value="EXHALE">Expiré</option>
                  </TextField>
                </Grid>
                <Grid item xs={12} md={3}>
                  <Typography variant="body2" color="text.secondary">
                    {filteredQuotes.length} résultat(s) trouvé(s)
                  </Typography>
                </Grid>
              </Grid>
            </Box>

                         {/* Statistiques modernes */}
             <Grid container spacing={3}>
               <Grid item xs={12} md={3}>
                 <Card sx={{ 
                   p: 3, 
                   background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                   color: 'white',
                   borderRadius: 3,
                   animation: 'fadeInUp 0.6s ease-out'
                 }}>
                   <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                     <Box>
                       <Typography variant="h3" fontWeight="bold">
                         {stats.total}
                       </Typography>
                       <Typography variant="body1">
                         Total des devis
                       </Typography>
                     </Box>
                     <Assessment sx={{ fontSize: 60, opacity: 0.8 }} />
                   </Box>
                 </Card>
               </Grid>
               <Grid item xs={12} md={3}>
                 <Card sx={{ 
                   p: 3, 
                   background: 'linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)',
                   color: 'white',
                   borderRadius: 3,
                   animation: 'fadeInUp 0.8s ease-out'
                 }}>
                   <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                     <Box>
                       <Typography variant="h3" fontWeight="bold">
                         {stats.byStatus.pendingApproval}
                       </Typography>
                       <Typography variant="body1">
                         En attente
                       </Typography>
                     </Box>
                     <Schedule sx={{ fontSize: 60, opacity: 0.8 }} />
                   </Box>
                 </Card>
               </Grid>
               <Grid item xs={12} md={3}>
                 <Card sx={{ 
                   p: 3, 
                   background: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
                   color: 'white',
                   borderRadius: 3,
                   animation: 'fadeInUp 1.0s ease-out'
                 }}>
                   <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                     <Box>
                       <Typography variant="h3" fontWeight="bold">
                         {stats.byStatus.approved}
                       </Typography>
                       <Typography variant="body1">
                         Approuvés
                       </Typography>
                     </Box>
                     <CheckCircle sx={{ fontSize: 60, opacity: 0.8 }} />
                   </Box>
                 </Card>
               </Grid>
               <Grid item xs={12} md={3}>
                 <Card sx={{ 
                   p: 3, 
                   background: 'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)',
                   color: 'white',
                   borderRadius: 3,
                   animation: 'fadeInUp 1.2s ease-out'
                 }}>
                   <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                     <Box>
                       <Typography variant="h3" fontWeight="bold">
                         € {stats.totalValue.toLocaleString()}
                       </Typography>
                       <Typography variant="body1">
                         Valeur totale
                       </Typography>
                     </Box>
                     <Euro sx={{ fontSize: 60, opacity: 0.8 }} />
                   </Box>
                 </Card>
               </Grid>
             </Grid>
          </Paper>
        </Fade>
      </Box>

      {/* Contenu principal */}
      <Box sx={{ px: 3 }}>
                 {viewMode === 'grid' ? (
           <Fade in timeout={600}>
             <Grid container spacing={3}>
               {Array.isArray(filteredQuotes) ? filteredQuotes.map((quote, index) => (
                 <Grid item xs={12} md={6} lg={4} key={quote.id}>
                   <Box sx={{ animation: `fadeInUp ${0.8 + index * 0.1}s ease-out` }}>
                     <QuoteDisplay
                       quote={quote}
                       showActions={true}
                       onAction={handleQuoteAction}
                       compact={true}
                     />
                                     </Box>
                </Grid>
              )) : null}
             </Grid>
           </Fade>
        ) : (
          <Fade in timeout={600}>
            <Paper sx={{ 
              background: 'rgba(255,255,255,0.95)', 
              backdropFilter: 'blur(10px)',
              borderRadius: 4,
              overflow: 'hidden'
            }}>
              <DataGrid
                rows={Array.isArray(filteredQuotes) ? filteredQuotes : []}
                columns={[
                  {
                    field: 'quoteOfferNumber',
                    headerName: 'N° Devis',
                    width: 150,
                    renderCell: (params: GridRenderCellParams) => (
                      <Typography variant="body2" fontWeight="bold" color="primary">
                        {params?.value || `DRAFT-${params?.row?.id?.slice(-6) || '000000'}`}
                      </Typography>
                    )
                  },
                  {
                    field: 'requestQuoteId',
                    headerName: 'N° Demande',
                    width: 120,
                    renderCell: (params: GridRenderCellParams) => (
                      <Button
                        size="small"
                        onClick={() => navigate(`/handle-request/${params?.value || ''}`)}
                        sx={{ textTransform: 'none' }}
                      >
                        {params?.value || ''}
                      </Button>
                    )
                  },
                  {
                    field: 'emailUser',
                    headerName: 'Créé par',
                    width: 180,
                    renderCell: (params: GridRenderCellParams) => (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Avatar sx={{ width: 24, height: 24, bgcolor: 'primary.main' }}>
                          <Business fontSize="small" />
                        </Avatar>
                        <Typography variant="body2">{params?.value || ''}</Typography>
                      </Box>
                    )
                  },
                                     {
                     field: 'created',
                     headerName: 'Créé le',
                     width: 150,
                     valueFormatter: (params: any) => {
                       if (!params || !params.value) return '';
                       try {
                         return new Date(params.value).toLocaleDateString('fr-FR');
                       } catch (error) {
                         return '';
                       }
                     }
                   },
                  {
                    field: 'route',
                    headerName: 'Trajet',
                    width: 200,
                    renderCell: (params: GridRenderCellParams) => {
                      const option = params.row.options?.[0];
                      if (!option) return 'N/A';
                      
                      const from = option.selectedHaulage?.loadingCityName || option.selectedHaulage?.pickupAddress?.city || option.portDeparture?.portName || 'Départ';
                      const to = option.selectedSeafreights?.[0]?.destinationPortName || option.selectedSeafreights?.[0]?.destinationPort?.portName || option.portDestination?.portName || 'Arrivée';
                      
                      return (
                        <Typography variant="body2">
                          {from} → {to}
                        </Typography>
                      );
                    }
                  },
                  {
                    field: 'status',
                    headerName: 'Statut',
                    width: 150,
                    renderCell: (params: GridRenderCellParams) => (
                      <Chip
                        label={statusLabel(params?.value || '')}
                        color={colorsTypes(params?.value || '') as any}
                        size="small"
                      />
                    )
                  },
                  {
                    field: 'clientApproval',
                    headerName: 'Validation Client',
                    width: 150,
                    renderCell: (params: GridRenderCellParams) => {
                      if (params?.row?.status !== "Accepted" && params?.value === "Pending") {
                        return <Chip label="Pas d'email" color="warning" size="small" />;
                      }
                      return (
                        <Chip
                          label={params?.value || ''}
                          color={colorsTypes(params?.value || '') as any}
                          size="small"
                        />
                      );
                    }
                  },
                  {
                    field: 'actions',
                    headerName: 'Actions',
                    width: 300,
                    renderCell: (params: GridRenderCellParams) => {
                      const quoteId = params?.row?.id;
                      const status = params?.row?.status;
                      
                      return (
                        <QuoteActionButtons
                          quoteId={quoteId || ''}
                          status={status}
                          onAction={handleQuoteAction}
                          variant="icons"
                          size="small"
                          showView={true}
                          showEdit={true}
                          showDirectEdit={true}
                          showDelete={false}
                        />
                      );
                    }
                  }
                ]}
                                 initialState={{
                   pagination: {
                     paginationModel: { page: 0, pageSize: 10 },
                   },
                 }}
                 pageSizeOptions={[10, 25, 50]}
                 disableRowSelectionOnClick
                loading={loading}
                getRowId={(row) => row.id}
                sx={{
                  '& .MuiDataGrid-cell': {
                    borderBottom: '1px solid #e0e0e0',
                  },
                  '& .MuiDataGrid-columnHeaders': {
                    backgroundColor: 'primary.main',
                    color: 'white',
                    fontWeight: 'bold',
                  },
                }}
              />
            </Paper>
          </Fade>
        )}

        {filteredQuotes.length === 0 && !loading && (
          <Fade in timeout={600}>
            <Paper sx={{ 
              p: 4, 
              textAlign: 'center',
              background: 'rgba(255,255,255,0.95)', 
              backdropFilter: 'blur(10px)',
              borderRadius: 4
            }}>
              <Warning sx={{ fontSize: 60, color: 'warning.main', mb: 2 }} />
              <Typography variant="h6" color="text.secondary" gutterBottom>
                Aucun devis trouvé
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {searchTerm || statusFilter !== 'all' 
                  ? 'Essayez de modifier vos critères de recherche' 
                  : 'Aucun devis n\'a été créé pour le moment'}
              </Typography>
            </Paper>
          </Fade>
        )}
      </Box>

      {/* Dialog de suppression supprimé - les devis finalisés ne peuvent pas être supprimés */}

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert 
          severity={snackbar.severity} 
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          sx={{ borderRadius: 2 }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default PriceOffers;
