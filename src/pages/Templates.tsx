import { useState, useEffect } from 'react';
import { Accordion, AccordionDetails, AccordionSummary, Alert, Autocomplete, Box, Button, Chip, DialogActions, DialogContent, Grid, IconButton, InputLabel, ListItem, ListItemText, NativeSelect, Skeleton, TextField, Typography } from '@mui/material';
import AddCircleOutlinedIcon from '@mui/icons-material/AddCircleOutlined';
import SearchIcon from '@mui/icons-material/Search';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { SnackbarProvider, enqueueSnackbar } from 'notistack';
import { useTranslation } from 'react-i18next';
import { useAuthorizedBackendApi } from '../api/api';
import { pricingRequest, protectedResources, transportRequest } from '../config/authConfig';
import { BackendService } from '../utils/services/fetch';
import { GridColDef, GridValueFormatterParams, GridRenderCellParams, DataGrid } from '@mui/x-data-grid';
import { BootstrapDialog, BootstrapDialogTitle, BootstrapInput, actionButtonStyles, buttonCloseStyles, datetimeStyles, gridStyles, inputLabelStyles, whiteButtonStyles } from '../utils/misc/styles';
import CompanySearch from '../components/shared/CompanySearch';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import dayjs, { Dayjs } from 'dayjs';
import { AuthenticationResult } from '@azure/msal-browser';
import { useMsal, useAccount } from '@azure/msal-react';
import { CategoryEnum } from '../utils/constants';

function createGetRequestUrl(variable1: number, variable2: number, variable3: number) {
    let url = protectedResources.apiLisPricing.endPoint+"/SeaFreight/GetSeaFreights?";
    if (variable1) {
      url += 'DeparturePortId=' + encodeURIComponent(variable1) + '&';
    }
    if (variable2) {
      url += 'DestinationPortId=' + encodeURIComponent(variable2) + '&';
    }
    if (variable3) {
      url += 'CarrierAgentId=' + encodeURIComponent(variable3) + '&';
    }
    
    if (url.slice(-1) === '&') {
      url = url.slice(0, -1);
    }
    return url;
}

function Templates() {
    const [load, setLoad] = useState<boolean>(true);
    const [loadEdit, setLoadEdit] = useState<boolean>(false);
    const [modal, setModal] = useState<boolean>(false);
    const [modal2, setModal2] = useState<boolean>(false);
    const [ports, setPorts] = useState<any>(null);
    const [containers, setContainers] = useState<any>(null);
    const [services, setServices] = useState<any>(null);
    const [currentId, setCurrentId] = useState<string>("");
    const [currentEditId, setCurrentEditId] = useState<string>("");
    const [templates, setTemplates] = useState<any>(null);
    const [searchedTemplate, setSearchedTemplate] = useState<any>(null);
    
    const [tempToken, setTempToken] = useState<string>("");
    
    const { t } = useTranslation();
    
    const { instance, accounts } = useMsal();
    const account = useAccount(accounts[0] || {});
    const context = useAuthorizedBackendApi();
    
    const currencyOptions = [
        { code: "EUR", label: 'Euro - €' },
        { code: 'GBP', label: 'British pound - £' },
        { code: "USD", label: 'Dollar - $' },
        { code: "FCFA", label: 'Franc CFA - FCFA' }
    ]
    
    const columnsTemplates: GridColDef[] = [
        { field: 'name', headerName: t('name'), minWidth: 125, flex: 1.4 },
        { field: 'tags', headerName: t('tags'), minWidth: 125, flex: 1.4 },
        { field: 'created', headerName: t('created'), renderCell: (params: GridRenderCellParams) => {
            return (
                <Box sx={{ my: 1, mr: 1 }}>
                    <Chip label={(new Date(params.row.created)).toLocaleDateString().slice(0,10)} color={(new Date()).getTime() - (new Date(params.row.created)).getTime() > 0 ? "default" : "default"}></Chip>
                </Box>
            );
        }, minWidth: 100, flex: 1 },
        { field: 'xxx', headerName: t('Actions'), renderCell: (params: GridRenderCellParams) => {
            return (
                <Box sx={{ my: 1, mr: 1 }}>
                    <IconButton size="small" title={t('editRow')} sx={{ mr: 0.5 }} onClick={() => { setCurrentEditId(params.row.seaFreightId); getTemplate(params.row.seaFreightId); setModal2(true); }}>
                        <EditIcon fontSize="small" />
                    </IconButton>
                    <IconButton size="small" title={t('deleteRow')} onClick={() => { setCurrentId(params.row.seaFreightId); setModal(true); }}>
                        <DeleteIcon fontSize="small" />
                    </IconButton>
                </Box>
            );
        }, minWidth: 120, flex: 0.8 },
    ];
    
    useEffect(() => {
        getPorts();
        getTemplates();
        getProtectedData(); // Services and Containers
    }, []);
    
    const getPorts = async () => {
        if (context) {
            const response = await (context as BackendService<any>).getSingle(protectedResources.apiLisTransport.endPoint+"/Port/Ports");
            if (response !== null && response !== undefined) {
                setPorts(response);
            }  
        }
    }
    
    const getProtectedData = async () => {
        if (context && account) {
            const token = await instance.acquireTokenSilent({
                scopes: transportRequest.scopes,
                account: account
            })
            .then((response: AuthenticationResult) => {
                return response.accessToken;
            })
            .catch(() => {
                return instance.acquireTokenPopup({
                    ...transportRequest,
                    account: account
                    }).then((response) => {
                        return response.accessToken;
                    });
                }
            );
            
            getServices(token);
            getContainers(token);
        }
    }

    const getServices = async (token: string) => {
        if (context) {
            const response = await (context as BackendService<any>).getWithToken(protectedResources.apiLisTransport.endPoint+"/Service/Services", token);
            if (response !== null && response !== undefined) {
                setServices(response);
            }  
        }
    }
    
    const getContainers = async (token: string) => {
        if (context) {
            const response = await (context as BackendService<any>).getWithToken(protectedResources.apiLisTransport.endPoint+"/Package/Containers", token);
            if (response !== null && response !== undefined) {
                setContainers(response);
            }  
        }
    }
    
    const getTemplates = async () => {
        if (context && account) {
            // const token = await instance.acquireTokenSilent({
            //     scopes: pricingRequest.scopes,
            //     account: account
            // }).then((response:AuthenticationResult)=>{
            //     return response.accessToken;
            // }).catch(() => {
            //     return instance.acquireTokenPopup({
            //         ...pricingRequest,
            //         account: account
            //         }).then((response) => {
            //             return response.accessToken;
            //     });
            // });
            // setTempToken(token);
            
            const response = await (context as BackendService<any>).get(protectedResources.apiLisTemplate.endPoint+"/Template");
            if (response !== null && response !== undefined) {
                // setTemplates(response);
                console.log(response);
                // setHaulages([]);
                setLoad(false);
            }
            else {
                setLoad(false);
            }
            console.log(response);
        }
        
        // if (context) {
        //     const response = await (context as BackendService<any>).get(protectedResources.apiLisPricing.endPoint+"/SeaFreight/GetSeaFreights");
        //     console.log(response);
        //     if (response !== null && response !== undefined) {
        //         setTemplates(response);
        //         // setTemplates([]);
        //         setLoad(false);
        //     }
        //     else {
        //         setLoad(false);
        //     }
        //     console.log(response);
        // }
    }
    
    const resetForm = () => {
        
    }
    
    const getTemplate = async (id: string) => {
        setLoadEdit(true)
        if (context) {
            const response = await (context as BackendService<any>).getWithToken(protectedResources.apiLisPricing.endPoint+"/Template/"+id, tempToken);
            if (response !== null && response !== undefined) {
                
                setLoadEdit(false);
            }
            else {
                setLoadEdit(false);
            }
            console.log(response);
        }
    }
    
    const searchTemplates = async () => {
        if (context) {
            setLoad(true);
            // var requestFormatted = createGetRequestUrl(portDeparture?.portId, portDestination?.portId, searchedTemplate?.contactId);
            // const response = await (context as BackendService<any>).getWithToken(requestFormatted, tempToken);
            // if (response !== null && response !== undefined) {
            //     setTemplates(response);
            //     setLoad(false);
            // }
            // else {
            //     setLoad(false);
            // }
            // console.log(response);
        }
    }

    const createUpdateTemplate = async () => {
        if (true) {
            if (context) {
                var dataSent = null;
                if (currentEditId !== "") {
                    dataSent = {
                        "name": currentEditId,
                        "content": "",
                        "updated": (new Date()).toISOString()
                    };    
                }
                else {
                    dataSent = {
                        // "seaFreightId": "string",
                        // "name": currentEditId,
                        "content": "",
                        "updated": (new Date()).toISOString()
                    };    
                }
                const response = await (context as BackendService<any>).postWithToken(protectedResources.apiLisPricing.endPoint+"/Template", dataSent, tempToken);
                if (response !== null && response !== undefined) {
                    setModal2(false);
                    enqueueSnackbar(t('successCreated'), { variant: "success", anchorOrigin: { horizontal: "right", vertical: "top"} });
                    searchTemplates();
                }
                else {
                    enqueueSnackbar(t('errorHappened'), { variant: "error", anchorOrigin: { horizontal: "right", vertical: "top"} });
                }
            }
        }
        else {
            enqueueSnackbar(t('fieldsEmptyTemplate'), { variant: "error", anchorOrigin: { horizontal: "right", vertical: "top"} });
        }
    }

    const deleteTemplate = async (id: string) => {
        if (context) {
            // alert("Function not available yet!");
            const response = await (context as BackendService<any>).delete(protectedResources.apiLisPricing.endPoint+"/Template/"+id);
            if (response !== null && response !== undefined) {
                enqueueSnackbar(t('rowDeletedSuccess'), { variant: "success", anchorOrigin: { horizontal: "right", vertical: "top"} });
                setModal(false);
                searchTemplates();
            }
            else {
                enqueueSnackbar(t('rowDeletedError'), { variant: "success", anchorOrigin: { horizontal: "right", vertical: "top"} });
            }
        }
    }
    
    return (
        <div style={{ background: "#fff", borderTopLeftRadius: 20, borderTopRightRadius: 20 }}>
            <SnackbarProvider />
            <Box sx={{ py: 2.5 }}>
                <Typography variant="h5" sx={{mt: {xs: 4, md: 1.5, lg: 1.5 }}} mx={5}><b>{t('listTemplates')}</b></Typography>
                <Grid container spacing={2} mt={0} px={5}>
                    <Grid item xs={12}>
                        <Button variant="contained" sx={actionButtonStyles} onClick={() => { setCurrentEditId(""); resetForm(); setModal2(true); }}>
                            {t('newTemplatePrice')} <AddCircleOutlinedIcon sx={{ ml: 0.5, pb: 0.25, justifyContent: "center", alignItems: "center" }} fontSize="small" />
                        </Button>
                    </Grid>
                    <Grid item xs={12} md={4} mt={1}>
                        <InputLabel htmlFor="company-name" sx={inputLabelStyles}>{t('carrier')}</InputLabel>
                        <CompanySearch id="company-name" value={searchedTemplate} onChange={setSearchedTemplate} category={CategoryEnum.SHIPPING_LINES} callBack={() => console.log(searchedTemplate)} fullWidth />
                    </Grid>
                    <Grid item xs={12} md={2} mt={1} sx={{ display: "flex", alignItems: "end" }}>
                        <Button 
                            variant="contained" 
                            color="inherit"
                            startIcon={<SearchIcon />} 
                            size="large"
                            sx={{ backgroundColor: "#fff", color: "#333", textTransform: "none", mb: 0.15 }}
                            onClick={searchTemplates}
                            fullWidth
                        >
                            {t('search')}
                        </Button>
                    </Grid>
                </Grid>
                {
                    !load ? 
                    <Grid container spacing={2} mt={1} px={5} sx={{ maxWidth: "xs" }}>
                        <Grid item xs={12}>
                            {
                                templates !== null && templates.length !== 0 ?
                                <Box sx={{ overflow: "auto", width: { xs: "calc(100vw - 80px)", md: "100%" } }}>
                                    {
                                        templates.map((item: any, i: number) => {
                                            return (
                                                <Box key={"sd"+i}>Wrestler</Box>
                                            )
                                        })
                                    }
                                </Box> : <Alert severity="warning">{t('noResults')}</Alert>
                            }
                        </Grid>
                    </Grid> : <Skeleton sx={{ mx: 5, mt: 3 }} />
                }
            </Box>
            <BootstrapDialog
                onClose={() => setModal(false)}
                aria-labelledby="custom-dialog-title"
                open={modal}
                maxWidth="sm"
                fullWidth
            >
                <BootstrapDialogTitle id="custom-dialog-title" onClose={() => setModal(false)}>
                    <b>{t('deleteRow')}</b>
                </BootstrapDialogTitle>
                <DialogContent dividers>{t('areYouSureDeleteRow')}</DialogContent>
                <DialogActions>
                    <Button variant="contained" color={"primary"} onClick={() => { deleteTemplate(currentId); }} sx={{ mr: 1.5, textTransform: "none" }}>{t('accept')}</Button>
                    <Button variant="contained" onClick={() => setModal(false)} sx={buttonCloseStyles}>{t('close')}</Button>
                </DialogActions>
            </BootstrapDialog>
            <BootstrapDialog
                onClose={() => setModal2(false)}
                aria-labelledby="custom-dialog-title2"
                open={modal2}
                maxWidth="lg"
                fullWidth
            >
                <BootstrapDialogTitle id="custom-dialog-title2" onClose={() => setModal2(false)}>
                    <b>{currentEditId === "" ? t('createRow') : t('editRow')}</b>
                </BootstrapDialogTitle>
                <DialogContent dividers>
                    {
                        loadEdit === false ?
                        <Grid container spacing={2}>
                            
                        </Grid> : <Skeleton />
                    }
                </DialogContent>
                <DialogActions>
                    <Button variant="contained" color={"primary"} onClick={() => { createUpdateTemplate(); }} sx={{ mr: 1.5, textTransform: "none" }}>{t('validate')}</Button>
                    <Button variant="contained" onClick={() => setModal2(false)} sx={buttonCloseStyles}>{t('close')}</Button>
                </DialogActions>
            </BootstrapDialog>
        </div>
    );
}

export default Templates;
