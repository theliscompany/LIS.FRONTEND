import React, { useCallback, useMemo, useState, useEffect } from 'react';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import { useSnackbar } from 'notistack';
import { useAccount, useMsal } from '@azure/msal-react';
import { CircularProgress, Box, Typography } from '@mui/material';

import { WizardEngine } from './WizardEngine';
import { DraftQuoteForm, defaultDraftQuoteForm } from './schema';
import { adaptRequestToWizardForm, validateRequestData } from './adapters/requestToWizardAdapter';
import { adaptDraftToWizardForm, validateDraftData } from './adapters/draftToWizardAdapter';
import { getApiRequestById } from '../api/sdk.gen';
import { getApiDraftQuotesById } from '@features/offer/api/sdk.gen';
import { RequestQuoteResponseViewModel } from '../api/types.gen';
import { useDraftQuoteSave } from './hooks/useDraftQuoteSave';

export const NewRequestWizard: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const params = useParams();
  const { enqueueSnackbar } = useSnackbar();

  // State pour les données de la demande ou du brouillon
  const [requestData, setRequestData] = useState<RequestQuoteResponseViewModel | null>(null);
  const [draftData, setDraftData] = useState<any | null>(null); // Utiliser any pour éviter les problèmes de type
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Log quand draftData change
  useEffect(() => {
    console.log('[WIZARD] draftData a changé:', {
      hasDraftData: !!draftData,
      draftId: draftData?.draftQuoteId || draftData?.id,
      customer: draftData?.customer?.name
    });
  }, [draftData]);

  // Recuperation de l utilisateur connecte
  const { accounts } = useMsal();
  const account = useAccount(accounts[0] || {});
  const currentUserEmail = account?.username || 'user@example.com';

  // Récupérer l'ID de la demande ou du brouillon depuis les paramètres ou l'état
  const requestId = params.id || location.state?.requestId;
  
  // Extraire le draftId depuis les paramètres ou l'URL
  let draftId = params.draftId || location.state?.draftId;
  
  // Fallback: extraire le draftId depuis l'URL si pas trouvé dans les paramètres
  if (!draftId && location.pathname.includes('/draft/')) {
    const urlParts = location.pathname.split('/');
    const draftIndex = urlParts.indexOf('draft');
    if (draftIndex !== -1 && urlParts[draftIndex + 1]) {
      draftId = urlParts[draftIndex + 1];
      console.log('[NewRequestWizard] DraftId extrait depuis l\'URL:', draftId);
    }
  }
  
  // Debug: Afficher les paramètres reçus
  console.log('[NewRequestWizard] Paramètres:', { params, locationState: location.state });
  console.log('[NewRequestWizard] URL complète:', location.pathname);
  console.log('[NewRequestWizard] Search params:', location.search);
  console.log('[NewRequestWizard] RequestId détecté:', requestId);
  console.log('[NewRequestWizard] DraftId détecté:', draftId);
  console.log('[NewRequestWizard] Tous les paramètres:', Object.keys(params));
  
  // Déterminer si on est en mode readonly
  // Mode readonly si on a un ID de demande, des données existantes, ou un brouillon chargé
  const isReadonly = !!requestId || !!location.state?.requestData || !!draftId;
  console.log('[NewRequestWizard] Mode readonly:', isReadonly, { requestId, hasRequestData: !!location.state?.requestData, draftId });

  // Hook pour la sauvegarde des brouillons
  const { saveDraftWithOptions } = useDraftQuoteSave({
    requestQuoteId: requestId || '',
    draftId: draftId || undefined, // Utiliser le draftId actuel
    onSuccess: (savedDraftId) => {
      console.log('✅ [NewRequestWizard] Brouillon sauvegardé avec ID:', savedDraftId);
    },
    onError: (error) => {
      console.error('❌ [NewRequestWizard] Erreur lors de la sauvegarde:', error);
      enqueueSnackbar('Erreur lors de la sauvegarde du brouillon', { variant: 'error' });
    }
  });

  // Charger les données de la demande ou du brouillon
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // Priorité 1: Charger un brouillon existant
        if (draftId) {
          console.log('🔄 [WIZARD] === CHARGEMENT DU BROUILLON ===');
          console.log('📡 [WIZARD] Appel API: getApiDraftQuotesById');
          console.log('🆔 [WIZARD] DraftId:', draftId);
          
          const response = await getApiDraftQuotesById({ path: { id: draftId } });
          
          if (response.data) {
            console.log('✅ [WIZARD] Données de brouillon reçues de l\'API');
            console.log('📦 [WIZARD] Structure complète des données:', JSON.stringify(response.data, null, 2));
            console.log('📦 [WIZARD] Structure des données (résumé):', {
              draftQuoteId: (response.data as any).draftQuoteId,
              customer: (response.data as any).customer?.name,
              origin: (response.data as any).shipment?.origin?.location,
              destination: (response.data as any).shipment?.destination?.location,
              optionsCount: (response.data as any).options?.length || 0,
              options: (response.data as any).options,
              // Ajouter d'autres champs pour debug
              hasCustomer: !!(response.data as any).customer,
              hasShipment: !!(response.data as any).shipment,
              hasOptions: !!(response.data as any).options,
              allKeys: Object.keys(response.data)
            });
            
            // L'API retourne response.data avec les données du brouillon directement
            console.log('🔍 [WIZARD] Structure complète de l\'API:', response.data);
            console.log('🔍 [WIZARD] Données du brouillon dans response.data:', response.data);
            
            // Extraire les données du brouillon depuis response.data
            const draftData = response.data as any;
            console.log('🔍 [WIZARD] Données du brouillon extraites:', {
              draftQuoteId: draftData.draftQuoteId,
              customer: draftData.customer?.name,
              origin: draftData.shipment?.origin,
              destination: draftData.shipment?.destination
            });
            
            const validation = validateDraftData(draftData);
            console.log('🔍 [WIZARD] Résultat a valider:', draftData);
            console.log('🔍 [WIZARD] Résultat de la validation:', validation);
            
            if (validation.isValid && validation.draftData) {
              console.log('✅ [WIZARD] Validation des données réussie');
              setDraftData(validation.draftData);
            } else {
              console.error('❌ [WIZARD] Validation des données échouée:', validation.errors);
              console.error('❌ [WIZARD] Données reçues:', draftData);
              throw new Error(`Données de brouillon invalides: ${validation.errors.join(', ')}`);
            }
          } else {
            console.error('❌ [WIZARD] Aucune donnée reçue de l\'API');
            throw new Error('Aucune donnée de brouillon reçue de l\'API');
          }
        }
        // Priorité 2: Charger une demande existante
        else if (requestId) {
          console.log('[WIZARD] Chargement des données de la demande:', requestId);
          const response = await getApiRequestById({ path: { id: requestId } });
          
          if (response.data) {
            console.log('[WIZARD] Données de demande chargées:', response.data);
            console.log('[WIZARD] Informations client:', {
              companyName: response.data.companyName,
              contactFullName: response.data.contactFullName,
              email: response.data.email,
              phone: response.data.phone
            });
            console.log('[WIZARD] Informations assigné:', {
              assigneeDisplayName: response.data.assigneeDisplayName,
              assigneeId: response.data.assigneeId
            });
            setRequestData(response.data);
          } else {
            throw new Error('Aucune donnée reçue de l\'API');
          }
        }
      } catch (err) {
        console.error('[WIZARD] Erreur lors du chargement:', err);
        setError(err instanceof Error ? err.message : 'Erreur inconnue');
        enqueueSnackbar('Erreur lors du chargement des données', { variant: 'error' });
      } finally {
        setLoading(false);
      }
    };

    if (draftId || requestId) {
      loadData();
    }
  }, [draftId, requestId, enqueueSnackbar]);

  // Get initial values from loaded data or location state
  const initialValues = useMemo(() => {
    console.log('[WIZARD] === CALCUL DES VALEURS INITIALES ===');
    console.log('[WIZARD] État actuel:', {
      hasDraftData: !!draftData,
      hasRequestData: !!requestData,
      hasLocationState: !!location.state?.requestData,
      hasLocationDraftState: !!location.state?.draftData
    });
    
    // Priorité 1: Si on a des données de brouillon chargées depuis l'API
    if (draftData) {
      console.log('[WIZARD] Adaptation des données de brouillon:', draftData);
      const adaptedForm = adaptDraftToWizardForm(draftData, currentUserEmail);
      console.log('[WIZARD] Formulaire adapté depuis le brouillon:', adaptedForm);
      console.log('🔍 [WIZARD] Options adaptées:', adaptedForm.existingOptions);
      console.log('🔍 [WIZARD] Nombre d\'options adaptées:', adaptedForm.existingOptions?.length || 0);
      return adaptedForm;
    }

    // Priorité 2: Si on a des données de demande chargées depuis l'API
    if (requestData) {
      console.log('[WIZARD] Adaptation des données API:', requestData);
      const adaptedForm = adaptRequestToWizardForm(requestData, currentUserEmail);
      console.log('[WIZARD] Formulaire adapté depuis l\'API:', adaptedForm);
      return adaptedForm;
    }

    // Priorité 3: Si on a des donnees de requete existante dans l'état (fallback)
    if (location.state?.requestData) {
      console.log('[WIZARD] Donnees de requete recues depuis l\'état:', location.state.requestData);
      const validation = validateRequestData(location.state.requestData);

      if (validation.isValid && validation.requestData) {
        const adaptedForm = adaptRequestToWizardForm(validation.requestData, currentUserEmail);
        console.log('[WIZARD] Formulaire adapte depuis la requete:', adaptedForm);
        return adaptedForm;
      } else {
        console.warn('[WIZARD] Donnees de requete invalides:', validation.errors);
        enqueueSnackbar(`Donnees de requete invalides: ${validation.errors.join(', ')}`, { variant: 'warning' });
      }
    }

    // Priorité 4: Si on a des données de brouillon dans l'état (fallback)
    if (location.state?.draftData) {
      console.log('[WIZARD] Donnees de brouillon recues depuis l\'état:', location.state.draftData);
      const validation = validateDraftData(location.state.draftData);

      if (validation.isValid && validation.draftData) {
        const adaptedForm = adaptDraftToWizardForm(validation.draftData, currentUserEmail);
        console.log('[WIZARD] Formulaire adapte depuis le brouillon:', adaptedForm);
        return adaptedForm;
      } else {
        console.warn('[WIZARD] Donnees de brouillon invalides:', validation.errors);
        enqueueSnackbar(`Donnees de brouillon invalides: ${validation.errors.join(', ')}`, { variant: 'warning' });
      }
    }

    // Priorité 5: Si on a des valeurs par defaut explicites
    if (location.state?.defaultValues) {
      return location.state.defaultValues;
    }

    // Sinon, utiliser les valeurs par defaut
    return defaultDraftQuoteForm;
  }, [draftData, requestData, location.state, currentUserEmail, enqueueSnackbar]);

  // Déterminer les données à passer au wizard
  const wizardRequestData = requestData || location.state?.requestData;
  // Plus besoin de wizardDraftData car on utilise draftData directement depuis l'API
  
  // Extraire l'étape initiale depuis l'état ou l'URL
  let initialStep = location.state?.initialStep || 'basics';
  
  // Fallback: extraire l'étape depuis l'URL si pas trouvée dans l'état
  if (location.pathname.includes('/draft/')) {
    const urlParts = location.pathname.split('/');
    const draftIndex = urlParts.indexOf('draft');
    if (draftIndex !== -1 && urlParts[draftIndex + 2]) {
      initialStep = urlParts[draftIndex + 2];
      console.log('[NewRequestWizard] Étape extraite depuis l\'URL:', initialStep);
    }
  }

  // Auto-save handler - uses the new save system
  const handleAutoSave = useCallback(async (formData: DraftQuoteForm) => {
    try {
      console.log('🔄 [NewRequestWizard] Auto-save triggered');
      console.log('🆔 [NewRequestWizard] DraftId pour auto-save:', draftId);
      const savedDraftId = await saveDraftWithOptions(formData, draftId || undefined);
      console.log('✅ [NewRequestWizard] Auto-save completed with ID:', savedDraftId);
    } catch (error) {
      console.error('❌ [NewRequestWizard] Auto-save failed:', error);
      throw error;
    }
  }, [saveDraftWithOptions, draftId]);

  // Submit handler - uses the new save system
  const handleSubmit = useCallback(async (formData: DraftQuoteForm) => {
    try {
      console.log('🔄 [NewRequestWizard] Submit triggered');
      console.log('🆔 [NewRequestWizard] DraftId pour submit:', draftId);
      const savedDraftId = await saveDraftWithOptions(formData, draftId || undefined);
      console.log('✅ [NewRequestWizard] Submit completed with ID:', savedDraftId);
      
      enqueueSnackbar('Brouillon sauvegardé avec succès', { variant: 'success' });
      navigate(`/draft-quotes/${savedDraftId}`);
    } catch (error) {
      console.error('❌ [NewRequestWizard] Submit failed:', error);
      enqueueSnackbar('Erreur lors de la sauvegarde du brouillon', { variant: 'error' });
    }
  }, [saveDraftWithOptions, draftId, navigate, enqueueSnackbar]);

  // Step change handler
  const handleStepChange = useCallback((step: string) => {
    // Update URL to reflect current step
    const newUrl = draftId ? `/request-wizard/draft/${draftId}/${step}` : 
                   requestId ? `/request-wizard/${requestId}/${step}` : 
                   `/request-wizard/${step}`;
    navigate(newUrl, { replace: true });
  }, [draftId, requestId, navigate]);

  // Affichage du loading
  if (loading) {
    return (
      <Box sx={{ 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        justifyContent: 'center', 
        height: '50vh',
        gap: 2
      }}>
        <CircularProgress size={60} />
        <Typography variant="h6" color="text.secondary">
          Chargement des données de la demande...
        </Typography>
      </Box>
    );
  }

  // Affichage de l'erreur
  if (error) {
    return (
      <Box sx={{ 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        justifyContent: 'center', 
        height: '50vh',
        gap: 2,
        p: 3
      }}>
        <Typography variant="h6" color="error">
          Erreur lors du chargement
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center' }}>
          {error}
        </Typography>
      </Box>
    );
  }

  return (
    <WizardEngine
      defaultValues={initialValues}
      onAutoSave={handleAutoSave}
      onSubmit={handleSubmit}
      initialStep={initialStep}
      onStepChange={handleStepChange}
      requestData={wizardRequestData}
      draftData={draftData} // Utiliser directement draftData depuis l'API
      readonly={isReadonly} // Mode readonly si on a un ID de demande ou des données existantes
      requestQuoteId={requestId || ''} // Passer l'ID de la demande pour la sauvegarde
      draftId={draftId || ''} // Passer l'ID du brouillon pour la sauvegarde
    />
  );
};

export default NewRequestWizard;