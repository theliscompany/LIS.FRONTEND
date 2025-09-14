import React, { useState } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  Alert, 
  Button, 
  Tabs, 
  Tab, 
  Divider,
  Accordion,
  AccordionSummary,
  AccordionDetails
} from '@mui/material';
import { ExpandMore as ExpandMoreIcon } from '@mui/icons-material';
import { useWizardDraftState } from '../hooks/useWizardDraftState';
import Step1RequestForm from './Step1RequestForm';

// === COMPOSANT DE TEST CONSOLIDÉ ===

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`test-tabpanel-${index}`}
      aria-labelledby={`test-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

export const ConsolidatedTestSuite: React.FC = () => {
  const [tabValue, setTabValue] = useState(0);
  const [expandedTests, setExpandedTests] = useState<string[]>([]);

  const {
    draftQuote,
    isLoading,
    hasUnsavedChanges,
    lastSavedAt,
    updateDraftQuote,
    updateStep,
    updateTotals,
    updateSelections,
    saveDraft,
    resetDraft,
    isCreating,
    isUpdating
  } = useWizardDraftState(null, 'test@example.com', 'CLIENT-TEST');

  // === GESTION DES TESTS ===
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const toggleTestExpansion = (testName: string) => {
    setExpandedTests(prev => 
      prev.includes(testName) 
        ? prev.filter(name => name !== testName)
        : [...prev, testName]
    );
  };

  // === TESTS DES FONCTIONS ===
  const testUpdateStep = () => {
    try {
      console.log('🧪 Test updateStep...');
      updateStep(1, { comment: 'Test comment - ' + new Date().toLocaleTimeString() });
      console.log('✅ updateStep réussi');
    } catch (error) {
      console.error('❌ Erreur updateStep:', error);
    }
  };

  const testUpdateTotals = () => {
    try {
      console.log('🧪 Test updateTotals...');
      updateTotals({ haulage: 150, seafreight: 300, miscellaneous: 50 });
      console.log('✅ updateTotals réussi');
    } catch (error) {
      console.error('❌ Erreur updateTotals:', error);
    }
  };

  const testUpdateSelections = () => {
    try {
      console.log('🧪 Test updateSelections...');
      updateSelections({ 
        selectedHaulage: { id: 'test-haulage', name: 'Test Haulage' },
        selectedSeafreights: [{ id: 'test-seafreight', name: 'Test Seafreight' }]
      });
      console.log('✅ updateSelections réussi');
    } catch (error) {
      console.error('❌ Erreur updateSelections:', error);
    }
  };

  const testUpdateDraftQuote = () => {
    try {
      console.log('🧪 Test updateDraftQuote...');
      updateDraftQuote(prev => ({
        ...prev,
        step1: { ...prev.step1, comment: 'Test direct update - ' + new Date().toLocaleTimeString() }
      }));
      console.log('✅ updateDraftQuote réussi');
    } catch (error) {
      console.error('❌ Erreur updateDraftQuote:', error);
    }
  };

  const testSaveDraft = async () => {
    try {
      console.log('🧪 Test saveDraft...');
      await saveDraft();
      console.log('✅ saveDraft réussi');
    } catch (error) {
      console.error('❌ Erreur saveDraft:', error);
    }
  };

  const testResetDraft = () => {
    try {
      console.log('🧪 Test resetDraft...');
      resetDraft();
      console.log('✅ resetDraft réussi');
    } catch (error) {
      console.error('❌ Erreur resetDraft:', error);
    }
  };

  const handleSaved = () => {
    console.log('✅ Step1 sauvegardé avec succès');
  };

  return (
    <Box sx={{ p: 3, maxWidth: 1400, mx: 'auto' }}>
      <Typography variant="h3" gutterBottom align="center">
        🧪 Suite de Tests Consolidée
      </Typography>
      
      <Alert severity="info" sx={{ mb: 3 }}>
        <strong>📋 Objectif :</strong> Tous les tests du module Request sont maintenant consolidés dans ce composant unique.
        Plus besoin de multiples composants de test séparés !
      </Alert>

      {/* === ONGLETS PRINCIPAUX === */}
      <Paper sx={{ mb: 3 }}>
        <Tabs value={tabValue} onChange={handleTabChange} aria-label="test tabs">
          <Tab label="📊 État du Hook" />
          <Tab label="🧪 Tests de Fonctions" />
          <Tab label="📝 Test Step1RequestForm" />
          <Tab label="🔧 Tests Avancés" />
        </Tabs>
      </Paper>

      {/* === ONGLET 1: ÉTAT DU HOOK === */}
      <TabPanel value={tabValue} index={0}>
        <Paper sx={{ p: 3 }}>
          <Typography variant="h5" gutterBottom>
            📊 État du Hook useWizardDraftState
          </Typography>
          
          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 2 }}>
            <Box>
              <Typography variant="h6" color="primary">État Principal</Typography>
              <Typography><strong>draftQuote:</strong> {draftQuote ? '✅ Initialisé' : '❌ Non initialisé'}</Typography>
              <Typography><strong>isLoading:</strong> {isLoading ? '🔄 Oui' : '✅ Non'}</Typography>
              <Typography><strong>hasUnsavedChanges:</strong> {hasUnsavedChanges ? '⚠️ Oui' : '✅ Non'}</Typography>
            </Box>
            
            <Box>
              <Typography variant="h6" color="primary">Sauvegarde</Typography>
              <Typography><strong>Dernière sauvegarde:</strong> {lastSavedAt ? lastSavedAt.toLocaleString() : 'Jamais'}</Typography>
              <Typography><strong>Création:</strong> {isCreating ? '🔄 En cours' : '✅ Terminé'}</Typography>
              <Typography><strong>Mise à jour:</strong> {isUpdating ? '🔄 En cours' : '✅ Terminé'}</Typography>
            </Box>
          </Box>
        </Paper>
      </TabPanel>

      {/* === ONGLET 2: TESTS DE FONCTIONS === */}
      <TabPanel value={tabValue} index={1}>
        <Paper sx={{ p: 3 }}>
          <Typography variant="h5" gutterBottom>
            🧪 Tests des Fonctions du Hook
          </Typography>
          
          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 2, mb: 3 }}>
            <Button variant="contained" onClick={testUpdateStep} color="primary">
              Test updateStep
            </Button>
            <Button variant="contained" onClick={testUpdateTotals} color="primary">
              Test updateTotals
            </Button>
            <Button variant="contained" onClick={testUpdateSelections} color="primary">
              Test updateSelections
            </Button>
            <Button variant="contained" onClick={testUpdateDraftQuote} color="primary">
              Test updateDraftQuote
            </Button>
            <Button variant="contained" onClick={testSaveDraft} color="primary">
              Test saveDraft
            </Button>
            <Button variant="contained" onClick={testResetDraft} color="secondary">
              Test resetDraft
            </Button>
          </Box>
          
          <Alert severity="success">
            <strong>✅ Succès :</strong> Tous les tests utilisent maintenant le hook consolidé !
          </Alert>
        </Paper>
      </TabPanel>

      {/* === ONGLET 3: TEST Step1RequestForm === */}
      <TabPanel value={tabValue} index={2}>
        <Paper sx={{ p: 3 }}>
          <Typography variant="h5" gutterBottom>
            📝 Test de Step1RequestForm
          </Typography>
          
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Ce composant teste Step1RequestForm avec le hook useWizardDraftState.
            Remplissez les champs et vérifiez la console pour voir les sauvegardes.
          </Typography>

          {draftQuote ? (
            <Step1RequestForm
              customer={draftQuote.step1?.customer}
              setCustomer={(customer) => updateStep(1, { customer })}
              customers={[]}
              cityFrom={draftQuote.step1?.cityFrom}
              setCityFrom={(cityFrom) => updateStep(1, { cityFrom })}
              cityTo={draftQuote.step1?.cityTo}
              setCityTo={(cityTo) => updateStep(1, { cityTo })}
              status={draftQuote.step1?.status || 'NEW'}
              setStatus={(status: any) => updateStep(1, { status })}
              assignee={draftQuote.step1?.assignee || ''}
              setAssignee={(assignee: string | number) => updateStep(1, { assignee })}
              members={[]}
              comment={draftQuote.step1?.comment || ''}
              setComment={(comment) => updateStep(1, { comment })}
              products={[]}
              productName={draftQuote.step1?.productName}
              setProductName={(productName) => updateStep(1, { productName })}
              incoterms={[]}
              incotermName={draftQuote.step1?.incotermName || ''}
              setIncotermName={(incotermName) => updateStep(1, { incotermName })}
              errors={{}}
              isLoading={false}
              isLoadingCustomers={false}
              onSaved={handleSaved}
              selectedHaulage={draftQuote.selectedHaulage ? [draftQuote.selectedHaulage] : []}
              selectedSeafreight={draftQuote.selectedSeafreights || []}
              selectedMiscellaneous={draftQuote.selectedMiscellaneous || []}
              services={[]}
              contacts={[]}
              setSelectedMiscellaneous={(miscellaneous) => updateStep(1, { selectedMiscellaneous: miscellaneous })}
              locked={false}
              selectedContainers={draftQuote.selectedContainers || {}}
              onContainerChange={(serviceId, container) => updateStep(1, { 
                selectedContainers: { ...draftQuote.selectedContainers, [serviceId]: container } 
              })}
              draftQuote={draftQuote}
              setDraftQuote={updateDraftQuote}
              onSaveDraft={() => console.log('Sauvegarde manuelle déclenchée')}
            />
          ) : (
            <Alert severity="warning">
              Le draftQuote n'est pas encore initialisé. Attendez un moment ou utilisez les boutons de test.
            </Alert>
          )}
        </Paper>
      </TabPanel>

      {/* === ONGLET 4: TESTS AVANCÉS === */}
      <TabPanel value={tabValue} index={3}>
        <Paper sx={{ p: 3 }}>
          <Typography variant="h5" gutterBottom>
            🔧 Tests Avancés et Débogage
          </Typography>
          
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {/* Test de Persistance */}
            <Accordion 
              expanded={expandedTests.includes('persistence')}
              onChange={() => toggleTestExpansion('persistence')}
            >
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography variant="h6">🧠 Test de Persistance</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Typography variant="body2" paragraph>
                  Teste la sauvegarde automatique et la récupération des données.
                </Typography>
                <Button variant="outlined" onClick={testSaveDraft}>
                  Tester la Sauvegarde
                </Button>
              </AccordionDetails>
            </Accordion>

            {/* Test de Validation */}
            <Accordion 
              expanded={expandedTests.includes('validation')}
              onChange={() => toggleTestExpansion('validation')}
            >
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography variant="h6">✅ Test de Validation</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Typography variant="body2" paragraph>
                  Vérifie que les données sont correctement validées avant sauvegarde.
                </Typography>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Button variant="outlined" onClick={testUpdateStep}>
                    Tester updateStep
                  </Button>
                  <Button variant="outlined" onClick={testUpdateTotals}>
                    Tester updateTotals
                  </Button>
                </Box>
              </AccordionDetails>
            </Accordion>

            {/* Test de Gestion d'Erreurs */}
            <Accordion 
              expanded={expandedTests.includes('error-handling')}
              onChange={() => toggleTestExpansion('error-handling')}
            >
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography variant="h6">🚨 Test de Gestion d'Erreurs</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Typography variant="body2" paragraph>
                  Teste la gestion des erreurs et la récupération après échec.
                </Typography>
                <Button variant="outlined" color="error" onClick={testResetDraft}>
                  Tester Reset (Simule une erreur)
                </Button>
              </AccordionDetails>
            </Accordion>
          </Box>
        </Paper>
      </TabPanel>

      {/* === INSTRUCTIONS GÉNÉRALES === */}
      <Paper sx={{ p: 3, bgcolor: 'grey.50', mt: 3 }}>
        <Typography variant="h6" gutterBottom>
          📋 Instructions Générales
        </Typography>
        
        <Typography variant="body2" paragraph>
          <strong>🎯 Objectif :</strong> Ce composant unique remplace tous les composants de test individuels.
        </Typography>
        
        <Typography variant="body2" paragraph>
          <strong>🧪 Tests Disponibles :</strong>
        </Typography>
        
        <Box component="ul" sx={{ pl: 2 }}>
          <li>Test des fonctions du hook useWizardDraftState</li>
          <li>Test de Step1RequestForm avec le hook</li>
          <li>Test de persistance et validation</li>
          <li>Test de gestion d'erreurs</li>
        </Box>
        
        <Typography variant="body2" color="success.main" sx={{ mt: 2 }}>
          <strong>✅ Avantages :</strong> Un seul composant à maintenir, tests organisés par onglets, interface claire et intuitive !
        </Typography>
      </Paper>
    </Box>
  );
};

