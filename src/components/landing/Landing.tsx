import React, { useEffect } from 'react';
import { Box, Button, Card, CardActions, CardContent, Checkbox, Dialog, DialogActions, DialogContent, DialogTitle, Fab, Grid, IconButton, InputBase, InputLabel, ListItemText, MenuItem, NativeSelect, Paper, Popover, Select, SelectChangeEvent, Typography } from '@mui/material';
import { alpha, styled } from '@mui/material/styles';
import CloseIcon from '@mui/icons-material/Close';
import FaceIcon from '@mui/icons-material/Face';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import { bottomStyles, cardStyles, imageStyles, buttonStyles, contentStyles, buttonCloseStyles, overlayStyles, inputLabelStyles, cardTextStyles, BootstrapInput, BootstrapDialog } from '../../misc/styles';
import '../../App.css';
// @ts-ignore
import { CookieBanner } from '@palmabit/react-cookie-law';
import ReCAPTCHA from "react-google-recaptcha";
import { MuiTelInput } from 'mui-tel-input';
import { SnackbarProvider, enqueueSnackbar } from 'notistack';
import AutocompleteSearch from '../shared/AutocompleteSearch';
import { useAccount, useIsAuthenticated, useMsal } from '@azure/msal-react';
import Testimonies from './Testimonies';
import Footer from './Footer';
import { loginRequest, protectedResources } from '../../authConfig';
import { AuthenticationResult } from '@azure/msal-browser';


export interface DialogTitleProps {
    id: string;
    children?: React.ReactNode;
    onClose: () => void;
}
  
function BootstrapDialogTitle(props: DialogTitleProps) {
    const { children, onClose, ...other } = props;
  
    return (
      <DialogTitle sx={{ m: 0, p: 2 }} {...other}>
        {children}
        {onClose ? (
          <IconButton
            aria-label="close"
            onClick={onClose}
            sx={{
              position: 'absolute',
              right: 8,
              top: 8,
              color: (theme) => theme.palette.grey[500],
            }}
          >
            <CloseIcon />
          </IconButton>
        ) : null}
      </DialogTitle>
    );
}

function convertStringToObject(str: string): { city: string, country: string } {
    const [city, ...countryArr] = str.split(', ');
    const country = countryArr.join(', ');
    return { city, country };
}



function Landing() {
    const isAuthenticated = useIsAuthenticated();
    const [modal, setModal] = React.useState<boolean>(false);
    const [modal2, setModal2] = React.useState<boolean>(false);
    const [modal3, setModal3] = React.useState<boolean>(false);
    const [load, setLoad] = React.useState<boolean>(false);
    const [email, setEmail] = React.useState<string>("");
    const [captcha, setCaptcha] = React.useState<string | null>(null);
    const [phone, setPhone] = React.useState<string>("");
    const [message, setMessage] = React.useState<string>("");
    const [subjects, setSubjects] = React.useState<string[]>([]);
    const [quantity, setQuantity] = React.useState<number>(1);
    const [cargoType, setCargoType] = React.useState<string>("0");
    const [departureTown, setDepartureTown] = React.useState<any>(convertStringToObject("Antwerp, Belgium"));
    const [arrivalTown, setArrivalTown] = React.useState<any>(convertStringToObject("Douala, Cameroon"));
    const [departure, setDeparture] = React.useState<string>("");
    const [arrival, setArrival] = React.useState<string>("");
    const [anchorEl, setAnchorEl] = React.useState<HTMLButtonElement | null>(null);
    
    const { instance, accounts } = useMsal();
    const account = useAccount(accounts[0] || {});
    const [accessToken, setAccessToken] = React.useState<string>();
    
    useEffect(()=>{
        const getToken = async () => {
            if(account) {
                const token = await instance.acquireTokenSilent({
                    scopes: loginRequest.scopes,
                    account: account
                }).then((response:AuthenticationResult)=>{
                    return response.accessToken;
                }).catch(()=>{
                    return instance.acquireTokenPopup({
                        ...loginRequest,
                        account: account
                        }).then((response) => {
                            return response.accessToken;
                    });
                })

                console.log(token);
                setAccessToken(token);
            }
        }

        getToken();
    },[account, instance])

    const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    const open = Boolean(anchorEl);
    const id = open ? 'simple-popover' : undefined;
    
    
    // const handleArrivalLocationChange = (value: string) => {
    //     setArrivalTown(value);
    // };
    
    const handleChangeSubject = (event: SelectChangeEvent<typeof subjects>) => {
        const {
           target: { value },
        } = event;
        setSubjects(
            // On autofill we get a stringified value.
            typeof value === 'string' ? value.split(',') : value,
        );
    };

    const handleChangeCargoType = (event: { target: { value: string } }) => {
        setCargoType(event.target.value);
    };
    
    function onChangeCaptcha(value: any) {
        console.log("Captcha value:", value);
        setCaptcha(value);
    }

    function validMail(mail: string) {
        return /^(([^<>()\[\]\.,;:\s@\"]+(\.[^<>()\[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()\.,;\s@\"]+\.{0,1})+([^<>()\.,;:\s@\"]{2,}|[\d\.]+))$/.test(mail);
    }
  
    function download(fileUrl: any, fileName: any) {
        var a = document.createElement("a");
        a.href = fileUrl;
        a.setAttribute("download", fileName);
        a.click();
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
                        enqueueSnackbar("data.MessageSuccess", { variant: "success", anchorOrigin: { horizontal: "right", vertical: "top"} });
                        setPhone("");
                        setEmail("")
                        download("/assets/omnifreight_flyer.pdf", "Flyer Omnifreight.pdf");
                    }).catch(error => { 
                        setLoad(false);
                        enqueueSnackbar("data.MessageError", { variant: "error", anchorOrigin: { horizontal: "right", vertical: "top"} });    
                    });
                }
                else {
                    enqueueSnackbar("data.MessageWrongEmail", { variant: "info", anchorOrigin: { horizontal: "right", vertical: "top"} });
                }
            }
            else {
                enqueueSnackbar("data.MessageEmptyFields", { variant: "info", anchorOrigin: { horizontal: "right", vertical: "top"} });
            }
        }
        else {
            enqueueSnackbar("data.MessageCaptcha", { variant: "info", anchorOrigin: { horizontal: "right", vertical: "top"} });
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
                    //setShow(true);
                    setLoad(false);
                    setPhone("");
                    setEmail("");
                    setSubjects([]);
                    setMessage("");
                    enqueueSnackbar("data.MessageSuccess", { variant: "success", anchorOrigin: { horizontal: "right", vertical: "top"} });
                }).catch(error => { 
                    setLoad(false);
                    enqueueSnackbar("data.MessageError", { variant: "error", anchorOrigin: { horizontal: "right", vertical: "top"} });
                });        
                }
                else {
                    enqueueSnackbar("data.MessageWrongEmail", { variant: "info", anchorOrigin: { horizontal: "right", vertical: "top"} });
                }
            }
            else {
                enqueueSnackbar("data.MessageEmptyFields", { variant: "info", anchorOrigin: { horizontal: "right", vertical: "top"} });
            }
        }
        else {
            enqueueSnackbar("data.MessageCaptcha", { variant: "info", anchorOrigin: { horizontal: "right", vertical: "top"} });
        }
    }

    function sendQuotationForm() {
        if (captcha !== null) {
                if ((phone !== "" && arrival !== "" && departure !== "") || (email !== "" && arrival !== "" && departure !== "")) {
                    if (email === "" || email !== "" && validMail(email)) {
                        setLoad(true);
                        var myHeaders = new Headers();
                        myHeaders.append('Accept', '');
                        myHeaders.append("Content-Type", "application/json");
                        fetch(protectedResources.apiLisQuotes.endPoint+"/Request", {
                            method: "POST",
                            body: JSON.stringify({ Whatsapp: phone, Email: email, Departure: departure, Arrival: arrival, CargoType: Number(cargoType), Quantity: quantity, Detail: message }),
                            headers: myHeaders
                        }).then((data: any) => {
                            setLoad(false);
                            if (data.code === 201) {
                                enqueueSnackbar("data.MessageSuccess", { variant: "success", anchorOrigin: { horizontal: "right", vertical: "top"} });
                                //resetFields();
                                setPhone("");
                                setEmail("");
                                setMessage("");
                            }
                            else {
                                enqueueSnackbar("data.MessageUnknownError", { variant: "error", anchorOrigin: { horizontal: "right", vertical: "top"} });
                            }
                        }).catch(error => { 
                            setLoad(false);
                            enqueueSnackbar("data.MessageError", { variant: "error", anchorOrigin: { horizontal: "right", vertical: "top"} });
                        });        
                    }
                    else {
                        enqueueSnackbar("data.MessageWrongEmail", { variant: "info", anchorOrigin: { horizontal: "right", vertical: "top"} });
                    }
                }
                else {
                    enqueueSnackbar("data.MessageEmptyFields", { variant: "info", anchorOrigin: { horizontal: "right", vertical: "top"} });
                }
        }
        else {
            enqueueSnackbar("data.MessageCaptcha", { variant: "info", anchorOrigin: { horizontal: "right", vertical: "top"} });
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
                    href={!isAuthenticated ? "/login" : "/admin/"}
                    sx={{ 
                        textTransform: "inherit",
                        backgroundColor: "#fff",
                        borderRadius: "20px",
                        position: "absolute",
                        top: { xs: "20px", md: "50px"},
                        right: { xs: "30px", md: "110px"}
                    }}
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

            <Fab aria-describedby={id} color="default" onClick={handleClick} sx={{ backgroundColor: "#fff", position: "fixed", right: "20px", bottom: "20px", width: "64px", height: "64px" }}>
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
                        <Grid item xs={12} md={6}>
                            <InputLabel htmlFor="whatsapp-phone-number" sx={inputLabelStyles}>Whatsapp number</InputLabel>
                            <MuiTelInput id="whatsapp-phone-number" value={phone} onChange={setPhone} defaultCountry="CM" preferredCountries={["CM", "BE", "KE"]} fullWidth sx={{ mt: 1 }} />
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <InputLabel htmlFor="request-email" sx={inputLabelStyles}>Email</InputLabel>
                            <BootstrapInput id="request-email" type="email" value={email} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)} fullWidth />
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <InputLabel htmlFor="departure" sx={inputLabelStyles}>City and country of departure of the goods</InputLabel>
                            <AutocompleteSearch id="departure" value={departureTown} onChange={(e: any) => { setDepartureTown(convertStringToObject(e.target.innerText)); setDeparture(e.target.innerText); }} fullWidth />
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <InputLabel htmlFor="arrival" sx={inputLabelStyles}>City and country of arrival of the goods</InputLabel>
                            <AutocompleteSearch id="arrival" value={arrivalTown} onChange={(e: any) => { setArrivalTown(convertStringToObject(e.target.innerText)); setArrival(e.target.innerText); }} fullWidth />
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <InputLabel htmlFor="cargo-type" sx={inputLabelStyles}>Type of cargo</InputLabel>
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
                        <Grid item xs={12} md={6}>
                            <InputLabel htmlFor="quantity" sx={inputLabelStyles}>Quantity</InputLabel>
                            <BootstrapInput id="quantity" type="number" inputProps={{ min: 0, max: 100 }} value={quantity} onChange={(e: any) => {console.log(e); setQuantity(e.target.value)}} fullWidth />
                        </Grid>
                        <Grid item xs={12} mt={1}>
                            <InputLabel htmlFor="request-message" sx={inputLabelStyles}>Other details about your need (Optional)</InputLabel>
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
                    {/* <Button variant="contained" onClick={() => alert("Check")} sx={{ textTransform: "none" }}>Continue</Button> */}
                    <Button variant="contained" onClick={() => setModal(false)} sx={buttonCloseStyles}>Close</Button>
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
        </div>
    );
}

export default Landing;
