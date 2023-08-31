import { Box, Grid, IconButton, Typography } from '@mui/material';
import FacebookRoundedIcon from '@mui/icons-material/FacebookRounded';
import '../../App.css';
import { useTranslation } from 'react-i18next';

function Footer() {
    
    const { t } = useTranslation();

    return (
        <Box sx={{ margin: "0 auto", background: "#000", color: "#EEE", position: "relative", width: "100%" }}>
            <Grid container my={5} px={3} display="flex" alignItems="center" justifyContent="center" sx={{ maxWidth: "1100px", margin: "0 auto" }}>
                <Grid item xs={12} md={6} fontSize={17} sx={{ mt: {xs: 3, md: 3}, mb: {xs: 1, md: 3}, textAlign: "left" }}> 
                    <Typography variant="subtitle2" fontFamily="inherit" fontSize={16} sx={{ color: "#6c757d" }}>© OMNIFREIGHT 2006-{new Date().getFullYear()}. {t('allRightsReserved')}.</Typography>
                </Grid>
                <Grid item xs={12} md={6} fontSize={17} sx={{ mt: {xs: 2, md: 3}, mb: {xs: 2, md: 3}, textAlign: {xs: "center", md: "right"} }}>
                    <IconButton color="primary" href="https://www.facebook.com/omnifreight/" sx={{ borderRadius: "20px", color: "#000" }}>
                        <FacebookRoundedIcon fontSize="medium" sx={{ background: "#000", color: "#fff", fontSize: "30px" }} />
                    </IconButton>
                </Grid>
            </Grid>
        </Box>
    );
}

export default Footer;
