import { useState } from 'react';
import { BootstrapDialogTitle, activeStyles, buttonCloseStyles, inputLabelStyles } from '../../utils/misc/styles';
import { Autocomplete, Button, DialogActions, DialogContent, Grid, InputLabel, List, ListItem, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField } from '@mui/material';
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
        var val1 = getTotalPrices(options[0].selectedSeafreights);
        var val2 = getTotalPrices(options[1].selectedSeafreights);
        var val3 = 0;
        var numbersArray = [];
        if (options.length === 3) {
            val3 = getTotalPrices(options[2].selectedSeafreights);
            numbersArray = [val1,val2,val3];
        }
        else {
            numbersArray = [val1,val2];
        }
        return findIndexOfMax(numbersArray);
    };
      
    const getBestMiscIndex = (options: any) => {
        var val1 = getTotalPrices(options[0].myMiscs);
        var val2 = getTotalPrices(options[1].myMiscs);
        var val3 = 0;
        var numbersArray = [];
        if (options.length === 3) {
            val3 = getTotalPrices(options[2].myMiscs);
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
        var val1 = options[0].selectedHaulage !== null ? options[0].selectedHaulage.unitTariff+getTotalPrices(options[0].selectedSeafreights)+getTotalPrices(options[0].myMiscs) : 0;
        var val2 = options[1].selectedHaulage !== null ? options[1].selectedHaulage.unitTariff+getTotalPrices(options[1].selectedSeafreights)+getTotalPrices(options[1].myMiscs) : 0;
        var val3 = 0;
        var numbersArray = [];
        if (options.length === 3) {
            val3 = options[2].selectedHaulage !== null ? options[2].selectedHaulage.unitTariff+getTotalPrices(options[2].selectedSeafreights)+getTotalPrices(options[2].myMiscs) : 0;
            numbersArray = [val1,val2,val3];
        }
        else {
            numbersArray = [val1,val2];
        }
        return findIndexOfMax(numbersArray);
    };
      

    const getBestAltTotalIndex = (options: any) => {
        var val1 = getTotalPrices(options[0].selectedSeafreights)+getTotalPrices(options[0].myMiscs);
        var val2 = getTotalPrices(options[1].selectedSeafreights)+getTotalPrices(options[1].myMiscs);
        var val3 = 0;
        var numbersArray = [];
        if (options.length === 3) {
            val3 = getTotalPrices(options[2].selectedSeafreights)+getTotalPrices(options[2].myMiscs);
            numbersArray = [val1,val2,val3];
        }
        else {
            numbersArray = [val1,val2];
        }
        return findIndexOfMax(numbersArray);
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
                    
                    <Grid item xs={12}>
                        <TableContainer component={Paper}>
                            <Table sx={{ minWidth: 650 }} size="small" aria-label="a dense table">
                                <TableHead>
                                    <TableRow>
                                        <TableCell></TableCell>
                                        {
                                            option1 !== null && option1 !== "" && option1 !== undefined ? 
                                            <TableCell sx={{background: "darkorange"}}>
                                                {option1.selectedSeafreight.departurePortName+" - "+option1.selectedSeafreight.destinationPortName+" | "+option1.selectedSeafreight.carrierName}
                                            </TableCell> : null
                                        }
                                        {
                                            option2 !== null && option2 !== "" && option2 !== undefined ? 
                                            <TableCell sx={{background: "darkorange"}}>
                                                {option2.selectedSeafreight.departurePortName+" - "+option2.selectedSeafreight.destinationPortName+" | "+option2.selectedSeafreight.carrierName}
                                            </TableCell> : null
                                        }
                                        {
                                            option3 !== null && option3 !== "" && option3 !== undefined ? 
                                            <TableCell sx={{background: "darkorange"}}>
                                                {option3.selectedSeafreight.departurePortName+" - "+option3.selectedSeafreight.destinationPortName+" | "+option3.selectedSeafreight.carrierName}
                                            </TableCell> : null
                                        }
                                    </TableRow>
                                    {/* <TableRow><TableCell>Characteristics</TableCell></TableRow> */}
                                </TableHead>
                                <TableBody>
                                    {/* <TableRow>
                                        <TableCell component="th" scope="row">Port of Loading</TableCell>
                                        {
                                            option1 !== null && option1 !== "" && option1 !== undefined ? 
                                            <TableCell component="th" scope="row">Port of Loading 1</TableCell> : null
                                        }
                                        {
                                            option2 !== null && option2 !== "" && option2 !== undefined ? 
                                            <TableCell component="th" scope="row">Port of Loading 2</TableCell> : null
                                        }
                                        {
                                            option3 !== null && option3 !== "" && option3 !== undefined ? 
                                            <TableCell component="th" scope="row">Port of Loading 3</TableCell> : null
                                        }
                                    </TableRow> */}

                                    <TableRow>
                                        <TableCell component="th" scope="row" sx={{background: "lightblue"}}>{t('haulierName')}</TableCell>
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
                                        <TableCell component="th" scope="row" sx={{background: "lightblue"}}>{t('haulageTariff')}</TableCell>
                                        {
                                            option1 !== null && option1 !== "" && option1 !== undefined && option1.selectedHaulage !== null ? 
                                            <TableCell component="th" scope="row" sx={getBestHaulageIndex(props.options) === 0 ? activeStyles : {}}>
                                                {option1.selectedHaulage.unitTariff} €
                                            </TableCell> : null
                                        }
                                        {
                                            option2 !== null && option2 !== "" && option2 !== undefined && option2.selectedHaulage !== null ? 
                                            <TableCell component="th" scope="row" sx={getBestHaulageIndex(props.options) === 1 ? activeStyles : {}}>
                                                {option2.selectedHaulage.unitTariff} €
                                            </TableCell> : null
                                        }
                                        {
                                            option3 !== null && option3 !== "" && option3 !== undefined && option3.selectedHaulage !== null ? 
                                            <TableCell component="th" scope="row" sx={getBestHaulageIndex(props.options) === 2 ? activeStyles : {}}>
                                                {option3.selectedHaulage.unitTariff} €
                                            </TableCell> : null
                                        }
                                    </TableRow>
                                    
                                    <TableRow>
                                        <TableCell component="th" scope="row" sx={{background: "lightblue"}}>{t('multiStop')}</TableCell>
                                        {
                                            option1 !== null && option1 !== "" && option1 !== undefined && option1.selectedHaulage !== null ? 
                                            <TableCell component="th" scope="row" sx={getBestMultiStopIndex(props.options) === 0 ? activeStyles : {}}>
                                                {option1.selectedHaulage.multiStop} €
                                            </TableCell> : null
                                        }
                                        {
                                            option2 !== null && option2 !== "" && option2 !== undefined && option2.selectedHaulage !== null ? 
                                            <TableCell component="th" scope="row" sx={getBestMultiStopIndex(props.options) === 1 ? activeStyles : {}}>
                                                {option2.selectedHaulage.multiStop} €
                                            </TableCell> : null
                                        }
                                        {
                                            option3 !== null && option3 !== "" && option3 !== undefined && option3.selectedHaulage !== null ? 
                                            <TableCell component="th" scope="row" sx={getBestMultiStopIndex(props.options) === 2 ? activeStyles : {}}>
                                                {option3.selectedHaulage.multiStop} €
                                            </TableCell> : null
                                        }
                                    </TableRow>

                                    <TableRow>
                                        <TableCell component="th" scope="row" sx={{background: "lightblue"}}>{t('overtimeTariff')}</TableCell>
                                        {
                                            option1 !== null && option1 !== "" && option1 !== undefined && option1.selectedHaulage !== null ? 
                                            <TableCell component="th" scope="row" sx={getBestOvertimeIndex(props.options) === 0 ? activeStyles : {}}>
                                                {option1.selectedHaulage.overtimeTariff} €
                                            </TableCell> : null
                                        }
                                        {
                                            option2 !== null && option2 !== "" && option2 !== undefined && option2.selectedHaulage !== null ? 
                                            <TableCell component="th" scope="row" sx={getBestOvertimeIndex(props.options) === 1 ? activeStyles : {}}>
                                                {option2.selectedHaulage.overtimeTariff} €
                                            </TableCell> : null
                                        }
                                        {
                                            option3 !== null && option3 !== "" && option3 !== undefined && option3.selectedHaulage !== null ? 
                                            <TableCell component="th" scope="row" sx={getBestOvertimeIndex(props.options) === 2 ? activeStyles : {}}>
                                                {option3.selectedHaulage.overtimeTariff} €
                                            </TableCell> : null
                                        }
                                    </TableRow>
                                                                        
                                    <TableRow>
                                        <TableCell component="th" scope="row" sx={{background: "lightblue"}}>{t('carrier')}</TableCell>
                                        {
                                            option1 !== null && option1 !== "" && option1 !== undefined ? 
                                            <TableCell component="th" scope="row">{option1.selectedSeafreight.carrierName}</TableCell> : null
                                        }
                                        {
                                            option2 !== null && option2 !== "" && option2 !== undefined ? 
                                            <TableCell component="th" scope="row">{option2.selectedSeafreight.carrierName}</TableCell> : null
                                        }
                                        {
                                            option3 !== null && option3 !== "" && option3 !== undefined ? 
                                            <TableCell component="th" scope="row">{option3.selectedSeafreight.carrierName}</TableCell> : null
                                        }
                                    </TableRow>
                                    
                                    <TableRow>
                                        <TableCell component="th" scope="row" sx={{background: "lightblue"}}>{t('seafreightTariff')}</TableCell>
                                        {
                                            option1 !== null && option1 !== "" && option1 !== undefined ? 
                                            <TableCell component="th" scope="row" sx={getBestSeafreightIndex(props.options) === 0 ? activeStyles : {}}>
                                                {getTotalPrices(option1.selectedSeafreights)} €
                                            </TableCell> : null
                                        }
                                        {
                                            option2 !== null && option2 !== "" && option2 !== undefined ? 
                                            <TableCell component="th" scope="row" sx={getBestSeafreightIndex(props.options) === 1 ? activeStyles : {}}>
                                                {getTotalPrices(option2.selectedSeafreights)} €
                                            </TableCell> : null
                                        }
                                        {
                                            option3 !== null && option3 !== "" && option3 !== undefined ? 
                                            <TableCell component="th" scope="row" sx={getBestSeafreightIndex(props.options) === 2 ? activeStyles : {}}>
                                                {getTotalPrices(option3.selectedSeafreights)} €
                                            </TableCell> : null
                                        }
                                    </TableRow>
                                    
                                    <TableRow>
                                        <TableCell component="th" scope="row" sx={{background: "lightblue"}}>{t('seafreightDetails')}</TableCell>
                                        {
                                            option1 !== null && option1 !== "" && option1 !== undefined ? 
                                            <TableCell component="th" scope="row">
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
                                            </TableCell> : null
                                        }
                                        {
                                            option2 !== null && option2 !== "" && option2 !== undefined ? 
                                            <TableCell component="th" scope="row">
                                                {option2.selectedSeafreights.map((elm: any, id: number) => {
                                                    return (
                                                        <div key={"ssf2-"+id}>
                                                            <div style={{ marginTop: 2, marginBottom: 2 }}>
                                                                # {elm.defaultContainer} | {elm.transitTime} {t('days')} : {getTotalPrice(elm)} €
                                                            </div>
                                                            <div>{getServicesTotal(elm.containers, "€", 0)}</div>
                                                        </div>
                                                    );
                                                })}
                                            </TableCell> : null
                                        }
                                        {
                                            option3 !== null && option3 !== "" && option3 !== undefined ? 
                                            <TableCell component="th" scope="row">
                                                {option3.selectedSeafreights.map((elm: any, id: number) => {
                                                    return (
                                                        <div key={"ssf3-"+id}>
                                                            <div style={{ marginTop: 2, marginBottom: 2 }}>
                                                                # {elm.defaultContainer} | {elm.transitTime} {t('days')} : {getTotalPrice(elm)} €
                                                            </div>
                                                            <div>{getServicesTotal(elm.containers, "€", 0)}</div>
                                                        </div>
                                                    );
                                                })}
                                            </TableCell> : null
                                        }
                                    </TableRow>
                                    
                                    
                                    <TableRow>
                                        <TableCell component="th" scope="row" sx={{background: "lightblue"}}>{t('miscTariff')}</TableCell>
                                        {
                                            option1 !== null && option1 !== "" && option1 !== undefined ? 
                                            <TableCell component="th" scope="row" sx={getBestMiscIndex(props.options) === 0 ? activeStyles : {}}>
                                                {getTotalPrices(option1.myMiscs)} €
                                            </TableCell> : null
                                        }
                                        {
                                            option2 !== null && option2 !== "" && option2 !== undefined ? 
                                            <TableCell component="th" scope="row" sx={getBestMiscIndex(props.options) === 1 ? activeStyles : {}}>
                                                {getTotalPrices(option2.myMiscs)} €
                                            </TableCell> : null
                                        }
                                        {
                                            option3 !== null && option3 !== "" && option3 !== undefined ? 
                                            <TableCell component="th" scope="row" sx={getBestMiscIndex(props.options) === 2 ? activeStyles : {}}>
                                                {getTotalPrices(option3.myMiscs)} €
                                            </TableCell> : null
                                        }
                                    </TableRow>
                                    
                                    
                                    <TableRow>
                                        <TableCell component="th" scope="row" sx={{background: "lightblue"}}>{t('miscDetails')}</TableCell>
                                        {
                                            option1 !== null && option1 !== "" && option1 !== undefined ? 
                                            <TableCell component="th" scope="row">
                                                {option1.myMiscs.map((elm: any, id: number) => {
                                                    return (
                                                        <div key={"ssvf1-"+id} style={{ marginTop: 2, marginBottom: 2 }}>{elm.textServices}</div>
                                                    );
                                                })}
                                            </TableCell> : null
                                        }
                                        {
                                            option2 !== null && option2 !== "" && option2 !== undefined ? 
                                            <TableCell component="th" scope="row">
                                                {option2.myMiscs.map((elm: any, id: number) => {
                                                    return (
                                                        <div key={"ssvf2-"+id} style={{ marginTop: 2, marginBottom: 2 }}>{elm.textServices}</div>
                                                    );
                                                })}
                                            </TableCell> : null
                                        }
                                        {
                                            option3 !== null && option3 !== "" && option3 !== undefined ? 
                                            <TableCell component="th" scope="row">
                                                {option3.myMiscs.map((elm: any, id: number) => {
                                                    return (
                                                        <div key={"ssvf3-"+id} style={{ marginTop: 2, marginBottom: 2 }}>{elm.textServices}</div>
                                                    );
                                                })}
                                            </TableCell> : null
                                        }
                                    </TableRow>
                                    
                                    
                                    <TableRow>
                                        <TableCell component="th" scope="row" sx={{background: "lightblue"}}><b>{t('totalUnitPrice')}</b></TableCell>
                                        {
                                            option1 !== null && option1 !== "" && option1 !== undefined ? 
                                            option1.selectedHaulage !== null ?
                                            <TableCell component="th" scope="row" sx={getBestTotalIndex(props.options) === 0 ? activeStyles : {}}>
                                                <strong>{option1.selectedHaulage.unitTariff+getTotalPrices(option1.selectedSeafreights)+getTotalPrices(option1.myMiscs)} €</strong>
                                            </TableCell> : 
                                            <TableCell component="th" scope="row" sx={getBestAltTotalIndex(props.options) === 0 ? activeStyles : {}}>
                                                <strong>{getTotalPrices(option1.selectedSeafreights)+getTotalPrices(option1.myMiscs)} €</strong>
                                            </TableCell> : null
                                        }
                                        {
                                            option2 !== null && option2 !== "" && option2 !== undefined ? 
                                            option2.selectedHaulage !== null ?
                                            <TableCell component="th" scope="row" sx={getBestTotalIndex(props.options) === 1 ? activeStyles : {}}>
                                                <strong>{option2.selectedHaulage.unitTariff+getTotalPrices(option2.selectedSeafreights)+getTotalPrices(option2.myMiscs)} €</strong>
                                            </TableCell> : 
                                            <TableCell component="th" scope="row" sx={getBestAltTotalIndex(props.options) === 1 ? activeStyles : {}}>
                                                <strong>{getTotalPrices(option2.selectedSeafreights)+getTotalPrices(option2.myMiscs)} €</strong>
                                            </TableCell> : null
                                        }
                                        {
                                            option3 !== null && option3 !== "" && option3 !== undefined ? 
                                            option3.selectedHaulage !== null ?
                                            <TableCell component="th" scope="row" sx={getBestTotalIndex(props.options) === 2 ? activeStyles : {}}>
                                                <strong>{option3.selectedHaulage.unitTariff+getTotalPrices(option3.selectedSeafreights)+getTotalPrices(option3.myMiscs)} €</strong>
                                            </TableCell> : 
                                            <TableCell component="th" scope="row" sx={getBestAltTotalIndex(props.options) === 2 ? activeStyles : {}}>
                                                <strong>{getTotalPrices(option3.selectedSeafreights)+getTotalPrices(option3.myMiscs)} €</strong>
                                            </TableCell> : null
                                        }
                                    </TableRow>
                                        
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </Grid>
                </Grid>
            </DialogContent>
            <DialogActions>
                <Button variant="contained" onClick={props.closeModal} sx={buttonCloseStyles}>{t('close')}</Button>
            </DialogActions>
        </>
    );
}

export default CompareOptions;
