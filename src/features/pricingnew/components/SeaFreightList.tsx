import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  getApiSeaFreightOptions, 
  deleteApiSeaFreightByIdMutation,
  getApiSeaFreightQueryKey
} from '../api/@tanstack/react-query.gen';
import { SeaFreightResponse } from '../api/types.gen';
import { useNavigate } from 'react-router-dom';
import { 
  Box, 
  Card, 
  CardContent, 
  Stack, 
  Typography, 
  Chip, 
  IconButton, 
  Tooltip, 
  LinearProgress, 
  Alert, 
  TextField, 
  InputAdornment, 
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Avatar,
  Divider,
  Grid
} from '@mui/material';
import Refresh from '@mui/icons-material/Refresh';
import Search from '@mui/icons-material/Search';
import BusinessIcon from '@mui/icons-material/Business';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import VisibilityIcon from '@mui/icons-material/Visibility';
import DirectionsBoatIcon from '@mui/icons-material/DirectionsBoat';

interface SeaFreightListProps {
  viewMode?: 'list' | 'cards';
}

const SeaFreightList: React.FC<SeaFreightListProps> = ({ viewMode = 'cards' }) => {
  const [filter, setFilter] = useState('');
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Utilisation des hooks TanStack Query générés
  const { 
    data: seaFreights = [], 
    isLoading: loading, 
    error: queryError,
    refetch: fetchList
  } = useQuery(getApiSeaFreightOptions());

  const deleteMutation = useMutation(deleteApiSeaFreightByIdMutation());

  const error = queryError ? (queryError instanceof Error ? queryError.message : 'Une erreur est survenue') : null;

  const handleRefresh = () => {
    fetchList();
  };

  const handleEdit = (seaFreight: SeaFreightResponse) => {
    navigate(`/pricingnew/seafreight/${seaFreight.id}`);
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteMutation.mutateAsync({ path: { id } });
      // Invalider le cache pour forcer le rechargement
      queryClient.invalidateQueries({ queryKey: getApiSeaFreightQueryKey() });
    } catch (err) {
      console.error('Erreur lors de la suppression:', err);
    }
  };

  const handleView = (seaFreight: SeaFreightResponse) => {
    navigate(`/pricingnew/seafreight/details/${seaFreight.id}`);
  };

  // Filtrage simple sur le nom du transporteur ou les ports
  const filteredList: SeaFreightResponse[] = Array.isArray(seaFreights?.items) ? seaFreights.items.filter(service =>
    (service.carrier?.name || '').toLowerCase().includes(filter.toLowerCase()) ||
    (service.departurePort?.name || '').toLowerCase().includes(filter.toLowerCase()) ||
    (service.arrivalPort?.name || '').toLowerCase().includes(filter.toLowerCase())
  ) : [];

  // Composant pour l'affichage en cartes
  const CardsView = () => (
    <Grid container spacing={{ xs: 2, sm: 3 }}>
      {filteredList.map((service) => (
        <Grid item xs={12} sm={6} md={4} lg={3} key={service.id}>
          <Card 
            sx={{ 
              height: '100%',
              borderRadius: 3,
              background: 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              transition: 'all 0.3s ease',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: '0 12px 40px rgba(0,0,0,0.15)'
              }
            }}
          >
            <CardContent sx={{ 
              p: { xs: 2, sm: 3 }, 
              height: '100%', 
              display: 'flex', 
              flexDirection: 'column' 
            }}>
              {/* Header avec nom du transporteur bien visible */}
              <Box sx={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'flex-start', 
                mb: 3,
                flexDirection: { xs: 'column', sm: 'row' },
                gap: { xs: 2, sm: 0 }
              }}>
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography 
                    variant="h5" 
                    sx={{ 
                      fontWeight: 800, 
                      mb: 1.5, 
                      color: '#1a237e',
                      fontSize: { xs: '1.1rem', sm: '1.25rem' },
                      lineHeight: 1.3,
                      wordBreak: 'break-word',
                      hyphens: 'auto'
                    }}
                  >
                    {service.carrier?.name || 'Transporteur sans nom'}
                  </Typography>
                </Box>
                <Box sx={{ 
                  display: 'flex', 
                  gap: { xs: 0.25, sm: 0.5 },
                  flexDirection: { xs: 'row', sm: 'row' },
                  alignSelf: { xs: 'flex-start', sm: 'flex-start' }
                }}>
                  <Tooltip title="Voir les détails">
                    <IconButton
                      onClick={() => handleView(service)}
                      size="small"
                      sx={{
                        color: '#666',
                        width: { xs: 32, sm: 28 },
                        height: { xs: 32, sm: 28 },
                        minWidth: { xs: 32, sm: 28 },
                        '&:hover': {
                          bgcolor: 'rgba(102, 126, 234, 0.1)',
                          color: '#333'
                        }
                      }}
                    >
                      <VisibilityIcon sx={{ fontSize: { xs: 18, sm: 16 } }} />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Modifier">
                    <IconButton
                      onClick={() => handleEdit(service)}
                      size="small"
                      sx={{
                        color: '#666',
                        width: { xs: 32, sm: 28 },
                        height: { xs: 32, sm: 28 },
                        minWidth: { xs: 32, sm: 28 },
                        '&:hover': {
                          bgcolor: 'rgba(102, 126, 234, 0.1)',
                          color: '#333'
                        }
                      }}
                    >
                      <EditIcon sx={{ fontSize: { xs: 18, sm: 16 } }} />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Supprimer">
                    <IconButton
                      onClick={() => service.id && handleDelete(service.id)}
                      size="small"
                      sx={{
                        color: '#666',
                        width: { xs: 32, sm: 28 },
                        height: { xs: 32, sm: 28 },
                        minWidth: { xs: 32, sm: 28 },
                        '&:hover': {
                          bgcolor: 'rgba(244, 67, 54, 0.1)',
                          color: '#d32f2f'
                        }
                      }}
                    >
                      <DeleteIcon sx={{ fontSize: { xs: 18, sm: 16 } }} />
                    </IconButton>
                  </Tooltip>
                </Box>
              </Box>

              {/* Informations principales */}
              <Stack spacing={2} sx={{ flex: 1 }}>
                {/* Itinéraire */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <Avatar sx={{ bgcolor: 'primary.main', width: 32, height: 32 }}>
                    <DirectionsBoatIcon sx={{ fontSize: 16 }} />
                  </Avatar>
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography variant="body2" sx={{ fontWeight: 600, color: '#333' }}>
                      {service.departurePort?.name} → {service.arrivalPort?.name}
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#666' }}>
                      {service.transitTimeDays} jours de transit
                    </Typography>
                  </Box>
                </Box>

                {/* Prix */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <Avatar sx={{ bgcolor: 'success.main', width: 32, height: 32 }}>
                    <MonetizationOnIcon sx={{ fontSize: 16 }} />
                  </Avatar>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="body2" sx={{ fontWeight: 600, color: '#333' }}>
                      {service.charges?.basePrice} {service.currency || 'EUR'}
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#666' }}>
                      Prix de base
                    </Typography>
                  </Box>
                </Box>

                {/* Conteneur */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <Avatar sx={{ bgcolor: 'warning.main', width: 32, height: 32 }}>
                    <LocalShippingIcon sx={{ fontSize: 16 }} />
                  </Avatar>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="body2" sx={{ fontWeight: 600, color: '#333' }}>
                      {service.containerType || 'Type non spécifié'}
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#666' }}>
                      {service.isReefer ? 'Reefer' : 'Dry'}
                    </Typography>
                  </Box>
                </Box>

                {/* Validité */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <Avatar sx={{ bgcolor: 'info.main', width: 32, height: 32 }}>
                    <CalendarTodayIcon sx={{ fontSize: 16 }} />
                  </Avatar>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="body2" sx={{ fontWeight: 600, color: '#333' }}>
                      {service.validity?.startDate ? new Date(service.validity.startDate).toLocaleDateString('fr-FR') : 'Non spécifié'}
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#666' }}>
                      Date de validité
                    </Typography>
                  </Box>
                </Box>

                {/* Nombre de surcharges */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <Avatar sx={{ bgcolor: 'info.main', width: 32, height: 32 }}>
                    <MonetizationOnIcon sx={{ fontSize: 16 }} />
                  </Avatar>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="body2" sx={{ fontWeight: 600, color: '#333' }}>
                      {service.charges?.surcharges?.length || 0} surcharges
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#666' }}>
                      Nombre de surcharges
                    </Typography>
                  </Box>
                </Box>

                {/* Quote */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <Avatar sx={{ bgcolor: 'info.main', width: 32, height: 32 }}>
                    <MonetizationOnIcon sx={{ fontSize: 16 }} />
                  </Avatar>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="body2" sx={{ fontWeight: 600, color: '#333' }}>
                      {service.quoteNumber || 'N/A'}
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#666' }}>
                      Quote: {service.quoteNumber || 'N/A'}
                    </Typography>
                  </Box>
                </Box>
              </Stack>

              {/* Footer avec statut */}
              <Box sx={{ mt: 2, pt: 2, borderTop: '1px solid #eee' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Chip 
                    label={service.isActive ? 'Actif' : 'Inactif'} 
                    size="small"
                    color={service.isActive ? 'success' : 'default'}
                    sx={{ fontSize: '0.75rem' }}
                  />
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  );

  // Composant pour l'affichage en liste
  const ListView = () => (
    <TableContainer component={Paper} sx={{ borderRadius: 3, overflow: 'hidden' }}>
      <Table>
        <TableHead>
          <TableRow sx={{ bgcolor: 'primary.main' }}>
            <TableCell sx={{ color: 'white', fontWeight: 600 }}>Quote</TableCell>
            <TableCell sx={{ color: 'white', fontWeight: 600 }}>Transporteur</TableCell>
            <TableCell sx={{ color: 'white', fontWeight: 600 }}>Itinéraire</TableCell>
            <TableCell sx={{ color: 'white', fontWeight: 600 }}>Prix</TableCell>
            <TableCell sx={{ color: 'white', fontWeight: 600 }}>Conteneur</TableCell>
            <TableCell sx={{ color: 'white', fontWeight: 600 }}>Transit</TableCell>
            <TableCell sx={{ color: 'white', fontWeight: 600 }}>Statut</TableCell>
            <TableCell sx={{ color: 'white', fontWeight: 600 }}>Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {filteredList.map((service) => (
            <TableRow key={service.id} sx={{ '&:hover': { bgcolor: 'rgba(102, 126, 234, 0.05)' } }}>
              <TableCell>
                <Typography variant="body2" sx={{ fontWeight: 600, color: 'primary.main' }}>
                  {service.quoteNumber || 'N/A'}
                </Typography>
              </TableCell>
              <TableCell>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Avatar sx={{ bgcolor: 'primary.main', width: 32, height: 32 }}>
                    <BusinessIcon sx={{ fontSize: 16 }} />
                  </Avatar>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {service.carrier?.name || 'N/A'}
                  </Typography>
                </Box>
              </TableCell>
              <TableCell>
                <Typography variant="body2">
                  {service.departurePort?.name} → {service.arrivalPort?.name}
                </Typography>
              </TableCell>
              <TableCell>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  {service.charges?.basePrice} {service.currency}
                </Typography>
              </TableCell>
              <TableCell>
                <Chip 
                  label={service.containerType || 'N/A'} 
                  size="small"
                  variant="outlined"
                />
              </TableCell>
              <TableCell>
                <Typography variant="body2">
                  {service.transitTimeDays} jours
                </Typography>
              </TableCell>
              <TableCell>
                <Chip 
                  label={service.isActive ? 'Actif' : 'Inactif'} 
                  size="small"
                  color={service.isActive ? 'success' : 'default'}
                />
              </TableCell>
              <TableCell>
                <Box sx={{ display: 'flex', gap: 0.5 }}>
                  <Tooltip title="Voir les détails">
                    <IconButton size="small" onClick={() => handleView(service)}>
                      <VisibilityIcon sx={{ fontSize: 16 }} />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Modifier">
                    <IconButton size="small" onClick={() => handleEdit(service)}>
                      <EditIcon sx={{ fontSize: 16 }} />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Supprimer">
                    <IconButton 
                      size="small" 
                      onClick={() => service.id && handleDelete(service.id)}
                      sx={{ color: '#d32f2f' }}
                    >
                      <DeleteIcon sx={{ fontSize: 16 }} />
                    </IconButton>
                  </Tooltip>
                </Box>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );

  if (loading) {
    return (
      <Box sx={{ p: 3 }}>
        <LinearProgress />
        <Typography sx={{ mt: 2 }}>Chargement des offres Sea Freight...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Header avec recherche et actions */}
      <Box sx={{ 
        display: 'flex', 
        flexDirection: { xs: 'column', sm: 'row' }, 
        justifyContent: 'space-between', 
        alignItems: { xs: 'stretch', sm: 'center' }, 
        gap: 2, 
        mb: 3 
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Typography variant="h5" sx={{ fontWeight: 700, color: '#1a237e' }}>
            Offres Sea Freight ({filteredList.length})
          </Typography>
          <Button
            startIcon={<Refresh />}
            onClick={handleRefresh}
            variant="outlined"
            size="small"
            sx={{ borderRadius: 2 }}
          >
            Actualiser
          </Button>
        </Box>

        <TextField
          placeholder="Rechercher par transporteur, port de départ ou d'arrivée..."
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          size="small"
          sx={{ 
            minWidth: { xs: '100%', sm: 300 },
            '& .MuiOutlinedInput-root': { borderRadius: 2 }
          }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search />
              </InputAdornment>
            ),
          }}
        />
      </Box>

      {/* Affichage des erreurs */}
      {error && (
        <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
          {error}
        </Alert>
      )}

      {/* Contenu principal */}
      {viewMode === 'cards' ? <CardsView /> : <ListView />}

      {/* Message si aucune donnée */}
      {filteredList.length === 0 && !loading && (
        <Box sx={{ 
          textAlign: 'center', 
          py: 8, 
          color: '#666' 
        }}>
          <DirectionsBoatIcon sx={{ fontSize: 64, mb: 2, opacity: 0.5 }} />
          <Typography variant="h6" sx={{ mb: 1 }}>
            Aucune offre Sea Freight trouvée
          </Typography>
          <Typography variant="body2">
            {filter ? 'Aucun résultat pour votre recherche.' : 'Commencez par créer votre première offre Sea Freight.'}
          </Typography>
        </Box>
      )}
    </Box>
  );
};

export default SeaFreightList; 