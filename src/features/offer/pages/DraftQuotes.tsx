import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  Button,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Snackbar,
  CircularProgress,
  Stack,
  Avatar,
  Fade,
  TextField,
  InputAdornment,
  LinearProgress,
  Tooltip
} from '@mui/material';
import {
  Delete,
  Visibility,
  Refresh,
  Dashboard,
  Timeline,
  Search,
  TrendingUp,
  Assessment,
  Schedule,
  Assignment,
  Person,
  PlayArrow,
  Settings as ManageIcon,
  Business
} from '@mui/icons-material';
import { DataGrid, GridRenderCellParams } from '@mui/x-data-grid';
import { useNavigate } from 'react-router-dom';
import { 
  getApiDraftQuotesOptions, 
  deleteApiDraftQuotesByIdMutation 
} from '@features/offer/api/@tanstack/react-query.gen';

interface DraftQuote {
  id: string;
  quoteOfferNumber?: number;
  requestQuoteId?: string;
  clientNumber?: string;
  emailUser?: string;
  status?: string;
  created?: string;
  assignedTo?: string;
  lastModified?: string;
  progress?: number;
  currentStep?: number;
  totalSteps?: number;
  completedSteps?: string[];
  draftData?: any;
  requestData?: any;
  step1?: any;
  step2?: any;
  step3?: any;
  step4?: any;
  step5?: any;
  step6?: any;
  savedOptions?: any[];
  selectedHaulage?: any;
  selectedSeafreights?: any[];
  selectedMiscellaneous?: any[];
}

const formatDate = (dateValue: any): string => {
  try {
    if (!dateValue) return 'Date non définie';
    
    let date: Date;
    if (typeof dateValue === 'string') {
      date = new Date(dateValue);
    } else if (dateValue instanceof Date) {
      date = dateValue;
    } else {
      return 'Format de date invalide';
    }
    
    if (isNaN(date.getTime())) {
      return 'Date invalide';
    }
    
    return date.toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch (error) {
    console.error('[DraftQuotes] Erreur formatage date:', error, dateValue);
    return 'Date invalide';
  }
};

/**
 * Calcule la progression d'un brouillon côté frontend (utilisé comme fallback)
 * 
 * ✅ PROGRESSION PERSISTÉE IMPLÉMENTÉE :
 * Le backend persiste maintenant la progression dans WizardData :
 * 
 * - currentStep: number (1-6) - étape actuelle du wizard
 * - completedSteps: number[] - liste des numéros d'étapes terminées
 * 
 * Le frontend utilise en priorité ces valeurs persistées et calcule la progression
 * en pourcentage basée sur le nombre d'étapes complétées.
 * Cette fonction sert de fallback si les données persistées ne sont pas disponibles.
 */
const calculateProgress = (quote: DraftQuote): { progress: number; currentStep: number; completedSteps: string[] } => {
  let progress = 0;
  let currentStep = 1;
  const completedSteps: string[] = [];
  const stepWeight = 100 / 6; // 16.67% par étape
  
  // Step 1: Informations générales (client, produit, incoterm)
  if (quote.step1 && Object.keys(quote.step1).length > 0) {
    const hasClient = quote.step1.customer?.contactName || quote.step1.customer?.email;
    const hasProduct = quote.step1.productName?.productName || quote.step1.productName;
    const hasIncoterm = quote.step1.incotermName;
    const hasCities = quote.step1.cityFrom && quote.step1.cityTo;
    
    if (hasClient && hasProduct && hasIncoterm && hasCities) {
      progress += stepWeight;
      completedSteps.push('1/6 Informations générales');
      currentStep = 2;
    }
  }
  
  // Step 2: Services sélectionnés
  if (quote.step2 && Object.keys(quote.step2).length > 0) {
    const hasServices = quote.step2.selected && Array.isArray(quote.step2.selected) && quote.step2.selected.length > 0;
    
    if (hasServices) {
      progress += stepWeight;
      completedSteps.push('2/6 Services');
      currentStep = 3;
    }
  }
  
  // Step 3: Conteneurs et route
  if (quote.step3 && Object.keys(quote.step3).length > 0) {
    const hasContainers = quote.step3.containers && Array.isArray(quote.step3.containers) && quote.step3.containers.length > 0;
    const hasRoute = quote.step3.route && 
                    quote.step3.route.origin && 
                    quote.step3.route.destination;
    
    if (hasContainers && hasRoute) {
      progress += stepWeight;
      completedSteps.push('3/6 Conteneurs & Route');
      currentStep = 4;
    }
  }
  
  // Step 4: Haulage sélectionné
  if (quote.step4 && Object.keys(quote.step4).length > 0) {
    const hasHaulageSelection = quote.step4.selection && 
                               quote.step4.selection.haulierId && 
                               quote.step4.selection.haulierName;
    
    if (hasHaulageSelection || quote.selectedHaulage) {
      progress += stepWeight;
      completedSteps.push('4/6 Transport routier');
      currentStep = 5;
    }
  }
  
  // Step 5: Seafreight sélectionné
  if (quote.step5 && Object.keys(quote.step5).length > 0) {
    const hasSeafreightSelections = quote.step5.selections && 
                                   Array.isArray(quote.step5.selections) && 
                                   quote.step5.selections.length > 0;
    
    if (hasSeafreightSelections || (quote.selectedSeafreights && quote.selectedSeafreights.length > 0)) {
      progress += stepWeight;
      completedSteps.push('5/6 Transport maritime');
      currentStep = 6;
    }
  }
  
  // Step 6: Miscellaneous ou options sauvegardées
  if (quote.step6 && Object.keys(quote.step6).length > 0) {
    progress += stepWeight;
    completedSteps.push('6/6 Finalisation');
    currentStep = 7; // Terminé
  } else if (quote.savedOptions && quote.savedOptions.length > 0) {
    // Si des options sont sauvegardées, considérer comme partiellement terminé
    progress += stepWeight * 0.5;
    completedSteps.push('6/6 Options sauvegardées');
    currentStep = 6;
  }
  
  return {
    progress: Math.round(progress),
    currentStep: Math.min(currentStep, 6),
    completedSteps
  };
};

const DraftQuotes: React.FC = () => {
  const navigate = useNavigate();
  
  const [drafts, setDrafts] = useState<DraftQuote[]>([]);
  
  // Utiliser React Query avec les options du SDK pour charger les brouillons
  const { 
    data: draftsResponse, 
    isLoading: loading, 
    error,
    refetch: loadDrafts 
  } = useQuery(getApiDraftQuotesOptions({
    query: {
      page: 1,
      pageSize: 100
    }
  }));
  const [searchTerm, setSearchTerm] = useState('');
  const [assignDialog, setAssignDialog] = useState(false);
  const [selectedDraft, setSelectedDraft] = useState<DraftQuote | null>(null);
  const [assignTo, setAssignTo] = useState('');
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error' | 'warning' | 'info';
  }>({
    open: false,
    message: '',
    severity: 'success'
  });
  
  const [viewMode, setViewMode] = useState<'card' | 'table'>('card');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingDraft, setDeletingDraft] = useState<DraftQuote | null>(null);
  
  // Mutation pour supprimer un draft
  const queryClient = useQueryClient();
  const deleteDraftMutation = useMutation(deleteApiDraftQuotesByIdMutation());

  // Traiter les données quand elles arrivent via React Query
  useEffect(() => {
    if (draftsResponse) {
      console.log('🔍 [DraftQuotes] Données reçues via useQuery:', draftsResponse);
      console.log('🔍 [DraftQuotes] Structure complète de la réponse:', JSON.stringify(draftsResponse, null, 2));
      processDraftsData(draftsResponse);
    }
  }, [draftsResponse]);

  // Gérer les erreurs React Query
  useEffect(() => {
    if (error) {
      console.error('[DraftQuotes] Erreur React Query:', error);
      setSnackbar({
        open: true,
        message: 'Erreur lors du chargement des brouillons',
        severity: 'error'
      });
    }
  }, [error]);

    const processDraftsData = (response: any) => {
    try {
      console.log('[DraftQuotes] Traitement des données reçues via useQuery:', response);
      
      // Extraire les données avec la nouvelle structure API: { code: 200, message: 'Success', data: [...] }
      let draftsData = [];
      if (response?.data && Array.isArray(response.data)) {
        draftsData = response.data;
        console.log('[DraftQuotes] Extraction depuis response.data (tableau direct)');
      } else if (Array.isArray(response)) {
        draftsData = response;
        console.log('[DraftQuotes] Extraction depuis response (tableau direct)');
      } else {
        console.warn('[DraftQuotes] Structure de données non reconnue:', response);
        console.log('[DraftQuotes] Type de response.data:', typeof response?.data);
        console.log('[DraftQuotes] Contenu de response.data:', response?.data);
      }
      
      if (draftsData && Array.isArray(draftsData)) {
        console.log('[DraftQuotes] Nombre de brouillons trouvés:', draftsData.length);
        
        // Voir les statuts de tous les éléments
        draftsData.forEach((quote: any, index: number) => {
          console.log(`[DraftQuotes] Brouillon ${index} - Status: "${quote.status}", ID: ${quote.id}, Email: ${quote.emailUser}`);
        });
        
        const draftQuotes = draftsData
          .filter((quote: any) => {
            // 🔍 DEBUG : Voir tous les brouillons pour comprendre la structure
            console.log(`[DraftQuotes] Brouillon analysé:`, {
              id: quote.id,
              draftQuoteId: quote.draftQuoteId,
              hasId: !!quote.id,
              hasDraftQuoteId: !!quote.draftQuoteId,
              idType: typeof quote.id,
              draftQuoteIdType: typeof quote.draftQuoteId,
              fullQuote: quote
            });
            
            // ✅ Utiliser draftQuoteId (ID MongoDB) au lieu de id
            const mongoId = quote.draftQuoteId || quote.id;
            if (!mongoId) {
              console.warn(`[DraftQuotes] Brouillon sans ID MongoDB - ignoré:`, quote);
              return false;
            }
            return true;
          })
          .map((quote: any, index: number) => {
            // Log pour déboguer la structure des données
            console.log(`[DraftQuotes] Brouillon ${index} - Structure complète:`, {
              id: quote.id,
              quoteOfferNumber: quote.quoteOfferNumber,
              requestQuoteId: quote.requestQuoteId,
              clientNumber: quote.clientNumber,
              emailUser: quote.emailUser,
              status: quote.status,
              created: quote.created,
              assignedTo: quote.assignedTo,
              lastModified: quote.lastModified,
              draftData: quote.draftData
            });
            
            // Extraire les données sauvegardées depuis draftData
            const draftData = quote.draftData || {};
            
            // Créer un objet temporaire pour le calcul de progression
            const quoteForCalculation = {
              ...quote,
              step1: draftData.step1 || {},
              step2: draftData.step2 || {},
              step3: draftData.step3 || {},
              step4: draftData.step4 || {},
              step5: draftData.step5 || {},
              step6: draftData.step6 || {},
              selectedHaulage: draftData.selectedHaulage || null,
              selectedSeafreights: draftData.selectedSeafreights || [],
              selectedMiscellaneous: draftData.selectedMiscellaneous || [],
              savedOptions: quote.savedOptions || []
            };
            
            // Utiliser la progression persistée depuis l'API (WizardData) si disponible
            const wizardData = draftData.wizard || {};
            const persistedCurrentStep = wizardData.currentStep;
            const persistedCompletedSteps = wizardData.completedSteps;
            
            // Calculer la progression comme fallback si pas persistée
            const progressInfo = calculateProgress(quoteForCalculation);
            
            // Priorité : données persistées depuis wizard > calcul frontend
            const finalCurrentStep = persistedCurrentStep !== undefined ? persistedCurrentStep : progressInfo.currentStep;
            const finalCompletedSteps = persistedCompletedSteps && Array.isArray(persistedCompletedSteps) ? 
                                       persistedCompletedSteps.map(step => `${step}/6 Étape ${step}`) : progressInfo.completedSteps;
            const finalProgress = persistedCompletedSteps && Array.isArray(persistedCompletedSteps) ? 
                                 Math.round((persistedCompletedSteps.length / 6) * 100) : progressInfo.progress;
            
            console.log(`[DraftQuotes] Brouillon ${quote.id} - Progression:`, {
              wizardData: wizardData,
              persistedCurrentStep: persistedCurrentStep,
              persistedCompletedSteps: persistedCompletedSteps,
              calculatedProgress: progressInfo.progress,
              calculatedCurrentStep: progressInfo.currentStep,
              calculatedCompletedSteps: progressInfo.completedSteps,
              finalProgress: finalProgress,
              finalCurrentStep: finalCurrentStep,
              finalCompletedSteps: finalCompletedSteps
            });
            
            console.log(`[DraftQuotes] Brouillon ${quote.id} - Données client:`, {
              clientNumber: quote.clientNumber
            });
            
            return {
              id: quote.draftQuoteId || quote.id || `temp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`, // ✅ Utiliser draftQuoteId (ID MongoDB)
              quoteOfferNumber: quote.quoteOfferNumber || 0,
              requestQuoteId: quote.requestQuoteId,
              clientNumber: quote.clientNumber,
              emailUser: quote.emailUser,
              status: quote.status || 'DRAFT',
              created: quote.created,
              assignedTo: quote.assignedTo || '',
              lastModified: quote.lastModified,
              progress: finalProgress,
              currentStep: finalCurrentStep,
              totalSteps: 6,
              completedSteps: finalCompletedSteps,
              draftData: draftData,
              requestData: quote.requestData || {},
              step1: draftData.step1 || {},
              step2: draftData.step2 || {},
              step3: draftData.step3 || {},
              step4: draftData.step4 || {},
              step5: draftData.step5 || {},
              step6: draftData.step6 || {},
              savedOptions: quote.savedOptions || [],
              selectedHaulage: draftData.selectedHaulage || null,
              selectedSeafreights: draftData.selectedSeafreights || [],
              selectedMiscellaneous: draftData.selectedMiscellaneous || []
            };
          });
        
        console.log('[DraftQuotes] Nombre d\'éléments traités:', draftQuotes.length);
        console.log('[DraftQuotes] Brouillons traités:', draftQuotes);
        
        setDrafts(draftQuotes);
      } else {
        console.warn('[DraftQuotes] Les données reçues ne sont pas un tableau:', draftsData);
        setDrafts([]);
      }
    } catch (error) {
      console.error('Erreur lors du traitement des brouillons:', error);
      setSnackbar({ 
        open: true, 
        message: 'Erreur lors du traitement des brouillons', 
        severity: 'error' 
      });
    }
  };

  const showSnackbar = (message: string, severity: 'success' | 'error' | 'warning' | 'info') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleAssignDraft = (draft: DraftQuote) => {
    setSelectedDraft(draft);
    setAssignTo(draft.assignedTo || '');
    setAssignDialog(true);
  };

  const handleAssignSubmit = async () => {
    if (!selectedDraft || !assignTo) return;

    try {
      // TODO: L'assignation n'est pas encore supportée par l'API OptimizedUpdateWizardDraftRequest
      // Il faudra attendre que le backend ajoute le support pour assignedTo
      console.warn('[DraftQuotes] Assignation non supportée par l\'API actuelle');
      
      setAssignDialog(false);
      showSnackbar('Assignation non supportée pour le moment', 'warning');
    } catch (error) {
      console.error('Erreur lors de l\'assignation:', error);
      showSnackbar('Erreur lors de l\'assignation', 'error');
    }
  };

  const handleContinueDraft = (draft: DraftQuote) => {
    if (!draft.id) {
      console.error('[DraftQuotes] Impossible de continuer le brouillon: ID manquant');
      showSnackbar('Erreur: ID du brouillon manquant', 'error');
      return;
    }
    
    console.log('[DraftQuotes] Continuer le brouillon:', draft.id);
    console.log('[DraftQuotes] Étape actuelle:', draft.currentStep);
    console.log('[DraftQuotes] Données du draft:', draft.draftData);

    // Naviguer vers le wizard à la dernière étape enregistrée
    if (draft.currentStep && draft.currentStep > 1) {
      navigate(`/request-wizard?loadDraft=${draft.id}&step=${draft.currentStep}`);
    } else {
      navigate(`/request-wizard?loadDraft=${draft.id}`);
    }
  };



  const handleViewDraft = (draft: DraftQuote) => {
    if (!draft.id) {
      console.error('[DraftQuotes] Impossible de voir le brouillon: ID manquant');
      showSnackbar('Erreur: ID du brouillon manquant', 'error');
      return;
    }
    navigate(`/quote-offers/${draft.id}`);
  };

  const handleManageQuote = (draft: DraftQuote) => {
    if (!draft.id) {
      console.error('[DraftQuotes] Impossible de gérer le devis: ID manquant');
      showSnackbar('Erreur: ID du brouillon manquant', 'error');
      return;
    }
    
    // TODO: Récupérer l'ID du devis associé au brouillon
    // Pour l'instant, on utilise l'ID du brouillon comme placeholder
    console.log('[DraftQuotes] Gérer le devis pour le brouillon:', draft.id);
    navigate(`/quote-management/${draft.id}`);
  };

  const handleDeleteDraft = (draft: DraftQuote) => {
    setDeletingDraft(draft);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!deletingDraft) return;
    
    try {
      await deleteDraftMutation.mutateAsync({
        path: { id: deletingDraft.id }
      });
      
      // Invalider le cache pour recharger les données
      queryClient.invalidateQueries({ queryKey: ['getApiDraftQuotes'] });
      
      setDeleteDialogOpen(false);
      setDeletingDraft(null);
      showSnackbar('Brouillon supprimé avec succès', 'success');
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
      showSnackbar('Erreur lors de la suppression', 'error');
    }
  };

  const handleCancelDelete = () => {
    setDeleteDialogOpen(false);
    setDeletingDraft(null);
  };

  // Filtrer les brouillons selon le terme de recherche
  const filteredDrafts = drafts.filter(draft =>
        draft.emailUser?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    draft.requestQuoteId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        draft.assignedTo?.toLowerCase().includes(searchTerm.toLowerCase())
      );

  if (loading) {
    return (
      <Box 
        display="flex" 
        justifyContent="center" 
        alignItems="center" 
        minHeight="400px"
        flexDirection="column"
        gap={2}
      >
        <CircularProgress size={60} thickness={4} />
        <Typography variant="h6" color="text.secondary">
          Chargement des brouillons...
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* En-tête avec titre et actions */}
      <Paper 
        elevation={0} 
        sx={{ 
          p: 3, 
          mb: 3, 
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          borderRadius: 2
        }}
      >
        <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Box>
            <Typography variant="h4" fontWeight="bold" gutterBottom>
              📝 Brouillons de Devis
                </Typography>
            <Typography variant="body1" sx={{ opacity: 0.9 }}>
              Gérez vos brouillons en cours de création
                </Typography>
              </Box>
          <Stack direction="row" spacing={1}>
                <Button
              variant="contained"
                  startIcon={<Refresh />}
              onClick={() => loadDrafts()}
              sx={{ 
                bgcolor: 'rgba(255,255,255,0.2)', 
                '&:hover': { bgcolor: 'rgba(255,255,255,0.3)' }
              }}
                >
                  Actualiser
                </Button>
              </Stack>
        </Stack>
      </Paper>

      {/* Barre de recherche et filtres */}
      <Paper elevation={1} sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={6}>
              <TextField
                fullWidth
              placeholder="Rechercher par email, ID de demande ou assigné à..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search />
                    </InputAdornment>
                  ),
                }}
              />
          </Grid>
          <Grid item xs={12} md={6}>
            <Stack direction="row" spacing={2} justifyContent="flex-end">
              <Button
                variant={viewMode === 'card' ? 'contained' : 'outlined'}
                onClick={() => setViewMode('card')}
                startIcon={<Dashboard />}
              >
                Vue Cartes
              </Button>
              <Button
                variant={viewMode === 'table' ? 'contained' : 'outlined'}
                onClick={() => setViewMode('table')}
                startIcon={<Timeline />}
              >
                Vue Tableau
              </Button>
            </Stack>
          </Grid>
        </Grid>
          </Paper>

      {/* Affichage des statistiques */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ p: 2, textAlign: 'center' }}>
            <Avatar sx={{ bgcolor: 'primary.main', mx: 'auto', mb: 1 }}>
              <Assignment />
            </Avatar>
            <Typography variant="h4" fontWeight="bold">
              {drafts.length}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Total Brouillons
            </Typography>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ p: 2, textAlign: 'center' }}>
            <Avatar sx={{ bgcolor: 'warning.main', mx: 'auto', mb: 1 }}>
              <Schedule />
            </Avatar>
            <Typography variant="h4" fontWeight="bold">
              {drafts.filter(d => !d.assignedTo).length}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Non Assignés
            </Typography>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ p: 2, textAlign: 'center' }}>
            <Avatar sx={{ bgcolor: 'success.main', mx: 'auto', mb: 1 }}>
              <TrendingUp />
            </Avatar>
            <Typography variant="h4" fontWeight="bold">
              {Math.round(drafts.reduce((acc, d) => acc + (d.progress || 0), 0) / drafts.length) || 0}%
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Progression Moyenne
            </Typography>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ p: 2, textAlign: 'center' }}>
            <Avatar sx={{ bgcolor: 'info.main', mx: 'auto', mb: 1 }}>
              <Assessment />
            </Avatar>
            <Typography variant="h4" fontWeight="bold">
              {drafts.filter(d => (d.progress || 0) > 80).length}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Presque Terminés
            </Typography>
          </Card>
        </Grid>
      </Grid>

      {/* Contenu principal */}
      {filteredDrafts.length === 0 ? (
        <Paper 
          elevation={1} 
          sx={{ 
            p: 4, 
            textAlign: 'center',
            borderRadius: 2
          }}
        >
          <Avatar sx={{ bgcolor: 'grey.100', mx: 'auto', mb: 2, width: 80, height: 80 }}>
            <Assignment sx={{ fontSize: 40, color: 'grey.400' }} />
          </Avatar>
          <Typography variant="h6" gutterBottom>
            Aucun brouillon trouvé
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {searchTerm ? 
              'Aucun brouillon ne correspond à votre recherche.' : 
              'Aucun brouillon trouvé. Les brouillons sont créés automatiquement lors de l\'utilisation du wizard de demande de devis.'
            }
          </Typography>
        </Paper>
      ) : (
        <>
          {viewMode === 'card' ? (
            // Vue en cartes
                <Grid container spacing={3}>
                  {filteredDrafts.map((draft) => (
                <Grid item xs={12} sm={6} md={4} key={draft.id}>
                  <Fade in={true} timeout={300}>
                      <Card 
                      elevation={2}
                        sx={{ 
                        borderRadius: 2,
                          transition: 'all 0.3s ease',
                          '&:hover': {
                            transform: 'translateY(-4px)',
                          boxShadow: 4
                        }
                      }}
                    >
                      <CardContent>
                        {/* En-tête de la carte */}
                        <Stack direction="row" justifyContent="space-between" alignItems="flex-start" sx={{ mb: 2 }}>
                          <Box>
                            <Typography variant="h6" fontWeight="bold">
                              Brouillon #{draft.quoteOfferNumber || 'N/A'}
                      </Typography>
                            <Typography variant="body2" color="text.secondary">
                              ID: {draft.id ? draft.id.substring(0, 8) + '...' : 'N/A'}
                            </Typography>
                          </Box>
                            <Chip 
                            label={draft.status}
                            color="warning"
                              size="small"
                          />
                        </Stack>

                        {/* Informations principales */}
                        <Stack spacing={1} sx={{ mb: 2 }}>
                          {/* Nom du client */}
                          {draft.clientNumber && (
                            <Box display="flex" alignItems="center" gap={1}>
                              <Business fontSize="small" color="action" />
                              <Typography variant="body2" sx={{ fontWeight: 500, color: '#2c3e50' }}>
                                {draft.clientNumber}
                              </Typography>
                            </Box>
                          )}
                          
                          {/* Email utilisateur */}
                          <Box display="flex" alignItems="center" gap={1}>
                            <Person fontSize="small" color="action" />
                            <Typography variant="body2">
                              {draft.emailUser || 'Email non défini'}
                            </Typography>
                          </Box>
                          
                          {/* Assigné à */}
                          {draft.assignedTo && (
                            <Box display="flex" alignItems="center" gap={1}>
                              <Assignment fontSize="small" color="action" />
                              <Typography variant="body2">
                                Assigné à: {draft.assignedTo}
                              </Typography>
                            </Box>
                          )}
                          
                          {/* Date de création */}
                          <Box display="flex" alignItems="center" gap={1}>
                            <Schedule fontSize="small" color="action" />
                            <Typography variant="body2">
                              {formatDate(draft.created)}
                            </Typography>
                          </Box>
                        </Stack>

                        {/* Progression */}
                          <Box sx={{ mb: 2 }}>
                          <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
                            <Typography variant="body2" fontWeight="medium">
                                Progression
                        </Typography>
                            <Typography variant="body2" color="primary" fontWeight="bold">
                              {draft.progress || 0}%
                        </Typography>
                          </Stack>
                          <LinearProgress 
                            variant="determinate" 
                            value={draft.progress || 0}
                            sx={{ 
                              borderRadius: 1, 
                              height: 8,
                              backgroundColor: '#f0f0f0',
                              '& .MuiLinearProgress-bar': {
                                backgroundColor: (draft.progress || 0) >= 100 ? '#4caf50' : 
                                               (draft.progress || 0) >= 80 ? '#2196f3' :
                                               (draft.progress || 0) >= 50 ? '#ff9800' : '#f44336'
                              }
                            }}
                          />
                          <Box sx={{ mt: 1 }}>
                            <Typography variant="caption" color="text.secondary">
                              Étape actuelle: {draft.currentStep}/{draft.totalSteps}
                            </Typography>
                            {draft.completedSteps && draft.completedSteps.length > 0 && (
                              <Box sx={{ mt: 0.5 }}>
                                <Typography variant="caption" color="success.main" fontWeight="medium">
                                  ✓ Étapes complétées:
                                </Typography>
                                <Box sx={{ mt: 0.5, display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                  {draft.completedSteps.slice(0, 3).map((step, index) => (
                                    <Chip
                                      key={index}
                                      label={step}
                                      size="small"
                                      color="success"
                                      variant="outlined"
                                      sx={{ fontSize: '0.7rem', height: 20 }}
                                    />
                                  ))}
                                  {draft.completedSteps.length > 3 && (
                                    <Chip
                                      label={`+${draft.completedSteps.length - 3}`}
                                      size="small"
                                      color="primary"
                                      variant="outlined"
                                      sx={{ fontSize: '0.7rem', height: 20 }}
                                    />
                                  )}
                                </Box>
                              </Box>
                            )}
                          </Box>
                          </Box>

                        {/* Actions */}
                        <Stack direction="row" spacing={1}>
                          <Button
                              size="small"
                            variant="contained"
                              onClick={() => handleContinueDraft(draft)}
                            startIcon={<PlayArrow />}
                          >
                            Continuer
                          </Button>
                          <Tooltip title="Voir les détails">
                            <IconButton
                              size="small"
                              onClick={() => handleViewDraft(draft)}
                            >
                              <Visibility />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Gérer le devis">
                            <IconButton
                              size="small"
                              onClick={() => handleManageQuote(draft)}
                            >
                              <ManageIcon />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Assigner">
                            <IconButton
                              size="small"
                              onClick={() => handleAssignDraft(draft)}
                            >
                              <Person />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Supprimer">
                            <IconButton
                              size="small"
                              color="error"
                              onClick={() => handleDeleteDraft(draft)}
                            >
                              <Delete />
                            </IconButton>
                          </Tooltip>
                        </Stack>
                      </CardContent>
                      </Card>
                  </Fade>
                    </Grid>
                  ))}
                </Grid>
          ) : (
            // Vue en tableau (DataGrid)
            <Paper elevation={1} sx={{ borderRadius: 2 }}>
              <DataGrid
                rows={filteredDrafts}
                columns={[
                  {
                    field: 'quoteOfferNumber',
                    headerName: 'Numéro',
                    width: 100,
                    renderCell: (params: GridRenderCellParams) => (
                      <Typography variant="body2" fontWeight="medium">
                        #{params.value || 'N/A'}
                      </Typography>
                    )
                  },
                  {
                    field: 'emailUser',
                    headerName: 'Utilisateur',
                    width: 200,
                    renderCell: (params: GridRenderCellParams) => (
                      <Box display="flex" alignItems="center" gap={1}>
                        <Avatar sx={{ width: 24, height: 24, fontSize: 12 }}>
                          {params.value?.charAt(0)?.toUpperCase() || 'U'}
                        </Avatar>
                        <Typography variant="body2">
                          {params.value || 'Non défini'}
                        </Typography>
                      </Box>
                    )
                  },
                  {
                    field: 'clientNumber',
                    headerName: 'Client',
                    width: 200,
                    renderCell: (params: GridRenderCellParams) => {
                      const clientName = params.value;
                      
                      return clientName ? (
                        <Box display="flex" alignItems="center" gap={1}>
                          <Business fontSize="small" color="action" />
                          <Typography variant="body2" sx={{ fontWeight: 500 }}>
                            {clientName}
                          </Typography>
                        </Box>
                      ) : (
                        <Typography variant="body2" color="text.secondary">
                          Non défini
                        </Typography>
                      );
                    }
                  },
                  {
                    field: 'status',
                    headerName: 'Statut',
                    width: 120,
                    renderCell: (params: GridRenderCellParams) => (
                          <Chip
                        label={params.value}
                        color="warning"
                        size="small"
                      />
                    )
                  },
                  {
                    field: 'progress',
                    headerName: 'Progression',
                    width: 200,
                    renderCell: (params: GridRenderCellParams) => (
                      <Box sx={{ width: '100%' }}>
                        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 0.5 }}>
                          <Typography variant="caption" fontWeight="medium">
                            Étape {params.row.currentStep}/{params.row.totalSteps}
                          </Typography>
                          <Typography variant="caption" color="primary" fontWeight="bold">
                            {params.value || 0}%
                          </Typography>
                        </Stack>
                        <LinearProgress 
                          variant="determinate" 
                          value={params.value || 0}
                          sx={{ 
                            borderRadius: 1, 
                            height: 6,
                            backgroundColor: '#f0f0f0',
                            '& .MuiLinearProgress-bar': {
                              backgroundColor: params.value >= 100 ? '#4caf50' : 
                                             params.value >= 80 ? '#2196f3' :
                                             params.value >= 50 ? '#ff9800' : '#f44336'
                            }
                          }}
                        />
                        {params.row.completedSteps && params.row.completedSteps.length > 0 && (
                          <Typography variant="caption" color="success.main" sx={{ fontSize: '0.7rem' }}>
                            ✓ {params.row.completedSteps.length} étape{params.row.completedSteps.length > 1 ? 's' : ''} complétée{params.row.completedSteps.length > 1 ? 's' : ''}
                          </Typography>
                        )}
                      </Box>
                    )
                  },
                  {
                    field: 'completedSteps',
                    headerName: 'Étapes complétées',
                    width: 180,
                    renderCell: (params: GridRenderCellParams) => (
                      <Box sx={{ width: '100%' }}>
                        {params.value && params.value.length > 0 ? (
                          <Stack spacing={0.5}>
                            {params.value.slice(0, 2).map((step: string, index: number) => (
                              <Chip
                                key={index}
                                label={step}
                                size="small"
                                color="success"
                                variant="outlined"
                                sx={{ fontSize: '0.7rem', height: 18 }}
                              />
                            ))}
                            {params.value.length > 2 && (
                              <Typography variant="caption" color="text.secondary">
                                +{params.value.length - 2} autres...
                              </Typography>
                            )}
                          </Stack>
                        ) : (
                          <Typography variant="body2" color="text.secondary">
                            Aucune étape complétée
                          </Typography>
                        )}
                      </Box>
                    )
                  },
                  {
                    field: 'assignedTo',
                    headerName: 'Assigné à',
                    width: 130,
                    renderCell: (params: GridRenderCellParams) => (
                      params.value ? (
                        <Chip 
                          label={params.value}
                            size="small"
                            color="primary"
                          />
                      ) : (
                          <Typography variant="body2" color="text.secondary">
                          Non assigné
                          </Typography>
                      )
                    )
                  },
                  {
                    field: 'created',
                    headerName: 'Créé le',
                    width: 130,
                    renderCell: (params: GridRenderCellParams) => (
                            <Typography variant="body2">
                        {formatDate(params.value)}
                            </Typography>
                    )
                  },
                  {
                    field: 'actions',
                    headerName: 'Actions',
                    width: 200,
                    sortable: false,
                    renderCell: (params: GridRenderCellParams) => (
                      <Stack direction="row" spacing={0.5}>
                        <Tooltip title="Continuer">
                          <IconButton
                            size="small"
                            onClick={() => handleContinueDraft(params.row)}
                          >
                            <PlayArrow />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Voir">
                          <IconButton
                            size="small"
                            onClick={() => handleViewDraft(params.row)}
                          >
                            <Visibility />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Gérer le devis">
                          <IconButton
                            size="small"
                            onClick={() => handleManageQuote(params.row)}
                          >
                            <ManageIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Assigner">
                          <IconButton
                            size="small"
                            onClick={() => handleAssignDraft(params.row)}
                          >
                            <Person />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Supprimer">
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => handleDeleteDraft(params.row)}
                          >
                            <Delete />
                          </IconButton>
                        </Tooltip>
                      </Stack>
                    )
                  }
                ]}
                autoHeight
                disableRowSelectionOnClick
                pageSizeOptions={[10, 25, 50]}
                initialState={{
                  pagination: { paginationModel: { pageSize: 10 } }
                }}
                sx={{
                  border: 0,
                  '& .MuiDataGrid-cell': {
                    borderBottom: '1px solid #f0f0f0'
                  }
                }}
              />
          </Paper>
          )}
        </>
      )}

      {/* Dialog d'assignation */}
      <Dialog open={assignDialog} onClose={() => setAssignDialog(false)}>
        <DialogTitle>Assigner le brouillon</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Assigner à"
            fullWidth
            variant="outlined"
            value={assignTo}
            onChange={(e) => setAssignTo(e.target.value)}
            placeholder="Entrez l'email de l'utilisateur"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAssignDialog(false)}>Annuler</Button>
          <Button onClick={handleAssignSubmit} variant="contained">
            Assigner
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog de confirmation de suppression */}
      <Dialog open={deleteDialogOpen} onClose={handleCancelDelete}>
        <DialogTitle>Confirmer la suppression</DialogTitle>
        <DialogContent>
          <Typography>
            Êtes-vous sûr de vouloir supprimer ce brouillon ? Cette action est irréversible.
                </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancelDelete}>Annuler</Button>
          <Button onClick={handleConfirmDelete} color="error" variant="contained">
            Supprimer
          </Button>
        </DialogActions>
      </Dialog>



      {/* Snackbar pour les notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert 
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          variant="filled"
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default DraftQuotes; 
