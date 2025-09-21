/**
 * Composant de test pour vérifier la compatibilité API du DraftQuote
 * Démonstration de l'utilisation du nouveau mapper
 */

import React, { useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Typography,
  Alert,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Chip,
  Grid,
  Divider
} from '@mui/material';
import { ExpandMore, CheckCircle, Error, Warning } from '@mui/icons-material';
import { useDraftCRUDApiCompatible, DraftQuoteTransformers } from '../hooks/useDraftCRUDApiCompatible';
import { DraftQuoteApiUtils } from '../services/DraftQuoteApiMapper';
import { DraftQuote } from '../types/DraftQuote';

export const DraftQuoteApiCompatibilityTest: React.FC = () => {
  const [testResults, setTestResults] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  const {
    createDraft,
    updateDraft,
    useDraft,
    createMinimalDraftQuote,
    isApiCompatible,
    validateForApi
  } = useDraftCRUDApiCompatible();

  // Créer un DraftQuote de test
  const createTestDraftQuote = (): DraftQuote => {
    return createMinimalDraftQuote('test-request-123', 'test@example.com');
  };

  // Test de compatibilité API
  const testApiCompatibility = async () => {
    setIsLoading(true);
    const results: any = {
      timestamp: new Date().toISOString(),
      tests: []
    };

    try {
      // Test 1: Création d'un DraftQuote minimal
      const testDraft = createTestDraftQuote();
      results.tests.push({
        name: 'Création DraftQuote minimal',
        status: 'success',
        details: 'DraftQuote créé avec succès',
        data: testDraft
      });

      // Test 2: Validation de compatibilité
      const isCompatible = isApiCompatible(testDraft);
      results.tests.push({
        name: 'Validation compatibilité API',
        status: isCompatible ? 'success' : 'error',
        details: isCompatible ? 'DraftQuote compatible avec l\'API' : 'DraftQuote non compatible',
        data: { isCompatible }
      });

      // Test 3: Validation des données
      const validationErrors = validateForApi(testDraft);
      results.tests.push({
        name: 'Validation des données',
        status: validationErrors.length === 0 ? 'success' : 'warning',
        details: validationErrors.length === 0 ? 'Aucune erreur de validation' : `${validationErrors.length} erreurs trouvées`,
        data: { errors: validationErrors }
      });

      // Test 4: Transformation vers CreateRequest
      try {
        const createRequest = DraftQuoteTransformers.toCreateRequest(testDraft);
        results.tests.push({
          name: 'Transformation vers CreateRequest',
          status: 'success',
          details: 'Transformation réussie',
          data: createRequest
        });
      } catch (error) {
        results.tests.push({
          name: 'Transformation vers CreateRequest',
          status: 'error',
          details: `Erreur de transformation: ${error}`,
          data: null
        });
      }

      // Test 5: Transformation vers UpdateRequest
      try {
        const updateRequest = DraftQuoteTransformers.toUpdateRequest(testDraft);
        results.tests.push({
          name: 'Transformation vers UpdateRequest',
          status: 'success',
          details: 'Transformation réussie',
          data: updateRequest
        });
      } catch (error) {
        results.tests.push({
          name: 'Transformation vers UpdateRequest',
          status: 'error',
          details: `Erreur de transformation: ${error}`,
          data: null
        });
      }

      // Test 6: Test de création via API (simulation)
      try {
        // Simulation d'un appel API
        const apiPayload = DraftQuoteTransformers.toCreateRequest(testDraft);
        results.tests.push({
          name: 'Simulation appel API',
          status: 'success',
          details: 'Payload API généré avec succès',
          data: {
            endpoint: 'POST /api/draft-quotes',
            payload: apiPayload,
            isValid: true
          }
        });
      } catch (error) {
        results.tests.push({
          name: 'Simulation appel API',
          status: 'error',
          details: `Erreur simulation API: ${error}`,
          data: null
        });
      }

      results.overallStatus = results.tests.every((test: any) => test.status === 'success') ? 'success' : 'warning';
      results.summary = {
        total: results.tests.length,
        success: results.tests.filter((t: any) => t.status === 'success').length,
        warning: results.tests.filter((t: any) => t.status === 'warning').length,
        error: results.tests.filter((t: any) => t.status === 'error').length
      };

    } catch (error) {
      results.overallStatus = 'error';
      results.error = `Erreur générale: ${error}`;
    }

    setTestResults(results);
    setIsLoading(false);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success': return <CheckCircle color="success" />;
      case 'warning': return <Warning color="warning" />;
      case 'error': return <Error color="error" />;
      default: return <Warning color="warning" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success': return 'success';
      case 'warning': return 'warning';
      case 'error': return 'error';
      default: return 'default';
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        🧪 Test de Compatibilité API DraftQuote
      </Typography>
      
      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        Ce composant teste la compatibilité entre la structure DraftQuote frontend et l'API @tanstack/api/draft-quotes
      </Typography>

      <Box sx={{ mb: 3 }}>
        <Button
          variant="contained"
          onClick={testApiCompatibility}
          disabled={isLoading}
          startIcon={isLoading ? <CircularProgress size={20} /> : <CheckCircle />}
        >
          {isLoading ? 'Test en cours...' : 'Lancer les tests de compatibilité'}
        </Button>
      </Box>

      {testResults && (
        <Card sx={{ mt: 3 }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              {getStatusIcon(testResults.overallStatus)}
              <Typography variant="h6" sx={{ ml: 1 }}>
                Résultats des tests
              </Typography>
              <Chip
                label={testResults.overallStatus.toUpperCase()}
                color={getStatusColor(testResults.overallStatus)}
                sx={{ ml: 2 }}
              />
            </Box>

            {testResults.summary && (
              <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid item xs={3}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="h4" color="success.main">
                      {testResults.summary.success}
                    </Typography>
                    <Typography variant="body2">Succès</Typography>
                  </Box>
                </Grid>
                <Grid item xs={3}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="h4" color="warning.main">
                      {testResults.summary.warning}
                    </Typography>
                    <Typography variant="body2">Avertissements</Typography>
                  </Box>
                </Grid>
                <Grid item xs={3}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="h4" color="error.main">
                      {testResults.summary.error}
                    </Typography>
                    <Typography variant="body2">Erreurs</Typography>
                  </Box>
                </Grid>
                <Grid item xs={3}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="h4">
                      {testResults.summary.total}
                    </Typography>
                    <Typography variant="body2">Total</Typography>
                  </Box>
                </Grid>
              </Grid>
            )}

            <Divider sx={{ my: 2 }} />

            {testResults.tests.map((test: any, index: number) => (
              <Accordion key={index} sx={{ mb: 1 }}>
                <AccordionSummary expandIcon={<ExpandMore />}>
                  <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                    {getStatusIcon(test.status)}
                    <Typography variant="subtitle1" sx={{ ml: 1, flexGrow: 1 }}>
                      {test.name}
                    </Typography>
                    <Chip
                      label={test.status.toUpperCase()}
                      color={getStatusColor(test.status)}
                      size="small"
                    />
                  </Box>
                </AccordionSummary>
                <AccordionDetails>
                  <Typography variant="body2" sx={{ mb: 2 }}>
                    {test.details}
                  </Typography>
                  {test.data && (
                    <Box sx={{ mt: 2 }}>
                      <Typography variant="subtitle2" gutterBottom>
                        Données:
                      </Typography>
                      <Box
                        component="pre"
                        sx={{
                          backgroundColor: 'grey.100',
                          p: 2,
                          borderRadius: 1,
                          overflow: 'auto',
                          maxHeight: 300,
                          fontSize: '0.875rem'
                        }}
                      >
                        {JSON.stringify(test.data, null, 2)}
                      </Box>
                    </Box>
                  )}
                </AccordionDetails>
              </Accordion>
            ))}

            {testResults.error && (
              <Alert severity="error" sx={{ mt: 2 }}>
                {testResults.error}
              </Alert>
            )}
          </CardContent>
        </Card>
      )}

      <Card sx={{ mt: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            📋 Informations sur la compatibilité
          </Typography>
          <Typography variant="body2" paragraph>
            Ce test vérifie que la structure DraftQuote du frontend peut être correctement transformée
            vers les formats attendus par l'API @tanstack/api/draft-quotes.
          </Typography>
          <Typography variant="body2" paragraph>
            Les tests incluent :
          </Typography>
          <ul>
            <li>Création d'un DraftQuote minimal compatible</li>
            <li>Validation de la compatibilité API</li>
            <li>Transformation vers CreateDraftQuoteRequest</li>
            <li>Transformation vers UpdateDraftQuoteRequest</li>
            <li>Simulation d'appels API</li>
          </ul>
        </CardContent>
      </Card>
    </Box>
  );
};

export default DraftQuoteApiCompatibilityTest;
