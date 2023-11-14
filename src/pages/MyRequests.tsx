import React, { useEffect, useState } from 'react';
import List from '@mui/material/List';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import { Dayjs } from 'dayjs';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { Alert, Button, Grid, InputLabel, NativeSelect, Skeleton } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { BootstrapInput, datetimeStyles, inputLabelStyles } from '../utils/misc/styles';
import { protectedResources } from '../config/authConfig';
import { enqueueSnackbar, SnackbarProvider } from 'notistack';
import { useAuthorizedBackendApi } from '../api/api';
import { BackendService } from '../utils/services/fetch';
import { RequestResponseDto } from '../utils/models/models';
import { useAccount, useMsal } from '@azure/msal-react';
import { useTranslation } from 'react-i18next';
import RequestViewItem from '../components/requestsPage/RequestViewItem';
import AutocompleteSearch from '../components/shared/AutocompleteSearch';

function createGetRequestUrl(variable1: string, variable2: string, variable3: string, variable4: string, variable5: Dayjs|null, variable6: Dayjs|null, variable7: Dayjs|null, variable8: Dayjs|null, assigneeId: number) {
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
    url+= 'assigneeId=' + assigneeId + '&';
    
    if (url.slice(-1) === '&') {
      url = url.slice(0, -1);
    }
    return url;
}

function MyRequests() {
    const [notifications, setNotifications] = useState<any>(null);
    const [load, setLoad] = useState<boolean>(true);
    const [currentUser, setCurrentUser] = useState<any>();
    const [status, setStatus] = useState<string>("");
    const [packingType, setPackingType] = useState<string>("");
    const [departure, setDeparture] = React.useState<any>(null);
    const [arrival, setArrival] = React.useState<any>(null);
    const [createdDateStart, setCreatedDateStart] = useState<Dayjs | null>(null);
    const [createdDateEnd, setCreatedDateEnd] = useState<Dayjs | null>(null);
    const [updatedDateStart, setUpdatedDateStart] = useState<Dayjs | null>(null);
    const [updatedDateEnd, setUpdatedDateEnd] = useState<Dayjs | null>(null);
    //let { search } = useParams();
    const { instance, accounts } = useMsal();
    const account = useAccount(accounts[0] || {});
    
    const context = useAuthorizedBackendApi();
    
    const handleChangePackingType = (event: { target: { value: string } }) => {
        setPackingType(event.target.value);
    };

    const handleChangeStatus = (event: { target: { value: string } }) => {
        setStatus(event.target.value);
    };

    const { t } = useTranslation();
    
    useEffect(() => {
        getAssignees();
    }, [instance, account, context]);

    const getAssignees = async () => {
        if (context) {
            setLoad(true);
            const response = await (context as BackendService<any>).getSingle(protectedResources.apiLisQuotes.endPoint+"/Assignee");
            if (response !== null && response.code !== undefined) {
                if (response.code === 200) {
                    setCurrentUser(response.data.find((elm: any) => elm.email === account?.username));

                    // Then I can load requests
                    loadRequests(response.data);
                }
                else {
                    setLoad(false);
                }
            }
        }
    }

    const loadRequests = async (assigneesList: any) => {
        if (context) {
            //setLoad(true);
            var auxAssignee = assigneesList.find((elm: any) => elm.email === account?.username);
            if (auxAssignee !== undefined) {
                const response: RequestResponseDto = await (context as BackendService<any>).getSingle(protectedResources.apiLisQuotes.endPoint+"/Request?AssigneeId="+auxAssignee.id);
                if (response !== null && response.code !== undefined && response.data !== undefined) {
                    if (response.code === 200) {
                        setLoad(false);
                        setNotifications(response.data.reverse());
                    }
                    else {
                        setLoad(false);
                        enqueueSnackbar(t('errorHappened'), { variant: "error", anchorOrigin: { horizontal: "right", vertical: "top"} });
                    }
                }  
            }
            else {
                setLoad(false);
                enqueueSnackbar(t('cantFindRequestAssigned'), { variant: "warning", anchorOrigin: { horizontal: "right", vertical: "top"} });
            }
        }
    }

    const searchRequests = async () => {
        if (context) {
            setLoad(true);
            var idAssignee = currentUser.id;
            
            var postcode1 = "";
            var postcode2 = "";
            var auxDeparture = departure !== null && departure !== undefined ? [departure.city.toUpperCase(),departure.country,departure.latitude,departure.longitude,postcode1].filter((val: any) => { return val !== "" }).join(', ') : "";
            var auxArrival = arrival !== null && arrival !== undefined ? [arrival.city.toUpperCase(),arrival.country,arrival.latitude,arrival.longitude,postcode2].filter((val: any) => { return val !== "" }).join(', ') : "";
            console.log(auxDeparture, auxArrival);

            var requestFormatted = createGetRequestUrl(auxDeparture, auxArrival, packingType, status, createdDateStart, createdDateEnd, updatedDateStart, updatedDateEnd, idAssignee);
            const response: RequestResponseDto = await (context as BackendService<any>).getSingle(requestFormatted);
            if (response !== null && response.code !== undefined && response.data !== undefined) {
                if (response.code === 200) {
                    setLoad(false);
                    setNotifications(response.data.reverse());
                }
                else {
                    setLoad(false);
                    enqueueSnackbar(t('errorHappened'), { variant: "error", anchorOrigin: { horizontal: "right", vertical: "top"} });
                }
            }  
        }
    }

    return (
        <div style={{ background: "#fff", borderTopLeftRadius: 20, borderTopRightRadius: 20, overflowX: "hidden" }}>
            <SnackbarProvider />
            <Box py={2.5}>
                <Typography variant="h5" sx={{mt: {xs: 4, md: 1.5, lg: 1.5 }}} px={5}><b>{t('myRequests')} : {account?.name}</b></Typography>
                <Grid container spacing={1} px={5} mt={2}>
                    <Grid item xs={12} md={3}>
                        <InputLabel htmlFor="departure" sx={inputLabelStyles}>{t('departure')}</InputLabel>
                        <AutocompleteSearch id="departure" value={departure} onChange={setDeparture} fullWidth />
                    </Grid>
                    <Grid item xs={12} md={3}>
                        <InputLabel htmlFor="arrival" sx={inputLabelStyles}>{t('arrival')}</InputLabel>
                        <AutocompleteSearch id="arrival" value={arrival} onChange={setArrival} fullWidth />
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
                            <option value="FCL">{t('fcl')}</option>
                            <option value="Breakbulk/LCL">{t('breakbulk')}</option>
                            <option value="Unit RoRo">{t('roro')}</option>
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
                            <option value="EnAttente">{t('EnAttente')}</option>
                            <option value="Valider">{t('Valider')}</option>
                            <option value="Rejeter">{t('Rejeter')}</option>
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

                {
                    !load ? 
                        notifications !== null && notifications.length !== 0 ? 
                        <List sx={{ mt: 3  }}>
                            {
                                notifications.map((item: any, i: number) => {
                                    return (<RequestViewItem item={item} i={i} />)
                                })
                            }
                        </List> : <Alert severity="warning" sx={{ mx: 5, mt: 3 }}>{t('noResults')}</Alert>
                    : <Skeleton sx={{ mt: 3 }} />
                }
                
            </Box>
        </div>
    );
}

export default MyRequests;