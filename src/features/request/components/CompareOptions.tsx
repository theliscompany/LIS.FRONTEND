import { useState, useEffect } from 'react';
import { BootstrapDialogTitle, activeStyles, buttonCloseStyles, inputLabelStyles } from '@utils/misc/styles';
import { Autocomplete, Button, DialogActions, DialogContent, InputLabel, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField, Chip, Tooltip } from '@mui/material';
import Grid from '@mui/material/Grid2';
import { useTranslation } from 'react-i18next';
import { getServicesTotal, getTotalPrice, getTotalPrices } from '@utils/functions';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import PaidIcon from '@mui/icons-material/Paid';
import { Box, Typography } from '@mui/material';

const CompareOptions = (props: any) => {
    const [option1, setOption1] = useState<any>(props.options[0] !== undefined && props.options[0] !== null ? props.options[0] : null);
    const [option2, setOption2] = useState<any>(props.options[1] !== undefined && props.options[1] !== null ? props.options[1] : null);
    const [option3, setOption3] = useState<any>(props.options[2] !== undefined && props.options[2] !== null ? props.options[2] : null);
    
    const { t } = useTranslation();
    
    function findIndexOfMax(arr: any) {
        if (arr.every((v: any) => v === arr[0]) || arr.length < 2) {
            return -1;
        }
    
        let maxIndex = 0;
        for (let i = 1; i < arr.length; i++) {
            if (arr[i] < arr[maxIndex]) {
                maxIndex = i;
            }
        }
    
        return maxIndex;
    }
    
    const getBestSeafreightIndex = (options: any) => {
        var val1 = getTotalPrices(Array.isArray(options[0].selectedSeafreights) ? options[0].selectedSeafreights : []);
        var val2 = getTotalPrices(Array.isArray(options[1].selectedSeafreights) ? options[1].selectedSeafreights : []);
        var val3 = 0;
        var numbersArray = [];
        if (options.length === 3) {
            val3 = getTotalPrices(Array.isArray(options[2].selectedSeafreights) ? options[2].selectedSeafreights : []);
            numbersArray = [val1,val2,val3];
        }
        else {
            numbersArray = [val1,val2];
        }
        return findIndexOfMax(numbersArray);
    };
      
    const getBestMiscIndex = (options: any) => {
        var val1 = getTotalPrices(Array.isArray(options[0].selectedMiscellaneous) ? options[0].selectedMiscellaneous : []);
        var val2 = getTotalPrices(Array.isArray(options[1].selectedMiscellaneous) ? options[1].selectedMiscellaneous : []);
        var val3 = 0;
        var numbersArray = [];
        if (options.length === 3) {
            val3 = getTotalPrices(Array.isArray(options[2].selectedMiscellaneous) ? options[2].selectedMiscellaneous : []);
            numbersArray = [val1,val2,val3];
        }
        else {
            numbersArray = [val1,val2];
        }
        return findIndexOfMax(numbersArray);
    };
      
    const getBestHaulageIndex = (options: any) => {
        var val1 = options[0].selectedHaulage !== null ? options[0].selectedHaulage.unitTariff : 0;
        var val2 = options[1].selectedHaulage !== null ? options[1].selectedHaulage.unitTariff : 0;
        var val3 = 0;
        var numbersArray = [];
        if (options.length === 3) {
            val3 = options[2].selectedHaulage !== null ? options[2].selectedHaulage.unitTariff : 0;
            numbersArray = [val1,val2,val3];
        }
        else {
            numbersArray = [val1,val2];
        }
        return findIndexOfMax(numbersArray);
    };
      
    const getBestMultiStopIndex = (options: any) => {
        var val1 = options[0].selectedHaulage !== null ? options[0].selectedHaulage.multiStop : 0;
        var val2 = options[1].selectedHaulage !== null ? options[1].selectedHaulage.multiStop : 0;
        var val3 = 0;
        var numbersArray = [];
        if (options.length === 3) {
            val3 = options[2].selectedHaulage !== null ? options[2].selectedHaulage.multiStop : 0;
            numbersArray = [val1,val2,val3];
        }
        else {
            numbersArray = [val1,val2];
        }
        return findIndexOfMax(numbersArray);
    };

    const getBestOvertimeIndex = (options: any) => {
        var val1 = options[0].selectedHaulage !== null ? options[0].selectedHaulage.overtimeTariff : 0;
        var val2 = options[1].selectedHaulage !== null ? options[1].selectedHaulage.overtimeTariff : 0;
        var val3 = 0;
        var numbersArray = [];
        if (options.length === 3) {
            val3 = options[2].selectedHaulage !== null ? options[2].selectedHaulage.overtimeTariff : 0;
            numbersArray = [val1,val2,val3];
        }
        else {
            numbersArray = [val1,val2];
        }
        return findIndexOfMax(numbersArray);
    };

    const getBestTotalIndex = (options: any) => {
        var val1 = options[0].selectedHaulage !== null ? options[0].selectedHaulage.unitTariff+getTotalPrices(Array.isArray(options[0].selectedSeafreights) ? options[0].selectedSeafreights : [])+getTotalPrices(Array.isArray(options[0].selectedMiscellaneous) ? options[0].selectedMiscellaneous : []) : 0;
        var val2 = options[1].selectedHaulage !== null ? options[1].selectedHaulage.unitTariff+getTotalPrices(Array.isArray(options[1].selectedSeafreights) ? options[1].selectedSeafreights : [])+getTotalPrices(Array.isArray(options[1].selectedMiscellaneous) ? options[1].selectedMiscellaneous : []) : 0;
        var val3 = 0;
        var numbersArray = [];
        if (options.length === 3) {
            val3 = options[2].selectedHaulage !== null ? options[2].selectedHaulage.unitTariff+getTotalPrices(Array.isArray(options[2].selectedSeafreights) ? options[2].selectedSeafreights : [])+getTotalPrices(Array.isArray(options[2].selectedMiscellaneous) ? options[2].selectedMiscellaneous : []) : 0;
            numbersArray = [val1,val2,val3];
        }
        else {
            numbersArray = [val1,val2];
        }
        return findIndexOfMax(numbersArray);
    };
      

    const getBestAltTotalIndex = (options: any) => {
        var val1 = getTotalPrices(Array.isArray(options[0].selectedSeafreights) ? options[0].selectedSeafreights : [])+getTotalPrices(Array.isArray(options[0].selectedMiscellaneous) ? options[0].selectedMiscellaneous : []);
        var val2 = getTotalPrices(Array.isArray(options[1].selectedSeafreights) ? options[1].selectedSeafreights : [])+getTotalPrices(Array.isArray(options[1].selectedMiscellaneous) ? options[1].selectedMiscellaneous : []);
        var val3 = 0;
        var numbersArray = [];
        if (options.length === 3) {
            val3 = getTotalPrices(Array.isArray(options[2].selectedSeafreights) ? options[2].selectedSeafreights : [])+getTotalPrices(Array.isArray(options[2].selectedMiscellaneous) ? options[2].selectedMiscellaneous : []);
            numbersArray = [val1,val2,val3];
        }
        else {
            numbersArray = [val1,val2];
        }
        return findIndexOfMax(numbersArray);
    };
      
    // Calcul utilitaire pour la marge en €
    const getMarginValue = (option: any) => {
        if (!option) return 0;
        if (option.marginType === 'percent') {
            // On suppose que le total unit price est bien le prix de revient
            return ((option.totalPrice || 0) - (option.totalPrice || 0) / (1 + (option.marginValue || 0) / 100));
        } else {
            return option.marginValue || 0;
        }
    };
    // Calcul utilitaire pour le total unit price (prix de revient)
    const getUnitPrice = (option: any) => {
        if (!option) return 0;
        // Haulage
        const haulage = option.selectedHaulage && option.selectedHaulage.unitTariff ? Number(option.selectedHaulage.unitTariff) : 0;
        const overtime = option.selectedHaulage && option.selectedHaulage.overtimeTariff ? Number(option.selectedHaulage.overtimeTariff) : 0;
        const multiStop = option.selectedHaulage && option.selectedHaulage.multiStop ? Number(option.selectedHaulage.multiStop) : 0;
        // Seafreight
        const seafreight = Array.isArray(option.selectedSeafreights) ? getTotalPrices(option.selectedSeafreights) : 0;
        // Miscellaneous
        const misc = Array.isArray(option.selectedMiscellaneous) ? getTotalPrices(option.selectedMiscellaneous) : 0;
        return haulage + overtime + multiStop + seafreight + misc;
    };

    // Calcul utilitaire pour la marge en %
    const getMarginPercent = (option: any) => {
        if (!option) return 0;
        const unitPrice = getUnitPrice(option);
        if (unitPrice === 0) return 0;
        if (option.marginType === 'percent') {
            return option.marginValue || 0;
        } else {
            return ((option.marginValue || 0) / unitPrice) * 100;
        }
    };

    // Utilitaire pour accès sécurisé aux champs seafreight
    const getSeafreightLabel = (option: any) => {
      const sf = option.selectedSeafreights?.[0];
      if (!sf) return '-';
      const dep = sf.departurePort?.name || sf.departurePortName || '-';
      const arr = sf.arrivalPort?.name || sf.destinationPortName || '-';
      const carrier = sf.carrier?.name || sf.carrierName || '-';
      return `${dep} - ${arr} | ${carrier}`;
    };

    // === CALCULS BASÉS SUR LES VALEURS DU TABLEAU (IDENTIQUES À STEP7RECAP) ===
    
    // Fonction pour calculer le total haulage (identique à Step7Recap)
    const computeHaulageTotal = (option: any) => {
      const haulageUnitTariff = option.selectedHaulage?.unitTariff || 0;
      const haulageQuantity = option.haulageQuantity ?? 1;
      return haulageUnitTariff * haulageQuantity;
    };

    // Fonction pour calculer le total seafreight (identique à Step7Recap)
    const computeSeafreightTotal = (option: any) => {
      const seafreights = Array.isArray(option.selectedSeafreights) ? option.selectedSeafreights : [];
      const seafreightQuantities = option.seafreightQuantities || {};
      let total = 0;
      
      seafreights.forEach((offer: any) => {
        const qty = seafreightQuantities[offer.id] ?? 1;
        const basePrice = typeof offer.charges?.basePrice === 'number' ? offer.charges.basePrice : 0;
        const lineTotal = basePrice * qty;
        total += lineTotal;
        
        // Surcharges
        const surcharges = Array.isArray(offer.charges?.surcharges) ? offer.charges.surcharges : [];
        const surchargeQuantities = option.surchargeQuantities || {};
        surcharges.forEach((s: any) => {
          const surchargeValue = s.amount || s.value || 0;
          const surchargeQty = surchargeQuantities?.[offer.id]?.[s.name || s.type] ?? qty;
          const surchargeTotal = surchargeValue * surchargeQty;
          total += surchargeTotal;
        });
      });
      
      return total;
    };

    // Fonction pour calculer le total misc (identique à Step7Recap)
    const computeMiscTotal = (option: any) => {
      const miscs = Array.isArray(option.selectedMiscellaneous) ? option.selectedMiscellaneous : [];
      const miscQuantities = option.miscQuantities || {};
      let total = 0;
      
      miscs.forEach((misc: any) => {
        const miscId = misc.id || misc.name || misc.designation || `misc-${Date.now()}`;
        const qty = miscQuantities[miscId] ?? 1;
        const basePrice = misc.pricing?.basePrice || 0;
        const lineTotal = basePrice * qty;
        total += lineTotal;
      });
      
      return total;
    };

    // Fonction pour calculer le costPrice (Total Unit Price) - identique à Step7Recap
    const computeCostPrice = (option: any) => {
      const haulageTotal = computeHaulageTotal(option);
      const seafreightTotal = computeSeafreightTotal(option);
      const miscTotal = computeMiscTotal(option);
      return haulageTotal + seafreightTotal + miscTotal;
    };
    // Ajoute une fonction utilitaire locale pour calculer le prix total de vente (totalPrice)
    const computeTotalPrice = (option: any) => {
      const costPrice = computeCostPrice(option);
      const marginType = option.marginType || 'percent';
      const marginValue = option.marginValue || 0;
      let marge = 0;
      if (marginType === 'percent') {
        marge = costPrice * (marginValue / 100);
      } else {
        marge = marginValue;
      }
      return costPrice + marge;
    };

    // Ajoute une fonction utilitaire locale pour calculer la marge (€ et %)
    const computeMargin = (option: any) => {
      const costPrice = computeCostPrice(option);
      const totalPrice = computeTotalPrice(option);
      const marge = totalPrice - costPrice;
      const margePercent = costPrice > 0 ? (marge / costPrice) * 100 : 0;
      return { marge, margePercent };
    };

    // Debug logs pour tracer les calculs
    const logCalculations = () => {
      [option1, option2, option3].forEach((option, index) => {
        if (option) {
          const haulageTotal = computeHaulageTotal(option);
          const seafreightTotal = computeSeafreightTotal(option);
          const miscTotal = computeMiscTotal(option);
          const costPrice = computeCostPrice(option);
          const totalPrice = computeTotalPrice(option);
          
          // Calculs de l'option ${index + 1}
        }
      });
    };
    
    // Appeler les logs au rendu
    logCalculations();

    // === EFFET POUR RECALCULER AUTOMATIQUEMENT À CHAQUE MODIFICATION ===
    useEffect(() => {
      logCalculations();
    }, [option1, option2, option3]);

    const bestOptionIdx = (() => {
      // Trouve l’index de la meilleure option (prix de vente le plus bas)
      const prices = [option1, option2, option3].map(opt => opt ? computeTotalPrice(opt) : Infinity);
      const min = Math.min(...prices);
      return prices.findIndex(p => p === min);
    })();

    return (
        <>
            <BootstrapDialogTitle id="custom-dialog-title2" onClose={() => props.closeModal()}>
                <b>{t('compareOptions')}</b>
            </BootstrapDialogTitle>
            <DialogContent dividers>
                <Grid container spacing={2}>
                    {/* Supprime tout le bloc contenant les trois Autocomplete (Option 1, Option 2, Option 3) et leurs InputLabel, Grid, etc. en haut de la page.
                        Garde uniquement le titre et le tableau de comparaison. */}
                    
                    <Grid size={{ xs: 12 }}>
                        <Box sx={{
                            maxWidth: 1100,
                            mx: 'auto',
                            my: 4,
                            p: 3,
                            borderRadius: 4,
                            background: 'linear-gradient(135deg, #f5f7fa 0%, #e3f0ff 100%)',
                            boxShadow: '0 8px 32px rgba(25,118,210,0.10)'
                        }}>
                            <Typography variant="h5" sx={{ fontWeight: 700, color: 'primary.main', mb: 3 }}>
                                {t('compareOptions')}
                            </Typography>
                            <TableContainer component={Paper} sx={{ borderRadius: 3, boxShadow: 3, overflowX: 'auto' }}>
                                <Table sx={{ minWidth: 650 }} size="small" aria-label="a dense table">
                                    <TableHead>
                                        <TableRow>
                                            <TableCell sx={{ background: '#b3d6ea', fontWeight: 700, fontSize: 16 }} />
                                            {[option1, option2, option3].map((opt, idx) => opt && (
                                                <TableCell
                                                    key={idx}
                                                    sx={{
                                                        background: idx === bestOptionIdx ? '#e3f0ff' : '#fff',
                                                        borderTopLeftRadius: idx === 0 ? 12 : 0,
                                                        borderTopRightRadius: idx === 2 ? 12 : 0,
                                                        fontWeight: 700,
                                                        fontSize: 18,
                                                        color: '#1976d2',
                                                        position: 'relative',
                                                        minWidth: 220
                                                    }}
                                                >
                                                    Option {idx + 1}
                                                    {idx === bestOptionIdx && (
                                                        <Chip label="Meilleur prix" size="small" sx={{ position: 'absolute', top: 8, right: 8, background: '#388e3c', color: '#fff', fontWeight: 700 }} />
                                                    )}
                                                </TableCell>
                                            ))}
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        <TableRow>
                                            <TableCell component="th" scope="row" sx={{ background: '#b3d6ea' }}>{t('haulierName')}</TableCell>
                                            {
                                                option1 !== null && option1 !== "" && option1 !== undefined && option1.selectedHaulage !== null ? 
                                                <TableCell component="th" scope="row">{option1.selectedHaulage.haulierName}</TableCell> : null
                                            }
                                            {
                                                option2 !== null && option2 !== "" && option2 !== undefined && option2.selectedHaulage !== null ? 
                                                <TableCell component="th" scope="row">{option2.selectedHaulage.haulierName}</TableCell> : null
                                            }
                                            {
                                                option3 !== null && option3 !== "" && option3 !== undefined && option3.selectedHaulage !== null ? 
                                                <TableCell component="th" scope="row">{option3.selectedHaulage.haulierName}</TableCell> : null
                                            }
                                        </TableRow>

                                        <TableRow>
                                            <TableCell component="th" scope="row" sx={{ background: '#b3d6ea' }}>{t('haulageTariff')}</TableCell>
                                            {
                                                option1 !== null && option1 !== "" && option1 !== undefined && option1.selectedHaulage !== null ? 
                                                <TableCell component="th" scope="row" sx={{}}>
                                                    {option1.selectedHaulage.unitTariff} €
                                                </TableCell> : null
                                            }
                                            {
                                                option2 !== null && option2 !== "" && option2 !== undefined && option2.selectedHaulage !== null ? 
                                                <TableCell component="th" scope="row" sx={{}}>
                                                    {option2.selectedHaulage.unitTariff} €
                                                </TableCell> : null
                                            }
                                            {
                                                option3 !== null && option3 !== "" && option3 !== undefined && option3.selectedHaulage !== null ? 
                                                <TableCell component="th" scope="row" sx={{}}>
                                                    {option3.selectedHaulage.unitTariff} €
                                                </TableCell> : null
                                            }
                                        </TableRow>
                                        
                                        {/* === NOUVELLE LIGNE : QUANTITÉ HAULAGE === */}
                                        <TableRow>
                                            <TableCell component="th" scope="row" sx={{ background: '#b3d6ea' }}>Quantité Haulage</TableCell>
                                            {
                                                option1 !== null && option1 !== "" && option1 !== undefined ? 
                                                <TableCell component="th" scope="row" sx={{}}>
                                                    {option1.haulageQuantity || 1}
                                                </TableCell> : null
                                            }
                                            {
                                                option2 !== null && option2 !== "" && option2 !== undefined ? 
                                                <TableCell component="th" scope="row" sx={{}}>
                                                    {option2.haulageQuantity || 1}
                                                </TableCell> : null
                                            }
                                            {
                                                option3 !== null && option3 !== "" && option3 !== undefined ? 
                                                <TableCell component="th" scope="row" sx={{}}>
                                                    {option3.haulageQuantity || 1}
                                                </TableCell> : null
                                            }
                                        </TableRow>
                                        <TableRow>
                                            <TableCell component="th" scope="row" sx={{ background: '#b3d6ea' }}>Distance Haulage</TableCell>
                                            {option1 && <TableCell component="th" scope="row">{option1.selectedHaulage?.distanceKm != null ? option1.selectedHaulage.distanceKm + ' km' : '-'}</TableCell>}
                                            {option2 && <TableCell component="th" scope="row">{option2.selectedHaulage?.distanceKm != null ? option2.selectedHaulage.distanceKm + ' km' : '-'}</TableCell>}
                                            {option3 && <TableCell component="th" scope="row">{option3.selectedHaulage?.distanceKm != null ? option3.selectedHaulage.distanceKm + ' km' : '-'}</TableCell>}
                                        </TableRow>
                                        
                                        <TableRow>
                                            <TableCell component="th" scope="row" sx={{ background: '#b3d6ea' }}>{t('multiStop')}</TableCell>
                                            {
                                                option1 !== null && option1 !== "" && option1 !== undefined && option1.selectedHaulage !== null ? 
                                                <TableCell component="th" scope="row" sx={{}}>
                                                    {option1.selectedHaulage.multiStop} €
                                                </TableCell> : null
                                            }
                                            {
                                                option2 !== null && option2 !== "" && option2 !== undefined && option2.selectedHaulage !== null ? 
                                                <TableCell component="th" scope="row" sx={{}}>
                                                    {option2.selectedHaulage.multiStop} €
                                                </TableCell> : null
                                            }
                                            {
                                                option3 !== null && option3 !== "" && option3 !== undefined && option3.selectedHaulage !== null ? 
                                                <TableCell component="th" scope="row" sx={{}}>
                                                    {option3.selectedHaulage.multiStop} €
                                                </TableCell> : null
                                            }
                                        </TableRow>

                                        <TableRow>
                                            <TableCell component="th" scope="row" sx={{ background: '#b3d6ea' }}>{t('overtimeTariff')}</TableCell>
                                            {
                                                option1 !== null && option1 !== "" && option1 !== undefined && option1.selectedHaulage !== null ? 
                                                <TableCell component="th" scope="row" sx={{}}>
                                                    {option1.selectedHaulage.overtimeTariff} €
                                                </TableCell> : null
                                            }
                                            {
                                                option2 !== null && option2 !== "" && option2 !== undefined && option2.selectedHaulage !== null ? 
                                                <TableCell component="th" scope="row" sx={{}}>
                                                    {option2.selectedHaulage.overtimeTariff} €
                                                </TableCell> : null
                                            }
                                            {
                                                option3 !== null && option3 !== "" && option3 !== undefined && option3.selectedHaulage !== null ? 
                                                <TableCell component="th" scope="row" sx={{}}>
                                                    {option3.selectedHaulage.overtimeTariff} €
                                                </TableCell> : null
                                            }
                                        </TableRow>
                                                                        
                                        <TableRow>
                                            <TableCell component="th" scope="row" sx={{ background: '#b3d6ea' }}>{t('carrier')}</TableCell>
                                            {
                                                option1 !== null && option1 !== "" && option1 !== undefined ? 
                                                <TableCell component="th" scope="row">{option1.selectedSeafreights?.[0]?.carrier?.name || option1.selectedSeafreights?.[0]?.carrierName || '-'}</TableCell> : null
                                            }
                                            {
                                                option2 !== null && option2 !== "" && option2 !== undefined ? 
                                                <TableCell component="th" scope="row">{option2.selectedSeafreights?.[0]?.carrier?.name || option2.selectedSeafreights?.[0]?.carrierName || '-'}</TableCell> : null
                                            }
                                            {
                                                option3 !== null && option3 !== "" && option3 !== undefined ? 
                                                <TableCell component="th" scope="row">{option3.selectedSeafreights?.[0]?.carrier?.name || option3.selectedSeafreights?.[0]?.carrierName || '-'}</TableCell> : null
                                            }
                                        </TableRow>
                                        <TableRow>
                                            <TableCell component="th" scope="row" sx={{ background: '#b3d6ea' }}>Route</TableCell>
                                            {option1 && <TableCell component="th" scope="row">{(option1.selectedSeafreights?.[0]?.departurePort?.name || option1.selectedSeafreights?.[0]?.departurePortName || '-') + ' - ' + (option1.selectedSeafreights?.[0]?.arrivalPort?.name || option1.selectedSeafreights?.[0]?.arrivalPortName || '-')}</TableCell>}
                                            {option2 && <TableCell component="th" scope="row">{(option2.selectedSeafreights?.[0]?.departurePort?.name || option2.selectedSeafreights?.[0]?.departurePortName || '-') + ' - ' + (option2.selectedSeafreights?.[0]?.arrivalPort?.name || option2.selectedSeafreights?.[0]?.arrivalPortName || '-')}</TableCell>}
                                            {option3 && <TableCell component="th" scope="row">{(option3.selectedSeafreights?.[0]?.departurePort?.name || option3.selectedSeafreights?.[0]?.departurePortName || '-') + ' - ' + (option3.selectedSeafreights?.[0]?.arrivalPort?.name || option3.selectedSeafreights?.[0]?.arrivalPortName || '-')}</TableCell>}
                                        </TableRow>
                                        
                                        <TableRow>
                                            <TableCell component="th" scope="row" sx={{ background: '#b3d6ea' }}>{t('seafreightTariff')}</TableCell>
                                            {
                                                option1 !== null && option1 !== "" && option1 !== undefined ? 
                                                <TableCell component="th" scope="row" sx={{}}>
                                                    {(() => {
                                                        const total = computeSeafreightTotal(option1);
                                                        return (total && total > 0)
                                                          ? total.toLocaleString(undefined, { maximumFractionDigits: 2 }) + ' €'
                                                          : (option1.totalPrice ? option1.totalPrice.toLocaleString(undefined, { maximumFractionDigits: 2 }) + ' €' : '-');
                                                    })()}
                                                </TableCell> : null
                                            }
                                            {
                                                option2 !== null && option2 !== "" && option2 !== undefined ? 
                                                <TableCell component="th" scope="row" sx={{}}>
                                                    {(() => {
                                                        const total = computeSeafreightTotal(option2);
                                                        return (total && total > 0)
                                                          ? total.toLocaleString(undefined, { maximumFractionDigits: 2 }) + ' €'
                                                          : (option2.totalPrice ? option2.totalPrice.toLocaleString(undefined, { maximumFractionDigits: 2 }) + ' €' : '-');
                                                    })()}
                                                </TableCell> : null
                                            }
                                            {
                                                option3 !== null && option3 !== "" && option3 !== undefined ? 
                                                <TableCell component="th" scope="row" sx={{}}>
                                                    {(() => {
                                                        const total = computeSeafreightTotal(option3);
                                                        return (total && total > 0)
                                                          ? total.toLocaleString(undefined, { maximumFractionDigits: 2 }) + ' €'
                                                          : (option3.totalPrice ? option3.totalPrice.toLocaleString(undefined, { maximumFractionDigits: 2 }) + ' €' : '-');
                                                    })()}
                                                </TableCell> : null
                                            }
                                        </TableRow>
                                        
                                        <TableRow>
                                            <TableCell component="th" scope="row" sx={{ background: '#b3d6ea' }}>{t('seafreightDetails')}</TableCell>
                                            {
                                                option1 !== null && option1 !== "" && option1 !== undefined ? 
                                                <TableCell component="th" scope="row">
                                                    {(Array.isArray(option1.selectedSeafreights) ? option1.selectedSeafreights : []).map((elm: any, id: number) => (
                                                        <div key={"ssf1-"+id} style={{ marginTop: 2, marginBottom: 2 }}>
                                                            <b>Type :</b> {elm.containerType || elm.type || elm.typeName || '-'} | <b>Transit :</b> {elm.transitTimeDays || elm.transitTime || '-'} {t('days')}
                                                        </div>
                                                    ))}
                                                </TableCell> : null
                                            }
                                            {
                                                option2 !== null && option2 !== "" && option2 !== undefined ? 
                                                <TableCell component="th" scope="row">
                                                    {(Array.isArray(option2.selectedSeafreights) ? option2.selectedSeafreights : []).map((elm: any, id: number) => (
                                                        <div key={"ssf2-"+id} style={{ marginTop: 2, marginBottom: 2 }}>
                                                            <b>Type :</b> {elm.containerType || elm.type || elm.typeName || '-'} | <b>Transit :</b> {elm.transitTimeDays || elm.transitTime || '-'} {t('days')}
                                                        </div>
                                                    ))}
                                                </TableCell> : null
                                            }
                                            {
                                                option3 !== null && option3 !== "" && option3 !== undefined ? 
                                                <TableCell component="th" scope="row">
                                                    {(Array.isArray(option3.selectedSeafreights) ? option3.selectedSeafreights : []).map((elm: any, id: number) => (
                                                        <div key={"ssf3-"+id} style={{ marginTop: 2, marginBottom: 2 }}>
                                                            <b>Type :</b> {elm.containerType || elm.type || elm.typeName || '-'} | <b>Transit :</b> {elm.transitTimeDays || elm.transitTime || '-'} {t('days')}
                                                        </div>
                                                    ))}
                                                </TableCell> : null
                                            }
                                        </TableRow>
                                        
                                        {/* === NOUVELLE LIGNE : QUANTITÉS SEAFREIGHT === */}
                                        <TableRow>
                                            <TableCell component="th" scope="row" sx={{ background: '#b3d6ea' }}>Quantités Seafreight</TableCell>
                                            {
                                                option1 !== null && option1 !== "" && option1 !== undefined ? 
                                                <TableCell component="th" scope="row">
                                                    {(Array.isArray(option1.selectedSeafreights) ? option1.selectedSeafreights : []).map((elm: any, id: number) => {
                                                        const qty = option1.seafreightQuantities?.[elm.id] || 1;
                                                        return (
                                                            <div key={"qty-sf1-"+id} style={{ marginTop: 2, marginBottom: 2 }}>
                                                                <b>{elm.containerType || elm.type || elm.typeName || 'Container'} :</b> {qty}
                                                            </div>
                                                        );
                                                    })}
                                                </TableCell> : null
                                            }
                                            {
                                                option2 !== null && option2 !== "" && option2 !== undefined ? 
                                                <TableCell component="th" scope="row">
                                                    {(Array.isArray(option2.selectedSeafreights) ? option2.selectedSeafreights : []).map((elm: any, id: number) => {
                                                        const qty = option2.seafreightQuantities?.[elm.id] || 1;
                                                        return (
                                                            <div key={"qty-sf2-"+id} style={{ marginTop: 2, marginBottom: 2 }}>
                                                                <b>{elm.containerType || elm.type || elm.typeName || 'Container'} :</b> {qty}
                                                            </div>
                                                        );
                                                    })}
                                                </TableCell> : null
                                            }
                                            {
                                                option3 !== null && option3 !== "" && option3 !== undefined ? 
                                                <TableCell component="th" scope="row">
                                                    {(Array.isArray(option3.selectedSeafreights) ? option3.selectedSeafreights : []).map((elm: any, id: number) => {
                                                        const qty = option3.seafreightQuantities?.[elm.id] || 1;
                                                        return (
                                                            <div key={"qty-sf3-"+id} style={{ marginTop: 2, marginBottom: 2 }}>
                                                                <b>{elm.containerType || elm.type || elm.typeName || 'Container'} :</b> {qty}
                                                            </div>
                                                        );
                                                    })}
                                                </TableCell> : null
                                            }
                                        </TableRow>
                                        
                                        
                                        <TableRow>
                                            <TableCell component="th" scope="row" sx={{ background: '#b3d6ea' }}>{t('miscTariff')}</TableCell>
                                            {
                                                option1 !== null && option1 !== "" && option1 !== undefined ? 
                                                <TableCell component="th" scope="row" sx={{}}>
                                                    {(() => {
                                                        const total = computeMiscTotal(option1);
                                                        return (total && total > 0)
                                                          ? total.toLocaleString(undefined, { maximumFractionDigits: 2 }) + ' €'
                                                          : '0 €';
                                                    })()}
                                                </TableCell> : null
                                            }
                                            {
                                                option2 !== null && option2 !== "" && option2 !== undefined ? 
                                                <TableCell component="th" scope="row" sx={{}}>
                                                    {(() => {
                                                        const total = computeMiscTotal(option2);
                                                        return (total && total > 0)
                                                          ? total.toLocaleString(undefined, { maximumFractionDigits: 2 }) + ' €'
                                                          : '0 €';
                                                    })()}
                                                </TableCell> : null
                                            }
                                            {
                                                option3 !== null && option3 !== "" && option3 !== undefined ? 
                                                <TableCell component="th" scope="row" sx={{}}>
                                                    {(() => {
                                                        const total = computeMiscTotal(option3);
                                                        return (total && total > 0)
                                                          ? total.toLocaleString(undefined, { maximumFractionDigits: 2 }) + ' €'
                                                          : '0 €';
                                                    })()}
                                                </TableCell> : null
                                            }
                                        </TableRow>
                                        
                                        
                                        <TableRow>
                                            <TableCell component="th" scope="row" sx={{ background: '#b3d6ea' }}>{t('miscDetails')}</TableCell>
                                            {
                                                option1 !== null && option1 !== "" && option1 !== undefined ? 
                                                <TableCell component="th" scope="row">
                                                    {(Array.isArray(option1.selectedMiscellaneous) ? option1.selectedMiscellaneous : []).map((elm: any, id: number) => (
                                                        <div key={"ssvf1-"+id} style={{ marginTop: 2, marginBottom: 2 }}>{elm.textServices}</div>
                                                    ))}
                                                </TableCell> : null
                                            }
                                            {
                                                option2 !== null && option2 !== "" && option2 !== undefined ? 
                                                <TableCell component="th" scope="row">
                                                    {(Array.isArray(option2.selectedMiscellaneous) ? option2.selectedMiscellaneous : []).map((elm: any, id: number) => (
                                                        <div key={"ssvf2-"+id} style={{ marginTop: 2, marginBottom: 2 }}>{elm.textServices}</div>
                                                    ))}
                                                </TableCell> : null
                                            }
                                            {
                                                option3 !== null && option3 !== "" && option3 !== undefined ? 
                                                <TableCell component="th" scope="row">
                                                    {(Array.isArray(option3.selectedMiscellaneous) ? option3.selectedMiscellaneous : []).map((elm: any, id: number) => (
                                                        <div key={"ssvf3-"+id} style={{ marginTop: 2, marginBottom: 2 }}>{elm.textServices}</div>
                                                    ))}
                                                </TableCell> : null
                                            }
                                        </TableRow>
                                        
                                        {/* === NOUVELLE LIGNE : QUANTITÉS MISCELLANEOUS === */}
                                        <TableRow>
                                            <TableCell component="th" scope="row" sx={{ background: '#b3d6ea' }}>Quantités Miscellaneous</TableCell>
                                            {
                                                option1 !== null && option1 !== "" && option1 !== undefined ? 
                                                <TableCell component="th" scope="row">
                                                    {(Array.isArray(option1.selectedMiscellaneous) ? option1.selectedMiscellaneous : []).map((elm: any, id: number) => {
                                                        const qty = option1.miscQuantities?.[elm.id] || 1;
                                                        return (
                                                            <div key={"qty-misc1-"+id} style={{ marginTop: 2, marginBottom: 2 }}>
                                                                <b>{elm.serviceName || elm.textServices || 'Service'} :</b> {qty}
                                                            </div>
                                                        );
                                                    })}
                                                </TableCell> : null
                                            }
                                            {
                                                option2 !== null && option2 !== "" && option2 !== undefined ? 
                                                <TableCell component="th" scope="row">
                                                    {(Array.isArray(option2.selectedMiscellaneous) ? option2.selectedMiscellaneous : []).map((elm: any, id: number) => {
                                                        const qty = option2.miscQuantities?.[elm.id] || 1;
                                                        return (
                                                            <div key={"qty-misc2-"+id} style={{ marginTop: 2, marginBottom: 2 }}>
                                                                <b>{elm.serviceName || elm.textServices || 'Service'} :</b> {qty}
                                                            </div>
                                                        );
                                                    })}
                                                </TableCell> : null
                                            }
                                            {
                                                option3 !== null && option3 !== "" && option3 !== undefined ? 
                                                <TableCell component="th" scope="row">
                                                    {(Array.isArray(option3.selectedMiscellaneous) ? option3.selectedMiscellaneous : []).map((elm: any, id: number) => {
                                                        const qty = option3.miscQuantities?.[elm.id] || 1;
                                                        return (
                                                            <div key={"qty-misc3-"+id} style={{ marginTop: 2, marginBottom: 2 }}>
                                                                <b>{elm.serviceName || elm.textServices || 'Service'} :</b> {qty}
                                                            </div>
                                                        );
                                                    })}
                                                </TableCell> : null
                                            }
                                        </TableRow>
                                        
                                        
                                        <TableRow>
                                            <TableCell component="th" scope="row" sx={{ background: '#b3d6ea' }}><b>Total Unit Price</b></TableCell>
                                            {option1 && <TableCell component="th" scope="row"><b>{computeCostPrice(option1).toLocaleString(undefined, { maximumFractionDigits: 2 })} €</b></TableCell>}
                                            {option2 && <TableCell component="th" scope="row"><b>{computeCostPrice(option2).toLocaleString(undefined, { maximumFractionDigits: 2 })} €</b></TableCell>}
                                            {option3 && <TableCell component="th" scope="row"><b>{computeCostPrice(option3).toLocaleString(undefined, { maximumFractionDigits: 2 })} €</b></TableCell>}
                                        </TableRow>
                                        {/* Nouvelle ligne Marge */}
                                        <TableRow>
                                            <TableCell component="th" scope="row" sx={{ background: "#e3f0ff", color: '#1976d2', fontWeight: 600, textAlign: 'center' }}>
                                                Marge
                                            </TableCell>
                                            {option1 && (() => { const { marge, margePercent } = computeMargin(option1); return <TableCell align="center" component="th" scope="row">{marge.toLocaleString(undefined, { maximumFractionDigits: 2 })} € ({margePercent.toLocaleString(undefined, { maximumFractionDigits: 2 })} %)</TableCell>; })()}
                                            {option2 && (() => { const { marge, margePercent } = computeMargin(option2); return <TableCell align="center" component="th" scope="row">{marge.toLocaleString(undefined, { maximumFractionDigits: 2 })} € ({margePercent.toLocaleString(undefined, { maximumFractionDigits: 2 })} %)</TableCell>; })()}
                                            {option3 && (() => { const { marge, margePercent } = computeMargin(option3); return <TableCell align="center" component="th" scope="row">{marge.toLocaleString(undefined, { maximumFractionDigits: 2 })} € ({margePercent.toLocaleString(undefined, { maximumFractionDigits: 2 })} %)</TableCell>; })()}
                                        </TableRow>
                                        <TableRow sx={{ background: 'linear-gradient(90deg, #e3f0ff 0%, #f5f7fa 100%)', boxShadow: '0 2px 12px #1976d220' }}>
                                            <TableCell component="th" scope="row" sx={{ background: '#e3f0ff', color: '#388e3c', fontWeight: 700, fontSize: 18, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                <PaidIcon sx={{ mr: 1, color: '#388e3c' }} /> Total (prix de vente)
                                            </TableCell>
                                            {option1 && (
                                                <TableCell align="center" component="th" scope="row" sx={{ fontWeight: 700, color: '#388e3c', fontSize: 20, textShadow: '0 1px 4px #1976d210' }}><b>{computeTotalPrice(option1).toLocaleString(undefined, { maximumFractionDigits: 2 })} €</b></TableCell>
                                            )}
                                            {option2 && (
                                                <TableCell align="center" component="th" scope="row" sx={{ fontWeight: 700, color: '#388e3c', fontSize: 20, textShadow: '0 1px 4px #1976d210' }}><b>{computeTotalPrice(option2).toLocaleString(undefined, { maximumFractionDigits: 2 })} €</b></TableCell>
                                            )}
                                            {option3 && (
                                                <TableCell align="center" component="th" scope="row" sx={{ fontWeight: 700, color: '#388e3c', fontSize: 20, textShadow: '0 1px 4px #1976d210' }}><b>{computeTotalPrice(option3).toLocaleString(undefined, { maximumFractionDigits: 2 })} €</b></TableCell>
                                            )}
                                        </TableRow>
                                            
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        </Box>
                    </Grid>
                </Grid>
            </DialogContent>
            <DialogActions sx={{ justifyContent: 'center', mt: 3 }}>
                {props.options && props.options[0] && (
                  <Button variant="contained" color="primary" onClick={() => props.onSelectOption(0)} sx={{ borderRadius: 3, boxShadow: 2, fontWeight: 700, px: 3, py: 1.2, mx: 1, fontSize: 16 }}>
                    Choisir l'option 1
                  </Button>
                )}
                {props.options && props.options[1] && (
                  <Button variant="contained" color="primary" onClick={() => props.onSelectOption(1)} sx={{ borderRadius: 3, boxShadow: 2, fontWeight: 700, px: 3, py: 1.2, mx: 1, fontSize: 16 }}>
                    Choisir l'option 2
                  </Button>
                )}
                {props.options && props.options[2] && (
                  <Button variant="contained" color="primary" onClick={() => props.onSelectOption(2)} sx={{ borderRadius: 3, boxShadow: 2, fontWeight: 700, px: 3, py: 1.2, mx: 1, fontSize: 16 }}>
                    Choisir l'option 3
                  </Button>
                )}
                <Button variant="outlined" onClick={props.closeModal} sx={{ ...buttonCloseStyles, borderRadius: 3, fontWeight: 700, px: 3, py: 1.2, mx: 1, fontSize: 16 }}>{t('close')}</Button>
            </DialogActions>
        </>
    );
}

export default CompareOptions;
