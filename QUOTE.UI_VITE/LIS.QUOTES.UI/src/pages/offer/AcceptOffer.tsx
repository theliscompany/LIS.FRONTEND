import { useEffect, useState } from 'react';
//import { useLocation } from 'react-router-dom';
import { Button, Alert, DialogActions, DialogContent } from '@mui/material';
import Skeleton from '@mui/material/Skeleton';
// import { protectedResources } from '../../config/authConfig';
import { BootstrapDialog, BootstrapDialogTitle, buttonCloseStyles } from '../../utils/misc/styles';
import { useTranslation } from 'react-i18next';

const AcceptOffer = () => {
    const [load] = useState<boolean>(true);
    const [modal, setModal] = useState<boolean>(true);
    const [isAccepted] = useState<boolean>(false);
    
    //let { id } = useParams();
    const { t } = useTranslation();

    //const location = useLocation();
    //const searchParams = new URLSearchParams(location.search);
    //const currentOption = searchParams.get('option');
    
    // function getOfferContent(mail: string, offerNumber: number, language: string) {
    //     const offerRegex = new RegExp(`# ${t('offer', {lng: language}).toUpperCase()} ${offerNumber}\\s*(.*?)\\s*(# ${t('offer', {lng: language}).toUpperCase()} \\d+|<p>\\s*${t('endMailWord', {lng: language})})`, 's');
    //     const match = mail.match(offerRegex);
      
    //     if (match) {
    //         return match[1].trim();
    //     } 
    //     else {
    //         return "Aucune offre correspondante trouvée.";
    //     }
    // }  
        
    useEffect(() => {
        acceptOffer();
    }, []);

    const acceptOffer = async () => {
        //var cOption = currentOption !== null && currentOption !== undefined ? Number(currentOption) : 0;
        // const body: any = {
        //     id: id,
        //     newStatus: "Accepted",
        //     option: cOption
        // };

        // fetch(protectedResources.apiLisOffer.endPoint+"/QuoteOffer/"+id+"/approval?newStatus=Accepted", {
        //     method: "PUT",
        //     body: body,
        // }).then((response: any) => {
        //     if (response.ok) {
        //         return response.json();
        //     }
        //     else {
        //         throw new Error('Network response was not ok.');
        //     }
        // }).then((data: any) => {
        //     // createOrder(data.data.options[cOption], data.data, cOption);
        //     setLoad(false);
        //     setIsAccepted(true);
        //     enqueueSnackbar(t('priceOfferApproved'), { variant: "success", anchorOrigin: { horizontal: "right", vertical: "top" } });
        // }).catch(error => { 
        //     setLoad(false);
        //     console.log(error);
        //     // enqueueSnackbar(t('errorHappened'), { variant: "error", anchorOrigin: { horizontal: "right", vertical: "top" } });
        // });
    }
    
    // const createOrder = async (option: any, offerData: any, currentOpt: number) => {
    //     console.log("Option : ", option);
    //     console.log("Data : ", offerData);
    //     // var dataSent = {
    //     //     // "orderId": Number(id),
    //     //     // "orderNumber": orderData.orderNumber,
    //     //     "orderDate": new Date().toISOString(),
    //     //     // "closeDate": orderData.closeDate,
    //     //     "sellerId": seller.contactId,
    //     //     "buyerId": buyer.contactId,
    //     //     "customerId": customer.contactId,
    //     //     "shippingAgent": carrierAgent.contactId,
    //     //     // "shipId": orderData.shipId,
    //     //     "shipLineId": carrier.contactId,
    //     //     "employeeId": orderData.employeeId,
    //     //     // "paymentCondition": orderData.paymentCondition,
    //     //     "orderStatus": 0,
    //     //     // "lastEdited": orderData.lastEdited,
    //     //     // "lastEditor": orderData.lastEditor,
    //     //     "departurePort": portLoading.portId,
    //     //     "destinationPort": portDischarge.portId,
    //     //     // "estimatedDepartureDate": etd?.toISOString(),
    //     //     // "estimatedArrivalDate": eta?.toISOString(),
    //     //     "incoTerm": "",
    //     //     "refClient": "",
    //     //     "refSeller": "",
    //     //     "refBuyer": "",
    //     //     "incotermDestination": "",
    //     //     // "executedInDate": orderData.executedInDate,
    //     //     "fiscalYear": Number(new Date().getFullYear()),
    //     //     // "fiscalYear": orderData.fiscalYear,
    //     //     // "isVal1": orderData.isVal1,
    //     //     // "isVal2": orderData.isVal2,
    //     //     // "isVal3": orderData.isVal3,
    //     //     // "isVal4": orderData.isVal4,
    //     //     // "isVal5": orderData.isVal5,
    //     //     // "refShippingAgent": bookingRef,
    //     //     // "flag": orderData.flag,
    //     //     // "docFlag": orderData.docFlag,
    //     //     // "city": incotermFromCity.id,
    //     //     // "freightCharges": orderData.freightCharges,
    //     //     // "freightPayableAt": orderData.freightPayableAt,
    //     //     // "freightMoveType": orderData.freightMoveType,
    //     //     "freightShipmentType": option.selectedSeafreights[0].defaultContainer,
    //     //     // "freightShipmentType": orderData.freightShipmentType,
    //     //     // "numberOfBlOriginal": orderData.numberOfBlOriginal,
    //     //     // "numberOfBlCopy": orderData.numberOfBlCopy,
    //     //     // "shipperAddress": orderData.shipperAddress,
    //     //     // "consigneeAddress": orderData.consigneeAddress,
    //     //     // "notifyParty": orderData.notifyParty,
    //     //     // "notifyPartyRef": orderData.notifyPartyRef,
    //     //     // "voyageNumber": orderData.voyageNumber,
    //     //     // "lcl": orderData.lcl,
    //     //     // "exportation": orderData.exportation,
    //     //     // "cityIncotermTo": incotermToCity.id,
    //     //     // "invoiceUserId": orderData.invoiceUserId,
    //     //     // "documentationUserId": orderData.documentationUserId,
    //     //     // "operationsUserId": orderData.operationsUserId,
    //     //     // "oblOverview": orderData.oblOverview
    //     // };

    //     // var dataSent = {
    //     //     "orderDate": new Date().toISOString(),
    //     //     "sellerId": seller.contactId,
    //     //     "buyerId": buyer.contactId,
    //     //     "customerId": customer.contactId,
    //     //     "shippingAgent": carrierAgent.contactId,
    //     //     "shipId": ship !== null ? ship.shipId : null,
    //     //     "shipLineId": carrier.contactId,
    //     //     "orderStatus": 1,
    //     //     "departurePort": portLoading.portId,
    //     //     "destinationPort": portDischarge.portId,
    //     //     "estimatedDepartureDate": etd?.toISOString(),
    //     //     "estimatedArrivalDate": eta?.toISOString(),
    //     //     "incoTerm": incotermFrom,
    //     //     "refClient": referenceCustomer,
    //     //     "refSeller": referenceSeller,
    //     //     "refBuyer": referenceBuyer,
    //     //     "incotermDestination": incotermTo,
    //     //     "fiscalYear": Number(new Date().getFullYear()),
    //     //     "refShippingAgent": bookingRef,
    //     //     "city": incotermFromCity.id,
    //     //     "cityIncotermTo": incotermToCity.id,
    //     // };

    //     const body: any = {
    //         "orderNumber": "",
    //         "orderDate": new Date().toISOString(),
    //         "sellerId": 0,
    //         "buyerId": 0,
    //         "customerId": 0,
    //         "shippingAgent": 0,
    //         "shipId": null,
    //         "shipLineId": 0,
    //         "orderStatus": 1,
    //         "departurePort": option.portDeparture.portId,
    //         "destinationPort": option.portDestination.portId,
    //         // "estimatedDepartureDate": etd?.toISOString(),
    //         // "estimatedArrivalDate": eta?.toISOString(),
    //         // "incoTerm": incotermFrom,
    //         "refClient": offerData.clientNumber,
    //         "refSeller": offerData.clientNumber,
    //         "refBuyer": offerData.clientNumber,
    //         // "incotermDestination": incotermTo,
    //         "fiscalYear": Number(new Date().getFullYear()),
    //         "refShippingAgent": option.selectedSeafreights[0].carrierAgentName,
    //         // "city": incotermFromCity.id,
    //         // "cityIncotermTo": incotermToCity.id
    //         "freightShipmentType": option.selectedSeafreights[0].defaultContainer,
            
    //         // orderNumber: "",
    //         // orderDate: new Date().toISOString(),
    //         // refClient: offerData.clientNumber,
    //         // refShippingAgent: option.selectedSeafreights[0].carrierAgentName,
    //         // freightShipmentType: option.selectedSeafreights[0].defaultContainer,
    //         // customerId: 0,
    //         // shippingAgent: 0,
    //         // orderStatus: 1,
    //         // departurePort: option.portDeparture.portId,
    //         // destinationPort: option.portDestination.portId,
    //         // fiscalYear: Number(new Date().getFullYear())
    //     };

    //     fetch(protectedResources.apiLisShipments.endPoint+"/Orders", {
    //         method: "POST",
    //         // mode: "cors",
    //         headers: {
	// 			'accept': '*/*',
    //         	'Content-Type': 'application/json'
	// 		},
	// 		body: JSON.stringify(body),
    //     }).then((response: any) => {
    //         if (response.ok) {
    //             return response.json();
    //         }
    //         else {
    //             throw new Error('Network response was not ok.');
    //         }
    //     }).then((data: any) => {
    //         console.log("All : ", data);
            
    //         var lang = offerData.comment.startsWith("<p>Bonjour") ? "fr" : "en";
    //         var infos = getOfferContent(offerData.comment, Number(currentOpt)+1, lang);
    //         console.log("Infos : ", infos);
    //         var nOption = currentOpt !== null ? currentOpt : 0;
    //         var messageText = `
    //         <div style="font-family: Verdana;">
    //             <p>${t('hello', {lng: lang})} CYRILLE PENAYE,</p>
    //             <p>${t('confirmationOfferThanks', {lng: lang})}</p>
    //             <p>${t('confirmationOfferText', {lng: lang})}</p>
    //             <p>${t('loadingCity', {lng: lang})} : ${offerData.options[nOption].selectedHaulage.loadingCityName}</p>
    //             <p>${t('destinationPort', {lng: lang})} : ${offerData.options[nOption].selectedSeafreights[0].destinationPortName}</p>
    //             <p>${infos}</p>
    //             <br>
    //             <p>${t('trackingOptions', {lng: lang})} : ${data.orderNumber}</p>
    //             <br>
    //             <p>${t('endMailWord', {lng: lang})}</p>
    //         </div>
    //         <div style="font-family: Verdana; padding-top: 30px; padding-bottom: 20px;">
    //             <div style="margin-top: 15px;"><a target="_blank" href="www.omnifreight.eu">www.omnifreight.eu</a></div>
    //             <div style="padding-bottom: 10px;"><a target="_blank" href="http://www.facebook.com/omnifreight">http://www.facebook.com/omnifreight</a></div>
    //             <div>Italiëlei 211</div>
    //             <div>2000 Antwerpen</div>
    //             <div>Belgium</div>
    //             <div>E-mail: transport@omnifreight.eu</div>
    //             <div>Tel +32.3.295.38.82</div>
    //             <div>Fax +32.3.295.38.77</div>
    //             <div>Whatsapp +32.494.40.24.25</div>
    //             <img src="https://omnifreight.eu/wp-content/uploads/2023/06/logo.jpg" style="max-width: 200px;">
    //         </div>
    //         `;
            
    //         sendEmail("pricing@omnifreight.eu", offerData.emailUser, t('confirmationOffer', {lng: lang}), messageText);
    //     }).catch(error => { 
    //         setLoad(false);
    //         console.log(error);
    //     });
    // }
    
    // async function sendEmail(from: string, to: string, subject: string, htmlContent: string) {
	// 	const formData = new FormData();
	// 	// Append the other email data to the FormData object
	// 	formData.append('From', from);
	// 	formData.append('To', to);
	// 	formData.append('Subject', subject);
	// 	formData.append('HtmlContent', htmlContent);
		
	// 	// Send the email with fetch
	// 	// fetch(protectedResources.apiLisQuotes.endPoint+'/Email', {
	// 	// 	method: 'POST',
	// 	// 	headers: {
	// 	// 		'accept': '*/*',
	// 	// 		// 'Content-Type': 'multipart/form-data'
	// 	// 	},
	// 	// 	body: formData
	// 	// })
	// 	// .then((response) => response.json())
	// 	// .then((data) => console.log(data))
	// 	// .catch((error) => console.error(error));
	// }

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
