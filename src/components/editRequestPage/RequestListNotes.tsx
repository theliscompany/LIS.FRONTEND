import { useEffect, useState } from 'react';
import { Chip, Grid, IconButton, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Skeleton, DialogContent, DialogActions, Button } from '@mui/material';
import { BootstrapDialogTitle, DarkTooltip, buttonCloseStyles } from '../../utils/misc/styles';
import DeleteIcon from '@mui/icons-material/Delete';
import { useTranslation } from 'react-i18next';
import { useAuthorizedBackendApi } from '../../api/api';
import { enqueueSnackbar } from 'notistack';
import { loginRequest, protectedResources } from '../../config/authConfig';
import { BackendService } from '../../utils/services/fetch';
import { useAccount, useMsal } from '@azure/msal-react';
import { getAccessToken } from '../../utils/functions';

function RequestListNotes(props: any) {
    const [loadNotes, setLoadNotes] = useState<boolean>(true);
    const [notes, setNotes] = useState<any>(null);
    const [tempToken, setTempToken] = useState<string>("");
    
    const context = useAuthorizedBackendApi();
    const { t } = useTranslation();
    const { instance, accounts } = useMsal();
    const account = useAccount(accounts[0] || {});

    useEffect(() => {
        // Here i initialize the sea ports
        getNotes(props.id);
    }, [account, instance, account]);
    
    const getNotes = async (idRequest: string|undefined) => {
        if (account && instance && context) {
            setLoadNotes(true);
            // const token = await getAccessToken(instance, loginRequest, account);
            // setTempToken(token);
            
            const response = await (context?.service as BackendService<any>).getWithToken(protectedResources.apiLisQuotes.endPoint+"/RequestQuoteNotes?requestQuoteId="+idRequest, context.tokenLogin);
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
        if (account && instance && context) {
            const response = await (context?.service as any).deleteWithToken(protectedResources.apiLisQuotes.endPoint+"/RequestQuoteNotes/"+idNote, context.tokenLogin);
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
