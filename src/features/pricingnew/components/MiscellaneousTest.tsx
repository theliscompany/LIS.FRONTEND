import React, { useState } from 'react';
import { getApiMiscellaneous, postApiMiscellaneous } from '../api/sdk.gen';
import { client as pricingnewClient } from '../api';
import { showSnackbar } from '../../../components/common/Snackbar';
import { Box, Button, Typography, Paper, CircularProgress } from '@mui/material';

const MiscellaneousTest: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [testResult, setTestResult] = useState<string>('');

  const testConnection = async () => {
    try {
      setLoading(true);
      setTestResult('Test en cours...');
      const response = await getApiMiscellaneous({ client: pricingnewClient });
      const services = response.data || [];
      setTestResult(`✅ Connexion réussie ! ${services.length} service(s) trouvé(s)`);
      showSnackbar('Test de connexion réussi', 'success');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue';
      setTestResult(`❌ Erreur de connexion: ${errorMessage}`);
      showSnackbar(`Erreur de test: ${errorMessage}`, 'warning');
    } finally {
      setLoading(false);
    }
  };

  const testCreate = async () => {
    try {
      setLoading(true);
      setTestResult('Test de création en cours...');
      const testData = {
        serviceProviderId: 1,
        serviceProviderName: 'Test Provider',
        serviceType: 0, // WAREHOUSING
        serviceName: 'Service de test',
        serviceDescription: 'Description de test',
        departurePortId: 1,
        departurePortName: 'Port de test',
        departurePortCode: 'TEST',
        destinationPortId: null,
        destinationPortName: null,
        destinationPortCode: null,
        applicableContainerTypes: [0], // DRY_CONTAINER20
        serviceDurationHours: 24,
        serviceDurationDescription: '24 heures',
        specialConditions: ['Condition de test'],
        locationCity: 'Ville de test',
        locationCountry: 'Pays de test',
        currency: 'EUR',
        validFrom: new Date(),
        validUntil: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
        pricing: {
          pricingType: 0, // FIXED_PRICE
          basePrice: 100,
          minimumCharge: null,
          maximumCharge: null,
          isQuoteRequired: false,
          description: 'Prix de test'
        },
        comment: 'Commentaire de test',
        createdBy: 'Test User'
      };
      const createResponse = await postApiMiscellaneous({ client: pricingnewClient, body: testData });
      const newId = createResponse.data;
      setTestResult(`✅ Service créé avec succès ! ID: ${newId}`);
      showSnackbar('Test de création réussi', 'success');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue';
      setTestResult(`❌ Erreur de création: ${errorMessage}`);
      showSnackbar(`Erreur de création: ${errorMessage}`, 'warning');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Paper sx={{ p: 3, m: 2 }}>
      <Typography variant="h6" gutterBottom>
        Test de l'API Miscellaneous
      </Typography>
      <Box sx={{ mb: 2 }}>
        <Button 
          variant="contained" 
          onClick={testConnection}
          disabled={loading}
          sx={{ mr: 2 }}
        >
          {loading ? <CircularProgress size={20} /> : 'Test Connexion'}
        </Button>
        <Button 
          variant="outlined" 
          onClick={testCreate}
          disabled={loading}
        >
          {loading ? <CircularProgress size={20} /> : 'Test Création'}
        </Button>
      </Box>
      {testResult && (
        <Typography 
          variant="body2" 
          sx={{ 
            p: 2, 
            bgcolor: testResult.includes('✅') ? 'success.light' : 'error.light',
            borderRadius: 1,
            fontFamily: 'monospace'
          }}
        >
          {testResult}
        </Typography>
      )}
    </Paper>
  );
};

export default MiscellaneousTest; 