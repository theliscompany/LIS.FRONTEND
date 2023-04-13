import { Alert, Box, Button, Grid, InputLabel, NativeSelect, Skeleton, Typography } from '@mui/material';
import { MuiTelInput } from 'mui-tel-input';
import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import '../../App.css';
import AutocompleteSearch from '../shared/AutocompleteSearch';
import { inputLabelStyles, BootstrapInput } from '../../misc/styles';
import { enqueueSnackbar, SnackbarProvider } from 'notistack';
import { protectedResources } from '../../authConfig';
import { useAuthorizedBackendApi } from '../../api/api';
import { BackendService } from '../../services/fetch';

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

function Request(props: any) {
    const [load, setLoad] = React.useState<boolean>(true);
    const [email, setEmail] = React.useState<string>("");
    const [status, setStatus] = React.useState<string | null>(null);
    const [phone, setPhone] = React.useState<string>("");
    const [message, setMessage] = React.useState<string>("");
    const [quantity, setQuantity] = React.useState<number>(1);
    const [cargoType, setCargoType] = React.useState<string>("0");
    const [departureTown, setDepartureTown] = React.useState<any>(null);
    const [arrivalTown, setArrivalTown] = React.useState<any>(null);
    const [departure, setDeparture] = React.useState<string>("");
    const [arrival, setArrival] = React.useState<string>("");
    let { id } = useParams();

    const context = useAuthorizedBackendApi();
    
    const handleChangeCargoType = (event: { target: { value: string } }) => {
        setCargoType(event.target.value);
    };

    useEffect(() => {
        loadRequest();
    }, [context]);
    
    const loadRequest = async () => {
        if (context) {
            setLoad(true);
            const response:any = await (context as BackendService<any>).getSingle(protectedResources.apiLisQuotes.endPoint+"/Request/"+id);
            if (response !== null && response.code !== undefined) {
                if (response.code === 200) {
                    setEmail(response.data.email);
                    setPhone(response.data.whatsapp);
                    setDeparture(response.data.departure);
                    setArrival(response.data.arrival);
                    setDepartureTown(convertStringToObject(response.data.departure));
                    setArrivalTown(convertStringToObject(response.data.arrival));
                    setStatus(response.data.status);
                    setCargoType(String(cargoTypes.indexOf(response.data.cargoType)));
                    setQuantity(response.data.quantity);
                    setMessage(response.data.detail);
                    setLoad(false);
                }
                else {
                    setLoad(false);
                }
            }  
        }
    }
    
    const validateRequest = async () => {
        if(context) {
            const body:any = {
                id: id,
                status: 1,
                whatsapp: phone,
                email: email,
                departure: departure,
                arrival: arrival,
                cargoType: 0,
                quantity: quantity,
                detail: message
            };

            const data = await (context as BackendService<any>).put(protectedResources.apiLisQuotes.endPoint+"/Request/"+id, body);
            if (data?.status === 200) {
                enqueueSnackbar("data.MessageSuccess", { variant: "success", anchorOrigin: { horizontal: "right", vertical: "top"} });
            }
            else {
                enqueueSnackbar("data.MessageError", { variant: "error", anchorOrigin: { horizontal: "right", vertical: "top"} });
            }
        }
    }

    const rejectRequest = async () => {
        if(context) {
            const body:any = {
                id: id,
                status: 2,
                whatsapp: phone,
                email: email,
                departure: departure,
                arrival: arrival,
                cargoType: 0,
                quantity: quantity,
                detail: message
            };

            const data = await (context as BackendService<any>).put(protectedResources.apiLisQuotes.endPoint+"/Request/"+id, body);
            if (data?.status === 200) {
                enqueueSnackbar("data.MessageSuccess", { variant: "success", anchorOrigin: { horizontal: "right", vertical: "top"} });
            }
            else {
                enqueueSnackbar("data.MessageError", { variant: "error", anchorOrigin: { horizontal: "right", vertical: "top"} });
            }
        }
    }
    
    return (
        <div style={{ background: "#fff", borderTopLeftRadius: 20, borderTopRightRadius: 20 }}>
            <SnackbarProvider />
            <Box py={4}>
                <Typography variant="h5" mt={3} mx={5}><b>Manage a request for quote N° {id}</b></Typography>
                <Box py={4}>
                    {
                        !load ? 
                        <Grid container spacing={2} mt={1} px={5}>
                            <Grid item xs={12}>
                                <Alert 
                                    severity="info" 
                                    sx={{ display: "flex", alignItems: "center", justifyContent: "left" }}
                                    action={<Button variant="contained" color="inherit" sx={{ background: "#fff", color: "#333", float: "right", textTransform: "none" }}>Ask for more informations</Button>}
                                >
                                    <Typography variant="subtitle1" display="inline">Do you think this request need more informations?</Typography>
                                </Alert>
                            </Grid>
                            <Grid item xs={6}>
                                <InputLabel htmlFor="whatsapp-phone-number" sx={inputLabelStyles}>Whatsapp number</InputLabel>
                                <MuiTelInput id="whatsapp-phone-number" value={phone} onChange={setPhone} defaultCountry="CM" preferredCountries={["CM", "BE", "KE"]} sx={{ mt: 1, paddingLeft: "4px" }} fullWidth disabled={status === "Valider"} />
                            </Grid>
                            <Grid item xs={6}>
                                <InputLabel htmlFor="request-email" sx={inputLabelStyles}>Email</InputLabel>
                                <BootstrapInput id="request-email" type="email" value={email} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)} fullWidth disabled />
                            </Grid>
                            <Grid item xs={6}>
                                <InputLabel htmlFor="departure" sx={inputLabelStyles}>City and country of departure of the goods</InputLabel>
                                <AutocompleteSearch id="departure" value={departureTown} onChange={(e: any) => { setDepartureTown(convertStringToObject(e.target.innerText)); setDeparture(e.target.innerText); }} fullWidth disabled={status === "Valider"} />
                            </Grid>
                            <Grid item xs={6}>
                                <InputLabel htmlFor="arrival" sx={inputLabelStyles}>City and country of arrival of the goods</InputLabel>
                                <AutocompleteSearch id="arrival" value={arrivalTown} onChange={(e: any) => { setArrivalTown(convertStringToObject(e.target.innerText)); setArrival(e.target.innerText); }} fullWidth disabled={status === "Valider"} />
                            </Grid>
                            <Grid item xs={6}>
                                <InputLabel htmlFor="cargo-type" sx={inputLabelStyles}>Type of cargo</InputLabel>
                                <NativeSelect
                                    id="demo-customized-select-native"
                                    value={cargoType}
                                    onChange={handleChangeCargoType}
                                    input={<BootstrapInput />}
                                    fullWidth
                                    disabled={status === "Valider"}
                                >
                                    <option value="0">Container</option>
                                    <option value="1">Conventional</option>
                                    <option value="2">Roll-on/Roll-off</option>
                                </NativeSelect>
                            </Grid>
                            <Grid item xs={6}>
                                <InputLabel htmlFor="quantity" sx={inputLabelStyles}>Quantity</InputLabel>
                                <BootstrapInput id="quantity" type="number" inputProps={{ min: 0, max: 100 }} value={quantity} onChange={(e: any) => {console.log(e); setQuantity(e.target.value)}} fullWidth disabled={status === "Valider"} />
                            </Grid>
                            <Grid item xs={12} mt={1}>
                                <InputLabel htmlFor="request-message" sx={inputLabelStyles}>Other details about your need (Optional)</InputLabel>
                                <BootstrapInput id="request-message" type="text" multiline rows={3} value={message} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setMessage(e.target.value)} fullWidth disabled={status === "Valider"} />
                            </Grid>
                            <Grid item xs={12}>
                                <Button variant="contained" color="primary" sx={{ mt: 2, mr: 2, textTransform: "none" }} onClick={validateRequest} >Validate</Button>
                                <Button variant="contained" color="inherit" sx={{ background: "#fff", color: "#333", mt: 2, textTransform: "none" }} onClick={rejectRequest} >Reject</Button>
                            </Grid>
                        </Grid> : <Skeleton sx={{ mx: 5, mt: 3 }} />
                    }
                </Box>
            </Box>
        </div>
    );
}

export default Request;
