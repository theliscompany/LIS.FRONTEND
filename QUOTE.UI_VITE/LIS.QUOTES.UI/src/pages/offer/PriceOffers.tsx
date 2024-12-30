import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Typography, Box, Chip, IconButton, Button, DialogContent, DialogActions, Alert } from '@mui/material';
import Grid from '@mui/material/Grid2';
import Skeleton from '@mui/material/Skeleton';
import { SnackbarProvider, enqueueSnackbar } from 'notistack';
import DeleteIcon from '@mui/icons-material/Delete';
import { BootstrapDialog, BootstrapDialogTitle, buttonCloseStyles, gridStyles, sizingStyles } from '../../utils/misc/styles';
import { NavLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { DataGrid, GridColDef, GridRenderCellParams } from '@mui/x-data-grid';
import { Edit, Visibility } from '@mui/icons-material';
import { statusLabel, colorsTypes } from '../../utils/functions';
import { deleteApiQuoteOfferById, getApiQuoteOffer } from '../../api/client/offer';

const PriceOffers = () => {
    const [load, setLoad] = useState<boolean>(true);
    const [offers, setOffers] = useState<any>(null);
    const [modal, setModal] = useState<boolean>(false);
    const [currentId, setCurrentId] = useState<string>("");

    const { t } = useTranslation();
    
    const columnsOffers: GridColDef[] = [
        { field: 'requestQuoteId', headerName: t('id'), flex: 0.5 },
        { field: 'emailUser', headerName: t('email'), renderCell: (params: GridRenderCellParams) => {
            return (
                <Box>
                    <Link to={"/handle-request/"+params.row.requestQuoteId}>{params.row.emailUser}</Link>
                </Box>
            );
        }, minWidth: 200, flex: 1 },
        { field: 'created', headerName: t('created'), valueFormatter: (value: any) => `${(new Date(value)).toLocaleString().slice(0,10)}`, minWidth: 100, flex: 0.5 },
        // { field: 'haulageType', headerName: t('trip'), minWidth: 125, flex: 1.5 },
        { field: 'route', headerName: t('trip'), renderCell: (params: GridRenderCellParams) => {
            return (
                <Box>
                    {params.row.options[0].selectedHaulage.loadingCityName} - {params.row.options[0].selectedSeafreights[0].destinationPortName}
                </Box>
            );
        }, minWidth: 200, flex: 1 },
        { field: 'status', headerName: t('status'), renderCell: (params: GridRenderCellParams) => {
            return (<Box><Chip label={statusLabel(params.row.status)} color={colorsTypes(params.row.status)} /></Box>);
        }, minWidth: 100, flex: 0.5 },
        { field: 'clientApproval', headerName: t('clientApproval'), renderCell: (params: GridRenderCellParams) => {
            return (<Box>{params.row.status !== "Accepted" && params.row.clientApproval === "Pending" ? <Chip label={t('noEmail')} /> : <Chip label={params.row.clientApproval} color={colorsTypes(params.row.clientApproval)} />}</Box>);
        }, minWidth: 100, flex: 0.5 },
        { field: 'www', headerName: t('Actions'), renderCell: (params: GridRenderCellParams) => {
            return (
                <Box sx={{ my: 1, mr: 1 }}>
                    <IconButton component={NavLink} to={"/quote-offers/"+params.row.id} sx={{ mr: 1 }} title="Handle the offer">
                        <Visibility fontSize="small" />
                    </IconButton>
                    <IconButton component={NavLink} to={"/handle-request/"+params.row.requestQuoteId} title="View the request" sx={{ mr: 1 }}>
                        <Edit fontSize="small" />
                    </IconButton>
                    <IconButton onClick={() => { setCurrentId(params.row.id); setModal(true); }}>
                        <DeleteIcon fontSize="small" />
                    </IconButton>
                </Box>
            );
        }, minWidth: 150, flex: 0.75 }
    ];
    
    useEffect(() => {
        getPriceOffers();
    }, []);
    
    const getPriceOffers = async () => {
        try {
            setLoad(true);
            const response: any = await getApiQuoteOffer();
            if (response !== null && response !== undefined) {
                console.log("Offers : "+response.data.data);
                setOffers(response.data.data?.reverse());
                setLoad(false);
            }
            else {
                setLoad(false);
            }
        }
        catch (err: any) {
            console.log(err);
            setLoad(false);
        }
    }
    
    const deleteOffer = async (id: string) => {
        try {
            const response = await deleteApiQuoteOfferById({path: {id: id}});
            if (response !== null && response !== undefined) {
                enqueueSnackbar(t('offerDeleted'), { variant: "success", anchorOrigin: { horizontal: "right", vertical: "top"} });
                setModal(false);
                getPriceOffers();
            }  
            else {
                enqueueSnackbar(t('errorHappened'), { variant: "error", anchorOrigin: { horizontal: "right", vertical: "top"} });
            }
        }
        catch (err: any) {
            console.log(err);
        }
    }

    return (
        <div style={{ background: "#fff", borderTopLeftRadius: 20, borderTopRightRadius: 20 }}>
            <SnackbarProvider />
            <Box py={2.5}>
                <Grid container spacing={2} mt={0} px={5}>
                    <Grid size={{ xs: 12, md: 8 }}>
                        <Typography sx={{ fontSize: 18, mb: 1 }}><b>{t('generatedPriceOffers')}</b></Typography>
                    </Grid>
                    <Grid size={{ xs: 12, md: 4 }}>
                        <Button 
                            variant="contained" color="inherit" 
                            sx={{ float: "right", backgroundColor: "#fff", textTransform: "none", ml: 2 }} 
                            onClick={() => { getPriceOffers(); }} 
                        >
                            {t('reload')}
                        </Button>
                    </Grid>
                    <Grid size={{ xs: 12 }}>
                        {
                            !load ?
                            offers !== null && offers.length !== 0 ?
                            <Box sx={{ overflow: "hidden" }}>
                                <DataGrid
                                    rows={offers}
                                    columns={columnsOffers}
                                    getRowId={(row: any) => row?.id}
                                    getRowHeight={() => "auto" }
                                    style={sizingStyles}
                                    sx={gridStyles}
                                    disableRowSelectionOnClick
                                />
                            </Box> : 
                            <Box>
                                <Alert severity="warning">{t('noResults')}</Alert>
                            </Box> : <Skeleton />
                        }
                    </Grid>
                </Grid>
            </Box>
            <BootstrapDialog open={modal} onClose={() => setModal(false)} maxWidth="sm" fullWidth>
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
