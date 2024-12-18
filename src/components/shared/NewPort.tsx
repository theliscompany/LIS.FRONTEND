import { useState } from 'react';
import { BootstrapDialogTitle, BootstrapInput, actionButtonStyles, buttonCloseStyles, inputLabelStyles } from '../../utils/misc/styles';
import { Button, DialogActions, DialogContent, Grid, InputLabel, MenuItem, Select, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { enqueueSnackbar } from 'notistack';
import CountrySelect from './CountrySelect';
import { getLISTransportAPI } from '../../api/client/transportService';
import { PortViewModel } from '../../api/client/schemas/transport';

function NewPort(props: any) {
    const [testName, setTestName] = useState<string>("");
    const [country, setCountry] = useState<any>(null);
    
    const { createPort } = getLISTransportAPI();
    const { t } = useTranslation();
    
    const createNewPort = async () => {
        if (testName !== "" && country !== null) {
            var dataSent: PortViewModel = {
                "portName": testName,
                "country": country.label
            };
            
            try {
                const response = await createPort(dataSent);
                if (response !== null) {
                    enqueueSnackbar("The port has been added with success!", { variant: "success", anchorOrigin: { horizontal: "right", vertical: "top"} });
                    
                    if (props.callBack !== undefined && props.callBack !== null) {
                        props.callBack();
                    }
                    props.closeModal();
                }
                else {
                    enqueueSnackbar(t('errorHappened'), { variant: "error", anchorOrigin: { horizontal: "right", vertical: "top"} });
                }
            }
            catch (err: any) {
                console.log(err);
                enqueueSnackbar(t('errorHappened'), { variant: "error", anchorOrigin: { horizontal: "right", vertical: "top"} });
            }
        }
        else {
            enqueueSnackbar(t('verifyMessage'), { variant: "warning", anchorOrigin: { horizontal: "right", vertical: "top"} });
        }
    }
    
    return (
        <>
            <BootstrapDialogTitle id="custom-dialog-title7" onClose={props.closeModal}>
                <b>Create new port</b>
            </BootstrapDialogTitle>
            <DialogContent dividers>
                <Grid container spacing={2}>
                    <Grid item xs={12}>
                        <InputLabel htmlFor="test-name" sx={inputLabelStyles}>Port name</InputLabel>
                        <BootstrapInput id="test-name" type="text" value={testName} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTestName(e.target.value)} fullWidth />
                    </Grid>
                    <Grid item xs={12}>
                        <InputLabel htmlFor="test-country" sx={inputLabelStyles}>Country</InputLabel>
                        <CountrySelect id="test-country" value={country} onChange={setCountry} fullWidth />
                    </Grid>
                </Grid>
            </DialogContent>
            <DialogActions>
                <Button variant="contained" onClick={() => { createNewPort(); }} sx={actionButtonStyles}>{t('validate')}</Button>
                <Button variant="contained" onClick={props.closeModal} sx={buttonCloseStyles}>{t('close')}</Button>
            </DialogActions>
        </>
    );
}

export default NewPort;
