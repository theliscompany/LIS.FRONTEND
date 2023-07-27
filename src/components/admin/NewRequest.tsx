import { Alert, Autocomplete, Box, Button, Grid, InputLabel, NativeSelect, Skeleton, TextField, Typography } from '@mui/material';
import { MuiTelInput } from 'mui-tel-input';
import React, { useEffect, useState } from 'react';
import '../../App.css';
import AutocompleteSearch from '../shared/AutocompleteSearch';
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

//let statusTypes = ["EnAttente", "Valider", "Rejeter"];
let cargoTypes = ["Container", "Conventional", "RollOnRollOff"];

function convertStringToObject(str: string): { city: string, country: string } {
    if (str !== undefined) {
        const [city, ...countryArr] = str.split(', ');
        const country = countryArr.join(', ');
        return { city, country };
    }
    return { city: "", country: "" };
}

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
    const [quantity, setQuantity] = useState<number>(1);
    const [cargoType, setCargoType] = useState<string>("0");
    const [departurePort, setDepartureTown] = useState<any>(null);
    const [arrivalPort, setArrivalTown] = useState<any>(null);
    const [departure, setDeparture] = useState<string>("");
    const [arrival, setArrival] = useState<string>("");
    // const [tags, setTags] = useState<MuiChipsInputChip[]>([]);
    const [tags, setTags] = useState<any>([]);
    const [modal, setModal] = useState<boolean>(false);
    const [mailSubject, setMailSubject] = useState<string>("");
    const [mailContent, setMailContent] = useState<string>("");
    const [currentUser, setCurrentUser] = useState<any>(null);
    const [assignedManager, setAssignedManager] = useState<string>("null");
    const [assignees, setAssignees] = useState<any>(null);
    
    const [ports, setPorts] = useState<any>(null);
    const [products, setProducts] = useState<any>(null);
    //let { id } = useParams();
    const { instance, accounts } = useMsal();
    const account = useAccount(accounts[0] || {});
    
    const context = useAuthorizedBackendApi();
    
    const handleChangeCargoType = (event: { target: { value: string } }) => {
        setCargoType(event.target.value);
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
    
    useEffect(() => {
        getPorts();
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
        if (phone !== "" && email !== "" && arrivalPort !== null && departurePort !== null) {
            if (email === "" || email !== "" && validMail(email)) {
                setLoad(true);
                // console.log(tags.map((elm: any) => elm.productName).join(','));
                var myHeaders = new Headers();
                myHeaders.append('Accept', '');
                myHeaders.append("Content-Type", "application/json");
                fetch(protectedResources.apiLisQuotes.endPoint+"/Request", {
                    method: "POST",
                    body: JSON.stringify({ 
                        email: email,
                        whatsapp: phone,
                        departure: departurePort.portName+', '+departurePort.country,
                        arrival: arrivalPort.portName+', '+arrivalPort.country,
                        cargoType: Number(cargoType),
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
            <Box py={4}>
                <Typography variant="h5" mt={3} px={5}><b>Create a new request</b></Typography>
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
                            <InputLabel htmlFor="departure" sx={inputLabelStyles}>Where do you want us to pickup your products?</InputLabel>
                            {/* <AutocompleteSearch id="departure" value={departurePort} onChange={(e: any) => { setDepartureTown(convertStringToObject(e.target.innerText)); setDeparture(e.target.innerText); }} fullWidth /> */}
                            {
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
                                    renderInput={(params) => <TextField {...params} />}
                                    onChange={(e: any, value: any) => { setDepartureTown(value); }}
                                    fullWidth
                                /> : <Skeleton />
                            }
                        </Grid>
                        <Grid item xs={12} md={6} mt={1}>
                            <InputLabel htmlFor="arrival" sx={inputLabelStyles}>Where do you want to transport your products?</InputLabel>
                            {/* <AutocompleteSearch id="arrival" value={arrivalPort} onChange={(e: any) => { setArrivalTown(convertStringToObject(e.target.innerText)); setArrival(e.target.innerText); }} fullWidth /> */}
                            {
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
                                    renderInput={(params) => <TextField {...params} />}
                                    onChange={(e: any, value: any) => { setArrivalTown(value); }}
                                    fullWidth
                                /> : <Skeleton />
                            }
                        </Grid>
                        <Grid item xs={12} md={6} mt={1}>
                            <InputLabel htmlFor="cargo-type" sx={inputLabelStyles}>In what type of cargo do you want to transport your goods?</InputLabel>
                            <NativeSelect
                                id="demo-customized-select-native"
                                value={cargoType}
                                onChange={handleChangeCargoType}
                                input={<BootstrapInput />}
                                fullWidth
                            >
                                <option value="0">Container</option>
                                <option value="1">Conventional</option>
                                <option value="2">Roll-on/Roll-off</option>
                            </NativeSelect>
                        </Grid>
                        <Grid item xs={12} md={6} mt={1}>
                            <InputLabel htmlFor="quantity" sx={inputLabelStyles}>How many units of cargo do you want to transport?</InputLabel>
                            <BootstrapInput id="quantity" type="number" inputProps={{ min: 0, max: 100 }} value={quantity} onChange={(e: any) => {console.log(e); setQuantity(e.target.value)}} fullWidth />
                        </Grid>
                        <Grid item xs={12} mt={1} mb={1}>
                            <InputLabel htmlFor="tags" sx={inputLabelStyles}>Tags</InputLabel>
                            {/* <MuiChipsInput 
                                id="tags" 
                                placeholder="Type some key words of your request" 
                                value={tags} variant="outlined" 
                                onChange={(elm: MuiChipsInputChip[]) => { setTags(elm); }} 
                                fullWidth 
                                sx={{ 
                                    mt: 1,
                                    borderRadius: 4,
                                    '& .MuiInputBase-root input': {
                                        border: '1px solid #ced4da',
                                        padding: '10.5px 16px'
                                    },
                                    '& input': {
                                        position: 'relative',
                                        backgroundColor: '#fcfcfb',
                                        fontSize: 16,
                                        fontFamily: ['-apple-system','BlinkMacSystemFont','"Segoe UI"','Roboto','"Helvetica Neue"','Arial','sans-serif','"Apple Color Emoji"','"Segoe UI Emoji"','"Segoe UI Symbol"',].join(','),
                                    }, 
                                }} 
                                renderChip={(Component, key, props) => {
                                    return <Component {...props} key={key} sx={{ mt: .75 }} />
                                }}
                            /> */}
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
                                    renderInput={(params) => <TextField {...params} sx={{ textTransform: "lowercase" }} />}
                                    onChange={(e: any, value: any) => { setTags(value); }}
                                    fullWidth
                                /> : <Skeleton />
                            }
                        </Grid>
                        <Grid item xs={6} mt={.5}>
                            <InputLabel htmlFor="request-message" sx={inputLabelStyles}>Other details about your need (Optional)</InputLabel>
                            <BootstrapInput id="request-message" type="text" multiline rows={3.5} value={message} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setMessage(e.target.value)} fullWidth />
                        </Grid>
                        <Grid item xs={6} mt={1}>
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
