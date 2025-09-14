import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  getApiMiscellaneousOptions, 
  deleteApiMiscellaneousByIdMutation, 
  getApiMiscellaneousQueryKey
} from '../api/@tanstack/react-query.gen';
import { MiscellaneousResponse } from '../api/types.gen';
import MiscellaneousActions from './MiscellaneousActions';
// import MiscellaneousDetails from './MiscellaneousDetails';
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
  Grid,

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

interface MiscellaneousListProps {
  viewMode?: 'list' | 'cards';
  onEdit?: (misc: MiscellaneousResponse) => void;
}

const MiscellaneousList: React.FC<MiscellaneousListProps> = ({ viewMode = 'cards', onEdit }) => {
  const [filter, setFilter] = useState('');
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Utilisation des hooks TanStack Query générés
  const { 
    data: miscellaneous = [], 
    isLoading: loading, 
    error: queryError,
    refetch: fetchList
  } = useQuery(getApiMiscellaneousOptions());

  const deleteMutation = useMutation(deleteApiMiscellaneousByIdMutation());

  const error = queryError ? (queryError instanceof Error ? queryError.message : 'Une erreur est survenue') : null;

  const handleRefresh = () => {
    fetchList();
  };

  const handleEdit = (misc: MiscellaneousResponse) => {
    if (onEdit) {
      onEdit(misc);
    } else {
      navigate(`/pricingnew/miscellaneous/${misc.id}`);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteMutation.mutateAsync({ path: { id } });
      // Invalider le cache pour forcer le rechargement
      queryClient.invalidateQueries({ queryKey: getApiMiscellaneousQueryKey() });
    } catch (err) {
      console.error('Erreur lors de la suppression:', err);
    }
  };

  const handleView = (misc: MiscellaneousResponse) => {
    navigate(`/pricingnew/miscellaneous/details/${misc.id}`);
  };

  // Filtrage simple sur le nom du service ou fournisseur
  const filteredList = Array.isArray(miscellaneous)
    ? miscellaneous.filter(service =>
        (service.serviceName || '').toLowerCase().includes(filter.toLowerCase()) ||
        (service.serviceProviderName || '').toLowerCase().includes(filter.toLowerCase())
      )
    : [];

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
                             {/* Header avec nom du service bien visible */}
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
                     {service.serviceName || 'Service sans nom'}
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
                         width: 28,
                         height: 28,
                         '&:hover': {
                           bgcolor: 'rgba(102, 126, 234, 0.1)',
                           color: '#333'
                         }
                       }}
                     >
                       <VisibilityIcon sx={{ fontSize: 16 }} />
                     </IconButton>
                   </Tooltip>
                   <Tooltip title="Modifier">
                     <IconButton
                       onClick={() => handleEdit(service)}
                       size="small"
                       sx={{
                         color: '#666',
                         width: 28,
                         height: 28,
                         '&:hover': {
                           bgcolor: 'rgba(102, 126, 234, 0.1)',
                           color: '#333'
                         }
                       }}
                     >
                       <EditIcon sx={{ fontSize: 16 }} />
                     </IconButton>
                   </Tooltip>
                   <Tooltip title="Supprimer">
                     <IconButton
                       onClick={() => service.id && handleDelete(service.id)}
                       size="small"
                       sx={{
                         color: '#666',
                         width: 28,
                         height: 28,
                         '&:hover': {
                           bgcolor: 'rgba(255, 0, 0, 0.1)',
                           color: 'error.main'
                         }
                       }}
                     >
                       <DeleteIcon sx={{ fontSize: 16 }} />
            </IconButton>
          </Tooltip>
                 </Box>
               </Box>

              <Divider sx={{ my: 2 }} />

              {/* Content */}
              <Stack spacing={2} sx={{ flex: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Avatar sx={{ bgcolor: 'primary.main', width: 24, height: 24 }}>
                    <BusinessIcon sx={{ fontSize: 14 }} />
                  </Avatar>
                  <Typography variant="body2" sx={{ color: '#666', fontWeight: 500 }}>
                    {service.serviceProviderName || 'Fournisseur non spécifié'}
                  </Typography>
                </Box>

                {service.departurePortName && (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Avatar sx={{ bgcolor: 'secondary.main', width: 24, height: 24 }}>
                      <LocalShippingIcon sx={{ fontSize: 14 }} />
                    </Avatar>
                    <Typography variant="body2" sx={{ color: '#666' }}>
                      {service.departurePortName}
                    </Typography>
                  </Box>
                )}

                {service.pricing?.basePrice && (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Avatar sx={{ bgcolor: 'success.main', width: 24, height: 24 }}>
                      <MonetizationOnIcon sx={{ fontSize: 14 }} />
                    </Avatar>
                    <Typography variant="body2" sx={{ color: '#666', fontWeight: 600 }}>
                      {service.pricing.basePrice} {service.currency || 'EUR'}
                    </Typography>
                  </Box>
                )}

                {service.validFrom && (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Avatar sx={{ bgcolor: 'warning.main', width: 24, height: 24 }}>
                      <CalendarTodayIcon sx={{ fontSize: 14 }} />
                    </Avatar>
                    <Typography variant="body2" sx={{ color: '#666' }}>
                      {new Date(service.validFrom).toLocaleDateString()}
                    </Typography>
                  </Box>
                )}

                {service.serviceDescription && (
                  <Typography 
                    variant="body2" 
                    sx={{ 
                      color: '#666', 
                      fontStyle: 'italic',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical'
                    }}
                  >
                    {service.serviceDescription}
                  </Typography>
                )}
        </Stack>
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  );

  // Composant pour l'affichage en liste
  const ListView = () => (
    <TableContainer 
      component={Paper} 
      sx={{ 
        borderRadius: 3,
        background: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(255, 255, 255, 0.2)',
        maxWidth: '100%',
        overflowX: 'auto'
      }}
    >
      <Table>
        <TableHead>
          <TableRow sx={{ bgcolor: 'rgba(102, 126, 234, 0.1)' }}>
            <TableCell sx={{ fontWeight: 700, color: '#2c3e50' }}>Service</TableCell>
            <TableCell sx={{ fontWeight: 700, color: '#2c3e50' }}>Fournisseur</TableCell>
            <TableCell sx={{ fontWeight: 700, color: '#2c3e50' }}>Type</TableCell>
            <TableCell sx={{ fontWeight: 700, color: '#2c3e50' }}>Port</TableCell>
            <TableCell sx={{ fontWeight: 700, color: '#2c3e50' }}>Prix</TableCell>
            <TableCell sx={{ fontWeight: 700, color: '#2c3e50' }}>Validité</TableCell>
            <TableCell sx={{ fontWeight: 700, color: '#2c3e50' }}>Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {filteredList.map((service) => (
            <TableRow 
              key={service.id}
              sx={{ 
                '&:hover': { 
                  bgcolor: 'rgba(102, 126, 234, 0.05)',
                  cursor: 'pointer'
                }
              }}
            >
                             <TableCell>
                 <Box>
                   <Typography 
                     variant="h6" 
                     sx={{ 
                       fontWeight: 700, 
                       color: '#1a237e',
                       fontSize: { xs: '0.9rem', sm: '1rem' },
                       mb: 0.5,
                       lineHeight: 1.2,
                       wordBreak: 'break-word',
                       hyphens: 'auto'
                     }}
                   >
                     {service.serviceName || 'Service sans nom'}
                   </Typography>
                   {service.serviceDescription && (
                     <Typography 
                       variant="body2" 
                       sx={{ 
                         color: '#666', 
                         fontStyle: 'italic',
                         fontSize: { xs: '0.7rem', sm: '0.8rem' },
                         wordBreak: 'break-word',
                         hyphens: 'auto',
                         maxWidth: { xs: 200, sm: 250 }
                       }}
                     >
                       {service.serviceDescription}
                     </Typography>
                   )}
                 </Box>
               </TableCell>
              <TableCell>
                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                  {service.serviceProviderName || 'N/A'}
                </Typography>
              </TableCell>
              <TableCell>
                <Chip 
                  label={service.serviceType || 'N/A'} 
                  size="small" 
                  sx={{ 
                    bgcolor: 'primary.main', 
                    color: 'white',
                    fontWeight: 600
                  }} 
                />
              </TableCell>
              <TableCell>
                <Typography variant="body2">
                  {service.departurePortName || 'N/A'}
                </Typography>
              </TableCell>
              <TableCell>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  {service.pricing?.basePrice ? `${service.pricing.basePrice} ${service.currency || 'EUR'}` : 'N/A'}
                </Typography>
              </TableCell>
              <TableCell>
                <Typography variant="body2">
                  {service.validFrom ? new Date(service.validFrom).toLocaleDateString() : 'N/A'}
                </Typography>
              </TableCell>
                             <TableCell>
                 <Box sx={{ 
                   display: 'flex', 
                   gap: { xs: 0.25, sm: 0.5 },
                   flexDirection: { xs: 'column', sm: 'row' }
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
                           bgcolor: 'rgba(255, 0, 0, 0.1)',
                           color: 'error.main'
                         }
                       }}
                     >
                       <DeleteIcon sx={{ fontSize: { xs: 18, sm: 16 } }} />
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

  return (
    <Box>
      {loading && <LinearProgress sx={{ mb: 2 }} />}

          {error && (
            <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>{error}</Alert>
          )}

          {filteredList.length === 0 && !loading ? (
            <Alert severity="info" sx={{ borderRadius: 2 }}>
              Aucun service miscellaneous trouvé.
            </Alert>
          ) : (
        viewMode === 'cards' ? <CardsView /> : <ListView />
      )}

      {/* Affichage des détails déplacé vers une page dédiée */}


    </Box>
  );
};

export default MiscellaneousList; 