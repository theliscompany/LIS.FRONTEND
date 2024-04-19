import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Alert, Autocomplete, Box, Button, DialogActions, DialogContent, Grid, IconButton, InputLabel, ListItem, ListItemText, NativeSelect, Skeleton, TextField, Typography } from '@mui/material';
import { MuiTelInput } from 'mui-tel-input';
import AutocompleteSearch from '../components/shared/AutocompleteSearch';
import { inputLabelStyles, BootstrapInput, BootstrapDialog, whiteButtonStyles, BootstrapDialogTitle, buttonCloseStyles } from '../utils/misc/styles';
import { enqueueSnackbar, SnackbarProvider } from 'notistack';
import DeleteIcon from '@mui/icons-material/Delete';
import { loginRequest, protectedResources, transportRequest } from '../config/authConfig';
import { useAuthorizedBackendApi } from '../api/api';
import { BackendService } from '../utils/services/fetch';
import { MuiChipsInputChip } from 'mui-chips-input';
import { useAccount, useMsal } from '@azure/msal-react';
import { AuthenticationResult } from '@azure/msal-browser';
import { useTranslation } from 'react-i18next';
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ClientSearch from '../components/shared/ClientSearch';
import RequestListNotes from '../components/editRequestPage/RequestListNotes';
import RequestAddNote from '../components/editRequestPage/RequestAddNote';
import RequestAskInformation from '../components/editRequestPage/RequestAskInformation';
import RequestChangeStatus from '../components/editRequestPage/RequestChangeStatus';
import { arePhoneticallyClose, complexEquality, findClosestSeaPort, parseContact, parseLocation, similar, sortByCloseness } from '../utils/functions';
import NewContact from '../components/editRequestPage/NewContact';
import { containerPackages } from '../utils/constants';
// @ts-ignore
import { JSON as seaPorts } from 'sea-ports';
import GeneratePriceOffer from '../components/editRequestPage/GeneratePriceOffer';
import NewPort from '../components/shared/NewPort';
import NewHaulage from '../components/editRequestPage/NewHaulage';
// @ts-ignore

let packingOptions = ["Unit", "Bundle", "Bag", "Pallet", "Carton", "Lot", "Crate"];

function Request() {
    const [load, setLoad] = useState<boolean>(false);
    const [loadAssignees, setLoadAssignees] = useState<boolean>(true);
    const [requestData, setRequestData] = useState<any>(null);
    const [email, setEmail] = useState<string>("");
    const [status, setStatus] = useState<string | null>(null);
    const [trackingNumber, setTrackingNumber] = useState<string>("");
    const [phone, setPhone] = useState<string>("");
    const [message, setMessage] = useState<string>("");
    const [packingType, setPackingType] = useState<string>("FCL");
    const [clientNumber, setClientNumber] = useState<any>(null);
    const [departure, setDeparture] = useState<any>(null);
    const [arrival, setArrival] = useState<any>(null);
    const [tags, setTags] = useState<MuiChipsInputChip[]>([]);
    const [modal, setModal] = useState<boolean>(false);
    const [modal2, setModal2] = useState<boolean>(false);
    const [modal3, setModal3] = useState<boolean>(false);
    const [modal4, setModal4] = useState<boolean>(false);
    const [modal7, setModal7] = useState<boolean>(false);
    const [modal8, setModal8] = useState<boolean>(false);
    const [modal9, setModal9] = useState<boolean>(false);
    const [modal10, setModal10] = useState<boolean>(false);
    const [modalHaulage, setModalHaulage] = useState<boolean>(false);
    
    const [assignedManager, setAssignedManager] = useState<string>("");
    const [assignees, setAssignees] = useState<any>(null);
    
    const [containerType, setContainerType] = useState<string>("20' Dry");
    const [quantity, setQuantity] = useState<number>(1);
    const [containersSelection, setContainersSelection] = useState<any>([]);
    
    const [unitName, setUnitName] = useState<string>("");
    const [unitHeight, setUnitHeight] = useState<number>(0);
    const [unitLength, setUnitLength] = useState<number>(0);
    const [unitWidth, setUnitWidth] = useState<number>(0);
    const [unitWeight, setUnitWeight] = useState<number>(0);
    const [unitQuantity, setUnitQuantity] = useState<number>(1);
    const [unitsSelection, setUnitsSelection] = useState<any>([]);

    const [packageName, setPackageName] = useState<string>("");
    const [packageHeight, setPackageHeight] = useState<number>(0);
    const [packageLength, setPackageLength] = useState<number>(0);
    const [packageWidth, setPackageWidth] = useState<number>(0);
    const [packageWeight, setPackageWeight] = useState<number>(0);
    const [packageQuantity, setPackageQuantity] = useState<number>(1);
    const [packagesSelection, setPackagesSelection] = useState<any>([]);
    
    const [portDestination, setPortDestination] = useState<any>(null);
    const [portDeparture, setPortDeparture] = useState<any>(null);
    const [loadingCity, setLoadingCity] = useState<any>(null);
    const [products, setProducts] = useState<any>(null);
    const [ports, setPorts] = useState<any>(null);
    const [ports1, setPorts1] = useState<any>(null);
    const [ports2, setPorts2] = useState<any>(null);
    const [containers, setContainers] = useState<any>(null);
    const [tempToken, setTempToken] = useState<string>("");

    let { id } = useParams();
    const navigate = useNavigate();

    const { instance, accounts } = useMsal();
    const account = useAccount(accounts[0] || {});
    const context = useAuthorizedBackendApi();
    const { t } = useTranslation();
    
    function initializeSeaPorts() {
        var auxArray = [];
        for (const [key, value] of Object.entries(seaPorts)) {
            if (value) {
                let result = value as any;
                auxArray.push({
                    name: result.name,
                    city: result.city,
                    country: result.country,
                    province: result.province,
                    coordinates: result.coordinates
                });
            }
        }
        return auxArray;
    }
    
    function addedCoordinatesToPorts(selectedPorts: any) {
        var allMySeaPorts = initializeSeaPorts();
        // console.log("Seaports : ", allMySeaPorts);
        const updatedLisPorts = selectedPorts.map((lisPort: any) => {
            const matchingSeaPort = allMySeaPorts.find((seaPort: any) => 
                (complexEquality(seaPort.name.toUpperCase(), lisPort.portName.toUpperCase())
                || similar(seaPort.name, lisPort.portName) 
                || (arePhoneticallyClose(seaPort.name.toUpperCase(), lisPort.portName.toUpperCase()) && complexEquality(seaPort.country.toUpperCase(), lisPort.country.toUpperCase()))));
            if (matchingSeaPort) {
                return { ...lisPort, name: matchingSeaPort.name, coordinates: matchingSeaPort.coordinates };
            }
            return lisPort;
        });
        
        return updatedLisPorts;
    }
    
    useEffect(() => {
        getContainers();
        getAssignees();
        getPorts();
        getProducts();
        loadRequest(null, null);
    }, [context]);
    
    useEffect(() => {
        if (ports !== null && products !== null && requestData !== null) {
            // console.log("Ports X : ", ports);
            // loadRequest(ports, products);
            setTags(requestData.tags !== null ? products.filter((elm: any) => requestData.tags.includes(elm.productName)) : []);
            const closestDeparturePort = findClosestSeaPort(parseLocation(requestData.departure), ports);
            const closestArrivalPort = findClosestSeaPort(parseLocation(requestData.arrival), ports);
            setPortDeparture(closestDeparturePort);
            setPortDestination(closestArrivalPort);
            setPorts1(sortByCloseness(parseLocation(requestData.departure), ports).slice(0, 50));
            setPorts2(sortByCloseness(parseLocation(requestData.arrival), ports).slice(0, 50));
        }
    }, [ports, products]);

    const getAssignees = async () => {
        if (context && account) {
            const token = await instance.acquireTokenSilent({
                scopes: loginRequest.scopes,
                account: account
            })
            .then((response: AuthenticationResult) => {
                return response.accessToken;
            })
            .catch(() => {
                return instance.acquireTokenPopup({
                    ...loginRequest,
                    account: account
                    }).then((response) => {
                        return response.accessToken;
                    });
                }
            );
            setTempToken(token);
            
            try {
                setLoadAssignees(true);
                const response = await (context as BackendService<any>).getWithToken(protectedResources.apiLisQuotes.endPoint+"/Assignee", token);
                if (response !== null && response.code !== undefined) {
                    if (response.code === 200) {
                        setAssignees(response.data);
                        setLoadAssignees(false);
                    }
                    else {
                        setLoadAssignees(false);
                    }
                }
                else {
                    setLoadAssignees(false);
                }   
            }
            catch (err: any) {
                setLoadAssignees(false);
                console.log(err);
            }
        }
    }
    
    const loadRequest = async (allPorts: any, allProducts: any) => {
        if (context && account) {
            const token = await instance.acquireTokenSilent({
                scopes: loginRequest.scopes,
                account: account
            })
            .then((response: AuthenticationResult) => {
                return response.accessToken;
            })
            .catch(() => {
                return instance.acquireTokenPopup({
                    ...loginRequest,
                    account: account
                    }).then((response) => {
                        return response.accessToken;
                    });
                }
            );

            // setLoad(true);
            try {
                const response = await (context as BackendService<any>).getWithToken(protectedResources.apiLisQuotes.endPoint+"/Request/"+id, token);
                if (response !== null && response.code !== undefined) {
                    if (response.code === 200) {
                        setRequestData(response.data);
                        setEmail(response.data.email);
                        setPhone(response.data.whatsapp);
                        setDeparture(parseLocation(response.data.departure));
                        setArrival(parseLocation(response.data.arrival));
                        setLoadingCity(parseLocation(response.data.departure));
                        setStatus(response.data.status);
                        setPackingType(response.data.packingType !== null ? response.data.packingType : "FCL");
                        setClientNumber(response.data.clientNumber !== null && response.data.clientNumber !== "" ? parseContact(response.data.clientNumber) : "");
                        setContainersSelection(response.data.containers.map((elm: any) => { return {
                            id: elm.id,
                            container: elm.containers, 
                            quantity: elm.quantity 
                        } }) || []);
                        setUnitsSelection(response.data.units.map((elm: any) => { return {
                            name: elm.name,
                            weight: elm.weight,
                            dimensions: elm.dimension,
                            quantity: elm.quantity
                        }}) || []);
                        setQuantity(response.data.quantity);
                        setMessage(response.data.detail);
                        // setTags(response.data.tags !== null ? allProducts.filter((elm: any) => response.data.tags.includes(elm.productName)) : []);
                        setAssignedManager(response.data.assigneeId !== null && response.data.assigneeId !== "" ? response.data.assigneeId : "");
                        setTrackingNumber(response.data.trackingNumber);
                        
                        // const closestDeparturePort = findClosestSeaPort(parseLocation(response.data.departure), allPorts);
                        // const closestArrivalPort = findClosestSeaPort(parseLocation(response.data.arrival), allPorts);
                        // setPortDeparture(closestDeparturePort);
                        // setPortDestination(closestArrivalPort);
                        // setPorts1(sortByCloseness(parseLocation(response.data.departure), allPorts).slice(0, 50));
                        // setPorts2(sortByCloseness(parseLocation(response.data.arrival), allPorts).slice(0, 50));
                        
                        setLoad(false);
                    }
                    else {
                        setLoad(false);
                    }
                }
                else {
                    setLoad(false);
                }
            }
            catch (e: any) {
                console.log(e);
                setLoad(false);
            }
        }
    }
    
    const assignManager = async () => {
        if (assignedManager !== null && assignedManager !== undefined && assignedManager !== "") {
            if (context && account) {
                const response = await (context as BackendService<any>).putWithToken(protectedResources.apiLisQuotes.endPoint+"/Assignee/"+id+"/"+assignedManager, [], tempToken);
                if (response !== null) {
                    enqueueSnackbar(t('managerAssignedRequest'), { variant: "success", anchorOrigin: { horizontal: "right", vertical: "top"} });
                }
                else {
                    enqueueSnackbar(t('errorHappened'), { variant: "error", anchorOrigin: { horizontal: "right", vertical: "top"} });
                }
            }
        }
        else {
            enqueueSnackbar(t('selectManagerFirst'), { variant: "error", anchorOrigin: { horizontal: "right", vertical: "top"} });
        }
    }

    const removeManager = async () => {
        if (context && account) {
            const response = await (context as BackendService<any>).putWithToken(protectedResources.apiLisQuotes.endPoint+"/Assignee/unassign/"+id, [], tempToken);
            if (response !== null) {
                enqueueSnackbar(t('managerRemovedRequest'), { variant: "success", anchorOrigin: { horizontal: "right", vertical: "top"} });
                setAssignedManager("");
            }
            else {
                enqueueSnackbar(t('errorHappened'), { variant: "error", anchorOrigin: { horizontal: "right", vertical: "top"} });
            }
        }
    }
    
    const editRequest = async () => {
        var auxUnits = [];
        if (packingType === "Breakbulk/LCL") {
            auxUnits = packagesSelection;
        }
        else if (packingType === "Unit RoRo") {
            auxUnits = unitsSelection;
        }
        
        if (context && account) {
            var postcode1 = departure.postalCode !== null && departure.postalCode !== undefined ? departure.postalCode : "";
            var postcode2 = arrival.postalCode !== null && arrival.postalCode !== undefined ? arrival.postalCode : "";

            const body: any = {
                id: Number(id),
                email: email,
                status: status,
                whatsapp: phone,
                departure: departure !== null && departure !== undefined ? [departure.city.toUpperCase(),departure.country,departure.latitude,departure.longitude,postcode1].filter((val: any) => { return val !== "" }).join(', ') : "",
                arrival: arrival !== null && arrival !== undefined ? [arrival.city.toUpperCase(),arrival.country,arrival.latitude,arrival.longitude,postcode2].filter((val: any) => { return val !== "" }).join(', ') : "",
                cargoType: 0,
                packingType: packingType,
                containers: containersSelection.map((elm: any, i: number) => { return { 
                    id: containers.find((item: any) => item.packageName === elm.container).packageId, 
                    containers: elm.container, 
                    quantity: elm.quantity, 
                } }),
                units: auxUnits.map((elm: any, i: number) => { return { 
                    id: i, 
                    name: elm.name, 
                    weight: elm.weight, 
                    dimension: elm.dimensions, 
                    quantity: elm.quantity, 
                } }),
                quantity: quantity,
                detail: message,
                clientNumber: clientNumber !== null ? String(clientNumber.contactNumber)+", "+clientNumber.contactName : null,
                tags: tags.length !== 0 ? tags.map((elm: any) => elm.productName).join(',') : null,
                assigneeId: Number(assignedManager)
            };

            const data = await (context as BackendService<any>).put(protectedResources.apiLisQuotes.endPoint+"/Request/"+id, body);
            if (data?.status === 200) {
                enqueueSnackbar(t('requestEditedSuccess'), { variant: "success", anchorOrigin: { horizontal: "right", vertical: "top"} });
            }
            else {
                enqueueSnackbar(t('errorHappened'), { variant: "error", anchorOrigin: { horizontal: "right", vertical: "top"} });
            }
        }
    }

    const getContainers = async () => {
        // if (context && account) {
        //     const token = await instance.acquireTokenSilent({
        //         scopes: transportRequest.scopes,
        //         account: account
        //     })
        //     .then((response: AuthenticationResult) => {
        //         return response.accessToken;
        //     })
        //     .catch(() => {
        //         return instance.acquireTokenPopup({
        //             ...transportRequest,
        //             account: account
        //             }).then((response) => {
        //                 return response.accessToken;
        //             });
        //         }
        //     );
            
        //     const response = await (context as BackendService<any>).getWithToken(protectedResources.apiLisTransport.endPoint+"/Package/Containers", token);
        //     if (response !== null && response !== undefined) {
        //         setContainers(response);
        //     }  
        // }
        setContainers(containerPackages);
    }
    
    const getPorts = async () => {
        if (context && account) {
            const token = await instance.acquireTokenSilent({
                scopes: transportRequest.scopes,
                account: account
            })
            .then((response: AuthenticationResult) => {
                return response.accessToken;
            })
            .catch(() => {
                return instance.acquireTokenPopup({
                    ...transportRequest,
                    account: account
                    }).then((response) => {
                        return response.accessToken;
                    });
                }
            );
            
            const response = await (context as BackendService<any>).getWithToken(protectedResources.apiLisTransport.endPoint+"/Port/Ports?pageSize=2000", token);
            if (response !== null && response !== undefined) {
                console.log(response);
                var addedCoordinatesPorts = addedCoordinatesToPorts(response);
                setPorts(addedCoordinatesPorts);

                // Here i can get the products
                // getProducts(addedCoordinatesPorts);
            }  
        }
    }
    
    const getProducts = async () => {
        if (context && account) {
            const token = await instance.acquireTokenSilent({
                scopes: transportRequest.scopes,
                account: account
            })
            .then((response: AuthenticationResult) => {
                return response.accessToken;
            })
            .catch(() => {
                return instance.acquireTokenPopup({
                    ...transportRequest,
                    account: account
                    }).then((response) => {
                        return response.accessToken;
                    });
                }
            );
            
            const response = await (context as BackendService<any>).getWithToken(protectedResources.apiLisTransport.endPoint+"/Product?pageSize=500", token);
            if (response !== null && response !== undefined) {
                setProducts(response);

                // Here i can load the request information
                // loadRequest(allPorts, response);
            }  
        }
    }

    function getClosestDeparture(value: any) {
        if (value !== null && value !== undefined) {
            const closest = findClosestSeaPort(value, ports);
            setPortDeparture(closest);
            setLoadingCity(value);
            setPorts1(sortByCloseness(value, ports).slice(0, 50));
        }
    }

    function getClosestArrival(value: any) {
        if (value !== null && value !== undefined) {
            const closest = findClosestSeaPort(value, ports);
            setPortDestination(closest);
            setPorts2(sortByCloseness(value, ports).slice(0, 50));
        }
    }

    return (
        <div style={{ background: "#fff", borderTopLeftRadius: 20, borderTopRightRadius: 20 }}>
            <SnackbarProvider />
            <Box py={2.5}>
                <Typography variant="h5" sx={{mt: {xs: 4, md: 1.5, lg: 1.5 }}} mx={5}><b>{t('manageRequestQuote')} {id}</b></Typography>
                <Box>
                {
                    true ? // !load
                    true ? // clientNumber !== null
                    <Grid container spacing={2} mt={1} px={5}>
                        <Grid item xs={6}>
                            <Typography variant="body2" color="dodgerblue" sx={{ fontWeight: "bold" }}>
                                <span style={{ color: 'red' }}>{t('quoteNumber')} : </span> N° {trackingNumber}
                            </Typography>
                        </Grid>
                        <Grid item xs={6}>
                            {/* <Button 
                                variant="contained" color="inherit" 
                                sx={{ float: "right", backgroundColor: "#fff", textTransform: "none", ml: 2 }} 
                                onClick={() => { setModalHaulage(true); }}
                            >
                                {t('newHaulage')}
                            </Button> */}
                            <Button 
                                variant="contained" color="inherit" 
                                sx={{ float: "right", backgroundColor: "#fff", textTransform: "none", ml: 2 }} 
                                onClick={() => { setModal9(true); }}
                            >
                                {t('createNewPort')}
                            </Button>
                            <Button 
                                variant="contained" color="inherit" 
                                sx={{ float: "right", backgroundColor: "#fff", textTransform: "none" }} 
                                onClick={() => { setModal7(true); }}
                            >
                                {t('createNewContact')}
                            </Button>
                        </Grid>

                        <Grid item xs={12}>
                            <Alert 
                                severity="info" 
                                sx={{ display: { xs: "block", md: "flex" }, alignItems: "center", justifyContent: "left" }}
                                action={<Button variant="contained" color="inherit" sx={{ background: "#fff", color: "#333", float: "right", textTransform: "none", position: "relative", bottom: "2px" }} onClick={() => { setModal(true); }}>{t('askMoreInformation')}</Button>}
                            >
                                <Typography variant="subtitle1" display="inline">{t('doYouThinkInformation')}</Typography>
                            </Alert>
                        </Grid>
                        
                        <Grid item xs={12}>
                            <Button variant="contained" color="primary" sx={{ mt: 2, mr: 2, textTransform: "none" }} onClick={editRequest} >{t('editRequest')}</Button>
                            <Button variant="contained" color="inherit" sx={whiteButtonStyles} onClick={() => { setModal2(true); }} >{t('changeStatus')}</Button>
                            <Button variant="contained" color="inherit" sx={whiteButtonStyles} style={{ float: "right" }} onClick={() => { setModal3(true); }} >{t('addCommentNote')}</Button>
                            <Button variant="contained" color="inherit" sx={whiteButtonStyles} style={{ float: "right", marginRight: "10px" }} onClick={() => { setModal4(true); /*getNotes(id);*/ }} >{t('listNotes')}</Button>
                        </Grid>
                        
                        <Grid item xs={12}>
                            <Accordion defaultExpanded sx={{ backgroundColor: "#fbfbfb" }}>
                                <AccordionSummary
                                    expandIcon={<ExpandMoreIcon />}
                                    aria-controls="panel1b-content"
                                    id="panel1b-header"
                                >
                                    <Typography variant="h6" sx={{ mx: 0 }}><b>Customer request</b></Typography>
                                </AccordionSummary>
                                <AccordionDetails>
                                    <Grid container spacing={2} px={2}>
                                        <Grid item xs={12} md={6}>
                                            <InputLabel htmlFor="client-number" sx={inputLabelStyles} style={{ marginTop: "8px" }}>{t('clientNumber')}</InputLabel>
                                            <ClientSearch 
                                                id="client-number"
                                                name="clientNumber" 
                                                value={clientNumber} 
                                                onChange={setClientNumber}
                                                disabled 
                                                callBack={(value: any) => {
                                                    setClientNumber(value);
                                                    if (clientNumber !== null) {
                                                        setPhone(clientNumber.phone !== null ? clientNumber.phone : "");
                                                        // alert("check");
                                                    }
                                                }} 
                                                fullWidth 
                                            />
                                        </Grid>
                                        <Grid item xs={12} md={6} mt={1}>
                                            <InputLabel htmlFor="departure" sx={inputLabelStyles}>{t('departure')}</InputLabel>
                                            <AutocompleteSearch id="departure" value={departure} onChange={setDeparture} callBack={getClosestDeparture} fullWidth />
                                        </Grid>
                                        <Grid item xs={12} md={6}>
                                            <InputLabel htmlFor="whatsapp-phone-number" sx={inputLabelStyles} style={{ marginTop: "8px" }}>{t('whatsappNumber')}</InputLabel>
                                            <MuiTelInput 
                                                id="whatsapp-phone-number" 
                                                value={phone} onChange={setPhone} 
                                                defaultCountry="CM" preferredCountries={["CM", "BE", "KE"]} 
                                                fullWidth sx={{ mt: 1 }} disabled 
                                            />
                                        </Grid>
                                        <Grid item xs={12} md={6} mt={1}>
                                            <InputLabel htmlFor="arrival" sx={inputLabelStyles}>{t('arrival')}</InputLabel>
                                            <AutocompleteSearch id="arrival" value={arrival} onChange={setArrival} callBack={getClosestArrival} fullWidth />
                                        </Grid>
                                        <Grid item xs={12} md={6}>
                                            <InputLabel htmlFor="request-email" sx={inputLabelStyles}>{t('emailAddress')}</InputLabel>
                                            <BootstrapInput id="request-email" type="email" value={email} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)} fullWidth disabled />
                                        </Grid>
                                        <Grid item xs={12} md={6}>
                                            <InputLabel htmlFor="tags" sx={inputLabelStyles}>{t('specifics')}</InputLabel>
                                            {
                                                products !== null ?
                                                <Autocomplete
                                                    multiple    
                                                    disablePortal
                                                    id="tags"
                                                    placeholder="Machinery, Household goods, etc"
                                                    options={products}
                                                    getOptionLabel={(option: any) => { 
                                                        if (option !== null && option !== undefined) {
                                                            return option.productName !== undefined ? option.productName : option;
                                                        }
                                                        return ""; 
                                                    }}
                                                    value={tags}
                                                    sx={{ mt: 1 }}
                                                    renderInput={(params: any) => <TextField {...params} sx={{ textTransform: "lowercase" }} />}
                                                    onChange={(e: any, value: any) => { setTags(value); }}
                                                    fullWidth
                                                /> : <Skeleton />
                                            }
                                        </Grid>
                                        
                                        <Grid item xs={9} container direction="column" alignItems="flex-start">
                                            <InputLabel htmlFor="listContainers" sx={inputLabelStyles} style={{ marginBottom: "8px", position: "relative", top: "12px" }}>{t('listContainers')}</InputLabel>
                                        </Grid>
                                        <Grid item xs={3}>
                                            <Button variant="contained" color="inherit" sx={whiteButtonStyles} style={{ float: "right" }} onClick={() => setModal10(true)} >{t('addContainer')}</Button>
                                        </Grid>
                                        <Grid item xs={12}>
                                            {
                                                packingType === "FCL" ?
                                                <>
                                                {
                                                    containersSelection !== undefined && containersSelection !== null && containersSelection.length !== 0 && containers !== null ? 
                                                    <Grid container spacing={2}>
                                                    {
                                                        containersSelection.map((item: any, index: number) => (
                                                            <Grid key={"listitem1-"+index} item xs={12} md={4}>
                                                                <ListItem
                                                                    sx={{ border: "1px solid #e5e5e5" }}
                                                                    secondaryAction={
                                                                        <IconButton edge="end" onClick={() => {
                                                                            setContainersSelection((prevItems: any) => prevItems.filter((item: any, i: number) => i !== index));
                                                                        }}>
                                                                            <DeleteIcon />
                                                                        </IconButton>
                                                                    }
                                                                >
                                                                    <ListItemText primary={
                                                                        t('container')+" : "+item.container+" | "+t('quantity')+" : "+item.quantity
                                                                    } />
                                                                </ListItem>
                                                            </Grid>
                                                        ))
                                                    }
                                                    </Grid> : null  
                                                }
                                                </> : null
                                            }
                                            {
                                                packingType === "Breakbulk/LCL" ?
                                                <>
                                                {
                                                    packagesSelection !== undefined && packagesSelection !== null && packagesSelection.length !== 0 ? 
                                                    <Grid container spacing={2}>
                                                        {
                                                            packagesSelection.map((item: any, index: number) => (
                                                                <Grid key={"packageitem1-"+index} item xs={12} md={6}>
                                                                    <ListItem
                                                                        sx={{ border: "1px solid #e5e5e5" }}
                                                                        secondaryAction={
                                                                            <IconButton edge="end" onClick={() => {
                                                                                setPackagesSelection((prevItems: any) => prevItems.filter((item: any, i: number) => i !== index));
                                                                            }}>
                                                                                <DeleteIcon />
                                                                            </IconButton>
                                                                        }
                                                                    >
                                                                        <ListItemText primary={
                                                                            t('name')+" : "+item.name+" | "+t('quantity')+" : "+item.quantity+" | "+t('dimensions')+" : "+item.dimensions+" | Cubage ("+item.volume+" \u33A5) | "+t('weight')+" : "+item.weight+" Kg"
                                                                        } />
                                                                    </ListItem>
                                                                </Grid>
                                                            ))
                                                        }
                                                    </Grid> : null  
                                                }
                                                </> : null
                                            }
                                            {
                                                packingType === "Unit RoRo" ?
                                                <>
                                                {
                                                    unitsSelection !== undefined && unitsSelection !== null && unitsSelection.length !== 0 ? 
                                                    <Grid container spacing={2}>
                                                        {
                                                            unitsSelection.map((item: any, index: number) => (
                                                                <Grid key={"unititem1-"+index} item xs={12} md={6}>
                                                                    <ListItem
                                                                        sx={{ border: "1px solid #e5e5e5" }}
                                                                        secondaryAction={
                                                                            <IconButton edge="end" onClick={() => {
                                                                                setUnitsSelection((prevItems: any) => prevItems.filter((item: any, i: number) => i !== index));
                                                                            }}>
                                                                                <DeleteIcon />
                                                                            </IconButton>
                                                                        }
                                                                    >
                                                                        <ListItemText primary={
                                                                            t('name')+" : "+item.name+" | "+t('quantity')+" : "+item.quantity+" | "+t('dimensions')+" : "+item.dimensions+" | Cubage ("+item.volume+" \u33A5) | "+t('weight')+" : "+item.weight+" Kg"
                                                                        } />
                                                                    </ListItem>
                                                                </Grid>
                                                            ))
                                                        }
                                                    </Grid> : null  
                                                }
                                                </> : null
                                            }
                                        </Grid>                                
                                        
                                        <Grid item xs={12} md={6} mt={.5} sx={{ display: { xs: 'none', md: 'block' } }}>
                                            <InputLabel htmlFor="request-message" sx={inputLabelStyles}>{t('details')}</InputLabel>
                                            <BootstrapInput id="request-message" type="text" multiline rows={3.5} value={message} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setMessage(e.target.value)} fullWidth />
                                        </Grid>
                                        <Grid item xs={12} md={6} mt={1}>
                                            <InputLabel htmlFor="assigned-manager" sx={inputLabelStyles}>{t('assignedManager')}</InputLabel>
                                            {
                                                !loadAssignees ? 
                                                <>
                                                    <NativeSelect
                                                        id="assigned-manager"
                                                        value={assignedManager}
                                                        onChange={(e: any) => { setAssignedManager(e.target.value); }}
                                                        input={<BootstrapInput />}
                                                        fullWidth
                                                    >
                                                        <option value="">{t('noAgentAssigned')}</option>
                                                        {
                                                            assignees.map((row: any, i: number) => (
                                                                <option key={"assigneeId-"+i} value={String(row.id)}>{row.name}</option>
                                                            ))
                                                        }
                                                    </NativeSelect>
                                                    <Button variant="contained" color="inherit" sx={whiteButtonStyles} style={{ marginRight: "10px" }} onClick={assignManager} >{t('updateManager')}</Button>
                                                    <Button variant="contained" color="inherit" sx={whiteButtonStyles} onClick={removeManager} >{t('removeManager')}</Button>
                                                </> : <Skeleton sx={{ mt: 3 }} />   
                                            }
                                        </Grid>
                                    </Grid>                                
                                </AccordionDetails>
                            </Accordion>
                        </Grid>
                        
                        {/* Generate Price Offer COMPONENT */}
                        {
                            ports1 !== null && ports2 !== null ? 
                            <GeneratePriceOffer
                                context={context}
                                account={account}
                                instance={instance}
                                id={id}
                                email={email}
                                tags={tags}
                                clientNumber={clientNumber}
                                departure={departure}
                                setDeparture={setDeparture}
                                loadingCity={loadingCity}
                                setLoadingCity={setLoadingCity}
                                portDestination={portDestination}
                                setPortDestination={setPortDestination}
                                // portDeparture={portDeparture}
                                // setPortDeparture={setPortDeparture}
                                containersSelection={containersSelection}
                                ports={ports}
                                products={products}
                                ports1={ports1}
                                ports2={ports2}
                                containers={containers}
                            />
                            : <Skeleton />
                        }

                        <Grid item xs={12}>
                            <Button variant="contained" color="inherit" sx={whiteButtonStyles} onClick={() => { navigate("/admin/requests"); }} >Save and close</Button>
                        </Grid>
                    </Grid> : null
                    : <Skeleton sx={{ mx: 5, mt: 3 }} />
                }
                </Box>
            </Box>
            
            {/* Ask for information */}
            <BootstrapDialog
                onClose={() => setModal(false)}
                aria-labelledby="custom-dialog-title"
                open={modal}
                maxWidth="md"
                fullWidth
            >
                <RequestAskInformation id={id} userId={null} email={email} closeModal={() => setModal(false)} />
            </BootstrapDialog>
            
            {/* Change request status */}
            <BootstrapDialog
                onClose={() => setModal2(false)}
                aria-labelledby="custom-dialog-title2"
                open={modal2}
                maxWidth="md"
                fullWidth
            >
                <RequestChangeStatus id={id} closeModal={() => setModal2(false)} />
            </BootstrapDialog>
            
            {/* Add a comment/note */}
            <BootstrapDialog
                onClose={() => setModal3(false)}
                aria-labelledby="custom-dialog-title3"
                open={modal3}
                maxWidth="md"
                fullWidth
            >
                <RequestAddNote id={id} userId={null} closeModal={() => setModal3(false)} />
            </BootstrapDialog>

            {/* List of notes */}
            <BootstrapDialog
                onClose={() => setModal4(false)}
                aria-labelledby="custom-dialog-title4"
                open={modal4}
                maxWidth="lg"
                fullWidth
            >
                <RequestListNotes id={id} closeModal={() => setModal4(false)} />
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
                    categories={[""]}
                    closeModal={() => setModal7(false)}
                />
            </BootstrapDialog>

            {/* General miscs selection */}
            <BootstrapDialog
                onClose={() => setModal8(false)}
                aria-labelledby="custom-dialog-title8"
                open={modal8}
                maxWidth="lg"
                fullWidth
            >
                <BootstrapDialogTitle id="custom-dialog-title" onClose={() => setModal8(false)}>
                    <b>Add general miscs</b>
                </BootstrapDialogTitle>
                <DialogContent dividers>
                    <Typography variant="subtitle1" gutterBottom px={2}>
                        You can select some general miscellaneous services.
                    </Typography>
                    
                </DialogContent>
                <DialogActions>
                    <Button 
                        variant="contained" 
                        color="primary" className="mr-3" 
                        onClick={() => {
                            enqueueSnackbar(t('messageOkGeneralMiscs'), { variant: "success", anchorOrigin: { horizontal: "right", vertical: "top"} }); 
                            setModal8(false); 
                        }} 
                        sx={{ textTransform: "none" }}
                    >
                        {t('validate')}
                    </Button>
                    <Button variant="contained" onClick={() => setModal8(false)} sx={buttonCloseStyles}>{t('close')}</Button>
                </DialogActions>
            </BootstrapDialog>

            {/* Add a new haulage */}
            {/* <BootstrapDialog
                onClose={() => setModalHaulage(false)}
                aria-labelledby="custom-dialog-titleHaulage"
                open={modalHaulage}
                maxWidth="lg"
                fullWidth
            >
                <NewHaulage 
                    ports={ports}
                    containers={containers}
                    closeModal={() => setModalHaulage(false)}
                />
            </BootstrapDialog> */}

            {/* Create new port */}
            <BootstrapDialog
                onClose={() => setModal9(false)}
                aria-labelledby="custom-dialog-title9"
                open={modal9}
                maxWidth="md"
                fullWidth
            >
                <NewPort 
                    closeModal={() => setModal9(false)}
                    callBack={getPorts}
                />
            </BootstrapDialog>

            {/* New container type */}
            <BootstrapDialog
                onClose={() => setModal10(false)}
                aria-labelledby="custom-dialog-title10"
                open={modal10}
                maxWidth="lg"
                fullWidth
            >
                <BootstrapDialogTitle id="custom-dialog-title" onClose={() => setModal10(false)}>
                    <b>Add a container</b>
                </BootstrapDialogTitle>
                <DialogContent dividers>
                    <Grid container spacing={2}>
                        <Grid item xs={12} md={2} mt={1}>
                            <InputLabel htmlFor="packing-type" sx={inputLabelStyles}>{t('packingType')}</InputLabel>
                            <NativeSelect
                                id="packing-type"
                                value={packingType}
                                onChange={(e: any) => { setPackingType(e.target.value); }}
                                input={<BootstrapInput />}
                                fullWidth
                            >
                                <option value="FCL">{t('fcl')}</option>
                                <option value="Breakbulk/LCL">{t('breakbulk')}</option>
                                <option value="Unit RoRo">{t('roro')}</option>
                            </NativeSelect>
                        </Grid>

                        {
                            packingType === "FCL" ?
                            <>
                            <Grid item xs={12} md={3} mt={1}>
                                <InputLabel htmlFor="container-type" sx={inputLabelStyles}>{t('containerType')}</InputLabel>
                                {
                                    containers !== null ?
                                    <NativeSelect
                                        id="container-type"
                                        value={containerType}
                                        onChange={(e: any) => { setContainerType(e.target.value) }}
                                        input={<BootstrapInput />}
                                        fullWidth
                                    >
                                        <option key={"elm1-x"} value="">{t('notDefined')}</option>
                                        {containers.map((elm: any, i: number) => (
                                            <option key={"elm1-"+i} value={elm.packageName}>{elm.packageName}</option>
                                        ))}
                                    </NativeSelect>
                                    : <Skeleton />
                                }
                            </Grid>
                            <Grid item xs={12} md={3} mt={1}>
                                <InputLabel htmlFor="quantity" sx={inputLabelStyles}>{t('quantity')}</InputLabel>
                                <BootstrapInput id="quantity" type="number" inputProps={{ min: 1, max: 100 }} value={quantity} onChange={(e: any) => {setQuantity(e.target.value)}} fullWidth />
                            </Grid>
                            <Grid item xs={12} md={4} mt={1}>
                                <Button 
                                    variant="contained" color="inherit" fullWidth sx={whiteButtonStyles} 
                                    style={{ marginTop: "30px", height: "42px", float: "right" }} 
                                    onClick={() => {
                                        if (containerType !== "" && quantity > 0) {
                                            setContainersSelection((prevItems: any) => [...prevItems, { container: containerType, quantity: quantity, id: containers.find((item: any) => item.packageName === containerType).packageId }]);
                                            setContainerType(""); setQuantity(1);
                                            setModal10(false);
                                        } 
                                        else {
                                            enqueueSnackbar("You need to select a container type and a good value for quantity.", { variant: "error", anchorOrigin: { horizontal: "right", vertical: "top"} });
                                        }
                                    }} 
                                >
                                    {t('addContainer')}
                                </Button>
                            </Grid>
                            </> : null
                        }
                        {
                            packingType === "Breakbulk/LCL" ?
                            <>
                            <Grid item xs={12} md={3} mt={1}>
                                <InputLabel htmlFor="package-name" sx={inputLabelStyles}>{t('packageName')}</InputLabel>
                                <NativeSelect
                                    id="package-name"
                                    value={packageName}
                                    onChange={(e: any) => { setPackageName(e.target.value) }}
                                    input={<BootstrapInput />}
                                    fullWidth
                                >
                                    <option key={"option1-x"} value="">{t('notDefined')}</option>
                                    {packingOptions.map((elm: any, i: number) => (
                                        <option key={"elm11-"+i} value={elm}>{elm}</option>
                                    ))}
                                </NativeSelect>
                            </Grid>
                            <Grid item xs={12} md={1} mt={1}>
                                <InputLabel htmlFor="package-quantity" sx={inputLabelStyles}>{t('quantity')}</InputLabel>
                                <BootstrapInput id="package-quantity" type="number" inputProps={{ min: 1, max: 100 }} value={packageQuantity} onChange={(e: any) => {setPackageQuantity(e.target.value)}} fullWidth />
                            </Grid>
                            <Grid item xs={12} md={1} mt={1}>
                                <InputLabel htmlFor="package-length" sx={inputLabelStyles}>{t('length')}(cm)</InputLabel>
                                <BootstrapInput id="package-length" type="number" value={packageLength} onChange={(e: any) => {setPackageLength(e.target.value)}} fullWidth />
                            </Grid>
                            <Grid item xs={12} md={1} mt={1}>
                                <InputLabel htmlFor="package-width" sx={inputLabelStyles}>{t('width')}(cm)</InputLabel>
                                <BootstrapInput id="package-width" type="number" value={packageWidth} onChange={(e: any) => {setPackageWidth(e.target.value)}} fullWidth />
                            </Grid>
                            <Grid item xs={12} md={1} mt={1}>
                                <InputLabel htmlFor="package-height" sx={inputLabelStyles}>{t('height')}(cm)</InputLabel>
                                <BootstrapInput id="package-height" type="number" value={packageHeight} onChange={(e: any) => {setPackageHeight(e.target.value)}} fullWidth />
                            </Grid>
                            <Grid item xs={12} md={2} mt={1}>
                                <InputLabel htmlFor="package-weight" sx={inputLabelStyles}>{t('weight')} (Kg)</InputLabel>
                                <BootstrapInput id="package-weight" type="number" inputProps={{ min: 0, max: 100 }} value={packageWeight} onChange={(e: any) => {setPackageWeight(e.target.value)}} fullWidth />
                            </Grid>
                            <Grid item xs={12} md={1} mt={1}>
                                <Button
                                    variant="contained" color="inherit" fullWidth sx={whiteButtonStyles} 
                                    style={{ marginTop: "30px", height: "42px", float: "right" }} 
                                    onClick={() => {
                                        if (packageName !== "" && packageQuantity > 0 && packageWeight > 0) {
                                            setPackagesSelection((prevItems: any) => [...prevItems, { 
                                                name: packageName, quantity: packageQuantity, dimensions: packageLength+"x"+packageWidth+"x"+packageHeight, weight: packageWeight, volume: packageLength*packageWidth*packageHeight
                                            }]);
                                            setPackageName(""); setPackageQuantity(1); setPackageLength(0); setPackageWidth(0); setPackageHeight(0); setPackageWeight(0);
                                        } 
                                        else {
                                            enqueueSnackbar(t('fieldNeedTobeFilled'), { variant: "error", anchorOrigin: { horizontal: "right", vertical: "top"} });
                                        }
                                    }} 
                                >
                                    {t('add')}
                                </Button>
                            </Grid>
                            </> : null
                        }
                        {
                            packingType === "Unit RoRo" ?
                            <>
                            <Grid item xs={12} md={3} mt={1}>
                                <InputLabel htmlFor="unit-name" sx={inputLabelStyles}>{t('unitName')}</InputLabel>
                                <NativeSelect
                                    id="unit-name"
                                    value={unitName}
                                    onChange={(e: any) => { setUnitName(e.target.value) }}
                                    input={<BootstrapInput />}
                                    fullWidth
                                >
                                    <option key={"option2-x"} value="">{t('notDefined')}</option>
                                    {packingOptions.map((elm: any, i: number) => (
                                        <option key={"elm22-"+i} value={elm}>{elm}</option>
                                    ))}
                                </NativeSelect>
                            </Grid>
                            <Grid item xs={12} md={1} mt={1}>
                                <InputLabel htmlFor="unit-quantity" sx={inputLabelStyles}>{t('quantity')}</InputLabel>
                                <BootstrapInput id="unit-quantity" type="number" inputProps={{ min: 1, max: 100 }} value={unitQuantity} onChange={(e: any) => {setUnitQuantity(e.target.value)}} fullWidth />
                            </Grid>
                            <Grid item xs={12} md={1} mt={1}>
                                <InputLabel htmlFor="unit-length" sx={inputLabelStyles}>{t('length')}(cm)</InputLabel>
                                <BootstrapInput id="unit-length" type="number" value={unitLength} onChange={(e: any) => {setUnitLength(e.target.value)}} fullWidth />
                            </Grid>
                            <Grid item xs={12} md={1} mt={1}>
                                <InputLabel htmlFor="unit-width" sx={inputLabelStyles}>{t('width')}(cm)</InputLabel>
                                <BootstrapInput id="unit-width" type="number" value={unitWidth} onChange={(e: any) => {setUnitWidth(e.target.value)}} fullWidth />
                            </Grid>
                            <Grid item xs={12} md={1} mt={1}>
                                <InputLabel htmlFor="unit-height" sx={inputLabelStyles}>{t('height')}(cm)</InputLabel>
                                <BootstrapInput id="unit-height" type="number" value={unitHeight} onChange={(e: any) => {setUnitHeight(e.target.value)}} fullWidth />
                            </Grid>
                            <Grid item xs={12} md={2} mt={1}>
                                <InputLabel htmlFor="unit-weight" sx={inputLabelStyles}>{t('weight')} (Kg)</InputLabel>
                                <BootstrapInput id="unit-weight" type="number" inputProps={{ min: 0, max: 100 }} value={unitWeight} onChange={(e: any) => {setUnitWeight(e.target.value)}} fullWidth />
                            </Grid>
                            <Grid item xs={12} md={1} mt={1}>
                                <Button
                                    variant="contained" color="inherit" fullWidth sx={whiteButtonStyles} 
                                    style={{ marginTop: "30px", height: "42px", float: "right" }} 
                                    onClick={() => {
                                        if (unitName !== "" && unitQuantity > 0 && unitWeight > 0) {
                                            setUnitsSelection((prevItems: any) => [...prevItems, { 
                                                name: unitName, quantity: unitQuantity, dimensions: unitLength+"x"+unitWidth+"x"+unitHeight, weight: unitWeight, volume: unitLength*unitWidth*unitHeight
                                            }]);
                                            setUnitName(""); setUnitQuantity(1); setUnitLength(0); setUnitWidth(0); setUnitHeight(0); setUnitWeight(0);
                                        } 
                                        else {
                                            enqueueSnackbar(t('fieldNeedTobeFilled'), { variant: "error", anchorOrigin: { horizontal: "right", vertical: "top"} });
                                        }
                                    }} 
                                >
                                    {t('add')}
                                </Button>
                            </Grid>
                            </> : null
                        }
                    </Grid>
                </DialogContent>
                <DialogActions>
                    <Button variant="contained" onClick={() => setModal10(false)} sx={buttonCloseStyles}>{t('close')}</Button>
                </DialogActions>
            </BootstrapDialog>
        </div>
    );
}

export default Request;
