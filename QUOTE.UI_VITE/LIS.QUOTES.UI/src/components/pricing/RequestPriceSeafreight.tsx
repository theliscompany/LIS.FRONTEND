import { useEffect, useRef, useState } from 'react';
import './../../App.css';
import { BootstrapDialogTitle, BootstrapInput, buttonCloseStyles, datetimeStyles, inputIconStyles, inputLabelStyles, whiteButtonStyles } from '../../utils/misc/styles';
import { Alert, Autocomplete, Box, Button, DialogActions, DialogContent, IconButton, InputLabel, ListItem, ListItemText, NativeSelect, Skeleton, TextField } from '@mui/material';
import Grid from '@mui/material/Grid2';
import { useTranslation } from 'react-i18next';
import { enqueueSnackbar } from 'notistack';
import { Dayjs } from 'dayjs';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import DeleteIcon from '@mui/icons-material/Delete';
import { Anchor } from '@mui/icons-material';
import StarterKit from '@tiptap/starter-kit';
import { RichTextEditor, MenuControlsContainer, MenuSelectHeading, MenuDivider, MenuButtonBold, MenuButtonItalic, MenuButtonStrikethrough, MenuButtonOrderedList, MenuButtonBulletedList, MenuSelectTextAlign, MenuButtonEditLink, MenuButtonHorizontalRule, MenuButtonUndo, MenuButtonRedo, type RichTextEditorRef, } from 'mui-tiptap';
import { validateObjectHSCODEFormat } from '../../utils/functions';
import { getContactGetContacts } from '../../api/client/crm';
import { getApiSeaFreightGetSeaFreights } from '../../api/client/pricing';
import { getApiTemplate, getApiTemplateById } from '../../api/client/template';
import PortAutocomplete from '../shared/PortAutocomplete';
import { useAccount, useMsal } from '@azure/msal-react';

function displayContainers(value: any) {
    var aux = value.map((elm: any) => '<li>'+elm.quantity+"x"+elm.container+'</li>').join('');
    return '<ul>'+aux+'</ul>';
}

const defaultTemplate = "658e880927587b09811c13cb";

const RequestPriceSeafreight = (props: any) => {
    const { t, i18n } = useTranslation();
    
    const [subject, setSubject] = useState<string>(props.portLoading !== null && props.portDischarge !== null ? props.portLoading.portName+","+props.portLoading.country+" - "+props.portDischarge.portName+","+props.portDischarge.country+" / "+t("rateRequest") : "");
    const [recipients, setRecipients] = useState<any>([]);
    const [commoditiesArr, setCommoditiesArr] = useState<any[]>(props.commodities);
    const [portLoading, setPortLoading] = useState<any>(props.portLoading);
    const [portDischarge, setPortDischarge] = useState<any>(props.portDischarge);
    const [estimatedTimeDeparture, setEstimatedTimeDeparture] = useState<Dayjs | null>(null);
    const [containerType, setContainerType] = useState<string>("20' Dry");
    const [quantity, setQuantity] = useState<number>(1);
    const [containersSelection, setContainersSelection] = useState<any>(props.containersSelection);
    const [valueSpecifics, setValueSpecifics] = useState<string>("");
    const [carriersData, setCarriersData] = useState<any>(null);    
    const [templateBase, setTemplateBase] = useState<string>("");
    const [templates, setTemplates] = useState<any>([]);
    const [loadTemplates, setLoadTemplates] = useState<boolean>(false);
    const [selectedTemplate, setSelectedTemplate] = useState<string>(defaultTemplate);
    
    // const [mailLanguage, setMailLanguage] = useState<string>("fr");
    const [load, setLoad] = useState<boolean>(false);
    const [loadTemplate, setLoadTemplate] = useState<boolean>(false);

    const rteRef = useRef<RichTextEditorRef>(null);
    const { accounts } = useMsal();
    const account = useAccount(accounts[0] || {});
    
    const postEmail = async(from: string, to: string, subject: string, htmlContent: string) => {
        const form = new FormData();
        form.append('From', from);
        form.append('To', to);
        form.append('Subject', subject);
        form.append('HtmlContent', htmlContent);
        
        fetch(import.meta.env.VITE_API_LIS_QUOTE_ENDPOINT+'/Email', {
            method: 'POST',
            headers: {
                'accept': '*/*',
                // 'Content-Type': 'multipart/form-data'
            },
            body: form
        })
        .then((response) => response.json())
        .then((response: any) => {
            if (response !== undefined && response !== null && response.code == 200) {
                enqueueSnackbar(t('messageSuccessSent'), { variant: "success", anchorOrigin: { horizontal: "right", vertical: "top"} });
            }
            else {
                enqueueSnackbar(t('errorHappened'), { variant: "error", anchorOrigin: { horizontal: "right", vertical: "top"} });
            }
        });
    }

    const sendPriceRequestFCL = async () => {
        if (recipients.length !== 0) {
            // var myEmails = ["penayecyrille@gmail.com", "cyrille.penaye@omnifreight.eu"];
            var selectedMails = recipients.map((elm: any) => elm.email);
            console.log(selectedMails);

            var footer = `
            <div style="font-family: Verdana; padding-top: 35px;">
                <div>${account?.name}</div>
                <div style="margin-top: 5px;"><a target="_blank" href="www.omnifreight.eu">www.omnifreight.eu</a></div>
                <div style="padding-bottom: 10px;"><a target="_blank" href="http://www.facebook.com/omnifreight">http://www.facebook.com/omnifreight</a></div>
                <div>Italiëlei 211</div>
                <div>2000 Antwerpen</div>
                <div>Belgium</div>
                <div>E-mail: ${account?.username}</div>
                <div>Tel +32.3.295.38.82</div>
                <div>Fax +32.3.295.38.77</div>
                <div>Whatsapp +32.494.40.24.25</div>
                <img src="https://omnifreight.eu/wp-content/uploads/2023/06/logo.jpg" style="max-width: 200px;">
            </div>
            `;
            for (var i=0; i < selectedMails.length; i++) {
                console.log("Mail sent to : "+selectedMails[i]);
                enqueueSnackbar(t('mailSentTo')+selectedMails[i], { variant: "success", anchorOrigin: { horizontal: "right", vertical: "top"} });
                postEmail("pricing@omnifreight.eu", selectedMails.join(','), subject, "<div style='font-family: Verdana;'>"+rteRef.current?.editor?.getHTML()+"</div>"+footer);
            }
        }
        else {
            enqueueSnackbar(t('errorSelectRecipient'), { variant: "warning", anchorOrigin: { horizontal: "right", vertical: "top"} });
        }
    }

    function getAllCarriers(data: any) {
        if (!Array.isArray(data)) {
            // Handle invalid data
            return [];
        }

        const carriersSet = new Set();
        data.forEach((route) => {
            if (route.suppliers && Array.isArray(route.suppliers)) {
                route.suppliers.forEach((supplier: any) => {
                    if (supplier.carrierAgentName) {
                        carriersSet.add(supplier.carrierAgentName);
                    }
                });
            }
        });
      
        // Convert the Set to an array
        const carriers = Array.from(carriersSet);
        return carriers;
    }

    const getClients = async () => {
        try {
            const response = await getContactGetContacts({query: { category: "SHIPPING_LINES", pageSize: 1000 }});
            if (response !== null && response !== undefined) {
                // Removing duplicates from client array
                setCarriersData(response.data?.data?.filter((obj: any, index: number, self: any) => index === self.findIndex((o: any) => o.contactName === obj.contactName)));
            }
        }
        catch (err: any) {
            console.log(err);
        }
    }
    
    const searchSeafreights = async () => {
        try {
            setLoad(true);
            const response = await getApiSeaFreightGetSeaFreights({query: { DeparturePortId: portLoading?.portId, DestinationPortId: portDischarge?.portId }});
            if (response !== null && response !== undefined) {
                var aux = getAllCarriers(response.data);
                setRecipients(carriersData.filter((obj: any) => aux.includes(obj.contactName) && obj.email !== "" && obj.email !== null));
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

    const getTemplates = async () => {
        try {
            const response: any = await getApiTemplate({query: { Tags: ["seafreight"] }});
            if (response !== null && response.data !== undefined) {
                setTemplates(response.data?.data);
                setLoadTemplates(false);
            }
            else {
                setLoadTemplates(false);
            }
            console.log(response);
        }
        catch (err: any) {
            console.log(err);
            setLoadTemplates(false);
        }
    }
    
    const getTemplate = async (id: string) => {
        setLoadTemplate(true)
        try {
            const response: any = await getApiTemplateById({path: {id: id}});
            if (response !== null && response !== undefined) {
                setTemplateBase(response.data?.data?.content || "");
                setLoadTemplate(false);
            }
            else {
                setLoadTemplate(false);
            }
            console.log(response);
        }
        catch (err: any) {
            console.log(err);
            setLoadTemplate(false);
        }
    }
    
    // Fonction pour remplacer les variables dans le template
    function generateEmailContent(template: string, variables: any) {
        return template.replace(/\{\{(.*?)\}\}/g, (_, variableName: any) => {
            const trimmedName = variableName.trim();
            // Si la variable est non nulle/vide, l'encapsuler dans <strong>
            if (variables[trimmedName]) {
                return `<strong>${variables[trimmedName]}</strong>`;
            } else {
                return `{{${trimmedName}}}`; // Laisser le placeholder si la variable est nulle/vide
            }
        });
    }
    
    function getDefaultContent(template: any) {
        var departurePort = portLoading !== null ? portLoading.portName+', '+portLoading.country.toUpperCase() : "";
        var destinationPort = portDischarge !== null ? portDischarge.portName+', '+portDischarge.country.toUpperCase() : "";
        var commodities:any = valueSpecifics === "products" ? commoditiesArr.map((elm: any) => elm.productName).join(',') : 
        commoditiesArr.map((elm: any) => {
            if (i18n.language === "fr") {
                return elm.product_description_Fr;
            }
            else if (i18n.language === "en") {
                return elm.product_description_En;
            }
            else {
                return elm.product_description_NL;
            }
        }).join('; ');
        var etd = estimatedTimeDeparture !== null ? estimatedTimeDeparture.toDate().toLocaleDateString().slice(0,10) : "";
        var containersQuantities = displayContainers(containersSelection);

        const variables = { departurePort, destinationPort, commodities, etd, containersQuantities };
        return generateEmailContent(template, variables);
    }

    useEffect(() => {
        getTemplate(selectedTemplate);
    }, [selectedTemplate]);

    useEffect(() => {
        var departurePort = portLoading !== null ? portLoading.portName : "";
        var destinationPort = portDischarge !== null ? portDischarge.portName : "";
        var commodities:any = valueSpecifics === "products" ? commoditiesArr.map((elm: any) => elm.productName).join(',') : 
        commoditiesArr.map((elm: any) => {
            if (i18n.language === "fr") {
                return elm.product_description_Fr;
            }
            else if (i18n.language === "en") {
                return elm.product_description_En;
            }
            else {
                return elm.product_description_NL;
            }
        }).join('; ');
        var etd = estimatedTimeDeparture !== null ? estimatedTimeDeparture.toDate().toLocaleDateString().slice(0,10) : "";
        var containersQuantities = displayContainers(containersSelection);

        const variables = { departurePort, destinationPort, commodities, etd, containersQuantities };
        rteRef.current?.editor?.commands.setContent(generateEmailContent(templateBase, variables));
    }, [commoditiesArr, portLoading, portDischarge, containersSelection, estimatedTimeDeparture]);

    useEffect(() => {
        console.log("Commm: ", props.commodities);
        if (props.commodities !== null && props.commodities !== undefined && props.commodities.length > 0) {
            if (validateObjectHSCODEFormat(props.commodities[0])) {
                setValueSpecifics("hscodes");
            }
            else {
                setValueSpecifics("products");
            }    
        } 
    }, []);

    useEffect(() => {
        getClients();
        getTemplates();
    }, []);

    useEffect(() => {
        if (carriersData !== null) {
            searchSeafreights();
        }
    }, [portLoading, carriersData]);

    return (
        <>
            {
                true ? // carriersData !== null
                <>
                    <BootstrapDialogTitle id="custom-dialog-title6" onClose={props.closeModal}>
                        <b>{t('priceRequestFCL')}</b>
                    </BootstrapDialogTitle>
                    <DialogContent dividers>
                        <Grid container spacing={2} px={2}>
                            <Grid size={{ xs: 12, md: 6 }}>
                                <Grid container spacing={1}>
                                    <Grid size={{ xs: 12 }} mt={0.5}>
                                        {
                                            carriersData !== null && recipients !== null && load !== true ? 
                                            <>
                                                <InputLabel htmlFor="recipients" sx={inputLabelStyles}>{t('recipients')}</InputLabel>
                                                <Autocomplete
                                                    multiple    
                                                    disablePortal
                                                    id="recipients"
                                                    // placeholder="Carriers recipients"
                                                    options={carriersData}
                                                    getOptionLabel={(option: any) => { 
                                                        if (option !== undefined && option !== null && option !== "") {
                                                            if (option.contactName !== undefined && option.contactName !== null) {
                                                                return `${option.contactName}`;
                                                            }
                                                            return "";
                                                        }
                                                        return ""; 
                                                    }}
                                                    value={recipients}
                                                    sx={{ mt: 1 }}
                                                    renderInput={(params: any) => <TextField placeholder="Carriers recipients" {...params} sx={{ textTransform: "lowercase" }} />}
                                                    onChange={(_: any, value: any) => { setRecipients(value); }}
                                                    fullWidth
                                                />
                                            </> : <Skeleton />
                                        }
                                    </Grid>
                                    <Grid size={{ xs: 12 }} mt={0.5}>
                                        <InputLabel htmlFor="subject" sx={inputLabelStyles}>{t('subject')}</InputLabel>
                                        <BootstrapInput id="subject" value={subject} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSubject(e.target.value)} fullWidth />
                                    </Grid>
                                    <Grid size={{ xs: 12 }} mt={0.5}>
                                        <InputLabel htmlFor="commodities" sx={inputLabelStyles}>{t('commodities')}</InputLabel>
                                        {/* {
                                            props.products !== null ?
                                            <Autocomplete
                                                multiple    
                                                disablePortal
                                                id="commodities"
                                                // placeholder="Machinery, Household goods, etc"
                                                options={props.products}
                                                getOptionLabel={(option: any) => { 
                                                    if (option !== null && option !== undefined) {
                                                        return option.productName !== undefined ? option.productName : option;
                                                    }
                                                    return ""; 
                                                }}
                                                value={commoditiesArr}
                                                sx={{ mt: 1 }}
                                                renderInput={(params: any) => <TextField placeholder="Machinery, Household goods, etc" {...params} sx={{ textTransform: "lowercase" }} />}
                                                onChange={(e: any, value: any) => { setCommoditiesArr(value); }}
                                                fullWidth
                                            /> : <Skeleton />
                                        } */}
                                        {
                                            valueSpecifics === "products" ? 
                                            <Box>
                                            {
                                                props.products !== null ?
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
                                                    size='small'
                                                    renderInput={(params: any) => <TextField placeholder="Machinery, Household goods, etc" {...params} sx={{ textTransform: "lowercase" }} />}
                                                    value={commoditiesArr}
                                                    onChange={(_: any, value: any) => { setCommoditiesArr(value); }}
                                                    sx={{ mt: 1 }}
                                                    fullWidth
                                                /> : <Skeleton />
                                            }
                                            </Box> : 
                                            <Box>
                                            {
                                                props.hscodes !== null ?
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
                                                            // return option._4_digit_categories;
                                                        }
                                                        return ""; 
                                                    }}
                                                    disableCloseOnSelect
                                                    size='small'
                                                    renderInput={(params: any) => <TextField placeholder="Live animals, Cereals, etc" {...params} sx={{ textTransform: "lowercase" }} />}
                                                    value={commoditiesArr}
                                                    onChange={(_: any, value: any) => { setCommoditiesArr(value); }}
                                                    sx={{ mt: 1 }}
                                                    fullWidth
                                                /> : <Skeleton />
                                            }
                                            </Box>
                                        }
                                    </Grid>
                                    <Grid size={{ xs: 12, md: 6 }} mt={0.5}>
                                        <InputLabel htmlFor="portLoading" sx={inputLabelStyles}><Anchor fontSize="small" sx={inputIconStyles} /> {t('departurePort')}</InputLabel>
                                        {/* {
                                            props.ports !== null ?
                                            <Autocomplete
                                                disablePortal
                                                id="portLoading"
                                                options={props.ports}
                                                renderOption={(props, option) => {
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
                                                onChange={(e: any, value: any) => { 
                                                    setPortLoading(value); 
                                                    if (portDischarge !== null && portDischarge !== undefined) {
                                                        if (value !== null && value !== undefined) {
                                                            setSubject(value.portName+","+value.country+" - "+portDischarge.portName+","+portDischarge.country+" / "+t("rateRequest")); 
                                                        }
                                                        else {
                                                            setSubject(" - "+portDischarge.portName+","+portDischarge.country+" / "+t("rateRequest")); 
                                                        }
                                                    }
                                                    else {
                                                        setSubject("");
                                                    }
                                                }}
                                                fullWidth
                                            /> : <Skeleton />
                                        } */}
                                        {
                                            props.ports !== null ?
                                            <PortAutocomplete 
                                                id="portLoading" options={props.ports} value={portLoading} 
                                                onChange={(value: any) => { 
                                                    setPortLoading(value); 
                                                    if (portDischarge !== null && portDischarge !== undefined) {
                                                        if (value !== null && value !== undefined) {
                                                            setSubject(value.portName+","+value.country+" - "+portDischarge.portName+","+portDischarge.country+" / "+t("rateRequest")); 
                                                        }
                                                        else {
                                                            setSubject(" - "+portDischarge.portName+","+portDischarge.country+" / "+t("rateRequest")); 
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
                                    <Grid size={{ xs: 12, md: 6 }} mt={0.5}>
                                        <InputLabel htmlFor="portDischarge" sx={inputLabelStyles}><Anchor fontSize="small" sx={inputIconStyles} /> {t('destinationPort')}</InputLabel>
                                        {/* {
                                            props.ports !== null ?
                                            <Autocomplete
                                                disablePortal
                                                id="portDischarge"
                                                options={props.ports}
                                                renderOption={(props, option) => {
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
                                                onChange={(e: any, value: any) => { 
                                                    setPortDischarge(value);
                                                    if (portLoading !== null && portLoading !== undefined) {
                                                        if (value !== null && value !== undefined) {
                                                            setSubject(portLoading.portName+","+portLoading.country+" - "+value.portName+","+value.country+" / "+t("rateRequest"));  
                                                        }
                                                        else {
                                                            setSubject(portLoading.portName+","+portLoading.country+" - "+" / "+t("rateRequest"));  
                                                        }
                                                    }
                                                    else {
                                                        setSubject("");
                                                    }
                                                }}
                                                fullWidth
                                            /> : <Skeleton />
                                        } */}
                                        {
                                            props.ports !== null ?
                                            <PortAutocomplete 
                                                id="portDischarge" options={props.ports} value={portDischarge} 
                                                onChange={(value: any) => { 
                                                    setPortDischarge(value);
                                                    if (portLoading !== null && portLoading !== undefined) {
                                                        if (value !== null && value !== undefined) {
                                                            setSubject(portLoading.portName+","+portLoading.country+" - "+value.portName+","+value.country+" / "+t("rateRequest"));  
                                                        }
                                                        else {
                                                            setSubject(portLoading.portName+","+portLoading.country+" - "+" / "+t("rateRequest"));  
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
                                    <Grid size={{ xs: 12 }} mt={0.5}>
                                        <InputLabel htmlFor="etd" sx={inputLabelStyles}>{t('etd')}</InputLabel>
                                        <LocalizationProvider dateAdapter={AdapterDayjs}>
                                            <DatePicker 
                                                value={estimatedTimeDeparture}
                                                format="DD/MM/YYYY" 
                                                onChange={(value: any) => { setEstimatedTimeDeparture(value) }}
                                                slotProps={{ textField: { id: "etd", size: "small", fullWidth: true, sx: datetimeStyles }, inputAdornment: { sx: { position: "relative", right: "11.5px" } } }}
                                            />
                                        </LocalizationProvider>
                                    </Grid>
                                    <Grid size={{ xs: 12 }} mt={0.5}>
                                        <Grid container spacing={0} sx={{ p: 2, border: "1px solid #e5e5e5" }}>
                                            <Grid size={{ xs: 12 }} sx={{ mb: 1 }}>{t('containersQuantities')} - select one or many</Grid>
                                            <Grid size={{ xs: 12, md: 4 }} mt={0.5}>
                                                {/* <InputLabel htmlFor="container-type" sx={inputLabelStyles}>{t('containerType')}</InputLabel> */}
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
                                            <Grid size={{ xs: 12, md: 4 }} mt={0.5}>
                                                {/* <InputLabel htmlFor="quantity" sx={inputLabelStyles}>{t('quantity')}</InputLabel> */}
                                                <BootstrapInput id="quantity" type="number" inputProps={{ min: 1, max: 100 }} value={quantity} onChange={(e: any) => {setQuantity(e.target.value)}} fullWidth />
                                            </Grid>
                                            <Grid size={{ xs: 12, md: 4 }} mt={0.5}>
                                                <Button 
                                                    variant="contained" color="inherit" fullWidth sx={whiteButtonStyles} 
                                                    style={{ marginTop: "0px", height: "42px", float: "right" }} 
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
                                            <Grid size={{ xs: 12 }}>
                                                {
                                                    containersSelection !== undefined && containersSelection !== null && props.containers !== null ? 
                                                        containersSelection.length !== 0 ? 
                                                        <Grid container spacing={2}>
                                                            {
                                                                containersSelection.map((item: any, index: number) => (
                                                                    <Grid key={"listitem1-"+index} size={{ xs: 12, md: 6 }}>
                                                                        <ListItem
                                                                            sx={{ border: "1px solid #e5e5e5" }}
                                                                            secondaryAction={
                                                                                <IconButton edge="end" onClick={() => {
                                                                                    setContainersSelection((prevItems: any) => prevItems.filter((_: any, i: number) => i !== index));
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
                                                        </Grid> : <Alert severity="info">{t('noContainersSelected')}</Alert>
                                                    : null  
                                                }
                                            </Grid>
                                        </Grid>
                                    </Grid>
                                </Grid>
                            </Grid>
                            <Grid size={{ xs: 12, md: 6 }} mt={0.5}>
                                <Grid container>
                                    <Grid size={{ xs: 12 }}>
                                        <InputLabel htmlFor="selectedTemplate" sx={inputLabelStyles}>{t('selectedTemplate')}</InputLabel>
                                        {
                                            loadTemplates !== true ?
                                            <NativeSelect
                                                id="selectedTemplate"
                                                value={selectedTemplate}
                                                onChange={(e: any) => { setSelectedTemplate(e.target.value); }}
                                                input={<BootstrapInput />}
                                                fullWidth
                                            >
                                                {templates.map((elm: any, i: number) => (
                                                    <option key={"templateElm-"+i} value={elm.id}>{elm.name}</option>
                                                ))}
                                            </NativeSelect>
                                            : <Skeleton />
                                        }
                                    </Grid>

                                    {/* <Grid item xs={12}>
                                        <InputLabel htmlFor="mailLanguage" sx={inputLabelStyles}>{t('mailLanguage')}</InputLabel>
                                        <ToggleButtonGroup
                                            color="primary"
                                            value={mailLanguage}
                                            exclusive
                                            // size="small"
                                            onChange={(event: React.MouseEvent<HTMLElement>, newValue: string,) => { 
                                                setMailLanguage(newValue); 
                                                if (newValue === "fr") {
                                                    rteRef.current?.editor?.commands.setContent(templateBase);
                                                }
                                                else {
                                                    rteRef.current?.editor?.commands.setContent(templateBaseEn);
                                                }
                                            }}
                                            aria-label="Platform"
                                            fullWidth
                                            sx={{ mt: 1, maxHeight: "45px" }}
                                        >
                                            <ToggleButton value="fr"><img src="/assets/img/flags/flag-fr.png" style={{ width: "12px", marginRight: "6px" }} alt="flag english" /> Français</ToggleButton>
                                            <ToggleButton value="en"><img src="/assets/img/flags/flag-en.png" style={{ width: "12px", marginRight: "6px" }} alt="flag english" /> English</ToggleButton>
                                        </ToggleButtonGroup>
                                    </Grid> */}
                                    <Grid size={{ xs: 12 }} mt={1.5}>
                                        <InputLabel htmlFor="details" sx={inputLabelStyles}>{t('detailsOffer')}</InputLabel>
                                        <Box sx={{ mt: 1 }}>
                                            {
                                                loadTemplate !== true ?
                                                <RichTextEditor
                                                    ref={rteRef}
                                                    extensions={[StarterKit]}
                                                    content={getDefaultContent(templateBase)}
                                                    renderControls={() => (
                                                    <MenuControlsContainer>
                                                        <MenuSelectHeading />
                                                        <MenuDivider />
                                                        <MenuButtonBold />
                                                        <MenuButtonItalic />
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
                                                /> : <Skeleton />
                                            }
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
                </> : <Skeleton />
            }
        </>
    );
}

export default RequestPriceSeafreight;
