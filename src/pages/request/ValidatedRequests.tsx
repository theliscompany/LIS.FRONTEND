import React, { useEffect } from 'react';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import { Alert, Button, Chip, IconButton, Skeleton } from '@mui/material';
import Grid from '@mui/material/Grid2';
import { gridStyles, sizingStyles } from '../../utils/misc/styles';
import { enqueueSnackbar, SnackbarProvider } from 'notistack';
import { Link, NavLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAccount, useMsal } from '@azure/msal-react';
import { DataGrid, GridColDef, GridRenderCellParams } from '@mui/x-data-grid';
import { Edit } from '@mui/icons-material';
import { colorsTypes, getCityCountry } from '../../utils/functions';
import { statusTypes } from '../../utils/constants';
import { getApiRequest } from '../../api/client/quote';

const ValidatedRequests = () => {
    const [requests, setRequests] = React.useState<any>(null);
    const [load, setLoad] = React.useState<boolean>(true);
    
    const { instance, accounts } = useMsal();
    const account = useAccount(accounts[0] || {});

    const { t } = useTranslation();
    
    const columnsRequests: GridColDef[] = [
        { field: 'id', headerName: t('id'), flex: 0.5 },
        { field: 'email', headerName: t('email'), renderCell: (params: GridRenderCellParams) => {
            return (
                <Box><Link to={"/handle-request/"+params.row.id}>{params.row.email}</Link></Box>
            );
        }, minWidth: 200, flex: 1.5 },
        { field: 'createdAt', headerName: t('created'), valueFormatter: (value: any) => `${(new Date(value)).toLocaleString().slice(0,10)}`, minWidth: 100, flex: 0.75 },
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
                    <IconButton component={NavLink} to={"/handle-request/"+params.row.id} sx={{ mr: 1 }} title="Handle the request">
                        <Edit fontSize="small" />
                    </IconButton>
                    {/* <IconButton component={NavLink} to={"/request/"+params.row.requestQuoteId} title="View the request" sx={{ mr: 1 }}>
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
        try {
            setLoad(true);
            const response: any = await getApiRequest();
            if (response !== null && response !== undefined) {
                setLoad(false);
                setRequests(response.data.data.filter((elm: any) => elm.status === "EnCoursDeTraitement").reverse());
            }
            else {
                setLoad(false);
                enqueueSnackbar(t('errorHappened'), { variant: "error", anchorOrigin: { horizontal: "right", vertical: "top"} });
            }
        }
        catch (err: any) {
            console.log(err);
            setLoad(false);
        }
    }

    return (
        <div style={{ background: "#fff", borderTopLeftRadius: 20, borderTopRightRadius: 20 }}>
            <SnackbarProvider />
            <Box py={2.5}>
                <Grid container spacing={2} mt={0} px={5}>
                    <Grid size={{ xs: 12, md: 8 }}>
                        <Typography sx={{ fontSize: 18, mb: 1 }}><b>{t('pendingRequests')}</b></Typography>
                    </Grid>
                    <Grid size={{ xs: 12, md: 4 }}>
                        <Button 
                            variant="contained" color="inherit" 
                            sx={{ float: "right", backgroundColor: "#fff", textTransform: "none", ml: 2 }} 
                            onClick={() => { loadRequests(); }} 
                        >
                            {t('reload')}
                        </Button>
                    </Grid>
                    <Grid size={{ xs: 12 }}>
                        {
                            !load ?
                            requests !== null && requests.length !== 0 ?
                            <Box sx={{ overflow: "hidden" }}>
                                <DataGrid
                                    rows={requests}
                                    columns={columnsRequests}
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
        </div>
    );
}

export default ValidatedRequests;