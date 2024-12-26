import { useState } from 'react';
import { BootstrapDialogTitle, BootstrapInput, actionButtonStyles, buttonCloseStyles, inputLabelStyles } from '../../utils/misc/styles';
import { Button, DialogActions, DialogContent, Grid, InputLabel, MenuItem, Select, Typography } from '@mui/material';
import { useAuthorizedBackendApi } from '../../api/api';
import { useTranslation } from 'react-i18next';
import { enqueueSnackbar } from 'notistack';
import { BackendService } from '../../utils/services/fetch';
import { protectedResources } from '../../config/authConfig';
import { useAccount, useMsal } from '@azure/msal-react';
import { getLISTransportAPI } from '../../api/client/transportService';
import { ProductViewModel } from '../../api/client/schemas/transport';

function NewProduct(props: any) {
    const [testName, setTestName] = useState<string>("");
    
    const { instance, accounts } = useMsal();
    const account = useAccount(accounts[0] || {});
    const context = useAuthorizedBackendApi();

    const { postProduct } = getLISTransportAPI();
    const { t } = useTranslation();
    
    const createNewProduct = async () => {
        if (testName !== "") {
            if (account && instance && context) {
                var dataSent: ProductViewModel = {
                    "productName": testName,
                };
                
                try {
                    const response = await postProduct(dataSent);
                    if (response !== null) {
                        enqueueSnackbar("The product has been added with success!", { variant: "success", anchorOrigin: { horizontal: "right", vertical: "top"} });
                        
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
        }
        else {
            enqueueSnackbar(t('verifyMessage'), { variant: "warning", anchorOrigin: { horizontal: "right", vertical: "top"} });
        }
    }
    
    return (
        <>
            <BootstrapDialogTitle id="custom-dialog-title77" onClose={props.closeModal}>
                <b>Create new product</b>
            </BootstrapDialogTitle>
            <DialogContent dividers>
                <Grid container spacing={2}>
                    <Grid item xs={12}>
                        <InputLabel htmlFor="test-name" sx={inputLabelStyles}>Product name</InputLabel>
                        <BootstrapInput id="test-name" type="text" value={testName} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTestName(e.target.value)} fullWidth />
                    </Grid>
                </Grid>
            </DialogContent>
            <DialogActions>
                <Button variant="contained" onClick={() => { createNewProduct(); }} sx={actionButtonStyles}>{t('validate')}</Button>
                <Button variant="contained" onClick={props.closeModal} sx={buttonCloseStyles}>{t('close')}</Button>
            </DialogActions>
        </>
    );
}

export default NewProduct;
