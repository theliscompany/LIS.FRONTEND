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
import { MuiChipsInput, MuiChipsInputChip } from 'mui-chips-input';
import { MailData } from '../../models/models';
import { useAccount, useMsal } from '@azure/msal-react';
import { Link } from 'react-router-dom';
import { AuthenticationResult } from '@azure/msal-browser';
import AutocompleteSearch from '../shared/AutocompleteSearch';

//let statusTypes = ["EnAttente", "Valider", "Rejeter"];
let cargoTypes = ["Container", "Conventional", "RollOnRollOff"];

function validMail(mail: string) {
    return /^(([^<>()\[\]\.,;:\s@\"]+(\.[^<>()\[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()\.,;\s@\"]+\.{0,1})+([^<>()\.,;:\s@\"]{2,}|[\d\.]+))$/.test(mail);
}

function NewRequest(props: any) {
    const [load, setLoad] = useState<boolean>(false);
    const [loadUser, setLoadUser] = useState<boolean>(true);
    const [email, setEmail] = useState<string>("");
    const [status, setStatus] = useState<string | null>(null);
    const [phone, setPhone] = useState<string>("");
    const [message, setMessage] = useState<string>("");
    const [cargoType, setCargoType] = useState<string>("0");
    const [packingType, setPackingType] = useState<string>("FCL");
    const [clientNumber, setClientNumber] = useState<string>("");
    const [departurePort, setDeparturePort] = useState<any>(null);
    const [arrivalPort, setArrivalPort] = useState<any>(null);
    const [departure, setDeparture] = useState<any>(null);
    const [arrival, setArrival] = useState<any>(null);
    // const [tags, setTags] = useState<MuiChipsInputChip[]>([]);
    const [tags, setTags] = useState<any>([]);
    const [modal, setModal] = useState<boolean>(false);
    const [mailSubject, setMailSubject] = useState<string>("");
    const [mailContent, setMailContent] = useState<string>("");
    const [currentUser, setCurrentUser] = useState<any>(null);
    const [assignedManager, setAssignedManager] = useState<string>("null");
    const [assignees, setAssignees] = useState<any>(null);
    
    const [containerType, setContainerType] = useState<number>(8);
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
    const [ports, setPorts] = useState<any>(null);
    const [products, setProducts] = useState<any>(null);
    //let { id } = useParams();
    const { instance, accounts } = useMsal();
    const account = useAccount(accounts[0] || {});
    
    const context = useAuthorizedBackendApi();
    
    const handleChangeCargoType = (event: { target: { value: string } }) => {
        setCargoType(event.target.value);
    };

    const handleChangePackingType = (event: { target: { value: string } }) => {
        setPackingType(event.target.value);
    };

    const handleChangeAssignedManager = (event: { target: { value: string } }) => {
        setAssignedManager(event.target.value);
    };
    
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
            
            const response = await (context as BackendService<any>).getWithToken(protectedResources.apiLisTransport.endPoint+"/Port/Ports", token);
            console.log(response);
            if (response !== null && response !== undefined) {
                setPorts(response);
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
        getPorts();
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
                    enqueueSnackbar("Your request has been created and assigned with success.", { variant: "success", anchorOrigin: { horizontal: "right", vertical: "top"} });
                    //enqueueSnackbar("The manager has been assigned to this request.", { variant: "success", anchorOrigin: { horizontal: "right", vertical: "top"} });
                }
                else {
                    setLoad(false);
                    enqueueSnackbar("An error happened during the operation.", { variant: "error", anchorOrigin: { horizontal: "right", vertical: "top"} });
                }
            }
        }
        else {
            setLoad(false);
            enqueueSnackbar("Your request has been created  .", { variant: "error", anchorOrigin: { horizontal: "right", vertical: "top"} });
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

    const postEmail = async(from: string, to: string, subject: string, htmlContent: string) => {
        const body: MailData = { from: from, to: to, subject: subject, htmlContent: htmlContent };
        const data = await (context as BackendService<any>).postForm(protectedResources.apiLisQuotes.endPoint+"/Email", body);
        console.log(data);
        if (data?.status === 200) {
            enqueueSnackbar("The message has been successfully sent.", { variant: "success", anchorOrigin: { horizontal: "right", vertical: "top"} });
            setMailSubject("");
            setMailContent("");
            setModal(false);
        }
        else {
            enqueueSnackbar("An error occured. Please refresh the page or check your internet connection.", { variant: "error", anchorOrigin: { horizontal: "right", vertical: "top"} });
        }
    }

    function sendQuotationForm() {
        if (phone !== "" && email !== "" && arrival !== null && departure !== null) {
            if (email === "" || email !== "" && validMail(email)) {
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
                        clientNumber: clientNumber,
                        packingType: packingType,
                        containers: containersSelection.map((elm: any, i: number) => { return { 
                            id: i, 
                            containers: containers.find((item: any) => item.packageId === elm.container).packageName, 
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
                        enqueueSnackbar("An error occured. Please refresh the page or check your internet connection.", { variant: "error", anchorOrigin: { horizontal: "right", vertical: "top"} });
                    }
                })
                .catch(error => { 
                    setLoad(false);
                    enqueueSnackbar("An error happened when we were sending your request.", { variant: "error", anchorOrigin: { horizontal: "right", vertical: "top"} });
                });        
            }
            else {
                enqueueSnackbar("The email is not valid, please verify it.", { variant: "info", anchorOrigin: { horizontal: "right", vertical: "top"} });
            }
        }
        else {
            enqueueSnackbar("One or many fields are empty, please verify the form.", { variant: "info", anchorOrigin: { horizontal: "right", vertical: "top"} });
        }
    }

    return (
        <div style={{ background: "#fff", borderTopLeftRadius: 20, borderTopRightRadius: 20 }}>
            <SnackbarProvider />
            <Box py={2.5}>
                <Typography variant="h5" sx={{mt: {xs: 4, md: 1.5, lg: 1.5 }}} px={5}><b>Create a new request</b></Typography>
                <Box>
                    <Grid container spacing={1} px={5} mt={2}>
                        <Grid item xs={12} md={6}>
                            <InputLabel htmlFor="whatsapp-phone-number" sx={inputLabelStyles}>Whatsapp number</InputLabel>
                            <MuiTelInput id="whatsapp-phone-number" value={phone} onChange={setPhone} defaultCountry="CM" preferredCountries={["CM", "BE", "KE"]} fullWidth sx={{ mt: 1 }} />
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <InputLabel htmlFor="request-email" sx={inputLabelStyles}>Your email address</InputLabel>
                            <BootstrapInput id="request-email" type="email" value={email} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)} fullWidth />
                        </Grid>
                        <Grid item xs={12} md={6} mt={1}>
                            <InputLabel htmlFor="departure" sx={inputLabelStyles}>From (city, country)</InputLabel>
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
                            <InputLabel htmlFor="arrival" sx={inputLabelStyles}>To (city, country)</InputLabel>
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
                            <InputLabel htmlFor="packing-type" sx={inputLabelStyles}>Packing Type</InputLabel>
                            <NativeSelect
                                id="packing-type"
                                value={packingType}
                                onChange={handleChangePackingType}
                                input={<BootstrapInput />}
                                fullWidth
                            >
                                <option value="FCL">FCL</option>
                                <option value="Breakbulk/LCL">Breakbulk/LCL</option>
                                <option value="Unit RoRo">Unit RoRo</option>
                            </NativeSelect>
                        </Grid>
                        {
                            packingType === "FCL" ?
                            <>
                            <Grid item xs={12} md={3} mt={1}>
                                <InputLabel htmlFor="container-type" sx={inputLabelStyles}>Container Type</InputLabel>
                                {
                                    containers !== null ?
                                    <NativeSelect
                                        id="container-type"
                                        value={containerType}
                                        onChange={(event: { target: { value: any } }) => { setContainerType(Number(event.target.value)); }}
                                        input={<BootstrapInput />}
                                        fullWidth
                                    >
                                        <option key={"elm1-x"} value={0}>Not defined</option>
                                        {containers.filter((elm: any) => ["20' Dry"]).map((elm: any, i: number) => (
                                            <option key={"elm1-"+i} value={elm.packageId}>{elm.packageName}</option>
                                        ))}
                                    </NativeSelect>
                                    : <Skeleton />
                                }
                            </Grid>
                            <Grid item xs={12} md={3} mt={1}>
                                <InputLabel htmlFor="quantity" sx={inputLabelStyles}>Quantity</InputLabel>
                                <BootstrapInput id="quantity" type="number" inputProps={{ min: 1, max: 100 }} value={quantity} onChange={(e: any) => {setQuantity(e.target.value)}} fullWidth />
                            </Grid>
                            <Grid item xs={12} md={3} mt={1}>
                                <Button 
                                    variant="contained" color="inherit" fullWidth sx={whiteButtonStyles} 
                                    style={{ marginTop: "30px", height: "42px", float: "right" }} 
                                    onClick={() => {
                                        if (containerType !== 0 && quantity > 0) {
                                            setContainersSelection((prevItems: any) => [...prevItems, { container: containerType, quantity: quantity }]);
                                            setContainerType(0); setQuantity(1);
                                        } 
                                        else {
                                            enqueueSnackbar("You need to select a container type and a good value for quantity.", { variant: "error", anchorOrigin: { horizontal: "right", vertical: "top"} });
                                        }
                                    }} 
                                >
                                    Add the container
                                </Button>
                            </Grid>
                            <Grid item xs={12}>
                                {
                                    containersSelection !== undefined && containersSelection !== null && containersSelection.length !== 0 && containers !== null ? 
                                        <Grid container spacing={2}>
                                            {
                                                containersSelection.map((item: any, index: number) => (
                                                    <Grid item xs={12} md={4}>
                                                        <ListItem
                                                            key={"listitem1-"+index}
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
                                                                containers.find((elm: any) => elm.packageId === item.container) !== undefined ?
                                                                "Container : "+containers.find((elm: any) => elm.packageId === item.container).packageName+" | Quantity : "+item.quantity
                                                                : "Container : "+item.container+" | Quantity : "+item.quantity
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
                                <InputLabel htmlFor="package-name" sx={inputLabelStyles}>Package Name</InputLabel>
                                <BootstrapInput id="package-name" type="text" value={packageName} onChange={(e: any) => {setPackageName(e.target.value)}} fullWidth />
                            </Grid>
                            <Grid item xs={12} md={1} mt={1}>
                                <InputLabel htmlFor="package-quantity" sx={inputLabelStyles}>Quantity</InputLabel>
                                <BootstrapInput id="package-quantity" type="number" inputProps={{ min: 1, max: 100 }} value={packageQuantity} onChange={(e: any) => {setPackageQuantity(e.target.value)}} fullWidth />
                            </Grid>
                            <Grid item xs={12} md={2} mt={1}>
                                <InputLabel htmlFor="package-dimensions" sx={inputLabelStyles}>Dimensions</InputLabel>
                                <BootstrapInput id="package-dimensions" type="text" value={packageDimensions} onChange={(e: any) => {setPackageDimensions(e.target.value)}} fullWidth />
                            </Grid>
                            <Grid item xs={12} md={2} mt={1}>
                                <InputLabel htmlFor="package-weight" sx={inputLabelStyles}>Weight (in Kg)</InputLabel>
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
                                    Add
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
                                                                "Name : "+item.name+" | Quantity : "+item.quantity+" | Dimensions : "+item.dimensions+" | Weight : "+item.weight+" Kg"
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
                                <InputLabel htmlFor="unit-name" sx={inputLabelStyles}>Unit Name</InputLabel>
                                <BootstrapInput id="unit-name" type="text" value={unitName} onChange={(e: any) => {setUnitName(e.target.value)}} fullWidth />
                            </Grid>
                            <Grid item xs={12} md={1} mt={1}>
                                <InputLabel htmlFor="unit-quantity" sx={inputLabelStyles}>Quantity</InputLabel>
                                <BootstrapInput id="unit-quantity" type="number" inputProps={{ min: 1, max: 100 }} value={unitQuantity} onChange={(e: any) => {setUnitQuantity(e.target.value)}} fullWidth />
                            </Grid>
                            <Grid item xs={12} md={2} mt={1}>
                                <InputLabel htmlFor="unit-dimensions" sx={inputLabelStyles}>Dimensions</InputLabel>
                                <BootstrapInput id="unit-dimensions" type="text" value={unitDimensions} onChange={(e: any) => {setUnitDimensions(e.target.value)}} fullWidth />
                            </Grid>
                            <Grid item xs={12} md={2} mt={1}>
                                <InputLabel htmlFor="unit-weight" sx={inputLabelStyles}>Weight (in Kg)</InputLabel>
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
                                            enqueueSnackbar("You need to fill the fields unit name, weight and dimensions.", { variant: "error", anchorOrigin: { horizontal: "right", vertical: "top"} });
                                        }
                                    }} 
                                >
                                    Add
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
                                                                "Name : "+item.name+" | Quantity : "+item.quantity+" | Dimensions : "+item.dimensions+" | Weight : "+item.weight+" Kg"
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
                            <InputLabel htmlFor="tags" sx={inputLabelStyles}>Specifics</InputLabel>
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
                            <InputLabel htmlFor="client-number" sx={inputLabelStyles}>Client number</InputLabel>
                            <BootstrapInput id="client-number" value={clientNumber} onChange={(e: any) => {setClientNumber(e.target.value)}} fullWidth />
                        </Grid>

                        <Grid item xs={12} md={6} mt={.5}>
                            <InputLabel htmlFor="request-message" sx={inputLabelStyles}>Other details about your need (Optional)</InputLabel>
                            <BootstrapInput id="request-message" type="text" multiline rows={3.5} value={message} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setMessage(e.target.value)} fullWidth />
                        </Grid>
                        <Grid item xs={12} md={6} mt={1}>
                            <InputLabel htmlFor="assigned-manager" sx={inputLabelStyles}>Assigned manager</InputLabel>
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
                                        <option value="">No agent assigned</option>
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
                                <Alert severity="info" sx={{ mt: 1 }}>This request will be assigned to the current user {account?.name} by default.</Alert> : 
                                <Alert severity="warning" sx={{ mt: 1 }}>This request will not be assigned to the current user, you need to grant him the permission in <Link to="/admin/users" style={{ textDecoration: "none" }}>Users</Link>.</Alert>
                                : <Skeleton sx={{ my: 1 }} />
                            }            
                        </Grid>
                        <Grid item xs={12}>
                            <Button variant="contained" color={!load ? "primary" : "info"} className="mr-3" onClick={sendQuotationForm} disabled={load === true} sx={{ textTransform: "none" }}>Create the request</Button>
                        </Grid>
                    </Grid>
                </Box>
            </Box>
        </div>
    );
}

export default NewRequest;
