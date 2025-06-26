import { useEffect, useState } from 'react';
import { Chip, IconButton, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Skeleton, DialogContent, DialogActions, Button } from '@mui/material';
import Grid from '@mui/material/Grid2';
import { BootstrapDialogTitle, DarkTooltip, buttonCloseStyles } from '@utils/misc/styles';
import DeleteIcon from '@mui/icons-material/Delete';
import { useTranslation } from 'react-i18next';
import { enqueueSnackbar } from 'notistack';
import { deleteApiRequestQuoteNotesById, getApiRequestQuoteNotes } from '@features/request/api';

const RequestListNotes = (props: any) => {
    const [loadNotes, setLoadNotes] = useState<boolean>(true);
    const [notes, setNotes] = useState<any>(null);
    
    const { t } = useTranslation();
    
    useEffect(() => {
        // Here i initialize the sea ports
        getNotes(props.id);
    }, []);
    
    const getNotes = async (idRequest: string|undefined) => {
        try {
            setLoadNotes(true);
            const response: any = await getApiRequestQuoteNotes({query: {requestQuoteId: Number(idRequest)}});
            if (response !== null && response !== undefined) {
                setNotes(response.data);
                setLoadNotes(false);
            }
            else {
                setLoadNotes(false);
            }
        }
        catch (err: any) {
            console.log(err);
        }
    }
    
    const deleteNote = async (idNote: string) => {
        try {
            const response = await deleteApiRequestQuoteNotesById({path: {id: Number(idNote)}});
            if (response !== null && response !== undefined) {
                enqueueSnackbar("The note has been deleted with success.", { variant: "success", anchorOrigin: { horizontal: "right", vertical: "top"} });
                getNotes(props.id);
            }  
            else {
                enqueueSnackbar("An error happened during this operation.", { variant: "error", anchorOrigin: { horizontal: "right", vertical: "top"} });
            }
        }
        catch (err: any) {
            console.log(err);
        }
    }

    return (
        <>
            <BootstrapDialogTitle id="custom-dialog-title4" onClose={props.closeModal}>
                <b>{t('listNotesRequest')} {props.id}</b>
            </BootstrapDialogTitle>
            <DialogContent dividers>
            <Grid container spacing={2} mt={1} px={2}>
                <Grid size={{ xs: 12 }}>
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
                                        notes.reverse().map((row: any) => (
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
