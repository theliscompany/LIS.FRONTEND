import React, { useEffect, useState } from 'react';
import { Alert, Autocomplete, Box, Button, Card, CardActions, CardContent, Checkbox, DialogActions, DialogContent, Grid, InputLabel, ListItemText, MenuItem, NativeSelect, Select, SelectChangeEvent, Skeleton, TextField, Typography, Menu } from '@mui/material';
import FaceIcon from '@mui/icons-material/Face';
import { bottomStyles, cardStyles, buttonStyles, buttonCloseStyles, inputLabelStyles, cardTextStyles, BootstrapInput, BootstrapDialog, BootstrapDialogTitle } from '../../misc/styles';
import '../../App.css';
// @ts-ignore
import { CookieBanner } from '@palmabit/react-cookie-law';
import ReCAPTCHA from "react-google-recaptcha";
import { MuiTelInput } from 'mui-tel-input';
import { SnackbarProvider, enqueueSnackbar } from 'notistack';
import AutocompleteSearch from '../shared/AutocompleteSearch';
import { useIsAuthenticated, useMsal } from '@azure/msal-react';
import Testimonies from './Testimonies';
import Footer from './Footer';
import { loginRequest, protectedResources } from '../../authConfig';
import { BackendService } from '../../services/fetch';
import { useAuthorizedBackendApi } from '../../api/api';
import { MailData } from '../../models/models';
// import { AuthenticationResult } from '@azure/msal-browser';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

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
    // const [cargoType, setCargoType] = useState<string>("0");
    const [packingType, setPackingType] = useState<string>("FCL");
    // const [departurePort, setDeparturePort] = useState<any>({portId: 1, portName: "ANTWERP", country: "Belgium"});
    // const [arrivalPort, setArrivalPort] = useState<any>({portId: 2, portName: "DOUALA", country: "Cameroon"});
    const [departure, setDeparture] = useState<any>(null);
    const [arrival, setArrival] = useState<any>(null);
    // const [tags, setTags] = useState<MuiChipsInputChip[]>([]);
    const [tags, setTags] = useState<any>([]);
    
    // const [mailSubject, setMailSubject] = useState<string>("");
    // const [mailContent, setMailContent] = useState<string>("");
    
    // const [ports, setPorts] = useState<any>(null);
    const [products, setProducts] = useState<any>(null);
    // const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);
    
    const { instance } = useMsal();
    const context = useAuthorizedBackendApi();
    // const account = useAccount(accounts[0] || {});
    // const [accessToken, setAccessToken] = React.useState<string>();
    const [anchorElLang, setAnchorElLang] = useState<null | HTMLElement>(null);
    
    const handleOpenLangMenu = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorElLang(event.currentTarget);
    };

    const handleCloseLangMenu = () => {
        setAnchorElLang(null);
    };

    const handleLogin = () => {
        instance.loginRedirect(loginRequest);
    }
    
    // const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    //     setAnchorEl(event.currentTarget);
    // };

    // const handleClose = () => {
    //     setAnchorEl(null);
    // };

    // const open = Boolean(anchorEl);
    // const id = open ? 'simple-popover' : undefined;
    
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
        setPackingType(event.target.value);
    };
    
    function onChangeCaptcha(value: any) {
        setCaptcha(value);
    }

    const navigate = useNavigate();
    
    const { i18n, t } = useTranslation();
    
    useEffect(() => {
        getProducts();
    }, []);
    
    // const getPorts = async () => {
    //     try {
    //         const response = await fetch(protectedResources.apiLisTransport.endPoint+"/Port/Ports");
    //         if (!response.ok) {
    //           throw new Error('Network response was not ok');
    //         }
    //         const data = await response.json();
    //         setPorts(data);
    //     } catch (error) {
    //         console.error('Error fetching data:', error);
    //     }
    // }
    
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
        return /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/.test(mail);
    }
  
    const postEmail = async(from: string, to: string, subject: string, htmlContent: string) => {
        const body: MailData = { from: from, to: to, subject: subject, htmlContent: htmlContent };
        const data = await (context as BackendService<any>).postForm(protectedResources.apiLisQuotes.endPoint+"/Email", body);
        console.log(data);
        if (data?.status === 200) {
            enqueueSnackbar(t('messageSuccessSent'), { variant: "success", anchorOrigin: { horizontal: "right", vertical: "top"} });
        }
        else {
            enqueueSnackbar(t('errorHappened'), { variant: "error", anchorOrigin: { horizontal: "right", vertical: "top"} });
        }
    }

    // async function testEmail() {
    //     var footer = `
    //     <body style="font-family: Verdana, sans-serif; font-size: 14px; color: #333;">
    //         <div style="background-color: #f2f2f2; padding: 20px;">
    //             <h1 style="color: #000; margin-bottom: 20px;">New request for quote</h1>
    //             <p style="margin-bottom: 20px;">You have received a new request for quote in LIS Quotes.</p>
    //             <a href="https://lisquotes-ui.azurewebsites.net/login" style="display: inline-block; background-color: #008089; color: #fff; padding: 10px 20px; text-decoration: none;">Login to LIS Quotes</a>
    //             <p style="margin-top: 20px;">Please, click the button up to login to LIS Quotes and manage this quote.</p>
    //             <div style="font-family: Verdana; padding-top: 60px;">
    //                 <div><a target="_blank" href="www.omnifreight.eu">www.omnifreight.eu</a></div>
    //                 <div style="padding-bottom: 10px;"><a target="_blank" href="http://www.facebook.com/omnifreight">http://www.facebook.com/omnifreight</a></div>
    //                 <div>Italiëlei 211</div>
    //                 <div>2000 Antwerpen</div>
    //                 <div>Belgium</div>
    //                 <div>E-mail: transport@omnifreight.eu</div>
    //                 <div>Tel +32.3.295.38.82</div>
    //                 <div>Fax +32.3.295.38.77</div>
    //                 <div>Whatsapp +32.494.40.24.25</div>
    //                 <img src="http://www.omnifreight.eu/Images/omnifreight_logo.jpg" style="max-width: 200px;">
    //             </div>
    //         </div>
    //     </body>
    //     `;
    //     postEmail("cyrille.penaye@omnifreight.eu", "penayecyrille@gmail.com", mailSubject, mailContent+footer);
    // }
      
    function sendContactFormRedirect() {
        if (captcha !== null) {
            if (phone !== "" || email !== "") {
                if (email === "" || (email !== "" && validMail(email))) {
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
                        enqueueSnackbar(t('errorHappened'), { variant: "error", anchorOrigin: { horizontal: "right", vertical: "top"} });    
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
        else {
            enqueueSnackbar(t('checkCaptcha'), { variant: "info", anchorOrigin: { horizontal: "right", vertical: "top"} });
        }
    }

    function sendContactForm() {
        if (captcha !== null) {
            if (phone !== "" || email !== "") {
                if (email === "" || (email !== "" && validMail(email))) {
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
                        enqueueSnackbar(t('informationReceived'), { variant: "success", anchorOrigin: { horizontal: "right", vertical: "top"} });
                    }).catch(error => { 
                        setLoad(false);
                        enqueueSnackbar(t('errorHappened'), { variant: "error", anchorOrigin: { horizontal: "right", vertical: "top"} });
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
        else {
            enqueueSnackbar(t('checkCaptcha'), { variant: "info", anchorOrigin: { horizontal: "right", vertical: "top"} });
        }
    }

    function sendQuotationForm() {
        if (captcha !== null) {
                if ((phone !== "" && arrival !== null && departure !== null) || (email !== "" && arrival !== null && departure !== null)) {
                    if (email === "" || (email !== "" && validMail(email))) {
                        setLoad(true);
                        var myHeaders = new Headers();
                        myHeaders.append('Accept', '');
                        myHeaders.append("Content-Type", "application/json");
                        fetch(protectedResources.apiLisQuotes.endPoint+"/Request", {
                            method: "POST",
                            body: JSON.stringify({ 
                                Whatsapp: phone, 
                                Email: email !== "" ? email : "emailexample@gmail.com", 
                                // Departure: departurePort.portName+', '+departurePort.country, 
                                // Arrival: arrivalPort.portName+', '+arrivalPort.country, 
                                Departure: departure !== null && departure !== undefined ? departure.city.toUpperCase()+', '+departure.country+', '+departure.latitude+', '+departure.longitude : "",
                                Arrival: arrival !== null && arrival !== undefined ? arrival.city.toUpperCase()+', '+arrival.country+', '+arrival.latitude+', '+arrival.longitude : "",
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
                                enqueueSnackbar(t('requestSuccessSent'), { variant: "success", anchorOrigin: { horizontal: "right", vertical: "top"} });
                                setPhone("");
                                setEmail("");
                                setMessage("");
                                setModal(false);
                                setModal4(true);
                            }
                            else {
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
        else {
            enqueueSnackbar(t('checkCaptcha'), { variant: "info", anchorOrigin: { horizontal: "right", vertical: "top"} });
        }
    }

    const defaultSubjects = [t('seaShipments'), t('airShipments'), t('becomeReseller'), t('jobOpportunities')];
    
    return (
        <div className="App" style={{ overflowX: "hidden" }}>
            <CookieBanner
                message={t('websiteUsesCookies')}
                policyLink="/privacy-policy"
                wholeDomain={true}
                acceptButtonText={t('iUnderstood')}
                privacyPolicyLinkText={t('privacyPolicy').toLowerCase()}
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
                    // to={!isAuthenticated ? undefined : "/admin/"}
                    sx={{ 
                        textTransform: "inherit",
                        backgroundColor: "#fff",
                        borderRadius: "20px",
                        position: "absolute",
                        top: { xs: "20px", md: "25px"},
                        right: { xs: "30px", md: "230px"}
                    }}
                    onClick={!isAuthenticated ? handleLogin : () => { navigate('/admin/'); }}
                >
                    <FaceIcon sx={{ mr: 1 }} /> {!isAuthenticated ? t('login') : "Admin"}
                </Button>
                <Button 
                    sx={{ 
                        mr: 3, p: 1, width: "125px",
                        border: 1, borderColor: "#ced4da", borderRadius: 1,
                        backgroundColor: "#fff",
                        position: "absolute",
                        '&:hover': { background: "#fff" },
                        top: { xs: "20px", md: "26px"},
                        right: { xs: "140px", md: "70px"}
                    }} onClick={handleOpenLangMenu}
                >
                    <Box sx={{ display: "flex", flexDirection: "row", justifyContent: "center", alignItems: "center" }}>
                        <img src={"/assets/img/flags/flag-"+i18n.language+".png"} alt="flag en" style={{ width: "16px", height: "16px" }} />
                        <Typography fontSize={14} sx={{ mx: 1, textTransform: "none", color: "#333" }}>{i18n.language === "en" ? "English" : "Français"}</Typography>
                    </Box>
                </Button>
                <Menu
                    sx={{ mt: '45px' }}
                    PaperProps={{ sx: { width: "160px" } }}
                    MenuListProps={{ sx: { paddingTop: "0px", paddingBottom: "0px" } }}
                    anchorEl={anchorElLang}
                    anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
                    keepMounted
                    transformOrigin={{ vertical: 'top', horizontal: 'right' }}
                    open={Boolean(anchorElLang)}
                    onClose={handleCloseLangMenu}
                >
                    <MenuItem dense key={"x1-English"} title="English" onClick={() => { i18n.changeLanguage("en"); handleCloseLangMenu(); }}>
                        <img src="/assets/img/flags/flag-en.png" style={{ width: "12px" }} alt="flag english" />
                        <ListItemText primary={"English"} sx={{ ml: 1 }} />
                    </MenuItem>
                    <MenuItem dense key={"x1-French"} title="Français" onClick={() => { i18n.changeLanguage("fr"); handleCloseLangMenu(); }}>
                        <img src="/assets/img/flags/flag-fr.png" style={{ width: "12px" }} alt="flag french" />
                        <ListItemText primary={"Français"} sx={{ ml: 1 }} />
                    </MenuItem>
                </Menu>
                
                <Grid container px={1} sx={{ py: { xs: 2, md: 4 } }}>
                    <Grid item xs={12} md={12} sx={{ maxWidth: { xs: "280px", md: "915px" }, mt: 4, mb: 0, mx: "auto", backgroundColor: "#fff" }}>
                        <img src={"/assets/img/logo-omnifreight-big.png"} className="logo-front" alt="omnifreight pro" />
                    </Grid>
                </Grid>
                <Grid container px={1} sx={{ mb: { xs: 3, md: 3 } }}>
                    <Grid item xs={12} sx={{ maxWidth: { md: "840px" }, mx: { md: "auto" } }}>
                        <Typography variant="h3" color="#fff" sx={{ fontFamily: "PT Sans", fontSize: { xs: "1.35rem", md: "2.75rem" }, lineHeight: { xs: "30px", md: "60px" } }}>
                            {t('bannerTitle')}
                        </Typography>
                    </Grid>    
                </Grid>
                <Grid container sx={{ maxWidth: { md: "1300px" }, mx: { md: "auto" }, px: { xs: 1, md: 5 }, mt: { xs: 0, md: 3 }, pt: {xs: 0, md: 3} }}>
                    <Grid item xs={12} md={4} sx={{ mb: { xs: 2 } }}>
                        <Card sx={cardStyles}>
                            <CardContent>
                                <Typography sx={cardTextStyles} gutterBottom>
                                    « {t(('bannerMessage1'))} »
                                </Typography>
                            </CardContent>
                            <CardActions sx={bottomStyles}>
                                <Button sx={buttonStyles} size="medium" onClick={() => setModal(true)}>{t('requestQuote')}</Button>
                            </CardActions>
                        </Card>
                    </Grid>
                    <Grid item xs={12} md={4} sx={{ mb: { xs: 2 } }}>
                        <Card sx={cardStyles}>
                            <CardContent>
                                <Typography sx={cardTextStyles} gutterBottom>
                                    « {t('bannerMessage2')} »
                                </Typography>
                            </CardContent>
                            <CardActions sx={bottomStyles}>
                                <Button size="medium" sx={buttonStyles} onClick={() => setModal2(true)}>{t('contactManager')}</Button>
                            </CardActions>
                        </Card>
                    </Grid>
                    <Grid item xs={12} md={4} sx={{ mb: { xs: 2 } }}>
                        <Card sx={cardStyles}>
                            <CardContent>
                                <Typography sx={cardTextStyles} gutterBottom>
                                    « {t('bannerMessage3')} »
                                </Typography>
                            </CardContent>
                            <CardActions sx={bottomStyles}>
                                <Button size="medium" sx={buttonStyles} onClick={() => setModal3(true)}>{t('downloadBrochure')}</Button>
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
                    <b>{t('requestQuote')}</b>
                </BootstrapDialogTitle>
                <DialogContent dividers>
                    <Typography variant="subtitle1" gutterBottom px={2}>
                        {t('itsEaseFillForm')}
                    </Typography>
                    <Grid container spacing={2} mt={1} px={2}>
                        <Grid item xs={12} md={6}>
                            <InputLabel htmlFor="whatsapp-phone-number" sx={inputLabelStyles}>{t('whatsappNumber')}</InputLabel>
                            <MuiTelInput id="whatsapp-phone-number" value={phone} onChange={setPhone} defaultCountry="CM" preferredCountries={["CM", "BE", "KE"]} fullWidth sx={{ mt: 1 }} />
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <InputLabel htmlFor="request-email" sx={inputLabelStyles}>{t('emailAddress')}</InputLabel>
                            <BootstrapInput id="request-email" type="email" value={email} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)} fullWidth />
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <InputLabel htmlFor="departure" sx={inputLabelStyles}>{t('cargoPickup')}</InputLabel>
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
                        <Grid item xs={12} md={6}>
                            <InputLabel htmlFor="arrival" sx={inputLabelStyles}>{t('cargoDeliver')}</InputLabel>
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
                        <Grid item xs={12} md={6}>
                            {/* <InputLabel htmlFor="packing-type" sx={inputLabelStyles}>In what type of packing do you want to transport your goods?</InputLabel> */}
                            <InputLabel htmlFor="packing-type" sx={inputLabelStyles}>{t('cargoTypeShip')}</InputLabel>
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
                        <Grid item xs={12} md={6}>
                            <InputLabel htmlFor="quantity" sx={inputLabelStyles}>{t('numberUnitsShip')}</InputLabel>
                            <BootstrapInput id="quantity" type="number" inputProps={{ min: 0, max: 100 }} value={quantity} onChange={(e: any) => {console.log(e); setQuantity(e.target.value)}} fullWidth />
                        </Grid>
                        <Grid item xs={12} mt={1}>
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
                        <Grid item xs={12} mt={1}>
                            <InputLabel htmlFor="request-message" sx={inputLabelStyles}>{t('shareOtherDetails')}</InputLabel>
                            <BootstrapInput id="request-message" type="text" multiline rows={3} value={message} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setMessage(e.target.value)} fullWidth />
                        </Grid>
                        <Grid item xs={12}>
                            <ReCAPTCHA
                                sitekey="6LcapWceAAAAAGab4DRszmgw_uSBgNFSivuYY9kI"
                                hl="en-GB" onChange={onChangeCaptcha}
                            />
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions>
                    <Button variant="contained" color={!load ? "primary" : "info"} className="mr-3" onClick={sendQuotationForm} disabled={load === true} sx={{ textTransform: "none" }}>{t('continue')}</Button>
                    {/* <Button variant="contained" onClick={() => { setModal(false); }} sx={buttonCloseStyles}>{t('close')}</Button> */}
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
                    <b>{t('contactManager')}</b>
                </BootstrapDialogTitle>
                <DialogContent dividers>
                    <Typography variant="subtitle1" gutterBottom px={2}>
                        {t('pleaseProvideContact')}
                    </Typography>
                    <Grid container spacing={2} mt={1} px={2}>
                        <Grid item xs={12} md={6}>
                            <InputLabel htmlFor="phone-number" sx={inputLabelStyles}>{t('whatsappNumber')}</InputLabel>
                            <MuiTelInput id="phone-number" value={phone} onChange={setPhone} defaultCountry="CM" preferredCountries={["CM", "BE", "KE"]} fullWidth sx={{ mt: 1 }} />
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <InputLabel htmlFor="contact-email" sx={inputLabelStyles}>{t('email')}</InputLabel>
                            <BootstrapInput id="contact-email" type="email" value={email} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)} fullWidth />
                        </Grid>
                        <Grid item xs={12} mt={1}>
                            <InputLabel htmlFor="request-subjects" sx={inputLabelStyles}>{t('topicsInformation')}</InputLabel>
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
                            <InputLabel htmlFor="request-details" sx={inputLabelStyles}>{t('enterDetails')}</InputLabel>
                            <BootstrapInput id="request-details" type="text" multiline rows={3} value={message} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setMessage(e.target.value)} fullWidth />
                        </Grid>
                        <Grid item xs={12}>
                            <ReCAPTCHA
                                sitekey="6LcapWceAAAAAGab4DRszmgw_uSBgNFSivuYY9kI"
                                hl="en-GB" onChange={onChangeCaptcha}
                            />
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions>
                    <Button variant="contained" color={!load ? "primary" : "info"} onClick={sendContactForm} disabled={load === true} sx={{ textTransform: "none" }}>{t('continue')}</Button>
                    <Button variant="contained" onClick={() => setModal2(false)} sx={buttonCloseStyles}>{t('close')}</Button>
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
                    <b>{t('downloadBrochure')}</b>
                </BootstrapDialogTitle>
                <DialogContent dividers>
                    <Typography variant="subtitle1" gutterBottom px={2}>
                        {t('pleaseFillFormRequest')}
                    </Typography>
                    <Grid container spacing={2} mt={1} px={2}>
                        <Grid item xs={12} md={6}>
                            <InputLabel htmlFor="whatsapp-number" sx={inputLabelStyles}>{t('whatsappNumber')}</InputLabel>
                            <MuiTelInput id="whatsapp-number" className="custom-phone-number" value={phone} onChange={setPhone} defaultCountry="CM" preferredCountries={["CM", "BE", "KE"]} fullWidth sx={{ mt: 1 }} />
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <InputLabel htmlFor="download-email" sx={inputLabelStyles}>{t('email')}</InputLabel>
                            <BootstrapInput id="download-email" type="email" value={email} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)} fullWidth />
                        </Grid>
                        <Grid item xs={12}>
                            <ReCAPTCHA
                                sitekey="6LcapWceAAAAAGab4DRszmgw_uSBgNFSivuYY9kI"
                                hl="en-GB" onChange={onChangeCaptcha}
                            />
                        </Grid>
                        {/* <Grid item xs={12} md={12}>
                            <InputLabel htmlFor="mail-subject" sx={inputLabelStyles}>Subject</InputLabel>
                            <BootstrapInput id="mail-subject" type="text" value={mailSubject} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setMailSubject(e.target.value)} fullWidth />
                        </Grid>
                        <Grid item xs={12} md={12}>
                            <InputLabel htmlFor="mail-content" sx={inputLabelStyles}>Content</InputLabel>
                            <TextField id="mail-content" type="text" multiline rows={6} value={mailContent} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setMailContent(e.target.value)} fullWidth />
                        </Grid> */}    
                    </Grid>
                </DialogContent>
                <DialogActions>
                    <Button variant="contained" color={!load ? "primary" : "info"} className="mr-3" onClick={sendContactFormRedirect} disabled={email === "" || !validMail(email)} sx={{ textTransform: "none" }}>{t('download')}</Button>
                    {/* <Button variant="contained" color="success" className="mr-3" sx={{ textTransform: "none" }} onClick={testEmail}>Test email</Button> */}
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
                    <b>{t('congratulations')}</b>
                </BootstrapDialogTitle>
                <DialogContent dividers>
                    <Alert severity="success" sx={{ mb: 3 }}>
                        <Typography variant="subtitle1" gutterBottom px={2}>
                            {t('successRequestQuoteMessage')}
                        </Typography>
                    </Alert>
                    {/* <img src="/img/checkemail.jpg" style={{ width: "300px", display: "block", margin: "0 auto" }} alt="check email" /> */}
                </DialogContent>
            </BootstrapDialog>   
        </div>
    );
}

export default Landing;
