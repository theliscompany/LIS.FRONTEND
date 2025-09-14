import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getApiMiscellaneousById } from '../api/sdk.gen';
import { client as pricingnewClient } from '../api';
import { MiscellaneousResponse } from '../api/types.gen';
import MiscellaneousDetails from '../components/MiscellaneousDetails';
import { Box, CircularProgress, Alert } from '@mui/material';

const MiscellaneousDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [misc, setMisc] = useState<MiscellaneousResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await getApiMiscellaneousById({
          client: pricingnewClient,
          path: { id: id! }
        });
        setMisc(response.data ?? null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erreur lors du chargement du service');
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchData();
  }, [id]);

  if (loading) {
    return <Box sx={{ p: 4, textAlign: 'center' }}><CircularProgress /></Box>;
  }
  if (error) {
    return <Alert severity="error" sx={{ m: 4 }}>{error}</Alert>;
  }
  if (!misc) {
    return <Alert severity="info" sx={{ m: 4 }}>Aucun service trouvé pour cet identifiant.</Alert>;
  }
  return <MiscellaneousDetails miscellaneous={misc} asPage={true} />;
};

export default MiscellaneousDetailsPage; 