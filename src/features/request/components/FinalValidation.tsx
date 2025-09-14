import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  Stack,
  Divider,
  TextField,
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  InputAdornment,
  Alert,
  CircularProgress,
  Card,
  CardContent,
  Grid,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormHelperText,
  InputLabel,
  MenuItem,
  Select,
  Snackbar,
  Tabs,
  Tab
} from '@mui/material';
import {
  CheckCircleOutline as CheckIcon,
  Edit as EditIcon,
  Save as SaveIcon,
  Send as SendIcon,
  AttachFile as AttachFileIcon,
  MonetizationOn as MonetizationOnIcon,
  LocalShipping as LocalShippingIcon,
  DirectionsBoat as DirectionsBoatIcon,
  Inventory as InventoryIcon,
  Person as PersonIcon,
  Business as BusinessIcon,
  Description as DescriptionIcon
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { getTotalPrice } from '../../../utils/functions';
// Imports commentés - endpoints supprimés de la nouvelle API
// import { postApiQuoteOffer, putApiQuoteOfferByIdStatus } from '@features/offer/api';
import type { QuoteOptionDto, HaulageOptionDto, SeaFreightOptionDto, MiscellaneousOptionDto, DeliveryAddressDto, PortDto, AddressDto, ContainerOptionDto, OptionTotalsDto } from '@features/offer/api';
// import { CreateQuoteOfferViewModel } from '@features/offer/api/types.gen';
import { postApiEmail } from '@features/request/api';
import { useMsal, useAccount } from '@azure/msal-react';
import { enqueueSnackbar } from 'notistack';
import { useQuery, useMutation } from '@tanstack/react-query';
import { getUserGroupUsersOptions } from '@features/request/api/@tanstack/react-query.gen';
import { postApiQuoteOfferDraftMutation, postApiQuoteFromDraftMutation } from '@features/offer/api';
// import { getUserGroupUsersByUserId } from '@features/request/api/sdk.gen'; // Plus utilisé
import AssigneeField from '@components/shared/AssigneeField';
// === NOUVEAUX IMPORTS POUR JSON ===
import { QuoteJsonGenerator } from '../services/QuoteJsonGenerator';
import { QuoteValidator } from '../services/QuoteValidator';
import { QuoteExporter } from '../services/QuoteExporter';

interface FinalValidationProps {
  selectedOption: any;
  allOptions?: any[]; // Toutes les options disponibles
  onBack: () => void;
  onValidate: (validationData: any) => Promise<void>;
  isCreatingQuote: boolean;
  requestId?: string;
}

function formatAddress(addr: any) {
  if (!addr) return '';
  if (typeof addr === 'string') return addr;
  return [addr.addressLine, addr.city, addr.postalCode, addr.country].filter(Boolean).join(', ');
}

const FinalValidation: React.FC<FinalValidationProps> = ({
  selectedOption,
  allOptions = [],
  onBack,
  onValidate,
  isCreatingQuote,
  requestId
}): JSX.Element => {
  const { t } = useTranslation();
  const { accounts } = useMsal();
  const account = useAccount(accounts[0] || {});
  const [marginType, setMarginType] = useState<'percent' | 'fixed'>(selectedOption?.marginType || 'percent');
  const [marginValue, setMarginValue] = useState<number>(selectedOption?.marginValue || 0);
  const [clientComment, setClientComment] = useState<string>('');
  const [internalComment, setInternalComment] = useState<string>('');
  const [paymentTerms, setPaymentTerms] = useState<string>('À 30 jours');
  const [deliveryTerms, setDeliveryTerms] = useState<string>('À définir');
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [assignee, setAssignee] = useState<string>("");
  const [attachments, setAttachments] = useState<File[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showFeedback, setShowFeedback] = useState<{ type: 'success' | 'error', message: string } | null>(null);
  const [showPayloadModal, setShowPayloadModal] = useState(false);
  const [payloadData, setPayloadData] = useState<any>(null);
  const [payloadTabValue, setPayloadTabValue] = useState(1); // Utiliser le payload minimaliste par défaut
  // === NOUVELLES VARIABLES POUR JSON ===
  const [showJsonPreview, setShowJsonPreview] = useState(false);
  const [quoteJsonData, setQuoteJsonData] = useState<any>(null);
  const [jsonValidation, setJsonValidation] = useState<any>(null);
  const [exportFormat, setExportFormat] = useState<'json' | 'minified'>('json');

  // === CALCULS IDENTIQUES À COMPAREOPTIONS ===
  
  // === CALCULS CORRIGÉS SELON LA FORMULE ===
  // Total = (Haulage × quantité) + (Seafreight tariff × quantité) + (Miscellaneous tariffs) + Marge
  
  // Fonction pour calculer le total haulage
  const computeHaulageTotal = (option: any) => {
    const haulageTariff = option.selectedHaulage?.unitTariff || 0;
    const haulageQuantity = option.haulageQuantity ?? 1;
    return haulageTariff * haulageQuantity;
  };

  // Fonction pour calculer le total seafreight
  const computeSeafreightTotal = (option: any) => {
    const seafreights = Array.isArray(option.selectedSeafreights) ? option.selectedSeafreights : [];
    const seafreightQuantities = option.seafreightQuantities || {};
    let total = 0;
    
    // Debug des seafreights
    
    seafreights.forEach((offer: any, index: number) => {
      const qty = seafreightQuantities[offer.id] ?? 1;
      
      // Essayer plusieurs sources pour le prix
      let basePrice = 0;
      if (typeof offer.charges?.basePrice === 'number') {
        basePrice = offer.charges.basePrice;
        // Prix trouvé via charges.basePrice
      } else if (typeof offer.pricing?.basePrice === 'number') {
        basePrice = offer.pricing.basePrice;
        // Prix trouvé via pricing.basePrice
      } else if (typeof offer.price === 'number') {
        basePrice = offer.price;
        // Prix trouvé via price
      } else if (typeof offer.basePrice === 'number') {
        basePrice = offer.basePrice;
        // Prix trouvé via basePrice
      } else {
        console.warn('[FinalValidation] Aucun prix trouvé pour seafreight', index, ':', offer);
      }
      
      const lineTotal = basePrice * qty;
      total += lineTotal;
      
      // Seafreight ${index} traité
      
      // Surcharges
      const surcharges = Array.isArray(offer.charges?.surcharges) ? offer.charges.surcharges : [];
      const surchargeQuantities = option.surchargeQuantities || {};
      surcharges.forEach((s: any) => {
        const surchargeValue = s.amount || s.value || 0;
        const surchargeQty = surchargeQuantities?.[offer.id]?.[s.name || s.type] ?? qty;
        const surchargeTotal = surchargeValue * surchargeQty;
        total += surchargeTotal;
      });
    });
    
    // Total seafreight calculé
    
    return total;
  };

  // Fonction pour calculer le total miscellaneous
  const computeMiscTotal = (option: any) => {
    const miscs = Array.isArray(option.selectedMiscellaneous) ? option.selectedMiscellaneous : [];
    const miscQuantities = option.miscQuantities || {};
    let total = 0;
    
    // Debug des miscellaneous
    
    miscs.forEach((misc: any, index: number) => {
      const miscId = misc.id || misc.name || misc.designation || `misc-${Date.now()}`;
      const qty = miscQuantities[miscId] ?? 1;
      
      // Essayer plusieurs sources pour le prix
      let basePrice = 0;
      if (typeof misc.pricing?.basePrice === 'number') {
        basePrice = misc.pricing.basePrice;
        // Prix misc trouvé via pricing.basePrice
      } else if (typeof misc.price === 'number') {
        basePrice = misc.price;
        // Prix misc trouvé via price
      } else if (typeof misc.basePrice === 'number') {
        basePrice = misc.basePrice;
        // Prix misc trouvé via basePrice
      } else {
        console.warn('[FinalValidation] Aucun prix trouvé pour miscellaneous', index, ':', misc);
      }
      
      const lineTotal = basePrice * qty;
      total += lineTotal;
      
      console.log('[FinalValidation] Miscellaneous', index, ':', {
        id: miscId,
        qty,
        basePrice,
        lineTotal
      });
    });
    
    console.log('[FinalValidation] Total miscellaneous final:', total);
    console.log('[FinalValidation] === FIN DEBUG MISCELLANEOUS ===');
    
    return total;
  };

  // Fonction pour calculer le costPrice (Total Unit Price)
  const computeCostPrice = (option: any) => {
    const haulageTotal = computeHaulageTotal(option);
    const seafreightTotal = computeSeafreightTotal(option);
    const miscTotal = computeMiscTotal(option);
    return haulageTotal + seafreightTotal + miscTotal;
  };

  // Fonction pour calculer le prix total de vente
  const computeTotalPrice = (option: any) => {
    const costPrice = computeCostPrice(option);
    const marginType = option.marginType || 'percent';
    const marginValue = option.marginValue || 0;
    let marge = 0;
    if (marginType === 'percent') {
      marge = costPrice * (marginValue / 100);
    } else {
      marge = marginValue;
    }
    return costPrice + marge;
  };

  // === CALCULS DES TOTAUX ===
  
  const haulageQty = selectedOption.haulageQuantity ?? 1;
  const haulageTotal = computeHaulageTotal(selectedOption);
  const seafreightTotal = computeSeafreightTotal(selectedOption);
  const miscTotal = computeMiscTotal(selectedOption);
  const costPrice = computeCostPrice(selectedOption);
  const totalPrice = computeTotalPrice(selectedOption);
  
  // Marge actuelle
  const marginAmount = marginType === 'percent' ? (costPrice * marginValue / 100) : marginValue;
  const marginPercentDisplay = marginType === 'percent' ? marginValue : (costPrice ? (marginAmount / costPrice) * 100 : 0);
  
  // Résultats calculés
  
  // Comparaison avec les totaux pré-calculés
  
  // Différences calculées
  
  // Préparer les détails pour l'affichage (basé sur les données existantes)
  const seafreightDetails = selectedOption.selectedSeafreights?.map((sf: any) => ({
    containerType: sf.containerType || '20\' DC',
    qty: selectedOption.seafreightQuantities?.[sf.id] ?? 1,
    unitPrice: sf.charges?.basePrice || 0,
    total: (sf.charges?.basePrice || 0) * (selectedOption.seafreightQuantities?.[sf.id] ?? 1),
    surcharges: sf.charges?.surcharges?.map((s: any) => ({
      name: s.name || s.type,
      qty: selectedOption.surchargeQuantities?.[sf.id]?.[s.name || s.type] ?? 1,
      unitPrice: s.value || s.amount || 0,
      total: (s.value || s.amount || 0) * (selectedOption.surchargeQuantities?.[sf.id]?.[s.name || s.type] ?? 1)
    })) || []
  })) || [];
  
  const miscDetails = selectedOption.selectedMiscellaneous?.map((misc: any) => ({
    serviceName: misc.serviceName || misc.textServices || 'Service',
    providerName: misc.serviceProviderName,
    qty: selectedOption.miscQuantities?.[misc.id] ?? 1,
    unitPrice: misc.pricing?.basePrice || 0,
    total: (misc.pricing?.basePrice || 0) * (selectedOption.miscQuantities?.[misc.id] ?? 1)
  })) || [];
  
  // Calculs identiques à CompareOptions

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
  });

  // === MUTATION POUR CRÉER UN BROUILLON ===
  const createDraftMutation = useMutation({
    ...postApiQuoteOfferDraftMutation(),
    onSuccess: (data) => {
      // Brouillon créé avec succès
    },
    onError: (error) => {
      console.error('[FinalValidation] Erreur lors de la création du brouillon:', error);
      enqueueSnackbar('Erreur lors de la création du brouillon', { variant: "error" });
    }
  });

  // === MUTATION POUR CRÉER LE DEVIS À PARTIR D'UN BROUILLON ===
  const createQuoteMutation = useMutation({
    ...postApiQuoteFromDraftMutation(),
    onSuccess: (data) => {
      enqueueSnackbar('Devis créé avec succès !', { variant: "success" });
    },
    onError: (error) => {
      console.error('[FinalValidation] Erreur lors de la création du devis:', error);
      enqueueSnackbar('Erreur lors de la création du devis.', { variant: "error" });
    }
  });

  // Extraction et validation des données (identique à Step1RequestForm.tsx)
  const assignees = Array.isArray((assigneesData as any)?.data) ? (assigneesData as any).data : [];
  
  // Gestion de l'assigné sélectionné (identique à Step1RequestForm.tsx)
  const assigneeIdStr = assignee ? String(assignee) : '';
  const selectedAssignee = React.useMemo(() => {
    return assignees.find((a: any) => String(a.id) === assigneeIdStr);
  }, [assignees, assigneeIdStr]);

  // Fallback pour les assignés non trouvés (identique à Step1RequestForm.tsx)
  const assigneesWithFallback = React.useMemo(() => {
    return assigneeIdStr && !selectedAssignee
      ? [
          ...assignees,
          { id: assigneeIdStr, displayName: assigneeIdStr, mail: '' }
        ]
      : assignees;
  }, [assignees, assigneeIdStr, selectedAssignee]);

  // Les détails de l'assigné sont déjà disponibles dans selectedAssignee
  // Plus besoin d'appel API supplémentaire
  React.useEffect(() => {
    if (selectedAssignee) {
      console.log('[DEBUG] Assigné sélectionné (FinalValidation):', {
        id: selectedAssignee.id,
        displayName: selectedAssignee.displayName,
        mail: selectedAssignee.mail
      });
    }
  }, [selectedAssignee]);

  // Fonction pour envoyer l'email au client
  const sendEmailToClient = async (quoteOfferId: string, clientEmail: string) => {
    try {
      const emailData = {
        To: clientEmail,
        Subject: `Devis ${quoteOfferId} - LIS Quotes`,
        HtmlContent: `Bonjour,<br><br>Votre devis ${quoteOfferId} a été créé avec succès.<br><br>Vous pouvez le consulter en cliquant sur le lien suivant :<br>[Lien vers le devis]<br><br>Cordialement,<br>L'équipe LIS Quotes`,
        Id: quoteOfferId
      };
      
      await postApiEmail({ body: emailData });
      // Email envoyé au client
    } catch (error) {
      console.error('[FinalValidation] Erreur lors de l\'envoi de l\'email:', error);
      // Ne pas faire échouer la création du devis si l'email échoue
    }
  };

  const handleValidate = () => {
    setShowConfirmDialog(true);
  };

  const handleConfirmValidation = () => {
    setShowConfirmDialog(false);
    
    // Préparer le payload pour affichage
    const enrichedOption = {
      selectedHaulage: selectedOption.selectedHaulage,
      selectedSeafreights: selectedOption.selectedSeafreights || [],
      myMiscs: selectedOption.selectedMiscellaneous || [],
      portDeparture: selectedOption.requestData.portFrom || { name: "Port de départ" },
      portDestination: selectedOption.requestData.portTo || { name: "Port de destination" },
    };

    const quoteData: any = {
      requestQuoteId: requestId ? String(requestId) : null,
      comment: clientComment || selectedOption?.requestData?.comment || "",
      emailUser: account?.username || "",
      selectedOption: 0, // Index de l'option sélectionnée
      options: [enrichedOption],
      files: attachments.map(file => ({
        fileName: file.name,
        contentType: file.type,
        size: file.size,
        uploadedAt: new Date().toISOString(),
        url: null
      })),
      // Champs optionnels mais recommandés
      clientNumber: selectedOption?.requestData?.customer?.contactId?.toString() || null,
      quoteOfferNumber: null, // Sera généré par le backend
      // Métadonnées pour la liaison
      metadata: {
        requestTrackingNumber: selectedOption?.requestData?.trackingNumber || null,
        requestCreatedAt: selectedOption?.requestData?.createdAt || null,
        requestStatus: selectedOption?.requestData?.status || null,
        wizardGenerated: true,
        generatedAt: new Date().toISOString(),
        generatedBy: account?.username || null
      }
    };

    setPayloadData(quoteData);
    setShowPayloadModal(true);
  };

  // === NOUVELLES FONCTIONS POUR JSON ===
  const handleGenerateJsonPreview = () => {
    try {
      const preview = QuoteExporter.generateQuotePreview(selectedOption, allOptions, {
        format: exportFormat
      });
      setQuoteJsonData(preview.json);
      setJsonValidation(preview.validation);
      setShowJsonPreview(true);
    } catch (error) {
      console.error('Erreur lors de la génération du JSON:', error);
      enqueueSnackbar('Erreur lors de la génération du JSON', { variant: 'error' });
    }
  };

  const handleExportJson = async () => {
    try {
      setIsProcessing(true);
      await QuoteExporter.exportQuoteAsJson(selectedOption, allOptions, {
        format: exportFormat,
        filename: `devis_${selectedOption?.requestData?.trackingNumber || 'export'}.json`
      });
      enqueueSnackbar('Devis exporté avec succès', { variant: 'success' });
    } catch (error) {
      console.error('Erreur lors de l\'export:', error);
      enqueueSnackbar('Erreur lors de l\'export du devis', { variant: 'error' });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSendJsonEmail = async () => {
    try {
      setIsProcessing(true);
      const success = await QuoteExporter.sendQuoteEmail(selectedOption, allOptions, {
        to: selectedOption?.requestData?.customer?.email,
        subject: `Devis ${selectedOption?.requestData?.trackingNumber || 'export'}`,
        template: 'maritime_quote'
      }, {
        format: exportFormat
      });
      
      if (success) {
        enqueueSnackbar('Email envoyé avec succès', { variant: 'success' });
      } else {
        enqueueSnackbar('Erreur lors de l\'envoi de l\'email', { variant: 'error' });
      }
    } catch (error) {
      console.error('Erreur lors de l\'envoi:', error);
      enqueueSnackbar('Erreur lors de l\'envoi de l\'email', { variant: 'error' });
    } finally {
      setIsProcessing(false);
    }
  };

    // Fonction helper pour obtenir les données d'adresse de livraison
  const getDeliveryAddressData = () => {
    // Essayer plusieurs sources pour les données d'adresse
    const sources = [
      selectedOption?.requestData,
      allOptions[0]?.requestData,
      selectedOption,
      allOptions[0]
    ];
    
    console.log('[FinalValidation] === DEBUG ADRESSE DE LIVRAISON ===');
    console.log('[FinalValidation] Sources à examiner:', sources.map((source, index) => ({
      index,
      hasSource: !!source,
      hasCustomer: !!source?.customer,
      hasDeliveryLocation: !!source?.deliveryLocation,
      customerName: source?.customer?.contactName,
      companyName: source?.companyName,
      deliveryLocation: source?.deliveryLocation
    })));
    
    let company = '';
    let addressLine = '';
    let city = '';
    let postalCode = '';
    let country = '';
    
    for (const source of sources) {
      if (!company && (source?.customer?.contactName || source?.companyName)) {
        company = source.customer?.contactName || source.companyName;
        console.log('[FinalValidation] Company trouvé:', company);
      }
      if (!addressLine && (source?.deliveryLocation?.addressLine)) {
        addressLine = source.deliveryLocation.addressLine;
        console.log('[FinalValidation] AddressLine trouvé:', addressLine);
      }
      if (!city && (source?.deliveryLocation?.city)) {
        city = source.deliveryLocation.city;
        console.log('[FinalValidation] City trouvé:', city);
      }
      if (!postalCode && (source?.deliveryLocation?.postalCode)) {
        postalCode = source.deliveryLocation.postalCode;
        console.log('[FinalValidation] PostalCode trouvé:', postalCode);
      }
      if (!country && (source?.deliveryLocation?.country)) {
        country = source.deliveryLocation.country;
        console.log('[FinalValidation] Country trouvé:', country);
      }
    }
    
    const result = {
      company: company || 'FOETS DENIS NV',
      addressLine: addressLine || 'Douala Port, Douala, Cameroon',
      city: city || 'Douala',
      postalCode: postalCode || '00000',
      country: country || 'Cameroun'
    };
    
    console.log('[FinalValidation] Résultat final de l\'adresse:', result);
    console.log('[FinalValidation] === FIN DEBUG ADRESSE ===');
    
    return result;
  };

    // Fonction pour créer le payload compatible avec l'API CreateQuoteOfferRequest
  const createMinimalistPayload = (): any => {
    const timestamp = Date.now();
    const deliveryAddressData = getDeliveryAddressData();
    
    console.log('[FinalValidation] Données d\'adresse de livraison récupérées:', deliveryAddressData);
    console.log('[FinalValidation] Sources disponibles:', {
      selectedOption: !!selectedOption,
      selectedOptionRequestData: !!selectedOption?.requestData,
      allOptionsLength: allOptions.length,
      firstOptionRequestData: !!allOptions[0]?.requestData
    });
    
    // Créer toutes les options minimales compatibles avec QuoteOptionDto
    const allMinimalOptions: QuoteOptionDto[] = allOptions.length > 0 ? allOptions.map((option, index) => {
      // === CALCULS CORRIGÉS SELON LA FORMULE ===
      // Total = (Haulage × quantité) + (Seafreight tariff × quantité) + (Miscellaneous tariffs) + Marge
      
      // Calculs avec les nouvelles fonctions
      const haulageTotal = computeHaulageTotal(option);
      const seafreightTotal = computeSeafreightTotal(option);
      const miscTotal = computeMiscTotal(option);
      const costPrice = computeCostPrice(option);
      const totalPrice = computeTotalPrice(option);

      // Créer l'option avec le type correct
      const description = option.name || `Option ${index + 1} - Transport combiné`;
      const quoteOption: QuoteOptionDto = {
        optionId: `option-${index + 1}-${timestamp}`,
        description: description.trim() || `Option ${index + 1} - Transport combiné`,
        
        // Haulage minimal si disponible
        haulage: option.selectedHaulage ? {
          id: `haulage-${index}-${timestamp}`,
          haulierId: 1,
          haulierName: option.selectedHaulage.haulierName || 'SCHENKER NV',
          currency: 'EUR',
          unitTariff: option.selectedHaulage.unitTariff || 0,
          freeTime: 0,
          pickupAddress: {
            company: option.requestData?.customer?.contactName || 'FOETS DENIS NV',
            addressLine: formatAddress(option.requestData?.pickupLocation) || 'Mons, Belgium, Mons, Belgium',
            city: option.requestData?.pickupCity || 'Ville de départ',
            postalCode: '0000',
            country: 'Belgique'
          },
          deliveryPort: {
            portId: 1,
            portName: option.requestData?.portFrom?.name || 'Port de départ',
            country: 'Belgique',
            coordinates: [4.4024, 51.2194]
          },
          comment: 'Transport routier sélectionné',
          validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() as any
        } : undefined,
        
        // Seafreight minimal si disponible
        seaFreight: option.selectedSeafreights && option.selectedSeafreights.length > 0 ? {
          id: `seafreight-${index}-${timestamp}`,
          seaFreightId: option.selectedSeafreights[0]?.id || `sf-${timestamp}`,
          carrierName: option.selectedSeafreights[0]?.carrier?.name || option.selectedSeafreights[0]?.carrierName || 'SCHENKER NV',
          carrierAgentName: option.selectedSeafreights[0]?.carrier?.name || option.selectedSeafreights[0]?.carrierName || 'SCHENKER NV',
          departurePort: {
            portId: 1,
            portName: option.selectedSeafreights[0]?.departurePort?.name || 'ANTWERP',
            country: 'Belgique',
            coordinates: [4.4024, 51.2194]
          },
          destinationPort: {
            portId: 2,
            portName: option.selectedSeafreights[0]?.arrivalPort?.name || 'DOUALA',
            country: 'Pays de destination',
            coordinates: [0, 0]
          },
          currency: 'EUR',
          transitTimeDays: option.selectedSeafreights[0]?.transitTimeDays || 7,
          frequency: 'Hebdomadaire',
          defaultContainer: '20\' DRY',
          containers: [{
            containerId: '1',
            containerType: option.selectedSeafreights[0]?.containerType || '20\' DRY',
            quantity: option.seafreightQuantities?.[option.selectedSeafreights[0]?.id] || 1,
            unitPrice: typeof option.selectedSeafreights[0]?.charges?.basePrice === 'number'
              ? option.selectedSeafreights[0].charges.basePrice
              : seafreightTotal || 0
          }],
          comment: 'Fret maritime sélectionné',
          validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() as any
        } : undefined,
        
        // Miscellaneous minimal si disponible
        miscellaneous: option.selectedMiscellaneous && option.selectedMiscellaneous.length > 0 ? 
          option.selectedMiscellaneous.map((misc: any, miscIndex: number): MiscellaneousOptionDto => ({
            miscellaneousId: `misc-${index}-${miscIndex}-${timestamp}`,
            supplierName: misc.serviceProviderName || 'CHANTECAILLE',
            currency: misc.currency || 'EUR',
            serviceId: miscIndex + 1,
            serviceName: misc.serviceName || misc.textServices || 'Service divers',
            price: misc.pricing?.basePrice || 0,
            validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() as any
          })) : [],
        
        // Adresse de livraison obligatoire
        deliveryAddress: {
          company: deliveryAddressData.company,
          addressLine: deliveryAddressData.addressLine,
          city: deliveryAddressData.city,
          postalCode: deliveryAddressData.postalCode,
          country: deliveryAddressData.country
        },
        
        // Totaux calculés
        totals: {
          haulageTotal: haulageTotal,
          seafreightTotal: seafreightTotal,
          miscellaneousTotal: miscTotal,
          grandTotal: totalPrice
        }
      };

      return quoteOption;
    }) : []; // Fallback vers un tableau vide si pas d'autres options

    // Trouver l'index de l'option sélectionnée
    const selectedOptionIndex = allOptions.findIndex(option => 
      option.id === selectedOption.id || 
      option.name === selectedOption.name ||
      JSON.stringify(option) === JSON.stringify(selectedOption)
    );
    
    // Payload minimaliste compatible avec CreateQuoteOfferRequest
    const payload: any = {
      requestQuoteId: requestId?.toString() || '1',
      clientNumber: selectedOption?.requestData?.customer?.contactId?.toString() || '10',
      emailUser: account?.username || 'clement.dzou@omnifreight.eu',
      comment: clientComment || selectedOption?.requestData?.comment || 'Devis créé via le wizard',
      selectedOption: selectedOptionIndex >= 0 ? selectedOptionIndex : 0, // ✅ Index correct de l'option sélectionnée
      files: attachments?.map(file => ({
        id: `file-${timestamp}`,
        fileName: file.name,
        contentType: file.type,
        size: file.size,
        uploadedAt: new Date().toISOString() as any,
        url: '' // Sera rempli par le backend
      })) || [],
      options: allMinimalOptions
    };

    return payload;
  };

  // Fonction utilitaire pour enrichir les données avec les champs manquants
  const enrichHaulageData = (haulage: any) => {
    if (!haulage) return null;
    
    return {
      ...haulage,
      comment: haulage.comment || "Transport routier sélectionné",
      containerNames: haulage.containers?.map((c: any) => c.containerName) || ["20' DRY", "40' DRY"],
      loadingCityName: haulage.loadingCity || haulage.loadingPort || "Ville de chargement"
    };
  };

  const enrichSeafreightData = (seafreight: any) => {
    if (!seafreight) return null;
    
    return {
      ...seafreight,
      comment: seafreight.comment || "Fret maritime sélectionné",
      carrierName: seafreight.carrierAgentName || seafreight.carrierName || "Transporteur maritime",
      containers: seafreight.services?.map((s: any) => ({
        container: {
          containerId: s.containers?.[0]?.containerId || 0,
          quantity: 1
        },
        services: s.serviceName ? [{
          serviceName: s.serviceName,
          price: s.price || 0
        }] : []
      })) || [],
      defaultContainer: "20' DRY"
    };
  };

  const enrichMiscellaneousData = (miscs: any[]) => {
    if (!miscs || miscs.length === 0) return [];
    
    return miscs.map((misc: any) => ({
      ...misc,
      services: misc.serviceName ? [{
        serviceName: misc.serviceName,
        price: misc.unitPrice || 0
      }] : [],
      containers: [{
        packageId: 1,
        packageName: misc.containerType || "20' DRY"
      }],
      supplierName: misc.supplierName || "Fournisseur divers",
      textServices: misc.serviceName || "Service divers",
      miscellaneousId: misc.id || misc.miscellaneousId || "misc-" + Date.now(),
      defaultContainer: misc.containerType || "20' DRY"
    }));
  };

  const enrichPortData = (port: any, defaultName: string) => {
    if (!port) {
      return {
        portId: 1,
        portName: defaultName,
        country: "Belgique",
        name: defaultName,
        coordinates: [4.4024, 51.2194] // Coordonnées par défaut (Anvers)
      };
    }
    
    return {
      ...port,
      name: port.name || port.portName || port.city || defaultName,
      coordinates: port.coordinates || [4.4024, 51.2194]
    };
  };

  const handleCreateQuote = async () => {
    setShowPayloadModal(false);
    setIsProcessing(true);
    
    try {
      // Utiliser le payload minimaliste si c'est l'onglet actif
      const payloadToUse = payloadTabValue === 1 ? createMinimalistPayload() : payloadData;
      
      console.log('[FinalValidation] Création du devis avec le payload:', payloadTabValue === 1 ? 'minimaliste' : 'complet');
      console.log('[FinalValidation] === PAYLOAD FINAL ===');
      console.log('[FinalValidation] Payload complet:', JSON.stringify(payloadToUse, null, 2));
      console.log('[FinalValidation] === FIN PAYLOAD FINAL ===');
      
      // Debug détaillé du payload minimaliste
      if (payloadTabValue === 1) {
        console.log('[FinalValidation] === DEBUG PAYLOAD MINIMALISTE ===');
        console.log('requestQuoteId:', payloadToUse.requestQuoteId);
        console.log('clientNumber:', payloadToUse.clientNumber);
        console.log('emailUser:', payloadToUse.emailUser);
        console.log('selectedOption:', payloadToUse.selectedOption);
        console.log('options count:', payloadToUse.options?.length);
        
        payloadToUse.options?.forEach((option: any, index: number) => {
          console.log(`Option ${index + 1}:`, {
            optionId: option.optionId,
            description: option.description,
            haulage: option.haulage ? {
              haulierName: option.haulage.haulierName,
              unitTariff: option.haulage.unitTariff
            } : null,
            seaFreight: option.seaFreight ? {
              carrierName: option.seaFreight.carrierName,
              containers: option.seaFreight.containers
            } : null,
            miscellaneous: option.miscellaneous?.length || 0,
            totals: option.totals
          });
        });
      }
      
      // NOUVEAU FLUX : Créer d'abord un brouillon, puis le convertir en devis
      console.log('[FinalValidation] Étape 1: Création du brouillon...');
      
      // Adapter le payload pour la création de brouillon (OptimizedCreateWizardDraftRequest)
      const draftPayload = {
        requestQuoteId: payloadToUse.requestQuoteId || requestId || '',
        emailUser: payloadToUse.emailUser || '',
        clientNumber: payloadToUse.clientNumber || '',
        comment: payloadToUse.comment || '',
        draftData: payloadToUse // Utiliser le payload existant comme draftData
      };
      
      const draftResult = await createDraftMutation.mutateAsync({ 
        body: draftPayload 
      });
      
      console.log('[FinalValidation] Brouillon créé:', draftResult);
      
      // Extraire l'ID du brouillon
      const draftId = (draftResult as any)?.data?.id || (draftResult as any)?.id;
      if (!draftId) {
        throw new Error('Impossible de récupérer l\'ID du brouillon créé');
      }
      
      console.log('[FinalValidation] Étape 2: Conversion du brouillon en devis, draftId:', draftId);
      
      // Créer le devis à partir du brouillon
      const quotePayload = {
        draftId: draftId,
        options: payloadToUse.options || [],
        preferredOptionId: payloadToUse.selectedOption || (payloadToUse.options?.[0]?.optionId),
        expirationDate: null, // ou une date spécifique
        quoteComments: payloadToUse.comment || null
      };
      
      const result = await createQuoteMutation.mutateAsync({ 
        body: quotePayload 
      });
      
      // Le résultat de la mutation peut être de type any, on le traite comme tel
      const resultData = result as any;
      
      if (resultData && resultData.data) {
                    const quoteOfferId = resultData.data.id;
            console.log('[FinalValidation] ID du devis créé:', quoteOfferId);
            console.log('[FinalValidation] Données complètes du devis:', resultData.data);
        
        // 2. Passer le devis en statut PENDING_APPROVAL pour validation superviseur
        // TEMPORAIREMENT DÉSACTIVÉ - Endpoint putApiQuoteOfferByIdStatus supprimé de la nouvelle API
        try {
          console.log('[FinalValidation] Changement de statut temporairement désactivé - endpoint non disponible');
          enqueueSnackbar('Changement de statut temporairement indisponible', { variant: 'warning' });
          // await putApiQuoteOfferByIdStatus({
          //   path: { id: quoteOfferId },
          //   query: { newStatus: 'PENDING_APPROVAL' as any }
          // });
          // console.log('[FinalValidation] Devis passé en attente de validation superviseur');
        } catch (statusError) {
          console.warn('[FinalValidation] Erreur lors du changement de statut:', statusError);
          // Ne pas faire échouer la création si le changement de statut échoue
        }
        
        enqueueSnackbar('Devis créé avec succès ! En attente de validation superviseur.', { variant: "success" });
        
        // 3. Appeler la fonction de validation du parent avec les informations de liaison
        await onValidate({
          selectedOption,
          marginType,
          marginValue,
          totalPrice,
          clientComment,
          internalComment,
          paymentTerms,
          deliveryTerms,
          assignee,
          attachments,
          quoteOfferId,
          // Informations de liaison
          requestQuoteId: requestId,
          requestTrackingNumber: selectedOption?.requestData?.trackingNumber,
          quoteOfferNumber: resultData.data.quoteOfferNumber,
          generatedAt: new Date().toISOString(),
          // Nouveau : statut de validation
          approvalStatus: 'PENDING_APPROVAL',
          supervisorNotification: true
        });
        setShowFeedback({ type: 'success', message: 'Le devis a été créé et est en attente de validation superviseur !' });
        setTimeout(() => setShowFeedback(null), 4000);
        
        // 4. Rediriger vers le nouveau composant QuoteViewer
        setTimeout(() => {
          window.location.href = `/quote-viewer/${quoteOfferId}`;
        }, 2000);
      }
    } catch (error) {
      console.error('[FinalValidation] Erreur lors de la création du devis:', error);
      enqueueSnackbar('Erreur lors de la création du devis.', { variant: "error" });
      setShowFeedback({ type: 'error', message: 'Erreur lors de la création du devis.' });
      setTimeout(() => setShowFeedback(null), 4000);
    } finally {
      setIsProcessing(false);
    }
  };

  if (!selectedOption) {
    return (
      <Box sx={{ textAlign: 'center', py: 4 }}>
        <Typography variant="h6" color="error">Aucune option sélectionnée</Typography>
        <Button variant="contained" onClick={onBack} sx={{ mt: 2 }}>
          Retour à la comparaison
        </Button>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #f5f7fa 0%, #e3f0ff 100%)',
        py: 4
      }}
    >
      {showFeedback && (
        <Snackbar open autoHideDuration={4000} onClose={() => setShowFeedback(null)} anchorOrigin={{ vertical: 'top', horizontal: 'center' }}>
          <Alert severity={showFeedback.type} sx={{ width: '100%' }}>
            {showFeedback.message}
          </Alert>
        </Snackbar>
      )}
      <Paper
        elevation={4}
        sx={{
          maxWidth: 1200,
          mx: 'auto',
          p: { xs: 2, sm: 4 },
          borderRadius: 3,
          boxShadow: '0 8px 32px rgba(25,118,210,0.10)'
        }}
      >
        {/* Header */}
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <CheckIcon sx={{ fontSize: 48, color: 'success.main', mb: 2 }} />
          <Typography variant="h4" sx={{ fontWeight: 700, color: 'primary.main', mb: 1 }}>
            Validation Finale du Devis
          </Typography>
          <Typography variant="h6" color="text.secondary">
            Option sélectionnée : {selectedOption.name}
          </Typography>
        </Box>

        <Grid container spacing={4}>
          {/* Colonne gauche : Récapitulatif de l'option */}
          <Grid item xs={12} md={6}>
            <Typography variant="h6" sx={{ mb: 3, fontWeight: 600, color: 'primary.main' }}>
              Récapitulatif de l'Option
            </Typography>

            {/* Informations client */}
            <Card sx={{ mb: 3, boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <PersonIcon color="primary" sx={{ mr: 1 }} />
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>Client</Typography>
                </Box>
                <Typography><strong>Nom :</strong> {selectedOption.requestData?.customer?.contactName || 'Non défini'}</Typography>
                <Typography><strong>Email :</strong> {selectedOption.requestData?.customer?.email || 'Non défini'}</Typography>
              </CardContent>
            </Card>

            {/* Informations de la demande liée */}
            <Card sx={{ mb: 3, boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <BusinessIcon color="primary" sx={{ mr: 1 }} />
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>Demande liée</Typography>
                </Box>
                <Typography><strong>Numéro de suivi :</strong> {
                  selectedOption.requestData?.requestQuoteNumber
                  || selectedOption.requestData?.quoteNumber
                  || 'Non défini'
                }</Typography>
                <Typography><strong>Statut :</strong> {selectedOption.requestData?.status || 'Non défini'}</Typography>
                <Typography><strong>Créée le :</strong> {selectedOption.requestData?.createdAt ? new Date(selectedOption.requestData.createdAt).toLocaleDateString() : 'Non défini'}</Typography>
                <Typography><strong>Trajet :</strong> {formatAddress(selectedOption.requestData?.pickupLocation) || selectedOption.requestData?.pickupCity} → {formatAddress(selectedOption.requestData?.deliveryLocation) || selectedOption.requestData?.deliveryCity}</Typography>
              </CardContent>
            </Card>

            {/* Haulage */}
            {selectedOption.selectedHaulage && (
              <Card sx={{ mb: 3, boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <LocalShippingIcon color="primary" sx={{ mr: 1 }} />
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>Transport routier</Typography>
                  </Box>
                  <Typography><strong>Transporteur :</strong> {selectedOption.selectedHaulage.haulierName}</Typography>
                  <Typography><strong>Tarif :</strong> {selectedOption.selectedHaulage.unitTariff?.toLocaleString()} €</Typography>
                </CardContent>
              </Card>
            )}

            {/* Seafreight */}
            {selectedOption.selectedSeafreights && selectedOption.selectedSeafreights.length > 0 && (
              <Card sx={{ mb: 3, boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <DirectionsBoatIcon color="primary" sx={{ mr: 1 }} />
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>Fret maritime</Typography>
                  </Box>
                  <Typography>
                    <strong>Transporteur :</strong> {selectedOption.selectedSeafreights[0]?.carrier?.name || selectedOption.selectedSeafreights[0]?.carrierName || '-'}
                  </Typography>
                  <Typography>
                    <strong>Trajet :</strong> {selectedOption.selectedSeafreights[0]?.departurePort?.name || '-'} → {selectedOption.selectedSeafreights[0]?.arrivalPort?.name || '-'}
                  </Typography>
                  <Typography>
                    <strong>Tarif :</strong> {typeof selectedOption.selectedSeafreights[0]?.charges?.total === 'number'
                      ? selectedOption.selectedSeafreights[0].charges.total.toLocaleString()
                      : seafreightTotal.toLocaleString()} €
                  </Typography>
                </CardContent>
              </Card>
            )}

            {/* Services divers */}
            {selectedOption.selectedMiscellaneous && selectedOption.selectedMiscellaneous.length > 0 && (
              <Card sx={{ mb: 3, boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <InventoryIcon color="primary" sx={{ mr: 1 }} />
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>Services divers</Typography>
                  </Box>
                  {selectedOption.selectedMiscellaneous.map((misc: any, index: number) => (
                    <Box key={index} sx={{ mb: 1, p: 1, borderRadius: 1, bgcolor: '#f8f9fa' }}>
                      <Typography>
                        <strong>{misc.serviceName || misc.textServices}</strong>
                        {misc.serviceProviderName && (
                          <> — <span style={{ color: '#888' }}>{misc.serviceProviderName}</span></>
                        )}
                        {misc.applicableContainerTypes && misc.applicableContainerTypes.length > 0 && (
                          <> — <span style={{ color: '#888' }}>{misc.applicableContainerTypes.join(', ')}</span></>
                        )}
                        : <span style={{ color: '#27ae60', fontWeight: 600 }}>
                          {misc.pricing?.basePrice?.toLocaleString() || 0} {misc.currency || 'EUR'}
                        </span>
                      </Typography>
                    </Box>
                  ))}
                  <Typography sx={{ mt: 1, fontWeight: 600 }}>
                    <strong>Total services :</strong> {miscTotal.toLocaleString()} €
                  </Typography>
                </CardContent>
              </Card>
            )}
          </Grid>

          {/* Colonne droite : Configuration finale */}
          <Grid item xs={12} md={6}>
            <Typography variant="h6" sx={{ mb: 3, fontWeight: 600, color: 'primary.main' }}>
              Configuration Finale
            </Typography>

            {/* Champ d'assignation du responsable */}
            <Card sx={{ mb: 3, boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <PersonIcon color="primary" sx={{ mr: 1 }} />
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>Assigné à</Typography>
                </Box>
                <AssigneeField
                  id="assigneeId"
                  value={assignee}
                  onChange={(value: string | number) => setAssignee(String(value))}
                  assignees={assigneesWithFallback}
                  isLoading={isLoadingAssignees}
                  variant="select"
                  size="small"
                  fullWidth
                  disabled={false}
                  labelColor="#2c3e50"
                  labelWeight="600"
                  placeholder="Sélectionner un assigné..."
                  customStyles={{
                    container: { mb: 0 },
                    label: { display: 'none' }
                  }}
                />
                <FormHelperText>Facultatif</FormHelperText>
              </CardContent>
            </Card>

            {/* Marge bénéficiaire */}
            <Card sx={{ mb: 3, boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <MonetizationOnIcon color="primary" sx={{ mr: 1 }} />
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>Marge bénéficiaire</Typography>
                </Box>
                
                <FormControl component="fieldset" sx={{ mb: 2 }}>
                  <FormLabel component="legend">Type de marge</FormLabel>
                  <RadioGroup row value={marginType} onChange={(e) => setMarginType(e.target.value as 'percent' | 'fixed')}>
                    <FormControlLabel value="percent" control={<Radio />} label="Pourcentage (%)" />
                    <FormControlLabel value="fixed" control={<Radio />} label="Montant fixe (€)" />
                  </RadioGroup>
                </FormControl>

                <TextField
                  label={`Marge (${marginType === 'percent' ? '%' : '€'})`}
                  type="number"
                  value={marginValue}
                  onChange={(e) => setMarginValue(Number(e.target.value))}
                  InputProps={{
                    endAdornment: <InputAdornment position="end">{marginType === 'percent' ? '%' : '€'}</InputAdornment>
                  }}
                  sx={{ width: '100%', mb: 2 }}
                />

                <Box sx={{ p: 2, bgcolor: '#f5f7fa', borderRadius: 2 }}>
                  <Typography variant="body2" sx={{ mb: 1 }}>
                    <strong>Prix de revient :</strong> {costPrice.toLocaleString()} €
                  </Typography>
                  <Typography variant="body2" sx={{ mb: 1 }}>
                    <strong>Marge :</strong> {marginAmount.toLocaleString()} € ({marginPercentDisplay.toFixed(2)}%)
                  </Typography>
                  <Typography variant="h6" sx={{ fontWeight: 700, color: 'success.main' }}>
                    <strong>Prix de vente :</strong> {totalPrice.toLocaleString()} €
                  </Typography>
                </Box>
              </CardContent>
            </Card>

            {/* Conditions commerciales */}
            <Card sx={{ mb: 3, boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
              <CardContent>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>Conditions commerciales</Typography>
                
                <TextField
                  label="Conditions de paiement"
                  value={paymentTerms}
                  onChange={(e) => setPaymentTerms(e.target.value)}
                  fullWidth
                  sx={{ mb: 2 }}
                />
                
                <TextField
                  label="Délais de livraison"
                  value={deliveryTerms}
                  onChange={(e) => setDeliveryTerms(e.target.value)}
                  fullWidth
                  sx={{ mb: 2 }}
                />
              </CardContent>
            </Card>

            {/* Commentaires */}
            <Card sx={{ mb: 3, boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
              <CardContent>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>Commentaires</Typography>
                
                <TextField
                  label="Commentaire client (optionnel)"
                  multiline
                  rows={3}
                  value={clientComment}
                  onChange={(e) => setClientComment(e.target.value)}
                  fullWidth
                  sx={{ mb: 2 }}
                  placeholder="Commentaire à inclure dans le devis client..."
                />
                
                <TextField
                  label="Note interne (optionnel)"
                  multiline
                  rows={3}
                  value={internalComment}
                  onChange={(e) => setInternalComment(e.target.value)}
                  fullWidth
                  placeholder="Note interne pour l'équipe..."
                />
                {/* Upload pièces jointes */}
                <Box sx={{ mt: 2 }}>
                  <Button
                    variant="outlined"
                    component="label"
                    startIcon={<AttachFileIcon />}
                    sx={{ mb: 1 }}
                  >
                    Ajouter des pièces jointes
                    <input
                      type="file"
                      hidden
                      multiple
                      onChange={e => {
                        if (e.target.files) {
                          setAttachments(Array.from(e.target.files));
                        }
                      }}
                    />
                  </Button>
                  {/* Liste des fichiers sélectionnés */}
                  <Box>
                    {attachments.length > 0 && attachments.map((file, idx) => (
                      <Chip
                        key={file.name + idx}
                        label={`${file.name} (${(file.size/1024).toFixed(1)} Ko)`}
                        onDelete={() => setAttachments(attachments.filter((_, i) => i !== idx))}
                        sx={{ mr: 1, mb: 1 }}
                      />
                    ))}
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* === NOUVELLE SECTION : RÉCAPITULATIF DÉTAILLÉ DU DEVIS === */}
        <Box sx={{ mt: 4 }}>
          <Typography variant="h5" sx={{ fontWeight: 700, color: 'primary.main', mb: 3, textAlign: 'center' }}>
            📋 Récapitulatif Détaillé du Devis
          </Typography>
          
          <Card sx={{ boxShadow: '0 4px 20px rgba(0,0,0,0.1)', borderRadius: 3 }}>
            <CardContent sx={{ p: 4 }}>
              {/* En-tête du devis */}
              <Box sx={{ textAlign: 'center', mb: 4, pb: 3, borderBottom: '2px solid #e3f0ff' }}>
                <Typography variant="h4" sx={{ fontWeight: 700, color: '#2c3e50', mb: 1 }}>
                  Devis de Transport
                </Typography>
                <Typography variant="h6" color="text.secondary">
                  Référence : {selectedOption.requestData?.requestQuoteNumber || selectedOption.requestData?.quoteNumber || 'DEV-' + Date.now()}
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  Date : {new Date().toLocaleDateString('fr-FR')}
                </Typography>
              </Box>

              {/* Informations principales */}
              <Grid container spacing={3} sx={{ mb: 4 }}>
                <Grid item xs={12} md={6}>
                  <Box sx={{ p: 2, bgcolor: '#f8f9fa', borderRadius: 2 }}>
                    <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: '#2c3e50' }}>
                      📋 Informations Client
                    </Typography>
                    <Typography><strong>Client :</strong> {selectedOption.requestData?.customer?.contactName || 'Non défini'}</Typography>
                    <Typography><strong>Email :</strong> {selectedOption.requestData?.customer?.email || 'Non défini'}</Typography>
                    <Typography><strong>Origine :</strong> {formatAddress(selectedOption.requestData?.pickupLocation) || selectedOption.requestData?.pickupCity || 'Non défini'}</Typography>
                    <Typography><strong>Destination :</strong> {formatAddress(selectedOption.requestData?.deliveryLocation) || selectedOption.requestData?.deliveryCity || 'Non défini'}</Typography>
                    <Typography><strong>Incoterm :</strong> {selectedOption.requestData?.incotermName || 'Non défini'}</Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Box sx={{ p: 2, bgcolor: '#f8f9fa', borderRadius: 2 }}>
                    <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: '#2c3e50' }}>
                      📦 Détails Transport
                    </Typography>
                    <Typography><strong>Type de conteneur :</strong> {selectedOption.requestData?.selectedContainers?.list?.map((c: any) => `${c.quantity} x ${c.containerType}`).join(', ') || 'Non défini'}</Typography>
                    <Typography><strong>Port de départ :</strong> {selectedOption.requestData?.portFrom?.name || 'Non défini'}</Typography>
                    <Typography><strong>Port d'arrivée :</strong> {selectedOption.requestData?.portTo?.name || 'Non défini'}</Typography>
                    <Typography><strong>Validité de l'offre :</strong> 14 jours</Typography>
                  </Box>
                </Grid>
              </Grid>

              {/* Détail des coûts */}
              <Box sx={{ mb: 4 }}>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 3, color: '#2c3e50' }}>
                  💰 Détail des Coûts
                </Typography>

                {/* 1. Haulage */}
                {selectedOption.selectedHaulage && (
                  <Box sx={{ mb: 3 }}>
                    <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: '#e74c3c' }}>
                      1. Haulage (Transport terrestre)
                    </Typography>
                    <Box sx={{ 
                      border: '1px solid #e9ecef', 
                      borderRadius: 2, 
                      overflow: 'hidden',
                      bgcolor: '#fff'
                    }}>
                      <Box sx={{ 
                        display: 'grid', 
                        gridTemplateColumns: '3fr 1fr 1fr 1fr', 
                        bgcolor: '#f8f9fa',
                        borderBottom: '1px solid #e9ecef'
                      }}>
                        <Typography sx={{ p: 2, fontWeight: 600, borderRight: '1px solid #e9ecef' }}>
                          Désignation
                        </Typography>
                        <Typography sx={{ p: 2, fontWeight: 600, borderRight: '1px solid #e9ecef', textAlign: 'center' }}>
                          Quantité
                        </Typography>
                        <Typography sx={{ p: 2, fontWeight: 600, borderRight: '1px solid #e9ecef', textAlign: 'center' }}>
                          Prix unitaire (€)
                        </Typography>
                        <Typography sx={{ p: 2, fontWeight: 600, textAlign: 'center' }}>
                          Total (€)
                        </Typography>
                      </Box>
                      
                      <Box sx={{ display: 'grid', gridTemplateColumns: '3fr 1fr 1fr 1fr' }}>
                        <Typography sx={{ p: 2, borderRight: '1px solid #e9ecef' }}>
                          Haulage (step 4)
                        </Typography>
                        <Typography sx={{ p: 2, borderRight: '1px solid #e9ecef', textAlign: 'center' }}>
                          {haulageQty}
                        </Typography>
                        <Typography sx={{ p: 2, borderRight: '1px solid #e9ecef', textAlign: 'center' }}>
                          {selectedOption.selectedHaulage.unitTariff?.toFixed(2) || '0.00'}
                        </Typography>
                        <Typography sx={{ p: 2, textAlign: 'center' }}>
                          {haulageTotal.toFixed(2)}
                        </Typography>
                      </Box>
                      
                      <Box sx={{ 
                        display: 'grid', 
                        gridTemplateColumns: '3fr 1fr 1fr 1fr',
                        bgcolor: '#e8f5e8',
                        borderTop: '2px solid #28a745'
                      }}>
                        <Typography sx={{ p: 2, fontWeight: 600, borderRight: '1px solid #e9ecef' }}>
                          <strong>Total haulage</strong>
                        </Typography>
                        <Typography sx={{ p: 2, fontWeight: 600, borderRight: '1px solid #e9ecef', textAlign: 'center' }}>
                          <strong>-</strong>
                        </Typography>
                        <Typography sx={{ p: 2, fontWeight: 600, borderRight: '1px solid #e9ecef', textAlign: 'center' }}>
                          <strong>-</strong>
                        </Typography>
                        <Typography sx={{ p: 2, fontWeight: 600, textAlign: 'center' }}>
                          <strong>{haulageTotal.toFixed(2)} €</strong>
                        </Typography>
                      </Box>
                    </Box>
                  </Box>
                )}

                {/* 2. Seafreight */}
                {selectedOption.selectedSeafreights && selectedOption.selectedSeafreights.length > 0 && (
                  <Box sx={{ mb: 3 }}>
                    <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: '#3498db' }}>
                      2. Seafreight (Fret maritime)
                    </Typography>
                    <Box sx={{ 
                      border: '1px solid #e9ecef', 
                      borderRadius: 2, 
                      overflow: 'hidden',
                      bgcolor: '#fff'
                    }}>
                      <Box sx={{ 
                        display: 'grid', 
                        gridTemplateColumns: '3fr 1fr 1fr 1fr', 
                        bgcolor: '#f8f9fa',
                        borderBottom: '1px solid #e9ecef'
                      }}>
                        <Typography sx={{ p: 2, fontWeight: 600, borderRight: '1px solid #e9ecef' }}>
                          Désignation
                        </Typography>
                        <Typography sx={{ p: 2, fontWeight: 600, borderRight: '1px solid #e9ecef', textAlign: 'center' }}>
                          Quantité
                        </Typography>
                        <Typography sx={{ p: 2, fontWeight: 600, borderRight: '1px solid #e9ecef', textAlign: 'center' }}>
                          Prix unitaire (€)
                        </Typography>
                        <Typography sx={{ p: 2, fontWeight: 600, textAlign: 'center' }}>
                          Total (€)
                        </Typography>
                      </Box>
                      
                      {seafreightDetails.map((detail: any, index: number) => {
                        const sf = selectedOption.selectedSeafreights[index];
                        const carrierName = sf?.carrier?.name || sf?.carrierName || 'Transporteur';
                        const departurePort = sf?.departurePort?.name || 'Port de départ';
                        const arrivalPort = sf?.arrivalPort?.name || 'Port d\'arrivée';
                        
                        return (
                          <React.Fragment key={index}>
                            {/* Ligne principale du seafreight */}
                            <Box sx={{ display: 'grid', gridTemplateColumns: '3fr 1fr 1fr 1fr' }}>
                              <Typography sx={{ p: 2, borderRight: '1px solid #e9ecef', fontWeight: 600 }}>
                                {carrierName} | {departurePort} → {arrivalPort}
                              </Typography>
                              <Typography sx={{ p: 2, borderRight: '1px solid #e9ecef', textAlign: 'center' }}>
                                {detail.qty}
                              </Typography>
                              <Typography sx={{ p: 2, borderRight: '1px solid #e9ecef', textAlign: 'center' }}>
                                {detail.unitPrice.toFixed(2)}
                              </Typography>
                              <Typography sx={{ p: 2, textAlign: 'center', fontWeight: 600 }}>
                                {detail.total.toFixed(2)}
                              </Typography>
                            </Box>
                            
                            {/* Container spécifique */}
                            <Box sx={{ display: 'grid', gridTemplateColumns: '3fr 1fr 1fr 1fr' }}>
                              <Typography sx={{ p: 2, borderRight: '1px solid #e9ecef', pl: 4 }}>
                                Container {detail.containerType}
                              </Typography>
                              <Typography sx={{ p: 2, borderRight: '1px solid #e9ecef', textAlign: 'center' }}>
                                {detail.qty}
                              </Typography>
                              <Typography sx={{ p: 2, borderRight: '1px solid #e9ecef', textAlign: 'center' }}>
                                {detail.unitPrice.toFixed(2)}
                              </Typography>
                              <Typography sx={{ p: 2, textAlign: 'center' }}>
                                {detail.total.toFixed(2)}
                              </Typography>
                            </Box>
                            
                            {/* Surcharges */}
                            {detail.surcharges.map((surcharge: any, surchargeIndex: number) => (
                              <Box key={surchargeIndex} sx={{ display: 'grid', gridTemplateColumns: '3fr 1fr 1fr 1fr' }}>
                                <Typography sx={{ p: 2, borderRight: '1px solid #e9ecef', pl: 4 }}>
                                  Surcharge : {surcharge.name}
                                </Typography>
                                <Typography sx={{ p: 2, borderRight: '1px solid #e9ecef', textAlign: 'center' }}>
                                  {surcharge.qty}
                                </Typography>
                                <Typography sx={{ p: 2, borderRight: '1px solid #e9ecef', textAlign: 'center' }}>
                                  {surcharge.unitPrice.toFixed(2)}
                                </Typography>
                                <Typography sx={{ p: 2, textAlign: 'center' }}>
                                  {surcharge.total.toFixed(2)}
                                </Typography>
                              </Box>
                            ))}
                          </React.Fragment>
                        );
                      })}
                      
                      <Box sx={{ 
                        display: 'grid', 
                        gridTemplateColumns: '3fr 1fr 1fr 1fr',
                        bgcolor: '#e3f2fd',
                        borderTop: '2px solid #2196f3'
                      }}>
                        <Typography sx={{ p: 2, fontWeight: 600, borderRight: '1px solid #e9ecef' }}>
                          <strong>Total seafreight (offre)</strong>
                        </Typography>
                        <Typography sx={{ p: 2, fontWeight: 600, borderRight: '1px solid #e9ecef', textAlign: 'center' }}>
                          <strong>-</strong>
                        </Typography>
                        <Typography sx={{ p: 2, fontWeight: 600, borderRight: '1px solid #e9ecef', textAlign: 'center' }}>
                          <strong>-</strong>
                        </Typography>
                        <Typography sx={{ p: 2, fontWeight: 600, textAlign: 'center' }}>
                          <strong>{seafreightTotal.toFixed(2)} €</strong>
                        </Typography>
                      </Box>
                    </Box>
                  </Box>
                )}

                {/* 3. Services supplémentaires */}
                {selectedOption.selectedMiscellaneous && selectedOption.selectedMiscellaneous.length > 0 && (
                  <Box sx={{ mb: 3 }}>
                    <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: '#f39c12' }}>
                      3. Services supplémentaires
                    </Typography>
                    <Box sx={{ 
                      border: '1px solid #e9ecef', 
                      borderRadius: 2, 
                      overflow: 'hidden',
                      bgcolor: '#fff'
                    }}>
                      <Box sx={{ 
                        display: 'grid', 
                        gridTemplateColumns: '3fr 1fr 1fr 1fr', 
                        bgcolor: '#f8f9fa',
                        borderBottom: '1px solid #e9ecef'
                      }}>
                        <Typography sx={{ p: 2, fontWeight: 600, borderRight: '1px solid #e9ecef' }}>
                          Désignation
                        </Typography>
                        <Typography sx={{ p: 2, fontWeight: 600, borderRight: '1px solid #e9ecef', textAlign: 'center' }}>
                          Quantité
                        </Typography>
                        <Typography sx={{ p: 2, fontWeight: 600, borderRight: '1px solid #e9ecef', textAlign: 'center' }}>
                          Prix unitaire (€)
                        </Typography>
                        <Typography sx={{ p: 2, fontWeight: 600, textAlign: 'center' }}>
                          Total (€)
                        </Typography>
                      </Box>
                      
                      {miscDetails.map((detail: any, index: number) => (
                        <Box key={index} sx={{ display: 'grid', gridTemplateColumns: '3fr 1fr 1fr 1fr' }}>
                          <Typography sx={{ p: 2, borderRight: '1px solid #e9ecef' }}>
                            {detail.serviceName}
                            {detail.providerName && (
                              <span style={{ color: '#666', fontSize: '0.9em' }}> — {detail.providerName}</span>
                            )}
                          </Typography>
                          <Typography sx={{ p: 2, borderRight: '1px solid #e9ecef', textAlign: 'center' }}>
                            {detail.qty}
                          </Typography>
                          <Typography sx={{ p: 2, borderRight: '1px solid #e9ecef', textAlign: 'center' }}>
                            {detail.unitPrice.toFixed(2)}
                          </Typography>
                          <Typography sx={{ p: 2, textAlign: 'center' }}>
                            {detail.total.toFixed(2)}
                          </Typography>
                        </Box>
                      ))}
                      
                      <Box sx={{ 
                        display: 'grid', 
                        gridTemplateColumns: '3fr 1fr 1fr 1fr',
                        bgcolor: '#fff3cd',
                        borderTop: '2px solid #ffc107'
                      }}>
                        <Typography sx={{ p: 2, fontWeight: 600, borderRight: '1px solid #e9ecef' }}>
                          <strong>Total misc.</strong>
                        </Typography>
                        <Typography sx={{ p: 2, fontWeight: 600, borderRight: '1px solid #e9ecef', textAlign: 'center' }}>
                          <strong>-</strong>
                        </Typography>
                        <Typography sx={{ p: 2, fontWeight: 600, borderRight: '1px solid #e9ecef', textAlign: 'center' }}>
                          <strong>-</strong>
                        </Typography>
                        <Typography sx={{ p: 2, fontWeight: 600, textAlign: 'center' }}>
                          <strong>{miscTotal.toFixed(2)} €</strong>
                        </Typography>
                      </Box>
                    </Box>
                  </Box>
                )}

                {/* Résumé */}
                <Box sx={{ 
                  border: '2px solid #28a745', 
                  borderRadius: 2, 
                  overflow: 'hidden',
                  bgcolor: '#fff'
                }}>
                  <Box sx={{ 
                    display: 'grid', 
                    gridTemplateColumns: '3fr 1fr 1fr 1fr', 
                    bgcolor: '#d4edda',
                    borderBottom: '2px solid #28a745'
                  }}>
                    <Typography sx={{ p: 2, fontWeight: 600, borderRight: '1px solid #e9ecef' }}>
                      <strong>Résumé</strong>
                    </Typography>
                    <Typography sx={{ p: 2, fontWeight: 600, borderRight: '1px solid #e9ecef', textAlign: 'center' }}>
                      <strong>Quantité</strong>
                    </Typography>
                    <Typography sx={{ p: 2, fontWeight: 600, borderRight: '1px solid #e9ecef', textAlign: 'center' }}>
                      <strong>Prix unitaire (€)</strong>
                    </Typography>
                    <Typography sx={{ p: 2, fontWeight: 600, textAlign: 'center' }}>
                      <strong>Total (€)</strong>
                    </Typography>
                  </Box>
                  
                  <Box sx={{ display: 'grid', gridTemplateColumns: '3fr 1fr 1fr 1fr' }}>
                    <Typography sx={{ p: 2, borderRight: '1px solid #e9ecef' }}>
                      Total haulage
                    </Typography>
                    <Typography sx={{ p: 2, borderRight: '1px solid #e9ecef', textAlign: 'center' }}>
                      -
                    </Typography>
                    <Typography sx={{ p: 2, borderRight: '1px solid #e9ecef', textAlign: 'center' }}>
                      -
                    </Typography>
                    <Typography sx={{ p: 2, textAlign: 'center' }}>
                      {haulageTotal.toFixed(2)}
                    </Typography>
                  </Box>
                  
                  <Box sx={{ display: 'grid', gridTemplateColumns: '3fr 1fr 1fr 1fr' }}>
                    <Typography sx={{ p: 2, borderRight: '1px solid #e9ecef' }}>
                      Total seafreight (offre)
                    </Typography>
                    <Typography sx={{ p: 2, borderRight: '1px solid #e9ecef', textAlign: 'center' }}>
                      -
                    </Typography>
                    <Typography sx={{ p: 2, borderRight: '1px solid #e9ecef', textAlign: 'center' }}>
                      -
                    </Typography>
                    <Typography sx={{ p: 2, textAlign: 'center' }}>
                      {seafreightTotal.toFixed(2)}
                    </Typography>
                  </Box>
                  
                  <Box sx={{ display: 'grid', gridTemplateColumns: '3fr 1fr 1fr 1fr' }}>
                    <Typography sx={{ p: 2, borderRight: '1px solid #e9ecef' }}>
                      Total misc.
                    </Typography>
                    <Typography sx={{ p: 2, borderRight: '1px solid #e9ecef', textAlign: 'center' }}>
                      -
                    </Typography>
                    <Typography sx={{ p: 2, borderRight: '1px solid #e9ecef', textAlign: 'center' }}>
                      -
                    </Typography>
                    <Typography sx={{ p: 2, textAlign: 'center' }}>
                      {miscTotal.toFixed(2)}
                    </Typography>
                  </Box>
                  
                  <Box sx={{ 
                    display: 'grid', 
                    gridTemplateColumns: '3fr 1fr 1fr 1fr',
                    bgcolor: '#e8f5e8',
                    borderTop: '2px solid #28a745'
                  }}>
                    <Typography sx={{ p: 2, fontWeight: 600, borderRight: '1px solid #e9ecef' }}>
                      <strong>Total HT</strong>
                    </Typography>
                    <Typography sx={{ p: 2, fontWeight: 600, borderRight: '1px solid #e9ecef', textAlign: 'center' }}>
                      <strong>-</strong>
                    </Typography>
                    <Typography sx={{ p: 2, fontWeight: 600, borderRight: '1px solid #e9ecef', textAlign: 'center' }}>
                      <strong>-</strong>
                    </Typography>
                    <Typography sx={{ p: 2, fontWeight: 600, textAlign: 'center' }}>
                      <strong>{costPrice.toFixed(2)} €</strong>
                    </Typography>
                  </Box>
                  
                  <Box sx={{ 
                    display: 'grid', 
                    gridTemplateColumns: '3fr 1fr 1fr 1fr',
                    bgcolor: '#fff3cd'
                  }}>
                    <Typography sx={{ p: 2, fontWeight: 600, borderRight: '1px solid #e9ecef' }}>
                      <strong>Marge ({marginType === 'percent' ? marginValue + '%' : marginValue + '€'})</strong>
                    </Typography>
                    <Typography sx={{ p: 2, fontWeight: 600, borderRight: '1px solid #e9ecef', textAlign: 'center' }}>
                      <strong>-</strong>
                    </Typography>
                    <Typography sx={{ p: 2, fontWeight: 600, borderRight: '1px solid #e9ecef', textAlign: 'center' }}>
                      <strong>-</strong>
                    </Typography>
                    <Typography sx={{ p: 2, fontWeight: 600, textAlign: 'center' }}>
                      <strong>{marginAmount.toFixed(2)} €</strong>
                    </Typography>
                  </Box>
                  
                  <Box sx={{ 
                    display: 'grid', 
                    gridTemplateColumns: '3fr 1fr 1fr 1fr',
                    bgcolor: '#d1ecf1',
                    borderTop: '2px solid #17a2b8'
                  }}>
                    <Typography sx={{ p: 2, fontWeight: 700, borderRight: '1px solid #e9ecef', fontSize: '1.1em' }}>
                      <strong>Total général</strong>
                    </Typography>
                    <Typography sx={{ p: 2, fontWeight: 700, borderRight: '1px solid #e9ecef', textAlign: 'center', fontSize: '1.1em' }}>
                      <strong>-</strong>
                    </Typography>
                    <Typography sx={{ p: 2, fontWeight: 700, borderRight: '1px solid #e9ecef', textAlign: 'center', fontSize: '1.1em' }}>
                      <strong>-</strong>
                    </Typography>
                    <Typography sx={{ p: 2, fontWeight: 700, textAlign: 'center', fontSize: '1.1em', color: '#28a745' }}>
                      <strong>{totalPrice.toFixed(2)} €</strong>
                    </Typography>
                  </Box>
                </Box>
              </Box>

              {/* Remarques */}
              <Box sx={{ mt: 4, p: 3, bgcolor: '#f8f9fa', borderRadius: 2, border: '1px solid #e9ecef' }}>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: '#2c3e50' }}>
                  📝 Remarques
                </Typography>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  • <strong>Validité du prix :</strong> Sous réserve de disponibilité navire & équipements.
                </Typography>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  • <strong>Transit time estimé :</strong> 18 jours port à port.
                </Typography>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  • <strong>Frais à destination :</strong> THC Douala, dégroupage, douane, etc. non inclus.
                </Typography>
                {clientComment && (
                  <Typography variant="body2" sx={{ mb: 1, mt: 2, p: 2, bgcolor: '#fff', borderRadius: 1, border: '1px solid #dee2e6' }}>
                    <strong>Commentaire client :</strong> {clientComment}
                  </Typography>
                )}
                {internalComment && (
                  <Typography variant="body2" sx={{ mb: 1, mt: 2, p: 2, bgcolor: '#fff', borderRadius: 1, border: '1px solid #dee2e6' }}>
                    <strong>Note interne :</strong> {internalComment}
                  </Typography>
                )}
              </Box>
            </CardContent>
          </Card>
        </Box>

        {/* Actions */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4, pt: 3, borderTop: '2px solid #e3f0ff' }}>
          <Stack direction="row" spacing={2}>
            <Button
              variant="outlined"
              onClick={onBack}
              disabled={isCreatingQuote || isProcessing}
              sx={{ px: 4, py: 1.5, borderRadius: 2 }}
            >
              Retour à la comparaison
            </Button>
            
            {/* === NOUVEAU BOUTON : NOUVELLE OPTION === */}
            <Button
              variant="outlined"
              color="primary"
              onClick={() => {
                // Préparer les données pour une nouvelle option basée sur l'option actuelle
                const newOptionData = {
                  ...selectedOption,
                  // Réinitialiser les sélections spécifiques mais garder les données de base
                  selectedHaulage: undefined,
                  selectedSeafreights: [],
                  selectedMiscellaneous: [],
                  // Garder les données de la demande (step1, step2, step3)
                  requestData: selectedOption.requestData,
                  // Réinitialiser les quantités
                  haulageQuantity: 1,
                  seafreightQuantities: {},
                  miscQuantities: {},
                  surchargeQuantities: {},
                  // Nouveau nom pour l'option
                  name: `Option ${Date.now()}`,
                  // Réinitialiser les totaux
                  totalPrice: 0,
                  marginType: 'percent',
                  marginValue: 0
                };
                
                // Appeler une fonction pour créer une nouvelle option
                if (typeof window !== 'undefined' && window.history) {
                  // Naviguer vers l'étape 3 avec les données préservées
                  const currentUrl = window.location.href;
                  const baseUrl = currentUrl.split('/').slice(0, -1).join('/');
                  const newUrl = `${baseUrl}/3`;
                  
                  // Stocker les données de la nouvelle option dans localStorage
                  try {
                    localStorage.setItem('wizard_newOptionData', JSON.stringify(newOptionData));
                    localStorage.setItem('wizard_preserveChoices', 'true');
                    localStorage.setItem('wizard_startFromStep', '3');
                  } catch (e) {
                    console.warn('[FinalValidation] Erreur lors du stockage des données:', e);
                  }
                  
                  // Naviguer vers l'étape 3
                  window.location.href = newUrl;
                }
              }}
              disabled={isCreatingQuote || isProcessing}
              startIcon={<span>🔄</span>}
              sx={{ 
                px: 4, 
                py: 1.5, 
                borderRadius: 2,
                borderColor: '#1976d2',
                color: '#1976d2',
                '&:hover': {
                  borderColor: '#1565c0',
                  backgroundColor: 'rgba(25, 118, 210, 0.04)',
                }
              }}
            >
              Nouvelle Option (Étape 3)
            </Button>
          </Stack>
          
          {/* === BOUTONS JSON === */}
          <Stack direction="row" spacing={2}>
            <Button
              variant="outlined"
              color="info"
              onClick={handleGenerateJsonPreview}
              disabled={isCreatingQuote || isProcessing}
              startIcon={<DescriptionIcon />}
              sx={{ px: 3, py: 1.5, borderRadius: 2 }}
            >
              Prévisualiser JSON
            </Button>
            
            <Button
              variant="outlined"
              color="secondary"
              onClick={handleExportJson}
              disabled={isCreatingQuote || isProcessing}
              startIcon={<SaveIcon />}
              sx={{ px: 3, py: 1.5, borderRadius: 2 }}
            >
              Exporter JSON
            </Button>
            
            <Button
              variant="outlined"
              color="warning"
              onClick={handleSendJsonEmail}
              disabled={isCreatingQuote || isProcessing}
              startIcon={<SendIcon />}
              sx={{ px: 3, py: 1.5, borderRadius: 2 }}
            >
              Envoyer par Email
            </Button>
          </Stack>
          
          <Button
            variant="contained"
            color="success"
            onClick={handleValidate}
            disabled={isCreatingQuote || isProcessing || totalPrice <= 0}
            startIcon={isCreatingQuote || isProcessing ? <CircularProgress size={20} /> : <SendIcon />}
            sx={{ px: 4, py: 1.5, borderRadius: 2, fontWeight: 600 }}
          >
            {isCreatingQuote || isProcessing ? 'Création du devis...' : 'Valider et créer le devis'}
          </Button>
        </Box>

        {/* Alertes */}
        {totalPrice <= 0 && (
          <Alert severity="warning" sx={{ mt: 2 }}>
            Le prix de vente doit être supérieur à 0 pour créer le devis.
          </Alert>
        )}
      </Paper>

      {/* Dialog de confirmation */}
      <Dialog open={showConfirmDialog} onClose={() => setShowConfirmDialog(false)}>
        <DialogTitle>Confirmation de création du devis</DialogTitle>
        <DialogContent>
          <Typography>
            Êtes-vous sûr de vouloir créer le devis avec les paramètres suivants ?
          </Typography>
          <Box sx={{ mt: 2, p: 2, bgcolor: '#f5f7fa', borderRadius: 2 }}>
            <Typography><strong>Option :</strong> {selectedOption.name}</Typography>
            <Typography><strong>Prix de vente :</strong> {totalPrice.toLocaleString()} €</Typography>
            <Typography><strong>Marge :</strong> {marginAmount.toLocaleString()} € ({marginPercentDisplay.toFixed(2)}%)</Typography>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowConfirmDialog(false)}>Annuler</Button>
          <Button onClick={handleConfirmValidation} variant="contained" color="success">
            Confirmer
          </Button>
        </DialogActions>
      </Dialog>

      {/* Modal d'affichage du payload JSON */}
      <Dialog 
        open={showPayloadModal} 
        onClose={() => setShowPayloadModal(false)}
        maxWidth="lg"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              Payload JSON du Devis
            </Typography>
            <Button
              size="small"
              onClick={() => {
                const currentPayload = payloadTabValue === 0 ? payloadData : createMinimalistPayload();
                if (currentPayload) {
                  navigator.clipboard.writeText(JSON.stringify(currentPayload, null, 2));
                  enqueueSnackbar('Payload copié dans le presse-papiers', { variant: 'success' });
                }
              }}
              sx={{ ml: 2 }}
            >
              Copier JSON
            </Button>
          </Box>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mb: 2 }}>
            <Typography variant="body2" sx={{ color: 'text.secondary', mb: 1 }}>
              Sélectionnez l'onglet pour voir le payload JSON de l'API :
            </Typography>
            <Box sx={{ 
              p: 2, 
              bgcolor: '#e3f2fd', 
              borderRadius: 1, 
              border: '1px solid #2196f3',
              fontSize: '0.875rem'
            }}>
              <Typography variant="body2" sx={{ color: '#1976d2', fontWeight: 500, mb: 0.5 }}>
                💡 Information :
              </Typography>
              <Typography variant="body2" sx={{ color: '#1976d2', fontSize: '0.8rem' }}>
                • <strong>Payload Complet :</strong> Données enrichies avec tous les détails techniques
                <br />
                • <strong>Payload Minimaliste :</strong> Version simplifiée mais compatible avec l'API - contient les champs requis minimum
              </Typography>
            </Box>
          </Box>
          
          {/* Onglets */}
          <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
            <Tabs 
              value={payloadTabValue} 
              onChange={(_, newValue) => setPayloadTabValue(newValue)}
              aria-label="payload tabs"
            >
              <Tab label="Payload Complet (API)" />
              <Tab label="Payload Minimaliste (API Compatible)" />
            </Tabs>
          </Box>

          {/* Contenu des onglets */}
          <Box sx={{ 
            p: 2, 
            bgcolor: '#f8f9fa', 
            borderRadius: 2, 
            border: '1px solid #e9ecef',
            maxHeight: '60vh',
            overflow: 'auto'
          }}>
            <pre style={{ 
              margin: 0, 
              fontSize: '12px', 
              lineHeight: '1.4',
              fontFamily: 'Monaco, Menlo, "Ubuntu Mono", monospace',
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-word'
            }}>
              {payloadTabValue === 0 
                ? (payloadData ? JSON.stringify(payloadData, null, 2) : 'Chargement...')
                : JSON.stringify(createMinimalistPayload(), null, 2)
              }
            </pre>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowPayloadModal(false)}>
            Annuler
          </Button>
          <Button 
            onClick={handleCreateQuote} 
            variant="contained" 
            color="success"
            disabled={isProcessing}
            startIcon={isProcessing ? <CircularProgress size={20} /> : null}
          >
            {isProcessing ? 'Création en cours...' : 'Créer le devis'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* === NOUVEAU DIALOGUE DE PRÉVISUALISATION JSON === */}
      <Dialog 
        open={showJsonPreview} 
        onClose={() => setShowJsonPreview(false)}
        maxWidth="lg"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              Prévisualisation JSON du Devis
            </Typography>
            <Button
              size="small"
              onClick={() => {
                if (quoteJsonData) {
                  navigator.clipboard.writeText(JSON.stringify(quoteJsonData, null, 2));
                  enqueueSnackbar('JSON copié dans le presse-papiers', { variant: 'success' });
                }
              }}
              sx={{ ml: 2 }}
            >
              Copier JSON
            </Button>
          </Box>
        </DialogTitle>
        <DialogContent>
          {/* Validation Results */}
          {jsonValidation && (
            <Box sx={{ mb: 3 }}>
              {jsonValidation.errors.length > 0 && (
                <Alert severity="error" sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                    Erreurs de validation ({jsonValidation.errors.length})
                  </Typography>
                  {jsonValidation.errors.map((error: string, index: number) => (
                    <Typography key={index} variant="body2" sx={{ mb: 0.5 }}>
                      • {error}
                    </Typography>
                  ))}
                </Alert>
              )}
              
              {jsonValidation.warnings.length > 0 && (
                <Alert severity="warning" sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                    Avertissements ({jsonValidation.warnings.length})
                  </Typography>
                  {jsonValidation.warnings.map((warning: string, index: number) => (
                    <Typography key={index} variant="body2" sx={{ mb: 0.5 }}>
                      • {warning}
                    </Typography>
                  ))}
                </Alert>
              )}
              
              {jsonValidation.suggestions.length > 0 && (
                <Alert severity="info" sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                    Suggestions ({jsonValidation.suggestions.length})
                  </Typography>
                  {jsonValidation.suggestions.map((suggestion: string, index: number) => (
                    <Typography key={index} variant="body2" sx={{ mb: 0.5 }}>
                      • {suggestion}
                    </Typography>
                  ))}
                </Alert>
              )}
            </Box>
          )}

          {/* Format Selection */}
          <Box sx={{ mb: 2 }}>
            <FormControl component="fieldset">
              <FormLabel component="legend">Format d'export</FormLabel>
              <RadioGroup
                row
                value={exportFormat}
                onChange={(e) => setExportFormat(e.target.value as 'json' | 'minified')}
              >
                <FormControlLabel value="json" control={<Radio />} label="JSON formaté" />
                <FormControlLabel value="minified" control={<Radio />} label="JSON minifié" />
              </RadioGroup>
            </FormControl>
          </Box>

          {/* JSON Preview */}
          <Box sx={{ 
            p: 2, 
            bgcolor: '#f8f9fa', 
            borderRadius: 2, 
            border: '1px solid #e9ecef',
            maxHeight: '60vh',
            overflow: 'auto'
          }}>
            <pre style={{ 
              margin: 0, 
              fontSize: '12px', 
              lineHeight: '1.4',
              fontFamily: 'Monaco, Menlo, "Ubuntu Mono", monospace',
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-word'
            }}>
              {quoteJsonData ? JSON.stringify(quoteJsonData, null, 2) : 'Chargement...'}
            </pre>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowJsonPreview(false)}>
            Fermer
          </Button>
          <Button 
            onClick={handleExportJson} 
            variant="contained" 
            color="secondary"
            disabled={isProcessing}
            startIcon={isProcessing ? <CircularProgress size={20} /> : <SaveIcon />}
          >
            {isProcessing ? 'Export en cours...' : 'Exporter JSON'}
          </Button>
          <Button 
            onClick={handleSendJsonEmail} 
            variant="contained" 
            color="warning"
            disabled={isProcessing}
            startIcon={isProcessing ? <CircularProgress size={20} /> : <SendIcon />}
          >
            {isProcessing ? 'Envoi en cours...' : 'Envoyer par Email'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default FinalValidation; 