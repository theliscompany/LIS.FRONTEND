import { Accordion, AccordionSummary, Typography, AccordionDetails, InputLabel, Autocomplete, TextField, Skeleton, Button, ListItem, IconButton, ListItemText, NativeSelect, Box } from '@mui/material';
import Grid from '@mui/material/Grid2';
import { MuiTelInput } from 'mui-tel-input';
import { inputLabelStyles, BootstrapInput, whiteButtonStyles, properties } from '../../utils/misc/styles';
import AutocompleteSearch from '../shared/AutocompleteSearch';
import ClientSearch from '../shared/ClientSearch';
import { Delete, ExpandMore } from '@mui/icons-material';
import { enqueueSnackbar } from 'notistack';
import { useTranslation } from 'react-i18next';
import { putApiAssigneeByRequestQuoteIdByAssigneeId, putApiAssigneeUnassignByRequestQuoteId } from '../../api/client/quote';

const RequestForm = (props: any) => {
    const { t, i18n } = useTranslation();
    
    const assignManager = async () => {
        if (props.assignedManager !== null && props.assignedManager !== undefined && props.assignedManager !== "") {
            try {
                const response = await putApiAssigneeByRequestQuoteIdByAssigneeId({path: {requestQuoteId: props.id, assigneeId: props.assignedManager}});
                if (response !== null) {
                    enqueueSnackbar(t('managerAssignedRequest'), { variant: "success", anchorOrigin: { horizontal: "right", vertical: "top"} });
                }
                else {
                    enqueueSnackbar(t('errorHappened'), { variant: "error", anchorOrigin: { horizontal: "right", vertical: "top"} });
                }
            }
            catch (err: any) {
                console.log(err);
            }
        }
        else {
            enqueueSnackbar(t('selectManagerFirst'), { variant: "error", anchorOrigin: { horizontal: "right", vertical: "top"} });
        }
    }

    const removeManager = async () => {
        try {
            const response = await putApiAssigneeUnassignByRequestQuoteId({path: {requestQuoteId: props.id}, body: []})
            if (response !== null && response !== undefined) {
                enqueueSnackbar(t('managerRemovedRequest'), { variant: "success", anchorOrigin: { horizontal: "right", vertical: "top"} });
                props.setAssignedManager("");
            }
            else {
                enqueueSnackbar(t('errorHappened'), { variant: "error", anchorOrigin: { horizontal: "right", vertical: "top"} });
            }
        }
        catch (err: any) {
            console.log(err);
        }
    }
    
    return (
        <Grid size={{ xs: 12 }}>
            <Accordion defaultExpanded sx={{ backgroundColor: "#fbfbfb" }}>
                <AccordionSummary
                    expandIcon={<ExpandMore />}
                    aria-controls="panel1b-content"
                    id="panel1b-header"
                >
                    <Typography variant="h6" sx={{ mx: 0 }}><b>{t('customerRequest')}</b></Typography>
                </AccordionSummary>
                <AccordionDetails>
                    <Grid container spacing={2} px={2}>
                        <Grid size={{ xs: 12, md: 6 }}>
                            <InputLabel htmlFor="client-number" sx={inputLabelStyles} style={{ marginTop: "8px" }}>{t('clientNumber')}</InputLabel>
                            <ClientSearch 
                                id="client-number"
                                name="clientNumber" 
                                value={props.clientNumber} 
                                onChange={props.setClientNumber}
                                disabled={!props.canEdit} 
                                callBack={(value: any) => {
                                    props.setClientNumber(value);
                                    if (props.clientNumber !== null) {
                                        props.setPhone(props.clientNumber.phone !== null ? props.clientNumber.phone : "");
                                    }
                                }} 
                                fullWidth 
                            />
                        </Grid>
                        <Grid size={{ xs: 12, md: 6 }} mt={1}>
                            <InputLabel htmlFor="departure" sx={inputLabelStyles}>{t('departure')}</InputLabel>
                            <AutocompleteSearch id="departure" value={props.departure} onChange={props.setDeparture} callBack={props.getClosestDeparture} fullWidth disabled={!props.canEdit} />
                        </Grid>
                        <Grid size={{ xs: 12, md: 6 }}>
                            <InputLabel htmlFor="whatsapp-phone-number" sx={inputLabelStyles} style={{ marginTop: "8px" }}>{t('whatsappNumber')}</InputLabel>
                            <MuiTelInput 
                                id="whatsapp-phone-number" size="small" 
                                value={props.phone} onChange={props.setPhone} 
                                defaultCountry="CM" preferredCountries={["CM", "BE", "KE"]} 
                                fullWidth sx={{ mt: 1 }} disabled={!props.canEdit} 
                                {...properties}
                            />
                        </Grid>
                        <Grid size={{ xs: 12, md: 6 }} mt={1}>
                            <InputLabel htmlFor="arrival" sx={inputLabelStyles}>{t('arrival')}</InputLabel>
                            <AutocompleteSearch id="arrival" value={props.arrival} onChange={props.setArrival} callBack={props.getClosestArrival} fullWidth disabled={!props.canEdit} />
                        </Grid>
                        <Grid size={{ xs: 12, md: 6 }}>
                            <InputLabel htmlFor="request-email" sx={inputLabelStyles}>{t('emailAddress')}</InputLabel>
                            <BootstrapInput id="request-email" type="email" value={props.email} onChange={(e: React.ChangeEvent<HTMLInputElement>) => props.setEmail(e.target.value)} fullWidth disabled={!props.canEdit} />
                        </Grid>
                        {/* <Grid size={{ xs: 12, md: 6 }}>
                            <InputLabel htmlFor="tags" sx={inputLabelStyles}>{t('specifics')}</InputLabel>
                            {
                                props.products !== null ?
                                <Autocomplete
                                    multiple    
                                    disablePortal
                                    id="tags"
                                    // placeholder="Machinery, Household goods, etc"
                                    options={props.products}
                                    getOptionLabel={(option: any) => { 
                                        if (option !== null && option !== undefined) {
                                            return option.productName !== undefined ? option.productName : option;
                                        }
                                        return ""; 
                                    }}
                                    value={props.tags}
                                    sx={{ mt: 1 }}
                                    renderInput={(params: any) => <TextField placeholder="Machinery, Household goods, etc" {...params} sx={{ textTransform: "lowercase" }} />}
                                    onChange={(e: any, value: any) => { props.setTags(value); }}
                                    fullWidth
                                    disabled={!props.canEdit}
                                /> : <Skeleton />
                            }
                        </Grid> */}
                        <Grid size={{ xs: 12, md: 6 }}>
                            <InputLabel htmlFor="tags" sx={inputLabelStyles}>{t('specifics')}</InputLabel>
                            {/* <FormControl>
                                <RadioGroup 
                                    row name="row-radio-buttons-group"
                                    value={valueSpecifics} onChange={(e: any) => { 
                                        setValueSpecifics(e.target.value);
                                        setFormState({ ...formState, "tags": [] });
                                    }}
                                >
                                    <FormControlLabel value="products" control={<Radio />} label="Products" />
                                    <FormControlLabel value="hscodes" control={<Radio />} label="HS Codes" />
                                </RadioGroup>
                            </FormControl> */}
                            <Box>
                                {
                                    props.valueSpecifics === "products" ? 
                                    <Box>
                                    {
                                        props.products !== undefined && props.products !== null ?
                                        <Autocomplete
                                            multiple    
                                            disablePortal
                                            id="tags"
                                            options={props.products}
                                            getOptionLabel={(option: any) => { 
                                                if (option !== null && option !== undefined) {
                                                    return option.productName;
                                                }
                                                return ""; 
                                            }}
                                            disableCloseOnSelect
                                            renderInput={(params: any) => <TextField placeholder="Machinery, Household goods, etc" {...params} sx={{ textTransform: "lowercase" }} />}
                                            value={props.tags}
                                            size="small"
                                            onChange={(_, value: any) => { props.setTags(value); }}
                                            sx={{ mt: 1 }}
                                            fullWidth
                                            disabled={!props.canEdit}
                                        /> : <Skeleton />
                                    }
                                    </Box> : 
                                    <Box>
                                    {
                                        props.hscodes !== undefined && props.hscodes !== null ?
                                        <Autocomplete
                                            multiple    
                                            disablePortal
                                            id="tags"
                                            options={props.hscodes}
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
                                                }
                                                return ""; 
                                            }}
                                            disableCloseOnSelect
                                            renderInput={(params: any) => <TextField placeholder="Live animals, Cereals, etc" {...params} sx={{ textTransform: "lowercase" }} />}
                                            value={props.tags}
                                            size="small"
                                            onChange={(_, value: any) => { props.setTags(value); }}
                                            sx={{ mt: 1 }}
                                            fullWidth
                                            disabled={!props.canEdit}
                                        /> : <Skeleton />
                                    }
                                    </Box>
                                }
                            </Box>
                        </Grid>
                        
                        <Grid size={{ xs: 9 }} container direction="column" alignItems="flex-start">
                            <InputLabel htmlFor="listContainers" sx={inputLabelStyles} style={{ marginBottom: "8px", position: "relative", top: "12px" }}>{t('listContainers')}</InputLabel>
                        </Grid>
                        <Grid size={{ xs: 3 }}>
                            <Button 
                                variant="contained" color="inherit" 
                                sx={whiteButtonStyles} style={{ float: "right" }} 
                                onClick={props.openModalContainer} disabled={!props.canEdit}
                            >
                                {t('addContainer')}
                            </Button>
                        </Grid>
                        <Grid size={{ xs: 12 }}>
                            {
                                props.packingType === "FCL" ?
                                <>
                                {
                                    props.containersSelection !== undefined && props.containersSelection !== null && props.containersSelection.length !== 0 && props.containers !== null ? 
                                    <Grid container spacing={2}>
                                    {
                                        props.containersSelection.map((item: any, index: number) => (
                                            <Grid key={"listitem1-"+index} size={{ xs: 12, md: 4 }}>
                                                <ListItem
                                                    sx={{ border: "1px solid #e5e5e5" }}
                                                    secondaryAction={
                                                        <IconButton 
                                                            edge="end"
                                                            disabled={!props.canEdit}  
                                                            onClick={() => {
                                                                props.setContainersSelection((prevItems: any) => prevItems.filter((_: any, i: number) => i !== index));
                                                            }}
                                                        >
                                                            <Delete />
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
                        
                        <Grid size={{ xs: 12, md: 6 }} mt={.5} sx={{ display: { xs: 'none', md: 'block' } }}>
                            <InputLabel htmlFor="request-message" sx={inputLabelStyles}>{t('details')}</InputLabel>
                            <BootstrapInput id="request-message" type="text" multiline rows={3.5} value={props.message} onChange={(e: React.ChangeEvent<HTMLInputElement>) => props.setMessage(e.target.value)} fullWidth disabled={!props.canEdit} />
                        </Grid>
                        <Grid size={{ xs: 12, md: 6 }} mt={1}>
                            <InputLabel htmlFor="assigned-manager" sx={inputLabelStyles}>{t('assignedManager')}</InputLabel>
                            {
                                !props.loadAssignees && props.assignees !== null ? 
                                <>
                                    <NativeSelect
                                        id="assigned-manager"
                                        value={props.assignedManager}
                                        onChange={(e: any) => { props.setAssignedManager(e.target.value); }}
                                        input={<BootstrapInput />}
                                        fullWidth
                                        disabled={!props.canEdit}
                                    >
                                        <option value="">{t('noAgentAssigned')}</option>
                                        {
                                            props.assignees.map((row: any, i: number) => (
                                                <option key={"assigneeId-"+i} value={String(row.id)}>{row.name}</option>
                                            ))
                                        }
                                    </NativeSelect>
                                    <Button 
                                        variant="contained" color="inherit" 
                                        sx={whiteButtonStyles} style={{ marginRight: "10px" }} 
                                        onClick={assignManager} disabled={!props.canEdit}
                                    >
                                        {t('updateManager')}
                                    </Button>
                                    <Button 
                                        variant="contained" color="inherit" 
                                        sx={whiteButtonStyles} 
                                        onClick={removeManager} disabled={!props.canEdit}
                                    >
                                        {t('removeManager')}
                                    </Button>
                                </> : <Skeleton sx={{ mt: 3 }} />   
                            }
                        </Grid>
                    </Grid>                                
                </AccordionDetails>
            </Accordion>
        </Grid>
    );
}

export default RequestForm;
