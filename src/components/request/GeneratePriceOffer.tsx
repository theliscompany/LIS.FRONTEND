import React from 'react';
import { useEffect, useRef, useState } from 'react';
import { BootstrapDialog, BootstrapDialogTitle, BootstrapInput, actionButtonStyles, anyButtonStyles, buttonCloseStyles, gridStyles, inputIconStyles, inputLabelStyles, sizingStyles, whiteButtonStyles } from '../../utils/misc/styles';
import Grid from '@mui/material/Grid2';
import { Accordion, AccordionDetails, AccordionSummary, Alert, Autocomplete, Box, Button, Chip, DialogActions, DialogContent, InputLabel, ListItem, ListItemText, NativeSelect, Paper, Skeleton, Step, StepLabel, Stepper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField, Typography } from '@mui/material';
import { enqueueSnackbar } from 'notistack';
import { Anchor, ExpandMore, RestartAlt } from '@mui/icons-material';
import { DataGrid, GridColDef, GridColumnHeaderParams, GridRenderCellParams, GridToolbar, GridValueGetter } from '@mui/x-data-grid';
import StarterKit from '@tiptap/starter-kit';
import { calculateTotal, checkCarrierConsistency, checkDifferentDefaultContainer, formatObject, formatServices, generateRandomNumber, getCity, getServices, getServicesTotal, getServicesTotal2, getTotalNumber, getTotalPrice, getTotalPrices, hashCode, myServices, parseDate, removeDuplicatesWithLatestUpdated, validateObjectHSCODEFormat } from '../../utils/functions';
import AutocompleteSearch from '../shared/AutocompleteSearch';
import { RichTextEditor, MenuControlsContainer, MenuSelectHeading, MenuDivider, MenuButtonBold, MenuButtonItalic, MenuButtonStrikethrough, MenuButtonOrderedList, MenuButtonBulletedList, MenuSelectTextAlign, MenuButtonEditLink, MenuButtonHorizontalRule, MenuButtonUndo, MenuButtonRedo } from 'mui-tiptap';
import { RichTextEditorRef } from 'mui-tiptap';
import useProcessStatePersistence from '../../utils/processes/useProcessStatePersistence';
import { haulageTypeOptions } from '../../utils/constants';
import { MuiFileInput } from 'mui-file-input';
import { useTranslation } from 'react-i18next';
import NewHaulage from '../pricing/NewHaulage';
import NewSeafreight from '../pricing/NewSeafreight';
import RequestPriceHaulage from '../pricing/RequestPriceHaulage';
import RequestPriceSeafreight from '../pricing/RequestPriceSeafreight';
import { getApiTemplate, getApiTemplateById } from '../../api/client/template';
import { postApiQuoteOffer } from '../../api/client/offer';
import PriceOffer from '../offer/PriceOffer';
import NewMiscellaneous from '../pricing/NewMiscellaneous';
import CompareOptions from './CompareOptions';
import ContainerElement from './ContainerElement';
import ContainerPrice from './ContainerPrice';
import { putApiRequestByIdChangeStatus } from '../../api/client/quote';
import { getApiMiscellaneousMiscellaneous, getApiPricingHaulagesOfferRequest, getApiPricingSeaFreightsOffersRequest } from '../../api/client/pricing';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { getApiFileByFolderOptions, postApiFileUploadMutation } from '../../api/client/document/@tanstack/react-query.gen';

const defaultTemplate = "65b74024891f9de80722fc6d";

const GeneratePriceOffer = (props: any) => {
    const { 
        id, email, tags, clientNumber, 
        departure, setDeparture, containersSelection, 
        loadingCity, setLoadingCity, trackingNumber, 
        portDestination, ports, products, hscodes, ports1, ports2, containers 
    } = props;

    const { t, i18n } = useTranslation();
    
    const [loadResults, setLoadResults] = useState<boolean>(false);
    const [loadGeneralMiscs, setLoadGeneralMiscs] = useState<boolean>(false);
    const [loadMiscsHaulage, setLoadMiscsHaulage] = useState<boolean>(false);
    const [loadNewOffer, setLoadNewOffer] = useState<boolean>(false);
    const [loadStatus, setLoadStatus] = useState<boolean>(false);
    const [valueSpecifics, setValueSpecifics] = useState<string>("");
        
    const [haulages, setHaulages] = useState<any>(null);
    const [seafreights, setSeafreights] = useState<any>(null);
    // const [allSeafreights, setAllSeafreights] = useState<any>(null);
    const [miscs, setMiscs] = useState<any>([]); // Seafreight Miscs
    const [miscsHaulage, setMiscsHaulage] = useState<any>([]);
    const [generalMiscs, setGeneralMiscs] = useState<any>(null);
    const [tableMiscs, setTableMiscs] = useState<any>(null);
    
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
    const [modalFile, setModalFile] = useState<boolean>(false);
    const [modalOffer, setModalOffer] = useState<boolean>(false);

    const queryClient = useQueryClient();

    const {data: files, isFetching} = useQuery({
        ...getApiFileByFolderOptions({path: {folder: "Standard"}})
    }); 

    const postFileUploadMutation = useMutation({
        ...postApiFileUploadMutation(),
        onSuccess: () => {  
            enqueueSnackbar(t('fileAdded'), { variant: "success", anchorOrigin: { horizontal: "right", vertical: "top"} });
            queryClient.invalidateQueries(getApiFileByFolderOptions({path: {folder: "Standard"}}));
            
            setModalFile(false);
        },
        onError: () => {
            enqueueSnackbar(t('errorHappened'), { variant: "error", anchorOrigin: { horizontal: "right", vertical: "top"} });
        }
    });

    useEffect(() => {
        setLoadResults(isFetching);
    }, [isFetching])
    
    
    // const [loadCurrentOffer, setLoadCurrentOffer] = useState<boolean>(false);
    const [currentOffer, setCurrentOffer] = useState<any>(null);
    //const [files, setFiles] = useState<any>(null);
    const [fileValue, setFileValue] = useState<File[] | undefined>(undefined);    
    
    const rteRef = useRef<RichTextEditorRef>(null);
    
    const [formState, setFormState] = useProcessStatePersistence(
        "allAccounts",
        'generatePriceOfferTest'+id,
        { 
            haulageType: "", selectedTemplate: defaultTemplate, 
            selectedHaulage: null, rowSelectionModel2: [],
            selectedSeafreight: null, rowSelectionModel: [], 
            selectedMisc: null, myMiscs: [], rowSelectionModel3: [],
            activeStep: 0, margins: containersSelection.map(() => 22), addings: containersSelection.map(() => 0),
            marginsMiscs: Array(15).fill(50), addingsMiscs: [],  
            portDeparture: null, portDestination: portDestination,
            selectedSeafreights: null, currentOption: 0, options: [], 
            files: []
        },
        null, // Optionnel, par défaut à null (pas d'expiration)
        true // Optionnel, par défaut à true (sauvegarde automatique activée)
    );
    
    const steps = [t('selectHaulage'), t('selectSeafreight'), t('selectMisc'), t('sendOffer')];
    const columnsSeafreights: GridColDef[] = [
        { field: 'carrierName', headerName: t('carrier'), flex: 1.25 },
        { field: 'carrierAgentName', headerName: t('carrierAgent'), flex: 1.25 },
        { field: 'frequency', headerName: t('frequency'), valueFormatter: (value?: number) => `${t('every')} ${value || ''} `+t('days'), flex: 0.75 },
        { field: 'transitTime', headerName: t('transitTime'), valueFormatter: (value?: number) => `${value || ''} `+t('days'), flex: 0.5 },
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
        }, renderHeader: () => t('prices'), flex: 1 },
        { field: 'validUntil', headerName: t('validUntil'), minWidth: 105, renderCell: (params: GridRenderCellParams) => {
            return (
                <Box sx={{ my: 1 }}>
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

    const getUnitTariff: GridValueGetter<(typeof haulages)[number], unknown> = (_,row,) => {
        return `${row.unitTariff || ''} ${t(row.currency)}`;
    };

    const getMultiStop: GridValueGetter<(typeof haulages)[number], unknown> = (_, row,) => {
        return `${row.multiStop || ''} ${t(row.currency)}`;
    };

    const getOvertimeTariff: GridValueGetter<(typeof haulages)[number], unknown> = (_,row,) => {
        return `${row.overtimeTariff || ''} ${t(row.currency)} / ${t('hour')}`;
    };
    
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
        { field: 'unitTariff', headerName: t('unitTariff'), valueGetter: getUnitTariff, renderHeader: (_: GridColumnHeaderParams) => (<>{t('unitTariff')}</>), minWidth: 100, flex: 0.75 },
        { field: 'freeTime', headerName: t('freeTime'), valueFormatter: (value?: number) => `${value || ''} ${t('hours')}`, minWidth: 100, flex: 0.75 },
        { field: 'overtimeTariff', headerName: t('overtimeTariff'), valueGetter: getOvertimeTariff, renderHeader: (_: GridColumnHeaderParams) => (<>{t('overtimeTariff')}</>), minWidth: 100, flex: 1 },
        { field: 'multiStop', headerName: t('multiStop'), valueGetter: getMultiStop, minWidth: 100, flex: 0.75 },
        { field: 'validUntil', headerName: t('validUntil'), minWidth: 105, renderCell: (params: GridRenderCellParams) => {
            return (
                <Box sx={{ my: 1 }}>
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
        { field: 'validUntil', headerName: t('validUntil'), minWidth: 105, renderCell: (params: GridRenderCellParams) => {
            return (
                <Box sx={{ my: 1 }}>
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
        updatedMargins[index] = Number(value);
        setFormState({...formState, margins: updatedMargins});
    };
    
    const handleAddingChange = (index: number, value: any) => {
        const updatedAddings: any = [...formState.addings];
        updatedAddings[index] = Number(value);
        setFormState({...formState, addings: updatedAddings});
    };
    
    const handleMarginMiscChange = (index: number, value: any) => {
        const updatedMarginMiscs: any = [...formState.marginsMiscs];
        updatedMarginMiscs[index] = Number(value);
        setFormState({...formState, marginsMiscs: updatedMarginMiscs});
    };
    
    useEffect(() => {
        console.log("Commm: ", props.commodities);
        //setFiles([]);
        setMailLanguage(mailLanguage);
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
        if (loadingCity !== null) {
            getHaulagePriceOffers();
        }
    }, [loadingCity]);

    useEffect(() => {
        if ((formState.selectedHaulage !== null || formState.selectedSeafreight !== null || formState.options.length !== 0)) {
            props.setCanEdit(false);
        }
        else {
            props.setCanEdit(true);
        }
        console.log("Form State : ", formState);
    }, [formState]);
    
    useEffect(() => {
        getTemplates();
    }, []);
    
    useEffect(() => {
        if (formState.haulageType !== undefined && formState.haulageType !== "") {
            getHaulagePriceOffers();
        }
    }, [formState.haulageType]);

    useEffect(() => {
        if (formState.selectedTemplate !== undefined && formState.selectedTemplate !== null) {
            getTemplate(formState.selectedTemplate);
        }
    }, [formState.selectedTemplate]);

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
            var seafreightSelected = formState.selectedSeafreights !== undefined && formState.selectedSeafreights !== null ? formState.selectedSeafreights : [];
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

    const changeStatus = async (value: string) => {
        try {
            setLoadStatus(true);
            const body: any = {
                newStatus: value,
                customMessage: ""
            };
            const data = await putApiRequestByIdChangeStatus({body: body, path: {id: props.id}});
            if (data?.data) {
                setLoadStatus(false);
                enqueueSnackbar(t('requestStatusUpdated'), { variant: "success", anchorOrigin: { horizontal: "right", vertical: "top"} });
            }
            else {
                setLoadStatus(false);
                setLoadNewOffer(false);
                enqueueSnackbar(t('errorHappened'), { variant: "error", anchorOrigin: { horizontal: "right", vertical: "top"} });
            }
        }
        catch (err: any) {
            console.log(err);
            setLoadNewOffer(false);
        }
    }
    
    const uploadFile = async () => {
        if (fileValue !== undefined && fileValue !== null) {
            await postFileUploadMutation.mutateAsync({query: {folder: "Standard"}, body: {file: fileValue[0]}})
        }
        else {
            enqueueSnackbar("The file field is empty, please verify it and pick a file.", { variant: "warning", anchorOrigin: { horizontal: "right", vertical: "top"} });
        }
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
        
        // console.log("Haulage : ", haulagePrices);
        // console.log("Seafreight : ", seafreightPrices);
        // console.log("Miscs : ", miscPrices);
        // console.log("Index : ", index);
        // console.log("Margins : ", option.margins);
        // console.log("Addings : ", option.addings);

        var allAddings = option.addings[index] !== undefined ? option.addings[index] : 0;

        var finalValue = ((seafreightPrices+haulagePrices+miscPrices)*(option.margins[index]/100)+seafreightPrices+haulagePrices+miscPrices).toFixed(2);
        return Number(finalValue)+Number(allAddings);
    }

    function calculateContainerPrice(type: string, quantity: number, index: number) {
        // Calculate seafreight prices
        var seafreightPrices = 0;
        var seafreightSelected = seafreights !== null && formState.selectedSeafreights !== undefined && formState.selectedSeafreights !== null ? 
            formState.selectedSeafreights.find((elm: any) => elm.containers[0].container.packageName === type) 
        : null;
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

        // Calculate all addings prices
        var allAddings = formState.addings[index] !== undefined ? formState.addings[index] : 0;
        
        var finalValue = ((seafreightPrices+haulagePrices+miscPrices)*(formState.margins[index]/100)+seafreightPrices+haulagePrices+miscPrices).toFixed(2);
        return Number(finalValue)+Number(allAddings);
    }

    function calculateSeafreightPrice(type: string, quantity: number, index: number) {
        // Calculate seafreight prices
        var seafreightPrices = 0;
        if (seafreights !== null && formState.selectedSeafreights !== undefined && formState.selectedSeafreights !== null) {
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
        var finalValue = formState.margins !== undefined && formState.margins !== null ? 
            ((seafreightPrices+haulagePrices+miscPrices)*(formState.margins[index]/100)+seafreightPrices+haulagePrices+miscPrices).toFixed(2) 
        : 0;
        // Calculate all addings prices
        var allAddings = formState.addings[index] !== undefined ? formState.addings[index] : 0;
        
        
        return Number(finalValue)+Number(allAddings);
    }

    const getHaulagePriceOffers = async () => {
        try {
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
            var containersFormatted = (containersSelection.map((elm: any) => elm.id)); 
            const response = await getApiPricingHaulagesOfferRequest({query: {HaulageType: formState.haulageType, LoadingCity: city, ContainerIdsType: containersFormatted}});
            // console.log("Resp : ", response.data);
            // console.log("Removed : ", removeDuplicatesWithLatestUpdated(response.data));
            setLoadResults(false);
            setHaulages(removeDuplicatesWithLatestUpdated(response.data));
        }
        catch (err: any) {
            console.log(err);
            setLoadResults(false);
        }
    }

    const getSeaFreightPriceOffers = async () => {
        try {
            setLoadResults(true);
            // var containersFormatted = (containersSelection.map((elm: any) => elm.id)).join("&ContainerTypesId=");
            var containersFormatted = (containersSelection.map((elm: any) => elm.id));
            
            var auxPortDeparture = formState.portDeparture;
            if (formState.selectedHaulage !== null && formState.selectedHaulage !== undefined) {
                auxPortDeparture = ports1.find((elm: any) => elm.portId === formState.selectedHaulage.loadingPortId);
            }

            if (auxPortDeparture !== undefined && auxPortDeparture !== null && formState.portDestination !== undefined && formState.portDestination !== null) {
                const response: any = await getApiPricingSeaFreightsOffersRequest({query: {DeparturePortId: auxPortDeparture.portId, DestinationPortId: formState.portDestination.portId, ContainerTypesId: containersFormatted}});
                var myContainers = containersSelection.map((elm: any) => elm.container);
                // setAllSeafreights(response.data);
                setSeafreights(response.data.filter((elm: any) => myContainers.includes(elm.containers[0].container.packageName)).map((elm: any) => { return {...elm, defaultContainer: elm.containers[0].container.packageName}}));
            }
            else {
                console.log("Port departure : ", auxPortDeparture);
            }
            setLoadResults(false);
        }
        catch (err: any) {
            console.log(err);
            setLoadResults(false);
        }
    }

    const getMiscellaneousPriceOffers = async () => {
        setLoadResults(true);
        try {
            const response: any = await getApiMiscellaneousMiscellaneous({query: {departurePortId: formState.portDeparture.portId, destinationPortId: formState.portDestination.portId, withShipment: true}});
            var myContainers = containersSelection.map((elm: any, index: any) => {
                if (calculateSeafreightPrice(elm.container, elm.quantity, index) !== 0) {
                    return elm.container;
                }
                return null;
            });
            
            var myFreights = formState.rowSelectionModel.length !== 0 && seafreights !== null && formState.selectedSeafreights !== undefined && formState.selectedSeafreights !== null ? 
                formState.selectedSeafreights 
            : [];
            var suppliersRecentlySelected = myFreights.map((elm: any) => { return {carrierName: elm.carrierName, defaultContainer: elm.defaultContainer} });
            
            var arrayFinal = response.data.length !== 0 ? 
                response.data[0].suppliers.filter((elm: any) => myContainers.includes(elm.containers[0].container.packageName)).filter((elm: any) => new Date(elm.validUntil) > new Date()).filter((elm: any) => suppliersRecentlySelected.some((val: any) => val.carrierName === elm.supplierName && val.defaultContainer === elm.containers[0].container.packageName)).map((elm: any) => { return {...elm, defaultContainer: elm.containers[0].container.packageName}})
            : [];
            setMiscs(arrayFinal);
            setLoadResults(false);
        }
        catch (err: any) {
            console.log(err);
            setLoadResults(false);
        }
    }

    const getGeneralMiscellaneousPriceOffers = async () => {
        setLoadGeneralMiscs(true);
        try {
            var response: any = await getApiMiscellaneousMiscellaneous({query: {withShipment: false}});
            var myFreights = formState.rowSelectionModel.length !== 0 && seafreights !== null && formState.selectedSeafreights !== undefined && formState.selectedSeafreights !== null ? 
                formState.selectedSeafreights 
            : [];
            var suppliersRecentlySelected = myFreights.map((elm: any) => { return {carrierName: elm.carrierName, defaultContainer: elm.defaultContainer} });
            
            var arrayFinal = response.data.length !== 0 ? 
                response.data
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
        catch (err: any) {
            console.log(err);
            setLoadGeneralMiscs(false);
        }
    }

    const getHaulageMiscellaneousPriceOffers = async () => {
        setLoadMiscsHaulage(true)
        try {
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
            const response: any = await getApiMiscellaneousMiscellaneous({query: {supplierId: formState.selectedHaulage.haulierId, departurePortId: Number(hashCode(city)), destinationPortId: formState.selectedHaulage.loadingPortId, withShipment: true}});
            var arrayFinal = response.data.length !== 0 ? response.data[0].suppliers.filter((elm: any) => myContainers.includes(elm.containers[0].container.packageName)).filter((elm: any) => new Date(elm.validUntil) > new Date()) : [];
            setMiscsHaulage(arrayFinal);
            setLoadMiscsHaulage(false);
        }
        catch (err: any) {
            console.log(err);
            setLoadMiscsHaulage(false);
        }
    }

    const createNewOffer = async () => {
        if (formState.selectedSeafreight !== null && formState.selectedSeafreight !== undefined) {
            try {
                setLoadNewOffer(true);
                var sentOptions = formState.options.map((item: any) => {
                    return {
                        ...item,
                        selectedHaulage: {
                            ...item.selectedHaulage, 
                            loadingCityName: getCity(props.requestData.departure)
                        }, 
                        selectedSeafreight: {
                            ...item.selectedSeafreight, 
                            validUntil: item.selectedSeafreight.validUntil !== null ? parseDate(item.selectedSeafreight.validUntil) : "2100-01-01T00:00:00Z"
                        },
                        selectedSeafreights: item.selectedSeafreights.map((elm: any) => { 
                            return {...elm, validUntil: elm.validUntil !== null ? parseDate(elm.validUntil) : "2100-01-01T00:00:00Z"} 
                        }),
                        myMiscs: item.myMiscs.map((elm: any) => {
                            return {
                                ...elm, 
                                defaultContainer: elm.defaultContainer !== null ? elm.defaultContainer : "N/A",
                                services: elm.services.map((val: any) => {
                                    return {...val, containers: val.containers.map((obj: any) => { return {...obj, packageName: obj.packageName !== null ? obj.packageName : "N/A"} }) }
                                }),
                                containers: elm.services[0].containers.map((obj: any) => { return {...obj, packageName: obj.packageName !== null ? obj.packageName : "N/A"} })
                            }
                        })
                    }; 
                });
                
                console.log("Client Number : ", clientNumber);
                var dataSent = {
                    "requestQuoteId": Number(id),
                    "comment": rteRef.current?.editor?.getHTML(),
                    "quoteOfferNumber": generateRandomNumber(),
                    "quoteOfferVm": 0,
                    "clientNumber": clientNumber.contactId+", "+trackingNumber,
                    "emailUser": email,
                    "options": sentOptions,
                    "files": formState.files.map((elm: any) => { return {...elm, fileName: elm.blobName, url: ""}}),
                    "selectedOption": -1
                };
                
                const response: any = await postApiQuoteOffer({body: dataSent});
                if (response !== null && response !== undefined) {
                    enqueueSnackbar(t('offerSuccessCreated'), { variant: "success", anchorOrigin: { horizontal: "right", vertical: "top"} });
                    console.log(response);
                    setLoadNewOffer(false);
                    changeStatus("Valider");
                    
                    setCurrentOffer(response.data.data);
                    // setLoadCurrentOffer(true);
                    setModalOffer(true);
                }
                else {
                    enqueueSnackbar(t('errorHappened'), { variant: "error", anchorOrigin: { horizontal: "right", vertical: "top"} });
                    setLoadNewOffer(false);
                }
            }
            catch (err: any) {
                console.log(err);
                setLoadNewOffer(false);
            }
        }
        else {
            enqueueSnackbar(t('contentEmpty'), { variant: "error", anchorOrigin: { horizontal: "right", vertical: "top"} });
        }
    }

    const getTemplates = async () => {
        try {
            const response: any = await getApiTemplate({query: {Tags: ["offer"]}});
            if (response !== null && response !== undefined) {
                setTemplates(response.data?.data);
                setLoadTemplates(false);
            }
            else {
                setLoadTemplates(false);
            }
        }
        catch (err: any) {
            console.log(err);
            setLoadTemplates(false);
        }
    }
    
    // Work on the template
    const getTemplate = async (id: string) => {
        setLoadTemplate(true)
        try {
            const response: any = await getApiTemplateById({path: {id: id}});
            if (response !== null && response !== undefined) {
                setTemplateBase(response.data?.data);
                setLoadTemplate(false);
            }
            else {
                setLoadTemplate(false);
            }
        }
        catch (err: any) {
            console.log(err);
            setLoadTemplate(false);
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
        // var commodities:any = tags.map((elm: any) => elm.productName).join(',');
        var commodities:any = valueSpecifics === "products" ? tags.map((elm: any) => elm.productName).join(',') : 
        tags.map((elm: any) => {
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
        
        
        // var auxServices = formState.myMiscs;
        // var listServices = auxServices !== null && auxServices.length !== 0 && templateBase !== null ? 
        //     auxServices.map((elm: any, index: number) => elm.defaultContainer !== null ? "<p>- "+getServices(elm.containers, elm.currency)+" "+t('included', { lng: templateBase.currentVersion.includes("English") ? "en" : "fr" })+"</p>" : "<p>- "+getServicesTotal(elm.containers, elm.currency, formState.marginsMiscs[index])+" "+t('additionals', { lng: templateBase.currentVersion.includes("English") ? "en" : "fr" })+"</p>").join("")
        // : "<br>";
        var listServices = "";
        
        var auxPricesContainers = [];
        if (templateBase !== null && formState.options !== undefined && formState.options !== null) {
            for (var i = 0; i < formState.options.length; i++) {
                var option: any = formState.options[i];
                // console.log("Option : ", option);
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
                        +" / "+t('every', { lng: templateBase.currentVersion?.includes("English") ? "en" : "fr" })+" "+auxFrequency
                        +" "+t('days', { lng: templateBase.currentVersion?.includes("English") ? "en" : "fr" })+" / "+t('transitTime', { lng: templateBase.currentVersion.includes("English") ? "en" : "fr" })+" : "+auxTransitTime
                        +" "+t('days', { lng: templateBase.currentVersion?.includes("English") ? "en" : "fr" })+"</strong><br>"
                    }
                    else {
                        return null;
                    }
                }).join("") : "";
    
                var auxPricesPrecisions = option.selectedHaulage !== undefined && option.selectedHaulage !== null && templateBase !== null ? 
                    t('loadingOf', { lng: templateBase.currentVersion?.includes("English") ? "en" : "fr" })+option.selectedHaulage.freeTime
                    +t('includedForEachContainer', { lng: templateBase.currentVersion?.includes("English") ? "en" : "fr" })+option.selectedHaulage.overtimeTariff
                    +t('byHourIndivisible', { lng: templateBase.currentVersion?.includes("English") ? "en" : "fr" }) 
                : "";
    
                var auxPricesServices = option.myMiscs !== null && option.myMiscs.length !== 0 && templateBase !== null ? 
                    option.myMiscs.map((elm: any, index: number) => elm.defaultContainer !== null ? "<p>- "+getServices(elm.containers, elm.currency)+" "+t('included', { lng: templateBase.currentVersion.includes("English") ? "en" : "fr" })+"</p>" : "<p>- "+getServicesTotal(elm.containers, elm.currency, option.marginsMiscs[index])+" "+t('additionals', { lng: templateBase.currentVersion.includes("English") ? "en" : "fr" })+"</p>").join("")
                : "<br>";
    
                auxPricesContainers.push("<p># "+t('offer', { lng: templateBase.currentVersion?.includes("English") ? "en" : "fr" }).toUpperCase()+" "+Number(i+1)+"<p/>"+auxPricesTotal+auxPricesPrecisions+auxPricesServices);
            }
        }
        var pricesContainers = templateBase !== null ? auxPricesContainers.join("<p>"+t('', { lng: templateBase.currentVersion?.includes("English") ? "en" : "fr" })+"</p>") : "";    
        
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
        // var commodities:any = tags.map((elm: any) => elm.productName).join(',');
        var commodities:any = valueSpecifics === "products" ? tags.map((elm: any) => elm.productName).join(',') : 
        tags.map((elm: any) => {
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
        
        
        // var auxServices = formState.myMiscs;
        // var listServices = auxServices !== undefined && auxServices !== null && auxServices.length !== 0 && templateBase !== null ? 
        //     auxServices.map((elm: any, index: number) => elm.defaultContainer !== null ? "<p>- "+getServices(elm.containers, elm.currency)+" "+t('included', { lng: templateBase.currentVersion.includes("English") ? "en" : "fr" })+"</p>" : "<p>- "+getServicesTotal(elm.containers, elm.currency, formState.marginsMiscs[index])+" "+t('additionals', { lng: templateBase.currentVersion.includes("English") ? "en" : "fr" })+"</p>").join("")
        // : "<br>";
        var listServices = "";
        
        var auxPricesContainers = [];
        if (templateBase && formState.options !== undefined && formState.options !== null) {
            const lang = templateBase.currentVersion?.includes("English") ? "en" : "fr";
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
                        +" / "+t('every', { lng: lang })+" "+auxFrequency
                        +" "+t('days', { lng: lang })+" / "+t('transitTime', { lng: lang })+" : "+auxTransitTime
                        +" "+t('days', { lng: lang })+"</strong><br>"
                    }
                    else {
                        return null;
                    }
                }).join("") : "";
    
                var auxPricesPrecisions = option.selectedHaulage !== undefined && option.selectedHaulage !== null && templateBase !== null ? 
                    t('loadingOf', { lng: lang })+option.selectedHaulage.freeTime
                    +t('includedForEachContainer', { lng: lang })+option.selectedHaulage.overtimeTariff
                    +t('byHourIndivisible', { lng: lang }) 
                : "";
    
                var auxPricesServices = option.myMiscs !== null && option.myMiscs.length !== 0 && templateBase !== null ? 
                    option.myMiscs.map((elm: any, index: number) => elm.defaultContainer !== null ? "<p>- "+getServices(elm.containers, elm.currency)+" "+t('included', { lng: lang })+"</p>" : "<p>- "+getServicesTotal(elm.containers, elm.currency, option.marginsMiscs[index])+" "+t('additionals', { lng: lang })+"</p>").join("")
                : "<br>";
    
                auxPricesContainers.push("<p># "+t('offer', { lng: lang }).toUpperCase()+" "+Number(i+1)+"<p/>"+auxPricesTotal+auxPricesPrecisions+auxPricesServices);
            }
        }
        var pricesContainers = templateBase !== null ? auxPricesContainers.join("<p>"+t('', { lng: templateBase?.currentVersion?.includes("English") ? "en" : "fr" })+"</p>") : "";
        
        var clientName = clientNumber !== null ? clientNumber.contactName : null;
        var freeTime = formState.selectedHaulage !== null && formState.selectedHaulage !== undefined ? formState.selectedHaulage.freeTime : "";
        var overtimeTariff = formState.selectedHaulage !== null && formState.selectedHaulage !== undefined ? formState.selectedHaulage.overtimeTariff : "";
        var frequency = formState.selectedSeafreight !== null && formState.selectedSeafreight !== undefined ? formState.selectedSeafreight.frequency : "";
        var transitTime = formState.selectedSeafreight !== null && formState.selectedSeafreight !== undefined ? formState.selectedSeafreight.transitTime : "";
        var containersQuantities = displayContainers(containersSelection);

        const variables = { loadingCity, destinationPort, commodities, clientName, freeTime, overtimeTariff, frequency, transitTime, containersQuantities, listServices, pricesContainers };
        // console.log("rterEF : ", rteRef);
        // console.log("vars : ", variables);
        rteRef.current?.editor?.commands.setContent(generateEmailContent(mailLanguage !== "en" ? templateBase.content : templateBase.contentEn, variables));
    }, [tags, departure, clientNumber, formState.portDestination, formState.selectedSeafreight, formState.selectedHaulage, formState.selectedMisc, containersSelection, formState.margins, formState.addings, formState.marginsMiscs, seafreights, formState.options]);


    
    return (
        <Grid size={{ xs: 12 }}>
            {
                formState !== undefined ? 
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
                                            <Grid size={{ xs: 12, md: 6 }} mt={1}>
                                                <InputLabel htmlFor="loading-city" sx={inputLabelStyles}>{t('departure')} / {t('loadingCity')}</InputLabel>
                                                <AutocompleteSearch id="loading-city" value={loadingCity} onChange={setLoadingCity} fullWidth callBack={() => { setDeparture(loadingCity); }} />
                                            </Grid>
                                            <Grid size={{ xs: 12, md: 6 }} mt={1}>
                                                <InputLabel htmlFor="haulage-type" sx={inputLabelStyles}>{t('haulageType')}</InputLabel>
                                                <NativeSelect
                                                    id="haulage-type"
                                                    value={formState.haulageType}
                                                    onChange={(e: any) => { setFormState({...formState, haulageType: e.target.value}); }}
                                                    input={<BootstrapInput />}
                                                    fullWidth
                                                >
                                                    <option key={"kdq-"} value="">{t('anyType')}</option>
                                                    {
                                                        haulageTypeOptions.map((item: any, i: number) => (
                                                            <option key={"kdq"+i} value={item.value}>{t(item.label)}</option>
                                                        ))
                                                    }
                                                </NativeSelect>
                                            </Grid>
                                            <Grid size={{ xs: 12 }}>
                                                <Box sx={{ overflow: "auto" }}>
                                                    <Grid container>
                                                        <Grid size={{ xs: 6 }}>
                                                            <Typography variant="h5" sx={{ my: 2, fontSize: 18, fontWeight: "bold" }}>
                                                                {t('listHaulagesPricingOffers')+t('fromDotted')+loadingCity.city} ({t('selectOne')})
                                                            </Typography>
                                                        </Grid>
                                                        <Grid size={{ xs: 6 }}>
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
                                            <Grid size={{ xs: 12, md: 6 }} mt={1}>
                                                <InputLabel htmlFor="port-departure" sx={inputLabelStyles}><Anchor fontSize="small" sx={inputIconStyles} /> {t('departurePort')}</InputLabel>
                                                {
                                                    ports !== null ?
                                                    <Autocomplete
                                                        disablePortal
                                                        id="port-departure"
                                                        options={ports1}
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
                                                        value={formState.portDeparture}
                                                        size="small"
                                                        disabled={true}
                                                        sx={{ mt: 1 }}
                                                        renderInput={(params: any) => <TextField {...params} />}
                                                        onChange={(_, value: any) => { 
                                                            setFormState({...formState, portDeparture: value});
                                                        }}
                                                        fullWidth
                                                    /> : <Skeleton />
                                                }
                                            </Grid>
                                            <Grid size={{ xs: 12, md: 6 }} mt={1}>
                                                <InputLabel htmlFor="destination-port" sx={inputLabelStyles}><Anchor fontSize="small" sx={inputIconStyles} /> {t('arrivalPort')}</InputLabel>
                                                {
                                                    ports !== null ?
                                                    <Autocomplete
                                                        disablePortal
                                                        id="destination-port"
                                                        options={ports2}
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
                                                        value={formState.portDestination}
                                                        size="small"
                                                        sx={{ mt: 1 }}
                                                        renderInput={(params: any) => <TextField {...params} />}
                                                        onChange={(_, value: any) => {  
                                                            setFormState({...formState, portDestination: value});
                                                            // setPortDestination(value); 
                                                        }}
                                                        fullWidth
                                                    /> : <Skeleton />
                                                }
                                            </Grid>
                                            <Grid size={{ xs: 12 }}>
                                                <Grid container>
                                                    <Grid size={{ xs: 6 }}>
                                                        <Typography variant="h5" sx={{ my: 2, fontSize: 18, fontWeight: "bold" }}>
                                                            {
                                                                formState.portDeparture !== undefined && formState.portDeparture !== null && formState.portDestination !== undefined && formState.portDestination !== null ?
                                                                t('listSeaFreightsPricingOffers')+t('fromDotted')+formState.portDeparture.portName+"-"+formState.portDestination.portName : 
                                                                t('listSeaFreightsPricingOffers')
                                                            }
                                                        </Typography>
                                                    </Grid>
                                                    <Grid size={{ xs: 6 }}>
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
                                            
                                            <Grid size={{ xs: 12 }}>
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
                                                                        // var selSf = newRowSelectionModel.length !== 0 ? seafreights.filter((sfreight: any) => newRowSelectionModel.includes(sfreight.seaFreightId)) : null;
                                                                        // console.log("Sfreights : ", selSf);
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
                                            <Grid size={{ xs: 12 }}>
                                                <Typography variant="h5" sx={{ my: 1, fontSize: 18, fontWeight: "bold" }}>{t('listMiscPricingOffers')+t('fromDotted')+formState.portDeparture.portName+"-"+formState.portDestination.portName}</Typography>
                                                <Grid container spacing={2}>
                                                    <Grid size={{ xs: 8 }}>
                                                        <Typography variant="h6" sx={{ mt: 2, fontSize: 17, fontWeight: "bold" }}>
                                                            {t('generalMiscs')} ({t('selectAny')})
                                                        </Typography>    
                                                    </Grid>
                                                    <Grid size={{ xs: 4 }}>
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
                                                            {t('createMisc')}
                                                        </Button>
                                                    </Grid>
                                                    <Grid size={{ xs: 12 }}>
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
                                            {
                                                formState.options !== undefined && formState.options !== null ? 
                                                <Grid size={{ xs: 12 }}>
                                                    {
                                                        formState.currentOption === null || formState.options.length === 0 || formState.currentOption >= formState.options.length ? 
                                                        <Button
                                                            variant="contained" 
                                                            color="primary" 
                                                            sx={anyButtonStyles}
                                                            style={{ marginRight: 8 }}
                                                            onClick={() => {
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
                                                                setFormState({...formState, options: [...formState.options, thisOption] });
                                                            }}
                                                        >
                                                            {t('saveOption')}
                                                        </Button> : null
                                                    }
                                                    {
                                                        formState.options !== undefined && formState.options.length < 3 ? 
                                                        <Button
                                                            variant="contained" 
                                                            color="inherit" 
                                                            sx={whiteButtonStyles}
                                                            style={{ marginRight: 8 }}
                                                            onClick={() => {
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
                                                            {t('newOption')}
                                                        </Button> : null
                                                    }
                                                    {
                                                        formState.options !== undefined && formState.options.length > 1 ? 
                                                        <Button
                                                            variant="contained" 
                                                            color="inherit" 
                                                            sx={whiteButtonStyles}
                                                            style={{ marginRight: 8 }}
                                                            onClick={() => { setModalCompare(true); }}
                                                        >
                                                            {t('compareOptions')}
                                                        </Button> : null 
                                                    }
                                                </Grid> : null
                                            }
                                            <Grid size={{ xs: 12 }}>
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
                                                                        {
                                                                            formState.currentOption === id ? 
                                                                            <Button
                                                                                variant="contained" 
                                                                                color="inherit" 
                                                                                sx={whiteButtonStyles}
                                                                                style={{ marginRight: 8, marginBottom: 16 }}
                                                                                onClick={() => {
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
                                                                                    enqueueSnackbar(t('optionUpdated'), { variant: "success", anchorOrigin: { horizontal: "right", vertical: "top"} });
                                                                                }}
                                                                            >
                                                                                {t('updateOption')}
                                                                            </Button> : null
                                                                        }
                                                                        <Button 
                                                                            variant="contained" color="inherit" sx={whiteButtonStyles} 
                                                                            style={{ marginRight: 8, marginBottom: 16 }}
                                                                            onClick={() => { 
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
                                                                            {t('selectOption')}
                                                                        </Button>
                                                                        <Button 
                                                                            variant="contained" color="inherit" sx={whiteButtonStyles} 
                                                                            style={{ marginBottom: 16 }}
                                                                            onClick={() => { setFormState({...formState, options: formState.options.filter((_: any, i: number) => i !== id)}); }}
                                                                        >
                                                                            {t('deleteOption')}
                                                                        </Button>
                                                                    </>
                                                                }
                                                            >
                                                                <ListItemText 
                                                                    sx={{ mt: 0 }}
                                                                    primary={
                                                                        <div>
                                                                            <span style={{ display: "inline-block", minWidth: "400px" }}>
                                                                                {
                                                                                    elm.selectedSeafreight !== undefined && elm.selectedSeafreight !== null ? 
                                                                                    Number(id+1)+"# "+elm.selectedSeafreight.departurePortName+" - "+elm.selectedSeafreight.destinationPortName+" | "+elm.selectedSeafreight.carrierName 
                                                                                    : "N/A"
                                                                                }
                                                                            </span>
                                                                            {
                                                                                elm.selectedHaulage !== null ? 
                                                                                <span style={formState.currentOption !== id ? { color: "teal", marginLeft: "20px" } : { color: "white", marginLeft: "20px"}}>
                                                                                    {t('H')} : {elm.selectedHaulage.unitTariff} €
                                                                                </span> : null
                                                                            }
                                                                            {
                                                                                <span style={formState.currentOption !== id ? { color: "teal", marginLeft: "20px" } : { color: "white", marginLeft: "20px"}}>
                                                                                    {t('F')} : {getTotalPrices(elm.selectedSeafreights)} €
                                                                                </span>
                                                                            }
                                                                            {
                                                                                <span style={formState.currentOption !== id ? { color: "teal", marginLeft: "20px" } : { color: "white", marginLeft: "20px"}}>
                                                                                    {t('M')} : {getTotalPrices(elm.myMiscs)} €
                                                                                </span>
                                                                            }
                                                                        </div>
                                                                    }
                                                                    slotProps={{primary: { fontWeight: "bold", fontSize: 13 }}}
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
                                                    <Grid size={{ xs: 12 }}>
                                                        <TableContainer component={Paper}>
                                                            <Table size="small">
                                                                <TableHead>
                                                                <TableRow>
                                                                    <TableCell><Typography sx={{ fontSize: 17, fontWeight: "bold" }}>{t('category')}</Typography></TableCell>
                                                                    <TableCell><Typography sx={{ fontSize: 17, fontWeight: "bold" }}>{t('serviceItem')}</Typography></TableCell>
                                                                    <TableCell><Typography sx={{ fontSize: 17, fontWeight: "bold" }}>{t('price')}</Typography></TableCell>
                                                                </TableRow>
                                                                </TableHead>
                                                                <TableBody>
                                                                {/* Haulage Section */}
                                                                {
                                                                    formState.selectedHaulage !== null && formState.selectedHaulage !== undefined ? 
                                                                    <>
                                                                        <TableRow>
                                                                            <TableCell rowSpan={9}><Typography sx={{ fontSize: 15 }}>{t('haulage')}</Typography></TableCell>
                                                                            <TableCell>{t('haulier')}</TableCell>
                                                                            <TableCell>{formState.selectedHaulage.haulierName}</TableCell>
                                                                        </TableRow>
                                                                        <TableRow>
                                                                            <TableCell>{t('loadingPort')}</TableCell>
                                                                            <TableCell>{formState.selectedHaulage.loadingPort}</TableCell>
                                                                        </TableRow>
                                                                        <TableRow>
                                                                            <TableCell>{t('containers')}</TableCell>
                                                                            <TableCell>{formState.selectedHaulage.containerNames.join(', ')}</TableCell>
                                                                        </TableRow>
                                                                        <TableRow>
                                                                            <TableCell>{t('unitTariff')}</TableCell>
                                                                            <TableCell>{formState.selectedHaulage.unitTariff} €</TableCell>
                                                                        </TableRow>
                                                                        <TableRow>
                                                                            <TableCell>{t('freeTime')}</TableCell>
                                                                            <TableCell>{formState.selectedHaulage.freeTime} {t('hour')}(s)</TableCell>
                                                                        </TableRow>
                                                                        <TableRow>
                                                                            <TableCell>{t('overtimeTariff')}</TableCell>
                                                                            <TableCell>{formState.selectedHaulage.overtimeTariff} € / {t('hour')}</TableCell>
                                                                        </TableRow>
                                                                        <TableRow>
                                                                            <TableCell>{t('multiStop')}</TableCell>
                                                                            <TableCell>{formState.selectedHaulage.multiStop} €</TableCell>
                                                                        </TableRow>
                                                                        <TableRow>
                                                                            <TableCell>{t('validUntil')}</TableCell>
                                                                            <TableCell>{(new Date(formState.selectedHaulage.validUntil)).toISOString().slice(0,10)}</TableCell>
                                                                        </TableRow>
                                                                        <TableRow>
                                                                            <TableCell>{t('comment')}</TableCell>
                                                                            <TableCell>{formState.selectedHaulage.comment}</TableCell>
                                                                        </TableRow>
                                                                    </> : null
                                                                }
                                                                
                                                                {/* Sea Freight Section */}
                                                                {
                                                                    formState.selectedSeafreights !== undefined && formState.selectedSeafreights !== null ? 
                                                                    <>
                                                                        <TableRow>
                                                                            <TableCell rowSpan={4}><Typography sx={{ fontSize: 15 }}>{t('seafreight')}</Typography></TableCell>
                                                                            <TableCell>{t('carrier')}</TableCell>
                                                                            <TableCell>{formState.selectedSeafreight.carrierName}</TableCell>
                                                                        </TableRow>
                                                                        <TableRow>
                                                                            <TableCell>{t('carrierAgent')}</TableCell>
                                                                            <TableCell>{formState.selectedSeafreight.carrierAgentName}</TableCell>
                                                                        </TableRow>
                                                                        {/* <TableRow>
                                                                            <TableCell>{t('frequency')}</TableCell>
                                                                            <TableCell>{t('every')} {formState.selectedSeafreight.frequency} {t('days')}</TableCell>
                                                                        </TableRow>
                                                                        <TableRow>
                                                                            <TableCell>{t('transitTime')}</TableCell>
                                                                            <TableCell>{formState.selectedSeafreight.transitTime} {t('days')}</TableCell>
                                                                        </TableRow> */}
                                                                        <TableRow>
                                                                            <TableCell>{t('prices')}</TableCell>
                                                                            <TableCell>
                                                                                {
                                                                                    formState.selectedSeafreights.map((elm: any, id: number) => {
                                                                                    return (
                                                                                        <div key={"sisf1-"+id}>
                                                                                            <div style={{ marginTop: 2, marginBottom: 2 }}>
                                                                                                # {elm.defaultContainer} | {elm.transitTime} {t('days')} : {getTotalPrice(elm)} € | {t('every')} {elm.frequency} {t('days')} | {elm.comment}
                                                                                            </div>
                                                                                            <div>{getServicesTotal(elm.containers, "€", 0)}</div>
                                                                                        </div>
                                                                                    );
                                                                                })}
                                                                            </TableCell>
                                                                        </TableRow>
                                                                        <TableRow>
                                                                            <TableCell>{t('validUntil')}</TableCell>
                                                                            <TableCell>{(new Date(formState.selectedSeafreight.validUntil)).toISOString().slice(0,10)}</TableCell>
                                                                        </TableRow>
                                                                        {/* <TableRow>
                                                                            <TableCell>{t('comment')}</TableCell>
                                                                            <TableCell>{formState.selectedSeafreight.comment}</TableCell>
                                                                        </TableRow> */}
                                                                    </> : null
                                                                }
                                                                
                                                                {/* Miscellaneous Section */}
                                                                {
                                                                    formState.myMiscs !== null && formState.myMiscs.length !== 0 ? 
                                                                    <>
                                                                        <TableRow>
                                                                            <TableCell rowSpan={4}><Typography sx={{ fontSize: 15 }}>{t('miscellaneous')}</Typography></TableCell>
                                                                            <TableCell>{t('details2')}</TableCell>
                                                                            <TableCell>
                                                                                {
                                                                                    formState.myMiscs.map((elm: any, id: number) => {
                                                                                    return (
                                                                                        <div key={"ssvf1-"+id} style={{ marginTop: 2, marginBottom: 2 }}>{elm.textServices}</div>
                                                                                    );
                                                                                })}
                                                                        </TableCell>
                                                                        </TableRow>
                                                                        {/* <TableRow>
                                                                            <TableCell>Unit price</TableCell>
                                                                            <TableCell>Général : 40 €</TableCell>
                                                                        </TableRow>
                                                                        <TableRow>
                                                                            <TableCell>Service</TableCell>
                                                                            <TableCell>Express mail : 40.00 €</TableCell>
                                                                        </TableRow>
                                                                        <TableRow>
                                                                            <TableCell>Valid until</TableCell>
                                                                            <TableCell>20/6/2024</TableCell>
                                                                        </TableRow> */}
                                                                        
                                                                    </> : null
                                                                }
                                                                </TableBody>
                                                            </Table>
                                                        </TableContainer>
                                                    </Grid>

                                                    {/* <Grid item xs={4}>
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
                                                    </Grid> */}
                                                    <Grid size={{ xs: 12 }}>
                                                        <Grid container spacing={0} sx={{ border: "1px solid #e5e5e5", backgroundColor: "#fff", px: 2, py: 1 }}>
                                                            <Grid size={{ xs: 12 }}>
                                                                <Typography variant="h5" sx={{ mt: 1, fontSize: 15, fontWeight: "bold" }}>Transport price margins</Typography>
                                                            </Grid>
                                                            {
                                                                containersSelection !== null && formState.rowSelectionModel.length !== 0 && seafreights !== undefined && seafreights !== null && formState.selectedSeafreights !== undefined && formState.selectedSeafreights !== null ?
                                                                formState.selectedSeafreights
                                                                .map((element: any, index: number) => {
                                                                    var containerElm = containersSelection.find((val: any) => val.container === element.containers[0].container.packageName);
                                                                    var allMiscs = formState.myMiscs;
                                                                    var miscsSelected = [];
                                                                    if (containerElm !== undefined && containerElm !== null) {
                                                                        miscsSelected = allMiscs.filter((elm: any) => elm.defaultContainer === containerElm.container);
                                                                    }
                                                                    
                                                                    return (
                                                                        <Grid size={{ xs: 6 }} key={"containerRow-"+index}>
                                                                            <ContainerElement
                                                                                key={"containerElm-"+index} 
                                                                                elm={containerElm}
                                                                                index={index}
                                                                                adding={formState.addings[index]}
                                                                                margin={formState.margins[index]}
                                                                                handleAddingChange={handleAddingChange}
                                                                                handleMarginChange={handleMarginChange}
                                                                                purchasePrice={
                                                                                    formState.addings[index] !== undefined ?
                                                                                    Number(((calculateContainerPrice(containerElm.container, containerElm.quantity, index)-formState.addings[index])/(1+formState.margins[index]/100)).toFixed(2))+" "+t(element.currency) : 
                                                                                    Number(((calculateContainerPrice(containerElm.container, containerElm.quantity, index)-0)/(1+formState.margins[index]/100)).toFixed(2))+" "+t(element.currency)
                                                                                }
                                                                                profit={
                                                                                    formState.addings[index] !== undefined ?
                                                                                    Number((calculateContainerPrice(containerElm.container, containerElm.quantity, index) - ((calculateContainerPrice(containerElm.container, containerElm.quantity, index)-formState.addings[index])/(1+formState.margins[index]/100))).toFixed(2))+" "+t(element.currency) : 
                                                                                    Number((calculateContainerPrice(containerElm.container, containerElm.quantity, index) - ((calculateContainerPrice(containerElm.container, containerElm.quantity, index)-0)/(1+formState.margins[index]/100))).toFixed(2))+" "+t(element.currency)
                                                                                }
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
                                                                    formState.myMiscs.map((elm: any) => myServices(elm.containers)).map((element: any, index: number) => {
                                                                        return (
                                                                            <Grid size={{ xs: 6 }} key={"marginMiscs-"+index}>
                                                                                <Grid container spacing={2}>
                                                                                    <Grid size={{ xs: 12 }} sx={{ pt: 0 }}>
                                                                                        <Typography variant="h5" sx={{ fontSize: 15, fontWeight: "bold" }}>Service price margins</Typography>
                                                                                    </Grid>
                                                                                    <Grid size={{ xs: 8 }}>
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
                                                                                    <Grid size={{ xs: 12 }}>
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
                                                    
                                                    <Grid size={{ xs: 4 }}>
                                                        <InputLabel htmlFor="selectedTemplate" sx={inputLabelStyles}>{t('selectedTemplate')}</InputLabel>
                                                        {
                                                            loadTemplates !== true && formState.selectedTemplate !== undefined && formState.selectedTemplate !== null ?
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
                                                    {
                                                        formState.files !== undefined ? 
                                                        files !== null ?
                                                        <Grid size={{ xs: 6 }}>
                                                            <InputLabel htmlFor="selectedFiles" sx={inputLabelStyles}>{t('fileSent')}</InputLabel>
                                                            <Autocomplete
                                                                disablePortal
                                                                multiple
                                                                id="selectedFiles"
                                                                getOptionLabel={(option: any) => { 
                                                                    return option.blobName.replace("Standard/", "");
                                                                }}
                                                                value={formState.files}
                                                                size="small"
                                                                options={files ?? []}
                                                                fullWidth
                                                                onChange={(_, value: any) => { 
                                                                    setFormState({...formState, files: value});
                                                                }}
                                                                renderInput={(params: any) => <TextField {...params} label="" />}
                                                                sx={{ mt: 1 }}
                                                            />
                                                        </Grid> : <Grid size={{ xs: 6 }}><Skeleton /></Grid>
                                                        : null
                                                    }
                                                    <Grid size={{ xs: 2 }}>
                                                        <Button 
                                                            variant="contained" color="inherit" 
                                                            sx={{ float: "right", backgroundColor: "#fff", textTransform: "none", mt: 4 }} 
                                                            onClick={() => { setModalFile(true); }} 
                                                        >
                                                            {t('uploadFile')}
                                                        </Button>
                                                    </Grid>
                                                    <Grid size={{ xs: 12 }}>
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
                                                                    /> : <Skeleton />
                                                                }
                                                            </Box>   
                                                            : null
                                                        }
                                                    </Grid>
                                                </> : <Grid size={{ xs: 12 }}><Alert severity="info">{t('youNeedToSave')}</Alert></Grid>
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
                                            {t('back')} ({t('toEditOffer')} N° #{Number(formState.currentOption+1)})
                                        </Button>
                                        <Box sx={{ flex: '1 1 auto' }} />
                                        {isStepOptional(formState.activeStep) && formState.options !== undefined && formState.options.length !== 0 && (
                                            <Button variant="contained" color="inherit" sx={whiteButtonStyles} onClick={() => { setFormState({...formState, activeStep: 3 }); }} style={{ marginRight: "10px" }}>
                                                {t('goToOptions')}
                                            </Button>
                                        )}
                                        {isStepOptional(formState.activeStep) && (
                                            <Button variant="contained" color="inherit" sx={whiteButtonStyles} onClick={handleSkip} style={{ marginRight: "10px" }}>
                                                {t('skip')}
                                            </Button>
                                        )}
                                        {
                                            props.type === "handle" ? 
                                            <Button variant="contained" color={formState.activeStep === steps.length - 1 ? "primary" : "inherit"} sx={anyButtonStyles} onClick={handleNext} disabled={formState.activeStep === steps.length - 1 ? loadNewOffer : false}>
                                                {formState.activeStep === steps.length - 1 ? t('createOffer') : t('nextStep')}
                                            </Button> : null
                                        }
                                        {
                                            props.type === "standard" ? 
                                            <Button 
                                                variant="contained" 
                                                color={formState.activeStep === steps.length - 1 ? "primary" : "inherit"} 
                                                sx={anyButtonStyles} 
                                                onClick={() => { 
                                                    formState.activeStep === steps.length - 1 ? changeStatus("EnCoursDeTraitement") : handleNext() 
                                                }}
                                                disabled={formState.activeStep === steps.length - 1 ? loadStatus : false}
                                            >
                                                {formState.activeStep === steps.length - 1 ? t('sendOfferValidation') : t('nextStep')}
                                            </Button> : null
                                        }
                                    </Box>
                                </React.Fragment>
                            )}
                        </Box>
                    </AccordionDetails>
                </Accordion> : <Skeleton />
            }
            
            {/* Price request haulage (modalRequestHaulage) */}
            <BootstrapDialog open={modalRequestHaulage} onClose={() => setModalRequestHaulage(false)} maxWidth="lg" fullWidth>
                <RequestPriceHaulage
                    ports={ports}
                    loadingCity={loadingCity}
                    loadingPort={formState.portDeparture}
                    closeModal={() => setModalRequestHaulage(false)}
                />
            </BootstrapDialog>

            {/* Price request seafreight FCL (modalRequestSeafreight) */}
            <BootstrapDialog open={modalRequestSeafreight} onClose={() => setModalRequestSeafreight(false)} maxWidth="lg" fullWidth>
                <RequestPriceSeafreight 
                    products={products} 
                    hscodes={hscodes}
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
            <BootstrapDialog open={modalNewMisc} onClose={() => setModalNewMisc(false)} maxWidth="lg" fullWidth>
                <BootstrapDialogTitle id="bootstrap-dialog-titleB" onClose={() => setModalNewMisc(false)}>
                    <b>{t('createRowMisc')}</b>
                </BootstrapDialogTitle>
                <NewMiscellaneous closeModal={() => setModalNewMisc(false)} updateMiscs={getGeneralMiscellaneousPriceOffers} />
            </BootstrapDialog>

            {/* Create new offer */}
            <BootstrapDialog open={modalOffer} onClose={() => setModalOffer(false)} maxWidth="lg" fullWidth>
                <BootstrapDialogTitle id="bootstrap-dialog-titleA" onClose={() => setModalOffer(false)}>
                    <b>{t('manageOffer')}</b>
                </BootstrapDialogTitle>
                {
                    currentOffer !== null && formState !== undefined ? 
                    <PriceOffer
                        id={currentOffer.id} files={formState.files} options={formState.options}
                        offer={currentOffer} setOffer={setCurrentOffer} type="modal" closeModal={() => setModalOffer(false)}
                    /> : <Skeleton />
                }
            </BootstrapDialog>

            {/* Create new haulage */}
            <BootstrapDialog open={modalHaulage} onClose={() => setModalHaulage(false)} maxWidth="lg" fullWidth>
                <NewHaulage 
                    ports={ports}
                    loadingCity={loadingCity}
                    containers={containers}
                    closeModal={() => setModalHaulage(false)}
                    callBack={() => { getHaulagePriceOffers(); }}
                />
            </BootstrapDialog>

            {/* Create new seafreight */}
            <BootstrapDialog open={modalSeafreight} onClose={() => setModalSeafreight(false)} maxWidth="lg" fullWidth>
                <NewSeafreight 
                    ports={ports}
                    portLoading={formState.portDeparture}
                    portDischarge={formState.portDestination}
                    containers={containers}
                    closeModal={() => setModalSeafreight(false)}
                    callBack={() => { getSeaFreightPriceOffers(); }}
                />
            </BootstrapDialog>

            {/* Compare options */}
            <BootstrapDialog open={modalCompare} onClose={() => setModalCompare(false)} maxWidth="lg" fullWidth>
                <CompareOptions 
                    options={formState.options.filter((elm: any) => elm !== null)} 
                    closeModal={() => { setModalCompare(false); }} 
                />
            </BootstrapDialog>

            {/* Create file */}
            <BootstrapDialog open={modalFile} onClose={() => setModalFile(false)} maxWidth="sm" fullWidth>
                <BootstrapDialogTitle id="custom-dialog-title99" onClose={() => setModalFile(false)}>
                    <b>{t('createRowFile')}</b>
                </BootstrapDialogTitle>
                <DialogContent dividers>
                    <Grid container spacing={2}>
                        <Grid size={{ xs: 12 }}>
                            <InputLabel htmlFor="fileSent" sx={inputLabelStyles}>{t('file')}</InputLabel>
                            <MuiFileInput
                                id="fileSent" size="small" 
                                variant="outlined" multiple fullWidth
                                value={fileValue} sx={{ mt: 1 }} 
                                onChange={(newValue: any) => { 
                                    setFileValue(newValue); 
                                }}
                            />
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions>
                    <Button variant="contained" onClick={() => { uploadFile(); }} sx={actionButtonStyles}>{t('validate')}</Button>
                    <Button variant="contained" onClick={() => setModalFile(false)} sx={buttonCloseStyles}>{t('close')}</Button>
                </DialogActions>
            </BootstrapDialog>
        </Grid>
    );
}

export default GeneratePriceOffer;
