import { useState } from 'react';
import { BootstrapDialogTitle, BootstrapInput, actionButtonStyles, buttonCloseStyles, inputLabelStyles } from '../../utils/misc/styles';
import { Button, DialogActions, DialogContent, Grid, InputLabel, Typography } from '@mui/material';
import { useAuthorizedBackendApi } from '../../api/api';
import { useTranslation } from 'react-i18next';
import { enqueueSnackbar } from 'notistack';
import { BackendService } from '../../utils/services/fetch';
import { crmRequest, protectedResources } from '../../config/authConfig';
import { useAccount, useMsal } from '@azure/msal-react';
import { AuthenticationResult } from '@azure/msal-browser';

function NewContact(props: any) {
    const [testName, setTestName] = useState<string>("");
    const [addressCountry, setAddressCountry] = useState<string>("");
    const [countryCode, setCountryCode] = useState<string>("CM")
    
    const { instance, accounts } = useMsal();
    const account = useAccount(accounts[0] || {});

    const context = useAuthorizedBackendApi();
    const { t } = useTranslation();
    
    const createNewContact = async () => {
        if (account && context) {
            const token = await instance.acquireTokenSilent({
                scopes: crmRequest.scopes,
                account: account
            })
            .then((response: AuthenticationResult) => {
                return response.accessToken;
            })
            .catch(() => {
                return instance.acquireTokenPopup({
                    ...crmRequest,
                    account: account
                    }).then((response) => {
                        return response.accessToken;
                    });
                }
            );

            var dataSent = {
                "contactName": testName,
                "addressCountry": addressCountry,
                "createdBy": 5,
                "countryCode": countryCode
            }
            const response = await (context as BackendService<any>).postWithToken(protectedResources.apiLisClient.endPoint+"/Contact/CreateCustomerContact", dataSent, token);
            if (response !== null) {
                enqueueSnackbar("The contact has been added with success!", { variant: "success", anchorOrigin: { horizontal: "right", vertical: "top"} });
                props.closeModal();
            }
            else {
                enqueueSnackbar(t('errorHappened'), { variant: "error", anchorOrigin: { horizontal: "right", vertical: "top"} });
            }
        }
    }
    
    return (
        <>
            <BootstrapDialogTitle id="custom-dialog-title7" onClose={props.closeModal}>
                <b>{t('createNewContact')}</b>
            </BootstrapDialogTitle>
            <DialogContent dividers>
                <Grid container spacing={2}>
                    <Grid item xs={12}>
                        <InputLabel htmlFor="test-name" sx={inputLabelStyles}>{t('clientName')}</InputLabel>
                        <BootstrapInput id="test-name" type="text" value={testName} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTestName(e.target.value)} fullWidth />
                    </Grid>
                    <Grid item xs={12}>
                        <InputLabel htmlFor="addressCountry" sx={inputLabelStyles}>{t('addressCountry')}</InputLabel>
                        <BootstrapInput id="addressCountry" type="text" value={addressCountry} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setAddressCountry(e.target.value)} fullWidth />
                    </Grid>
                    <Grid item xs={12}>
                        <InputLabel htmlFor="countryCode" sx={inputLabelStyles}>{t('countryCode')}</InputLabel>
                        <BootstrapInput id="countryCode" type="text" value={countryCode} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCountryCode(e.target.value)} fullWidth />
                    </Grid>                    
                </Grid>
            </DialogContent>
            <DialogActions>
                <Button variant="contained" onClick={() => { createNewContact(); }} sx={actionButtonStyles}>{t('validate')}</Button>
                <Button variant="contained" onClick={props.closeModal} sx={buttonCloseStyles}>{t('close')}</Button>
            </DialogActions>
        </>
    );
}

export default NewContact;
