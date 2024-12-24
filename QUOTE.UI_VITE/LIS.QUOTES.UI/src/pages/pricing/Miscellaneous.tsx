import React from 'react';
import { useState, useEffect } from 'react';
import { Accordion, AccordionDetails, AccordionSummary, Alert, Autocomplete, Box, Button, Chip, DialogActions, DialogContent, FormControlLabel, IconButton, InputLabel, ListItem, ListItemText, NativeSelect, Skeleton, Switch, TextField, Typography } from '@mui/material';
import Grid from '@mui/material/Grid2';
import AddCircleOutlinedIcon from '@mui/icons-material/AddCircleOutlined';
import SearchIcon from '@mui/icons-material/Search';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import Popper from '@mui/material/Popper';
import { Anchor } from '@mui/icons-material';
import { SnackbarProvider, enqueueSnackbar } from 'notistack';
import { useTranslation } from 'react-i18next';
import { GridColDef, GridRenderCellParams, DataGrid } from '@mui/x-data-grid';
import { BootstrapDialog, BootstrapDialogTitle, BootstrapInput, actionButtonStyles, buttonCloseStyles, datetimeStyles, gridStyles, inputIconStyles, inputLabelStyles, whiteButtonStyles } from '../../utils/misc/styles';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import dayjs, { Dayjs } from 'dayjs';
import { containerPackages, currencyOptions } from '../../utils/constants';
import { compareServices } from '../../utils/functions';
import NewContact from '../../components/shared/NewContact';
import NewService from '../../components/shared/NewService';
import NewPort from '../../components/shared/NewPort';
import CompanySearch from '../../components/shared/CompanySearch';
import PortAutocomplete from '../../components/shared/PortAutocomplete';
import { getPorts, getService } from '../../api/client/transport';
import { deleteApiMiscellaneousDeleteMiscellaneousById, getApiMiscellaneousMiscellaneous, postApiMiscellaneousMiscellaneous } from '../../api/client/pricing';

function Miscellaneous() {
    const [load, setLoad] = useState<boolean>(true);
    const [loadEdit, setLoadEdit] = useState<boolean>(false);
    const [modal, setModal] = useState<boolean>(false);
    const [modal2, setModal2] = useState<boolean>(false);
    const [modal7, setModal7] = useState<boolean>(false);
    const [modal8, setModal8] = useState<boolean>(false);
    const [modal9, setModal9] = useState<boolean>(false);
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

    const { t } = useTranslation();    
    
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
        getPortsService();
        getServices();
        getContainers();
    }, []);

    useEffect(() => {
        if (ports !== null) {
            getMiscellaneouses();
        }
    }, [withShipment, ports]);
    
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
                setServices(response.data?.sort((a: any, b: any) => compareServices(a, b)).filter((obj: any) => obj.servicesTypeId.includes(5))); // Filter the services for miscellaneous (MISCELLANEOUS = 5)
            }
        }
        catch (err: any) {
            console.log(err);
        }
    }
    
    const getContainers = async () => {
        setContainers(containerPackages);
    }
    
    const getMiscellaneouses = async () => {
        try {
            setLoad(true);
            const response: any = await getApiMiscellaneousMiscellaneous({query: {withShipment: withShipment}});
            if (response !== null && response !== undefined) {
                setAllMiscs(response.data);
                var portsIds = ports.map((elm: any) => elm.portName);
                if (!showHaulages) {
                    setMiscs(response.data?.filter((elm: any) => portsIds.includes(elm.departurePortName)));
                }
                else {
                    setMiscs(response.data?.filter((elm: any) => !portsIds.includes(elm.departurePortName)));
                }
                
                if (withShipment === false) {
                    setMiscsWithoutShipment(response.data);
                }
                setLoad(false);
            }
            else {
                setLoad(false);
            }
            console.log(response);
        }
        catch (err: any) {
            console.log(err);
            setLoad(false);
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
        try {
            const response: any = await getApiMiscellaneousMiscellaneous({query: {id: id, withShipment: withShipment}});
            if (response !== null && response !== undefined) {
                // console.log(response.data?.services);
                setSupplier({contactId: response.data?.supplierId, contactName: response.data?.supplierName});
                setPortLoading(ports.find((elm: any) => elm.portId === response.data?.departurePortId));
                setPortDischarge(ports.find((elm: any) => elm.portId === response.data?.destinationPortId));
                setCurrency(response.data?.currency);
                setValidUntil(dayjs(response.data?.validUntil));
                setComment(response.data?.comment);
                setServicesSelection(response.data?.services);
                setContainerTypes(response.data?.services.length !== 0 ? response.data?.services[0].containers[0].packageId !== 0 ? response.data?.services[0].containers[0] : null : null);
                setLoadEdit(false);
            }
            else {
                setLoadEdit(false);
            }
            console.log(response);
        }
        catch (err: any) {
            console.log(err);
            setLoadEdit(false);
        }
    }
    
    const searchMiscellaneous = async () => {
        try {
            setLoad(true);
            const response: any = await getApiMiscellaneousMiscellaneous({query: {departurePortId: portDeparture?.portId, destinationPortId: portDestination?.portId, supplierId: searchedSupplier?.contactId, withShipment: withShipment}});
            if (response !== null && response !== undefined) {
                var portsIds = ports.map((elm: any) => elm.portName);
                setMiscs(response.data?.filter((elm: any) => portsIds.includes(elm.departurePortName)));
                setLoad(false);
            }
            else {
                setLoad(false);
            }
            console.log(response);
        }
        catch (err: any) {
            console.log(err);
            setLoad(false);
        }
    }

    const createMiscellaneous = async () => {
        if (servicesSelection !== null && validUntil !== null) {
            try {
                var dataSent = null;
                if (currentEditId !== "") {
                    if (portLoading !== null && portDischarge !== null && portLoading !== undefined && portDischarge !== undefined) {
                        dataSent = {
                            // "miscellaneousId": currentEditId,
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
                            // "miscellaneousId": currentEditId,
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
                const response = await postApiMiscellaneousMiscellaneous({body: dataSent});
                if (response !== null && response !== undefined) {
                    setModal2(false);
                    enqueueSnackbar(t('successCreated'), { variant: "success", anchorOrigin: { horizontal: "right", vertical: "top"} });
                    getMiscellaneouses();
                }
                else {
                    enqueueSnackbar(t('errorHappened'), { variant: "error", anchorOrigin: { horizontal: "right", vertical: "top"} });
                }
            }
            catch (err: any) {
                console.log(err);
            }
        }
        else {
            enqueueSnackbar(t('fieldsEmptySeafreight'), { variant: "error", anchorOrigin: { horizontal: "right", vertical: "top"} });
        }
    }

    const deleteMiscellaneous = async (id: string) => {
        try {
            // alert("Function not available yet!");
            const response = await deleteApiMiscellaneousDeleteMiscellaneousById({path: {id: id}});
            if (response !== null && response !== undefined) {
                enqueueSnackbar(t('rowDeletedSuccess'), { variant: "success", anchorOrigin: { horizontal: "right", vertical: "top"} });
                setModal(false);
                getMiscellaneouses();
            }
            else {
                enqueueSnackbar(t('rowDeletedError'), { variant: "success", anchorOrigin: { horizontal: "right", vertical: "top"} });
            }
        }
        catch (err: any) {
            console.log(err);
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
            <Box sx={{ py: 2.5 }}>
                <Typography variant="h5" sx={{mt: {xs: 4, md: 1.5, lg: 1.5 }}} mx={5}><b>{t('listMiscellaneous')}</b></Typography>
                <Grid container spacing={2} mt={0} px={5}>
                    <Grid size={{ xs: 12, md: 6 }}>
                        <FormControlLabel 
                            control={
                            <Switch
                                checked={showHaulages}
                                onChange={(event: React.ChangeEvent<HTMLInputElement>) => { 
                                    console.log(event.target.checked); setShowHaulages(event.target.checked);
                                }}
                                inputProps={{ 'aria-label': 'controlled' }}
                            />}
                            label={"Show haulage miscs"} 
                            sx={{ float: "right" }}
                        />
                        <FormControlLabel 
                            control={
                            <Switch
                                checked={withShipment}
                                onChange={(event: React.ChangeEvent<HTMLInputElement>) => { 
                                    console.log(event.target.checked); setWithShipment(event.target.checked); setLoad(true);
                                }}
                                inputProps={{ 'aria-label': 'controlled' }}
                            />}
                            label={t('withShipment')} 
                            sx={{ float: "right" }}
                        />
                    </Grid>
                    <Grid size={{ xs: 12, md: 6 }}>
                        <Button variant="contained" sx={actionButtonStyles} onClick={() => { setCurrentEditId(""); resetForm(); setModal2(true); }}>
                            {t('newMiscellaneousPrice')} <AddCircleOutlinedIcon sx={{ ml: 0.5, pb: 0.25, justifyContent: "center", alignItems: "center" }} fontSize="small" />
                        </Button>
                        <Button variant="contained" color="inherit" sx={{ float: "right", backgroundColor: "#fff", textTransform: "none" }} onClick={() => { setModal7(true); }} >Create new supplier</Button>
                    </Grid>
                    
                    <Grid size={{ xs: 12, md: 4 }} mt={1}>
                        <InputLabel htmlFor="company-name" sx={inputLabelStyles}>{t('supplier')}</InputLabel>
                        <CompanySearch id="company-name" value={searchedSupplier} onChange={setSearchedSupplier} category={0} callBack={() => console.log(searchedSupplier)} fullWidth />
                    </Grid>
                    <Grid size={{ xs: 12, md: 3 }} mt={1}>
                        <InputLabel htmlFor="port-departure" sx={inputLabelStyles}><Anchor fontSize="small" sx={inputIconStyles} /> {t('departurePort')}</InputLabel>
                        {
                            ports !== null ?
                            <PortAutocomplete id="port-departure" options={ports} value={portDeparture} onChange={setPortDeparture} fullWidth /> : <Skeleton />
                        }
                    </Grid>
                    <Grid size={{ xs: 12, md: 3 }} mt={1}>
                        <InputLabel htmlFor="destination-port" sx={inputLabelStyles}><Anchor fontSize="small" sx={inputIconStyles} /> {t('arrivalPort')}</InputLabel>
                        {
                            ports !== null ?
                            <PortAutocomplete id="destination-port" options={ports} value={portDestination} onChange={setPortDestination} fullWidth /> : <Skeleton />
                        }
                    </Grid>
                    <Grid size={{ xs: 12, md: 2 }} mt={1} sx={{ display: "flex", alignItems: "end" }}>
                        <Button 
                            variant="contained" 
                            color="inherit"
                            startIcon={<SearchIcon />} 
                            size="large"
                            sx={{ backgroundColor: "#fff", color: "#333", textTransform: "none", mb: 0.15 }}
                            onClick={searchMiscellaneous}
                            fullWidth
                        >
                            {t('search')}
                        </Button>
                    </Grid>
                </Grid>
                    
                <Grid container spacing={2} mt={1} px={5}>
                {
                    withShipment === true ?
                    !load ? 
                    <Grid size={{ xs: 12 }}>
                        {
                            miscs !== null && miscs.length !== 0 ?
                                <Box sx={{ overflow: "auto", width: { xs: "calc(100vw - 80px)", md: "100%" } }}>
                                {
                                    miscs.map((item: any, i: number) => {
                                        return (
                                            <Accordion key={"seaf"+i} sx={{ border: 1, borderColor: "#e5e5e5" }}>
                                                <AccordionSummary expandIcon={<ExpandMoreIcon />} aria-controls="panel1a-content" id="panel1a-header">
                                                    <Chip variant="outlined" label={item.departurePortName} sx={{ mr: 1 }} />
                                                    <Chip variant="outlined" label={item.destinationPortName} />
                                                </AccordionSummary>
                                                <AccordionDetails>
                                                    <DataGrid
                                                        rows={item.suppliers}
                                                        columns={columnsMiscs}
                                                        hideFooter
                                                        getRowId={(row: any) => row?.miscellaneousId}
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
                    </Grid> : <Skeleton sx={{ mx: 1, mt: 3, width: "100%" }} /> : null
                }
                {
                    withShipment === false ?
                    !load ? 
                    <Grid size={{ xs: 12 }}>
                        {
                            miscsWithoutShipment !== null && miscsWithoutShipment.length !== 0 ?
                            <Box sx={{ overflow: "auto", width: { xs: "calc(100vw - 80px)", md: "100%" } }}>
                            {
                                miscsWithoutShipment !== null && miscsWithoutShipment.length !== 0 ?
                                <DataGrid
                                    rows={miscsWithoutShipment}
                                    columns={columnsMiscs}
                                    hideFooter
                                    getRowId={(row: any) => row?.miscellaneousId}
                                    getRowHeight={() => "auto" }
                                    sx={gridStyles}
                                    disableRowSelectionOnClick
                                /> : <Skeleton />
                            }
                            </Box> : <Alert severity="warning">{t('noResults')}</Alert>
                        }
                    </Grid> : <Skeleton sx={{ mx: 1, mt: 3, width: "100%" }} /> : null
                }
                </Grid>
            </Box>
            <BootstrapDialog open={modal} onClose={() => setModal(false)} maxWidth="sm" fullWidth>
                <BootstrapDialogTitle id="custom-dialog-title" onClose={() => setModal(false)}>
                    <b>{t('deleteRowMisc')}</b>
                </BootstrapDialogTitle>
                <DialogContent dividers>{t('areYouSureDeleteRow')}</DialogContent>
                <DialogActions>
                    <Button variant="contained" color={"primary"} onClick={() => { deleteMiscellaneous(currentId); }} sx={{ mr: 1.5, textTransform: "none" }}>{t('accept')}</Button>
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
                    <b>{currentEditId === "" ? t('createRowMisc') : t('editRowMisc')}</b>
                </BootstrapDialogTitle>
                <DialogContent dividers>
                    {
                        loadEdit === false ?
                        <Grid container spacing={2}>
                            <Grid size={{ xs: 12, md: 8 }}>
                                <Typography sx={{ fontSize: 18 }}><b>{t('miscPriceInfo')}</b></Typography>
                            </Grid>
                            <Grid size={{ xs: 12, md: 4 }}>
                                <Button variant="contained" color="inherit" sx={{ float: "right", backgroundColor: "#fff", textTransform: "none" }} onClick={() => { setModal7(true); }} >Create new supplier</Button>
                            </Grid>
                            <Grid size={{ xs: 12, md: 9 }}>
                                <Grid container spacing={2}>
                                    <Grid size={{ xs: 12, md: 6 }} mt={0.25}>
                                        <InputLabel htmlFor="supplier" sx={inputLabelStyles}>{t('supplier')}</InputLabel>
                                        <CompanySearch id="supplier" value={supplier} onChange={setSupplier} category={0} callBack={() => console.log(supplier)} fullWidth />
                                    </Grid>
                                    <Grid size={{ xs: 12, md: 6 }} mt={0.25}>
                                        <InputLabel htmlFor="port-loading" sx={inputLabelStyles}><Anchor fontSize="small" sx={inputIconStyles} /> {t('departurePort')}</InputLabel>
                                        {
                                            ports !== null ?
                                            <PortAutocomplete id="port-loading" options={ports} value={portLoading} onChange={setPortLoading} fullWidth disabled={!withShipment} /> : <Skeleton />
                                        }
                                    </Grid>
                                    <Grid size={{ xs: 12, md: 6 }} mt={0.25}>
                                        <InputLabel htmlFor="discharge-port" sx={inputLabelStyles}><Anchor fontSize="small" sx={inputIconStyles} /> {t('arrivalPort')}</InputLabel>
                                        {
                                            ports !== null ?
                                            <PortAutocomplete id="discharge-port" options={ports} value={portDischarge} onChange={setPortDischarge} fullWidth disabled={!withShipment} /> : <Skeleton />
                                        }
                                    </Grid>
                                    <Grid size={{ xs: 12, md: 2 }}>
                                        <InputLabel htmlFor="valid-until" sx={inputLabelStyles}>{t('validUntil')}</InputLabel>
                                        <LocalizationProvider dateAdapter={AdapterDayjs}>
                                            <DatePicker 
                                                value={validUntil}
                                                format="DD/MM/YYYY" 
                                                onChange={(value: any) => { setValidUntil(value) }}
                                                slotProps={{ textField: { id: "valid-until", size: "small", fullWidth: true, sx: datetimeStyles }, inputAdornment: { sx: { position: "relative", right: "11.5px" } } }}
                                            />
                                        </LocalizationProvider>
                                    </Grid>
                                    <Grid size={{ xs: 12, md: 2 }}>
                                        <InputLabel htmlFor="currency" sx={inputLabelStyles}>{t('currency')}</InputLabel>
                                        <NativeSelect
                                            id="currency"
                                            value={currency}
                                            size="small"
                                            onChange={(e: any) => { setCurrency(e.target.value) }}
                                            input={<BootstrapInput />}
                                            fullWidth
                                        >
                                            {currencyOptions.map((elm: any, i: number) => (
                                                <option key={"currencyElm-"+i} value={elm.code}>{elm.label}</option>
                                            ))}
                                        </NativeSelect>
                                    </Grid>
                                    <Grid size={{ xs: 12, md: 2 }}>
                                        <InputLabel htmlFor="container-types" sx={inputLabelStyles}>{t('container')}</InputLabel>
                                        {
                                            containers !== null ? 
                                            <Autocomplete
                                                id="container-types"
                                                options={containers || []}
                                                getOptionLabel={(option: any) => option.packageName}
                                                value={containerTypes}
                                                size="small"
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
                            
                            <Grid size={{ xs: 12, md: 3 }}>
                                <Grid container spacing={2}>
                                    <Grid size={{ xs: 12, md: 12 }} mt={0}>
                                        <InputLabel htmlFor="comment" sx={inputLabelStyles}>{t('comment')}</InputLabel>
                                        <BootstrapInput id="comment" type="text" multiline rows={4.875} value={comment} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setComment(e.target.value)} fullWidth />
                                    </Grid>
                                </Grid>
                            </Grid>
                            <Grid size={{ xs: 12, md: 8 }}>
                                <Typography sx={{ fontSize: 18, mb: 1 }}><b>{t('listServices')}</b></Typography>
                            </Grid>
                            <Grid size={{ xs: 12, md: 4 }}>
                                <Button 
                                    variant="contained" color="inherit" 
                                    sx={{ float: "right", backgroundColor: "#fff", textTransform: "none" }} 
                                    onClick={() => { setModal8(true); }}
                                >
                                    {t('newService')}
                                </Button>
                                <Button 
                                    variant="contained" color="inherit" 
                                    sx={{ float: "right", backgroundColor: "#fff", textTransform: "none", mr: 1 }} 
                                    onClick={() => { setModal9(true); }}
                                >
                                    {t('newPort')}
                                </Button>
                            </Grid> 
                            <Grid size={{ xs: 12, md: 8 }}>
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
                                        size="small"
                                        sx={{ mt: 1 }}
                                        slots={{popper: CustomPopper}}
                                        renderInput={(params: any) => <TextField {...params} />}
                                        onChange={(e: any, value: any) => { setServiceName(value); }}
                                        fullWidth
                                    /> : <Skeleton />
                                }
                            </Grid>
                            <Grid size={{ xs: 12, md: 2 }}>
                                <InputLabel htmlFor="price-cs" sx={inputLabelStyles}>{t('price')}</InputLabel>
                                <BootstrapInput id="price-cs" type="number" value={price} onChange={(e: any) => setPrice(e.target.value)} fullWidth />
                            </Grid>
                            <Grid size={{ xs: 12, md: 2 }}>
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
                                            enqueueSnackbar(t('fieldNeedTobeFilled'), { variant: "error", anchorOrigin: { horizontal: "right", vertical: "top"} });
                                        }
                                    }} 
                                >
                                    {t('add')}
                                </Button>
                            </Grid>
                            <Grid size={{ xs: 12 }}>
                                {
                                    servicesSelection !== undefined && servicesSelection !== null && servicesSelection.length !== 0 ? 
                                    <Grid container spacing={2}>
                                        {
                                            servicesSelection.map((item: any, index: number) => (
                                                <Grid key={"serviceitem1-"+index} size={{ xs: 12, md: 6 }}>
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
                                    </Grid> : null  
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
                    <Button variant="contained" onClick={() => setModal2(false)} sx={buttonCloseStyles}>{t('close')}</Button>
                </DialogActions>
            </BootstrapDialog>

            {/* Add a new contact */}
            <BootstrapDialog open={modal7} onClose={() => setModal7(false)} maxWidth="md" fullWidth>
                <NewContact categories={["OTHERS","SUPPLIERS"]} closeModal={() => setModal7(false)} />
            </BootstrapDialog>

            {/* Create new service */}
            <BootstrapDialog open={modal8} onClose={() => setModal8(false)} maxWidth="md" fullWidth>
                <NewService closeModal={() => setModal8(false)} callBack={getServices} />
            </BootstrapDialog>

            {/* Create new port */}
            <BootstrapDialog open={modal9} onClose={() => setModal9(false)} maxWidth="md" fullWidth>
                <NewPort closeModal={() => setModal9(false)} callBack={getPorts} />
            </BootstrapDialog>
        </div>
    );
}

export default Miscellaneous;
