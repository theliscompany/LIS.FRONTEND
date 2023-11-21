import { useEffect, useRef, useState } from 'react';
import { BootstrapDialogTitle, BootstrapInput, buttonCloseStyles, datetimeStyles, inputLabelStyles, whiteButtonStyles } from '../../utils/misc/styles';
import { Autocomplete, Box, Button, DialogActions, DialogContent, Grid, IconButton, InputLabel, ListItem, ListItemText, NativeSelect, Skeleton, TextField, ToggleButton, ToggleButtonGroup, Typography } from '@mui/material';
import { useAuthorizedBackendApi } from '../../api/api';
import { useTranslation } from 'react-i18next';
import { enqueueSnackbar } from 'notistack';
import { BackendService } from '../../utils/services/fetch';
import { protectedResources } from '../../config/authConfig';
import { useAccount, useMsal } from '@azure/msal-react';
import { MuiChipsInputChip } from 'mui-chips-input';
import { Dayjs } from 'dayjs';
import AutocompleteSearch from '../shared/AutocompleteSearch';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import DeleteIcon from '@mui/icons-material/Delete';
import StarterKit from '@tiptap/starter-kit';
import { RichTextEditor, MenuControlsContainer, MenuSelectHeading, MenuDivider, MenuButtonBold, MenuButtonItalic, MenuButtonStrikethrough, MenuButtonOrderedList, MenuButtonBulletedList, MenuSelectTextAlign, MenuButtonEditLink, MenuButtonHorizontalRule, MenuButtonUndo, MenuButtonRedo, type RichTextEditorRef, } from 'mui-tiptap';
import './../../App.css';

function displayContainers(value: any) {
    var aux = value.map((elm: any) => '<li>'+elm.quantity+"x"+elm.container+'</li>').join('');
    return '<ul>'+aux+'</ul>';
}

function RequestPriceRequest(props: any) {
    const [subject, setSubject] = useState<string>(props.portLoading !== null && props.portDischarge !== null ? props.portLoading.portName+" - "+props.portDischarge.portName+" / RATE REQUEST" : "");
    const [commodities, setCommodities] = useState<MuiChipsInputChip[]>(props.commodities);
    const [portLoading, setPortLoading] = useState<any>(props.portLoading);
    const [portDischarge, setPortDischarge] = useState<any>(props.portDischarge);
    const [estimatedTimeDeparture, setEstimatedTimeDeparture] = useState<Dayjs | null>(null);
    const [isRegularTrafficType, setIsRegularTrafficType] = useState<boolean>(true);
    
    const [containerType, setContainerType] = useState<string>("20' Dry");
    const [quantity, setQuantity] = useState<number>(1);
    const [containersSelection, setContainersSelection] = useState<any>(props.containersSelection);
    
    const [mailLanguage, setMailLanguage] = useState<string>("fr");

    const rteRef = useRef<RichTextEditorRef>(null);
    

    const { accounts } = useMsal();
    const account = useAccount(accounts[0] || {});

    const context = useAuthorizedBackendApi();
    const { t } = useTranslation();
    
    const sendPriceRequestFCL = async () => {
        console.log("You got me in love again!");
    }

    const resetEditor = () => {
        if (mailLanguage === "fr") {
            rteRef.current?.editor?.commands.setContent(
            `<div>
            <p>Bonjour,</p>
            <p>Veuillez revenir avec votre meilleure offre pour l'expédition suivante :</p>
            <p>Port de chargement : ${portLoading !== null ? portLoading.portName : ""}</p>
            <p>Port de déchargement : ${portDischarge !== null ? portDischarge.portName : ""}</p>
            <p>Type et quantité d'emballage : ${displayContainers(containersSelection)}</p>
            <p>Commodités : ${commodities.map((elm: any) => elm.productName).join(', ')}</p>
            <p>Date prévue de départ : ${estimatedTimeDeparture !== null ? estimatedTimeDeparture.toDate().toLocaleDateString().slice(0,10) : ""}</p>
            <p></p>
            <p>Cordialement</p>
            <p>Jeffry COOLS</p>
            </div>`);
        }
        else {
            rteRef.current?.editor?.commands.setContent(
            `<div>
            <p>Good afternoon,</p>
            <p>Please revert with your best offer for following shipment :</p>
            <p>Port of loading : ${portLoading !== null ? portLoading.portName : ""}</p>
            <p>Port of discharge : ${portDischarge !== null ? portDischarge.portName : ""}</p>
            <p>Packing type and quantity : ${displayContainers(containersSelection)}</p>
            <p>Commodities : ${commodities.map((elm: any) => elm.productName).join(',')}</p>
            <p>ETD : ${estimatedTimeDeparture !== null ? estimatedTimeDeparture.toDate().toLocaleDateString().slice(0,10) : ""}</p>
            <p></p>
            <p>Thanks/regards</p>
            <p>Jeffry COOLS</p>
            </div>`);
        }
    }

    useEffect(() => {
        resetEditor();
    }, [commodities, portLoading, portDischarge, containersSelection, estimatedTimeDeparture]);

    return (
        <>
            <BootstrapDialogTitle id="custom-dialog-title6" onClose={props.closeModal}>
                <b>{t('priceRequestFCL')}</b>
            </BootstrapDialogTitle>
            <DialogContent dividers>
                <Grid container spacing={2} px={2}>
                    <Grid item xs={12} md={6}>
                        <Grid container spacing={1}>
                            <Grid item xs={12} mt={1}>
                                <InputLabel htmlFor="subject" sx={inputLabelStyles}>{t('subject')}</InputLabel>
                                <BootstrapInput id="subject" type="email" value={subject} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSubject(e.target.value)} fullWidth />
                            </Grid>
                            <Grid item xs={12} mt={1}>
                                <InputLabel htmlFor="commodities" sx={inputLabelStyles}>{t('commodities')}</InputLabel>
                                {
                                    props.products !== null ?
                                    <Autocomplete
                                        multiple    
                                        disablePortal
                                        id="commodities"
                                        placeholder="Machinery, Household goods, etc"
                                        options={props.products}
                                        getOptionLabel={(option: any) => { 
                                            if (option !== null && option !== undefined) {
                                                return option.productName !== undefined ? option.productName : option;
                                            }
                                            return ""; 
                                        }}
                                        value={commodities}
                                        sx={{ mt: 1 }}
                                        renderInput={(params: any) => <TextField {...params} sx={{ textTransform: "lowercase" }} />}
                                        onChange={(e: any, value: any) => { setCommodities(value); }}
                                        fullWidth
                                    /> : <Skeleton />
                                }
                            </Grid>
                            <Grid item xs={12} md={6} mt={1}>
                                <InputLabel htmlFor="portLoading" sx={inputLabelStyles}>{t('departurePort')}</InputLabel>
                                {
                                    props.ports !== null ?
                                    <Autocomplete
                                        disablePortal
                                        id="portLoading"
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
                                        // disabled={true}
                                        sx={{ mt: 1 }}
                                        renderInput={(params: any) => <TextField {...params} />}
                                        onChange={(e: any, value: any) => { 
                                            setPortLoading(value); 
                                            if (portDischarge !== null && portDischarge !== undefined) {
                                                if (value !== null && value !== undefined) {
                                                    setSubject(value.portName+" - "+portDischarge.portName+" / RATE REQUEST"); 
                                                }
                                                else {
                                                    setSubject(" - "+portDischarge.portName+" / RATE REQUEST"); 
                                                }
                                            }
                                            else {
                                                setSubject("");
                                            }
                                        }}
                                        fullWidth
                                    /> : <Skeleton />
                                }
                            </Grid>
                            <Grid item xs={12} md={6} mt={1}>
                                <InputLabel htmlFor="portDischarge" sx={inputLabelStyles}>{t('destinationPort')}</InputLabel>
                                {
                                    props.ports !== null ?
                                    <Autocomplete
                                        disablePortal
                                        id="portDischarge"
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
                                        // disabled={true}
                                        sx={{ mt: 1 }}
                                        renderInput={(params: any) => <TextField {...params} />}
                                        onChange={(e: any, value: any) => { 
                                            setPortDischarge(value);
                                            if (portLoading !== null && portLoading !== undefined) {
                                                if (value !== null && value !== undefined) {
                                                    setSubject(portLoading.portName+" - "+value.portName+" / RATE REQUEST");  
                                                }
                                                else {
                                                    setSubject(portLoading.portName+" - "+" / RATE REQUEST");  
                                                }
                                            }
                                            else {
                                                setSubject("");
                                            }
                                        }}
                                        fullWidth
                                    /> : <Skeleton />
                                }
                            </Grid>
                            <Grid item xs={12} mt={1}>
                                <InputLabel htmlFor="etd" sx={inputLabelStyles}>{t('etd')}</InputLabel>
                                <LocalizationProvider dateAdapter={AdapterDayjs}>
                                    <DatePicker 
                                        value={estimatedTimeDeparture}
                                        format='dd/mm/yyyy' 
                                        onChange={(value: any) => { setEstimatedTimeDeparture(value) }}
                                        slotProps={{ textField: { id: "etd", fullWidth: true, sx: datetimeStyles }, inputAdornment: { sx: { position: "relative", right: "11.5px" } } }}
                                    />
                                </LocalizationProvider>
                            </Grid>
                            <Grid item xs={12} md={4} mt={1}>
                                <InputLabel htmlFor="container-type" sx={inputLabelStyles}>{t('containerType')}</InputLabel>
                                {
                                    props.containers !== null ?
                                    <NativeSelect
                                        id="container-type"
                                        value={containerType}
                                        onChange={(e: any) => { setContainerType(e.target.value) }}
                                        input={<BootstrapInput />}
                                        fullWidth
                                    >
                                        <option key={"elm1-x"} value="">{t('notDefined')}</option>
                                        {props.containers.map((elm: any, i: number) => (
                                            <option key={"elm1-"+i} value={elm.packageName}>{elm.packageName}</option>
                                        ))}
                                    </NativeSelect>
                                    : <Skeleton />
                                }
                            </Grid>
                            <Grid item xs={12} md={4} mt={1}>
                                <InputLabel htmlFor="quantity" sx={inputLabelStyles}>{t('quantity')}</InputLabel>
                                <BootstrapInput id="quantity" type="number" inputProps={{ min: 1, max: 100 }} value={quantity} onChange={(e: any) => {setQuantity(e.target.value)}} fullWidth />
                            </Grid>
                            <Grid item xs={12} md={4} mt={1}>
                                <Button 
                                    variant="contained" color="inherit" fullWidth sx={whiteButtonStyles} 
                                    style={{ marginTop: "30px", height: "42px", float: "right" }} 
                                    onClick={() => {
                                        if (containerType !== "" && quantity > 0) {
                                            setContainersSelection((prevItems: any) => [...prevItems, { container: containerType, quantity: quantity, id: props.containers.find((item: any) => item.packageName === containerType).packageId }]);
                                            setContainerType(""); setQuantity(1);
                                        } 
                                        else {
                                            enqueueSnackbar("You need to select a container type and a good value for quantity.", { variant: "error", anchorOrigin: { horizontal: "right", vertical: "top"} });
                                        }
                                    }} 
                                >
                                    {t('addContainer')}
                                </Button>
                            </Grid>
                            <Grid item xs={12}>
                                {
                                    containersSelection !== undefined && containersSelection !== null && containersSelection.length !== 0 && props.containers !== null ? 
                                        <Grid container spacing={2}>
                                            {
                                                containersSelection.map((item: any, index: number) => (
                                                    <Grid key={"listitem1-"+index} item xs={12} md={6}>
                                                        <ListItem
                                                            sx={{ border: "1px solid #e5e5e5" }}
                                                            secondaryAction={
                                                                <IconButton edge="end" onClick={() => {
                                                                    setContainersSelection((prevItems: any) => prevItems.filter((item: any, i: number) => i !== index));
                                                                }}>
                                                                    <DeleteIcon />
                                                                </IconButton>
                                                            }
                                                        >
                                                            <ListItemText primary={
                                                                item.container+" x "+item.quantity
                                                            } />
                                                        </ListItem>
                                                    </Grid>
                                                ))
                                            }
                                        </Grid>
                                    : null  
                                }
                            </Grid>
                            <Grid item xs={12} mt={1}>
                                
                            </Grid>
                        </Grid>
                    </Grid>
                    <Grid item xs={12} md={6} mt={1}>
                        <Grid container>
                            <Grid item xs={12}>
                                <InputLabel htmlFor="mailLanguage" sx={inputLabelStyles}>{t('mailLanguage')}</InputLabel>
                                <ToggleButtonGroup
                                    color="primary"
                                    value={mailLanguage}
                                    exclusive
                                    // size="small"
                                    onChange={(event: React.MouseEvent<HTMLElement>, newValue: string,) => { 
                                        setMailLanguage(newValue); 
                                        if (newValue === "fr") {
                                            rteRef.current?.editor?.commands.setContent(
                                            `<div>
                                            <p>Bonjour,</p>
                                            <p>Veuillez revenir avec votre meilleure offre pour l'expédition suivante :</p>
                                            <p>Port de chargement : ${portLoading !== null ? portLoading.portName : ""}</p>
                                            <p>Port de déchargement : ${portDischarge !== null ? portDischarge.portName : ""}</p>
                                            <p>Type et quantité d'emballage : ${displayContainers(containersSelection)}</p>
                                            <p>Commodités : ${commodities.map((elm: any) => elm.productName).join(',')}</p>
                                            <p>Date prévue de départ : ${estimatedTimeDeparture !== null ? estimatedTimeDeparture.toDate().toLocaleDateString().slice(0,10) : ""}</p>
                                            <p></p>
                                            <p>Cordialement</p>
                                            <p>Jeffry COOLS</p>
                                            </div>`);
                                        }
                                        else {
                                            rteRef.current?.editor?.commands.setContent(
                                            `<div>
                                            <p>Good afternoon,</p>
                                            <p>Please revert with your best offer for following shipment :</p>
                                            <p>Port of loading : ${portLoading !== null ? portLoading.portName : ""}</p>
                                            <p>Port of discharge : ${portDischarge !== null ? portDischarge.portName : ""}</p>
                                            <p>Packing type and quantity : ${displayContainers(containersSelection)}</p>
                                            <p>Commodities : ${commodities.map((elm: any) => elm.productName).join(',')}</p>
                                            <p>ETD : ${estimatedTimeDeparture !== null ? estimatedTimeDeparture.toDate().toLocaleDateString().slice(0,10) : ""}</p>
                                            <p></p>
                                            <p>Thanks/regards</p>
                                            <p>Jeffry COOLS</p>
                                            </div>`);
                                        }
                                    }}
                                    aria-label="Platform"
                                    fullWidth
                                    sx={{ mt: 1 }}
                                >
                                    <ToggleButton value="fr"><img src="/assets/img/flags/flag-fr.png" style={{ width: "12px", marginRight: "6px" }} alt="flag english" /> Français</ToggleButton>
                                    <ToggleButton value="en"><img src="/assets/img/flags/flag-en.png" style={{ width: "12px", marginRight: "6px" }} alt="flag english" /> English</ToggleButton>
                                </ToggleButtonGroup>
                            </Grid>
                            <Grid item xs={12} mt={1.5}>
                                <InputLabel htmlFor="details" sx={inputLabelStyles}>{t('detailsOffer')}</InputLabel>
                                <Box sx={{ mt: 1 }}>
                                    <RichTextEditor
                                        ref={rteRef}
                                        extensions={[StarterKit]}
                                        content={
                                            `<div>
                                            <p>Bonjour,</p>
                                            <p>Veuillez revenir avec votre meilleure offre pour l'expédition suivante :</p>
                                            <p>Port de chargement : ${portLoading !== null ? portLoading.portName : ""}</p>
                                            <p>Port de déchargement : ${portDischarge !== null ? portDischarge.portName : ""}</p>
                                            <p>Type et quantité d'emballage : ${displayContainers(containersSelection)}</p>
                                            <p>Commodités : ${commodities.map((elm: any) => elm.productName).join(',')}</p>
                                            <p>Date prévue de départ : ${estimatedTimeDeparture !== null ? estimatedTimeDeparture.toDate().toLocaleDateString().slice(0,10) : ""}</p>
                                            <p></p>
                                            <p>Cordialement</p>
                                            <p>Jeffry COOLS</p>
                                            </div>`
                                        }
                                        renderControls={() => (
                                        <MenuControlsContainer>
                                            <MenuSelectHeading />
                                            <MenuDivider />
                                            <MenuButtonBold />
.                                            <MenuButtonItalic />
                                            <MenuButtonStrikethrough />
                                            <MenuButtonOrderedList />
                                            <MenuButtonBulletedList />
                                            <MenuSelectTextAlign />
                                            <MenuButtonEditLink />
                                            <MenuButtonHorizontalRule />
                                            <MenuButtonUndo />
                                            <MenuButtonRedo />
                                        </MenuControlsContainer>
                                        )}
                                    />
                                </Box>
                            </Grid>
                        </Grid>
                    </Grid>
                </Grid>
            </DialogContent>
            <DialogActions>
                <Button variant="contained" color="primary" className="mr-3" onClick={sendPriceRequestFCL} sx={{ textTransform: "none" }}>{t('send')}</Button>
                <Button variant="contained" onClick={props.closeModal} sx={buttonCloseStyles}>{t('close')}</Button>
            </DialogActions>
        </>
    );
}

export default RequestPriceRequest;
