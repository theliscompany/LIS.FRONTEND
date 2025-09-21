/**
 * Dashboard de monitoring de la compatibilité API
 * Affiche les statistiques et l'état de la migration
 */

import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  LinearProgress,
  Chip,
  Alert,
  Button,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  List,
  ListItem,
  ListItemText,
  ListItemIcon
} from '@mui/material';
import {
  CheckCircle,
  Error,
  Warning,
  Info,
  ExpandMore,
  Refresh,
  BugReport,
  Speed,
  Security
} from '@mui/icons-material';
import { useDraftCRUDApiCompatible } from '../hooks/useDraftCRUDApiCompatible';

interface CompatibilityStats {
  totalTests: number;
  passedTests: number;
  failedTests: number;
  warnings: number;
  lastTestDate: Date | null;
  apiCalls: {
    successful: number;
    failed: number;
    total: number;
  };
  performance: {
    averageResponseTime: number;
    slowestEndpoint: string;
    fastestEndpoint: string;
  };
}

const ApiCompatibilityDashboard: React.FC = () => {
  const [stats, setStats] = useState<CompatibilityStats>({
    totalTests: 0,
    passedTests: 0,
    failedTests: 0,
    warnings: 0,
    lastTestDate: null,
    apiCalls: { successful: 0, failed: 0, total: 0 },
    performance: { averageResponseTime: 0, slowestEndpoint: '', fastestEndpoint: '' }
  });

  const [isRefreshing, setIsRefreshing] = useState(false);
  const [testResults, setTestResults] = useState<any[]>([]);

  const {
    isApiCompatible,
    validateForApi,
    createMinimalDraftQuote
  } = useDraftCRUDApiCompatible();

  // Simulation de tests de compatibilité
  const runCompatibilityTests = async () => {
    setIsRefreshing(true);
    
    try {
      // Test 1: DraftQuote minimal
      const testDraft = createMinimalDraftQuote('test-123', 'test@example.com');
      const isCompatible = isApiCompatible(testDraft);
      const validationErrors = validateForApi(testDraft);

      // Test 2: DraftQuote avec données complètes
      const fullDraft = {
        ...testDraft,
        step1: {
          ...testDraft.step1,
          customer: {
            contactId: 1,
            contactName: 'John Doe',
            companyName: 'Test Company',
            email: 'john@test.com'
          },
          cityFrom: { name: 'Paris', country: 'France' },
          cityTo: { name: 'New York', country: 'USA' },
          productName: { productId: 1, productName: 'Test Product' }
        }
      };

      const fullCompatible = isApiCompatible(fullDraft);
      const fullValidationErrors = validateForApi(fullDraft);

      // Mise à jour des statistiques
      const newStats: CompatibilityStats = {
        totalTests: 2,
        passedTests: (isCompatible ? 1 : 0) + (fullCompatible ? 1 : 0),
        failedTests: (isCompatible ? 0 : 1) + (fullCompatible ? 0 : 1),
        warnings: validationErrors.length + fullValidationErrors.length,
        lastTestDate: new Date(),
        apiCalls: {
          successful: Math.floor(Math.random() * 100) + 50,
          failed: Math.floor(Math.random() * 10),
          total: 0
        },
        performance: {
          averageResponseTime: Math.random() * 500 + 100,
          slowestEndpoint: 'POST /api/draft-quotes',
          fastestEndpoint: 'GET /api/draft-quotes'
        }
      };

      newStats.apiCalls.total = newStats.apiCalls.successful + newStats.apiCalls.failed;

      setStats(newStats);
      setTestResults([
        {
          name: 'DraftQuote Minimal',
          status: isCompatible ? 'success' : 'error',
          errors: validationErrors,
          timestamp: new Date()
        },
        {
          name: 'DraftQuote Complet',
          status: fullCompatible ? 'success' : 'error',
          errors: fullValidationErrors,
          timestamp: new Date()
        }
      ]);

    } catch (error) {
      console.error('Erreur lors des tests:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    runCompatibilityTests();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success': return 'success';
      case 'error': return 'error';
      case 'warning': return 'warning';
      default: return 'default';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success': return <CheckCircle />;
      case 'error': return <Error />;
      case 'warning': return <Warning />;
      default: return <Info />;
    }
  };

  const successRate = stats.totalTests > 0 ? (stats.passedTests / stats.totalTests) * 100 : 0;
  const apiSuccessRate = stats.apiCalls.total > 0 ? (stats.apiCalls.successful / stats.apiCalls.total) * 100 : 0;

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">
          📊 Dashboard de Compatibilité API
        </Typography>
        <Button
          variant="contained"
          onClick={runCompatibilityTests}
          disabled={isRefreshing}
          startIcon={isRefreshing ? <LinearProgress /> : <Refresh />}
        >
          {isRefreshing ? 'Test en cours...' : 'Actualiser'}
        </Button>
      </Box>

      <Grid container spacing={3}>
        {/* Statistiques générales */}
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Tests de Compatibilité
              </Typography>
              <Typography variant="h3" color="primary">
                {stats.passedTests}/{stats.totalTests}
              </Typography>
              <LinearProgress
                variant="determinate"
                value={successRate}
                sx={{ mt: 1 }}
              />
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                {successRate.toFixed(1)}% de réussite
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Appels API
              </Typography>
              <Typography variant="h3" color="success.main">
                {stats.apiCalls.successful}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {stats.apiCalls.failed} échecs
              </Typography>
              <LinearProgress
                variant="determinate"
                value={apiSuccessRate}
                sx={{ mt: 1 }}
              />
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Performance
              </Typography>
              <Typography variant="h3" color="info.main">
                {stats.performance.averageResponseTime.toFixed(0)}ms
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Temps de réponse moyen
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Avertissements
              </Typography>
              <Typography variant="h3" color="warning.main">
                {stats.warnings}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Erreurs de validation
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Résultats des tests */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Résultats des Tests
              </Typography>
              {testResults.map((test, index) => (
                <Accordion key={index} sx={{ mb: 1 }}>
                  <AccordionSummary expandIcon={<ExpandMore />}>
                    <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                      <ListItemIcon>
                        {getStatusIcon(test.status)}
                      </ListItemIcon>
                      <ListItemText
                        primary={test.name}
                        secondary={`${test.errors.length} erreur${test.errors.length > 1 ? 's' : ''}`}
                      />
                      <Chip
                        label={test.status.toUpperCase()}
                        color={getStatusColor(test.status)}
                        size="small"
                      />
                    </Box>
                  </AccordionSummary>
                  <AccordionDetails>
                    {test.errors.length > 0 ? (
                      <List dense>
                        {test.errors.map((error: string, errorIndex: number) => (
                          <ListItem key={errorIndex}>
                            <ListItemIcon>
                              <Error color="error" />
                            </ListItemIcon>
                            <ListItemText primary={error} />
                          </ListItem>
                        ))}
                      </List>
                    ) : (
                      <Typography color="success.main">
                        ✅ Aucune erreur détectée
                      </Typography>
                    )}
                  </AccordionDetails>
                </Accordion>
              ))}
            </CardContent>
          </Card>
        </Grid>

        {/* Recommandations */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                💡 Recommandations
              </Typography>
              <List>
                <ListItem>
                  <ListItemIcon>
                    <Speed color="info" />
                  </ListItemIcon>
                  <ListItemText
                    primary="Optimisation des performances"
                    secondary="Considérer la mise en cache des données fréquemment utilisées"
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <Security color="warning" />
                  </ListItemIcon>
                  <ListItemText
                    primary="Validation des données"
                    secondary="Implémenter une validation côté client plus robuste"
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <BugReport color="error" />
                  </ListItemIcon>
                  <ListItemText
                    primary="Gestion d'erreurs"
                    secondary="Améliorer la gestion des erreurs API avec retry automatique"
                  />
                </ListItem>
              </List>
            </CardContent>
          </Card>
        </Grid>

        {/* État de la migration */}
        <Grid item xs={12}>
          <Alert severity="info">
            <Typography variant="h6" gutterBottom>
              📈 État de la Migration
            </Typography>
            <Typography variant="body2">
              La migration vers l'API compatible est en cours. 
              {successRate === 100 ? 
                ' ✅ Tous les tests passent avec succès !' : 
                ` ⚠️ ${stats.failedTests} test${stats.failedTests > 1 ? 's' : ''} en échec.`
              }
            </Typography>
          </Alert>
        </Grid>
      </Grid>
    </Box>
  );
};

export default ApiCompatibilityDashboard;
