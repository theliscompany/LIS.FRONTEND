import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Checkbox,
  TextField,
  InputAdornment,
  Chip,
  Alert,
  CircularProgress,
  Grid,
  Card,
  CardContent,
  IconButton,
  Avatar,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Paper,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  FormControlLabel,
  Divider,
  Switch,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';
import {
  Search as SearchIcon,
  Close as CloseIcon,
  Download as DownloadIcon,
  ExpandMore as ExpandMoreIcon,
  FilterList as FilterListIcon,
  ViewModule as ViewModuleIcon,
  ViewList as ViewListIcon,
  Schema as SchemaIcon,
  Refresh as RefreshIcon,
  Storage as StorageIcon
} from '@mui/icons-material';
import { SDKAnalyzer, DetectedObjectType } from '../services/sdkAnalyzer';

interface SDKDetectionModalProps {
  open: boolean;
  onClose: () => void;
  onImportTypes: (types: DetectedObjectType[]) => void;
}

export const SDKDetectionModal: React.FC<SDKDetectionModalProps> = ({
  open,
  onClose,
  onImportTypes
}) => {
  const [detectedTypes, setDetectedTypes] = useState<DetectedObjectType[]>([]);
  const [selectedTypes, setSelectedTypes] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showModuleFilter, setShowModuleFilter] = useState(false);
  const [selectedModules, setSelectedModules] = useState<Set<string>>(new Set());
  const [expandedModules, setExpandedModules] = useState<Set<string>>(new Set());
  const [selectedTypeForDetails, setSelectedTypeForDetails] = useState<DetectedObjectType | null>(null);
  const [showPropertiesModal, setShowPropertiesModal] = useState(false);
  const [useJsonFile, setUseJsonFile] = useState(true);
  const [detectionMethod, setDetectionMethod] = useState<'json' | 'realtime'>('json');

  const sdkAnalyzer = new SDKAnalyzer();

  useEffect(() => {
    if (open) {
      loadDetectedTypes();
    }
  }, [open, detectionMethod]);

  const loadDetectedTypes = async () => {
    setLoading(true);
    setError(null);
    
    try {
      let types: DetectedObjectType[] = [];
      
      if (detectionMethod === 'json') {
        // Load from JSON file
        types = await sdkAnalyzer.loadFromJsonFile();
        if (types.length === 0) {
          setError('Aucun type d\'objet trouvé dans le fichier JSON. Exécutez d\'abord "npm run generate-sdk-types".');
        }
      } else {
        // Use real-time analysis
        types = sdkAnalyzer.getRealDetectedTypes();
        if (types.length === 0) {
          setError('Aucun type d\'objet détecté.');
        }
      }
      
      if (types.length > 0) {
        setDetectedTypes(types);
        
        // Initialize all modules as selected
        const modules = new Set(types.map(type => type.module));
        setSelectedModules(modules);
      }
    } catch (err) {
      setError('Erreur lors de l\'analyse des SDKs.');
      console.error('SDK Analysis Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleTypeToggle = (typeName: string) => {
    const newSelected = new Set(selectedTypes);
    if (newSelected.has(typeName)) {
      newSelected.delete(typeName);
    } else {
      newSelected.add(typeName);
    }
    setSelectedTypes(newSelected);
  };

  const handleSelectAll = () => {
    const allTypeNames = detectedTypes.map((type: DetectedObjectType) => type.typeName);
    setSelectedTypes(new Set(allTypeNames));
  };

  const handleDeselectAll = () => {
    setSelectedTypes(new Set());
  };

  const handleImport = () => {
    const selectedTypesList = detectedTypes.filter(type => 
      selectedTypes.has(type.typeName)
    );
    onImportTypes(selectedTypesList);
    onClose();
  };

  const getFilteredTypes = () => {
    let filtered = detectedTypes;

    // Filter by search term
    if (searchTerm) {
      filtered = sdkAnalyzer.searchTypes(filtered, searchTerm);
    }

    // Filter by selected modules
    if (selectedModules.size > 0) {
      filtered = filtered.filter(type => selectedModules.has(type.module));
    }

    return filtered;
  };

  const handleModuleToggle = (moduleName: string) => {
    const newSelected = new Set(selectedModules);
    if (newSelected.has(moduleName)) {
      newSelected.delete(moduleName);
    } else {
      newSelected.add(moduleName);
    }
    setSelectedModules(newSelected);
  };

  const handleModuleExpand = (moduleName: string) => {
    const newExpanded = new Set(expandedModules);
    if (newExpanded.has(moduleName)) {
      newExpanded.delete(moduleName);
    } else {
      newExpanded.add(moduleName);
    }
    setExpandedModules(newExpanded);
  };

  const handleShowAllProperties = (type: DetectedObjectType, event: React.MouseEvent) => {
    event.stopPropagation();
    setSelectedTypeForDetails(type);
    setShowPropertiesModal(true);
  };

  const handleClosePropertiesModal = () => {
    setShowPropertiesModal(false);
    setSelectedTypeForDetails(null);
  };

  const getModuleTypes = (moduleName: string) => {
    return detectedTypes.filter(type => type.module === moduleName);
  };

  const getModuleStats = (moduleName: string) => {
    const moduleTypes = getModuleTypes(moduleName);
    const totalProperties = moduleTypes.reduce((sum, type) => 
      sum + Object.keys(type.properties).length, 0
    );
    return { count: moduleTypes.length, totalProperties };
  };

  const filteredTypes = getFilteredTypes();

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="xl" 
      fullWidth
      PaperProps={{
        sx: {
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          borderRadius: 3,
          boxShadow: '0 20px 40px rgba(0,0,0,0.3)'
        }
      }}
    >
      <DialogTitle sx={{ 
        color: 'white', 
        background: 'rgba(255,255,255,0.1)', 
        backdropFilter: 'blur(10px)',
        borderBottom: '1px solid rgba(255,255,255,0.2)'
      }}>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Box display="flex" alignItems="center" gap={2}>
            <SchemaIcon sx={{ fontSize: 28 }} />
            <Typography variant="h5" fontWeight="bold">
              Détection des Types d'Objets SDK
            </Typography>
          </Box>
          <IconButton onClick={onClose} sx={{ color: 'white' }}>
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent sx={{ p: 3, background: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(10px)' }}>
        {/* Detection Method Selector */}
        <Box mb={3} p={2} sx={{ 
          background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
          borderRadius: 2,
          color: 'white'
        }}>
          <Typography variant="h6" mb={2} fontWeight="bold">
            Méthode de Détection
          </Typography>
          <FormControl fullWidth size="small">
            <InputLabel sx={{ color: 'white' }}>Méthode</InputLabel>
            <Select
              value={detectionMethod}
              onChange={(e) => setDetectionMethod(e.target.value as 'json' | 'realtime')}
              sx={{ 
                color: 'white',
                '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255,255,255,0.5)' },
                '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255,255,255,0.8)' }
              }}
            >
              <MenuItem value="json">
                <Box display="flex" alignItems="center" gap={1}>
                  <StorageIcon />
                  Fichier JSON (Recommandé)
                </Box>
              </MenuItem>
              <MenuItem value="realtime">
                <Box display="flex" alignItems="center" gap={1}>
                  <RefreshIcon />
                  Analyse en Temps Réel
                </Box>
              </MenuItem>
            </Select>
          </FormControl>
          <Typography variant="body2" mt={1} sx={{ opacity: 0.9 }}>
            {detectionMethod === 'json' 
              ? 'Utilise le fichier JSON généré par "npm run generate-sdk-types"'
              : 'Analyse en temps réel (données d\'exemple du module offer)'
            }
          </Typography>
        </Box>

        {/* Search and Controls */}
        <Box mb={3} display="flex" gap={2} alignItems="center" flexWrap="wrap">
          <TextField
            placeholder="Rechercher des types..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />
            }}
            size="small"
            sx={{ minWidth: 300, flex: 1 }}
          />
          
          <Box display="flex" gap={1}>
            <Button
              variant="outlined"
              onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
              startIcon={viewMode === 'grid' ? <ViewListIcon /> : <ViewModuleIcon />}
              size="small"
            >
              {viewMode === 'grid' ? 'Liste' : 'Grille'}
            </Button>
            
            <Button
              variant="outlined"
              onClick={() => setShowModuleFilter(!showModuleFilter)}
              startIcon={<FilterListIcon />}
              size="small"
            >
              Filtres
            </Button>
          </Box>
        </Box>

        {/* Module Filter */}
        {showModuleFilter && (
          <Box mb={3} p={2} sx={{ 
            background: 'rgba(0,0,0,0.05)', 
            borderRadius: 2,
            border: '1px solid rgba(0,0,0,0.1)'
          }}>
            <Typography variant="subtitle1" mb={2} fontWeight="bold">
              Filtrer par Module
            </Typography>
            <Box display="flex" gap={1} flexWrap="wrap">
              {Array.from(new Set(detectedTypes.map(t => t.module))).map(module => {
                const stats = getModuleStats(module);
                return (
                  <Chip
                    key={module}
                    label={`${module} (${stats.count})`}
                    onClick={() => handleModuleToggle(module)}
                    color={selectedModules.has(module) ? 'primary' : 'default'}
                    variant={selectedModules.has(module) ? 'filled' : 'outlined'}
                    size="small"
                  />
                );
              })}
            </Box>
          </Box>
        )}

        {/* Loading State */}
        {loading && (
          <Box display="flex" justifyContent="center" p={4}>
            <CircularProgress />
          </Box>
        )}

        {/* Error State */}
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {/* Results */}
        {!loading && !error && (
          <>
            {/* Summary */}
            <Box mb={3} p={2} sx={{ 
              background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
              borderRadius: 2,
              color: 'white'
            }}>
              <Typography variant="h6" fontWeight="bold">
                Résultats de la Détection
              </Typography>
              <Typography variant="body2">
                {filteredTypes.length} types trouvés sur {detectedTypes.length} au total
                {detectionMethod === 'json' && ' (depuis le fichier JSON)'}
              </Typography>
            </Box>

            {/* Grid View */}
            {viewMode === 'grid' && (
              <Grid container spacing={2}>
                {filteredTypes.map((type) => (
                  <Grid item xs={12} sm={6} md={4} key={type.typeName}>
                    <Card 
                      sx={{ 
                        height: 280,
                        transition: 'all 0.3s ease',
                        transform: 'translateY(0)',
                        boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
                        '&:hover': {
                          transform: 'translateY(-4px)',
                          boxShadow: '0 8px 16px rgba(0,0,0,0.2)'
                        }
                      }}
                    >
                      <CardContent sx={{ p: 2, height: '100%', display: 'flex', flexDirection: 'column' }}>
                        <Box display="flex" alignItems="center" mb={1}>
                          <Checkbox
                            checked={selectedTypes.has(type.typeName)}
                            onChange={() => handleTypeToggle(type.typeName)}
                            size="small"
                          />
                          <Box flex={1}>
                            <Typography variant="h6" fontWeight="bold" noWrap>
                              {type.typeName}
                            </Typography>
                            <Typography variant="body2" color="text.secondary" noWrap>
                              {type.description}
                            </Typography>
                          </Box>
                        </Box>

                        {/* Tags */}
                        <Box mb={2} display="flex" gap={1}>
                          <Chip 
                            label={type.module} 
                            size="small" 
                            color="primary" 
                            variant="outlined"
                          />
                          <Chip 
                            label={`${Object.keys(type.properties).length} props`} 
                            size="small" 
                            color="secondary" 
                            variant="outlined"
                          />
                        </Box>

                        {/* Properties Preview */}
                        <Box mb={2}>
                          <Typography variant="caption" fontWeight="bold" color="text.secondary">
                            Propriétés:
                          </Typography>
                          <Box display="flex" flexWrap="wrap" gap={0.5} mt={0.5}>
                            {Object.entries(type.properties).slice(0, 6).map(([key, prop]) => (
                              <Chip
                                key={key}
                                label={`${key}: ${prop.type}${prop.required ? '' : '?'}`}
                                size="small"
                                sx={{
                                  background: 'rgba(25, 118, 210, 0.1)',
                                  color: '#1976d2',
                                  fontSize: '0.7rem',
                                  height: 20,
                                  fontWeight: 500,
                                  border: '1px solid rgba(25, 118, 210, 0.3)'
                                }}
                              />
                            ))}
                            {Object.keys(type.properties).length > 6 && (
                              <Chip
                                label={`+${Object.keys(type.properties).length - 6} autres`}
                                size="small"
                                sx={{
                                  background: 'rgba(156, 39, 176, 0.1)',
                                  color: '#9c27b0',
                                  fontSize: '0.7rem',
                                  height: 20,
                                  fontWeight: 500,
                                  border: '1px solid rgba(156, 39, 176, 0.3)'
                                }}
                              />
                            )}
                          </Box>
                        </Box>

                        {/* Source */}
                        <Typography variant="caption" color="text.secondary" sx={{ mt: 'auto' }}>
                          Source: {type.source}
                        </Typography>

                        {/* View All Properties Button */}
                        <Button
                          size="small"
                          onClick={(e) => handleShowAllProperties(type, e)}
                          sx={{ mt: 1 }}
                          startIcon={<SchemaIcon />}
                        >
                          Voir toutes les {Object.keys(type.properties).length} propriétés
                        </Button>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            )}

            {/* List View */}
            {viewMode === 'list' && (
              <List>
                {filteredTypes.map((type) => (
                  <ListItem
                    key={type.typeName}
                    component="div"
                    sx={{
                      cursor: 'pointer',
                      borderRadius: 1,
                      mb: 1,
                      background: 'rgba(255,255,255,0.8)',
                      border: '1px solid rgba(0,0,0,0.1)',
                      '&:hover': {
                        background: 'rgba(255,255,255,0.95)',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                      }
                    }}
                  >
                    <ListItemIcon>
                      <Checkbox
                        checked={selectedTypes.has(type.typeName)}
                        onChange={() => handleTypeToggle(type.typeName)}
                        size="small"
                      />
                    </ListItemIcon>
                    <ListItemText
                      primary={
                        <Box display="flex" alignItems="center" gap={1}>
                          <Typography variant="subtitle1" fontWeight="bold">
                            {type.typeName}
                          </Typography>
                          <Chip label={type.module} size="small" color="primary" variant="outlined" />
                          <Chip label={`${Object.keys(type.properties).length} props`} size="small" color="secondary" variant="outlined" />
                        </Box>
                      }
                      secondary={
                        <Box>
                          <Typography variant="body2" color="text.secondary" mb={1}>
                            {type.description}
                          </Typography>
                          
                          {/* Properties Preview */}
                          <Box display="flex" flexWrap="wrap" gap={0.5}>
                            {Object.entries(type.properties).slice(0, 5).map(([key, prop]) => (
                              <Chip
                                key={key}
                                label={`${key}: ${prop.type}${prop.required ? '' : '?'}`}
                                size="small"
                                sx={{
                                  background: 'rgba(25, 118, 210, 0.1)',
                                  color: '#1976d2',
                                  fontSize: '0.65rem',
                                  height: 18,
                                  fontWeight: 500,
                                  border: '1px solid rgba(25, 118, 210, 0.3)'
                                }}
                              />
                            ))}
                            {Object.keys(type.properties).length > 5 && (
                              <Chip
                                label={`+${Object.keys(type.properties).length - 5} autres`}
                                size="small"
                                sx={{
                                  background: 'rgba(156, 39, 176, 0.1)',
                                  color: '#9c27b0',
                                  fontSize: '0.65rem',
                                  height: 18,
                                  fontWeight: 500,
                                  border: '1px solid rgba(156, 39, 176, 0.3)'
                                }}
                              />
                            )}
                          </Box>
                        </Box>
                      }
                    />
                  </ListItem>
                ))}
              </List>
            )}
          </>
        )}
      </DialogContent>

      <DialogActions sx={{ 
        p: 3, 
        background: 'rgba(255,255,255,0.95)', 
        backdropFilter: 'blur(10px)',
        borderTop: '1px solid rgba(0,0,0,0.1)'
      }}>
        <Box display="flex" gap={2} alignItems="center">
          <Button onClick={handleSelectAll} variant="outlined" size="small">
            Tout Sélectionner
          </Button>
          <Button onClick={handleDeselectAll} variant="outlined" size="small">
            Tout Désélectionner
          </Button>
          <Typography variant="body2" color="text.secondary">
            {selectedTypes.size} sélectionné(s)
          </Typography>
        </Box>
        
        <Box display="flex" gap={2}>
          <Button onClick={onClose} variant="outlined">
            Annuler
          </Button>
          <Button 
            onClick={handleImport} 
            variant="contained" 
            disabled={selectedTypes.size === 0}
            startIcon={<DownloadIcon />}
            sx={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              '&:hover': {
                background: 'linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)'
              }
            }}
          >
            Importer ({selectedTypes.size})
          </Button>
        </Box>
      </DialogActions>

      {/* Properties Modal */}
      <Dialog
        open={showPropertiesModal}
        onClose={handleClosePropertiesModal}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            borderRadius: 3
          }
        }}
      >
        <DialogTitle sx={{ color: 'white', background: 'rgba(255,255,255,0.1)' }}>
          <Box display="flex" alignItems="center" justifyContent="space-between">
            <Typography variant="h6" fontWeight="bold">
              Propriétés de {selectedTypeForDetails?.typeName}
            </Typography>
            <IconButton onClick={handleClosePropertiesModal} sx={{ color: 'white' }}>
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        
        <DialogContent sx={{ p: 3, background: 'rgba(255,255,255,0.95)' }}>
          {selectedTypeForDetails && (
            <Box>
              <Typography variant="body1" mb={2}>
                <strong>Module:</strong> {selectedTypeForDetails.module}
              </Typography>
              <Typography variant="body1" mb={3}>
                <strong>Source:</strong> {selectedTypeForDetails.source}
              </Typography>
              
              <Typography variant="h6" mb={2} fontWeight="bold">
                Propriétés ({Object.keys(selectedTypeForDetails.properties).length})
              </Typography>
              
              <Box display="flex" flexDirection="column" gap={1}>
                {Object.entries(selectedTypeForDetails.properties).map(([key, prop]) => (
                  <Paper key={key} sx={{ p: 2, background: 'rgba(255,255,255,0.8)' }}>
                    <Box display="flex" justifyContent="space-between" alignItems="center">
                      <Typography variant="subtitle1" fontWeight="bold">
                        {key}
                      </Typography>
                      <Box display="flex" gap={1}>
                        <Chip 
                          label={prop.type} 
                          size="small" 
                          color="primary" 
                          variant="outlined"
                        />
                        {prop.isArray && (
                          <Chip label="Array" size="small" color="secondary" variant="outlined" />
                        )}
                        {prop.required ? (
                          <Chip label="Required" size="small" color="error" variant="outlined" />
                        ) : (
                          <Chip label="Optional" size="small" color="warning" variant="outlined" />
                        )}
                      </Box>
                    </Box>
                  </Paper>
                ))}
              </Box>
            </Box>
          )}
        </DialogContent>
        
        <DialogActions sx={{ p: 3, background: 'rgba(255,255,255,0.95)' }}>
          <Button onClick={handleClosePropertiesModal} variant="outlined">
            Fermer
          </Button>
        </DialogActions>
      </Dialog>
    </Dialog>
  );
}; 

export default SDKDetectionModal;
