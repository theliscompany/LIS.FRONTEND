import { useState } from "react";
import { Alert, Button, Chip, Grid, Typography } from "@mui/material";
import { useTranslation } from "react-i18next";
import { BootstrapDialog, whiteButtonStyles } from "../../utils/misc/styles";
import RequestAddNote from "./RequestAddNote";
import RequestAskInformation from "./RequestAskInformation";
import RequestChangeStatus from "./RequestChangeStatus";
import RequestListNotes from "./RequestListNotes";
import NewPort from "../shared/NewPort";
import NewProduct from "../shared/NewProduct";
import NewContact from "./NewContact";
import { statusTypes } from "../../utils/constants";
import { colorsTypes } from "../../utils/functions";

function RequestFormHeader(props: any) {
    const [modal, setModal] = useState<boolean>(false);
    const [modalStatus, setModalStatus] = useState<boolean>(false);
    const [modalAddNote, setModalAddNote] = useState<boolean>(false);
    const [modalListNotes, setModalListNotes] = useState<boolean>(false);
    const [modalNewContact, setModalNewContact] = useState<boolean>(false);
    const [modalNewPort, setModalNewPort] = useState<boolean>(false);
    const [modalNewProduct, setModalNewProduct] = useState<boolean>(false);
    
    const { t } = useTranslation();
    // Find the status type by type
    const statusType = statusTypes.find((elm) => elm.type === props.status);
    // Translate the label
    const label = statusType ? t(statusType.label) : 'Unknown Status';

    return (
        <>
            <Grid item xs={6}>
                <Typography variant="body2" color="dodgerblue" sx={{ fontWeight: "bold" }}>
                    <span style={{ color: 'red' }}>{t('quoteNumber')} : </span> N° {props.trackingNumber}
                    <Chip size="small" label={label} color={colorsTypes(props.status)} sx={{ ml: 1 }} />
                </Typography>
            </Grid>
            <Grid item xs={6}>
                <Button 
                    variant="contained" color="inherit" 
                    sx={{ float: "right", backgroundColor: "#fff", textTransform: "none", ml: 2 }} 
                    onClick={() => { setModalNewProduct(true); }}
                >
                    {t('newProduct')}
                </Button>
                <Button 
                    variant="contained" color="inherit" 
                    sx={{ float: "right", backgroundColor: "#fff", textTransform: "none", ml: 2 }} 
                    onClick={() => { setModalNewPort(true); }}
                >
                    {t('createNewPort')}
                </Button>
                <Button 
                    variant="contained" color="inherit" 
                    sx={{ float: "right", backgroundColor: "#fff", textTransform: "none" }} 
                    onClick={() => { setModalNewContact(true); }}
                >
                    {t('createNewContact')}
                </Button>
            </Grid>
            <Grid item xs={12}>
                <Alert 
                    severity="info" 
                    sx={{ display: { xs: "block", md: "flex" }, alignItems: "center", justifyContent: "left" }}
                    action={<Button variant="contained" color="inherit" sx={{ background: "#fff", color: "#333", float: "right", textTransform: "none", position: "relative", bottom: "2px" }} onClick={() => { setModal(true); }}>{t('askMoreInformation')}</Button>}
                >
                    <Typography variant="subtitle1" display="inline">{t('doYouThinkInformation')}</Typography>
                </Alert>
            </Grid>
            <Grid item xs={12}>
                <Button variant="contained" color="primary" sx={{ mt: 2, mr: 2, textTransform: "none" }} onClick={props.editRequest} >{t('editRequest')}</Button>
                <Button variant="contained" color="inherit" sx={whiteButtonStyles} onClick={() => { setModalStatus(true); }} >{t('changeStatus')}</Button>
                <Button variant="contained" color="inherit" sx={whiteButtonStyles} style={{ float: "right" }} onClick={() => { setModalAddNote(true); }} >{t('addCommentNote')}</Button>
                <Button variant="contained" color="inherit" sx={whiteButtonStyles} style={{ float: "right", marginRight: "10px" }} onClick={() => { setModalListNotes(true); }} >{t('listNotes')}</Button>
            </Grid>

            {/* Ask for information */}
            <BootstrapDialog open={modal} onClose={() => setModal(false)} maxWidth="md" fullWidth>
                <RequestAskInformation id={props.id} userId={null} email={props.email} closeModal={() => setModal(false)} />
            </BootstrapDialog>
            
            {/* Change request status */}
            <BootstrapDialog open={modalStatus} onClose={() => setModalStatus(false)} maxWidth="md" fullWidth>
                <RequestChangeStatus id={props.id} closeModal={() => setModalStatus(false)} />
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
                <NewContact categories={[""]} closeModal={() => setModalNewContact(false)} />
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