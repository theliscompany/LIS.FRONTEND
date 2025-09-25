import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useFormContext } from 'react-hook-form';
import { OptionsComparison } from '../components/OptionsComparison';
import {
  Box,
  Typography,
  Paper,
  Button,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  Chip,
  Card,
  CardContent,
  CardActions,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  Grid,
  Avatar,
  Stack,
  Badge,
  Fade,
  Slide,
  Tabs,
  Tab
} from '@mui/material';
import {
  LocationOn,
  DirectionsBoat,
  LocalShipping,
  CheckCircle,
  AttachFile,
  Add,
  Send,
  Storage,
  DirectionsCar,
  Build,
  Person,
  Assignment,
  Description,
  Schedule,
  Business,
  Euro,
  Warning,
  CheckCircleOutline,
  List as ListIcon,
  Create
} from '@mui/icons-material';

import { DraftQuoteForm, QuoteOption } from '../schema';
import { validateFormForSubmission } from '../toDraftQuote';

// Composant TabPanel personnalisé
interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

interface ReviewStepProps {
  onSubmit: () => void;
  onSaveDraft: () => Promise<string | null>;
  isDraftSaving: boolean;
  lastDraftSaved: Date | null;
  draftId?: string | null;
  onCreateOption: () => void;
  onEditOption: (option: QuoteOption) => void;
  onDeleteOption: (optionId: string) => void;
  onViewOption: (option: QuoteOption) => void;
  onSetPreferredOption: (optionId: string) => void;
  preferredOptionId?: string;
  onDuplicateOption: (option: QuoteOption) => void;
}

export const ReviewStep: React.FC<ReviewStepProps> = ({ 
  onSubmit, 
  onSaveDraft,
  isDraftSaving,
  lastDraftSaved,
  draftId,
  onCreateOption,
  onEditOption,
  onDeleteOption,
  onViewOption,
  onSetPreferredOption,
  preferredOptionId,
  onDuplicateOption
}) => {
  const { watch, control } = useFormContext<DraftQuoteForm>();
  const [showAttachmentDialog, setShowAttachmentDialog] = useState(false);
  const [newAttachment, setNewAttachment] = useState({ name: '', url: '' });
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState(0);

  const formData = watch();
  const existingOptions = formData.existingOptions || [];
  const canCreateOption = existingOptions.length < 3 && draftId; // Nécessite un brouillon existant

  const handleSubmit = () => {
    const validation = validateFormForSubmission(formData);
    if (validation.isValid) {
      setValidationErrors([]);
      onSubmit();
    } else {
      setValidationErrors(validation.errors);
    }
  };

  const handleAddAttachment = () => {
    if (newAttachment.name && newAttachment.url) {
      // This would need to be implemented with useFieldArray
      // For now, just close the dialog
      setShowAttachmentDialog(false);
      setNewAttachment({ name: '', url: '' });
    }
  };

  const getCargoTypeIcon = (cargoType: string) => {
    switch (cargoType) {
      case 'FCL':
      case 'LCL':
        return <DirectionsBoat color="primary" />;
      case 'AIR':
        return <LocalShipping color="action" />;
      default:
        return <LocalShipping color="disabled" />;
    }
  };

  const getCargoTypeColor = (cargoType: string) => {
    switch (cargoType) {
      case 'FCL':
        return 'primary';
      case 'LCL':
        return 'secondary';
      case 'AIR':
        return 'info';
      default:
        return 'default';
    }
  };

  return (
    <Box sx={{ maxWidth: { xs: '100%', sm: 1200, md: 1400, lg: 1600 }, mx: 'auto' }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <Box sx={{ 
          textAlign: 'center', 
          mb: 4,
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          borderRadius: 3,
          p: 4,
          color: 'white',
          boxShadow: '0 8px 32px rgba(102, 126, 234, 0.3)'
        }}>
          <Typography variant="h3" sx={{ 
            fontWeight: 700, 
            mb: 1,
            textShadow: '2px 2px 4px rgba(0,0,0,0.3)'
          }}>
            🎯 Gestion des Options de Devis
          </Typography>
          <Typography variant="h6" sx={{ opacity: 0.9 }}>
            Gérez vos options existantes et créez de nouvelles options
          </Typography>
        </Box>
      </motion.div>


      {/* Alerte si le brouillon n'existe pas */}
      {!draftId && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
        >
          <Alert 
            severity="warning" 
            sx={{ 
              mb: 3,
              borderRadius: 3,
              background: 'linear-gradient(135deg, #fff3e0 0%, #ffe0b2 100%)',
              border: '1px solid rgba(255, 152, 0, 0.3)',
              boxShadow: '0 4px 20px rgba(255, 152, 0, 0.2)'
            }}
          >
            <Typography variant="h6" sx={{ fontWeight: 700, color: '#f57c00', display: 'flex', alignItems: 'center', gap: 1 }}>
              <Warning sx={{ fontSize: 24 }} />
              Brouillon non sauvegardé
            </Typography>
            <Typography variant="body2" sx={{ color: '#e65100', mt: 1 }}>
              Vous devez d'abord sauvegarder le brouillon dans la base de données avant de pouvoir créer des options. 
              Le brouillon sera automatiquement créé lors de la première création d'option.
            </Typography>
          </Alert>
        </motion.div>
      )}

      {/* Onglets pour Options existantes et Création */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        <Card sx={{
          borderRadius: 3,
          boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
          background: 'linear-gradient(145deg, #ffffff 0%, #f8f9fa 100%)',
          border: '1px solid rgba(0,0,0,0.05)',
          overflow: 'hidden'
        }}>
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs 
              value={activeTab} 
              onChange={(_, newValue) => setActiveTab(newValue)}
              variant="fullWidth"
              sx={{
                '& .MuiTab-root': {
                  fontSize: '1.1rem',
                  fontWeight: 600,
                  textTransform: 'none',
                  py: 2
                }
              }}
            >
              <Tab 
                icon={<ListIcon />} 
                iconPosition="start" 
                label={`Comparaison & Options (${existingOptions.length}/3)`}
                sx={{
                  background: activeTab === 0 ? 'linear-gradient(135deg, #e3f2fd 0%, #f3e5f5 100%)' : 'transparent',
                  color: activeTab === 0 ? '#1976d2' : 'inherit',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #e3f2fd 0%, #f3e5f5 100%)',
                    color: '#1976d2'
                  }
                }}
              />
              <Tab 
                icon={<Create />} 
                iconPosition="start" 
                label="Créer une nouvelle option"
                disabled={!canCreateOption}
                sx={{
                  background: activeTab === 1 ? 'linear-gradient(135deg, #e8f5e8 0%, #c8e6c9 100%)' : 'transparent',
                  color: activeTab === 1 ? '#2e7d32' : canCreateOption ? 'inherit' : '#ccc',
                  '&:hover': canCreateOption ? {
                    background: 'linear-gradient(135deg, #e8f5e8 0%, #c8e6c9 100%)',
                    color: '#2e7d32'
                  } : {}
                }}
              />
            </Tabs>
          </Box>

          <Box sx={{ p: 3 }}>
            {/* Onglet Options existantes avec comparaison intégrée */}
            <TabPanel value={activeTab} index={0}>
              <OptionsComparison 
                formData={formData}
                onSetPreferredOption={onSetPreferredOption}
                preferredOptionId={preferredOptionId}
                onDuplicateOption={onDuplicateOption}
                onEditOption={onEditOption}
                onDeleteOption={onDeleteOption}
                onViewOption={onViewOption}
              />
            </TabPanel>

            {/* Onglet Création d'option */}
            <TabPanel value={activeTab} index={1}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
              >
                <Card sx={{
                  borderRadius: 3,
                  boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
                  background: 'linear-gradient(145deg, #ffffff 0%, #f8f9fa 100%)',
                  border: '1px solid rgba(0,0,0,0.05)',
                  textAlign: 'center',
                  p: 4
                }}>
                  <Typography variant="h4" sx={{ 
                    fontWeight: 700, 
                    mb: 2,
                    color: '#2e7d32',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 2
                  }}>
                    <Create sx={{ fontSize: 40 }} />
                    Créer une nouvelle option
                  </Typography>
                  <Typography variant="body1" sx={{ color: '#666', mb: 4 }}>
                    {draftId 
                      ? 'Configurez les détails de votre nouvelle option de devis'
                      : 'Vous devez d\'abord sauvegarder le brouillon pour créer des options'
                    }
                  </Typography>
                  
                  <Button
                    variant="contained"
                    size="large"
                    onClick={onCreateOption}
                    disabled={!canCreateOption}
                    sx={{
                      background: canCreateOption 
                        ? 'linear-gradient(135deg, #2e7d32 0%, #4caf50 100%)' 
                        : '#ccc',
                      color: 'white',
                      px: 4,
                      py: 2,
                      fontSize: '1.2rem',
                      fontWeight: 700,
                      borderRadius: 3,
                      textTransform: 'none',
                      boxShadow: canCreateOption 
                        ? '0 8px 32px rgba(46, 125, 50, 0.3)' 
                        : 'none',
                      '&:hover': canCreateOption ? {
                        background: 'linear-gradient(135deg, #1b5e20 0%, #388e3c 100%)',
                        transform: 'translateY(-2px)',
                        boxShadow: '0 12px 40px rgba(46, 125, 50, 0.4)'
                      } : {},
                      transition: 'all 0.3s ease'
                    }}
                  >
                    {draftId ? '🚀 Commencer la création' : '⚠️ Brouillon requis'}
                  </Button>
                </Card>
              </motion.div>
            </TabPanel>
          </Box>
        </Card>
      </motion.div>

      {/* Informations de base du brouillon */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.4 }}
      >
        <Card sx={{
          mt: 3,
          borderRadius: 3,
          boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
          background: 'linear-gradient(145deg, #ffffff 0%, #f8f9fa 100%)',
          border: '1px solid rgba(0,0,0,0.05)',
          overflow: 'hidden'
        }}>
          <Box sx={{
            background: 'linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)',
            p: 3,
            color: 'white'
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Business sx={{ fontSize: 32 }} />
              <Typography variant="h5" sx={{ fontWeight: 700 }}>
                📋 Informations de base du brouillon
              </Typography>
            </Box>
            <Typography variant="body2" sx={{ opacity: 0.9, mt: 0.5 }}>
              Informations communes à toutes les options
            </Typography>
          </Box>

          <CardContent sx={{ p: 4 }}>
            <Grid container spacing={4}>
              {/* Type de cargo et Incoterm */}
              <Grid item xs={12} md={6}>
                <Stack spacing={2}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Storage sx={{ color: '#1976d2' }} />
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      Type de cargo
                    </Typography>
                  </Box>
                  <Chip
                    icon={getCargoTypeIcon(formData.basics.cargoType)}
                    label={formData.basics.cargoType}
                    color={getCargoTypeColor(formData.basics.cargoType) as any}
                    sx={{
                      fontSize: '1.1rem',
                      fontWeight: 700,
                      py: 2,
                      px: 1,
                      background: 'linear-gradient(135deg, #0d3d0d 0%, #1b5e20 100%)',
                      color: '#ffffff',
                      boxShadow: '0 6px 16px rgba(13, 61, 13, 0.4)',
                      textShadow: '2px 2px 4px rgba(0,0,0,0.8)',
                      '& .MuiChip-icon': {
                        color: '#ffffff',
                        filter: 'drop-shadow(2px 2px 4px rgba(0,0,0,0.8))'
                      }
                    }}
                  />
                </Stack>
              </Grid>

              <Grid item xs={12} md={6}>
                <Stack spacing={2}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Euro sx={{ color: '#1976d2' }} />
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      Incoterm
                    </Typography>
                  </Box>
                  <Chip
                    label={formData.basics.incoterm}
                    color="primary"
                    sx={{
                      fontSize: '1.1rem',
                      fontWeight: 700,
                      py: 2,
                      px: 1,
                      background: 'linear-gradient(135deg, #002171 0%, #0d47a1 100%)',
                      color: '#ffffff',
                      boxShadow: '0 6px 16px rgba(0, 33, 113, 0.4)',
                      textShadow: '2px 2px 4px rgba(0,0,0,0.8)'
                    }}
                  />
                </Stack>
              </Grid>

              {/* Route */}
              <Grid item xs={12}>
                <Box sx={{
                  p: 3,
                  borderRadius: 2,
                  background: 'linear-gradient(135deg, #e3f2fd 0%, #f3e5f5 100%)',
                  border: '1px solid rgba(25, 118, 210, 0.2)'
                }}>
                  <Typography variant="h6" sx={{ 
                    fontWeight: 600, 
                    mb: 2,
                    color: '#1976d2',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1
                  }}>
                    <LocationOn />
                    Route
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12} md={6}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <LocationOn sx={{ color: '#e74c3c' }} />
                        <Typography variant="body1" sx={{ fontWeight: 600 }}>
                          {formData.basics.origin.city}, {formData.basics.origin.country}
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <LocationOn sx={{ color: '#2ecc71' }} />
                        <Typography variant="body1" sx={{ fontWeight: 600 }}>
                          {formData.basics.destination.city}, {formData.basics.destination.country}
                        </Typography>
                      </Box>
                    </Grid>
                  </Grid>
                </Box>
              </Grid>

              {/* Date de départ et Description */}
              <Grid item xs={12} md={6}>
                <Stack spacing={2}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Schedule sx={{ color: '#1976d2' }} />
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      Date de départ souhaitée
                    </Typography>
                  </Box>
                  <Typography variant="body1" sx={{ fontWeight: 600, color: '#666' }}>
                    {formData.basics.requestedDeparture ? 
                      new Date(formData.basics.requestedDeparture).toLocaleDateString() : 
                      'Non spécifiée'
                    }
                  </Typography>
                </Stack>
              </Grid>

              <Grid item xs={12} md={6}>
                <Stack spacing={2}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Description sx={{ color: '#1976d2' }} />
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      Description des marchandises
                    </Typography>
                  </Box>
                  <Typography variant="body1" sx={{ fontWeight: 600, color: '#666' }}>
                    {formData.basics.goodsDescription || 'Non spécifiée'}
                  </Typography>
                </Stack>
              </Grid>

              {/* Client et Assigné */}
              {(formData.basics.client || formData.basics.assignee) && (
                <Grid item xs={12}>
                  <Box sx={{
                    p: 3,
                    borderRadius: 2,
                    background: 'linear-gradient(135deg, #e8f5e8 0%, #c8e6c9 100%)',
                    border: '1px solid rgba(46, 125, 50, 0.2)'
                  }}>
                    <Typography variant="h6" sx={{ 
                      fontWeight: 600, 
                      mb: 2,
                      color: '#2e7d32',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1
                    }}>
                      <Person />
                      Client & Assigné
                    </Typography>
                    <Grid container spacing={2}>
                      {formData.basics.client && (
                        <Grid item xs={12} md={6}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Person sx={{ color: '#2e7d32' }} />
                            <Typography variant="body1" sx={{ fontWeight: 600 }}>
                              {formData.basics.client.companyName || formData.basics.client.contactFullName}
                            </Typography>
                          </Box>
                        </Grid>
                      )}
                      {formData.basics.assignee && (
                        <Grid item xs={12} md={6}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Assignment sx={{ color: '#2e7d32' }} />
                            <Typography variant="body1" sx={{ fontWeight: 600 }}>
                              {formData.basics.assignee.assigneeDisplayName}
                            </Typography>
                          </Box>
                        </Grid>
                      )}
                    </Grid>
                  </Box>
                </Grid>
              )}
            </Grid>
          </CardContent>
        </Card>
      </motion.div>

      {/* Erreurs de validation */}
      {validationErrors.length > 0 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
        >
          <Alert 
            severity="error" 
            sx={{ 
              mt: 3,
              borderRadius: 3,
              background: 'linear-gradient(135deg, #ffebee 0%, #fce4ec 100%)',
              border: '1px solid rgba(244, 67, 54, 0.3)',
              boxShadow: '0 4px 20px rgba(244, 67, 54, 0.2)'
            }}
          >
            <Typography variant="h6" sx={{ fontWeight: 700, color: '#d32f2f' }}>
              ⚠️ Erreurs de validation
            </Typography>
            <ul style={{ margin: '8px 0', paddingLeft: '20px' }}>
              {validationErrors.map((error, index) => (
                <li key={index}>
                  <Typography variant="body2" sx={{ color: '#d32f2f' }}>
                    {error}
                  </Typography>
                </li>
              ))}
            </ul>
          </Alert>
        </motion.div>
      )}

      {/* Dialog pour ajouter des pièces jointes */}
      <Dialog 
        open={showAttachmentDialog} 
        onClose={() => setShowAttachmentDialog(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            background: 'linear-gradient(145deg, #ffffff 0%, #f8f9fa 100%)',
            boxShadow: '0 8px 32px rgba(0,0,0,0.1)'
          }
        }}
      >
        <DialogTitle sx={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          borderRadius: '12px 12px 0 0',
          display: 'flex',
          alignItems: 'center',
          gap: 1
        }}>
          <AttachFile />
          Ajouter une pièce jointe
        </DialogTitle>
        <DialogContent sx={{ p: 3 }}>
          <TextField
            fullWidth
            label="Nom de la pièce jointe"
            value={newAttachment.name}
            onChange={(e) => setNewAttachment(prev => ({ ...prev, name: e.target.value }))}
            sx={{ mb: 2 }}
            variant="outlined"
          />
          <TextField
            fullWidth
            label="URL de la pièce jointe"
            value={newAttachment.url}
            onChange={(e) => setNewAttachment(prev => ({ ...prev, url: e.target.value }))}
            variant="outlined"
          />
        </DialogContent>
        <DialogActions sx={{ p: 3, gap: 2 }}>
          <Button
            onClick={() => setShowAttachmentDialog(false)}
            sx={{
              borderRadius: 2,
              textTransform: 'none',
              fontWeight: 600
            }}
          >
            Annuler
          </Button>
          <Button
            onClick={handleAddAttachment}
            variant="contained"
            sx={{
              background: 'linear-gradient(135deg, #2e7d32 0%, #4caf50 100%)',
              borderRadius: 2,
              textTransform: 'none',
              fontWeight: 600,
              '&:hover': {
                background: 'linear-gradient(135deg, #1b5e20 0%, #388e3c 100%)'
              }
            }}
          >
            Ajouter
          </Button>
        </DialogActions>
      </Dialog>

      {/* Bouton pour sauvegarder le brouillon */}
      <SaveDraftButton 
        onSaveDraft={onSaveDraft}
        isDraftSaving={isDraftSaving}
        draftId={draftId}
      />

      {/* Bouton pour sauvegarder l'option actuelle */}
      <SaveOptionButton 
        onSaveDraft={onSaveDraft}
        isDraftSaving={isDraftSaving}
        draftId={draftId}
      />
    </Box>
  );
};

// Bouton pour sauvegarder le brouillon
const SaveDraftButton: React.FC<{
  onSaveDraft?: () => Promise<string | null>;
  isDraftSaving?: boolean;
  draftId?: string | null;
}> = ({ onSaveDraft, isDraftSaving, draftId }) => {
  const { watch } = useFormContext<DraftQuoteForm>();
  const formData = watch();
  const existingOptionsCount = formData.existingOptions?.length || 0;
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.6 }}
    >
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        mt: 3,
        p: 3,
        background: 'linear-gradient(135deg, #e3f2fd 0%, #f3e5f5 100%)',
        borderRadius: 3,
        border: '1px solid rgba(25, 118, 210, 0.2)'
      }}>
        <Button
          variant="contained"
          size="large"
          onClick={onSaveDraft}
          disabled={isDraftSaving}
          sx={{
            background: 'linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)',
            color: 'white',
            px: 4,
            py: 2,
            fontSize: '1.2rem',
            fontWeight: 700,
            borderRadius: 3,
            textTransform: 'none',
            boxShadow: '0 8px 32px rgba(25, 118, 210, 0.3)',
            '&:hover': {
              background: 'linear-gradient(135deg, #1565c0 0%, #1976d2 100%)',
              transform: 'translateY(-2px)',
              boxShadow: '0 12px 40px rgba(25, 118, 210, 0.4)'
            },
            transition: 'all 0.3s ease'
          }}
        >
          {isDraftSaving 
            ? '💾 Sauvegarde...' 
            : `💾 Save Draft${existingOptionsCount > 0 ? ` (${existingOptionsCount} option${existingOptionsCount > 1 ? 's' : ''})` : ''}`
          }
        </Button>
      </Box>
    </motion.div>
  );
};

// Bouton pour sauvegarder l'option actuelle
const SaveOptionButton: React.FC<{
  onSaveDraft?: () => Promise<string | null>;
  isDraftSaving?: boolean;
  draftId?: string | null;
}> = ({ onSaveDraft, isDraftSaving, draftId }) => {
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [optionName, setOptionName] = useState('');
  const [optionDescription, setOptionDescription] = useState('');
  const { watch, setValue } = useFormContext<DraftQuoteForm>();
  
  const currentOption = watch('currentOption');
  const existingOptions = watch('existingOptions') || [];
  
  const canSaveOption = existingOptions.length < 3 && 
    (currentOption.seafreights.length > 0 || currentOption.haulages.length > 0 || currentOption.services.length > 0) &&
    draftId; // Nécessite un brouillon existant pour sauvegarder une option
  
  const canSaveDraft = true; // Le bouton Save Draft doit toujours être actif
  
  const handleSaveOption = async () => {
    if (optionName.trim() && canSaveOption) {
      const newOption = {
        id: `option_${Date.now()}`,
        name: optionName.trim(),
        description: optionDescription.trim() || undefined,
        seafreights: currentOption.seafreights,
        haulages: currentOption.haulages,
        services: currentOption.services,
        totalPrice: calculateTotalPrice(currentOption),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      const updatedOptions = [...existingOptions, newOption];
      setValue('existingOptions', updatedOptions);
      
      // Reset current option
      setValue('currentOption', {
        seafreights: [],
        haulages: [],
        services: []
      });
      
      // Sauvegarder le brouillon si la fonction est fournie
      if (onSaveDraft) {
        try {
          await onSaveDraft();
          console.log('✅ Brouillon sauvegardé après création d\'option');
        } catch (error) {
          console.error('❌ Erreur lors de la sauvegarde du brouillon:', error);
        }
      }
      
      setShowSaveDialog(false);
      setOptionName('');
      setOptionDescription('');
    }
  };
  
  const calculateTotalPrice = (option: any): number => {
    let total = 0;
    
    option.seafreights?.forEach((sf: any) => {
      sf.rates?.forEach((rate: any) => {
        total += rate.basePrice || 0;
      });
    });
    
    option.haulages?.forEach((haulage: any) => {
      total += haulage.price || 0;
    });
    
    option.services?.forEach((service: any) => {
      total += service.price || 0;
    });
    
    return total;
  };
  
  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.8 }}
      >
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'center', 
          mt: 4,
          p: 3,
          background: 'linear-gradient(135deg, #e8f5e8 0%, #c8e6c9 100%)',
          borderRadius: 3,
          border: '1px solid rgba(46, 125, 50, 0.2)'
        }}>
          <Button
            variant="contained"
            size="large"
            onClick={() => setShowSaveDialog(true)}
            disabled={!canSaveOption}
            sx={{
              background: canSaveOption ? 'linear-gradient(135deg, #2e7d32 0%, #4caf50 100%)' : '#ccc',
              color: 'white',
              px: 4,
              py: 2,
              fontSize: '1.2rem',
              fontWeight: 700,
              borderRadius: 3,
              textTransform: 'none',
              boxShadow: canSaveOption ? '0 8px 32px rgba(46, 125, 50, 0.3)' : 'none',
              '&:hover': canSaveOption ? {
                background: 'linear-gradient(135deg, #1b5e20 0%, #388e3c 100%)',
                transform: 'translateY(-2px)',
                boxShadow: '0 12px 40px rgba(46, 125, 50, 0.4)'
              } : {},
              transition: 'all 0.3s ease'
            }}
          >
            {draftId ? '💾 Sauvegarder cette option & brouillon' : '⚠️ Brouillon requis pour sauvegarder'}
          </Button>
        </Box>
      </motion.div>
      
      {/* Dialog pour sauvegarder l'option */}
      <Dialog 
        open={showSaveDialog} 
        onClose={() => setShowSaveDialog(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            background: 'linear-gradient(145deg, #ffffff 0%, #f8f9fa 100%)',
            boxShadow: '0 8px 32px rgba(0,0,0,0.1)'
          }
        }}
      >
        <DialogTitle sx={{
          background: 'linear-gradient(135deg, #2e7d32 0%, #4caf50 100%)',
          color: 'white',
          borderRadius: '12px 12px 0 0',
          display: 'flex',
          alignItems: 'center',
          gap: 1
        }}>
          <Add />
          Sauvegarder l'option & brouillon
        </DialogTitle>
        <DialogContent sx={{ p: 3 }}>
          <TextField
            fullWidth
            label="Nom de l'option *"
            value={optionName}
            onChange={(e) => setOptionName(e.target.value)}
            sx={{ mb: 2 }}
            variant="outlined"
            placeholder="Ex: Option Standard, Option Express..."
          />
          <TextField
            fullWidth
            label="Description (optionnelle)"
            value={optionDescription}
            onChange={(e) => setOptionDescription(e.target.value)}
            variant="outlined"
            multiline
            rows={3}
            placeholder="Décrivez cette option..."
          />
        </DialogContent>
        <DialogActions sx={{ p: 3, gap: 2 }}>
          <Button
            onClick={() => setShowSaveDialog(false)}
            sx={{
              borderRadius: 2,
              textTransform: 'none',
              fontWeight: 600
            }}
          >
            Annuler
          </Button>
          <Button
            onClick={handleSaveOption}
            variant="contained"
            disabled={!optionName.trim() || isDraftSaving}
            sx={{
              background: 'linear-gradient(135deg, #2e7d32 0%, #4caf50 100%)',
              borderRadius: 2,
              textTransform: 'none',
              fontWeight: 600,
              '&:hover': {
                background: 'linear-gradient(135deg, #1b5e20 0%, #388e3c 100%)'
              }
            }}
          >
            {isDraftSaving ? 'Sauvegarde...' : 'Sauvegarder & brouillon'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};


export default ReviewStep;
