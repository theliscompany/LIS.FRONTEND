/**
 * Étape 7 du wizard : Gestion des options
 * Intégration du gestionnaire d'options dans le flux du wizard
 */

import React, { useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Box,
  Typography,
  Paper,
  Button,
  Grid,
  Alert,
  CircularProgress,
  Fade,
  Slide,
  Stepper,
  Step,
  StepLabel,
  Divider,
  Card,
  CardContent,
  CardHeader,
  Avatar,
  Chip,
  Stack
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  ArrowForward as ArrowForwardIcon,
  Assessment as AssessmentIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Info as InfoIcon,
  Euro as EuroIcon,
  Timeline as TimelineIcon
} from '@mui/icons-material';
import OptionsManager from './OptionsManager';
import type { DraftQuote } from '../types/DraftQuote';

interface Step7OptionsManagerProps {
  draftQuote: DraftQuote;
  onDraftUpdate: (updatedDraft: DraftQuote) => void;
  onBack: () => void;
  onNext: () => void;
  onQuoteCreation?: (quoteData: any) => Promise<void>;
}

const Step7OptionsManager: React.FC<Step7OptionsManagerProps> = ({
  draftQuote,
  onDraftUpdate,
  onBack,
  onNext,
  onQuoteCreation
}) => {
  const { t } = useTranslation();
  const [isValidating, setIsValidating] = useState(false);

  // ✅ VALIDATION DES DONNÉES REQUISES
  const validateWizardData = useCallback(() => {
    const errors: string[] = [];
    
    // Vérifier que les étapes essentielles sont complétées
    if (!draftQuote.step1) {
      errors.push('Les informations de base (Step 1) sont requises');
    }
    
    if (!draftQuote.step3?.containers || draftQuote.step3.containers.length === 0) {
      errors.push('Au moins un conteneur doit être configuré (Step 3)');
    }
    
    if (!draftQuote.step4?.selection) {
      errors.push('Une sélection de haulage est requise (Step 4)');
    }
    
    if (!draftQuote.step5?.selections || draftQuote.step5.selections.length === 0) {
      errors.push('Au moins une sélection de seafreight est requise (Step 5)');
    }
    
    return errors;
  }, [draftQuote]);

  // ✅ GESTION DE LA CRÉATION DE DEVIS
  const handleQuoteCreation = useCallback(async (quoteData: any) => {
    try {
      setIsValidating(true);
      
      if (onQuoteCreation) {
        await onQuoteCreation(quoteData);
      }
      
      // Optionnel : passer à l'étape suivante après création
      // onNext();
    } catch (error) {
      console.error('Erreur lors de la création du devis:', error);
    } finally {
      setIsValidating(false);
    }
  }, [onQuoteCreation]);

  // ✅ RENDU DU RÉSUMÉ DU WIZARD
  const renderWizardSummary = useCallback(() => (
    <Card sx={{ mb: 3, bgcolor: 'grey.50' }}>
      <CardHeader
        avatar={
          <Avatar sx={{ bgcolor: 'primary.main' }}>
            <AssessmentIcon />
          </Avatar>
        }
        title="Résumé de la demande"
        subheader="Vérifiez les informations avant de créer vos options"
      />
      <CardContent>
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle2" color="text.secondary">
                Informations de base
              </Typography>
              <Typography variant="body2">
                {draftQuote.customer?.companyName || 'Non spécifié'} - {draftQuote.shipment?.origin?.name || 'Non spécifié'} → {draftQuote.shipment?.destination?.name || 'Non spécifié'}
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={12} md={6}>
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle2" color="text.secondary">
                Conteneurs
              </Typography>
              <Typography variant="body2">
                {draftQuote.step3?.containers?.length || 0} conteneur(s) configuré(s)
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={12} md={6}>
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle2" color="text.secondary">
                Haulage
              </Typography>
              <Typography variant="body2">
                {draftQuote.step4?.selection ? 'Sélectionné' : 'Non sélectionné'}
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={12} md={6}>
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle2" color="text.secondary">
                Seafreight
              </Typography>
              <Typography variant="body2">
                {draftQuote.step5?.selections?.length || 0} sélection(s)
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  ), [draftQuote]);

  // ✅ RENDU DES ÉTAPES DU WIZARD
  const renderWizardSteps = useCallback(() => (
    <Card sx={{ mb: 3 }}>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Progression du wizard
        </Typography>
        <Stepper activeStep={6} alternativeLabel>
          <Step>
            <StepLabel>1. Informations</StepLabel>
          </Step>
          <Step>
            <StepLabel>2. Services & Conteneurs</StepLabel>
          </Step>
          <Step>
            <StepLabel>3. Seafreight</StepLabel>
          </Step>
          <Step>
            <StepLabel>4. Haulage</StepLabel>
          </Step>
          <Step>
            <StepLabel>5. Miscellaneous</StepLabel>
          </Step>
          <Step>
            <StepLabel>6. Récapitulatif</StepLabel>
          </Step>
          <Step>
            <StepLabel>7. Options</StepLabel>
          </Step>
        </Stepper>
      </CardContent>
    </Card>
  ), []);

  const validationErrors = validateWizardData();
  const hasValidationErrors = validationErrors.length > 0;

  return (
    <Box sx={{ 
      background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
      minHeight: '100vh',
      p: 3
    }}>
      <Fade in timeout={800}>
        <Box>
          {/* Header */}
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
              Gestion des options
            </Typography>
            <Typography variant="h6" sx={{ opacity: 0.9 }}>
              Créez et gérez les options de devis pour cette demande
            </Typography>
          </Box>

          {/* Progression du wizard */}
          <Slide direction="up" in timeout={1000}>
            {renderWizardSteps()}
          </Slide>

          {/* Résumé de la demande */}
          <Slide direction="up" in timeout={1200}>
            {renderWizardSummary()}
          </Slide>

          {/* Validation des erreurs */}
          {hasValidationErrors && (
            <Slide direction="up" in timeout={1400}>
              <Alert severity="error" sx={{ mb: 3 }}>
                <Typography variant="subtitle2" gutterBottom>
                  Des informations sont manquantes pour créer des options :
                </Typography>
                <ul>
                  {validationErrors.map((error, index) => (
                    <li key={index}>{error}</li>
                  ))}
                </ul>
              </Alert>
            </Slide>
          )}

          {/* Gestionnaire d'options */}
          <Slide direction="up" in timeout={1600}>
            <Paper sx={{ 
              borderRadius: 3,
              boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
              background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)'
            }}>
              <OptionsManager
                draftQuote={draftQuote}
                onDraftUpdate={onDraftUpdate}
                onQuoteCreation={handleQuoteCreation}
              />
            </Paper>
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
            
            <Stack direction="row" spacing={2}>
              {isValidating && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <CircularProgress size={20} />
                  <Typography variant="body2">Création du devis...</Typography>
                </Box>
              )}
              
              <Button
                variant="contained"
                onClick={onNext}
                endIcon={<ArrowForwardIcon />}
                disabled={hasValidationErrors || isValidating}
                sx={{
                  borderRadius: 2,
                  px: 4,
                  py: 1.5,
                  fontWeight: 600,
                  textTransform: 'none',
                  fontSize: '1rem',
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)',
                  }
                }}
              >
                {hasValidationErrors ? 'Compléter les étapes' : 'Terminer'}
              </Button>
            </Stack>
          </Box>
        </Box>
      </Fade>
    </Box>
  );
};

export default Step7OptionsManager;
