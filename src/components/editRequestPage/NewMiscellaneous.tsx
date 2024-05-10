import React from 'react';
import { useState, useEffect } from 'react';
import { Accordion, AccordionDetails, AccordionSummary, Alert, Autocomplete, Box, Button, Chip, DialogActions, DialogContent, FormControlLabel, Grid, IconButton, InputLabel, ListItem, ListItemText, NativeSelect, Skeleton, Switch, TextField, Typography } from '@mui/material';
import AddCircleOutlinedIcon from '@mui/icons-material/AddCircleOutlined';
import SearchIcon from '@mui/icons-material/Search';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import Popper from '@mui/material/Popper';
import { SnackbarProvider, enqueueSnackbar } from 'notistack';
import { useTranslation } from 'react-i18next';
import { GridColDef, GridRenderCellParams, DataGrid } from '@mui/x-data-grid';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import dayjs, { Dayjs } from 'dayjs';
import { AuthenticationResult } from '@azure/msal-browser';
import { useMsal, useAccount } from '@azure/msal-react';
import { useAuthorizedBackendApi } from '../../api/api';
import { protectedResources, transportRequest, pricingRequest } from '../../config/authConfig';
import { BackendService } from '../../utils/services/fetch';
import CompanySearch from '../shared/CompanySearch';
import NewContact from './NewContact';
import { actionButtonStyles, inputLabelStyles, gridStyles, BootstrapDialog, BootstrapDialogTitle, buttonCloseStyles, datetimeStyles, BootstrapInput, whiteButtonStyles } from '../../utils/misc/styles';
import NewService from '../shared/NewService';
import { containerPackages, currencyOptions } from '../../utils/constants';
import { compareServices, getAccessToken } from '../../utils/functions';

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

function NewMiscellaneous(props: any) {
    const [load, setLoad] = useState<boolean>(true);
    const [loadEdit, setLoadEdit] = useState<boolean>(false);
    const [modal, setModal] = useState<boolean>(false);
    const [modal2, setModal2] = useState<boolean>(false);
    const [modal7, setModal7] = useState<boolean>(false);
    const [modal8, setModal8] = useState<boolean>(false);
    const [ports, setPorts] = useState<any>(null);
    const [containers, setContainers] = useState<any>(null);
    const [services, setServices] = useState<any>(null);
    const [currentId, setCurrentId] = useState<string>("");
    const [currentEditId, setCurrentEditId] = useState<string>("");
    const [miscs, setMiscs] = useState<any>(null);
    const [allMiscs, setAllMiscs] = useState<any>(null);
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
    const [containerTypes, setContainerTypes] = useState<any>(null);
    const [price, setPrice] = useState<number>(0);
    const [servicesSelection, setServicesSelection] = useState<any>([]);
    const [withShipment, setWithShipment] = useState<boolean>(true);
    const [showHaulages, setShowHaulages] = useState<boolean>(false);

    const [tempToken, setTempToken] = useState<string>("");
    
    const { t } = useTranslation();
    
    const { instance, accounts } = useMsal();
    const account = useAccount(accounts[0] || {});
    const context = useAuthorizedBackendApi();
    
    const CustomPopper = React.forwardRef(function CustomPopper(props: any, ref: any) {
        return <Popper {...props} ref={ref} placement="top-start" />;
    });
      
    function calculateTotal(data: any) {
        // Initialize total price and package name
        let total = 0;
        let packageName;
    
        // Loop through the data
        for(let i = 0; i < data.length; i++) {
            // If packageName is not set, set it to the first one
            if(!packageName) {
                packageName = data[i].container.packageName !== null ? data[i].container.packageName : "Général";
            }
    
            // Loop through the services in the current data object
            for(let j = 0; j < data[i].services.length; j++) {
                // Add the price of the service to the total
                total += data[i].services[j].price;
            }
        }
    
        // Return the package name and total price in the desired format
        return packageName + ' : ' + total;
    }

    function getServicesTotal(data: any, currency: string) {
        let services = [];
    
        // Loop through the data
        for(let i = 0; i < data.length; i++) {
            // Loop through the services in the current data object
            for(let j = 0; j < data[i].services.length; j++) {
                let service = data[i].services[j];
                services.push(`${service.serviceName} : ${service.price} ${currency}`);
            }
        }
    
        // Return the services and their total price in the desired format
        return services.join('; ');
    }
    
    const columnsMiscs: GridColDef[] = [
        { field: 'supplierName', headerName: t('supplier'), minWidth: 120, flex: 2 },
        { field: 'currency', headerName: t('costPrices'), renderCell: (params: GridRenderCellParams) => {
            return (
                <Box sx={{ my: 1, mr: 1 }}>
                    <Box>
                        {
                            params.row.containers !== null ?
                            params.row.containers[0] ? 
                            <>{calculateTotal(params.row.containers)+" "+params.row.currency}</> : "N/A" : null
                        }
                    </Box>
                </Box>
            );
        }, flex: 1 },
        { field: 'services', headerName: 'Services', renderCell: (params: GridRenderCellParams) => {
            return (
                <Box sx={{ my: 1, mr: 1 }}>
                    {
                        params.row.containers !== null ?
                        params.row.containers[0] ? 
                        <>{getServicesTotal(params.row.containers, params.row.currency)}</> : "N/A" : null
                    }
                </Box>
            );
        }, flex: 2.5 },
        { field: 'validUntil', headerName: t('validUntil'), renderCell: (params: GridRenderCellParams) => {
            return (
                <Box sx={{ my: 1, mr: 1 }}>
                    <Chip label={(new Date(params.row.validUntil)).toLocaleDateString().slice(0,10)} color={(new Date()).getTime() - (new Date(params.row.validUntil)).getTime() > 0 ? "warning" : "success"}></Chip>
                </Box>
            );
        }, minWidth: 100, flex: 0.75 },
        { field: 'updated', headerName: t('created'), renderCell: (params: GridRenderCellParams) => {
            return (
                <Box sx={{ my: 1, mr: 1 }}>
                    {
                        params.row.updated !== null ? 
                        <Chip label={(new Date(params.row.updated)).toLocaleDateString().slice(0,10)} color={(new Date()).getTime() - (new Date(params.row.updated)).getTime() > 0 ? "default" : "default"}></Chip> : 
                        <Chip label={(new Date(params.row.created)).toLocaleDateString().slice(0,10)} color={(new Date()).getTime() - (new Date(params.row.created)).getTime() > 0 ? "default" : "default"}></Chip>
                    }
                </Box>
            );
        }, flex: 0.75 },
        // { field: 'created', headerName: t('created'), renderCell: (params: GridRenderCellParams) => {
        //     return (
        //         <Box sx={{ my: 1, mr: 1 }}>
        //             <Chip label={(new Date(params.row.created)).toLocaleDateString().slice(0,10)} color={(new Date()).getTime() - (new Date(params.row.created)).getTime() > 0 ? "default" : "default"}></Chip>
        //         </Box>
        //     );
        // }, minWidth: 100, flex: 0.5 },
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
        }, minWidth: 120, flex: 0.5 },
    ];
    
    useEffect(() => {
        getPorts();
        getProtectedData(); // Services and Containers
    }, [account, instance, account]);

    useEffect(() => {
        if (ports !== null) {
            getMiscellaneouses();
        }
    }, [withShipment, ports, account, instance, account]);
    
    useEffect(() => {
        if (ports !== null && allMiscs !== null) {
            var portsIds = ports.map((elm: any) => elm.portName);
            if (showHaulages === false) {
                setMiscs(allMiscs.filter((elm: any) => portsIds.includes(elm.departurePortName)));
            }
            else {
                setMiscs(allMiscs.filter((elm: any) => !portsIds.includes(elm.departurePortName)));
            }
        }
    }, [showHaulages, ports]);
    
    const getPorts = async () => {
        if (account && instance && context) {
            const response = await (context?.service as BackendService<any>).getSingle(protectedResources.apiLisTransport.endPoint+"/Port/Ports?pageSize=2000");
            if (response !== null && response !== undefined) {
                setPorts(response);
            }  
        }
    }
    
    const getProtectedData = async () => {
        if (account && instance && context) {
            // const token = await getAccessToken(instance, transportRequest, account);
            
            getServices("");
            getContainers("");
        }
    }

    const getServices = async (token: string) => {
        if (account && instance && context) {
            const response = await (context?.service as BackendService<any>).getWithToken(protectedResources.apiLisTransport.endPoint+"/Service?pageSize=500", context.tokenTransport);
            if (response !== null && response !== undefined) {
                setServices(response.sort((a: any, b: any) => compareServices(a, b)).filter((obj: any) => obj.servicesTypeId.includes(5) || obj.servicesTypeId.includes(2))); // Filter the services for miscellaneous (MISCELLANEOUS = 5 & HAULAGE = 2)
            }  
        }
    }
    
    const getContainers = async (token: string) => {
        setContainers(containerPackages);
    }
    
    const getMiscellaneouses = async () => {
        if (account && instance && context) {
            setLoad(true);

            var token = null;
            // if (tempToken === "") {
            //     token = await getAccessToken(instance, pricingRequest, account);
            //     setTempToken(token);    
            // }
            
            const response = await (context?.service as BackendService<any>).getWithToken(protectedResources.apiLisPricing.endPoint+"/Miscellaneous/Miscellaneous?withShipment="+withShipment, context.tokenPricing);
            if (response !== null && response !== undefined) {
                setAllMiscs(response);
                var portsIds = ports.map((elm: any) => elm.portName);
                if (!showHaulages) {
                    setMiscs(response.filter((elm: any) => portsIds.includes(elm.departurePortName)));
                }
                else {
                    setMiscs(response.filter((elm: any) => !portsIds.includes(elm.departurePortName)));
                }
                
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
        setServiceName(null);
        setServicesSelection([]);
        setContainerTypes(null);
    }
    
    const getMiscellaneous = async (id: string) => {
        setLoadEdit(true)
        if (account && instance && context) {
            const response = await (context?.service as BackendService<any>).getWithToken(protectedResources.apiLisPricing.endPoint+"/Miscellaneous/Miscellaneous?id="+id+"&withShipment="+withShipment, context.tokenPricing);
            if (response !== null && response !== undefined) {
                console.log(response.services);
                setSupplier({contactId: response.supplierId, contactName: response.supplierName});
                setPortLoading(ports.find((elm: any) => elm.portId === response.departurePortId));
                setPortDischarge(ports.find((elm: any) => elm.portId === response.destinationPortId));
                setCurrency(response.currency);
                setValidUntil(dayjs(response.validUntil));
                setComment(response.comment);
                setServicesSelection(response.services);
                setContainerTypes(response.services.length !== 0 ? response.services[0].containers[0].packageId !== 0 ? response.services[0].containers[0] : null : null);
                setLoadEdit(false);
            }
            else {
                setLoadEdit(false);
            }
            console.log(response);
        }
    }
    
    const searchMiscellaneous = async () => {
        if (account && instance && context) {
            setLoad(true);
            var requestFormatted = createGetRequestUrl(portDeparture?.portId, portDestination?.portId, searchedSupplier?.contactId);
            const response = await (context?.service as BackendService<any>).getWithToken(requestFormatted+"&withShipment="+withShipment, context.tokenPricing);
            if (response !== null && response !== undefined) {
                var portsIds = ports.map((elm: any) => elm.portName);
                setMiscs(response.filter((elm: any) => portsIds.includes(elm.departurePortName)));
                setLoad(false);
            }
            else {
                setLoad(false);
            }
            console.log(response);
        }
    }

    const createMiscellaneous = async () => {
        if (servicesSelection !== null && validUntil !== null && supplier !== null && servicesSelection.length !== 0) {
            if (account && instance && context) {
                var dataSent = null;
                var urlString = "";

                if (currentEditId !== "") {
                    if (portLoading !== null && portDischarge !== null && portLoading !== undefined && portDischarge !== undefined) {
                        dataSent = {
                            "miscellaneousId": currentEditId,
                            "id": currentEditId,
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
                            "containers": servicesSelection.map((elm: any) => { return { container: elm.containers[0] !== null ? elm.containers[0] : {packageId: 0, packageName: null}, services: [elm.service] } }),
                            "updated": (new Date()).toISOString()
                        };
                    }
                    else {
                        dataSent = {
                            "miscellaneousId": currentEditId,
                            "id": currentEditId,
                            "supplierId": supplier.contactId,
                            "supplierName": supplier.contactName,
                            "currency": currency,
                            "validUntil": validUntil?.toISOString(),
                            "comment": comment,
                            "services": servicesSelection,
                            "containers": servicesSelection.map((elm: any) => { return { container: elm.containers[0] !== null ? elm.containers[0] : {packageId: 0, packageName: null}, services: [elm.service] } }),
                            "updated": (new Date()).toISOString()
                        };
                    }
                }
                else {
                    if (portLoading !== null && portDischarge !== null && portLoading !== undefined && portDischarge !== undefined) {
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
                            "containers": servicesSelection.map((elm: any) => { return { container: elm.containers[0] !== null ? elm.containers[0] : {packageId: 0, packageName: null}, services: [elm.service] } }),
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
                            "containers": servicesSelection.map((elm: any) => { return { container: elm.containers[0] !== null ? elm.containers[0] : {packageId: 0, packageName: null}, services: [elm.service] } }),
                            "services": servicesSelection,
                            "updated": (new Date()).toISOString()
                        };
                    }
                }
                console.log(dataSent);
                const response = await (context?.service as BackendService<any>).postWithToken(protectedResources.apiLisPricing.endPoint+"/Miscellaneous/Miscellaneous", dataSent, context.tokenPricing);
                if (response !== null && response !== undefined) {
                    enqueueSnackbar(t('successCreated'), { variant: "success", anchorOrigin: { horizontal: "right", vertical: "top"} });
                    // getMiscellaneouses();
                    resetForm();
                    props.updateMiscs();
                    // props.closeModal();
                }
                else {
                    enqueueSnackbar(t('errorHappened'), { variant: "error", anchorOrigin: { horizontal: "right", vertical: "top"} });
                }
            }
        }
        else {
            enqueueSnackbar('One or many fields are empty, please check the fields supplier, valid until and add at least one service.', { variant: "warning", anchorOrigin: { horizontal: "right", vertical: "top"} });
        }
    }

    const deleteMiscellaneous = async (id: string) => {
        if (account && instance && context) {
            // alert("Function not available yet!");
            const response = await (context?.service as BackendService<any>).deleteWithToken(protectedResources.apiLisPricing.endPoint+"/Miscellaneous/DeleteMiscellaneous/"+id, context.tokenPricing);
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
    
    function findMiscellaneous(supplierName: string, packageName: string, data: any) {
        console.log(data);
        const foundMiscellaneous = data.find((misc: any) => 
            misc.supplierName === supplierName &&
            misc.containers.some((container: any) => 
                container.container.packageName === packageName &&
                container.services.some((service: any) => service.price > 0) // Assuming you want to filter only if the service has a price > 0
            )
        );
      
        return foundMiscellaneous || null;
    }
    
    return (
        <div style={{ background: "#fff", borderTopLeftRadius: 20, borderTopRightRadius: 20 }}>
            <SnackbarProvider />
            <DialogContent dividers>
                {
                    loadEdit === false ?
                    <Grid container spacing={2}>
                        <Grid item xs={12} md={8}>
                            <Typography sx={{ fontSize: 18 }}><b>Miscellaneous price information</b></Typography>
                        </Grid>
                        <Grid item xs={12} md={4}>
                            <Button variant="contained" color="inherit" sx={{ float: "right", backgroundColor: "#fff", textTransform: "none" }} onClick={() => { setModal7(true); }} >Create new supplier</Button>
                        </Grid>
                        <Grid item xs={12} md={8}>
                            <Grid container spacing={2}>
                                <Grid item xs={12} md={6} mt={0.25}>
                                    <InputLabel htmlFor="supplier" sx={inputLabelStyles}>{t('supplier')}</InputLabel>
                                    <CompanySearch id="supplier" value={supplier} onChange={setSupplier} category={0} callBack={() => console.log(supplier)} fullWidth />
                                </Grid>
                                {/* <Grid item xs={12} md={6} mt={0.25}>
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
                                            disabled={!withShipment}
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
                                            disabled={!withShipment}
                                            sx={{ mt: 1 }}
                                            renderInput={(params: any) => <TextField {...params} />}
                                            onChange={(e: any, value: any) => { setPortDischarge(value); }}
                                            fullWidth
                                        /> : <Skeleton />
                                    }
                                </Grid> */}
                                <Grid item xs={12} md={6}>
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
                                <Grid item xs={12} md={6}>
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
                                <Grid item xs={12} md={6}>
                                    <InputLabel htmlFor="container-types" sx={inputLabelStyles}>{t('container')}</InputLabel>
                                    {
                                        containers !== null ? 
                                        <Autocomplete
                                            id="container-types"
                                            options={containers || []}
                                            getOptionLabel={(option: any) => option.packageName}
                                            value={containerTypes}
                                            disabled={servicesSelection.length !== 0 ? true : false}
                                            onChange={(event: any, newValue: any) => {
                                                setContainerTypes(newValue);
                                            }}
                                            isOptionEqualToValue={(option, value) => option.packageId === value.packageId}
                                            renderInput={(params: any) => <TextField {...params} sx={{ mt: 1, textTransform: "lowercase" }} />}
                                            fullWidth
                                        /> : <Skeleton />
                                    }
                                </Grid>
                            </Grid>
                        </Grid>
                        
                        <Grid item xs={12} md={4}>
                            <Grid container spacing={2}>
                                <Grid item xs={12} md={12} mt={-0.75}>
                                    <InputLabel htmlFor="comment" sx={inputLabelStyles}>{t('comment')}</InputLabel>
                                    <BootstrapInput id="comment" type="text" multiline rows={4.875} value={comment} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setComment(e.target.value)} fullWidth />
                                </Grid>
                            </Grid>
                        </Grid>
                        <Grid item xs={12} md={8}>
                            <Typography sx={{ fontSize: 18, mb: 1 }}><b>{t('listServices')}</b></Typography>
                        </Grid>
                        <Grid item xs={12} md={4}>
                            <Button 
                                variant="contained" color="inherit" 
                                sx={{ float: "right", backgroundColor: "#fff", textTransform: "none" }} 
                                onClick={() => { setModal8(true); }}
                            >
                                Create new service
                            </Button>
                        </Grid>
                        <Grid item xs={12} md={8}>
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
                                    PopperComponent={CustomPopper}
                                    renderInput={(params: any) => <TextField {...params} />}
                                    onChange={(e: any, value: any) => { setServiceName(value); }}
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
                                    if (serviceName !== null && price > 0) {
                                        console.log(serviceName); console.log(containerTypes); console.log(price);
                                        setServicesSelection((prevItems: any) => [...prevItems, { 
                                            service: { serviceId: serviceName.serviceId, serviceName: serviceName.serviceName, price: Number(price) }, containers: [containerTypes]
                                        }]);
                                        setServiceName(null); setPrice(0);
                                    } 
                                    else {
                                        enqueueSnackbar('You need to fill the service and price to add a service price.', { variant: "warning", anchorOrigin: { horizontal: "right", vertical: "top"} });
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
                                                            item.containers[0] !== null && item.containers[0] !== undefined ?
                                                            t('serviceName')+" : "+item.service.serviceName+" | "+t('container')+" : "+item.containers[0].packageName+" | "+t('price')+" : "+item.service.price+" "+currency : 
                                                            t('serviceName')+" : "+item.service.serviceName+" | "+t('price')+" : "+item.service.price+" "+currency
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
                <Button
                    variant="contained"
                    color={"primary"} 
                    onClick={() => { 
                        if (currentEditId !== "") {
                            createMiscellaneous(); 
                        }
                        else if (miscs !== null && portLoading !== null && portDischarge !== null) {
                            var miscsFiltered = miscs.find((elm: any) => elm.departurePortName === portLoading.portName && elm.destinationPortName === portDischarge.portName);
                            if (findMiscellaneous(supplier.contactName, containerTypes !== null ? containerTypes.packageName : null, miscsFiltered !== undefined ? miscsFiltered.suppliers : []) === null) {
                                createMiscellaneous(); 
                            }
                            else {
                                enqueueSnackbar("A similar pricing already exists, change the container type!", { variant: "warning", anchorOrigin: { horizontal: "right", vertical: "top"} });
                            }
                        }
                        else {
                            createMiscellaneous(); 
                        }
                    }} 
                    sx={{ mr: 1.5, textTransform: "none" }}
                >
                    {t('validate')}
                </Button>
                <Button variant="contained" onClick={() => props.closeModal()} sx={buttonCloseStyles}>{t('close')}</Button>
            </DialogActions>    
            
            <BootstrapDialog
                onClose={() => props.closeModal()}
                aria-labelledby="custom-dialog-title2"
                open={modal2}
                maxWidth="lg"
                fullWidth
            >
                
            </BootstrapDialog>

            {/* Add a new contact */}
            <BootstrapDialog
                onClose={() => setModal7(false)}
                aria-labelledby="custom-dialog-title7"
                open={modal7}
                maxWidth="md"
                fullWidth
            >
                <NewContact 
                    categories={["OTHERS","SUPPLIERS"]}
                    closeModal={() => setModal7(false)}
                />
            </BootstrapDialog>

            {/* Create new service */}
            <BootstrapDialog
                onClose={() => setModal8(false)}
                aria-labelledby="custom-dialog-title8"
                open={modal8}
                maxWidth="md"
                fullWidth
            >
                <NewService 
                    closeModal={() => setModal8(false)}
                    callBack={getServices}
                />
            </BootstrapDialog>
        </div>
    );
}

export default NewMiscellaneous;
