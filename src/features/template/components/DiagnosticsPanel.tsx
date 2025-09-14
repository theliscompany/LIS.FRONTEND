import React from 'react';
import {
  Box,
  Typography,
  Paper,
  Chip,
  Alert,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Collapse,
  IconButton,
  Tooltip
} from '@mui/material';
import {
  Warning as WarningIcon,
  Error as ErrorIcon,
  Info as InfoIcon,
  CheckCircle as SuccessIcon,
  ExpandMore as ExpandIcon,
  ExpandLess as CollapseIcon,
  ContentCopy as CopyIcon
} from '@mui/icons-material';

interface DiagnosticsPanelProps {
  diagnostics: {
    missingPlaceholders?: string[];
    warnings?: string[];
    errors?: string[];
    isValid?: boolean;
  };
  showSuccess?: boolean;
}

const DiagnosticsPanel: React.FC<DiagnosticsPanelProps> = ({
  diagnostics,
  showSuccess = true
}) => {
  const [expanded, setExpanded] = React.useState(true);
  
  const hasIssues = 
    (diagnostics.missingPlaceholders?.length ?? 0) > 0 ||
    (diagnostics.warnings?.length ?? 0) > 0 ||
    (diagnostics.errors?.length ?? 0) > 0;

  const hasSuccess = showSuccess && !hasIssues && diagnostics.isValid !== false;

  const handleCopyDiagnostics = () => {
    const diagnosticsText = JSON.stringify(diagnostics, null, 2);
    navigator.clipboard.writeText(diagnosticsText);
  };

  if (!hasIssues && !hasSuccess) {
    return null;
  }

  return (
    <Paper sx={{ p: 3, mt: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {hasIssues ? <WarningIcon color="warning" /> : <SuccessIcon color="success" />}
          Diagnostics
        </Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Tooltip title="Copier diagnostics">
            <IconButton size="small" onClick={handleCopyDiagnostics}>
              <CopyIcon />
            </IconButton>
          </Tooltip>
          <IconButton size="small" onClick={() => setExpanded(!expanded)}>
            {expanded ? <CollapseIcon /> : <ExpandIcon />}
          </IconButton>
        </Box>
      </Box>

      <Collapse in={expanded}>
        <Box>
          {/* Success Message */}
          {hasSuccess && (
            <Alert severity="success" sx={{ mb: 2 }}>
              <Typography variant="subtitle2">
                ✅ Template valide - Tous les placeholders sont résolus
              </Typography>
            </Alert>
          )}

          {/* Missing Placeholders */}
          {diagnostics.missingPlaceholders && diagnostics.missingPlaceholders.length > 0 && (
            <Alert severity="warning" sx={{ mb: 2 }}>
              <Typography variant="subtitle2" sx={{ mb: 1 }}>
                ⚠️ Placeholders manquants ({diagnostics.missingPlaceholders.length})
              </Typography>
              <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                {diagnostics.missingPlaceholders.map((placeholder, index) => (
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

          {/* Warnings */}
          {diagnostics.warnings && diagnostics.warnings.length > 0 && (
            <Alert severity="info" sx={{ mb: 2 }}>
              <Typography variant="subtitle2" sx={{ mb: 1 }}>
                ℹ️ Avertissements ({diagnostics.warnings.length})
              </Typography>
              <List dense>
                {diagnostics.warnings.map((warning, index) => (
                  <ListItem key={index} sx={{ py: 0.5 }}>
                    <ListItemIcon sx={{ minWidth: 32 }}>
                      <InfoIcon fontSize="small" color="info" />
                    </ListItemIcon>
                    <ListItemText 
                      primary={warning}
                      primaryTypographyProps={{ variant: 'body2' }}
                    />
                  </ListItem>
                ))}
              </List>
            </Alert>
          )}

          {/* Errors */}
          {diagnostics.errors && diagnostics.errors.length > 0 && (
            <Alert severity="error" sx={{ mb: 2 }}>
              <Typography variant="subtitle2" sx={{ mb: 1 }}>
                ❌ Erreurs ({diagnostics.errors.length})
              </Typography>
              <List dense>
                {diagnostics.errors.map((error, index) => (
                  <ListItem key={index} sx={{ py: 0.5 }}>
                    <ListItemIcon sx={{ minWidth: 32 }}>
                      <ErrorIcon fontSize="small" color="error" />
                    </ListItemIcon>
                    <ListItemText 
                      primary={error}
                      primaryTypographyProps={{ variant: 'body2' }}
                    />
                  </ListItem>
                ))}
              </List>
            </Alert>
          )}

          {/* Summary */}
          <Box sx={{ mt: 2, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
            <Typography variant="body2" color="text.secondary">
              <strong>Résumé:</strong>
              {hasSuccess && " Template valide et prêt à l'utilisation."}
              {diagnostics.missingPlaceholders && diagnostics.missingPlaceholders.length > 0 && 
                ` ${diagnostics.missingPlaceholders.length} placeholder(s) manquant(s).`}
              {diagnostics.warnings && diagnostics.warnings.length > 0 && 
                ` ${diagnostics.warnings.length} avertissement(s).`}
              {diagnostics.errors && diagnostics.errors.length > 0 && 
                ` ${diagnostics.errors.length} erreur(s).`}
            </Typography>
          </Box>
        </Box>
      </Collapse>
    </Paper>
  );
};

export default DiagnosticsPanel;
