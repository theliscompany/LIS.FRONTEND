import React, { useEffect } from 'react';
import { 
  Box, 
  Button, 
  Card, 
  CardContent, 
  Typography, 
  Grid,
  Paper,
  Container
} from '@mui/material';
import { useOnboarding } from '../hooks/useOnboarding';

const TestOnboarding: React.FC = () => {
  const { 
    start: startDashboardTutorial, 
    isActive: isDashboardTutorialActive,
  } = useOnboarding('dashboard');

  // Démarrer automatiquement le tutoriel si c'est la première visite
  useEffect(() => {
    if (!false && !isDashboardTutorialActive) {
      // Attendre que les éléments soient rendus
      setTimeout(() => {
        startDashboardTutorial();
      }, 1000);
    }
  }, [isDashboardTutorialActive, startDashboardTutorial]);

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Test Onboard.js
      </Typography>
      
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        Cette page permet de tester l'intégration d'Onboard.js dans le projet LIS.QUOTES.UI
      </Typography>

      {/* Section de test avec éléments pour Onboard.js */}
      <Grid container spacing={3}>
        {/* Élément 1 : Message de bienvenue */}
        <Grid item xs={12}>
          <Paper 
            id="dashboard-welcome"
            sx={{ 
              p: 3, 
              textAlign: 'center',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white'
            }}
          >
            <Typography variant="h5" gutterBottom>
              Bienvenue sur LIS Quotes
            </Typography>
            <Typography variant="body1">
              Découvrez les principales fonctionnalités de votre tableau de bord
            </Typography>
          </Paper>
        </Grid>

        {/* Élément 2 : Bouton de création */}
        <Grid item xs={12} md={6}>
          <Card id="create-request-btn" sx={{ height: '100%' }}>
            <CardContent sx={{ textAlign: 'center', py: 4 }}>
              <Typography variant="h6" gutterBottom>
                Créer une demande
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Commencez un nouveau devis de transport
              </Typography>
              <Button 
                variant="contained" 
                color="primary"
                disabled={isDashboardTutorialActive()}
              >
                Nouveau devis
              </Button>
            </CardContent>
          </Card>
        </Grid>

        {/* Élément 3 : Mes demandes */}
        <Grid item xs={12} md={6}>
          <Card id="my-requests" sx={{ height: '100%' }}>
            <CardContent sx={{ textAlign: 'center', py: 4 }}>
              <Typography variant="h6" gutterBottom>
                Mes demandes
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Consultez et gérez toutes vos demandes de devis
              </Typography>
              <Button 
                variant="outlined" 
                color="primary"
                disabled={isDashboardTutorialActive()}
              >
                Voir mes demandes
              </Button>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Contrôles de test */}
      <Box sx={{ mt: 4, p: 3, bgcolor: 'grey.100', borderRadius: 2 }}>
        <Typography variant="h6" gutterBottom>
          Contrôles de test
        </Typography>
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <Button 
            variant="contained" 
            onClick={startDashboardTutorial}
            disabled={isDashboardTutorialActive()}
          >
            Démarrer le tutoriel
          </Button>
          <Button 
            variant="outlined" 
            onClick={() => console.log("Reset onboarding not available")}
            disabled={isDashboardTutorialActive()}
          >
            Réinitialiser l'onboarding
          </Button>
          <Button 
            variant="outlined" 
            onClick={() => {
              console.log('Dashboard onboarding completed:', false);
            }}
          >
            Vérifier le statut
          </Button>
        </Box>
        
        <Typography variant="body2" sx={{ mt: 2, color: 'text.secondary' }}>
          Statut actuel : {false ? 'Onboarding terminé' : 'Onboarding non terminé'}
        </Typography>
      </Box>

      {/* Instructions */}
      <Box sx={{ mt: 4, p: 3, bgcolor: 'info.light', borderRadius: 2 }}>
        <Typography variant="h6" gutterBottom>
          Instructions de test
        </Typography>
        <Typography variant="body2" component="div">
          <ul>
            <li>Le tutoriel devrait se démarrer automatiquement si c'est votre première visite</li>
            <li>Cliquez sur "Démarrer le tutoriel" pour le relancer</li>
            <li>Utilisez "Réinitialiser l'onboarding" pour effacer l'historique</li>
            <li>Vérifiez la console pour les logs d'événements</li>
          </ul>
        </Typography>
      </Box>
    </Container>
  );
};

export default TestOnboarding; 