import { useState, useEffect } from 'react';
import { Accordion, AccordionDetails, AccordionSummary, Alert, Autocomplete, Box, Button, DialogActions, DialogContent, FormControlLabel, Grid, IconButton, InputLabel, ListItem, ListItemText, NativeSelect, Skeleton, Switch, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField, Typography } from '@mui/material';
import Chip from '@mui/material/Chip';
import AddCircleOutlinedIcon from '@mui/icons-material/AddCircleOutlined';
import SearchIcon from '@mui/icons-material/Search';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { SnackbarProvider, enqueueSnackbar } from 'notistack';
import { useTranslation } from 'react-i18next';
import { useAuthorizedBackendApi } from '../api/api';
import { crmRequest, pricingRequest, protectedResources, transportRequest } from '../config/authConfig';
import { BackendService } from '../utils/services/fetch';
import { GridColDef, GridValueFormatterParams, GridRenderCellParams, DataGrid } from '@mui/x-data-grid';
import { BootstrapDialog, BootstrapDialogTitle, BootstrapInput, actionButtonStyles, buttonCloseStyles, datetimeStyles, gridStyles, inputIconStyles, inputLabelStyles, whiteButtonStyles } from '../utils/misc/styles';
import CompanySearch from '../components/shared/CompanySearch';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import dayjs, { Dayjs } from 'dayjs';
import { AuthenticationResult } from '@azure/msal-browser';
import { useMsal, useAccount } from '@azure/msal-react';
import { CategoryEnum, containerPackages } from '../utils/constants';
import RequestPriceRequest from '../components/editRequestPage/RequestPriceRequest';
import { Anchor, FileCopy, Mail } from '@mui/icons-material';
import NewContact from '../components/editRequestPage/NewContact';
import ServicesTable from '../components/seafreightPage/ServicesTable';
import { transformArray, reverseTransformArray, flattenData, flattenData2, compareServices, sortSuppliersByCarrierAgentName, getAccessToken } from '../utils/functions';
import NewService from '../components/shared/NewService';
import NewPort from '../components/shared/NewPort';

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
    const [loadMiscs, setLoadMiscs] = useState<boolean>(false);
    const [modal, setModal] = useState<boolean>(false);
    const [modal2, setModal2] = useState<boolean>(false);
    const [modal6, setModal6] = useState<boolean>(false);
    const [modal7, setModal7] = useState<boolean>(false);
    const [modal8, setModal8] = useState<boolean>(false);
    const [modal9, setModal9] = useState<boolean>(false);
    const [ports, setPorts] = useState<any>(null);
    const [products, setProducts] = useState<any>(null);
    const [clients, setClients] = useState<any>(null);
    const [containers, setContainers] = useState<any>(null);
    const [services, setServices] = useState<any>(null);
    const [allServices, setAllServices] = useState<any>(null);
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
    const [containerTypes, setContainerTypes] = useState<any>(null);
    // const [containerTypes, setContainerTypes] = useState<any>({packageId: 8, packageName: "20' Dry"});
    const [servicesData, setServicesData] = useState<any>([]);
    // const [servicesData2, setServicesData2] = useState<any>([]);
    // const [miscellaneousId, setMiscellaneousId] = useState<string>("");
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
                    <IconButton size="small" title={t('editRowSeafreight')} sx={{ mr: 0.5 }} onClick={() => { setCurrentEditId(params.row.seaFreightId); resetForm(); getSeafreight(params.row.seaFreightId, false); setModal2(true); }}>
                        <EditIcon fontSize="small" />
                    </IconButton>
                    <IconButton size="small" title={t('copyRowSeafreight')} onClick={() => { setContainerTypes(null); setCurrentEditId(""); resetForm(); getSeafreight(params.row.seaFreightId, true); setModal2(true); /*copySeafreightById(params.row.seaFreightId);*/ }}>
                        <FileCopy fontSize="small" />
                    </IconButton>
                    <IconButton size="small" title={t('deleteRowSeafreight')} onClick={() => { setCurrentId(params.row.seaFreightId); setModal(true); }}>
                        <DeleteIcon fontSize="small" />
                    </IconButton>
                </Box>
            );
        }, minWidth: 120, flex: 0.8 },
    ];
    
    useEffect(() => {
        getClients();
        getProducts();
        getPorts();
        getSeafreights();
        getProtectedData(); // Services and Containers
        // getMiscellaneouses();
    }, []);

    // useEffect(() => {
    //     getMiscellaneousesById(miscellaneousId);
    // }, [miscellaneousId]);
    
    const getProducts = async () => {
        if (account && instance) {
            const token = await getAccessToken(instance, transportRequest, account);
            const response = await (context as BackendService<any>).getWithToken(protectedResources.apiLisTransport.endPoint+"/Product?pageSize=500", token);
            if (response !== null && response !== undefined) {
                setProducts(response);
            }  
        }
    }
    
    const getClients = async () => {
        if (account && instance) {
            const token = await getAccessToken(instance, crmRequest, account);
            
            try {
                const response = await (context as BackendService<any>).getWithToken(protectedResources.apiLisCrm.endPoint+"/Contact/GetContacts?category=5&pageSize=1000", token);
                if (response !== null && response !== undefined) {
                    // Removing duplicates from client array
                    setClients(response.data.filter((obj: any, index: number, self: any) => index === self.findIndex((o: any) => o.contactName === obj.contactName)));
                }
            }
            catch (err: any) {
                console.log(err);
            }
        }
    }
    
    const getPorts = async () => {
        if (account && instance) {
            const response = await (context as BackendService<any>).getSingle(protectedResources.apiLisTransport.endPoint+"/Port/Ports?pageSize=2000");
            if (response !== null && response !== undefined) {
                setPorts(response);
            }  
        }
    }
    
    const getProtectedData = async () => {
        if (account && instance) {
            const token = await getAccessToken(instance, transportRequest, account);
            getServices(token);
            getContainers(token);
        }
    }

    const getServices = async (token: string) => {
        if (account && instance) {
            const response = await (context as BackendService<any>).getWithToken(protectedResources.apiLisTransport.endPoint+"/Service?pageSize=500", token);
            if (response !== null && response !== undefined) {
                console.log(response.sort((a: any, b: any) => b.serviceName - a.serviceName));
                setAllServices(response);
                setServices(response.sort((a: any, b: any) => compareServices(a, b)).filter((obj: any) => obj.servicesTypeId.includes(1))); // Filter the services for seafreights (SEAFREIGHT = 1)
            }  
        }
    }
    
    const getContainers = async (token: string) => {
        setContainers(containerPackages);
    }
    
    const getSeafreights = async () => {
        if (account && instance) {
            const token = await getAccessToken(instance, pricingRequest, account);
            setTempToken(token);
            
            const response = await (context as BackendService<any>).getWithToken(protectedResources.apiLisPricing.endPoint+"/SeaFreight/GetSeaFreights", token);
            if (response !== null && response !== undefined) {
                setSeafreights(sortSuppliersByCarrierAgentName(response));
                setLoad(false);
            }
            else {
                setLoad(false);
            }
        }
    }
    
    const deflattenData = (flattenedData: any) => {
        return flattenedData.map((item: any) => ({
            seaFreightServiceId: item.id,
            service: {
                serviceId: item.serviceId, // Original structure did not include this in the flattened data
                serviceName: item.serviceName,
                price: item.price,
                containers: item.containers // Assuming this was not included in the flattened version
            },
            containers: [containerTypes]
        }));
    };

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
        setServicesData([]);
        // setServicesData2([]);
        // setMiscellaneousId("");
    }
    
    const getSeafreight = async (id: string, isCopy: boolean) => {
        setLoadEdit(true)
        if (account && instance) {
            const response = await (context as BackendService<any>).getWithToken(protectedResources.apiLisPricing.endPoint+"/SeaFreight/SeaFreight?seaFreightId="+id, tempToken);
            if (response !== null && response !== undefined) {
                var auxCarrier = {contactId: response.carrierId, contactName: response.carrierName};
                var auxLoading = ports.find((elm: any) => elm.portId === response.departurePortId);
                var auxDischarge = ports.find((elm: any) => elm.portId === response.destinationPortId);
                var auxValidUntil = dayjs(response.validUntil);
                
                setCarrier(auxCarrier);
                setCarrierAgent({contactId: response.carrierAgentId, contactName: response.carrierAgentName});
                setPortLoading(auxLoading);
                setPortDischarge(auxDischarge);
                setCurrency(response.currency);
                setValidUntil(auxValidUntil);
                setTransitTime(response.transitTime);
                setFrequency(response.frequency);
                setComment(response.comment);
                // setServicesSelection(response.services);
                setLoadEdit(false);

                // To edit later, bad coding practice
                setServicesData(flattenData(response.services));
                
                // Initialize the container
                if (response.services.length !== 0 && isCopy === false) {
                    setContainerTypes(response.services[0].containers[0]);
                }

                // Now i get the miscs
                getMiscellaneouses(auxCarrier, auxLoading, auxDischarge, auxValidUntil, response.services[0].containers[0], isCopy);
            }
            else {
                setLoadEdit(false);
            }
        }
    }
    
    const searchSeafreights = async () => {
        if (account && instance) {
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
        }
    }

    const createUpdateSeafreight = async () => {
        if (servicesData.length !== 0 && portLoading !== null && portDischarge !== null && carrier !== null && carrierAgent !== null && frequency !== 0 && transitTime !== 0 && validUntil !== null) {
            if (account && instance) {
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
                        "containers": transformArray(deflattenData(servicesData)),
                        "services": deflattenData(servicesData),
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
                        "containers": transformArray(deflattenData(servicesData)),
                        "services": deflattenData(servicesData),
                        "updated": (new Date()).toISOString()
                    };    
                }
                console.log(dataSent);
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
        if (account && instance) {
            const response = await (context as BackendService<any>).deleteWithToken(protectedResources.apiLisPricing.endPoint+"/SeaFreight/DeleteSeaFreightPrice?id="+id, tempToken);
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

    const getMiscellaneouses = async (carrier1: any, portLoading1: any, portDischarge1: any, validUntil1: any, container: any, isCopy: boolean) => {
        if (account && instance) {
            setLoadMiscs(true);
            
            var token = null;
            if (tempToken === "") {
                token = await getAccessToken(instance, pricingRequest, account);
                setTempToken(token);    
            }

            if (carrier1 !== null && portLoading1 !== null && portDischarge1 !== null) {
                const response = await (context as BackendService<any>).getWithToken(protectedResources.apiLisPricing.endPoint+"/Miscellaneous/Miscellaneous?SupplierId="+carrier1.contactId+"&DeparturePortId="+portLoading1.portId+"&DestinationPortId="+portDischarge1.portId+"&withShipment=true", token !== null ? token : tempToken);
                if (response !== null && response !== undefined && response.length !== 0) {
                    // Here i check if the result is good
                    // console.log(container);
                    var selectedElement = response[0].suppliers.find((elm: any) => elm.containers.length !== 0 ? elm.containers[0].container.packageName === container.packageName : null);
                    if (response.length !== 0 && selectedElement !== undefined) {
                        setLoadMiscs(false);
                        
                        // Dont update the miscellaneousId is it's a new price
                        // if (!isCopy) {
                        //     setMiscellaneousId(selectedElement.miscellaneousId);
                        // }
                        // setServicesData2(flattenData2(reverseTransformArray(selectedElement.containers).filter((elm: any) => elm.containers[0].packageName === container.packageName)));
                    }
                    else {
                        setLoadMiscs(false);
                    }
                }
                else {
                    setLoadMiscs(false);
                }
            }
        }
        else {
            setLoadMiscs(false)
        }
    }
    
    function findPricingOffer(offers: any, carrierId: string, departurePort: string, destinationPort: string, containerType: string) {
        // Map containerType to the key used in the offer objects
        const containerTypeKeyMap: any = {
            "20' Dry": "total20Dry",
            "40' Dry": "total40Dry",
            "40' HC RF": "total20HCRF",
            "40' HC": "total40HC",
            "20' RF": "total20RF"
        };
    
        const containerKey = containerTypeKeyMap[containerType];
        if (!containerKey) {
            return null;
        }
    
        // Iterate through the offers to find a match
        for (const offer of offers) {
            if (offer.departurePortName === departurePort && offer.destinationPortName === destinationPort) {
                for (const supplier of offer.suppliers) {
                    if (supplier.carrierAgentName === carrierId && supplier[containerKey] > 0) {
                        return supplier;
                    }
                }
            }
        }
    
        return null;
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
                        <Button variant="contained" sx={actionButtonStyles} onClick={() => { setModal6(true); }}>
                            {t('requestSeafreightPrice')} <Mail sx={{ ml: 0.5, pb: 0.25, justifyContent: "center", alignItems: "center" }} fontSize="small" />
                        </Button>
                        <Button variant="contained" color="inherit" sx={{ float: "right", backgroundColor: "#fff", textTransform: "none" }} onClick={() => { setModal7(true); }} >{t('createNewCarrier')}</Button>
                    </Grid>
                    <Grid item xs={12} md={4} mt={1}>
                        <InputLabel htmlFor="company-name" sx={inputLabelStyles}>{t('carrier')}</InputLabel>
                        <CompanySearch id="company-name" value={searchedCarrier} onChange={setSearchedCarrier} category={CategoryEnum.SHIPPING_LINES} fullWidth />
                    </Grid>
                    <Grid item xs={12} md={3} mt={1}>
                        <InputLabel htmlFor="port-departure" sx={inputLabelStyles}><Anchor fontSize="small" sx={inputIconStyles} /> {t('departurePort')}</InputLabel>
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
                        <InputLabel htmlFor="destination-port" sx={inputLabelStyles}><Anchor fontSize="small" sx={inputIconStyles} /> {t('arrivalPort')}</InputLabel>
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
            <BootstrapDialog open={modal} onClose={() => setModal(false)} maxWidth="sm" fullWidth>
                <BootstrapDialogTitle id="custom-dialog-title" onClose={() => setModal(false)}>
                    <b>{t('deleteRowSeafreight')}</b>
                </BootstrapDialogTitle>
                <DialogContent dividers>{t('areYouSureDeleteRow')}</DialogContent>
                <DialogActions>
                    <Button variant="contained" color={"primary"} onClick={() => { deleteSeafreightPrice(currentId); }} sx={{ mr: 1.5, textTransform: "none" }}>{t('accept')}</Button>
                    <Button variant="contained" onClick={() => setModal(false)} sx={buttonCloseStyles}>{t('close')}</Button>
                </DialogActions>
            </BootstrapDialog>
            <BootstrapDialog open={modal2} onClose={() => setModal2(false)} maxWidth="lg" fullWidth>
                <BootstrapDialogTitle id="custom-dialog-title2" onClose={() => setModal2(false)}>
                    <b>{currentEditId === "" ? t('createRowSeafreight') : t('editRowSeafreight')}</b>
                </BootstrapDialogTitle>
                <DialogContent dividers>
                    {
                        loadEdit === false ?
                        <Grid container spacing={2}>
                            <Grid item xs={12} md={8}>
                                <Typography sx={{ fontSize: 18, mb: 1 }}><b>Seafreight price information</b></Typography>
                            </Grid>
                            <Grid item xs={12} md={4}>
                                <Button variant="contained" color="inherit" sx={{ float: "right", backgroundColor: "#fff", textTransform: "none" }} onClick={() => { setModal7(true); }} >{t('createNewCarrier')}</Button>
                            </Grid> 
                            <Grid item xs={12} md={8}>
                                <Grid container spacing={2}>
                                    <Grid item xs={12} md={6} mt={0.25}>
                                        <InputLabel htmlFor="carrier" sx={inputLabelStyles}>{t('carrier')}</InputLabel>
                                        <CompanySearch id="carrier" value={carrier} onChange={setCarrier} category={CategoryEnum.SHIPPING_LINES} fullWidth />
                                    </Grid>
                                    <Grid item xs={12} md={6} mt={0.25}>
                                        <InputLabel htmlFor="carrier-agent" sx={inputLabelStyles}>{t('carrierAgent')}</InputLabel>
                                        <CompanySearch id="carrier-agent" value={carrierAgent} onChange={setCarrierAgent} category={CategoryEnum.SHIPPING_LINES} fullWidth />
                                    </Grid>
                                    <Grid item xs={12} md={6} mt={0.25}>
                                        <InputLabel htmlFor="port-loading" sx={inputLabelStyles}><Anchor fontSize="small" sx={inputIconStyles} /> {t('departurePort')}</InputLabel>
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
                                        <InputLabel htmlFor="discharge-port" sx={inputLabelStyles}><Anchor fontSize="small" sx={inputIconStyles} /> {t('arrivalPort')}</InputLabel>
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
                            <Grid item xs={12} md={2}>
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
                            <Grid item xs={12} md={2}>
                                <InputLabel htmlFor="transit-time" sx={inputLabelStyles}>{t('transitTime')} ({t('inDays')})</InputLabel>
                                <BootstrapInput id="transit-time" type="number" value={transitTime} onChange={(e: any) => setTransitTime(e.target.value)} fullWidth />
                            </Grid>
                            <Grid item xs={12} md={2}>
                                <InputLabel htmlFor="frequency" sx={inputLabelStyles}>{t('frequency')} ({t('everyxDays')})</InputLabel>
                                <BootstrapInput id="frequency" type="number" value={frequency} onChange={(e: any) => setFrequency(e.target.value)} fullWidth />
                            </Grid>
                            <Grid item xs={12} md={3}>
                                <InputLabel htmlFor="container-types" sx={inputLabelStyles}>{t('container')}</InputLabel>
                                {
                                    containers !== null ? 
                                    <Autocomplete
                                        id="container-types"
                                        options={containers}
                                        getOptionLabel={(option: any) => option.packageName}
                                        value={containerTypes}
                                        onChange={(event: any, newValue: any) => {
                                            setContainerTypes(newValue);
                                        }}
                                        // isOptionEqualToValue={(option: any, value: any) => true}
                                        disabled={currentEditId !== ""}
                                        renderInput={(params: any) => <TextField {...params} sx={{ mt: 1, textTransform: "lowercase" }} />}
                                        fullWidth
                                    /> : <Skeleton />
                                }
                            </Grid>
                            <Grid item xs={12} md={8}>
                                <Typography sx={{ fontSize: 18, mb: 1 }}><b>{t('listServices')} - {t('seafreights')}</b></Typography>
                            </Grid>
                            <Grid item xs={12} md={4}>
                                <Button 
                                    variant="contained" color="inherit" 
                                    sx={{ float: "right", backgroundColor: "#fff", textTransform: "none" }} 
                                    onClick={() => { setModal8(true); }}
                                >
                                    Create new service
                                </Button>
                                <Button 
                                    variant="contained" color="inherit" 
                                    sx={{ float: "right", backgroundColor: "#fff", textTransform: "none", mr: 1 }} 
                                    onClick={() => { setModal9(true); }}
                                >
                                    Create new port
                                </Button>
                            </Grid> 
                            <Grid item xs={12}>
                                {
                                    allServices !== null && allServices !== undefined && allServices.length !== 0 ?
                                    <ServicesTable 
                                        services={servicesData} 
                                        setServices={setServicesData}
                                        allServices={allServices}
                                        type="Seafreight"
                                        container={containerTypes}
                                        currency={currency}
                                        servicesOptions={allServices.filter((obj: any) => obj.servicesTypeId.includes(1)).map((elm: any) => elm.serviceName)}
                                    /> : null
                                }
                            </Grid>
                        </Grid> : <Skeleton />
                    }
                </DialogContent>
                <DialogActions>
                    <Button 
                        variant="contained" color={"primary"}
                        onClick={() => { 
                            if (containerTypes !== null && containerTypes !== undefined) {
                                // Now i check if there is already a price for this seafreight
                                if (currentEditId !== "") {
                                    createUpdateSeafreight();
                                }
                                else {
                                    if (carrier !== null && carrierAgent !== null && portLoading !== null && portDischarge !== null) {
                                        if (findPricingOffer(seafreights, carrierAgent.contactName, portLoading.portName, portDischarge.portName, containerTypes.packageName) === null) {
                                            createUpdateSeafreight(); 
                                        }
                                        else {
                                            enqueueSnackbar("A similar pricing already exists, change the container type!", { variant: "warning", anchorOrigin: { horizontal: "right", vertical: "top"} });
                                        }
                                    }
                                    else {
                                        enqueueSnackbar("You need to fill the fields carrier, agent, departure and destination ports!", { variant: "warning", anchorOrigin: { horizontal: "right", vertical: "top"} });
                                    }
                                }
                            }
                            else {
                                enqueueSnackbar("You need to select a container type!", { variant: "warning", anchorOrigin: { horizontal: "right", vertical: "top"} });
                            }
                        }} 
                        sx={{ mr: 1.5, textTransform: "none" }}
                    >{t('validate')}</Button>
                    <Button variant="contained" onClick={() => setModal2(false)} sx={buttonCloseStyles}>{t('close')}</Button>
                </DialogActions>
            </BootstrapDialog>

            {/* Price request seafreight FCL */}
            <BootstrapDialog open={modal6} onClose={() => setModal6(false)} maxWidth="lg" fullWidth>
                {
                    products !== null ?
                    <RequestPriceRequest 
                        token={tempToken} 
                        products={products} 
                        commodities={[]}
                        ports={ports}
                        portLoading={null}
                        portDischarge={null} 
                        containers={containers} 
                        containersSelection={[]}
                        closeModal={() => setModal6(false)} 
                    /> : <Skeleton />
                }
            </BootstrapDialog>

            {/* Add a new contact - carrier */}
            <BootstrapDialog open={modal7} onClose={() => setModal7(false)} maxWidth="md" fullWidth>
                <NewContact categories={["SHIPPING_LINES"]} closeModal={() => setModal7(false)} callBack={getClients} />
            </BootstrapDialog>

            {/* Create new service */}
            <BootstrapDialog open={modal8} onClose={() => setModal8(false)} maxWidth="md" fullWidth>
                <NewService closeModal={() => setModal8(false)} callBack={getServices} />
            </BootstrapDialog>

            {/* Create new port */}
            <BootstrapDialog open={modal9} onClose={() => setModal9(false)} maxWidth="md" fullWidth>
                <NewPort closeModal={() => setModal9(false)} callBack={getPorts} />
            </BootstrapDialog>
        </div>
    );
}

export default Seafreights;
