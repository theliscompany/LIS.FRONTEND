import React, { useState } from 'react';
import MiscellaneousList from '../components/MiscellaneousList';
import MiscellaneousForm from '../components/MiscellaneousForm';
import MiscellaneousTest from '../components/MiscellaneousTest';
import { postApiMiscellaneous, putApiMiscellaneousById } from '../api/sdk.gen';
import { client as pricingnewClient } from '../api';
import {
  MiscellaneousCreateRequest,
  MiscellaneousResponse
} from '../api/types.gen';
import { showSnackbar } from '../../../components/common/Snackbar';
import { Box, Paper, Container, Grid, Button, Typography, Stack } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import ScienceIcon from '@mui/icons-material/Science';
import ViewListIcon from '@mui/icons-material/ViewList';
import ViewModuleIcon from '@mui/icons-material/ViewModule';
import { ToggleButton, ToggleButtonGroup } from '@mui/material';

const MiscellaneousCRUDPage: React.FC = () => {
  const [showForm, setShowForm] = useState(false);
  const [showTest, setShowTest] = useState(false);
  const [editingMiscellaneous, setEditingMiscellaneous] = useState<MiscellaneousResponse | null>(null);
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [viewMode, setViewMode] = useState<'cards' | 'list'>('cards');

  const handleViewModeChange = (
    event: React.MouseEvent<HTMLElement>,
    newViewMode: 'cards' | 'list' | null,
  ) => {
    if (newViewMode !== null) {
      setViewMode(newViewMode);
    }
  };

  const handleCreate = () => {
    setEditingMiscellaneous(null);
    setShowForm(true);
    setShowTest(false);
    setFormError(null);
  };

  const handleEdit = (miscellaneous: MiscellaneousResponse) => {
    setEditingMiscellaneous(miscellaneous);
    setShowForm(true);
    setShowTest(false);
    setFormError(null);
  };

  const handleFormSubmit = async (data: MiscellaneousCreateRequest) => {
    try {
      setFormLoading(true);
      setFormError(null);
      if (editingMiscellaneous) {
        await putApiMiscellaneousById({ client: pricingnewClient, path: { id: editingMiscellaneous.id || '' }, body: data });
        showSnackbar('Service miscellaneous mis à jour avec succès', 'success');
      } else {
        await postApiMiscellaneous({ client: pricingnewClient, body: data });
        showSnackbar('Service miscellaneous créé avec succès', 'success');
      }
      setShowForm(false);
      setEditingMiscellaneous(null);
      setRefreshKey(prev => prev + 1);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Une erreur est survenue lors de la sauvegarde';
      setFormError(errorMessage);
      showSnackbar(errorMessage, 'warning');
    } finally {
      setFormLoading(false);
    }
  };

  const handleFormCancel = () => {
    setShowForm(false);
    setEditingMiscellaneous(null);
    setFormError(null);
  };

  const handleTestToggle = () => {
    setShowTest(!showTest);
    setShowForm(false);
    setEditingMiscellaneous(null);
    setFormError(null);
  };

  return (
    <Box sx={{ minHeight: '100vh', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', py: 4 }}>
      <Container maxWidth="xl">
        {/* Header Section */}
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
          <Box
            sx={{
              display: 'flex',
              flexDirection: { xs: 'column', md: 'row' },
              alignItems: { xs: 'flex-start', md: 'center' },
              justifyContent: 'space-between',
              gap: 2
            }}
          >
            <Box>
              <Typography
                variant="h3"
                sx={{
                  fontWeight: 700,
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  mb: 1
                }}
              >
                Services Miscellaneous
              </Typography>
              <Typography
                variant="body1"
                sx={{
                  color: '#666',
                  fontSize: '1.1rem',
                  fontWeight: 400
                }}
              >
                Gérez vos services miscellaneous avec une interface moderne et unifiée
              </Typography>
            </Box>
            <Stack direction="row" spacing={2} sx={{ mt: { xs: 2, md: 0 }, alignItems: 'center' }}>
              <ToggleButtonGroup
                value={viewMode}
                exclusive
                onChange={handleViewModeChange}
                aria-label="mode d'affichage"
                size="small"
                sx={{
                  boxShadow: 'none',
                  border: '1px solid #e0e0e0',
                  borderRadius: 2,
                  bgcolor: 'white',
                  mr: 1
                }}
              >
                <ToggleButton
                  value="cards"
                  aria-label="affichage en cartes"
                  sx={{ px: 1.5, py: 1, minWidth: 0 }}
                >
                  <ViewModuleIcon />
                </ToggleButton>
                <ToggleButton
                  value="list"
                  aria-label="affichage en liste"
                  sx={{ px: 1.5, py: 1, minWidth: 0 }}
                >
                  <ViewListIcon />
                </ToggleButton>
              </ToggleButtonGroup>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={handleCreate}
                disabled={showForm || showTest}
                sx={{
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  borderRadius: 2,
                  px: 3,
                  py: 1.5,
                  fontWeight: 600,
                  textTransform: 'none',
                  fontSize: '0.95rem',
                  boxShadow: '0 4px 15px rgba(102, 126, 234, 0.3)',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)',
                    transform: 'translateY(-2px)',
                    boxShadow: '0 8px 25px rgba(102, 126, 234, 0.4)'
                  }
                }}
              >
                Nouveau Service
              </Button>
              <Button
                variant="outlined"
                startIcon={<ScienceIcon />}
                onClick={handleTestToggle}
                disabled={showForm}
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
                {showTest ? 'Masquer Tests' : 'Tests API'}
              </Button>
            </Stack>
          </Box>
        </Paper>

        {/* Bloc principal */}
        <Paper
          elevation={0}
          sx={{
            borderRadius: 3,
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            overflow: 'hidden',
            p: 3
          }}
        >
          {formError && (
            <Box sx={{ mb: 3 }}>
              <Typography color="error" fontWeight={600}>{formError}</Typography>
            </Box>
          )}
          {showTest && <MiscellaneousTest />}
          {showForm ? (
            <Box>
              <MiscellaneousForm
                miscellaneous={editingMiscellaneous || undefined}
                onSubmit={handleFormSubmit}
                onCancel={handleFormCancel}
                loading={formLoading}
              />
            </Box>
          ) : !showTest ? (
            <Box>
              <MiscellaneousList key={refreshKey} onEdit={handleEdit} viewMode={viewMode} />
            </Box>
          ) : null}
        </Paper>
      </Container>
    </Box>
  );
};

export default MiscellaneousCRUDPage; 