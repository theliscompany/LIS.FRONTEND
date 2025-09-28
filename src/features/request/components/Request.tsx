import { useMsal } from '@azure/msal-react';
import { Autocomplete, Box, Button, Card, CardContent, FormControl, 
    FormHelperText, IconButton, InputLabel, MenuItem, 
    Stack, TextField, Typography, Switch, FormControlLabel, Dialog, DialogTitle, DialogContent, DialogActions, Tabs, Tab, Chip, Select } from "@mui/material"
import Grid from "@mui/material/Grid2"
import { ContactViewModel } from "@features/crm/api"
import { useEffect, useState } from "react"
// SUPPRIMÉ: Imports inutilisés pour réduire la taille du bundle
import { ProductViewModel } from '@features/masterdata/api/types.gen'
import { Controller, useForm } from "react-hook-form"
import React from "react"
import { useParams, useNavigate } from "react-router-dom"
import { useNewRequestQuote } from "./useNewRequestQuote"
import { getUserGroupUsersOptions } from '@features/request/api/@tanstack/react-query.gen'
import Fade from '@mui/material/Fade';
import Slide from '@mui/material/Slide';
import Avatar from '@mui/material/Avatar';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import DescriptionIcon from '@mui/icons-material/Description';
import EditIcon from '@mui/icons-material/Edit';
import RefreshIcon from '@mui/icons-material/Refresh';
import debounce from 'lodash.debounce';
import CircularProgress from "@mui/material/CircularProgress";
import SaveIcon from '@mui/icons-material/Save';
import PersonIcon from '@mui/icons-material/Person';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import Inventory2Icon from '@mui/icons-material/Inventory2';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import WarningIcon from '@mui/icons-material/Warning';
import AutoFixHigh from '@mui/icons-material/AutoFixHigh';
import { incotermValues } from '@utils/constants';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import fr from 'date-fns/locale/fr';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import AddressAutocomplete from '@components/shared/AddressAutocomplete';
import { postApiRequest, getApiRequestById, putApiRequestUpdateById, getApiAssigneeById } from '@features/request/api/sdk.gen';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import { postContactCreateContact } from '@features/crm/api';
// SUPPRIMÉ: Imports inutilisés pour réduire la taille du bundle
// import axios from "axios";
// import type { AssigneeViewModel } from '@features/request/api/types.gen';
import { putApiRequestByIdChangeStatus } from '@features/request/api/sdk.gen';
// import { getUserGroupUsersByUserId } from '@features/request/api/sdk.gen'; // Plus utilisé
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined';
import { showSnackbar } from '@components/common/Snackbar';
import type { SelectChangeEvent } from '@mui/material/Select';
import { getContactGetContactByIdById } from '@features/crm/api/sdk.gen';

// SUPPRIMÉ: Variables inutilisées
// const columnHelper = createColumnHelper<CargoDetailsViewModel>()
// const icon = <CheckBoxOutlineBlank fontSize="small" />;
// const checkedIcon = <CheckBox fontSize="small" />;

// Type pour les utilisateurs assignés (utilisé dans le composant)
// interface AssigneeUser {
//   id: string;
//   displayName?: string;
//   userPrincipalName?: string;
//   mail?: string;
// }

// Type pour le nouveau formulaire de transport
interface TransportRequestForm {
  requestQuoteId?: string;
  customerId?: number;
  pickupLocation: {
    addressLine: string;
    city: string;
    postalCode: string;
    country: string;
  };
  deliveryLocation: {
    addressLine: string;
    city: string;
    postalCode: string;
    country: string;
  };
  cargoType: number;
  quantity: number;
  details: string;
  tags: string;
  packingType: string;
  assigneeId: string;
  productId: number;
  productName: string;
  pickupDate: Date | undefined;
  deliveryDate: Date | undefined;
  goodsDescription: string;
  numberOfUnits: number;
  totalWeightKg: number;
  totalDimensions: string;
  isDangerousGoods: boolean;
  requiresTemperatureControl: boolean;
  isFragileOrHighValue: boolean;
  requiresSpecialHandling: boolean;
  specialInstructions: string;
  preferredTransportMode: number;
  additionalComments: string;
  incoterm: string;
  trackingNumber?: string;
  status?: string;
}

// Valeurs autorisées pour cargoType
const cargoTypeOptions = [
  { value: 0, label: 'Container' },
  { value: 1, label: 'Conventional' },
  { value: 2, label: 'RollOnRollOff' },
];
// Valeurs autorisées pour packingType
const packingTypeOptions = [
  'Palettes',
  'Cartons',
  'Caisses',
  'Sacs',
  'Fûts',
  'Big Bags',
  'Conteneur',
  'Vracs',
  'Barils',
];

// Fonction utilitaire pour convertir le cargoType string/number en number (0, 1, 2)
function cargoTypeStringToEnum(val: string | number | undefined): number {
  if (val === 'Container' || val === 0) return 0;
  if (val === 'Conventional' || val === 1) return 1;
  if (val === 'RollOnRollOff' || val === 2) return 2;
  return 0; // Valeur par défaut
}

// Type pour les données API
// interface ApiRequestData {
//   requestQuoteId?: string | null;
//   customerId?: number;
//   pickupLocation?: {
//     addressLine: string;
//     city: string;
//     postalCode: string;
//     country: string;
//   };
//   deliveryLocation?: {
//     addressLine: string;
//     city: string;
//     postalCode: string;
//     country: string;
//   };
//   cargoType?: string | number;
//   quantity?: number;
//   details?: string;
//   tags?: string;
//   packingType?: string;
//   assigneeId?: string;
//   productId?: number;
//   productName?: string;
//   pickupDate?: string | Date;
//   deliveryDate?: string | Date;
//   goodsDescription?: string;
//   numberOfUnits?: number;
//   totalWeightKg?: number;
//   totalDimensions?: string;
//   isDangerousGoods?: boolean;
//   requiresTemperatureControl?: boolean;
//   isFragileOrHighValue?: boolean;
//   requiresSpecialHandling?: boolean;
//   specialInstructions?: string;
//   preferredTransportMode?: number;
//   additionalComments?: string;
//   incoterm?: string;
//   trackingNumber?: string | null;
// }

// Fonction utilitaire pour transformer un RequestQuoteViewModel en TransportRequestForm
function mapRequestQuoteViewModelToForm(data: any): TransportRequestForm {
  return {
    requestQuoteId: data.requestQuoteId ?? '',
    customerId: data.customerId ?? 0,
    pickupLocation: {
      addressLine: data.pickupLocation?.addressLine ?? '',
      city: data.pickupLocation?.city ?? '',
      postalCode: data.pickupLocation?.postalCode ?? '',
      country: data.pickupLocation?.country ?? '',
    },
    deliveryLocation: {
      addressLine: data.deliveryLocation?.addressLine ?? '',
      city: data.deliveryLocation?.city ?? '',
      postalCode: data.deliveryLocation?.postalCode ?? '',
      country: data.deliveryLocation?.country ?? '',
    },
    cargoType: cargoTypeStringToEnum(data.cargoType),
    quantity: data.quantity ?? 1,
    details: data.details ?? '',
    tags: data.tags ?? '',
    packingType: data.packingType ?? '',
    assigneeId: data.assigneeId ?? '',
    productId: data.productId ?? 0,
    productName: data.productName ?? '',
    pickupDate: data.pickupDate ? new Date(data.pickupDate) : undefined,
    deliveryDate: data.deliveryDate ? new Date(data.deliveryDate) : undefined,
    goodsDescription: data.goodsDescription ?? '',
    numberOfUnits: data.numberOfUnits ?? 1,
    totalWeightKg: data.totalWeightKg ?? 0,
    totalDimensions: data.totalDimensions ?? '',
    isDangerousGoods: data.isDangerousGoods ?? false,
    requiresTemperatureControl: data.requiresTemperatureControl ?? false,
    isFragileOrHighValue: data.isFragileOrHighValue ?? false,
    requiresSpecialHandling: data.requiresSpecialHandling ?? false,
    specialInstructions: data.specialInstructions ?? '',
    preferredTransportMode: data.preferredTransportMode ?? 1,
    additionalComments: data.additionalComments ?? '',
    incoterm: data.incoterm ?? '',
    trackingNumber: data.trackingNumber ?? ''
  };
}

// Type pour l'API Request
interface ApiRequestPayload {
  requestQuoteId?: string;
  customerId?: number;
  pickupLocation: {
    addressLine: string;
    city: string;
    postalCode: string;
    country: string;
  };
  deliveryLocation: {
    addressLine: string;
    city: string;
    postalCode: string;
    country: string;
  };
  cargoType: number;
  quantity: number;
  details: string;
  tags: string;
  packingType: string;
  assigneeId: string;
  productId: number;
  productName: string;
  pickupDate?: string;
  deliveryDate?: string;
  goodsDescription: string;
  numberOfUnits: number;
  totalWeightKg: number;
  totalDimensions: string;
  isDangerousGoods: boolean;
  requiresTemperatureControl: boolean;
  isFragileOrHighValue: boolean;
  requiresSpecialHandling: boolean;
  specialInstructions: string;
  preferredTransportMode: number;
  additionalComments: string;
  incoterm: string;
}

// Fonction utilitaire pour transformer TransportRequestForm en RequestQuoteViewModel
function transformFormToApi(formData: TransportRequestForm): ApiRequestPayload {
  console.log("Valeur incoterm dans transformFormToApi:", formData.incoterm);
  return {
    requestQuoteId: formData.requestQuoteId,
    customerId: Number(formData.customerId) || 0,
    pickupLocation: {
      addressLine: formData.pickupLocation.addressLine,
      city: formData.pickupLocation.city,
      postalCode: formData.pickupLocation.postalCode,
      country: formData.pickupLocation.country
    },
    deliveryLocation: {
      addressLine: formData.deliveryLocation.addressLine,
      city: formData.deliveryLocation.city,
      postalCode: formData.deliveryLocation.postalCode,
      country: formData.deliveryLocation.country
    },
    cargoType: formData.cargoType,
    quantity: formData.quantity,
    details: formData.details,
    tags: formData.tags,
    packingType: formData.packingType,
    assigneeId: formData.assigneeId,
    productId: formData.productId,
    productName: formData.productName,
    pickupDate: formData.pickupDate ? new Date(formData.pickupDate).toISOString() : undefined,
    deliveryDate: formData.deliveryDate ? new Date(formData.deliveryDate).toISOString() : undefined,
    goodsDescription: formData.goodsDescription,
    numberOfUnits: formData.numberOfUnits,
    totalWeightKg: formData.totalWeightKg,
    totalDimensions: formData.totalDimensions,
    isDangerousGoods: formData.isDangerousGoods,
    requiresTemperatureControl: formData.requiresTemperatureControl,
    isFragileOrHighValue: formData.isFragileOrHighValue,
    requiresSpecialHandling: formData.requiresSpecialHandling,
    specialInstructions: formData.specialInstructions,
    preferredTransportMode: formData.preferredTransportMode,
    additionalComments: formData.additionalComments,
    incoterm: formData.incoterm ?? ""
  };
}

const Request = () => {
    const { accounts } = useMsal();
    const connectedUser = accounts && accounts.length > 0 ? accounts[0] : undefined;
    const { id } = useParams();
    const navigate = useNavigate();
    const { t } = useTranslation();

    const [customer, setCustomer] = useState<ContactViewModel | null>(null)
    const [selectedProduct, setSelectedProduct] = useState<ProductViewModel | null>(null)
    const [isLoading, setIsLoading] = useState(false)
    const [loadingRequest, setLoadingRequest] = useState(false);
    const [initialValues, setInitialValues] = useState<TransportRequestForm | null>(null);
    
    // SUPPRIMÉ: const { isNullOrEmpty } = useHelpers() - variable inutilisée
    
    /**
     * OPTIMISATION CONTACTS - Version améliorée :
     * - Chargement minimal (10 contacts max par défaut)
     * - Recherche avec debounce et limite de résultats
     * - Évite le chargement de milliers de contacts
     */
    const [clientOptions, setClientOptions] = useState<ContactViewModel[]>([]);
    const [clientLoading, setClientLoading] = useState(false);
    const [clientInput, setClientInput] = useState('');

    const fetchClients = React.useMemo(() => debounce(async (search: string) => {
        setClientLoading(true);
        try {
            // OPTIMISATION: Limiter à 20 résultats max + recherche plus précise
            const res = await fetch(`https://localhost:7206/Contact/GetContacts?contactName=${encodeURIComponent(search)}&take=20`);
            const result = await res.json();
            console.log('Réponse API GetContacts (optimisée):', result);
            setClientOptions(result.data ?? []);
        } catch (error) {
            setClientOptions([]);
            console.error('Erreur lors du chargement des contacts:', error);
        }
        setClientLoading(false);
    }, 300), []);

    // OPTIMISATION: Charger seulement 5 contacts initiaux au lieu de 10
    const fetchFirstContacts = React.useCallback(async () => {
        setClientLoading(true);
        try {
            const res = await fetch('https://localhost:7206/Contact/GetContacts?take=5');
            const result = await res.json();
            setClientOptions(result.data ?? []);
        } catch {
            setClientOptions([]);
        }
        setClientLoading(false);
    }, []);

    // OPTIMISATION: Chargement intelligent des contacts
    useEffect(() => {
        if (clientInput.length >= 3) { // Augmenté de 2 à 3 caractères pour réduire les appels
            fetchClients(clientInput);
        } else if (clientInput.length === 0) {
            // Chargement différé: seulement si nécessaire
            fetchFirstContacts();
        } else {
            // Entre 1-2 caractères: ne pas charger pour éviter trop d'appels
            setClientOptions([]);
        }
    }, [clientInput, fetchClients, fetchFirstContacts]);

    useEffect(() => {
        if (id) {
            setLoadingRequest(true);
            getApiRequestById({ path: { id } })
                .then(res => {
                    // LOG IMPORTANT :
                    console.log('[DEBUG] Réponse API GET Request by ID:', res);
                    if (res && res.data) {
                        
                        const formData = mapRequestQuoteViewModelToForm(res.data);
                        console.log('[DEBUG] Statut injecté dans le formulaire (normalisé):', formData.status);
                        setInitialValues(formData);
                    }
                })
                .finally(() => setLoadingRequest(false));
        }
    }, [id]);

    const { handleSubmit, control, reset, formState: { errors, isSubmitting }, watch, setValue, getValues } = useForm<TransportRequestForm>({
        defaultValues: initialValues || {
            requestQuoteId: id,
            pickupLocation: {
                addressLine: '',
                city: '',
                postalCode: '',
                country: ''
            },
            deliveryLocation: {
                addressLine: '',
                city: '',
                postalCode: '',
                country: ''
            },
            cargoType: 0, // Container par défaut
            quantity: 1,
            details: '',
            tags: '',
            packingType: '',
            assigneeId: '',
            productId: 0,
            productName: '',
            pickupDate: new Date(),
            deliveryDate: (() => { const d = new Date(); d.setDate(d.getDate() + 15); return d; })(),
            goodsDescription: '',
            numberOfUnits: 1,
            totalWeightKg: 0,
            totalDimensions: '',
            isDangerousGoods: false,
            requiresTemperatureControl: false,
            isFragileOrHighValue: false,
            requiresSpecialHandling: false,
            specialInstructions: '',
            preferredTransportMode: 1,
            additionalComments: '',
            incoterm: '',
            trackingNumber: ''
        }
    });

    // Si on a chargé une demande existante, réinitialiser le formulaire
    useEffect(() => {
        if (initialValues) {
            reset(initialValues);
            console.log('[DEBUG] reset - assigneeId:', initialValues.assigneeId);
            setValue('assigneeId', initialValues.assigneeId ?? '');
            console.log('[DEBUG] setValue - assigneeId:', initialValues.assigneeId ?? '');
        }
    }, [initialValues, reset, setValue]);

    const { 
        customers, products
    } = useNewRequestQuote({ requestQuoteId: watch('requestQuoteId') });

    // OPTIMISATION: Mémorisation des clients pour éviter les re-calculs
    const customersArray = React.useMemo(() => {
        return Array.isArray(customers?.data) ? customers.data : [];
    }, [customers?.data]);

    // Synchronisation du client sélectionné après chargement de la demande ET de la liste des clients
    useEffect(() => {
        if (initialValues && customersArray.length > 0) {
            const found = customersArray.find((c: ContactViewModel) => c.contactId === initialValues.customerId);
            if (found) setCustomer(found);
        }
    }, [initialValues, customersArray]);

    // OPTIMISATION: Chargement intelligent du contact par ID avec cache
    useEffect(() => {
        if (
            initialValues &&
            initialValues.customerId &&
            (!customer || customer.contactId !== initialValues.customerId)
        ) {
            console.log(`[PERFORMANCE] Chargement du contact ID: ${initialValues.customerId}`);
            getContactGetContactByIdById({ path: { id: Number(initialValues.customerId) } })
                .then((res: any) => {
                    if (res && res.data) {
                        console.log(`[PERFORMANCE] Contact ID ${initialValues.customerId} chargé avec succès (SDK)`);
                        setCustomer(res.data);
                    } else {
                        console.warn(`[PERFORMANCE] Contact ID ${initialValues.customerId} introuvable (SDK)`);
                    }
                })
                .catch((e: any) => {
                    console.error(`[PERFORMANCE] Erreur lors du chargement du contact ID ${initialValues.customerId} (SDK):`, e);
                });
        }
    }, [initialValues, customer]);

    // Déterminer le nom du client à afficher
    const clientName = (() => {
        if (customer && customer.contactName) {
            return customer.contactName;
        }
        if (initialValues && customersArray.length > 0) {
            const found = customersArray.find((c: ContactViewModel) => c.contactId === initialValues.customerId);
            return found ? found.contactName : initialValues.customerId;
        }
        return '';
    })();

    // Déterminer le trackingNumber à afficher (jamais requestQuoteId)
    const trackingNumberDisplay = initialValues?.trackingNumber || '';

    // Synchronise le champ produit sélectionné avec la demande chargée
    useEffect(() => {
        if (initialValues && products && Array.isArray(products)) {
            const found = products.find((p: ProductViewModel) => p.productId === initialValues.productId);
            if (found) setSelectedProduct(found);
        }
    }, [initialValues, products]);

    const queryClient = useQueryClient();

    const handleSubmitTransport = async (data: TransportRequestForm) => {
        console.log('[DEBUG] handleSubmitTransport - assigneeId envoyé:', data.assigneeId);
        setIsLoading(true);
        try {
            // Préparer les données pour l'API avec la transformation correcte
            const payload = transformFormToApi(data);
            console.log('Payload POST nouvelle demande:', payload);
            await postApiRequest({ body: payload as any });
            showSnackbar('Demande de transport créée avec succès!', 'success');
            // Invalider la query pour rafraîchir la liste des demandes
            await queryClient.invalidateQueries({ queryKey: ['api', 'Request'] });
            navigate('/requests');
        } catch (error) {
            console.error('Erreur lors de la soumission:', error);
            
            // Gestion d'erreur améliorée avec messages spécifiques
            let errorMessage = 'Erreur lors de la création de la demande';
            
            if (error instanceof Error) {
                // Erreurs spécifiques de l'API
                if (error.message.includes('400') || error.message.includes('Bad Request')) {
                    errorMessage = 'Données de demande invalides. Veuillez vérifier les informations saisies.';
                } else if (error.message.includes('401') || error.message.includes('Unauthorized')) {
                    errorMessage = 'Session expirée. Veuillez vous reconnecter.';
                } else if (error.message.includes('403') || error.message.includes('Forbidden')) {
                    errorMessage = 'Vous n\'avez pas les permissions pour créer une demande.';
                } else if (error.message.includes('409') || error.message.includes('Conflict')) {
                    errorMessage = 'Une demande similaire existe déjà.';
                } else if (error.message.includes('422') || error.message.includes('Unprocessable Entity')) {
                    errorMessage = 'Données de demande incomplètes ou incorrectes.';
                } else if (error.message.includes('500') || error.message.includes('Internal Server Error')) {
                    errorMessage = 'Erreur serveur. Veuillez réessayer plus tard.';
                } else if (error.message.includes('Network Error') || error.message.includes('fetch')) {
                    errorMessage = 'Problème de connexion. Vérifiez votre connexion internet.';
                } else if (error.message.includes('timeout')) {
                    errorMessage = 'Délai d\'attente dépassé. Veuillez réessayer.';
                } else {
                    // Utiliser le message d'erreur original si disponible
                    errorMessage = error.message || 'Erreur lors de la création de la demande';
                }
            } else if (typeof error === 'string') {
                errorMessage = error;
            } else if (error && typeof error === 'object' && 'message' in error) {
                errorMessage = String(error.message);
            }
            
            // Afficher le message d'erreur avec le type 'warning'
            showSnackbar(errorMessage, 'warning');
            
            // Optionnel : Afficher aussi dans la console pour le debug
            console.error('[Request] Détails de l\'erreur:', {
                message: errorMessage,
                originalError: error,
                timestamp: new Date().toISOString()
            });
        } finally {
            setIsLoading(false);
        }
    }

    // SUPPRIMÉ: const cargoTypes - variable inutilisée
    const transportModes = [
        { value: 1, label: 'Route' },
        { value: 2, label: 'Rail' },
        { value: 3, label: 'Air' },
        { value: 4, label: 'Mer' },
        { value: 5, label: 'Multimodal' }
    ];
    
    const [isEditing, setIsEditing] = useState(false);
    const [isLaunchingWizard, setIsLaunchingWizard] = useState(false);
    const [openConfirmWizard, setOpenConfirmWizard] = useState(false);
    const [pendingWizardAction, setPendingWizardAction] = useState<null | (() => void)>(null);
    const [tabIndex, setTabIndex] = useState(0);

    const [openProspectModal, setOpenProspectModal] = useState(false);
    const [prospectForm, setProspectForm] = useState({
        contactName: '',
        email: '',
        phone: '',
        countryCode: 'BE',
    });
    const [prospectLoading, setProspectLoading] = useState(false);

    const handleOpenProspectModal = () => setOpenProspectModal(true);
    const handleCloseProspectModal = () => {
        setOpenProspectModal(false);
        setProspectForm({ contactName: '', email: '', phone: '', countryCode: 'BE' });
    };
    const handleProspectChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setProspectForm({ ...prospectForm, [e.target.name]: e.target.value });
    };
    const handleCreateProspect = async () => {
        if (!prospectForm.contactName) return showSnackbar(t('prospectNameRequired'), 'warning');
        setProspectLoading(true);
        try {
            const res = await postContactCreateContact({ body: { ...prospectForm, categories: ['CUSTOMERS'] } });
            console.log('[DEBUG] Réponse postContactCreateContact:', res);
            const newId = Number(res.data?.data);
            if (res && typeof newId === 'number' && !isNaN(newId) && newId > 0) {
                showSnackbar(t('prospectCreated'), 'success');
                const { contactName, ...restProspectForm } = prospectForm;
                const newProspect = { contactName, contactId: newId, ...restProspectForm };
                setClientOptions((prev) => [newProspect, ...prev]);
                setCustomer(newProspect);
                setValue('customerId', newId);
                console.log('[DEBUG] customerId après création et setValue:', newId, 'getValues:', getValues('customerId'));
                handleCloseProspectModal();
            } else {
                showSnackbar('Erreur: ID client non retourné ou invalide', 'warning');
                console.error('[DEBUG] ID client non retourné ou invalide:', res);
                return;
            }
        } catch {
            showSnackbar(t('prospectCreateError'), 'warning');
        } finally {
            setProspectLoading(false);
        }
    };

    /**
     * OPTIMISATION ASSIGNÉS - Chargement intelligent :
     * - Utilise React Query pour le cache automatique
     * - Évite les re-rendus inutiles
     * - Chargement à la demande
     */
    const { data: assigneesData, isLoading: loadingAssignees } = useQuery({
      ...getUserGroupUsersOptions(),
      staleTime: 5 * 60 * 1000,
      gcTime: 10 * 60 * 1000,
    });
    const assignees = Array.isArray((assigneesData as any)?.data) ? (assigneesData as any).data : [];
    
    console.log(`[PERFORMANCE] Assignés chargés: ${assignees.length} utilisateurs, loading: ${loadingAssignees}`);

    // SUPPRIMÉ: Variables inutilisées pour optimiser les performances
    // const [selectedAssigneeDetails, setSelectedAssigneeDetails] = useState<any>(null);
    // const [loadingAssigneeDetails, setLoadingAssigneeDetails] = useState(false);
    // const [errorAssigneeDetails, setErrorAssigneeDetails] = useState<string | null>(null);

    // CORRECTION: Définir assigneeId AVANT de l'utiliser
    const assigneeId = watch('assigneeId');

    // SUPPRIMÉ: Variable inutilisée
    // const assigneeDetails = React.useMemo(() => {
    //     return assigneeId ? { id: assigneeId, loading: false } : null;
    // }, [assigneeId]);

    // Fallback si l'assigné sélectionné n'est pas dans la liste
    const assigneeIdStr = assigneeId ? String(assigneeId) : '';
    const selectedAssignee = React.useMemo(() => {
      return assignees.find((a: any) => String(a.id) === assigneeIdStr);
    }, [assignees, assigneeIdStr]);
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
        console.log('[DEBUG] Assigné sélectionné (Request):', {
          id: selectedAssignee.id,
          displayName: selectedAssignee.displayName,
          mail: selectedAssignee.mail
        });
      }
    }, [selectedAssignee]);
    
    // Pour l'affichage, utilisons selectedAssignee directement
    
    console.log(`[PERFORMANCE] Assigné sélectionné: ${assigneeIdStr}, trouvé: ${!!selectedAssignee}, total: ${assignees.length}`);

    // SUPPRIMÉ: Map des couleurs pour chaque statut - variable inutilisée
    // const statusColorMap: Record<string, 'default' | 'primary' | 'success' | 'warning' | 'error' | 'info'> = {...}

    // Map des couleurs et icônes modernisées pour chaque statut
    const statusConfigMap: Record<string, { 
      bgcolor: string; 
      color: string; 
      icon: string; 
      gradient: string;
      description: string;
    }> = {
      New: { 
        bgcolor: '#1976d2', 
        color: '#fff', 
        icon: '🆕',
        gradient: 'linear-gradient(135deg, #1976d2 0%, #1565c0 100%)',
        description: 'Nouvelle demande créée'
      },
      EnAttente: { 
        bgcolor: '#90caf9', 
        color: '#222', 
        icon: '⏳',
        gradient: 'linear-gradient(135deg, #90caf9 0%, #64b5f6 100%)',
        description: 'En attente de traitement'
      },
      Valider: { 
        bgcolor: '#43a047', 
        color: '#fff', 
        icon: '✅',
        gradient: 'linear-gradient(135deg, #43a047 0%, #388e3c 100%)',
        description: 'Demande validée'
      },
      Rejeter: { 
        bgcolor: '#e53935', 
        color: '#fff', 
        icon: '❌',
        gradient: 'linear-gradient(135deg, #e53935 0%, #d32f2f 100%)',
        description: 'Demande rejetée'
      },
      EnCoursDeTraitement: { 
        bgcolor: '#ffb300', 
        color: '#222', 
        icon: '⚙️',
        gradient: 'linear-gradient(135deg, #ffb300 0%, #ff8f00 100%)',
        description: 'En cours de traitement'
      },
      EnTransit: { 
        bgcolor: '#00bcd4', 
        color: '#fff', 
        icon: '🚚',
        gradient: 'linear-gradient(135deg, #00bcd4 0%, #0097a7 100%)',
        description: 'En transit'
      },
      EnDouane: { 
        bgcolor: '#8d6e63', 
        color: '#fff', 
        icon: '🏛️',
        gradient: 'linear-gradient(135deg, #8d6e63 0%, #6d4c41 100%)',
        description: 'En douane'
      },
      LivraisonEnCours: { 
        bgcolor: '#fbc02d', 
        color: '#222', 
        icon: '🚛',
        gradient: 'linear-gradient(135deg, #fbc02d 0%, #f9a825 100%)',
        description: 'Livraison en cours'
      },
      Livre: { 
        bgcolor: '#388e3c', 
        color: '#fff', 
        icon: '📦',
        gradient: 'linear-gradient(135deg, #388e3c 0%, #2e7d32 100%)',
        description: 'Livré avec succès'
      },
      Annule: { 
        bgcolor: '#757575', 
        color: '#fff', 
        icon: '🚫',
        gradient: 'linear-gradient(135deg, #757575 0%, #616161 100%)',
        description: 'Demande annulée'
      },
      Retour: { 
        bgcolor: '#6d4c41', 
        color: '#fff', 
        icon: '↩️',
        gradient: 'linear-gradient(135deg, #6d4c41 0%, #5d4037 100%)',
        description: 'Retour en cours'
      },
      Problème: { 
        bgcolor: '#d32f2f', 
        color: '#fff', 
        icon: '⚠️',
        gradient: 'linear-gradient(135deg, #d32f2f 0%, #c62828 100%)',
        description: 'Problème détecté'
      },
      EnAttenteDeFacturation: { 
        bgcolor: '#7e57c2', 
        color: '#fff', 
        icon: '💰',
        gradient: 'linear-gradient(135deg, #7e57c2 0%, #673ab7 100%)',
        description: 'En attente de facturation'
      },
    };

    const currentStatus = initialValues?.status || 'NEW';

    const statusOptions = [
      "New", "EnAttente", "Valider", "Rejeter", "EnCoursDeTraitement", "EnTransit",
      "EnDouane", "LivraisonEnCours", "Livre", "Annule", "Retour", "Problème", "EnAttenteDeFacturation"
    ];
    const [statusSelect, setStatusSelect] = useState(currentStatus);
    const [statusLoading, setStatusLoading] = useState(false);
    const [statusHistory, setStatusHistory] = useState<Array<{
        status: string;
        timestamp: Date;
        user?: string;
    }>>([]);
    const handleChangeStatus = async (event: SelectChangeEvent<string>) => {
      const newStatus = event.target.value;
      const oldStatus = statusSelect;
      
      // Animation de transition fluide
      setStatusSelect(newStatus);
      
      if (!id) return;
      setStatusLoading(true);
      
      try {
        // Animation de succès avec feedback visuel
        showSnackbar(
          `Statut changé de "${statusLabelMap[oldStatus] || oldStatus}" vers "${statusLabelMap[newStatus] || newStatus}"`, 
          'success'
        );
        
        await putApiRequestByIdChangeStatus({ path: { id }, body: { newStatus: newStatus } as any });
        
        // Ajouter à l'historique des statuts
        setStatusHistory(prev => [...prev, {
          status: newStatus,
          timestamp: new Date(),
          user: connectedUser?.name || 'Utilisateur actuel'
        }]);
        
        // Recharger la demande pour afficher le nouveau statut
        const updatedRequest = await getApiRequestById({ path: { id } });
        if (updatedRequest && updatedRequest.data) {
          const updatedFormData = mapRequestQuoteViewModelToForm(updatedRequest.data as any);
          setInitialValues(updatedFormData);
          
          // Animation de confirmation
          setTimeout(() => {
            showSnackbar(
              `✅ Statut "${statusLabelMap[newStatus] || newStatus}" appliqué avec succès`, 
              'success'
            );
          }, 500);
        }
      } catch (error) {
        // Revenir à l'ancien statut en cas d'erreur
        setStatusSelect(oldStatus);
        showSnackbar(
          `❌ Erreur lors du changement de statut vers "${statusLabelMap[newStatus] || newStatus}"`, 
          'warning'
        );
        console.error('Erreur changement statut:', error);
      } finally {
        setStatusLoading(false);
      }
    };

    // Map des labels utilisateur pour chaque statut
    const statusLabelMap: Record<string, string> = {
      New: 'Nouveau',
      EnAttente: 'En attente',
      Valider: 'Validé',
      Rejeter: 'Rejeté',
      EnCoursDeTraitement: 'En cours de traitement',
      EnTransit: 'En transit',
      EnDouane: 'En douane',
      LivraisonEnCours: 'Livraison en cours',
      Livre: 'Livré',
      Annule: 'Annulé',
      Retour: 'Retour',
      Problème: 'Problème',
      EnAttenteDeFacturation: 'En attente de facturation',
    };

    useEffect(() => {
      // Préremplir l'assigné à l'utilisateur connecté lors de la création
      if (!id && assignees.length > 0 && connectedUser && connectedUser.username) {
        const found = assignees.find(
          (a: any) =>
            a.mail?.toLowerCase() === connectedUser.username.toLowerCase() ||
            a.userPrincipalName?.toLowerCase() === connectedUser.username.toLowerCase()
        );
        if (found) {
          setValue('assigneeId', String(found.id));
        }
      }
    }, [id, assignees, connectedUser, setValue]);

    if (loadingRequest) return <div>Chargement de la demande...</div>;

    const handleEditSubmit = async (data: TransportRequestForm) => {
        console.log('[DEBUG] handleEditSubmit - assigneeId envoyé:', data.assigneeId);
        setIsLoading(true);
        try {
            // Préparer les données pour l'API avec la transformation correcte
            const apiData = transformFormToApi(data);
            // Log du payload complet pour le PUT
            console.log('--- PAYLOAD ENVOYÉ AU PUT /api/Request/update ---');
            console.log(JSON.stringify(apiData, null, 2));
            // Sauvegarder les modifications
            const putResult = await putApiRequestUpdateById({ path: { id: id! }, body: apiData as any });
            console.log('Résultat du PUT /api/Request/update :', putResult);
            showSnackbar('Demande modifiée avec succès', 'success');
            // Recharger les données depuis l'API pour s'assurer de la cohérence
            console.log('Rechargement des données depuis l\'API...');
            const updatedRequest = await getApiRequestById({ path: { id: id! } });
            if (updatedRequest && updatedRequest.data) {
                console.log('Données rechargées depuis l\'API:', updatedRequest.data);
                console.log('Valeur incoterm dans la réponse API:', updatedRequest.data.incoterm);
                // Mettre à jour les valeurs initiales
                const updatedFormData = mapRequestQuoteViewModelToForm(updatedRequest.data as any);
                console.log('[DEBUG] mapRequestQuoteViewModelToForm (update) - assigneeId:', updatedFormData.assigneeId);
                setInitialValues(updatedFormData);
                // Réinitialiser le formulaire avec les nouvelles données
                reset(updatedFormData);
                setValue('assigneeId', updatedFormData.assigneeId ?? '');
                // Mettre à jour le client sélectionné
                if (updatedFormData.customerId && customersArray.length > 0) {
                    const foundCustomer = customersArray.find((c: ContactViewModel) => c.contactId === updatedFormData.customerId);
                    if (foundCustomer) {
                        setCustomer(foundCustomer);
                    }
                }
                // Mettre à jour le produit sélectionné
                if (updatedFormData.productId && products && Array.isArray(products)) {
                    const foundProduct = products.find((p: ProductViewModel) => p.productId === updatedFormData.productId);
                    if (foundProduct) {
                        setSelectedProduct(foundProduct);
                    }
                }
                console.log('Mise à jour terminée. Nouvelles valeurs:', updatedFormData);
            }
            // Invalider la query pour rafraîchir la liste des demandes
            await queryClient.invalidateQueries({ queryKey: ['api', 'Request'] });
            // Passer en mode lecture
            setIsEditing(false);
        } catch (error) {
            console.error('Erreur lors de la modification:', error);
            showSnackbar('Erreur lors de la modification', 'warning');
        } finally {
            setIsLoading(false);
        }
    };

    const handleStartEdit = () => {
        setIsEditing(true);
    };

    const handleCancelEdit = () => {
        setIsEditing(false);
        // Restaurer les valeurs initiales
        if (initialValues) {
            reset(initialValues);
            // Restaurer aussi le client et le produit sélectionnés
            if (initialValues.customerId && customersArray.length > 0) {
                const foundCustomer = customersArray.find((c: ContactViewModel) => c.contactId === initialValues.customerId);
                if (foundCustomer) {
                    setCustomer(foundCustomer);
                }
            }
            if (initialValues.productId && products && Array.isArray(products)) {
                const foundProduct = products.find((p: ProductViewModel) => p.productId === initialValues.productId);
                if (foundProduct) {
                    setSelectedProduct(foundProduct);
                }
            }
        }
    };

    // Fonction pour recharger les données depuis l'API
    const reloadRequestData = async () => {
        if (!id) return;
        
        setLoadingRequest(true);
        try {
            const response = await getApiRequestById({ path: { id } });
            if (response && response.data) {
                const updatedFormData = mapRequestQuoteViewModelToForm(response.data as any);
                console.log('[DEBUG] mapRequestQuoteViewModelToForm (reload) - assigneeId:', updatedFormData.assigneeId);
                setInitialValues(updatedFormData);
                reset(updatedFormData);
                setValue('assigneeId', updatedFormData.assigneeId ?? '');
                
                // Mettre à jour le client et le produit
                if (updatedFormData.customerId && customersArray.length > 0) {
                    const foundCustomer = customersArray.find((c: ContactViewModel) => c.contactId === updatedFormData.customerId);
                    if (foundCustomer) {
                        setCustomer(foundCustomer);
                    }
                }
                if (updatedFormData.productId && products && Array.isArray(products)) {
                    const foundProduct = products.find((p: ProductViewModel) => p.productId === updatedFormData.productId);
                    if (foundProduct) {
                        setSelectedProduct(foundProduct);
                    }
                }
            }
        } catch (error) {
            console.error('Erreur lors du rechargement:', error);
            showSnackbar('Erreur lors du rechargement des données', 'warning');
        } finally {
            setLoadingRequest(false);
        }
    };

    // Fonction utilitaire pour rendre un champ en lecture seule
    const getReadOnlyProps = () => ({
        disabled: !isEditing,
        InputProps: {
            readOnly: !isEditing,
            style: {
                backgroundColor: !isEditing ? '#f5f5f5' : 'transparent',
                cursor: !isEditing ? 'default' : 'text'
            }
        },
        sx: {
            '& .MuiOutlinedInput-root': {
                '&.Mui-disabled': {
                    backgroundColor: '#f5f5f5',
                    color: '#666',
                    '& .MuiOutlinedInput-notchedOutline': {
                        borderColor: '#e0e0e0'
                    }
                }
            }
        }
    });

    return (
        <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={fr}>
            <Box sx={{
                background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
                minHeight: '100vh',
                p: 3
            }}>
                <Fade in timeout={800}>
                    <Box>
                        {/* Header moderne */}
                        <Box
                            sx={{
                                textAlign: 'center',
                                mb: 4,
                                background: isEditing 
                                    ? 'linear-gradient(135deg, #ff9800 0%, #f57c00 50%, #ef6c00 100%)'
                                    : 'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)',
                                borderRadius: 6,
                                p: { xs: 3, md: 5 },
                                color: 'white',
                                boxShadow: isEditing 
                                    ? '0 20px 60px rgba(255,152,0,0.3)'
                                    : '0 20px 60px rgba(102,126,234,0.25)',
                                position: 'relative',
                                minHeight: 120,
                                display: 'flex',
                                flexDirection: 'column',
                                justifyContent: 'center',
                                alignItems: 'center',
                                overflow: 'hidden',
                                transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
                                transform: 'translateY(0)',
                                '&:hover': {
                                    transform: 'translateY(-4px)',
                                    boxShadow: isEditing 
                                        ? '0 25px 70px rgba(255,152,0,0.4)'
                                        : '0 25px 70px rgba(102,126,234,0.35)'
                                },
                                '&::before': {
                                    content: '""',
                                    position: 'absolute',
                                    top: 0,
                                    left: 0,
                                    right: 0,
                                    bottom: 0,
                                    background: isEditing
                                        ? 'linear-gradient(45deg, rgba(255,255,255,0.15) 0%, transparent 50%, rgba(255,255,255,0.08) 100%)'
                                        : 'linear-gradient(45deg, rgba(255,255,255,0.1) 0%, transparent 50%, rgba(255,255,255,0.05) 100%)',
                                    pointerEvents: 'none',
                                    transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)'
                                },
                                '&::after': {
                                    content: '""',
                                    position: 'absolute',
                                    top: 0,
                                    left: 0,
                                    right: 0,
                                    bottom: 0,
                                    background: isEditing
                                        ? 'radial-gradient(circle at 20% 80%, rgba(255,255,255,0.1) 0%, transparent 50%)'
                                        : 'radial-gradient(circle at 20% 80%, rgba(255,255,255,0.05) 0%, transparent 50%)',
                                    pointerEvents: 'none',
                                    transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)'
                                }
                            }}
                        >
                            {/* Magic Wand Button en haut à droite */}
                            {id && (
                                <>
                                <IconButton
                                    size="large"
                                    color="primary"
                                    sx={{
                                        position: 'absolute',
                                        top: 12,
                                        right: 12,
                                        background: 'white',
                                        boxShadow: '0 2px 8px rgba(25,118,210,0.12)',
                                        '&:hover': { background: '#e3f2fd' }
                                    }}
                                    onClick={async () => {
                                        const launch = async () => {
                                            setIsLaunchingWizard(true);
                                            try {
                                                console.log('--- DÉBUT APPEL API POUR MAGIC WAND ---');
                                                console.log('ID de la demande:', id);
                                                
                                                const res = await getApiRequestById({ path: { id } });
                                                
                                                console.log('--- RÉPONSE API MAGIC WAND ---');
                                                console.log('Réponse complète:', res);
                                                console.log('Status:', res?.status);
                                                console.log('Data:', res?.data);
                                                console.log('--- FIN RÉPONSE API MAGIC WAND ---');
                                                
                                                if (res && res.data) {
                                                    // Récupérer les informations de l'assignee si assigneeId est présent
                                                    const requestDataWithAssignee = { ...res.data };
                                                    
                                                    if (res.data.assigneeId) {
                                                        console.log('Récupération des informations assignee pour ID:', res.data.assigneeId);
                                                        try {
                                                            const assigneeResponse = await getApiAssigneeById({ 
                                                                path: { id: String(res.data.assigneeId) } 
                                                            });
                                                            console.log('Réponse assignee:', assigneeResponse);
                                                            
                                                            if (assigneeResponse && assigneeResponse.data) {
                                                            // SUPPRIMÉ: Assignation de l'assignee dans requestDataWithAssignee car la propriété n'existe pas
                                                            // requestDataWithAssignee.assignee = assigneeResponse.data;
                                                                console.log('Assignee ajouté aux données:', assigneeResponse.data);
                                                            }
                                                        } catch (assigneeError) {
                                                            console.error('Erreur lors de la récupération de l\'assignee:', assigneeError);
                                                        }
                                                    } else {
                                                        console.log('Aucun assigneeId trouvé dans la réponse');
                                                    }
                                                    
                                                    console.log('Navigation vers le wizard avec les données complètes:', requestDataWithAssignee);
                                                    navigate('/request-wizard', {
                                                        state: {
                                                            requestData: requestDataWithAssignee
                                                        }
                                                    });
                                                } else {
                                                    console.log('Aucune donnée reçue de l\'API');
                                                }
                                            } catch (error) {
                                                console.error('Erreur lors de l\'appel API pour magic wand:', error);
                                            } finally {
                                                setIsLaunchingWizard(false);
                                            }
                                        };
                                        if (isEditing) {
                                            setPendingWizardAction(() => launch);
                                            setOpenConfirmWizard(true);
                                        } else {
                                            await launch();
                                        }
                                    }}
                                    disabled={isLaunchingWizard}
                                >
                                    {isLaunchingWizard ? <CircularProgress size={24} color="inherit" /> : <AutoFixHigh fontSize="medium" />}
                                </IconButton>
                                {/* Dialog de confirmation Wizard */}
                                <Dialog open={openConfirmWizard} onClose={() => setOpenConfirmWizard(false)}>
                                    <DialogTitle>Confirmer l'ouverture de l'assistant</DialogTitle>
                                    <DialogContent>
                                        Vous avez des modifications non sauvegardées. Voulez-vous vraiment lancer l'assistant ? Les modifications non sauvegardées seront perdues.
                                    </DialogContent>
                                    <DialogActions>
                                        <Button onClick={() => setOpenConfirmWizard(false)} color="inherit">Annuler</Button>
                                        <Button onClick={async () => {
                                            setOpenConfirmWizard(false);
                                            if (pendingWizardAction) await pendingWizardAction();
                                        }} color="primary" variant="contained" autoFocus>Lancer l'assistant</Button>
                                    </DialogActions>
                                </Dialog>
                                </>
                            )}
                            <Typography
                                variant="h4"
                                sx={{
                                    fontWeight: 700,
                                    letterSpacing: 1,
                                    mb: 1,
                                    textShadow: '1px 2px 8px rgba(0,0,0,0.12)',
                                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                    transform: 'translateY(0)',
                                    opacity: 1,
                                    '&:hover': {
                                        transform: 'translateY(-2px)',
                                        textShadow: '2px 4px 12px rgba(0,0,0,0.2)'
                                    }
                                }}
                            >
                                {id ? (
                                    <Box sx={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 1,
                                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                                    }}>
                                        {t('request.titleWithNumber', { number: trackingNumberDisplay })}
                                        <Box sx={{
                                            width: 8,
                                            height: 8,
                                            borderRadius: '50%',
                                            background: 'linear-gradient(45deg, #fff, rgba(255,255,255,0.7))',
                                            animation: 'pulse 2s infinite',
                                            '@keyframes pulse': {
                                                '0%': {
                                                    transform: 'scale(1)',
                                                    opacity: 1
                                                },
                                                '50%': {
                                                    transform: 'scale(1.2)',
                                                    opacity: 0.7
                                                },
                                                '100%': {
                                                    transform: 'scale(1)',
                                                    opacity: 1
                                                }
                                            }
                                        }} />
                                    </Box>
                                ) : (
                                    t('request.newRequestTitle')
                                )}
                            </Typography>
                            <Typography
                                variant="h6"
                                sx={{
                                    opacity: 0.95,
                                    fontWeight: 400,
                                    letterSpacing: 0.5,
                                    textShadow: '1px 1px 4px rgba(0,0,0,0.08)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    flexWrap: 'wrap',
                                    gap: 2,
                                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                                }}
                            >
                                {id ? (
                                    clientName ? (
                                        <>
                                            <Box sx={{ 
                                                display: 'flex', 
                                                alignItems: 'center',
                                                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                                            }}>
                                                {t('request.clientLabel', { client: clientName })}
                                            </Box>
                                            
                                            {/* Statut avec animation fluide */}
                                            <Box sx={{ 
                                                display: 'flex', 
                                                alignItems: 'center',
                                                transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                                                transform: isEditing ? 'scale(0.95)' : 'scale(1)',
                                                opacity: isEditing ? 0 : 1
                                            }}>
                                                {statusSelect && !isEditing && id && (
                                                    <Chip
                                                        icon={
                                                            <Box sx={{
                                                                fontSize: '18px',
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                justifyContent: 'center',
                                                                width: 24,
                                                                height: 24,
                                                                borderRadius: '50%',
                                                                background: 'rgba(255,255,255,0.2)',
                                                                animation: 'pulse 2s infinite',
                                                                '@keyframes pulse': {
                                                                    '0%': { transform: 'scale(1)', opacity: 1 },
                                                                    '50%': { transform: 'scale(1.1)', opacity: 0.8 },
                                                                    '100%': { transform: 'scale(1)', opacity: 1 }
                                                                }
                                                            }}>
                                                                {statusConfigMap[statusSelect]?.icon || '📋'}
                                                            </Box>
                                                        }
                                                        label={
                                                            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                                                                <Typography variant="body2" sx={{ 
                                                                    fontWeight: 700, 
                                                                    fontSize: 14,
                                                                    lineHeight: 1.2
                                                                }}>
                                                                    {statusLabelMap[statusSelect] || statusSelect}
                                                                </Typography>
                                                                <Typography variant="caption" sx={{ 
                                                                    fontSize: 11,
                                                                    opacity: 0.8,
                                                                    lineHeight: 1
                                                                }}>
                                                                    {statusConfigMap[statusSelect]?.description || ''}
                                                                </Typography>
                                                            </Box>
                                                        }
                                                        size="medium"
                                                        sx={{
                                                            height: 'auto',
                                                            minHeight: 48,
                                                            px: 2,
                                                            py: 1,
                                                            borderRadius: 3,
                                                            background: statusConfigMap[statusSelect]?.gradient || 'linear-gradient(135deg, #e0e0e0 0%, #bdbdbd 100%)',
                                                            color: statusConfigMap[statusSelect]?.color || '#222',
                                                            letterSpacing: 0.5,
                                                            transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                                                            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                                                            border: '1px solid rgba(255,255,255,0.2)',
                                                            backdropFilter: 'blur(10px)',
                                                            '&:hover': {
                                                                transform: 'translateY(-2px) scale(1.02)',
                                                                boxShadow: '0 8px 25px rgba(0,0,0,0.2)',
                                                                '& .MuiChip-icon': {
                                                                    animation: 'bounce 0.6s ease-in-out',
                                                                    '@keyframes bounce': {
                                                                        '0%, 20%, 50%, 80%, 100%': { transform: 'translateY(0)' },
                                                                        '40%': { transform: 'translateY(-4px)' },
                                                                        '60%': { transform: 'translateY(-2px)' }
                                                                    }
                                                                }
                                                            },
                                                            '& .MuiChip-label': {
                                                                padding: '4px 8px',
                                                                height: 'auto'
                                                            }
                                                        }}
                                                    />
                                                )}
                                            </Box>

                                        </>
                                    ) : (
                                        <Box sx={{ 
                                            display: 'flex', 
                                            alignItems: 'center',
                                            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                                        }}>
                                            {t('request.loadingClient')}
                                        </Box>
                                    )
                                ) : (
                                    <Box sx={{ 
                                        display: 'flex', 
                                        alignItems: 'center',
                                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                                    }}>
                                        {t('request.createRequestSubtitle')}
                                    </Box>
                                )}
                            </Typography>
                            {/* Barre d'outils moderne */}
                            {id && (
                                <Box sx={{ 
                                    display: 'flex', 
                                    alignItems: 'center', 
                                    justifyContent: 'space-between',
                                    gap: 2, 
                                    mt: 3,
                                    p: 2,
                                    background: 'rgba(255,255,255,0.1)',
                                    backdropFilter: 'blur(10px)',
                                    borderRadius: 3,
                                    border: '1px solid rgba(255,255,255,0.2)',
                                    transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                                    transform: 'translateY(0)',
                                    opacity: 1,
                                    boxShadow: '0 8px 32px rgba(0,0,0,0.1)'
                                }}>
                                    {/* Section gauche : Mode et Statut */}
                                    <Box sx={{ 
                                        display: 'flex', 
                                        alignItems: 'center', 
                                        gap: 2,
                                        flex: 1
                                    }}>
                                        {/* Chip de mode */}
                                        <Chip
                                            icon={
                                                <Box sx={{ 
                                                    fontSize: '14px',
                                                    display: 'flex',
                                                    alignItems: 'center'
                                                }}>
                                                    {isEditing ? '✏️' : '👁️'}
                                                </Box>
                                            }
                                            label={isEditing ? "Mode Édition" : "Mode Lecture"}
                                            color={isEditing ? "warning" : "default"}
                                            size="medium"
                                            sx={{
                                                backgroundColor: isEditing ? '#ff9800' : 'rgba(255,255,255,0.2)',
                                                color: isEditing ? 'white' : 'white',
                                                fontWeight: 600,
                                                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                                transform: isEditing ? 'scale(1.05)' : 'scale(1)',
                                                boxShadow: isEditing ? '0 4px 12px rgba(255,152,0,0.3)' : '0 2px 8px rgba(0,0,0,0.1)',
                                                '&:hover': {
                                                    transform: 'scale(1.1)',
                                                    boxShadow: isEditing ? '0 6px 16px rgba(255,152,0,0.4)' : '0 4px 12px rgba(0,0,0,0.15)'
                                                }
                                            }}
                                        />
                                        
                                        {/* Statut avec animation fluide */}
                                        <Box sx={{ 
                                            display: 'flex', 
                                            alignItems: 'center',
                                            transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                                            transform: isEditing ? 'scale(0.95)' : 'scale(1)',
                                            opacity: isEditing ? 0 : 1
                                        }}>
                                            {statusSelect && !isEditing && (
                                                <Chip
                                                    icon={
                                                        <Box sx={{
                                                            fontSize: '16px',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            justifyContent: 'center',
                                                            width: 20,
                                                            height: 20,
                                                            borderRadius: '50%',
                                                            background: 'rgba(255,255,255,0.2)',
                                                            animation: 'pulse 2s infinite',
                                                            '@keyframes pulse': {
                                                                '0%': { transform: 'scale(1)', opacity: 1 },
                                                                '50%': { transform: 'scale(1.1)', opacity: 0.8 },
                                                                '100%': { transform: 'scale(1)', opacity: 1 }
                                                            }
                                                        }}>
                                                            {statusConfigMap[statusSelect]?.icon || '📋'}
                                                        </Box>
                                                    }
                                                    label={statusLabelMap[statusSelect] || statusSelect}
                                                    size="medium"
                                                    sx={{
                                                        height: 'auto',
                                                        minHeight: 40,
                                                        px: 2,
                                                        py: 1,
                                                        borderRadius: 2,
                                                        background: statusConfigMap[statusSelect]?.gradient || 'linear-gradient(135deg, #e0e0e0 0%, #bdbdbd 100%)',
                                                        color: statusConfigMap[statusSelect]?.color || '#222',
                                                        fontWeight: 600,
                                                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                                        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                                                        '&:hover': {
                                                            transform: 'translateY(-1px) scale(1.02)',
                                                            boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
                                                        }
                                                    }}
                                                />
                                            )}
                                        </Box>
                                    </Box>

                                    {/* Section droite : Boutons d'action */}
                                    <Box sx={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 1,
                                        transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                                        transform: 'translateY(0)',
                                        opacity: 1
                                    }}>
                                        {/* Boutons en mode lecture */}
                                        {!isEditing && (
                                            <>
                                                {/* Bouton Modifier */}
                                                <Button
                                                    variant="outlined"
                                                    size="small"
                                                    startIcon={<EditIcon />}
                                                    onClick={handleStartEdit}
                                                    sx={{
                                                        color: 'white',
                                                        borderColor: 'rgba(255,255,255,0.5)',
                                                        backgroundColor: 'rgba(255,255,255,0.1)',
                                                        backdropFilter: 'blur(10px)',
                                                        borderRadius: 2,
                                                        px: 2,
                                                        py: 1,
                                                        fontWeight: 600,
                                                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                                        '&:hover': {
                                                            borderColor: 'white',
                                                            backgroundColor: 'rgba(255,255,255,0.2)',
                                                            transform: 'translateY(-2px)',
                                                            boxShadow: '0 8px 25px rgba(255,255,255,0.2)'
                                                        },
                                                        '&:active': {
                                                            transform: 'translateY(0)'
                                                        }
                                                    }}
                                                >
                                                    Modifier
                                                </Button>
                                                
                                                {/* Bouton Rafraîchir */}
                                                <IconButton
                                                    size="small"
                                                    onClick={reloadRequestData}
                                                    disabled={loadingRequest}
                                                    sx={{
                                                        color: 'white',
                                                        border: '1px solid rgba(255,255,255,0.5)',
                                                        backgroundColor: 'rgba(255,255,255,0.1)',
                                                        backdropFilter: 'blur(10px)',
                                                        borderRadius: 2,
                                                        width: 40,
                                                        height: 40,
                                                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                                        '&:hover': {
                                                            borderColor: 'white',
                                                            backgroundColor: 'rgba(255,255,255,0.2)',
                                                            transform: 'translateY(-2px) rotate(180deg)',
                                                            boxShadow: '0 8px 25px rgba(255,255,255,0.2)'
                                                        },
                                                        '&:active': {
                                                            transform: 'translateY(0) rotate(180deg)'
                                                        },
                                                        '&:disabled': {
                                                            opacity: 0.5,
                                                            transform: 'none'
                                                        }
                                                    }}
                                                >
                                                    <RefreshIcon />
                                                </IconButton>
                                            </>
                                        )}

                                        {/* Boutons en mode édition */}
                                        {isEditing && (
                                            <>
                                                {/* Bouton Annuler */}
                                                <Button
                                                    variant="outlined"
                                                    size="small"
                                                    onClick={handleCancelEdit}
                                                    sx={{
                                                        color: 'white',
                                                        borderColor: 'rgba(255,255,255,0.5)',
                                                        backgroundColor: 'rgba(255,255,255,0.1)',
                                                        backdropFilter: 'blur(10px)',
                                                        borderRadius: 2,
                                                        px: 2,
                                                        py: 1,
                                                        fontWeight: 600,
                                                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                                        '&:hover': {
                                                            borderColor: 'white',
                                                            backgroundColor: 'rgba(255,255,255,0.2)',
                                                            transform: 'translateY(-2px)',
                                                            boxShadow: '0 8px 25px rgba(255,255,255,0.2)'
                                                        },
                                                        '&:active': {
                                                            transform: 'translateY(0)'
                                                        }
                                                    }}
                                                >
                                                    Annuler
                                                </Button>

                                                {/* Bouton Sauvegarder */}
                                                <Button
                                                    variant="contained"
                                                    size="small"
                                                    startIcon={<SaveIcon />}
                                                    onClick={handleSubmit(handleEditSubmit)}
                                                    disabled={isSubmitting || isLoading}
                                                    sx={{
                                                        background: 'linear-gradient(135deg, #4caf50 0%, #45a049 100%)',
                                                        color: 'white',
                                                        fontWeight: 600,
                                                        borderRadius: 2,
                                                        px: 2,
                                                        py: 1,
                                                        boxShadow: '0 4px 12px rgba(76,175,80,0.3)',
                                                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                                        '&:hover': {
                                                            background: 'linear-gradient(135deg, #45a049 0%, #3d8b40 100%)',
                                                            transform: 'translateY(-2px)',
                                                            boxShadow: '0 8px 25px rgba(76,175,80,0.4)'
                                                        },
                                                        '&:active': {
                                                            transform: 'translateY(0)'
                                                        },
                                                        '&:disabled': {
                                                            background: 'rgba(255,255,255,0.2)',
                                                            color: 'rgba(255,255,255,0.5)',
                                                            transform: 'none',
                                                            boxShadow: 'none'
                                                        }
                                                    }}
                                                >
                                                    {isSubmitting ? 'Sauvegarde...' : 'Sauvegarder'}
                                                </Button>

                                                {/* Select de statut - seulement en mode édition */}
                                                <FormControl size="small" sx={{ 
                                                    minWidth: 160,
                                                    '& .MuiOutlinedInput-root': {
                                                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                                        '&:hover': {
                                                            transform: 'translateY(-1px)',
                                                            boxShadow: '0 4px 12px rgba(255,255,255,0.2)'
                                                        }
                                                    }
                                                }}>
                                                    <InputLabel sx={{ 
                                                        color: 'rgba(255,255,255,0.8)',
                                                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                                                    }}>
                                                        Changer statut
                                                    </InputLabel>
                                                    <Select
                                                        value={statusSelect}
                                                        label="Changer statut"
                                                        onChange={handleChangeStatus}
                                                        disabled={statusLoading}
                                                        startAdornment={
                                                            statusLoading ? (
                                                                <Box sx={{ 
                                                                    display: 'flex', 
                                                                    alignItems: 'center', 
                                                                    mr: 1 
                                                                }}>
                                                                    <CircularProgress 
                                                                        size={16} 
                                                                        sx={{ 
                                                                            color: 'white',
                                                                            animation: 'spin 1s linear infinite',
                                                                            '@keyframes spin': {
                                                                                '0%': { transform: 'rotate(0deg)' },
                                                                                '100%': { transform: 'rotate(360deg)' }
                                                                            }
                                                                        }} 
                                                                    />
                                                                </Box>
                                                            ) : (
                                                                <Box sx={{ 
                                                                    display: 'flex', 
                                                                    alignItems: 'center', 
                                                                    mr: 1,
                                                                    fontSize: '16px'
                                                                }}>
                                                                    {statusConfigMap[statusSelect]?.icon || '📋'}
                                                                </Box>
                                                            )
                                                        }
                                                        sx={{
                                                            color: 'white',
                                                            '& .MuiOutlinedInput-notchedOutline': {
                                                                borderColor: 'rgba(255,255,255,0.3)',
                                                                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                                                            },
                                                            '&:hover .MuiOutlinedInput-notchedOutline': {
                                                                borderColor: 'rgba(255,255,255,0.6)'
                                                            },
                                                            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                                                borderColor: 'white',
                                                                boxShadow: '0 0 0 2px rgba(255,255,255,0.2)'
                                                            },
                                                            '& .MuiSvgIcon-root': {
                                                                color: 'white'
                                                            }
                                                        }}
                                                        MenuProps={{
                                                            PaperProps: {
                                                                sx: {
                                                                    borderRadius: 2,
                                                                    boxShadow: '0 10px 30px rgba(0,0,0,0.2)',
                                                                    backdropFilter: 'blur(10px)',
                                                                    background: 'rgba(255,255,255,0.95)',
                                                                    border: '1px solid rgba(255,255,255,0.2)',
                                                                    '& .MuiMenuItem-root': {
                                                                        borderRadius: 1,
                                                                        margin: 0.5,
                                                                        transition: 'all 0.2s ease',
                                                                        '&:hover': {
                                                                            background: 'rgba(0,0,0,0.05)',
                                                                            transform: 'translateX(4px)'
                                                                        }
                                                                    }
                                                                }
                                                            }
                                                        }}
                                                    >
                                                        {statusOptions.map(status => {
                                                            const config = statusConfigMap[status];
                                                            return (
                                                                <MenuItem key={status} value={status} sx={{ py: 1.5 }}>
                                                                    <Box sx={{ 
                                                                        display: 'flex', 
                                                                        alignItems: 'center', 
                                                                        gap: 2,
                                                                        width: '100%'
                                                                    }}>
                                                                        <Box sx={{
                                                                            fontSize: '20px',
                                                                            display: 'flex',
                                                                            alignItems: 'center',
                                                                            justifyContent: 'center',
                                                                            width: 32,
                                                                            height: 32,
                                                                            borderRadius: '50%',
                                                                            background: config?.gradient || '#e0e0e0',
                                                                            color: config?.color || '#222',
                                                                            boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                                                                        }}>
                                                                            {config?.icon || '📋'}
                                                                        </Box>
                                                                        <Box sx={{ flex: 1 }}>
                                                                            <Typography variant="body2" sx={{ 
                                                                                fontWeight: 600,
                                                                                color: '#1a202c'
                                                                            }}>
                                                                                {statusLabelMap[status] || status}
                                                                            </Typography>
                                                                            <Typography variant="caption" sx={{ 
                                                                                color: '#718096',
                                                                                fontSize: 11
                                                                            }}>
                                                                                {config?.description || ''}
                                                                            </Typography>
                                                                        </Box>
                                                                        {status === statusSelect && (
                                                                            <Box sx={{
                                                                                width: 8,
                                                                                height: 8,
                                                                                borderRadius: '50%',
                                                                                background: config?.gradient || '#1976d2',
                                                                                animation: 'pulse 1.5s infinite',
                                                                                '@keyframes pulse': {
                                                                                    '0%': { transform: 'scale(1)', opacity: 1 },
                                                                                    '50%': { transform: 'scale(1.2)', opacity: 0.7 },
                                                                                    '100%': { transform: 'scale(1)', opacity: 1 }
                                                                                }
                                                                            }} />
                                                                        )}
                                                                    </Box>
                                                                </MenuItem>
                                                            );
                                                        })}
                                                    </Select>
                                                </FormControl>
                                            </>
                                        )}
                                    </Box>
                                </Box>
                            )}
                        </Box>

                        <Tabs
                            value={tabIndex}
                            onChange={(_, newValue) => setTabIndex(newValue)}
                            sx={{ 
                                mb: 4, 
                                background: 'white', 
                                borderRadius: 3, 
                                boxShadow: '0 10px 30px rgba(102,126,234,0.1)',
                                border: '1px solid rgba(102,126,234,0.1)',
                                '& .MuiTabs-indicator': {
                                    height: 3,
                                    borderRadius: '3px 3px 0 0',
                                    background: 'linear-gradient(90deg, #667eea 0%, #764ba2 100%)'
                                },
                                '& .MuiTab-root': {
                                    textTransform: 'none',
                                    fontWeight: 600,
                                    fontSize: '1rem',
                                    minHeight: 60,
                                    transition: 'all 0.3s ease',
                                    '&:hover': {
                                        backgroundColor: 'rgba(102,126,234,0.05)'
                                    },
                                    '&.Mui-selected': {
                                        color: '#667eea'
                                    }
                                }
                            }}
                            indicatorColor="primary"
                            textColor="primary"
                        >
                            <Tab 
                                icon={<InfoOutlinedIcon sx={{ fontSize: 20 }} />} 
                                iconPosition="start" 
                                label={t('request.generalTab')}
                                sx={{ gap: 1 }}
                            />
                            <Tab 
                                icon={<SettingsOutlinedIcon sx={{ fontSize: 20 }} />} 
                                iconPosition="start" 
                                label={t('request.detailsTab')}
                                sx={{ gap: 1 }}
                            />
                        </Tabs>

                        <form onSubmit={id ? (isEditing ? handleSubmit(handleEditSubmit) : undefined) : handleSubmit(handleSubmitTransport)}>
                            {/* Onglet Général */}
                            {tabIndex === 0 && (
                                <>
                                    {/* Section Informations Client */}
                                    <Slide direction="up" in timeout={1000}>
                                        <Card sx={{
                                            mb: 4,
                                            borderRadius: 4,
                                            boxShadow: '0 20px 60px rgba(0,0,0,0.08)',
                                            background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
                                            border: '1px solid rgba(102,126,234,0.1)',
                                            position: 'relative',
                                            overflow: 'hidden',
                                            '&::before': {
                                                content: '""',
                                                position: 'absolute',
                                                top: 0,
                                                left: 0,
                                                right: 0,
                                                height: 4,
                                                background: 'linear-gradient(90deg, #667eea 0%, #764ba2 100%)'
                                            }
                                        }}>
                                            <CardContent sx={{ p: 5 }}>
                                                <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
                                                    <Avatar sx={{
                                                        bgcolor: 'primary.main',
                                                        mr: 3,
                                                        width: 56,
                                                        height: 56,
                                                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                                        boxShadow: '0 8px 24px rgba(102,126,234,0.3)'
                                                    }}>
                                                        <PersonIcon sx={{ fontSize: 28 }} />
                                                    </Avatar>
                                                    <Box>
                                                        <Typography variant="h5" sx={{ 
                                                            fontWeight: 700, 
                                                            color: '#1a202c',
                                                            mb: 0.5
                                                        }}>
                                                            {t('request.clientInfo')}
                                                        </Typography>
                                                        <Typography variant="body2" sx={{ 
                                                            color: '#718096',
                                                            fontWeight: 500
                                                        }}>
                                                            Informations du client et assignation
                                                        </Typography>
                                                    </Box>
                                                </Box>
                                                
                                                <Grid container spacing={3}>
                                                    <Grid size={{ xs: 12, md: 6 }} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                                                        <Box sx={{ display: 'flex', alignItems: 'flex-end', width: '100%' }}>
                                                            {/* Champ client existant */}
                                                            <Box sx={{ flex: 1 }}>
                                                                {id && !isEditing ? (
                                                                    <TextField
                                                                        fullWidth
                                                                        size="small"
                                                                        label="Client"
                                                                        value={clientName || 'Non défini'}
                                                                        InputProps={{ readOnly: true }}
                                                                    />
                                                                ) : (
                                                            <Controller name='customerId' control={control} rules={{ required: "Sélectionner un client" }}
                                                                render={({ field }) => {
                                                                    console.log('[DEBUG] Render champ client - field.value:', field.value, 'customer:', customer);
                                                                    return (
                                                                        <Autocomplete
                                                                            {...field}
                                                                            fullWidth
                                                                            size='small'
                                                                            value={customer}
                                                                            inputValue={clientInput}
                                                                            onInputChange={(_, value) => setClientInput(value)}
                                                                            options={clientOptions.length ? clientOptions : (customersArray || [])}
                                                                            getOptionLabel={(option) => option?.contactName || ''}
                                                                            isOptionEqualToValue={(option, value) => option?.contactId === value?.contactId}
                                                                            loading={clientLoading}
                                                                            disabled={!isEditing}
                                                                            onFocus={() => {
                                                                                if (isEditing && clientInput.length === 0 && clientOptions.length === 0) {
                                                                                    fetchFirstContacts();
                                                                                }
                                                                            }}
                                                                            onChange={(_, value: ContactViewModel | null) => {
                                                                                if (isEditing) {
                                                                                    const id = value?.contactId ? Number(value.contactId) : undefined;
                                                                                    field.onChange(id);
                                                                                    setCustomer(value);
                                                                                }
                                                                            }}
                                                                            filterOptions={(x) => x}
                                                                            renderOption={(props, option) => (
                                                                                <li {...props} key={option.contactId || option.contactName || Math.random()}>
                                                                                    {option.contactName}
                                                                                </li>
                                                                            )}
                                                                            renderInput={(params) => (
                                                                                                <TextField 
                                                                                                    {...params} 
                                                                                                    label={t('request.client')} 
                                                                                                    placeholder={t('request.searchClientPlaceholder')}
                                                                                                    error={!!errors.customerId} 
                                                                                                    helperText={errors.customerId?.message}
                                                                                                    {...getReadOnlyProps()}
                                                                                                />
                                                                            )}
                                                                        />
                                                                    )
                                                                }}
                                                            />
                                                                )}
                                                            </Box>
                                                            {/* Bouton nouveau prospect */}
                                                            <IconButton color="primary" sx={{ ml: 1, mb: 1 }} onClick={handleOpenProspectModal} disabled={Boolean(id && !isEditing)}>
                                                                <AddCircleOutlineIcon />
                                                            </IconButton>
                                                        </Box>
                                                        {/* Champs Email et Téléphone/Whatsapp sur la même ligne sous le champ Client et le bouton */}
                                                        <Box sx={{ display: 'flex', gap: 2, width: '100%', mt: 1 }}>
                                                            <TextField
                                                                fullWidth
                                                                size="small"
                                                                label="Email"
                                                                value={customer?.email || ''}
                                                                InputProps={{ readOnly: true }}
                                                                sx={{ mt: 1, width: '60%' }}
                                                            />
                                                            <TextField
                                                                fullWidth
                                                                size="small"
                                                                label="Téléphone / Whatsapp"
                                                                value={customer?.phone || ''}
                                                                InputProps={{ readOnly: true }}
                                                                sx={{ mt: 1, width: '33%' }}
                                                            />
                                                        </Box>
                                                    </Grid>
                                                    <Grid size={{ xs: 12, md: 6 }}>
                                                        {id && !isEditing ? (
                                                            <FormControl fullWidth size="small" sx={{ mt: 0.5 }}>
                                                                <InputLabel shrink>Assigné à</InputLabel>
                                                                <Box
                                                                    sx={{
                                                                        minHeight: 40,
                                                                        display: 'flex',
                                                                        alignItems: 'center',
                                                                        pl: 1,
                                                                        border: '1px solid #ccc',
                                                                        borderRadius: 1,
                                                                        bgcolor: '#f5f5f5',
                                                                        fontSize: 16,
                                                                        color: '#222',
                                                                        mt: 2,
                                                                    }}
                                                                >
                                                                    {selectedAssignee && selectedAssignee.displayName ? (
                                                                        <>
                                                                            {selectedAssignee.displayName}
                                                                            {selectedAssignee.mail && (
                                                                                <span style={{ color: '#888', fontSize: 13, marginLeft: 8 }}>
                                                                                    {selectedAssignee.mail}
                                                                                </span>
                                                                            )}
                                                                        </>
                                                                    ) : (
                                                                        <span style={{ color: '#888' }}>Non assigné</span>
                                                                    )}
                                                                </Box>
                                                            </FormControl>
                                                        ) : (
                                                            <Controller name='assigneeId' control={control}
                                                                render={() =>
                                                                    <FormControl fullWidth size="small" error={!!errors.assigneeId} sx={{ mt: 0.5 }}>
                                                                        <InputLabel>{t('request.assignee')}</InputLabel>
                                                                        <Select
                                                                            label={t('request.assignee')}
                                                                            value={assigneeIdStr}
                                                                            disabled={!isEditing}
                                                                            onChange={(e: SelectChangeEvent<string>) => {
                                                                                if (isEditing) {
                                                                                    setValue('assigneeId', e.target.value);
                                                                                }
                                                                            }}
                                                                            sx={getReadOnlyProps().sx}
                                                                        >
                                                                            <MenuItem value=""><em>{t('request.selectAssigneePlaceholder')}</em></MenuItem>
                                                                            {assigneesWithFallback.map((user: any) => {
                                                                                const label = user.displayName || user.mail || user.id;
                                                                                return (
                                                                                    <MenuItem key={user.id} value={String(user.id)}>
                                                                                        {label}
                                                                                        {user.mail ? <span style={{ color: '#888', fontSize: 12, marginLeft: 8 }}>{user.mail}</span> : null}
                                                                                    </MenuItem>
                                                                                );
                                                                            })}
                                                                        </Select>
                                                                        {errors.assigneeId && <FormHelperText>{errors.assigneeId.message}</FormHelperText>}
                                                                    </FormControl>
                                                                }
                                                            />
                                                        )}
                                                    </Grid>
                                                </Grid>
                                            </CardContent>
                                        </Card>
                                    </Slide>
                                    {/* Section Localisation */}
                                    <Slide direction="up" in timeout={1200}>
                                        <Card sx={{
                                            mb: 4,
                                            borderRadius: 4,
                                            boxShadow: '0 20px 60px rgba(0,0,0,0.08)',
                                            background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
                                            border: '1px solid rgba(102,126,234,0.1)',
                                            position: 'relative',
                                            overflow: 'hidden',
                                            '&::before': {
                                                content: '""',
                                                position: 'absolute',
                                                top: 0,
                                                left: 0,
                                                right: 0,
                                                height: 4,
                                                background: 'linear-gradient(90deg, #f093fb 0%, #f5576c 100%)'
                                            }
                                        }}>
                                            <CardContent sx={{ p: 5 }}>
                                                <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
                                                    <Avatar sx={{
                                                        bgcolor: 'primary.main',
                                                        mr: 3,
                                                        width: 56,
                                                        height: 56,
                                                        background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                                                        boxShadow: '0 8px 24px rgba(240,147,251,0.3)'
                                                    }}>
                                                        <LocationOnIcon sx={{ fontSize: 28 }} />
                                                    </Avatar>
                                                    <Box>
                                                        <Typography variant="h5" sx={{ 
                                                            fontWeight: 700, 
                                                            color: '#1a202c',
                                                            mb: 0.5
                                                        }}>
                                                            {t('request.location')}
                                                        </Typography>
                                                        <Typography variant="body2" sx={{ 
                                                            color: '#718096',
                                                            fontWeight: 500
                                                        }}>
                                                            Points de collecte et de livraison
                                                        </Typography>
                                                    </Box>
                                                </Box>
                                                
                                                <Grid container spacing={3}>
                                                    {/* Point de collecte */}
                                                    <Grid size={{ xs: 12, md: 6 }}>
                                                        <Box sx={{ 
                                                            display: 'flex', 
                                                            alignItems: 'center', 
                                                            mb: 3,
                                                            p: 2,
                                                            borderRadius: 2,
                                                            background: 'linear-gradient(135deg, rgba(102,126,234,0.05) 0%, rgba(118,75,162,0.05) 100%)',
                                                            border: '1px solid rgba(102,126,234,0.1)'
                                                        }}>
                                                            <Box sx={{
                                                                width: 8,
                                                                height: 8,
                                                                borderRadius: '50%',
                                                                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                                                mr: 2
                                                            }} />
                                                            <Typography variant="h6" sx={{ 
                                                                fontWeight: 700, 
                                                                color: '#4c51bf',
                                                                fontSize: '1.1rem'
                                                            }}>
                                                                {t('request.pickupPoint')}
                                                            </Typography>
                                                        </Box>
                                                        <Stack spacing={2}>
                                                            <Controller name='pickupLocation.addressLine' control={control} rules={{ required: "Adresse requise" }}
                                                                render={({ field }) =>
                                                                    <AddressAutocomplete
                                                                        label={t('request.address')}
                                                                        value={field.value}
                                                                        onChange={({ address, city, postalCode, country }) => {
                                                                            if (isEditing) {
                                                                                field.onChange(address);
                                                                                setValue('pickupLocation.city', city || '');
                                                                                setValue('pickupLocation.postalCode', postalCode || '');
                                                                                setValue('pickupLocation.country', country || '');
                                                                            }
                                                                        }}
                                                                    />
                                                                }
                                                            />
                                                            <Controller name='pickupLocation.city' control={control} rules={{ required: "Ville requise" }}
                                                                render={({ field }) =>
                                                                    <TextField 
                                                                        fullWidth 
                                                                        size="small" 
                                                                        label={t('request.city')} 
                                                                        {...field} 
                                                                        error={!!errors.pickupLocation?.city} 
                                                                        helperText={errors.pickupLocation?.city?.message}
                                                                        {...getReadOnlyProps()}
                                                                        sx={{
                                                                            ...getReadOnlyProps().sx,
                                                                            '& .MuiOutlinedInput-root': {
                                                                                borderRadius: 2,
                                                                                transition: 'all 0.3s ease',
                                                                                '&:hover': {
                                                                                    '& .MuiOutlinedInput-notchedOutline': {
                                                                                        borderColor: isEditing ? '#667eea' : '#e0e0e0',
                                                                                        borderWidth: isEditing ? 2 : 1
                                                                                    }
                                                                                },
                                                                                '&.Mui-focused': {
                                                                                    '& .MuiOutlinedInput-notchedOutline': {
                                                                                        borderColor: isEditing ? '#667eea' : '#e0e0e0',
                                                                                        borderWidth: isEditing ? 2 : 1,
                                                                                        boxShadow: isEditing ? '0 0 0 3px rgba(102,126,234,0.1)' : 'none'
                                                                                    }
                                                                                }
                                                                            },
                                                                            '& .MuiInputLabel-root': {
                                                                                fontWeight: 500
                                                                            }
                                                                        }}
                                                                    />
                                                                }
                                                            />
                                                            <Grid container spacing={2}>
                                                                <Grid size={{ xs: 6 }}>
                                                                    <Controller name='pickupLocation.postalCode' control={control}
                                                                        render={({ field }) =>
                                                                            <TextField fullWidth size="small" label={t('request.postalCode')} {...field} {...getReadOnlyProps()} />
                                                                        }
                                                                    />
                                                                </Grid>
                                                                <Grid size={{ xs: 6 }}>
                                                                    <Controller name='pickupLocation.country' control={control}
                                                                        render={({ field }) =>
                                                                            <TextField fullWidth size="small" label={t('request.country')} {...field} {...getReadOnlyProps()} />
                                                                        }
                                                                    />
                                                                </Grid>
                                                            </Grid>
                                                        </Stack>
                                                    </Grid>

                                                    {/* Point de livraison */}
                                                    <Grid size={{ xs: 12, md: 6 }}>
                                                        <Box sx={{ 
                                                            display: 'flex', 
                                                            alignItems: 'center', 
                                                            mb: 3,
                                                            p: 2,
                                                            borderRadius: 2,
                                                            background: 'linear-gradient(135deg, rgba(240,147,251,0.05) 0%, rgba(245,87,108,0.05) 100%)',
                                                            border: '1px solid rgba(240,147,251,0.1)'
                                                        }}>
                                                            <Box sx={{
                                                                width: 8,
                                                                height: 8,
                                                                borderRadius: '50%',
                                                                background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                                                                mr: 2
                                                            }} />
                                                            <Typography variant="h6" sx={{ 
                                                                fontWeight: 700, 
                                                                color: '#e53e3e',
                                                                fontSize: '1.1rem'
                                                            }}>
                                                                {t('request.deliveryPoint')}
                                                            </Typography>
                                                        </Box>
                                                        <Stack spacing={2}>
                                                            <Controller name='deliveryLocation.addressLine' control={control} rules={{ required: "Adresse requise" }}
                                                                render={({ field }) =>
                                                                    <AddressAutocomplete
                                                                        label={t('request.address')}
                                                                        value={field.value}
                                                                        onChange={({ address, city, postalCode, country }) => {
                                                                            if (isEditing) {
                                                                                field.onChange(address);
                                                                                setValue('deliveryLocation.city', city || '');
                                                                                setValue('deliveryLocation.postalCode', postalCode || '');
                                                                                setValue('deliveryLocation.country', country || '');
                                                                            }
                                                                        }}
                                                                    />
                                                                }
                                                            />
                                                            <Controller name='deliveryLocation.city' control={control} rules={{ required: "Ville requise" }}
                                                                render={({ field }) =>
                                                                    <TextField fullWidth size="small" label={t('request.city')} {...field} error={!!errors.deliveryLocation?.city} helperText={errors.deliveryLocation?.city?.message} {...getReadOnlyProps()} />
                                                                }
                                                            />
                                                            <Grid container spacing={2}>
                                                                <Grid size={{ xs: 6 }}>
                                                                    <Controller name='deliveryLocation.postalCode' control={control}
                                                                        render={({ field }) =>
                                                                            <TextField fullWidth size="small" label={t('request.postalCode')} {...field} {...getReadOnlyProps()} />
                                                                        }
                                                                    />
                                                                </Grid>
                                                                <Grid size={{ xs: 6 }}>
                                                                    <Controller name='deliveryLocation.country' control={control}
                                                                        render={({ field }) =>
                                                                            <TextField fullWidth size="small" label={t('request.country')} {...field} {...getReadOnlyProps()} />
                                                                        }
                                                                    />
                                                                </Grid>
                                                            </Grid>
                                                        </Stack>
                                                    </Grid>
                                                </Grid>
                                            </CardContent>
                                        </Card>
                                    </Slide>
                                    {/* Section Marchandise */}
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
                                                        bgcolor: 'primary.main',
                                                        mr: 2,
                                                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                                                    }}>
                                                        <Inventory2Icon />
                                                    </Avatar>
                                                    <Typography variant="h5" sx={{ fontWeight: 600, color: '#2c3e50' }}>
                                                        {t('request.merchandise')}
                                                    </Typography>
                                                </Box>
                                                
                                                <Grid container spacing={3}>
                                                <Grid size={{ xs: 12, md: 6 }}>
                                                        <Controller name='productId' control={control}
                                                            render={({ field }) =>
                                                                <Autocomplete
                                                                    fullWidth
                                                                    size="small"
                                                                    options={products ?? []}
                                                                    getOptionLabel={(option) => option?.productName ?? ''}
                                                                    isOptionEqualToValue={(option, value) => option?.productId === value?.productId}
                                                                    value={selectedProduct}
                                                                    disabled={!isEditing}
                                                                    onChange={(_, value) => {
                                                                        if (isEditing) {
                                                                            setSelectedProduct(value);
                                                                            field.onChange(value?.productId ?? 0);
                                                                            setValue('productName', value?.productName ?? '');
                                                                        }
                                                                    }}
                                                                    renderOption={(props, option) => (
                                                                        <li {...props} key={option.productId}>
                                                                            {option.productName}
                                                                        </li>
                                                                    )}
                                                                    renderInput={(params) => (
                                                                        <TextField {...params} label={t('request.product')} {...getReadOnlyProps()} />
                                                                    )}
                                                                />
                                                            }
                                                        />
                                                    </Grid>
                                                    <Grid size={{ xs: 12, md: 6 }}>
                                                        <Controller name='incoterm' control={control}
                                                            render={({ field }) =>
                                                                <FormControl fullWidth size="small">
                                                                    <InputLabel>{t('request.incoterm')}</InputLabel>
                                                                    <Select 
                                                                        label={t('request.incoterm')} 
                                                                        value={field.value ?? ''} 
                                                                        disabled={!isEditing}
                                                                        onChange={(e) => {
                                                                            if (isEditing) {
                                                                                field.onChange(e);
                                                                            }
                                                                        }}
                                                                        sx={getReadOnlyProps().sx}
                                                                    >
                                                                        <MenuItem value=""><em>{t('request.selectIncotermPlaceholder')}</em></MenuItem>
                                                                        {incotermValues.map((inc: string) => (
                                                                            <MenuItem key={inc} value={inc}>{inc}</MenuItem>
                                                                        ))}
                                                                    </Select>
                                                                </FormControl>
                                                            }
                                                        />
                                                    </Grid>
                                                    <Grid size={{ xs: 12, md: 6 }}>
                                                        <Controller name='cargoType' control={control} rules={{ required: "Type de cargaison requis" }}
                                                            render={({ field }) =>
                                                                <FormControl fullWidth size="small">
                                                                    <InputLabel>{t('request.cargoType')}</InputLabel>
                                                                    <Select 
                                                                        label={t('request.cargoType')} 
                                                                        value={field.value ?? 0} 
                                                                        disabled={!isEditing}
                                                                        onChange={(e) => {
                                                                            if (isEditing) {
                                                                                field.onChange(e);
                                                                            }
                                                                        }}
                                                                        sx={getReadOnlyProps().sx}
                                                                    >
                                                                        {cargoTypeOptions.map((type) => (
                                                                            <MenuItem key={type.value} value={type.value}>{type.label}</MenuItem>
                                                                        ))}
                                                                    </Select>
                                                                </FormControl>
                                                            }
                                                        />
                                                    </Grid>
                                                    <Grid size={{ xs: 12, md: 6 }}>
                                                        <Controller name='packingType' control={control} rules={{ required: "Type d'emballage requis" }}
                                                            render={({ field }) =>
                                                                <FormControl fullWidth size="small">
                                                                    <InputLabel>{t('request.packingType')}</InputLabel>
                                                                    <Select 
                                                                        label={t('request.packingType')} 
                                                                        value={field.value ?? ''} 
                                                                        disabled={!isEditing}
                                                                        onChange={(e) => {
                                                                            if (isEditing) {
                                                                                field.onChange(e);
                                                                            }
                                                                        }}
                                                                        sx={getReadOnlyProps().sx}
                                                                    >
                                                                        {packingTypeOptions.map((type) => (
                                                                            <MenuItem key={type} value={type}>{type}</MenuItem>
                                                                        ))}
                                                                    </Select>
                                                                </FormControl>
                                                            }
                                                        />
                                                    </Grid>
                                                    <Grid size={{ xs: 12, md: 6 }}>
                                                        <Controller name='quantity' control={control}
                                                            render={({ field }) =>
                                                                <TextField fullWidth size="small" label={t('request.quantity')} type="number" {...field} value={field.value ?? 1} {...getReadOnlyProps()} />
                                                            }
                                                        />
                                                    </Grid>
                                                    
                                                 
                                                    <Grid size={{ xs: 12 }}>
                                                        <Controller name='goodsDescription' control={control}
                                                            render={({ field }) =>
                                                                <TextField fullWidth multiline rows={3} label={t('request.goodsDescription')} {...field} {...getReadOnlyProps()} />
                                                            }
                                                        />
                                                    </Grid>
                                                </Grid>
                                            </CardContent>
                                        </Card>
                                    </Slide>
                                </>
                            )}
                            {/* Onglet Détails */}
                            {tabIndex === 1 && (
                                <>
                                    {/* Section Détails Techniques */}
                                    <Slide direction="up" in timeout={1600}>
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
                                                        <LocalShippingIcon />
                                                    </Avatar>
                                                    <Typography variant="h5" sx={{ fontWeight: 600, color: '#2c3e50' }}>
                                                        {t('request.technicalDetails')}
                                                    </Typography>
                                                </Box>
                                                
                                                <Grid container spacing={3}>
                                                    <Grid size={{ xs: 12, md: 4 }}>
                                                        <Controller name='numberOfUnits' control={control}
                                                            render={({ field }) =>
                                                                <TextField fullWidth size="small" label={t('request.numberOfUnits')} type="number" {...field} {...getReadOnlyProps()} />
                                                            }
                                                        />
                                                    </Grid>
                                                    <Grid size={{ xs: 12, md: 4 }}>
                                                        <Controller name='totalWeightKg' control={control}
                                                            render={({ field }) =>
                                                                <TextField fullWidth size="small" label={t('request.totalWeightKg')} type="number" {...field} {...getReadOnlyProps()} />
                                                            }
                                                        />
                                                    </Grid>
                                                    <Grid size={{ xs: 12, md: 4 }}>
                                                        <Controller name='totalDimensions' control={control}
                                                            render={({ field }) =>
                                                                <TextField fullWidth size="small" label={t('request.totalDimensions')} {...field} {...getReadOnlyProps()} />
                                                            }
                                                        />
                                                    </Grid>
                                                    <Grid size={{ xs: 12, md: 6 }}>
                                                        <Controller name='preferredTransportMode' control={control}
                                                            render={({ field }) =>
                                                                <FormControl fullWidth size="small">
                                                                    <InputLabel>{t('request.preferredTransportMode')}</InputLabel>
                                                                    <Select 
                                                                        label={t('request.preferredTransportMode')} 
                                                                        value={field.value} 
                                                                        disabled={!isEditing}
                                                                        onChange={(e) => {
                                                                            if (isEditing) {
                                                                                field.onChange(e);
                                                                            }
                                                                        }}
                                                                        sx={getReadOnlyProps().sx}
                                                                    >
                                                                        {transportModes.map((mode) => (
                                                                            <MenuItem key={mode.value} value={mode.value}>{mode.label}</MenuItem>
                                                                        ))}
                                                                    </Select>
                                                                </FormControl>
                                                            }
                                                        />
                                                    </Grid>
                                                </Grid>
                                            </CardContent>
                                        </Card>
                                    </Slide>
                                    {/* Section Dates (Planning) */}
                                    <Slide direction="up" in timeout={1800}>
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
                                                        <CalendarTodayIcon />
                                                    </Avatar>
                                                    <Typography variant="h5" sx={{ fontWeight: 600, color: '#2c3e50' }}>
                                                        {t('request.planning')}
                                                    </Typography>
                                                </Box>
                                                
                                                <Grid container spacing={3}>
                                                    <Grid size={{ xs: 12, md: 6 }}>
                                                        <Controller name='pickupDate' control={control}
                                                            render={({ field }) =>
                                                                <DateTimePicker
                                                                    label={t('request.pickupDate')}
                                                                    value={field.value ?? null}
                                                                    disabled={!isEditing}
                                                                    onChange={(value) => {
                                                                        if (isEditing) {
                                                                            field.onChange(value);
                                                                        }
                                                                    }}
                                                                    slotProps={{
                                                                        textField: {
                                                                            fullWidth: true,
                                                                            size: "small",
                                                                            ...getReadOnlyProps()
                                                                        }
                                                                    }}
                                                                />
                                                            }
                                                        />
                                                    </Grid>
                                                    <Grid size={{ xs: 12, md: 6 }}>
                                                        <Controller name='deliveryDate' control={control}
                                                            render={({ field }) =>
                                                                <DateTimePicker
                                                                    label={t('request.deliveryDate')}
                                                                    value={field.value ?? null}
                                                                    disabled={!isEditing}
                                                                    onChange={(value) => {
                                                                        if (isEditing) {
                                                                            field.onChange(value);
                                                                        }
                                                                    }}
                                                                    slotProps={{
                                                                        textField: {
                                                                            fullWidth: true,
                                                                            size: "small",
                                                                            ...getReadOnlyProps()
                                                                        }
                                                                    }}
                                                                />
                                                            }
                                                        />
                                                    </Grid>
                                                </Grid>
                                            </CardContent>
                                        </Card>
                                    </Slide>
                                    {/* Section Spécial */}
                                    <Slide direction="up" in timeout={2000}>
                                        <Card sx={{
                                            mb: 4,
                                            borderRadius: 4,
                                            boxShadow: '0 20px 60px rgba(0,0,0,0.08)',
                                            background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
                                            border: '1px solid rgba(102,126,234,0.1)',
                                            position: 'relative',
                                            overflow: 'hidden',
                                            '&::before': {
                                                content: '""',
                                                position: 'absolute',
                                                top: 0,
                                                left: 0,
                                                right: 0,
                                                height: 4,
                                                background: 'linear-gradient(90deg, #ffecd2 0%, #fcb69f 100%)'
                                            }
                                        }}>
                                            <CardContent sx={{ p: 5 }}>
                                                <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
                                                    <Avatar sx={{
                                                        bgcolor: 'primary.main',
                                                        mr: 3,
                                                        width: 56,
                                                        height: 56,
                                                        background: 'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)',
                                                        boxShadow: '0 8px 24px rgba(252,182,159,0.3)'
                                                    }}>
                                                        <WarningIcon sx={{ fontSize: 28, color: '#8b4513' }} />
                                                    </Avatar>
                                                    <Box>
                                                        <Typography variant="h5" sx={{ 
                                                            fontWeight: 700, 
                                                            color: '#1a202c',
                                                            mb: 0.5
                                                        }}>
                                                            {t('request.specialInstructions')}
                                                        </Typography>
                                                        <Typography variant="body2" sx={{ 
                                                            color: '#718096',
                                                            fontWeight: 500
                                                        }}>
                                                            Instructions spéciales et caractéristiques
                                                        </Typography>
                                                    </Box>
                                                </Box>
                                                
                                                <Grid container spacing={3}>
                                                    <Grid size={{ xs: 12, md: 6 }}>
                                                        <Stack spacing={2}>
                                                            <FormControlLabel
                                                                control={
                                                                    <Controller name='isDangerousGoods' control={control}
                                                                        render={({ field }) =>
                                                                            <Switch 
                                                                                checked={field.value} 
                                                                                disabled={!isEditing}
                                                                                onChange={(e) => {
                                                                                    if (isEditing) {
                                                                                        field.onChange(e);
                                                                                    }
                                                                                }} 
                                                                            />
                                                                        }
                                                                    />
                                                                }
                                                                label={t('request.isDangerousGoods')}
                                                            />
                                                            <FormControlLabel
                                                                control={
                                                                    <Controller name='requiresTemperatureControl' control={control}
                                                                        render={({ field }) =>
                                                                            <Switch 
                                                                                checked={field.value} 
                                                                                disabled={!isEditing}
                                                                                onChange={(e) => {
                                                                                    if (isEditing) {
                                                                                        field.onChange(e);
                                                                                    }
                                                                                }} 
                                                                            />
                                                                        }
                                                                    />
                                                                }
                                                                label={t('request.requiresTemperatureControl')}
                                                            />
                                                        </Stack>
                                                    </Grid>
                                                    <Grid size={{ xs: 12, md: 6 }}>
                                                        <Stack spacing={2}>
                                                            <FormControlLabel
                                                                control={
                                                                    <Controller name='isFragileOrHighValue' control={control}
                                                                        render={({ field }) =>
                                                                            <Switch 
                                                                                checked={field.value} 
                                                                                disabled={!isEditing}
                                                                                onChange={(e) => {
                                                                                    if (isEditing) {
                                                                                        field.onChange(e);
                                                                                    }
                                                                                }} 
                                                                            />
                                                                        }
                                                                    />
                                                                }
                                                                label={t('request.isFragileOrHighValue')}
                                                            />
                                                            <FormControlLabel
                                                                control={
                                                                    <Controller name='requiresSpecialHandling' control={control}
                                                                        render={({ field }) =>
                                                                            <Switch 
                                                                                checked={field.value} 
                                                                                disabled={!isEditing}
                                                                                onChange={(e) => {
                                                                                    if (isEditing) {
                                                                                        field.onChange(e);
                                                                                    }
                                                                                }} 
                                                                            />
                                                                        }
                                                                    />
                                                                }
                                                                label={t('request.requiresSpecialHandling')}
                                                            />
                                                        </Stack>
                                                    </Grid>
                                                    <Grid size={{ xs: 12 }}>
                                                        <Controller name='specialInstructions' control={control}
                                                            render={({ field }) =>
                                                                <TextField fullWidth multiline rows={3} label={t('request.specialInstructions')} {...field} {...getReadOnlyProps()} />
                                                            }
                                                        />
                                                    </Grid>
                                                </Grid>
                                            </CardContent>
                                        </Card>
                                    </Slide>
                                    {/* Section Commentaires */}
                                    <Slide direction="up" in timeout={2200}>
                                        <Card sx={{
                                            mb: 4,
                                            borderRadius: 4,
                                            boxShadow: '0 20px 60px rgba(0,0,0,0.08)',
                                            background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
                                            border: '1px solid rgba(102,126,234,0.1)',
                                            position: 'relative',
                                            overflow: 'hidden',
                                            '&::before': {
                                                content: '""',
                                                position: 'absolute',
                                                top: 0,
                                                left: 0,
                                                right: 0,
                                                height: 4,
                                                background: 'linear-gradient(90deg, #a8edea 0%, #fed6e3 100%)'
                                            }
                                        }}>
                                            <CardContent sx={{ p: 5 }}>
                                                <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
                                                    <Avatar sx={{
                                                        bgcolor: 'primary.main',
                                                        mr: 3,
                                                        width: 56,
                                                        height: 56,
                                                        background: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
                                                        boxShadow: '0 8px 24px rgba(168,237,234,0.3)'
                                                    }}>
                                                        <DescriptionIcon sx={{ fontSize: 28, color: '#2d3748' }} />
                                                    </Avatar>
                                                    <Box>
                                                        <Typography variant="h5" sx={{ 
                                                            fontWeight: 700, 
                                                            color: '#1a202c',
                                                            mb: 0.5
                                                        }}>
                                                            {t('request.comments')}
                                                        </Typography>
                                                        <Typography variant="body2" sx={{ 
                                                            color: '#718096',
                                                            fontWeight: 500
                                                        }}>
                                                            Détails et commentaires supplémentaires
                                                        </Typography>
                                                    </Box>
                                                </Box>
                                                
                                                <Grid container spacing={3}>
                                                    <Grid size={{ xs: 12, md: 6 }}>
                                                        <Controller name='details' control={control}
                                                            render={({ field }) =>
                                                                <TextField fullWidth multiline rows={3} label={t('request.details')} {...field} {...getReadOnlyProps()} />
                                                            }
                                                        />
                                                    </Grid>
                                                    <Grid size={{ xs: 12, md: 6 }}>
                                                        <Controller name='additionalComments' control={control}
                                                            render={({ field }) =>
                                                                <TextField fullWidth multiline rows={3} label={t('request.additionalComments')} {...field} {...getReadOnlyProps()} />
                                                            }
                                                        />
                                                    </Grid>
                                                    <Grid size={{ xs: 12 }}>
                                                        <Controller name='tags' control={control}
                                                            render={({ field }) =>
                                                                <TextField fullWidth size="small" label={t('request.tags')} {...field} {...getReadOnlyProps()} />
                                                            }
                                                        />
                                                    </Grid>
                                                </Grid>
                                            </CardContent>
                                        </Card>
                                    </Slide>
                                </>
                            )}
                            {/* Boutons d'action */}
                            <Slide direction="up" in timeout={2400}>
                                <Box sx={{ 
                                    display: 'flex', 
                                    justifyContent: 'flex-end', 
                                    gap: 3, 
                                    mt: 6,
                                    p: 4,
                                    background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
                                    borderRadius: 4,
                                    border: '1px solid rgba(102,126,234,0.1)'
                                }}>
                                    {id ? (
                                        // Mode édition/visualisation d'une demande existante
                                        <>
                                            {isEditing ? (
                                                <>
                                                    <Button 
                                                        variant="outlined" 
                                                        color="primary" 
                                                        onClick={handleCancelEdit}
                                                        sx={{
                                                            borderRadius: 3,
                                                            px: 4,
                                                            py: 1.5,
                                                            fontWeight: 600,
                                                            textTransform: 'none',
                                                            fontSize: '1rem',
                                                            borderColor: '#667eea',
                                                            color: '#667eea',
                                                            '&:hover': {
                                                                borderColor: '#5a67d8',
                                                                backgroundColor: 'rgba(102,126,234,0.05)',
                                                                transform: 'translateY(-2px)',
                                                                boxShadow: '0 8px 25px rgba(102,126,234,0.15)'
                                                            },
                                                            transition: 'all 0.3s ease'
                                                        }}
                                                    >
                                                        {t('request.cancel')}
                                                    </Button>
                                                    <Button
                                                        type="submit"
                                                        variant="contained"
                                                        startIcon={<SaveIcon />}
                                                        sx={{
                                                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                                            color: 'white',
                                                            fontWeight: 700,
                                                            textTransform: 'none',
                                                            fontSize: '1rem',
                                                            boxShadow: '0 10px 30px rgba(102,126,234,0.3)',
                                                            borderRadius: 3,
                                                            px: 5,
                                                            py: 1.5,
                                                            '&:hover': {
                                                                background: 'linear-gradient(135deg, #5a67d8 0%, #6b46c1 100%)',
                                                                transform: 'translateY(-3px)',
                                                                boxShadow: '0 15px 40px rgba(102,126,234,0.4)'
                                                            },
                                                            '&:active': {
                                                                transform: 'translateY(-1px)'
                                                            },
                                                            transition: 'all 0.3s ease'
                                                        }}
                                                        disabled={isSubmitting || isLoading}
                                                    >
                                                        {t('request.save')}
                                                    </Button>
                                                </>
                                            ) : (
                                                <Button 
                                                    variant="outlined" 
                                                    color="primary" 
                                                    onClick={() => navigate(-1)}
                                                    sx={{
                                                        borderRadius: 3,
                                                        px: 4,
                                                        py: 1.5,
                                                        fontWeight: 600,
                                                        textTransform: 'none',
                                                        fontSize: '1rem',
                                                        borderColor: '#667eea',
                                                        color: '#667eea',
                                                        '&:hover': {
                                                            borderColor: '#5a67d8',
                                                            backgroundColor: 'rgba(102,126,234,0.05)',
                                                            transform: 'translateY(-2px)',
                                                            boxShadow: '0 8px 25px rgba(102,126,234,0.15)'
                                                        },
                                                        transition: 'all 0.3s ease'
                                                    }}
                                                >
                                                    {t('request.back')}
                                                </Button>
                                            )}
                                        </>
                                    ) : (
                                        // Mode création d'une nouvelle demande
                                        <>
                                            <Button 
                                                variant="outlined" 
                                                color="primary" 
                                                onClick={() => navigate(-1)}
                                                sx={{
                                                    borderRadius: 3,
                                                    px: 4,
                                                    py: 1.5,
                                                    fontWeight: 600,
                                                    textTransform: 'none',
                                                    fontSize: '1rem',
                                                    borderColor: '#667eea',
                                                    color: '#667eea',
                                                    '&:hover': {
                                                        borderColor: '#5a67d8',
                                                        backgroundColor: 'rgba(102,126,234,0.05)',
                                                        transform: 'translateY(-2px)',
                                                        boxShadow: '0 8px 25px rgba(102,126,234,0.15)'
                                                    },
                                                    transition: 'all 0.3s ease'
                                                }}
                                            >
                                                {t('request.cancel')}
                                            </Button>
                                            <Button
                                                type="submit"
                                                variant="contained"
                                                startIcon={<SaveIcon />}
                                                sx={{
                                                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                                    color: 'white',
                                                    fontWeight: 700,
                                                    textTransform: 'none',
                                                    fontSize: '1rem',
                                                    boxShadow: '0 10px 30px rgba(102,126,234,0.3)',
                                                    borderRadius: 3,
                                                    px: 5,
                                                    py: 1.5,
                                                    '&:hover': {
                                                        background: 'linear-gradient(135deg, #5a67d8 0%, #6b46c1 100%)',
                                                        transform: 'translateY(-3px)',
                                                        boxShadow: '0 15px 40px rgba(102,126,234,0.4)'
                                                    },
                                                    '&:active': {
                                                        transform: 'translateY(-1px)'
                                                    },
                                                    transition: 'all 0.3s ease'
                                                }}
                                                disabled={isSubmitting || isLoading}
                                            >
                                                {t('request.createRequest')}
                                            </Button>
                                        </>
                                    )}
                                </Box>
                            </Slide>
                            
                            {/* Historique des statuts - Affiché seulement en mode édition */}
                            {id && isEditing && statusHistory.length > 0 && (
                                <Slide direction="up" in timeout={2600}>
                                    <Card sx={{
                                        mb: 4,
                                        borderRadius: 4,
                                        boxShadow: '0 20px 60px rgba(0,0,0,0.08)',
                                        background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
                                        border: '1px solid rgba(102,126,234,0.1)',
                                        position: 'relative',
                                        overflow: 'hidden',
                                        '&::before': {
                                            content: '""',
                                            position: 'absolute',
                                            top: 0,
                                            left: 0,
                                            right: 0,
                                            height: 4,
                                            background: 'linear-gradient(90deg, #a8edea 0%, #fed6e3 100%)'
                                        }
                                    }}>
                                        <CardContent sx={{ p: 4 }}>
                                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                                                <Box sx={{
                                                    width: 40,
                                                    height: 40,
                                                    borderRadius: '50%',
                                                    background: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    mr: 2,
                                                    fontSize: '20px'
                                                }}>
                                                    📊
                                                </Box>
                                                <Box>
                                                    <Typography variant="h6" sx={{ 
                                                        fontWeight: 700, 
                                                        color: '#1a202c',
                                                        mb: 0.5
                                                    }}>
                                                        Historique des statuts
                                                    </Typography>
                                                    <Typography variant="body2" sx={{ 
                                                        color: '#718096',
                                                        fontWeight: 500
                                                    }}>
                                                        Chronologie des changements de statut
                                                    </Typography>
                                                </Box>
                                            </Box>
                                            
                                            <Box sx={{ maxHeight: 200, overflowY: 'auto' }}>
                                                {statusHistory.slice().reverse().map((entry, index) => {
                                                    const config = statusConfigMap[entry.status];
                                                    return (
                                                        <Box key={index} sx={{
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            gap: 2,
                                                            p: 2,
                                                            mb: 1,
                                                            borderRadius: 2,
                                                            background: 'rgba(0,0,0,0.02)',
                                                            border: '1px solid rgba(0,0,0,0.05)',
                                                            transition: 'all 0.2s ease',
                                                            '&:hover': {
                                                                background: 'rgba(0,0,0,0.05)',
                                                                transform: 'translateX(4px)'
                                                            }
                                                        }}>
                                                            <Box sx={{
                                                                fontSize: '16px',
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                justifyContent: 'center',
                                                                width: 28,
                                                                height: 28,
                                                                borderRadius: '50%',
                                                                background: config?.gradient || '#e0e0e0',
                                                                color: config?.color || '#222',
                                                                boxShadow: '0 2px 6px rgba(0,0,0,0.1)'
                                                            }}>
                                                                {config?.icon || '📋'}
                                                            </Box>
                                                            <Box sx={{ flex: 1 }}>
                                                                <Typography variant="body2" sx={{ 
                                                                    fontWeight: 600,
                                                                    color: '#1a202c'
                                                                }}>
                                                                    {statusLabelMap[entry.status] || entry.status}
                                                                </Typography>
                                                                <Typography variant="caption" sx={{ 
                                                                    color: '#718096',
                                                                    fontSize: 11
                                                                }}>
                                                                    {entry.timestamp.toLocaleString('fr-FR')} • {entry.user}
                                                                </Typography>
                                                            </Box>
                                                        </Box>
                                                    );
                                                })}
                                            </Box>
                                        </CardContent>
                                    </Card>
                                </Slide>
                            )}
                        </form>
                    </Box>
                </Fade>
            </Box>
            {/* Modal de création de prospect */}
            <Dialog open={openProspectModal} onClose={handleCloseProspectModal} maxWidth="xs" fullWidth>
                <DialogTitle>{t('newProspect')}</DialogTitle>
                <DialogContent>
                    <Stack spacing={2} mt={1}>
                        <TextField
                            label={t('prospectName')}
                            name="contactName"
                            value={prospectForm.contactName}
                            onChange={handleProspectChange}
                            required
                            autoFocus
                        />
                        <TextField
                            label={t('emailAddress')}
                            name="email"
                            value={prospectForm.email}
                            onChange={handleProspectChange}
                            type="email"
                        />
                        <TextField
                            label={t('phoneNumber')}
                            name="phone"
                            value={prospectForm.phone}
                            onChange={handleProspectChange}
                        />
                        <TextField
                            label={t('country')}
                            name="countryCode"
                            value={prospectForm.countryCode}
                            onChange={handleProspectChange}
                        />
                    </Stack>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseProspectModal} color="inherit">{t('cancel')}</Button>
                    <Button onClick={handleCreateProspect} color="success" variant="contained" disabled={prospectLoading}>
                        {t('create')}
                    </Button>
                </DialogActions>
            </Dialog>
        </LocalizationProvider>
    )
}

export default Request