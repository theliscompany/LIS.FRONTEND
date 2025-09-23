import React from 'react';
import {
  Box,
  Typography,
  Button,
  Alert,
  CircularProgress,
  Chip,
  IconButton,
  Tooltip,
  Card,
  CardContent,
  CardActions,
  Divider
} from '@mui/material';
import {
  Save,
  Refresh,
  Warning,
  CheckCircle,
  Error,
  Info,
  CloudSync,
  CloudDone,
  CloudOff
} from '@mui/icons-material';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';

interface WizardSyncStatusProps {
  isDirty: boolean;
  isSaving: boolean;
  lastSavedAt: Date | null;
  saveError: string | null;
  draftId?: string | null;
  onManualSave: () => void;
  onManualRestore?: () => void;
  onRefresh?: () => void;
  className?: string;
}

export const WizardSyncStatusV3: React.FC<WizardSyncStatusProps> = ({
  isDirty,
  isSaving,
  lastSavedAt,
  saveError,
  draftId,
  onManualSave,
  onManualRestore,
  onRefresh,
  className
}) => {
  const getStatusIcon = () => {
    if (isSaving) {
      return <CircularProgress size={16} />;
    }
    
    if (saveError) {
      return <Error color="error" />;
    }
    
    if (isDirty) {
      return <Warning color="warning" />;
    }
    
    if (lastSavedAt) {
      return <CheckCircle color="success" />;
    }
    
    return <Info color="info" />;
  };

  const getStatusText = () => {
    if (isSaving) {
      return 'Sauvegarde en cours...';
    }
    
    if (saveError) {
      return 'Erreur de sauvegarde';
    }
    
    if (isDirty) {
      return 'Modifications non sauvegardées';
    }
    
    if (lastSavedAt) {
      return 'Sauvegardé';
    }
    
    return 'Prêt';
  };

  const getStatusColor = () => {
    if (isSaving) {
      return 'info';
    }
    
    if (saveError) {
      return 'error';
    }
    
    if (isDirty) {
      return 'warning';
    }
    
    if (lastSavedAt) {
      return 'success';
    }
    
    return 'default';
  };

  const getSyncIcon = () => {
    if (isSaving) {
      return <CloudSync />;
    }
    
    if (saveError) {
      return <CloudOff color="error" />;
    }
    
    if (lastSavedAt) {
      return <CloudDone color="success" />;
    }
    
    return <CloudSync color="action" />;
  };

  return (
    <Card 
      className={className}
      sx={{ 
        mb: 2,
        border: 1,
        borderColor: 'grey.200',
        borderRadius: 2,
        boxShadow: 'none'
      }}
    >
      <CardContent sx={{ pb: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {getSyncIcon()}
            <Typography variant="h6" component="h3">
              Statut de Synchronisation
            </Typography>
            <Chip
              icon={getStatusIcon()}
              label={getStatusText()}
              color={getStatusColor() as any}
              size="small"
              variant={isDirty ? 'outlined' : 'filled'}
            />
          </Box>
          
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {draftId && (
              <Chip
                label={`Brouillon #${draftId}`}
                size="small"
                variant="outlined"
                color="primary"
              />
            )}
            
            {onRefresh && (
              <Tooltip title="Actualiser">
                <IconButton size="small" onClick={onRefresh}>
                  <Refresh />
                </IconButton>
              </Tooltip>
            )}
          </Box>
        </Box>

        <Divider sx={{ my: 1 }} />

        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box>
            {lastSavedAt && (
              <Typography variant="body2" color="text.secondary">
                Dernière sauvegarde: {formatDistanceToNow(lastSavedAt, { 
                  addSuffix: true, 
                  locale: fr 
                })}
              </Typography>
            )}
            
            {saveError && (
              <Typography variant="body2" color="error">
                Erreur: {saveError}
              </Typography>
            )}
            
            {!lastSavedAt && !saveError && (
              <Typography variant="body2" color="text.secondary">
                Aucune sauvegarde effectuée
              </Typography>
            )}
          </Box>
        </Box>
      </CardContent>

      <CardActions sx={{ pt: 0, px: 2, pb: 2 }}>
        <Box sx={{ display: 'flex', gap: 1, width: '100%' }}>
          <Button
            variant="contained"
            startIcon={<Save />}
            onClick={onManualSave}
            disabled={isSaving || !isDirty}
            size="small"
            sx={{ flex: 1 }}
          >
            {isSaving ? 'Sauvegarde...' : 'Sauvegarder'}
          </Button>
          
          {onManualRestore && (
            <Button
              variant="outlined"
              onClick={onManualRestore}
              disabled={isSaving}
              size="small"
            >
              Restaurer
            </Button>
          )}
        </Box>
      </CardActions>

      {/* Status Alerts */}
      {isDirty && !isSaving && (
        <Alert 
          severity="warning" 
          sx={{ 
            mx: 2, 
            mb: 2, 
            '& .MuiAlert-message': { 
              display: 'flex', 
              alignItems: 'center', 
              gap: 1 
            } 
          }}
        >
          <Warning fontSize="small" />
          Vous avez des modifications non sauvegardées. 
          Elles seront sauvegardées automatiquement dans quelques secondes.
        </Alert>
      )}

      {saveError && (
        <Alert 
          severity="error" 
          sx={{ 
            mx: 2, 
            mb: 2, 
            '& .MuiAlert-message': { 
              display: 'flex', 
              alignItems: 'center', 
              gap: 1 
            } 
          }}
        >
          <Error fontSize="small" />
          Erreur lors de la sauvegarde. 
          Vos modifications sont conservées localement.
        </Alert>
      )}

      {isSaving && (
        <Alert 
          severity="info" 
          sx={{ 
            mx: 2, 
            mb: 2, 
            '& .MuiAlert-message': { 
              display: 'flex', 
              alignItems: 'center', 
              gap: 1 
            } 
          }}
        >
          <CircularProgress size={16} sx={{ mr: 1 }} />
          Sauvegarde en cours...
        </Alert>
      )}
    </Card>
  );
};

export default WizardSyncStatusV3;
