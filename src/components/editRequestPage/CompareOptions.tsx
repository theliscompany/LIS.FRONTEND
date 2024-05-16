import { useState } from 'react';
import { BootstrapDialogTitle, buttonCloseStyles, inputLabelStyles } from '../../utils/misc/styles';
import { Autocomplete, Button, DialogActions, DialogContent, Grid, InputLabel, List, ListItem, TextField } from '@mui/material';
import { useAuthorizedBackendApi } from '../../api/api';
import { useTranslation } from 'react-i18next';
import { useAccount, useMsal } from '@azure/msal-react';
import { getServicesTotal, getTotalPrice, getTotalPrices } from '../../utils/functions';

function CompareOptions(props: any) {
    const [option1, setOption1] = useState<any>(props.options[0] !== undefined && props.options[0] !== null ? props.options[0] : null);
    const [option2, setOption2] = useState<any>(props.options[1] !== undefined && props.options[1] !== null ? props.options[1] : null);
    const [option3, setOption3] = useState<any>(props.options[2] !== undefined && props.options[2] !== null ? props.options[2] : null);
    
    const { instance, accounts } = useMsal();
    const account = useAccount(accounts[0] || {});

    const context = useAuthorizedBackendApi();
    const { t } = useTranslation();
    
    const getBestSeafreightIndex = (options: any) => {
        const allPricesEqual = options.every((elm: any) => getTotalPrices(elm.selectedSeafreights) === getTotalPrices(options[0].selectedSeafreights));
        if (!allPricesEqual) {
            const usableOptions = options.filter((elm: any) => elm !== null);
            const bestId = usableOptions.reduce((bestIndex: number, option: any, currentIndex: number) => {
                if (!option.selectedSeafreights) {
                    return bestIndex;
                }
                const optionTotalPrice = getTotalPrices(option.selectedSeafreights);
                const bestOptionTotalPrice = bestIndex !== null && usableOptions[bestIndex].selectedSeafreights ? 
                getTotalPrices(usableOptions[bestIndex].selectedSeafreights) : Infinity;
                if (optionTotalPrice < bestOptionTotalPrice) {
                    return currentIndex;
                }
                return bestIndex;
            }, null);
            return bestId;
        }
        return -1;
    };
      
    const getBestMiscIndex = (options: any) => {
        const allPricesEqual = options.every((elm: any) => getTotalPrices(elm.myMiscs) === getTotalPrices(options[0].myMiscs));
        if (!allPricesEqual) {
            const usableOptions = options.filter((elm: any) => elm !== null);
            const bestId = usableOptions.reduce((bestIndex: number, option: any, currentIndex: number) => {
                if (!option.myMiscs) {
                    return bestIndex;
                }
                const optionTotalPrice = getTotalPrices(option.myMiscs);
                const bestOptionTotalPrice = bestIndex !== null && usableOptions[bestIndex].myMiscs
                    ? getTotalPrices(usableOptions[bestIndex].myMiscs) : Infinity;
                if (optionTotalPrice < bestOptionTotalPrice) {
                    return currentIndex;
                } 
                else if (optionTotalPrice === bestOptionTotalPrice) {
                    return bestIndex;
                }
                return bestIndex;
            }, null);
            if (bestId === null) {
                // All prices are equal, so return -1
                return -1;
            }
            return bestId;
        }
        return -1;
    };
      
    const getBestHaulageIndex = (options: any) => {
        const allPricesEqual = options.every((elm: any) => elm.selectedHaulage.unitTariff === options[0].selectedHaulage.unitTariff);
        if (!allPricesEqual) {
            var usableOptions = options.filter((elm: any) => elm !== null);
            var bestId = usableOptions.reduce((bestIndex: number, option: any, currentIndex: number) => {
                if (option !== undefined && option !== null && option !== "") {
                    if (!option.selectedHaulage) {
                        return bestIndex;
                    }
                    const { selectedHaulage } = option;
                    if (!bestIndex || selectedHaulage.unitTariff < usableOptions[bestIndex].selectedHaulage.unitTariff) {
                        return currentIndex;
                    }
                    return bestIndex;
                }
            }, null);
            return bestId;
        }
        return -1;
    };
      
    const getBestMultiStopIndex = (options: any) => {
        const allPricesEqual = options.every((elm: any) => elm.selectedHaulage.multiStop === options[0].selectedHaulage.multiStop);
        if (!allPricesEqual) {
            var usableOptions = options.filter((elm: any) => elm !== null);
            var bestId = usableOptions.reduce((bestIndex: number, option: any, currentIndex: number) => {
                if (option !== undefined && option !== null && option !== "") {
                    if (!option.selectedHaulage) {
                        return bestIndex;
                    }
                    const { selectedHaulage } = option;
                    if (!bestIndex || selectedHaulage.multiStop < usableOptions[bestIndex].selectedHaulage.multiStop) {
                        return currentIndex;
                    }
                    return bestIndex;
                }
            }, null);
            return bestId;
        }
        return -1;
    };

    const getBestOvertimeIndex = (options: any) => {
        const allPricesEqual = options.every((elm: any) => elm.selectedHaulage.overtimeTariff === options[0].selectedHaulage.overtimeTariff);
        if (!allPricesEqual) {
            var usableOptions = options.filter((elm: any) => elm !== null);
            var bestId = usableOptions.reduce((bestIndex: number, option: any, currentIndex: number) => {
                if (option !== undefined && option !== null && option !== "") {
                    if (!option.selectedHaulage) {
                        return bestIndex;
                    }
                    const { selectedHaulage } = option;
                    if (!bestIndex || selectedHaulage.overtimeTariff < usableOptions[bestIndex].selectedHaulage.overtimeTariff) {
                        return currentIndex;
                    }
                    return bestIndex;
                }
            }, null);
            return bestId;
        }
        return -1;
    };

    const getBestTotalIndex = (options: any) => {
        const allPricesEqual = options.every((elm: any) => elm.selectedHaulage.unitTariff+getTotalPrices(elm.selectedSeafreights)+getTotalPrices(elm.myMiscs) === options[0].selectedHaulage.unitTariff+getTotalPrices(options[0].selectedSeafreights)+getTotalPrices(options[0].myMiscs));
        if (!allPricesEqual) {
            var usableOptions = options.filter((elm: any) => elm !== null);
            var bestId = usableOptions.reduce((bestIndex: number, option: any, currentIndex: number) => {
                if (option !== undefined && option !== null && option !== "") {
                    if (!option.selectedHaulage) {
                        return bestIndex;
                    }
                    if (!bestIndex || option.selectedHaulage.unitTariff+getTotalPrices(option.selectedSeafreights)+getTotalPrices(option.myMiscs) < usableOptions[bestIndex].selectedHaulage.unitTariff+getTotalPrices(usableOptions[bestIndex].selectedSeafreights)+getTotalPrices(usableOptions[bestIndex].myMiscs)) {
                        return currentIndex;
                    }
                    return bestIndex;
                }
            }, null);
            return bestId;    
        }
        return -1;
    };
      

    const getBestAltTotalIndex = (options: any) => {
        const allPricesEqual = options.every((elm: any) => getTotalPrices(elm.selectedSeafreights)+getTotalPrices(elm.myMiscs) === getTotalPrices(options[0].selectedSeafreights)+getTotalPrices(options[0].myMiscs));
        if (!allPricesEqual) {
            var usableOptions = options.filter((elm: any) => elm !== null);
            var bestId = usableOptions.reduce((bestIndex: number, option: any, currentIndex: number) => {
                if (option !== undefined && option !== null && option !== "") {
                    if (!option.selectedHaulage) {
                        return bestIndex;
                    }
                    if (!bestIndex || getTotalPrices(option.selectedSeafreights)+getTotalPrices(option.myMiscs) < getTotalPrices(usableOptions[bestIndex].selectedSeafreights)+getTotalPrices(usableOptions[bestIndex].myMiscs)) {
                        return currentIndex;
                    }
                    return bestIndex;
                }
            }, null);
            return bestId;    
        }
        return -1;
    };
      
    return (
        <>
            <BootstrapDialogTitle id="custom-dialog-title2" onClose={() => props.closeModal()}>
                <b>Compare options</b>
            </BootstrapDialogTitle>
            <DialogContent dividers>
                <Grid container spacing={2}>
                    <Grid item xs={12} md={4}>
                        <InputLabel htmlFor="option1" sx={inputLabelStyles}>Option 1</InputLabel>
                        <Autocomplete
                            disablePortal
                            id="option1"
                            getOptionLabel={(option: any) => { 
                                return option.selectedSeafreight.departurePortName+" - "+option.selectedSeafreight.destinationPortName+" | "+option.selectedSeafreight.carrierName;
                            }}
                            value={option1}
                            options={props.options}
                            fullWidth
                            disabled
                            onChange={(e: any, value: any) => { 
                                console.log(value);
                                setOption1(value); 
                            }}
                            renderInput={(params: any) => <TextField {...params} label="" />}
                            sx={{ mt: 1 }}
                        />
                    </Grid>
                    <Grid item xs={12} md={4}>
                        <InputLabel htmlFor="option2" sx={inputLabelStyles}>Option 2</InputLabel>
                        <Autocomplete
                            disablePortal
                            id="option2"
                            getOptionLabel={(option: any) => { 
                                return option.selectedSeafreight.departurePortName+" - "+option.selectedSeafreight.destinationPortName+" | "+option.selectedSeafreight.carrierName;
                            }}
                            value={option2}
                            options={props.options}
                            fullWidth
                            disabled
                            onChange={(e: any, value: any) => { 
                                console.log(value);
                                setOption2(value); 
                            }}
                            renderInput={(params: any) => <TextField {...params} label="" />}
                            sx={{ mt: 1 }}
                        />
                    </Grid>
                    <Grid item xs={12} md={4}>
                        <InputLabel htmlFor="option3" sx={inputLabelStyles}>Option 3</InputLabel>
                        <Autocomplete
                            disablePortal
                            id="option3"
                            getOptionLabel={(option: any) => { 
                                return option.selectedSeafreight.departurePortName+" - "+option.selectedSeafreight.destinationPortName+" | "+option.selectedSeafreight.carrierName;
                            }}
                            value={option3}
                            options={props.options}
                            fullWidth
                            disabled
                            onChange={(e: any, value: any) => { 
                                console.log(value);
                                setOption3(value); 
                            }}
                            renderInput={(params: any) => <TextField {...params} label="" />}
                            sx={{ mt: 1 }}
                        />
                    </Grid>
                    
                    <Grid item xs={4} sx={{ mb: 5 }}>
                        {
                            option1 !== null && option1 !== "" && option1 !== undefined ? 
                            <List sx={{ border: "1px solid #e5e5e5" }}>
                                {
                                    option1.selectedHaulage !== null ? 
                                    <>
                                        <ListItem divider sx={getBestTotalIndex(props.options) === 0 ? { background: "limegreen", color: "#000" } : {}}>
                                            <strong>Total Unit Price : {option1.selectedHaulage.unitTariff+getTotalPrices(option1.selectedSeafreights)+getTotalPrices(option1.myMiscs)} €</strong>
                                        </ListItem>
                                        <ListItem divider>Haulier Name : {option1.selectedHaulage.haulierName}</ListItem>
                                        <ListItem divider sx={getBestHaulageIndex(props.options) === 0 ? { background: "limegreen", color: "#000" } : {}}>Haulage Tariff : {option1.selectedHaulage.unitTariff} €</ListItem>
                                        <ListItem divider sx={getBestMultiStopIndex(props.options) === 0 ? { background: "limegreen", color: "#000" } : {}}>Multi Stop : {option1.selectedHaulage.multiStop} €</ListItem>
                                        <ListItem divider sx={getBestOvertimeIndex(props.options) === 0 ? { background: "limegreen", color: "#000" } : {}}>Overtime Tariff : {option1.selectedHaulage.overtimeTariff} €</ListItem>
                                    </> : 
                                    <ListItem divider sx={getBestAltTotalIndex(props.options) === 0 ? { background: "#FFF", color: "#000" } : {}}>
                                        <strong>Total Unit Price : {getTotalPrices(option1.selectedSeafreights)+getTotalPrices(option1.myMiscs)} €</strong>
                                    </ListItem>
                                }
                                <ListItem divider>Carrier Name : {option1.selectedSeafreight.carrierName}</ListItem>
                                <ListItem divider sx={getBestSeafreightIndex(props.options) === 0 ? { background: "limegreen", color: "#000" } : {}}>Seafreight Tariff : {getTotalPrices(option1.selectedSeafreights)} €</ListItem>
                                <ListItem divider sx={{ display: "block" }}>
                                    Seafreight details 
                                    {option1.selectedSeafreights.map((elm: any, id: number) => {
                                        return (
                                            <div key={"ssf1-"+id}>
                                                <div style={{ marginTop: 2, marginBottom: 2 }}>
                                                    # {elm.defaultContainer} | {elm.transitTime} {t('days')} : {getTotalPrice(elm)} €
                                                </div>
                                                <div>{getServicesTotal(elm.containers, "€", 0)}</div>
                                            </div>
                                        );
                                    })}
                                </ListItem>
                                <ListItem divider sx={getBestMiscIndex(props.options) === 0 ? { background: "limegreen", color: "#000" } : {}}>Miscellaneous Tariff : {getTotalPrices(option1.myMiscs)} €</ListItem>
                                <ListItem sx={{ display: "block" }}>
                                    Miscellaneous details 
                                    {option1.myMiscs.map((elm: any, id: number) => {
                                        return (
                                            <div key={"ssvf1-"+id} style={{ marginTop: 2, marginBottom: 2 }}>
                                                {elm.textServices}
                                            </div>
                                        );
                                    })}
                                </ListItem>
                            </List> : null
                        }
                    </Grid>
                    <Grid item xs={4} sx={{ mb: 5 }}>
                        {
                            option2 !== null && option2 !== "" && option2 !== undefined ? 
                            <List sx={{ border: "1px solid #e5e5e5" }}>
                                {
                                    option2.selectedHaulage !== null ? 
                                    <>
                                        <ListItem divider sx={getBestTotalIndex(props.options) === 1 ? { background: "limegreen", color: "#000" } : {}}>
                                            <strong>Total Unit Price : {option2.selectedHaulage.unitTariff+getTotalPrices(option2.selectedSeafreights)+getTotalPrices(option2.myMiscs)} €</strong>
                                        </ListItem>
                                        <ListItem divider>Haulier Name : {option2.selectedHaulage.haulierName}</ListItem>
                                        <ListItem divider sx={getBestHaulageIndex(props.options) === 1 ? { background: "limegreen", color: "#000" } : {}}>Haulage Tariff : {option2.selectedHaulage.unitTariff} €</ListItem>
                                        <ListItem divider sx={getBestMultiStopIndex(props.options) === 1 ? { background: "limegreen", color: "#000" } : {}}>Multi Stop : {option2.selectedHaulage.multiStop} €</ListItem>
                                        <ListItem divider sx={getBestOvertimeIndex(props.options) === 1 ? { background: "limegreen", color: "#000" } : {}}>Overtime Tariff : {option2.selectedHaulage.overtimeTariff} €</ListItem>        
                                    </> : 
                                    <ListItem divider sx={getBestAltTotalIndex(props.options) === 1 ? { background: "#FFF", color: "#000" } : {}}>
                                        <strong>Total Unit Price : {getTotalPrices(option2.selectedSeafreights)+getTotalPrices(option2.myMiscs)} €</strong>
                                    </ListItem>
                                }
                                <ListItem divider>Carrier Name : {option2.selectedSeafreight.carrierName}</ListItem>
                                <ListItem divider sx={getBestSeafreightIndex(props.options) === 1 ? { background: "limegreen", color: "#000" } : {}}>Seafreight Tariff : {getTotalPrices(option2.selectedSeafreights)} €</ListItem>
                                <ListItem divider sx={{ display: "block" }}>
                                    Seafreight details 
                                    {option2.selectedSeafreights.map((elm: any, id: number) => {
                                        return (
                                            <div key={"ssf1-"+id}>
                                                <div style={{ marginTop: 2, marginBottom: 2 }}>
                                                    # {elm.defaultContainer} | {elm.transitTime} {t('days')} : {getTotalPrice(elm)} €
                                                </div>
                                                <div>{getServicesTotal(elm.containers, "€", 0)}</div>
                                            </div>
                                        );
                                    })}
                                </ListItem>
                                <ListItem divider sx={getBestMiscIndex(props.options) === 1 ? { background: "limegreen", color: "#000" } : {}}>Miscellaneous Tariff : {getTotalPrices(option2.myMiscs)} €</ListItem>
                                <ListItem sx={{ display: "block" }}>
                                    Miscellaneous details 
                                    {option2.myMiscs.map((elm: any, id: number) => {
                                        return (
                                            <div key={"ssvf1-"+id} style={{ marginTop: 2, marginBottom: 2 }}>
                                                {elm.textServices}
                                            </div>
                                        );
                                    })}
                                </ListItem>
                            </List> : null
                        }
                    </Grid>
                    <Grid item xs={4} sx={{ mb: 5 }}>
                        {
                            option3 !== null && option3 !== "" && option3 !== undefined ? 
                            <List sx={{ border: "1px solid #e5e5e5" }}>
                                {
                                    option3.selectedHaulage !== null ? 
                                    <>
                                        <ListItem divider sx={getBestTotalIndex(props.options) === 2 ? { background: "limegreen", color: "#000" } : {}}>
                                            <strong>Total Unit Price : {option3.selectedHaulage.unitTariff+getTotalPrices(option3.selectedSeafreights)+getTotalPrices(option3.myMiscs)} €</strong>
                                        </ListItem>
                                        <ListItem divider>Haulier Name : {option3.selectedHaulage.haulierName}</ListItem>
                                        <ListItem divider sx={getBestHaulageIndex(props.options) === 2 ? { background: "limegreen", color: "#000" } : {}}>Haulage Tariff : {option3.selectedHaulage.unitTariff} €</ListItem>
                                        <ListItem divider sx={getBestMultiStopIndex(props.options) === 2 ? { background: "limegreen", color: "#000" } : {}}>Multi Stop : {option3.selectedHaulage.multiStop} €</ListItem>
                                        <ListItem divider sx={getBestOvertimeIndex(props.options) === 2 ? { background: "limegreen", color: "#000" } : {}}>Overtime Tariff : {option3.selectedHaulage.overtimeTariff} €</ListItem>        
                                    </> : 
                                    <ListItem divider sx={getBestAltTotalIndex(props.options) === 2 ? { background: "#FFF", color: "#000" } : {}}>
                                        <strong>Total Unit Price : {getTotalPrices(option3.selectedSeafreights)+getTotalPrices(option3.myMiscs)} €</strong>
                                    </ListItem>
                                }
                                <ListItem divider>Carrier Name : {option3.selectedSeafreight.carrierName}</ListItem>
                                <ListItem divider sx={getBestSeafreightIndex(props.options) === 2 ? { background: "limegreen", color: "#000" } : {}}>Seafreight Tariff : {getTotalPrices(option3.selectedSeafreights)} €</ListItem>
                                <ListItem divider sx={{ display: "block" }}>
                                    Seafreight details 
                                    {option3.selectedSeafreights.map((elm: any, id: number) => {
                                        return (
                                            <div key={"ssf1-"+id}>
                                                <div style={{ marginTop: 2, marginBottom: 2 }}>
                                                    # {elm.defaultContainer} | {elm.transitTime} {t('days')} : {getTotalPrice(elm)} €
                                                </div>
                                                <div>{getServicesTotal(elm.containers, "€", 0)}</div>
                                            </div>
                                        );
                                    })}
                                </ListItem>
                                <ListItem divider sx={getBestMiscIndex(props.options) === 2 ? { background: "limegreen", color: "#000" } : {}}>Miscellaneous Tariff : {getTotalPrices(option3.myMiscs)} €</ListItem>
                                <ListItem sx={{ display: "block" }}>
                                    Miscellaneous details 
                                    {option3.myMiscs.map((elm: any, id: number) => {
                                        return (
                                            <div key={"ssvf1-"+id} style={{ marginTop: 2, marginBottom: 2 }}>
                                                {elm.textServices}
                                            </div>
                                        );
                                    })}
                                </ListItem>
                            </List> : null
                        }
                    </Grid>
                </Grid>
            </DialogContent>
            <DialogActions>
                {/* <Button variant="contained" color="primary" className="mr-3" onClick={() => {  }} sx={{ textTransform: "none" }}>Compare</Button> */}
                <Button variant="contained" onClick={props.closeModal} sx={buttonCloseStyles}>{t('close')}</Button>
            </DialogActions>
        </>
    );
}

export default CompareOptions;
