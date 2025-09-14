import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Grid,
  Chip,
  IconButton,
  Tooltip,
  Divider,
  Alert
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Compare as CompareIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';

interface Option {
  id: string;
  name?: string;
  description?: string;
  status?: string;
  totalPrice?: number;
  currency?: string;
  createdAt?: string;
  isSelected?: boolean;
}

interface OptionManagementPanelProps {
  options: Option[];
  editingOptionIndex: number | null;
  isLoadingOptions: boolean;
  optionsError: string | null;
  onNewOption: () => void;
  onLoadOption: (index: number) => void;
  onDeleteOption: (index: number) => void;
  onValidateOption: (index: number) => void;
  onCompareOptions: (indices: number[]) => void;
  onEditOption?: (index: number) => void;
  onPreviewOption?: (index: number) => void;
  onSendOption?: (index: number) => void;
  showActions?: boolean;
  maxOptions?: number;
}

export const OptionManagementPanel: React.FC<OptionManagementPanelProps> = ({
  options,
  editingOptionIndex,
  isLoadingOptions,
  optionsError,
  onNewOption,
  onLoadOption,
  onDeleteOption,
  onValidateOption,
  onCompareOptions,
  onEditOption,
  onPreviewOption,
  onSendOption,
  showActions = true,
  maxOptions = 5
}) => {
  const { t } = useTranslation();

  const selectedOptions = options.filter(option => option.isSelected);
  const canCompare = selectedOptions.length >= 2;

  const handleCompareSelected = () => {
    const selectedIndices = options
      .map((option, index) => option.isSelected ? index : -1)
      .filter(index => index !== -1);
    
    if (selectedIndices.length >= 2) {
      onCompareOptions(selectedIndices);
    }
  };

  const formatPrice = (price?: number, currency?: string) => {
    if (price === undefined || price === null) return 'N/A';
    
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: currency || 'EUR',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(price);
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    
    try {
      return new Date(dateString).toLocaleDateString('fr-FR');
    } catch {
      return 'N/A';
    }
  };

  const getStatusColor = (status?: string) => {
    switch (status?.toLowerCase()) {
      case 'validated':
      case 'approved':
        return 'success';
      case 'pending':
      case 'draft':
        return 'warning';
      case 'rejected':
      case 'cancelled':
        return 'error';
      default:
        return 'default';
    }
  };

  if (isLoadingOptions) {
    return (
      <Card>
        <CardContent>
          <Typography variant="body2" color="text.secondary">
            {t('options.loading')}
          </Typography>
        </CardContent>
      </Card>
    );
  }

  if (optionsError) {
    return (
      <Alert severity="error" sx={{ mb: 2 }}>
        {optionsError}
      </Alert>
    );
  }

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6" component="h2">
          {t('options.title')} ({options.length})
        </Typography>
        
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            variant="outlined"
            startIcon={<CompareIcon />}
            onClick={handleCompareSelected}
            disabled={!canCompare}
            size="small"
          >
            {t('options.compare')}
          </Button>
          
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={onNewOption}
            disabled={options.length >= maxOptions}
            size="small"
          >
            {t('options.new')}
          </Button>
        </Box>
      </Box>

      {/* Options List */}
      {options.length === 0 ? (
        <Card>
          <CardContent sx={{ textAlign: 'center', py: 4 }}>
            <Typography variant="body2" color="text.secondary">
              {t('options.noOptions')}
            </Typography>
            <Button
              variant="outlined"
              startIcon={<AddIcon />}
              onClick={onNewOption}
              sx={{ mt: 2 }}
            >
              {t('options.createFirst')}
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Grid container spacing={2}>
          {options.map((option, index) => (
            <Grid item xs={12} md={6} lg={4} key={option.id}>
              <Card 
                sx={{ 
                  height: '100%',
                  border: editingOptionIndex === index ? '2px solid' : '1px solid',
                  borderColor: editingOptionIndex === index ? 'primary.main' : 'divider',
                  position: 'relative'
                }}
              >
                {/* Status Badge */}
                {option.status && (
                  <Chip
                    label={option.status}
                    color={getStatusColor(option.status) as any}
                    size="small"
                    sx={{
                      position: 'absolute',
                      top: 8,
                      right: 8,
                      zIndex: 1
                    }}
                  />
                )}

                {/* Selected Indicator */}
                {option.isSelected && (
                  <CheckCircleIcon
                    color="primary"
                    sx={{
                      position: 'absolute',
                      top: 8,
                      left: 8,
                      zIndex: 1
                    }}
                  />
                )}

                <CardContent sx={{ pt: 4 }}>
                  {/* Option Name */}
                  <Typography variant="h6" component="h3" gutterBottom>
                    {option.name || `Option ${index + 1}`}
                  </Typography>

                  {/* Description */}
                  {option.description && (
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      {option.description}
                    </Typography>
                  )}

                  {/* Price */}
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="body2" color="text.secondary">
                      {t('options.price')}:
                    </Typography>
                    <Typography variant="h6" color="primary">
                      {formatPrice(option.totalPrice, option.currency)}
                    </Typography>
                  </Box>

                  {/* Created Date */}
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="body2" color="text.secondary">
                      {t('options.created')}:
                    </Typography>
                    <Typography variant="body2">
                      {formatDate(option.createdAt)}
                    </Typography>
                  </Box>

                  <Divider sx={{ my: 2 }} />

                  {/* Actions */}
                  {showActions && (
                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                      <Button
                        size="small"
                        variant="outlined"
                        onClick={() => onLoadOption(index)}
                        disabled={editingOptionIndex === index}
                        fullWidth
                      >
                        {t('options.load')}
                      </Button>

                      {onEditOption && (
                        <Button
                          size="small"
                          variant="outlined"
                          onClick={() => onEditOption(index)}
                          startIcon={<EditIcon />}
                        >
                          {t('options.edit')}
                        </Button>
                      )}

                      {onPreviewOption && (
                        <Button
                          size="small"
                          variant="outlined"
                          onClick={() => onPreviewOption(index)}
                        >
                          {t('options.preview')}
                        </Button>
                      )}

                      {onSendOption && (
                        <Button
                          size="small"
                          variant="outlined"
                          onClick={() => onSendOption(index)}
                        >
                          {t('options.send')}
                        </Button>
                      )}

                      <Button
                        size="small"
                        variant="outlined"
                        color="success"
                        onClick={() => onValidateOption(index)}
                        startIcon={<CheckCircleIcon />}
                      >
                        {t('options.validate')}
                      </Button>

                      <Button
                        size="small"
                        variant="outlined"
                        color="error"
                        onClick={() => onDeleteOption(index)}
                        startIcon={<DeleteIcon />}
                      >
                        {t('options.delete')}
                      </Button>
                    </Box>
                  )}
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Max Options Warning */}
      {options.length >= maxOptions && (
        <Alert severity="warning" sx={{ mt: 2 }}>
          {t('options.maxReached', { max: maxOptions })}
        </Alert>
      )}
    </Box>
  );
};
