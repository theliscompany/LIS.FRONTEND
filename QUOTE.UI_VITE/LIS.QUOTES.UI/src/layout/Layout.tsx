import { AppBar, Avatar, Box, Button, Collapse, Container, Divider, Drawer as MuiDrawer, IconButton, InputAdornment, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Menu, MenuItem, Toolbar, Typography, CSSObject, styled, Theme } from "@mui/material";
import Grid from "@mui/material/Grid2";
import React, { useState } from "react";
import { Link, Outlet, useNavigate } from "react-router-dom";
import { BootstrapInput, DarkTooltip } from "../utils/misc/styles";
import { useTranslation } from "react-i18next";
import { useAccount, useMsal } from "@azure/msal-react";
import { stringAvatar } from "../utils/functions";
import NavigationLink from "../components/shared/NavigationLink";
import { Add, AnchorOutlined, AssignmentOutlined, AttachFileOutlined, AutoFixHigh, ChevronRight, ContactsOutlined, DirectionsBoat, ExpandMore, FirstPage, FolderOutlined, Groups, Home, Inventory2, InventoryOutlined, LastPage, LocalShipping, Logout, MenuOutlined, Notifications, People, Portrait, RequestQuoteOutlined, RoomServiceOutlined, Search, SettingsOutlined, TaskAltOutlined, TextSnippetOutlined } from "@mui/icons-material";

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
        width: `calc(${theme.spacing(7)} + 1px)`,
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
                display: 'flex', maxWidth: "100vw !important", padding: "0px !important", m: 0, 
                marginTop: { xs: "0px !important", md: "60px !important;", lg: "60px !important" }
            }}>
                    {/* App bar for mobile version */}
                <AppBar position="fixed" sx={{ 
                    zIndex: (theme) => theme.zIndex.drawer + 1, backgroundColor: "#fff", 
                    boxShadow: 0, borderBottom: "1px solid rgb(241, 242, 246)",
                    display: { xs: 'flex', md: 'none' }
                }}>
                    <Toolbar disableGutters>
                        <Grid container spacing={0}>
                            <Grid size={{xs: 6}}>
                                <Typography variant="h6" noWrap component={Link} to="/" sx={{ ml: 5 }}>
                                    <img src="/img/logolisquotes.png" className="img-fluid" style={{ maxHeight: "50px", marginTop: "10px" }} alt="lisquotes" />
                                </Typography>
                            </Grid>
                            <Grid size={{xs: 6}}>
                                <IconButton
                                    size="large"
                                    onClick={handleOpenNavMenu}
                                    sx={{ color: "#333", alignItems: "center", justifyContent: "end", height: "100%", float: "right", mr: 5 }}
                                >
                                    <MenuOutlined />
                                </IconButton>
                                <Menu
                                    anchorEl={anchorElNav}
                                    anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
                                    keepMounted
                                    transformOrigin={{ vertical: 'top', horizontal: 'left' }}
                                    open={Boolean(anchorElNav)}
                                    onClose={handleCloseNavMenu}
                                    sx={{ display: { xs: 'block', md: 'none' } }}
                                    slotProps={{paper: {sx: { width: "200px" }}}}
                                >
                                    <MenuItem onClick={() => { navigate('/'); handleCloseNavMenu(); }}>
                                        <Typography textAlign="center">{t('overview')}</Typography>
                                    </MenuItem>
                                    <MenuItem onClick={() => { navigate('/users'); handleCloseNavMenu(); }}>
                                        <Typography textAlign="center">{t('users')}</Typography>
                                    </MenuItem>
                                    <MenuItem onClick={() => { navigate('/new-request'); handleCloseNavMenu(); }}>
                                        <Typography textAlign="center">{t('newRequest')}</Typography>
                                    </MenuItem>
                                    <MenuItem onClick={() => { navigate('/my-requests'); handleCloseNavMenu(); }}>
                                        <Typography textAlign="center">{t('myRequests')}</Typography>
                                    </MenuItem>
                                    <MenuItem onClick={() => { navigate('/requests'); handleCloseNavMenu(); }}>
                                        <Typography textAlign="center">{t('requests')}</Typography>
                                    </MenuItem>
                                    <MenuItem onClick={() => { navigate('/quote-offers'); handleCloseNavMenu(); }}>
                                        <Typography textAlign="center">{t('priceOffers')}</Typography>
                                    </MenuItem>
                                    <MenuItem onClick={() => { navigate('/seafreights'); handleCloseNavMenu(); }}>
                                        <Typography textAlign="center">{t('seafreights')}</Typography>
                                    </MenuItem>
                                    <MenuItem onClick={() => { navigate('/haulages'); handleCloseNavMenu(); }}>
                                        <Typography textAlign="center">{t('haulages')}</Typography>
                                    </MenuItem>
                                    <MenuItem onClick={() => { navigate('/miscellaneous'); handleCloseNavMenu(); }}>
                                        <Typography textAlign="center">{t('miscellaneous')}</Typography>
                                    </MenuItem>
                                </Menu>
                            </Grid>
                            <Grid size={{xs: 12}}>
                                <BootstrapInput 
                                    type="text" 
                                    value={searchText}
                                    placeholder={t('typeSomethingSearch')}
                                    sx={{ ml: 5, pb: 1, minWidth: { xs: "calc(100vw - 90px)", md: "400px" } }} 
                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchText(e.target.value)} endAdornment={
                                        <InputAdornment position="end">
                                            <IconButton component={Link} to={"/search/"+searchText} edge="end"><Search /></IconButton>
                                        </InputAdornment>
                                    } 
                                    onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
                                        if (e.key === "Enter") {
                                            navigate("/search/"+searchText);
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
                            <Typography variant="h6" noWrap component="a" href="/">
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
                                        <IconButton component={Link} to={"/search/"+searchText} edge="end"><Search /></IconButton>
                                    </InputAdornment>
                                } 
                                onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
                                    if (e.key === "Enter") {
                                        navigate("/search/"+searchText);
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
                                    slotProps={{paper: {sx: { width: "160px"}}}}
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
                                    slotProps={{paper: { sx: { width: "300px" }}}}
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
                                            <Portrait fontSize="small" />
                                        </ListItemIcon>
                                        <ListItemText primary={t('viewProfile')} slotProps={{primary:{ fontSize: 13 }}}  />
                                    </MenuItem>
                                    <MenuItem dense key={"x1-My Requests"} title={t('myRequests')} component="a" href="/my-requests">
                                        <ListItemIcon className="cs-listitemicon">
                                            <AutoFixHigh fontSize="small" />
                                        </ListItemIcon>
                                        <ListItemText primary={t('myRequests')} slotProps={{primary:{ fontSize: 13 }}} />
                                    </MenuItem>
                                    <MenuItem dense key={"x1-Invite Members"} title={t('inviteMembers')} onClick={handleCloseUserMenu}>
                                        <ListItemIcon className="cs-listitemicon">
                                            <Groups fontSize="small" />
                                        </ListItemIcon>
                                        <ListItemText primary={t('inviteMembers')} slotProps={{primary:{ fontSize: 13 }}} />
                                    </MenuItem>
                                    <Divider />
                                    <MenuItem dense key={"x1-Logout"} title="Logout" onClick={handleLogout}>
                                        <ListItemIcon className="cs-listitemicon">
                                            <Logout fontSize="small" />
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
                        display: { xs: 'none', md: 'flex' },
                    }}
                    PaperProps={{ sx: { 
                        borderRight: open ? "1px solid rgb(241, 242, 246)" : 0,
                        '&::-webkit-scrollbar': {
                            width: '6px', // Thin scrollbar width
                        },
                        '&::-webkit-scrollbar-track': {
                            backgroundColor: '#f1f1f1', // Background color of the track
                        },
                        '&::-webkit-scrollbar-thumb': {
                            backgroundColor: '#888', // Thumb color
                            borderRadius: '10px', // Rounded corners for thumb
                        },
                        '&::-webkit-scrollbar-thumb:hover': {
                            backgroundColor: '#555', // Thumb color on hover
                        },
                        // '&::-webkit-scrollbar-container': {
                        //     position: 'relative',
                        // },
                    } }}
                >
                    <Toolbar />
                    <Box sx={{ minWidth: drawerWidth, margin: "0 0px", marginTop: "8px" }}>
                        <List dense style={{ minHeight: "480px" }}>
                            <NavigationLink url="/" title={t('overview')} icon={<Home fontSize="small" />} />
                            <NavigationLink url="/users" title={t('users')} icon={<People fontSize="small" />} />
                            <ListItem className="cs-listitem" key={"Requests part"} disablePadding disableGutters>
                                <ListItemButton className="cs-listitembutton" onClick={() => { setOpenRequests(!openRequests); }}>
                                    <ListItemIcon className="cs-listitemicon">
                                        <AssignmentOutlined fontSize="small" />
                                    </ListItemIcon>
                                    <ListItemText primary={t('requests')} slotProps={{primary: { fontSize: 13 }}} />
                                    {openRequests ? <ExpandMore fontSize="small" /> : <ChevronRight fontSize="small" />}
                                </ListItemButton>
                            </ListItem>
                            <Collapse in={openRequests} timeout="auto" unmountOnExit>
                                <List component="div" disablePadding>
                                    <NavigationLink url="/new-request" title={t('newRequest')} icon={<Add fontSize="small" />} nested />
                                    <NavigationLink url="/my-requests" title={t('myRequests')} icon={<AutoFixHigh fontSize="small" />} nested />
                                    <NavigationLink url="/requests" title={t('requests')} icon={<Notifications fontSize="small" />} nested />
                                    <NavigationLink url="/pending-requests" title={t('pendingRequests')} icon={<TaskAltOutlined fontSize="small" />} nested />
                                </List>
                            </Collapse>                            
                            <ListItem className="cs-listitem" key={"Prices part"} disablePadding disableGutters>
                                <ListItemButton className="cs-listitembutton" onClick={() => { setOpenPrices(!openPrices); }}>
                                    <ListItemIcon className="cs-listitemicon">
                                        <RequestQuoteOutlined fontSize="small" />
                                    </ListItemIcon>
                                    <ListItemText primary={t('pricing')} slotProps={{primary: { fontSize: 13 }}} />
                                    {openPrices ? <ExpandMore fontSize="small" /> : <ChevronRight fontSize="small" />}
                                </ListItemButton>
                            </ListItem>
                            <Collapse in={openPrices} timeout="auto" unmountOnExit>
                                <List component="div" disablePadding>
                                    <NavigationLink url="/haulages" title={t('haulages')} icon={<LocalShipping fontSize="small" />} nested />
                                    <NavigationLink url="/seafreights" title={t('seafreights')} icon={<DirectionsBoat fontSize="small" />} nested />
                                    <NavigationLink url="/miscellaneous" title={t('miscellaneous')} icon={<Inventory2 fontSize="small" />} nested />
                                </List>
                            </Collapse>
                            
                            <NavigationLink url="/quote-offers" title={t('priceOffers')} icon={<Portrait fontSize="small" />} />
                            <NavigationLink url="/" title={t('orders')} icon={<FolderOutlined fontSize="small" />} />
                            
                            <ListItem className="cs-listitem" key={"Masterdata part"} disablePadding disableGutters>
                                <ListItemButton className="cs-listitembutton" onClick={() => { setOpenMasterdata(!openMasterdata); }}>
                                    <ListItemIcon className="cs-listitemicon">
                                        <SettingsOutlined fontSize="small" />
                                    </ListItemIcon>
                                    <ListItemText primary={t('masterdata')} slotProps={{primary: { fontSize: 13 }}} />
                                    {openMasterdata ? <ExpandMore fontSize="small" /> : <ChevronRight fontSize="small" />}
                                </ListItemButton>
                            </ListItem>
                            <Collapse in={openMasterdata} timeout="auto" unmountOnExit>
                                <List component="div" disablePadding>
                                    <NavigationLink url="/services" title={t('services')} icon={<RoomServiceOutlined fontSize="small" />} nested />
                                    <NavigationLink url="/templates" title={t('templates')} icon={<TextSnippetOutlined fontSize="small" />} nested />
                                    <NavigationLink url="/products" title={t('products')} icon={<InventoryOutlined fontSize="small" />} nested />
                                    <NavigationLink url="/hscodes" title={t('hscodes')} icon={<InventoryOutlined fontSize="small" />} nested />
                                    <NavigationLink url="/ports" title={t('ports')} icon={<AnchorOutlined fontSize="small" />} nested />
                                    <NavigationLink url="/contacts" title={t('contacts')} icon={<ContactsOutlined fontSize="small" />} nested />
                                    <NavigationLink url="/files" title={t('files')} icon={<AttachFileOutlined fontSize="small" />} nested />
                                    {/* <NavigationLink url="/ships" title={t('ships')} icon={<DirectionsBoatOutlined fontSize="small" />} nested /> */}
                                </List>
                            </Collapse>
                        </List>
                    </Box>
                    <Box>
                    <List dense sx={{  marginTop: "10px", maxWidth: open ? "200px" : "40px" }}>
                        <ListItem className="cs-listitem" key={"Collapse"} disablePadding disableGutters>
                            <DarkTooltip title={t('collapse')} placement="right" arrow>
                                <ListItemButton className="cs-listitembutton" onClick={open ? handleDrawerClose : handleDrawerOpen}>
                                    <ListItemIcon className="cs-listitemicon">
                                        {open ? <FirstPage fontSize="small" /> : <LastPage fontSize="small" />}
                                    </ListItemIcon>
                                    <ListItemText primary={open ? t('collapse') : ""} slotProps={{primary:{fontSize: 13 }}} />
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
        </>
    )
}

export default Layout;