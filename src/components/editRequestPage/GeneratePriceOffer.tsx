import { useEffect, useRef, useState } from 'react';
import { BootstrapDialog, BootstrapDialogTitle, BootstrapInput, gridStyles, inputIconStyles, inputLabelStyles, sizeStyles, sizingStyles, whiteButtonStyles } from '../../utils/misc/styles';
import { Accordion, AccordionDetails, AccordionSummary, Alert, Autocomplete, Box, Button, Chip, Grid, IconButton, InputLabel, ListItem, ListItemButton, ListItemText, NativeSelect, Skeleton, Step, StepLabel, Stepper, TextField, ToggleButton, ToggleButtonGroup, Typography } from '@mui/material';
import { enqueueSnackbar } from 'notistack';
import { BackendService } from '../../utils/services/fetch';
import { protectedResources, pricingRequest } from '../../config/authConfig';
import { AuthenticationResult } from '@azure/msal-browser';
import { Anchor, Delete, ExpandMore, RestartAlt, Visibility } from '@mui/icons-material';
import { DataGrid, GridColDef, GridColumnHeaderParams, GridRenderCellParams, GridRowSelectionModel, GridToolbar, GridValueFormatterParams, GridValueGetterParams } from '@mui/x-data-grid';
import StarterKit from '@tiptap/starter-kit';
import { t } from 'i18next';
import React from 'react';
import { calculateTotal, checkCarrierConsistency, checkDifferentDefaultContainer, formatObject, formatServices, generateRandomNumber, getServices, getServicesTotal, getServicesTotal2, getTotalNumber, hashCode, myServices, removeDuplicatesWithLatestUpdated } from '../../utils/functions';
import AutocompleteSearch from '../shared/AutocompleteSearch';
import ContainerElement from './ContainerElement';
import ContainerPrice from './ContainerPrice';
import { RichTextEditor, MenuControlsContainer, MenuSelectHeading, MenuDivider, MenuButtonBold, MenuButtonItalic, MenuButtonStrikethrough, MenuButtonOrderedList, MenuButtonBulletedList, MenuSelectTextAlign, MenuButtonEditLink, MenuButtonHorizontalRule, MenuButtonUndo, MenuButtonRedo } from 'mui-tiptap';
import { RichTextEditorRef } from 'mui-tiptap';
import NewMiscellaneous from './NewMiscellaneous';
import RequestPriceHaulage from './RequestPriceHaulage';
import RequestPriceRequest from './RequestPriceRequest';
import useProcessStatePersistence from '../../utils/processes/useProcessStatePersistence';
import NewHaulage from './NewHaulage';
import NewSeafreight from './NewSeafreight';
import CompareOptions from './CompareOptions';

function createGetRequestUrl(url: string, variable2: string, variable3: string, variable4: string) {
    if (variable2) {
        url += 'HaulageType=' + encodeURIComponent(variable2) + '&';
    }
    if (variable3) {
        url += 'LoadingCity=' + encodeURIComponent(variable3) + '&';
    }
    if (variable4) {
        url += 'ContainerTypesId=' + variable4 + '&';
    }
    
    if (url.slice(-1) === '&') {
        url = url.slice(0, -1);
    }
    return url;
}

function createGetRequestUrl2(url: string, variable1: string, variable2: string, variable4: string) {
    if (variable1) {
        url += 'DeparturePortId=' + encodeURIComponent(variable1) + '&';
    }
    if (variable2) {
        url += 'DestinationPortId=' + encodeURIComponent(variable2) + '&';
    }
    
    if (url.slice(-1) === '&') {
        url = url.slice(0, -1);
    }
    return url;
}

const defaultTemplate = "65b74024891f9de80722fc6d";

function GeneratePriceOffer(props: any) {
    const { 
        context, account, instance, 
        id, email, tags, clientNumber, 
        departure, setDeparture, containersSelection, 
        loadingCity, setLoadingCity,
        portDestination, ports, products, ports1, ports2, containers 
    } = props;
    
    const [loadResults, setLoadResults] = useState<boolean>(false);
    const [loadGeneralMiscs, setLoadGeneralMiscs] = useState<boolean>(false);
    const [loadMiscsHaulage, setLoadMiscsHaulage] = useState<boolean>(false);
    const [loadNewOffer, setLoadNewOffer] = useState<boolean>(false);
    
    const [haulages, setHaulages] = useState<any>(null);
    const [seafreights, setSeafreights] = useState<any>(null);
    const [allSeafreights, setAllSeafreights] = useState<any>(null);
    const [miscs, setMiscs] = useState<any>([]); // Seafreight Miscs
    const [miscsHaulage, setMiscsHaulage] = useState<any>([]);
    const [generalMiscs, setGeneralMiscs] = useState<any>(null);
    const [tableMiscs, setTableMiscs] = useState<any>(null);
    
    const [tempToken, setTempToken] = useState<string>("");
    
    const [templates, setTemplates] = useState<any>([]);
    const [loadTemplates, setLoadTemplates] = useState<boolean>(false);
    const [templateBase, setTemplateBase] = useState<any>(null);
    const [loadTemplate, setLoadTemplate] = useState<boolean>(false);
    const [mailLanguage, setMailLanguage] = useState<string>("fr");

    const [modalRequestHaulage, setModalRequestHaulage] = useState<boolean>(false);
    const [modalRequestSeafreight, setModalRequestSeafreight] = useState<boolean>(false);
    const [modalNewMisc, setModalNewMisc] = useState<boolean>(false);
    const [modalHaulage, setModalHaulage] = useState<boolean>(false);
    const [modalSeafreight, setModalSeafreight] = useState<boolean>(false);
    const [modalCompare, setModalCompare] = useState<boolean>(false);
    
    const rteRef = useRef<RichTextEditorRef>(null);
    
    const [formState, setFormState] = useProcessStatePersistence(
        account?.name,
        'generatePriceOfferTest'+id,
        { 
            haulageType: "", selectedTemplate: defaultTemplate, 
            selectedHaulage: null, rowSelectionModel2: [],
            selectedSeafreight: null, rowSelectionModel: [], 
            selectedMisc: null, myMiscs: [], rowSelectionModel3: [],
            activeStep: 0, margins: containersSelection.map(() => 22), addings: containersSelection.map(() => 0),
            marginsMiscs: Array(15).fill(50), addingsMiscs: [],  
            portDeparture: null, portDestination: portDestination,
            selectedSeafreights: null, currentOption: 0, options: [] 
        },
        null, // Optionnel, par défaut à null (pas d'expiration)
        true // Optionnel, par défaut à true (sauvegarde automatique activée)
    );
    
    const handleChangeFormState = (value: any, name: string) => {
        setFormState({ ...formState, [name]: value });
    };
    
    const steps = [t('selectHaulage'), t('selectSeafreight'), t('selectMisc'), t('sendOffer')];
    const haulageTypeOptions = [
        { value: "On trailer, direct loading", label: t('haulageType1') },
        { value: "On trailer, Loading with Interval", label: t('haulageType2') },
        { value: "Side loader, direct loading", label: t('haulageType3') },
        { value: "Side loader, Loading with Interval, from trailer to floor", label: t('haulageType4') },
        { value: "Side loader, Loading with Interval, from floor to trailer", label: t('haulageType5') }
    ];

    const columnsSeafreights: GridColDef[] = [
        { field: 'carrierName', headerName: t('carrier'), flex: 1.25 },
        { field: 'carrierAgentName', headerName: t('carrierAgent'), flex: 1.25 },
        { field: 'frequency', headerName: t('frequency'), valueFormatter: (params: GridValueFormatterParams) => `${t('every')} ${params.value || ''} `+t('days'), flex: 0.75 },
        { field: 'transitTime', headerName: t('transitTime'), valueFormatter: (params: GridValueFormatterParams) => `${params.value || ''} `+t('days'), flex: 0.5 },
        { field: 'defaultContainer', headerName: t('prices'), renderCell: (params: GridRenderCellParams) => {
            return (
                <Box sx={{ my: 1, mr: 1 }}>
                    <Box>
                        {
                            params.row.containers[0] ? 
                            <ContainerPrice 
                                price={formatObject(params.row.containers[0])+" "+t(params.row.currency)}
                                seafreightPrice={formatServices(params.row.containers[0], t(params.row.currency), params.row.containers[0].container.packageName, 0) || "N/A"} 
                            /> : "N/A"
                        }
                    </Box>
                </Box>
            );
        }, renderHeader: (params: GridColumnHeaderParams) => t('prices'), flex: 1 },
        { field: 'validUntil', headerName: t('validUntil'), renderCell: (params: GridRenderCellParams) => {
            return (
                <Box sx={{ my: 1, mr: 1 }}>
                    <Chip label={(new Date(params.row.validUntil)).toLocaleDateString().slice(0,10)} color={(new Date()).getTime() - (new Date(params.row.validUntil)).getTime() > 0 ? "warning" : "success"}></Chip>
                </Box>
            );
        }, flex: 0.75 },
        { field: 'comment', headerName: "Comment", renderCell: (params: GridRenderCellParams) => {
            return (
                <Box sx={{ my: 2 }}>
                    {params.row.comment}
                </Box>
            );
        }, flex: 1.25 },
    ];

    const columnsHaulages: GridColDef[] = [
        { field: 'haulierName', headerName: t('haulier'), flex: 1.3 },
        { field: 'loadingPort', headerName: t('loadingPort'), renderCell: (params: GridRenderCellParams) => {
            return (
                <Box sx={{ my: 2 }}>{params.row.loadingPort}</Box>
            );
        }, flex: 1 },
        { field: 'containerNames', headerName: t('containers'), renderCell: (params: GridRenderCellParams) => {
            return (
                <Box sx={{ my: 2 }}>{params.row.containerNames.join(", ")}</Box>
            );
        }, minWidth: 100, flex: 0.75 },
        { field: 'unitTariff', valueGetter: (params: GridValueGetterParams) => `${params.row.unitTariff || ''} ${t(params.row.currency)}`, renderHeader: (params: GridColumnHeaderParams) => (<>Haulage <br />per unit</>), flex: 0.75 },
        { field: 'freeTime', headerName: t('freeTime'), valueFormatter: (params: GridValueFormatterParams) => `${params.value || ''} ${t('hours')}`, flex: 0.5 },
        { field: 'overtimeTariff', headerName: t('overtimeTariff'), valueGetter: (params: GridValueGetterParams) => `${params.row.overtimeTariff || ''} ${t(params.row.currency)} / ${t('hour')}`, renderHeader: (params: GridColumnHeaderParams) => (<>Overtime <br />tariff</>), flex: 0.75 },
        { field: 'multiStop', headerName: t('multiStop'), valueGetter: (params: GridValueGetterParams) => `${params.row.multiStop || ''} ${t(params.row.currency)}`, flex: 0.5 },
        { field: 'validUntil', headerName: t('validUntil'), renderCell: (params: GridRenderCellParams) => {
            return (
                <Box sx={{ my: 1, mr: 1 }}>
                    <Chip label={(new Date(params.row.validUntil)).toLocaleDateString().slice(0,10)} color={(new Date()).getTime() - (new Date(params.row.validUntil)).getTime() > 0 ? "warning" : "success"}></Chip>
                </Box>
            );
        }, flex: 0.75 },
        { field: 'comment', headerName: "Comment", renderCell: (params: GridRenderCellParams) => {
            return (
                <Box sx={{ my: 2 }}>
                    {params.row.comment}
                </Box>
            );
        }, flex: 1.25 },
    ];

    const columnsMiscs: GridColDef[] = [
        { field: 'supplierName', headerName: t('supplier'), flex: 2.7 },
        { field: 'costTotal', headerName: t('costPrices'), renderCell: (params: GridRenderCellParams) => {
            return (
                <Box sx={{ my: 1, mr: 1 }}>
                    <Box>
                        {
                            params.row.containers !== null ?
                            params.row.containers[0] ? 
                            <>{calculateTotal(params.row.containers)+" "+t(params.row.currency)}</> : "N/A" : null
                        }
                    </Box>
                </Box>
            );
        }, flex: 1.75 },
        { field: 'textServices', headerName: 'Services', renderCell: (params: GridRenderCellParams) => {
            return (
                <Box sx={{ my: 1, mr: 1 }}>
                    {
                        params.row.containers !== null ? params.row.containers[0] ? <>{getServicesTotal(params.row.containers, t(params.row.currency), 0)}</> : "N/A" : null
                    }
                </Box>
            );
        }, flex: 4 },
        // { field: 'textServices', headerName: t('costPrices'), flex: 2 },
        { field: 'validUntil', headerName: t('validUntil'), renderCell: (params: GridRenderCellParams) => {
            return (
                <Box sx={{ my: 1, mr: 1 }}>
                    <Chip label={(new Date(params.row.validUntil)).toLocaleDateString().slice(0,10)} color={(new Date()).getTime() - (new Date(params.row.validUntil)).getTime() > 0 ? "warning" : "success"}></Chip>
                </Box>
            );
        }, flex: 1.25 },
        { field: 'comment', headerName: "Comment", renderCell: (params: GridRenderCellParams) => {
            return (
                <Box sx={{ my: 2 }}>
                    {params.row.comment}
                </Box>
            );
        }, flex: 2.5 },
    ];
        
    const handleMarginChange = (index: number, value: any) => {
        const updatedMargins: any = [...formState.margins];
        updatedMargins[index] = value;
        setFormState({...formState, margins: updatedMargins});
    };
    
    const handleAddingChange = (index: number, value: any) => {
        const updatedAddings: any = [...formState.addings];
        updatedAddings[index] = value;
        setFormState({...formState, addings: updatedAddings});
    };
    
    const handleMarginMiscChange = (index: number, value: any) => {
        const updatedMarginMiscs: any = [...formState.marginsMiscs];
        updatedMarginMiscs[index] = value;
        setFormState({...formState, marginsMiscs: updatedMarginMiscs});
    };
    
    const handleAddingMiscChange = (index: number, value: any) => {
        const updatedAddingMiscs: any = [...formState.addingMiscs];
        updatedAddingMiscs[index] = value;
        setFormState({...formState, addingMiscs: updatedAddingMiscs});
    };
    
    useEffect(() => {
        if (loadingCity !== null) {
            getHaulagePriceOffers();
        }
    }, [loadingCity]);

    // useEffect(() => {
    //     console.log("Form State : ", formState);
    // }, [formState]);
    
    useEffect(() => {
        getTemplate(formState.selectedTemplate);
        getTemplates();
    }, []);
    
    useEffect(() => {
        getTemplate(formState.selectedTemplate);
    }, [formState.selectedTemplate]);

    // useEffect(() => {
    //     getSeaFreightPriceOffers();
    // }, [formState.portDestination]);

    // useEffect(() => {
    //     // Initialize margins with default value 22 and addings with default value 0
    //     const initialMargins = containersSelection.map(() => 22); // Default margin 22
    //     const initialAddings = containersSelection.map(() => 0); // Default adding 0
        
    //     // setMargins(initialMargins);
    //     // setAddings(initialAddings);
    // }, [containersSelection]); // Assuming containersSelection is a prop or state
    
    useEffect(() => {
        if (generalMiscs !== null && miscs !== null && miscsHaulage !== null) {
            setTableMiscs([...miscsHaulage, ...miscs, ...generalMiscs]);
        }
    }, [generalMiscs, miscs, miscsHaulage]);
    

    useEffect(() => {
        if (formState.activeStep === 2 && generalMiscs === null && seafreights !== null) {
            getMiscellaneousPriceOffers();
            getHaulageMiscellaneousPriceOffers();
            getGeneralMiscellaneousPriceOffers();
        }
        if (formState.activeStep === 3 && seafreights === null) {
            getSeaFreightPriceOffers();
        }
    }, [formState.activeStep, seafreights]);

    // Stepper functions
    const [skipped, setSkipped] = React.useState(new Set<number>());

    const isStepOptional = (step: number) => {
        return step === 0;
        // return false;
    };

    const isStepSkipped = (step: number) => {
        return skipped.has(step);
    };

    const handleNext = () => {
        let newSkipped = skipped;
        if (isStepSkipped(formState.activeStep)) {
            newSkipped = new Set(newSkipped.values());
            newSkipped.delete(formState.activeStep);
        }
        if (formState.activeStep === 0) {
            if (formState.selectedHaulage !== null && formState.selectedHaulage !== undefined) {
                setLoadResults(true);
                getSeaFreightPriceOffers();
                
                setFormState({
                    ...formState, 
                    portDeparture: ports1.find((elm: any) => elm.portId === formState.selectedHaulage.loadingPortId), 
                    activeStep: formState.activeStep !== undefined ? formState.activeStep + 1 : 0 
                });
                setSkipped(newSkipped);
            }
            else {
                enqueueSnackbar(t('youNeedSelectHaulage'), { variant: "warning", anchorOrigin: { horizontal: "right", vertical: "top"} });
            }
        }
        if (formState.activeStep === 1) {
            // Check if seafreights have the same carrier
            var seafreightSelected = formState.selectedSeafreights;
            if (checkCarrierConsistency(seafreightSelected) || (!checkCarrierConsistency(seafreightSelected) && window.confirm("All the selected offers must be related to the same carrier, do you want to continue?"))) {
                if (formState.selectedSeafreight !== null && formState.selectedSeafreight !== undefined) {
                    if (formState.selectedMisc === null && formState.selectedMisc === undefined) {
                        setLoadResults(true);
                        getMiscellaneousPriceOffers();
                    }
                    if (formState.selectedHaulage !== null && formState.selectedHaulage !== undefined) {
                        setLoadMiscsHaulage(true);
                        getHaulageMiscellaneousPriceOffers();
                    }
                    
                    setLoadGeneralMiscs(true);
                    getGeneralMiscellaneousPriceOffers();
                    
                    setFormState({...formState, activeStep: formState.activeStep !== undefined ? formState.activeStep + 1 : 0 });
                    setSkipped(newSkipped);
                }
                else {
                    enqueueSnackbar(t('youNeedSelectSeafreight'), { variant: "warning", anchorOrigin: { horizontal: "right", vertical: "top"} });
                }
            }
        }
        if (formState.activeStep === 2) {
            setFormState({...formState, activeStep: formState.activeStep !== undefined ? formState.activeStep + 1 : 0 });
            setSkipped(newSkipped);
        }
        if (formState.activeStep === 3) {
            createNewOffer();
        }
    };

    const handleBack = () => {
        setFormState({...formState, activeStep: formState.activeStep !== undefined ? formState.activeStep - 1 : 0 });
    };

    const handleSkip = () => {
        if (!isStepOptional(formState.activeStep)) {
            throw new Error("You can't skip a step that isn't optional.");
        }
        if (formState.activeStep === 0) {
            setLoadResults(true);
            getSeaFreightPriceOffers();
        }

        setFormState({...formState, activeStep: formState.activeStep !== undefined ? formState.activeStep + 1 : 0 });
        setSkipped((prevSkipped) => {
            const newSkipped = new Set(prevSkipped.values());
            newSkipped.add(formState.activeStep);
            return newSkipped;
        });
    };

    const handleReset = () => {
        setFormState({...formState, activeStep: 0 });
    };

    function displayContainers(value: any) {
        var aux = value.map((elm: any, index: number) => {
            if (calculateSeafreightPrice(elm.container, elm.quantity, index) !== 0) {
                return '<li>'+elm.quantity+"x"+elm.container+'</li>';
            }
            else {
                return null;
            }
        }).join('');
        return '<ul>'+aux+'</ul>';
    }


    function totalCalculatePrice(type: string, quantity: number, index: number, option: any) {
        // Calculate seafreight prices
        var seafreightPrices = 0;
        var seafreightSelected = seafreights !== null ? option.selectedSeafreights.find((elm: any) => elm.containers[0].container.packageName === type) : null;
        if (seafreightSelected !== null && seafreightSelected !== undefined) {
            seafreightPrices = seafreightSelected.containers[0].services.reduce((sum: number, service: any) => sum + service.price, 0)*quantity;
        }
        
        // Calculate haulage prices
        var haulagePrices = 0;
        if (option.selectedHaulage !== null && option.selectedHaulage !== undefined && option.selectedHaulage.containerNames.includes(type)) {
            haulagePrices = haulagePrices + option.selectedHaulage.unitTariff*quantity;
        } 
        
        // Calculate miscellaneous prices
        var miscPrices = 0;
        var allMiscs = option.myMiscs;
        var miscsSelected = allMiscs.filter((elm: any) => elm.defaultContainer === type);
        if (miscsSelected !== null && miscsSelected !== undefined) {
            for (var i = 0; i < miscsSelected.length; i++) {
                miscPrices =  miscPrices + getTotalNumber(miscsSelected[i].containers)*quantity;
            }
        }
        
        var finalValue = ((seafreightPrices+haulagePrices+miscPrices)*(option.margins[index]/100)+seafreightPrices+haulagePrices+miscPrices).toFixed(2);
        return Number(finalValue)+Number(option.addings[index]);
    }

    function calculateContainerPrice(type: string, quantity: number, index: number) {
        // Calculate seafreight prices
        var seafreightPrices = 0;
        var seafreightSelected = seafreights !== null ? formState.selectedSeafreights.find((elm: any) => elm.containers[0].container.packageName === type) : null;
        if (seafreightSelected !== null && seafreightSelected !== undefined) {
            seafreightPrices = seafreightSelected.containers[0].services.reduce((sum: number, service: any) => sum + service.price, 0)*quantity;
        }
        
        // Calculate haulage prices
        var haulagePrices = 0;
        if (formState.selectedHaulage !== null && formState.selectedHaulage !== undefined && formState.selectedHaulage.containerNames.includes(type)) {
            haulagePrices = haulagePrices + formState.selectedHaulage.unitTariff*quantity;
        } 
        
        // Calculate miscellaneous prices
        var miscPrices = 0;
        var allMiscs = formState.myMiscs;
        var miscsSelected = allMiscs.filter((elm: any) => elm.defaultContainer === type);
        if (miscsSelected !== null && miscsSelected !== undefined) {
            for (var i = 0; i < miscsSelected.length; i++) {
                miscPrices =  miscPrices + getTotalNumber(miscsSelected[i].containers)*quantity;
            }
        }
        
        var finalValue = ((seafreightPrices+haulagePrices+miscPrices)*(formState.margins[index]/100)+seafreightPrices+haulagePrices+miscPrices).toFixed(2);
        return Number(finalValue)+Number(formState.addings[index]);
    }

    function calculateSeafreightPrice(type: string, quantity: number, index: number) {
        // Calculate seafreight prices
        var seafreightPrices = 0;
        if (seafreights !== null) {
            var seafreightSelected = formState.selectedSeafreights.find((elm: any) => elm.containers[0].container.packageName === type);
            if (seafreightSelected !== null && seafreightSelected !== undefined) {
                seafreightPrices = seafreightSelected.containers[0].services.reduce((sum: number, service: any) => sum + service.price, 0)*quantity;
            }
        }
        // Calculate haulage prices
        var haulagePrices = 0;
        // Calculate miscellaneous prices
        var miscPrices = 0;
        // I removed miscPrices temporarily
        var finalValue = ((seafreightPrices+haulagePrices+miscPrices)*(formState.margins[index]/100)+seafreightPrices+haulagePrices+miscPrices).toFixed(2);
        return Number(finalValue)+Number(formState.addings[index]);
    }

    const getHaulagePriceOffers = async () => {
        if (context && account) {
            const token = await instance.acquireTokenSilent({
                scopes: pricingRequest.scopes,
                account: account
            })
            .then((response: AuthenticationResult) => {
                return response.accessToken;
            })
            .catch((err: any) => {
                console.log(err);
                return instance.acquireTokenPopup({
                    ...pricingRequest,
                    account: account
                }).then((response: any) => {
                    return response.accessToken;
                });
            });
            setTempToken(token);
            
            setLoadResults(true);
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

            // I removed the loadingDate
            var containersFormatted = (containersSelection.map((elm: any) => elm.id)).join("&ContainerTypesId="); 
            var urlSent = createGetRequestUrl(protectedResources.apiLisPricing.endPoint+"/Pricing/HaulagesOfferRequest?", formState.haulageType, city, containersFormatted);
            const response = await (context as BackendService<any>).getWithToken(urlSent, token);
            setLoadResults(false);
            setHaulages(removeDuplicatesWithLatestUpdated(response));
        }
    }

    const getSeaFreightPriceOffers = async () => {
        if (context && account) {
            const token = await instance.acquireTokenSilent({
                scopes: pricingRequest.scopes,
                account: account
            })
            .then((response: AuthenticationResult) => {
                return response.accessToken;
            })
            .catch((err: any) => {
                console.log(err);
                return instance.acquireTokenPopup({
                    ...pricingRequest,
                    account: account
                }).then((response: any) => {
                    return response.accessToken;
                });
            });
            setTempToken(token);
            
            setLoadResults(true);
            var containersFormatted = (containersSelection.map((elm: any) => elm.id)).join("&ContainerTypesId=");
            
            var auxPortDeparture = formState.portDeparture;
            if (formState.selectedHaulage !== null && formState.selectedHaulage !== undefined) {
                auxPortDeparture = ports1.find((elm: any) => elm.portId === formState.selectedHaulage.loadingPortId);
            }

            if (auxPortDeparture !== undefined && auxPortDeparture !== null && formState.portDestination !== undefined && formState.portDestination !== null) {
                var urlSent = createGetRequestUrl2(protectedResources.apiLisPricing.endPoint+"/Pricing/SeaFreightsOffersRequest?", auxPortDeparture.portId, formState.portDestination.portId, containersFormatted);
                const response = await (context as BackendService<any>).getWithToken(urlSent, token);
                var myContainers = containersSelection.map((elm: any) => elm.container);
                setAllSeafreights(response);
                setSeafreights(response.filter((elm: any) => myContainers.includes(elm.containers[0].container.packageName)).map((elm: any) => { return {...elm, defaultContainer: elm.containers[0].container.packageName}}));
            }
            else {
                console.log("Port departure : ", auxPortDeparture);
            }
            setLoadResults(false);
        }
    }

    const getMiscellaneousPriceOffers = async () => {
        setLoadResults(true);
        if (context && account) {
            const response = await (context as BackendService<any>).getWithToken(protectedResources.apiLisPricing.endPoint+"/Miscellaneous/Miscellaneous?departurePortId="+formState.portDeparture.portId+"&destinationPortId="+formState.portDestination.portId+"&withShipment=true", tempToken);
            
            var myContainers = containersSelection.map((elm: any, index: any) => {
                if (calculateSeafreightPrice(elm.container, elm.quantity, index) !== 0) {
                    return elm.container;
                }
                return null;
            });
            
            var myFreights = formState.rowSelectionModel.length !== 0 && seafreights !== null ? formState.selectedSeafreights : [];
            var suppliersRecentlySelected = myFreights.map((elm: any) => { return {carrierName: elm.carrierName, defaultContainer: elm.defaultContainer} });
            
            var arrayFinal = response.length !== 0 ? 
                response[0].suppliers.filter((elm: any) => myContainers.includes(elm.containers[0].container.packageName)).filter((elm: any) => new Date(elm.validUntil) > new Date()).filter((elm: any) => suppliersRecentlySelected.some((val: any) => val.carrierName === elm.supplierName && val.defaultContainer === elm.containers[0].container.packageName)).map((elm: any) => { return {...elm, defaultContainer: elm.containers[0].container.packageName}})
            : [];
            setMiscs(arrayFinal);
            setLoadResults(false);
        }
    }

    const getGeneralMiscellaneousPriceOffers = async () => {
        setLoadGeneralMiscs(true);
        if (context && account) {
            var response = await (context as BackendService<any>).getWithToken(protectedResources.apiLisPricing.endPoint+"/Miscellaneous/Miscellaneous?withShipment=false", tempToken);
            
            var myFreights = formState.rowSelectionModel.length !== 0 && seafreights !== null ? formState.selectedSeafreights : [];
            var suppliersRecentlySelected = myFreights.map((elm: any) => { return {carrierName: elm.carrierName, defaultContainer: elm.defaultContainer} });
            
            var arrayFinal = response.length !== 0 ? 
                response
                .filter((elm: any) => new Date(elm.validUntil) > new Date())
                .filter((elm: any) => suppliersRecentlySelected.some((val: any) => val.defaultContainer === elm.containers[0].container.packageName || elm.containers[0].container.packageName === null))
                .map((elm: any) => { return {
                    ...elm, 
                    textServices: elm.containers !== null ? elm.containers[0] ? getServicesTotal(elm.containers, t(elm.currency), 0) : "N/A" : null,
                    costTotal: elm.containers !== null ? elm.containers[0] ? getTotalNumber(elm.containers) : "N/A" : null
                }})
            : [];
            setGeneralMiscs(arrayFinal);
            setLoadGeneralMiscs(false);
        }
    }

    const getHaulageMiscellaneousPriceOffers = async () => {
        setLoadMiscsHaulage(true)
        if (context && account) {
            var postalCode = loadingCity !== null ? loadingCity.postalCode !== undefined ? loadingCity.postalCode : "" : ""; 
            var city = "";
            if (postalCode !== "") {
                if (postalCode === null) {
                    city = loadingCity.city;
                }
                else {
                    city = loadingCity.city+' '+postalCode;
                }
            }
            
            var myContainers = containersSelection.map((elm: any, index: any) => {
                if (calculateSeafreightPrice(elm.container, elm.quantity, index) !== 0) {
                    return elm.container;
                }
                return null;
            });
            
            const response = await (context as BackendService<any>).getWithToken(protectedResources.apiLisPricing.endPoint+"/Miscellaneous/Miscellaneous?supplierId="+formState.selectedHaulage.haulierId+"&departurePortId="+Number(hashCode(city))+"&destinationPortId="+formState.selectedHaulage.loadingPortId+"&withShipment=true", tempToken);
            
            var arrayFinal = response.length !== 0 ? response[0].suppliers.filter((elm: any) => myContainers.includes(elm.containers[0].container.packageName)).filter((elm: any) => new Date(elm.validUntil) > new Date()) : [];
            setMiscsHaulage(arrayFinal);
            setLoadMiscsHaulage(false);
        }
    }

    const createNewOffer = async () => {
        if (formState.selectedSeafreight !== null && formState.selectedSeafreight !== undefined) {
            if (context && account) {
                setLoadNewOffer(true);
                var haulage = null;
                var miscellaneous = null;
                if (formState.selectedHaulage !== null && formState.selectedHaulage !== undefined) {
                    haulage = {
                        "id": formState.selectedHaulage.id,
                        "haulierId": 0,
                        "haulierName": formState.selectedHaulage.haulierName,
                        "currency": formState.selectedHaulage.currency,
                        "loadingCityName": formState.selectedHaulage.loadingPort,
                        "freeTime": formState.selectedHaulage.freeTime,
                        "multiStop": formState.selectedHaulage.multiStop,
                        "overtimeTariff": formState.selectedHaulage.overtimeTariff,
                        "unitTariff": formState.selectedHaulage.unitTariff,
                        "haulageType": formState.haulageType,
                        // "loadingPort": loadingCity.name,
                        "loadingPort": loadingCity.city,
                        "validUntil": formState.selectedHaulage.validUntil,
                        // "loadingPortId": loadingCity.id,
                        "containerNames": [null]
                    }
                }
                if (formState.selectedMisc !== undefined && formState.selectedMisc !== null) {
                    miscellaneous = formState.myMiscs.map((elm: any) => {
                        return {
                            "id": elm.miscellaneousId,
                            "departurePortId": null,
                            "destinationPortId": null,
                            "departurePortName": null,
                            "destinationPortName": null,
                            "supplierId": 0,
                            "supplierName": elm.supplierName,
                            "currency": elm.currency,
                            "price20": elm.total20,
                            "price40": elm.total40,
                            "price20dry": elm.total20Dry,
                            "price20rf": elm.total20RF,
                            "price40dry": elm.total40Dry,
                            "price40hc": elm.total40HC,
                            "price40hcrf": elm.total40HCRF,
                            "validUntil": elm.validUntil,
                        }
                    })
                }
                var dataSent = {
                    "requestQuoteId": Number(id),
                    "comment": rteRef.current?.editor?.getHTML(),
                    // "quoteOfferNumber": transformId(uuidv4()),
                    "quoteOfferVm": 0,
                    "quoteOfferId": 10,
                    "quoteOfferNumber": generateRandomNumber(),
                    "createdBy": account?.username,
                    "emailUser": email,
                    "haulage": haulage,
                    "miscellaneousList": miscellaneous,
                    "seaFreight": {
                        "id": formState.selectedSeafreight.seaFreightId,
                        "departurePortId": formState.portDeparture.portId,
                        "destinationPortId": formState.portDestination.portId,
                        "departurePortName": formState.selectedSeafreight.departurePortName,
                        "destinationPortName": formState.portDestination.portName,
                        "carrierId": 0,
                        "carrierName": formState.selectedSeafreight.carrierName,
                        "carrierAgentId": 0,
                        "carrierAgentName": formState.selectedSeafreight.carrierAgentName,
                        "currency": formState.selectedSeafreight.currency,
                        "transitTime": formState.selectedSeafreight.transitTime,
                        "frequency": formState.selectedSeafreight.frequency,
                        "price20dry": formState.selectedSeafreight.price20dry,
                        "price20rf": formState.selectedSeafreight.price20rf,
                        "price40dry": formState.selectedSeafreight.price40dry,
                        "price40hc": formState.selectedSeafreight.price40hc,
                        "price40hcrf": formState.selectedSeafreight.price40hcrf,
                        "validUntil": formState.selectedSeafreight.validUntil,
                    },
                    "containers": containersSelection.map((elm: any) => { return { "containerId": elm.id, quantity: elm.quantity } }),
                    "departureDate": (new Date("01/01/2022")).toISOString(),
                    "departurePortId": formState.portDeparture.portId,
                    "destinationPortId": formState.portDestination.portId,
                    "margin": 0,
                    "reduction": 0,
                    "extraFee": 0,
                    "totalPrice": 0
                };
                const response = await (context as BackendService<any>).postReturnJson(protectedResources.apiLisOffer.endPoint+"/QuoteOffer", dataSent);
                
                if (response !== null) {
                    enqueueSnackbar(t('offerSuccessSent'), { variant: "success", anchorOrigin: { horizontal: "right", vertical: "top"} });
                    setLoadNewOffer(false);
                }
                else {
                    enqueueSnackbar(t('errorHappened'), { variant: "error", anchorOrigin: { horizontal: "right", vertical: "top"} });
                    setLoadNewOffer(false);
                }
            }
        }
        else {
            enqueueSnackbar(t('contentEmpty'), { variant: "error", anchorOrigin: { horizontal: "right", vertical: "top"} });
        }
    }

    const getTemplates = async () => {
        if (context && account) {
            const response = await (context as BackendService<any>).getSingle(protectedResources.apiLisTemplate.endPoint+"/Template?Tags=offer");
            if (response !== null && response.data !== undefined) {
                setTemplates(response.data);
                setLoadTemplates(false);
            }
            else {
                setLoadTemplates(false);
            }
        }
    }
    
    // Work on the template
    const getTemplate = async (id: string) => {
        setLoadTemplate(true)
        if (context && account) {
            const response = await (context as BackendService<any>).getSingle(protectedResources.apiLisTemplate.endPoint+"/Template/"+id);
            if (response !== null && response !== undefined) {
                setTemplateBase(response.data);
                setLoadTemplate(false);
            }
            else {
                setLoadTemplate(false);
            }
        }
    }
    
    // Fonction pour remplacer les variables dans le template
    function generateEmailContent(template: string, variables: any) {
        var textToRemove = formState.selectedHaulage !== null && formState.selectedHaulage !== undefined ? "" : "Chargement de {{freeTime}} heures inclus pour chaque conteneur, ensuite de {{overtimeTariff}} EUR par heure indivisible.";
        var textToRemove2 = formState.selectedHaulage !== null && formState.selectedHaulage !== undefined ? "" : "Loading of {{freeTime}} hours included for each container, then {{overtimeTariff}} EUR per indivisible hour.";
        return template.replace(textToRemove,"").replace(textToRemove2,"").replace(/\{\{(.*?)\}\}/g, (_, variableName: any) => {
            const trimmedName = variableName.trim();
            // Si la variable est non nulle/vide, l'encapsuler dans <strong>
            if (variables[trimmedName]) {
                return `<strong>${variables[trimmedName]}</strong>`;
            } 
            else {
                return `{{${trimmedName}}}`; // Laisser le placeholder si la variable est nulle/vide
            }
        });
    }

    function getDefaultContent(template: any) {
        var postalCode = departure !== null ? departure.postalCode !== undefined ? departure.postalCode : "" : ""; 
        var loadingCity = departure !== null ? departure.city.toUpperCase()+', '+departure.country.toUpperCase() : "";
        if (postalCode !== "") {
            loadingCity = departure.city.toUpperCase()+', '+postalCode+', '+departure.country.toUpperCase();
        }
        
        var destinationPort = formState.portDestination !== undefined && formState.portDestination !== null ? formState.portDestination.portName+', '+formState.portDestination.country.toUpperCase() : "";
        var commodities:any = tags.map((elm: any) => elm.productName).join(',');
        
        // var auxServices = formState.myMiscs;
        // var listServices = auxServices !== null && auxServices.length !== 0 && templateBase !== null ? 
        //     auxServices.map((elm: any, index: number) => elm.defaultContainer !== null ? "<p>- "+getServices(elm.containers, elm.currency)+" "+t('included', { lng: templateBase.currentVersion.includes("English") ? "en" : "fr" })+"</p>" : "<p>- "+getServicesTotal(elm.containers, elm.currency, formState.marginsMiscs[index])+" "+t('additionals', { lng: templateBase.currentVersion.includes("English") ? "en" : "fr" })+"</p>").join("")
        // : "<br>";
        var listServices = "";
        
        var auxPricesContainers = [];
        if (templateBase !== null) {
            for (var i = 0; i < formState.options.length; i++) {
                var option: any = formState.options[i];
                var auxPricesTotal = containersSelection !== null && option.selectedSeafreight !== null && option.selectedSeafreight !== undefined && seafreights !== null ? 
                containersSelection.map((elm: any, index: number) => {
                    var auxFrequency = 0;
                    var auxTransitTime = "";
                    var aux1 = option.selectedSeafreights.find((val: any) => val.defaultContainer === elm.container);
                    // console.log(aux1);
                    if (aux1 !== undefined && templateBase !== null) {
                        if (aux1 !== undefined) {
                            auxFrequency = aux1.frequency;
                            auxTransitTime = aux1.transitTime;
                        }
                        return "<strong>"+totalCalculatePrice(elm.container, elm.quantity, index, option)+" "+option.selectedSeafreight.currency+" / "+elm.container
                        +" / "+t('every', { lng: templateBase.currentVersion.includes("English") ? "en" : "fr" })+" "+auxFrequency
                        +" "+t('days', { lng: templateBase.currentVersion.includes("English") ? "en" : "fr" })+" / "+t('transitTime', { lng: templateBase.currentVersion.includes("English") ? "en" : "fr" })+" : "+auxTransitTime
                        +" "+t('days', { lng: templateBase.currentVersion.includes("English") ? "en" : "fr" })+"</strong><br>"
                    }
                    else {
                        return null;
                    }
                }).join("") : "";
    
                var auxPricesPrecisions = option.selectedHaulage !== undefined && option.selectedHaulage !== null && templateBase !== null ? 
                    t('loadingOf', { lng: templateBase.currentVersion.includes("English") ? "en" : "fr" })+option.selectedHaulage.freeTime
                    +t('includedForEachContainer', { lng: templateBase.currentVersion.includes("English") ? "en" : "fr" })+option.selectedHaulage.overtimeTariff
                    +t('byHourIndivisible', { lng: templateBase.currentVersion.includes("English") ? "en" : "fr" }) 
                : "";
    
                var auxPricesServices = option.myMiscs !== null && option.myMiscs.length !== 0 && templateBase !== null ? 
                    option.myMiscs.map((elm: any, index: number) => elm.defaultContainer !== null ? "<p>- "+getServices(elm.containers, elm.currency)+" "+t('included', { lng: templateBase.currentVersion.includes("English") ? "en" : "fr" })+"</p>" : "<p>- "+getServicesTotal(elm.containers, elm.currency, option.marginsMiscs[index])+" "+t('additionals', { lng: templateBase.currentVersion.includes("English") ? "en" : "fr" })+"</p>").join("")
                : "<br>";
    
                auxPricesContainers.push("<p># "+t('offer', { lng: templateBase.currentVersion.includes("English") ? "en" : "fr" }).toUpperCase()+" "+Number(i+1)+"<p/>"+auxPricesTotal+auxPricesPrecisions+auxPricesServices);
            }
        }
        var pricesContainers = templateBase !== null ? auxPricesContainers.join("<p>"+t('', { lng: templateBase.currentVersion.includes("English") ? "en" : "fr" })+"</p>") : "";    
        
        // var pricesContainers = containersSelection !== null && formState.selectedSeafreight !== null && formState.selectedSeafreight !== undefined ? 
        // containersSelection.map((elm: any, index: number) => {
        //     var auxFrequency = 0;
        //     var auxTransitTime = "";
        //     var aux1 = seafreights !== undefined && seafreights !== null ? formState.selectedSeafreights.find((val: any) => val.defaultContainer === elm.container) : [];
        //     if (calculateSeafreightPrice(elm.container, elm.quantity, index) !== 0 && templateBase !== null) {
        //         if (aux1 !== undefined) {
        //             auxFrequency = aux1.frequency;
        //             auxTransitTime = aux1.transitTime;
        //         }
        //         return "<p><strong>"+calculateContainerPrice(elm.container, elm.quantity, index)+" "
        //         +formState.selectedSeafreight.currency+" / "+elm.container
        //         +" / "+t('every', { lng: templateBase.currentVersion.includes("English") ? "en" : "fr" })+" "+auxFrequency
        //         +" "+t('days', { lng: templateBase.currentVersion.includes("English") ? "en" : "fr" })+" / "+t('transitTime', { lng: templateBase.currentVersion.includes("English") ? "en" : "fr" })+" : "+auxTransitTime
        //         +" "+t('days', { lng: templateBase.currentVersion.includes("English") ? "en" : "fr" })+"</strong></p>"
        //     }
        //     else {
        //         return null;
        //     }
        // }).join("") : "";
        
        var clientName = clientNumber !== null ? clientNumber.contactName : null;
        var freeTime = formState.selectedHaulage !== null && formState.selectedHaulage !== undefined ? formState.selectedHaulage.freeTime : "";
        var overtimeTariff = formState.selectedHaulage !== null && formState.selectedHaulage !== undefined ? formState.selectedHaulage.overtimeTariff : "";
        var frequency = formState.selectedSeafreight !== null && formState.selectedSeafreight !== undefined ? formState.selectedSeafreight.frequency : "";
        var transitTime = formState.selectedSeafreight !== null && formState.selectedSeafreight !== undefined ? formState.selectedSeafreight.transitTime : "";
        var containersQuantities = displayContainers(containersSelection);

        const variables = { loadingCity, destinationPort, commodities, clientName, freeTime, overtimeTariff, frequency, transitTime, containersQuantities, listServices, pricesContainers };
        return generateEmailContent(template, variables);
    }

    useEffect(() => {
        var postalCode = departure !== null ? departure.postalCode !== undefined ? departure.postalCode : "" : ""; 
        var loadingCity = departure !== null ? departure.city.toUpperCase()+', '+departure.country.toUpperCase() : "";
        if (postalCode !== "") {
            loadingCity = departure.city.toUpperCase()+', '+postalCode+', '+departure.country.toUpperCase();
        }
        
        var destinationPort = formState.portDestination !== undefined && formState.portDestination !== null ? formState.portDestination.portName+', '+formState.portDestination.country.toUpperCase() : "";
        var commodities:any = tags.map((elm: any) => elm.productName).join(',');
        
        // var auxServices = formState.myMiscs;
        // var listServices = auxServices !== undefined && auxServices !== null && auxServices.length !== 0 && templateBase !== null ? 
        //     auxServices.map((elm: any, index: number) => elm.defaultContainer !== null ? "<p>- "+getServices(elm.containers, elm.currency)+" "+t('included', { lng: templateBase.currentVersion.includes("English") ? "en" : "fr" })+"</p>" : "<p>- "+getServicesTotal(elm.containers, elm.currency, formState.marginsMiscs[index])+" "+t('additionals', { lng: templateBase.currentVersion.includes("English") ? "en" : "fr" })+"</p>").join("")
        // : "<br>";
        var listServices = "";
        
        var auxPricesContainers = [];
        if (templateBase !== null) {
            for (var i = 0; i < formState.options.length; i++) {
                var option: any = formState.options[i];
                var auxPricesTotal = containersSelection !== null && option.selectedSeafreight !== null && option.selectedSeafreight !== undefined && seafreights !== null ? 
                containersSelection.map((elm: any, index: number) => {
                    var auxFrequency = 0;
                    var auxTransitTime = "";
                    var aux1 = option.selectedSeafreights.find((val: any) => val.defaultContainer === elm.container);
                    // console.log(aux1);
                    if (aux1 !== undefined && templateBase !== null) {
                        if (aux1 !== undefined) {
                            auxFrequency = aux1.frequency;
                            auxTransitTime = aux1.transitTime;
                        }
                        return "<strong>"+totalCalculatePrice(elm.container, elm.quantity, index, option)+" "+option.selectedSeafreight.currency+" / "+elm.container
                        +" / "+t('every', { lng: templateBase.currentVersion.includes("English") ? "en" : "fr" })+" "+auxFrequency
                        +" "+t('days', { lng: templateBase.currentVersion.includes("English") ? "en" : "fr" })+" / "+t('transitTime', { lng: templateBase.currentVersion.includes("English") ? "en" : "fr" })+" : "+auxTransitTime
                        +" "+t('days', { lng: templateBase.currentVersion.includes("English") ? "en" : "fr" })+"</strong><br>"
                    }
                    else {
                        return null;
                    }
                }).join("") : "";
    
                var auxPricesPrecisions = option.selectedHaulage !== undefined && option.selectedHaulage !== null && templateBase !== null ? 
                    t('loadingOf', { lng: templateBase.currentVersion.includes("English") ? "en" : "fr" })+option.selectedHaulage.freeTime
                    +t('includedForEachContainer', { lng: templateBase.currentVersion.includes("English") ? "en" : "fr" })+option.selectedHaulage.overtimeTariff
                    +t('byHourIndivisible', { lng: templateBase.currentVersion.includes("English") ? "en" : "fr" }) 
                : "";
    
                var auxPricesServices = option.myMiscs !== null && option.myMiscs.length !== 0 && templateBase !== null ? 
                    option.myMiscs.map((elm: any, index: number) => elm.defaultContainer !== null ? "<p>- "+getServices(elm.containers, elm.currency)+" "+t('included', { lng: templateBase.currentVersion.includes("English") ? "en" : "fr" })+"</p>" : "<p>- "+getServicesTotal(elm.containers, elm.currency, option.marginsMiscs[index])+" "+t('additionals', { lng: templateBase.currentVersion.includes("English") ? "en" : "fr" })+"</p>").join("")
                : "<br>";
    
                auxPricesContainers.push("<p># "+t('offer', { lng: templateBase.currentVersion.includes("English") ? "en" : "fr" }).toUpperCase()+" "+Number(i+1)+"<p/>"+auxPricesTotal+auxPricesPrecisions+auxPricesServices);
            }
        }
        var pricesContainers = templateBase !== null ? auxPricesContainers.join("<p>"+t('', { lng: templateBase.currentVersion.includes("English") ? "en" : "fr" })+"</p>") : "";    
        
        // var pricesContainers = containersSelection !== null && formState.selectedSeafreight !== null && formState.selectedSeafreight !== undefined && seafreights !== null ? 
        // containersSelection.map((elm: any, index: number) => {
        //     var auxFrequency = 0;
        //     var auxTransitTime = "";
        //     var aux1 = formState.selectedSeafreights.find((val: any) => val.defaultContainer === elm.container);
        //     if (calculateSeafreightPrice(elm.container, elm.quantity, index) !== 0 && templateBase !== null) {
        //         if (aux1 !== undefined) {
        //             auxFrequency = aux1.frequency;
        //             auxTransitTime = aux1.transitTime;
        //         }
        //         return "<p><strong>"+calculateContainerPrice(elm.container, elm.quantity, index)+" "
        //         +formState.selectedSeafreight.currency+" / "+elm.container
        //         +" / "+t('every', { lng: templateBase.currentVersion.includes("English") ? "en" : "fr" })+" "+auxFrequency
        //         +" "+t('days', { lng: templateBase.currentVersion.includes("English") ? "en" : "fr" })+" / "+t('transitTime', { lng: templateBase.currentVersion.includes("English") ? "en" : "fr" })+" : "+auxTransitTime
        //         +" "+t('days', { lng: templateBase.currentVersion.includes("English") ? "en" : "fr" })+"</strong></p>"
        //     }
        //     else {
        //         return null;
        //     }
        // }).join("") : "";
        
        var clientName = clientNumber !== null ? clientNumber.contactName : null;
        var freeTime = formState.selectedHaulage !== null && formState.selectedHaulage !== undefined ? formState.selectedHaulage.freeTime : "";
        var overtimeTariff = formState.selectedHaulage !== null && formState.selectedHaulage !== undefined ? formState.selectedHaulage.overtimeTariff : "";
        var frequency = formState.selectedSeafreight !== null && formState.selectedSeafreight !== undefined ? formState.selectedSeafreight.frequency : "";
        var transitTime = formState.selectedSeafreight !== null && formState.selectedSeafreight !== undefined ? formState.selectedSeafreight.transitTime : "";
        var containersQuantities = displayContainers(containersSelection);

        const variables = { loadingCity, destinationPort, commodities, clientName, freeTime, overtimeTariff, frequency, transitTime, containersQuantities, listServices, pricesContainers };
        rteRef.current?.editor?.commands.setContent(generateEmailContent(mailLanguage !== "en" ? templateBase.content : templateBase.contentEn, variables));
    }, [tags, departure, clientNumber, formState.portDestination, formState.selectedSeafreight, formState.selectedHaulage, formState.selectedMisc, containersSelection, formState.margins, formState.addings, formState.marginsMiscs, seafreights, formState.options]);



    
    return (
        <Grid item xs={12}>
            <Accordion sx={{ backgroundColor: "#fbfbfb" }}>
                <AccordionSummary
                    expandIcon={<ExpandMore />}
                    aria-controls="panel1a-content"
                    id="panel1a-header"
                >
                    <Typography variant="h6" sx={{ mx: 0 }}><b>{t('generatePriceOffer')}</b></Typography>
                </AccordionSummary>
                <AccordionDetails>
                    <Box sx={{ px: 0 }}>
                        <Stepper activeStep={formState.activeStep} sx={{ px: 1 }}>
                            {steps.map((label, index) => {
                                const stepProps: { completed?: boolean } = {};
                                const labelProps: {
                                    optional?: React.ReactNode;
                                } = {};
                                if (isStepOptional(index)) {
                                    labelProps.optional = (<Typography variant="caption">{t('optional')}</Typography>);
                                }
                                if (isStepSkipped(index)) {
                                    stepProps.completed = false;
                                }
                                return (
                                    <Step key={label} {...stepProps}>
                                        <StepLabel {...labelProps}>{label}</StepLabel>
                                    </Step>
                                );
                            })}
                        </Stepper>
                        {formState.activeStep === steps.length ? (
                            <React.Fragment>
                                <Typography sx={{ mt: 2, mb: 1 }}>
                                    All steps completed - you&apos;re finished
                                </Typography>
                                <Box sx={{ display: 'flex', flexDirection: 'row', pt: 2 }}>
                                    <Box sx={{ flex: '1 1 auto' }} />
                                    <Button onClick={handleReset}>Reset</Button>
                                </Box>
                            </React.Fragment>
                        ) : (
                            <React.Fragment>
                                {
                                    formState.activeStep === 0 ?
                                    <Grid container spacing={2} mt={1} px={2}>
                                        <Grid item xs={12} md={6} mt={1}>
                                            <InputLabel htmlFor="loading-city" sx={inputLabelStyles}>{t('departure')} / {t('loadingCity')}</InputLabel>
                                            <AutocompleteSearch id="loading-city" value={loadingCity} onChange={setLoadingCity} fullWidth callBack={() => { setDeparture(loadingCity); }} />
                                        </Grid>
                                        <Grid item xs={12} md={6} mt={1}>
                                            <InputLabel htmlFor="haulage-type" sx={inputLabelStyles}>{t('haulageType')}</InputLabel>
                                            <NativeSelect
                                                id="haulage-type"
                                                value={formState.haulageType}
                                                onChange={(e: any) => { handleChangeFormState(e.target.value, "haulageType"); }}
                                                input={<BootstrapInput />}
                                                fullWidth
                                            >
                                                <option key={"kdq-"} value="">{t('anyType')}</option>
                                                {
                                                    haulageTypeOptions.map((item: any, i: number) => (
                                                        <option key={"kdq"+i} value={item.value}>{item.label}</option>
                                                    ))
                                                }
                                            </NativeSelect>
                                        </Grid>
                                        <Grid item xs={12}>
                                            <Box sx={{ overflow: "auto" }}>
                                                <Grid container>
                                                    <Grid item xs={7}>
                                                        <Typography variant="h5" sx={{ my: 2, fontSize: 19, fontWeight: "bold" }}>
                                                            {t('listHaulagesPricingOffers')+t('fromDotted')+loadingCity.city} (select one)
                                                        </Typography>
                                                    </Grid>
                                                    <Grid item xs={5}>
                                                        <Button 
                                                            variant="contained" 
                                                            color="inherit" 
                                                            sx={{ 
                                                                textTransform: "none", backgroundColor: "#fff", 
                                                                color: "#333", float: "right", marginTop: "8px", ml: 1 
                                                            }} 
                                                            onClick={getHaulagePriceOffers}
                                                        >
                                                            {t('reload')} <RestartAlt fontSize='small' />
                                                        </Button>
                                                        <Button 
                                                            variant="contained" color="inherit" 
                                                            sx={{ float: "right", backgroundColor: "#fff", marginTop: "8px", textTransform: "none", ml: 1 }} 
                                                            onClick={() => { setModalHaulage(true); }}
                                                        >
                                                            {t('newHaulage')}
                                                        </Button>
                                                        <Button 
                                                            variant="contained" 
                                                            color="inherit" 
                                                            sx={{ 
                                                                textTransform: "none", backgroundColor: "#fff", 
                                                                color: "#333", float: "right", marginTop: "8px" 
                                                            }}
                                                            onClick={() => setModalRequestHaulage(true)}
                                                        >
                                                            {t('requestHaulagePrice')}
                                                        </Button>
                                                    </Grid>
                                                </Grid>
                                                
                                                {
                                                    !loadResults ? 
                                                    haulages !== null && haulages.length !== 0 ?
                                                    <DataGrid
                                                        rows={haulages}
                                                        columns={columnsHaulages}
                                                        // hideFooter
                                                        initialState={{
                                                            pagination: {
                                                                paginationModel: {
                                                                    pageSize: 10,
                                                                },
                                                            },
                                                        }}
                                                        pageSizeOptions={[5, 10]}
                                                        getRowId={(row: any) => row?.id}
                                                        getRowHeight={() => "auto" }
                                                        sx={gridStyles}
                                                        onRowSelectionModelChange={(newRowSelectionModel: any) => {
                                                            setFormState({
                                                                ...formState, 
                                                                selectedHaulage: newRowSelectionModel.length !== 0 ? haulages.find((elm: any) => elm.id === newRowSelectionModel[0]) : null, 
                                                                rowSelectionModel2: newRowSelectionModel
                                                            });
                                                        }}
                                                        rowSelectionModel={formState.rowSelectionModel2}
                                                    /> :
                                                    <Box>
                                                        <Alert severity="error">{t('noResults')}</Alert>
                                                    </Box> 
                                                    : <Skeleton />
                                                }
                                            </Box>
                                        </Grid>
                                    </Grid> : null
                                }
                                {
                                    formState.activeStep === 1 ? 
                                    <Grid container spacing={2} mt={1} px={2}>
                                        <Grid item xs={12} md={6} mt={1}>
                                            <InputLabel htmlFor="port-departure" sx={inputLabelStyles}><Anchor fontSize="small" sx={inputIconStyles} /> {t('departurePort')}</InputLabel>
                                            {
                                                ports !== null ?
                                                <Autocomplete
                                                    disablePortal
                                                    id="port-departure"
                                                    options={ports1}
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
                                                    value={formState.portDeparture}
                                                    disabled={true}
                                                    sx={{ mt: 1 }}
                                                    renderInput={(params: any) => <TextField {...params} />}
                                                    onChange={(e: any, value: any) => { 
                                                        setFormState({...formState, portDeparture: value});
                                                    }}
                                                    fullWidth
                                                /> : <Skeleton />
                                            }
                                        </Grid>
                                        <Grid item xs={12} md={6} mt={1}>
                                            <InputLabel htmlFor="destination-port" sx={inputLabelStyles}><Anchor fontSize="small" sx={inputIconStyles} /> {t('arrivalPort')}</InputLabel>
                                            {
                                                ports !== null ?
                                                <Autocomplete
                                                    disablePortal
                                                    id="destination-port"
                                                    options={ports2}
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
                                                    value={formState.portDestination}
                                                    sx={{ mt: 1 }}
                                                    renderInput={(params: any) => <TextField {...params} />}
                                                    onChange={(e: any, value: any) => {  
                                                        setFormState({...formState, portDestination: value});
                                                        // setPortDestination(value); 
                                                    }}
                                                    fullWidth
                                                /> : <Skeleton />
                                            }
                                        </Grid>
                                        <Grid item xs={12}>
                                            <Grid container>
                                                <Grid item xs={7}>
                                                    <Typography variant="h5" sx={{ my: 2, fontSize: 19, fontWeight: "bold" }}>
                                                        {
                                                            formState.portDeparture !== undefined && formState.portDeparture !== null && formState.portDestination !== undefined && formState.portDestination !== null ?
                                                            t('listSeaFreightsPricingOffers')+t('fromDotted')+formState.portDeparture.portName+"-"+formState.portDestination.portName : 
                                                            t('listSeaFreightsPricingOffers')
                                                        }
                                                    </Typography>
                                                </Grid>
                                                <Grid item xs={5}>
                                                    <Button 
                                                        variant="contained" 
                                                        color="inherit" 
                                                        sx={{ 
                                                            textTransform: "none", backgroundColor: "#fff", 
                                                            color: "#333", float: "right", marginTop: "8px", marginLeft: "10px"
                                                        }} 
                                                        onClick={getSeaFreightPriceOffers}
                                                    >
                                                        {t('reload')} <RestartAlt fontSize='small' />
                                                    </Button>
                                                    <Button 
                                                        variant="contained" color="inherit" 
                                                        sx={{ float: "right", backgroundColor: "#fff", marginTop: "8px", textTransform: "none", ml: 1 }} 
                                                        onClick={() => { setModalSeafreight(true); }}
                                                    >
                                                        {t('newSeafreight')}
                                                    </Button>
                                                    <Button 
                                                        variant="contained" 
                                                        color="inherit" 
                                                        sx={{ 
                                                            textTransform: "none", backgroundColor: "#fff", 
                                                            color: "#333", float: "right", marginTop: "8px"
                                                        }}
                                                        onClick={() => setModalRequestSeafreight(true)}
                                                    >
                                                        {t('requestSeafreightPrice')}
                                                    </Button>
                                                </Grid>
                                            </Grid>
                                        </Grid>
                                        
                                        <Grid item xs={12}>
                                            <Alert severity="info" sx={{ mb: 2 }}>{t('selectOfferMessage')}</Alert>
                                            {
                                                !loadResults ? 
                                                seafreights !== null && seafreights.length !== 0 ?
                                                <Box sx={{ overflow: "auto" }}>
                                                    <DataGrid
                                                        rows={seafreights}
                                                        columns={columnsSeafreights}
                                                        // hideFooter
                                                        initialState={{
                                                            pagination: {
                                                                paginationModel: {
                                                                    pageSize: 10,
                                                                },
                                                            },
                                                        }}
                                                        pageSizeOptions={[5, 10]}
                                                        getRowId={(row: any) => row?.seaFreightId}
                                                        getRowHeight={() => "auto" }
                                                        style={sizingStyles}
                                                        sx={gridStyles}
                                                        disableDensitySelector
                                                        disableColumnSelector
                                                        slots={{ toolbar: GridToolbar }}
                                                        slotProps={{
                                                            toolbar: {
                                                                showQuickFilter: true,
                                                            },
                                                        }}
                                                        onRowSelectionModelChange={(newRowSelectionModel: any) => {
                                                            if (newRowSelectionModel.length <= containersSelection.length) {
                                                                var myFreights = newRowSelectionModel.length !== 0 ? seafreights.filter((elm: any) => newRowSelectionModel.includes(elm.seaFreightId)) : [];
                                                                if (checkDifferentDefaultContainer(myFreights)) {
                                                                    var selSf = newRowSelectionModel.length !== 0 ? seafreights.filter((sfreight: any) => newRowSelectionModel.includes(sfreight.seaFreightId)) : null;
                                                                    console.log("Sfreights : ", selSf);
                                                                    setFormState({
                                                                        ...formState, 
                                                                        rowSelectionModel: newRowSelectionModel, 
                                                                        selectedSeafreights: seafreights.filter((sfreight: any) => newRowSelectionModel.includes(sfreight.seaFreightId)), 
                                                                        selectedSeafreight: newRowSelectionModel.length !== 0 ? seafreights.find((elm: any) => elm.seaFreightId === newRowSelectionModel[0]) : null
                                                                    });
                                                                }
                                                                else {
                                                                    enqueueSnackbar("You can only select offers with different container types!", { variant: "warning", anchorOrigin: { horizontal: "right", vertical: "top"} });
                                                                }
                                                            }
                                                            else {
                                                                enqueueSnackbar("You can only select "+containersSelection.length+" offers!", { variant: "warning", anchorOrigin: { horizontal: "right", vertical: "top"} });
                                                            }
                                                        }}
                                                        rowSelectionModel={formState.rowSelectionModel}
                                                        checkboxSelection
                                                    />
                                                </Box> : 
                                                <Box>
                                                    <Alert severity="error">{t('noResults')}</Alert>
                                                </Box>
                                                : <Skeleton />
                                            }
                                        </Grid>
                                    </Grid>
                                    : null
                                }
                                {
                                    formState.activeStep === 2 ? 
                                    <Grid container spacing={2} mt={1} px={2}>
                                        <Grid item xs={12}>
                                            <Typography variant="h5" sx={{ my: 1, fontSize: 18, fontWeight: "bold" }}>{t('listMiscPricingOffers')+t('fromDotted')+formState.portDeparture.portName+"-"+formState.portDestination.portName}</Typography>
                                            <Grid container spacing={2}>
                                                <Grid item xs={8}>
                                                    <Typography variant="h6" sx={{ mt: 2, fontSize: 17, fontWeight: "bold" }}>
                                                        General miscs (select any)
                                                    </Typography>    
                                                </Grid>
                                                <Grid item xs={4}>
                                                    <Button 
                                                        variant="contained" 
                                                        color="inherit" 
                                                        sx={{ 
                                                            textTransform: "none", backgroundColor: "#fff", 
                                                            color: "#333", float: "right", marginTop: "8px", marginLeft: "10px" 
                                                        }} 
                                                        onClick={() => {
                                                            getMiscellaneousPriceOffers();
                                                            getHaulageMiscellaneousPriceOffers();
                                                            getGeneralMiscellaneousPriceOffers();
                                                        }}
                                                    >
                                                        {t('reload')} <RestartAlt fontSize='small' />
                                                    </Button>
                                                    <Button 
                                                        variant="contained" 
                                                        color="inherit" 
                                                        sx={{ 
                                                            textTransform: "none", backgroundColor: "#fff", 
                                                            color: "#333", float: "right", marginTop: "8px" 
                                                        }}
                                                        onClick={() => setModalNewMisc(true)}
                                                    >
                                                        Create a misc
                                                    </Button>
                                                </Grid>
                                                <Grid item xs={12}>
                                                    {
                                                        !loadGeneralMiscs && !loadResults && !loadMiscsHaulage ? 
                                                        tableMiscs !== null && tableMiscs.length !== 0 ?
                                                        <Box sx={{ overflow: "auto" }}>
                                                            <DataGrid
                                                                rows={tableMiscs}
                                                                columns={columnsMiscs}
                                                                // hideFooter
                                                                initialState={{
                                                                    pagination: {
                                                                        paginationModel: {
                                                                            pageSize: 10,
                                                                        },
                                                                    },
                                                                }}
                                                                pageSizeOptions={[5, 10]}
                                                                getRowId={(row: any) => row?.miscellaneousId}
                                                                getRowHeight={() => "auto" }
                                                                style={sizingStyles}
                                                                sx={gridStyles}
                                                                disableDensitySelector
                                                                disableColumnSelector
                                                                slots={{ toolbar: GridToolbar }}
                                                                slotProps={{
                                                                    toolbar: {
                                                                        showQuickFilter: true,
                                                                    },
                                                                }}
                                                                onRowSelectionModelChange={(newRowSelectionModel: any) => {
                                                                    setFormState({
                                                                        ...formState, 
                                                                        selectedMisc: newRowSelectionModel.length !== 0 ? generalMiscs.find((elm: any) => elm.id === newRowSelectionModel[0]) : null,
                                                                        myMiscs: newRowSelectionModel.length !== 0 ? 
                                                                        tableMiscs
                                                                        .filter((elm: any) => newRowSelectionModel.includes(elm.miscellaneousId))
                                                                        .map((elm: any) => { return {...elm, defaultContainer: elm.containers[0].container.packageName}}) : [],
                                                                        rowSelectionModel3: newRowSelectionModel
                                                                    });
                                                                }}
                                                                rowSelectionModel={formState.rowSelectionModel3}
                                                                checkboxSelection
                                                            />
                                                        </Box> : <Alert severity="error">{t('noResults')}</Alert>
                                                        : <Skeleton />
                                                    }
                                                </Grid>
                                            </Grid>
                                        </Grid>
                                    </Grid>
                                    : null
                                }
                                {
                                    formState.activeStep === 3 ?
                                    <Grid container spacing={2} mt={1} px={2}>
                                        <Grid item xs={12}>
                                            <Button
                                                variant="contained" 
                                                color="inherit" 
                                                sx={whiteButtonStyles}
                                                style={{ marginRight: 8 }}
                                                onClick={(e: any) => {
                                                    var thisOption = {
                                                        haulageType: formState.haulageType, selectedTemplate: formState.selectedTemplate, 
                                                        selectedHaulage: formState.selectedHaulage, rowSelectionModel2: formState.rowSelectionModel2, 
                                                        selectedSeafreight: formState.selectedSeafreight, rowSelectionModel: formState.rowSelectionModel,  
                                                        selectedMisc: formState.selectedMisc, myMiscs: formState.myMiscs, rowSelectionModel3: formState.rowSelectionModel3, 
                                                        activeStep: formState.activeStep, margins: formState.margins, addings: formState.addings,
                                                        marginsMiscs: formState.marginsMiscs, addingsMiscs: formState.addingsMiscs,  
                                                        portDeparture: formState.portDeparture, portDestination: formState.portDestination, 
                                                        selectedSeafreights: formState.selectedSeafreights
                                                    };

                                                    if (formState.currentOption === null || formState.options.length === 0 || formState.currentOption >= formState.options.length) {
                                                        setFormState({...formState, options: [...formState.options, thisOption] });
                                                    }
                                                    else {
                                                        setFormState((prevState: any) => {
                                                            const options = [...prevState.options];
                                                            options[prevState.currentOption] = {
                                                                ...options[prevState.currentOption], 
                                                                haulageType: formState.haulageType, selectedTemplate: formState.selectedTemplate, 
                                                                selectedHaulage: formState.selectedHaulage, rowSelectionModel2: formState.rowSelectionModel2, 
                                                                selectedSeafreight: formState.selectedSeafreight, rowSelectionModel: formState.rowSelectionModel,  
                                                                selectedMisc: formState.selectedMisc, myMiscs: formState.myMiscs, rowSelectionModel3: formState.rowSelectionModel3, 
                                                                activeStep: formState.activeStep, margins: formState.margins, addings: formState.addings,
                                                                marginsMiscs: formState.marginsMiscs, addingsMiscs: formState.addingsMiscs,  
                                                                portDeparture: formState.portDeparture, portDestination: formState.portDestination, 
                                                                selectedSeafreights: formState.selectedSeafreights
                                                            };
                                                            return {...prevState, options};
                                                        });
                                                    }
                                                }}
                                            >
                                                {
                                                    formState.currentOption === null || formState.options.length === 0 || formState.currentOption >= formState.options.length ? 
                                                    "Save option" : "Edit option"
                                                }
                                            </Button>
                                            <Button
                                                variant="contained" 
                                                color="inherit" 
                                                sx={whiteButtonStyles}
                                                style={{ marginRight: 8 }}
                                                onClick={(e: any) => {
                                                    setFormState({
                                                        ...formState, 
                                                        currentOption: formState.options !== undefined ? formState.options.length : 0,
                                                        haulageType: "", selectedTemplate: defaultTemplate, 
                                                        selectedHaulage: null, rowSelectionModel2: [],
                                                        selectedSeafreight: null, rowSelectionModel: [], 
                                                        selectedMisc: null, myMiscs: [], rowSelectionModel3: [],
                                                        activeStep: 0, margins: containersSelection.map(() => 22), addings: containersSelection.map(() => 0),
                                                        marginsMiscs: Array(15).fill(50), addingsMiscs: [],  
                                                        portDeparture: null, portDestination: portDestination
                                                    });
                                                }}
                                            >
                                                New option
                                            </Button>
                                            <Button
                                                variant="contained" 
                                                color="inherit" 
                                                sx={whiteButtonStyles}
                                                style={{ marginRight: 8 }}
                                                onClick={(e: any) => { setModalCompare(true); }}
                                            >
                                                Compare options
                                            </Button>
                                        </Grid>
                                        <Grid item xs={12}>
                                            {
                                                formState.options !== undefined && formState.options.length !== 0 ? 
                                                formState.options.map((elm: any, id: number) => {
                                                    return (
                                                        <ListItem 
                                                            key={"lItem-"+id} 
                                                            sx={formState.currentOption === id ? 
                                                                { background: "teal", color: "#fff", border: "1px solid #eeeeee", py: 2 } : 
                                                                { background: "#fff", border: "1px solid #eeeeee", py: 2 }
                                                            }
                                                            secondaryAction={
                                                                <>
                                                                    {/* <IconButton edge="end" aria-label="delete" sx={{ mr: 1 }}>
                                                                        <Visibility />
                                                                    </IconButton>
                                                                    <IconButton edge="end" aria-label="delete">
                                                                        <Delete />
                                                                    </IconButton> */}
                                                                    <Button 
                                                                        variant="contained" color="inherit" sx={whiteButtonStyles} 
                                                                        style={{ marginRight: 8, marginBottom: 16 }}
                                                                        onClick={(e: any) => { 
                                                                            // console.log("Elm : ", elm);
                                                                            setFormState({
                                                                                ...formState, 
                                                                                currentOption: id,
                                                                                haulageType: elm.haulageType, selectedTemplate: elm.selectedTemplate, 
                                                                                selectedHaulage: elm.selectedHaulage, rowSelectionModel2: elm.rowSelectionModel2,
                                                                                selectedSeafreight: elm.selectedSeafreight, rowSelectionModel: elm.rowSelectionModel, 
                                                                                selectedMisc: elm.selectedMisc, myMiscs: elm.myMiscs, rowSelectionModel3: elm.rowSelectionModel3,
                                                                                margins: elm.margins, addings: elm.addings, marginsMiscs: elm.marginsMiscs, 
                                                                                portDeparture: elm.portDeparture, portDestination: elm.portDestination, 
                                                                                selectedSeafreights: elm.selectedSeafreights
                                                                            });
                                                                        }}
                                                                    >
                                                                        Select option
                                                                    </Button>
                                                                    <Button 
                                                                        variant="contained" color="inherit" sx={whiteButtonStyles} 
                                                                        style={{ marginBottom: 16 }}
                                                                        onClick={(e: any) => { setFormState({...formState, options: formState.options.filter((opt: any, i: number) => i !== id)}); }}
                                                                    >
                                                                        Delete option
                                                                    </Button>
                                                                </>
                                                            }
                                                        >
                                                            <ListItemText 
                                                                sx={{ mt: 0 }}
                                                                primary={
                                                                    elm.selectedSeafreight !== undefined && elm.selectedSeafreight !== null ? 
                                                                    elm.selectedSeafreight.departurePortName+" - "+elm.selectedSeafreight.destinationPortName+" | "+elm.selectedSeafreight.carrierName 
                                                                    : "N/A"
                                                                }
                                                                primaryTypographyProps={{ fontWeight: "bold" }} 
                                                            />
                                                        </ListItem>
                                                    );
                                                })
                                                : null
                                            }
                                        </Grid>
                                        {
                                            formState.options !== undefined && formState.options.length !== 0 ? 
                                            <>
                                                {
                                                    formState.selectedHaulage !== null && formState.selectedHaulage !== undefined ? 
                                                    <Grid item xs={12}>
                                                        <Typography variant="h5" sx={{ my: 1, fontSize: 18, fontWeight: "bold" }}>{t('selectedHaulage')}</Typography>
                                                        <Box sx={{ overflow: "auto" }}>
                                                            <DataGrid
                                                                rows={[formState.selectedHaulage]}
                                                                columns={columnsHaulages}
                                                                initialState={{
                                                                    pagination: {
                                                                        paginationModel: {
                                                                            pageSize: 10,
                                                                        },
                                                                    },
                                                                }}
                                                                pageSizeOptions={[5, 10]}
                                                                getRowId={(row: any) => row?.id}
                                                                getRowHeight={() => "auto" }
                                                                sx={sizeStyles}
                                                                disableRowSelectionOnClick
                                                            />
                                                        </Box>
                                                    </Grid> : null
                                                }
                                                {
                                                    formState.selectedSeafreights !== undefined && formState.selectedSeafreights !== null ? 
                                                    <Grid item xs={12}>
                                                        <Typography variant="h5" sx={{ my: 1, fontSize: 18, fontWeight: "bold" }}>{t('selectedSeafreight')}</Typography>
                                                        <Box sx={{ overflow: "auto" }}>
                                                            <DataGrid
                                                                // rows={allSeafreights.filter((sfreight: any) => formState.rowSelectionModel.includes(sfreight.seaFreightId))}
                                                                rows={formState.selectedSeafreights}
                                                                columns={columnsSeafreights}
                                                                initialState={{
                                                                    pagination: {
                                                                        paginationModel: {
                                                                            pageSize: 10,
                                                                        },
                                                                    },
                                                                }}
                                                                pageSizeOptions={[5, 10]}
                                                                getRowId={(row: any) => row?.seaFreightId}
                                                                getRowHeight={() => "auto" }
                                                                sx={sizeStyles}
                                                                disableRowSelectionOnClick
                                                            />
                                                        </Box>
                                                    </Grid> : null
                                                }
                                                {
                                                    formState.myMiscs !== null && formState.myMiscs.length !== 0 ? 
                                                    <Grid item xs={12}>
                                                        <Typography variant="h5" sx={{ my: 1, fontSize: 18, fontWeight: "bold" }}>{t('selectedMisc')}</Typography>
                                                        <Box sx={{ overflow: "auto" }}>
                                                            <DataGrid
                                                                rows={formState.myMiscs}
                                                                columns={columnsMiscs}
                                                                initialState={{
                                                                    pagination: {
                                                                        paginationModel: {
                                                                            pageSize: 10,
                                                                        },
                                                                    },
                                                                }}
                                                                pageSizeOptions={[5, 10]}
                                                                getRowId={(row: any) => row?.miscellaneousId}
                                                                getRowHeight={() => "auto" }
                                                                sx={sizeStyles}
                                                                disableRowSelectionOnClick
                                                            />
                                                        </Box>
                                                    </Grid> : null
                                                }
                                                <Grid item xs={8}>
                                                    <InputLabel htmlFor="selectedTemplate" sx={inputLabelStyles}>{t('selectedTemplate')}</InputLabel>
                                                    {
                                                        loadTemplates !== true ?
                                                        <NativeSelect
                                                            id="selectedTemplate"
                                                            value={formState.selectedTemplate}
                                                            onChange={(e: any) => { 
                                                                setFormState({...formState, selectedTemplate: e.target.value});
                                                            }}
                                                            input={<BootstrapInput />}
                                                            fullWidth
                                                        >
                                                            {templates.map((elm: any, i: number) => (
                                                                <option key={"templateElm-"+i} value={elm.id}>{elm.name}</option>
                                                            ))}
                                                        </NativeSelect> : <Skeleton />
                                                    }
                                                </Grid>
                                                <Grid item xs={4}>
                                                    <InputLabel htmlFor="mailLanguage" sx={inputLabelStyles}>{t('mailLanguage')}</InputLabel>
                                                    <ToggleButtonGroup
                                                        color="primary"
                                                        value={mailLanguage}
                                                        exclusive
                                                        onChange={(event: React.MouseEvent<HTMLElement>, newValue: string,) => { 
                                                            setMailLanguage(newValue); 
                                                        }}
                                                        aria-label="Platform"
                                                        fullWidth
                                                        sx={{ mt: 1, maxHeight: "44px" }}
                                                    >
                                                        <ToggleButton value="fr"><img src="/assets/img/flags/flag-fr.png" style={{ width: "12px", marginRight: "6px" }} alt="flag english" /> Français</ToggleButton>
                                                        <ToggleButton disabled value="en"><img src="/assets/img/flags/flag-en.png" style={{ width: "12px", marginRight: "6px" }} alt="flag english" /> English</ToggleButton>
                                                    </ToggleButtonGroup>
                                                </Grid>
                                                <Grid item xs={12}>
                                                    <Grid container spacing={0} sx={{ border: "1px solid #e5e5e5", backgroundColor: "#fff", px: 2, py: 1 }}>
                                                        <Grid item xs={12}>
                                                            <Typography variant="h5" sx={{ mt: 1, fontSize: 15, fontWeight: "bold" }}>Transport price margins</Typography>
                                                        </Grid>
                                                        {
                                                            containersSelection !== null && formState.rowSelectionModel.length !== 0 && seafreights !== undefined && seafreights !== null ?
                                                            formState.selectedSeafreights
                                                            .map((element: any, index: number) => {
                                                                var containerElm = containersSelection.find((val: any) => val.container === element.containers[0].container.packageName);
                                                                var allMiscs = formState.myMiscs;
                                                                var miscsSelected = [];
                                                                if (containerElm !== undefined && containerElm !== null) {
                                                                    miscsSelected = allMiscs.filter((elm: any) => elm.defaultContainer === containerElm.container);
                                                                }
                                                                
                                                                return (
                                                                    <Grid item xs={6} key={"containerRow-"+index}>
                                                                        <ContainerElement
                                                                            key={"containerElm-"+index} 
                                                                            elm={containerElm}
                                                                            index={index}
                                                                            adding={formState.addings[index]}
                                                                            margin={formState.margins[index]}
                                                                            handleAddingChange={handleAddingChange}
                                                                            handleMarginChange={handleMarginChange}
                                                                            purchasePrice={Number(((calculateContainerPrice(containerElm.container, containerElm.quantity, index)-formState.addings[index])/(1+formState.margins[index]/100)).toFixed(2))+" "+t(element.currency)}
                                                                            profit={Number((calculateContainerPrice(containerElm.container, containerElm.quantity, index) - ((calculateContainerPrice(containerElm.container, containerElm.quantity, index)-formState.addings[index])/(1+formState.margins[index]/100))).toFixed(2))+" "+t(element.currency)}
                                                                            salePrice={calculateContainerPrice(containerElm.container, containerElm.quantity, index)+" "+t(element.currency)}
                                                                            haulagePrice={formState.selectedHaulage !== null && formState.selectedHaulage !== undefined && formState.selectedHaulage.containerNames.includes(containerElm.container) ? containerElm.quantity+"x"+formState.selectedHaulage.unitTariff+" "+t(element.currency) : "N/A"}
                                                                            seafreightPrice={formatServices(element.containers[0], t(element.currency), containerElm.container, containerElm.quantity) || "N/A"}
                                                                            miscellaneousPrice={miscsSelected.length !== 0 ? miscsSelected.map((value: any, id: number) => {
                                                                                return <span key={"sMiscs-"+id}>
                                                                                    <span>- {getServicesTotal2(value.containers, t(element.currency), containerElm.quantity)}</span>
                                                                                    {id !== miscsSelected.length - 1 && <br />}
                                                                                </span>
                                                                            }) : "N/A"}
                                                                        />
                                                                    </Grid>
                                                                );
                                                            }) : null
                                                        }
                                                    </Grid>

                                                    {
                                                        formState.myMiscs !== null && formState.myMiscs.length !== 0 && formState.marginsMiscs.length !== 0 ? 
                                                        <Grid container spacing={0} sx={{ border: "1px solid #e5e5e5", backgroundColor: "#fff", p: 2 }}>
                                                            {
                                                                formState.myMiscs.map((elm: any, id: number) => myServices(elm.containers)).map((element: any, index: number) => {
                                                                    return (
                                                                        <Grid item xs={6} key={"marginMiscs-"+index}>
                                                                            <Grid container spacing={2}>
                                                                                <Grid item xs={12} sx={{ pt: 0 }}>
                                                                                    <Typography variant="h5" sx={{ fontSize: 15, fontWeight: "bold" }}>Service price margins</Typography>
                                                                                </Grid>
                                                                                <Grid item xs={8}>
                                                                                    <InputLabel htmlFor={"miscMargin-"+index} sx={inputLabelStyles}>{t('margin')} %</InputLabel>
                                                                                    <BootstrapInput 
                                                                                        id={"miscMargin-"+index} 
                                                                                        type="number" fullWidth 
                                                                                        inputProps={{ min: 0, max: 100 }} 
                                                                                        value={formState.marginsMiscs[index]} 
                                                                                        onChange={(e: any) => {
                                                                                            handleMarginMiscChange(index, e.target.value);
                                                                                        }} 
                                                                                    />
                                                                                </Grid>
                                                                                <Grid item xs={12}>
                                                                                    <Typography sx={{ fontSize: 14 }}>
                                                                                        <span>{element[0].serviceName}</span>
                                                                                        <span> | {t('purchasePrice')} : {element[0].price} €</span>
                                                                                        <span> | {t('profit')} : {(element[0].price*(formState.marginsMiscs[index]/100)).toFixed(2)} €</span>
                                                                                        <span> | {t('salePrice')} : {(element[0].price*(1+formState.marginsMiscs[index]/100)).toFixed(2)} €</span> 
                                                                                    </Typography>
                                                                                </Grid>
                                                                            </Grid>
                                                                        </Grid>
                                                                    );
                                                                })
                                                            }
                                                        </Grid> : null
                                                    }
                                                </Grid>
                                                <Grid item xs={12}>
                                                    <InputLabel htmlFor="details" sx={inputLabelStyles}>{t('detailsOffer')}</InputLabel>
                                                    {
                                                        formState.selectedSeafreight !== null && formState.selectedSeafreight !== undefined ? 
                                                        <Box sx={{ mt: 2 }}>
                                                            {
                                                                loadTemplate !== true ?
                                                                <RichTextEditor
                                                                    ref={rteRef}
                                                                    extensions={[StarterKit]}
                                                                    content={getDefaultContent(mailLanguage !== "en" ? templateBase.content : templateBase.contentEn)}
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
                                                                />
                                                                : <Skeleton />
                                                            }
                                                        </Box>   
                                                        : null
                                                    }
                                                </Grid>
                                            </> : <Grid item xs={12}><Alert severity="info">You need to save some options to send</Alert></Grid>
                                        }
                                    </Grid>
                                    : null
                                }

                                <Box sx={{ display: 'flex', flexDirection: 'row', pt: 2, px: 2 }}>
                                    <Button
                                        variant="contained" 
                                        color="inherit" 
                                        sx={whiteButtonStyles}
                                        disabled={formState.activeStep === 0}
                                        onClick={handleBack}
                                    >
                                        {t('back')}
                                    </Button>
                                    <Box sx={{ flex: '1 1 auto' }} />
                                    {isStepOptional(formState.activeStep) && (
                                    <Button variant="contained" color="inherit" sx={whiteButtonStyles} onClick={handleSkip} style={{ marginRight: "10px" }}>
                                        {t('skip')}
                                    </Button>
                                    )}
                                    <Button variant="contained" color="inherit" sx={whiteButtonStyles} onClick={handleNext} disabled={formState.activeStep === steps.length - 1 ? loadNewOffer : false}>
                                        {formState.activeStep === steps.length - 1 ? t('sendOfferValidation') : t('nextStep')}
                                    </Button>
                                </Box>
                            </React.Fragment>
                        )}
                    </Box>
                </AccordionDetails>
            </Accordion>

            {/* Price request haulage (modalRequestHaulage) */}
            <BootstrapDialog
                onClose={() => setModalRequestHaulage(false)}
                aria-labelledby="custom-dialog-title5"
                open={modalRequestHaulage}
                maxWidth="lg"
                fullWidth
            >
                <RequestPriceHaulage
                    token={tempToken} 
                    ports={ports}
                    loadingCity={loadingCity}
                    loadingPort={formState.portDeparture}
                    closeModal={() => setModalRequestHaulage(false)}
                />
            </BootstrapDialog>

            {/* Price request seafreight FCL (modalRequestSeafreight) */}
            <BootstrapDialog
                onClose={() => setModalRequestSeafreight(false)}
                aria-labelledby="custom-dialog-title6"
                open={modalRequestSeafreight}
                maxWidth="lg"
                fullWidth
            >
                <RequestPriceRequest 
                    token={tempToken} 
                    products={products} 
                    commodities={tags}
                    ports={ports}
                    portLoading={formState.portDeparture}
                    portDischarge={formState.portDestination} 
                    containers={containers} 
                    containersSelection={containersSelection}
                    closeModal={() => setModalRequestSeafreight(false)} 
                />
            </BootstrapDialog>

            {/* Create new misc (modalNewMisc) */}
            <BootstrapDialog
                onClose={() => setModalNewMisc(false)}
                aria-labelledby="custom-dialog-title9"
                open={modalNewMisc}
                maxWidth="lg"
                fullWidth
            >
                <BootstrapDialogTitle id="custom-dialog-title" onClose={() => setModalNewMisc(false)}>
                    <b>{t('createRowMisc')}</b>
                </BootstrapDialogTitle>
                <NewMiscellaneous closeModal={() => setModalNewMisc(false)} updateMiscs={getGeneralMiscellaneousPriceOffers} />
            </BootstrapDialog>

            {/* Create new haulage */}
            <BootstrapDialog
                onClose={() => setModalHaulage(false)}
                aria-labelledby="custom-dialog-titleHaulage"
                open={modalHaulage}
                maxWidth="lg"
                fullWidth
            >
                <NewHaulage 
                    token={tempToken}
                    ports={ports}
                    loadingCity={loadingCity}
                    containers={containers}
                    closeModal={() => setModalHaulage(false)}
                    callBack={() => { getHaulagePriceOffers(); }}
                />
            </BootstrapDialog>

            {/* Create new seafreight */}
            <BootstrapDialog
                onClose={() => setModalSeafreight(false)}
                aria-labelledby="custom-dialog-titleSeafreight"
                open={modalSeafreight}
                maxWidth="lg"
                fullWidth
            >
                <NewSeafreight 
                    token={tempToken}
                    ports={ports}
                    portLoading={formState.portDeparture}
                    portDischarge={formState.portDestination}
                    containers={containers}
                    closeModal={() => setModalSeafreight(false)}
                    callBack={() => { getSeaFreightPriceOffers(); }}
                />
            </BootstrapDialog>

            {/* Compare options */}
            <BootstrapDialog
                onClose={() => setModalCompare(false)}
                aria-labelledby="custom-dialog-titleCompare"
                open={modalCompare}
                maxWidth="lg"
                fullWidth
            >
                <CompareOptions 
                    options={formState.options} 
                    closeModal={() => { setModalCompare(false); }} 
                />
            </BootstrapDialog>
        </Grid>
    );
}

export default GeneratePriceOffer;
