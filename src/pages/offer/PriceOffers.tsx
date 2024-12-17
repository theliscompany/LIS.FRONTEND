import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAccount, useMsal } from '@azure/msal-react';
import { Typography, Box, Grid, Chip, IconButton, Button, DialogContent, DialogActions, Alert } from '@mui/material';
import Skeleton from '@mui/material/Skeleton';
import { SnackbarProvider, enqueueSnackbar } from 'notistack';
import { useAuthorizedBackendApi } from '../../api/api';
import { protectedResources } from '../../config/authConfig';
import { BackendService } from '../../utils/services/fetch';
import DeleteIcon from '@mui/icons-material/Delete';
import { BootstrapDialog, BootstrapDialogTitle, buttonCloseStyles, sizingStyles, whiteButtonStyles } from '../../utils/misc/styles';
import { NavLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { DataGrid, GridColDef, GridRenderCellParams, GridValueFormatterParams } from '@mui/x-data-grid';
import { Edit, RestartAltOutlined, Visibility } from '@mui/icons-material';
import { statusLabel, colorsTypes } from '../../utils/functions';

function PriceOffers() {
    const [load, setLoad] = useState<boolean>(true);
    const [offers, setOffers] = useState<any>(null);
    const [modal, setModal] = useState<boolean>(false);
    const [currentId, setCurrentId] = useState<string>("");

    const { instance, accounts } = useMsal();
    const account = useAccount(accounts[0] || {});    
    const context = useAuthorizedBackendApi();
    
    const { t } = useTranslation();
    
    const columnsOffers: GridColDef[] = [
        { field: 'requestQuoteId', headerName: t('id'), flex: 0.5 },
        { field: 'emailUser', headerName: t('email'), renderCell: (params: GridRenderCellParams) => {
            return (
                <Box>
                    <Link to={"/admin/handle-request/"+params.row.requestQuoteId}>{params.row.emailUser}</Link>
                </Box>
            );
        }, minWidth: 200, flex: 1 },
        { field: 'created', headerName: t('created'), valueFormatter: (params: GridValueFormatterParams) => `${(new Date(params.value)).toLocaleString().slice(0,10)}`, minWidth: 100, flex: 0.5 },
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
                    <IconButton component={NavLink} to={"/admin/quote-offers/"+params.row.id} sx={{ mr: 1 }} title="Handle the offer">
                        <Visibility fontSize="small" />
                    </IconButton>
                    <IconButton component={NavLink} to={"/admin/handle-request/"+params.row.requestQuoteId} title="View the request" sx={{ mr: 1 }}>
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
        if (account && instance && context) {
            setLoad(true);
            const response = await (context?.service as BackendService<any>).getSingle(protectedResources.apiLisOffer.endPoint+"/QuoteOffer");
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
            else {
                setLoad(false);
            }
            // console.log(response);
        }
    }
    
    const deleteOffer = async (id: string) => {
        if (account && instance && context) {
            const response = await (context?.service as any).delete(protectedResources.apiLisOffer.endPoint+"/QuoteOffer/"+id);
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
            <Box py={2.5} sx={{ minWidth: { xs: "100vw", md: "100%" }}}>
                <Typography variant="h5" sx={{mt: {xs: 4, md: 1.5, lg: 1.5 }}} px={5}><b>{t('generatedPriceOffers')}</b></Typography>
                <Grid container spacing={2} mt={0} px={5}>
                    <Grid item xs={12}>
                        <Button color="inherit" variant="contained" sx={whiteButtonStyles} style={{ float: "right" }} onClick={() => { getPriceOffers(); }}>
                            {t('reload')} <RestartAltOutlined sx={{ ml: 0.5, pb: 0.45, justifyContent: "center", alignItems: "center" }} fontSize="small" />
                        </Button>
                    </Grid>
                </Grid>
                <Box>
                    {
                        !load ? 
                        <Grid container spacing={2} mt={0} px={5}>
                            <Grid item xs={12}>
                                {
                                    offers !== null && offers.length !== 0 ?
                                    <Box sx={{ overflow: "hidden" }}>
                                        <DataGrid
                                            rows={offers}
                                            columns={columnsOffers}
                                            getRowId={(row: any) => row?.id}
                                            getRowHeight={() => "auto" }
                                            sx={sizingStyles}
                                            disableRowSelectionOnClick
                                        />
                                    </Box> : <Alert severity="warning">{t('noResults')}</Alert>
                                }
                            </Grid>
                        </Grid> : <Skeleton sx={{ mx: 5, mt: 3 }} />
                    }
                </Box>
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
