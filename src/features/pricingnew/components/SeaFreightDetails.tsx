import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Grid,
  Chip,
  Divider,
  Avatar,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Paper,
  IconButton
} from '@mui/material';
import {
  Close as CloseIcon,
  Business as BusinessIcon,
  LocationOn as LocationIcon,
  DirectionsBoat as DirectionsBoatIcon,
  MonetizationOn as MonetizationOnIcon,
  CalendarToday as CalendarIcon,
  LocalShipping as LocalShippingIcon,
  Security as SecurityIcon,
  Comment as CommentIcon
} from '@mui/icons-material';
import { SeaFreightResponse } from '../api/types.gen';
import { useNavigate } from 'react-router-dom';

interface SeaFreightDetailsProps {
  seaFreight: SeaFreightResponse;
  onClose?: () => void;
  asPage?: boolean;
}

const SeaFreightDetails: React.FC<SeaFreightDetailsProps> = ({ seaFreight, onClose, asPage = false }) => {
  const navigate = useNavigate();
  
  const formatDate = (dateInput: string | Date) => {
    const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
    return date.toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatPort = (port: any) => {
    if (!port) return 'Non spécifié';
    return port.name || 'Port non disponible';
  };

  if (asPage) {
    return (
      <Box sx={{ maxWidth: 'md', mx: 'auto', my: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mb: 2 }}>
          <Button
            variant="outlined"
            onClick={() => navigate('/pricingnew/seafreight')}
            sx={{ borderRadius: 2, fontWeight: 600 }}
          >
            Retour à la liste
          </Button>
          <Button
            variant="contained"
            onClick={() => {
              if (seaFreight.id) {
                navigate(`/pricingnew/seafreight/${seaFreight.id}`);
              } else {
                alert('ID de l\'offre non disponible pour l\'édition');
              }
            }}
            disabled={!seaFreight.id}
            sx={{ borderRadius: 2, fontWeight: 600 }}
          >
            Éditer cette offre
          </Button>
        </Box>
        <Paper sx={{ p: 3, borderRadius: 3, background: 'rgba(255,255,255,0.98)', boxShadow: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
            <Avatar sx={{ bgcolor: 'rgba(102, 126, 234, 0.15)' }}>
              <DirectionsBoatIcon />
            </Avatar>
            <Typography variant="h4" sx={{ fontWeight: 700 }}>
              Détails du Sea Freight
            </Typography>
          </Box>
          <Grid container spacing={3}>
            {/* Informations principales */}
            <Grid item xs={12}>
              <Paper sx={{ p: 3, mb: 3, borderRadius: 2, bgcolor: 'rgba(102, 126, 234, 0.05)' }}>
                <Typography variant="h6" sx={{ mb: 2, fontWeight: 700, color: '#1a237e' }}>
                  Informations Générales
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                      <Avatar sx={{ bgcolor: 'primary.main', width: 40, height: 40 }}>
                        <BusinessIcon />
                      </Avatar>
                      <Box>
                        <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                          Transporteur
                        </Typography>
                        <Typography variant="body1">
                          {seaFreight.carrier?.name || 'Non spécifié'}
                        </Typography>
                        <Typography variant="body2" sx={{ color: '#666' }}>
                          ID: {seaFreight.carrier?.id}
                        </Typography>
                      </Box>
                    </Box>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                      <Avatar sx={{ bgcolor: 'success.main', width: 40, height: 40 }}>
                        <MonetizationOnIcon />
                      </Avatar>
                      <Box>
                        <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                          Prix de Base
                        </Typography>
                        <Typography variant="body1" sx={{ fontWeight: 600 }}>
                          {seaFreight.charges?.basePrice} {seaFreight.currency}
                        </Typography>
                      </Box>
                    </Box>
                  </Grid>
                </Grid>
              </Paper>
            </Grid>

            {/* Itinéraire */}
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 3, borderRadius: 2, height: '100%' }}>
                <Typography variant="h6" sx={{ mb: 2, fontWeight: 700, color: '#1a237e' }}>
                  Itinéraire
                </Typography>
                <List>
                  <ListItem sx={{ px: 0 }}>
                    <ListItemIcon>
                      <Avatar sx={{ bgcolor: 'secondary.main', width: 32, height: 32 }}>
                        <LocationIcon />
                      </Avatar>
                    </ListItemIcon>
                    <ListItemText
                      primary="Port de départ"
                      secondary={formatPort(seaFreight.departurePort)}
                    />
                  </ListItem>
                  <ListItem sx={{ px: 0 }}>
                    <ListItemIcon>
                      <Avatar sx={{ bgcolor: 'warning.main', width: 32, height: 32 }}>
                        <DirectionsBoatIcon />
                      </Avatar>
                    </ListItemIcon>
                    <ListItemText
                      primary="Port d'arrivée"
                      secondary={formatPort(seaFreight.arrivalPort)}
                    />
                  </ListItem>
                  <ListItem sx={{ px: 0 }}>
                    <ListItemIcon>
                      <Avatar sx={{ bgcolor: 'info.main', width: 32, height: 32 }}>
                        <CalendarIcon />
                      </Avatar>
                    </ListItemIcon>
                    <ListItemText
                      primary="Temps de transit"
                      secondary={`${seaFreight.transitTimeDays} jours`}
                    />
                  </ListItem>
                  <ListItem sx={{ px: 0 }}>
                    <ListItemIcon>
                      <Avatar sx={{ bgcolor: 'success.main', width: 32, height: 32 }}>
                        <LocalShippingIcon />
                      </Avatar>
                    </ListItemIcon>
                    <ListItemText
                      primary="Fréquence"
                      secondary={seaFreight.frequency || 'Non spécifiée'}
                    />
                  </ListItem>
                </List>
              </Paper>
            </Grid>

            {/* Détails techniques */}
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 3, borderRadius: 2, height: '100%' }}>
                <Typography variant="h6" sx={{ mb: 2, fontWeight: 700, color: '#1a237e' }}>
                  Détails Techniques
                </Typography>
                <List>
                  <ListItem sx={{ px: 0 }}>
                    <ListItemIcon>
                      <Avatar sx={{ bgcolor: 'primary.main', width: 32, height: 32 }}>
                        <LocalShippingIcon />
                      </Avatar>
                    </ListItemIcon>
                    <ListItemText
                      primary="Type de conteneur"
                      secondary={seaFreight.containerType || 'Non spécifié'}
                    />
                  </ListItem>
                  <ListItem sx={{ px: 0 }}>
                    <ListItemIcon>
                      <Avatar sx={{ bgcolor: 'warning.main', width: 32, height: 32 }}>
                        <SecurityIcon />
                      </Avatar>
                    </ListItemIcon>
                    <ListItemText
                      primary="Reefer"
                      secondary={seaFreight.isReefer ? 'Oui' : 'Non'}
                    />
                  </ListItem>
                  <ListItem sx={{ px: 0 }}>
                    <ListItemIcon>
                      <Avatar sx={{ bgcolor: 'info.main', width: 32, height: 32 }}>
                        <MonetizationOnIcon />
                      </Avatar>
                    </ListItemIcon>
                    <ListItemText
                      primary="Incoterm"
                      secondary={seaFreight.incoterm || 'Non spécifié'}
                    />
                  </ListItem>
                  <ListItem sx={{ px: 0 }}>
                    <ListItemIcon>
                      <Avatar sx={{ bgcolor: 'success.main', width: 32, height: 32 }}>
                        <CalendarIcon />
                      </Avatar>
                    </ListItemIcon>
                    <ListItemText
                      primary="Volume/Weight"
                      secondary={`${seaFreight.volumeCbm} CBM / ${seaFreight.weightKg} KG`}
                    />
                  </ListItem>
                </List>
              </Paper>
            </Grid>

            {/* Charges détaillées */}
            <Grid item xs={12}>
              <Paper sx={{ p: 3, borderRadius: 2 }}>
                <Typography variant="h6" sx={{ mb: 2, fontWeight: 700, color: '#1a237e' }}>
                  Charges Détaillées
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6} md={3}>
                    <Box sx={{ textAlign: 'center', p: 2, bgcolor: 'rgba(102, 126, 234, 0.05)', borderRadius: 2 }}>
                      <Typography variant="h6" sx={{ fontWeight: 700, color: '#1a237e' }}>
                        {seaFreight.charges?.basePrice} {seaFreight.currency}
                      </Typography>
                      <Typography variant="body2" sx={{ color: '#666' }}>
                        Fret de base
                      </Typography>
                    </Box>
                  </Grid>
                  {seaFreight.charges?.surcharges?.map((s, idx) => (
                    <Grid item xs={12} sm={6} md={3} key={idx}>
                    <Box sx={{ textAlign: 'center', p: 2, bgcolor: 'rgba(255, 152, 0, 0.05)', borderRadius: 2 }}>
                      <Typography variant="h6" sx={{ fontWeight: 700, color: '#f57c00' }}>
                          {s.value} {s.currency}
                      </Typography>
                      <Typography variant="body2" sx={{ color: '#666' }}>
                          {s.name} ({s.type})
                      </Typography>
                        {s.description && <Typography variant="caption">{s.description}</Typography>}
                    </Box>
                  </Grid>
                  ))}
                </Grid>
              </Paper>
            </Grid>

            {/* Validité */}
            <Grid item xs={12}>
              <Paper sx={{ p: 3, borderRadius: 2 }}>
                <Typography variant="h6" sx={{ mb: 2, fontWeight: 700, color: '#1a237e' }}>
                  Validité
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Avatar sx={{ bgcolor: 'success.main', width: 40, height: 40 }}>
                        <CalendarIcon />
                      </Avatar>
                      <Box>
                        <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                          Date de début
                        </Typography>
                        <Typography variant="body1">
                          {seaFreight.validity?.startDate ? formatDate(seaFreight.validity.startDate) : 'Non spécifiée'}
                        </Typography>
                      </Box>
                    </Box>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Avatar sx={{ bgcolor: 'warning.main', width: 40, height: 40 }}>
                        <CalendarIcon />
                      </Avatar>
                      <Box>
                        <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                          Date de fin
                        </Typography>
                        <Typography variant="body1">
                          {seaFreight.validity?.endDate ? formatDate(seaFreight.validity.endDate) : 'Non spécifiée'}
                        </Typography>
                      </Box>
                    </Box>
                  </Grid>
                </Grid>
              </Paper>
            </Grid>

            {/* Remarques */}
            {seaFreight.remarks && (
              <Grid item xs={12}>
                <Paper sx={{ p: 3, borderRadius: 2 }}>
                  <Typography variant="h6" sx={{ mb: 2, fontWeight: 700, color: '#1a237e' }}>
                    Remarques
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                    <Avatar sx={{ bgcolor: 'info.main', width: 32, height: 32, mt: 0.5 }}>
                      <CommentIcon />
                    </Avatar>
                    <Typography variant="body1" sx={{ flex: 1 }}>
                      {seaFreight.remarks}
                    </Typography>
                  </Box>
                </Paper>
              </Grid>
            )}

            {/* Informations système */}
            <Grid item xs={12}>
              <Paper sx={{ p: 3, borderRadius: 2, bgcolor: 'rgba(0, 0, 0, 0.02)' }}>
                <Typography variant="h6" sx={{ mb: 2, fontWeight: 700, color: '#1a237e' }}>
                  Informations Système
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6} md={3}>
                    <Typography variant="body2" sx={{ color: '#666' }}>
                      ID de l'offre
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 600 }}>
                      {seaFreight.id || 'N/A'}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <Typography variant="body2" sx={{ color: '#666' }}>
                      Créé par
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 600 }}>
                      {seaFreight.createdBy || 'N/A'}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <Typography variant="body2" sx={{ color: '#666' }}>
                      Statut
                    </Typography>
                    <Chip 
                      label={seaFreight.isActive ? 'Actif' : 'Inactif'} 
                      color={seaFreight.isActive ? 'success' : 'default'}
                      size="small"
                    />
                  </Grid>
                </Grid>
              </Paper>
            </Grid>
          </Grid>
        </Paper>
      </Box>
    );
  }

  return (
    <Dialog 
      open={true} 
      onClose={onClose} 
      maxWidth="md" 
      fullWidth
      PaperProps={{
        sx: { borderRadius: 3 }
      }}
    >
      <DialogTitle sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        bgcolor: 'primary.main',
        color: 'white'
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <DirectionsBoatIcon />
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            Détails Sea Freight
          </Typography>
        </Box>
        <IconButton onClick={onClose} sx={{ color: 'white' }}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      
      <DialogContent sx={{ p: 3 }}>
        <Grid container spacing={3}>
          {/* Informations principales */}
          <Grid item xs={12}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
              <Avatar sx={{ bgcolor: 'primary.main' }}>
                <BusinessIcon />
              </Avatar>
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                  {seaFreight.carrier?.name || 'Transporteur non spécifié'}
                </Typography>
                <Typography variant="body2" sx={{ color: '#666' }}>
                  {formatPort(seaFreight.departurePort)} → {formatPort(seaFreight.arrivalPort)}
                </Typography>
              </Box>
            </Box>
          </Grid>

          <Grid item xs={12}>
            <Divider sx={{ my: 2 }} />
          </Grid>

          {/* Détails rapides */}
          <Grid item xs={12} sm={6}>
            <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
              Prix de base
            </Typography>
            <Typography variant="h6" sx={{ fontWeight: 700, color: 'primary.main' }}>
              {seaFreight.charges?.basePrice} {seaFreight.currency}
            </Typography>
          </Grid>

          <Grid item xs={12} sm={6}>
            <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
              Temps de transit
            </Typography>
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              {seaFreight.transitTimeDays} jours
            </Typography>
          </Grid>

          <Grid item xs={12} sm={6}>
            <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
              Type de conteneur
            </Typography>
            <Chip 
              label={seaFreight.containerType || 'Non spécifié'} 
              variant="outlined"
              size="small"
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
              Statut
            </Typography>
            <Chip 
              label={seaFreight.isActive ? 'Actif' : 'Inactif'} 
              color={seaFreight.isActive ? 'success' : 'default'}
              size="small"
            />
          </Grid>
        </Grid>
      </DialogContent>
      
      <DialogActions sx={{ p: 3, pt: 0 }}>
        <Button onClick={onClose} variant="outlined">
          Fermer
        </Button>
        <Button 
          variant="contained" 
          onClick={() => {
            if (seaFreight.id) {
              navigate(`/pricingnew/seafreight/${seaFreight.id}`);
            }
            onClose?.();
          }}
          disabled={!seaFreight.id}
        >
          Éditer
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default SeaFreightDetails; 