import { useState } from 'react';
import { BootstrapDialogTitle, BootstrapInput, actionButtonStyles, buttonCloseStyles, inputLabelStyles } from '@utils/misc/styles';
import { Button, DialogActions, DialogContent, InputLabel } from '@mui/material';
import Grid from '@mui/material/Grid2';
import { useTranslation } from 'react-i18next';
import { enqueueSnackbar } from 'notistack';
import { postProduct, ProductViewModel } from '@features/transport/api';

function NewProduct(props: any) {
    const [testName, setTestName] = useState<string>("");
    
    const { t } = useTranslation();
    
    const createNewProduct = async () => {
        if (testName !== "") {
            var dataSent: ProductViewModel = {
                "productName": testName,
            };
            
            try {
                const response = await postProduct({body: dataSent});
                if (response !== null) {
                    enqueueSnackbar(t('productAdded'), { variant: "success", anchorOrigin: { horizontal: "right", vertical: "top"} });
                    
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
            <BootstrapDialogTitle id="custom-dialog-title77" onClose={props.closeModal}>
                <b>{t('createNewProduct')}</b>
            </BootstrapDialogTitle>
            <DialogContent dividers>
                <Grid container spacing={2}>
                    <Grid size={{ xs: 12 }}>
                        <InputLabel htmlFor="test-name" sx={inputLabelStyles}>{t('productName')}</InputLabel>
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
