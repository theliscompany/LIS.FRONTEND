import { Box, Grid, IconButton, Typography } from '@mui/material';
import React, { useEffect } from 'react';
import FacebookIcon from '@mui/icons-material/Facebook';
import FacebookRoundedIcon from '@mui/icons-material/FacebookRounded';
import '../../App.css';

function Footer() {
  
    return (
        <Box sx={{ margin: "0 auto", background: "#000", color: "#EEE", position: "relative", width: "100%" }}>
            <Grid container my={5} display="flex" alignItems="center" justifyContent="center" sx={{ maxWidth: "1100px", margin: "0 auto" }}>
                <Grid item xs={6} fontSize={17} my={3} sx={{ textAlign: "left" }}> 
                    <Typography variant="subtitle2" fontFamily="inherit" fontSize={16} sx={{ color: "#6c757d" }}>© OMNIFREIGHT 2006-{new Date().getFullYear()}. All rights reserved.</Typography>
                </Grid>
                <Grid item xs={6} fontSize={17} my={3} sx={{ textAlign: "right" }}>
                    <IconButton color="primary" href="https://www.facebook.com/omnifreight/" sx={{ borderRadius: "20px", color: "#000" }}>
                        <FacebookRoundedIcon fontSize="medium" sx={{ background: "#000", color: "#fff", fontSize: "30px" }} />
                    </IconButton>
                </Grid>
            </Grid>
        </Box>
    );
}

export default Footer;
