import { Loop } from "@mui/icons-material";
import { styled } from "@mui/material/styles";

const SpinningIcon = styled(Loop)(() => ({
    animation: 'spin 1s linear infinite',
    '@keyframes spin':{
        '0%': {
            transform: 'rotate(0deg)',
        },
        '100%': {
            transform: 'rotate(360deg)',
        },
    }
}));


export default SpinningIcon;