import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  IconButton,
  Dialog,
  DialogContent,
  DialogActions,
  Chip,
  Stack
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import NavigateBeforeIcon from '@mui/icons-material/NavigateBefore';
import { OnboardingStep } from '../hooks/useOnboarding';

interface OnboardingOverlayProps {
  steps: OnboardingStep[];
  isOpen: boolean;
  onClose: () => void;
  onComplete: () => void;
  onSkip: () => void;
  theme?: {
    primary?: string;
    secondary?: string;
    borderRadius?: string;
    fontFamily?: string;
  };
}

const OnboardingOverlay: React.FC<OnboardingOverlayProps> = ({
  steps,
  isOpen,
  onClose,
  onComplete,
  onSkip,
  theme = {}
}) => {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [targetElement, setTargetElement] = useState<HTMLElement | null>(null);

  const currentStep = steps[currentStepIndex];

  useEffect(() => {
    if (isOpen && currentStep) {
      const element = document.querySelector(currentStep.target) as HTMLElement;
      setTargetElement(element);
      
      if (element) {
        // Scroll vers l'élément
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        
        // Mise en évidence visuelle
        element.style.zIndex = '1000';
        element.style.position = 'relative';
        element.style.boxShadow = '0 0 0 3px rgba(25, 118, 210, 0.3)';
        element.style.borderRadius = '4px';
        element.style.transition = 'box-shadow 0.3s ease';
        
        // Animation de pulsation
        const pulseAnimation = () => {
          element.style.boxShadow = '0 0 0 3px rgba(25, 118, 210, 0.6)';
          setTimeout(() => {
            element.style.boxShadow = '0 0 0 3px rgba(25, 118, 210, 0.3)';
          }, 500);
        };
        
        // Pulsation toutes les 2 secondes
        const pulseInterval = setInterval(pulseAnimation, 2000);
        pulseAnimation(); // Première pulsation immédiate
        
        // Focus sur l'élément si c'est un input
        if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA' || element.tagName === 'SELECT') {
          element.focus();
        }
        
        // Focus sur le premier input enfant si l'élément est un conteneur
        const inputChild = element.querySelector('input, textarea, select') as HTMLElement;
        if (inputChild) {
          inputChild.focus();
        }
        
        // Nettoyage au démontage
        return () => {
          clearInterval(pulseInterval);
          element.style.zIndex = '';
          element.style.position = '';
          element.style.boxShadow = '';
          element.style.borderRadius = '';
          element.style.transition = '';
        };
      }
    }
  }, [isOpen, currentStep]);

  const handleNext = () => {
    if (currentStepIndex < steps.length - 1) {
      setCurrentStepIndex(currentStepIndex + 1);
    } else {
      onComplete();
    }
  };

  const handlePrevious = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(currentStepIndex - 1);
    }
  };

  const handleSkip = () => {
    console.log('[OnboardingOverlay] Skip clicked');
    // Nettoyer les styles avant de fermer
    if (targetElement) {
      targetElement.style.zIndex = '';
      targetElement.style.position = '';
      targetElement.style.boxShadow = '';
      targetElement.style.borderRadius = '';
      targetElement.style.transition = '';
    }
    onSkip();
    // Force un re-render immédiat
    setCurrentStepIndex(0);
  };

  const handleClose = () => {
    console.log('[OnboardingOverlay] Close clicked');
    // Nettoyer les styles avant de fermer
    if (targetElement) {
      targetElement.style.zIndex = '';
      targetElement.style.position = '';
      targetElement.style.boxShadow = '';
      targetElement.style.borderRadius = '';
      targetElement.style.transition = '';
    }
    onClose();
    // Force un re-render immédiat
    setCurrentStepIndex(0);
  };

  console.log('[OnboardingOverlay] Render check:', { isOpen, currentStep, stepsLength: steps.length });
  
  // Test simple - toujours afficher si isOpen est true
  if (!isOpen) return null;
  
  // Si pas de currentStep, créer un step de test
  const testStep = currentStep || {
    id: 'test',
    title: 'Test Onboarding',
    content: 'Ceci est un test de l\'onboarding',
    target: '#test',
    position: 'bottom' as const
  };

  return (
    <>
      {/* Overlay sombre */}
      <Box
        sx={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          zIndex: 9999,
        }}
        onClick={handleClose}
      />

      {/* Tooltip d'onboarding */}
      <Box
        sx={{
          position: 'fixed',
          zIndex: 10000,
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
        }}
      >
        <Paper
          elevation={8}
          sx={{
            p: 3,
            maxWidth: 400,
            borderRadius: theme.borderRadius || '12px',
            background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
            border: `2px solid ${theme.primary || '#1976d2'}`,
            position: 'relative',
          }}
        >
          {/* En-tête */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Stack direction="row" spacing={1} alignItems="center">
              <Chip
                label={`${currentStepIndex + 1}/${steps.length}`}
                size="small"
                color="primary"
                variant="outlined"
              />
                        <Typography variant="h6" sx={{ fontWeight: 600, color: theme.primary || '#1976d2' }}>
            {testStep.title}
          </Typography>
            </Stack>
            <IconButton size="small" onClick={handleClose}>
              <CloseIcon />
            </IconButton>
          </Box>

          {/* Contenu */}
          <Typography variant="body1" sx={{ mb: 3, lineHeight: 1.6, color: '#2c3e50' }}>
            {testStep.content}
          </Typography>

          {/* Actions */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Button
              variant="text"
              onClick={handleSkip}
              sx={{ color: '#6c757d' }}
            >
              Ignorer
            </Button>

            <Box sx={{ display: 'flex', gap: 1 }}>
              {currentStepIndex > 0 && (
                <Button
                  variant="outlined"
                  onClick={handlePrevious}
                  startIcon={<NavigateBeforeIcon />}
                >
                  Précédent
                </Button>
              )}
              
              <Button
                variant="contained"
                onClick={handleNext}
                endIcon={currentStepIndex < steps.length - 1 ? <NavigateNextIcon /> : undefined}
                sx={{
                  backgroundColor: theme.primary || '#1976d2',
                  '&:hover': {
                    backgroundColor: theme.primary || '#1565c0',
                  },
                }}
              >
                {currentStepIndex < steps.length - 1 ? 'Suivant' : 'Terminer'}
              </Button>
            </Box>
          </Box>

          {/* Indicateur de progression */}
          <Box sx={{ mt: 2 }}>
            <Box
              sx={{
                width: '100%',
                height: 4,
                backgroundColor: '#e9ecef',
                borderRadius: 2,
                overflow: 'hidden',
              }}
            >
              <Box
                sx={{
                  width: `${((currentStepIndex + 1) / steps.length) * 100}%`,
                  height: '100%',
                  backgroundColor: theme.primary || '#1976d2',
                  transition: 'width 0.3s ease',
                }}
              />
            </Box>
          </Box>
        </Paper>
      </Box>
    </>
  );
};

export default OnboardingOverlay; 