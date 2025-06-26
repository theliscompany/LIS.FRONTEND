import { useState } from 'react';
import { BootstrapDialogTitle, BootstrapInput, actionButtonStyles, buttonCloseStyles, inputLabelStyles } from '@utils/misc/styles';
import { Button, DialogActions, DialogContent, InputLabel } from '@mui/material';
import Grid from '@mui/material/Grid2';
import { useTranslation } from 'react-i18next';
import { enqueueSnackbar } from 'notistack';
import CountrySelect from './CountrySelect';
import { createPort, PortViewModel } from '@features/transport/api';

function NewPort(props: any) {
    const [testName, setTestName] = useState<string>("");
    const [country, setCountry] = useState<any>(null);
    
    const { t } = useTranslation();
    
    const createNewPort = async () => {
        if (testName !== "" && country !== null) {
            var dataSent: PortViewModel = {
                "portName": testName,
                "country": country.label
            };
            
            try {
                const response = await createPort({body: dataSent});
                if (response !== null) {
                    enqueueSnackbar(t('portAdded'), { variant: "success", anchorOrigin: { horizontal: "right", vertical: "top"} });
                    
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
                <b>{t('createNewPort')}</b>
            </BootstrapDialogTitle>
            <DialogContent dividers>
                <Grid container spacing={2}>
                    <Grid size={{ xs: 12 }}>
                        <InputLabel htmlFor="test-name" sx={inputLabelStyles}>{t('portName')}</InputLabel>
                        <BootstrapInput id="test-name" type="text" value={testName} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTestName(e.target.value)} fullWidth />
                    </Grid>
                    <Grid size={{ xs: 12 }}>
                        <InputLabel htmlFor="test-country" sx={inputLabelStyles}>{t('country')}</InputLabel>
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
