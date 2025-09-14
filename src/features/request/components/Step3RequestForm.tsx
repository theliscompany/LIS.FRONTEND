import React, { useState, useEffect, useMemo, useRef } from "react";
import { useTranslation } from "react-i18next";
import { 
  Box, 
  Typography, 
  Button, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow, 
  Paper, 
  Select, 
  MenuItem, 
  Grid, 
  IconButton, 
  TextField, 
  Autocomplete,
  Card,
  CardContent,
  Chip,
  Fade,
  Slide,
  Avatar,
  LinearProgress,
  CircularProgress,
  ButtonGroup,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Alert
} from "@mui/material";
// @ts-ignore
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import BusinessIcon from '@mui/icons-material/Business';
// @ts-ignore
import LocationOnIcon from '@mui/icons-material/LocationOn';
// @ts-ignore
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import AssignmentIcon from '@mui/icons-material/Assignment';
// @ts-ignore
import InventoryIcon from '@mui/icons-material/Inventory';
// @ts-ignore
import SupportIcon from '@mui/icons-material/Support';
// @ts-ignore
import DirectionsBoatIcon from '@mui/icons-material/DirectionsBoat';
import { useQuery } from '@tanstack/react-query';
import { getApiPortOptions } from '@features/masterdata/api/@tanstack/react-query.gen';
import OfferBasketDrawerAccordion from './OfferBasketDrawerAccordion';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { getTotalTEU } from '../../../utils/functions';

interface Step3RequestFormProps {
  requestData: any;
  selectedServices: any[];
  selectedContainers: { [serviceId: string]: any };
  onContainerChange: (serviceId: string, container: any, totalTEU?: number) => void;
  containerPackages: any[];
  onBack: () => void;
  onNext: () => void;
  onServicesChange?: (services: any[]) => void;
  onRequestDataChange: (newData: any) => void;
  selectedHaulage?: any;
  selectedSeafreight?: any;
  selectedMiscellaneous?: any[];
  services: any[];
  contacts: any[];
}

interface ContainerItem {
  id: string;
  containerType: string;
  quantity: number;
}

const Step3RequestForm: React.FC<Step3RequestFormProps> = ({
  requestData,
  selectedServices,
  selectedContainers,
  onContainerChange,
  containerPackages,
  onBack,
  onNext,
  onServicesChange,
  onRequestDataChange,
  selectedHaulage,
  selectedSeafreight,
  selectedMiscellaneous,
  services,
  contacts
}) => {
  const { t } = useTranslation();
  const [containers, setContainers] = useState<ContainerItem[]>([]);
  const [newContainerType, setNewContainerType] = useState<string>("");
  const [newQuantity, setNewQuantity] = useState<number>(1);
  
  const [availableServices, setAvailableServices] = useState<any[]>([]);
  const [loadingServices, setLoadingServices] = useState(false);
  const [newService, setNewService] = useState<any>(null);

  const [portFromSearch, setPortFromSearch] = useState("");
  const [portToSearch, setPortToSearch] = useState("");
  const [openPortFromAutocomplete, setOpenPortFromAutocomplete] = useState(false);
  const [openPortToAutocomplete, setOpenPortToAutocomplete] = useState(false);

  // === NOUVEAUX ÉTATS POUR LE REFUS DES SUGGESTIONS ===
  const [userRejectedAutoPortFrom, setUserRejectedAutoPortFrom] = useState(false);
  const [userRejectedAutoPortTo, setUserRejectedAutoPortTo] = useState(false);
  const [showManualPortSelection, setShowManualPortSelection] = useState(false);

  const [localSelectedMiscellaneous, setLocalSelectedMiscellaneous] = useState<any[]>(selectedMiscellaneous ?? []);

  // États pour l'édition des services personnalisés
  const [editingService, setEditingService] = useState<string | null>(null);
  const [editServiceName, setEditServiceName] = useState<string>('');

  // État local pour les services sélectionnés (fallback)
  const [localSelectedServices, setLocalSelectedServices] = useState<any[]>(selectedServices ?? []);

  // Ajout d'un état pour savoir si la validation a été tentée
  const [triedNext, setTriedNext] = useState(false);
  // Ajout de refs pour les Autocomplete si besoin de relecture DOM (optionnel)
  const portFromRef = useRef<HTMLInputElement | null>(null);
  const portToRef = useRef<HTMLInputElement | null>(null);

  // ✅ Log des données reçues pour débogage
  useEffect(() => {
    console.log('🔧 [STEP3] Données reçues dans requestData:', {
      step1: requestData?.step1,
      customer: requestData?.step1?.customer,
      cityFrom: requestData?.step1?.cityFrom,
      cityTo: requestData?.step1?.cityTo,
      productName: requestData?.step1?.productName,
      incotermName: requestData?.step1?.incotermName,
      comment: requestData?.step1?.comment
    });
    
    // ✅ NOUVEAU: Log des services sélectionnés
    console.log('🔧 [STEP3] Services sélectionnés reçus:', {
      selectedServices: selectedServices,
      selectedServicesCount: selectedServices?.length || 0,
      step2: requestData?.step2,
      step2SelectedServices: requestData?.step2?.selectedServices,
      step2Selected: requestData?.step2?.selected
    });
    
    // ✅ NOUVEAU: Log des types de conteneurs
    console.log('🔧 [STEP3] Types de conteneurs reçus:', {
      containerPackages: containerPackages,
      containerPackagesCount: containerPackages?.length || 0,
      containerPackagesDetails: containerPackages?.map(pkg => ({ id: pkg.packageId, name: pkg.packageName }))
    });
  }, [requestData, selectedServices, containerPackages]);

  // Handler Next avec revalidation stricte
  const handleNext = () => {
    setTriedNext(true);
    // Revalidation stricte avant de passer à l'étape suivante
    const portFromValid = !!requestData.portFrom;
    const portToValid = !!requestData.portTo;
    const containersValid = containers.length > 0;
    if (portFromValid && portToValid && containersValid) {
      onNext();
    } else {
      // Optionnel : focus sur le premier champ manquant
      if (!portFromValid && portFromRef.current) portFromRef.current.focus();
      else if (!portToValid && portToRef.current) portToRef.current.focus();
    }
  };

  useEffect(() => {
    if (selectedMiscellaneous) {
      setLocalSelectedMiscellaneous(selectedMiscellaneous);
    }
  }, [selectedMiscellaneous]);

  useEffect(() => {
    if (selectedServices) {
      setLocalSelectedServices(selectedServices);
    }
  }, [selectedServices]);

  // Chargement des ports via React Query avec configuration temporaire
  // Chargement automatique au lieu d'attendre l'ouverture de l'autocomplete
  const { data: portsData, isLoading: isLoadingPorts, error: portsError } = useQuery({
    ...getApiPortOptions({
      baseURL: 'https://localhost:7271'
    }),
    enabled: true, // Chargement automatique pour afficher les suggestions au démarrage
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });

  // Extraction des données de ports
  const allPorts = Array.isArray(portsData) ? portsData : [];



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

  useEffect(() => {
    const fetchServices = async () => {
      setLoadingServices(true);
      const params = new URLSearchParams({
        departureCountry: requestData?.step1?.cityFrom?.country || requestData?.cityFrom?.country || '',
        destinationCountry: requestData?.step1?.cityTo?.country || requestData?.cityTo?.country || '',
        productName: requestData?.step1?.productName?.productName || requestData?.productName?.productName || '',
        incotermName: requestData?.step1?.incotermName || requestData?.incotermName || '',
        comment: requestData?.step1?.comment || requestData?.comment || ''
      });
      try {
        const res = await fetch(`http://localhost:5007/api/ServiceStatistics/usage-by-country?${params}`);
        const data = await res.json();
        if (Array.isArray(data)) {
          setAvailableServices(data);
        } else if (data && Array.isArray(data.$values)) {
          setAvailableServices(data.$values);
        } else {
          setAvailableServices([]);
        }
      } catch (e) {
        setAvailableServices([]);
        console.error("Erreur lors du chargement des services:", e);
      }
      setLoadingServices(false);
    };
    fetchServices();
  }, [requestData]);

  // Synchronisation initiale avec les conteneurs depuis step3.containers
  useEffect(() => {
    console.log('🔧 [STEP3] Chargement des conteneurs depuis requestData.step3:', {
      step3: requestData?.step3,
      containers: requestData?.step3?.containers,
      containersLength: requestData?.step3?.containers?.length || 0
    });
    
    if (requestData?.step3?.containers && Array.isArray(requestData.step3.containers)) {
      // Transformer les containers de step3 vers la structure d'affichage
      const containersForDisplay = requestData.step3.containers.map((container: any) => ({
        id: container.id || Date.now().toString(),
        containerType: container.containerType || container.type, // Support des deux structures
        quantity: container.quantity || 1
      }));
      
      console.log('🔧 [STEP3] Conteneurs chargés pour l\'affichage:', containersForDisplay);
      setContainers(containersForDisplay);
    } else if (selectedContainers && Array.isArray(selectedContainers.list)) {
      // Fallback vers selectedContainers si step3.containers n'existe pas
      console.log('🔧 [STEP3] Fallback vers selectedContainers:', selectedContainers);
      const containersForDisplay = selectedContainers.list.map(container => ({
        id: container.id || Date.now().toString(),
        containerType: container.containerType || container.type,
        quantity: container.quantity || 1
      }));
      
      setContainers(containersForDisplay);
    }
  }, [requestData?.step3?.containers, selectedContainers]);

  const addContainer = () => {
    if (newContainerType && newQuantity > 0) {
      const newContainer: ContainerItem = {
        id: Date.now().toString(),
        containerType: newContainerType,
        quantity: newQuantity
      };
      const updatedContainers = [...containers, newContainer];
      setContainers(updatedContainers);
      
      console.log('🔄 [STEP3] addContainer appelé avec:', {
        newContainerType,
        newQuantity,
        newContainer,
        updatedContainers: updatedContainers.length
      });
      
      // Persistance globale + calcul TEU avec structure correcte pour la validation
      if (onContainerChange) {
        const totalTEU = getTotalTEU(updatedContainers);
        
        // Transformer les containers vers la structure attendue par la validation
        const containersForValidation = updatedContainers.map(container => ({
          id: container.id,
          type: container.containerType, // 'type' au lieu de 'containerType' pour la validation
          containerType: container.containerType, // Garder aussi pour l'affichage
          quantity: container.quantity,
          teu: getTEU(container.containerType)
        }));
        
        console.log('🔄 [STEP3] Appel de onContainerChange avec:', {
          serviceId: 'list',
          container: containersForValidation,
          totalTEU
        });

        onContainerChange('list', containersForValidation, totalTEU);
      }
      setNewContainerType("");
      setNewQuantity(1);
    }
  };

  const removeContainer = (id: string) => {
    const updatedContainers = containers.filter(container => container.id !== id);
    setContainers(updatedContainers);
    
    console.log('🔄 [STEP3] removeContainer appelé avec:', {
      id,
      updatedContainers: updatedContainers.length
    });
    
    // Persistance globale + calcul TEU avec structure correcte pour la validation
    if (onContainerChange) {
      const totalTEU = getTotalTEU(updatedContainers);
      
      // Transformer les containers vers la structure attendue par la validation
      const containersForValidation = updatedContainers.map(container => ({
        id: container.id,
        type: container.containerType, // 'type' au lieu de 'containerType' pour la validation
        containerType: container.containerType, // Garder aussi pour l'affichage
        quantity: container.quantity,
        teu: getTEU(container.containerType)
      }));
      
      console.log('🔄 [STEP3] Appel de onContainerChange (remove) avec:', {
        serviceId: 'list',
        container: containersForValidation,
        totalTEU
      });

        onContainerChange('list', containersForValidation, totalTEU);
    }
  };

  const addService = () => {
     
    if (newService) {
      // Vérification plus robuste des doublons
      const isDuplicate = localSelectedServices.some(s => {
        // Vérifier par serviceId si disponible
        if (s.serviceId && newService.serviceId && s.serviceId === newService.serviceId) {
          return true;
        }
        // Vérifier par nom si serviceId n'est pas disponible
        if (s.name && newService.name && s.name.toLowerCase() === newService.name.toLowerCase()) {
          return true;
        }
        if (s.serviceName && newService.serviceName && s.serviceName.toLowerCase() === newService.serviceName.toLowerCase()) {
          return true;
        }
        return false;
      });


      if (!isDuplicate) {
        // Ajouter un ID unique si le service n'en a pas
        const serviceToAdd = {
          ...newService,
          serviceId: newService.serviceId || `custom_${Date.now()}`,
          usagePercent: newService.usagePercent || 0
        };
        
        const updatedServices = [...localSelectedServices, serviceToAdd];
   
        
        // Mettre à jour l'état local
        setLocalSelectedServices(updatedServices);
        
        // Appeler la fonction de callback
        if (onServicesChange) {
       
          onServicesChange(updatedServices);
        } else {
  
        }
        
        setNewService(null);
        
        // Feedback visuel

      } else {

        // Ici on pourrait ajouter une notification à l'utilisateur
      }
    } else {
      
    }
  };

  const removeService = (serviceId: string) => {
    const updatedServices = localSelectedServices.filter(s => s.serviceId !== serviceId);
    setLocalSelectedServices(updatedServices);
    
    if (onServicesChange) {
      onServicesChange(updatedServices);
    }
  };

  // Fonction pour créer un service personnalisé
  const createCustomService = () => {
    
    const customService = {
      serviceId: `custom_${Date.now()}`,
      name: `Service personnalisé ${localSelectedServices.length + 1}`,
      serviceName: `Service personnalisé ${localSelectedServices.length + 1}`,
      usagePercent: 0,
      isCustom: true
    };
    

    
    const updatedServices = [...localSelectedServices, customService];
    
    
    // Mettre à jour l'état local
    setLocalSelectedServices(updatedServices);
    
    // Appeler la fonction de callback
    if (onServicesChange) {
     
      onServicesChange(updatedServices);
    } else {
      
    }
    
    
  };

  // Fonction pour vérifier si un service est déjà sélectionné
  const isServiceSelected = (service: any) => {
    return localSelectedServices.some(s => {
      if (s.serviceId && service.serviceId && s.serviceId === service.serviceId) {
        return true;
      }
      if (s.name && service.name && s.name.toLowerCase() === service.name.toLowerCase()) {
        return true;
      }
      if (s.serviceName && service.serviceName && s.serviceName.toLowerCase() === service.serviceName.toLowerCase()) {
        return true;
      }
      return false;
    });
  };

  // Services disponibles filtrés (excluant ceux déjà sélectionnés)
  const availableServicesFiltered = useMemo(() => {
    return availableServices.filter(service => !isServiceSelected(service));
  }, [availableServices, localSelectedServices]);

  // Fonction pour éditer un service personnalisé
  const startEditingService = (serviceId: string, currentName: string) => {
    setEditingService(serviceId);
    setEditServiceName(currentName);
  };

  const saveServiceEdit = () => {
    if (editingService && editServiceName.trim()) {
      const updatedServices = localSelectedServices.map(service => 
        service.serviceId === editingService 
          ? { ...service, name: editServiceName.trim(), serviceName: editServiceName.trim() }
          : service
      );
      setLocalSelectedServices(updatedServices);
      
      if (onServicesChange) {
        onServicesChange(updatedServices);
      }
      
      setEditingService(null);
      setEditServiceName('');
    }
  };

  const cancelServiceEdit = () => {
    setEditingService(null);
    setEditServiceName('');
  };

  // Ajout des labels robustes pour l'affichage
  const getCustomerLabel = () => {
    if (requestData?.step1?.customer?.contactName) return requestData.step1.customer.contactName;
    if (requestData?.step1?.customer?.companyName) return requestData.step1.customer.companyName;
    if (requestData?.step1?.customer?.name) return requestData.step1.customer.name;
    if (requestData?.customer?.contactName) return requestData.customer.contactName;
    if (requestData?.customer?.name) return requestData.customer.name;
    if (requestData?.customerName) return requestData.customerName;
    if (requestData?.contactName) return requestData.contactName;
    return '-';
  };

  const getDepartureLabel = () => {
    if (requestData?.step1?.cityFrom?.name && requestData?.step1?.cityFrom?.country) {
      return `${requestData.step1.cityFrom.name}, ${requestData.step1.cityFrom.country.toUpperCase()}`;
    }
    if (requestData?.step1?.cityFrom?.name) return requestData.step1.cityFrom.name;
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
  };

  const getArrivalLabel = () => {
    if (requestData?.step1?.cityTo?.name && requestData?.step1?.cityTo?.country) {
      return `${requestData.step1.cityTo.name}, ${requestData.step1.cityTo.country.toUpperCase()}`;
    }
    if (requestData?.step1?.cityTo?.name) return requestData.step1.cityTo.name;
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
  };

  const getProductLabel = () => {
    if (requestData?.step1?.productName && typeof requestData.step1.productName === 'object' && requestData.step1.productName.productName) {
      return requestData.step1.productName.productName;
    }
    if (typeof requestData?.step1?.productName === 'string' && requestData.step1.productName) {
      return requestData.step1.productName;
    }
    if (requestData?.productName && typeof requestData.productName === 'object' && requestData.productName.productName) {
      return requestData.productName.productName;
    }
    if (typeof requestData?.productName === 'string' && requestData.productName) {
      return requestData.productName;
    }
    if (requestData?.step1?.productId && Array.isArray(services)) {
      const found = services.find(p => p.productId === requestData.step1.productId);
      if (found && found.productName) return found.productName;
    }
    if (requestData?.productId && Array.isArray(services)) {
      const found = services.find(p => p.productId === requestData.productId);
      if (found && found.productName) return found.productName;
    }
    if (requestData?.step1?.product) return requestData.step1.product;
    if (requestData?.product) return requestData.product;
    return '-';
  };

  const getIncotermLabel = () => {
    if (requestData?.step1?.incotermName) return requestData.step1.incotermName;
    if (requestData?.step1?.incoterm) return requestData.step1.incoterm;
    if (requestData?.incotermName) return requestData.incotermName;
    if (requestData?.incoterm) return requestData.incoterm;
    if (requestData?.incoterms) return requestData.incoterms;
    return '-';
  };

  const getCommentLabel = () => {
    if (requestData?.step1?.comment) return requestData.step1.comment;
    if (requestData?.step1?.description) return requestData.step1.description;
    if (requestData?.comment) return requestData.comment;
    if (requestData?.description) return requestData.description;
    if (requestData?.notes) return requestData.notes;
    return '-';
  };

  const departureLabel = getDepartureLabel();
  const arrivalLabel = getArrivalLabel();
  const productLabel = getProductLabel();
  const customerLabel = getCustomerLabel();
  const incotermLabel = getIncotermLabel();
  const commentLabel = getCommentLabel();

  // Fonction utilitaire pour calculer le TEU d'un container
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

  // === NOUVELLE LOGIQUE : PRÉ-SÉLECTION AUTOMATIQUE DES PORTS ===
  
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
    
    if (exactMatch) {
      
      return exactMatch;
    }
    
    // 2. Correspondance partielle ville + pays
    const partialMatch = ports.find(port => {
      const portName = port.portName?.toLowerCase() || '';
      const portCountry = port.country?.toLowerCase() || '';
      const cityNameLower = cityName.toLowerCase();
      const countryLower = country.toLowerCase();
      
      return (portName.includes(cityNameLower) || cityNameLower.includes(portName)) && 
             (portCountry === countryLower || portCountry.includes(countryLower) || countryLower.includes(portCountry));
    });
    
    if (partialMatch) {
      
      return partialMatch;
    }
    
    // 3. Correspondance par pays seulement
    const countryMatch = ports.find(port => {
      const portCountry = port.country?.toLowerCase() || '';
      const countryLower = country.toLowerCase();
      
      return portCountry === countryLower || portCountry.includes(countryLower) || countryLower.includes(portCountry);
    });
    
    if (countryMatch) {
      
      return countryMatch;
    }
    
    return null;
  };

  // Pré-sélection automatique des ports quand les données sont disponibles
  useEffect(() => {
    if (allPorts.length > 0 && !requestData.portFrom && (requestData?.step1?.cityFrom || requestData?.cityFrom) && !userRejectedAutoPortFrom) {
      const cityFrom = requestData?.step1?.cityFrom || requestData?.cityFrom;
      const bestPortFrom = findBestMatchingPort(cityFrom, allPorts);
      if (bestPortFrom) {
  
        onRequestDataChange({ ...requestData, portFrom: bestPortFrom });
      }
    }
  }, [allPorts, requestData?.step1?.cityFrom, requestData?.cityFrom, requestData.portFrom, userRejectedAutoPortFrom]);

  useEffect(() => {
    if (allPorts.length > 0 && !requestData.portTo && (requestData?.step1?.cityTo || requestData?.cityTo) && !userRejectedAutoPortTo) {
      const cityTo = requestData?.step1?.cityTo || requestData?.cityTo;
      const bestPortTo = findBestMatchingPort(cityTo, allPorts);
      if (bestPortTo) {
  
        onRequestDataChange({ ...requestData, portTo: bestPortTo });
      }
    }
  }, [allPorts, requestData?.step1?.cityTo, requestData?.cityTo, requestData.portTo, userRejectedAutoPortTo]);

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

  // === NOUVELLES FONCTIONS POUR LE REFUS DES SUGGESTIONS ===
  
  // Fonction pour refuser la suggestion automatique du port de départ
  const rejectAutoPortFrom = () => {
    setUserRejectedAutoPortFrom(true);
    onRequestDataChange({ ...requestData, portFrom: null });
    
  };

  // Fonction pour refuser la suggestion automatique du port d'arrivée
  const rejectAutoPortTo = () => {
    setUserRejectedAutoPortTo(true);
    onRequestDataChange({ ...requestData, portTo: null });
    
  };

  // Fonction pour réinitialiser les refus (permettre à nouveau les suggestions)
  const resetPortRejections = () => {
    setUserRejectedAutoPortFrom(false);
    setUserRejectedAutoPortTo(false);
    
  };

  // Fonction pour basculer vers la sélection manuelle
  const toggleManualSelection = () => {
    setShowManualPortSelection(!showManualPortSelection);
  };

  return (
    <Box sx={{ 
      background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
      minHeight: '100vh',
      p: 3
    }}>
      <Fade in timeout={800}>
        <Box>
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
              Offer Design
            </Typography>
            <Typography variant="h6" sx={{ opacity: 0.9 }}>
              {t('requestWizard.step3.summarySubtitle')}
            </Typography>
          </Box>

          <Slide direction="up" in timeout={1000}>
            <Accordion defaultExpanded sx={{ mb: 4, borderRadius: 3, boxShadow: '0 10px 30px rgba(0,0,0,0.1)', background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)' }}>
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
              </AccordionDetails>
            </Accordion>
          </Slide>

          {/* --- SECTION PORTS (séparée) --- */}
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
                    {t('departurePort', 'Departure port')} & {t('destinationPort', 'Destination port')}
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
                
                {/* Suggestions de ports (seulement si pas en mode manuel) */}
                {!showManualPortSelection && (requestData?.step1?.cityFrom || requestData?.cityFrom) && allPorts.length > 0 && (
                  <Box sx={{ mb: 2, p: 2, borderRadius: 2, background: 'rgba(25, 118, 210, 0.05)', border: '1px solid rgba(25, 118, 210, 0.2)' }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                      <Typography variant="caption" sx={{ color: '#1976d2', fontWeight: 600 }}>
                        💡 Suggestions pour {(requestData?.step1?.cityFrom || requestData?.cityFrom)?.name || (requestData?.step1?.cityFrom || requestData?.cityFrom)?.cityName}:
                      </Typography>
                      {requestData.portFrom && (
                        <Button
                          size="small"
                          variant="text"
                          onClick={rejectAutoPortFrom}
                          sx={{ color: '#f44336', fontSize: '0.7rem' }}
                        >
                          ❌ Refuser
                        </Button>
                      )}
                    </Box>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                      {suggestAlternativePorts(requestData?.step1?.cityFrom || requestData?.cityFrom, allPorts).map((port, idx) => (
                        <Chip
                          key={port.portId || idx}
                          label={`${port.portName}, ${port.country}`}
                          size="small"
                          variant={requestData.portFrom?.portId === port.portId ? "filled" : "outlined"}
                          color={requestData.portFrom?.portId === port.portId ? "primary" : "default"}
                          onClick={() => onRequestDataChange({ ...requestData, portFrom: port })}
                          sx={{ 
                            cursor: 'pointer',
                            '&:hover': { backgroundColor: 'rgba(25, 118, 210, 0.1)' }
                          }}
                        />
                      ))}
                    </Box>
                  </Box>
                )}
                
                {!showManualPortSelection && (requestData?.step1?.cityTo || requestData?.cityTo) && allPorts.length > 0 && (
                  <Box sx={{ mb: 2, p: 2, borderRadius: 2, background: 'rgba(22, 160, 133, 0.05)', border: '1px solid rgba(22, 160, 133, 0.2)' }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                      <Typography variant="caption" sx={{ color: '#16a085', fontWeight: 600 }}>
                        💡 Suggestions pour {(requestData?.step1?.cityTo || requestData?.cityTo)?.name || (requestData?.step1?.cityTo || requestData?.cityTo)?.cityName}:
                      </Typography>
                      {requestData.portTo && (
                        <Button
                          size="small"
                          variant="text"
                          onClick={rejectAutoPortTo}
                          sx={{ color: '#f44336', fontSize: '0.7rem' }}
                        >
                          ❌ Refuser
                        </Button>
                      )}
                    </Box>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                      {suggestAlternativePorts(requestData?.step1?.cityTo || requestData?.cityTo, allPorts).map((port, idx) => (
                        <Chip
                          key={port.portId || idx}
                          label={`${port.portName}, ${port.country}`}
                          size="small"
                          variant={requestData.portTo?.portId === port.portId ? "filled" : "outlined"}
                          color={requestData.portTo?.portId === port.portId ? "success" : "default"}
                          onClick={() => onRequestDataChange({ ...requestData, portTo: port })}
                          sx={{ 
                            cursor: 'pointer',
                            '&:hover': { backgroundColor: 'rgba(22, 160, 133, 0.1)' }
                          }}
                        />
                      ))}
                    </Box>
                  </Box>
                )}
                
                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <DirectionsBoatIcon sx={{ color: '#2980b9', mr: 1 }} />
                      <Typography variant="body1" sx={{ fontWeight: 500 }}>
                        <strong>{t('departurePort', 'Departure port')}:</strong>
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
                      value={requestData.portFrom || null}
                      onChange={(_, value) => onRequestDataChange({ ...requestData, portFrom: value })}
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
                          label={t('departurePort', 'Departure port')}
                          variant="outlined"
                          required
                          error={triedNext && !requestData.portFrom}
                          helperText={
                            triedNext && !requestData.portFrom 
                              ? t('Ce champ est requis') 
                              : requestData.portFrom && (requestData?.step1?.cityFrom || requestData?.cityFrom) && !userRejectedAutoPortFrom
                                ? `✅ Pré-sélectionné pour ${(requestData?.step1?.cityFrom || requestData?.cityFrom)?.name || (requestData?.step1?.cityFrom || requestData?.cityFrom)?.cityName}`
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
                          inputRef={portFromRef}
                        />
                      )}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <DirectionsBoatIcon sx={{ color: '#16a085', mr: 1 }} />
                      <Typography variant="body1" sx={{ fontWeight: 500 }}>
                        <strong>{t('destinationPort', 'Destination port')}:</strong>
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
                      value={requestData.portTo || null}
                      onChange={(_, value) => onRequestDataChange({ ...requestData, portTo: value })}
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
                          label={t('destinationPort', 'Destination port')}
                          variant="outlined"
                          required
                          error={triedNext && !requestData.portTo}
                          helperText={
                            triedNext && !requestData.portTo 
                              ? t('Ce champ est requis') 
                              : requestData.portTo && (requestData?.step1?.cityTo || requestData?.cityTo) && !userRejectedAutoPortTo
                                ? `✅ Pré-sélectionné pour ${(requestData?.step1?.cityTo || requestData?.cityTo)?.name || (requestData?.step1?.cityTo || requestData?.cityTo)?.cityName}`
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
                          inputRef={portToRef}
                        />
                      )}
                    />
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Slide>

          {/* --- SECTION CONTAINERS (d'abord) --- */}
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
                    bgcolor: 'warning.main', 
                    mr: 2,
                    background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)'
                  }}>
                    <InventoryIcon />
                  </Avatar>
                  <Typography variant="h5" sx={{ fontWeight: 600, color: '#2c3e50' }}>
                    {t('requestWizard.step3.containersTitle')}
                    <Chip 
                      label={containers.length} 
                      color="warning" 
                      sx={{ ml: 2 }}
                    />
                  </Typography>
                </Box>

                <Box sx={{ 
                  mb: 3, 
                  p: 3, 
                  borderRadius: 2,
                  background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                  color: 'white'
                }}>
                  <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                    📦 {t('requestWizard.step3.addContainer')}
                  </Typography>
                  <Grid container spacing={2} alignItems="center">
                    <Grid item xs={12} md={4}>
                      <Typography variant="subtitle2" sx={{ mb: 1, color: 'white' }}>
                        {t('containerType')}
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
                        <MenuItem value=""><em>{t('requestWizard.step3.chooseType')}</em></MenuItem>
                        {containerPackages.map(pkg => (
                          <MenuItem key={pkg.packageId} value={pkg.packageName}>
                            {pkg.packageName}
                          </MenuItem>
                        ))}
                      </Select>
                    </Grid>
                    <Grid item xs={12} md={3}>
                      <Typography variant="subtitle2" sx={{ mb: 1, color: 'white' }}>
                        {t('quantity')}
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
                        {t('add')}
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
                          <TableCell sx={{ color: 'white', fontWeight: 600 }}>{t('containerType')}</TableCell>
                          <TableCell sx={{ color: 'white', fontWeight: 600 }}>{t('quantity')}</TableCell>
                          <TableCell sx={{ color: 'white', fontWeight: 600 }}>TEU/Unité</TableCell>
                          <TableCell sx={{ color: 'white', fontWeight: 600 }}>Total TEU</TableCell>
                          <TableCell align="center" sx={{ color: 'white', fontWeight: 600 }}>{t('actions')}</TableCell>
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
                                  <InventoryIcon />
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
              </CardContent>
            </Card>
          </Slide>

          {/* --- SECTION SERVICES ensuite --- */}
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
                    <SupportIcon />
                  </Avatar>
                  <Typography variant="h5" sx={{ fontWeight: 600, color: '#2c3e50' }}>
                    {t('requestWizard.step3.selectedServicesTitle')}
                    <Chip 
                      label={localSelectedServices.length} 
                      color="primary" 
                      sx={{ ml: 2 }}
                    />
                  </Typography>
                </Box>

                

                {localSelectedServices.length > 0 ? (
                  <TableContainer component={Paper} sx={{ 
                    borderRadius: 2,
                    boxShadow: '0 5px 15px rgba(0,0,0,0.08)'
                  }}>
                    <Table>
                      <TableHead>
                        <TableRow sx={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
                          <TableCell sx={{ color: 'white', fontWeight: 600 }}>{t('service')}</TableCell>
                          <TableCell sx={{ color: 'white', fontWeight: 600 }}>{t('usage')}</TableCell>
                          <TableCell align="center" sx={{ color: 'white', fontWeight: 600 }}>{t('actions')}</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {localSelectedServices.map((service, idx) => (
                          <TableRow 
                            key={service.serviceId || service.id || service.name + '-' + idx}
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
                                  background: service.isCustom 
                                    ? 'linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%)'
                                    : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                                }}>
                                  {service.isCustom ? '🎨' : (service.name?.charAt(0) || 'S')}
                                </Avatar>
                                <Box sx={{ flex: 1 }}>
                                  {editingService === service.serviceId ? (
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                      <TextField
                                        value={editServiceName}
                                        onChange={(e) => setEditServiceName(e.target.value)}
                                        size="small"
                                        sx={{ flex: 1 }}
                                        onKeyPress={(e) => {
                                          if (e.key === 'Enter') saveServiceEdit();
                                          if (e.key === 'Escape') cancelServiceEdit();
                                        }}
                                        autoFocus
                                      />
                                      <IconButton 
                                        size="small" 
                                        onClick={saveServiceEdit}
                                        sx={{ color: '#4caf50' }}
                                      >
                                        <CheckCircleIcon />
                                      </IconButton>
                                      <IconButton 
                                        size="small" 
                                        onClick={cancelServiceEdit}
                                        sx={{ color: '#f44336' }}
                                      >
                                        <DeleteIcon />
                                      </IconButton>
                                    </Box>
                                  ) : (
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                      <Typography variant="body1" sx={{ fontWeight: 500 }}>
                                        {service.name || service.serviceName || '-'}
                                      </Typography>
                                      {service.isCustom && (
                                        <Chip 
                                          label="Personnalisé" 
                                          size="small" 
                                          color="warning" 
                                          variant="outlined"
                                          sx={{ fontSize: '0.7rem' }}
                                        />
                                      )}
                                      {service.isCustom && (
                                        <IconButton 
                                          size="small" 
                                          onClick={() => startEditingService(service.serviceId, service.name || service.serviceName || '')}
                                          sx={{ color: '#1976d2' }}
                                        >
                                          <AssignmentIcon fontSize="small" />
                                        </IconButton>
                                      )}
                                    </Box>
                                  )}
                                </Box>
                              </Box>
                            </TableCell>
                            <TableCell>
                              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                <Typography variant="body2" sx={{ mr: 1, fontWeight: 600 }}>
                                  {service.usagePercent || 0}%
                                </Typography>
                                <Box sx={{ width: 60, mr: 1 }}>
                                  <LinearProgress 
                                    variant="determinate" 
                                    value={service.usagePercent || 0}
                                    sx={{
                                      height: 8,
                                      borderRadius: 4,
                                      backgroundColor: '#e0e0e0',
                                      '& .MuiLinearProgress-bar': {
                                        background: service.isCustom 
                                          ? 'linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%)'
                                          : 'linear-gradient(135deg, #56ab2f 0%, #a8e6cf 100%)',
                                        borderRadius: 4,
                                      }
                                    }}
                                  />
                                </Box>
                              </Box>
                            </TableCell>
                            <TableCell align="center">
                              <IconButton 
                                onClick={() => removeService(service.serviceId)}
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
                      </TableBody>
                    </Table>
                  </TableContainer>
                ) : (
                  <Box sx={{ 
                    textAlign: 'center', 
                    py: 4,
                    color: '#7f8c8d'
                  }}>
                    <SupportIcon sx={{ fontSize: 48, mb: 2, opacity: 0.5 }} />
                    <Typography variant="h6">{t('requestWizard.step3.noServiceSelected')}</Typography>
                    <Typography variant="body2">{t('requestWizard.step3.addServices')}</Typography>
                  </Box>
                )}
                <Box sx={{ 
                  mb: 3, 
                  p: 3, 
                  borderRadius: 2,
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  color: 'white'
                }}>
                  <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                    ✨ {t('requestWizard.step3.addService')}
                  </Typography>
                  
                  {/* Section Services existants */}
                  <Box sx={{ mb: 3 }}>
                    <Typography variant="subtitle2" sx={{ mb: 1, color: 'white', fontWeight: 600 }}>
                      📋 {t('requestWizard.step3.selectExistingService', 'Sélectionner un service existant')}
                    </Typography>
                    <Grid container spacing={2} alignItems="center">
                      <Grid item xs={12} md={8}>
                        <Autocomplete
                          options={availableServicesFiltered}
                          getOptionLabel={(option) => option.name || option.serviceName || 'Service'}
                          value={newService}
                          onChange={(_, value) => setNewService(value)}
                          loading={loadingServices}
                          renderInput={(params) => (
                            <TextField
                              {...params}
                              placeholder={t('requestWizard.step3.selectService')}
                              size="small"
                              sx={{
                                '& .MuiOutlinedInput-root': {
                                  backgroundColor: 'rgba(255,255,255,0.9)',
                                  borderRadius: 2,
                                  '&:hover': {
                                    backgroundColor: 'rgba(255,255,255,1)',
                                  }
                                }
                              }}
                            />
                          )}
                          fullWidth
                        />
                      </Grid>
                      <Grid item xs={12} md={4}>
                        <Button 
                          variant="contained" 
                          onClick={addService}
                          disabled={!newService}
                          sx={{ 
                            mt: 1,
                            background: 'linear-gradient(135deg, #56ab2f 0%, #a8e6cf 100%)',
                            color: 'white',
                            borderRadius: 2,
                            px: 3,
                            py: 1.5,
                            '&:hover': {
                              background: 'linear-gradient(135deg, #4a9c2a 0%, #9dd4c0 100%)',
                            },
                            '&:disabled': {
                              background: '#ccc',
                              color: '#666'
                            }
                          }}
                          startIcon={<AddIcon />}
                          fullWidth
                        >
                          {t('add')}
                        </Button>
                      </Grid>
                    </Grid>
                  </Box>

                  {/* Section Service personnalisé */}
                  <Box sx={{ 
                    p: 2, 
                    borderRadius: 2, 
                    background: 'rgba(255,255,255,0.1)',
                    border: '1px solid rgba(255,255,255,0.2)'
                  }}>
                    <Typography variant="subtitle2" sx={{ mb: 1, color: 'white', fontWeight: 600 }}>
                      🎨 {t('requestWizard.step3.createCustomService', 'Créer un service personnalisé')}
                    </Typography>
                    <Typography variant="body2" sx={{ mb: 2, color: 'rgba(255,255,255,0.8)' }}>
                      {t('requestWizard.step3.customServiceDescription', 'Ajouter un service qui ne figure pas dans la liste')}
                    </Typography>
                    <Button 
                      variant="outlined" 
                      onClick={createCustomService}
                      sx={{ 
                        borderColor: 'rgba(255,255,255,0.5)',
                        color: 'white',
                        borderRadius: 2,
                        px: 3,
                        py: 1,
                        '&:hover': {
                          borderColor: 'white',
                          backgroundColor: 'rgba(255,255,255,0.1)',
                        }
                      }}
                      startIcon={<AddIcon />}
                    >
                      {t('requestWizard.step3.createCustom', 'Créer un service')}
                    </Button>
                  </Box>

                  {/* Statistiques */}
                  {availableServicesFiltered.length > 0 && (
                    <Box sx={{ mt: 2, p: 1, borderRadius: 1, background: 'rgba(255,255,255,0.1)' }}>
                      <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.8)' }}>
                        📊 {availableServicesFiltered.length} {t('requestWizard.step3.servicesAvailable', 'services disponibles')} | 
                        {localSelectedServices.length} {t('requestWizard.step3.servicesSelected', 'services sélectionnés')}
                      </Typography>
                    </Box>
                  )}
                </Box>
              </CardContent>
            </Card>
          </Slide>

          <Slide direction="up" in timeout={1600}>
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4, flexDirection: 'column', alignItems: 'center' }}>
              {portsError && (
                <Alert severity="error" sx={{ mb: 2, width: '100%', maxWidth: 600 }}>
                  Erreur lors du chargement des ports: {portsError.message || 'Erreur inconnue'}
                </Alert>
              )}
              {(!requestData.portFrom || !requestData.portTo) && (
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

          <OfferBasketDrawerAccordion
            selectedHaulage={selectedHaulage}
            selectedSeafreight={selectedSeafreight}
            selectedMiscellaneous={localSelectedMiscellaneous}
            services={services}
            contacts={contacts}
            onRemoveMisc={id => setLocalSelectedMiscellaneous(localSelectedMiscellaneous.filter(m => m.id !== id))}
            currentStep={3}
            requestData={requestData}
            selectedServices={localSelectedServices}
            selectedContainers={selectedContainers}
            children={
              <Box sx={{ mt: 4 }} />
            }
          />
        </Box>
      </Fade>
    </Box>
  );
};

export default Step3RequestForm; 