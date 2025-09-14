import React, { useState } from 'react';
import { useTheme, useMediaQuery, Drawer, Fab, Badge, Accordion, AccordionSummary, AccordionDetails, Box } from '@mui/material';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import BasketSummary from './BasketSummary';
import type { HaulageResponse } from "@features/pricingnew/api/types.gen";

interface OfferBasketDrawerAccordionProps {
  selectedHaulage?: HaulageResponse;
  selectedSeafreight?: any;
  selectedMiscellaneous?: any[];
  children: React.ReactNode;
  currentStep?: number;
  requestData?: any;
  selectedServices?: any[];
  selectedContainers?: any;
  services?: any[];
  contacts?: any;
  onRemoveMisc?: (id: string) => void;
  cityFrom?: any;
  portFrom?: any;
}

const OfferBasketDrawerAccordion: React.FC<OfferBasketDrawerAccordionProps> = (props) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [accordionOpen, setAccordionOpen] = useState(false);
  // Calcul du nombre d'éléments et du total des prix
  const basketCount = (props.selectedMiscellaneous?.length || 0) + (props.selectedHaulage ? 1 : 0) + (props.selectedSeafreight ? 1 : 0);
  
  // Calcul du total des prix
  const calculateTotalPrice = () => {
    let total = 0;
    
    // Prix du haulage
    if (props.selectedHaulage?.unitTariff) {
      const haulagePrice = props.selectedHaulage.unitTariff;
      const haulageQuantity = props.selectedContainers?.totalTEU || 1;
      total += haulagePrice * haulageQuantity;
    }
    
    // Prix du seafreight
    if (props.selectedSeafreight?.charges?.total) {
      total += props.selectedSeafreight.charges.total;
    } else if (props.selectedSeafreight?.charges?.baseFreight) {
      let seafreightTotal = props.selectedSeafreight.charges.baseFreight;
      if (props.selectedSeafreight.charges.surcharges && Array.isArray(props.selectedSeafreight.charges.surcharges)) {
        props.selectedSeafreight.charges.surcharges.forEach((surcharge: any) => {
          seafreightTotal += surcharge.value || 0;
        });
      }
      total += seafreightTotal;
    }
    
    // Prix des services divers
    if (props.selectedMiscellaneous && props.selectedMiscellaneous.length > 0) {
      total += props.selectedMiscellaneous.reduce((sum: number, misc: any) => {
        const price = misc.unitPrice || 0;
        const quantity = misc.quantity || 1;
        return sum + (price * quantity);
      }, 0);
    }
    
    return total;
  };
  
  const totalPrice = calculateTotalPrice();
  const hasAnyPrice = totalPrice > 0;


  if (isMobile) {
    return (
      <Box sx={{ mb: 2 }}>
        <Accordion expanded={accordionOpen} onChange={() => setAccordionOpen(!accordionOpen)}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Badge color="primary" badgeContent={basketCount} max={99}>
                <ShoppingCartIcon />
              </Badge>
              <Box component="span" sx={{ fontWeight: 600 }}>Panier de l'offre</Box>
              {hasAnyPrice && (
                <Box sx={{ 
                  ml: 'auto',
                  p: 0.5,
                  px: 1,
                  background: 'linear-gradient(135deg, #4caf50 0%, #45a049 100%)',
                  borderRadius: 1,
                  color: 'white',
                  fontSize: '0.75rem',
                  fontWeight: 600
                }}>
                  {new Intl.NumberFormat('fr-FR', {
                    style: 'currency',
                    currency: 'EUR',
                    minimumFractionDigits: 0
                  }).format(totalPrice)}
                </Box>
              )}
            </Box>
          </AccordionSummary>
          <AccordionDetails>
            <Box sx={{
              display: 'flex',
              alignItems: 'center',
              mb: 2,
              p: 1.5,
              borderRadius: 2,
              background: 'linear-gradient(90deg, #f5f7fa 0%, #e3f0ff 100%)',
              boxShadow: 1
            }}>
              <ShoppingCartIcon color="primary" sx={{ mr: 1 }} />
              <Box component="span" sx={{ fontWeight: 700, fontSize: '1.2rem', color: 'primary.main' }}>
                Panier de l'Offre
              </Box>
            </Box>
            <BasketSummary {...props} />
          </AccordionDetails>
        </Accordion>
      </Box>
    );
  }

  return (
    <>
      <Fab
        color="primary"
        aria-label="panier"
        sx={{ 
          position: 'fixed', 
          bottom: 32, 
          right: 32, 
          zIndex: 1300,
          display: 'flex',
          flexDirection: 'column',
          gap: 0.5
        }}
        onClick={() => setDrawerOpen(true)}
      >
        <Badge color="secondary" badgeContent={basketCount} max={99}>
          <ShoppingCartIcon />
        </Badge>
        {hasAnyPrice && (
          <Box sx={{ 
            position: 'absolute',
            top: -8,
            right: -8,
            p: 0.5,
            px: 1,
            background: 'linear-gradient(135deg, #4caf50 0%, #45a049 100%)',
            borderRadius: 1,
            color: 'white',
            fontSize: '0.7rem',
            fontWeight: 600,
            whiteSpace: 'nowrap',
            boxShadow: '0 2px 8px rgba(0,0,0,0.2)'
          }}>
          {new Intl.NumberFormat('fr-FR', {
            style: 'currency',
            currency: 'EUR',
            minimumFractionDigits: 0
          }).format(totalPrice)}
          </Box>
        )}
      </Fab>
      <Drawer
        anchor="right"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        PaperProps={{ sx: { width: { xs: '90vw', sm: 400 } } }}
      >
        <Box sx={{ p: 2, width: '100%' }}>
          <Box sx={{
            display: 'flex',
            alignItems: 'center',
            mb: 2,
            p: 1.5,
            borderRadius: 2,
            background: 'linear-gradient(90deg, #f5f7fa 0%, #e3f0ff 100%)',
            boxShadow: 1
          }}>
            <ShoppingCartIcon color="primary" sx={{ mr: 1 }} />
            <Box component="span" sx={{ fontWeight: 700, fontSize: '1.2rem', color: 'primary.main' }}>
              Panier de l'Offre
            </Box>
          </Box>
          <BasketSummary {...props} />
        </Box>
      </Drawer>
    </>
  );
};

export default OfferBasketDrawerAccordion; 