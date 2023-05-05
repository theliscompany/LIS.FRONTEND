import { Alert, Box, Button, Chip, DialogActions, DialogContent, FormControl, FormControlLabel, FormLabel, Grid, IconButton, InputLabel, NativeSelect, Paper, Radio, RadioGroup, Skeleton, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography } from '@mui/material';
import { MuiTelInput } from 'mui-tel-input';
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import '../../App.css';
import AutocompleteSearch from '../shared/AutocompleteSearch';
import { inputLabelStyles, BootstrapInput, BootstrapDialogTitle, BootstrapDialog, buttonCloseStyles, DarkTooltip, tagInputStyles, whiteButtonStyles } from '../../misc/styles';
import { enqueueSnackbar, SnackbarProvider } from 'notistack';
import DeleteIcon from '@mui/icons-material/Delete';
import { protectedResources } from '../../authConfig';
import { useAuthorizedBackendApi } from '../../api/api';
import { BackendService } from '../../services/fetch';
import { MuiChipsInput, MuiChipsInputChip } from 'mui-chips-input';
import { MailData, RequestDto } from '../../models/models';

//let statusTypes = ["EnAttente", "Valider", "Rejeter"];
let cargoTypes = ["Container", "Conventional", "RollOnRollOff"];

let statusTypes = [
    { type: "EnAttente", value: "En attente", description: "En attente de traitement" }, 
    { type: "Valider", value: "Valider", description: "Devis validé par l'employé" }, 
    { type: "Rejeter", value: "Rejeter", description: "Devis rejeté par l'employé" }, 
    { type: "EnCoursDeTraitement", value: "En cours de traitement", description: "Devis en cours de traitement" }, 
    { type: "EnTransit", value: "En transit", description: "Marchandise en cours de transport" }, 
    { type: "EnDouane", value: "En douane", description: "Marchandise en cours de dédouanement" }, 
    { type: "LivraisonEnCours", value: "Livraison en cours", description: "Marchandise en cours de livraison" }, 
    { type: "Livre", value: "Livré", description: "Marchandise livrée au client" }, 
    { type: "Annule", value: "Annulé", description: "La demande de devis a été annulée" }, 
    { type: "Retour", value: "Retourné", description: "Marchandise retournée à l'expéditeur" }, 
    { type: "Problème", value: "Problème", description: "Problème rencontré lors du transport, à résoudre" }, 
    { type: "EnAttenteDeFacturation", value: "En attente de facturation", description: "En attente de facturation après livraison "} 
];

function convertStringToObject(str: string): { city: string, country: string } {
    if (str !== undefined) {
        const [city, ...countryArr] = str.split(', ');
        const country = countryArr.join(', ');
        return { city, country };
    }
    return { city: "", country: "" };
}

function Request(props: any) {
    const [load, setLoad] = useState<boolean>(true);
    const [loadAssignees, setLoadAssignees] = useState<boolean>(true);
    const [loadNotes, setLoadNotes] = useState<boolean>(true);
    const [email, setEmail] = useState<string>("");
    const [status, setStatus] = useState<string | null>(null);
    const [phone, setPhone] = useState<string>("");
    const [message, setMessage] = useState<string>("");
    const [quantity, setQuantity] = useState<number>(1);
    const [cargoType, setCargoType] = useState<string>("0");
    const [assignedManager, setAssignedManager] = useState<string>("null");
    const [departureTown, setDepartureTown] = useState<any>(null);
    const [arrivalTown, setArrivalTown] = useState<any>(null);
    const [departure, setDeparture] = useState<string>("");
    const [arrival, setArrival] = useState<string>("");
    const [tags, setTags] = useState<MuiChipsInputChip[]>([]);
    const [modal, setModal] = useState<boolean>(false);
    const [modal2, setModal2] = useState<boolean>(false);
    const [modal3, setModal3] = useState<boolean>(false);
    const [modal4, setModal4] = useState<boolean>(false);
    const [mailSubject, setMailSubject] = useState<string>("");
    const [mailContent, setMailContent] = useState<string>("");
    const [statusMessage, setStatusMessage] = useState<string>("");
    const [generalNote, setGeneralNote] = useState<string>("");
    const [selectedStatus, setSelectedStatus] = React.useState('EnAttente');
    const [assignees, setAssignees] = useState<any>(null);
    const [notes, setNotes] = useState<any>(null);
    const [idUser, setIdUser] = useState<any>(null);
    let { id } = useParams();

    const context = useAuthorizedBackendApi();
    
    const handleChangeCargoType = (event: { target: { value: string } }) => {
        setCargoType(event.target.value);
    };
    
    const handleChangeAssignedManager = (event: { target: { value: string } }) => {
        setAssignedManager(event.target.value);
    };
    
    const handleChangeStatus = (event: React.ChangeEvent<HTMLInputElement>) => {
        setSelectedStatus((event.target as HTMLInputElement).value);
    };
    
    useEffect(() => {
        //loadRequest();
        getAssignees();
    }, [context]);
    
    const postEmail = async(from: string, to: string, subject: string, htmlContent: string) => {
        const body: MailData = { from: from, to: to, subject: subject, htmlContent: htmlContent };
        const data = await (context as BackendService<any>).postForm(protectedResources.apiLisQuotes.endPoint+"/Email", body);
        console.log(data);
        if (data?.status === 200) {
            enqueueSnackbar("The message has been successfully sent.", { variant: "success", anchorOrigin: { horizontal: "right", vertical: "top"} });
            setMailSubject("");
            setMailContent("");
            setModal(false);
        }
        else {
            enqueueSnackbar("An error occured. Please refresh the page or check your internet connection.", { variant: "error", anchorOrigin: { horizontal: "right", vertical: "top"} });
        }
    }

    function sendEmail() {
        if (mailSubject !== "" || mailContent !== "") {
            var content = "<body style=\"font-family: Arial, sans-serif; font-size: 14px; color: #333;\">\r\n\t<div style=\"background-color: #f2f2f2; padding: 20px;\">\r\n\t\t<p style=\"margin-bottom: 20px;\">"+ mailContent +"</p>\r\n\t\t<p style=\"margin-top: 20px;\">Please, click the button up to track your request.</p>\r\n\t<a href=\"https://lisquotes-ui.azurewebsites.net/tracking\" style=\"display: inline-block; background-color: #008089; color: #fff; padding: 10px 20px; text-decoration: none;\">Tracking</a>\r\n\t\t</div>\r\n</body>";
            //var content = "<body style=\"font-family: Arial, sans-serif; font-size: 14px; color: #333;\">\r\n\t<div style=\"background-color: #f2f2f2; padding: 20px;\">\r\n\t\t<p style=\"margin-bottom: 20px;\">"+ mailContent +"</p>\r\n\t\t</div>\r\n</body>";
            postEmail("cyrille.penaye@omnifreight.eu", email, mailSubject, content);
        }
        else {
            enqueueSnackbar("The subject and/or content fields are empty, please fill them.", { variant: "error", anchorOrigin: { horizontal: "right", vertical: "top"} });
        }
    }
      
    const getAssignees = async () => {
        if (context) {
            setLoadAssignees(true);
            const response = await (context as BackendService<any>).getSingle(protectedResources.apiLisQuotes.endPoint+"/Assignee");
            if (response !== null && response.code !== undefined) {
                if (response.code === 200) {
                    setAssignees(response.data);
                    setLoadAssignees(false);

                    // Now i can load the user
                    loadRequest();
                }
                else {
                    setLoadAssignees(false);
                }
            }  
        }
    }
    
    const loadRequest = async () => {
        if (context) {
            setLoad(true);
            const response = await (context as BackendService<any>).getSingle(protectedResources.apiLisQuotes.endPoint+"/Request/"+id);
            if (response !== null && response.code !== undefined) {
                if (response.code === 200) {
                    setEmail(response.data.email);
                    setPhone(response.data.whatsapp);
                    setDeparture(response.data.departure);
                    setArrival(response.data.arrival);
                    setDepartureTown(convertStringToObject(response.data.departure));
                    setArrivalTown(convertStringToObject(response.data.arrival));
                    setStatus(response.data.status);
                    setCargoType(String(cargoTypes.indexOf(response.data.cargoType)));
                    setQuantity(response.data.quantity);
                    setMessage(response.data.detail);
                    setTags(response.data.tags !== null ? response.data.tags.split(",") : []);
                    setAssignedManager(response.data.assigneeId);
                    setLoad(false);

                    // Now i can get assignees (for synchronisation problems)
                    //getAssignees();
                }
                else {
                    setLoad(false);
                }
            }  
        }
    }
    
    const assignManager = async () => {
        if (assignedManager !== null && assignedManager !== undefined && assignedManager !== "") {
            if (context) {
                const response = await (context as BackendService<any>).put(protectedResources.apiLisQuotes.endPoint+"/Assignee/"+id+"/"+assignedManager, []);
                if (response !== null) {
                    enqueueSnackbar("The manager has been assigned to this request.", { variant: "success", anchorOrigin: { horizontal: "right", vertical: "top"} });
                }
                else {
                    enqueueSnackbar("An error happened during the operation.", { variant: "error", anchorOrigin: { horizontal: "right", vertical: "top"} });
                }
            }
        }
        else {
            enqueueSnackbar("You must select a request manager first.", { variant: "error", anchorOrigin: { horizontal: "right", vertical: "top"} });
        }
    }

    const removeManager = async () => {
        if (context) {
            const response = await (context as BackendService<any>).put(protectedResources.apiLisQuotes.endPoint+"/Assignee/unassign/"+id, []);
            if (response !== null) {
                enqueueSnackbar("The manager has been removed from this request.", { variant: "success", anchorOrigin: { horizontal: "right", vertical: "top"} });
                setAssignedManager("");
            }
            else {
                enqueueSnackbar("An error happened during the operation.", { variant: "error", anchorOrigin: { horizontal: "right", vertical: "top"} });
            }
        }
    }
    
    const editRequest = async () => {
        if(context) {
            const body: RequestDto = {
                id: Number(id),
                email: email,
                status: status,
                whatsapp: phone,
                departure: departure,
                arrival: arrival,
                cargoType: 0,
                quantity: quantity,
                detail: message,
                tags: tags.length !== 0 ? tags.join(",") : null,
                assigneeId: Number(assignedManager)
            };

            const data = await (context as BackendService<any>).put(protectedResources.apiLisQuotes.endPoint+"/Request/"+id, body);
            if (data?.status === 200) {
                enqueueSnackbar("Your request has been edited with success.", { variant: "success", anchorOrigin: { horizontal: "right", vertical: "top"} });
            }
            else {
                enqueueSnackbar("An error happened during the operation.", { variant: "error", anchorOrigin: { horizontal: "right", vertical: "top"} });
            }
        }
    }

    const changeStatusRequest = async () => {
        if(context) {
            const body: any = {
                newStatus: selectedStatus,
                customMessage: statusMessage
            };

            const data = await (context as BackendService<any>).put(protectedResources.apiLisQuotes.endPoint+"/Request/"+id+"/changeStatus", body);
            if (data?.status === 200) {
                setModal2(false);
                enqueueSnackbar("Your request's status has been updated with success.", { variant: "success", anchorOrigin: { horizontal: "right", vertical: "top"} });
            }
            else {
                enqueueSnackbar("An error happened during the operation.", { variant: "error", anchorOrigin: { horizontal: "right", vertical: "top"} });
            }
        }
    }

    const askInformations = async () => {
        if (mailContent !== "") {
            if (context) {
                var dataSent = { "content": mailContent, "requestQuoteId": id, "subject": mailSubject, "noteType": "InformationRequest", email: email, "idUser": idUser };
                const response = await (context as BackendService<any>).post(protectedResources.apiLisQuotes.endPoint+"/RequestQuoteNotes", dataSent);
                if (response !== null) {
                    setModal(false);
                    enqueueSnackbar("The message has been successfully sent.", { variant: "success", anchorOrigin: { horizontal: "right", vertical: "top"} });
                }
                else {
                    enqueueSnackbar("An error happened during the operation.", { variant: "error", anchorOrigin: { horizontal: "right", vertical: "top"} });
                }
            }
        }
        else {
            enqueueSnackbar("The content field is empty, please fill it.", { variant: "error", anchorOrigin: { horizontal: "right", vertical: "top"} });
        }
    }

    const addRequestNote = async () => {
        if (generalNote !== "") {
            if (context) {
                var dataSent = { "content": generalNote, "requestQuoteId": id, "noteType": "General", "idUser": idUser };
                const response = await (context as BackendService<any>).post(protectedResources.apiLisQuotes.endPoint+"/RequestQuoteNotes", dataSent);
                if (response !== null) {
                    setModal3(false);
                    enqueueSnackbar("The comment/note has been successfully added.", { variant: "success", anchorOrigin: { horizontal: "right", vertical: "top"} });
                }
                else {
                    enqueueSnackbar("An error happened during the operation.", { variant: "error", anchorOrigin: { horizontal: "right", vertical: "top"} });
                }
            }
        }
        else {
            enqueueSnackbar("The content field is empty, please fill it.", { variant: "error", anchorOrigin: { horizontal: "right", vertical: "top"} });
        }
    }

    const getNotes = async (idRequest: string|undefined) => {
        if (context) {
            setLoadNotes(true);
            const response = await (context as BackendService<any>).getSingle(protectedResources.apiLisQuotes.endPoint+"/RequestQuoteNotes?requestQuoteId="+idRequest);
            if (response !== null && response.code !== undefined) {
                if (response.code === 200) {
                    console.log(response.data);
                    setNotes(response.data);
                    setLoadNotes(false);
                }
                else {
                    setLoadNotes(false);
                }
            }
        }
    }
    
    const deleteNote = async (idNote: string) => {
        if (context) {
            const response = await (context as any).delete(protectedResources.apiLisQuotes.endPoint+"/RequestQuoteNotes/"+idNote);
            if (response !== null && response.code !== undefined) {
                if (response.code === 200) {
                    enqueueSnackbar("The note has been deleted with success.", { variant: "success", anchorOrigin: { horizontal: "right", vertical: "top"} });
                    getNotes(id);
                }
                else {
                    enqueueSnackbar("An error happened during this operation.", { variant: "error", anchorOrigin: { horizontal: "right", vertical: "top"} });
                }
            }  
        }
    }

    return (
        <div style={{ background: "#fff", borderTopLeftRadius: 20, borderTopRightRadius: 20 }}>
            <SnackbarProvider />
            <Box py={4}>
                <Typography variant="h5" mt={3} mx={5}><b>Manage a request for quote N° {id}</b></Typography>
                <Box>
                    {
                        !load ? 
                        <Grid container spacing={2} mt={1} px={5}>
                            <Grid item xs={12}>
                                <Alert 
                                    severity="info" 
                                    sx={{ display: "flex", alignItems: "center", justifyContent: "left" }}
                                    action={<Button variant="contained" color="inherit" sx={{ background: "#fff", color: "#333", float: "right", textTransform: "none", position: "relative", bottom: "2px" }} onClick={() => { setModal(true); }}>Ask for more informations</Button>}
                                >
                                    <Typography variant="subtitle1" display="inline">Do you think this request need more informations?</Typography>
                                </Alert>
                            </Grid>
                            <Grid item xs={6}>
                                <InputLabel htmlFor="whatsapp-phone-number" sx={inputLabelStyles}>Whatsapp number</InputLabel>
                                <MuiTelInput id="whatsapp-phone-number" value={phone} onChange={setPhone} defaultCountry="CM" preferredCountries={["CM", "BE", "KE"]} sx={{ mt: 1, paddingLeft: "4px" }} fullWidth /*disabled={status === "Valider"}*/ />
                            </Grid>
                            <Grid item xs={6}>
                                <InputLabel htmlFor="request-email" sx={inputLabelStyles}>Email</InputLabel>
                                <BootstrapInput id="request-email" type="email" value={email} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)} fullWidth disabled />
                            </Grid>
                            <Grid item xs={6}>
                                <InputLabel htmlFor="departure" sx={inputLabelStyles}>City and country of departure of the goods</InputLabel>
                                <AutocompleteSearch id="departure" value={departureTown} onChange={(e: any) => { setDepartureTown(convertStringToObject(e.target.innerText)); setDeparture(e.target.innerText); }} fullWidth /*disabled={status === "Valider"}*/ />
                            </Grid>
                            <Grid item xs={6}>
                                <InputLabel htmlFor="arrival" sx={inputLabelStyles}>City and country of arrival of the goods</InputLabel>
                                <AutocompleteSearch id="arrival" value={arrivalTown} onChange={(e: any) => { setArrivalTown(convertStringToObject(e.target.innerText)); setArrival(e.target.innerText); }} fullWidth /*disabled={status === "Valider"}*/ />
                            </Grid>
                            <Grid item xs={3}>
                                <InputLabel htmlFor="cargo-type" sx={inputLabelStyles}>Type of cargo</InputLabel>
                                <NativeSelect
                                    id="cargo-type"
                                    value={cargoType}
                                    onChange={handleChangeCargoType}
                                    input={<BootstrapInput />}
                                    fullWidth
                                    /*disabled={status === "Valider"}*/
                                >
                                    <option value="0">Container</option>
                                    <option value="1">Conventional</option>
                                    <option value="2">Roll-on/Roll-off</option>
                                </NativeSelect>
                            </Grid>
                            <Grid item xs={3}>
                                <InputLabel htmlFor="quantity" sx={inputLabelStyles}>Quantity</InputLabel>
                                <BootstrapInput id="quantity" type="number" inputProps={{ min: 0, max: 100 }} value={quantity} onChange={(e: any) => {console.log(e); setQuantity(e.target.value)}} fullWidth /*disabled={status === "Valider"}*/ />
                            </Grid>
                            <Grid item xs={6}>
                                <InputLabel htmlFor="tags" sx={inputLabelStyles}>Tags</InputLabel>
                                <MuiChipsInput 
                                    id="tags" 
                                    placeholder="Type some key words of your request" 
                                    value={tags} variant="outlined" 
                                    onChange={(elm: MuiChipsInputChip[]) => { setTags(elm); }} 
                                    fullWidth 
                                    sx={tagInputStyles} 
                                    renderChip={(Component, key, props) => {
                                        return <Component {...props} key={key} sx={{ mt: .75 }} />
                                    }}
                                />
                            </Grid>
                            <Grid item xs={6} mt={.5}>
                                <InputLabel htmlFor="request-message" sx={inputLabelStyles}>Other details about your need (Optional)</InputLabel>
                                <BootstrapInput id="request-message" type="text" multiline rows={3.5} value={message} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setMessage(e.target.value)} fullWidth /*disabled={status === "Valider"}*/ />
                            </Grid>
                            <Grid item xs={6} mt={1}>
                                <InputLabel htmlFor="assigned-manager" sx={inputLabelStyles}>Assigned manager</InputLabel>
                                {
                                    !loadAssignees ? 
                                    <>
                                        <NativeSelect
                                            id="assigned-manager"
                                            value={assignedManager}
                                            onChange={handleChangeAssignedManager}
                                            input={<BootstrapInput />}
                                            fullWidth
                                            /*disabled={status === "Valider"}*/
                                        >
                                            <option value="">No agent assigned</option>
                                            {
                                                assignees.map((row: any, i: number) => (
                                                    <option key={"assigneeId-"+i} value={String(row.id)}>{row.name}</option>
                                                ))
                                            }
                                        </NativeSelect>
                                        <Button variant="contained" color="inherit" sx={whiteButtonStyles} style={{ marginRight: "10px" }} onClick={assignManager} >Update the manager</Button>
                                        <Button variant="contained" color="inherit" sx={whiteButtonStyles} onClick={removeManager} >Remove the manager</Button>
                                    </> : <Skeleton sx={{ mt: 3 }} />   
                                }
                            </Grid>
                            <Grid item xs={12}>
                                <Button variant="contained" color="primary" sx={{ mt: 2, mr: 2, textTransform: "none" }} onClick={editRequest} >Edit the request</Button>
                                <Button variant="contained" color="inherit" sx={whiteButtonStyles} onClick={() => { setModal2(true); }} >Change the status</Button>
                                <Button variant="contained" color="inherit" sx={whiteButtonStyles} style={{ float: "right" }} onClick={() => { setModal3(true); }} >Add a comment/note</Button>
                                <Button variant="contained" color="inherit" sx={whiteButtonStyles} style={{ float: "right", marginRight: "10px" }} onClick={() => { setModal4(true); getNotes(id); }} >List of notes</Button>
                            </Grid>
                        </Grid> : <Skeleton sx={{ mx: 5, mt: 3 }} />
                    }
                </Box>
            </Box>
            
            {/* Ask for informations */}
            <BootstrapDialog
                onClose={() => setModal(false)}
                aria-labelledby="custom-dialog-title"
                open={modal}
                maxWidth="md"
                fullWidth
            >
                <BootstrapDialogTitle id="custom-dialog-title" onClose={() => setModal(false)}>
                    <b>Ask for informations</b>
                </BootstrapDialogTitle>
                <DialogContent dividers>
                    <Typography variant="subtitle1" gutterBottom px={2}>
                        Please fill in the form and click the button to send your message.
                    </Typography>
                    <Grid container spacing={2} mt={1} px={2}>
                        <Grid item xs={12}>
                            <InputLabel htmlFor="mail-subject" sx={inputLabelStyles}>Subject</InputLabel>
                            <BootstrapInput id="mail-subject" type="text" inputProps={{ min: 0, max: 100 }} value={mailSubject} onChange={(e: any) => {console.log(e); setMailSubject(e.target.value)}} fullWidth />
                        </Grid>
                        <Grid item xs={12} mt={1}>
                            <InputLabel htmlFor="mail-content" sx={inputLabelStyles}>Content</InputLabel>
                            <BootstrapInput id="mail-content" type="text" multiline rows={4} value={mailContent} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setMailContent(e.target.value)} fullWidth />
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions>
                    <Button variant="contained" color={!load ? "primary" : "info"} className="mr-3" onClick={askInformations} disabled={load === true} sx={{ textTransform: "none" }}>Send</Button>
                    <Button variant="contained" onClick={() => setModal(false)} sx={buttonCloseStyles}>Close</Button>
                </DialogActions>
            </BootstrapDialog>
            
            {/* Change request status */}
            <BootstrapDialog
                onClose={() => setModal2(false)}
                aria-labelledby="custom-dialog-title2"
                open={modal2}
                maxWidth="md"
                fullWidth
            >
                <BootstrapDialogTitle id="custom-dialog-title" onClose={() => setModal2(false)}>
                    <b>Change the request status</b>
                </BootstrapDialogTitle>
                <DialogContent dividers>
                    <Typography variant="subtitle1" gutterBottom px={2}>
                        Please choose of the following options as the status of the request.
                    </Typography>
                    <Grid container spacing={2} mt={1} px={2}>
                        <Grid item xs={12}>
                            <FormControl>
                                <FormLabel id="demo-controlled-radio-buttons-group" sx={{ color: "#333" }}>Status list</FormLabel>
                                <RadioGroup
                                    aria-labelledby="demo-controlled-radio-buttons-group"
                                    name="controlled-radio-buttons-group"
                                    row
                                    value={selectedStatus}
                                    onChange={handleChangeStatus}
                                >
                                    {
                                        statusTypes.map((elm) => <DarkTooltip key={"StatusType-"+elm.type} title={elm.description} placement="right" arrow><FormControlLabel value={elm.type} control={<Radio />} label={elm.value} /></DarkTooltip>)
                                    }
                                </RadioGroup>
                            </FormControl>
                        </Grid>
                        <Grid item xs={12} mt={1}>
                            <InputLabel htmlFor="status-message" sx={inputLabelStyles}>Status message (this message will be sent to the requester, leave empty to not send a mail)</InputLabel>
                            <BootstrapInput id="status-message" type="text" multiline rows={4} value={statusMessage} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setStatusMessage(e.target.value)} fullWidth />
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions>
                    <Button variant="contained" color={!load ? "primary" : "info"} className="mr-3" onClick={changeStatusRequest} disabled={load === true} sx={{ textTransform: "none" }}>Validate</Button>
                    <Button variant="contained" onClick={() => setModal2(false)} sx={buttonCloseStyles}>Close</Button>
                </DialogActions>
            </BootstrapDialog>
            
            {/* Add a comment/note */}
            <BootstrapDialog
                onClose={() => setModal3(false)}
                aria-labelledby="custom-dialog-title3"
                open={modal3}
                maxWidth="md"
                fullWidth
            >
                <BootstrapDialogTitle id="custom-dialog-title" onClose={() => setModal3(false)}>
                    <b>Add a comment/note</b>
                </BootstrapDialogTitle>
                <DialogContent dividers>
                    <Typography variant="subtitle1" gutterBottom px={2}>
                        Please fill in the field below and click the button to add note.
                    </Typography>
                    <Grid container spacing={2} mt={1} px={2}>
                        <Grid item xs={12}>
                            
                        </Grid>
                        <Grid item xs={12} mt={1}>
                            <InputLabel htmlFor="general-note" sx={inputLabelStyles}>General note</InputLabel>
                            <BootstrapInput id="general-note" type="text" multiline rows={4} value={generalNote} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setGeneralNote(e.target.value)} fullWidth />
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions>
                    <Button variant="contained" color={!load ? "primary" : "info"} className="mr-3" onClick={addRequestNote} disabled={load === true} sx={{ textTransform: "none" }}>Validate</Button>
                    <Button variant="contained" onClick={() => setModal3(false)} sx={buttonCloseStyles}>Close</Button>
                </DialogActions>
            </BootstrapDialog>

            {/* List of notes */}
            <BootstrapDialog
                onClose={() => setModal4(false)}
                aria-labelledby="custom-dialog-title4"
                open={modal4}
                maxWidth="lg"
                fullWidth
            >
                <BootstrapDialogTitle id="custom-dialog-title" onClose={() => setModal4(false)}>
                    <b>List of notes of request N° {id}</b>
                </BootstrapDialogTitle>
                <DialogContent dividers>
                    <Grid container spacing={2} mt={1} px={2}>
                        <Grid item xs={12}>
                            {
                                !loadNotes && notes !== null ?
                                <TableContainer component={Paper}>
                                    <Table sx={{ minWidth: 650 }} aria-label="simple table" size="small">
                                        <TableHead>
                                            <TableRow>
                                                <TableCell align="left" sx={{ fontSize: 16, fontWeight: "bolder" }}>Id</TableCell>
                                                <TableCell align="left" sx={{ fontSize: 16, fontWeight: "bolder" }}>Content</TableCell>
                                                <TableCell align="left" sx={{ fontSize: 16, fontWeight: "bolder" }}>Date</TableCell>
                                                {/* <TableCell align="left" sx={{ fontSize: 16, fontWeight: "bolder" }}>Request id</TableCell> */}
                                                <TableCell align="left" sx={{ fontSize: 16, fontWeight: "bolder" }}>Note type</TableCell>
                                                <TableCell align="left"><b></b></TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {
                                                notes.reverse().map((row: any, i: number) => (
                                                    <TableRow key={"requestNote-"+row.id} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                                                        <TableCell align="left">{row.id}</TableCell>
                                                        <TableCell align="left">{row.content}</TableCell>
                                                        <TableCell align="left">{(new Date(row.createdAt)).toLocaleString()}</TableCell>
                                                        {/* <TableCell align="left">{row.requestQuoteId}</TableCell> */}
                                                        <TableCell align="left">
                                                            <Chip label={row.noteType} color={row.noteType === "General" ? "primary" : "warning" } />
                                                        </TableCell>
                                                        <TableCell align="left">
                                                            <DarkTooltip title="Delete this note" placement="right" arrow>
                                                                <IconButton 
                                                                    size="medium" 
                                                                    onClick={() => { deleteNote(row.id); }}
                                                                    disabled={row.noteType !== "General"}
                                                                >
                                                                    <DeleteIcon />
                                                                </IconButton>
                                                            </DarkTooltip>
                                                        </TableCell>
                                                    </TableRow>
                                                ))
                                            }
                                        </TableBody>
                                    </Table>
                                </TableContainer> : <Skeleton sx={{ mt: 3 }} />
                            }
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions>
                    <Button variant="contained" onClick={() => setModal4(false)} sx={buttonCloseStyles}>Close</Button>
                </DialogActions>
            </BootstrapDialog>
        </div>
    );
}

export default Request;
