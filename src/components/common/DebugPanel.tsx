import React from 'react';
import { Box, Paper, Typography, Chip, IconButton, Collapse } from '@mui/material';
import { ExpandMore, ExpandLess, Refresh } from '@mui/icons-material';

interface DebugPanelProps {
  isOpen: boolean;
  onToggle: () => void;
  debugInfo: {
    autoSaveEnabled: boolean;
    isSaving: boolean;
    draftId: string | null;
    lastSaved: Date | null;
    currentStep: number;
    savedOptionsCount: number;
    hasRequestData: boolean;
    hasStep1: boolean;
  };
  onRefresh: () => void;
}

const DebugPanel: React.FC<DebugPanelProps> = ({ 
  isOpen, 
  onToggle, 
  debugInfo, 
  onRefresh 
}) => {
  return (
    <Box sx={{ position: 'fixed', bottom: 20, left: 20, zIndex: 1000 }}>
      <Paper 
        elevation={8} 
        sx={{ 
          p: 2, 
          minWidth: 300,
          background: 'rgba(0,0,0,0.9)',
          color: 'white',
          borderRadius: 2
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
          <Typography variant="h6" sx={{ color: 'white', fontWeight: 'bold' }}>
            🐛 Debug Sauvegarde
          </Typography>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <IconButton 
              size="small" 
              onClick={onRefresh}
              sx={{ color: 'white' }}
            >
              <Refresh fontSize="small" />
            </IconButton>
            <IconButton 
              size="small" 
              onClick={onToggle}
              sx={{ color: 'white' }}
            >
              {isOpen ? <ExpandLess /> : <ExpandMore />}
            </IconButton>
          </Box>
        </Box>
        
        <Collapse in={isOpen}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="body2">Auto-save:</Typography>
              <Chip 
                label={debugInfo.autoSaveEnabled ? 'Activé' : 'Désactivé'}
                color={debugInfo.autoSaveEnabled ? 'success' : 'error'}
                size="small"
              />
            </Box>
            
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="body2">Sauvegarde:</Typography>
              <Chip 
                label={debugInfo.isSaving ? 'En cours...' : 'Prêt'}
                color={debugInfo.isSaving ? 'warning' : 'success'}
                size="small"
              />
            </Box>
            
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="body2">Draft ID:</Typography>
              <Typography variant="body2" sx={{ color: 'yellow' }}>
                {debugInfo.draftId || 'Aucun'}
              </Typography>
            </Box>
            
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="body2">Étape:</Typography>
              <Typography variant="body2" sx={{ color: 'cyan' }}>
                {debugInfo.currentStep}/7
              </Typography>
            </Box>
            
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="body2">Options:</Typography>
              <Typography variant="body2" sx={{ color: 'lime' }}>
                {debugInfo.savedOptionsCount}
              </Typography>
            </Box>
            
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="body2">Demande:</Typography>
              <Chip 
                label={debugInfo.hasRequestData ? 'Oui' : 'Non'}
                color={debugInfo.hasRequestData ? 'success' : 'error'}
                size="small"
              />
            </Box>
            
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="body2">Step 1:</Typography>
              <Chip 
                label={debugInfo.hasStep1 ? 'Oui' : 'Non'}
                color={debugInfo.hasStep1 ? 'success' : 'error'}
                size="small"
              />
            </Box>
            
            {debugInfo.lastSaved && (
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="body2">Dernière sauvegarde:</Typography>
                <Typography variant="caption" sx={{ color: 'orange' }}>
                  {debugInfo.lastSaved.toLocaleTimeString()}
                </Typography>
              </Box>
            )}
          </Box>
        </Collapse>
      </Paper>
    </Box>
  );
};

export default DebugPanel; 