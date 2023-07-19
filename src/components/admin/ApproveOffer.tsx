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
import { BootstrapInput, inputLabelStyles } from '../../misc/styles';
import { DataGrid, GridRenderCellParams, GridValueFormatterParams, GridValueGetterParams } from '@mui/x-data-grid';

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
                enqueueSnackbar("Your price offer has been approved with success.", { variant: "success", anchorOrigin: { horizontal: "right", vertical: "top"} });
                loadOffer();
            }
            else {
                enqueueSnackbar("An error happened during the operation.", { variant: "error", anchorOrigin: { horizontal: "right", vertical: "top"} });
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
                enqueueSnackbar("Your price offer has been rejected with success.", { variant: "success", anchorOrigin: { horizontal: "right", vertical: "top"} });
                loadOffer();
            }
            else {
                enqueueSnackbar("An error happened during the operation.", { variant: "error", anchorOrigin: { horizontal: "right", vertical: "top"} });
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
                        <Typography variant="h4" fontWeight="bold">Approve a price offer</Typography>
                    </Grid>
                    <Grid item xs={12} sx={{ mb: 2 }}>
                        <Alert severity="info">You can see the details about our price offer down below</Alert>
                    </Grid>
                    <Grid item xs={12}>
                        <Typography variant="h5" sx={{ my: 1, fontSize: 19, fontWeight: "bold" }}>Selected containers</Typography>
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
                                                    "Container : "+containers.find((elm: any) => elm.packageId === item.containerId).packageName+" | Quantity : "+item.quantity
                                                    : "Container : "+item.containerId+" | Quantity : "+item.quantity
                                                } />
                                            </ListItem>
                                        ))
                                    }
                                </List>
                            : null  
                        }
                    </Grid>
                    <Grid item xs={12}>
                        <Typography variant="h5" sx={{ my: 2, fontSize: 19, fontWeight: "bold" }}>Selected sea freight</Typography>
                        <DataGrid
                            rows={[offer.seaFreight]}
                            columns={
                            [
                                { field: 'carrierName', headerName: 'Carrier', width: 175 },
                                { field: 'carrierAgentName', headerName: 'Carrier agent', width: 175 },
                                { field: 'departurePortName', headerName: 'Departure port', width: 125 },
                                { field: 'frequency', headerName: 'Frequency', valueFormatter: (params: GridValueFormatterParams) => `${params.value || ''} / day`, },
                                { field: 'transitTime', headerName: 'Transit time', valueFormatter: (params: GridValueFormatterParams) => `${params.value || ''} days` },
                                { field: 'currency', headerName: 'Prices', renderCell: (params: GridRenderCellParams) => {
                                    return (
                                        <Box sx={{ my: 1, mr: 1 }}>
                                            <Box sx={{ my: 1 }} hidden={params.row.price20Dry === 0 || !getPackageNamesByIds(containersId, containers).includes("20' Dry")}>{"20' Dry : "+params.row.price20Dry+" "+params.row.currency}</Box>
                                            <Box sx={{ my: 1 }} hidden={params.row.price20Rf === 0 || !getPackageNamesByIds(containersId, containers).includes("20' Rf")}>{"20' Rf : "+params.row.price20Rf+" "+params.row.currency}</Box>
                                            <Box sx={{ my: 1 }} hidden={params.row.price40Dry === 0 || !getPackageNamesByIds(containersId, containers).includes("40' Dry")}>{"40' Dry : "+params.row.price40Dry+" "+params.row.currency}</Box>
                                            <Box sx={{ my: 1 }} hidden={params.row.price40Hc === 0 || !getPackageNamesByIds(containersId, containers).includes("40' Hc")}>{"40' Hc : "+params.row.price40Hc+" "+params.row.currency}</Box>
                                            <Box sx={{ my: 1 }} hidden={params.row.price40HcRf === 0 || !getPackageNamesByIds(containersId, containers).includes("40' HcRf")}>{"40' HcRf : "+params.row.price40HcRf+" "+params.row.currency}</Box>
                                        </Box>
                                    );
                                }, width: 200 },
                            ]
                            }
                            hideFooter
                            getRowId={(row: any) => row?.id}
                            getRowHeight={() => "auto" }
                            sx={{ height: "auto" }}
                            isRowSelectable={(params: any) => false}
                        />
                    </Grid>
                    {
                        offer.haulage !== null && offer.haulage !== undefined ? 
                        <Grid item xs={12}>
                            <Typography variant="h5" sx={{ my: 2, fontSize: 19, fontWeight: "bold" }}>Selected haulage</Typography>
                            <DataGrid
                                rows={[offer.haulage]}
                                columns={
                                [
                                    { field: 'haulierName', headerName: 'Haulier', width: 175 },
                                    { field: 'loadingPort', headerName: 'Loading port', renderCell: (params: GridRenderCellParams) => {
                                        return (
                                            <Box sx={{ my: 2 }}>{params.row.loadingPort}</Box>
                                        );
                                    }, width: 175 },
                                    { field: 'freeTime', headerName: 'Free time', valueFormatter: (params: GridValueFormatterParams) => `${params.value || ''} days`, width: 125 },
                                    { field: 'multiStop', headerName: 'Multi stop', valueGetter: (params: GridValueGetterParams) => `${params.row.multiStop || ''} ${params.row.currency}` },
                                    { field: 'overtimeTariff', headerName: 'Overtime tariff', valueGetter: (params: GridValueGetterParams) => `${params.row.overtimeTariff || ''} ${params.row.currency}` },
                                    { field: 'unitTariff', headerName: 'Unit tariff', valueGetter: (params: GridValueGetterParams) => `${params.row.unitTariff || ''} ${params.row.currency}` },
                                    { field: 'validUntil', headerName: 'Valid until', valueFormatter: (params: GridValueFormatterParams) => `${(new Date(params.value)).toLocaleString() || ''}`, width: 200 },
                                ]
                                }
                                hideFooter
                                getRowId={(row: any) => row?.id}
                                getRowHeight={() => "auto" }
                                sx={{ height: "auto" }}
                                isRowSelectable={(params: any) => false}
                            />
                        </Grid> : null
                    }
                    {
                        offer.miscellaneousList !== null && offer.miscellaneousList[0] !== null ? 
                        <Grid item xs={12}>
                            <Typography variant="h5" sx={{ my: 2, fontSize: 19, fontWeight: "bold" }}>Selected miscellaneous</Typography>
                            <DataGrid
                                density="standard"
                                rows={offer.miscellaneousList}
                                columns={
                                [
                                    { field: 'supplierName', headerName: 'Supplier', width: 175 },
                                    { field: 'departurePortName', headerName: 'Departure port', width: 175, valueFormatter: (params: GridValueFormatterParams) => `${offer.seaFreight.departurePortName || ''}`, },
                                    { field: 'destinationPortName', headerName: 'Destination port', width: 325, valueFormatter: (params: GridValueFormatterParams) => `${offer.seaFreight.destinationPortName || ''}`, },
                                    { field: 'currency', headerName: 'Prices', renderCell: (params: GridRenderCellParams) => {
                                        return (
                                            <Box sx={{ my: 1, mr: 1 }}>
                                                <Box sx={{ my: 1 }} hidden={params.row.price20Dry === 0 || !getPackageNamesByIds(containersId, containers).includes("20' Dry")}>{"20' Dry : "+params.row.price20Dry+" "+params.row.currency}</Box>
                                                <Box sx={{ my: 1 }} hidden={params.row.price20Rf === 0 || !getPackageNamesByIds(containersId, containers).includes("20' Rf")}>{"20' Rf : "+params.row.price20Rf+" "+params.row.currency}</Box>
                                                <Box sx={{ my: 1 }} hidden={params.row.price40Dry === 0 || !getPackageNamesByIds(containersId, containers).includes("40' Dry")}>{"40' Dry : "+params.row.price40Dry+" "+params.row.currency}</Box>
                                                <Box sx={{ my: 1 }} hidden={params.row.price40Hc === 0 || !getPackageNamesByIds(containersId, containers).includes("40' Hc")}>{"40' Hc : "+params.row.price40Hc+" "+params.row.currency}</Box>
                                                <Box sx={{ my: 1 }} hidden={params.row.price40HcRf === 0 || !getPackageNamesByIds(containersId, containers).includes("40' HcRf")}>{"40' HcRf : "+params.row.price40HcRf+" "+params.row.currency}</Box>
                                            </Box>
                                        );
                                    }, width: 200 },
                                ]
                                }
                                hideFooter
                                getRowId={(row: any) => row?.id}
                                getRowHeight={() => "auto" }
                                sx={{ height: "auto" }}
                                isRowSelectable={(params: any) => false}
                            />
                        </Grid> : null
                    }
                    <Grid item xs={12} sx={{ mt: 2 }}>
                        <InputLabel htmlFor="details" sx={inputLabelStyles}>Comment to send back</InputLabel>
                        <BootstrapInput id="details" type="text" multiline rows={3} value={details} onChange={(e: any) => setDetails(e.target.value)} fullWidth />
                    </Grid>
                    <Grid item xs={12} sx={{ my: 2 }}>
                        <Typography variant="h6">
                            { 
                                offer.seaFreight !== null ? 
                                <Chip variant="outlined" size="medium"
                                    label={"TOTAL PRICE : "+ Number(offer.totalPrice+offer.totalPrice*margin/100-offer.totalPrice*reduction/100+adding*1).toString()+" "+offer.seaFreight.currency}
                                    sx={{ fontWeight: "bold", fontSize: 16, py: 3 }} 
                                /> : null
                            }
                        </Typography>
                    </Grid>
                    <Grid item xs={12}>
                        <Alert severity={"info"}>
                            The status of this offer is : <strong>{offer.clientApproval}</strong>
                        </Alert>
                    </Grid>
                    <Grid item xs={12} sx={{ pt: 1.5, display: "flex", alignItems: "center", justifyContent: "end" }}>
                        <Button variant="contained" color="success" sx={{ mr: 1, textTransform: "none" }} onClick={acceptOffer}>Accept the offer</Button>
                        <Button variant="contained" color="secondary" sx={{ mr: 1, textTransform: "none" }} onClick={rejectOffer}>Reject the offer</Button>
                    </Grid>
                </Grid> : <Skeleton sx={{ mx: 5, mt: 3 }} />
            }
        </Box>
    );
}

export default ApproveOffer;
