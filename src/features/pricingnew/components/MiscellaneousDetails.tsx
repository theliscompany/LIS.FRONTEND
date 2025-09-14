import React from 'react';
import { Box, Paper, Button, Avatar, Typography, Grid, Chip } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { MiscellaneousResponse } from '../api/types.gen';
import InfoIcon from '@mui/icons-material/Info';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import Inventory2Icon from '@mui/icons-material/Inventory2';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import BusinessIcon from '@mui/icons-material/Business';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import CommentIcon from '@mui/icons-material/Comment';

interface MiscellaneousDetailsProps {
  miscellaneous: MiscellaneousResponse;
  onClose?: () => void;
  asPage?: boolean;
  onEdit?: (id: string) => void;
}

const MiscellaneousDetails: React.FC<MiscellaneousDetailsProps> = ({
  miscellaneous,
  onClose,
  asPage = false,
  onEdit
}) => {
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

  const getServiceTypeLabel = (type: number) => {
    const types = {
      0: 'Warehousing',
      1: 'Customs Clearance',
      2: 'Insurance',
      3: 'Port Handling',
      4: 'Packaging',
      5: 'Loading',
      6: 'Unloading',
      7: 'Inspection',
      8: 'Documentation',
      9: 'Other'
    };
    return types[type as keyof typeof types] || 'Unknown';
  };

  const getPricingTypeLabel = (type: number) => {
    const types = {
      0: 'Prix fixe',
      1: 'Par unité',
      2: 'Par jour',
      3: 'Pourcentage',
      4: 'Sur demande'
    };
    return types[type as keyof typeof types] || 'Unknown';
  };

  const getContainerTypeLabel = (type: number) => {
    const types = {
      0: 'Dry Container 20\'',
      1: 'Dry Container 40\'',
      2: 'Dry Container 40\'HC',
      3: 'Reefer Container 20\'',
      4: 'Reefer Container 40\'',
      5: 'Open Top 20\'',
      6: 'Open Top 40\'',
      7: 'Flat Rack 20\'',
      8: 'Flat Rack 40\'',
      9: 'Tank 20\'',
      10: 'Tank 40\'',
      11: 'Bulk Container',
      12: 'Special Equipment'
    };
    return types[type as keyof typeof types] || 'Unknown';
  };

  if (asPage) {
    return (
      <Box sx={{ minHeight: '100vh', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', py: 4 }}>
        <Box sx={{ maxWidth: 'md', mx: 'auto' }}>
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mb: 2 }}>
            <Button
              variant="contained"
              onClick={() => navigate('/pricingnew/miscellaneous')}
              sx={{ 
                borderRadius: 2, 
                fontWeight: 600,
                bgcolor: 'white',
                color: '#667eea',
                '&:hover': {
                  bgcolor: '#f5f5f5',
                  color: '#5a6fd8'
                }
              }}
            >
              Retour à la liste
            </Button>
            <Button
              variant="contained"
              onClick={() => {
                if (miscellaneous.id) {
                  if (onEdit) {
                    onEdit(miscellaneous.id);
                  } else {
                    navigate(`/pricingnew/miscellaneous/${miscellaneous.id}`);
                  }
                } else {
                  alert('ID du service non disponible pour l\'édition');
                }
              }}
              disabled={!miscellaneous.id}
              sx={{ borderRadius: 2, fontWeight: 600 }}
            >
              Éditer ce service
            </Button>
          </Box>
          <Paper sx={{ p: 3, borderRadius: 3, background: 'rgba(255,255,255,0.95)', boxShadow: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
              <Avatar sx={{ bgcolor: 'rgba(102, 126, 234, 0.15)' }}>
                <InfoIcon />
              </Avatar>
              <Typography variant="h4" sx={{ fontWeight: 700 }}>
                Détails du Service Miscellaneous
              </Typography>
            </Box>
            {/* Informations générales */}
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 3, mb: 3, borderRadius: 2, bgcolor: 'rgba(102, 126, 234, 0.05)' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                  <Avatar sx={{ bgcolor: 'primary.main' }}><InfoIcon /></Avatar>
                  <Typography variant="h6" sx={{ fontWeight: 700, color: '#1a237e' }}>Informations Générales</Typography>
                </Box>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>ID</Typography>
                    <Typography variant="body1">{miscellaneous.id}</Typography>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>Nom du service</Typography>
                    <Typography variant="body1">{miscellaneous.serviceName || 'N/A'}</Typography>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>Fournisseur</Typography>
                    <Typography variant="body1">{miscellaneous.serviceProviderName || 'N/A'}</Typography>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>Type de service</Typography>
                    <Typography variant="body1">{getServiceTypeLabel(miscellaneous.serviceType)}</Typography>
                  </Grid>
                  <Grid item xs={12}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>Description</Typography>
                    <Typography variant="body1">{miscellaneous.serviceDescription || 'N/A'}</Typography>
                  </Grid>
                </Grid>
              </Paper>
            </Grid>
            {/* Ports et Localisation */}
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 3, mb: 3, borderRadius: 2, height: '100%', bgcolor: 'rgba(76, 175, 80, 0.05)' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                  <Avatar sx={{ bgcolor: 'warning.main' }}><LocalShippingIcon /></Avatar>
                  <Typography variant="h6" sx={{ fontWeight: 700, color: '#1a237e' }}>Ports & Localisation</Typography>
                </Box>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>Port de départ</Typography>
                    <Typography variant="body1">{miscellaneous.departurePortName || 'N/A'}</Typography>
                  </Grid>
                  {miscellaneous.destinationPortName && (
                    <Grid item xs={12} md={6}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>Port de destination</Typography>
                      <Typography variant="body1">{miscellaneous.destinationPortName}</Typography>
                    </Grid>
                  )}
                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>Ville</Typography>
                    <Typography variant="body1">{miscellaneous.locationCity || 'N/A'}</Typography>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>Pays</Typography>
                    <Typography variant="body1">{miscellaneous.locationCountry || 'N/A'}</Typography>
                  </Grid>
                </Grid>
              </Paper>
            </Grid>
            {/* Types de Containers Applicables */}
            <Grid item xs={12} md={4}>
              <Paper sx={{ p: 3, mb: 3, borderRadius: 2, height: '100%', bgcolor: 'rgba(255, 152, 0, 0.05)' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                  <Avatar sx={{ bgcolor: 'success.main' }}><Inventory2Icon /></Avatar>
                  <Typography variant="h6" sx={{ fontWeight: 700, color: '#1a237e' }}>Types de Containers</Typography>
                </Box>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {miscellaneous.applicableContainerTypes && miscellaneous.applicableContainerTypes.length > 0 ? (
                    miscellaneous.applicableContainerTypes.map((type: number, index: number) => (
                      <Chip key={index} label={getContainerTypeLabel(type)} color="primary" variant="outlined" sx={{ fontWeight: 600 }} />
                    ))
                  ) : (
                    <Typography variant="body2" sx={{ color: '#666', fontStyle: 'italic' }}>
                      Aucun type spécifié
                    </Typography>
                  )}
                </Box>
              </Paper>
            </Grid>
            {/* Durée et conditions */}
            <Grid item xs={12} md={4}>
              <Paper sx={{ p: 3, mb: 3, borderRadius: 2, height: '100%', bgcolor: 'rgba(156, 39, 176, 0.05)' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                  <Avatar sx={{ bgcolor: 'secondary.main' }}><CalendarMonthIcon /></Avatar>
                  <Typography variant="h6" sx={{ fontWeight: 700, color: '#1a237e' }}>Durée & Conditions</Typography>
                </Box>
                {miscellaneous.serviceDurationHours && (
                  <>
                    <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>Durée en heures</Typography>
                    <Typography variant="body1" sx={{ mb: 2 }}>{miscellaneous.serviceDurationHours}h</Typography>
                  </>
                )}
                {miscellaneous.serviceDurationDescription && (
                  <>
                    <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>Description de la durée</Typography>
                    <Typography variant="body1" sx={{ mb: 2 }}>{miscellaneous.serviceDurationDescription}</Typography>
                  </>
                )}
                {miscellaneous.specialConditions && miscellaneous.specialConditions.length > 0 && (
                  <>
                    <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>Conditions spéciales</Typography>
                    <ul style={{ margin: 0, paddingLeft: 18 }}>
                      {miscellaneous.specialConditions.map((condition: string, index: number) => (
                        <li key={index} style={{ fontSize: 14 }}>{condition}</li>
                      ))}
                    </ul>
                  </>
                )}
              </Paper>
            </Grid>
            {/* Validité et Devise */}
            <Grid item xs={12} md={4}>
              <Paper sx={{ p: 3, mb: 3, borderRadius: 2, height: '100%', bgcolor: 'rgba(0, 150, 136, 0.05)' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                  <Avatar sx={{ bgcolor: 'teal.main' }}><CalendarMonthIcon /></Avatar>
                  <Typography variant="h6" sx={{ fontWeight: 700, color: '#1a237e' }}>Validité & Devise</Typography>
                </Box>
                <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>Date de début</Typography>
                <Typography variant="body1" sx={{ mb: 2 }}>{formatDate(miscellaneous.validFrom)}</Typography>
                <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>Date de fin</Typography>
                <Typography variant="body1" sx={{ mb: 2 }}>{formatDate(miscellaneous.validUntil)}</Typography>
                <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>Devise</Typography>
                <Typography variant="body1">{miscellaneous.currency || 'N/A'}</Typography>
              </Paper>
            </Grid>
            {/* Tarification */}
            <Grid item xs={12}>
              <Paper sx={{ p: 3, mb: 3, borderRadius: 2, bgcolor: 'rgba(255, 193, 7, 0.05)' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                  <Avatar sx={{ bgcolor: 'warning.main' }}><MonetizationOnIcon /></Avatar>
                  <Typography variant="h6" sx={{ fontWeight: 700, color: '#1a237e' }}>Tarification</Typography>
                </Box>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={3}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>Type de tarification</Typography>
                    <Typography variant="body1">{getPricingTypeLabel(miscellaneous.pricing.pricingType)}</Typography>
                  </Grid>
                  <Grid item xs={12} md={3}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>Prix de base</Typography>
                    <Typography variant="body1">{miscellaneous.pricing.basePrice} {miscellaneous.currency}</Typography>
                  </Grid>
                  <Grid item xs={12} md={3}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>Devis requis</Typography>
                    <Typography variant="body1">{miscellaneous.pricing.isQuoteRequired ? 'Oui' : 'Non'}</Typography>
                  </Grid>
                  {miscellaneous.pricing.minimumCharge && (
                    <Grid item xs={12} md={3}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>Charge minimum</Typography>
                      <Typography variant="body1">{miscellaneous.pricing.minimumCharge} {miscellaneous.currency}</Typography>
                    </Grid>
                  )}
                  {miscellaneous.pricing.maximumCharge && (
                    <Grid item xs={12} md={3}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>Charge maximum</Typography>
                      <Typography variant="body1">{miscellaneous.pricing.maximumCharge} {miscellaneous.currency}</Typography>
                    </Grid>
                  )}
                  {miscellaneous.pricing.description && (
                    <Grid item xs={12}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>Description de la tarification</Typography>
                      <Typography variant="body1">{miscellaneous.pricing.description}</Typography>
                    </Grid>
                  )}
                </Grid>
              </Paper>
            </Grid>
            {/* Commentaires */}
            {miscellaneous.comment && (
              <Grid item xs={12}>
                <Paper sx={{ p: 3, mb: 3, borderRadius: 2, bgcolor: 'rgba(156, 39, 176, 0.05)' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                    <Avatar sx={{ bgcolor: 'error.main' }}><CommentIcon /></Avatar>
                    <Typography variant="h6" sx={{ fontWeight: 700, color: '#1a237e' }}>Commentaires</Typography>
                  </Box>
                  <Typography variant="body1" sx={{ fontStyle: 'italic' }}>
                    {miscellaneous.comment}
                  </Typography>
                </Paper>
              </Grid>
            )}
          </Paper>
        </Box>
      </Box>
    );
  }
  // Mode modal classique
  return (
    <div className="miscellaneous-details-overlay">
      <div className="miscellaneous-details-modal">
        <div className="modal-header">
          <h2>Détails du service</h2>
          <button type="button" className="close-btn" onClick={onClose}>
            ×
          </button>
        </div>

        <div className="modal-content">
          <div className="details-section">
            <h3>Informations générales</h3>
            <div className="details-grid">
              <div className="detail-item">
                <label>ID:</label>
                <span>{miscellaneous.id}</span>
              </div>
              <div className="detail-item">
                <label>Nom du service:</label>
                <span>{miscellaneous.serviceName || 'N/A'}</span>
              </div>
              <div className="detail-item">
                <label>Fournisseur:</label>
                <span>{miscellaneous.serviceProviderName || 'N/A'}</span>
              </div>
              <div className="detail-item">
                <label>Type de service:</label>
                <span>{getServiceTypeLabel(miscellaneous.serviceType)}</span>
              </div>
              <div className="detail-item">
                <label>Description:</label>
                <span>{miscellaneous.serviceDescription || 'N/A'}</span>
              </div>
            </div>
          </div>

          <div className="details-section">
            <h3>Ports</h3>
            <div className="details-grid">
              <div className="detail-item">
                <label>Port de départ:</label>
                <span>{miscellaneous.departurePortName} ({miscellaneous.departurePortCode})</span>
              </div>
              {miscellaneous.destinationPortName && (
                <div className="detail-item">
                  <label>Port de destination:</label>
                  <span>{miscellaneous.destinationPortName} ({miscellaneous.destinationPortCode})</span>
                </div>
              )}
            </div>
          </div>

          <div className="details-section">
            <h3>Types de containers applicables</h3>
            <div className="container-types">
              {miscellaneous.applicableContainerTypes && miscellaneous.applicableContainerTypes.length > 0 ? (
                <div className="tags">
                  {miscellaneous.applicableContainerTypes.map((type: number, index: number) => (
                    <span key={index} className="tag">
                      {getContainerTypeLabel(type)}
                    </span>
                  ))}
                </div>
              ) : (
                <span>Aucun type spécifié</span>
              )}
            </div>
          </div>

          <div className="details-section">
            <h3>Durée et conditions</h3>
            <div className="details-grid">
              {miscellaneous.serviceDurationHours && (
                <div className="detail-item">
                  <label>Durée en heures:</label>
                  <span>{miscellaneous.serviceDurationHours}h</span>
                </div>
              )}
              {miscellaneous.serviceDurationDescription && (
                <div className="detail-item">
                  <label>Description de la durée:</label>
                  <span>{miscellaneous.serviceDurationDescription}</span>
                </div>
              )}
              {miscellaneous.specialConditions && miscellaneous.specialConditions.length > 0 && (
                <div className="detail-item full-width">
                  <label>Conditions spéciales:</label>
                  <ul className="conditions-list">
                    {miscellaneous.specialConditions.map((condition: string, index: number) => (
                      <li key={index}>{condition}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>

          <div className="details-section">
            <h3>Localisation</h3>
            <div className="details-grid">
              <div className="detail-item">
                <label>Ville:</label>
                <span>{miscellaneous.locationCity || 'N/A'}</span>
              </div>
              <div className="detail-item">
                <label>Pays:</label>
                <span>{miscellaneous.locationCountry || 'N/A'}</span>
              </div>
              <div className="detail-item">
                <label>Devise:</label>
                <span>{miscellaneous.currency || 'N/A'}</span>
              </div>
            </div>
          </div>

          <div className="details-section">
            <h3>Validité</h3>
            <div className="details-grid">
              <div className="detail-item">
                <label>Date de début:</label>
                <span>{formatDate(miscellaneous.validFrom)}</span>
              </div>
              <div className="detail-item">
                <label>Date de fin:</label>
                <span>{formatDate(miscellaneous.validUntil)}</span>
              </div>
            </div>
          </div>

          <div className="details-section">
            <h3>Tarification</h3>
            <div className="details-grid">
              <div className="detail-item">
                <label>Type de tarification:</label>
                <span>{getPricingTypeLabel(miscellaneous.pricing.pricingType)}</span>
              </div>
              <div className="detail-item">
                <label>Prix de base:</label>
                <span>{miscellaneous.pricing.basePrice} {miscellaneous.currency}</span>
              </div>
              {miscellaneous.pricing.minimumCharge && (
                <div className="detail-item">
                  <label>Charge minimum:</label>
                  <span>{miscellaneous.pricing.minimumCharge} {miscellaneous.currency}</span>
                </div>
              )}
              {miscellaneous.pricing.maximumCharge && (
                <div className="detail-item">
                  <label>Charge maximum:</label>
                  <span>{miscellaneous.pricing.maximumCharge} {miscellaneous.currency}</span>
                </div>
              )}
              <div className="detail-item">
                <label>Devis requis:</label>
                <span>{miscellaneous.pricing.isQuoteRequired ? 'Oui' : 'Non'}</span>
              </div>
              {miscellaneous.pricing.description && (
                <div className="detail-item full-width">
                  <label>Description de la tarification:</label>
                  <span>{miscellaneous.pricing.description}</span>
                </div>
              )}
            </div>
          </div>

          {miscellaneous.comment && (
            <div className="details-section">
              <h3>Commentaires</h3>
              <p>{miscellaneous.comment}</p>
            </div>
          )}
        </div>

        <div className="modal-footer">
          <button type="button" className="btn btn-secondary" onClick={onClose}>
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
};

export default MiscellaneousDetails; 