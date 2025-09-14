import React from 'react';
import {
  Box,
  Typography,
  Chip,
  IconButton,
  Tooltip,
  Collapse,
  Alert,
  Button,
  CircularProgress,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon
} from '@mui/material';
import {
  Sync as SyncIcon,
  CloudDownload as CloudDownloadIcon,
  CloudUpload as CloudUploadIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  Refresh as RefreshIcon,
  Settings as SettingsIcon,
  Save as SaveIcon,
  RestoreFromTrash as RestoreIcon
} from '@mui/icons-material';

interface WizardSyncStatusProps {
  isDirty: boolean;
  isSaving: boolean;
  lastSavedAt: Date | null;
  saveError: string | null;
  draftId?: string | null;
  onManualSave: () => Promise<void>;
  onManualRestore?: () => Promise<void>;
  onRefresh?: () => void;
}

export const WizardSyncStatus: React.FC<WizardSyncStatusProps> = ({
  isDirty,
  isSaving,
  lastSavedAt,
  saveError,
  draftId,
  onManualSave,
  onManualRestore,
  onRefresh
}) => {
  const [expanded, setExpanded] = React.useState(false);

  // === CALCULS POUR L'AFFICHAGE ===
  const getStatusColor = () => {
    if (saveError) return 'error';
    if (isSaving) return 'warning';
    if (isDirty) return 'info';
    return 'success';
  };

  const getStatusIcon = () => {
    if (saveError) return <ErrorIcon />;
    if (isSaving) return <CircularProgress size={20} />;
    if (isDirty) return <WarningIcon />;
    return <CheckCircleIcon />;
  };

  const getStatusText = () => {
    if (saveError) return 'Erreur de sauvegarde';
    if (isSaving) return 'Sauvegarde en cours...';
    if (isDirty) return 'Modifications non sauvegardées';
    return 'Synchronisé';
  };

  const getLastSavedText = () => {
    if (!lastSavedAt) return 'Jamais sauvegardé';
    
    const now = new Date();
    const diff = now.getTime() - lastSavedAt.getTime();
    const minutes = Math.floor(diff / 60000);
    
    if (minutes < 1) return 'À l\'instant';
    if (minutes < 60) return `Il y a ${minutes} min`;
    
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `Il y a ${hours}h`;
    
    const days = Math.floor(hours / 24);
    return `Il y a ${days}j`;
  };

  // === GESTION DES ACTIONS ===
  const handleManualSave = async () => {
    try {
      await onManualSave();
    } catch (error) {
      console.error('Erreur lors de la sauvegarde manuelle:', error);
    }
  };

  const handleManualRestore = async () => {
    if (onManualRestore) {
      try {
        await onManualRestore();
      } catch (error) {
        console.error('Erreur lors de la restauration manuelle:', error);
      }
    }
  };

  return (
    <Box
      sx={{
        position: 'fixed',
        top: 20,
        right: 20,
        zIndex: 1000,
        minWidth: 320,
        maxWidth: 400,
        backgroundColor: 'background.paper',
        borderRadius: 2,
        boxShadow: 3,
        border: `2px solid ${getStatusColor() === 'error' ? 'error.main' : 'primary.main'}`,
        overflow: 'hidden'
      }}
    >
      {/* === EN-TÊTE === */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          p: 2,
          backgroundColor: `${getStatusColor()}.light`,
          color: `${getStatusColor()}.contrastText`
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {getStatusIcon()}
          <Typography variant="subtitle2" fontWeight="bold">
            Statut du Wizard
          </Typography>
        </Box>
        
        <Box sx={{ display: 'flex', gap: 1 }}>
          {onRefresh && (
            <Tooltip title="Actualiser">
              <IconButton
                size="small"
                onClick={onRefresh}
                disabled={isSaving}
                sx={{ color: 'inherit' }}
              >
                <RefreshIcon />
              </IconButton>
            </Tooltip>
          )}
          
          <Tooltip title={expanded ? 'Réduire' : 'Développer'}>
            <IconButton
              size="small"
              onClick={() => setExpanded(!expanded)}
              sx={{ color: 'inherit' }}
            >
              {expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      {/* === CONTENU PRINCIPAL === */}
      <Box sx={{ p: 2 }}>
        {/* Statut principal */}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
          <Typography variant="body2" color="text.secondary">
            {getStatusText()}
          </Typography>
          <Chip
            label={draftId ? `ID: ${draftId.slice(0, 8)}...` : 'Nouveau'}
            size="small"
            variant="outlined"
            color={draftId ? 'default' : 'primary'}
          />
        </Box>

        {/* Dernière sauvegarde */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
          <Typography variant="caption" color="text.secondary">
            Dernière sauvegarde: {getLastSavedText()}
          </Typography>
        </Box>

        {/* Boutons d'action */}
        <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
          <Button
            size="small"
            variant="outlined"
            startIcon={<SaveIcon />}
            onClick={handleManualSave}
            disabled={isSaving || !isDirty}
            sx={{ flex: 1 }}
          >
            Sauvegarder
          </Button>
          
          {onManualRestore && (
            <Button
              size="small"
              variant="outlined"
              startIcon={<RestoreIcon />}
              onClick={handleManualRestore}
              disabled={isSaving}
              sx={{ flex: 1 }}
            >
              Restaurer
            </Button>
          )}
        </Box>

        {/* === CONTENU DÉVELOPPÉ === */}
        <Collapse in={expanded}>
          <Divider sx={{ my: 2 }} />
          
          {/* Modifications en attente */}
          {isDirty && (
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle2" color="info.main" gutterBottom>
                Modifications en attente
              </Typography>
              <Alert severity="info" sx={{ py: 0 }}>
                Le brouillon contient des modifications non sauvegardées.
              </Alert>
            </Box>
          )}

          {/* Erreurs de sauvegarde */}
          {saveError && (
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle2" color="error.main" gutterBottom>
                Erreur de sauvegarde
              </Typography>
              <Alert severity="error" sx={{ py: 0 }}>
                {saveError}
              </Alert>
            </Box>
          )}

          {/* Informations détaillées */}
          <Box>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              Informations détaillées
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
              <Typography variant="caption" color="text.secondary">
                • ID du brouillon: {draftId || 'Non défini'}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                • Modifications: {isDirty ? 'Oui' : 'Non'}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                • Sauvegarde: {isSaving ? 'En cours' : 'Idle'}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                • Dernière sauvegarde: {lastSavedAt ? lastSavedAt.toLocaleString() : 'Jamais'}
              </Typography>
            </Box>
          </Box>
        </Collapse>
      </Box>
    </Box>
  );
};
