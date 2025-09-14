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
  Divider,
  IconButton,
  Tooltip,
  Tabs,
  Tab,
  Avatar,
  Paper
} from '@mui/material';
import {
  Add as AddIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  Email as EmailIcon,
  Subject as SubjectIcon,
  Code as CodeIcon,
  Settings as SettingsIcon,
  Preview as PreviewIcon,
  CheckCircle as CheckCircleIcon,
  AutoAwesome as AutoAwesomeIcon,
  Palette as PaletteIcon,
  Info as InfoIcon,
  FormatBold as FormatBoldIcon,
  FormatItalic as FormatItalicIcon,
  FormatUnderlined as FormatUnderlinedIcon,
  FormatListBulleted as FormatListBulletedIcon,
  FormatListNumbered as FormatListNumberedIcon,
  FormatAlignLeft as FormatAlignLeftIcon,
  FormatAlignCenter as FormatAlignCenterIcon,
  FormatAlignRight as FormatAlignRightIcon,
  FormatAlignJustify as FormatAlignJustifyIcon,
  Link as LinkIcon,
  Image as ImageIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  Create as CreateIcon,
  Assignment as AssignmentIcon,
  Description as DescriptionIcon
} from '@mui/icons-material';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { enqueueSnackbar } from 'notistack';
import { 
  postApiEmailTemplateMutation,
  postApiEmailTemplateRenderDirectMutation,
  getApiEmailTemplateObjectTypesOptions
} from '../api/@tanstack/react-query.gen';

interface SimpleTemplateCreatorProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

interface TemplateData {
  name: string;
  subject: string;
  htmlBody: string;
  textBody: string;
  supportedObjectTypes: string[];
  author: string;
  tags: string[];
}

const SimpleTemplateCreator: React.FC<SimpleTemplateCreatorProps> = ({
  open,
  onClose,
  onSuccess
}) => {
  const queryClient = useQueryClient();
  const [activeStep, setActiveStep] = useState(0);
  
  // Query pour récupérer tous les types d'objets depuis l'API
  const { data: allObjectTypes } = useQuery(getApiEmailTemplateObjectTypesOptions());
  
  // Helper function pour extraire les données de l'API
  const safeExtractArray = (data: any): any[] => {
    let result: any[] = [];
    
    if (Array.isArray(data)) {
      result = data;
    } else if (data?.data && Array.isArray(data.data)) {
      result = data.data;
    } else if (data && typeof data === 'object') {
      const allKeys = Object.keys(data);
      for (const key of allKeys) {
        if (Array.isArray(data[key])) {
          result = data[key];
          break;
        }
      }
    }
    
    return result;
  };

  // Extraire les types d'objets depuis l'API
  const extractedObjectTypes = safeExtractArray(allObjectTypes);
  const [templateData, setTemplateData] = useState<TemplateData>({
    name: '',
    subject: '',
    htmlBody: '',
    textBody: '',
    supportedObjectTypes: [],
    author: '',
    tags: []
  });
  const [previewResult, setPreviewResult] = useState<any>(null);
  const [isPreviewLoading, setIsPreviewLoading] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const [showHtmlPreview, setShowHtmlPreview] = useState(false);

  // Réinitialiser les données quand le modal s'ouvre
  React.useEffect(() => {
    if (open) {
      setTemplateData({
        name: '',
        subject: '',
        htmlBody: '',
        textBody: '',
        supportedObjectTypes: [],
        author: '',
        tags: []
      });
      setActiveStep(0);
      setActiveTab(0);
      setShowHtmlPreview(false);
      setPreviewResult(null);
      setIsPreviewLoading(false);
      
      // Réinitialiser l'éditeur HTML
      if (editorRef.current) {
        editorRef.current.innerHTML = '';
      }
    }
  }, [open]);

  // Mutations
  const createTemplateMutation = useMutation(postApiEmailTemplateMutation());
  const previewMutation = useMutation(postApiEmailTemplateRenderDirectMutation());

  // Générer les placeholders à partir des types d'objets supportés
  const generatePlaceholders = () => {
    const placeholders: string[] = [];
    
    // Pour chaque type d'objet sélectionné
    templateData.supportedObjectTypes.forEach(selectedObjectType => {
      // Trouver l'objet correspondant dans les types extraits de l'API
      const objectType = extractedObjectTypes.find((obj: any) => obj.typeName === selectedObjectType);
      
      if (objectType && objectType.properties) {
        // Générer les placeholders pour chaque propriété
        Object.keys(objectType.properties).forEach(propertyName => {
          const property = objectType.properties[propertyName];
          const placeholder = `${selectedObjectType.toLowerCase()}.${propertyName}`;
          placeholders.push(placeholder);
        });
      }
    });
    
    return placeholders;
  };

  const availablePlaceholders = generatePlaceholders();

  const handlePlaceholderClick = (placeholder: string, field: 'htmlBody' | 'textBody' = 'htmlBody') => {
    const placeholderText = `{{${placeholder}}}`;
    
    if (field === 'htmlBody') {
      // Pour l'éditeur HTML, insérer à la position du curseur
      const selection = window.getSelection();
      if (selection && selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        
        // Vérifier que le curseur est dans l'éditeur
        if (editorRef.current && editorRef.current.contains(range.commonAncestorContainer)) {
          const textNode = document.createTextNode(placeholderText);
          range.insertNode(textNode);
          range.setStartAfter(textNode);
          range.setEndAfter(textNode);
          selection.removeAllRanges();
          selection.addRange(range);
          
          // Mettre à jour le contenu HTML
          if (editorRef.current) {
            handleInputChange('htmlBody', editorRef.current.innerHTML);
          }
        } else {
          // Le curseur n'est pas dans l'éditeur, placer à la fin
          if (editorRef.current) {
            editorRef.current.focus();
            const range = document.createRange();
            const selection2 = window.getSelection();
            range.selectNodeContents(editorRef.current);
            range.collapse(false);
            selection2?.removeAllRanges();
            selection2?.addRange(range);
            
            // Insérer le placeholder
            const textNode = document.createTextNode(placeholderText);
            range.insertNode(textNode);
            range.setStartAfter(textNode);
            range.setEndAfter(textNode);
            selection2?.removeAllRanges();
            selection2?.addRange(range);
            
            // Mettre à jour le contenu HTML
            handleInputChange('htmlBody', editorRef.current.innerHTML);
          }
        }
      } else {
        // Aucune sélection, placer le curseur à la fin et insérer
        if (editorRef.current) {
          editorRef.current.focus();
          const range = document.createRange();
          const selection2 = window.getSelection();
          range.selectNodeContents(editorRef.current);
          range.collapse(false);
          selection2?.removeAllRanges();
          selection2?.addRange(range);
          
          // Insérer le placeholder
          const textNode = document.createTextNode(placeholderText);
          range.insertNode(textNode);
          range.setStartAfter(textNode);
          range.setEndAfter(textNode);
          selection2?.removeAllRanges();
          selection2?.addRange(range);
          
          // Mettre à jour le contenu HTML
          handleInputChange('htmlBody', editorRef.current.innerHTML);
        }
      }
    } else {
      // Pour le champ texte, insérer à la position du curseur
      const textField = document.querySelector(`textarea[data-field="${field}"]`) as HTMLTextAreaElement;
      if (textField) {
        const start = textField.selectionStart;
        const end = textField.selectionEnd;
        const currentValue = templateData[field];
        const newValue = currentValue.substring(0, start) + placeholderText + currentValue.substring(end);
        handleInputChange(field, newValue);
        
        // Restaurer la position du curseur
        setTimeout(() => {
          textField.setSelectionRange(start + placeholderText.length, start + placeholderText.length);
          textField.focus();
        }, 0);
      } else {
        // Fallback: ajouter à la fin
        const currentValue = templateData[field];
        const newValue = currentValue + placeholderText;
        handleInputChange(field, newValue);
      }
    }
  };

  // Fonctions pour l'éditeur HTML
  const execCommand = (command: string, value: string = '') => {
    document.execCommand(command, false, value);
  };

  const handleFormatClick = (command: string, value: string = '') => {
    execCommand(command, value);
  };

  const handleLinkClick = () => {
    const url = prompt('Entrez l\'URL du lien:');
    if (url) {
      execCommand('createLink', url);
    }
  };

  const handleImageClick = () => {
    const url = prompt('Entrez l\'URL de l\'image:');
    if (url) {
      execCommand('insertImage', url);
    }
  };

  const handleHtmlChange = (html: string) => {
    handleInputChange('htmlBody', html);
  };

  // Référence pour l'éditeur HTML
  const editorRef = React.useRef<HTMLDivElement>(null);

  // Synchroniser l'éditeur HTML avec templateData.htmlBody
  React.useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== templateData.htmlBody) {
      // Only update if the editor is not currently focused
      // This prevents cursor jumps while typing
      if (document.activeElement !== editorRef.current) {
        editorRef.current.innerHTML = templateData.htmlBody;
      }
    }
  }, [templateData.htmlBody]);

  // Sauvegarder le contenu HTML quand l'éditeur perd le focus
  const handleEditorBlur = () => {
    if (editorRef.current) {
      const currentHtml = editorRef.current.innerHTML;
      if (currentHtml !== templateData.htmlBody) {
        handleInputChange('htmlBody', currentHtml);
      }
    }
  };

  const steps = [
    {
      label: 'Informations de base',
      description: 'Nom et sujet du template'
    },
    {
      label: 'Configuration',
      description: 'Types d\'objets et métadonnées'
    },
    {
      label: 'Contenu du template',
      description: 'HTML et texte du template'
    },
    {
      label: 'Prévisualisation',
      description: 'Aperçu du template'
    }
  ];

  const handleInputChange = (field: keyof TemplateData, value: any) => {
    setTemplateData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleAddTag = (tag: string) => {
    if (tag && !templateData.tags.includes(tag)) {
      setTemplateData(prev => ({
        ...prev,
        tags: [...prev.tags, tag]
      }));
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTemplateData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const handlePreview = async () => {
    if (!templateData.htmlBody && !templateData.textBody) {
      enqueueSnackbar('Veuillez ajouter du contenu au template', { variant: 'warning' });
      return;
    }

    setIsPreviewLoading(true);
    try {
      const result = await previewMutation.mutateAsync({
        body: {
          subject: templateData.subject,
          htmlBody: templateData.htmlBody,
          textBody: templateData.textBody,
          sampleData: {
            customer: {
              name: 'Jean Dupont',
              email: 'jean.dupont@example.com'
            },
            quote: {
              number: 'Q-2024-001',
              total: '1500 EUR'
            },
            company: {
              name: 'LIS Logistics',
              logo: 'https://example.com/logo.png'
            }
          }
        }
      });
      setPreviewResult(result);
      setActiveStep(3);
    } catch (error) {
      enqueueSnackbar('Erreur lors de la prévisualisation', { variant: 'error' });
    } finally {
      setIsPreviewLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!templateData.name || !templateData.subject) {
      enqueueSnackbar('Veuillez remplir les champs obligatoires', { variant: 'warning' });
      return;
    }

    // Validation supplémentaire pour s'assurer que les données sont bien persistées
    console.log('Template data avant envoi:', templateData);

    try {
      const templatePayload = {
        name: templateData.name.trim(),
        subject: templateData.subject.trim(),
        htmlBody: templateData.htmlBody || '',
        textBody: templateData.textBody || '',
        supportedObjectTypes: templateData.supportedObjectTypes || [],
        author: templateData.author.trim() || '',
        tags: templateData.tags || []
      };

      console.log('Payload envoyé:', templatePayload);

      await createTemplateMutation.mutateAsync({
        body: templatePayload
      });

      enqueueSnackbar('Template créé avec succès!', { variant: 'success' });
      queryClient.invalidateQueries({ queryKey: ['getApiEmailTemplate'] });
      onSuccess?.();
      onClose();
    } catch (error) {
      console.error('Erreur lors de la création du template:', error);
      enqueueSnackbar('Erreur lors de la création du template', { variant: 'error' });
    }
  };

  const isSubmitting = createTemplateMutation.isPending;

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
              <CreateIcon sx={{ color: 'white' }} />
            </Avatar>
            <Box>
              <Typography variant="h4" sx={{
                fontWeight: 700,
                color: 'white',
                textShadow: '0 2px 4px rgba(0,0,0,0.5)',
                mb: 0.5
              }}>
                Créer un Nouveau Template
              </Typography>
              <Typography variant="body1" sx={{
                color: 'rgba(255,255,255,0.95)',
                fontWeight: 300
              }}>
                Créez votre template d'email en quelques étapes simples
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
                    {index === 2 && <DescriptionIcon fontSize="small" />}
                    {index === 3 && <PreviewIcon fontSize="small" />}
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
                    label="Nom du template *"
                    value={templateData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    placeholder="ex: Devis standard"
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
                    label="Sujet de l'email *"
                    value={templateData.subject}
                    onChange={(e) => handleInputChange('subject', e.target.value)}
                    placeholder="ex: Votre devis {{quote.number}}"
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
                    label="Auteur"
                    value={templateData.author}
                    onChange={(e) => handleInputChange('author', e.target.value)}
                    placeholder="ex: Équipe LIS"
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
                        • Utilisez des placeholders comme <code style={{ background: 'rgba(255,255,255,0.2)', padding: '2px 4px', borderRadius: 2 }}>{'{{customer.name}}'}</code>
                      </Typography>
                      <Typography variant="body2" sx={{ mb: 1, opacity: 0.9 }}>
                        • Le sujet peut contenir des variables
                      </Typography>
                      <Typography variant="body2" sx={{ opacity: 0.9 }}>
                        • L'auteur est optionnel mais recommandé
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
                Configuration
              </Typography>
              
              <Grid container spacing={3}>
                <Grid item xs={12} md={8}>
                  <FormControl fullWidth sx={{ mb: 3 }}>
                    <InputLabel>Types d'objets supportés</InputLabel>
                    <Select
                      multiple
                      value={templateData.supportedObjectTypes}
                      onChange={(e) => handleInputChange('supportedObjectTypes', e.target.value)}
                      renderValue={(selected) => (
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                          {selected.map((value) => (
                            <Chip key={value} label={value} size="small" />
                          ))}
                        </Box>
                      )}
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
                      {extractedObjectTypes.length > 0 ? (
                        extractedObjectTypes.map((schema: any) => (
                          <MenuItem key={schema.typeName} value={schema.typeName}>
                            {schema.typeName}
                          </MenuItem>
                        ))
                      ) : (
                        <MenuItem disabled>
                          Aucun type d'objet disponible
                        </MenuItem>
                      )}
                    </Select>
                  </FormControl>
                  {extractedObjectTypes.length === 0 && (
                    <Alert severity="info" sx={{ mb: 2 }}>
                      Aucun type d'objet n'est actuellement disponible. 
                      Vous pouvez en créer dans la section "Types d'objets".
                    </Alert>
                  )}

                  <Typography variant="subtitle1" sx={{ mb: 2, color: '#2c3e50', fontWeight: 600 }}>
                    Tags
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2 }}>
                    {templateData.tags.map((tag) => (
                      <Chip
                        key={tag}
                        label={tag}
                        onDelete={() => handleRemoveTag(tag)}
                        color="primary"
                        variant="outlined"
                        sx={{ borderRadius: 2 }}
                      />
                    ))}
                  </Box>
                  <TextField
                    size="small"
                    placeholder="Ajouter un tag"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        handleAddTag((e.target as HTMLInputElement).value);
                        (e.target as HTMLInputElement).value = '';
                      }
                    }}
                    sx={{
                      borderRadius: 2,
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2
                      }
                    }}
                  />
                </Grid>
                <Grid item xs={12} md={4}>
                  <Card sx={{ 
                    background: 'linear-gradient(135deg, #e74c3c 0%, #c0392b 100%)',
                    color: 'white',
                    borderRadius: 3,
                    border: '1px solid rgba(255, 255, 255, 0.2)'
                  }}>
                    <CardContent>
                      <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                        <PaletteIcon />
                        Personnalisation
                      </Typography>
                      <Typography variant="body2" sx={{ mb: 1, opacity: 0.9 }}>
                        • Les types d'objets permettent la validation
                      </Typography>
                      <Typography variant="body2" sx={{ mb: 1, opacity: 0.9 }}>
                        • Les tags facilitent l'organisation
                      </Typography>
                      <Typography variant="body2" sx={{ opacity: 0.9 }}>
                        • Vous pourrez modifier ces paramètres plus tard
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
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
                <DescriptionIcon />
                Contenu du template
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
                        <CodeIcon fontSize="small" />
                        Contenu HTML
                      </Box>
                    } 
                  />
                  <Tab 
                    label={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <SubjectIcon fontSize="small" />
                        Contenu texte
                      </Box>
                    } 
                  />
                </Tabs>
              </Box>
              
              {/* Contenu des onglets */}
              {activeTab === 0 && (
                <Box>
                  {/* Barre d'outils modernisée */}
                  <Box sx={{ 
                    background: 'linear-gradient(135deg, #34495e 0%, #2c3e50 100%)',
                    borderRadius: '8px 8px 0 0',
                    p: 2,
                    display: 'flex',
                    gap: 1,
                    flexWrap: 'wrap',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    border: '1px solid rgba(255, 255, 255, 0.1)'
                  }}>
                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                      <Tooltip title="Gras">
                        <IconButton 
                          size="small" 
                          onClick={() => handleFormatClick('bold')}
                          sx={{ 
                            color: 'white',
                            '&:hover': { backgroundColor: 'rgba(255, 255, 255, 0.1)' }
                          }}
                        >
                          <FormatBoldIcon />
                        </IconButton>
                      </Tooltip>
                      
                      <Tooltip title="Italique">
                        <IconButton 
                          size="small" 
                          onClick={() => handleFormatClick('italic')}
                          sx={{ 
                            color: 'white',
                            '&:hover': { backgroundColor: 'rgba(255, 255, 255, 0.1)' }
                          }}
                        >
                          <FormatItalicIcon />
                        </IconButton>
                      </Tooltip>
                      
                      <Tooltip title="Souligné">
                        <IconButton 
                          size="small" 
                          onClick={() => handleFormatClick('underline')}
                          sx={{ 
                            color: 'white',
                            '&:hover': { backgroundColor: 'rgba(255, 255, 255, 0.1)' }
                          }}
                        >
                          <FormatUnderlinedIcon />
                        </IconButton>
                      </Tooltip>
                      
                      <Divider orientation="vertical" flexItem sx={{ borderColor: 'rgba(255, 255, 255, 0.2)' }} />
                      
                      <Tooltip title="Liste à puces">
                        <IconButton 
                          size="small" 
                          onClick={() => handleFormatClick('insertUnorderedList')}
                          sx={{ 
                            color: 'white',
                            '&:hover': { backgroundColor: 'rgba(255, 255, 255, 0.1)' }
                          }}
                        >
                          <FormatListBulletedIcon />
                        </IconButton>
                      </Tooltip>
                      
                      <Tooltip title="Liste numérotée">
                        <IconButton 
                          size="small" 
                          onClick={() => handleFormatClick('insertOrderedList')}
                          sx={{ 
                            color: 'white',
                            '&:hover': { backgroundColor: 'rgba(255, 255, 255, 0.1)' }
                          }}
                        >
                          <FormatListNumberedIcon />
                        </IconButton>
                      </Tooltip>
                      
                      <Divider orientation="vertical" flexItem sx={{ borderColor: 'rgba(255, 255, 255, 0.2)' }} />
                      
                      <Tooltip title="Aligner à gauche">
                        <IconButton 
                          size="small" 
                          onClick={() => handleFormatClick('justifyLeft')}
                          sx={{ 
                            color: 'white',
                            '&:hover': { backgroundColor: 'rgba(255, 255, 255, 0.1)' }
                          }}
                        >
                          <FormatAlignLeftIcon />
                        </IconButton>
                      </Tooltip>
                      
                      <Tooltip title="Centrer">
                        <IconButton 
                          size="small" 
                          onClick={() => handleFormatClick('justifyCenter')}
                          sx={{ 
                            color: 'white',
                            '&:hover': { backgroundColor: 'rgba(255, 255, 255, 0.1)' }
                          }}
                        >
                          <FormatAlignCenterIcon />
                        </IconButton>
                      </Tooltip>
                      
                      <Tooltip title="Aligner à droite">
                        <IconButton 
                          size="small" 
                          onClick={() => handleFormatClick('justifyRight')}
                          sx={{ 
                            color: 'white',
                            '&:hover': { backgroundColor: 'rgba(255, 255, 255, 0.1)' }
                          }}
                        >
                          <FormatAlignRightIcon />
                        </IconButton>
                      </Tooltip>
                      
                      <Tooltip title="Justifier">
                        <IconButton 
                          size="small" 
                          onClick={() => handleFormatClick('justifyFull')}
                          sx={{ 
                            color: 'white',
                            '&:hover': { backgroundColor: 'rgba(255, 255, 255, 0.1)' }
                          }}
                        >
                          <FormatAlignJustifyIcon />
                        </IconButton>
                      </Tooltip>
                      
                      <Divider orientation="vertical" flexItem sx={{ borderColor: 'rgba(255, 255, 255, 0.2)' }} />
                      
                      <Tooltip title="Insérer un lien">
                        <IconButton 
                          size="small" 
                          onClick={handleLinkClick}
                          sx={{ 
                            color: 'white',
                            '&:hover': { backgroundColor: 'rgba(255, 255, 255, 0.1)' }
                          }}
                        >
                          <LinkIcon />
                        </IconButton>
                      </Tooltip>
                      
                      <Tooltip title="Insérer une image">
                        <IconButton 
                          size="small" 
                          onClick={handleImageClick}
                          sx={{ 
                            color: 'white',
                            '&:hover': { backgroundColor: 'rgba(255, 255, 255, 0.1)' }
                          }}
                        >
                          <ImageIcon />
                        </IconButton>
                      </Tooltip>
                    </Box>
                    
                    <Tooltip title={showHtmlPreview ? "Masquer la prévisualisation" : "Afficher la prévisualisation"}>
                      <IconButton 
                        size="small" 
                        onClick={() => setShowHtmlPreview(!showHtmlPreview)}
                        sx={{ 
                          color: showHtmlPreview ? '#f39c12' : 'white',
                          '&:hover': { backgroundColor: 'rgba(255, 255, 255, 0.1)' }
                        }}
                      >
                        {showHtmlPreview ? <VisibilityOffIcon /> : <VisibilityIcon />}
                      </IconButton>
                    </Tooltip>
                  </Box>
                  
                  {/* Zone d'édition et prévisualisation */}
                  <Box sx={{ display: 'flex', gap: 2 }}>
                    {/* Zone d'édition HTML */}
                    <Box sx={{ flex: showHtmlPreview ? 1 : 1 }}>
                      <div
                        ref={editorRef}
                        contentEditable
                        suppressContentEditableWarning
                        onInput={(e) => handleHtmlChange(e.currentTarget.innerHTML)}
                        style={{
                          border: '1px solid #bdc3c7',
                          borderTop: 'none',
                          borderRadius: '0 0 8px 8px',
                          padding: '20px',
                          minHeight: '300px',
                          maxHeight: '500px',
                          overflow: 'auto',
                          backgroundColor: 'white',
                          outline: 'none',
                          fontSize: '14px',
                          lineHeight: '1.6'
                        }}
                        onFocus={(e) => {
                          e.target.style.borderColor = '#3498db';
                          e.target.style.boxShadow = '0 0 0 2px rgba(52, 152, 219, 0.2)';
                        }}
                        onBlur={(e) => {
                          e.target.style.borderColor = '#bdc3c7';
                          e.target.style.boxShadow = 'none';
                          handleEditorBlur();
                        }}
                        onKeyDown={(e) => {
                          // Empêcher la perte du focus lors de la navigation
                          if (e.key === 'Tab') {
                            e.preventDefault();
                            document.execCommand('insertHTML', false, '&nbsp;&nbsp;&nbsp;&nbsp;');
                          }
                        }}
                      />
                    </Box>
                    
                    {/* Prévisualiseur HTML */}
                    {showHtmlPreview && (
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="subtitle2" sx={{ mb: 1, color: '#2c3e50', fontWeight: 600 }}>
                          Prévisualisation en temps réel :
                        </Typography>
                        <Box
                          sx={{
                            border: '1px solid #bdc3c7',
                            borderRadius: '0 0 8px 8px',
                            padding: '20px',
                            minHeight: '300px',
                            maxHeight: '500px',
                            overflow: 'auto',
                            backgroundColor: 'white',
                            '& *': {
                              maxWidth: '100%'
                            }
                          }}
                          dangerouslySetInnerHTML={{ __html: templateData.htmlBody || '<p style="color: #999; font-style: italic;">Aucun contenu à prévisualiser...</p>' }}
                        />
                      </Box>
                    )}
                  </Box>
                  
                  {/* Placeholders pour HTML */}
                  <Box sx={{ mt: 3 }}>
                    <Typography variant="subtitle1" sx={{ mb: 2, color: '#2c3e50', fontWeight: 600 }}>
                      Placeholders disponibles (cliquez pour insérer à la position du curseur) :
                    </Typography>
                    {availablePlaceholders.length > 0 ? (
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                        {availablePlaceholders.map((placeholder) => (
                          <Chip
                            key={placeholder}
                            label={placeholder}
                            onClick={() => handlePlaceholderClick(placeholder, 'htmlBody')}
                            color="primary"
                            variant="outlined"
                            size="small"
                            sx={{ 
                              cursor: 'pointer',
                              borderRadius: 2,
                              '&:hover': {
                                backgroundColor: '#3498db',
                                color: 'white',
                                transform: 'translateY(-1px)',
                                boxShadow: '0 4px 8px rgba(52, 152, 219, 0.3)'
                              }
                            }}
                          />
                        ))}
                      </Box>
                    ) : (
                      <Alert severity="info" sx={{ py: 1, borderRadius: 2 }}>
                        Sélectionnez des types d'objets dans l'étape Configuration pour voir les placeholders disponibles
                      </Alert>
                    )}
                  </Box>
                </Box>
              )}
              
              {activeTab === 1 && (
                <Box>
                  <Typography variant="h6" sx={{ mb: 2, color: '#2c3e50', fontWeight: 600 }}>
                    Contenu texte (optionnel)
                  </Typography>
                  <TextField
                    fullWidth
                    multiline
                    rows={12}
                    label="Contenu texte"
                    value={templateData.textBody}
                    onChange={(e) => handleInputChange('textBody', e.target.value)}
                    placeholder={`Bonjour {{customer.name}}

Votre devis {{quote.number}} pour {{quote.total}} est prêt.`}
                    data-field="textBody"
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
                  
                  {/* Placeholders pour texte */}
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="subtitle1" sx={{ mb: 2, color: '#2c3e50', fontWeight: 600 }}>
                      Placeholders disponibles (cliquez pour insérer à la position du curseur) :
                    </Typography>
                    {availablePlaceholders.length > 0 ? (
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                        {availablePlaceholders.map((placeholder) => (
                          <Chip
                            key={placeholder}
                            label={placeholder}
                            onClick={() => handlePlaceholderClick(placeholder, 'textBody')}
                            color="secondary"
                            variant="outlined"
                            size="small"
                            sx={{ 
                              cursor: 'pointer',
                              borderRadius: 2,
                              '&:hover': {
                                backgroundColor: '#e74c3c',
                                color: 'white',
                                transform: 'translateY(-1px)',
                                boxShadow: '0 4px 8px rgba(231, 76, 60, 0.3)'
                              }
                            }}
                          />
                        ))}
                      </Box>
                    ) : (
                      <Alert severity="info" sx={{ py: 1, borderRadius: 2 }}>
                        Sélectionnez des types d'objets dans l'étape Configuration pour voir les placeholders disponibles
                      </Alert>
                    )}
                  </Box>
                </Box>
              )}
            </Box>
          )}

          {activeStep === 3 && previewResult && (
            <Box>
              <Typography variant="h5" sx={{ 
                mb: 3, 
                color: '#2c3e50',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: 1
              }}>
                <PreviewIcon />
                Prévisualisation
              </Typography>
              
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Typography variant="h6" sx={{ mb: 2, color: '#2c3e50', fontWeight: 600 }}>
                    Métadonnées
                  </Typography>
                  <Card sx={{ 
                    p: 3, 
                    borderRadius: 3,
                    background: 'linear-gradient(135deg, #ecf0f1 0%, #bdc3c7 100%)',
                    border: '1px solid rgba(255, 255, 255, 0.2)'
                  }}>
                    <Typography variant="body2" sx={{ mb: 1, fontWeight: 600 }}>
                      <strong>Sujet:</strong> {previewResult.subject}
                    </Typography>
                    <Typography variant="body2" sx={{ mb: 1, fontWeight: 600 }}>
                      <strong>Type:</strong> {previewResult.htmlBody ? 'HTML' : 'Texte'}
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      <strong>Taille:</strong> {previewResult.htmlBody?.length || previewResult.textBody?.length || 0} caractères
                    </Typography>
                  </Card>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="h6" sx={{ mb: 2, color: '#2c3e50', fontWeight: 600 }}>
                    Aperçu
                  </Typography>
                  <Box
                    sx={{
                      border: '1px solid #bdc3c7',
                      borderRadius: 3,
                      p: 3,
                      bgcolor: 'white',
                      maxHeight: 300,
                      overflow: 'auto',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                    }}
                    dangerouslySetInnerHTML={{ __html: previewResult.htmlBody || '' }}
                  />
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
        
        {activeStep === 0 && templateData.name && (
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
        
        {activeStep === 1 && (
          <Button
            variant="contained"
            onClick={() => setActiveStep(2)}
            startIcon={<DescriptionIcon />}
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
            onClick={() => setActiveStep(3)}
            startIcon={<PreviewIcon />}
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
        
        {activeStep === 3 && templateData.subject && (
          <Button
            variant="contained"
            onClick={handlePreview}
            startIcon={isPreviewLoading ? <CircularProgress size={20} /> : <PreviewIcon />}
            disabled={isPreviewLoading}
            sx={{
              background: 'linear-gradient(45deg, #f39c12 30%, #e67e22 90%)',
              '&:hover': {
                background: 'linear-gradient(45deg, #e67e22 30%, #d35400 90%)'
              }
            }}
          >
            Prévisualiser
          </Button>
        )}
        
        {activeStep === 3 && (
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
            {isSubmitting ? 'Création...' : 'Créer le template'}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default SimpleTemplateCreator; 