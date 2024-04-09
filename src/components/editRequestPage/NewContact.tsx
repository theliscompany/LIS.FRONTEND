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
import { MuiTelInput } from 'mui-tel-input';
import CountrySelect from '../shared/CountrySelect';

function NewContact(props: any) {
    const [testName, setTestName] = useState<string>("");
    const [country, setCountry] = useState<any>(null);
    const [addressCountry, setAddressCountry] = useState<string>("");
    const [testPhone, setTestPhone] = useState<string>("");
    const [testEmail, setTestEmail] = useState<string>("");
    
    const { instance, accounts } = useMsal();
    const account = useAccount(accounts[0] || {});

    const context = useAuthorizedBackendApi();
    const { t } = useTranslation();
    
    var namesArray = [
        {type: "", name: t('client')},
        {type: "OTHERS", name: t('supplier')},
        {type: "SUPPLIERS", name: t('haulier')},
        {type: "SHIPPING_LINES", name: t('carrier')}
    ];
    
    const getFirstMatchingName = (array: any, selectedTypes: any) => {
        const firstMatchingEntry = array.find((entry: any) => selectedTypes.includes(entry.type));
        return firstMatchingEntry ? firstMatchingEntry.name : null;
    };
    
    const createNewContact = async () => {
        console.log(country);
        if (country !== null && testName !== "" && testPhone !== "" && testEmail !== "" && addressCountry !== "") {
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
                    "countryCode": country.code,
                    "phone": testPhone,
                    "email": testEmail
                }
                
                var categoriesText = props.categories.length !== 0 ? "?"+ props.categories.map((category: any) => category !== "OTHERS" ? `categories=${category}`  : "").join('&') : "";
                if (categoriesText === "?categories=") {
                    categoriesText = "";
                }
                console.log(categoriesText);
    
                try {
                    const response = await (context as BackendService<any>).postWithToken(protectedResources.apiLisCrm.endPoint+"/Contact/CreateCustomerContact"+categoriesText, dataSent, token);
                    if (response !== null) {
                        enqueueSnackbar("The contact has been added with success!", { variant: "success", anchorOrigin: { horizontal: "right", vertical: "top"} });
                        
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
            enqueueSnackbar("One or many the fields are empty, please verify the form and fill everything.", { variant: "warning", anchorOrigin: { horizontal: "right", vertical: "top"} });
        }
    }
    
    return (
        <>
            <BootstrapDialogTitle id="custom-dialog-title7" onClose={props.closeModal}>
                <b>Create new {getFirstMatchingName(namesArray, props.categories)}</b>
            </BootstrapDialogTitle>
            <DialogContent dividers>
                <Grid container spacing={2}>
                    <Grid item xs={12}>
                        <InputLabel htmlFor="test-name" sx={inputLabelStyles}>
                            {getFirstMatchingName(namesArray, props.categories)}
                        </InputLabel>
                        <BootstrapInput id="test-name" type="text" value={testName} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTestName(e.target.value)} fullWidth />
                    </Grid>
                    <Grid item xs={12}>
                        <InputLabel htmlFor="addressCountry" sx={inputLabelStyles}>{t('addressCountry')}</InputLabel>
                        <BootstrapInput id="addressCountry" type="text" value={addressCountry} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setAddressCountry(e.target.value)} fullWidth />
                    </Grid>
                    <Grid item xs={12}>
                        <InputLabel htmlFor="countryCode" sx={inputLabelStyles}>{t('countryCode')}</InputLabel>
                        <CountrySelect id="countryCode" value={country} onChange={setCountry} fullWidth />
                    </Grid>
                    <Grid item xs={12}>
                        <InputLabel htmlFor="my-email" sx={inputLabelStyles}>{t('emailAddress')}</InputLabel>
                        <BootstrapInput id="my-email" type="email" value={testEmail} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTestEmail(e.target.value)} fullWidth />
                    </Grid>
                    <Grid item xs={12}>
                        <InputLabel htmlFor="phone-number" sx={inputLabelStyles}>{t('whatsappNumber')}</InputLabel>
                        <MuiTelInput id="phone-number" value={testPhone} onChange={setTestPhone} defaultCountry="CM" preferredCountries={["CM", "BE", "KE"]} fullWidth sx={{ mt: 1 }} />
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
