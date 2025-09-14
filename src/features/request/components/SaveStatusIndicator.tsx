import React from 'react';
import {
  Box,
  Typography,
  Chip,
  Tooltip,
  LinearProgress
} from '@mui/material';
import {
  CloudDone as CloudDoneIcon,
  CloudOff as CloudOffIcon,
  Schedule as ScheduleIcon,
  Error as ErrorIcon,
  CheckCircle as CheckCircleIcon
} from '@mui/icons-material';

interface SaveStatusIndicatorProps {
  // État de la sauvegarde automatique
  isAutoSaving: boolean;
  lastAutoSavedAt: Date | null;
  autoSaveError: string | null;
  
  // État de la sauvegarde manuelle
  isManualSaving: boolean;
  lastManualSavedAt: Date | null;
  manualSaveError: string | null;
  
  // État général
  isDirty: boolean;
  hasUnsavedChanges: boolean;
}

export const SaveStatusIndicator: React.FC<SaveStatusIndicatorProps> = ({
  isAutoSaving,
  lastAutoSavedAt,
  autoSaveError,
  isManualSaving,
  lastManualSavedAt,
  manualSaveError,
  isDirty,
  hasUnsavedChanges
}) => {
  // Formater la date
  const formatDate = (date: Date | null) => {
    if (!date) return 'Jamais';
    
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    
    if (minutes < 1) return 'À l\'instant';
    if (minutes < 60) return `Il y a ${minutes} min`;
    if (hours < 24) return `Il y a ${hours}h`;
    if (days < 7) return `Il y a ${days}j`;
    
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Obtenir le statut de sauvegarde automatique
  const getAutoSaveStatus = () => {
    if (isAutoSaving) {
      return {
        label: 'Sauvegarde automatique...',
        color: 'info' as const,
        icon: <ScheduleIcon sx={{ fontSize: 16 }} />
      };
    }
    
    if (autoSaveError) {
      return {
        label: 'Erreur sauvegarde auto',
        color: 'error' as const,
        icon: <ErrorIcon sx={{ fontSize: 16 }} />
      };
    }
    
    if (lastAutoSavedAt) {
      return {
        label: `Auto: ${formatDate(lastAutoSavedAt)}`,
        color: 'success' as const,
        icon: <CloudDoneIcon sx={{ fontSize: 16 }} />
      };
    }
    
    return {
      label: 'Pas de sauvegarde auto',
      color: 'default' as const,
      icon: <CloudOffIcon sx={{ fontSize: 16 }} />
    };
  };

  // Obtenir le statut de sauvegarde manuelle
  const getManualSaveStatus = () => {
    if (isManualSaving) {
      return {
        label: 'Sauvegarde manuelle...',
        color: 'info' as const,
        icon: <ScheduleIcon sx={{ fontSize: 16 }} />
      };
    }
    
    if (manualSaveError) {
      return {
        label: 'Erreur sauvegarde manuelle',
        color: 'error' as const,
        icon: <ErrorIcon sx={{ fontSize: 16 }} />
      };
    }
    
    if (lastManualSavedAt) {
      return {
        label: `Manuel: ${formatDate(lastManualSavedAt)}`,
        color: 'success' as const,
        icon: <CheckCircleIcon sx={{ fontSize: 16 }} />
      };
    }
    
    return {
      label: 'Pas de sauvegarde manuelle',
      color: 'default' as const,
      icon: <CloudOffIcon sx={{ fontSize: 16 }} />
    };
  };

  // Obtenir le statut général
  const getGeneralStatus = () => {
    if (isAutoSaving || isManualSaving) {
      return {
        label: 'Sauvegarde en cours...',
        color: 'info' as const,
        showProgress: true
      };
    }
    
    if (autoSaveError || manualSaveError) {
      return {
        label: 'Erreur de sauvegarde',
        color: 'error' as const,
        showProgress: false
      };
    }
    
    if (hasUnsavedChanges) {
      return {
        label: 'Modifications non sauvegardées',
        color: 'warning' as const,
        showProgress: false
      };
    }
    
    if (lastAutoSavedAt || lastManualSavedAt) {
      return {
        label: 'Tout est sauvegardé',
        color: 'success' as const,
        showProgress: false
      };
    }
    
    return {
      label: 'Aucune sauvegarde',
      color: 'default' as const,
      showProgress: false
    };
  };

  const autoSaveStatus = getAutoSaveStatus();
  const manualSaveStatus = getManualSaveStatus();
  const generalStatus = getGeneralStatus();

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
      {/* Statut général */}
      <Tooltip title={generalStatus.label}>
        <Chip
          label={generalStatus.label}
          color={generalStatus.color}
          size="small"
          variant="outlined"
          sx={{ minWidth: 'fit-content' }}
        />
      </Tooltip>

      {/* Barre de progression si sauvegarde en cours */}
      {generalStatus.showProgress && (
        <Box sx={{ width: 100 }}>
          <LinearProgress size="small" />
        </Box>
      )}

      {/* Statut de sauvegarde automatique */}
      <Tooltip title={`Sauvegarde automatique (local uniquement): ${autoSaveStatus.label}`}>
        <Chip
          label={autoSaveStatus.label}
          color={autoSaveStatus.color}
          size="small"
          variant="outlined"
          icon={autoSaveStatus.icon}
          sx={{ minWidth: 'fit-content' }}
        />
      </Tooltip>

      {/* Statut de sauvegarde manuelle */}
      <Tooltip title={`Sauvegarde manuelle (local + BD): ${manualSaveStatus.label}`}>
        <Chip
          label={manualSaveStatus.label}
          color={manualSaveStatus.color}
          size="small"
          variant="outlined"
          icon={manualSaveStatus.icon}
          sx={{ minWidth: 'fit-content' }}
        />
      </Tooltip>

      {/* Indicateur de modifications */}
      {isDirty && (
        <Tooltip title="Le brouillon a été modifié">
          <Chip
            label="Modifié"
            color="warning"
            size="small"
            variant="filled"
            sx={{ minWidth: 'fit-content' }}
          />
        </Tooltip>
      )}
    </Box>
  );
};
