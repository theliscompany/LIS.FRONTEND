import React, { useState, useEffect } from 'react';
import {
  Box,
  TextField,
  Button,
  Grid,
  Chip,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  FormControlLabel,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Alert,
  CircularProgress,
  Paper,
  Tabs,
  Tab,
  Autocomplete,
  InputAdornment,
  Avatar
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  Add as AddIcon,
  Code as CodeIcon,
  Settings as SettingsIcon,
  Preview as PreviewIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  Email as EmailIcon,
  Subject as SubjectIcon,
  Tag as TagIcon,
  Person as PersonIcon,
  Language as LanguageIcon,
  CheckCircle as CheckCircleIcon,
  Info as InfoIcon,
  Warning as WarningIcon,
  Edit as EditIcon
} from '@mui/icons-material';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { 
  postApiEmailTemplateMutation,
  putApiEmailTemplateByIdMutation,
  postApiEmailTemplateRenderDirectMutation,
  postApiEmailTemplateExtractPlaceholdersMutation,
  getApiEmailTemplateObjectTypesOptions
} from '../api/@tanstack/react-query.gen';

interface EmailTemplateFormProps {
  template?: any;
  onSuccess: () => void;
  onCancel?: () => void;
}

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
      id={`template-form-tabpanel-${index}`}
      aria-labelledby={`template-form-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

interface PlaceholderInfo {
  name: string;
  type: string;
  description?: string;
  isRequired: boolean;
  defaultValue?: string;
  allowedValues?: string[];
  source: 'extracted' | 'schema' | 'suggested';
  status: 'valid' | 'invalid' | 'missing' | 'suggested';
}

const EmailTemplateForm: React.FC<EmailTemplateFormProps> = ({ 
  template, 
  onSuccess, 
  onCancel 
}) => {
  const queryClient = useQueryClient();
  
  // State management
  const [activeTab, setActiveTab] = useState(0);
  const [formData, setFormData] = useState({
    name: '',
    subject: '',
    htmlBody: '',
    textBody: '',
    supportedObjectTypes: [] as string[],
    author: '',
    tags: [] as string[],
    configuration: {
      engine: 'liquid',
      allowHtml: true,
      strictMode: false,
      globalVariables: {} as Record<string, string>,
      locale: 'fr',
      timeZone: 'Europe/Paris'
    }
  });
  const [changeDescription, setChangeDescription] = useState('');
  const [newTag, setNewTag] = useState('');
  const [extractedPlaceholders, setExtractedPlaceholders] = useState<string[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [availablePlaceholders, setAvailablePlaceholders] = useState<PlaceholderInfo[]>([]);
  const [missingPlaceholders, setMissingPlaceholders] = useState<PlaceholderInfo[]>([]);
  const [suggestedPlaceholders, setSuggestedPlaceholders] = useState<PlaceholderInfo[]>([]);
  
  // Query pour récupérer tous les types d'objets
  const { 
    data: allObjectTypes 
  } = useQuery(getApiEmailTemplateObjectTypesOptions());



  // Helper function pour extraire les données de l'API
  const safeExtractArray = (data: any): any[] => {
    let result: any[] = [];
    
    // Avec le nouveau SDK, l'API doit retourner un tableau direct selon le Swagger
    if (Array.isArray(data)) {
      result = data;
    } else if (data?.data && Array.isArray(data.data)) {
      // Support legacy pour l'ancienne API
      result = data.data;
    } else if (data && typeof data === 'object') {
      // Recherche dans toutes les propriétés de l'objet
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

  // Extraire les types d'objets
  const extractedObjectTypes = safeExtractArray(allObjectTypes);

  // Mutations
  const createMutation = useMutation(postApiEmailTemplateMutation());
  const updateMutation = useMutation(putApiEmailTemplateByIdMutation());
  const previewMutation = useMutation(postApiEmailTemplateRenderDirectMutation());
  const extractPlaceholdersMutation = useMutation(postApiEmailTemplateExtractPlaceholdersMutation());

  // Initialize form data when template is provided (edit mode)
  useEffect(() => {
    if (template) {
      setFormData({
        name: template.name || '',
        subject: template.subject || '',
        htmlBody: template.htmlBody || '',
        textBody: template.textBody || '',
        supportedObjectTypes: template.supportedObjectTypes || [],
        author: template.author || '',
        tags: template.tags || [],
        configuration: {
          engine: template.configuration?.engine || 'liquid',
          allowHtml: template.configuration?.allowHtml ?? true,
          strictMode: template.configuration?.strictMode ?? false,
          globalVariables: template.configuration?.globalVariables || {},
          locale: (template.configuration?.locale === 'fr-FR' ? 'fr' : template.configuration?.locale) || 'fr',
          timeZone: template.configuration?.timeZone || 'Europe/Paris'
        }
      });
    }
  }, [template]);

  // Extract placeholders when content changes
  useEffect(() => {
    const extractPlaceholdersFromContent = async () => {
      if (formData.htmlBody || formData.textBody) {
        try {
          const content = formData.htmlBody || formData.textBody;
          
          const result = await extractPlaceholdersMutation.mutateAsync({
            body: { body: content }
          });
          
          setExtractedPlaceholders((result as any)?.data?.placeholders || []);
        } catch (error) {
          console.error('Error extracting placeholders:', error);
        }
      }
    };

    const timeoutId = setTimeout(extractPlaceholdersFromContent, 1000);
    return () => clearTimeout(timeoutId);
  }, [formData.htmlBody, formData.textBody, extractPlaceholdersMutation]);

  // Analyse intelligente des placeholders
  useEffect(() => {
    const safeAllObjectTypes = safeExtractArray(allObjectTypes);
    
    // Permettre l'affichage des placeholders extraits même sans types d'objets
    const all: PlaceholderInfo[] = [];
    const missing: PlaceholderInfo[] = [];
    const suggested: PlaceholderInfo[] = [];
    
    // 1. Placeholders extraits (toujours affichés)
    extractedPlaceholders.forEach(placeholder => {
      all.push({
        name: placeholder,
        type: 'string',
        source: 'extracted',
        isRequired: false,
        status: 'valid'
      });
    });
    
    // 2. Analyse des schémas d'objets (seulement si disponibles)
    if (safeAllObjectTypes.length && formData.supportedObjectTypes.length) {
      const supportedSchemas: Record<string, any> = {};
      formData.supportedObjectTypes.forEach(typeName => {
        const schema = safeAllObjectTypes.find((s: any) => s.typeName === typeName);
        if (schema) supportedSchemas[typeName] = schema;
      });
      
      // Schémas d'objets
      Object.entries(supportedSchemas).forEach(([typeName, schema]: [string, any]) => {
        const properties = schema?.properties || {};
        Object.entries(properties).forEach(([propName, propSchema]: [string, any]) => {
          const placeholderName = `${typeName.toLowerCase()}.${propName}`;
          const info: PlaceholderInfo = {
            name: placeholderName,
            type: propSchema.type || 'string',
            description: propSchema.description,
            isRequired: propSchema.isRequired || false,
            defaultValue: propSchema.defaultValue,
            allowedValues: propSchema.allowedValues,
            source: 'schema',
            status: extractedPlaceholders.includes(placeholderName) ? 'valid' : 'suggested'
          };
          if (extractedPlaceholders.includes(placeholderName)) {
            all.push(info);
          } else {
            suggested.push(info);
          }
        });
      });
      
      // 3. Manquants
      extractedPlaceholders.forEach(placeholder => {
        const isInSchema = Object.values(supportedSchemas).some((schema: any) => {
          const properties = schema?.properties || {};
          return Object.keys(properties).some(prop => `${schema.typeName?.toLowerCase()}.${prop}` === placeholder);
        });
        if (!isInSchema) {
          missing.push({
            name: placeholder,
            type: 'unknown',
            source: 'extracted',
            isRequired: false,
            status: 'missing'
          });
        }
      });
    }
    
    setAvailablePlaceholders(all);
    setMissingPlaceholders(missing);
    setSuggestedPlaceholders(suggested);
  }, [extractedPlaceholders, formData.supportedObjectTypes, allObjectTypes]);

  // Handlers
  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleConfigurationChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      configuration: {
        ...prev.configuration,
        [field]: value
      }
    }));
  };

  const handleAddTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }));
      setNewTag('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Le nom du template est requis';
    }
    if (!formData.subject.trim()) {
      newErrors.subject = 'Le sujet est requis';
    }
    if (!formData.htmlBody.trim() && !formData.textBody.trim()) {
      newErrors.htmlBody = 'Au moins un corps de message (HTML ou texte) est requis';
    }
    if (!formData.author.trim()) {
      newErrors.author = "L'auteur est requis";
    }
    if (template && !changeDescription.trim()) {
      newErrors.changeDescription = 'La description des changements est requise pour les mises à jour';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      if (template) {
        // Update existing template
        // Incrémenter automatiquement la version
        const currentVersion = template.currentVersion || '1.0';
        const versionParts = currentVersion.split('.');
        const major = parseInt(versionParts[0]) || 1;
        const minor = parseInt(versionParts[1]) || 0;
        const newVersion = `${major}.${minor + 1}`;

        await updateMutation.mutateAsync({
          path: { id: template.id },
          body: {
            ...formData,
            currentVersion: newVersion,
            changeDescription: changeDescription || 'Mise à jour via l\'interface'
          }
        });
      } else {
        // Create new template
        await createMutation.mutateAsync({
          body: formData
        });
      }
      
      queryClient.invalidateQueries({ queryKey: ['getApiEmailTemplate'] });
      onSuccess();
    } catch (error) {
      console.error('Error saving template:', error);
      setErrors({ submit: 'Erreur lors de la sauvegarde du template' });
    }
  };

  const handlePreview = async () => {
    try {
      const result = await previewMutation.mutateAsync({
        body: {
          subject: formData.subject,
          htmlBody: formData.htmlBody,
          textBody: formData.textBody,
          sampleData: {}, // previewData is removed
          configuration: formData.configuration
        }
      }) as any;
      
      // Show preview in a new window or modal
      const previewWindow = window.open('', '_blank');
      if (previewWindow) {
        previewWindow.document.write(`
          <html>
            <head>
              <title>Aperçu - ${formData.subject}</title>
              <style>
                body { font-family: Arial, sans-serif; margin: 20px; }
                .preview-container { max-width: 600px; margin: 0 auto; }
                .preview-header { background: #f5f5f5; padding: 15px; border-radius: 5px; margin-bottom: 20px; }
                .preview-content { border: 1px solid #ddd; padding: 20px; border-radius: 5px; }
              </style>
            </head>
            <body>
              <div class="preview-container">
                <div class="preview-header">
                  <h3>Sujet: ${result?.subject || formData.subject}</h3>
                  <p><strong>De:</strong> ${formData.author}</p>
                </div>
                <div class="preview-content">
                  ${result?.htmlBody || result?.textBody || 'Aucun contenu'}
                </div>
              </div>
            </body>
          </html>
        `);
        previewWindow.document.close();
      }
    } catch (error) {
      console.error('Error generating preview:', error);
      setErrors({ preview: 'Erreur lors de la génération de l\'aperçu' });
    }
  };

  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  const copyToClipboard = (placeholder: string) => {
    navigator.clipboard.writeText(`{{${placeholder}}}`);
  };

  return (
    <Box sx={{ width: '100%' }}>
             {/* Header moderne avec contraste amélioré */}
       <Box sx={{
         background: 'linear-gradient(135deg, #2c3e50 0%, #34495e 100%)',
         borderRadius: 3,
         p: 4,
         mb: 4,
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
               {template ? <EditIcon sx={{ color: 'white' }} /> : <AddIcon sx={{ color: 'white' }} />}
             </Avatar>
             <Box>
               <Typography variant="h4" sx={{ 
                 fontWeight: 700, 
                 color: 'white',
                 textShadow: '0 2px 4px rgba(0,0,0,0.5)',
                 mb: 0.5
               }}>
                 {template ? 'Modifier le Template' : 'Créer un Nouveau Template'}
               </Typography>
               <Typography variant="body1" sx={{ 
                 color: 'rgba(255,255,255,0.95)', 
                 fontWeight: 300
               }}>
                 Configurez votre template d'email avec tous les paramètres nécessaires
               </Typography>
             </Box>
           </Box>

           {/* Indicateurs de statut avec contraste amélioré */}
           {template && (
             <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
               <Chip
                 label={`Version ${template.currentVersion || '1.0'}`}
                 size="small"
                 sx={{
                   background: 'rgba(255, 255, 255, 0.15)',
                   color: 'white',
                   border: '1px solid rgba(255, 255, 255, 0.25)',
                   '& .MuiChip-label': { fontWeight: 600 }
                 }}
               />
               <Chip
                 label={`${template.usageCount || 0} utilisations`}
                 size="small"
                 sx={{
                   background: 'rgba(255, 255, 255, 0.1)',
                   color: 'white',
                   border: '1px solid rgba(255, 255, 255, 0.2)'
                 }}
               />
               {template.isActive && (
                 <Chip
                   label="Actif"
                   size="small"
                   sx={{
                     background: 'rgba(76, 175, 80, 0.8)',
                     color: 'white',
                     border: '1px solid rgba(76, 175, 80, 0.9)',
                     fontWeight: 600
                   }}
                 />
               )}
             </Box>
           )}
         </Box>
       </Box>

      {/* Error Alert moderne */}
      {errors.submit && (
        <Alert 
          severity="error" 
          sx={{ 
            mb: 3,
            background: 'rgba(244, 67, 54, 0.1)',
            border: '1px solid rgba(244, 67, 54, 0.3)',
            borderRadius: 2,
            '& .MuiAlert-icon': { color: '#f44336' }
          }}
        >
          {errors.submit}
        </Alert>
      )}

             {/* Tabs avec contraste amélioré */}
       <Box sx={{ 
         background: 'rgba(44, 62, 80, 0.1)',
         borderRadius: 2,
         p: 1,
         mb: 3,
         border: '1px solid rgba(44, 62, 80, 0.2)'
       }}>
         <Tabs 
           value={activeTab} 
           onChange={handleTabChange} 
           aria-label="template form tabs"
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
                <EmailIcon fontSize="small" />
                Contenu
              </Box>
            } 
          />
          <Tab 
            label={
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <SettingsIcon fontSize="small" />
                Configuration
              </Box>
            } 
          />
          <Tab 
            label={
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <CodeIcon fontSize="small" />
                Placeholders
                                 {extractedPlaceholders.length > 0 && (
                   <Chip 
                     label={extractedPlaceholders.length} 
                     size="small" 
                     sx={{ 
                       height: 20, 
                       fontSize: '0.7rem',
                       background: '#2c3e50',
                       color: 'white',
                       ml: 0.5
                     }}
                   />
                 )}
              </Box>
            } 
          />
        </Tabs>
      </Box>

      {/* Tab Panels */}
      <TabPanel value={activeTab} index={0}>
        <Grid container spacing={3}>
          {/* Basic Information */}
          <Grid item xs={12}>
            <Paper sx={{ p: 3, mb: 3 }}>
              <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                <SubjectIcon />
                Informations de Base
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Nom du Template"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    error={!!errors.name}
                    helperText={errors.name}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <SubjectIcon color="action" />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Sujet de l'Email"
                    value={formData.subject}
                    onChange={(e) => handleInputChange('subject', e.target.value)}
                    error={!!errors.subject}
                    helperText={errors.subject}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <SubjectIcon color="action" />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Auteur"
                    value={formData.author}
                    onChange={(e) => handleInputChange('author', e.target.value)}
                    error={!!errors.author}
                    helperText={errors.author}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <PersonIcon color="action" />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>
                                 <Grid item xs={12} md={6}>
                   <FormControl fullWidth>
                     <InputLabel>Langue</InputLabel>
                     <Select
                       value={formData.configuration.locale}
                       onChange={(e) => handleConfigurationChange('locale', e.target.value)}
                       startAdornment={
                         <InputAdornment position="start">
                           <LanguageIcon color="action" />
                         </InputAdornment>
                       }
                     >
                       <MenuItem value="fr">Français</MenuItem>
                       <MenuItem value="en">English</MenuItem>
                       <MenuItem value="nl">Nederlands</MenuItem>
                     </Select>
                   </FormControl>
                 </Grid>
                                   {template && (
                    <>
                      <Grid item xs={12} md={6}>
                        <TextField
                          fullWidth
                          label="Version actuelle"
                          value={template.currentVersion || '1.0'}
                          InputProps={{ readOnly: true }}
                          helperText="Version actuellement stockée"
                        />
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <TextField
                          fullWidth
                          label="Nouvelle version"
                          value={(() => {
                            const currentVersion = template.currentVersion || '1.0';
                            const versionParts = currentVersion.split('.');
                            const major = parseInt(versionParts[0]) || 1;
                            const minor = parseInt(versionParts[1]) || 0;
                            return `${major}.${minor + 1}`;
                          })()}
                          InputProps={{ readOnly: true }}
                          helperText="Version qui sera créée"
                                                     sx={{ 
                             '& .MuiInputBase-input': { 
                               color: '#28a745',
                               fontWeight: 'bold'
                             }
                           }}
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <TextField
                          fullWidth
                          label="Description des changements"
                          value={changeDescription}
                          onChange={(e) => setChangeDescription(e.target.value)}
                          placeholder="Décrivez les modifications apportées au template..."
                          helperText="Cette description sera enregistrée avec la nouvelle version du template"
                          error={!!errors.changeDescription}
                          multiline
                          rows={2}
                        />
                      </Grid>
                    </>
                  )}
              </Grid>
            </Paper>
          </Grid>

          {/* Tags */}
          <Grid item xs={12}>
            <Paper sx={{ p: 3, mb: 3 }}>
              <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                <TagIcon />
                Tags
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, mb: 2, alignItems: 'center' }}>
                <TextField
                  size="small"
                  placeholder="Ajouter un tag..."
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleAddTag()}
                  sx={{ flexGrow: 1, maxWidth: 200 }}
                />
                <Button
                  variant="outlined"
                  size="small"
                  onClick={handleAddTag}
                  startIcon={<AddIcon />}
                >
                  Ajouter
                </Button>
              </Box>
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                {formData.tags.map((tag, index) => (
                  <Chip
                    key={index}
                    label={tag}
                    onDelete={() => handleRemoveTag(tag)}
                    color="primary"
                    variant="outlined"
                  />
                ))}
              </Box>
            </Paper>
          </Grid>

          {/* Email Content */}
          <Grid item xs={12}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                <EmailIcon />
                Contenu de l'Email
              </Typography>
              
                             {/* Placeholder Helper avec contraste amélioré */}
               {formData.supportedObjectTypes.length > 0 && (
                 <Box sx={{ mb: 3, p: 2, bgcolor: '#f8f9fa', borderRadius: 1, border: '1px solid', borderColor: '#e9ecef' }}>
                   <Typography variant="subtitle2" sx={{ mb: 1, display: 'flex', alignItems: 'center', gap: 1, color: '#2c3e50' }}>
                     <CodeIcon fontSize="small" />
                     Placeholders Disponibles
                   </Typography>
                   <Typography variant="body2" sx={{ mb: 2, color: '#495057' }}>
                     Cliquez sur un placeholder pour l'insérer dans le corps du message
                   </Typography>
                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                    {formData.supportedObjectTypes.map((objectType) => {
                      // Trouver le schéma de l'objet dans allObjectTypes
                      const safeAllObjectTypes = safeExtractArray(allObjectTypes);
                      const objectSchema = safeAllObjectTypes.find((schema: any) => schema.typeName === objectType);
                      const properties = objectSchema?.properties || {};
                      
                      return (
                        <Box key={objectType} sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                                                     <Typography variant="caption" sx={{ fontWeight: 'bold', color: '#2c3e50' }}>
                             {objectType}:
                           </Typography>
                          <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                            {/* Placeholders dynamiques basés sur le schéma de l'objet */}
                            {Object.entries(properties).map(([propName, propSchema]: [string, any]) => (
                              <Chip
                                key={`${objectType}.${propName}`}
                                label={`${objectType.toLowerCase()}.${propName}`}
                                size="small"
                                variant="outlined"
                                color="primary"
                                onClick={() => {
                                  const placeholder = `{{${objectType.toLowerCase()}.${propName}}}`;
                                  const currentValue = formData.htmlBody || formData.textBody;
                                  const newValue = currentValue + placeholder;
                                  
                                  // Insérer dans le champ actif (HTML ou texte)
                                  if (formData.htmlBody) {
                                    handleInputChange('htmlBody', newValue);
                                  } else {
                                    handleInputChange('textBody', newValue);
                                  }
                                }}
                                title={`${propSchema.description || ''} (${propSchema.type || 'string'})`}
                                                                 sx={{ 
                                   cursor: 'pointer',
                                   '&:hover': { bgcolor: '#2c3e50', color: 'white' }
                                 }}
                              />
                            ))}
                            {/* Fallback si pas de schéma disponible */}
                            {Object.keys(properties).length === 0 && (
                              <>
                                {['id', 'name', 'email', 'phone', 'address', 'createdAt', 'updatedAt'].map((prop) => (
                                  <Chip
                                    key={`${objectType}.${prop}`}
                                    label={`${objectType.toLowerCase()}.${prop}`}
                                    size="small"
                                    variant="outlined"
                                    color="secondary"
                                    onClick={() => {
                                      const placeholder = `{{${objectType.toLowerCase()}.${prop}}}`;
                                      const currentValue = formData.htmlBody || formData.textBody;
                                      const newValue = currentValue + placeholder;
                                      
                                      if (formData.htmlBody) {
                                        handleInputChange('htmlBody', newValue);
                                      } else {
                                        handleInputChange('textBody', newValue);
                                      }
                                    }}
                                                                         sx={{ 
                                       cursor: 'pointer',
                                       '&:hover': { bgcolor: '#6c757d', color: 'white' }
                                     }}
                                  />
                                ))}
                              </>
                            )}
                          </Box>
                        </Box>
                      );
                    })}
                  </Box>
                </Box>
              )}
              
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Corps HTML"
                    multiline
                    rows={8}
                    value={formData.htmlBody}
                    onChange={(e) => handleInputChange('htmlBody', e.target.value)}
                    error={!!errors.htmlBody}
                    helperText={errors.htmlBody || 'Utilisez {{{{variable}}}} pour les placeholders'}
                    placeholder="<h1>Bonjour {{nom}}</h1><p>Votre commande {{numero}} a été confirmée.</p>"
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Corps Texte"
                    multiline
                    rows={8}
                    value={formData.textBody}
                    onChange={(e) => handleInputChange('textBody', e.target.value)}
                    placeholder="Bonjour {{nom}}, Votre commande {{numero}} a été confirmée."
                    helperText="Version texte pour les clients qui ne supportent pas HTML"
                  />
                </Grid>
              </Grid>
            </Paper>
          </Grid>
        </Grid>
      </TabPanel>

      <TabPanel value={activeTab} index={1}>
        <Grid container spacing={3}>
          {/* Object Types */}
          <Grid item xs={12}>

            
            <Paper sx={{ p: 3, mb: 3 }}>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Types d'Objets Supportés
              </Typography>
              <Autocomplete
                multiple
                freeSolo
                options={extractedObjectTypes.map((schema: any) => schema.typeName)}
                value={formData.supportedObjectTypes}
                onChange={(_, newValue) => {
                  handleInputChange('supportedObjectTypes', newValue);
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Types d'objets"
                    placeholder="Ajouter un type d'objet..."
                  />
                )}
                renderTags={(value, getTagProps) =>
                  value.map((option, index) => {
                    const { key, ...chipProps } = getTagProps({ index });
                    return (
                      <Chip
                        key={key}
                        variant="outlined"
                        label={option}
                        {...chipProps}
                      />
                    );
                  })
                }
              />
            </Paper>
          </Grid>

          {/* Configuration */}
          <Grid item xs={12}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Configuration Avancée
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth>
                    <InputLabel>Moteur de Template</InputLabel>
                    <Select
                      value={formData.configuration.engine}
                      onChange={(e) => handleConfigurationChange('engine', e.target.value)}
                    >
                      <MenuItem value="liquid">Liquid</MenuItem>
                      <MenuItem value="handlebars">Handlebars</MenuItem>
                      <MenuItem value="mustache">Mustache</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth>
                    <InputLabel>Fuseau Horaire</InputLabel>
                    <Select
                      value={formData.configuration.timeZone}
                      onChange={(e) => handleConfigurationChange('timeZone', e.target.value)}
                    >
                      <MenuItem value="Europe/Paris">Europe/Paris</MenuItem>
                      <MenuItem value="UTC">UTC</MenuItem>
                      <MenuItem value="America/New_York">America/New_York</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={formData.configuration.allowHtml}
                        onChange={(e) => handleConfigurationChange('allowHtml', e.target.checked)}
                      />
                    }
                    label="Autoriser le HTML"
                  />
                </Grid>
                <Grid item xs={12}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={formData.configuration.strictMode}
                        onChange={(e) => handleConfigurationChange('strictMode', e.target.checked)}
                      />
                    }
                    label="Mode Strict (validation stricte des placeholders)"
                  />
                </Grid>
              </Grid>
            </Paper>
          </Grid>
        </Grid>
      </TabPanel>

      <TabPanel value={activeTab} index={2}>
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" sx={{ mb: 2 }}>Placeholders Intelligents</Typography>
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 3 }}>
            <Chip label={`${availablePlaceholders.length} détectés`} color="success" size="small" />
            <Chip label={`${missingPlaceholders.length} manquants`} color="warning" size="small" />
            <Chip label={`${suggestedPlaceholders.length} suggérés`} color="info" size="small" />
          </Box>
          {availablePlaceholders.length > 0 && (
            <Accordion defaultExpanded sx={{ mb: 2 }}>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <CheckCircleIcon color="success" />
                  <Typography>Placeholders Détectés ({availablePlaceholders.length})</Typography>
                </Box>
              </AccordionSummary>
              <AccordionDetails>
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                  {availablePlaceholders.map((placeholder, index) => (
                    <Chip
                      key={index}
                      label={placeholder.name}
                      color="success"
                      variant="outlined"
                      icon={<CodeIcon />}
                      onClick={() => copyToClipboard(placeholder.name)}
                      title={`${placeholder.description || ''} (${placeholder.type})`}
                    />
                  ))}
                </Box>
              </AccordionDetails>
            </Accordion>
          )}
          {suggestedPlaceholders.length > 0 && (
            <Accordion sx={{ mb: 2 }}>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <InfoIcon color="info" />
                  <Typography>Placeholders Suggérés ({suggestedPlaceholders.length})</Typography>
                </Box>
              </AccordionSummary>
              <AccordionDetails>
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                  {suggestedPlaceholders.map((placeholder, index) => (
                    <Chip
                      key={index}
                      label={placeholder.name}
                      color="info"
                      variant="outlined"
                      icon={<CodeIcon />}
                      onClick={() => copyToClipboard(placeholder.name)}
                      title={`${placeholder.description || ''} (${placeholder.type})`}
                    />
                  ))}
                </Box>
              </AccordionDetails>
            </Accordion>
          )}
          {missingPlaceholders.length > 0 && (
            <Accordion sx={{ mb: 2 }}>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <WarningIcon color="warning" />
                  <Typography>Placeholders Manquants ({missingPlaceholders.length})</Typography>
                </Box>
              </AccordionSummary>
              <AccordionDetails>
                <Alert severity="warning" sx={{ mb: 2 }}>
                  Ces placeholders sont utilisés mais ne sont pas définis dans les schémas.
                </Alert>
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                  {missingPlaceholders.map((placeholder, index) => (
                    <Chip
                      key={index}
                      label={placeholder.name}
                      color="warning"
                      variant="outlined"
                      icon={<CodeIcon />}
                    />
                  ))}
                </Box>
              </AccordionDetails>
            </Accordion>
          )}
          {availablePlaceholders.length === 0 && missingPlaceholders.length === 0 && suggestedPlaceholders.length === 0 && (
            <Alert severity="info">
              Aucun placeholder détecté. Ajoutez des types d'objets supportés pour voir les suggestions.
            </Alert>
          )}
        </Paper>
      </TabPanel>

      {/* Actions */}
      <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end', mt: 3, pt: 3, borderTop: 1, borderColor: 'divider' }}>
        <Button
          variant="outlined"
          onClick={onCancel}
          startIcon={<CancelIcon />}
        >
          Annuler
        </Button>
        <Button
          variant="outlined"
          onClick={handlePreview}
          startIcon={<PreviewIcon />}
          disabled={!formData.htmlBody && !formData.textBody}
        >
          Aperçu
        </Button>
                 <Button
           variant="contained"
           onClick={handleSubmit}
           startIcon={isSubmitting ? <CircularProgress size={20} /> : <SaveIcon />}
           disabled={isSubmitting}
           sx={{
             background: 'linear-gradient(45deg, #2c3e50 30%, #34495e 90%)',
             boxShadow: '0 3px 5px 2px rgba(44, 62, 80, .3)',
             '&:hover': {
               background: 'linear-gradient(45deg, #34495e 30%, #2c3e50 90%)'
             }
           }}
         >
          {isSubmitting ? 'Sauvegarde...' : (template ? 'Mettre à jour' : 'Créer')}
        </Button>
      </Box>
    </Box>
  );
};

export default EmailTemplateForm; 