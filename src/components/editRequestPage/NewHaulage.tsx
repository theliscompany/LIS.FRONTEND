import { useState } from 'react';
import { BootstrapDialog, BootstrapDialogTitle, BootstrapInput, actionButtonStyles, buttonCloseStyles, datetimeStyles, inputIconStyles, inputLabelStyles } from '../../utils/misc/styles';
import { Autocomplete, Button, DialogActions, DialogContent, Grid, InputLabel, NativeSelect, Skeleton, TextField, Typography } from '@mui/material';
import { useAuthorizedBackendApi } from '../../api/api';
import { useTranslation } from 'react-i18next';
import { enqueueSnackbar } from 'notistack';
import { BackendService } from '../../utils/services/fetch';
import { protectedResources } from '../../config/authConfig';
import { useAccount, useMsal } from '@azure/msal-react';
import { Anchor } from '@mui/icons-material';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { CategoryEnum } from '../../utils/constants';
import AutocompleteSearch from '../shared/AutocompleteSearch';
import CompanySearch from '../shared/CompanySearch';
import { Dayjs } from 'dayjs';
import NewContact from './NewContact';

function NewHaulage(props: any) {
    const [load, setLoad] = useState<boolean>(false);
    const [haulier, setHaulier] = useState<any>(null);
    const [loadingCity, setLoadingCity] = useState<any>(props.loadingCity);
    const [loadingPort, setLoadingPort] = useState<any>(null);
    const [freeTime, setFreeTime] = useState<number>(0);
    const [multiStop, setMultiStop] = useState<number>(0);
    const [unitTariff, setUnitTariff] = useState<number>(0);
    const [overtimeTariff, setOvertimeTariff] = useState<number>(0);
    const [validUntil, setValidUntil] = useState<Dayjs | null>(null);
    const [currency, setCurrency] = useState<string>("EUR");
    const [haulageType, setHaulageType] = useState<string>("On trailer, direct loading");
    const [emptyPickupDepot, setEmptyPickupDepot] = useState<string>("");
    const [containerTypes, setContainerTypes] = useState<any>([]);
    const [comment, setComment] = useState<string>("");
    const [modalNewHaulier, setModalNewHaulier] = useState<boolean>(false);

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

    const haulageTypeOptions = [
        { value: "On trailer, direct loading", label: t('haulageType1') },
        { value: "On trailer, Loading with Interval", label: t('haulageType2') },
        { value: "Side loader, direct loading", label: t('haulageType3') },
        { value: "Side loader, Loading with Interval, from trailer to floor", label: t('haulageType4') },
        { value: "Side loader, Loading with Interval, from floor to trailer", label: t('haulageType5') }
    ];
    
    const createHaulage = async () => {
        setLoad(true);
        if (haulier !== null && loadingCity !== null && loadingPort !== null && freeTime > 0 && unitTariff > 0 && overtimeTariff > 0 && multiStop > 0 && validUntil !== null && containerTypes.length > 0) {
            if (account && instance && context) {
                var dataSent = null;
                var postalCode = loadingCity !== null ? loadingCity.postalCode !== undefined ? loadingCity.postalCode : "" : ""; 
                var city = loadingCity !== null ? loadingCity.city.toUpperCase()+', '+loadingCity.country.toUpperCase() : "";
                if (postalCode !== "") {
                    if (postalCode === null) {
                        city = loadingCity.city.toUpperCase()+', '+loadingCity.country.toUpperCase();
                    }
                    else {
                        city = loadingCity.city.toUpperCase()+', '+loadingCity.country.toUpperCase()+', '+postalCode;
                    }
                }

                dataSent = {
                    "id": null,
                    "haulierId": haulier.contactId,
                    "haulierName": haulier.contactName,
                    "currency": currency,
                    "loadingCity": city,
                    "loadingPortId": loadingPort.portId,
                    "loadingPort": loadingPort.portName,
                    "freeTime": freeTime,
                    "multiStop": multiStop,
                    "overtimeTariff": overtimeTariff,
                    "unitTariff": Number(unitTariff),
                    "haulageType": haulageType,
                    "emptyPickupDepot": emptyPickupDepot,
                    "comment": comment,
                    "validUntil": validUntil?.toISOString(),
                    "updated": (new Date()).toISOString(),
                    "containers": containerTypes,
                };

                const response = await (context?.service as BackendService<any>).postWithToken(protectedResources.apiLisPricing.endPoint+"/Haulage/Haulage", dataSent, props.token);
                if (response !== null && response !== undefined) {
                    enqueueSnackbar(t('successCreated'), { variant: "success", anchorOrigin: { horizontal: "right", vertical: "top"} });
                    props.closeModal();
                    // Callback function here
                    props.callBack();
                    setLoad(false);
                }
                else {
                    enqueueSnackbar(t('errorHappened'), { variant: "error", anchorOrigin: { horizontal: "right", vertical: "top"} });
                    setLoad(false);
                }
            }
        }
        else {
            enqueueSnackbar(t('fieldsEmptyHaulage'), { variant: "error", anchorOrigin: { horizontal: "right", vertical: "top"} });
            setLoad(false);
        }
    }

    return (
        <>
            <BootstrapDialogTitle id="custom-dialog-title7" onClose={props.closeModal}>
                <b>{t('createNewHaulage')}</b>
            </BootstrapDialogTitle>
            <DialogContent dividers>
                <Grid container spacing={2}>
                    <Grid item xs={12} md={8}>
                        <Typography sx={{ fontSize: 18, mb: 1 }}><b>Haulage price information</b></Typography>
                    </Grid>
                    <Grid item xs={12} md={4}>
                        <Button 
                            variant="contained" color="inherit" 
                            sx={{ float: "right", backgroundColor: "#fff", textTransform: "none" }} 
                            onClick={() => { setModalNewHaulier(true); }}
                        >
                            {t('createNewHaulier')}
                        </Button>
                    </Grid>
                    <Grid item xs={12} md={8}>
                        <Grid container spacing={2}>
                            <Grid item xs={12} md={6} mt={0.25}>
                                <InputLabel htmlFor="haulier" sx={inputLabelStyles}>{t('haulier')}</InputLabel>
                                <CompanySearch id="haulier" value={haulier} onChange={setHaulier} category={CategoryEnum.SUPPLIERS} fullWidth />
                            </Grid>
                            <Grid item xs={12} md={6} mt={0.25}>
                                <InputLabel htmlFor="loading-city" sx={inputLabelStyles}>{t('loadingCity')}</InputLabel>
                                <AutocompleteSearch id="loading-city" value={loadingCity} onChange={setLoadingCity} fullWidth />
                            </Grid>
                            <Grid item xs={12} md={6} mt={0.25}>
                                <InputLabel htmlFor="loading-port" sx={inputLabelStyles}><Anchor fontSize="small" sx={inputIconStyles} /> {t('deliveryPort')}</InputLabel>
                                {
                                    props.ports !== null ?
                                    <Autocomplete
                                        disablePortal
                                        id="loading-port"
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
                                        value={loadingPort}
                                        sx={{ mt: 1 }}
                                        renderInput={(params: any) => <TextField {...params} />}
                                        onChange={(e: any, value: any) => { setLoadingPort(value); }}
                                        fullWidth
                                    /> : <Skeleton />
                                }
                            </Grid>
                            <Grid item xs={12} md={6} mt={0.25}>
                                <InputLabel htmlFor="emptyPickupDepot" sx={inputLabelStyles}>{t('emptyPickupDepot')}</InputLabel>
                                <BootstrapInput id="emptyPickupDepot" type="text" value={emptyPickupDepot} onChange={(e: any) => setEmptyPickupDepot(e.target.value)} fullWidth />
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
                    <Grid item xs={12} md={3}>
                        <InputLabel htmlFor="currency" sx={inputLabelStyles}>{t('currency')}</InputLabel>
                        <NativeSelect
                            id="currency"
                            value={currency}
                            onChange={(e: any) => { setCurrency(e.target.value) }}
                            input={<BootstrapInput />}
                            fullWidth
                        >
                            {currencyOptions.map((elm: any, i: number) => (
                                <option key={"currencyElm-"+i} value={elm.value}>{elm.label}</option>
                            ))}
                        </NativeSelect>
                    </Grid>
                    <Grid item xs={12} md={6}>
                        <InputLabel htmlFor="haulageType" sx={inputLabelStyles}>{t('haulageType')}</InputLabel>
                        <NativeSelect
                            id="haulageType"
                            value={haulageType}
                            onChange={(e: any) => { setHaulageType(e.target.value) }}
                            input={<BootstrapInput />}
                            fullWidth
                        >
                            {haulageTypeOptions.map((elm: any, i: number) => (
                                <option key={"haulageElm-"+i} value={elm.value}>{elm.label}</option>
                            ))}
                        </NativeSelect>
                    </Grid>
                    <Grid item xs={12} md={4}>
                        <InputLabel htmlFor="container-types" sx={inputLabelStyles}>{t('containers')}</InputLabel>
                        {
                            props.containers !== null ? 
                            <Autocomplete
                                multiple
                                disableCloseOnSelect
                                id="container-types"
                                options={props.containers}
                                getOptionLabel={(option: any) => option.packageName}
                                value={containerTypes}
                                onChange={(event: any, newValue: any) => {
                                    setContainerTypes(newValue);
                                }}
                                renderInput={(params: any) => <TextField {...params} sx={{ mt: 1, textTransform: "lowercase" }} />}
                                fullWidth
                            /> : <Skeleton />
                        }
                    </Grid>
                    <Grid item xs={12} md={2}>
                        <InputLabel htmlFor="free-time" sx={inputLabelStyles}>{t('freeTime')} ({t('hours')})</InputLabel>
                        <BootstrapInput id="free-time" type="number" value={freeTime} onChange={(e: any) => setFreeTime(e.target.value)} fullWidth />
                    </Grid>
                    <Grid item xs={12} md={2}>
                        <InputLabel htmlFor="unitTariff-cs" sx={inputLabelStyles}>{t('unitTariff2')}</InputLabel>
                        <BootstrapInput id="unitTariff-cs" type="number" value={unitTariff} onChange={(e: any) => setUnitTariff(e.target.value)} fullWidth />
                    </Grid>
                    <Grid item xs={12} md={2}>
                        <InputLabel htmlFor="overtimeTariff-cs" sx={inputLabelStyles}>{t('overtimeTariff')} (/{t('hour')})</InputLabel>
                        <BootstrapInput id="overtimeTariff-cs" type="number" value={overtimeTariff} onChange={(e: any) => setOvertimeTariff(e.target.value)} fullWidth />
                    </Grid>
                    <Grid item xs={12} md={2}>
                        <InputLabel htmlFor="multiStop" sx={inputLabelStyles}>{t('multiStop')}</InputLabel>
                        <BootstrapInput id="multiStop" type="number" value={multiStop} onChange={(e: any) => setMultiStop(e.target.value)} fullWidth />
                    </Grid>
                </Grid>
            </DialogContent>
            <DialogActions>
                <Button variant="contained" disabled={load === true} onClick={() => { createHaulage(); }} sx={actionButtonStyles}>{t('validate')}</Button>
                <Button variant="contained" onClick={props.closeModal} sx={buttonCloseStyles}>{t('close')}</Button>
            </DialogActions>

            {/* Add a new contact */}
            <BootstrapDialog
                onClose={() => setModalNewHaulier(false)}
                aria-labelledby="custom-dialog-titleNewHaulier"
                open={modalNewHaulier}
                maxWidth="md"
                fullWidth
            >
                <NewContact 
                    categories={["SUPPLIERS"]}
                    closeModal={() => setModalNewHaulier(false)}
                    callBack={() => console.log("Callback new haulier modal")}
                />
            </BootstrapDialog>
        </>
    );
}

export default NewHaulage;
