import React, { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Button,
  Grid,
  Card,
  CardContent,
  CardActions,
  Chip,
  IconButton,
  Tooltip,
  TextField,
  InputAdornment,
  Tabs,
  Tab,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  CircularProgress,
  Fab,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Avatar,
  Divider,
  Badge,
  Skeleton,
  Fade,
  Slide
} from '@mui/material';
import {
  Add as AddIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
  MoreVert as MoreVertIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Preview as PreviewIcon,
  ContentCopy as CopyIcon,
  Visibility as ViewIcon,
  AutoAwesome as AutoAwesomeIcon,
  Email as EmailIcon,
  Code as CodeIcon,
  Settings as SettingsIcon,
  Star as StarIcon,
  StarBorder as StarBorderIcon,
  TrendingUp as TrendingUpIcon,
  Error as ErrorIcon,
  CheckCircle as CheckCircleIcon,
  Person as PersonIcon,
  Schedule as ScheduleIcon,
  Palette as PaletteIcon,
  AutoAwesome as SparklesIcon
} from '@mui/icons-material';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { enqueueSnackbar } from 'notistack';
import { 
  getApiEmailTemplateOptions,
  deleteApiEmailTemplateByIdMutation
} from '../api/@tanstack/react-query.gen';
import EmailTemplateForm from '../components/EmailTemplateForm';
import SimpleTemplateCreator from '../components/SimpleTemplateCreator';
import EmailTemplatePreview from '../components/EmailTemplatePreview';
import EmailTemplateStats from '../components/EmailTemplateStats';
import EmailTemplateHistory from '../components/EmailTemplateHistory';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`templates-tabpanel-${index}`}
      aria-labelledby={`templates-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

const EmailTemplatesPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState<any>(null);
  const [openForm, setOpenForm] = useState(false);
  const [openSimpleCreator, setOpenSimpleCreator] = useState(false);
  const [openPreview, setOpenPreview] = useState(false);
  const [openStats, setOpenStats] = useState(false);
  const [openHistory, setOpenHistory] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedTemplateForMenu, setSelectedTemplateForMenu] = useState<any>(null);

  // Query pour récupérer les templates
  const { 
    data: templates, 
    isLoading, 
    error 
  } = useQuery(getApiEmailTemplateOptions());

  // Mutations
  const deleteMutation = useMutation(deleteApiEmailTemplateByIdMutation());

  // Helper function pour extraire les données de l'API
  const safeExtractArray = (data: any): any[] => {
    let result: any[] = [];
    
    // Avec le nouveau SDK, l'API doit retourner un tableau direct selon le Swagger
    if (Array.isArray(data)) {
      result = data;
    } else if (data?.data && Array.isArray(data.data)) {
      // Support legacy pour l'ancienne API qui retournait { data: [] }
      result = data.data;
    } else if (data && typeof data === 'object') {
      // Recherche dans toutes les propriétés de l'objet
      const allKeys = Object.keys(data);
      
      for (const key of allKeys) {
        if (Array.isArray(data[key]) && data[key].length > 0) {
          result = data[key];
          break;
        }
      }
      
      if (result.length === 0) {
        // Essayer avec des tableaux vides aussi
        for (const key of allKeys) {
          if (Array.isArray(data[key])) {
            result = data[key];
            break;
          }
        }
      }
    }
    
    return result;
  };

  const templatesArray = safeExtractArray(templates);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const handleCreateTemplate = () => {
    setOpenSimpleCreator(true);
  };

  const handleEditTemplate = (template: any) => {
    setSelectedTemplate(template);
    setOpenForm(true);
  };

  const handlePreviewTemplate = (template: any) => {
    setSelectedTemplate(template);
    setOpenPreview(true);
  };

  const handleViewStats = (template: any) => {
    setSelectedTemplate(template);
    setOpenStats(true);
  };

  const handleViewHistory = (template: any) => {
    setSelectedTemplate(template);
    setOpenHistory(true);
  };

  const handleDeleteTemplate = async (templateId: string) => {
    try {
      await deleteMutation.mutateAsync({
        path: { id: templateId }
      });
      enqueueSnackbar('Template supprimé avec succès!', { variant: 'success' });
      queryClient.invalidateQueries({ queryKey: ['getApiEmailTemplate'] });
    } catch (error) {
      enqueueSnackbar('Erreur lors de la suppression du template', { variant: 'error' });
    }
  };

  const handleDuplicateTemplate = async (templateId: string, newName: string) => {
    try {
      // TODO: Implement duplicate functionality
      enqueueSnackbar('Fonctionnalité de duplication à implémenter', { variant: 'info' });
    } catch (error) {
      enqueueSnackbar('Erreur lors de la duplication du template', { variant: 'error' });
    }
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, template: any) => {
    setAnchorEl(event.currentTarget);
    setSelectedTemplateForMenu(template);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedTemplateForMenu(null);
  };

  const getTemplateStatusColor = (template: any) => {
    if (template.isActive) return 'success';
    if (template.isDraft) return 'warning';
    return 'default';
  };

  const getTemplateStatusIcon = (template: any) => {
    if (template.isActive) return <CheckCircleIcon />;
    if (template.isDraft) return <ErrorIcon />;
    return <ScheduleIcon />;
  };

  const filteredTemplates = templatesArray.filter((template: any) =>
    template.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    template.subject?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    template.author?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">
          Erreur lors du chargement des templates: {error.message}
        </Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ 
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      position: 'relative',
      '&::before': {
        content: '""',
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'url("data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23ffffff" fill-opacity="0.05"%3E%3Ccircle cx="30" cy="30" r="2"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
        pointerEvents: 'none'
      }
    }}>
      {/* Header moderne avec glassmorphism */}
      <Box sx={{
        position: 'relative',
        background: 'rgba(255, 255, 255, 0.1)',
        backdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.2)',
        p: 4
      }}>
        <Box sx={{ maxWidth: 1400, mx: 'auto' }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Box>
              <Typography variant="h3" sx={{ 
                fontWeight: 700, 
                color: 'white',
                textShadow: '0 2px 4px rgba(0,0,0,0.3)',
                display: 'flex',
                alignItems: 'center',
                gap: 2
              }}>
                <SparklesIcon sx={{ fontSize: 40 }} />
                Gestion des Templates
              </Typography>
              <Typography variant="h6" sx={{ 
                color: 'rgba(255,255,255,0.8)', 
                fontWeight: 300,
                mt: 1
              }}>
                Créez et gérez vos templates d'email avec style
              </Typography>
            </Box>
            
            <Button
              variant="contained"
              size="large"
              startIcon={<AddIcon />}
              onClick={handleCreateTemplate}
              sx={{
                background: 'linear-gradient(45deg, #ff6b6b 30%, #ee5a24 90%)',
                boxShadow: '0 8px 32px rgba(255, 107, 107, 0.4)',
                borderRadius: 3,
                px: 4,
                py: 1.5,
                fontSize: '1.1rem',
                fontWeight: 600,
                textTransform: 'none',
                '&:hover': {
                  background: 'linear-gradient(45deg, #ee5a24 30%, #ff6b6b 90%)',
                  transform: 'translateY(-2px)',
                  boxShadow: '0 12px 40px rgba(255, 107, 107, 0.6)'
                },
                transition: 'all 0.3s ease'
              }}
            >
              + Nouveau Template
            </Button>
          </Box>

          {/* Barre de recherche moderne */}
          <Box sx={{ 
            position: 'relative',
            maxWidth: 600,
            mx: 'auto'
          }}>
            <TextField
              fullWidth
              placeholder="Rechercher des templates..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon sx={{ color: 'rgba(255,255,255,0.7)' }} />
                  </InputAdornment>
                ),
                sx: {
                  background: 'rgba(255, 255, 255, 0.15)',
                  borderRadius: 3,
                  '& .MuiOutlinedInput-root': {
                    color: 'white',
                    '& fieldset': {
                      borderColor: 'rgba(255,255,255,0.3)',
                    },
                    '&:hover fieldset': {
                      borderColor: 'rgba(255,255,255,0.5)',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: 'rgba(255,255,255,0.8)',
                    },
                  },
                  '& .MuiInputBase-input::placeholder': {
                    color: 'rgba(255,255,255,0.7)',
                    opacity: 1
                  }
                }
              }}
            />
          </Box>
        </Box>
      </Box>

      {/* Contenu principal */}
      <Box sx={{ 
        maxWidth: 1400, 
        mx: 'auto', 
        p: 4,
        position: 'relative',
        zIndex: 1
      }}>
        {/* Statistiques rapides */}
        <Box sx={{ 
          display: 'flex', 
          gap: 3, 
          mb: 4,
          flexWrap: 'wrap'
        }}>
          <Paper sx={{
            background: 'rgba(255, 255, 255, 0.1)',
            backdropFilter: 'blur(20px)',
            borderRadius: 3,
            p: 3,
            flex: 1,
            minWidth: 200,
            border: '1px solid rgba(255, 255, 255, 0.2)',
            transition: 'all 0.3s ease',
            '&:hover': {
              transform: 'translateY(-4px)',
              boxShadow: '0 12px 40px rgba(0,0,0,0.2)'
            }
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Avatar sx={{ 
                background: 'linear-gradient(45deg, #667eea 30%, #764ba2 90%)',
                width: 48,
                height: 48
              }}>
                <EmailIcon />
              </Avatar>
              <Box>
                <Typography variant="h4" sx={{ color: 'white', fontWeight: 700 }}>
                  {templatesArray.length}
                </Typography>
                <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)' }}>
                  Templates créés
                </Typography>
              </Box>
            </Box>
          </Paper>

          <Paper sx={{
            background: 'rgba(255, 255, 255, 0.1)',
            backdropFilter: 'blur(20px)',
            borderRadius: 3,
            p: 3,
            flex: 1,
            minWidth: 200,
            border: '1px solid rgba(255, 255, 255, 0.2)',
            transition: 'all 0.3s ease',
            '&:hover': {
              transform: 'translateY(-4px)',
              boxShadow: '0 12px 40px rgba(0,0,0,0.2)'
            }
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Avatar sx={{ 
                background: 'linear-gradient(45deg, #ff6b6b 30%, #ee5a24 90%)',
                width: 48,
                height: 48
              }}>
                <TrendingUpIcon />
              </Avatar>
              <Box>
                <Typography variant="h4" sx={{ color: 'white', fontWeight: 700 }}>
                  {templatesArray.filter((t: any) => t.isActive).length}
                </Typography>
                <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)' }}>
                  Templates actifs
                </Typography>
              </Box>
            </Box>
          </Paper>

          <Paper sx={{
            background: 'rgba(255, 255, 255, 0.1)',
            backdropFilter: 'blur(20px)',
            borderRadius: 3,
            p: 3,
            flex: 1,
            minWidth: 200,
            border: '1px solid rgba(255, 255, 255, 0.2)',
            transition: 'all 0.3s ease',
            '&:hover': {
              transform: 'translateY(-4px)',
              boxShadow: '0 12px 40px rgba(0,0,0,0.2)'
            }
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Avatar sx={{ 
                background: 'linear-gradient(45deg, #4ecdc4 30%, #44a08d 90%)',
                width: 48,
                height: 48
              }}>
                <CheckCircleIcon />
              </Avatar>
              <Box>
                <Typography variant="h4" sx={{ color: 'white', fontWeight: 700 }}>
                  {templatesArray.reduce((acc: number, t: any) => acc + (t.usageCount || 0), 0)}
                </Typography>
                <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)' }}>
                  Utilisations totales
                </Typography>
              </Box>
            </Box>
          </Paper>
        </Box>

        {/* Grille de templates moderne */}
        {isLoading ? (
          <Grid container spacing={3}>
            {[1, 2, 3, 4, 5, 6].map((item) => (
              <Grid item xs={12} sm={6} md={4} key={item}>
                <Paper sx={{
                  background: 'rgba(255, 255, 255, 0.1)',
                  backdropFilter: 'blur(20px)',
                  borderRadius: 3,
                  p: 3,
                  height: 280,
                  border: '1px solid rgba(255, 255, 255, 0.2)'
                }}>
                  <Skeleton variant="rectangular" height={120} sx={{ borderRadius: 2, mb: 2 }} />
                  <Skeleton variant="text" width="60%" height={32} />
                  <Skeleton variant="text" width="40%" height={24} />
                  <Skeleton variant="text" width="80%" height={20} />
                </Paper>
              </Grid>
            ))}
          </Grid>
        ) : (
          <Grid container spacing={3}>
            {filteredTemplates.map((template: any, index: number) => (
              <Grid item xs={12} sm={6} md={4} key={template.id}>
                <Fade in timeout={300 + index * 100}>
                  <Paper sx={{
                    background: 'rgba(255, 255, 255, 0.1)',
                    backdropFilter: 'blur(20px)',
                    borderRadius: 3,
                    p: 3,
                    height: 280,
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    transition: 'all 0.3s ease',
                    cursor: 'pointer',
                    position: 'relative',
                    overflow: 'hidden',
                    '&::before': {
                      content: '""',
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      height: 4,
                      background: `linear-gradient(90deg, ${template.isActive ? '#4ecdc4' : '#ff6b6b'} 0%, ${template.isActive ? '#44a08d' : '#ee5a24'} 100%)`
                    },
                    '&:hover': {
                      transform: 'translateY(-8px)',
                      boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
                      '& .template-actions': {
                        opacity: 1,
                        transform: 'translateY(0)'
                      }
                    }
                  }}>
                    {/* Header de la carte */}
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="h6" sx={{ 
                          color: 'white', 
                          fontWeight: 600,
                          mb: 0.5,
                          display: 'flex',
                          alignItems: 'center',
                          gap: 1
                        }}>
                          {template.name}
                          {template.isActive && (
                            <CheckCircleIcon sx={{ color: '#4ecdc4', fontSize: 20 }} />
                          )}
                        </Typography>
                        <Typography variant="body2" sx={{ 
                          color: 'rgba(255,255,255,0.7)',
                          mb: 1
                        }}>
                          {template.subject}
                        </Typography>
                      </Box>
                      
                      <IconButton
                        size="small"
                        onClick={(e) => handleMenuOpen(e, template)}
                        sx={{ color: 'rgba(255,255,255,0.7)' }}
                      >
                        <MoreVertIcon />
                      </IconButton>
                    </Box>

                    {/* Tags */}
                    <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
                      {template.supportedObjectTypes?.slice(0, 3).map((type: string, idx: number) => (
                        <Chip
                          key={idx}
                          label={type}
                          size="small"
                          sx={{
                            background: 'rgba(255,255,255,0.2)',
                            color: 'white',
                            fontSize: '0.7rem',
                            height: 24
                          }}
                        />
                      ))}
                      {template.supportedObjectTypes?.length > 3 && (
                        <Chip
                          label={`+${template.supportedObjectTypes.length - 3}`}
                          size="small"
                          sx={{
                            background: 'rgba(255,255,255,0.1)',
                            color: 'rgba(255,255,255,0.7)',
                            fontSize: '0.7rem',
                            height: 24
                          }}
                        />
                      )}
                    </Box>

                    {/* Informations */}
                    <Box sx={{ mb: 2 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                        <PersonIcon sx={{ fontSize: 16, color: 'rgba(255,255,255,0.6)' }} />
                        <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.8)' }}>
                          {template.author || 'Auteur inconnu'}
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <TrendingUpIcon sx={{ fontSize: 16, color: 'rgba(255,255,255,0.6)' }} />
                        <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.8)' }}>
                          {template.usageCount || 0} utilisations
                        </Typography>
                      </Box>
                    </Box>

                    {/* Actions */}
                    <Box className="template-actions" sx={{
                      opacity: 0,
                      transform: 'translateY(10px)',
                      transition: 'all 0.3s ease',
                      display: 'flex',
                      gap: 1
                    }}>
                      <Button
                        size="small"
                        variant="outlined"
                        startIcon={<PreviewIcon />}
                        onClick={() => handlePreviewTemplate(template)}
                        sx={{
                          color: 'white',
                          borderColor: 'rgba(255,255,255,0.3)',
                          '&:hover': {
                            borderColor: 'white',
                            background: 'rgba(255,255,255,0.1)'
                          }
                        }}
                      >
                        Aperçu
                      </Button>
                      <Button
                        size="small"
                        variant="contained"
                        startIcon={<EditIcon />}
                        onClick={() => handleEditTemplate(template)}
                        sx={{
                          background: 'linear-gradient(45deg, #667eea 30%, #764ba2 90%)',
                          '&:hover': {
                            background: 'linear-gradient(45deg, #764ba2 30%, #667eea 90%)'
                          }
                        }}
                      >
                        Modifier
                      </Button>
                    </Box>
                  </Paper>
                </Fade>
              </Grid>
            ))}
          </Grid>
        )}

        {/* Message si aucun template */}
        {!isLoading && filteredTemplates.length === 0 && (
          <Box sx={{ 
            textAlign: 'center', 
            py: 8,
            background: 'rgba(255, 255, 255, 0.1)',
            backdropFilter: 'blur(20px)',
            borderRadius: 3,
            border: '1px solid rgba(255, 255, 255, 0.2)'
          }}>
            <PaletteIcon sx={{ fontSize: 80, color: 'rgba(255,255,255,0.3)', mb: 2 }} />
            <Typography variant="h5" sx={{ color: 'white', mb: 1 }}>
              Aucun template trouvé
            </Typography>
            <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.7)', mb: 3 }}>
              {searchTerm ? 'Aucun template ne correspond à votre recherche.' : 'Commencez par créer votre premier template !'}
            </Typography>
            <Button
              variant="contained"
              size="large"
              startIcon={<AddIcon />}
              onClick={handleCreateTemplate}
              sx={{
                background: 'linear-gradient(45deg, #ff6b6b 30%, #ee5a24 90%)',
                boxShadow: '0 8px 32px rgba(255, 107, 107, 0.4)',
                borderRadius: 3,
                px: 4,
                py: 1.5,
                fontSize: '1.1rem',
                fontWeight: 600,
                textTransform: 'none',
                '&:hover': {
                  background: 'linear-gradient(45deg, #ee5a24 30%, #ff6b6b 90%)',
                  transform: 'translateY(-2px)',
                  boxShadow: '0 12px 40px rgba(255, 107, 107, 0.6)'
                }
              }}
            >
              Créer un template
            </Button>
          </Box>
        )}
      </Box>

      {/* Menu contextuel */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        PaperProps={{
          sx: {
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(20px)',
            borderRadius: 2,
            boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
            border: '1px solid rgba(255, 255, 255, 0.2)'
          }
        }}
      >
        <MenuItem onClick={() => {
          handleEditTemplate(selectedTemplateForMenu);
          handleMenuClose();
        }}>
          <ListItemIcon>
            <EditIcon />
          </ListItemIcon>
          <ListItemText>Modifier</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => {
          handlePreviewTemplate(selectedTemplateForMenu);
          handleMenuClose();
        }}>
          <ListItemIcon>
            <PreviewIcon />
          </ListItemIcon>
          <ListItemText>Aperçu</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => {
          handleViewStats(selectedTemplateForMenu);
          handleMenuClose();
        }}>
          <ListItemIcon>
            <TrendingUpIcon />
          </ListItemIcon>
          <ListItemText>Statistiques</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => {
          handleViewHistory(selectedTemplateForMenu);
          handleMenuClose();
        }}>
          <ListItemIcon>
            <ScheduleIcon />
          </ListItemIcon>
          <ListItemText>Historique</ListItemText>
        </MenuItem>
        <Divider />
        <MenuItem onClick={() => {
          handleDuplicateTemplate(selectedTemplateForMenu?.id, `${selectedTemplateForMenu?.name} (copie)`);
          handleMenuClose();
        }}>
          <ListItemIcon>
            <CopyIcon />
          </ListItemIcon>
          <ListItemText>Dupliquer</ListItemText>
        </MenuItem>
        <MenuItem 
          onClick={() => {
            handleDeleteTemplate(selectedTemplateForMenu?.id);
            handleMenuClose();
          }}
          sx={{ color: 'error.main' }}
        >
          <ListItemIcon>
            <DeleteIcon color="error" />
          </ListItemIcon>
          <ListItemText>Supprimer</ListItemText>
        </MenuItem>
      </Menu>

      {/* Modals */}
      <SimpleTemplateCreator
        open={openSimpleCreator}
        onClose={() => setOpenSimpleCreator(false)}
        onSuccess={() => {
          setOpenSimpleCreator(false);
          queryClient.invalidateQueries({ queryKey: ['getApiEmailTemplate'] });
        }}
      />

      <Dialog
        open={openForm}
        onClose={() => setOpenForm(false)}
        maxWidth="lg"
        fullWidth
        PaperProps={{
          sx: {
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(20px)',
            borderRadius: 3,
            boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
          }
        }}
      >
        <DialogContent sx={{ p: 0 }}>
          <EmailTemplateForm
            template={selectedTemplate}
            onSuccess={() => {
              setOpenForm(false);
              setSelectedTemplate(null);
              queryClient.invalidateQueries({ queryKey: ['getApiEmailTemplate'] });
            }}
            onCancel={() => {
              setOpenForm(false);
              setSelectedTemplate(null);
            }}
          />
        </DialogContent>
      </Dialog>

      <Dialog
        open={openPreview}
        onClose={() => setOpenPreview(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(20px)',
            borderRadius: 3,
            boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
          }
        }}
      >
                 <DialogContent sx={{ p: 0 }}>
           <EmailTemplatePreview
             template={selectedTemplate}
           />
         </DialogContent>
      </Dialog>

      <Dialog
        open={openStats}
        onClose={() => setOpenStats(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(20px)',
            borderRadius: 3,
            boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
          }
        }}
      >
                 <DialogContent sx={{ p: 0 }}>
           <EmailTemplateStats
             template={selectedTemplate}
           />
         </DialogContent>
      </Dialog>

      <Dialog
        open={openHistory}
        onClose={() => setOpenHistory(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(20px)',
            borderRadius: 3,
            boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
          }
        }}
      >
                 <DialogContent sx={{ p: 0 }}>
           <EmailTemplateHistory
             template={selectedTemplate}
           />
         </DialogContent>
      </Dialog>
    </Box>
  );
};

export default EmailTemplatesPage; 