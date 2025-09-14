import React, { useState, useEffect, useMemo } from 'react';
import {
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Alert,
  CircularProgress,
  Paper,
  Card,
  CardContent,
  Divider,
  Chip,
  IconButton,
  Tooltip,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Switch,
  FormControlLabel,
  Tabs,
  Tab
} from '@mui/material';
import {
  Email as EmailIcon,
  Send as SendIcon,
  Cancel as CancelIcon,
  Preview as PreviewIcon,
  ContentCopy as CopyIcon,
  AutoAwesome as AutoIcon,
  CheckCircle as CheckIcon,
  Warning as WarningIcon,
  ExpandMore as ExpandMoreIcon,
  Refresh as RefreshIcon,
  Visibility as ViewIcon,
  Settings as SettingsIcon,
  Description as TemplateIcon
} from '@mui/icons-material';
import { useMutation, useQuery } from '@tanstack/react-query';
import { enqueueSnackbar } from 'notistack';
import { 
  getApiEmailTemplateOptions
} from '@features/template/api/@tanstack/react-query.gen';
import { QuoteEmailService, QuoteEmailData, EmailTemplateResult } from '@features/offer/services/QuoteEmailService';

interface QuoteEmailSenderProps {
  quote: any;
  open: boolean;
  onClose: () => void;
  onSuccess?: (result: EmailTemplateResult) => void;
}

interface MappingResult {
  placeholder: string;
  value: string;
  status: 'found' | 'missing' | 'empty';
}

const QuoteEmailSender: React.FC<QuoteEmailSenderProps> = ({
  quote,
  open,
  onClose,
  onSuccess
}) => {
  const [activeStep, setActiveStep] = useState(0);
  const [selectedTemplateId, setSelectedTemplateId] = useState('');
  const [emailSettings, setEmailSettings] = useState({
    to: quote?.customer?.email || '',
    cc: '',
    bcc: '',
    subject: '',
    autoMapping: true
  });
  const [mappingResults, setMappingResults] = useState<MappingResult[]>([]);
  const [renderResult, setRenderResult] = useState<EmailTemplateResult | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [activeTab, setActiveTab] = useState(0);
  const [customTemplate, setCustomTemplate] = useState({
    htmlBody: '',
    textBody: ''
  });

  // Queries
  const { data: availableTemplates, isLoading: isLoadingTemplates, error: templatesError } = useQuery({
    ...getApiEmailTemplateOptions(),
    enabled: open
  });

  // Helper function to safely extract arrays from API responses
  const safeExtractArray = (data: any): any[] => {
    if (data && typeof data === 'object') {
      console.log('[QuoteEmailSender] API Response structure:', {
        isArray: Array.isArray(data),
        keys: Object.keys(data),
        data: data
      });
    }
    
    if (Array.isArray(data)) return data;
    return data?.data || data?.items || data?.results || [];
  };

  const templates = useMemo(() => {
    return safeExtractArray(availableTemplates);
  }, [availableTemplates]);

  // Mutation pour l'envoi d'email
  const sendEmailMutation = useMutation({
    mutationFn: async (emailData: QuoteEmailData) => {
      return await QuoteEmailService.sendQuoteEmail(quote, emailData);
    },
    onSuccess: (success) => {
      if (success) {
        enqueueSnackbar('Email envoyé avec succès!', { variant: 'success' });
        onSuccess?.(renderResult!);
        onClose();
      } else {
        enqueueSnackbar('Erreur lors de l\'envoi de l\'email', { variant: 'error' });
      }
    },
    onError: (error: any) => {
      console.error('Error sending email:', error);
      setErrors({ 
        send: error.response?.data?.message || 'Erreur lors de l\'envoi de l\'email' 
      });
      enqueueSnackbar('Erreur lors de l\'envoi de l\'email', { variant: 'error' });
    }
  });

  // Mutation pour la prévisualisation
  const previewMutation = useMutation({
    mutationFn: async (emailData: QuoteEmailData) => {
      return await QuoteEmailService.previewQuoteEmail(quote, emailData);
    },
    onSuccess: (result) => {
      setRenderResult(result);
      setActiveStep(2);
    },
    onError: (error: any) => {
      console.error('Error previewing email:', error);
      setErrors({ 
        preview: error.response?.data?.message || 'Erreur lors de la prévisualisation' 
      });
      enqueueSnackbar('Erreur lors de la prévisualisation', { variant: 'error' });
    }
  });

  // Charger le template par défaut si aucun template n'est sélectionné
  useEffect(() => {
    if (open && templates.length > 0 && !selectedTemplateId) {
      setSelectedTemplateId(templates[0].id);
    }
  }, [open, templates, selectedTemplateId]);

  // Charger le template par défaut pour les devis
  useEffect(() => {
    if (open && !customTemplate.htmlBody) {
      const defaultTemplate = QuoteEmailService.getDefaultQuoteTemplate();
      setCustomTemplate(defaultTemplate);
    }
  }, [open, customTemplate.htmlBody]);

  const handleNext = () => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const handleReset = () => {
    setActiveStep(0);
    setRenderResult(null);
    setErrors({});
  };

  const handleTemplateChange = (templateId: string) => {
    setSelectedTemplateId(templateId);
    setActiveStep(0);
    setRenderResult(null);
  };

  const handlePreview = async () => {
    if (!emailSettings.to) {
      setErrors({ to: 'L\'adresse email est requise' });
      return;
    }

    const emailData: QuoteEmailData = {
      to: emailSettings.to,
      cc: emailSettings.cc,
      bcc: emailSettings.bcc,
      subject: emailSettings.subject,
      templateId: selectedTemplateId || undefined,
      customTemplate: activeTab === 1 ? customTemplate : undefined
    };

    previewMutation.mutate(emailData);
  };

  const handleSendEmail = async () => {
    if (!renderResult) return;

    const emailData: QuoteEmailData = {
      to: emailSettings.to,
      cc: emailSettings.cc,
      bcc: emailSettings.bcc,
      subject: emailSettings.subject || renderResult.subject,
      templateId: selectedTemplateId || undefined,
      customTemplate: activeTab === 1 ? customTemplate : undefined
    };

    sendEmailMutation.mutate(emailData);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    enqueueSnackbar('Copié dans le presse-papiers', { variant: 'success' });
  };

  const isRendering = previewMutation.isPending;
  const isSending = sendEmailMutation.isPending;

  const steps = [
    {
      label: '1. Configuration',
      description: 'Sélectionnez le template et configurez l\'email'
    },
    {
      label: '2. Prévisualisation',
      description: 'Aperçu de l\'email avant envoi'
    },
    {
      label: '3. Envoi',
      description: 'Envoi de l\'email au client'
    }
  ];

  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      maxWidth="lg"
      fullWidth
      PaperProps={{
        sx: { borderRadius: 3, maxHeight: '90vh' }
      }}
    >
      <DialogTitle sx={{ bgcolor: 'primary.main', color: 'white' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <EmailIcon />
            Envoyer le devis par email
          </Box>
          <IconButton onClick={onClose} sx={{ color: 'white' }}>
            <CancelIcon />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent sx={{ pt: 3 }}>
        <Grid container spacing={3}>
          {/* Configuration */}
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3, height: '100%' }}>
              <Typography variant="h6" gutterBottom>
                Configuration de l'email
            </Typography>
            
              {/* Sélection du template */}
              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel>Template d'email</InputLabel>
                <Select
                  value={selectedTemplateId}
                  onChange={(e) => handleTemplateChange(e.target.value)}
                  label="Template d'email"
                >
                  {templates.map((template) => (
                    <MenuItem key={template.id} value={template.id}>
                      {template.name || `Template ${template.id}`}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              {/* Onglets pour template sauvegardé vs personnalisé */}
              <Tabs value={activeTab} onChange={(_, newValue) => setActiveTab(newValue)} sx={{ mb: 2 }}>
                <Tab label="Template sauvegardé" icon={<TemplateIcon />} />
                <Tab label="Template personnalisé" icon={<AutoIcon />} />
              </Tabs>

              {activeTab === 0 ? (
                <Alert severity="info" sx={{ mb: 2 }}>
                  Template sélectionné: {templates.find(t => t.id === selectedTemplateId)?.name || 'Template par défaut'}
                    </Alert>
              ) : (
                <Box sx={{ mb: 2 }}>
                  <TextField
                    fullWidth
                    multiline
                    rows={8}
                    label="Template HTML personnalisé"
                    value={customTemplate.htmlBody}
                    onChange={(e) => setCustomTemplate(prev => ({ ...prev, htmlBody: e.target.value }))}
                    placeholder="Entrez votre template HTML avec des placeholders..."
                    sx={{ mb: 2 }}
                  />
                  <TextField
                    fullWidth
                    multiline
                    rows={4}
                    label="Template texte (optionnel)"
                    value={customTemplate.textBody}
                    onChange={(e) => setCustomTemplate(prev => ({ ...prev, textBody: e.target.value }))}
                    placeholder="Version texte de l'email..."
                  />
          </Box>
        )}

              {/* Configuration de l'email */}
              <Typography variant="subtitle1" gutterBottom sx={{ mt: 3 }}>
                Paramètres de l'email
            </Typography>

              <TextField
                fullWidth
                label="Destinataire"
                value={emailSettings.to}
                onChange={(e) => setEmailSettings(prev => ({ ...prev, to: e.target.value }))}
                sx={{ mb: 2 }}
                error={!!errors.to}
                helperText={errors.to}
              />

              <TextField
                fullWidth
                label="CC (optionnel)"
                value={emailSettings.cc}
                onChange={(e) => setEmailSettings(prev => ({ ...prev, cc: e.target.value }))}
              sx={{ mb: 2 }}
            />

              <TextField
                fullWidth
                label="BCC (optionnel)"
                value={emailSettings.bcc}
                onChange={(e) => setEmailSettings(prev => ({ ...prev, bcc: e.target.value }))}
                sx={{ mb: 2 }}
              />

                      <TextField
                fullWidth
                label="Sujet (optionnel)"
                value={emailSettings.subject}
                onChange={(e) => setEmailSettings(prev => ({ ...prev, subject: e.target.value }))}
                placeholder="Le sujet sera généré automatiquement si laissé vide"
              />

            <Box sx={{ mt: 2 }}>
              <Button
                variant="contained"
                  startIcon={<PreviewIcon />}
                onClick={handlePreview}
                disabled={isRendering}
                  fullWidth
              >
                  {isRendering ? <CircularProgress size={20} /> : 'Prévisualiser'}
              </Button>
            </Box>
            </Paper>
          </Grid>

          {/* Prévisualisation */}
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3, height: '100%' }}>
              <Typography variant="h6" gutterBottom>
                Prévisualisation
            </Typography>

              {renderResult ? (
                <Box>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Sujet: {renderResult.subject}
                    </Typography>
                  </Box>

                  <Box sx={{ mb: 2 }}>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                      Contenu HTML:
                    </Typography>
                    <Box
                      sx={{
                        border: '1px solid #ddd',
                        borderRadius: 1,
                        p: 2,
                        maxHeight: '300px',
                        overflow: 'auto',
                        bgcolor: '#f9f9f9'
                      }}
                      dangerouslySetInnerHTML={{ __html: renderResult.htmlBody }}
                    />
          </Box>

                  {renderResult.textBody && (
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                        Contenu texte:
            </Typography>
                <TextField
                  fullWidth
                        multiline
                        rows={4}
                        value={renderResult.textBody}
                        InputProps={{ readOnly: true }}
                      />
          </Box>
        )}

                  {renderResult.diagnostics && (
                    <Accordion sx={{ mt: 2 }}>
                      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                        <Typography variant="subtitle2">Diagnostics</Typography>
                      </AccordionSummary>
                      <AccordionDetails>
                        {renderResult.diagnostics.missingPlaceholders.length > 0 && (
                          <Alert severity="warning" sx={{ mb: 1 }}>
                            Placeholders manquants: {renderResult.diagnostics.missingPlaceholders.join(', ')}
                          </Alert>
                        )}
                        {renderResult.diagnostics.warnings.length > 0 && (
                          <Alert severity="info" sx={{ mb: 1 }}>
                            Avertissements: {renderResult.diagnostics.warnings.join(', ')}
                          </Alert>
                        )}
                        {renderResult.diagnostics.errors.length > 0 && (
                          <Alert severity="error" sx={{ mb: 1 }}>
                            Erreurs: {renderResult.diagnostics.errors.join(', ')}
                          </Alert>
                        )}
                      </AccordionDetails>
                    </Accordion>
                  )}

                  <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
          <Button
            variant="outlined"
                      startIcon={<CopyIcon />}
                      onClick={() => copyToClipboard(renderResult.htmlBody)}
          >
                      Copier HTML
          </Button>
                    {renderResult.textBody && (
          <Button
                        variant="outlined"
                        startIcon={<CopyIcon />}
                        onClick={() => copyToClipboard(renderResult.textBody!)}
                      >
                        Copier texte
          </Button>
        )}
                  </Box>
                </Box>
              ) : (
                <Box sx={{ 
                  display: 'flex', 
                  flexDirection: 'column', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  height: '300px',
                  color: 'text.secondary'
                }}>
                  <PreviewIcon sx={{ fontSize: 48, mb: 2 }} />
                  <Typography variant="body1">
                    Cliquez sur "Prévisualiser" pour voir l'email
                  </Typography>
                </Box>
              )}
            </Paper>
          </Grid>
        </Grid>
      </DialogContent>

      <DialogActions sx={{ p: 3 }}>
        <Button onClick={onClose}>
          Annuler
        </Button>
        {renderResult && (
          <Button
            variant="contained"
            startIcon={<SendIcon />}
            onClick={handleSendEmail}
            disabled={isSending}
          >
            {isSending ? <CircularProgress size={20} /> : 'Envoyer l\'email'}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default QuoteEmailSender; 