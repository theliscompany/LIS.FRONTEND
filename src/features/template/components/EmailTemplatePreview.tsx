import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Tabs,
  Tab,
  TextField,
  Button,
  Grid,
  Chip,
  Divider,
  Alert,
  CircularProgress,
  IconButton,
  Tooltip,
  Switch,
  FormControlLabel
} from '@mui/material';
import {
  Visibility as PreviewIcon,
  Code as CodeIcon,
  Refresh as RefreshIcon,
  ContentCopy as CopyIcon,
  Email as EmailIcon,
  Subject as SubjectIcon,
  Person as PersonIcon,
  Schedule as ScheduleIcon,
  Compare as CompareIcon,
  BugReport as DebugIcon
} from '@mui/icons-material';
import { useMutation } from '@tanstack/react-query';
import { postApiEmailTemplateByIdPreviewMutation } from '../api/@tanstack/react-query.gen';
import { registerSharedHelpers, compileTemplate } from '../utils/handlebarsHelpers';
import { renderDirect, renderById } from '../api/templateApi';
import DataEditor from './DataEditor';
import DiagnosticsPanel from './DiagnosticsPanel';

interface EmailTemplatePreviewProps {
  template: any;
}

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
      id={`preview-tabpanel-${index}`}
      aria-labelledby={`preview-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

const EmailTemplatePreview: React.FC<EmailTemplatePreviewProps> = ({ template }) => {
  const [activeTab, setActiveTab] = useState(0);
  const [sampleData, setSampleData] = useState('');
  const [previewResult, setPreviewResult] = useState<any>(null);
  const [frontendResult, setFrontendResult] = useState<any>(null);
  const [apiResult, setApiResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [showDebug, setShowDebug] = useState(false);
  const [useFrontendRendering, setUseFrontendRendering] = useState(true);
  const [diagnostics, setDiagnostics] = useState<any>(null);

  const previewMutation = useMutation(postApiEmailTemplateByIdPreviewMutation());

  // Enregistrer les helpers au montage du composant
  useEffect(() => {
    registerSharedHelpers();
  }, []);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const handleGeneratePreview = async () => {
    if (!template?.id) return;

    try {
      setError(null);
      let data = {};
      
      if (sampleData.trim()) {
        try {
          data = JSON.parse(sampleData);
        } catch (e) {
          setError('Données JSON invalides');
          return;
        }
      }

      // Rendu frontend
      if (useFrontendRendering && template.htmlBody) {
        try {
          const frontendHtml = compileTemplate(template.htmlBody, data);
          setFrontendResult({
            htmlBody: frontendHtml,
            subject: template.subject ? compileTemplate(template.subject, data) : template.subject
          });
        } catch (error) {
          console.error('Erreur rendu frontend:', error);
        }
      }

      // Rendu API
      try {
        const apiResult = await renderById(template.id, data);
        setApiResult(apiResult);
        setDiagnostics(apiResult.diagnostics);
      } catch (error) {
        console.error('Erreur rendu API:', error);
        setError('Erreur lors du rendu API');
      }

      // Rendu legacy (pour compatibilité)
      const result = await previewMutation.mutateAsync({
        path: { id: template.id },
        body: data
      });
      setPreviewResult(result);
    } catch (error) {
      console.error('Error generating preview:', error);
      setError('Erreur lors de la génération de l\'aperçu');
    }
  };

  const handleRenderDirect = async () => {
    if (!template?.htmlBody) return;

    try {
      setError(null);
      let data = {};
      
      if (sampleData.trim()) {
        try {
          data = JSON.parse(sampleData);
        } catch (e) {
          setError('Données JSON invalides');
          return;
        }
      }

      const result = await renderDirect({
        htmlBody: template.htmlBody,
        subject: template.subject,
        textBody: template.textBody,
        data
      });

      setApiResult(result);
      setDiagnostics(result.diagnostics);
    } catch (error) {
      console.error('Error rendering direct:', error);
      setError('Erreur lors du rendu direct');
    }
  };

  const handleCopyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const defaultSampleData = {
    nom: "Jean Dupont",
    email: "jean.dupont@example.com",
    numero: "CMD-2024-001",
    date: "2024-01-15",
    montant: "1250.00",
    produits: [
      { nom: "Produit A", quantite: 2, prix: "500.00" },
      { nom: "Produit B", quantite: 1, prix: "250.00" }
    ]
  };

  const handleLoadDefaultData = () => {
    setSampleData(JSON.stringify(defaultSampleData, null, 2));
  };

  if (!template) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography variant="h6" color="text.secondary">
          Aucun template sélectionné
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ width: '100%' }}>
      {/* Template Info */}
      <Paper sx={{ p: 3, mb: 3, background: 'linear-gradient(135deg, #e3f2fd 0%, #f3e5f5 100%)' }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={8}>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
              {template.name}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              {template.subject}
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              <Chip
                icon={<PersonIcon />}
                label={template.author}
                size="small"
                variant="outlined"
              />
              <Chip
                icon={<ScheduleIcon />}
                label={new Date(template.createdAt).toLocaleDateString()}
                size="small"
                variant="outlined"
              />
              {template.tags?.map((tag: string, index: number) => (
                <Chip
                  key={index}
                  label={tag}
                  size="small"
                  variant="outlined"
                  color="primary"
                />
              ))}
            </Box>
          </Grid>
          <Grid item xs={12} md={4} sx={{ textAlign: 'right' }}>
            <Button
              variant="contained"
              onClick={handleGeneratePreview}
              disabled={previewMutation.isPending}
              startIcon={previewMutation.isPending ? <CircularProgress size={20} /> : <PreviewIcon />}
              sx={{
                background: 'linear-gradient(45deg, #1976d2 30%, #42a5f5 90%)',
                boxShadow: '0 3px 5px 2px rgba(25, 118, 210, .3)'
              }}
            >
              {previewMutation.isPending ? 'Génération...' : 'Générer Aperçu'}
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Controls */}
      <Paper sx={{ p: 2, mb: 3, background: 'linear-gradient(135deg, #f5f5f5 0%, #e8eaf6 100%)' }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={6}>
            <FormControlLabel
              control={
                <Switch
                  checked={useFrontendRendering}
                  onChange={(e) => setUseFrontendRendering(e.target.checked)}
                />
              }
              label="Rendu Frontend"
            />
            <FormControlLabel
              control={
                <Switch
                  checked={showDebug}
                  onChange={(e) => setShowDebug(e.target.checked)}
                />
              }
              label="Mode Debug"
            />
          </Grid>
          <Grid item xs={12} md={6} sx={{ textAlign: 'right' }}>
            <Button
              variant="contained"
              onClick={handleGeneratePreview}
              disabled={previewMutation.isPending}
              startIcon={previewMutation.isPending ? <CircularProgress size={20} /> : <PreviewIcon />}
              sx={{ mr: 1 }}
            >
              {previewMutation.isPending ? 'Génération...' : 'Générer Aperçu'}
            </Button>
            <Button
              variant="outlined"
              onClick={handleRenderDirect}
              disabled={previewMutation.isPending}
              startIcon={<CompareIcon />}
            >
              Rendu Direct
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={activeTab} onChange={handleTabChange} aria-label="preview tabs">
          <Tab 
            label={
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <EmailIcon fontSize="small" />
                Aperçu
              </Box>
            } 
          />
          <Tab 
            label={
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <CodeIcon fontSize="small" />
                Données
              </Box>
            } 
          />
          <Tab 
            label={
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <SubjectIcon fontSize="small" />
                Original
              </Box>
            } 
          />
          {showDebug && (
            <Tab 
              label={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <DebugIcon fontSize="small" />
                  Debug
                </Box>
              } 
            />
          )}
        </Tabs>
      </Box>

      {/* Tab Panels */}
      <TabPanel value={activeTab} index={0}>
        {(previewResult || frontendResult || apiResult) ? (
          <Box>
            {/* Frontend Preview */}
            {frontendResult && (
              <Paper sx={{ p: 3, mb: 3, border: '2px solid #4caf50' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h6" sx={{ fontWeight: 600, color: '#4caf50' }}>
                    Aperçu Frontend
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Tooltip title="Copier le HTML">
                      <IconButton
                        size="small"
                        onClick={() => handleCopyToClipboard(frontendResult.htmlBody || '')}
                      >
                        <CopyIcon />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </Box>
                
                <Divider sx={{ mb: 2 }} />
                
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Sujet: {frontendResult.subject || template.subject}
                  </Typography>
                </Box>

                {frontendResult.htmlBody ? (
                  <Box
                    sx={{
                      border: '1px solid #ddd',
                      borderRadius: 1,
                      p: 2,
                      backgroundColor: '#fff',
                      maxHeight: 400,
                      overflow: 'auto'
                    }}
                    dangerouslySetInnerHTML={{ __html: frontendResult.htmlBody }}
                  />
                ) : (
                  <Typography color="text.secondary">
                    Aucun contenu rendu disponible
                  </Typography>
                )}
              </Paper>
            )}

            {/* API Preview */}
            {apiResult && (
              <Paper sx={{ p: 3, mb: 3, border: '2px solid #2196f3' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h6" sx={{ fontWeight: 600, color: '#2196f3' }}>
                    Aperçu API
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Tooltip title="Copier le HTML">
                      <IconButton
                        size="small"
                        onClick={() => handleCopyToClipboard(apiResult.htmlBody || '')}
                      >
                        <CopyIcon />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </Box>
                
                <Divider sx={{ mb: 2 }} />
                
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Sujet: {apiResult.subject || template.subject}
                  </Typography>
                </Box>

                {apiResult.htmlBody ? (
                  <Box
                    sx={{
                      border: '1px solid #ddd',
                      borderRadius: 1,
                      p: 2,
                      backgroundColor: '#fff',
                      maxHeight: 400,
                      overflow: 'auto'
                    }}
                    dangerouslySetInnerHTML={{ __html: apiResult.htmlBody }}
                  />
                ) : (
                  <Typography color="text.secondary">
                    Aucun contenu rendu disponible
                  </Typography>
                )}
              </Paper>
            )}

            {/* Legacy Preview */}
            {previewResult && !frontendResult && !apiResult && (
              <Paper sx={{ p: 3, mb: 3, border: '2px solid #e3f2fd' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    Aperçu Rendu
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Tooltip title="Copier le HTML">
                      <IconButton
                        size="small"
                        onClick={() => handleCopyToClipboard(previewResult.htmlBody || '')}
                      >
                        <CopyIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Actualiser">
                      <IconButton
                        size="small"
                        onClick={handleGeneratePreview}
                      >
                        <RefreshIcon />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </Box>
                
                <Divider sx={{ mb: 2 }} />
                
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Sujet: {previewResult.subject || template.subject}
                  </Typography>
                </Box>

                {previewResult.htmlBody ? (
                  <Box
                    sx={{
                      border: '1px solid #ddd',
                      borderRadius: 1,
                      p: 2,
                      backgroundColor: '#fff',
                      maxHeight: 400,
                      overflow: 'auto'
                    }}
                    dangerouslySetInnerHTML={{ __html: previewResult.htmlBody }}
                  />
                ) : previewResult.textBody ? (
                  <Box
                    sx={{
                      border: '1px solid #ddd',
                      borderRadius: 1,
                      p: 2,
                      backgroundColor: '#fff',
                      maxHeight: 400,
                      overflow: 'auto',
                      whiteSpace: 'pre-wrap',
                      fontFamily: 'monospace'
                    }}
                  >
                    {previewResult.textBody}
                  </Box>
                ) : (
                  <Typography color="text.secondary">
                    Aucun contenu rendu disponible
                  </Typography>
                )}
              </Paper>
            )}

            {/* Diagnostics */}
            {diagnostics && (
              <DiagnosticsPanel diagnostics={diagnostics} />
            )}

            {/* Configuration Info */}
            <Paper sx={{ p: 3, background: '#f5f5f5' }}>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Informations de Rendu
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <Typography variant="body2" color="text.secondary">
                    <strong>Moteur:</strong> {template.configuration?.engine || 'handlebars'}
                  </Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="body2" color="text.secondary">
                    <strong>Langue:</strong> {template.configuration?.locale || 'fr'}
                  </Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="body2" color="text.secondary">
                    <strong>HTML autorisé:</strong> {template.configuration?.allowHtml ? 'Oui' : 'Non'}
                  </Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="body2" color="text.secondary">
                    <strong>Mode strict:</strong> {template.configuration?.strictMode ? 'Oui' : 'Non'}
                  </Typography>
                </Grid>
              </Grid>
            </Paper>
          </Box>
        ) : (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <PreviewIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6" color="text.secondary" sx={{ mb: 1 }}>
              Aucun aperçu généré
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Cliquez sur "Générer Aperçu" pour voir le template avec des données d'exemple
            </Typography>
            <Button
              variant="outlined"
              onClick={handleGeneratePreview}
              disabled={previewMutation.isPending}
              startIcon={previewMutation.isPending ? <CircularProgress size={20} /> : <PreviewIcon />}
            >
              {previewMutation.isPending ? 'Génération...' : 'Générer Aperçu'}
            </Button>
          </Box>
        )}
      </TabPanel>

      <TabPanel value={activeTab} index={1}>
        <DataEditor
          template={template}
          sampleData={sampleData}
          onSampleDataChange={setSampleData}
          onValidationChange={(validation) => {
            // Optionnel: utiliser la validation pour afficher des warnings
          }}
        />
      </TabPanel>

      <TabPanel value={activeTab} index={2}>
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" sx={{ mb: 2 }}>
            Template Original
          </Typography>
          
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 600 }}>
                Corps HTML
              </Typography>
              <Box
                sx={{
                  border: '1px solid #ddd',
                  borderRadius: 1,
                  p: 2,
                  backgroundColor: '#f9f9f9',
                  maxHeight: 300,
                  overflow: 'auto',
                  fontFamily: 'monospace',
                  fontSize: '0.875rem',
                  whiteSpace: 'pre-wrap'
                }}
              >
                {template.htmlBody || 'Aucun contenu HTML'}
              </Box>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 600 }}>
                Corps Texte
              </Typography>
              <Box
                sx={{
                  border: '1px solid #ddd',
                  borderRadius: 1,
                  p: 2,
                  backgroundColor: '#f9f9f9',
                  maxHeight: 300,
                  overflow: 'auto',
                  fontFamily: 'monospace',
                  fontSize: '0.875rem',
                  whiteSpace: 'pre-wrap'
                }}
              >
                {template.textBody || 'Aucun contenu texte'}
              </Box>
            </Grid>
          </Grid>
          
          <Divider sx={{ my: 3 }} />
          
          <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 600 }}>
            Configuration
          </Typography>
          <Box
            sx={{
              border: '1px solid #ddd',
              borderRadius: 1,
              p: 2,
              backgroundColor: '#f9f9f9',
              fontFamily: 'monospace',
              fontSize: '0.875rem'
            }}
          >
            {JSON.stringify(template.configuration, null, 2)}
          </Box>
        </Paper>
      </TabPanel>

      {/* Debug Panel */}
      {showDebug && (
        <TabPanel value={activeTab} index={3}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Debug - Comparaison Frontend vs API
            </Typography>
            
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 600 }}>
                  Résultat Frontend
                </Typography>
                <Box
                  sx={{
                    border: '1px solid #ddd',
                    borderRadius: 1,
                    p: 2,
                    backgroundColor: '#f9f9f9',
                    maxHeight: 300,
                    overflow: 'auto',
                    fontFamily: 'monospace',
                    fontSize: '0.875rem',
                    whiteSpace: 'pre-wrap'
                  }}
                >
                  {frontendResult ? JSON.stringify(frontendResult, null, 2) : 'Aucun résultat'}
                </Box>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 600 }}>
                  Résultat API
                </Typography>
                <Box
                  sx={{
                    border: '1px solid #ddd',
                    borderRadius: 1,
                    p: 2,
                    backgroundColor: '#f9f9f9',
                    maxHeight: 300,
                    overflow: 'auto',
                    fontFamily: 'monospace',
                    fontSize: '0.875rem',
                    whiteSpace: 'pre-wrap'
                  }}
                >
                  {apiResult ? JSON.stringify(apiResult, null, 2) : 'Aucun résultat'}
                </Box>
              </Grid>
            </Grid>
            
            <Divider sx={{ my: 3 }} />
            
            <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 600 }}>
              Données Utilisées
            </Typography>
            <Box
              sx={{
                border: '1px solid #ddd',
                borderRadius: 1,
                p: 2,
                backgroundColor: '#f9f9f9',
                fontFamily: 'monospace',
                fontSize: '0.875rem'
              }}
            >
              {sampleData || 'Aucune donnée'}
            </Box>
          </Paper>
        </TabPanel>
      )}
    </Box>
  );
};

export default EmailTemplatePreview; 