import { Alert, Box, Button, Grid, InputLabel, NativeSelect, Typography } from '@mui/material';
import { MuiTelInput } from 'mui-tel-input';
import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import '../../App.css';
import AutocompleteSearch from '../shared/AutocompleteSearch';
import { inputLabelStyles, BootstrapInput } from '../../misc/styles';
import axios from 'axios';
import { enqueueSnackbar } from 'notistack';

let statusTypes = ["EnAttente", "Valider", "Rejeter"];
let cargoTypes = ["Container", "Conventional", "RollOnRollOff"];

function convertStringToObject(str: string): { city: string, country: string } {
    const [city, ...countryArr] = str.split(', ');
    const country = countryArr.join(', ');
    return { city, country };
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
    
    const handleChangeCargoType = (event: { target: { value: string } }) => {
        setCargoType(event.target.value);
    };

    useEffect(() => {
        setLoad(true)
        fetch("https://localhost:7089/api/Request/"+id)
        .then((response) => response.json())
        .then((data) => {
            console.log(data);
            if(data.code === 200) {
                setEmail(data.data.email);
                setPhone(data.data.whatsapp);
                setDeparture(data.data.departure);
                setArrival(data.data.arrival);
                setDepartureTown(convertStringToObject(data.data.departure));
                setArrivalTown(convertStringToObject(data.data.arrival));
                setStatus(data.data.status);
                setCargoType(String(cargoTypes.indexOf(data.data.cargoType)));
                setQuantity(data.data.quantity);
                setMessage(data.data.detail);
                setLoad(false);
            }
            else {
                setLoad(false);
            }
        });
    }, []);
    
    function validateRequest() {
        var myHeaders = new Headers();
        myHeaders.append("Accept", "*/");
        myHeaders.append("Content-Type", "application/json");
        fetch("https://localhost:7089/api/Request", {
            method: "PUT",
            body: JSON.stringify({ id: id, status: 1, whatsapp: phone, email: email, departure: departure, arrival: arrival, cargoType: 0, quantity: quantity, detail: message }),
            headers: myHeaders
        }).then((data: any) => {
            enqueueSnackbar("data.MessageSuccess", { variant: "success", anchorOrigin: { horizontal: "right", vertical: "top"} });
        }).catch(error => { 
            setLoad(false);
            enqueueSnackbar("data.MessageError", { variant: "error", anchorOrigin: { horizontal: "right", vertical: "top"} });    
        });
    }

    function rejectRequest() {
        var myHeaders = new Headers();
        myHeaders.append("Accept", "*/");
        myHeaders.append("Content-Type", "application/json");
        fetch("https://localhost:7089/api/Request", {
            method: "PUT",
            body: JSON.stringify({ id: id, status: 2, whatsapp: phone, email: email, departure: departure, arrival: arrival, cargoType: 0, quantity: quantity, detail: message }),
            headers: myHeaders
        }).then((data: any) => {
            enqueueSnackbar("data.MessageSuccess", { variant: "success", anchorOrigin: { horizontal: "right", vertical: "top"} });
        }).catch(error => { 
            setLoad(false);
            enqueueSnackbar("data.MessageError", { variant: "error", anchorOrigin: { horizontal: "right", vertical: "top"} });    
        });
    }
    
    return (
        <div style={{ background: "#fff", borderTopLeftRadius: 20, borderTopRightRadius: 20 }}>
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
                            </Grid><Grid item xs={6}>
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
                        </Grid>: null
                    }
                </Box>
            </Box>
        </div>
    );
}

export default Request;
