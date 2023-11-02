import React from "react";
import { 
  Box, 
  Typography, 
  Button, 
  TextField, 
  Autocomplete, 
  Grid, 
  Card, 
  CardContent, 
  Avatar, 
  Fade,
  Slide,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert
} from "@mui/material";
import BusinessIcon from '@mui/icons-material/Business';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import AssignmentIcon from '@mui/icons-material/Assignment';
import PersonIcon from '@mui/icons-material/Person';
import DescriptionIcon from '@mui/icons-material/Description';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import Inventory2Icon from '@mui/icons-material/Inventory2';
import { StatusRequest } from "@features/request/api/types.gen";
import { useTranslation } from 'react-i18next';
import OfferBasketDrawerAccordion from './OfferBasketDrawerAccordion';
import AssigneeField from '@components/shared/AssigneeField';

import { useState, useMemo, useEffect, useCallback } from "react";
import { useQuery } from '@tanstack/react-query';
import { getUserGroupUsersOptions } from '@features/request/api/@tanstack/react-query.gen';
// import { getUserGroupUsersByUserId } from '@features/request/api/sdk.gen'; // Plus utilisé

interface Step1RequestFormProps {
  customer: any;
  setCustomer: (customer: any) => void;
  customers: any[];
  cityFrom: any;
  setCityFrom: (city: any) => void;
  cityTo: any;
  setCityTo: (city: any) => void;
  status: StatusRequest;
  setStatus: (status: StatusRequest) => void;
  assignee: string | number;
  setAssignee: (assignee: string | number) => void;
  members: any[];
  comment: string;
  setComment: (comment: string) => void;
  products: any[];
  productName: any;
  setProductName: (product: any) => void;
  incoterms: string[];
  incotermName: string;
  setIncotermName: (incoterm: string) => void;
  errors: any;
  isLoading: boolean;

  isLoadingCustomers: boolean;
  onSaved: () => void;
  selectedHaulage: any[];
  selectedSeafreight: any[];
  selectedMiscellaneous: any[];
  services: any[];
  contacts: any[];
  setSelectedMiscellaneous: (miscellaneous: any[]) => void;
  locked: boolean;
  // Nouvelles props pour pickupLocation et deliveryLocation
  pickupLocation?: {
    city: string;
    country: string;
  };
  deliveryLocation?: {
    city: string;
    country: string;
  };
  selectedContainers: any;
  onContainerChange: (serviceId: string, container: any) => void;
  
  // Nouvelles props pour la gestion du draft
  draftQuote?: any;
  setDraftQuote?: (draft: any) => void;
  onSaveDraft?: () => Promise<void>;
}

const Step1RequestForm: React.FC<Step1RequestFormProps> = ({
  customer,
  setCustomer,
  customers,
  cityFrom,
  setCityFrom,
  cityTo,
  setCityTo,
  status,
  setStatus,
  assignee,
  setAssignee,
  members,
  comment,
  setComment,
  products,
  productName,
  setProductName,
  incoterms,
  incotermName,
  setIncotermName,
  errors,
  isLoading,
  isLoadingCustomers,
  onSaved,
  selectedHaulage,
  selectedSeafreight,
  selectedMiscellaneous,
  services,
  contacts,
  setSelectedMiscellaneous,
  locked,
  pickupLocation,
  deliveryLocation,
  selectedContainers,
  onContainerChange,
  draftQuote,
  setDraftQuote,
  onSaveDraft
}) => {
  // Log des valeurs reçues pour débogage
 /*console.log('🔧 [STEP1] Props reçues:', {
    assignee,
    incotermName,
    cityFrom,
    cityTo,
    productName,
    customer,
    status,
    comment
  });*/

  //console.log('🔧 [STEP1] DraftQuote complet reçu:', draftQuote);
  //console.log('🔧 [STEP1] Email utilisateur dans draftQuote:', draftQuote?.emailUser);

  const { t, i18n } = useTranslation();



  // Ajout des états pour l'aide au choix du container
  const [typeMarchandise, setTypeMarchandise] = useState('standard');
  const [volume, setVolume] = useState('');
  const [poids, setPoids] = useState('');
  const [temperature, setTemperature] = useState('non');
  const [empilable, setEmpilable] = useState('oui');
  const [fragile, setFragile] = useState('non');
  const [conditionnement, setConditionnement] = useState('palette');

  const suggestionContainer = useMemo(() => {
    // Capacités utiles (en m³ et kg)
    const capacities = {
      dry20: { volume: 33, weight: 28000 },
      dry40: { volume: 67, weight: 28000 },
      hc40: { volume: 76, weight: 28000 },
      reefer20: { volume: 28, weight: 27000 },
      reefer40: { volume: 58, weight: 27000 },
    };
    // Parsing
    const v = Number(volume);
    const p = Number(poids);
    // Sélection du type de base
    let type = 'Dry';
    let isReefer = false;
    if (typeMarchandise === 'reefer' || temperature === 'oui') { type = 'Reefer'; isReefer = true; }
    if (typeMarchandise === 'dangerous') type = 'Dry ou Tank (IMDG)';
    if (typeMarchandise === 'oversize') type = 'Open Top ou Flat Rack';
    if (typeMarchandise === 'liquid') type = 'Tank';
    // Cas spéciaux (pas de calcul)
    if (type === 'Dry ou Tank (IMDG)' || type === 'Open Top ou Flat Rack' || type === 'Tank') {
      return `Container ${type} recommandé`;
    }
    // Calcul taille/quantité
    let size = "20'";
    let cap = isReefer ? capacities.reefer20 : capacities.dry20;
    if (!isNaN(v) && v > 40) {
      size = "40'";
      cap = isReefer ? capacities.reefer40 : capacities.dry40;
      if (!isReefer && v > 70) {
        size = "40' High Cube";
        cap = capacities.hc40;
      }
    }
    // Calcul quantité
    let qty = 1;
    if (!isNaN(v) && !isNaN(p)) {
      const qtyByVol = Math.ceil(v / cap.volume);
      const qtyByWeight = Math.ceil(p / cap.weight);
      qty = Math.max(qtyByVol, qtyByWeight);
    } else if (!isNaN(v)) {
      qty = Math.ceil(v / cap.volume);
    } else if (!isNaN(p)) {
      qty = Math.ceil(p / cap.weight);
    }
    if (qty < 1) qty = 1;
    // Suggestion finale
    return `Container ${size} ${type} recommandé — Quantité : ${qty}`;
  }, [typeMarchandise, volume, poids, temperature]);

  useEffect(() => {
    // Préremplissage des données step1
  }, [customer, cityFrom, cityTo, productName, incotermName, pickupLocation, deliveryLocation]);

  /**
   * OPTIMISATION ASSIGNÉS - Chargement intelligent :
   * - Utilise React Query pour le cache automatique
   * - Évite les re-rendus inutiles
   * - Chargement à la demande
   */
  const { data: assigneesData, isLoading: isLoadingAssignees } = useQuery({
    ...getUserGroupUsersOptions(),
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    enabled: !members || members.length === 0, // Charger seulement si members n'est pas fourni
  });

  // Extraction et validation des données (identique à Request.tsx)
  const assignees = Array.isArray((assigneesData as any)?.data) ? (assigneesData as any).data : [];
  
  // Priorité aux members du parent, fallback aux données de l'API
  const availableMembers = members?.length > 0 ? members : assignees;
  const isLoadingMembers = members?.length > 0 ? false : isLoadingAssignees;

  // Gestion de l'assigné sélectionné (identique à Request.tsx)
  const assigneeIdStr = assignee ? String(assignee) : '';
  const selectedAssignee = React.useMemo(() => {
    return availableMembers.find((a: any) => String(a.id) === assigneeIdStr);
  }, [availableMembers, assigneeIdStr]);

  // Fallback pour les assignés non trouvés (identique à Request.tsx)
  const assigneesWithFallback = React.useMemo(() => {
    return assigneeIdStr && !selectedAssignee
      ? [
          ...availableMembers,
          { id: assigneeIdStr, displayName: assigneeIdStr, mail: '' }
        ]
      : availableMembers;
  }, [availableMembers, assigneeIdStr, selectedAssignee]);

  useEffect(() => {
    // Monitoring des données des assignés
  }, [members, assignees, availableMembers, assigneesWithFallback, isLoadingMembers, assignee, assigneeIdStr, selectedAssignee, isLoadingAssignees]);

  // Les détails de l'assigné sont déjà disponibles dans selectedAssignee
  // Plus besoin d'appel API supplémentaire
  React.useEffect(() => {
    if (selectedAssignee) {
      console.log('[DEBUG] Assigné sélectionné (Step1):', {
        id: selectedAssignee.id,
        displayName: selectedAssignee.displayName,
        mail: selectedAssignee.mail
      });
    }
  }, [selectedAssignee]);

  // Validation locale des champs obligatoires
  const validateStep1 = useCallback(() => {
    const errors: string[] = [];
    
    // Validation du client
    if (!customer || (!customer.name && !customer.contactName && !customer.contactId)) {
      errors.push('Le client est obligatoire');
    }
    
    // Validation de la ville de départ - logique flexible
    const cityFromName = cityFrom?.name || cityFrom?.cityName || (typeof cityFrom === 'string' ? cityFrom : '');
    if (!cityFromName || cityFromName.trim() === '') {
      errors.push('La ville de départ est obligatoire');
    }
    
    // Validation de la ville d'arrivée - logique flexible
    const cityToName = cityTo?.name || cityTo?.cityName || (typeof cityTo === 'string' ? cityTo : '');
    if (!cityToName || cityToName.trim() === '') {
      errors.push('La ville d\'arrivée est obligatoire');
    }
    
    // Validation du produit
    if (!productName || (typeof productName === 'object' && !productName.productName)) {
      errors.push('Le produit est obligatoire');
    }
    
    // Validation de l'incoterm
    if (!incotermName || incotermName.trim() === '') {
      errors.push('L\'incoterm est obligatoire');
    }
    

    
    return {
      isValid: errors.length === 0,
      errors
    };
  }, [customer, cityFrom, cityTo, productName, incotermName]);

  // État pour les erreurs de validation
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [showValidationErrors, setShowValidationErrors] = useState(false);
  // Désactiver l'affichage des erreurs si les champs sont verrouillés (demande existante)
  const shouldShowValidationErrors = showValidationErrors && !locked;
  
  // États pour la sauvegarde - simplifiés (sauvegarde gérée par le wizard principal)

  // Validation en temps réel
  useEffect(() => {
    const validation = validateStep1();
    setValidationErrors(validation.errors);
  }, [validateStep1]);

  // Sauvegarde locale de l'étape 1
  const saveStep1ToLocal = useCallback(() => {
    if (!setDraftQuote) return;

    const emailUser = draftQuote?.emailUser || 'user@example.com';
    console.log('💾 [STEP1] Sauvegarde avec email utilisateur:', emailUser);

    const step1Data = {
      customer: customer,
      cityFrom: {
        name: cityFrom?.name || pickupLocation?.city || '',
        country: cityFrom?.country || pickupLocation?.country || ''
      },
      cityTo: {
        name: cityTo?.name || deliveryLocation?.city || '',
        country: cityTo?.country || deliveryLocation?.country || ''
      },
      productName: typeof productName === 'string' ? productName : productName?.productName || '',
      assignee: assignee,
      incotermName: incotermName,
      comment: comment,
      status: status,
      emailUser: emailUser // ✅ Inclure l'email utilisateur
    };

    // Sauvegarde locale step1

    // Mettre à jour le draft local avec structure correcte
    const updatedDraft = {
      ...draftQuote,
      step1: {
        ...draftQuote?.step1,
        ...step1Data
      }
    };

    // Draft mis à jour
    setDraftQuote((prev: any) => ({ ...prev, ...updatedDraft }));

    // Sauvegarde dans localStorage comme fallback
    localStorage.setItem('wizard_draft_step1', JSON.stringify(step1Data));
    
    return step1Data;
  }, [
    customer, cityFrom, cityTo, productName, assignee, incotermName, comment, status,
    pickupLocation, deliveryLocation, draftQuote, setDraftQuote
  ]);

  // La sauvegarde complète est maintenant gérée par le wizard principal

  // Auto-sauvegarde locale à chaque changement
  useEffect(() => {
    if (setDraftQuote) {
      const timeoutId = setTimeout(() => {
        // Auto-sauvegarde déclenchée
        saveStep1ToLocal();
      }, 500); // Débounce de 500ms
      
      return () => clearTimeout(timeoutId);
    }
  }, [customer, cityFrom, cityTo, productName, assignee, incotermName, comment, saveStep1ToLocal]);

  // Fonction pour gérer la soumission avec validation
  const handleSubmit = useCallback(() => {
    const validation = validateStep1();
    setShowValidationErrors(true);
    
    if (validation.isValid) {
      // Sauvegarder localement avant de continuer
      saveStep1ToLocal();
      setShowValidationErrors(false);
      onSaved();
    } else {
      // Erreurs de validation détectées
    }
  }, [validateStep1, saveStep1ToLocal, onSaved]);

  return (
    <Box sx={{ 
      background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
      minHeight: '100vh',
      p: 3
    }}>
      <Fade in timeout={800}>
        <Box>

          
          {/* Message de verrouillage */}
          {locked && (
            <Box sx={{ mb: 2, p: 2, background: '#fffbe6', border: '1px solid #ffe58f', borderRadius: 2 }}>
              <Typography color="warning.main" fontWeight={600}>
                {t('requestWizard.step1.lockedFieldsMessage')}
              </Typography>
            </Box>
          )}

          {/* Messages d'erreur de validation */}
          {shouldShowValidationErrors && validationErrors.length > 0 && (
            <Box sx={{ mb: 2, p: 2, background: '#f8d7da', border: '1px solid #f5c6cb', borderRadius: 2 }}>
              <Typography color="error.main" fontWeight={600} sx={{ mb: 1 }}>
                Veuillez corriger les erreurs suivantes :
              </Typography>
              <Box component="ul" sx={{ m: 0, pl: 2 }}>
                {validationErrors.map((error, index) => (
                  <Typography key={index} component="li" color="error.main" sx={{ mb: 0.5 }}>
                    {error}
                  </Typography>
                ))}
              </Box>
            </Box>
          )}

          {/* Messages de sauvegarde supprimés - utiliser les notifications du wizard principal */}
          {/* Header avec titre moderne */}
          <Box sx={{ 
            textAlign: 'center', 
            mb: 4,
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            borderRadius: 4,
            p: 4,
            color: 'white',
            boxShadow: '0 20px 40px rgba(0,0,0,0.1)'
          }}>
            <Typography variant="h3" sx={{ 
              fontWeight: 700, 
              mb: 1,
              textShadow: '2px 2px 4px rgba(0,0,0,0.3)'
            }}>
              {t('requestWizard.step1.createNewRequestWizard')}
            </Typography>
            <Typography variant="h6" sx={{ opacity: 0.9 }}>
              {t('requestWizard.step1.fillBaseRequestInfo')}
            </Typography>
            {locked && (
              <Box sx={{ 
                mt: 2, 
                p: 2, 
                backgroundColor: 'rgba(255,193,7,0.2)', 
                borderRadius: 2,
                border: '1px solid rgba(255,193,7,0.3)'
              }}>
                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                  ℹ️ Cette demande provient d'une demande existante. Seuls les champs "Incoterm" et "Assigné à" peuvent être modifiés.
                </Typography>
              </Box>
            )}
          </Box>

          {/* Formulaire principal */}
          <Slide direction="up" in timeout={1000}>
            <Card sx={{ 
              mb: 4, 
              borderRadius: 3,
              boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
              background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)'
            }}>
              <CardContent sx={{ p: 4 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                  <Avatar sx={{ 
                    bgcolor: 'primary.main', 
                    mr: 2,
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                  }}>
                    <BusinessIcon />
                  </Avatar>
                  <Typography variant="h5" sx={{ fontWeight: 600, color: '#2c3e50' }}>
                    {t('requestWizard.step1.requestInfo')}
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#7f8c8d', ml: 2 }}>
                    <span style={{ color: '#e74c3c' }}>*</span> Champs obligatoires
                  </Typography>
                  
                  {/* Indicateur de sauvegarde automatique */}
                  <Box sx={{ ml: 'auto', display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography variant="caption" sx={{ color: '#27ae60', fontWeight: 500 }}>
                      💾 Sauvegarde automatique
                    </Typography>
                  </Box>
                </Box>

                <Grid container spacing={3}>
                  {/* Client */}
                  <Grid item xs={12} md={6}>
                    <Box sx={{ mb: 3 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <PersonIcon sx={{ color: '#3498db', mr: 1 }} />
                        <Typography variant="subtitle1" sx={{ fontWeight: 600, color: '#2c3e50' }}>
                          {t('requestWizard.step1.client')} <span style={{ color: '#e74c3c' }}>*</span>
                        </Typography>
                      </Box>
                      {customer && customer.productName && (
                        <Alert severity="warning" sx={{ mb: 2 }}>
                          Attention : le champ client contient un produit au lieu d'un client. Veuillez sélectionner un client valide.
                        </Alert>
                      )}
                      <Autocomplete
                        id="onboarding-customer-select"
                        options={customers}
                        getOptionLabel={(option) => option.name || option.contactName || ''}
                        value={customer}
                        onChange={(_, newValue) => setCustomer(newValue)}
                        loading={isLoadingCustomers}
                        isOptionEqualToValue={(option, value) =>
                          (option && value && ((option.id && value.id && option.id === value.id) || (option.contactId && value.contactId && option.contactId === value.contactId)))
                        }
                        disabled={locked}
                        renderOption={(props, option) => (
                          <li {...props} key={option.id || option.contactId}>
                            {option.name || option.contactName}
                          </li>
                        )}
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            placeholder={t('requestWizard.step1.selectClientPlaceholder')}
                            variant="outlined"
                            fullWidth
                            disabled={locked}
                            error={shouldShowValidationErrors && (!customer || (!customer.name && !customer.contactName))}
                            helperText={shouldShowValidationErrors && (!customer || (!customer.name && !customer.contactName)) ? 'Le client est obligatoire' : ''}
                            sx={{
                              '& .MuiOutlinedInput-root': {
                                borderRadius: 2,
                                backgroundColor: '#f8f9fa',
                                '&:hover': {
                                  backgroundColor: '#e9ecef',
                                },
                                '&.Mui-focused': {
                                  backgroundColor: '#ffffff',
                                  boxShadow: '0 0 0 2px rgba(102, 126, 234, 0.2)',
                                }
                              }
                            }}
                          />
                        )}
                      />
                    </Box>
                  </Grid>

                  {/* Assigné */}
                  <Grid item xs={12} md={6}>
                    <Box sx={{ mb: 3 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <AssignmentIcon sx={{ color: '#f39c12', mr: 1 }} />
                        <Typography variant="subtitle1" sx={{ fontWeight: 600, color: '#2c3e50' }}>
                          {t('requestWizard.step1.assignedTo')}
                        </Typography>
                      </Box>
                      <AssigneeField
                        id="assigneeId"
                        value={assignee}
                        onChange={setAssignee}
                        assignees={assigneesWithFallback}
                        isLoading={isLoadingMembers}
                        variant="select"
                        size="small"
                        fullWidth
                        disabled={false} // Toujours éditable
                        labelColor="#2c3e50"
                        labelWeight="600"
                        placeholder={t('requestWizard.step1.selectAssigneePlaceholder')}
                        customStyles={{
                          container: { mb: 0 },
                          label: { display: 'none' } // On cache le label car on utilise notre propre header
                        }}
                      />
                    </Box>
                  </Grid>

                  {/* Ville de départ */}
                  <Grid item xs={12} md={6}>
                    <Box sx={{ mb: 3 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <LocationOnIcon sx={{ color: '#e74c3c', mr: 1 }} />
                        <Typography variant="subtitle1" sx={{ fontWeight: 600, color: '#2c3e50' }}>
                          {t('requestWizard.step1.departureCity')} <span style={{ color: '#e74c3c' }}>*</span>
                        </Typography>
                      </Box>
                      <Grid container spacing={2}>
                        <Grid item xs={8}>
                          <TextField
                            id="onboarding-departure-city"
                            value={cityFrom?.name || pickupLocation?.city || ''}
                            onChange={(e) => {
                              const newCityFrom = { 
                                name: e.target.value, 
                                country: cityFrom?.country || pickupLocation?.country || '' 
                              };
                              // setCityFrom appelé
                              setCityFrom(newCityFrom);
                            }}
                            placeholder="Ville"
                            variant="outlined"
                            fullWidth
                            disabled={locked}
                            error={shouldShowValidationErrors && !cityFrom?.name}
                            helperText={shouldShowValidationErrors && !cityFrom?.name ? 'La ville est obligatoire' : ''}
                            sx={{
                              '& .MuiOutlinedInput-root': {
                                borderRadius: 2,
                                backgroundColor: '#f8f9fa',
                                '&:hover': {
                                  backgroundColor: '#e9ecef',
                                },
                                '&.Mui-focused': {
                                  backgroundColor: '#ffffff',
                                  boxShadow: '0 0 0 2px rgba(102, 126, 234, 0.2)',
                                }
                              }
                            }}
                          />
                        </Grid>
                        <Grid item xs={4}>
                          <TextField
                            id="onboarding-departure-country"
                            value={cityFrom?.country || pickupLocation?.country || ''}
                            onChange={(e) => {
                              const newCityFrom = { 
                                name: cityFrom?.name || '', 
                                country: e.target.value 
                              };
                              // setCityFrom (country) appelé
                              setCityFrom(newCityFrom);
                            }}
                            placeholder="Pays"
                            variant="outlined"
                            fullWidth
                            disabled={locked}

                            sx={{
                              '& .MuiOutlinedInput-root': {
                                borderRadius: 2,
                                backgroundColor: '#f8f9fa',
                                '&:hover': {
                                  backgroundColor: '#e9ecef',
                                },
                                '&.Mui-focused': {
                                  backgroundColor: '#ffffff',
                                  boxShadow: '0 0 0 2px rgba(102, 126, 234, 0.2)',
                                }
                              }
                            }}
                          />
                        </Grid>
                      </Grid>
                    </Box>
                  </Grid>

                  {/* Ville d'arrivée */}
                  <Grid item xs={12} md={6}>
                    <Box sx={{ mb: 3 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <LocationOnIcon sx={{ color: '#27ae60', mr: 1 }} />
                        <Typography variant="subtitle1" sx={{ fontWeight: 600, color: '#2c3e50' }}>
                          {t('requestWizard.step1.arrivalCity')} <span style={{ color: '#e74c3c' }}>*</span>
                        </Typography>
                      </Box>
                      <Grid container spacing={2}>
                        <Grid item xs={8}>
                          <TextField
                            id="onboarding-arrival-city"
                            value={cityTo?.name || deliveryLocation?.city || ''}
                            onChange={(e) => {
                              const newCityTo = { 
                                name: e.target.value, 
                                country: cityTo?.country || deliveryLocation?.country || '' 
                              };
                              // setCityTo appelé
                              setCityTo(newCityTo);
                            }}
                            placeholder="Ville"
                            variant="outlined"
                            fullWidth
                            disabled={locked}
                            error={shouldShowValidationErrors && !cityTo?.name}
                            helperText={shouldShowValidationErrors && !cityTo?.name ? 'La ville est obligatoire' : ''}
                            sx={{
                              '& .MuiOutlinedInput-root': {
                                borderRadius: 2,
                                backgroundColor: '#f8f9fa',
                                '&:hover': {
                                  backgroundColor: '#e9ecef',
                                },
                                '&.Mui-focused': {
                                  backgroundColor: '#ffffff',
                                  boxShadow: '0 0 0 2px rgba(102, 27, 234, 0.2)',
                                }
                              }
                            }}
                          />
                        </Grid>
                        <Grid item xs={4}>
                          <TextField
                            id="onboarding-arrival-country"
                            value={cityTo?.country || deliveryLocation?.country || ''}
                            onChange={(e) => {
                              const newCityTo = { 
                                name: cityTo?.name || '', 
                                country: e.target.value 
                              };
                              // setCityTo (country) appelé
                              setCityTo(newCityTo);
                            }}
                            placeholder="Pays"
                            variant="outlined"
                            fullWidth
                            disabled={locked}

                            sx={{
                              '& .MuiOutlinedInput-root': {
                                borderRadius: 2,
                                backgroundColor: '#f8f9fa',
                                '&:hover': {
                                  backgroundColor: '#e9ecef',
                                },
                                '&.Mui-focused': {
                                  backgroundColor: '#ffffff',
                                  boxShadow: '0 0 0 2px rgba(102, 126, 234, 0.2)',
                                }
                              }
                            }}
                          />
                        </Grid>
                      </Grid>
                    </Box>
                  </Grid>

                  {/* Produit */}
                  <Grid item xs={12} md={6}>
                    <Box sx={{ mb: 3 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <Inventory2Icon sx={{ color: '#8e44ad', mr: 1 }} />
                        <Typography variant="subtitle1" sx={{ fontWeight: 600, color: '#2c3e50' }}>
                          {t('requestWizard.step1.product')} <span style={{ color: '#e74c3c' }}>*</span>
                        </Typography>
                      </Box>
                      {productName ? (
                        <TextField
                          id="onboarding-product"
                          value={typeof productName === 'string' ? productName : productName?.productName || ''}
                          variant="outlined"
                          fullWidth
                          disabled={false}
                          onChange={(e) => {
                            // Permettre l'édition même si productName est défini
                            setProductName({ productName: e.target.value, productId: productName?.productId });
                          }}
                          error={shouldShowValidationErrors && (!productName || (typeof productName === 'object' && !productName.productName))}
                          helperText={shouldShowValidationErrors && (!productName || (typeof productName === 'object' && !productName.productName)) ? 'Le produit est obligatoire' : ''}
                          sx={{
                            '& .MuiOutlinedInput-root': {
                              borderRadius: 2,
                              backgroundColor: '#f8f9fa',
                              '&:hover': {
                                backgroundColor: '#e9ecef',
                              },
                              '&.Mui-focused': {
                                backgroundColor: '#ffffff',
                                boxShadow: '0 0 0 2px rgba(102, 126, 234, 0.2)',
                              }
                            }
                          }}
                        />
                      ) : (
                        <Autocomplete
                          options={products}
                          getOptionLabel={(option) => option.productName || ''}
                          value={productName}
                          onChange={(_, newValue) => setProductName(newValue)}
                          isOptionEqualToValue={(option, value) => option.productId === value.productId}
                          renderOption={(props, option) => (
                            <li {...props} key={option.productId}>
                              {option.productName}
                            </li>
                          )}
                          renderInput={(params) => (
                            <TextField
                              {...params}
                              placeholder={t('requestWizard.step1.selectProductPlaceholder')}
                              variant="outlined"
                              fullWidth
                              sx={{
                                '& .MuiOutlinedInput-root': {
                                  borderRadius: 2,
                                  backgroundColor: '#f8f9fa',
                                  '&:hover': {
                                    backgroundColor: '#e9ecef',
                                  },
                                  '&.Mui-focused': {
                                    backgroundColor: '#ffffff',
                                    boxShadow: '0 0 0 2px rgba(102, 126, 234, 0.2)',
                                  }
                                }
                              }}
                            />
                          )}
                        />
                      )}
                    </Box>
                  </Grid>

                  {/* Incoterm */}
                  <Grid item xs={12} md={6}>
                    <Box sx={{ mb: 3 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <AssignmentIcon sx={{ color: '#34495e', mr: 1 }} />
                        <Typography variant="subtitle1" sx={{ fontWeight: 600, color: '#2c3e50' }}>
                          {t('requestWizard.step1.incoterm')} <span style={{ color: '#e74c3c' }}>*</span>
                        </Typography>
                      </Box>
                      <FormControl fullWidth>
                        <Select
                          value={incotermName}
                          onChange={(e) => setIncotermName(e.target.value)}
                          displayEmpty
                          disabled={false} // Incoterm reste toujours modifiable même depuis une demande existante
                          error={shouldShowValidationErrors && (!incotermName || incotermName.trim() === '')}
                          sx={{
                            borderRadius: 2,
                            backgroundColor: '#f8f9fa',
                            '&:hover': {
                              backgroundColor: '#e9ecef',
                            },
                            '&.Mui-focused': {
                              backgroundColor: '#ffffff',
                              boxShadow: '0 0 0 2px rgba(102, 126, 234, 0.2)',
                            }
                          }}
                        >
                          <MenuItem value="">
                            <em>{t('requestWizard.step1.selectIncotermPlaceholder')}</em>
                          </MenuItem>
                          {incoterms.map((incoterm) => (
                            <MenuItem key={incoterm} value={incoterm}>
                              {incoterm}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Box>
                  </Grid>

                  {/* Commentaire */}
                  <Grid item xs={12}>
                    <Box sx={{ mb: 3 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <DescriptionIcon sx={{ color: '#e67e22', mr: 1 }} />
                        <Typography variant="subtitle1" sx={{ fontWeight: 600, color: '#2c3e50' }}>
                          {t('requestWizard.step1.comments')}
                        </Typography>
                      </Box>
                      <TextField
                        multiline
                        rows={4}
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        placeholder={t('requestWizard.step1.addAdditionalComments')}
                        variant="outlined"
                        fullWidth
                        disabled={locked}
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            borderRadius: 2,
                            backgroundColor: '#f8f9fa',
                            '&:hover': {
                              backgroundColor: '#e9ecef',
                            },
                            '&.Mui-focused': {
                              backgroundColor: '#ffffff',
                              boxShadow: '0 0 0 2px rgba(102, 126, 234, 0.2)',
                            }
                          }
                        }}
                      />
                    </Box>
                  </Grid>

                  {/* Aide au choix du container */}
                  <Grid item xs={12}>
                    <Card sx={{ mt: 2, p: 3, borderRadius: 3, background: 'linear-gradient(135deg, #e0eafc 0%, #cfdef3 100%)' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <Inventory2Icon sx={{ color: '#1976d2', mr: 1, fontSize: 28 }} />
                        <Typography variant="h6" sx={{ fontWeight: 700 }}>
                          Aide au choix du container
                        </Typography>
                      </Box>
                      <Grid container spacing={2}>
                        <Grid item xs={12} md={6}>
                          <InputLabel sx={{ fontWeight: 700, color: '#2c3e50', fontSize: 16, mb: 0.5 }}>Type de marchandise</InputLabel>
                          <FormControl fullWidth>
                            <Select value={typeMarchandise} onChange={e => setTypeMarchandise(e.target.value)} disabled={false}>
                              <MenuItem value="standard">Sèche/Standard</MenuItem>
                              <MenuItem value="reefer">Réfrigérée</MenuItem>
                              <MenuItem value="dangerous">Dangereuse</MenuItem>
                              <MenuItem value="oversize">Surdimensionnée</MenuItem>
                              <MenuItem value="liquid">Liquide/Gaz</MenuItem>
                            </Select>
                          </FormControl>
                        </Grid>
                        <Grid item xs={6} md={3}>
                          <InputLabel sx={{ fontWeight: 700, color: '#2c3e50', fontSize: 16, mb: 0.5 }}>Volume (m³)</InputLabel>
                          <TextField label="" value={volume} onChange={e => setVolume(e.target.value)} fullWidth disabled={false} />
                        </Grid>
                        <Grid item xs={6} md={3}>
                          <InputLabel sx={{ fontWeight: 700, color: '#2c3e50', fontSize: 16, mb: 0.5 }}>Poids (kg)</InputLabel>
                          <TextField label="" value={poids} onChange={e => setPoids(e.target.value)} fullWidth disabled={false} />
                        </Grid>
                        <Grid item xs={6} md={3}>
                          <InputLabel sx={{ fontWeight: 700, color: '#2c3e50', fontSize: 16, mb: 0.5 }}>Température contrôlée</InputLabel>
                          <FormControl fullWidth>
                            <Select value={temperature} onChange={e => setTemperature(e.target.value)} disabled={false}>
                              <MenuItem value="non">Non</MenuItem>
                              <MenuItem value="oui">Oui</MenuItem>
                            </Select>
                          </FormControl>
                        </Grid>
                        <Grid item xs={6} md={3}>
                          <InputLabel sx={{ fontWeight: 700, color: '#2c3e50', fontSize: 16, mb: 0.5 }}>Empilable</InputLabel>
                          <FormControl fullWidth>
                            <Select value={empilable} onChange={e => setEmpilable(e.target.value)} disabled={false}>
                              <MenuItem value="oui">Oui</MenuItem>
                              <MenuItem value="non">Non</MenuItem>
                            </Select>
                          </FormControl>
                        </Grid>
                        <Grid item xs={6} md={3}>
                          <InputLabel sx={{ fontWeight: 700, color: '#2c3e50', fontSize: 16, mb: 0.5 }}>Fragile</InputLabel>
                          <FormControl fullWidth>
                            <Select value={fragile} onChange={e => setFragile(e.target.value)} disabled={false}>
                              <MenuItem value="non">Non</MenuItem>
                              <MenuItem value="oui">Oui</MenuItem>
                            </Select>
                          </FormControl>
                        </Grid>
                        <Grid item xs={6} md={3}>
                          <InputLabel sx={{ fontWeight: 700, color: '#2c3e50', fontSize: 16, mb: 0.5 }}>Conditionnement</InputLabel>
                          <FormControl fullWidth>
                            <Select value={conditionnement} onChange={e => setConditionnement(e.target.value)} disabled={false}>
                              <MenuItem value="palette">Palette</MenuItem>
                              <MenuItem value="vrac">Vrac</MenuItem>
                              <MenuItem value="caisses">Caisses</MenuItem>
                              <MenuItem value="autre">Autre</MenuItem>
                            </Select>
                          </FormControl>
                        </Grid>
                      </Grid>
                      <Box sx={{ mt: 3 }}>
                        <Alert severity="info">
                          {suggestionContainer}
                        </Alert>
                      </Box>
                    </Card>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Slide>


          {/* Données pour le résumé */}
          
          <OfferBasketDrawerAccordion
            selectedHaulage={Array.isArray(selectedHaulage) ? undefined : selectedHaulage}
            selectedSeafreight={Array.isArray(selectedSeafreight) ? undefined : selectedSeafreight}
            selectedMiscellaneous={Array.isArray(selectedMiscellaneous) ? selectedMiscellaneous : []}
            services={services}
            contacts={contacts}
            onRemoveMisc={id => setSelectedMiscellaneous(selectedMiscellaneous.filter(m => m.id !== id))}
            currentStep={1}
            requestData={{
              customer,
              cityFrom,
              cityTo,
              productName,
              incotermName
            }}
            selectedServices={[]}
            selectedContainers={selectedContainers}
          >
            <div></div>
          </OfferBasketDrawerAccordion>
        </Box>
      </Fade>
    </Box>
  );
};

export default Step1RequestForm; 