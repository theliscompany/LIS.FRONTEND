import React, { useEffect } from 'react';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import { Alert, Button, Chip, Grid, IconButton, Skeleton } from '@mui/material';
import { sizingStyles, whiteButtonStyles } from '../utils/misc/styles';
import { protectedResources } from '../config/authConfig';
import { enqueueSnackbar, SnackbarProvider } from 'notistack';
import { useAuthorizedBackendApi } from '../api/api';
import { BackendService } from '../utils/services/fetch';
import { Link, NavLink } from 'react-router-dom';
import { RequestResponseDto } from '../utils/models/models';
import { useTranslation } from 'react-i18next';
import { useAccount, useMsal } from '@azure/msal-react';
import { DataGrid, GridColDef, GridRenderCellParams, GridValueFormatterParams } from '@mui/x-data-grid';
import { Edit, RestartAltOutlined } from '@mui/icons-material';
import { colorsTypes, getCityCountry } from '../utils/functions';
import { statusTypes } from '../utils/constants';

function ValidatedRequests() {
    const [requests, setRequests] = React.useState<any>(null);
    const [load, setLoad] = React.useState<boolean>(true);
    
    const context = useAuthorizedBackendApi();
    const { instance, accounts } = useMsal();
    const account = useAccount(accounts[0] || {});

    const { t } = useTranslation();
    
    const columnsRequests: GridColDef[] = [
        { field: 'id', headerName: t('id'), flex: 0.5 },
        { field: 'email', headerName: t('email'), renderCell: (params: GridRenderCellParams) => {
            return (
                <Box><Link to={"/admin/handle-request/"+params.row.id}>{params.row.email}</Link></Box>
            );
        }, minWidth: 200, flex: 1.5 },
        { field: 'createdAt', headerName: t('created'), valueFormatter: (params: GridValueFormatterParams) => `${(new Date(params.value)).toLocaleString().slice(0,10)}`, minWidth: 100, flex: 0.75 },
        { field: 'departure', headerName: t('from'), renderCell: (params: GridRenderCellParams) => {
            return (<Box>{getCityCountry(params.row.departure)}</Box>);
        }, minWidth: 100, flex: 1 },
        { field: 'arrival', headerName: t('to'), renderCell: (params: GridRenderCellParams) => {
            return (<Box>{getCityCountry(params.row.arrival)}</Box>);
        }, minWidth: 100, flex: 1 },
        { field: 'status', headerName: t('status'), renderCell: (params: GridRenderCellParams) => {
            // Find the status type by type
            const statusType = statusTypes.find((elm) => elm.type === params.row.status);
            // Translate the label
            const label = statusType ? t(statusType.label) : 'Unknown Status';

            return <Chip label={label} color={colorsTypes(params.row.status)} />;
        }, minWidth: 100, flex: 1 },
        { field: 'www', headerName: t('Actions'), renderCell: (params: GridRenderCellParams) => {
            return (
                <Box sx={{ my: 1, mr: 1 }}>
                    <IconButton component={NavLink} to={"/admin/handle-request/"+params.row.id} sx={{ mr: 1 }} title="Handle the request">
                        <Edit fontSize="small" />
                    </IconButton>
                    {/* <IconButton component={NavLink} to={"/admin/request/"+params.row.requestQuoteId} title="View the request" sx={{ mr: 1 }}>
                        <Edit fontSize="small" />
                    </IconButton> */}
                    {/* <IconButton onClick={() => { setCurrentId(params.row.id); setModal(true); }}>
                        <Delete fontSize="small" />
                    </IconButton> */}
                </Box>
            );
        }, minWidth: 100, flex: 0.25 }
    ];
    
    useEffect(() => {
        loadRequests();
    }, [account, instance, account]);

    const loadRequests = async () => {
        if (account && instance && account) {
            setLoad(true);
            
            const response: RequestResponseDto = await (context?.service as BackendService<any>).getWithToken(protectedResources.apiLisQuotes.endPoint+"/Request", context.tokenLogin);
            if (response !== null && response.code !== undefined && response.data !== undefined) {
                if (response.code === 200) {
                    setLoad(false);
                    setRequests(response.data.filter((elm: any) => elm.status !== "New").reverse());
                }
                else {
                    setLoad(false);
                    enqueueSnackbar(t('errorHappened'), { variant: "error", anchorOrigin: { horizontal: "right", vertical: "top"} });
                }
            }
        }
    }

    return (
        <div style={{ background: "#fff", borderTopLeftRadius: 20, borderTopRightRadius: 20 }}>
            <SnackbarProvider />
            <Box py={2.5} sx={{ minWidth: { xs: "100vw", md: "100%" }}}>
                <Typography variant="h5" sx={{mt: {xs: 4, md: 1.5, lg: 1.5 }}} px={5}><b>{t('pendingRequests')}</b></Typography>
                <Grid container spacing={2} mt={0} px={5}>
                    <Grid item xs={12}>
                        <Button color="inherit" variant="contained" sx={whiteButtonStyles} style={{ float: "right" }} onClick={() => { loadRequests(); }}>
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
                                    requests !== null && requests.length !== 0 ?
                                    <Box sx={{ overflow: "hidden" }}>
                                        <DataGrid
                                            rows={requests}
                                            columns={columnsRequests}
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
        </div>
    );
}

export default ValidatedRequests;