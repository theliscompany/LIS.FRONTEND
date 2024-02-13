import { useState, useEffect } from 'react';
import { Accordion, AccordionDetails, AccordionSummary, Alert, Autocomplete, Box, Button, Chip, DialogActions, DialogContent, FormControlLabel, Grid, IconButton, InputLabel, ListItem, ListItemText, NativeSelect, Skeleton, Switch, TextField, Typography } from '@mui/material';
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
import { GridColDef, GridRenderCellParams, DataGrid } from '@mui/x-data-grid';
import { BootstrapDialog, BootstrapDialogTitle, BootstrapInput, actionButtonStyles, buttonCloseStyles, datetimeStyles, gridStyles, inputLabelStyles, whiteButtonStyles } from '../utils/misc/styles';
import CompanySearch from '../components/shared/CompanySearch';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import dayjs, { Dayjs } from 'dayjs';
import { AuthenticationResult } from '@azure/msal-browser';
import { useMsal, useAccount } from '@azure/msal-react';
import { CategoryEnum } from '../utils/constants';

function createGetRequestUrl(variable1: number, variable2: number, variable3: number) {
    let url = protectedResources.apiLisPricing.endPoint+"/Miscellaneous/Miscellaneous?";
    if (variable1) {
      url += 'DeparturePortId=' + encodeURIComponent(variable1) + '&';
    }
    if (variable2) {
      url += 'DestinationPortId=' + encodeURIComponent(variable2) + '&';
    }
    if (variable3) {
      url += 'SupplierId=' + encodeURIComponent(variable3) + '&';
    }
    
    if (url.slice(-1) === '&') {
      url = url.slice(0, -1);
    }
    return url;
}

function Miscellaneous() {
    const [load, setLoad] = useState<boolean>(true);
    const [loadEdit, setLoadEdit] = useState<boolean>(false);
    const [modal, setModal] = useState<boolean>(false);
    const [modal2, setModal2] = useState<boolean>(false);
    const [ports, setPorts] = useState<any>(null);
    const [containers, setContainers] = useState<any>(null);
    const [services, setServices] = useState<any>(null);
    const [currentId, setCurrentId] = useState<string>("");
    const [currentEditId, setCurrentEditId] = useState<string>("");
    const [miscs, setMiscs] = useState<any>(null);
    const [miscsWithoutShipment, setMiscsWithoutShipment] = useState<any>(null);
    const [searchedSupplier, setSearchedSupplier] = useState<any>(null);
    const [portDeparture, setPortDeparture] = useState<any>(null);
    const [portDestination, setPortDestination] = useState<any>(null);
    
    const [supplier, setSupplier] = useState<any>(null);
    const [portLoading, setPortLoading] = useState<any>(null);
    const [portDischarge, setPortDischarge] = useState<any>(null);
    const [validUntil, setValidUntil] = useState<Dayjs | null>(null);
    const [currency, setCurrency] = useState<string>("EUR");
    const [comment, setComment] = useState<string>("");
    const [serviceName, setServiceName] = useState<any>(null);
    const [containerTypes, setContainerTypes] = useState<any>([]);
    const [price, setPrice] = useState<number>(0);
    const [servicesSelection, setServicesSelection] = useState<any>([]);
    const [withShipment, setWithShipment] = useState<boolean>(true);

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
    
    const columnsMiscs: GridColDef[] = [
        { field: 'supplierName', headerName: t('supplier'), minWidth: 120, flex: 1 },
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
        }, minWidth: 140, flex: 1 },
        { field: 'validUntil', headerName: t('validUntil'), renderCell: (params: GridRenderCellParams) => {
            return (
                <Box sx={{ my: 1, mr: 1 }}>
                    <Chip label={(new Date(params.row.validUntil)).toLocaleDateString().slice(0,10)} color={(new Date()).getTime() - (new Date(params.row.validUntil)).getTime() > 0 ? "warning" : "success"}></Chip>
                </Box>
            );
        }, minWidth: 100, flex: 0.5 },
        { field: 'created', headerName: t('created'), renderCell: (params: GridRenderCellParams) => {
            return (
                <Box sx={{ my: 1, mr: 1 }}>
                    <Chip label={(new Date(params.row.created)).toLocaleDateString().slice(0,10)} color={(new Date()).getTime() - (new Date(params.row.created)).getTime() > 0 ? "default" : "default"}></Chip>
                </Box>
            );
        }, minWidth: 100, flex: 0.5 },
        { field: 'xxx', headerName: t('Actions'), renderCell: (params: GridRenderCellParams) => {
            return (
                <Box sx={{ my: 1, mr: 1 }}>
                    <IconButton size="small" title={t('editRowMisc')} sx={{ mr: 0.5 }} onClick={() => { setCurrentEditId(params.row.miscellaneousId); getMiscellaneous(params.row.miscellaneousId); setModal2(true); }}>
                        <EditIcon fontSize="small" />
                    </IconButton>
                    <IconButton size="small" title={t('deleteRowMisc')} onClick={() => { setCurrentId(params.row.miscellaneousId); setModal(true); }}>
                        <DeleteIcon fontSize="small" />
                    </IconButton>
                </Box>
            );
        }, minWidth: 120, flex: 0.4 },
    ];
    
    useEffect(() => {
        getPorts();
        // getMiscellaneouses();
        getProtectedData(); // Services and Containers
    }, []);

    useEffect(() => {
        getMiscellaneouses();
    }, [withShipment]);
    
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
                console.log(response.filter((obj: any) => obj.servicesTypeId.includes(5)));
                setServices(response.filter((obj: any) => obj.servicesTypeId.includes(5))); // Filter the services for miscellaneous (MISCELLANEOUS = 5)
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
    
    const getMiscellaneouses = async () => {
        if (context && account) {
            setLoad(true);

            var token = null;
            if (tempToken === "") {
                token = await instance.acquireTokenSilent({
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
            }
            
            const response = await (context as BackendService<any>).getWithToken(protectedResources.apiLisPricing.endPoint+"/Miscellaneous/Miscellaneous?withShipment="+withShipment, token !== null ? token : tempToken);
            if (response !== null && response !== undefined) {
                // setMiscs([]);
                setMiscs(response);
                if (withShipment === false) {
                    setMiscsWithoutShipment(response);
                }
                setLoad(false);
            }
            else {
                setLoad(false);
            }
            console.log(response);
        }
    }
    
    const resetForm = () => {
        setSupplier(null);
        setPortLoading(null);
        setPortDischarge(null);
        setCurrency("EUR");
        setValidUntil(null);
        setComment("");
        setServicesSelection([]);
    }
    
    const getMiscellaneous = async (id: string) => {
        setLoadEdit(true)
        if (context) {
            const response = await (context as BackendService<any>).getWithToken(protectedResources.apiLisPricing.endPoint+"/Miscellaneous/Miscellaneous?id="+id+"&withShipment="+withShipment, tempToken);
            if (response !== null && response !== undefined) {
                setSupplier({contactId: response.supplierId, contactName: response.supplierName});
                setPortLoading(ports.find((elm: any) => elm.portId === response.departurePortId));
                setPortDischarge(ports.find((elm: any) => elm.portId === response.destinationPortId));
                setCurrency(response.currency);
                setValidUntil(dayjs(response.validUntil));
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
    
    const searchMiscellaneous = async () => {
        if (context) {
            setLoad(true);
            var requestFormatted = createGetRequestUrl(portDeparture?.portId, portDestination?.portId, searchedSupplier?.contactId);
            const response = await (context as BackendService<any>).getWithToken(requestFormatted+"&withShipment="+withShipment, tempToken);
            if (response !== null && response !== undefined) {
                setMiscs(response);
                setLoad(false);
            }
            else {
                setLoad(false);
            }
            console.log(response);
        }
    }

    const createMiscellaneous = async () => {
        if (servicesSelection !== null && validUntil !== null) {
            if (context) {
                var dataSent = null;
                if (currentEditId !== "") {
                    if (portLoading !== null && portDischarge !== null) {
                        dataSent = {
                            "miscellaneousId": currentEditId,
                            "departurePortId": portLoading.portId,
                            "destinationPortId": portDischarge.portId,
                            "departurePortName": portLoading.portName,
                            "destinationPortName": portDischarge.portName,
                            "supplierId": supplier.contactId,
                            "supplierName": supplier.contactName,
                            "currency": currency,
                            "validUntil": validUntil?.toISOString(),
                            "comment": comment,
                            "services": servicesSelection,
                            "updated": (new Date()).toISOString()
                        };
                    }
                    else {
                        dataSent = {
                            "miscellaneousId": currentEditId,
                            "supplierId": supplier.contactId,
                            "supplierName": supplier.contactName,
                            "currency": currency,
                            "validUntil": validUntil?.toISOString(),
                            "comment": comment,
                            "services": servicesSelection,
                            "updated": (new Date()).toISOString()
                        };
                    }
                }
                else {
                    if (portLoading !== null && portDischarge !== null) {
                        dataSent = {
                            // "miscellaneousId": currentEditId,
                            "departurePortId": portLoading.portId,
                            "destinationPortId": portDischarge.portId,
                            "departurePortName": portLoading.portName,
                            "destinationPortName": portDischarge.portName,
                            "supplierId": supplier.contactId,
                            "supplierName": supplier.contactName,
                            "currency": currency,
                            "validUntil": validUntil?.toISOString(),
                            "comment": comment,
                            "services": servicesSelection,
                            "updated": (new Date()).toISOString()
                        };
                    }
                    else {
                        dataSent = {
                            // "miscellaneousId": currentEditId,
                            "supplierId": supplier.contactId,
                            "supplierName": supplier.contactName,
                            "currency": currency,
                            "validUntil": validUntil?.toISOString(),
                            "comment": comment,
                            "services": servicesSelection,
                            "updated": (new Date()).toISOString()
                        };
                    }
                }
                const response = await (context as BackendService<any>).postWithToken(protectedResources.apiLisPricing.endPoint+"/Miscellaneous/Miscellaneous", dataSent, tempToken);
                if (response !== null && response !== undefined) {
                    setModal2(false);
                    enqueueSnackbar(t('successCreated'), { variant: "success", anchorOrigin: { horizontal: "right", vertical: "top"} });
                    getMiscellaneouses();
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

    const deleteMiscellaneous = async (id: string) => {
        if (context) {
            // alert("Function not available yet!");
            const response = await (context as BackendService<any>).delete(protectedResources.apiLisPricing.endPoint+"/Miscellaneous/DeleteMiscellaneous/"+id);
            if (response !== null && response !== undefined) {
                enqueueSnackbar(t('rowDeletedSuccess'), { variant: "success", anchorOrigin: { horizontal: "right", vertical: "top"} });
                setModal(false);
                getMiscellaneouses();
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
                <Typography variant="h5" sx={{mt: {xs: 4, md: 1.5, lg: 1.5 }}} mx={5}><b>{t('listMiscellaneous')}</b></Typography>
                <Grid container spacing={2} mt={0} px={5}>
                    <Grid item xs={12} md={9}>
                        <FormControlLabel 
                            control={
                            <Switch
                                checked={withShipment}
                                onChange={(event: React.ChangeEvent<HTMLInputElement>) => { 
                                    // setMiscs(null); setMiscsWithoutShipment(null);
                                    console.log(event.target.checked); setWithShipment(event.target.checked); setLoad(true);
                                }}
                                inputProps={{ 'aria-label': 'controlled' }}
                            />}
                            label={t('withShipment')} 
                            sx={{ float: "right" }}
                        />
                    </Grid>
                    <Grid item xs={12} md={3}>
                        <Button variant="contained" sx={actionButtonStyles} onClick={() => { setCurrentEditId(""); resetForm(); setModal2(true); }}>
                            {t('newMiscellaneousPrice')} <AddCircleOutlinedIcon sx={{ ml: 0.5, pb: 0.25, justifyContent: "center", alignItems: "center" }} fontSize="small" />
                        </Button>
                    </Grid>
                    <Grid item xs={12} md={4} mt={1}>
                        <InputLabel htmlFor="company-name" sx={inputLabelStyles}>{t('supplier')}</InputLabel>
                        <CompanySearch id="company-name" value={searchedSupplier} onChange={setSearchedSupplier} category={CategoryEnum.SUPPLIERS} callBack={() => console.log(searchedSupplier)} fullWidth />
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
                            onClick={searchMiscellaneous}
                            fullWidth
                        >
                            {t('search')}
                        </Button>
                    </Grid>
                </Grid>
                    
                <Grid container spacing={2} mt={1} px={5}>
                {
                    withShipment === true ?
                    !load ? 
                    <Grid item xs={12}>
                        {
                            miscs !== null && miscs.length !== 0 ?
                                <Box sx={{ overflow: "auto", width: { xs: "calc(100vw - 80px)", md: "100%" } }}>
                                {
                                    miscs.map((item: any, i: number) => {
                                        return (
                                            <Accordion key={"seaf"+i} sx={{ border: 1, borderColor: "#e5e5e5" }}>
                                                <AccordionSummary expandIcon={<ExpandMoreIcon />} aria-controls="panel1a-content" id="panel1a-header">
                                                    <Chip variant="outlined" label={item.departurePortName} sx={{ mr: 1 }} />
                                                    <Chip variant="outlined" label={item.destinationPortName} />
                                                </AccordionSummary>
                                                <AccordionDetails>
                                                    <DataGrid
                                                        rows={item.suppliers}
                                                        columns={columnsMiscs}
                                                        hideFooter
                                                        getRowId={(row: any) => row?.miscellaneousId}
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
                    </Grid> : <Skeleton sx={{ mx: 1, mt: 3, width: "100%" }} /> : null
                }
                {
                    withShipment === false ?
                    !load ? 
                    <Grid item xs={12}>
                        {
                            miscsWithoutShipment !== null && miscsWithoutShipment.length !== 0 ?
                                <Box sx={{ overflow: "auto", width: { xs: "calc(100vw - 80px)", md: "100%" } }}>
                                {
                                    miscsWithoutShipment !== null && miscsWithoutShipment.length !== 0 ?
                                    <DataGrid
                                        rows={miscsWithoutShipment}
                                        columns={columnsMiscs}
                                        hideFooter
                                        getRowId={(row: any) => row?.miscellaneousId}
                                        getRowHeight={() => "auto" }
                                        sx={gridStyles}
                                        disableRowSelectionOnClick
                                    /> : <Skeleton />
                                }
                            </Box> : <Alert severity="warning">{t('noResults')}</Alert>
                        }
                    </Grid> : <Skeleton sx={{ mx: 1, mt: 3, width: "100%" }} /> : null
                }
                {/* {
                    withShipment !== true ? 
                    <Grid item xs={12}>
                       <Box sx={{ overflow: "auto", width: { xs: "calc(100vw - 80px)", md: "100%" } }}>
                        {
                            miscsWithoutShipment !== null && miscsWithoutShipment.length !== 0 ?
                            <DataGrid
                                rows={miscsWithoutShipment}
                                columns={columnsMiscs}
                                hideFooter
                                getRowId={(row: any) => row?.miscellaneousId}
                                getRowHeight={() => "auto" }
                                sx={gridStyles}
                                disableRowSelectionOnClick
                            /> : <Skeleton />
                        }
                        </Box>
                    </Grid> : null
                } */}
                </Grid>
            </Box>
            <BootstrapDialog
                onClose={() => setModal(false)}
                aria-labelledby="custom-dialog-title"
                open={modal}
                maxWidth="sm"
                fullWidth
            >
                <BootstrapDialogTitle id="custom-dialog-title" onClose={() => setModal(false)}>
                    <b>{t('deleteRowMisc')}</b>
                </BootstrapDialogTitle>
                <DialogContent dividers>{t('areYouSureDeleteRow')}</DialogContent>
                <DialogActions>
                    <Button variant="contained" color={"primary"} onClick={() => { deleteMiscellaneous(currentId); }} sx={{ mr: 1.5, textTransform: "none" }}>{t('accept')}</Button>
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
                    <b>{currentEditId === "" ? t('createRowMisc') : t('editRowMisc')}</b>
                </BootstrapDialogTitle>
                <DialogContent dividers>
                    {
                        loadEdit === false ?
                        <Grid container spacing={2}>
                            <Grid item xs={12} md={8}>
                                <Grid container spacing={2}>
                                    <Grid item xs={12} md={6} mt={0.25}>
                                        <InputLabel htmlFor="supplier" sx={inputLabelStyles}>{t('supplier')}</InputLabel>
                                        <CompanySearch id="supplier" value={supplier} onChange={setSupplier} category={CategoryEnum.SUPPLIERS} callBack={() => console.log(supplier)} fullWidth />
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
                                                <li {...props} key={option.serviceId}>
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
                    <Button variant="contained" color={"primary"} onClick={() => { createMiscellaneous(); }} sx={{ mr: 1.5, textTransform: "none" }}>{t('validate')}</Button>
                    <Button variant="contained" onClick={() => setModal2(false)} sx={buttonCloseStyles}>{t('close')}</Button>
                </DialogActions>
            </BootstrapDialog>
        </div>
    );
}

export default Miscellaneous;
