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
  Breadcrumbs
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Save as SaveIcon,
  Cancel as CancelIcon
} from '@mui/icons-material';
import MiscellaneousForm from '../components/MiscellaneousForm';
import { getApiMiscellaneousById, putApiMiscellaneousById } from '../api/sdk.gen';
import { client as pricingnewClient } from '../api';
import { MiscellaneousResponse, MiscellaneousCreateRequest } from '../api/types.gen';
import { Link as RouterLink } from 'react-router-dom';

const MiscellaneousEditPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [miscellaneous, setMiscellaneous] = useState<MiscellaneousResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      fetchMiscellaneous();
    }
  }, [id]);

  const fetchMiscellaneous = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getApiMiscellaneousById({ 
        client: pricingnewClient, 
        path: { id: id! } 
      });
      setMiscellaneous(response.data ?? null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors du chargement du service');
    } finally {
      setLoading(false);
    }
  };

  const handleFormSubmit = async (formData: MiscellaneousCreateRequest) => {
    try {
      setSaving(true);
      setError(null);
      setSuccess(null);

      console.log('Payload envoyé:', formData);

      if (id) {
        await putApiMiscellaneousById({ 
          client: pricingnewClient, 
          path: { id }, 
          body: formData 
        });
        setSuccess('Service miscellaneous mis à jour avec succès !');
        // Rediriger vers la page de liste après un délai
        setTimeout(() => {
          navigate('/pricingnew/miscellaneous');
        }, 2000);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la sauvegarde');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    navigate('/pricingnew/miscellaneous');
  };

  if (loading) {
    return (
      <Box sx={{ p: 3 }}>
        <LinearProgress />
        <Typography sx={{ mt: 2 }}>Chargement du service...</Typography>
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
              to="/pricingnew/miscellaneous" 
              style={{ 
                textDecoration: 'none',
                color: 'inherit'
              }}
            >
              Services Miscellaneous
            </RouterLink>
            <Typography color="text.primary">
              Modifier le Service
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
                Édition d'un Service Miscellaneous
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
                {saving ? 'Sauvegarde...' : 'Mettre à jour'}
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
            Modifiez les informations du service miscellaneous existant
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
          <MiscellaneousForm
            miscellaneous={miscellaneous}
            onSubmit={handleFormSubmit}
            onCancel={handleCancel}
            loading={saving}
          />
        </Paper>
      </Container>
    </Box>
  );
};

export default MiscellaneousEditPage; 