import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AddOutlined, Delete, Edit, ListOutlined, RestartAltOutlined, Search, StarOutlineOutlined, Visibility } from '@mui/icons-material';
import { Alert, Autocomplete, Box, Button, Chip, DialogActions, DialogContent, Grid, IconButton, InputLabel, NativeSelect, Skeleton, TextField, Typography } from '@mui/material';
import { DataGrid, GridColDef, GridRenderCellParams, GridRowSelectionModel, GridValueFormatterParams } from '@mui/x-data-grid';
import { SnackbarProvider, enqueueSnackbar } from 'notistack';
import { whiteButtonStyles, sizingStyles, BootstrapDialog, BootstrapDialogTitle, buttonCloseStyles, inputLabelStyles, BootstrapInput, datetimeStyles } from '../utils/misc/styles';
import { NavLink } from 'react-router-dom';
import { useMsal, useAccount } from '@azure/msal-react';
import { useTranslation } from 'react-i18next';
import { useAuthorizedBackendApi } from '../api/api';
import { protectedResources } from '../config/authConfig';
import { BackendService } from '../utils/services/fetch';
import { useSelector } from 'react-redux';
import { CategoryEnum, incotermValues, orderExportOptions, orderStatusOptions } from '../utils/constants';
import CompanySearch from '../components/shared/CompanySearch';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { Dayjs } from 'dayjs';
import { getLISShipmentAPI } from '../api/client/shipmentService';
import { AxiosError } from 'axios';
import { getLISTransportAPI } from '../api/client/transportService';
import { PortViewModel } from '../api/client/schemas/transport';
import { ResponseOrdersListDto } from '../api/client/schemas/shipment';

function Orders() {
    const [load, setLoad] = useState<boolean>(true);
    const [loadShips, setLoadShips] = useState<boolean>(true);
    const [loadFavorites, setLoadFavorites] = useState<boolean>(true);
    const [modalFavorites, setModalFavorites] = useState<boolean>(true);
    const [orders, setOrders] = useState<ResponseOrdersListDto[]>([]);
    const [modal, setModal] = useState<boolean>(false);
    const [ships, setShips] = useState<any>(null);
    const [favorites, setFavorites] = useState<any>(null);
    const [ports, setPorts] = useState<PortViewModel[]>([]);
    const [contacts, setContacts] = useState<any>(null);
    const [currentId, setCurrentId] = useState<string>("");
    
    const [contact, setContact] = useState<any>(null);
    const [status, setStatus] = useState<number | null>(null);
    const [fiscal, setFiscal] = useState<number | null>(null);
    const [exportation, setExportation] = useState<boolean | null>(null);
    const [loadingPort, setLoadingPort] = useState<any>(null);
    const [dischargePort, setDischargePort] = useState<any>(null);
    const [etd, setEtd] = useState<Dayjs | null>(null);
    const [eta, setEta] = useState<Dayjs | null>(null);
        
    const [rowSelectionModel, setRowSelectionModel] = useState<GridRowSelectionModel>([]);
    
    const { instance, accounts } = useMsal();
    const account = useAccount(accounts[0] || {});    
    const context = useAuthorizedBackendApi();

    const { getOrders } = getLISShipmentAPI();
    const { getPorts } = getLISTransportAPI();
    
    const navigate = useNavigate();
    const { t } = useTranslation();
    
    var ourPorts: any = useSelector((state: any) => state.masterdata.ports);
    var ourContacts: any = useSelector((state: any) => state.masterdata.contactBusinesses.data);
    
    function createGetRequestUrl(variable1: number, variable2: number, variable3: string, variable4: any, variable5: any, variable6: any, variable7: any, variable8: any) {
        let url = protectedResources.apiLisShipments.endPoint+"/Orders?";
        if (variable1) {
          url += 'Contact=' + encodeURIComponent(variable1) + '&';
        }
        if (variable2) {
          url += 'LoadingPort=' + encodeURIComponent(variable2) + '&';
        }
        if (variable3) {
            url += 'DischargePort=' + encodeURIComponent(variable3) + '&';
        }
        if (variable4 !== null && variable4) {
            url += 'Fiscal=' + encodeURIComponent(String(variable4)) + '&';
        }
        if (variable5 !== null && variable5 !== -1 && variable5 !== "-1" && variable5 !== "ALL" && variable5) {
            url += 'Status=' + encodeURIComponent(String(variable5)) + '&';
        }
        if (variable6 !== null && variable6 !== -1 && variable6 !== "-1" && variable6 !== "ALL" && variable6) {
            url += 'Exportation=' + encodeURIComponent(String(variable6)) + '&';
        }
        if (variable7) {
            url += 'Etd=' + encodeURIComponent(variable7) + '&';
        }
        if (variable8) {
            url += 'Eta=' + encodeURIComponent(variable8) + '&';
        }
        
        if (url.slice(-1) === '&') {
          url = url.slice(0, -1);
        }
        return url;
    }
    
    const columnsOrders: GridColDef[] = [
        // { field: 'orderId', headerName: t('id'), flex: 0.5 },
        { field: 'orderStatus', headerName: t('Status'), renderCell: (params: GridRenderCellParams) => {
            return (
                <Box>
                    <Chip 
                        label={orderStatusOptions.find((elm: any) => elm.value === params.row.orderStatus)?.label} 
                        color={orderStatusOptions.find((elm: any) => elm.value === params.row.orderStatus)?.color || "default"} 
                        sx={{ fontSize: 9.5, textTransform: "none" }}
                    />
                </Box>
            );
        }, minWidth: 100 },
        { field: 'orderNumber', headerName: t('orderNumber') },
        { field: 'orderDate', headerName: t('orderDate'), renderCell: (params: GridRenderCellParams) => {
            return (
                <Box>{params.row.orderDate.slice(0,10)}</Box>
            );
        } },
        { field: 'fiscalYear', headerName: t('fiscalYear') },        
        { field: 'sellerId', headerName: t('seller'), renderCell: (params: GridRenderCellParams) => {
            return (
                <Box>
                    {
                        contacts !== null && contacts !== undefined && params.row.sellerId !== null ? 
                        <>
                            {
                                contacts.find((elm: any) => elm.contactId === params.row.sellerId) !== undefined ? 
                                contacts.find((elm: any) => elm.contactId === params.row.sellerId).contactName : "N/A"
                            }
                        </> : <span>N/A</span>
                    }
                </Box>
            );
        }, minWidth: 220 },
        { field: 'buyerId', headerName: t('buyer'), renderCell: (params: GridRenderCellParams) => {
            return (
                <Box>
                    {
                        contacts !== null && contacts !== undefined && params.row.buyerId !== null ? 
                        <>
                            {
                                contacts.find((elm: any) => elm.contactId === params.row.buyerId) !== undefined ? 
                                contacts.find((elm: any) => elm.contactId === params.row.buyerId).contactName : "N/A"
                            }
                        </> : <span>N/A</span>
                    }
                </Box>
            );
        }, minWidth: 220 },
        { field: 'customerId', headerName: t('customer'), renderCell: (params: GridRenderCellParams) => {
            return (
                <Box>
                    {
                        contacts !== null && contacts !== undefined && params.row.customerId !== null ? 
                        <>
                            {
                                contacts.find((elm: any) => elm.contactId === params.row.customerId) !== undefined ? 
                                contacts.find((elm: any) => elm.contactId === params.row.customerId).contactName : "N/A"
                            }
                        </> : <span>N/A</span>
                    }
                </Box>
            );
        }, minWidth: 220 },
        
        { field: 'departurePort', headerName: t('loadingPort'), renderCell: (params: GridRenderCellParams) => {
            return (
                <Box>
                    {
                        ports !== null && ports !== undefined && params.row.departurePort !== null ? 
                        <>
                            {
                                //ports.find((elm: any) => elm.portId === params.row.departurePort) !== undefined ? 
                                //ports.find(x => x.portId === params.row.departurePort).portName : "N/A"
                            }
                        </> : <span>N/A</span>
                    }
                </Box>
            );
        } },
        { field: 'estimatedDepartureDate', headerName: t('textEtd'), valueFormatter: (params: GridValueFormatterParams) => `${(new Date(params.value)).toLocaleString().slice(0,10)}` },
        { field: 'destinationPort', headerName: t('dischargePort'), renderCell: (params: GridRenderCellParams) => {
            return (
                <Box>
                    {
                        ports !== null && ports !== undefined && params.row.destinationPort !== null ? 
                        <>
                            {
                                //ports.find((elm: any) => elm.portId === params.row.destinationPort) !== undefined ? 
                                //ports.find((elm: any) => elm.portId === params.row.destinationPort).portName : "N/A"
                            }
                        </> : <span>N/A</span>
                    }
                </Box>
            );
        } },
        { field: 'estimatedArrivalDate', headerName: t('textEta'), valueFormatter: (params: GridValueFormatterParams) => `${(new Date(params.value)).toLocaleString().slice(0,10)}` },
        
        // { field: 'shipId', headerName: t('ship') },
        { field: 'shipId', headerName: t('ship'), renderCell: (params: GridRenderCellParams) => {
            return (
                <Box>
                    {
                        ships !== null && ships !== undefined && params.row.shipId !== null ? 
                        <>
                            {
                                ships.find((elm: any) => elm.shipId === params.row.shipId) !== undefined ? 
                                ships.find((elm: any) => elm.shipId === params.row.shipId).shipName : "N/A"
                            }
                        </> : <span>N/A</span>
                    }
                </Box>
            );
        }, minWidth: 220 },
        // { field: 'shipLineId', headerName: t('shippingLine') },
        { field: 'shipLineId', headerName: t('shippingLine'), renderCell: (params: GridRenderCellParams) => {
            return (
                <Box>
                    {
                        contacts !== null && contacts !== undefined && params.row.shipLineId !== null ? 
                        <>
                            {
                                contacts.find((elm: any) => elm.contactId === params.row.shipLineId) !== undefined ? 
                                contacts.find((elm: any) => elm.contactId === params.row.shipLineId).contactName : "N/A"
                            }
                        </> : <span>N/A</span>
                    }
                </Box>
            );
        }, minWidth: 220 },
        
        { field: 'freightShipmentType', headerName: t('packageType') },
        { field: 'yyyy', headerName: t('products') },
        { field: 'zzzz', headerName: t('margin') },
        { field: 'wwww', headerName: t('ratio') },
        
        // { field: 'refClient', headerName: t('client') },
        // { field: 'refShippingAgent', headerName: t('carrier') },
        // // { field: 'freightShipmentType', headerName: t('packageType') },
        { field: 'www', headerName: t('Actions'), renderCell: (params: GridRenderCellParams) => {
            return (
                <Box sx={{ my: 1, mr: 1 }}>
                    <IconButton component={NavLink} to={"/admin/edit-order/"+params.row.orderId} title="Edit the order" sx={{ mr: 1 }}>
                        <Edit fontSize="small" />
                    </IconButton>
                    <IconButton onClick={() => { setCurrentId(params.row.orderId); setModal(true); }}>
                        <Delete fontSize="small" />
                    </IconButton>
                </Box>
            );
        }, minWidth: 120 }
    ];

    const getOrdersService = async () => {
        try
        {
            const _orders = await getOrders({
                Fiscal: 2024
            })
            setOrders(_orders.data)
        }
        catch(err:unknown)
        {
            if(err instanceof AxiosError){
                console.log(err.response?.data)
            }
            console.log("An error occured")
        }
        finally{
            setLoad(false);
        }
    }

    const getPortsService = async () => {
        try
        {
            const ports = await getPorts()
            setPorts(ports.data)
        }
        catch(err:unknown)
        {
            if(err instanceof AxiosError){
                console.log(err.response?.data)
            }
            console.log("An error occured")
        }
    }
    
    useEffect(() => {
        getPortsService();
        getOrdersService();
    }, []);

    useEffect(() => {
       // getPorts();
        getContacts();
        getShips();
        getFavorites();
    }, [account, instance, context]);

    // useEffect(() => {
    //     // console.log("Orders : ", orders);
    //     if (contacts !== null && ports !== null && ships !== null) {
    //         getOrders2();
    //     }
    // }, [contacts, ports, ships]);
    
    // const getPorts = async () => {
    //     if (account && instance && context) {
    //         try {
    //             if (ourPorts !== null && ourPorts !== undefined && ourPorts.length !== 0) {
    //                 // console.log(ourPorts);
    //                 setPorts(ourPorts);
    //             }
    //             else {
    //                 const response = await (context?.service as BackendService<any>).getWithToken(protectedResources.apiLisTransport.endPoint+"/Port/Ports?pageSize=2000", context.tokenTransport);
    //                 if (response !== null && response !== undefined) {
    //                     console.log(response);
    //                     setPorts(response);
    //                 }
    //             }
    //         }
    //         catch (err: any) {
    //             console.log(err);
    //         }
    //     }
    // }
    
    const getContacts = async () => {
        if (account && instance && context) {
            try {
                if (ourContacts !== null && ourContacts !== undefined && ourContacts.length !== 0) {
                    // console.log(ourContacts);
                    setContacts(ourContacts);
                }
                else {
                    const response = await (context?.service as BackendService<any>).getWithToken(protectedResources.apiLisCrm.endPoint+"/Contact/GetContacts?pageSize=4000", context.tokenCrm);
                    if (response !== null && response !== undefined) {
                        console.log(response.data);
                        setContacts(response.data);
                    }
                }
            }
            catch (err: any) {
                console.log(err);
            }
        }
    }
    
    const getShips = async () => {
        if (account && instance && context) {
            try {
                setLoadShips(true);
                const response = await (context?.service as BackendService<any>).getSingle(protectedResources.apiLisShipments.endPoint+"/Ships?count=1000");
                if (response !== null && response !== undefined) {
                    // console.log(response);
                    setShips(response.$values);
                    setLoadShips(false);
                }
                else {
                    setLoadShips(false);
                }
            }
            catch (err: any) {
                setLoadShips(false);
            }
        }
    }

    const getFavorites = async () => {
        if (account && instance && context) {
            try {
                setLoadFavorites(true);
                const response = await (context?.service as BackendService<any>).getSingle(protectedResources.apiLisShipments.endPoint+"/Favoris?count=1000");
                if (response !== null && response !== undefined) {
                    // console.log(response);
                    setFavorites(response.$values);
                    setLoadFavorites(false);
                }
                else {
                    setLoadFavorites(false);
                }
            }
            catch (err: any) {
                setLoadFavorites(false);
            }
        }
    }

    // const getOrders2 = async () => {
    //     if (account && instance && context) {
    //         setLoad(true);
    //         const response = await (context?.service as BackendService<any>).getSingle(protectedResources.apiLisShipments.endPoint+"/Orders");
    //         if (response !== null && response !== undefined) {
    //             console.log(response);
    //             setOrders(response.$values.filter((elm: any) => elm.fiscalYear !== 2014));
    //             setLoad(false);
    //         }
    //         else {
    //             setLoad(false);
    //         }
    //     }
    // }
    
    const deleteOrder = async (id: string) => {
        if (account && instance && context) {
            try {
                const response = await (context?.service as any).delete(protectedResources.apiLisShipments.endPoint+"/Orders/"+id);
                enqueueSnackbar(t('orderDeleted'), { variant: "success", anchorOrigin: { horizontal: "right", vertical: "top"} });
                setModal(false);
                getOrdersService();
            }
            catch (err: any) {
                enqueueSnackbar(t('errorHappened'), { variant: "error", anchorOrigin: { horizontal: "right", vertical: "top"} });
                console.log(err);
            }
        }
    }

    const searchOrders = async () => {
        if (account && instance && context) {
            setLoad(true);
            var requestFormatted = createGetRequestUrl(contact?.contactId, loadingPort?.portId, dischargePort?.portId, fiscal, status, exportation, etd, eta);
            const response = await (context?.service as BackendService<any>).getWithToken(requestFormatted, context.tokenLogin);
            if (response !== null && response !== undefined) {
                setOrders(response.$values.filter((elm: any) => elm.fiscalYear !== 2014));
                setLoad(false);
            }
            else {
                setLoad(false);
            }
        }
    }

    const addFavorite = async () => {
        if (account && instance && context) {
            console.log(rowSelectionModel);
            try {
                if (rowSelectionModel.length !== 0) {
                    var dataSent = {
                        "userId": account.name,
                        "orderId": rowSelectionModel[0],
                    }
                    const response = await (context?.service as BackendService<any>).postWithToken(protectedResources.apiLisShipments.endPoint+"/Favoris", dataSent, context.tokenLogin);
                    if (response !== undefined && response !== null) {
                        enqueueSnackbar("The order has been added to favorites!", { variant: "success", anchorOrigin: { horizontal: "right", vertical: "top"} });
                    }
                }
            }
            catch (err: any) {
                console.log(err);
                enqueueSnackbar("An error happened!", { variant: "error", anchorOrigin: { horizontal: "right", vertical: "top"} });
            }
        }
    }

    
    
    return (
        <div style={{ background: "#fff", borderTopLeftRadius: 20, borderTopRightRadius: 20 }}>
            <SnackbarProvider />
            <Box py={2.5} sx={{ minWidth: { xs: "100vw", md: "100%" }}}>
                <Typography variant="h5" sx={{mt: {xs: 4, md: 1.5, lg: 1.5 }}} px={5}><b>{t('listOrders')}</b></Typography>
                <Grid container spacing={2} mt={0} px={5}>
                    <Grid item xs={12}>
                        <Button 
                            color="inherit" variant="contained" 
                            sx={whiteButtonStyles} style={{ float: "right" }} 
                            onClick={() => { setModalFavorites(true); }}
                        >
                            {t('Favorites')} <ListOutlined sx={{ ml: 0.5, pb: 0.45, justifyContent: "center", alignItems: "center" }} fontSize="small" />
                        </Button>
                        <Button 
                            color="inherit" variant="contained" 
                            sx={whiteButtonStyles} style={{ float: "right", marginRight: "5px" }} 
                            onClick={() => { addFavorite(); }} disabled={rowSelectionModel !== null && rowSelectionModel.length === 0}
                        >
                            {t('Add favorite')} <StarOutlineOutlined sx={{ ml: 0.5, pb: 0.45, justifyContent: "center", alignItems: "center" }} fontSize="small" />
                        </Button>
                        <Button color="inherit" variant="contained" sx={whiteButtonStyles} style={{ float: "right", marginRight: "5px" }} onClick={() => { getOrdersService(); }}>
                            {t('reload')} <RestartAltOutlined sx={{ ml: 0.5, pb: 0.45, justifyContent: "center", alignItems: "center" }} fontSize="small" />
                        </Button>
                        <Button 
                            color="inherit" variant="contained" sx={whiteButtonStyles} 
                            style={{ float: "right", marginRight: "5px" }} href="/admin/new-order"
                        >
                            {t('New order')} <AddOutlined sx={{ ml: 0.5, pb: 0.45, justifyContent: "center", alignItems: "center" }} fontSize="small" />
                        </Button>
                    </Grid>
                    <Grid item xs={4}>
                        <InputLabel htmlFor="contact" sx={inputLabelStyles}>{t('Contact')}</InputLabel>
                        <CompanySearch id="contact" value={contact} onChange={setContact} category={CategoryEnum.CUSTOMERS} fullWidth />
                    </Grid>
                    <Grid item xs={4}>
                        <InputLabel htmlFor="loadingPort" sx={inputLabelStyles}>{t('portLoading')}</InputLabel>
                        {
                            ports !== null ?
                            <Autocomplete
                                disablePortal
                                id="loadingPort"
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
                                onChange={(e: any, value: any) => { 
                                    setLoadingPort(value);
                                }}
                                fullWidth
                            /> : <Skeleton />
                        }
                    </Grid>
                    <Grid item xs={4}>
                        <InputLabel htmlFor="dischargePort" sx={inputLabelStyles}>{t('portDischarge')}</InputLabel>
                        {
                            ports !== null ?
                            <Autocomplete
                                disablePortal
                                id="dischargePort"
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
                                value={dischargePort}
                                sx={{ mt: 1 }}
                                renderInput={(params: any) => <TextField {...params} />}
                                onChange={(e: any, value: any) => { 
                                    setDischargePort(value);
                                }}
                                fullWidth
                            /> : <Skeleton />
                        }
                    </Grid>
                    <Grid item xs={2}>
                        <InputLabel htmlFor="status" sx={inputLabelStyles}>{t('Status')}</InputLabel>
                        <NativeSelect
                            id="status"
                            value={status}
                            onChange={(e: any) => { setStatus(e.target.value); }}
                            input={<BootstrapInput />}
                            fullWidth
                        >
                            {
                                orderStatusOptions.map((row: any, i: number) => (
                                    <option key={"orderStatus-"+i} value={row.value}>{row.label}</option>
                                ))
                            }
                        </NativeSelect>
                    </Grid>
                    <Grid item xs={2}>
                        <InputLabel htmlFor="fiscal" sx={inputLabelStyles}>{t('fiscalYear')}</InputLabel>
                        <BootstrapInput id="fiscal" type="number" value={fiscal} onChange={(e: any) => setFiscal(e.target.value)} fullWidth />
                    </Grid>
                    <Grid item xs={2}>
                        <InputLabel htmlFor="exportation" sx={inputLabelStyles}>{t('Exportation')}</InputLabel>
                        <NativeSelect
                            id="exportation"
                            value={exportation}
                            onChange={(e: any) => { setExportation(e.target.value); }}
                            input={<BootstrapInput />}
                            fullWidth
                        >
                            {
                                orderExportOptions.map((row: any, i: number) => (
                                    <option key={"orderExportation-"+i} value={row.value}>{row.label}</option>
                                ))
                            }
                        </NativeSelect>
                    </Grid>
                    <Grid item xs={2}>
                        <InputLabel htmlFor="etd" sx={inputLabelStyles}>{t('ETD')}</InputLabel>
                        <LocalizationProvider dateAdapter={AdapterDayjs}>
                            <DatePicker 
                                value={etd}
                                format="DD/MM/YYYY" 
                                onChange={(value: any) => { setEtd(value) }}
                                slotProps={{ 
                                    actionBar: { actions: ['clear'] },
                                    textField: { id: "etd", fullWidth: true, sx: datetimeStyles }, 
                                    inputAdornment: { sx: { position: "relative", right: "11.5px" } }
                                }}
                            />
                        </LocalizationProvider>
                    </Grid>
                    <Grid item xs={2}>
                        <InputLabel htmlFor="eta" sx={inputLabelStyles}>{t('ETA')}</InputLabel>
                        <LocalizationProvider dateAdapter={AdapterDayjs}>
                            <DatePicker 
                                value={eta}
                                format="DD/MM/YYYY" 
                                onChange={(value: any) => { setEta(value) }}
                                slotProps={{ 
                                    actionBar: { actions: ['clear'] },
                                    textField: { id: "eta", fullWidth: true, sx: datetimeStyles }, 
                                    inputAdornment: { sx: { position: "relative", right: "11.5px" } } 
                                }}
                            />
                        </LocalizationProvider>
                    </Grid>
                    <Grid item xs={2} sx={{ display: "flex", alignItems: "end" }}>
                        <Button 
                            variant="contained" 
                            color="inherit"
                            startIcon={<Search />} 
                            size="large"
                            sx={{ backgroundColor: "#fff", color: "#333", textTransform: "none", mb: 0.15 }}
                            onClick={searchOrders}
                            fullWidth
                        >
                            {t('search')}
                        </Button>
                    </Grid>                     
                </Grid>
                <Box>
                    {
                        !load ? 
                        <Grid container spacing={2} mt={0} px={5}>
                            <Grid item xs={12}>
                                {
                                    orders !== null && orders.length !== 0 ?
                                    <Box sx={{ overflow: "hidden" }}>
                                        <DataGrid
                                            rows={orders}
                                            columns={columnsOrders}
                                            getRowId={(row: any) => row?.orderId}
                                            getRowHeight={() => "auto" }
                                            sx={sizingStyles}
                                            onRowSelectionModelChange={(newRowSelectionModel: any) => {
                                                setRowSelectionModel(newRowSelectionModel);
                                            }}
                                            rowSelectionModel={rowSelectionModel}
                                            // disableRowSelectionOnClick
                                            onRowDoubleClick={((params: any) => navigate("/admin/edit-order/"+params.row.orderId))}
                                            style={{ fontSize: "12px" }}
                                        />
                                        {/* {
                                            contacts !== null ? 
                                             : <Skeleton />
                                        } */}
                                    </Box> : <Alert severity="warning">{t('noResults')}</Alert>
                                }
                            </Grid>
                        </Grid> : <Skeleton sx={{ mx: 5, mt: 3 }} />
                    }
                </Box>
            </Box>
            <BootstrapDialog open={modal} onClose={() => setModal(false)} maxWidth="sm" fullWidth>
                <BootstrapDialogTitle id="custom-dialog-title" onClose={() => setModal(false)}>
                    <b>{t('confirmDeletion')}</b>
                </BootstrapDialogTitle>
                <DialogContent dividers>
                    <Typography variant="subtitle1" gutterBottom px={2}>
                        {t('areYouSureDeleteOrder')}
                    </Typography>
                </DialogContent>
                <DialogActions>
                    <Button variant="contained" color="secondary" className="mr-3" onClick={() => { deleteOrder(currentId); }} sx={{ textTransform: "none" }}>{t('delete')}</Button>
                    <Button variant="contained" onClick={() => setModal(false)} sx={buttonCloseStyles}>{t('close')}</Button>
                </DialogActions>
            </BootstrapDialog>

            <BootstrapDialog open={modal} onClose={() => setModalFavorites(false)} maxWidth="sm" fullWidth>
                <BootstrapDialogTitle id="custom-dialog-title" onClose={() => setModalFavorites(false)}>
                    <b>{t('Favorites')}</b>
                </BootstrapDialogTitle>
                <DialogContent dividers>
                    
                </DialogContent>
                <DialogActions>
                    <Button variant="contained" onClick={() => setModalFavorites(false)} sx={buttonCloseStyles}>{t('close')}</Button>
                </DialogActions>
            </BootstrapDialog>
        </div>
    );
}

export default Orders;
