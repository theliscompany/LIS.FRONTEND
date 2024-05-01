import { useState } from 'react';
import { BootstrapDialogTitle, BootstrapInput, DarkTooltip, buttonCloseStyles, inputLabelStyles } from '../../utils/misc/styles';
import { Button, DialogActions, DialogContent, FormControl, FormControlLabel, FormLabel, Grid, InputLabel, Radio, RadioGroup, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useAuthorizedBackendApi } from '../../api/api';
import { enqueueSnackbar } from 'notistack';
import { BackendService } from '../../utils/services/fetch';
import { protectedResources } from '../../config/authConfig';

function RequestChangeStatus(props: any) {
    const [statusMessage, setStatusMessage] = useState<string>("");
    const [selectedStatus, setSelectedStatus] = useState('EnAttente');
    
    const context = useAuthorizedBackendApi();
    const { t } = useTranslation();
    
    const statusTypes = [
        { type: "EnAttente", label: t('labelEnAttente'), value: "En attente", description: t('descriptionEnAttente') }, 
        { type: "Valider", label: t('labelValider'), value: "Validé", description: t('descriptionValider') }, 
        { type: "Rejeter", label: t('labelRejeter'), value: "Rejeté", description: t('descriptionRejeter') }, 
        { type: "EnCoursDeTraitement", label: t('labelEnCoursDeTraitement'), value: "En cours de traitement", description: t('descriptionEnCoursDeTraitement') }, 
        { type: "EnTransit", label: t('labelEnTransit'), value: "En transit", description: t('descriptionEnTransit') }, 
        { type: "EnDouane", label: t('labelEnDouane'), value: "En douane", description: t('descriptionEnDouane') }, 
        { type: "LivraisonEnCours", label: t('labelLivraisonEnCours'), value: "Livraison en cours", description: t('descriptionLivraisonEnCours') }, 
        { type: "Livre", label: t('labelLivre'), value: "Livré", description: t('descriptionLivre') }, 
        { type: "Annule", label: t('labelAnnule'), value: "Annulé", description: t('descriptionAnnule') }, 
        { type: "Retour", label: t('labelRetour'), value: "Retourné", description: t('descriptionRetour') }, 
        { type: "Problème", label: t('labelProbleme'), value: "Problème", description: t('descriptionProbleme') }, 
        { type: "EnAttenteDeFacturation", label: t('labelEnAttenteDeFacturation'), value: "En attente de facturation", description: t('descriptionEnAttenteDeFacturation') } 
    ];
    
    const handleChangeStatus = (event: React.ChangeEvent<HTMLInputElement>) => {
        setSelectedStatus((event.target as HTMLInputElement).value);
    };

    const changeStatusRequest = async () => {
        if(context) {
            const body: any = {
                newStatus: selectedStatus,
                customMessage: statusMessage
            };

            const data = await (context?.service as BackendService<any>).put(protectedResources.apiLisQuotes.endPoint+"/Request/"+props.id+"/changeStatus", body);
            if (data?.status === 200) {
                props.closeModal();
                enqueueSnackbar(t('requestStatusUpdated'), { variant: "success", anchorOrigin: { horizontal: "right", vertical: "top"} });
            }
            else {
                enqueueSnackbar(t('errorHappened'), { variant: "error", anchorOrigin: { horizontal: "right", vertical: "top"} });
            }
        }
    }

    return (
        <>
            <BootstrapDialogTitle id="custom-dialog-title2" onClose={props.closeModal}>
                <b>{t('changeRequestStatus')}</b>
            </BootstrapDialogTitle>
            <DialogContent dividers>
                <Typography variant="subtitle1" gutterBottom px={2}>
                    {t('pleaseChooseOptions')}
                </Typography>
                <Grid container spacing={2} mt={1} px={2}>
                    <Grid item xs={12}>
                        <FormControl>
                            <FormLabel id="demo-controlled-radio-buttons-group" sx={{ color: "#333" }}>{t('statusList')}</FormLabel>
                            <RadioGroup
                                aria-labelledby="demo-controlled-radio-buttons-group"
                                name="controlled-radio-buttons-group"
                                row
                                value={selectedStatus}
                                onChange={handleChangeStatus}
                            >
                                {
                                    statusTypes.map((elm: any) => <DarkTooltip key={"StatusType-"+elm.type} title={elm.label} placement="right" arrow><FormControlLabel value={elm.type} control={<Radio />} label={elm.label} /></DarkTooltip>)
                                }
                            </RadioGroup>
                        </FormControl>
                    </Grid>
                    <Grid item xs={12} mt={1}>
                        <InputLabel htmlFor="status-message" sx={inputLabelStyles}>{t('statusMessage')}</InputLabel>
                        <BootstrapInput id="status-message" type="text" multiline rows={4} value={statusMessage} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setStatusMessage(e.target.value)} fullWidth />
                    </Grid>
                </Grid>
            </DialogContent>
            <DialogActions>
                <Button variant="contained" color="primary" className="mr-3" onClick={changeStatusRequest} sx={{ textTransform: "none" }}>{t('validate')}</Button>
                <Button variant="contained" onClick={props.closeModal} sx={buttonCloseStyles}>{t('close')}</Button>
            </DialogActions>
        </>
    );
}

export default RequestChangeStatus;
