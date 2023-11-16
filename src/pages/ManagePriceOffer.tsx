import { useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import { AuthenticationResult } from '@azure/msal-browser';
import { useAccount, useMsal } from '@azure/msal-react';
import { Typography, Box, Grid, Chip, InputLabel, Button, Alert, List, ListItem, ListItemText } from '@mui/material';
import Skeleton from '@mui/material/Skeleton';
import { SnackbarProvider, enqueueSnackbar } from 'notistack';
import { useAuthorizedBackendApi } from '../api/api';
import { protectedResources, transportRequest } from '../config/authConfig';
import { BackendService } from '../utils/services/fetch';
import { BootstrapInput, gridStyles, inputLabelStyles } from '../utils/misc/styles';
import { DataGrid, GridRenderCellParams, GridValueFormatterParams, GridValueGetterParams } from '@mui/x-data-grid';
import { useTranslation } from 'react-i18next';
import StarterKit from "@tiptap/starter-kit";
import {
	MenuButtonBold,
	MenuButtonItalic,
	MenuControlsContainer,
	MenuDivider,
	MenuSelectHeading,
	MenuButtonStrikethrough,
	MenuButtonHorizontalRule,
	MenuSelectTextAlign,
	MenuButtonOrderedList,
	MenuButtonBulletedList,
	MenuButtonEditLink,
	MenuButtonUnderline,
	MenuButtonUndo,
	MenuButtonRedo,
	RichTextEditor,
	type RichTextEditorRef,
} from "mui-tiptap";
import { MuiFileInput } from 'mui-file-input';

function statusLabel(value: string) {
	if (value === "Accepted")
		return "Approved";
	else
		return value;
}

function ManagePriceOffer(props: any) {
	const [load, setLoad] = useState<boolean>(true);
	const [offer, setOffer] = useState<any>(null);

	const [margin, setMargin] = useState<number>(22);
	const [reduction, setReduction] = useState<number>(0);
	const [adding, setAdding] = useState<number>(0);
	const [details, setDetails] = useState<string>("");
	const [clientName, setClientName] = useState<string>("");
	const [containers, setContainers] = useState<any>(null);
	const [containersId, setContainersId] = useState<any>([]);

	let { id } = useParams();
	const { instance, accounts } = useMsal();
	const account = useAccount(accounts[0] || {});
	const context = useAuthorizedBackendApi();

	const rteRef = useRef<RichTextEditorRef>(null);
	const [fileValue, setFileValue] = useState<File[] | undefined>(undefined);
    
	const { t } = useTranslation();

	useEffect(() => {
		getContainers();
	}, [context]);

	const loadOffer = async () => {
		if (context) {
			const response = await (context as BackendService<any>).getSingle(protectedResources.apiLisOffer.endPoint + "/QuoteOffer/" + id);
			if (response !== null && response.code !== undefined) {
				if (response.code === 200) {
					console.log(response.data);
					setOffer(response.data);
					setMargin(response.data.margin);
					setReduction(response.data.reduction);
					setAdding(response.data.extraFee);
					setDetails(response.data.comment);
					setContainersId(response.data.containers.map((elm: any) => { return elm.containerId }))
					setLoad(false);
				}
				else {
					setLoad(false);
				}
			}
		}
	}

	const getContainers = async () => {
		if (context && account) {
			setLoad(true);
			const token = await instance.acquireTokenSilent({
				scopes: transportRequest.scopes,
				account: account
			})
			.then((response: AuthenticationResult) => {
				return response.accessToken;
			})
			.catch(() => {
				return instance.acquireTokenPopup({
					...transportRequest,
					account: account
				})
				.then((response) => {
					return response.accessToken;
				});
			});

			const response = await (context as BackendService<any>).getWithToken(protectedResources.apiLisTransport.endPoint + "/Package/Containers", token);
			console.log("Containers", response);
			if (response !== null && response !== undefined) {
				setContainers(response);

				// Now I can call the quote offer
				loadOffer();
			}
		}
	}

	const updateOffer = async () => {
		if (context) {
			const body: any = {
				"requestQuoteId": offer.requestQuoteId,
				"comment": rteRef.current?.editor?.getHTML(),
				// "quoteOfferNumber": transformId(uuidv4()),
				"quoteOfferVm": 0,
				"quoteOfferId": offer.quoteOfferId,
				"quoteOfferNumber": offer.quoteOfferNumber,
				"createdBy": offer.createdBy,
				"emailUser": offer.emailUser,
				"haulage": offer.haulage,
				"miscellaneousList": offer.miscellaneousList,
				"seaFreight": offer.seaFreight,
				"containers": offer.containers,
				"departureDate": offer.departureDate,
				"departurePortId": offer.departurePortId,
				"destinationPortId": offer.destinationPortId,
				// "haulageType": haulageType,
				// "plannedLoadingDate": "2023-07-14T08:18:24.720Z",
				// "loadingCityId": 0,
				"margin": margin,
				"reduction": reduction,
				"extraFee": adding,
				"totalPrice": offer.totalPrice
			};

			const data = await (context as BackendService<any>).put(protectedResources.apiLisOffer.endPoint + "/QuoteOffer/" + id, body);
			if (data?.status === 200) {
				enqueueSnackbar(t('priceOfferUpdated'), { variant: "success", anchorOrigin: { horizontal: "right", vertical: "top" } });
			}
			else {
				enqueueSnackbar(t('errorHappened'), { variant: "error", anchorOrigin: { horizontal: "right", vertical: "top" } });
			}
		}
	}

	const postEmail = async (from: string, to: string, subject: string, htmlContent: string) => {
		const form = new FormData();
		form.append('From', from);
		form.append('To', to);
		form.append('Subject', subject);
		form.append('HtmlContent', htmlContent);
		if (fileValue !== undefined) {
			for (var i = 0; i < fileValue.length; i++) {
				form.append('Attachments', fileValue[i]);
			}
		}

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
		if (context) {
			const body: any = {
				id: id,
				newStatus: "Accepted",
			};

			const data = await (context as BackendService<any>).put(protectedResources.apiLisOffer.endPoint+"/QuoteOffer/"+id+"/status?newStatus=Accepted", body);
			if (data?.status === 200) {
				enqueueSnackbar(t('priceOfferApproved'), { variant: "success", anchorOrigin: { horizontal: "right", vertical: "top" } });

				var footer = `
				<div style="font-family: Verdana; padding-top: 60px;">
					<a href="${process.env.REACT_APP_ORIGIN_URL+"/acceptOffer/"+id}" style="display:inline-block;background-color:#008089;color:#fff;padding:10px 20px;text-decoration:none" target="_blank">Accept the offer</a>
					<a href="${process.env.REACT_APP_ORIGIN_URL+"/refuseOffer/"+id}" style="display:inline-block;background-color:#F2F2F2;color:#008089;padding:10px 20px;text-decoration:none" target="_blank">Refuse the offer</a>
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
				postEmail("pricing@omnifreight.eu", offer.emailUser, "Nouvelle offre de devis", rteRef.current?.editor?.getHTML() + footer);

				loadOffer();
			}
			else {
				enqueueSnackbar(t('errorHappened'), { variant: "error", anchorOrigin: { horizontal: "right", vertical: "top" } });
			}
		}
	}

	const rejectOffer = async () => {
		if (context) {
			const body: any = {
				id: id,
				newStatus: "Rejected",
			};

			const data = await (context as BackendService<any>).put(protectedResources.apiLisOffer.endPoint + "/QuoteOffer/" + id + "/status?newStatus=Rejected", body);
			if (data?.status === 200) {
				enqueueSnackbar(t('priceOfferRejected'), { variant: "success", anchorOrigin: { horizontal: "right", vertical: "top" } });
				loadOffer();
			}
			else {
				enqueueSnackbar(t('errorHappened'), { variant: "error", anchorOrigin: { horizontal: "right", vertical: "top" } });
			}
		}
	}

	function getPackageNamesByIds(ids: string[], packages: any) {
		const packageNames = [];

		for (const id of ids) {
			const foundPackage = packages.find((pkg: any) => pkg.packageId === id);
			if (foundPackage) {
				packageNames.push(foundPackage.packageName);
			}
		}
		// console.log(packageNames);
		return packageNames;
	}

	return (
		<div style={{ background: "#fff", borderTopLeftRadius: 20, borderTopRightRadius: 20 }}>
			<SnackbarProvider />
			<Box py={2.5}>
				<Typography variant="h5" sx={{ mt: { xs: 4, md: 1.5, lg: 1.5 } }} mx={5}><b>{t('manageOffer')} N° {id}</b></Typography>
				<Box>
				{
					!load ?
					<Grid container spacing={2} mt={1} px={5}>
						<Grid item xs={12}>
							<Typography variant="h5" sx={{ my: 1, fontSize: 19, fontWeight: "bold" }}>{t('selectedContainers')}</Typography>
							{
								<Grid container spacing={2}>
								{
									offer.containers.map((item: any, index: number) => (
									<Grid key={"listitem1-" + index} item xs={12} md={4}>
										<ListItem sx={{ border: "1px solid #e5e5e5" }}>
										<ListItemText primary={
											containers.find((elm: any) => elm.packageId === item.containerId) !== undefined ?
											t('container') + " : " + containers.find((elm: any) => elm.packageId === item.containerId).packageName + " | " + t('quantity') + " : " + item.quantity
											: t('container') + " : " + item.containerId + " | " + t('quantity') + " : " + item.quantity
										} />
										</ListItem>
									</Grid>
									))
								}
								</Grid>
							}
						</Grid>
						<Grid item xs={12}>
							<Typography variant="h5" sx={{ my: 2, fontSize: 19, fontWeight: "bold" }}>{t('selectedSeafreight')}</Typography>
							<DataGrid
								rows={[offer.seaFreight]}
								columns={[
									{ field: 'carrierName', headerName: t('carrier'), flex: 1.3 },
									{ field: 'carrierAgentName', headerName: t('carrierAgent'), flex: 1 },
									{ field: 'departurePortName', headerName: t('departurePort'), flex: 1 },
									{ field: 'destinationPortName', headerName: t('destinationPort'), flex: 1 },
									{ field: 'frequency', headerName: t('frequency'), valueFormatter: (params: GridValueFormatterParams) => `${t('every')} ${params.value || ''} ` + t('days'), flex: 1 },
									{ field: 'transitTime', headerName: t('transitTime'), valueFormatter: (params: GridValueFormatterParams) => `${params.value || ''} ` + t('days'), flex: 1 },
									{
									field: 'currency', headerName: t('prices'), renderCell: (params: GridRenderCellParams) => {
										return (
										<Box sx={{ my: 1, mr: 1 }}>
											<Box sx={{ my: 1 }} hidden={!getPackageNamesByIds(containersId, containers).includes("20' Dry")}>{params.row.price20Dry !== 0 ? "20' Dry : " + params.row.price20Dry + " " + params.row.currency : "20' Dry : N/A"}</Box>
											<Box sx={{ my: 1 }} hidden={!getPackageNamesByIds(containersId, containers).includes("20' Rf")}>{params.row.price20Rf !== 0 ? "20' Rf : " + params.row.price20Rf + " " + params.row.currency : "20' Rf : N/A"}</Box>
											<Box sx={{ my: 1 }} hidden={!getPackageNamesByIds(containersId, containers).includes("40' Dry")}>{params.row.price40Dry !== 0 ? "40' Dry : " + params.row.price40Dry + " " + params.row.currency : "40' Dry : N/A"}</Box>
											<Box sx={{ my: 1 }} hidden={!getPackageNamesByIds(containersId, containers).includes("40' Hc")}>{params.row.price40Hc !== 0 ? "40' Hc : " + params.row.price40Hc + " " + params.row.currency : "40' Hc : N/A"}</Box>
											<Box sx={{ my: 1 }} hidden={!getPackageNamesByIds(containersId, containers).includes("40' HcRf")}>{params.row.price40HcRf !== 0 ? "40' HcRf : " + params.row.price40HcRf + " " + params.row.currency : "40' HcRf : N/A"}</Box>
										</Box>
										);
									}, flex: 1},
								]}
								hideFooter
								getRowId={(row: any) => row?.id}
								getRowHeight={() => "auto"}
								sx={gridStyles}
								isRowSelectable={(params: any) => false}
							/>
						</Grid>
						{
							offer.haulage !== null && offer.haulage !== undefined ?
							<Grid item xs={12}>
								<Typography variant="h5" sx={{ my: 2, fontSize: 19, fontWeight: "bold" }}>{t('selectedHaulage')}</Typography>
								<DataGrid
									rows={[offer.haulage]}
									columns={[
										{ field: 'haulierName', headerName: t('haulier'), flex: 1.3 },
										{ field: 'loadingPort', headerName: t('loadingPort'), renderCell: (params: GridRenderCellParams) => {
											return (
											<Box sx={{ my: 2 }}>{params.row.loadingPort}</Box>
											);
										}, flex: 1},
										{ field: 'unitTariff', headerName: t('unitTariff'), valueGetter: (params: GridValueGetterParams) => `${params.row.unitTariff || ''} ${params.row.currency}`, flex: 1 },
										{ field: 'freeTime', headerName: t('freeTime'), valueFormatter: (params: GridValueFormatterParams) => `${params.value || ''} ` + t('hours'), flex: 1 },
										{ field: 'multiStop', headerName: t('multiStop'), valueGetter: (params: GridValueGetterParams) => `${params.row.multiStop || ''} ${params.row.currency}`, flex: 1 },
										{ field: 'overtimeTariff', headerName: t('overtimeTariff'), valueGetter: (params: GridValueGetterParams) => `${params.row.overtimeTariff || ''} ${params.row.currency} / ${t('hour')}`, flex: 1 },
										{ field: 'validUntil', headerName: t('validUntil'), renderCell: (params: GridRenderCellParams) => {
											return (
											<Box sx={{ my: 1, mr: 1 }}>
												<Chip label={(new Date(params.row.validUntil)).toLocaleDateString().slice(0, 10)} color={(new Date()).getTime() - (new Date(params.row.validUntil)).getTime() > 0 ? "warning" : "success"}></Chip>
											</Box>
											);
										}, flex: 1},
									]}
									hideFooter
									getRowId={(row: any) => row?.id}
									getRowHeight={() => "auto"}
									sx={gridStyles}
									isRowSelectable={(params: any) => false}
								/>
							</Grid> : null
						}
						{
						offer.miscellaneousList !== null && offer.miscellaneousList[0] !== null ?
							<Grid item xs={12}>
								<Typography variant="h5" sx={{ my: 2, fontSize: 19, fontWeight: "bold" }}>{t('selectedMisc')}</Typography>
								<DataGrid
									density="standard"
									rows={offer.miscellaneousList}
									columns={[
										{ field: 'supplierName', headerName: t('supplier'), flex: 1.3 },
										{ field: 'departurePortName', headerName: t('departurePort'), flex: 1, valueFormatter: (params: GridValueFormatterParams) => `${offer.seaFreight.departurePortName || ''}` },
										{ field: 'destinationPortName', headerName: t('destinationPort'), flex: 1, valueFormatter: (params: GridValueFormatterParams) => `${offer.seaFreight.destinationPortName || ''}` },
										{ field: 'currency', headerName: t('costPrices'), renderCell: (params: GridRenderCellParams) => {
											return (
											<Box sx={{ my: 1, mr: 1 }}>
												<Box sx={{ my: 1 }} hidden={!getPackageNamesByIds(containersId, containers).includes("20' Dry")}>{params.row.price20Dry !== 0 ? "20' Dry : " + params.row.price20Dry + " " + params.row.currency : "20' Dry : N/A"}</Box>
												<Box sx={{ my: 1 }} hidden={!getPackageNamesByIds(containersId, containers).includes("20' Rf")}>{params.row.price20Rf !== 0 ? "20' Rf : " + params.row.price20Rf + " " + params.row.currency : "20' Rf : N/A"}</Box>
												<Box sx={{ my: 1 }} hidden={!getPackageNamesByIds(containersId, containers).includes("40' Dry")}>{params.row.price40Dry !== 0 ? "40' Dry : " + params.row.price40Dry + " " + params.row.currency : "40' Dry : N/A"}</Box>
												<Box sx={{ my: 1 }} hidden={!getPackageNamesByIds(containersId, containers).includes("40' Hc")}>{params.row.price40Hc !== 0 ? "40' Hc : " + params.row.price40Hc + " " + params.row.currency : "40' Hc : N/A"}</Box>
												<Box sx={{ my: 1 }} hidden={!getPackageNamesByIds(containersId, containers).includes("40' HcRf")}>{params.row.price40HcRf !== 0 ? "40' HcRf : " + params.row.price40HcRf + " " + params.row.currency : "40' HcRf : N/A"}</Box>
											</Box>
											);
										}, flex: 1},
										// { field: 'services', headerName: 'Services', renderCell: (params: GridRenderCellParams) => {
										//   return (
										//       <Box sx={{ my: 1, mr: 1 }}>
										//           {params.row.services.map((elm: any, i: number) => {
										//               return (
										//                   <Box key={"idServ"+i} sx={{ my: 1 }}>
										//                       {elm.service.serviceName} : {elm.service.price} {params.row.currency}
										//                   </Box>
										//               );
										//           })}
										//       </Box>
										//   );
										// }, flex: 1 },
									]}
									hideFooter
									getRowId={(row: any) => row?.id}
									getRowHeight={() => "auto"}
									sx={gridStyles}
									isRowSelectable={(params: any) => false}
								/>
							</Grid> : null
						}
						{/* <Grid item xs={12} md={6}>
							<InputLabel htmlFor="client-name" sx={inputLabelStyles}>{t('clientName')}</InputLabel>
							<BootstrapInput id="clien-name" type="text" value={clientName} onChange={(e: any) => setClientName(e.target.value)} fullWidth />
						</Grid>
						<Grid item xs={12} md={2}>
							<InputLabel htmlFor="margin" sx={inputLabelStyles}>{t('margin')} (%)</InputLabel>
							<BootstrapInput id="margin" type="number" value={margin} onChange={(e: any) => setMargin(e.target.value)} fullWidth />
						</Grid>
						<Grid item xs={12} md={2}>
							<InputLabel htmlFor="reduction" sx={inputLabelStyles}>{t('reduction')} (%)</InputLabel>
							<BootstrapInput id="reduction" type="number" value={reduction} onChange={(e: any) => setReduction(e.target.value)} fullWidth />
						</Grid>
						<Grid item xs={12} md={2}>
							<InputLabel htmlFor="adding" sx={inputLabelStyles}>{t('extraFee')}</InputLabel>
							<BootstrapInput id="adding" type="number" value={adding} onChange={(e: any) => setAdding(e.target.value)} fullWidth />
						</Grid> */}
						<Grid item xs={8}>
							<InputLabel htmlFor="fileSent" sx={inputLabelStyles}>{t('fileSent')}</InputLabel>
							<MuiFileInput
								id="fileSent" size="small" variant="outlined" multiple fullWidth inputProps={{ accept: '.pdf' }}
								value={fileValue} sx={{ mt: 1 }} onChange={(newValue: any) => { console.log(newValue); setFileValue(newValue); }}
							/>
						</Grid>
						<Grid item xs={12}>
							<InputLabel htmlFor="details" sx={inputLabelStyles}>{t('detailsOffer')}</InputLabel>
							<Box sx={{ mt: 2 }}>
								<RichTextEditor
								ref={rteRef}
								extensions={[StarterKit]}
								content={offer.comment}
								renderControls={() => (
									<MenuControlsContainer>
									<MenuSelectHeading />
									<MenuDivider />
									<MenuButtonBold />
									<MenuButtonItalic />
									{/* <MenuButtonUnderline /> */}
									<MenuButtonStrikethrough />
									<MenuButtonOrderedList />
									<MenuButtonBulletedList />
									<MenuSelectTextAlign />
									<MenuButtonEditLink />
									<MenuButtonHorizontalRule />
									<MenuButtonUndo />
									<MenuButtonRedo />
									{/* Add more controls of your choosing here */}
									</MenuControlsContainer>
								)}
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
							<Button variant="contained" color="primary" sx={{ mr: 1, textTransform: "none" }} onClick={updateOffer}>{t('updateOffer')}</Button>
							<Button variant="contained" color="success" sx={{ mr: 1, textTransform: "none" }} onClick={acceptOffer}>{t('approveOffer')}</Button>
							<Button variant="contained" color="secondary" sx={{ mr: 1, textTransform: "none" }} onClick={rejectOffer}>{t('rejectOffer')}</Button>
						</Grid>
					</Grid> : <Skeleton sx={{ mx: 5, mt: 3 }} />
				}
				</Box>
			</Box>
		</div>
	);
}

export default ManagePriceOffer;
