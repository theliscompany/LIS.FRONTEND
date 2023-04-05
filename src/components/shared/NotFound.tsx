import { Box, Typography } from '@mui/material';
//import React, { useEffect } from 'react';
import '../../App.css';

function NotFound() {
    /*useEffect(() => {
    fetch("https://localhost:7054/api/Users")
    .then((response) => response.json())
    .then((data) => console.log(data));
    })*/

    return (
    <div>
        <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" sx={{ height: "100vh" }}>
            <Typography variant="h4">Sorry, this page does not exist.</Typography>
            <img src="./img/bg404.jpg" alt="404 page" style={{ maxHeight: "80vh" }} />
        </Box>
    </div>
);
}

export default NotFound;
