import React from 'react';
import { useState, useEffect } from 'react';
import { Autocomplete, Button, DialogActions, DialogContent, IconButton, InputLabel, ListItem, ListItemText, NativeSelect, Skeleton, TextField, Typography } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import Popper from '@mui/material/Popper';
import { SnackbarProvider, enqueueSnackbar } from 'notistack';
import { useTranslation } from 'react-i18next';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { Dayjs } from 'dayjs';
import CompanySearch from '../shared/CompanySearch';
import NewContact from '../shared/NewContact';
import { inputLabelStyles, BootstrapDialog, buttonCloseStyles, datetimeStyles, BootstrapInput, whiteButtonStyles } from '../../utils/misc/styles';
import NewService from '../shared/NewService';
import { containerPackages, currencyOptions } from '../../utils/constants';
import { compareServices } from '../../utils/functions';
import { getPorts, getService } from '../../api/client/transport';
import { getApiMiscellaneousMiscellaneous, postApiMiscellaneousMiscellaneous } from '../../api/client/pricing';
import Grid from '@mui/material/Grid2';

function NewMiscellaneous(props: any) {
    //const [load, setLoad] = useState<boolean>(true);
    const [loadEdit] = useState<boolean>(false);
    //const [modal, setModal] = useState<boolean>(false);
    const [modal2] = useState<boolean>(false);
    const [modal7, setModal7] = useState<boolean>(false);
    const [modal8, setModal8] = useState<boolean>(false);
    const [ports, setPorts] = useState<any>(null);
    const [containers, setContainers] = useState<any>(null);
    const [services, setServices] = useState<any>(null);
    //const [currentId, setCurrentId] = useState<string>("");
    const [currentEditId] = useState<string>("");
    const [miscs, setMiscs] = useState<any>(null);
    const [allMiscs, setAllMiscs] = useState<any>(null);
    //const [miscsWithoutShipment, setMiscsWithoutShipment] = useState<any>(null);
    // const [searchedSupplier] = useState<any>(null);
    // const [portDeparture] = useState<any>(null);
    // const [portDestination] = useState<any>(null);
    
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
    const [withShipment] = useState<boolean>(true);
    const [showHaulages] = useState<boolean>(false);

    const { t } = useTranslation();
    
    const CustomPopper = React.forwardRef(function CustomPopper(props: any, ref: any) {
        return <Popper {...props} ref={ref} placement="top-start" />;
    });
      
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
            const response: any = getPorts({query: { pageSize: 2000 }});
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
                setServices(response.data?.sort((a: any, b: any) => compareServices(a, b)).filter((obj: any) => obj.servicesTypeId.includes(5) || obj.servicesTypeId.includes(2))); // Filter the services for miscellaneous (MISCELLANEOUS = 5 & HAULAGE = 2)
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
            //setLoad(true);
            const response: any = await getApiMiscellaneousMiscellaneous({query: { withShipment: withShipment }});
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
                    //setMiscsWithoutShipment(response.data);
                }
                //setLoad(false);
            }
            else {
                //setLoad(false);
            }
            console.log(response);
        }
        catch (err: any) {
            console.log(err);
            //setLoad(false);
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
    
    // const getMiscellaneous = async (id: string) => {
    //     setLoadEdit(true)
    //     try {
    //         const response: any = await getApiMiscellaneousMiscellaneous({query: {id: id, withShipment: withShipment}});
    //         if (response !== null && response !== undefined) {
    //             console.log(response.data?.services);
    //             setSupplier({contactId: response.data?.supplierId, contactName: response.data?.supplierName});
    //             setPortLoading(ports.find((elm: any) => elm.portId === response.data?.departurePortId));
    //             setPortDischarge(ports.find((elm: any) => elm.portId === response.data?.destinationPortId));
    //             setCurrency(response.data?.currency);
    //             setValidUntil(dayjs(response.data?.validUntil));
    //             setComment(response.data?.comment);
    //             setServicesSelection(response.data?.services);
    //             setContainerTypes(response.data?.services.length !== 0 ? response.data?.services[0].containers[0].packageId !== 0 ? response.data?.services[0].containers[0] : null : null);
    //             setLoadEdit(false);
    //         }
    //         else {
    //             setLoadEdit(false);
    //         }
    //         console.log(response);
    //     }
    //     catch (err: any) {
    //         console.log(err);
    //         setLoadEdit(false);
    //     }
    // }
    
    // const searchMiscellaneous = async () => {
    //     try {
    //         setLoad(true);
    //         const response: any = await getApiMiscellaneousMiscellaneous({query: { withShipment: withShipment, departurePortId: portDeparture?.portId, destinationPortId: portDestination?.portId, supplierId: searchedSupplier?.contactId }});
    //         if (response !== null && response !== undefined) {
    //             var portsIds = ports.map((elm: any) => elm.portName);
    //             setMiscs(response.data?.filter((elm: any) => portsIds.includes(elm.departurePortName)));
    //             setLoad(false);
    //         }
    //         else {
    //             setLoad(false);
    //         }
    //         console.log(response);
    //     }
    //     catch (err: any) {
    //         console.log(err);
    //         setLoad(false);
    //     }
    // }

    const createMiscellaneous = async () => {
        if (servicesSelection !== null && validUntil !== null && supplier !== null && servicesSelection.length !== 0) {
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
            catch (err: any) {
                console.log(err);
            }
        }
        else {
            enqueueSnackbar('One or many fields are empty, please check the fields supplier, valid until and add at least one service.', { variant: "warning", anchorOrigin: { horizontal: "right", vertical: "top"} });
        }
    }

    // const deleteMiscellaneous = async (id: string) => {
    //     try {
    //         // alert("Function not available yet!");
    //         const response = await deleteApiMiscellaneousDeleteMiscellaneousById({path: {id: id}});
    //         if (response !== null && response !== undefined) {
    //             enqueueSnackbar(t('rowDeletedSuccess'), { variant: "success", anchorOrigin: { horizontal: "right", vertical: "top"} });
    //             setModal(false);
    //             getMiscellaneouses();
    //         }
    //         else {
    //             enqueueSnackbar(t('rowDeletedError'), { variant: "success", anchorOrigin: { horizontal: "right", vertical: "top"} });
    //         }
    //     }
    //     catch (err: any) {
    //         console.log(err);
    //     }
    // }
    
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
                        <Grid size={{xs:12, md:8}}>
                            <Typography sx={{ fontSize: 18 }}><b>{t('miscPriceInfo')}</b></Typography>
                        </Grid>
                        <Grid size={{xs:12, md:4}}>
                            <Button variant="contained" color="inherit" sx={{ float: "right", backgroundColor: "#fff", textTransform: "none" }} onClick={() => { setModal7(true); }} >Create new supplier</Button>
                        </Grid>
                        <Grid size={{xs:12, md:8}}>
                            <Grid container spacing={2}>
                                <Grid size={{xs:12, md:6}} mt={0.25}>
                                    <InputLabel htmlFor="supplier" sx={inputLabelStyles}>{t('supplier')}</InputLabel>
                                    <CompanySearch id="supplier" value={supplier} onChange={setSupplier} category={undefined} callBack={() => console.log(supplier)} fullWidth />
                                </Grid>
                                <Grid size={{xs:12, md:6}}>
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
                                <Grid size={{xs:12, md:6}}>
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
                                <Grid size={{xs:12, md:6}}>
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
                                            onChange={(_: any, newValue: any) => {
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
                        
                        <Grid size={{xs:12, md:4}}>
                            <Grid container spacing={2}>
                                <Grid size={{xs:12, md:12}} mt={-0.75}>
                                    <InputLabel htmlFor="comment" sx={inputLabelStyles}>{t('comment')}</InputLabel>
                                    <BootstrapInput id="comment" type="text" multiline rows={4.875} value={comment} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setComment(e.target.value)} fullWidth />
                                </Grid>
                            </Grid>
                        </Grid>
                        <Grid size={{xs:12, md:8}}>
                            <Typography sx={{ fontSize: 18, mb: 1 }}><b>{t('listServices')}</b></Typography>
                        </Grid>
                        <Grid size={{xs:12, md:4}}>
                            <Button 
                                variant="contained" color="inherit" 
                                sx={{ float: "right", backgroundColor: "#fff", textTransform: "none" }} 
                                onClick={() => { setModal8(true); }}
                            >
                                {t('createNewService')}
                            </Button>
                        </Grid>
                        <Grid size={{xs:12, md:8}}>
                            <InputLabel htmlFor="service-name" sx={inputLabelStyles}>{t('serviceName')}</InputLabel>
                            {
                                services !== null ?
                                <Autocomplete
                                    disablePortal
                                    id="service-name"
                                    options={services}
                                    renderOption={(props, option) => {
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
                                    onChange={(_: any, value: any) => { setServiceName(value); }}
                                    fullWidth
                                /> : <Skeleton />
                            }
                        </Grid>
                        <Grid size={{xs:12, md:2}}>
                            <InputLabel htmlFor="price-cs" sx={inputLabelStyles}>{t('price')}</InputLabel>
                            <BootstrapInput id="price-cs" type="number" value={price} onChange={(e: any) => setPrice(e.target.value)} fullWidth />
                        </Grid>
                        <Grid size={{xs:12, md:2}}>
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
                        <Grid>
                            {
                                servicesSelection !== undefined && servicesSelection !== null && servicesSelection.length !== 0 ? 
                                    <Grid container spacing={2}>
                                        {
                                            servicesSelection.map((item: any, index: number) => (
                                                <Grid key={"serviceitem1-"+index} size={{xs:12, md:6}}>
                                                    <ListItem
                                                        sx={{ border: "1px solid #e5e5e5" }}
                                                        secondaryAction={
                                                            <IconButton edge="end" onClick={() => {
                                                                setServicesSelection((prevItems: any) => prevItems.filter((_: any, i: number) => i !== index));
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
