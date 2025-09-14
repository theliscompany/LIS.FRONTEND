import React, { useState } from 'react';
import {
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Typography,
  Grid,
  Card,
  CardContent,
  Chip,
  Alert,
  CircularProgress,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  FormControlLabel,
  IconButton,
  Tooltip,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Tabs,
  Tab,
  Paper,
  Avatar
} from '@mui/material';
import {
  Add as AddIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  Code as CodeIcon,
  Settings as SettingsIcon,
  Preview as PreviewIcon,
  CheckCircle as CheckCircleIcon,
  AutoAwesome as AutoAwesomeIcon,
  Palette as PaletteIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  Info as InfoIcon,
  Schema as SchemaIcon,
  Assignment as AssignmentIcon,
  Description as DescriptionIcon
} from '@mui/icons-material';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { enqueueSnackbar } from 'notistack';
import { 
  postApiEmailTemplateObjectTypesMutation,
  deleteApiEmailTemplateObjectTypesByTypeNameMutation
} from '../api/@tanstack/react-query.gen';
import { ObjectSchemaDTO, PropertySchemaDTO, ObjectSchema } from '../api/types.gen';

interface SimpleObjectTypeCreatorProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  editMode?: boolean;
  objectTypeToEdit?: ObjectSchema;
}

interface PropertyData {
  name: string;
  type: string;
  description: string;
  isRequired: boolean;
  defaultValue?: string;
  format?: string;
  allowedValues?: string[];
}

interface ObjectTypeData {
  typeName: string;
  description: string;
  isRequired: boolean;
  properties: Record<string, PropertyData>;
}

const SimpleObjectTypeCreator: React.FC<SimpleObjectTypeCreatorProps> = ({
  open,
  onClose,
  onSuccess,
  editMode = false,
  objectTypeToEdit
}) => {
  const queryClient = useQueryClient();
  const [activeStep, setActiveStep] = useState(0);
  const [objectTypeData, setObjectTypeData] = useState<ObjectTypeData>({
    typeName: '',
    description: '',
    isRequired: false,
    properties: {}
  });
  const [newProperty, setNewProperty] = useState<PropertyData>({
    name: '',
    type: 'string',
    description: '',
    isRequired: false
  });
  const [activeTab, setActiveTab] = useState(0);

  // Réinitialiser les données quand le modal s'ouvre
  React.useEffect(() => {
    if (open) {
      if (editMode && objectTypeToEdit) {
        // Mode édition : initialiser avec les données existantes
        const properties: Record<string, PropertyData> = {};
        if (objectTypeToEdit.properties) {
          Object.entries(objectTypeToEdit.properties).forEach(([key, prop]) => {
            properties[key] = {
              name: prop.name || key,
              type: prop.type || 'string',
              description: prop.description || '',
              isRequired: prop.isRequired || false,
              defaultValue: prop.defaultValue || undefined,
              allowedValues: prop.allowedValues || undefined
            };
          });
        }
        
        setObjectTypeData({
          typeName: objectTypeToEdit.typeName || '',
          description: objectTypeToEdit.description || '',
          isRequired: objectTypeToEdit.isRequired || false,
          properties
        });
      } else {
        // Mode création : réinitialiser
        setObjectTypeData({
          typeName: '',
          description: '',
          isRequired: false,
          properties: {}
        });
      }
      setNewProperty({
        name: '',
        type: 'string',
        description: '',
        isRequired: false
      });
      setActiveStep(0);
      setActiveTab(0);
    }
  }, [open, editMode, objectTypeToEdit]);

  // Mutations
  const createObjectTypeMutation = useMutation(postApiEmailTemplateObjectTypesMutation());
  const deleteMutation = useMutation(deleteApiEmailTemplateObjectTypesByTypeNameMutation());

  // Fonction pour générer le JSON des propriétés
  const generatePropertiesJson = () => {
    const jsonSchema = {
      type: "object",
      properties: {} as Record<string, any>,
      required: [] as string[]
    };

    Object.entries(objectTypeData.properties).forEach(([key, prop]) => {
      let propertySchema: any = {
        type: prop.type,
        description: prop.description || undefined
      };

      if (prop.defaultValue) {
        propertySchema.default = prop.defaultValue;
      }

      if (prop.allowedValues && prop.allowedValues.length > 0) {
        propertySchema.enum = prop.allowedValues;
      }

      jsonSchema.properties[key] = propertySchema;

      if (prop.isRequired) {
        jsonSchema.required.push(key);
      }
    });

    return JSON.stringify(jsonSchema, null, 2);
  };

  const steps = [
    {
      label: 'Informations de base',
      description: 'Nom et description du type d\'objet'
    },
    {
      label: 'Propriétés',
      description: 'Définir les propriétés du type d\'objet'
    },
    {
      label: 'Validation',
      description: 'Vérifier et finaliser la configuration'
    }
  ];

  const propertyTypes = [
    { value: 'string', label: 'Texte' },
    { value: 'number', label: 'Nombre' },
    { value: 'boolean', label: 'Booléen' },
    { value: 'date', label: 'Date' },
    { value: 'email', label: 'Email' },
    { value: 'url', label: 'URL' },
    { value: 'array', label: 'Tableau' },
    { value: 'object', label: 'Objet' }
  ];

  const handleInputChange = (field: keyof ObjectTypeData, value: any) => {
    setObjectTypeData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleAddProperty = () => {
    if (!newProperty.name) {
      enqueueSnackbar('Veuillez saisir un nom pour la propriété', { variant: 'warning' });
      return;
    }

    if (objectTypeData.properties[newProperty.name]) {
      enqueueSnackbar('Une propriété avec ce nom existe déjà', { variant: 'warning' });
      return;
    }

    setObjectTypeData(prev => ({
      ...prev,
      properties: {
        ...prev.properties,
        [newProperty.name]: { ...newProperty }
      }
    }));

    setNewProperty({
      name: '',
      type: 'string',
      description: '',
      isRequired: false
    });
  };

  const handleRemoveProperty = (propertyName: string) => {
    setObjectTypeData(prev => {
      const newProperties = { ...prev.properties };
      delete newProperties[propertyName];
      return {
        ...prev,
        properties: newProperties
      };
    });
  };

  const handlePropertyChange = (field: keyof PropertyData, value: any) => {
    setNewProperty(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async () => {
    if (!objectTypeData.typeName) {
      enqueueSnackbar('Veuillez saisir un nom pour le type d\'objet', { variant: 'warning' });
      return;
    }

    if (Object.keys(objectTypeData.properties).length === 0) {
      enqueueSnackbar('Veuillez ajouter au moins une propriété', { variant: 'warning' });
      return;
    }

    // Validation supplémentaire pour s'assurer que les données sont bien persistées
    console.log('Object type data avant envoi:', objectTypeData);

    try {
      const properties: Record<string, any> = {};
      Object.entries(objectTypeData.properties).forEach(([key, prop]) => {
        properties[key] = {
          name: prop.name,
          type: prop.type,
          isRequired: prop.isRequired,
          defaultValue: prop.defaultValue,
          format: prop.format || undefined,
          description: prop.description,
          allowedValues: prop.allowedValues
        };
      });

      const objectTypePayload = {
        typeName: objectTypeData.typeName.trim(),
        description: objectTypeData.description.trim() || '',
        isRequired: objectTypeData.isRequired,
        properties
      };

      console.log('Payload envoyé à l\'API:', objectTypePayload);

      if (editMode) {
        // En mode édition, on supprime d'abord l'ancien puis on crée le nouveau
        if (objectTypeToEdit?.typeName && objectTypeToEdit.typeName !== objectTypeData.typeName) {
          await deleteMutation.mutateAsync({
            path: { typeName: objectTypeToEdit.typeName }
          });
        }
      }

      const payload = {
        body: objectTypePayload
      };

      console.log('Payload final envoyé:', payload);

      await createObjectTypeMutation.mutateAsync(payload);

      enqueueSnackbar(
        editMode 
          ? 'Type d\'objet modifié avec succès!' 
          : 'Type d\'objet créé avec succès!', 
        { variant: 'success' }
      );
      queryClient.invalidateQueries({ queryKey: ['getApiEmailTemplateObjectTypesOptions'] });
      onSuccess?.();
      onClose();
    } catch (error) {
      console.error('Erreur détaillée lors de la création/modification du type d\'objet:', error);
      enqueueSnackbar(
        editMode 
          ? 'Erreur lors de la modification du type d\'objet' 
          : 'Erreur lors de la création du type d\'objet', 
        { variant: 'error' }
      );
    }
  };

  const isSubmitting = createObjectTypeMutation.isPending;

  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      maxWidth="lg"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          background: 'linear-gradient(135deg, #2c3e50 0%, #34495e 100%)',
          boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
          overflow: 'hidden'
        }
      }}
    >
      {/* Header moderne avec contraste amélioré */}
      <Box sx={{
        background: 'linear-gradient(135deg, #2c3e50 0%, #34495e 100%)',
        p: 4,
        position: 'relative',
        overflow: 'hidden',
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
        <Box sx={{ position: 'relative', zIndex: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
            <Avatar sx={{
              background: 'rgba(255, 255, 255, 0.15)',
              backdropFilter: 'blur(10px)',
              width: 56,
              height: 56,
              border: '2px solid rgba(255, 255, 255, 0.25)'
            }}>
              <SchemaIcon sx={{ color: 'white' }} />
            </Avatar>
            <Box>
              <Typography variant="h4" sx={{
                fontWeight: 700,
                color: 'white',
                textShadow: '0 2px 4px rgba(0,0,0,0.5)',
                mb: 0.5
              }}>
                {editMode ? 'Modifier le Type d\'Objet' : 'Créer un Nouveau Type d\'Objet'}
              </Typography>
              <Typography variant="body1" sx={{
                color: 'rgba(255,255,255,0.95)',
                fontWeight: 300
              }}>
                {editMode 
                  ? 'Modifiez la structure de vos données pour les templates'
                  : 'Définissez la structure de vos données pour les templates'
                }
              </Typography>
            </Box>
          </Box>

          {/* Indicateurs de progression */}
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            <Chip
              label={`Étape ${activeStep + 1} sur ${steps.length}`}
              size="small"
              sx={{
                background: 'rgba(255, 255, 255, 0.15)',
                color: 'white',
                border: '1px solid rgba(255, 255, 255, 0.25)',
                '& .MuiChip-label': { fontWeight: 600 }
              }}
            />
            <Chip
              label={steps[activeStep]?.label || 'Configuration'}
              size="small"
              sx={{
                background: 'rgba(255, 255, 255, 0.1)',
                color: 'white',
                border: '1px solid rgba(255, 255, 255, 0.2)'
              }}
            />
            {editMode && (
              <Chip
                label="Mode édition"
                size="small"
                sx={{
                  background: 'rgba(255, 193, 7, 0.8)',
                  color: 'white',
                  border: '1px solid rgba(255, 193, 7, 0.9)',
                  fontWeight: 600
                }}
              />
            )}
          </Box>
        </Box>
      </Box>

      <DialogContent sx={{ 
        pt: 3, 
        bgcolor: 'background.paper',
        background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)'
      }}>
        {/* Stepper modernisé */}
        <Paper sx={{
          background: 'rgba(255, 255, 255, 0.8)',
          backdropFilter: 'blur(10px)',
          borderRadius: 3,
          p: 3,
          mb: 4,
          border: '1px solid rgba(255, 255, 255, 0.2)',
          boxShadow: '0 8px 32px rgba(0,0,0,0.1)'
        }}>
          <Stepper 
            activeStep={activeStep} 
            orientation="vertical" 
            sx={{
              '& .MuiStepLabel-root': {
                '& .MuiStepLabel-label': {
                  fontWeight: 600,
                  color: '#2c3e50'
                }
              },
              '& .MuiStepIcon-root': {
                color: '#bdc3c7',
                '&.Mui-active': {
                  color: '#3498db'
                },
                '&.Mui-completed': {
                  color: '#27ae60'
                }
              },
              '& .MuiStepConnector-line': {
                borderColor: '#ecf0f1'
              }
            }}
          >
            {steps.map((step, index) => (
              <Step key={step.label}>
                <StepLabel>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    {index === 0 && <AssignmentIcon fontSize="small" />}
                    {index === 1 && <SettingsIcon fontSize="small" />}
                    {index === 2 && <CheckCircleIcon fontSize="small" />}
                    {step.label}
                  </Box>
                </StepLabel>
                <StepContent>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    {step.description}
                  </Typography>
                </StepContent>
              </Step>
            ))}
          </Stepper>
        </Paper>

        {/* Contenu des étapes avec style modernisé */}
        <Paper sx={{
          background: 'rgba(255, 255, 255, 0.9)',
          backdropFilter: 'blur(10px)',
          borderRadius: 3,
          p: 4,
          border: '1px solid rgba(255, 255, 255, 0.2)',
          boxShadow: '0 8px 32px rgba(0,0,0,0.1)'
        }}>
          {/* Step Content */}
          {activeStep === 0 && (
            <Box>
              <Typography variant="h5" sx={{ 
                mb: 3, 
                color: '#2c3e50',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: 1
              }}>
                <AssignmentIcon />
                Informations de base
              </Typography>
              
              <Grid container spacing={3}>
                <Grid item xs={12} md={8}>
                  <TextField
                    fullWidth
                    label="Nom du type d'objet *"
                    value={objectTypeData.typeName}
                    onChange={(e) => handleInputChange('typeName', e.target.value)}
                    placeholder="ex: customer, quote, order"
                    sx={{ 
                      mb: 3,
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2,
                        '&:hover .MuiOutlinedInput-notchedOutline': {
                          borderColor: '#3498db'
                        }
                      }
                    }}
                  />
                  <TextField
                    fullWidth
                    multiline
                    rows={3}
                    label="Description"
                    value={objectTypeData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    placeholder="Description du type d'objet..."
                    sx={{ 
                      mb: 3,
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2,
                        '&:hover .MuiOutlinedInput-notchedOutline': {
                          borderColor: '#3498db'
                        }
                      }
                    }}
                  />
                  <FormControlLabel
                    control={
                      <Switch
                        checked={objectTypeData.isRequired}
                        onChange={(e) => handleInputChange('isRequired', e.target.checked)}
                      />
                    }
                    label="Type d'objet requis"
                    sx={{ color: '#2c3e50', fontWeight: 500 }}
                  />
                </Grid>
                <Grid item xs={12} md={4}>
                  <Card sx={{ 
                    background: 'linear-gradient(135deg, #3498db 0%, #2980b9 100%)',
                    color: 'white',
                    borderRadius: 3,
                    border: '1px solid rgba(255, 255, 255, 0.2)'
                  }}>
                    <CardContent>
                      <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                        <InfoIcon />
                        Conseils
                      </Typography>
                      <Typography variant="body2" sx={{ mb: 1, opacity: 0.9 }}>
                        • Utilisez des noms simples et descriptifs
                      </Typography>
                      <Typography variant="body2" sx={{ mb: 1, opacity: 0.9 }}>
                        • La description aide à comprendre l'usage
                      </Typography>
                      <Typography variant="body2" sx={{ opacity: 0.9 }}>
                        • Les types requis sont validés automatiquement
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            </Box>
          )}

          {activeStep === 1 && (
            <Box>
              <Typography variant="h5" sx={{ 
                mb: 3, 
                color: '#2c3e50',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: 1
              }}>
                <SettingsIcon />
                Propriétés du type d'objet
              </Typography>
              
              {/* Onglets modernisés */}
              <Box sx={{ 
                background: 'rgba(44, 62, 80, 0.1)',
                borderRadius: 2,
                p: 1,
                mb: 3,
                border: '1px solid rgba(44, 62, 80, 0.2)'
              }}>
                <Tabs 
                  value={activeTab} 
                  onChange={(e, newValue) => setActiveTab(newValue)}
                  sx={{
                    '& .MuiTabs-indicator': {
                      background: 'linear-gradient(45deg, #2c3e50 30%, #34495e 90%)',
                      height: 3,
                      borderRadius: 1.5
                    },
                    '& .MuiTab-root': {
                      color: 'rgba(0, 0, 0, 0.7)',
                      fontWeight: 500,
                      textTransform: 'none',
                      minHeight: 48,
                      '&.Mui-selected': {
                        color: '#2c3e50',
                        fontWeight: 600
                      }
                    }
                  }}
                >
                  <Tab 
                    label={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <AddIcon fontSize="small" />
                        Ajouter des propriétés
                      </Box>
                    } 
                  />
                  <Tab 
                    label={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <CodeIcon fontSize="small" />
                        Visualiser en JSON
                      </Box>
                    } 
                  />
                </Tabs>
              </Box>
              
              {/* Contenu des onglets */}
              {activeTab === 0 && (
                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <Typography variant="h6" sx={{ mb: 2, color: '#2c3e50', fontWeight: 600 }}>
                      Ajouter une propriété
                    </Typography>
                    <Card sx={{ 
                      p: 3, 
                      mb: 3,
                      borderRadius: 3,
                      background: 'linear-gradient(135deg, #ecf0f1 0%, #bdc3c7 100%)',
                      border: '1px solid rgba(255, 255, 255, 0.2)'
                    }}>
                      <Grid container spacing={2}>
                        <Grid item xs={12} sm={6}>
                          <TextField
                            fullWidth
                            size="small"
                            label="Nom de la propriété"
                            value={newProperty.name}
                            onChange={(e) => handlePropertyChange('name', e.target.value)}
                            placeholder="ex: name, email, total"
                            sx={{
                              '& .MuiOutlinedInput-root': {
                                borderRadius: 2,
                                '&:hover .MuiOutlinedInput-notchedOutline': {
                                  borderColor: '#3498db'
                                }
                              }
                            }}
                          />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <FormControl fullWidth size="small">
                            <InputLabel>Type</InputLabel>
                            <Select
                              value={newProperty.type}
                              onChange={(e) => handlePropertyChange('type', e.target.value)}
                              label="Type"
                              sx={{
                                borderRadius: 2,
                                '& .MuiOutlinedInput-notchedOutline': {
                                  borderColor: '#bdc3c7'
                                },
                                '&:hover .MuiOutlinedInput-notchedOutline': {
                                  borderColor: '#3498db'
                                }
                              }}
                            >
                              {propertyTypes.map((type) => (
                                <MenuItem key={type.value} value={type.value}>
                                  {type.label}
                                </MenuItem>
                              ))}
                            </Select>
                          </FormControl>
                        </Grid>
                        <Grid item xs={12}>
                          <TextField
                            fullWidth
                            size="small"
                            label="Description"
                            value={newProperty.description}
                            onChange={(e) => handlePropertyChange('description', e.target.value)}
                            placeholder="Description de la propriété..."
                            sx={{
                              '& .MuiOutlinedInput-root': {
                                borderRadius: 2,
                                '&:hover .MuiOutlinedInput-notchedOutline': {
                                  borderColor: '#3498db'
                                }
                              }
                            }}
                          />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <TextField
                            fullWidth
                            size="small"
                            label="Valeur par défaut"
                            value={newProperty.defaultValue || ''}
                            onChange={(e) => handlePropertyChange('defaultValue', e.target.value)}
                            placeholder="Valeur par défaut..."
                            sx={{
                              '& .MuiOutlinedInput-root': {
                                borderRadius: 2,
                                '&:hover .MuiOutlinedInput-notchedOutline': {
                                  borderColor: '#3498db'
                                }
                              }
                            }}
                          />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <FormControlLabel
                            control={
                              <Switch
                                checked={newProperty.isRequired}
                                onChange={(e) => handlePropertyChange('isRequired', e.target.checked)}
                              />
                            }
                            label="Requis"
                            sx={{ color: '#2c3e50', fontWeight: 500 }}
                          />
                        </Grid>
                      </Grid>
                      <Button
                        variant="contained"
                        onClick={handleAddProperty}
                        disabled={!newProperty.name}
                        sx={{ 
                          mt: 3,
                          background: 'linear-gradient(45deg, #3498db 30%, #2980b9 90%)',
                          '&:hover': {
                            background: 'linear-gradient(45deg, #2980b9 30%, #1f5f8b 90%)'
                          },
                          borderRadius: 2
                        }}
                        startIcon={<AddIcon />}
                        fullWidth
                      >
                        Ajouter la propriété
                      </Button>
                    </Card>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Typography variant="h6" sx={{ mb: 2, color: '#2c3e50', fontWeight: 600 }}>
                      Propriétés définies ({Object.keys(objectTypeData.properties).length})
                    </Typography>
                    <List>
                      {Object.entries(objectTypeData.properties).map(([key, prop]) => (
                        <ListItem
                          key={key}
                          sx={{
                            border: '1px solid #bdc3c7',
                            borderRadius: 2,
                            mb: 1,
                            bgcolor: 'white',
                            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                            '&:hover': {
                              boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                              transform: 'translateY(-1px)'
                            },
                            transition: 'all 0.2s ease-in-out'
                          }}
                        >
                          <ListItemText
                            primary={
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Typography variant="body2" sx={{ fontWeight: 'bold', color: '#2c3e50' }}>
                                  {prop.name}
                                </Typography>
                                <Chip 
                                  label={prop.type} 
                                  size="small" 
                                  sx={{ 
                                    background: '#3498db',
                                    color: 'white',
                                    fontWeight: 600
                                  }} 
                                />
                                {prop.isRequired && (
                                  <Chip 
                                    label="Requis" 
                                    size="small" 
                                    sx={{ 
                                      background: '#e74c3c',
                                      color: 'white',
                                      fontWeight: 600
                                    }} 
                                  />
                                )}
                              </Box>
                            }
                            secondary={
                              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                                {prop.description || 'Aucune description'}
                              </Typography>
                            }
                          />
                          <ListItemSecondaryAction>
                            <Tooltip title="Supprimer">
                              <IconButton
                                edge="end"
                                onClick={() => handleRemoveProperty(key)}
                                sx={{ 
                                  color: '#e74c3c',
                                  '&:hover': { 
                                    backgroundColor: 'rgba(231, 76, 60, 0.1)' 
                                  }
                                }}
                                size="small"
                              >
                                <DeleteIcon />
                              </IconButton>
                            </Tooltip>
                          </ListItemSecondaryAction>
                        </ListItem>
                      ))}
                    </List>
                    {Object.keys(objectTypeData.properties).length === 0 && (
                      <Alert severity="info" sx={{ borderRadius: 2 }}>
                        Aucune propriété définie. Ajoutez des propriétés pour continuer.
                      </Alert>
                    )}
                  </Grid>
                </Grid>
              )}
              
              {activeTab === 1 && (
                <Box>
                  <Typography variant="h6" sx={{ mb: 2, color: '#2c3e50', fontWeight: 600 }}>
                    Schéma JSON généré automatiquement
                  </Typography>
                  <Paper 
                    sx={{ 
                      p: 3, 
                      background: 'linear-gradient(135deg, #2c3e50 0%, #34495e 100%)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      borderRadius: 3,
                      color: 'white'
                    }}
                  >
                    <Typography 
                      component="pre" 
                      sx={{ 
                        fontFamily: 'monospace',
                        fontSize: '0.875rem',
                        lineHeight: 1.5,
                        overflow: 'auto',
                        maxHeight: '400px',
                        whiteSpace: 'pre-wrap',
                        wordBreak: 'break-word',
                        color: '#ecf0f1'
                      }}
                    >
                      {generatePropertiesJson()}
                    </Typography>
                  </Paper>
                  <Alert severity="info" sx={{ mt: 2, borderRadius: 2 }}>
                    Ce schéma JSON sera utilisé pour valider les données lors de l'utilisation du type d'objet dans les templates.
                  </Alert>
                </Box>
              )}
            </Box>
          )}

          {activeStep === 2 && (
            <Box>
              <Typography variant="h5" sx={{ 
                mb: 3, 
                color: '#2c3e50',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: 1
              }}>
                <CheckCircleIcon />
                Validation
              </Typography>
              
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Typography variant="h6" sx={{ mb: 2, color: '#2c3e50', fontWeight: 600 }}>
                    Résumé du type d'objet
                  </Typography>
                  <Card sx={{ 
                    p: 3, 
                    borderRadius: 3,
                    background: 'linear-gradient(135deg, #ecf0f1 0%, #bdc3c7 100%)',
                    border: '1px solid rgba(255, 255, 255, 0.2)'
                  }}>
                    <Typography variant="body2" sx={{ mb: 1, fontWeight: 600 }}>
                      <strong>Nom:</strong> {objectTypeData.typeName}
                    </Typography>
                    <Typography variant="body2" sx={{ mb: 1, fontWeight: 600 }}>
                      <strong>Description:</strong> {objectTypeData.description || 'Aucune description'}
                    </Typography>
                    <Typography variant="body2" sx={{ mb: 1, fontWeight: 600 }}>
                      <strong>Requis:</strong> {objectTypeData.isRequired ? 'Oui' : 'Non'}
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      <strong>Propriétés:</strong> {Object.keys(objectTypeData.properties).length}
                    </Typography>
                  </Card>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="h6" sx={{ mb: 2, color: '#2c3e50', fontWeight: 600 }}>
                    Propriétés
                  </Typography>
                  <Box sx={{ maxHeight: 300, overflow: 'auto' }}>
                    {Object.entries(objectTypeData.properties).map(([key, prop]) => (
                      <Card key={key} sx={{ 
                        p: 2, 
                        mb: 1,
                        borderRadius: 2,
                        background: 'white',
                        border: '1px solid #bdc3c7',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                      }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Typography variant="body2" sx={{ fontWeight: 'bold', flex: 1, color: '#2c3e50' }}>
                            {prop.name}
                          </Typography>
                          <Chip 
                            label={prop.type} 
                            size="small" 
                            sx={{ 
                              background: '#3498db',
                              color: 'white',
                              fontWeight: 600
                            }} 
                          />
                          {prop.isRequired && (
                            <Chip 
                              label="Requis" 
                              size="small" 
                              sx={{ 
                                background: '#e74c3c',
                                color: 'white',
                                fontWeight: 600
                              }} 
                            />
                          )}
                        </Box>
                        {prop.description && (
                          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                            {prop.description}
                          </Typography>
                        )}
                      </Card>
                    ))}
                  </Box>
                </Grid>
              </Grid>
            </Box>
          )}
        </Paper>
      </DialogContent>

      <DialogActions sx={{ 
        p: 3, 
        pt: 2,
        background: 'linear-gradient(135deg, #2c3e50 0%, #34495e 100%)',
        borderTop: '1px solid rgba(255, 255, 255, 0.1)'
      }}>
        <Button 
          onClick={onClose} 
          startIcon={<CancelIcon />}
          sx={{
            color: 'white',
            borderColor: 'rgba(255, 255, 255, 0.3)',
            '&:hover': {
              borderColor: 'white',
              backgroundColor: 'rgba(255, 255, 255, 0.1)'
            }
          }}
          variant="outlined"
        >
          Annuler
        </Button>
        
        {activeStep > 0 && (
          <Button
            variant="outlined"
            onClick={() => setActiveStep(activeStep - 1)}
            sx={{
              color: 'white',
              borderColor: 'rgba(255, 255, 255, 0.3)',
              '&:hover': {
                borderColor: 'white',
                backgroundColor: 'rgba(255, 255, 255, 0.1)'
              }
            }}
          >
            Précédent
          </Button>
        )}
        
        {activeStep === 0 && objectTypeData.typeName && (
          <Button
            variant="contained"
            onClick={() => setActiveStep(1)}
            startIcon={<SettingsIcon />}
            sx={{
              background: 'linear-gradient(45deg, #3498db 30%, #2980b9 90%)',
              '&:hover': {
                background: 'linear-gradient(45deg, #2980b9 30%, #1f5f8b 90%)'
              }
            }}
          >
            Suivant
          </Button>
        )}
        
        {activeStep === 1 && Object.keys(objectTypeData.properties).length > 0 && (
          <Button
            variant="contained"
            onClick={() => setActiveStep(2)}
            startIcon={<CheckCircleIcon />}
            sx={{
              background: 'linear-gradient(45deg, #3498db 30%, #2980b9 90%)',
              '&:hover': {
                background: 'linear-gradient(45deg, #2980b9 30%, #1f5f8b 90%)'
              }
            }}
          >
            Suivant
          </Button>
        )}
        
        {activeStep === 2 && (
          <Button
            variant="contained"
            onClick={handleSubmit}
            startIcon={isSubmitting ? <CircularProgress size={20} /> : <SaveIcon />}
            disabled={isSubmitting}
            sx={{
              background: 'linear-gradient(45deg, #27ae60 30%, #229954 90%)',
              '&:hover': {
                background: 'linear-gradient(45deg, #229954 30%, #1e8449 90%)'
              }
            }}
          >
            {isSubmitting 
              ? (editMode ? 'Modification...' : 'Création...') 
              : (editMode ? 'Modifier le type d\'objet' : 'Créer le type d\'objet')
            }
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default SimpleObjectTypeCreator; 