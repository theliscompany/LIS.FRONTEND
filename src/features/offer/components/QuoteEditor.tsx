import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Tabs,
  Tab,
  Card,
  CardContent,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  FormControlLabel,
  Chip,
  IconButton,
  Grid,
  Paper,
  Avatar,
  Alert,
  Badge,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  ListItemSecondaryAction
} from '@mui/material';
import {
  Close,
  Save,
  Send,
  Edit,
  AttachFile,
  Euro,
  TrendingUp,
  Business,
  Description,
  Security,
  Schedule,
  Warning,
  Add,
  Delete,
  Visibility,
  Upload
} from '@mui/icons-material';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { fr } from 'date-fns/locale';
import type { QuoteResponse } from '../api/types.gen';

interface QuoteEditorProps {
  open: boolean;
  onClose: () => void;
  quote: QuoteResponse | null;
  onSave: (updatedQuote: QuoteResponse) => void;
  onSend: (updatedQuote: QuoteResponse) => void;
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
      id={`quote-editor-tabpanel-${index}`}
      aria-labelledby={`quote-editor-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

const QuoteEditor: React.FC<QuoteEditorProps> = ({
  open,
  onClose,
  quote,
  onSave,
  onSend
}) => {
  const [activeTab, setActiveTab] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [editedQuote, setEditedQuote] = useState<QuoteResponse | null>(null);

  // États pour les différents onglets
  const [margins, setMargins] = useState<Record<string, { type: 'percentage' | 'fixed'; value: number; amount: number }>>({});
  const [commercialTerms, setCommercialTerms] = useState({
    depositPolicy: { type: 'fixed', value: 0 },
    paymentTerms: '',
    validityPeriod: 15,
    generalConditionsId: ''
  });
  const [attachments, setAttachments] = useState<any[]>([]);
  
  // États pour les nouveaux onglets
  const [quoteInfo, setQuoteInfo] = useState({
    quoteNumber: '',
    clientReference: '',
    currency: 'EUR',
    incoterm: 'FOB',
    validityDays: 15,
    notes: ''
  });
  
  const [clientInfo, setClientInfo] = useState({
    name: '',
    vat: '',
    emails: [] as string[],
    phones: [] as string[],
    address: {
      line1: '',
      line2: '',
      city: '',
      zip: '',
      country: ''
    },
    contactPerson: {
      fullName: '',
      phone: '',
      email: ''
    }
  });
  
  const [shipmentInfo, setShipmentInfo] = useState({
    mode: 'sea',
    commodity: '',
    hsCodes: [] as string[],
    containerCount: 1,
    containerTypes: [] as string[],
    origin: {
      location: '',
      country: ''
    },
    destination: {
      location: '',
      country: ''
    },
    requestedDeparture: null as Date | null,
    constraints: {
      minTruckLeadDays: 0,
      terminalCutoffDays: 0,
      customsDeadlineHours: 0
    }
  });
  
  const [pricingInfo, setPricingInfo] = useState({
    globalDiscount: 0,
    additionalFees: [] as Array<{ name: string; amount: number; type: 'fixed' | 'percentage' }>,
    surcharges: [] as Array<{ name: string; amount: number; type: 'fixed' | 'percentage' }>
  });
  
  const [contentInfo, setContentInfo] = useState({
    customNotes: '',
    specialConditions: '',
    template: 'standard_quote_v1',
    language: 'fr',
    internalNotes: ''
  });
  
  const [validationInfo, setValidationInfo] = useState({
    requiresApproval: false,
    approvers: [] as string[],
    approvalLevel: 'standard',
    maxModificationLevel: 'full',
    autoSend: false
  });

  useEffect(() => {
    if (quote) {
      setEditedQuote({ ...quote });
      setHasChanges(false);
      
      // Initialiser les marges des options
      const initialMargins: Record<string, { type: 'percentage' | 'fixed'; value: number; amount: number }> = {};
      quote.availableOptions?.forEach((option, index) => {
        initialMargins[option.optionId || `option_${index}`] = {
          type: (option.margin?.type as 'percentage' | 'fixed') || 'percentage',
          value: option.margin?.value || 0,
          amount: option.margin?.amount || 0
        };
      });
      setMargins(initialMargins);
      
      // Initialiser les conditions commerciales
      if (quote.commercialTerms) {
        setCommercialTerms({
          depositPolicy: {
            type: quote.commercialTerms.depositPolicy?.type || 'fixed',
            value: quote.commercialTerms.depositPolicy?.value || 0
          },
          paymentTerms: quote.commercialTerms.paymentTerms || '',
          validityPeriod: quote.validityDays || 15,
          generalConditionsId: quote.commercialTerms.generalConditionsId || ''
        });
      }
      
      // Initialiser les fichiers joints
      setAttachments(quote.attachments || []);
      
      // Initialiser les informations du devis
      setQuoteInfo({
        quoteNumber: quote.quoteNumber || '',
        clientReference: quote.metadata?.notes || '',
        currency: quote.currency || 'EUR',
        incoterm: quote.incoterm || 'FOB',
        validityDays: quote.validityDays || 15,
        notes: quote.metadata?.notes || ''
      });
      
      // Initialiser les informations client
      if (quote.customer) {
        setClientInfo({
          name: quote.customer.name || '',
          vat: quote.customer.vat || '',
          emails: quote.customer.emails || [],
          phones: quote.customer.phones || [],
          address: {
            line1: quote.customer.address?.line1 || '',
            line2: quote.customer.address?.line2 || '',
            city: quote.customer.address?.city || '',
            zip: quote.customer.address?.zip || '',
            country: quote.customer.address?.country || ''
          },
          contactPerson: {
            fullName: quote.customer?.contactPerson?.fullName || '',
            phone: quote.customer?.contactPerson?.phone || '',
            email: quote.customer?.contactPerson?.email || ''
          }
        });
      }
      
      // Initialiser les informations d'expédition
      if (quote.shipment) {
        setShipmentInfo({
          mode: quote.shipment.mode || 'sea',
          commodity: quote.shipment.commodity || '',
          hsCodes: quote.shipment.hsCodes || [],
          containerCount: quote.shipment.containerCount || 1,
          containerTypes: quote.shipment.containerTypes || [],
          origin: {
            location: quote.shipment.origin?.location || '',
            country: quote.shipment.origin?.country || ''
          },
          destination: {
            location: quote.shipment.destination?.location || '',
            country: quote.shipment.destination?.country || ''
          },
          requestedDeparture: quote.shipment.requestedDeparture ? new Date(quote.shipment.requestedDeparture) : null,
          constraints: {
            minTruckLeadDays: quote.shipment.constraints?.minTruckLeadDays || 0,
            terminalCutoffDays: quote.shipment.constraints?.terminalCutoffDays || 0,
            customsDeadlineHours: quote.shipment.constraints?.customsDeadlineHours || 0
          }
        });
      }
      
      // Initialiser les informations de contenu
      if (quote.metadata) {
        setContentInfo({
          customNotes: quote.metadata.notes || '',
          specialConditions: '',
          template: quote.metadata.template || 'standard_quote_v1',
          language: quote.metadata.language || 'fr',
          internalNotes: ''
        });
      }
    }
  }, [quote]);

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const handleSave = async () => {
    if (!editedQuote) return;
    
    setIsLoading(true);
    try {
      // Appliquer les modifications
      const updatedQuote = {
        ...editedQuote,
        commercialTerms: {
          ...editedQuote.commercialTerms,
          depositPolicy: commercialTerms.depositPolicy,
          paymentTerms: commercialTerms.paymentTerms,
          validityPeriod: commercialTerms.validityPeriod.toString(),
          generalConditionsId: commercialTerms.generalConditionsId
        },
        validityDays: commercialTerms.validityPeriod,
        attachments: attachments
      };
      
      await onSave(updatedQuote);
      setHasChanges(false);
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSend = async () => {
    if (!editedQuote) return;
    
    setIsLoading(true);
    try {
      const updatedQuote = {
        ...editedQuote,
        commercialTerms: {
          ...editedQuote.commercialTerms,
          depositPolicy: commercialTerms.depositPolicy,
          paymentTerms: commercialTerms.paymentTerms,
          validityPeriod: commercialTerms.validityPeriod.toString(),
          generalConditionsId: commercialTerms.generalConditionsId
        },
        validityDays: commercialTerms.validityPeriod,
        attachments: attachments,
        status: 'sentToClient',
        sentAt: new Date()
      };
      
      await onSend(updatedQuote);
      onClose();
    } catch (error) {
      console.error('Erreur lors de l\'envoi:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleMarginChange = (optionId: string, type: 'percentage' | 'fixed', value: number) => {
    // Trouver l'option pour calculer le montant de la marge
    const option = editedQuote?.availableOptions?.find(opt => opt.optionId === optionId);
    const baseTotal = option?.totals?.grandTotal || 0;
    
    let amount = 0;
    if (type === 'percentage') {
      amount = (baseTotal * value) / 100;
    } else {
      amount = value;
    }
    
    setMargins(prev => ({
      ...prev,
      [optionId]: { type, value, amount }
    }));
    setHasChanges(true);
  };

  const handleCommercialTermsChange = (field: string, value: any) => {
    setCommercialTerms(prev => ({
      ...prev,
      [field]: value
    }));
    setHasChanges(true);
  };

  const handleAttachmentUpload = (file: File) => {
    const newAttachment = {
      id: Date.now().toString(),
      name: file.name,
      size: file.size,
      type: file.type,
      uploadedAt: new Date(),
      url: URL.createObjectURL(file)
    };
    
    setAttachments(prev => [...prev, newAttachment]);
    setHasChanges(true);
  };

  const handleAttachmentDelete = (attachmentId: string) => {
    setAttachments(prev => prev.filter(att => att.id !== attachmentId));
    setHasChanges(true);
  };

  // Nouvelles fonctions de gestion des changements
  const handleQuoteInfoChange = (field: string, value: any) => {
    setQuoteInfo(prev => ({
      ...prev,
      [field]: value
    }));
    setHasChanges(true);
  };

  const handleClientInfoChange = (field: string, value: any) => {
    setClientInfo(prev => ({
      ...prev,
      [field]: value
    }));
    setHasChanges(true);
  };

  const handleShipmentInfoChange = (field: string, value: any) => {
    setShipmentInfo(prev => ({
      ...prev,
      [field]: value
    }));
    setHasChanges(true);
  };

  const handlePricingInfoChange = (field: string, value: any) => {
    setPricingInfo(prev => ({
      ...prev,
      [field]: value
    }));
    setHasChanges(true);
  };

  const handleContentInfoChange = (field: string, value: any) => {
    setContentInfo(prev => ({
      ...prev,
      [field]: value
    }));
    setHasChanges(true);
  };

  const handleValidationInfoChange = (field: string, value: any) => {
    setValidationInfo(prev => ({
      ...prev,
      [field]: value
    }));
    setHasChanges(true);
  };

  if (!quote || !editedQuote) return null;

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={fr}>
      <Dialog
        open={open}
        onClose={onClose}
        maxWidth="lg"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            minHeight: '80vh'
          }
        }}
      >
        {/* Header avec gradient moderne */}
        <DialogTitle sx={{ 
          p: 3, 
          background: 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)',
          backdropFilter: 'blur(10px)',
          borderBottom: '1px solid rgba(255,255,255,0.1)'
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Avatar sx={{ 
                bgcolor: 'rgba(255,255,255,0.2)', 
                width: 48, 
                height: 48,
                backdropFilter: 'blur(10px)'
              }}>
                <Edit />
              </Avatar>
              <Box>
                <Typography variant="h5" fontWeight="700" sx={{ textShadow: '0 2px 4px rgba(0,0,0,0.3)' }}>
                  Éditeur de Devis
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                  {quote.quoteNumber} • {quote.customer?.name}
                </Typography>
              </Box>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              {hasChanges && (
                <Chip 
                  label="Modifications non sauvegardées" 
                  color="warning" 
                  size="small"
                  icon={<Warning />}
                />
              )}
              <IconButton onClick={onClose} sx={{ color: 'white' }}>
                <Close />
              </IconButton>
            </Box>
          </Box>
        </DialogTitle>

        {/* Navigation par onglets */}
        <Box sx={{ 
          borderBottom: 1, 
          borderColor: 'rgba(255,255,255,0.1)',
          background: 'rgba(255,255,255,0.05)',
          backdropFilter: 'blur(10px)'
        }}>
          <Tabs 
            value={activeTab} 
            onChange={handleTabChange}
            variant="scrollable"
            scrollButtons="auto"
            sx={{
              '& .MuiTab-root': {
                color: 'rgba(255,255,255,0.7)',
                fontWeight: 600,
                textTransform: 'none',
                minHeight: 60,
                minWidth: 120,
                '&.Mui-selected': {
                  color: 'white',
                  background: 'rgba(255,255,255,0.1)',
                  borderRadius: '8px 8px 0 0'
                }
              },
              '& .MuiTabs-indicator': {
                backgroundColor: 'white',
                height: 3,
                borderRadius: '2px'
              }
            }}
          >
            <Tab 
              label={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Description />
                  Informations
                </Box>
              } 
            />
            <Tab 
              label={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Business />
                  Client
                </Box>
              } 
            />
            <Tab 
              label={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Schedule />
                  Expédition
                </Box>
              } 
            />
            <Tab 
              label={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <TrendingUp />
                  Marges
                </Box>
              } 
            />
            <Tab 
              label={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Euro />
                  Tarification
                </Box>
              } 
            />
            <Tab 
              label={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Business />
                  Conditions
                </Box>
              } 
            />
            <Tab 
              label={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <AttachFile />
                  Fichiers
                  {attachments.length > 0 && (
                    <Badge badgeContent={attachments.length} color="secondary" />
                  )}
                </Box>
              } 
            />
            <Tab 
              label={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Security />
                  Validation
                </Box>
              } 
            />
            <Tab 
              label={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Visibility />
                  Aperçu
                </Box>
              } 
            />
          </Tabs>
        </Box>

        {/* Contenu des onglets */}
        <DialogContent sx={{ 
          p: 0, 
          background: 'white',
          color: 'text.primary',
          minHeight: '60vh'
        }}>
          {/* Onglet Informations */}
          <TabPanel value={activeTab} index={0}>
            <Box sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: 1,
                mb: 3,
                color: 'primary.main'
              }}>
                <Description />
                Informations du Devis
              </Typography>
              
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Card sx={{ p: 2, border: '1px solid #e0e0e0' }}>
                    <Typography variant="subtitle1" fontWeight="600" gutterBottom>
                      Détails de base
                    </Typography>
                    <TextField
                      fullWidth
                      label="Numéro de devis"
                      value={quoteInfo.quoteNumber}
                      onChange={(e) => handleQuoteInfoChange('quoteNumber', e.target.value)}
                      sx={{ mb: 2 }}
                    />
                    <TextField
                      fullWidth
                      label="Référence client"
                      value={quoteInfo.clientReference}
                      onChange={(e) => handleQuoteInfoChange('clientReference', e.target.value)}
                      sx={{ mb: 2 }}
                    />
                    <Grid container spacing={2}>
                      <Grid item xs={6}>
                        <FormControl fullWidth>
                          <InputLabel>Devise</InputLabel>
                          <Select
                            value={quoteInfo.currency}
                            onChange={(e) => handleQuoteInfoChange('currency', e.target.value)}
                          >
                            <MenuItem value="EUR">EUR</MenuItem>
                            <MenuItem value="USD">USD</MenuItem>
                            <MenuItem value="GBP">GBP</MenuItem>
                          </Select>
                        </FormControl>
                      </Grid>
                      <Grid item xs={6}>
                        <FormControl fullWidth>
                          <InputLabel>Incoterm</InputLabel>
                          <Select
                            value={quoteInfo.incoterm}
                            onChange={(e) => handleQuoteInfoChange('incoterm', e.target.value)}
                          >
                            <MenuItem value="FOB">FOB</MenuItem>
                            <MenuItem value="CIF">CIF</MenuItem>
                            <MenuItem value="EXW">EXW</MenuItem>
                            <MenuItem value="DDP">DDP</MenuItem>
                          </Select>
                        </FormControl>
                      </Grid>
                    </Grid>
                  </Card>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <Card sx={{ p: 2, border: '1px solid #e0e0e0' }}>
                    <Typography variant="subtitle1" fontWeight="600" gutterBottom>
                      Validité et notes
                    </Typography>
                    <TextField
                      fullWidth
                      type="number"
                      label="Validité (jours)"
                      value={quoteInfo.validityDays}
                      onChange={(e) => handleQuoteInfoChange('validityDays', parseInt(e.target.value) || 15)}
                      InputProps={{
                        endAdornment: 'jours'
                      }}
                      sx={{ mb: 2 }}
                    />
                    <TextField
                      fullWidth
                      multiline
                      rows={4}
                      label="Notes internes"
                      value={quoteInfo.notes}
                      onChange={(e) => handleQuoteInfoChange('notes', e.target.value)}
                      placeholder="Notes visibles uniquement en interne..."
                    />
                  </Card>
                </Grid>
              </Grid>
            </Box>
          </TabPanel>

          {/* Onglet Client */}
          <TabPanel value={activeTab} index={1}>
            <Box sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: 1,
                mb: 3,
                color: 'primary.main'
              }}>
                <Business />
                Informations Client
              </Typography>
              
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Card sx={{ p: 2, border: '1px solid #e0e0e0' }}>
                    <Typography variant="subtitle1" fontWeight="600" gutterBottom>
                      Société
                    </Typography>
                    <TextField
                      fullWidth
                      label="Nom de l'entreprise"
                      value={clientInfo.name}
                      onChange={(e) => handleClientInfoChange('name', e.target.value)}
                      sx={{ mb: 2 }}
                    />
                    <TextField
                      fullWidth
                      label="N° TVA"
                      value={clientInfo.vat}
                      onChange={(e) => handleClientInfoChange('vat', e.target.value)}
                      sx={{ mb: 2 }}
                    />
                    <TextField
                      fullWidth
                      label="Adresse ligne 1"
                      value={clientInfo.address.line1}
                      onChange={(e) => handleClientInfoChange('address', { ...clientInfo.address, line1: e.target.value })}
                      sx={{ mb: 1 }}
                    />
                    <TextField
                      fullWidth
                      label="Adresse ligne 2"
                      value={clientInfo.address.line2}
                      onChange={(e) => handleClientInfoChange('address', { ...clientInfo.address, line2: e.target.value })}
                      sx={{ mb: 1 }}
                    />
                    <Grid container spacing={1}>
                      <Grid item xs={6}>
                        <TextField
                          fullWidth
                          label="Ville"
                          value={clientInfo.address.city}
                          onChange={(e) => handleClientInfoChange('address', { ...clientInfo.address, city: e.target.value })}
                        />
                      </Grid>
                      <Grid item xs={3}>
                        <TextField
                          fullWidth
                          label="CP"
                          value={clientInfo.address.zip}
                          onChange={(e) => handleClientInfoChange('address', { ...clientInfo.address, zip: e.target.value })}
                        />
                      </Grid>
                      <Grid item xs={3}>
                        <TextField
                          fullWidth
                          label="Pays"
                          value={clientInfo.address.country}
                          onChange={(e) => handleClientInfoChange('address', { ...clientInfo.address, country: e.target.value })}
                        />
                      </Grid>
                    </Grid>
                  </Card>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <Card sx={{ p: 2, border: '1px solid #e0e0e0' }}>
                    <Typography variant="subtitle1" fontWeight="600" gutterBottom>
                      Contact
                    </Typography>
                    <TextField
                      fullWidth
                      label="Nom du contact"
                      value={clientInfo.contactPerson.fullName}
                      onChange={(e) => handleClientInfoChange('contactPerson', { ...clientInfo.contactPerson, fullName: e.target.value })}
                      sx={{ mb: 2 }}
                    />
                    <TextField
                      fullWidth
                      label="Téléphone"
                      value={clientInfo.contactPerson.phone}
                      onChange={(e) => handleClientInfoChange('contactPerson', { ...clientInfo.contactPerson, phone: e.target.value })}
                      sx={{ mb: 2 }}
                    />
                    <TextField
                      fullWidth
                      label="Email"
                      type="email"
                      value={clientInfo.contactPerson.email}
                      onChange={(e) => handleClientInfoChange('contactPerson', { ...clientInfo.contactPerson, email: e.target.value })}
                    />
                  </Card>
                </Grid>
              </Grid>
            </Box>
          </TabPanel>

          {/* Onglet Expédition */}
          <TabPanel value={activeTab} index={2}>
            <Box sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: 1,
                mb: 3,
                color: 'primary.main'
              }}>
                <Schedule />
                Détails de l'Expédition
              </Typography>
              
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Card sx={{ p: 2, border: '1px solid #e0e0e0' }}>
                    <Typography variant="subtitle1" fontWeight="600" gutterBottom>
                      Marchandise
                    </Typography>
                    <TextField
                      fullWidth
                      label="Description de la marchandise"
                      value={shipmentInfo.commodity}
                      onChange={(e) => handleShipmentInfoChange('commodity', e.target.value)}
                      sx={{ mb: 2 }}
                    />
                    <TextField
                      fullWidth
                      label="Codes HS (séparés par des virgules)"
                      value={shipmentInfo.hsCodes.join(', ')}
                      onChange={(e) => handleShipmentInfoChange('hsCodes', e.target.value.split(',').map(code => code.trim()))}
                      placeholder="Ex: 6203.42.00, 6204.62.00"
                    />
                  </Card>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <Card sx={{ p: 2, border: '1px solid #e0e0e0' }}>
                    <Typography variant="subtitle1" fontWeight="600" gutterBottom>
                      Conteneurs
                    </Typography>
                    <TextField
                      fullWidth
                      type="number"
                      label="Nombre de conteneurs"
                      value={shipmentInfo.containerCount}
                      onChange={(e) => handleShipmentInfoChange('containerCount', parseInt(e.target.value) || 1)}
                      sx={{ mb: 2 }}
                    />
                    <TextField
                      fullWidth
                      label="Types de conteneurs"
                      value={shipmentInfo.containerTypes.join(', ')}
                      onChange={(e) => handleShipmentInfoChange('containerTypes', e.target.value.split(',').map(type => type.trim()))}
                      placeholder="Ex: 40ft Standard, 20ft Standard"
                    />
                  </Card>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <Card sx={{ p: 2, border: '1px solid #e0e0e0' }}>
                    <Typography variant="subtitle1" fontWeight="600" gutterBottom>
                      Origine
                    </Typography>
                    <TextField
                      fullWidth
                      label="Lieu d'origine"
                      value={shipmentInfo.origin.location}
                      onChange={(e) => handleShipmentInfoChange('origin', { ...shipmentInfo.origin, location: e.target.value })}
                      sx={{ mb: 2 }}
                    />
                    <TextField
                      fullWidth
                      label="Pays d'origine"
                      value={shipmentInfo.origin.country}
                      onChange={(e) => handleShipmentInfoChange('origin', { ...shipmentInfo.origin, country: e.target.value })}
                    />
                  </Card>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <Card sx={{ p: 2, border: '1px solid #e0e0e0' }}>
                    <Typography variant="subtitle1" fontWeight="600" gutterBottom>
                      Destination
                    </Typography>
                    <TextField
                      fullWidth
                      label="Lieu de destination"
                      value={shipmentInfo.destination.location}
                      onChange={(e) => handleShipmentInfoChange('destination', { ...shipmentInfo.destination, location: e.target.value })}
                      sx={{ mb: 2 }}
                    />
                    <TextField
                      fullWidth
                      label="Pays de destination"
                      value={shipmentInfo.destination.country}
                      onChange={(e) => handleShipmentInfoChange('destination', { ...shipmentInfo.destination, country: e.target.value })}
                    />
                  </Card>
                </Grid>
              </Grid>
            </Box>
          </TabPanel>

          {/* Onglet Marges */}
          <TabPanel value={activeTab} index={3}>
            <Box sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: 1,
                mb: 3,
                color: 'primary.main'
              }}>
                <TrendingUp />
                Gestion des Marges
              </Typography>
              
              {editedQuote.availableOptions?.map((option, index) => (
                <Card key={option.optionId || index} sx={{ mb: 2, border: '1px solid #e0e0e0' }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                      <Typography variant="h6" fontWeight="600">
                        {option.label || `Option ${index + 1}`}
                      </Typography>
                      <Chip 
                        label={`€ ${option.totals?.grandTotal?.toLocaleString() || '0'}`}
                        color="primary"
                        variant="outlined"
                      />
                    </Box>
                    
                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={6}>
                        <FormControl fullWidth>
                          <InputLabel>Type de marge</InputLabel>
                          <Select
                            value={margins[option.optionId || `option_${index}`]?.type || 'percentage'}
                            onChange={(e) => handleMarginChange(
                              option.optionId || `option_${index}`, 
                              e.target.value as 'percentage' | 'fixed', 
                              margins[option.optionId || `option_${index}`]?.value || 0
                            )}
                          >
                            <MenuItem value="percentage">Pourcentage</MenuItem>
                            <MenuItem value="fixed">Montant fixe</MenuItem>
                          </Select>
                        </FormControl>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          label={margins[option.optionId || `option_${index}`]?.type === 'percentage' ? 'Pourcentage (%)' : 'Montant (€)'}
                          type="number"
                          value={margins[option.optionId || `option_${index}`]?.value || 0}
                          onChange={(e) => handleMarginChange(
                            option.optionId || `option_${index}`,
                            margins[option.optionId || `option_${index}`]?.type || 'percentage',
                            parseFloat(e.target.value) || 0
                          )}
                          InputProps={{
                            endAdornment: margins[option.optionId || `option_${index}`]?.type === 'percentage' ? '%' : '€'
                          }}
                        />
                      </Grid>
                    </Grid>
                    
                    {/* Affichage du calcul de la marge */}
                    <Box sx={{ mt: 2, p: 2, bgcolor: '#f5f5f5', borderRadius: 1 }}>
                      <Typography variant="subtitle2" gutterBottom>
                        Calcul de la marge
                      </Typography>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="body2" color="text.secondary">
                          Total de base: € {option.totals?.grandTotal?.toLocaleString() || '0'}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          + Marge: € {margins[option.optionId || `option_${index}`]?.amount?.toLocaleString() || '0'}
                        </Typography>
                        <Typography variant="h6" color="primary.main" fontWeight="600">
                          = Total avec marge: € {((option.totals?.grandTotal || 0) + (margins[option.optionId || `option_${index}`]?.amount || 0)).toLocaleString()}
                        </Typography>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              ))}
            </Box>
          </TabPanel>

          {/* Onglet Tarification */}
          <TabPanel value={activeTab} index={4}>
            <Box sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: 1,
                mb: 3,
                color: 'primary.main'
              }}>
                <Euro />
                Tarification et Remises
              </Typography>
              
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Card sx={{ p: 2, border: '1px solid #e0e0e0' }}>
                    <Typography variant="subtitle1" fontWeight="600" gutterBottom>
                      Remise globale
                    </Typography>
                    <TextField
                      fullWidth
                      type="number"
                      label="Remise globale (%)"
                      value={pricingInfo.globalDiscount}
                      onChange={(e) => handlePricingInfoChange('globalDiscount', parseFloat(e.target.value) || 0)}
                      InputProps={{
                        endAdornment: '%'
                      }}
                    />
                  </Card>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <Card sx={{ p: 2, border: '1px solid #e0e0e0' }}>
                    <Typography variant="subtitle1" fontWeight="600" gutterBottom>
                      Frais supplémentaires
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                      <TextField
                        size="small"
                        label="Nom du frais"
                        value=""
                        sx={{ flex: 1 }}
                      />
                      <TextField
                        size="small"
                        type="number"
                        label="Montant"
                        value=""
                        sx={{ width: 120 }}
                      />
                      <Button size="small" variant="outlined" startIcon={<Add />}>
                        Ajouter
                      </Button>
                    </Box>
                    <List dense>
                      {pricingInfo.additionalFees.map((fee, index) => (
                        <ListItem key={index}>
                          <ListItemText
                            primary={fee.name}
                            secondary={`${fee.amount} ${fee.type === 'percentage' ? '%' : '€'}`}
                          />
                          <ListItemSecondaryAction>
                            <IconButton size="small" onClick={() => {}}>
                              <Delete />
                            </IconButton>
                          </ListItemSecondaryAction>
                        </ListItem>
                      ))}
                    </List>
                  </Card>
                </Grid>
              </Grid>
            </Box>
          </TabPanel>

          {/* Onglet Conditions commerciales */}
          <TabPanel value={activeTab} index={5}>
            <Box sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: 1,
                mb: 3,
                color: 'primary.main'
              }}>
                <Business />
                Conditions Commerciales
              </Typography>
              
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Card sx={{ p: 2, border: '1px solid #e0e0e0' }}>
                    <Typography variant="subtitle1" fontWeight="600" gutterBottom>
                      Politique d'acompte
                    </Typography>
                    <FormControl fullWidth sx={{ mb: 2 }}>
                      <InputLabel>Type</InputLabel>
                      <Select
                        value={commercialTerms.depositPolicy.type}
                        onChange={(e) => handleCommercialTermsChange('depositPolicy', {
                          ...commercialTerms.depositPolicy,
                          type: e.target.value
                        })}
                      >
                        <MenuItem value="fixed">Montant fixe</MenuItem>
                        <MenuItem value="percentage">Pourcentage</MenuItem>
                      </Select>
                    </FormControl>
                    <TextField
                      fullWidth
                      label={commercialTerms.depositPolicy.type === 'fixed' ? 'Montant (€)' : 'Pourcentage (%)'}
                      type="number"
                      value={commercialTerms.depositPolicy.value}
                      onChange={(e) => handleCommercialTermsChange('depositPolicy', {
                        ...commercialTerms.depositPolicy,
                        value: parseFloat(e.target.value) || 0
                      })}
                      InputProps={{
                        endAdornment: commercialTerms.depositPolicy.type === 'fixed' ? '€' : '%'
                      }}
                    />
                  </Card>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <Card sx={{ p: 2, border: '1px solid #e0e0e0' }}>
                    <Typography variant="subtitle1" fontWeight="600" gutterBottom>
                      Conditions de paiement
                    </Typography>
                    <TextField
                      fullWidth
                      multiline
                      rows={3}
                      label="Modalités de paiement"
                      value={commercialTerms.paymentTerms}
                      onChange={(e) => handleCommercialTermsChange('paymentTerms', e.target.value)}
                      placeholder="Ex: Acompte de 30% à la commande, solde à la livraison"
                    />
                  </Card>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <Card sx={{ p: 2, border: '1px solid #e0e0e0' }}>
                    <Typography variant="subtitle1" fontWeight="600" gutterBottom>
                      Validité du devis
                    </Typography>
                    <TextField
                      fullWidth
                      type="number"
                      label="Durée en jours"
                      value={commercialTerms.validityPeriod}
                      onChange={(e) => handleCommercialTermsChange('validityPeriod', parseInt(e.target.value) || 15)}
                      InputProps={{
                        endAdornment: 'jours'
                      }}
                    />
                  </Card>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <Card sx={{ p: 2, border: '1px solid #e0e0e0' }}>
                    <Typography variant="subtitle1" fontWeight="600" gutterBottom>
                      Conditions générales
                    </Typography>
                    <TextField
                      fullWidth
                      label="ID des conditions générales"
                      value={commercialTerms.generalConditionsId}
                      onChange={(e) => handleCommercialTermsChange('generalConditionsId', e.target.value)}
                      placeholder="Ex: CGV-2025-01"
                    />
                  </Card>
                </Grid>
              </Grid>
            </Box>
          </TabPanel>

          {/* Onglet Fichiers joints */}
          <TabPanel value={activeTab} index={2}>
            <Box sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: 1,
                mb: 3,
                color: 'primary.main'
              }}>
                <AttachFile />
                Fichiers Joints
              </Typography>
              
              <Paper sx={{ p: 2, mb: 3, border: '2px dashed #e0e0e0' }}>
                <Box sx={{ textAlign: 'center', py: 2 }}>
                  <Upload sx={{ fontSize: 48, color: 'text.secondary', mb: 1 }} />
                  <Typography variant="body1" gutterBottom>
                    Glissez-déposez vos fichiers ici ou
                  </Typography>
                  <Button
                    variant="contained"
                    component="label"
                    startIcon={<Add />}
                    sx={{ borderRadius: 2 }}
                  >
                    Parcourir
                    <input
                      type="file"
                      hidden
                      multiple
                      onChange={(e) => {
                        if (e.target.files) {
                          Array.from(e.target.files).forEach(handleAttachmentUpload);
                        }
                      }}
                    />
                  </Button>
                </Box>
              </Paper>
              
              {attachments.length > 0 && (
                <List>
                  {attachments.map((attachment) => (
                    <ListItem key={attachment.id} sx={{ border: '1px solid #e0e0e0', mb: 1, borderRadius: 1 }}>
                      <ListItemIcon>
                        <AttachFile />
                      </ListItemIcon>
                      <ListItemText
                        primary={attachment.name}
                        secondary={`${(attachment.size / 1024).toFixed(1)} KB`}
                      />
                      <ListItemSecondaryAction>
                        <IconButton edge="end" onClick={() => handleAttachmentDelete(attachment.id)}>
                          <Delete />
                        </IconButton>
                      </ListItemSecondaryAction>
                    </ListItem>
                  ))}
                </List>
              )}
            </Box>
          </TabPanel>

          {/* Onglet Contenu */}
          <TabPanel value={activeTab} index={7}>
            <Box sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: 1,
                mb: 3,
                color: 'primary.main'
              }}>
                <Description />
                Contenu et Présentation
              </Typography>
              
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Card sx={{ p: 2, border: '1px solid #e0e0e0' }}>
                    <Typography variant="subtitle1" fontWeight="600" gutterBottom>
                      Notes personnalisées
                    </Typography>
                    <TextField
                      fullWidth
                      multiline
                      rows={4}
                      label="Notes pour le client"
                      value={contentInfo.customNotes}
                      onChange={(e) => handleContentInfoChange('customNotes', e.target.value)}
                      placeholder="Messages personnalisés pour le client..."
                      sx={{ mb: 2 }}
                    />
                    <TextField
                      fullWidth
                      multiline
                      rows={3}
                      label="Conditions spéciales"
                      value={contentInfo.specialConditions}
                      onChange={(e) => handleContentInfoChange('specialConditions', e.target.value)}
                      placeholder="Clauses particulières..."
                    />
                  </Card>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <Card sx={{ p: 2, border: '1px solid #e0e0e0' }}>
                    <Typography variant="subtitle1" fontWeight="600" gutterBottom>
                      Paramètres de présentation
                    </Typography>
                    <FormControl fullWidth sx={{ mb: 2 }}>
                      <InputLabel>Template</InputLabel>
                      <Select
                        value={contentInfo.template}
                        onChange={(e) => handleContentInfoChange('template', e.target.value)}
                      >
                        <MenuItem value="standard_quote_v1">Standard v1</MenuItem>
                        <MenuItem value="premium_quote_v1">Premium v1</MenuItem>
                        <MenuItem value="minimal_quote_v1">Minimal v1</MenuItem>
                      </Select>
                    </FormControl>
                    <FormControl fullWidth sx={{ mb: 2 }}>
                      <InputLabel>Langue</InputLabel>
                      <Select
                        value={contentInfo.language}
                        onChange={(e) => handleContentInfoChange('language', e.target.value)}
                      >
                        <MenuItem value="fr">Français</MenuItem>
                        <MenuItem value="en">English</MenuItem>
                        <MenuItem value="es">Español</MenuItem>
                      </Select>
                    </FormControl>
                    <TextField
                      fullWidth
                      multiline
                      rows={3}
                      label="Notes internes"
                      value={contentInfo.internalNotes}
                      onChange={(e) => handleContentInfoChange('internalNotes', e.target.value)}
                      placeholder="Notes visibles uniquement en interne..."
                    />
                  </Card>
                </Grid>
              </Grid>
            </Box>
          </TabPanel>

          {/* Onglet Validation */}
          <TabPanel value={activeTab} index={8}>
            <Box sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: 1,
                mb: 3,
                color: 'primary.main'
              }}>
                <Security />
                Validation et Sécurité
              </Typography>
              
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Card sx={{ p: 2, border: '1px solid #e0e0e0' }}>
                    <Typography variant="subtitle1" fontWeight="600" gutterBottom>
                      Processus d'approbation
                    </Typography>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={validationInfo.requiresApproval}
                          onChange={(e) => handleValidationInfoChange('requiresApproval', e.target.checked)}
                        />
                      }
                      label="Nécessite une approbation"
                      sx={{ mb: 2 }}
                    />
                    <FormControl fullWidth sx={{ mb: 2 }}>
                      <InputLabel>Niveau d'approbation</InputLabel>
                      <Select
                        value={validationInfo.approvalLevel}
                        onChange={(e) => handleValidationInfoChange('approvalLevel', e.target.value)}
                        disabled={!validationInfo.requiresApproval}
                      >
                        <MenuItem value="standard">Standard</MenuItem>
                        <MenuItem value="manager">Manager</MenuItem>
                        <MenuItem value="director">Directeur</MenuItem>
                      </Select>
                    </FormControl>
                    <TextField
                      fullWidth
                      label="Approbateurs (emails séparés par des virgules)"
                      value={validationInfo.approvers.join(', ')}
                      onChange={(e) => handleValidationInfoChange('approvers', e.target.value.split(',').map(email => email.trim()))}
                      disabled={!validationInfo.requiresApproval}
                      placeholder="manager@company.com, director@company.com"
                    />
                  </Card>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <Card sx={{ p: 2, border: '1px solid #e0e0e0' }}>
                    <Typography variant="subtitle1" fontWeight="600" gutterBottom>
                      Contrôles de sécurité
                    </Typography>
                    <FormControl fullWidth sx={{ mb: 2 }}>
                      <InputLabel>Niveau de modification maximum</InputLabel>
                      <Select
                        value={validationInfo.maxModificationLevel}
                        onChange={(e) => handleValidationInfoChange('maxModificationLevel', e.target.value)}
                      >
                        <MenuItem value="readonly">Lecture seule</MenuItem>
                        <MenuItem value="limited">Modifications limitées</MenuItem>
                        <MenuItem value="full">Modifications complètes</MenuItem>
                      </Select>
                    </FormControl>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={validationInfo.autoSend}
                          onChange={(e) => handleValidationInfoChange('autoSend', e.target.checked)}
                        />
                      }
                      label="Envoi automatique après approbation"
                    />
                  </Card>
                </Grid>
              </Grid>
            </Box>
          </TabPanel>

          {/* Onglet Aperçu */}
          <TabPanel value={activeTab} index={9}>
            <Box sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: 1,
                mb: 3,
                color: 'primary.main'
              }}>
                <Description />
                Aperçu du Devis
              </Typography>
              
              <Alert severity="info" sx={{ mb: 3 }}>
                Aperçu des modifications en cours...
              </Alert>
              
              {/* Aperçu des options avec marges */}
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <Typography variant="h6" gutterBottom>
                    Options disponibles
                  </Typography>
                  {editedQuote.availableOptions?.map((option, index) => {
                    const margin = margins[option.optionId || `option_${index}`];
                    const baseTotal = option.totals?.grandTotal || 0;
                    const marginAmount = margin?.amount || 0;
                    const totalWithMargin = baseTotal + marginAmount;
                    
                    return (
                      <Card key={option.optionId || index} sx={{ mb: 2, border: '1px solid #e0e0e0' }}>
                        <CardContent>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                            <Typography variant="h6" fontWeight="600">
                              {option.label || `Option ${index + 1}`}
                            </Typography>
                            <Box sx={{ textAlign: 'right' }}>
                              <Typography variant="body2" color="text.secondary">
                                Total de base: € {baseTotal.toLocaleString()}
                              </Typography>
                              {marginAmount > 0 && (
                                <Typography variant="body2" color="primary.main">
                                  + Marge: € {marginAmount.toLocaleString()}
                                </Typography>
                              )}
                              <Typography variant="h6" color="primary.main" fontWeight="600">
                                Total: € {totalWithMargin.toLocaleString()}
                              </Typography>
                            </Box>
                          </Box>
                          
                          {margin && margin.value > 0 && (
                            <Box sx={{ p: 2, bgcolor: '#f5f5f5', borderRadius: 1 }}>
                              <Typography variant="body2" color="text.secondary">
                                Marge: {margin.value} {margin.type === 'percentage' ? '%' : '€'} 
                                ({margin.type === 'percentage' ? `${margin.value}%` : `€ ${margin.value}`})
                              </Typography>
                            </Box>
                          )}
                        </CardContent>
                      </Card>
                    );
                  })}
                </Grid>
              </Grid>
            </Box>
          </TabPanel>
        </DialogContent>

        {/* Actions */}
        <DialogActions sx={{ 
          p: 3, 
          background: 'rgba(255,255,255,0.05)',
          backdropFilter: 'blur(10px)',
          borderTop: '1px solid rgba(255,255,255,0.1)'
        }}>
          <Button
            onClick={onClose}
            variant="outlined"
            sx={{ 
              color: 'white', 
              borderColor: 'rgba(255,255,255,0.3)',
              '&:hover': {
                borderColor: 'white',
                background: 'rgba(255,255,255,0.1)'
              }
            }}
          >
            Annuler
          </Button>
          <Button
            onClick={handleSave}
            variant="contained"
            startIcon={<Save />}
            disabled={!hasChanges || isLoading}
            sx={{
              background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
              '&:hover': {
                background: 'linear-gradient(135deg, #43a3f5 0%, #00e5f2 100%)',
              }
            }}
          >
            {isLoading ? 'Sauvegarde...' : 'Sauvegarder'}
          </Button>
          <Button
            onClick={handleSend}
            variant="contained"
            startIcon={<Send />}
            disabled={isLoading}
            sx={{
              background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
              '&:hover': {
                background: 'linear-gradient(135deg, #f85a8a 0%, #fed030 100%)',
              }
            }}
          >
            {isLoading ? 'Envoi...' : 'Envoyer au client'}
          </Button>
        </DialogActions>
      </Dialog>
    </LocalizationProvider>
  );
};

export default QuoteEditor;
