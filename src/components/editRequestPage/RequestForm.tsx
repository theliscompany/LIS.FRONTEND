import { Grid, Accordion, AccordionSummary, Typography, AccordionDetails, InputLabel, Autocomplete, TextField, Skeleton, Button, ListItem, IconButton, ListItemText, NativeSelect } from '@mui/material';
// import { t } from 'i18next';
import { MuiTelInput } from 'mui-tel-input';
import { inputLabelStyles, BootstrapInput, whiteButtonStyles } from '../../utils/misc/styles';
import AutocompleteSearch from '../shared/AutocompleteSearch';
import ClientSearch from '../shared/ClientSearch';
import { Delete, ExpandMore } from '@mui/icons-material';
import { enqueueSnackbar } from 'notistack';
import { protectedResources } from '../../config/authConfig';
import { BackendService } from '../../utils/services/fetch';
import { useTranslation } from 'react-i18next';
import { useAccount, useMsal } from '@azure/msal-react';
import { useAuthorizedBackendApi } from '../../api/api';

function RequestForm(props: any) {
    const { t } = useTranslation();
    
    const { instance, accounts } = useMsal();
	const account = useAccount(accounts[0] || {});
	const context = useAuthorizedBackendApi();
	
    const assignManager = async () => {
        if (props.assignedManager !== null && props.assignedManager !== undefined && props.assignedManager !== "") {
            if (account && instance && context) {
                const response = await (context?.service as BackendService<any>).putWithToken(protectedResources.apiLisQuotes.endPoint+"/Assignee/"+props.id+"/"+props.assignedManager, [], context.tokenLogin);
                if (response !== null) {
                    enqueueSnackbar(t('managerAssignedRequest'), { variant: "success", anchorOrigin: { horizontal: "right", vertical: "top"} });
                }
                else {
                    enqueueSnackbar(t('errorHappened'), { variant: "error", anchorOrigin: { horizontal: "right", vertical: "top"} });
                }
            }
        }
        else {
            enqueueSnackbar(t('selectManagerFirst'), { variant: "error", anchorOrigin: { horizontal: "right", vertical: "top"} });
        }
    }

    const removeManager = async () => {
        if (account && instance && context) {
            const response = await (context?.service as BackendService<any>).putWithToken(protectedResources.apiLisQuotes.endPoint+"/Assignee/unassign/"+props.id, [], context.tokenLogin);
            if (response !== null) {
                enqueueSnackbar(t('managerRemovedRequest'), { variant: "success", anchorOrigin: { horizontal: "right", vertical: "top"} });
                props.setAssignedManager("");
            }
            else {
                enqueueSnackbar(t('errorHappened'), { variant: "error", anchorOrigin: { horizontal: "right", vertical: "top"} });
            }
        }
    }
    
    return (
        <Grid item xs={12}>
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
                        <Grid item xs={12} md={6}>
                            <InputLabel htmlFor="client-number" sx={inputLabelStyles} style={{ marginTop: "8px" }}>{t('clientNumber')}</InputLabel>
                            <ClientSearch 
                                id="client-number"
                                name="clientNumber" 
                                value={props.clientNumber} 
                                onChange={props.setClientNumber}
                                disabled 
                                callBack={(value: any) => {
                                    props.setClientNumber(value);
                                    if (props.clientNumber !== null) {
                                        props.setPhone(props.clientNumber.phone !== null ? props.clientNumber.phone : "");
                                        // alert("check");
                                    }
                                }} 
                                fullWidth 
                            />
                        </Grid>
                        <Grid item xs={12} md={6} mt={1}>
                            <InputLabel htmlFor="departure" sx={inputLabelStyles}>{t('departure')}</InputLabel>
                            <AutocompleteSearch id="departure" value={props.departure} onChange={props.setDeparture} callBack={props.getClosestDeparture} fullWidth disabled />
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <InputLabel htmlFor="whatsapp-phone-number" sx={inputLabelStyles} style={{ marginTop: "8px" }}>{t('whatsappNumber')}</InputLabel>
                            <MuiTelInput 
                                id="whatsapp-phone-number" 
                                value={props.phone} onChange={props.setPhone} 
                                defaultCountry="CM" preferredCountries={["CM", "BE", "KE"]} 
                                fullWidth sx={{ mt: 1 }} disabled 
                            />
                        </Grid>
                        <Grid item xs={12} md={6} mt={1}>
                            <InputLabel htmlFor="arrival" sx={inputLabelStyles}>{t('arrival')}</InputLabel>
                            <AutocompleteSearch id="arrival" value={props.arrival} onChange={props.setArrival} callBack={props.getClosestArrival} fullWidth disabled />
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <InputLabel htmlFor="request-email" sx={inputLabelStyles}>{t('emailAddress')}</InputLabel>
                            <BootstrapInput id="request-email" type="email" value={props.email} onChange={(e: React.ChangeEvent<HTMLInputElement>) => props.setEmail(e.target.value)} fullWidth disabled />
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <InputLabel htmlFor="tags" sx={inputLabelStyles}>{t('specifics')}</InputLabel>
                            {
                                props.products !== null ?
                                <Autocomplete
                                    multiple    
                                    disablePortal
                                    id="tags"
                                    placeholder="Machinery, Household goods, etc"
                                    options={props.products}
                                    getOptionLabel={(option: any) => { 
                                        if (option !== null && option !== undefined) {
                                            return option.productName !== undefined ? option.productName : option;
                                        }
                                        return ""; 
                                    }}
                                    value={props.tags}
                                    sx={{ mt: 1 }}
                                    renderInput={(params: any) => <TextField {...params} sx={{ textTransform: "lowercase" }} />}
                                    onChange={(e: any, value: any) => { props.setTags(value); }}
                                    fullWidth
                                    disabled
                                /> : <Skeleton />
                            }
                        </Grid>
                        
                        <Grid item xs={9} container direction="column" alignItems="flex-start">
                            <InputLabel htmlFor="listContainers" sx={inputLabelStyles} style={{ marginBottom: "8px", position: "relative", top: "12px" }}>{t('listContainers')}</InputLabel>
                        </Grid>
                        <Grid item xs={3}>
                            <Button 
                                variant="contained" color="inherit" 
                                sx={whiteButtonStyles} style={{ float: "right" }} 
                                onClick={props.openModalContainer} disabled
                            >
                                {t('addContainer')}
                            </Button>
                        </Grid>
                        <Grid item xs={12}>
                            {
                                props.packingType === "FCL" ?
                                <>
                                {
                                    props.containersSelection !== undefined && props.containersSelection !== null && props.containersSelection.length !== 0 && props.containers !== null ? 
                                    <Grid container spacing={2}>
                                    {
                                        props.containersSelection.map((item: any, index: number) => (
                                            <Grid key={"listitem1-"+index} item xs={12} md={4}>
                                                <ListItem
                                                    sx={{ border: "1px solid #e5e5e5" }}
                                                    secondaryAction={
                                                        <IconButton 
                                                            edge="end"
                                                            disabled  
                                                            onClick={() => {
                                                                props.setContainersSelection((prevItems: any) => prevItems.filter((item: any, i: number) => i !== index));
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
                        
                        <Grid item xs={12} md={6} mt={.5} sx={{ display: { xs: 'none', md: 'block' } }}>
                            <InputLabel htmlFor="request-message" sx={inputLabelStyles}>{t('details')}</InputLabel>
                            <BootstrapInput id="request-message" type="text" multiline rows={3.5} value={props.message} onChange={(e: React.ChangeEvent<HTMLInputElement>) => props.setMessage(e.target.value)} fullWidth disabled />
                        </Grid>
                        <Grid item xs={12} md={6} mt={1}>
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
                                        disabled
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
                                        onClick={assignManager} disabled
                                    >
                                        {t('updateManager')}
                                    </Button>
                                    <Button 
                                        variant="contained" color="inherit" 
                                        sx={whiteButtonStyles} 
                                        onClick={removeManager} disabled
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
