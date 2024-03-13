import React, { useEffect, useState } from 'react';
import { Alert, Autocomplete, Box, Button, Grid, InputLabel, NativeSelect, Skeleton, TextField, Typography, ListItem, ListItemText, IconButton } from '@mui/material';
import { MuiTelInput } from 'mui-tel-input';
import DeleteIcon from '@mui/icons-material/Delete';
import { inputLabelStyles, BootstrapInput, whiteButtonStyles, BootstrapDialog } from '../utils/misc/styles';
import { enqueueSnackbar, SnackbarProvider } from 'notistack';
import { protectedResources, transportRequest } from '../config/authConfig';
import { useAuthorizedBackendApi } from '../api/api';
import { BackendService } from '../utils/services/fetch';
import { useAccount, useMsal } from '@azure/msal-react';
import { Link } from 'react-router-dom';
import { AuthenticationResult } from '@azure/msal-browser';
import AutocompleteSearch from '../components/shared/AutocompleteSearch';
import { useTranslation } from 'react-i18next';
import ClientSearch from '../components/shared/ClientSearch';
import NewContact from '../components/editRequestPage/NewContact';

//let statusTypes = ["EnAttente", "Valider", "Rejeter"];
// let cargoTypes = ["Container", "Conventional", "RollOnRollOff"];

function validMail(mail: string) {
    return /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/.test(mail);
}

let packingOptions = ["Unit", "Bundle", "Bag", "Pallet", "Carton", "Lot", "Crate"];

function NewRequest(props: any) {
    const [load, setLoad] = useState<boolean>(false);
    const [loadUser, setLoadUser] = useState<boolean>(true);
    const [email, setEmail] = useState<string>("");
    const [phone, setPhone] = useState<string>("");
    const [message, setMessage] = useState<string>("");
    const [packingType, setPackingType] = useState<string>("FCL");
    const [clientNumber, setClientNumber] = useState<any>(null);
    const [departure, setDeparture] = useState<any>(null);
    const [arrival, setArrival] = useState<any>(null);
    const [tags, setTags] = useState<any>([]);
    const [currentUser, setCurrentUser] = useState<any>(null);
    const [assignedManager, setAssignedManager] = useState<string>("null");
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
    
    const [containers, setContainers] = useState<any>(null);
    const [products, setProducts] = useState<any>(null);
    
    const [modal7, setModal7] = useState<boolean>(false);
    
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

    const resetForm = () => {
        setEmail("");
        setPhone("");
        setMessage("");
        setPackingType("FCL");
        setClientNumber(null);
        setDeparture(null);
        setArrival(null);
        setTags([]);
        setAssignedManager("null");
        setContainerType("20' Dry");
        setQuantity(1);
        setContainersSelection([]);
    }
    
    useEffect(() => {
        getContainers();
        getProducts(); 
        getAssignees();
    }, [instance, account, context]);

    const assignManager = async (idQuote: string) => {
        if (currentUser !== null && currentUser !== undefined && currentUser !== "") {
            if (context && account) {
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
            enqueueSnackbar(t('errorHappenedRequest'), { variant: "error", anchorOrigin: { horizontal: "right", vertical: "top"} });
        }
    }

    const getAssignees = async () => {
        if (context && account) {
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
            // Old test : email === "" || (email !== "" && validMail(email))
            if (validMail(email)) {
                setLoad(true);
                var auxUnits = [];
                if (packingType === "Breakbulk/LCL") {
                    auxUnits = packagesSelection;
                }
                else if (packingType === "Unit RoRo") {
                    auxUnits = unitsSelection;
                }

                var postcode1 = departure.postalCode !== null && departure.postalCode !== undefined ? departure.postalCode : "";
                var postcode2 = arrival.postalCode !== null && arrival.postalCode !== undefined ? arrival.postalCode : "";
                
                var myHeaders = new Headers();
                myHeaders.append('Accept', '');
                myHeaders.append("Content-Type", "application/json");
                fetch(protectedResources.apiLisQuotes.endPoint+"/Request", {
                    method: "POST",
                    body: JSON.stringify({ 
                        email: email,
                        whatsapp: phone,
                        departure: departure !== null && departure !== undefined ? [departure.city.toUpperCase(),departure.country,departure.latitude,departure.longitude,postcode1].filter((val: any) => { return val !== "" }).join(', ') : "",
                        arrival: arrival !== null && arrival !== undefined ? [arrival.city.toUpperCase(),arrival.country,arrival.latitude,arrival.longitude,postcode2].filter((val: any) => { return val !== "" }).join(', ') : "",
                        cargoType: 0,
                        clientNumber: clientNumber !== null ? String(clientNumber.contactNumber)+", "+clientNumber.contactName : null,
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
                        quantity: Number(quantity),
                        detail: message,
                        tags: tags.length !== 0 ? tags.map((elm: any) => elm.productName).join(',') : null,
                    }),
                    headers: myHeaders
                })
                .then((response: any) => response.json())
                .then((data: any) => {
                    if (data.code === 201) {
                        resetForm();
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
                <Box>
                    <Grid container spacing={1} px={5} mt={2}>
                        <Grid item xs={9}>
                            <Typography variant="h5"><b>{t('createNewRequest')}</b></Typography>
                        </Grid>
                        <Grid item xs={3}>
                            <Button variant="contained" color="inherit" sx={{ float: "right", backgroundColor: "#fff", textTransform: "none" }} onClick={() => { setModal7(true); }} >{t('createNewContact')}</Button>
                        </Grid>
                        
                        <Grid item xs={12} md={6} mt={1}>
                            <InputLabel htmlFor="client-number" sx={inputLabelStyles}>{t('clientNumber')}</InputLabel>
                            <ClientSearch 
                                id="client-number" 
                                value={clientNumber} 
                                onChange={setClientNumber} 
                                callBack={(e: any) => {
                                    if (e.phone !== null) {
                                        setPhone(e.phone);
                                    }
                                    else {
                                        setPhone("");
                                    }

                                    if (e.email !== null) {
                                        setEmail(e.email);
                                    }
                                    else {
                                        setEmail("");
                                    }
                                }} 
                                fullWidth 
                            />
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
                            {/* {
                                !loadUser ? 
                                currentUser !== null && currentUser !== undefined ? 
                                <Alert severity="info" sx={{ mt: 1 }}>{t('requestAssignedTo')} {account?.name} {t('byDefault')}</Alert> : 
                                <Alert severity="warning" sx={{ mt: 1 }}>{t('requestNotAssignedCurrentUser')} <Link to="/admin/users" style={{ textDecoration: "none" }}>{t('users')}</Link>.</Alert>
                                : <Skeleton sx={{ my: 1 }} />
                            } */}
                        </Grid>
                        
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
                            <AutocompleteSearch id="departure" value={departure} onChange={setDeparture} fullWidth /*callBack={(val: any) => { setDeparture(val); }}*/ />
                        </Grid>
                        <Grid item xs={12} md={6} mt={1}>
                            <InputLabel htmlFor="arrival" sx={inputLabelStyles}>{t('arrival')}</InputLabel>
                            <AutocompleteSearch id="arrival" value={arrival} onChange={setArrival} fullWidth /*callBack={(val: any) => { setArrival(val); }}*/ />
                        </Grid>
                        <Grid item xs={12} md={2} mt={1}>
                            <InputLabel htmlFor="packing-type" sx={inputLabelStyles}>{t('packingType')}</InputLabel>
                            <NativeSelect
                                id="packing-type"
                                placeholder=''
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
                                        } 
                                        else {
                                            enqueueSnackbar("You need to select a container type and a good value for quantity.", { variant: "error", anchorOrigin: { horizontal: "right", vertical: "top"} });
                                        }
                                    }} 
                                >
                                    {t('addContainer')}
                                </Button>
                            </Grid>
                            <Grid item xs={12} mb={2}>
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
                            <Grid item xs={12}>
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
                                {/* <BootstrapInput id="unit-name" type="text" value={unitName} onChange={(e: any) => {setUnitName(e.target.value)}} fullWidth /> */}
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
                            {/* <Grid item xs={12} md={2} mt={1}>
                                <InputLabel htmlFor="unit-dimensions" sx={inputLabelStyles}>{t('dimensions')}</InputLabel>
                                <BootstrapInput id="unit-dimensions" type="text" value={unitDimensions} onChange={(e: any) => {setUnitDimensions(e.target.value)}} fullWidth />
                            </Grid> */}
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
                            <Grid item xs={12}>
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
                        <Grid item xs={12} md={6} mt={.5} sx={{ display: { xs: 'none', md: 'block' } }}>
                            <InputLabel htmlFor="request-message" sx={inputLabelStyles}>{t('details')}</InputLabel>
                            <BootstrapInput id="request-message" type="text" multiline rows={3.5} value={message} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setMessage(e.target.value)} fullWidth />
                        </Grid>

                        <Grid item xs={12} md={2}>
                            <Button variant="contained" color={!load ? "primary" : "info"} className="mr-3" onClick={sendQuotationForm} disabled={load === true} sx={{ textTransform: "none" }}>{t('createRequest')}</Button>
                        </Grid>
                    </Grid>
                </Box>
            </Box>

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
        </div>
    );
}

export default NewRequest;
