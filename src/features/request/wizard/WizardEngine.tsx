import React, { useEffect, useCallback, useState } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { 
  Box, 
  Stepper, 
  Step, 
  StepLabel, 
  Paper, 
  Container,
  Typography,
  useTheme,
  alpha,
  LinearProgress
} from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';

import { DraftQuoteFormSchema, DraftQuoteForm, QuoteOption, calculateTotalWithMargin } from './schema';
import { wizardSteps, type WizardStepId } from './wizard.config';
import { StepRouter } from './StepRouter';
import { LivePreview } from './LivePreview';
// useDebounce removed - auto-save disabled
import { useDraftQuoteSave } from './hooks/useDraftQuoteSave';
import { useDraftQuoteOptionTypes } from '@features/offer/hooks/useDraftQuoteOptionTypes';

interface WizardEngineProps {
  defaultValues: DraftQuoteForm;
  onAutoSave: (data: DraftQuoteForm) => Promise<void>; // Kept for compatibility but not used
  onSubmit: (data: DraftQuoteForm) => Promise<void>;
  initialStep?: string;
  onStepChange?: (step: string) => void;
  requestData?: any;
  draftData?: any; // Kept for compatibility but not used
  readonly?: boolean;
  requestQuoteId?: string;
  draftId?: string;
  isFinalizing?: boolean;
  onQuoteCreated?: () => void; // Callback pour rafraîchir la liste des devis
}

export const WizardEngine: React.FC<WizardEngineProps> = ({
  defaultValues,
  onAutoSave,
  onSubmit,
  initialStep = 'basics',
  onStepChange,
  requestData,
  draftData,
  readonly = false,
  requestQuoteId = '',
  draftId = '',
  isFinalizing = false,
  onQuoteCreated
}) => {
  const theme = useTheme();
  const [currentStep, setCurrentStep] = useState<WizardStepId>(initialStep as WizardStepId);
  // Auto-save disabled
  const [progress, setProgress] = useState(0);
  const [preferredOptionId, setPreferredOptionId] = useState<string | undefined>();
  // Auto-save timeout ref removed
  const [currentDraftId, setCurrentDraftId] = useState<string | null>(draftId || null);

  // Hook pour la sauvegarde du brouillon
  const { saveDraft, saveDraftWithOptions, isSaving: isDraftSaving, lastSaved: lastDraftSaved } = useDraftQuoteSave({
    requestQuoteId,
    draftId: currentDraftId || undefined, // Utiliser l'ID du brouillon existant si disponible
    onSuccess: (savedDraftId) => {
      setCurrentDraftId(savedDraftId);
      console.log('✅ [WIZARD] Brouillon sauvegardé avec ID:', savedDraftId);
    },
    onError: (error) => {
      console.error('❌ [WIZARD] Erreur lors de la sauvegarde du brouillon:', error);
    }
  });

  // Hook pour récupérer les types d'options disponibles
  const { data: optionTypesData, isLoading: isLoadingOptionTypes } = useDraftQuoteOptionTypes();

  const form = useForm<DraftQuoteForm>({
    resolver: zodResolver(DraftQuoteFormSchema),
    defaultValues,
    mode: 'onChange'
  });

  const { watch, formState: { isDirty }, reset } = form;
  const watchedValues = watch();
  

  // Manual save state
  const hasUnsavedChanges = isDirty;

  // Réinitialiser le formulaire quand les defaultValues changent
  useEffect(() => {
    console.log('[WizardEngine] Réinitialisation du formulaire avec:', defaultValues);
    reset(defaultValues);
  }, [defaultValues, reset]);

  // Calculate progress based on current step and form completion
  useEffect(() => {
    const stepIndex = wizardSteps.findIndex(step => step.id === currentStep);
    const baseProgress = (stepIndex / wizardSteps.length) * 100;
    
    // Add extra progress based on form completion
    let completionBonus = 0;
    if (currentStep === 'basics') {
      const basicsComplete = watchedValues.basics?.cargoType && 
                            watchedValues.basics?.incoterm && 
                            watchedValues.basics?.origin?.city && 
                            watchedValues.basics?.destination?.city;
      completionBonus = basicsComplete ? 10 : 0;
    } else if (currentStep === 'options') {
      const hasOptions = (watchedValues.currentOption?.seafreights?.length || 0) > 0 ||
                        (watchedValues.currentOption?.haulages?.length || 0) > 0 ||
                        (watchedValues.currentOption?.services?.length || 0) > 0;
      completionBonus = hasOptions ? 10 : 0;
    }
    
    setProgress(Math.min(baseProgress + completionBonus, 100));
  }, [currentStep, watchedValues]);

  // Auto-save disabled - only manual save via buttons

  // Initialiser preferredOptionId quand les options sont chargées
  useEffect(() => {
    if (watchedValues.existingOptions && watchedValues.existingOptions.length > 0) {
      const preferredOption = watchedValues.existingOptions.find(option => option.isPreferred);
      if (preferredOption && preferredOption.id !== preferredOptionId) {
        setPreferredOptionId(preferredOption.id);
        console.log('Initialized preferred option from loaded data:', preferredOption.id);
      }
    }
  }, [watchedValues.existingOptions, preferredOptionId]);

  // Handle step change
  const handleStepChange = useCallback((step: string) => {
    setCurrentStep(step as WizardStepId);
    onStepChange?.(step);
  }, [onStepChange]);

  // Handle navigation to next step
  const handleNext = useCallback(() => {
    const currentIndex = wizardSteps.findIndex(step => step.id === currentStep);
    if (currentIndex < wizardSteps.length - 1) {
      const nextStep = wizardSteps[currentIndex + 1];
      handleStepChange(nextStep.id);
    }
  }, [currentStep, handleStepChange]);

  // Handle navigation to previous step
  const handlePrevious = useCallback(() => {
    const currentIndex = wizardSteps.findIndex(step => step.id === currentStep);
    if (currentIndex > 0) {
      const previousStep = wizardSteps[currentIndex - 1];
      handleStepChange(previousStep.id);
    }
  }, [currentStep, handleStepChange]);

  // Handle creating a new option
  const handleCreateOption = useCallback(async () => {
    // Vérifier si le brouillon existe, sinon le créer d'abord
    if (!currentDraftId) {
      try {
        console.log('🔄 [WIZARD] Création du brouillon avant de créer une option...');
        const formData = form.getValues();
        const newDraftId = await saveDraftWithOptions(formData);
        setCurrentDraftId(newDraftId);
        console.log('✅ [WIZARD] Brouillon créé avec ID:', newDraftId);
      } catch (error) {
        console.error('❌ [WIZARD] Erreur lors de la création du brouillon:', error);
        throw new Error('Impossible de créer une option sans brouillon. Veuillez d\'abord sauvegarder le brouillon.');
      }
    }

    // Reset current option to empty state
    form.setValue('currentOption', {
      name: '',
      description: '',
      optionType: null,
      margin: {
        type: 'percentage' as const,
        value: 0,
        amount: 0
      },
      seafreights: [],
      haulages: [],
      services: []
    });
    // Navigate to options step to configure the new option
    handleStepChange('options');
  }, [form, handleStepChange, currentDraftId, saveDraft]);

  // Handle editing an existing option
  const handleEditOption = useCallback((option: QuoteOption) => {
    // Load the option into current option for editing
    form.setValue('currentOption', {
      name: option.name || '',
      description: option.description || '',
      optionType: option.optionType || null,
      margin: option.margin || {
        type: 'percentage' as const,
        value: 0,
        amount: 0
      },
      seafreights: option.seafreights,
      haulages: option.haulages,
      services: option.services
    });
    // Navigate to options step to edit
    handleStepChange('options');
  }, [form, handleStepChange]);

  // Handle updating an existing option (for modal editing)
  const handleUpdateOption = useCallback((optionId: string, updatedOption: Partial<QuoteOption>) => {
    const currentOptions = form.getValues('existingOptions') || [];
    const updatedOptions = currentOptions.map(option => 
      option.id === optionId 
        ? { ...option, ...updatedOption }
        : option
    );
    
    form.setValue('existingOptions', updatedOptions);
    
    // Trigger form validation and save if needed
    form.trigger('existingOptions');
    
    console.log('✅ [WizardEngine] Option mise à jour:', { optionId, updatedOption, updatedOptions });
  }, [form]);

  // Handle deleting an existing option
  const handleDeleteOption = useCallback((optionId: string) => {
    const currentOptions = form.getValues('existingOptions') || [];
    const updatedOptions = currentOptions.filter(option => option.id !== optionId);
    form.setValue('existingOptions', updatedOptions);
  }, [form]);

  // Handle viewing an existing option
  const handleViewOption = useCallback((option: QuoteOption) => {
    // For now, just log the option - could open a modal or navigate to a view
    console.log('Viewing option:', option);
  }, []);

  // Handle setting preferred option
  const handleSetPreferredOption = useCallback((optionId: string) => {
    setPreferredOptionId(optionId);
    
    // Mettre à jour le champ isPreferred dans les options du formulaire
    const formData = form.getValues();
    const updatedOptions = formData.existingOptions?.map(option => ({
      ...option,
      isPreferred: option.id === optionId
    })) || [];
    
    form.setValue('existingOptions', updatedOptions);
    console.log('Preferred option set:', optionId);
    console.log('Updated options with isPreferred:', updatedOptions);
  }, [form]);

  // Handle duplicating an existing option
  const handleDuplicateOption = useCallback(async (option: QuoteOption) => {
    // Vérifier si le brouillon existe, sinon le créer d'abord
    if (!currentDraftId) {
      try {
        console.log('🔄 [WIZARD] Création du brouillon avant de dupliquer l\'option...');
        const formData = form.getValues();
        const newDraftId = await saveDraftWithOptions(formData);
        setCurrentDraftId(newDraftId);
        console.log('✅ [WIZARD] Brouillon créé avec ID:', newDraftId);
      } catch (error) {
        console.error('❌ [WIZARD] Erreur lors de la création du brouillon:', error);
        throw new Error('Impossible de dupliquer une option sans brouillon. Veuillez d\'abord sauvegarder le brouillon.');
      }
    }

    const existingOptions = form.getValues('existingOptions') || [];
    
    if (existingOptions.length >= 3) {
      throw new Error('Maximum 3 options allowed per draft');
    }

    // Créer une copie de l'option avec un nouvel ID et nom
    const duplicatedOption: QuoteOption = {
      ...option,
      id: `option_${Date.now()}`,
      name: `${option.name} (Copie)`,
      description: option.description ? `${option.description} (Copie)` : undefined,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // Ajouter la copie aux options existantes
    const updatedOptions = [...existingOptions, duplicatedOption];
    form.setValue('existingOptions', updatedOptions);

    // Sauvegarder le brouillon avec la nouvelle option dupliquée
    try {
      const formData = form.getValues();
      await saveDraftWithOptions(formData);
      console.log('✅ [WIZARD] Brouillon sauvegardé après duplication d\'option');
    } catch (error) {
      console.error('❌ [WIZARD] Erreur lors de la sauvegarde après duplication d\'option:', error);
      // Ne pas faire échouer la duplication si la sauvegarde échoue
    }

    console.log('Option duplicated:', duplicatedOption);
  }, [form, currentDraftId, saveDraft, saveDraftWithOptions]);

  // Handle saving current option as a new option
  const handleSaveCurrentOption = useCallback(async (optionName: string, optionDescription?: string) => {
    // Vérifier si le brouillon existe, sinon le créer d'abord
    if (!currentDraftId) {
      try {
        console.log('🔄 [WIZARD] Création du brouillon avant de sauvegarder l\'option...');
        const formData = form.getValues();
        const newDraftId = await saveDraftWithOptions(formData);
        setCurrentDraftId(newDraftId);
        console.log('✅ [WIZARD] Brouillon créé avec ID:', newDraftId);
      } catch (error) {
        console.error('❌ [WIZARD] Erreur lors de la création du brouillon:', error);
        throw new Error('Impossible de sauvegarder une option sans brouillon. Veuillez d\'abord sauvegarder le brouillon.');
      }
    }

    const currentOption = form.getValues('currentOption');
    const existingOptions = form.getValues('existingOptions') || [];
    
    console.log('🔍 [WIZARD] Debug handleSaveCurrentOption:');
    console.log('📊 [WIZARD] currentOption récupéré:', currentOption);
    console.log('📊 [WIZARD] currentOption.margin:', currentOption?.margin);
    
    if (existingOptions.length >= 3) {
      throw new Error('Maximum 3 options allowed per draft');
    }

    // Récupérer les données de base du formulaire
    const formData = form.getValues();
    
    const newOption: QuoteOption = {
      id: `option_${Date.now()}`,
      name: optionName,
      description: optionDescription,
      optionType: currentOption.optionType || null,
      margin: currentOption.margin || undefined,
      seafreights: currentOption.seafreights || [],
      haulages: currentOption.haulages || [],
      services: currentOption.services || [],
      containers: formData.basics?.containers || [],
      ports: formData.basics?.portFrom && formData.basics?.portTo 
        ? [formData.basics.portFrom, formData.basics.portTo] 
        : [],
      totals: {
        seafreights: currentOption.seafreights?.reduce((total, sf) => {
          return total + (sf.rates?.reduce((rateTotal, rate) => rateTotal + (rate.basePrice || 0), 0) || 0);
        }, 0) || 0,
        haulages: currentOption.haulages?.reduce((total, haulage) => total + (haulage.price || 0), 0) || 0,
        services: currentOption.services?.reduce((total, service) => total + (service.price || 0), 0) || 0,
        grandTotal: calculateTotalPrice(currentOption)
      },
      currency: 'EUR',
      validUntil: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(),
      isPreferred: false,
      totalPrice: calculateTotalPrice(currentOption),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const updatedOptions = [...existingOptions, newOption];
    form.setValue('existingOptions', updatedOptions);
    
    // Reset current option
    form.setValue('currentOption', {
      name: '',
      description: '',
      optionType: null,
      margin: {
        type: 'percentage' as const,
        value: 0,
        amount: 0
      },
      seafreights: [],
      haulages: [],
      services: []
    });

    // Sauvegarder le brouillon avec les nouvelles options
    try {
      const formData = form.getValues();
      await saveDraftWithOptions(formData);
      console.log('✅ [WIZARD] Brouillon sauvegardé après création d\'option');
    } catch (error) {
      console.error('❌ [WIZARD] Erreur lors de la sauvegarde après création d\'option:', error);
      // Ne pas faire échouer la création de l'option si la sauvegarde échoue
    }

    return newOption;
  }, [form, saveDraftWithOptions, currentDraftId, saveDraft]);

  // Calculate total price for an option (including margin)
  const calculateTotalPrice = useCallback((option: any): number => {
    let baseTotal = 0;
    
    // Add seafreight prices
    option.seafreights?.forEach((sf: any) => {
      sf.rates?.forEach((rate: any) => {
        baseTotal += rate.basePrice || 0;
      });
    });
    
    // Add haulage prices
    option.haulages?.forEach((haulage: any) => {
      baseTotal += haulage.price || 0;
    });
    
    // Add service prices
    option.services?.forEach((service: any) => {
      baseTotal += service.price || 0;
    });
    
    // Apply margin if present
    return calculateTotalWithMargin(baseTotal, option.margin);
  }, []);

  // Handle manual save - disabled since auto-save is removed
  const handleSave = useCallback(async () => {
    console.log('Manual save disabled - use Save Draft button instead');
  }, []);

  // Handle saving draft to database
  const handleSaveDraft = useCallback(async () => {
    try {
      console.log('🎯 [WIZARD] === BOUTON SAVE DRAFT CLIQUÉ ===');
      console.log('🆔 [WIZARD] DraftId actuel:', currentDraftId);
      
      const formData = form.getValues();
      console.log('📋 [WIZARD] Données du formulaire récupérées');
      
      const savedDraftId = await saveDraftWithOptions(formData, currentDraftId || undefined);
      console.log('✅ [WIZARD] Brouillon sauvegardé avec ID:', savedDraftId);
      return savedDraftId;
    } catch (error) {
      console.error('❌ [WIZARD] Erreur lors de la sauvegarde du brouillon:', error);
      throw error;
    }
  }, [form, saveDraftWithOptions, currentDraftId]);

  // Handle form reset
  const handleReset = useCallback(() => {
    form.reset(defaultValues);
  }, [form, defaultValues]);

  // Handle form submission
  const handleFormSubmit = useCallback(async (data: DraftQuoteForm) => {
    try {
      console.log('🔄 [WizardEngine] handleFormSubmit appelé');
      console.log('📋 [WizardEngine] Data reçu:', JSON.stringify(data, null, 2));
      console.log('🔍 [WizardEngine] Data.basics:', data.basics);
      console.log('🔍 [WizardEngine] Data.existingOptions:', data.existingOptions);
      await onSubmit(data);
    } catch (error) {
      console.error('Submit failed:', error);
      throw error;
    }
  }, [onSubmit]);

  // Handle form submission for ReviewStep (no parameters)
  const handleFormSubmitForReview = useCallback(async (): Promise<void> => {
    try {
      console.log('🔄 [WizardEngine] handleFormSubmitForReview appelé');
      const formData = form.getValues();
      console.log('📋 [WizardEngine] Data du formulaire:', JSON.stringify(formData, null, 2));
      // Appeler onSubmit directement avec les données du formulaire
      await onSubmit(formData);
    } catch (error) {
      console.error('❌ [WizardEngine] Erreur lors de la soumission:', error);
    }
  }, [onSubmit, form]);

  // Get current step index
  const currentStepIndex = wizardSteps.findIndex(step => step.id === currentStep);

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.05)} 0%, ${alpha(theme.palette.secondary.main, 0.05)} 100%)`,
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      {/* Background decoration */}
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: `
            radial-gradient(circle at 20% 80%, ${alpha(theme.palette.primary.main, 0.1)} 0%, transparent 50%),
            radial-gradient(circle at 80% 20%, ${alpha(theme.palette.secondary.main, 0.1)} 0%, transparent 50%),
            radial-gradient(circle at 40% 40%, ${alpha(theme.palette.info.main, 0.05)} 0%, transparent 50%)
          `,
          pointerEvents: 'none'
        }}
      />

      <Container maxWidth={false} sx={{ 
        position: 'relative', 
        zIndex: 1, 
        px: { xs: 2, sm: 3, md: 4, lg: 6 },
        maxWidth: { xl: '95%' }
      }}>
        {/* Header */}
        <Box sx={{ py: 4, textAlign: 'center' }}>
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Typography 
              variant="h3" 
              component="h1" 
              sx={{ 
                fontWeight: 700,
                background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                mb: 2
              }}
            >
              Request Wizard
            </Typography>
            <Typography 
              variant="h6" 
              color="text.secondary"
              sx={{ maxWidth: 600, mx: 'auto' }}
            >
              Create your shipping request in just 3 simple steps
            </Typography>
          </motion.div>
        </Box>

        {/* Progress Bar */}
        <Box sx={{ mb: 4 }}>
          <motion.div
            initial={{ opacity: 0, scaleX: 0 }}
            animate={{ opacity: 1, scaleX: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
              <Typography variant="body2" color="text.secondary">
                Progress
              </Typography>
              <Box sx={{ flex: 1 }}>
                <LinearProgress 
                  variant="determinate" 
                  value={progress} 
                  sx={{
                    height: 8,
                    borderRadius: 4,
                    backgroundColor: alpha(theme.palette.primary.main, 0.1),
                    '& .MuiLinearProgress-bar': {
                      borderRadius: 4,
                      background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`
                    }
                  }}
                />
              </Box>
              <Typography variant="body2" color="text.secondary">
                {Math.round(progress)}%
              </Typography>
            </Box>
          </motion.div>
        </Box>

        {/* Main Content */}
        <Box sx={{ display: 'flex', gap: 6, minHeight: '70vh' }}>
          {/* Left Side - Stepper and Form */}
          <Box sx={{ flex: 2, minWidth: 0 }}>
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <Paper
                elevation={0}
                sx={{
                  p: 4,
                  borderRadius: 3,
                  background: `linear-gradient(145deg, ${theme.palette.background.paper}, ${alpha(theme.palette.primary.main, 0.02)})`,
                  border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
                  boxShadow: `0 8px 32px ${alpha(theme.palette.primary.main, 0.1)}`,
                  position: 'relative',
                  overflow: 'hidden'
                }}
              >
                {/* Auto-save indicator removed */}

                {/* Stepper */}
                <Stepper 
                  activeStep={currentStepIndex} 
                  orientation="horizontal"
                  sx={{ 
                    mb: 4,
                    '& .MuiStepLabel-root': {
                      '& .MuiStepLabel-label': {
                        fontWeight: 600,
                        fontSize: '0.95rem'
                      }
                    }
                  }}
                >
                  {wizardSteps.map((step, index) => (
                    <Step key={step.id}>
                      <StepLabel
                        onClick={() => {
                          // Allow navigation to current step, previous steps, or next step in readonly mode
                          if (index <= currentStepIndex || (readonly && index === currentStepIndex + 1)) {
                            handleStepChange(step.id);
                          }
                        }}
                        sx={{
                          cursor: (index <= currentStepIndex || (readonly && index === currentStepIndex + 1)) 
                            ? 'pointer' 
                            : 'default',
                          '& .MuiStepLabel-label': {
                            color: index <= currentStepIndex 
                              ? theme.palette.primary.main 
                              : theme.palette.text.secondary
                          }
                        }}
                      >
                        {step.label}
                      </StepLabel>
                    </Step>
                  ))}
                </Stepper>

                {/* Form Content */}
                <FormProvider {...form}>
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={currentStep}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.3 }}
                    >
                      <StepRouter 
                        currentStep={currentStep}
                        onStepChange={handleStepChange}
                        onNext={handleNext}
                        onPrevious={handlePrevious}
                        onSubmit={handleFormSubmitForReview}
                        onSave={handleSave}
                        onSaveDraft={handleSaveDraft}
                        onReset={handleReset}
                        isAutoSaving={false}
                        isDraftSaving={isDraftSaving}
                        hasUnsavedChanges={hasUnsavedChanges}
                        lastAutoSave={null}
                        lastDraftSaved={lastDraftSaved}
                        requestData={requestData}
                        readonly={readonly}
                        draftId={currentDraftId}
                        onCreateOption={handleCreateOption}
                        onEditOption={handleEditOption}
                        onUpdateOption={handleUpdateOption}
                        onDeleteOption={handleDeleteOption}
                        onViewOption={handleViewOption}
                        onSetPreferredOption={handleSetPreferredOption}
                        preferredOptionId={preferredOptionId}
                        onDuplicateOption={handleDuplicateOption}
                        onSaveCurrentOption={handleSaveCurrentOption}
                        isFinalizing={isFinalizing}
                        optionTypesData={optionTypesData}
                        isLoadingOptionTypes={isLoadingOptionTypes}
                        onQuoteCreated={onQuoteCreated}
                      />
                    </motion.div>
                  </AnimatePresence>
                </FormProvider>
              </Paper>
            </motion.div>
          </Box>

          {/* Right Side - Live Preview */}
          <Box sx={{ width: { xs: '100%', md: 450, lg: 500 }, flexShrink: 0 }}>
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <LivePreview values={watchedValues} />
            </motion.div>
          </Box>
        </Box>
      </Container>

      {/* Add pulse animation keyframes */}
      <style>
        {`
          @keyframes pulse {
            0% { opacity: 1; }
            50% { opacity: 0.5; }
            100% { opacity: 1; }
          }
        `}
      </style>
    </Box>
  );
};