import React, { useState } from 'react';
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Alert,
  Stack,
  Chip,
  LinearProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useOfferWorkflow } from '@features/offer/hooks/useOfferWorkflow';
import type { QuoteOptionDto } from '@features/offer/api/types.gen';

interface OfferGenerationStepProps {
  draftId: string;
  draftData: any;
  onOptionGenerated: (result: { optionId: string; quoteId: string }) => void;
  onBack: () => void;
}

const OfferGenerationStep: React.FC<OfferGenerationStepProps> = ({
  draftId,
  draftData,
  onOptionGenerated,
  onBack
}) => {
  const { t } = useTranslation();
  const [optionData, setOptionData] = useState<Partial<QuoteOptionDto>>({
    description: 'Option Standard',
    // Pré-remplir avec les données du draft
    haulage: draftData.selectedHaulage ? {
      haulierId: draftData.selectedHaulage.haulierId || 0,
      haulierName: draftData.selectedHaulage.haulierName || '',
      currency: draftData.selectedHaulage.currency || 'EUR',
      unitTariff: draftData.selectedHaulage.unitTariff || 0,
      freeTime: draftData.selectedHaulage.freeTime || 0,
      pickupAddress: {
        company: draftData.selectedHaulage.pickupAddress?.company || '',
        addressLine: draftData.selectedHaulage.pickupAddress?.addressLine || '',
        city: draftData.selectedHaulage.pickupAddress?.city || '',
        postalCode: draftData.selectedHaulage.pickupAddress?.postalCode || '',
        country: draftData.selectedHaulage.pickupAddress?.country || ''
      },
      deliveryPort: {
        portId: draftData.selectedHaulage.deliveryPort?.portId || 0,
        portName: draftData.selectedHaulage.deliveryPort?.portName || '',
        country: draftData.selectedHaulage.deliveryPort?.country || ''
      },
      validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 jours
    } : undefined,
    seaFreight: draftData.selectedSeafreights?.[0] ? {
      seaFreightId: draftData.selectedSeafreights[0].seaFreightId || '',
      carrierName: draftData.selectedSeafreights[0].carrierName || '',
      carrierAgentName: draftData.selectedSeafreights[0].carrierAgentName || '',
      departurePort: {
        portId: draftData.step1?.portFrom?.portId || 0,
        portName: draftData.step1?.portFrom?.portName || '',
        country: draftData.step1?.portFrom?.country || ''
      },
      destinationPort: {
        portId: draftData.step1?.portTo?.portId || 0,
        portName: draftData.step1?.portTo?.portName || '',
        country: draftData.step1?.portTo?.country || ''
      },
      currency: 'EUR',
      transitTimeDays: 21,
      frequency: 'Weekly',
      defaultContainer: '20GP',
      containers: draftData.step3?.selectedContainers?.list?.map((container: any) => ({
        containerType: container.containerType,
        quantity: container.quantity,
        unitPrice: 1200 // Prix par défaut, à ajuster
      })) || [],
      validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
    } : undefined,
    miscellaneous: draftData.selectedMiscellaneous?.map((misc: any) => ({
      miscellaneousId: misc.id,
      supplierName: misc.supplierName || misc.serviceProviderName || '',
      currency: misc.currency || 'EUR',
      serviceId: misc.serviceId || misc.serviceProviderId || 0,
      serviceName: misc.serviceName || '',
      price: misc.price || misc.basePrice || 0,
      validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
    })) || [],
    deliveryAddress: {
      company: draftData.step1?.customer?.companyName || '',
      addressLine: draftData.step1?.deliveryLocation?.addressLine || '',
      city: draftData.step1?.cityTo?.name || '',
      postalCode: draftData.step1?.deliveryLocation?.postalCode || '',
      country: draftData.step1?.cityTo?.country || ''
    }
  });

  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  const { generateOption, isGenerating, generateError } = useOfferWorkflow();

  const handleGenerateOption = async () => {
    const result = await generateOption(draftId, optionData as QuoteOptionDto);
    
    if (result.success) {
      onOptionGenerated({
        optionId: result.optionId || 'generated_option',
        quoteId: result.quoteId || 'generated_quote'
      });
    }
  };

  return (
    <Box sx={{ p: 3, minHeight: '100vh', background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)' }}>
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
          Génération d'Option
        </Typography>
        <Typography variant="h6" sx={{ opacity: 0.9 }}>
          Créer une option tarifaire depuis votre brouillon
        </Typography>
      </Box>

      {/* Informations du brouillon */}
      <Card sx={{ mb: 4, borderRadius: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            📋 Résumé du brouillon
          </Typography>
          <Stack direction="row" spacing={2} flexWrap="wrap">
            <Chip label={`Client: ${draftData.step1?.customer?.companyName || 'N/A'}`} />
            <Chip label={`Route: ${draftData.step1?.cityFrom?.name} → ${draftData.step1?.cityTo?.name}`} />
            <Chip label={`Containers: ${draftData.step3?.selectedContainers?.list?.length || 0}`} />
            <Chip label={`Haulage: ${draftData.selectedHaulage ? '✅' : '❌'}`} />
            <Chip label={`Seafreight: ${draftData.selectedSeafreights?.length || 0}`} />
            <Chip label={`Miscellaneous: ${draftData.selectedMiscellaneous?.length || 0}`} />
          </Stack>
        </CardContent>
      </Card>

      {/* Configuration de l'option */}
      <Card sx={{ mb: 4, borderRadius: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            ⚙️ Configuration de l'option
          </Typography>
          
          <Stack spacing={3}>
            <TextField
              label="Description de l'option"
              value={optionData.description || ''}
              onChange={(e) => setOptionData(prev => ({ ...prev, description: e.target.value }))}
              fullWidth
              placeholder="Option Standard, Option Premium, etc."
            />

            {/* Totaux calculés */}
            <Box sx={{ p: 2, borderRadius: 2, backgroundColor: '#f5f5f5' }}>
              <Typography variant="subtitle2" gutterBottom>
                💰 Estimation des coûts
              </Typography>
              <Stack direction="row" spacing={4}>
                <Typography variant="body2">
                  Haulage: {draftData.haulageTotal || 0} EUR
                </Typography>
                <Typography variant="body2">
                  Seafreight: {draftData.seafreightTotal || 0} EUR
                </Typography>
                <Typography variant="body2">
                  Miscellaneous: {draftData.miscTotal || 0} EUR
                </Typography>
                <Typography variant="body1" sx={{ fontWeight: 600 }}>
                  Total: {(draftData.haulageTotal || 0) + (draftData.seafreightTotal || 0) + (draftData.miscTotal || 0)} EUR
                </Typography>
              </Stack>
            </Box>
          </Stack>
        </CardContent>
      </Card>

      {/* Actions */}
      <Stack direction="row" spacing={2} justifyContent="space-between">
        <Button
          variant="outlined"
          onClick={onBack}
          disabled={isGenerating}
          sx={{ px: 4, py: 1.5 }}
        >
          ← Retour au wizard
        </Button>

        <Button
          variant="contained"
          onClick={() => setShowConfirmDialog(true)}
          disabled={isGenerating || !optionData.description}
          sx={{ 
            px: 4, 
            py: 1.5,
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
          }}
        >
          {isGenerating ? (
            <>
              <LinearProgress sx={{ mr: 2, width: 100 }} />
              Génération en cours...
            </>
          ) : (
            '🚀 Générer l\'option'
          )}
        </Button>
      </Stack>

      {/* Dialog de confirmation */}
      <Dialog open={showConfirmDialog} onClose={() => setShowConfirmDialog(false)}>
        <DialogTitle>
          Confirmer la génération d'option
        </DialogTitle>
        <DialogContent>
          <Alert severity="warning" sx={{ mb: 2 }}>
            ⚠️ <strong>Attention :</strong> Une fois l'option générée, ce brouillon ne sera plus modifiable.
          </Alert>
          <Typography>
            Vous êtes sur le point de générer l'option "<strong>{optionData.description}</strong>" 
            depuis votre brouillon. Cette action créera un devis avec cette option et rendra 
            le brouillon en lecture seule.
          </Typography>
          <Typography sx={{ mt: 2, fontWeight: 600 }}>
            Voulez-vous continuer ?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowConfirmDialog(false)}>
            Annuler
          </Button>
          <Button 
            onClick={() => {
              setShowConfirmDialog(false);
              handleGenerateOption();
            }}
            variant="contained"
            color="primary"
          >
            Confirmer
          </Button>
        </DialogActions>
      </Dialog>

      {/* Messages d'erreur */}
      {generateError && (
        <Alert severity="error" sx={{ mt: 2 }}>
          Erreur lors de la génération de l'option: {generateError.message}
        </Alert>
      )}
    </Box>
  );
};

export default OfferGenerationStep;
