import { Alert, Autocomplete, Box, Button, Grid, InputLabel, NativeSelect, Skeleton, TextField, Typography, ListItem, ListItemText, IconButton } from '@mui/material';
import { MuiTelInput } from 'mui-tel-input';
import React, { useEffect, useState } from 'react';
import '../../App.css';
import DeleteIcon from '@mui/icons-material/Delete';
import { inputLabelStyles, BootstrapInput, whiteButtonStyles } from '../../misc/styles';
import { enqueueSnackbar, SnackbarProvider } from 'notistack';
import { protectedResources, transportRequest } from '../../authConfig';
import { useAuthorizedBackendApi } from '../../api/api';
import { BackendService } from '../../services/fetch';
// import { MailData } from '../../models/models';
import { useAccount, useMsal } from '@azure/msal-react';
import { Link } from 'react-router-dom';
import { AuthenticationResult } from '@azure/msal-browser';
import AutocompleteSearch from '../shared/AutocompleteSearch';
import { useTranslation } from 'react-i18next';
import ClientSearch from '../shared/ClientSearch';

//let statusTypes = ["EnAttente", "Valider", "Rejeter"];
// let cargoTypes = ["Container", "Conventional", "RollOnRollOff"];

function validMail(mail: string) {
    return /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/.test(mail);
}

function NewRequest(props: any) {
    const [load, setLoad] = useState<boolean>(false);
    const [loadUser, setLoadUser] = useState<boolean>(true);
    const [email, setEmail] = useState<string>("");
    // const [status, setStatus] = useState<string | null>(null);
    const [phone, setPhone] = useState<string>("");
    const [message, setMessage] = useState<string>("");
    // const [cargoType, setCargoType] = useState<string>("0");
    const [packingType, setPackingType] = useState<string>("FCL");
    const [clientNumber, setClientNumber] = useState<any>(null);
    // const [departurePort, setDeparturePort] = useState<any>(null);
    // const [arrivalPort, setArrivalPort] = useState<any>(null);
    const [departure, setDeparture] = useState<any>(null);
    const [arrival, setArrival] = useState<any>(null);
    // const [tags, setTags] = useState<MuiChipsInputChip[]>([]);
    const [tags, setTags] = useState<any>([]);
    const [currentUser, setCurrentUser] = useState<any>(null);
    const [assignedManager, setAssignedManager] = useState<string>("null");
    const [assignees, setAssignees] = useState<any>(null);
    
    const [containerType, setContainerType] = useState<string>("20' Dry");
    const [quantity, setQuantity] = useState<number>(1);
    const [containersSelection, setContainersSelection] = useState<any>([]);
    
    const [unitName, setUnitName] = useState<string>("");
    const [unitDimensions, setUnitDimensions] = useState<string>("");
    const [unitWeight, setUnitWeight] = useState<number>(0);
    const [unitQuantity, setUnitQuantity] = useState<number>(1);
    const [unitsSelection, setUnitsSelection] = useState<any>([]);

    const [packageName, setPackageName] = useState<string>("");
    const [packageDimensions, setPackageDimensions] = useState<string>("");
    const [packageWeight, setPackageWeight] = useState<number>(0);
    const [packageQuantity, setPackageQuantity] = useState<number>(1);
    const [packagesSelection, setPackagesSelection] = useState<any>([]);
    
    const [containers, setContainers] = useState<any>(null);
    // const [ports, setPorts] = useState<any>(null);
    const [products, setProducts] = useState<any>(null);
    //let { id } = useParams();
    const { instance, accounts } = useMsal();
    const account = useAccount(accounts[0] || {});
    
    const context = useAuthorizedBackendApi();

    const { t } = useTranslation();
    
    const handleChangePackingType = (event: { target: { value: string } }) => {
        setPackingType(event.target.value);
    };

    const handleChangeAssignedManager = (event: { target: { value: string } }) => {
        setAssignedManager(event.target.value);
    };
    
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
            
            const response = await (context as BackendService<any>).getWithToken(protectedResources.apiLisTransport.endPoint+"/Product/Products", token);
            console.log(response);
            if (response !== null && response !== undefined) {
                setProducts(response);
            }  
        }
    }
    
    const getContainers = async () => {
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
            
            const response = await (context as BackendService<any>).getWithToken(protectedResources.apiLisTransport.endPoint+"/Package/Containers", token);
            if (response !== null && response !== undefined) {
                setContainers(response);
            }  
        }
    }
    
    useEffect(() => {
        getContainers();
        getProducts(); 
        getAssignees();
    }, [instance, account, context]);

    const assignManager = async (idQuote: string) => {
        if (currentUser !== null && currentUser !== undefined && currentUser !== "") {
            if (context) {
                const response = await (context as BackendService<any>).put(protectedResources.apiLisQuotes.endPoint+"/Assignee/"+idQuote+"/"+assignedManager, []);
                if (response !== null) {
                    setLoad(false);
                    enqueueSnackbar(t('requestCreatedAssigned'), { variant: "success", anchorOrigin: { horizontal: "right", vertical: "top"} });
                    //enqueueSnackbar("The manager has been assigned to this request.", { variant: "success", anchorOrigin: { horizontal: "right", vertical: "top"} });
                }
                else {
                    setLoad(false);
                    enqueueSnackbar(t('errorHappened'), { variant: "error", anchorOrigin: { horizontal: "right", vertical: "top"} });
                }
            }
        }
        else {
            setLoad(false);
            enqueueSnackbar(t('requestCreated'), { variant: "error", anchorOrigin: { horizontal: "right", vertical: "top"} });
        }
    }

    const getAssignees = async () => {
        if (context) {
            setLoadUser(true);
            const response = await (context as BackendService<any>).getSingle(protectedResources.apiLisQuotes.endPoint+"/Assignee");
            if (response !== null && response.code !== undefined) {
                if (response.code === 200) {
                    var aux = response.data.find((elm: any) => elm.email === account?.username);
                    //console.log(account);
                    setAssignees(response.data);
                    setCurrentUser(aux);
                    if (aux !== null && aux !== undefined && aux !== "") {
                        setAssignedManager(aux.id);
                    }
                    //console.log(response.data.find((elm: any) => elm.email === account?.username));
                    setLoadUser(false);
                }
                else {
                    setLoadUser(false);
                }
            }
        }
    }

    // const postEmail = async(from: string, to: string, subject: string, htmlContent: string) => {
    //     const body: MailData = { from: from, to: to, subject: subject, htmlContent: htmlContent };
    //     const data = await (context as BackendService<any>).postForm(protectedResources.apiLisQuotes.endPoint+"/Email", body);
    //     console.log(data);
    //     if (data?.status === 200) {
    //         enqueueSnackbar(t('messageSuccessSent'), { variant: "success", anchorOrigin: { horizontal: "right", vertical: "top"} });
    //     }
    //     else {
    //         enqueueSnackbar(t('errorHappened'), { variant: "error", anchorOrigin: { horizontal: "right", vertical: "top"} });
    //     }
    // }

    function sendQuotationForm() {
        if (phone !== "" && email !== "" && arrival !== null && departure !== null) {
            if (email === "" || (email !== "" && validMail(email))) {
                setLoad(true);
                var auxUnits = [];
                if (packingType === "Breakbulk/LCL") {
                    auxUnits = packagesSelection;
                }
                else if (packingType === "Unit RoRo") {
                    auxUnits = unitsSelection;
                }
                
                var myHeaders = new Headers();
                myHeaders.append('Accept', '');
                myHeaders.append("Content-Type", "application/json");
                fetch(protectedResources.apiLisQuotes.endPoint+"/Request", {
                    method: "POST",
                    body: JSON.stringify({ 
                        email: email,
                        whatsapp: phone,
                        // departure: departurePort.portName+', '+departurePort.country,
                        // arrival: arrivalPort.portName+', '+arrivalPort.country,
                        departure: departure !== null && departure !== undefined ? departure.city.toUpperCase()+', '+departure.country+', '+departure.latitude+', '+departure.longitude : "",
                        arrival: arrival !== null && arrival !== undefined ? arrival.city.toUpperCase()+', '+arrival.country+', '+arrival.latitude+', '+arrival.longitude : "",
                        cargoType: 0,
                        clientNumber: clientNumber !== null ? String(clientNumber.contactId) : null,
                        packingType: packingType,
                        containers: containersSelection.map((elm: any, i: number) => { return { 
                            id: containers.find((item: any) => item.packageName === elm.container).packageName, 
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
                        quantity: Number(quantity),
                        detail: message,
                        tags: tags.length !== 0 ? tags.map((elm: any) => elm.productName).join(',') : null,
                    }),
                    headers: myHeaders
                })
                .then((response: any) => response.json())
                .then((data: any) => {
                    //setLoad(false);
                    if (data.code === 201) {
                        //enqueueSnackbar("Your request has been created with success.", { variant: "success", anchorOrigin: { horizontal: "right", vertical: "top"} });
                        setPhone("");
                        setEmail("");
                        setMessage("");

                        assignManager(data.data.id);
                    }
                    else {
                        setLoad(false);
                        enqueueSnackbar(t('errorHappened'), { variant: "error", anchorOrigin: { horizontal: "right", vertical: "top"} });
                    }
                })
                .catch(error => { 
                    setLoad(false);
                    enqueueSnackbar(t('errorHappenedRequest'), { variant: "error", anchorOrigin: { horizontal: "right", vertical: "top"} });
                });        
            }
            else {
                enqueueSnackbar(t('emailNotValid'), { variant: "info", anchorOrigin: { horizontal: "right", vertical: "top"} });
            }
        }
        else {
            enqueueSnackbar(t('fieldsEmpty'), { variant: "info", anchorOrigin: { horizontal: "right", vertical: "top"} });
        }
    }

    return (
        <div style={{ background: "#fff", borderTopLeftRadius: 20, borderTopRightRadius: 20 }}>
            <SnackbarProvider />
            <Box py={2.5}>
                <Typography variant="h5" sx={{mt: {xs: 4, md: 1.5, lg: 1.5 }}} px={5}><b>{t('createNewRequest')}</b></Typography>
                <Box>
                    <Grid container spacing={1} px={5} mt={2}>
                        <Grid item xs={12} md={6}>
                            <InputLabel htmlFor="whatsapp-phone-number" sx={inputLabelStyles}>{t('whatsappNumber')}</InputLabel>
                            <MuiTelInput id="whatsapp-phone-number" value={phone} onChange={setPhone} defaultCountry="CM" preferredCountries={["CM", "BE", "KE"]} fullWidth sx={{ mt: 1 }} />
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <InputLabel htmlFor="request-email" sx={inputLabelStyles}>{t('emailAddress')}</InputLabel>
                            <BootstrapInput id="request-email" type="email" value={email} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)} fullWidth />
                        </Grid>
                        <Grid item xs={12} md={6} mt={1}>
                            <InputLabel htmlFor="departure" sx={inputLabelStyles}>{t('departure')}</InputLabel>
                            <AutocompleteSearch id="departure" value={departure} onChange={setDeparture} fullWidth />
                            {/* {
                                ports !== null ?
                                <Autocomplete
                                    disablePortal
                                    id="departure"
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
                                    value={departurePort}
                                    sx={{ mt: 1 }}
                                    renderInput={(params: any) => <TextField {...params} />}
                                    onChange={(e: any, value: any) => { setDeparturePort(value); }}
                                    fullWidth
                                /> : <Skeleton />
                            } */}
                        </Grid>
                        <Grid item xs={12} md={6} mt={1}>
                            <InputLabel htmlFor="arrival" sx={inputLabelStyles}>{t('arrival')}</InputLabel>
                            <AutocompleteSearch id="arrival" value={arrival} onChange={setArrival} fullWidth />
                            {/* {
                                ports !== null ?
                                <Autocomplete
                                    disablePortal
                                    id="arrival"
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
                                    value={arrivalPort}
                                    sx={{ mt: 1 }}
                                    renderInput={(params: any) => <TextField {...params} />}
                                    onChange={(e: any, value: any) => { setArrivalPort(value); }}
                                    fullWidth
                                /> : <Skeleton />
                            } */}
                        </Grid>
                        <Grid item xs={12} md={3} mt={1}>
                            <InputLabel htmlFor="packing-type" sx={inputLabelStyles}>{t('packingType')}</InputLabel>
                            <NativeSelect
                                id="packing-type"
                                value={packingType}
                                onChange={handleChangePackingType}
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
                                        // onChange={(event: { target: { value: any } }) => { setContainerType(Number(event.target.value)); }}
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
                            <Grid item xs={12} md={3} mt={1}>
                                <Button 
                                    variant="contained" color="inherit" fullWidth sx={whiteButtonStyles} 
                                    style={{ marginTop: "30px", height: "42px", float: "right" }} 
                                    onClick={() => {
                                        if (containerType !== "" && quantity > 0) {
                                            setContainersSelection((prevItems: any) => [...prevItems, { container: containerType, quantity: quantity, id: containers.find((item: any) => item.packageName === containerType).packageId }]);
                                            setContainerType(""); setQuantity(1);
                                        } 
                                        else {
                                            enqueueSnackbar("You need to select a container type and a good value for quantity.", { variant: "error", anchorOrigin: { horizontal: "right", vertical: "top"} });
                                        }
                                    }} 
                                >
                                    {t('addContainer')}
                                </Button>
                            </Grid>
                            <Grid item xs={12}>
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
                                        </Grid>
                                    : null  
                                }
                            </Grid>
                            </> : null
                        }
                        {
                            packingType === "Breakbulk/LCL" ?
                            <>
                            <Grid item xs={12} md={3} mt={1}>
                                <InputLabel htmlFor="package-name" sx={inputLabelStyles}>{t('packageName')}</InputLabel>
                                <BootstrapInput id="package-name" type="text" value={packageName} onChange={(e: any) => {setPackageName(e.target.value)}} fullWidth />
                            </Grid>
                            <Grid item xs={12} md={1} mt={1}>
                                <InputLabel htmlFor="package-quantity" sx={inputLabelStyles}>{t('quantity')}</InputLabel>
                                <BootstrapInput id="package-quantity" type="number" inputProps={{ min: 1, max: 100 }} value={packageQuantity} onChange={(e: any) => {setPackageQuantity(e.target.value)}} fullWidth />
                            </Grid>
                            <Grid item xs={12} md={2} mt={1}>
                                <InputLabel htmlFor="package-dimensions" sx={inputLabelStyles}>{t('dimensions')}</InputLabel>
                                <BootstrapInput id="package-dimensions" type="text" value={packageDimensions} onChange={(e: any) => {setPackageDimensions(e.target.value)}} fullWidth />
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
                                        if (packageName !== "" && packageQuantity > 0 && packageWeight > 0 && packageDimensions !== "") {
                                            setPackagesSelection((prevItems: any) => [...prevItems, { 
                                                name: packageName, quantity: packageQuantity, dimensions: packageDimensions, weight: packageWeight
                                            }]);
                                            setPackageName(""); setPackageQuantity(1); setPackageDimensions(""); setPackageWeight(0);
                                        } 
                                        else {
                                            enqueueSnackbar("You need to fill the fields package name, weight and dimensions.", { variant: "error", anchorOrigin: { horizontal: "right", vertical: "top"} });
                                        }
                                    }} 
                                >
                                    {t('add')}
                                </Button>
                            </Grid>
                            <Grid item xs={12}>
                            {
                                    packagesSelection !== undefined && packagesSelection !== null && packagesSelection.length !== 0 ? 
                                        <Grid container spacing={2}>
                                            {
                                                packagesSelection.map((item: any, index: number) => (
                                                    <Grid item xs={12} md={6}>
                                                        <ListItem
                                                            key={"unititem1-"+index}
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
                                                                t('name')+" : "+item.name+" | "+t('quantity')+" : "+item.quantity+" | "+t('dimensions')+" : "+item.dimensions+" | "+t('weight')+" : "+item.weight+" Kg"
                                                            } />
                                                        </ListItem>
                                                    </Grid>
                                                ))
                                            }
                                        </Grid>
                                    : null  
                                }
                            </Grid>
                            </> : null
                        }
                        {
                            packingType === "Unit RoRo" ?
                            <>
                            <Grid item xs={12} md={3} mt={1}>
                                <InputLabel htmlFor="unit-name" sx={inputLabelStyles}>{t('unitName')}</InputLabel>
                                <BootstrapInput id="unit-name" type="text" value={unitName} onChange={(e: any) => {setUnitName(e.target.value)}} fullWidth />
                            </Grid>
                            <Grid item xs={12} md={1} mt={1}>
                                <InputLabel htmlFor="unit-quantity" sx={inputLabelStyles}>{t('quantity')}</InputLabel>
                                <BootstrapInput id="unit-quantity" type="number" inputProps={{ min: 1, max: 100 }} value={unitQuantity} onChange={(e: any) => {setUnitQuantity(e.target.value)}} fullWidth />
                            </Grid>
                            <Grid item xs={12} md={2} mt={1}>
                                <InputLabel htmlFor="unit-dimensions" sx={inputLabelStyles}>{t('dimensions')}</InputLabel>
                                <BootstrapInput id="unit-dimensions" type="text" value={unitDimensions} onChange={(e: any) => {setUnitDimensions(e.target.value)}} fullWidth />
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
                                        if (unitName !== "" && unitQuantity > 0 && unitWeight > 0 && unitDimensions !== "") {
                                            setUnitsSelection((prevItems: any) => [...prevItems, { 
                                                name: unitName, quantity: unitQuantity, dimensions: unitDimensions, weight: unitWeight
                                            }]);
                                            setUnitName(""); setUnitQuantity(1); setUnitDimensions(""); setUnitWeight(0);
                                        } 
                                        else {
                                            enqueueSnackbar(t('needFillFields'), { variant: "error", anchorOrigin: { horizontal: "right", vertical: "top"} });
                                        }
                                    }} 
                                >
                                    {t('add')}
                                </Button>
                            </Grid>
                            <Grid item xs={12}>
                            {
                                    unitsSelection !== undefined && unitsSelection !== null && unitsSelection.length !== 0 ? 
                                        <Grid container spacing={2}>
                                            {
                                                unitsSelection.map((item: any, index: number) => (
                                                    <Grid item xs={12} md={6}>
                                                        <ListItem
                                                            key={"unititem1-"+index}
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
                                                                t('name')+" : "+item.name+" | "+t('quantity')+" : "+item.quantity+" | "+t('dimensions')+" : "+item.dimensions+" | "+t('weight')+" : "+item.weight+" Kg"
                                                            } />
                                                        </ListItem>
                                                    </Grid>
                                                ))
                                            }
                                        </Grid>
                                    : null  
                                }
                            </Grid>
                            </> : null
                        }

                        <Grid item xs={12} md={6} mt={1} mb={1}>
                            <InputLabel htmlFor="tags" sx={inputLabelStyles}>{t('specifics')}</InputLabel>
                            {
                                products !== null ?
                                <Autocomplete
                                    multiple    
                                    disablePortal
                                    id="cargo-products"
                                    placeholder="Machinery, Household goods, etc"
                                    options={products}
                                    getOptionLabel={(option: any) => { 
                                        if (option !== null && option !== undefined) {
                                            return option.productName;
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
                        <Grid item xs={12} md={6} mt={1}>
                            <InputLabel htmlFor="client-number" sx={inputLabelStyles}>{t('clientNumber')}</InputLabel>
                            {/* <BootstrapInput id="client-number" value={clientNumber} onChange={(e: any) => {setClientNumber(e.target.value)}} fullWidth /> */}
                            <ClientSearch id="client-number" value={clientNumber} onChange={setClientNumber} callBack={() => console.log(clientNumber)} fullWidth />
                        </Grid>

                        <Grid item xs={12} md={6} mt={.5}>
                            <InputLabel htmlFor="request-message" sx={inputLabelStyles}>{t('details')}</InputLabel>
                            <BootstrapInput id="request-message" type="text" multiline rows={3.5} value={message} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setMessage(e.target.value)} fullWidth />
                        </Grid>
                        <Grid item xs={12} md={6} mt={1}>
                            <InputLabel htmlFor="assigned-manager" sx={inputLabelStyles}>{t('assignedManager')}</InputLabel>
                            {
                                !loadUser ? 
                                <>
                                    <NativeSelect
                                        id="assigned-manager"
                                        value={assignedManager}
                                        onChange={handleChangeAssignedManager}
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
                                </> : <Skeleton sx={{ mt: 3 }} />   
                            }
                            {
                                !loadUser ? 
                                currentUser !== null && currentUser !== undefined ? 
                                <Alert severity="info" sx={{ mt: 1 }}>{t('requestAssignedTo')} {account?.name} {t('byDefault')}</Alert> : 
                                <Alert severity="warning" sx={{ mt: 1 }}>{t('requestNotAssignedCurrentUser')} <Link to="/admin/users" style={{ textDecoration: "none" }}>{t('users')}</Link>.</Alert>
                                : <Skeleton sx={{ my: 1 }} />
                            }            
                        </Grid>
                        <Grid item xs={12}>
                            <Button variant="contained" color={!load ? "primary" : "info"} className="mr-3" onClick={sendQuotationForm} disabled={load === true} sx={{ textTransform: "none" }}>{t('createRequest')}</Button>
                        </Grid>
                    </Grid>
                </Box>
            </Box>
        </div>
    );
}

export default NewRequest;
