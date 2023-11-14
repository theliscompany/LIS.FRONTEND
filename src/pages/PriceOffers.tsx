import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAccount, useMsal } from '@azure/msal-react';
import { Typography, Box, Grid, Chip, IconButton, Button, DialogContent, DialogActions, Alert } from '@mui/material';
import Skeleton from '@mui/material/Skeleton';
import { SnackbarProvider, enqueueSnackbar } from 'notistack';
import { useAuthorizedBackendApi } from '../api/api';
import { protectedResources } from '../config/authConfig';
import { BackendService } from '../utils/services/fetch';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { BootstrapDialog, BootstrapDialogTitle, actionButtonStyles, buttonCloseStyles, gridStyles } from '../utils/misc/styles';
import { NavLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { DataGrid, GridColDef, GridRenderCellParams, GridValueFormatterParams } from '@mui/x-data-grid';
import { RestartAltOutlined } from '@mui/icons-material';

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
    
    const { t } = useTranslation();
    
    const columnsOffers: GridColDef[] = [
        { field: 'requestQuoteId', headerName: t('email'), renderCell: (params: GridRenderCellParams) => {
            return (
                <Box>
                    <Link to={"/admin/request/"+params.row.requestQuoteId}>{params.row.emailUser}</Link>
                </Box>
            );
        }, minWidth: 200, flex: 1.2 },
        { field: 'created', headerName: t('created'), valueFormatter: (params: GridValueFormatterParams) => `${(new Date(params.value)).toLocaleString().slice(0,10)}`, minWidth: 100, flex: 0.6 },
        { field: 'xxx', headerName: t('departure'), renderCell: (params: GridRenderCellParams) => {
            return (<Box>{params.row.seaFreight.departurePortName}</Box>);
        }, minWidth: 100, flex: 1 },
        { field: 'yyy', headerName: t('arrival'), renderCell: (params: GridRenderCellParams) => {
            return (<Box>{params.row.seaFreight.destinationPortName}</Box>);
        }, minWidth: 100, flex: 1 },
        { field: 'zzz', headerName: t('status'), renderCell: (params: GridRenderCellParams) => {
            return (<Box><Chip label={statusLabel(params.row.status)} color={colors(params.row.status)} /></Box>);
        }, minWidth: 100, flex: 0.6 },
        { field: 'qqq', headerName: t('clientApproval'), renderCell: (params: GridRenderCellParams) => {
            return (<Box>{params.row.status !== "Accepted" && params.row.clientApproval === "Pending" ? <Chip label={t('noEmail')} /> : <Chip label={params.row.clientApproval} color={colors(params.row.clientApproval)} />}</Box>);
        }, minWidth: 100, flex: 0.6 },
        { field: 'www', headerName: t('Actions'), renderCell: (params: GridRenderCellParams) => {
            return (
                <Box sx={{ my: 1, mr: 1 }}>
                    <IconButton component={NavLink} to={"/admin/quote-offers/"+params.row.id} sx={{ mr: 1 }}>
                        <EditIcon fontSize="small" />
                    </IconButton>
                    <IconButton onClick={() => { setCurrentId(params.row.id); setModal(true); }}>
                        <DeleteIcon fontSize="small" />
                    </IconButton>
                </Box>
            );
        }, minWidth: 150, flex: 0.7 }
    ];
    
    useEffect(() => {
        getPriceOffers();
    }, []);
    
    const getPriceOffers = async () => {
        if (context) {
            setLoad(true);
            const response = await (context as BackendService<any>).getSingle(protectedResources.apiLisOffer.endPoint+"/QuoteOffer");
            if (response !== null && response.code !== undefined) {
                if (response.code === 200) {
                    console.log(response.data);
                    setOffers(response.data.reverse());
                    // setOffers([]);
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
        <div style={{ background: "#fff", borderTopLeftRadius: 20, borderTopRightRadius: 20, width: "100%" }}>
            <SnackbarProvider />
            <Box py={2.5}>
                <Typography variant="h5" sx={{mt: {xs: 4, md: 1.5, lg: 1.5 }}} px={5}><b>{t('generatedPriceOffers')}</b></Typography>
                <Grid container spacing={2} mt={0} px={5}>
                    <Grid item xs={12}>
                        <Button variant="contained" sx={actionButtonStyles} onClick={() => { getPriceOffers(); }}>
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
                                    <Box sx={{ overflow: "auto" }}>
                                        <Box sx={{ width: "100%", display: "table", tableLayout: "fixed" }}>
                                            <DataGrid
                                                rows={offers}
                                                columns={columnsOffers}
                                                // hideFooter
                                                getRowId={(row: any) => row?.id}
                                                getRowHeight={() => "auto" }
                                                sx={gridStyles}
                                                disableRowSelectionOnClick
                                            />
                                        </Box>
                                    </Box> : <Alert severity="warning">{t('noResults')}</Alert>
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
