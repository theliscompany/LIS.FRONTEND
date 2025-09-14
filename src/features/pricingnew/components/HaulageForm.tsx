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
  ListItemSecondaryAction
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  ExpandMore as ExpandMoreIcon,
  LocationOn as LocationIcon,
  DirectionsCar as DirectionsCarIcon,
  MonetizationOn as MonetizationOnIcon,
  Security as SecurityIcon,
  Business as BusinessIcon
} from '@mui/icons-material';
import { HaulageResponse, HaulageCreateRequest, HaulageLocation, HaulageSurcharge, HaulageTransportInsurance } from '../api/types.gen';
import AddressAutocomplete from '../../../components/shared/AddressAutocomplete';
import { useJsApiLoader } from '@react-google-maps/api';
import AutoCompleteContact from '../../../components/shared/AutoCompleteContact';
import cargoData from '../../../utils/models/cargo.json';

interface HaulageFormProps {
  haulage?: HaulageResponse | null;
  onSubmit: (data: HaulageCreateRequest) => void;
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
      id={`haulage-tabpanel-${index}`}
      aria-labelledby={`haulage-tab-${index}`}
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

const GOOGLE_MAPS_LIBRARIES = ['places'];

const HaulageForm: React.FC<HaulageFormProps> = ({ 
  haulage, 
  onSubmit, 
  loading = false, 
  isEditMode = false, 
  isCreateMode = false
}) => {
  const [activeTab, setActiveTab] = useState(0);
  const [formData, setFormData] = useState<HaulageCreateRequest>({
    haulierId: 0,
    haulierName: '',
    pickupLocation: {
      displayName: '',
      formattedAddress: '',
      placeId: '',
      latitude: 0,
      longitude: 0
    },
    loadingLocation: {
      displayName: '',
      formattedAddress: '',
      placeId: '',
      latitude: 0,
      longitude: 0
    },
    deliveryLocation: {
      displayName: '',
      formattedAddress: '',
      placeId: '',
      latitude: 0,
      longitude: 0
    },
    emptyReturnLocation: {
      displayName: '',
      formattedAddress: '',
      placeId: '',
      latitude: 0,
      longitude: 0
    },
    distanceKm: 0,
    estimatedTransitTimeHours: 0,
    currency: 'EUR',
    validFrom: new Date(),
    validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    freeTime: 0,
    multiStop: 0,
    overtimeTariff: 0,
    unitTariff: 0,
    cargoTypes: [],
    surcharges: [],
    transportInsurance: {
      isInsured: false,
      rate: 0,
      minimumAmount: 0,
      maximumAmount: 0,
      currency: 'EUR',
      insuranceProvider: '',
      policyNumber: ''
    },
    deliveryTerms: '',
    comment: '',
    createdBy: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [distanceLabel, setDistanceLabel] = useState<string>('');
  const [autoDistance, setAutoDistance] = useState<number | null>(null);
  const [distanceKmInput, setDistanceKmInput] = useState('');

  const CARGO_TYPE_OPTIONS = cargoData.cargoTypes;

  // Charger Google Maps JS API si besoin
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || 'AIzaSyA_m6OTYU0waPnbPrWfYifQZdOcS50YhIg',
    libraries: GOOGLE_MAPS_LIBRARIES
  });

  useEffect(() => {
    if (haulage && isEditMode) {
      setFormData({
        haulierId: haulage.haulierId,
        haulierName: haulage.haulierName || '',
        pickupLocation: haulage.pickupLocation,
        loadingLocation: haulage.loadingLocation,
        deliveryLocation: haulage.deliveryLocation,
        emptyReturnLocation: haulage.emptyReturnLocation,
        distanceKm: haulage.distanceKm,
        estimatedTransitTimeHours: haulage.estimatedTransitTimeHours,
        currency: haulage.currency || 'EUR',
        validFrom: haulage.validFrom ? new Date(haulage.validFrom) : new Date(),
        validUntil: haulage.validUntil ? new Date(haulage.validUntil) : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        freeTime: haulage.freeTime,
        multiStop: haulage.multiStop,
        overtimeTariff: haulage.overtimeTariff,
        unitTariff: haulage.unitTariff,
        cargoTypes: haulage.cargoTypes || [],
        surcharges: haulage.surcharges || [],
        transportInsurance: haulage.transportInsurance,
        deliveryTerms: haulage.deliveryTerms || '',
        comment: haulage.comment || '',
        createdBy: haulage.createdBy || ''
      });
    }
  }, [haulage, isEditMode]);

  useEffect(() => {
    const pickup = formData.pickupLocation;
    const loading = formData.loadingLocation;
    const delivery = formData.deliveryLocation;
    if (isLoaded && window.google && window.google.maps && window.google.maps.DistanceMatrixService) {
      const service = new window.google.maps.DistanceMatrixService();
      // Cas 1 : pickup + loading + delivery
      if (pickup?.placeId && loading?.placeId && delivery?.placeId) {
        service.getDistanceMatrix({
          origins: [{ placeId: pickup.placeId }],
          destinations: [{ placeId: loading.placeId }],
          travelMode: window.google.maps.TravelMode.DRIVING,
        }, (res1: any, status1: any) => {
          if (status1 === 'OK' && res1.rows[0].elements[0].status === 'OK') {
            const dist1 = res1.rows[0].elements[0].distance.value;
            service.getDistanceMatrix({
              origins: [{ placeId: loading.placeId }],
              destinations: [{ placeId: delivery.placeId }],
              travelMode: window.google.maps.TravelMode.DRIVING,
            }, (res2: any, status2: any) => {
              if (status2 === 'OK' && res2.rows[0].elements[0].status === 'OK') {
                const dist2 = res2.rows[0].elements[0].distance.value;
                const totalKm = (dist1 + dist2) / 1000;
                setAutoDistance(Number(totalKm.toFixed(2)));
                setDistanceLabel(`Distance cumulée calculée automatiquement (Ramassage → Chargement → Livraison)`);
              } else {
                setAutoDistance(null);
                setDistanceLabel('Impossible de calculer la distance (chargement → livraison)');
              }
            });
          } else {
            setAutoDistance(null);
            setDistanceLabel('Impossible de calculer la distance (ramassage → chargement)');
          }
        });
      }
      // Cas 2 : pickup + loading
      else if (pickup?.placeId && loading?.placeId) {
        service.getDistanceMatrix({
          origins: [{ placeId: pickup.placeId }],
          destinations: [{ placeId: loading.placeId }],
          travelMode: window.google.maps.TravelMode.DRIVING,
        }, (res: any, status: any) => {
          if (status === 'OK' && res.rows[0].elements[0].status === 'OK') {
            const dist = res.rows[0].elements[0].distance.value;
            setAutoDistance(Number((dist / 1000).toFixed(2)));
            setDistanceLabel('Distance calculée automatiquement (Ramassage → Chargement)');
          } else {
            setAutoDistance(null);
            setDistanceLabel('Impossible de calculer la distance (ramassage → chargement)');
          }
        });
      }
      // Cas 3 : loading + delivery
      else if (loading?.placeId && delivery?.placeId) {
        service.getDistanceMatrix({
          origins: [{ placeId: loading.placeId }],
          destinations: [{ placeId: delivery.placeId }],
          travelMode: window.google.maps.TravelMode.DRIVING,
        }, (res: any, status: any) => {
          if (status === 'OK' && res.rows[0].elements[0].status === 'OK') {
            const dist = res.rows[0].elements[0].distance.value;
            setAutoDistance(Number((dist / 1000).toFixed(2)));
            setDistanceLabel('Distance calculée automatiquement (Chargement → Livraison)');
          } else {
            setAutoDistance(null);
            setDistanceLabel('Impossible de calculer la distance (chargement → livraison)');
          }
        });
      } else {
        setAutoDistance(null);
        setDistanceLabel('');
      }
    } else {
      setAutoDistance(null);
      setDistanceLabel('');
    }
  }, [isLoaded, formData.pickupLocation?.placeId, formData.loadingLocation?.placeId, formData.deliveryLocation?.placeId]);

  // Si la distance est calculée automatiquement, synchronise l'input
  useEffect(() => {
    if (autoDistance !== null) {
      setDistanceKmInput(autoDistance.toString());
    }
  }, [autoDistance]);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const handleLocationChange = (locationType: string, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [locationType]: {
        ...prev[locationType as keyof HaulageCreateRequest] as HaulageLocation,
        [field]: value
      }
    }));
  };

  const handleInsuranceChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      transportInsurance: {
        ...prev.transportInsurance,
        [field]: value
      }
    }));
  };

  const [cargoTypeToAdd, setCargoTypeToAdd] = useState('');
  const addCargoType = () => {
    if (cargoTypeToAdd && !formData.cargoTypes?.includes(cargoTypeToAdd)) {
      setFormData(prev => ({
        ...prev,
        cargoTypes: [...(prev.cargoTypes || []), cargoTypeToAdd]
      }));
      setCargoTypeToAdd('');
    }
  };

  const removeCargoType = (index: number) => {
    setFormData(prev => ({
      ...prev,
      cargoTypes: prev.cargoTypes?.filter((_, i) => i !== index) || []
    }));
  };

  const addSurcharge = () => {
    const newSurcharge: HaulageSurcharge = {
      type: '',
      name: '',
      description: '',
      amount: 0,
      currency: 'EUR',
      isPercentage: false,
      isMandatory: false,
      validFrom: null,
      validUntil: null
    };
    
    setFormData(prev => ({
      ...prev,
      surcharges: [...(prev.surcharges || []), newSurcharge]
    }));
  };

  const updateSurcharge = (index: number, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      surcharges: prev.surcharges?.map((surcharge, i) => 
        i === index ? { ...surcharge, [field]: value } : surcharge
      ) || []
    }));
  };

  const removeSurcharge = (index: number) => {
    setFormData(prev => ({
      ...prev,
      surcharges: prev.surcharges?.filter((_, i) => i !== index) || []
    }));
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.haulierId) {
      newErrors.haulierId = 'ID du transporteur requis';
    }
    if (!formData.haulierName) {
      newErrors.haulierName = 'Nom du transporteur requis';
    }
    if (!formData.pickupLocation?.displayName) {
      newErrors.pickupLocation = 'Point de ramassage requis';
    }
    if (!formData.deliveryLocation?.displayName) {
      newErrors.deliveryLocation = 'Point de livraison requis';
    }
    // Validation robuste de la distance
    const distanceValue = parseFloat(distanceKmInput.replace(',', '.'));
    if (isNaN(distanceValue) || distanceValue <= 0) {
      newErrors.distanceKm = 'Distance doit être supérieure à 0';
    } else {
      formData.distanceKm = distanceValue;
    }
    if (formData.unitTariff <= 0) {
      newErrors.unitTariff = 'Tarif unitaire doit être supérieur à 0';
    }
    if (!formData.validFrom) {
      newErrors.validFrom = 'Date de début de validité requise';
    }
    if (!formData.validUntil) {
      newErrors.validUntil = 'Date de fin de validité requise';
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
    <Box component="form" onSubmit={handleSubmit}>
      <Typography variant="h5" sx={{ fontWeight: 700, mb: 3, color: '#1a237e' }}>
        {isCreateMode ? "Création d'une Offre Haulage" : isEditMode ? "Édition d'une Offre Haulage" : ''}
      </Typography>
      {/* Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs 
          value={activeTab} 
          onChange={handleTabChange} 
          aria-label="haulage form tabs"
          sx={{
            '& .MuiTab-root': {
              fontWeight: 600,
              textTransform: 'none',
              fontSize: '1rem'
            }
          }}
        >
          <Tab label="🚛 Informations Générales" />
          <Tab label="📍 Localisations" />
          <Tab label="💰 Tarification" />
          <Tab label="📋 Détails" />
        </Tabs>
      </Box>

      {/* Tab 1: Informations Générales */}
      <TabPanel value={activeTab} index={0}>
        <Grid container spacing={3}>
          {/* Transporteur et Devise sur la même ligne */}
          <Grid item xs={12} md={6}>
            <AutoCompleteContact
              value={formData.haulierId ? { contactId: formData.haulierId, contactName: formData.haulierName } : null}
              onChange={value => {
                setFormData(prev => ({
                  ...prev,
                  haulierId: value ? value.contactId : 0,
                  haulierName: value ? value.contactName : '',
                }));
                if (errors.haulierId) setErrors(prev => ({ ...prev, haulierId: '' }));
                if (errors.haulierName) setErrors(prev => ({ ...prev, haulierName: '' }));
              }}
              label="Transporteur *"
            />
            {(!!errors.haulierId || !!errors.haulierName) && (
              <FormHelperText error sx={{ mt: 1 }}>{errors.haulierId || errors.haulierName}</FormHelperText>
            )}
          </Grid>

          <Grid item xs={12} md={6}>
            <FormControl fullWidth>
              <InputLabel>Devise</InputLabel>
              <Select
                value={formData.currency}
                onChange={(e) => handleInputChange('currency', e.target.value)}
                label="Devise"
              >
                <MenuItem value="EUR">EUR</MenuItem>
                <MenuItem value="USD">USD</MenuItem>
                <MenuItem value="GBP">GBP</MenuItem>
                <MenuItem value="CHF">CHF</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          {/* Distance */}
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Distance (km)"
              type="text"
              value={autoDistance !== null ? autoDistance : distanceKmInput}
              onChange={e => setDistanceKmInput(e.target.value)}
              InputProps={{ readOnly: autoDistance !== null }}
              error={!!errors.distanceKm}
              helperText={errors.distanceKm}
              required
            />
            {distanceLabel && (
              <Typography variant="caption" color="primary" sx={{ mt: 0.5, display: 'block' }}>{distanceLabel}</Typography>
            )}
          </Grid>

          {/* Temps de transit */}
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Temps de transit estimé (heures)"
              type="number"
              value={formData.estimatedTransitTimeHours}
              onChange={(e) => handleInputChange('estimatedTransitTimeHours', parseFloat(e.target.value) || 0)}
            />
          </Grid>

          {/* Date de début de validité */}
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Date de début de validité"
              type="datetime-local"
              value={formData.validFrom instanceof Date ? formData.validFrom.toISOString().slice(0, 16) : ''}
              onChange={(e) => handleInputChange('validFrom', e.target.value ? new Date(e.target.value) : new Date())}
              error={!!errors.validFrom}
              helperText={errors.validFrom}
              required
              InputLabelProps={{ shrink: true }}
            />
          </Grid>

          {/* Date de fin de validité */}
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Date de fin de validité"
              type="datetime-local"
              value={formData.validUntil instanceof Date ? formData.validUntil.toISOString().slice(0, 16) : ''}
              onChange={(e) => handleInputChange('validUntil', e.target.value ? new Date(e.target.value) : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000))}
              error={!!errors.validUntil}
              helperText={errors.validUntil}
              required
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
        </Grid>
      </TabPanel>

      {/* Tab 2: Localisations */}
      <TabPanel value={activeTab} index={1}>
        <Grid container spacing={3}>
          {/* Point de ramassage */}
          <Grid item xs={12}>
            <Paper sx={{ mb: 2, p: 2, borderRadius: 2, boxShadow: 'none', border: '1px solid #e3e3e3', bgcolor: 'rgba(102, 126, 234, 0.03)' }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#1a237e', mb: 1 }}>
                📍 Point de Ramassage
              </Typography>
              <Grid container spacing={1}>
                <Grid item xs={12} md={12}>
                  <AddressAutocomplete
                    value={formData.pickupLocation?.displayName ?? ''}
                    label="Adresse (Google Maps)"
                    onChange={(val) => {
                      handleLocationChange('pickupLocation', 'displayName', val.address ?? '');
                      handleLocationChange('pickupLocation', 'formattedAddress', val.address ?? '');
                      handleLocationChange('pickupLocation', 'latitude', val.latitude ?? 0);
                      handleLocationChange('pickupLocation', 'longitude', val.longitude ?? 0);
                      handleLocationChange('pickupLocation', 'placeId', val.placeId ?? '');
                    }}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Latitude"
                    type="number"
                    value={formData.pickupLocation?.latitude ?? 0}
                    InputProps={{ readOnly: true, style: { background: '#f5f5f5' } }}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Longitude"
                    type="number"
                    value={formData.pickupLocation?.longitude ?? 0}
                    InputProps={{ readOnly: true, style: { background: '#f5f5f5' } }}
                  />
                </Grid>
              </Grid>
            </Paper>
          </Grid>

          {distanceLabel && (
            <Box sx={{ mt: 2, mb: 2 }}>
              <Typography variant="subtitle2" color="primary" fontWeight={600}>{distanceLabel}</Typography>
            </Box>
          )}

          {/* Point de chargement */}
          <Grid item xs={12}>
            <Paper sx={{ mb: 2, p: 2, borderRadius: 2, boxShadow: 'none', border: '1px solid #e3e3e3', bgcolor: 'rgba(102, 126, 234, 0.03)' }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#1a237e', mb: 1 }}>
                🚛 Point de Chargement
              </Typography>
              <Grid container spacing={1}>
                <Grid item xs={12} md={12}>
                  <AddressAutocomplete
                    value={formData.loadingLocation?.displayName ?? ''}
                    label="Adresse (Google Maps)"
                    onChange={(val) => {
                      handleLocationChange('loadingLocation', 'displayName', val.address ?? '');
                      handleLocationChange('loadingLocation', 'formattedAddress', val.address ?? '');
                      handleLocationChange('loadingLocation', 'latitude', val.latitude ?? 0);
                      handleLocationChange('loadingLocation', 'longitude', val.longitude ?? 0);
                      handleLocationChange('loadingLocation', 'placeId', val.placeId ?? '');
                    }}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Latitude"
                    type="number"
                    value={formData.loadingLocation?.latitude ?? 0}
                    InputProps={{ readOnly: true, style: { background: '#f5f5f5' } }}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Longitude"
                    type="number"
                    value={formData.loadingLocation?.longitude ?? 0}
                    InputProps={{ readOnly: true, style: { background: '#f5f5f5' } }}
                  />
                </Grid>
              </Grid>
            </Paper>
          </Grid>

          {/* Point de livraison */}
          <Grid item xs={12}>
            <Paper sx={{ mb: 2, p: 2, borderRadius: 2, boxShadow: 'none', border: '1px solid #e3e3e3', bgcolor: 'rgba(102, 126, 234, 0.03)' }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#1a237e', mb: 1 }}>
                🎯 Point de Livraison
              </Typography>
              <Grid container spacing={1}>
                <Grid item xs={12} md={12}>
                  <AddressAutocomplete
                    value={formData.deliveryLocation?.displayName ?? ''}
                    label="Adresse (Google Maps)"
                    onChange={(val) => {
                      handleLocationChange('deliveryLocation', 'displayName', val.address ?? '');
                      handleLocationChange('deliveryLocation', 'formattedAddress', val.address ?? '');
                      handleLocationChange('deliveryLocation', 'latitude', val.latitude ?? 0);
                      handleLocationChange('deliveryLocation', 'longitude', val.longitude ?? 0);
                      handleLocationChange('deliveryLocation', 'placeId', val.placeId ?? '');
                    }}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Latitude"
                    type="number"
                    value={formData.deliveryLocation?.latitude ?? 0}
                    InputProps={{ readOnly: true, style: { background: '#f5f5f5' } }}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Longitude"
                    type="number"
                    value={formData.deliveryLocation?.longitude ?? 0}
                    InputProps={{ readOnly: true, style: { background: '#f5f5f5' } }}
                  />
                </Grid>
              </Grid>
            </Paper>
          </Grid>

          {/* Retour à vide */}
          <Grid item xs={12}>
            <Paper sx={{ mb: 2, p: 2, borderRadius: 2, boxShadow: 'none', border: '1px solid #e3e3e3', bgcolor: 'rgba(102, 126, 234, 0.03)' }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#1a237e', mb: 1 }}>
                🔄 Retour à Vide
              </Typography>
              <Grid container spacing={1}>
                <Grid item xs={12} md={12}>
                  <AddressAutocomplete
                    value={formData.emptyReturnLocation?.displayName ?? ''}
                    label="Adresse (Google Maps)"
                    onChange={(val) => {
                      handleLocationChange('emptyReturnLocation', 'displayName', val.address ?? '');
                      handleLocationChange('emptyReturnLocation', 'formattedAddress', val.address ?? '');
                      handleLocationChange('emptyReturnLocation', 'latitude', val.latitude ?? 0);
                      handleLocationChange('emptyReturnLocation', 'longitude', val.longitude ?? 0);
                      handleLocationChange('emptyReturnLocation', 'placeId', val.placeId ?? '');
                    }}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Latitude"
                    type="number"
                    value={formData.emptyReturnLocation?.latitude ?? 0}
                    InputProps={{ readOnly: true, style: { background: '#f5f5f5' } }}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Longitude"
                    type="number"
                    value={formData.emptyReturnLocation?.longitude ?? 0}
                    InputProps={{ readOnly: true, style: { background: '#f5f5f5' } }}
                  />
                </Grid>
              </Grid>
            </Paper>
          </Grid>
        </Grid>
      </TabPanel>

      {/* Tab 3: Tarification */}
      <TabPanel value={activeTab} index={2}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Tarif unitaire"
              type="number"
              value={formData.unitTariff ?? 0}
              onChange={(e) => handleInputChange('unitTariff', parseFloat(e.target.value) || 0)}
              error={!!errors.unitTariff}
              helperText={errors.unitTariff}
              required
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Temps libre (heures)"
              type="number"
              value={formData.freeTime}
              onChange={(e) => handleInputChange('freeTime', parseFloat(e.target.value) || 0)}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Tarif multi-arrêts"
              type="number"
              value={formData.multiStop}
              onChange={(e) => handleInputChange('multiStop', parseFloat(e.target.value) || 0)}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Tarif heures supplémentaires"
              type="number"
              value={formData.overtimeTariff}
              onChange={(e) => handleInputChange('overtimeTariff', parseFloat(e.target.value) || 0)}
            />
          </Grid>

          {/* Types de cargaison */}
          <Grid item xs={12}>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, color: '#1a237e' }}>
              📦 Types de Cargaison
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
              {formData.cargoTypes?.map((cargoType, index) => {
                const cargoLabel = CARGO_TYPE_OPTIONS.find(opt => opt.code === cargoType)?.label || cargoType;
                return (
                  <Chip
                    key={`${cargoType}-${index}`}
                    label={cargoLabel}
                    onDelete={() => removeCargoType(index)}
                    color="primary"
                    variant="outlined"
                  />
                );
              })}
            </Box>
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', mb: 2 }}>
              <FormControl sx={{ minWidth: 220 }}>
                <InputLabel id="cargo-type-select-label">Ajouter un type de cargaison</InputLabel>
                <Select
                  labelId="cargo-type-select-label"
                  value={cargoTypeToAdd}
                  label="Ajouter un type de cargaison"
                  onChange={e => setCargoTypeToAdd(e.target.value)}
                >
                  {CARGO_TYPE_OPTIONS.filter(opt => !formData.cargoTypes?.includes(opt.code)).map(opt => (
                    <MenuItem key={opt.code} value={opt.code}>{opt.label}</MenuItem>
                  ))}
                </Select>
              </FormControl>
              <Button
                startIcon={<AddIcon />}
                onClick={addCargoType}
                variant="outlined"
                sx={{ borderRadius: 2 }}
                disabled={!cargoTypeToAdd}
              >
                Ajouter
              </Button>
            </Box>
          </Grid>

          {/* Surcharges */}
          <Grid item xs={12}>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, color: '#1a237e' }}>
              💰 Surcharges
            </Typography>
            {formData.surcharges?.map((surcharge, index) => (
              <Accordion key={`surcharge-${index}`} sx={{ mb: 2 }}>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography sx={{ fontWeight: 600 }}>
                    Surcharge {index + 1}: {surcharge.name || 'Nouvelle surcharge'}
                  </Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Grid container spacing={2}>
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        label="Type"
                        value={surcharge.type}
                        onChange={(e) => updateSurcharge(index, 'type', e.target.value)}
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        label="Nom"
                        value={surcharge.name}
                        onChange={(e) => updateSurcharge(index, 'name', e.target.value)}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Description"
                        value={surcharge.description}
                        onChange={(e) => updateSurcharge(index, 'description', e.target.value)}
                        multiline
                        rows={2}
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        label="Montant"
                        type="number"
                        value={surcharge.amount}
                        onChange={(e) => updateSurcharge(index, 'amount', parseFloat(e.target.value) || 0)}
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <FormControl fullWidth>
                        <InputLabel>Devise</InputLabel>
                        <Select
                          value={surcharge.currency}
                          onChange={(e) => updateSurcharge(index, 'currency', e.target.value)}
                          label="Devise"
                        >
                          <MenuItem value="EUR">EUR</MenuItem>
                          <MenuItem value="USD">USD</MenuItem>
                          <MenuItem value="GBP">GBP</MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={surcharge.isPercentage}
                            onChange={(e) => updateSurcharge(index, 'isPercentage', e.target.checked)}
                          />
                        }
                        label="Pourcentage"
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={surcharge.isMandatory}
                            onChange={(e) => updateSurcharge(index, 'isMandatory', e.target.checked)}
                          />
                        }
                        label="Obligatoire"
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <Button
                        startIcon={<DeleteIcon />}
                        onClick={() => removeSurcharge(index)}
                        color="error"
                        variant="outlined"
                        size="small"
                      >
                        Supprimer cette surcharge
                      </Button>
                    </Grid>
                  </Grid>
                </AccordionDetails>
              </Accordion>
            ))}
            <Button
              startIcon={<AddIcon />}
              onClick={addSurcharge}
              variant="outlined"
              sx={{ borderRadius: 2 }}
            >
              Ajouter une surcharge
            </Button>
          </Grid>
        </Grid>
      </TabPanel>

      {/* Tab 4: Détails */}
      <TabPanel value={activeTab} index={3}>
        <Grid container spacing={3}>
          {/* Assurance transport */}
          <Grid item xs={12}>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, color: '#1a237e' }}>
              🛡️ Assurance Transport
            </Typography>
            <Paper sx={{ p: 3, bgcolor: 'rgba(76, 175, 80, 0.05)' }}>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={formData.transportInsurance.isInsured}
                        onChange={(e) => handleInsuranceChange('isInsured', e.target.checked)}
                      />
                    }
                    label="Transport assuré"
                  />
                </Grid>
                {formData.transportInsurance.isInsured && (
                  <>
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        label="Taux d'assurance (%)"
                        type="number"
                        value={formData.transportInsurance.rate}
                        onChange={(e) => handleInsuranceChange('rate', parseFloat(e.target.value) || 0)}
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        label="Montant minimum"
                        type="number"
                        value={formData.transportInsurance.minimumAmount}
                        onChange={(e) => handleInsuranceChange('minimumAmount', parseFloat(e.target.value) || 0)}
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        label="Montant maximum"
                        type="number"
                        value={formData.transportInsurance.maximumAmount}
                        onChange={(e) => handleInsuranceChange('maximumAmount', parseFloat(e.target.value) || 0)}
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <FormControl fullWidth>
                        <InputLabel>Devise</InputLabel>
                        <Select
                          value={formData.transportInsurance?.currency ?? 'EUR'}
                          onChange={(e) => handleInsuranceChange('currency', e.target.value)}
                          label="Devise"
                        >
                          <MenuItem value="EUR">EUR</MenuItem>
                          <MenuItem value="USD">USD</MenuItem>
                          <MenuItem value="GBP">GBP</MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        label="Fournisseur d'assurance"
                        value={formData.transportInsurance?.insuranceProvider ?? ''}
                        onChange={(e) => handleInsuranceChange('insuranceProvider', e.target.value)}
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        label="Numéro de police"
                        value={formData.transportInsurance?.policyNumber ?? ''}
                        onChange={(e) => handleInsuranceChange('policyNumber', e.target.value)}
                      />
                    </Grid>
                  </>
                )}
              </Grid>
            </Paper>
          </Grid>

          {/* Conditions de livraison */}
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Conditions de livraison"
              value={formData.deliveryTerms}
              onChange={(e) => handleInputChange('deliveryTerms', e.target.value)}
              multiline
              rows={3}
            />
          </Grid>

          {/* Commentaires */}
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Commentaires"
              value={formData.comment}
              onChange={(e) => handleInputChange('comment', e.target.value)}
              multiline
              rows={4}
            />
          </Grid>

          {/* Créé par */}
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Créé par"
              value={formData.createdBy ?? ''}
              onChange={(e) => handleInputChange('createdBy', e.target.value)}
            />
          </Grid>
        </Grid>
      </TabPanel>

      {/* Affichage du label de distance cumulée à la fin du formulaire */}
      {distanceLabel && (
        <Box sx={{ mt: 4, mb: 2 }}>
          <Typography variant="subtitle2" color="primary" fontWeight={600}>{distanceLabel}</Typography>
        </Box>
      )}

      {/* Submit Button */}
      <Box sx={{ p: 3, borderTop: '1px solid #e0e0e0', bgcolor: 'rgba(102, 126, 234, 0.05)' }}>
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
          <Button
            type="submit"
            variant="contained"
            disabled={loading}
            sx={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              borderRadius: 2,
              px: 4,
              py: 1.5,
              fontWeight: 600,
              textTransform: 'none',
              fontSize: '1rem',
              boxShadow: '0 4px 15px rgba(102, 126, 234, 0.3)',
              '&:hover': {
                background: 'linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)',
                transform: 'translateY(-2px)',
                boxShadow: '0 8px 25px rgba(102, 126, 234, 0.4)'
              },
              '&:disabled': {
                background: '#ccc',
                transform: 'none',
                boxShadow: 'none'
              }
            }}
          >
            {loading ? 'Sauvegarde...' : (isEditMode ? 'Mettre à jour' : 'Créer le transport')}
          </Button>
        </Box>
      </Box>
    </Box>
  );
};

export default HaulageForm; 