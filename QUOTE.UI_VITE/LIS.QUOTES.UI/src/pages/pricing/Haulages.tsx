import { useState, useEffect } from 'react';
import { AxiosError } from 'axios';
import { Accordion, AccordionDetails, AccordionSummary, Alert, Autocomplete, Box, Button, Chip, DialogActions, DialogContent, IconButton, InputLabel, NativeSelect, Skeleton, TextField, Typography } from '@mui/material';
import Grid from '@mui/material/Grid2';
import AddCircleOutlinedIcon from '@mui/icons-material/AddCircleOutlined';
import SearchIcon from '@mui/icons-material/Search';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { Anchor, Mail } from '@mui/icons-material';
import { SnackbarProvider, enqueueSnackbar } from 'notistack';
import { useTranslation } from 'react-i18next';
import { GridColDef, GridValueFormatterParams, GridRenderCellParams, DataGrid, GridValueGetterParams, GridColumnHeaderParams } from '@mui/x-data-grid';
import { BootstrapDialog, BootstrapDialogTitle, BootstrapInput, actionButtonStyles, buttonCloseStyles, datetimeStyles, gridStyles, inputIconStyles, inputLabelStyles } from '../../utils/misc/styles';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import dayjs, { Dayjs } from 'dayjs';
import { CategoryEnum, containerPackages, currencyOptions, haulageTypeOptions } from '../../utils/constants';
import { compareServices, extractCityAndPostalCode, parseLocation2, sortHauliersByName } from '../../utils/functions';
import RequestPriceHaulage from '../../components/pricing/RequestPriceHaulage';
import CompanySearch from '../../components/shared/CompanySearch';
import AutocompleteSearch from '../../components/shared/AutocompleteSearch';
import NewContact from '../../components/shared/NewContact';
import NewService from '../../components/shared/NewService';
import NewPort from '../../components/shared/NewPort';
import { deleteApiHaulageDeleteHaulage, getApiHaulageHaulage, getApiHaulageHaulages, postApiHaulageHaulage } from '../../api/client/pricing';
import { getContactGetContacts } from '../../api/client/crm';
import { getPorts, getService } from '../../api/client/transport';
import PortAutocomplete from '../../components/shared/PortAutocomplete';


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
    
    const columnsHaulages: GridColDef[] = [
        { field: 'haulierName', headerName: t('haulier'), minWidth: 125, flex: 1.4 },
        { field: 'unitTariff', headerName: t('unitTariff'), valueGetter: (params: GridValueGetterParams) => `${params.row.unitTariff || ''} ${t(params.row.currency)}`, renderHeader: (params: GridColumnHeaderParams) => (<>{t('unitTariff')}</>), minWidth: 100, flex: 0.75 },
        { field: 'freeTime', headerName: t('freeTime'), valueFormatter: (params: GridValueFormatterParams) => `${params.value || ''} ${t('hours')}`, minWidth: 100, flex: 0.75 },
        { field: 'overtimeTariff', headerName: t('overtimeTariff'), valueGetter: (params: GridValueGetterParams) => `${params.row.overtimeTariff || ''} ${t(params.row.currency)} / ${t('hour')}`, renderHeader: (params: GridColumnHeaderParams) => (<>{t('overtimeTariff')}</>), minWidth: 100, flex: 1 },
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
        getPortsService();
        getHaulages();
        getServices();
        getContainers();
    }, []);
    
    const getClients = async () => {
        try {
            const response = await getContactGetContacts({query: { category: "SUPPLIERS", pageSize: 1000 }});
            if (response !== null && response !== undefined) {
                // Removing duplicates from client array
                setClients(response.data?.data?.filter((obj: any, index: number, self: any) => index === self.findIndex((o: any) => o.contactName === obj.contactName)));
            }
        }
        catch (err: any) {
            console.log(err);
        }
    }
    
    const getPortsService = async () => {
        try {
            const response = await getPorts({query: { pageSize: 2000 }});
            if (response !== null && response !== undefined) {
                setPorts(response.data);
            }
        }
        catch (err: any) {
            console.log(err);
        }
    }
    
    const getServices = async () => {
        try {
            const response = await getService({query: { pageSize: 500 }});
            if (response !== null && response !== undefined) {
                setAllServices(response.data);
                setServices(response.data?.sort((a: any, b: any) => compareServices(a, b)).filter((obj: any) => obj.servicesTypeId.includes(2))); // Filter the services for haulages (HAULAGE = 2)
            }
        }
        catch (err: any) {
            console.log(err);
        }
    }
    
    const getContainers = async () => {
        setContainers(containerPackages);
    }
    
    const getHaulages = async () => {
        setLoad(true);
        try {
            const response = await getApiHaulageHaulages();
            if (response !== null && response !== undefined) {
                setHaulages(sortHauliersByName(response.data));
                setLoad(false);
            }
            else {
                setLoad(false);
            }
            console.log(response);
        }
        catch (err: unknown) {
            if (err instanceof AxiosError) {
                console.log(err.response?.data);
            }
            console.log("An error occured");
            setLoad(false);
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
        try {
            const response = await getApiHaulageHaulage({query: { offerId: id }});
            var result = response.data;
            if (response !== null && response !== undefined) {
                var auxHaulier = {contactId: result?.haulierId, contactName: result?.haulierName};
                // var auxValidUntil = dayjs(result?.validUntil);
                var auxCity = parseLocation2(result?.loadingCity || "");
                var auxPort = ports.find((elm: any) => elm.portId === result?.loadingPortId);

                setHaulier(auxHaulier);
                setLoadingCity(auxCity);
                setLoadingPort(auxPort);
                setCurrency(result?.currency || "");
                setValidUntil(dayjs(result?.validUntil));
                setFreeTime(result?.freeTime || 0);
                setMultiStop(result?.multiStop || 0);
                setUnitTariff(result?.unitTariff || 0);
                setOvertimeTariff(result?.overtimeTariff || 0);
                setHaulageType(result?.haulageType || "");
                setEmptyPickupDepot(result?.emptyPickupDepot || "");
                setComment(result?.comment || "");
                setContainerTypes(result?.containers);
                setLoadEdit(false);
            }
            else {
                setLoadEdit(false);
            }
        }
        catch (err: unknown) {
            if (err instanceof AxiosError) {
                console.log(err.response?.data);
            }
            console.log("An error occured");
            setLoadEdit(false);
        }
    }
    
    const searchHaulages = async () => {
        try {
            setLoad(true);
            const response = await getApiHaulageHaulages({query: { 
                HaulierId: searchedHaulier?.contactId, 
                LoadingPortId: searchedLoadingPort?.portId, 
                LoadingCity: searchedLoadingCity?.city.toUpperCase() }
            });
            if (response !== null && response !== undefined) {
                setHaulages(response.data);
                setLoad(false);
            }
            else {
                setLoad(false);
            }
        }
        catch (err: unknown) {
            if (err instanceof AxiosError) {
                console.log(err.response?.data);
            }
            console.log("An error occured");
            setLoad(false);
        }
    }

    const createUpdateHaulage = async () => {
        if (haulier !== null && loadingCity !== null && loadingPort !== null && freeTime > 0 && unitTariff > 0 && overtimeTariff > 0 && multiStop > 0 && validUntil !== null && containerTypes.length > 0) {
            try {
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
                        "id": currentEditId,
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
                const response = await postApiHaulageHaulage({body: dataSent});
                if (response !== null && response !== undefined) {
                    setModal2(false);
                    enqueueSnackbar(t('successCreated'), { variant: "success", anchorOrigin: { horizontal: "right", vertical: "top"} });
                    searchHaulages();
                }
                else {
                    enqueueSnackbar(t('errorHappened'), { variant: "error", anchorOrigin: { horizontal: "right", vertical: "top"} });
                }
            }
            catch (err: unknown) {
                if (err instanceof AxiosError) {
                    console.log(err.response?.data);
                }
                console.log("An error occured");
                setLoad(false);
            }
        }
        else {
            enqueueSnackbar(t('fieldsEmptyHaulage'), { variant: "error", anchorOrigin: { horizontal: "right", vertical: "top"} });
        }
    }

    const deleteHaulagePrice = async (id: string) => {
        try {
            const response = await deleteApiHaulageDeleteHaulage({query: { offerId: id }})
            if (response !== null && response !== undefined) {
                enqueueSnackbar(t('rowDeletedSuccess'), { variant: "success", anchorOrigin: { horizontal: "right", vertical: "top"} });
                setModal(false);
                searchHaulages();
            }
            else {
                enqueueSnackbar(t('rowDeletedError'), { variant: "success", anchorOrigin: { horizontal: "right", vertical: "top"} });
            }
        }
        catch (err: unknown) {
            if (err instanceof AxiosError) {
                console.log(err.response?.data);
            }
            console.log("An error occured");
            setLoad(false);
        }
    }
    
    return (
        <div style={{ background: "#fff", borderTopLeftRadius: 20, borderTopRightRadius: 20 }}>
            <SnackbarProvider />
            <Box sx={{ py: 2.5 }}>
                <Typography variant="h5" sx={{mt: {xs: 4, md: 1.5, lg: 1.5 }}} mx={5}><b>{t('listHaulages')}</b></Typography>
                <Grid container spacing={2} mt={0} px={5}>
                    <Grid size={{ xs: 12 }}>
                        <Button variant="contained" sx={actionButtonStyles} onClick={() => { setCurrentEditId(""); resetForm(); setModal2(true); }}>
                            {t('newHaulagePrice')} <AddCircleOutlinedIcon sx={{ ml: 0.5, pb: 0.25, justifyContent: "center", alignItems: "center" }} fontSize="small" />
                        </Button>
                        <Button variant="contained" sx={actionButtonStyles} onClick={() => { setModal5(true); }}>
                            {t('requestHaulagePrice')} <Mail sx={{ ml: 0.5, pb: 0.25, justifyContent: "center", alignItems: "center" }} fontSize="small" />
                        </Button>
                        <Button variant="contained" color="inherit" sx={{ float: "right", backgroundColor: "#fff", textTransform: "none" }} onClick={() => { setModal7(true); }} >{t('createNewHaulier')}</Button>
                    </Grid>
                    <Grid size={{ xs: 12, md: 4 }} mt={1}>
                        <InputLabel htmlFor="company-name" sx={inputLabelStyles}>{t('haulier')}</InputLabel>
                        <CompanySearch id="company-name" value={searchedHaulier} onChange={setSearchedHaulier} category={CategoryEnum.SUPPLIERS} fullWidth />
                    </Grid>
                    <Grid size={{ xs: 12, md: 3 }} mt={1}>
                        <InputLabel htmlFor="loading-city-searched" sx={inputLabelStyles}>{t('loadingCity')}</InputLabel>
                        <AutocompleteSearch id="loading-city-searched" value={searchedLoadingCity} onChange={setSearchedLoadingCity} fullWidth />
                    </Grid>
                    <Grid size={{ xs: 12, md: 3 }} mt={1}>
                        <InputLabel htmlFor="loading-port-searched" sx={inputLabelStyles}><Anchor fontSize="small" sx={inputIconStyles} /> {t('deliveryPort')}</InputLabel>
                        {
                            ports !== null ?
                            <PortAutocomplete id="portLoading" options={ports} value={searchedLoadingPort} onChange={setSearchedLoadingPort} fullWidth /> : <Skeleton />
                        }
                    </Grid>
                    <Grid size={{ xs: 12, md: 2 }} mt={1} sx={{ display: "flex", alignItems: "end" }}>
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
                        <Grid size={{ xs: 12 }}>
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
                            <Grid size={{ xs: 12, md: 8 }}>
                                <Typography sx={{ fontSize: 18, mb: 1 }}><b>{t('haulagePriceInformation')}</b></Typography>
                            </Grid>
                            <Grid size={{ xs: 12, md: 4 }}>
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
                            <Grid size={{ xs: 12, md: 8 }}>
                                <Grid container spacing={2}>
                                    <Grid size={{ xs: 12, md: 6 }} mt={0.25}>
                                        <InputLabel htmlFor="haulier" sx={inputLabelStyles}>{t('haulier')}</InputLabel>
                                        <CompanySearch id="haulier" value={haulier} onChange={setHaulier} category={CategoryEnum.SUPPLIERS} fullWidth />
                                    </Grid>
                                    <Grid size={{ xs: 12, md: 6 }} mt={0.25}>
                                        <InputLabel htmlFor="loading-city" sx={inputLabelStyles}>{t('loadingCity')}</InputLabel>
                                        <AutocompleteSearch id="loading-city" value={loadingCity} onChange={setLoadingCity} fullWidth />
                                    </Grid>
                                    <Grid size={{ xs: 12, md: 6 }} mt={0.25}>
                                        <InputLabel htmlFor="loading-port" sx={inputLabelStyles}><Anchor fontSize="small" sx={inputIconStyles} /> {t('deliveryPort')}</InputLabel>
                                        {
                                            ports !== null ?
                                            <PortAutocomplete id="portLoading" options={ports} value={loadingPort} onChange={setLoadingPort} fullWidth /> : <Skeleton />
                                        }
                                    </Grid>
                                    <Grid size={{ xs: 12, md: 6 }} mt={0.25}>
                                        <InputLabel htmlFor="emptyPickupDepot" sx={inputLabelStyles}>{t('emptyPickupDepot')}</InputLabel>
                                        <BootstrapInput id="emptyPickupDepot" type="text" value={emptyPickupDepot} onChange={(e: any) => setEmptyPickupDepot(e.target.value)} fullWidth />
                                    </Grid>
                                </Grid>
                            </Grid>
                            <Grid size={{ xs: 12, md: 4 }}>
                                <Grid container spacing={2}>
                                    <Grid size={{ xs: 12, md: 12 }} mt={0}>
                                        <InputLabel htmlFor="comment" sx={inputLabelStyles}>{t('comment')}</InputLabel>
                                        <BootstrapInput id="comment" type="text" multiline rows={4.875} value={comment} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setComment(e.target.value)} fullWidth />
                                    </Grid>
                                </Grid>
                            </Grid>
                            <Grid size={{ xs: 12, md: 3 }}>
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
                            <Grid size={{ xs: 12, md: 3 }}>
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
                            <Grid size={{ xs: 12, md: 6 }}>
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
                            <Grid size={{ xs: 12, md: 4 }}>
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
                                        onChange={(e: any, newValue: any) => {
                                            setContainerTypes(newValue);
                                        }}
                                        renderInput={(params: any) => <TextField {...params} sx={{ mt: 1, textTransform: "lowercase" }} />}
                                        fullWidth
                                    /> : <Skeleton />
                                }
                            </Grid>
                            <Grid size={{ xs: 12, md: 2 }}>
                                <InputLabel htmlFor="free-time" sx={inputLabelStyles}>{t('freeTime')} ({t('hours')})</InputLabel>
                                <BootstrapInput id="free-time" type="number" value={freeTime} onChange={(e: any) => setFreeTime(e.target.value)} fullWidth />
                            </Grid>
                            <Grid size={{ xs: 12, md: 2 }}>
                                <InputLabel htmlFor="unitTariff-cs" sx={inputLabelStyles}>{t('unitTariff2')}</InputLabel>
                                <BootstrapInput id="unitTariff-cs" type="number" value={unitTariff} onChange={(e: any) => setUnitTariff(e.target.value)} fullWidth />
                            </Grid>
                            <Grid size={{ xs: 12, md: 2 }}>
                                <InputLabel htmlFor="overtimeTariff-cs" sx={inputLabelStyles}>{t('overtimeTariff')} (/{t('hour')})</InputLabel>
                                <BootstrapInput id="overtimeTariff-cs" type="number" value={overtimeTariff} onChange={(e: any) => setOvertimeTariff(e.target.value)} fullWidth />
                            </Grid>
                            <Grid size={{ xs: 12, md: 2 }}>
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
                <RequestPriceHaulage
                    ports={ports}
                    loadingCity={null}
                    loadingPort={null}
                    closeModal={() => setModal5(false)}
                />
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
                    callBack={getPortsService}
                />
            </BootstrapDialog>
        </div>
    );
}

export default Haulages;
