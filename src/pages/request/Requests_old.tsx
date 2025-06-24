import React, { useEffect } from 'react';
import List from '@mui/material/List';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import { Dayjs } from 'dayjs';
import { Alert, Button, Skeleton } from '@mui/material';
import Grid from '@mui/material/Grid2';
import SearchIcon from '@mui/icons-material/Search';
import { enqueueSnackbar, SnackbarProvider } from 'notistack';
import { useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import RequestViewItem from '../../components/request/RequestViewItem';
import SearchZone from '../../components/request/SearchZone';
import { getApiRequest } from '../../api/client/quote';

const Requests = () => {
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

    const { t } = useTranslation();
    
    const handleChangePackingType = (event: { target: { value: string } }) => {
        setPackingType(event.target.value);
    };

    const handleChangeStatus = (event: { target: { value: string } }) => {
        setStatus(event.target.value);
    };

    useEffect(() => {
        loadRequests();
    }, []);

    const loadRequests = async () => {
        try {
            setLoad(true);
            const response: any = await getApiRequest(search !== undefined ? {query: {Search: search}} : {});
            if (response !== null && response !== undefined) {
                setLoad(false);
                setRequests(response.data.data.reverse());
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

    const searchRequests = async () => {
        try {
            setLoad(true);
            var postcode1 = "";
            var postcode2 = "";
            var auxDeparture = departure !== null && departure !== undefined ? [departure.city.toUpperCase(),departure.country,departure.latitude,departure.longitude,postcode1].filter((val: any) => { return val !== "" }).join(', ') : "";
            var auxArrival = arrival !== null && arrival !== undefined ? [arrival.city.toUpperCase(),arrival.country,arrival.latitude,arrival.longitude,postcode2].filter((val: any) => { return val !== "" }).join(', ') : "";
            console.log(auxDeparture, auxArrival);
            
            const response: any = await getApiRequest({query: {Arrival: auxArrival, Departure: auxDeparture, PackingType: packingType, Status: status, CreatedAtStart: createdDateStart?.format('YYYY-MM-DDTHH:mm:ss'), CreatedAtEnd: createdDateEnd?.format('YYYY-MM-DDTHH:mm:ss'), UpdatedAtStart: updatedDateStart?.format('YYYY-MM-DDTHH:mm:ss'), UpdatedAtEnd: updatedDateEnd?.format('YYYY-MM-DDTHH:mm:ss')}});
            if (response !== null && response !== undefined) {
                setLoad(false);
                setRequests(response.data.data.reverse());
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
                <Typography variant="h5" sx={{mt: {xs: 4, md: 1.5, lg: 1.5 }}} px={5}><b>{t('requestsTitle')}</b></Typography>
                <Grid container spacing={1} px={5} mt={2}>
                    <SearchZone 
                        departure={departure} setDeparture={setDeparture}
                        arrival={arrival} setArrival={setArrival}
                        packingType={packingType} handleChangePackingType={handleChangePackingType}
                        status={status} handleChangeStatus={handleChangeStatus}
                        updatedDateStart={updatedDateStart} setUpdatedDateStart={setUpdatedDateStart}
                        updatedDateEnd={updatedDateEnd} setUpdatedDateEnd={setUpdatedDateEnd}
                        createdDateEnd={createdDateEnd} setCreatedDateEnd={setCreatedDateEnd}
                        createdDateStart={createdDateStart} setCreatedDateStart={setCreatedDateStart}
                    />
                    
                    <Grid size={{ xs: 12, md: 2 }} mt={1} sx={{ display: "flex", alignItems: "end" }}>
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
                    <Grid size={{ xs: 12 }}>
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
