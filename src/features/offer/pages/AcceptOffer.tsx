import { useEffect, useState } from 'react';
import { Button, Alert, DialogActions, DialogContent } from '@mui/material';
import Skeleton from '@mui/material/Skeleton';
// import { protectedResources } from '../../config/authConfig';
import { BootstrapDialog, BootstrapDialogTitle, buttonCloseStyles } from '@utils/misc/styles';
import { useTranslation } from 'react-i18next';
import { useLocation, useParams } from 'react-router-dom';
// import { enqueueSnackbar } from 'notistack';
// import { putApiQuoteOfferByIdApproval } from '@features/offer/api'; // Fonction non disponible dans la nouvelle API
import { getQuote, putApiQuoteByIdSelectPreferredOption } from '@features/offer/api';
import { postApiOrders } from '@features/shipment/api';
import { postApiEmail } from '@features/request/api';
import { enqueueSnackbar, SnackbarProvider } from 'notistack';
import { parseInfos } from '@utils/functions';

const AcceptOffer = () => {
    const [load, setLoad] = useState<boolean>(true);
    const [modal, setModal] = useState<boolean>(true);
    const [isAccepted, setIsAccepted] = useState<boolean>(false);
    
    let { id } = useParams();
    const { t } = useTranslation();

    const location = useLocation();
    const searchParams = new URLSearchParams(location.search);
    const currentOption = searchParams.get('option');
    
    function getOfferContent(mail: string, offerNumber: number, language: string) {
        const offerRegex = new RegExp(`# ${t('offer', {lng: language}).toUpperCase()} ${offerNumber}\\s*(.*?)\\s*(# ${t('offer', {lng: language}).toUpperCase()} \\d+|<p>\\s*${t('endMailWord', {lng: language})})`, 's');
        const match = mail.match(offerRegex);
      
        if (match) {
            return match[1].trim();
        } 
        else {
            return "Aucune offre correspondante trouvée.";
        }
    }  
        
    useEffect(() => {
        acceptOffer();
    }, []);

    const acceptOffer = async () => {
        var cOption = currentOption !== null && currentOption !== undefined ? Number(currentOption) : 0;
        
        // Étape 1: Récupérer la quote
        try {
            const quoteData = await getQuote({path: {id: String(id)}});
            console.log("Quote Data: ", quoteData.data);
            
            // Étape 2: Sélectionner l'option préférée (simule l'approbation)
            await putApiQuoteByIdSelectPreferredOption({
                path: {id: String(id)}, 
                query: {optionIndex: cOption}
            });
            
            // Étape 3: Traiter comme approuvé
            if (quoteData.data && typeof quoteData.data === 'object') {
                const quote = quoteData.data as any;
                createOrder(quote.options[cOption], quote, cOption);
                setLoad(false);
                setIsAccepted(true);
                enqueueSnackbar(t('priceOfferApproved'), { variant: "success", anchorOrigin: { horizontal: "right", vertical: "top" } });
            } else {
                throw new Error('Données de quote invalides');
            }
        } catch (error) { 
            setLoad(false);
            console.log(error);
            enqueueSnackbar(t('errorHappened'), { variant: "error", anchorOrigin: { horizontal: "right", vertical: "top" } });
        }
    }

    const extractName = (html: string): string | null => {
        console.log("Html : ", html);
        if (typeof html !== 'string') {
            console.error('Le contenu fourni nest pas une chaîne.');
            return null;
        }
        const regex = /<strong>([^<]+)<\/strong>/i; // Expression régulière
        const match = html.match(regex); // Cherche la première correspondance
        return match ? match[1] : null;
    };
    
    const createOrder = async (option: any, offerData: any, currentOpt: number) => {
        console.log("Option : ", option);
        console.log("Data : ", offerData);

        postApiOrders({body: {
            orderId: 0,
            customerId: Number(parseInfos(offerData.clientNumber).id),
            exportation: true,
            departurePort: option.portDeparture.portId,
            destinationPort: option.portDestination.portId
        }})
        .then((data: any) => {
            console.log("All : ", data.data);            
            var lang = offerData.comment.startsWith("<p>Bonjour") ? "fr" : "en";
            var infos = getOfferContent(offerData.comment, Number(currentOpt)+1, lang);
            console.log("Infos : ", infos);
            var nOption = currentOpt !== null ? currentOpt : 0;
            var messageText = `
            <div style="font-family: Verdana;">
                <p>${t('hello', {lng: lang})} ${extractName(offerData.comment)},</p>
                <p>${t('confirmationOfferThanks', {lng: lang})}</p>
                <p>${t('confirmationOfferText', {lng: lang})}</p>
                <p>${t('loadingCity', {lng: lang})} : ${offerData.options[nOption].selectedHaulage.loadingCityName}</p>
                <p>${t('destinationPort', {lng: lang})} : ${offerData.options[nOption].selectedSeafreights[0].destinationPortName}</p>
                <p>${infos}</p>
                <br>
                <p>${t('trackingOptions', {lng: lang})} ${parseInfos(offerData.clientNumber).requestNumber}</p>
                <br>
                <p><a href='${import.meta.env.VITE_ORIGIN_URL}/tracking/${parseInfos(offerData.clientNumber).requestNumber}'>${t('trackingLink', {lng: lang})}</a></p>
                <br>
                <p>${t('endMailWord', {lng: lang})}</p>
            </div>
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
                <img src="https://omnifreight.eu/wp-content/uploads/2023/06/logo.jpg" style="max-width: 200px;">
            </div>`;            
            sendEmail("pricing@omnifreight.eu", offerData.emailUser, t('confirmationOffer', {lng: lang}), messageText);
        })
        .catch((error: any) => { 
            setLoad(false);
            console.log(error);
        });
    }
    
    async function sendEmail(from: string, to: string, subject: string, htmlContent: string) {
		const formData = new FormData();
		// Append the other email data to the FormData object
		formData.append('From', from);
		formData.append('To', to);
		formData.append('Subject', subject);
		formData.append('HtmlContent', htmlContent);
		
		// Send the email with fetch
		postApiEmail({body: {
            From: from,
            To: to,
            Subject: subject,
            HtmlContent: htmlContent
        }})
		// .then((response: any) => response.json())
		.then((data) => console.log(data))
		.catch((error) => console.error(error));
	}

	return (
        <div className="App">
            <SnackbarProvider>
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
            </SnackbarProvider>
        </div>
    );
}

export default AcceptOffer;
