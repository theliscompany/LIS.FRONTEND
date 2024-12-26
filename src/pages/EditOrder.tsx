import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { ExpandMore } from '@mui/icons-material';
import { Accordion, AccordionDetails, AccordionSummary, Box, Chip, Grid, Skeleton, Tab, Tabs, Typography } from '@mui/material';
import { SnackbarProvider } from 'notistack';
import { CustomTabPanel } from '../utils/misc/styles';
import { useMsal, useAccount } from '@azure/msal-react';
import { useTranslation } from 'react-i18next';
import { useAuthorizedBackendApi } from '../api/api';
import { protectedResources } from '../config/authConfig';
import { BackendService } from '../utils/services/fetch';
import { useSelector } from 'react-redux';
import { orderStatusOptions } from '../utils/constants';
import OrderShipments from '../components/editOrderPage/OrderShipments';
import NoteShipments from '../components/editOrderPage/NoteShipments';
import { getLISTransportAPI } from '../api/client/transportService';
import { getLisCrmApi } from '../api/client/crmService';

function EditOrder() {
    const [load, setLoad] = useState<boolean>(true);
    const [loadShips, setLoadShips] = useState<boolean>(true);
    const [ports, setPorts] = useState<any>(null);
    const [cities, setCities] = useState<any>(null);
    const [products, setProducts] = useState<any>(null);
    const [services, setServices] = useState<any>(null);
    const [contacts, setContacts] = useState<any>(null);
    const [ships, setShips] = useState<any>(null);
    const [orderData, setOrderData] = useState<any>(null);
    const [tabValue, setTabValue] = useState<number>(0);
    const [orderNumber, setOrderNumber] = useState<string>("");
    
    // const [loadNotes, setLoadNotes] = useState<boolean>(true);
    // const [notes, setNotes] = useState<any>(null);
    // const [modalNote, setModalNote] = useState<boolean>(false);
    // const [currentNoteId, setCurrentNoteId] = useState<string>("");
    // const [noteTitle, setNoteTitle] = useState<string>("");
    // const [flag, setFlag] = useState<string>("");
    // const [textContent, setTextContent] = useState<string>("");
    // const [alertDate, setAlertDate] = useState<Dayjs | null>(null);

    const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
        setTabValue(newValue);
    };

    const { instance, accounts } = useMsal();
    const account = useAccount(accounts[0] || {});    
    const context = useAuthorizedBackendApi();
    
    let { id } = useParams();
    const { t } = useTranslation();
    
    const { getPorts, getProduct, getService, getCityCities } = getLISTransportAPI();
    const { getContactGetContacts } = getLisCrmApi();

    var ourCities: any = useSelector((state: any) => state.masterdata.cities);
    var ourPorts: any = useSelector((state: any) => state.masterdata.ports);
    var ourProducts: any = useSelector((state: any) => state.masterdata.products);
    var ourServices: any = useSelector((state: any) => state.masterdata.services);
    var ourContacts: any = useSelector((state: any) => state.masterdata.contactBusinesses.data);
    
    useEffect(() => {
        loadOrder();
    }, [contacts, ports, cities, ships]);
    
    useEffect(() => {
        getPortsService();
        getProducts();
        getServices();
        getContacts();
        getCities();
        getShips();
        // getNotes();
    }, [account, instance, context]);

    const getPortsService = async () => {
        if (ourPorts !== undefined && ourPorts.length !== 0) {
            setPorts(ourPorts);
        }
        else {
            const response = await getPorts({ pageSize: 2000 });
            if (response !== null && response !== undefined) {
                setPorts(response.data);
            }
        }
    }

    const getProducts = async () => {
        if (ourProducts !== undefined && ourProducts.length !== 0) {
            setProducts(ourProducts);
        }
        else {
            const response = await getProduct({ pageSize: 500 });
            if (response !== null && response !== undefined) {
                setProducts(response.data);
            }
        }
    }

    const getServices = async () => {
        if (ourServices !== undefined && ourServices.length !== 0) {
            setServices(ourServices);
        }
        else {
            const response = await getProduct({ pageSize: 500 });
            if (response !== null && response !== undefined) {
                setServices(response.data);
            }
        }
    }

    const getCities = async () => {
        if (ourCities !== undefined && ourCities.length !== 0) {
            setCities(ourCities);
        }
        else {
            const response = await getCityCities();
            if (response !== null && response !== undefined) {
                setCities(response.data);
            }
        }
    }

    const getContacts = async () => {
        if (ourContacts !== undefined && ourContacts.length !== 0) {
            setContacts(ourContacts);
        }
        else {
            const response = await getContactGetContacts({ pageSize: 4000 });
            if (response !== null && response !== undefined) {
                setContacts(response.data.data);
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

    const loadOrder = async () => {
		if (account && instance && context && contacts !== null && ports !== null && cities !== null && ships !== null && id !== undefined) {
            setLoad(true);
            const response = await (context?.service as BackendService<any>).getSingle(protectedResources.apiLisShipments.endPoint+"/Orders/"+id);
            if (response !== null && response !== undefined) {
                setOrderData(response);                
                setOrderNumber(response.orderNumber);
                // Order data import end
                setLoad(false);
            }
            else {
                setLoad(false);
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
                        <Box>
                            <b>{t('Edit order N°')} {orderNumber}</b>
                            {
                                orderData !== null ? 
                                <Chip 
                                    label={orderStatusOptions.find((elm: any) => elm.value === orderData.orderStatus)?.label} 
                                    color={orderStatusOptions.find((elm: any) => elm.value === orderData.orderStatus)?.color || "default"} 
                                    sx={{ fontSize: 12, ml: 2, textTransform: "none" }}
                                /> : null
                            }
                        </Box> : <b>{t('Create new order')}</b> 
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
                        <OrderShipments 
                            id={id} 
                            ports={ports} 
                            products={products} 
                            services={services} 
                            cities={cities} 
                            contacts={contacts}
                            ships={ships}
                            setOrderNumber={setOrderNumber}
                        />
                    </CustomTabPanel>
                    
                    <CustomTabPanel value={tabValue} index={1}>
                        <Grid container spacing={0.75}>
                            <Grid item xs={6}>
                                <Accordion expanded sx={{ width: "100%" }}>
                                    <AccordionSummary expandIcon={<ExpandMore />} aria-controls="panel5-content" id="panel5-header">
                                        Files online
                                    </AccordionSummary>
                                    <AccordionDetails></AccordionDetails>
                                </Accordion>
                            </Grid>
                            <Grid item xs={6}>
                                {
                                    orderData !== null ? 
                                    <NoteShipments id={id} orderData={orderData} /> : <Skeleton />
                                }
                            </Grid>
                        </Grid>
                    </CustomTabPanel>
                    
                    <CustomTabPanel value={tabValue} index={2}>
                        Item Three
                    </CustomTabPanel>
                </>
            </Box>
        </div>
    );
}

export default EditOrder;
