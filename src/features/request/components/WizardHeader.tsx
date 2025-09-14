import React from 'react';
import { Box, Typography, Breadcrumbs, Link } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useWizardNavigation } from '@features/request/hooks/useWizardNavigation';

interface WizardHeaderProps {
  currentStep: number;
  totalSteps: number;
  onBack?: () => void;
  onNext?: () => void;
  canGoBack?: boolean;
  canGoNext?: boolean;
  title?: string;
  subtitle?: string;
}

export const WizardHeader: React.FC<WizardHeaderProps> = ({
  currentStep,
  totalSteps,
  onBack,
  onNext,
  canGoBack = true,
  canGoNext = true,
  title,
  subtitle
}) => {
  const { t } = useTranslation();
  const { steps, getStepInfo } = useWizardNavigation();

  const currentStepInfo = getStepInfo(currentStep);
  const stepTitle = title || currentStepInfo?.title || `Étape ${currentStep}`;
  const stepSubtitle = subtitle || t('wizard.stepDescription', { step: currentStep, total: totalSteps });

  const breadcrumbItems = steps.slice(0, currentStep).map((step, index) => ({
    label: step,
    step: index + 1,
    completed: true
  }));

  return (
    <Box sx={{ mb: 3 }}>
      {/* Breadcrumbs */}
      <Breadcrumbs aria-label="breadcrumb" sx={{ mb: 2 }}>
        {breadcrumbItems.map((item, index) => (
          <Link
            key={item.step}
            color={index === breadcrumbItems.length - 1 ? 'text.primary' : 'inherit'}
            underline="hover"
            sx={{ cursor: 'pointer' }}
            onClick={() => {
              // Navigation logic can be added here
            }}
          >
            {item.label}
          </Link>
        ))}
      </Breadcrumbs>

      {/* Main Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Box>
          <Typography variant="h4" component="h1" gutterBottom>
            {stepTitle}
          </Typography>
          {stepSubtitle && (
            <Typography variant="body1" color="text.secondary">
              {stepSubtitle}
            </Typography>
          )}
        </Box>

        {/* Step Indicator */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography variant="body2" color="text.secondary">
            {t('wizard.stepIndicator', { current: currentStep, total: totalSteps })}
          </Typography>
          <Box
            sx={{
              width: 60,
              height: 4,
              backgroundColor: 'grey.200',
              borderRadius: 2,
              overflow: 'hidden'
            }}
          >
            <Box
              sx={{
                width: `${(currentStep / totalSteps) * 100}%`,
                height: '100%',
                backgroundColor: 'primary.main',
                transition: 'width 0.3s ease'
              }}
            />
          </Box>
        </Box>
      </Box>

      {/* Progress Bar */}
      <Box sx={{ mt: 2 }}>
        <Box
          sx={{
            width: '100%',
            height: 4,
            backgroundColor: 'grey.200',
            borderRadius: 2,
            overflow: 'hidden'
          }}
        >
          <Box
            sx={{
              width: `${(currentStep / totalSteps) * 100}%`,
              height: '100%',
              backgroundColor: 'primary.main',
              transition: 'width 0.3s ease'
            }}
          />
        </Box>
      </Box>
    </Box>
  );
};
