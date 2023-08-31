import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import { Dayjs } from 'dayjs';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import React, { useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import '../../App.css';
import { Button, Chip, Grid, InputLabel, NativeSelect, Skeleton } from '@mui/material';
import PlaceIcon from '@mui/icons-material/Place';
import SearchIcon from '@mui/icons-material/Search';
import { BootstrapInput, datetimeStyles, inputLabelStyles } from '../../misc/styles';
import { protectedResources } from '../../authConfig';
import { enqueueSnackbar, SnackbarProvider } from 'notistack';
import { useAuthorizedBackendApi } from '../../api/api';
import { BackendService } from '../../services/fetch';
import { useParams } from 'react-router-dom';
import { RequestResponseDto } from '../../models/models';
import { useTranslation } from 'react-i18next';

function createGetRequestUrl(variable1: string, variable2: string, variable3: string, variable4: string, variable5: Dayjs|null, variable6: Dayjs|null, variable7: Dayjs|null, variable8: Dayjs|null) {
    let url = protectedResources.apiLisQuotes.endPoint+'/Request?';
    if (variable1) {
      url += 'departure=' + encodeURIComponent(variable1) + '&';
    }
    if (variable2) {
      url += 'arrival=' + encodeURIComponent(variable2) + '&';
    }
    if (variable3) {
      url += 'packingType=' + encodeURIComponent(variable3) + '&';
    }
    if (variable4) {
      url += 'status=' + encodeURIComponent(variable4) + '&';
    }
    if (variable5) {
        url += 'createdAtStart=' + encodeURIComponent(variable5.format('YYYY-MM-DDTHH:mm:ss')) + '&';
    }
    if (variable6) {
        url += 'createdAtEnd=' + encodeURIComponent(variable6.format('YYYY-MM-DDTHH:mm:ss')) + '&';
    }
    if (variable7) {
        url += 'updatedAtStart=' + encodeURIComponent(variable7.format('YYYY-MM-DDTHH:mm:ss')) + '&';
    }
    if (variable8) {
        url += 'updatedAtEnd=' + encodeURIComponent(variable8.format('YYYY-MM-DDTHH:mm:ss')) + '&';
    }  
    
    if (url.slice(-1) === '&') {
      url = url.slice(0, -1);
    }
    return url;
}

function Requests() {
    const [requests, setRequests] = React.useState<any>(null);
    const [load, setLoad] = React.useState<boolean>(true);
    const [status, setStatus] = React.useState<string>("");
    const [packingType, setPackingType] = React.useState<string>("");
    // const [departureTown, setDepartureTown] = React.useState<any>(null);
    // const [arrivalTown, setArrivalTown] = React.useState<any>(null);
    const [departure, setDeparture] = React.useState<string>("");
    const [arrival, setArrival] = React.useState<string>("");
    const [createdDateStart, setCreatedDateStart] = React.useState<Dayjs | null>(null);
    const [createdDateEnd, setCreatedDateEnd] = React.useState<Dayjs | null>(null);
    const [updatedDateStart, setUpdatedDateStart] = React.useState<Dayjs | null>(null);
    const [updatedDateEnd, setUpdatedDateEnd] = React.useState<Dayjs | null>(null);
    let { search } = useParams();

    const context = useAuthorizedBackendApi();

    const { t } = useTranslation();
    
    const handleChangePackingType = (event: { target: { value: string } }) => {
        setPackingType(event.target.value);
    };

    const handleChangeStatus = (event: { target: { value: string } }) => {
        setStatus(event.target.value);
    };

    useEffect(() => {
        loadRequests();
    }, [context]);

    function dateTimeDiff(date_time: string) {
        const now = new Date();
        const datetime = new Date(date_time);
        const diff = now.getTime() - datetime.getTime();
        const diffInDays = Math.floor(diff / (1000 * 60 * 60 * 24));
        const diffInHours = Math.floor(diff / (1000 * 60 * 60));
        const diffInMinutes = Math.floor(diff / (1000 * 60));
    
        if (diffInDays === 0) {
            if (diffInHours === 0) {
                return diffInMinutes === 0 ? t('justNow') : diffInMinutes + " " + t('minutesAgo');
            } else {
                return diffInHours + " " + t('hoursAgo');
            }
        } else if (diffInDays === 1) {
            return t('yesterday');
        } else {
            return diffInDays + " " + t('daysAgo');
        }
    }
    
    const loadRequests = async () => {
        if (context) {
            setLoad(true);
            const response: RequestResponseDto = await (context as BackendService<any>).getSingle(search !== undefined ? protectedResources.apiLisQuotes.endPoint+"/Request?Search="+search : protectedResources.apiLisQuotes.endPoint+"/Request");
            if (response !== null && response.code !== undefined && response.data !== undefined) {
                if (response.code === 200) {
                    setLoad(false);
                    setRequests(response.data.reverse());
                }
                else {
                    setLoad(false);
                    enqueueSnackbar(t('errorHappened'), { variant: "error", anchorOrigin: { horizontal: "right", vertical: "top"} });
                }
            }  
        }
    }

    const searchRequests = async () => {
        if (context) {
            setLoad(true);
            var requestFormatted = createGetRequestUrl(departure, arrival, packingType, status, createdDateStart, createdDateEnd, updatedDateStart, updatedDateEnd);
            const response: RequestResponseDto = await (context as BackendService<any>).getSingle(requestFormatted);
            if (response !== null && response.code !== undefined && response.data !== undefined) {
                if (response.code === 200) {
                    setLoad(false);
                    setRequests(response.data.reverse());
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
                <Typography variant="h5" sx={{mt: {xs: 4, md: 1.5, lg: 1.5 }}} px={5}><b>{t('requestsTitle')}</b></Typography>
                <Grid container spacing={1} px={5} mt={2}>
                <Grid item xs={12} md={3}>
                        <InputLabel htmlFor="departure" sx={inputLabelStyles}>{t('departure')}</InputLabel>
                        <BootstrapInput id="departure" type="text" value={departure} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setDeparture(e.target.value)} fullWidth />
                    </Grid>
                    <Grid item xs={12} md={3}>
                        <InputLabel htmlFor="arrival" sx={inputLabelStyles}>{t('arrival')}</InputLabel>
                        <BootstrapInput id="arrival" type="text" value={arrival} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setArrival(e.target.value)} fullWidth />
                    </Grid>
                    <Grid item xs={12} md={3}>
                        <InputLabel htmlFor="packing-type" sx={inputLabelStyles}>{t('packingType')}</InputLabel>
                        <NativeSelect
                            id="packing-type"
                            value={packingType}
                            onChange={handleChangePackingType}
                            input={<BootstrapInput />}
                            fullWidth
                        >
                            <option value="">{t('allTypes')}</option>
                            <option value="FCL">FCL</option>
                            <option value="Breakbulk/LCL">Breakbulk/LCL</option>
                            <option value="Unit RoRo">Unit RoRo</option>
                        </NativeSelect>
                    </Grid>
                    <Grid item xs={12} md={3}>
                        <InputLabel htmlFor="status-id" sx={inputLabelStyles}>{t('status')}</InputLabel>
                        <NativeSelect
                            id="status-id"
                            value={status}
                            onChange={handleChangeStatus}
                            input={<BootstrapInput />}
                            fullWidth
                        >
                            <option value="">{t('allStatus')}</option>
                            <option value="0">En Attente</option>
                            <option value="1">Validé</option>
                            <option value="2">Rejeté</option>
                        </NativeSelect>
                    </Grid>
                    <Grid item xs={12} md={3} mt={1}>
                        <InputLabel htmlFor="created-date-start" sx={inputLabelStyles}>{t('createdDateStart')}</InputLabel>
                        <LocalizationProvider dateAdapter={AdapterDayjs}>
                            <DateTimePicker 
                                value={createdDateStart} 
                                onChange={(value: any) => { setCreatedDateStart(value) }}
                                slotProps={{ textField: { id: "created-date-start", fullWidth: true, sx: datetimeStyles }, inputAdornment: { sx: { position: "relative", right: "11.5px" } } }}
                            />
                        </LocalizationProvider>
                    </Grid>
                    <Grid item xs={12} md={3} mt={1}>
                        <InputLabel htmlFor="created-date-end" sx={inputLabelStyles}>{t('createdDateEnd')}</InputLabel>
                        <LocalizationProvider dateAdapter={AdapterDayjs}>
                            <DateTimePicker 
                                value={createdDateEnd} 
                                onChange={(value: any) => { setCreatedDateEnd(value) }}
                                slotProps={{ textField: { id: "created-date-end", fullWidth: true, sx: datetimeStyles }, inputAdornment: { sx: { position: "relative", right: "11.5px" } } }}
                            />
                        </LocalizationProvider>
                    </Grid>
                    <Grid item xs={12} md={3} mt={1}>
                        <InputLabel htmlFor="updated-date-start" sx={inputLabelStyles}>{t('updatedDateStart')}</InputLabel>
                        <LocalizationProvider dateAdapter={AdapterDayjs}>
                            <DateTimePicker 
                                value={updatedDateStart} 
                                onChange={(value: any) => { setUpdatedDateStart(value) }} 
                                slotProps={{ textField: { id: "updated-date-start", fullWidth: true, sx: datetimeStyles }, inputAdornment: { sx: { position: "relative", right: "11.5px" } } }}
                            />
                        </LocalizationProvider>
                    </Grid>
                    <Grid item xs={12} md={3} mt={1}>
                        <InputLabel htmlFor="updated-date-end" sx={inputLabelStyles}>{t('updatedDateEnd')}</InputLabel>
                        <LocalizationProvider dateAdapter={AdapterDayjs}>
                            <DateTimePicker 
                                value={updatedDateEnd} 
                                onChange={(value: any) => { setUpdatedDateEnd(value) }} 
                                slotProps={{ textField: { id: "updated-date-end", fullWidth: true, sx: datetimeStyles }, inputAdornment: { sx: { position: "relative", right: "11.5px" } } }}
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
                            onClick={searchRequests}
                            fullWidth
                        >
                            {t('search')}
                        </Button>
                    </Grid>
                </Grid>

                <Grid container>
                    <Grid item xs={12}>
                    {
                        !load ? 
                            requests !== null ? 
                            <List sx={{ mt: 3 }}>
                                {
                                    requests.map((item: any, i: number) => {
                                        return (
                                            <ListItem
                                                key={"request-"+i}
                                                component={NavLink}
                                                to={"/admin/request/" + item.id}
                                                sx={{ 
                                                    '&:hover': { backgroundColor: "#fbfbfb" },
                                                    borderTop: "1px solid #e6e6e6", 
                                                    px: { xs: 5, md: 5 }, pt: 1.25, pb: 2 
                                                }}
                                            >
                                                <Grid container sx={{ maxWidth: "600px", color: "#333" }}>
                                                    <Grid item xs={12}>
                                                        <ListItemText
                                                            primary={<Typography variant="subtitle1" color="#333"><b>{item.email !== "emailexample@gmail.com" ? "#" + item.id + " "+ t('newQuoteRequest') + t('fromDotted') + item.email : "#" + item.id + " " + t('newQuoteRequest')}</b></Typography>}
                                                        />        
                                                    </Grid>
                                                    <Grid item xs={12}>
                                                        {dateTimeDiff(item.createdAt)} <Chip size="small" label={item.status} color={item.status === "EnAttente" ? "warning" : item.status === "Valider" ? "success" : "secondary"} sx={{ ml: 1 }} />
                                                    </Grid>
                                                    <Grid item xs={12} md={6} mt={1}>
                                                        <Typography variant="subtitle1" display="flex" alignItems="center" justifyContent="left" fontSize={15}>{t('departure')}</Typography>
                                                        <Typography variant="subtitle2" display="flex" alignItems="center" justifyContent="left" fontSize={14}>
                                                            <PlaceIcon sx={{ position: "relative", right: "4px" }} /> <span>{item.departure.split(', ').slice(0,2).join(', ')}</span>
                                                        </Typography>
                                                    </Grid>
                                                    <Grid item xs={12} md={6} mt={1}>
                                                        <Typography variant="subtitle1" display="flex" alignItems="center" justifyContent="left" fontSize={15}>{t('arrival')}</Typography>
                                                        <Typography variant="subtitle2" display="flex" alignItems="center" justifyContent="left" fontSize={14}>
                                                            <PlaceIcon sx={{ position: "relative", right: "4px" }} /> <span>{item.arrival.split(', ').slice(0,2).join(', ')}</span>
                                                        </Typography>
                                                    </Grid>
                                                </Grid>
                                            </ListItem>
                                        )
                                    })
                                }
                            </List> : <Typography variant="subtitle1" my={3}>{t('errorHappened')}</Typography>
                        : <Skeleton sx={{ mt: 3 }} />
                    }
                    </Grid>
                </Grid>
            </Box>
        </div>
    );
}

export default Requests;