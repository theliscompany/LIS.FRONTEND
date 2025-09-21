/**
 * Step1RequestForm compatible avec la nouvelle API
 * Utilise le nouveau système de mapping
 */

import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  Grid,
  Card,
  CardContent,
  Alert,
  CircularProgress
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import { DraftQuoteApiUtils } from '../services/DraftQuoteApiMapper';

interface Step1RequestFormApiCompatibleProps {
  requestData: any;
  onStepUpdate: (data: any) => void;
  onNext: () => void;
}

const Step1RequestFormApiCompatible: React.FC<Step1RequestFormApiCompatibleProps> = ({
  requestData,
  onStepUpdate,
  onNext
}) => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    customer: {
      contactId: 0,
      contactName: '',
      companyName: '',
      email: ''
    },
    cityFrom: { name: '', country: '' },
    cityTo: { name: '', country: '' },
    productName: { productId: 0, productName: '' },
    incotermName: '',
    comment: '',
    status: 'NEW' as const,
    assignee: ''
  });
  const [isValid, setIsValid] = useState(false);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  // Initialisation des données
  useEffect(() => {
    if (requestData?.step1) {
      setFormData(prev => ({
        ...prev,
        ...requestData.step1
      }));
    }
  }, [requestData]);

  // Validation en temps réel
  useEffect(() => {
    const errors: string[] = [];
    
    if (!formData.customer.companyName) {
      errors.push('Nom de l\'entreprise requis');
    }
    if (!formData.customer.contactName) {
      errors.push('Nom du contact requis');
    }
    if (!formData.customer.email) {
      errors.push('Email requis');
    }
    if (!formData.cityFrom.name) {
      errors.push('Ville de départ requise');
    }
    if (!formData.cityTo.name) {
      errors.push('Ville d\'arrivée requise');
    }
    if (!formData.productName.productName) {
      errors.push('Produit requis');
    }

    setValidationErrors(errors);
    setIsValid(errors.length === 0);
  }, [formData]);

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => {
      const newData = { ...prev };
      const keys = field.split('.');
      
      if (keys.length === 1) {
        newData[keys[0]] = value;
      } else if (keys.length === 2) {
        newData[keys[0]] = { ...newData[keys[0]], [keys[1]]: value };
      }
      
      return newData;
    });
  };

  const handleNext = () => {
    if (isValid) {
      onStepUpdate(formData);
      onNext();
    }
  };

  return (
    <Box>
      <Typography variant="h5" gutterBottom>
        📋 Informations de la Demande (API Compatible)
      </Typography>
      
      <Alert severity="info" sx={{ mb: 3 }}>
        Cette version utilise le nouveau système de mapping API-compatible.
        Les données sont automatiquement validées et transformées.
      </Alert>

      <Card>
        <CardContent>
          <Grid container spacing={3}>
            {/* Informations Client */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Informations Client
              </Typography>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Nom de l'entreprise"
                value={formData.customer.companyName}
                onChange={(e) => handleInputChange('customer.companyName', e.target.value)}
                error={validationErrors.includes('Nom de l\'entreprise requis')}
                helperText={validationErrors.includes('Nom de l\'entreprise requis') ? 'Requis' : ''}
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Nom du contact"
                value={formData.customer.contactName}
                onChange={(e) => handleInputChange('customer.contactName', e.target.value)}
                error={validationErrors.includes('Nom du contact requis')}
                helperText={validationErrors.includes('Nom du contact requis') ? 'Requis' : ''}
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Email"
                type="email"
                value={formData.customer.email}
                onChange={(e) => handleInputChange('customer.email', e.target.value)}
                error={validationErrors.includes('Email requis')}
                helperText={validationErrors.includes('Email requis') ? 'Requis' : ''}
              />
            </Grid>

            {/* Route */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                Route
              </Typography>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Ville de départ"
                value={formData.cityFrom.name}
                onChange={(e) => handleInputChange('cityFrom.name', e.target.value)}
                error={validationErrors.includes('Ville de départ requise')}
                helperText={validationErrors.includes('Ville de départ requise') ? 'Requis' : ''}
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Pays de départ"
                value={formData.cityFrom.country}
                onChange={(e) => handleInputChange('cityFrom.country', e.target.value)}
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Ville d'arrivée"
                value={formData.cityTo.name}
                onChange={(e) => handleInputChange('cityTo.name', e.target.value)}
                error={validationErrors.includes('Ville d\'arrivée requise')}
                helperText={validationErrors.includes('Ville d\'arrivée requise') ? 'Requis' : ''}
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Pays d'arrivée"
                value={formData.cityTo.country}
                onChange={(e) => handleInputChange('cityTo.country', e.target.value)}
              />
            </Grid>

            {/* Produit */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                Produit
              </Typography>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Nom du produit"
                value={formData.productName.productName}
                onChange={(e) => handleInputChange('productName.productName', e.target.value)}
                error={validationErrors.includes('Produit requis')}
                helperText={validationErrors.includes('Produit requis') ? 'Requis' : ''}
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Incoterm"
                value={formData.incotermName}
                onChange={(e) => handleInputChange('incotermName', e.target.value)}
              />
            </Grid>

            {/* Commentaire */}
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Commentaire"
                multiline
                rows={3}
                value={formData.comment}
                onChange={(e) => handleInputChange('comment', e.target.value)}
              />
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Validation Status */}
      <Box sx={{ mt: 3, p: 2, bgcolor: 'grey.100', borderRadius: 1 }}>
        <Typography variant="subtitle2" gutterBottom>
          🔍 Statut de Validation API
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          {isValid ? (
            <Typography color="success.main">✅ Données valides pour l'API</Typography>
          ) : (
            <Typography color="error.main">❌ Erreurs de validation</Typography>
          )}
          {validationErrors.length > 0 && (
            <Typography variant="body2" color="error">
              ({validationErrors.length} erreur{validationErrors.length > 1 ? 's' : ''})
            </Typography>
          )}
        </Box>
        {validationErrors.length > 0 && (
          <Box sx={{ mt: 1 }}>
            <Typography variant="body2" color="error">
              Erreurs: {validationErrors.join(', ')}
            </Typography>
          </Box>
        )}
      </Box>

      {/* Actions */}
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
        <Button
          variant="contained"
          onClick={handleNext}
          disabled={!isValid}
          startIcon={!isValid ? <CircularProgress size={20} /> : null}
        >
          {isValid ? 'Suivant' : 'Corriger les erreurs'}
        </Button>
      </Box>
    </Box>
  );
};

export default Step1RequestFormApiCompatible;
