import * as React from 'react';
import Box from '@mui/material/Box';
import MuiDrawer from '@mui/material/Drawer';
import AppBar from '@mui/material/AppBar';
import CssBaseline from '@mui/material/CssBaseline';
import Toolbar from '@mui/material/Toolbar';
import List from '@mui/material/List';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import SettingsIcon from '@mui/icons-material/Settings';
import HomeIcon from '@mui/icons-material/Home';
import FirstPageIcon from '@mui/icons-material/FirstPage';
import Avatar from '@mui/material/Avatar';
import Tooltip, { TooltipProps, tooltipClasses } from '@mui/material/Tooltip';
import MenuItem from '@mui/material/MenuItem';
import Menu from '@mui/material/Menu';
import IconButton from '@mui/material/IconButton';
import LastPageIcon from '@mui/icons-material/LastPage';
import AutoFixHighIcon from '@mui/icons-material/AutoFixHigh';
import AppRegistrationIcon from '@mui/icons-material/AppRegistration';
import PortraitIcon from '@mui/icons-material/Portrait';
import GroupsIcon from '@mui/icons-material/Groups';
import LogoutIcon from '@mui/icons-material/Logout';
import NotificationsIcon from '@mui/icons-material/Notifications';
import RequestQuoteIcon from '@mui/icons-material/RequestQuote';
import { Badge, Container } from '@mui/material';
import { Outlet, NavLink } from 'react-router-dom';
import { styled, Theme, CSSObject } from '@mui/material/styles';
import { useEffect } from 'react';
import { useMsal } from '@azure/msal-react';
import '../../App.css';
import { protectedResources } from '../../authConfig';
import { useAuthorizedBackendApi } from '../../api/api';
import { BackendService } from '../../services/fetch';
//import "../../styles/HideLauncher.css";

// function closeWhatsappForm() {
//     var whatsappForm: HTMLElement | null = document.getElementById("wf-launcher-container");
//     if (whatsappForm !== null) {
//         whatsappForm.style.display = "none";
//     }
// }

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

function stringAvatar(name: string) {
    return {
        sx: {
        bgcolor: stringToColor(name),
        },
        children: `${name.split(' ')[0][0]}${name.split(' ')[1][0]}`,
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

const DarkTooltip = styled(({ className, ...props }: TooltipProps) => (
    <Tooltip {...props} arrow classes={{ popper: className }} />
  ))(({ theme }) => ({
    [`& .${tooltipClasses.arrow}`]: {
      color: theme.palette.common.black,
    },
    [`& .${tooltipClasses.tooltip}`]: {
      backgroundColor: theme.palette.common.black,
    },
}));
  
function Layout(props: {children?: React.ReactNode}) {
    const { instance } = useMsal();
    const [anchorElUser, setAnchorElUser] = React.useState<null | HTMLElement>(null);
    const [anchorElNotifications, setAnchorElNotifications] = React.useState<null | HTMLElement>(null);
    const [open, setOpen] = React.useState(true);
    const [notifications, setNotifications] = React.useState<any>(null);

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
            const response:any = await (context as BackendService<any>).getSingle(protectedResources.apiLisQuotes.endPoint+"/Request");
            if (response !== null && response.code !== undefined) {
                if (response.code === 200) {
                    setNotifications(response.data.filter((elm: any) => { return elm.status === "EnAttente" }).reverse());
                }
            }  
        }
    }

    useEffect(() => {
        loadRequests();
    }, [context]);
    
    return (
        <React.Fragment>
            <Box sx={{ display: 'flex' }}>
                <CssBaseline />
                <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1, backgroundColor: "#fff", boxShadow: 0, borderBottom: "1px solid rgb(241, 242, 246)" }}>
                    <Container style={{ maxWidth: "2000px" }}>
                        <Toolbar disableGutters>
                            <Typography variant="h6" noWrap component="a" href="/admin/">
                                <img src="/img/logolisquotes.png" className="img-fluid" style={{ maxHeight: "50px", marginTop: "10px" }} alt="lisquotes" />
                            </Typography>

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
                                                        <MenuItem dense key={"msg-"+i} title="View" onClick={handleCloseNotificationsMenu}>
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
                                
                                <DarkTooltip title="Cyrille Penaye">
                                    <IconButton onClick={handleOpenUserMenu} sx={{ p: 0 }}>
                                        <Avatar alt="Cyrille Penaye" {...stringAvatar('Cyrille Penaye')} src="../cyrillepenaye.jpg" />
                                    </IconButton>
                                </DarkTooltip>
                                <Menu
                                    sx={{ mt: '45px' }}
                                    PaperProps={{ sx: { width: "300px" } }}
                                    MenuListProps={{ sx: { paddingTop: "0px", paddingBottom: "0px" } }}
                                    id="menu-appbar"
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
                                        <Avatar alt="Cyrille Penaye" sx={{ width: "64px", height: "64px", marginBottom: "6px" }} src="../cyrillepenaye.jpg" />
                                        <Typography variant="subtitle2" sx={{ fontWeight: "bolder" }}>Cyrille Penaye</Typography >
                                        <Typography variant="caption">cyrille.penaye@omnifreight.eu</Typography>
                                    </div>
                                    <MenuItem dense key={"x1-View Profile"} title="View Profile" onClick={handleCloseUserMenu}>
                                        <ListItemIcon className="cs-listitemicon">
                                            <PortraitIcon fontSize="small" />
                                        </ListItemIcon>
                                        <ListItemText primary={"View Profile"} />
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
                <Drawer
                    variant="permanent"
                    open={open}
                    sx={{
                        width: drawerWidth,
                        flexShrink: 0,
                        boxSizing: 'border-box'
                    }}
                    PaperProps={{ sx: { borderRight: open ? "1px solid rgb(241, 242, 246)" : 0 } }}
                >
                    <Toolbar />
                    <Box sx={{ overflow: 'none', margin: "0 10px", marginTop: "8px" }}>
                        <List dense>
                            <NavLink to="/admin/" className={({ isActive }) => isActive ? "cs-navlink-active" : "cs-navlink"}>
                                <ListItem className="cs-listitem" key={"Overview"} disablePadding disableGutters>
                                <DarkTooltip title="Overview" placement="right" arrow>
                                    <ListItemButton className="cs-listitembutton">
                                        <ListItemIcon className="cs-listitemicon">
                                            <HomeIcon fontSize="small" />
                                        </ListItemIcon>
                                        <ListItemText primary={"Overview"} />
                                    </ListItemButton>
                                </DarkTooltip>
                                </ListItem>
                            </NavLink>
                            <NavLink to="/admin/settings" className={({ isActive }) => isActive ? "cs-navlink-active" : "cs-navlink"}>
                                <ListItem className="cs-listitem" key={"Settings"} disablePadding disableGutters>
                                <DarkTooltip title="Settings" placement="right" arrow>
                                    <ListItemButton className="cs-listitembutton">
                                        <ListItemIcon className="cs-listitemicon">
                                            <SettingsIcon fontSize="small" />
                                        </ListItemIcon>
                                        <ListItemText primary={"Settings"} />
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
                                        <ListItemText primary={"Requests"} />
                                    </ListItemButton>
                                </DarkTooltip>
                                </ListItem>
                            </NavLink>
                        </List>
                        <Divider color="#F1F2F6" style={{ borderBottom: "1px solid rgb(241, 242, 246)" }} />
                        <List dense>
                            <NavLink to="/admin/wizard" className={({ isActive }) => isActive ? "cs-navlink-active" : "cs-navlink"}>
                                <ListItem className="cs-listitem" key={"Wizard"} disablePadding disableGutters>
                                    <DarkTooltip title="Wizard" placement="right" arrow>
                                        <ListItemButton className="cs-listitembutton">
                                            <ListItemIcon className="cs-listitemicon">
                                                <AutoFixHighIcon fontSize="small" />
                                            </ListItemIcon>
                                            <ListItemText primary={"Wizard"} />
                                        </ListItemButton>
                                    </DarkTooltip>
                                </ListItem>
                            </NavLink>
                            <NavLink to="/admin/simulation" className={({ isActive }) => isActive ? "cs-navlink-active" : "cs-navlink"}>
                                <ListItem className="cs-listitem" key={"Simulation"} disablePadding disableGutters>
                                    <DarkTooltip title="Simulation" placement="right" arrow>
                                        <ListItemButton className="cs-listitembutton">
                                            <ListItemIcon className="cs-listitemicon">
                                                <AppRegistrationIcon fontSize="small" />
                                            </ListItemIcon>
                                            <ListItemText primary={"Simulation"} />
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
                                        <ListItemText primary={"Collapse"} />
                                    </ListItemButton>
                                </DarkTooltip>
                            </ListItem>
                        </List>
                    </Box>
                </Drawer>
                <Box component="main" sx={{ flexGrow: 1, p: 3, background: "#f9fafb" }}>
                    <Toolbar />
                    <Outlet />
                </Box>
            </Box>
        </React.Fragment>
    );
}

export default Layout;