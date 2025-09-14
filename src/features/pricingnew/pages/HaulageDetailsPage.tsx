import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getApiHaulageById } from '../api/sdk.gen';
import { client as pricingnewClient } from '../api';
import { HaulageResponse } from '../api/types.gen';
import HaulageDetails from '../components/HaulageDetails';
import { Box, CircularProgress, Alert } from '@mui/material';

const HaulageDetailsPage: React.FC = () => {
  const { offerId } = useParams<{ offerId: string }>();
  const [haulage, setHaulage] = useState<HaulageResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await getApiHaulageById({
          client: pricingnewClient,
          path: { id: offerId! }
        });
        setHaulage(response.data ?? null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erreur lors du chargement de l\'offre');
      } finally {
        setLoading(false);
      }
    };
    if (offerId) fetchData();
  }, [offerId]);

  if (loading) {
    return <Box sx={{ p: 4, textAlign: 'center' }}><CircularProgress /></Box>;
  }
  if (error) {
    return <Alert severity="error" sx={{ m: 4 }}>{error}</Alert>;
  }
  if (!haulage) {
    return <Alert severity="info" sx={{ m: 4 }}>Aucune offre trouvée pour cet identifiant.</Alert>;
  }
  return <HaulageDetails haulage={haulage} asPage={true} />;
};

export default HaulageDetailsPage; 