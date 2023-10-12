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
import { GridColDef, GridValueFormatterParams, GridRenderCellParams, DataGrid, GridValueGetterParams } from '@mui/x-data-grid';
import { BootstrapDialog, BootstrapDialogTitle, BootstrapInput, actionButtonStyles, buttonCloseStyles, datetimeStyles, gridStyles, inputLabelStyles, whiteButtonStyles } from '../utils/misc/styles';
import CompanySearch from '../components/shared/CompanySearch';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import dayjs, { Dayjs } from 'dayjs';
import { AuthenticationResult } from '@azure/msal-browser';
import { useMsal, useAccount } from '@azure/msal-react';
import { CategoryEnum } from '../utils/constants';
import AutocompleteSearch from '../components/shared/AutocompleteSearch';
import { MailData } from '../utils/models/models';

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
    const [ports, setPorts] = useState<any>(null);
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

    const haulageTypeOptions = [
        { value: "On trailer, direct loading", label: t('haulageType1') },
        { value: "On trailer, Loading with Interval", label: t('haulageType2') },
        { value: "Side loader, direct loading", label: t('haulageType3') },
        { value: "Side loader, Loading with Interval, from trailer to floor", label: t('haulageType4') },
        { value: "Side loader, Loading with Interval, from floor to trailer", label: t('haulageType5') }
    ];
    
    const columnsHaulages: GridColDef[] = [
        { field: 'haulierName', headerName: t('haulier'), minWidth: 150 },
        // { field: 'loadingPort', headerName: t('loadingPort'), renderCell: (params: GridRenderCellParams) => {
        //     return (
        //         <Box sx={{ my: 2 }}>{params.row.loadingPort}</Box>
        //     );
        // }, minWidth: 150 },
        { field: 'unitTariff', headerName: t('unitTariff'), valueGetter: (params: GridValueGetterParams) => `${params.row.unitTariff || ''} ${t(params.row.currency)}`, minWidth: 125 },
        { field: 'freeTime', headerName: t('freeTime'), valueFormatter: (params: GridValueFormatterParams) => `${params.value || ''} ${t('hours')}`, minWidth: 100 },
        { field: 'overtimeTariff', headerName: t('overtimeTariff'), valueGetter: (params: GridValueGetterParams) => `${params.row.overtimeTariff || ''} ${t(params.row.currency)} / ${t('hour')}`, minWidth: 125 },
        { field: 'multiStop', headerName: t('multiStop'), valueGetter: (params: GridValueGetterParams) => `${params.row.multiStop || ''} ${t(params.row.currency)}`, width: 100 },
        // { field: 'containersType', headerName: t('containers'), renderCell: (params: GridRenderCellParams) => {
        //     return (
        //         <Box sx={{ my: 2 }}>{params.row.containersType.join(", ")}</Box>
        //     );
        // }, minWidth: 125 },
        { field: 'validUntil', headerName: t('validUntil'), renderCell: (params: GridRenderCellParams) => {
            return (
                <Box sx={{ my: 1, mr: 1 }}>
                    <Chip label={(new Date(params.row.validUntil)).toLocaleDateString().slice(0,10)} color={(new Date()).getTime() - (new Date(params.row.validUntil)).getTime() > 0 ? "warning" : "success"}></Chip>
                </Box>
            );
        }, minWidth: 100 },
        { field: 'created', headerName: t('created'), renderCell: (params: GridRenderCellParams) => {
            return (
                <Box sx={{ my: 1, mr: 1 }}>
                    <Chip label={(new Date(params.row.created)).toLocaleDateString().slice(0,10)} color={(new Date()).getTime() - (new Date(params.row.created)).getTime() > 0 ? "default" : "default"}></Chip>
                </Box>
            );
        }, minWidth: 100 },
        { field: 'xxx', headerName: t('Actions'), renderCell: (params: GridRenderCellParams) => {
            return (
                <Box sx={{ my: 1, mr: 1 }}>
                    <IconButton size="small" title={t('editRow')} sx={{ mr: 0.5 }} onClick={() => { setCurrentEditId(params.row.id); getHaulage(params.row.id); setModal2(true); }}>
                        <EditIcon fontSize="small" />
                    </IconButton>
                    <IconButton size="small" title={t('deleteRow')} onClick={() => { setCurrentId(params.row.id); setModal(true); }}>
                        <DeleteIcon fontSize="small" />
                    </IconButton>
                </Box>
            );
        }, minWidth: 100 },
    ];
    
    useEffect(() => {
        getPorts();
        getHaulages();
        getContainers();
    }, []);
    
    const getPorts = async () => {
        if (context) {
            const response = await (context as BackendService<any>).getSingle(protectedResources.apiLisTransport.endPoint+"/Port/Ports");
            if (response !== null && response !== undefined) {
                setPorts(response);
            }  
        }
    }
    
    const getContainers = async () => {
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
            
            const response = await (context as BackendService<any>).getWithToken(protectedResources.apiLisTransport.endPoint+"/Package/Containers", token);
            if (response !== null && response !== undefined) {
                setContainers(response);
            }  
        }
    }
    
    const getHaulages = async () => {
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

            const response = await (context as BackendService<any>).getWithToken(protectedResources.apiLisPricing.endPoint+"/Haulage/Haulages", token);
            if (response !== null && response !== undefined) {
                setHaulages(response);
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
    }
    
    const getHaulage = async (id: string) => {
        setLoadEdit(true)
        if (context && account) {
            const response = await (context as BackendService<any>).getWithToken(protectedResources.apiLisPricing.endPoint+"/Haulage/Haulage?offerId="+id, tempToken);
            if (response !== null && response !== undefined) {
                setHaulier({contactId: response.haulierId, contactName: response.haulierName});
                setLoadingCity({city: response.loadingCity});
                setLoadingPort(ports.find((elm: any) => elm.portId === response.loadingPortId));
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
            }
            else {
                setLoadEdit(false);
            }
            console.log(response);
        }
    }
    
    const searchHaulages = async () => {
        if (context && account) {
            setLoad(true);
            var requestFormatted = createGetRequestUrl(searchedLoadingPort?.portId, searchedHaulier?.contactId, searchedLoadingCity?.city.toUpperCase());
            const response = await (context as BackendService<any>).getWithToken(requestFormatted, tempToken);
            if (response !== null && response !== undefined) {
                setHaulages(response);
                setLoad(false);
            }
            else {
                setLoad(false);
            }
            console.log(response);
        }
    }

    const createHaulage = async () => {
        if (haulier !== null && loadingCity !== null && loadingPort !== null && freeTime > 0 && unitTariff > 0 && overtimeTariff > 0 && multiStop > 0 && validUntil !== null && containerTypes.length > 0) {
            if (context && account) {
                var dataSent = null;
                if (currentEditId !== "") {
                    dataSent = {
                        "offerId": currentEditId,
                        "haulierId": haulier.contactId,
                        "haulierName": haulier.contactName,
                        "currency": currency,
                        "loadingCity": loadingCity.city.toUpperCase(),
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
                        "containers": containerTypes,
                    };    
                }
                else {
                    dataSent = {
                        "id": null,
                        "haulierId": haulier.contactId,
                        "haulierName": haulier.contactName,
                        "currency": currency,
                        "loadingCity": loadingCity.city.toUpperCase(),
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
                        "containers": containerTypes,
                    };    
                }
                const response = await (context as BackendService<any>).postWithToken(protectedResources.apiLisPricing.endPoint+"/Haulage/Haulage", dataSent, tempToken);
                if (response !== null && response !== undefined) {
                    setModal2(false);
                    enqueueSnackbar(t('successCreated'), { variant: "success", anchorOrigin: { horizontal: "right", vertical: "top"} });
                    getHaulages();
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
        if (context) {
            // alert("Function not available yet!");
            const response = await (context as BackendService<any>).deleteWithToken(protectedResources.apiLisPricing.endPoint+"/Haulage/DeleteHaulage?offerId="+id, tempToken);
            if (response !== null && response !== undefined) {
                enqueueSnackbar(t('rowDeletedSuccess'), { variant: "success", anchorOrigin: { horizontal: "right", vertical: "top"} });
                setModal(false);
                getHaulages();
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
                    </Grid>
                    <Grid item xs={12} md={4} mt={1}>
                        <InputLabel htmlFor="company-name" sx={inputLabelStyles}>{t('haulier')}</InputLabel>
                        <CompanySearch id="company-name" value={searchedHaulier} onChange={setSearchedHaulier} category={CategoryEnum.CHARGEUR} callBack={() => console.log(searchedHaulier)} fullWidth />
                    </Grid>
                    <Grid item xs={12} md={3} mt={1}>
                        <InputLabel htmlFor="loading-city-searched" sx={inputLabelStyles}>{t('loadingCity')}</InputLabel>
                        <AutocompleteSearch id="loading-city-searched" value={searchedLoadingCity} onChange={setSearchedLoadingCity} fullWidth />
                    </Grid>
                    <Grid item xs={12} md={3} mt={1}>
                        <InputLabel htmlFor="loading-port-searched" sx={inputLabelStyles}>{t('loadingPort')}</InputLabel>
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
                                haulages !== null ?
                                <Box sx={{ overflow: "auto" }}>
                                    {
                                        haulages.map((item: any, i: number) => {
                                            return (
                                                <Accordion key={"seaf"+i} sx={{ border: 1, borderColor: "#e5e5e5" }}>
                                                    <AccordionSummary expandIcon={<ExpandMoreIcon />} aria-controls="panel1a-content" id="panel1a-header">
                                                        <Chip variant="outlined" label={item.loadingCity} sx={{ mr: 1 }} />
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
                                </Box> 
                                : <Alert severity="warning">{t('noResults')}</Alert>
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
                    <Button variant="contained" color={"primary"} onClick={() => { deleteHaulagePrice(currentId); }} sx={{ mr: 1.5, textTransform: "none" }}>{t('accept')}</Button>
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
                                        <InputLabel htmlFor="haulier" sx={inputLabelStyles}>{t('haulier')}</InputLabel>
                                        <CompanySearch id="haulier" value={haulier} onChange={setHaulier} category={CategoryEnum.CHARGEUR} callBack={() => console.log(haulier)} fullWidth />
                                    </Grid>
                                    <Grid item xs={12} md={6} mt={0.25}>
                                        <InputLabel htmlFor="loading-city" sx={inputLabelStyles}>{t('loadingCity')}</InputLabel>
                                        <AutocompleteSearch id="loading-city" value={loadingCity} onChange={setLoadingCity} fullWidth />
                                    </Grid>
                                    <Grid item xs={12} md={6} mt={0.25}>
                                        <InputLabel htmlFor="loading-port" sx={inputLabelStyles}>{t('loadingPort')}</InputLabel>
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
                                        <option key={"haulageElm-"+i} value={elm.value}>{elm.label}</option>
                                    ))}
                                </NativeSelect>
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
                    <Button variant="contained" color={"primary"} onClick={() => { createHaulage(); }} sx={{ mr: 1.5, textTransform: "none" }}>{t('validate')}</Button>
                    <Button variant="contained" onClick={() => setModal2(false)} sx={buttonCloseStyles}>{t('close')}</Button>
                </DialogActions>
            </BootstrapDialog>
        </div>
    );
}

export default Haulages;
