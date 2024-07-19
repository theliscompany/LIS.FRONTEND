import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AddOutlined, Delete, Edit, RestartAltOutlined, Visibility } from '@mui/icons-material';
import { Alert, Box, Button, Chip, DialogActions, DialogContent, Grid, IconButton, Skeleton, Typography } from '@mui/material';
import { DataGrid, GridColDef, GridRenderCellParams, GridValueFormatterParams } from '@mui/x-data-grid';
import { SnackbarProvider, enqueueSnackbar } from 'notistack';
import { whiteButtonStyles, sizingStyles, BootstrapDialog, BootstrapDialogTitle, buttonCloseStyles } from '../utils/misc/styles';
import { NavLink } from 'react-router-dom';
import { useMsal, useAccount } from '@azure/msal-react';
import { useTranslation } from 'react-i18next';
import { useAuthorizedBackendApi } from '../api/api';
import { protectedResources } from '../config/authConfig';
import { BackendService } from '../utils/services/fetch';
import { useSelector } from 'react-redux';

function Orders() {
    const [load, setLoad] = useState<boolean>(true);
    const [loadShips, setLoadShips] = useState<boolean>(true);
    const [ships, setShips] = useState<any>(null);
    const [orders, setOrders] = useState<any>(null);
    const [modal, setModal] = useState<boolean>(false);
    const [ports, setPorts] = useState<any>(null);
    const [contacts, setContacts] = useState<any>(null);
    const [currentId, setCurrentId] = useState<string>("");

    const { instance, accounts } = useMsal();
    const account = useAccount(accounts[0] || {});    
    const context = useAuthorizedBackendApi();
    
    const navigate = useNavigate();
    const { t } = useTranslation();
    
    var ourPorts: any = useSelector((state: any) => state.masterdata.ports);
    var ourContacts: any = useSelector((state: any) => state.masterdata.contactBusinesses.data);
    
    const columnsOrders: GridColDef[] = [
        // { field: 'orderId', headerName: t('id'), flex: 0.5 },
        { field: 'orderNumber', headerName: t('orderNumber') },
        { field: 'orderDate', headerName: t('orderDate'), renderCell: (params: GridRenderCellParams) => {
            return (
                <Box>{params.row.orderDate.slice(0,10)}</Box>
            );
        } },
        { field: 'fiscalYear', headerName: t('fiscalYear') },
        
        // { field: 'sellerId', headerName: t('seller') },
        // { field: 'buyerId', headerName: t('buyer') },
        // { field: 'customerId', headerName: t('customer') },
        
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
                                ports.find((elm: any) => elm.portId === params.row.departurePort) !== undefined ? 
                                ports.find((elm: any) => elm.portId === params.row.departurePort).portName : "N/A"
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
                                ports.find((elm: any) => elm.portId === params.row.destinationPort) !== undefined ? 
                                ports.find((elm: any) => elm.portId === params.row.destinationPort).portName : "N/A"
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
    
    useEffect(() => {
        getPorts();
        getContacts();
        getShips();
        getOrders();
    }, [account, instance, context]);
    
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
    
    const getContacts = async () => {
        if (account && instance && context) {
            if (ourContacts.length !== 0) {
                // console.log(ourContacts);
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

    const getOrders = async () => {
        if (account && instance && context) {
            setLoad(true);
            const response = await (context?.service as BackendService<any>).getSingle(protectedResources.apiLisShipments.endPoint+"/Orders");
            if (response !== null && response !== undefined) {
                console.log(response);
                setOrders(response.$values.filter((elm: any) => elm.fiscalYear !== 2014));
                setLoad(false);
            }
            else {
                setLoad(false);
            }
            // console.log(response);
        }
    }
    
    const deleteOrder = async (id: string) => {
        if (account && instance && context) {
            try {
                const response = await (context?.service as any).delete(protectedResources.apiLisShipments.endPoint+"/Orders/"+id);
                enqueueSnackbar(t('orderDeleted'), { variant: "success", anchorOrigin: { horizontal: "right", vertical: "top"} });
                setModal(false);
                getOrders();
                // if (response !== null && response !== undefined) {
                //     enqueueSnackbar(t('orderDeleted'), { variant: "success", anchorOrigin: { horizontal: "right", vertical: "top"} });
                //     setModal(false);
                //     getOrders();
                // }    
            }
            catch (err: any) {
                enqueueSnackbar(t('errorHappened'), { variant: "error", anchorOrigin: { horizontal: "right", vertical: "top"} });
                console.log(err);
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
                        <Button color="inherit" variant="contained" sx={whiteButtonStyles} style={{ float: "right" }} onClick={() => { getOrders(); }}>
                            {t('reload')} <RestartAltOutlined sx={{ ml: 0.5, pb: 0.45, justifyContent: "center", alignItems: "center" }} fontSize="small" />
                        </Button>
                        <Button 
                            color="inherit" variant="contained" sx={whiteButtonStyles} 
                            style={{ float: "right", marginRight: "5px" }} href="/admin/new-order"
                        >
                            {t('New order')} <AddOutlined sx={{ ml: 0.5, pb: 0.45, justifyContent: "center", alignItems: "center" }} fontSize="small" />
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
                                            disableRowSelectionOnClick
                                            onRowDoubleClick={((params: any) => navigate("/admin/edit-order/"+params.row.orderId))}
                                            style={{ fontSize: "12px" }}
                                        />
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
        </div>
    );
}

export default Orders;
