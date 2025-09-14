import React from 'react';
import { Box, Typography, Paper, Chip } from '@mui/material';

interface DraftStateDebuggerProps {
  draftExists: boolean | null;
  currentDraftId: string | undefined;
  draftId: string | undefined;
  draftCheckStatus: 'idle' | 'checking' | 'checked';
}

const DraftStateDebugger: React.FC<DraftStateDebuggerProps> = ({
  draftExists,
  currentDraftId,
  draftId,
  draftCheckStatus
}) => {
  const getStatusColor = (status: 'idle' | 'checking' | 'checked') => {
    switch (status) {
      case 'idle': return 'default';
      case 'checking': return 'warning';
      case 'checked': return 'success';
      default: return 'default';
    }
  };

  const getDraftExistsColor = (exists: boolean | null) => {
    if (exists === null) return 'default';
    return exists ? 'success' : 'error';
  };

  return (
    <Paper sx={{ p: 2, mb: 2, background: '#f8f9fa', border: '1px solid #dee2e6' }}>
      <Typography variant="h6" sx={{ mb: 2, color: '#495057' }}>
        🔍 Debug - État de la Gestion du Brouillon
      </Typography>
      
      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 2 }}>
        <Box>
          <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
            Statut de Vérification
          </Typography>
          <Chip 
            label={draftCheckStatus} 
            color={getStatusColor(draftCheckStatus)}
            size="small"
          />
        </Box>
        
        <Box>
          <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
            Brouillon Existe
          </Typography>
          <Chip 
            label={draftExists === null ? 'Non vérifié' : (draftExists ? 'OUI' : 'NON')} 
            color={getDraftExistsColor(draftExists)}
            size="small"
          />
        </Box>
        
        <Box>
          <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
            ID Original (draftId)
          </Typography>
          <Typography variant="body2" sx={{ fontFamily: 'monospace', fontSize: '0.8em' }}>
            {draftId || 'Non défini'}
          </Typography>
        </Box>
        
        <Box>
          <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
            ID Actuel (currentDraftId)
          </Typography>
          <Typography variant="body2" sx={{ fontFamily: 'monospace', fontSize: '0.8em' }}>
            {currentDraftId || 'Non défini'}
          </Typography>
        </Box>
      </Box>
      
      <Box sx={{ mt: 2, p: 1, background: '#e9ecef', borderRadius: 1 }}>
        <Typography variant="caption" sx={{ color: '#6c757d' }}>
          <strong>Logique :</strong> 
          {draftExists === null 
            ? ' Premier appel - Vérification via API requise' 
            : draftExists 
              ? ' Brouillon existe - Utilisation PUT' 
              : ' Brouillon n\'existe pas - Utilisation POST'
          }
        </Typography>
      </Box>
      
      {currentDraftId && currentDraftId !== draftId && (
        <Box sx={{ mt: 2, p: 1, background: '#fff3cd', borderRadius: 1, border: '1px solid #ffc107' }}>
          <Typography variant="caption" sx={{ color: '#856404' }}>
            🔄 <strong>Changement d'ID détecté :</strong> {draftId} → {currentDraftId}
          </Typography>
        </Box>
      )}
    </Paper>
  );
};

export default DraftStateDebugger;
