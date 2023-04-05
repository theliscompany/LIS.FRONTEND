import { Box, Card, Grid, Typography } from '@mui/material';
import React, { useEffect } from 'react';
import '../../App.css';

function Testimonies() {
  
    return (
        <Box sx={{ maxWidth: "1100px", margin: "0 auto" }}>
            <Grid container spacing={3} my={5}>
                <Grid item xs={12} fontSize={17} mx={5} mb={3}>
                    <Typography variant="h4" fontFamily="inherit">What our customers think...</Typography>
                </Grid>
                <Grid item xs={6} mb={3}>
                    <Card sx={{ minHeight: "225px", px: 3, py: 2 }}>
                        <Typography variant="h5" fontFamily="inherit" fontSize={20}>Mr Camara</Typography>
                        <Typography variant="subtitle1" fontFamily="inherit" mt={2}><em>Importer in Mauritania, Senegal, Ivory Coast, Republic of Congo and Angola.</em></Typography>
                        <Typography variant="body1" fontFamily="inherit" mt={2}>I am very happy with the work of Omnifreight and every day I am more motivated to work with them. It is an honest and decent society and they have become like brothers.</Typography>
                    </Card>
                </Grid>
                <Grid item xs={6} mb={3}>
                    <Card sx={{ minHeight: "225px", px: 3, py: 2 }}>
                        <Typography variant="h5" fontFamily="inherit" fontSize={20}>Mr Kombila</Typography>
                        <Typography variant="subtitle1" fontFamily="inherit" mt={2}><em>Importer to the Republic of Congo.</em></Typography>
                        <Typography variant="body1" fontFamily="inherit" mt={2}>Thank you for your responsiveness and professionalism. Always satisfied with Omnifreight.</Typography>
                    </Card>
                </Grid>
            </Grid>
        </Box>
    );
}

export default Testimonies;
