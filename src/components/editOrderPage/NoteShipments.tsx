import { Delete, Edit, ExpandMore, Report } from "@mui/icons-material";
import { Accordion, AccordionSummary, AccordionDetails, Grid, Button, Skeleton, DialogActions, DialogContent, InputLabel, NativeSelect, Box, IconButton, Chip } from "@mui/material";
import { DataGrid, GridColDef, GridRenderCellParams } from "@mui/x-data-grid";
import { t } from "i18next";
import { whiteButtonStyles, sizingStyles, actionButtonStyles, BootstrapDialog, BootstrapDialogTitle, BootstrapInput, buttonCloseStyles, inputLabelStyles } from "../../utils/misc/styles";
import dayjs, { Dayjs } from "dayjs";
import { useEffect, useState } from "react";
import { prioritiesOptions } from "../../utils/constants";
import DateComplex from "../shared/DateComplex";
import { enqueueSnackbar } from "notistack";
import { protectedResources } from "../../config/authConfig";
import { BackendService } from "../../utils/services/fetch";
import { useMsal, useAccount } from "@azure/msal-react";
import { useAuthorizedBackendApi } from "../../api/api";

const NoteShipments = (props: any) => {
    const [loadNotes, setLoadNotes] = useState<boolean>(true);
    const [notes, setNotes] = useState<any>(null);
    const [modalNote, setModalNote] = useState<boolean>(false);
    const [currentNoteId, setCurrentNoteId] = useState<string>("");
    const [noteTitle, setNoteTitle] = useState<string>("");
    const [flag, setFlag] = useState<string>("");
    const [textContent, setTextContent] = useState<string>("");
    const [alertDate, setAlertDate] = useState<Dayjs | null>(null);
    
    const { instance, accounts } = useMsal();
    const account = useAccount(accounts[0] || {});    
    const context = useAuthorizedBackendApi();
    
    const { id, orderData } = props;
    
    const columnsNotes: GridColDef[] = [
        // { field: 'title', headerName: t('Title'), flex: 0.5 },
        { field: 'title', headerName: t('Title'), renderCell: (params: GridRenderCellParams) => {
            return (
                <Box sx={{ my: 1, mr: 1, display: "contents" }}>
                    {
                        params.row.flag !== "NORMAL" ? 
                        <Report fontSize="small" htmlColor="red" sx={{ mr: 0.5 }} /> : null
                    }
                    <span>{params.row.title}</span>
                </Box>
            );
        }, flex: 0.5 },
        { field: 'noteDate', headerName: t('created'), renderCell: (params: GridRenderCellParams) => {
            return (
                <Box sx={{ my: 1, mr: 1 }}>
                    <span>{(new Date(params.row.noteDate)).toLocaleDateString().slice(0,10)}</span>
                </Box>
            );
        }, flex: 0.25 },
        { field: 'userId', headerName: t('User'), flex: 0.25 },
        { field: 'www', headerName: t('Actions'), renderCell: (params: GridRenderCellParams) => {
            return (
                <Box sx={{ my: 1 }}>
                    <IconButton 
                        edge="end" 
                        onClick={() => { 
                            setCurrentNoteId(params.row.noteId);
                            setModalNote(true);
                            setNoteTitle(params.row.title);
                            setTextContent(params.row.textContent);
                            setFlag(params.row.flag);
                            setAlertDate(dayjs(params.row.alertDate));
                        }} 
                        sx={{ mr: 0 }}
                    >
                        <Edit fontSize='small' />
                    </IconButton>
                    <IconButton edge="end" onClick={() => { deleteOrderNote(params.row.noteId); }}>
                        <Delete fontSize='small' />
                    </IconButton>
                </Box>
            );
        } }
    ];
        
    useEffect(() => {
        getNotes();
    }, [account, instance, context]);

    const getNotes = async () => {
        if (account && instance && context) {
            try {
                if (id !== undefined) {
                    setLoadNotes(true);
                    const response = await (context?.service as BackendService<any>).getSingle(protectedResources.apiLisShipments.endPoint+"/Notes/GetByOrderId/"+id);
                    if (response !== null && response !== undefined && response.status !== 404) {
                        console.log("Notes : ", response);
                        setNotes(response.$values);
                        setLoadNotes(false);
                    }
                    else {
                        setLoadNotes(false);
                    }
                }
            }
            catch (err: any) {
                console.log("Error notes : ", err);
                setNotes([]);
                setLoadNotes(false);
            }
        }
    }

    const addOrderNote = async () => {
        if (account && instance && context) {
            console.log("Bang!");
            try {
                // setLoadCreate(true);
                var dataSent = {};
                if (orderData !== null) {
                    console.log("Bang 3!");
                    if (currentNoteId !== "") {
                        dataSent = {
                            "noteId": currentNoteId,
                            "orderId": orderData.orderId,
                            "authorId": 2,
                            "title": noteTitle,
                            "textContent": textContent,
                            "flag": flag,
                            "type": null,
                            "userId": account.name,
                            "alertDate": alertDate?.toISOString(),
                            "alertRead": null
                        };
                        const response = await (context?.service as BackendService<any>).putWithToken(protectedResources.apiLisShipments.endPoint+"/Notes/"+currentNoteId, dataSent, context.tokenLogin);
                        if (response !== undefined && response !== null) {
                            enqueueSnackbar("The order cargo has been created with success!", { variant: "success", anchorOrigin: { horizontal: "right", vertical: "top"} });
                            setModalNote(false);
                            getNotes();
                        }
                        else {
                            setModalNote(false);
                            getNotes();
                        }
                    }
                    else {
                        dataSent = {
                            // "noteId": currentNoteId,
                            "orderId": orderData.orderId,
                            "authorId": 2,
                            "title": noteTitle,
                            "textContent": textContent,
                            "flag": flag,
                            "type": null,
                            "userId": account.name,
                            "alertDate": alertDate?.toISOString(),
                            "alertRead": null
                        };
                        const response = await (context?.service as BackendService<any>).postWithToken(protectedResources.apiLisShipments.endPoint+"/Notes", dataSent, context.tokenLogin);
                        if (response !== undefined && response !== null) {
                            enqueueSnackbar("The order cargo has been edited with success!", { variant: "success", anchorOrigin: { horizontal: "right", vertical: "top"} });
                            setModalNote(false);
                            getNotes();
                        }
                        else {
                            setModalNote(false);
                            getNotes();
                        }
                    }
                }
            }
            catch (err: any) {
                enqueueSnackbar(t('errorHappened'), { variant: "error", anchorOrigin: { horizontal: "right", vertical: "top"} });
                console.log(err);
            }
        }
    }

    const deleteOrderNote = async (noteId: string) => {
        if (account && instance && context) {
            try {
                const response = await (context?.service as BackendService<any>).delete(protectedResources.apiLisShipments.endPoint+"/Notes/"+noteId);
                console.log(response);
                enqueueSnackbar(t('rowDeletedSuccess'), { variant: "success", anchorOrigin: { horizontal: "right", vertical: "top"} });
                getNotes();
            }
            catch (e: any) {
                console.log(e);
                enqueueSnackbar(t('rowDeletedError'), { variant: "error", anchorOrigin: { horizontal: "right", vertical: "top"} });
            }
        }
    }
    
    return (
        <>
        <Accordion expanded sx={{ width: "100%" }}>
            <AccordionSummary expandIcon={<ExpandMore />} aria-controls="panel15-content" id="panel15-header">
                Notes
            </AccordionSummary>
            <AccordionDetails>
                <Grid container>
                    <Grid item xs={12} sx={{ mb: 1 }}>
                        <Button 
                            variant="contained" color="inherit" 
                            sx={whiteButtonStyles} style={{ float: "right" }} 
                            onClick={() => { 
                                // console.log("Account : ", account); 
                                getNotes(); 
                            }}
                        >
                            {t('reload')}
                        </Button>
                        <Button 
                            variant="contained" color="inherit" 
                            sx={whiteButtonStyles} style={{ float: "right", marginRight: "5px" }} 
                            onClick={() => { 
                                setCurrentNoteId(""); 
                                setModalNote(true); 
                                setNoteTitle("");
                                setAlertDate(null);
                                setTextContent("");
                                setFlag("NORMAL");
                            }}
                        >
                            {t('New note')}
                        </Button>
                    </Grid>
                    <Grid item xs={12}>
                        {
                            notes !== null ?
                            <DataGrid
                                rows={notes}
                                columns={columnsNotes}
                                getRowId={(row: any) => row?.noteId}
                                getRowHeight={() => "auto" }
                                sx={sizingStyles}
                                disableRowSelectionOnClick
                                style={{ height: "300px", fontSize: "12px" }}
                                pagination
                            /> : <Skeleton />
                        }
                    </Grid>
                </Grid>
            </AccordionDetails>
        </Accordion>

        <BootstrapDialog open={modalNote} onClose={() => setModalNote(false)} maxWidth="md" fullWidth>
            <BootstrapDialogTitle id="custom-dialog-title-3" onClose={() => setModalNote(false)}>
                <b>{currentNoteId !== "" ? t('Edit a note') : t('Add a note')}</b>
            </BootstrapDialogTitle>
            <DialogContent dividers>
                <Grid container spacing={2}>
                    <Grid item xs={6}>
                        <InputLabel htmlFor="noteTitle" sx={inputLabelStyles}>{t('Title')}</InputLabel>
                        <BootstrapInput id="noteTitle" type="text" value={noteTitle} onChange={(e: any) => setNoteTitle(e.target.value)} fullWidth />
                    </Grid>
                    <Grid item xs={3}>
                        <InputLabel htmlFor="flag" sx={inputLabelStyles}>{t('Priority')}</InputLabel>
                        <NativeSelect
                            id="flag"
                            value={flag}
                            onChange={(e: any) => { setFlag(e.target.value); }}
                            input={<BootstrapInput />}
                            fullWidth
                        >
                            {
                                prioritiesOptions.map((row: any, i: number) => (
                                    <option key={"flagX-"+i} value={row.value}>{row.label}</option>
                                ))
                            }
                        </NativeSelect>
                    </Grid>
                    <Grid item xs={3}>
                        <InputLabel htmlFor="alertDate" sx={inputLabelStyles}>{t('Alert Date')}</InputLabel>
                        <DateComplex id="alertDate" value={alertDate} onChange={setAlertDate} fullWidth />
                    </Grid>
                    <Grid item xs={12}>
                        <InputLabel htmlFor="textContent" sx={inputLabelStyles}>{t('Message')}</InputLabel>
                        <BootstrapInput id="textContent" type="text" rows={4} multiline value={textContent} onChange={(e: any) => setTextContent(e.target.value)} fullWidth />
                    </Grid>
                </Grid>
            </DialogContent>
            <DialogActions>
                <Button variant="contained" onClick={() => addOrderNote()} sx={actionButtonStyles}>{t('Save')}</Button>
                <Button variant="contained" onClick={() => setModalNote(false)} sx={buttonCloseStyles}>{t('close')}</Button>
            </DialogActions>
        </BootstrapDialog>
        </>
    );
};

export default NoteShipments;
