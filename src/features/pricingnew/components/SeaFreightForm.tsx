import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  Grid,
  Tabs,
  Tab,
  Paper,
  Divider,
  Chip,
  IconButton,
  Tooltip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
  Switch,
  FormControlLabel,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Card,
  CardContent,
  CardHeader,
  Checkbox
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  ExpandMore as ExpandMoreIcon,
  LocationOn as LocationIcon,
  DirectionsBoat as DirectionsBoatIcon,
  MonetizationOn as MonetizationOnIcon,
  Business as BusinessIcon,
  CalendarToday as CalendarIcon,
  CheckBox as CheckBoxIcon,
  CheckBoxOutlineBlank as CheckBoxOutlineBlankIcon
} from '@mui/icons-material';
import { SeaFreightResponse, SeaFreightCreateRequest, Carrier, Port, Charges, Validity, Surcharge, SurchargeType } from '../api/types.gen';
import AutoCompletePort from '../../../components/shared/AutoCompletePort';
import AutoCompleteContact from '../../../components/shared/AutoCompleteContact';

interface SeaFreightFormProps {
  seaFreight?: SeaFreightResponse | null;
  onSubmit: (data: SeaFreightCreateRequest) => void;
  loading?: boolean;
  isEditMode?: boolean;
  isCreateMode?: boolean;
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
      id={`seafreight-tabpanel-${index}`}
      aria-labelledby={`seafreight-tab-${index}`}
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

const SeaFreightForm: React.FC<SeaFreightFormProps> = ({ 
  seaFreight, 
  onSubmit, 
  loading = false, 
  isEditMode = false, 
  isCreateMode = false
}) => {
  const [activeTab, setActiveTab] = useState(0);
  const [formData, setFormData] = useState<SeaFreightCreateRequest>({
    carrier: undefined,
    departurePort: undefined,
    arrivalPort: undefined,
    incoterm: '',
    containerType: '',
    isReefer: false,
    currency: 'EUR',
    charges: {
      basePrice: 0,
      surcharges: [],
    },
    transitTimeDays: 0,
    frequency: '',
    volumeCbm: 0,
    weightKg: 0,
    validity: {
      startDate: new Date(),
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
    },
    deliveryTerms: '',
    remarks: '',
    createdBy: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // État pour gérer les surcharges prédéfinies sélectionnées
  const [selectedPredefinedSurcharges, setSelectedPredefinedSurcharges] = useState<Map<string, { surcharge: any, price: number }>>(new Map());

  const CONTAINER_TYPES = [
    '20GP', '40GP', '40HC', '45HC', '20RF', '40RF', '40HRF'
  ];

  const INCOTERMS = [
    'EXW', 'FCA', 'CPT', 'CIP', 'DAP', 'DPU', 'DDP', 'FAS', 'FOB', 'CFR', 'CIF'
  ];

  const FREQUENCIES = [
    'Weekly', 'Bi-weekly', 'Monthly', 'On-demand'
  ];

  // Surcharges prédéfinies par catégorie
  const PREDEFINED_SURCHARGES = {
    export_surcharges: [
      { name: 'Terminal Handling Charge Orig.', description: 'THC au port d\'origine', type: 2, currency: 'EUR' },
      { name: 'Terminal Security Charge Orig.', description: 'Frais de sécurité au port d\'origine', type: 3, currency: 'EUR' },
      { name: 'Documentation Fee Orig.', description: 'Frais de documentation à l\'origine', type: 4, currency: 'EUR' },
      { name: 'Customs Clearance Orig.', description: 'Dédouanement à l\'origine', type: 4, currency: 'EUR' }
    ],
    freight_surcharges: [
      { name: 'Peak Season Surcharge', description: 'Surcharge haute saison', type: 0, currency: 'EUR' },
      { name: 'Emission Allowance', description: 'Contribution aux émissions', type: 0, currency: 'EUR' },
      { name: 'Marine Fuel Recovery', description: 'Récupération carburant maritime', type: 0, currency: 'EUR' },
      { name: 'Emergency Space Contingency', description: 'Contingence d\'espace d\'urgence', type: 0, currency: 'EUR' },
      { name: 'BAF (Bunker Adjustment Factor)', description: 'Facteur d\'ajustement du bunker', type: 0, currency: 'EUR' },
      { name: 'CAF (Currency Adjustment Factor)', description: 'Facteur d\'ajustement de devise', type: 1, currency: 'EUR' }
    ],
    import_surcharges: [
      { name: 'Lift on/Lift Off Destination', description: 'Chargement/Déchargement à destination', type: 2, currency: 'EUR' },
      { name: 'Port Tax/Admin.Charges Destin.', description: 'Taxe portuaire/Admin à destination', type: 2, currency: 'EUR' },
      { name: 'Equipment Maintenance Fee', description: 'Frais de maintenance équipement', type: 4, currency: 'EUR' },
      { name: 'Terminal Handling Charge Dest.', description: 'THC au port de destination', type: 2, currency: 'EUR' }
    ],
    documentation_fees: [
      { name: 'Document Charge', description: 'Frais de documents', type: 4, currency: 'EUR' },
      { name: 'Port Improvement Charge Dest.', description: 'Contribution amélioration port destination', type: 2, currency: 'EUR' },
      { name: 'Stamp Duty Import', description: 'Droit de timbre import', type: 4, currency: 'EUR' },
      { name: 'Destination Documentation Fee', description: 'Frais documentation destination', type: 4, currency: 'EUR' }
    ]
  };

  useEffect(() => {
    if (seaFreight && isEditMode) {
      setFormData({
        quoteNumber: seaFreight.quoteNumber || '',
        carrier: seaFreight.carrier || undefined,
        departurePort: seaFreight.departurePort || undefined,
        arrivalPort: seaFreight.arrivalPort || undefined,
        incoterm: seaFreight.incoterm || '',
        containerType: seaFreight.containerType || '',
        isReefer: seaFreight.isReefer || false,
        currency: seaFreight.currency || 'EUR',
        charges: seaFreight.charges || { basePrice: 0, surcharges: [] },
        transitTimeDays: seaFreight.transitTimeDays ?? 0,
        frequency: seaFreight.frequency || '',
        volumeCbm: seaFreight.volumeCbm ?? 0,
        weightKg: seaFreight.weightKg ?? 0,
        validity: seaFreight.validity || {
          startDate: new Date(),
          endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
        },
        deliveryTerms: '',
        remarks: seaFreight.remarks || '',
        createdBy: seaFreight.createdBy || ''
      });
    }
  }, [seaFreight, isEditMode]);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleNestedChange = (parentField: string, childField: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [parentField]: {
        ...((prev[parentField as keyof SeaFreightCreateRequest] as object) || {}),
        [childField]: value
      }
    }));
  };

  const handleChargesChange = (field: string, value: number) => {
    setFormData(prev => ({
      ...prev,
      charges: {
        ...prev.charges!,
        [field]: value
      }
    }));
  };

  const handleValidityChange = (field: string, value: Date) => {
    setFormData(prev => ({
      ...prev,
      validity: {
        ...prev.validity!,
        [field]: value
      }
    }));
  };

  // Fonction pour gérer la sélection et le prix des surcharges prédéfinies
  const handlePredefinedSurchargeToggle = (surchargeKey: string, surcharge: any) => {
    setSelectedPredefinedSurcharges(prev => {
      const newMap = new Map(prev);
      if (newMap.has(surchargeKey)) {
        newMap.delete(surchargeKey);
      } else {
        newMap.set(surchargeKey, { surcharge, price: 0 });
      }
      return newMap;
    });
  };

  // Fonction pour mettre à jour le prix d'une surcharge sélectionnée
  const handleSurchargePriceChange = (surchargeKey: string, price: number) => {
    setSelectedPredefinedSurcharges(prev => {
      const newMap = new Map(prev);
      const existing = newMap.get(surchargeKey);
      if (existing) {
        newMap.set(surchargeKey, { ...existing, price });
      }
      return newMap;
    });
  };

  // Fonction pour ajouter les surcharges sélectionnées avec leurs prix
  const handleAddSelectedSurcharges = () => {
    const newSurcharges: any[] = [];
    
    selectedPredefinedSurcharges.forEach(({ surcharge, price }) => {
      if (price > 0) { // Seulement ajouter si un prix est saisi
        newSurcharges.push({
          name: surcharge.name,
          description: surcharge.description,
          value: price,
          type: surcharge.type,
          currency: surcharge.currency,
          category: surcharge.category
        });
      }
    });

    setFormData(prev => ({
      ...prev,
      charges: {
        ...prev.charges!,
        surcharges: [
          ...(prev.charges?.surcharges || []),
          ...newSurcharges
        ]
      }
    }));

    setSelectedPredefinedSurcharges(new Map());
  };

  const handleAddSurcharge = () => {
    setFormData(prev => ({
      ...prev,
      charges: {
        ...prev.charges!,
        surcharges: [
          ...(prev.charges?.surcharges || []),
          { name: '', value: 0, type: undefined, description: '', isMandatory: false, currency: prev.currency }
        ]
      }
    }));
  };

  const handleSurchargeChange = (index: number, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      charges: {
        ...prev.charges!,
        surcharges: prev.charges?.surcharges?.map((s, i) =>
          i === index ? { ...s, [field]: field === 'type' ? value as SurchargeType : value } : s
        ) || []
      }
    }));
  };

  const handleRemoveSurcharge = (index: number) => {
    setFormData(prev => ({
      ...prev,
      charges: {
        ...prev.charges!,
        surcharges: prev.charges?.surcharges?.filter((_, i) => i !== index) || []
      }
    }));
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.carrier?.name) {
      newErrors.carrier = 'Le transporteur est requis';
    }

    if (!formData.departurePort?.name) {
      newErrors.departurePort = "Le port de départ est requis";
    }

    if (!formData.arrivalPort?.name) {
      newErrors.arrivalPort = "Le port d'arrivée est requis";
    }

    if (!formData.containerType) {
      newErrors.containerType = 'Le type de conteneur est requis';
    }

    if ((formData.charges?.basePrice ?? 0) <= 0) {
      newErrors.basePrice = 'Le prix de base doit être supérieur à 0';
    }

    if ((formData.transitTimeDays ?? 0) <= 0) {
      newErrors.transitTime = 'Le temps de transit doit être supérieur à 0';
    }

    if (!formData.validity?.startDate) {
      newErrors.validityStart = 'La date de début de validité est requise';
    }

    if (!formData.validity?.endDate) {
      newErrors.validityEnd = 'La date de fin de validité est requise';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit(formData);
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ maxWidth: '100%' }}>
      {/* Tabs */}
      <Paper sx={{ mb: 3, borderRadius: 2 }}>
        <Tabs value={activeTab} onChange={handleTabChange} variant="scrollable" scrollButtons="auto">
          <Tab label="Informations Générales" />
          <Tab label="Conteneur & Volume" />
          <Tab label="Prix & Charges" />
          <Tab label="Validité & Remarques" />
        </Tabs>
      </Paper>

      {/* Tab 1: Informations Générales */}
      <TabPanel value={activeTab} index={0}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={12}>
            <AutoCompleteContact
              value={formData.carrier ? { contactId: formData.carrier.id, contactName: formData.carrier.name } : null}
              onChange={(contact) => {
                if (contact) {
                  handleInputChange('carrier', { id: contact.contactId, name: contact.contactName });
                } else {
                  handleInputChange('carrier', undefined);
                }
              }}
              label="Transporteur"
            />
            {errors.carrier && (
              <Typography variant="caption" color="error" sx={{ mt: 1, display: 'block' }}>
                {errors.carrier}
              </Typography>
            )}
          </Grid>

          {/* Port de départ */}
          <Grid item xs={12} md={6}>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
              Port de départ
            </Typography>
            <AutoCompletePort
              value={formData.departurePort ? {
                portId: 0,
                portName: formData.departurePort.name || '',
                country: ''
              } : null}
              onChange={port => handleInputChange('departurePort', port ? { unlocode: '', name: port.portName } : undefined)}
              error={!!errors.departurePort}
              helperText={errors.departurePort}
            />
          </Grid>
          {/* Port d'arrivée */}
          <Grid item xs={12} md={6}>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
              Port d'arrivée
            </Typography>
            <AutoCompletePort
              value={formData.arrivalPort ? {
                portId: 0,
                portName: formData.arrivalPort.name || '',
                country: ''
              } : null}
              onChange={port => handleInputChange('arrivalPort', port ? { unlocode: '', name: port.portName } : undefined)}
              error={!!errors.arrivalPort}
              helperText={errors.arrivalPort}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <FormControl fullWidth>
              <InputLabel>Incoterm</InputLabel>
              <Select
                value={formData.incoterm || ''}
                onChange={(e) => handleInputChange('incoterm', e.target.value)}
                label="Incoterm"
              >
                {INCOTERMS.map((term) => (
                  <MenuItem key={term} value={term}>{term}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} md={6}>
            <FormControl fullWidth>
              <InputLabel>Fréquence</InputLabel>
              <Select
                value={formData.frequency || ''}
                onChange={(e) => handleInputChange('frequency', e.target.value)}
                label="Fréquence"
              >
                {FREQUENCIES.map((freq) => (
                  <MenuItem key={freq} value={freq}>{freq}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Devise"
              value={formData.currency}
              onChange={(e) => handleInputChange('currency', e.target.value)}
              placeholder="EUR"
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Temps de transit (jours)"
              type="number"
              value={formData.transitTimeDays}
              onChange={(e) => handleInputChange('transitTimeDays', parseInt(e.target.value) || 0)}
              error={!!errors.transitTime}
              helperText={errors.transitTime}
              InputProps={{ inputProps: { min: 1 } }}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            {isEditMode ? (
              <TextField
                fullWidth
                label="Numéro de devis"
                value={formData.quoteNumber || ''}
                InputProps={{ readOnly: true }}
                helperText="Numéro généré automatiquement"
              />
            ) : (
              <TextField
                fullWidth
                label="Numéro de devis"
                value="À générer automatiquement"
                InputProps={{ readOnly: true }}
                helperText="Le numéro sera généré automatiquement lors de la création"
              />
            )}
          </Grid>
        </Grid>
      </TabPanel>

      {/* Tab 2: Conteneur & Volume */}
      <TabPanel value={activeTab} index={1}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <FormControl fullWidth error={!!errors.containerType}>
              <InputLabel>Type de conteneur</InputLabel>
              <Select
                value={formData.containerType || ''}
                onChange={(e) => handleInputChange('containerType', e.target.value)}
                label="Type de conteneur"
              >
                {CONTAINER_TYPES.map((type) => (
                  <MenuItem key={type} value={type}>{type}</MenuItem>
                ))}
              </Select>
              {errors.containerType && <FormHelperText>{errors.containerType}</FormHelperText>}
            </FormControl>
          </Grid>

          <Grid item xs={12} md={6}>
            <FormControlLabel
              control={
                <Switch
                  checked={formData.isReefer || false}
                  onChange={(e) => handleInputChange('isReefer', e.target.checked)}
                />
              }
              label="Conteneur Reefer"
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Volume (CBM)"
              type="number"
              value={formData.volumeCbm}
              onChange={(e) => handleInputChange('volumeCbm', parseFloat(e.target.value) || 0)}
              InputProps={{ inputProps: { min: 0, step: 0.01 } }}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Poids (KG)"
              type="number"
              value={formData.weightKg}
              onChange={(e) => handleInputChange('weightKg', parseFloat(e.target.value) || 0)}
              InputProps={{ inputProps: { min: 0, step: 0.01 } }}
            />
          </Grid>
        </Grid>
      </TabPanel>

      {/* Tab 3: Prix & Charges */}
      <TabPanel value={activeTab} index={2}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
              Charges détaillées
            </Typography>
          </Grid>

          <Grid item xs={12} sm={6} md={4}>
            <TextField
              fullWidth
              label="Fret de base"
              type="number"
              value={formData.charges?.basePrice || 0}
              onChange={(e) => handleChargesChange('basePrice', parseFloat(e.target.value) || 0)}
              error={!!errors.basePrice}
              helperText={errors.basePrice}
              InputProps={{ 
                inputProps: { min: 0, step: 0.01 },
                startAdornment: <Typography variant="body2" sx={{ mr: 1 }}>{formData.currency}</Typography>
              }}
            />
          </Grid>

          <Grid item xs={12} sm={6} md={4}>
            <TextField
              fullWidth
              label="Surcharges"
              type="number"
              value={formData.charges?.surcharges?.length || 0}
              onChange={(e) => handleInputChange('surcharges', parseInt(e.target.value) || 0)}
              InputProps={{ 
                inputProps: { min: 0, step: 1 },
                startAdornment: <Typography variant="body2" sx={{ mr: 1 }}>{formData.currency}</Typography>
              }}
            />
          </Grid>

          <Grid item xs={12} sm={6} md={4}>
            <TextField
              fullWidth
              label="Devise"
              value={formData.currency}
              onChange={(e) => handleInputChange('currency', e.target.value)}
              placeholder="EUR"
            />
          </Grid>

          {/* Section Surcharges Prédéfinies */}
          <Grid item xs={12}>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
              Surcharges Prédéfinies
            </Typography>
            
            {Object.entries(PREDEFINED_SURCHARGES).map(([category, surcharges]) => (
              <Accordion key={category} sx={{ mb: 1, '&:before': { display: 'none' } }}>
                <AccordionSummary 
                  expandIcon={<ExpandMoreIcon />}
                  sx={{ 
                    backgroundColor: '#f5f5f5',
                    '&:hover': { backgroundColor: '#e0e0e0' },
                    borderRadius: 1
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 600, flex: 1 }}>
                      {category.replace('_', ' ').toUpperCase()}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mr: 2 }}>
                      {surcharges.length} surcharge(s)
                    </Typography>
                  </Box>
                </AccordionSummary>
                <AccordionDetails sx={{ pt: 2 }}>
                  <Grid container spacing={2}>
                    {surcharges.map((surcharge) => {
                      const surchargeKey = `${category}_${surcharge.name}`;
                      const isSelected = selectedPredefinedSurcharges.has(surchargeKey);
                      const selectedData = selectedPredefinedSurcharges.get(surchargeKey);
                      
                      return (
                        <Grid item xs={12} sm={6} md={4} key={surchargeKey}>
                          <Card 
                            sx={{ 
                              border: '1px solid #e0e0e0', 
                              backgroundColor: isSelected ? '#e3f2fd' : 'transparent',
                              cursor: 'pointer',
                              '&:hover': { backgroundColor: isSelected ? '#bbdefb' : '#f5f5f5' }
                            }}
                            onClick={() => handlePredefinedSurchargeToggle(surchargeKey, surcharge)}
                          >
                            <CardContent sx={{ p: 2 }}>
                              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                {isSelected ? <CheckBoxIcon color="primary" /> : <CheckBoxOutlineBlankIcon />}
                                <Typography variant="body2" sx={{ fontWeight: 500, ml: 1 }}>
                                  {surcharge.name}
                                </Typography>
                              </Box>
                              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
                                {surcharge.description}
                              </Typography>
                              
                              {isSelected && (
                                <TextField
                                  fullWidth
                                  size="small"
                                  label="Prix"
                                  type="number"
                                  value={selectedData?.price || 0}
                                  onChange={(e) => handleSurchargePriceChange(surchargeKey, parseFloat(e.target.value) || 0)}
                                  onClick={(e) => e.stopPropagation()} // Empêcher la fermeture de la sélection
                                  InputProps={{ 
                                    inputProps: { min: 0, step: 0.01 },
                                    startAdornment: <Typography variant="body2" sx={{ mr: 1 }}>{surcharge.currency}</Typography>
                                  }}
                                  sx={{ mt: 1 }}
                                />
                              )}
                            </CardContent>
                          </Card>
                        </Grid>
                      );
                    })}
                  </Grid>
                </AccordionDetails>
              </Accordion>
            ))}
            
            <Box sx={{ mt: 2, display: 'flex', gap: 2, alignItems: 'center' }}>
              <Button
                variant="contained"
                onClick={handleAddSelectedSurcharges}
                disabled={selectedPredefinedSurcharges.size === 0}
                startIcon={<AddIcon />}
              >
                Ajouter les surcharges sélectionnées ({selectedPredefinedSurcharges.size})
              </Button>
              
              {selectedPredefinedSurcharges.size > 0 && (
                <Typography variant="body2" color="text.secondary">
                  {Array.from(selectedPredefinedSurcharges.values()).filter(item => item.price > 0).length} surcharge(s) avec prix saisi
                </Typography>
              )}
            </Box>
          </Grid>

          {/* Section Surcharges Personnalisées */}
          <Grid item xs={12}>
            <Divider sx={{ my: 2 }} />
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
              Surcharges Personnalisées
            </Typography>
            {formData.charges?.surcharges?.map((surcharge, idx) => (
              <Grid container spacing={2} key={idx} alignItems="center" sx={{ mb: 1 }}>
                <Grid item xs={3}>
                  <TextField
                    label="Nom"
                    value={surcharge.name}
                    onChange={e => handleSurchargeChange(idx, 'name', e.target.value)}
                    fullWidth
                  />
                </Grid>
                <Grid item xs={2}>
                  <TextField
                    label="Montant"
                    type="number"
                    value={surcharge.value}
                    onChange={e => handleSurchargeChange(idx, 'value', parseFloat(e.target.value) || 0)}
                    fullWidth
                  />
                </Grid>
                <Grid item xs={2}>
                  <TextField
                    label="Devise"
                    value={surcharge.currency}
                    onChange={e => handleSurchargeChange(idx, 'currency', e.target.value)}
                    fullWidth
                  />
                </Grid>
                <Grid item xs={2}>
                  <TextField
                    label="Type"
                    value={surcharge.type || ''}
                    onChange={e => handleSurchargeChange(idx, 'type', e.target.value as SurchargeType)}
                    fullWidth
                  />
                </Grid>
                <Grid item xs={2}>
                  <TextField
                    label="Description"
                    value={surcharge.description}
                    onChange={e => handleSurchargeChange(idx, 'description', e.target.value)}
                    fullWidth
                  />
                </Grid>
                <Grid item xs={1}>
                  <Button color="error" onClick={() => handleRemoveSurcharge(idx)}>-</Button>
                </Grid>
              </Grid>
            ))}
            <Button variant="outlined" onClick={handleAddSurcharge} sx={{ mt: 1 }}>Ajouter une surcharge personnalisée</Button>
          </Grid>
        </Grid>
      </TabPanel>

      {/* Tab 4: Validité & Remarques */}
      <TabPanel value={activeTab} index={3}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Date de début de validité"
              type="date"
              value={formData.validity?.startDate ? new Date(formData.validity.startDate).toISOString().split('T')[0] : ''}
              onChange={(e) => handleValidityChange('startDate', new Date(e.target.value))}
              error={!!errors.validityStart}
              helperText={errors.validityStart}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Date de fin de validité"
              type="date"
              value={formData.validity?.endDate ? new Date(formData.validity.endDate).toISOString().split('T')[0] : ''}
              onChange={(e) => handleValidityChange('endDate', new Date(e.target.value))}
              error={!!errors.validityEnd}
              helperText={errors.validityEnd}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Remarques"
              multiline
              rows={4}
              value={formData.remarks}
              onChange={(e) => handleInputChange('remarks', e.target.value)}
              placeholder="Ajoutez des remarques ou conditions spéciales..."
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Créé par"
              value={formData.createdBy}
              onChange={(e) => handleInputChange('createdBy', e.target.value)}
              placeholder="Nom de l'utilisateur"
            />
          </Grid>
        </Grid>
      </TabPanel>

      {/* Actions */}
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'flex-end', 
        gap: 2, 
        mt: 4, 
        pt: 3, 
        borderTop: '1px solid #eee' 
      }}>
        <Button
          type="button"
          variant="outlined"
          onClick={() => setActiveTab(activeTab > 0 ? activeTab - 1 : 0)}
          disabled={activeTab === 0}
        >
          Précédent
        </Button>
        <Button
          type="button"
          variant="outlined"
          onClick={() => setActiveTab(activeTab < 3 ? activeTab + 1 : 3)}
          disabled={activeTab === 3}
        >
          Suivant
        </Button>
        <Button
          type="submit"
          variant="contained"
          disabled={loading}
          sx={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            '&:hover': {
              background: 'linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)'
            }
          }}
        >
          {loading ? 'Enregistrement...' : (isEditMode ? 'Mettre à jour' : 'Créer')}
        </Button>
      </Box>
    </Box>
  );
};

export default SeaFreightForm;