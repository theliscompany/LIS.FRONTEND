import React, { useState } from 'react';
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
  Alert,
  Snackbar,
  CircularProgress,
  Divider,
  Zoom,
  TextField,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  ToggleButton,
  ToggleButtonGroup,
  Tooltip
} from '@mui/material';
import {
  Edit,
  Visibility,
  Refresh,
  Search,
  Assessment,
  CheckCircle,
  Schedule,
  GridView,
  ViewList
} from '@mui/icons-material';
import { DataGrid, GridColDef, GridRenderCellParams } from '@mui/x-data-grid';
import { useNavigate } from 'react-router-dom';
import { statusLabel, colorsTypes } from '@utils/functions';
import { useQuotes } from '../services/draftQuoteService';
import type { QuoteResponse } from '../api/types.gen';
import QuoteEditor from '../components/QuoteEditor';

const AllQuotes: React.FC = () => {
  const navigate = useNavigate();
  
  // États locaux
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });
  
  // États pour l'éditeur de devis
  const [editorOpen, setEditorOpen] = useState(false);
  const [selectedQuote, setSelectedQuote] = useState<QuoteResponse | null>(null);

  // Récupération des devis finaux
  const { data: quotesData, isLoading, error, refetch } = useQuotes({
    page,
    pageSize,
    status: statusFilter === 'all' ? undefined : statusFilter,
    customerName: searchTerm || undefined,
  });

  const quotes = quotesData?.data?.items || [];
  const totalCount = quotesData?.data?.totalCount || 0;

  // Fonctions pour l'éditeur de devis
  const handleEditQuote = (quote: QuoteResponse) => {
    setSelectedQuote(quote);
    setEditorOpen(true);
  };

  const handleCloseEditor = () => {
    setEditorOpen(false);
    setSelectedQuote(null);
  };

  const handleSaveQuote = async (updatedQuote: QuoteResponse) => {
    try {
      // Ici, vous pouvez appeler l'API pour sauvegarder les modifications
      console.log('Sauvegarde du devis:', updatedQuote);
      setSnackbar({
        open: true,
        message: 'Devis sauvegardé avec succès',
        severity: 'success'
      });
      // Rafraîchir la liste
      refetch();
    } catch (error) {
      setSnackbar({
        open: true,
        message: 'Erreur lors de la sauvegarde',
        severity: 'error'
      });
    }
  };

  const handleSendQuote = async (updatedQuote: QuoteResponse) => {
    try {
      // Ici, vous pouvez appeler l'API pour envoyer le devis
      console.log('Envoi du devis:', updatedQuote);
      setSnackbar({
        open: true,
        message: 'Devis envoyé au client avec succès',
        severity: 'success'
      });
      // Rafraîchir la liste
      refetch();
    } catch (error) {
      setSnackbar({
        open: true,
        message: 'Erreur lors de l\'envoi',
        severity: 'error'
      });
    }
  };

  // Gestion des erreurs
  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          Erreur lors du chargement des devis: {error.message}
        </Alert>
        <Button variant="contained" onClick={() => refetch()}>
          Réessayer
        </Button>
      </Box>
    );
  }

  // Calcul des statistiques
  const stats = {
    total: totalCount,
    sentToClient: quotes.filter(q => q.status === 'sentToClient' || q.status === 'SentToClient').length,
    pending: quotes.filter(q => q.status === 'pending').length,
    approved: quotes.filter(q => q.status === 'approved').length,
    totalOptions: quotes.reduce((sum, q) => {
      if (q.selectedOption) {
        return sum + 1; // Une option sélectionnée
      }
      if (q.availableOptions && q.availableOptions.length > 0) {
        return sum + q.availableOptions.length; // Nombre d'options disponibles
      }
      return sum;
    }, 0)
  };

  // Colonnes pour la vue liste
  const columns: GridColDef[] = [
    {
      field: 'quoteNumber',
      headerName: 'Numéro',
      width: 150,
      renderCell: (params: GridRenderCellParams) => (
        <Typography variant="body2" fontWeight="medium">
          {params.value}
        </Typography>
      ),
    },
    {
      field: 'status',
      headerName: 'Statut',
      width: 120,
      renderCell: (params: GridRenderCellParams) => (
        <Chip
          label={statusLabel(params.value)}
          size="small"
          color={colorsTypes(params.value) as any}
          sx={{ fontWeight: 500 }}
        />
      ),
    },
    {
      field: 'customer',
      headerName: 'Client',
      width: 200,
      renderCell: (params: GridRenderCellParams) => (
        <Box>
          <Typography variant="body2" fontWeight="medium">
            {params.value?.name || 'N/A'}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {params.value?.emails?.[0] || ''}
          </Typography>
        </Box>
      ),
    },
    {
      field: 'shipment',
      headerName: 'Route',
      width: 200,
      renderCell: (params: GridRenderCellParams) => (
        <Typography variant="body2">
          {params.value?.origin?.location} → {params.value?.destination?.location}
        </Typography>
      ),
    },
    {
      field: 'availableOptions',
      headerName: 'Options',
      width: 200,
      renderCell: (params: GridRenderCellParams) => {
        const quote = params.row;
        
        if (quote.selectedOption) {
          return (
            <Typography variant="body2" fontWeight="600" color="success.main">
              ✓ {quote.selectedOption.label || 'Sélectionnée'}: € {quote.selectedOption.totals?.grandTotal?.toLocaleString() || '0'}
            </Typography>
          );
        }
        
        if (quote.availableOptions && quote.availableOptions.length > 0) {
          return (
            <Box>
              <Typography variant="body2" fontWeight="medium" color="primary" gutterBottom>
                {quote.availableOptions.length} option{quote.availableOptions.length > 1 ? 's' : ''}
              </Typography>
              {quote.availableOptions.slice(0, 2).map((option: any, index: number) => (
                <Typography key={index} variant="caption" display="block" color="text.secondary">
                  • {option.label || `Option ${index + 1}`}: € {option.totals?.grandTotal?.toLocaleString() || '0'}
                </Typography>
              ))}
              {quote.availableOptions.length > 2 && (
                <Typography variant="caption" color="text.secondary">
                  ... et {quote.availableOptions.length - 2} autre{quote.availableOptions.length - 2 > 1 ? 's' : ''}
                </Typography>
              )}
            </Box>
          );
        }
        
        return (
          <Typography variant="body2" color="text.secondary">
            Aucune option
          </Typography>
        );
      },
    },
    {
      field: 'createdAt',
      headerName: 'Créé le',
      width: 120,
      renderCell: (params: GridRenderCellParams) => (
        <Typography variant="body2">
          {new Date(params.value).toLocaleDateString('fr-FR')}
        </Typography>
      ),
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 120,
      sortable: false,
      renderCell: (params: GridRenderCellParams) => (
        <Box>
          <Tooltip title="Voir les détails">
            <IconButton
              size="small"
              onClick={() => navigate(`/quotes/${params.row.quoteId}`)}
              sx={{ mr: 1 }}
            >
              <Visibility fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Éditer le devis">
            <IconButton
              size="small"
              onClick={() => handleEditQuote(params.row)}
            >
              <Edit fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      ),
    },
  ];

  // Composant de carte pour la vue grille
  const QuoteCard: React.FC<{ quote: QuoteResponse }> = ({ quote }) => (
    <Zoom in={true} timeout={300}>
      <Card
        sx={{
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          transition: 'all 0.3s ease-in-out',
          '&:hover': {
            transform: 'translateY(-4px)',
            boxShadow: '0 8px 25px rgba(0,0,0,0.15)',
          },
        }}
      >
        <CardContent sx={{ flexGrow: 1, p: 2.5 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
            <Typography variant="h6" fontWeight="600" color="primary">
              {quote.quoteNumber}
            </Typography>
            <Chip
              label={statusLabel(quote.status || '')}
              size="small"
              color={colorsTypes(quote.status || '') as any}
              sx={{ fontWeight: 500 }}
            />
          </Box>

          <Box sx={{ mb: 2 }}>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Client
            </Typography>
            <Typography variant="body1" fontWeight="medium">
              {quote.customer?.name || 'N/A'}
            </Typography>
          </Box>

          {quote.shipment && (
            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Route
              </Typography>
              <Typography variant="body2">
                {quote.shipment.origin?.location} → {quote.shipment.destination?.location}
              </Typography>
            </Box>
          )}

          <Box sx={{ mb: 2 }}>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Options disponibles
            </Typography>
            {quote.selectedOption ? (
              // Si une option est sélectionnée, l'afficher
              <Box>
                <Typography variant="body1" fontWeight="600" color="success.main">
                  ✓ {quote.selectedOption.label || 'Option sélectionnée'}: € {quote.selectedOption.totals?.grandTotal?.toLocaleString() || '0'}
                </Typography>
              </Box>
            ) : quote.availableOptions && quote.availableOptions.length > 0 ? (
              // Sinon, afficher toutes les options disponibles
              <Box>
                {quote.availableOptions.map((option, index) => (
                  <Box key={index} sx={{ mb: 0.5 }}>
                    <Typography variant="body2" color="text.primary">
                      • {option.label || `Option ${index + 1}`}: € {option.totals?.grandTotal?.toLocaleString() || '0'}
                    </Typography>
                  </Box>
                ))}
              </Box>
            ) : (
              <Typography variant="body2" color="text.secondary">
                Aucune option disponible
              </Typography>
            )}
          </Box>

          <Divider sx={{ my: 2 }} />

          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="caption" color="text.secondary">
              Créé le {new Date(quote.createdAt || '').toLocaleDateString('fr-FR')}
            </Typography>
            <Box>
              <Tooltip title="Voir les détails">
                <IconButton
                  size="small"
                  onClick={() => navigate(`/quotes/${quote.quoteId}`)}
                  sx={{ mr: 1 }}
                >
                  <Visibility fontSize="small" />
                </IconButton>
              </Tooltip>
              <Tooltip title="Éditer le devis">
                <IconButton
                  size="small"
                  onClick={() => handleEditQuote(quote)}
                  sx={{ mr: 1 }}
                >
                  <Edit fontSize="small" />
                </IconButton>
              </Tooltip>
            </Box>
          </Box>
        </CardContent>
      </Card>
    </Zoom>
  );

  return (
    <Box sx={{ p: 3 }}>
      {/* En-tête */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight="700" color="primary" gutterBottom>
          Tous les Devis
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Gestion des devis finaux et approuvés
        </Typography>
      </Box>

      {/* Statistiques */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="h4" fontWeight="700">
                    {stats.total}
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    Total des devis
                  </Typography>
                </Box>
                <Assessment sx={{ fontSize: 40, opacity: 0.8 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', color: 'white' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="h4" fontWeight="700">
                    {stats.pending}
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    En attente
                  </Typography>
                </Box>
                <Schedule sx={{ fontSize: 40, opacity: 0.8 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ background: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)', color: 'white' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="h4" fontWeight="700">
                    {stats.sentToClient}
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    Envoyés au client
                  </Typography>
                </Box>
                <Visibility sx={{ fontSize: 40, opacity: 0.8 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', color: 'white' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="h4" fontWeight="700">
                    {stats.approved}
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    Approuvés
                  </Typography>
                </Box>
                <CheckCircle sx={{ fontSize: 40, opacity: 0.8 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)', color: 'white' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="h4" fontWeight="700">
                    {stats.totalOptions}
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    Total des options
                  </Typography>
                </Box>
                <Assessment sx={{ fontSize: 40, opacity: 0.8 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Barre de recherche et filtres */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={4}>
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
            <FormControl fullWidth>
              <InputLabel>Filtrer par statut</InputLabel>
              <Select
                value={statusFilter}
                label="Filtrer par statut"
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <MenuItem value="all">Tous les statuts</MenuItem>
                <MenuItem value="draft">Brouillon</MenuItem>
                <MenuItem value="sentToClient">Envoyé au client</MenuItem>
                <MenuItem value="pending">En attente</MenuItem>
                <MenuItem value="approved">Approuvé</MenuItem>
                <MenuItem value="rejected">Rejeté</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={3}>
            <Typography variant="body2" color="text.secondary">
              {totalCount} résultat(s) trouvé(s)
            </Typography>
          </Grid>
          <Grid item xs={12} md={2}>
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
              <ToggleButtonGroup
                value={viewMode}
                exclusive
                onChange={(_, newMode) => newMode && setViewMode(newMode)}
                size="small"
              >
                <ToggleButton value="grid">
                  <GridView />
                </ToggleButton>
                <ToggleButton value="list">
                  <ViewList />
                </ToggleButton>
              </ToggleButtonGroup>
              <IconButton onClick={() => refetch()}>
                <Refresh />
              </IconButton>
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {/* Contenu principal */}
      {isLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
          <CircularProgress />
        </Box>
      ) : quotes.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h6" color="text.secondary" gutterBottom>
            Aucun devis trouvé
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {searchTerm || statusFilter !== 'all' 
              ? 'Essayez de modifier vos critères de recherche.'
              : 'Commencez par créer votre premier devis.'}
          </Typography>
        </Paper>
      ) : viewMode === 'grid' ? (
        <Grid container spacing={3}>
          {quotes.map((quote) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={quote.quoteId}>
              <QuoteCard quote={quote} />
            </Grid>
          ))}
        </Grid>
      ) : (
        <Paper sx={{ height: 600, width: '100%' }}>
          <DataGrid
            rows={quotes}
            columns={columns}
            getRowId={(row) => row.quoteId || row.id}
            initialState={{
              pagination: {
                paginationModel: { page: page - 1, pageSize: pageSize },
              },
            }}
            pageSizeOptions={[5, 10, 25, 50]}
            onPaginationModelChange={(model) => {
              setPage(model.page + 1);
              setPageSize(model.pageSize);
            }}
            disableRowSelectionOnClick
            sx={{
              '& .MuiDataGrid-cell': {
                borderBottom: '1px solid #f0f0f0',
              },
              '& .MuiDataGrid-columnHeaders': {
                backgroundColor: '#f8f9fa',
                borderBottom: '2px solid #e0e0e0',
              },
            }}
          />
        </Paper>
      )}

      {/* Snackbar pour les notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>

      {/* Éditeur de devis */}
      <QuoteEditor
        open={editorOpen}
        onClose={handleCloseEditor}
        quote={selectedQuote}
        onSave={handleSaveQuote}
        onSend={handleSendQuote}
      />
    </Box>
  );
};

export default AllQuotes;
