import React, { useState, useEffect, useMemo } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  Stack,
  Divider,
  Card,
  CardContent,
  Grid,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  CircularProgress,
  Tabs,
  Tab,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Badge,
  Tooltip,
  TextField
} from '@mui/material';
import {
  CheckCircleOutline as CheckIcon,
  Edit as EditIcon,
  Save as SaveIcon,
  Send as SendIcon,
  AttachFile as AttachFileIcon,
  MonetizationOn as MonetizationOnIcon,
  LocalShipping as LocalShippingIcon,
  DirectionsBoat as DirectionsBoatIcon,
  Inventory as InventoryIcon,
  Person as PersonIcon,
  Business as BusinessIcon,
  Description as DescriptionIcon,
  ExpandMore as ExpandMoreIcon,
  Visibility as VisibilityIcon,
  Print as PrintIcon,
  Email as EmailIcon,
  Download as DownloadIcon,
  Share as ShareIcon,
  Euro as EuroIcon,
  Schedule as ScheduleIcon,
  LocationOn as LocationIcon,
  Phone as PhoneIcon,
  Web as WebIcon
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { useMsal, useAccount } from '@azure/msal-react';
import { enqueueSnackbar } from 'notistack';
import { useQuery } from '@tanstack/react-query';
import { getApiQuotesById } from '@features/offer/api';
import { getApiQuotesByIdOptions } from '@features/offer/api/@tanstack/react-query.gen';
// import type { QuoteOfferStatus, ClientApprovalStatus } from '@features/offer/api';
import QuoteEmailSender from './QuoteEmailSender';

interface QuoteViewerProps {
  quoteId: string;
  onClose?: () => void;
  isModal?: boolean;
  showActions?: boolean;
}

const QuoteViewer: React.FC<QuoteViewerProps> = ({ 
  quoteId, 
  onClose, 
  isModal = false,
  showActions = true 
}) => {
  const { t } = useTranslation();
  const { accounts } = useMsal();
  const account = useAccount(accounts[0] || {});
  const [activeTab, setActiveTab] = useState(0);
  const [showEmailSender, setShowEmailSender] = useState(false);

  // Charger les données du devis avec l'endpoint spécifique
  const queryOptions = getApiQuotesByIdOptions({ 
    path: { id: quoteId } 
  });
  console.log('[QuoteViewer] Options de requête:', queryOptions);
  console.log('[QuoteViewer] QuoteId demandé:', quoteId);
  
  const { data: quoteData, isLoading, error } = useQuery({
    ...queryOptions,
    enabled: !!quoteId,
    staleTime: 5 * 60 * 1000, // Cache 5 minutes
    gcTime: 10 * 60 * 1000, // Garde en cache 10 minutes (ancien cacheTime)
    refetchOnWindowFocus: false, // Évite les rechargements inutiles
    refetchOnMount: false // Évite les rechargements si déjà en cache
  });

  // Le devis est directement dans quoteData.data selon la structure API
  const quote = (quoteData as any)?.data;
  
  // Vérifier que l'ID correspond
  if (quote && quote.id !== quoteId) {
    console.warn('[QuoteViewer] ID mismatch:', { 
      requestedId: quoteId, 
      receivedId: quote.id 
    });
  }
  
  console.log('[QuoteViewer] === CHARGEMENT ===');
  console.log('quoteId recherché:', quoteId);
  console.log('quoteData complet:', quoteData);
  console.log('quote extrait:', quote);

  // === LOGS DÉTAILLÉS POUR DEBUG ===
  console.log('[QuoteViewer] === DEBUG PAYLOAD API ===');
  console.log('quoteId:', quoteId);
  console.log('quoteData complet:', quoteData);
  console.log('quote extrait:', quote);
  
  if (quote) {
    console.log('[QuoteViewer] === STRUCTURE DU DEVIS ===');
    console.log('ID:', quote.id);
    console.log('Numéro de devis:', quote.quoteOfferNumber);
    console.log('Demande liée:', quote.requestQuoteId);
    console.log('Client:', quote.clientNumber);
    console.log('Email utilisateur:', quote.emailUser);
    console.log('Statut:', quote.status);
    console.log('Approbation client:', quote.clientApproval);
    console.log('Créé le:', quote.created);
    console.log('Expire le:', quote.expirationDate);
    console.log('Commentaire:', quote.comment);
    console.log('Note interne:', quote.internalComment);
    
    console.log('[QuoteViewer] === OPTIONS ===');
    console.log('Nombre d\'options:', quote.options?.length);
    quote.options?.forEach((option: any, index: number) => {
      console.log(`Option ${index + 1}:`, {
        optionId: option.optionId,
        description: option.description,
        haulage: option.haulage ? {
          id: option.haulage.id,
          haulierName: option.haulage.haulierName,
          unitTariff: option.haulage.unitTariff,
          pickupAddress: option.haulage.pickupAddress,
          deliveryPort: option.haulage.deliveryPort
        } : null,
        seaFreight: option.seaFreight ? {
          id: option.seaFreight.id,
          carrierName: option.seaFreight.carrierName,
          departurePort: option.seaFreight.departurePort,
          destinationPort: option.seaFreight.destinationPort,
          containers: option.seaFreight.containers
        } : null,
        miscellaneous: option.miscellaneous?.length || 0,
        deliveryAddress: option.deliveryAddress,
        totals: option.totals
      });
    });
    
    console.log('[QuoteViewer] === FICHIERS ===');
    console.log('Nombre de fichiers:', quote.files?.length);
    quote.files?.forEach((file: any, index: number) => {
      console.log(`Fichier ${index + 1}:`, {
        id: file.id,
        fileName: file.fileName,
        contentType: file.contentType,
        size: file.size,
        uploadedAt: file.uploadedAt,
        url: file.url
      });
    });
    
    console.log('[QuoteViewer] === OPTION SÉLECTIONNÉE ===');
    console.log('Index option sélectionnée:', quote.selectedOption);
    if (quote.selectedOption !== undefined && quote.options?.[quote.selectedOption]) {
      console.log('Option sélectionnée:', quote.options[quote.selectedOption]);
    }
  }

  // Fonctions utilitaires
  const formatAddress = (addr: any) => {
    if (!addr) return '';
    if (typeof addr === 'string') return addr;
    return [addr.addressLine, addr.city, addr.postalCode, addr.country].filter(Boolean).join(', ');
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount);
  };

  // Fonction sécurisée pour formater les dates
  const formatDate = (dateValue: any): string => {
    if (!dateValue) return '-';
    
    try {
      const date = new Date(dateValue);
      if (isNaN(date.getTime())) {
        console.warn('[QuoteViewer] Date invalide:', dateValue);
        return '-';
      }
      return date.toLocaleDateString('fr-FR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      console.error('[QuoteViewer] Erreur formatage date:', error, dateValue);
      return '-';
    }
  };

  const getStatusColor = (status: QuoteOfferStatus | string) => {
    switch (status) {
      case 'DRAFT': return 'default';
      case 'PENDING_APPROVAL': return 'warning';
      case 'APPROVED': return 'success';
      case 'SENT_TO_CLIENT': return 'info';
      case 'Accepted': return 'success';
      case 'Rejected': return 'secondary';
      default: return 'default';
    }
  };

  const getStatusLabel = (status: QuoteOfferStatus | string) => {
    switch (status) {
      case 'DRAFT': return 'Brouillon';
      case 'PENDING_APPROVAL': return 'En attente d\'approbation';
      case 'APPROVED': return 'Approuvé';
      case 'SENT_TO_CLIENT': return 'Envoyé au client';
      case 'Accepted': return 'Accepté par le client';
      case 'Rejected': return 'Rejeté';
      default: return status;
    }
  };

  const getClientApprovalColor = (approval: ClientApprovalStatus | string) => {
    switch (approval) {
      case 'Pending': return 'warning';
      case 'Accepted': return 'success';
      case 'Rejected': return 'secondary';
      case 'NoResponse': return 'default';
      default: return 'default';
    }
  };

  const getClientApprovalLabel = (approval: ClientApprovalStatus | string) => {
    switch (approval) {
      case 'Pending': return 'En attente';
      case 'Accepted': return 'Accepté';
      case 'Rejected': return 'Rejeté';
      case 'NoResponse': return 'Pas de réponse';
      default: return approval;
    }
  };

  // Calculs des totaux
  const calculateOptionTotals = (option: any) => {
    const haulageTotal = option.totals?.haulageTotal || 0;
    const seafreightTotal = option.totals?.seafreightTotal || 0;
    const miscTotal = option.totals?.miscellaneousTotal || 0;
    const grandTotal = option.totals?.grandTotal || 0;

    return {
      haulageTotal,
      seafreightTotal,
      miscTotal,
      grandTotal
    };
  };

  // Actions
  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    // Logique de téléchargement
    enqueueSnackbar('Fonctionnalité de téléchargement en cours de développement', { variant: 'info' });
  };

  const handleShare = () => {
    // Logique de partage
    enqueueSnackbar('Fonctionnalité de partage en cours de développement', { variant: 'info' });
  };

  const handleSendEmail = () => {
    setShowEmailSender(true);
  };

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    console.error('[QuoteViewer] Erreur API:', error);
    console.error('[QuoteViewer] Détails de l\'erreur:', {
      message: error.message,
      status: (error as any)?.response?.status,
      data: (error as any)?.response?.data
    });
    return (
      <Alert severity="warning">
        Erreur lors du chargement du devis: {error.message || 'Erreur inconnue'}
      </Alert>
    );
  }

  if (!quote) {
    console.warn('[QuoteViewer] Aucune donnée de devis trouvée');
    return (
      <Alert severity="warning">
        Aucune donnée de devis trouvée pour l'ID: {quoteId}
      </Alert>
    );
  }

  return (
    <Box sx={{ minHeight: '100vh', background: 'linear-gradient(135deg, #f5f7fa 0%, #e3f0ff 100%)', py: 4 }}>
      <Paper
        elevation={4}
        sx={{
          maxWidth: 1400,
          mx: 'auto',
          p: { xs: 2, sm: 4 },
          borderRadius: 3,
          boxShadow: '0 8px 32px rgba(25,118,210,0.10)'
        }}
      >
        {/* Header */}
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <CheckIcon sx={{ fontSize: 48, color: 'success.main', mb: 2 }} />
          <Typography variant="h4" sx={{ fontWeight: 700, color: 'primary.main', mb: 1 }}>
            Devis #{quote.quoteOfferNumber || quote.id}
          </Typography>
          <Stack direction="row" spacing={2} justifyContent="center" alignItems="center" sx={{ mt: 2 }}>
            <Chip 
              label={getStatusLabel(quote.status)} 
              color={getStatusColor(quote.status) as any}
              variant="outlined"
            />
            {quote.clientApproval && (
              <Chip 
                label={getClientApprovalLabel(quote.clientApproval)} 
                color={getClientApprovalColor(quote.clientApproval) as any}
                variant="outlined"
              />
            )}
          </Stack>
        </Box>

        {/* Informations principales */}
        <Grid container spacing={4} sx={{ mb: 4 }}>
          <Grid item xs={12} md={8}>
            <Card sx={{ mb: 3, boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <BusinessIcon color="primary" sx={{ mr: 1 }} />
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>Informations du devis</Typography>
                </Box>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <Typography><strong>Numéro de devis :</strong> {quote.quoteOfferNumber || 'N/A'}</Typography>
                    <Typography><strong>Demande liée :</strong> {quote.requestQuoteId}</Typography>
                    <Typography><strong>Créé le :</strong> {formatDate(quote.created)}</Typography>
                    <Typography><strong>Créé par :</strong> {quote.emailUser}</Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography><strong>Client :</strong> {
                      quote.customer?.contactName || 
                      quote.customer?.companyName || 
                      quote.clientNumber || 
                      'N/A'
                    }</Typography>
                    <Typography><strong>Statut :</strong> {getStatusLabel(quote.status)}</Typography>
                    {quote.clientApproval && (
                      <Typography><strong>Approbation client :</strong> {getClientApprovalLabel(quote.clientApproval)}</Typography>
                    )}
                                    {quote.expirationDate && (
                  <Typography><strong>Expire le :</strong> {formatDate(quote.expirationDate)}</Typography>
                )}
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={4}>
            <Card sx={{ boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <MonetizationOnIcon color="primary" sx={{ mr: 1 }} />
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>Résumé financier</Typography>
                </Box>
                {quote.options && quote.options.length > 0 && (
                  <Box>
                    <Typography variant="h5" sx={{ fontWeight: 700, color: 'success.main', mb: 1 }}>
                      {formatCurrency(calculateOptionTotals(quote.options[quote.selectedOption || 0]).grandTotal)}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Option sélectionnée : {quote.selectedOption !== undefined ? quote.selectedOption + 1 : 'N/A'}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {quote.options.length} option(s) disponible(s)
                    </Typography>
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Onglets */}
        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
          <Tabs value={activeTab} onChange={(_, newValue) => setActiveTab(newValue)}>
            <Tab label="Options" />
            <Tab label="Détails" />
            <Tab label="Documents" />
            <Tab label="Historique" />
          </Tabs>
        </Box>

        {/* Contenu des onglets */}
        {activeTab === 0 && (
          <Box>
            <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
              Options du devis ({quote.options?.length || 0})
            </Typography>
            
            {quote.options?.map((option: any, index: number) => {
              const totals = calculateOptionTotals(option);
              const isSelected = index === quote.selectedOption;
              
              return (
                <Accordion 
                  key={index} 
                  defaultExpanded={isSelected}
                  sx={{ 
                    mb: 2,
                    border: isSelected ? '2px solid #1976d2' : '1px solid #e0e0e0',
                    '&:before': { display: 'none' }
                  }}
                >
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                      <Typography variant="h6" sx={{ fontWeight: 600, mr: 2 }}>
                        Option {index + 1}
                      </Typography>
                      {isSelected && (
                        <Chip label="Sélectionnée" color="primary" size="small" sx={{ mr: 2 }} />
                      )}
                      <Typography variant="h6" sx={{ fontWeight: 700, color: 'success.main', ml: 'auto' }}>
                        {formatCurrency(totals.grandTotal)}
                      </Typography>
                    </Box>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Grid container spacing={3}>
                      {/* Haulage */}
                      {option.haulage && (
                        <Grid item xs={12} md={6}>
                          <Card sx={{ boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
                            <CardContent>
                              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                <LocalShippingIcon color="primary" sx={{ mr: 1 }} />
                                <Typography variant="h6" sx={{ fontWeight: 600 }}>Transport routier</Typography>
                              </Box>
                              <Typography><strong>Transporteur :</strong> {option.haulage.haulierName}</Typography>
                              <Typography><strong>Tarif unitaire :</strong> {formatCurrency(option.haulage.unitTariff || 0)}</Typography>
                              <Typography><strong>Total :</strong> {formatCurrency(totals.haulageTotal)}</Typography>
                              {option.haulage.pickupAddress && (
                                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                                  <strong>Départ :</strong> {formatAddress(option.haulage.pickupAddress)}
                                </Typography>
                              )}
                              {option.haulage.deliveryPort && (
                                <Typography variant="body2" color="text.secondary">
                                  <strong>Arrivée :</strong> {option.haulage.deliveryPort.portName}
                                </Typography>
                              )}
                            </CardContent>
                          </Card>
                        </Grid>
                      )}

                      {/* Seafreight */}
                      {option.seaFreight && (
                        <Grid item xs={12} md={6}>
                          <Card sx={{ boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
                            <CardContent>
                              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                <DirectionsBoatIcon color="primary" sx={{ mr: 1 }} />
                                <Typography variant="h6" sx={{ fontWeight: 600 }}>Fret maritime</Typography>
                              </Box>
                              <Typography><strong>Transporteur :</strong> {option.seaFreight.carrierName}</Typography>
                              <Typography><strong>Agent :</strong> {option.seaFreight.carrierAgentName}</Typography>
                              <Typography><strong>Total :</strong> {formatCurrency(totals.seafreightTotal)}</Typography>
                              {option.seaFreight.departurePort && option.seaFreight.destinationPort && (
                                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                                  <strong>Trajet :</strong> {option.seaFreight.departurePort.portName} → {option.seaFreight.destinationPort.portName}
                                </Typography>
                              )}
                              {option.seaFreight.transitTimeDays && (
                                <Typography variant="body2" color="text.secondary">
                                  <strong>Temps de transit :</strong> {option.seaFreight.transitTimeDays} jours
                                </Typography>
                              )}
                            </CardContent>
                          </Card>
                        </Grid>
                      )}

                      {/* Services divers */}
                      {option.miscellaneous && option.miscellaneous.length > 0 && (
                        <Grid item xs={12}>
                          <Card sx={{ boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
                            <CardContent>
                              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                <InventoryIcon color="primary" sx={{ mr: 1 }} />
                                <Typography variant="h6" sx={{ fontWeight: 600 }}>Services divers</Typography>
                              </Box>
                              <TableContainer>
                                <Table size="small">
                                  <TableHead>
                                    <TableRow>
                                      <TableCell><strong>Service</strong></TableCell>
                                      <TableCell><strong>Fournisseur</strong></TableCell>
                                      <TableCell align="right"><strong>Prix</strong></TableCell>
                                    </TableRow>
                                  </TableHead>
                                  <TableBody>
                                    {option.miscellaneous.map((misc: any, miscIndex: number) => (
                                      <TableRow key={miscIndex}>
                                        <TableCell>{misc.serviceName}</TableCell>
                                        <TableCell>{misc.supplierName}</TableCell>
                                        <TableCell align="right">{formatCurrency(misc.price || 0)}</TableCell>
                                      </TableRow>
                                    ))}
                                  </TableBody>
                                </Table>
                              </TableContainer>
                              <Typography sx={{ mt: 2, fontWeight: 600 }}>
                                <strong>Total services :</strong> {formatCurrency(totals.miscTotal)}
                              </Typography>
                            </CardContent>
                          </Card>
                        </Grid>
                      )}

                      {/* Résumé financier */}
                      <Grid item xs={12}>
                        <Card sx={{ bgcolor: '#f8f9fa', border: '2px solid #28a745' }}>
                          <CardContent>
                            <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: '#28a745' }}>
                              Résumé financier - Option {index + 1}
                            </Typography>
                            <Grid container spacing={2}>
                              <Grid item xs={12} sm={6}>
                                <Typography><strong>Haulage :</strong> {formatCurrency(totals.haulageTotal)}</Typography>
                                <Typography><strong>Seafreight :</strong> {formatCurrency(totals.seafreightTotal)}</Typography>
                                <Typography><strong>Services divers :</strong> {formatCurrency(totals.miscTotal)}</Typography>
                              </Grid>
                              <Grid item xs={12} sm={6}>
                                <Typography variant="h5" sx={{ fontWeight: 700, color: '#28a745' }}>
                                  <strong>Total :</strong> {formatCurrency(totals.grandTotal)}
                                </Typography>
                              </Grid>
                            </Grid>
                          </CardContent>
                        </Card>
                      </Grid>
                    </Grid>
                  </AccordionDetails>
                </Accordion>
              );
            })}
          </Box>
        )}

        {activeTab === 1 && (
          <Box>
            <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
              Détails du devis
            </Typography>
            
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Card sx={{ boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <PersonIcon color="primary" sx={{ mr: 1 }} />
                      <Typography variant="h6" sx={{ fontWeight: 600 }}>Informations client</Typography>
                    </Box>
                    <Typography><strong>Client :</strong> {
                      quote.customer?.contactName || 
                      quote.customer?.companyName || 
                      quote.clientNumber || 
                      'N/A'
                    }</Typography>
                    <Typography><strong>Numéro client :</strong> {quote.clientNumber}</Typography>
                    <Typography><strong>Email utilisateur :</strong> {quote.emailUser}</Typography>
                    {quote.options?.[0]?.deliveryAddress && (
                      <>
                        <Typography sx={{ mt: 2 }}><strong>Adresse de livraison :</strong></Typography>
                        <Typography variant="body2" sx={{ pl: 2 }}>
                          {quote.options[0].deliveryAddress.company}<br />
                          {quote.options[0].deliveryAddress.addressLine}<br />
                          {quote.options[0].deliveryAddress.city}, {quote.options[0].deliveryAddress.postalCode}<br />
                          {quote.options[0].deliveryAddress.country}
                        </Typography>
                      </>
                    )}
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} md={6}>
                <Card sx={{ boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <DescriptionIcon color="primary" sx={{ mr: 1 }} />
                      <Typography variant="h6" sx={{ fontWeight: 600 }}>Commentaires</Typography>
                    </Box>
                    {quote.comment && (
                      <Typography sx={{ mb: 2 }}>
                        <strong>Commentaire :</strong><br />
                        {quote.comment}
                      </Typography>
                    )}
                    {quote.internalComment && (
                      <Typography>
                        <strong>Note interne :</strong><br />
                        {quote.internalComment}
                      </Typography>
                    )}
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Box>
        )}

        {activeTab === 2 && (
          <Box>
            <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
              Documents attachés
            </Typography>
            
            {quote.files && quote.files.length > 0 ? (
              <Grid container spacing={2}>
                {quote.files.map((file: any, index: number) => (
                  <Grid item xs={12} sm={6} md={4} key={index}>
                    <Card sx={{ boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
                      <CardContent>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                          <AttachFileIcon color="primary" sx={{ mr: 1 }} />
                          <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                            {file.fileName}
                          </Typography>
                        </Box>
                        <Typography variant="body2" color="text.secondary">
                          Taille : {(file.size / 1024).toFixed(1)} Ko
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Type : {file.contentType}
                        </Typography>
                        {file.uploadedAt && (
                          <Typography variant="body2" color="text.secondary">
                            Ajouté le : {formatDate(file.uploadedAt)}
                          </Typography>
                        )}
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            ) : (
              <Alert severity="info">
                Aucun document attaché à ce devis
              </Alert>
            )}
          </Box>
        )}

        {activeTab === 3 && (
          <Box>
            <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
              Historique du devis
            </Typography>
            
            <Card sx={{ boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
              <CardContent>
                <Typography><strong>Créé le :</strong> {formatDate(quote.created)}</Typography>
                <Typography><strong>Par :</strong> {quote.emailUser}</Typography>
                <Typography><strong>Statut actuel :</strong> {getStatusLabel(quote.status)}</Typography>
                {quote.clientApproval && (
                  <Typography><strong>Approbation client :</strong> {getClientApprovalLabel(quote.clientApproval)}</Typography>
                )}
                {quote.expirationDate && (
                  <Typography><strong>Date d'expiration :</strong> {formatDate(quote.expirationDate)}</Typography>
                )}
              </CardContent>
            </Card>
          </Box>
        )}

        {/* Actions */}
        {showActions && (
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4, pt: 3, borderTop: '2px solid #e3f0ff' }}>
            <Stack direction="row" spacing={2}>
              <Button
                variant="outlined"
                onClick={handlePrint}
                startIcon={<PrintIcon />}
                sx={{ px: 3, py: 1.5, borderRadius: 2 }}
              >
                Imprimer
              </Button>
              
              <Button
                variant="outlined"
                onClick={handleDownload}
                startIcon={<DownloadIcon />}
                sx={{ px: 3, py: 1.5, borderRadius: 2 }}
              >
                Télécharger
              </Button>
              
              <Button
                variant="outlined"
                onClick={handleShare}
                startIcon={<ShareIcon />}
                sx={{ px: 3, py: 1.5, borderRadius: 2 }}
              >
                Partager
              </Button>
            </Stack>
            
            <Button
              variant="contained"
              color="primary"
              onClick={handleSendEmail}
              startIcon={<EmailIcon />}
              sx={{ px: 4, py: 1.5, borderRadius: 2, fontWeight: 600 }}
            >
              Envoyer par email
            </Button>
          </Box>
        )}

        {onClose && (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
            <Button
              variant="outlined"
              onClick={onClose}
              sx={{ px: 4, py: 1.5, borderRadius: 2 }}
            >
              Fermer
            </Button>
          </Box>
        )}
      </Paper>

      {/* Email Sender Dialog */}
      {quote && showEmailSender && (
        <QuoteEmailSender
          quote={quote}
          open={showEmailSender}
          onClose={() => setShowEmailSender(false)}
          onSuccess={(result) => {
            enqueueSnackbar('Email envoyé avec succès!', { variant: 'success' });
            setShowEmailSender(false);
          }}
        />
      )}
    </Box>
  );
};

export default QuoteViewer; 