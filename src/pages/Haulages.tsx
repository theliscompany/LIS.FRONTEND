import { useState, useEffect } from 'react';
import { Accordion, AccordionDetails, AccordionSummary, Alert, Autocomplete, Box, Button, Chip, DialogActions, DialogContent, Grid, IconButton, InputLabel, NativeSelect, Skeleton, TextField, Typography } from '@mui/material';
import AddCircleOutlinedIcon from '@mui/icons-material/AddCircleOutlined';
import SearchIcon from '@mui/icons-material/Search';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { SnackbarProvider, enqueueSnackbar } from 'notistack';
import { useTranslation } from 'react-i18next';
import { useAuthorizedBackendApi } from '../api/api';
import { protectedResources } from '../config/authConfig';
import { BackendService } from '../utils/services/fetch';
import { GridColDef, GridValueFormatterParams, GridRenderCellParams, DataGrid, GridValueGetterParams, GridColumnHeaderParams } from '@mui/x-data-grid';
import { BootstrapDialog, BootstrapDialogTitle, BootstrapInput, actionButtonStyles, buttonCloseStyles, datetimeStyles, gridStyles, inputIconStyles, inputLabelStyles } from '../utils/misc/styles';
import CompanySearch from '../components/shared/CompanySearch';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import dayjs, { Dayjs } from 'dayjs';
import { useMsal, useAccount } from '@azure/msal-react';
import { CategoryEnum, containerPackages, currencyOptions, haulageTypeOptions } from '../utils/constants';
import AutocompleteSearch from '../components/shared/AutocompleteSearch';
import RequestPriceHaulage from '../components/editRequestPage/RequestPriceHaulage';
import { Anchor, Mail } from '@mui/icons-material';
import NewContact from '../components/editRequestPage/NewContact';
import { compareServices, extractCityAndPostalCode, parseLocation2, sortHauliersByName } from '../utils/functions';
import NewService from '../components/shared/NewService';
import NewPort from '../components/shared/NewPort';

function createGetRequestUrl(variable1: number, variable2: number, variable3: string) {
    let url = protectedResources.apiLisPricing.endPoint+"/Haulage/Haulages?";
    if (variable1) {
      url += 'LoadingPortId=' + encodeURIComponent(variable1) + '&';
    }
    if (variable2) {
      url += 'HaulierId=' + encodeURIComponent(variable2) + '&';
    }
    if (variable3) {
        url += 'LoadingCity=' + encodeURIComponent(variable3) + '&';
    }
    // if (variable3) {
    //   url += 'CarrierAgentId=' + encodeURIComponent(variable3) + '&';
    // }
    
    if (url.slice(-1) === '&') {
      url = url.slice(0, -1);
    }
    return url;
}

function Haulages() {
    const [load, setLoad] = useState<boolean>(true);
    const [loadEdit, setLoadEdit] = useState<boolean>(false);
    const [modal, setModal] = useState<boolean>(false);
    const [modal2, setModal2] = useState<boolean>(false);
    const [modal5, setModal5] = useState<boolean>(false);
    const [modal7, setModal7] = useState<boolean>(false);
    const [modal8, setModal8] = useState<boolean>(false);
    const [modal9, setModal9] = useState<boolean>(false);
    const [ports, setPorts] = useState<any>(null);
    const [clients, setClients] = useState<any>(null);
    const [containers, setContainers] = useState<any>(null);

    const [currentId, setCurrentId] = useState<string>("");
    const [currentEditId, setCurrentEditId] = useState<string>("");
    const [haulages, setHaulages] = useState<any>(null);
    
    const [searchedHaulier, setSearchedHaulier] = useState<any>(null);
    const [searchedLoadingCity, setSearchedLoadingCity] = useState<any>(null);
    const [searchedLoadingPort, setSearchedLoadingPort] = useState<any>(null);
    
    const [haulier, setHaulier] = useState<any>(null);
    const [loadingCity, setLoadingCity] = useState<any>(null);
    const [loadingPort, setLoadingPort] = useState<any>(null);
    const [freeTime, setFreeTime] = useState<number>(0);
    const [multiStop, setMultiStop] = useState<number>(0);
    const [unitTariff, setUnitTariff] = useState<number>(0);
    const [overtimeTariff, setOvertimeTariff] = useState<number>(0);
    const [validUntil, setValidUntil] = useState<Dayjs | null>(null);
    const [currency, setCurrency] = useState<string>("EUR");
    const [haulageType, setHaulageType] = useState<string>("On trailer, direct loading");
    const [emptyPickupDepot, setEmptyPickupDepot] = useState<string>("");
    const [containerTypes, setContainerTypes] = useState<any>([]);
    const [comment, setComment] = useState<string>("");

    const [servicesData2, setServicesData2] = useState<any>([]);
    const [miscellaneousId, setMiscellaneousId] = useState<string>("");
    const [allServices, setAllServices] = useState<any>(null);
    const [services, setServices] = useState<any>(null);

    const { t } = useTranslation();
    
    const { instance, accounts } = useMsal();
    const account = useAccount(accounts[0] || {});
    const context = useAuthorizedBackendApi();
    
    const columnsHaulages: GridColDef[] = [
        { field: 'haulierName', headerName: t('haulier'), minWidth: 125, flex: 1.4 },
        { field: 'unitTariff', headerName: t('unitTariff'), valueGetter: (params: GridValueGetterParams) => `${params.row.unitTariff || ''} ${t(params.row.currency)}`, renderHeader: (params: GridColumnHeaderParams) => (<>Haulage <br />per unit</>), minWidth: 100, flex: 0.75 },
        { field: 'freeTime', headerName: t('freeTime'), valueFormatter: (params: GridValueFormatterParams) => `${params.value || ''} ${t('hours')}`, minWidth: 100, flex: 0.75 },
        { field: 'overtimeTariff', headerName: t('overtimeTariff'), valueGetter: (params: GridValueGetterParams) => `${params.row.overtimeTariff || ''} ${t(params.row.currency)} / ${t('hour')}`, renderHeader: (params: GridColumnHeaderParams) => (<>Overtime <br />tariff</>), minWidth: 100, flex: 1 },
        { field: 'multiStop', headerName: t('multiStop'), valueGetter: (params: GridValueGetterParams) => `${params.row.multiStop || ''} ${t(params.row.currency)}`, minWidth: 100, flex: 0.75 },
        { field: 'containersType', headerName: t('containers'), renderCell: (params: GridRenderCellParams) => {
            return (
                <Box sx={{ my: 2 }}>{params.row.containersType.join(", ")}</Box>
            );
        }, minWidth: 100, flex: 1 },
        { field: 'validUntil', headerName: t('validUntil'), renderCell: (params: GridRenderCellParams) => {
            return (
                <Box sx={{ my: 1, mr: 1 }}>
                    <Chip label={(new Date(params.row.validUntil)).toLocaleDateString().slice(0,10)} color={(new Date()).getTime() - (new Date(params.row.validUntil)).getTime() > 0 ? "warning" : "success"}></Chip>
                </Box>
            );
        }, minWidth: 100, flex: 0.75 },
        { field: 'created', headerName: t('created'), renderCell: (params: GridRenderCellParams) => {
            return (
                <Box sx={{ my: 1, mr: 1 }}>
                    <Chip label={(new Date(params.row.created)).toLocaleDateString().slice(0,10)} color={(new Date()).getTime() - (new Date(params.row.created)).getTime() > 0 ? "default" : "default"}></Chip>
                </Box>
            );
        }, minWidth: 100, flex: 0.75 },
        { field: 'xxx', headerName: t('Actions'), renderCell: (params: GridRenderCellParams) => {
            return (
                <Box sx={{ my: 1, mr: 1 }}>
                    <IconButton size="small" title={t('editRowHaulage')} sx={{ mr: 0.5 }} onClick={() => { setCurrentEditId(params.row.id); setContainerTypes(null); resetForm(); getHaulage(params.row.id); setModal2(true); }}>
                        <EditIcon fontSize="small" />
                    </IconButton>
                    <IconButton size="small" title={t('deleteRowHaulage')} onClick={() => { setCurrentId(params.row.id); setModal(true); }}>
                        <DeleteIcon fontSize="small" />
                    </IconButton>
                </Box>
            );
        }, minWidth: 120, flex: 0.5 },
    ];
    
    useEffect(() => {
        // getClients();
        getPorts();
        getHaulages();
        getProtectedData();
    }, [account, instance, account]);
    
    const getClients = async () => {
        if (account && instance && context) {
            // const token = await getAccessToken(instance, crmRequest, account);
            
            try {
                const response = await (context?.service as BackendService<any>).getWithToken(protectedResources.apiLisCrm.endPoint+"/Contact/GetContacts?category=2&pageSize=1000", context.tokenCrm);
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
        if (account && instance && context) {
            const response = await (context?.service as BackendService<any>).getSingle(protectedResources.apiLisTransport.endPoint+"/Port/Ports?pageSize=2000");
            if (response !== null && response !== undefined) {
                setPorts(response);
            }  
        }
    }
    
    const getProtectedData = async () => {
        if (account && instance && context) {
            // const token = await getAccessToken(instance, transportRequest, account);
            
            getServices("");
            getContainers("");
        }
    }
    
    const getServices = async (token: string) => {
        if (account && instance && context) {
            const response = await (context?.service as BackendService<any>).getWithToken(protectedResources.apiLisTransport.endPoint+"/Service?pageSize=500", context.tokenTransport);
            if (response !== null && response !== undefined) {
                setAllServices(response);
                setServices(response.sort((a: any, b: any) => compareServices(a, b)).filter((obj: any) => obj.servicesTypeId.includes(2))); // Filter the services for haulages (HAULAGE = 2)
            }  
        }
    }
    
    const getContainers = async (token: string) => {
        setContainers(containerPackages);
    }
    
    const getHaulages = async () => {
        if (account && instance && context) {
            // const token = await getAccessToken(instance, pricingRequest, account);
            // setTempToken(token);

            const response = await (context?.service as BackendService<any>).getWithToken(protectedResources.apiLisPricing.endPoint+"/Haulage/Haulages", context.tokenPricing);
            if (response !== null && response !== undefined) {
                setHaulages(sortHauliersByName(response));
                setLoad(false);
            }
            else {
                setLoad(false);
            }
            console.log(response);
        }
    }
    
    const resetForm = () => {
        setHaulier(null);
        setLoadingCity(null);
        setLoadingPort(null);
        setCurrency("EUR");
        setValidUntil(null);
        setFreeTime(0);
        setMultiStop(0);
        setUnitTariff(0);
        setOvertimeTariff(0);
        setHaulageType("On trailer, direct loading");
        setEmptyPickupDepot("");
        setComment("");
        setContainerTypes([]);
        setServicesData2([]);
        setMiscellaneousId("");
    }
    
    const getHaulage = async (id: string) => {
        setLoadEdit(true)
        if (account && instance && context) {
            const response = await (context?.service as BackendService<any>).getWithToken(protectedResources.apiLisPricing.endPoint+"/Haulage/Haulage?offerId="+id, context.tokenPricing);
            if (response !== null && response !== undefined) {
                var auxHaulier = {contactId: response.haulierId, contactName: response.haulierName};
                var auxValidUntil = dayjs(response.validUntil);
                var auxCity = parseLocation2(response.loadingCity);
                var auxPort = ports.find((elm: any) => elm.portId === response.loadingPortId);

                setHaulier(auxHaulier);
                setLoadingCity(auxCity);
                setLoadingPort(auxPort);
                setCurrency(response.currency);
                setValidUntil(dayjs(response.validUntil));
                setFreeTime(response.freeTime);
                setMultiStop(response.multiStop);
                setUnitTariff(response.unitTariff);
                setOvertimeTariff(response.overtimeTariff);
                setHaulageType(response.haulageType);
                setEmptyPickupDepot(response.emptyPickupDepot);
                setComment(response.comment);
                setContainerTypes(response.containers);
                setLoadEdit(false);

                // Now i get the miscs
                // getMiscellaneouses(auxHaulier, auxCity, auxPort, auxValidUntil, response.containers[0], false);
            }
            else {
                setLoadEdit(false);
            }
            // console.log(response);
        }
    }
    
    const searchHaulages = async () => {
        if (account && instance && context) {
            setLoad(true);
            var requestFormatted = createGetRequestUrl(searchedLoadingPort?.portId, searchedHaulier?.contactId, searchedLoadingCity?.city.toUpperCase());
            const response = await (context?.service as BackendService<any>).getWithToken(requestFormatted, context.tokenPricing);
            if (response !== null && response !== undefined) {
                setHaulages(response);
                setLoad(false);
            }
            else {
                setLoad(false);
            }
        }
    }

    const createUpdateHaulage = async () => {
        if (haulier !== null && loadingCity !== null && loadingPort !== null && freeTime > 0 && unitTariff > 0 && overtimeTariff > 0 && multiStop > 0 && validUntil !== null && containerTypes.length > 0) {
            if (account && instance && context) {
                var dataSent = null;
                
                var postalCode = loadingCity !== null ? loadingCity.postalCode !== undefined ? loadingCity.postalCode : "" : ""; 
                var city = loadingCity !== null ? loadingCity.city.toUpperCase()+', '+loadingCity.country.toUpperCase() : "";
                if (postalCode !== "") {
                    if (postalCode === null) {
                        city = loadingCity.city.toUpperCase()+', '+loadingCity.country.toUpperCase();
                    }
                    else {
                        city = loadingCity.city.toUpperCase()+', '+loadingCity.country.toUpperCase()+', '+postalCode;
                    }
                }

                if (currentEditId !== "") {
                    dataSent = {
                        "offerId": currentEditId,
                        "haulierId": haulier.contactId,
                        "haulierName": haulier.contactName,
                        "currency": currency,
                        "loadingCity": city,
                        "loadingPortId": loadingPort.portId,
                        "loadingPort": loadingPort.portName,
                        "freeTime": freeTime,
                        "multiStop": multiStop,
                        "overtimeTariff": overtimeTariff,
                        "unitTariff": Number(unitTariff),
                        "haulageType": haulageType,
                        "emptyPickupDepot": emptyPickupDepot,
                        "comment": comment,
                        "validUntil": validUntil?.toISOString(),
                        "updated": (new Date()).toISOString(),
                        "containers": containerTypes,
                    };    
                }
                else {
                    dataSent = {
                        "id": null,
                        "haulierId": haulier.contactId,
                        "haulierName": haulier.contactName,
                        "currency": currency,
                        "loadingCity": city,
                        "loadingPortId": loadingPort.portId,
                        "loadingPort": loadingPort.portName,
                        "freeTime": freeTime,
                        "multiStop": multiStop,
                        "overtimeTariff": overtimeTariff,
                        "unitTariff": Number(unitTariff),
                        "haulageType": haulageType,
                        "emptyPickupDepot": emptyPickupDepot,
                        "comment": comment,
                        "validUntil": validUntil?.toISOString(),
                        "updated": (new Date()).toISOString(),
                        "containers": containerTypes,
                    };    
                }
                const response = await (context?.service as BackendService<any>).postWithToken(protectedResources.apiLisPricing.endPoint+"/Haulage/Haulage", dataSent, context.tokenPricing);
                if (response !== null && response !== undefined) {
                    setModal2(false);
                    enqueueSnackbar(t('successCreated'), { variant: "success", anchorOrigin: { horizontal: "right", vertical: "top"} });
                    searchHaulages();
                }
                else {
                    enqueueSnackbar(t('errorHappened'), { variant: "error", anchorOrigin: { horizontal: "right", vertical: "top"} });
                }
            }
        }
        else {
            enqueueSnackbar(t('fieldsEmptyHaulage'), { variant: "error", anchorOrigin: { horizontal: "right", vertical: "top"} });
        }
    }

    const deleteHaulagePrice = async (id: string) => {
        if (account && instance && context) {
            // alert("Function not available yet!");
            const response = await (context?.service as BackendService<any>).deleteWithToken(protectedResources.apiLisPricing.endPoint+"/Haulage/DeleteHaulage?offerId="+id, context.tokenPricing);
            if (response !== null && response !== undefined) {
                enqueueSnackbar(t('rowDeletedSuccess'), { variant: "success", anchorOrigin: { horizontal: "right", vertical: "top"} });
                setModal(false);
                searchHaulages();
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
                <Typography variant="h5" sx={{mt: {xs: 4, md: 1.5, lg: 1.5 }}} mx={5}><b>{t('listHaulages')}</b></Typography>
                <Grid container spacing={2} mt={0} px={5}>
                    <Grid item xs={12}>
                        <Button variant="contained" sx={actionButtonStyles} onClick={() => { setCurrentEditId(""); resetForm(); setModal2(true); }}>
                            {t('newHaulagePrice')} <AddCircleOutlinedIcon sx={{ ml: 0.5, pb: 0.25, justifyContent: "center", alignItems: "center" }} fontSize="small" />
                        </Button>
                        <Button variant="contained" sx={actionButtonStyles} onClick={() => { setModal5(true); }}>
                            {t('requestHaulagePrice')} <Mail sx={{ ml: 0.5, pb: 0.25, justifyContent: "center", alignItems: "center" }} fontSize="small" />
                        </Button>
                        <Button variant="contained" color="inherit" sx={{ float: "right", backgroundColor: "#fff", textTransform: "none" }} onClick={() => { setModal7(true); }} >{t('createNewHaulier')}</Button>
                    </Grid>
                    <Grid item xs={12} md={4} mt={1}>
                        <InputLabel htmlFor="company-name" sx={inputLabelStyles}>{t('haulier')}</InputLabel>
                        <CompanySearch id="company-name" value={searchedHaulier} onChange={setSearchedHaulier} category={CategoryEnum.SUPPLIERS} fullWidth />
                    </Grid>
                    <Grid item xs={12} md={3} mt={1}>
                        <InputLabel htmlFor="loading-city-searched" sx={inputLabelStyles}>{t('loadingCity')}</InputLabel>
                        <AutocompleteSearch id="loading-city-searched" value={searchedLoadingCity} onChange={setSearchedLoadingCity} fullWidth />
                    </Grid>
                    <Grid item xs={12} md={3} mt={1}>
                        <InputLabel htmlFor="loading-port-searched" sx={inputLabelStyles}><Anchor fontSize="small" sx={inputIconStyles} /> {t('deliveryPort')}</InputLabel>
                        {
                            ports !== null ?
                            <Autocomplete
                                disablePortal
                                id="loading-port-searched"
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
                                value={searchedLoadingPort}
                                sx={{ mt: 1 }}
                                renderInput={(params: any) => <TextField {...params} />}
                                onChange={(e: any, value: any) => { setSearchedLoadingPort(value); }}
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
                            onClick={searchHaulages}
                            fullWidth
                        >
                            {t('search')}
                        </Button>
                    </Grid>
                </Grid>
                {
                    !load ? 
                    <Grid container spacing={2} mt={1} px={5}>
                        <Grid item xs={12}>
                            {
                                haulages !== null && haulages.length !== 0 ?
                                <Box sx={{ overflow: "auto", width: { xs: "calc(100vw - 80px)", md: "100%" } }}>
                                    {
                                        haulages.map((item: any, i: number) => {
                                            return (
                                                <Accordion key={"seaf"+i} sx={{ border: 1, borderColor: "#e5e5e5" }}>
                                                    <AccordionSummary expandIcon={<ExpandMoreIcon />} aria-controls="panel1a-content" id="panel1a-header">
                                                        <Chip variant="outlined" label={extractCityAndPostalCode(item.loadingCity)} sx={{ mr: 1 }} />
                                                        <Chip variant="outlined" label={item.loadingPort} />
                                                        {/* <Typography>{t('from')} {item.departurePortName} {t('to')} {item.destinationPortName}</Typography> */}
                                                    </AccordionSummary>
                                                    <AccordionDetails>
                                                        <DataGrid
                                                            rows={item.hauliers}
                                                            columns={columnsHaulages}
                                                            hideFooter
                                                            getRowId={(row: any) => row?.id}
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
            
            <BootstrapDialog onClose={() => setModal(false)} open={modal} maxWidth="sm" fullWidth>
                <BootstrapDialogTitle id="custom-dialog-title" onClose={() => setModal(false)}>
                    <b>{t('deleteRowHaulage')}</b>
                </BootstrapDialogTitle>
                <DialogContent dividers>{t('areYouSureDeleteRow')}</DialogContent>
                <DialogActions>
                    <Button variant="contained" color={"primary"} onClick={() => { deleteHaulagePrice(currentId); }} sx={{ mr: 1.5, textTransform: "none" }}>{t('accept')}</Button>
                    <Button variant="contained" onClick={() => setModal(false)} sx={buttonCloseStyles}>{t('close')}</Button>
                </DialogActions>
            </BootstrapDialog>
            
            <BootstrapDialog onClose={() => setModal2(false)} open={modal2} maxWidth="lg" fullWidth>
                <BootstrapDialogTitle id="custom-dialog-title2" onClose={() => setModal2(false)}>
                    <b>{currentEditId === "" ? t('createRowHaulage') : t('editRowHaulage')}</b>
                </BootstrapDialogTitle>
                <DialogContent dividers>
                    {
                        loadEdit === false ?
                        <Grid container spacing={2}>
                            <Grid item xs={12} md={8}>
                                <Typography sx={{ fontSize: 18, mb: 1 }}><b>Haulage price information</b></Typography>
                            </Grid>
                            <Grid item xs={12} md={4}>
                                <Button 
                                    variant="contained" color="inherit" 
                                    sx={{ float: "right", backgroundColor: "#fff", textTransform: "none", ml: 1 }} 
                                    onClick={() => { setModal9(true); }}
                                >
                                    {t('newPort')}
                                </Button>
                                <Button 
                                    variant="contained" color="inherit" 
                                    sx={{ float: "right", backgroundColor: "#fff", textTransform: "none" }} 
                                    onClick={() => { setModal7(true); }}
                                >
                                    {t('createNewHaulier')}
                                </Button>
                            </Grid>
                            <Grid item xs={12} md={8}>
                                <Grid container spacing={2}>
                                    <Grid item xs={12} md={6} mt={0.25}>
                                        <InputLabel htmlFor="haulier" sx={inputLabelStyles}>{t('haulier')}</InputLabel>
                                        <CompanySearch id="haulier" value={haulier} onChange={setHaulier} category={CategoryEnum.SUPPLIERS} fullWidth />
                                    </Grid>
                                    <Grid item xs={12} md={6} mt={0.25}>
                                        <InputLabel htmlFor="loading-city" sx={inputLabelStyles}>{t('loadingCity')}</InputLabel>
                                        <AutocompleteSearch id="loading-city" value={loadingCity} onChange={setLoadingCity} fullWidth />
                                    </Grid>
                                    <Grid item xs={12} md={6} mt={0.25}>
                                        <InputLabel htmlFor="loading-port" sx={inputLabelStyles}><Anchor fontSize="small" sx={inputIconStyles} /> {t('deliveryPort')}</InputLabel>
                                        {
                                            ports !== null ?
                                            <Autocomplete
                                                disablePortal
                                                id="loading-port"
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
                                                value={loadingPort}
                                                sx={{ mt: 1 }}
                                                renderInput={(params: any) => <TextField {...params} />}
                                                onChange={(e: any, value: any) => { setLoadingPort(value); }}
                                                fullWidth
                                            /> : <Skeleton />
                                        }
                                    </Grid>
                                    <Grid item xs={12} md={6} mt={0.25}>
                                        <InputLabel htmlFor="emptyPickupDepot" sx={inputLabelStyles}>{t('emptyPickupDepot')}</InputLabel>
                                        <BootstrapInput id="emptyPickupDepot" type="text" value={emptyPickupDepot} onChange={(e: any) => setEmptyPickupDepot(e.target.value)} fullWidth />
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
                                        <option key={"currencyElm-"+i} value={elm.value}>{elm.label}</option>
                                    ))}
                                </NativeSelect>
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <InputLabel htmlFor="haulageType" sx={inputLabelStyles}>{t('haulageType')}</InputLabel>
                                <NativeSelect
                                    id="haulageType"
                                    value={haulageType}
                                    onChange={(e: any) => { setHaulageType(e.target.value) }}
                                    input={<BootstrapInput />}
                                    fullWidth
                                >
                                    {haulageTypeOptions.map((elm: any, i: number) => (
                                        <option key={"haulageElm-"+i} value={elm.value}>{t(elm.label)}</option>
                                    ))}
                                </NativeSelect>
                            </Grid>
                            <Grid item xs={12} md={4}>
                                <InputLabel htmlFor="container-types" sx={inputLabelStyles}>{t('containers')}</InputLabel>
                                {
                                    containers !== null ? 
                                    <Autocomplete
                                        multiple
                                        disableCloseOnSelect
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
                                <InputLabel htmlFor="free-time" sx={inputLabelStyles}>{t('freeTime')} ({t('hours')})</InputLabel>
                                <BootstrapInput id="free-time" type="number" value={freeTime} onChange={(e: any) => setFreeTime(e.target.value)} fullWidth />
                            </Grid>
                            <Grid item xs={12} md={2}>
                                <InputLabel htmlFor="unitTariff-cs" sx={inputLabelStyles}>{t('unitTariff2')}</InputLabel>
                                <BootstrapInput id="unitTariff-cs" type="number" value={unitTariff} onChange={(e: any) => setUnitTariff(e.target.value)} fullWidth />
                            </Grid>
                            <Grid item xs={12} md={2}>
                                <InputLabel htmlFor="overtimeTariff-cs" sx={inputLabelStyles}>{t('overtimeTariff')} (/{t('hour')})</InputLabel>
                                <BootstrapInput id="overtimeTariff-cs" type="number" value={overtimeTariff} onChange={(e: any) => setOvertimeTariff(e.target.value)} fullWidth />
                            </Grid>
                            <Grid item xs={12} md={2}>
                                <InputLabel htmlFor="multiStop" sx={inputLabelStyles}>{t('multiStop')}</InputLabel>
                                <BootstrapInput id="multiStop" type="number" value={multiStop} onChange={(e: any) => setMultiStop(e.target.value)} fullWidth />
                            </Grid>
                        </Grid> : <Skeleton />
                    }
                </DialogContent>
                <DialogActions>
                    <Button 
                        variant="contained" color={"primary"} 
                        onClick={() => { createUpdateHaulage(); }} 
                        sx={{ mr: 1.5, textTransform: "none" }}
                    >
                        {t('validate')}
                    </Button>
                    <Button variant="contained" onClick={() => setModal2(false)} sx={buttonCloseStyles}>{t('close')}</Button>
                </DialogActions>
            </BootstrapDialog>

            {/* Price request haulage  */}
            <BootstrapDialog onClose={() => setModal5(false)} open={modal5} maxWidth="lg" fullWidth>
                {
                    context ? 
                    <RequestPriceHaulage
                        token={context.tokenPricing} 
                        ports={ports}
                        loadingCity={null}
                        loadingPort={null}
                        closeModal={() => setModal5(false)}
                    /> : null
                }
            </BootstrapDialog>

            {/* Add a new contact */}
            <BootstrapDialog onClose={() => setModal7(false)} open={modal7} maxWidth="md" fullWidth>
                <NewContact 
                    categories={["SUPPLIERS"]}
                    closeModal={() => setModal7(false)}
                    callBack={getClients}
                />
            </BootstrapDialog>

            {/* Create new service */}
            <BootstrapDialog onClose={() => setModal8(false)} open={modal8} maxWidth="md" fullWidth>
                <NewService 
                    closeModal={() => setModal8(false)}
                    callBack={getServices}
                />
            </BootstrapDialog>

            {/* Create new port */}
            <BootstrapDialog onClose={() => setModal9(false)} open={modal9} maxWidth="md" fullWidth>
                <NewPort 
                    closeModal={() => setModal9(false)}
                    callBack={getPorts}
                />
            </BootstrapDialog>
        </div>
    );
}

export default Haulages;
