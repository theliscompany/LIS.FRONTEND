import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAccount, useMsal } from '@azure/msal-react';
import { Typography, Box, Grid, TableCell, TableHead, Table, TableBody, TableRow, Chip, IconButton, Button, DialogContent, DialogActions } from '@mui/material';
import Skeleton from '@mui/material/Skeleton';
import { SnackbarProvider, enqueueSnackbar } from 'notistack';
import { useAuthorizedBackendApi } from '../api/api';
import { protectedResources } from '../config/authConfig';
import { BackendService } from '../services/fetch';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { BootstrapDialog, BootstrapDialogTitle, buttonCloseStyles } from '../misc/styles';
import { NavLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

function colors(value: string) {
    switch (value) {
        case "Pending": 
            return "warning";
            break;
        case "Accepted":
            return "success";
            break;
        case "Rejected": 
            return "secondary";
            break;
        case "No response": 
            return "default";
            break;
    }
}

function statusLabel(value: string) {
    if (value === "Accepted")
        return "Approved";
    else
        return value;
}

function PriceOffers() {
    const [load, setLoad] = useState<boolean>(true);
    const [offers, setOffers] = useState<any>(null);
    const [modal, setModal] = useState<boolean>(false);
    const [currentId, setCurrentId] = useState<string>("");

    const { accounts } = useMsal();
    const account = useAccount(accounts[0] || {});
        
    const context = useAuthorizedBackendApi();
    
    useEffect(() => {
        getPriceOffers();
    }, []);
    
    const { t } = useTranslation();
    
    const getPriceOffers = async () => {
        if (context) {
            const response = await (context as BackendService<any>).getSingle(protectedResources.apiLisOffer.endPoint+"/QuoteOffer");
            if (response !== null && response.code !== undefined) {
                if (response.code === 200) {
                    console.log(response.data);
                    setOffers(response.data.reverse());
                    setLoad(false);
                }
                else {
                    setLoad(false);
                }
            }
            console.log(response);
        }
    }
    
    const deleteOffer = async (id: string) => {
        if (context) {
            const response = await (context as any).delete(protectedResources.apiLisOffer.endPoint+"/QuoteOffer/"+id);
            if (response !== null && response.code !== undefined) {
                if (response.code === 200) {
                    enqueueSnackbar(t('offerDeleted'), { variant: "success", anchorOrigin: { horizontal: "right", vertical: "top"} });
                    setModal(false);
                    getPriceOffers();
                }
                else {
                    enqueueSnackbar(t('errorHappened'), { variant: "error", anchorOrigin: { horizontal: "right", vertical: "top"} });
                }
            }  
        }
    }

    return (
        <div style={{ background: "#fff", borderTopLeftRadius: 20, borderTopRightRadius: 20 }}>
            <SnackbarProvider />
                <Box py={2.5}>
                    <Typography variant="h5" sx={{mt: {xs: 4, md: 1.5, lg: 1.5 }}} mx={5}><b>{t('generatedPriceOffers')}</b></Typography>
                    <Box>
                        {
                            !load ? 
                            <Grid container spacing={2} mt={1} px={5}>
                                <Grid item xs={12}>
                                    {
                                        offers !== null ?
                                        <Box sx={{ overflow: "auto" }}>
                                            <Box sx={{ width: "100%", display: "table", tableLayout: "fixed" }}>
                                                <Table sx={{ minWidth: 650 }} aria-label="simple table">
                                                    <TableHead>
                                                        <TableRow>
                                                            <TableCell align="left" sx={{ fontSize: 16, fontWeight: "bolder" }}>{t('offerId')}</TableCell>
                                                            <TableCell align="left" sx={{ fontSize: 16, fontWeight: "bolder" }}>{t('requestQuoteId')}</TableCell>
                                                            <TableCell align="left" sx={{ fontSize: 16, fontWeight: "bolder" }}>{t('createdDate')}</TableCell>
                                                            <TableCell align="left" sx={{ fontSize: 16, fontWeight: "bolder" }}>{t('departure')}</TableCell>
                                                            <TableCell align="left" sx={{ fontSize: 16, fontWeight: "bolder" }}>{t('arrival')}</TableCell>
                                                            <TableCell align="left" sx={{ fontSize: 16, fontWeight: "bolder" }}>{t('status')}</TableCell>
                                                            <TableCell align="left" sx={{ fontSize: 16, fontWeight: "bolder" }}>{t('clientApproval')}</TableCell>
                                                            <TableCell align="left" sx={{ fontSize: 16, fontWeight: "bolder" }}>{t('totalPrice')}</TableCell>
                                                            <TableCell align="left"><b></b></TableCell>
                                                        </TableRow>
                                                    </TableHead>
                                                    <TableBody>
                                                        {
                                                            offers.map((row: any, i: number) => (
                                                                <React.Fragment key={"offer-"+row.id}>
                                                                    <TableRow sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                                                                        <TableCell align="left">{row.quoteOfferNumber}</TableCell>
                                                                        <TableCell align="left">
                                                                            <Link to={"/admin/request/"+row.requestQuoteId}>{row.requestQuoteId}</Link>
                                                                        </TableCell>
                                                                        <TableCell align="left">{(new Date(row.created)).toLocaleString()}</TableCell>
                                                                        <TableCell align="left">{row.seaFreight.departurePortName}</TableCell>
                                                                        <TableCell align="left">{row.seaFreight.destinationPortName}</TableCell>
                                                                        <TableCell align="left"><Chip label={statusLabel(row.status)} color={colors(row.status)} /></TableCell>
                                                                        <TableCell align="left">{row.status !== "Accepted" && row.clientApproval === "Pending" ? <Chip label={t('noEmail')} /> : <Chip label={row.clientApproval} color={colors(row.clientApproval)} />}</TableCell>
                                                                        <TableCell align="left">{Number(row.totalPrice+row.totalPrice*row.margin/100-row.totalPrice*row.reduction/100+row.extraFee*1).toFixed(2)} {row.seaFreight.currency}</TableCell>
                                                                        <TableCell align="left">
                                                                            <IconButton component={NavLink} to={"/admin/quote-offers/"+row.id} sx={{ mr: 1 }}>
                                                                                <EditIcon fontSize="small" />
                                                                            </IconButton>
                                                                            <IconButton onClick={() => { setCurrentId(row.id); setModal(true); }}>
                                                                                <DeleteIcon fontSize="small" />
                                                                            </IconButton>
                                                                        </TableCell>
                                                                    </TableRow>
                                                                </React.Fragment>
                                                            ))
                                                        }
                                                    </TableBody>
                                                </Table>
                                            </Box>
                                        </Box> : <Skeleton sx={{ mt: 3 }} />
                                    }
                                </Grid>
                            </Grid> : <Skeleton sx={{ mx: 5, mt: 3 }} />
                        }
                    </Box>
                </Box>
                <BootstrapDialog
                    onClose={() => setModal(false)}
                    aria-labelledby="custom-dialog-title"
                    open={modal}
                    maxWidth="sm"
                    fullWidth
                >
                    <BootstrapDialogTitle id="custom-dialog-title" onClose={() => setModal(false)}>
                        <b>{t('confirmDeletion')}</b>
                    </BootstrapDialogTitle>
                    <DialogContent dividers>
                        <Typography variant="subtitle1" gutterBottom px={2}>
                            {t('areYouSureDelete')}
                        </Typography>
                    </DialogContent>
                    <DialogActions>
                        <Button variant="contained" color="secondary" className="mr-3" onClick={() => { deleteOffer(currentId); }} sx={{ textTransform: "none" }}>{t('delete')}</Button>
                        <Button variant="contained" onClick={() => setModal(false)} sx={buttonCloseStyles}>{t('close')}</Button>
                    </DialogActions>
                </BootstrapDialog>
        </div>
    );
}

export default PriceOffers;
