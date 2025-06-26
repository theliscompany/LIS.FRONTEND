import { useEffect, useState } from 'react';
import { Alert, Box, Button, Chip, Divider, List, ListItem, ListItemText, Typography } from '@mui/material';
import Grid from '@mui/material/Grid2';
import Skeleton from '@mui/material/Skeleton';
import { BootstrapInput } from '@utils/misc/styles';
import { useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { getApiTrackingByTrackingNumber } from '@features/request/api';
import { parseLocation3 } from '@utils/functions';

const Tracking = () => {
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
        getApiTrackingByTrackingNumber({path: {trackingNumber: trackingNumber}})
        .then((data: any) => {
            if (data.status === 200) {
                setTrackingData(data.data.data);
                setLoad(false);
                console.log(data);
            }
            else {
                setLoad(false);
            }
        })
        .catch(() => { 
            setLoad(false);
        });        
    }
    
    return (
        <Box sx={{ maxWidth: "lg", margin: "0 auto" }}>
            <Grid container my={5} sx={{ px: { md: 0, xs: 2 } }}>
                <Grid size={{ xs: 12 }} fontSize={16} my={3}>
                    <Typography component="div" variant="h4" fontWeight="bold">{t('requestTracking')}</Typography>
                </Grid>
                <Grid size={{ xs: 12, md: 6 }} mt={2}>
                    <BootstrapInput id="tracking-number" type="text" placeholder={t('trackingNumber')} value={trackingNumber} onChange={(e: any) => { setTrackingNumber(e.target.value); }} fullWidth />
                </Grid>
                <Grid size={{ xs: 12, md: 6 }} mt={2}>
                    <Button variant="contained" color={!load ? "primary" : "info"} size="large" className="mr-3" onClick={loadRequest}  sx={{ textTransform: "none", ml: { md: 3, xs: 0 } }}>{t('trackMyRequest')}</Button>
                </Grid>
                <Grid size={{ xs: 12, md: 12 }} mt={2}>
                    {
                        load ? <Skeleton sx={{ mt: 3 }} /> : 
                        trackingData !== null && trackingData !== undefined ? 
                        <Box>
                            <Alert severity='info'>
                                {t('weAreWorkingOnRequest')}
                            </Alert>
                            <Typography component="div" sx={{ mt: 3 }}>{t('requestStatus')} : <Chip size="small" label={trackingData.status} color={trackingData.status === "EnAttente" ? "warning" : trackingData.status === "Valider" ? "success" : "error"} sx={{ ml: 1 }} /> </Typography>
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
                                    <ListItemText primary={t('departure')} secondary={parseLocation3(trackingData.requestQuoteData.departure)} />
                                </ListItem>
                                <Divider />
                                <ListItem>
                                    <ListItemText primary={t('arrival')} secondary={parseLocation3(trackingData.requestQuoteData.arrival)} />
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
                        : <Typography component="div" sx={{ mt: 3 }}>{t('trackingCodeNotDefined')}</Typography>
                    }
                </Grid>
            </Grid>
        </Box>
    );
}

export default Tracking;
