import { ExpandMore, AddOutlined, ReplayOutlined, Delete, Edit } from '@mui/icons-material';
import { Accordion, AccordionSummary, AccordionDetails, Grid, Box, IconButton, Typography, Skeleton, Autocomplete, Button, DialogActions, DialogContent, InputLabel, TextField } from '@mui/material';
import { DataGrid, GridColDef, GridRenderCellParams } from '@mui/x-data-grid';
import React, { useEffect, useState } from 'react';
import { calculateTotalPrice } from '../../utils/functions';
import { actionButtonStyles, BootstrapDialog, BootstrapDialogTitle, BootstrapInput, buttonCloseStyles, inputLabelStyles, sizingStyles } from '../../utils/misc/styles';
import { t } from 'i18next';
import { enqueueSnackbar } from 'notistack';
import { protectedResources } from '../../config/authConfig';
import { BackendService } from '../../utils/services/fetch';
import { useMsal, useAccount } from '@azure/msal-react';
import { useAuthorizedBackendApi } from '../../api/api';
import { CategoryEnum } from '../../utils/constants';
import CompanySearch from '../shared/CompanySearch';

const BudgetShipments = (props: any) => {
    const [loadOrderServicesBuy, setLoadOrderServicesBuy] = useState<boolean>(true);
    const [loadOrderServicesSell, setLoadOrderServicesSell] = useState<boolean>(true);
    const [currentId, setCurrentId] = useState<string>("");
    const [orderNumber, setOrderNumber] = useState<string>("");
    const [orderServices, setOrderServices] = useState<any>(null);
    
    const [modalService, setModalService] = useState<boolean>(false);
    const [service, setService] = useState<any>(null);
    const [servicePrice, setServicePrice] = useState<number>(0);
    const [serviceQuantity, setServiceQuantity] = useState<number>(1);
    const [serviceSupplier, setServiceSupplier] = useState<any>(null);
    const [serviceType, setServiceType] = useState<string>("");
    
    const { instance, accounts } = useMsal();
    const account = useAccount(accounts[0] || {});    
    const context = useAuthorizedBackendApi();
    
    const { services, contacts, orderData, id } = props;

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
    
    useEffect(() => {
        getOrderServices();
    }, [account, instance, context]);

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
                if (orderData !== null) {
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
                            enqueueSnackbar("The order service has been edited with success!", { variant: "success", anchorOrigin: { horizontal: "right", vertical: "top"} });
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
        <>
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
                            !loadOrderServicesBuy && orderServices !== null ? 
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
                                            <Typography variant="h6" fontSize={14}>
                                                Total Price: {calculateTotalPrice("Buy", orderServices)} €
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
                            !loadOrderServicesSell && orderServices !== null ? 
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
                                            <Typography variant="h6" fontSize={14}>
                                                Total Price: {calculateTotalPrice("Sell", orderServices)} €
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

        <BootstrapDialog open={modalService} onClose={() => setModalService(false)} maxWidth="md" fullWidth>
            <BootstrapDialogTitle id="custom-dialog-title" onClose={() => setModalService(false)}>
                <b>{currentId !== "" ? t('Edit a service') : t('Add a service')}</b>
            </BootstrapDialogTitle>
            <DialogContent dividers>
                <Grid container spacing={2}>
                    <Grid item xs={6} sx={{  }}>
                        <InputLabel htmlFor="service" sx={inputLabelStyles}>{t('Service')}</InputLabel>
                        {
                            services !== null ?
                            <Autocomplete
                                disablePortal
                                id="service"
                                options={services}
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
        </>
    );
};

export default BudgetShipments;
