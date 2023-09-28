import { Box, Button, Chip, Grid, InputLabel, Skeleton, Table, TableBody, TableCell, TableHead, TableRow, Typography } from '@mui/material';
import { useEffect, useState } from 'react';
// import '../../App.css';
import { BootstrapInput, datetimeStyles, inputLabelStyles } from '../utils/misc/styles';
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
    
    const { t } = useTranslation();
    
    useEffect(() => {
        getHistories();
    }, [context]);
    
    const getHistories = async () => {
        if (context) {
            setLoad(true);
            const response = await (context as BackendService<any>).getSingle(protectedResources.apiLisQuotes.endPoint+"/RequestQuoteHistory");
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
        if (context) {
            setLoad(true);
            var requestFormatted = createGetRequestUrl(assignedDateStart, assignedDateEnd, assigneeId, requestQuoteId);
            const response: RequestResponseDto = await (context as BackendService<any>).getSingle(requestFormatted);
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
                                !load && histories !== null ?
                                <Box sx={{ overflow: "auto" }}>
                                    <Box sx={{ width: "100%", display: "table", tableLayout: "fixed" }}>
                                        <Table aria-label="simple table">
                                            <TableHead>
                                                <TableRow>
                                                    <TableCell align="left" sx={{ fontSize: 16, fontWeight: "bolder" }}>Id</TableCell>
                                                    <TableCell align="left" sx={{ fontSize: 16, fontWeight: "bolder" }}>{t('requestQuoteId')}</TableCell>
                                                    <TableCell align="left" sx={{ fontSize: 16, fontWeight: "bolder" }}>{t('assignee')}</TableCell>
                                                    <TableCell align="left" sx={{ fontSize: 16, fontWeight: "bolder" }}>{t('assigneeEmail')}</TableCell>
                                                    <TableCell align="left" sx={{ fontSize: 16, fontWeight: "bolder" }}>{t('assignDate')}</TableCell>
                                                    <TableCell align="left" sx={{ fontSize: 16, fontWeight: "bolder" }}>{t('unassignDate')}</TableCell>
                                                    <TableCell align="left"><b></b></TableCell>
                                                </TableRow>
                                            </TableHead>
                                            <TableBody>
                                                {
                                                    histories.map((row: any, i: number) => (
                                                        <TableRow key={"history-"+row.id} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                                                            <TableCell align="left">{row.id}</TableCell>
                                                            <TableCell align="left">
                                                                <Link to={"/admin/request/"+row.requestQuoteId}>{row.requestQuoteId}</Link>
                                                            </TableCell>
                                                            <TableCell align="left">{row.assignee !== null ? row.assignee.name+" (#"+row.assignee.id+")" : "Not defined"}</TableCell>
                                                            <TableCell align="left">{row.assignee !== null ? row.assignee.email : "Not defined"}</TableCell>
                                                            <TableCell align="left">{row.assignedAt !== null ? (new Date(row.assignedAt)).toLocaleString() : <Chip label={t('currentlyAssigned')} color="success" />}</TableCell>
                                                            <TableCell align="left">{row.unassignedAt !== null ? (new Date(row.unassignedAt)).toLocaleString() : <Chip label={t('currentlyAssigned')} color="success" />}</TableCell>
                                                        </TableRow>
                                                    ))
                                                }
                                            </TableBody>
                                        </Table>
                                    </Box>
                                </Box> : <Skeleton sx={{ mt: 3 }} />
                            }
                        </Grid>
                    </Grid>
                 </Box>
            </Box>
        </div>
    );
}

export default Histories;
