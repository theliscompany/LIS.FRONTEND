import { useEffect, useState } from "react";
import { Alert, Box, Button, Card, CardActions, CardContent, Checkbox, DialogActions, DialogContent, InputLabel, ListItemText, Menu, MenuItem, NativeSelect, Select, SelectChangeEvent, Typography} from '@mui/material'
import Grid from '@mui/material/Grid2'
import { useIsAuthenticated, useMsal } from "@azure/msal-react";
import FaceIcon from '@mui/icons-material/Face';
import { useNavigate, useParams } from "react-router-dom";
import { useTranslation } from 'react-i18next';
import { BootstrapDialog, BootstrapDialogTitle, BootstrapInput, bottomStyles, buttonCloseStyles, buttonStyles, cardStyles, cardTextStyles, inputLabelStyles, properties } from "../utils/misc/styles";
import Testimonies from "../components/landingPage/Testimonies";
import Footer from "../components/landingPage/Footer";
import { loginRequest } from "../config/msalConfig";
import ReCAPTCHA from "react-google-recaptcha";
import { MuiTelInput } from 'mui-tel-input';

var footer = `
<div style="font-family: Verdana; padding-top: 35px;">
    <div>Omnifreight System</div>
    <div style="margin-top: 5px;"><a target="_blank" href="www.omnifreight.eu">www.omnifreight.eu</a></div>
    <div style="padding-bottom: 10px;"><a target="_blank" href="http://www.facebook.com/omnifreight">http://www.facebook.com/omnifreight</a></div>
    <div>Italiëlei 211</div>
    <div>2000 Antwerpen</div>
    <div>Belgium</div>
    <div>E-mail: transport@omnifreight.eu</div>
    <div>Tel +32.3.295.38.82</div>
    <div>Fax +32.3.295.38.77</div>
    <div>Whatsapp +32.494.40.24.25</div>
    <img src="https://omnifreight.eu/wp-content/uploads/2023/06/logo.jpg" style="max-width: 200px;">
</div>
`;

const Landing = () => {
    const { lang } = useParams();

    const [anchorElLang, setAnchorElLang] = useState<null | HTMLElement>(null);
    const [modal, setModal] = useState<boolean>(lang !== undefined && lang !== null ? true : false);
    const [modal2, setModal2] = useState<boolean>(false);
    const [modal3, setModal3] = useState<boolean>(false);
    const [modal4, setModal4] = useState<boolean>(false);
    const [phone, setPhone] = useState<string>("");
    const [email, setEmail] = useState<string>("");
    const [packingType, setPackingType] = useState<string>("FCL");
    const [quantity, setQuantity] = useState<number>(1);
    const [message, setMessage] = useState<string>("");
    const [departure] = useState<any>(null);
    const [arrival] = useState<any>(null);
    const [captcha, setCaptcha] = useState<string | null>(null);
    const [load, setLoad] = useState<boolean>(false);
    const [subjects, setSubjects] = useState<string[]>([]);

    const isAuthenticated = useIsAuthenticated()
    const { instance } = useMsal()
    const navigate = useNavigate();
    const { i18n, t } = useTranslation();
    

    useEffect(() => {
        if (lang !== undefined && lang !== null) {
            i18n.changeLanguage(lang);
        }
    }, []);

    const handleLogin = () => {
        instance.loginRedirect(loginRequest);
    }

    const handleOpenLangMenu = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorElLang(event.currentTarget);
    };

    const handleCloseLangMenu = () => {
        setAnchorElLang(null);
    };

    const handleChangePackingType = (event: { target: { value: string } }) => {
        setPackingType(event.target.value);
    };

    const onChangeCaptcha = (value: any) =>{
        setCaptcha(value);
    }

    const validMail = (mail: string) => {
        return /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/.test(mail);
    }

    const sendEmail = async (from: string, to: string, subject: string, htmlContent: string) => {
		const formData = new FormData();
		// Append the other email data to the FormData object
		formData.append('From', from);
		formData.append('To', to);
		formData.append('Subject', subject);
		formData.append('HtmlContent', htmlContent);
		
		// // Send the email with fetch
		// fetch(protectedResources.apiLisQuotes.endPoint+'/Email', {
		// 	method: 'POST',
		// 	headers: {
		// 		'accept': '*/*',
		// 		// 'Content-Type': 'multipart/form-data'
		// 	},
		// 	body: formData
		// })
		// .then((response) => response.json())
		// .then((data) => {
        //     enqueueSnackbar(t('messageSuccessSent'), { variant: "success", anchorOrigin: { horizontal: "right", vertical: "top"} });
        //     setLoad(false);
        //     console.log(data);
        // })
		// .catch((error) => {
        //     enqueueSnackbar(t('errorHappened'), { variant: "error", anchorOrigin: { horizontal: "right", vertical: "top"} });
        //     setLoad(false);
        //     console.error(error);
        // });
	}

    const sendQuotationForm = () => {
        if (captcha !== null) {
            if ((phone !== "" && arrival !== null && departure !== null) || (email !== "" && arrival !== null && departure !== null)) {
                if (email === "" || (email !== "" && validMail(email))) {
                    setLoad(true);
                    var emailContent = `
                    <div style="font-family: Verdana; line-height: 26px;">
                    <div>Un nouveau client vous contacte depuis le site web. Ses informations sont les suivantes : </div>
                    <div>Email : ${email}</div>
                    <div>Whatsapp : ${phone}</div>
                    <div>Lieu de chargement : ${departure?.city.toUpperCase()}</div>
                    <div>Lieu de déchargement : ${arrival?.city.toUpperCase()}</div>
                    <div>Type de cargaison et quantité : ${packingType} X ${quantity}</div>
                    <div>Détails : ${message}</div>
                    </div>
                    ` + footer;
                    sendEmail("pricing@omnifreight.eu", "pricing@omnifreight.eu", "Nouvelle demande du site web", emailContent);        
                }
                else {
                    //enqueueSnackbar(t('emailNotValid'), { variant: "info", anchorOrigin: { horizontal: "right", vertical: "top"} });
                }
            }
            else {
                //enqueueSnackbar(t('fieldsEmpty'), { variant: "info", anchorOrigin: { horizontal: "right", vertical: "top"} });
            }
        }
        else {
            //enqueueSnackbar(t('checkCaptcha'), { variant: "info", anchorOrigin: { horizontal: "right", vertical: "top"} });
        }
    }

    const sendContactForm = () => {
        if (captcha !== null) {
            if (phone !== "" || email !== "") {
                if (email === "" || (email !== "" && validMail(email))) {
                    setLoad(true);
                    var emailContent = `
                    <div style="font-family: Verdana; line-height: 26px;">
                    <div>Un nouveau client souhaite contacter le directeur. Ses informations sont les suivantes : </div>
                    <div>Email : ${email}</div>
                    <div>Whatsapp : ${phone}</div>
                    <div>Sujets d'intérêts : ${subjects.toString()}</div>
                    <div>Détails : ${message}</div>
                    </div>
                    ` + footer;
                    sendEmail("pricing@omnifreight.eu", "pricing@omnifreight.eu", "Nouveau contact du site web", emailContent);        
                }
                else {
                    //enqueueSnackbar(t('emailNotValid'), { variant: "info", anchorOrigin: { horizontal: "right", vertical: "top"} });
                }
            }
            else {
                //enqueueSnackbar(t('fieldsEmpty'), { variant: "info", anchorOrigin: { horizontal: "right", vertical: "top"} });
            }
        }
        else {
            //enqueueSnackbar(t('checkCaptcha'), { variant: "info", anchorOrigin: { horizontal: "right", vertical: "top"} });
        }
    }

    const handleChangeSubject = (event: SelectChangeEvent<typeof subjects>) => {
        const { target: { value },} = event;
        setSubjects(typeof value === 'string' ? value.split(',') : value,);
    }

    const sendContactFormRedirect = () => {
        if (captcha !== null) {
            if (phone !== "" || email !== "") {
                if (email === "" || (email !== "" && validMail(email))) {
                    setLoad(true);
                    var emailContent = `
                    <div style="font-family: Verdana; line-height: 26px;">
                    <div>Un nouveau prospect vient de télécharger la brochure sur le site web. Ses informations sont les suivantes : </div>
                    <div>Email : ${email}</div>
                    <div>Whatsapp : ${phone}</div>
                    </div>
                    ` + footer;
                    // Here i should send the email to the file
                    var content = "<body style=\"font-family: Arial, sans-serif; font-size: 14px; color: #333;\">\r\n\t<div style=\"background-color: #f2f2f2; padding: 20px;\">\r\n\t\t<h1 style=\"color: #000; margin-bottom: 20px;\">Download the flyer</h1>\r\n\t\t<p style=\"margin-bottom: 20px;\">We have sent you the flyer.</p>\r\n\t\t<a href=\"https://lis-quotes-ui-dev.azurewebsites.net/assets/flyer_omnifreight_en.pdf\" style=\"display: inline-block; background-color: #008089; color: #fff; padding: 10px 20px; text-decoration: none;\">Download</a>\r\n\t\t<p style=\"margin-top: 20px;\">Please, click the button up to download the document.</p>\r\n\t</div>\r\n</body>"+footer;
                    sendEmail("pricing@omnifreight.eu", email, "You received the flyer", content);
                    sendEmail("pricing@omnifreight.eu", "pricing@omnifreight.eu", "Nouveau téléchargement du flyer", emailContent);        
                }
                else {
                    //enqueueSnackbar(t('emailNotValid'), { variant: "info", anchorOrigin: { horizontal: "right", vertical: "top"} });
                }
            }
            else {
                //enqueueSnackbar(t('fieldsEmpty'), { variant: "info", anchorOrigin: { horizontal: "right", vertical: "top"} });
            }
        }
        else {
            //enqueueSnackbar(t('checkCaptcha'), { variant: "info", anchorOrigin: { horizontal: "right", vertical: "top"} });
        }
    }

    const defaultSubjects = [t('seaShipments'), t('airShipments'), t('becomeReseller'), t('jobOpportunities')];

    return (
        <div className="App" style={{ overflowX: "hidden" }}>
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
                    hidden={!isAuthenticated}
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
                <Grid container px={1}  sx={{ py: { xs: 2, md: 4 } }}>
                    <Grid sx={{ maxWidth: { xs: "280px", md: "915px" }, mt: 4, mb: 0, mx: "auto", backgroundColor: "#fff" }}>
                        <img src={"/assets/img/logo-omnifreight-big.png"} className="logo-front" alt="omnifreight pro" />
                    </Grid>
                </Grid>
                <Grid container px={1} sx={{ mb: { xs: 3, md: 3 } }}>
                    <Grid sx={{ maxWidth: { md: "840px" }, mx: { md: "auto" } }}>
                        <Typography variant="h3" color="#fff" sx={{ fontFamily: "PT Sans", fontSize: { xs: "1.35rem", md: "2.75rem" }, lineHeight: { xs: "30px", md: "60px" } }}>
                            {t('bannerTitle')}
                        </Typography>
                    </Grid>    
                </Grid>
                <Grid container sx={{ maxWidth: { md: "1300px" }, mx: { md: "auto" }, px: { xs: 1, md: 5 }, mt: { xs: 0, md: 3 }, pt: {xs: 0, md: 3} }}>
                    <Grid sx={{ mb: { xs: 2 } }} size={4}>
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
                    <Grid sx={{ mb: { xs: 2 } }} size={4}>
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
                    <Grid sx={{ mb: { xs: 2 } }} size={4}>
                        <Card sx={cardStyles}>
                            <CardContent>
                                <Typography sx={cardTextStyles} gutterBottom>
                                    « {t('bannerMessage3')} »
                                </Typography>
                            </CardContent>
                            <CardActions sx={bottomStyles}>
                                <Button size="medium" sx={buttonStyles} onClick={() => setModal3(true)}>{t('downloadBrochure')}</Button>
                                {/* <Button size="medium" sx={buttonStyles} onClick={() => setModal3(true)}>Download</Button> */}
                            </CardActions>
                        </Card>
                    </Grid>
                </Grid>
            </Box>
            <Testimonies />
            <Footer />

            {/* Modal request */}
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
                        <Grid size={{md:6, xs:12}}>
                            <InputLabel htmlFor="whatsapp-phone-number" sx={inputLabelStyles}>{t('whatsappNumber')}</InputLabel>
                            <MuiTelInput 
                                id="whatsapp-phone-number" size="small" 
                                value={phone} onChange={setPhone} 
                                defaultCountry="TZ" preferredCountries={["TZ", "CM", "KE", "BE"]} 
                                fullWidth sx={{ mt: 1 }}
                                {...properties} 
                            />
                        </Grid>
                        <Grid size={{xs:12, md:6}}>
                            <InputLabel htmlFor="request-email" sx={inputLabelStyles}>{t('emailAddress')}</InputLabel>
                            <BootstrapInput id="request-email" type="email" value={email} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)} fullWidth />
                        </Grid>
                        <Grid size={{xs:12, md:6}}>
                            <InputLabel htmlFor="departure" sx={inputLabelStyles}>{t('cargoPickup')}</InputLabel>
                            {/* <BootstrapInput id="departure" type="email" value={departure} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setDeparture(e.target.value)} fullWidth /> */}
                            {/* <AutocompleteSearch id="departure" placeholder="Ex : Douala, Cameroon" value={departure} onChange={setDeparture} fullWidth /> */}
                        </Grid>
                        <Grid size={{xs:12, md:6}}>
                            <InputLabel htmlFor="arrival" sx={inputLabelStyles}>{t('cargoDeliver')}</InputLabel>
                            {/* <BootstrapInput id="arrival" type="email" value={arrival} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setArrival(e.target.value)} fullWidth /> */}
                            {/* <AutocompleteSearch id="arrival" placeholder="Ex : Antwerp, Belgium" value={arrival} onChange={setArrival} fullWidth /> */}
                        </Grid>
                        <Grid size={{xs:12, md:6}}>
                            {/* <InputLabel htmlFor="packing-type" sx={inputLabelStyles}>In what type of packing do you want to transport your goods?</InputLabel> */}
                            <InputLabel htmlFor="packing-type" sx={inputLabelStyles}>{t('cargoTypeShip')}</InputLabel>
                            <NativeSelect
                                id="packing-type"
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
                        <Grid size={{xs:12, md:6}}>
                            <InputLabel htmlFor="quantity" sx={inputLabelStyles}>{t('numberUnitsShip')}</InputLabel>
                            <BootstrapInput id="quantity" type="number" inputProps={{ min: 0, max: 100 }} value={quantity} onChange={(e: any) => {console.log(e); setQuantity(e.target.value)}} fullWidth />
                        </Grid>
                        
                        <Grid size={{xs:12}} mt={1}>
                            <InputLabel htmlFor="request-message" sx={inputLabelStyles}>{t('shareOtherDetails')}</InputLabel>
                            <BootstrapInput id="request-message" type="text" multiline rows={3} value={message} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setMessage(e.target.value)} fullWidth />
                        </Grid>
                        <Grid size={{xs:12}}>
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

            {/* Modal contact manager */}
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
                        <Grid size={{xs:12, md:6}}>
                            <InputLabel htmlFor="phone-number" sx={inputLabelStyles}>{t('whatsappNumber')}</InputLabel>
                            <MuiTelInput 
                                id="phone-number" size="small" 
                                value={phone} onChange={setPhone} 
                                defaultCountry="TZ" preferredCountries={["TZ", "CM", "KE", "BE"]} 
                                fullWidth sx={{ mt: 1 }}
                                {...properties} 
                            />
                        </Grid>
                        <Grid size={{xs:12, md:6}}>
                            <InputLabel htmlFor="contact-email" sx={inputLabelStyles}>{t('email')}</InputLabel>
                            <BootstrapInput id="contact-email" type="email" value={email} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)} fullWidth />
                        </Grid>
                        <Grid size={{xs:12}} mt={1}>
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
                        <Grid size={{xs:12}} mt={1}>
                            <InputLabel htmlFor="request-details" sx={inputLabelStyles}>{t('enterDetails')}</InputLabel>
                            <BootstrapInput id="request-details" type="text" multiline rows={3} value={message} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setMessage(e.target.value)} fullWidth />
                        </Grid>
                        <Grid size={{xs:12}}>
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

            {/* Modal brochure */}
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
                        <Grid size={{xs:12, md:6}}>
                            <InputLabel htmlFor="whatsapp-number" sx={inputLabelStyles}>{t('whatsappNumber')}</InputLabel>
                            <MuiTelInput 
                                id="whatsapp-number" 
                                className="custom-phone-number"
                                size="small" 
                                value={phone} 
                                onChange={setPhone} 
                                defaultCountry="TZ" 
                                preferredCountries={["TZ", "CM", "KE", "BE"]} 
                                fullWidth 
                                sx={{ mt: 1 }}
                                {...properties} 
                            />
                        </Grid>
                        <Grid size={{xs:12, md:6}}>
                            <InputLabel htmlFor="download-email" sx={inputLabelStyles}>{t('email')}</InputLabel>
                            <BootstrapInput id="download-email" type="email" value={email} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)} fullWidth />
                        </Grid>
                        <Grid size={{xs:12}}>
                            <ReCAPTCHA
                                sitekey="6LcapWceAAAAAGab4DRszmgw_uSBgNFSivuYY9kI"
                                hl="en-GB" onChange={onChangeCaptcha}
                            />
                        </Grid>
                        
                    </Grid>
                </DialogContent>
                <DialogActions>
                    <Button variant="contained" color={!load ? "primary" : "info"} className="mr-3" onClick={sendContactFormRedirect} disabled={email === "" || !validMail(email)} sx={{ textTransform: "none" }}>{t('download')}</Button>
                    {/* <Button variant="contained" color="success" className="mr-3" sx={{ textTransform: "none" }} onClick={testEmail}>Test email</Button> */}
                </DialogActions>
            </BootstrapDialog>         

            {/* Modal congratulations */}
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
    )
}

export default Landing;