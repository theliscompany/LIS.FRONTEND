import { useEffect, useState } from 'react';
import { Autocomplete, Box, Button, InputLabel, NativeSelect, Skeleton, TextField, Typography, ListItem, ListItemText, IconButton, DialogActions, DialogContent, FormControl, FormControlLabel, Radio, RadioGroup } from '@mui/material';
import Grid from '@mui/material/Grid2';
import { MuiTelInput } from 'mui-tel-input';
import DeleteIcon from '@mui/icons-material/Delete';
import { inputLabelStyles, BootstrapInput, whiteButtonStyles, BootstrapDialog, BootstrapDialogTitle, buttonCloseStyles, properties } from '../../utils/misc/styles';
import { enqueueSnackbar, SnackbarProvider } from 'notistack';
import AutocompleteSearch from '../../components/shared/AutocompleteSearch';
import { useTranslation } from 'react-i18next';
import ClientSearch from '../../components/shared/ClientSearch';
import NewContact from '../../components/shared/NewContact';
import { containerPackages } from '../../utils/constants';
import useProcessStatePersistence from '../../utils/processes/useProcessStatePersistence';
import { useMsal, useAccount } from '@azure/msal-react';
import { getProduct } from '../../api/client/transport';
import { getApiAssignee, getApiHsCodeLis, getApiRequest, putApiAssigneeByRequestQuoteIdByAssigneeId } from '../../api/client/quote';

function validMail(mail: string) {
    return /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/.test(mail);
}

const NewRequest = () => {
    const [load, setLoad] = useState<boolean>(false);
    const [loadUser, setLoadUser] = useState<boolean>(true);
    const [packingType, setPackingType] = useState<string>("FCL");
    const [currentUser, setCurrentUser] = useState<any>(null);
    const [assignees, setAssignees] = useState<any>([]);
    const [containerType, setContainerType] = useState<string>("20' Dry");
    const [quantity, setQuantity] = useState<number>(1);
    // const [unitsSelection, setUnitsSelection] = useState<any>([]);
    // const [packagesSelection, setPackagesSelection] = useState<any>([]);
    const [containers, setContainers] = useState<any>(null);
    const [products, setProducts] = useState<any>(null);
    const [hscodes, setHSCodes] = useState<any>(null);
    const [valueSpecifics, setValueSpecifics] = useState<string>("hscodes");
    const [modal7, setModal7] = useState<boolean>(false);
    const [modal10, setModal10] = useState<boolean>(false);

    const { accounts } = useMsal();
    const account = useAccount(accounts[0] || {});

    const [formState, setFormState] = useProcessStatePersistence(
        account?.username || "",
        'newRequestTest',
        { 
            message: "", tags: [], phone: "", 
            email: "", departure: null, arrival: null, 
            packingType: "FCL", clientNumber: null,
            containerType: "20' Dry", quantity: 1, 
            containersSelection: [], assignedManager: "null"
        },
        null, // Optionnel, par défaut à null (pas d'expiration)
        true // Optionnel, par défaut à true (sauvegarde automatique activée)
    );
    
    const handleChangeFormState = (value: any, name: string) => {
        setFormState({ ...formState, [name]: value });
    };
    
    const { t, i18n } = useTranslation();
    
    const getProductsService = async () => {
        try {
            const response = await getProduct({query: { pageSize: 500 }});
            if (response !== null && response !== undefined) {
                setProducts(response.data);
            }    
        }
        catch (err: any) {
            console.log(err);
        }
    }
    
    const getHSCodes = async () => {
        try {
            const response = await getApiHsCodeLis();
            if (response !== null && response !== undefined) {
                setHSCodes(response.data);
            }    
        }
        catch (err: any) {
            console.log(err);
        }
    }
    
    const getContainers = async () => {
        setContainers(containerPackages);
    }

    const resetForm = () => {
        setFormState({ 
            ...formState, 
            message: "", tags: [], phone: "", 
            email: "", departure: null, arrival: null, 
            packingType: "FCL", clientNumber: null,
            containerType: "20' Dry", quantity: 1, 
            containersSelection: []
        });
    }
    
    useEffect(() => {
        getContainers();
        getProductsService(); 
        getHSCodes(); 
        getAssignees();
    }, []);

    const getAssignees = async () => {
        try {
            setLoadUser(true);
            const response: any = await getApiAssignee();
            if (response !== null && response !== undefined) {
                var aux = response.data.data.find((elm: any) => elm.email === account?.username);
                setAssignees(response.data.data);
                setCurrentUser(aux);
                setLoadUser(false);
            }
            else {
                setLoadUser(false);
            }
        }
        catch (err: any) {
            console.log(err);
            setLoadUser(false);
        }
    }

    const assignManager = async (idQuote: string) => {
        if (currentUser !== null && currentUser !== undefined && currentUser !== "") {
            try {
                const response = await putApiAssigneeByRequestQuoteIdByAssigneeId({path: {requestQuoteId: Number(idQuote), assigneeId: formState.assignedManager}});
                if (response !== null) {
                    setLoad(false);
                }
                else {
                    setLoad(false);
                }
            }
            catch (err: any) {
                console.log(err);
                setLoad(false);
            }
        }
        else {
            setLoad(false);
        }
    }

    function sendQuotationForm() {
        var tags1 = formState.tags !== null && formState.tags !== undefined && formState.tags.length !== 0 ? formState.tags.map((elm: any) => elm.productName).join(',') : null;
        var tags2 = formState.tags !== null && formState.tags !== undefined && formState.tags.length !== 0 ? formState.tags.map((elm: any) => elm.hS_Code).join(',') : null;
        if (formState.phone !== "" && formState.email !== "" && formState.arrival !== null && formState.departure !== null && formState.containersSelection.length !== 0 && formState.clientNumber !== null) {
            if (validMail(formState.email)) {
                setLoad(true);
                // var auxUnits = [];
                // if (formState.packingType === "Breakbulk/LCL") {
                //     auxUnits = packagesSelection;
                // }
                // else if (formState.packingType === "Unit RoRo") {
                //     auxUnits = unitsSelection;
                // }
                var postcode1 = formState.departure.postalCode !== null && formState.departure.postalCode !== undefined ? formState.departure.postalCode : "";
                var postcode2 = formState.arrival.postalCode !== null && formState.arrival.postalCode !== undefined ? formState.arrival.postalCode : "";
                var myHeaders = new Headers();
                myHeaders.append('Accept', '');
                myHeaders.append("Content-Type", "application/json");
                
                getApiRequest({body: {
                    email: formState.email,
                    whatsapp: formState.phone,
                    departure: formState.departure !== null && formState.departure !== undefined ? [formState.departure.city.toUpperCase(),formState.departure.country,formState.departure.latitude,formState.departure.longitude,postcode1].filter((val: any) => { return val !== "" }).join(', ') : "",
                    arrival: formState.arrival !== null && formState.arrival !== undefined ? [formState.arrival.city.toUpperCase(),formState.arrival.country,formState.arrival.latitude,formState.arrival.longitude,postcode2].filter((val: any) => { return val !== "" }).join(', ') : "",
                    cargoType: 0,
                    clientNumber: formState.clientNumber !== null ? String(formState.clientNumber.contactNumber)+", "+formState.clientNumber.contactName : null,
                    packingType: formState.packingType,
                    containers: formState.containersSelection.map((elm: any) => { return { 
                        id: containers.find((item: any) => item.packageName === elm.container).packageId, 
                        containers: elm.container, 
                        quantity: elm.quantity, 
                    } }),
                    quantity: Number(quantity),
                    detail: formState.message,
                    tags: valueSpecifics !== "hscodes" ? tags1 : tags2
                }})
                .then((response: any) => response.json())
                .then((data: any) => {
                    if (data.code === 201) {
                        resetForm();
                        enqueueSnackbar(t('requestCreatedAssigned'), { variant: "success", anchorOrigin: { horizontal: "right", vertical: "top"} });
                        if (formState.assignedManager !== null && formState.assignedManager !== "null" && formState.assignedManager !== undefined && formState.assignedManager !== "") {
                            assignManager(data.data.id);
                        }
                        else {
                            setLoad(false);
                        }
                    }
                    else {
                        setLoad(false);
                        enqueueSnackbar(t('errorHappened'), { variant: "error", anchorOrigin: { horizontal: "right", vertical: "top"} });
                    }
                })
                .catch(() => { 
                    setLoad(false);
                    enqueueSnackbar(t('errorHappenedRequest'), { variant: "error", anchorOrigin: { horizontal: "right", vertical: "top"} });
                });
            }
            else {
                enqueueSnackbar(t('emailNotValid'), { variant: "info", anchorOrigin: { horizontal: "right", vertical: "top"} });
            }
        }
        else {
            enqueueSnackbar(t('fieldsEmpty'), { variant: "info", anchorOrigin: { horizontal: "right", vertical: "top"} });
        }
    }

    return (
        <div style={{ background: "#fff", borderTopLeftRadius: 20, borderTopRightRadius: 20 }}>
            <SnackbarProvider />
            <Box py={2.5}>
                <Box>
                    <Grid container spacing={1} px={5} mt={2}>
                        <Grid size={{ xs: 9 }}>
                            <Typography variant="h5"><b>{t('createNewRequest')}</b></Typography>
                        </Grid>
                        <Grid size={{ xs: 3 }}>
                            <Button variant="contained" color="inherit" sx={{ float: "right", backgroundColor: "#fff", textTransform: "none" }} onClick={() => { setModal7(true); }} >{t('createNewContact')}</Button>
                        </Grid>
                        <Grid size={{ xs: 12, md: 6 }} mt={1}>
                            <InputLabel htmlFor="client-number" sx={inputLabelStyles}>{t('clientNumber')}</InputLabel>
                            <ClientSearch 
                                id="client-number" 
                                name="clientNumber"
                                value={formState.clientNumber} 
                                onChange={(e: any) => {
                                    setFormState({ ...formState, clientNumber: e, phone: e.phone !== null ? e.phone : "", email: e.email !== null ? e.email : "" });
                                }} 
                                fullWidth 
                            />
                        </Grid>
                        <Grid size={{ xs: 12, md: 6 }} mt={1}>
                            <InputLabel htmlFor="assigned-manager" sx={inputLabelStyles}>{t('assignedManager')}</InputLabel>
                            {
                                !loadUser ? 
                                <>
                                    <NativeSelect
                                        id="assigned-manager"
                                        value={formState.assignedManager}
                                        size="small"
                                        onChange={(e: any) => { handleChangeFormState(e.target.value, "assignedManager"); }} 
                                        input={<BootstrapInput />}
                                        fullWidth
                                    >
                                        <option value="">{t('noAgentAssigned')}</option>
                                        {
                                            assignees.map((row: any, i: number) => (
                                                <option key={"assigneeId-"+i} value={String(row.id)}>{row.name}</option>
                                            ))
                                        }
                                    </NativeSelect>
                                </> : <Skeleton sx={{ mt: 3 }} />   
                            }
                        </Grid>
                        
                        <Grid size={{ xs: 12, md: 6 }}>
                            <InputLabel htmlFor="whatsapp-phone-number" sx={inputLabelStyles}>{t('whatsappNumber')}</InputLabel>
                            <MuiTelInput 
                                id="whatsapp-phone-number" 
                                size="small"
                                value={formState.phone} 
                                onChange={(e: any) => { handleChangeFormState(e.target.value, "phone"); }} 
                                defaultCountry="CM" 
                                preferredCountries={["CM", "BE", "KE"]} 
                                fullWidth 
                                disabled
                                sx={{ mt: 1 }} 
                                {...properties}
                            />
                        </Grid>
                        <Grid size={{ xs: 12, md: 6 }}>
                            <InputLabel htmlFor="request-email" sx={inputLabelStyles}>{t('emailAddress')}</InputLabel>
                            <BootstrapInput 
                                id="request-email" 
                                type="email" 
                                value={formState.email} 
                                onChange={(e: any) => { handleChangeFormState(e.target.value, "email"); }} 
                                fullWidth
                                disabled 
                            />
                        </Grid>
                        <Grid size={{ xs: 12, md: 6 }} mt={1}>
                            <InputLabel htmlFor="departure" sx={inputLabelStyles}>{t('departure')}</InputLabel>
                            <AutocompleteSearch 
                                id="departure" 
                                value={formState.departure} 
                                onChange={(e: any) => { handleChangeFormState(e, "departure"); }} 
                                fullWidth 
                            />
                        </Grid>
                        <Grid size={{ xs: 12, md: 6 }} mt={1}>
                            <InputLabel htmlFor="arrival" sx={inputLabelStyles}>{t('arrival')}</InputLabel>
                            <AutocompleteSearch 
                                id="arrival" 
                                value={formState.arrival} 
                                onChange={(e: any) => { handleChangeFormState(e, "arrival"); }} 
                                fullWidth 
                            />
                        </Grid>
                        
                        <Grid size={{ xs: 9 }} container direction="column" alignItems="flex-start">
                            <InputLabel htmlFor="listContainers" sx={inputLabelStyles} style={{ marginBottom: "8px", position: "relative", top: "12px" }}>{t('listContainers')}</InputLabel>
                        </Grid>
                        <Grid size={{ xs: 3 }}>
                            <Button variant="contained" color="inherit" sx={whiteButtonStyles} style={{ float: "right" }} onClick={() => setModal10(true)} >{t('addContainer')}</Button>
                        </Grid>
                        <Grid size={{ xs: 12 }}>
                            {
                                formState.packingType === "FCL" ?
                                <>
                                {
                                    formState.containersSelection !== undefined && formState.containersSelection !== null && formState.containersSelection.length !== 0 && containers !== null ? 
                                    <Grid container spacing={2}>
                                    {
                                        formState.containersSelection.map((item: any, index: number) => (
                                            <Grid key={"listitem1-"+index} size={{ xs: 12, md: 4 }}>
                                                <ListItem
                                                    sx={{ border: "1px solid #e5e5e5" }}
                                                    secondaryAction={
                                                        <IconButton edge="end" onClick={() => {
                                                            handleChangeFormState(formState.containersSelection.filter((_: any, i: number) => i !== index), "containersSelection");
                                                        }}>
                                                            <DeleteIcon />
                                                        </IconButton>
                                                    }
                                                >
                                                    <ListItemText primary={
                                                        t('container')+" : "+item.container+" | "+t('quantity')+" : "+item.quantity
                                                    } />
                                                </ListItem>
                                            </Grid>
                                        ))
                                    }
                                    </Grid> : null  
                                }
                                </> : null
                            }
                        </Grid>                                
                        
                        <Grid size={{ xs: 12, md: 6 }} mt={1} mb={1}>
                            <InputLabel htmlFor="tags" sx={inputLabelStyles}>{t('specifics')}</InputLabel>
                            <FormControl>
                                <RadioGroup 
                                    row name="row-radio-buttons-group"
                                    value={valueSpecifics} onChange={(e: any) => { 
                                        setValueSpecifics(e.target.value);
                                        setFormState({ ...formState, "tags": [] });
                                    }}
                                >
                                    <FormControlLabel value="products" control={<Radio size="small" />} label="Products" />
                                    <FormControlLabel value="hscodes" control={<Radio size="small" />} label="HS Codes" />
                                </RadioGroup>
                            </FormControl>
                            <Box>
                                {
                                    valueSpecifics === "products" ? 
                                    <Box>
                                    {
                                        products !== null ?
                                        <Autocomplete
                                            multiple    
                                            disablePortal
                                            id="tags"
                                            options={products}
                                            getOptionLabel={(option: any) => { 
                                                if (option !== null && option !== undefined) {
                                                    return option.productName;
                                                }
                                                return ""; 
                                            }}
                                            disableCloseOnSelect
                                            renderInput={(params: any) => <TextField placeholder="Machinery, Household goods, etc" {...params} sx={{ textTransform: "lowercase" }} />}
                                            value={formState.tags}
                                            size="small"
                                            onChange={(_, value: any) => { 
                                                setFormState({ ...formState, "tags": value });
                                            }}
                                            sx={{ mt: 1 }}
                                            fullWidth
                                        /> : <Skeleton />
                                    }
                                    </Box> : 
                                    <Box>
                                    {
                                        hscodes !== null ?
                                        <Autocomplete
                                            multiple    
                                            disablePortal
                                            id="tags"
                                            options={hscodes}
                                            getOptionLabel={(option: any) => { 
                                                if (option !== null && option !== undefined) {
                                                    if (i18n.language === "fr") {
                                                        return option.product_description_Fr;
                                                    }
                                                    else if (i18n.language === "en") {
                                                        return option.product_description_En;
                                                    }
                                                    else {
                                                        return option.product_description_NL;
                                                    }
                                                    // return option._4_digit_categories;
                                                }
                                                return ""; 
                                            }}
                                            disableCloseOnSelect
                                            renderInput={(params: any) => <TextField placeholder="Live animals, Cereals, etc" {...params} sx={{ textTransform: "lowercase" }} />}
                                            value={formState.tags}
                                            size="small"
                                            onChange={(_, value: any) => { 
                                                setFormState({ ...formState, "tags": value });
                                            }}
                                            sx={{ mt: 1 }}
                                            fullWidth
                                        /> : <Skeleton />
                                    }
                                    </Box>
                                }
                            </Box>
                        </Grid>
                        {/* <Grid item xs={12} md={6} mt={1} mb={1}>
                            <InputLabel htmlFor="tags" sx={inputLabelStyles}>{t('specifics')}</InputLabel>
                            
                        </Grid> */}
                        <Grid size={{ xs: 12, md: 6 }} mt={.5} sx={{ display: { xs: 'none', md: 'block' } }}>
                            <InputLabel htmlFor="message" sx={inputLabelStyles}>{t('details')}</InputLabel>
                            <BootstrapInput 
                                id="message" 
                                type="text" name="message" 
                                multiline rows={2.75} 
                                value={formState.message}
                                onChange={(e: any) => { handleChangeFormState(e.target.value, "message"); }}
                                fullWidth 
                            />
                        </Grid>

                        <Grid size={{ xs: 12, md: 2 }}>
                            <Button variant="contained" color={!load ? "primary" : "info"} className="mr-3" onClick={sendQuotationForm} disabled={load === true} sx={{ textTransform: "none" }}>{t('createRequest')}</Button>
                        </Grid>
                    </Grid>
                </Box>
            </Box>

            {/* Add a new contact */}
            <BootstrapDialog open={modal7} onClose={() => setModal7(false)} maxWidth="md" fullWidth>
                <NewContact categories={[""]} closeModal={() => setModal7(false)} />
            </BootstrapDialog>

            {/* New container type */}
            <BootstrapDialog open={modal10} onClose={() => setModal10(false)} maxWidth="lg" fullWidth>
                <BootstrapDialogTitle id="custom-dialog-title" onClose={() => setModal10(false)}>
                    <b>{t('addContainer')}</b>
                </BootstrapDialogTitle>
                <DialogContent dividers>
                    <Grid container spacing={2}>
                        <Grid size={{ xs: 12, md: 2 }} mt={1}>
                            <InputLabel htmlFor="packing-type" sx={inputLabelStyles}>{t('packingType')}</InputLabel>
                            <NativeSelect
                                id="packing-type"
                                value={packingType}
                                onChange={(e: any) => { setPackingType(e.target.value); }}
                                input={<BootstrapInput />}
                                fullWidth
                            >
                                <option value="FCL">{t('fcl')}</option>
                                {/* <option value="Breakbulk/LCL">{t('breakbulk')}</option>
                                <option value="Unit RoRo">{t('roro')}</option> */}
                            </NativeSelect>
                        </Grid>

                        {
                            packingType === "FCL" ?
                            <>
                            <Grid size={{ xs: 12, md: 3 }} mt={1}>
                                <InputLabel htmlFor="container-type" sx={inputLabelStyles}>{t('containerType')}</InputLabel>
                                {
                                    containers !== null ?
                                    <NativeSelect
                                        id="container-type"
                                        value={containerType}
                                        onChange={(e: any) => { setContainerType(e.target.value) }}
                                        input={<BootstrapInput />}
                                        fullWidth
                                    >
                                        <option key={"elm1-x"} value="">{t('notDefined')}</option>
                                        {containers.map((elm: any, i: number) => (
                                            <option key={"elm1-"+i} value={elm.packageName}>{elm.packageName}</option>
                                        ))}
                                    </NativeSelect>
                                    : <Skeleton />
                                }
                            </Grid>
                            <Grid size={{ xs: 12, md: 3 }} mt={1}>
                                <InputLabel htmlFor="quantity" sx={inputLabelStyles}>{t('quantity')}</InputLabel>
                                <BootstrapInput id="quantity" type="number" inputProps={{ min: 1, max: 100 }} value={quantity} onChange={(e: any) => {setQuantity(e.target.value)}} fullWidth />
                            </Grid>
                            <Grid size={{ xs: 12, md: 4 }} mt={1}>
                                <Button 
                                    variant="contained" color="inherit" fullWidth sx={whiteButtonStyles} 
                                    style={{ marginTop: "30px", height: "42px", float: "right" }} 
                                    onClick={() => {
                                        if (containerType !== "" && quantity > 0) {
                                            handleChangeFormState([...formState.containersSelection, { container: containerType, quantity: quantity, id: containers.find((item: any) => item.packageName === containerType).packageId }], "containersSelection");
                                            setContainerType(""); setQuantity(1);
                                            setModal10(false);
                                        } 
                                        else {
                                            enqueueSnackbar("You need to select a container type and a good value for quantity.", { variant: "error", anchorOrigin: { horizontal: "right", vertical: "top"} });
                                        }
                                    }} 
                                >
                                    {t('addContainer')}
                                </Button>
                            </Grid>
                            </> : null
                        }
                    </Grid>
                </DialogContent>
                <DialogActions>
                    <Button variant="contained" onClick={() => setModal10(false)} sx={buttonCloseStyles}>{t('close')}</Button>
                </DialogActions>
            </BootstrapDialog>
        </div>
    );
}

export default NewRequest;
