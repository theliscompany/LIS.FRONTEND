import React, { useState } from 'react';
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
  Settings as SettingsIcon
} from '@mui/icons-material';
import { SyncStatus } from '../hooks/useDraftSyncManager';

interface AdvancedSyncStatusProps {
  syncStatus: SyncStatus;
  onManualSync: (direction?: 'from-db' | 'to-db' | 'both') => Promise<void>;
  onResolveConflict: (resolution: 'db-wins' | 'local-wins') => void;
  onRefresh: () => void;
}

export const AdvancedSyncStatus: React.FC<AdvancedSyncStatusProps> = ({
  syncStatus,
  onManualSync,
  onResolveConflict,
  onRefresh
}) => {
  const [expanded, setExpanded] = useState(false);
  const [showConflictResolution, setShowConflictResolution] = useState(false);

  // === CALCULS POUR L'AFFICHAGE ===
  const getStatusColor = () => {
    if (syncStatus.syncErrors.length > 0) return 'error';
    if (syncStatus.isSyncing) return 'warning';
    if (syncStatus.hasPendingChanges) return 'info';
    return 'success';
  };

  const getStatusIcon = () => {
    if (syncStatus.syncErrors.length > 0) return <ErrorIcon />;
    if (syncStatus.isSyncing) return <CircularProgress size={20} />;
    if (syncStatus.hasPendingChanges) return <WarningIcon />;
    return <CheckCircleIcon />;
  };

  const getStatusText = () => {
    if (syncStatus.syncErrors.length > 0) return 'Erreurs de synchronisation';
    if (syncStatus.isSyncing) return 'Synchronisation en cours...';
    if (syncStatus.hasPendingChanges) return 'Changements en attente';
    return 'Synchronisé';
  };

  const getLastSyncText = () => {
    if (!syncStatus.lastSyncAt) return 'Jamais synchronisé';
    
    const now = new Date();
    const diff = now.getTime() - syncStatus.lastSyncAt.getTime();
    const minutes = Math.floor(diff / 60000);
    
    if (minutes < 1) return 'À l\'instant';
    if (minutes < 60) return `Il y a ${minutes} min`;
    
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `Il y a ${hours}h`;
    
    const days = Math.floor(hours / 24);
    return `Il y a ${days}j`;
  };

  const getDirectionIcon = () => {
    switch (syncStatus.lastSyncDirection) {
      case 'db-to-local':
        return <CloudDownloadIcon fontSize="small" />;
      case 'local-to-db':
        return <CloudUploadIcon fontSize="small" />;
      default:
        return null;
    }
  };

  const getDirectionText = () => {
    switch (syncStatus.lastSyncDirection) {
      case 'db-to-local':
        return 'BD → Local';
      case 'local-to-db':
        return 'Local → BD';
      default:
        return 'Aucune';
    }
  };

  // === GESTION DES ACTIONS ===
  const handleManualSync = async (direction: 'from-db' | 'to-db' | 'both') => {
    try {
      await onManualSync(direction);
    } catch (error) {
      console.error('Erreur lors de la synchronisation manuelle:', error);
    }
  };

  const handleConflictResolution = (resolution: 'db-wins' | 'local-wins') => {
    onResolveConflict(resolution);
    setShowConflictResolution(false);
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
            Statut de Synchronisation
          </Typography>
        </Box>
        
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Tooltip title="Actualiser">
            <IconButton
              size="small"
              onClick={onRefresh}
              disabled={syncStatus.isSyncing}
              sx={{ color: 'inherit' }}
            >
              <RefreshIcon />
            </IconButton>
          </Tooltip>
          
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
            label={syncStatus.isNew ? 'Nouveau' : `ID: ${syncStatus.draftId?.slice(0, 8)}...`}
            size="small"
            variant="outlined"
            color={syncStatus.isNew ? 'primary' : 'default'}
          />
        </Box>

        {/* Dernière synchronisation */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
          <Typography variant="caption" color="text.secondary">
            Dernière sync: {getLastSyncText()}
          </Typography>
          {getDirectionIcon() && (
            <Tooltip title={getDirectionText()}>
              <Box>{getDirectionIcon()}</Box>
            </Tooltip>
          )}
        </Box>

        {/* Boutons de synchronisation manuelle */}
        <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
          <Button
            size="small"
            variant="outlined"
            startIcon={<CloudDownloadIcon />}
            onClick={() => handleManualSync('from-db')}
            disabled={syncStatus.isSyncing || !syncStatus.draftId}
            sx={{ flex: 1 }}
          >
            BD → Local
          </Button>
          
          <Button
            size="small"
            variant="outlined"
            startIcon={<CloudUploadIcon />}
            onClick={() => handleManualSync('to-db')}
            disabled={syncStatus.isSyncing}
            sx={{ flex: 1 }}
          >
            Local → BD
          </Button>
        </Box>

        {/* Synchronisation complète */}
        <Button
          fullWidth
          size="small"
          variant="contained"
          startIcon={<SyncIcon />}
          onClick={() => handleManualSync('both')}
          disabled={syncStatus.isSyncing}
          sx={{ mb: 2 }}
        >
          Synchronisation Complète
        </Button>

        {/* === CONTENU DÉVELOPPÉ === */}
        <Collapse in={expanded}>
          <Divider sx={{ my: 2 }} />
          
          {/* Changements en attente */}
          {syncStatus.hasPendingChanges && (
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle2" color="info.main" gutterBottom>
                Changements en attente ({syncStatus.pendingChanges.length})
              </Typography>
              <List dense>
                {syncStatus.pendingChanges.map((change, index) => (
                  <ListItem key={index} sx={{ py: 0.5 }}>
                    <ListItemIcon sx={{ minWidth: 32 }}>
                      <WarningIcon fontSize="small" color="warning" />
                    </ListItemIcon>
                    <ListItemText
                      primary={change}
                      primaryTypographyProps={{ variant: 'caption' }}
                    />
                  </ListItem>
                ))}
              </List>
            </Box>
          )}

          {/* Erreurs de synchronisation */}
          {syncStatus.syncErrors.length > 0 && (
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle2" color="error.main" gutterBottom>
                Erreurs ({syncStatus.syncErrors.length})
              </Typography>
              <List dense>
                {syncStatus.syncErrors.map((error, index) => (
                  <ListItem key={index} sx={{ py: 0.5 }}>
                    <ListItemIcon sx={{ minWidth: 32 }}>
                      <ErrorIcon fontSize="small" color="error" />
                    </ListItemIcon>
                    <ListItemText
                      primary={error}
                      primaryTypographyProps={{ variant: 'caption' }}
                    />
                  </ListItem>
                ))}
              </List>
              
              {/* Résolution de conflits */}
              {syncStatus.syncErrors.some(e => e.includes('Conflit')) && (
                <Box sx={{ mt: 2 }}>
                  <Button
                    size="small"
                    variant="outlined"
                    color="warning"
                    onClick={() => setShowConflictResolution(!showConflictResolution)}
                    startIcon={<SettingsIcon />}
                  >
                    Résoudre les Conflits
                  </Button>
                  
                  <Collapse in={showConflictResolution}>
                    <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
                      <Button
                        size="small"
                        variant="contained"
                        color="primary"
                        onClick={() => handleConflictResolution('db-wins')}
                        sx={{ flex: 1 }}
                      >
                        BD Gagne
                      </Button>
                      <Button
                        size="small"
                        variant="contained"
                        color="secondary"
                        onClick={() => handleConflictResolution('local-wins')}
                        sx={{ flex: 1 }}
                      >
                        Local Gagne
                      </Button>
                    </Box>
                  </Collapse>
                </Box>
              )}
            </Box>
          )}

          {/* Informations détaillées */}
          <Box>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              Informations détaillées
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
              <Typography variant="caption" color="text.secondary">
                • ID du brouillon: {syncStatus.draftId || 'Non défini'}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                • Nouveau: {syncStatus.isNew ? 'Oui' : 'Non'}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                • Synchronisation: {syncStatus.isSyncing ? 'En cours' : 'Idle'}
              </Typography>
            </Box>
          </Box>
        </Collapse>
      </Box>
    </Box>
  );
};
