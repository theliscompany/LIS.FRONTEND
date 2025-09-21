import React, { useEffect, useState, useMemo } from "react";
import { Box, Typography, Button, CircularProgress, List, ListItem, ListItemText, Alert, TextField, Grid, Autocomplete, Card, CardContent, Pagination, Stack, Chip, Fab, Badge, Drawer, useMediaQuery, Accordion, AccordionSummary, AccordionDetails, ButtonGroup, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Avatar, Fade, Slide, Modal, IconButton, Divider } from "@mui/material";

import { getApiSeaFreight, getApiHaulageById } from "@features/pricingnew/api/sdk.gen";
import type { SeaFreightResponse } from "@features/pricingnew/api/types.gen";
import type { HaulageResponse } from "@features/pricingnew/api/types.gen";
import dayjs, { Dayjs } from 'dayjs';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import OfferBasketDrawerAccordion from './OfferBasketDrawerAccordion';
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
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
import CategoryIcon from '@mui/icons-material/Category';
import RepeatIcon from '@mui/icons-material/Repeat';
import PortAutocomplete from '../../../components/shared/PortAutocomplete';
import Checkbox from '@mui/material/Checkbox';
import { getTEU } from '../../../utils/functions';
import Tooltip from '@mui/material/Tooltip';
import PersonIcon from '@mui/icons-material/Person';
import DescriptionIcon from '@mui/icons-material/Description';
import InfoIcon from '@mui/icons-material/Info';
import ReceiptIcon from '@mui/icons-material/Receipt';
import ScheduleIcon from '@mui/icons-material/Schedule';
import MapIcon from '@mui/icons-material/Map';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import LanguageIcon from '@mui/icons-material/Language';
import FingerprintIcon from '@mui/icons-material/Fingerprint';
import VisibilityIcon from '@mui/icons-material/Visibility';
import CloseIcon from '@mui/icons-material/Close';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import SecurityIcon from '@mui/icons-material/Security';
import ContainersDisplay from '@features/request/components/ContainersDisplay';
import type { DraftQuote } from "@features/request/types/DraftQuote";

const PAGE_SIZE = 10;

interface Step5SeafreightSelectionProps {
  cityFrom: any;
  portFrom: any;
  onBack: () => void;
  onNext: () => void;
  selectedHaulage?: HaulageResponse;
  selectedMiscellaneous?: any[];
  services: any[];
  contacts: any[];
  requestData?: any;
  selectedServices?: any[];
  selectedContainers?: any;
  onRequestDataChange?: (data: any) => void;
  totalTEU?: number;
  draftQuote: DraftQuote;
  onStep5Update: (step5Data: any) => void;
}

const Step5SeafreightSelection: React.FC<Step5SeafreightSelectionProps> = ({
  selectedHaulage,
  selectedMiscellaneous,
  services,
  contacts,
  onBack,
  onNext,
  requestData,
  selectedServices = [],
  selectedContainers = {},
  onRequestDataChange,
  totalTEU = 0,
  draftQuote,
  onStep5Update
}) => {


  // Vérifier si le step5 a des données valides
  const hasValidSeafreightSelection = draftQuote?.step5?.selections && 
    draftQuote.step5.selections.length > 0;



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



  const [loading, setLoading] = useState(false);
  const [seafreightOffers, setSeafreightOffers] = useState<SeaFreightResponse[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [selectedSeafreightIds, setSelectedSeafreightIds] = useState<string[]>([]);
  const [selectedSeafreights, setSelectedSeafreights] = useState<SeaFreightResponse[]>([]);

  // Filtres
  const [filterDeparturePort, setFilterDeparturePort] = useState<string>('');
  const [filterArrivalPort, setFilterArrivalPort] = useState<string>('');
  const [filterCarrier, setFilterCarrier] = useState<string | null>(null);
  const [filterValidUntil, setFilterValidUntil] = useState<Dayjs | null>(null);
  const [page, setPage] = useState(1);

  // Variables pour le panier
  const isMobile = useMediaQuery('(max-width:900px)');

  // Ajout d'un filtre texte global pour la recherche locale
  const [searchText, setSearchText] = useState('');

  // State local pour les quantités de containers sélectionnés
  const [containerQuantities, setContainerQuantities] = useState<{ [type: string]: number }>({});

  // États pour le modal de détails
  const [selectedOfferForDetails, setSelectedOfferForDetails] = useState<SeaFreightResponse | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);

  const { t } = useTranslation();

  // Logs de débogage pour la synchronisation (comme dans Step4)
  useEffect(() => {
    const selectedId = draftQuote?.id;
  }, [draftQuote, seafreightOffers]);

  // ✅ Log des données reçues pour débogage
  useEffect(() => {
    console.log('🔧 [STEP5] Données reçues dans requestData:', {
      requestData: requestData,
      step1: requestData?.step1,
      customer: requestData?.customer,
      shipment: requestData?.shipment,
      incoterm: requestData?.incoterm,
      comment: requestData?.comment,
      // Données spécifiques
      customerName: requestData?.customer?.name,
      customerContactPerson: requestData?.customer?.contactPerson?.fullName,
      originLocation: requestData?.shipment?.origin?.location,
      originCountry: requestData?.shipment?.origin?.country,
      destinationLocation: requestData?.shipment?.destination?.location,
      destinationCountry: requestData?.shipment?.destination?.country,
      commodityProductName: requestData?.shipment?.commodity?.productName,
      commodity: requestData?.shipment?.commodity
    });
  }, [requestData]);


  // Forcer la sélection au chargement si des seafreights sont sélectionnés dans step5
  useEffect(() => {
    if (draftQuote?.step5?.selections && seafreightOffers.length > 0) {
      const selections = draftQuote.step5.selections;

    }
  }, [draftQuote?.step5?.selections, seafreightOffers]);

  useEffect(() => {
    const fetchSeaFreights = async () => {
      setLoading(true);
      setError(null);
      setSeafreightOffers([]);
      try {
        const res = await getApiSeaFreight();
        const data = Array.isArray(res?.data?.items) ? res.data.items : [];
        setSeafreightOffers(data);
      } catch (e) {
        console.error('Erreur lors de la récupération des offres seafreight:', e);
        setError("Erreur lors de la récupération des offres seafreight.");
      } finally {
        setLoading(false);
      }
    };
    fetchSeaFreights();
  }, []); // On charge tous les seafreight une seule fois au montage

  // Valeurs uniques pour les filtres
  const departureOptions = useMemo(() => Array.from(new Set(seafreightOffers.map(h => h.departurePort?.name).filter(Boolean))), [seafreightOffers]);
  const arrivalOptions = useMemo(() => Array.from(new Set(seafreightOffers.map(h => h.arrivalPort?.name).filter(Boolean))), [seafreightOffers]);
  const carrierOptions = useMemo(() => Array.from(new Set(seafreightOffers.map(h => h.carrier?.name).filter(Boolean))), [seafreightOffers]);

  // Application des filtres locaux (barre de recherche)
  const filteredOffers = useMemo(() => {
    let offers = seafreightOffers;
    // Filtre par ports sélectionnés dans la barre de recherche (filtres locaux)
    if (filterDeparturePort) offers = offers.filter(h => h.departurePort?.name?.toLowerCase() === filterDeparturePort.toLowerCase());
    if (filterArrivalPort) offers = offers.filter(h => h.arrivalPort?.name?.toLowerCase() === filterArrivalPort.toLowerCase());
    // Filtre texte global
    if (searchText) {
      const lower = searchText.toLowerCase();
      offers = offers.filter(h =>
        (h.departurePort?.name?.toLowerCase().includes(lower) ||
         h.arrivalPort?.name?.toLowerCase().includes(lower) ||
         h.carrier?.name?.toLowerCase().includes(lower) ||
         h.containerType?.toLowerCase().includes(lower))
      );

    }
    if (filterCarrier && offers.length > 0) {
      offers = offers.filter(h => h.carrier?.name === filterCarrier);

    }
    if (filterValidUntil && offers.length > 0) {
      offers = offers.filter(h => {
        if (!h.validity?.endDate) return false;
        const validDate = dayjs(h.validity.endDate);
        return !validDate.isBefore(filterValidUntil, 'day');
      });

    }
    
    return offers;
  }, [seafreightOffers, searchText, filterDeparturePort, filterArrivalPort, filterCarrier, filterValidUntil]);

  // Pagination sur les offres filtrées
  const paginatedOffers = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return filteredOffers.slice(start, start + PAGE_SIZE);
  }, [filteredOffers, page]);

  useEffect(() => {
    setPage(1); // reset page si filtre change
  }, [filterDeparturePort, filterArrivalPort, filterCarrier, filterValidUntil]);

  // Synchroniser les quantités avec la sélection du step 3
  useEffect(() => {
    if (Array.isArray(selectedContainers?.list)) {
      const initial: { [type: string]: number } = {};
      selectedContainers.list.forEach((c: any) => {
        initial[c.containerType || c.type] = c.quantity ?? 1;
      });
      setContainerQuantities(initial);
    }
  }, [selectedContainers]);

  // === LOGIQUE DE SYNCHRONISATION CORRIGÉE POUR SÉLECTION MULTIPLE ===
  // Synchronisation qui récupère les données du brouillon sans écraser les changements manuels
  useEffect(() => {
    console.log('🔧 [STEP5] useEffect de synchronisation déclenché:', {
      seafreightOffersLength: seafreightOffers.length,
      hasValidSeafreightSelection,
      draftQuoteStep5: draftQuote?.step5?.selections,
      currentSelectedIds: selectedSeafreightIds
    });

    // Synchronisation si :
    // 1. Les offres sont chargées
    // 2. Il y a des sélections valides dans step5
    if (seafreightOffers.length > 0 && hasValidSeafreightSelection && draftQuote?.step5?.selections) {
      const step5Selections = draftQuote.step5.selections;
      
      // ✅ MODIFICATION : Prendre TOUS les seafreights sélectionnés
      const step5Ids = step5Selections.map(selection => selection.id || selection.seafreightId).filter(Boolean);
      const matchingOffers = seafreightOffers.filter(offer => step5Ids.includes(offer.id || ''));
      
      if (matchingOffers.length > 0) {
        // Vérifier si les données locales sont différentes des données de step5
        const currentIds = selectedSeafreightIds;
        const needsUpdate = JSON.stringify(currentIds.sort()) !== JSON.stringify(step5Ids.sort());
        
        if (needsUpdate) {
          console.log('🔄 [STEP5] Synchronisation avec step5 - sélection multiple:', step5Ids);
          setSelectedSeafreightIds(step5Ids);
          setSelectedSeafreights(matchingOffers);
        } else {
          console.log('🔧 [STEP5] Pas de synchronisation nécessaire - données identiques');
        }
      } else {
        console.warn('[DEBUG][Step5] No matching offers found for step5 selections:', step5Ids);
        
        // Si les offres de step5 ne sont plus disponibles, vider la sélection
        if (selectedSeafreightIds.length > 0) {
          console.log('🔄 [STEP5] Offres non disponibles, vidage de la sélection');
          setSelectedSeafreightIds([]);
          setSelectedSeafreights([]);
        }
      }
    } else if (seafreightOffers.length > 0 && !hasValidSeafreightSelection) {
      // Si pas de sélection valide dans step5, vider la sélection locale
      if (selectedSeafreightIds.length > 0) {
        console.log('🔄 [STEP5] Pas de sélection valide dans step5, vidage de la sélection locale');
        setSelectedSeafreightIds([]);
        setSelectedSeafreights([]);
      }
    }
  }, [seafreightOffers, draftQuote?.step5?.selections, hasValidSeafreightSelection]); // Retirer selectedSeafreightIds des dépendances

  // Handler pour changer la quantité d'un container
  const handleContainerQuantityChange = (type: string, value: number) => {
    setContainerQuantities(q => ({ ...q, [type]: value }));
    
    // Mettre à jour le total TEU si nécessaire
    if (onStep5Update && selectedSeafreights.length > 0) {
      // ✅ MODIFICATION : Traiter TOUS les seafreights sélectionnés
      const step5Data = {
        selections: selectedSeafreights.map(seafreight => {
          const quantity = seafreight.containerType === type ? value : (containerQuantities[seafreight.containerType || ''] || 1);
          const teuPerContainer = getTEU(seafreight.containerType || '');
          const total = teuPerContainer * quantity;
          
          return {
            id: seafreight.id || '',
            seafreightId: seafreight.id || '',
            carrier: { name: seafreight.carrier?.name || '', agentName: '' },
            route: {
              departurePort: { portId: 0, portName: seafreight.departurePort?.name || '', country: '' },
              destinationPort: { portId: 0, portName: seafreight.arrivalPort?.name || '', country: '' },
              transitDays: seafreight.transitTimeDays || 0,
              frequency: seafreight.frequency || ''
            },
            container: {
              containerType: seafreight.containerType || '',
              quantity: quantity,
              unitPrice: seafreight.charges?.basePrice || 0,
              subtotal: total
            },
            charges: {
              basePrice: seafreight.charges?.basePrice || 0,
              currency: seafreight.currency || 'EUR',
              surcharges: seafreight.charges?.surcharges || [],
              totalPrice: total
            }
          };
        }),
        summary: {
          totalSelections: selectedSeafreights.length,
          totalContainers: selectedSeafreights.length,
          totalAmount: selectedSeafreights.reduce((sum, sf) => {
            const quantity = sf.containerType === type ? value : (containerQuantities[sf.containerType || ''] || 1);
            const teuPerContainer = getTEU(sf.containerType || '');
            return sum + (teuPerContainer * quantity);
          }, 0),
          currency: 'EUR'
        }
      };
      
      console.log('🔄 [STEP5] Mise à jour quantité container pour sélection multiple:', { type, value });
      onStep5Update(step5Data);
    }
  };

  // === HANDLER DE SÉLECTION/DÉSÉLECTION CORRIGÉ POUR SÉLECTION MULTIPLE ===
  const handleToggleSeafreight = (offer: SeaFreightResponse) => {
    const offerId = offer.id || '';
    if (!offerId) {
      console.error('[DEBUG][Step5] No valid ID found for offer:', offer);
      return;
    }

    console.log('🔧 [STEP5] handleToggleSeafreight appelé avec:', {
      offerId,
      currentSelectedIds: selectedSeafreightIds,
      offer: offer
    });

    // Déterminer l'action : ajouter ou retirer
    const isCurrentlySelected = selectedSeafreightIds.includes(offerId);
    
    let newIds: string[];
    let newSeafreights: SeaFreightResponse[];

    if (isCurrentlySelected) {
      // RETIRER l'offre (désélectionner)
      newIds = selectedSeafreightIds.filter(id => id !== offerId);
      newSeafreights = selectedSeafreights.filter(sf => sf.id !== offerId);
      console.log('🔄 [STEP5] Désélection du seafreight:', offerId, 'Nouveaux IDs:', newIds);
    } else {
      // AJOUTER l'offre (ajout à la sélection existante)
      newIds = [...selectedSeafreightIds, offerId];
      newSeafreights = [...selectedSeafreights, offer];
      console.log('🔄 [STEP5] Ajout du seafreight:', offerId, 'Nouveaux IDs:', newIds);
    }

    // Mettre à jour les états locaux IMMÉDIATEMENT
    setSelectedSeafreightIds(newIds);
    setSelectedSeafreights(newSeafreights);
    
    console.log('🔧 [STEP5] États mis à jour:', {
      selectedSeafreightIds: newIds,
      selectedSeafreights: newSeafreights.length
    });



    // Calculer le total
    const total = newSeafreights.reduce((sum, sf) => {
      // Utiliser la fonction calculateTotalPrice pour un calcul correct
      const priceInfo = calculateTotalPrice(sf.charges, sf.currency || undefined);
      

      
      return sum + priceInfo.total;
    }, 0);

          // Notifier le parent uniquement (sauvegarde manuelle via bouton)
      if (onStep5Update) {
        // === CONSTRUCTION DE LA STRUCTURE STEP5 COMPLÈTE POUR SÉLECTION MULTIPLE ===
        // ✅ MODIFICATION : Sauvegarder TOUS les seafreights sélectionnés
        const step5Data = {
          selections: newSeafreights.map(seafreight => ({
            id: seafreight.id || '',
            seafreightId: seafreight.id || '',
            quoteNumber: '',
            carrier: {
              name: seafreight.carrier?.name || '',
              agentName: ''
            },
            route: {
              departurePort: {
                portId: 0,
                portName: seafreight.departurePort?.name || '',
                country: ''
              },
              destinationPort: {
                portId: 0,
                portName: seafreight.arrivalPort?.name || '',
                country: ''
              },
              transitDays: seafreight.transitTimeDays || 0,
              frequency: seafreight.frequency || ''
            },
            container: {
              containerType: seafreight.containerType || '',
              isReefer: false,
              quantity: 1,
              volumeM3: 0,
              weightKg: 0,
              unitPrice: seafreight.charges?.basePrice || 0,
              subtotal: calculateTotalPrice(seafreight.charges, seafreight.currency).total
            },
            charges: {
              basePrice: seafreight.charges?.basePrice || 0,
              currency: seafreight.currency || 'EUR',
              surcharges: seafreight.charges?.surcharges?.map(s => ({
                name: s.name || '',
                value: s.value || 0,
                type: String(s.type || ''), // ✅ CORRECTION : Convertir en string
                description: s.description || '',
                isMandatory: s.isMandatory || false,
                currency: s.currency || seafreight.currency || 'EUR'
              })) || [],
              totalPrice: seafreight.charges?.total || calculateTotalPrice(seafreight.charges, seafreight.currency).total
            },
            service: {
              deliveryTerms: '',
              createdBy: 'unknown@omnifreight.eu',
              createdDate: new Date()
            },
            validity: {
              startDate: new Date(),
              endDate: seafreight.validity?.endDate ? new Date(seafreight.validity.endDate) : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
            },
            remarks: seafreight.remarks || '',
            isSelected: true,
            selectedAt: new Date()
          })),
          summary: {
            totalSelections: newSeafreights.length,
            totalContainers: newSeafreights.length,
            totalAmount: newSeafreights.reduce((sum, sf) => sum + calculateTotalPrice(sf.charges, sf.currency).total, 0),
            currency: 'EUR',
            selectedCarriers: [...new Set(newSeafreights.map(sf => sf.carrier?.name).filter(Boolean))],
            containerTypes: [...new Set(newSeafreights.map(sf => sf.containerType).filter(Boolean))],
            preferredSelectionId: newSeafreights.length > 0 ? newSeafreights[0].id || '' : ''
          }
        };
        

        
        // Envoyer les données au parent
        onStep5Update(step5Data);
        

      }
  };

  // === FONCTION UTILITAIRE CORRIGÉE : CALCUL DU PRIX TOTAL ===
  const calculateTotalPrice = (charges: any | undefined, currency: string | null | undefined) => {
    if (!charges) return { total: 0, currency: currency || '' };
    
    // Nouvelle logique basée sur la structure Charges du SDK
    let total = 0;
    
    // Prix de base
    if (typeof charges.basePrice === 'number') {
      total += charges.basePrice;
    }
    
    // Surcharges détaillées
    if (Array.isArray(charges.surcharges)) {
      charges.surcharges.forEach((surcharge: any) => {
        if (typeof surcharge.value === 'number') {
          total += surcharge.value;
        }
      });
    }
    
    // Fallback sur l'ancienne structure si nécessaire
    if (total === 0) {
      total = (charges.baseFreight || 0) + (charges.baf || 0) + (charges.caf || 0) + 
              (charges.thcOrigin || 0) + (charges.thcDestination || 0) + (charges.otherCharges || 0);
    }
    
    // Utiliser le total calculé par l'API si disponible
    if (typeof charges.total === 'number' && charges.total > 0) {
      total = charges.total;
    }
    
    return { total, currency: currency || '' };
  };

  // === FONCTION CORRIGÉE : TRANSFORMATION COMPLÈTE POUR L'API ===
  const transformSeafreightForAPI = (seafreight: SeaFreightResponse) => {
    // Calculer le total des charges
    const totalCharges = calculateTotalPrice(seafreight.charges, seafreight.currency);
    
    return {
      seaFreightId: seafreight.id || '',
      carrierName: seafreight.carrier?.name || '',
      carrierAgentName: '', // Pas de propriété équivalente dans SeaFreightResponse
      departurePort: {
        portId: 0, // Pas de propriété id dans Port
        portName: seafreight.departurePort?.name || '',
        country: '' // Pas de propriété country dans Port
      },
      destinationPort: seafreight.arrivalPort ? {
        portId: 0, // Pas de propriété id dans Port
        portName: seafreight.arrivalPort.name || '',
        country: '' // Pas de propriété country dans Port
      } : null,
      currency: seafreight.currency || 'EUR',
      transitTimeDays: seafreight.transitTimeDays || 0,
      frequency: seafreight.frequency || '',
      defaultContainer: seafreight.containerType || '',
      containers: [], // Pas de propriété containers dans SeaFreightResponse
      comment: seafreight.remarks || '', // Utiliser remarks au lieu de comment
      validUntil: seafreight.validity?.endDate || null,
      // === NOUVELLES DONNÉES DE PRIX COMPLÈTES ===
      pricing: {
        currency: seafreight.currency || 'EUR',
        basePrice: seafreight.charges?.basePrice || 0,
        total: totalCharges.total,
        // Surcharges détaillées
        surcharges: seafreight.charges?.surcharges?.map((surcharge: any) => ({
          name: surcharge.name || '',
          value: surcharge.value || 0,
          type: String(surcharge.type || ''), // ✅ CORRECTION : Convertir en string
          description: surcharge.description || '',
          isMandatory: surcharge.isMandatory || false,
          currency: surcharge.currency || seafreight.currency || 'EUR'
        })) || []
      },
      // Données de base pour la compatibilité
      baseFreight: seafreight.charges?.basePrice || 0,
      total: totalCharges.total,
      // Structure complète des charges pour la sauvegarde
      charges: {
        basePrice: seafreight.charges?.basePrice || 0,
        surcharges: (seafreight.charges?.surcharges || []).map((surcharge: any) => ({
          name: surcharge.name || '',
          value: surcharge.value || 0,
          type: String(surcharge.type || ''), // ✅ CORRECTION : Convertir en string
          description: surcharge.description || '',
          isMandatory: surcharge.isMandatory || false,
          currency: surcharge.currency || seafreight.currency || 'EUR'
        })),
        total: totalCharges.total
      }
    };
  };





  // Ajout pour affichage ports (on récupère depuis requestData.step1, PAS selectedHaulage)
  const departurePortName = requestData?.step1?.portFrom?.portName || requestData?.portFrom?.portName || '-';
  const destinationPortName = requestData?.step1?.portTo?.portName || requestData?.portTo?.portName || '-';

  // Log des données du haulage sélectionné pour debug
  useEffect(() => {
    if (selectedHaulage) {

      

    }
  }, [selectedHaulage]);

  // Fonction pour supprimer un élément miscellaneous
  const onRemoveMisc = (id: string) => {

  };

  // Fonctions pour gérer le modal de détails
  const handleOpenDetailsModal = (offer: SeaFreightResponse) => {
    setSelectedOfferForDetails(offer);
    setIsDetailsModalOpen(true);
  };

  const handleCloseDetailsModal = () => {
    setIsDetailsModalOpen(false);
    setSelectedOfferForDetails(null);
  };

  // Affichage du nombre d'offres sélectionnées
  const selectedCount = selectedSeafreightIds.length;

  // === NOUVELLE LOGIQUE : DÉTECTION DE DÉPASSEMENT TEU ===
  
  // Calcul du TEU total sélectionné dans les seafreights
  const selectedSeafreightTEU = useMemo(() => {
    // Calculer le TEU total basé sur les containers des offres sélectionnées ET leurs quantités
    let totalTEU = 0;
    
    selectedSeafreights.forEach((seafreight) => {
      // Récupérer le type de container de l'offre seafreight
      const containerType = seafreight.containerType;
      if (containerType) {
        // Calculer le TEU pour ce type de container
        const teuPerContainer = getTEU(containerType);
        // Récupérer la quantité spécifiée par l'utilisateur (ou 1 par défaut)
        const quantity = containerQuantities[containerType] || 1;
        totalTEU += (teuPerContainer * quantity);
      }
    });
    
    console.log('🔧 [STEP5] TEU total sélectionné (sélection multiple):', totalTEU);
    
    return totalTEU;
  }, [selectedSeafreights, containerQuantities]);

  // Calcul du TEU total disponible (depuis les containers du step3)
  const availableTEU = useMemo(() => {
    // PRIORITÉ 1: Récupérer depuis selectedContainers.list (structure principale)
    if (selectedContainers?.list && Array.isArray(selectedContainers.list)) {
      const calculatedTEU = selectedContainers.list.reduce((total: number, c: any) => {
        const teuPerContainer = getTEU(c.containerType || c.type);
        return total + (teuPerContainer * (c.quantity ?? 1));
      }, 0);
      console.log('🔧 [STEP5] TEU calculé depuis selectedContainers.list:', calculatedTEU);
      return calculatedTEU;
    }
    
    // PRIORITÉ 2: Récupérer depuis requestData.step3.containers (structure alternative)
    if (requestData?.step3?.containers && Array.isArray(requestData.step3.containers)) {
      const calculatedTEU = requestData.step3.containers.reduce((total: number, c: any) => {
        const teuPerContainer = getTEU(c.containerType || c.type);
        return total + (teuPerContainer * (c.quantity ?? 1));
      }, 0);
      console.log('🔧 [STEP5] TEU calculé depuis requestData.step3.containers:', calculatedTEU);
      return calculatedTEU;
    }
    
    // PRIORITÉ 3: Fallback sur la prop totalTEU si pas de containers
    console.log('🔧 [STEP5] TEU fallback sur totalTEU prop:', totalTEU);
    return totalTEU || 0;
  }, [selectedContainers, requestData?.step3?.containers, totalTEU]);

  // Détection du dépassement - comparer avec le TEU disponible
  const isTEUExceeded = selectedSeafreightTEU > availableTEU;
  const teuDifference = selectedSeafreightTEU - availableTEU;

  // Message d'alerte pour le dépassement
  const getTEUWarningMessage = () => {
    if (isTEUExceeded) {
      return `⚠️ Dépassement TEU détecté : ${selectedSeafreightTEU.toFixed(2)} TEU sélectionné pour ${availableTEU.toFixed(2)} TEU disponible (+${teuDifference.toFixed(2)} TEU)`;
    }
    return null;
  };

  // Message d'information pour le TEU sélectionné
  const getTEUInfoMessage = () => {
    if (selectedSeafreights.length > 0) {
      const percentage = availableTEU > 0 ? ((selectedSeafreightTEU / availableTEU) * 100) : 0;
      const carrierCount = new Set(selectedSeafreights.map(sf => sf.carrier?.name)).size;

      return `TEU sélectionné : ${selectedSeafreightTEU.toFixed(2)} / ${availableTEU.toFixed(2)} (${percentage.toFixed(1)}%) - ${selectedSeafreights.length} offre(s) de ${carrierCount} transporteur(s)`;
    }
    return null;
  };



  // Réf pour l'alerte TEU
  const teuAlertRef = React.useRef<HTMLDivElement>(null);

  // Effet pour scroller vers l'alerte si dépassement après sélection
  useEffect(() => {
    if (isTEUExceeded && teuAlertRef.current) {
      teuAlertRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [isTEUExceeded, selectedSeafreightIds]);

  return (
    <Box sx={{ p: 3, minHeight: '100vh', background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)' }}>
      <Box sx={{ textAlign: 'center', mb: 4, py: 3, borderRadius: 3, background: 'linear-gradient(90deg, #1976d2 0%, #7b1fa2 100%)', color: '#fff', boxShadow: '0 2px 16px rgba(25,118,210,0.08)' }}>
        <Typography variant="h3" sx={{ fontWeight: 700, mb: 1, color: '#fff', textShadow: '2px 2px 4px rgba(0,0,0,0.08)' }}>
          {t('requestWizard.step5.title')}
        </Typography>
        <Typography variant="h6" sx={{ opacity: 0.95, color: '#e3f0ff' }}>
          {t('requestWizard.step5.subtitle')}
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
                    <PersonIcon sx={{ color: '#3498db', mr: 1 }} />
                    <Typography variant="subtitle1" sx={{ fontWeight: 500 }}>
                      <strong>{t('requestWizard.step3.client')}:</strong> {(() => {
                        // Priorité 1: Données du client au niveau racine (DraftQuote.customer)
                        if (requestData?.customer?.name) return requestData.customer.name;
                        if (requestData?.customer?.contactPerson?.fullName) return requestData.customer.contactPerson.fullName;
                        
                        // Priorité 2: Données du step1
                        if (requestData?.step1?.customer?.contactName) return requestData.step1.customer.contactName;
                        if (requestData?.step1?.customer?.companyName) return requestData.step1.customer.companyName;
                        if (requestData?.step1?.customer?.name) return requestData.step1.customer.name;
                        
                        // Priorité 3: Données alternatives
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
                        // Priorité 1: Données du shipment (DraftQuote.shipment.origin)
                        if (requestData?.shipment?.origin?.location && requestData?.shipment?.origin?.country) {
                          return `${requestData.shipment.origin.location}, ${requestData.shipment.origin.country.toUpperCase()}`;
                        }
                        if (requestData?.shipment?.origin?.location) return requestData.shipment.origin.location;
                        
                        // Priorité 2: Données du step1
                        if (requestData?.step1?.cityFrom?.name && requestData?.step1?.cityFrom?.country) {
                          return `${requestData.step1.cityFrom.name}, ${requestData.step1.cityFrom.country.toUpperCase()}`;
                        }
                        if (requestData?.step1?.cityFrom?.name) return requestData.step1.cityFrom.name;
                        
                        // Priorité 3: Données alternatives
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
                        // Priorité 1: Données du shipment (DraftQuote.shipment.destination)
                        if (requestData?.shipment?.destination?.location && requestData?.shipment?.destination?.country) {
                          return `${requestData.shipment.destination.location}, ${requestData.shipment.destination.country.toUpperCase()}`;
                        }
                        if (requestData?.shipment?.destination?.location) return requestData.shipment.destination.location;
                        
                        // Priorité 2: Données du step1
                        if (requestData?.step1?.cityTo?.name && requestData?.step1?.cityTo?.country) {
                          return `${requestData.step1.cityTo.name}, ${requestData.step1.cityTo.country.toUpperCase()}`;
                        }
                        if (requestData?.step1?.cityTo?.name) return requestData.step1.cityTo.name;
                        
                        // Priorité 3: Données alternatives
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
                        // Priorité 1: Données au niveau racine (DraftQuote.incoterm)
                        if (requestData?.incoterm) return requestData.incoterm;
                        
                        // Priorité 2: Données du step1
                        if (requestData?.step1?.incotermName) return requestData.step1.incotermName;
                        if (requestData?.step1?.incoterm) return requestData.step1.incoterm;
                        if (requestData?.step1?.cargo?.incoterm) return requestData.step1.cargo.incoterm;
                        
                        // Priorité 3: Données alternatives
                        if (requestData?.incotermName) return requestData.incotermName;
                        if (requestData?.incoterms) return requestData.incoterms;
                        
                        return '-';
                      })()}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <LocalShippingIcon sx={{ color: '#9b59b6', mr: 1 }} />
                    <Typography variant="subtitle1" sx={{ fontWeight: 500 }}>
                      <strong>{t('requestWizard.step3.product')}:</strong> {(() => {
                        // Priorité 1: Données du shipment (DraftQuote.shipment.commodity)
                        if (requestData?.shipment?.commodity?.productName) return requestData.shipment.commodity.productName;
                        if (requestData?.shipment?.commodity) return requestData.shipment.commodity;
                        
                        // Priorité 2: Données du step1
                        if (requestData?.step1?.productName?.productName) return requestData.step1.productName.productName;
                        if (requestData?.step1?.cargo?.product?.productName) return requestData.step1.cargo.product.productName;
                        
                        // Priorité 3: Données alternatives
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
                        // Priorité 1: Données au niveau racine
                        if (requestData?.comment) return requestData.comment;
                        
                        // Priorité 2: Données du step1
                        if (requestData?.step1?.comment) return requestData.step1.comment;
                        if (requestData?.step1?.metadata?.comment) return requestData.step1.metadata.comment;
                        
                        // Priorité 3: Données alternatives
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
              {selectedContainers && selectedContainers.list && selectedContainers.list.length > 0 ? (
                <Box sx={{ mt: 4, mb: 2 }}>
                  <ContainersDisplay 
                    containers={selectedContainers.list}
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
      
      {/* Section Ports - Accordéon indépendant */}
      <Accordion defaultExpanded={false} sx={{ mb: 4, borderRadius: 3, boxShadow: '0 4px 24px rgba(0,0,0,0.07)', background: 'linear-gradient(135deg, #e3f0ff 0%, #f5f7fa 100%)' }}>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <DirectionsBoatIcon sx={{ color: '#1976d2', mr: 1 }} />
            <Typography variant="h6" sx={{ fontWeight: 600, color: '#1976d2' }}>
              {t('departurePort', 'Departure port')} & {t('destinationPort', 'Destination port')}
            </Typography>
          </Box>
        </AccordionSummary>
        <AccordionDetails>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <DirectionsBoatIcon sx={{ color: '#2980b9', mr: 1 }} />
                <Typography variant="body1" sx={{ fontWeight: 500 }}>
                  <strong>{t('departurePort', 'Departure port')}:</strong> {departurePortName}
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} md={6}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <DirectionsBoatIcon sx={{ color: '#16a085', mr: 1 }} />
                <Typography variant="body1" sx={{ fontWeight: 500 }}>
                  <strong>{t('destinationPort', 'Destination port')}:</strong> {destinationPortName}
                </Typography>
              </Box>
            </Grid>
            {/* Ajout du rappel TEU sous les ports + détail containers (calculé depuis selectedContainers) */}
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, gap: 3 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 600, color: '#f39c12' }}>
                  {t('requestWizard.step5.totalTEU')}: <b>{availableTEU.toLocaleString(undefined, { maximumFractionDigits: 2 })}</b>
                </Typography>
              </Box>
              {Array.isArray(selectedContainers?.list) && selectedContainers.list.length > 0 && (
                <Box sx={{ mb: 2, ml: 1 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#1976d2', mb: 0.5 }}>
                    {t('requestWizard.step5.selectedContainers')} :
                  </Typography>
                  {selectedContainers.list.map((c: any, idx: number) => (
                    <Typography key={idx} sx={{ fontSize: 15, color: '#333', ml: 1 }}>
                      {c.quantity} x {c.containerType || c.type} ({(getTEU(c.containerType || c.type) * (c.quantity ?? 1)).toLocaleString(undefined, { maximumFractionDigits: 2 })} TEU)
                    </Typography>
                  ))}
                </Box>
              )}
            </Grid>
          </Grid>
        </AccordionDetails>
      </Accordion>
      
      {/* Filtres maritimes avec PortAutocomplete pour les ports */}
      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <Card sx={{ mb: 3, borderRadius: 3, boxShadow: '0 4px 24px rgba(25,118,210,0.07)', p: 2 }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={6} md={3}>
              <PortAutocomplete
                label={t('requestWizard.step5.departurePort')}
                value={filterDeparturePort ? { name: filterDeparturePort } : null}
                onChange={port => setFilterDeparturePort(port?.name || '')}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <PortAutocomplete
                label={t('requestWizard.step5.arrivalPort')}
                value={filterArrivalPort ? { name: filterArrivalPort } : null}
                onChange={port => setFilterArrivalPort(port?.name || '')}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Autocomplete
                options={carrierOptions}
                value={filterCarrier}
                onChange={(_, value) => setFilterCarrier((value ?? null) as string | null)}
                renderInput={(params) => <TextField {...params} label={t('requestWizard.step5.carrier')} variant="outlined" size="small" />}
                clearOnEscape
                isOptionEqualToValue={(option, value) => option === value}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <DatePicker
                label={t('requestWizard.step5.validUntil')}
                value={filterValidUntil}
                onChange={setFilterValidUntil}
                slotProps={{ textField: { size: 'small', variant: 'outlined' } }}
                format="DD/MM/YYYY"
              />
            </Grid>
          </Grid>
        </Card>
      </LocalizationProvider>
      {/* Barre de recherche globale */}
      <Box sx={{ mb: 2 }}>
        <TextField
          fullWidth
          size="small"
          variant="outlined"
          placeholder={t('requestWizard.step5.searchSeafreightPlaceholder')}
          value={searchText}
          onChange={e => setSearchText(e.target.value)}
        />
      </Box>

      {/* === ALERTES TEU ET DÉTAILS DES SURCHARGES === */}
      <Fade in={selectedSeafreights.length > 0} timeout={400}>
        <div ref={teuAlertRef}>
          {selectedSeafreights.length > 0 && (
            <>
              {/* Alerte TEU */}
              <Alert 
                severity={isTEUExceeded ? "warning" : "info"} 
                sx={{ mb: 2, animation: isTEUExceeded ? 'shake 0.3s' : undefined }}
                icon={isTEUExceeded ? "⚠️" : "📊"}
              >
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  {getTEUInfoMessage() || `📊 ${selectedSeafreights.length} offre(s) sélectionnée(s)`}
                </Typography>
                {isTEUExceeded && (
                  <Typography variant="body2" sx={{ mt: 1, color: '#d32f2f' }}>
                    {getTEUWarningMessage()}
                  </Typography>
                )}
              </Alert>
              
            </>
          )}
        </div>
      </Fade>

      {loading && <CircularProgress sx={{ my: 4 }} />}
      {error && <Alert severity="error">{error}</Alert>}
      {!loading && !error && paginatedOffers.length > 0 && (
        <Card sx={{ borderRadius: 3, boxShadow: '0 10px 30px rgba(25,118,210,0.10)', background: '#e3f0ff' }}>
          <CardContent>
            {/* Affichage du badge nombre d'offres sélectionnées */}
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Badge color="primary" badgeContent={selectedCount} showZero sx={{ mr: 2 }}>
                <DirectionsBoatIcon fontSize="large" color="primary" />
              </Badge>
              <Typography variant="h6" sx={{ fontWeight: 600, color: '#1976d2' }}>
                {t('requestWizard.step5.availableOffers')} {selectedCount > 0 && `— ${selectedCount} sélectionnée${selectedCount > 1 ? 's' : ''}`}
              </Typography>
              {selectedCount === 0 && (
                <Typography variant="body2" sx={{ ml: 2, color: '#666', fontStyle: 'italic' }}>
                  (Sélectionnez un ou plusieurs seafreights)
                </Typography>
              )}
            </Box>
            <TableContainer component={Paper} sx={{ borderRadius: 2, overflowX: 'auto', background: '#fff', boxShadow: '0 2px 8px #1976d220' }}>
              <Table size="small">
                <TableHead>
                  <TableRow sx={{ background: 'linear-gradient(90deg, #1976d2 0%, #7b1fa2 100%)' }}>
                    <TableCell>{/* Checkbox */}</TableCell>
                    <TableCell sx={{ color: '#fff', fontWeight: 700 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <DirectionsBoatIcon sx={{ verticalAlign: 'middle', mr: 1 }} fontSize="small" />
                        {t('requestWizard.step5.carrier')}
                      </Box>
                    </TableCell>
                    <TableCell sx={{ color: '#fff', fontWeight: 700 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <LocationOnIcon sx={{ verticalAlign: 'middle', mr: 1 }} fontSize="small" />
                        {t('requestWizard.step5.departurePort')}
                      </Box>
                    </TableCell>
                    <TableCell sx={{ color: '#fff', fontWeight: 700 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <LocationOnIcon sx={{ verticalAlign: 'middle', mr: 1 }} fontSize="small" />
                        {t('requestWizard.step5.arrivalPort')}
                      </Box>
                    </TableCell>
                    <TableCell sx={{ color: '#fff', fontWeight: 700 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <CategoryIcon sx={{ verticalAlign: 'middle', mr: 1 }} fontSize="small" />
                        {t('requestWizard.step5.container')}
                      </Box>
                    </TableCell>
                    <TableCell sx={{ color: '#fff', fontWeight: 700 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <EuroIcon sx={{ verticalAlign: 'middle', mr: 1 }} fontSize="small" />
                        {t('requestWizard.step5.baseFreightLabel')}
                      </Box>
                    </TableCell>
                    <TableCell sx={{ color: '#fff', fontWeight: 700 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <EuroIcon sx={{ verticalAlign: 'middle', mr: 1 }} fontSize="small" />
                        {t('requestWizard.step5.totalLabel')}
                      </Box>
                    </TableCell>
                    <TableCell sx={{ color: '#fff', fontWeight: 700 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <CalendarMonthIcon sx={{ verticalAlign: 'middle', mr: 1 }} fontSize="small" />
                        {t('requestWizard.step5.validUntil')}
                      </Box>
                    </TableCell>
                    <TableCell sx={{ color: '#fff', fontWeight: 700 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <AccessTimeIcon sx={{ verticalAlign: 'middle', mr: 1 }} fontSize="small" />
                        {t('requestWizard.step5.transitLabel')}
                      </Box>
                    </TableCell>
                    <TableCell sx={{ color: '#fff', fontWeight: 700 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <RepeatIcon sx={{ verticalAlign: 'middle', mr: 1 }} fontSize="small" />
                        {t('requestWizard.step5.frequencyLabel')}
                      </Box>
                    </TableCell>
                    <TableCell sx={{ color: '#fff', fontWeight: 700 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <CategoryIcon sx={{ verticalAlign: 'middle', mr: 1 }} fontSize="small" />
                        {t('requestWizard.step5.quantity')}
                      </Box>
                    </TableCell>
                    <TableCell align="center" sx={{ color: '#fff', fontWeight: 700 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <CheckCircleIcon sx={{ verticalAlign: 'middle', mr: 1 }} fontSize="small" />
                        {t('requestWizard.step5.select')}
                      </Box>
                    </TableCell>
                    <TableCell align="center" sx={{ color: '#fff', fontWeight: 700 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <VisibilityIcon sx={{ verticalAlign: 'middle', mr: 1 }} fontSize="small" />
{t('requestWizard.step5.details')}
                      </Box>
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {paginatedOffers.map((offer, idx) => {
                    const offerId = offer.id || '';
                    // Logique de sélection unifiée : utiliser selectedSeafreightIds
                    const isSelected = selectedSeafreightIds.includes(offerId);
                    const totalPrice = calculateTotalPrice(offer.charges, offer.currency || undefined);
                    

                    return (
                      <TableRow key={offer.id ?? idx.toString()} hover selected={isSelected} sx={{
                        transition: 'background 0.2s',
                        background: isSelected ? 'linear-gradient(90deg, #e3f0ff 60%, #b3e5fc 100%)' : undefined,
                        borderLeft: isSelected ? '6px solid #1976d2' : '6px solid transparent',
                        boxShadow: isSelected ? '0 2px 12px #1976d233' : undefined
                      }}>
                        <TableCell padding="checkbox">
                          <Checkbox
                            color="primary"
                            checked={isSelected}
                            onChange={() => {
                              console.log('🔧 [STEP5] Checkbox cliquée pour offer:', offer.id, 'isSelected:', isSelected);
                              handleToggleSeafreight(offer);
                            }}
                            inputProps={{ 'aria-label': 'select seafreight offer' }}
                          />
                        </TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>
                          {offer.carrier?.name || '-'}
                        </TableCell>
                        <TableCell>
                          {offer.departurePort?.name || '-'}
                        </TableCell>
                        <TableCell>
                          {offer.arrivalPort?.name || '-'}
                        </TableCell>
                        <TableCell>
                          {offer.containerType || '-'}
                        </TableCell>
                        <TableCell>
                          {offer.charges?.basePrice ?? '-'} {offer.currency || ''}
                        </TableCell>
                        <TableCell>
                          <Tooltip
                            title={
                              <div>
                                <div>Base freight : {offer.charges?.basePrice?.toLocaleString(undefined, { maximumFractionDigits: 2 })} {offer.currency || ''}</div>
                                {Array.isArray(offer.charges?.surcharges) && offer.charges.surcharges.length > 0 && offer.charges.surcharges.map((s: any, idx: number) => (
                                  <div key={idx}>
                                    {s.name || s.type} : {(s.amount || s.value || 0).toLocaleString(undefined, { maximumFractionDigits: 2 })} {s.currency || offer.currency || ''}
                                  </div>
                                ))}
                                <div style={{ fontWeight: 700, marginTop: 4 }}>
                                  Total : {typeof offer.charges?.total === 'number' ? offer.charges.total.toLocaleString(undefined, { maximumFractionDigits: 2 }) : '-'} {offer.currency || ''}
                                </div>
                              </div>
                            }
                            arrow
                            placement="top"
                          >
                            <span>
                              {typeof offer.charges?.total === 'number'
                                ? offer.charges.total.toLocaleString(undefined, { maximumFractionDigits: 2 })
                                : '-'} {offer.currency || ''}
                            </span>
                          </Tooltip>
                        </TableCell>
                        <TableCell>
                          {offer.validity?.endDate ? (dayjs(offer.validity.endDate).isValid() ? dayjs(offer.validity.endDate).format('DD/MM/YYYY') : '-') : '-'}
                        </TableCell>
                        <TableCell>
                          {offer.transitTimeDays ?? '-'}
                        </TableCell>
                        <TableCell>
                          {offer.frequency ?? '-'}
                        </TableCell>
                        <TableCell>
                          <TextField
                            type="number"
                            size="small"
                            variant="outlined"
                            value={containerQuantities[offer.containerType || ''] ?? 1}
                            onChange={(e) => handleContainerQuantityChange(offer.containerType || '', Math.max(1, Number(e.target.value)))}
                            inputProps={{ 
                              min: 1, 
                              style: { width: 60, textAlign: 'center' },
                              'aria-label': `Quantity for ${offer.containerType || 'container'}`
                            }}
                            sx={{ 
                              '& .MuiOutlinedInput-root': { 
                                height: 32,
                                '& input': { textAlign: 'center', fontSize: '0.875rem' }
                              }
                            }}
                          />
                        </TableCell>
                        <TableCell align="center">
                          <Button
                            variant={isSelected ? "contained" : "outlined"}
                            color="primary"
                            size="small"
                            onClick={() => {
                              console.log('🔧 [STEP5] Bouton cliqué pour offer:', offer.id, 'isSelected:', isSelected);
                              handleToggleSeafreight(offer);
                            }}
                            sx={{ fontWeight: 600, minWidth: 90 }}
                          >
                            {isSelected 
                              ? t('requestWizard.step5.deselect')
                              : t('requestWizard.step5.select')
                            }
                          </Button>
                        </TableCell>
                        <TableCell align="center">
                          <Tooltip title={t('requestWizard.step5.details')} arrow>
                            <IconButton
                              size="small"
                              onClick={() => handleOpenDetailsModal(offer)}
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
      {!loading && !error && paginatedOffers.length === 0 && (
        <Box sx={{ mt: 4 }}>
          <Alert severity="info" sx={{ mb: 2 }}>
            {t('requestWizard.step5.noOffers')}
          </Alert>
        </Box>
      )}
      
      {/* Panier avec OfferBasketDrawerAccordion */}
              <OfferBasketDrawerAccordion
          selectedHaulage={selectedHaulage}
          selectedSeafreight={draftQuote?.step5?.selections?.[0] || null}
          selectedMiscellaneous={selectedMiscellaneous || []}
        services={services}
        contacts={contacts}
        onRemoveMisc={onRemoveMisc}
        currentStep={4}
        requestData={requestData}
        selectedServices={selectedServices}
        selectedContainers={selectedContainers}
      >
        <Box sx={{ mt: 4 }} />
      </OfferBasketDrawerAccordion>
      


      {/* Modal de détails de l'offre seafreight */}
      <Modal
        open={isDetailsModalOpen}
        onClose={handleCloseDetailsModal}
        aria-labelledby="seafreight-details-modal"
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
                <DirectionsBoatIcon />
              </Avatar>
              <Box>
                <Typography variant="h5" sx={{ fontWeight: 700, mb: 0.5 }}>
                  Détails de l'offre maritime
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                  {selectedOfferForDetails?.carrier?.name || 'Transporteur'} - {selectedOfferForDetails?.containerType || 'Container'}
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
            {selectedOfferForDetails && (
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
                            <DirectionsBoatIcon sx={{ color: '#1976d2', mr: 1, fontSize: '1.2em' }} />
                            <Typography variant="body2" sx={{ fontWeight: 600 }}>
                              Transporteur: {selectedOfferForDetails.carrier?.name || '-'}
                            </Typography>
                          </Box>
                        </Grid>
                        <Grid item xs={12}>
                          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                            <CategoryIcon sx={{ color: '#9b59b6', mr: 1, fontSize: '1.2em' }} />
                            <Typography variant="body2" sx={{ fontWeight: 600 }}>
                              Type de container: {selectedOfferForDetails.containerType || '-'}
                            </Typography>
                          </Box>
                        </Grid>
                        <Grid item xs={12}>
                          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                            <LanguageIcon sx={{ color: '#27ae60', mr: 1, fontSize: '1.2em' }} />
                            <Typography variant="body2" sx={{ fontWeight: 600 }}>
                              Devise: {selectedOfferForDetails.currency || 'EUR'}
                            </Typography>
                          </Box>
                        </Grid>
                        <Grid item xs={12}>
                          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                            <RepeatIcon sx={{ color: '#e67e22', mr: 1, fontSize: '1.2em' }} />
                            <Typography variant="body2" sx={{ fontWeight: 600 }}>
                              Fréquence: {selectedOfferForDetails.frequency || '-'}
                            </Typography>
                          </Box>
                        </Grid>
                      </Grid>
                    </CardContent>
                  </Card>
                </Grid>

                {/* Route et ports */}
                <Grid item xs={12} md={6}>
                  <Card sx={{ mb: 3, borderRadius: 2, boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
                    <CardContent>
                      <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: '#1976d2', display: 'flex', alignItems: 'center' }}>
                        <RouteIcon sx={{ mr: 1 }} />
                        Route et ports
                      </Typography>
                      <Grid container spacing={2}>
                        <Grid item xs={12}>
                          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                            <LocationOnIcon sx={{ color: '#e74c3c', mr: 1, fontSize: '1.2em' }} />
                            <Typography variant="body2" sx={{ fontWeight: 600 }}>
                              Port de départ: {selectedOfferForDetails.departurePort?.name || '-'}
                            </Typography>
                          </Box>
                        </Grid>
                        <Grid item xs={12}>
                          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                            <LocationOnIcon sx={{ color: '#27ae60', mr: 1, fontSize: '1.2em' }} />
                            <Typography variant="body2" sx={{ fontWeight: 600 }}>
                              Port d'arrivée: {selectedOfferForDetails.arrivalPort?.name || '-'}
                            </Typography>
                          </Box>
                        </Grid>
                        <Grid item xs={12}>
                          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                            <AccessTimeIcon sx={{ color: '#f39c12', mr: 1, fontSize: '1.2em' }} />
                            <Typography variant="body2" sx={{ fontWeight: 600 }}>
                              Temps de transit: {selectedOfferForDetails.transitTimeDays || '-'} jours
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
                        <AttachMoneyIcon sx={{ mr: 1 }} />
                        Tarification détaillée
                      </Typography>
                      
                      <Grid container spacing={3}>
                        {/* Prix de base */}
                        <Grid item xs={12} md={4}>
                          <Box sx={{ textAlign: 'center', p: 2, background: 'linear-gradient(135deg, #e8f5e8 0%, #c8e6c9 100%)', borderRadius: 2 }}>
                            <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                              Prix de Base
                            </Typography>
                            <Typography variant="h5" sx={{ fontWeight: 700, color: '#2e7d32' }}>
                              {selectedOfferForDetails.charges?.basePrice?.toLocaleString(undefined, { maximumFractionDigits: 2 }) || '0.00'} {selectedOfferForDetails.currency || 'EUR'}
                            </Typography>
                          </Box>
                        </Grid>

                        {/* Surcharges */}
                        <Grid item xs={12} md={4}>
                          <Box sx={{ textAlign: 'center', p: 2, background: 'linear-gradient(135deg, #fff3e0 0%, #ffe0b2 100%)', borderRadius: 2 }}>
                            <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                              Surcharges ({selectedOfferForDetails.charges?.surcharges?.length || 0})
                            </Typography>
                            <Typography variant="h5" sx={{ fontWeight: 700, color: '#e65100' }}>
                              {(() => {
                                const surcharges = selectedOfferForDetails.charges?.surcharges || [];
                                const totalSurcharges = surcharges.reduce((sum: number, s: any) => sum + (s.value || 0), 0);
                                return `${totalSurcharges.toLocaleString(undefined, { maximumFractionDigits: 2 })} ${selectedOfferForDetails.currency || 'EUR'}`;
                              })()}
                            </Typography>
                          </Box>
                        </Grid>

                        {/* Total */}
                        <Grid item xs={12} md={4}>
                          <Box sx={{ textAlign: 'center', p: 2, background: 'linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%)', borderRadius: 2 }}>
                            <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                              Total Final
                            </Typography>
                            <Typography variant="h5" sx={{ fontWeight: 700, color: '#1565c0' }}>
                              {(() => {
                                const total = calculateTotalPrice(selectedOfferForDetails.charges, selectedOfferForDetails.currency).total;
                                return `${total.toLocaleString(undefined, { maximumFractionDigits: 2 })} ${selectedOfferForDetails.currency || 'EUR'}`;
                              })()}
                            </Typography>
                          </Box>
                        </Grid>
                      </Grid>

                      {/* Détail des surcharges */}
                      {selectedOfferForDetails.charges?.surcharges && selectedOfferForDetails.charges.surcharges.length > 0 && (
                        <Box sx={{ mt: 3 }}>
                          <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2, color: '#333' }}>
                            Détail des surcharges:
                          </Typography>
                          <TableContainer component={Paper} sx={{ borderRadius: 2 }}>
                            <Table size="small">
                              <TableHead>
                                <TableRow sx={{ background: 'linear-gradient(135deg, #f5f5f5 0%, #e0e0e0 100%)' }}>
                                  <TableCell sx={{ fontWeight: 600 }}>Nom</TableCell>
                                  <TableCell sx={{ fontWeight: 600 }}>Type</TableCell>
                                  <TableCell sx={{ fontWeight: 600 }}>Valeur</TableCell>
                                  <TableCell sx={{ fontWeight: 600 }}>Obligatoire</TableCell>
                                </TableRow>
                              </TableHead>
                              <TableBody>
                                {selectedOfferForDetails.charges.surcharges.map((surcharge: any, index: number) => (
                                  <TableRow key={index}>
                                    <TableCell>{surcharge.name || `Surcharge ${index + 1}`}</TableCell>
                                    <TableCell>{surcharge.type || '-'}</TableCell>
                                    <TableCell>
                                      {surcharge.value?.toLocaleString(undefined, { maximumFractionDigits: 2 }) || '0.00'} {surcharge.currency || selectedOfferForDetails.currency || 'EUR'}
                                    </TableCell>
                                    <TableCell>
                                      <Chip
                                        label={surcharge.isMandatory ? 'Oui' : 'Non'}
                                        color={surcharge.isMandatory ? 'error' : 'default'}
                                        size="small"
                                      />
                                    </TableCell>
                                  </TableRow>
                                ))}
                              </TableBody>
                            </Table>
                          </TableContainer>
                        </Box>
                      )}
                    </CardContent>
                  </Card>
                </Grid>

                {/* Validité et remarques */}
                <Grid item xs={12} md={6}>
                  <Card sx={{ mb: 3, borderRadius: 2, boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
                    <CardContent>
                      <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: '#1976d2', display: 'flex', alignItems: 'center' }}>
                        <ScheduleIcon sx={{ mr: 1 }} />
                        Validité
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <CalendarMonthIcon sx={{ color: '#e67e22', mr: 1, fontSize: '1.2em' }} />
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          Valide jusqu'au: {selectedOfferForDetails.validity?.endDate ? dayjs(selectedOfferForDetails.validity.endDate).format('DD/MM/YYYY') : '-'}
                        </Typography>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>

                {/* Remarques */}
                <Grid item xs={12} md={6}>
                  <Card sx={{ mb: 3, borderRadius: 2, boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
                    <CardContent>
                      <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: '#1976d2', display: 'flex', alignItems: 'center' }}>
                        <InfoIcon sx={{ mr: 1 }} />
                        Remarques
                      </Typography>
                      <Typography variant="body2" sx={{ fontStyle: 'italic', color: '#666' }}>
                        {selectedOfferForDetails.remarks || 'Aucune remarque particulière'}
                      </Typography>
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
{t('requestWizard.step5.close')}
            </Button>
            {selectedOfferForDetails && (
              <Button
                variant="contained"
                onClick={() => {
                  handleToggleSeafreight(selectedOfferForDetails);
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
{selectedSeafreightIds.includes(selectedOfferForDetails.id || '') ? t('requestWizard.step5.deselect') : t('requestWizard.step5.selectThisOffer')}
              </Button>
            )}
          </Box>
        </Box>
      </Modal>

    </Box>
  );
};

export default Step5SeafreightSelection; 

// Ajout du style shake
const shakeKeyframes = `
@keyframes shake {
  0% { transform: translateX(0); }
  20% { transform: translateX(-8px); }
  40% { transform: translateX(8px); }
  60% { transform: translateX(-8px); }
  80% { transform: translateX(8px); }
  100% { transform: translateX(0); }
}`;

// Injection du style global
if (typeof window !== 'undefined' && !document.getElementById('shake-keyframes')) {
  const style = document.createElement('style');
  style.id = 'shake-keyframes';
  style.innerHTML = shakeKeyframes;
  document.head.appendChild(style);
} 