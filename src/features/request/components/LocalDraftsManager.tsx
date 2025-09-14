import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Typography,
  Box,
  Chip,
  Divider,
  Alert
} from '@mui/material';
import {
  Delete as DeleteIcon,
  CloudDownload as CloudDownloadIcon,
  Storage as StorageIcon,
  Schedule as ScheduleIcon
} from '@mui/icons-material';
import { LocalStorageService } from '../services/LocalStorageService';
import { DraftQuote } from '../types/DraftQuote';

interface LocalDraftsManagerProps {
  open: boolean;
  onClose: () => void;
  onLoadDraft: (draft: DraftQuote) => void;
  onDeleteDraft: (draftId: string) => void;
}

interface LocalDraft {
  key: string;
  draftId: string | null;
  timestamp: string;
  title: string;
}

export const LocalDraftsManager: React.FC<LocalDraftsManagerProps> = ({
  open,
  onClose,
  onLoadDraft,
  onDeleteDraft
}) => {
  const [localDrafts, setLocalDrafts] = useState<LocalDraft[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Charger la liste des brouillons locaux
  const loadLocalDrafts = () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const drafts = LocalStorageService.listLocalDrafts();
      setLocalDrafts(drafts);
      
      console.log('📋 [LOCAL_DRAFTS] Brouillons locaux chargés:', drafts.length);
    } catch (error) {
      console.error('❌ [LOCAL_DRAFTS] Erreur lors du chargement:', error);
      setError('Erreur lors du chargement des brouillons locaux');
    } finally {
      setIsLoading(false);
    }
  };

  // Charger les brouillons à l'ouverture
  useEffect(() => {
    if (open) {
      loadLocalDrafts();
    }
  }, [open]);

  // Gérer le chargement d'un brouillon
  const handleLoadDraft = (draft: LocalDraft) => {
    try {
      console.log('📥 [LOCAL_DRAFTS] Chargement du brouillon:', draft.key);
      
      const draftData = LocalStorageService.loadDraft(draft.draftId || draft.key);
      if (draftData) {
        onLoadDraft(draftData);
        onClose();
      } else {
        setError('Impossible de charger le brouillon');
      }
    } catch (error) {
      console.error('❌ [LOCAL_DRAFTS] Erreur lors du chargement:', error);
      setError('Erreur lors du chargement du brouillon');
    }
  };

  // Gérer la suppression d'un brouillon
  const handleDeleteDraft = (draft: LocalDraft) => {
    try {
      console.log('🗑️ [LOCAL_DRAFTS] Suppression du brouillon:', draft.key);
      
      if (draft.draftId) {
        LocalStorageService.deleteDraft(draft.draftId);
        onDeleteDraft(draft.draftId);
      }
      
      // Recharger la liste
      loadLocalDrafts();
    } catch (error) {
      console.error('❌ [LOCAL_DRAFTS] Erreur lors de la suppression:', error);
      setError('Erreur lors de la suppression du brouillon');
    }
  };

  // Formater la date
  const formatDate = (timestamp: string) => {
    try {
      const date = new Date(timestamp);
      return date.toLocaleString('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      return 'Date inconnue';
    }
  };

  // Obtenir le type de brouillon
  const getDraftType = (draft: LocalDraft) => {
    if (draft.draftId) {
      return { label: 'Synchronisé', color: 'success' as const };
    } else {
      return { label: 'Local uniquement', color: 'warning' as const };
    }
  };

  // Obtenir la taille du localStorage
  const getStorageInfo = () => {
    try {
      const size = LocalStorageService.getStorageSize();
      const usedMB = (size.used / 1024 / 1024).toFixed(2);
      const availableMB = (size.available / 1024 / 1024).toFixed(2);
      return { used: usedMB, available: availableMB };
    } catch (error) {
      return { used: '0', available: '0' };
    }
  };

  const storageInfo = getStorageInfo();

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: { minHeight: '60vh' }
      }}
    >
      <DialogTitle>
        <Box display="flex" alignItems="center" gap={1}>
          <StorageIcon />
          <Typography variant="h6">Brouillons locaux</Typography>
        </Box>
        <Typography variant="body2" color="text.secondary">
          Gestion des brouillons sauvegardés localement
        </Typography>
      </DialogTitle>

      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {/* Informations sur le stockage */}
        <Box sx={{ mb: 2, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
          <Typography variant="body2" color="text.secondary">
            <strong>Stockage utilisé:</strong> {storageInfo.used} MB / {storageInfo.available} MB disponibles
          </Typography>
        </Box>

        <Divider sx={{ mb: 2 }} />

        {/* Liste des brouillons */}
        {isLoading ? (
          <Typography>Chargement des brouillons...</Typography>
        ) : localDrafts.length === 0 ? (
          <Box textAlign="center" py={4}>
            <StorageIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6" color="text.secondary">
              Aucun brouillon local
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Les brouillons sont automatiquement sauvegardés localement
            </Typography>
          </Box>
        ) : (
          <List>
            {localDrafts.map((draft, index) => {
              const draftType = getDraftType(draft);
              
              return (
                <ListItem
                  key={draft.key}
                  sx={{
                    border: 1,
                    borderColor: 'divider',
                    borderRadius: 1,
                    mb: 1,
                    '&:hover': {
                      bgcolor: 'action.hover'
                    }
                  }}
                >
                  <ListItemText
                    primary={
                      <Box display="flex" alignItems="center" gap={1}>
                        <Typography variant="subtitle1">
                          {draft.title}
                        </Typography>
                        <Chip
                          label={draftType.label}
                          size="small"
                          color={draftType.color}
                          variant="outlined"
                        />
                      </Box>
                    }
                    secondary={
                      <Box>
                        <Typography variant="body2" color="text.secondary">
                          <ScheduleIcon sx={{ fontSize: 16, mr: 0.5, verticalAlign: 'middle' }} />
                          {formatDate(draft.timestamp)}
                        </Typography>
                        {draft.draftId && (
                          <Typography variant="caption" color="text.secondary">
                            ID: {draft.draftId}
                          </Typography>
                        )}
                      </Box>
                    }
                  />
                  
                  <ListItemSecondaryAction>
                    <Box display="flex" gap={1}>
                      <IconButton
                        edge="end"
                        onClick={() => handleLoadDraft(draft)}
                        title="Charger le brouillon"
                        color="primary"
                      >
                        <CloudDownloadIcon />
                      </IconButton>
                      <IconButton
                        edge="end"
                        onClick={() => handleDeleteDraft(draft)}
                        title="Supprimer le brouillon"
                        color="error"
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Box>
                  </ListItemSecondaryAction>
                </ListItem>
              );
            })}
          </List>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>
          Fermer
        </Button>
        <Button
          onClick={loadLocalDrafts}
          variant="outlined"
          disabled={isLoading}
        >
          Actualiser
        </Button>
      </DialogActions>
    </Dialog>
  );
};
