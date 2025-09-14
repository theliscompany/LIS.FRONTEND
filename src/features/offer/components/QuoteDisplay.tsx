import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Chip,
  Grid,
  Divider,
  Avatar,
  IconButton,
  Tooltip,
  Paper,
  Stack,
  Badge,
  LinearProgress
} from '@mui/material';
import {
  Business,
  LocationOn,
  LocalShipping,
  DirectionsBoat,
  Inventory,
  AttachMoney,
  Schedule,
  Person,
  Email,
  Phone,
  Description,
  Euro,
  TrendingUp,
  CheckCircle,
  Warning,
  Info,
  Visibility,
  Edit,
  Settings
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { statusLabel, colorsTypes } from '@utils/functions';
// import { QuoteOfferStatus, ClientApprovalStatus } from '@features/offer/api/types.gen';

// Type temporaire pour éviter les erreurs
type QuoteOfferStatus = string;

interface QuoteDisplayProps {
  quote: any;
  showActions?: boolean;
  onAction?: (action: string, quoteId: string) => void;
  compact?: boolean;
}

const QuoteDisplay = React.forwardRef<HTMLDivElement, QuoteDisplayProps>(({ 
  quote, 
  showActions = false, 
  onAction,
  compact = false 
}, ref) => {
  // const { t } = useTranslation(); // Commenté car non utilisé
  const navigate = useNavigate();

  if (!quote) {
    return (
      <Card sx={{ p: 3, textAlign: 'center' }}>
        <Typography variant="body2" color="text.secondary">
          Aucun devis à afficher
        </Typography>
      </Card>
    );
  }

  const getStatusIcon = (status: QuoteOfferStatus) => {
    switch (status) {
      case 'APPROVED':
        return <CheckCircle color="success" />;
      case 'PENDING_APPROVAL':
        return <Schedule color="warning" />;
      case 'SENT_TO_CLIENT':
        return <Info color="info" />;
      case 'DRAFT':
        return <Description color="action" />;
      default:
        return <Info color="action" />;
    }
  };

  const getTotalPrice = () => {
    if (!quote.options || quote.options.length === 0) return 0;
    const option = quote.options[0];
    return (
      (option.totals?.haulageTotal || 0) +
      (option.totals?.seafreightTotal || 0) +
      (option.totals?.miscellaneousTotal || 0)
    );
  };

  const getRouteInfo = () => {
    if (!quote.options || quote.options.length === 0) return { from: 'N/A', to: 'N/A' };
    
    const option = quote.options[0];
    const from = option.selectedHaulage?.loadingCityName || 
                 option.selectedHaulage?.pickupAddress?.city || 
                 option.portDeparture?.portName || 'Départ';
    const to = option.selectedSeafreights?.[0]?.destinationPortName || 
               option.selectedSeafreights?.[0]?.destinationPort?.portName || 
               option.portDestination?.portName || 'Arrivée';
    
    return { from, to };
  };

  const routeInfo = getRouteInfo();
  const totalPrice = getTotalPrice();

  const handleViewDetails = () => {
    console.log('[QuoteDisplay] Clic sur bouton voir détails, navigation vers QuoteViewer avec ID:', quote.id);
    navigate(`/quote-viewer/${quote.id}`);
  };

  if (compact) {
    return (
      <Card 
        ref={ref}
        sx={{ 
          p: 2, 
          mb: 2, 
          background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
          transition: 'all 0.3s ease',
          '&:hover': {
            transform: 'translateY(-2px)',
            boxShadow: '0 8px 25px rgba(0,0,0,0.15)',
            background: 'linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%)'
          }
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
          <Box sx={{ flex: 1 }}>
            <Typography variant="h6" fontWeight="bold" color="primary">
              Devis #{quote.quoteOfferNumber || `DRAFT-${quote.id.slice(-6)}`}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              ID: {quote.id} • Demande #{quote.requestQuoteId}
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Chip
              icon={getStatusIcon(quote.status)}
              label={statusLabel(quote.status)}
              color={colorsTypes(quote.status) as any}
              size="small"
            />
            {showActions && onAction && (
              <>
                <Tooltip title="Voir les détails">
                  <IconButton
                    size="small"
                    onClick={() => onAction('view', quote.id)}
                    sx={{ 
                      bgcolor: 'primary.light', 
                      color: 'white',
                      '&:hover': { 
                        bgcolor: 'primary.main',
                        transform: 'scale(1.1)'
                      },
                      transition: 'all 0.2s ease'
                    }}
                  >
                    <Visibility fontSize="small" />
                  </IconButton>
                </Tooltip>
                
                <Tooltip title="Voir en mode viewer">
                  <IconButton
                    size="small"
                    onClick={() => onAction('viewer', quote.id)}
                    sx={{ 
                      bgcolor: 'info.light', 
                      color: 'white',
                      '&:hover': { 
                        bgcolor: 'info.main',
                        transform: 'scale(1.1)'
                      },
                      transition: 'all 0.2s ease'
                    }}
                  >
                    <Visibility fontSize="small" />
                  </IconButton>
                </Tooltip>
                
                <Tooltip title="Édition wizard">
                  <IconButton
                    size="small"
                    onClick={() => onAction('edit', quote.id)}
                    sx={{ 
                      bgcolor: 'secondary.light', 
                      color: 'white',
                      '&:hover': { 
                        bgcolor: 'secondary.main',
                        transform: 'scale(1.1)'
                      },
                      transition: 'all 0.2s ease'
                    }}
                  >
                    <Edit fontSize="small" />
                  </IconButton>
                </Tooltip>
                
                <Tooltip title="Édition directe">
                  <IconButton
                    size="small"
                    onClick={() => onAction('edit-direct', quote.id)}
                    sx={{ 
                      bgcolor: 'info.light', 
                      color: 'white',
                      '&:hover': { 
                        bgcolor: 'info.main',
                        transform: 'scale(1.1)'
                      },
                      transition: 'all 0.2s ease'
                    }}
                  >
                    <Settings fontSize="small" />
                  </IconButton>
                </Tooltip>
              </>
            )}
            {!showActions && (
              <Tooltip title="Voir les détails complets">
                <IconButton
                  size="small"
                  onClick={handleViewDetails}
                  sx={{ 
                    bgcolor: 'primary.light', 
                    color: 'white',
                    '&:hover': { 
                      bgcolor: 'primary.main',
                      transform: 'scale(1.1)'
                    },
                    transition: 'all 0.2s ease'
                  }}
                >
                  <Visibility fontSize="small" />
                </IconButton>
              </Tooltip>
            )}
          </Box>
        </Box>
        
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <LocationOn color="action" sx={{ mr: 1, fontSize: 16 }} />
          <Typography variant="body2">
            {routeInfo.from} → {routeInfo.to}
          </Typography>
        </Box>
        
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Person color="action" sx={{ mr: 1, fontSize: 16 }} />
            <Typography variant="body2">{quote.emailUser}</Typography>
          </Box>
          <Typography variant="h6" color="success.main" fontWeight="bold">
            € {totalPrice.toLocaleString()}
          </Typography>
        </Box>
      </Card>
    );
  }

  return (
    <Card 
      ref={ref}
      sx={{ 
        p: 3, 
        mb: 3, 
        background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
        borderRadius: 3,
        boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
        transition: 'all 0.3s ease',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: '0 12px 40px rgba(0,0,0,0.15)',
          background: 'linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%)'
        }
      }}
    >
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
        <Box sx={{ flex: 1 }}>
          <Typography variant="h4" fontWeight="bold" color="primary" gutterBottom>
            Devis #{quote.quoteOfferNumber || `DRAFT-${quote.id.slice(-6)}`}
          </Typography>
          <Typography variant="body1" color="text.secondary">
            ID: {quote.id} • Demande #{quote.requestQuoteId} • Créé le {new Date(quote.created).toLocaleDateString('fr-FR')}
          </Typography>
        </Box>
        <Stack direction="row" spacing={1} alignItems="center">
          <Chip
            icon={getStatusIcon(quote.status)}
            label={statusLabel(quote.status)}
            color={colorsTypes(quote.status) as any}
            size="medium"
            sx={{ fontWeight: 'bold' }}
          />
          {quote.clientApproval && (
            <Chip
              label={quote.clientApproval}
              color={colorsTypes(quote.clientApproval) as any}
              size="medium"
              variant="outlined"
            />
          )}
          <Tooltip title="Voir les détails complets">
            <IconButton
              size="medium"
              onClick={handleViewDetails}
              sx={{ 
                bgcolor: 'primary.light', 
                color: 'white',
                '&:hover': { 
                  bgcolor: 'primary.main',
                  transform: 'scale(1.1)'
                },
                transition: 'all 0.2s ease'
              }}
            >
              <Visibility />
            </IconButton>
          </Tooltip>
          <Tooltip title="Édition directe">
            <IconButton
              size="medium"
              onClick={() => navigate(`/quote-offers/${quote.id}`)}
              sx={{ 
                bgcolor: 'info.light', 
                color: 'white',
                '&:hover': { 
                  bgcolor: 'info.main',
                  transform: 'scale(1.1)'
                },
                transition: 'all 0.2s ease'
              }}
            >
              <Settings />
            </IconButton>
          </Tooltip>
        </Stack>
      </Box>

      <Divider sx={{ mb: 3 }} />

      {/* Route Information */}
      <Paper sx={{ p: 3, mb: 3, background: 'rgba(255,255,255,0.8)' }}>
        <Typography variant="h6" fontWeight="bold" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
          <LocationOn color="primary" sx={{ mr: 1 }} />
          Trajet
        </Typography>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Box sx={{ display: 'flex', alignItems: 'center', p: 2, bgcolor: 'primary.light', borderRadius: 2 }}>
              <LocalShipping sx={{ mr: 2, color: 'white' }} />
              <Box>
                <Typography variant="body2" color="white" fontWeight="bold">Départ</Typography>
                <Typography variant="h6" color="white">{routeInfo.from}</Typography>
              </Box>
            </Box>
          </Grid>
          <Grid item xs={12} md={6}>
            <Box sx={{ display: 'flex', alignItems: 'center', p: 2, bgcolor: 'secondary.light', borderRadius: 2 }}>
              <DirectionsBoat sx={{ mr: 2, color: 'white' }} />
              <Box>
                <Typography variant="body2" color="white" fontWeight="bold">Arrivée</Typography>
                <Typography variant="h6" color="white">{routeInfo.to}</Typography>
              </Box>
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {/* Pricing Information */}
      <Paper sx={{ p: 3, mb: 3, background: 'rgba(255,255,255,0.8)' }}>
        <Typography variant="h6" fontWeight="bold" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
          <AttachMoney color="success" sx={{ mr: 1 }} />
          Détails Tarifaires
        </Typography>
        
        {quote.options && quote.options.length > 0 && (
          <Grid container spacing={2}>
            {quote.options.map((option: any, index: number) => (
              <Grid item xs={12} key={index}>
                <Box sx={{ p: 2, border: '1px solid #e0e0e0', borderRadius: 2 }}>
                  <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                    Option {index + 1}
                  </Typography>
                  
                  <Grid container spacing={2}>
                    {option.totals?.haulageTotal && (
                      <Grid item xs={12} sm={4}>
                        <Box sx={{ textAlign: 'center', p: 1 }}>
                          <LocalShipping color="primary" sx={{ fontSize: 40, mb: 1 }} />
                          <Typography variant="h6" color="primary">€ {option.totals.haulageTotal.toLocaleString()}</Typography>
                          <Typography variant="body2" color="text.secondary">Transport</Typography>
                        </Box>
                      </Grid>
                    )}
                    
                    {option.totals?.seafreightTotal && (
                      <Grid item xs={12} sm={4}>
                        <Box sx={{ textAlign: 'center', p: 1 }}>
                          <DirectionsBoat color="secondary" sx={{ fontSize: 40, mb: 1 }} />
                          <Typography variant="h6" color="secondary">€ {option.totals.seafreightTotal.toLocaleString()}</Typography>
                          <Typography variant="body2" color="text.secondary">Fret Maritime</Typography>
                        </Box>
                      </Grid>
                    )}
                    
                    {option.totals?.miscellaneousTotal && (
                      <Grid item xs={12} sm={4}>
                        <Box sx={{ textAlign: 'center', p: 1 }}>
                          <Inventory color="info" sx={{ fontSize: 40, mb: 1 }} />
                          <Typography variant="h6" color="info">€ {option.totals.miscellaneousTotal.toLocaleString()}</Typography>
                          <Typography variant="body2" color="text.secondary">Divers</Typography>
                        </Box>
                      </Grid>
                    )}
                  </Grid>
                  
                  <Divider sx={{ my: 2 }} />
                  
                  <Box sx={{ textAlign: 'center', p: 2, bgcolor: 'success.light', borderRadius: 2 }}>
                    <Typography variant="h4" color="success.dark" fontWeight="bold">
                      Total: € {option.totals?.grandTotal?.toLocaleString() || totalPrice.toLocaleString()}
                    </Typography>
                  </Box>
                </Box>
              </Grid>
            ))}
          </Grid>
        )}
      </Paper>

      {/* Customer Information */}
      {quote.customer && (
        <Paper sx={{ p: 3, mb: 3, background: 'rgba(255,255,255,0.8)' }}>
          <Typography variant="h6" fontWeight="bold" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
            <Business color="primary" sx={{ mr: 1 }} />
            Informations Client
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Person color="action" sx={{ mr: 2 }} />
                <Box>
                  <Typography variant="body1" fontWeight="medium">
                    {quote.customer.contactName || 'N/A'}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Contact principal
                  </Typography>
                </Box>
              </Box>
            </Grid>
            <Grid item xs={12} md={6}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Email color="action" sx={{ mr: 2 }} />
                <Box>
                  <Typography variant="body1" fontWeight="medium">
                    {quote.customer.email || 'Email non disponible'}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Email de contact
                  </Typography>
                </Box>
              </Box>
            </Grid>
          </Grid>
        </Paper>
      )}

      {/* Comments */}
      {(quote.comment || quote.internalComment) && (
        <Paper sx={{ p: 3, mb: 3, background: 'rgba(255,255,255,0.8)' }}>
          <Typography variant="h6" fontWeight="bold" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
            <Description color="primary" sx={{ mr: 1 }} />
            Commentaires
          </Typography>
          
          {quote.comment && (
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle2" color="primary" gutterBottom>
                Commentaire Client
              </Typography>
              <Typography variant="body2" sx={{ p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
                {quote.comment}
              </Typography>
            </Box>
          )}
          
          {quote.internalComment && (
            <Box>
              <Typography variant="subtitle2" color="secondary" gutterBottom>
                Commentaire Interne
              </Typography>
              <Typography variant="body2" sx={{ p: 2, bgcolor: 'warning.50', borderRadius: 1 }}>
                {quote.internalComment}
              </Typography>
            </Box>
          )}
        </Paper>
      )}

      {/* Actions */}
      {showActions && onAction && (
        <Box 
          sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 3 }}
          onClick={(e) => e.stopPropagation()} // Empêcher la propagation du clic
        >
          <Tooltip title="Voir les détails">
            <IconButton 
              color="primary" 
              onClick={() => onAction('view', quote.id)}
              sx={{ bgcolor: 'primary.light', '&:hover': { bgcolor: 'primary.main' } }}
            >
              <Visibility />
            </IconButton>
          </Tooltip>
          
          <Tooltip title="Édition wizard">
            <IconButton 
              color="secondary" 
              onClick={() => onAction('edit', quote.id)}
              sx={{ bgcolor: 'secondary.light', '&:hover': { bgcolor: 'secondary.main' } }}
            >
              <Edit />
            </IconButton>
          </Tooltip>
          
          <Tooltip title="Édition directe">
            <IconButton 
              color="info" 
              onClick={() => onAction('edit-direct', quote.id)}
              sx={{ bgcolor: 'info.light', '&:hover': { bgcolor: 'info.main' } }}
            >
              <Settings />
            </IconButton>
          </Tooltip>
          
          {quote.status === 'PENDING_APPROVAL' && (
            <>
              <Tooltip title="Approuver le devis">
                <IconButton 
                  color="success" 
                  onClick={() => onAction('approve', quote.id)}
                  sx={{ bgcolor: 'success.light', '&:hover': { bgcolor: 'success.main' } }}
                >
                  <CheckCircle />
                </IconButton>
              </Tooltip>
              
              <Tooltip title="Rejeter le devis">
                <IconButton 
                  color="error" 
                  onClick={() => onAction('reject', quote.id)}
                  sx={{ bgcolor: 'error.light', '&:hover': { bgcolor: 'error.main' } }}
                >
                  <Warning />
                </IconButton>
              </Tooltip>
            </>
          )}
          
          {quote.status === 'APPROVED' && (
            <Tooltip title="Envoyer au client">
              <IconButton 
                color="info" 
                onClick={() => onAction('send', quote.id)}
                sx={{ bgcolor: 'info.light', '&:hover': { bgcolor: 'info.main' } }}
              >
                <Email />
              </IconButton>
            </Tooltip>
          )}
        </Box>
      )}
    </Card>
  );
});

export default QuoteDisplay; 