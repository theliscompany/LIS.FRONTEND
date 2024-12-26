import React from 'react';
import Box from '@mui/material/Box';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid2';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import LockOpenIcon from '@mui/icons-material/LockOpen';
import Card from '@mui/material/Card';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import { useMsal  } from '@azure/msal-react';
import { loginRequest } from '../config/msalConfig';

function Login() {
	const { instance } = useMsal();
	
	const handleLogin = () => {
		instance.loginRedirect(loginRequest);
	}

	return (
		<React.Fragment>
			<Box sx={{ flexGrow: 1 }}>
				<AppBar position="static" sx={{ background: "#fff", boxShadow: 0, borderBottom: "1px solid rgb(241, 242, 246)" }}>
					<Toolbar variant="dense" sx={{ margin: "0 auto" }}>
						<Typography variant="h6" noWrap component="a" href="/" sx={{ display: "flex", margin: "5px 0" }}>
							<img src="/img/lisquoteslogo.png" className="img-fluid" style={{ maxHeight: "75px" }} alt="lisquotes" />
						</Typography>
					</Toolbar>
				</AppBar>
				<Grid container spacing={0}>
					<Grid size={{ xs: 12, md: 4 }} px={4} sx={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", pt: { xs: 0, md: 3 }, height: { xs: "420px", md: "calc(100vh - 60px)"}, backgroundColor: "#008089" }}>
						<Card variant="outlined" sx={{ padding: "30px" }}>
						<Alert severity="info" icon={<InfoOutlinedIcon sx={{ color: "#333" }} fontSize="small" />} sx={{ color: "#333", background: "rgb(235, 238, 249)" }}>
							<Typography variant="subtitle2" fontFamily="inherit">Please sign in to continue.</Typography>
						</Alert>
						<Typography variant="h5" fontFamily="inherit" mt={4}>Sign in</Typography>
						<Typography variant="body2" fontFamily="inherit" mt={1} mb={5}>Do you need an account? <a href="/login#">Contact the admin</a></Typography>

						<Button variant="contained" color="success" endIcon={<LockOpenIcon />} size="large" sx={{ textTransform: "none", background: "#008089" }} fullWidth disableElevation onClick={handleLogin}>
							Sign in with one click
						</Button>
						</Card>
					</Grid>
					<Grid size={{ xs: 12, md: 8 }} p={3} sx={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", backgroundColor: "#68b7d7" }}>
						<img src="/img/login-image.svg" alt="login" style={{ width: "60%", display: "block", margin: "0 auto" }} />
						<Typography variant="h4" mt={3} fontFamily="inherit" color="#fff" sx={{ fontSize: { xs: 24 } }}><span>Welcome! Your adventure starts here...</span></Typography>
						<Typography variant="body1" mt={2} fontFamily="inherit" mb={3} color="#fff">Discover LIS QUOTES, your application for managing requests for quotes.</Typography>
					</Grid>
				</Grid>
			</Box>
			<Box sx={{ flexGrow: 1 }} />
		</React.Fragment>
	);
}

export default Login;
