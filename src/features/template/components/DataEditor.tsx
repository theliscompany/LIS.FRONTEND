import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  Alert,
  Paper,
  Chip,
  Grid,
  IconButton,
  Tooltip,
  Collapse
} from '@mui/material';
import {
  Code as CodeIcon,
  CheckCircle as ValidIcon,
  Error as ErrorIcon,
  ExpandMore as ExpandIcon,
  ExpandLess as CollapseIcon,
  ContentCopy as CopyIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';
import { extractPlaceholders, validateTemplateData } from '../utils/handlebarsHelpers';

interface DataEditorProps {
  template: any;
  sampleData: string;
  onSampleDataChange: (data: string) => void;
  onValidationChange?: (validation: {
    isValid: boolean;
    missing: string[];
    warnings: string[];
  }) => void;
}

const DataEditor: React.FC<DataEditorProps> = ({
  template,
  sampleData,
  onSampleDataChange,
  onValidationChange
}) => {
  const [isValid, setIsValid] = useState(true);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [validation, setValidation] = useState<{
    isValid: boolean;
    missing: string[];
    warnings: string[];
  }>({ isValid: true, missing: [], warnings: [] });
  const [expanded, setExpanded] = useState(false);

  // Validation JSON et template
  useEffect(() => {
    if (!template?.htmlBody) return;

    try {
      // Validation JSON
      const data = sampleData.trim() ? JSON.parse(sampleData) : {};
      setIsValid(true);
      setValidationError(null);

      // Validation des placeholders
      const templateValidation = validateTemplateData(template.htmlBody, data);
      setValidation(templateValidation);

      // Notification du parent
      onValidationChange?.(templateValidation);
    } catch (error) {
      setIsValid(false);
      setValidationError('JSON invalide');
      setValidation({ isValid: false, missing: [], warnings: [] });
      onValidationChange?.({ isValid: false, missing: [], warnings: [] });
    }
  }, [sampleData, template?.htmlBody, onValidationChange]);

  const handleDataChange = (value: string) => {
    onSampleDataChange(value);
  };

  const handleLoadExample = () => {
    const exampleData = {
      client: {
        name: "Jean Dupont",
        email: "jean.dupont@example.com",
        company: "Entreprise ABC"
      },
      order: {
        number: "CMD-2024-001",
        date: "2024-01-15",
        total: 1250.50,
        items: [
          { name: "Produit A", quantity: 2, price: 500.00 },
          { name: "Produit B", quantity: 1, price: 250.50 }
        ]
      },
      quote: {
        id: "QT-2024-001",
        validUntil: "2024-02-15",
        currency: "EUR"
      }
    };
    onSampleDataChange(JSON.stringify(exampleData, null, 2));
  };

  const handleCopyToClipboard = () => {
    navigator.clipboard.writeText(sampleData);
  };

  const handleClear = () => {
    onSampleDataChange('');
  };

  const handleFormat = () => {
    try {
      const data = JSON.parse(sampleData);
      onSampleDataChange(JSON.stringify(data, null, 2));
    } catch (error) {
      // Ignore si JSON invalide
    }
  };

  const placeholders = template?.htmlBody ? extractPlaceholders(template.htmlBody) : [];

  return (
    <Paper sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <CodeIcon />
          Éditeur de Données
        </Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Tooltip title="Charger exemple">
            <IconButton size="small" onClick={handleLoadExample}>
              <RefreshIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Formater JSON">
            <IconButton size="small" onClick={handleFormat}>
              <ValidIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Copier">
            <IconButton size="small" onClick={handleCopyToClipboard}>
              <CopyIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Effacer">
            <IconButton size="small" onClick={handleClear}>
              <ErrorIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      {/* Validation Status */}
      <Collapse in={!isValid || validation.missing.length > 0 || validation.warnings.length > 0}>
        <Box sx={{ mb: 2 }}>
          {!isValid && (
            <Alert severity="error" sx={{ mb: 1 }}>
              {validationError}
            </Alert>
          )}
          
          {validation.missing.length > 0 && (
            <Alert severity="warning" sx={{ mb: 1 }}>
              <Typography variant="subtitle2" sx={{ mb: 1 }}>
                Placeholders manquants:
              </Typography>
              <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                {validation.missing.map((placeholder, index) => (
                  <Chip
                    key={index}
                    label={placeholder}
                    size="small"
                    color="warning"
                    variant="outlined"
                  />
                ))}
              </Box>
            </Alert>
          )}

          {validation.warnings.length > 0 && (
            <Alert severity="info" sx={{ mb: 1 }}>
              <Typography variant="subtitle2" sx={{ mb: 1 }}>
                Avertissements:
              </Typography>
              <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                {validation.warnings.map((warning, index) => (
                  <Chip
                    key={index}
                    label={warning}
                    size="small"
                    color="info"
                    variant="outlined"
                  />
                ))}
              </Box>
            </Alert>
          )}
        </Box>
      </Collapse>

      {/* Placeholders Info */}
      <Box sx={{ mb: 2 }}>
        <Button
          size="small"
          onClick={() => setExpanded(!expanded)}
          startIcon={expanded ? <CollapseIcon /> : <ExpandIcon />}
        >
          Placeholders détectés ({placeholders.length})
        </Button>
        
        <Collapse in={expanded}>
          <Box sx={{ mt: 1, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
            <Grid container spacing={1}>
              {placeholders.map((placeholder, index) => (
                <Grid item key={index}>
                  <Chip
                    label={placeholder}
                    size="small"
                    variant="outlined"
                    color={validation.missing.includes(placeholder) ? "warning" : "default"}
                  />
                </Grid>
              ))}
            </Grid>
          </Box>
        </Collapse>
      </Box>

      {/* JSON Editor */}
      <TextField
        fullWidth
        multiline
        rows={12}
        label="Données JSON"
        value={sampleData}
        onChange={(e) => handleDataChange(e.target.value)}
        placeholder={`{
  "client": {
    "name": "Jean Dupont",
    "email": "jean.dupont@example.com"
  },
  "order": {
    "number": "CMD-2024-001",
    "total": 1250.50
  }
}`}
        error={!isValid}
        helperText={
          isValid 
            ? "Format JSON valide. Utilisez les placeholders détectés ci-dessus."
            : "JSON invalide"
        }
        sx={{
          '& .MuiInputBase-root': {
            fontFamily: 'monospace',
            fontSize: '0.875rem'
          }
        }}
      />

      {/* Action Buttons */}
      <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
        <Button
          variant="contained"
          onClick={handleLoadExample}
          startIcon={<RefreshIcon />}
        >
          Charger Exemple
        </Button>
        <Button
          variant="outlined"
          onClick={handleFormat}
          disabled={!isValid}
        >
          Formater
        </Button>
        <Button
          variant="outlined"
          onClick={handleClear}
        >
          Effacer
        </Button>
      </Box>
    </Paper>
  );
};

export default DataEditor;
