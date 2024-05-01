import { useState } from 'react';
import { BootstrapDialogTitle, BootstrapInput, buttonCloseStyles, inputLabelStyles } from '../../utils/misc/styles';
import { Autocomplete, Box, Button, DialogActions, DialogContent, Grid, InputLabel, List, ListItem, NativeSelect, TextField, Typography } from '@mui/material';
import { useAuthorizedBackendApi } from '../../api/api';
import { useTranslation } from 'react-i18next';
import { useAccount, useMsal } from '@azure/msal-react';
import { formatServices, getTotalPrice, getTotalPrices } from '../../utils/functions';

function CompareOptions(props: any) {
    const [option1, setOption1] = useState<any>(null);
    const [option2, setOption2] = useState<any>(null);
    
    const { instance, accounts } = useMsal();
    const account = useAccount(accounts[0] || {});

    const context = useAuthorizedBackendApi();
    const { t } = useTranslation();
    
    return (
        <>
            <BootstrapDialogTitle id="custom-dialog-title2" onClose={() => props.closeModal()}>
                <b>Compare options</b>
            </BootstrapDialogTitle>
            <DialogContent dividers>
                <Grid container spacing={2}>
                    <Grid item xs={12} md={6}>
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
                            onChange={(e: any, value: any) => { 
                                console.log(value);
                                setOption1(value); 
                            }}
                            renderInput={(params: any) => <TextField {...params} label="" />}
                            sx={{ mt: 1 }}
                        />
                    </Grid>
                    <Grid item xs={12} md={6}>
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
                            onChange={(e: any, value: any) => { 
                                console.log(value);
                                setOption2(value); 
                            }}
                            renderInput={(params: any) => <TextField {...params} label="" />}
                            sx={{ mt: 1 }}
                        />
                    </Grid>
                    
                    <Grid item xs={6} sx={{ mb: 5 }}>
                        {
                            option1 !== null && option1 !== "" && option1 !== undefined && option2 !== null && option2 !== "" && option2 !== undefined ? 
                            <List sx={{ border: "1px solid #e5e5e5" }}>
                                {
                                    option1.selectedHaulage !== null && option2.selectedHaulage !== null ? 
                                    <>
                                        <ListItem divider sx={option1.selectedHaulage.unitTariff+getTotalPrices(option1.selectedSeafreights)+getTotalPrices(option1.myMiscs) < option2.selectedHaulage.unitTariff+getTotalPrices(option2.selectedSeafreights)+getTotalPrices(option2.myMiscs) ? { background: "#a2d7a4", color: "#000" } : {}}>
                                            <strong>Total Unit Price : {option1.selectedHaulage.unitTariff+getTotalPrices(option1.selectedSeafreights)+getTotalPrices(option1.myMiscs)} €</strong>
                                        </ListItem>
                                        <ListItem divider>Haulier Name : {option1.selectedHaulage.haulierName}</ListItem>
                                        <ListItem divider sx={option1.selectedHaulage.unitTariff < option2.selectedHaulage.unitTariff ? { background: "#a2d7a4", color: "#000" } : {}}>Haulage Tariff : {option1.selectedHaulage.unitTariff} €</ListItem>
                                        <ListItem divider sx={option1.selectedHaulage.multiStop < option2.selectedHaulage.multiStop ? { background: "#a2d7a4", color: "#000" } : {}}>Multi Stop : {option1.selectedHaulage.multiStop} €</ListItem>
                                        <ListItem divider sx={option1.selectedHaulage.overtimeTariff < option2.selectedHaulage.overtimeTariff ? { background: "#a2d7a4", color: "#000" } : {}}>Overtime Tariff : {option1.selectedHaulage.overtimeTariff} €</ListItem>
                                    </> : 
                                    <ListItem divider sx={getTotalPrices(option1.selectedSeafreights)+getTotalPrices(option1.myMiscs) < getTotalPrices(option2.selectedSeafreights)+getTotalPrices(option2.myMiscs) ? { background: "#a2d7a4", color: "#000" } : {}}>
                                        <strong>Total Unit Price : {getTotalPrices(option1.selectedSeafreights)+getTotalPrices(option1.myMiscs)} €</strong>
                                    </ListItem>
                                }
                                <ListItem divider>Carrier Name : {option1.selectedSeafreight.carrierName}</ListItem>
                                <ListItem divider sx={getTotalPrices(option1.selectedSeafreights) < getTotalPrices(option2.selectedSeafreights) ? { background: "#a2d7a4", color: "#000" } : {}}>Seafreight Tariff : {getTotalPrices(option1.selectedSeafreights)} €</ListItem>
                                <ListItem divider sx={{ display: "block" }}>
                                    {option1.selectedSeafreights.map((elm: any, id: number) => {
                                        return (
                                            <p key={"ssf1-"+id} style={{ marginTop: 2, marginBottom: 2 }}>
                                                {elm.defaultContainer} | {elm.transitTime} {t('days')} : {getTotalPrice(elm)} €
                                            </p>
                                        );
                                    })}
                                </ListItem>
                                <ListItem divider sx={getTotalPrices(option1.myMiscs) < getTotalPrices(option2.myMiscs) ? { background: "#a2d7a4", color: "#000" } : {}}>Miscellaneous Tariff : {getTotalPrices(option1.myMiscs)} €</ListItem>
                                <ListItem sx={{ display: "block" }}>
                                    Services details 
                                    {option1.myMiscs.map((elm: any, id: number) => {
                                        return (
                                            <p key={"ssvf1-"+id} style={{ marginTop: 2, marginBottom: 2 }}>
                                                {elm.textServices}
                                            </p>
                                        );
                                    })}
                                </ListItem>
                            </List> : null
                        }
                    </Grid>
                    <Grid item xs={6} sx={{ mb: 5 }}>
                        {
                            option1 !== null && option1 !== "" && option1 !== undefined && option2 !== null && option2 !== "" && option2 !== undefined ? 
                            <List sx={{ border: "1px solid #e5e5e5" }}>
                                {
                                    option1.selectedHaulage !== null && option2.selectedHaulage !== null ? 
                                    <>
                                        <ListItem divider sx={option2.selectedHaulage.unitTariff+getTotalPrices(option2.selectedSeafreights)+getTotalPrices(option2.myMiscs) < option1.selectedHaulage.unitTariff+getTotalPrices(option1.selectedSeafreights)+getTotalPrices(option1.myMiscs) ? { background: "#a2d7a4", color: "#000" } : {}}>
                                            <strong>Total Unit Price : {option2.selectedHaulage.unitTariff+getTotalPrices(option2.selectedSeafreights)+getTotalPrices(option2.myMiscs)} €</strong>
                                        </ListItem>
                                        <ListItem divider>Haulier Name : {option2.selectedHaulage.haulierName}</ListItem>
                                        <ListItem divider sx={option2.selectedHaulage.unitTariff < option1.selectedHaulage.unitTariff ? { background: "#a2d7a4", color: "#000" } : {}}>Haulage Tariff : {option2.selectedHaulage.unitTariff} €</ListItem>
                                        <ListItem divider sx={option2.selectedHaulage.multiStop < option1.selectedHaulage.multiStop ? { background: "#a2d7a4", color: "#000" } : {}}>Multi Stop : {option2.selectedHaulage.multiStop} €</ListItem>
                                        <ListItem divider sx={option2.selectedHaulage.overtimeTariff < option1.selectedHaulage.overtimeTariff ? { background: "#a2d7a4", color: "#000" } : {}}>Overtime Tariff : {option2.selectedHaulage.overtimeTariff} €</ListItem>        
                                    </> : 
                                    <ListItem divider sx={getTotalPrices(option2.selectedSeafreights)+getTotalPrices(option2.myMiscs) < getTotalPrices(option1.selectedSeafreights)+getTotalPrices(option1.myMiscs) ? { background: "#a2d7a4", color: "#000" } : {}}>
                                        <strong>Total Unit Price : {getTotalPrices(option2.selectedSeafreights)+getTotalPrices(option2.myMiscs)} €</strong>
                                    </ListItem>
                                }
                                <ListItem divider>Carrier Name : {option2.selectedSeafreight.carrierName}</ListItem>
                                <ListItem divider sx={getTotalPrices(option2.selectedSeafreights) < getTotalPrices(option1.selectedSeafreights) ? { background: "#a2d7a4", color: "#000" } : {}}>Seafreight Tariff : {getTotalPrices(option2.selectedSeafreights)} €</ListItem>
                                <ListItem divider sx={{ display: "block" }}>
                                    {option2.selectedSeafreights.map((elm: any, id: number) => {
                                        return (
                                            <p key={"ssf2-"+id} style={{ marginTop: 2, marginBottom: 2 }}>
                                                {elm.defaultContainer} | {elm.transitTime} {t('days')} : {getTotalPrice(elm)} €
                                            </p>
                                        );
                                    })}
                                </ListItem>
                                <ListItem divider sx={getTotalPrices(option2.myMiscs) < getTotalPrices(option1.myMiscs) ? { background: "#a2d7a4", color: "#000" } : {}}>Miscellaneous Tariff : {getTotalPrices(option2.myMiscs)} €</ListItem>
                                <ListItem sx={{ display: "block" }}>
                                    Services details 
                                    {option2.myMiscs.map((elm: any, id: number) => {
                                        return (
                                            <p key={"ssvf1-"+id} style={{ marginTop: 2, marginBottom: 2 }}>
                                                {elm.textServices}
                                            </p>
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
