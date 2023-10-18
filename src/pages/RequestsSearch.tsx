import List from '@mui/material/List';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import React, { useEffect } from 'react';
// import '../../App.css';
import { Alert, Button, Grid, InputLabel, NativeSelect, Skeleton } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { BootstrapInput, inputLabelStyles } from '../utils/misc/styles';
import { protectedResources } from '../config/authConfig';
import { enqueueSnackbar, SnackbarProvider } from 'notistack';
import { useAuthorizedBackendApi } from '../api/api';
import { BackendService } from '../utils/services/fetch';
import { useParams } from 'react-router-dom';
import { RequestResponseDto } from '../utils/models/models';
import { useTranslation } from 'react-i18next';
import RequestViewItem from '../components/requestsPage/RequestViewItem';

function createGetRequestUrl(variable1: string, variable2: string, variable3: string, variable4: string) {
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
    
    if (url.slice(-1) === '&') {
      url = url.slice(0, -1);
    }
    return url;
}

function RequestsSearch() {
    const [notifications, setNotifications] = React.useState<any>(null);
    const [load, setLoad] = React.useState<boolean>(true);
    const [status, setStatus] = React.useState<string>("");
    // const [cargoType, setCargoType] = React.useState<string>("");
    const [packingType, setPackingType] = React.useState<string>("");
    // const [departureTown, setDepartureTown] = React.useState<any>(null);
    // const [arrivalTown, setArrivalTown] = React.useState<any>(null);
    const [departure, setDeparture] = React.useState<string>("");
    const [arrival, setArrival] = React.useState<string>("");
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
    }, [context, search]);

    const loadRequests = async () => {
        if (context) {
            setLoad(true);
            const response: RequestResponseDto = await (context as BackendService<any>).getSingle(search !== undefined ? protectedResources.apiLisQuotes.endPoint+"/Request?Search="+search : protectedResources.apiLisQuotes.endPoint+"/Request");
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

    const searchRequests = async () => {
        if (context) {
            setLoad(true);
            var requestFormatted = createGetRequestUrl(departure, arrival, packingType, status);
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
        <div style={{ background: "#fff", borderTopLeftRadius: 20, borderTopRightRadius: 20 }}>
            <SnackbarProvider />
            <Box py={2.5}>
                <Typography variant="h5" sx={{mt: {xs: 4, md: 1.5, lg: 1.5 }}} mx={5}>
                    {
                        search !== undefined ? <b>{t('searchResultsFor')} : {search}</b> : <b>{t('listRequestsQuote')}</b>
                    }
                </Typography>
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
                    <Grid item xs={12} md={2} sx={{ display: "flex", alignItems: "end" }}>
                        <Button 
                            variant="contained" 
                            color="inherit"
                            startIcon={<SearchIcon />} 
                            size="large"
                            sx={{ backgroundColor: "#fff", color: "#333", textTransform: "none", mb: 0.15 }}
                            onClick={searchRequests}
                        >
                            {t('search')}
                        </Button>
                    </Grid>
                </Grid>

                {
                    !load ? 
                        notifications !== null && notifications.length !== 0 ? 
                        <List sx={{ mt: 3 }}>
                            {
                                notifications.map((item: any, i: number) => {
                                    return (<RequestViewItem item={item} i={i} />)
                                })
                            }
                        </List> : <Alert severity="warning">{t('noResults')}</Alert>
                    : <Skeleton sx={{ mx: 5, mt: 3 }} />
                }
                
            </Box>
        </div>
    );
}

export default RequestsSearch;