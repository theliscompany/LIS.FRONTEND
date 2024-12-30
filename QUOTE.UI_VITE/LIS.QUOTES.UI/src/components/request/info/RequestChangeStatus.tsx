import { useState } from 'react';
import { BootstrapDialogTitle, BootstrapInput, DarkTooltip, buttonCloseStyles, inputLabelStyles } from '../../../utils/misc/styles';
import { statusTypes } from '../../../utils/constants';
import { Button, DialogActions, DialogContent, FormControl, FormControlLabel, FormLabel, InputLabel, Radio, RadioGroup, Typography } from '@mui/material';
import Grid from '@mui/material/Grid2'
import { useTranslation } from 'react-i18next';
import { enqueueSnackbar } from 'notistack';
import { putApiRequestByIdChangeStatus } from '../../../api/client/quote';

function RequestChangeStatus(props: any) {
    const [statusMessage, setStatusMessage] = useState<string>("");
    const [selectedStatus, setSelectedStatus] = useState('EnAttente');
    
    const { t } = useTranslation();
    
    const handleChangeStatus = (event: React.ChangeEvent<HTMLInputElement>) => {
        setSelectedStatus((event.target as HTMLInputElement).value);
    };

    const changeStatusRequest = async () => {
        try {
            const body: any = {
                newStatus: selectedStatus,
                customMessage: statusMessage
            };

            const data = await putApiRequestByIdChangeStatus({path: {id: props.id}, body: body});
            if (data?.data) {
                props.closeModal();
                enqueueSnackbar(t('requestStatusUpdated'), { variant: "success", anchorOrigin: { horizontal: "right", vertical: "top"} });
            }
            else {
                enqueueSnackbar(t('errorHappened'), { variant: "error", anchorOrigin: { horizontal: "right", vertical: "top"} });
            }
        }
        catch (err: any) {
            console.log(err);
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
                    <Grid size={{xs: 12 }}>
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
                                    statusTypes.map((elm: any) => <DarkTooltip key={"StatusType-"+elm.type} title={t(elm.label)} placement="right" arrow><FormControlLabel value={elm.type} control={<Radio />} label={t(elm.label)} /></DarkTooltip>)
                                }
                            </RadioGroup>
                        </FormControl>
                    </Grid>
                    <Grid size={{xs: 12 }} mt={1}>
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
