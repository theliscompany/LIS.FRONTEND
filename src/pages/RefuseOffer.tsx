import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Typography, Box, Grid, Chip, InputLabel, Button, Alert, List, ListItem, ListItemText, DialogActions, DialogContent } from '@mui/material';
import Skeleton from '@mui/material/Skeleton';
import { SnackbarProvider, enqueueSnackbar } from 'notistack';
import { protectedResources, transportRequest } from '../config/authConfig';
import { BootstrapDialog, BootstrapDialogTitle, BootstrapInput, buttonCloseStyles, gridStyles, inputLabelStyles } from '../utils/misc/styles';
import { useTranslation } from 'react-i18next';


function RefuseOffer(props: any) {
    const [load, setLoad] = useState<boolean>(true);
    const [modal, setModal] = useState<boolean>(true);
    const [isRejected, setIsRejected] = useState<boolean>(false);
    
    let { id } = useParams();
    
    const { t } = useTranslation();
        
    useEffect(() => {
        refuseOffer();
    }, []);

    const refuseOffer = async () => {
        const body: any = {
            id: id,
            newStatus: "Rejected"
        };

        fetch(protectedResources.apiLisOffer.endPoint+"/QuoteOffer/"+id+"/approval?newStatus=Rejected", {
            method: "PUT",
            body: body,
        }).then((data: any) => {
            setLoad(false);
            setIsRejected(true);
            enqueueSnackbar(t('priceOfferRejected'), { variant: "success", anchorOrigin: { horizontal: "right", vertical: "top"} });
        }).catch(error => { 
            setLoad(false);
            enqueueSnackbar(t('errorHappened'), { variant: "error", anchorOrigin: { horizontal: "right", vertical: "top"} });
        });
    }
    
    return (
        <div className="App">
            <BootstrapDialog
                onClose={() => setModal(false)}
                aria-labelledby="custom-dialog-title"
                open={modal}
                maxWidth="md"
                fullWidth
            >
                <BootstrapDialogTitle id="custom-dialog-title" onClose={() => setModal(false)}>
                    <b>{t('messageModal')}</b>
                </BootstrapDialogTitle>
                <DialogContent dividers>
                    {
                        load !== true ?
                        isRejected ? <Alert severity="info">{t('priceOfferRejected')}</Alert> : <Alert severity="warning">{t('errorHappened')}</Alert>
                        : <Skeleton />
                    }
                </DialogContent>
                <DialogActions>
                    <Button variant="contained" onClick={() => setModal(false)} sx={buttonCloseStyles}>{t('close')}</Button>
                </DialogActions>
            </BootstrapDialog>
        </div>
    );
}

export default RefuseOffer;
