import React, { useEffect } from 'react';
import { Box, Card, Grid, Paper, Typography } from '@mui/material';
import './App.css';

function Landing() {
    const overlayStyles = {
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1,
    };
      
    const imageStyles = {
        //position: 'relative',
        //zIndex: 0,
        width: "100vw"
    };
      
    const contentStyles = {
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        zIndex: 2,
    };

    return (
        <div className="App">
            <Box position="relative">
                <Paper sx={overlayStyles} />
                <img style={imageStyles} src={"/assets/img/backimage.png"} alt="overlay" />
                <Box sx={contentStyles}>
                    <img src={"/assets/img/logo-omnifreight-big.png"} style={{ backgroundColor: "#fff", padding: "5px 125px", width: "450px" }} alt="omnifreight pro" />

                    <Grid container>
                        <Grid item>
                            <Card>
                                Card 1
                            </Card>
                        </Grid>
                        <Grid item>
                            <Card>
                                Card 2
                            </Card>
                        </Grid>
                        <Grid item>
                            <Card>
                                Card 3
                            </Card>
                        </Grid>
                    </Grid>
                </Box>
            </Box>
            
            <Box hidden sx={{ background: 'url("/assets/img/backimage.png") no-repeat center center', backgroundSize: "cover", height: "100vh", opacity: 0.7 }}>
                <Box p={1} sx={{ backgroundColor: "#fff", width: "650px" }}>
                    <img src={"/assets/img/logo-omnifreight-big.png"} alt="omnifreight pro" />
                </Box>
            </Box>
        </div>
    );
}

export default Landing;
