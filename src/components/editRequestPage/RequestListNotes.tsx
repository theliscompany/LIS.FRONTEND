import { useEffect, useState } from 'react';
import { Chip, Grid, IconButton, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Skeleton, DialogContent, DialogActions, Button } from '@mui/material';
import { BootstrapDialogTitle, DarkTooltip, buttonCloseStyles } from '../../utils/misc/styles';
import DeleteIcon from '@mui/icons-material/Delete';
import { useTranslation } from 'react-i18next';
import { useAuthorizedBackendApi } from '../../api/api';
import { enqueueSnackbar } from 'notistack';
import { protectedResources } from '../../config/authConfig';
import { BackendService } from '../../utils/services/fetch';

function RequestListNotes(props: any) {
    const [loadNotes, setLoadNotes] = useState<boolean>(true);
    const [notes, setNotes] = useState<any>(null);
    
    const context = useAuthorizedBackendApi();
    const { t } = useTranslation();
    
    useEffect(() => {
        // Here i initialize the sea ports
        getNotes(props.id);
    }, [context]);
    
    const getNotes = async (idRequest: string|undefined) => {
        if (context) {
            setLoadNotes(true);
            const response = await (context as BackendService<any>).getSingle(protectedResources.apiLisQuotes.endPoint+"/RequestQuoteNotes?requestQuoteId="+idRequest);
            if (response !== null && response.code !== undefined) {
                if (response.code === 200) {
                    // console.log(response.data);
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
                    getNotes(props.id);
                }
                else {
                    enqueueSnackbar("An error happened during this operation.", { variant: "error", anchorOrigin: { horizontal: "right", vertical: "top"} });
                }
            }  
        }
    }

    return (
        <>
            <BootstrapDialogTitle id="custom-dialog-title4" onClose={props.closeModal}>
                <b>{t('listNotesRequest')} {props.id}</b>
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
                                        <TableCell align="left" sx={{ fontSize: 16, fontWeight: "bolder" }}>{t('id')}</TableCell>
                                        <TableCell align="left" sx={{ fontSize: 16, fontWeight: "bolder" }}>{t('content')}</TableCell>
                                        <TableCell align="left" sx={{ fontSize: 16, fontWeight: "bolder" }}>{t('date')}</TableCell>
                                        {/* <TableCell align="left" sx={{ fontSize: 16, fontWeight: "bolder" }}>Request id</TableCell> */}
                                        <TableCell align="left" sx={{ fontSize: 16, fontWeight: "bolder" }}>{t('noteType')}</TableCell>
                                        <TableCell align="left"><b></b></TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {
                                        notes.reverse().map((row: any, i: number) => (
                                            <TableRow key={"requestNote-"+row.id} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                                                <TableCell align="left">{row.id}</TableCell>
                                                <TableCell align="left">{row.content}</TableCell>
                                                <TableCell align="left">{(new Date(row.createdAt)).toLocaleString().slice(0,16)}</TableCell>
                                                {/* <TableCell align="left">{row.requestQuoteId}</TableCell> */}
                                                <TableCell align="left">
                                                    <Chip label={row.noteType} color={row.noteType === "General" ? "primary" : "warning" } />
                                                </TableCell>
                                                <TableCell align="left">
                                                    <DarkTooltip title={t('deleteNote')} placement="right" arrow>
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
                <Button variant="contained" onClick={props.closeModal} sx={buttonCloseStyles}>{t('close')}</Button>
            </DialogActions>
        </>
    );
}

export default RequestListNotes;
