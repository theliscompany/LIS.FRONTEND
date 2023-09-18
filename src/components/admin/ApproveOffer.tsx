import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { AuthenticationResult } from '@azure/msal-browser';
import { useAccount, useMsal } from '@azure/msal-react';
import { Typography, Box, Grid, Chip, InputLabel, Button, Alert, List, ListItem, ListItemText } from '@mui/material';
import Skeleton from '@mui/material/Skeleton';
import { SnackbarProvider, enqueueSnackbar } from 'notistack';
import { useAuthorizedBackendApi } from '../../api/api';
import { protectedResources, transportRequest } from '../../authConfig';
import { BackendService } from '../../services/fetch';
import { BootstrapInput, gridStyles, inputLabelStyles } from '../../misc/styles';
import { DataGrid, GridRenderCellParams, GridValueFormatterParams, GridValueGetterParams } from '@mui/x-data-grid';
import { useTranslation } from 'react-i18next';

function ApproveOffer(props: any) {
    const [load, setLoad] = useState<boolean>(true);
    const [offer, setOffer] = useState<any>(null);
    
    const [margin, setMargin] = useState<number>(22);
    const [reduction, setReduction] = useState<number>(0);
    const [adding, setAdding] = useState<number>(0);
    const [details, setDetails] = useState<string>("");
    const [comment, setComment] = useState<string>("");
    const [containers, setContainers] = useState<any>(null);
    const [containersId, setContainersId] = useState<any>([]);
    
    let { id } = useParams();
    const { instance, accounts } = useMsal();
    const account = useAccount(accounts[0] || {});
    const context = useAuthorizedBackendApi();

    const { t } = useTranslation();
        
    useEffect(() => {
        getContainers();
    }, [context]);

    const loadOffer = async () => {
        if (context) {
            const response = await (context as BackendService<any>).getSingle(protectedResources.apiLisOffer.endPoint+"/QuoteOffer/"+id);
            if (response !== null && response.code !== undefined) {
                if (response.code === 200) {
                console.log(response.data);
                setOffer(response.data);
                setMargin(response.data.margin);
                setReduction(response.data.reduction);
                setAdding(response.data.extraFee);
                setDetails(response.data.comment);
                setContainersId(response.data.containers.map((elm: any) => { return elm.containerId } ))
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
                    }).then((response) => {
                        return response.accessToken;
                    });
                }
            );
            
            const response = await (context as BackendService<any>).getWithToken(protectedResources.apiLisTransport.endPoint+"/Package/Containers", token);
            console.log("Containers", response);
            if (response !== null && response !== undefined) {
                setContainers(response);

                // Now I can call the quote offer
                loadOffer();
            }  
        }
    }
    
    const acceptOffer = async () => {
        if(context) {
            const body: any = {
                id: id,
                newStatus: "Accepted",
                comment: details
            };

            const data = await (context as BackendService<any>).put(protectedResources.apiLisOffer.endPoint+"/QuoteOffer/"+id+"/approval?newStatus=Accepted&comment="+details, body);
            if (data?.status === 200) {
                enqueueSnackbar(t('priceOfferApproved'), { variant: "success", anchorOrigin: { horizontal: "right", vertical: "top"} });
                loadOffer();
            }
            else {
                enqueueSnackbar(t('errorHappened'), { variant: "error", anchorOrigin: { horizontal: "right", vertical: "top"} });
            }
        }
    }

    const rejectOffer = async () => {
        if(context) {
            const body: any = {
                id: id,
                newStatus: "Rejected",
            };

            const data = await (context as BackendService<any>).put(protectedResources.apiLisOffer.endPoint+"/QuoteOffer/"+id+"/approval?newStatus=Rejected", body);
            if (data?.status === 200) {
                enqueueSnackbar(t('priceOfferRejected'), { variant: "success", anchorOrigin: { horizontal: "right", vertical: "top"} });
                loadOffer();
            }
            else {
                enqueueSnackbar(t('errorHappened'), { variant: "error", anchorOrigin: { horizontal: "right", vertical: "top"} });
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
    
        return packageNames;
    }

    return (
        <Box sx={{ maxWidth: "lg", margin: "0 auto" }}>
            <SnackbarProvider />
            {
                !load ? 
                <Grid container my={5} sx={{ px: { md: 0, xs: 2 } }}>
                    <Grid item xs={12} fontSize={16} my={3}>
                        <Typography variant="h4" fontWeight="bold">{t('approvePriceOffer')}</Typography>
                    </Grid>
                    <Grid item xs={12} sx={{ mb: 2 }}>
                        <Alert severity="info">{t('youSeeDetailsPriceOffer')}</Alert>
                    </Grid>
                    <Grid item xs={12}>
                        <Typography variant="h5" sx={{ my: 1, fontSize: 19, fontWeight: "bold" }}>{t('selectedContainers')}</Typography>
                        {
                            offer.containers !== undefined && offer.containers !== null && offer.containers.length !== 0 && containers !== null ? 
                                <List>
                                    {
                                        offer.containers.map((item: any, index: number) => (
                                            <ListItem
                                                key={"listitem1-"+index}
                                                sx={{ border: "1px solid #e5e5e5" }}
                                            >
                                                <ListItemText primary={
                                                    containers.find((elm: any) => elm.packageId === item.containerId) !== undefined ?
                                                    t('container')+" : "+containers.find((elm: any) => elm.packageId === item.containerId).packageName+" | "+t('quantity')+" : "+item.quantity
                                                    : t('container')+" : "+item.containerId+" | "+t('quantity')+" : "+item.quantity
                                                } />
                                            </ListItem>
                                        ))
                                    }
                                </List>
                            : null  
                        }
                    </Grid>
                    <Grid item xs={12}>
                        <Typography variant="h5" sx={{ my: 2, fontSize: 19, fontWeight: "bold" }}>{t('selectedSeafreight')}</Typography>
                        <DataGrid
                            rows={[offer.seaFreight]}
                            columns={
                                [
                                    { field: 'carrierName', headerName: t('carrier'), width: 175 },
                                    { field: 'carrierAgentName', headerName: t('carrierAgent'), width: 175 },
                                    { field: 'departurePortName', headerName: t('departurePort'), width: 125 },
                                    { field: 'destinationPortName', headerName: t('destinationPort'), width: 125 },
                                    { field: 'frequency', headerName: t('frequency'), valueFormatter: (params: GridValueFormatterParams) => `${t('every')} ${params.value || ''} `+t('days'), width: 125 },
                                    { field: 'transitTime', headerName: t('transitTime'), valueFormatter: (params: GridValueFormatterParams) => `${params.value || ''} `+t('days') },
                                    { field: 'currency', headerName: t('prices'), renderCell: (params: GridRenderCellParams) => {
                                        return (
                                            <Box sx={{ my: 1, mr: 1 }}>
                                                <Box sx={{ my: 1 }} hidden={!getPackageNamesByIds(containersId, containers).includes("20' Dry")}>{params.row.price20dry !== 0 ? "20' Dry : "+params.row.price20dry+" "+params.row.currency : "20' Dry : N/A"}</Box>
                                                <Box sx={{ my: 1 }} hidden={!getPackageNamesByIds(containersId, containers).includes("20' Rf")}>{params.row.price20rf !== 0 ? "20' Rf : "+params.row.price20rf+" "+params.row.currency : "20' Rf : N/A"}</Box>
                                                <Box sx={{ my: 1 }} hidden={!getPackageNamesByIds(containersId, containers).includes("40' Dry")}>{params.row.price40dry !== 0 ? "40' Dry : "+params.row.price40dry+" "+params.row.currency : "40' Dry : N/A"}</Box>
                                                <Box sx={{ my: 1 }} hidden={!getPackageNamesByIds(containersId, containers).includes("40' Hc")}>{params.row.price40hc !== 0 ? "40' Hc : "+params.row.price40hc+" "+params.row.currency : "40' Hc : N/A"}</Box>
                                                <Box sx={{ my: 1 }} hidden={!getPackageNamesByIds(containersId, containers).includes("40' HcRf")}>{params.row.price40hcrf !== 0 ? "40' HcRf : "+params.row.price40hcrf+" "+params.row.currency : "40' HcRf : N/A"}</Box>
                                            </Box>
                                        );
                                    }, width: 200 },
                                    { field: 'validUntil', headerName: t('validUntil'), renderCell: (params: GridRenderCellParams) => {
                                        return (
                                            <Box sx={{ my: 1, mr: 1 }}>
                                                <Chip label={(new Date(params.row.validUntil)).toLocaleDateString().slice(0,10)} color={(new Date()).getTime() - (new Date(params.row.validUntil)).getTime() > 0 ? "warning" : "success"}></Chip>
                                            </Box>
                                        );
                                    }, width: 100 },
                                ]
                            }
                            hideFooter
                            getRowId={(row: any) => row?.id}
                            getRowHeight={() => "auto" }
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
                                columns={
                                    [
                                        { field: 'haulierName', headerName: t('haulier'), width: 175 },
                                        { field: 'loadingPort', headerName: t('loadingPort'), renderCell: (params: GridRenderCellParams) => {
                                            return (
                                                <Box sx={{ my: 2 }}>{params.row.loadingPort}</Box>
                                            );
                                        }, width: 175 },
                                        { field: 'unitTariff', headerName: t('unitTariff'), valueGetter: (params: GridValueGetterParams) => `${params.row.unitTariff || ''} ${params.row.currency}` },
                                        { field: 'freeTime', headerName: t('freeTime'), valueFormatter: (params: GridValueFormatterParams) => `${params.value || ''} `+t('hours'), width: 125 },
                                        { field: 'multiStop', headerName: t('multiStop'), valueGetter: (params: GridValueGetterParams) => `${params.row.multiStop || ''} ${params.row.currency}` },
                                        { field: 'overtimeTariff', headerName: t('overtimeTariff'), valueGetter: (params: GridValueGetterParams) => `${params.row.overtimeTariff || ''} ${params.row.currency} / ${t('hour')}` },
                                        { field: 'validUntil', headerName: t('validUntil'), renderCell: (params: GridRenderCellParams) => {
                                            return (
                                                <Box sx={{ my: 1, mr: 1 }}>
                                                    <Chip label={(new Date(params.row.validUntil)).toLocaleDateString().slice(0,10)} color={(new Date()).getTime() - (new Date(params.row.validUntil)).getTime() > 0 ? "warning" : "success"}></Chip>
                                                </Box>
                                            );
                                        }, width: 150 },
                                    ]
                                }
                                hideFooter
                                getRowId={(row: any) => row?.id}
                                getRowHeight={() => "auto" }
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
                                columns={
                                [
                                    { field: 'supplierName', headerName: t('supplier'), width: 175 },
                                    { field: 'departurePortName', headerName: t('departurePort'), width: 175, valueFormatter: (params: GridValueFormatterParams) => `${offer.seaFreight.departurePortName || ''}`, },
                                    { field: 'destinationPortName', headerName: t('destinationPort'), width: 325, valueFormatter: (params: GridValueFormatterParams) => `${offer.seaFreight.destinationPortName || ''}`, },
                                    { field: 'currency', headerName: t('prices'), renderCell: (params: GridRenderCellParams) => {
                                        return (
                                            <Box sx={{ my: 1, mr: 1 }}>
                                                <Box sx={{ my: 1 }} hidden={!getPackageNamesByIds(containersId, containers).includes("20' Dry")}>{params.row.price20dry !== 0 ? "20' Dry : "+params.row.price20dry+" "+params.row.currency : "20' Dry : N/A"}</Box>
                                                <Box sx={{ my: 1 }} hidden={!getPackageNamesByIds(containersId, containers).includes("20' Rf")}>{params.row.price20rf !== 0 ? "20' Rf : "+params.row.price20rf+" "+params.row.currency : "20' Rf : N/A"}</Box>
                                                <Box sx={{ my: 1 }} hidden={!getPackageNamesByIds(containersId, containers).includes("40' Dry")}>{params.row.price40dry !== 0 ? "40' Dry : "+params.row.price40dry+" "+params.row.currency : "40' Dry : N/A"}</Box>
                                                <Box sx={{ my: 1 }} hidden={!getPackageNamesByIds(containersId, containers).includes("40' Hc")}>{params.row.price40hc !== 0 ? "40' Hc : "+params.row.price40hc+" "+params.row.currency : "40' Hc : N/A"}</Box>
                                                <Box sx={{ my: 1 }} hidden={!getPackageNamesByIds(containersId, containers).includes("40' HcRf")}>{params.row.price40hcrf !== 0 ? "40' HcRf : "+params.row.price40hcrf+" "+params.row.currency : "40' HcRf : N/A"}</Box>
                                            </Box>
                                        );
                                    }, width: 200 },
                                    { field: 'services', headerName: 'Services', renderCell: (params: GridRenderCellParams) => {
                                        return (
                                            <Box sx={{ my: 1, mr: 1 }}>
                                                {params.row.services.map((elm: any, i: number) => {
                                                    return (
                                                        <Box key={"idServ"+i} sx={{ my: 1 }}>
                                                            {elm.service.serviceName} : {elm.service.price} {params.row.currency}
                                                        </Box>
                                                    );
                                                })}
                                            </Box>
                                        );
                                    }, width: 200 },
                                ]
                                }
                                hideFooter
                                getRowId={(row: any) => row?.id}
                                getRowHeight={() => "auto" }
                                sx={gridStyles}
                                isRowSelectable={(params: any) => false}
                            />
                        </Grid> : null
                    }
                    <Grid item xs={12} sx={{ mt: 2 }}>
                        <InputLabel htmlFor="details" sx={inputLabelStyles}>{t('sentBackComment')}</InputLabel>
                        <BootstrapInput id="details" type="text" multiline rows={3} value={details} onChange={(e: any) => setDetails(e.target.value)} fullWidth />
                    </Grid>
                    <Grid item xs={12} sx={{ my: 2 }}>
                        <Typography variant="h6">
                            { 
                                offer.seaFreight !== null ? 
                                <Chip variant="outlined" size="medium"
                                    label={t('totalPrice').toUpperCase()+" : "+ Number(offer.totalPrice+offer.totalPrice*margin/100-offer.totalPrice*reduction/100+adding*1).toString()+" "+offer.seaFreight.currency}
                                    sx={{ fontWeight: "bold", fontSize: 16, py: 3 }} 
                                /> : null
                            }
                        </Typography>
                    </Grid>
                    <Grid item xs={12}>
                        <Alert severity={"info"}>
                            {t('statusOfferIs')} : <strong>{offer.clientApproval}</strong>
                        </Alert>
                    </Grid>
                    <Grid item xs={12} sx={{ pt: 1.5, display: "flex", alignItems: "center", justifyContent: "end" }}>
                        <Button variant="contained" color="success" sx={{ mr: 1, textTransform: "none" }} onClick={acceptOffer}>{t('acceptOffer')}</Button>
                        <Button variant="contained" color="secondary" sx={{ mr: 1, textTransform: "none" }} onClick={rejectOffer}>{t('rejectOffer')}</Button>
                    </Grid>
                </Grid> : <Skeleton sx={{ mx: 5, mt: 3 }} />
            }
        </Box>
    );
}

export default ApproveOffer;
