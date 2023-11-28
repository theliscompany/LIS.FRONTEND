import { useState, useEffect } from 'react';
import { Accordion, AccordionDetails, AccordionSummary, Alert, Autocomplete, Box, Button, Chip, DialogActions, DialogContent, Grid, IconButton, InputLabel, ListItem, ListItemText, NativeSelect, Skeleton, TextField, Typography } from '@mui/material';
import AddCircleOutlinedIcon from '@mui/icons-material/AddCircleOutlined';
import SearchIcon from '@mui/icons-material/Search';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { SnackbarProvider, enqueueSnackbar } from 'notistack';
import { useTranslation } from 'react-i18next';
import { useAuthorizedBackendApi } from '../api/api';
import { pricingRequest, protectedResources, transportRequest } from '../config/authConfig';
import { BackendService } from '../utils/services/fetch';
import { GridColDef, GridValueFormatterParams, GridRenderCellParams, DataGrid } from '@mui/x-data-grid';
import { BootstrapDialog, BootstrapDialogTitle, BootstrapInput, actionButtonStyles, buttonCloseStyles, datetimeStyles, gridStyles, inputLabelStyles, whiteButtonStyles } from '../utils/misc/styles';
import CompanySearch from '../components/shared/CompanySearch';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import dayjs, { Dayjs } from 'dayjs';
import { AuthenticationResult } from '@azure/msal-browser';
import { useMsal, useAccount } from '@azure/msal-react';
import { CategoryEnum } from '../utils/constants';

function createGetRequestUrl(variable1: number, variable2: number, variable3: number) {
    let url = protectedResources.apiLisPricing.endPoint+"/SeaFreight/GetSeaFreights?";
    if (variable1) {
      url += 'DeparturePortId=' + encodeURIComponent(variable1) + '&';
    }
    if (variable2) {
      url += 'DestinationPortId=' + encodeURIComponent(variable2) + '&';
    }
    if (variable3) {
      url += 'CarrierAgentId=' + encodeURIComponent(variable3) + '&';
    }
    
    if (url.slice(-1) === '&') {
      url = url.slice(0, -1);
    }
    return url;
}

function Seafreights() {
    const [load, setLoad] = useState<boolean>(true);
    const [loadEdit, setLoadEdit] = useState<boolean>(false);
    const [modal, setModal] = useState<boolean>(false);
    const [modal2, setModal2] = useState<boolean>(false);
    const [ports, setPorts] = useState<any>(null);
    const [containers, setContainers] = useState<any>(null);
    const [services, setServices] = useState<any>(null);
    const [currentId, setCurrentId] = useState<string>("");
    const [currentEditId, setCurrentEditId] = useState<string>("");
    const [seafreights, setSeafreights] = useState<any>(null);
    const [searchedCarrier, setSearchedCarrier] = useState<any>(null);
    const [portDeparture, setPortDeparture] = useState<any>(null);
    const [portDestination, setPortDestination] = useState<any>(null);
    const [carrier, setCarrier] = useState<any>(null);
    const [carrierAgent, setCarrierAgent] = useState<any>(null);
    const [portLoading, setPortLoading] = useState<any>(null);
    const [portDischarge, setPortDischarge] = useState<any>(null);
    const [transitTime, setTransitTime] = useState<number>(0);
    const [frequency, setFrequency] = useState<number>(0);
    const [validUntil, setValidUntil] = useState<Dayjs | null>(null);
    const [currency, setCurrency] = useState<string>("EUR");
    const [comment, setComment] = useState<string>("");
    const [serviceName, setServiceName] = useState<any>(null);
    const [containerTypes, setContainerTypes] = useState<any>([]);
    const [price, setPrice] = useState<number>(0);
    const [servicesSelection, setServicesSelection] = useState<any>([]);

    const [tempToken, setTempToken] = useState<string>("");
    
    const { t } = useTranslation();
    
    const { instance, accounts } = useMsal();
    const account = useAccount(accounts[0] || {});
    const context = useAuthorizedBackendApi();
    
    const currencyOptions = [
        { code: "EUR", label: 'Euro - €' },
        { code: 'GBP', label: 'British pound - £' },
        { code: "USD", label: 'Dollar - $' },
        { code: "FCFA", label: 'Franc CFA - FCFA' }
    ]
    
    const columnsSeafreights: GridColDef[] = [
        { field: 'carrierAgentName', headerName: t('carrierAgent'), minWidth: 125, flex: 1.4 },
        { field: 'frequency', headerName: t('frequency'), valueFormatter: (params: GridValueFormatterParams) => `${t('every')} ${params.value || ''} `+t('days'), minWidth: 100, flex: 1 },
        { field: 'transitTime', headerName: t('transitTime'), valueFormatter: (params: GridValueFormatterParams) => `${params.value || ''} `+t('days'), minWidth: 100, flex: 1 },
        { field: 'currency', headerName: t('prices'), renderCell: (params: GridRenderCellParams) => {
            return (
                <Box sx={{ my: 1, mr: 1 }}>
                    <Box sx={{ my: 1 }} hidden={params.row.total20Dry === 0}>{params.row.total20Dry !== 0 ? "20' Dry : "+params.row.total20Dry+" "+t(params.row.currency) : "20' Dry : N/A"}</Box>
                    <Box sx={{ my: 1 }} hidden={params.row.total20RF === 0}>{params.row.total20RF !== 0 ? "20' Rf : "+params.row.total20RF+" "+t(params.row.currency) : "20' Rf : N/A"}</Box>
                    <Box sx={{ my: 1 }} hidden={params.row.total40Dry === 0}>{params.row.total40Dry !== 0 ? "40' Dry : "+params.row.total40Dry+" "+t(params.row.currency) : "40' Dry : N/A"}</Box>
                    <Box sx={{ my: 1 }} hidden={params.row.total40HC === 0}>{params.row.total40HC !== 0 ? "40' Hc : "+params.row.total40HC+" "+t(params.row.currency) : "40' Hc : N/A"}</Box>
                    <Box sx={{ my: 1 }} hidden={params.row.total20HCRF === 0}>{params.row.total20HCRF !== 0 ? "40' HcRf : "+params.row.total20HCRF+" "+t(params.row.currency) : "40' HcRf : N/A"}</Box>
                </Box>
            );
        }, minWidth: 150, flex: 1 },
        { field: 'validUntil', headerName: t('validUntil'), renderCell: (params: GridRenderCellParams) => {
            return (
                <Box sx={{ my: 1, mr: 1 }}>
                    <Chip label={(new Date(params.row.validUntil)).toLocaleDateString().slice(0,10)} color={(new Date()).getTime() - (new Date(params.row.validUntil)).getTime() > 0 ? "warning" : "success"}></Chip>
                </Box>
            );
        }, minWidth: 100, flex: 1 },
        { field: 'created', headerName: t('created'), renderCell: (params: GridRenderCellParams) => {
            return (
                <Box sx={{ my: 1, mr: 1 }}>
                    <Chip label={(new Date(params.row.created)).toLocaleDateString().slice(0,10)} color={(new Date()).getTime() - (new Date(params.row.created)).getTime() > 0 ? "default" : "default"}></Chip>
                </Box>
            );
        }, minWidth: 100, flex: 1 },
        { field: 'xxx', headerName: t('Actions'), renderCell: (params: GridRenderCellParams) => {
            return (
                <Box sx={{ my: 1, mr: 1 }}>
                    <IconButton size="small" title={t('editRow')} sx={{ mr: 0.5 }} onClick={() => { setCurrentEditId(params.row.seaFreightId); getSeafreight(params.row.seaFreightId); setModal2(true); }}>
                        <EditIcon fontSize="small" />
                    </IconButton>
                    <IconButton size="small" title={t('deleteRow')} onClick={() => { setCurrentId(params.row.seaFreightId); setModal(true); }}>
                        <DeleteIcon fontSize="small" />
                    </IconButton>
                </Box>
            );
        }, minWidth: 120, flex: 0.8 },
    ];
    
    useEffect(() => {
        getPorts();
        getSeafreights();
        getProtectedData(); // Services and Containers
    }, []);
    
    const getPorts = async () => {
        if (context) {
            const response = await (context as BackendService<any>).getSingle(protectedResources.apiLisTransport.endPoint+"/Port/Ports");
            if (response !== null && response !== undefined) {
                setPorts(response);
            }  
        }
    }
    
    const getProtectedData = async () => {
        if (context && account) {
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
            
            getServices(token);
            getContainers(token);
        }
    }

    const getServices = async (token: string) => {
        if (context) {
            const response = await (context as BackendService<any>).getWithToken(protectedResources.apiLisTransport.endPoint+"/Service/Services", token);
            if (response !== null && response !== undefined) {
                setServices(response);
            }  
        }
    }
    
    const getContainers = async (token: string) => {
        if (context) {
            const response = await (context as BackendService<any>).getWithToken(protectedResources.apiLisTransport.endPoint+"/Package/Containers", token);
            if (response !== null && response !== undefined) {
                setContainers(response);
            }  
        }
    }
    
    const getSeafreights = async () => {
        if (context && account) {
            const token = await instance.acquireTokenSilent({
                scopes: pricingRequest.scopes,
                account: account
            }).then((response:AuthenticationResult)=>{
                return response.accessToken;
            }).catch(() => {
                return instance.acquireTokenPopup({
                    ...pricingRequest,
                    account: account
                    }).then((response) => {
                        return response.accessToken;
                });
            });
            setTempToken(token);
            
            const response = await (context as BackendService<any>).getWithToken(protectedResources.apiLisPricing.endPoint+"/SeaFreight/GetSeaFreights", token);
            if (response !== null && response !== undefined) {
                setSeafreights(response);
                // setHaulages([]);
                setLoad(false);
            }
            else {
                setLoad(false);
            }
            console.log(response);
        }
        
        // if (context) {
        //     const response = await (context as BackendService<any>).get(protectedResources.apiLisPricing.endPoint+"/SeaFreight/GetSeaFreights");
        //     console.log(response);
        //     if (response !== null && response !== undefined) {
        //         setSeafreights(response);
        //         // setSeafreights([]);
        //         setLoad(false);
        //     }
        //     else {
        //         setLoad(false);
        //     }
        //     console.log(response);
        // }
    }
    
    const resetForm = () => {
        setCarrier(null);
        setCarrierAgent(null);
        setPortLoading(null);
        setPortDischarge(null);
        setCurrency("EUR");
        setValidUntil(null);
        setTransitTime(0);
        setFrequency(0);
        setComment("");
        setServicesSelection([]);
    }
    
    const getSeafreight = async (id: string) => {
        setLoadEdit(true)
        if (context) {
            const response = await (context as BackendService<any>).getWithToken(protectedResources.apiLisPricing.endPoint+"/SeaFreight/SeaFreight?seaFreightId="+id, tempToken);
            if (response !== null && response !== undefined) {
                setCarrier({contactId: response.carrierId, contactName: response.carrierName});
                setCarrierAgent({contactId: response.carrierAgentId, contactName: response.carrierAgentName});
                setPortLoading(ports.find((elm: any) => elm.portId === response.departurePortId));
                setPortDischarge(ports.find((elm: any) => elm.portId === response.destinationPortId));
                setCurrency(response.currency);
                setValidUntil(dayjs(response.validUntil));
                setTransitTime(response.transitTime);
                setFrequency(response.frequency);
                setComment(response.comment);
                setServicesSelection(response.services);
                setLoadEdit(false);
            }
            else {
                setLoadEdit(false);
            }
            console.log(response);
        }
    }
    
    const searchSeafreights = async () => {
        if (context) {
            setLoad(true);
            var requestFormatted = createGetRequestUrl(portDeparture?.portId, portDestination?.portId, searchedCarrier?.contactId);
            const response = await (context as BackendService<any>).getWithToken(requestFormatted, tempToken);
            if (response !== null && response !== undefined) {
                setSeafreights(response);
                setLoad(false);
            }
            else {
                setLoad(false);
            }
            console.log(response);
        }
    }

    const createUpdateSeafreight = async () => {
        if (portLoading !== null && portDischarge !== null && carrier !== null && carrierAgent !== null && frequency !== 0 && transitTime !== 0 && servicesSelection !== null && validUntil !== null) {
            if (context) {
                var dataSent = null;
                if (currentEditId !== "") {
                    dataSent = {
                        "seaFreightId": currentEditId,
                        "departurePortId": portLoading.portId,
                        "destinationPortId": portDischarge.portId,
                        "departurePortName": portLoading.portName,
                        "destinationPortName": portDischarge.portName,
                        "carrierId": carrier.contactId,
                        "carrierName": carrier.contactName,
                        "carrierAgentId": carrierAgent.contactId,
                        "carrierAgentName": carrierAgent.contactName,
                        "currency": currency,
                        "validUntil": validUntil?.toISOString(),
                        "transitTime": transitTime,
                        "frequency": frequency,
                        "comment": comment,
                        "services": servicesSelection,
                        "updated": (new Date()).toISOString()
                    };    
                }
                else {
                    dataSent = {
                        // "seaFreightId": "string",
                        "departurePortId": portLoading.portId,
                        "destinationPortId": portDischarge.portId,
                        "departurePortName": portLoading.portName,
                        "destinationPortName": portDischarge.portName,
                        "carrierId": carrier.contactId,
                        "carrierName": carrier.contactName,
                        "carrierAgentId": carrierAgent.contactId,
                        "carrierAgentName": carrierAgent.contactName,
                        "currency": currency,
                        "validUntil": validUntil?.toISOString(),
                        "transitTime": transitTime,
                        "frequency": frequency,
                        "comment": comment,
                        "services": servicesSelection,
                        "updated": (new Date()).toISOString()
                    };    
                }
                const response = await (context as BackendService<any>).postWithToken(protectedResources.apiLisPricing.endPoint+"/SeaFreight/SeaFreight", dataSent, tempToken);
                if (response !== null && response !== undefined) {
                    setModal2(false);
                    enqueueSnackbar(t('successCreated'), { variant: "success", anchorOrigin: { horizontal: "right", vertical: "top"} });
                    searchSeafreights();
                }
                else {
                    enqueueSnackbar(t('errorHappened'), { variant: "error", anchorOrigin: { horizontal: "right", vertical: "top"} });
                }
            }
        }
        else {
            enqueueSnackbar(t('fieldsEmptySeafreight'), { variant: "error", anchorOrigin: { horizontal: "right", vertical: "top"} });
        }
    }

    const deleteSeafreightPrice = async (id: string) => {
        if (context) {
            // alert("Function not available yet!");
            const response = await (context as BackendService<any>).delete(protectedResources.apiLisPricing.endPoint+"/SeaFreight/DeleteSeaFreightPrice?id="+id);
            if (response !== null && response !== undefined) {
                enqueueSnackbar(t('rowDeletedSuccess'), { variant: "success", anchorOrigin: { horizontal: "right", vertical: "top"} });
                setModal(false);
                searchSeafreights();
            }
            else {
                enqueueSnackbar(t('rowDeletedError'), { variant: "success", anchorOrigin: { horizontal: "right", vertical: "top"} });
            }
        }
    }
    
    return (
        <div style={{ background: "#fff", borderTopLeftRadius: 20, borderTopRightRadius: 20 }}>
            <SnackbarProvider />
            <Box sx={{ py: 2.5 }}>
                <Typography variant="h5" sx={{mt: {xs: 4, md: 1.5, lg: 1.5 }}} mx={5}><b>{t('listSeafreights')}</b></Typography>
                <Grid container spacing={2} mt={0} px={5}>
                    <Grid item xs={12}>
                        <Button variant="contained" sx={actionButtonStyles} onClick={() => { setCurrentEditId(""); resetForm(); setModal2(true); }}>
                            {t('newSeafreightPrice')} <AddCircleOutlinedIcon sx={{ ml: 0.5, pb: 0.25, justifyContent: "center", alignItems: "center" }} fontSize="small" />
                        </Button>
                    </Grid>
                    <Grid item xs={12} md={4} mt={1}>
                        <InputLabel htmlFor="company-name" sx={inputLabelStyles}>{t('carrier')}</InputLabel>
                        <CompanySearch id="company-name" value={searchedCarrier} onChange={setSearchedCarrier} category={CategoryEnum.SHIPPING_LINES} callBack={() => console.log(searchedCarrier)} fullWidth />
                    </Grid>
                    <Grid item xs={12} md={3} mt={1}>
                        <InputLabel htmlFor="port-departure" sx={inputLabelStyles}>{t('departurePort')}</InputLabel>
                        {
                            ports !== null ?
                            <Autocomplete
                                disablePortal
                                id="port-departure"
                                options={ports}
                                renderOption={(props, option, i) => {
                                    return (
                                        <li {...props} key={option.portId}>
                                            {option.portName+", "+option.country}
                                        </li>
                                    );
                                }}
                                getOptionLabel={(option: any) => { 
                                    if (option !== null && option !== undefined) {
                                        return option.portName+', '+option.country;
                                    }
                                    return ""; 
                                }}
                                value={portDeparture}
                                sx={{ mt: 1 }}
                                renderInput={(params: any) => <TextField {...params} />}
                                onChange={(e: any, value: any) => { setPortDeparture(value); }}
                                fullWidth
                            /> : <Skeleton />
                        }
                    </Grid>
                    <Grid item xs={12} md={3} mt={1}>
                        <InputLabel htmlFor="destination-port" sx={inputLabelStyles}>{t('arrivalPort')}</InputLabel>
                        {
                            ports !== null ?
                            <Autocomplete
                                disablePortal
                                id="destination-port"
                                options={ports}
                                renderOption={(props, option, i) => {
                                    return (
                                        <li {...props} key={option.portId}>
                                            {option.portName+", "+option.country}
                                        </li>
                                    );
                                }}
                                getOptionLabel={(option: any) => { 
                                    if (option !== null && option !== undefined) {
                                        return option.portName+', '+option.country;
                                    }
                                    return ""; 
                                }}
                                value={portDestination}
                                sx={{ mt: 1 }}
                                renderInput={(params: any) => <TextField {...params} />}
                                onChange={(e: any, value: any) => { setPortDestination(value); }}
                                fullWidth
                            /> : <Skeleton />
                        }
                    </Grid>
                    <Grid item xs={12} md={2} mt={1} sx={{ display: "flex", alignItems: "end" }}>
                        <Button 
                            variant="contained" 
                            color="inherit"
                            startIcon={<SearchIcon />} 
                            size="large"
                            sx={{ backgroundColor: "#fff", color: "#333", textTransform: "none", mb: 0.15 }}
                            onClick={searchSeafreights}
                            fullWidth
                        >
                            {t('search')}
                        </Button>
                    </Grid>
                </Grid>
                {
                    !load ? 
                    <Grid container spacing={2} mt={1} px={5} sx={{ maxWidth: "xs" }}>
                        <Grid item xs={12}>
                            {
                                seafreights !== null && seafreights.length !== 0 ?
                                <Box sx={{ overflow: "auto", width: { xs: "calc(100vw - 80px)", md: "100%" } }}>
                                    {
                                        seafreights.map((item: any, i: number) => {
                                            return (
                                                <Accordion key={"seaf"+i} sx={{ border: 1, borderColor: "#e5e5e5" }}>
                                                    <AccordionSummary expandIcon={<ExpandMoreIcon />} aria-controls="panel1a-content" id="panel1a-header">
                                                        <Chip variant="outlined" label={item.departurePortName} sx={{ mr: 1 }} />
                                                        <Chip variant="outlined" label={item.destinationPortName} />
                                                        {/* <Typography>{t('from')} {item.departurePortName} {t('to')} {item.destinationPortName}</Typography> */}
                                                    </AccordionSummary>
                                                    <AccordionDetails>
                                                        <DataGrid
                                                            rows={item.suppliers}
                                                            columns={columnsSeafreights}
                                                            hideFooter
                                                            getRowId={(row: any) => row?.seaFreightId}
                                                            getRowHeight={() => "auto" }
                                                            sx={gridStyles}
                                                            disableRowSelectionOnClick
                                                        />
                                                    </AccordionDetails>
                                                </Accordion>
                                            )
                                        })
                                    }
                                </Box> : <Alert severity="warning">{t('noResults')}</Alert>
                            }
                        </Grid>
                    </Grid> : <Skeleton sx={{ mx: 5, mt: 3 }} />
                }
            </Box>
            <BootstrapDialog
                onClose={() => setModal(false)}
                aria-labelledby="custom-dialog-title"
                open={modal}
                maxWidth="sm"
                fullWidth
            >
                <BootstrapDialogTitle id="custom-dialog-title" onClose={() => setModal(false)}>
                    <b>{t('deleteRow')}</b>
                </BootstrapDialogTitle>
                <DialogContent dividers>{t('areYouSureDeleteRow')}</DialogContent>
                <DialogActions>
                    <Button variant="contained" color={"primary"} onClick={() => { deleteSeafreightPrice(currentId); }} sx={{ mr: 1.5, textTransform: "none" }}>{t('accept')}</Button>
                    <Button variant="contained" onClick={() => setModal(false)} sx={buttonCloseStyles}>{t('close')}</Button>
                </DialogActions>
            </BootstrapDialog>
            <BootstrapDialog
                onClose={() => setModal2(false)}
                aria-labelledby="custom-dialog-title2"
                open={modal2}
                maxWidth="lg"
                fullWidth
            >
                <BootstrapDialogTitle id="custom-dialog-title2" onClose={() => setModal2(false)}>
                    <b>{currentEditId === "" ? t('createRow') : t('editRow')}</b>
                </BootstrapDialogTitle>
                <DialogContent dividers>
                    {
                        loadEdit === false ?
                        <Grid container spacing={2}>
                            <Grid item xs={12} md={8}>
                                <Grid container spacing={2}>
                                    <Grid item xs={12} md={6} mt={0.25}>
                                        <InputLabel htmlFor="carrier" sx={inputLabelStyles}>{t('carrier')}</InputLabel>
                                        <CompanySearch id="carrier" value={carrier} onChange={setCarrier} category={CategoryEnum.SHIPPING_LINES} callBack={() => console.log(carrier)} fullWidth />
                                    </Grid>
                                    <Grid item xs={12} md={6} mt={0.25}>
                                        <InputLabel htmlFor="carrier-agent" sx={inputLabelStyles}>{t('carrierAgent')}</InputLabel>
                                        <CompanySearch id="carrier-agent" value={carrierAgent} onChange={setCarrierAgent} category={CategoryEnum.SHIPPING_LINES} callBack={() => console.log(carrierAgent)} fullWidth />
                                    </Grid>
                                    <Grid item xs={12} md={6} mt={0.25}>
                                        <InputLabel htmlFor="port-loading" sx={inputLabelStyles}>{t('departurePort')}</InputLabel>
                                        {
                                            ports !== null ?
                                            <Autocomplete
                                                disablePortal
                                                id="port-loading"
                                                options={ports}
                                                renderOption={(props, option, i) => {
                                                    return (
                                                        <li {...props} key={option.portId}>
                                                            {option.portName+", "+option.country}
                                                        </li>
                                                    );
                                                }}
                                                getOptionLabel={(option: any) => { 
                                                    if (option !== null && option !== undefined) {
                                                        return option.portName+', '+option.country;
                                                    }
                                                    return ""; 
                                                }}
                                                value={portLoading}
                                                sx={{ mt: 1 }}
                                                renderInput={(params: any) => <TextField {...params} />}
                                                onChange={(e: any, value: any) => { setPortLoading(value); }}
                                                fullWidth
                                            /> : <Skeleton />
                                        }
                                    </Grid>
                                    <Grid item xs={12} md={6} mt={0.25}>
                                        <InputLabel htmlFor="discharge-port" sx={inputLabelStyles}>{t('arrivalPort')}</InputLabel>
                                        {
                                            ports !== null ?
                                            <Autocomplete
                                                disablePortal
                                                id="discharge-port"
                                                options={ports}
                                                renderOption={(props, option, i) => {
                                                    return (
                                                        <li {...props} key={option.portId}>
                                                            {option.portName+", "+option.country}
                                                        </li>
                                                    );
                                                }}
                                                getOptionLabel={(option: any) => { 
                                                    if (option !== null && option !== undefined) {
                                                        return option.portName+', '+option.country;
                                                    }
                                                    return ""; 
                                                }}
                                                value={portDischarge}
                                                sx={{ mt: 1 }}
                                                renderInput={(params: any) => <TextField {...params} />}
                                                onChange={(e: any, value: any) => { setPortDischarge(value); }}
                                                fullWidth
                                            /> : <Skeleton />
                                        }
                                    </Grid>
                                </Grid>
                            </Grid>
                            <Grid item xs={12} md={4}>
                                <Grid container spacing={2}>
                                    <Grid item xs={12} md={12} mt={0}>
                                        <InputLabel htmlFor="comment" sx={inputLabelStyles}>{t('comment')}</InputLabel>
                                        <BootstrapInput id="comment" type="text" multiline rows={4.875} value={comment} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setComment(e.target.value)} fullWidth />
                                    </Grid>
                                </Grid>
                            </Grid>
                            <Grid item xs={12} md={3}>
                                <InputLabel htmlFor="valid-until" sx={inputLabelStyles}>{t('validUntil')}</InputLabel>
                                <LocalizationProvider dateAdapter={AdapterDayjs}>
                                    <DatePicker 
                                        value={validUntil}
                                        format="DD/MM/YYYY"
                                        onChange={(value: any) => { setValidUntil(value) }}
                                        slotProps={{ textField: { id: "valid-until", fullWidth: true, sx: datetimeStyles }, inputAdornment: { sx: { position: "relative", right: "11.5px" } } }}
                                    />
                                </LocalizationProvider>
                            </Grid>
                            <Grid item xs={12} md={3}>
                                <InputLabel htmlFor="currency" sx={inputLabelStyles}>{t('currency')}</InputLabel>
                                <NativeSelect
                                    id="currency"
                                    value={currency}
                                    onChange={(e: any) => { setCurrency(e.target.value) }}
                                    input={<BootstrapInput />}
                                    fullWidth
                                >
                                    {currencyOptions.map((elm: any, i: number) => (
                                        <option key={"currencyElm-"+i} value={elm.code}>{elm.label}</option>
                                    ))}
                                </NativeSelect>
                            </Grid>
                            <Grid item xs={12} md={3}>
                                <InputLabel htmlFor="transit-time" sx={inputLabelStyles}>{t('transitTime')} ({t('inDays')})</InputLabel>
                                <BootstrapInput id="transit-time" type="number" value={transitTime} onChange={(e: any) => setTransitTime(e.target.value)} fullWidth />
                            </Grid>
                            <Grid item xs={12} md={3}>
                                <InputLabel htmlFor="frequency" sx={inputLabelStyles}>{t('frequency')} ({t('everyxDays')})</InputLabel>
                                <BootstrapInput id="frequency" type="number" value={frequency} onChange={(e: any) => setFrequency(e.target.value)} fullWidth />
                            </Grid>
                            <Grid item xs={12} md={12}>
                                <Typography sx={{ fontSize: 18 }}><b>{t('listServices')}</b></Typography>
                            </Grid>
                            <Grid item xs={12} md={4}>
                                <InputLabel htmlFor="service-name" sx={inputLabelStyles}>{t('serviceName')}</InputLabel>
                                {
                                    services !== null ?
                                    <Autocomplete
                                        disablePortal
                                        id="service-name"
                                        options={services}
                                        renderOption={(props, option, i) => {
                                            return (
                                                <li {...props} key={option.portId}>
                                                    {option.serviceName}
                                                </li>
                                            );
                                        }}
                                        getOptionLabel={(option: any) => { 
                                            if (option !== null && option !== undefined) {
                                                return option.serviceName;
                                            }
                                            return ""; 
                                        }}
                                        value={serviceName}
                                        sx={{ mt: 1 }}
                                        renderInput={(params: any) => <TextField {...params} />}
                                        onChange={(e: any, value: any) => { setServiceName(value); }}
                                        fullWidth
                                    /> : <Skeleton />
                                }
                            </Grid>
                            <Grid item xs={12} md={4}>
                                <InputLabel htmlFor="container-types" sx={inputLabelStyles}>{t('containers')}</InputLabel>
                                {
                                    containers !== null ? 
                                    <Autocomplete
                                        multiple
                                        id="container-types"
                                        options={containers}
                                        getOptionLabel={(option: any) => option.packageName}
                                        value={containerTypes}
                                        onChange={(event: any, newValue: any) => {
                                            setContainerTypes(newValue);
                                        }}
                                        renderInput={(params: any) => <TextField {...params} sx={{ mt: 1, textTransform: "lowercase" }} />}
                                        fullWidth
                                    /> : <Skeleton />
                                }
                            </Grid>
                            <Grid item xs={12} md={2}>
                                <InputLabel htmlFor="price-cs" sx={inputLabelStyles}>{t('price')}</InputLabel>
                                <BootstrapInput id="price-cs" type="number" value={price} onChange={(e: any) => setPrice(e.target.value)} fullWidth />
                            </Grid>
                            <Grid item xs={12} md={2}>
                                <Button
                                    variant="contained" color="inherit" fullWidth sx={whiteButtonStyles} 
                                    style={{ marginTop: "30px", height: "42px", float: "right" }} 
                                    onClick={() => {
                                        if (serviceName !== null && containerTypes !== null && price > 0) {
                                            console.log(serviceName); console.log(containerTypes); console.log(price);
                                            setServicesSelection((prevItems: any) => [...prevItems, { 
                                                service: { serviceId: serviceName.serviceId, serviceName: serviceName.serviceName, price: Number(price) }, containers: containerTypes
                                            }]);
                                            setServiceName(null); setContainerTypes([]); setPrice(0);
                                        } 
                                        else {
                                            enqueueSnackbar(t('fieldNeedTobeFilled'), { variant: "error", anchorOrigin: { horizontal: "right", vertical: "top"} });
                                        }
                                    }} 
                                >
                                    {t('add')}
                                </Button>
                            </Grid>
                            <Grid item xs={12}>
                                {
                                    servicesSelection !== undefined && servicesSelection !== null && servicesSelection.length !== 0 ? 
                                        <Grid container spacing={2}>
                                            {
                                                servicesSelection.map((item: any, index: number) => (
                                                    <Grid key={"serviceitem1-"+index} item xs={12} md={6}>
                                                        <ListItem
                                                            sx={{ border: "1px solid #e5e5e5" }}
                                                            secondaryAction={
                                                                <IconButton edge="end" onClick={() => {
                                                                    setServicesSelection((prevItems: any) => prevItems.filter((item: any, i: number) => i !== index));
                                                                }}>
                                                                    <DeleteIcon />
                                                                </IconButton>
                                                            }
                                                        >
                                                            <ListItemText primary={
                                                                t('serviceName')+" : "+item.service.serviceName+" | "+t('containers')+" : "+item.containers.map((elm: any) => elm.packageName).join(", ")+" | "+t('price')+" : "+item.service.price+" "+currency
                                                            } />
                                                        </ListItem>
                                                    </Grid>
                                                ))
                                            }
                                        </Grid>
                                    : null  
                                }
                            </Grid>
                        </Grid> : <Skeleton />
                    }
                </DialogContent>
                <DialogActions>
                    <Button variant="contained" color={"primary"} onClick={() => { createUpdateSeafreight(); }} sx={{ mr: 1.5, textTransform: "none" }}>{t('validate')}</Button>
                    <Button variant="contained" onClick={() => setModal2(false)} sx={buttonCloseStyles}>{t('close')}</Button>
                </DialogActions>
            </BootstrapDialog>
        </div>
    );
}

export default Seafreights;
