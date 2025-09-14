import React from 'react';
import { Box, Typography, Paper, Chip, Grid } from '@mui/material';
import { DirectionsBoat, Euro, Warning } from '@mui/icons-material';

interface SeafreightCalculationDebuggerProps {
  seafreightContainers: any[];
  seafreightSurcharges: any[];
  seafreightSelections: any[];
  draftQuote: any;
  totals: any;
}

const SeafreightCalculationDebugger: React.FC<SeafreightCalculationDebuggerProps> = ({
  seafreightContainers,
  seafreightSurcharges,
  seafreightSelections,
  draftQuote,
  totals
}) => {
  // Calculer le détail du seafreight
  const calculateSeafreightBreakdown = () => {
    // Prix de base des containers
    let basePriceTotal = 0;
    if (seafreightContainers.length > 0) {
      basePriceTotal = seafreightContainers.reduce((total: number, container: any) => {
        const quantity = container.quantity || 1;
        const unitPrice = container.unitPrice || 0;
        return total + (unitPrice * quantity);
      }, 0);
    } else if (draftQuote?.step3?.selectedContainers?.list) {
      // Fallback vers les données originales
      basePriceTotal = draftQuote.step3.selectedContainers.list.reduce((total: number, container: any) => {
        const quantity = container.quantity || 1;
        const unitPrice = 0; // Prix de base non disponible dans step3
        return total + (unitPrice * quantity);
      }, 0);
    }

    // Total des surcharges
    let surchargesTotal = 0;
    if (seafreightSurcharges.length > 0) {
      surchargesTotal = seafreightSurcharges.reduce((total: number, surcharge: any) => {
        return total + (surcharge.value || surcharge.amount || 0);
      }, 0);
    } else {
      // Fallback vers les surcharges des données originales
      const seafreight = seafreightSelections.length > 0 ? seafreightSelections[0] : draftQuote?.selectedSeafreights?.[0];
      if (seafreight) {
        if (seafreight.charges?.surcharges) {
          surchargesTotal += seafreight.charges.surcharges.reduce((total: number, surcharge: any) => {
            return total + (surcharge.value || surcharge.amount || 0);
          }, 0);
        }
        if (seafreight.pricing?.surcharges) {
          surchargesTotal += seafreight.pricing.surcharges.reduce((total: number, surcharge: any) => {
            return total + (surcharge.value || surcharge.amount || 0);
          }, 0);
        }
        if (seafreight.surcharges) {
          surchargesTotal += seafreight.surcharges.reduce((total: number, surcharge: any) => {
            return total + (surcharge.value || surcharge.amount || 0);
          }, 0);
        }
      }
    }

    const totalSeafreight = basePriceTotal + surchargesTotal;

    return {
      basePriceTotal,
      surchargesTotal,
      totalSeafreight,
      containersCount: seafreightContainers.length > 0 ? seafreightContainers.length : (draftQuote?.step3?.selectedContainers?.list?.length || 0),
      surchargesCount: seafreightSurcharges.length > 0 ? seafreightSurcharges.length : 0
    };
  };

  const breakdown = calculateSeafreightBreakdown();
  const hasDiscrepancy = Math.abs(breakdown.totalSeafreight - totals.seafreightTotal) > 0.01;

  return (
    <Paper sx={{ p: 2, mb: 2, background: '#e8f5e8', border: '1px solid #4caf50' }}>
      <Typography variant="h6" sx={{ mb: 2, color: '#2e7d32', display: 'flex', alignItems: 'center', gap: 1 }}>
        <DirectionsBoat color="success" />
        🔍 Debug - Calcul Seafreight avec Surcharges
      </Typography>
      
      <Grid container spacing={2}>
        <Grid item xs={12} md={3}>
          <Box sx={{ textAlign: 'center', p: 1 }}>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              Prix de Base
            </Typography>
            <Typography variant="h6" sx={{ fontWeight: 700, color: '#2e7d32' }}>
              {breakdown.basePriceTotal.toFixed(2)} EUR
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {breakdown.containersCount} container(s)
            </Typography>
          </Box>
        </Grid>
        
        <Grid item xs={12} md={3}>
          <Box sx={{ textAlign: 'center', p: 1 }}>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              Total Surcharges
            </Typography>
            <Typography variant="h6" sx={{ fontWeight: 700, color: '#e65100' }}>
              {breakdown.surchargesTotal.toFixed(2)} EUR
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {breakdown.surchargesCount} surcharge(s)
            </Typography>
          </Box>
        </Grid>
        
        <Grid item xs={12} md={3}>
          <Box sx={{ textAlign: 'center', p: 1 }}>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              Total Calculé
            </Typography>
            <Typography variant="h6" sx={{ fontWeight: 700, color: '#1565c0' }}>
              {breakdown.totalSeafreight.toFixed(2)} EUR
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Base + Surcharges
            </Typography>
          </Box>
        </Grid>
        
        <Grid item xs={12} md={3}>
          <Box sx={{ textAlign: 'center', p: 1 }}>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              Total Affiché
            </Typography>
            <Typography variant="h6" sx={{ fontWeight: 700, color: totals.seafreightTotal > 0 ? '#2e7d32' : '#f57c00' }}>
              {totals.seafreightTotal.toFixed(2)} EUR
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Dans le composant
            </Typography>
          </Box>
        </Grid>
      </Grid>

      {/* Afficher les détails des containers */}
      {breakdown.containersCount > 0 && (
        <Box sx={{ mt: 2, p: 2, bgcolor: 'white', borderRadius: 1, border: '1px solid #4caf50' }}>
          <Typography variant="subtitle2" color="success" gutterBottom>
            📦 Détail des Containers
          </Typography>
          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 1 }}>
            {(seafreightContainers.length > 0 ? seafreightContainers : (draftQuote?.step3?.selectedContainers?.list || [])).map((container: any, index: number) => (
              <Box key={container.id || index} sx={{ p: 1, bgcolor: '#f1f8e9', borderRadius: 1, border: '1px solid #c8e6c9' }}>
                <Typography variant="caption" sx={{ fontWeight: 600, display: 'block' }}>
                  {container.type || container.containerType}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Qty: {container.quantity || 1} × {container.unitPrice?.toFixed(2) || '0.00'} = {(container.quantity || 1) * (container.unitPrice || 0)} EUR
                </Typography>
              </Box>
            ))}
          </Box>
        </Box>
      )}

      {/* Afficher les détails des surcharges */}
      {breakdown.surchargesCount > 0 && (
        <Box sx={{ mt: 2, p: 2, bgcolor: 'white', borderRadius: 1, border: '1px solid #ff9800' }}>
          <Typography variant="subtitle2" color="warning" gutterBottom>
            💰 Détail des Surcharges
          </Typography>
          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 1 }}>
            {(seafreightSurcharges.length > 0 ? seafreightSurcharges : []).map((surcharge: any, index: number) => (
              <Box key={surcharge.id || index} sx={{ p: 1, bgcolor: '#fff8e1', borderRadius: 1, border: '1px solid #ffcc02' }}>
                <Typography variant="caption" sx={{ fontWeight: 600, display: 'block' }}>
                  {surcharge.name || `Surcharge ${index + 1}`}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {surcharge.value?.toFixed(2) || surcharge.amount?.toFixed(2) || '0.00'} EUR
                </Typography>
              </Box>
            ))}
          </Box>
        </Box>
      )}

      {/* Avertissement si il y a une différence */}
      {hasDiscrepancy && (
        <Box sx={{ mt: 2, p: 2, bgcolor: '#fff3cd', borderRadius: 1, border: '1px solid #ffc107' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
            <Warning color="warning" />
            <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#856404' }}>
              ⚠️ Différence détectée dans le calcul
            </Typography>
          </Box>
          <Typography variant="body2" color="#856404">
            <strong>Total calculé :</strong> {breakdown.totalSeafreight.toFixed(2)} EUR
            <br />
            <strong>Total affiché :</strong> {totals.seafreightTotal.toFixed(2)} EUR
            <br />
            <strong>Différence :</strong> {Math.abs(breakdown.totalSeafreight - totals.seafreightTotal).toFixed(2)} EUR
          </Typography>
        </Box>
      )}

      {/* Résumé final */}
      <Box sx={{ mt: 2, p: 2, bgcolor: '#e3f2fd', borderRadius: 1, border: '1px solid #2196f3' }}>
        <Typography variant="subtitle2" color="primary" gutterBottom>
          📊 Résumé du Calcul
        </Typography>
        <Typography variant="body2" color="text.secondary">
          <strong>Prix de base des containers :</strong> {breakdown.basePriceTotal.toFixed(2)} EUR
          <br />
          <strong>Total des surcharges :</strong> {breakdown.surchargesTotal.toFixed(2)} EUR
          <br />
          <strong>Total seafreight :</strong> {breakdown.totalSeafreight.toFixed(2)} EUR
          <br />
          <strong>Status :</strong> {hasDiscrepancy ? '❌ Différence détectée' : '✅ Calcul cohérent'}
        </Typography>
      </Box>
    </Paper>
  );
};

export default SeafreightCalculationDebugger;
