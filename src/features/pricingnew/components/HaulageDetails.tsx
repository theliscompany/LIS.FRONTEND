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
  Paper
} from '@mui/material';
import {
  Close as CloseIcon,
  Business as BusinessIcon,
  LocationOn as LocationIcon,
  DirectionsCar as DirectionsCarIcon,
  MonetizationOn as MonetizationOnIcon,
  CalendarToday as CalendarIcon,
  LocalShipping as LocalShippingIcon,
  Security as SecurityIcon,
  Comment as CommentIcon
} from '@mui/icons-material';
import { HaulageResponse } from '../api/types.gen';
import { useNavigate } from 'react-router-dom';

interface HaulageDetailsProps {
  haulage: HaulageResponse;
  onClose?: () => void;
  asPage?: boolean;
}

const HaulageDetails: React.FC<HaulageDetailsProps> = ({ haulage, onClose, asPage = false }) => {
  const navigate = useNavigate();
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatLocation = (location: any) => {
    if (!location) return 'Non spécifié';
    return location.displayName || location.formattedAddress || 'Adresse non disponible';
  };

  if (asPage) {
    return (
      <Box sx={{ maxWidth: 'md', mx: 'auto', my: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mb: 2 }}>
          <Button
            variant="outlined"
            onClick={() => navigate('/pricingnew/haulage')}
            sx={{ borderRadius: 2, fontWeight: 600 }}
          >
            Retour à la liste
          </Button>
          <Button
            variant="contained"
            onClick={() => {
              if (haulage.offerId) {
                navigate(`/pricingnew/haulage/${haulage.offerId}`);
              } else {
                alert('ID de l\'offre non disponible pour l\'édition');
              }
            }}
            disabled={!haulage.offerId}
            sx={{ borderRadius: 2, fontWeight: 600 }}
          >
            Éditer cette offre
          </Button>
        </Box>
        <Paper sx={{ p: 3, borderRadius: 3, background: 'rgba(255,255,255,0.98)', boxShadow: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
            <Avatar sx={{ bgcolor: 'rgba(102, 126, 234, 0.15)' }}>
              <DirectionsCarIcon />
            </Avatar>
            <Typography variant="h4" sx={{ fontWeight: 700 }}>
              Détails du Transport
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
                          {haulage.haulierName || 'Non spécifié'}
                        </Typography>
                        <Typography variant="body2" sx={{ color: '#666' }}>
                          ID: {haulage.haulierId}
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
                          Tarif Unitaire
                        </Typography>
                        <Typography variant="body1" sx={{ fontWeight: 600 }}>
                          {haulage.unitTariff} {haulage.currency || 'EUR'}
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
                      primary="Point de ramassage"
                      secondary={formatLocation(haulage.pickupLocation)}
                    />
                  </ListItem>
                  <ListItem sx={{ px: 0 }}>
                    <ListItemIcon>
                      <Avatar sx={{ bgcolor: 'warning.main', width: 32, height: 32 }}>
                        <LocalShippingIcon />
                      </Avatar>
                    </ListItemIcon>
                    <ListItemText
                      primary="Point de chargement"
                      secondary={formatLocation(haulage.loadingLocation)}
                    />
                  </ListItem>
                  <ListItem sx={{ px: 0 }}>
                    <ListItemIcon>
                      <Avatar sx={{ bgcolor: 'success.main', width: 32, height: 32 }}>
                        <DirectionsCarIcon />
                      </Avatar>
                    </ListItemIcon>
                    <ListItemText
                      primary="Point de livraison"
                      secondary={formatLocation(haulage.deliveryLocation)}
                    />
                  </ListItem>
                  <ListItem sx={{ px: 0 }}>
                    <ListItemIcon>
                      <Avatar sx={{ bgcolor: 'info.main', width: 32, height: 32 }}>
                        <LocalShippingIcon />
                      </Avatar>
                    </ListItemIcon>
                    <ListItemText
                      primary="Retour à vide"
                      secondary={formatLocation(haulage.emptyReturnLocation)}
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
                      <Avatar sx={{ bgcolor: 'error.main', width: 32, height: 32 }}>
                        <DirectionsCarIcon />
                      </Avatar>
                    </ListItemIcon>
                    <ListItemText
                      primary="Distance"
                      secondary={`${haulage.distanceKm} km`}
                    />
                  </ListItem>
                  <ListItem sx={{ px: 0 }}>
                    <ListItemIcon>
                      <Avatar sx={{ bgcolor: 'warning.main', width: 32, height: 32 }}>
                        <CalendarIcon />
                      </Avatar>
                    </ListItemIcon>
                    <ListItemText
                      primary="Temps de transit estimé"
                      secondary={`${haulage.estimatedTransitTimeHours} heures`}
                    />
                  </ListItem>
                  <ListItem sx={{ px: 0 }}>
                    <ListItemIcon>
                      <Avatar sx={{ bgcolor: 'success.main', width: 32, height: 32 }}>
                        <CalendarIcon />
                      </Avatar>
                    </ListItemIcon>
                    <ListItemText
                      primary="Temps libre"
                      secondary={`${haulage.freeTime} heures`}
                    />
                  </ListItem>
                  <ListItem sx={{ px: 0 }}>
                    <ListItemIcon>
                      <Avatar sx={{ bgcolor: 'info.main', width: 32, height: 32 }}>
                        <MonetizationOnIcon />
                      </Avatar>
                    </ListItemIcon>
                    <ListItemText
                      primary="Tarif multi-arrêts"
                      secondary={`${haulage.multiStop} ${haulage.currency || 'EUR'}`}
                    />
                  </ListItem>
                  <ListItem sx={{ px: 0 }}>
                    <ListItemIcon>
                      <Avatar sx={{ bgcolor: 'secondary.main', width: 32, height: 32 }}>
                        <MonetizationOnIcon />
                      </Avatar>
                    </ListItemIcon>
                    <ListItemText
                      primary="Tarif heures supplémentaires"
                      secondary={`${haulage.overtimeTariff} ${haulage.currency || 'EUR'}`}
                    />
                  </ListItem>
                </List>
              </Paper>
            </Grid>

            {/* Validité */}
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 3, borderRadius: 2 }}>
                <Typography variant="h6" sx={{ mb: 2, fontWeight: 700, color: '#1a237e' }}>
                  Période de Validité
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Avatar sx={{ bgcolor: 'success.main', width: 32, height: 32 }}>
                      <CalendarIcon />
                    </Avatar>
                    <Box>
                      <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                        Valide à partir du
                      </Typography>
                      <Typography variant="body2">
                        {haulage.validFrom ? formatDate(haulage.validFrom.toString()) : 'Non spécifié'}
                      </Typography>
                    </Box>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Avatar sx={{ bgcolor: 'error.main', width: 32, height: 32 }}>
                      <CalendarIcon />
                    </Avatar>
                    <Box>
                      <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                        Valide jusqu'au
                      </Typography>
                      <Typography variant="body2">
                        {haulage.validUntil ? formatDate(haulage.validUntil.toString()) : 'Non spécifié'}
                      </Typography>
                    </Box>
                  </Box>
                </Box>
              </Paper>
            </Grid>

            {/* Types de cargaison */}
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 3, borderRadius: 2 }}>
                <Typography variant="h6" sx={{ mb: 2, fontWeight: 700, color: '#1a237e' }}>
                  Types de Cargaison
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {haulage.cargoTypes && haulage.cargoTypes.length > 0 ? (
                    haulage.cargoTypes.map((cargoType, index) => (
                      <Chip
                        key={index}
                        label={cargoType}
                        color="primary"
                        variant="outlined"
                        sx={{ fontWeight: 600 }}
                      />
                    ))
                  ) : (
                    <Typography variant="body2" sx={{ color: '#666', fontStyle: 'italic' }}>
                      Aucun type de cargaison spécifié
                    </Typography>
                  )}
                </Box>
              </Paper>
            </Grid>

            {/* Assurance transport */}
            {haulage.transportInsurance && (
              <Grid item xs={12}>
                <Paper sx={{ p: 3, borderRadius: 2, bgcolor: 'rgba(76, 175, 80, 0.05)' }}>
                  <Typography variant="h6" sx={{ mb: 2, fontWeight: 700, color: '#1a237e' }}>
                    Assurance Transport
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12} md={6}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                        <Avatar sx={{ bgcolor: haulage.transportInsurance.isInsured ? 'success.main' : 'error.main', width: 40, height: 40 }}>
                          <SecurityIcon />
                        </Avatar>
                        <Box>
                          <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                            Statut
                          </Typography>
                          <Typography variant="body1">
                            {haulage.transportInsurance.isInsured ? 'Assuré' : 'Non assuré'}
                          </Typography>
                        </Box>
                      </Box>
                    </Grid>
                    {haulage.transportInsurance.isInsured && (
                      <>
                        <Grid item xs={12} md={6}>
                          <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                            Taux d'assurance
                          </Typography>
                          <Typography variant="body2">
                            {haulage.transportInsurance.rate}%
                          </Typography>
                        </Grid>
                        <Grid item xs={12} md={6}>
                          <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                            Montant minimum
                          </Typography>
                          <Typography variant="body2">
                            {haulage.transportInsurance.minimumAmount} {haulage.transportInsurance.currency || 'EUR'}
                          </Typography>
                        </Grid>
                        <Grid item xs={12} md={6}>
                          <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                            Montant maximum
                          </Typography>
                          <Typography variant="body2">
                            {haulage.transportInsurance.maximumAmount} {haulage.transportInsurance.currency || 'EUR'}
                          </Typography>
                        </Grid>
                      </>
                    )}
                  </Grid>
                </Paper>
              </Grid>
            )}

            {/* Conditions de livraison */}
            {haulage.deliveryTerms && (
              <Grid item xs={12}>
                <Paper sx={{ p: 3, borderRadius: 2, bgcolor: 'rgba(255, 152, 0, 0.05)' }}>
                  <Typography variant="h6" sx={{ mb: 2, fontWeight: 700, color: '#1a237e' }}>
                    Conditions de Livraison
                  </Typography>
                  <Typography variant="body1">
                    {haulage.deliveryTerms}
                  </Typography>
                </Paper>
              </Grid>
            )}

            {/* Commentaires */}
            {haulage.comment && (
              <Grid item xs={12}>
                <Paper sx={{ p: 3, borderRadius: 2, bgcolor: 'rgba(156, 39, 176, 0.05)' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                    <Avatar sx={{ bgcolor: 'secondary.main', width: 40, height: 40 }}>
                      <CommentIcon />
                    </Avatar>
                    <Typography variant="h6" sx={{ fontWeight: 700, color: '#1a237e' }}>
                      Commentaires
                    </Typography>
                  </Box>
                  <Typography variant="body1" sx={{ fontStyle: 'italic' }}>
                    {haulage.comment}
                  </Typography>
                </Paper>
              </Grid>
            )}

            {/* Informations de création */}
            <Grid item xs={12}>
              <Paper sx={{ p: 3, borderRadius: 2, bgcolor: 'rgba(158, 158, 158, 0.05)' }}>
                <Typography variant="h6" sx={{ mb: 2, fontWeight: 700, color: '#1a237e' }}>
                  Informations de Création
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                      Créé par
                    </Typography>
                    <Typography variant="body2">
                      {haulage.createdBy || 'Non spécifié'}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                      Date de création
                    </Typography>
                    <Typography variant="body2">
                      {haulage.createdAt ? formatDate(haulage.createdAt.toString()) : 'Non spécifié'}
                    </Typography>
                  </Grid>
                  {haulage.lastUpdatedBy && (
                    <Grid item xs={12} md={6}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                        Dernière modification par
                      </Typography>
                      <Typography variant="body2">
                        {haulage.lastUpdatedBy}
                      </Typography>
                    </Grid>
                  )}
                  {haulage.lastUpdatedAt && (
                    <Grid item xs={12} md={6}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                        Date de dernière modification
                      </Typography>
                      <Typography variant="body2">
                        {haulage.lastUpdatedAt ? formatDate(haulage.lastUpdatedAt.toString()) : 'Non spécifié'}
                      </Typography>
                    </Grid>
                  )}
                </Grid>
              </Paper>
            </Grid>
          </Grid>
        </Paper>
      </Box>
    );
  }
  // Mode modal (Dialog)
  return (
    <Dialog
      open={true}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          background: 'rgba(255, 255, 255, 0.98)',
          backdropFilter: 'blur(10px)'
        }
      }}
    >
      <DialogTitle sx={{ 
        pb: 1,
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white',
        borderRadius: '12px 12px 0 0'
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Avatar sx={{ bgcolor: 'rgba(255, 255, 255, 0.2)' }}>
              <DirectionsCarIcon />
            </Avatar>
            <Typography variant="h5" sx={{ fontWeight: 700 }}>
              Détails du Transport
            </Typography>
          </Box>
          <Button
            onClick={onClose}
            sx={{ 
              color: 'white',
              '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.1)' }
            }}
          >
            <CloseIcon />
          </Button>
        </Box>
      </DialogTitle>
      <DialogContent sx={{ p: 3 }}>
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
                        {haulage.haulierName || 'Non spécifié'}
                      </Typography>
                      <Typography variant="body2" sx={{ color: '#666' }}>
                        ID: {haulage.haulierId}
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
                        Tarif Unitaire
                      </Typography>
                      <Typography variant="body1" sx={{ fontWeight: 600 }}>
                        {haulage.unitTariff} {haulage.currency || 'EUR'}
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
                    primary="Point de ramassage"
                    secondary={formatLocation(haulage.pickupLocation)}
                  />
                </ListItem>
                <ListItem sx={{ px: 0 }}>
                  <ListItemIcon>
                    <Avatar sx={{ bgcolor: 'warning.main', width: 32, height: 32 }}>
                      <LocalShippingIcon />
                    </Avatar>
                  </ListItemIcon>
                  <ListItemText
                    primary="Point de chargement"
                    secondary={formatLocation(haulage.loadingLocation)}
                  />
                </ListItem>
                <ListItem sx={{ px: 0 }}>
                  <ListItemIcon>
                    <Avatar sx={{ bgcolor: 'success.main', width: 32, height: 32 }}>
                      <DirectionsCarIcon />
                    </Avatar>
                  </ListItemIcon>
                  <ListItemText
                    primary="Point de livraison"
                    secondary={formatLocation(haulage.deliveryLocation)}
                  />
                </ListItem>
                <ListItem sx={{ px: 0 }}>
                  <ListItemIcon>
                    <Avatar sx={{ bgcolor: 'info.main', width: 32, height: 32 }}>
                      <LocalShippingIcon />
                    </Avatar>
                  </ListItemIcon>
                  <ListItemText
                    primary="Retour à vide"
                    secondary={formatLocation(haulage.emptyReturnLocation)}
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
                    <Avatar sx={{ bgcolor: 'error.main', width: 32, height: 32 }}>
                      <DirectionsCarIcon />
                    </Avatar>
                  </ListItemIcon>
                  <ListItemText
                    primary="Distance"
                    secondary={`${haulage.distanceKm} km`}
                  />
                </ListItem>
                <ListItem sx={{ px: 0 }}>
                  <ListItemIcon>
                    <Avatar sx={{ bgcolor: 'warning.main', width: 32, height: 32 }}>
                      <CalendarIcon />
                    </Avatar>
                  </ListItemIcon>
                  <ListItemText
                    primary="Temps de transit estimé"
                    secondary={`${haulage.estimatedTransitTimeHours} heures`}
                  />
                </ListItem>
                <ListItem sx={{ px: 0 }}>
                  <ListItemIcon>
                    <Avatar sx={{ bgcolor: 'success.main', width: 32, height: 32 }}>
                      <CalendarIcon />
                    </Avatar>
                  </ListItemIcon>
                  <ListItemText
                    primary="Temps libre"
                    secondary={`${haulage.freeTime} heures`}
                  />
                </ListItem>
                <ListItem sx={{ px: 0 }}>
                  <ListItemIcon>
                    <Avatar sx={{ bgcolor: 'info.main', width: 32, height: 32 }}>
                      <MonetizationOnIcon />
                    </Avatar>
                  </ListItemIcon>
                  <ListItemText
                    primary="Tarif multi-arrêts"
                    secondary={`${haulage.multiStop} ${haulage.currency || 'EUR'}`}
                  />
                </ListItem>
                <ListItem sx={{ px: 0 }}>
                  <ListItemIcon>
                    <Avatar sx={{ bgcolor: 'secondary.main', width: 32, height: 32 }}>
                      <MonetizationOnIcon />
                    </Avatar>
                  </ListItemIcon>
                  <ListItemText
                    primary="Tarif heures supplémentaires"
                    secondary={`${haulage.overtimeTariff} ${haulage.currency || 'EUR'}`}
                  />
                </ListItem>
              </List>
            </Paper>
          </Grid>

          {/* Validité */}
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3, borderRadius: 2 }}>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 700, color: '#1a237e' }}>
                Période de Validité
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Avatar sx={{ bgcolor: 'success.main', width: 32, height: 32 }}>
                    <CalendarIcon />
                  </Avatar>
                  <Box>
                    <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                      Valide à partir du
                    </Typography>
                    <Typography variant="body2">
                      {haulage.validFrom ? formatDate(haulage.validFrom.toString()) : 'Non spécifié'}
                    </Typography>
                  </Box>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Avatar sx={{ bgcolor: 'error.main', width: 32, height: 32 }}>
                    <CalendarIcon />
                  </Avatar>
                  <Box>
                    <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                      Valide jusqu'au
                    </Typography>
                    <Typography variant="body2">
                      {haulage.validUntil ? formatDate(haulage.validUntil.toString()) : 'Non spécifié'}
                    </Typography>
                  </Box>
                </Box>
              </Box>
            </Paper>
          </Grid>

          {/* Types de cargaison */}
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3, borderRadius: 2 }}>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 700, color: '#1a237e' }}>
                Types de Cargaison
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {haulage.cargoTypes && haulage.cargoTypes.length > 0 ? (
                  haulage.cargoTypes.map((cargoType, index) => (
                    <Chip
                      key={index}
                      label={cargoType}
                      color="primary"
                      variant="outlined"
                      sx={{ fontWeight: 600 }}
                    />
                  ))
                ) : (
                  <Typography variant="body2" sx={{ color: '#666', fontStyle: 'italic' }}>
                    Aucun type de cargaison spécifié
                  </Typography>
                )}
              </Box>
            </Paper>
          </Grid>

          {/* Assurance transport */}
          {haulage.transportInsurance && (
            <Grid item xs={12}>
              <Paper sx={{ p: 3, borderRadius: 2, bgcolor: 'rgba(76, 175, 80, 0.05)' }}>
                <Typography variant="h6" sx={{ mb: 2, fontWeight: 700, color: '#1a237e' }}>
                  Assurance Transport
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                      <Avatar sx={{ bgcolor: haulage.transportInsurance.isInsured ? 'success.main' : 'error.main', width: 40, height: 40 }}>
                        <SecurityIcon />
                      </Avatar>
                      <Box>
                        <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                          Statut
                        </Typography>
                        <Typography variant="body1">
                          {haulage.transportInsurance.isInsured ? 'Assuré' : 'Non assuré'}
                        </Typography>
                      </Box>
                    </Box>
                  </Grid>
                  {haulage.transportInsurance.isInsured && (
                    <>
                      <Grid item xs={12} md={6}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                          Taux d'assurance
                        </Typography>
                        <Typography variant="body2">
                          {haulage.transportInsurance.rate}%
                        </Typography>
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                          Montant minimum
                        </Typography>
                        <Typography variant="body2">
                          {haulage.transportInsurance.minimumAmount} {haulage.transportInsurance.currency || 'EUR'}
                        </Typography>
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                          Montant maximum
                        </Typography>
                        <Typography variant="body2">
                          {haulage.transportInsurance.maximumAmount} {haulage.transportInsurance.currency || 'EUR'}
                        </Typography>
                      </Grid>
                    </>
                  )}
                </Grid>
              </Paper>
            </Grid>
          )}

          {/* Conditions de livraison */}
          {haulage.deliveryTerms && (
            <Grid item xs={12}>
              <Paper sx={{ p: 3, borderRadius: 2, bgcolor: 'rgba(255, 152, 0, 0.05)' }}>
                <Typography variant="h6" sx={{ mb: 2, fontWeight: 700, color: '#1a237e' }}>
                  Conditions de Livraison
                </Typography>
                <Typography variant="body1">
                  {haulage.deliveryTerms}
                </Typography>
              </Paper>
            </Grid>
          )}

          {/* Commentaires */}
          {haulage.comment && (
            <Grid item xs={12}>
              <Paper sx={{ p: 3, borderRadius: 2, bgcolor: 'rgba(156, 39, 176, 0.05)' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                  <Avatar sx={{ bgcolor: 'secondary.main', width: 40, height: 40 }}>
                    <CommentIcon />
                  </Avatar>
                  <Typography variant="h6" sx={{ fontWeight: 700, color: '#1a237e' }}>
                    Commentaires
                  </Typography>
                </Box>
                <Typography variant="body1" sx={{ fontStyle: 'italic' }}>
                  {haulage.comment}
                </Typography>
              </Paper>
            </Grid>
          )}

          {/* Informations de création */}
          <Grid item xs={12}>
            <Paper sx={{ p: 3, borderRadius: 2, bgcolor: 'rgba(158, 158, 158, 0.05)' }}>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 700, color: '#1a237e' }}>
                Informations de Création
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                    Créé par
                  </Typography>
                  <Typography variant="body2">
                    {haulage.createdBy || 'Non spécifié'}
                  </Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                    Date de création
                  </Typography>
                  <Typography variant="body2">
                    {haulage.createdAt ? formatDate(haulage.createdAt.toString()) : 'Non spécifié'}
                  </Typography>
                </Grid>
                {haulage.lastUpdatedBy && (
                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                      Dernière modification par
                    </Typography>
                    <Typography variant="body2">
                      {haulage.lastUpdatedBy}
                    </Typography>
                  </Grid>
                )}
                {haulage.lastUpdatedAt && (
                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                      Date de dernière modification
                    </Typography>
                    <Typography variant="body2">
                      {haulage.lastUpdatedAt ? formatDate(haulage.lastUpdatedAt.toString()) : 'Non spécifié'}
                    </Typography>
                  </Grid>
                )}
              </Grid>
            </Paper>
          </Grid>
        </Grid>
      </DialogContent>

      <DialogActions sx={{ p: 3, pt: 0 }}>
        <Button
          onClick={onClose}
          variant="contained"
          sx={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            borderRadius: 2,
            px: 3,
            py: 1.5,
            fontWeight: 600,
            textTransform: 'none',
            '&:hover': {
              background: 'linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)'
            }
          }}
        >
          Fermer
        </Button>
        <Button
          onClick={() => {
            if (haulage.offerId) {
              onClose && onClose();
              navigate(`/pricingnew/haulage/${haulage.offerId}`);
            } else {
              alert('ID de l\'offre non disponible pour l\'édition');
            }
          }}
          variant="outlined"
          disabled={!haulage.offerId}
          sx={{
            borderRadius: 2,
            px: 3,
            py: 1.5,
            fontWeight: 600,
            textTransform: 'none',
            ml: 2
          }}
        >
          Modifier
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default HaulageDetails; 