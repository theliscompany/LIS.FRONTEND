import React, { useEffect, useState } from 'react';
import { getApiHaulageById } from '@features/pricingnew/api/sdk.gen';
import { Box, Typography, CircularProgress, Alert, Chip } from '@mui/material';
import { LocalShipping } from '@mui/icons-material';

interface HaulageApiIntegrationProps {
  haulageId?: string | number;
  onDataLoaded?: (data: any) => void;
  showDebugInfo?: boolean;
}

const HaulageApiIntegration: React.FC<HaulageApiIntegrationProps> = ({ 
  haulageId, 
  onDataLoaded,
  showDebugInfo = false 
}) => {
  const [haulageData, setHaulageData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchHaulage = async () => {
    if (!haulageId) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await getApiHaulageById({ path: { id: String(haulageId) } });
      console.log('[DEBUG] Haulage API response:', response);
      const data = response.data;
      setHaulageData(data);
      
      // Notifier le composant parent
      if (onDataLoaded) {
        onDataLoaded(data);
      }
    } catch (err: any) {
      console.error('[DEBUG] Haulage API error:', err);
      setError(err.message || 'Erreur lors du chargement du haulage');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (haulageId) {
      fetchHaulage();
    }
  }, [haulageId]);

  if (!haulageId) {
    return null;
  }

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', p: 1, background: '#f0f8ff', borderRadius: 1 }}>
        <CircularProgress size={16} sx={{ mr: 1 }} />
        <Typography variant="caption" sx={{ color: '#1976d2' }}>
          Chargement haulage...
        </Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 1, background: '#fff3cd', borderRadius: 1, border: '1px solid #ffc107' }}>
        <Typography variant="caption" sx={{ color: '#856404' }}>
          ⚠️ Erreur API haulage
        </Typography>
      </Box>
    );
  }

  if (!haulageData) {
    return null;
  }

  return (
    <Box sx={{ p: 1, background: '#e8f5e8', borderRadius: 1, border: '1px solid #4caf50' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
        <LocalShipping sx={{ fontSize: 16, color: '#4caf50', mr: 0.5 }} />
        <Typography variant="caption" sx={{ color: '#2e7d32', fontWeight: 600 }}>
          ✅ Données complètes chargées
        </Typography>
      </Box>
      
      {showDebugInfo && (
        <Box sx={{ mt: 1 }}>
          <Chip 
            label={`ID: ${haulageData.id || haulageData.offerId || haulageData.haulierId}`} 
            size="small" 
            variant="outlined" 
            sx={{ mr: 0.5, mb: 0.5 }}
          />
          <Chip 
            label={`Nom: ${haulageData.haulierName || 'N/A'}`} 
            size="small" 
            variant="outlined" 
            sx={{ mr: 0.5, mb: 0.5 }}
          />
          <Chip 
            label={`Tarif: ${haulageData.unitTariff || 'N/A'} ${haulageData.currency || ''}`} 
            size="small" 
            variant="outlined" 
            sx={{ mr: 0.5, mb: 0.5 }}
          />
        </Box>
      )}
    </Box>
  );
};

export default HaulageApiIntegration;
