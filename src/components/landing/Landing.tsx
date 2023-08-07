import React, { useEffect, useState } from 'react';
import { Alert, Autocomplete, Box, Button, Card, CardActions, CardContent, Checkbox, DialogActions, DialogContent, DialogTitle, Fab, Grid, IconButton, InputLabel, ListItemText, MenuItem, NativeSelect, Popover, Select, SelectChangeEvent, Skeleton, TextField, Typography } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import FaceIcon from '@mui/icons-material/Face';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import { bottomStyles, cardStyles, buttonStyles, buttonCloseStyles, inputLabelStyles, cardTextStyles, BootstrapInput, BootstrapDialog, BootstrapDialogTitle } from '../../misc/styles';
import '../../App.css';
// @ts-ignore
import { CookieBanner } from '@palmabit/react-cookie-law';
import ReCAPTCHA from "react-google-recaptcha";
import { MuiTelInput } from 'mui-tel-input';
import { MuiChipsInput, MuiChipsInputChip } from 'mui-chips-input';
import { SnackbarProvider, enqueueSnackbar } from 'notistack';
import AutocompleteSearch from '../shared/AutocompleteSearch';
import { useIsAuthenticated, useMsal } from '@azure/msal-react';
import Testimonies from './Testimonies';
import Footer from './Footer';
import { loginRequest, protectedResources } from '../../authConfig';
import { BackendService } from '../../services/fetch';
import { useAuthorizedBackendApi } from '../../api/api';
import { DialogTitleProps, MailData } from '../../models/models';
// import { AuthenticationResult } from '@azure/msal-browser';

function Landing() {
    const isAuthenticated = useIsAuthenticated();
    const [modal, setModal] = useState<boolean>(false);
    const [modal2, setModal2] = useState<boolean>(false);
    const [modal3, setModal3] = useState<boolean>(false);
    const [modal4, setModal4] = useState<boolean>(false);
    const [load, setLoad] = useState<boolean>(false);
    const [email, setEmail] = useState<string>("");
    const [captcha, setCaptcha] = useState<string | null>(null);
    const [phone, setPhone] = useState<string>("");
    const [message, setMessage] = useState<string>("");
    const [subjects, setSubjects] = useState<string[]>([]);
    const [quantity, setQuantity] = useState<number>(1);
    const [cargoType, setCargoType] = useState<string>("0");
    const [packingType, setPackingType] = useState<string>("FCL");
    const [departurePort, setDeparturePort] = useState<any>({portId: 1, portName: "ANTWERP", country: "Belgium"});
    const [arrivalPort, setArrivalPort] = useState<any>({portId: 2, portName: "DOUALA", country: "Cameroon"});
    const [departure, setDeparture] = useState<string>("Antwerp, Belgium");
    const [arrival, setArrival] = useState<string>("Douala, Cameroon");
    // const [tags, setTags] = useState<MuiChipsInputChip[]>([]);
    const [tags, setTags] = useState<any>([]);
    const [ports, setPorts] = useState<any>(null);
    const [products, setProducts] = useState<any>(null);
    const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);
    
    const { instance } = useMsal();
    const context = useAuthorizedBackendApi();
    // const account = useAccount(accounts[0] || {});
    // const [accessToken, setAccessToken] = React.useState<string>();
    
    const handleLogin = () => {
        instance.loginRedirect(loginRequest);
    }
    
    const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    const open = Boolean(anchorEl);
    const id = open ? 'simple-popover' : undefined;
    
    const handleChangeSubject = (event: SelectChangeEvent<typeof subjects>) => {
        const {
           target: { value },
        } = event;
        setSubjects(
            // On autofill we get a stringified value.
            typeof value === 'string' ? value.split(',') : value,
        );
    };

    const handleChangePackingType = (event: { target: { value: string } }) => {
        setCargoType(event.target.value);
    };
    
    const handleChangeCargoType = (event: { target: { value: string } }) => {
        setCargoType(event.target.value);
    };
    
    function onChangeCaptcha(value: any) {
        //console.log("Captcha value:", value);
        setCaptcha(value);
    }

    useEffect(() => {
        getPorts();
        getProducts();
    }, []);
    
    const getPorts = async () => {
        try {
            const response = await fetch(protectedResources.apiLisTransport.endPoint+"/Port/Ports");
            if (!response.ok) {
              throw new Error('Network response was not ok');
            }
            const data = await response.json();
            setPorts(data);
        } catch (error) {
            console.error('Error fetching data:', error);
        }
    }
    
    const getProducts = async () => {
        try {
            const response = await fetch(protectedResources.apiLisTransport.endPoint+"/Product/Products");
            if (!response.ok) {
              throw new Error('Network response was not ok');
            }
            const data = await response.json();
            setProducts(data);
        } catch (error) {
            console.error('Error fetching data:', error);
        }
    }
    
    function validMail(mail: string) {
        return /^(([^<>()\[\]\.,;:\s@\"]+(\.[^<>()\[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()\.,;\s@\"]+\.{0,1})+([^<>()\.,;:\s@\"]{2,}|[\d\.]+))$/.test(mail);
    }
  
    const postEmail = async(from: string, to: string, subject: string, htmlContent: string) => {
        const body: MailData = { from: from, to: to, subject: subject, htmlContent: htmlContent };
        const data = await (context as BackendService<any>).postForm(protectedResources.apiLisQuotes.endPoint+"/Email", body);
        console.log(data);
        if (data?.status === 200) {
            enqueueSnackbar("The document has been sent to your email.", { variant: "success", anchorOrigin: { horizontal: "right", vertical: "top"} });
        }
        else {
            enqueueSnackbar("An error occured. Please refresh the page or check your internet connection.", { variant: "error", anchorOrigin: { horizontal: "right", vertical: "top"} });
        }
    }
      
    function sendContactFormRedirect() {
        if (captcha !== null) {
            if (phone !== "" || email !== "") {
                if (email === "" || email !== "" && validMail(email)) {
                    setLoad(true);
                    var myHeaders = new Headers();
                    myHeaders.append("Accept", "*/");
                    myHeaders.append("Content-Type", "application/json");
                    fetch("https://omnifreightinfo.azurewebsites.net/api/QuotationBasic", {
                        method: "POST",
                        body: JSON.stringify({ phoneNumber: phone, email: email, goodsType: "" }),
                        headers: myHeaders
                    }).then((data: any) => {
                        setPhone("");
                        setEmail("")
                        setLoad(false);
                        // download("/assets/omnifreight_flyer.pdf", "Flyer Omnifreight.pdf");
                        // Here i should send the email to the file
                        var content = "<body style=\"font-family: Arial, sans-serif; font-size: 14px; color: #333;\">\r\n\t<div style=\"background-color: #f2f2f2; padding: 20px;\">\r\n\t\t<h1 style=\"color: #000; margin-bottom: 20px;\">Download the flyer</h1>\r\n\t\t<p style=\"margin-bottom: 20px;\">We have sent you the flyer.</p>\r\n\t\t<a href=\"https://lisquotes-ui.azurewebsites.net/assets/omnifreight_flyer.pdf\" style=\"display: inline-block; background-color: #008089; color: #fff; padding: 10px 20px; text-decoration: none;\">Download</a>\r\n\t\t<p style=\"margin-top: 20px;\">Please, click the button up to download the document.</p>\r\n\t</div>\r\n</body>";
                        postEmail("cyrille.penaye@omnifreight.eu", email, "You received the flyer", content);
                    }).catch(error => { 
                        setLoad(false);
                        enqueueSnackbar("An error occured. Please refresh the page or check your internet connection.", { variant: "error", anchorOrigin: { horizontal: "right", vertical: "top"} });    
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
        else {
            enqueueSnackbar("You must check the captcha before sending your request.", { variant: "info", anchorOrigin: { horizontal: "right", vertical: "top"} });
        }
    }

    function sendContactForm() {
        if (captcha !== null) {
            if (phone !== "" || email !== "") {
                if (email === "" || email !== "" && validMail(email)) {
                    var msg = "I want infos about : " + subjects.toString();
                    console.log(msg);
                    setLoad(true);
                    var myHeaders = new Headers();
                    myHeaders.append("Accept", "*/");
                    myHeaders.append("Content-Type", "application/json");
                    fetch("https://omnifreightinfo.azurewebsites.net/api/QuotationBasic", {
                        method: "POST",
                        body: JSON.stringify({ phoneNumber: phone, email: email, goodsType: msg+message }),
                        headers: myHeaders
                    }).then((data: any) => {
                        setLoad(false);
                        setPhone("");
                        setEmail("");
                        setSubjects([]);
                        setMessage("");
                        enqueueSnackbar("Thanks, we have received your informations.", { variant: "success", anchorOrigin: { horizontal: "right", vertical: "top"} });
                    }).catch(error => { 
                        setLoad(false);
                        enqueueSnackbar("An error occured. Please refresh the page or check your internet connection.", { variant: "error", anchorOrigin: { horizontal: "right", vertical: "top"} });
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
        else {
            enqueueSnackbar("You must check the captcha before sending your request.", { variant: "info", anchorOrigin: { horizontal: "right", vertical: "top"} });
        }
    }

    function sendQuotationForm() {
        if (captcha !== null) {
                if ((phone !== "" && arrivalPort !== null && departurePort !== null) || (email !== "" && arrivalPort !== null && departurePort !== null)) {
                    if (email === "" || email !== "" && validMail(email)) {
                        setLoad(true);
                        var myHeaders = new Headers();
                        myHeaders.append('Accept', '');
                        myHeaders.append("Content-Type", "application/json");
                        fetch(protectedResources.apiLisQuotes.endPoint+"/Request", {
                            method: "POST",
                            body: JSON.stringify({ 
                                Whatsapp: phone, 
                                Email: email, 
                                Departure: departurePort.portName+', '+departurePort.country, 
                                Arrival: arrivalPort.portName+', '+arrivalPort.country, 
                                CargoType: 0,
                                PackingType: packingType,
                                Quantity: quantity, 
                                Detail: message, 
                                Tags: tags.length !== 0 ? tags.map((elm: any) => elm.productName).join(',') : null 
                            }),
                            headers: myHeaders
                        })
                        .then((response: any) => response.json())
                        .then((data: any) => {
                            setLoad(false);
                            if (data.code === 201) {
                                enqueueSnackbar("Your request has been sent with success.", { variant: "success", anchorOrigin: { horizontal: "right", vertical: "top"} });
                                setPhone("");
                                setEmail("");
                                setMessage("");
                                setModal(false);
                                setModal4(true);
                            }
                            else {
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
        else {
            enqueueSnackbar("You must check the captcha before sending your request.", { variant: "info", anchorOrigin: { horizontal: "right", vertical: "top"} });
        }
    }

    const defaultSubjects = [
        'Sea shipments',
        'Air shipments',
        'Become a reseller',
        'Job opportunities',
    ];

    
    return (
        <div className="App" style={{ overflowX: "hidden" }}>
            <CookieBanner
                message="This website uses cookies. By continuing to use this site, you agree to their use. For more details, please see our"
                policyLink="/privacy-policy"
                wholeDomain={true}
                acceptButtonText="I understood"
                privacyPolicyLinkText="privacy policy"
            />
            <SnackbarProvider />
            
            <Box sx={{ 
                background: "url('/assets/img/backimage.png') center center / cover no-repeat", 
                backgroundBlendMode: "overlay", backgroundColor: "rgba(0,0,0,0.75)", 
                height: { xs: "auto", md: "100vh" }, pb: { xs: 5, md: 1 } 
            }}>
                <Button 
                    variant="contained"
                    color="inherit" 
                    size="large"
                    href={!isAuthenticated ? undefined : "/admin/"}
                    sx={{ 
                        textTransform: "inherit",
                        backgroundColor: "#fff",
                        borderRadius: "20px",
                        position: "absolute",
                        top: { xs: "20px", md: "50px"},
                        right: { xs: "30px", md: "110px"}
                    }}
                    onClick={!isAuthenticated ? handleLogin : undefined}
                >
                    <FaceIcon sx={{ mr: 1 }} /> {!isAuthenticated ? "Login" : "Admin"}
                </Button>
                
                <Grid container px={1} sx={{ py: { xs: 2, md: 5 } }}>
                    <Grid item xs={12} md={12} sx={{ maxWidth: { xs: "280px", md: "915px" }, mt: 5, mb: 0, mx: "auto", backgroundColor: "#fff" }}>
                        <img src={"/assets/img/logo-omnifreight-big.png"} className="logo-front" alt="omnifreight pro" />
                    </Grid>
                </Grid>
                <Grid container px={1} sx={{ mb: { xs: 3, md: 5 } }}>
                    <Grid item xs={12} sx={{ maxWidth: { md: "840px" }, mx: { md: "auto" } }}>
                        <Typography variant="h3" color="#fff" sx={{ fontFamily: "PT Sans", fontSize: { xs: "1.35rem", md: "2.75rem" }, lineHeight: { xs: "30px", md: "60px" } }}>
                            We organize the shipment of your goods to Africa from all over the world!
                        </Typography>
                    </Grid>    
                </Grid>
                <Grid container sx={{ maxWidth: { md: "1300px" }, mx: { md: "auto" }, px: { xs: 1, md: 5 }, mt: { xs: 0, md: 5 }, pt: {xs: 0, md: 5} }}>
                    <Grid item xs={12} md={4} sx={{ mb: { xs: 2 } }}>
                        <Card sx={cardStyles}>
                            <CardContent>
                                <Typography sx={cardTextStyles} gutterBottom>
                                    « Would you like to receive a quotation for a shipment of goods? »
                                </Typography>
                            </CardContent>
                            <CardActions sx={bottomStyles}>
                                <Button sx={buttonStyles} size="medium" onClick={() => setModal(true)}>Request a quote</Button>
                            </CardActions>
                        </Card>
                    </Grid>
                    <Grid item xs={12} md={4} sx={{ mb: { xs: 2 } }}>
                        <Card sx={cardStyles}>
                            <CardContent>
                                <Typography sx={cardTextStyles} gutterBottom>
                                    « Would you like an Omnifreight manager to contact you? »
                                </Typography>
                            </CardContent>
                            <CardActions sx={bottomStyles}>
                                <Button size="medium" sx={buttonStyles} onClick={() => setModal2(true)}>Contact a manager</Button>
                            </CardActions>
                        </Card>
                    </Grid>
                    <Grid item xs={12} md={4} sx={{ mb: { xs: 2 } }}>
                        <Card sx={cardStyles}>
                            <CardContent>
                                <Typography sx={cardTextStyles} gutterBottom>
                                    « Want to see more information about Omnifreight? »
                                </Typography>
                            </CardContent>
                            <CardActions sx={bottomStyles}>
                                <Button size="medium" sx={buttonStyles} onClick={() => setModal3(true)}>Download our brochure</Button>
                            </CardActions>
                        </Card>
                    </Grid>
                </Grid>
            </Box>
            
            <Testimonies />
            <Footer />

            {/* <Fab aria-describedby={id} color="default" onClick={handleClick} sx={{ backgroundColor: "#fff", position: "fixed", right: "20px", bottom: "20px", width: "64px", height: "64px" }}>
                <WhatsAppIcon fontSize="large" sx={{ color: "#59CE72", width: "36px", height: "36px" }} />
            </Fab>
            <Popover
                id={id} 
                open={open} 
                anchorEl={anchorEl}
                onClose={handleClose}   
                anchorOrigin={{
                    vertical: 'top',
                    horizontal: 'right',
                }}
                transformOrigin={{
                    vertical: 'bottom',
                    horizontal: 'right',
                }}
            >
                <iframe title="whatsapp form" src="https://whatsform.com/dRTy_6"  width="100%" height="600" frameBorder="0"></iframe>
            </Popover>
            */}
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
                        It's ease, just fill in the form and click “continue” at the bottom right to send a request for a quote.
                    </Typography>
                    <Grid container spacing={2} mt={1} px={2}>
                        <Grid item xs={12} md={6}>
                            <InputLabel htmlFor="whatsapp-phone-number" sx={inputLabelStyles}>Whatsapp number</InputLabel>
                            <MuiTelInput id="whatsapp-phone-number" value={phone} onChange={setPhone} defaultCountry="CM" preferredCountries={["CM", "BE", "KE"]} fullWidth sx={{ mt: 1 }} />
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <InputLabel htmlFor="request-email" sx={inputLabelStyles}>Your email address</InputLabel>
                            <BootstrapInput id="request-email" type="email" value={email} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)} fullWidth />
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <InputLabel htmlFor="departure" sx={inputLabelStyles}>Where do you want us to pickup your products?</InputLabel>
                            {/* <AutocompleteSearch id="departure" value={departureTown} onChange={(e: any) => { setDepartureTown(convertStringToObject(e.target.innerText)); setDeparture(e.target.innerText); }} fullWidth /> */}
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
                                    onChange={(e: any, value: any) => { setDeparturePort(value); }}
                                    fullWidth
                                /> : <Skeleton />
                            }
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <InputLabel htmlFor="arrival" sx={inputLabelStyles}>Where do you want to transport your products?</InputLabel>
                            {/* <AutocompleteSearch id="arrival" value={arrivalTown} onChange={(e: any) => { setArrivalTown(convertStringToObject(e.target.innerText)); setArrival(e.target.innerText); }} fullWidth /> */}
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
                                    onChange={(e: any, value: any) => { setArrivalPort(value); }}
                                    fullWidth
                                /> : <Skeleton />
                            }
                        </Grid>
                        <Grid item xs={12} md={3}>
                            {/* <InputLabel htmlFor="packing-type" sx={inputLabelStyles}>In what type of packing do you want to transport your goods?</InputLabel> */}
                            <InputLabel htmlFor="packing-type" sx={inputLabelStyles}>Packing type</InputLabel>
                            <NativeSelect
                                id="packing-type"
                                value={packingType}
                                onChange={handleChangePackingType}
                                input={<BootstrapInput />}
                                fullWidth
                            >
                                <option value="FCL">FCL</option>
                                <option value="Breakbulk/LCL" disabled>Breakbulk/LCL</option>
                                <option value="Unit RoRo" disabled>Unit RoRo</option>
                            </NativeSelect>
                        </Grid>
                        {/* <Grid item xs={12} md={3}>
                            <InputLabel htmlFor="quantity" sx={inputLabelStyles}>How many units of cargo do you want to transport?</InputLabel>
                            <BootstrapInput id="quantity" type="number" inputProps={{ min: 0, max: 100 }} value={quantity} onChange={(e: any) => {console.log(e); setQuantity(e.target.value)}} fullWidth />
                        </Grid> */}
                        <Grid item xs={12} mt={1}>
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
                                    renderInput={(params) => <TextField {...params} sx={{ textTransform: "lowercase" }} />}
                                    onChange={(e: any, value: any) => { setTags(value); }}
                                    fullWidth
                                /> : <Skeleton />
                            }
                        </Grid>
                        <Grid item xs={12} mt={1}>
                            <InputLabel htmlFor="request-message" sx={inputLabelStyles}>Do you want to share other details regarding your needs?</InputLabel>
                            <BootstrapInput id="request-message" type="text" multiline rows={3} value={message} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setMessage(e.target.value)} fullWidth />
                        </Grid>
                        <Grid item xs={12}>
                            <ReCAPTCHA
                                sitekey="6LcapWceAAAAAGab4DRszmgw_uSBgNFSivuYY9kI"
                                hl="en-GB"
                                onChange={onChangeCaptcha}
                            />
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions>
                    <Button variant="contained" color={!load ? "primary" : "info"} className="mr-3" onClick={sendQuotationForm} disabled={load === true} sx={{ textTransform: "none" }}>Continue</Button>
                    <Button variant="contained" onClick={() => { setModal(false); }} sx={buttonCloseStyles}>Close</Button>
                </DialogActions>
            </BootstrapDialog>
            
            <BootstrapDialog
                onClose={() => setModal2(false)}
                aria-labelledby="custom-dialog-title2"
                open={modal2}
                maxWidth="md"
                fullWidth
            >
                <BootstrapDialogTitle id="custom-dialog-title2" onClose={() => setModal2(false)}>
                    <b>Contact a manager</b>
                </BootstrapDialogTitle>
                <DialogContent dividers>
                    <Typography variant="subtitle1" gutterBottom px={2}>
                        Please fill in the form and click the button to send a request for a quote.
                    </Typography>
                    <Grid container spacing={2} mt={1} px={2}>
                        <Grid item xs={12} md={6}>
                            <InputLabel htmlFor="phone-number" sx={inputLabelStyles}>Whatsapp number</InputLabel>
                            <MuiTelInput id="phone-number" value={phone} onChange={setPhone} defaultCountry="CM" preferredCountries={["CM", "BE", "KE"]} fullWidth sx={{ mt: 1 }} />
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <InputLabel htmlFor="contact-email" sx={inputLabelStyles}>Email</InputLabel>
                            <BootstrapInput id="contact-email" type="email" value={email} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)} fullWidth />
                        </Grid>
                        <Grid item xs={12} mt={1}>
                            <InputLabel htmlFor="request-subjects" sx={inputLabelStyles}>What topics would you like information on ?</InputLabel>
                            <Select
                                labelId="request-subjects"
                                id="subjects"
                                multiple
                                value={subjects}
                                onChange={handleChangeSubject}
                                input={<BootstrapInput />}
                                renderValue={(selected) => selected.join(', ')}
                                //MenuProps={MenuProps}
                                fullWidth
                            >
                                {defaultSubjects.map((name) => (
                                    <MenuItem key={name} value={name}>
                                        <Checkbox checked={subjects.indexOf(name) > -1} />
                                        <ListItemText primary={name} />
                                    </MenuItem>
                                ))}
                            </Select>
                        </Grid>
                        <Grid item xs={12} mt={1}>
                            <InputLabel htmlFor="request-details" sx={inputLabelStyles}>Enter the details of your need</InputLabel>
                            <BootstrapInput id="request-details" type="text" multiline rows={3} value={message} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setMessage(e.target.value)} fullWidth />
                        </Grid>
                        <Grid item xs={12}>
                            <ReCAPTCHA
                                sitekey="6LcapWceAAAAAGab4DRszmgw_uSBgNFSivuYY9kI"
                                hl="en-GB"
                                onChange={onChangeCaptcha}
                            />
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions>
                    <Button variant="contained" color={!load ? "primary" : "info"} onClick={sendContactForm} disabled={load === true} sx={{ textTransform: "none" }}>Continue</Button>
                    <Button variant="contained" onClick={() => setModal2(false)} sx={buttonCloseStyles}>Close</Button>
                </DialogActions>
            </BootstrapDialog>
            
            <BootstrapDialog
                onClose={() => setModal3(false)}
                aria-labelledby="custom-dialog-title3"
                open={modal3}
                maxWidth="md"
                fullWidth
            >
                <BootstrapDialogTitle id="custom-dialog-title3" onClose={() => setModal3(false)}>
                    <b>Download our brochure</b>
                </BootstrapDialogTitle>
                <DialogContent dividers>
                    <Typography variant="subtitle1" gutterBottom px={2}>
                        Please fill in the form and click the button to send a request for a quote.
                    </Typography>
                    <Grid container spacing={2} mt={1} px={2}>
                        <Grid item xs={12} md={6}>
                            <InputLabel htmlFor="whatsapp-number" sx={inputLabelStyles}>Whatsapp number</InputLabel>
                            <MuiTelInput id="whatsapp-number" className="custom-phone-number" value={phone} onChange={setPhone} defaultCountry="CM" preferredCountries={["CM", "BE", "KE"]} fullWidth sx={{ mt: 1 }} />
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <InputLabel htmlFor="download-email" sx={inputLabelStyles}>Email</InputLabel>
                            <BootstrapInput id="download-email" type="email" value={email} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)} fullWidth />
                        </Grid>
                        <Grid item xs={12}>
                            <ReCAPTCHA
                                sitekey="6LcapWceAAAAAGab4DRszmgw_uSBgNFSivuYY9kI"
                                hl="en-GB"
                                onChange={onChangeCaptcha}
                            />
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions>
                    <Button variant="contained" color={!load ? "primary" : "info"} className="mr-3" onClick={sendContactFormRedirect} disabled={email === "" || !validMail(email)} sx={{ textTransform: "none" }}>Download</Button>
                </DialogActions>
            </BootstrapDialog>         

            <BootstrapDialog
                onClose={() => setModal4(false)}
                aria-labelledby="custom-dialog-title4"
                open={modal4}
                maxWidth="md"
                fullWidth
                sx={{ p: 5 }}
            >
                <BootstrapDialogTitle id="custom-dialog-title4" onClose={() => setModal4(false)}>
                    <b>Congratulations!</b>
                </BootstrapDialogTitle>
                <DialogContent dividers>
                    <Alert severity="success" sx={{ mb: 3 }}>
                        <Typography variant="subtitle1" gutterBottom px={2}>
                            Your request has been successfully sent, please check your email or your spam to get your tracking number.
                            We will revert to you soon with the cost and best options for your shipment.
                        </Typography>
                    </Alert>
                    {/* <img src="/img/checkemail.jpg" style={{ width: "300px", display: "block", margin: "0 auto" }} alt="check email" /> */}
                </DialogContent>
            </BootstrapDialog>   
        </div>
    );
}

export default Landing;
