import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Box, 
  Typography, 
  Paper, 
  Container,
  Button,
  Alert,
  LinearProgress,
  Breadcrumbs,
  Link
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Save as SaveIcon,
  Cancel as CancelIcon
} from '@mui/icons-material';
import SeaFreightForm from '../components/SeaFreightForm';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  getApiSeaFreightByIdOptions, 
  postApiSeaFreightMutation, 
  putApiSeaFreightByIdMutation,
  getApiSeaFreightQueryKey
} from '../api/@tanstack/react-query.gen';
import { SeaFreightResponse, SeaFreightCreateRequest, Carrier, Port, Charges, Validity, Surcharge } from '../api/types.gen';
import { Link as RouterLink } from 'react-router-dom';

const SeaFreightCRUDPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const isCreateMode = id === 'new';
  const isEditMode = !!id && id !== 'new';

  // Utilisation des hooks TanStack Query générés
  const { 
    data: seaFreight, 
    isLoading: loading, 
    error: queryError 
  } = useQuery({
    ...getApiSeaFreightByIdOptions({ path: { id: id! } }),
    enabled: isEditMode && !!id
  });

  const createMutation = useMutation(postApiSeaFreightMutation());
  const updateMutation = useMutation(putApiSeaFreightByIdMutation());

  const saving = createMutation.isPending || updateMutation.isPending;

  // Gérer les erreurs de requête
  React.useEffect(() => {
    if (queryError && isEditMode) {
      setError(queryError instanceof Error ? queryError.message : 'Erreur lors du chargement de l\'offre');
    }
  }, [queryError, isEditMode]);

  const handleFormSubmit = async (formData: SeaFreightCreateRequest) => {
    try {
      setError(null);
      setSuccess(null);

      // Nettoyage du payload pour ne garder que les champs attendus par l'API
      const cleanFormData: SeaFreightCreateRequest = {
        carrier: formData.carrier ? { id: formData.carrier.id, name: formData.carrier.name } : undefined,
        departurePort: formData.departurePort ? { unlocode: formData.departurePort.unlocode, name: formData.departurePort.name } : undefined,
        arrivalPort: formData.arrivalPort ? { unlocode: formData.arrivalPort.unlocode, name: formData.arrivalPort.name } : undefined,
        incoterm: formData.incoterm,
        containerType: formData.containerType,
        isReefer: formData.isReefer,
        currency: formData.currency,
        charges: formData.charges,
        transitTimeDays: formData.transitTimeDays,
        frequency: formData.frequency,
        volumeCbm: formData.volumeCbm,
        weightKg: formData.weightKg,
        validity: formData.validity,
        deliveryTerms: formData.deliveryTerms,
        remarks: formData.remarks,
        createdBy: formData.createdBy,
      };

      console.log('Payload envoyé:', cleanFormData);

      if (isEditMode && id) {
        // Mode édition
        await updateMutation.mutateAsync({ 
          path: { id }, 
          body: cleanFormData 
        });
        setSuccess('Offre de prix mise à jour avec succès !');
        // Invalider le cache pour forcer le rechargement
        queryClient.invalidateQueries({ queryKey: getApiSeaFreightQueryKey() });
      } else {
        // Mode création
        const response = await createMutation.mutateAsync({ body: cleanFormData });
        console.log('Réponse API:', response);
        
        // Afficher le quoteNumber généré dans le message de succès
        const quoteNumber = response.quoteNumber || 'N/A';
        setSuccess(`Offre de prix créée avec succès ! Numéro de devis : ${quoteNumber}`);
        
        // Invalider le cache pour forcer le rechargement
        queryClient.invalidateQueries({ queryKey: getApiSeaFreightQueryKey() });
        
        // Rediriger vers la page de liste après un délai
        setTimeout(() => {
          navigate('/pricingnew/seafreight');
        }, 3000); // Augmenté pour laisser le temps de lire le message
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la sauvegarde');
    }
  };

  const handleCancel = () => {
    navigate('/pricingnew/seafreight');
  };

  if (loading) {
    return (
      <Box sx={{ p: 3 }}>
        <LinearProgress />
        <Typography sx={{ mt: 2 }}>Chargement de l'offre...</Typography>
      </Box>
    );
  }

  return (
    <Box 
      sx={{ 
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        py: 4
      }}
    >
      <Container maxWidth="xl">
        {/* Breadcrumbs */}
        <Paper 
          elevation={0} 
          sx={{ 
            mb: 3, 
            p: 2, 
            borderRadius: 2,
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.2)'
          }}
        >
          <Breadcrumbs aria-label="breadcrumb">
            <RouterLink 
              color="inherit" 
              to="/pricingnew/seafreight" 
              style={{ 
                textDecoration: 'none',
                color: 'inherit'
              }}
            >
              Sea Freight
            </RouterLink>
            <Typography color="text.primary">
              {isEditMode ? 'Modifier l\'Offre' : 'Nouvelle Offre de Prix'}
            </Typography>
          </Breadcrumbs>
        </Paper>

        {/* Header */}
        <Paper 
          elevation={0} 
          sx={{ 
            mb: 4, 
            p: 4, 
            borderRadius: 3,
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.2)'
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Button
                startIcon={<ArrowBackIcon />}
                onClick={handleCancel}
                sx={{
                  color: '#666',
                  '&:hover': { bgcolor: 'rgba(102, 126, 234, 0.1)' }
                }}
              >
                Retour
              </Button>
              <Typography 
                variant="h4" 
                sx={{ 
                  fontWeight: 700,
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent'
                }}
              >
                {isCreateMode ? "Création d'une Offre Sea Freight" : "Édition d'une Offre Sea Freight"}
              </Typography>
            </Box>
            
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button
                variant="outlined"
                startIcon={<CancelIcon />}
                onClick={handleCancel}
                sx={{
                  borderRadius: 2,
                  px: 3,
                  py: 1.5,
                  fontWeight: 600,
                  textTransform: 'none',
                  borderColor: '#666',
                  color: '#666',
                  '&:hover': {
                    borderColor: '#333',
                    color: '#333',
                    bgcolor: 'rgba(102, 102, 102, 0.1)'
                  }
                }}
              >
                Annuler
              </Button>
              <Button
                variant="contained"
                startIcon={<SaveIcon />}
                type="submit"
                form="seaFreightForm"
                disabled={saving}
                sx={{
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  borderRadius: 2,
                  px: 3,
                  py: 1.5,
                  fontWeight: 600,
                  textTransform: 'none',
                  boxShadow: '0 4px 15px rgba(102, 126, 234, 0.3)',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)',
                    transform: 'translateY(-2px)',
                    boxShadow: '0 8px 25px rgba(102, 126, 234, 0.4)'
                  },
                  '&:disabled': {
                    background: '#ccc',
                    transform: 'none',
                    boxShadow: 'none'
                  }
                }}
              >
                {saving ? 'Enregistrement...' : (isEditMode ? 'Mettre à jour' : 'Créer')}
              </Button>
            </Box>
          </Box>

          {/* Messages d'erreur et de succès */}
          {error && (
            <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
              {error}
            </Alert>
          )}

          {success && (
            <Alert severity="success" sx={{ mb: 3, borderRadius: 2 }}>
              {success}
            </Alert>
          )}

          {/* Description */}
          <Typography variant="body1" sx={{ color: '#666', lineHeight: 1.6 }}>
            {isCreateMode 
              ? "Créez une nouvelle offre de prix Sea Freight en remplissant les informations ci-dessous. Tous les champs marqués d'un astérisque (*) sont obligatoires."
              : "Modifiez les informations de cette offre de prix Sea Freight. Tous les champs marqués d'un astérisque (*) sont obligatoires."
            }
          </Typography>
        </Paper>

        {/* Formulaire */}
        <Paper 
          elevation={0} 
          sx={{ 
            borderRadius: 3,
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            overflow: 'hidden'
          }}
        >
          <Box sx={{ p: 4 }}>
            <SeaFreightForm
              seaFreight={seaFreight}
              onSubmit={handleFormSubmit}
              loading={saving}
              isEditMode={isEditMode}
              isCreateMode={isCreateMode}
            />
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};

export default SeaFreightCRUDPage; 