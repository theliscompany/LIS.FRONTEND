import React, { useState } from 'react';
import { 
  Box, 
  Typography, 
  ToggleButton, 
  ToggleButtonGroup, 
  Paper, 
  Container,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  Chip,
  Avatar,
  IconButton,
  Tooltip,
  Divider,
  TextField,
  InputAdornment
} from '@mui/material';
import {
  ViewList as ViewListIcon,
  ViewModule as ViewModuleIcon,
  Add as AddIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';
import SeaFreightList from '../components/SeaFreightList';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { postApiSeaFreightAnalyticsAggregationsOptions } from '../api/@tanstack/react-query.gen';

type ViewMode = 'list' | 'cards';

const SeaFreightPage: React.FC = () => {
  const [viewMode, setViewMode] = useState<ViewMode>('cards');
  const navigate = useNavigate();

  // Hook React Query pour récupérer les stats du dashboard
  const { data: stats, isLoading, error } = useQuery(
    postApiSeaFreightAnalyticsAggregationsOptions({ body: {} })
  );

  const handleViewModeChange = (
    event: React.MouseEvent<HTMLElement>,
    newViewMode: ViewMode | null,
  ) => {
    if (newViewMode !== null) {
      setViewMode(newViewMode);
    }
  };

  const handleCreate = () => {
    navigate('/pricingnew/seafreight/new');
  };

  // Helpers pour extraire les valeurs du backend
  const totalOffers = stats?.totalResults ?? 0;
  const carrierCount = stats?.carrierDistribution ? Object.keys(stats.carrierDistribution).length : 0;
  const routeCount = stats?.topRoutes ? Object.keys(stats.topRoutes).length : 0;
  // Pour "Mises à jour", on affiche le nombre d'offres créées récemment si possible, sinon totalOffers
  // (À adapter selon la donnée métier souhaitée)
  const updatesCount = totalOffers; // Placeholder, à affiner si besoin

  return (
    <Box 
      sx={{ 
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        py: 4
      }}
    >
      <Container maxWidth="xl">
        {/* Header Section */}
        <Paper 
          elevation={0} 
          sx={{ 
            mb: 4, 
            p: 4, 
            borderRadius: 3,
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.2)'
          }}
        >
          <Box
            sx={{
              display: 'flex',
              flexDirection: { xs: 'column', md: 'row' },
              alignItems: { xs: 'flex-start', md: 'center' },
              justifyContent: 'space-between',
              gap: 2
            }}
          >
            <Box>
              <Typography 
                variant="h3" 
                sx={{ 
                  fontWeight: 700,
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  mb: 1
                }}
              >
                Offres de Prix Sea Freight
              </Typography>
              <Typography 
                variant="body1" 
                sx={{ 
                  color: '#666',
                  fontSize: '1.1rem',
                  fontWeight: 400
                }}
              >
                Gérez les offres de prix de vos transporteurs maritimes avec une interface moderne
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: { xs: 2, md: 0 } }}>
              <ToggleButtonGroup
                value={viewMode}
                exclusive
                onChange={handleViewModeChange}
                aria-label="mode d'affichage"
                size="small"
                sx={{
                  boxShadow: 'none',
                  border: '1px solid #e0e0e0',
                  borderRadius: 2,
                  bgcolor: 'white',
                  mr: 1
                }}
              >
                <ToggleButton 
                  value="cards" 
                  aria-label="affichage en cartes"
                  sx={{ px: 1.5, py: 1, minWidth: 0 }}
                >
                  <ViewModuleIcon />
                </ToggleButton>
                <ToggleButton 
                  value="list" 
                  aria-label="affichage en liste"
                  sx={{ px: 1.5, py: 1, minWidth: 0 }}
                >
                  <ViewListIcon />
                </ToggleButton>
              </ToggleButtonGroup>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={handleCreate}
                sx={{
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  borderRadius: 2,
                  px: 3,
                  py: 1.5,
                  fontWeight: 600,
                  textTransform: 'none',
                  fontSize: '0.95rem',
                  boxShadow: '0 4px 15px rgba(102, 126, 234, 0.3)',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)',
                    transform: 'translateY(-2px)',
                    boxShadow: '0 8px 25px rgba(102, 126, 234, 0.4)'
                  }
                }}
              >
                Nouvelle Offre
              </Button>
            </Box>
          </Box>
        </Paper>

        {/* Stats Cards */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card 
              sx={{ 
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
              <CardContent sx={{ textAlign: 'center', py: 3 }}>
                <Avatar 
                  sx={{ 
                    bgcolor: 'primary.main', 
                    mx: 'auto', 
                    mb: 2,
                    width: 56,
                    height: 56
                  }}
                >
                  <AddIcon />
                </Avatar>
                <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
                  {isLoading ? '...' : totalOffers}
                </Typography>
                <Typography variant="body2" sx={{ color: '#666' }}>
                  Offres Actives
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <Card 
              sx={{ 
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
              <CardContent sx={{ textAlign: 'center', py: 3 }}>
                <Avatar 
                  sx={{ 
                    bgcolor: 'success.main', 
                    mx: 'auto', 
                    mb: 2,
                    width: 56,
                    height: 56
                  }}
                >
                  <SearchIcon />
                </Avatar>
                <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
                  {isLoading ? '...' : carrierCount}
                </Typography>
                <Typography variant="body2" sx={{ color: '#666' }}>
                  Transporteurs
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <Card 
              sx={{ 
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
              <CardContent sx={{ textAlign: 'center', py: 3 }}>
                <Avatar 
                  sx={{ 
                    bgcolor: 'warning.main', 
                    mx: 'auto', 
                    mb: 2,
                    width: 56,
                    height: 56
                  }}
                >
                  <FilterIcon />
                </Avatar>
                <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
                  {isLoading ? '...' : routeCount}
                </Typography>
                <Typography variant="body2" sx={{ color: '#666' }}>
                  Routes Actives
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <Card 
              sx={{ 
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
              <CardContent sx={{ textAlign: 'center', py: 3 }}>
                <Avatar 
                  sx={{ 
                    bgcolor: 'info.main', 
                    mx: 'auto', 
                    mb: 2,
                    width: 56,
                    height: 56
                  }}
                >
                  <RefreshIcon />
                </Avatar>
                <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
                  {isLoading ? '...' : updatesCount}
                </Typography>
                <Typography variant="body2" sx={{ color: '#666' }}>
                  Mises à jour
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Gestion des erreurs */}
        {error && (
          <Paper sx={{ p: 2, mb: 2, background: '#ffeaea', color: '#b71c1c' }}>
            Erreur lors du chargement des statistiques : {error instanceof Error ? error.message : 'Erreur inconnue'}
          </Paper>
        )}

        {/* Main Content */}
        <Paper 
          elevation={0} 
          sx={{ 
            borderRadius: 3,
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            overflow: 'hidden'
          }}
        >
          <SeaFreightList viewMode={viewMode} />
        </Paper>
      </Container>
    </Box>
  );
};

export default SeaFreightPage; 