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
            newStatus: "Accepted",
            option: 0
        };

        fetch(protectedResources.apiLisOffer.endPoint+"/QuoteOffer/"+id+"/approval?newStatus=Accepted", {
            method: "PUT",
            body: body,
        }).then((response: any) => {
            if (response.ok) {
                return response.json();
            }
            else {
                throw new Error('Network response was not ok.');
            }
        }).then((data: any) => {
            console.log(data);
            var lang = data.data.comment.startsWith("<p>Bonjour") ? "fr" : "en";
            
            var messageText = `
            <div style="font-family: Verdana;"></div>
            <div style="font-family: Verdana; padding-top: 30px; padding-bottom: 20px;">
                <div style="margin-top: 15px;"><a target="_blank" href="www.omnifreight.eu">www.omnifreight.eu</a></div>
                <div style="padding-bottom: 10px;"><a target="_blank" href="http://www.facebook.com/omnifreight">http://www.facebook.com/omnifreight</a></div>
                <div>Italiëlei 211</div>
                <div>2000 Antwerpen</div>
                <div>Belgium</div>
                <div>E-mail: transport@omnifreight.eu</div>
                <div>Tel +32.3.295.38.82</div>
                <div>Fax +32.3.295.38.77</div>
                <div>Whatsapp +32.494.40.24.25</div>
                <img src="http://www.omnifreight.eu/Images/omnifreight_logo.jpg" style="max-width: 200px;">
            </div>
            `;
            
            sendEmail("pricing@omnifreight.eu", data.data.emailUser, t('confirmationOffer', {lng: lang}), data.data.comment);
            setLoad(false);
            setIsAccepted(true);
            enqueueSnackbar(t('priceOfferApproved'), { variant: "success", anchorOrigin: { horizontal: "right", vertical: "top" } });
        }).catch(error => { 
            setLoad(false);
            enqueueSnackbar(t('errorHappened'), { variant: "error", anchorOrigin: { horizontal: "right", vertical: "top" } });
        });
    }
    
    async function sendEmail(from: string, to: string, subject: string, htmlContent: string) {
		const formData = new FormData();
		// Append the other email data to the FormData object
		formData.append('From', from);
		formData.append('To', to);
		formData.append('Subject', subject);
		formData.append('HtmlContent', htmlContent);
		
		// // Send the email with fetch
		fetch(protectedResources.apiLisQuotes.endPoint+'/Email', {
			method: 'POST',
			headers: {
				'accept': '*/*',
				// 'Content-Type': 'multipart/form-data'
			},
			body: formData
		})
		.then((response) => response.json())
		.then((data) => console.log(data))
		.catch((error) => console.error(error));
	}

	return (
        <div className="App">
            <BootstrapDialog open={modal} onClose={() => setModal(false)} maxWidth="md" fullWidth>
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
