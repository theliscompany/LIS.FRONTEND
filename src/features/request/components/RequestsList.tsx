import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Pagination,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Button,
  Chip,
  IconButton,
  Tooltip,
  CircularProgress
} from '@mui/material';
import { Edit, Visibility, Refresh } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { getApiRequest } from '../api/sdk.gen';
import { RequestQuoteListViewModel } from '../api/types.gen';

interface RequestsListProps {
  onRequestClick?: (request: RequestQuoteListViewModel) => void;
}

const RequestsList: React.FC<RequestsListProps> = ({ onRequestClick }) => {
  const navigate = useNavigate();
  const [requests, setRequests] = useState<RequestQuoteListViewModel[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  
  // Filtres
  const [filters, setFilters] = useState({
    status: '',
    customerId: '',
    pickupCity: '',
    deliveryCity: '',
    incoterm: '',
    productName: '',
    trackingNumber: '',
    assigneeId: '',
    sortBy: 'createdAt',
    sortOrder: 'desc'
  });

  const loadRequests = async () => {
    setLoading(true);
    try {
      const queryParams: any = {
        page,
        pageSize,
        sortBy: filters.sortBy,
        sortOrder: filters.sortOrder
      };

      // Ajouter les filtres non vides
      if (filters.status) queryParams.status = filters.status;
      if (filters.customerId) queryParams.customerId = parseInt(filters.customerId);
      if (filters.pickupCity) queryParams.pickupCity = filters.pickupCity;
      if (filters.deliveryCity) queryParams.deliveryCity = filters.deliveryCity;
      if (filters.incoterm) queryParams.incoterm = filters.incoterm;
      if (filters.productName) queryParams.productName = filters.productName;
      if (filters.trackingNumber) queryParams.trackingNumber = filters.trackingNumber;
      if (filters.assigneeId) queryParams.assigneeId = filters.assigneeId;

      const response = await getApiRequest({ query: queryParams });
      setRequests(response.data || []);
      
      // Calculer le nombre total de pages (à adapter selon la réponse de l'API)
      setTotalPages(Math.ceil((response.data?.length || 0) / pageSize));
    } catch (error) {
      console.error('Erreur lors du chargement des demandes:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRequests();
  }, [page, filters]);

  const handleFilterChange = (field: string, value: string) => {
    setFilters(prev => ({ ...prev, [field]: value }));
    setPage(1); // Retour à la première page lors du changement de filtre
  };

  const handleRequestClick = (request: RequestQuoteListViewModel) => {
    if (onRequestClick) {
      onRequestClick(request);
    } else {
      navigate(`/requests/${request.requestQuoteId}`);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'new':
        return 'primary';
      case 'pending':
      case 'enattente':
        return 'warning';
      case 'valid':
      case 'valider':
        return 'success';
      case 'reject':
      case 'rejeter':
        return 'error';
      default:
        return 'default';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Liste des Demandes
      </Typography>

      {/* Filtres */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Filtres
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                fullWidth
                size="small"
                label="Numéro de suivi"
                value={filters.trackingNumber}
                onChange={(e) => handleFilterChange('trackingNumber', e.target.value)}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                fullWidth
                size="small"
                label="Ville de collecte"
                value={filters.pickupCity}
                onChange={(e) => handleFilterChange('pickupCity', e.target.value)}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                fullWidth
                size="small"
                label="Ville de livraison"
                value={filters.deliveryCity}
                onChange={(e) => handleFilterChange('deliveryCity', e.target.value)}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                fullWidth
                size="small"
                label="Produit"
                value={filters.productName}
                onChange={(e) => handleFilterChange('productName', e.target.value)}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth size="small">
                <InputLabel>Statut</InputLabel>
                <Select
                  value={filters.status}
                  label="Statut"
                  onChange={(e) => handleFilterChange('status', e.target.value)}
                >
                  <MenuItem value="">Tous</MenuItem>
                  <MenuItem value="New">Nouveau</MenuItem>
                  <MenuItem value="EnAttente">En attente</MenuItem>
                  <MenuItem value="Valider">Validé</MenuItem>
                  <MenuItem value="Rejeter">Rejeté</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth size="small">
                <InputLabel>Tri par</InputLabel>
                <Select
                  value={filters.sortBy}
                  label="Tri par"
                  onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                >
                  <MenuItem value="createdAt">Date de création</MenuItem>
                  <MenuItem value="trackingNumber">Numéro de suivi</MenuItem>
                  <MenuItem value="status">Statut</MenuItem>
                  <MenuItem value="companyName">Client</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth size="small">
                <InputLabel>Ordre</InputLabel>
                <Select
                  value={filters.sortOrder}
                  label="Ordre"
                  onChange={(e) => handleFilterChange('sortOrder', e.target.value)}
                >
                  <MenuItem value="desc">Décroissant</MenuItem>
                  <MenuItem value="asc">Croissant</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Button
                variant="outlined"
                startIcon={<Refresh />}
                onClick={loadRequests}
                disabled={loading}
                fullWidth
              >
                Actualiser
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Table des demandes */}
      <Card>
        <CardContent>
          {loading ? (
            <Box display="flex" justifyContent="center" p={3}>
              <CircularProgress />
            </Box>
          ) : (
            <>
              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Numéro de suivi</TableCell>
                      <TableCell>Client</TableCell>
                      <TableCell>Statut</TableCell>
                      <TableCell>Collecte</TableCell>
                      <TableCell>Livraison</TableCell>
                      <TableCell>Produit</TableCell>
                      <TableCell>Date de création</TableCell>
                      <TableCell>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {requests.map((request) => (
                      <TableRow key={request.requestQuoteId} hover>
                        <TableCell>
                          <Typography variant="body2" fontWeight="bold">
                            {request.trackingNumber}
                          </Typography>
                        </TableCell>
                        <TableCell>{request.companyName}</TableCell>
                        <TableCell>
                          <Chip
                            label={request.status}
                            color={getStatusColor(request.status || '')}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {request.pickupCity}
                          </Typography>
                          <Typography variant="caption" color="textSecondary">
                            {request.pickupCountry}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {request.deliveryCity}
                          </Typography>
                          <Typography variant="caption" color="textSecondary">
                            {request.deliveryCountry}
                          </Typography>
                        </TableCell>
                        <TableCell>{request.productName}</TableCell>
                        <TableCell>{formatDate(request.createdAt)}</TableCell>
                        <TableCell>
                          <Tooltip title="Voir les détails">
                            <IconButton
                              size="small"
                              onClick={() => handleRequestClick(request)}
                            >
                              <Visibility />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Modifier">
                            <IconButton
                              size="small"
                              onClick={() => navigate(`/requests/${request.requestQuoteId}/edit`)}
                            >
                              <Edit />
                            </IconButton>
                          </Tooltip>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>

              {/* Pagination */}
              <Box display="flex" justifyContent="center" mt={2}>
                <Pagination
                  count={totalPages}
                  page={page}
                  onChange={(_, newPage) => setPage(newPage)}
                  color="primary"
                />
              </Box>
            </>
          )}
        </CardContent>
      </Card>
    </Box>
  );
};

export default RequestsList; 