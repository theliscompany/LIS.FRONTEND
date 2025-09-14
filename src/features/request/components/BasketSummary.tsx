import React from 'react';
import { Box, Typography, Chip, Card, CardContent, Grid, Avatar, Fade, Slide, Stack, Button, Divider, Tooltip } from '@mui/material';
import { useTranslation } from 'react-i18next';
import BusinessIcon from '@mui/icons-material/Business';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import DirectionsBoatIcon from '@mui/icons-material/DirectionsBoat';
import AssignmentIcon from '@mui/icons-material/Assignment';
import BuildIcon from '@mui/icons-material/Build';
import PersonIcon from '@mui/icons-material/Person';
import Inventory2Icon from '@mui/icons-material/Inventory2';
import EuroIcon from '@mui/icons-material/Euro';
import type { HaulageResponse } from "@features/pricingnew/api/types.gen";

interface BasketSummaryProps {
  currentStep?: number;
  requestData?: any;
  selectedServices?: any[];
  selectedContainers?: any;
  selectedHaulage?: HaulageResponse;
  selectedSeafreight?: any;
  selectedMiscellaneous?: any[];
  services?: any[];
  contacts?: any;
  onRemoveMisc?: (id: string) => void;
  cityFrom?: any;
  portFrom?: any;
}

const BasketSummary = ({
  selectedHaulage,
  selectedSeafreight,
  selectedMiscellaneous = [],
  services = [],
  contacts = {},
  onRemoveMisc,
  currentStep = 0,
  requestData,
  selectedServices = [],
  selectedContainers = {},
  cityFrom,
  portFrom
}: BasketSummaryProps) => {
  const { t } = useTranslation();
  
  // Données du panier

  // Fonction pour déterminer quelles informations afficher selon l'étape
  const getStepInfo = () => {
    switch (currentStep) {
      case 0: // Étape 1: Informations de base
        return {
          title: "📋 Informations de base",
          showCustomer: true,
          showLocations: true,
          showProduct: true,
          showIncoterm: true,
          showServices: false,
          showHaulage: false,
          showSeafreight: false,
          showMiscellaneous: false
        };
      case 1: // Étape 2: Sélection des services
        return {
          title: "🛠️ Services sélectionnés",
          showCustomer: true,
          showLocations: true,
          showProduct: true,
          showIncoterm: true,
          showServices: true,
          showHaulage: false,
          showSeafreight: false,
          showMiscellaneous: false
        };
      case 2: // Étape 3: Détails des conteneurs
        return {
          title: "📦 Détails des conteneurs",
          showCustomer: true,
          showLocations: true,
          showProduct: true,
          showIncoterm: true,
          showServices: true,
          showHaulage: false,
          showSeafreight: false,
          showMiscellaneous: false
        };
      case 3: // Étape 4: Sélection du transporteur
        return {
          title: "🚛 Transport routier",
          showCustomer: true,
          showLocations: true,
          showProduct: true,
          showIncoterm: true,
          showServices: true,
          showHaulage: true,
          showSeafreight: false,
          showMiscellaneous: false
        };
      case 4: // Étape 5: Sélection du fret maritime
        return {
          title: "🚢 Fret maritime",
          showCustomer: true,
          showLocations: true,
          showProduct: true,
          showIncoterm: true,
          showServices: true,
          showHaulage: true,
          showSeafreight: true,
          showMiscellaneous: false
        };
      case 5: // Étape 6: Services divers
        return {
          title: "🔧 Services divers",
          showCustomer: true,
          showLocations: true,
          showProduct: true,
          showIncoterm: true,
          showServices: true,
          showHaulage: true,
          showSeafreight: true,
          showMiscellaneous: true
        };
      default:
        return {
          title: "🛒 Panier de l'offre",
          showCustomer: true,
          showLocations: true,
          showProduct: true,
          showIncoterm: true,
          showServices: true,
          showHaulage: true,
          showSeafreight: true,
          showMiscellaneous: true
        };
    }
  };

  const stepInfo = getStepInfo();
  const basketCount = (selectedMiscellaneous?.length || 0) + (selectedHaulage ? 1 : 0) + (selectedSeafreight ? 1 : 0);

  // === NOUVELLE FONCTIONNALITÉ : Calcul des prix et total ===
  const calculatePrices = () => {
    let total = 0;
    const priceBreakdown = {
      haulage: 0,
      seafreight: 0,
      miscellaneous: 0,
      total: 0
    };

    // Prix du haulage
    if (selectedHaulage) {
      const haulagePrice = selectedHaulage.unitTariff || 0;
      const haulageQuantity = selectedContainers?.totalTEU || 1;
      priceBreakdown.haulage = haulagePrice * haulageQuantity;
      total += priceBreakdown.haulage;
    }

    // Prix du seafreight
    if (selectedSeafreight) {
      // Utiliser le prix total du seafreight s'il est disponible
      if (selectedSeafreight.charges?.total) {
        priceBreakdown.seafreight = selectedSeafreight.charges.total;
      } else if (selectedSeafreight.charges?.baseFreight) {
        // Calculer le total en ajoutant les surcharges
        let seafreightTotal = selectedSeafreight.charges.baseFreight;
        
        // Ajouter les surcharges si disponibles
        if (selectedSeafreight.charges.surcharges && Array.isArray(selectedSeafreight.charges.surcharges)) {
          selectedSeafreight.charges.surcharges.forEach((surcharge: any) => {
            seafreightTotal += surcharge.value || 0;
          });
        }
        
        priceBreakdown.seafreight = seafreightTotal;
      } else if (selectedSeafreight.total) {
        priceBreakdown.seafreight = selectedSeafreight.total;
      }
      
      total += priceBreakdown.seafreight;
    }

    // Prix des services divers
    if (selectedMiscellaneous && selectedMiscellaneous.length > 0) {
      priceBreakdown.miscellaneous = selectedMiscellaneous.reduce((sum: number, misc: any) => {
        const price = misc.unitPrice || 0;
        const quantity = misc.quantity || 1;
        return sum + (price * quantity);
      }, 0);
      total += priceBreakdown.miscellaneous;
    }

    priceBreakdown.total = total;
    return priceBreakdown;
  };

  const prices = calculatePrices();
  const hasAnyPrice = prices.total > 0;

  // Fonction pour obtenir la devise principale
  const getMainCurrency = () => {
    if (selectedHaulage?.currency) return selectedHaulage.currency;
    if (selectedSeafreight?.currency) return selectedSeafreight.currency;
    if (selectedMiscellaneous?.[0]?.currency) return selectedMiscellaneous[0].currency;
    return 'EUR';
  };

  const mainCurrency = getMainCurrency();

  // Calcul des prix

  // Fonction pour formater les prix
  const formatPrice = (price: number, currency: string = 'EUR') => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2
    }).format(price);
  };

  // Fonctions pour extraire les données de manière robuste
  const getCustomerInfo = () => {
    if (requestData?.customer?.contactName) return requestData.customer.contactName;
    if (requestData?.customer?.name) return requestData.customer.name;
    if (requestData?.customerName) return requestData.customerName;
    if (requestData?.contactName) return requestData.contactName;
    return null;
  };

  const getDepartureInfo = () => {
    // Structure normale : { name, country }
    if (requestData?.cityFrom?.name && requestData?.cityFrom?.country) {
      return `${requestData.cityFrom.name}, ${requestData.cityFrom.country.toUpperCase()}`;
    }
    if (requestData?.cityFrom?.name) return requestData.cityFrom.name;
    
    // Structure alternative : { cityName, cityCountry }
    if (requestData?.cityFrom?.cityName && requestData?.cityFrom?.cityCountry) {
      return `${requestData.cityFrom.cityName}, ${requestData.cityFrom.cityCountry.toUpperCase()}`;
    }
    if (requestData?.cityFrom?.cityName) return requestData.cityFrom.cityName;
    
    // Structure string directe
    if (typeof requestData?.cityFrom === 'string') return requestData.cityFrom;
    
    // Autres structures
    if (requestData?.pickupLocation?.city && requestData?.pickupLocation?.country) {
      return `${requestData.pickupLocation.city}, ${requestData.pickupLocation.country.toUpperCase()}`;
    }
    if (requestData?.pickupLocation?.city) return requestData.pickupLocation.city;
    if (requestData?.departureCity) return requestData.departureCity;
    if (requestData?.fromCity) return requestData.fromCity;
    
    return null;
  };

  const getArrivalInfo = () => {
    // Structure normale : { name, country }
    if (requestData?.cityTo?.name && requestData?.cityTo?.country) {
      return `${requestData.cityTo.name}, ${requestData.cityTo.country.toUpperCase()}`;
    }
    if (requestData?.cityTo?.name) return requestData.cityTo.name;
    
    // Structure alternative : { cityName, cityCountry }
    if (requestData?.cityTo?.cityName && requestData?.cityTo?.cityCountry) {
      return `${requestData.cityTo.cityName}, ${requestData.cityTo.cityCountry.toUpperCase()}`;
    }
    if (requestData?.cityTo?.cityName) return requestData.cityTo.cityName;
    
    // Structure string directe
    if (typeof requestData?.cityTo === 'string') return requestData.cityTo;
    
    // Autres structures
    if (requestData?.deliveryLocation?.city && requestData?.deliveryLocation?.country) {
      return `${requestData.deliveryLocation.city}, ${requestData.deliveryLocation.country.toUpperCase()}`;
    }
    if (requestData?.deliveryLocation?.city) return requestData.deliveryLocation.city;
    if (requestData?.arrivalCity) return requestData.arrivalCity;
    if (requestData?.toCity) return requestData.toCity;
    
    return null;
  };

  const getProductInfo = () => {
    if (requestData?.productName && typeof requestData.productName === 'object' && requestData.productName.productName) {
      return requestData.productName.productName;
    }
    if (typeof requestData?.productName === 'string' && requestData.productName) {
      return requestData.productName;
    }
    if (requestData?.productId && Array.isArray(services)) {
      const found = services.find(p => p.productId === requestData.productId);
      if (found && found.productName) return found.productName;
    }
    if (requestData?.product) return requestData.product;
    return null;
  };

  const getIncotermInfo = () => {
    if (requestData?.incotermName) return requestData.incotermName;
    if (requestData?.incoterm) return requestData.incoterm;
    if (requestData?.incoterms) return requestData.incoterms;
    return null;
  };

  const customerInfo = getCustomerInfo();
  const departureInfo = getDepartureInfo();
  const arrivalInfo = getArrivalInfo();
  const productInfo = getProductInfo();
  const incotermInfo = getIncotermInfo();

  // Informations extraites

  return (
    <Fade in timeout={600}>
      <Box sx={{ 
        p: 3, 
        background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)', 
        borderRadius: 3, 
        boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
        border: '1px solid #e9ecef'
      }}>
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          mb: 3,
          p: 2,
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          borderRadius: 2,
          color: 'white'
        }}>
          <Typography variant="h6" sx={{ fontWeight: 700, flex: 1 }}>
            {stepInfo.title}
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {basketCount > 0 && (
              <Chip 
                label={basketCount} 
                color="secondary" 
                size="small"
                sx={{ fontWeight: 700, background: 'rgba(255,255,255,0.2)' }}
              />
            )}
            {hasAnyPrice && (
              <Chip 
                label={formatPrice(prices.total, mainCurrency)}
                color="success"
                size="small"
                sx={{ 
                  fontWeight: 700, 
                  background: 'rgba(255,255,255,0.2)',
                  color: 'white',
                  border: '1px solid rgba(255,255,255,0.3)'
                }}
              />
            )}
          </Box>
        </Box>

        <Stack spacing={2}>
          {/* Informations client */}
          {stepInfo.showCustomer && (
            <Box sx={{ 
              p: 2, 
              background: 'white', 
              borderRadius: 2, 
              border: '1px solid #e9ecef',
              boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
            }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <PersonIcon sx={{ color: '#3498db', mr: 1, fontSize: 20 }} />
                <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#2c3e50' }}>
                  Client
                </Typography>
              </Box>
              <Typography variant="body2" sx={{ color: '#34495e', fontWeight: 500 }}>
                {customerInfo || 'Non défini'}
              </Typography>
            </Box>
          )}

          {/* Localisations */}
          {stepInfo.showLocations && (
            <Box sx={{ 
              p: 2, 
              background: 'white', 
              borderRadius: 2, 
              border: '1px solid #e9ecef',
              boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
            }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <LocationOnIcon sx={{ color: '#e74c3c', mr: 1, fontSize: 20 }} />
                <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#2c3e50' }}>
                  Itinéraire
                </Typography>
              </Box>
              <Stack direction="row" spacing={1} alignItems="center">
                <Typography variant="body2" sx={{ color: '#34495e', fontWeight: 500 }}>
                  {departureInfo || 'Départ'}
                </Typography>
                <Typography variant="body2" sx={{ color: '#7f8c8d' }}>→</Typography>
                <Typography variant="body2" sx={{ color: '#34495e', fontWeight: 500 }}>
                  {arrivalInfo || 'Arrivée'}
                </Typography>
              </Stack>
              {/* Ports visibles à partir du step 3 */}
              {currentStep >= 2 && (requestData?.portFrom || requestData?.portTo) && (
                <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 1 }}>
                  <DirectionsBoatIcon sx={{ color: '#2980b9', fontSize: 18, mr: 0.5 }} />
                  <Typography variant="caption" sx={{ color: '#2980b9', fontWeight: 600 }}>
                    {requestData?.portFrom?.portName || 'Port de départ'}
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#7f8c8d' }}>→</Typography>
                  <DirectionsBoatIcon sx={{ color: '#16a085', fontSize: 18, mr: 0.5 }} />
                  <Typography variant="caption" sx={{ color: '#16a085', fontWeight: 600 }}>
                    {requestData?.portTo?.portName || 'Port d\'arrivée'}
                  </Typography>
                </Stack>
              )}
            </Box>
          )}

          {/* Produit */}
          {stepInfo.showProduct && (
            <Box sx={{ 
              p: 2, 
              background: 'white', 
              borderRadius: 2, 
              border: '1px solid #e9ecef',
              boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
            }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Inventory2Icon sx={{ color: '#f39c12', mr: 1, fontSize: 20 }} />
                <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#2c3e50' }}>
                  Produit
                </Typography>
              </Box>
              <Typography variant="body2" sx={{ color: '#34495e', fontWeight: 500 }}>
                {productInfo || 'Non défini'}
              </Typography>
            </Box>
          )}

          {/* Incoterm */}
          {stepInfo.showIncoterm && (
            <Box sx={{ 
              p: 2, 
              background: 'white', 
              borderRadius: 2, 
              border: '1px solid #e9ecef',
              boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
            }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <AssignmentIcon sx={{ color: '#9b59b6', mr: 1, fontSize: 20 }} />
                <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#2c3e50' }}>
                  Incoterm
                </Typography>
              </Box>
              <Chip 
                label={incotermInfo || 'Non défini'} 
                size="small" 
                color="primary" 
                variant="outlined"
                sx={{ fontWeight: 600 }}
              />
            </Box>
          )}

          {/* Services sélectionnés */}
          {stepInfo.showServices && selectedServices && selectedServices.length > 0 && (
            <Box sx={{ 
              p: 2, 
              background: 'white', 
              borderRadius: 2, 
              border: '1px solid #e9ecef',
              boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
            }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <BuildIcon sx={{ color: '#27ae60', mr: 1, fontSize: 20 }} />
                <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#2c3e50' }}>
                  Services ({selectedServices.length})
                </Typography>
              </Box>
              <Stack spacing={1}>
                {selectedServices.map((service, idx) => (
                  <Box key={idx} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Typography variant="body2" sx={{ color: '#34495e', fontWeight: 500 }}>
                      {service.serviceName || service.name}
                    </Typography>
                    {selectedContainers && selectedContainers[service.serviceId] && (
                      <Chip 
                        label={`${selectedContainers[service.serviceId].quantity || 1} cont.`} 
                        size="small" 
                        color="secondary"
                        variant="outlined"
                      />
                    )}
                  </Box>
                ))}
              </Stack>
            </Box>
          )}

          {/* Haulage sélectionné */}
          {stepInfo.showHaulage && selectedHaulage && (
            <Box sx={{ 
              p: 2, 
              background: 'white', 
              borderRadius: 2, 
              border: '1px solid #e9ecef',
              boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
            }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <LocalShippingIcon sx={{ color: '#e67e22', mr: 1, fontSize: 20 }} />
                <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#2c3e50' }}>
                  Transport routier
                </Typography>
              </Box>
              <Stack spacing={1}>
                <Typography variant="body2" sx={{ color: '#34495e', fontWeight: 500 }}>
                  {selectedHaulage.haulierName || selectedHaulage.haulierId || 'Transporteur'}
                </Typography>
                {selectedHaulage.unitTariff !== undefined && (
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <EuroIcon sx={{ color: '#27ae60', mr: 0.5, fontSize: 16 }} />
                    <Typography variant="body2" sx={{ color: '#27ae60', fontWeight: 600 }}>
                      {selectedHaulage.unitTariff} {selectedHaulage.currency || '€'}
                    </Typography>
                  </Box>
                )}
                {prices.haulage > 0 && (
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Typography variant="body2" sx={{ color: '#7f8c8d' }}>
                      Total haulage:
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#27ae60', fontWeight: 600 }}>
                      {formatPrice(prices.haulage, selectedHaulage.currency || mainCurrency)}
                    </Typography>
                  </Box>
                )}
                {selectedHaulage.offerId && (
                  <Chip 
                    label={`ID: ${selectedHaulage.offerId}`} 
                    size="small" 
                    color="info"
                    variant="outlined"
                  />
                )}
              </Stack>
            </Box>
          )}

          {/* Seafreight sélectionné */}
          {stepInfo.showSeafreight && selectedSeafreight && (
            <Box sx={{ 
              p: 2, 
              background: 'white', 
              borderRadius: 2, 
              border: '1px solid #e9ecef',
              boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
            }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <DirectionsBoatIcon sx={{ color: '#3498db', mr: 1, fontSize: 20 }} />
                <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#2c3e50' }}>
                  Fret maritime
                </Typography>
              </Box>
              <Stack spacing={1}>
                <Typography variant="body2" sx={{ color: '#34495e', fontWeight: 500 }}>
                  {selectedSeafreight.carrierAgentName || 
                   selectedSeafreight.carrier?.name || 
                   selectedSeafreight.carrierName || 
                   'Transporteur maritime'}
                </Typography>
                {(selectedSeafreight.departurePortName && selectedSeafreight.destinationPortName) && (
                  <Stack direction="row" spacing={1} alignItems="center">
                    <Typography variant="body2" sx={{ color: '#7f8c8d' }}>
                      {selectedSeafreight.departurePortName}
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#7f8c8d' }}>→</Typography>
                    <Typography variant="body2" sx={{ color: '#7f8c8d' }}>
                      {selectedSeafreight.destinationPortName}
                    </Typography>
                  </Stack>
                )}
                {selectedSeafreight.charges?.baseFreight && (
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <EuroIcon sx={{ color: '#27ae60', mr: 0.5, fontSize: 16 }} />
                    <Typography variant="body2" sx={{ color: '#27ae60', fontWeight: 600 }}>
                      {selectedSeafreight.charges.baseFreight} {selectedSeafreight.currency || '€'}
                    </Typography>
                  </Box>
                )}
                {prices.seafreight > 0 && (
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Typography variant="body2" sx={{ color: '#7f8c8d' }}>
                      Total seafreight:
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#27ae60', fontWeight: 600 }}>
                      {formatPrice(prices.seafreight, selectedSeafreight.currency || mainCurrency)}
                    </Typography>
                  </Box>
                )}
                {selectedSeafreight.id && (
                  <Chip 
                    label={`ID: ${selectedSeafreight.id}`} 
                    size="small" 
                    color="info"
                    variant="outlined"
                  />
                )}
              </Stack>
            </Box>
          )}

          {/* Services divers */}
          {stepInfo.showMiscellaneous && selectedMiscellaneous && selectedMiscellaneous.length > 0 && (
            <Box sx={{ 
              p: 2, 
              background: 'white', 
              borderRadius: 2, 
              border: '1px solid #e9ecef',
              boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
            }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <BuildIcon sx={{ color: '#8e44ad', mr: 1, fontSize: 20 }} />
                <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#2c3e50' }}>
                  Services divers ({selectedMiscellaneous.length})
                </Typography>
              </Box>
              <Stack spacing={1}>
                {selectedMiscellaneous.map((misc, idx) => (
                  <Box key={misc.id || idx} sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'space-between',
                    p: 1,
                    background: '#f8f9fa',
                    borderRadius: 1
                  }}>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="body2" sx={{ color: '#34495e', fontWeight: 500 }}>
                        {(services?.find(s => s.serviceId === misc.serviceId)?.serviceName) || misc.serviceName || `Service ${misc.serviceId}`}
                      </Typography>
                      <Typography variant="caption" sx={{ color: '#7f8c8d' }}>
                        {(contacts?.data ? (contacts.data as any[]).find((c: any) => c.contactId === misc.supplierId)?.contactName : misc.supplierName) || misc.supplierName || `Fournisseur ${misc.supplierId}`}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <EuroIcon sx={{ color: '#27ae60', mr: 0.5, fontSize: 14 }} />
                        <Typography variant="body2" sx={{ color: '#27ae60', fontWeight: 600 }}>
                          {misc.unitPrice} {misc.currency}
                        </Typography>
                      </Box>
                      {onRemoveMisc && (
                        <Tooltip title="Retirer du panier">
                          <Button
                            size="small"
                            color="error"
                            variant="outlined"
                            sx={{ minWidth: 'auto', p: 0.5 }}
                            onClick={() => onRemoveMisc(misc.id)}
                          >
                            ×
                          </Button>
                        </Tooltip>
                      )}
                    </Box>
                  </Box>
                ))}
                {prices.miscellaneous > 0 && (
                  <Box sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'space-between',
                    p: 1.5,
                    background: '#e8f5e8',
                    borderRadius: 1,
                    border: '1px solid #4caf50'
                  }}>
                    <Typography variant="body2" sx={{ color: '#2e7d32', fontWeight: 600 }}>
                      Total services divers:
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#2e7d32', fontWeight: 600 }}>
                      {formatPrice(prices.miscellaneous, mainCurrency)}
                    </Typography>
                  </Box>
                )}
              </Stack>
            </Box>
          )}

          {/* Récapitulatif des prix */}
          {hasAnyPrice && (
            <Box sx={{ 
              p: 3, 
              background: 'linear-gradient(135deg, #f8f9fa 0%, #e3f2fd 100%)', 
              borderRadius: 2, 
              border: '2px solid #1976d2',
              boxShadow: '0 4px 12px rgba(25, 118, 210, 0.15)'
            }}>
              <Typography variant="h6" sx={{ 
                color: '#1976d2', 
                fontWeight: 700, 
                mb: 2, 
                textAlign: 'center',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 1
              }}>
                <EuroIcon sx={{ fontSize: 24 }} />
                Récapitulatif des Prix
              </Typography>
              
              <Stack spacing={2}>
                {prices.haulage > 0 && (
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Typography variant="body1" sx={{ color: '#2c3e50', fontWeight: 500 }}>
                      Transport routier:
                    </Typography>
                    <Typography variant="body1" sx={{ color: '#27ae60', fontWeight: 600 }}>
                      {formatPrice(prices.haulage, mainCurrency)}
                    </Typography>
                  </Box>
                )}
                
                {prices.seafreight > 0 && (
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Typography variant="body1" sx={{ color: '#2c3e50', fontWeight: 500 }}>
                      Fret maritime:
                    </Typography>
                    <Typography variant="body1" sx={{ color: '#27ae60', fontWeight: 600 }}>
                      {formatPrice(prices.seafreight, mainCurrency)}
                    </Typography>
                  </Box>
                )}
                
                {prices.miscellaneous > 0 && (
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Typography variant="body1" sx={{ color: '#2c3e50', fontWeight: 500 }}>
                      Services divers:
                    </Typography>
                    <Typography variant="body1" sx={{ color: '#27ae60', fontWeight: 600 }}>
                      {formatPrice(prices.miscellaneous, mainCurrency)}
                    </Typography>
                  </Box>
                )}
                
                <Divider sx={{ borderColor: '#1976d2', opacity: 0.3 }} />
                
                <Box sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'space-between',
                  p: 2,
                  background: 'linear-gradient(135deg, #1976d2 0%, #1565c0 100%)',
                  borderRadius: 2,
                  color: 'white'
                }}>
                  <Typography variant="h6" sx={{ fontWeight: 700 }}>
                    TOTAL GÉNÉRAL:
                  </Typography>
                  <Typography variant="h6" sx={{ fontWeight: 700 }}>
                    {formatPrice(prices.total, mainCurrency)}
                  </Typography>
                </Box>
              </Stack>
            </Box>
          )}

          {/* Message si aucun service sélectionné */}
          {selectedMiscellaneous.length === 0 && !selectedHaulage && !selectedSeafreight && currentStep >= 3 && (
            <Box sx={{ 
              p: 2, 
              background: '#fff3cd', 
              borderRadius: 2, 
              border: '1px solid #ffeaa7',
              textAlign: 'center'
            }}>
              <Typography variant="body2" sx={{ color: '#856404', fontWeight: 500 }}>
                Aucun service sélectionné. Veuillez sélectionner des offres pour les ajouter au panier.
              </Typography>
            </Box>
          )}

          {/* Message de fallback si aucune donnée n'est disponible */}
          {(!customerInfo && !departureInfo && !arrivalInfo && !productInfo && !incotermInfo && 
           (!selectedServices || selectedServices.length === 0) && !selectedHaulage && !selectedSeafreight && 
           (!selectedMiscellaneous || selectedMiscellaneous.length === 0)) && (
            <Box sx={{ 
              p: 2, 
              background: '#e3f2fd', 
              borderRadius: 2, 
              border: '1px solid #bbdefb',
              textAlign: 'center'
            }}>
              <Typography variant="body2" sx={{ color: '#1976d2', fontWeight: 500 }}>
                Aucune information disponible pour cette étape.
              </Typography>
              <Typography variant="caption" sx={{ color: '#1976d2', display: 'block', mt: 1 }}>
                Étape: {currentStep} | Données reçues: {requestData ? 'Oui' : 'Non'}
              </Typography>
            </Box>
          )}
        </Stack>
      </Box>
    </Fade>
  );
};

export default BasketSummary; 