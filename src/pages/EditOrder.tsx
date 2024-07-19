import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { AddOutlined, Delete, Edit, ExpandMore, ReplayOutlined, RestartAltOutlined, Visibility } from '@mui/icons-material';
import { Accordion, AccordionDetails, AccordionSummary, Alert, Autocomplete, Box, Button, Chip, DialogActions, DialogContent, Divider, Grid, IconButton, InputLabel, ListItem, ListItemText, NativeSelect, Skeleton, Tab, Tabs, TextField, Typography } from '@mui/material';
import { DataGrid, GridColDef, GridRenderCellParams, GridValueFormatterParams } from '@mui/x-data-grid';
import { SnackbarProvider, enqueueSnackbar } from 'notistack';
import { whiteButtonStyles, sizingStyles, BootstrapDialog, BootstrapDialogTitle, buttonCloseStyles, CustomTabPanel, BootstrapInput, inputLabelStyles, datetimeStyles, actionButtonStyles } from '../utils/misc/styles';
import { NavLink } from 'react-router-dom';
import { useMsal, useAccount } from '@azure/msal-react';
import { useTranslation } from 'react-i18next';
import { useAuthorizedBackendApi } from '../api/api';
import { protectedResources } from '../config/authConfig';
import { BackendService } from '../utils/services/fetch';
import { useSelector } from 'react-redux';
import ClientSearch from '../components/shared/ClientSearch';
import CompanySearch from '../components/shared/CompanySearch';
import { CategoryEnum, allPackages, dataServices, dataServices2, incotermDestinationValues, incotermValues } from '../utils/constants';
import AutocompleteSearch from '../components/shared/AutocompleteSearch';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs, { Dayjs } from 'dayjs';

function EditOrder() {
    const [load, setLoad] = useState<boolean>(true);
    const [loadShips, setLoadShips] = useState<boolean>(true);
    const [loadOrderServicesBuy, setLoadOrderServicesBuy] = useState<boolean>(true);
    const [loadOrderServicesSell, setLoadOrderServicesSell] = useState<boolean>(true);
    const [loadCreate, setLoadCreate] = useState<boolean>(false);
    const [orders, setOrders] = useState<any>(null);
    const [modal, setModal] = useState<boolean>(false);
    const [currentId, setCurrentId] = useState<string>("");
    const [ports, setPorts] = useState<any>(null);
    const [cities, setCities] = useState<any>(null);
    const [products, setProducts] = useState<any>(null);
    const [services, setServices] = useState<any>(null);
    const [contacts, setContacts] = useState<any>(null);
    const [ships, setShips] = useState<any>(null);
    const [orderData, setOrderData] = useState<any>(null);
    const [tabValue, setTabValue] = useState<number>(0);
    const [modalCargo, setModalCargo] = useState<boolean>(false);
    const [modalService, setModalService] = useState<boolean>(false);

    const [customer, setCustomer] = useState<any>(null);
    const [seller, setSeller] = useState<any>(null);
    const [buyer, setBuyer] = useState<any>(null);
    const [ship, setShip] = useState<any>(null);
    const [referenceCustomer, setReferenceCustomer] = useState<string>("");
    const [referenceSeller, setReferenceSeller] = useState<string>("");
    const [referenceBuyer, setReferenceBuyer] = useState<string>("");
    const [incotermFrom, setIncotermFrom] = useState<string>("");
    const [incotermTo, setIncotermTo] = useState<string>("");
    const [incotermFromCity, setIncotermFromCity] = useState<any>(null);
    const [incotermToCity, setIncotermToCity] = useState<any>(null);
    
    const [carrier, setCarrier] = useState<any>(null);
    const [carrierAgent, setCarrierAgent] = useState<any>(null);
    const [bookingRef, setBookingRef] = useState<string>("");
    const [vessel, setVessel] = useState<any>(null);
    const [portLoading, setPortLoading] = useState<any>(null);
    const [portDischarge, setPortDischarge] = useState<any>(null);

    const [etd, setEtd] = useState<Dayjs | null>(null);
    const [eta, setEta] = useState<Dayjs | null>(null);
    
    const [quantity, setQuantity] = useState<number>(0);
    const [weight, setWeight] = useState<number>(0);
    const [volume, setVolume] = useState<number>(0);
    const [marks, setMarks] = useState<string>("");
    const [packageType, setPackageType] = useState<string>("");
    const [product, setProduct] = useState<string>("");
    const [number, setNumber] = useState<string>("");
    const [seal, setSeal] = useState<string>("");
    
    const [orderNumber, setOrderNumber] = useState<string>("");
    const [orderServices, setOrderServices] = useState<any>(null);
    
    const [service, setService] = useState<any>(null);
    const [servicePrice, setServicePrice] = useState<number>(0);
    const [serviceQuantity, setServiceQuantity] = useState<number>(1);
    const [serviceSupplier, setServiceSupplier] = useState<any>(null);
    const [serviceType, setServiceType] = useState<string>("");
    
    const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
        setTabValue(newValue);
    };

    const { instance, accounts } = useMsal();
    const account = useAccount(accounts[0] || {});    
    const context = useAuthorizedBackendApi();
    
    let { id } = useParams();
    const { t } = useTranslation();
    
    var ourCities: any = useSelector((state: any) => state.masterdata.cities);
    var ourPorts: any = useSelector((state: any) => state.masterdata.ports);
    var ourProducts: any = useSelector((state: any) => state.masterdata.products);
    var ourServices: any = useSelector((state: any) => state.masterdata.services);
    var ourContacts: any = useSelector((state: any) => state.masterdata.contactBusinesses.data);
    
    const columnsServices: GridColDef[] = [
        // { field: 'orderId', headerName: t('id'), flex: 0.5 },
        // { field: 'serviceName', headerName: t('Service'), flex: 2 },
        { field: 'serviceId', headerName: t('Service'), renderCell: (params: GridRenderCellParams) => {
            return (
                <Box>
                    {
                        services !== null && services !== undefined && params.row.serviceId !== null ? 
                        <>
                            {
                                services.find((elm: any) => elm.serviceId === params.row.serviceId) !== undefined ? 
                                services.find((elm: any) => elm.serviceId === params.row.serviceId).serviceName : "N/A"
                            }
                        </> : <span>N/A</span>
                    }
                </Box>
            );
        }, flex: 2 },
        { field: 'quantity', headerName: t('Qty'), flex: 0.5 },
        { field: 'unitPrice', headerName: t('price'), renderCell: (params: GridRenderCellParams) => {
            return (
                <Box>{params.row.unitPrice} €</Box>
            );
        }, flex: 0.75 },
        { field: 'subTotal', headerName: t('Total'), renderCell: (params: GridRenderCellParams) => {
            return (
                <Box>{params.row.unitPrice*params.row.quantity} €</Box>
            );
        }, flex: 0.75 },
        { field: 'contactId', headerName: t('supplier'), renderCell: (params: GridRenderCellParams) => {
            return (
                <Box>
                    {
                        contacts !== null && contacts !== undefined && params.row.contactId !== null ? 
                        <>
                            {
                                contacts.find((elm: any) => elm.contactId === params.row.contactId) !== undefined ? 
                                contacts.find((elm: any) => elm.contactId === params.row.contactId).contactName : "N/A"
                            }
                        </> : <span>N/A</span>
                    }
                </Box>
            );
        }, flex: 2 },
        // { field: 'contactName', headerName: t('supplier'), flex: 2 },
        { field: 'www', headerName: t('Actions'), renderCell: (params: GridRenderCellParams) => {
            return (
                <Box sx={{ my: 1 }}>
                    <IconButton 
                        size="small" title="Edit the service" 
                        onClick={() => { 
                            setModalService(true);
                            setCurrentId(params.row.tag);
                            setServiceSupplier(contacts.find((elm: any) => elm.contactId === params.row.contactId));
                            setService(services.find((elm: any) => elm.serviceId === params.row.serviceId));
                            setServiceQuantity(params.row.quantity);
                            setServicePrice(params.row.unitPrice);
                            setServiceType(params.row.transactionType);
                        }} 
                        sx={{ mr: 0.5 }}
                    >
                        <Edit fontSize="small" />
                    </IconButton>
                    <IconButton 
                        size="small" title="Delete the service" 
                        onClick={() => { 
                            // setCurrentId(params.row.orderId); setModal(true);
                            deleteOrderService(params.row.tag); 
                        }}
                    >
                        <Delete fontSize="small" />
                    </IconButton>
                </Box>
            );
        } }
    ];
        
    const calculateTotalPrice = (type: string) => {
        // console.log("Servs : ", orderServices);
        return orderServices.filter((elm: any) => elm.transactionType === type).reduce((total: any, row: any) => total + row.unitPrice*row.quantity, 0);
    };
    
    useEffect(() => {
        // setPorts(ourPorts);
        // setProducts(ourProducts);
        // setServices(ourServices);
        // setContacts(ourContacts);
        // setCities(ourCities);
        
        getPorts();
        getProducts();
        getServices();
        getContacts();
        getCities();
        getShips();
        getOrderServices();
        // loadOrder();
    }, [account, instance, context]);

    useEffect(() => {
        loadOrder();
    }, [contacts, ports, cities, ships]);
    
    const loadOrder = async () => {
		if (account && instance && context && contacts !== null && ports !== null && cities !== null && ships !== null && id !== undefined) {
            setLoad(true);
            const response = await (context?.service as BackendService<any>).getSingle(protectedResources.apiLisShipments.endPoint+"/Orders/"+id);
            if (response !== null && response !== undefined) {
                console.log(response);
                setOrderData(response);
                // Order data import
                console.log(contacts);
                setSeller(contacts.find((elm: any) => elm.contactId === response.sellerId));
                setCustomer(contacts.find((elm: any) => elm.contactId === response.customerId));
                setBuyer(contacts.find((elm: any) => elm.contactId === response.buyerId));
                setCarrier(contacts.find((elm: any) => elm.contactId === response.shipLineId));
                setCarrierAgent(contacts.find((elm: any) => elm.contactId === response.shippingAgent));
                
                setPortLoading(ports.find((elm: any) => elm.portId === response.departurePort));
                setPortDischarge(ports.find((elm: any) => elm.portId === response.destinationPort));

                setEtd(dayjs(response.estimatedDepartureDate));
                setEta(dayjs(response.estimatedArrivalDate));

                setIncotermFrom(response.incoTerm);
                setIncotermTo(response.incotermDestination);
                setIncotermFromCity(cities.find((elm: any) => elm.id === response.city));
                setIncotermToCity(cities.find((elm: any) => elm.id === response.cityIncotermTo));
                setBookingRef(response.refShippingAgent);
                setVessel(String(response.shipId));
                setShip(ships.find((elm: any) => elm.shipId === Number(response.shipId)));

                setReferenceSeller(response.refSeller);
                setReferenceCustomer(response.refClient);
                setReferenceBuyer(response.refBuyer);
                
                setOrderNumber(response.orderNumber);
                // Order data import end
                setLoad(false);
            }
            else {
                setLoad(false);
            }
        }
	}

    const getPorts = async () => {
        if (account && instance && context) {
            if (ourPorts !== undefined && ourPorts.length !== 0) {
                console.log(ourPorts);
                setPorts(ourPorts);
            }
            else {
                const response = await (context?.service as BackendService<any>).getWithToken(protectedResources.apiLisTransport.endPoint+"/Port/Ports?pageSize=2000", context.tokenTransport);
                if (response !== null && response !== undefined) {
                    console.log(response);
                    setPorts(response);
                }
            }
        }
    }

    const getProducts = async () => {
        if (account && instance && context) {
            if (ourProducts !== undefined && ourProducts.length !== 0) {
                console.log(ourProducts);
                setProducts(ourProducts);
            }
            else {
                const response = await (context?.service as BackendService<any>).getWithToken(protectedResources.apiLisTransport.endPoint+"/Service?pageSize=1000", context.tokenTransport);
                if (response !== null && response !== undefined) {
                    console.log(response);
                    setProducts(response);
                }
            }
        }
    }

    const getServices = async () => {
        if (account && instance && context) {
            if (ourServices !== undefined && ourServices.length !== 0) {
                console.log(ourServices);
                setServices(ourServices);
            }
            else {
                const response = await (context?.service as BackendService<any>).getWithToken(protectedResources.apiLisTransport.endPoint+"/Product?pageSize=500", context.tokenTransport);
                if (response !== null && response !== undefined) {
                    console.log(response);
                    setServices(response);
                }
            }
        }
    }

    const getCities = async () => {
        if (account && instance && context) {
            if (ourCities !== undefined && ourCities.length !== 0) {
                console.log(ourCities);
                setCities(ourCities);
            }
            else {
                const response = await (context?.service as BackendService<any>).getWithToken(protectedResources.apiLisTransport.endPoint+"/City/Cities", context.tokenTransport);
                if (response !== null && response !== undefined) {
                    console.log(response);
                    setCities(response);
                }
            }
        }
    }

    const getContacts = async () => {
        if (account && instance && context) {
            if (ourContacts !== undefined && ourContacts.length !== 0) {
                console.log(ourContacts);
                setContacts(ourContacts);
            }
            else {
                const response = await (context?.service as BackendService<any>).getWithToken(protectedResources.apiLisCrm.endPoint+"/Contact/GetContacts?pageSize=4000", context.tokenCrm);
                if (response !== null && response !== undefined) {
                    console.log(response);
                    setContacts(response.data);
                }
            }
        }
    }

    const getShips = async () => {
        if (account && instance && context) {
            try {
                setLoadShips(true);
                const response = await (context?.service as BackendService<any>).getSingle(protectedResources.apiLisShipments.endPoint+"/Ships?count=1000");
                if (response !== null && response !== undefined) {
                    console.log(response);
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

    const getOrderServices = async (type: string = "") => {
        if (account && instance && context) {
            if (id !== undefined) {
                if (type === "") {
                    setLoadOrderServicesBuy(true);
                    setLoadOrderServicesSell(true);
                }
                if (type === "Buy") {
                    setLoadOrderServicesBuy(true);
                }
                if (type === "Sell") {
                    setLoadOrderServicesSell(true);
                }
                const response = await (context?.service as BackendService<any>).getSingle(protectedResources.apiLisShipments.endPoint+"/Orders/"+id+"/services");
                if (response !== null && response !== undefined) {
                    console.log(response);
                    setOrderServices(response.$values);
                    setLoadOrderServicesBuy(false);
                    setLoadOrderServicesSell(false);
                }
                else {
                    setLoadOrderServicesBuy(false);
                    setLoadOrderServicesSell(false);
                }
            }
        }
    }

    const addOrderService = async () => {
        if (account && instance && context) {
            try {
                // setLoadCreate(true);
                var dataSent = {};
                if (orderData !== null && customer !== null) {
                    if (currentId !== "") {
                        dataSent = {
                            "orderId": id,
                            "tag": currentId,
                            "serviceId": service.serviceId,
                            "contactId": serviceSupplier.contactId,
                            "quantity": Number(serviceQuantity),
                            "unitPrice": Number(servicePrice),
                            "comment": "",
                            "transactionType": serviceType,
                            "invoiceId": 1,
                            "currencyId": 1,
                            "currencyRate": 1,
                            "voucherId": 0,
                            "position": 1
                        };
                        const response = await (context?.service as BackendService<any>).putWithToken(protectedResources.apiLisShipments.endPoint+"/Orders/"+id+"/services/"+currentId, dataSent, context.tokenLogin);
                        if (response !== undefined && response !== null) {
                            enqueueSnackbar("The order service has been created with success!", { variant: "success", anchorOrigin: { horizontal: "right", vertical: "top"} });
                            setModalService(false);
                            getOrderServices();
                        }
                        else {
                            setModalService(false);
                            getOrderServices();
                        }
                    }
                    else {
                        dataSent = {
                            "orderId": id,
                            // "tag": "d290f1ee-6c54-4b01-90e6-d701748f0851",
                            "serviceId": service.serviceId,
                            "contactId": serviceSupplier.contactId,
                            "quantity": Number(serviceQuantity),
                            "unitPrice": Number(servicePrice),
                            "comment": "",
                            "transactionType": serviceType,
                            "invoiceId": 1,
                            "currencyId": 1,
                            "currencyRate": 1,
                            "voucherId": 0,
                            "position": 1
                        };
                        const response = await (context?.service as BackendService<any>).postWithToken(protectedResources.apiLisShipments.endPoint+"/Orders/"+id+"/services", dataSent, context.tokenLogin);
                        if (response !== undefined && response !== null) {
                            enqueueSnackbar("The order service has been created with success!", { variant: "success", anchorOrigin: { horizontal: "right", vertical: "top"} });
                            setModalService(false);
                            getOrderServices();
                        }
                        else {
                            setModalService(false);
                            getOrderServices();
                        }
                    }
                }
                // setLoadCreate(false);
            }
            catch (err: any) {
                enqueueSnackbar(t('errorHappened'), { variant: "error", anchorOrigin: { horizontal: "right", vertical: "top"} });
                // setLoadCreate(false);
                console.log(err);
            }
        }
    }

    const editOrder = async () => {
        if (account && instance && context) {
            try {
                setLoadCreate(true);
                var dataSent = {};
                if (orderData !== null && id !== undefined) {
                    dataSent = {
                        "orderId": Number(id),
                        "orderNumber": orderData.orderNumber,
                        "orderDate": orderData.orderDate,
                        "closeDate": orderData.closeDate,
                        "sellerId": seller.contactId,
                        "buyerId": buyer.contactId,
                        "customerId": customer.contactId,
                        "shippingAgent": carrierAgent.contactId,
                        "shipId": ship.shipId,
                        "shipLineId": carrier.contactId,
                        "employeeId": orderData.employeeId,
                        "paymentCondition": orderData.paymentCondition,
                        "orderStatus": orderData.orderStatus,
                        "lastEdited": orderData.lastEdited,
                        "lastEditor": orderData.lastEditor,
                        "departurePort": portLoading.portId,
                        "destinationPort": portDischarge.portId,
                        "estimatedDepartureDate": etd?.toISOString(),
                        "estimatedArrivalDate": eta?.toISOString(),
                        "incoTerm": incotermFrom,
                        "refClient": referenceCustomer,
                        "refSeller": referenceSeller,
                        "refBuyer": referenceBuyer,
                        "incotermDestination": incotermTo,
                        "executedInDate": orderData.executedInDate,
                        "fiscalYear": orderData.fiscalYear,
                        "isVal1": orderData.isVal1,
                        "isVal2": orderData.isVal2,
                        "isVal3": orderData.isVal3,
                        "isVal4": orderData.isVal4,
                        "isVal5": orderData.isVal5,
                        "refShippingAgent": bookingRef,
                        "flag": orderData.flag,
                        "docFlag": orderData.docFlag,
                        "city": incotermFromCity.id,
                        "freightCharges": orderData.freightCharges,
                        "freightPayableAt": orderData.freightPayableAt,
                        "freightMoveType": orderData.freightMoveType,
                        "freightShipmentType": orderData.freightShipmentType,
                        "numberOfBlOriginal": orderData.numberOfBlOriginal,
                        "numberOfBlCopy": orderData.numberOfBlCopy,
                        "shipperAddress": orderData.shipperAddress,
                        "consigneeAddress": orderData.consigneeAddress,
                        "notifyParty": orderData.notifyParty,
                        "notifyPartyRef": orderData.notifyPartyRef,
                        "voyageNumber": orderData.voyageNumber,
                        "lcl": orderData.lcl,
                        "exportation": orderData.exportation,
                        "cityIncotermTo": incotermToCity.id,
                        "invoiceUserId": orderData.invoiceUserId,
                        "documentationUserId": orderData.documentationUserId,
                        "operationsUserId": orderData.operationsUserId,
                        "oblOverview": orderData.oblOverview
                    };
                    const response = await (context?.service as BackendService<any>).putWithToken(protectedResources.apiLisShipments.endPoint+"/Orders/"+id, dataSent, context.tokenLogin);
                    enqueueSnackbar("The order has been edited with success!", { variant: "success", anchorOrigin: { horizontal: "right", vertical: "top"} });
                    loadOrder();    
                }
                else {
                    dataSent = {
                        "orderDate": new Date().toISOString(),
                        // "closeDate": orderData.closeDate,
                        "sellerId": seller.contactId,
                        "buyerId": buyer.contactId,
                        "customerId": customer.contactId,
                        "shippingAgent": carrierAgent.contactId,
                        // "shipId": orderData.shipId,
                        "shipLineId": carrier.contactId,
                        // "employeeId": orderData.employeeId,
                        // "paymentCondition": orderData.paymentCondition,
                        "orderStatus": 0,
                        // "lastEdited": orderData.lastEdited,
                        // "lastEditor": orderData.lastEditor,
                        "departurePort": portLoading.portId,
                        "destinationPort": portDischarge.portId,
                        "estimatedDepartureDate": etd?.toISOString(),
                        "estimatedArrivalDate": eta?.toISOString(),
                        "incoTerm": incotermFrom,
                        "refClient": referenceCustomer,
                        "refSeller": referenceSeller,
                        "refBuyer": referenceBuyer,
                        "incotermDestination": incotermTo,
                        // "executedInDate": orderData.executedInDate,
                        "fiscalYear": Number(new Date().getFullYear()),
                        // "isVal1": orderData.isVal1,
                        // "isVal2": orderData.isVal2,
                        // "isVal3": orderData.isVal3,
                        // "isVal4": orderData.isVal4,
                        // "isVal5": orderData.isVal5,
                        "refShippingAgent": bookingRef,
                        // "flag": orderData.flag,
                        // "docFlag": orderData.docFlag,
                        "city": incotermFromCity.id,
                        // "freightCharges": orderData.freightCharges,
                        // "freightPayableAt": orderData.freightPayableAt,
                        // "freightMoveType": orderData.freightMoveType,
                        // "freightShipmentType": orderData.freightShipmentType,
                        // "numberOfBlOriginal": orderData.numberOfBlOriginal,
                        // "numberOfBlCopy": orderData.numberOfBlCopy,
                        // "shipperAddress": orderData.shipperAddress,
                        // "consigneeAddress": orderData.consigneeAddress,
                        // "notifyParty": orderData.notifyParty,
                        // "notifyPartyRef": orderData.notifyPartyRef,
                        // "voyageNumber": orderData.voyageNumber,
                        // "lcl": orderData.lcl,
                        // "exportation": orderData.exportation,
                        "cityIncotermTo": incotermToCity.id,
                        // "invoiceUserId": orderData.invoiceUserId,
                        // "documentationUserId": orderData.documentationUserId,
                        // "operationsUserId": orderData.operationsUserId,
                        // "oblOverview": orderData.oblOverview
                    };
                    const response = await (context?.service as BackendService<any>).postWithToken(protectedResources.apiLisShipments.endPoint+"/Orders", dataSent, context.tokenLogin);
                    if (response !== undefined && response !== null) {
                        enqueueSnackbar("The order has been created with success!", { variant: "success", anchorOrigin: { horizontal: "right", vertical: "top"} });
                        loadOrder();
                    }
                }
                setLoadCreate(false);
            }
            catch (err: any) {
                enqueueSnackbar(t('errorHappened'), { variant: "error", anchorOrigin: { horizontal: "right", vertical: "top"} });
                setLoadCreate(false);
                console.log(err);
            }
        }
    }
    
    const deleteOrderService = async (tag: string) => {
        if (account && instance && context) {
            try {
                const response = await (context?.service as BackendService<any>).delete(protectedResources.apiLisShipments.endPoint+"/Orders/"+id+"/services/"+tag);
                console.log(response);
                enqueueSnackbar(t('rowDeletedSuccess'), { variant: "success", anchorOrigin: { horizontal: "right", vertical: "top"} });
                getOrderServices();
            }
            catch (e: any) {
                console.log(e);
                enqueueSnackbar(t('rowDeletedError'), { variant: "error", anchorOrigin: { horizontal: "right", vertical: "top"} });
            }
        }
    }
    
    return (
        <div style={{ background: "#fff", borderTopLeftRadius: 20, borderTopRightRadius: 20 }}>
            <SnackbarProvider />
            <Box py={2.5} sx={{ minWidth: { xs: "100vw", md: "100%" }}}>
                <Typography variant="h5" sx={{mt: {xs: 4, md: 1.5, lg: 1.5 }}} px={5}>
                    {
                        id !== undefined ? 
                        <b>{t('Edit order N°')} {orderNumber}</b> : <b>{t('Create new order')}</b> 
                    }
                </Typography>
                <>
                    <Box sx={{ borderBottom: 1, borderColor: 'divider', px: 5 }}>
                        <Tabs value={tabValue} onChange={handleTabChange} sx={{ mt: 2 }}>
                            <Tab label="Shipment" />
                            <Tab label="Documents" />
                            <Tab label="Invoices" />
                        </Tabs>
                    </Box>
                    
                    <CustomTabPanel value={tabValue} index={0}>
                        <Grid container spacing={0.75}>
                            <Grid item xs={12} sx={{ mb: 2 }}>
                                <Button variant="contained" onClick={() => { editOrder(); }} sx={actionButtonStyles} disabled={loadCreate}>{t('Save')}</Button>
                                <Button variant="contained" onClick={() => { loadOrder(); }} sx={actionButtonStyles}>{t('Reload')}</Button>
                            </Grid>
                            <Grid item xs={6}>
                                <Accordion expanded sx={{ width: "100%" }}>
                                    <AccordionSummary expandIcon={<ExpandMore />} aria-controls="panel1-content" id="panel1-header">
                                        Business Parties
                                    </AccordionSummary>
                                    <AccordionDetails>
                                        <Grid container spacing={0.75}>
                                            <Grid item xs={8}>
                                                <InputLabel htmlFor="customer" sx={inputLabelStyles}>{t('Principal / Customer')} *</InputLabel>
                                                <CompanySearch id="customer" value={customer} onChange={setCustomer} category={CategoryEnum.CUSTOMERS} fullWidth />
                                            </Grid>
                                            <Grid item xs={4}>
                                                <InputLabel htmlFor="reference1" sx={inputLabelStyles}>{t('Reference')}</InputLabel>
                                                <BootstrapInput id="reference1" type="text" value={referenceCustomer} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setReferenceCustomer(e.target.value)} fullWidth sx={{ mb: 1 }} />
                                            </Grid>
                                            <Grid item xs={8}>
                                                <InputLabel htmlFor="seller" sx={inputLabelStyles}>{t('Seller / Shipper')}</InputLabel>
                                                <CompanySearch id="seller" value={seller} onChange={setSeller} category={CategoryEnum.CUSTOMERS} fullWidth />
                                            </Grid>
                                            <Grid item xs={4}>
                                                <InputLabel htmlFor="reference2" sx={inputLabelStyles}>{t('Reference')}</InputLabel>
                                                <BootstrapInput id="reference2" type="text" value={referenceSeller} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setReferenceSeller(e.target.value)} fullWidth sx={{ mb: 1 }} />
                                            </Grid>
                                            <Grid item xs={8}>
                                                <InputLabel htmlFor="buyer" sx={inputLabelStyles}>{t('Buyer / Consignee')}</InputLabel>
                                                <CompanySearch id="buyer" value={buyer} onChange={setBuyer} category={CategoryEnum.CUSTOMERS} fullWidth />
                                            </Grid>
                                            <Grid item xs={4}>
                                                <InputLabel htmlFor="reference3" sx={inputLabelStyles}>{t('Reference')}</InputLabel>
                                                <BootstrapInput id="reference3" type="text" value={referenceBuyer} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setReferenceBuyer(e.target.value)} fullWidth sx={{ mb: 1 }} />
                                            </Grid>

                                            <Grid item xs={12}>
                                                <Typography variant="h6">Incoterm</Typography>
                                                <Divider />
                                            </Grid>
                                            <Grid item xs={2} sx={{ mt: 0.875 }}>From</Grid>
                                            <Grid item xs={4} sx={{ mt: 0.875 }}>
                                                <NativeSelect
                                                    id="incotermFrom"
                                                    value={incotermFrom}
                                                    onChange={(e: any) => { setIncotermFrom(e.target.value); }}
                                                    input={<BootstrapInput />}
                                                    fullWidth
                                                >
                                                    <option></option>
                                                    {
                                                        incotermValues.map((row: any, i: number) => (
                                                            <option key={"incoId1-"+i} value={String(row)}>{row}</option>
                                                        ))
                                                    }
                                                </NativeSelect>
                                            </Grid>
                                            <Grid item xs={6}>
                                                {
                                                    cities !== null ?
                                                    <Autocomplete
                                                        disablePortal
                                                        id="incotermFromCity"
                                                        options={cities}
                                                        renderOption={(props, option, i) => {
                                                            return (
                                                                <li {...props} key={option.id}>
                                                                    {option.name+", "+option.country}
                                                                </li>
                                                            );
                                                        }}
                                                        getOptionLabel={(option: any) => { 
                                                            if (option !== null && option !== undefined) {
                                                                return option.name+', '+option.country;
                                                            }
                                                            return ""; 
                                                        }}
                                                        value={incotermFromCity}
                                                        sx={{ mt: 1 }}
                                                        renderInput={(params: any) => <TextField {...params} />}
                                                        onChange={(e: any, value: any) => { 
                                                            setIncotermFromCity(value);
                                                        }}
                                                        fullWidth
                                                    /> : <Skeleton />
                                                }
                                            </Grid>

                                            <Grid item xs={2} sx={{ mt: 0.875 }}>To</Grid>
                                            <Grid item xs={4} sx={{ mt: 0.875 }}>
                                                <NativeSelect
                                                    id="incotermTo"
                                                    value={incotermTo}
                                                    onChange={(e: any) => { setIncotermTo(e.target.value); }}
                                                    input={<BootstrapInput />}
                                                    fullWidth
                                                >
                                                    <option></option>
                                                    {
                                                        incotermDestinationValues.map((row: any, i: number) => (
                                                            <option key={"incoId2-"+i} value={String(row)}>{row}</option>
                                                        ))
                                                    }
                                                </NativeSelect>
                                            </Grid>
                                            <Grid item xs={6}>
                                                {
                                                    cities !== null ?
                                                    <Autocomplete
                                                        disablePortal
                                                        id="incotermToCity"
                                                        options={cities}
                                                        renderOption={(props, option, i) => {
                                                            return (
                                                                <li {...props} key={option.id}>
                                                                    {option.name+", "+option.country}
                                                                </li>
                                                            );
                                                        }}
                                                        getOptionLabel={(option: any) => { 
                                                            if (option !== null && option !== undefined) {
                                                                return option.name+', '+option.country;
                                                            }
                                                            return ""; 
                                                        }}
                                                        value={incotermToCity}
                                                        sx={{ mt: 1 }}
                                                        renderInput={(params: any) => <TextField {...params} />}
                                                        onChange={(e: any, value: any) => { 
                                                            setIncotermToCity(value);
                                                        }}
                                                        fullWidth
                                                    /> : <Skeleton />
                                                }
                                            </Grid>
                                        </Grid>
                                    </AccordionDetails>
                                </Accordion>        
                            </Grid>
                            
                            <Grid item xs={6}>
                                <Accordion expanded sx={{ width: "100%" }}>
                                    <AccordionSummary expandIcon={<ExpandMore />} aria-controls="panel2-content" id="panel2-header">
                                        Shipment Information
                                    </AccordionSummary>
                                    <AccordionDetails>
                                        <Grid container spacing={0.75}>
                                            <Grid item xs={5}>
                                                <InputLabel htmlFor="carrier" sx={inputLabelStyles}>{t('carrier')}</InputLabel>
                                                <CompanySearch id="carrier" value={carrier} onChange={setCarrier} category={CategoryEnum.SHIPPING_LINES} fullWidth />
                                            </Grid>
                                            <Grid item xs={5}>
                                                <InputLabel htmlFor="carrierAgent" sx={inputLabelStyles}>{t('carrierAgent')}</InputLabel>
                                                <CompanySearch id="carrierAgent" value={carrierAgent} onChange={setCarrierAgent} category={CategoryEnum.SHIPPING_LINES} fullWidth />
                                            </Grid>
                                            <Grid item xs={2}>
                                                <InputLabel htmlFor="bookingRef" sx={inputLabelStyles}>{t('Booking Ref')}</InputLabel>
                                                <BootstrapInput id="bookingRef" type="text" value={bookingRef} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setBookingRef(e.target.value)} fullWidth sx={{ mb: 1 }} />
                                            </Grid>
                                            <Grid item xs={6}>
                                                <InputLabel htmlFor="portLoading" sx={inputLabelStyles}>{t('portLoading')}</InputLabel>
                                                {
                                                    ports !== null ?
                                                    <Autocomplete
                                                        disablePortal
                                                        id="portLoading"
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
                                                        onChange={(e: any, value: any) => { 
                                                            setPortLoading(value);
                                                        }}
                                                        fullWidth
                                                    /> : <Skeleton />
                                                }
                                            </Grid>
                                            <Grid item xs={6}>
                                                <InputLabel htmlFor="portDischarge" sx={inputLabelStyles}>{t('portDischarge')}</InputLabel>
                                                {
                                                    ports !== null ?
                                                    <Autocomplete
                                                        disablePortal
                                                        id="portDischarge"
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
                                                        onChange={(e: any, value: any) => { 
                                                            setPortDischarge(value);
                                                        }}
                                                        fullWidth
                                                    /> : <Skeleton />
                                                }
                                            </Grid>
                                            <Grid item xs={4} sx={{ mt: 0.875 }}>
                                                <InputLabel htmlFor="etd" sx={inputLabelStyles}>{t('ETD')}</InputLabel>
                                                <LocalizationProvider dateAdapter={AdapterDayjs}>
                                                    <DatePicker 
                                                        value={etd}
                                                        format="DD/MM/YYYY"
                                                        onChange={(value: any) => { setEtd(value) }}
                                                        slotProps={{ textField: { id: "etd", fullWidth: true, sx: datetimeStyles }, inputAdornment: { sx: { position: "relative", right: "11.5px" } } }}
                                                    />
                                                </LocalizationProvider>
                                            </Grid>
                                            <Grid item xs={4} sx={{ mt: 0.875 }}>
                                                <InputLabel htmlFor="eta" sx={inputLabelStyles}>{t('ETA')}</InputLabel>
                                                <LocalizationProvider dateAdapter={AdapterDayjs}>
                                                    <DatePicker 
                                                        value={eta}
                                                        format="DD/MM/YYYY"
                                                        onChange={(value: any) => { setEta(value) }}
                                                        slotProps={{ textField: { id: "eta", fullWidth: true, sx: datetimeStyles }, inputAdornment: { sx: { position: "relative", right: "11.5px" } } }}
                                                    />
                                                </LocalizationProvider>
                                            </Grid>
                                            <Grid item xs={4} sx={{ mt: 0.875 }}>
                                                <InputLabel htmlFor="vessel" sx={inputLabelStyles}>{t('vessel')}</InputLabel>
                                                {
                                                    ships !== null ? 
                                                    <Autocomplete
                                                        disablePortal
                                                        id="ship"
                                                        options={ships}
                                                        renderOption={(props, option, i) => {
                                                            return (
                                                                <li {...props} key={option.shipId}>
                                                                    {option.shipName}
                                                                </li>
                                                            );
                                                        }}
                                                        getOptionLabel={(option: any) => { 
                                                            if (option !== null && option !== undefined) {
                                                                return option.shipName;
                                                            }
                                                            return ""; 
                                                        }}
                                                        value={ship}
                                                        sx={{ mt: 1 }}
                                                        renderInput={(params: any) => <TextField {...params} />}
                                                        onChange={(e: any, value: any) => { 
                                                            setShip(value);
                                                        }}
                                                        fullWidth
                                                    /> : <Skeleton />
                                                }
                                            </Grid>

                                            <Grid item xs={12} sx={{ mt: 0.375 }}>
                                                <Typography variant="h6">Cargo Details</Typography>
                                                <Divider />
                                            </Grid>
                                            <Grid item xs={12}>
                                                <Button 
                                                    variant="contained" color="inherit" 
                                                    sx={whiteButtonStyles} style={{ float: "right" }} 
                                                    onClick={() => {  }}
                                                >
                                                    {t('reload')}
                                                </Button>
                                                <Button 
                                                    variant="contained" color="inherit" 
                                                    sx={whiteButtonStyles} style={{ float: "right", marginRight: "5px" }} 
                                                    onClick={() => { setModalCargo(true); }}
                                                >
                                                    {t('New cargo')}
                                                </Button>
                                            </Grid>
                                            <Grid item xs={12}>
                                            <ListItem
                                                    sx={{ border: "1px solid #e5e5e5", mt: 0.125 }}
                                                    secondaryAction={
                                                        <>
                                                            <IconButton edge="end" onClick={() => {  }} sx={{ mr: 2 }}>
                                                                <Edit />
                                                            </IconButton>
                                                            <IconButton edge="end" onClick={() => {  }}>
                                                                <Delete />
                                                            </IconButton>
                                                        </>
                                                    }
                                                >
                                                    <ListItemText primary={ 
                                                        <span>1 x 40' HC - USED CLOTHES - 27000 kg - 68 m³</span>
                                                    } />
                                                </ListItem>
                                            </Grid>
                                        </Grid>
                                    </AccordionDetails>
                                </Accordion>
                            </Grid>

                            <Grid item xs={12} sx={{ mt: 1 }}>
                                <Accordion sx={{ width: "100%" }}>
                                    <AccordionSummary expandIcon={<ExpandMore />} aria-controls="panel3Z-content" id="panel3Z-header" sx={{ display: "flex" }}>
                                        Budget
                                    </AccordionSummary>
                                    <AccordionDetails>
                                        <Grid container spacing={0.75}>
                                            <Grid item xs={6}>
                                                <Box sx={{ display: "flex" }}>
                                                    <Box sx={{ width: "50%", display: "flex" }}>Incoming Services</Box>
                                                    <Box sx={{ width: "50%", display: "flex", justifyContent: "end" }}>
                                                        <IconButton 
                                                            size="small" sx={{ mr: 1 }} 
                                                            onClick={() => { 
                                                                setModalService(true); setServiceType("Buy"); 
                                                                setService(null); setServiceQuantity(1); setServicePrice(0); setServiceSupplier(null);
                                                            }}
                                                        >
                                                            <AddOutlined />
                                                        </IconButton>
                                                        <IconButton size="small" sx={{ mr: 1 }} onClick={() => { getOrderServices("Buy"); }}>
                                                            <ReplayOutlined />
                                                        </IconButton>
                                                    </Box> 
                                                </Box>
                                                {
                                                    !loadOrderServicesBuy ? 
                                                    <DataGrid
                                                        rows={orderServices.filter((elm: any) => elm.transactionType === "Buy")}
                                                        columns={columnsServices}
                                                        getRowId={(row: any) => row?.tag}
                                                        getRowHeight={() => "auto" }
                                                        sx={sizingStyles}
                                                        disableRowSelectionOnClick
                                                        style={{ height: "500px", fontSize: "12px" }}
                                                        pagination
                                                        slots={{
                                                            // toolbar: EditToolbar,
                                                            footer: () => (
                                                                <Box sx={{ p: 1, borderTop: "1px solid #e5e5e5", display: 'flex', justifyContent: 'flex-end' }}>
                                                                    <Typography variant="h6" fontSize={16}>
                                                                        Total Price: {calculateTotalPrice("Buy")} €
                                                                    </Typography>
                                                                </Box>
                                                            ),
                                                        }}
                                                    /> : <Skeleton />
                                                }
                                            </Grid>
                                            <Grid item xs={6}>
                                                <Box sx={{ display: "flex" }}>
                                                    <Box sx={{ width: "50%", display: "flex" }}>Outgoing Services</Box>
                                                    <Box sx={{ width: "50%", display: "flex", justifyContent: "end" }}>
                                                        <IconButton 
                                                            size="small" sx={{ mr: 1 }} 
                                                            onClick={() => { 
                                                                setModalService(true); setServiceType("Sell"); 
                                                                setService(null); setServiceQuantity(1); setServicePrice(0); setServiceSupplier(null);
                                                            }}
                                                        >
                                                            <AddOutlined />
                                                        </IconButton>
                                                        <IconButton size="small" sx={{ mr: 1 }} onClick={() => { getOrderServices("Sell"); }}>
                                                            <ReplayOutlined />
                                                        </IconButton>
                                                    </Box> 
                                                </Box>
                                                {
                                                    !loadOrderServicesSell ? 
                                                    <DataGrid
                                                        rows={orderServices.filter((elm: any) => elm.transactionType === "Sell")}
                                                        columns={columnsServices}
                                                        getRowId={(row: any) => row?.tag}
                                                        getRowHeight={() => "auto" }
                                                        sx={sizingStyles}
                                                        disableRowSelectionOnClick
                                                        style={{ height: "500px", fontSize: "12px" }}
                                                        pagination
                                                        slots={{
                                                            // toolbar: EditToolbar,
                                                            footer: () => (
                                                                <Box sx={{ p: 1, borderTop: "1px solid #e5e5e5", display: 'flex', justifyContent: 'flex-end' }}>
                                                                    <Typography variant="h6" fontSize={16}>
                                                                        Total Price: {calculateTotalPrice("Sell")} €
                                                                    </Typography>
                                                                </Box>
                                                            ),
                                                        }}
                                                    /> : <Skeleton />
                                                }
                                            </Grid>
                                        </Grid>
                                    </AccordionDetails>
                                </Accordion>
                            </Grid>
                        </Grid>
                        
                    </CustomTabPanel>
                    <CustomTabPanel value={tabValue} index={1}>
                        Item Two
                    </CustomTabPanel>
                    <CustomTabPanel value={tabValue} index={2}>
                        Item Three
                    </CustomTabPanel>
                </>
            </Box>

            <BootstrapDialog open={modalCargo} onClose={() => setModalCargo(false)} maxWidth="md" fullWidth>
                <BootstrapDialogTitle id="custom-dialog-title" onClose={() => setModalCargo(false)}>
                    <b>{t('Add a cargo')}</b>
                </BootstrapDialogTitle>
                <DialogContent dividers>
                    <Grid container spacing={2}>
                        <Grid item xs={9}>
                            <Grid container spacing={1}>
                                <Grid item xs={6} sx={{ mt: 0.5 }}>
                                    <InputLabel htmlFor="packageType" sx={inputLabelStyles}>{t('packageType')}</InputLabel>
                                    <NativeSelect
                                        id="packageType"
                                        value={packageType}
                                        onChange={(e: any) => { setPackageType(e.target.value); console.log("Val", e.target.value); }}
                                        input={<BootstrapInput />}
                                        fullWidth
                                    >
                                        <option></option>
                                        {
                                            allPackages.map((row: any, i: number) => (
                                                <option key={"ptId1-"+i} value={String(row.packageName)}>{row.packageName}</option>
                                            ))
                                        }
                                    </NativeSelect>
                                </Grid>
                                <Grid item xs={6} sx={{ mt: 0.5 }}>
                                    <InputLabel htmlFor="product" sx={inputLabelStyles}>{t('Product')}</InputLabel>
                                    {
                                        ourProducts !== null ?
                                        <Autocomplete
                                            disablePortal
                                            id="product"
                                            options={ourProducts}
                                            getOptionLabel={(option: any) => { 
                                                if (option !== null && option !== undefined) {
                                                    return option.productName !== undefined ? option.productName : option;
                                                }
                                                return ""; 
                                            }}
                                            value={product}
                                            sx={{ mt: 1 }}
                                            renderInput={(params: any) => <TextField placeholder="Machinery, Household goods, etc" {...params} sx={{ textTransform: "lowercase" }} />}
                                            onChange={(e: any, value: any) => { setProduct(value); }}
                                            fullWidth
                                        /> : <Skeleton />
                                    }
                                </Grid>
                                <Grid item xs={4}>
                                    <InputLabel htmlFor="quantity" sx={inputLabelStyles}>{t('quantity')}</InputLabel>
                                    <BootstrapInput id="quantity" type="number" value={quantity} onChange={(e: any) => setQuantity(e.target.value)} fullWidth />
                                </Grid>
                                <Grid item xs={4}>
                                    <InputLabel htmlFor="weight" sx={inputLabelStyles}>{t('Weight')}</InputLabel>
                                    <BootstrapInput id="weight" type="number" value={weight} onChange={(e: any) => setWeight(e.target.value)} fullWidth />
                                </Grid>
                                <Grid item xs={4}>
                                    <InputLabel htmlFor="volume" sx={inputLabelStyles}>{t('Volume')}</InputLabel>
                                    <BootstrapInput id="volume" type="number" value={volume} onChange={(e: any) => setVolume(e.target.value)} fullWidth />
                                </Grid>
                                {
                                    packageType !== "" && packageType.includes("'") ? 
                                    <>
                                        <Grid item xs={6}>
                                            <InputLabel htmlFor="numberX" sx={inputLabelStyles}>{t('Number')}</InputLabel>
                                            <BootstrapInput id="numberX" type="text" value={number} onChange={(e: any) => setNumber(e.target.value)} fullWidth />
                                        </Grid>
                                        <Grid item xs={6}>
                                            <InputLabel htmlFor="seal" sx={inputLabelStyles}>{t('Seal')}</InputLabel>
                                            <BootstrapInput id="seal" type="text" value={seal} onChange={(e: any) => setSeal(e.target.value)} fullWidth />
                                        </Grid>
                                    </> : null 
                                }
                            </Grid>
                        </Grid>
                        <Grid item xs={3}>
                            <InputLabel htmlFor="marks" sx={inputLabelStyles}>{t('Marks')}</InputLabel>
                            <BootstrapInput id="marks" type="text" multiline rows={8.125} value={marks} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setMarks(e.target.value)} fullWidth />
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions>
                    <Button variant="contained" onClick={() => setModalCargo(false)} sx={buttonCloseStyles}>{t('close')}</Button>
                </DialogActions>
            </BootstrapDialog>

            <BootstrapDialog open={modalService} onClose={() => setModalService(false)} maxWidth="md" fullWidth>
                <BootstrapDialogTitle id="custom-dialog-title" onClose={() => setModalService(false)}>
                    <b>{t('Add a service')}</b>
                </BootstrapDialogTitle>
                <DialogContent dividers>
                    <Grid container spacing={2}>
                        <Grid item xs={6} sx={{  }}>
                            <InputLabel htmlFor="service" sx={inputLabelStyles}>{t('Service')}</InputLabel>
                            {
                                ourServices !== null ?
                                <Autocomplete
                                    disablePortal
                                    id="service"
                                    options={ourServices}
                                    getOptionLabel={(option: any) => { 
                                        if (option !== null && option !== undefined) {
                                            return option.serviceName !== undefined ? option.serviceName : option;
                                        }
                                        return ""; 
                                    }}
                                    value={service}
                                    sx={{ mt: 1 }}
                                    renderInput={(params: any) => <TextField placeholder="" {...params} sx={{ textTransform: "lowercase" }} />}
                                    onChange={(e: any, value: any) => { setService(value); }}
                                    fullWidth
                                /> : <Skeleton />
                            }
                        </Grid>
                        <Grid item xs={6}>
                            <InputLabel htmlFor="serviceSupplier" sx={inputLabelStyles}>{t('Supplier')}</InputLabel>
                            <CompanySearch id="serviceSupplier" value={serviceSupplier} onChange={setServiceSupplier} category={CategoryEnum.CUSTOMERS} fullWidth />
                        </Grid>
                        <Grid item xs={4}>
                            <InputLabel htmlFor="serviceType" sx={inputLabelStyles}>{t('Type')}</InputLabel>
                            <BootstrapInput id="serviceType" type="text" value={serviceType} fullWidth disabled />
                        </Grid>
                        <Grid item xs={4}>
                            <InputLabel htmlFor="serviceQuantity" sx={inputLabelStyles}>{t('Quantity')}</InputLabel>
                            <BootstrapInput id="serviceQuantity" type="number" value={serviceQuantity} onChange={(e: any) => setServiceQuantity(e.target.value)} fullWidth />
                        </Grid>
                        <Grid item xs={4}>
                            <InputLabel htmlFor="servicePrice" sx={inputLabelStyles}>{t('Unit price')}</InputLabel>
                            <BootstrapInput id="servicePrice" type="number" value={servicePrice} onChange={(e: any) => setServicePrice(e.target.value)} fullWidth />
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions>
                <Button variant="contained" onClick={() => addOrderService()} sx={actionButtonStyles}>{t('Save')}</Button>
                    <Button variant="contained" onClick={() => setModalService(false)} sx={buttonCloseStyles}>{t('close')}</Button>
                </DialogActions>
            </BootstrapDialog>
        </div>
    );
}

export default EditOrder;
