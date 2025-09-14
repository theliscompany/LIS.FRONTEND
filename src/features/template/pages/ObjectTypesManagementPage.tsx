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
  Alert,
  CircularProgress,
  Fab,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Avatar,
  Skeleton,
  Fade,
  Slide,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow
} from '@mui/material';
import {
  Add as AddIcon,
  Search as SearchIcon,
  MoreVert as MoreVertIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Code as CodeIcon,
  Settings as SettingsIcon,
  AutoAwesome as AutoAwesomeIcon,
  Schema as SchemaIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Info as InfoIcon,
  TrendingUp as TrendingUpIcon,
  Person as PersonIcon,
  Assignment as AssignmentIcon,
  Download as DownloadIcon,
  Visibility as VisibilityIcon,
  Close as CloseIcon
} from '@mui/icons-material';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { enqueueSnackbar } from 'notistack';
import { 
  getApiEmailTemplateObjectTypesOptions,
  deleteApiEmailTemplateObjectTypesByTypeNameMutation,
  postApiEmailTemplateObjectTypesMutation
} from '../api/@tanstack/react-query.gen';
import { ObjectSchema } from '../api/types.gen';
import SimpleObjectTypeCreator from '../components/SimpleObjectTypeCreator';
import JsonSchemaImporter from '../components/JsonSchemaImporter';
import { SDKDetectionModal } from '../components/SDKDetectionModal';
import { DetectedObjectType } from '../services/sdkAnalyzer';

const ObjectTypesManagementPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedObjectType, setSelectedObjectType] = useState<ObjectSchema | null>(null);
  const [openSimpleCreator, setOpenSimpleCreator] = useState(false);
  const [openJsonImporter, setOpenJsonImporter] = useState(false);
  const [openSDKDetection, setOpenSDKDetection] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedObjectTypeForMenu, setSelectedObjectTypeForMenu] = useState<ObjectSchema | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [openPropertiesDialog, setOpenPropertiesDialog] = useState(false);
  const [selectedObjectTypeForProperties, setSelectedObjectTypeForProperties] = useState<ObjectSchema | null>(null);

  // Query pour récupérer les types d'objets
  const { 
    data: objectTypes, 
    isLoading, 
    error 
  } = useQuery(getApiEmailTemplateObjectTypesOptions());

  // Mutations
  const deleteMutation = useMutation(deleteApiEmailTemplateObjectTypesByTypeNameMutation());
  const createObjectTypeMutation = useMutation(postApiEmailTemplateObjectTypesMutation());

  // Helper function pour extraire les données de l'API
  const safeExtractArray = (data: any): ObjectSchema[] => {
    let result: ObjectSchema[] = [];
    
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

  const objectTypesArray = safeExtractArray(objectTypes);

  const handleCreateObjectType = () => {
    setEditMode(false);
    setSelectedObjectType(null);
    setOpenSimpleCreator(true);
  };

  const handleEditObjectType = (objectType: ObjectSchema) => {
    setEditMode(true);
    setSelectedObjectType(objectType);
    setOpenSimpleCreator(true);
  };

  const handleDeleteObjectType = async (typeName: string) => {
    try {
      await deleteMutation.mutateAsync({
        path: { typeName }
      });
      enqueueSnackbar('Type d\'objet supprimé avec succès!', { variant: 'success' });
      queryClient.invalidateQueries({ queryKey: ['getApiEmailTemplateObjectTypesOptions'] });
    } catch (error) {
      enqueueSnackbar('Erreur lors de la suppression du type d\'objet', { variant: 'error' });
    }
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, objectType: ObjectSchema) => {
    setAnchorEl(event.currentTarget);
    setSelectedObjectTypeForMenu(objectType);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedObjectTypeForMenu(null);
  };

  const handleCloseCreator = () => {
    setOpenSimpleCreator(false);
    setSelectedObjectType(null);
    setEditMode(false);
  };

  const handleCreatorSuccess = () => {
    setOpenSimpleCreator(false);
    setSelectedObjectType(null);
    setEditMode(false);
    queryClient.invalidateQueries({ queryKey: ['getApiEmailTemplateObjectTypesOptions'] });
    enqueueSnackbar('Type d\'objet créé avec succès!', { variant: 'success' });
  };

  const handleImportDetectedTypes = async (detectedTypes: DetectedObjectType[]) => {
    try {
      for (const detectedType of detectedTypes) {
        // Convertir DetectedObjectType en ObjectSchemaDTO
        const properties: Record<string, any> = {};
        Object.entries(detectedType.properties).forEach(([key, prop]) => {
          properties[key] = {
            name: key,
            type: prop.type,
            isRequired: prop.required,
            description: prop.description || '',
            defaultValue: undefined,
            format: undefined,
            allowedValues: undefined
          };
        });

        const objectTypePayload = {
          typeName: detectedType.typeName,
          description: detectedType.description,
          isRequired: false,
          properties
        };

        console.log('Payload pour import SDK:', objectTypePayload);

        const payload = {
          body: objectTypePayload
        };

        console.log('Payload final pour import SDK:', payload);

        await createObjectTypeMutation.mutateAsync(payload);
      }
      
      enqueueSnackbar(`${detectedTypes.length} type(s) d'objet importé(s) avec succès!`, { variant: 'success' });
      queryClient.invalidateQueries({ queryKey: ['getApiEmailTemplateObjectTypesOptions'] });
    } catch (error) {
      console.error('Erreur détaillée lors de l\'import des types d\'objets:', error);
      enqueueSnackbar('Erreur lors de l\'import des types d\'objets', { variant: 'error' });
    }
  };

  const handleViewProperties = (objectType: ObjectSchema) => {
    setSelectedObjectTypeForProperties(objectType);
    setOpenPropertiesDialog(true);
  };

  const handleClosePropertiesDialog = () => {
    setOpenPropertiesDialog(false);
    setSelectedObjectTypeForProperties(null);
  };

  const getObjectTypeStatusColor = (objectType: ObjectSchema) => {
    if (objectType.isRequired) return 'error';
    if (Object.keys(objectType.properties || {}).length > 5) return 'success';
    return 'default';
  };

  const getObjectTypeStatusIcon = (objectType: ObjectSchema) => {
    if (objectType.isRequired) return <ErrorIcon />;
    if (Object.keys(objectType.properties || {}).length > 5) return <CheckCircleIcon />;
    return <InfoIcon />;
  };

  const filteredObjectTypes = objectTypesArray.filter((objectType: ObjectSchema) =>
    objectType.typeName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    objectType.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
                <SchemaIcon sx={{ fontSize: 40 }} />
                Types d'Objets
              </Typography>
              <Typography variant="h6" sx={{ 
                color: 'rgba(255,255,255,0.8)', 
                fontWeight: 300,
                mt: 1
              }}>
                Définissez les schémas d'objets pour vos templates
              </Typography>
            </Box>
            
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button
                variant="outlined"
                size="large"
                startIcon={<DownloadIcon />}
                onClick={() => setOpenSDKDetection(true)}
                sx={{
                  color: 'white',
                  borderColor: 'rgba(255,255,255,0.3)',
                  '&:hover': {
                    borderColor: 'white',
                    background: 'rgba(255,255,255,0.1)'
                  }
                }}
              >
                Détecter depuis SDKs
              </Button>
              <Button
                variant="outlined"
                size="large"
                startIcon={<CodeIcon />}
                onClick={() => setOpenJsonImporter(true)}
                sx={{
                  color: 'white',
                  borderColor: 'rgba(255,255,255,0.3)',
                  '&:hover': {
                    borderColor: 'white',
                    background: 'rgba(255,255,255,0.1)'
                  }
                }}
              >
                Importer JSON
              </Button>
              <Button
                variant="contained"
                size="large"
                startIcon={<AddIcon />}
                onClick={handleCreateObjectType}
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
                + Nouveau Type
              </Button>
            </Box>
          </Box>

          {/* Barre de recherche moderne */}
          <Box sx={{ 
            position: 'relative',
            maxWidth: 600,
            mx: 'auto'
          }}>
            <TextField
              fullWidth
              placeholder="Rechercher des types d'objets..."
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
                <SchemaIcon />
              </Avatar>
              <Box>
                <Typography variant="h4" sx={{ color: 'white', fontWeight: 700 }}>
                  {objectTypesArray.length}
                </Typography>
                <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)' }}>
                  Types créés
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
                background: 'linear-gradient(45deg, #10b981 30%, #059669 90%)',
                width: 48,
                height: 48
              }}>
                <ErrorIcon />
              </Avatar>
              <Box>
                <Typography variant="h4" sx={{ color: 'white', fontWeight: 700 }}>
                  {objectTypesArray.filter((ot: ObjectSchema) => ot.isRequired).length}
                </Typography>
                <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)' }}>
                  Types requis
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
                background: 'linear-gradient(45deg, #059669 30%, #047857 90%)',
                width: 48,
                height: 48
              }}>
                <CheckCircleIcon />
              </Avatar>
              <Box>
                <Typography variant="h4" sx={{ color: 'white', fontWeight: 700 }}>
                  {objectTypesArray.filter((ot: ObjectSchema) => Object.keys(ot.properties || {}).length > 5).length}
                </Typography>
                <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)' }}>
                  Types complexes
                </Typography>
              </Box>
            </Box>
          </Paper>
        </Box>

              {/* Grille de types d'objets moderne */}
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
        ) : error ? (
          <Alert severity="error">
            Erreur lors du chargement des types d'objets
          </Alert>
        ) : (
          <Grid container spacing={3}>
            {filteredObjectTypes.map((objectType: ObjectSchema, index: number) => (
              <Grid item xs={12} sm={6} md={4} key={objectType.id}>
                <Fade in timeout={300 + index * 100}>
                  <Paper sx={{
                    background: 'rgba(16, 185, 129, 0.05)',
                    backdropFilter: 'blur(20px)',
                    borderRadius: 3,
                    p: 3,
                    height: 320,
                    border: '1px solid rgba(16, 185, 129, 0.2)',
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
                      background: `linear-gradient(90deg, ${objectType.isRequired ? '#10b981' : '#059669'} 0%, ${objectType.isRequired ? '#047857' : '#065f46'} 100%)`
                    },
                    '&:hover': {
                      transform: 'translateY(-8px)',
                      boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
                      '& .object-type-actions': {
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
                          {objectType.typeName}
                          {objectType.isRequired && (
                            <ErrorIcon sx={{ color: '#10b981', fontSize: 20 }} />
                          )}
                        </Typography>
                        <Typography variant="body2" sx={{ 
                          color: 'rgba(255,255,255,0.7)',
                          mb: 1
                        }}>
                          {objectType.description || 'Aucune description'}
                        </Typography>
                      </Box>
                      
                      <IconButton
                        size="small"
                        onClick={(e) => handleMenuOpen(e, objectType)}
                        sx={{ color: 'rgba(255,255,255,0.7)' }}
                      >
                        <MoreVertIcon />
                      </IconButton>
                    </Box>

                    {/* Tags */}
                    <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap', alignItems: 'center' }}>
                      <Chip 
                        label={`${Object.keys(objectType.properties || {}).length} propriétés`} 
                        size="small"
                        sx={{
                          background: 'rgba(255,255,255,0.25)',
                          color: 'white',
                          fontSize: '0.7rem',
                          height: 26,
                          fontWeight: 600,
                          border: '1px solid rgba(255,255,255,0.3)'
                        }}
                      />
                      {objectType.isRequired && (
                        <Chip 
                          label="Requis" 
                          size="small"
                          sx={{
                            background: 'rgba(16, 185, 129, 0.4)',
                            color: '#10b981',
                            fontSize: '0.7rem',
                            height: 26,
                            fontWeight: 600,
                            border: '1px solid rgba(16, 185, 129, 0.5)'
                          }}
                        />
                      )}
                      {Object.keys(objectType.properties || {}).length > 5 && (
                        <Chip 
                          label="Complexe" 
                          size="small"
                          sx={{
                            background: 'rgba(5, 150, 105, 0.4)',
                            color: '#059669',
                            fontSize: '0.7rem',
                            height: 26,
                            fontWeight: 600,
                            border: '1px solid rgba(5, 150, 105, 0.5)'
                          }}
                        />
                      )}
                    </Box>

                    {/* Propriétés */}
                    <Box sx={{ mb: 2, maxHeight: 100, overflow: 'auto' }}>
                      <Typography variant="body2" sx={{ 
                        color: 'rgba(255,255,255,0.8)', 
                        mb: 1, 
                        fontWeight: 500,
                        fontSize: '0.75rem'
                      }}>
                        Propriétés:
                      </Typography>
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                        {Object.entries(objectType.properties || {}).slice(0, 4).map(([key, prop]) => (
                          <Chip
                            key={key}
                            label={`${key}: ${prop.type}${prop.isRequired ? '' : '?'}`}
                            size="small"
                            sx={{
                              background: 'rgba(255,255,255,0.15)',
                              color: 'rgba(255,255,255,0.9)',
                              fontSize: '0.65rem',
                              height: 22,
                              '& .MuiChip-label': {
                                px: 1,
                                fontWeight: 500
                              },
                              border: '1px solid rgba(255,255,255,0.2)'
                            }}
                          />
                        ))}
                        {Object.keys(objectType.properties || {}).length > 4 && (
                          <Chip
                            label={`+${Object.keys(objectType.properties || {}).length - 4} autres`}
                            size="small"
                            sx={{
                              background: 'rgba(255,255,255,0.1)',
                              color: 'rgba(255,255,255,0.7)',
                              fontSize: '0.65rem',
                              height: 22,
                              fontStyle: 'italic'
                            }}
                          />
                        )}
                      </Box>
                    </Box>

                    {/* Actions */}
                    <Box className="object-type-actions" sx={{
                      opacity: 0,
                      transform: 'translateY(10px)',
                      transition: 'all 0.3s ease',
                      display: 'flex',
                      gap: 1,
                      flexWrap: 'wrap'
                    }}>
                      <Button
                        size="small"
                        variant="outlined"
                        startIcon={<VisibilityIcon />}
                        onClick={() => handleViewProperties(objectType)}
                        sx={{
                          color: 'white',
                          borderColor: 'rgba(255,255,255,0.3)',
                          '&:hover': {
                            borderColor: 'white',
                            background: 'rgba(255,255,255,0.1)'
                          }
                        }}
                      >
                        Voir détails
                      </Button>
                      <Button
                        size="small"
                        variant="outlined"
                        startIcon={<EditIcon />}
                        onClick={() => handleEditObjectType(objectType)}
                        sx={{
                          color: 'white',
                          borderColor: 'rgba(255,255,255,0.3)',
                          '&:hover': {
                            borderColor: 'white',
                            background: 'rgba(255,255,255,0.1)'
                          }
                        }}
                      >
                        Modifier
                      </Button>
                      <Button
                        size="small"
                        variant="contained"
                        startIcon={<DeleteIcon />}
                        onClick={() => handleDeleteObjectType(objectType.typeName || '')}
                        sx={{
                          background: 'linear-gradient(45deg, #ff6b6b 30%, #ee5a24 90%)',
                          '&:hover': {
                            background: 'linear-gradient(45deg, #ee5a24 30%, #ff6b6b 90%)'
                          }
                        }}
                      >
                        Supprimer
                      </Button>
                    </Box>
                  </Paper>
                </Fade>
              </Grid>
            ))}
          </Grid>
        )}

        {/* Message si aucun type d'objet */}
        {!isLoading && filteredObjectTypes.length === 0 && (
          <Paper sx={{
            background: 'rgba(255, 255, 255, 0.1)',
            backdropFilter: 'blur(20px)',
            borderRadius: 3,
            p: 6,
            textAlign: 'center',
            border: '1px solid rgba(255, 255, 255, 0.2)'
          }}>
            <AutoAwesomeIcon sx={{ 
              fontSize: 80, 
              color: 'rgba(255,255,255,0.6)', 
              mb: 3 
            }} />
            <Typography variant="h4" sx={{ 
              color: 'white',
              fontWeight: 600,
              mb: 2
            }}>
              Aucun type d'objet trouvé
            </Typography>
            <Typography variant="body1" sx={{ 
              color: 'rgba(255,255,255,0.8)',
              mb: 4,
              maxWidth: 500,
              mx: 'auto'
            }}>
              {searchTerm ? 'Aucun type d\'objet ne correspond à votre recherche.' : 'Commencez par créer votre premier type d\'objet pour définir les schémas de vos templates.'}
            </Typography>
            <Box sx={{ display: 'flex', gap: 3, justifyContent: 'center', flexWrap: 'wrap' }}>
              <Button
                variant="outlined"
                size="large"
                startIcon={<CodeIcon />}
                onClick={() => setOpenJsonImporter(true)}
                sx={{
                  color: 'white',
                  borderColor: 'rgba(255,255,255,0.3)',
                  px: 4,
                  py: 1.5,
                  '&:hover': {
                    borderColor: 'white',
                    background: 'rgba(255,255,255,0.1)'
                  }
                }}
              >
                Importer JSON
              </Button>
              <Button
                variant="contained"
                size="large"
                startIcon={<AddIcon />}
                onClick={handleCreateObjectType}
                sx={{
                  background: 'linear-gradient(45deg, #ff6b6b 30%, #ee5a24 90%)',
                  boxShadow: '0 8px 32px rgba(255, 107, 107, 0.4)',
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
                Créer un type
              </Button>
            </Box>
          </Paper>
        )}
      </Box>

      {/* Menu contextuel moderne */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        PaperProps={{
          sx: {
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(20px)',
            borderRadius: 2,
            border: '1px solid rgba(255, 255, 255, 0.2)',
            boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
            minWidth: 180
          }
        }}
      >
        <MenuItem onClick={() => {
          handleEditObjectType(selectedObjectTypeForMenu!);
          handleMenuClose();
        }}
        sx={{
          '&:hover': {
            background: 'rgba(102, 126, 234, 0.1)'
          }
        }}>
          <ListItemIcon>
            <EditIcon fontSize="small" sx={{ color: '#667eea' }} />
          </ListItemIcon>
          <ListItemText>Modifier</ListItemText>
        </MenuItem>
        <MenuItem 
          onClick={() => {
            handleDeleteObjectType(selectedObjectTypeForMenu?.typeName || '');
            handleMenuClose();
          }}
          sx={{ 
            color: '#ff6b6b',
            '&:hover': {
              background: 'rgba(255, 107, 107, 0.1)'
            }
          }}
        >
          <ListItemIcon>
            <DeleteIcon fontSize="small" sx={{ color: '#ff6b6b' }} />
          </ListItemIcon>
          <ListItemText>Supprimer</ListItemText>
        </MenuItem>
      </Menu>

      {/* Dialogs */}
      <SimpleObjectTypeCreator
        open={openSimpleCreator}
        onClose={handleCloseCreator}
        onSuccess={handleCreatorSuccess}
        editMode={editMode}
        objectTypeToEdit={selectedObjectType || undefined}
      />

      <JsonSchemaImporter
        open={openJsonImporter}
        onClose={() => setOpenJsonImporter(false)}
      />

      <SDKDetectionModal
        open={openSDKDetection}
        onClose={() => setOpenSDKDetection(false)}
        onImportTypes={handleImportDetectedTypes}
      />

      {/* Dialog pour afficher les propriétés détaillées */}
      <Dialog
        open={openPropertiesDialog}
        onClose={handleClosePropertiesDialog}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(20px)',
            borderRadius: 3,
            boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
            maxHeight: '90vh'
          }
        }}
      >
        <DialogTitle sx={{
          background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
          color: 'white',
          display: 'flex',
          alignItems: 'center',
          gap: 2
        }}>
          <Avatar sx={{ background: 'rgba(255, 255, 255, 0.2)', width: 40, height: 40 }}>
            <SchemaIcon />
          </Avatar>
          <Box sx={{ flex: 1 }}>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              Propriétés du type d'objet
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.9 }}>
              {selectedObjectTypeForProperties?.typeName}
            </Typography>
          </Box>
          <IconButton onClick={handleClosePropertiesDialog} sx={{ color: 'white' }}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent sx={{ p: 3 }}>
          {selectedObjectTypeForProperties && (
            <>
              {/* Informations générales */}
              <Box sx={{ mb: 3 }}>
                <Typography variant="h6" sx={{ mb: 2, color: '#10b981', fontWeight: 600 }}>
                  Informations générales
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <Typography variant="body2" color="text.secondary">
                      <strong>Nom du type:</strong> {selectedObjectTypeForProperties.typeName}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Typography variant="body2" color="text.secondary">
                      <strong>Requis:</strong> {selectedObjectTypeForProperties.isRequired ? 'Oui' : 'Non'}
                    </Typography>
                  </Grid>
                  <Grid item xs={12}>
                    <Typography variant="body2" color="text.secondary">
                      <strong>Description:</strong> {selectedObjectTypeForProperties.description || 'Aucune description'}
                    </Typography>
                  </Grid>
                </Grid>
              </Box>

              <Divider sx={{ my: 2 }} />

              {/* Tableau des propriétés */}
              <Box>
                <Typography variant="h6" sx={{ mb: 2, color: '#10b981', fontWeight: 600 }}>
                  Propriétés ({Object.keys(selectedObjectTypeForProperties.properties || {}).length})
                </Typography>
                
                {Object.keys(selectedObjectTypeForProperties.properties || {}).length > 0 ? (
                  <TableContainer component={Paper} sx={{ 
                    background: 'rgba(255, 255, 255, 0.5)',
                    borderRadius: 2,
                    border: '1px solid rgba(16, 185, 129, 0.2)'
                  }}>
                    <Table>
                      <TableHead>
                        <TableRow sx={{ background: 'rgba(16, 185, 129, 0.1)' }}>
                          <TableCell sx={{ fontWeight: 600, color: '#10b981' }}>Nom</TableCell>
                          <TableCell sx={{ fontWeight: 600, color: '#10b981' }}>Type</TableCell>
                          <TableCell sx={{ fontWeight: 600, color: '#10b981' }}>Requis</TableCell>
                          <TableCell sx={{ fontWeight: 600, color: '#10b981' }}>Valeur par défaut</TableCell>
                          <TableCell sx={{ fontWeight: 600, color: '#10b981' }}>Format</TableCell>
                          <TableCell sx={{ fontWeight: 600, color: '#10b981' }}>Description</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {Object.entries(selectedObjectTypeForProperties.properties || {}).map(([key, prop]) => (
                          <TableRow key={key} sx={{ '&:hover': { background: 'rgba(16, 185, 129, 0.05)' } }}>
                            <TableCell sx={{ fontWeight: 500 }}>{key}</TableCell>
                            <TableCell>
                              <Chip 
                                label={prop.type || 'string'} 
                                size="small" 
                                color="primary"
                                variant="outlined"
                              />
                            </TableCell>
                            <TableCell>
                              <Chip 
                                label={prop.isRequired ? 'Oui' : 'Non'} 
                                size="small" 
                                color={prop.isRequired ? 'success' : 'default'}
                                variant="outlined"
                              />
                            </TableCell>
                            <TableCell>
                              {prop.defaultValue ? (
                                <Chip 
                                  label={prop.defaultValue} 
                                  size="small" 
                                  color="info"
                                  variant="outlined"
                                />
                              ) : (
                                <Typography variant="body2" color="text.secondary">
                                  -
                                </Typography>
                              )}
                            </TableCell>
                            <TableCell>
                              {prop.format ? (
                                <Chip 
                                  label={prop.format} 
                                  size="small" 
                                  color="secondary"
                                  variant="outlined"
                                />
                              ) : (
                                <Typography variant="body2" color="text.secondary">
                                  -
                                </Typography>
                              )}
                            </TableCell>
                            <TableCell>
                              <Typography variant="body2" color="text.secondary">
                                {prop.description || '-'}
                              </Typography>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                ) : (
                  <Paper sx={{ 
                    p: 3, 
                    textAlign: 'center',
                    background: 'rgba(255, 255, 255, 0.5)',
                    border: '1px solid rgba(16, 185, 129, 0.2)'
                  }}>
                    <Typography variant="body1" color="text.secondary">
                      Aucune propriété définie pour ce type d'objet
                    </Typography>
                  </Paper>
                )}
              </Box>

              {/* Valeurs autorisées si présentes */}
              {Object.entries(selectedObjectTypeForProperties.properties || {}).some(([_, prop]) => prop.allowedValues && prop.allowedValues.length > 0) && (
                <>
                  <Divider sx={{ my: 3 }} />
                  <Box>
                    <Typography variant="h6" sx={{ mb: 2, color: '#10b981', fontWeight: 600 }}>
                      Valeurs autorisées
                    </Typography>
                    {Object.entries(selectedObjectTypeForProperties.properties || {}).map(([key, prop]) => {
                      if (prop.allowedValues && prop.allowedValues.length > 0) {
                        return (
                          <Box key={key} sx={{ mb: 2 }}>
                            <Typography variant="subtitle2" sx={{ mb: 1, color: '#10b981' }}>
                              {key}:
                            </Typography>
                            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                              {prop.allowedValues.map((value, index) => (
                                <Chip
                                  key={index}
                                  label={value}
                                  size="small"
                                  color="primary"
                                  variant="outlined"
                                />
                              ))}
                            </Box>
                          </Box>
                        );
                      }
                      return null;
                    })}
                  </Box>
                </>
              )}
            </>
          )}
        </DialogContent>

        <DialogActions sx={{ p: 3, pt: 0 }}>
          <Button onClick={handleClosePropertiesDialog} color="inherit">
            Fermer
          </Button>
          {selectedObjectTypeForProperties && (
            <Button
              onClick={() => {
                handleEditObjectType(selectedObjectTypeForProperties);
                handleClosePropertiesDialog();
              }}
              variant="contained"
              startIcon={<EditIcon />}
              sx={{
                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #059669 0%, #047857 100%)'
                }
              }}
            >
              Modifier ce type
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ObjectTypesManagementPage; 