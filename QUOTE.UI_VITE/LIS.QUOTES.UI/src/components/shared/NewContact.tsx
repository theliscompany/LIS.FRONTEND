import { useState } from 'react';
import { BootstrapDialogTitle, BootstrapInput, actionButtonStyles, buttonCloseStyles, inputLabelStyles, properties } from '../../utils/misc/styles';
import { Button, DialogActions, DialogContent, InputLabel } from '@mui/material';
import Grid from '@mui/material/Grid2';
import { useTranslation } from 'react-i18next';
import { enqueueSnackbar } from 'notistack';
import { MuiTelInput } from 'mui-tel-input';
import CountrySelect from '../shared/CountrySelect';
import { postContactCreateContact } from '../../api/client/crm';


function NewContact(props: any) {
    const [testName, setTestName] = useState<string>("");
    const [country, setCountry] = useState<any>(null);
    const [addressCountry, setAddressCountry] = useState<string>("");
    const [testPhone, setTestPhone] = useState<string>("");
    const [testEmail, setTestEmail] = useState<string>("");
    
    const { t } = useTranslation();
    
    const handleChange = (newPhone: string) => {
        setTestPhone(newPhone)
    }

    var namesArray = [
        { type: "", name: t('client')} ,
        { type: "OTHERS", name: t('supplier')} ,
        { type: "SUPPLIERS", name: t('haulier')} ,
        { type: "SHIPPING_LINES", name: t('carrier') }
    ];
    
    const getFirstMatchingName = (array: any, selectedTypes: any) => {
        const firstMatchingEntry = array.find((entry: any) => selectedTypes.includes(entry.type));
        return firstMatchingEntry ? firstMatchingEntry.name : null;
    };
    
    const createNewContact = async () => {
        console.log(country);
        if (country !== null && testName !== "" && testPhone !== "" && testEmail !== "" && addressCountry !== "") {
            var dataSent = {
                "contactName": testName,
                "addressCountry": addressCountry,
                "createdBy": 5,
                "countryCode": country.code,
                "phone": testPhone,
                "email": testEmail,
                // Check if different from empty string first
                "categories": !(Array.isArray(props.categories) && props.categories.length === 1 && props.categories[0] === "") ? props.categories : []
            }
            
            var categoriesText = props.categories.length !== 0 ? "?"+ props.categories.map((category: any) => category !== "OTHERS" ? `categories=${category}`  : "").join('&') : "";
            if (categoriesText === "?categories=") {
                categoriesText = "";
            }
            console.log(categoriesText);

            try {
                const response = await postContactCreateContact({body: dataSent});
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
        else {
            enqueueSnackbar(t('verifyMessage'), { variant: "warning", anchorOrigin: { horizontal: "right", vertical: "top"} });
        }
    }
    
    return (
        <>
            <BootstrapDialogTitle id="custom-dialog-title7" onClose={props.closeModal}>
                <b>{t('createNew')} {getFirstMatchingName(namesArray, props.categories)}</b>
            </BootstrapDialogTitle>
            <DialogContent dividers>
                <Grid container spacing={2}>
                    <Grid size={{ xs: 12 }}>
                        <InputLabel htmlFor="test-name" sx={inputLabelStyles}>
                            {getFirstMatchingName(namesArray, props.categories)}
                        </InputLabel>
                        <BootstrapInput id="test-name" type="text" value={testName} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTestName(e.target.value)} fullWidth />
                    </Grid>
                    <Grid size={{ xs: 6 }}>
                        <InputLabel htmlFor="addressCountry" sx={inputLabelStyles}>{t('addressCountry')}</InputLabel>
                        <BootstrapInput id="addressCountry" type="text" value={addressCountry} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setAddressCountry(e.target.value)} fullWidth />
                    </Grid>
                    <Grid size={{ xs: 6 }}>
                        <InputLabel htmlFor="countryCode" sx={inputLabelStyles}>{t('countryCode')}</InputLabel>
                        <CountrySelect id="countryCode" value={country} onChange={setCountry} fullWidth />
                    </Grid>
                    <Grid size={{ xs: 12 }}>
                        <InputLabel htmlFor="my-email" sx={inputLabelStyles}>{t('emailAddress')}</InputLabel>
                        <BootstrapInput id="my-email" type="email" value={testEmail} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTestEmail(e.target.value)} fullWidth />
                    </Grid>
                    <Grid size={{ xs: 12 }}>
                        <InputLabel htmlFor="phone-number" sx={inputLabelStyles}>{t('whatsappNumber')}</InputLabel>
                        <MuiTelInput 
                            id="phone-number" 
                            size="small"
                            value={testPhone} 
                            onChange={handleChange} 
                            defaultCountry="CM" 
                            preferredCountries={["CM", "BE", "KE"]} 
                            fullWidth 
                            sx={{ mt: 1 }}
                            error={false}
                            {...properties}
                        />
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
