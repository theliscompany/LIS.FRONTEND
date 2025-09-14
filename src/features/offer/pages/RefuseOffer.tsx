import { useEffect, useState } from 'react';
import { Button, Alert, DialogActions, DialogContent } from '@mui/material';
import Skeleton from '@mui/material/Skeleton';
import { BootstrapDialog, BootstrapDialogTitle, buttonCloseStyles } from '@utils/misc/styles';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import { enqueueSnackbar, SnackbarProvider } from 'notistack';
// import { putApiQuoteOfferByIdApproval } from '@features/offer/api';

const RefuseOffer = () => {
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

        // Endpoint supprimé - fonctionnalité désactivée
        enqueueSnackbar('Fonctionnalité de refus temporairement indisponible', { variant: "warning", anchorOrigin: { horizontal: "right", vertical: "top"} });
        setLoad(false);
        
        /*
        putApiQuoteOfferByIdApproval({path: {id: String(id)}, query: {NewStatus: "Rejected"}, body: body})
        .then(() => {
            setLoad(false);
            setIsRejected(true);
            enqueueSnackbar(t('priceOfferRejected'), { variant: "success", anchorOrigin: { horizontal: "right", vertical: "top"} });
        }).catch(() => { 
            setLoad(false);
            enqueueSnackbar(t('errorHappened'), { variant: "error", anchorOrigin: { horizontal: "right", vertical: "top"} });
        });
        */
    }
    
    return (
        <div className="App">
            <SnackbarProvider>
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
            </SnackbarProvider>
        </div>
    );
}

export default RefuseOffer;
