import { useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useAccount, useMsal } from '@azure/msal-react';
import { Typography, Box, Grid, InputLabel, Button, Alert } from '@mui/material';
import Skeleton from '@mui/material/Skeleton';
import { SnackbarProvider, enqueueSnackbar } from 'notistack';
import { useAuthorizedBackendApi } from '../api/api';
import { protectedResources } from '../config/authConfig';
import { BackendService } from '../utils/services/fetch';
import { BootstrapInput, inputLabelStyles } from '../utils/misc/styles';
import { useTranslation } from 'react-i18next';
import StarterKit from "@tiptap/starter-kit";
import {
	type RichTextEditorRef,
	RichTextReadOnly,
} from "mui-tiptap";
import { getExtensionFromContentType, statusLabel } from '../utils/functions';
import { containerPackages } from '../utils/constants';
import axios from 'axios';

function ManagePriceOffer(props: any) {
	const { t } = useTranslation();

	const [load, setLoad] = useState<boolean>(true);
	const [offer, setOffer] = useState<any>(null);
	const [subject, setSubject] = useState<string>("Nouveau devis pour client");
	const [offerNumber, setOfferNumber] = useState<string>("");
	const [content, setContent] = useState<string>("");
	const [options, setOptions] = useState<any>(null);
	
	const [margin, setMargin] = useState<number>(22);
	const [reduction, setReduction] = useState<number>(0);
	const [adding, setAdding] = useState<number>(0);
	const [language, setLanguage] = useState<string>("fr");
	const [files, setFiles] = useState<any>(null);
	const [details, setDetails] = useState<string>("");
	const [containers, setContainers] = useState<any>(null);
	const [containersId, setContainersId] = useState<any>([]);

	let { id } = useParams();
	const { instance, accounts } = useMsal();
	const account = useAccount(accounts[0] || {});
	const context = useAuthorizedBackendApi();

	const rteRef = useRef<RichTextEditorRef>(null);
	const [fileValue, setFileValue] = useState<File[] | undefined>(undefined);
    
	useEffect(() => {
		getContainers();
	}, [account, instance, account]);

	const loadOffer = async () => {
		if (account && instance && context) {
			const response = await (context?.service as BackendService<any>).getSingle(protectedResources.apiLisOffer.endPoint+"/QuoteOffer/"+id);
			if (response !== null && response.code !== undefined) {
				if (response.code === 200) {
					console.log(response.data);
					var objTotal = JSON.parse(response.data.createdBy);
					setFiles(objTotal.files);
					setOptions(objTotal.options);
					setOffer(response.data);
					setMargin(response.data.margin);
					setReduction(response.data.reduction);
					setAdding(response.data.extraFee);
					setDetails(response.data.comment);
					setContainersId(response.data.containers.map((elm: any) => { return elm.containerId }))
					setOfferNumber(response.data.quoteOfferNumber);
					setContent(response.data.comment);
					setLoad(false);
				}
				else {
					setLoad(false);
				}
			}
		}
	}

	const getContainers = async () => {
		if (account && instance && context) {
			setContainers(containerPackages);
			// Now I can call the quote offer
			loadOffer();
		}
	}

	const downloadFile = async (id: string, name: string, type: string) => {
        try {
            const response = await axios({
                url: protectedResources.apiLisFiles.endPoint+"/Files/"+id+"?download=true", 
                method: 'GET',
                responseType: 'blob', // important for file download
                headers: {
                    'Content-Type': 'multipart/form-data', 
                },
            });
			

			console.log(response);
			var extension = getExtensionFromContentType(type);
            var file = new File([response.data], name+"."+extension, { type });
			return file;
            // var extension = getExtensionFromContentType(type);
            // const url = window.URL.createObjectURL(new Blob([response.data]));
            // const link = document.createElement('a');
            // link.href = url;
            // link.setAttribute('download', name+"."+extension); // replace with your file name and extension
            // document.body.appendChild(link);
            // link.click();
            // link.parentNode?.removeChild(link);
        } 
        catch (error) {
            console.log(error);
			return null;
        }
    };
    
	async function sendEmailWithAttachments(from: string, to: string, subject: string, htmlContent: string, attachments: any) {
		const formData = new FormData();
		// Append the attachments to the FormData object
		for (const { fileName, url, id, contentType } of attachments) {
			try {
				var filePromise = await downloadFile(id, fileName, contentType);
				formData.append('Attachments', filePromise !== null ? filePromise : "");
			}
			catch (err: any) {
				console.log(err);
			}
		}
	  
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

	const postEmail = async (from: string, to: string, subject: string, htmlContent: string) => {
		const form = new FormData();
		form.append('From', from);
		form.append('To', to);
		form.append('Subject', subject);
		form.append('HtmlContent', htmlContent);
		console.log(files);
		if (files !== undefined) {
			for (var i = 0; i < files.length; i++) {
				form.append('Attachments', files[i]);
			}
		}

		console.log(form);
		fetch(protectedResources.apiLisQuotes.endPoint+'/Email', {
			method: 'POST',
			headers: {
				'accept': '*/*',
				// 'Content-Type': 'multipart/form-data'
			},
			body: form
		})
		.then((response) => response.json())
		.then((response: any) => {
			if (response !== undefined && response !== null && response.code == 200) {
				enqueueSnackbar(t('messageSuccessSent'), { variant: "success", anchorOrigin: { horizontal: "right", vertical: "top" } });
			}
			else {
				enqueueSnackbar(t('errorHappened'), { variant: "error", anchorOrigin: { horizontal: "right", vertical: "top" } });
			}
		});
	}

	const acceptOffer = async () => {
		if (account && instance && context) {
			const body: any = {
				id: id,
				newStatus: "Accepted",
			};

			const data = await (context?.service as BackendService<any>).put(protectedResources.apiLisOffer.endPoint+"/QuoteOffer/"+id+"/status?newStatus=Accepted", body);
			if (data?.status === 200) {
				enqueueSnackbar(t('priceOfferApproved'), { variant: "success", anchorOrigin: { horizontal: "right", vertical: "top" } });
				var optionsButtons = options.map((elm: any, index: number) => {
					return `<a href="${process.env.REACT_APP_ORIGIN_URL+"/acceptOffer/"+id}?option=${index}" style="display:inline-block;background-color:#008089;color:#fff;padding:10px 20px;text-decoration:none" target="_blank">Choisir l'offre #${Number(index+1)}</a>`;
				});
				var footer = `
				<div>${account?.name}</div>
                <div style="font-family: Verdana; padding-top: 30px; padding-bottom: 20px;">
					${optionsButtons}
					<a href="${process.env.REACT_APP_ORIGIN_URL+"/refuseOffer/"+id}" style="display:inline-block;background-color:#F2F2F2;color:#008089;padding:10px 20px;text-decoration:none" target="_blank">Refuser les offres</a>
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
				sendEmailWithAttachments("pricing@omnifreight.eu", offer.emailUser, subject, content+footer, files);
				loadOffer();
			}
			else {
				enqueueSnackbar(t('errorHappened'), { variant: "error", anchorOrigin: { horizontal: "right", vertical: "top" } });
			}
		}
	}

	const rejectOffer = async () => {
		if (account && instance && context) {
			const body: any = {
				id: id,
				newStatus: "Rejected",
			};

			const data = await (context?.service as BackendService<any>).put(protectedResources.apiLisOffer.endPoint+"/QuoteOffer/"+id+"/status?newStatus=Rejected", body);
			if (data?.status === 200) {
				enqueueSnackbar(t('priceOfferRejected'), { variant: "success", anchorOrigin: { horizontal: "right", vertical: "top" } });
				loadOffer();
			}
			else {
				enqueueSnackbar(t('errorHappened'), { variant: "error", anchorOrigin: { horizontal: "right", vertical: "top" } });
			}
		}
	}

	return (
		<div style={{ background: "#fff", borderTopLeftRadius: 20, borderTopRightRadius: 20 }}>
			<SnackbarProvider />
			<Box py={2.5}>
				<Typography variant="h5" sx={{ mt: { xs: 4, md: 1.5, lg: 1.5 } }} mx={5}><b>{t('manageOffer')} N° {offerNumber}</b></Typography>
				<Box>
				{
					!load ?
					<Grid container spacing={2} mt={1} px={5}>
						<Grid item xs={12}>
							<Alert severity='info'>{t('yourAttachments')} : {files.length !== 0 ? files.map((elm: any) => { return elm.fileName }).join(", ") : t('noAttachments')}</Alert>
						</Grid>
						<Grid item xs={12} md={12}>
                            <InputLabel htmlFor="subject" sx={inputLabelStyles}>{t('subject')}</InputLabel>
                            <BootstrapInput 
                                id="subject" 
                                type="text" name="subject" 
                                value={subject}
                                onChange={(e: any) => { setSubject(e.target.value); }}
                                fullWidth 
                            />
                        </Grid>
						<Grid item xs={12}>
							<InputLabel htmlFor="details" sx={inputLabelStyles}>{t('messageSentCustomer')}</InputLabel>
							<Box sx={{ mt: 2 }}>
								<RichTextReadOnly
									// ref={rteRef}
									extensions={[StarterKit]}
									content={offer.comment}
								/>
							</Box>
						</Grid>
						{/* <Grid item xs={12}>
						<Typography variant="h6">
							{ 
								offer.seaFreight !== null ? 
								<Chip variant="outlined" size="medium"
									label={"TOTAL PRICE : "+ Number(offer.totalPrice+offer.totalPrice*margin/100-offer.totalPrice*reduction/100+adding*1).toString()+" "+offer.seaFreight.currency}
									sx={{ fontWeight: "bold", fontSize: 16, py: 3 }} 
								/> : null
							}
						</Typography>
						</Grid> */}
						<Grid item xs={12} md={6}>
							<Alert severity="info">
								{t('statusIs')} : <div>- <strong>{statusLabel(offer.status)}</strong> {t('byOmnifreight')}</div>
								{offer.status === "Accepted" ? <div>- <strong>{offer.clientApproval}</strong> {t('byClient')}</div> : null}
							</Alert>
						</Grid>
						<Grid item xs={12} md={6} sx={{ pt: 1.5, display: "flex", alignItems: "center", justifyContent: "end" }}>
							{/* <Button 
								variant="contained" 
								color="primary" 
								sx={{ mr: 1, textTransform: "none" }} 
								onClick={updateOffer}
								disabled={offer.status !== "Pending"}
							>{t('updateOffer')}</Button> */}
							<Button 
								variant="contained" 
								color="success" 
								sx={{ mr: 1, textTransform: "none" }} 
								onClick={acceptOffer}
								// disabled={offer.status !== "Pending"}
							>{t('approveOffer')}</Button>
							<Button
							 	variant="contained" 
								color="secondary" 
								sx={{ mr: 1, textTransform: "none" }} 
								onClick={rejectOffer}
								disabled={offer.status !== "Pending"}
							>{t('rejectOffer')}</Button>
						</Grid>
					</Grid> : <Skeleton sx={{ mx: 5, mt: 3 }} />
				}
				</Box>
			</Box>
		</div>
	);
}

export default ManagePriceOffer;
