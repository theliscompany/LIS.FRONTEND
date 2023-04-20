import { Dialog, InputBase } from '@mui/material';
import { alpha, styled } from '@mui/material/styles';

export const overlayStyles = {
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
  
export const imageStyles = {
    width: "100vw"
};
  
export const contentStyles = {
    position: 'absolute',
    top: '47.5%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    zIndex: 2,
};

export const buttonStyles = {
    ':hover': {
        backgroundColor: "#0097b2",
    },
    backgroundColor: "#008089",
    color: "#fff",
    borderRadius: "30px",
    padding: "10px 20px 10px",
    textTransform: "none",
    fontSize: { xs: 15, md: 17 },
    fontWeight: 400,
    fontFamily: "PT Sans"
}

export const cardStyles = { 
    mx: { xs: 1, md: 2 },
    px: 0.5,
    py: 1,
    minHeight: { xs: "160px", md: "190px" }
}

export const bottomStyles = { 
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    lineHeight: 1
}

export const cardTextStyles = { 
    lineHeight: 1.2,
    fontSize: { xs: 17, md: 19 },
    fontWeight: "bold",
    fontFamily: "PT Sans",
    minHeight: { xs: "55px", md: "75px" } 
}

export const buttonCloseStyles = {
    ':hover': {
        backgroundColor: "#5a6268",
    },
    textTransform: "none", 
    backgroundColor: "#6c757d"
}

export const inputLabelStyles = { 
    fontSize: 15 
}

export const h4textStyles = {
  fontSize: { xs: 21, md: 30 }
}

export const h5textStyles = {
  fontSize: { xs: 18, md: 20 }
}

export const textStyles = {
  fontSize: { xs: 15, md: 17 }
}

export const BootstrapInput = styled(InputBase)(({ theme }) => ({
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
  
export const BootstrapDialog = styled(Dialog)(({ theme }) => ({
    '& .MuiDialogContent-root': {
      padding: theme.spacing(2),
    },
    '& .MuiDialogActions-root': {
      padding: theme.spacing(1),
    },
}));
