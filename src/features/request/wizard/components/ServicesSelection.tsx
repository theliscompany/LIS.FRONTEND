import React, { useState, useMemo, useEffect, useCallback } from "react";
import {
  Box, Typography, Button, Alert, TextField, Grid, 
  Card, CardContent, Stack, Chip, Badge, 
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, 
  Paper, Avatar, Fade, Modal, IconButton, Tooltip, Checkbox, 
  FormControl, InputLabel, Select, MenuItem, InputAdornment
} from "@mui/material";
import {
  Build, Euro, CheckCircle, Business, Visibility, Close,
  AttachMoney, Language, Info, Add, Search
} from '@mui/icons-material';
import { useFieldArray, useFormContext } from 'react-hook-form';
import { motion } from 'framer-motion';

import { DraftQuoteForm } from '../schema';

// Services prédéfinis
const predefinedServices = [
  { code: 'CUSTOMS', label: 'Dédouanement', basePrice: 150, currency: 'EUR' },
  { code: 'INSURANCE', label: 'Assurance transport', basePrice: 200, currency: 'EUR' },
  { code: 'PACKAGING', label: 'Emballage', basePrice: 100, currency: 'EUR' },
  { code: 'STORAGE', label: 'Stockage', basePrice: 50, currency: 'EUR' },
  { code: 'DOCUMENTATION', label: 'Documentation', basePrice: 75, currency: 'EUR' },
  { code: 'INSPECTION', label: 'Inspection', basePrice: 120, currency: 'EUR' },
  { code: 'CERTIFICATION', label: 'Certification', basePrice: 80, currency: 'EUR' },
  { code: 'TRANSLATION', label: 'Traduction', basePrice: 60, currency: 'EUR' },
  { code: 'NOTARIZATION', label: 'Notarisation', basePrice: 90, currency: 'EUR' },
  { code: 'EXPRESS', label: 'Service express', basePrice: 300, currency: 'EUR' }
];

interface ServicesSelectionProps {
  onUpdate?: (services: any[]) => void;
}

export const ServicesSelection: React.FC<ServicesSelectionProps> = ({ onUpdate }) => {
  const { control, watch, setValue, getValues } = useFormContext<DraftQuoteForm>();
  const { fields, append, remove } = useFieldArray({
    control,
    name: 'currentOption.services'
  });
  
  // Watch the current option services directly
  const currentOptionServices = watch('currentOption.services') || [];

  // États pour les données
  const [searchText, setSearchText] = useState('');
  const [filterCategory, setFilterCategory] = useState<string | null>(null);

  // Utiliser useMemo pour forcer le re-render quand les services changent
  const selectedServiceIds = useMemo(() => {
    const ids = currentOptionServices.map(s => s.id).filter(Boolean) as string[];
    return ids;
  }, [currentOptionServices]);



  // États pour le modal de détails
  const [selectedServiceForDetails, setSelectedServiceForDetails] = useState<any | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);

  // États pour l'ajout de service personnalisé
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [customService, setCustomService] = useState({
    code: '',
    label: '',
    price: 0
  });

  // Récupérer les données du formulaire
  const formData = watch('basics');

  // Application des filtres
  const filteredServices = useMemo(() => {
    let services = predefinedServices;
    
    if (searchText) {
      const lower = searchText.toLowerCase();
      services = services.filter(s =>
        s.label.toLowerCase().includes(lower) ||
        s.code.toLowerCase().includes(lower)
      );
    }
    
    if (filterCategory) {
      // Pour l'instant, pas de catégorie, mais on peut l'ajouter plus tard
      services = services.filter(s => s.category === filterCategory);
    }
    
    return services;
  }, [searchText, filterCategory]);

  // Handler pour sélectionner/désélectionner
  const handleToggleService = useCallback((service: any) => {
    const serviceId = service.code;
    
    if (!serviceId) {
      return;
    }

    // Vérifier si le service est déjà sélectionné (par code ou par id)
    const isCurrentlySelected = currentOptionServices.some(s => 
      s.code === serviceId || s.id === serviceId
    );

    // Mettre à jour le formulaire
    if (isCurrentlySelected) {
      // Supprimer de la liste (par code ou par id)
      const updatedServices = currentOptionServices.filter(s => 
        s.code !== serviceId && s.id !== serviceId
      );
      setValue('currentOption.services', updatedServices);
    } else {
      // Ajouter à la liste
      const serviceData = {
        id: serviceId, // Utiliser le code comme ID pour les services prédéfinis
        code: service.code,
        label: service.label,
        price: service.basePrice,
        currency: 'EUR',
        calc: 'flat',
        unit: 'per_shipment',
        taxable: false
      };
      const updatedServices = [...currentOptionServices, serviceData];
      setValue('currentOption.services', updatedServices);
    }

    // Notifier le parent
    if (onUpdate) {
      const newServices = getValues('currentOption.services') || [];
      onUpdate(newServices);
    }
  }, [selectedServiceIds, currentOptionServices, setValue, getValues, onUpdate]);

  // Handler pour ajouter un service personnalisé
  const handleAddCustomService = () => {
    if (customService.code && customService.label) {
      const serviceData = {
        code: customService.code,
        label: customService.label,
        price: customService.price
      };
      
      append(serviceData);
      // Les services sont maintenant gérés par le formulaire
      
      // Reset form
      setCustomService({ code: '', label: '', price: 0 });
      setIsAddModalOpen(false);
      
      if (onUpdate) {
        onUpdate(fields);
      }
    }
  };

  // Fonctions pour le modal de détails
  const handleOpenDetailsModal = (service: any) => {
    setSelectedServiceForDetails(service);
    setIsDetailsModalOpen(true);
  };

  const handleCloseDetailsModal = () => {
    setIsDetailsModalOpen(false);
    setSelectedServiceForDetails(null);
  };

  const selectedCount = selectedServiceIds.length;

  return (
    <Box>
      {/* Filtres et recherche */}
      <Card sx={{ mb: 3, borderRadius: 3, boxShadow: '0 4px 24px rgba(25,118,210,0.07)', p: 2 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={8} md={9}>
            <TextField
              fullWidth
              size="small"
              variant="outlined"
              placeholder="Rechercher un service..."
              value={searchText}
              onChange={e => setSearchText(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          <Grid item xs={12} sm={4} md={3}>
            <Button
              fullWidth
              variant="contained"
              startIcon={<Add />}
              onClick={() => setIsAddModalOpen(true)}
              sx={{
                background: 'linear-gradient(135deg, #1976d2 0%, #7b1fa2 100%)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #1565c0 0%, #6a4190 100%)',
                },
              }}
            >
              Ajouter service
            </Button>
          </Grid>
        </Grid>
      </Card>

      {/* Alerte sélection */}
      <Fade in={selectedServiceIds.length > 0} timeout={400}>
        <Alert severity="info" sx={{ mb: 2 }}>
          <Typography variant="body2" sx={{ fontWeight: 600 }}>
            {selectedServiceIds.length} service(s) sélectionné(s)
          </Typography>
        </Alert>
      </Fade>

      {/* Liste des services */}
      {filteredServices.length > 0 && (
        <Card sx={{ borderRadius: 3, boxShadow: '0 10px 30px rgba(25,118,210,0.10)', background: '#fff3e0' }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Badge color="primary" badgeContent={selectedCount} showZero sx={{ mr: 2 }}>
                <Build fontSize="large" color="primary" />
              </Badge>
              <Typography variant="h6" sx={{ fontWeight: 600, color: '#1976d2' }}>
                Services disponibles {selectedCount > 0 && `— ${selectedCount} sélectionné${selectedCount > 1 ? 's' : ''}`}
              </Typography>
            </Box>

            <TableContainer component={Paper} sx={{ borderRadius: 2, overflowX: 'auto', background: '#fff' }}>
              <Table size="small">
                <TableHead>
                  <TableRow sx={{ background: 'linear-gradient(90deg, #1976d2 0%, #7b1fa2 100%)' }}>
                    <TableCell>{/* Checkbox */}</TableCell>
                    <TableCell sx={{ color: '#fff', fontWeight: 700 }}>Code</TableCell>
                    <TableCell sx={{ color: '#fff', fontWeight: 700 }}>Service</TableCell>
                    <TableCell sx={{ color: '#fff', fontWeight: 700 }}>Prix</TableCell>
                    <TableCell align="center" sx={{ color: '#fff', fontWeight: 700 }}>Sélection</TableCell>
                    <TableCell align="center" sx={{ color: '#fff', fontWeight: 700 }}>Détails</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredServices.map((service, idx) => {
                    const isSelected = currentOptionServices.some(s => 
                      s.code === service.code || s.id === service.code
                    );
                    
                    return (
                      <TableRow key={service.code} hover selected={isSelected} sx={{
                        transition: 'background 0.2s',
                        background: isSelected ? 'linear-gradient(90deg, #fff3e0 60%, #ffe0b2 100%)' : undefined,
                        borderLeft: isSelected ? '6px solid #1976d2' : '6px solid transparent',
                      }}>
                        <TableCell padding="checkbox">
                          <Checkbox
                            color="primary"
                            checked={isSelected}
                            onChange={() => handleToggleService(service)}
                            inputProps={{ 'aria-label': 'select service' }}
                          />
                        </TableCell>
                        <TableCell>
                          <Chip 
                            label={service.code} 
                            size="small" 
                            color="primary" 
                            variant="outlined"
                          />
                        </TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>
                          {service.label}
                        </TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>
                          {service.basePrice.toLocaleString(undefined, { maximumFractionDigits: 2 })} {service.currency}
                        </TableCell>
                        <TableCell align="center">
                          <Button
                            variant={isSelected ? "contained" : "outlined"}
                            color="primary"
                            size="small"
                            onClick={() => handleToggleService(service)}
                            sx={{ fontWeight: 600, minWidth: 90 }}
                          >
                            {isSelected ? 'Désélectionner' : 'Sélectionner'}
                          </Button>
                        </TableCell>
                        <TableCell align="center">
                          <Tooltip title="Détails" arrow>
                            <IconButton
                              size="small"
                              onClick={() => handleOpenDetailsModal(service)}
                              sx={{
                                color: '#1976d2',
                                '&:hover': {
                                  backgroundColor: 'rgba(25, 118, 210, 0.1)',
                                  transform: 'scale(1.1)',
                                },
                                transition: 'all 0.2s ease-in-out'
                              }}
                            >
                              <Visibility fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      )}

      {filteredServices.length === 0 && (
        <Box sx={{ mt: 4 }}>
          <Alert severity="info" sx={{ mb: 2 }}>
            Aucun service trouvé avec les critères sélectionnés
          </Alert>
        </Box>
      )}

      {/* Modal d'ajout de service personnalisé */}
      <Modal
        open={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        aria-labelledby="add-service-modal"
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          p: 2,
        }}
      >
        <Box
          sx={{
            position: 'relative',
            width: { xs: '95%', sm: '90%', md: '500px' },
            bgcolor: 'background.paper',
            borderRadius: 3,
            boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
            overflow: 'hidden',
          }}
        >
          {/* Header du modal */}
          <Box
            sx={{
              background: 'linear-gradient(135deg, #1976d2 0%, #7b1fa2 100%)',
              color: 'white',
              p: 3,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)', mr: 2 }}>
                <Add />
              </Avatar>
              <Typography variant="h5" sx={{ fontWeight: 700 }}>
                Ajouter un service personnalisé
              </Typography>
            </Box>
            <IconButton
              onClick={() => setIsAddModalOpen(false)}
              sx={{
                color: 'white',
                '&:hover': {
                  backgroundColor: 'rgba(255,255,255,0.1)',
                },
              }}
            >
              <Close />
            </IconButton>
          </Box>

          {/* Contenu du modal */}
          <Box sx={{ p: 3 }}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Code du service"
                  value={customService.code}
                  onChange={(e) => setCustomService({ ...customService, code: e.target.value.toUpperCase() })}
                  placeholder="ex: CUSTOM_SERVICE"
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Nom du service"
                  value={customService.label}
                  onChange={(e) => setCustomService({ ...customService, label: e.target.value })}
                  placeholder="ex: Service personnalisé"
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Prix"
                  type="number"
                  value={customService.price}
                  onChange={(e) => setCustomService({ ...customService, price: Number(e.target.value) })}
                  InputProps={{
                    startAdornment: <InputAdornment position="start">€</InputAdornment>,
                  }}
                />
              </Grid>
            </Grid>
          </Box>

          {/* Footer du modal */}
          <Box
            sx={{
              p: 3,
              background: 'linear-gradient(135deg, #f5f7fa 0%, #e9ecef 100%)',
              borderTop: '1px solid #dee2e6',
              display: 'flex',
              justifyContent: 'flex-end',
              gap: 2,
            }}
          >
            <Button
              variant="outlined"
              onClick={() => setIsAddModalOpen(false)}
              sx={{
                borderRadius: 2,
                px: 3,
                py: 1,
                fontWeight: 600,
              }}
            >
              Annuler
            </Button>
            <Button
              variant="contained"
              onClick={handleAddCustomService}
              disabled={!customService.code || !customService.label}
              sx={{
                borderRadius: 2,
                px: 3,
                py: 1,
                fontWeight: 600,
                background: 'linear-gradient(135deg, #1976d2 0%, #7b1fa2 100%)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #1565c0 0%, #6a4190 100%)',
                },
              }}
            >
              Ajouter
            </Button>
          </Box>
        </Box>
      </Modal>

      {/* Modal de détails */}
      <Modal
        open={isDetailsModalOpen}
        onClose={handleCloseDetailsModal}
        aria-labelledby="service-details-modal"
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          p: 2,
        }}
      >
        <Box
          sx={{
            position: 'relative',
            width: { xs: '95%', sm: '90%', md: '600px' },
            bgcolor: 'background.paper',
            borderRadius: 3,
            boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
            overflow: 'hidden',
          }}
        >
          {/* Header du modal */}
          <Box
            sx={{
              background: 'linear-gradient(135deg, #1976d2 0%, #7b1fa2 100%)',
              color: 'white',
              p: 3,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)', mr: 2 }}>
                <Build />
              </Avatar>
              <Box>
                <Typography variant="h5" sx={{ fontWeight: 700, mb: 0.5 }}>
                  Détails du service
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                  {selectedServiceForDetails?.label || 'Service'}
                </Typography>
              </Box>
            </Box>
            <IconButton
              onClick={handleCloseDetailsModal}
              sx={{
                color: 'white',
                '&:hover': {
                  backgroundColor: 'rgba(255,255,255,0.1)',
                },
              }}
            >
              <Close />
            </IconButton>
          </Box>

          {/* Contenu du modal */}
          <Box sx={{ p: 3 }}>
            {selectedServiceForDetails && (
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <Card sx={{ mb: 3, borderRadius: 2, boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
                    <CardContent>
                      <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: '#1976d2', display: 'flex', alignItems: 'center' }}>
                        <Business sx={{ mr: 1 }} />
                        Informations du service
                      </Typography>
                      <Grid container spacing={2}>
                        <Grid item xs={12} sm={6}>
                          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                            <Chip 
                              label={selectedServiceForDetails.code} 
                              color="primary" 
                              variant="outlined"
                              sx={{ mr: 1 }}
                            />
                            <Typography variant="body2" sx={{ fontWeight: 600 }}>
                              Code
                            </Typography>
                          </Box>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                            <Typography variant="body2" sx={{ fontWeight: 600 }}>
                              Nom: {selectedServiceForDetails.label}
                            </Typography>
                          </Box>
                        </Grid>
                      </Grid>
                    </CardContent>
                  </Card>
                </Grid>

                <Grid item xs={12}>
                  <Card sx={{ mb: 3, borderRadius: 2, boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
                    <CardContent>
                      <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: '#1976d2', display: 'flex', alignItems: 'center' }}>
                        <AttachMoney sx={{ mr: 1 }} />
                        Tarification
                      </Typography>
                      
                      <Box sx={{ textAlign: 'center', p: 3, background: 'linear-gradient(135deg, #e8f5e8 0%, #c8e6c9 100%)', borderRadius: 2 }}>
                        <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                          Prix du Service
                        </Typography>
                        <Typography variant="h4" sx={{ fontWeight: 700, color: '#2e7d32' }}>
                          {selectedServiceForDetails.basePrice?.toLocaleString(undefined, { maximumFractionDigits: 2 }) || '0.00'} {selectedServiceForDetails.currency || 'EUR'}
                        </Typography>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            )}
          </Box>

          {/* Footer du modal */}
          <Box
            sx={{
              p: 3,
              background: 'linear-gradient(135deg, #f5f7fa 0%, #e9ecef 100%)',
              borderTop: '1px solid #dee2e6',
              display: 'flex',
              justifyContent: 'flex-end',
              gap: 2,
            }}
          >
            <Button
              variant="outlined"
              onClick={handleCloseDetailsModal}
              sx={{
                borderRadius: 2,
                px: 3,
                py: 1,
                fontWeight: 600,
              }}
            >
              Fermer
            </Button>
            {selectedServiceForDetails && (
              <Button
                variant="contained"
                onClick={() => {
                  handleToggleService(selectedServiceForDetails);
                  handleCloseDetailsModal();
                }}
                sx={{
                  borderRadius: 2,
                  px: 3,
                  py: 1,
                  fontWeight: 600,
                  background: 'linear-gradient(135deg, #1976d2 0%, #7b1fa2 100%)',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #1565c0 0%, #6a4190 100%)',
                  },
                }}
              >
                {selectedServiceIds.includes(selectedServiceForDetails.code) ? 'Désélectionner' : 'Sélectionner ce service'}
              </Button>
            )}
          </Box>
        </Box>
      </Modal>
    </Box>
  );
};

export default ServicesSelection;
