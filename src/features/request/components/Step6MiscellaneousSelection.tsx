import React, { useEffect, useState, useMemo } from "react";
import { Box, Typography, Button, CircularProgress, List, ListItem, ListItemText, Alert, TextField, Grid, Autocomplete, Card, CardContent, Pagination, Stack, Chip, Fab, Badge, Drawer, useMediaQuery, Accordion, AccordionSummary, AccordionDetails, ButtonGroup, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Avatar, Fade, Slide } from "@mui/material";
import type { SeaFreightResponse } from "@features/pricingnew/api/types.gen";
import type { HaulageResponse } from "@features/pricingnew/api/types.gen";
import { useTranslation } from "react-i18next";
import dayjs from "dayjs";
import {
  ExpandMore as ExpandMoreIcon,
  DirectionsBoat as DirectionsBoatIcon,
  LocationOn as LocationOnIcon,
  Category as CategoryIcon,
  Euro as EuroIcon,
  CheckCircle as CheckCircleIcon,
  Language as LanguageIcon,
  AccessTime as AccessTimeIcon,
  Repeat as RepeatIcon,
  Straighten as StraightenIcon,
  Speed as SpeedIcon,
  CalendarMonth as CalendarMonthIcon,
  Schedule as ScheduleIcon,
  Info as InfoIcon,
  Person as PersonIcon,
  Receipt as ReceiptIcon,
  Fingerprint as FingerprintIcon,
  Business as BusinessIcon,
  Assignment as AssignmentIcon
} from "@mui/icons-material";
import OfferBasketDrawerAccordion from './OfferBasketDrawerAccordion';
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import RouteIcon from '@mui/icons-material/Route';
import MapIcon from '@mui/icons-material/Map';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import MapPinIcon from '@mui/icons-material/MapPin';
import { useQuery } from '@tanstack/react-query';
import { getApiMiscellaneous } from "@features/pricingnew/api/sdk.gen";
import { getApiMiscellaneousOptions } from "@features/pricingnew/api/@tanstack/react-query.gen";
import { getApiSeaFreightByIdOptions } from "@features/pricingnew/api/@tanstack/react-query.gen";
import type { MiscellaneousResponse } from "@features/pricingnew/api/types.gen";
import { getApiServiceOptions } from '@features/masterdata/api/@tanstack/react-query.gen';
import { getContactGetContactsOptions } from '@features/crm/api/@tanstack/react-query.gen';
import { getTEU } from '../../../utils/functions';
import Checkbox from '@mui/material/Checkbox';
import ContainersDisplay from '@features/request/components/ContainersDisplay';
import { getApiHaulageById } from "@features/pricingnew/api/sdk.gen";

interface Step6MiscellaneousSelectionProps {
  cityFrom: any;
  portFrom: any;
  onBack: () => void;
  onNext: () => void;
  // ✅ NOUVELLE STRUCTURE : Remplacer onMiscellaneousSelected par onStep6Update
  onStep6Update?: (step6Data: any) => void;
  selectedHaulage?: HaulageResponse;
  selectedSeafreight?: any;
  // ✅ NOUVELLE STRUCTURE : Utiliser draftQuote.step6 au lieu de selectedMiscellaneous
  draftQuote?: any;
  services: any[];
  contacts: any[];
  // Nouvelles props pour les données de la demande
  requestData?: any;
  // Props manquantes pour le BasketSummary
  selectedServices?: any[];
  selectedContainers?: any;
  // ✅ CONSERVER pour compatibilité temporaire
  selectedMiscellaneous?: any[];
  setSelectedMiscellaneous?: (misc: any[], miscTotal: number) => void;
}

const Step6MiscellaneousSelection: React.FC<Step6MiscellaneousSelectionProps> = ({
  selectedHaulage,
  selectedSeafreight,
  selectedMiscellaneous,
  services,
  contacts,
  onBack,
  onNext,
  onStep6Update,
  setSelectedMiscellaneous,
  requestData,
  selectedServices = [],
  selectedContainers = {},
  draftQuote
}) => {


  // ✅ NOUVELLE STRUCTURE : Initialiser avec step6.selections en priorité
  const [selected, setSelected] = useState<any[]>(() => {
    // Priorité 1: Utiliser draftQuote.step6.selections si disponible
    if (draftQuote?.step6?.selections && draftQuote.step6.selections.length > 0) {
  
      return draftQuote.step6.selections.map((step6Service: any) => ({
        id: step6Service.id,
        serviceProviderId: step6Service.service?.serviceId || 0,
        serviceName: step6Service.service?.serviceName || 'Unknown Service',
        serviceProviderName: step6Service.supplier?.supplierName || 'Unknown Supplier',
        category: step6Service.service?.category || 'Other',
        currency: step6Service.pricing?.currency || 'EUR',
        pricing: {
          basePrice: step6Service.pricing?.unitPrice || 0
        },
        quantity: step6Service.pricing?.quantity || 1,
        validity: {
          endDate: step6Service.validity?.validUntil
        },
        remarks: step6Service.remarks || '',
        _fromStep6: true
      }));
    }
    // Priorité 2: Fallback vers selectedMiscellaneous
    if (selectedMiscellaneous && selectedMiscellaneous.length > 0) {

      return selectedMiscellaneous;
    }
    // Priorité 3: Tableau vide
    
    return [];
  });
  const [search, setSearch] = useState("");
  const [isUpdating, setIsUpdating] = useState(false); // Flag pour éviter les appels multiples

    // ✅ NOUVELLE STRUCTURE : Synchronisation avec draftQuote.step6
  useEffect(() => {

    
    // ✅ PRIORITÉ 1: Utiliser draftQuote.step6.selections si disponible
    if (draftQuote?.step6?.selections && Array.isArray(draftQuote.step6.selections) && draftQuote.step6.selections.length > 0) {

      
      // ✅ NOUVELLE LOGIQUE : Créer directement les services depuis step6
      const step6Services = draftQuote.step6.selections.map((step6Service: any) => {

        
        // Créer un objet service complet à partir des données step6
        return {
          id: step6Service.id,
          serviceProviderId: step6Service.service?.serviceId || 0,
          serviceName: step6Service.service?.serviceName || 'Unknown Service',
          serviceProviderName: step6Service.supplier?.supplierName || 'Unknown Supplier',
          category: step6Service.service?.category || 'Other',
          currency: step6Service.pricing?.currency || 'EUR',
          pricing: {
            basePrice: step6Service.pricing?.unitPrice || 0
          },
          quantity: step6Service.pricing?.quantity || 1,
          validity: {
            endDate: step6Service.validity?.validUntil
          },
          remarks: step6Service.remarks || '',
          _fromStep6: true // Marquer comme provenant de step6
        };
      });
      

      
      setSelected(step6Services);
    }
    // ✅ PRIORITÉ 2: Fallback vers selectedMiscellaneous si step6 non disponible
    else if (selectedMiscellaneous && Array.isArray(selectedMiscellaneous) && selectedMiscellaneous.length > 0) {

      
      // Vérifier si les données des props sont différentes de l'état local
      const propsIds = selectedMiscellaneous.map(m => m.id || m.serviceId).filter(Boolean);
      const localIds = selected.map(s => s.id || s.serviceId).filter(Boolean);
      
      const isDifferent = propsIds.length !== localIds.length || 
        !propsIds.every(id => localIds.includes(id));
      
      if (isDifferent) {

        
        // Chercher les services correspondants dans miscellaneous disponibles
        const matchedServices: any[] = [];
        
        selectedMiscellaneous.forEach(savedService => {

          
          // Chercher le service correspondant dans la liste disponible
          const foundService = miscellaneousOffers?.find((availableService: any) => {
            return isServiceMatching(savedService, availableService);
          });
          
          if (foundService) {

            matchedServices.push(foundService);
          } else {

            
            // En dernier recours, créer un objet temporaire pour l'affichage
            matchedServices.push({
              id: savedService.id || `misc-${savedService.serviceId}`,
              serviceProviderId: savedService.serviceId,
              serviceName: savedService.serviceName,
              serviceProviderName: savedService.supplierName || savedService.serviceProviderName,
              currency: savedService.currency || 'EUR',
              pricing: {
                basePrice: savedService.price || 0
              },
              validity: {
                endDate: savedService.validUntil
              },
              _isTemporary: true // Marquer comme temporaire
            });
          }
        });
        

        
        setSelected(matchedServices);
      } else {

      }
    } else if ((!draftQuote?.step6?.selections || draftQuote.step6.selections.length === 0) && 
               (!selectedMiscellaneous || selectedMiscellaneous.length === 0) && 
               selected.length > 0 && !isUpdating) {

    }
  }, [draftQuote?.step6?.selections, selectedMiscellaneous]); // ✅ Retirer miscellaneousOffers pour éviter l'erreur de déclaration
  
  const { data: servicesData } = useQuery({ ...getApiServiceOptions() });
  const { data: contactsData } = useQuery({ ...getContactGetContactsOptions(), staleTime: Infinity });
  
  // ✅ Utilisation de la nouvelle API avec React Query
  const { data: miscellaneousOffers = [], isLoading: loading, error: apiError } = useQuery({
    ...getApiMiscellaneousOptions(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // ✅ EFFET SÉPARÉ : Synchronisation initiale uniquement (une seule fois)
  useEffect(() => {

    
    // Ne synchroniser que si c'est le premier chargement et qu'on a des données dans step6
    if (selected.length === 0 && draftQuote?.step6?.selections && draftQuote.step6.selections.length > 0) {

      // La logique de synchronisation est déjà dans l'effet précédent
    }
  }, []); // ✅ Exécution une seule fois au montage



  const filteredOffers = miscellaneousOffers.filter(misc =>
    (misc.serviceName || "").toLowerCase().includes(search.toLowerCase()) ||
    (misc.serviceProviderName || "").toLowerCase().includes(search.toLowerCase()) ||
    (misc.departurePortName || "").toLowerCase().includes(search.toLowerCase()) ||
    (misc.destinationPortName || "").toLowerCase().includes(search.toLowerCase()) ||
    (misc.applicableContainerTypes?.join(', ') || "").toLowerCase().includes(search.toLowerCase())
  );



  // Handler pour la sélection des services miscellaneous
  const handleSelect = (misc: any) => {
    // ✅ Éviter les appels multiples simultanés
    if (isUpdating) {
      return;
    }
    
    setIsUpdating(true);
    

    
    if (!misc) {
      setIsUpdating(false); // Réinitialiser en cas d'erreur
      return;
    }
    
    // Vérifier qu'il y a au moins un identifiant valide
    if (!misc.id && !misc.serviceId && !misc.serviceProviderId) {
      setIsUpdating(false); // Réinitialiser en cas d'erreur
      return;
    }
    
    // Utiliser la fonction de comparaison centralisée
    const isCurrentlySelected = selected.some(s => isServiceMatching(s, misc));
    
    let newSelected: any[];
    
    if (isCurrentlySelected) {
      // RETIRER le service - utiliser la négation de la même logique
      newSelected = selected.filter(s => !isServiceMatching(s, misc));
    } else {
      // AJOUTER le service
      newSelected = [...selected, misc];
    }
    
    // Mettre à jour l'état local immédiatement
    setSelected(newSelected);
    
    // Calcul du total
    const miscTotal = newSelected.reduce((sum, m) => sum + ((m.pricing?.basePrice || 0) * (m.quantity || 1)), 0);
    

    
    // ✅ NOUVELLE STRUCTURE : Notifier le parent via onStep6Update
    if (onStep6Update) {

      
      // ✅ Construire la structure step6 conforme à DraftQuote.ts
      const step6Data = {
        selections: newSelected.map(service => ({
          id: service.id || `misc-${service.serviceProviderId || service.serviceId}`,
          service: {
            serviceId: service.serviceProviderId || service.serviceId,
            serviceName: service.serviceName,
            category: service.category || 'Other'
          },
          supplier: {
            supplierName: service.serviceProviderName
          },
          pricing: {
            unitPrice: service.pricing?.basePrice || 0,
            quantity: service.quantity || 1,
            subtotal: (service.pricing?.basePrice || 0) * (service.quantity || 1),
            currency: service.currency || 'EUR'
          },
          validity: {
            validUntil: service.validity?.endDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
          },
          remarks: service.remarks || '',
          isSelected: true,
          selectedAt: new Date()
        })),
        summary: {
          totalSelections: newSelected.length,
          totalAmount: miscTotal,
          currency: 'EUR',
          categories: [...new Set(newSelected.map(s => s.category || 'Other'))]
        }
      };
      
      onStep6Update(step6Data);
    }
    // ✅ FALLBACK : Utiliser setSelectedMiscellaneous pour compatibilité
    else if (setSelectedMiscellaneous) {

      setSelectedMiscellaneous(newSelected, miscTotal);
    } else {
      console.warn('🔍 [DEBUG_STEP6] Aucun callback disponible pour notifier la sélection !');
    }
    

    
    // ✅ Réinitialiser le flag après traitement
    setTimeout(() => {
      setIsUpdating(false);
    }, 100);
  };

  const { t } = useTranslation();

  // === NOUVELLE APPROCHE : Récupération des données complètes via l'API ===
  // Récupérer les données complètes de tous les seafreights sélectionnés via l'API
  // ✅ CORRECTION : Utiliser draftQuote.step5.selections (peut contenir plusieurs seafreights)
  const selectedSeafreightsFromStep5 = draftQuote?.step5?.selections || [];
  
  // Pour l'instant, on récupère les données du premier seafreight
  // TODO: Implémenter la récupération de plusieurs seafreights si nécessaire
  const firstSeafreight = selectedSeafreightsFromStep5[0];
  const seafreightId = firstSeafreight?.id || firstSeafreight?.seafreightId || selectedSeafreight?.id || selectedSeafreight?.seaFreightId || '';
  
  const { data: fullSeafreightData, isLoading: isLoadingSeafreight, error: seafreightError } = useQuery({
    ...getApiSeaFreightByIdOptions({ 
      path: { 
        id: seafreightId
      } 
    }),
    enabled: !!seafreightId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000,   // 10 minutes
  });

  // Utiliser les données complètes de l'API ou fallback sur selectedSeafreightsFromStep5
  const seafreightsToDisplay = fullSeafreightData ? [fullSeafreightData] : selectedSeafreightsFromStep5;

  // ✅ DEBUG : Logs pour diagnostiquer le problème de chargement
  useEffect(() => {
    console.log('🔍 [STEP6] Debug Seafreight Loading:');
    console.log('  - draftQuote?.step5?.selections:', draftQuote?.step5?.selections);
    console.log('  - selectedSeafreightsFromStep5:', selectedSeafreightsFromStep5);
    console.log('  - firstSeafreight:', firstSeafreight);
    console.log('  - seafreightId:', seafreightId);
    console.log('  - fullSeafreightData:', fullSeafreightData);
    console.log('  - isLoadingSeafreight:', isLoadingSeafreight);
    console.log('  - seafreightError:', seafreightError);
    console.log('  - seafreightsToDisplay:', seafreightsToDisplay);
  }, [draftQuote?.step5?.selections, selectedSeafreightsFromStep5, firstSeafreight, seafreightId, fullSeafreightData, isLoadingSeafreight, seafreightError, seafreightsToDisplay]);





  // Fonction de comparaison réutilisable - VERSION STRICTE
  const isServiceMatching = (selectedItem: any, miscItem: any) => {

    
    // PRIORITÉ 1: Comparaison par UUID (id) - plus fiable
    if (selectedItem.id && miscItem.id) {
      const idsMatch = selectedItem.id === miscItem.id;
      if (idsMatch) {
        return true;
      }
    }
    
    // PRIORITÉ 2: Comparaison par serviceId numérique - utiliser serviceProviderId pour miscItem
    const selectedServiceId = selectedItem.serviceId;
    const miscServiceId = miscItem.serviceProviderId || miscItem.serviceId; // Utiliser serviceProviderId d'abord
    

    
    if (selectedServiceId && miscServiceId && 
        selectedServiceId !== 0 && miscServiceId !== 0 &&
        selectedServiceId === miscServiceId) {
      
      return true;
    }
    
    // PRIORITÉ 3: Comparaison par nom de service ET fournisseur - strict
    const nameMatch = selectedItem.serviceName && miscItem.serviceName &&
                      selectedItem.serviceName.trim() !== '' && miscItem.serviceName.trim() !== '' &&
                      selectedItem.serviceName === miscItem.serviceName;
    
    const providerMatch = selectedItem.serviceProviderName && miscItem.serviceProviderName &&
                          selectedItem.serviceProviderName.trim() !== '' && miscItem.serviceProviderName.trim() !== '' &&
                          selectedItem.serviceProviderName === miscItem.serviceProviderName;
    

    
    if (nameMatch && providerMatch) {

      return true;
    }
    
    // PRIORITÉ 4: Comparaison simple par ID si disponible (fallback)
    if (selectedItem.id && miscItem.id) {
      // Conversion en string pour comparaison plus souple
      const selectedIdStr = String(selectedItem.id);
      const miscIdStr = String(miscItem.id);
      if (selectedIdStr === miscIdStr) {

        return true;
      }
    }
    
    // PRIORITÉ 5: Comparaison par serviceId simple (fallback)
    if (selectedItem.serviceId && miscItem.serviceId) {
      const selectedServiceIdStr = String(selectedItem.serviceId);
      const miscServiceIdStr = String(miscItem.serviceId);
      if (selectedServiceIdStr === miscServiceIdStr) {

        return true;
      }
    }
    

    return false;
  };

  // Handler for removing miscellaneous
  const handleRemoveMisc = (id: string) => {

    
    if (typeof setSelectedMiscellaneous === 'function') {
      const filteredMisc = (selectedMiscellaneous || []).filter(m => m.id !== id);

      setSelectedMiscellaneous(filteredMisc, 0);
    }
  };

  const departurePortName = selectedHaulage?.loadingLocation?.displayName || selectedHaulage?.loadingLocation?.formattedAddress || '-';
  const destinationPortName = selectedHaulage?.deliveryLocation?.displayName || selectedHaulage?.deliveryLocation?.formattedAddress || '-';

  // === NOUVELLE APPROCHE : Récupération des données complètes du haulage via l'API ===
  // Récupérer les données complètes du haulage sélectionné via l'API
  const [fullHaulageData, setFullHaulageData] = useState<any>(null);
  const [isLoadingHaulage, setIsLoadingHaulage] = useState(false);
  const [haulageError, setHaulageError] = useState<string | null>(null);

  // Utiliser les données complètes de l'API ou fallback sur selectedHaulage
  const haulageToDisplay = fullHaulageData || selectedHaulage;

  // Fonction pour récupérer les données complètes du haulage
  const fetchFullHaulageData = async () => {
    const haulageId = selectedHaulage?.offerId || selectedHaulage?.haulierId;
    if (!haulageId) return;

    setIsLoadingHaulage(true);
    setHaulageError(null);

    try {
      const response = await getApiHaulageById({ path: { id: String(haulageId) } });

      setFullHaulageData(response.data);
    } catch (err: any) {

      setHaulageError(err.message || 'Erreur lors du chargement du haulage');
    } finally {
      setIsLoadingHaulage(false);
    }
  };

  // Effect pour déclencher l'appel API quand selectedHaulage change
  useEffect(() => {
    if (selectedHaulage?.offerId || selectedHaulage?.haulierId) {
      fetchFullHaulageData();
    }
  }, [selectedHaulage?.offerId, selectedHaulage?.haulierId]);



  return (
    <Box sx={{ p: 3, minHeight: '100vh', background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)' }}>
      {/* Titre du Step 6 - même style que Step 5 */}
      <Box sx={{ textAlign: 'center', mb: 4, py: 3, borderRadius: 3, background: 'linear-gradient(90deg, #1976d2 0%, #7b1fa2 100%)', color: '#fff', boxShadow: '0 2px 16px rgba(25,118,210,0.08)' }}>
        <Typography variant="h3" sx={{ fontWeight: 700, mb: 1, color: '#fff', textShadow: '2px 2px 4px rgba(0,0,0,0.08)' }}>
          {t('requestWizard.step6.title')}
        </Typography>
      </Box>
      
      {/* Section Request details */}
      {requestData && (
        <Slide direction="up" in timeout={1000}>
          <Accordion defaultExpanded={false} sx={{ mb: 4, borderRadius: 3, boxShadow: '0 10px 30px rgba(0,0,0,0.1)', background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)' }}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Avatar sx={{ 
                  bgcolor: 'primary.main', 
                  mr: 2,
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                }}>
                  <PersonIcon />
                </Avatar>
                <Typography variant="h5" sx={{ fontWeight: 600, color: '#2c3e50' }}>
                  {t('requestWizard.step3.demandDetailsTitle')}
                </Typography>
              </Box>
            </AccordionSummary>
          <AccordionDetails>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <PersonIcon sx={{ color: '#3498db', mr: 1 }} />
                    <Typography variant="subtitle1" sx={{ fontWeight: 500 }}>
                      <strong>{t('requestWizard.step3.client')}:</strong> {(() => {
                        // Accès correct via requestData.step1.customer
                        if (requestData?.step1?.customer?.contactName) return requestData.step1.customer.contactName;
                        if (requestData?.step1?.customer?.companyName) return requestData.step1.customer.companyName;
                        // Fallback sur les anciennes propriétés pour compatibilité
                        if (requestData?.customer?.contactName) return requestData.customer.contactName;
                        if (requestData?.customer?.name) return requestData.customer.name;
                        if (requestData?.customerName) return requestData.customerName;
                        if (requestData?.contactName) return requestData.contactName;
                        return '-';
                      })()}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <LocationOnIcon sx={{ color: '#e74c3c', mr: 1 }} />
                    <Typography variant="subtitle1" sx={{ fontWeight: 500 }}>
                      <strong>{t('requestWizard.step3.departure')}:</strong> {(() => {
                        // Accès correct via requestData.step1.cityFrom
                        if (requestData?.step1?.cityFrom?.name && requestData?.step1?.cityFrom?.country) {
                          return `${requestData.step1.cityFrom.name}, ${requestData.step1.cityFrom.country.toUpperCase()}`;
                        }
                        if (requestData?.step1?.cityFrom?.name) return requestData.step1.cityFrom.name;
                        // Fallback sur les anciennes propriétés pour compatibilité
                        if (requestData?.cityFrom?.name && requestData?.cityFrom?.country) {
                          return `${requestData.cityFrom.name}, ${requestData.cityFrom.country.toUpperCase()}`;
                        }
                        if (requestData?.cityFrom?.name) return requestData.cityFrom.name;
                        if (requestData?.pickupLocation?.city && requestData?.pickupLocation?.country) {
                          return `${requestData.pickupLocation.city}, ${requestData.pickupLocation.country.toUpperCase()}`;
                        }
                        if (requestData?.pickupLocation?.city) return requestData.pickupLocation.city;
                        if (requestData?.departureCity) return requestData.departureCity;
                        if (requestData?.fromCity) return requestData.fromCity;
                        return '-';
                      })()}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <LocationOnIcon sx={{ color: '#27ae60', mr: 1 }} />
                    <Typography variant="subtitle1" sx={{ fontWeight: 500 }}>
                      <strong>{t('requestWizard.step3.arrival')}:</strong> {(() => {
                        // Accès correct via requestData.step1.cityTo
                        if (requestData?.step1?.cityTo?.name && requestData?.step1?.cityTo?.country) {
                          return `${requestData.step1.cityTo.name}, ${requestData.step1.cityTo.country.toUpperCase()}`;
                        }
                        if (requestData?.step1?.cityTo?.name) return requestData.step1.cityTo.name;
                        // Fallback sur les anciennes propriétés pour compatibilité
                        if (requestData?.cityTo?.name && requestData?.cityTo?.country) {
                          return `${requestData.cityTo.name}, ${requestData.cityTo.country.toUpperCase()}`;
                        }
                        if (requestData?.cityTo?.name) return requestData.cityTo.name;
                        if (requestData?.deliveryLocation?.city && requestData?.deliveryLocation?.country) {
                          return `${requestData.deliveryLocation.city}, ${requestData.deliveryLocation.country.toUpperCase()}`;
                        }
                        if (requestData?.deliveryLocation?.city) return requestData.deliveryLocation.city;
                        if (requestData?.arrivalCity) return requestData.arrivalCity;
                        if (requestData?.toCity) return requestData.toCity;
                        return '-';
                      })()}
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <ReceiptIcon sx={{ color: '#f39c12', mr: 1 }} />
                    <Typography variant="subtitle1" sx={{ fontWeight: 500 }}>
                      <strong>{t('requestWizard.step3.incoterm')}:</strong> {(() => {
                        // Accès correct via requestData.step1.incotermName
                        if (requestData?.step1?.incotermName) return requestData.step1.incotermName;
                        if (requestData?.step1?.cargo?.incoterm) return requestData.step1.cargo.incoterm;
                        // Fallback sur les anciennes propriétés pour compatibilité
                        if (requestData?.incotermName) return requestData.incotermName;
                        if (requestData?.incoterm) return requestData.incoterm;
                        if (requestData?.incoterms) return requestData.incoterms;
                        return '-';
                      })()}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <LocalShippingIcon sx={{ color: '#9b59b6', mr: 1 }} />
                    <Typography variant="subtitle1" sx={{ fontWeight: 500 }}>
                      <strong>{t('requestWizard.step3.product')}:</strong> {(() => {
                        // Accès correct via requestData.step1.productName
                        if (requestData?.step1?.productName?.productName) return requestData.step1.productName.productName;
                        if (requestData?.step1?.cargo?.product?.productName) return requestData.step1.cargo.product.productName;
                        // Fallback sur les anciennes propriétés pour compatibilité
                        if (requestData?.productName && typeof requestData.productName === 'object' && requestData.productName.productName) {
                          return requestData.productName.productName;
                        }
                        if (typeof requestData?.productName === 'string' && requestData.productName) {
                          return requestData.productName;
                        }
                        if (requestData?.productId && Array.isArray(services)) {
                          const found = services.find(p => p.productId === requestData.productId);
                          if (found && found.productName) return found.productName;
                        }
                        if (requestData?.product) return requestData.product;
                        return '-';
                      })()}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <InfoIcon sx={{ color: '#34495e', mr: 1 }} />
                    <Typography variant="subtitle1" sx={{ fontWeight: 500 }}>
                      <strong>{t('requestWizard.step3.comment')}:</strong> {(() => {
                        // Accès correct via requestData.step1.comment
                        if (requestData?.step1?.comment) return requestData.step1.comment;
                        if (requestData?.step1?.metadata?.comment) return requestData.step1.metadata.comment;
                        // Fallback sur les anciennes propriétés pour compatibilité
                        if (requestData?.comment) return requestData.comment;
                        if (requestData?.description) return requestData.description;
                        if (requestData?.notes) return requestData.notes;
                        return '-';
                      })()}
                    </Typography>
                  </Box>
                </Grid>
              </Grid>

              {/* Section Containers - Affichage des containers sélectionnés du Step 3 */}
              
              {/* Affichage conditionnel des containers */}
              {(() => {
                // Utiliser la même logique de priorité que le calcul TEU
                let containersToDisplay = [];
                
                if (selectedContainers?.list && Array.isArray(selectedContainers.list)) {
                  containersToDisplay = selectedContainers.list;
                } else if (requestData?.step3?.containers && Array.isArray(requestData.step3.containers)) {
                  containersToDisplay = requestData.step3.containers;
                } else if (requestData?.step1?.containers && Array.isArray(requestData.step1.containers)) {
                  containersToDisplay = requestData.step1.containers;
                }
                
                if (containersToDisplay.length > 0) {
                  return (
                    <Box sx={{ mt: 4, mb: 2 }}>
                      <ContainersDisplay 
                        containers={containersToDisplay}
                        title="Containers sélectionnés"
                        showTitle={true}
                        compact={false}
                      />
                    </Box>
                  );
                } else {
                  return (
                    <Box sx={{ mt: 4, mb: 2, p: 2, background: '#fff3cd', borderRadius: 2, border: '1px solid #ffc107' }}>
                      <Typography variant="body2" sx={{ color: '#856404', textAlign: 'center' }}>
                        ⚠️ Aucun container sélectionné ou données manquantes
                      </Typography>
                    </Box>
                  );
                }
              })()}

          </AccordionDetails>
        </Accordion>
        </Slide>
      )}

      {/* Section Seafreight sélectionnés (Step 5) */}
      {draftQuote?.step5?.selections && draftQuote.step5.selections.length > 0 && (
        <Slide direction="up" in timeout={1000}>
          <Accordion defaultExpanded={false} sx={{ mb: 4, borderRadius: 3, boxShadow: '0 10px 30px rgba(0,0,0,0.1)', background: 'linear-gradient(135deg, #e3f2fd 0%, #f5f7fa 100%)' }}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Avatar sx={{ 
                  bgcolor: 'primary.main', 
                  mr: 2,
                  background: 'linear-gradient(135deg, #1976d2 0%, #7b1fa2 100%)'
                }}>
                  <DirectionsBoatIcon />
                </Avatar>
                <Typography variant="h5" sx={{ fontWeight: 600, color: '#2c3e50' }}>
                  Selected seafreights
                </Typography>
              </Box>
            </AccordionSummary>
            <AccordionDetails>
              <Grid container spacing={3}>
                {draftQuote.step5.selections.map((seafreight: any, index: number) => (
                  <Grid item xs={12} md={6} key={seafreight.id || seafreight.seafreightId || index}>
                    <Card sx={{ 
                      borderRadius: 2, 
                      boxShadow: '0 4px 12px rgba(0,0,0,0.1)', 
                      background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
                      border: '1px solid #e3f2fd'
                    }}>
                      <CardContent>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                          <DirectionsBoatIcon sx={{ color: '#1976d2', mr: 1 }} />
                          <Typography variant="h6" sx={{ fontWeight: 600, color: '#1976d2' }}>
                            Seafreight #{index + 1}
                          </Typography>
                        </Box>
                        
                        <Grid container spacing={2}>
                          <Grid item xs={12}>
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                              <BusinessIcon sx={{ color: '#2980b9', mr: 1, fontSize: '1.2em' }} />
                              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                <strong>Transporteur:</strong> {seafreight.carrier?.name || '-'}
                              </Typography>
                            </Box>
                          </Grid>
                          
                          <Grid item xs={12}>
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                              <LocationOnIcon sx={{ color: '#e74c3c', mr: 1, fontSize: '1.2em' }} />
                              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                <strong>Port départ:</strong> {seafreight.route?.departurePort?.portName || '-'}
                              </Typography>
                            </Box>
                          </Grid>
                          
                          <Grid item xs={12}>
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                              <LocationOnIcon sx={{ color: '#27ae60', mr: 1, fontSize: '1.2em' }} />
                              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                <strong>Port arrivée:</strong> {seafreight.route?.destinationPort?.portName || '-'}
                              </Typography>
                            </Box>
                          </Grid>
                          
                          <Grid item xs={12}>
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                              <AssignmentIcon sx={{ color: '#9b59b6', mr: 1, fontSize: '1.2em' }} />
                              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                <strong>Type conteneur:</strong> {seafreight.container?.containerType || '-'}
                              </Typography>
                            </Box>
                          </Grid>
                          
                          <Grid item xs={12}>
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                              <EuroIcon sx={{ color: '#f39c12', mr: 1, fontSize: '1.2em' }} />
                              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                <strong>Prix unitaire:</strong> {seafreight.container?.unitPrice ? 
                                  `${seafreight.container.unitPrice.toLocaleString(undefined, { maximumFractionDigits: 2 })} EUR` : 
                                  '-'
                                }
                              </Typography>
                            </Box>
                          </Grid>
                          
                          <Grid item xs={12}>
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                              <AssignmentIcon sx={{ color: '#16a085', mr: 1, fontSize: '1.2em' }} />
                              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                <strong>Quantité:</strong> {seafreight.container?.quantity || '-'}
                              </Typography>
                            </Box>
                          </Grid>
                          
                          <Grid item xs={12}>
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                              <EuroIcon sx={{ color: '#27ae60', mr: 1, fontSize: '1.2em' }} />
                              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                <strong>Sous-total:</strong> {seafreight.container?.subtotal ? 
                                  `${seafreight.container.subtotal.toLocaleString(undefined, { maximumFractionDigits: 2 })} EUR` : 
                                  '-'
                                }
                              </Typography>
                            </Box>
                          </Grid>
                          
                          <Grid item xs={12}>
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                              <AccessTimeIcon sx={{ color: '#16a085', mr: 1, fontSize: '1.2em' }} />
                              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                <strong>Temps de transit:</strong> {seafreight.route?.transitDays || '-'} {seafreight.route?.transitDays ? 'jours' : ''}
                              </Typography>
                            </Box>
                          </Grid>
                          
                          <Grid item xs={12}>
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                              <RepeatIcon sx={{ color: '#8e44ad', mr: 1, fontSize: '1.2em' }} />
                              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                <strong>Fréquence:</strong> {seafreight.route?.frequency || '-'}
                              </Typography>
                            </Box>
                          </Grid>
                        </Grid>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
              
              {/* Résumé global */}
              <Box sx={{ mt: 3, p: 2, background: 'linear-gradient(135deg, #e8f5e8 0%, #c8e6c9 100%)', borderRadius: 2, border: '1px solid #4caf50' }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 600, color: '#2e7d32', mb: 1 }}>
                  📊 Résumé global des seafreights
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6} md={3}>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      <strong>Nombre total:</strong> {draftQuote.step5.selections.length} seafreight(s)
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      <strong>Transporteurs:</strong> {[...new Set(draftQuote.step5.selections.map((s: any) => s.carrier?.name).filter(Boolean))].join(', ') || '-'}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      <strong>Types conteneurs:</strong> {[...new Set(draftQuote.step5.selections.map((s: any) => s.container?.containerType).filter(Boolean))].join(', ') || '-'}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      <strong>Total prix:</strong> {draftQuote.step5.selections.reduce((sum: number, s: any) => {
                        const total = s.container?.subtotal || 0;
                        return sum + total;
                      }, 0).toLocaleString(undefined, { maximumFractionDigits: 2 })} EUR
                    </Typography>
                  </Grid>
                </Grid>
              </Box>
            </AccordionDetails>
          </Accordion>
        </Slide>
      )}

      {/* Section Haulage sélectionné (Step 4) */}
      {draftQuote?.step4?.selection && (
        <Slide direction="up" in timeout={1000}>
          <Accordion defaultExpanded={false} sx={{ mb: 4, borderRadius: 3, boxShadow: '0 10px 30px rgba(0,0,0,0.1)', background: 'linear-gradient(135deg, #e8f5e8 0%, #f5f7fa 100%)' }}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Avatar sx={{ 
                  bgcolor: 'primary.main', 
                  mr: 2,
                  background: 'linear-gradient(135deg, #27ae60 0%, #2ecc71 100%)'
                }}>
                  <LocalShippingIcon />
                </Avatar>
                <Typography variant="h5" sx={{ fontWeight: 600, color: '#2c3e50' }}>
                  Selected Haulage
                </Typography>
              </Box>
            </AccordionSummary>
            <AccordionDetails>
              <Card sx={{ 
                borderRadius: 2, 
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)', 
                background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
                border: '1px solid #e8f5e8'
              }}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <LocalShippingIcon sx={{ color: '#27ae60', mr: 1 }} />
                    <Typography variant="h6" sx={{ fontWeight: 600, color: '#27ae60' }}>
                      Haulage sélectionné
                    </Typography>
                  </Box>
                  
                  <Grid container spacing={2}>
                    <Grid item xs={12}>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <BusinessIcon sx={{ color: '#2980b9', mr: 1, fontSize: '1.2em' }} />
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          <strong>Transporteur:</strong> {draftQuote.step4.selection.haulierName || '-'}
                        </Typography>
                      </Box>
                    </Grid>
                    
                    <Grid item xs={12}>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <LocationOnIcon sx={{ color: '#e74c3c', mr: 1, fontSize: '1.2em' }} />
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          <strong>Pickup:</strong> {draftQuote.step4.selection.route?.pickup?.city || '-'}, {draftQuote.step4.selection.route?.pickup?.country || '-'}
                        </Typography>
                      </Box>
                    </Grid>
                    
                    <Grid item xs={12}>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <LocationOnIcon sx={{ color: '#27ae60', mr: 1, fontSize: '1.2em' }} />
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          <strong>Delivery:</strong> {draftQuote.step4.selection.route?.delivery?.portName || '-'}, {draftQuote.step4.selection.route?.delivery?.country || '-'}
                        </Typography>
                      </Box>
                    </Grid>
                    
                    <Grid item xs={12}>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <EuroIcon sx={{ color: '#f39c12', mr: 1, fontSize: '1.2em' }} />
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          <strong>Tarif unitaire:</strong> {draftQuote.step4.selection.tariff?.unitPrice ? 
                            `${draftQuote.step4.selection.tariff.unitPrice.toLocaleString(undefined, { maximumFractionDigits: 2 })} ${draftQuote.step4.selection.tariff.currency || 'EUR'}` : 
                            '-'
                          }
                        </Typography>
                      </Box>
                    </Grid>
                    
                    <Grid item xs={12}>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <AccessTimeIcon sx={{ color: '#16a085', mr: 1, fontSize: '1.2em' }} />
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          <strong>Free time:</strong> {draftQuote.step4.selection.tariff?.freeTime || '-'}h
                        </Typography>
                      </Box>
                    </Grid>
                    
                    <Grid item xs={12}>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <CalendarMonthIcon sx={{ color: '#e67e22', mr: 1, fontSize: '1.2em' }} />
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          <strong>Valide jusqu'au:</strong> {draftQuote.step4.selection.validity?.validUntil ? 
                            dayjs(draftQuote.step4.selection.validity.validUntil).format('DD/MM/YYYY') : 
                            '-'
                          }
                        </Typography>
                      </Box>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </AccordionDetails>
          </Accordion>
        </Slide>
      )}
      
      {/* Récapitulatif du haulage sélectionné */}
      {haulageToDisplay && (
        <>
          {/* Indicateur de chargement pour l'API call */}
          {isLoadingHaulage && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
              <CircularProgress size={24} />
              <Typography variant="body2" sx={{ ml: 1, color: '#666' }}>
                Chargement des détails du haulage...
              </Typography>
            </Box>
          )}

          {/* Affichage des erreurs d'API */}
          {haulageError && (
            <Alert severity="warning" sx={{ mb: 2 }}>
              <Typography variant="body2">
                Impossible de charger les détails complets du haulage. Affichage des données de base.
              </Typography>
            </Alert>
          )}
          
          <Accordion defaultExpanded={false} sx={{ mb: 3, borderRadius: 3, boxShadow: '0 4px 24px rgba(0,0,0,0.07)', background: '#f5f7fa' }}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <LocalShippingIcon sx={{ color: '#1976d2', mr: 1 }} />
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 600, color: '#1976d2' }}>
                  {t('requestWizard.step5.selectedHaulage')}:
                </Typography>
                <Typography variant="body2" sx={{ color: '#666', fontStyle: 'italic' }}>
                  {haulageToDisplay.haulierName || '-'} 
                  {(() => {
                    const pickup = haulageToDisplay.pickupLocation;
                    const loadingCity = pickup?.displayName || pickup?.formattedAddress;
                    return loadingCity ? ` • ${loadingCity}` : '';
                  })()}
                </Typography>
              </Box>
            </Box>
          </AccordionSummary>
          <AccordionDetails>
            <Box sx={{ mt: 2, p: 3, background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)', borderRadius: 2, border: '1px solid #dee2e6' }}>
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6} md={4}>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                    <Typography variant="caption" sx={{ color: '#6c757d', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                      Haulier
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <LocalShippingIcon sx={{ color: '#2980b9', mr: 1, fontSize: '1.2em' }} />
                      <Typography variant="body1" sx={{ fontWeight: 500, color: '#212529' }}>
                        {haulageToDisplay.haulierName || '-'}
                      </Typography>
                    </Box>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                    <Typography variant="caption" sx={{ color: '#6c757d', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                      Tariff
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <EuroIcon sx={{ color: '#f39c12', mr: 1, fontSize: '1.2em' }} />
                      <Typography variant="body1" sx={{ fontWeight: 500, color: '#212529' }}>
                        {(() => {
                          const tariff = haulageToDisplay.unitTariff;
                          const currency = haulageToDisplay.currency || 'EUR';
                          return tariff ? `${tariff} ${currency}` : '-';
                        })()}
                      </Typography>
                    </Box>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                    <Typography variant="caption" sx={{ color: '#6c757d', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                      Free time
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <AccessTimeIcon sx={{ color: '#16a085', mr: 1, fontSize: '1.2em' }} />
                      <Typography variant="body1" sx={{ fontWeight: 500, color: '#212529' }}>
                        {haulageToDisplay.freeTime ? `${haulageToDisplay.freeTime}h` : '-'}
                      </Typography>
                    </Box>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <Typography variant="caption" sx={{ color: '#6c757d', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                      Pickup Location
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <MapIcon sx={{ color: '#e74c3c', mr: 1, fontSize: '1.2em' }} />
                      <Typography variant="body1" sx={{ fontWeight: 500, color: '#212529' }}>
                        {(() => {
                          const pickup = haulageToDisplay.pickupLocation;
                          if (pickup?.displayName) return pickup.displayName;
                          if (pickup?.formattedAddress) return pickup.formattedAddress;
                          return '-';
                        })()}
                      </Typography>
                    </Box>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <Typography variant="caption" sx={{ color: '#6c757d', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                      Loading Location
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <MapIcon sx={{ color: '#3498db', mr: 1, fontSize: '1.2em' }} />
                      <Typography variant="body1" sx={{ fontWeight: 500, color: '#212529' }}>
                        {(() => {
                          const loading = haulageToDisplay.loadingLocation;
                          if (loading?.displayName) return loading.displayName;
                          if (loading?.formattedAddress) return loading.formattedAddress;
                          return '-';
                        })()}
                      </Typography>
                    </Box>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <Typography variant="caption" sx={{ color: '#6c757d', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                      Delivery Location
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <MapIcon sx={{ color: '#27ae60', mr: 1, fontSize: '1.2em' }} />
                      <Typography variant="body1" sx={{ fontWeight: 500, color: '#212529' }}>
                        {(() => {
                          const delivery = haulageToDisplay.deliveryLocation;
                          if (delivery?.displayName) return delivery.displayName;
                          if (delivery?.formattedAddress) return delivery.formattedAddress;
                          return '-';
                        })()}
                      </Typography>
                    </Box>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <Typography variant="caption" sx={{ color: '#6c757d', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                      Distance
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <StraightenIcon sx={{ color: '#9b59b6', mr: 1, fontSize: '1.2em' }} />
                      <Typography variant="body1" sx={{ fontWeight: 500, color: '#212529' }}>
                        {haulageToDisplay.distanceKm ? `${haulageToDisplay.distanceKm} km` : '-'}
                      </Typography>
                    </Box>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <Typography variant="caption" sx={{ color: '#6c757d', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                      Valid Until
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <ScheduleIcon sx={{ color: '#e67e22', mr: 1, fontSize: '1.2em' }} />
                      <Typography variant="body1" sx={{ fontWeight: 500, color: '#212529' }}>
                        {haulageToDisplay.validUntil ? (dayjs(haulageToDisplay.validUntil).isValid() ? dayjs(haulageToDisplay.validUntil).format('DD/MM/YYYY') : '-') : '-'}
                      </Typography>
                    </Box>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <Typography variant="caption" sx={{ color: '#6c757d', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                      Multi-stop
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <RouteIcon sx={{ color: '#8e44ad', mr: 1, fontSize: '1.2em' }} />
                      <Typography variant="body1" sx={{ fontWeight: 500, color: '#212529' }}>
                        {haulageToDisplay.multiStop ? `${haulageToDisplay.multiStop} stops` : '-'}
                      </Typography>
                    </Box>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <Typography variant="caption" sx={{ color: '#6c757d', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                      Overtime Tariff
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <AttachMoneyIcon sx={{ color: '#e74c3c', mr: 1, fontSize: '1.2em' }} />
                      <Typography variant="body1" sx={{ fontWeight: 500, color: '#212529' }}>
                        {haulageToDisplay.overtimeTariff ? `${haulageToDisplay.overtimeTariff} ${haulageToDisplay.currency || ''}` : '-'}
                      </Typography>
                    </Box>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <Typography variant="caption" sx={{ color: '#6c757d', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                      Currency
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <LanguageIcon sx={{ color: '#27ae60', mr: 1, fontSize: '1.2em' }} />
                      <Typography variant="body1" sx={{ fontWeight: 500, color: '#212529' }}>
                        {haulageToDisplay.currency || '-'}
                      </Typography>
                    </Box>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <Typography variant="caption" sx={{ color: '#6c757d', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                      Offer ID
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <FingerprintIcon sx={{ color: '#16a085', mr: 1, fontSize: '1.2em' }} />
                      <Typography variant="body1" sx={{ fontWeight: 500, color: '#212529' }}>
                        {haulageToDisplay.offerId || haulageToDisplay.haulierId || '-'}
                      </Typography>
                    </Box>
                  </Box>
                </Grid>
              </Grid>
            </Box>
                    </AccordionDetails>
        </Accordion>
        </>
      )}
      
      {loading && <CircularProgress sx={{ my: 4 }} />}
      {apiError && <Alert severity="error">Erreur lors de la récupération des offres miscellaneous.</Alert>}
      {!loading && !apiError && miscellaneousOffers.length > 0 && (
        <Box>
          <Box sx={{ mb: 2 }}>
            <TextField
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder={t('requestWizard.step6.searchPlaceholder')}
              fullWidth
              size="small"
              sx={{ mb: 2, maxWidth: 400 }}
            />
          </Box>

          <TableContainer component={Paper} sx={{ borderRadius: 3, boxShadow: 3, mb: 2 }}>
            <Table>
              <TableHead>
                <TableRow sx={{ background: "#f5f7fa" }}>
                  <TableCell />
                  <TableCell>{t('requestWizard.step6.service')}</TableCell>
                  <TableCell>{t('requestWizard.step6.supplier')}</TableCell>
                  <TableCell>{t('requestWizard.step6.departurePort')}</TableCell>
                  <TableCell>{t('requestWizard.step6.destinationPort')}</TableCell>
                  <TableCell>{t('requestWizard.step6.container')}</TableCell>
                  <TableCell>{t('requestWizard.step6.unitPrice')}</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredOffers.map((misc, idx) => {
                  // Utiliser la fonction de comparaison centralisée
                  const isSelected = selected.some(s => isServiceMatching(s, misc));
                  

                  
                  return (
                    <TableRow
                      key={misc.id || idx}
                      hover
                      selected={isSelected}
                      onClick={() => handleSelect(misc)}
                      sx={{
                        cursor: "pointer",
                        background: isSelected ? "#e3f2fd" : "white",
                        transition: "background 0.2s"
                      }}
                    >
                       <TableCell>
                         <Checkbox
                           checked={isSelected}
                           onChange={(e) => {
                             e.stopPropagation(); // Empêcher la propagation vers TableRow
                             handleSelect(misc);
                           }}
                         />
                       </TableCell>
                      <TableCell>
                        {misc.serviceName || `${t('requestWizard.step6.service')} ${misc.id}`}
                      </TableCell>
                      <TableCell>
                        {misc.serviceProviderName || `${t('requestWizard.step6.supplier')} ${misc.serviceProviderId}`}
                      </TableCell>
                      <TableCell>{misc.departurePortName || '-'}</TableCell>
                      <TableCell>{misc.destinationPortName || '-'}</TableCell>
                      <TableCell>{misc.applicableContainerTypes?.join(', ') || '-'}</TableCell>
                      <TableCell>
                        <span style={{ fontWeight: 600, color: '#388e3c' }}>
                          {misc.pricing?.basePrice || '-'} {misc.currency}
                        </span>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      )}
      {!loading && !apiError && miscellaneousOffers.length === 0 && (
        <Box sx={{ textAlign: 'center', p: 4, border: '2px dashed #ccc', borderRadius: 2 }}>
          <Typography variant="h6" color="text.secondary" gutterBottom>
            {t('requestWizard.step6.noServices')}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Aucun service divers disponible depuis l'API
          </Typography>
        </Box>
      )}
      
      {!loading && !apiError && miscellaneousOffers.length > 0 && filteredOffers.length === 0 && (
        <Box sx={{ textAlign: 'center', p: 4, border: '2px dashed #orange', borderRadius: 2 }}>
          <Typography variant="h6" color="warning.main" gutterBottom>
            Aucun service ne correspond à votre recherche
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {miscellaneousOffers.length} services disponibles, 0 après filtrage
          </Typography>
        </Box>
      )}

      {/* Panier avec OfferBasketDrawerAccordion */}
      <OfferBasketDrawerAccordion
        selectedHaulage={selectedHaulage}
        selectedSeafreight={selectedSeafreight}
        selectedMiscellaneous={selected}
        services={services}
        contacts={contacts}
        onRemoveMisc={handleRemoveMisc}
        currentStep={6}
        requestData={requestData}
        selectedServices={selectedServices}
        selectedContainers={selectedContainers}
      >
        <Box sx={{ mt: 4 }} />
      </OfferBasketDrawerAccordion>


    </Box>
  );
};

export default Step6MiscellaneousSelection; 