import { AppBar, Avatar, Box, Button, Collapse, Container, Divider, Drawer as MuiDrawer, IconButton, InputAdornment, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Menu, MenuItem, Toolbar, Typography, CSSObject, styled, Theme, alpha } from "@mui/material";
import Grid from "@mui/material/Grid2";
import React, { useState } from "react";
import { Link, Outlet, useNavigate, useLocation } from "react-router-dom";
import { BootstrapInput, DarkTooltip } from '@utils/misc/styles';
import { useTranslation } from "react-i18next";
import { useAccount, useMsal } from "@azure/msal-react";
import { stringAvatar } from '@utils/functions';
import NavigationLink from '@components/shared/NavigationLink';
import { usePendingQuotesCount } from '@hooks/usePendingQuotesCount';
// @ts-ignore
import { AnchorOutlined, AttachFileOutlined, AutoFixHigh, ChevronRight, ContactsOutlined, DirectionsBoat, ExpandMore, FirstPage, FolderOutlined, Groups, Home, Inventory2, InventoryOutlined, LastPage, LocalShipping, Logout, MenuOutlined, Portrait, RequestQuoteOutlined, RoomServiceOutlined, Search, SettingsOutlined, TextSnippetOutlined, BuildOutlined, Description, Approval, Send, Code as CodeIcon, Assignment } from "@mui/icons-material";
import Overview from '../pages/Overview';
import Badge from '@mui/material/Badge';
// @ts-ignore
import NotificationsIcon from '@mui/icons-material/Notifications';
// @ts-ignore

import SupportBackdoorAll from '@features/pricingnew/pages/SupportBackdoorAll';

const drawerWidth = 260;

const openedMixin = (theme: Theme): CSSObject => ({
    width: drawerWidth,
    transition: theme.transitions.create('width', {
      easing: theme.transitions.easing.easeInOut,
      duration: theme.transitions.duration.standard,
    }),
    overflowX: 'hidden',
});

const closedMixin = (theme: Theme): CSSObject => ({
    transition: theme.transitions.create('width', {
        easing: theme.transitions.easing.easeInOut,
        duration: theme.transitions.duration.standard,
    }),
    overflowX: 'hidden',
    width: `calc(${theme.spacing(8)} + 1px)`,
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

// Composant de navigation moderne
const ModernNavigationLink = ({ url, title, icon, nested = false, isActive = false }: {
    url: string;
    title: string;
    icon: React.ReactNode;
    nested?: boolean;
    isActive?: boolean;
}) => {
    const location = useLocation();
    const isCurrentActive = location.pathname === url || isActive;
    
    return (
        <ListItem 
            disablePadding 
            sx={{ 
                mb: nested ? 0.5 : 1,
                mx: nested ? 2 : 1,
                borderRadius: 2,
                overflow: 'hidden'
            }}
        >
            <ListItemButton
                component={Link}
                to={url}
                sx={{
                    minHeight: nested ? 40 : 48,
                    borderRadius: 2,
                    mx: 0,
                    px: nested ? 2 : 2.5,
                    py: nested ? 1 : 1.5,
                    backgroundColor: isCurrentActive 
                        ? alpha('#1976d2', 0.12) 
                        : 'transparent',
                    color: isCurrentActive ? '#1976d2' : '#64748b',
                    border: isCurrentActive 
                        ? '1px solid' + alpha('#1976d2', 0.2)
                        : '1px solid transparent',
                    '&:hover': {
                        backgroundColor: isCurrentActive 
                            ? alpha('#1976d2', 0.16)
                            : alpha('#64748b', 0.08),
                        transform: 'translateX(4px)',
                        transition: 'all 0.2s ease-in-out',
                    },
                    '&:before': isCurrentActive ? {
                        content: '""',
                        position: 'absolute',
                        left: 0,
                        top: 0,
                        bottom: 0,
                        width: 4,
                        backgroundColor: '#1976d2',
                        borderRadius: '0 2px 2px 0'
                    } : {},
                    transition: 'all 0.2s ease-in-out',
                }}
            >
                <ListItemIcon 
                    sx={{ 
                        minWidth: nested ? 32 : 40,
                        color: 'inherit',
                        '& .MuiSvgIcon-root': {
                            fontSize: nested ? '1.1rem' : '1.25rem',
                        }
                    }}
                >
                    {icon}
                </ListItemIcon>
                <ListItemText 
                    primary={title} 
                    sx={{
                        '& .MuiListItemText-primary': {
                            fontSize: nested ? '0.875rem' : '0.95rem',
                            fontWeight: isCurrentActive ? 600 : 500,
                            letterSpacing: '0.025em',
                        }
                    }}
                />
            </ListItemButton>
        </ListItem>
    );
};

// Composant pour les sections collapsibles
const ModernCollapsibleSection = ({ 
    title, 
    icon, 
    children, 
    isOpen, 
    onToggle 
}: {
    title: string;
    icon: React.ReactNode;
    children: React.ReactNode;
    isOpen: boolean;
    onToggle: () => void;
}) => {
    return (
        <>
            <ListItem 
                disablePadding 
                sx={{ 
                    mb: 1,
                    mx: 1,
                    borderRadius: 2,
                    overflow: 'hidden'
                }}
            >
                <ListItemButton
                    onClick={onToggle}
                    sx={{
                        minHeight: 48,
                        borderRadius: 2,
                        mx: 0,
                        px: 2.5,
                        py: 1.5,
                        backgroundColor: isOpen 
                            ? alpha('#6366f1', 0.08) 
                            : 'transparent',
                        color: isOpen ? '#6366f1' : '#64748b',
                        border: isOpen 
                            ? '1px solid' + alpha('#6366f1', 0.15)
                            : '1px solid transparent',
                        '&:hover': {
                            backgroundColor: isOpen 
                                ? alpha('#6366f1', 0.12)
                                : alpha('#64748b', 0.08),
                            transform: 'translateX(2px)',
                            transition: 'all 0.2s ease-in-out',
                        },
                        transition: 'all 0.2s ease-in-out',
                    }}
                >
                    <ListItemIcon 
                        sx={{ 
                            minWidth: 40,
                            color: 'inherit',
                            '& .MuiSvgIcon-root': {
                                fontSize: '1.25rem',
                            }
                        }}
                    >
                        {icon}
                    </ListItemIcon>
                    <ListItemText 
                        primary={title} 
                        sx={{
                            '& .MuiListItemText-primary': {
                                fontSize: '0.95rem',
                                fontWeight: isOpen ? 600 : 500,
                                letterSpacing: '0.025em',
                            }
                        }}
                    />
                    <Box sx={{ 
                        transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                        transition: 'transform 0.2s ease-in-out',
                        color: 'inherit'
                    }}>
                        <ExpandMore fontSize="small" />
                    </Box>
                </ListItemButton>
            </ListItem>
            <Collapse 
                in={isOpen} 
                timeout="auto" 
                unmountOnExit
                sx={{
                    '& .MuiCollapse-wrapper': {
                        paddingLeft: 1,
                    }
                }}
            >
                <List component="div" disablePadding>
                    {children}
                </List>
            </Collapse>
        </>
    );
};

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
    const [openPrices, setOpenPrices] = useState<boolean>(false);
    const [openQuotes, setOpenQuotes] = useState<boolean>(false);
    const [openMasterdata, setOpenMasterdata] = useState<boolean>(false);
    const [openTemplates, setOpenTemplates] = useState<boolean>(false);
    const [openSupport, setOpenSupport] = useState<boolean>(false);
    
    // Hook pour récupérer le nombre de devis en attente de validation
    const { data: pendingQuotesCount = 0 } = usePendingQuotesCount();

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
        setOpenTemplates(false);
        setOpenPrices(false);
        setOpenQuotes(false);
        setOpenSupport(false);
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
                                    {/* <img src="/assets/img/logo-lisquotes.png" className="img-fluid" style={{ maxHeight: "50px", marginTop: "10px" }} alt="lisquotes" /> */}
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
                                    <MenuItem onClick={() => { navigate('/quote-approval'); handleCloseNavMenu(); }}>
                                        <Typography textAlign="center">Validation Interne</Typography>
                                    </MenuItem>
                                    <MenuItem onClick={() => { navigate('/approved-quotes'); handleCloseNavMenu(); }}>
                                        <Typography textAlign="center">Devis Approuvés</Typography>
                                    </MenuItem>
                                    <MenuItem onClick={() => { navigate('/pricingnew/seafreight'); handleCloseNavMenu(); }}>
                                        <Typography textAlign="center">Offres Sea Freight</Typography>
                                    </MenuItem>
                                    <MenuItem onClick={() => { navigate('/pricingnew/haulage'); handleCloseNavMenu(); }}>
                                        <Typography textAlign="center">Offres Haulage</Typography>
                                    </MenuItem>
                                    <MenuItem onClick={() => { navigate('/miscellaneous'); handleCloseNavMenu(); }}>
                                        <Typography textAlign="center">{t('miscellaneous')}</Typography>
                                    </MenuItem>
                                    <MenuItem onClick={() => { navigate('/pricingnew/miscellaneous'); handleCloseNavMenu(); }}>
                                        <Typography textAlign="center">Miscellaneous (New)</Typography>
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
                    zIndex: (theme) => theme.zIndex.drawer + 1, 
                    background: 'linear-gradient(90deg, rgba(40,120,220,0.85) 0%, rgba(102,126,234,0.85) 100%)',
                    boxShadow: '0 4px 24px #667eea33',
                    backdropFilter: 'blur(10px)',
                    borderBottom: '2px solid #1976d2',
                    display: { xs: 'none', md: 'flex' },
                    minHeight: 72
                }}>
                    <Container style={{ maxWidth: "2000px" }}>
                        <Toolbar disableGutters sx={{ minHeight: 72, display: 'flex', justifyContent: 'space-between' }}>
                            {/* Logo + titre */}
                            <Box sx={{ display: 'flex', alignItems: 'center', flex: 1, minWidth: 260 }}>
                                <Box>
                                    <Typography variant="h5" sx={{ fontWeight: 700, color: 'white', letterSpacing: 1, lineHeight: 1 }}>LIS Quotes</Typography>
                                    <Typography variant="caption" sx={{ color: '#e0e0e0', fontWeight: 500, letterSpacing: 0.5 }}>Innovation in freight services</Typography>
                                </Box>
                            </Box>
                            {/* Barre de recherche centrée */}
                            <Box sx={{ flex: 2, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                                <Box sx={{ position: 'relative', width: 400, maxWidth: '100%' }}>
                                    <input
                                        type="text"
                                        value={searchText}
                                        onChange={(e) => setSearchText(e.target.value)}
                                        placeholder="Rechercher une demande, un client, une offre…"
                                        style={{
                                            width: '100%',
                                            padding: '12px 44px 12px 18px',
                                            borderRadius: 24,
                                            border: 'none',
                                            background: '#fff',
                                            fontWeight: 500,
                                            fontSize: 16,
                                            boxShadow: '0 2px 8px #667eea22',
                                            outline: 'none',
                                            color: '#222',
                                            transition: 'box-shadow 0.2s',
                                        }}
                                        onKeyDown={(e) => {
                                            if (e.key === "Enter") {
                                                navigate("/search/"+searchText);
                                                e.preventDefault();
                                            }
                                        }}
                                    />
                                    <IconButton component={Link} to={"/search/"+searchText} edge="end" sx={{
                                        position: 'absolute',
                                        right: 4,
                                        top: '50%',
                                        transform: 'translateY(-50%)',
                                        color: '#1976d2',
                                        background: 'rgba(102,126,234,0.08)',
                                        borderRadius: '50%',
                                        p: 1,
                                        '&:hover': { background: 'rgba(102,126,234,0.18)' }
                                    }}>
                                        <Search />
                                    </IconButton>
                                </Box>
                            </Box>
                            {/* Langue, notifications, avatar */}
                            <Box sx={{ display: 'flex', alignItems: 'center', flex: 1, justifyContent: 'flex-end', minWidth: 260 }}>
                                <Button sx={{
                                    borderRadius: 3,
                                    bgcolor: '#fff',
                                    color: '#1976d2',
                                    fontWeight: 600,
                                    px: 2.5,
                                    mr: 2,
                                    boxShadow: '0 2px 8px #667eea22',
                                    textTransform: 'none',
                                    fontSize: 16,
                                    display: 'flex',
                                    alignItems: 'center',
                                    '&:hover': { bgcolor: '#f5f7fa', color: '#1565c0' }
                                }} onClick={handleOpenLangMenu}>
                                    <img src={
                                        i18n.language === "en" ? "/assets/img/flags/flag-en.png" :
                                        i18n.language === "fr" ? "/assets/img/flags/flag-fr.png" :
                                        i18n.language === "nl" ? "/assets/img/flags/flag-nl.png" :
                                        "/assets/img/flags/flag-en.png"
                                    } alt="flag" style={{ width: 24, height: 24, marginRight: 8, borderRadius: '50%', boxShadow: '0 1px 4px #667eea22' }} />
                                    {i18n.language === "en" ? "English" : i18n.language === "fr" ? "Français" : "Nederlands"}
                                </Button>
                                <Menu
                                    anchorEl={anchorElLang}
                                    open={Boolean(anchorElLang)}
                                    onClose={handleCloseLangMenu}
                                    anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                                    transformOrigin={{ vertical: 'top', horizontal: 'right' }}
                                >
                                    <MenuItem onClick={() => { i18n.changeLanguage('en'); handleCloseLangMenu(); }}>
                                        <img src="/assets/img/flags/flag-en.png" alt="en" style={{ width: 24, height: 24, marginRight: 8, borderRadius: '50%' }} />
                                        English
                                    </MenuItem>
                                    <MenuItem onClick={() => { i18n.changeLanguage('fr'); handleCloseLangMenu(); }}>
                                        <img src="/assets/img/flags/flag-fr.png" alt="fr" style={{ width: 24, height: 24, marginRight: 8, borderRadius: '50%' }} />
                                        Français
                                    </MenuItem>
                                    <MenuItem onClick={() => { i18n.changeLanguage('nl'); handleCloseLangMenu(); }}>
                                        <img src="/assets/img/flags/flag-nl.png" alt="nl" style={{ width: 24, height: 24, marginRight: 8, borderRadius: '50%' }} />
                                        Nederlands
                                    </MenuItem>
                                </Menu>
                                {/* Badge notifications */}
                                <IconButton sx={{ ml: 1, mr: 1 }} color="inherit">
                                    <Badge badgeContent={3} color="error" overlap="circular">
                                        <NotificationsIcon sx={{ fontSize: 28, color: '#fff' }} />
                                    </Badge>
                                </IconButton>
                                {/* Avatar utilisateur moderne */}
                                <IconButton onClick={handleOpenUserMenu} sx={{ p: 0, ml: 1 }}>
                                    <Avatar alt={account?.name} {...stringAvatar(account?.name)} sx={{
                                        width: 48, height: 48, bgcolor: '#1976d2', color: '#fff', fontWeight: 700, fontSize: 22,
                                        boxShadow: '0 2px 8px #1976d233', border: '2px solid #fff',
                                    }} />
                                </IconButton>
                                {/* Menu utilisateur pour profil/déconnexion */}
                                <Menu
                                    anchorEl={anchorElUser}
                                    open={Boolean(anchorElUser)}
                                    onClose={handleCloseUserMenu}
                                    anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                                    transformOrigin={{ vertical: 'top', horizontal: 'right' }}
                                >
                                    <MenuItem onClick={handleLogout}>
                                        <ListItemIcon>
                                            <Logout fontSize="small" />
                                        </ListItemIcon>
                                        Se déconnecter
                                    </MenuItem>
                                </Menu>
                            </Box>
                        </Toolbar>
                    </Container>
                </AppBar>

                {/* Drawer moderne pour version laptop */}
                <Drawer
                    variant="permanent"
                    open={open}
                    sx={{
                        width: drawerWidth,
                        flexShrink: 0,
                        boxSizing: 'border-box',
                        display: { xs: 'none', md: 'flex' },
                        '& .MuiDrawer-paper': {
                            background: 'linear-gradient(180deg, #f5f7fa 0%, #e3e8fd 100%)',
                            borderRight: 'none',
                            boxShadow: '0 8px 32px 0 rgba(102,126,234,0.08)',
                        },
                    }}
                    PaperProps={{ 
                        sx: { 
                            background: 'linear-gradient(180deg, #f5f7fa 0%, #e3e8fd 100%)',
                            borderRight: 'none',
                            boxShadow: '0 8px 32px 0 rgba(102,126,234,0.08)',
                            '& .MuiListItemButton-root': {
                                borderRadius: 2,
                                mx: 0.5,
                                my: 0.5,
                                transition: 'background 0.2s, color 0.2s',
                            },
                            '& .Mui-selected, & .Mui-selected:hover': {
                                background: 'linear-gradient(90deg, #e3e8fd 0%, #d1d9f7 100%)',
                                color: '#1976d2',
                                boxShadow: '0 2px 8px #667eea22',
                                borderLeft: '4px solid #1976d2',
                            },
                            '& .MuiListItemButton-root:hover': {
                                background: 'rgba(102,126,234,0.08)',
                                color: '#1976d2',
                            },
                            '& .MuiListItemIcon-root': {
                                color: '#64748b',
                                minWidth: 36,
                            },
                            '& .Mui-selected .MuiListItemIcon-root': {
                                color: '#1976d2',
                            },
                            '& .MuiListSubheader-root': {
                                color: '#764ba2',
                                fontWeight: 700,
                                fontSize: 15,
                                letterSpacing: 0.5,
                                background: 'transparent',
                                mb: 1,
                            },
                        } 
                    }}
                >
                    <Toolbar />
                    <Box sx={{ 
                        minWidth: drawerWidth, 
                        margin: "0 0px", 
                        marginTop: "16px",
                        padding: "0 8px"
                    }}>
                        <List dense sx={{ minHeight: "480px" }}>
                            <ModernNavigationLink 
                                url="/" 
                                title={t('overview')} 
                                icon={<Home fontSize="small" />} 
                            />
                            <ModernNavigationLink 
                                url="/requests" 
                                title={t('requests')} 
                                icon={<FolderOutlined fontSize="small" />} 
                            />

                            <ModernCollapsibleSection
                                title="Gestion des Devis"
                                icon={<Description fontSize="small" />}
                                isOpen={openQuotes}
                                onToggle={() => setOpenQuotes(!openQuotes)}
                            >
                                <Box sx={{ background: 'linear-gradient(90deg, #e8f5e8 0%, #f5f7fa 100%)', borderRadius: 2, p: 0.5, mb: 1 }}>
                                    <ModernNavigationLink 
                                        url="/quote-approval" 
                                        title="Validation Interne" 
                                        icon={
                                          <Badge badgeContent={pendingQuotesCount} color="warning" max={99}>
                                            <Approval fontSize="small" />
                                          </Badge>
                                        } 
                                        nested 
                                    />
                                    <ModernNavigationLink 
                                        url="/approved-quotes" 
                                        title="Devis Approuvés" 
                                        icon={<Send fontSize="small" />} 
                                        nested 
                                    />
                                    <ModernNavigationLink 
                                        url="/quote-offers" 
                                        title="Tous les Devis" 
                                        icon={<Description fontSize="small" />} 
                                        nested 
                                    />
                                    <ModernNavigationLink 
                                        url="/draft-quotes" 
                                        title="Devis en Cours" 
                                        icon={<Assignment fontSize="small" />} 
                                        nested 
                                    />
                                </Box>
                            </ModernCollapsibleSection>
                            
                            <ModernCollapsibleSection
                                title="Templates"
                                icon={<TextSnippetOutlined fontSize="small" />}
                                isOpen={openTemplates}
                                onToggle={() => setOpenTemplates(!openTemplates)}
                            >
                                <Box sx={{ background: 'linear-gradient(90deg, #e8f4fd 0%, #f5f7fa 100%)', borderRadius: 2, p: 0.5, mb: 1 }}>
                               
                                    <ModernNavigationLink 
                                        url="/email-templates" 
                                        title="Templates Email" 
                                        icon={<TextSnippetOutlined fontSize="small" />} 
                                        nested 
                                    />
                                    <ModernNavigationLink 
                                        url="/object-types" 
                                        title="Types d'Objets" 
                                        icon={<CodeIcon fontSize="small" />} 
                                        nested 
                                    />
                                </Box>
                            </ModernCollapsibleSection>
                            
                            <ModernCollapsibleSection
                                title={t('pricing')}
                                icon={<RequestQuoteOutlined fontSize="small" />}
                                isOpen={openPrices}
                                onToggle={() => setOpenPrices(!openPrices)}
                            >
                                <Box sx={{ background: 'linear-gradient(90deg, #e3e8fd 0%, #f5f7fa 100%)', borderRadius: 2, p: 0.5, mb: 1 }}>
                                    <ModernNavigationLink 
                                        url="/pricingnew/haulage" 
                                        title="Offres Haulage" 
                                        icon={<LocalShipping fontSize="small" />} 
                                        nested 
                                    />
                                    <ModernNavigationLink 
                                        url="/pricingnew/seafreight" 
                                        title="Offres Sea Freight" 
                                        icon={<DirectionsBoat fontSize="small" />} 
                                        nested 
                                    />
                                    {/*<ModernNavigationLink 
                                        url="/miscellaneousAll" 
                                        title={t('miscellaneous')} 
                                        icon={<Inventory2 fontSize="small" />} 
                                        nested 
                                    />*/}
                                    <ModernNavigationLink 
                                        url="/pricingnew/miscellaneous" 
                                        title={t('miscellaneous')} 
                                        icon={<Inventory2 fontSize="small" />}                                     
                                        nested 
                                    />
                                </Box>
                            </ModernCollapsibleSection>
                            
                            <ModernCollapsibleSection
                                title={t('masterdata')}
                                icon={<SettingsOutlined fontSize="small" />}
                                isOpen={openMasterdata}
                                onToggle={() => setOpenMasterdata(!openMasterdata)}
                            >
                                <Box sx={{ background: 'linear-gradient(90deg, #f3e8fd 0%, #f5f7fa 100%)', borderRadius: 2, p: 0.5, mb: 1 }}>
                                    <ModernNavigationLink 
                                        url="/services" 
                                        title={t('services')} 
                                        icon={<RoomServiceOutlined fontSize="small" />} 
                                        nested 
                                    />
                                    <ModernNavigationLink 
                                        url="/products" 
                                        title={t('products')} 
                                        icon={<InventoryOutlined fontSize="small" />} 
                                        nested 
                                    />
                                    <ModernNavigationLink 
                                        url="/hscodes" 
                                        title={t('hscodes')} 
                                        icon={<InventoryOutlined fontSize="small" />} 
                                        nested 
                                    />
                                    <ModernNavigationLink 
                                        url="/ports" 
                                        title={t('ports')} 
                                        icon={<AnchorOutlined fontSize="small" />} 
                                        nested 
                                    />
                                    <ModernNavigationLink 
                                        url="/contacts" 
                                        title={t('contacts')} 
                                        icon={<ContactsOutlined fontSize="small" />} 
                                        nested 
                                    />
                                    <ModernNavigationLink 
                                        url="/files" 
                                        title={t('files')} 
                                        icon={<AttachFileOutlined fontSize="small" />} 
                                        nested 
                                    />
                                </Box>
                            </ModernCollapsibleSection>

                            <ModernCollapsibleSection
                                title="Support"
                                icon={<BuildOutlined fontSize="small" />}
                                isOpen={openSupport}
                                onToggle={() => setOpenSupport(!openSupport)}
                            >
                                <Box sx={{ background: 'linear-gradient(90deg, #fff3e0 0%, #f5f7fa 100%)', borderRadius: 2, p: 0.5, mb: 1 }}>
                                    <ModernNavigationLink 
                                        url="/support-backdoor" 
                                        title="Test Endpoints" 
                                        icon={<AutoFixHigh fontSize="small" />} 
                                        nested 
                                    />
                                </Box>
                            </ModernCollapsibleSection>
                        </List>
                    </Box>
                    
                    {/* Bouton de collapse moderne */}
                    <Box sx={{ 
                        position: 'absolute', 
                        bottom: 16, 
                        left: 16, 
                        right: 16 
                    }}>
                        <ListItem disablePadding>
                            <DarkTooltip title={open ? t('collapse') : t('expand')} placement="right" arrow>
                                <ListItemButton
                                    onClick={open ? handleDrawerClose : handleDrawerOpen}
                                    sx={{
                                        minHeight: 48,
                                        borderRadius: 2,
                                        px: 2.5,
                                        py: 1.5,
                                        backgroundColor: alpha('#64748b', 0.08),
                                        color: '#64748b',
                                        border: '1px solid' + alpha('#64748b', 0.15),
                                        '&:hover': {
                                            backgroundColor: alpha('#64748b', 0.12),
                                            transform: 'translateX(2px)',
                                            transition: 'all 0.2s ease-in-out',
                                        },
                                        transition: 'all 0.2s ease-in-out',
                                    }}
                                >
                                    <ListItemIcon 
                                        sx={{ 
                                            minWidth: 40,
                                            color: 'inherit',
                                            '& .MuiSvgIcon-root': {
                                                fontSize: '1.25rem',
                                            }
                                        }}
                                    >
                                        {open ? <FirstPage fontSize="small" /> : <LastPage fontSize="small" />}
                                    </ListItemIcon>
                                    <ListItemText 
                                        primary={open ? t('collapse') : ""} 
                                        sx={{
                                            '& .MuiListItemText-primary': {
                                                fontSize: '0.95rem',
                                                fontWeight: 500,
                                                letterSpacing: '0.025em',
                                            }
                                        }}
                                    />
                                </ListItemButton>
                            </DarkTooltip>
                        </ListItem>
                    </Box>
                </Drawer>

                <Box sx={{ 
                    mt: { xs: 10, md: 0 }, 
                    flexGrow: { xs: 0, md: 1 }, p: { xs: 0, md: 3 },
                    background: "#f9fafb", minHeight: "100vh"
                }}>
                    {useLocation().pathname === '/' ? <Overview /> : <Outlet />}
                </Box>
            </Container>
        </>
    )
}

export default Layout;