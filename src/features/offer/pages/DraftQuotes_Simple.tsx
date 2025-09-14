import React, { useState, useEffect } from 'react';
import { 
  Container, 
  Typography, 
  Box, 
  CircularProgress,
  Card,
  CardContent,
  Alert
} from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import { getApiQuoteOfferDraftsOptions } from '@features/offer/api/@tanstack/react-query.gen';

interface Draft {
  id: string;
  quoteOfferNumber?: number;
  emailUser?: string;
  status?: string;
  created?: string;
  lastModified?: string;
  progress?: number;
  currentStep?: number;
  totalSteps?: number;
}

const DraftQuotesSimple: React.FC = () => {
  const [drafts, setDrafts] = useState<Draft[]>([]);

  // Test 1: useQuery avec React Query Options - Sans paramètres
  const { data: data1, isLoading: loading1, error: error1 } = useQuery(
    getApiQuoteOfferDraftsOptions()
  );

  // Test 2: useQuery avec paramètres de pagination
  const { data: data2, isLoading: loading2, error: error2 } = useQuery(
    getApiQuoteOfferDraftsOptions({
      query: {
        pageNumber: 1,
        pageSize: 100
      }
    })
  );

  // Test 3: useQuery avec emailUser spécifique
  const { data: data3, isLoading: loading3, error: error3 } = useQuery(
    getApiQuoteOfferDraftsOptions({
      query: {
        emailUser: 'clement.dzou@omnifreight.eu',
        pageNumber: 1,
        pageSize: 100
      }
    })
  );

  const loading = loading1 || loading2 || loading3;
  const error = error1 || error2 || error3;

  useEffect(() => {
    console.log('[DraftQuotesSimple] useQuery Results:');
    console.log('[DraftQuotesSimple] Data 1 (sans paramètres):', data1);
    console.log('[DraftQuotesSimple] Data 2 (avec pagination):', data2);
    console.log('[DraftQuotesSimple] Data 3 (avec emailUser):', data3);
    
    // Utiliser la première réponse qui a des données
    let dataToUse = null;
    let sourceUsed = '';
    
    if (data1) {
      dataToUse = data1;
      sourceUsed = 'Sans paramètres';
    } else if (data2) {
      dataToUse = data2;
      sourceUsed = 'Avec pagination';
    } else if (data3) {
      dataToUse = data3;
      sourceUsed = 'Avec emailUser';
    }
    
    console.log('[DraftQuotesSimple] Source utilisée:', sourceUsed);
    console.log('[DraftQuotesSimple] Données brutes:', dataToUse);
    
    if (dataToUse) {
      // Extraire les drafts selon la structure API standard
      let draftsArray: Draft[] = [];
      
      // Structure API standard: { code: 200, message: 'Success', data: [...] }
      if (dataToUse.data && Array.isArray(dataToUse.data)) {
        draftsArray = dataToUse.data;
      } else if (Array.isArray(dataToUse)) {
        draftsArray = dataToUse;
      } else if (dataToUse.items && Array.isArray(dataToUse.items)) {
        draftsArray = dataToUse.items;
      } else if (typeof dataToUse === 'object' && dataToUse !== null) {
        // Si c'est un objet, essayer d'extraire les valeurs
        const values = Object.values(dataToUse);
        if (values.length > 0 && Array.isArray(values[0])) {
          draftsArray = values[0] as Draft[];
        } else if (values.some(v => v && typeof v === 'object' && 'id' in v)) {
          draftsArray = values.filter(v => v && typeof v === 'object' && 'id' in v) as Draft[];
        }
      }
      
      console.log('[DraftQuotesSimple] Drafts extraits:', draftsArray);
      console.log('[DraftQuotesSimple] Type des drafts:', typeof draftsArray, 'Length:', draftsArray.length);
      setDrafts(draftsArray);
    } else {
      console.log('[DraftQuotesSimple] Aucune donnée trouvée');
      setDrafts([]);
    }
    
  }, [data1, data2, data3]);

  return (
    <Container maxWidth="lg">
      <Box sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Tests Brouillons (Version Simple)
        </Typography>
        
        {loading && (
          <Box display="flex" justifyContent="center" my={4}>
            <CircularProgress />
          </Box>
        )}
        
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            Erreur: {error}
          </Alert>
        )}
        
        <Typography variant="h6" gutterBottom>
          Nombre de brouillons trouvés: {drafts.length}
        </Typography>
        
        {drafts.map((draft, index) => (
          <Card key={draft.id || index} sx={{ mb: 2 }}>
            <CardContent>
              <Typography variant="h6">
                Brouillon #{draft.quoteOfferNumber || 'N/A'}
              </Typography>
              <Typography color="text.secondary">
                ID: {draft.id}
              </Typography>
              <Typography color="text.secondary">
                Email: {draft.emailUser}
              </Typography>
              <Typography color="text.secondary">
                Statut: {draft.status}
              </Typography>
              <Typography color="text.secondary">
                Créé: {draft.created}
              </Typography>
              <Typography color="text.secondary">
                Étape: {draft.currentStep}/{draft.totalSteps} ({draft.progress}%)
              </Typography>
            </CardContent>
          </Card>
        ))}
        
        {!loading && drafts.length === 0 && (
          <Alert severity="info">
            Aucun brouillon trouvé. Vérifiez la console pour les détails.
          </Alert>
        )}
      </Box>
    </Container>
  );
};

export default DraftQuotesSimple;
