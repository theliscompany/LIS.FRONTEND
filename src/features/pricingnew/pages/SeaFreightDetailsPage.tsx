import React from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getApiSeaFreightByIdOptions } from '../api/@tanstack/react-query.gen';
import SeaFreightDetails from '../components/SeaFreightDetails';
import { Box, LinearProgress, Typography } from '@mui/material';

const SeaFreightDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();

  const { data: seaFreight, isLoading, error } = useQuery({
    ...getApiSeaFreightByIdOptions({ path: { id: id! } }),
    enabled: !!id
  });

  if (isLoading) {
    return (
      <Box sx={{ p: 3 }}>
        <LinearProgress />
        <Typography sx={{ mt: 2 }}>Chargement des détails...</Typography>
      </Box>
    );
  }

  if (error || !seaFreight) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography color="error">
          Erreur lors du chargement des détails de l'offre Sea Freight.
        </Typography>
      </Box>
    );
  }

  return <SeaFreightDetails seaFreight={seaFreight} asPage={true} />;
};

export default SeaFreightDetailsPage; 