import React, { useEffect, useState, useMemo, useCallback } from "react";
import {
  Box, Typography, Button, CircularProgress, Alert, TextField, Grid, 
  Autocomplete, Card, CardContent, Pagination, Stack, Chip, Badge, 
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, 
  Paper, Avatar, Fade, Modal, IconButton, Tooltip, Checkbox, FormControl, 
  InputLabel, Select, MenuItem
} from "@mui/material";
import {
  DirectionsCar, LocationOn, Euro, AccessTime, 
  Category, CheckCircle, Business, Visibility, Close,
  AttachMoney, Language, Info, Schedule, LocalShipping, Route
} from '@mui/icons-material';
import { useFieldArray, useFormContext } from 'react-hook-form';
import { motion } from 'framer-motion';

import { getApiHaulage } from "@features/pricingnew/api/sdk.gen";
import type { HaulageResponse } from "@features/pricingnew/api/types.gen";
import { DraftQuoteForm } from '../schema';

const PAGE_SIZE = 10;

// Options pour les phases de transport
const haulageLegs = [
  { value: 'pre', label: 'Pré-transport', icon: '📦' },
  { value: 'on', label: 'Transport principal', icon: '🚛' },
  { value: 'post', label: 'Post-transport', icon: '📦' }
];

interface HaulageSelectionProps {
  onUpdate?: (haulages: any[]) => void;
}

export const HaulageSelection: React.FC<HaulageSelectionProps> = ({ onUpdate }) => {
  const { control, watch, setValue, getValues } = useFormContext<DraftQuoteForm>();
  const { fields, append, remove } = useFieldArray({
    control,
    name: 'currentOption.haulages'
  });
  
  // Watch the current option haulages directly
  const currentOptionHaulages = watch('currentOption.haulages') || [];

  // États pour les données
  const [loading, setLoading] = useState(false);
  const [haulageOffers, setHaulageOffers] = useState<HaulageResponse[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Utiliser useMemo pour forcer le re-render quand les haulages changent
  const selectedHaulageIds = useMemo(() => {
    const ids = currentOptionHaulages.map(h => h.id).filter(Boolean) as string[];
    return ids;
  }, [currentOptionHaulages]);



  // Filtres
  const [filterLeg, setFilterLeg] = useState<string | null>(null);
  const [filterFrom, setFilterFrom] = useState<string>('');
  const [filterTo, setFilterTo] = useState<string>('');
  const [page, setPage] = useState(1);
  const [searchText, setSearchText] = useState('');

  // États pour le modal de détails
  const [selectedOfferForDetails, setSelectedOfferForDetails] = useState<HaulageResponse | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);

  // Récupérer les données du formulaire
  const formData = watch('basics');

  // Charger les offres haulage
  useEffect(() => {
    const fetchHaulages = async () => {
      setLoading(true);
      setError(null);
      try {
        console.log('🔍 [HaulageSelection] Chargement des offres haulage...');
        // Utiliser l'API GET simple
        const res = await getApiHaulage();
        console.log('📦 [HaulageSelection] Réponse API haulage complète:', res);
        console.log('📦 [HaulageSelection] Type de res:', typeof res);
        console.log('📦 [HaulageSelection] res.data:', res?.data);
        console.log('📦 [HaulageSelection] res.data type:', typeof res?.data);
        console.log('📦 [HaulageSelection] res.data keys:', res?.data ? Object.keys(res.data) : 'N/A');
        
        // Essayer différentes structures de données
        let data: HaulageResponse[] = [];
        if (Array.isArray(res?.data?.items)) {
          console.log('✅ [HaulageSelection] Données trouvées dans res.data.items');
          data = res.data.items;
        } else if (Array.isArray(res?.data)) {
          console.log('✅ [HaulageSelection] Données trouvées dans res.data');
          data = res.data;
        } else if (Array.isArray(res)) {
          console.log('✅ [HaulageSelection] Données trouvées directement dans res');
          data = res;
        } else if (res?.data && typeof res.data === 'object') {
          console.log('✅ [HaulageSelection] Tentative d\'extraction depuis objet res.data');
          // Si c'est un objet, essayer d'extraire les données
          data = Object.values(res.data).filter(Array.isArray).flat();
        } else {
          console.log('❌ [HaulageSelection] Structure de données non reconnue');
          console.log('❌ [HaulageSelection] Structure complète:', JSON.stringify(res, null, 2));
        }
        
        console.log('✅ [HaulageSelection] Données haulage extraites:', data);
        console.log('✅ [HaulageSelection] Nombre d\'éléments:', data.length);
        
        // Log de la structure du premier élément pour debug
        if (data.length > 0) {
          console.log('🔍 [HaulageSelection] Structure du premier élément:', data[0]);
          console.log('🔍 [HaulageSelection] Clés du premier élément:', Object.keys(data[0]));
        }
        
        setHaulageOffers(data);
        
        if (data.length === 0) {
          console.warn('⚠️ [HaulageSelection] Aucune donnée haulage trouvée');
        }
      } catch (e) {
        console.error('❌ [HaulageSelection] Erreur lors de la récupération des offres haulage:', e);
        setError(`Erreur lors de la récupération des offres haulage: ${e instanceof Error ? e.message : 'Erreur inconnue'}`);
      } finally {
        setLoading(false);
      }
    };
    fetchHaulages();
  }, []);

  // Valeurs uniques pour les filtres
  const legOptions = useMemo(() => 
    Array.from(new Set(haulageOffers.map(h => h.deliveryTerms).filter(Boolean))), 
    [haulageOffers]
  );
  const fromOptions = useMemo(() => 
    Array.from(new Set(haulageOffers.map(h => h.pickupLocation?.displayName || h.loadingLocation?.displayName).filter(Boolean))), 
    [haulageOffers]
  );
  const toOptions = useMemo(() => 
    Array.from(new Set(haulageOffers.map(h => h.deliveryLocation?.displayName).filter(Boolean))), 
    [haulageOffers]
  );

  // Application des filtres
  const filteredOffers = useMemo(() => {
    let offers = haulageOffers;
    
    if (filterLeg) {
      offers = offers.filter(h => h.deliveryTerms === filterLeg);
    }
    if (filterFrom) {
      offers = offers.filter(h => 
        (h.pickupLocation?.displayName || h.loadingLocation?.displayName || '').toLowerCase().includes(filterFrom.toLowerCase())
      );
    }
    if (filterTo) {
      offers = offers.filter(h => 
        (h.deliveryLocation?.displayName || '').toLowerCase().includes(filterTo.toLowerCase())
      );
    }
    if (searchText) {
      const lower = searchText.toLowerCase();
      offers = offers.filter(h =>
        ((h.pickupLocation?.displayName || h.loadingLocation?.displayName || '').toLowerCase().includes(lower) ||
         (h.deliveryLocation?.displayName || '').toLowerCase().includes(lower) ||
         (h.haulierName || '').toLowerCase().includes(lower) ||
         (h.deliveryTerms || '').toLowerCase().includes(lower) ||
         (h.distanceKm?.toString() || '').includes(lower))
      );
    }
    
    return offers;
  }, [haulageOffers, searchText, filterLeg, filterFrom, filterTo]);

  // Pagination
  const paginatedOffers = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return filteredOffers.slice(start, start + PAGE_SIZE);
  }, [filteredOffers, page]);

  useEffect(() => {
    setPage(1); // reset page si filtre change
  }, [filterLeg, filterFrom, filterTo]);

  // Handler pour sélectionner/désélectionner
  const handleToggleHaulage = useCallback((offer: HaulageResponse) => {
    const offerId = offer.offerId || offer.haulierId?.toString() || '';
    
    if (!offerId) {
      return;
    }

    const isCurrentlySelected = selectedHaulageIds.includes(offerId);

    // Mettre à jour le formulaire
    if (isCurrentlySelected) {
      // Supprimer de la liste
      const updatedHaulages = currentOptionHaulages.filter(h => h.id !== offerId);
      setValue('currentOption.haulages', updatedHaulages);
    } else {
      // Ajouter à la liste
      const haulageData = {
        id: offerId,
        mode: offer.mode as 'truck' | 'rail' | 'barge',
        leg: offer.leg as 'pre' | 'on' | 'post',
        price: offer.unitTariff || offer.basePrice || 0,
        note: offer.note || ''
      };
      const updatedHaulages = [...currentOptionHaulages, haulageData];
      setValue('currentOption.haulages', updatedHaulages);
    }

    // Notifier le parent
    if (onUpdate) {
      const newHaulages = getValues('currentOption.haulages') || [];
      onUpdate(newHaulages);
    }
  }, [selectedHaulageIds, currentOptionHaulages, setValue, getValues, onUpdate]);

  // Fonctions pour le modal de détails
  const handleOpenDetailsModal = (offer: HaulageResponse) => {
    setSelectedOfferForDetails(offer);
    setIsDetailsModalOpen(true);
  };

  const handleCloseDetailsModal = () => {
    setIsDetailsModalOpen(false);
    setSelectedOfferForDetails(null);
  };

  const selectedCount = selectedHaulageIds.length;

  // Fonction pour extraire code postal, ville et pays d'une adresse
  const extractLocationInfo = (formattedAddress: string | null | undefined): string => {
    if (!formattedAddress) return '-';
    
    // Pattern pour extraire code postal, ville et pays
    // Ex: "Blvd. Charles Quint 33, 7000 Mons, Belgium" -> "7000 Mons, Belgium"
    const match = formattedAddress.match(/(\d{4,5})\s+([^,]+),\s*([^,]+)$/);
    if (match) {
      const [, postalCode, city, country] = match;
      return `${postalCode} ${city.trim()}, ${country.trim()}`;
    }
    
    // Fallback: retourner l'adresse complète si le pattern ne match pas
    return formattedAddress;
  };

  // Obtenir le label pour la phase
  const getLegLabel = (leg: string) => {
    const legConfig = haulageLegs.find(l => l.value === leg);
    return legConfig?.label || leg;
  };

  return (
    <Box>
      {/* Filtres */}
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
            background: 'linear-gradient(135deg, #f57c00 0%, #ff9800 100%)',
            p: 2,
            mb: 3,
            color: 'white',
            borderRadius: 2
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <DirectionsCar sx={{ fontSize: 28 }} />
              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                🔍 Filtres de recherche
              </Typography>
            </Box>
            <Typography variant="body2" sx={{ opacity: 0.9, mt: 0.5 }}>
              Affinez votre recherche d'offres de transport terrestre
            </Typography>
          </Box>
          
          <Grid container spacing={3} alignItems="center">
            <Grid item xs={12} sm={6} md={4}>
              <Box sx={{
                p: 2,
                borderRadius: 2,
                background: 'linear-gradient(135deg, #fff3e0 0%, #fce4ec 100%)',
                border: '1px solid rgba(255, 152, 0, 0.2)'
              }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#f57c00', mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                  🚛 Conditions de livraison
                </Typography>
                <FormControl fullWidth size="small">
                  <InputLabel>Phase de transport</InputLabel>
                  <Select
                    value={filterLeg || ''}
                    onChange={(e) => setFilterLeg(e.target.value || null)}
                    label="Phase de transport"
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2
                      }
                    }}
                  >
                    <MenuItem value="">Toutes les phases</MenuItem>
                    {legOptions.map((leg) => (
                      <MenuItem key={leg} value={leg}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <span>{haulageLegs.find(l => l.value === leg)?.icon}</span>
                          <span>{getLegLabel(leg)}</span>
                        </Box>
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <Box sx={{
                p: 2,
                borderRadius: 2,
                background: 'linear-gradient(135deg, #e3f2fd 0%, #f3e5f5 100%)',
                border: '1px solid rgba(25, 118, 210, 0.2)'
              }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#1976d2', mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                  📍 Origine
                </Typography>
                <Autocomplete
                  options={fromOptions}
                  value={filterFrom}
                  onChange={(_, value) => setFilterFrom(value || '')}
                  renderInput={(params) => <TextField {...params} label="Sélectionner l'origine" variant="outlined" size="small" />}
                  freeSolo
                />
              </Box>
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <Box sx={{
                p: 2,
                borderRadius: 2,
                background: 'linear-gradient(135deg, #e8f5e8 0%, #f1f8e9 100%)',
                border: '1px solid rgba(76, 175, 80, 0.2)'
              }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#2e7d32', mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                  🎯 Destination
                </Typography>
                <Autocomplete
                  options={toOptions}
                  value={filterTo}
                  onChange={(_, value) => setFilterTo(value || '')}
                  renderInput={(params) => <TextField {...params} label="Sélectionner la destination" variant="outlined" size="small" />}
                  freeSolo
                />
              </Box>
            </Grid>
          </Grid>
        </Card>
      </motion.div>

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
                placeholder="Rechercher par transporteur, origine, destination, distance..."
                value={searchText}
                onChange={e => setSearchText(e.target.value)}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                    fontSize: '1.1rem',
                    '&:hover': {
                      '& .MuiOutlinedInput-notchedOutline': {
                        borderColor: '#f57c00',
                        borderWidth: 2
                      }
                    },
                    '&.Mui-focused': {
                      '& .MuiOutlinedInput-notchedOutline': {
                        borderColor: '#f57c00',
                        borderWidth: 2
                      }
                    }
                  }
                }}
                InputProps={{
                  startAdornment: (
                    <Box sx={{ mr: 1, color: '#f57c00' }}>
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
      <Fade in={selectedHaulageIds.length > 0} timeout={400}>
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
                  🎉 {selectedHaulageIds.length} offre(s) de transport terrestre sélectionnée(s)
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
              <CircularProgress size={60} sx={{ color: '#f57c00', mb: 2 }} />
              <Typography variant="h6" sx={{ fontWeight: 600, color: '#f57c00' }}>
                🚛 Chargement des offres de transport terrestre...
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
            background: 'linear-gradient(145deg, #e8f5e8 0%, #f1f8e9 100%)',
            border: '1px solid rgba(76, 175, 80, 0.1)',
            overflow: 'hidden'
          }}>
            <Box sx={{
              background: 'linear-gradient(135deg, #f57c00 0%, #ff9800 100%)',
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
                      <DirectionsCar sx={{ fontSize: 32 }} />
                    </Avatar>
                  </Badge>
                  <Box>
                    <Typography variant="h5" sx={{ fontWeight: 700, mb: 0.5 }}>
                      🚛 Offres de transport terrestre
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
                      background: 'linear-gradient(135deg, #f57c00 0%, #ff9800 100%)',
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
                          Origine
                        </Box>
                      </TableCell>
                      <TableCell sx={{ color: '#fff', fontWeight: 700, fontSize: '0.9rem', py: 2 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <LocationOn sx={{ fontSize: 20, color: '#4ecdc4' }} />
                          Destination
                        </Box>
                      </TableCell>
                      <TableCell sx={{ color: '#fff', fontWeight: 700, fontSize: '0.9rem', py: 2 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Route sx={{ fontSize: 20 }} />
                          Distance
                        </Box>
                      </TableCell>
                      <TableCell sx={{ color: '#fff', fontWeight: 700, fontSize: '0.9rem', py: 2 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Euro sx={{ fontSize: 20 }} />
                          Prix
                        </Box>
                      </TableCell>
                      <TableCell sx={{ color: '#fff', fontWeight: 700, fontSize: '0.9rem', py: 2 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Info sx={{ fontSize: 20 }} />
                          Note
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
                      const offerId = offer.id || offer.offerId || '';
                      const isSelected = selectedHaulageIds.includes(offerId);
                      
                      return (
                        <TableRow 
                          key={offerId || idx.toString()}
                          hover 
                          selected={isSelected} 
                          sx={{
                            transition: 'all 0.3s ease',
                            background: isSelected 
                              ? 'linear-gradient(135deg, #e8f5e8 0%, #c8e6c9 100%)' 
                              : 'transparent',
                            borderLeft: isSelected ? '6px solid #f57c00' : '6px solid transparent',
                            '&:hover': {
                              background: isSelected 
                                ? 'linear-gradient(135deg, #e8f5e8 0%, #c8e6c9 100%)' 
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
                                onChange={() => handleToggleHaulage(offer)}
                                inputProps={{ 'aria-label': 'select haulage offer' }}
                                sx={{
                                  '&.Mui-checked': {
                                    color: '#f57c00'
                                  }
                                }}
                              />
                            </TableCell>
                            <TableCell sx={{ py: 2 }}>
                              <Chip 
                                label={offer.haulierName || 'Transporteur'} 
                                size="small" 
                                sx={{
                                  background: isSelected 
                                    ? 'linear-gradient(135deg, #f57c00 0%, #ff9800 100%)'
                                    : 'rgba(245, 124, 0, 0.1)',
                                  color: isSelected ? 'white' : '#f57c00',
                                  fontWeight: 600,
                                  border: 'none'
                                }}
                              />
                            </TableCell>
                            <TableCell sx={{ py: 2 }}>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <LocationOn sx={{ color: '#ff6b6b', fontSize: 16 }} />
                                <Box>
                                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                    {offer.pickupLocation?.displayName || offer.loadingLocation?.displayName || '-'}
                                  </Typography>
                                  <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                                    {extractLocationInfo(offer.pickupLocation?.formattedAddress || offer.loadingLocation?.formattedAddress)}
                                  </Typography>
                                </Box>
                              </Box>
                            </TableCell>
                            <TableCell sx={{ py: 2 }}>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <LocationOn sx={{ color: '#4ecdc4', fontSize: 16 }} />
                                <Box>
                                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                    {offer.deliveryLocation?.displayName || '-'}
                                  </Typography>
                                  <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                                    {extractLocationInfo(offer.deliveryLocation?.formattedAddress)}
                                  </Typography>
                                </Box>
                              </Box>
                            </TableCell>
                            <TableCell sx={{ py: 2 }}>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Route sx={{ color: '#1976d2', fontSize: 16 }} />
                                <Chip
                                  label={offer.distanceKm ? `${offer.distanceKm} km` : '-'}
                                  size="small"
                                  sx={{
                                    background: 'linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)',
                                    color: 'white',
                                    fontWeight: 600
                                  }}
                                />
                              </Box>
                            </TableCell>
                            <TableCell sx={{ py: 2 }}>
                              <Chip
                                label={`${offer.unitTariff?.toLocaleString(undefined, { maximumFractionDigits: 2 }) || '0.00'} ${offer.currency || 'EUR'}`}
                                sx={{
                                  background: 'linear-gradient(135deg, #2e7d32 0%, #4caf50 100%)',
                                  color: 'white',
                                  fontWeight: 700
                                }}
                              />
                            </TableCell>
                            <TableCell sx={{ py: 2 }}>
                              <Typography variant="body2" sx={{ 
                                maxWidth: 200, 
                                overflow: 'hidden', 
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap',
                                fontWeight: 600,
                                color: '#666'
                              }}>
                                {offer.comment || '-'}
                              </Typography>
                            </TableCell>
                            <TableCell align="center" sx={{ py: 2 }}>
                              <Stack direction="row" spacing={1} justifyContent="center">
                                <Button
                                  variant={isSelected ? "contained" : "outlined"}
                                  color="primary"
                                  size="small"
                                  onClick={() => handleToggleHaulage(offer)}
                                  sx={{ 
                                    fontWeight: 600, 
                                    minWidth: 100,
                                    borderRadius: 2,
                                    textTransform: 'none',
                                    background: isSelected 
                                      ? 'linear-gradient(135deg, #f57c00 0%, #ff9800 100%)'
                                      : 'transparent',
                                    borderColor: '#f57c00',
                                    color: isSelected ? 'white' : '#f57c00',
                                    '&:hover': {
                                      background: isSelected 
                                        ? 'linear-gradient(135deg, #e65100 0%, #f57c00 100%)'
                                        : 'rgba(245, 124, 0, 0.1)',
                                      transform: 'translateY(-2px)',
                                      boxShadow: '0 4px 12px rgba(245, 124, 0, 0.3)'
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
                                      color: '#f57c00',
                                      background: 'rgba(245, 124, 0, 0.1)',
                                      '&:hover': {
                                        backgroundColor: 'rgba(245, 124, 0, 0.2)',
                                        transform: 'scale(1.1)',
                                        boxShadow: '0 4px 12px rgba(245, 124, 0, 0.3)'
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
                        background: 'linear-gradient(135deg, #f57c00 0%, #ff9800 100%)',
                        color: 'white',
                        boxShadow: '0 4px 12px rgba(245, 124, 0, 0.3)'
                      },
                      '&:hover': {
                        background: 'rgba(245, 124, 0, 0.1)',
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
              <DirectionsCar sx={{ fontSize: 64, color: '#e0e0e0', mb: 2 }} />
              <Typography variant="h5" sx={{ fontWeight: 700, color: '#666', mb: 1 }}>
                🚛 Aucune offre de transport terrestre trouvée
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
        aria-labelledby="haulage-details-modal"
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
            maxWidth: 800,
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
                <DirectionsCar />
              </Avatar>
              <Box>
                <Typography variant="h5" sx={{ fontWeight: 700, mb: 0.5 }}>
                  Détails de l'offre de transport terrestre
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                  {selectedOfferForDetails && `${getModeLabel(selectedOfferForDetails.mode || '')} - ${getLegLabel(selectedOfferForDetails.leg || '')}`}
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
                            <DirectionsCar sx={{ color: '#1976d2', mr: 1, fontSize: '1.2em' }} />
                            <Typography variant="body2" sx={{ fontWeight: 600 }}>
                              Mode: {getModeLabel(selectedOfferForDetails.mode || '')} {getModeIcon(selectedOfferForDetails.mode || '')}
                            </Typography>
                          </Box>
                        </Grid>
                        <Grid item xs={12}>
                          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                            <Category sx={{ color: '#9b59b6', mr: 1, fontSize: '1.2em' }} />
                            <Typography variant="body2" sx={{ fontWeight: 600 }}>
                              Phase: {getLegLabel(selectedOfferForDetails.leg || '')}
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
                      </Grid>
                    </CardContent>
                  </Card>
                </Grid>

                {/* Route */}
                <Grid item xs={12} md={6}>
                  <Card sx={{ mb: 3, borderRadius: 2, boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
                    <CardContent>
                      <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: '#1976d2', display: 'flex', alignItems: 'center' }}>
                        <LocationOn sx={{ mr: 1 }} />
                        Route
                      </Typography>
                      <Grid container spacing={2}>
                        <Grid item xs={12}>
                          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                            <LocationOn sx={{ color: '#e74c3c', mr: 1, fontSize: '1.2em' }} />
                            <Typography variant="body2" sx={{ fontWeight: 600 }}>
                              De: {selectedOfferForDetails.from || '-'}
                            </Typography>
                          </Box>
                        </Grid>
                        <Grid item xs={12}>
                          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                            <LocationOn sx={{ color: '#27ae60', mr: 1, fontSize: '1.2em' }} />
                            <Typography variant="body2" sx={{ fontWeight: 600 }}>
                              Vers: {selectedOfferForDetails.to || '-'}
                            </Typography>
                          </Box>
                        </Grid>
                      </Grid>
                    </CardContent>
                  </Card>
                </Grid>

                {/* Tarification */}
                <Grid item xs={12}>
                  <Card sx={{ mb: 3, borderRadius: 2, boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
                    <CardContent>
                      <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: '#1976d2', display: 'flex', alignItems: 'center' }}>
                        <AttachMoney sx={{ mr: 1 }} />
                        Tarification
                      </Typography>
                      
                      <Box sx={{ textAlign: 'center', p: 3, background: 'linear-gradient(135deg, #e8f5e8 0%, #c8e6c9 100%)', borderRadius: 2 }}>
                        <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                          Prix de Base
                        </Typography>
                        <Typography variant="h4" sx={{ fontWeight: 700, color: '#2e7d32' }}>
                          {selectedOfferForDetails.basePrice?.toLocaleString(undefined, { maximumFractionDigits: 2 }) || '0.00'} {selectedOfferForDetails.currency || 'EUR'}
                        </Typography>
                      </Box>

                      {selectedOfferForDetails.note && (
                        <Box sx={{ mt: 3 }}>
                          <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1, color: '#333' }}>
                            Note:
                          </Typography>
                          <Typography variant="body2" sx={{ fontStyle: 'italic', color: '#666' }}>
                            {selectedOfferForDetails.note}
                          </Typography>
                        </Box>
                      )}
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
                  handleToggleHaulage(selectedOfferForDetails);
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
                {selectedHaulageIds.includes(selectedOfferForDetails.id || selectedOfferForDetails.offerId || '') ? 'Désélectionner' : 'Sélectionner cette offre'}
              </Button>
            )}
          </Box>
        </Box>
      </Modal>
    </Box>
  );
};

export default HaulageSelection;
