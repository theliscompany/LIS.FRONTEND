import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { AddOutlined, Delete, Edit, ExpandMore, ReplayOutlined } from '@mui/icons-material';
import { Accordion, AccordionDetails, AccordionSummary, Autocomplete, Box, Button, Chip, DialogActions, DialogContent, Divider, Grid, IconButton, InputLabel, ListItem, ListItemText, NativeSelect, Skeleton, Tab, Tabs, TextField, Typography } from '@mui/material';
import { DataGrid, GridColDef, GridRenderCellParams } from '@mui/x-data-grid';
import { SnackbarProvider, enqueueSnackbar } from 'notistack';
import { whiteButtonStyles, sizingStyles, BootstrapDialog, BootstrapDialogTitle, buttonCloseStyles, CustomTabPanel, BootstrapInput, inputLabelStyles, datetimeStyles, actionButtonStyles } from '../utils/misc/styles';
import { useMsal, useAccount } from '@azure/msal-react';
import { useTranslation } from 'react-i18next';
import { useAuthorizedBackendApi } from '../api/api';
import { protectedResources } from '../config/authConfig';
import { BackendService } from '../utils/services/fetch';
import { useSelector } from 'react-redux';
import { orderStatusOptions } from '../utils/constants';
import OrderShipments from '../components/editOrderPage/OrderShipments';

function EditOrder() {
    const [loadShips, setLoadShips] = useState<boolean>(true);
    const [loadNotes, setLoadNotes] = useState<boolean>(true);
    const [ports, setPorts] = useState<any>(null);
    const [cities, setCities] = useState<any>(null);
    const [products, setProducts] = useState<any>(null);
    const [services, setServices] = useState<any>(null);
    const [contacts, setContacts] = useState<any>(null);
    const [ships, setShips] = useState<any>(null);
    const [notes, setNotes] = useState<any>(null);
    const [orderData, setOrderData] = useState<any>(null);
    const [tabValue, setTabValue] = useState<number>(0);
    const [orderNumber, setOrderNumber] = useState<string>("");
    
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
    
    const columnsNotes: GridColDef[] = [
        { field: 'title', headerName: t('title'), flex: 0.5 },
        { field: 'noteDate', headerName: t('created'), flex: 0.25 },
        { field: 'authorId', headerName: t('user'), flex: 0.25 },
        { field: 'www', headerName: t('Actions'), renderCell: (params: GridRenderCellParams) => {
            return (
                <Box sx={{ my: 1 }}>
                    <IconButton 
                        edge="end" 
                        onClick={() => { 
                            
                        }} 
                        sx={{ mr: 0 }}
                    >
                        <Edit fontSize='small' />
                    </IconButton>
                    <IconButton edge="end" onClick={() => {  }}>
                        <Delete fontSize='small' />
                    </IconButton>
                </Box>
            );
        } }
    ];
        
    useEffect(() => {
        getPorts();
        getProducts();
        getServices();
        getContacts();
        getCities();
        getShips();
        // getNotes();
    }, [account, instance, context]);

    const getPorts = async () => {
        if (account && instance && context) {
            if (ourPorts !== undefined && ourPorts.length !== 0) {
                // console.log(ourPorts);
                setPorts(ourPorts);
            }
            else {
                const response = await (context?.service as BackendService<any>).getWithToken(protectedResources.apiLisTransport.endPoint+"/Port/Ports?pageSize=2000", context.tokenTransport);
                if (response !== null && response !== undefined) {
                    // console.log(response);
                    setPorts(response);
                }
            }
        }
    }

    const getProducts = async () => {
        if (account && instance && context) {
            if (ourProducts !== undefined && ourProducts.length !== 0) {
                // console.log(ourProducts);
                setProducts(ourProducts);
            }
            else {
                const response = await (context?.service as BackendService<any>).getWithToken(protectedResources.apiLisTransport.endPoint+"/Service?pageSize=1000", context.tokenTransport);
                if (response !== null && response !== undefined) {
                    // console.log(response);
                    setProducts(response);
                }
            }
        }
    }

    const getServices = async () => {
        if (account && instance && context) {
            if (ourServices !== undefined && ourServices.length !== 0) {
                // console.log(ourServices);
                setServices(ourServices);
            }
            else {
                const response = await (context?.service as BackendService<any>).getWithToken(protectedResources.apiLisTransport.endPoint+"/Product?pageSize=500", context.tokenTransport);
                if (response !== null && response !== undefined) {
                    // console.log(response);
                    setServices(response);
                }
            }
        }
    }

    const getCities = async () => {
        if (account && instance && context) {
            if (ourCities !== undefined && ourCities.length !== 0) {
                // console.log(ourCities);
                setCities(ourCities);
            }
            else {
                const response = await (context?.service as BackendService<any>).getWithToken(protectedResources.apiLisTransport.endPoint+"/City/Cities", context.tokenTransport);
                if (response !== null && response !== undefined) {
                    // console.log(response);
                    setCities(response);
                }
            }
        }
    }

    const getContacts = async () => {
        if (account && instance && context) {
            if (ourContacts !== undefined && ourContacts.length !== 0) {
                // console.log(ourContacts);
                setContacts(ourContacts);
            }
            else {
                const response = await (context?.service as BackendService<any>).getWithToken(protectedResources.apiLisCrm.endPoint+"/Contact/GetContacts?pageSize=4000", context.tokenCrm);
                if (response !== null && response !== undefined) {
                    // console.log(response);
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

    const getNotes = async () => {
        if (account && instance && context) {
            try {
                if (id !== undefined) {
                    setLoadNotes(true);
                    const response = await (context?.service as BackendService<any>).getSingle(protectedResources.apiLisShipments.endPoint+"/Notes/GetByOrderId/"+id);
                    if (response !== null && response !== undefined && response.status !== 404) {
                        console.log("Notes : ", response);
                        setNotes(response.$values);
                        setLoadNotes(false);
                    }
                    else {
                        setLoadNotes(false);
                    }
                }
            }
            catch (err: any) {
                setLoadNotes(false);
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
                            <Grid item xs={7}>
                                <Accordion expanded sx={{ width: "100%" }}>
                                    <AccordionSummary expandIcon={<ExpandMore />} aria-controls="panel5-content" id="panel5-header">
                                        Files online
                                    </AccordionSummary>
                                    <AccordionDetails></AccordionDetails>
                                </Accordion>
                            </Grid>
                            <Grid item xs={5}>
                                <Accordion expanded sx={{ width: "100%" }}>
                                    <AccordionSummary expandIcon={<ExpandMore />} aria-controls="panel5-content" id="panel5-header">
                                        Notes
                                    </AccordionSummary>
                                    <AccordionDetails>
                                        {
                                            loadNotes !== false && notes !== null ?
                                            <DataGrid
                                                rows={notes}
                                                columns={columnsNotes}
                                                getRowId={(row: any) => row?.noteId}
                                                getRowHeight={() => "auto" }
                                                sx={sizingStyles}
                                                disableRowSelectionOnClick
                                                style={{ height: "300px", fontSize: "12px" }}
                                                pagination
                                            /> : <Skeleton />
                                        }
                                    </AccordionDetails>
                                </Accordion>
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
