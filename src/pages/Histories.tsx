import { useEffect, useState } from 'react';
import { Alert, Box, Button, Chip, Grid, InputLabel, Skeleton, Typography } from '@mui/material';
import { BootstrapInput, datetimeStyles, gridStyles, inputLabelStyles } from '../utils/misc/styles';
import { enqueueSnackbar, SnackbarProvider } from 'notistack';
import SearchIcon from '@mui/icons-material/Search';
import { protectedResources } from '../config/authConfig';
import { useAuthorizedBackendApi } from '../api/api';
import { BackendService } from '../utils/services/fetch';
import { Link } from 'react-router-dom';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DateTimePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { Dayjs } from 'dayjs';
import { RequestResponseDto } from '../utils/models/models';
import { useTranslation } from 'react-i18next';
import { GridColDef, GridValueFormatterParams, GridRenderCellParams, DataGrid } from '@mui/x-data-grid';
import { useAccount, useMsal } from '@azure/msal-react';

function createGetRequestUrl(variable1: Dayjs|null, variable2: Dayjs|null, variable3: string, variable4: string) {
    let url = protectedResources.apiLisQuotes.endPoint+'/RequestQuoteHistory?';
    if (variable1 && variable1 !== null) {
      url += 'startDate=' + encodeURIComponent(variable1.format('YYYY-MM-DDTHH:mm:ss')) + '&';
    }
    if (variable2&& variable2 !== null) {
      url += 'endDate=' + encodeURIComponent(variable2.format('YYYY-MM-DDTHH:mm:ss')) + '&';
    }
    if (variable3) {
      url += 'assigneeId=' + encodeURIComponent(variable3) + '&';
    }
    if (variable4) {
      url += 'requestQuoteId=' + encodeURIComponent(variable4) + '&';
    }
    
    if (url.slice(-1) === '&') {
      url = url.slice(0, -1);
    }
    return url;
}

function Histories(props: any) {
    const [load, setLoad] = useState<boolean>(false);
    const [histories, setHistories] = useState<any>(null);
    const [requestQuoteId, setRequestQuoteId] = useState<string>("");
    const [assigneeId, setAssigneeId] = useState<string>("");
    const [assignedDateStart, setAssignedDateStart] = useState<Dayjs | null>(null);
    const [assignedDateEnd, setAssignedDateEnd] = useState<Dayjs | null>(null);

    const context = useAuthorizedBackendApi();
    const { instance, accounts } = useMsal();
    const account = useAccount(accounts[0] || {});

    const { t } = useTranslation();
    
    useEffect(() => {
        getHistories();
    }, [account, instance, account]);
    
    const columnsEvents: GridColDef[] = [
        { field: 'id', headerName: t('id'), minWidth: 100, flex: 0.5 },
        { field: 'requestQuoteId', headerName: t('requestQuoteId'), renderCell: (params: GridRenderCellParams) => {
            return (
                <Box>
                    <Link to={"/admin/request/"+params.row.requestQuoteId}>{params.row.requestQuoteId}</Link>
                </Box>
            );
        }, minWidth: 100, flex: 0.5 },
        { field: 'assignee', headerName: t('assignee'), valueFormatter: (params: GridValueFormatterParams) => `${params.value !== null ? params.value.name+" (#"+params.value.id+")" : "Not defined"}`, minWidth: 100, flex: 1 },
        { field: 'assigneeId', headerName: t('assigneeId'), renderCell: (params: GridRenderCellParams) => {
            return (
                <Box>
                    {params.row.assignee !== null ? params.row.assignee.email : "Not defined"}
                </Box>
            );
        }, minWidth: 250, flex: 1 },
        { field: 'assignedAt', headerName: t('assignDate'), renderCell: (params: GridRenderCellParams) => {
            return (
                <Box sx={{ my: 1, mr: 1 }}>
                    {params.row.assignedAt !== null ? (new Date(params.row.assignedAt)).toLocaleString() : <Chip label={t('currentlyAssigned')} color="success" />}
                </Box>
            );
        }, minWidth: 100, flex: 1 },
        { field: 'unassignedAt', headerName: t('unassignDate'), renderCell: (params: GridRenderCellParams) => {
            return (
                <Box sx={{ my: 1, mr: 1 }}>
                    {params.row.unassignedAt !== null ? (new Date(params.row.unassignedAt)).toLocaleString() : <Chip label={t('currentlyAssigned')} color="success" />}
                </Box>
            );
        }, minWidth: 100, flex: 1 }
    ];
    
    const getHistories = async () => {
        if (account && instance && context) {
            setLoad(true);
            // const token: any = await getAccessToken(instance, loginRequest, account);
            
            const response = await (context?.service as BackendService<any>).getWithToken(protectedResources.apiLisQuotes.endPoint+"/RequestQuoteHistory", context.tokenLogin);
            if (response !== null && response.code !== undefined) {
                if (response.code === 200) {
                    console.log(response.data);
                    setHistories(response.data.reverse());
                    setLoad(false);
                }
                else {
                    setLoad(false);
                }
            }
        }
    }

    const searchHistories = async () => {
        if (account && instance && context) {
            setLoad(true);
            // const token: any = await getAccessToken(instance, loginRequest, account);

            var requestFormatted = createGetRequestUrl(assignedDateStart, assignedDateEnd, assigneeId, requestQuoteId);
            const response: RequestResponseDto = await (context?.service as BackendService<any>).getWithToken(requestFormatted, context.tokenLogin);
            if (response !== null && response.code !== undefined && response.data !== undefined) {
                if (response.code === 200) {
                    setLoad(false);
                    setHistories(response.data);
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
            <Box py={2.5}>
                <Typography variant="h5" sx={{mt: {xs: 4, md: 1.5, lg: 1.5 }}} px={5}><b>{t('overviewTitle')}</b></Typography>
                <Box>
                    <Grid container spacing={1} px={5} mt={2}>
                        <Grid item xs={12} md={2}>
                            <InputLabel htmlFor="assignee" sx={inputLabelStyles}>{t('assigneeId')}</InputLabel>
                            <BootstrapInput id="assignee" type="text" value={assigneeId} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setAssigneeId(e.target.value)} fullWidth />
                        </Grid>
                        <Grid item xs={12} md={2}>
                            <InputLabel htmlFor="request" sx={inputLabelStyles}>{t('requestQuoteId')}</InputLabel>
                            <BootstrapInput id="request" type="text" value={requestQuoteId} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setRequestQuoteId(e.target.value)} fullWidth />
                        </Grid>
                        
                        <Grid item xs={12} md={3}>
                            <InputLabel htmlFor="assigned-date-start" sx={inputLabelStyles}>{t('assignDate')}</InputLabel>
                            <LocalizationProvider dateAdapter={AdapterDayjs}>
                                <DateTimePicker 
                                    value={assignedDateStart} 
                                    onChange={(value: any) => { setAssignedDateStart(value) }}
                                    slotProps={{ textField: { id: "assigned-date-start", fullWidth: true, sx: datetimeStyles }, inputAdornment: { sx: { position: "relative", right: "11.5px" } } }}
                                />
                            </LocalizationProvider>
                        </Grid>
                        <Grid item xs={12} md={3}>
                            <InputLabel htmlFor="assigned-date-end" sx={inputLabelStyles}>{t('unassignDate')}</InputLabel>
                            <LocalizationProvider dateAdapter={AdapterDayjs}>
                                <DateTimePicker 
                                    value={assignedDateEnd} 
                                    onChange={(value: any) => { setAssignedDateEnd(value) }}
                                    slotProps={{ textField: { id: "assigned-date-end", fullWidth: true, sx: datetimeStyles }, inputAdornment: { sx: { position: "relative", right: "11.5px" } } }}
                                />
                            </LocalizationProvider>
                        </Grid>
                        <Grid item xs={12} md={2} mt={1} sx={{ display: "flex", alignItems: "end" }}>
                        <Button 
                            variant="contained" 
                            color="inherit"
                            startIcon={<SearchIcon />} 
                            size="large"
                            sx={{ backgroundColor: "#fff", color: "#333", textTransform: "none", mb: 0.15 }}
                            onClick={searchHistories}
                            fullWidth
                        >
                            {t('search')}
                        </Button>
                    </Grid>
                        <Grid item xs={12}>
                            {
                                !load ?
                                histories !== null && histories.length !== 0 ?
                                <Box sx={{ overflow: "auto" }}>
                                    <Box sx={{ width: "100%", display: "table", tableLayout: "fixed" }}>
                                        <DataGrid
                                            rows={histories}
                                            columns={columnsEvents}
                                            // hideFooter
                                            getRowId={(row: any) => row?.id}
                                            getRowHeight={() => "auto" }
                                            sx={gridStyles}
                                            disableRowSelectionOnClick
                                        />
                                    </Box>
                                </Box> : <Alert severity="warning">{t('noResults')}</Alert>
                                : <Skeleton sx={{ mt: 3 }} />
                            }
                        </Grid>
                    </Grid>
                 </Box>
            </Box>
        </div>
    );
}

export default Histories;
