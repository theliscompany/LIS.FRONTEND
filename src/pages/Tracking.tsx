import { Alert, Box, Button, Chip, Divider, Grid, List, ListItem, ListItemText, Typography } from '@mui/material';
import Skeleton from '@mui/material/Skeleton';
import { useEffect, useState } from 'react';
// import '../../App.css';
import { protectedResources } from '../config/authConfig';
import { BootstrapInput } from '../misc/styles';
import { useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

function Tracking() {
    const { id } = useParams();
    const [trackingNumber, setTrackingNumber] = useState<string>(id !== undefined ? id : "");
    const [load, setLoad] = useState<boolean>(false);
    const [trackingData, setTrackingData] = useState<any>(null);

    const { t } = useTranslation();

    useEffect(() => {
        if (id !== undefined) {
            loadRequest();
        }
    }, []);
    
    const loadRequest = async () => {
        setLoad(true);
        setTrackingData(null);
        var myHeaders = new Headers();
        myHeaders.append("Accept", "*/");
        fetch(protectedResources.apiLisQuotes.endPoint+"/Tracking/"+trackingNumber, {
            method: "GET",
            headers: myHeaders
        })
        .then((response: any) => response.json())
        .then((data: any) => {
            if (data.code === 200) {
                setTrackingData(data.data);
                setLoad(false);
                console.log(data);
            }
            else {
                setLoad(false);
            }
        })
        .catch(error => { 
            setLoad(false);
        });        
    }
    
    return (
        <Box sx={{ maxWidth: "lg", margin: "0 auto" }}>
            <Grid container my={5} sx={{ px: { md: 0, xs: 2 } }}>
                <Grid item xs={12} fontSize={16} my={3}>
                    <Typography variant="h4" fontWeight="bold">{t('requestTracking')}</Typography>
                </Grid>
                <Grid item xs={12} md={6} mt={2}>
                    <BootstrapInput id="tracking-number" type="text" placeholder={t('trackingNumber')} value={trackingNumber} onChange={(e: any) => { setTrackingNumber(e.target.value); }} fullWidth />
                </Grid>
                <Grid item xs={12} md={6} mt={2}>
                    <Button variant="contained" color={!load ? "primary" : "info"} size="large" className="mr-3" onClick={loadRequest}  sx={{ textTransform: "none", ml: { md: 3, xs: 0 } }}>{t('trackMyRequest')}</Button>
                </Grid>
                <Grid item xs={12} md={12} mt={2}>
                    {
                        load ? <Skeleton sx={{ mt: 3 }} /> : 
                        trackingData !== null && trackingData !== undefined ? 
                        <Box>
                            {/* {
                                trackingData.assignee !== null ? 
                                <Alert severity="info">Your request has been assigned to the agent : {trackingData.assignee.name}. You can contact her/him at this email : {trackingData.assignee.email} </Alert> : <Alert severity="warning">There is no agent assigned for the moment. For questions, please contact contact-assign@omnifreight.eu </Alert>
                            } */}
                            <Alert severity='info'>
                                {t('weAreWorkingOnRequest')}
                            </Alert>
                            <Typography sx={{ mt: 3 }}>{t('requestStatus')} : <Chip size="small" label={trackingData.status} color={trackingData.status === "EnAttente" ? "warning" : trackingData.status === "Valider" ? "success" : "error"} sx={{ ml: 1 }} /> </Typography>
                            <List sx={{ my: 3, border: "1px #e2e2e2 solid" }} dense>
                                <ListItem>
                                    <ListItemText primary={t(('WhatsappNumber'))} secondary={trackingData.requestQuoteData.whatsapp} />
                                </ListItem>
                                <Divider />
                                <ListItem>
                                    <ListItemText primary={t('email')} secondary={trackingData.requestQuoteData.email} />
                                </ListItem>
                                <Divider />
                                <ListItem>
                                    <ListItemText primary={t('departure')} secondary={trackingData.requestQuoteData.departure} />
                                </ListItem>
                                <Divider />
                                <ListItem>
                                    <ListItemText primary={t('arrival')} secondary={trackingData.requestQuoteData.arrival} />
                                </ListItem>
                                <Divider />
                                <ListItem>
                                    <ListItemText primary={t('cargoType')} secondary={trackingData.requestQuoteData.cargoType} />
                                </ListItem>
                                <Divider />
                                <ListItem>
                                    <ListItemText primary={t('quantity')} secondary={trackingData.requestQuoteData.quantity} />
                                </ListItem>
                                <Divider />
                                <ListItem>
                                    <ListItemText primary={t('detail')} secondary={trackingData.requestQuoteData.detail} />
                                </ListItem>
                                <Divider />
                                <ListItem>
                                    <ListItemText primary={t('requestDate')} secondary={(new Date(trackingData.requestQuoteData.createdAt)).toLocaleString()} />
                                </ListItem>
                            </List>
                        </Box> 
                        : <Typography sx={{ mt: 3 }}>{t('trackingCodeNotDefined')}</Typography>
                    }
                </Grid>
            </Grid>
        </Box>
    );
}

export default Tracking;
