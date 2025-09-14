import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Chip,
  Grid,
  Divider,
  IconButton,
  Tooltip,
  Paper,
  Stack,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  Snackbar,
  CircularProgress,
  Avatar,
  Badge,
  LinearProgress,
  Fade,
  Zoom,
  Tabs,
  Tab
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
  Send,
  Download,
  Print,
  Share,
  Edit,
  Delete,
  Visibility,
  AttachFile,
  Language,
  Subject
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import { statusLabel, colorsTypes } from '@utils/functions';
// import { QuoteOfferStatus, ClientApprovalStatus } from '@features/offer/api/types.gen';
import { getQuote /* putApiQuoteOfferByIdStatus */ } from '@features/offer/api';

// Types temporaires pour éviter les erreurs
const QuoteOfferStatus = {
  SENT_TO_CLIENT: 'SENT_TO_CLIENT',
  APPROVED: 'APPROVED'
};
import { postApiEmail } from '@features/request/api';
import { useMsal, useAccount } from '@azure/msal-react';
import { enqueueSnackbar } from 'notistack';
import { useQueryClient } from '@tanstack/react-query';
import { getApiFileByFolderByFileNameOptions } from '@features/document/api/@tanstack/react-query.gen';
import QuoteDisplay from './QuoteDisplay';
import QuoteEmailSender from './QuoteEmailSender';
import { QuoteEmailService } from '@features/offer/services/QuoteEmailService';

interface QuoteDetailProps {
  quoteId?: string;
  onClose?: () => void;
  isModal?: boolean;
}

const QuoteDetail: React.FC<QuoteDetailProps> = ({ quoteId: propQuoteId, onClose, isModal = false }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { id: urlQuoteId } = useParams<{ id: string }>();
  const { accounts } = useMsal();
  const account = useAccount(accounts[0] || {});
  const queryClient = useQueryClient();

  const quoteId = propQuoteId || urlQuoteId;
  
  const [quote, setQuote] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [sendDialog, setSendDialog] = useState(false);
  const [subject, setSubject] = useState("Nouveau devis pour client");
  const [language, setLanguage] = useState("fr");
  const [emailMessage, setEmailMessage] = useState('');
  const [processing, setProcessing] = useState(false);
  const [selectedTab, setSelectedTab] = useState(0);
  const [emailSenderOpen, setEmailSenderOpen] = useState(false);
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
    open: false,
    message: '',
    severity: 'success'
  });

  useEffect(() => {
    if (quoteId) {
      loadQuote();
    }
  }, [quoteId]);

  const loadQuote = async () => {
    try {
      setLoading(true);
      const response = await getQuote({ path: { id: quoteId! } });
      if (response?.data) {
        setQuote(response.data);
      }
    } catch (error) {
      console.error('Erreur lors du chargement du devis:', error);
      showSnackbar('Erreur lors du chargement du devis', 'error');
    } finally {
      setLoading(false);
    }
  };

  const showSnackbar = (message: string, severity: 'success' | 'error') => {
    setSnackbar({ open: true, message, severity });
  };

  const downloadFile = async (name: string, type: string) => {
    try {
      const response = await queryClient.fetchQuery(getApiFileByFolderByFileNameOptions({
        path: { folder: "Standard", fileName: name.replace("Standard", "") }
      }));
      
      if (response.fileBase64) {
        const decodedData = new Uint8Array(
          atob(response.fileBase64.replace(/^data:[^;]+;base64,/, "")).split("").map(char => char.charCodeAt(0))
        );
        const file = new File([decodedData], name, { type });
        return file;
      }
      return null;
    } catch (error: any) {
      return null;
    }
  };

  const sendEmailWithAttachments = async (from: string, to: string, subject: string, htmlContent: string, attachments: any[]) => {
    const myFiles: any[] = [];
    
    for (const { fileName, contentType } of attachments) {
      try {
        const filePromise = await downloadFile(fileName, contentType);
        if (filePromise) {
          myFiles.push(filePromise);
        }
      } catch (err: any) {
        console.log(err);
      }
    }

    await postApiEmail({
      body: {
        From: from,
        To: to,
        Subject: subject,
        HtmlContent: htmlContent,
        Attachments: myFiles
      }
    });
  };

  const handleSendEmail = async () => {
    if (!quote || !quote.customer?.email) return;

    try {
      setProcessing(true);

      const optionsButtons = quote.options.map((_: any, index: number) => {
        return `<a href="#" onclick="return false;" style="display:inline-block;background-color:#008089;color:#fff;padding:10px 20px;text-decoration:none">${t('selectOptionOffer', { lng: language })} #${Number(index + 1)}</a>`;
      });

      const myFooter = `
        <div>${account?.name}</div>
        <div style="font-family: Verdana; padding-top: 30px; padding-bottom: 20px;">
          ${optionsButtons}
          <a href="#" onclick="return false;" style="display:inline-block;background-color:#F2F2F2;color:#008089;padding:10px 20px;text-decoration:none">${t('refuseOffers', { lng: language })}</a>
          <div style="margin-top: 15px;"><a target="_blank" href="www.omnifreight.eu">www.omnifreight.eu</a></div>
          <div style="padding-bottom: 10px;"><a target="_blank" href="http://www.facebook.com/omnifreight">http://www.facebook.com/omnifreight</a></div>
          <div>Italiëlei 211</div>
          <div>2000 Antwerpen</div>
          <div>Belgium</div>
          <div>E-mail: transport@omnifreight.eu</div>
          <div>Tel +32.3.295.38.82</div>
          <div>Fax +32.3.295.38.77</div>
          <div>Whatsapp +32.494.40.24.25</div>
          <img src="https://omnifreight.eu/wp-content/uploads/2023/06/logo.jpg" style="max-width: 200px;">
        </div>
      `;

      const htmlContent = quote.comment + myFooter;

      await sendEmailWithAttachments(
        account?.username || 'noreply@omnifreight.eu',
        quote.customer.email,
        subject,
        htmlContent,
        quote.files || []
      );

            // Fonctionnalité de mise à jour de statut désactivée - endpoint supprimé
      /*
      // Mettre à jour le statut si nécessaire
      if (quote.status === 'APPROVED') {
        await putApiQuoteOfferByIdStatus({
          path: { id: quote.id },
          query: { newStatus: QuoteOfferStatus.SENT_TO_CLIENT }
        });
      }
      */

      showSnackbar('Email envoyé avec succès', 'success');
      setSendDialog(false);
      setEmailMessage('');
      loadQuote();
    } catch (error) {
      console.error('Erreur lors de l\'envoi de l\'email:', error);
      showSnackbar('Erreur lors de l\'envoi de l\'email', 'error');
    } finally {
      setProcessing(false);
    }
  };

  const handleQuoteAction = (action: string, quoteId: string) => {
    switch (action) {
      case 'send':
        setEmailSenderOpen(true);
        break;
      case 'edit':
        navigate(`/edit-quote/${quoteId}`);
        break;
      case 'delete':
        // TODO: Implémenter la suppression
        break;
    }
  };

  if (loading) {
    return (
      <Box sx={{ 
        display: 'flex', 
        flexDirection: 'column',
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '50vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white'
      }}>
        <CircularProgress size={60} sx={{ color: 'white', mb: 2 }} />
        <Typography variant="h6" sx={{ color: 'white' }}>
          Chargement du devis...
        </Typography>
      </Box>
    );
  }

  if (!quote) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography variant="h6" color="error">
          Devis non trouvé
        </Typography>
        <Button variant="contained" onClick={() => navigate('/quote-offers')} sx={{ mt: 2 }}>
          Retour aux devis
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ 
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      py: 3
    }}>
      {/* Header moderne */}
      <Box sx={{ px: 3, mb: 4 }}>
        <Fade in timeout={800}>
          <Paper sx={{ 
            p: 4, 
            background: 'rgba(255,255,255,0.95)', 
            backdropFilter: 'blur(10px)',
            borderRadius: 4,
            boxShadow: '0 8px 32px rgba(0,0,0,0.1)'
          }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Box>
                <Typography variant="h3" fontWeight="bold" color="primary" gutterBottom>
                  Devis #{quote.quoteOfferNumber || `DRAFT-${quote.id.slice(-6)}`}
                </Typography>
                <Typography variant="h6" color="text.secondary">
                  Demande #{quote.requestQuoteId} • Créé le {new Date(quote.created).toLocaleDateString('fr-FR')}
                </Typography>
              </Box>
              <Stack direction="row" spacing={2}>
                <Button
                  variant="outlined"
                  startIcon={<Print />}
                  onClick={() => window.print()}
                >
                  Imprimer
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<Download />}
                  onClick={() => {/* TODO: Télécharger PDF */}}
                >
                  PDF
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<Share />}
                  onClick={() => {/* TODO: Partager */}}
                >
                  Partager
                </Button>
                {isModal && onClose && (
                  <Button
                    variant="contained"
                    onClick={onClose}
                  >
                    Fermer
                  </Button>
                )}
              </Stack>
            </Box>

            {/* Statuts */}
            <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
              <Chip 
                label={statusLabel(quote.status)}
                color={colorsTypes(quote.status)}
                size="medium"
                sx={{ fontWeight: 'bold' }}
              />
              <Chip 
                label={quote.customerApprovalStatus ? statusLabel(quote.customerApprovalStatus) : 'En attente'}
                color={quote.customerApprovalStatus ? colorsTypes(quote.customerApprovalStatus) : 'default'}
                size="medium"
                variant="outlined"
              />
            </Box>

            {/* Actions rapides */}
            <Box sx={{ display: 'flex', gap: 2 }}>
              {quote.status === QuoteOfferStatus.APPROVED && quote.customer?.email && (
                <Button
                  variant="contained"
                  color="primary"
                  startIcon={<Send />}
                  onClick={() => setSendDialog(true)}
                >
                  Envoyer au client
                </Button>
              )}
              <Button
                variant="outlined"
                startIcon={<Edit />}
                onClick={() => handleQuoteAction('edit', quote.id)}
              >
                Modifier
              </Button>
              <Button
                variant="outlined"
                color="error"
                startIcon={<Delete />}
                onClick={() => handleQuoteAction('delete', quote.id)}
              >
                Supprimer
              </Button>
            </Box>
          </Paper>
        </Fade>
      </Box>

      {/* Contenu principal */}
      <Box sx={{ px: 3 }}>
        <Fade in timeout={600}>
          <QuoteDisplay
            quote={quote}
            showActions={false}
            compact={false}
          />
        </Fade>
      </Box>

      {/* Dialog d'envoi d'email */}
      <Dialog 
        open={sendDialog} 
        onClose={() => setSendDialog(false)} 
        maxWidth="md" 
        fullWidth
        PaperProps={{
          sx: { borderRadius: 3 }
        }}
      >
        <DialogTitle sx={{ bgcolor: 'primary.main', color: 'white' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Email />
            Envoyer le devis au client
          </Box>
        </DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={8}>
              <TextField
                fullWidth
                label="Sujet"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                sx={{ mb: 2 }}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                select
                label="Langue"
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                sx={{ mb: 2 }}
              >
                <option value="fr">Français</option>
                <option value="en">English</option>
              </TextField>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={4}
                label="Message personnalisé (optionnel)"
                value={emailMessage}
                onChange={(e) => setEmailMessage(e.target.value)}
                placeholder="Ajoutez un message personnalisé pour accompagner l'envoi du devis..."
              />
            </Grid>
            <Grid item xs={12}>
              <Alert severity="info">
                <Typography variant="body2">
                  <strong>Destinataire:</strong> {quote.customer?.email}
                </Typography>
                <Typography variant="body2">
                  <strong>Pièces jointes:</strong> {quote.files?.length || 0} fichier(s)
                </Typography>
              </Alert>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={() => setSendDialog(false)} disabled={processing}>
            Annuler
          </Button>
          <Button
            onClick={handleSendEmail}
            variant="contained"
            color="primary"
            disabled={processing}
            startIcon={processing ? <CircularProgress size={20} /> : <Send />}
          >
            Envoyer
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert 
          severity={snackbar.severity} 
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          sx={{ borderRadius: 2 }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>

      {/* Nouveau composant d'envoi d'email avec templates */}
      <QuoteEmailSender
        quote={quote}
        open={emailSenderOpen}
        onClose={() => setEmailSenderOpen(false)}
        onSuccess={(result) => {
          showSnackbar('Email envoyé avec succès', 'success');
          // Fonctionnalité de mise à jour de statut désactivée - endpoint supprimé
          /*
          // Mettre à jour le statut si nécessaire
          if (quote && quote.status === 'APPROVED') {
            putApiQuoteOfferByIdStatus({
              path: { id: quote.id },
              query: { newStatus: QuoteOfferStatus.SENT_TO_CLIENT }
            }).then(() => {
              loadQuote();
            });
          }
          */
        }}
      />
    </Box>
  );
};

export default QuoteDetail; 