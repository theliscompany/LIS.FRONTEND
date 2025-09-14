import React, { useState } from 'react';
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Stack,
  Chip,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Tooltip
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useMutation } from '@tanstack/react-query';
import { 
  postApiQuoteOfferAddOptionByQuoteIdMutation,
  postApiQuoteOfferRestartWizardByDraftIdMutation,
  postApiQuoteOfferSaveQuoteByTempQuoteIdMutation
} from '@features/offer/api/@tanstack/react-query.gen';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import VisibilityIcon from '@mui/icons-material/Visibility';
import EmailIcon from '@mui/icons-material/Email';

interface OfferOption {
  optionId: string;
  description: string;
  haulageTotal: number;
  seafreightTotal: number;
  miscellaneousTotal: number;
  grandTotal: number;
  currency: string;
  isPreferred: boolean;
  status: 'draft' | 'ready' | 'sent';
}

interface OfferManagementProps {
  quoteId: string;
  options: OfferOption[];
  canAddOptions: boolean; // true si < 3 options
  onAddOption: () => void;
  onEditOption: (optionId: string) => void;
  onPreviewOffer: () => void;
  onSendOffer: () => void;
}

const OfferManagement: React.FC<OfferManagementProps> = ({
  quoteId,
  options,
  canAddOptions,
  onAddOption,
  onEditOption,
  onPreviewOffer,
  onSendOffer
}) => {
  const { t } = useTranslation();
  const [showRestartDialog, setShowRestartDialog] = useState(false);
  const [showSaveDialog, setShowSaveDialog] = useState(false);

  const restartWizardMutation = useMutation({
    ...postApiQuoteOfferRestartWizardByDraftIdMutation(),
    onSuccess: (data) => {
      console.log('Nouveau wizard démarré:', data);
      // Rediriger vers le nouveau wizard
      onAddOption();
    }
  });

  const saveQuoteMutation = useMutation({
    ...postApiQuoteOfferSaveQuoteByTempQuoteIdMutation(),
    onSuccess: () => {
      console.log('Devis sauvegardé avec succès');
      setShowSaveDialog(false);
    }
  });

  const handleRestartWizard = () => {
    // Ici nous aurions besoin de l'ID du dernier draft
    // Pour l'exemple, nous utilisons un ID fictif
    restartWizardMutation.mutate({
      path: { draftId: 'latest_draft_id' }
    });
  };

  const handleSaveQuote = () => {
    saveQuoteMutation.mutate({
      path: { tempQuoteId: quoteId }
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'default';
      case 'ready': return 'success';
      case 'sent': return 'primary';
      default: return 'default';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'draft': return 'Brouillon';
      case 'ready': return 'Prêt';
      case 'sent': return 'Envoyé';
      default: return status;
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* En-tête */}
      <Box sx={{ 
        textAlign: 'center', 
        mb: 4,
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        borderRadius: 4,
        p: 4,
        color: 'white'
      }}>
        <Typography variant="h3" sx={{ fontWeight: 700, mb: 1 }}>
          Gestion du Devis
        </Typography>
        <Typography variant="h6" sx={{ opacity: 0.9 }}>
          Devis #{quoteId} - {options.length}/3 options
        </Typography>
      </Box>

      {/* Statut du devis */}
      <Card sx={{ mb: 4, borderRadius: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            📊 Statut du devis
          </Typography>
          <Stack direction="row" spacing={2} alignItems="center">
            <Chip 
              label={`${options.length} option${options.length > 1 ? 's' : ''} créée${options.length > 1 ? 's' : ''}`}
              color="primary"
            />
            <Chip 
              label={canAddOptions ? 'Peut ajouter des options' : 'Maximum d\'options atteint'}
              color={canAddOptions ? 'success' : 'warning'}
            />
            <Chip 
              label={`Option préférée: ${options.find(o => o.isPreferred)?.description || 'Aucune'}`}
              color="info"
            />
          </Stack>
        </CardContent>
      </Card>

      {/* Table des options */}
      <Card sx={{ mb: 4, borderRadius: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            💼 Options tarifaires
          </Typography>
          
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                  <TableCell>Description</TableCell>
                  <TableCell>Haulage</TableCell>
                  <TableCell>Seafreight</TableCell>
                  <TableCell>Miscellaneous</TableCell>
                  <TableCell>Total</TableCell>
                  <TableCell>Statut</TableCell>
                  <TableCell>Préférée</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {options.map((option) => (
                  <TableRow key={option.optionId}>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: option.isPreferred ? 600 : 400 }}>
                        {option.description}
                      </Typography>
                    </TableCell>
                    <TableCell>{option.haulageTotal} {option.currency}</TableCell>
                    <TableCell>{option.seafreightTotal} {option.currency}</TableCell>
                    <TableCell>{option.miscellaneousTotal} {option.currency}</TableCell>
                    <TableCell>
                      <Typography sx={{ fontWeight: 600, color: '#2e7d32' }}>
                        {option.grandTotal} {option.currency}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={getStatusLabel(option.status)}
                        color={getStatusColor(option.status) as any}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      {option.isPreferred && <Chip label="⭐ Préférée" color="warning" size="small" />}
                    </TableCell>
                    <TableCell>
                      <Tooltip title="Modifier l'option">
                        <IconButton 
                          size="small"
                          onClick={() => onEditOption(option.optionId)}
                        >
                          <EditIcon />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      {/* Actions principales */}
      <Stack direction="row" spacing={2} justifyContent="center" flexWrap="wrap">
        {/* Ajouter une option */}
        {canAddOptions && (
          <Button
            variant="outlined"
            startIcon={<AddIcon />}
            onClick={() => setShowRestartDialog(true)}
            sx={{ px: 3, py: 1.5 }}
          >
            Ajouter une option ({options.length + 1}/3)
          </Button>
        )}

        {/* Prévisualiser le devis */}
        <Button
          variant="outlined"
          startIcon={<VisibilityIcon />}
          onClick={onPreviewOffer}
          sx={{ px: 3, py: 1.5 }}
        >
          Prévisualiser
        </Button>

        {/* Sauvegarder le devis */}
        <Button
          variant="contained"
          startIcon={<SaveIcon />}
          onClick={() => setShowSaveDialog(true)}
          sx={{ 
            px: 3, 
            py: 1.5,
            background: 'linear-gradient(135deg, #4caf50 0%, #45a049 100%)'
          }}
        >
          Sauvegarder le devis
        </Button>

        {/* Envoyer au client */}
        <Button
          variant="contained"
          startIcon={<EmailIcon />}
          onClick={onSendOffer}
          disabled={options.length === 0}
          sx={{ 
            px: 3, 
            py: 1.5,
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
          }}
        >
          Envoyer au client
        </Button>
      </Stack>

      {/* Dialog pour redémarrer le wizard */}
      <Dialog open={showRestartDialog} onClose={() => setShowRestartDialog(false)}>
        <DialogTitle>
          Ajouter une nouvelle option
        </DialogTitle>
        <DialogContent>
          <Alert severity="info" sx={{ mb: 2 }}>
            Pour ajouter une nouvelle option, nous allons redémarrer le wizard en copiant 
            les informations de base (client, route, produit) depuis votre devis existant.
          </Alert>
          <Typography>
            Cela créera un nouveau brouillon que vous pourrez modifier pour créer 
            une option alternative avec des services différents.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowRestartDialog(false)}>
            Annuler
          </Button>
          <Button 
            onClick={() => {
              setShowRestartDialog(false);
              handleRestartWizard();
            }}
            variant="contained"
          >
            Redémarrer le wizard
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog pour sauvegarder */}
      <Dialog open={showSaveDialog} onClose={() => setShowSaveDialog(false)}>
        <DialogTitle>
          Sauvegarder le devis
        </DialogTitle>
        <DialogContent>
          <Typography>
            Le devis sera sauvegardé avec toutes ses options et pourra être 
            consulté, modifié ou envoyé au client ultérieurement.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowSaveDialog(false)}>
            Annuler
          </Button>
          <Button 
            onClick={handleSaveQuote}
            variant="contained"
            disabled={saveQuoteMutation.isPending}
          >
            {saveQuoteMutation.isPending ? 'Sauvegarde...' : 'Sauvegarder'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default OfferManagement;
