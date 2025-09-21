import React, { useEffect, useState, useMemo } from "react";
import { Box, Typography, Button, CircularProgress, Alert, TextField, Grid, Autocomplete, Card, CardContent, Pagination, Accordion, AccordionSummary, AccordionDetails, ButtonGroup, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Avatar, Slide, Modal, IconButton } from "@mui/material";

/**
 * IMPORTANT: Ce composant utilise UNIQUEMENT selectedHaulage.offerId pour la sélection
 * et la persistance des données. L'haulierId n'est plus utilisé pour éviter
 * les conflits d'identification.
 * 
 * Structure attendue: selectedHaulage.offerId (ID unique de l'API Haulage)
 */
import type { HaulageResponse } from "@features/pricingnew/api/types.gen";
import dayjs, { Dayjs } from 'dayjs';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import OfferBasketDrawerAccordion from './OfferBasketDrawerAccordion';
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { useTranslation } from 'react-i18next';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import EuroIcon from '@mui/icons-material/Euro';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import RouteIcon from '@mui/icons-material/Route';
import SpeedIcon from '@mui/icons-material/Speed';
import StraightenIcon from '@mui/icons-material/Straighten';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import BusinessIcon from '@mui/icons-material/Business';
import AssignmentIcon from '@mui/icons-material/Assignment';
import DirectionsBoatIcon from '@mui/icons-material/DirectionsBoat';
import VisibilityIcon from '@mui/icons-material/Visibility';
import CloseIcon from '@mui/icons-material/Close';
import RepeatIcon from '@mui/icons-material/Repeat';
import Tooltip from '@mui/material/Tooltip';
import { getApiHaulage } from '@features/pricingnew/api';
import ContainersDisplay from '@features/request/components/ContainersDisplay';

import type { DraftQuote } from '../types/DraftQuote';

interface Step4HaulierSelectionProps {
  onBack: () => void;
  onNext: () => void;
  // ✅ NOUVELLE PROP : draftQuote pour accéder à step4
  draftQuote: DraftQuote;
  // Props pour la compatibilité avec OfferBasketDrawerAccordion
  selectedSeafreight?: any;
  selectedMiscellaneous?: any[];
  services?: any[];
  contacts?: any[];
  onRemoveMisc?: (miscId: string) => void;
  requestData?: any;
  selectedServices?: any[];
  selectedContainers?: any;
  // ✅ NOUVEAU CALLBACK : Pour mettre à jour step4 depuis RequestWizard
  onStep4Update?: (step4Data: any) => void;
}

const PAGE_SIZE = 10;

// Fonction utilitaire pour extraire code postal, ville, pays
function extractCityInfo(displayName?: string) {
  if (!displayName) return "-";
  const parts = displayName.split(",");
  if (parts.length < 2) return displayName;
  // parts[1] = " 1301 Wavre", parts[2] = " Belgium"
  return `${parts[1].trim()}${parts[2] ? ', ' + parts[2].trim() : ''}`;
}

const Step4HaulierSelection: React.FC<Step4HaulierSelectionProps> = ({
  onBack,
  onNext,
  draftQuote,
  selectedSeafreight,
  selectedMiscellaneous,
  services,
  contacts,
  onRemoveMisc,
  requestData,
  selectedServices,
  selectedContainers,
  onStep4Update
}) => {
  const [loading, setLoading] = useState(false);
  const [haulageOffers, setHaulageOffers] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [requestSent, setRequestSent] = useState(false);
  // États pour le modal de détails
  const [selectedHaulageForDetails, setSelectedHaulageForDetails] = useState<HaulageResponse | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);

  // ✅ NOUVELLE LOGIQUE : Synchronisation avec step4 depuis draftQuote
  useEffect(() => {
    console.log('🔧 [STEP4] useEffect de synchronisation déclenché:', {
      draftQuoteStep4: draftQuote?.step4,
      selection: draftQuote?.step4?.selection,
      offerId: draftQuote?.step4?.selection?.offerId,
      haulageOffersLength: haulageOffers.length
    });

    // ✅ VÉRIFIER SI step4 CONTIENT DES DONNÉES VALIDES
    if (draftQuote?.step4?.selection?.offerId && haulageOffers.length > 0) {
      const matchingOffer = haulageOffers.find(offer => offer.offerId === draftQuote.step4.selection.offerId);
      
      if (!matchingOffer) {
        console.warn('⚠️ [STEP4] Offre non trouvée pour offerId:', draftQuote.step4.selection.offerId);
      } else {
        console.log('✅ [STEP4] Offre trouvée:', matchingOffer);
      }
    }
  }, [draftQuote?.step4?.selection?.offerId, haulageOffers]);

  // ✅ FORCER L'AFFICHAGE DE LA SÉLECTION CHARGÉE DEPUIS LA BASE
  useEffect(() => {
    const selectedId = draftQuote?.step4?.selection?.offerId;
    if (selectedId && haulageOffers.length > 0) {
      const matchingOffer = haulageOffers.find(offer => offer.offerId === selectedId);
      if (!matchingOffer) {
        // Silently handle missing offer
      }
    }
  }, [draftQuote?.step4?.selection?.offerId, haulageOffers]);

  // Filtres
  const [filterCity, setFilterCity] = useState<string | null>(null); // null = pas de filtre
  const [filterPort, setFilterPort] = useState<string | null>(null);
  const [filterHaulier, setFilterHaulier] = useState<string | null>(null);
  const [filterValidUntil, setFilterValidUntil] = useState<Dayjs | null>(null);
  const [filterDistance, setFilterDistance] = useState<string | null>(null);
  const [filterDistanceMin, setFilterDistanceMin] = useState<number | null>(null);
  const [filterDistanceMax, setFilterDistanceMax] = useState<number | null>(null);

  // Pagination
  const [page, setPage] = useState(1);

  const { t } = useTranslation();

  // Options de distance prédéfinies
  const distanceOptions = [
    { label: '0 - 50 km', min: 0, max: 50 },
    { label: '50 - 100 km', min: 50, max: 100 },
    { label: '100 - 200 km', min: 100, max: 200 },
    { label: '200 - 500 km', min: 200, max: 500 },
    { label: '500+ km', min: 500, max: Infinity }
  ];

  // Logique pour afficher les données de la demande depuis draftQuote.step1
  const getCustomerLabel = () => {
    if (draftQuote?.step1?.customer?.contactName) return draftQuote.step1.customer.contactName;
    if (draftQuote?.step1?.cityFrom?.name) return draftQuote.step1.cityFrom.name;
    return '-';
  };

  const getDepartureLabel = () => {
    if (draftQuote?.step1?.cityFrom?.name && draftQuote?.step1?.cityFrom?.country) {
      return `${draftQuote.step1.cityFrom.name}, ${draftQuote.step1.cityFrom.country.toUpperCase()}`;
    }
    if (draftQuote?.step1?.cityFrom?.name) return draftQuote.step1.cityFrom.name;
    if (draftQuote?.step1?.portFrom?.portName) return draftQuote.step1.portFrom.portName;
    return '-';
  };

  const getArrivalLabel = () => {
    if (draftQuote?.step1?.cityTo?.name && draftQuote?.step1?.cityTo?.country) {
      return `${draftQuote.step1.cityTo.name}, ${draftQuote.step1.cityTo.country.toUpperCase()}`;
    }
    if (draftQuote?.step1?.cityTo?.name) return draftQuote.step1.cityTo.name;
    if (draftQuote?.step1?.portTo?.portName) return draftQuote.step1.portTo.portName;
    return '-';
  };

  const getProductLabel = () => {
    if (draftQuote?.step1?.productName && typeof draftQuote.step1.productName === 'object' && draftQuote.step1.productName.productName) {
      return draftQuote.step1.productName.productName;
    }
    if (typeof draftQuote?.step1?.productName === 'string' && draftQuote.step1.productName) {
      return draftQuote.step1.productName;
    }
    return '-';
  };

  const getIncotermLabel = () => {
    if (draftQuote?.step1?.incotermName) return draftQuote.step1.incotermName;
    if (draftQuote?.step1?.cargo?.incoterm) return draftQuote.step1.cargo.incoterm;
    return '-';
  };

  const getCommentLabel = () => {
    if (draftQuote?.step1?.comment) return draftQuote.step1.comment;
    if (draftQuote?.step1?.metadata?.comment) return draftQuote.step1.metadata.comment;
    return '-';
  };

  const customerLabel = getCustomerLabel();
  const departureLabel = getDepartureLabel();
  const arrivalLabel = getArrivalLabel();
  const productLabel = getProductLabel();
  const incotermLabel = getIncotermLabel();
  const commentLabel = getCommentLabel();

  useEffect(() => {
    const fetchHaulages = async () => {
      setLoading(true);
      setError(null);
      setHaulageOffers([]);
      try {
        const res = await getApiHaulage();
        const data = Array.isArray(res?.data) ? res.data : [];
        
        const offers = [...data];
        offers.sort((a, b) => ((a as any).unitTariff ?? Infinity) - ((b as any).unitTariff ?? Infinity));
        setHaulageOffers(offers);
        
      } catch (e) {
        setError('Erreur lors de la récupération des prix haulage.');
      }
      setLoading(false);
    };
    fetchHaulages();
  }, []);

  // Valeurs uniques pour les filtres
  const cityOptions = useMemo(() => Array.from(new Set(haulageOffers.map(h => h.loadingLocation?.displayName).filter(Boolean))), [haulageOffers]);
  const portOptions = useMemo(() => Array.from(new Set(haulageOffers.map(h => h.pickupLocation?.displayName).filter(Boolean))), [haulageOffers]);
  const haulierOptions = useMemo(() => Array.from(new Set(haulageOffers.map(h => h.haulierName).filter(Boolean))), [haulageOffers]);

  // Application des filtres
  const filteredOffers = useMemo(() => {
    return haulageOffers.filter(h => {
      if (filterCity && h.loadingLocation?.displayName !== filterCity) return false;
      if (filterPort && h.pickupLocation?.displayName !== filterPort) return false;
      if (filterHaulier && h.haulierName !== filterHaulier) return false;
      if (filterValidUntil && h.validUntil) {
        const validDate = dayjs(h.validUntil);
        if (validDate.isBefore(filterValidUntil, 'day')) return false;
      }
      if (filterDistanceMin !== null && filterDistanceMax !== null) {
        const distance = h.distanceKm ?? 0;
        if (distance < filterDistanceMin || distance > filterDistanceMax) return false;
      }
      return true;
    });
  }, [haulageOffers, filterCity, filterPort, filterHaulier, filterValidUntil, filterDistanceMin, filterDistanceMax]);

  // Pagination sur les offres filtrées
  const paginatedOffers = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return filteredOffers.slice(start, start + PAGE_SIZE);
  }, [filteredOffers, page]);

  useEffect(() => {
    setPage(1); // reset page si filtre change
  }, [filterCity, filterPort, filterHaulier, filterValidUntil, filterDistanceMin, filterDistanceMax]);


  // ✅ NOUVELLE APPROCHE : Mise à jour via callback onStep4Update
  const handleSelectHaulage = (haulage: HaulageResponse) => {
    console.log('🔧 [STEP4] handleSelectHaulage appelé avec:', {
      haulage: haulage,
      offerId: haulage.offerId,
      haulierName: haulage.haulierName
    });

    // ✅ VÉRIFICATION : S'assurer que l'offerId est présent
    if (!haulage.offerId) {
      console.error('❌ [STEP4] Erreur: L\'offerId est manquant dans la sélection du haulage');
      alert('❌ Erreur: L\'offerId est manquant dans la sélection du haulage');
      return;
    }
    
    // ✅ CONSTRUIRE LES DONNÉES STEP4
    const step4Data = {
      selection: {
        offerId: haulage.offerId,
        haulierId: haulage.haulierId || 0,
        haulierName: haulage.haulierName || '',
        tariff: {
          unitPrice: haulage.unitTariff || 0,
          currency: haulage.currency || 'EUR',
          freeTime: haulage.freeTime || 0
        },
        route: {
          pickup: {
            company: haulage.pickupLocation?.displayName?.split(',')[0]?.trim() || '',
            city: (() => {
              const displayName = haulage.pickupLocation?.displayName || '';
              const parts = displayName.split(',');
              if (parts.length >= 2) {
                const cityPart = parts[1]?.trim() || '';
                return cityPart.replace(/^\d+\s+/, '');
              }
              return '';
            })(),
            country: (() => {
              const displayName = haulage.pickupLocation?.displayName || '';
              const parts = displayName.split(',');
              return parts[parts.length - 1]?.trim() || '';
            })()
          },
          delivery: {
            portId: 0, // Pas de portId dans HaulageResponse
            portName: haulage.deliveryLocation?.displayName?.split(',')[0]?.trim() || '',
            country: (() => {
              const displayName = haulage.deliveryLocation?.displayName || '';
              const parts = displayName.split(',');
              return parts[parts.length - 1]?.trim() || '';
            })()
          }
        },
        validity: {
          validUntil: haulage.validUntil 
            ? (typeof haulage.validUntil === 'string' 
                ? haulage.validUntil 
                : haulage.validUntil.toISOString())
            : new Date().toISOString()
        }
      },
              calculation: {
          quantity: 1, // Quantité par défaut
          unitPrice: haulage.unitTariff || 0,
          subtotal: haulage.unitTariff || 0,
          currency: haulage.currency || 'EUR',
          basePrice: haulage.unitTariff || 0,
          surchargesTotal: 0, // Pas de surcharges dans HaulageResponse
          surchargesCount: 0,
          priceSource: 'API_DIRECT'
        },
      completed: true
    };
    
    // ✅ APPELER LE CALLBACK POUR METTRE À JOUR REQUESTWIZARD
    if (onStep4Update) {
      console.log('🔄 [STEP4] Appel onStep4Update avec step4Data:', step4Data);
      onStep4Update(step4Data);
    } else {
      console.warn('⚠️ [STEP4] onStep4Update callback non fourni');
    }
  };

  // ✅ NOUVELLE FONCTION : Désélectionner le haulage
  const handleDeselectHaulage = () => {
    console.log('🔄 [STEP4] Désélection du haulage');
    
    // ✅ CONSTRUIRE LES DONNÉES STEP4 VIDES
    const step4Data = {
      selection: null,
      calculation: null,
      completed: false
    };
    
    // ✅ APPELER LE CALLBACK POUR METTRE À JOUR REQUESTWIZARD
    if (onStep4Update) {
      console.log('🔄 [STEP4] Appel onStep4Update pour désélection:', step4Data);
      onStep4Update(step4Data);
    } else {
      console.warn('⚠️ [STEP4] onStep4Update callback non fourni pour désélection');
    }
  };

  const handleRequestPrice = () => {
    setRequestSent(true);
    // Ici, appeler l'API pour envoyer une demande de prix si elle existe
  };

  // Fonctions pour gérer le modal de détails
  const handleOpenDetailsModal = (haulage: HaulageResponse) => {
    setSelectedHaulageForDetails(haulage);
    setIsDetailsModalOpen(true);
  };

  const handleCloseDetailsModal = () => {
    setIsDetailsModalOpen(false);
    setSelectedHaulageForDetails(null);
  };

  // const onRemoveMisc = (id: string) => {
  //   // Implementation of onRemoveMisc function
  // };


  return (
    <Box sx={{ p: 3, minHeight: '100vh', background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)' }}>
      <Box sx={{ textAlign: 'center', mb: 4, py: 3, borderRadius: 3, background: 'linear-gradient(90deg, #1976d2 0%, #7b1fa2 100%)', color: '#fff', boxShadow: '0 2px 16px rgba(25,118,210,0.08)' }}>
        <Typography variant="h3" sx={{ fontWeight: 700, mb: 1, color: '#fff', textShadow: '2px 2px 4px rgba(0,0,0,0.08)' }}>
          {t('requestWizard.step4.title')}
        </Typography>
        <Typography variant="h6" sx={{ opacity: 0.95, color: '#e3f0ff' }}>
          {t('requestWizard.step4.subtitle')}
        </Typography>
      </Box>
      
      {/* Section Selected Seafreight - Afficher les seafreights sélectionnés */}
      {draftQuote?.step5?.selections && draftQuote.step5.selections.length > 0 && (
        <Slide direction="up" in timeout={1000}>
          <Accordion defaultExpanded={false} sx={{ mb: 4, borderRadius: 3, boxShadow: '0 10px 30px rgba(0,0,0,0.1)', background: 'linear-gradient(135deg, #e8f5e8 0%, #c8e6c9 100%)' }}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Avatar sx={{ 
                  bgcolor: 'success.main', 
                  mr: 2,
                  background: 'linear-gradient(135deg, #4caf50 0%, #2e7d32 100%)'
                }}>
                  <DirectionsBoatIcon />
                </Avatar>
                <Typography variant="h5" sx={{ fontWeight: 600, color: '#2e7d32' }}>
                  {t('requestWizard.step4.selectedSeafreights', 'Selected Seafreights')}
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
                      border: '1px solid #4caf50',
                      borderLeft: '4px solid #4caf50'
                    }}>
                      <CardContent>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                          <DirectionsBoatIcon sx={{ color: '#4caf50', mr: 1 }} />
                          <Typography variant="h6" sx={{ fontWeight: 600, color: '#2e7d32' }}>
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
              
              {/* Résumé global - seulement si il y a des sélections */}
              {draftQuote?.step5?.selections && draftQuote.step5.selections.length > 0 && (
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
              )}
            </AccordionDetails>
          </Accordion>
        </Slide>
      )}
      
      {/* ✅ ALERTE SUR LE PROBLÈME OFFERID NULL */}
      {draftQuote?.step4?.selection && !draftQuote.step4.selection.offerId && (
        <Alert severity="warning" sx={{ mb: 2 }}>
          <Typography variant="body1" sx={{ fontWeight: 600 }}>
            🔧 RÉCUPÉRATION AUTOMATIQUE DE L'OFFERID
          </Typography>
          <Typography variant="body2" sx={{ mt: 1 }}>
            L'offerId est manquant mais sera récupéré automatiquement depuis la liste des haulages disponibles.
          </Typography>
          <Typography variant="body2" sx={{ mt: 1, fontFamily: 'monospace' }}>
            Données disponibles : haulierId={draftQuote.step4.selection.haulierId}, haulierName={draftQuote.step4.selection.haulierName}
          </Typography>
          <Typography variant="body2" sx={{ mt: 1, color: '#ed6c02' }}>
            🔄 Récupération automatique en cours...
          </Typography>
        </Alert>
      )}
      
      {/* Section Request details */}
      {draftQuote?.step1 && (
        <Slide direction="up" in timeout={1000}>
          <Accordion defaultExpanded={false} sx={{ mb: 4, borderRadius: 3, boxShadow: '0 10px 30px rgba(0,0,0,0.1)', background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)' }}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Avatar sx={{ 
                  bgcolor: 'primary.main', 
                  mr: 2,
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                }}>
                  <BusinessIcon />
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
                    <BusinessIcon sx={{ color: '#3498db', mr: 1 }} />
                    <Typography variant="subtitle1" sx={{ fontWeight: 500 }}>
                      <strong>{t('requestWizard.step3.client')}:</strong> {customerLabel}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <LocationOnIcon sx={{ color: '#e74c3c', mr: 1 }} />
                    <Typography variant="subtitle1" sx={{ fontWeight: 500 }}>
                      <strong>{t('requestWizard.step3.departure')}:</strong> {departureLabel}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <LocationOnIcon sx={{ color: '#27ae60', mr: 1 }} />
                    <Typography variant="subtitle1" sx={{ fontWeight: 500 }}>
                      <strong>{t('requestWizard.step3.arrival')}:</strong> {arrivalLabel}
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <AssignmentIcon sx={{ color: '#f39c12', mr: 1 }} />
                    <Typography variant="subtitle1" sx={{ fontWeight: 500 }}>
                      <strong>{t('requestWizard.step3.incoterm')}:</strong> {incotermLabel}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <LocalShippingIcon sx={{ color: '#9b59b6', mr: 1 }} />
                    <Typography variant="subtitle1" sx={{ fontWeight: 500 }}>
                      <strong>{t('requestWizard.step3.product')}:</strong> {productLabel}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <AssignmentIcon sx={{ color: '#34495e', mr: 1 }} />
                    <Typography variant="subtitle1" sx={{ fontWeight: 500 }}>
                      <strong>{t('requestWizard.step3.comment')}:</strong> {commentLabel}
                    </Typography>
                  </Box>
                </Grid>
              </Grid>

              {/* Section Ports */}
              <Box sx={{ mt: 4, mb: 2, p: 2, borderRadius: 2, background: 'linear-gradient(90deg, #e3f0ff 0%, #f5f7fa 100%)', boxShadow: '0 2px 8px #1976d220' }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 600, color: '#1976d2', mb: 1 }}>
                  {t('departurePort', 'Departure port')} & {t('destinationPort', 'Destination port')}
                </Typography>
                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <DirectionsBoatIcon sx={{ color: '#2980b9', mr: 1 }} />
                      <Typography variant="body1" sx={{ fontWeight: 500 }}>
                        <strong>{t('departurePort', 'Departure port')}:</strong> {draftQuote.step1.portFrom?.portName || '-'}
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <DirectionsBoatIcon sx={{ color: '#16a085', mr: 1 }} />
                      <Typography variant="subtitle1" sx={{ fontWeight: 500 }}>
                        <strong>{t('destinationPort', 'Destination port')}:</strong> {draftQuote.step1.portTo?.portName || '-'}
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>
              </Box>

              {/* Section Containers - Affichage des containers sélectionnés du Step 3 */}
              {draftQuote?.step3?.containers && draftQuote.step3.containers.length > 0 ? (
                <Box sx={{ mt: 4, mb: 2 }}>
                  <ContainersDisplay 
                    containers={draftQuote.step3.containers}
                    title="Containers sélectionnés"
                    showTitle={true}
                    compact={false}
                  />
                </Box>
              ) : (
                <Box sx={{ mt: 4, mb: 2, p: 2, background: '#fff3cd', borderRadius: 2, border: '1px solid #ffc107' }}>
                  <Typography variant="body2" sx={{ color: '#856404', textAlign: 'center' }}>
                    ⚠️ Aucun container sélectionné ou données manquantes
                  </Typography>
                </Box>
              )}
            </AccordionDetails>
          </Accordion>
        </Slide>
      )}
      
      {/* Filtres */}
      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <Card sx={{ mb: 3, borderRadius: 3, boxShadow: '0 4px 24px rgba(25,118,210,0.07)', p: 2, background: '#f5faff' }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={6} md={3}>
              <Autocomplete
                options={cityOptions}
                value={filterCity}
                onChange={(_, value) => setFilterCity(value)}
                renderInput={(params) => <TextField {...params} label={t('requestWizard.step4.filterCity')} variant="outlined" size="small" />}
                clearOnEscape
                isOptionEqualToValue={(option, value) => option === value}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Autocomplete
                options={portOptions}
                value={filterPort}
                onChange={(_, value) => setFilterPort(value)}
                renderInput={(params) => <TextField {...params} label={t('requestWizard.step4.filterPort')} variant="outlined" size="small" />}
                clearOnEscape
                isOptionEqualToValue={(option, value) => option === value}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Autocomplete
                options={haulierOptions}
                value={filterHaulier}
                onChange={(_, value) => setFilterHaulier(value)}
                renderInput={(params) => <TextField {...params} label={t('requestWizard.step4.filterHaulier')} variant="outlined" size="small" />}
                clearOnEscape
                isOptionEqualToValue={(option, value) => option === value}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <DatePicker
                label={t('requestWizard.step4.filterValidUntil')}
                value={filterValidUntil}
                onChange={setFilterValidUntil}
                slotProps={{ textField: { size: 'small', variant: 'outlined' } }}
                format="DD/MM/YYYY"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Autocomplete
                options={distanceOptions}
                getOptionLabel={(option) => option.label}
                value={distanceOptions.find(d => d.label === filterDistance) || null}
                onChange={(_, value) => {
                  setFilterDistance(value?.label || null);
                  if (value) {
                    setFilterDistanceMin(value.min);
                    setFilterDistanceMax(value.max);
                  } else {
                    setFilterDistanceMin(null);
                    setFilterDistanceMax(null);
                  }
                }}
                renderInput={(params) => <TextField {...params} label={t('requestWizard.step4.filterDistance', 'Distance')} variant="outlined" size="small" />}
                clearOnEscape
                isOptionEqualToValue={(option, value) => option.label === value.label}
              />
            </Grid>
          </Grid>
        </Card>
      </LocalizationProvider>
      
      {loading && <CircularProgress sx={{ my: 4 }} />}
      {error && <Alert severity="error">{error}</Alert>}
      
      {!loading && !error && paginatedOffers.length > 0 && (
        <Card sx={{ borderRadius: 3, boxShadow: '0 10px 30px rgba(25,118,210,0.10)', background: '#e3f0ff' }}>
          <CardContent>
            <Typography variant="h6" sx={{ mt: 1, mb: 2, fontWeight: 600, color: '#1976d2' }}>{t('requestWizard.step4.availablePrices')}</Typography>
            <TableContainer component={Paper} sx={{ borderRadius: 2, overflowX: 'auto', background: '#fff', boxShadow: '0 2px 8px #1976d220' }}>
              <Table size="small">
                <TableHead>
                  <TableRow sx={{ background: 'linear-gradient(90deg, #1976d2 0%, #7b1fa2 100%)' }}>
                    <TableCell sx={{ color: '#fff', fontWeight: 700 }}><LocalShippingIcon sx={{ verticalAlign: 'middle', mr: 1 }} fontSize="small" />{t('requestWizard.step4.filterHaulier')}</TableCell>
                    <TableCell sx={{ color: '#fff', fontWeight: 700 }}><LocationOnIcon sx={{ verticalAlign: 'middle', mr: 1 }} fontSize="small" />{t('requestWizard.step4.pickup')}</TableCell>
                    <TableCell sx={{ color: '#fff', fontWeight: 700 }}><LocationOnIcon sx={{ verticalAlign: 'middle', mr: 1 }} fontSize="small" />{t('requestWizard.step4.loading')}</TableCell>
                    <TableCell sx={{ color: '#fff', fontWeight: 700 }}><LocationOnIcon sx={{ verticalAlign: 'middle', mr: 1 }} fontSize="small" />{t('requestWizard.step4.delivery')}</TableCell>
                    <TableCell sx={{ color: '#fff', fontWeight: 700 }}><EuroIcon sx={{ verticalAlign: 'middle', mr: 1 }} fontSize="small" />{t('requestWizard.step4.tariff')}</TableCell>
                    <TableCell sx={{ color: '#fff', fontWeight: 700 }}><AccessTimeIcon sx={{ verticalAlign: 'middle', mr: 1 }} fontSize="small" />{t('requestWizard.step4.freeTime')}</TableCell>
                    <TableCell sx={{ color: '#fff', fontWeight: 700 }}><CalendarMonthIcon sx={{ verticalAlign: 'middle', mr: 1 }} fontSize="small" />{t('requestWizard.step4.validUntil')}</TableCell>
                    <TableCell sx={{ color: '#fff', fontWeight: 700 }}><RouteIcon sx={{ verticalAlign: 'middle', mr: 1 }} fontSize="small" />{t('requestWizard.step4.multistop')}</TableCell>
                    <TableCell sx={{ color: '#fff', fontWeight: 700 }}><SpeedIcon sx={{ verticalAlign: 'middle', mr: 1 }} fontSize="small" />{t('requestWizard.step4.overtimeTariff')}</TableCell>
                    <TableCell sx={{ color: '#fff', fontWeight: 700 }}><StraightenIcon sx={{ verticalAlign: 'middle', mr: 1 }} fontSize="small" />{t('requestWizard.step4.distance', 'Distance')}</TableCell>
                    <TableCell align="center" sx={{ color: '#fff', fontWeight: 700 }}><CheckCircleIcon sx={{ verticalAlign: 'middle', mr: 1 }} fontSize="small" />{t('requestWizard.step4.select')}</TableCell>
                    <TableCell align="center" sx={{ color: '#fff', fontWeight: 700 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <VisibilityIcon sx={{ verticalAlign: 'middle', mr: 1 }} fontSize="small" />
{t('requestWizard.step4.details')}
                      </Box>
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {paginatedOffers.map((h, idx) => {
                    // ✅ NOUVELLE LOGIQUE : Utiliser step4 depuis draftQuote
                    const offerKey = h.offerId;
                    const selectedId = draftQuote?.step4?.selection?.offerId;
                    const isSelected = selectedId === offerKey;
                    
                    return (
                      <TableRow key={offerKey || idx} hover selected={isSelected} sx={{ transition: 'background 0.2s', background: isSelected ? 'rgba(25, 118, 210, 0.13)' : undefined }}>
                        <TableCell sx={{ fontWeight: 600 }}>{h.haulierName || '-'}</TableCell>
                        <TableCell>{extractCityInfo(h.pickupLocation?.displayName)}</TableCell>
                        <TableCell>{extractCityInfo(h.loadingLocation?.displayName)}</TableCell>
                        <TableCell>{extractCityInfo(h.deliveryLocation?.displayName)}</TableCell>
                        <TableCell>
                          {(() => {
                            // ✅ AFFICHAGE INTELLIGENT : Recherche automatique du prix pour l'affichage (structure imbriquée)
                            let displayPrice = 0;
                            let priceField = 'N/A';
                            
                            // PRIORITÉ 1: Champs directs
                            const directPriceFields = [
                              'unitTariff', 'price', 'cost', 'amount', 'total',
                              'unitPrice', 'basePrice', 'pricePerUnit', 'tariffPrice', 'transportPrice', 
                              'haulagePrice', 'fee', 'rate'
                            ];
                            
                            for (const field of directPriceFields) {
                              const value = (h as any)[field];
                              if (value !== undefined && value !== null && typeof value === 'number' && value > 0) {
                                displayPrice = value;
                                priceField = field;
                                break;
                              }
                            }
                            
                            // PRIORITÉ 2: Structures imbriquées si aucun prix direct trouvé
                            if (displayPrice === 0) {
                              const nestedPricePaths = [
                                { path: 'tariff.unitPrice', desc: 'tariff.unitPrice' },
                                { path: 'tariff.price', desc: 'tariff.price' },
                                { path: 'pricing.unitPrice', desc: 'pricing.unitPrice' },
                                { path: 'pricing.amount', desc: 'pricing.amount' },
                                { path: 'charges.basePrice', desc: 'charges.basePrice' }
                              ];
                              
                              for (const { path, desc } of nestedPricePaths) {
                                const keys = path.split('.');
                                let value = h;
                                let pathExists = true;
                                
                                for (const key of keys) {
                                  if (value && typeof value === 'object' && key in value) {
                                    value = value[key];
                                  } else {
                                    pathExists = false;
                                    break;
                                  }
                                }
                                
                                if (pathExists && value !== undefined && value !== null && typeof value === 'number' && value > 0) {
                                  displayPrice = value;
                                  priceField = desc;
                                  break;
                                }
                              }
                            }
                            
                            return (
                              <>
                                {displayPrice > 0 ? `${displayPrice.toFixed(2)} ${h.currency || 'EUR'}` : '-'}
                                {/* ✅ DEBUG: Afficher le champ source du prix */}
                                {displayPrice > 0 && priceField !== 'unitTariff' && (
                                  <span style={{ fontSize: '10px', color: 'orange', display: 'block' }}> 
                                    (via: {priceField})
                                  </span>
                                )}
                                {displayPrice === 0 && (
                                  <span style={{ fontSize: '10px', color: 'red', display: 'block' }}> 
                                    (aucun prix trouvé)
                                  </span>
                                )}
                              </>
                            );
                          })()}
                        </TableCell>
                        <TableCell>{h.freeTime || '-'}</TableCell>
                        <TableCell>{h.validUntil ? (dayjs(h.validUntil).isValid() ? dayjs(h.validUntil).format('DD/MM/YYYY') : '-') : '-'}</TableCell>
                        <TableCell>{h.multiStop ?? '-'}</TableCell>
                        <TableCell>{h.overtimeTariff ?? '-'} {h.currency || ''}</TableCell>
                        <TableCell>{h.distanceKm != null ? `${h.distanceKm} km` : '-'}</TableCell>
                        <TableCell align="center">
                          <Button
                            variant={isSelected ? "contained" : "outlined"}
                            color="primary"
                            size="small"
                            onClick={() => {
                              console.log('🔧 [STEP4] Bouton cliqué pour haulage:', {
                                offerId: h.offerId,
                                haulierName: h.haulierName,
                                isSelected: isSelected
                              });
                              if (isSelected) {
                                handleDeselectHaulage();
                              } else {
                                handleSelectHaulage(h);
                              }
                            }}
                            disabled={false}
                            sx={{ fontWeight: 600, minWidth: 90 }}
                            startIcon={null}
                          >
                            {isSelected 
                              ? t('requestWizard.step4.deselect')
                              : t('requestWizard.step4.select')
                            }
                          </Button>
                        </TableCell>
                        <TableCell align="center">
                          <Tooltip title={t('requestWizard.step4.details')} arrow>
                            <IconButton
                              size="small"
                              onClick={() => handleOpenDetailsModal(h)}
                              sx={{
                                color: '#1976d2',
                                '&:hover': {
                                  backgroundColor: 'rgba(25, 118, 210, 0.1)',
                                  transform: 'scale(1.1)',
                                },
                                transition: 'all 0.2s ease-in-out'
                              }}
                            >
                              <VisibilityIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
              <Pagination
                count={Math.ceil(filteredOffers.length / PAGE_SIZE)}
                page={page}
                onChange={(_, value) => setPage(value)}
                color="primary"
                shape="rounded"
                size="large"
              />
            </Box>
          </CardContent>
        </Card>
      )}
      
      {!loading && !error && paginatedOffers.length === 0 && !requestSent && (
        <Box sx={{ mt: 4 }}>
          <Alert severity="info" sx={{ mb: 2 }}>
            {t('requestWizard.step4.noOffers')}
          </Alert>
          <Button variant="contained" color="secondary" onClick={handleRequestPrice}>
            {t('requestWizard.step4.requestPrice')}
          </Button>
        </Box>
      )}
      
      {requestSent && (
        <Alert severity="success" sx={{ mt: 4 }}>
          {t('requestWizard.step4.requestSent')}
        </Alert>
      )}

      {/* Panier avec OfferBasketDrawerAccordion */}
      <OfferBasketDrawerAccordion
        selectedHaulage={draftQuote?.step4?.selection || null}
        selectedSeafreight={selectedSeafreight}
        selectedMiscellaneous={selectedMiscellaneous || []}
        services={services}
        contacts={contacts}
        onRemoveMisc={onRemoveMisc}
        currentStep={5}
        requestData={requestData}
        selectedServices={selectedServices}
        selectedContainers={selectedContainers}
      >
        <Box sx={{ mt: 4 }} />
      </OfferBasketDrawerAccordion>


      {/* Modal de détails de l'offre haulage */}
      <Modal
        open={isDetailsModalOpen}
        onClose={handleCloseDetailsModal}
        aria-labelledby="haulage-details-modal"
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          p: 2,
        }}
      >
        <Box
          sx={{
            position: 'relative',
            width: { xs: '95%', sm: '90%', md: '80%', lg: '70%' },
            maxWidth: 1000,
            maxHeight: '90vh',
            bgcolor: 'background.paper',
            borderRadius: 3,
            boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          {/* Header du modal */}
          <Box
            sx={{
              background: 'linear-gradient(135deg, #1976d2 0%, #7b1fa2 100%)',
              color: 'white',
              p: 3,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)', mr: 2 }}>
                <LocalShippingIcon />
              </Avatar>
              <Box>
                <Typography variant="h5" sx={{ fontWeight: 700, mb: 0.5 }}>
                  Détails de l'offre de transport
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                  {selectedHaulageForDetails?.haulierName || 'Transporteur'} - {selectedHaulageForDetails?.offerId || 'N/A'}
                </Typography>
              </Box>
            </Box>
            <IconButton
              onClick={handleCloseDetailsModal}
              sx={{
                color: 'white',
                '&:hover': {
                  backgroundColor: 'rgba(255,255,255,0.1)',
                },
              }}
            >
              <CloseIcon />
            </IconButton>
          </Box>

          {/* Contenu du modal */}
          <Box sx={{ p: 3, overflow: 'auto', flex: 1 }}>
            {selectedHaulageForDetails && (
              <Grid container spacing={3}>
                {/* Informations générales */}
                <Grid item xs={12} md={6}>
                  <Card sx={{ mb: 3, borderRadius: 2, boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
                    <CardContent>
                      <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: '#1976d2', display: 'flex', alignItems: 'center' }}>
                        <BusinessIcon sx={{ mr: 1 }} />
                        Informations générales
                      </Typography>
                      <Grid container spacing={2}>
                        <Grid item xs={12}>
                          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                            <LocalShippingIcon sx={{ color: '#1976d2', mr: 1, fontSize: '1.2em' }} />
                            <Typography variant="body2" sx={{ fontWeight: 600 }}>
                              Transporteur: {selectedHaulageForDetails.haulierName ?? '-'}
                            </Typography>
                          </Box>
                        </Grid>
                        <Grid item xs={12}>
                          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                            <AssignmentIcon sx={{ color: '#9b59b6', mr: 1, fontSize: '1.2em' }} />
                            <Typography variant="body2" sx={{ fontWeight: 600 }}>
                              ID Offre: {selectedHaulageForDetails.offerId ?? '-'}
                            </Typography>
                          </Box>
                        </Grid>
                        <Grid item xs={12}>
                          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                            <EuroIcon sx={{ color: '#27ae60', mr: 1, fontSize: '1.2em' }} />
                            <Typography variant="body2" sx={{ fontWeight: 600 }}>
                              Devise: {selectedHaulageForDetails.currency ?? 'EUR'}
                            </Typography>
                          </Box>
                        </Grid>
                        <Grid item xs={12}>
                          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                            <RouteIcon sx={{ color: '#e67e22', mr: 1, fontSize: '1.2em' }} />
                            <Typography variant="body2" sx={{ fontWeight: 600 }}>
                              Multi-stop: {selectedHaulageForDetails.multiStop || 'Non'}
                            </Typography>
                          </Box>
                        </Grid>
                      </Grid>
                    </CardContent>
                  </Card>
                </Grid>

                {/* Localisations */}
                <Grid item xs={12} md={6}>
                  <Card sx={{ mb: 3, borderRadius: 2, boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
                    <CardContent>
                      <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: '#1976d2', display: 'flex', alignItems: 'center' }}>
                        <LocationOnIcon sx={{ mr: 1 }} />
                        Localisations
                      </Typography>
                      <Grid container spacing={2}>
                        <Grid item xs={12}>
                          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                            <LocationOnIcon sx={{ color: '#e74c3c', mr: 1, fontSize: '1.2em' }} />
                            <Typography variant="body2" sx={{ fontWeight: 600 }}>
                              Pickup: {extractCityInfo(selectedHaulageForDetails.pickupLocation?.displayName ?? undefined) || '-'}
                            </Typography>
                          </Box>
                        </Grid>
                        <Grid item xs={12}>
                          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                            <LocationOnIcon sx={{ color: '#f39c12', mr: 1, fontSize: '1.2em' }} />
                            <Typography variant="body2" sx={{ fontWeight: 600 }}>
                              Chargement: {extractCityInfo(selectedHaulageForDetails.loadingLocation?.displayName ?? undefined) || '-'}
                            </Typography>
                          </Box>
                        </Grid>
                        <Grid item xs={12}>
                          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                            <LocationOnIcon sx={{ color: '#27ae60', mr: 1, fontSize: '1.2em' }} />
                            <Typography variant="body2" sx={{ fontWeight: 600 }}>
                              Livraison: {extractCityInfo(selectedHaulageForDetails.deliveryLocation?.displayName ?? undefined) ?? '-'}
                            </Typography>
                          </Box>
                        </Grid>
                        <Grid item xs={12}>
                          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                            <StraightenIcon sx={{ color: '#9b59b6', mr: 1, fontSize: '1.2em' }} />
                            <Typography variant="body2" sx={{ fontWeight: 600 }}>
                              Distance: {selectedHaulageForDetails.distanceKm ? `${selectedHaulageForDetails.distanceKm} km` : '-'}
                            </Typography>
                          </Box>
                        </Grid>
                      </Grid>
                    </CardContent>
                  </Card>
                </Grid>

                {/* Tarification détaillée */}
                <Grid item xs={12}>
                  <Card sx={{ mb: 3, borderRadius: 2, boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
                    <CardContent>
                      <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: '#1976d2', display: 'flex', alignItems: 'center' }}>
                        <EuroIcon sx={{ mr: 1 }} />
                        Tarification détaillée
                      </Typography>
                      
                      <Grid container spacing={3}>
                        {/* Tarif unitaire */}
                        <Grid item xs={12} md={4}>
                          <Box sx={{ textAlign: 'center', p: 2, background: 'linear-gradient(135deg, #e8f5e8 0%, #c8e6c9 100%)', borderRadius: 2 }}>
                            <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                              Tarif Unitaire
                            </Typography>
                            <Typography variant="h5" sx={{ fontWeight: 700, color: '#2e7d32' }}>
                              {selectedHaulageForDetails.unitTariff?.toLocaleString(undefined, { maximumFractionDigits: 2 }) || '0.00'} {selectedHaulageForDetails.currency || 'EUR'}
                            </Typography>
                          </Box>
                        </Grid>

                        {/* Free Time */}
                        <Grid item xs={12} md={4}>
                          <Box sx={{ textAlign: 'center', p: 2, background: 'linear-gradient(135deg, #fff3e0 0%, #ffe0b2 100%)', borderRadius: 2 }}>
                            <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                              Free Time
                            </Typography>
                            <Typography variant="h5" sx={{ fontWeight: 700, color: '#e65100' }}>
                              {selectedHaulageForDetails.freeTime || 0}h
                            </Typography>
                          </Box>
                        </Grid>

                        {/* Tarif overtime */}
                        <Grid item xs={12} md={4}>
                          <Box sx={{ textAlign: 'center', p: 2, background: 'linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%)', borderRadius: 2 }}>
                            <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                              Tarif Overtime
                            </Typography>
                            <Typography variant="h5" sx={{ fontWeight: 700, color: '#1565c0' }}>
                              {selectedHaulageForDetails.overtimeTariff?.toLocaleString(undefined, { maximumFractionDigits: 2 }) || '0.00'} {selectedHaulageForDetails.currency || 'EUR'}
                            </Typography>
                          </Box>
                        </Grid>
                      </Grid>
                    </CardContent>
                  </Card>
                </Grid>

                {/* Validité et informations supplémentaires */}
                <Grid item xs={12} md={6}>
                  <Card sx={{ mb: 3, borderRadius: 2, boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
                    <CardContent>
                      <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: '#1976d2', display: 'flex', alignItems: 'center' }}>
                        <CalendarMonthIcon sx={{ mr: 1 }} />
                        Validité
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <AccessTimeIcon sx={{ color: '#e67e22', mr: 1, fontSize: '1.2em' }} />
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          Valide jusqu'au: {selectedHaulageForDetails.validUntil ? dayjs(selectedHaulageForDetails.validUntil).format('DD/MM/YYYY') : '-'}
                        </Typography>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>

                {/* Informations techniques */}
                <Grid item xs={12} md={6}>
                  <Card sx={{ mb: 3, borderRadius: 2, boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
                    <CardContent>
                      <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: '#1976d2', display: 'flex', alignItems: 'center' }}>
                        <SpeedIcon sx={{ mr: 1 }} />
                        Informations techniques
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <RouteIcon sx={{ color: '#8e44ad', mr: 1, fontSize: '1.2em' }} />
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          Multi-stop: {selectedHaulageForDetails.multiStop || 'Non'}
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <StraightenIcon sx={{ color: '#9b59b6', mr: 1, fontSize: '1.2em' }} />
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          Distance: {selectedHaulageForDetails.distanceKm ? `${selectedHaulageForDetails.distanceKm} km` : 'Non spécifiée'}
                        </Typography>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            )}
          </Box>

          {/* Footer du modal */}
          <Box
            sx={{
              p: 3,
              background: 'linear-gradient(135deg, #f5f7fa 0%, #e9ecef 100%)',
              borderTop: '1px solid #dee2e6',
              display: 'flex',
              justifyContent: 'flex-end',
              gap: 2,
            }}
          >
            <Button
              variant="outlined"
              onClick={handleCloseDetailsModal}
              sx={{
                borderRadius: 2,
                px: 3,
                py: 1,
                fontWeight: 600,
              }}
            >
{t('requestWizard.step4.close')}
            </Button>
            {selectedHaulageForDetails && (
          <Button 
            variant="contained" 
                onClick={() => {
                  handleSelectHaulage(selectedHaulageForDetails);
                  handleCloseDetailsModal();
                }}
                sx={{
                  borderRadius: 2,
                  px: 3,
                  py: 1,
                  fontWeight: 600,
                  background: 'linear-gradient(135deg, #1976d2 0%, #7b1fa2 100%)',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #1565c0 0%, #6a4190 100%)',
                  },
                }}
              >
{draftQuote?.step4?.selection?.offerId === selectedHaulageForDetails.offerId ? t('requestWizard.step4.deselect') : t('requestWizard.step4.selectThisOffer')}
          </Button>
            )}
      </Box>
        </Box>
      </Modal>

    </Box>
  );
};

export default Step4HaulierSelection;