import React, { useState } from 'react';
import { 
  Button, 
  Box, 
  Typography, 
  CircularProgress,
  Alert,
  Snackbar
} from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import { showSnackbar } from '@components/common/Snackbar';

interface ManualSaveButtonProps {
  draftQuote: any;
  draftId?: string | null;
  onSaveSuccess?: () => void;
  disabled?: boolean;
}

export const ManualSaveButton: React.FC<ManualSaveButtonProps> = ({
  draftQuote,
  draftId,
  onSaveSuccess,
  disabled = false
}) => {
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const handleManualSave = async () => {
    if (isSaving) return;
    
    setIsSaving(true);
    setSaveStatus('idle');
    setErrorMessage('');
    
    try {
      console.log('[MANUAL_SAVE] Début de la sauvegarde manuelle');
      console.log('[MANUAL_SAVE] draftQuote:', draftQuote);
      console.log('[MANUAL_SAVE] draftId:', draftId);
      
      // Validation des données avant sauvegarde
      const validationErrors = validateDraftQuote(draftQuote);
      if (validationErrors.length > 0) {
        throw new Error(`Données invalides: ${validationErrors.join(', ')}`);
      }
      
      // Préparer les données pour la sauvegarde
      const saveData = prepareDraftDataForSave(draftQuote);
      
      // Appel API pour sauvegarder en base de données
      if (draftId) {
        // Mise à jour d'un brouillon existant
        await updateDraftInDatabase(draftId, saveData);
      } else {
        // Création d'un nouveau brouillon
        const newDraftId = await createDraftInDatabase(saveData);
        console.log('[MANUAL_SAVE] Nouveau brouillon créé avec ID:', newDraftId);
      }
      
      setSaveStatus('success');
      showSnackbar('Brouillon sauvegardé avec succès en base de données', 'success');
      
      // Callback de succès
      if (onSaveSuccess) {
        onSaveSuccess();
      }
      
    } catch (error) {
      console.error('[MANUAL_SAVE] Erreur lors de la sauvegarde:', error);
      setSaveStatus('error');
      setErrorMessage(error instanceof Error ? error.message : 'Erreur inconnue');
      showSnackbar(`Erreur de sauvegarde: ${error instanceof Error ? error.message : 'Erreur inconnue'}`, 'warning');
    } finally {
      setIsSaving(false);
    }
  };

  // Validation des données du brouillon
  const validateDraftQuote = (draft: any): string[] => {
    const errors: string[] = [];
    
    // Validation de l'étape 1
    if (!draft.step1?.customer?.contactId) {
      errors.push('Client requis');
    }
    if (!draft.step1?.cityFrom?.name) {
      errors.push('Ville de départ requise');
    }
    if (!draft.step1?.cityTo?.name) {
      errors.push('Ville d\'arrivée requise');
    }
    
    // Validation de l'étape 2
    if (!draft.step2?.selected || draft.step2.selected.length === 0) {
      errors.push('Au moins un service requis');
    }
    
    // Validation de l'étape 3 - CORRIGÉE
    const step3Containers = draft.step3?.selectedContainers;
    const fallbackContainers = draft.selectedContainers;
    
    let hasValidContainers = false;
    let containerValidationErrors: string[] = [];
    
    // Vérifier les conteneurs dans step3
    if (step3Containers) {
      if (Array.isArray(step3Containers)) {
        // Structure: [container1, container2, ...]
        hasValidContainers = step3Containers.length > 0;
        containerValidationErrors = validateContainerArray(step3Containers);
      } else if (step3Containers.list && Array.isArray(step3Containers.list)) {
        // Structure: { list: [container1, container2, ...] }
        hasValidContainers = step3Containers.list.length > 0;
        containerValidationErrors = validateContainerArray(step3Containers.list);
      } else if (typeof step3Containers === 'object') {
        // Structure: { serviceId: [containers], ... }
        const allContainers = Object.values(step3Containers).flat();
        hasValidContainers = allContainers.length > 0;
        containerValidationErrors = validateContainerArray(allContainers);
      }
    }
    
    // Fallback vers selectedContainers si step3 est vide
    if (!hasValidContainers && fallbackContainers) {
      if (Array.isArray(fallbackContainers)) {
        hasValidContainers = fallbackContainers.length > 0;
        containerValidationErrors = validateContainerArray(fallbackContainers);
      } else if (typeof fallbackContainers === 'object') {
        const allContainers = Object.values(fallbackContainers).flat();
        hasValidContainers = allContainers.length > 0;
        containerValidationErrors = validateContainerArray(allContainers);
      }
    }
    
    if (!hasValidContainers) {
      errors.push('Aucun conteneur trouvé dans l\'étape 3');
    } else if (containerValidationErrors.length > 0) {
      errors.push(...containerValidationErrors);
    }
    
    return errors;
  };

  // Validation spécifique des conteneurs
  const validateContainerArray = (containers: any[]): string[] => {
    const errors: string[] = [];
    
    containers.forEach((container, index) => {
      // Vérifier que le conteneur a un type valide
      const containerType = container.type || container.containerType || container.Type;
      if (!containerType || containerType.trim() === '') {
        errors.push(`Type de conteneur requis pour le conteneur ${index + 1}`);
      }
      
      // Vérifier la quantité
      const quantity = container.quantity || container.Quantity;
      if (quantity === undefined || quantity === null || quantity < 0) {
        errors.push(`Quantité invalide pour le conteneur ${index + 1}`);
      }
      
      // Vérifier le TEU
      const teu = container.teu || container.Teu;
      if (teu === undefined || teu === null || teu < 0) {
        errors.push(`TEU invalide pour le conteneur ${index + 1}`);
      }
    });
    
    return errors;
  };

  // Préparer les données pour la sauvegarde
  const prepareDraftDataForSave = (draft: any) => {
    return {
      step1: draft.step1,
      step2: draft.step2,
      step3: draft.step3,
      selectedHaulage: draft.selectedHaulage,
      selectedSeafreights: draft.selectedSeafreights,
      selectedMiscellaneous: draft.selectedMiscellaneous,
      selectedContainers: draft.selectedContainers,
      marginType: draft.marginType,
      marginValue: draft.marginValue,
      totalPrice: draft.totalPrice,
      haulageTotal: draft.haulageTotal,
      seafreightTotal: draft.seafreightTotal,
      miscTotal: draft.miscTotal,
      totalTEU: draft.totalTEU,
      metadata: {
        lastSaved: new Date().toISOString(),
        version: '1.0',
        saveType: 'manual'
      }
    };
  };

  // Mise à jour d'un brouillon existant
  const updateDraftInDatabase = async (draftId: string, data: any) => {
    // Ici, vous appelleriez votre API de mise à jour
    // const response = await updateDraft({ path: { id: draftId }, body: { draftData: data } });
    
    // Simulation pour l'exemple
    await new Promise(resolve => setTimeout(resolve, 1000));
    console.log('[MANUAL_SAVE] Brouillon mis à jour en base:', draftId);
  };

  // Création d'un nouveau brouillon
  const createDraftInDatabase = async (data: any): Promise<string> => {
    // Ici, vous appelleriez votre API de création
    // const response = await createDraft({ body: { draftData: data } });
    
    // Simulation pour l'exemple
    await new Promise(resolve => setTimeout(resolve, 1000));
    const newId = `draft_${Date.now()}`;
    console.log('[MANUAL_SAVE] Nouveau brouillon créé en base:', newId);
    return newId;
  };

  return (
    <Box>
      <Button
        variant="contained"
        color="primary"
        startIcon={isSaving ? <CircularProgress size={20} /> : <SaveIcon />}
        onClick={handleManualSave}
        disabled={disabled || isSaving}
        sx={{
          minWidth: 200,
          height: 48,
          fontSize: '1.1rem',
          fontWeight: 'bold',
          boxShadow: 3,
          '&:hover': {
            boxShadow: 6,
            transform: 'translateY(-2px)',
            transition: 'all 0.3s ease'
          }
        }}
      >
        {isSaving ? 'Sauvegarde...' : '💾 Sauvegarder en Base'}
      </Button>

      {/* Indicateur de statut */}
      {saveStatus === 'success' && (
        <Alert severity="success" sx={{ mt: 2 }}>
          ✅ Brouillon sauvegardé avec succès en base de données
        </Alert>
      )}

      {saveStatus === 'error' && (
        <Alert severity="error" sx={{ mt: 2 }}>
          ❌ Erreur de sauvegarde: {errorMessage}
        </Alert>
      )}

      {/* Informations de debug */}
      <Box sx={{ mt: 2, p: 2, bgcolor: '#f5f5f5', borderRadius: 1 }}>
        <Typography variant="caption" display="block">
          <strong>Statut:</strong> {draftId ? `Brouillon existant (ID: ${draftId})` : 'Nouveau brouillon'}
        </Typography>
        <Typography variant="caption" display="block">
          <strong>Étapes complétées:</strong> {
            [
              draftQuote.step1 ? '1' : '',
              draftQuote.step2 ? '2' : '',
              draftQuote.step3 ? '3' : '',
              draftQuote.selectedHaulage ? '4' : '',
              draftQuote.selectedSeafreights ? '5' : '',
              draftQuote.selectedMiscellaneous ? '6' : ''
            ].filter(Boolean).join(', ') || 'Aucune'
          }
        </Typography>
      </Box>
    </Box>
  );
};

export default ManualSaveButton;
