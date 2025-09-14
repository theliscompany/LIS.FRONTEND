import React from 'react';
import { 
  Box, 
  Chip, 
  Typography, 
  CircularProgress, 
  Tooltip,
  IconButton,
  Alert
} from '@mui/material';
import { 
  Save as SaveIcon, 
  Sync as SyncIcon, 
  CheckCircle as CheckIcon,
  Warning as WarningIcon,
  Error as ErrorIcon
} from '@mui/icons-material';

interface DraftSyncStatusProps {
  syncStatus: {
    hasPendingChanges: boolean;
    pendingChanges: string[];
    isSaving: boolean;
    lastSavedAt: Date | null;
    draftId: string | null;
    isNew: boolean;
  };
  onManualSave: () => void;
}

export const DraftSyncStatus: React.FC<DraftSyncStatusProps> = ({ 
  syncStatus, 
  onManualSave 
}) => {
  const {
    hasPendingChanges,
    pendingChanges,
    isSaving,
    lastSavedAt,
    draftId,
    isNew
  } = syncStatus;

  // === CALCUL DU STATUT ===
  const getStatusColor = () => {
    if (isSaving) return 'info';
    if (hasPendingChanges) return 'warning';
    if (lastSavedAt) return 'success';
    return 'default';
  };

  const getStatusIcon = () => {
    if (isSaving) return <CircularProgress size={16} />;
    if (hasPendingChanges) return <WarningIcon />;
    if (lastSavedAt) return <CheckIcon />;
    return <SyncIcon />;
  };

  const getStatusText = () => {
    if (isSaving) return 'Sauvegarde...';
    if (hasPendingChanges) return 'Modifications en attente';
    if (lastSavedAt) return 'Synchronisé';
    return 'Non synchronisé';
  };

  const getLastSavedText = () => {
    if (!lastSavedAt) return 'Jamais sauvegardé';
    
    const now = new Date();
    const diffMs = now.getTime() - lastSavedAt.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    
    if (diffMins < 1) return 'À l\'instant';
    if (diffMins < 60) return `Il y a ${diffMins} min`;
    
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `Il y a ${diffHours}h`;
    
    const diffDays = Math.floor(diffHours / 24);
    return `Il y a ${diffDays}j`;
  };

  return (
    <Box sx={{ 
      display: 'flex', 
      alignItems: 'center', 
      gap: 1,
      p: 1,
      border: 1,
      borderColor: 'divider',
      borderRadius: 1,
      bgcolor: 'background.paper'
    }}>
      {/* === STATUT PRINCIPAL === */}
      <Chip
        icon={getStatusIcon()}
        label={getStatusText()}
        color={getStatusColor()}
        size="small"
        variant="outlined"
      />

      {/* === ID DU BROUILLON === */}
      {draftId && (
        <Chip
          label={`ID: ${draftId.slice(0, 8)}...`}
          size="small"
          variant="outlined"
          color="primary"
        />
      )}

      {/* === TYPE DE BROUILLON === */}
      <Chip
        label={isNew ? 'Nouveau' : 'Existant'}
        size="small"
        variant="outlined"
        color={isNew ? 'secondary' : 'primary'}
      />

      {/* === DERNIÈRE SAUVEGARDE === */}
      <Typography variant="caption" color="text.secondary">
        {getLastSavedText()}
      </Typography>

      {/* === BOUTON DE SAUVEGARDE MANUELLE === */}
      <Tooltip title="Sauvegarder maintenant">
        <IconButton
          size="small"
          onClick={onManualSave}
          disabled={isSaving || !hasPendingChanges}
          color="primary"
        >
          <SaveIcon />
        </IconButton>
      </Tooltip>

      {/* === ALERTE SI MODIFICATIONS EN ATTENTE === */}
      {hasPendingChanges && (
        <Alert 
          severity="warning" 
          sx={{ ml: 1, py: 0 }}
          action={
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography variant="caption">
                {pendingChanges.length} changement(s)
              </Typography>
              <Chip
                label="Sauvegarder"
                size="small"
                onClick={onManualSave}
                disabled={isSaving}
                color="warning"
              />
            </Box>
          }
        >
          Modifications non sauvegardées
        </Alert>
      )}

      {/* === DÉTAILS DES CHANGEMENTS EN ATTENTE === */}
      {hasPendingChanges && pendingChanges.length > 0 && (
        <Box sx={{ ml: 2 }}>
          <Typography variant="caption" color="text.secondary">
            Changements: {pendingChanges.join(', ')}
          </Typography>
        </Box>
      )}
    </Box>
  );
};
