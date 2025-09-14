import { Accordion, AccordionSummary, Typography, AccordionDetails, InputLabel, Autocomplete, TextField, Skeleton, Button, ListItem, IconButton, ListItemText, NativeSelect, Box, Dialog, DialogTitle, DialogContent, DialogActions, Stack } from '@mui/material';
import Grid from '@mui/material/Grid2';
import { MuiTelInput } from 'mui-tel-input';
import { inputLabelStyles, BootstrapInput, whiteButtonStyles, properties } from '@utils/misc/styles';
import AutocompleteSearch from '@components/shared/AutocompleteSearch';
import ClientSearch from '@components/shared/ClientSearch';
import AssigneeSelector from '@components/shared/AssigneeSelector';
import { Delete, ExpandMore } from '@mui/icons-material';
import { enqueueSnackbar } from 'notistack';
import { useTranslation } from 'react-i18next';
import { postContactCreateContact } from '@features/crm/api';
import { useState } from 'react';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';

const RequestForm = (props: any) => {
    const { t, i18n } = useTranslation();
    
    const [openProspectModal, setOpenProspectModal] = useState(false);
    const [prospectForm, setProspectForm] = useState({
        contactName: '',
        email: '',
        phone: '',
        countryCode: 'BE',
    });
    const [prospectLoading, setProspectLoading] = useState(false);

    const handleOpenProspectModal = () => setOpenProspectModal(true);
    const handleCloseProspectModal = () => {
        setOpenProspectModal(false);
        setProspectForm({ contactName: '', email: '', phone: '', countryCode: 'BE' });
    };
    const handleProspectChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setProspectForm({ ...prospectForm, [e.target.name]: e.target.value });
    };
    const handleCreateProspect = async () => {
        if (!prospectForm.contactName) return enqueueSnackbar(t('prospectNameRequired'), { variant: 'error' });
        setProspectLoading(true);
        try {
            const res = await postContactCreateContact({ body: { ...prospectForm, categories: ['CUSTOMERS'] } });
            if (res?.data) {
                enqueueSnackbar(t('prospectCreated'), { variant: 'success' });
                if (props.setClientNumber) props.setClientNumber({ contactId: res.data, ...prospectForm });
                handleCloseProspectModal();
            } else {
                enqueueSnackbar(t('prospectCreateError'), { variant: 'error' });
            }
        } catch (e) {
            enqueueSnackbar(t('prospectCreateError'), { variant: 'error' });
        } finally {
            setProspectLoading(false);
        }
    };

    const assignManager = async () => {
        if (props.assignedManager !== null && props.assignedManager !== undefined && props.assignedManager !== "") {
            // TODO: L'API pour désassigner un manager n'existe plus. Implémenter la logique ici si besoin.
        }
        else {
            enqueueSnackbar(t('selectManagerFirst'), { variant: "error", anchorOrigin: { horizontal: "right", vertical: "top"} });
        }
    }

    const removeManager = async () => {
        // TODO: L'API pour désassigner un manager n'existe plus. Implémenter la logique ici si besoin.
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
                        <Grid size={{ xs: 12, md: 6 }} sx={{ display: 'flex', alignItems: 'flex-end' }}>
                            <Box sx={{ flex: 1 }}>
                                <InputLabel htmlFor="client-number" sx={inputLabelStyles} style={{ marginTop: "8px" }}>{t('clientNumber')}</InputLabel>
                                <ClientSearch 
                                    id="client-number"
                                    name="clientNumber" 
                                    value={props.clientNumber} 
                                    onChange={props.setClientNumber}
                                    disabled={!props.canEdit} 
                                    callBack={(value: any) => {
                                        if (value !== null) {
                                            props.setPhone(value.phone !== null ? value.phone : "");
                                            props.setEmail(value.email !== null ? value.email : "");
                                        }
                                    }} 
                                    fullWidth 
                                />
                            </Box>
                            <IconButton color="primary" sx={{ ml: 1, mb: 1 }} onClick={handleOpenProspectModal} disabled={!props.canEdit}>
                                <AddCircleOutlineIcon />
                            </IconButton>
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
                                fullWidth sx={{ mt: 1 }} disabled={true} 
                                {...properties}
                            />
                        </Grid>
                        <Grid size={{ xs: 12, md: 6 }} mt={1}>
                            <InputLabel htmlFor="arrival" sx={inputLabelStyles}>{t('arrival')}</InputLabel>
                            <AutocompleteSearch id="arrival" value={props.arrival} onChange={props.setArrival} callBack={props.getClosestArrival} fullWidth disabled={!props.canEdit} />
                        </Grid>
                        <Grid size={{ xs: 12, md: 6 }}>
                            <InputLabel htmlFor="request-email" sx={inputLabelStyles}>{t('emailAddress')}</InputLabel>
                            <BootstrapInput id="request-email" type="email" value={props.email} onChange={(e: React.ChangeEvent<HTMLInputElement>) => props.setEmail(e.target.value)} fullWidth disabled={true} />
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
                                            options={props.products ?? []}
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
                                            options={props.hscodes ?? []}
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
                            <AssigneeSelector
                                assignee={props.assignedManager}
                                setAssignee={props.setAssignedManager}
                                assignees={props.assignees || []}
                                isLoading={props.loadAssignees}
                                disabled={!props.canEdit}
                                showActions={true}
                                onAssign={assignManager}
                                onRemove={removeManager}
                                variant="select"
                                label={t('assignedManager')}
                                placeholder={t('noAgentAssigned')}
                            />
                        </Grid>
                    </Grid>                                
                </AccordionDetails>
            </Accordion>
            <Button
                variant="contained"
                color="success"
                type="submit"
                sx={{ float: "right", mt: 2 }}
            >
                {props.wizardMode ? "Save and continue" : "Save"}
            </Button>
            {/* Modal de création de prospect */}
            <Dialog open={openProspectModal} onClose={handleCloseProspectModal} maxWidth="xs" fullWidth>
                <DialogTitle>{t('newProspect')}</DialogTitle>
                <DialogContent>
                    <Stack spacing={2} mt={1}>
                        <TextField
                            label={t('prospectName')}
                            name="contactName"
                            value={prospectForm.contactName}
                            onChange={handleProspectChange}
                            required
                            autoFocus
                        />
                        <TextField
                            label={t('emailAddress')}
                            name="email"
                            value={prospectForm.email}
                            onChange={handleProspectChange}
                            type="email"
                        />
                        <TextField
                            label={t('phoneNumber')}
                            name="phone"
                            value={prospectForm.phone}
                            onChange={handleProspectChange}
                        />
                        <TextField
                            label={t('country')}
                            name="countryCode"
                            value={prospectForm.countryCode}
                            onChange={handleProspectChange}
                        />
                    </Stack>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseProspectModal} color="inherit">{t('cancel')}</Button>
                    <Button onClick={handleCreateProspect} color="success" variant="contained" disabled={prospectLoading}>
                        {t('create')}
                    </Button>
                </DialogActions>
            </Dialog>
        </Grid>
    );
}

export default RequestForm;
