import { Badge, BadgeProps, Box, Dialog, DialogTitle, IconButton, InputBase, TextFieldClasses, Tooltip, TooltipProps } from '@mui/material';
import { tooltipClasses } from '@mui/material/Tooltip';
import { alpha, styled } from '@mui/material/styles';
import { DialogTitleProps } from '../models/models';
import CloseIcon from '@mui/icons-material/Close';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

export const myTextFieldClasses: Partial<TextFieldClasses> = {
  root: 'my-root-class',
  // other properties...
};

export const properties: any = {};

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

export const activeStyles = {
  background: "limegreen", 
  color: "#000"
}

export const imageStyles = {
    width: "100vw"
};
  
export const inputIconStyles = {
  position: "relative",
  top: "2px",
  fontSize: 15 
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

export const datetimeStyles = {
  mt: 0.75,
  '.MuiInputBase-input': { 
    py: "12.5px", 
    background: "#fcfcfb"
  } 
}

export const tagInputStyles = { 
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
}

export const whiteButtonStyles = { 
  background: "#fff", 
  color: "#333", mt: 2, 
  textTransform: "none"
}

export const anyButtonStyles = { 
  mt: 2, 
  textTransform: "none"
}

export const actionButtonStyles = { 
  textTransform: "none",
  alignItems: "flex-end", 
  justifyContent: "flex-end",
  float: "right",
  marginLeft: "8px"
}

export const gridStyles = { 
  "&.MuiDataGrid-root .MuiDataGrid-cell:focus-within": {
      outline: "none !important",
  },
  height: "auto",
  fontSize: "13px",
  minHeight: "10px",
  backgroundColor: "#fff"
}

export const sizingStyles = { 
  maxWidth: "calc(100vw - 365px)"
  // width: "100%"
}

export const sizeStyles = { 
  "&.MuiDataGrid-root .MuiDataGrid-cell:focus-within": {
      outline: "none !important",
  },
  height: "auto",
  fontSize: "13px",
  minHeight: "10px",
  maxWidth: "calc(100vw - 430px)",
  backgroundColor: "#fff"
}

export const BootstrapInput = styled(InputBase)(({ theme }) => ({
    'label + &': {
      marginTop: theme.spacing(1),
    },
    '& .MuiInputBase-input': {
      borderRadius: 4,
      position: 'relative',
      // backgroundColor: theme.palette.mode === 'light' ? '#fcfcfb' : '#2b2b2b',
      border: '1px solid #bdbebe',
      fontSize: 16,
      //width: 'auto',
      padding: '7.75px 12px',
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
        // boxShadow: `${alpha(theme.palette.primary.main, 0.25)} 0 0 0 0.2rem`,
        borderColor: theme.palette.primary.main,
        borderWidth: "2px"
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

export const DarkTooltip = styled(({ className, ...props }: TooltipProps) => (
  <Tooltip {...props} arrow classes={{ popper: className }} />
))(({ theme }) => ({
  [`& .${tooltipClasses.arrow}`]: {
    color: theme.palette.common.black,
  },
  [`& .${tooltipClasses.tooltip}`]: {
    backgroundColor: theme.palette.common.black,
  },
}));

export const HtmlTooltip = styled(({ className, ...props }: TooltipProps) => (
  <Tooltip {...props} classes={{ popper: className }} />
))(({ theme }) => ({
  [`& .${tooltipClasses.tooltip}`]: {
    backgroundColor: '#f5f5f9',
    color: 'rgba(0, 0, 0, 0.87)',
    maxWidth: 220,
    fontSize: theme.typography.pxToRem(12),
    border: '1px solid #dadde9',
  },
}));

export const BootstrapDialogTitle = (props: DialogTitleProps) => {
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

export const StyledBadge = styled(Badge)<BadgeProps>(() => ({
  '& .MuiBadge-badge': {
    right: 0,
    top: 16,
    // border: `2px solid ${theme.palette.background.paper}`,
    padding: '0 4px',
  },
}));

export function CustomTabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}