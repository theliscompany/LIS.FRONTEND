import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useMutation } from '@tanstack/react-query';
import { postApiQuoteFromDraft } from '../../offer/api/sdk.gen';
import { 
  Box, 
  Typography, 
  Paper, 
  Button, 
  Grid, 
  Alert,
  TextField,
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  InputAdornment,
  Tabs,
  Tab
} from '@mui/material';
import {
  AssignmentTurnedIn,
  Add as AddIcon,
  Save as SaveIcon,
  ExpandMore,
  LocalShipping,
  DirectionsBoat,
  Build,
  Euro,
  Edit,
  Check,
  Close,
  Delete,
  ViewList as ViewListIcon
} from '@mui/icons-material';
import RealDraftOptionsManagerFixed from './RealDraftOptionsManagerFixed';
import { useRealDraftOptionsManagerFixed as useRealDraftOptionsManager } from '../hooks/useRealDraftOptionsManagerFixed';

interface Step7RecapProps {
  draftQuote: any;
  onDownloadPdf?: () => void;
  quoteId?: string;
  optionIndex?: number;
  existingOptions?: any[];
  onOptionCreated?: (optionData: any) => void;
  draftId?: string;
  onDraftSaved?: (savedDraft: any) => void;
  showOptionsManagement?: boolean;
  
  // NOUVEAU : Mode édition d'option
  editingOption?: any; // DraftOptionReal
  onOptionUpdated?: (updatedOption: any) => void;
  onCancelOptionEdit?: () => void;
}

const Step7Recap: React.FC<Step7RecapProps> = ({ 
  draftQuote,
  onDownloadPdf,
  quoteId,
  optionIndex = 1,
  existingOptions = [],
  onOptionCreated,
  draftId,
  onDraftSaved,
  showOptionsManagement = true,
  editingOption,
  onOptionUpdated,
  onCancelOptionEdit
}) => {
  
  // === MODE ÉDITION D'OPTION ===
  const isEditingMode = !!editingOption;
  
  // === ÉTATS PRINCIPAUX ===
  const [isCreatingOption, setIsCreatingOption] = useState(false);
  const [optionDescription, setOptionDescription] = useState(
    isEditingMode ? editingOption.description : `Option ${optionIndex}`
  );
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [profitMargin, setProfitMargin] = useState(
    isEditingMode ? editingOption.marginValue : 15
  );
  const [profitMarginType, setProfitMarginType] = useState<'percentage' | 'amount'>(
    isEditingMode ? editingOption.marginType : 'percentage'
  );
  
  // === ÉTATS POUR LA GESTION DES CONTAINERS ===
  const [containerQuantities, setContainerQuantities] = useState<{[key: string]: number}>({});
  const [editingContainer, setEditingContainer] = useState<string | null>(null);
  
  // === ÉTATS POUR LA GESTION DES SURCHARGES ===
  const [seafreightSurcharges, setSeafreightSurcharges] = useState<any[]>([]);
  const [editingSurcharge, setEditingSurcharge] = useState<string | null>(null);
  
  // === ÉTATS POUR LA GESTION DES SERVICES DIVERS ===
  const [miscellaneousServices, setMiscellaneousServices] = useState<any[]>([]);
  const [editingMiscService, setEditingMiscService] = useState<string | null>(null);

  // === ÉTATS POUR LA GESTION DES OPTIONS ===
  const [activeTab, setActiveTab] = useState<'recap' | 'options'>('recap');

  // === MUTATIONS POUR L'API (OPTIMISÉES) ===
  const createQuoteFromDraftMutation = useMutation({
    mutationFn: (data: any) => postApiQuoteFromDraft(data)
  });

  // === HOOK POUR LA GESTION DES OPTIONS RÉELLES ===
  const {
    options,
    createOption,
    exportForQuoteCreation
  } = useRealDraftOptionsManager({
    draftQuote,
    onDraftUpdate: onDraftSaved
  });

  // === DONNÉES MÉMORISÉES ===
  const initialContainerQuantities = useMemo(() => {
    if (!draftQuote?.step3?.containers) return {};
    
    const quantities: {[key: string]: number} = {};
    draftQuote.step3.containers.forEach((container: any) => {
      quantities[container.id] = container.quantity || 1;
    });
    return quantities;
  }, [draftQuote?.step3?.containers]);

  // Initialiser les quantités des containers (optimisé)
  useEffect(() => {
    if (Object.keys(initialContainerQuantities).length > 0) {
      setContainerQuantities(initialContainerQuantities);
    }
  }, [initialContainerQuantities]);

  // === SURCHARGES SEAFREIGHT MÉMORISÉES ===
  const calculatedSeafreightSurcharges = useMemo(() => {
    const seafreights = draftQuote?.step5?.selections || [];
    
    if (!seafreights || seafreights.length === 0) {
      console.warn('⚠️ Aucun seafreight trouvé dans step5.selections');
      return [];
    }

    let allSurcharges: any[] = [];
    
    // ✅ CORRECTION : Traiter TOUS les seafreights sélectionnés
    seafreights.forEach((seafreight: any, seafreightIndex: number) => {
      let surcharges: any[] = [];
      
      // ✅ PRIORITÉ 1: Surcharges depuis charges.surcharges (structure actuelle)
      if (seafreight.charges?.surcharges && Array.isArray(seafreight.charges.surcharges)) {
        surcharges = seafreight.charges.surcharges.map((s: any, index: number) => ({
          id: s.id || `surcharge_${seafreightIndex}_${index}`,
          name: s.name || `Surcharge ${index + 1}`,
          description: s.description || '',
          value: parseFloat(s.value || '0'),
          type: s.type || 'BaseFreight',
          isMandatory: s.isMandatory || false,
          currency: s.currency || seafreight.charges?.currency || 'EUR',
          seafreightIndex: seafreightIndex // ✅ Ajouter l'index pour identifier le seafreight
        }));
      }
      
      // ✅ PRIORITÉ 2: Surcharges depuis pricing (ancienne structure)
      if (surcharges.length === 0 && seafreight.pricing) {
        const pricing = seafreight.pricing;
        
        const surchargeConfigs = [
          { key: 'baf', name: 'BAF', description: 'Bunker Adjustment Factor', type: 0, mandatory: true },
          { key: 'caf', name: 'CAF', description: 'Currency Adjustment Factor', type: 1, mandatory: true },
          { key: 'thcOrigin', name: 'THC Origin', description: 'Terminal Handling Charge (Origin)', type: 2, mandatory: false },
          { key: 'thcDestination', name: 'THC Destination', description: 'Terminal Handling Charge (Destination)', type: 2, mandatory: false },
          { key: 'otherCharges', name: 'Autres charges', description: 'Charges supplémentaires', type: 4, mandatory: false }
        ];

        surchargeConfigs.forEach(config => {
          const value = parseFloat(pricing[config.key]) || 0;
          if (value > 0) {
            surcharges.push({
              id: `surcharge_${seafreightIndex}_${config.key.toLowerCase()}`,
              name: config.name,
              description: config.description,
              value,
              type: config.type,
              isMandatory: config.mandatory,
              currency: pricing.currency || 'EUR',
              seafreightIndex: seafreightIndex
            });
          }
        });
      }
      
      // Ajouter les surcharges de ce seafreight à la liste globale
      allSurcharges = allSurcharges.concat(surcharges);
    });
    
    // ✅ PRIORITÉ 3: Fallback vers selectedSeafreights si disponible
    if (allSurcharges.length === 0 && draftQuote?.selectedSeafreights?.length > 0) {
      draftQuote.selectedSeafreights.forEach((fallbackSeafreight: any, index: number) => {
        if (fallbackSeafreight.charges?.surcharges && Array.isArray(fallbackSeafreight.charges.surcharges)) {
          const fallbackSurcharges = fallbackSeafreight.charges.surcharges.map((s: any, sIndex: number) => ({
            id: `surcharge_fallback_${index}_${sIndex}`,
            name: s.name || `Surcharge ${sIndex + 1}`,
            description: s.description || '',
            value: parseFloat(s.value || s.amount || '0'),
            type: s.type || 0,
            isMandatory: s.isMandatory || false,
            currency: fallbackSeafreight.currency || 'EUR',
            seafreightIndex: index
          }));
          allSurcharges = allSurcharges.concat(fallbackSurcharges);
        }
      });
    }
    
    if (allSurcharges.length === 0) {
      console.warn('⚠️ Aucune surcharge trouvée dans les données disponibles');
    }
    
    console.log(`✅ [Step7] ${allSurcharges.length} surcharges trouvées pour ${seafreights.length} seafreights`);
    
    return allSurcharges;
  }, [draftQuote?.step5?.selections, draftQuote?.selectedSeafreights]);

  // Synchroniser les surcharges seafreight avec l'état local
  useEffect(() => {
    setSeafreightSurcharges(calculatedSeafreightSurcharges);
  }, [calculatedSeafreightSurcharges]);

  // === SERVICES DIVERS MÉMORISÉS ===
  const calculatedMiscellaneousServices = useMemo(() => {
    const miscServices = draftQuote?.step6?.selections || draftQuote?.selectedMiscellaneous || [];
    
    if (miscServices && miscServices.length > 0) {
      return miscServices;
    } else {
      return [];
    }
  }, [draftQuote?.step6?.selections, draftQuote?.selectedMiscellaneous]);

  // Synchroniser les services divers avec l'état local
  useEffect(() => {
    setMiscellaneousServices(calculatedMiscellaneousServices);
  }, [calculatedMiscellaneousServices]);

  // === DEBUG OPTIMISÉ ===
  useEffect(() => {
    if (draftQuote) {

    }
  }, [draftQuote?.id, draftQuote?.currentStep]);

  // === FONCTIONS UTILITAIRES OPTIMISÉES ===
  const getSeafreightBasePrice = useCallback((containerType: string, seafreightIndex: number = 0) => {
    const seafreights = draftQuote?.step5?.selections || [];
    
    if (!seafreights || seafreights.length === 0) {
      console.warn('❌ Aucun seafreight sélectionné dans draftQuote.step5.selections');
      return 0;
    }

    // ✅ CORRECTION : Utiliser l'index spécifique ou le premier disponible
    const seafreight = seafreights[seafreightIndex] || seafreights[0];
    
    if (!seafreight) {
      console.warn(`❌ Seafreight à l'index ${seafreightIndex} non trouvé`);
      return 0;
    }

    // ✅ PRIORITÉ 1: container.unitPrice (structure step5 actuelle)
    if (seafreight.container?.unitPrice && seafreight.container.unitPrice > 0) {
      return seafreight.container.unitPrice;
    }

    // ✅ PRIORITÉ 2: charges.basePrice (structure step5 actuelle)
    if (seafreight.charges?.basePrice && seafreight.charges.basePrice > 0) {
      return seafreight.charges.basePrice;
    }

    // ✅ PRIORITÉ 3: pricing.basePrice (ancienne structure)
    if (seafreight.pricing?.basePrice && seafreight.pricing.basePrice > 0) {
      return seafreight.pricing.basePrice;
    }

    // ✅ PRIORITÉ 4: pricing.total (ancienne structure)
    if (seafreight.pricing?.total && seafreight.pricing.total > 0) {
      return seafreight.pricing.total;
    }

    // ✅ PRIORITÉ 5: Fallback vers selectedSeafreights (compatibilité)
    const fallbackSeafreights = draftQuote?.selectedSeafreights || [];
    if (fallbackSeafreights.length > 0) {
      const fallbackSeafreight = fallbackSeafreights[seafreightIndex] || fallbackSeafreights[0];
      if (fallbackSeafreight) {
        const fallbackPrices = [
          fallbackSeafreight.charges?.basePrice,
          fallbackSeafreight.pricing?.basePrice,
          fallbackSeafreight.unitPrice
        ];
        
        for (const price of fallbackPrices) {
          if (price && price > 0) {
            return price;
          }
        }
      }
    }

    console.error(`❌ ERREUR: Aucun prix trouvé pour ${containerType} dans seafreight ${seafreightIndex}`);
    return 0;
  }, [draftQuote?.step5?.selections, draftQuote?.selectedSeafreights]);

  // === CALCUL DES TEU MÉMORISÉ ===
  const getTEUForContainer = useCallback((containerType: string) => {
    if (!containerType) return 1;
    
    const teuMap: {[key: string]: number} = {
      '40': 2,
      '20': 1,
      '45': 2.25,
      '10': 0.5
    };
    
    for (const [size, teu] of Object.entries(teuMap)) {
      if (containerType.includes(size)) return teu;
    }
    
    return 1; // Par défaut
  }, []);

  // === CALCUL DES TOTAUX OPTIMISÉ ===
  const calculateTotals = useMemo(() => {
    // ✅ NOUVELLE LOGIQUE : Priorité absolue à step4

    
    // ✅ NOUVELLE LOGIQUE : Priorité absolue à step4
    let haulageTotal = 0;
    let haulageSource = 'AUCUNE';
    
    // PRIORITÉ 1: step4.calculation.subtotal (calculé et persisté)
    if (draftQuote?.step4?.calculation?.subtotal) {
      haulageTotal = parseFloat(String(draftQuote.step4.calculation.subtotal)) || 0;
      haulageSource = 'step4.calculation.subtotal';
    } 
    // PRIORITÉ 2: Calcul depuis step4.selection.tariff.unitPrice
    else if (draftQuote?.step4?.selection?.tariff?.unitPrice && draftQuote?.totalTEU) {
      const unitPrice = parseFloat(String(draftQuote.step4.selection.tariff.unitPrice)) || 0;
      const totalTEU = parseFloat(String(draftQuote.totalTEU)) || 0;
      haulageTotal = totalTEU * unitPrice;
      haulageSource = 'step4.selection.tariff.unitPrice × totalTEU';
    }
    // PRIORITÉ 3: Calcul depuis step4.calculation.unitPrice
    else if (draftQuote?.step4?.calculation?.unitPrice && draftQuote?.totalTEU) {
      const unitPrice = parseFloat(String(draftQuote.step4.calculation.unitPrice)) || 0;
      const totalTEU = parseFloat(String(draftQuote.totalTEU)) || 0;
      haulageTotal = totalTEU * unitPrice;
      haulageSource = 'step4.calculation.unitPrice × totalTEU';
    }
    

    
    // Total seafreight (base + surcharges)
    let seafreightBaseTotal = 0;
    let totalContainersPhysical = 0; // Nombre PHYSIQUE de containers (pas les TEU)
    let totalTEU = 0; // Total TEU pour information
    
    // ✅ CORRECTION: Récupérer TOUS les seafreights depuis step5
    const selectedSeafreights = draftQuote?.step5?.selections || [];
    
    if (draftQuote?.step3?.containers && selectedSeafreights.length > 0) {
      // ✅ CORRECTION: Calculer exactement comme affiché dans le tableau
      // Chaque seafreight × chaque container (pas de moyenne)
      selectedSeafreights.forEach((seafreight: any, seafreightIndex: number) => {
        draftQuote.step3.containers.forEach((container: any) => {
          const containerId = container.id;
          const quantity = containerQuantities[containerId] || container.quantity || 1;
          const basePrice = getSeafreightBasePrice(container.type || container.containerType, seafreightIndex);
          
          // Ajouter ce seafreight × container au total
          seafreightBaseTotal += basePrice * quantity;
          
          // Compter les containers et TEU (une seule fois par container, pas par seafreight)
          if (seafreightIndex === 0) { // Compter une seule fois
            totalContainersPhysical += quantity;
            totalTEU += quantity * getTEUForContainer(container.type || container.containerType);
          }
        });
      });
    }
    
    // ✅ CORRECTION: Si pas de containers, additionner tous les seafreights
    if (seafreightBaseTotal === 0 && selectedSeafreights.length > 0) {
      selectedSeafreights.forEach((seafreight: any, seafreightIndex: number) => {
        const basePrice = getSeafreightBasePrice('', seafreightIndex);
        seafreightBaseTotal += basePrice;
      });
    }
    
    // Total des surcharges (s'appliquent à l'offre, PAS par container)
    // IMPORTANT : Les surcharges sont fixes pour l'offre seafreight, pas multipliées par le nombre de containers
    const surchargesTotal = seafreightSurcharges.reduce((total: number, surcharge: any) => {
      return total + (surcharge.value || 0);
    }, 0); // ← Surcharges fixes pour l'offre, pas × totalContainersPhysical
    
    // Formule correcte : Total Seafreight = Prix de l'offre + Surcharges de l'offre
    const seafreightTotal = seafreightBaseTotal + surchargesTotal;
    

    
    // Total services divers - INCLURE TOUS LES SERVICES (step6.selections + miscellaneousServices)
    const allMiscServices = draftQuote?.step6?.selections || miscellaneousServices || [];
    const miscTotal = allMiscServices.reduce((total: number, service: any) => {
      const pricing = service.pricing || service;
      
      // ✅ LOGIQUE ROBUSTE D'EXTRACTION DU PRIX avec tous les fallbacks possibles
      const servicePrice = 
        pricing?.unitPrice ||          // API structure
        pricing?.totalPrice ||         // Alternative API
        pricing?.price ||              // Alternative API
        service.price ||               // État local
        service.unitPrice ||           // État local
        service.totalPrice ||          // Alternative local
        service.cost ||                // Alternative
        (service.service?.price) ||    // Nested structure
        (service.service?.unitPrice) || // Nested structure
        0;                             // Fallback
      

      
      return total + servicePrice;
    }, 0);
    

    
    // ✅ DOUBLE VÉRIFICATION: Ajouter aussi les services depuis selectedMiscellaneous si différents
    if (draftQuote?.selectedMiscellaneous?.length > 0 && !draftQuote?.step6?.selections) {

      const fallbackTotal = draftQuote.selectedMiscellaneous.reduce((total: number, service: any) => {
        const servicePrice = service.price || service.unitPrice || service.totalPrice || 0;

        return total + servicePrice;
      }, 0);
      
      if (fallbackTotal > miscTotal) {

        // Retourner le fallback si plus élevé (peut indiquer des données plus complètes)
      }
    }
    
    // Calcul du sous-total (sans marge) - UTILISER LE TOTAL RÉEL AFFICHÉ
    const subtotal = haulageTotal + seafreightTotal + miscTotal;
    
    // Calcul de la marge - SERA CORRIGÉ PLUS TARD AVEC calculateDisplayedTotal
    let marginAmount: number;
    if (profitMarginType === 'percentage') {
      marginAmount = (subtotal * profitMargin) / 100;
    } else {
      marginAmount = profitMargin;
    }
    
    const totalWithMargin = subtotal + marginAmount;
    

    
    return {
      haulageTotal,
      seafreightBaseTotal,
      seafreightTotal,
      surchargesTotal,
      totalContainersPhysical, // ← Nombre PHYSIQUE de containers
      totalTEU, // ← Total TEU pour information
      miscTotal,
      subtotal,
      marginAmount,
      totalWithMargin
    };
  }, [
    // ✅ NOUVELLES DÉPENDANCES : uniquement step4
    draftQuote?.step4?.calculation?.subtotal,
    draftQuote?.step4?.calculation?.unitPrice,
    draftQuote?.step4?.selection?.tariff?.unitPrice,
    draftQuote?.totalTEU,
    draftQuote?.step3?.containers,
    draftQuote?.step5?.selections,
    draftQuote?.step6?.selections,
    containerQuantities,
    seafreightSurcharges,
    miscellaneousServices,
    profitMargin,
    profitMarginType,
    getSeafreightBasePrice,
    getTEUForContainer
  ]);

  const totals = calculateTotals;

  // === CALCUL DU TOTAL RÉEL BASÉ SUR LES ÉLÉMENTS AFFICHÉS ===
  const calculateDisplayedTotal = useMemo(() => {
    let displayedTotal = 0;
    
    // 1. Haulage (si affiché)
    if (draftQuote?.step4?.selection && draftQuote.step4.selection.offerId) {
      displayedTotal += totals.haulageTotal;
    }
    
    // 2. Seafreights (tous les seafreights × containers affichés)
    if (draftQuote?.step5?.selections?.length > 0) {
      if (draftQuote?.step3?.containers && draftQuote.step3.containers.length > 0) {
        // Cas avec containers : chaque seafreight × chaque container
        draftQuote.step5.selections.forEach((seafreight: any, seafreightIndex: number) => {
          draftQuote.step3.containers.forEach((container: any) => {
            const containerId = container.id;
            const quantity = containerQuantities[containerId] || container.quantity || 1;
            const basePrice = getSeafreightBasePrice(container.type || container.containerType, seafreightIndex);
            displayedTotal += basePrice * quantity;
          });
        });
      } else {
        // Cas sans containers : chaque seafreight directement
        draftQuote.step5.selections.forEach((seafreight: any, seafreightIndex: number) => {
          const basePrice = getSeafreightBasePrice('', seafreightIndex);
          displayedTotal += basePrice;
        });
      }
    }
    
    // 3. Surcharges (toutes les surcharges affichées)
    displayedTotal += seafreightSurcharges.reduce((total: number, surcharge: any) => {
      return total + (surcharge.value || 0);
    }, 0);
    
    // 4. Services divers (tous les services affichés)
    const allMiscServices = draftQuote?.step6?.selections || miscellaneousServices || [];
    displayedTotal += allMiscServices.reduce((total: number, service: any) => {
      const pricing = service.pricing || service;
      const servicePrice = 
        pricing?.unitPrice ||          // API structure
        pricing?.totalPrice ||         // Alternative API
        pricing?.price ||              // Alternative API
        service.price ||               // État local
        service.unitPrice ||           // État local
        service.totalPrice ||          // Alternative local
        service.cost ||                // Alternative
        (service.service?.price) ||    // Nested structure
        (service.service?.unitPrice) || // Nested structure
        0;                             // Fallback
      return total + servicePrice;
    }, 0);
    
    return displayedTotal;
  }, [
    draftQuote?.step4?.selection,
    draftQuote?.step5?.selections,
    draftQuote?.step3?.containers,
    draftQuote?.step6?.selections,
    containerQuantities,
    seafreightSurcharges,
    miscellaneousServices,
    totals.haulageTotal,
    getSeafreightBasePrice
  ]);

  // === CALCUL DE LA MARGE BASÉ SUR LE TOTAL RÉEL AFFICHÉ ===
  const calculateMarginAmount = useMemo(() => {
    if (profitMarginType === 'percentage') {
      return (calculateDisplayedTotal * profitMargin) / 100;
    } else {
      return profitMargin;
    }
  }, [calculateDisplayedTotal, profitMargin, profitMarginType]);

  const calculateTotalWithMargin = useMemo(() => {
    return calculateDisplayedTotal + calculateMarginAmount;
  }, [calculateDisplayedTotal, calculateMarginAmount]);

  // === GESTION DES CONTAINERS OPTIMISÉE ===
  const handleQuantityChange = useCallback((containerId: string, newQuantity: number) => {

    setContainerQuantities(prev => ({
      ...prev,
      [containerId]: Math.max(1, newQuantity)
    }));
  }, [containerQuantities]);

  const handleSaveQuantity = useCallback(() => {
    setEditingContainer(null);
    setSuccess('Quantité mise à jour');
  }, []);

  const handleCancelEdit = useCallback(() => {
    setEditingContainer(null);
  }, []);

  // === GESTION DES SURCHARGES OPTIMISÉE ===
  const handleSurchargeChange = useCallback((surchargeId: string, field: string, value: any) => {
    setSeafreightSurcharges(prev => 
      prev.map(surcharge => 
        surcharge.id === surchargeId 
          ? { ...surcharge, [field]: value }
          : surcharge
      )
    );
  }, []);

  const handleSaveSurchargeChanges = useCallback(() => {
    setEditingSurcharge(null);
    setSuccess('Surcharge mise à jour');
  }, []);

  const handleAddSurcharge = useCallback(() => {
    const newSurcharge = {
      id: `surcharge_${Date.now()}`,
      name: 'Nouvelle surcharge',
      description: 'Description de la surcharge',
      value: 0,
      type: 0,
      isMandatory: false,
      currency: 'EUR'
    };
    setSeafreightSurcharges(prev => [...prev, newSurcharge]);
    setSuccess('Nouvelle surcharge ajoutée');
  }, []);

  const handleDeleteSurcharge = useCallback((surchargeId: string) => {
    setSeafreightSurcharges(prev => prev.filter(s => s.id !== surchargeId));
    setSuccess('Surcharge supprimée');
  }, []);

  // === GESTION DES SERVICES DIVERS OPTIMISÉE ===
  const handleMiscServiceChange = useCallback((serviceId: string, field: string, value: any) => {
    setMiscellaneousServices(prev => 
      prev.map(service => 
        service.serviceId === serviceId 
          ? { ...service, [field]: value }
          : service
      )
    );
  }, []);

  const handleSaveMiscServiceChanges = useCallback(() => {
    setEditingMiscService(null);
    setSuccess('Service mis à jour');
  }, []);

  const handleAddMiscService = useCallback(() => {
    const newService = {
      id: `misc_${Date.now()}`,
      serviceId: Date.now(),
      serviceName: 'Nouveau service',
      supplierName: 'Nouveau fournisseur',
      category: 'Other',
      price: 0,
      currency: 'EUR'
    };
    setMiscellaneousServices(prev => [...prev, newService]);
    setSuccess('Nouveau service ajouté');
  }, []);

  const handleDeleteMiscService = useCallback((serviceId: string) => {
    setMiscellaneousServices(prev => prev.filter(s => s.serviceId !== serviceId));
    setSuccess('Service supprimé');
  }, []);



  // === FONCTIONS PRINCIPALES OPTIMISÉES ===
  const handleSaveDraft = useCallback(() => {

    
    if (onDraftSaved) {
      onDraftSaved({
        operation: 'save_requested',
        step: 7,
        timestamp: new Date().toISOString()
      });
    }
    
    setSuccess('Demande de sauvegarde envoyée');
  }, [onDraftSaved]);

  // === FONCTION POUR SAUVEGARDER LES MODIFICATIONS D'UNE OPTION ===
  const handleSaveOptionChanges = async () => {
    if (!isEditingMode || !editingOption) return;

    setIsCreatingOption(true);
    setError(null);
    setSuccess(null);

    try {
      console.log('[DEBUG] Sauvegarde des modifications de l\'option:', {
        optionId: editingOption.optionId,
        newMarginType: profitMarginType,
        newMarginValue: profitMargin,
        newDescription: optionDescription
      });

      // Note: Dans le nouveau système, nous n'avons plus updateOptionMargin
      // car nous utilisons les vrais endpoints API
      console.log('[DEBUG] Mode édition non supporté dans le nouveau système');
      
      // Notifier le parent que l'option a été mise à jour
      if (onOptionUpdated) {
        onOptionUpdated({
          ...editingOption,
          description: optionDescription,
          marginType: profitMarginType,
          marginValue: profitMargin,
          updatedAt: new Date().toISOString()
        });
      }

      setSuccess('Option mise à jour avec succès !');
      
    } catch (err: any) {
      console.error('❌ [Step7] Erreur lors de la mise à jour de l\'option:', err);
      
      const errorMessage = err?.response?.data?.message || 
                          err?.message || 
                          'Erreur inconnue lors de la mise à jour';
      
      setError(`Erreur: ${errorMessage}`);
    } finally {
      setIsCreatingOption(false);
    }
  };

  const handleFinalizeToOption = async () => {
    if (!draftQuote?.id) {
      setError('Le brouillon doit être sauvegardé avant de créer une option');
      return;
    }

    setIsCreatingOption(true);
    setError(null);
    setSuccess(null);

    try {
      // Utiliser les vraies données calculées du Step 7
      const optionData = {
        name: `Option ${options.length + 1}`,
        description: optionDescription || 'Option créée depuis le récapitulatif Step 7',
        marginType: profitMarginType,
        marginValue: profitMargin
      };

      console.log('[DEBUG] Création option avec données Step 7:', {
        optionData,
        calculateDisplayedTotal: calculateDisplayedTotal,
        calculateTotalWithMargin: calculateTotalWithMargin,
        profitMarginType,
        profitMargin
      });

      // Utiliser createOption du hook réel qui utilise les vraies données du wizard
      console.log('[DEBUG] Avant createOption - options actuelles:', options.length);
      await createOption(optionData);
      console.log('[DEBUG] Après createOption - options actuelles:', options.length);
      
      // Attendre un délai pour laisser le temps au rafraîchissement
      setTimeout(() => {
        console.log('[DEBUG] Après délai - options actuelles:', options.length);
      }, 1000);
      
      // Pour l'instant, on ne crée pas automatiquement le devis
      // L'utilisateur utilisera le bouton "Créer le devis" dans l'onglet Options
      setSuccess(`Option créée avec succès avec les données réelles du wizard ! Vérifiez l'onglet Options.`);

    } catch (err: any) {
      console.error('❌ [Step7] Erreur lors de la finalisation:', err);
      
      const errorMessage = err?.response?.data?.message || 
                          err?.message || 
                          'Erreur inconnue lors de la création';
      
      setError(`Erreur: ${errorMessage}`);
    } finally {
      setIsCreatingOption(false);
    }
  };

  // === FONCTIONS DE GESTION DES OPTIONS ===
  
  const handleQuoteCreation = async (quoteData: any) => {
    try {
      setIsCreatingOption(true);
      setError(null);
      
      const result = await createQuoteFromDraftMutation.mutateAsync({
        body: quoteData
      });
      
      setSuccess('Devis créé avec succès !');
      
      // Notifier le parent du succès
      if (onOptionCreated) {
        onOptionCreated({ 
          id: (result as any)?.data?.id || `quote_${Date.now()}`,
          quoteId: (result as any)?.data?.id,
          result 
        });
      }
    } catch (err: any) {
      console.error('❌ [Step7] Erreur lors de la création du devis:', err);
      
      const errorMessage = err?.response?.data?.message || 
                          err?.message || 
                          'Erreur inconnue lors de la création';
      
      setError(`Erreur: ${errorMessage}`);
    } finally {
      setIsCreatingOption(false);
    }
  };

  // === RENDU ===
  return (
    <Box sx={{ minHeight: '100vh', background: 'linear-gradient(135deg, #f5f7fa 0%, #e3f0ff 100%)', py: 6 }}>
      <Paper elevation={4} sx={{ maxWidth: 1200, mx: 'auto', p: { xs: 2, sm: 5 }, borderRadius: 5, boxShadow: '0 8px 32px rgba(25,118,210,0.10)' }}>
        
        {/* En-tête */}
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <Typography variant="h4" fontWeight="bold" gutterBottom>
            {isEditingMode 
              ? `✏️ Modification d'Option - ${editingOption.name}`
              : `📋 Récapitulatif - ${quoteId ? `Ajout d'Option ${optionIndex}` : 'Création de Devis'}`
            }
          </Typography>
          <Typography variant="body1" color="text.secondary">
            {isEditingMode
              ? `Modifiez les paramètres de l'option "${editingOption.name}" (indépendamment du wizard)`
              : quoteId 
                ? `Ajout d'une nouvelle option au devis existant (${existingOptions.length}/3 options)`
                : 'Création d\'un nouveau devis avec cette première option'
            }
          </Typography>
          {isEditingMode && (
            <Typography variant="caption" color="warning.main" sx={{ display: 'block', mt: 1 }}>
              ⚠️ Les modifications n'affecteront pas le wizard original
            </Typography>
          )}
        </Box>

        {/* Onglets de navigation */}
        {showOptionsManagement && (
          <Box sx={{ mb: 4 }}>
            <Tabs
              value={activeTab}
              onChange={(_, newValue) => setActiveTab(newValue)}
              centered
              sx={{
                '& .MuiTab-root': {
                  minHeight: 48,
                  fontSize: '1rem',
                  fontWeight: 600,
                  textTransform: 'none',
                  borderRadius: 2,
                  mx: 1
                }
              }}
            >
              <Tab
                value="recap"
                label="Récapitulatif"
                icon={<AssignmentTurnedIn />}
                iconPosition="start"
              />
              <Tab
                value="options"
                label={`Options (${options.length})`}
                icon={<ViewListIcon />}
                iconPosition="start"
                disabled={!quoteId && !draftId}
              />
            </Tabs>
          </Box>
        )}

        {/* Alertes */}
        {error && (
          <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}
        
        {success && (
          <Alert severity="success" sx={{ mb: 3 }} onClose={() => setSuccess(null)}>
            {success}
          </Alert>
        )}

        {/* Contenu principal basé sur l'onglet actif */}
        {activeTab === 'recap' ? (
          <>
            {/* === CONTENU DU RÉCAPITULATIF === */}

            {/* Informations Générales */}
        <Paper sx={{ p: 3, mb: 3, bgcolor: 'grey.50' }}>
          <Typography variant="h6" gutterBottom>
            📊 Informations Générales
          </Typography>
          <Grid container spacing={3}>
            <Grid item xs={12} md={4}>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                ID du brouillon
              </Typography>
              <Typography variant="body2" sx={{ fontFamily: 'monospace', fontWeight: 500 }}>
                {draftQuote?.id || 'Non défini'}
              </Typography>
            </Grid>
            <Grid item xs={12} md={4}>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                Étape actuelle
              </Typography>
              <Typography variant="body1" sx={{ fontWeight: 600 }}>
                {draftQuote?.currentStep || 'Non défini'}
              </Typography>
            </Grid>
            <Grid item xs={12} md={4}>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                Total TEU
              </Typography>
              <Typography variant="body1" sx={{ fontWeight: 600 }}>
                {draftQuote?.totalTEU || 0}
              </Typography>
            </Grid>
          </Grid>
        </Paper>

        {/* Description de l'option */}
        <Paper sx={{ p: 3, mb: 3, bgcolor: 'grey.50' }}>
          <Typography variant="h6" gutterBottom>
            📝 Description de l'Option
          </Typography>
          <TextField
            fullWidth
            label="Description de l'option"
            value={optionDescription}
            onChange={(e) => setOptionDescription(e.target.value)}
            placeholder="Ex: Option économique avec transport maritime standard"
            sx={{ mb: 2 }}
          />
        </Paper>

        {/* Boutons Debug DraftQuote (OPTIMISÉS) */}
        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mb: 3, flexWrap: 'wrap' }}>
          <Button
            variant="outlined"
            color="info"
            onClick={() => {
              
            }}
            sx={{ borderRadius: 2, px: 2, py: 1, fontWeight: 600, textTransform: 'none' }}
          >
            🔍 DraftQuote
          </Button>
          
          <Button
            variant="contained"
            color="warning"
            onClick={() => {

            }}
            sx={{ borderRadius: 2, px: 2, py: 1, fontWeight: 600, textTransform: 'none' }}
          >
            🔧 Diagnostic
          </Button>
          
          <Button
            variant="contained"
            color="error"
            onClick={() => {

            }}
            sx={{ borderRadius: 2, px: 2, py: 1, fontWeight: 600, textTransform: 'none' }}
          >
            🚛 Debug Haulage
          </Button>
        </Box>

        {/* Tableau Récapitulatif Principal */}
        <Accordion defaultExpanded sx={{ mb: 3 }}>
          <AccordionSummary expandIcon={<ExpandMore />}>
            <Typography variant="h6">📊 Récapitulatif des Coûts</Typography>
          </AccordionSummary>
          <AccordionDetails>
            {/* Résumé des totaux */}
            <Box sx={{ mb: 3, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
              <Grid container spacing={2}>
                <Grid item xs={12} md={2}>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Total TEU
                  </Typography>
                  <Typography variant="h6" color="primary" sx={{ fontWeight: 600 }}>
                    {totals.totalTEU || draftQuote?.totalTEU || 0}
                  </Typography>
                </Grid>
                <Grid item xs={12} md={2}>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Total Haulage
                  </Typography>
                  <Typography variant="h6" color="secondary" sx={{ fontWeight: 600 }}>
                    {totals.haulageTotal.toFixed(2)} EUR
                  </Typography>
                </Grid>
                <Grid item xs={12} md={2}>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Total Seafreight
                  </Typography>
                  <Typography variant="h6" color="success.main" sx={{ fontWeight: 600 }}>
                    {totals.seafreightTotal.toFixed(2)} EUR
                  </Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                    Base: {totals.seafreightBaseTotal.toFixed(2)} + Surcharges: {totals.surchargesTotal.toFixed(2)}
                  </Typography>
                </Grid>
                <Grid item xs={12} md={2}>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Total Services
                  </Typography>
                  <Typography variant="h6" color="info.main" sx={{ fontWeight: 600 }}>
                    {totals.miscTotal.toFixed(2)} EUR
                  </Typography>
                </Grid>
                <Grid item xs={12} md={2}>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Total Final
                  </Typography>
                  <Typography variant="h6" color="error.main" sx={{ fontWeight: 600 }}>
                    {calculateTotalWithMargin.toFixed(2)} EUR
                  </Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                    Sous-total: {calculateDisplayedTotal.toFixed(2)} + Marge: {calculateMarginAmount.toFixed(2)}
                  </Typography>
                </Grid>
              </Grid>
            </Box>

            {/* Tableau détaillé */}
            <TableContainer component={Paper} variant="outlined">
              <Table size="small">
                <TableHead>
                  <TableRow sx={{ backgroundColor: 'primary.main' }}>
                    <TableCell sx={{ color: 'white', fontWeight: 600 }}>Catégorie</TableCell>
                    <TableCell sx={{ color: 'white', fontWeight: 600 }}>Description</TableCell>
                    <TableCell sx={{ color: 'white', fontWeight: 600 }}>Type</TableCell>
                    <TableCell sx={{ color: 'white', fontWeight: 600 }}>Quantité</TableCell>
                    <TableCell sx={{ color: 'white', fontWeight: 600 }}>Prix Unit.</TableCell>
                    <TableCell sx={{ color: 'white', fontWeight: 600 }}>Sous-total</TableCell>
                    <TableCell sx={{ color: 'white', fontWeight: 600 }}>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {/* Haulage */}
                  {draftQuote?.step4?.selection && draftQuote.step4.selection.offerId && (
                    <TableRow sx={{ backgroundColor: '#f3e5f5' }}>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <LocalShipping color="primary" fontSize="small" />
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>
                            Transport Routier
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                          {draftQuote.step4.selection.haulierName || 'Transporteur non défini'}
                        </Typography>
                      </TableCell>
                      <TableCell>Haulage</TableCell>
                      <TableCell>1</TableCell>
                      <TableCell>{draftQuote.step4.selection.tariff?.unitPrice || 0}</TableCell>
                      <TableCell sx={{ fontWeight: 600, color: 'primary.main' }}>
                          {totals.haulageTotal.toFixed(2)}
                      </TableCell>
                      <TableCell>-</TableCell>
                    </TableRow>
                  )}

                  {/* ✅ CORRECTION : AFFICHER TOUS LES SEAFREIGHTS SÉLECTIONNÉS */}
                  {draftQuote?.step5?.selections?.map((seafreight: any, seafreightIndex: number) => {
                    // Si on a des containers, on affiche le seafreight avec ses containers
                    if (draftQuote?.step3?.containers && draftQuote.step3.containers.length > 0) {
                      return draftQuote.step3.containers.map((container: any, containerIndex: number) => {
                        const containerId = container.id;
                        const isEditing = editingContainer === containerId;
                        const currentQuantity = containerQuantities[containerId] || container.quantity || 1;
                        const basePrice = getSeafreightBasePrice(container.type || container.containerType, seafreightIndex);
                        const subtotal = basePrice * currentQuantity;
                        
                        return (
                          <TableRow key={`seafreight_${seafreightIndex}_container_${containerIndex}`} sx={{ backgroundColor: '#e8f5e8' }}>
                            <TableCell>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <DirectionsBoat color="primary" fontSize="small" />
                                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                  Transport Maritime {draftQuote.step5.selections.length > 1 ? `#${seafreightIndex + 1}` : ''}
                                </Typography>
                              </Box>
                            </TableCell>
                            <TableCell>
                              <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                {container.type || container.containerType} - {seafreight.carrier?.name || seafreight.supplierName || 'Transport maritime'}
                              </Typography>
                            </TableCell>
                            <TableCell>Container</TableCell>
                            <TableCell>
                              {isEditing ? (
                                <TextField
                                  type="number"
                                  value={currentQuantity}
                                  onChange={(e) => handleQuantityChange(containerId, parseInt(e.target.value) || 1)}
                                  size="small"
                                  sx={{ width: 70 }}
                                  inputProps={{ min: 1 }}
                                />
                              ) : (
                                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                  {currentQuantity}
                                </Typography>
                              )}
                            </TableCell>
                            <TableCell>{basePrice.toFixed(2)}</TableCell>
                            <TableCell sx={{ fontWeight: 600, color: 'success.main' }}>
                              {subtotal.toFixed(2)}
                            </TableCell>
                            <TableCell>
                              {isEditing ? (
                                <Box sx={{ display: 'flex', gap: 0.5 }}>
                                  <IconButton size="small" color="primary" onClick={handleSaveQuantity}>
                                    <Check fontSize="small" />
                                  </IconButton>
                                  <IconButton size="small" color="error" onClick={handleCancelEdit}>
                                    <Close fontSize="small" />
                                  </IconButton>
                                </Box>
                              ) : (
                                <IconButton size="small" onClick={() => setEditingContainer(containerId)}>
                                  <Edit fontSize="small" />
                                </IconButton>
                              )}
                            </TableCell>
                          </TableRow>
                        );
                      });
                    } else {
                      // Si pas de containers, afficher le seafreight directement
                      const basePrice = getSeafreightBasePrice('', seafreightIndex);
                      
                      return (
                        <TableRow key={`seafreight_${seafreightIndex}`} sx={{ backgroundColor: '#e8f5e8' }}>
                          <TableCell>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <DirectionsBoat color="primary" fontSize="small" />
                              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                Transport Maritime {draftQuote.step5.selections.length > 1 ? `#${seafreightIndex + 1}` : ''}
                              </Typography>
                            </Box>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2" sx={{ fontWeight: 500 }}>
                              {seafreight.carrier?.name || seafreight.supplierName || 'Transport maritime'}
                            </Typography>
                          </TableCell>
                          <TableCell>Seafreight</TableCell>
                          <TableCell>
                            <Typography variant="body2" sx={{ fontWeight: 600 }}>
                              1
                            </Typography>
                          </TableCell>
                          <TableCell>
                            {basePrice.toFixed(2)}
                          </TableCell>
                          <TableCell sx={{ fontWeight: 600, color: 'success.main' }}>
                            {basePrice.toFixed(2)}
                          </TableCell>
                          <TableCell>-</TableCell>
                        </TableRow>
                      );
                    }
                  }).flat()}


                  {/* Surcharges */}
                  {seafreightSurcharges.map((surcharge: any) => {
                    const isEditing = editingSurcharge === surcharge.id;
                    
                    return (
                      <TableRow key={surcharge.id} sx={{ backgroundColor: '#fff3cd' }}>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Euro color="warning" fontSize="small" />
                            <Typography variant="body2" sx={{ fontWeight: 600 }}>
                              Surcharge {typeof surcharge.seafreightIndex === 'number' && draftQuote?.step5?.selections?.length > 1 ? `#${surcharge.seafreightIndex + 1}` : ''}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell>
                          {isEditing ? (
                            <TextField
                              value={surcharge.name}
                              onChange={(e) => handleSurchargeChange(surcharge.id, 'name', e.target.value)}
                              size="small"
                            />
                          ) : (
                          <Typography variant="body2" sx={{ fontWeight: 500 }}>
                              {surcharge.name}
                          </Typography>
                          )}
                        </TableCell>
                        <TableCell>
                          {isEditing ? (
                            <TextField
                              select
                              value={surcharge.type}
                              onChange={(e) => handleSurchargeChange(surcharge.id, 'type', parseInt(e.target.value))}
                              size="small"
                              SelectProps={{ native: true }}
                            >
                              <option value={0}>BAF</option>
                              <option value={1}>CAF</option>
                              <option value={2}>THC</option>
                              <option value={3}>Security</option>
                              <option value={4}>Other</option>
                            </TextField>
                          ) : (
                          <Typography variant="body2">
                            {surcharge.type === 0 ? 'BAF' : 
                             surcharge.type === 1 ? 'CAF' : 
                               surcharge.type === 2 ? 'THC' : 
                               surcharge.type === 3 ? 'Security' : 'Other'}
                          </Typography>
                          )}
                        </TableCell>
                        <TableCell>1</TableCell>
                        <TableCell>
                          {isEditing ? (
                            <TextField
                              type="number"
                              value={surcharge.value}
                              onChange={(e) => handleSurchargeChange(surcharge.id, 'value', parseFloat(e.target.value) || 0)}
                              size="small"
                              sx={{ width: 80 }}
                            />
                          ) : (
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>
                              {surcharge.value.toFixed(2)}
                          </Typography>
                          )}
                        </TableCell>
                        <TableCell sx={{ fontWeight: 600, color: 'warning.main' }}>
                          {surcharge.value.toFixed(2)}
                        </TableCell>
                        <TableCell>
                          {isEditing ? (
                            <Box sx={{ display: 'flex', gap: 0.5 }}>
                              <IconButton size="small" color="primary" onClick={handleSaveSurchargeChanges}>
                                <Check fontSize="small" />
                              </IconButton>
                              <IconButton size="small" color="error" onClick={() => setEditingSurcharge(null)}>
                                <Close fontSize="small" />
                              </IconButton>
                            </Box>
                          ) : (
                            <Box sx={{ display: 'flex', gap: 0.5 }}>
                              <IconButton size="small" onClick={() => setEditingSurcharge(surcharge.id)}>
                                <Edit fontSize="small" />
                              </IconButton>
                              <IconButton size="small" color="error" onClick={() => handleDeleteSurcharge(surcharge.id)}>
                                <Delete fontSize="small" />
                              </IconButton>
                            </Box>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}

                  {/* Services Divers */}
                  {(draftQuote?.step6?.selections || miscellaneousServices).map((service: any) => {
                    const isEditing = editingMiscService === service.id;
                    const pricing = service.pricing || service;
                    const currentPrice = pricing?.unitPrice || service.price || service.unitPrice || 0;
                    
                    return (
                      <TableRow key={service.id} sx={{ backgroundColor: '#e3f2fd' }}>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Build color="info" fontSize="small" />
                            <Typography variant="body2" sx={{ fontWeight: 600 }}>
                              Service Divers
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell>
                          {isEditing ? (
                            <TextField
                              value={service.service?.serviceName || service.serviceName || ''}
                              onChange={(e) => handleMiscServiceChange(service.id, 'serviceName', e.target.value)}
                              size="small"
                              placeholder="Nom du service"
                            />
                          ) : (
                          <Typography variant="body2" sx={{ fontWeight: 500 }}>
                            {service.service?.serviceName || service.serviceName || 'Service non défini'}
                          </Typography>
                          )}
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {service.service?.category || service.category || 'N/A'}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>
                            {pricing?.quantity || 1}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            {isEditing ? (
                              <TextField
                                type="number"
                              value={currentPrice}
                              onChange={(e) => handleMiscServiceChange(service.id, 'price', parseFloat(e.target.value) || 0)}
                                size="small"
                              placeholder="0.00"
                              inputProps={{ min: 0, step: 0.01 }}
                              />
                            ) : (
                              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                              {currentPrice.toFixed(2)}
                              </Typography>
                            )}
                          </TableCell>
                          <TableCell>
                          <Typography variant="body2" sx={{ fontWeight: 600, color: 'info.main' }}>
                            {currentPrice.toFixed(2)}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            {isEditing ? (
                              <Box sx={{ display: 'flex', gap: 0.5 }}>
                                <IconButton
                                  size="small"
                                  color="primary"
                                  onClick={handleSaveMiscServiceChanges}
                                >
                                  <Check fontSize="small" />
                                </IconButton>
                                <IconButton
                                  size="small"
                                  color="error"
                                  onClick={() => setEditingMiscService(null)}
                                >
                                  <Close fontSize="small" />
                                </IconButton>
                              </Box>
                            ) : (
                              <Box sx={{ display: 'flex', gap: 0.5 }}>
                              <IconButton
                                size="small"
                                  onClick={() => setEditingMiscService(service.id)}
                              >
                                <Edit fontSize="small" />
                              </IconButton>
                                <IconButton
                                  size="small"
                                  color="error"
                                  onClick={() => handleDeleteMiscService(service.id)}
                                >
                                  <Delete fontSize="small" />
                                </IconButton>
                              </Box>
                            )}
                          </TableCell>
                        </TableRow>
                      );
                  })}

                  {/* Ligne de résumé */}
                  <TableRow sx={{ backgroundColor: '#f5f5f5', borderTop: '2px solid #1976d2' }}>
                    <TableCell colSpan={5}>
                      <Typography variant="subtitle1" sx={{ fontWeight: 600, color: 'primary.main' }}>
                        📊 RÉSUMÉ TOTAL
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="h6" sx={{ fontWeight: 700, color: 'primary.main' }}>
                        {calculateDisplayedTotal.toFixed(2)} EUR
                      </Typography>
                    </TableCell>
                    <TableCell>-</TableCell>
                  </TableRow>
                        </TableBody>
                      </Table>
                    </TableContainer>
                    
            {/* Boutons d'ajout */}
            <Box sx={{ mt: 2, display: 'flex', gap: 2 }}>
              <Button
                size="small"
                variant="outlined"
                startIcon={<AddIcon />}
                onClick={handleAddSurcharge}
              >
                Ajouter Surcharge
              </Button>
              <Button
                size="small"
                variant="outlined"
                startIcon={<AddIcon />}
                onClick={handleAddMiscService}
              >
                Ajouter Service
              </Button>
            </Box>
          </AccordionDetails>
        </Accordion>

        {/* Marge Bénéficiaire */}
        <Accordion defaultExpanded sx={{ mb: 3 }}>
          <AccordionSummary expandIcon={<ExpandMore />}>
            <Typography variant="h6">💎 Marge Bénéficiaire</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <FormControl component="fieldset" sx={{ mb: 2 }}>
                  <FormLabel component="legend">Type de marge</FormLabel>
                  <RadioGroup
                    row
                    value={profitMarginType}
                    onChange={(e) => {
                      setProfitMarginType(e.target.value as 'percentage' | 'amount');
                      if (e.target.value === 'percentage') {
                        setProfitMargin(15);
                      } else {
                        setProfitMargin(100);
                      }
                    }}
                  >
                    <FormControlLabel 
                      value="percentage" 
                      control={<Radio />} 
                      label="Pourcentage (%)" 
                    />
                    <FormControlLabel 
                      value="amount" 
                      control={<Radio />} 
                      label="Montant fixe (EUR)" 
                    />
                  </RadioGroup>
                </FormControl>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label={profitMarginType === 'percentage' ? 'Marge bénéficiaire (%)' : 'Marge bénéficiaire (EUR)'}
                  type="number"
                  value={profitMargin}
                  onChange={(e) => {
                    const value = parseFloat(e.target.value) || 0;
                    if (profitMarginType === 'percentage') {
                      setProfitMargin(Math.max(0, Math.min(100, value)));
                    } else {
                      setProfitMargin(Math.max(0, value));
                    }
                  }}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        {profitMarginType === 'percentage' ? '%' : 'EUR'}
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Paper sx={{ p: 2, bgcolor: 'grey.50' }}>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Calcul de la marge
                  </Typography>
                  <Typography variant="body2" sx={{ mb: 1 }}>
                    Sous-total: {calculateDisplayedTotal.toFixed(2)} EUR
                  </Typography>
                  <Typography variant="body2" sx={{ mb: 1 }}>
                    Marge: {calculateMarginAmount.toFixed(2)} EUR
                  </Typography>
                  <Typography variant="h6" sx={{ fontWeight: 600, color: 'primary.main' }}>
                    Total avec marge: {calculateTotalWithMargin.toFixed(2)} EUR
                  </Typography>
                </Paper>
              </Grid>
            </Grid>
          </AccordionDetails>
        </Accordion>

        {/* Actions principales */}
        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mb: 4 }}>
          {isEditingMode ? (
            <>
              {/* MODE ÉDITION D'OPTION */}
              <Button 
                variant="contained" 
                color="primary" 
                size="large"
                startIcon={<SaveIcon />}
                onClick={handleSaveOptionChanges}
                disabled={isCreatingOption}
                sx={{ fontWeight: 700, borderRadius: 2, px: 4, py: 1.5 }}
              >
                {isCreatingOption ? 'Sauvegarde...' : 'Sauvegarder les Modifications'}
              </Button>
              
              <Button 
                variant="outlined" 
                size="large"
                onClick={onCancelOptionEdit}
                sx={{ borderRadius: 2, px: 4, py: 1.5 }}
              >
                Annuler
              </Button>
            </>
          ) : (
            <>
              {/* MODE NORMAL */}
              {quoteId ? (
                <Button 
                  variant="contained" 
                  color="primary" 
                  size="large"
                  startIcon={<AddIcon />}
                  onClick={handleFinalizeToOption}
                  disabled={isCreatingOption}
                  sx={{ fontWeight: 700, borderRadius: 2, px: 4, py: 1.5 }}
                >
                  {isCreatingOption ? 'Création...' : `Ajouter Option ${existingOptions.length + 1}`}
                </Button>
              ) : (
                <Button 
                  variant="contained" 
                  color="primary" 
                  size="large"
                  startIcon={<AssignmentTurnedIn />}
                  onClick={handleFinalizeToOption}
                  disabled={isCreatingOption}
                  sx={{ fontWeight: 700, borderRadius: 2, px: 4, py: 1.5 }}
                >
                  {isCreatingOption ? 'Création...' : 'Créer le Devis avec cette Option'}
                </Button>
              )}
              
              <Button 
                variant="outlined" 
                size="large"
                onClick={onDownloadPdf}
                sx={{ borderRadius: 2, px: 4, py: 1.5 }}
              >
                Télécharger PDF
              </Button>

              {draftId && (
                <Button 
                  variant="contained" 
                  color="success"
                  size="large"
                  startIcon={<SaveIcon />}
                  onClick={handleSaveDraft}
                  sx={{ fontWeight: 700, borderRadius: 2, px: 4, py: 1.5 }}
                >
                  💾 Sauvegarder Brouillon
                </Button>
              )}
            </>
          )}
        </Box>
          </>
        ) : (
          <>
            {/* === CONTENU DE LA GESTION DES OPTIONS === */}
            <RealDraftOptionsManagerFixed
              draftQuote={draftQuote}
              onDraftUpdate={onDraftSaved}
              onQuoteCreation={handleQuoteCreation}
              // Passer les données calculées du Step 7
              currentTotals={{
                displayedTotal: calculateDisplayedTotal,
                marginAmount: calculateMarginAmount,
                totalWithMargin: calculateTotalWithMargin,
                marginType: profitMarginType,
                marginValue: profitMargin
              }}
            />
          </>
        )}

      </Paper>
    </Box>
  );
};

export default Step7Recap; 