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
  TextField,
  Alert,
  Snackbar,
  CircularProgress,
  Divider,
  Badge,
  Tabs,
  Tab,
  Stack,
  Avatar,
  LinearProgress,
  Fade,
  Zoom
} from '@mui/material';
import {
  CheckCircle,
  Cancel,
  Visibility,
  Send,
  Warning,
  AccessTime,
  Person,
  Assignment,
  TrendingUp,
  FilterList,
  Search,
  Refresh,
  Dashboard,
  Assessment,
  Timeline
} from '@mui/icons-material';
import { DataGrid, GridColDef, GridRenderCellParams } from '@mui/x-data-grid';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
// Imports commentés - fonctions supprimées de la nouvelle API
// import { 
//   getApiQuoteOfferStatusByStatus, 
//   putApiQuoteOfferByIdStatus,
//   putApiQuoteOfferByIdApproval 
// } from '@features/offer/api';
// import { QuoteOfferStatus, ClientApprovalStatus } from '@features/offer/api/types.gen';

// Types temporaires pour éviter les erreurs
const QuoteOfferStatus = {
  PENDING_APPROVAL: 'PENDING_APPROVAL',
  APPROVED: 'APPROVED'
};

const ClientApprovalStatus = {
  PENDING: 'PENDING'
};
import QuoteDisplay from '@features/offer/components/QuoteDisplay';

interface QuoteForApproval {
  id: string;
  requestQuoteId: number;
  quoteOfferNumber: string;
  emailUser: string;
  created: string;
  status: QuoteOfferStatus;
  clientApproval: ClientApprovalStatus;
  comment?: string;
  internalComment?: string;
  options: any[];
  clientNumber?: string;
  customer?: {
    contactName: string;
    email: string;
  };
}

const QuoteApproval: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  
  const [quotes, setQuotes] = useState<QuoteForApproval[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedQuote, setSelectedQuote] = useState<QuoteForApproval | null>(null);
  const [approvalDialog, setApprovalDialog] = useState(false);
  const [rejectionDialog, setRejectionDialog] = useState(false);
  const [approvalComment, setApprovalComment] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  const [processing, setProcessing] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedTab, setSelectedTab] = useState(0);
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' | 'warning' }>({
    open: false,
    message: '',
    severity: 'success'
  });

  useEffect(() => {
    loadPendingQuotes();
  }, []);

  const loadPendingQuotes = async () => {
    try {
      setLoading(true);
      // Fonctionnalité désactivée - API non disponible dans la nouvelle version
      console.warn('QuoteApproval: API endpoints supprimés de la nouvelle version');
      setQuotes([]);
      /*
      const response = await getApiQuoteOfferStatusByStatus({
        path: {
          status: QuoteOfferStatus.PENDING_APPROVAL
        }
      });
      
      if (response?.data?.data) {
        // S'assurer que la réponse est un tableau
        const quotesData = Array.isArray(response.data.data) ? response.data.data : [];
        setQuotes(quotesData);
      } else {
        setQuotes([]);
      }
      */
    } catch (error) {
      console.error('QuoteApproval: Composant désactivé - API non disponible:', error);
      showSnackbar('Fonctionnalité temporairement indisponible', 'warning');
      setQuotes([]);
    } finally {
      setLoading(false);
    }
  };

  const showSnackbar = (message: string, severity: 'success' | 'error' | 'warning') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleApprove = async () => {
    if (!selectedQuote) return;
    
    try {
      setProcessing(true);
      
      // Fonctionnalité désactivée - endpoints supprimés
      showSnackbar('Fonctionnalité d\'approbation temporairement indisponible', 'warning');
      
      /*
      // Code commenté - endpoints supprimés de l'API
      await putApiQuoteOfferByIdStatus({
        path: { id: selectedQuote.id },
        query: { newStatus: QuoteOfferStatus.APPROVED }
      });

      if (approvalComment.trim()) {
        await putApiQuoteOfferByIdApproval({
          path: { id: selectedQuote.id },
          query: {
            NewStatus: ClientApprovalStatus.PENDING,
            Comment: `Approuvé par superviseur: ${approvalComment}`
          }
        });
      }

      showSnackbar('Devis approuvé avec succès', 'success');
      setApprovalDialog(false);
      setApprovalComment('');
      loadPendingQuotes();
      */
    } catch (error) {
      console.error('QuoteApproval handleApprove: Fonctionnalité désactivée:', error);
      showSnackbar('Fonctionnalité temporairement indisponible', 'warning');
    } finally {
      setProcessing(false);
    }
  };

  const handleReject = async () => {
    if (!selectedQuote) return;
    
    try {
      setProcessing(true);
      
      // Fonctionnalité désactivée - endpoints supprimés
      showSnackbar('Fonctionnalité de rejet temporairement indisponible', 'warning');
      
      /*
      // Code commenté - endpoints supprimés de l'API
      await putApiQuoteOfferByIdStatus({
        path: { id: selectedQuote.id },
        query: { newStatus: QuoteOfferStatus.DRAFT }
      });

      if (rejectionReason.trim()) {
        await putApiQuoteOfferByIdApproval({
          path: { id: selectedQuote.id },
          query: {
            NewStatus: ClientApprovalStatus.REJECTED,
            Comment: `Rejeté par superviseur: ${rejectionReason}`
          }
        });
      }

      showSnackbar('Devis rejeté', 'success');
      setRejectionDialog(false);
      setRejectionReason('');
      loadPendingQuotes();
      */
    } catch (error) {
      console.error('QuoteApproval handleReject: Fonctionnalité désactivée:', error);
      showSnackbar('Fonctionnalité temporairement indisponible', 'warning');
    } finally {
      setProcessing(false);
    }
  };

  const handleQuoteAction = (action: string, quoteId: string) => {
    const quotesArray = Array.isArray(quotes) ? quotes : [];
    const quote = quotesArray.find(q => q.id === quoteId);
    if (!quote) return;

    setSelectedQuote(quote);

    switch (action) {
      case 'approve':
        setApprovalDialog(true);
        break;
      case 'reject':
        setRejectionDialog(true);
        break;
      case 'edit':
      case 'edit-direct':
      case 'view':
        // Toutes les actions pointent vers l'édition directe unifiée
        navigate(`/quote-offers/${quoteId}`);
        break;
    }
  };

  const getStatistics = () => {
    // S'assurer que quotes est un tableau
    const quotesArray = Array.isArray(quotes) ? quotes : [];
    const total = quotesArray.length;
    const today = new Date().toDateString();
    const todayQuotes = quotesArray.filter(q => new Date(q.created).toDateString() === today);
    
    return {
      total,
      today: todayQuotes.length,
      averageValue: quotesArray.reduce((sum, q) => {
        const option = q.options?.[0];
        const total = option?.totals?.grandTotal || 0;
        return sum + total;
      }, 0) / Math.max(total, 1)
    };
  };

  const stats = getStatistics();

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
          Chargement des devis en attente...
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
                  Validation des Devis
                </Typography>
                <Typography variant="h6" color="text.secondary">
                  {Array.isArray(quotes) ? quotes.length : 0} devis en attente de validation
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
                  onClick={loadPendingQuotes}
                >
                  Actualiser
                </Button>
              </Stack>
            </Box>

            {/* Statistiques modernes */}
            <Grid container spacing={3}>
              <Grid item xs={12} md={4}>
                <Card sx={{ 
                  p: 3, 
                  background: 'linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)',
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
                        En attente de validation
                      </Typography>
                    </Box>
                    <Assignment sx={{ fontSize: 60, opacity: 0.8 }} />
                  </Box>
                </Card>
              </Grid>
              <Grid item xs={12} md={4}>
                <Card sx={{ 
                  p: 3, 
                  background: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
                  color: 'white',
                  borderRadius: 3,
                  animation: 'fadeInUp 0.8s ease-out'
                }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Box>
                      <Typography variant="h3" fontWeight="bold">
                        {stats.today}
                      </Typography>
                      <Typography variant="body1">
                        Nouveaux aujourd'hui
                      </Typography>
                    </Box>
                    <TrendingUp sx={{ fontSize: 60, opacity: 0.8 }} />
                  </Box>
                </Card>
              </Grid>
              <Grid item xs={12} md={4}>
                <Card sx={{ 
                  p: 3, 
                  background: 'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)',
                  color: 'white',
                  borderRadius: 3,
                  animation: 'fadeInUp 1.0s ease-out'
                }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Box>
                      <Typography variant="h3" fontWeight="bold">
                        € {stats.averageValue.toLocaleString()}
                      </Typography>
                      <Typography variant="body1">
                        Valeur moyenne
                      </Typography>
                    </Box>
                    <Assessment sx={{ fontSize: 60, opacity: 0.8 }} />
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
              {Array.isArray(quotes) ? quotes.map((quote, index) => (
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
                rows={Array.isArray(quotes) ? quotes : []}
                columns={[
                  {
                    field: 'quoteOfferNumber',
                    headerName: 'N° Devis',
                    width: 150,
                    renderCell: (params: GridRenderCellParams) => (
                      <Typography variant="body2" fontWeight="bold" color="primary">
                        {params.value || `DRAFT-${params.row.id.slice(-6)}`}
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
                        onClick={() => navigate(`/handle-request/${params.value}`)}
                        sx={{ textTransform: 'none' }}
                      >
                        {params.value}
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
                          <Person fontSize="small" />
                        </Avatar>
                        <Typography variant="body2">{params.value}</Typography>
                      </Box>
                    )
                  },
                  {
                    field: 'created',
                    headerName: 'Créé le',
                    width: 150,
                    valueFormatter: (params) => new Date(params.value).toLocaleDateString('fr-FR')
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
                        label="En attente"
                        color="warning"
                        icon={<AccessTime />}
                        size="small"
                      />
                    )
                  },
                  {
                    field: 'actions',
                    headerName: 'Actions',
                    width: 300,
                    renderCell: (params: GridRenderCellParams) => (
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <IconButton
                          size="small"
                          onClick={() => navigate(`/quote-offers/${params.row.id}`)}
                          title="Voir le devis"
                          sx={{ bgcolor: 'primary.light', '&:hover': { bgcolor: 'primary.main' } }}
                        >
                          <Visibility />
                        </IconButton>
                        
                        <Button
                          size="small"
                          variant="contained"
                          color="success"
                          startIcon={<CheckCircle />}
                          onClick={() => handleQuoteAction('approve', params.row.id)}
                          disabled={processing}
                        >
                          Approuver
                        </Button>
                        
                        <Button
                          size="small"
                          variant="outlined"
                          color="error"
                          startIcon={<Cancel />}
                          onClick={() => handleQuoteAction('reject', params.row.id)}
                          disabled={processing}
                        >
                          Rejeter
                        </Button>
                      </Box>
                    )
                  }
                ]}
                pageSize={10}
                rowsPerPageOptions={[10, 25, 50]}
                disableSelectionOnClick
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
      </Box>

      {/* Dialog d'approbation */}
      <Dialog 
        open={approvalDialog} 
        onClose={() => setApprovalDialog(false)} 
        maxWidth="sm" 
        fullWidth
        PaperProps={{
          sx: { borderRadius: 3 }
        }}
      >
        <DialogTitle sx={{ bgcolor: 'success.light', color: 'white' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <CheckCircle />
            Approuver le devis
          </Box>
        </DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          <Typography variant="body1" sx={{ mb: 2 }}>
            Êtes-vous sûr de vouloir approuver ce devis ?
          </Typography>
          <TextField
            fullWidth
            multiline
            rows={3}
            label="Commentaire d'approbation (optionnel)"
            value={approvalComment}
            onChange={(e) => setApprovalComment(e.target.value)}
            placeholder="Ajoutez un commentaire pour l'équipe..."
          />
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={() => setApprovalDialog(false)} disabled={processing}>
            Annuler
          </Button>
          <Button
            onClick={handleApprove}
            variant="contained"
            color="success"
            disabled={processing}
            startIcon={processing ? <CircularProgress size={20} /> : <CheckCircle />}
          >
            Approuver
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog de rejet */}
      <Dialog 
        open={rejectionDialog} 
        onClose={() => setRejectionDialog(false)} 
        maxWidth="sm" 
        fullWidth
        PaperProps={{
          sx: { borderRadius: 3 }
        }}
      >
        <DialogTitle sx={{ bgcolor: 'error.light', color: 'white' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Cancel />
            Rejeter le devis
          </Box>
        </DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          <Typography variant="body1" sx={{ mb: 2 }}>
            Êtes-vous sûr de vouloir rejeter ce devis ?
          </Typography>
          <TextField
            fullWidth
            multiline
            rows={3}
            label="Raison du rejet *"
            value={rejectionReason}
            onChange={(e) => setRejectionReason(e.target.value)}
            placeholder="Expliquez pourquoi ce devis est rejeté..."
            required
          />
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={() => setRejectionDialog(false)} disabled={processing}>
            Annuler
          </Button>
          <Button
            onClick={handleReject}
            variant="contained"
            color="error"
            disabled={processing || !rejectionReason.trim()}
            startIcon={processing ? <CircularProgress size={20} /> : <Cancel />}
          >
            Rejeter
          </Button>
        </DialogActions>
      </Dialog>

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

export default QuoteApproval; 