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
  Stack,
  Avatar,
  Fade,
  Zoom
} from '@mui/material';
import {
  Send,
  Visibility,
  Email,
  AccessTime,
  Person,
  CheckCircle,
  TrendingUp,
  Refresh,
  Dashboard,
  Timeline,
  Euro,
  Business
} from '@mui/icons-material';
import { DataGrid, GridColDef, GridRenderCellParams } from '@mui/x-data-grid';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
// Imports commentés - endpoints supprimés de la nouvelle API
// import { 
//   getApiQuoteOfferStatusByStatus, 
//   putApiQuoteOfferByIdStatus
// } from '@features/offer/api';
// import { QuoteOfferStatus } from '@features/offer/api/types.gen';

// Type temporaire pour éviter les erreurs
const QuoteOfferStatus = {
  SENT_TO_CLIENT: 'SENT_TO_CLIENT'
};
import QuoteDisplay from '@features/offer/components/QuoteDisplay';

interface ApprovedQuote {
  id: string;
  requestQuoteId: number;
  quoteOfferNumber: string;
  emailUser: string;
  created: string;
  status: QuoteOfferStatus;
  comment?: string;
  internalComment?: string;
  options: any[];
  customer?: {
    contactName: string;
    email: string;
  };
}

const ApprovedQuotes: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  
  const [quotes, setQuotes] = useState<ApprovedQuote[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedQuote, setSelectedQuote] = useState<ApprovedQuote | null>(null);
  const [sendDialog, setSendDialog] = useState(false);
  const [emailMessage, setEmailMessage] = useState('');
  const [processing, setProcessing] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
    open: false,
    message: '',
    severity: 'success'
  });

  useEffect(() => {
    loadApprovedQuotes();
  }, []);

  const loadApprovedQuotes = async () => {
    try {
      setLoading(true);
      
      // Fonctionnalité désactivée - API non disponible dans la nouvelle version
      console.warn('ApprovedQuotes: API endpoints supprimés de la nouvelle version');
      setQuotes([]);
      
      /*
      const response = await getApiQuoteOfferStatusByStatus({
        path: {
          status: QuoteOfferStatus.APPROVED
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
      console.error('Erreur lors du chargement des devis approuvés:', error);
      showSnackbar('Erreur lors du chargement des devis approuvés', 'error');
      setQuotes([]);
    } finally {
      setLoading(false);
    }
  };

  const showSnackbar = (message: string, severity: 'success' | 'error') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleSendToClient = async () => {
    if (!selectedQuote) return;
    
    try {
      setProcessing(true);
      
      // Fonctionnalité désactivée - endpoint supprimé
      showSnackbar('Fonctionnalité d\'envoi temporairement indisponible', 'error');
      
      /*
      // Passer le devis en statut "Envoyé au client"
      await putApiQuoteOfferByIdStatus({
        path: { id: selectedQuote.id },
        query: { newStatus: QuoteOfferStatus.SENT_TO_CLIENT }
      });

      // TODO: Envoyer l'email au client avec le message personnalisé
      // await sendEmailToClient(selectedQuote.id, selectedQuote.customer?.email, emailMessage);

      showSnackbar('Devis envoyé au client avec succès', 'success');
      setSendDialog(false);
      setEmailMessage('');
      loadApprovedQuotes();
      */
    } catch (error) {
      console.error('ApprovedQuotes: Fonctionnalité désactivée:', error);
      showSnackbar('Fonctionnalité temporairement indisponible', 'error');
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
      case 'send':
        setSendDialog(true);
        break;
      case 'viewer':
        navigate(`/quote-viewer/${quoteId}`);
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
    const withEmail = quotesArray.filter(q => q.customer?.email).length;
    const withoutEmail = quotesArray.filter(q => !q.customer?.email).length;
    const totalValue = quotesArray.reduce((sum, q) => {
      const option = q.options?.[0];
      const total = option?.totals?.grandTotal || 0;
      return sum + total;
    }, 0);
    
    return {
      total,
      withEmail,
      withoutEmail,
      totalValue
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
          Chargement des devis approuvés...
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
                  Devis Approuvés
                </Typography>
                <Typography variant="h6" color="text.secondary">
                  {Array.isArray(quotes) ? quotes.length : 0} devis approuvés prêts à être envoyés au client
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
                  onClick={loadApprovedQuotes}
                >
                  Actualiser
                </Button>
              </Stack>
            </Box>

            {/* Statistiques modernes */}
            <Grid container spacing={3}>
              <Grid item xs={12} md={3}>
                <Card sx={{ 
                  p: 3, 
                  background: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
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
                        Devis approuvés
                      </Typography>
                    </Box>
                    <CheckCircle sx={{ fontSize: 60, opacity: 0.8 }} />
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
                        {stats.withEmail}
                      </Typography>
                      <Typography variant="body1">
                        Avec email client
                      </Typography>
                    </Box>
                    <Email sx={{ fontSize: 60, opacity: 0.8 }} />
                  </Box>
                </Card>
              </Grid>
              <Grid item xs={12} md={3}>
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
                        {stats.withoutEmail}
                      </Typography>
                      <Typography variant="body1">
                        Sans email client
                      </Typography>
                    </Box>
                    <AccessTime sx={{ fontSize: 60, opacity: 0.8 }} />
                  </Box>
                </Card>
              </Grid>
              <Grid item xs={12} md={3}>
                <Card sx={{ 
                  p: 3, 
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
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
                    headerName: 'Approuvé le',
                    width: 150,
                    valueFormatter: (params) => new Date(params.value).toLocaleDateString('fr-FR')
                  },
                  {
                    field: 'customer',
                    headerName: 'Client',
                    width: 200,
                    renderCell: (params: GridRenderCellParams) => (
                      <Box>
                        <Typography variant="body2" fontWeight="medium">
                          {params.row.customer?.contactName || 'N/A'}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {params.row.customer?.email || 'Email non disponible'}
                        </Typography>
                      </Box>
                    )
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
                        label="Approuvé"
                        color="success"
                        icon={<CheckCircle />}
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
                          onClick={() => handleQuoteAction('viewer', params.row.id)}
                          title="Voir le devis (nouveau)"
                          sx={{ bgcolor: 'success.light', '&:hover': { bgcolor: 'success.main' } }}
                        >
                          <Visibility />
                        </IconButton>
                        
                        <IconButton
                          size="small"
                          onClick={() => navigate(`/quote-offers/${params.row.id}`)}
                          title="Voir le devis (ancien)"
                          sx={{ bgcolor: 'primary.light', '&:hover': { bgcolor: 'primary.main' } }}
                        >
                          <Visibility />
                        </IconButton>
                        
                        <Button
                          size="small"
                          variant="contained"
                          color="primary"
                          startIcon={<Send />}
                          onClick={() => handleQuoteAction('send', params.row.id)}
                          disabled={processing || !params.row.customer?.email}
                        >
                          Envoyer au client
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

      {/* Dialog d'envoi au client */}
      <Dialog 
        open={sendDialog} 
        onClose={() => setSendDialog(false)} 
        maxWidth="md" 
        fullWidth
        PaperProps={{
          sx: { borderRadius: 3 }
        }}
      >
        <DialogTitle sx={{ bgcolor: 'primary.main', color: 'white' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Email />
            Envoyer le devis au client
          </Box>
        </DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          {selectedQuote && (
            <Box sx={{ mb: 3 }}>
              <Typography variant="h6" gutterBottom>
                Devis {selectedQuote.quoteOfferNumber}
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Client: {selectedQuote.customer?.contactName}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Email: {selectedQuote.customer?.email}
              </Typography>
            </Box>
          )}
          
          <Divider sx={{ my: 2 }} />
          
          <Typography variant="body1" sx={{ mb: 2 }}>
            Message personnalisé pour le client (optionnel):
          </Typography>
          <TextField
            fullWidth
            multiline
            rows={4}
            label="Message personnalisé"
            value={emailMessage}
            onChange={(e) => setEmailMessage(e.target.value)}
            placeholder="Ajoutez un message personnalisé pour accompagner l'envoi du devis..."
          />
          
          <Alert severity="info" sx={{ mt: 2 }}>
            Le devis sera envoyé avec un lien de consultation sécurisé.
          </Alert>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={() => setSendDialog(false)} disabled={processing}>
            Annuler
          </Button>
          <Button
            onClick={handleSendToClient}
            variant="contained"
            color="primary"
            disabled={processing}
            startIcon={processing ? <CircularProgress size={20} /> : <Send />}
          >
            Envoyer au client
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

export default ApprovedQuotes; 