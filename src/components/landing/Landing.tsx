import React, { useEffect } from 'react';
import { Box, Button, Card, CardActions, CardContent, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, FormControl, Grid, IconButton, InputBase, InputBaseProps, InputLabel, Modal, Paper, TextField, Typography } from '@mui/material';
import { alpha, styled } from '@mui/material/styles';
import CloseIcon from '@mui/icons-material/Close';
import '../../App.css';
// @ts-ignore
import { CookieBanner } from '@palmabit/react-cookie-law';
import ReCAPTCHA from "react-google-recaptcha";
import { MuiTelInput } from 'mui-tel-input'


const BootstrapDialog = styled(Dialog)(({ theme }) => ({
    '& .MuiDialogContent-root': {
      padding: theme.spacing(2),
    },
    '& .MuiDialogActions-root': {
      padding: theme.spacing(1),
    },
}));

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

const BootstrapInput = styled(InputBase)(({ theme }) => ({
    'label + &': {
      marginTop: theme.spacing(1),
    },
    '& .MuiInputBase-input': {
      borderRadius: 4,
      position: 'relative',
      backgroundColor: theme.palette.mode === 'light' ? '#fcfcfb' : '#2b2b2b',
      border: '1px solid #ced4da',
      fontSize: 16,
      //width: 'auto',
      padding: '10px 12px',
      transition: theme.transitions.create([
        'border-color',
        'background-color',
        'box-shadow',
      ]),
      // Use the system font instead of the default Roboto font.
      fontFamily: [
        '-apple-system',
        'BlinkMacSystemFont',
        '"Segoe UI"',
        'Roboto',
        '"Helvetica Neue"',
        'Arial',
        'sans-serif',
        '"Apple Color Emoji"',
        '"Segoe UI Emoji"',
        '"Segoe UI Symbol"',
      ].join(','),
      '&:focus': {
        boxShadow: `${alpha(theme.palette.primary.main, 0.25)} 0 0 0 0.2rem`,
        borderColor: theme.palette.primary.main,
      },
    },
}));
  


function Landing() {
    const overlayStyles = {
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        backgroundColor: 'rgba(0, 0, 0, 0.75)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1,
        borderRadius: 0
    };
      
    const imageStyles = {
        //position: 'relative',
        //zIndex: 0,
        width: "100vw"
    };
      
    const contentStyles = {
        position: 'absolute',
        top: '47.5%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        zIndex: 2,
    };

    const buttonStyles = {
        ':hover': {
            backgroundColor: "#0097b2",
        },
        backgroundColor: "#008089",
        color: "#fff",
        borderRadius: "30px",
        padding: "10px 20px 10px",
        textTransform: "none",
        fontSize: 17,
        fontWeight: 400,
        fontFamily: "PT Sans"
    }

    const cardStyles = { 
        mx: 2,
        px: 0.5,
        py: 1,
        minHeight: "190px"
    }

    const bottomStyles = { 
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        lineHeight: 1
    }

    const cardTextStyles = { 
        lineHeight: 1.2,
        fontSize: 19,
        fontWeight: "bold",
        fontFamily: "PT Sans",
        minHeight: "75px" 
    }

    const buttonCloseStyles = {
        ':hover': {
            backgroundColor: "#5a6268",
        },
        textTransform: "none", 
        backgroundColor: "#6c757d"
    }

    const [modal, setModal] = React.useState<boolean>(false);
    const [modal2, setModal2] = React.useState<boolean>(false);
    const [modal3, setModal3] = React.useState<boolean>(false);
    const [load, setLoad] = React.useState<boolean>(false);
    const [email, setEmail] = React.useState<string>("");
    const [captcha, setCaptcha] = React.useState<string | null>(null);
    const [phone, setPhone] = React.useState<string>("");
    
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
          if (email == "" || email !== "" && validMail(email)) {
            setLoad(true);
            var myHeaders = new Headers();
            myHeaders.append("Accept", "*/");
            myHeaders.append("Content-Type", "application/json");
            fetch("https://omnifreightinfo.azurewebsites.net/api/QuotationBasic", {
              method: "POST",
              body: JSON.stringify({ phoneNumber: phone, email: email, goodsType: "" }),
              headers: myHeaders
            }).then((data: any) => {
              //toast.success("data.MessageSuccess");
              setPhone("");
              setEmail("")
              download("./assets/omnifreight_flyer.pdf", "Flyer Omnifreight.png");
            }).catch(error => { 
              setLoad(false);
              //toast.error("data.MessageError");
            });
          }
          else {
            //toast.info("data.MessageWrongEmail");
          }
        }
        else {
          //toast.info("data.MessageEmptyFields");
        }
      }
      else {
        //toast.info("data.MessageCaptcha");
      }
    }
  
    
    
    return (
        <div className="App" style={{ overflowX: "hidden" }}>
            <CookieBanner
                message="This website uses cookies. By continuing to use this site, you agree to their use. For more details, please see our"
                policyLink="/privacy-policy"
                wholeDomain={true}
                acceptButtonText="I understood"
                privacyPolicyLinkText="privacy policy"
            />
            <Box position="relative">
                <Paper sx={overlayStyles} />
                <img style={imageStyles} src={"/assets/img/backimage.png"} alt="overlay" />
                <Box sx={contentStyles}>
                    <Grid container sx={{ width: "1100px", alignItems: "center", justifyContent: "center", my: 3 }}>
                        <Grid item xs={10} sx={{ backgroundColor: "#fff" }}>
                            <img src={"/assets/img/logo-omnifreight-big.png"} style={{ width: "450px" }} alt="omnifreight pro" />
                        </Grid>
                    </Grid>
                    <Grid container>
                        <Grid item xs={9} sx={{ margin: "0 auto" }}>
                            <Typography variant="h3" color="#fff" sx={{ fontFamily: "PT Sans", fontSize: "2.75rem", lineHeight: "60px" }}>
                                We organize the shipment of your goods to Africa from all over the world!
                            </Typography>
                        </Grid>    
                    </Grid>
                    <Grid container sx={{ alignItems: "stretch", marginTop: "15vh" }}>
                        <Grid item xs={4}>
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
                        <Grid item xs={4}>
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
                        <Grid item xs={4}>
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
            </Box>
            
            <Box>
                I identify as
            </Box>

            <BootstrapDialog
                onClose={() => setModal(false)}
                aria-labelledby="customized-dialog-title"
                open={modal}
                maxWidth="md"
                fullWidth
            >
                <BootstrapDialogTitle id="customized-dialog-title" onClose={() => setModal(false)}>
                    <b>Request quote</b>
                </BootstrapDialogTitle>
                <DialogContent dividers>
                    <Typography variant="subtitle1" gutterBottom>
                        Please fill in the form and click the button to send a request for a quote.
                    </Typography>
                </DialogContent>
                <DialogActions>
                    <Button variant="contained" onClick={() => alert("Check")} sx={{ textTransform: "none" }}>Continue</Button>
                    <Button variant="contained" onClick={() => setModal(false)} sx={buttonCloseStyles}>Close</Button>
                </DialogActions>
            </BootstrapDialog>
            
            <BootstrapDialog
                onClose={() => setModal2(false)}
                aria-labelledby="customized-dialog-title"
                open={modal2}
                maxWidth="md"
                fullWidth
            >
                <BootstrapDialogTitle id="customized-dialog-title" onClose={() => setModal2(false)}>
                    <b>Contact a manager</b>
                </BootstrapDialogTitle>
                <DialogContent dividers>
                    <Typography variant="subtitle1" gutterBottom>
                        Please fill in the form and click the button to send a request for a quote.
                    </Typography>
                </DialogContent>
                <DialogActions>
                    <Button variant="contained" onClick={() => alert("Check")} sx={{ textTransform: "none" }}>Continue</Button>
                    <Button variant="contained" onClick={() => setModal2(false)} sx={buttonCloseStyles}>Close</Button>
                </DialogActions>
            </BootstrapDialog>
            
            <BootstrapDialog
                onClose={() => setModal3(false)}
                aria-labelledby="customized-dialog-title"
                open={modal3}
                maxWidth="md"
                fullWidth
            >
                <BootstrapDialogTitle id="customized-dialog-title" onClose={() => setModal3(false)}>
                    <b>Download our brochure</b>
                </BootstrapDialogTitle>
                <DialogContent dividers>
                    <Typography variant="subtitle1" gutterBottom>
                        Please fill in the form and click the button to send a request for a quote.
                    </Typography>
                    <Grid container spacing={2} mt={1}>
                        <Grid item xs={6}>
                            <InputLabel htmlFor="whatsapp-number">Whatsapp number</InputLabel>
                            <MuiTelInput id="phone" value={phone} onChange={setPhone} defaultCountry="CM" preferredCountries={["CM", "BE", "KE"]} fullWidth sx={{ mt: 1 }} />
                        </Grid>
                        <Grid item xs={6}>
                            <InputLabel htmlFor="download-email">Email</InputLabel>
                            <BootstrapInput key={"dosis-1"} id="download-email" value={email} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)} fullWidth />
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
                    <Button variant="contained" color={!load ? "primary" : "info"} className="mr-3" onClick={sendContactFormRedirect} disabled={email == "" || !validMail(email)} sx={{ textTransform: "none" }}>Download</Button>
                </DialogActions>
            </BootstrapDialog>
        </div>
    );
}

export default Landing;
