import { useState } from 'react';
import { BootstrapDialogTitle, BootstrapInput, buttonCloseStyles, inputLabelStyles } from '../../utils/misc/styles';
import { Button, DialogActions, DialogContent, Grid, InputLabel, Typography } from '@mui/material';
import { useAuthorizedBackendApi } from '../../api/api';
import { useTranslation } from 'react-i18next';
import { enqueueSnackbar } from 'notistack';
import { protectedResources } from '../../config/authConfig';
import { BackendService } from '../../utils/services/fetch';
import { useAccount, useMsal } from '@azure/msal-react';

function RequestAskInformation(props: any) {
    const [mailSubject, setMailSubject] = useState<string>("");
    const [mailContent, setMailContent] = useState<string>("");
    
    const { accounts } = useMsal();
    const account = useAccount(accounts[0] || {});

    const context = useAuthorizedBackendApi();
    const { t } = useTranslation();
    
    const askInformations = async () => {
        if (mailContent !== "") {
            if (context && account) {
                var dataSent = { "content": mailContent, "requestQuoteId": props.id, "subject": mailSubject, "noteType": "InformationRequest", email: props.email, "idUser": account?.username };
                const response = await (context as BackendService<any>).post(protectedResources.apiLisQuotes.endPoint+"/RequestQuoteNotes", dataSent);
                if (response !== null) {
                    props.closeModal();
                    enqueueSnackbar(t('messageSuccessSent'), { variant: "success", anchorOrigin: { horizontal: "right", vertical: "top"} });
                }
                else {
                    enqueueSnackbar(t('errorHappened'), { variant: "error", anchorOrigin: { horizontal: "right", vertical: "top"} });
                }
            }
        }
        else {
            enqueueSnackbar(t('contentEmpty'), { variant: "error", anchorOrigin: { horizontal: "right", vertical: "top"} });
        }
    }

    return (
        <>
            <BootstrapDialogTitle id="custom-dialog-title" onClose={props.closeModal}>
                <b>{t('askInformation')}</b>
            </BootstrapDialogTitle>
            <DialogContent dividers>
                <Typography variant="subtitle1" gutterBottom px={2}>
                    {t('pleaseFillForm')}
                </Typography>
                <Grid container spacing={2} mt={1} px={2}>
                    <Grid item xs={12}>
                        <InputLabel htmlFor="mail-subject" sx={inputLabelStyles}>{t('subject')}</InputLabel>
                        <BootstrapInput id="mail-subject" type="text" inputProps={{ min: 0, max: 100 }} value={mailSubject} onChange={(e: any) => {setMailSubject(e.target.value)}} fullWidth />
                    </Grid>
                    <Grid item xs={12} mt={1}>
                        <InputLabel htmlFor="mail-content" sx={inputLabelStyles}>{t('content')}</InputLabel>
                        <BootstrapInput id="mail-content" type="text" multiline rows={4} value={mailContent} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setMailContent(e.target.value)} fullWidth />
                    </Grid>
                </Grid>
            </DialogContent>
            <DialogActions>
                <Button variant="contained" color="primary" className="mr-3" onClick={askInformations} sx={{ textTransform: "none" }}>{t('send')}</Button>
                <Button variant="contained" onClick={props.closeModal} sx={buttonCloseStyles}>{t('close')}</Button>
            </DialogActions>
        </>
    );
}

export default RequestAskInformation;
