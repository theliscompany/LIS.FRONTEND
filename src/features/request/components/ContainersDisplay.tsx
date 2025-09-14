import React from 'react';
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Avatar,
  Chip,
  Grid
} from '@mui/material';
import { Inventory } from '@mui/icons-material';

interface ContainerItem {
  id: string;
  type?: string;
  containerType?: string;
  quantity: number;
  teu?: number;
}

interface ContainersDisplayProps {
  containers: ContainerItem[];
  title?: string;
  showTitle?: boolean;
  compact?: boolean;
}

const ContainersDisplay: React.FC<ContainersDisplayProps> = ({
  containers,
  title = "Containers sélectionnés",
  showTitle = true,
  compact = false
}) => {
  if (!containers || containers.length === 0) {
    return null;
  }

  // Fonction utilitaire pour calculer le TEU d'un type de container
  const getTEU = (containerType: string): number => {
    const type = containerType?.toLowerCase();
    if (type?.includes('20')) return 1;
    if (type?.includes('40')) return 2;
    if (type?.includes('45')) return 2.25;
    return 1; // Valeur par défaut
  };

  // Calculer le total TEU
  const totalTEU = containers.reduce((total, container) => {
    const containerType = container.containerType || container.type || '';
    const teu = container.teu || getTEU(containerType);
    return total + (teu * container.quantity);
  }, 0);

  if (compact) {
    // Affichage compact pour les petits espaces
    return (
      <Box sx={{ mb: 2 }}>
        {showTitle && (
          <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600, color: '#2c3e50' }}>
            📦 {title}
          </Typography>
        )}
        <Grid container spacing={1}>
          {containers.map((container, idx) => {
            const containerType = container.containerType || container.type || '';
            const teu = container.teu || getTEU(containerType);
            return (
              <Grid item key={container.id || idx}>
                <Chip
                  icon={<Inventory />}
                  label={`${containerType} x${container.quantity} (${teu * container.quantity} TEU)`}
                  variant="outlined"
                  size="small"
                  sx={{
                    borderColor: '#f093fb',
                    color: '#2c3e50',
                    '& .MuiChip-icon': {
                      color: '#f093fb'
                    }
                  }}
                />
              </Grid>
            );
          })}
        </Grid>
        <Box sx={{ mt: 1, textAlign: 'right' }}>
          <Typography variant="body2" sx={{ fontWeight: 600, color: '#2c3e50' }}>
            Total TEU: {totalTEU.toLocaleString(undefined, { maximumFractionDigits: 2 })}
          </Typography>
        </Box>
      </Box>
    );
  }

  // Affichage complet avec tableau
  return (
    <Box sx={{ mb: 3 }}>
      {showTitle && (
        <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600, color: '#2c3e50' }}>
          📦 {title}
        </Typography>
      )}
      
      <TableContainer component={Paper} sx={{ 
        borderRadius: 2,
        boxShadow: '0 5px 15px rgba(0,0,0,0.08)'
      }}>
        <Table size="small">
          <TableHead>
            <TableRow sx={{ background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' }}>
              <TableCell sx={{ color: 'white', fontWeight: 600, fontSize: '0.875rem' }}>
                Type de container
              </TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 600, fontSize: '0.875rem' }}>
                Quantité
              </TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 600, fontSize: '0.875rem' }}>
                TEU/Unité
              </TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 600, fontSize: '0.875rem' }}>
                Total TEU
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {containers.map((container, idx) => {
              const containerType = container.containerType || container.type || '';
              const teu = container.teu || getTEU(containerType);
              return (
                <TableRow 
                  key={container.id || idx}
                  sx={{ 
                    '&:nth-of-type(odd)': { backgroundColor: '#f8f9fa' },
                    '&:hover': { backgroundColor: '#e3f2fd' }
                  }}
                >
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Avatar sx={{ 
                        width: 28, 
                        height: 28, 
                        mr: 1.5,
                        background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)'
                      }}>
                        <Inventory sx={{ fontSize: 16 }} />
                      </Avatar>
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        {containerType}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Chip 
                      label={container.quantity} 
                      color="primary"
                      size="small"
                      sx={{ fontWeight: 600 }}
                    />
                  </TableCell>
                  <TableCell>{teu}</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>
                    {(teu * container.quantity).toLocaleString(undefined, { maximumFractionDigits: 2 })}
                  </TableCell>
                </TableRow>
              );
            })}
            {/* Ligne total TEU */}
            <TableRow sx={{ backgroundColor: '#f8f9fa' }}>
              <TableCell colSpan={3} align="right" sx={{ fontWeight: 700, fontSize: '0.875rem' }}>
                Total TEU
              </TableCell>
              <TableCell sx={{ fontWeight: 700, fontSize: '0.875rem' }}>
                {totalTEU.toLocaleString(undefined, { maximumFractionDigits: 2 })}
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default ContainersDisplay;
