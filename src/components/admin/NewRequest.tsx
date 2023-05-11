import { Alert, Box, Button, Grid, InputLabel, NativeSelect, Skeleton, Typography } from '@mui/material';
import { MuiTelInput } from 'mui-tel-input';
import React, { useEffect, useState } from 'react';
import '../../App.css';
import AutocompleteSearch from '../shared/AutocompleteSearch';
import { inputLabelStyles, BootstrapInput, whiteButtonStyles } from '../../misc/styles';
import { enqueueSnackbar, SnackbarProvider } from 'notistack';
import { protectedResources } from '../../authConfig';
import { useAuthorizedBackendApi } from '../../api/api';
import { BackendService } from '../../services/fetch';
import { MuiChipsInput, MuiChipsInputChip } from 'mui-chips-input';
import { MailData } from '../../models/models';
import { useAccount, useMsal } from '@azure/msal-react';
import { Link } from 'react-router-dom';

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
    const [departureTown, setDepartureTown] = useState<any>(null);
    const [arrivalTown, setArrivalTown] = useState<any>(null);
    const [departure, setDeparture] = useState<string>("");
    const [arrival, setArrival] = useState<string>("");
    const [tags, setTags] = useState<MuiChipsInputChip[]>([]);
    const [modal, setModal] = useState<boolean>(false);
    const [mailSubject, setMailSubject] = useState<string>("");
    const [mailContent, setMailContent] = useState<string>("");
    const [currentUser, setCurrentUser] = useState<any>(null);
    const [assignedManager, setAssignedManager] = useState<string>("null");
    const [assignees, setAssignees] = useState<any>(null);
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
    
    useEffect(() => {
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
      
    function sendQuotationForm() {
        if (phone !== "" && email !== "" && arrival !== "" && departure !== "") {
            if (email === "" || email !== "" && validMail(email)) {
                setLoad(true);
                var myHeaders = new Headers();
                myHeaders.append('Accept', '');
                myHeaders.append("Content-Type", "application/json");
                fetch(protectedResources.apiLisQuotes.endPoint+"/Request", {
                    method: "POST",
                    body: JSON.stringify({ Whatsapp: phone, Email: email, Departure: departure, Arrival: arrival, CargoType: Number(cargoType), Quantity: quantity, Detail: message, Tags: tags.join(",") }),
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
                        <Grid item xs={6}>
                            <InputLabel htmlFor="whatsapp-phone-number" sx={inputLabelStyles}>Whatsapp number</InputLabel>
                            <MuiTelInput id="whatsapp-phone-number" value={phone} onChange={setPhone} defaultCountry="CM" preferredCountries={["CM", "BE", "KE"]} fullWidth sx={{ mt: 1 }} />
                        </Grid>
                        <Grid item xs={6}>
                            <InputLabel htmlFor="request-email" sx={inputLabelStyles}>Email</InputLabel>
                            <BootstrapInput id="request-email" type="email" value={email} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)} fullWidth />
                        </Grid>
                        <Grid item xs={6}>
                            <InputLabel htmlFor="departure" sx={inputLabelStyles}>City and country of departure of the goods</InputLabel>
                            <AutocompleteSearch id="departure" value={departureTown} onChange={(e: any) => { setDepartureTown(convertStringToObject(e.target.innerText)); setDeparture(e.target.innerText); }} fullWidth />
                        </Grid>
                        <Grid item xs={6}>
                            <InputLabel htmlFor="arrival" sx={inputLabelStyles}>City and country of arrival of the goods</InputLabel>
                            <AutocompleteSearch id="arrival" value={arrivalTown} onChange={(e: any) => { setArrivalTown(convertStringToObject(e.target.innerText)); setArrival(e.target.innerText); }} fullWidth />
                        </Grid>
                        <Grid item xs={6}>
                            <InputLabel htmlFor="cargo-type" sx={inputLabelStyles}>Type of cargo</InputLabel>
                            <NativeSelect
                                id="cargo-type"
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
                        <Grid item xs={6}>
                            <InputLabel htmlFor="quantity" sx={inputLabelStyles}>Quantity</InputLabel>
                            <BootstrapInput id="quantity" type="number" inputProps={{ min: 0, max: 100 }} value={quantity} onChange={(e: any) => {console.log(e); setQuantity(e.target.value)}} fullWidth />
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
                            <BootstrapInput id="request-message" type="text" multiline rows={3} value={message} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setMessage(e.target.value)} fullWidth />
                        </Grid>
                        <Grid item xs={6}>
                            {
                                !loadUser ? 
                                currentUser !== null && currentUser !== undefined ? 
                                <Alert severity="info" sx={{ my: 2 }}>This new request will be assigned to the current user {account?.name} by default.</Alert> : 
                                <Alert severity="warning" sx={{ my: 2 }}>This new request will not be assigned to the current user, you need to grant him the permission in <Link to="/admin/users" style={{ textDecoration: "none" }}>Users</Link>.</Alert>
                                : <Skeleton sx={{ my: 2 }} />
                            }            
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
                                        /*disabled={status === "Valider"}*/
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
