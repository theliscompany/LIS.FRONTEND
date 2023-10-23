import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Button, Alert, DialogActions, DialogContent } from '@mui/material';
import Skeleton from '@mui/material/Skeleton';
import { enqueueSnackbar } from 'notistack';
import { protectedResources } from '../config/authConfig';
import { BootstrapDialog, BootstrapDialogTitle, buttonCloseStyles } from '../utils/misc/styles';
import { useTranslation } from 'react-i18next';


function AcceptOffer(props: any) {
    const [load, setLoad] = useState<boolean>(true);
    const [modal, setModal] = useState<boolean>(true);
    const [isAccepted, setIsAccepted] = useState<boolean>(false);
    
    let { id } = useParams();
    
    const { t } = useTranslation();
        
    useEffect(() => {
        acceptOffer();
    }, []);

    const acceptOffer = async () => {
        const body: any = {
            id: id,
            newStatus: "Accepted"
        };

        fetch(protectedResources.apiLisOffer.endPoint+"/QuoteOffer/"+id+"/approval?newStatus=Accepted", {
            method: "PUT",
            body: body,
        }).then((data: any) => {
            setLoad(false);
            setIsAccepted(true);
            enqueueSnackbar(t('priceOfferApproved'), { variant: "success", anchorOrigin: { horizontal: "right", vertical: "top"} });
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
                        isAccepted ? <Alert severity="info">{t('priceOfferApproved')}</Alert> : <Alert severity="warning">{t('errorHappened')}</Alert>
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

export default AcceptOffer;
