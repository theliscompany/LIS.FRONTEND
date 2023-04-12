import { Box, Typography } from '@mui/material';
//import React, { useEffect } from 'react';
import '../../App.css';

function NotFound() {
    
    return (
    <div>
        <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" sx={{ height: "100vh" }}>
            <Typography variant="h4" sx={{ fontSize: { xs: 18, md: 27 } }}>Sorry, this page does not exist.</Typography>
            <img src="./img/bg404.jpg" alt="404 page" style={{ maxHeight: "80vh", maxWidth: "80vw" }} />
        </Box>
    </div>
);
}

export default NotFound;
