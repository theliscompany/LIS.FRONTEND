import React from 'react';
import { Box, Typography, Button, Paper, Alert } from '@mui/material';
import { useDraftCRUD, useDrafts } from '../hooks/useDraftCRUD';

// === COMPOSANT DE DÉMONSTRATION DU WIZARD REFACTORISÉ ===

export const DraftWizardDemo: React.FC = () => {
  const { createDraft, updateDraft, deleteDraft, isCreating, isUpdating, isDeleting } = useDraftCRUD();
  const { data: drafts, isLoading: isLoadingDrafts } = useDrafts();

  // === DONNÉES DE TEST ===
  const testDraftData = {
    customerId: 1,
    pickupLocation: {
      city: 'Paris',
      country: 'France',
      addressLine: '123 Rue de la Paix',
      postalCode: '75001'
    },
    deliveryLocation: {
      city: 'Londres',
      country: 'Royaume-Uni',
      addressLine: '456 Oxford Street',
      postalCode: 'W1C 1AP'
    },
    cargoType: 'Container',
    quantity: 2,
    details: 'Brouillon de démonstration',
    tags: 'demo,test',
    packingType: 'Container',
    assigneeId: 'user@example.com',
    productId: 1,
    productName: 'Produit Test',
    pickupDate: new Date(),
    deliveryDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // +7 jours
    goodsDescription: 'Produit de démonstration pour test',
    numberOfUnits: 2,
    totalWeightKg: 1000,
    totalDimensions: '20x10x10',
    isDangerousGoods: false,
    requiresTemperatureControl: false,
    isFragileOrHighValue: false,
    requiresSpecialHandling: false,
    specialInstructions: 'Instructions spéciales de test',
    preferredTransportMode: 1,
    additionalComments: 'Commentaire de test pour le brouillon',
    incoterm: 'FOB'
  };

  // === HANDLERS ===
  const handleCreateTestDraft = async () => {
    try {
      const result = await createDraft(testDraftData);
      // Brouillon créé avec succès
    } catch (error) {
      console.error('❌ Erreur création:', error);
    }
  };

  const handleUpdateTestDraft = async (draftId: string) => {
    try {
      const updateData = {
        ...testDraftData,
        additionalComments: 'Brouillon mis à jour - ' + new Date().toLocaleString()
      };
      const result = await updateDraft(draftId, updateData);
      // Brouillon mis à jour avec succès
    } catch (error) {
      console.error('❌ Erreur mise à jour:', error);
    }
  };

  const handleDeleteTestDraft = async (draftId: string) => {
    try {
      const result = await deleteDraft(draftId);
      // Brouillon supprimé avec succès
    } catch (error) {
      console.error('❌ Erreur suppression:', error);
    }
  };

  // === RENDER ===
  return (
    <Box sx={{ p: 3, maxWidth: 1200, mx: 'auto' }}>
      <Typography variant="h4" gutterBottom>
        🧪 Démonstration du Wizard Refactorisé
      </Typography>
      
      <Alert severity="info" sx={{ mb: 3 }}>
        Ce composant démontre l'utilisation des nouveaux hooks React Query pour la gestion des brouillons.
      </Alert>

      {/* === ACTIONS DE TEST === */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Actions de Test
        </Typography>
        
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <Button
            variant="contained"
            onClick={handleCreateTestDraft}
            disabled={isCreating}
            color="primary"
          >
            {isCreating ? 'Création...' : 'Créer un Brouillon Test'}
          </Button>
          
          <Button
            variant="outlined"
            onClick={() => window.location.reload()}
            color="secondary"
          >
            Actualiser la Liste
          </Button>
        </Box>
      </Paper>

      {/* === LISTE DES BROUILLONS === */}
      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          Liste des Brouillons ({isLoadingDrafts ? 'Chargement...' : drafts?.length || 0})
        </Typography>

        {isLoadingDrafts ? (
          <Typography>Chargement des brouillons...</Typography>
        ) : drafts && drafts.length > 0 ? (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {drafts.map((draft: any, index: number) => (
              <Paper key={draft.id || index} sx={{ p: 2, border: 1, borderColor: 'grey.200' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Box>
                    <Typography variant="subtitle1">
                      Brouillon #{draft.id || 'N/A'}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Client: {draft.clientNumber || 'N/A'} | 
                      Email: {draft.emailUser || 'N/A'}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Commentaire: {draft.comment || 'Aucun commentaire'}
                    </Typography>
                  </Box>
                  
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Button
                      size="small"
                      variant="outlined"
                      onClick={() => handleUpdateTestDraft(draft.id)}
                      disabled={isUpdating}
                    >
                      {isUpdating ? 'Mise à jour...' : 'Modifier'}
                    </Button>
                    
                    <Button
                      size="small"
                      variant="outlined"
                      color="error"
                      onClick={() => handleDeleteTestDraft(draft.id)}
                      disabled={isDeleting}
                    >
                      {isDeleting ? 'Suppression...' : 'Supprimer'}
                    </Button>
                  </Box>
                </Box>
              </Paper>
            ))}
          </Box>
        ) : (
          <Alert severity="info">
            Aucun brouillon trouvé. Créez-en un pour commencer !
          </Alert>
        )}
      </Paper>

      {/* === INFORMATIONS TECHNIQUES === */}
      <Paper sx={{ p: 3, mt: 3, bgcolor: 'grey.50' }}>
        <Typography variant="h6" gutterBottom>
          Informations Techniques
        </Typography>
        
        <Typography variant="body2" paragraph>
          <strong>Hooks utilisés :</strong>
        </Typography>
        
        <Box component="ul" sx={{ pl: 3 }}>
          <li><code>useDraftCRUD</code> - Opérations CRUD avec React Query</li>
          <li><code>useDrafts</code> - Récupération de la liste des brouillons</li>
          <li><code>useWizardDraftState</code> - État du wizard avec persistance automatique</li>
        </Box>
        
        <Typography variant="body2" paragraph>
          <strong>Endpoints API :</strong>
        </Typography>
        
        <Box component="ul" sx={{ pl: 3 }}>
          <li><code>POST /api/QuoteOffer/draft</code> - Création</li>
          <li><code>PUT /api/QuoteOffer/draft/{id}</code> - Mise à jour</li>
          <li><code>GET /api/QuoteOffer/draft/{id}</code> - Récupération</li>
          <li><code>DELETE /api/QuoteOffer/draft/{id}</code> - Suppression</li>
          <li><code>GET /api/QuoteOffer/drafts</code> - Liste</li>
        </Box>
        
        <Typography variant="body2" paragraph>
          <strong>Fonctionnalités :</strong>
        </Typography>
        
        <Box component="ul" sx={{ pl: 3 }}>
          <li>✅ Persistance automatique avec délai de 2 secondes</li>
          <li>✅ Gestion des états de chargement</li>
          <li>✅ Invalidation automatique du cache</li>
          <li>✅ Notifications de succès/erreur</li>
          <li>✅ Transformation automatique des données</li>
        </Box>
      </Paper>
    </Box>
  );
};
