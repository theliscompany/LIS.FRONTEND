import React, { useEffect } from 'react';
import List from '@mui/material/List';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import { Dayjs } from 'dayjs';
import { Alert, Button, Grid, InputLabel, NativeSelect, Skeleton, Switch, FormControlLabel } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { protectedResources } from '../../config/authConfig';
import { enqueueSnackbar, SnackbarProvider } from 'notistack';
import { useAuthorizedBackendApi } from '../../api/api';
import { BackendService } from '../../utils/services/fetch';
import { useParams } from 'react-router-dom';
import { RequestResponseDto } from '../../utils/models/models';
import { useTranslation } from 'react-i18next';
import RequestViewItem from '../../components/requestsPage/RequestViewItem';
import { useAccount, useMsal } from '@azure/msal-react';
import SearchZone from '../../components/requestsPage/SearchZone';

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
    const [departure, setDeparture] = React.useState<any>(null);
    const [arrival, setArrival] = React.useState<any>(null);
    const [createdDateStart, setCreatedDateStart] = React.useState<Dayjs | null>(null);
    const [createdDateEnd, setCreatedDateEnd] = React.useState<Dayjs | null>(null);
    const [updatedDateStart, setUpdatedDateStart] = React.useState<Dayjs | null>(null);
    const [updatedDateEnd, setUpdatedDateEnd] = React.useState<Dayjs | null>(null);
    let { search } = useParams();

    const context = useAuthorizedBackendApi();
    const { instance, accounts } = useMsal();
    const account = useAccount(accounts[0] || {});

    const { t } = useTranslation();
    
    const handleChangePackingType = (event: { target: { value: string } }) => {
        setPackingType(event.target.value);
    };

    const handleChangeStatus = (event: { target: { value: string } }) => {
        setStatus(event.target.value);
    };

    useEffect(() => {
        loadRequests();
    }, [account, instance, account]);

    const loadRequests = async () => {
        if (account && instance && account) {
            setLoad(true);
            
            const response: RequestResponseDto = await (context?.service as BackendService<any>).getWithToken(search !== undefined ? protectedResources.apiLisQuotes.endPoint+"/Request?Search="+search : protectedResources.apiLisQuotes.endPoint+"/Request", context.tokenLogin);
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
        if (account && instance && context) {
            setLoad(true);
            
            var postcode1 = "";
            var postcode2 = "";
            var auxDeparture = departure !== null && departure !== undefined ? [departure.city.toUpperCase(),departure.country,departure.latitude,departure.longitude,postcode1].filter((val: any) => { return val !== "" }).join(', ') : "";
            var auxArrival = arrival !== null && arrival !== undefined ? [arrival.city.toUpperCase(),arrival.country,arrival.latitude,arrival.longitude,postcode2].filter((val: any) => { return val !== "" }).join(', ') : "";
            console.log(auxDeparture, auxArrival);

            var requestFormatted = createGetRequestUrl(auxDeparture, auxArrival, packingType, status, createdDateStart, createdDateEnd, updatedDateStart, updatedDateEnd);
            const response: RequestResponseDto = await (context?.service as BackendService<any>).getWithToken(requestFormatted, context.tokenLogin);
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
                    <SearchZone 
                        departure={departure} setDeparture={setDeparture}
                        arrival={arrival} setArrival={setArrival}
                        packingType={packingType} handleChangePackingType={handleChangePackingType}
                        status={status} handleChangeStatus={handleChangeStatus}
                        updatedDateStart={updatedDateStart} setUpdatedDateStart
                        updatedDateEnd={updatedDateEnd} setUpdatedDateEnd={setUpdatedDateEnd}
                        createdDateEnd={createdDateEnd} setCreatedDateEnd={setCreatedDateEnd}
                        createdDateStart={createdDateStart} setCreatedDateStart={setCreatedDateStart}
                    />
                    
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
                            requests !== null && requests.length !== 0 ? 
                            <List sx={{ mt: 3 }}>
                                {
                                    requests.map((item: any, i: number) => {
                                        return (<RequestViewItem key={"rvi-"+i} item={item} i={i} />)
                                    })
                                }
                            </List> : <Alert severity="warning" sx={{ mx: 5, mt: 3 }}>{t('noResults')}</Alert>
                        : <Skeleton sx={{ mt: 3 }} />
                    }
                    </Grid>
                </Grid>
            </Box>
        </div>
    );
}

export default Requests;
