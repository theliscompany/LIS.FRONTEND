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
import type { GetUserGroupUsersResponse } from '@features/request/api/types.gen';
import { putApiRequestByIdChangeStatus } from '@features/request/api/sdk.gen';
// import { getUserGroupUsersByUserId } from '@features/request/api/sdk.gen'; // Plus utilisé
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined';
import { showSnackbar } from '@components/common/Snackbar';
import type { SelectChangeEvent } from '@mui/material/Select';
import { getApiContactById } from '@features/crm/api/sdk.gen';
import { getContactGetContactByIdById } from '@features/crm/api/sdk.gen';

// SUPPRIMÉ: Variables inutilisées
// const columnHelper = createColumnHelper<CargoDetailsViewModel>()
// const icon = <CheckBoxOutlineBlank fontSize="small" />;
// const checkedIcon = <CheckBox fontSize="small" />;

// Type pour les utilisateurs assignés
interface AssigneeUser {
  id: string;
  displayName?: string;
  userPrincipalName?: string;
  mail?: string;
}

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
interface ApiRequestData {
  requestQuoteId?: string | null;
  customerId?: number;
  pickupLocation?: {
    addressLine: string;
    city: string;
    postalCode: string;
    country: string;
  };
  deliveryLocation?: {
    addressLine: string;
    city: string;
    postalCode: string;
    country: string;
  };
  cargoType?: string | number;
  quantity?: number;
  details?: string;
  tags?: string;
  packingType?: string;
  assigneeId?: string;
  productId?: number;
  productName?: string;
  pickupDate?: string | Date;
  deliveryDate?: string | Date;
  goodsDescription?: string;
  numberOfUnits?: number;
  totalWeightKg?: number;
  totalDimensions?: string;
  isDangerousGoods?: boolean;
  requiresTemperatureControl?: boolean;
  isFragileOrHighValue?: boolean;
  requiresSpecialHandling?: boolean;
  specialInstructions?: string;
  preferredTransportMode?: number;
  additionalComments?: string;
  incoterm?: string;
  trackingNumber?: string | null;
}

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
    
    // Pour l'affichage, utilisons selectedAssignee comme assignee
    const assignee = selectedAssignee;
    
    console.log(`[PERFORMANCE] Assigné sélectionné: ${assigneeIdStr}, trouvé: ${!!selectedAssignee}, total: ${assignees.length}`);

    // SUPPRIMÉ: Map des couleurs pour chaque statut - variable inutilisée
    // const statusColorMap: Record<string, 'default' | 'primary' | 'success' | 'warning' | 'error' | 'info'> = {...}

    // Map des couleurs personnalisées pour chaque statut (background et texte)
    const statusChipStyleMap: Record<string, { bgcolor: string; color: string }> = {
      New: { bgcolor: '#1976d2', color: '#fff' },
      EnAttente: { bgcolor: '#90caf9', color: '#222' },
      Valider: { bgcolor: '#43a047', color: '#fff' },
      Rejeter: { bgcolor: '#e53935', color: '#fff' },
      EnCoursDeTraitement: { bgcolor: '#ffb300', color: '#222' },
      EnTransit: { bgcolor: '#00bcd4', color: '#fff' },
      EnDouane: { bgcolor: '#8d6e63', color: '#fff' },
      LivraisonEnCours: { bgcolor: '#fbc02d', color: '#222' },
      Livre: { bgcolor: '#388e3c', color: '#fff' },
      Annule: { bgcolor: '#757575', color: '#fff' },
      Retour: { bgcolor: '#6d4c41', color: '#fff' },
      Problème: { bgcolor: '#d32f2f', color: '#fff' },
      EnAttenteDeFacturation: { bgcolor: '#7e57c2', color: '#fff' },
    };

    const currentStatus = initialValues?.status || 'NEW';

    const statusOptions = [
      "New", "EnAttente", "Valider", "Rejeter", "EnCoursDeTraitement", "EnTransit",
      "EnDouane", "LivraisonEnCours", "Livre", "Annule", "Retour", "Problème", "EnAttenteDeFacturation"
    ];
    const [statusSelect, setStatusSelect] = useState(currentStatus);
    const [statusLoading, setStatusLoading] = useState(false);
    const handleChangeStatus = async (event: SelectChangeEvent<string>) => {
      const newStatus = event.target.value;
      setStatusSelect(newStatus);
      if (!id) return;
      setStatusLoading(true);
      try {
        await putApiRequestByIdChangeStatus({ path: { id }, body: { newStatus: newStatus } as any });
        showSnackbar('Statut mis à jour avec succès', 'success');
        // Optionnel : recharger la demande pour afficher le nouveau statut
        const updatedRequest = await getApiRequestById({ path: { id } });
        if (updatedRequest && updatedRequest.data) {
          const updatedFormData = mapRequestQuoteViewModelToForm(updatedRequest.data as any);
          setInitialValues(updatedFormData);
        }
      } catch {
        showSnackbar('Erreur lors du changement de statut', 'warning');
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

    // SUPPRIMÉ: Fonction utilitaire pour rendre un champ en lecture seule - fonction inutilisée
    // const getReadOnlyProps = () => ({...});

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
                                background: 'linear-gradient(90deg, #667eea 0%, #764ba2 100%)',
                                borderRadius: 4,
                                p: { xs: 2, md: 4 },
                                color: 'white',
                                boxShadow: '0 8px 32px rgba(102,126,234,0.15)',
                                position: 'relative',
                                minHeight: 100,
                                display: 'flex',
                                flexDirection: 'column',
                                justifyContent: 'center',
                                alignItems: 'center'
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
                                    textShadow: '1px 2px 8px rgba(0,0,0,0.12)'
                                }}
                            >
                                {id ? (
                                    <>{t('request.titleWithNumber', { number: trackingNumberDisplay })}</>
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
                                    textShadow: '1px 1px 4px rgba(0,0,0,0.08)'
                                }}
                            >
                                {id ? (
                                    clientName ? (
                                        <>
                                            {t('request.clientLabel', { client: clientName })}
                                            {statusSelect && !isEditing && id && (
                                                <Chip
                                                    label={statusLabelMap[statusSelect] || statusSelect}
                                                    size="medium"
                                                    sx={{
                                                      ml: 2,
                                                      fontWeight: 700,
                                                      fontSize: 16,
                                                      px: 2,
                                                      py: 1,
                                                      borderRadius: 2,
                                                      bgcolor: statusChipStyleMap[statusSelect]?.bgcolor || '#e0e0e0',
                                                      color: statusChipStyleMap[statusSelect]?.color || '#222',
                                                      letterSpacing: 0.5,
                                                    }}
                                                />
                                            )}
                                            {isEditing && (
                                              <FormControl size="small" sx={{ minWidth: 180, ml: 2 }}>
                                                <InputLabel>Statut</InputLabel>
                                                <Select
                                                  value={statusSelect}
                                                  label="Statut"
                                                  onChange={handleChangeStatus}
                                                  disabled={statusLoading}
                                                >
                                                  {statusOptions.map(status => (
                                                    <MenuItem key={status} value={status}>{statusLabelMap[status] || status}</MenuItem>
                                                  ))}
                                                </Select>
                                              </FormControl>
                                            )}
                                        </>
                                    ) : (
                                        t('request.loadingClient')
                                    )
                                ) : (
                                    t('request.createRequestSubtitle')
                                )}
                            </Typography>
                            {id && (
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 1 }}>
                                    <Chip
                                        label={isEditing ? "Mode Édition" : "Mode Lecture"}
                                        color={isEditing ? "warning" : "default"}
                                        size="small"
                                        sx={{
                                            backgroundColor: isEditing ? '#ff9800' : '#e0e0e0',
                                            color: isEditing ? 'white' : '#666',
                                            fontWeight: 600
                                        }}
                                    />
                                    {!isEditing && (
                                        <>
                                            <Button
                                                variant="outlined"
                                                size="small"
                                                startIcon={<EditIcon />}
                                                onClick={handleStartEdit}
                                                sx={{
                                                    color: 'white',
                                                    borderColor: 'white',
                                                    '&:hover': {
                                                        borderColor: '#ffe082',
                                                        backgroundColor: 'rgba(255,255,255,0.1)'
                                                    }
                                                }}
                                            >
                                                Modifier
                                            </Button>
                                            <IconButton
                                                size="small"
                                                onClick={reloadRequestData}
                                                disabled={loadingRequest}
                                                sx={{
                                                    color: 'white',
                                                    border: '1px solid white',
                                                    '&:hover': {
                                                        borderColor: '#ffe082',
                                                        backgroundColor: 'rgba(255,255,255,0.1)'
                                                    }
                                                }}
                                            >
                                                <RefreshIcon />
                                            </IconButton>
                                        </>
                                    )}
                                </Box>
                            )}
                        </Box>

                        <Tabs
                            value={tabIndex}
                            onChange={(_, newValue) => setTabIndex(newValue)}
                            sx={{ mb: 3, background: 'white', borderRadius: 2, boxShadow: '0 2px 8px rgba(102,126,234,0.08)' }}
                            indicatorColor="primary"
                            textColor="primary"
                        >
                            <Tab icon={<InfoOutlinedIcon />} iconPosition="start" label={t('request.generalTab')} />
                            <Tab icon={<SettingsOutlinedIcon />} iconPosition="start" label={t('request.detailsTab')} />
                        </Tabs>

                        <form onSubmit={id ? (isEditing ? handleSubmit(handleEditSubmit) : undefined) : handleSubmit(handleSubmitTransport)}>
                            {/* Onglet Général */}
                            {tabIndex === 0 && (
                                <>
                                    {/* Section Informations Client */}
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
                                                        <PersonIcon />
                                                    </Avatar>
                                                    <Typography variant="h5" sx={{ fontWeight: 600, color: '#2c3e50' }}>
                                                        {t('request.clientInfo')}
                                                    </Typography>
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
                                                                                    onFocus={() => {
                                                                                        if (clientInput.length === 0 && clientOptions.length === 0) {
                                                                                            fetchFirstContacts();
                                                                                        }
                                                                                    }}
                                                                                    onChange={(_, value: ContactViewModel | null) => {
                                                                                        const id = value?.contactId ? Number(value.contactId) : undefined;
                                                                                        field.onChange(id);
                                                                                        setCustomer(value);
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
                                                                            onChange={(e: SelectChangeEvent<string>) => setValue('assigneeId', e.target.value)}
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
                                                        <LocationOnIcon />
                                                    </Avatar>
                                                    <Typography variant="h5" sx={{ fontWeight: 600, color: '#2c3e50' }}>
                                                        {t('request.location')}
                                                    </Typography>
                                                </Box>
                                                
                                                <Grid container spacing={3}>
                                                    {/* Point de collecte */}
                                                    <Grid size={{ xs: 12, md: 6 }}>
                                                        <Typography variant="h6" sx={{ fontWeight: 600, color: '#5f4bb6', mb: 2 }}>
                                                            {t('request.pickupPoint')}
                                                        </Typography>
                                                        <Stack spacing={2}>
                                                            <Controller name='pickupLocation.addressLine' control={control} rules={{ required: "Adresse requise" }}
                                                                render={({ field }) =>
                                                                    <AddressAutocomplete
                                                                        label={t('request.address')}
                                                                        value={field.value}
                                                                        onChange={({ address, city, postalCode, country }) => {
                                                                            field.onChange(address);
                                                                            setValue('pickupLocation.city', city || '');
                                                                            setValue('pickupLocation.postalCode', postalCode || '');
                                                                            setValue('pickupLocation.country', country || '');
                                                                        }}
                                                                    />
                                                                }
                                                            />
                                                            <Controller name='pickupLocation.city' control={control} rules={{ required: "Ville requise" }}
                                                                render={({ field }) =>
                                                                    <TextField fullWidth size="small" label={t('request.city')} {...field} error={!!errors.pickupLocation?.city} helperText={errors.pickupLocation?.city?.message} />
                                                                }
                                                            />
                                                            <Grid container spacing={2}>
                                                                <Grid size={{ xs: 6 }}>
                                                                    <Controller name='pickupLocation.postalCode' control={control}
                                                                        render={({ field }) =>
                                                                            <TextField fullWidth size="small" label={t('request.postalCode')} {...field} />
                                                                        }
                                                                    />
                                                                </Grid>
                                                                <Grid size={{ xs: 6 }}>
                                                                    <Controller name='pickupLocation.country' control={control}
                                                                        render={({ field }) =>
                                                                            <TextField fullWidth size="small" label={t('request.country')} {...field} />
                                                                        }
                                                                    />
                                                                </Grid>
                                                            </Grid>
                                                        </Stack>
                                                    </Grid>

                                                    {/* Point de livraison */}
                                                    <Grid size={{ xs: 12, md: 6 }}>
                                                        <Typography variant="h6" sx={{ fontWeight: 600, color: '#5f4bb6', mb: 2 }}>
                                                            {t('request.deliveryPoint')}
                                                        </Typography>
                                                        <Stack spacing={2}>
                                                            <Controller name='deliveryLocation.addressLine' control={control} rules={{ required: "Adresse requise" }}
                                                                render={({ field }) =>
                                                                    <AddressAutocomplete
                                                                        label={t('request.address')}
                                                                        value={field.value}
                                                                        onChange={({ address, city, postalCode, country }) => {
                                                                            field.onChange(address);
                                                                            setValue('deliveryLocation.city', city || '');
                                                                            setValue('deliveryLocation.postalCode', postalCode || '');
                                                                            setValue('deliveryLocation.country', country || '');
                                                                        }}
                                                                    />
                                                                }
                                                            />
                                                            <Controller name='deliveryLocation.city' control={control} rules={{ required: "Ville requise" }}
                                                                render={({ field }) =>
                                                                    <TextField fullWidth size="small" label={t('request.city')} {...field} error={!!errors.deliveryLocation?.city} helperText={errors.deliveryLocation?.city?.message} />
                                                                }
                                                            />
                                                            <Grid container spacing={2}>
                                                                <Grid size={{ xs: 6 }}>
                                                                    <Controller name='deliveryLocation.postalCode' control={control}
                                                                        render={({ field }) =>
                                                                            <TextField fullWidth size="small" label={t('request.postalCode')} {...field} />
                                                                        }
                                                                    />
                                                                </Grid>
                                                                <Grid size={{ xs: 6 }}>
                                                                    <Controller name='deliveryLocation.country' control={control}
                                                                        render={({ field }) =>
                                                                            <TextField fullWidth size="small" label={t('request.country')} {...field} />
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
                                                                    onChange={(_, value) => {
                                                                        setSelectedProduct(value);
                                                                        field.onChange(value?.productId ?? 0);
                                                                        setValue('productName', value?.productName ?? '');
                                                                    }}
                                                                    renderOption={(props, option) => (
                                                                        <li {...props} key={option.productId}>
                                                                            {option.productName}
                                                                        </li>
                                                                    )}
                                                                    renderInput={(params) => (
                                                                        <TextField {...params} label={t('request.product')} />
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
                                                                    <Select label={t('request.incoterm')} value={field.value ?? ''} onChange={field.onChange}>
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
                                                                    <Select label={t('request.cargoType')} value={field.value ?? 0} onChange={field.onChange}>
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
                                                                    <Select label={t('request.packingType')} value={field.value ?? ''} onChange={field.onChange}>
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
                                                                <TextField fullWidth size="small" label={t('request.quantity')} type="number" {...field} value={field.value ?? 1} />
                                                            }
                                                        />
                                                    </Grid>
                                                    
                                                 
                                                    <Grid size={{ xs: 12 }}>
                                                        <Controller name='goodsDescription' control={control}
                                                            render={({ field }) =>
                                                                <TextField fullWidth multiline rows={3} label={t('request.goodsDescription')} {...field} />
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
                                                                <TextField fullWidth size="small" label={t('request.numberOfUnits')} type="number" {...field} />
                                                            }
                                                        />
                                                    </Grid>
                                                    <Grid size={{ xs: 12, md: 4 }}>
                                                        <Controller name='totalWeightKg' control={control}
                                                            render={({ field }) =>
                                                                <TextField fullWidth size="small" label={t('request.totalWeightKg')} type="number" {...field} />
                                                            }
                                                        />
                                                    </Grid>
                                                    <Grid size={{ xs: 12, md: 4 }}>
                                                        <Controller name='totalDimensions' control={control}
                                                            render={({ field }) =>
                                                                <TextField fullWidth size="small" label={t('request.totalDimensions')} {...field} />
                                                            }
                                                        />
                                                    </Grid>
                                                    <Grid size={{ xs: 12, md: 6 }}>
                                                        <Controller name='preferredTransportMode' control={control}
                                                            render={({ field }) =>
                                                                <FormControl fullWidth size="small">
                                                                    <InputLabel>{t('request.preferredTransportMode')}</InputLabel>
                                                                    <Select label={t('request.preferredTransportMode')} value={field.value} onChange={field.onChange}>
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
                                                                    onChange={field.onChange}
                                                                    slotProps={{
                                                                        textField: {
                                                                            fullWidth: true,
                                                                            size: "small"
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
                                                                    onChange={field.onChange}
                                                                    slotProps={{
                                                                        textField: {
                                                                            fullWidth: true,
                                                                            size: "small"
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
                                                        <WarningIcon />
                                                    </Avatar>
                                                    <Typography variant="h5" sx={{ fontWeight: 600, color: '#2c3e50' }}>
                                                        {t('request.specialInstructions')}
                                                    </Typography>
                                                </Box>
                                                
                                                <Grid container spacing={3}>
                                                    <Grid size={{ xs: 12, md: 6 }}>
                                                        <Stack spacing={2}>
                                                            <FormControlLabel
                                                                control={
                                                                    <Controller name='isDangerousGoods' control={control}
                                                                        render={({ field }) =>
                                                                            <Switch checked={field.value} onChange={field.onChange} />
                                                                        }
                                                                    />
                                                                }
                                                                label={t('request.isDangerousGoods')}
                                                            />
                                                            <FormControlLabel
                                                                control={
                                                                    <Controller name='requiresTemperatureControl' control={control}
                                                                        render={({ field }) =>
                                                                            <Switch checked={field.value} onChange={field.onChange} />
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
                                                                            <Switch checked={field.value} onChange={field.onChange} />
                                                                        }
                                                                    />
                                                                }
                                                                label={t('request.isFragileOrHighValue')}
                                                            />
                                                            <FormControlLabel
                                                                control={
                                                                    <Controller name='requiresSpecialHandling' control={control}
                                                                        render={({ field }) =>
                                                                            <Switch checked={field.value} onChange={field.onChange} />
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
                                                                <TextField fullWidth multiline rows={3} label={t('request.specialInstructions')} {...field} />
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
                                                        <DescriptionIcon />
                                                    </Avatar>
                                                    <Typography variant="h5" sx={{ fontWeight: 600, color: '#2c3e50' }}>
                                                        {t('request.comments')}
                                                    </Typography>
                                                </Box>
                                                
                                                <Grid container spacing={3}>
                                                    <Grid size={{ xs: 12, md: 6 }}>
                                                        <Controller name='details' control={control}
                                                            render={({ field }) =>
                                                                <TextField fullWidth multiline rows={3} label={t('request.details')} {...field} />
                                                            }
                                                        />
                                                    </Grid>
                                                    <Grid size={{ xs: 12, md: 6 }}>
                                                        <Controller name='additionalComments' control={control}
                                                            render={({ field }) =>
                                                                <TextField fullWidth multiline rows={3} label={t('request.additionalComments')} {...field} />
                                                            }
                                                        />
                                                    </Grid>
                                                    <Grid size={{ xs: 12 }}>
                                                        <Controller name='tags' control={control}
                                                            render={({ field }) =>
                                                                <TextField fullWidth size="small" label={t('request.tags')} {...field} />
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
                                <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 4 }}>
                                    {id ? (
                                        // Mode édition/visualisation d'une demande existante
                                        <>
                                            {isEditing ? (
                                                <>
                                                    <Button variant="outlined" color="primary" onClick={handleCancelEdit}>
                                                        {t('request.cancel')}
                                                    </Button>
                                                    <Button
                                                        type="submit"
                                                        variant="contained"
                                                        startIcon={<SaveIcon />}
                                                        sx={{
                                                            background: 'linear-gradient(90deg, #667eea 0%, #764ba2 100%)',
                                                            color: 'white',
                                                            fontWeight: 700,
                                                            boxShadow: '0 2px 8px rgba(118,75,162,0.15)',
                                                            borderRadius: 2,
                                                            px: 4,
                                                            '&:hover': {
                                                                background: 'linear-gradient(90deg, #5a67d8 0%, #6b46c1 100%)',
                                                            },
                                                        }}
                                                        disabled={isSubmitting || isLoading}
                                                    >
                                                        {t('request.save')}
                                                    </Button>
                                                </>
                                            ) : (
                                                <Button variant="outlined" color="primary" onClick={() => navigate(-1)}>
                                                    {t('request.back')}
                                                </Button>
                                            )}
                                        </>
                                    ) : (
                                        // Mode création d'une nouvelle demande
                                        <>
                                            <Button variant="outlined" color="primary" onClick={() => navigate(-1)}>
                                                {t('request.cancel')}
                                            </Button>
                                            <Button
                                                type="submit"
                                                variant="contained"
                                                startIcon={<SaveIcon />}
                                                sx={{
                                                    background: 'linear-gradient(90deg, #667eea 0%, #764ba2 100%)',
                                                    color: 'white',
                                                    fontWeight: 700,
                                                    boxShadow: '0 2px 8px rgba(118,75,162,0.15)',
                                                    borderRadius: 2,
                                                    px: 4,
                                                    '&:hover': {
                                                        background: 'linear-gradient(90deg, #5a67d8 0%, #6b46c1 100%)',
                                                    },
                                                }}
                                                disabled={isSubmitting || isLoading}
                                            >
                                                {t('request.createRequest')}
                                            </Button>
                                        </>
                                    )}
                                </Box>
                            </Slide>
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