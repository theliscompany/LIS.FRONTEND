import * as React from 'react';
import Box from '@mui/material/Box';
import MuiDrawer from '@mui/material/Drawer';
import AppBar from '@mui/material/AppBar';
import CssBaseline from '@mui/material/CssBaseline';
import Toolbar from '@mui/material/Toolbar';
import Grid from '@mui/material/Grid';
import List from '@mui/material/List';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import SettingsIcon from '@mui/icons-material/Settings';
import MenuIcon from '@mui/icons-material/Menu';
import PeopleIcon from '@mui/icons-material/PeopleAltOutlined';
import AddIcon from '@mui/icons-material/AddCircleOutline';
import HomeIcon from '@mui/icons-material/Home';
import FirstPageIcon from '@mui/icons-material/FirstPage';
import Avatar from '@mui/material/Avatar';
import Tooltip, { TooltipProps, tooltipClasses } from '@mui/material/Tooltip';
import MenuItem from '@mui/material/MenuItem';
import Menu from '@mui/material/Menu';
import IconButton from '@mui/material/IconButton';
import Button from '@mui/material/Button';
import LastPageIcon from '@mui/icons-material/LastPage';
import AutoFixHighIcon from '@mui/icons-material/AutoFixHigh';
import AppRegistrationIcon from '@mui/icons-material/AppRegistration';
import PortraitIcon from '@mui/icons-material/Portrait';
import GroupsIcon from '@mui/icons-material/Groups';
import LogoutIcon from '@mui/icons-material/Logout';
import NotificationsIcon from '@mui/icons-material/Notifications';
import RequestQuoteIcon from '@mui/icons-material/RequestQuote';
import { Badge, Container, InputAdornment } from '@mui/material';
import { Outlet, NavLink, Link } from 'react-router-dom';
import { styled, Theme, CSSObject } from '@mui/material/styles';
import { useEffect, useState } from 'react';
import { useAccount, useMsal } from '@azure/msal-react';
import '../../App.css';
import { protectedResources } from '../../authConfig';
import { useAuthorizedBackendApi } from '../../api/api';
import { BackendService } from '../../services/fetch';
import { BootstrapInput, DarkTooltip } from '../../misc/styles';
import Search from '@mui/icons-material/Search';

import { redirect, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

function stringToColor(string: string) {
    let hash = 0;
    let i;

    /* eslint-disable no-bitwise */
    for (i = 0; i < string.length; i += 1) {
        hash = string.charCodeAt(i) + ((hash << 5) - hash);
    }

    let color = '#';

    for (i = 0; i < 3; i += 1) {
        const value = (hash >> (i * 8)) & 0xff;
        color += `00${value.toString(16)}`.slice(-2);
    }
    /* eslint-enable no-bitwise */

    return color;
}

function stringAvatar(name: string | undefined) {
    return {
        sx: {
            bgcolor: name !== undefined ? stringToColor(name) : "#333",
        },
        children: `${name?.split(' ')[0][0]}`,
    };
}

const drawerWidth = 220;

const openedMixin = (theme: Theme): CSSObject => ({
    width: drawerWidth,
    transition: theme.transitions.create('width', {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
    overflowX: 'hidden',
});

const closedMixin = (theme: Theme): CSSObject => ({
    transition: theme.transitions.create('width', {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.leavingScreen,
    }),
    overflowX: 'hidden',
    width: `calc(${theme.spacing(7)} + 1px)`,
    [theme.breakpoints.up('sm')]: {
        width: `calc(${theme.spacing(8)} + 1px)`,
    },
});

const Drawer = styled(MuiDrawer, { shouldForwardProp: (prop) => prop !== 'open' })(
({ theme, open }) => ({
    width: drawerWidth,
    flexShrink: 0,
    whiteSpace: 'nowrap',
    boxSizing: 'border-box',
    ...(open && {
    ...openedMixin(theme),
    '& .MuiDrawer-paper': openedMixin(theme),
    }),
    ...(!open && {
    ...closedMixin(theme),
    '& .MuiDrawer-paper': closedMixin(theme),
    }),
}),
);

function Layout(props: {children?: React.ReactNode}) {
    const { instance, accounts } = useMsal();
    const [anchorElUser, setAnchorElUser] = useState<null | HTMLElement>(null);
    const [anchorElLang, setAnchorElLang] = useState<null | HTMLElement>(null);
    const [anchorElNotifications, setAnchorElNotifications] = useState<null | HTMLElement>(null);
    const [open, setOpen] = useState(true);
    const [notifications, setNotifications] = useState<any>(null);
    const [searchText, setSearchText] = useState<string>("");
    const account = useAccount(accounts[0] || {});

    const [anchorElNav, setAnchorElNav] = React.useState(null);

    const { t, i18n } = useTranslation();
    
    const handleOpenNavMenu = (event: any) => {
        setAnchorElNav(event.currentTarget);
    };
    
    const handleCloseNavMenu = () => {
        setAnchorElNav(null);
    };

    const navigate = useNavigate();

    const context = useAuthorizedBackendApi();

    const handleLogout = () => {
        instance.logoutRedirect();
    }
      
    const handleOpenUserMenu = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorElUser(event.currentTarget);
    };

    const handleCloseUserMenu = () => {
        setAnchorElUser(null);
    };

    const handleOpenLangMenu = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorElLang(event.currentTarget);
    };

    const handleCloseLangMenu = () => {
        setAnchorElLang(null);
    };

    const handleOpenNotificationsMenu = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorElNotifications(event.currentTarget);
    };

    const handleCloseNotificationsMenu = () => {
        setAnchorElNotifications(null);
    };

    const handleDrawerOpen = () => {
        setOpen(true);
    };

    const handleDrawerClose = () => {
        setOpen(false);
    };

    const loadRequests = async () => {
        if (context) {
            const response = await (context as BackendService<any>).getSingle(protectedResources.apiLisQuotes.endPoint+"/Request");
            if (response !== null && response.code !== undefined) {
                if (response.code === 200) {
                    setNotifications(response.data.filter((elm: any) => { return elm.status === "EnAttente" }).reverse());
                }
            }  
        }
    }

    // useEffect(() => {
    //     loadRequests();
    // }, [context]);
    
    return (
        <React.Fragment>
            <Container component="div" sx={{ display: 'flex', maxWidth: "100vw !important", padding: "0px !important", m: 0, marginTop: { xs: "0px !important", md: "60px !important;", lg: "60px !important" } }}>
                {/* App bar for mobile version */}
                <AppBar position="fixed" sx={{ 
                    zIndex: (theme) => theme.zIndex.drawer + 1, backgroundColor: "#fff", 
                    boxShadow: 0, borderBottom: "1px solid rgb(241, 242, 246)",
                    display: { xs: 'flex', md: 'none' }
                }}>
                    <Toolbar disableGutters>
                        <Grid container spacing={0}>
                            <Grid item xs={6}>
                                <Typography variant="h6" noWrap component={Link} to="/admin/" sx={{ ml: 5 }}>
                                    <img src="/img/logolisquotes.png" className="img-fluid" style={{ maxHeight: "50px", marginTop: "10px" }} alt="lisquotes" />
                                </Typography>
                            </Grid>
                            <Grid item xs={6}>
                                <IconButton
                                    size="large"
                                    onClick={handleOpenNavMenu}
                                    sx={{ color: "#333", alignItems: "center", justifyContent: "end", height: "100%", float: "right", mr: 5 }}
                                >
                                    <MenuIcon />
                                </IconButton>
                                <Menu
                                    anchorEl={anchorElNav}
                                    anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
                                    keepMounted
                                    transformOrigin={{ vertical: 'top', horizontal: 'left' }}
                                    open={Boolean(anchorElNav)}
                                    onClose={handleCloseNavMenu}
                                    sx={{ display: { xs: 'block', md: 'none' } }}
                                    PaperProps={{ sx: { width: "200px" } }}
                                >
                                    <MenuItem onClick={() => { navigate('/admin/'); handleCloseNavMenu(); }}>
                                        <Typography textAlign="center">{t('overview')}</Typography>
                                    </MenuItem>
                                    <MenuItem onClick={() => { navigate('/admin/users'); handleCloseNavMenu(); }}>
                                        <Typography textAlign="center">{t('users')}</Typography>
                                    </MenuItem>
                                    <MenuItem onClick={() => { navigate('/admin/new-request'); handleCloseNavMenu(); }}>
                                        <Typography textAlign="center">{t('newRequest')}</Typography>
                                    </MenuItem>
                                    <MenuItem onClick={() => { navigate('/admin/my-requests'); handleCloseNavMenu(); }}>
                                        <Typography textAlign="center">{t('myRequests')}</Typography>
                                    </MenuItem>
                                    <MenuItem onClick={() => { navigate('/admin/requests'); handleCloseNavMenu(); }}>
                                        <Typography textAlign="center">{t('requests')}</Typography>
                                    </MenuItem>
                                    <MenuItem onClick={() => { navigate('/admin/quote-offers'); handleCloseNavMenu(); }}>
                                        <Typography textAlign="center">{t('priceOffers')}</Typography>
                                    </MenuItem>
                                </Menu>
                            </Grid>
                            <Grid item xs={12}>
                                <BootstrapInput 
                                    type="text" 
                                    value={searchText}
                                    placeholder="Type something to search..."
                                    sx={{ ml: 5, pb: 1, minWidth: { xs: "calc(100vw - 90px)", md: "400px" } }} 
                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchText(e.target.value)} endAdornment={
                                        <InputAdornment position="end">
                                            <IconButton component={Link} to={"/admin/search/"+searchText} edge="end"><Search /></IconButton>
                                        </InputAdornment>
                                    } 
                                    onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
                                        if (e.key === "Enter") {
                                            navigate("/admin/search/"+searchText);
                                            e.preventDefault();
                                        }
                                    }}
                                /> 
                            </Grid>
                        </Grid>
                    </Toolbar>
                </AppBar>
                
                {/* App bar for laptop version */}
                <AppBar position="fixed" sx={{ 
                    zIndex: (theme) => theme.zIndex.drawer + 1, backgroundColor: "#fff", 
                    boxShadow: 0, borderBottom: "1px solid rgb(241, 242, 246)", 
                    display: { xs: 'none', md: 'flex' } }}
                >
                    <Container style={{ maxWidth: "2000px" }}>
                        <Toolbar disableGutters>
                            <Typography variant="h6" noWrap component="a" href="/admin/">
                                <img src="/img/logolisquotes.png" className="img-fluid" style={{ maxHeight: "50px", marginTop: "10px" }} alt="lisquotes" />
                            </Typography>
                            <BootstrapInput 
                                id="searchText" 
                                type="text" 
                                value={searchText}
                                placeholder="Type something to search..."
                                sx={{ ml: 5, minWidth: { md: "400px" } }} 
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchText(e.target.value)} endAdornment={
                                    <InputAdornment position="end">
                                        <IconButton component={Link} to={"/admin/search/"+searchText} edge="end"><Search /></IconButton>
                                    </InputAdornment>
                                } 
                                onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
                                    if (e.key === "Enter") {
                                        navigate("/admin/search/"+searchText);
                                        e.preventDefault();
                                    }
                                }}
                            />

                            <Box sx={{ flexGrow: 1, display: { xs: 'none', md: 'flex' } }} />
                            <Box sx={{ flexGrow: 0 }}>
                                {
                                    notifications != null ?
                                    <React.Fragment>
                                        <DarkTooltip title="Notifications">
                                            <IconButton onClick={handleOpenNotificationsMenu} size="large" sx={{ color: "rgba(0, 0, 0, 0.54)", mx: 2 }}>
                                                <Badge badgeContent={notifications.length} color="error">
                                                    <NotificationsIcon />
                                                </Badge>
                                            </IconButton>
                                        </DarkTooltip>
                                        <Menu
                                            sx={{ mt: '45px' }}
                                            PaperProps={{ sx: { width: "375px" } }}
                                            MenuListProps={{ sx: { paddingTop: "0px", paddingBottom: "0px" } }}
                                            id="menu-notifications"
                                            anchorEl={anchorElNotifications}
                                            anchorOrigin={{
                                                vertical: 'top',
                                                horizontal: 'right',
                                            }}
                                            keepMounted
                                            transformOrigin={{
                                                vertical: 'top',
                                                horizontal: 'right',
                                            }}
                                            open={Boolean(anchorElNotifications)}
                                            onClose={handleCloseNotificationsMenu}
                                        >
                                            <div style={{ height: "74px", display: "flex", flexDirection: "column", alignItems: "left", justifyContent: "center", background: "rgb(246, 248, 252)", marginBottom: "8px" }}>
                                                <Typography variant="h6" sx={{ fontWeight: "bolder", mx: 3 }}>Notifications</Typography >
                                            </div>
                                            {
                                                notifications.map((item: any, i: any) => {
                                                    return (
                                                        <MenuItem dense key={"msg-"+i} title="View" component="a" href={"/admin/request/"+item.id}>
                                                            <ListItemIcon className="cs-listitemicon">
                                                                <RequestQuoteIcon fontSize="small" />
                                                            </ListItemIcon>
                                                            <ListItemText primary={<Typography variant="subtitle2" noWrap={true}>{"Request from " + item.email}</Typography>} />
                                                        </MenuItem>)
                                                })
                                            }
                                        </Menu>

                                    </React.Fragment>
                                    : null
                                }
                                
                                <DarkTooltip title={t('changeLanguage')}>
                                    <Button sx={{ mr: 3, border: 1, borderColor: "#ced4da", borderRadius: 1, p: 1, width: "125px" }} onClick={handleOpenLangMenu}>
                                        <Box sx={{ display: "flex", flexDirection: "row", justifyContent: "center", alignItems: "center" }}>
                                            <img src={"/assets/img/flags/flag-"+i18n.language+".png"} alt="flag en" style={{ width: "16px", height: "16px" }} />
                                            <Typography fontSize={14} sx={{ mx: 1, textTransform: "none", color: "#333" }}>{i18n.language === "en" ? "English" : "Français"}</Typography>
                                        </Box>
                                    </Button>
                                </DarkTooltip>
                                <Menu
                                    sx={{ mt: '45px' }}
                                    PaperProps={{ sx: { width: "160px" } }}
                                    MenuListProps={{ sx: { paddingTop: "0px", paddingBottom: "0px" } }}
                                    anchorEl={anchorElLang}
                                    anchorOrigin={{
                                        vertical: 'top',
                                        horizontal: 'right',
                                    }}
                                    keepMounted
                                    transformOrigin={{
                                        vertical: 'top',
                                        horizontal: 'right',
                                    }}
                                    open={Boolean(anchorElLang)}
                                    onClose={handleCloseLangMenu}
                                >
                                    <MenuItem dense key={"x1-English"} title="English" onClick={() => { i18n.changeLanguage("en"); handleCloseLangMenu(); }}>
                                        <img src="/assets/img/flags/flag-en.png" style={{ width: "12px" }} />
                                        <ListItemText primary={"English"} sx={{ ml: 1 }} />
                                    </MenuItem>
                                    <MenuItem dense key={"x1-French"} title="Français" onClick={() => { i18n.changeLanguage("fr"); handleCloseLangMenu(); }}>
                                        <img src="/assets/img/flags/flag-fr.png" style={{ width: "12px" }} />
                                        <ListItemText primary={"Français"} sx={{ ml: 1 }} />
                                    </MenuItem>
                                </Menu>
                                
                                <DarkTooltip title={account?.name}>
                                    <IconButton onClick={handleOpenUserMenu} sx={{ p: 0 }}>
                                        <Avatar alt={account?.name} {...stringAvatar(account?.name)} src="../cyrillepenaye.jpg" />
                                    </IconButton>
                                </DarkTooltip>
                                <Menu
                                    sx={{ mt: '45px' }}
                                    PaperProps={{ sx: { width: "300px" } }}
                                    MenuListProps={{ sx: { paddingTop: "0px", paddingBottom: "0px" } }}
                                    anchorEl={anchorElUser}
                                    anchorOrigin={{
                                        vertical: 'top',
                                        horizontal: 'right',
                                    }}
                                    keepMounted
                                    transformOrigin={{
                                        vertical: 'top',
                                        horizontal: 'right',
                                    }}
                                    open={Boolean(anchorElUser)}
                                    onClose={handleCloseUserMenu}
                                >
                                    <div style={{ height: "148px", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", background: "rgb(246, 248, 252)", marginBottom: "8px" }}>
                                        <Avatar alt={account?.name} sx={{ width: "64px", height: "64px", marginBottom: "6px" }} src="../cyrillepenaye.jpg" />
                                        <Typography variant="subtitle2" sx={{ fontWeight: "bolder" }}>{account?.name}</Typography >
                                        <Typography variant="caption">{account?.username}</Typography>
                                    </div>
                                    <MenuItem dense key={"x1-View Profile"} title="View Profile" onClick={handleCloseUserMenu}>
                                        <ListItemIcon className="cs-listitemicon">
                                            <PortraitIcon fontSize="small" />
                                        </ListItemIcon>
                                        <ListItemText primary={"View Profile"} />
                                    </MenuItem>
                                    <MenuItem dense key={"x1-My Requests"} title="My Requests" component="a" href="/admin/my-requests">
                                        <ListItemIcon className="cs-listitemicon">
                                            <AutoFixHighIcon fontSize="small" />
                                        </ListItemIcon>
                                        <ListItemText primary={"My Requests"} />
                                    </MenuItem>
                                    <MenuItem dense key={"x1-Invite Members"} title="Invite Members" onClick={handleCloseUserMenu}>
                                        <ListItemIcon className="cs-listitemicon">
                                            <GroupsIcon fontSize="small" />
                                        </ListItemIcon>
                                        <ListItemText primary={"Invite Members"} />
                                    </MenuItem>
                                    <Divider />
                                    <MenuItem dense key={"x1-Logout"} title="Logout" onClick={handleLogout}>
                                        <ListItemIcon className="cs-listitemicon">
                                            <LogoutIcon fontSize="small" />
                                        </ListItemIcon>
                                        <ListItemText primary={"Logout"} />
                                    </MenuItem>
                                </Menu>
                            </Box>
                        </Toolbar>
                    </Container>
                </AppBar>
                
                {/* Drawer for laptop version */}
                <Drawer
                    variant="permanent"
                    open={open}
                    sx={{
                        width: drawerWidth,
                        flexShrink: 0,
                        boxSizing: 'border-box',
                        display: { xs: 'none', md: 'flex' }
                    }}
                    PaperProps={{ sx: { borderRight: open ? "1px solid rgb(241, 242, 246)" : 0 } }}
                >
                    <Toolbar />
                    <Box sx={{ overflow: 'none', margin: "0 10px", marginTop: "8px" }}>
                        <List dense>
                            <NavLink to="/admin/" className={({ isActive }) => isActive ? "cs-navlink-active" : "cs-navlink"}>
                                <ListItem className="cs-listitem" key={"Overview"} disablePadding disableGutters>
                                <DarkTooltip title={t('overview')} placement="right" arrow>
                                    <ListItemButton className="cs-listitembutton">
                                        <ListItemIcon className="cs-listitemicon">
                                            <HomeIcon fontSize="small" />
                                        </ListItemIcon>
                                        <ListItemText primary={t('overview')} />
                                    </ListItemButton>
                                </DarkTooltip>
                                </ListItem>
                            </NavLink>
                            <NavLink to="/admin/users" className={({ isActive }) => isActive ? "cs-navlink-active" : "cs-navlink"}>
                                <ListItem className="cs-listitem" key={"Users"} disablePadding disableGutters>
                                <DarkTooltip title="Users" placement="right" arrow>
                                    <ListItemButton className="cs-listitembutton">
                                        <ListItemIcon className="cs-listitemicon">
                                            <PeopleIcon fontSize="small" />
                                        </ListItemIcon>
                                        <ListItemText primary={t('users')} />
                                    </ListItemButton>
                                </DarkTooltip>
                                </ListItem>
                            </NavLink>
                            <NavLink to="/admin/new-request" className={({ isActive }) => isActive ? "cs-navlink-active" : "cs-navlink"}>
                                <ListItem className="cs-listitem" key={"New request"} disablePadding disableGutters>
                                <DarkTooltip title="New request" placement="right" arrow>
                                    <ListItemButton className="cs-listitembutton">
                                        <ListItemIcon className="cs-listitemicon">
                                            <AddIcon fontSize="small" />
                                        </ListItemIcon>
                                        <ListItemText primary={t('newRequest')} />
                                    </ListItemButton>
                                </DarkTooltip>
                                </ListItem>
                            </NavLink>
                            <NavLink to="/admin/my-requests" className={({ isActive }) => isActive ? "cs-navlink-active" : "cs-navlink"}>
                                <ListItem className="cs-listitem" key={"My requests"} disablePadding disableGutters>
                                <DarkTooltip title="My requests" placement="right" arrow>
                                    <ListItemButton className="cs-listitembutton">
                                        <ListItemIcon className="cs-listitemicon">
                                            <AutoFixHighIcon fontSize="small" />
                                        </ListItemIcon>
                                        <ListItemText primary={t('myRequests')} />
                                    </ListItemButton>
                                </DarkTooltip>
                                </ListItem>
                            </NavLink>
                            <NavLink to="/admin/requests" className={({ isActive }) => isActive ? "cs-navlink-active" : "cs-navlink"}>
                                <ListItem className="cs-listitem" key={"Requests"} disablePadding disableGutters>
                                <DarkTooltip title="Requests" placement="right" arrow>
                                    <ListItemButton className="cs-listitembutton">
                                        <ListItemIcon className="cs-listitemicon">
                                            <NotificationsIcon fontSize="small" />
                                        </ListItemIcon>
                                        <ListItemText primary={t('requests')} />
                                    </ListItemButton>
                                </DarkTooltip>
                                </ListItem>
                            </NavLink>
                            <NavLink to="/admin/quote-offers" className={({ isActive }) => isActive ? "cs-navlink-active" : "cs-navlink"}>
                                <ListItem className="cs-listitem" key={"Price offers"} disablePadding disableGutters>
                                <DarkTooltip title="Price offers" placement="right" arrow>
                                    <ListItemButton className="cs-listitembutton">
                                        <ListItemIcon className="cs-listitemicon">
                                            <PortraitIcon fontSize="small" />
                                        </ListItemIcon>
                                        <ListItemText primary={t('priceOffers')} />
                                    </ListItemButton>
                                </DarkTooltip>
                                </ListItem>
                            </NavLink>
                        </List>
                        
                        <List dense sx={{ position: "absolute", bottom: "0px", left: "10px", right: "10px" }}>
                            <ListItem className="cs-listitem" key={"Collapse"} disablePadding disableGutters>
                                <DarkTooltip title="Collapse" placement="right" arrow>
                                    <ListItemButton className="cs-listitembutton" onClick={open ? handleDrawerClose : handleDrawerOpen}>
                                        <ListItemIcon className="cs-listitemicon">
                                            {open ? <FirstPageIcon fontSize="small" /> : <LastPageIcon fontSize="small" />}
                                        </ListItemIcon>
                                        <ListItemText primary={t('collapse')} />
                                    </ListItemButton>
                                </DarkTooltip>
                            </ListItem>
                        </List>
                    </Box>
                </Drawer>
                
                <Box sx={{ 
                    mt: { xs: 10, md: 0 }, 
                    flexGrow: { xs: 0, md: 1 }, p: { xs: 0, md: 3 },
                    background: "#f9fafb", minHeight: "100vh" 
                }}>
                    <Outlet />
                </Box>
            </Container>
        </React.Fragment>
    );
}

export default Layout;