import { AppBar, Avatar, Box, Button, Collapse, Container, Divider, Drawer, IconButton, InputAdornment, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Menu, MenuItem, Toolbar, Typography } from "@mui/material";
import Grid from "@mui/material/Grid2";
import React, { useState } from "react";
import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";
import { BootstrapInput, DarkTooltip } from "../utils/misc/styles";
import { useTranslation } from "react-i18next";
import AddIcon from '@mui/icons-material/Add';
import AnchorOutlinedIcon from '@mui/icons-material/AnchorOutlined';
import AssignmentOutlinedIcon from '@mui/icons-material/AssignmentOutlined';
import AttachFileOutlinedIcon from '@mui/icons-material/AttachFileOutlined';
import AutoFixHighIcon from '@mui/icons-material/AutoFixHigh';
import ContactsOutlinedIcon from '@mui/icons-material/ContactsOutlined';
import DirectionsBoatIcon from '@mui/icons-material/DirectionsBoat';
import DirectionsBoatOutlinedIcon from '@mui/icons-material/DirectionsBoatOutlined';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import FirstPageIcon from '@mui/icons-material/FirstPage';
import FolderOutlinedIcon from '@mui/icons-material/FolderOutlined';
import GroupsIcon from '@mui/icons-material/Groups';
import HomeIcon from '@mui/icons-material/Home';
import Inventory2Icon from '@mui/icons-material/Inventory2';
import InventoryOutlinedIcon from '@mui/icons-material/InventoryOutlined';
import LastPageIcon from '@mui/icons-material/LastPage';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import LogoutIcon from '@mui/icons-material/Logout';
import MenuIcon from '@mui/icons-material/Menu';
import NotificationsIcon from '@mui/icons-material/Notifications';
import RequestQuoteOutlinedIcon from '@mui/icons-material/RequestQuoteOutlined';
import PeopleIcon from '@mui/icons-material/People';
import PortraitIcon from '@mui/icons-material/Portrait';
import RoomServiceOutlinedIcon from '@mui/icons-material/RoomServiceOutlined';
import SearchIcon from '@mui/icons-material/Search';
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined';
import TaskAltOutlinedIcon from '@mui/icons-material/TaskAltOutlined';
import TextSnippetOutlinedIcon from '@mui/icons-material/TextSnippetOutlined';
import { useAccount, useMsal } from "@azure/msal-react";
import { stringAvatar } from "../utils/functions";

const drawerWidth = 220;

const Layout = () : React.ReactNode => {

    const { instance, accounts } = useMsal();
    const { t, i18n } = useTranslation();
    const navigate = useNavigate();
    const account = useAccount(accounts[0] || {});

    const [anchorElNav, setAnchorElNav] = useState<null | HTMLElement>(null);
    const [anchorElUser, setAnchorElUser] = useState<null | HTMLElement>(null);
    const [searchText, setSearchText] = useState<string>("");
    const [anchorElLang, setAnchorElLang] = useState<null | HTMLElement>(null);
    const [open, setOpen] = useState(true);
    const [openRequests, setOpenRequests] = useState<boolean>(false);
    const [openPrices, setOpenPrices] = useState<boolean>(false);
    const [openMasterdata, setOpenMasterdata] = useState<boolean>(false);

    const handleOpenNavMenu = (event: React.MouseEvent<HTMLButtonElement>) => {
        setAnchorElNav(event.currentTarget);
    };

    const handleCloseNavMenu = () => {
        setAnchorElNav(null);
    };

    const handleCloseLangMenu = () => {
        setAnchorElLang(null);
    };

    const handleOpenLangMenu = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorElLang(event.currentTarget);
    };

    const handleOpenUserMenu = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorElUser(event.currentTarget);
    };

    const handleCloseUserMenu = () => {
        setAnchorElUser(null);
    };

    const handleLogout = () => {
        instance.logoutRedirect();
    }
    
    const handleDrawerClose = () => {
        setOpen(false);
        setOpenMasterdata(false);
        setOpenPrices(false);
        setOpenRequests(false);
    };

    const handleDrawerOpen = () => {
        setOpen(true);
    };

    return (
        <>
            <Container component="div" sx={{ 
                display: 'flex', maxWidth: "100vw !important", padding: "0px !important", m: 0, marginTop: { xs: "0px !important", md: "60px !important;", lg: "60px !important" }}}>
                    {/* App bar for mobile version */}
                <AppBar position="fixed" sx={{ 
                    zIndex: (theme) => theme.zIndex.drawer + 1, backgroundColor: "#fff", 
                    boxShadow: 0, borderBottom: "1px solid rgb(241, 242, 246)",
                    display: { xs: 'flex', md: 'none' }
                }}>
                    <Toolbar disableGutters>
                        <Grid container spacing={0}>
                            <Grid size={6}>
                                <Typography variant="h6" noWrap component={Link} to="/" sx={{ ml: 5 }}>
                                    <img src="/img/logolisquotes.png" className="img-fluid" style={{ maxHeight: "50px", marginTop: "10px" }} alt="lisquotes" />
                                </Typography>
                            </Grid>
                            <Grid size={6}>
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
                                    <MenuItem onClick={() => { navigate('/admin/seafreights'); handleCloseNavMenu(); }}>
                                        <Typography textAlign="center">{t('seafreights')}</Typography>
                                    </MenuItem>
                                    <MenuItem onClick={() => { navigate('/admin/haulages'); handleCloseNavMenu(); }}>
                                        <Typography textAlign="center">{t('haulages')}</Typography>
                                    </MenuItem>
                                    <MenuItem onClick={() => { navigate('/admin/miscellaneous'); handleCloseNavMenu(); }}>
                                        <Typography textAlign="center">{t('miscellaneous')}</Typography>
                                    </MenuItem>
                                </Menu>
                            </Grid>
                            <Grid size={12}>
                                <BootstrapInput 
                                    type="text" 
                                    value={searchText}
                                    placeholder={t('typeSomethingSearch')}
                                    sx={{ ml: 5, pb: 1, minWidth: { xs: "calc(100vw - 90px)", md: "400px" } }} 
                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchText(e.target.value)} endAdornment={
                                        <InputAdornment position="end">
                                            <IconButton component={Link} to={"/admin/search/"+searchText} edge="end"><SearchIcon /></IconButton>
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
                                placeholder={t('typeSomethingSearch')}
                                sx={{ ml: 5, minWidth: { md: "400px" } }} 
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchText(e.target.value)} endAdornment={
                                    <InputAdornment position="end">
                                        <IconButton component={Link} to={"/admin/search/"+searchText} edge="end"><SearchIcon /></IconButton>
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
                                    anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
                                    keepMounted
                                    transformOrigin={{ vertical: 'top', horizontal: 'right' }}
                                    open={Boolean(anchorElLang)}
                                    onClose={handleCloseLangMenu}
                                >
                                    <MenuItem dense key={"x1-English"} title="English" onClick={() => { i18n.changeLanguage("en"); handleCloseLangMenu(); }}>
                                        <img src="/assets/img/flags/flag-en.png" style={{ width: "12px" }} alt="flag english" />
                                        <ListItemText primary={"English"} sx={{ ml: 1 }} />
                                    </MenuItem>
                                    <MenuItem dense key={"x1-French"} title="Français" onClick={() => { i18n.changeLanguage("fr"); handleCloseLangMenu(); }}>
                                        <img src="/assets/img/flags/flag-fr.png" style={{ width: "12px" }} alt="flag french" />
                                        <ListItemText primary={"Français"} sx={{ ml: 1 }} />
                                    </MenuItem>
                                </Menu>
                                
                                <DarkTooltip title={account?.name}>
                                    <IconButton onClick={handleOpenUserMenu} sx={{ p: 0 }}>
                                        <Avatar alt={account?.name} {...stringAvatar(account?.name)} />
                                    </IconButton>
                                </DarkTooltip>
                                <Menu
                                    sx={{ mt: '45px' }}
                                    PaperProps={{ sx: { width: "300px" } }}
                                    MenuListProps={{ sx: { paddingTop: "0px", paddingBottom: "0px" } }}
                                    anchorEl={anchorElUser}
                                    anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
                                    keepMounted
                                    transformOrigin={{ vertical: 'top', horizontal: 'right' }}
                                    open={Boolean(anchorElUser)}
                                    onClose={handleCloseUserMenu}
                                >
                                    <div style={{ height: "148px", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", background: "rgb(246, 248, 252)", marginBottom: "8px" }}>
                                        <Avatar alt={account?.name} sx={{ width: "64px", height: "64px", marginBottom: "6px" }} src="../cyrillepenaye.jpg" />
                                        <Typography variant="subtitle2" sx={{ fontWeight: "bolder" }}>{account?.name}</Typography >
                                        <Typography variant="caption">{account?.username}</Typography>
                                    </div>
                                    <MenuItem dense key={"x1-View Profile"} title={t('viewProfile')} onClick={handleCloseUserMenu}>
                                        <ListItemIcon className="cs-listitemicon">
                                            <PortraitIcon fontSize="small" />
                                        </ListItemIcon>
                                        <ListItemText primary={t('viewProfile')} slotProps={{primary:{
                                            fontSize: 13
                                        }}}  />
                                    </MenuItem>
                                    <MenuItem dense key={"x1-My Requests"} title={t('myRequests')} component="a" href="/admin/my-requests">
                                        <ListItemIcon className="cs-listitemicon">
                                            <AutoFixHighIcon fontSize="small" />
                                        </ListItemIcon>
                                        <ListItemText primary={t('myRequests')} slotProps={{primary:{
                                            fontSize: 13
                                        }}} />
                                    </MenuItem>
                                    <MenuItem dense key={"x1-Invite Members"} title={t('inviteMembers')} onClick={handleCloseUserMenu}>
                                        <ListItemIcon className="cs-listitemicon">
                                            <GroupsIcon fontSize="small" />
                                        </ListItemIcon>
                                        <ListItemText primary={t('inviteMembers')} slotProps={{primary:{
                                            fontSize: 13
                                        }}} />
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
                                        <ListItemText primary={t('overview')} primaryTypographyProps={{ fontSize: 13 }} />
                                    </ListItemButton>
                                </DarkTooltip>
                                </ListItem>
                            </NavLink>
                            <NavLink to="/admin/users" className={({ isActive }) => isActive ? "cs-navlink-active" : "cs-navlink"}>
                                <ListItem className="cs-listitem" key={"Users"} disablePadding disableGutters>
                                <DarkTooltip title={t('users')} placement="right" arrow>
                                    <ListItemButton className="cs-listitembutton">
                                        <ListItemIcon className="cs-listitemicon">
                                            <PeopleIcon fontSize="small" />
                                        </ListItemIcon>
                                        <ListItemText primary={t('users')} primaryTypographyProps={{ fontSize: 13 }} />
                                    </ListItemButton>
                                </DarkTooltip>
                                </ListItem>
                            </NavLink>
                            <ListItem className="cs-listitem" key={"Requests part"} disablePadding disableGutters>
                                <ListItemButton className="cs-listitembutton" onClick={() => { setOpenRequests(!openRequests); }}>
                                    <ListItemIcon className="cs-listitemicon">
                                        <AssignmentOutlinedIcon fontSize="small" />
                                    </ListItemIcon>
                                    <ListItemText primary={t('requests')} primaryTypographyProps={{ fontSize: 13 }} />
                                    {openRequests ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                                </ListItemButton>
                            </ListItem>
                            <Collapse in={openRequests} timeout="auto" unmountOnExit>
                                <List component="div" disablePadding>
                                    <NavLink to="/admin/new-request" className={({ isActive }) => isActive ? "cs-navlink-active" : "cs-navlink"}>
                                        <ListItem className="cs-listitem" key={"New request"} disablePadding disableGutters sx={{ pl: 2 }}>
                                        <DarkTooltip title={t('newRequest')} placement="right" arrow>
                                            <ListItemButton className="cs-listitembutton">
                                                <ListItemIcon className="cs-listitemicon">
                                                    <AddIcon fontSize="small" />
                                                </ListItemIcon>
                                                <ListItemText primary={t('newRequest')} primaryTypographyProps={{ fontSize: 13 }} />
                                            </ListItemButton>
                                        </DarkTooltip>
                                        </ListItem>
                                    </NavLink>
                                    <NavLink to="/admin/my-requests" className={({ isActive }) => isActive ? "cs-navlink-active" : "cs-navlink"}>
                                        <ListItem className="cs-listitem" key={"My requests"} disablePadding disableGutters sx={{ pl: 2 }}>
                                        <DarkTooltip title={t('myRequests')} placement="right" arrow>
                                            <ListItemButton className="cs-listitembutton">
                                                <ListItemIcon className="cs-listitemicon">
                                                    <AutoFixHighIcon fontSize="small" />
                                                </ListItemIcon>
                                                <ListItemText primary={t('myRequests')} primaryTypographyProps={{ fontSize: 13 }} />
                                            </ListItemButton>
                                        </DarkTooltip>
                                        </ListItem>
                                    </NavLink>
                                    <NavLink to="/admin/requests" className={({ isActive }) => isActive ? "cs-navlink-active" : "cs-navlink"}>
                                        <ListItem className="cs-listitem" key={"Requests"} disablePadding disableGutters sx={{ pl: 2 }}>
                                        <DarkTooltip title={t('requests')} placement="right" arrow>
                                            <ListItemButton className="cs-listitembutton">
                                                <ListItemIcon className="cs-listitemicon">
                                                    <NotificationsIcon fontSize="small" />
                                                </ListItemIcon>
                                                <ListItemText primary={t('requests')} primaryTypographyProps={{ fontSize: 13 }} />
                                            </ListItemButton>
                                        </DarkTooltip>
                                        </ListItem>
                                    </NavLink>
                                    <NavLink to="/admin/pending-requests" className={({ isActive }) => isActive ? "cs-navlink-active" : "cs-navlink"}>
                                        <ListItem className="cs-listitem" key={"Pending requests"} disablePadding disableGutters sx={{ pl: 2 }}>
                                        <DarkTooltip title={t('pendingRequests')} placement="right" arrow>
                                            <ListItemButton className="cs-listitembutton">
                                                <ListItemIcon className="cs-listitemicon">
                                                    <TaskAltOutlinedIcon fontSize="small" />
                                                </ListItemIcon>
                                                <ListItemText primary={t('pendingRequests')} primaryTypographyProps={{ fontSize: 13 }} />
                                            </ListItemButton>
                                        </DarkTooltip>
                                        </ListItem>
                                    </NavLink>
                                </List>
                            </Collapse>
                            
                            <ListItem className="cs-listitem" key={"Prices part"} disablePadding disableGutters>
                                <ListItemButton className="cs-listitembutton" onClick={() => { setOpenPrices(!openPrices); }}>
                                    <ListItemIcon className="cs-listitemicon">
                                        <RequestQuoteOutlinedIcon fontSize="small" />
                                    </ListItemIcon>
                                    <ListItemText primary={t('pricing')} primaryTypographyProps={{ fontSize: 13 }} />
                                    {openPrices ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                                </ListItemButton>
                            </ListItem>
                            <Collapse in={openPrices} timeout="auto" unmountOnExit>
                                <List component="div" disablePadding>
                                    <NavLink to="/admin/haulages" className={({ isActive }) => isActive ? "cs-navlink-active" : "cs-navlink"}>
                                        <ListItem className="cs-listitem" key={"Haulages"} disablePadding disableGutters sx={{ pl: 2 }}>
                                        <DarkTooltip title={t('haulages')} placement="right" arrow>
                                            <ListItemButton className="cs-listitembutton">
                                                <ListItemIcon className="cs-listitemicon">
                                                    <LocalShippingIcon fontSize="small" />
                                                </ListItemIcon>
                                                <ListItemText primary={t('haulages')} primaryTypographyProps={{ fontSize: 13 }} />
                                            </ListItemButton>
                                        </DarkTooltip>
                                        </ListItem>
                                    </NavLink>
                                    <NavLink to="/admin/seafreights" className={({ isActive }) => isActive ? "cs-navlink-active" : "cs-navlink"}>
                                        <ListItem className="cs-listitem" key={"Seafreights"} disablePadding disableGutters sx={{ pl: 2 }}>
                                        <DarkTooltip title={t('seafreights')} placement="right" arrow>
                                            <ListItemButton className="cs-listitembutton">
                                                <ListItemIcon className="cs-listitemicon">
                                                    <DirectionsBoatIcon fontSize="small" />
                                                </ListItemIcon>
                                                <ListItemText primary={t('seafreights')} primaryTypographyProps={{ fontSize: 13 }} />
                                            </ListItemButton>
                                        </DarkTooltip>
                                        </ListItem>
                                    </NavLink>
                                    <NavLink to="/admin/miscellaneous" className={({ isActive }) => isActive ? "cs-navlink-active" : "cs-navlink"}>
                                        <ListItem className="cs-listitem" key={"Miscellaneous"} disablePadding disableGutters sx={{ pl: 2 }}>
                                        <DarkTooltip title={t('miscellaneous')} placement="right" arrow>
                                            <ListItemButton className="cs-listitembutton">
                                                <ListItemIcon className="cs-listitemicon">
                                                    <Inventory2Icon fontSize="small" />
                                                </ListItemIcon>
                                                <ListItemText primary={t('miscellaneous')} primaryTypographyProps={{ fontSize: 13 }} />
                                            </ListItemButton>
                                        </DarkTooltip>
                                        </ListItem>
                                    </NavLink>
                                </List>
                            </Collapse>

                            <NavLink to="/admin/quote-offers" className={({ isActive }) => isActive ? "cs-navlink-active" : "cs-navlink"}>
                                <ListItem className="cs-listitem" key={"Price offers"} disablePadding disableGutters>
                                <DarkTooltip title={t('priceOffers')} placement="right" arrow>
                                    <ListItemButton className="cs-listitembutton">
                                        <ListItemIcon className="cs-listitemicon">
                                            <PortraitIcon fontSize="small" />
                                        </ListItemIcon>
                                        <ListItemText primary={t('priceOffers')} primaryTypographyProps={{ fontSize: 13 }} />
                                    </ListItemButton>
                                </DarkTooltip>
                                </ListItem>
                            </NavLink>
                            
                            <NavLink to="/admin/orders" className={({ isActive }) => isActive ? "cs-navlink-active" : "cs-navlink"}>
                                <ListItem className="cs-listitem" key={"Orders"} disablePadding disableGutters>
                                <DarkTooltip title={t('orders')} placement="right" arrow>
                                    <ListItemButton className="cs-listitembutton">
                                        <ListItemIcon className="cs-listitemicon">
                                            <FolderOutlinedIcon fontSize="small" />
                                        </ListItemIcon>
                                        <ListItemText primary={t('orders')} primaryTypographyProps={{ fontSize: 13 }} />
                                    </ListItemButton>
                                </DarkTooltip>
                                </ListItem>
                            </NavLink>
                            
                            <NavLink to="/admin/templates" className={({ isActive }) => isActive ? "cs-navlink-active" : "cs-navlink"}>
                                <ListItem className="cs-listitem" key={"Templates"} disablePadding disableGutters>
                                <DarkTooltip title={t('templates')} placement="right" arrow>
                                    <ListItemButton className="cs-listitembutton">
                                        <ListItemIcon className="cs-listitemicon">
                                            <TextSnippetOutlinedIcon fontSize="small" />
                                        </ListItemIcon>
                                        <ListItemText primary={t('templates')} primaryTypographyProps={{ fontSize: 13 }} />
                                    </ListItemButton>
                                </DarkTooltip>
                                </ListItem>
                            </NavLink>
                            
                            <ListItem className="cs-listitem" key={"Masterdata part"} disablePadding disableGutters>
                                <ListItemButton className="cs-listitembutton" onClick={() => { setOpenMasterdata(!openMasterdata); }}>
                                    <ListItemIcon className="cs-listitemicon">
                                        <SettingsOutlinedIcon fontSize="small" />
                                    </ListItemIcon>
                                    <ListItemText primary={t('masterdata')} primaryTypographyProps={{ fontSize: 13 }} />
                                    {openMasterdata ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                                </ListItemButton>
                            </ListItem>
                            <Collapse in={openMasterdata} timeout="auto" unmountOnExit>
                                <List component="div" disablePadding>
                                    <NavLink to="/admin/services" className={({ isActive }) => isActive ? "cs-navlink-active" : "cs-navlink"}>
                                        <ListItem className="cs-listitem" key={"Services"} disablePadding disableGutters sx={{ pl: 2 }}>
                                        <DarkTooltip title={t('services')} placement="right" arrow>
                                            <ListItemButton className="cs-listitembutton">
                                                <ListItemIcon className="cs-listitemicon">
                                                    <RoomServiceOutlinedIcon fontSize="small" />
                                                </ListItemIcon>
                                                <ListItemText primary={t('services')} primaryTypographyProps={{ fontSize: 13 }} />
                                            </ListItemButton>
                                        </DarkTooltip>
                                        </ListItem>
                                    </NavLink>
                                    {/* <NavLink to="/admin/products" className={({ isActive }) => isActive ? "cs-navlink-active" : "cs-navlink"}>
                                        <ListItem className="cs-listitem" key={"Products"} disablePadding disableGutters sx={{ pl: 2 }}>
                                        <DarkTooltip title={t('products')} placement="right" arrow>
                                            <ListItemButton className="cs-listitembutton">
                                                <ListItemIcon className="cs-listitemicon">
                                                    <InventoryOutlined fontSize="small" />
                                                </ListItemIcon>
                                                <ListItemText primary={t('products')} primaryTypographyProps={{ fontSize: 13 }} />
                                            </ListItemButton>
                                        </DarkTooltip>
                                        </ListItem>
                                    </NavLink> */}
                                    <NavLink to="/admin/hscodes" className={({ isActive }) => isActive ? "cs-navlink-active" : "cs-navlink"}>
                                        <ListItem className="cs-listitem" key={"HS Codes"} disablePadding disableGutters sx={{ pl: 2 }}>
                                        <DarkTooltip title={t('hscodes')} placement="right" arrow>
                                            <ListItemButton className="cs-listitembutton">
                                                <ListItemIcon className="cs-listitemicon">
                                                    <InventoryOutlinedIcon fontSize="small" />
                                                </ListItemIcon>
                                                <ListItemText primary={t('hscodes')} primaryTypographyProps={{ fontSize: 13 }} />
                                            </ListItemButton>
                                        </DarkTooltip>
                                        </ListItem>
                                    </NavLink>
                                    <NavLink to="/admin/ports" className={({ isActive }) => isActive ? "cs-navlink-active" : "cs-navlink"}>
                                        <ListItem className="cs-listitem" key={"Ports"} disablePadding disableGutters sx={{ pl: 2 }}>
                                        <DarkTooltip title={t('ports')} placement="right" arrow>
                                            <ListItemButton className="cs-listitembutton">
                                                <ListItemIcon className="cs-listitemicon">
                                                    <AnchorOutlinedIcon fontSize="small" />
                                                </ListItemIcon>
                                                <ListItemText primary={t('ports')} primaryTypographyProps={{ fontSize: 13 }} />
                                            </ListItemButton>
                                        </DarkTooltip>
                                        </ListItem>
                                    </NavLink>
                                    <NavLink to="/admin/contacts" className={({ isActive }) => isActive ? "cs-navlink-active" : "cs-navlink"}>
                                        <ListItem className="cs-listitem" key={"Contacts"} disablePadding disableGutters sx={{ pl: 2 }}>
                                        <DarkTooltip title={t('contacts')} placement="right" arrow>
                                            <ListItemButton className="cs-listitembutton">
                                                <ListItemIcon className="cs-listitemicon">
                                                    <ContactsOutlinedIcon fontSize="small" />
                                                </ListItemIcon>
                                                <ListItemText primary={t('contacts')} primaryTypographyProps={{ fontSize: 13 }} />
                                            </ListItemButton>
                                        </DarkTooltip>
                                        </ListItem>
                                    </NavLink>
                                    <NavLink to="/admin/ships" className={({ isActive }) => isActive ? "cs-navlink-active" : "cs-navlink"}>
                                        <ListItem className="cs-listitem" key={"Ships"} disablePadding disableGutters sx={{ pl: 2 }}>
                                        <DarkTooltip title={t('ships')} placement="right" arrow>
                                            <ListItemButton className="cs-listitembutton">
                                                <ListItemIcon className="cs-listitemicon">
                                                    <DirectionsBoatOutlinedIcon fontSize="small" />
                                                </ListItemIcon>
                                                <ListItemText primary={t('ships')} primaryTypographyProps={{ fontSize: 13 }} />
                                            </ListItemButton>
                                        </DarkTooltip>
                                        </ListItem>
                                    </NavLink>
                                    <NavLink to="/admin/files" className={({ isActive }) => isActive ? "cs-navlink-active" : "cs-navlink"}>
                                        <ListItem className="cs-listitem" key={"Files"} disablePadding disableGutters sx={{ pl: 2 }}>
                                        <DarkTooltip title={t('files')} placement="right" arrow>
                                            <ListItemButton className="cs-listitembutton">
                                                <ListItemIcon className="cs-listitemicon">
                                                    <AttachFileOutlinedIcon fontSize="small" />
                                                </ListItemIcon>
                                                <ListItemText primary={t('files')} slotProps={{primary:{fontSize: 13} }} />
                                            </ListItemButton>
                                        </DarkTooltip>
                                        </ListItem>
                                    </NavLink>
                                </List>
                            </Collapse>

                            <List dense sx={{ position: "fixed", bottom: "0px", left: "10px", right: "10px", maxWidth: open ? "200px" : "40px" }}>
                                <ListItem className="cs-listitem" key={"Collapse"} disablePadding disableGutters>
                                    <DarkTooltip title={t('collapse')} placement="right" arrow>
                                        <ListItemButton className="cs-listitembutton" onClick={open ? handleDrawerClose : handleDrawerOpen}>
                                            <ListItemIcon className="cs-listitemicon">
                                                {open ? <FirstPageIcon fontSize="small" /> : <LastPageIcon fontSize="small" />}
                                            </ListItemIcon>
                                            <ListItemText primary={open ? t('collapse') : ""} slotProps={{primary:{fontSize: 13 }}} />
                                        </ListItemButton>
                                    </DarkTooltip>
                                </ListItem>
                            </List>
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
        </>
    )
}

export default Layout;