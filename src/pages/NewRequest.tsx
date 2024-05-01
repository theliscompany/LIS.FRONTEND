import { useEffect, useState } from 'react';
import { Autocomplete, Box, Button, Grid, InputLabel, NativeSelect, Skeleton, TextField, Typography, ListItem, ListItemText, IconButton, DialogActions, DialogContent } from '@mui/material';
import { MuiTelInput } from 'mui-tel-input';
import DeleteIcon from '@mui/icons-material/Delete';
import { inputLabelStyles, BootstrapInput, whiteButtonStyles, BootstrapDialog, BootstrapDialogTitle, buttonCloseStyles } from '../utils/misc/styles';
import { enqueueSnackbar, SnackbarProvider } from 'notistack';
import { loginRequest, protectedResources, transportRequest } from '../config/authConfig';
import { useAuthorizedBackendApi } from '../api/api';
import { BackendService } from '../utils/services/fetch';
import { useAccount, useMsal } from '@azure/msal-react';
import AutocompleteSearch from '../components/shared/AutocompleteSearch';
import { useTranslation } from 'react-i18next';
import ClientSearch from '../components/shared/ClientSearch';
import NewContact from '../components/editRequestPage/NewContact';
import { containerPackages } from '../utils/constants';
import useProcessStatePersistence from '../utils/processes/useProcessStatePersistence';
import { getAccessToken } from '../utils/functions';

function validMail(mail: string) {
    return /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/.test(mail);
}

let packingOptions = ["Unit", "Bundle", "Bag", "Pallet", "Carton", "Lot", "Crate"];

function NewRequest(props: any) {
    const [load, setLoad] = useState<boolean>(false);
    const [loadUser, setLoadUser] = useState<boolean>(true);
    const [packingType, setPackingType] = useState<string>("FCL");
    const [currentUser, setCurrentUser] = useState<any>(null);
    const [assignees, setAssignees] = useState<any>(null);
    
    const [containerType, setContainerType] = useState<string>("20' Dry");
    const [quantity, setQuantity] = useState<number>(1);
    
    const [unitsSelection, setUnitsSelection] = useState<any>([]);
    const [packagesSelection, setPackagesSelection] = useState<any>([]);
    
    const [containers, setContainers] = useState<any>(null);
    const [products, setProducts] = useState<any>(null);
    
    const [modal7, setModal7] = useState<boolean>(false);
    const [modal10, setModal10] = useState<boolean>(false);

    const [tempToken, setTempToken] = useState<string>("");

    const { instance, accounts } = useMsal();
    const account = useAccount(accounts[0] || {});
    
    const context = useAuthorizedBackendApi();

    const [formState, setFormState] = useProcessStatePersistence(
        account?.name,
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
    
    const { t } = useTranslation();
    
    const getProducts = async () => {
        if (account && instance && context) {
            // const token = await getAccessToken(instance, transportRequest, account);            
            const response = await (context?.service as BackendService<any>).getWithToken(protectedResources.apiLisTransport.endPoint+"/Product?pageSize=500", context.tokenTransport);
            console.log(response);
            if (response !== null && response !== undefined) {
                setProducts(response);
            }  
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
        getProducts(); 
        getAssignees();
    }, [instance, account, context]);

    const getAssignees = async () => {
        if (account && instance && context) {
            // const token = await getAccessToken(instance, loginRequest, account);
            // setTempToken(token);

            try {
                setLoadUser(true);
                const response = await (context?.service as BackendService<any>).getWithToken(protectedResources.apiLisQuotes.endPoint+"/Assignee", context.tokenLogin);
                if (response !== null && response.code !== undefined) {
                    if (response.code === 200) {
                        var aux = response.data.find((elm: any) => elm.email === account?.username);
                        setAssignees(response.data);
                        setCurrentUser(aux);
                        if (aux !== null && aux !== undefined && aux !== "") {
                            // setAssignedManager(aux.id);
                            // handleChangeFormState(aux.id, "assignedManager");
                        }
                        setLoadUser(false);
                    }
                    else {
                        setLoadUser(false);
                    }
                }
                else {
                    setLoadUser(false);
                }
            }
            catch (err: any) {
                setLoadUser(false);
                console.log(err);
            }
        }
    }

    const assignManager = async (idQuote: string) => {
        if (currentUser !== null && currentUser !== undefined && currentUser !== "") {
            if (account && instance && context) {
                const response = await (context?.service as BackendService<any>).putWithToken(protectedResources.apiLisQuotes.endPoint+"/Assignee/"+idQuote+"/"+formState.assignedManager, [], context.tokenLogin);
                if (response !== null) {
                    setLoad(false);
                }
                else {
                    setLoad(false);
                }
            }
        }
        else {
            setLoad(false);
        }
    }

    function sendQuotationForm() {
        if (formState.phone !== "" && formState.email !== "" && formState.arrival !== null && formState.departure !== null && formState.containersSelection.length !== 0 && formState.clientNumber !== null) {
            if (validMail(formState.email)) {
                setLoad(true);
                var auxUnits = [];
                if (formState.packingType === "Breakbulk/LCL") {
                    auxUnits = packagesSelection;
                }
                else if (formState.packingType === "Unit RoRo") {
                    auxUnits = unitsSelection;
                }

                var postcode1 = formState.departure.postalCode !== null && formState.departure.postalCode !== undefined ? formState.departure.postalCode : "";
                var postcode2 = formState.arrival.postalCode !== null && formState.arrival.postalCode !== undefined ? formState.arrival.postalCode : "";
                
                var myHeaders = new Headers();
                myHeaders.append('Accept', '');
                myHeaders.append("Content-Type", "application/json");
                fetch(protectedResources.apiLisQuotes.endPoint+"/Request", {
                    method: "POST",
                    body: JSON.stringify({ 
                        email: formState.email,
                        whatsapp: formState.phone,
                        departure: formState.departure !== null && formState.departure !== undefined ? [formState.departure.city.toUpperCase(),formState.departure.country,formState.departure.latitude,formState.departure.longitude,postcode1].filter((val: any) => { return val !== "" }).join(', ') : "",
                        arrival: formState.arrival !== null && formState.arrival !== undefined ? [formState.arrival.city.toUpperCase(),formState.arrival.country,formState.arrival.latitude,formState.arrival.longitude,postcode2].filter((val: any) => { return val !== "" }).join(', ') : "",
                        cargoType: 0,
                        clientNumber: formState.clientNumber !== null ? String(formState.clientNumber.contactNumber)+", "+formState.clientNumber.contactName : null,
                        packingType: formState.packingType,
                        containers: formState.containersSelection.map((elm: any, i: number) => { return { 
                            id: containers.find((item: any) => item.packageName === elm.container).packageId, 
                            containers: elm.container, 
                            quantity: elm.quantity, 
                        } }),
                        units: auxUnits.map((elm: any, i: number) => { return { 
                            id: i, 
                            name: elm.name, 
                            weight: elm.weight, 
                            dimension: elm.dimensions, 
                            quantity: elm.quantity, 
                        } }),
                        quantity: Number(quantity),
                        detail: formState.message,
                        tags: formState.tags.length !== 0 ? formState.tags.map((elm: any) => elm.productName).join(',') : null,
                    }),
                    headers: myHeaders
                })
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
                .catch(error => { 
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
                        <Grid item xs={9}>
                            <Typography variant="h5"><b>{t('createNewRequest')}</b></Typography>
                        </Grid>
                        <Grid item xs={3}>
                            <Button variant="contained" color="inherit" sx={{ float: "right", backgroundColor: "#fff", textTransform: "none" }} onClick={() => { setModal7(true); }} >{t('createNewContact')}</Button>
                        </Grid>
                        
                        <Grid item xs={12} md={6} mt={1}>
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
                        <Grid item xs={12} md={6} mt={1}>
                            <InputLabel htmlFor="assigned-manager" sx={inputLabelStyles}>{t('assignedManager')}</InputLabel>
                            {
                                !loadUser ? 
                                <>
                                    <NativeSelect
                                        id="assigned-manager"
                                        value={formState.assignedManager}
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
                        
                        <Grid item xs={12} md={6}>
                            <InputLabel htmlFor="whatsapp-phone-number" sx={inputLabelStyles}>{t('whatsappNumber')}</InputLabel>
                            <MuiTelInput 
                                id="whatsapp-phone-number" 
                                value={formState.phone} 
                                onChange={(e: any) => { handleChangeFormState(e.target.value, "phone"); }} 
                                defaultCountry="CM" 
                                preferredCountries={["CM", "BE", "KE"]} 
                                fullWidth 
                                disabled
                                sx={{ mt: 1 }} 
                            />
                        </Grid>
                        <Grid item xs={12} md={6}>
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
                        <Grid item xs={12} md={6} mt={1}>
                            <InputLabel htmlFor="departure" sx={inputLabelStyles}>{t('departure')}</InputLabel>
                            <AutocompleteSearch 
                                id="departure" 
                                value={formState.departure} 
                                onChange={(e: any) => { handleChangeFormState(e, "departure"); }} 
                                fullWidth 
                            />
                        </Grid>
                        <Grid item xs={12} md={6} mt={1}>
                            <InputLabel htmlFor="arrival" sx={inputLabelStyles}>{t('arrival')}</InputLabel>
                            <AutocompleteSearch 
                                id="arrival" 
                                value={formState.arrival} 
                                onChange={(e: any) => { handleChangeFormState(e, "arrival"); }} 
                                fullWidth 
                            />
                        </Grid>
                        
                        <Grid item xs={9} container direction="column" alignItems="flex-start">
                            <InputLabel htmlFor="listContainers" sx={inputLabelStyles} style={{ marginBottom: "8px", position: "relative", top: "12px" }}>{t('listContainers')}</InputLabel>
                        </Grid>
                        <Grid item xs={3}>
                            <Button variant="contained" color="inherit" sx={whiteButtonStyles} style={{ float: "right" }} onClick={() => setModal10(true)} >{t('addContainer')}</Button>
                        </Grid>
                        <Grid item xs={12}>
                            {
                                formState.packingType === "FCL" ?
                                <>
                                {
                                    formState.containersSelection !== undefined && formState.containersSelection !== null && formState.containersSelection.length !== 0 && containers !== null ? 
                                    <Grid container spacing={2}>
                                    {
                                        formState.containersSelection.map((item: any, index: number) => (
                                            <Grid key={"listitem1-"+index} item xs={12} md={4}>
                                                <ListItem
                                                    sx={{ border: "1px solid #e5e5e5" }}
                                                    secondaryAction={
                                                        <IconButton edge="end" onClick={() => {
                                                            // setContainersSelection((prevItems: any) => prevItems.filter((item: any, i: number) => i !== index));
                                                            handleChangeFormState(formState.containersSelection.filter((item: any, i: number) => i !== index), "containersSelection");
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
                        
                        
                        <Grid item xs={12} md={6} mt={1} mb={1}>
                            <InputLabel htmlFor="tags" sx={inputLabelStyles}>{t('specifics')}</InputLabel>
                            {
                                products !== null ?
                                <Autocomplete
                                    multiple    
                                    disablePortal
                                    id="tags"
                                    placeholder="Machinery, Household goods, etc"
                                    options={products}
                                    getOptionLabel={(option: any) => { 
                                        if (option !== null && option !== undefined) {
                                            return option.productName;
                                        }
                                        return ""; 
                                    }}
                                    renderInput={(params: any) => <TextField {...params} sx={{ textTransform: "lowercase" }} />}
                                    value={formState.tags}
                                    onChange={(e: any, value: any) => { handleChangeFormState(value, "tags"); }}
                                    sx={{ mt: 1 }}
                                    fullWidth
                                /> : <Skeleton />
                            }
                        </Grid>
                        <Grid item xs={12} md={6} mt={.5} sx={{ display: { xs: 'none', md: 'block' } }}>
                            <InputLabel htmlFor="message" sx={inputLabelStyles}>{t('details')}</InputLabel>
                            <BootstrapInput 
                                id="message" 
                                type="text" name="message" 
                                multiline rows={3.5} 
                                value={formState.message}
                                onChange={(e: any) => { handleChangeFormState(e.target.value, "message"); }}
                                fullWidth 
                            />
                        </Grid>

                        <Grid item xs={12} md={2}>
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
            <BootstrapDialog
                onClose={() => setModal10(false)}
                aria-labelledby="custom-dialog-title10"
                open={modal10}
                maxWidth="lg"
                fullWidth
            >
                <BootstrapDialogTitle id="custom-dialog-title" onClose={() => setModal10(false)}>
                    <b>Add a container</b>
                </BootstrapDialogTitle>
                <DialogContent dividers>
                    <Grid container spacing={2}>
                        <Grid item xs={12} md={2} mt={1}>
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
                            <Grid item xs={12} md={3} mt={1}>
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
                            <Grid item xs={12} md={3} mt={1}>
                                <InputLabel htmlFor="quantity" sx={inputLabelStyles}>{t('quantity')}</InputLabel>
                                <BootstrapInput id="quantity" type="number" inputProps={{ min: 1, max: 100 }} value={quantity} onChange={(e: any) => {setQuantity(e.target.value)}} fullWidth />
                            </Grid>
                            <Grid item xs={12} md={4} mt={1}>
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
