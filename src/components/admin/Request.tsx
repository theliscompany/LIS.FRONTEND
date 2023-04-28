import { Alert, Box, Button, DialogActions, DialogContent, Grid, InputLabel, NativeSelect, Skeleton, Typography } from '@mui/material';
import { MuiTelInput } from 'mui-tel-input';
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import '../../App.css';
import AutocompleteSearch from '../shared/AutocompleteSearch';
import { inputLabelStyles, BootstrapInput, BootstrapDialogTitle, BootstrapDialog, buttonCloseStyles } from '../../misc/styles';
import { enqueueSnackbar, SnackbarProvider } from 'notistack';
import { protectedResources } from '../../authConfig';
import { useAuthorizedBackendApi } from '../../api/api';
import { BackendService, FileResponse } from '../../services/fetch';
import { MuiChipsInput, MuiChipsInputChip } from 'mui-chips-input';
import { MailData, RequestDto, RequestResponseDto } from '../../models/models';

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
    const [load, setLoad] = useState<boolean>(true);
    const [email, setEmail] = useState<string>("");
    const [status, setStatus] = useState<string | null>(null);
    const [phone, setPhone] = useState<string>("");
    const [message, setMessage] = useState<string>("");
    const [quantity, setQuantity] = useState<number>(1);
    const [cargoType, setCargoType] = useState<string>("0");
    const [departureTown, setDepartureTown] = useState<any>(null);
    const [arrivalTown, setArrivalTown] = useState<any>(null);
    const [departure, setDeparture] = useState<string>("");
    const [arrival, setArrival] = useState<string>("");
    const [tags, setTags] = useState<MuiChipsInputChip[]>([]);
    const [modal, setModal] = useState<boolean>(false);
    const [mailSubject, setMailSubject] = useState<string>("");
    const [mailContent, setMailContent] = useState<string>("");
    let { id } = useParams();

    const context = useAuthorizedBackendApi();
    
    const handleChangeCargoType = (event: { target: { value: string } }) => {
        setCargoType(event.target.value);
    };

    useEffect(() => {
        loadRequest();
    }, [context]);
    
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

    function sendEmail() {
        if (mailSubject !== "" || mailContent !== "") {
            var content = "<body style=\"font-family: Arial, sans-serif; font-size: 14px; color: #333;\">\r\n\t<div style=\"background-color: #f2f2f2; padding: 20px;\">\r\n\t\t<p style=\"margin-bottom: 20px;\">"+ mailContent +"</p>\r\n\t\t<p style=\"margin-top: 20px;\">Please, click the button up to track your request.</p>\r\n\t<a href=\"https://lisquotes-ui.azurewebsites.net/tracking\" style=\"display: inline-block; background-color: #008089; color: #fff; padding: 10px 20px; text-decoration: none;\">Tracking</a>\r\n\t\t</div>\r\n</body>";
            //var content = "<body style=\"font-family: Arial, sans-serif; font-size: 14px; color: #333;\">\r\n\t<div style=\"background-color: #f2f2f2; padding: 20px;\">\r\n\t\t<p style=\"margin-bottom: 20px;\">"+ mailContent +"</p>\r\n\t\t</div>\r\n</body>";
            postEmail("cyrille.penaye@omnifreight.eu", email, mailSubject, content);
        }
        else {
            enqueueSnackbar("The subject and/or content fields are empty, please fill them.", { variant: "error", anchorOrigin: { horizontal: "right", vertical: "top"} });
        }
    }
      
    const loadRequest = async () => {
        if (context) {
            setLoad(true);
            const response = await (context as BackendService<any>).getSingle(protectedResources.apiLisQuotes.endPoint+"/Request/"+id);
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
                    setTags(response.data.tags !== null ? response.data.tags.split(",") : []);
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
            const body: RequestDto = {
                id: Number(id),
                status: 1,
                whatsapp: phone,
                email: email,
                departure: departure,
                arrival: arrival,
                cargoType: 0,
                quantity: quantity,
                detail: message,
                tags: tags.length !== 0 ? tags.join(",") : null
            };

            const data = await (context as BackendService<any>).put(protectedResources.apiLisQuotes.endPoint+"/Request/"+id, body);
            if (data?.status === 200) {
                enqueueSnackbar("Your request has been validated with success.", { variant: "success", anchorOrigin: { horizontal: "right", vertical: "top"} });
            }
            else {
                enqueueSnackbar("An error happened during the validation.", { variant: "error", anchorOrigin: { horizontal: "right", vertical: "top"} });
            }
        }
    }

    const rejectRequest = async () => {
        if(context) {
            const body: RequestDto = {
                id: Number(id),
                status: 1,
                whatsapp: phone,
                email: email,
                departure: departure,
                arrival: arrival,
                cargoType: 0,
                quantity: quantity,
                detail: message,
                tags: tags.length !== 0 ? tags.join(",") : null
            };

            const data = await (context as BackendService<any>).put(protectedResources.apiLisQuotes.endPoint+"/Request/"+id, body);
            if (data?.status === 200) {
                enqueueSnackbar("Your request has been rejected with success.", { variant: "success", anchorOrigin: { horizontal: "right", vertical: "top"} });
            }
            else {
                enqueueSnackbar("An error happened during the rejection.", { variant: "error", anchorOrigin: { horizontal: "right", vertical: "top"} });
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
                                    action={<Button variant="contained" color="inherit" sx={{ background: "#fff", color: "#333", float: "right", textTransform: "none", position: "relative", bottom: "2px" }} onClick={() => { setModal(true); }}>Ask for more informations</Button>}
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
                                <InputLabel htmlFor="tags" sx={inputLabelStyles}>Tags</InputLabel>
                                <MuiChipsInput 
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
                                />
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

            <BootstrapDialog
                onClose={() => setModal(false)}
                aria-labelledby="custom-dialog-title"
                open={modal}
                maxWidth="md"
                fullWidth
            >
                <BootstrapDialogTitle id="custom-dialog-title" onClose={() => setModal(false)}>
                    <b>Request quote</b>
                </BootstrapDialogTitle>
                <DialogContent dividers>
                    <Typography variant="subtitle1" gutterBottom px={2}>
                        Please fill in the form and click the button to send a request for a quote.
                    </Typography>
                    <Grid container spacing={2} mt={1} px={2}>
                        <Grid item xs={12}>
                            <InputLabel htmlFor="mail-subject" sx={inputLabelStyles}>Subject</InputLabel>
                            <BootstrapInput id="mail-subject" type="text" inputProps={{ min: 0, max: 100 }} value={mailSubject} onChange={(e: any) => {console.log(e); setMailSubject(e.target.value)}} fullWidth />
                        </Grid>
                        <Grid item xs={12} mt={1}>
                            <InputLabel htmlFor="mail-content" sx={inputLabelStyles}>Content</InputLabel>
                            <BootstrapInput id="mail-content" type="text" multiline rows={4} value={mailContent} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setMailContent(e.target.value)} fullWidth />
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions>
                    <Button variant="contained" color={!load ? "primary" : "info"} className="mr-3" onClick={() => { sendEmail(); }} disabled={load === true} sx={{ textTransform: "none" }}>Send</Button>
                    <Button variant="contained" onClick={() => setModal(false)} sx={buttonCloseStyles}>Close</Button>
                </DialogActions>
            </BootstrapDialog>
        </div>
    );
}

export default Request;
