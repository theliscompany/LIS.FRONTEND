import React from 'react';
import { Box, Typography, Paper, Grid, Chip } from '@mui/material';
import { Euro, CheckCircle, Warning, Error } from '@mui/icons-material';

interface TotalsDebuggerProps {
  totals: any;
  draftQuote: any;
}

const TotalsDebugger: React.FC<TotalsDebuggerProps> = ({ totals, draftQuote }) => {
  // Vérifier la cohérence des totaux
  const checkTotalsConsistency = () => {
    const calculatedSubtotal = (totals.haulageTotal || 0) + (totals.seafreightTotal || 0) + (totals.miscTotal || 0);
    const displayedSubtotal = totals.subtotal || 0;
    const marginAmount = totals.marginAmount || 0;
    const totalWithMargin = totals.totalWithMargin || 0;
    
    const subtotalConsistent = Math.abs(calculatedSubtotal - displayedSubtotal) < 0.01;
    const marginConsistent = Math.abs((calculatedSubtotal + marginAmount) - totalWithMargin) < 0.01;
    
    return {
      subtotalConsistent,
      marginConsistent,
      calculatedSubtotal,
      displayedSubtotal,
      marginAmount,
      totalWithMargin
    };
  };

  const consistency = checkTotalsConsistency();
  const allConsistent = consistency.subtotalConsistent && consistency.marginConsistent;

  return (
    <Paper sx={{ p: 2, mb: 2, background: '#f8f9fa', border: '1px solid #dee2e6' }}>
      <Typography variant="h6" sx={{ mb: 2, color: '#495057', display: 'flex', alignItems: 'center', gap: 1 }}>
        🔍 Debug - Vérification des Totaux
      </Typography>
      
      {/* Statut général */}
      <Box sx={{ mb: 2, p: 1, borderRadius: 1, background: allConsistent ? '#d4edda' : '#f8d7da', border: `1px solid ${allConsistent ? '#c3e6cb' : '#f5c6cb'}` }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {allConsistent ? (
            <CheckCircle color="success" />
          ) : (
            <Warning color="warning" />
          )}
          <Typography variant="subtitle2" sx={{ fontWeight: 600, color: allConsistent ? '#155724' : '#721c24' }}>
            {allConsistent ? '✅ Tous les totaux sont cohérents' : '⚠️ Incohérences détectées dans les totaux'}
          </Typography>
        </Box>
      </Box>

      {/* Grille des totaux */}
      <Grid container spacing={2} sx={{ mb: 2 }}>
        <Grid item xs={12} md={2}>
          <Box sx={{ textAlign: 'center', p: 1, bgcolor: 'white', borderRadius: 1, border: '1px solid #e9ecef' }}>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              Haulage
            </Typography>
            <Typography variant="h6" sx={{ fontWeight: 700, color: '#6f42c1' }}>
              {totals.haulageTotal?.toFixed(2) || '0.00'} EUR
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Transport routier
            </Typography>
          </Box>
        </Grid>
        
        <Grid item xs={12} md={2}>
          <Box sx={{ textAlign: 'center', p: 1, bgcolor: 'white', borderRadius: 1, border: '1px solid #e9ecef' }}>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              Seafreight
            </Typography>
            <Typography variant="h6" sx={{ fontWeight: 700, color: '#28a745' }}>
              {totals.seafreightTotal?.toFixed(2) || '0.00'} EUR
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Transport maritime
            </Typography>
          </Box>
        </Grid>
        
        <Grid item xs={12} md={2}>
          <Box sx={{ textAlign: 'center', p: 1, bgcolor: 'white', borderRadius: 1, border: '1px solid #e9ecef' }}>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              Service Divers
            </Typography>
            <Typography variant="h6" sx={{ fontWeight: 700, color: '#17a2b8' }}>
              {totals.miscTotal?.toFixed(2) || '0.00'} EUR
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Services additionnels
            </Typography>
          </Box>
        </Grid>
        
        <Grid item xs={12} md={2}>
          <Box sx={{ textAlign: 'center', p: 1, bgcolor: 'white', borderRadius: 1, border: '1px solid #e9ecef' }}>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              Sous-total
            </Typography>
            <Typography variant="h6" sx={{ fontWeight: 700, color: '#007bff' }}>
              {totals.subtotal?.toFixed(2) || '0.00'} EUR
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Haulage + Seafreight + Divers
            </Typography>
          </Box>
        </Grid>
        
        <Grid item xs={12} md={2}>
          <Box sx={{ textAlign: 'center', p: 1, bgcolor: 'white', borderRadius: 1, border: '1px solid #e9ecef' }}>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              Marge
            </Typography>
            <Typography variant="h6" sx={{ fontWeight: 700, color: '#ffc107' }}>
              {totals.marginAmount?.toFixed(2) || '0.00'} EUR
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Bénéfice
            </Typography>
          </Box>
        </Grid>
        
        <Grid item xs={12} md={2}>
          <Box sx={{ textAlign: 'center', p: 1, bgcolor: 'white', borderRadius: 1, border: '1px solid #e9ecef' }}>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              Total Final
            </Typography>
            <Typography variant="h6" sx={{ fontWeight: 700, color: '#dc3545' }}>
              {totals.totalWithMargin?.toFixed(2) || '0.00'} EUR
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Sous-total + Marge
            </Typography>
          </Box>
        </Grid>
      </Grid>

      {/* Vérifications de cohérence */}
      <Box sx={{ mt: 2 }}>
        <Typography variant="subtitle2" color="text.secondary" gutterBottom>
          🔍 Vérifications de Cohérence
        </Typography>
        
        <Grid container spacing={1}>
          <Grid item xs={12} md={6}>
            <Box sx={{ p: 1, bgcolor: consistency.subtotalConsistent ? '#d4edda' : '#f8d7da', borderRadius: 1, border: `1px solid ${consistency.subtotalConsistent ? '#c3e6cb' : '#f5c6cb'}` }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                {consistency.subtotalConsistent ? <CheckCircle color="success" /> : <Error color="error" />}
                <Typography variant="body2" sx={{ fontWeight: 600, color: consistency.subtotalConsistent ? '#155724' : '#721c24' }}>
                  Sous-total
                </Typography>
              </Box>
              <Typography variant="caption" color="text.secondary">
                <strong>Calculé :</strong> {consistency.calculatedSubtotal.toFixed(2)} EUR
                <br />
                <strong>Affiché :</strong> {consistency.displayedSubtotal.toFixed(2)} EUR
                <br />
                <strong>Différence :</strong> {Math.abs(consistency.calculatedSubtotal - consistency.displayedSubtotal).toFixed(2)} EUR
              </Typography>
            </Box>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Box sx={{ p: 1, bgcolor: consistency.marginConsistent ? '#d4edda' : '#f8d7da', borderRadius: 1, border: `1px solid ${consistency.marginConsistent ? '#c3e6cb' : '#f5c6cb'}` }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                {consistency.marginConsistent ? <CheckCircle color="success" /> : <Error color="error" />}
                <Typography variant="body2" sx={{ fontWeight: 600, color: consistency.marginConsistent ? '#155724' : '#721c24' }}>
                  Marge
                </Typography>
              </Box>
              <Typography variant="caption" color="text.secondary">
                <strong>Calculé :</strong> {(consistency.calculatedSubtotal + consistency.marginAmount).toFixed(2)} EUR
                <br />
                <strong>Affiché :</strong> {consistency.totalWithMargin.toFixed(2)} EUR
                <br />
                <strong>Différence :</strong> {Math.abs((consistency.calculatedSubtotal + consistency.marginAmount) - consistency.totalWithMargin).toFixed(2)} EUR
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </Box>

      {/* Détails des données sources */}
      <Box sx={{ mt: 2, p: 2, bgcolor: '#e9ecef', borderRadius: 1 }}>
        <Typography variant="subtitle2" color="text.secondary" gutterBottom>
          📊 Sources des Données
        </Typography>
        <Typography variant="caption" color="text.secondary">
          <strong>Haulage :</strong> {draftQuote?.haulageTotal ? 'draftQuote.haulageTotal' : 'draftQuote.step4.selectedHaulage'} 
          <br />
          <strong>Seafreight :</strong> États locaux (containers + surcharges) ou données originales
          <br />
          <strong>Service Divers :</strong> États locaux (miscellaneousPricing) ou draftQuote.selectedMiscellaneous
          <br />
          <strong>Marge :</strong> Calculée selon profitMargin et profitMarginType
        </Typography>
      </Box>
    </Paper>
  );
};

export default TotalsDebugger;
