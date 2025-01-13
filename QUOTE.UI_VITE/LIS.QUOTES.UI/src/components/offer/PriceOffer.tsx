import { Alert, Box, Button, DialogActions, DialogContent, InputLabel, NativeSelect, Skeleton } from '@mui/material';
import Grid from '@mui/material/Grid2';
import { useTranslation } from 'react-i18next';
import { base64ToUint8Array, statusLabel } from '../../utils/functions';
import { BootstrapInput, buttonCloseStyles, inputLabelStyles } from '../../utils/misc/styles';
import { useMsal, useAccount } from '@azure/msal-react';
import { SnackbarProvider, enqueueSnackbar } from 'notistack';
import { useState } from 'react';
import { getQuoteOffer, putApiQuoteOfferByIdStatus } from '../../api/client/offer';
import { postApiEmail } from '../../api/client/quote';
import { getApiFileByFolderByFileName } from '../../api/client/document';

const PriceOffer = (props: any) => {
    const [subject, setSubject] = useState<string>("Nouveau devis pour client");
	const [language, setLanguage] = useState<string>("fr");
	const [load, setLoad] = useState<boolean>(false);
	
    const { t } = useTranslation();
    const { accounts } = useMsal();
	const account = useAccount(accounts[0] || {});
	
	console.log(props);
	var optionsButtons = props.offer.options.map((_: any, index: number) => {
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
	
	// const downloadFile = async (id: string, name: string, type: string) => {
    //     console.log("Id : ", id);
	// 	try {
    //         const response: any = await getApiFileByFolderByFileName({path: {folder: "Standard", fileName: name.replace("Standard", "")}});
    //         console.log(response);
	// 		var file = new File([response.data], name, { type });
	// 		return file;
    //     } 
    //     catch (error) {
    //         console.log(error);
	// 		return null;
    //     }
    // };

	const downloadFile = async (id: string, name: string, type: string) => {
		try {
			const response: any = await getApiFileByFolderByFileName({path: {folder: "Standard", fileName: name.replace("Standard", "")}});
			console.log("id", id);
			const decodedData = base64ToUint8Array(response.data.fileBase64.replace(/^data:[^;]+;base64,/, ""));
			const file = new File([decodedData], name, {type: type});
			return file;
		} 
		catch (error: any) {
			console.log(error);
			return null;
		}
	};
    
	async function sendEmailWithAttachments(from: string, to: string, subject: string, htmlContent: string, attachments: any) {
		var myFiles: any = [];
		// const formData = new FormData();
		console.log("Attachments : ", attachments);
		// Append the attachments to the FormData object
		for (const { fileName, contentType } of attachments) {
			try {
				var filePromise = await downloadFile(fileName, fileName, contentType);
				myFiles = [...myFiles, filePromise !== null ? filePromise : ""];
			}
			catch (err: any) {
				console.log(err);
			}
		}
	  
		console.log("Files : ", myFiles);
		// Send the email with fetch
		postApiEmail({body: {
			From: from,
			To: to,
			Subject: subject,
			HtmlContent: htmlContent,
			Attachments: myFiles
		}});
	}

	const loadOffer = async () => {
		try {
			const response: any = await getQuoteOffer({path: {id: props.id}});
			if (response !== null && response !== undefined) {
				console.log(response.data);
				// var objTotal = JSON.parse(response.data.createdBy);
				props.setOffer(response.data.data);
				setLoad(false);
			}
			else {
				setLoad(false);
			}
		}
		catch (err: any) {
			console.log(err);
			setLoad(false);
		}
	}

	const acceptOffer = async () => {
		try {
			const body: any = {
				id: props.id,
				newStatus: "Accepted",
			};

			const response = await putApiQuoteOfferByIdStatus({body: body, path: {id: props.id}, query: {newStatus: "Accepted"}});
			if (response !== null && response !== undefined) {
				enqueueSnackbar(t('priceOfferApproved'), { variant: "success", anchorOrigin: { horizontal: "right", vertical: "top" } });
				var optionsButtons = props.options.map((_: any, index: number) => {
					return `<a href="${import.meta.env.VITE_ORIGIN_URL+"/acceptOffer/"+props.id}?option=${index}" style="display:inline-block;background-color:#008089;color:#fff;padding:10px 20px;text-decoration:none" target="_blank">${t('selectOptionOffer', {lng: language})} #${Number(index+1)}</a>`;
				});
				var footer = `
				<div>${account?.name}</div>
                <div style="font-family: Verdana; padding-top: 30px; padding-bottom: 20px;">
					${optionsButtons}
					<a href="${import.meta.env.VITE_ORIGIN_URL+"/refuseOffer/"+props.id}" style="display:inline-block;background-color:#F2F2F2;color:#008089;padding:10px 20px;text-decoration:none" target="_blank">${t('refuseOffers', {lng: language})}</a>
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
		catch (err: any) {
			console.log(err);
			setLoad(false);
		}
	}

	const rejectOffer = async () => {
		try {
			const body: any = {
				id: props.id,
				newStatus: "Rejected",
			};

			const response: any = await putApiQuoteOfferByIdStatus({body: body, path: {id: props.id}, query: {newStatus: "Rejected"}});
			if (response !== null && response !== undefined) {
				enqueueSnackbar(t('priceOfferRejected'), { variant: "success", anchorOrigin: { horizontal: "right", vertical: "top" } });
				setLoad(true);
                loadOffer();
			}
			else {
				enqueueSnackbar(t('errorHappened'), { variant: "error", anchorOrigin: { horizontal: "right", vertical: "top" } });
			}
		}
		catch (err: any) {
			console.log(err);
			setLoad(false);
		}
	}

	const OfferContent = () => {
		return <>
			{
				!load && props.offer !== null ?
				<Grid container spacing={2} mt={1} px={5}>
					<Grid size={{ xs: 12 }}>
						<Alert severity='info'>
							{t('yourAttachments')} : {props.files.length !== 0 ? props.files.map((elm: any) => { return elm.blobName !== undefined ? elm.blobName : elm.fileName }).join(", ") : t('noAttachments')}
						</Alert>
					</Grid>
					<Grid size={{ xs: 12, md: 8 }}>
						<InputLabel htmlFor="subject" sx={inputLabelStyles}>{t('subject')}</InputLabel>
						<BootstrapInput 
							id="subject" 
							type="text" name="subject" 
							value={subject}
							onChange={(e: any) => { setSubject(e.target.value); }}
							fullWidth 
						/>
					</Grid>
					<Grid size={{ xs: 12, md: 4 }}>
						<InputLabel htmlFor="sysLanguage" sx={inputLabelStyles}>{t('systemLanguage')}</InputLabel>
						<NativeSelect
							id="sysLanguage"
							value={language}
							onChange={(e: any) => { setLanguage(e.target.value); }}
							size="small"
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
					<Grid size={{ xs: 12 }}>
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
					<Grid size={{ xs: 12, md: 6 }}>
						<Alert severity="info">
							{t('statusIs')} : <div>- <strong>{statusLabel(props.offer.status)}</strong> {t('byOmnifreight')}</div>
							{props.offer.status === "Accepted" ? <div>- <strong>{props.offer.clientApproval}</strong> {t('byClient')}</div> : null}
						</Alert>
					</Grid>
					<Grid size={{ xs: 12, md: 6 }} sx={{ pt: 1.5, display: props.type === "modal" ? "none" : "flex", alignItems: "center", justifyContent: "end" }}>
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
