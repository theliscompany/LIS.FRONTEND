import React, { useEffect, useState, useMemo, useCallback } from "react";
import {
  Box, Typography, Button, CircularProgress, Alert, TextField, Grid, 
  Autocomplete, Card, CardContent, Pagination, Stack, Chip, Badge, 
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, 
  Paper, Avatar, Fade, Modal, IconButton, Tooltip, Checkbox
} from "@mui/material";
import {
  DirectionsBoat, LocationOn, Euro, AccessTime, 
  CalendarMonth, Route, Category, Repeat, 
  CheckCircle, Business, Visibility, Close,
  AttachMoney, Language, Info, Schedule
} from '@mui/icons-material';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs, { Dayjs } from 'dayjs';
import { useFieldArray, useFormContext } from 'react-hook-form';
import { motion } from 'framer-motion';

import { getApiSeaFreight } from "@features/pricingnew/api/sdk.gen";
import type { SeaFreightResponse } from "@features/pricingnew/api/types.gen";
import PortAutocomplete from '../../../../components/shared/PortAutocomplete';
import { getTEU } from '../../../utils/functions';
import { DraftQuoteForm } from '../schema';

const PAGE_SIZE = 10;

interface SeafreightSelectionProps {
  onUpdate?: (seafreights: any[]) => void;
}

export const SeafreightSelection: React.FC<SeafreightSelectionProps> = ({ onUpdate }) => {
  const { control, watch, setValue, getValues } = useFormContext<DraftQuoteForm>();
  const { fields, append, remove } = useFieldArray({
    control,
    name: 'currentOption.seafreights'
  });
  
  // Watch the current option seafreights directly
  const currentOptionSeafreights = watch('currentOption.seafreights') || [];

  // États pour les données
  const [loading, setLoading] = useState(false);
  const [seafreightOffers, setSeafreightOffers] = useState<SeaFreightResponse[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Utiliser useMemo pour forcer le re-render quand les seafreights changent
  const selectedSeafreightIds = useMemo(() => {
    const ids = currentOptionSeafreights.map(sf => sf.id).filter(Boolean) as string[];
    return ids;
  }, [currentOptionSeafreights]);



  // Filtres
  const [filterDeparturePort, setFilterDeparturePort] = useState<string>('');
  const [filterArrivalPort, setFilterArrivalPort] = useState<string>('');
  const [filterCarrier, setFilterCarrier] = useState<string | null>(null);
  const [filterValidUntil, setFilterValidUntil] = useState<Dayjs | null>(null);
  const [page, setPage] = useState(1);
  const [searchText, setSearchText] = useState('');

  // États pour le modal de détails
  const [selectedOfferForDetails, setSelectedOfferForDetails] = useState<SeaFreightResponse | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);

  // Récupérer les données du formulaire
  const formData = watch('basics');

  // Charger les offres seafreight
  useEffect(() => {
    const fetchSeaFreights = async () => {
      setLoading(true);
      setError(null);
      try {
        console.log('🔍 [SeafreightSelection] Chargement des offres seafreight...');
        // Utiliser l'API GET avec paramètres de pagination
        const res = await getApiSeaFreight({
          query: {
            pageNumber: 1,
            pageSize: 20
          }
        });
        console.log('📦 [SeafreightSelection] Réponse API seafreight:', res);
        
        // Essayer différentes structures de données
        let data: SeaFreightResponse[] = [];
        if (Array.isArray(res?.data?.items)) {
          data = res.data.items;
        } else if (Array.isArray(res?.data)) {
          data = res.data;
        } else if (Array.isArray(res)) {
          data = res;
        } else if (res?.data && typeof res.data === 'object') {
          // Si c'est un objet, essayer d'extraire les données
          data = Object.values(res.data).filter(Array.isArray).flat();
        }
        
        console.log('✅ [SeafreightSelection] Données seafreight extraites:', data);
        setSeafreightOffers(data);
        
        if (data.length === 0) {
          console.warn('⚠️ [SeafreightSelection] Aucune donnée seafreight trouvée');
        }
      } catch (e) {
        console.error('❌ [SeafreightSelection] Erreur lors de la récupération des offres seafreight:', e);
        setError(`Erreur lors de la récupération des offres seafreight: ${e instanceof Error ? e.message : 'Erreur inconnue'}`);
      } finally {
        setLoading(false);
      }
    };
    fetchSeaFreights();
  }, []);

  // Valeurs uniques pour les filtres
  const departureOptions = useMemo(() => 
    Array.from(new Set(seafreightOffers.map(h => h.departurePort?.name).filter(Boolean))), 
    [seafreightOffers]
  );
  const arrivalOptions = useMemo(() => 
    Array.from(new Set(seafreightOffers.map(h => h.arrivalPort?.name).filter(Boolean))), 
    [seafreightOffers]
  );
  const carrierOptions = useMemo(() => 
    Array.from(new Set(seafreightOffers.map(h => h.carrier?.name).filter(Boolean))), 
    [seafreightOffers]
  );

  // Application des filtres
  const filteredOffers = useMemo(() => {
    let offers = seafreightOffers;
    
    if (filterDeparturePort) {
      offers = offers.filter(h => h.departurePort?.name?.toLowerCase() === filterDeparturePort.toLowerCase());
    }
    if (filterArrivalPort) {
      offers = offers.filter(h => h.arrivalPort?.name?.toLowerCase() === filterArrivalPort.toLowerCase());
    }
    if (searchText) {
      const lower = searchText.toLowerCase();
      offers = offers.filter(h =>
        (h.departurePort?.name?.toLowerCase().includes(lower) ||
         h.arrivalPort?.name?.toLowerCase().includes(lower) ||
         h.carrier?.name?.toLowerCase().includes(lower) ||
         h.containerType?.toLowerCase().includes(lower))
      );
    }
    if (filterCarrier) {
      offers = offers.filter(h => h.carrier?.name === filterCarrier);
    }
    if (filterValidUntil) {
      offers = offers.filter(h => {
        if (!h.validity?.endDate) return false;
        const validDate = dayjs(h.validity.endDate);
        return !validDate.isBefore(filterValidUntil, 'day');
      });
    }
    
    return offers;
  }, [seafreightOffers, searchText, filterDeparturePort, filterArrivalPort, filterCarrier, filterValidUntil]);

  // Pagination
  const paginatedOffers = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return filteredOffers.slice(start, start + PAGE_SIZE);
  }, [filteredOffers, page]);

  useEffect(() => {
    setPage(1); // reset page si filtre change
  }, [filterDeparturePort, filterArrivalPort, filterCarrier, filterValidUntil]);

  // Calcul du prix total
  const calculateTotalPrice = (charges: any | undefined, currency: string | null | undefined) => {
    if (!charges) return { total: 0, currency: currency || '' };
    
    let total = 0;
    
    if (typeof charges.basePrice === 'number') {
      total += charges.basePrice;
    }
    
    if (Array.isArray(charges.surcharges)) {
      charges.surcharges.forEach((surcharge: any) => {
        if (typeof surcharge.value === 'number') {
          total += surcharge.value;
        }
      });
    }
    
    if (total === 0) {
      total = (charges.baseFreight || 0) + (charges.baf || 0) + (charges.caf || 0) + 
              (charges.thcOrigin || 0) + (charges.thcDestination || 0) + (charges.otherCharges || 0);
    }
    
    if (typeof charges.total === 'number' && charges.total > 0) {
      total = charges.total;
    }
    
    return { total, currency: currency || '' };
  };

  // Handler pour sélectionner/désélectionner
  const handleToggleSeafreight = useCallback((offer: SeaFreightResponse) => {
    const offerId = offer.id || '';
    
    if (!offerId) {
      return;
    }

    const isCurrentlySelected = selectedSeafreightIds.includes(offerId);

    // Mettre à jour le formulaire
    if (isCurrentlySelected) {
      // Supprimer de la liste
      const updatedSeafreights = currentOptionSeafreights.filter(sf => sf.id !== offerId);
      setValue('currentOption.seafreights', updatedSeafreights);
    } else {
      // Ajouter à la liste
      const seafreightData = {
        id: offerId,
        carrier: offer.carrier?.name || '',
        service: offer.frequency || '',
        etd: undefined,
        eta: undefined,
        rates: [{
          containerType: offer.containerType || '',
          basePrice: calculateTotalPrice(offer.charges, offer.currency).total
        }]
      };
      const updatedSeafreights = [...currentOptionSeafreights, seafreightData];
      setValue('currentOption.seafreights', updatedSeafreights);
    }

    // Notifier le parent
    if (onUpdate) {
      const newSeafreights = getValues('currentOption.seafreights') || [];
      onUpdate(newSeafreights);
    }
  }, [selectedSeafreightIds, currentOptionSeafreights, setValue, getValues, onUpdate, calculateTotalPrice]);

  // Fonctions pour le modal de détails
  const handleOpenDetailsModal = (offer: SeaFreightResponse) => {
    setSelectedOfferForDetails(offer);
    setIsDetailsModalOpen(true);
  };

  const handleCloseDetailsModal = () => {
    setIsDetailsModalOpen(false);
    setSelectedOfferForDetails(null);
  };

  const selectedCount = selectedSeafreightIds.length;

  return (
    <Box>
      {/* Filtres */}
      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <Card sx={{ 
            mb: 3, 
            borderRadius: 3, 
            boxShadow: '0 8px 32px rgba(25,118,210,0.1)', 
            p: 3,
            background: 'linear-gradient(145deg, #ffffff 0%, #f8f9fa 100%)',
            border: '1px solid rgba(0,0,0,0.05)',
            overflow: 'hidden'
          }}>
            <Box sx={{
              background: 'linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)',
              p: 2,
              mb: 3,
              color: 'white',
              borderRadius: 2
            }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <DirectionsBoat sx={{ fontSize: 28 }} />
                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                  🔍 Filtres de recherche
                </Typography>
              </Box>
              <Typography variant="body2" sx={{ opacity: 0.9, mt: 0.5 }}>
                Affinez votre recherche d'offres maritimes
              </Typography>
            </Box>
            
            <Grid container spacing={3} alignItems="center">
              <Grid item xs={12} sm={6} md={3}>
                <Box sx={{
                  p: 2,
                  borderRadius: 2,
                  background: 'linear-gradient(135deg, #e3f2fd 0%, #f3e5f5 100%)',
                  border: '1px solid rgba(25, 118, 210, 0.2)'
                }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#1976d2', mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                    🚢 Port de départ
                  </Typography>
                  <PortAutocomplete
                    label="Sélectionner le port de départ"
                    value={filterDeparturePort ? { name: filterDeparturePort } : null}
                    onChange={port => setFilterDeparturePort(port?.name || '')}
                  />
                </Box>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Box sx={{
                  p: 2,
                  borderRadius: 2,
                  background: 'linear-gradient(135deg, #e8f5e8 0%, #f1f8e9 100%)',
                  border: '1px solid rgba(76, 175, 80, 0.2)'
                }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#2e7d32', mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                    🎯 Port d'arrivée
                  </Typography>
                  <PortAutocomplete
                    label="Sélectionner le port d'arrivée"
                    value={filterArrivalPort ? { name: filterArrivalPort } : null}
                    onChange={port => setFilterArrivalPort(port?.name || '')}
                  />
                </Box>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Box sx={{
                  p: 2,
                  borderRadius: 2,
                  background: 'linear-gradient(135deg, #fff3e0 0%, #fce4ec 100%)',
                  border: '1px solid rgba(255, 152, 0, 0.2)'
                }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#f57c00', mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                    🏢 Transporteur
                  </Typography>
                  <Autocomplete
                    options={carrierOptions}
                    value={filterCarrier}
                    onChange={(_, value) => setFilterCarrier((value ?? null) as string | null)}
                    renderInput={(params) => <TextField {...params} label="Sélectionner un transporteur" variant="outlined" size="small" />}
                    clearOnEscape
                    isOptionEqualToValue={(option, value) => option === value}
                  />
                </Box>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Box sx={{
                  p: 2,
                  borderRadius: 2,
                  background: 'linear-gradient(135deg, #f3e5f5 0%, #e1f5fe 100%)',
                  border: '1px solid rgba(156, 39, 176, 0.2)'
                }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#7b1fa2', mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                    📅 Validité
                  </Typography>
                  <DatePicker
                    label="Valide jusqu'au"
                    value={filterValidUntil}
                    onChange={setFilterValidUntil}
                    slotProps={{ textField: { size: 'small', variant: 'outlined' } }}
                    format="DD/MM/YYYY"
                  />
                </Box>
              </Grid>
            </Grid>
          </Card>
        </motion.div>
      </LocalizationProvider>

      {/* Barre de recherche */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        <Box sx={{ mb: 3 }}>
          <Card sx={{
            borderRadius: 3,
            boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
            background: 'linear-gradient(145deg, #ffffff 0%, #f8f9fa 100%)',
            border: '1px solid rgba(0,0,0,0.05)',
            overflow: 'hidden'
          }}>
            <Box sx={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              p: 2,
              color: 'white'
            }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Schedule sx={{ fontSize: 24 }} />
                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                  🔍 Recherche avancée
                </Typography>
              </Box>
            </Box>
            <Box sx={{ p: 3 }}>
              <TextField
                fullWidth
                size="medium"
                variant="outlined"
                placeholder="Rechercher par port, transporteur, container, prix..."
                value={searchText}
                onChange={e => setSearchText(e.target.value)}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                    fontSize: '1.1rem',
                    '&:hover': {
                      '& .MuiOutlinedInput-notchedOutline': {
                        borderColor: '#1976d2',
                        borderWidth: 2
                      }
                    },
                    '&.Mui-focused': {
                      '& .MuiOutlinedInput-notchedOutline': {
                        borderColor: '#1976d2',
                        borderWidth: 2
                      }
                    }
                  }
                }}
                InputProps={{
                  startAdornment: (
                    <Box sx={{ mr: 1, color: '#1976d2' }}>
                      <Schedule />
                    </Box>
                  )
                }}
              />
            </Box>
          </Card>
        </Box>
      </motion.div>

      {/* Alerte sélection */}
      <Fade in={selectedSeafreightIds.length > 0} timeout={400}>
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
        >
          <Alert 
            severity="success" 
            sx={{ 
              mb: 3,
              borderRadius: 3,
              background: 'linear-gradient(135deg, #e8f5e8 0%, #c8e6c9 100%)',
              border: '1px solid rgba(76, 175, 80, 0.3)',
              boxShadow: '0 4px 20px rgba(76, 175, 80, 0.2)'
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <CheckCircle sx={{ color: '#2e7d32', fontSize: 28 }} />
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 700, color: '#2e7d32' }}>
                  🎉 {selectedSeafreightIds.length} offre(s) maritime(s) sélectionnée(s)
                </Typography>
                <Typography variant="body2" sx={{ color: '#2e7d32', opacity: 0.8 }}>
                  Vos sélections seront incluses dans votre devis
                </Typography>
              </Box>
            </Box>
          </Alert>
        </motion.div>
      </Fade>

      {/* Liste des offres */}
      {loading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          <Box sx={{ display: 'flex', justifyContent: 'center', my: 6 }}>
            <Card sx={{
              p: 4,
              borderRadius: 3,
              background: 'linear-gradient(145deg, #ffffff 0%, #f8f9fa 100%)',
              boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
              textAlign: 'center'
            }}>
              <CircularProgress size={60} sx={{ color: '#1976d2', mb: 2 }} />
              <Typography variant="h6" sx={{ fontWeight: 600, color: '#1976d2' }}>
                🚢 Chargement des offres maritimes...
              </Typography>
            </Card>
          </Box>
        </motion.div>
      )}
      
      {error && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
        >
          <Alert 
            severity="error" 
            sx={{ 
              mb: 3,
              borderRadius: 3,
              background: 'linear-gradient(135deg, #ffebee 0%, #ffcdd2 100%)',
              border: '1px solid rgba(244, 67, 54, 0.3)',
              boxShadow: '0 4px 20px rgba(244, 67, 54, 0.2)'
            }}
          >
            <Typography variant="h6" sx={{ fontWeight: 700, color: '#d32f2f' }}>
              ❌ {error}
            </Typography>
          </Alert>
        </motion.div>
      )}
      
      {!loading && !error && paginatedOffers.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <Card sx={{ 
            borderRadius: 3, 
            boxShadow: '0 12px 40px rgba(25,118,210,0.15)', 
            background: 'linear-gradient(145deg, #e3f2fd 0%, #f3e5f5 100%)',
            border: '1px solid rgba(25, 118, 210, 0.1)',
            overflow: 'hidden'
          }}>
            <Box sx={{
              background: 'linear-gradient(135deg, #1976d2 0%, #7b1fa2 100%)',
              p: 3,
              color: 'white'
            }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Badge 
                    color="secondary" 
                    badgeContent={selectedCount} 
                    showZero 
                    sx={{ 
                      '& .MuiBadge-badge': {
                        background: 'linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%)',
                        fontWeight: 700,
                        fontSize: '0.9rem'
                      }
                    }}
                  >
                    <Avatar sx={{ 
                      bgcolor: 'rgba(255,255,255,0.2)', 
                      width: 56, 
                      height: 56,
                      boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
                    }}>
                      <DirectionsBoat sx={{ fontSize: 32 }} />
                    </Avatar>
                  </Badge>
                  <Box>
                    <Typography variant="h5" sx={{ fontWeight: 700, mb: 0.5 }}>
                      🚢 Offres maritimes disponibles
                    </Typography>
                    <Typography variant="body1" sx={{ opacity: 0.9 }}>
                      {selectedCount > 0 
                        ? `${selectedCount} offre${selectedCount > 1 ? 's' : ''} sélectionnée${selectedCount > 1 ? 's' : ''} sur ${paginatedOffers.length}`
                        : `${paginatedOffers.length} offre${paginatedOffers.length > 1 ? 's' : ''} trouvée${paginatedOffers.length > 1 ? 's' : ''}`
                      }
                    </Typography>
                  </Box>
                </Box>
                <Chip
                  label={`Page ${page} sur ${Math.ceil(filteredOffers.length / PAGE_SIZE)}`}
                  sx={{
                    background: 'rgba(255,255,255,0.2)',
                    color: 'white',
                    fontWeight: 600,
                    fontSize: '0.9rem'
                  }}
                />
              </Box>
            </Box>
            
            <CardContent sx={{ p: 0 }}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.6 }}
              >
                <TableContainer component={Paper} sx={{ 
                  borderRadius: 0, 
                  overflowX: 'auto', 
                  background: '#fff',
                  boxShadow: 'none'
                }}>
                <Table size="medium">
                  <TableHead>
                    <TableRow sx={{ 
                      background: 'linear-gradient(135deg, #1976d2 0%, #7b1fa2 100%)',
                      '& .MuiTableCell-head': {
                        borderBottom: 'none'
                      }
                    }}>
                      <TableCell sx={{ color: '#fff', fontWeight: 700, fontSize: '0.9rem', py: 2 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <CheckCircle sx={{ fontSize: 20 }} />
                          Sélection
                        </Box>
                      </TableCell>
                      <TableCell sx={{ color: '#fff', fontWeight: 700, fontSize: '0.9rem', py: 2 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Business sx={{ fontSize: 20 }} />
                          Transporteur
                        </Box>
                      </TableCell>
                      <TableCell sx={{ color: '#fff', fontWeight: 700, fontSize: '0.9rem', py: 2 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <LocationOn sx={{ fontSize: 20, color: '#ff6b6b' }} />
                          Port départ
                        </Box>
                      </TableCell>
                      <TableCell sx={{ color: '#fff', fontWeight: 700, fontSize: '0.9rem', py: 2 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <LocationOn sx={{ fontSize: 20, color: '#4ecdc4' }} />
                          Port arrivée
                        </Box>
                      </TableCell>
                      <TableCell sx={{ color: '#fff', fontWeight: 700, fontSize: '0.9rem', py: 2 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Category sx={{ fontSize: 20 }} />
                          Container
                        </Box>
                      </TableCell>
                      <TableCell sx={{ color: '#fff', fontWeight: 700, fontSize: '0.9rem', py: 2 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Euro sx={{ fontSize: 20 }} />
                          Prix base
                        </Box>
                      </TableCell>
                      <TableCell sx={{ color: '#fff', fontWeight: 700, fontSize: '0.9rem', py: 2 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <AttachMoney sx={{ fontSize: 20 }} />
                          Total
                        </Box>
                      </TableCell>
                      <TableCell sx={{ color: '#fff', fontWeight: 700, fontSize: '0.9rem', py: 2 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <CalendarMonth sx={{ fontSize: 20 }} />
                          Valide jusqu'au
                        </Box>
                      </TableCell>
                      <TableCell sx={{ color: '#fff', fontWeight: 700, fontSize: '0.9rem', py: 2 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <AccessTime sx={{ fontSize: 20 }} />
                          Transit
                        </Box>
                      </TableCell>
                      <TableCell sx={{ color: '#fff', fontWeight: 700, fontSize: '0.9rem', py: 2 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Repeat sx={{ fontSize: 20 }} />
                          Fréquence
                        </Box>
                      </TableCell>
                      <TableCell align="center" sx={{ color: '#fff', fontWeight: 700, fontSize: '0.9rem', py: 2 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
                          <CheckCircle sx={{ fontSize: 20 }} />
                          Actions
                        </Box>
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {paginatedOffers.map((offer, idx) => {
                      const offerId = offer.id || '';
                      const isSelected = selectedSeafreightIds.includes(offerId);
                      const totalPrice = calculateTotalPrice(offer.charges, offer.currency || undefined);
                      
                      return (
                        <TableRow 
                          key={offer.id ?? idx.toString()}
                          hover 
                          selected={isSelected} 
                          sx={{
                            transition: 'all 0.3s ease',
                            background: isSelected 
                              ? 'linear-gradient(135deg, #e3f2fd 0%, #f3e5f5 100%)' 
                              : 'transparent',
                            borderLeft: isSelected ? '6px solid #1976d2' : '6px solid transparent',
                            '&:hover': {
                              background: isSelected 
                                ? 'linear-gradient(135deg, #e3f2fd 0%, #f3e5f5 100%)' 
                                : 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
                              transform: 'translateY(-2px)',
                              boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                            }
                          }}
                        >
                            <TableCell padding="checkbox" sx={{ py: 2 }}>
                              <Checkbox
                                color="primary"
                                checked={isSelected}
                                onChange={() => handleToggleSeafreight(offer)}
                                inputProps={{ 'aria-label': 'select seafreight offer' }}
                                sx={{
                                  '&.Mui-checked': {
                                    color: '#1976d2'
                                  }
                                }}
                              />
                            </TableCell>
                            <TableCell sx={{ py: 2 }}>
                              <Chip
                                label={offer.carrier?.name || '-'}
                                color="primary"
                                variant="outlined"
                                sx={{
                                  fontWeight: 600,
                                  background: isSelected 
                                    ? 'linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)'
                                    : 'rgba(25, 118, 210, 0.1)',
                                  color: isSelected ? 'white' : '#1976d2',
                                  border: 'none'
                                }}
                              />
                            </TableCell>
                            <TableCell sx={{ py: 2 }}>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <LocationOn sx={{ color: '#ff6b6b', fontSize: 16 }} />
                                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                  {offer.departurePort?.name || '-'}
                                </Typography>
                              </Box>
                            </TableCell>
                            <TableCell sx={{ py: 2 }}>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <LocationOn sx={{ color: '#4ecdc4', fontSize: 16 }} />
                                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                  {offer.arrivalPort?.name || '-'}
                                </Typography>
                              </Box>
                            </TableCell>
                            <TableCell sx={{ py: 2 }}>
                              <Chip
                                label={offer.containerType || '-'}
                                size="small"
                                sx={{
                                  background: 'linear-gradient(135deg, #9c27b0 0%, #e91e63 100%)',
                                  color: 'white',
                                  fontWeight: 600
                                }}
                              />
                            </TableCell>
                            <TableCell sx={{ py: 2 }}>
                              <Typography variant="body2" sx={{ fontWeight: 600, color: '#2e7d32' }}>
                                {offer.charges?.basePrice?.toLocaleString(undefined, { maximumFractionDigits: 2 }) || '-'} {offer.currency || ''}
                              </Typography>
                            </TableCell>
                            <TableCell sx={{ py: 2 }}>
                              <Tooltip
                                title={
                                  <div>
                                    <div>Base freight : {offer.charges?.basePrice?.toLocaleString(undefined, { maximumFractionDigits: 2 })} {offer.currency || ''}</div>
                                    {Array.isArray(offer.charges?.surcharges) && offer.charges.surcharges.length > 0 && offer.charges.surcharges.map((s: any, idx: number) => (
                                      <div key={idx}>
                                        {s.name || s.type} : {(s.amount || s.value || 0).toLocaleString(undefined, { maximumFractionDigits: 2 })} {s.currency || offer.currency || ''}
                                      </div>
                                    ))}
                                    <div style={{ fontWeight: 700, marginTop: 4 }}>
                                      Total : {typeof offer.charges?.total === 'number' ? offer.charges.total.toLocaleString(undefined, { maximumFractionDigits: 2 }) : '-'} {offer.currency || ''}
                                    </div>
                                  </div>
                                }
                                arrow
                                placement="top"
                              >
                                <Chip
                                  label={`${typeof offer.charges?.total === 'number'
                                    ? offer.charges.total.toLocaleString(undefined, { maximumFractionDigits: 2 })
                                    : '-'} ${offer.currency || ''}`}
                                  sx={{
                                    background: 'linear-gradient(135deg, #2e7d32 0%, #4caf50 100%)',
                                    color: 'white',
                                    fontWeight: 700,
                                    cursor: 'pointer'
                                  }}
                                />
                              </Tooltip>
                            </TableCell>
                            <TableCell sx={{ py: 2 }}>
                              <Typography variant="body2" sx={{ fontWeight: 600, color: '#f57c00' }}>
                                {offer.validity?.endDate ? (dayjs(offer.validity.endDate).isValid() ? dayjs(offer.validity.endDate).format('DD/MM/YYYY') : '-') : '-'}
                              </Typography>
                            </TableCell>
                            <TableCell sx={{ py: 2 }}>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <AccessTime sx={{ color: '#1976d2', fontSize: 16 }} />
                                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                  {offer.transitTimeDays ?? '-'} jours
                                </Typography>
                              </Box>
                            </TableCell>
                            <TableCell sx={{ py: 2 }}>
                              <Chip
                                label={offer.frequency ?? '-'}
                                size="small"
                                sx={{
                                  background: 'linear-gradient(135deg, #ff9800 0%, #ff5722 100%)',
                                  color: 'white',
                                  fontWeight: 600
                                }}
                              />
                            </TableCell>
                            <TableCell align="center" sx={{ py: 2 }}>
                              <Stack direction="row" spacing={1} justifyContent="center">
                                <Button
                                  variant={isSelected ? "contained" : "outlined"}
                                  color="primary"
                                  size="small"
                                  onClick={() => handleToggleSeafreight(offer)}
                                  sx={{ 
                                    fontWeight: 600, 
                                    minWidth: 100,
                                    borderRadius: 2,
                                    textTransform: 'none',
                                    background: isSelected 
                                      ? 'linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)'
                                      : 'transparent',
                                    borderColor: '#1976d2',
                                    '&:hover': {
                                      background: isSelected 
                                        ? 'linear-gradient(135deg, #1565c0 0%, #1976d2 100%)'
                                        : 'rgba(25, 118, 210, 0.1)',
                                      transform: 'translateY(-2px)',
                                      boxShadow: '0 4px 12px rgba(25, 118, 210, 0.3)'
                                    },
                                    transition: 'all 0.3s ease'
                                  }}
                                >
                                  {isSelected ? '✅ Sélectionné' : '➕ Sélectionner'}
                                </Button>
                                <Tooltip title="Voir les détails" arrow>
                                  <IconButton
                                    size="small"
                                    onClick={() => handleOpenDetailsModal(offer)}
                                    sx={{
                                      color: '#1976d2',
                                      background: 'rgba(25, 118, 210, 0.1)',
                                      '&:hover': {
                                        backgroundColor: 'rgba(25, 118, 210, 0.2)',
                                        transform: 'scale(1.1)',
                                        boxShadow: '0 4px 12px rgba(25, 118, 210, 0.3)'
                                      },
                                      transition: 'all 0.3s ease'
                                    }}
                                  >
                                    <Visibility fontSize="small" />
                                  </IconButton>
                                </Tooltip>
                              </Stack>
                            </TableCell>
                          </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </TableContainer>
              </motion.div>

              <Box sx={{ 
                display: 'flex', 
                justifyContent: 'center', 
                p: 3,
                background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
                borderTop: '1px solid rgba(0,0,0,0.1)'
              }}>
                <Pagination
                  count={Math.ceil(filteredOffers.length / PAGE_SIZE)}
                  page={page}
                  onChange={(_, value) => setPage(value)}
                  color="primary"
                  shape="rounded"
                  size="large"
                  sx={{
                    '& .MuiPaginationItem-root': {
                      fontWeight: 600,
                      '&.Mui-selected': {
                        background: 'linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)',
                        color: 'white',
                        boxShadow: '0 4px 12px rgba(25, 118, 210, 0.3)'
                      },
                      '&:hover': {
                        background: 'rgba(25, 118, 210, 0.1)',
                        transform: 'scale(1.1)'
                      },
                      transition: 'all 0.3s ease'
                    }
                  }}
                />
              </Box>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {!loading && !error && paginatedOffers.length === 0 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
        >
          <Box sx={{ mt: 4 }}>
            <Card sx={{
              borderRadius: 3,
              boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
              background: 'linear-gradient(145deg, #ffffff 0%, #f8f9fa 100%)',
              border: '1px solid rgba(0,0,0,0.05)',
              textAlign: 'center',
              p: 4
            }}>
              <DirectionsBoat sx={{ fontSize: 64, color: '#e0e0e0', mb: 2 }} />
              <Typography variant="h5" sx={{ fontWeight: 700, color: '#666', mb: 1 }}>
                🚢 Aucune offre maritime trouvée
              </Typography>
              <Typography variant="body1" sx={{ color: '#999' }}>
                Essayez de modifier vos critères de recherche pour voir plus d'offres
              </Typography>
            </Card>
          </Box>
        </motion.div>
      )}

      {/* Modal de détails */}
      <Modal
        open={isDetailsModalOpen}
        onClose={handleCloseDetailsModal}
        aria-labelledby="seafreight-details-modal"
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
            width: { xs: '95%', sm: '90%', md: '80%', lg: '70%' },
            maxWidth: 1000,
            maxHeight: '90vh',
            bgcolor: 'background.paper',
            borderRadius: 3,
            boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
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
                <DirectionsBoat />
              </Avatar>
              <Box>
                <Typography variant="h5" sx={{ fontWeight: 700, mb: 0.5 }}>
                  Détails de l'offre maritime
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                  {selectedOfferForDetails?.carrier?.name || 'Transporteur'} - {selectedOfferForDetails?.containerType || 'Container'}
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
          <Box sx={{ p: 3, overflow: 'auto', flex: 1 }}>
            {selectedOfferForDetails && (
              <Grid container spacing={3}>
                {/* Informations générales */}
                <Grid item xs={12} md={6}>
                  <Card sx={{ mb: 3, borderRadius: 2, boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
                    <CardContent>
                      <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: '#1976d2', display: 'flex', alignItems: 'center' }}>
                        <Business sx={{ mr: 1 }} />
                        Informations générales
                      </Typography>
                      <Grid container spacing={2}>
                        <Grid item xs={12}>
                          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                            <DirectionsBoat sx={{ color: '#1976d2', mr: 1, fontSize: '1.2em' }} />
                            <Typography variant="body2" sx={{ fontWeight: 600 }}>
                              Transporteur: {selectedOfferForDetails.carrier?.name || '-'}
                            </Typography>
                          </Box>
                        </Grid>
                        <Grid item xs={12}>
                          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                            <Category sx={{ color: '#9b59b6', mr: 1, fontSize: '1.2em' }} />
                            <Typography variant="body2" sx={{ fontWeight: 600 }}>
                              Type de container: {selectedOfferForDetails.containerType || '-'}
                            </Typography>
                          </Box>
                        </Grid>
                        <Grid item xs={12}>
                          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                            <Language sx={{ color: '#27ae60', mr: 1, fontSize: '1.2em' }} />
                            <Typography variant="body2" sx={{ fontWeight: 600 }}>
                              Devise: {selectedOfferForDetails.currency || 'EUR'}
                            </Typography>
                          </Box>
                        </Grid>
                        <Grid item xs={12}>
                          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                            <Repeat sx={{ color: '#e67e22', mr: 1, fontSize: '1.2em' }} />
                            <Typography variant="body2" sx={{ fontWeight: 600 }}>
                              Fréquence: {selectedOfferForDetails.frequency || '-'}
                            </Typography>
                          </Box>
                        </Grid>
                      </Grid>
                    </CardContent>
                  </Card>
                </Grid>

                {/* Route et ports */}
                <Grid item xs={12} md={6}>
                  <Card sx={{ mb: 3, borderRadius: 2, boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
                    <CardContent>
                      <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: '#1976d2', display: 'flex', alignItems: 'center' }}>
                        <Route sx={{ mr: 1 }} />
                        Route et ports
                      </Typography>
                      <Grid container spacing={2}>
                        <Grid item xs={12}>
                          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                            <LocationOn sx={{ color: '#e74c3c', mr: 1, fontSize: '1.2em' }} />
                            <Typography variant="body2" sx={{ fontWeight: 600 }}>
                              Port de départ: {selectedOfferForDetails.departurePort?.name || '-'}
                            </Typography>
                          </Box>
                        </Grid>
                        <Grid item xs={12}>
                          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                            <LocationOn sx={{ color: '#27ae60', mr: 1, fontSize: '1.2em' }} />
                            <Typography variant="body2" sx={{ fontWeight: 600 }}>
                              Port d'arrivée: {selectedOfferForDetails.arrivalPort?.name || '-'}
                            </Typography>
                          </Box>
                        </Grid>
                        <Grid item xs={12}>
                          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                            <AccessTime sx={{ color: '#f39c12', mr: 1, fontSize: '1.2em' }} />
                            <Typography variant="body2" sx={{ fontWeight: 600 }}>
                              Temps de transit: {selectedOfferForDetails.transitTimeDays || '-'} jours
                            </Typography>
                          </Box>
                        </Grid>
                      </Grid>
                    </CardContent>
                  </Card>
                </Grid>

                {/* Tarification détaillée */}
                <Grid item xs={12}>
                  <Card sx={{ mb: 3, borderRadius: 2, boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
                    <CardContent>
                      <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: '#1976d2', display: 'flex', alignItems: 'center' }}>
                        <AttachMoney sx={{ mr: 1 }} />
                        Tarification détaillée
                      </Typography>
                      
                      <Grid container spacing={3}>
                        {/* Prix de base */}
                        <Grid item xs={12} md={4}>
                          <Box sx={{ textAlign: 'center', p: 2, background: 'linear-gradient(135deg, #e8f5e8 0%, #c8e6c9 100%)', borderRadius: 2 }}>
                            <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                              Prix de Base
                            </Typography>
                            <Typography variant="h5" sx={{ fontWeight: 700, color: '#2e7d32' }}>
                              {selectedOfferForDetails.charges?.basePrice?.toLocaleString(undefined, { maximumFractionDigits: 2 }) || '0.00'} {selectedOfferForDetails.currency || 'EUR'}
                            </Typography>
                          </Box>
                        </Grid>

                        {/* Surcharges */}
                        <Grid item xs={12} md={4}>
                          <Box sx={{ textAlign: 'center', p: 2, background: 'linear-gradient(135deg, #fff3e0 0%, #ffe0b2 100%)', borderRadius: 2 }}>
                            <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                              Surcharges ({selectedOfferForDetails.charges?.surcharges?.length || 0})
                            </Typography>
                            <Typography variant="h5" sx={{ fontWeight: 700, color: '#e65100' }}>
                              {(() => {
                                const surcharges = selectedOfferForDetails.charges?.surcharges || [];
                                const totalSurcharges = surcharges.reduce((sum: number, s: any) => sum + (s.value || 0), 0);
                                return `${totalSurcharges.toLocaleString(undefined, { maximumFractionDigits: 2 })} ${selectedOfferForDetails.currency || 'EUR'}`;
                              })()}
                            </Typography>
                          </Box>
                        </Grid>

                        {/* Total */}
                        <Grid item xs={12} md={4}>
                          <Box sx={{ textAlign: 'center', p: 2, background: 'linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%)', borderRadius: 2 }}>
                            <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                              Total Final
                            </Typography>
                            <Typography variant="h5" sx={{ fontWeight: 700, color: '#1565c0' }}>
                              {(() => {
                                const total = calculateTotalPrice(selectedOfferForDetails.charges, selectedOfferForDetails.currency).total;
                                return `${total.toLocaleString(undefined, { maximumFractionDigits: 2 })} ${selectedOfferForDetails.currency || 'EUR'}`;
                              })()}
                            </Typography>
                          </Box>
                        </Grid>
                      </Grid>
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
            {selectedOfferForDetails && (
              <Button
                variant="contained"
                onClick={() => {
                  handleToggleSeafreight(selectedOfferForDetails);
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
                {selectedSeafreightIds.includes(selectedOfferForDetails.id || '') ? 'Désélectionner' : 'Sélectionner cette offre'}
              </Button>
            )}
          </Box>
        </Box>
      </Modal>
    </Box>
  );
};

export default SeafreightSelection;
