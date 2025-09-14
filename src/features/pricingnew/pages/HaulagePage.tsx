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
import { useQuery } from '@tanstack/react-query';
import { getApiHaulageOptions } from '../api/@tanstack/react-query.gen';
import HaulageList from '../components/HaulageList';
import { useNavigate } from 'react-router-dom';

type ViewMode = 'list' | 'cards';

const HaulagePage: React.FC = () => {
  const [viewMode, setViewMode] = useState<ViewMode>('cards');
  const navigate = useNavigate();

  // Hook React Query pour récupérer les données haulage
  const { data: haulageData, isLoading, error } = useQuery(
    getApiHaulageOptions()
  );

  // Calculs des statistiques basés sur les données réelles
  const totalOffers = haulageData?.length ?? 0;
  
  // Nombre unique de transporteurs
  const uniqueHauliers = haulageData 
    ? [...new Set(haulageData.map(h => h.haulierId))].length 
    : 0;
  
  // Nombre unique de types de cargaison
  const uniqueCargoTypes = haulageData 
    ? [...new Set(haulageData.flatMap(h => h.cargoTypes || []))].length 
    : 0;
  
  // Nombre d'offres du mois actuel (approximation basée sur createdAt)
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  const monthlyOffers = haulageData 
    ? haulageData.filter(h => {
        if (!h.createdAt) return false;
        const createdDate = new Date(h.createdAt);
        return createdDate.getMonth() === currentMonth && createdDate.getFullYear() === currentYear;
      }).length 
    : 0;

  const handleViewModeChange = (
    event: React.MouseEvent<HTMLElement>,
    newViewMode: ViewMode | null,
  ) => {
    if (newViewMode !== null) {
      setViewMode(newViewMode);
    }
  };

  const handleCreate = () => {
    navigate('/pricingnew/haulage/new');
  };

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
                Offres de Prix Transporteurs
              </Typography>
              <Typography 
                variant="body1" 
                sx={{ 
                  color: '#666',
                  fontSize: '1.1rem',
                  fontWeight: 400
                }}
              >
                Gérez les offres de prix de vos transporteurs et hauliers avec une interface moderne
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
                  <ViewModuleIcon />
                </Avatar>
                <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
                  {isLoading ? '...' : uniqueHauliers}
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
                  {isLoading ? '...' : uniqueCargoTypes}
                </Typography>
                <Typography variant="body2" sx={{ color: '#666' }}>
                  Types de Cargaisons
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
                  {isLoading ? '...' : monthlyOffers}
                </Typography>
                <Typography variant="body2" sx={{ color: '#666' }}>
                  Demandes ce Mois
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Content Area */}
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
          <Box sx={{ p: 3, borderBottom: '1px solid #e0e0e0' }}>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} md={6}>
                <Typography variant="h6" sx={{ fontWeight: 600, color: '#333' }}>
                  {viewMode === 'cards' ? '🚛 Offres en Cartes' : '📊 Offres en Liste'}
                </Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, flexWrap: 'wrap' }}>
                  <TextField
                    size="small"
                    placeholder="Rechercher une offre..."
                    variant="outlined"
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <SearchIcon sx={{ color: '#666' }} />
                        </InputAdornment>
                      ),
                    }}
                    sx={{ 
                      minWidth: 250,
                      '& .MuiOutlinedInput-root': { 
                        borderRadius: 2,
                        bgcolor: 'rgba(255, 255, 255, 0.8)'
                      } 
                    }}
                  />
                </Box>
              </Grid>
            </Grid>
          </Box>
          
          <Box sx={{ p: 3 }}>
            <HaulageList viewMode={viewMode} />
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};

export default HaulagePage; 