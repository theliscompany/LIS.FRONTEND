import React, { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Button,
  Grid,
  Alert,
  Card,
  CardContent,
  CardHeader,
  Stack,
  Chip
} from '@mui/material';
import {
  Add as AddIcon,
  ViewList as ViewListIcon,
  Compare as CompareIcon
} from '@mui/icons-material';
import {
  useQuoteOptionsManager,
  QuoteOptionsList,
  QuoteOptionEditor,
  QuoteOptionsComparison,
  type QuoteOption
} from '../components';

interface QuoteOptionsExampleProps {
  quoteId?: string;
  draftId?: string;
  title?: string;
}

const QuoteOptionsExample: React.FC<QuoteOptionsExampleProps> = ({
  quoteId,
  draftId,
  title = "Gestion des Options de Devis"
}) => {
  const [showEditor, setShowEditor] = useState(false);
  const [showComparison, setShowComparison] = useState(false);
  const [editingOption, setEditingOption] = useState<QuoteOption | null>(null);
  const [viewMode, setViewMode] = useState<'list' | 'cards'>('cards');

  const {
    quote,
    options,
    selectedOptionId,
    isLoadingQuote,
    isGeneratingOption,
    isAddingOption,
    quoteError,
    generateOption,
    addOption,
    selectOption,
    refreshOptions
  } = useQuoteOptionsManager({
    quoteId,
    draftId,
    onOptionGenerated: (optionId) => {
      console.log('✅ Option générée:', optionId);
      setShowEditor(false);
    },
    onOptionSelected: (optionId) => {
      console.log('⭐ Option sélectionnée:', optionId);
    }
  });

  const handleCreateOption = () => {
    setEditingOption(null);
    setShowEditor(true);
  };

  const handleEditOption = (option: QuoteOption) => {
    setEditingOption(option);
    setShowEditor(true);
  };

  const handleViewOption = (option: QuoteOption) => {
    console.log('👁️ Visualiser l\'option:', option);
    // TODO: Implémenter la visualisation détaillée
  };

  const handleCompareOptions = (options: QuoteOption[]) => {
    setShowComparison(true);
  };

  const handleSaveOption = async (optionData: any) => {
    try {
      let result;
      
      if (editingOption) {
        // Mode édition
        result = await addOption(optionData);
      } else {
        // Mode création
        if (draftId) {
          result = await generateOption(optionData);
        } else if (quoteId) {
          result = await addOption(optionData);
        } else {
          throw new Error('Aucun ID de devis ou de brouillon disponible');
        }
      }

      if (result.success) {
        setShowEditor(false);
        setEditingOption(null);
        refreshOptions();
      }
    } catch (error) {
      console.error('❌ Erreur lors de la sauvegarde:', error);
    }
  };

  const handleSelectOption = async (optionId: string) => {
    try {
      const result = await selectOption(optionId, 'Sélection manuelle');
      if (result.success) {
        refreshOptions();
      }
    } catch (error) {
      console.error('❌ Erreur lors de la sélection:', error);
    }
  };

  if (isLoadingQuote) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <Typography>Chargement des options...</Typography>
      </Box>
    );
  }

  if (quoteError) {
    return (
      <Alert severity="error">
        Erreur lors du chargement: {quoteError}
      </Alert>
    );
  }

  return (
    <Box>
      {/* En-tête */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h4" fontWeight="bold">
            {title}
          </Typography>
          <Stack direction="row" spacing={2}>
            <Button
              variant="outlined"
              startIcon={<CompareIcon />}
              onClick={() => setShowComparison(true)}
              disabled={options.length < 2}
            >
              Comparer ({options.length})
            </Button>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleCreateOption}
              disabled={isGeneratingOption || isAddingOption}
            >
              {isGeneratingOption || isAddingOption ? 'Création...' : 'Nouvelle option'}
            </Button>
          </Stack>
        </Box>

        {/* Statistiques */}
        <Grid container spacing={2}>
          <Grid item xs={12} sm={3}>
            <Card variant="outlined">
              <CardContent>
                <Typography variant="h6" color="primary">
                  {options.length}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Options disponibles
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={3}>
            <Card variant="outlined">
              <CardContent>
                <Typography variant="h6" color="success.main">
                  {options.filter(opt => selectedOptionId === opt.optionId).length}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Option sélectionnée
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={3}>
            <Card variant="outlined">
              <CardContent>
                <Typography variant="h6" color="info.main">
                  {quote?.status || 'N/A'}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Statut du devis
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={3}>
            <Card variant="outlined">
              <CardContent>
                <Typography variant="h6" color="warning.main">
                  {options.length > 0 ? 
                    new Intl.NumberFormat('fr-FR', {
                      style: 'currency',
                      currency: 'EUR'
                    }).format(
                      options.reduce((min, opt) => 
                        Math.min(min, opt.totals?.grandTotal || 0), 
                        Infinity
                      )
                    ) : 'N/A'
                  }
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Prix minimum
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Paper>

      {/* Liste des options */}
      <QuoteOptionsList
        quoteId={quoteId}
        draftId={draftId}
        onOptionSelect={handleSelectOption}
        onOptionEdit={handleEditOption}
        onOptionView={handleViewOption}
        onOptionAdd={handleCreateOption}
        onOptionCompare={handleCompareOptions}
        selectedOptionId={selectedOptionId}
        showActions={true}
      />

      {/* Éditeur d'options */}
      <QuoteOptionEditor
        open={showEditor}
        onClose={() => {
          setShowEditor(false);
          setEditingOption(null);
        }}
        onSave={handleSaveOption}
        option={editingOption}
        quoteId={quoteId}
        draftId={draftId}
        mode={editingOption ? 'edit' : 'create'}
      />

      {/* Comparaison d'options */}
      <QuoteOptionsComparison
        open={showComparison}
        onClose={() => setShowComparison(false)}
        options={options}
        selectedOptionId={selectedOptionId}
        onOptionSelect={handleSelectOption}
        onOptionEdit={handleEditOption}
        onOptionView={handleViewOption}
      />
    </Box>
  );
};

export default QuoteOptionsExample;
