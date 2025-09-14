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
import MiscellaneousList from '../components/MiscellaneousList';

type ViewMode = 'list' | 'cards';

const MiscellaneousPage: React.FC = () => {
  const [viewMode, setViewMode] = useState<ViewMode>('cards');

  const handleViewModeChange = (
    event: React.MouseEvent<HTMLElement>,
    newViewMode: ViewMode | null,
  ) => {
    if (newViewMode !== null) {
      setViewMode(newViewMode);
    }
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
          <Grid container spacing={3} alignItems="center">
            <Grid item xs={12} md={6}>
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
                Services Miscellaneous
              </Typography>
              <Typography 
                variant="body1" 
                sx={{ 
                  color: '#666',
                  fontSize: '1.1rem',
                  fontWeight: 400
                }}
              >
                Gérez vos services divers avec une interface moderne et intuitive
              </Typography>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, flexWrap: 'wrap' }}>
                                 {/* View Mode Toggle avec indicateur visuel */}
                 <Paper 
                   elevation={0} 
                   sx={{ 
                     borderRadius: 2,
                     border: '1px solid #e0e0e0',
                     overflow: 'hidden',
                     position: 'relative'
                   }}
                 >
                   <Box sx={{ 
                     position: 'absolute', 
                     top: -8, 
                     left: '50%', 
                     transform: 'translateX(-50%)',
                     bgcolor: 'primary.main',
                     color: 'white',
                     px: 2,
                     py: 0.5,
                     borderRadius: 1,
                     fontSize: '0.7rem',
                     fontWeight: 600,
                     zIndex: 1
                   }}>
                     Mode d'affichage
                   </Box>
                   <ToggleButtonGroup
                     value={viewMode}
                     exclusive
                     onChange={handleViewModeChange}
                     aria-label="mode d'affichage"
                     size="small"
                     sx={{ mt: 1 }}
                   >
                     <ToggleButton 
                       value="cards" 
                       aria-label="affichage en cartes"
                       sx={{
                         px: 4,
                         py: 2,
                         fontWeight: 600,
                         '&.Mui-selected': {
                           background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                           color: 'white',
                           '&:hover': {
                             background: 'linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)',
                           }
                         },
                         '&:not(.Mui-selected)': {
                           color: '#666',
                           '&:hover': {
                             bgcolor: 'rgba(102, 126, 234, 0.1)',
                             color: '#333'
                           }
                         }
                       }}
                     >
                       <ViewModuleIcon sx={{ mr: 1.5, fontSize: 20 }} />
                       Cartes
                     </ToggleButton>
                     <ToggleButton 
                       value="list" 
                       aria-label="affichage en liste"
                       sx={{
                         px: 4,
                         py: 2,
                         fontWeight: 600,
                         '&.Mui-selected': {
                           background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                           color: 'white',
                           '&:hover': {
                             background: 'linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)',
                           }
                         },
                         '&:not(.Mui-selected)': {
                           color: '#666',
                           '&:hover': {
                             bgcolor: 'rgba(102, 126, 234, 0.1)',
                             color: '#333'
                           }
                         }
                       }}
                     >
                       <ViewListIcon sx={{ mr: 1.5, fontSize: 20 }} />
                       Liste
                     </ToggleButton>
                   </ToggleButtonGroup>
                 </Paper>

                {/* Action Buttons */}
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Tooltip title="Rechercher">
                    <IconButton 
                      sx={{ 
                        bgcolor: 'rgba(255, 255, 255, 0.8)',
                        '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.9)' }
                      }}
                    >
                      <SearchIcon />
                    </IconButton>
                  </Tooltip>
                  
                  <Tooltip title="Filtrer">
                    <IconButton 
                      sx={{ 
                        bgcolor: 'rgba(255, 255, 255, 0.8)',
                        '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.9)' }
                      }}
                    >
                      <FilterIcon />
                    </IconButton>
                  </Tooltip>
                  
                  <Tooltip title="Actualiser">
                    <IconButton 
                      sx={{ 
                        bgcolor: 'rgba(255, 255, 255, 0.8)',
                        '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.9)' }
                      }}
                    >
                      <RefreshIcon />
                    </IconButton>
                  </Tooltip>
                  
                  <Button
                    variant="contained"
                    startIcon={<AddIcon />}
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
                    Nouveau Service
                  </Button>
                </Box>
              </Box>
            </Grid>
          </Grid>
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
                  24
                </Typography>
                <Typography variant="body2" sx={{ color: '#666' }}>
                  Services Actifs
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
                  8
                </Typography>
                <Typography variant="body2" sx={{ color: '#666' }}>
                  Fournisseurs
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
                  12
                </Typography>
                <Typography variant="body2" sx={{ color: '#666' }}>
                  Types de Services
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
                  156
                </Typography>
                <Typography variant="body2" sx={{ color: '#666' }}>
                  Requêtes ce Mois
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
                  {viewMode === 'cards' ? '📋 Services en Cartes' : '📊 Services en Liste'}
                </Typography>
                <Typography variant="body2" sx={{ color: '#666', mt: 0.5 }}>
                  {viewMode === 'cards' 
                    ? 'Vue détaillée avec cartes interactives' 
                    : 'Vue compacte en tableau pour une navigation rapide'
                  }
                </Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, flexWrap: 'wrap' }}>
                  <TextField
                    size="small"
                    placeholder="Rechercher un service..."
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
                  <Chip 
                    label={`${viewMode === 'cards' ? 'Mode Cartes' : 'Mode Liste'} actif`} 
                    color="primary" 
                    variant="outlined"
                    sx={{ fontWeight: 600 }}
                  />
                </Box>
              </Grid>
            </Grid>
          </Box>
          
          <Box sx={{ p: 3 }}>
            <MiscellaneousList viewMode={viewMode} />
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};

export default MiscellaneousPage; 