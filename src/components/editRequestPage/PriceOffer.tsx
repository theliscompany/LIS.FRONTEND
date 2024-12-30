import { Alert, Box, Button, DialogActions, DialogContent, Grid, InputLabel, NativeSelect, Skeleton } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { getExtensionFromContentType, statusLabel } from '../../utils/functions';
import { BootstrapInput, buttonCloseStyles, inputLabelStyles } from '../../utils/misc/styles';
import { useMsal, useAccount } from '@azure/msal-react';
import { SnackbarProvider, enqueueSnackbar } from 'notistack';
import { useAuthorizedBackendApi } from '../../api/api';
import { protectedResources } from '../../config/authConfig';
import { BackendService } from '../../utils/services/fetch';
import axios from 'axios';
import { useState } from 'react';

function PriceOffer(props: any) {
    const [subject, setSubject] = useState<string>("Nouveau devis pour client");
	const [language, setLanguage] = useState<string>("fr");
	const [load, setLoad] = useState<boolean>(false);
	
    const { t } = useTranslation();
    const { instance, accounts } = useMsal();
	const account = useAccount(accounts[0] || {});
	const context = useAuthorizedBackendApi();

	console.log(props);
	var optionsButtons = props.offer.options.map((elm: any, index: number) => {
		return `<a href="#" onclick="return false;" style="display:inline-block;background-color:#008089;color:#fff;padding:10px 20px;text-decoration:none">${t('selectOptionOffer', {lng: language})} #${Number(index+1)}</a>`;
	});
	var myFooter = `
	<div>${account?.name}</div>
	<div style="font-family: Verdana; padding-top: 30px; padding-bottom: 20px;">
		${optionsButtons}
		<a href="#" onclick="return false;" style="display:inline-block;background-color:#F2F2F2;color:#008089;padding:10px 20px;text-decoration:none">${t('refuseOffers', {lng: language})}</a>
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
	</div>
	`;
	
	const downloadFile = async (id: string, name: string, type: string) => {
        console.log("Id : ", id);
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
            var file = new File([response.data], name, { type });
			return file;
        } 
        catch (error) {
            console.log(error);
			return null;
        }
    };
    
	async function sendEmailWithAttachments(from: string, to: string, subject: string, htmlContent: string, attachments: any) {
		var arrayIds: string[] = [];
		const formData = new FormData();
		console.log("Attachments : ", attachments);
		// Append the attachments to the FormData object
		for (const { fileName, url, id, fileId, contentType } of attachments) {
			var auxId = id !== undefined ? id : fileId;
			try {
				var filePromise = await downloadFile(auxId, `${auxId}=${fileName}`, contentType);
				formData.append('Attachments', filePromise !== null ? filePromise : "");
				// formData.append('Identifiers', [...arrayIds, auxId].join(","));
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
		
		console.log("Formdata : ", Array.from(formData));
		// Send the email with fetch
		fetch(protectedResources.apiLisQuotes.endPoint+'/Email', {
			method: 'POST',
			headers: {
				'accept': '*/*',
				// 'Content-Type': 'multipart/form-data'
			},
			body: formData
		})
		// .then((response) => response.json())
		.then((data) => console.log(data))
		.catch((error) => console.error(error));
	}

	const loadOffer = async () => {
		if (account && instance && context) {
			const response = await (context?.service as BackendService<any>).getSingle(protectedResources.apiLisOffer.endPoint+"/QuoteOffer/"+props.id);
			if (response !== null && response.code !== undefined) {
				if (response.code === 200) {
					console.log(response.data);
					// var objTotal = JSON.parse(response.data.createdBy);
					props.setOffer(response.data);
					setLoad(false);
				}
				else {
					setLoad(false);
				}
			}
		}
	}

	const acceptOffer = async () => {
		if (account && instance && context) {
			const body: any = {
				id: props.id,
				newStatus: "Accepted",
			};

			const data = await (context?.service as BackendService<any>).put(protectedResources.apiLisOffer.endPoint+"/QuoteOffer/"+props.id+"/status?newStatus=Accepted", body);
			if (data?.status === 200) {
				enqueueSnackbar(t('priceOfferApproved'), { variant: "success", anchorOrigin: { horizontal: "right", vertical: "top" } });
				var optionsButtons = props.options.map((elm: any, index: number) => {
					return `<a href="${process.env.REACT_APP_ORIGIN_URL+"/acceptOffer/"+props.id}?option=${index}" style="display:inline-block;background-color:#008089;color:#fff;padding:10px 20px;text-decoration:none" target="_blank">${t('selectOptionOffer', {lng: language})} #${Number(index+1)}</a>`;
				});
				var footer = `
				<div>${account?.name}</div>
                <div style="font-family: Verdana; padding-top: 30px; padding-bottom: 20px;">
					${optionsButtons}
					<a href="${process.env.REACT_APP_ORIGIN_URL+"/refuseOffer/"+props.id}" style="display:inline-block;background-color:#F2F2F2;color:#008089;padding:10px 20px;text-decoration:none" target="_blank">${t('refuseOffers', {lng: language})}</a>
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
				</div>
				`;
				sendEmailWithAttachments("pricing@omnifreight.eu", props.offer.emailUser, subject, props.offer.comment+footer, props.files);
				setLoad(true);
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
				id: props.id,
				newStatus: "Rejected",
			};

			const data = await (context?.service as BackendService<any>).put(protectedResources.apiLisOffer.endPoint+"/QuoteOffer/"+props.id+"/status?newStatus=Rejected", body);
			if (data?.status === 200) {
				enqueueSnackbar(t('priceOfferRejected'), { variant: "success", anchorOrigin: { horizontal: "right", vertical: "top" } });
				setLoad(true);
                loadOffer();
			}
			else {
				enqueueSnackbar(t('errorHappened'), { variant: "error", anchorOrigin: { horizontal: "right", vertical: "top" } });
			}
		}
	}

	const OfferContent = () => {
		return <>
			{
				!load && props.offer !== null ?
				<Grid container spacing={2} mt={1} px={5}>
					<Grid item xs={12}>
						<Alert severity='info'>{t('yourAttachments')} : {props.files.length !== 0 ? props.files.map((elm: any) => { return elm.fileName }).join(", ") : t('noAttachments')}</Alert>
					</Grid>
					<Grid item xs={12} md={8}>
						<InputLabel htmlFor="subject" sx={inputLabelStyles}>{t('subject')}</InputLabel>
						<BootstrapInput 
							id="subject" 
							type="text" name="subject" 
							value={subject}
							onChange={(e: any) => { setSubject(e.target.value); }}
							fullWidth 
						/>
					</Grid>
					<Grid item xs={12} md={4}>
						<InputLabel htmlFor="sysLanguage" sx={inputLabelStyles}>{t('systemLanguage')}</InputLabel>
						<NativeSelect
							id="sysLanguage"
							value={language}
							onChange={(e: any) => { setLanguage(e.target.value); }}
							input={<BootstrapInput />}
							fullWidth
						>
							{
								["fr", "en"].map((row: any, i: number) => (
									<option key={"sysLang-"+i} value={row}>{t('langtext'+row)}</option>
								))
							}
						</NativeSelect>
					</Grid>
					<Grid item xs={12}>
						<InputLabel htmlFor="details" sx={inputLabelStyles}>{t('messageSentCustomer')}</InputLabel>
						<Box sx={{ mt: 2, p: 2, border: "1px solid #ced4da" }}>
							<div dangerouslySetInnerHTML={{__html: props.offer.comment+myFooter}} />
							{/* <RichTextReadOnly
								// ref={rteRef}
								extensions={[StarterKit]}
								content={props.offer.comment+myFooter}
							/> */}
						</Box>
					</Grid>
					<Grid item xs={12} md={6}>
						<Alert severity="info">
							{t('statusIs')} : <div>- <strong>{statusLabel(props.offer.status)}</strong> {t('byOmnifreight')}</div>
							{props.offer.status === "Accepted" ? <div>- <strong>{props.offer.clientApproval}</strong> {t('byClient')}</div> : null}
						</Alert>
					</Grid>
					<Grid item xs={12} md={6} sx={{ pt: 1.5, display: props.type === "modal" ? "none" : "flex", alignItems: "center", justifyContent: "end" }}>
						{/* <Button 
							variant="contained" 
							color="primary" 
							sx={{ mr: 1, textTransform: "none" }} 
							onClick={updateOffer}
							disabled={props.offer.status !== "Pending"}
						>{t('updateOffer')}</Button> */}
						<Button 
							variant="contained" 
							color="success" 
							sx={{ mr: 1, textTransform: "none" }} 
							onClick={acceptOffer}
							// disabled={props.offer.status !== "Pending"}
						>
							{ props.offer.status !== "Pending" ? t('resendOffer') : t('approveOffer') }
						</Button>
						<Button
							variant="contained" 
							color="secondary" 
							sx={{ mr: 1, textTransform: "none" }} 
							onClick={rejectOffer}
							disabled={props.offer.status !== "Pending"}
						>{t('rejectOffer')}</Button>
					</Grid>
				</Grid> : <Skeleton sx={{ mx: 5, mt: 3 }} />
			}
		</>;
	}
	
    return (
        <>
			<SnackbarProvider />
			{
				props.type === "modal" ? 
				<>
					<DialogContent dividers>
						<OfferContent />		
					</DialogContent>
					<DialogActions>
						<Button 
							variant="contained" 
							color="success" 
							sx={{ mr: 1, textTransform: "none" }} 
							onClick={acceptOffer}
						>
							{ props.offer.status !== "Pending" ? t('resendOffer') : t('approveOffer') }
						</Button>
						<Button
							variant="contained" 
							color="secondary" 
							sx={{ mr: 1, textTransform: "none" }} 
							onClick={rejectOffer}
							disabled={props.offer.status !== "Pending"}
						>{t('rejectOffer')}</Button>
						<Button variant="contained" onClick={() => props.closeModal()} sx={buttonCloseStyles}>{t('close')}</Button>
					</DialogActions>
				</> : <OfferContent />
			}
		</>
    );
}

export default PriceOffer;
