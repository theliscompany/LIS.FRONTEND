import { Button, Dialog, DialogActions, DialogContent, DialogTitle, Grid, IconButton, InputBase, InputLabel, Typography } from '@mui/material';
import Snackbar from '@mui/material/Snackbar';
import { alpha, styled } from '@mui/material/styles';
import CloseIcon from '@mui/icons-material/Close';
import { MuiTelInput } from 'mui-tel-input';
import React, { useEffect } from 'react';
import ReCAPTCHA from 'react-google-recaptcha';
import './App.css';

const BootstrapDialog = styled(Dialog)(({ theme }) => ({
    '& .MuiDialogContent-root': {
      padding: theme.spacing(2),
    },
    '& .MuiDialogActions-root': {
      padding: theme.spacing(1),
    },
}));


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

export interface DialogTitleProps {
    id: string;
    children?: React.ReactNode;
    onClose: () => void;
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
  

  


function DownloadForm(props:{closeDialog(): void}) {
    const [modal, setModal] = React.useState<boolean>(false);
    const [load, setLoad] = React.useState<boolean>(false);
    const [email, setEmail] = React.useState<string>("");
    const [captcha, setCaptcha] = React.useState<string | null>(null);
    const [phone, setPhone] = React.useState<string>("");
    const [open, setOpen] = React.useState(false);

    const handleClick = () => {
        setOpen(true);
    };

    const handleClose = (event: React.SyntheticEvent | Event, reason?: string) => {
        if (reason === 'clickaway') {
            return;
        }

        setOpen(false);
    };

    const action = (
        <React.Fragment>
            <Button color="secondary" size="small" onClick={handleClose}>
                UNDO
            </Button>
            <IconButton
                size="small"
                aria-label="close"
                color="inherit"
                onClick={handleClose}
            >
                <CloseIcon fontSize="small" />
            </IconButton>
        </React.Fragment>
    );

    
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
              setPhone("");
              setEmail("")
              download("./assets/omnifreight_flyer.pdf", "Flyer Omnifreight.png");
            }).catch(error => { 
              setLoad(false);
            });
          }
          else {
          }
        }
        else {
        }
      }
      else {
      }
    }
  
    

    return (
        <BootstrapDialog
            onClose={() => setModal(false)}
            aria-labelledby="customized-dialog-title"
            open={modal}
            maxWidth="md"
            fullWidth
        >
            <BootstrapDialogTitle id="customized-dialog-title" onClose={props.closeDialog}>
                <b>Download our brochure</b>
            </BootstrapDialogTitle>
            <DialogContent dividers>
                <Typography variant="subtitle1" gutterBottom>
                    Please fill in the form and click the button to send a request for a quote.
                </Typography>
                <Grid container spacing={2} mt={1}>
                    <Grid item xs={6}>
                        <InputLabel htmlFor="whatsapp-number">Whatsapp number</InputLabel>
                        <MuiTelInput defaultCountry="CM" preferredCountries={["CM", "BE", "KE"]} value={phone} onChange={setPhone} fullWidth sx={{ mt: 1 }} />
                    </Grid>
                    <Grid item xs={6}>
                        <InputLabel htmlFor="email">Email</InputLabel>
                        <BootstrapInput type="email" id="email" fullWidth />
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
                <Button variant="contained" color={!load ? "primary" : "secondary"} className="mr-3" onClick={sendContactFormRedirect} disabled={email === "" || !validMail(email)} sx={{ textTransform: "none" }}>Download</Button>
                <Button variant="contained" onClick={() => alert("Check")} sx={{ textTransform: "none" }}>Download</Button>
            </DialogActions>

            <Snackbar
                open={open}
                autoHideDuration={6000}
                onClose={handleClose}
                message="Note archived"
                //action={action}
            />
        </BootstrapDialog>
    );
}

export default DownloadForm;
