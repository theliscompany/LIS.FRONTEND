import { useEffect, useState } from 'react';
import { BootstrapDialog, BootstrapDialogTitle, BootstrapInput, actionButtonStyles, buttonCloseStyles, datetimeStyles, inputIconStyles, inputLabelStyles } from '../../utils/misc/styles';
import { Autocomplete, Button, DialogActions, DialogContent, Grid, InputLabel, NativeSelect, Skeleton, TextField, Typography } from '@mui/material';
import { useAuthorizedBackendApi } from '../../api/api';
import { useTranslation } from 'react-i18next';
import { enqueueSnackbar } from 'notistack';
import { BackendService } from '../../utils/services/fetch';
import { crmRequest, pricingRequest, protectedResources } from '../../config/authConfig';
import { useAccount, useMsal } from '@azure/msal-react';
import { AuthenticationResult } from '@azure/msal-browser';
import { Anchor } from '@mui/icons-material';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { CategoryEnum } from '../../utils/constants';
import CompanySearch from '../shared/CompanySearch';
import { Dayjs } from 'dayjs';
import NewContact from './NewContact';
import { compareServices, getServices, transformArray } from '../../utils/functions';
import ServicesTable from '../seafreightPage/ServicesTable';
import NewPort from '../shared/NewPort';
import NewService from '../shared/NewService';

function NewSeafreight(props: any) {
    const [services, setServices] = useState<any>(null);
    const [allServices, setAllServices] = useState<any>(null);
    const [carrier, setCarrier] = useState<any>(null);
    const [carrierAgent, setCarrierAgent] = useState<any>(null);
    const [portLoading, setPortLoading] = useState<any>(props.portLoading);
    const [portDischarge, setPortDischarge] = useState<any>(props.portDischarge);
    const [transitTime, setTransitTime] = useState<number>(0);
    const [frequency, setFrequency] = useState<number>(0);
    const [validUntil, setValidUntil] = useState<Dayjs | null>(null);
    const [currency, setCurrency] = useState<string>("EUR");
    const [containerTypes, setContainerTypes] = useState<any>([]);
    const [comment, setComment] = useState<string>("");
    const [servicesData, setServicesData] = useState<any>([]);
    const [modalNewCarrier, setModalNewCarrier] = useState<boolean>(false);
    const [modalNewService, setModalNewService] = useState<boolean>(false);
    const [modalNewPort, setModalNewPort] = useState<boolean>(false);

    const { instance, accounts } = useMsal();
    const account = useAccount(accounts[0] || {});

    const context = useAuthorizedBackendApi();
    const { t } = useTranslation();
    
    const currencyOptions = [
        { code: "EUR", label: 'Euro - €' },
        { code: 'GBP', label: 'British pound - £' },
        { code: "USD", label: 'Dollar - $' },
        { code: "FCFA", label: 'Franc CFA - FCFA' }
    ]

    useEffect(() => {
        getServices(props.token);
    }, []);

    const deflattenData = (flattenedData: any) => {
        return flattenedData.map((item: any) => ({
            seaFreightServiceId: item.id,
            service: {
                serviceId: item.serviceId, // Original structure did not include this in the flattened data
                serviceName: item.serviceName,
                price: item.price,
                containers: item.containers // Assuming this was not included in the flattened version
            },
            containers: [containerTypes]
        }));
    };

    const getServices = async (token: string) => {
        if (context && account) {
            const response = await (context as BackendService<any>).getWithToken(protectedResources.apiLisTransport.endPoint+"/Service?pageSize=500", token);
            if (response !== null && response !== undefined) {
                console.log(response.sort((a: any, b: any) => b.serviceName - a.serviceName));
                setAllServices(response);
                setServices(response.sort((a: any, b: any) => compareServices(a, b)).filter((obj: any) => obj.servicesTypeId.includes(1))); // Filter the services for seafreights (SEAFREIGHT = 1)
            }  
        }
    }
    
    const createSeafreight = async () => {
        if (servicesData.length !== 0 && portLoading !== null && portDischarge !== null && carrier !== null && carrierAgent !== null && frequency !== 0 && transitTime !== 0 && validUntil !== null) {
            if (context && account) {
                var dataSent = null;
                dataSent = {
                    // "seaFreightId": "string",
                    "departurePortId": portLoading.portId,
                    "destinationPortId": portDischarge.portId,
                    "departurePortName": portLoading.portName,
                    "destinationPortName": portDischarge.portName,
                    "carrierId": carrier.contactId,
                    "carrierName": carrier.contactName,
                    "carrierAgentId": carrierAgent.contactId,
                    "carrierAgentName": carrierAgent.contactName,
                    "currency": currency,
                    "validUntil": validUntil?.toISOString(),
                    "transitTime": transitTime,
                    "frequency": frequency,
                    "comment": comment,
                    "containers": transformArray(deflattenData(servicesData)),
                    "services": deflattenData(servicesData),
                    "updated": (new Date()).toISOString()
                };

                console.log(dataSent);
                const response = await (context as BackendService<any>).postWithToken(protectedResources.apiLisPricing.endPoint+"/SeaFreight/SeaFreight", dataSent, props.token);
                if (response !== null && response !== undefined) {
                    props.closeModal();
                    enqueueSnackbar(t('successCreated'), { variant: "success", anchorOrigin: { horizontal: "right", vertical: "top"} });
                    props.callBack();
                }
                else {
                    enqueueSnackbar(t('errorHappened'), { variant: "error", anchorOrigin: { horizontal: "right", vertical: "top"} });
                }
            }
        }
        else {
            enqueueSnackbar(t('fieldsEmptySeafreight'), { variant: "error", anchorOrigin: { horizontal: "right", vertical: "top"} });
        }
    }

    return (
        <>
            <BootstrapDialogTitle id="custom-dialog-title2" onClose={() => props.closeModal()}>
                <b>{t('createRowSeafreight')}</b>
            </BootstrapDialogTitle>
            <DialogContent dividers>
                <Grid container spacing={2}>
                    <Grid item xs={12} md={8}>
                        <Typography sx={{ fontSize: 18, mb: 1 }}><b>Seafreight price information</b></Typography>
                    </Grid>
                    <Grid item xs={12} md={4}>
                        <Button variant="contained" color="inherit" sx={{ float: "right", backgroundColor: "#fff", textTransform: "none" }} onClick={() => { setModalNewCarrier(true); }} >{t('createNewCarrier')}</Button>
                    </Grid> 
                    <Grid item xs={12} md={8}>
                        <Grid container spacing={2}>
                            <Grid item xs={12} md={6} mt={0.25}>
                                <InputLabel htmlFor="carrier" sx={inputLabelStyles}>{t('carrier')}</InputLabel>
                                <CompanySearch id="carrier" value={carrier} onChange={setCarrier} category={CategoryEnum.SHIPPING_LINES} fullWidth />
                            </Grid>
                            <Grid item xs={12} md={6} mt={0.25}>
                                <InputLabel htmlFor="carrier-agent" sx={inputLabelStyles}>{t('carrierAgent')}</InputLabel>
                                <CompanySearch id="carrier-agent" value={carrierAgent} onChange={setCarrierAgent} category={CategoryEnum.SHIPPING_LINES} fullWidth />
                            </Grid>
                            <Grid item xs={12} md={6} mt={0.25}>
                                <InputLabel htmlFor="port-loading" sx={inputLabelStyles}><Anchor fontSize="small" sx={inputIconStyles} /> {t('departurePort')}</InputLabel>
                                {
                                    props.ports !== null ?
                                    <Autocomplete
                                        disablePortal
                                        id="port-loading"
                                        options={props.ports}
                                        renderOption={(props, option, i) => {
                                            return (
                                                <li {...props} key={option.portId}>
                                                    {option.portName+", "+option.country}
                                                </li>
                                            );
                                        }}
                                        getOptionLabel={(option: any) => { 
                                            if (option !== null && option !== undefined) {
                                                return option.portName+', '+option.country;
                                            }
                                            return ""; 
                                        }}
                                        value={portLoading}
                                        sx={{ mt: 1 }}
                                        renderInput={(params: any) => <TextField {...params} />}
                                        onChange={(e: any, value: any) => { setPortLoading(value); }}
                                        fullWidth
                                    /> : <Skeleton />
                                }
                            </Grid>
                            <Grid item xs={12} md={6} mt={0.25}>
                                <InputLabel htmlFor="discharge-port" sx={inputLabelStyles}><Anchor fontSize="small" sx={inputIconStyles} /> {t('arrivalPort')}</InputLabel>
                                {
                                    props.ports !== null ?
                                    <Autocomplete
                                        disablePortal
                                        id="discharge-port"
                                        options={props.ports}
                                        renderOption={(props, option, i) => {
                                            return (
                                                <li {...props} key={option.portId}>
                                                    {option.portName+", "+option.country}
                                                </li>
                                            );
                                        }}
                                        getOptionLabel={(option: any) => { 
                                            if (option !== null && option !== undefined) {
                                                return option.portName+', '+option.country;
                                            }
                                            return ""; 
                                        }}
                                        value={portDischarge}
                                        sx={{ mt: 1 }}
                                        renderInput={(params: any) => <TextField {...params} />}
                                        onChange={(e: any, value: any) => { setPortDischarge(value); }}
                                        fullWidth
                                    /> : <Skeleton />
                                }
                            </Grid>
                        </Grid>
                    </Grid>
                    <Grid item xs={12} md={4}>
                        <Grid container spacing={2}>
                            <Grid item xs={12} md={12} mt={0}>
                                <InputLabel htmlFor="comment" sx={inputLabelStyles}>{t('comment')}</InputLabel>
                                <BootstrapInput id="comment" type="text" multiline rows={4.875} value={comment} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setComment(e.target.value)} fullWidth />
                            </Grid>
                        </Grid>
                    </Grid>
                    <Grid item xs={12} md={3}>
                        <InputLabel htmlFor="valid-until" sx={inputLabelStyles}>{t('validUntil')}</InputLabel>
                        <LocalizationProvider dateAdapter={AdapterDayjs}>
                            <DatePicker 
                                value={validUntil}
                                format="DD/MM/YYYY"
                                onChange={(value: any) => { setValidUntil(value) }}
                                slotProps={{ textField: { id: "valid-until", fullWidth: true, sx: datetimeStyles }, inputAdornment: { sx: { position: "relative", right: "11.5px" } } }}
                            />
                        </LocalizationProvider>
                    </Grid>
                    <Grid item xs={12} md={2}>
                        <InputLabel htmlFor="currency" sx={inputLabelStyles}>{t('currency')}</InputLabel>
                        <NativeSelect
                            id="currency"
                            value={currency}
                            onChange={(e: any) => { setCurrency(e.target.value) }}
                            input={<BootstrapInput />}
                            fullWidth
                        >
                            {currencyOptions.map((elm: any, i: number) => (
                                <option key={"currencyElm-"+i} value={elm.code}>{elm.label}</option>
                            ))}
                        </NativeSelect>
                    </Grid>
                    <Grid item xs={12} md={2}>
                        <InputLabel htmlFor="transit-time" sx={inputLabelStyles}>{t('transitTime')} ({t('inDays')})</InputLabel>
                        <BootstrapInput id="transit-time" type="number" value={transitTime} onChange={(e: any) => setTransitTime(e.target.value)} fullWidth />
                    </Grid>
                    <Grid item xs={12} md={2}>
                        <InputLabel htmlFor="frequency" sx={inputLabelStyles}>{t('frequency')} ({t('everyxDays')})</InputLabel>
                        <BootstrapInput id="frequency" type="number" value={frequency} onChange={(e: any) => setFrequency(e.target.value)} fullWidth />
                    </Grid>
                    <Grid item xs={12} md={3}>
                        <InputLabel htmlFor="container-types" sx={inputLabelStyles}>{t('container')}</InputLabel>
                        {
                            props.containers !== null ? 
                            <Autocomplete
                                id="container-types"
                                options={props.containers}
                                getOptionLabel={(option: any) => option.packageName ? option.packageName : ""}
                                value={containerTypes}
                                onChange={(event: any, newValue: any) => {
                                    setContainerTypes(newValue);
                                }}
                                // disabled={currentEditId !== ""}
                                renderInput={(params: any) => <TextField {...params} sx={{ mt: 1, textTransform: "lowercase" }} />}
                                fullWidth
                            /> : <Skeleton />
                        }
                    </Grid>
                    <Grid item xs={12} md={8}>
                        <Typography sx={{ fontSize: 18, mb: 1 }}><b>{t('listServices')} - {t('seafreights')}</b></Typography>
                    </Grid>
                    <Grid item xs={12} md={4}>
                        <Button 
                            variant="contained" color="inherit" 
                            sx={{ float: "right", backgroundColor: "#fff", textTransform: "none" }} 
                            onClick={() => { setModalNewService(true); }}
                        >
                            Create new service
                        </Button>
                        <Button 
                            variant="contained" color="inherit" 
                            sx={{ float: "right", backgroundColor: "#fff", textTransform: "none", mr: 1 }} 
                            onClick={() => { setModalNewPort(true); }}
                        >
                            Create new port
                        </Button>
                    </Grid> 
                    <Grid item xs={12}>
                        {
                            allServices !== null && allServices !== undefined && allServices.length !== 0 ?
                            <ServicesTable 
                                services={servicesData} 
                                setServices={setServicesData}
                                allServices={allServices}
                                type="Seafreight"
                                container={containerTypes}
                                currency={currency}
                                servicesOptions={allServices.filter((obj: any) => obj.servicesTypeId.includes(1)).map((elm: any) => elm.serviceName)}
                            /> : null
                        }
                    </Grid>
                </Grid>
            </DialogContent>
            <DialogActions>
                <Button variant="contained" onClick={() => { createSeafreight(); }} sx={actionButtonStyles}>{t('validate')}</Button>
                <Button variant="contained" onClick={props.closeModal} sx={buttonCloseStyles}>{t('close')}</Button>
            </DialogActions>
                
            {/* Add a new contact - carrier */}
            <BootstrapDialog
                onClose={() => setModalNewCarrier(false)}
                aria-labelledby="custom-dialog-titleNewCarrier"
                open={modalNewCarrier}
                maxWidth="md"
                fullWidth
            >
                <NewContact 
                    categories={["SHIPPING_LINES"]}
                    closeModal={() => setModalNewCarrier(false)}
                    callBack={() => console.log("Callback new haulier modal")}
                />
            </BootstrapDialog>

            {/* Create new service */}
            <BootstrapDialog
                onClose={() => setModalNewService(false)}
                aria-labelledby="custom-dialog-titleNewService"
                open={modalNewService}
                maxWidth="md"
                fullWidth
            >
                <NewService 
                    closeModal={() => setModalNewService(false)}
                    callBack={getServices}
                    // callBack={() => console.log("Services")}
                />
            </BootstrapDialog>

            {/* Create new port */}
            <BootstrapDialog
                onClose={() => setModalNewPort(false)}
                aria-labelledby="custom-dialog-titleNewPort"
                open={modalNewPort}
                maxWidth="md"
                fullWidth
            >
                <NewPort 
                    closeModal={() => setModalNewPort(false)}
                    callBack={() => console.log("Ports")}
                />
            </BootstrapDialog>
        </>
    );
}

export default NewSeafreight;
