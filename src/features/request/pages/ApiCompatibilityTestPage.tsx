/**
 * Page de test pour la compatibilité API DraftQuote
 * Accessible via /test-api-compatibility
 */

import React from 'react';
import { Container, Typography, Box, Alert } from '@mui/material';
import DraftQuoteApiCompatibilityTest from '../components/DraftQuoteApiCompatibilityTest';

const ApiCompatibilityTestPage: React.FC = () => {
  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h3" component="h1" gutterBottom>
          🔧 Test de Compatibilité API
        </Typography>
        <Typography variant="h6" color="text.secondary" paragraph>
          Validation de la compatibilité entre DraftQuote frontend et API @tanstack/api/draft-quotes
        </Typography>
        
        <Alert severity="info" sx={{ mb: 3 }}>
          <Typography variant="body2">
            Cette page teste la nouvelle structure de mapping bidirectionnel entre le frontend et l'API.
            Utilisez les tests ci-dessous pour vérifier que tout fonctionne correctement.
          </Typography>
        </Alert>
      </Box>

      <DraftQuoteApiCompatibilityTest />
    </Container>
  );
};

export default ApiCompatibilityTestPage;
