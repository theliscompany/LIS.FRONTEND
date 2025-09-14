import React from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  LinearProgress,
  Chip,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Avatar,
  Button
} from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  Email as EmailIcon,
  Schedule as ScheduleIcon,
  Person as PersonIcon,
  CheckCircle as SuccessIcon,
  Error as ErrorIcon,
  Warning as WarningIcon,
  Refresh as RefreshIcon,
  Analytics as AnalyticsIcon,
  CalendarToday as CalendarIcon,
  AccessTime as TimeIcon
} from '@mui/icons-material';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  getApiEmailTemplateByIdStatsOptions,
  postApiEmailTemplateByIdClearStatsMutation
} from '../api/@tanstack/react-query.gen';

interface EmailTemplateStatsProps {
  template: any;
}

const EmailTemplateStats: React.FC<EmailTemplateStatsProps> = ({ template }) => {
  const queryClient = useQueryClient();

  const { data: stats, isLoading } = useQuery(
    getApiEmailTemplateByIdStatsOptions({ path: { id: template?.id || '' } })
  );

  const clearStatsMutation = useMutation(postApiEmailTemplateByIdClearStatsMutation());

  const handleClearStats = async () => {
    if (!template?.id) return;
    
    try {
      await clearStatsMutation.mutateAsync({ path: { id: template.id } });
      queryClient.invalidateQueries({ queryKey: ['getApiEmailTemplateByIdStats'] });
    } catch (error) {
      console.error('Error clearing stats:', error);
    }
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
          Chargement des statistiques...
        </Typography>
      </Box>
    );
  }

  const templateStats = stats || {
    usageCount: 0,
    successCount: 0,
    errorCount: 0,
    lastUsed: null,
    averageRenderTime: 0,
    mostUsedPlaceholders: [],
    usageByDay: [],
    errors: []
  };

  const successRate = templateStats.usageCount > 0 
    ? (templateStats.successCount / templateStats.usageCount) * 100 
    : 0;

  const errorRate = templateStats.usageCount > 0 
    ? (templateStats.errorCount / templateStats.usageCount) * 100 
    : 0;

  return (
    <Box sx={{ width: '100%' }}>
      {/* Header */}
      <Paper sx={{ p: 3, mb: 3, background: 'linear-gradient(135deg, #e8f5e8 0%, #f3e5f5 100%)' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 600, mb: 1 }}>
              Statistiques - {template.name}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Analyse détaillée de l'utilisation du template
            </Typography>
          </Box>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={handleClearStats}
            disabled={clearStatsMutation.isPending}
          >
            Réinitialiser Stats
          </Button>
        </Box>
      </Paper>

      {/* Key Metrics */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={3}>
          <Card sx={{ 
            background: 'linear-gradient(135deg, #e3f2fd 0%, #f3e5f5 100%)',
            border: '2px solid #e8eaf6'
          }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Avatar sx={{ bgcolor: 'primary.main', mr: 2 }}>
                  <EmailIcon />
                </Avatar>
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 700 }}>
                    {templateStats.usageCount}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Utilisations Total
                  </Typography>
                </Box>
              </Box>
              <LinearProgress 
                variant="determinate" 
                value={100} 
                sx={{ height: 8, borderRadius: 4 }}
              />
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={3}>
          <Card sx={{ 
            background: 'linear-gradient(135deg, #e8f5e8 0%, #f1f8e9 100%)',
            border: '2px solid #c8e6c9'
          }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Avatar sx={{ bgcolor: 'success.main', mr: 2 }}>
                  <SuccessIcon />
                </Avatar>
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 700, color: 'success.main' }}>
                    {successRate.toFixed(1)}%
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Taux de Succès
                  </Typography>
                </Box>
              </Box>
              <LinearProgress 
                variant="determinate" 
                value={successRate} 
                color="success"
                sx={{ height: 8, borderRadius: 4 }}
              />
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={3}>
          <Card sx={{ 
            background: 'linear-gradient(135deg, #ffebee 0%, #fce4ec 100%)',
            border: '2px solid #ffcdd2'
          }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Avatar sx={{ bgcolor: 'error.main', mr: 2 }}>
                  <ErrorIcon />
                </Avatar>
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 700, color: 'error.main' }}>
                    {errorRate.toFixed(1)}%
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Taux d'Erreur
                  </Typography>
                </Box>
              </Box>
              <LinearProgress 
                variant="determinate" 
                value={errorRate} 
                color="error"
                sx={{ height: 8, borderRadius: 4 }}
              />
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={3}>
          <Card sx={{ 
            background: 'linear-gradient(135deg, #fff3e0 0%, #fbe9e7 100%)',
            border: '2px solid #ffcc02'
          }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Avatar sx={{ bgcolor: 'warning.main', mr: 2 }}>
                  <TimeIcon />
                </Avatar>
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 700, color: 'warning.main' }}>
                    {templateStats.averageRenderTime?.toFixed(2) || '0'}ms
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Temps de Rendu Moyen
                  </Typography>
                </Box>
              </Box>
              <LinearProgress 
                variant="determinate" 
                value={Math.min((templateStats.averageRenderTime || 0) / 1000 * 100, 100)} 
                color="warning"
                sx={{ height: 8, borderRadius: 4 }}
              />
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Detailed Stats */}
      <Grid container spacing={3}>
        {/* Usage Timeline */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
              <CalendarIcon />
              Utilisation par Jour
            </Typography>
            
            {templateStats.usageByDay && templateStats.usageByDay.length > 0 ? (
              <List dense>
                {templateStats.usageByDay.slice(0, 7).map((day: any, index: number) => (
                  <ListItem key={index}>
                    <ListItemIcon>
                      <TrendingUpIcon color="primary" />
                    </ListItemIcon>
                    <ListItemText
                      primary={`${day.date} - ${day.count} utilisations`}
                      secondary={`${day.successCount} succès, ${day.errorCount} erreurs`}
                    />
                  </ListItem>
                ))}
              </List>
            ) : (
              <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
                Aucune donnée d'utilisation disponible
              </Typography>
            )}
          </Paper>
        </Grid>

        {/* Most Used Placeholders */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
              <AnalyticsIcon />
              Placeholders les Plus Utilisés
            </Typography>
            
            {templateStats.mostUsedPlaceholders && templateStats.mostUsedPlaceholders.length > 0 ? (
              <Box>
                {templateStats.mostUsedPlaceholders.map((placeholder: any, index: number) => (
                  <Box key={index} sx={{ mb: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {placeholder.name}
                      </Typography>
                      <Chip 
                        label={`${placeholder.usageCount} fois`} 
                        size="small" 
                        color="primary" 
                        variant="outlined"
                      />
                    </Box>
                    <LinearProgress 
                      variant="determinate" 
                      value={(placeholder.usageCount / templateStats.usageCount) * 100} 
                      sx={{ height: 6, borderRadius: 3 }}
                    />
                  </Box>
                ))}
              </Box>
            ) : (
              <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
                Aucun placeholder utilisé
              </Typography>
            )}
          </Paper>
        </Grid>

        {/* Recent Errors */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
              <ErrorIcon color="error" />
              Erreurs Récentes
            </Typography>
            
            {templateStats.errors && templateStats.errors.length > 0 ? (
              <List>
                {templateStats.errors.slice(0, 5).map((error: any, index: number) => (
                  <ListItem key={index} sx={{ border: '1px solid #ffcdd2', borderRadius: 1, mb: 1 }}>
                    <ListItemIcon>
                      <ErrorIcon color="error" />
                    </ListItemIcon>
                    <ListItemText
                      primary={error.message}
                      secondary={`${error.timestamp} - ${error.context}`}
                    />
                    <Chip 
                      label={error.type} 
                      size="small" 
                      color="error" 
                      variant="outlined"
                    />
                  </ListItem>
                ))}
              </List>
            ) : (
              <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
                Aucune erreur récente
              </Typography>
            )}
          </Paper>
        </Grid>

        {/* Template Info */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3, background: '#f5f5f5' }}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Informations du Template
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} md={3}>
                <Typography variant="body2" color="text.secondary">
                  <strong>Créé le:</strong> {new Date(template.createdAt).toLocaleDateString()}
                </Typography>
              </Grid>
              <Grid item xs={12} md={3}>
                <Typography variant="body2" color="text.secondary">
                  <strong>Dernière utilisation:</strong> {templateStats.lastUsed ? new Date(templateStats.lastUsed).toLocaleDateString() : 'Jamais'}
                </Typography>
              </Grid>
              <Grid item xs={12} md={3}>
                <Typography variant="body2" color="text.secondary">
                  <strong>Auteur:</strong> {template.author}
                </Typography>
              </Grid>
              <Grid item xs={12} md={3}>
                <Typography variant="body2" color="text.secondary">
                  <strong>Version:</strong> {template.currentVersion || '1.0'}
                </Typography>
              </Grid>
            </Grid>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default EmailTemplateStats; 