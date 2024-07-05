import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Delete, Edit, ExpandMore, RestartAltOutlined, Visibility } from '@mui/icons-material';
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
import { CategoryEnum, allPackages, incotermDestinationValues, incotermValues } from '../utils/constants';
import AutocompleteSearch from '../components/shared/AutocompleteSearch';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs, { Dayjs } from 'dayjs';

function EditOrder() {
    const [load, setLoad] = useState<boolean>(true);
    const [orders, setOrders] = useState<any>(null);
    const [modal, setModal] = useState<boolean>(false);
    const [currentId, setCurrentId] = useState<string>("");
    const [ports, setPorts] = useState<any>(null);
    const [cities, setCities] = useState<any>(null);
    const [products, setProducts] = useState<any>(null);
    const [contacts, setContacts] = useState<any>(null);
    const [orderData, setOrderData] = useState<any>(null);
    const [tabValue, setTabValue] = useState<number>(0);
    const [modalCargo, setModalCargo] = useState<boolean>(false);

    const [customer, setCustomer] = useState<any>(null);
    const [seller, setSeller] = useState<any>(null);
    const [buyer, setBuyer] = useState<any>(null);
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
    
    const [orderId, setOrderId] = useState<string>("");
    
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
    var ourContacts: any = useSelector((state: any) => state.masterdata.contactBusinesses);
    
    useEffect(() => {
        getPorts();
        getProducts();
        getContacts();
        getCities();
        loadOrder();
        // getOrders();
    }, [account, instance, context]);
    
    const loadOrder = async () => {
		if (account && instance && context) {
            setLoad(true);
            const response = await (context?.service as BackendService<any>).getSingle(protectedResources.apiLisShipments.endPoint+"/Orders/"+id);
            if (response !== null && response !== undefined) {
                console.log(response);
                setOrderData(response);
                // Order data import
                console.log(ourPorts);
                setSeller(ourContacts.data.find((elm: any) => elm.contactId === response.sellerId));
                setCustomer(ourContacts.data.find((elm: any) => elm.contactId === response.customerId));
                setBuyer(ourContacts.data.find((elm: any) => elm.contactId === response.buyerId));
                setCarrier(ourContacts.data.find((elm: any) => elm.contactId === response.shipLineId));
                setCarrierAgent(ourContacts.data.find((elm: any) => elm.contactId === response.shippingAgent));
                
                setPortLoading(ourPorts.find((elm: any) => elm.portId === response.departurePort));
                setPortDischarge(ourPorts.find((elm: any) => elm.portId === response.destinationPort));

                setEtd(dayjs(response.estimatedDepartureDate));
                setEta(dayjs(response.estimatedArrivalDate));

                setIncotermFrom(response.incoTerm);
                setIncotermTo(response.incotermDestination);
                setIncotermFromCity(ourCities.find((elm: any) => elm.id === response.city));
                setIncotermToCity(ourCities.find((elm: any) => elm.id === response.cityIncotermTo));
                setBookingRef(response.refShippingAgent);
                setVessel(String(response.shipId));

                setReferenceSeller(response.refSeller);
                setReferenceCustomer(response.refClient);
                setReferenceBuyer(response.refBuyer);
                
                setOrderId(response.orderNumber);
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
            if (ourPorts.length !== 0) {
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
            if (ourProducts.length !== 0) {
                console.log(ourProducts);
                setProducts(ourProducts);
            }
            else {
                const response = await (context?.service as BackendService<any>).getWithToken(protectedResources.apiLisTransport.endPoint+"/Product?pageSize=500", context.tokenTransport);
                if (response !== null && response !== undefined) {
                    console.log(response);
                    setProducts(response);
                }
            }
        }
    }

    const getCities = async () => {
        if (account && instance && context) {
            if (ourCities.length !== 0) {
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
            if (ourContacts.length !== 0) {
                console.log(ourContacts);
                setContacts(ourContacts);
            }
            else {
                const response = await (context?.service as BackendService<any>).getWithToken(protectedResources.apiLisCrm.endPoint+"/Contact/GetContacts?pageSize=4000", context.tokenCrm);
                if (response !== null && response !== undefined) {
                    console.log(response);
                    setContacts(response);
                }
            }
        }
    }
    
    // const getOrders = async () => {
    //     if (account && instance && context) {
    //         setLoad(true);
    //         const response = await (context?.service as BackendService<any>).getSingle(protectedResources.apiLisShipments.endPoint+"/Orders");
    //         if (response !== null && response !== undefined) {
    //             console.log(response);
    //             setOrders(response);
    //             setLoad(false);
    //         }
    //         else {
    //             setLoad(false);
    //         }
    //     }
    // }
    
    
    return (
        <div style={{ background: "#fff", borderTopLeftRadius: 20, borderTopRightRadius: 20 }}>
            <SnackbarProvider />
            <Box py={2.5} sx={{ minWidth: { xs: "100vw", md: "100%" }}}>
                <Typography variant="h5" sx={{mt: {xs: 4, md: 1.5, lg: 1.5 }}} px={5}><b>{t('Edit order N°')} {orderId}</b></Typography>
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
                            <Grid item xs={12}>
                                <Button variant="contained" onClick={() => { console.log("Data"); }} sx={actionButtonStyles}>{t('Save')}</Button>
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
                                            {/* <Grid item xs={6}>
                                                {
                                                    ports !== null ?
                                                    <Autocomplete
                                                        disablePortal
                                                        id="incotermFromCity"
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
                                                        value={incotermFromCity}
                                                        sx={{ mt: 1 }}
                                                        renderInput={(params: any) => <TextField {...params} />}
                                                        onChange={(e: any, value: any) => { 
                                                            setIncotermFromCity(value);
                                                        }}
                                                        fullWidth
                                                    /> : <Skeleton />
                                                }
                                            </Grid> */}
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
                                            {/* <Grid item xs={6}>
                                                {
                                                    ports !== null ?
                                                    <Autocomplete
                                                        disablePortal
                                                        id="incotermToCity"
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
                                                        value={incotermToCity}
                                                        sx={{ mt: 1 }}
                                                        renderInput={(params: any) => <TextField {...params} />}
                                                        onChange={(e: any, value: any) => { 
                                                            setIncotermToCity(value);
                                                        }}
                                                        fullWidth
                                                    /> : <Skeleton />
                                                }
                                            </Grid> */}
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
                                    <AccordionSummary expandIcon={<ExpandMore />} aria-controls="panel1-content" id="panel1-header">
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
                                                <BootstrapInput id="vessel" type="text" value={vessel} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setVessel(e.target.value)} fullWidth sx={{ mb: 1 }} />                                                
                                            </Grid>

                                            <Grid item xs={12} sx={{ mt: 0.625 }}>
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
                                                            <IconButton 
                                                                edge="end"
                                                                onClick={() => {  }}
                                                                sx={{ mr: 2 }}
                                                            >
                                                                <Edit />
                                                            </IconButton>
                                                            <IconButton 
                                                                edge="end"
                                                                onClick={() => {  }}
                                                            >
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
        </div>
    );
}

export default EditOrder;
