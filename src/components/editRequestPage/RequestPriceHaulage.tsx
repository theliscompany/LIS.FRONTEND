import { useEffect, useRef, useState } from 'react';
import { BootstrapDialogTitle, BootstrapInput, buttonCloseStyles, inputLabelStyles } from '../../utils/misc/styles';
import { Autocomplete, Box, Button, DialogActions, DialogContent, Grid, InputLabel, Skeleton, TextField, ToggleButton, ToggleButtonGroup } from '@mui/material';
import { useAuthorizedBackendApi } from '../../api/api';
import { useTranslation } from 'react-i18next';
import { enqueueSnackbar } from 'notistack';
import { BackendService } from '../../utils/services/fetch';
import { protectedResources } from '../../config/authConfig';
import { useAccount, useMsal } from '@azure/msal-react';
import StarterKit from '@tiptap/starter-kit';
import { RichTextEditor, MenuControlsContainer, MenuSelectHeading, MenuDivider, MenuButtonBold, MenuButtonItalic, MenuButtonStrikethrough, MenuButtonOrderedList, MenuButtonBulletedList, MenuSelectTextAlign, MenuButtonEditLink, MenuButtonHorizontalRule, MenuButtonUndo, MenuButtonRedo, type RichTextEditorRef, } from 'mui-tiptap';
import './../../App.css';
import AutocompleteSearch from '../shared/AutocompleteSearch';

function createGetRequestUrl(variable1: number, variable2: number) {
    let url = protectedResources.apiLisPricing.endPoint+"/Haulage/Haulages?";
    // if (variable1) {
    //   url += 'DeparturePortId=' + encodeURIComponent(variable1) + '&';
    // }
    if (variable2) {
      url += 'LoadingPortId=' + encodeURIComponent(variable2) + '&';
    }
    
    if (url.slice(-1) === '&') {
      url = url.slice(0, -1);
    }
    return url;
}

function RequestPriceHaulage(props: any) {
    const [subject, setSubject] = useState<string>("Rate request haulage");
    const [recipients, setRecipients] = useState<any>([]);
    const [emptyPickupDepot, setEmptyPickupDepot] = useState<string>("");
    const [loadingCity, setLoadingCity] = useState<any>(props.loadingCity);
    const [deliveryPort, setDeliveryPort] = useState<any>(props.loadingPort);
    
    const [hauliersData, setHauliersData] = useState<any>(props.companies);
    
    const [mailLanguage, setMailLanguage] = useState<string>("fr");
    const [load, setLoad] = useState<boolean>(false);

    const rteRef = useRef<RichTextEditorRef>(null);
    
    const { accounts } = useMsal();
    const account = useAccount(accounts[0] || {});

    const context = useAuthorizedBackendApi();
    const { t } = useTranslation();
    
    const postEmail = async(from: string, to: string, subject: string, htmlContent: string) => {
        const form = new FormData();
        form.append('From', from);
        form.append('To', to);
        form.append('Subject', subject);
        form.append('HtmlContent', htmlContent);
        // if (fileValue !== undefined) {
        //     for (var i=0; i < fileValue.length; i++) {
        //         form.append('Attachments', fileValue[i]);
        //     }
        // }

        fetch(protectedResources.apiLisQuotes.endPoint+'/Email', {
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
                // enqueueSnackbar(t('messageSuccessSent'), { variant: "success", anchorOrigin: { horizontal: "right", vertical: "top"} });
                enqueueSnackbar(t('mailSentTo')+to, { variant: "success", anchorOrigin: { horizontal: "right", vertical: "top"} });
            }
            else {
                enqueueSnackbar(t('errorHappened'), { variant: "error", anchorOrigin: { horizontal: "right", vertical: "top"} });
            }
        });
    }

    const sendPriceRequestHaulage = async () => {
        if (recipients.length !== 0) {
            var myEmails = ["penayecyrille@gmail.com", "cyrille.penaye@omnifreight.eu"];
            var selectedMails = recipients.map((elm: any) => elm.email);
            console.log(selectedMails);

            var footer = `
            <div style="font-family: Verdana; padding-top: 60px;">
                <div style="margin-top: 5px;"><a target="_blank" href="www.omnifreight.eu">www.omnifreight.eu</a></div>
                <div style="padding-bottom: 10px;"><a target="_blank" href="http://www.facebook.com/omnifreight">http://www.facebook.com/omnifreight</a></div>
                <div>Italiëlei 211</div>
                <div>2000 Antwerpen</div>
                <div>Belgium</div>
                <div>E-mail: transport@omnifreight.eu</div>
                <div>Tel +32.3.295.38.82</div>
                <div>Fax +32.3.295.38.77</div>
                <div>Whatsapp +32.494.40.24.25</div>
                <img src="http://www.omnifreight.eu/Images/omnifreight_logo.jpg" style="max-width: 200px;">
            </div>
            `;
            for (var i=0; i < selectedMails.length; i++) {
                console.log("Mail sent to : "+selectedMails[i]);
                // enqueueSnackbar(t('mailSentTo')+selectedMails[i], { variant: "success", anchorOrigin: { horizontal: "right", vertical: "top"} });
                postEmail("pricing@omnifreight.eu", selectedMails.join(','), subject, rteRef.current?.editor?.getHTML() + footer);    
            }
        }
        else {
            enqueueSnackbar(t('errorSelectRecipient'), { variant: "warning", anchorOrigin: { horizontal: "right", vertical: "top"} });
        }
    }

    function getAllHauliers(data: any) {
        if (!Array.isArray(data)) {
            // Handle invalid data
            return [];
        }
      
        const hauliersSet = new Set();
      
        data.forEach((route) => {
            if (route.hauliers && Array.isArray(route.hauliers)) {
                route.hauliers.forEach((supplier: any) => {
                    if (supplier.haulierName) {
                        hauliersSet.add(supplier.haulierName);
                    }
                });
            }
        });
      
        // Convert the Set to an array
        const carriers = Array.from(hauliersSet);
        return carriers;
    }

    const searchHaulages = async () => {
        if (context) {
            setLoad(true);
            // setHauliersData([]);
            var requestFormatted = createGetRequestUrl(loadingCity?.portId, deliveryPort?.portId);
            const response = await (context as BackendService<any>).getWithToken(requestFormatted, props.token);
            if (response !== null && response !== undefined) {
                var aux = getAllHauliers(response);
                console.log(response.length !== 0 ? aux : "None");
                
                if (aux.length !== 0) {
                    setRecipients(props.companies.filter((obj: any) => aux.includes(obj.contactName) && obj.email !== "" && obj.email !== null));
                }
                // setHauliersData(props.companies.filter((obj: any) => aux.includes(obj.contactName) && obj.email !== "" && obj.email !== null));
                // setHauliersData(props.companies);
                setLoad(false);
            }
            else {
                setLoad(false);
            }
        }
    }

    const resetEditor = () => {
        if (mailLanguage === "fr") {
            rteRef.current?.editor?.commands.setContent(
            `<div>
            <p>Bonjour,</p>
            <p>Veuillez nous contacter dès que possible avec votre meilleur devis pour le transport routier de conteneurs 20' et 40'HC comme suit :</p>
            <p>Lieu de ramassage à vide : ${emptyPickupDepot !== "" ? emptyPickupDepot.toUpperCase() : ""}</p>
            <p>Ville de chargement : ${loadingCity !== null ? loadingCity.city.toUpperCase() : ""}</p>
            <p>Port de réception : ${deliveryPort !== null ? deliveryPort.portName : ""}</p>
            <p></p>
            <p>Cordialement,</p>
            <p>Jeffry COOLS</p>
            </div>`);
        }
        // else {
        //     rteRef.current?.editor?.commands.setContent(
        //     `<div>
        //     <p>Good afternoon,</p>
        //     <p>Kindly revert to us asap with your best quote for trucking 20' and 40'HC containers as follows :</p>
        //     <p>Empty pickup depot : ${emptyPickupDepot !== "" ? emptyPickupDepot.toUpperCase() : ""}</p>
        //     <p>Loading city : ${loadingCity !== null ? loadingCity.city.toUpperCase() : ""}</p>
        //     <p>Port of delivery : ${deliveryPort !== null ? deliveryPort.portName : ""}</p>
        //     <p></p>
        //     <p>Thanks/regards</p>
        //     <p>Jeffry COOLS</p>
        //     </div>`);
        // }
    }

    useEffect(() => {
        resetEditor();
    }, [emptyPickupDepot, loadingCity, deliveryPort]);

    useEffect(() => {
        searchHaulages();
    }, [deliveryPort]);

    return (
        <>
            <BootstrapDialogTitle id="custom-dialog-title6" onClose={props.closeModal}>
                <b>{t('priceRequestHaulage')}</b>
            </BootstrapDialogTitle>
            <DialogContent dividers>
                <Grid container spacing={2} px={2}>
                    <Grid item xs={12} md={6}>
                        <Grid container spacing={1}>
                            <Grid item xs={12} mt={0.5}>
                                {
                                    hauliersData !== null ? 
                                    <>
                                        <InputLabel htmlFor="recipients" sx={inputLabelStyles}>{t('recipients')}</InputLabel>
                                        <Autocomplete
                                            multiple    
                                            disablePortal
                                            id="recipients"
                                            placeholder="Carriers recipients"
                                            options={hauliersData}
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
                                            renderInput={(params: any) => <TextField {...params} sx={{ textTransform: "lowercase" }} />}
                                            onChange={(e: any, value: any) => { setRecipients(value); }}
                                            fullWidth
                                        />
                                        {/* <Alert severity="info">S.O. Bongo</Alert> */}
                                    </> : <Skeleton />
                                }
                            </Grid>
                            <Grid item xs={12} mt={0.5}>
                                <InputLabel htmlFor="subject" sx={inputLabelStyles}>{t('subject')}</InputLabel>
                                <BootstrapInput id="subject" value={subject} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSubject(e.target.value)} fullWidth />
                            </Grid>
                            <Grid item xs={12} md={12} mt={0.5}>
                                <InputLabel htmlFor="emptyPickupDepot" sx={inputLabelStyles}>{t('emptyPickupDepot')}</InputLabel>
                                <BootstrapInput id="emptyPickupDepot" type="text" value={emptyPickupDepot} onChange={(e: any) => setEmptyPickupDepot(e.target.value)} fullWidth />
                            </Grid>
                            <Grid item xs={12} md={12} mt={0.5}>
                                <InputLabel htmlFor="loading-city" sx={inputLabelStyles}>{t('loadingCity')}</InputLabel>
                                <AutocompleteSearch id="loading-city" value={loadingCity} onChange={setLoadingCity} fullWidth />
                            </Grid>
                            <Grid item xs={12} md={12} mt={0.5}>
                                <InputLabel htmlFor="deliveryPort" sx={inputLabelStyles}>{t('destinationPort')}</InputLabel>
                                {
                                    props.ports !== null ?
                                    <Autocomplete
                                        disablePortal
                                        id="deliveryPort"
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
                                        value={deliveryPort}
                                        // disabled={true}
                                        sx={{ mt: 1 }}
                                        renderInput={(params: any) => <TextField {...params} />}
                                        onChange={(e: any, value: any) => { 
                                            setDeliveryPort(value);
                                        }}
                                        fullWidth
                                    /> : <Skeleton />
                                }
                            </Grid>
                        </Grid>
                    </Grid>
                    <Grid item xs={12} md={6} mt={0.5}>
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
                                            <p>Veuillez nous contacter dès que possible avec votre meilleur devis pour le transport routier de conteneurs 20' et 40'HC comme suit :</p>
                                            <p>Lieu de ramassage à vide : ${emptyPickupDepot !== "" ? emptyPickupDepot.toUpperCase() : ""}</p>
                                            <p>Ville de chargement : ${loadingCity !== null ? loadingCity.city.toUpperCase() : ""}</p>
                                            <p>Port de réception : ${deliveryPort !== null ? deliveryPort.portName : ""}</p>
                                            <p></p>
                                            <p>Cordialement,</p>
                                            <p>Jeffry COOLS</p>
                                            </div>`);
                                        }
                                        // else {
                                        //     rteRef.current?.editor?.commands.setContent(
                                        //     `<div>
                                        //     <p>Good afternoon,</p>
                                        //     <p>Kindly revert to us asap with your best quote for trucking 20' and 40'HC containers as follows :</p>
                                        //     <p>Empty pickup depot : ${emptyPickupDepot !== "" ? emptyPickupDepot.toUpperCase() : ""}</p>
                                        //     <p>Loading city : ${loadingCity !== null ? loadingCity.city.toUpperCase() : ""}</p>
                                        //     <p>Port of delivery : ${deliveryPort !== null ? deliveryPort.portName : ""}</p>
                                        //     <p></p>
                                        //     <p>Thanks/regards</p>
                                        //     <p>Jeffry COOLS</p>
                                        //     </div>`);
                                        // }
                                    }}
                                    aria-label="Platform"
                                    fullWidth
                                    sx={{ mt: 1, maxHeight: "44px" }}
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
                                            <p>Veuillez nous contacter dès que possible avec votre meilleur devis pour le transport routier de conteneurs 20' et 40'HC comme suit :</p>
                                            <p>Lieu de ramassage à vide : ${emptyPickupDepot !== "" ? emptyPickupDepot.toUpperCase() : ""}</p>
                                            <p>Ville de chargement : ${loadingCity !== null ? loadingCity.city.toUpperCase() : ""}</p>
                                            <p>Port de réception : ${deliveryPort !== null ? deliveryPort.portName : ""}</p>
                                            <p></p>
                                            <p>Cordialement,</p>
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
                <Button variant="contained" color="primary" className="mr-3" onClick={sendPriceRequestHaulage} sx={{ textTransform: "none" }}>{t('send')}</Button>
                <Button variant="contained" onClick={props.closeModal} sx={buttonCloseStyles}>{t('close')}</Button>
            </DialogActions>
        </>
    );
}

export default RequestPriceHaulage;
