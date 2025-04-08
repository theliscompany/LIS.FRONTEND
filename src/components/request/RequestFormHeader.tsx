import { useState } from "react";
import { Box, Button, Chip, ListItemButton, ListItemIcon, ListItemText, Popover, Toolbar, Tooltip, Typography } from "@mui/material";
import Grid from '@mui/material/Grid2';
import { AnchorOutlined, ContactsOutlined, InventoryOutlined, Save, NoteAdd, Settings, InfoOutlined, NotesOutlined } from "@mui/icons-material";
import ManageHistoryRoundedIcon from '@mui/icons-material/ManageHistoryRounded';
import { useTranslation } from "react-i18next";
import { BootstrapDialog, StyledBadge } from "../../utils/misc/styles";
import RequestAddNote from "./info/RequestAddNote";
import RequestAskInformation from "./info/RequestAskInformation";
import RequestChangeStatus from "./info/RequestChangeStatus";
import RequestListNotes from "./info/RequestListNotes";
import NewPort from "../shared/NewPort";
import NewProduct from "../shared/NewProduct";
import NewContact from "../shared/NewContact";
import { statusTypes } from "../../utils/constants";
import { colorsTypes } from "../../utils/functions";

const RequestFormHeader = (props: any) => {
    const [modal, setModal] = useState<boolean>(false);
    const [modalStatus, setModalStatus] = useState<boolean>(false);
    const [modalAddNote, setModalAddNote] = useState<boolean>(false);
    const [modalListNotes, setModalListNotes] = useState<boolean>(false);
    const [modalNewContact, setModalNewContact] = useState<boolean>(false);
    const [modalNewPort, setModalNewPort] = useState<boolean>(false);
    const [modalNewProduct, setModalNewProduct] = useState<boolean>(false);

    const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);
    const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
        setAnchorEl(event.currentTarget);
    };
    const handleClose = () => {
        setAnchorEl(null);
    };
    const open = Boolean(anchorEl);
    const id = open ? 'simple-popover' : undefined;

    const { t } = useTranslation();
    // Find the status type by type
    const statusType = statusTypes.find((elm) => elm.type === props.status);
    // Translate the label
    const label = statusType ? t(statusType.label) : '';

    
    return (
        <>
            <Grid size={{ xs: 12 }}>
                <Box>
                    <Typography variant="body2" color="dodgerblue" sx={{ fontWeight: "bold", display: "inline" }}>
                        <span style={{ color: 'red' }}>{t('quoteNumber')} : </span> N° {props.trackingNumber}
                    </Typography>
                    <Chip size="small" label={label} color={colorsTypes(props.status)} sx={{ ml: 1 }} />
                </Box>
            </Grid>
            <Grid size={{ xs: 12 }}>
                <Toolbar sx={{ backgroundColor: 'lightblue', padding: '0px' }}>
                    <Tooltip title={t('saveRequest')}>
                        <Button 
                            variant="text" color="primary" sx={{ mr: 1 }} 
                            onClick={props.editRequest}
                        >
                            <Save />
                        </Button>
                    </Tooltip>
                    <Tooltip title={t('updateRequestStatus')}>
                        <Button 
                            variant="text" color="inherit" sx={{ mr: 1 }} 
                            onClick={() => { setModalStatus(true); }}
                        >
                            <ManageHistoryRoundedIcon />
                        </Button>
                    </Tooltip>
                    <Tooltip title={t('listNotes')}>
                        <StyledBadge color="error" badgeContent="" overlap="circular" variant="dot" sx={{ mr: 1 }}>
                            <Button 
                                variant="text" color="inherit" 
                                onClick={() => { setModalListNotes(true); }}
                            >
                                <NotesOutlined />
                            </Button>
                        </StyledBadge>
                    </Tooltip>
                    <Tooltip title={t('addCommentNote')}>
                        <Button 
                            variant="text" color="inherit" sx={{ mr: 2 }} 
                            onClick={() => { setModalAddNote(true); }}
                        >
                            <NoteAdd />
                        </Button>
                    </Tooltip>
                    <Tooltip title={t('askMoreInformation')}>
                        <Button 
                            variant="text" color="inherit" sx={{ mr: 2 }} 
                            onClick={() => { setModal(true); }}
                        >
                            <InfoOutlined />
                        </Button>
                    </Tooltip>
                    <Box sx={{ flexGrow: 1 }} />
                    <Tooltip title={t('settings')}>
                        <Button 
                            variant="text" color="inherit" 
                            onClick={handleClick}
                        >
                            <Settings />
                        </Button>
                    </Tooltip>

                    <Popover
                        id={id}
                        open={open}
                        anchorEl={anchorEl}
                        onClose={handleClose}
                        anchorOrigin={{
                            vertical: 'bottom',
                            horizontal: 'right',
                        }}
                        transformOrigin={{
                            vertical: 'top',
                            horizontal: 'right',
                        }}
                    >
                        <ListItemButton onClick={() => { setModalNewPort(true); handleClose(); }}>
                            <ListItemIcon><AnchorOutlined /></ListItemIcon>
                            <ListItemText primary={t('createNewPort')} />
                        </ListItemButton>
                        <ListItemButton onClick={() => { setModalNewContact(true); handleClose(); }}>
                            <ListItemIcon><ContactsOutlined /></ListItemIcon>
                            <ListItemText primary={t('createNewContact')} />
                        </ListItemButton>
                        <ListItemButton onClick={() => { setModalNewProduct(true); handleClose(); }}>
                            <ListItemIcon><InventoryOutlined /></ListItemIcon>
                            <ListItemText primary={t('newProduct')} />
                        </ListItemButton>
                    </Popover>
                </Toolbar>
            </Grid>

            {/* Ask for information */}
            <BootstrapDialog open={modal} onClose={() => setModal(false)} maxWidth="md" fullWidth>
                <RequestAskInformation id={props.id} userId={null} email={props.email} closeModal={() => setModal(false)} />
            </BootstrapDialog>
            
            {/* Change request status */}
            <BootstrapDialog open={modalStatus} onClose={() => setModalStatus(false)} maxWidth="md" fullWidth>
                <RequestChangeStatus id={props.id} closeModal={() => setModalStatus(false)} updateStatus={props.updateStatus} />
            </BootstrapDialog>
            
            {/* Add a comment/note */}
            <BootstrapDialog open={modalAddNote} onClose={() => setModalAddNote(false)} maxWidth="md" fullWidth>
                <RequestAddNote id={props.id} userId={null} closeModal={() => setModalAddNote(false)} />
            </BootstrapDialog>

            {/* List of notes */}
            <BootstrapDialog open={modalListNotes} onClose={() => setModalListNotes(false)} maxWidth="lg" fullWidth>
                <RequestListNotes id={props.id} closeModal={() => setModalListNotes(false)} />
            </BootstrapDialog>

            {/* Add a new contact */}
            <BootstrapDialog open={modalNewContact} onClose={() => setModalNewContact(false)} maxWidth="md" fullWidth>
                <NewContact categories={["CUSTOMERS"]} closeModal={() => setModalNewContact(false)} />
            </BootstrapDialog>

            {/* Create new port */}
            <BootstrapDialog open={modalNewPort} onClose={() => setModalNewPort(false)} maxWidth="md" fullWidth>
                <NewPort closeModal={() => setModalNewPort(false)} callBack={props.getPorts} />
            </BootstrapDialog>

            {/* Create new product */}
            <BootstrapDialog open={modalNewProduct} onClose={() => setModalNewProduct(false)} maxWidth="md" fullWidth>
                <NewProduct closeModal={() => setModalNewProduct(false)} callBack={props.getProducts} />
            </BootstrapDialog>
        </>
    );
}

export default RequestFormHeader;
