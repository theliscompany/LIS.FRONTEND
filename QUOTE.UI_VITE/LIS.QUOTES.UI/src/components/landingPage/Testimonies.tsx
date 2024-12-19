import { Box, Card, Grid, Typography } from '@mui/material';
import '../../App.css';
import { h4textStyles, h5textStyles, textStyles } from '../../utils/misc/styles';
import { useTranslation } from 'react-i18next';

function Testimonies() {
    
    const { t } = useTranslation();

    return (
        <Box sx={{ maxWidth: "1100px", margin: "0 auto" }}>
            <Grid container spacing={3} px={3} sx={{ my: { xs: 3, md: 5 } }}>
                <Grid item xs={12} md={12} mx={5} mb={3}>
                    <Typography variant="h4" fontFamily="inherit" sx={h4textStyles}>{t('customerTitle')}</Typography>
                </Grid>
                <Grid item xs={12} md={6} sx={{ mb: { xs: 0, md: 3 } }}>
                    <Card sx={{ minHeight: "225px", px: 3, py: 2 }}>
                        <Typography variant="h5" fontFamily="inherit" sx={h5textStyles}>Mr Camara</Typography>
                        <Typography variant="subtitle1" fontFamily="inherit" mt={2} sx={textStyles}><em>{t('customerRole1')}</em></Typography>
                        <Typography variant="body1" fontFamily="inherit" mt={2} sx={textStyles}>{t('customerMessage1')}</Typography>
                    </Card>
                </Grid>
                <Grid item xs={12} md={6} sx={{ mb: { xs: 2, md: 3 } }}>
                    <Card sx={{ minHeight: "225px", px: 3, py: 2 }}>
                        <Typography variant="h5" fontFamily="inherit"  sx={{ fontSize: { xs: 18, md: 20 } }}>Mr Kombila</Typography>
                        <Typography variant="subtitle1" fontFamily="inherit" mt={2} sx={{ fontSize: { xs: 15, md: 17 } }}><em>{t('customerRole1')}</em></Typography>
                        <Typography variant="body1" fontFamily="inherit" mt={2} sx={{ fontSize: { xs: 15, md: 17 } }}>{t('customerMessage2')}</Typography>
                    </Card>
                </Grid>
            </Grid>
        </Box>
    );
}

export default Testimonies;
