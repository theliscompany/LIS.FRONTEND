/**
 * Composant fusionné Step2 + Step3
 * Combine la sélection des services et la configuration des conteneurs
 */

import React, { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Box,
  Typography,
  TextField,
  Button,
  Grid,
  Card,
  CardContent,
  Alert,
  CircularProgress,
  Chip,
  Avatar,
  Fade,
  Slide,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Checkbox,
  List,
  ListItem,
  Pagination,
  LinearProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Select,
  MenuItem,
  Autocomplete,
  IconButton
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import PersonIcon from '@mui/icons-material/Person';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import AssignmentIcon from '@mui/icons-material/Assignment';
import DescriptionIcon from '@mui/icons-material/Description';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ContainerIcon from '@mui/icons-material/Storage';
import ServiceIcon from '@mui/icons-material/Support';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import DirectionsBoatIcon from '@mui/icons-material/DirectionsBoat';
import { useQuery } from '@tanstack/react-query';
import { getApiServiceStatisticsUsageByCountryOptions } from '@features/shipment/api/@tanstack/react-query.gen';
import { getApiPortOptions } from '@features/masterdata/api/@tanstack/react-query.gen';
import { getStep1Data, getStep2Data, getStep3Data } from '../adapters/StepDataAdapters';
import { getTotalTEU } from '../../../utils/functions';

interface Step2Step3MergedProps {
  requestData: any;
  onStepUpdate: (data: any) => void;
  onBack: () => void;
  onNext: () => void;
}

export default function Step2Step3Merged({
  requestData,
  onStepUpdate,
  onNext,
  onBack,
}: Step2Step3MergedProps) {
  const { t } = useTranslation();
  
  // États pour les services (Step2)
  const [servicesPage, setServicesPage] = useState(1);
  const servicesRowsPerPage = 10;
  
  // États pour les conteneurs (Step3)
  const [containers, setContainers] = useState<Array<{
    id: string;
    containerType: string;
    quantity: number;
  }>>([]);
  const [newContainerType, setNewContainerType] = useState<string>("");
  const [newQuantity, setNewQuantity] = useState<number>(1);
  const [isValid, setIsValid] = useState(false);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [triedNext, setTriedNext] = useState(false);

  // États pour les ports
  const [portFromSearch, setPortFromSearch] = useState("");
  const [portToSearch, setPortToSearch] = useState("");
  const [openPortFromAutocomplete, setOpenPortFromAutocomplete] = useState(false);
  const [openPortToAutocomplete, setOpenPortToAutocomplete] = useState(false);
  const [userRejectedAutoPortFrom, setUserRejectedAutoPortFrom] = useState(false);
  const [userRejectedAutoPortTo, setUserRejectedAutoPortTo] = useState(false);
  const [showManualPortSelection, setShowManualPortSelection] = useState(false);
  
  // ✅ ÉTATS LOCAUX POUR LES PORTS (protection contre les conflits)
  const [localPortFrom, setLocalPortFrom] = useState<any>(null);
  const [localPortTo, setLocalPortTo] = useState<any>(null);

  // ✅ Utilisation des adaptateurs de données
  const step1Data = getStep1Data(requestData);
  const step2Data = getStep2Data(requestData);
  const step3Data = getStep3Data(requestData);

  // ✅ DEBUG: Log des données extraites pour diagnostic
  useEffect(() => {
    console.log('🔧 [STEP2STEP3_MERGED] Données extraites par les adaptateurs:', {
      step1Data: step1Data,
      cityFrom: step1Data.cityFrom,
      cityTo: step1Data.cityTo,
      customer: step1Data.customer,
      productName: step1Data.productName,
      incotermName: step1Data.incotermName,
      comment: step1Data.comment
    });
    
    console.log('🔧 [STEP2STEP3_MERGED] Structure complète de requestData:', {
      requestData: requestData,
      customer: requestData?.customer,
      shipment: requestData?.shipment,
      step1: requestData?.step1,
      portFrom: requestData?.portFrom,
      portTo: requestData?.portTo
    });
  }, [requestData, step1Data]);

  // ✅ Query pour charger les services via le SDK
  const departureCountry = step1Data.cityFrom.country;
  const destinationCountry = step1Data.cityTo.country;
  const productNameParam = step1Data.productName.productName;
  const incotermNameParam = step1Data.incotermName;

  const { data: servicesData, isLoading: loadingServices, error: servicesError } = useQuery(
    getApiServiceStatisticsUsageByCountryOptions({
      query: {
        departureCountry,
        destinationCountry,
        productName: productNameParam,
        incotermName: incotermNameParam
      }
    })
  );

  // Query pour les ports
  const { data: portsData, isLoading: isLoadingPorts, error: portsError } = useQuery({
    ...getApiPortOptions({
      baseURL: 'https://localhost:7271'
    }),
    enabled: true,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });

  // Extraction des données de ports
  const allPorts = Array.isArray(portsData) ? portsData : [];

  // ✅ SYNCHRONISATION DES PORTS LOCAUX AVEC LES DONNÉES PARENT
  useEffect(() => {
    console.log('🔄 [STEP2STEP3] Synchronisation des ports locaux avec requestData:', {
      requestDataPortFrom: requestData?.portFrom,
      requestDataPortTo: requestData?.portTo,
      localPortFrom: localPortFrom,
      localPortTo: localPortTo
    });
    
    // Synchroniser les états locaux avec les données du parent
    if (requestData?.portFrom !== localPortFrom) {
      setLocalPortFrom(requestData?.portFrom || null);
    }
    if (requestData?.portTo !== localPortTo) {
      setLocalPortTo(requestData?.portTo || null);
    }
  }, [requestData?.portFrom, requestData?.portTo, localPortFrom, localPortTo]);

  // ✅ DEBUG: Log spécifique pour les ports
  useEffect(() => {
    console.log('🚢 [STEP2STEP3_MERGED] État des ports:', {
      portFrom: requestData?.portFrom,
      portTo: requestData?.portTo,
      portFromName: requestData?.portFrom?.portName,
      portToName: requestData?.portTo?.portName,
      localPortFrom: localPortFrom,
      localPortTo: localPortTo
    });
  }, [requestData?.portFrom, requestData?.portTo, localPortFrom, localPortTo]);

  // ✅ INITIALISATION DES PORTS : Pré-sélectionner les ports basés sur les villes
  useEffect(() => {
    if (allPorts.length > 0 && step1Data.cityFrom && step1Data.cityTo) {
      console.log('🔧 [STEP2STEP3] Tentative de pré-sélection des ports...');
      
      // Pré-sélectionner le port de départ si pas déjà sélectionné
      if (!requestData.portFrom && !userRejectedAutoPortFrom) {
        const bestPortFrom = findBestMatchingPort(step1Data.cityFrom, allPorts);
        if (bestPortFrom) {
          console.log('✅ [STEP2STEP3] Pré-sélection port de départ:', bestPortFrom);
          handlePortFromChange(bestPortFrom);
        }
      }
      
      // Pré-sélectionner le port d'arrivée si pas déjà sélectionné
      if (!requestData.portTo && !userRejectedAutoPortTo) {
        const bestPortTo = findBestMatchingPort(step1Data.cityTo, allPorts);
        if (bestPortTo) {
          console.log('✅ [STEP2STEP3] Pré-sélection port d\'arrivée:', bestPortTo);
          handlePortToChange(bestPortTo);
        }
      }
    }
  }, [allPorts, step1Data.cityFrom, step1Data.cityTo, userRejectedAutoPortFrom, userRejectedAutoPortTo]);

  // Traitement des données reçues du SDK
  const services = Array.isArray(servicesData) ? servicesData : [];

  // Initialisation des conteneurs
  useEffect(() => {
    if (step3Data.containers.length > 0) {
      const containersForDisplay = step3Data.containers.map((container: any) => ({
        id: container.id || Date.now().toString(),
        containerType: container.containerType || container.type,
        quantity: container.quantity || 1
      }));
      setContainers(containersForDisplay);
    }
  }, [step3Data.containers]);

  // Fonction pour calculer le TEU d'un container
  const getTEU = (containerType: string): number => {
    if (!containerType) return 0;
    const type = containerType.toLowerCase();
    if (type.includes("20")) return 1;
    if (type.includes("40")) return 2;
    if (type.includes("45")) return 2.25;
    return 0;
  };

  // Calcul du total TEU
  const totalTEU = containers.reduce((sum, c) => sum + getTEU(c.containerType) * (c.quantity || 1), 0);

  // Filtrage des ports
  const filteredPortsFrom = useMemo(() => {
    if (!portFromSearch) return allPorts.slice(0, 10);
    const search = portFromSearch.toLowerCase();
    return allPorts
      .filter(
        (port) =>
          port.portName?.toLowerCase().includes(search) ||
          port.country?.toLowerCase().includes(search) ||
          `${port.portName}, ${port.country}`.toLowerCase().includes(search)
      )
      .slice(0, 10);
  }, [allPorts, portFromSearch]);

  const filteredPortsTo = useMemo(() => {
    if (!portToSearch) return allPorts.slice(0, 10);
    const search = portToSearch.toLowerCase();
    return allPorts
      .filter(
        (port) =>
          port.portName?.toLowerCase().includes(search) ||
          port.country?.toLowerCase().includes(search) ||
          `${port.portName}, ${port.country}`.toLowerCase().includes(search)
      )
      .slice(0, 10);
  }, [allPorts, portToSearch]);

  // Fonction pour trouver le port le plus approprié basé sur la ville
  const findBestMatchingPort = (cityData: any, ports: any[]): any => {
    if (!cityData || !ports || ports.length === 0) return null;
    
    const cityName = cityData.name || cityData.cityName || '';
    const country = cityData.country || '';
    
    if (!cityName) return null;
    
    // 1. Correspondance exacte ville + pays
    const exactMatch = ports.find(port => {
      const portName = port.portName?.toLowerCase() || '';
      const portCountry = port.country?.toLowerCase() || '';
      const cityNameLower = cityName.toLowerCase();
      const countryLower = country.toLowerCase();
      
      return portName.includes(cityNameLower) && portCountry === countryLower;
    });
    
    if (exactMatch) return exactMatch;
    
    // 2. Correspondance partielle ville + pays
    const partialMatch = ports.find(port => {
      const portName = port.portName?.toLowerCase() || '';
      const portCountry = port.country?.toLowerCase() || '';
      const cityNameLower = cityName.toLowerCase();
      const countryLower = country.toLowerCase();
      
      return (portName.includes(cityNameLower) || cityNameLower.includes(portName)) && 
             (portCountry === countryLower || portCountry.includes(countryLower) || countryLower.includes(portCountry));
    });
    
    if (partialMatch) return partialMatch;
    
    // 3. Correspondance par pays seulement
    const countryMatch = ports.find(port => {
      const portCountry = port.country?.toLowerCase() || '';
      const countryLower = country.toLowerCase();
      
      return portCountry === countryLower || portCountry.includes(countryLower) || countryLower.includes(portCountry);
    });
    
    if (countryMatch) return countryMatch;
    
    return null;
  };

  // Fonction pour suggérer des ports alternatifs
  const suggestAlternativePorts = (cityData: any, ports: any[]): any[] => {
    if (!cityData || !ports || ports.length === 0) return [];
    
    const cityName = cityData.name || cityData.cityName || '';
    const country = cityData.country || '';
    
    if (!cityName) return [];
    
    return ports
      .filter(port => {
        const portName = port.portName?.toLowerCase() || '';
        const portCountry = port.country?.toLowerCase() || '';
        const cityNameLower = cityName.toLowerCase();
        const countryLower = country.toLowerCase();
        
        // Correspondance par pays
        const countryMatch = portCountry === countryLower || 
                           portCountry.includes(countryLower) || 
                           countryLower.includes(portCountry);
        
        // Correspondance par nom de ville
        const nameMatch = portName.includes(cityNameLower) || 
                         cityNameLower.includes(portName);
        
        return countryMatch || nameMatch;
      })
      .slice(0, 5); // Limiter à 5 suggestions
  };

  // Validation en temps réel
  useEffect(() => {
    const errors: string[] = [];
    
    if (containers.length === 0) {
      errors.push('Au moins un conteneur est requis');
    }
    
    containers.forEach((container, index) => {
      if (!container.type) {
        errors.push(`Type de conteneur requis pour le conteneur ${index + 1}`);
      }
      if (container.quantity <= 0) {
        errors.push(`Quantité valide requise pour le conteneur ${index + 1}`);
      }
    });

    setValidationErrors(errors);
    setIsValid(errors.length === 0);
  }, [containers]);

  // Mapping des services
  const mappedServices = Array.isArray(services)
    ? services.map((s, idx) => ({
        ...s,
        serviceId: s.serviceId || idx,
        name: s.serviceName || `Service ${idx}`,
      }))
    : [];

  // Ajouter les services sélectionnés qui ne sont pas dans l'API
  const allServices = [...mappedServices];
  
  if (step2Data.selected.length > 0) {
    step2Data.selected.forEach(savedService => {
      const isAlreadyInList = allServices.some(apiService => 
        apiService.serviceId === savedService.serviceId || 
        apiService.serviceName === savedService.serviceName
      );
      
      if (!isAlreadyInList) {
        allServices.push({
          ...savedService,
          serviceId: savedService.serviceId,
          serviceName: savedService.serviceName,
          name: savedService.serviceName,
          usagePercent: savedService.usagePercent || 0
        } as any);
      }
    });
  }

  const paginatedServices = allServices.slice((servicesPage - 1) * servicesRowsPerPage, servicesPage * servicesRowsPerPage);
  const pageCount = Math.ceil(allServices.length / servicesRowsPerPage);

  // Gestion des services
  const handleToggle = (service: any) => {
    const isCurrentlySelected = step2Data.selected.some((s) => 
      s.serviceId === service.serviceId || 
      s.serviceName === service.serviceName
    );
    
    if (isCurrentlySelected) {
      const newSelected = step2Data.selected.filter((s) => 
        !(s.serviceId === service.serviceId || 
          s.serviceName === service.serviceName)
      );
      onStepUpdate({
        selectedServices: newSelected,
        selected: newSelected
      });
    } else {
      const newSelected = [...step2Data.selected, service];
      onStepUpdate({
        selectedServices: newSelected,
        selected: newSelected
      });
    }
  };

  // Gestion des conteneurs
  const addContainer = () => {
    if (newContainerType && newQuantity > 0) {
      const newContainer = {
        id: Date.now().toString(),
        containerType: newContainerType,
        quantity: newQuantity
      };
      const updatedContainers = [...containers, newContainer];
      setContainers(updatedContainers);
      
      // Persistance globale + calcul TEU
      const totalTEU = getTotalTEU(updatedContainers);
      const containersForValidation = updatedContainers.map(container => ({
        id: container.id,
        type: container.containerType,
        containerType: container.containerType,
        quantity: container.quantity,
        teu: getTEU(container.containerType)
      }));
      
      onStepUpdate({
        containers: containersForValidation,
        summary: {
          totalContainers: updatedContainers.reduce((sum, c) => sum + c.quantity, 0),
          totalTEU: totalTEU,
          containerTypes: [...new Set(updatedContainers.map(c => c.containerType))]
        },
        selectedContainers: { list: containersForValidation }
      });
      
      setNewContainerType("");
      setNewQuantity(1);
    }
  };

  const removeContainer = (id: string) => {
    const updatedContainers = containers.filter(container => container.id !== id);
    setContainers(updatedContainers);
    
    // Persistance globale + calcul TEU
    const totalTEU = getTotalTEU(updatedContainers);
    const containersForValidation = updatedContainers.map(container => ({
      id: container.id,
      type: container.containerType,
      containerType: container.containerType,
      quantity: container.quantity,
      teu: getTEU(container.containerType)
    }));
    
    onStepUpdate({
      containers: containersForValidation,
      summary: {
        totalContainers: updatedContainers.reduce((sum, c) => sum + c.quantity, 0),
        totalTEU: totalTEU,
        containerTypes: [...new Set(updatedContainers.map(c => c.containerType))]
      },
      selectedContainers: { list: containersForValidation }
    });
  };

  // ✅ HANDLERS SÉPARÉS POUR CHAQUE PORT (avec états locaux)
  const handlePortFromChange = (value: any) => {
    console.log('🔧 [STEP2STEP3] Sélection port de départ:', value);
    console.log('🔧 [STEP2STEP3] Port d\'arrivée actuel (local):', localPortTo);
    
    // Mise à jour de l'état local immédiatement
    setLocalPortFrom(value);
    
    // Mise à jour sécurisée : préserver le port d'arrivée
    const updatedData = {
      ...requestData,
      portFrom: value,
      // S'assurer que portTo est explicitement préservé
      portTo: localPortTo || requestData.portTo || null
    };
    
    console.log('🔄 [STEP2STEP3] Données après mise à jour port de départ:', updatedData);
    onStepUpdate(updatedData);
  };

  const handlePortToChange = (value: any) => {
    console.log('🔧 [STEP2STEP3] Sélection port d\'arrivée:', value);
    console.log('🔧 [STEP2STEP3] Port de départ actuel (local):', localPortFrom);
    
    // Mise à jour de l'état local immédiatement
    setLocalPortTo(value);
    
    // Mise à jour sécurisée : préserver le port de départ
    const updatedData = {
      ...requestData,
      portTo: value,
      // S'assurer que portFrom est explicitement préservé
      portFrom: localPortFrom || requestData.portFrom || null
    };
    
    console.log('🔄 [STEP2STEP3] Données après mise à jour port d\'arrivée:', updatedData);
    onStepUpdate(updatedData);
  };

  // Gestion des ports
  const rejectAutoPortFrom = () => {
    setUserRejectedAutoPortFrom(true);
    handlePortFromChange(null);
  };

  const rejectAutoPortTo = () => {
    setUserRejectedAutoPortTo(true);
    handlePortToChange(null);
  };

  const resetPortRejections = () => {
    setUserRejectedAutoPortFrom(false);
    setUserRejectedAutoPortTo(false);
  };

  const toggleManualSelection = () => {
    setShowManualPortSelection(!showManualPortSelection);
  };

  const handleNext = () => {
    setTriedNext(true);
    const portFromValid = !!(localPortFrom || requestData.portFrom);
    const portToValid = !!(localPortTo || requestData.portTo);
    const containersValid = containers.length > 0;
    
    if (portFromValid && portToValid && containersValid) {
      // Calculer le résumé des conteneurs
      const summary = {
        totalContainers: containers.reduce((sum, c) => sum + c.quantity, 0),
        totalTEU: totalTEU,
        containerTypes: [...new Set(containers.map(c => c.containerType))]
      };

      // Mettre à jour les données des deux étapes
      onStepUpdate({
        // Step2 data
        selectedServices: step2Data.selected,
        selected: step2Data.selected,
        // Step3 data
        containers: containers.map(container => ({
          id: container.id,
          type: container.containerType,
          containerType: container.containerType,
          quantity: container.quantity,
          teu: getTEU(container.containerType)
        })),
        summary: summary,
        selectedContainers: { list: containers.map(container => ({
          id: container.id,
          type: container.containerType,
          containerType: container.containerType,
          quantity: container.quantity,
          teu: getTEU(container.containerType)
        })) }
      });
      
      onNext();
    }
  };

  return (
    <Box sx={{ 
      background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
      minHeight: '100vh',
      p: 3
    }}>
      <Fade in timeout={800}>
        <Box>
          {/* Header avec titre moderne */}
          <Box sx={{ 
            textAlign: 'center', 
            mb: 4,
            background: 'linear-gradient(135deg, #56ab2f 0%, #a8e6cf 100%)',
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
              {t('requestWizard.step2.title')} & {t('requestWizard.step3.title')}
            </Typography>
            <Typography variant="h6" sx={{ opacity: 0.9 }}>
              Sélectionnez les services et configurez les conteneurs
            </Typography>
          </Box>

          {/* Résumé de la demande */}
          <Slide direction="up" in timeout={1000}>
            <Accordion defaultExpanded sx={{ mb: 4, borderRadius: 3, boxShadow: '0 10px 30px rgba(0,0,0,0.1)', background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)' }}>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Avatar sx={{
                    bgcolor: 'success.main',
                    mr: 2,
                    background: 'linear-gradient(135deg, #56ab2f 0%, #a8e6cf 100%)'
                  }}>
                    <ServiceIcon />
                  </Avatar>
                  <Typography variant="h6" sx={{ fontWeight: 600, color: '#2c3e50' }}>
                    Résumé de la demande
                  </Typography>
                </Box>
              </AccordionSummary>
              <AccordionDetails>
                <Grid container spacing={2} sx={{
                  p: 3,
                  borderRadius: 3,
                  background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
                  width: '100%'
                }}>
                  <Grid item xs={12} sm={6}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                      <PersonIcon sx={{ color: '#3498db' }} />
                      <Typography variant="subtitle2" color="text.secondary">Client:</Typography>
                      <Typography variant="body1" sx={{ fontWeight: 600 }}>
                        {step1Data.customer.companyName || step1Data.customer.contactName || '-'}
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                      <LocationOnIcon sx={{ color: '#e74c3c' }} />
                      <Typography variant="subtitle2" color="text.secondary">Départ:</Typography>
                      <Typography variant="body1" sx={{ fontWeight: 600 }}>
                        {step1Data.cityFrom.name || '-'} / {step1Data.cityFrom.country || '-'}
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                      <LocationOnIcon sx={{ color: '#27ae60' }} />
                      <Typography variant="subtitle2" color="text.secondary">Arrivée:</Typography>
                      <Typography variant="body1" sx={{ fontWeight: 600 }}>
                        {step1Data.cityTo.name || '-'} / {step1Data.cityTo.country || '-'}
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                      <LocalShippingIcon sx={{ color: '#9b59b6' }} />
                      <Typography variant="subtitle2" color="text.secondary">Produit:</Typography>
                      <Typography variant="body1" sx={{ fontWeight: 600 }}>
                        {step1Data.productName.productName || '-'}
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                      <AssignmentIcon sx={{ color: '#34495e' }} />
                      <Typography variant="subtitle2" color="text.secondary">Incoterm:</Typography>
                      <Typography variant="body1" sx={{ fontWeight: 600 }}>
                        {step1Data.incotermName || '-'}
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                      <DescriptionIcon sx={{ color: '#e67e22' }} />
                      <Typography variant="subtitle2" color="text.secondary">Commentaire:</Typography>
                      <Typography variant="body1" sx={{ fontWeight: 600 }}>
                        {step1Data.comment || '-'}
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>
              </AccordionDetails>
            </Accordion>
          </Slide>

          {/* Section Ports */}
          <Slide direction="up" in timeout={1200}>
            <Card sx={{ 
              mb: 4, 
              borderRadius: 3,
              boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
              background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)'
            }}>
              <CardContent sx={{ p: 4 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                  <Avatar sx={{ 
                    bgcolor: 'info.main', 
                    mr: 2,
                    background: 'linear-gradient(135deg, #2980b9 0%, #3498db 100%)'
                  }}>
                    <DirectionsBoatIcon />
                  </Avatar>
                  <Typography variant="h5" sx={{ fontWeight: 600, color: '#2c3e50' }}>
                    Ports de départ et d'arrivée
                  </Typography>
                </Box>

                {/* Contrôles pour la sélection manuelle */}
                <Box sx={{ mb: 2, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={toggleManualSelection}
                    sx={{
                      borderRadius: 2,
                      borderColor: '#1976d2',
                      color: '#1976d2',
                      '&:hover': { backgroundColor: 'rgba(25, 118, 210, 0.04)' }
                    }}
                  >
                    {showManualPortSelection ? '🔍 Mode suggestions' : '🎯 Mode manuel'}
                  </Button>
                  
                  {(userRejectedAutoPortFrom || userRejectedAutoPortTo) && (
                    <Button
                      variant="text"
                      size="small"
                      onClick={resetPortRejections}
                      sx={{ color: '#666', fontSize: '0.8rem' }}
                    >
                      🔄 Réactiver suggestions
                    </Button>
                  )}
                </Box>
                
                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <DirectionsBoatIcon sx={{ color: '#2980b9', mr: 1 }} />
                      <Typography variant="body1" sx={{ fontWeight: 500 }}>
                        <strong>Port de départ:</strong>
                      </Typography>
                    </Box>
                    <Autocomplete
                      open={openPortFromAutocomplete}
                      onOpen={() => setOpenPortFromAutocomplete(true)}
                      onClose={() => setOpenPortFromAutocomplete(false)}
                      options={filteredPortsFrom}
                      loading={isLoadingPorts}
                      getOptionLabel={(option) => {
                        if (!option) return "";
                        const portName = option.portName || "";
                        const country = option.country || "";
                        return country ? `${portName}, ${country}` : portName;
                      }}
                      onInputChange={(_, value) => setPortFromSearch(value)}
                      filterOptions={(x) => x}
                      value={localPortFrom || requestData.portFrom || null}
                      onChange={(_, value) => handlePortFromChange(value)}
                      renderOption={(props, option) => (
                        <Box component="li" {...props}>
                          <Box>
                            <Typography variant="body1" sx={{ fontWeight: 500 }}>
                              {option.portName || ""}
                            </Typography>
                            {option.country && (
                              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                                {option.country}
                              </Typography>
                            )}
                          </Box>
                        </Box>
                      )}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          label="Port de départ"
                          variant="outlined"
                          required
                          error={triedNext && !(localPortFrom || requestData.portFrom)}
                          helperText={
                            triedNext && !(localPortFrom || requestData.portFrom)
                              ? 'Ce champ est requis' 
                              : (localPortFrom || requestData.portFrom) && step1Data.cityFrom && !userRejectedAutoPortFrom
                                ? `✅ Pré-sélectionné pour ${step1Data.cityFrom.name}`
                                : showManualPortSelection
                                  ? '🎯 Mode sélection manuelle'
                                  : ''
                          }
                          InputProps={{
                            ...params.InputProps,
                            endAdornment: (
                              <>
                                {isLoadingPorts ? <CircularProgress color="inherit" size={20} /> : null}
                                {params.InputProps.endAdornment}
                              </>
                            ),
                          }}
                        />
                      )}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <DirectionsBoatIcon sx={{ color: '#16a085', mr: 1 }} />
                      <Typography variant="body1" sx={{ fontWeight: 500 }}>
                        <strong>Port d'arrivée:</strong>
                      </Typography>
                    </Box>
                    <Autocomplete
                      open={openPortToAutocomplete}
                      onOpen={() => setOpenPortToAutocomplete(true)}
                      onClose={() => setOpenPortToAutocomplete(false)}
                      options={filteredPortsTo}
                      loading={isLoadingPorts}
                      getOptionLabel={(option) => {
                        if (!option) return "";
                        const portName = option.portName || "";
                        const country = option.country || "";
                        return country ? `${portName}, ${country}` : portName;
                      }}
                      onInputChange={(_, value) => setPortToSearch(value)}
                      filterOptions={(x) => x}
                      value={localPortTo || requestData.portTo || null}
                      onChange={(_, value) => handlePortToChange(value)}
                      renderOption={(props, option) => (
                        <Box component="li" {...props}>
                          <Box>
                            <Typography variant="body1" sx={{ fontWeight: 500 }}>
                              {option.portName || ""}
                            </Typography>
                            {option.country && (
                              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                                {option.country}
                              </Typography>
                            )}
                          </Box>
                        </Box>
                      )}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          label="Port d'arrivée"
                          variant="outlined"
                          required
                          error={triedNext && !(localPortTo || requestData.portTo)}
                          helperText={
                            triedNext && !(localPortTo || requestData.portTo)
                              ? 'Ce champ est requis' 
                              : (localPortTo || requestData.portTo) && step1Data.cityTo && !userRejectedAutoPortTo
                                ? `✅ Pré-sélectionné pour ${step1Data.cityTo.name}`
                                : showManualPortSelection
                                  ? '🎯 Mode sélection manuelle'
                                  : ''
                          }
                          InputProps={{
                            ...params.InputProps,
                            endAdornment: (
                              <>
                                {isLoadingPorts ? <CircularProgress color="inherit" size={20} /> : null}
                                {params.InputProps.endAdornment}
                              </>
                            ),
                          }}
                        />
                      )}
                    />
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Slide>

          {/* Section Conteneurs */}
          <Slide direction="up" in timeout={1200}>
            <Card sx={{ 
              mb: 4, 
              borderRadius: 3,
              boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
              background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)'
            }}>
              <CardContent sx={{ p: 4 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                  <Avatar sx={{ 
                    bgcolor: 'success.main', 
                    mr: 2,
                    background: 'linear-gradient(135deg, #56ab2f 0%, #a8e6cf 100%)'
                  }}>
                    <ContainerIcon />
                  </Avatar>
                  <Typography variant="h5" sx={{ fontWeight: 600, color: '#2c3e50' }}>
                    Configuration des conteneurs
                  </Typography>
                  <Chip 
                    label={`${containers.length} conteneur${containers.length > 1 ? 's' : ''}`}
                    color="success" 
                    sx={{ ml: 2 }}
                  />
                </Box>

                <Box sx={{ 
                  mb: 3, 
                  p: 3, 
                  borderRadius: 2,
                  background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                  color: 'white'
                }}>
                  <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                    📦 Ajouter un conteneur
                  </Typography>
                  <Grid container spacing={2} alignItems="center">
                    <Grid item xs={12} md={4}>
                      <Typography variant="subtitle2" sx={{ mb: 1, color: 'white' }}>
                        Type de conteneur
                      </Typography>
                      <Select
                        value={newContainerType}
                        onChange={(e) => setNewContainerType(e.target.value)}
                        displayEmpty
                        size="small"
                        fullWidth
                        sx={{
                          backgroundColor: 'rgba(255,255,255,0.9)',
                          borderRadius: 2,
                          '&:hover': {
                            backgroundColor: 'rgba(255,255,255,1)',
                          }
                        }}
                      >
                        <MenuItem value=""><em>Choisir un type</em></MenuItem>
                        {['20ft Standard', '40ft Standard', '40ft High Cube', '45ft High Cube'].map(type => (
                          <MenuItem key={type} value={type}>
                            {type}
                          </MenuItem>
                        ))}
                      </Select>
                    </Grid>
                    <Grid item xs={12} md={3}>
                      <Typography variant="subtitle2" sx={{ mb: 1, color: 'white' }}>
                        Quantité
                      </Typography>
                      <Select
                        value={newQuantity}
                        onChange={(e) => setNewQuantity(Number(e.target.value))}
                        size="small"
                        fullWidth
                        sx={{
                          backgroundColor: 'rgba(255,255,255,0.9)',
                          borderRadius: 2,
                          '&:hover': {
                            backgroundColor: 'rgba(255,255,255,1)',
                          }
                        }}
                      >
                        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(num => (
                          <MenuItem key={num} value={num}>{num}</MenuItem>
                        ))}
                      </Select>
                    </Grid>
                    <Grid item xs={12} md={3}>
                      <Button 
                        variant="contained" 
                        onClick={addContainer}
                        disabled={!newContainerType}
                        sx={{ 
                          mt: 2,
                          background: 'linear-gradient(135deg, #56ab2f 0%, #a8e6cf 100%)',
                          color: 'white',
                          borderRadius: 2,
                          px: 3,
                          py: 1.5,
                          '&:hover': {
                            background: 'linear-gradient(135deg, #4a9c2a 0%, #9dd4c0 100%)',
                          }
                        }}
                        fullWidth
                      >
                        Ajouter
                      </Button>
                    </Grid>
                  </Grid>
                </Box>

                {containers.length > 0 && (
                  <TableContainer component={Paper} sx={{ 
                    borderRadius: 2,
                    boxShadow: '0 5px 15px rgba(0,0,0,0.08)'
                  }}>
                    <Table>
                      <TableHead>
                        <TableRow sx={{ background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' }}>
                          <TableCell sx={{ color: 'white', fontWeight: 600 }}>Type de conteneur</TableCell>
                          <TableCell sx={{ color: 'white', fontWeight: 600 }}>Quantité</TableCell>
                          <TableCell sx={{ color: 'white', fontWeight: 600 }}>TEU/Unité</TableCell>
                          <TableCell sx={{ color: 'white', fontWeight: 600 }}>Total TEU</TableCell>
                          <TableCell align="center" sx={{ color: 'white', fontWeight: 600 }}>Actions</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {containers.map((container, idx) => (
                          <TableRow 
                            key={container.id || container.containerType + '-' + idx}
                            sx={{ 
                              '&:nth-of-type(odd)': { backgroundColor: '#f8f9fa' },
                              '&:hover': { backgroundColor: '#e3f2fd' }
                            }}
                          >
                            <TableCell>
                              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                <Avatar sx={{ 
                                  width: 32, 
                                  height: 32, 
                                  mr: 2,
                                  background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)'
                                }}>
                                  <ContainerIcon />
                                </Avatar>
                                <Typography variant="body1" sx={{ fontWeight: 500 }}>
                                  {container.containerType}
                                </Typography>
                              </Box>
                            </TableCell>
                            <TableCell>
                              <Chip 
                                label={container.quantity} 
                                color="primary"
                                sx={{ fontWeight: 600 }}
                              />
                            </TableCell>
                            <TableCell>{getTEU(container.containerType)}</TableCell>
                            <TableCell>{(getTEU(container.containerType) * (container.quantity || 1)).toLocaleString(undefined, { maximumFractionDigits: 2 })}</TableCell>
                            <TableCell align="center">
                              <IconButton 
                                onClick={() => removeContainer(container.id)}
                                sx={{
                                  color: '#e74c3c',
                                  '&:hover': {
                                    backgroundColor: 'rgba(231, 76, 60, 0.1)',
                                    transform: 'scale(1.1)',
                                  },
                                  transition: 'all 0.2s ease-in-out'
                                }}
                              >
                                <DeleteIcon />
                              </IconButton>
                            </TableCell>
                          </TableRow>
                        ))}
                        {/* Ligne total TEU */}
                        <TableRow>
                          <TableCell colSpan={3} align="right" sx={{ fontWeight: 700 }}>Total TEU</TableCell>
                          <TableCell sx={{ fontWeight: 700 }}>{totalTEU.toLocaleString(undefined, { maximumFractionDigits: 2 })}</TableCell>
                          <TableCell />
                        </TableRow>
                      </TableBody>
                    </Table>
                  </TableContainer>
                )}

                {/* Résumé des conteneurs */}
                {containers.length > 0 && (
                  <Box sx={{ 
                    mt: 4, 
                    p: 3, 
                    bgcolor: 'rgba(86, 171, 47, 0.05)', 
                    borderRadius: 2,
                    border: '1px solid rgba(86, 171, 47, 0.2)'
                  }}>
                    <Typography variant="h6" sx={{ mb: 2, color: '#2c3e50' }}>
                      Résumé des conteneurs
                    </Typography>
                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={4}>
                        <Typography variant="body2" color="text.secondary">
                          Total conteneurs: <strong>{containers.reduce((sum, c) => sum + c.quantity, 0)}</strong>
                        </Typography>
                      </Grid>
                      <Grid item xs={12} sm={4}>
                        <Typography variant="body2" color="text.secondary">
                          Total TEU: <strong>{containers.reduce((sum, c) => sum + (c.quantity * c.teu), 0)}</strong>
                        </Typography>
                      </Grid>
                      <Grid item xs={12} sm={4}>
                        <Typography variant="body2" color="text.secondary">
                          Types: <strong>{[...new Set(containers.map(c => c.type))].join(', ')}</strong>
                        </Typography>
                      </Grid>
                    </Grid>
                  </Box>
                )}

                {/* Validation Status */}
                {validationErrors.length > 0 && (
                  <Alert severity="error" sx={{ mt: 3 }}>
                    <Typography variant="subtitle2" gutterBottom>
                      Erreurs de validation:
                    </Typography>
                    <ul>
                      {validationErrors.map((error, index) => (
                        <li key={index}>{error}</li>
                      ))}
                    </ul>
                  </Alert>
                )}
              </CardContent>
            </Card>
          </Slide>

          {/* Section Services */}
          <Slide direction="up" in timeout={1400}>
            <Card sx={{ 
              mb: 4, 
              borderRadius: 3,
              boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
              background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)'
            }}>
              <CardContent sx={{ p: 4 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                  <Avatar sx={{ 
                    bgcolor: 'success.main', 
                    mr: 2,
                    background: 'linear-gradient(135deg, #56ab2f 0%, #a8e6cf 100%)'
                  }}>
                    <ServiceIcon />
                  </Avatar>
                  <Typography variant="h5" sx={{ fontWeight: 600, color: '#2c3e50' }}>
                    Services disponibles
                  </Typography>
                  <Chip 
                    label={`${step2Data.selected.length} sélectionné${step2Data.selected.length > 1 ? 's' : ''}`}
                    color="success" 
                    sx={{ ml: 2 }}
                  />
                </Box>

                {loadingServices ? (
                  <Box sx={{ 
                    display: 'flex', 
                    justifyContent: 'center', 
                    alignItems: 'center', 
                    py: 8 
                  }}>
                    <Box sx={{ textAlign: 'center' }}>
                      <CircularProgress 
                        size={60}
                        sx={{
                          color: '#56ab2f',
                          mb: 2
                        }}
                      />
                      <Typography variant="h6" sx={{ color: '#7f8c8d' }}>
                        Chargement des services...
                      </Typography>
                    </Box>
                  </Box>
                ) : (
                  <>
                    {paginatedServices.length === 0 ? (
                      <Box sx={{ 
                        textAlign: 'center', 
                        py: 8,
                        color: '#7f8c8d'
                      }}>
                        <ServiceIcon sx={{ fontSize: 64, mb: 2, opacity: 0.5 }} />
                        <Typography variant="h6">Aucun service disponible</Typography>
                        <Typography variant="body2">
                          Aucun service ne correspond aux critères sélectionnés
                        </Typography>
                      </Box>
                    ) : (
                      <List sx={{ p: 0 }}>
                        {paginatedServices.map((service, idx) => {
                          const isSelected = step2Data.selected.some((s) => 
                            s.serviceId === service.serviceId || 
                            s.serviceName === service.serviceName
                          );
                          
                          return (
                            <ListItem
                              key={service.serviceId || service.name + '-' + idx}
                              component="div"
                              onClick={() => handleToggle(service)}
                              sx={{ 
                                cursor: 'pointer', 
                                display: 'flex', 
                                alignItems: 'center', 
                                justifyContent: 'space-between',
                                mb: 1,
                                p: 1.2,
                                borderRadius: 2,
                                minHeight: 48,
                                backgroundColor: isSelected ? 'rgba(86, 171, 47, 0.08)' : '#f8f9fa',
                                border: isSelected ? '2px solid #56ab2f' : '2px solid transparent',
                                '&:hover': {
                                  backgroundColor: isSelected ? 'rgba(86, 171, 47, 0.13)' : '#e9ecef',
                                  transform: 'translateY(-1px)',
                                  boxShadow: '0 2px 8px rgba(0,0,0,0.07)',
                                },
                                transition: 'all 0.2s ease-in-out'
                              }}
                            >
                              <Box sx={{ display: 'flex', alignItems: 'center', flex: 1 }}>
                                <Checkbox
                                  checked={isSelected}
                                  tabIndex={-1}
                                  sx={{
                                    color: '#56ab2f',
                                    p: 0.5,
                                    '&.Mui-checked': {
                                      color: '#56ab2f',
                                    }
                                  }}
                                />
                                <Box sx={{ ml: 1.2, flex: 1 }}>
                                  <Typography variant="subtitle1" sx={{ 
                                    fontWeight: 600, 
                                    color: '#2c3e50',
                                    mb: 0.2,
                                    fontSize: '1rem'
                                  }}>
                                    {service.name || service.serviceName || 'Service'}
                                  </Typography>
                                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <Typography variant="caption" sx={{ 
                                      fontWeight: 600,
                                      color: '#56ab2f',
                                      fontSize: '0.85rem'
                                    }}>
                                      Usage: {service.usagePercent || 0}%
                                    </Typography>
                                    <Box sx={{ width: 70, flex: 1 }}>
                                      <LinearProgress 
                                        variant="determinate" 
                                        value={service.usagePercent || 0}
                                        sx={{
                                          height: 6,
                                          borderRadius: 3,
                                          backgroundColor: '#e0e0e0',
                                          '& .MuiLinearProgress-bar': {
                                            background: 'linear-gradient(135deg, #56ab2f 0%, #a8e6cf 100%)',
                                            borderRadius: 3,
                                          }
                                        }}
                                      />
                                    </Box>
                                  </Box>
                                </Box>
                              </Box>
                              {isSelected && (
                                <CheckCircleIcon 
                                  sx={{ 
                                    color: '#56ab2f', 
                                    fontSize: 22,
                                    ml: 1
                                  }} 
                                />
                              )}
                            </ListItem>
                          );
                        })}
                      </List>
                    )}

                    {/* Pagination pour les services */}
                    {pageCount > 1 && (
                      <Box sx={{ 
                        display: 'flex', 
                        justifyContent: 'center', 
                        mt: 4 
                      }}>
                        <Pagination
                          count={pageCount}
                          page={servicesPage}
                          onChange={(_, value) => setServicesPage(value)}
                          color="primary"
                          size="large"
                          sx={{
                            '& .MuiPaginationItem-root': {
                              borderRadius: 2,
                              fontWeight: 600,
                            },
                            '& .Mui-selected': {
                              background: 'linear-gradient(135deg, #56ab2f 0%, #a8e6cf 100%)',
                              color: 'white',
                            }
                          }}
                        />
                      </Box>
                    )}
                  </>
                )}
              </CardContent>
            </Card>
          </Slide>

          {/* Messages d'erreur et de validation */}
          <Slide direction="up" in timeout={1600}>
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4, flexDirection: 'column', alignItems: 'center' }}>
              {portsError && (
                <Alert severity="error" sx={{ mb: 2, width: '100%', maxWidth: 600 }}>
                  Erreur lors du chargement des ports: {portsError.message || 'Erreur inconnue'}
                </Alert>
              )}
              {(!(localPortFrom || requestData.portFrom) || !(localPortTo || requestData.portTo)) && (
                <Alert severity="warning" sx={{ mb: 2, width: '100%', maxWidth: 600 }}>
                  Merci de renseigner le port de départ et le port de destination pour continuer.
                </Alert>
              )}
              {triedNext && containers.length === 0 && (
                <Alert severity="error" sx={{ mb: 2, width: '100%', maxWidth: 600 }}>
                  Merci d'ajouter au moins un container pour continuer.
                </Alert>
              )}
            </Box>
          </Slide>

          {/* Actions */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
            <Button
              variant="outlined"
              onClick={onBack}
              startIcon={<ArrowBackIcon />}
              sx={{
                borderRadius: 2,
                px: 4,
                py: 1.5,
                fontWeight: 600,
                textTransform: 'none',
                fontSize: '1rem'
              }}
            >
              Retour
            </Button>
            <Button
              variant="contained"
              onClick={handleNext}
              endIcon={<ArrowForwardIcon />}
              sx={{
                borderRadius: 2,
                px: 4,
                py: 1.5,
                fontWeight: 600,
                textTransform: 'none',
                fontSize: '1rem',
                background: 'linear-gradient(135deg, #56ab2f 0%, #a8e6cf 100%)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #4a9a2a 0%, #96d4b8 100%)',
                }
              }}
            >
              Continuer
            </Button>
          </Box>
        </Box>
      </Fade>
    </Box>
  );
}
