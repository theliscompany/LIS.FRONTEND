import React, { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  ListItemSecondaryAction,
  Chip,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Divider,
  Grid,
  Card,
  CardContent,
  IconButton,
  Tooltip,
  Alert,
  LinearProgress
} from '@mui/material';
import {
  History as HistoryIcon,
  Restore as RestoreIcon,
  Compare as CompareIcon,
  Visibility as ViewIcon,
  Schedule as ScheduleIcon,
  Person as PersonIcon,
  Code as CodeIcon,
  CheckCircle as SuccessIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
  ArrowBack as ArrowBackIcon,
  ArrowForward as ArrowForwardIcon
} from '@mui/icons-material';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  getApiEmailTemplateByIdVersionsOptions,
  postApiEmailTemplateByIdRevertByVersionMutation
} from '../api/@tanstack/react-query.gen';

interface EmailTemplateHistoryProps {
  template: any;
}

const EmailTemplateHistory: React.FC<EmailTemplateHistoryProps> = ({ template }) => {
  const queryClient = useQueryClient();
  const [selectedVersion, setSelectedVersion] = useState<any>(null);
  const [compareDialogOpen, setCompareDialogOpen] = useState(false);
  const [versionToRevert, setVersionToRevert] = useState<any>(null);

  const { data: versions, isLoading } = useQuery(
    getApiEmailTemplateByIdVersionsOptions({ path: { id: template?.id || '' } })
  );

  const revertMutation = useMutation(postApiEmailTemplateByIdRevertByVersionMutation());

  const handleRevert = async (version: any) => {
    if (!template?.id) return;
    
    try {
      await revertMutation.mutateAsync({ 
        path: { id: template.id, version: version.version }
      });
      queryClient.invalidateQueries({ queryKey: ['getApiEmailTemplate'] });
      setVersionToRevert(null);
    } catch (error) {
      console.error('Error reverting version:', error);
    }
  };

  const handleViewVersion = (version: any) => {
    setSelectedVersion(version);
  };

  const handleCompareVersions = () => {
    setCompareDialogOpen(true);
  };

  const getVersionStatusColor = (version: any) => {
    if (version.isCurrent) return 'success';
    if (version.hasErrors) return 'error';
    return 'default';
  };

  const getVersionStatusIcon = (version: any) => {
    if (version.isCurrent) return <SuccessIcon />;
    if (version.hasErrors) return <ErrorIcon />;
    return <HistoryIcon />;
  };

  if (!template) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography variant="h6" color="text.secondary">
          Aucun template sélectionné
        </Typography>
      </Box>
    );
  }

  if (isLoading) {
    return (
      <Box sx={{ p: 3 }}>
        <LinearProgress />
        <Typography variant="body2" sx={{ mt: 2 }}>
          Chargement de l'historique...
        </Typography>
      </Box>
    );
  }

  const templateVersions = versions || [];

  return (
    <Box sx={{ width: '100%' }}>
      {/* Header */}
      <Paper sx={{ p: 3, mb: 3, background: 'linear-gradient(135deg, #f3e5f5 0%, #e8eaf6 100%)' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 600, mb: 1 }}>
              Historique des Versions - {template.name}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {templateVersions.length} versions disponibles
            </Typography>
          </Box>
          <Button
            variant="outlined"
            startIcon={<CompareIcon />}
            onClick={handleCompareVersions}
          >
            Comparer Versions
          </Button>
        </Box>
      </Paper>

      {/* Version List */}
      <Paper sx={{ mb: 3 }}>
        <List>
          {templateVersions.map((version: any, index: number) => (
            <React.Fragment key={version.version}>
              <ListItem 
                sx={{ 
                  backgroundColor: version.isCurrent ? 'rgba(76, 175, 80, 0.1)' : 'transparent',
                  border: version.isCurrent ? '2px solid #4caf50' : '1px solid #e0e0e0',
                  borderRadius: 1,
                  mb: 1,
                  mx: 1
                }}
              >
                <ListItemIcon>
                  <Box sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    color: getVersionStatusColor(version) === 'success' ? 'success.main' : 
                           getVersionStatusColor(version) === 'error' ? 'error.main' : 'text.secondary'
                  }}>
                    {getVersionStatusIcon(version)}
                  </Box>
                </ListItemIcon>
                
                <ListItemText
                  primary={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography variant="h6" sx={{ fontWeight: 600 }}>
                        Version {version.version}
                      </Typography>
                      {version.isCurrent && (
                        <Chip 
                          label="Actuelle" 
                          size="small" 
                          color="success" 
                          variant="outlined"
                        />
                      )}
                      {version.hasErrors && (
                        <Chip 
                          label="Erreurs" 
                          size="small" 
                          color="error" 
                          variant="outlined"
                        />
                      )}
                    </Box>
                  }
                  secondary={
                    <Box>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                        {version.changeDescription || 'Aucune description'}
                      </Typography>
                      <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                        <Chip
                          icon={<PersonIcon />}
                          label={version.author || 'Inconnu'}
                          size="small"
                          variant="outlined"
                        />
                        <Chip
                          icon={<ScheduleIcon />}
                          label={new Date(version.createdAt).toLocaleString()}
                          size="small"
                          variant="outlined"
                        />
                        {version.usageCount > 0 && (
                          <Chip
                            label={`${version.usageCount} utilisations`}
                            size="small"
                            variant="outlined"
                            color="primary"
                          />
                        )}
                      </Box>
                    </Box>
                  }
                />
                
                <ListItemSecondaryAction>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Tooltip title="Voir cette version">
                      <IconButton
                        size="small"
                        onClick={() => handleViewVersion(version)}
                      >
                        <ViewIcon />
                      </IconButton>
                    </Tooltip>
                    {!version.isCurrent && (
                      <Tooltip title="Revenir à cette version">
                        <IconButton
                          size="small"
                          color="warning"
                          onClick={() => setVersionToRevert(version)}
                        >
                          <RestoreIcon />
                        </IconButton>
                      </Tooltip>
                    )}
                  </Box>
                </ListItemSecondaryAction>
              </ListItem>
              
              {index < templateVersions.length - 1 && (
                <Divider sx={{ mx: 2 }} />
              )}
            </React.Fragment>
          ))}
        </List>
      </Paper>

      {/* Version Details Dialog */}
      <Dialog
        open={!!selectedVersion}
        onClose={() => setSelectedVersion(null)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <HistoryIcon />
            Version {selectedVersion?.version} - {selectedVersion?.name}
          </Box>
        </DialogTitle>
        <DialogContent>
          {selectedVersion && (
            <Box>
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <Card sx={{ mb: 2 }}>
                    <CardContent>
                      <Typography variant="h6" sx={{ mb: 2 }}>
                        Informations de la Version
                      </Typography>
                      <Grid container spacing={2}>
                        <Grid item xs={12} md={6}>
                          <Typography variant="body2" color="text.secondary">
                            <strong>Version:</strong> {selectedVersion.version}
                          </Typography>
                        </Grid>
                        <Grid item xs={12} md={6}>
                          <Typography variant="body2" color="text.secondary">
                            <strong>Créée le:</strong> {new Date(selectedVersion.createdAt).toLocaleString()}
                          </Typography>
                        </Grid>
                        <Grid item xs={12} md={6}>
                          <Typography variant="body2" color="text.secondary">
                            <strong>Auteur:</strong> {selectedVersion.author}
                          </Typography>
                        </Grid>
                        <Grid item xs={12} md={6}>
                          <Typography variant="body2" color="text.secondary">
                            <strong>Utilisations:</strong> {selectedVersion.usageCount || 0}
                          </Typography>
                        </Grid>
                        <Grid item xs={12}>
                          <Typography variant="body2" color="text.secondary">
                            <strong>Description:</strong> {selectedVersion.changeDescription || 'Aucune description'}
                          </Typography>
                        </Grid>
                      </Grid>
                    </CardContent>
                  </Card>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <Typography variant="h6" sx={{ mb: 2 }}>
                    Sujet
                  </Typography>
                  <Paper sx={{ p: 2, backgroundColor: '#f5f5f5' }}>
                    <Typography variant="body2">
                      {selectedVersion.subject || 'Aucun sujet'}
                    </Typography>
                  </Paper>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <Typography variant="h6" sx={{ mb: 2 }}>
                    Configuration
                  </Typography>
                  <Paper sx={{ p: 2, backgroundColor: '#f5f5f5' }}>
                    <Typography variant="body2" sx={{ fontFamily: 'monospace', fontSize: '0.875rem' }}>
                      {JSON.stringify(selectedVersion.configuration, null, 2)}
                    </Typography>
                  </Paper>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <Typography variant="h6" sx={{ mb: 2 }}>
                    Corps HTML
                  </Typography>
                  <Paper sx={{ p: 2, backgroundColor: '#f5f5f5', maxHeight: 300, overflow: 'auto' }}>
                    <Typography variant="body2" sx={{ fontFamily: 'monospace', fontSize: '0.875rem', whiteSpace: 'pre-wrap' }}>
                      {selectedVersion.htmlBody || 'Aucun contenu HTML'}
                    </Typography>
                  </Paper>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <Typography variant="h6" sx={{ mb: 2 }}>
                    Corps Texte
                  </Typography>
                  <Paper sx={{ p: 2, backgroundColor: '#f5f5f5', maxHeight: 300, overflow: 'auto' }}>
                    <Typography variant="body2" sx={{ fontFamily: 'monospace', fontSize: '0.875rem', whiteSpace: 'pre-wrap' }}>
                      {selectedVersion.textBody || 'Aucun contenu texte'}
                    </Typography>
                  </Paper>
                </Grid>
              </Grid>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSelectedVersion(null)}>
            Fermer
          </Button>
        </DialogActions>
      </Dialog>

      {/* Revert Confirmation Dialog */}
      <Dialog
        open={!!versionToRevert}
        onClose={() => setVersionToRevert(null)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <WarningIcon color="warning" />
            Confirmer le Retour de Version
          </Box>
        </DialogTitle>
        <DialogContent>
          <Alert severity="warning" sx={{ mb: 2 }}>
            Cette action va remplacer la version actuelle par la version {versionToRevert?.version}.
            Cette opération ne peut pas être annulée.
          </Alert>
          <Typography variant="body2" sx={{ mb: 2 }}>
            <strong>Version à restaurer:</strong> {versionToRevert?.version}
          </Typography>
          <Typography variant="body2" sx={{ mb: 2 }}>
            <strong>Description:</strong> {versionToRevert?.changeDescription || 'Aucune description'}
          </Typography>
          <Typography variant="body2" sx={{ mb: 2 }}>
            <strong>Créée le:</strong> {versionToRevert ? new Date(versionToRevert.createdAt).toLocaleString() : ''}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setVersionToRevert(null)}>
            Annuler
          </Button>
          <Button
            variant="contained"
            color="warning"
            onClick={() => handleRevert(versionToRevert)}
            disabled={revertMutation.isPending}
            startIcon={<RestoreIcon />}
          >
            {revertMutation.isPending ? 'Restauration...' : 'Restaurer cette Version'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Compare Versions Dialog */}
      <Dialog
        open={compareDialogOpen}
        onClose={() => setCompareDialogOpen(false)}
        maxWidth="lg"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <CompareIcon />
            Comparer les Versions
          </Box>
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Sélectionnez deux versions pour les comparer
          </Typography>
          
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Version Source
              </Typography>
              <Paper sx={{ p: 2, backgroundColor: '#e3f2fd' }}>
                <Typography variant="body2">
                  Version actuelle: {template.currentVersion}
                </Typography>
              </Paper>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Version Cible
              </Typography>
              <Paper sx={{ p: 2, backgroundColor: '#f3e5f5' }}>
                <Typography variant="body2">
                  Sélectionnez une version à comparer
                </Typography>
              </Paper>
            </Grid>
          </Grid>
          
          <Box sx={{ textAlign: 'center', mt: 3 }}>
            <Typography variant="body2" color="text.secondary">
              Fonctionnalité de comparaison en cours de développement
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCompareDialogOpen(false)}>
            Fermer
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default EmailTemplateHistory; 