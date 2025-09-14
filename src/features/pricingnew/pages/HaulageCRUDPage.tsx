import React, { useState, useEffect } from 'react';
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
import HaulageForm from '../components/HaulageForm';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  getApiHaulageByIdOptions, 
  postApiHaulageMutation, 
  putApiHaulageByIdMutation,
  getApiHaulageQueryKey
} from '../api/@tanstack/react-query.gen';
import { HaulageResponse, HaulageCreateRequest } from '../api/types.gen';
import { Link as RouterLink } from 'react-router-dom';

const HaulageCRUDPage: React.FC = () => {
  const { offerId } = useParams<{ offerId: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const isCreateMode = offerId === 'new';
  const isEditMode = !!offerId && offerId !== 'new';

  // Utilisation des hooks TanStack Query générés
  const { 
    data: haulage, 
    isLoading: loading, 
    error: queryError 
  } = useQuery({
    ...getApiHaulageByIdOptions({ path: { id: offerId! } }),
    enabled: isEditMode && !!offerId
  });

  const createMutation = useMutation(postApiHaulageMutation());
  const updateMutation = useMutation(putApiHaulageByIdMutation());

  const saving = createMutation.isPending || updateMutation.isPending;

  // Gérer les erreurs de requête
  React.useEffect(() => {
    if (queryError && isEditMode) {
      setError(queryError instanceof Error ? queryError.message : 'Erreur lors du chargement de l\'offre');
    }
  }, [queryError, isEditMode]);

  const handleFormSubmit = async (formData: HaulageCreateRequest) => {
    try {
      setError(null);
      setSuccess(null);

      // Log la baseURL utilisée pour l'appel API
      // @ts-ignore
      const baseUrl = (createMutation.options?.mutationFn?.toString().includes('postApiHaulage') && (require('../api').client.getConfig().baseURL)) || 'baseURL non trouvé';
      console.log('BASEURL utilisée pour création Haulage:', baseUrl);

      console.log('Payload envoyé:', formData);

      if (isEditMode && offerId) {
        // Mode édition
        await updateMutation.mutateAsync({ 
          path: { id: offerId }, 
          body: formData 
        });
        setSuccess('Offre de prix mise à jour avec succès !');
        // Invalider le cache pour forcer le rechargement
        queryClient.invalidateQueries({ queryKey: getApiHaulageQueryKey() });
      } else {
        // Mode création
        const response = await createMutation.mutateAsync({ body: formData });
        console.log('Réponse API:', response);
        setSuccess('Offre de prix créée avec succès !');
        // Invalider le cache pour forcer le rechargement
        queryClient.invalidateQueries({ queryKey: getApiHaulageQueryKey() });
        // Rediriger vers la page de liste après un délai
        setTimeout(() => {
          navigate('/pricingnew/haulage');
        }, 2000);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la sauvegarde');
    }
  };

  const handleCancel = () => {
    navigate('/pricingnew/haulage');
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
              to="/pricingnew/haulage" 
              style={{ 
                textDecoration: 'none',
                color: 'inherit'
              }}
            >
              Transports
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
                {isCreateMode ? "Création d'une Offre Haulage" : "Édition d'une Offre Haulage"}
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
                {saving ? 'Sauvegarde...' : (isEditMode ? 'Mettre à jour' : 'Créer')}
              </Button>
            </Box>
          </Box>

          <Typography 
            variant="body1" 
            sx={{ 
              color: '#666',
              fontSize: '1.1rem',
              fontWeight: 400
            }}
          >
            {isEditMode 
              ? 'Modifiez les informations de l\'offre de prix existante'
              : 'Créez une nouvelle offre de prix de transporteur'
            }
          </Typography>
        </Paper>

        {/* Alerts */}
        {error && (
          <Alert 
            severity="error" 
            sx={{ 
              mb: 3, 
              borderRadius: 2,
              background: 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(10px)'
            }}
          >
            {error}
          </Alert>
        )}

        {success && (
          <Alert 
            severity="success" 
            sx={{ 
              mb: 3, 
              borderRadius: 2,
              background: 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(10px)'
            }}
          >
            {success}
          </Alert>
        )}

        {/* Form */}
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
          <HaulageForm
            haulage={haulage}
            onSubmit={handleFormSubmit}
            loading={saving}
            isEditMode={isEditMode}
            isCreateMode={isCreateMode}
          />
        </Paper>
      </Container>
    </Box>
  );
};

export default HaulageCRUDPage; 