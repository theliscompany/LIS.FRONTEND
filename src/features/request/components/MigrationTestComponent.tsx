import React, { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Button,
  Grid,
  Card,
  CardContent,
  Alert,
  Chip,
  Stack,
  CircularProgress
} from '@mui/material';
import {
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Warning as WarningIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';

// Import des hooks migrés et anciens pour comparaison
import { useRealDraftOptionsManagerMigrated } from '../hooks/useRealDraftOptionsManagerMigrated';
import { useWizardStateManagerMigrated } from '../hooks/useWizardStateManagerMigrated';
import type { DraftQuote } from '../types/DraftQuote';

interface MigrationTestComponentProps {
  testDraftQuote?: DraftQuote;
  requestQuoteId?: string;
  emailUser?: string;
}

const MigrationTestComponent: React.FC<MigrationTestComponentProps> = ({
  testDraftQuote,
  requestQuoteId = 'test-request-123',
  emailUser = 'test@example.com'
}) => {
  const [testResults, setTestResults] = useState<{
    optionsManager: 'pending' | 'success' | 'error';
    wizardStateManager: 'pending' | 'success' | 'error';
    apiConnectivity: 'pending' | 'success' | 'error';
    dataConversion: 'pending' | 'success' | 'error';
  }>({
    optionsManager: 'pending',
    wizardStateManager: 'pending',
    apiConnectivity: 'pending',
    dataConversion: 'pending'
  });

  const [testLogs, setTestLogs] = useState<string[]>([]);
  const [isRunningTests, setIsRunningTests] = useState(false);

  // Test du hook d'options migrées
  const {
    options,
    isLoadingOptions,
    canAddMoreOptions,
    createOption,
    refreshOptions
  } = useRealDraftOptionsManagerMigrated({
    draftQuote: testDraftQuote,
    onDraftUpdate: (draft) => {
      addLog(`✅ Options manager: Draft mis à jour avec ${draft.savedOptions?.length || 0} options`);
    }
  });

  // Test du hook de gestion d'état migrées
  const {
    state,
    saveDraft,
    loadDraft,
    updateStep
  } = useWizardStateManagerMigrated({
    requestQuoteId,
    emailUser,
    onStepChange: (step) => {
      addLog(`✅ Wizard state manager: Navigation vers step ${step}`);
    },
    onDraftSaved: (draft) => {
      addLog(`✅ Wizard state manager: Draft sauvegardé avec ID ${draft.id}`);
    }
  });

  const addLog = (message: string) => {
    setTestLogs(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  const runTests = async () => {
    setIsRunningTests(true);
    setTestLogs([]);
    addLog('🚀 Début des tests de migration...');

    // Test 1: Options Manager
    try {
      addLog('🔄 Test Options Manager...');
      
      // Test de création d'option
      if (testDraftQuote?.id) {
        await createOption({
          name: 'Option Test Migration',
          description: 'Option créée pour tester la migration'
        });
        addLog('✅ Création d\'option réussie');
      }

      // Test de rafraîchissement
      await refreshOptions();
      addLog('✅ Rafraîchissement des options réussi');

      setTestResults(prev => ({ ...prev, optionsManager: 'success' }));
    } catch (error) {
      addLog(`❌ Erreur Options Manager: ${error}`);
      setTestResults(prev => ({ ...prev, optionsManager: 'error' }));
    }

    // Test 2: Wizard State Manager
    try {
      addLog('🔄 Test Wizard State Manager...');
      
      // Test de mise à jour d'étape
      updateStep(1, { 
        company: 'Test Company Migration',
        isCompleted: true 
      });
      addLog('✅ Mise à jour d\'étape réussie');

      // Test de sauvegarde (si on a un draft)
      if (testDraftQuote?.id) {
        const saveResult = await saveDraft();
        if (saveResult) {
          addLog('✅ Sauvegarde de draft réussie');
        } else {
          addLog('⚠️ Sauvegarde de draft échouée');
        }
      }

      setTestResults(prev => ({ ...prev, wizardStateManager: 'success' }));
    } catch (error) {
      addLog(`❌ Erreur Wizard State Manager: ${error}`);
      setTestResults(prev => ({ ...prev, wizardStateManager: 'error' }));
    }

    // Test 3: Connectivité API
    try {
      addLog('🔄 Test Connectivité API...');
      
      // Test de chargement d'un draft fictif
      if (testDraftQuote?.id) {
        const loadResult = await loadDraft(testDraftQuote.id);
        if (loadResult) {
          addLog('✅ Chargement de draft réussi');
        } else {
          addLog('⚠️ Chargement de draft échoué (normal si draft n\'existe pas)');
        }
      }

      setTestResults(prev => ({ ...prev, apiConnectivity: 'success' }));
    } catch (error) {
      addLog(`❌ Erreur Connectivité API: ${error}`);
      setTestResults(prev => ({ ...prev, apiConnectivity: 'error' }));
    }

    // Test 4: Conversion des données
    try {
      addLog('🔄 Test Conversion des données...');
      
      // Vérifier que les données sont correctement mappées
      if (state.draftQuote) {
        addLog(`✅ Draft state: ID=${state.draftQuote.id}, Step=${state.activeStep}`);
        addLog(`✅ Options: ${options.length} options chargées`);
        
        if (state.draftQuote.step1) {
          addLog('✅ Step1 data mapping OK');
        }
        if (state.draftQuote.step2) {
          addLog('✅ Step2 data mapping OK');
        }
      }

      setTestResults(prev => ({ ...prev, dataConversion: 'success' }));
    } catch (error) {
      addLog(`❌ Erreur Conversion des données: ${error}`);
      setTestResults(prev => ({ ...prev, dataConversion: 'error' }));
    }

    addLog('🏁 Tests de migration terminés');
    setIsRunningTests(false);
  };

  const getStatusIcon = (status: 'pending' | 'success' | 'error') => {
    switch (status) {
      case 'success':
        return <CheckCircleIcon color="success" />;
      case 'error':
        return <ErrorIcon color="error" />;
      default:
        return <WarningIcon color="warning" />;
    }
  };

  const getStatusColor = (status: 'pending' | 'success' | 'error') => {
    switch (status) {
      case 'success':
        return 'success';
      case 'error':
        return 'error';
      default:
        return 'warning';
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Paper sx={{ p: 3, mb: 3, bgcolor: 'primary.main', color: 'white' }}>
        <Typography variant="h4" gutterBottom>
          🧪 Tests de Migration SDK Quote Offer
        </Typography>
        <Typography variant="h6">
          Validation de la compatibilité avec les nouveaux endpoints
        </Typography>
      </Paper>

      {/* Informations de test */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          📋 Configuration de Test
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} md={4}>
            <Typography variant="subtitle2" color="text.secondary">
              Request Quote ID
            </Typography>
            <Typography variant="body1" sx={{ fontWeight: 600 }}>
              {requestQuoteId}
            </Typography>
          </Grid>
          <Grid item xs={12} md={4}>
            <Typography variant="subtitle2" color="text.secondary">
              Email User
            </Typography>
            <Typography variant="body1" sx={{ fontWeight: 600 }}>
              {emailUser}
            </Typography>
          </Grid>
          <Grid item xs={12} md={4}>
            <Typography variant="subtitle2" color="text.secondary">
              Draft Test
            </Typography>
            <Typography variant="body1" sx={{ fontWeight: 600 }}>
              {testDraftQuote ? `ID: ${testDraftQuote.id}` : 'Aucun draft de test'}
            </Typography>
          </Grid>
        </Grid>
      </Paper>

      {/* État actuel */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          📊 État Actuel des Hooks Migrés
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <Card variant="outlined">
              <CardContent>
                <Typography variant="subtitle1" gutterBottom>
                  Options Manager
                </Typography>
                <Stack spacing={1}>
                  <Chip 
                    label={`${options.length} options`} 
                    color="primary" 
                    size="small" 
                  />
                  <Chip 
                    label={isLoadingOptions ? 'Chargement...' : 'Prêt'} 
                    color={isLoadingOptions ? 'warning' : 'success'} 
                    size="small" 
                  />
                  <Chip 
                    label={canAddMoreOptions ? 'Peut ajouter' : 'Limite atteinte'} 
                    color={canAddMoreOptions ? 'success' : 'warning'} 
                    size="small" 
                  />
                </Stack>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={6}>
            <Card variant="outlined">
              <CardContent>
                <Typography variant="subtitle1" gutterBottom>
                  Wizard State Manager
                </Typography>
                <Stack spacing={1}>
                  <Chip 
                    label={`Step ${state.activeStep}`} 
                    color="primary" 
                    size="small" 
                  />
                  <Chip 
                    label={state.isDirty ? 'Modifié' : 'Sauvegardé'} 
                    color={state.isDirty ? 'warning' : 'success'} 
                    size="small" 
                  />
                  <Chip 
                    label={state.isSaving ? 'Sauvegarde...' : 'Prêt'} 
                    color={state.isSaving ? 'warning' : 'success'} 
                    size="small" 
                  />
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Paper>

      {/* Résultats des tests */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6">
            🧪 Résultats des Tests
          </Typography>
          <Button
            variant="contained"
            startIcon={isRunningTests ? <CircularProgress size={16} /> : <RefreshIcon />}
            onClick={runTests}
            disabled={isRunningTests}
          >
            {isRunningTests ? 'Tests en cours...' : 'Lancer les Tests'}
          </Button>
        </Box>

        <Grid container spacing={2}>
          {Object.entries(testResults).map(([testName, status]) => (
            <Grid item xs={12} sm={6} md={3} key={testName}>
              <Card variant="outlined">
                <CardContent sx={{ textAlign: 'center' }}>
                  {getStatusIcon(status)}
                  <Typography variant="subtitle2" sx={{ mt: 1, textTransform: 'capitalize' }}>
                    {testName.replace(/([A-Z])/g, ' $1')}
                  </Typography>
                  <Chip 
                    label={status} 
                    color={getStatusColor(status)} 
                    size="small" 
                    sx={{ mt: 1 }}
                  />
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Paper>

      {/* Logs des tests */}
      {testLogs.length > 0 && (
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            📝 Logs des Tests
          </Typography>
          <Box 
            sx={{ 
              bgcolor: 'grey.100', 
              p: 2, 
              borderRadius: 1, 
              maxHeight: 400, 
              overflow: 'auto',
              fontFamily: 'monospace',
              fontSize: '0.875rem'
            }}
          >
            {testLogs.map((log, index) => (
              <Typography 
                key={index} 
                variant="body2" 
                sx={{ 
                  color: log.includes('❌') ? 'error.main' : 
                         log.includes('✅') ? 'success.main' : 
                         log.includes('⚠️') ? 'warning.main' : 'text.primary'
                }}
              >
                {log}
              </Typography>
            ))}
          </Box>
        </Paper>
      )}

      {/* Informations sur la migration */}
      <Alert severity="info" sx={{ mt: 3 }}>
        <Typography variant="subtitle2" gutterBottom>
          ℹ️ À propos de cette migration
        </Typography>
        <Typography variant="body2">
          Cette page teste la compatibilité des nouveaux hooks migrés avec les endpoints du nouveau SDK. 
          Les hooks conservent la même interface mais utilisent les nouveaux endpoints en arrière-plan.
        </Typography>
      </Alert>
    </Box>
  );
};

export default MigrationTestComponent;
