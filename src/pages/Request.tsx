import React, { useEffect, useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { Alert, Autocomplete, Box, Button, Chip, Grid, IconButton, InputLabel, ListItem, ListItemText, NativeSelect, Skeleton, Step, StepLabel, Stepper, TextField, ToggleButton, ToggleButtonGroup, Typography } from '@mui/material';
import { MuiTelInput } from 'mui-tel-input';
import AutocompleteSearch from '../components/shared/AutocompleteSearch';
import { inputLabelStyles, BootstrapInput, BootstrapDialog, whiteButtonStyles, gridStyles, HtmlTooltip } from '../utils/misc/styles';
import { enqueueSnackbar, SnackbarProvider } from 'notistack';
import DeleteIcon from '@mui/icons-material/Delete';
import HelpIcon from '@mui/icons-material/Help';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import { crmRequest, pricingRequest, protectedResources, transportRequest } from '../config/authConfig';
import { useAuthorizedBackendApi } from '../api/api';
import { BackendService } from '../utils/services/fetch';
import { MuiChipsInputChip } from 'mui-chips-input';
import { useAccount, useMsal } from '@azure/msal-react';
import { AuthenticationResult } from '@azure/msal-browser';
import { useTranslation } from 'react-i18next';
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import StarterKit from "@tiptap/starter-kit";
import {
    MenuButtonBold,
    MenuButtonItalic,
    MenuControlsContainer,
    MenuDivider,
    MenuSelectHeading,
    MenuButtonStrikethrough,
    MenuButtonHorizontalRule,
    MenuSelectTextAlign,
    MenuButtonOrderedList,
    MenuButtonBulletedList,
    MenuButtonEditLink,
    MenuButtonUnderline,
    MenuButtonUndo,
    MenuButtonRedo,
    RichTextEditor,
    type RichTextEditorRef,
} from "mui-tiptap";

// @ts-ignore
import { JSON as seaPorts } from 'sea-ports';
// @ts-ignore

import { DataGrid, GridColDef, GridRenderCellParams, GridValueFormatterParams, GridValueGetterParams, GridRowSelectionModel } from '@mui/x-data-grid';
import ClientSearch from '../components/shared/ClientSearch';
import RequestListNotes from '../components/editRequestPage/RequestListNotes';
import RequestAddNote from '../components/editRequestPage/RequestAddNote';
import RequestAskInformation from '../components/editRequestPage/RequestAskInformation';
import RequestChangeStatus from '../components/editRequestPage/RequestChangeStatus';
// import { MailData } from '../utils/models/models';
// import { MuiFileInput } from 'mui-file-input';
import { calculateDistance, findClosestSeaPort } from '../utils/functions';
import RequestPriceRequest from '../components/editRequestPage/RequestPriceRequest';
import RequestPriceHaulage from '../components/editRequestPage/RequestPriceHaulage';
// import { EditorContent, useEditor } from '@tiptap/react';

//let statusTypes = ["EnAttente", "Valider", "Rejeter"];
// let cargoTypes = ["Container", "Conventional", "RollOnRollOff"];
// let packingTypes = ["LCL", "Airfreight", "Cars", "Trucks", "Not containerised"];
let packingOptions = ["Unit", "Bundle", "Bag", "Pallet", "Carton", "Lot", "Crate"];

function createGetRequestUrl(url: string, variable2: string, variable3: string, variable4: string) {
    // if (variable1) {
    //     url += 'PlannedDeparture=' + encodeURIComponent(variable1) + '&';
    // }
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
    // if (variable3) {
    //     url += 'PlannedDeparture=' + encodeURIComponent(variable3) + '&';
    // }
    if (variable4) {
        url += 'ContainerTypesId=' + variable4 + '&';
    }
    
    if (url.slice(-1) === '&') {
        url = url.slice(0, -1);
    }
    return url;
}

function getPackageNamesByIds(ids: string[], packages: any) {
    const packageNames = [];
  
    for (const id of ids) {
        const foundPackage = packages.find((pkg: any) => pkg.packageId === id);
        if (foundPackage) {
            packageNames.push(foundPackage.packageName);
        }
    }
    
    return packageNames;
}

function parseLocation(inputString: string) {
    const parts = inputString.split(', ');
    
    const city = parts[0];
    const country = parts[1];
    const latitude = parseFloat(parts[2]);
    const longitude = parseFloat(parts[3]);
    const postalCode = parts[4] || null; 
    
    const locationObject = {
        city: city,
        country: country,
        latitude: latitude,
        longitude: longitude,
        postalCode: postalCode
    };
    
    return locationObject;
}

function parseContact(inputString: string) {
    const parts = inputString.split(', ');
    
    const number = parts[0];
    const name = parts[1];
    
    const contactObject = {
        contactNumber: number,
        contactName: name,
    };
    
    return contactObject;
}

function displayContainers(value: any) {
    var aux = value.map((elm: any) => '<li>'+elm.quantity+"x"+elm.container+'</li>').join('');
    return '<ul>'+aux+'</ul>';
}

function sortByCloseness(myPort: any, seaPorts: any) {
    const myCoordinates = [myPort.latitude, myPort.longitude];

    // Calculate distances and add them to the sea ports
    seaPorts.forEach((seaPort: any) => {
        const seaPortCoordinates = seaPort.coordinates;
        if (seaPortCoordinates !== undefined) {
            const distance = calculateDistance(myCoordinates, seaPortCoordinates);
            seaPort.distance = distance; // Add the distance to each sea port
        } else {
            seaPort.distance = Infinity; // Ports without coordinates are considered farthest
        }
    });

    // Sort the sea ports by distance
    seaPorts.sort((a: any, b: any) => a.distance - b.distance);

    // Remove the "distance" property from the sorted ports
    seaPorts.forEach((seaPort: any) => {
        delete seaPort.distance;
    });

    return seaPorts;
}

function Request() {
    const [load, setLoad] = useState<boolean>(true);
    const [loadAssignees, setLoadAssignees] = useState<boolean>(true);
    const [loadResults, setLoadResults] = useState<boolean>(false);
    const [email, setEmail] = useState<string>("");
    const [status, setStatus] = useState<string | null>(null);
    const [trackingNumber, setTrackingNumber] = useState<string>("");
    const [phone, setPhone] = useState<string>("");
    const [message, setMessage] = useState<string>("");
    const [packingType, setPackingType] = useState<string>("FCL");
    const [clientNumber, setClientNumber] = useState<any>(null);
    const [departure, setDeparture] = useState<any>(null);
    const [arrival, setArrival] = useState<any>(null);
    const [tags, setTags] = useState<MuiChipsInputChip[]>([]);
    const [modal, setModal] = useState<boolean>(false);
    const [modal2, setModal2] = useState<boolean>(false);
    const [modal3, setModal3] = useState<boolean>(false);
    const [modal4, setModal4] = useState<boolean>(false);
    const [modal5, setModal5] = useState<boolean>(false);
    const [modal6, setModal6] = useState<boolean>(false);
    const [assignedManager, setAssignedManager] = useState<string>("");
    const [assignees, setAssignees] = useState<any>(null);
    
    const [containerType, setContainerType] = useState<string>("20' Dry");
    const [quantity, setQuantity] = useState<number>(1);
    const [containersSelection, setContainersSelection] = useState<any>([]);
    
    const [unitName, setUnitName] = useState<string>("");
    const [unitHeight, setUnitHeight] = useState<number>(0);
    const [unitLength, setUnitLength] = useState<number>(0);
    const [unitWidth, setUnitWidth] = useState<number>(0);
    const [unitWeight, setUnitWeight] = useState<number>(0);
    const [unitQuantity, setUnitQuantity] = useState<number>(1);
    const [unitsSelection, setUnitsSelection] = useState<any>([]);

    const [packageName, setPackageName] = useState<string>("");
    const [packageHeight, setPackageHeight] = useState<number>(0);
    const [packageLength, setPackageLength] = useState<number>(0);
    const [packageWidth, setPackageWidth] = useState<number>(0);
    const [packageWeight, setPackageWeight] = useState<number>(0);
    const [packageQuantity, setPackageQuantity] = useState<number>(1);
    const [packagesSelection, setPackagesSelection] = useState<any>([]);
    
    const [containersSelected, setContainersSelected] = useState<string[]>([]);
    const [portDestination, setPortDestination] = useState<any>(null);
    const [portDeparture, setPortDeparture] = useState<any>(null);
    const [loadingCity, setLoadingCity] = useState<any>(null);
    const [haulageType, setHaulageType] = useState<string>("");
    const [products, setProducts] = useState<any>(null);
    const [ports, setPorts] = useState<any>(null);
    const [ports1, setPorts1] = useState<any>(null);
    const [ports2, setPorts2] = useState<any>(null);
    const [clients, setClients] = useState<any>(null);
    const [containers, setContainers] = useState<any>(null);
    const [miscs, setMiscs] = useState<any>(null);
    const [haulages, setHaulages] = useState<any>(null);
    const [seafreights, setSeafreights] = useState<any>(null);
    const [selectedHaulage, setSelectedHaulage] = useState<any>(null);
    const [selectedSeafreight, setSelectedSeafreight] = useState<any>(null);
    const [selectedMisc, setSelectedMisc] = useState<any>(null);
    
    // const [margin, setMargin] = useState<number>(22);
    // const [reduction, setReduction] = useState<number>(0);
    // const [adding, setAdding] = useState<number>(0);
    // const [details, setDetails] = useState<string>("");
    // const [totalPrice, setTotalPrice] = useState<number>(0);
    // const [allSeaPorts, setAllSeaPorts] = useState<any>();
    const [tempToken, setTempToken] = useState<string>("");
    
    const [rowSelectionModel, setRowSelectionModel] = React.useState<GridRowSelectionModel>([]);
    const [rowSelectionModel2, setRowSelectionModel2] = React.useState<GridRowSelectionModel>([]);
    const [rowSelectionModel3, setRowSelectionModel3] = React.useState<GridRowSelectionModel>([]);

    const [mailLanguage, setMailLanguage] = useState<string>("fr");

    const rteRef = useRef<RichTextEditorRef>(null);
    
    let { id } = useParams();

    const { instance, accounts } = useMsal();
    const account = useAccount(accounts[0] || {});
        
    const context = useAuthorizedBackendApi();

    const { t } = useTranslation();
    
    const steps = [t('searchHaulage'), t('selectHaulage'), t('searchSeafreight'), t('selectSeafreight'), t('selectMisc'), t('sendOffer')];
    const haulageTypeOptions = [
        { value: "On trailer, direct loading", label: t('haulageType1') },
        { value: "On trailer, Loading with Interval", label: t('haulageType2') },
        { value: "Side loader, direct loading", label: t('haulageType3') },
        { value: "Side loader, Loading with Interval, from trailer to floor", label: t('haulageType4') },
        { value: "Side loader, Loading with Interval, from floor to trailer", label: t('haulageType5') }
    ];
    
    const columnsSeafreights: GridColDef[] = [
        { field: 'carrierName', headerName: t('carrier'), flex: 1.2 },
        { field: 'carrierAgentName', headerName: t('carrierAgent'), flex: 1.2 },
        // { field: 'departurePortName', headerName: t('departurePort'), flex: 1 },
        // { field: 'destinationPortName', headerName: t('destinationPort'), flex: 1 },
        { field: 'frequency', headerName: t('frequency'), valueFormatter: (params: GridValueFormatterParams) => `${t('every')} ${params.value || ''} `+t('days'), flex: 1 },
        { field: 'transitTime', headerName: t('transitTime'), valueFormatter: (params: GridValueFormatterParams) => `${params.value || ''} `+t('days'), flex: 1 },
        { field: 'currency', headerName: t('prices'), renderCell: (params: GridRenderCellParams) => {
            return (
                <Box sx={{ my: 1, mr: 1 }}>
                    <Box sx={{ my: 1 }} hidden={!getPackageNamesByIds(containersSelected, containers).includes("20' Dry")}>{params.row.price20dry !== 0 ? "20' Dry : "+params.row.price20dry+" "+t(params.row.currency) : "20' Dry : N/A"}</Box>
                    <Box sx={{ my: 1 }} hidden={!getPackageNamesByIds(containersSelected, containers).includes("20' Rf")}>{params.row.price20rf !== 0 ? "20' Rf : "+params.row.price20rf+" "+t(params.row.currency) : "20' Rf : N/A"}</Box>
                    <Box sx={{ my: 1 }} hidden={!getPackageNamesByIds(containersSelected, containers).includes("40' Dry")}>{params.row.price40dry !== 0 ? "40' Dry : "+params.row.price40dry+" "+t(params.row.currency) : "40' Dry : N/A"}</Box>
                    <Box sx={{ my: 1 }} hidden={!getPackageNamesByIds(containersSelected, containers).includes("40' Hc")}>{params.row.price40hc !== 0 ? "40' Hc : "+params.row.price40hc+" "+t(params.row.currency) : "40' Hc : N/A"}</Box>
                    <Box sx={{ my: 1 }} hidden={!getPackageNamesByIds(containersSelected, containers).includes("40' HcRf")}>{params.row.price40hcrf !== 0 ? "40' HcRf : "+params.row.price40hcrf+" "+t(params.row.currency) : "40' HcRf : N/A"}</Box>
                </Box>
            );
        }, flex: 1.1 },
        { field: 'validUntil', headerName: t('validUntil'), renderCell: (params: GridRenderCellParams) => {
            return (
                <Box sx={{ my: 1, mr: 1 }}>
                    <Chip label={(new Date(params.row.validUntil)).toLocaleDateString().slice(0,10)} color={(new Date()).getTime() - (new Date(params.row.validUntil)).getTime() > 0 ? "warning" : "success"}></Chip>
                </Box>
            );
        }, flex: 0.9 },
        // { field: 'lastUpdated', headerName: t('lastUpdated'), renderCell: (params: GridRenderCellParams) => {
        //     return (
        //         <Box sx={{ my: 1, mr: 1 }}>
        //             <Chip label={(new Date(params.row.lastUpdated)).toLocaleDateString().slice(0,10)} color={(new Date()).getTime() - (new Date(params.row.lastUpdated)).getTime() > 0 ? "default" : "default"}></Chip>
        //         </Box>
        //     );
        // }, flex: 1 },
        { field: 'comment', headerName: "Comment", renderCell: (params: GridRenderCellParams) => {
            return (
                <Box sx={{ my: 2 }}>
                    <HtmlTooltip
                        title={
                            params.row.comment === "" || params.row.comment === null ? 
                            <Box sx={{ p: 1 }}>
                                <Typography color="inherit" sx={{ fontSize: 13 }}>{t('noComment')}</Typography>
                            </Box> : 
                            <Box sx={{ p: 1 }}>
                                <Typography color="inherit" sx={{ fontSize: 13 }}>{params.row.comment}</Typography>
                            </Box>
                        }
                    >
                        <IconButton size="small">
                            <HelpIcon fontSize="small" />
                        </IconButton>
                    </HtmlTooltip>
                </Box>
            );
        }, flex: 0.6 },
    ];
    
    const columnsHaulages: GridColDef[] = [
        { field: 'haulierName', headerName: t('haulier'), flex: 1.3 },
        { field: 'loadingPort', headerName: t('loadingPort'), renderCell: (params: GridRenderCellParams) => {
            return (
                <Box sx={{ my: 2 }}>{params.row.loadingPort}</Box>
            );
        }, flex: 1 },
        { field: 'unitTariff', headerName: t('unitTariff'), valueGetter: (params: GridValueGetterParams) => `${params.row.unitTariff || ''} ${t(params.row.currency)}`, flex: 1 },
        { field: 'freeTime', headerName: t('freeTime'), valueFormatter: (params: GridValueFormatterParams) => `${params.value || ''} ${t('hours')}`, flex: 1 },
        { field: 'overtimeTariff', headerName: t('overtimeTariff'), valueGetter: (params: GridValueGetterParams) => `${params.row.overtimeTariff || ''} ${t(params.row.currency)} / ${t('hour')}`, flex: 1 },
        { field: 'multiStop', headerName: t('multiStop'), valueGetter: (params: GridValueGetterParams) => `${params.row.multiStop || ''} ${t(params.row.currency)}`, flex: 1 },
        { field: 'validUntil', headerName: t('validUntil'), renderCell: (params: GridRenderCellParams) => {
            return (
                <Box sx={{ my: 1, mr: 1 }}>
                    <Chip label={(new Date(params.row.validUntil)).toLocaleDateString().slice(0,10)} color={(new Date()).getTime() - (new Date(params.row.validUntil)).getTime() > 0 ? "warning" : "success"}></Chip>
                </Box>
            );
        }, flex: 0.9 },
        // { field: 'updated', headerName: t('lastUpdated'), renderCell: (params: GridRenderCellParams) => {
        //     return (
        //         <Box sx={{ my: 1, mr: 1 }}>
        //             <Chip label={(new Date(params.row.updated)).toLocaleDateString().slice(0,10)} color={(new Date()).getTime() - (new Date(params.row.updated)).getTime() > 0 ? "default" : "default"}></Chip>
        //         </Box>
        //     );
        // }, flex: 1 },
        { field: 'comment', headerName: "Comment", renderCell: (params: GridRenderCellParams) => {
            return (
                <Box sx={{ my: 2 }}>
                    <HtmlTooltip
                        title={
                            params.row.comment === "" || params.row.comment === null ? 
                            <Box sx={{ p: 1 }}>
                                <Typography color="inherit" sx={{ fontSize: 13 }}>{t('noComment')}</Typography>
                            </Box> : 
                            <Box sx={{ p: 1 }}>
                                <Typography color="inherit" sx={{ fontSize: 13 }}>{params.row.comment}</Typography>
                            </Box>
                        }
                    >
                        <IconButton size="small">
                            <HelpIcon fontSize="small" />
                        </IconButton>
                    </HtmlTooltip>
                </Box>
            );
        }, flex: 0.8 },
    ];
    
    const columnsMiscs: GridColDef[] = [
        { field: 'supplierName', headerName: t('supplier'), flex: 2.7 },
        // { field: 'departurePortName', headerName: t('departurePort'), valueFormatter: (params: GridValueFormatterParams) => `${portDeparture.portName || ''}`, flex: 1 },
        // { field: 'destinationPortName', headerName: t('destinationPort'), valueFormatter: (params: GridValueFormatterParams) => `${portDestination.portName || ''}`, flex: 1 },
        { field: 'currency', headerName: t('costPrices'), renderCell: (params: GridRenderCellParams) => {
            return (
                <Box sx={{ my: 1, mr: 1 }}>
                    <Box sx={{ my: 1 }} hidden={params.row.price20dry === 0 || !getPackageNamesByIds(containersSelected, containers).includes("20' Dry")}>{params.row.price20dry !== 0 ? "20' Dry : "+params.row.price20dry+" "+t(params.row.currency) : "20' Dry : N/A"}</Box>
                    <Box sx={{ my: 1 }} hidden={params.row.price20rf === 0 || !getPackageNamesByIds(containersSelected, containers).includes("20' Rf")}>{params.row.price20rf !== 0 ? "20' Rf : "+params.row.price20rf+" "+t(params.row.currency) : "20' Rf : N/A"}</Box>
                    <Box sx={{ my: 1 }} hidden={params.row.price40dry === 0 || !getPackageNamesByIds(containersSelected, containers).includes("40' Dry")}>{params.row.price40dry !== 0 ? "40' Dry : "+params.row.price40dry+" "+t(params.row.currency) : "40' Dry : N/A"}</Box>
                    <Box sx={{ my: 1 }} hidden={params.row.price40hc === 0 || !getPackageNamesByIds(containersSelected, containers).includes("40' Hc")}>{params.row.price40hc !== 0 ? "40' Hc : "+params.row.price40hc+" "+t(params.row.currency) : "40' Hc : N/A"}</Box>
                    <Box sx={{ my: 1 }} hidden={params.row.price40hcrf === 0 || !getPackageNamesByIds(containersSelected, containers).includes("40' HcRf")}>{params.row.price40hcrf !== 0 ? "40' HcRf : "+params.row.price40hcrf+" "+t(params.row.currency) : "40' HcRf : N/A"}</Box>
                </Box>
            );
        }, flex: 1.5 },
        { field: 'services', headerName: 'Services', renderCell: (params: GridRenderCellParams) => {
            return (
                <Box sx={{ my: 1, mr: 1 }}>
                    {params.row.services.map((elm: any, i: number) => {
                        return (
                            <Box key={"idServ"+i} sx={{ my: 1 }}>
                                {elm.service.serviceName} : {elm.service.price} {t(params.row.currency)}
                            </Box>
                        );
                    })}
                </Box>
            );
        }, flex: 1.8 },
        { field: 'updated', headerName: t('lastUpdated'), renderCell: (params: GridRenderCellParams) => {
            return (
                <Box sx={{ my: 1, mr: 1 }}>
                    <Chip label={(new Date(params.row.updated)).toLocaleDateString().slice(0,10)} color={(new Date()).getTime() - (new Date(params.row.updated)).getTime() > 0 ? "default" : "default"}></Chip>
                </Box>
            );
        }, flex: 1 },
        { field: 'comment', headerName: "Comment", renderCell: (params: GridRenderCellParams) => {
            return (
                <Box sx={{ my: 2 }}>
                    <HtmlTooltip
                        title={
                            params.row.comment === "" || params.row.comment === null ? 
                            <Box sx={{ p: 1 }}>
                                <Typography color="inherit" sx={{ fontSize: 13 }}>{t('noComment')}</Typography>
                            </Box> : 
                            <Box sx={{ p: 1 }}>
                                <Typography color="inherit" sx={{ fontSize: 13 }}>{params.row.comment}</Typography>
                            </Box>
                        }
                    >
                        <IconButton size="small">
                            <HelpIcon fontSize="small" />
                        </IconButton>
                    </HtmlTooltip>
                </Box>
            );
        }, flex: 1 },
    ];
    
    const handleChangeHaulageType = (event: { target: { value: string } }) => {
        setHaulageType(event.target.value);
    };
    
    const handleChangePackingType = (event: { target: { value: string } }) => {
        setPackingType(event.target.value);
    };
    
    const handleChangeAssignedManager = (event: { target: { value: string } }) => {
        setAssignedManager(event.target.value);
    };
    
    // Stepper functions
    const [activeStep, setActiveStep] = React.useState(0);
    const [skipped, setSkipped] = React.useState(new Set<number>());

    const isStepOptional = (step: number) => {
        return step === 0 || step === 1;
        // return false;
    };

    const isStepSkipped = (step: number) => {
        return skipped.has(step);
    };

    const handleNext = () => {
        let newSkipped = skipped;
        if (isStepSkipped(activeStep)) {
            newSkipped = new Set(newSkipped.values());
            newSkipped.delete(activeStep);
        }
        if (activeStep === 0) {
            if (containersSelection.map((elm: any) => elm.container).length !== 0 && portDestination !== null) {
                setContainersSelected(containersSelection.map((elm: any) => elm.id));
                if (selectedHaulage === null) {
                    if (loadingCity !== null && haulageType !== "") {
                        setLoadResults(true);
                        getHaulagePriceOffers();
                        setActiveStep((prevActiveStep) => prevActiveStep + 1);
                    }
                    else {
                        enqueueSnackbar(t('msgValidateHaulageStep'), { variant: "warning", anchorOrigin: { horizontal: "right", vertical: "top"} });
                    }
                }
            }
            else {
                enqueueSnackbar(t('msgValidateStartStep'), { variant: "warning", anchorOrigin: { horizontal: "right", vertical: "top"} });
            }
        }
        if (activeStep === 1) {
            if (selectedHaulage !== null) {
                setPortDeparture(ports1.find((elm: any) => elm.portName === selectedHaulage.loadingPort));
                setActiveStep((prevActiveStep) => prevActiveStep + 1);
                setSkipped(newSkipped);
            }
            else {
                enqueueSnackbar(t('youNeedSelectHaulage'), { variant: "warning", anchorOrigin: { horizontal: "right", vertical: "top"} });
            }
        }
        if (activeStep === 2) {
            if (selectedSeafreight === null) {
                setLoadResults(true);
                getSeaFreightPriceOffers();
            }
            setActiveStep((prevActiveStep) => prevActiveStep + 1);
            setSkipped(newSkipped);
        }
        if (activeStep === 3) {
            if (selectedSeafreight !== null) {
                if (selectedMisc === null) {
                    setLoadResults(true);
                    getMiscellaneousPriceOffers();
                }
                
                setActiveStep((prevActiveStep) => prevActiveStep + 1);
                setSkipped(newSkipped);
            }
            else {
                enqueueSnackbar(t('youNeedSelectSeafreight'), { variant: "warning", anchorOrigin: { horizontal: "right", vertical: "top"} });
            }
        }
        if (activeStep === 4) {
            setActiveStep((prevActiveStep) => prevActiveStep + 1);
            setSkipped(newSkipped);
        }
        if (activeStep === 5) {
            createNewOffer();
        }
    };

    const handleBack = () => {
        if (activeStep === 1) {
            setSelectedHaulage(null);
            // setSelectedSeafreight(null);
        }
        if (activeStep === 3) {
            setSelectedSeafreight(null);
            // setSelectedHaulage(null);
        }
        if (activeStep === 4) {
            setSelectedMisc(null);
        }
        
        setActiveStep((prevActiveStep) => prevActiveStep - 1);
    };

    const handleSkip = () => {
        if (!isStepOptional(activeStep)) {
            // You probably want to guard against something like this,
            // it should never occur unless someone's actively trying to break something.
            throw new Error("You can't skip a step that isn't optional.");
        }
        if (activeStep === 0) {
            getHaulagePriceOffers();
        }

        setActiveStep((prevActiveStep) => prevActiveStep + 1);
        setSkipped((prevSkipped) => {
            const newSkipped = new Set(prevSkipped.values());
            newSkipped.add(activeStep);
            return newSkipped;
        });
    };

    const handleReset = () => {
        setActiveStep(0);
    };
    
    function calculateContainerPrice(type: string, quantity: number) {
        // Calculate seafreight prices
        var seafreightPrices = 0;
        if (selectedSeafreight.price20dry !== 0 && type == "20' Dry") {
            seafreightPrices += selectedSeafreight.price20dry*containersSelection.find((elm: any) => elm.id === 8).quantity;
        }
        if (selectedSeafreight.price20rf !== 0 && type == "20' Rf") {
            seafreightPrices += selectedSeafreight.price20rf*containersSelection.find((elm: any) => elm.id === 13).quantity;
        }
        if (selectedSeafreight.price40dry !== 0 && type == "40' Dry") {
            seafreightPrices += selectedSeafreight.price40dry*containersSelection.find((elm: any) => elm.id === 9).quantity;
        }
        if (selectedSeafreight.price40hc !== 0 && type == "40' Hc") {
            seafreightPrices += selectedSeafreight.price40hc*containersSelection.find((elm: any) => elm.id === 10).quantity;
        }
        if (selectedSeafreight.price40hcrf !== 0 && type == "40' HcRf") {
            seafreightPrices += selectedSeafreight.price40hcrf*containersSelection.find((elm: any) => elm.id === 15).quantity;
        }

        // Calculate haulage prices
        var haulagePrices = 0;
        if (selectedHaulage !== null) {
            haulagePrices = haulagePrices + selectedHaulage.unitTariff*quantity;
        }    
        
        // Calculate miscellaneous prices
        var miscPrices = 0;
        if (selectedMisc !== null) {
            if (selectedMisc.price20dry !== 0 && type == "20' Dry") {
                miscPrices += selectedMisc.price20dry*containersSelection.find((elm: any) => elm.id === 8).quantity;
            }
            if (selectedMisc.price20rf !== 0 && type == "20' Rf") {
                miscPrices += selectedMisc.price20rf*containersSelection.find((elm: any) => elm.id === 13).quantity;
            }
            if (selectedMisc.price40dry !== 0 && type == "40' Dry") {
                miscPrices += selectedMisc.price40dry*containersSelection.find((elm: any) => elm.id === 9).quantity;
            }
            if (selectedMisc.price40hc !== 0 && type == "40' Hc") {
                miscPrices += selectedMisc.price40hc*containersSelection.find((elm: any) => elm.id === 10).quantity;
            }
            if (selectedMisc.price40hcrf !== 0 && type == "40' HcRf") {
                miscPrices += selectedMisc.price40hcrf*containersSelection.find((elm: any) => elm.id === 15).quantity;
            }
        }

        return ((seafreightPrices+haulagePrices+miscPrices)*0.22+seafreightPrices+haulagePrices+miscPrices).toFixed(2);
    }
    
    function similar(str1: string, str2: string) {
        const cleanStr1 = str1.replace(/[\s-]/g, '').toLowerCase();
        const cleanStr2 = str2.replace(/[\s-]/g, '').toLowerCase();
    
        return cleanStr1 === cleanStr2;
    }
       
    function initializeSeaPorts() {
        var auxArray = [];
        for (const [key, value] of Object.entries(seaPorts)) {
            if (value) {
                let result = value as any;
                auxArray.push({
                    name: result.name,
                    city: result.city,
                    country: result.country,
                    province: result.province,
                    coordinates: result.coordinates
                });
            }
        }
        return auxArray;
    }
    
    function addedCoordinatesToPorts(selectedPorts: any) {
        var allMySeaPorts = initializeSeaPorts();
        const updatedLisPorts = selectedPorts.map((lisPort: any) => {
            const matchingSeaPort = allMySeaPorts.find((seaPort: any) => (seaPort.name.toUpperCase().includes(lisPort.portName.toUpperCase()) || lisPort.portName.toUpperCase().includes(seaPort.name.toUpperCase()) || similar(seaPort.name, lisPort.portName)));
            if (matchingSeaPort) {
                return { ...lisPort, name: matchingSeaPort.name, coordinates: matchingSeaPort.coordinates };
            }
            return lisPort;
        });
        
        return updatedLisPorts;
    }
    
    useEffect(() => {
        // Here i try to get all the clients
        getClients();
        
        // Here i initialize the sea ports
        initializeSeaPorts();

        getContainers();
        // Get everything essential too (Products, Ports, Request info)
        getAssignees();
    }, [context]);
    
    const getAssignees = async () => {
        if (context) {
            setLoadAssignees(true);
            const response = await (context as BackendService<any>).getSingle(protectedResources.apiLisQuotes.endPoint+"/Assignee");
            if (response !== null && response.code !== undefined) {
                if (response.code === 200) {
                    console.log("Assignees", response.data);
                    setAssignees(response.data);
                    setLoadAssignees(false);

                    // Now i can load the ports (who loads the request later)
                    getPorts();
                }
                else {
                    setLoadAssignees(false);
                }
            }
            else {
                setLoadAssignees(false);
            }
        }
    }
    
    const loadRequest = async (allPorts: any, allProducts: any) => {
        if (context) {
            setLoad(true);
            const response = await (context as BackendService<any>).getSingle(protectedResources.apiLisQuotes.endPoint+"/Request/"+id);
            if (response !== null && response.code !== undefined) {
                if (response.code === 200) {
                    console.log("Request", response.data);
                    
                    setEmail(response.data.email !== "emailexample@gmail.com" ? response.data.email : "");
                    setPhone(response.data.whatsapp);
                    setDeparture(parseLocation(response.data.departure));
                    setArrival(parseLocation(response.data.arrival));
                    setLoadingCity(parseLocation(response.data.departure));
                    // setDepartureTown(convertStringToObject(response.data.departure));
                    // setArrivalTown(convertStringToObject(response.data.arrival));
                    setStatus(response.data.status);
                    // setCargoType(String(cargoTypes.indexOf(response.data.cargoType)));
                    setPackingType(response.data.packingType !== null ? response.data.packingType : "FCL");
                    setClientNumber(response.data.clientNumber !== null && response.data.clientNumber !== "" ? parseContact(response.data.clientNumber) : "");
                    setContainersSelection(response.data.containers.map((elm: any) => { return {
                        id: elm.id,
                        container: elm.containers, 
                        quantity: elm.quantity 
                    } }) || []);
                    setUnitsSelection(response.data.units.map((elm: any) => { return {
                        name: elm.name,
                        weight: elm.weight,
                        dimensions: elm.dimension,
                        quantity: elm.quantity
                    }}) || []);
                    setQuantity(response.data.quantity);
                    setMessage(response.data.detail);
                    // setTags(response.data.tags !== null ? response.data.tags.split(",") : []);
                    setTags(response.data.tags !== null ? allProducts.filter((elm: any) => response.data.tags.includes(elm.productName)) : []);
                    setAssignedManager(response.data.assigneeId !== null && response.data.assigneeId !== "" ? response.data.assigneeId : "");
                    setTrackingNumber(response.data.trackingNumber);
                    
                    const closestDeparturePort = findClosestSeaPort(parseLocation(response.data.departure), allPorts);
                    const closestArrivalPort = findClosestSeaPort(parseLocation(response.data.arrival), allPorts);
                    setPortDeparture(closestDeparturePort);
                    setPortDestination(closestArrivalPort);
                    setPorts1(sortByCloseness(parseLocation(response.data.departure), allPorts).slice(0, 15));
                    setPorts2(sortByCloseness(parseLocation(response.data.arrival), allPorts).slice(0, 15));
                    
                    setLoad(false);
                }
                else {
                    setLoad(false);
                }
            }  
        }
    }
    
    const assignManager = async () => {
        if (assignedManager !== null && assignedManager !== undefined && assignedManager !== "") {
            if (context) {
                const response = await (context as BackendService<any>).put(protectedResources.apiLisQuotes.endPoint+"/Assignee/"+id+"/"+assignedManager, []);
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
        if (context) {
            const response = await (context as BackendService<any>).put(protectedResources.apiLisQuotes.endPoint+"/Assignee/unassign/"+id, []);
            if (response !== null) {
                enqueueSnackbar(t('managerRemovedRequest'), { variant: "success", anchorOrigin: { horizontal: "right", vertical: "top"} });
                setAssignedManager("");
            }
            else {
                enqueueSnackbar(t('errorHappened'), { variant: "error", anchorOrigin: { horizontal: "right", vertical: "top"} });
            }
        }
    }
    
    const editRequest = async () => {
        var auxUnits = [];
        if (packingType === "Breakbulk/LCL") {
            auxUnits = packagesSelection;
        }
        else if (packingType === "Unit RoRo") {
            auxUnits = unitsSelection;
        }
        
        if (context) {
            var postcode1 = departure.postalCode !== null && departure.postalCode !== undefined ? departure.postalCode : "";
            var postcode2 = arrival.postalCode !== null && arrival.postalCode !== undefined ? arrival.postalCode : "";

            const body: any = {
                id: Number(id),
                email: email,
                status: status,
                whatsapp: phone,
                departure: departure !== null && departure !== undefined ? [departure.city.toUpperCase(),departure.country,departure.latitude,departure.longitude,postcode1].filter((val: any) => { return val !== "" }).join(', ') : "",
                arrival: arrival !== null && arrival !== undefined ? [arrival.city.toUpperCase(),arrival.country,arrival.latitude,arrival.longitude,postcode2].filter((val: any) => { return val !== "" }).join(', ') : "",
                cargoType: 0,
                packingType: packingType,
                containers: containersSelection.map((elm: any, i: number) => { return { 
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
                quantity: quantity,
                detail: message,
                clientNumber: clientNumber !== null ? String(clientNumber.contactNumber)+", "+clientNumber.contactName : null,
                tags: tags.length !== 0 ? tags.map((elm: any) => elm.productName).join(',') : null,
                assigneeId: Number(assignedManager)
            };

            const data = await (context as BackendService<any>).put(protectedResources.apiLisQuotes.endPoint+"/Request/"+id, body);
            if (data?.status === 200) {
                enqueueSnackbar(t('requestEditedSuccess'), { variant: "success", anchorOrigin: { horizontal: "right", vertical: "top"} });
            }
            else {
                enqueueSnackbar(t('errorHappened'), { variant: "error", anchorOrigin: { horizontal: "right", vertical: "top"} });
            }
        }
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
            .catch((err) => {
                console.log(err);
                return instance.acquireTokenPopup({
                    ...pricingRequest,
                    account: account
                }).then((response) => {
                    return response.accessToken;
                });
            });
            setTempToken(token);
            
            setLoadResults(true);
            // I removed the loadingDate
            var containersFormatted = containersSelected.join("&ContainerTypesId=");
            var urlSent = createGetRequestUrl(protectedResources.apiLisPricing.endPoint+"/Pricing/HaulagesOfferRequest?", haulageType, loadingCity.city.toUpperCase(), containersFormatted);
            const response = await (context as BackendService<any>).getWithToken(urlSent, token);
            setLoadResults(false);
            setHaulages(response);
            // console.log(response);  
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
            .catch((err) => {
                console.log(err);
                return instance.acquireTokenPopup({
                    ...pricingRequest,
                    account: account
                }).then((response) => {
                    return response.accessToken;
                });
            });
            setTempToken(token);
            
            setLoadResults(true);
            var containersFormatted = containersSelected.join("&ContainerTypesId=");
            var urlSent = createGetRequestUrl2(protectedResources.apiLisPricing.endPoint+"/Pricing/SeaFreightsOffersRequest?", portDeparture.portId, portDestination.portId, containersFormatted);
            const response = await (context as BackendService<any>).getWithToken(urlSent, token);
            setLoadResults(false);
            setSeafreights(response);
            // console.log(response);  
        }
    }
    
    const getMiscellaneousPriceOffers = async () => {
        if (context && account) {
            var containersFormatted = containersSelected.join("&ContainerTypesId=");
            var urlSent = createGetRequestUrl2(protectedResources.apiLisPricing.endPoint+"/Pricing/MiscellaneoussOffersRequest?", portDeparture.portId, portDestination.portId, containersFormatted);
            const response = await (context as BackendService<any>).getWithToken(urlSent, tempToken);
            setLoadResults(false);
            setMiscs(response);
            // console.log(response);  
        }
    }
    
    const getClients = async () => {
        if (context && account) {
            const token = await instance.acquireTokenSilent({
                scopes: crmRequest.scopes,
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
            
            const response = await (context as BackendService<any>).getWithToken(protectedResources.apiLisClient.endPoint+"/Contact/GetContacts", token);
            if (response !== null && response !== undefined) {
                console.log(response);
                // Removing duplicates from client array
                setClients(response.filter((obj: any, index: number, self: any) => index === self.findIndex((o: any) => o.contactName === obj.contactName)));
            }  
        }
    }
    
    const getContainers = async () => {
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
            
            const response = await (context as BackendService<any>).getWithToken(protectedResources.apiLisTransport.endPoint+"/Package/Containers", token);
            if (response !== null && response !== undefined) {
                console.log(response);
                setContainers(response);
            }  
        }
    }
    
    const getPorts = async () => {
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
            
            const response = await (context as BackendService<any>).getWithToken(protectedResources.apiLisTransport.endPoint+"/Port/Ports", token);
            if (response !== null && response !== undefined) {
                var addedCoordinatesPorts = addedCoordinatesToPorts(response);
                console.log("Ports", addedCoordinatesPorts);
                setPorts(addedCoordinatesPorts);
                // addCoordinatesToPorts(response);

                // Here i can get the products
                getProducts(addedCoordinatesPorts);
            }  
        }
    }
    
    const getProducts = async (allPorts: any) => {
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
            
            const response = await (context as BackendService<any>).getWithToken(protectedResources.apiLisTransport.endPoint+"/Product/Products", token);
            // console.log(response);
            if (response !== null && response !== undefined) {
                setProducts(response);

                // Here i can load the request information
                loadRequest(allPorts, response);
            }  
        }
    }
    
    const createNewOffer = async () => {
        if (selectedSeafreight !== null) {
            if (context) {
                var haulage = null;
                var miscellaneous = null;
                if (selectedHaulage !== null) {
                    haulage = {
                        "id": selectedHaulage.id,
                        "haulierId": 0,
                        "haulierName": selectedHaulage.haulierName,
                        "currency": selectedHaulage.currency,
                        "loadingCityName": selectedHaulage.loadingPort,
                        "freeTime": selectedHaulage.freeTime,
                        "multiStop": selectedHaulage.multiStop,
                        "overtimeTariff": selectedHaulage.overtimeTariff,
                        "unitTariff": selectedHaulage.unitTariff,
                        "haulageType": haulageType,
                        // "loadingPort": loadingCity.name,
                        "loadingPort": loadingCity.city,
                        "validUntil": selectedHaulage.validUntil,
                        // "loadingPortId": loadingCity.id,
                        "containerNames": [null]
                    }
                }
                if (selectedMisc !== null) {
                    miscellaneous = [
                        {
                            "id": selectedMisc.id,
                            "departurePortId": null,
                            "destinationPortId": null,
                            "departurePortName": null,
                            "destinationPortName": null,
                            "supplierId": 0,
                            "supplierName": selectedMisc.supplierName,
                            "currency": selectedMisc.currency,
                            "price20": selectedMisc.price20,
                            "price40": selectedMisc.price40,
                            "price20dry": selectedMisc.price20dry,
                            "price20rf": selectedMisc.price20rf,
                            "price40dry": selectedMisc.price40dry,
                            "price40hc": selectedMisc.price40hc,
                            "price40hcrf": selectedMisc.price40hcRf,
                            "validUntil": selectedMisc.validUntil,
                        }                      
                    ]
                }
                var dataSent = {
                    "requestQuoteId": Number(id),
                    "comment": rteRef.current?.editor?.getHTML(),
                    // "quoteOfferNumber": transformId(uuidv4()),
                    "quoteOfferVm": 0,
                    "quoteOfferId": 10,
                    "quoteOfferNumber": 10,
                    "createdBy": account?.username,
                    "emailUser": email,
                    "haulage": haulage,
                    "miscellaneousList": miscellaneous,
                    "seaFreight": {
                        "id": selectedSeafreight.seaFreightId,
                        "departurePortId": portDeparture.portId,
                        "destinationPortId": portDestination.portId,
                        "departurePortName": selectedSeafreight.departurePortName,
                        "destinationPortName": portDestination.portName,
                        "carrierId": 0,
                        "carrierName": selectedSeafreight.carrierName,
                        "carrierAgentId": 0,
                        "carrierAgentName": selectedSeafreight.carrierAgentName,
                        "currency": selectedSeafreight.currency,
                        "transitTime": selectedSeafreight.transitTime,
                        "frequency": selectedSeafreight.frequency,
                        "price20dry": selectedSeafreight.price20dry,
                        "price20rf": selectedSeafreight.price20rf,
                        "price40dry": selectedSeafreight.price40dry,
                        "price40hc": selectedSeafreight.price40hc,
                        "price40hcrf": selectedSeafreight.price40hcrf,
                        "validUntil": selectedSeafreight.validUntil,
                    },
                    "containers": containersSelection.map((elm: any) => { return { "containerId": elm.id, quantity: elm.quantity } }),
                    "departureDate": (new Date("01/01/2022")).toISOString(),
                    "departurePortId": portDeparture.portId,
                    "destinationPortId": portDestination.portId,
                    "margin": 0,
                    "reduction": 0,
                    "extraFee": 0,
                    "totalPrice": 0
                };
                const response = await (context as BackendService<any>).postReturnJson(protectedResources.apiLisOffer.endPoint+"/QuoteOffer", dataSent);
                // const response = await axios.post(protectedResources.apiLisOffer.endPoint+"/QuoteOffer", dataSent);
                
                if (response !== null) {
                    enqueueSnackbar(t('offerSuccessSent'), { variant: "success", anchorOrigin: { horizontal: "right", vertical: "top"} });
                    console.log(response);

                    // var footer = `
                    // <div style="font-family: Verdana; padding-top: 60px;">
                    //     <a href="${"http://localhost:3000/acceptOffer/"+response.data.requestQuoteId}" style="display:inline-block;background-color:#008089;color:#fff;padding:10px 20px;text-decoration:none" target="_blank">Accept the offer</a>
                    //     <a href="${"http://localhost:3000/refuseOffer/"+response.data.requestQuoteId}" style="display:inline-block;background-color:#F2F2F2;color:#008089;padding:10px 20px;text-decoration:none" target="_blank">Refuse the offer</a>
                    //     <div style="margin-top: 15px;"><a target="_blank" href="www.omnifreight.eu">www.omnifreight.eu</a></div>
                    //     <div style="padding-bottom: 10px;"><a target="_blank" href="http://www.facebook.com/omnifreight">http://www.facebook.com/omnifreight</a></div>
                    //     <div>Italiëlei 211</div>
                    //     <div>2000 Antwerpen</div>
                    //     <div>Belgium</div>
                    //     <div>E-mail: transport@omnifreight.eu</div>
                    //     <div>Tel +32.3.295.38.82</div>
                    //     <div>Fax +32.3.295.38.77</div>
                    //     <div>Whatsapp +32.494.40.24.25</div>
                    //     <img src="http://www.omnifreight.eu/Images/omnifreight_logo.jpg" style="max-width: 200px;">
                    // </div>
                    // `;
                    // postEmail("pricing@omnifreight.eu", email, "Nouvelle offre de devis", rteRef.current?.editor?.getHTML()+footer);
                }
                else {
                    enqueueSnackbar(t('errorHappened'), { variant: "error", anchorOrigin: { horizontal: "right", vertical: "top"} });
                }
            }
        }
        else {
            enqueueSnackbar(t('contentEmpty'), { variant: "error", anchorOrigin: { horizontal: "right", vertical: "top"} });
        }
    }
    
    function getClosestDeparture(value: any) {
        if (value !== null && value !== undefined) {
            const closest = findClosestSeaPort(value, ports);
            setPortDeparture(closest);
            setLoadingCity(value);
            setPorts1(sortByCloseness(value, ports).slice(0, 15));
        }
    }

    function getClosestArrival(value: any) {
        if (value !== null && value !== undefined) {
            const closest = findClosestSeaPort(value, ports);
            setPortDestination(closest);
            setPorts2(sortByCloseness(value, ports).slice(0, 15));
        }
    }

    // const postEmail = async(from: string, to: string, subject: string, htmlContent: string) => {
    //     const form = new FormData();
    //     form.append('From', from);
    //     form.append('To', to);
    //     form.append('Subject', subject);
    //     form.append('HtmlContent', htmlContent);
    //     if (fileValue !== undefined) {
    //         for (var i=0; i < fileValue.length; i++) {
    //             form.append('Attachments', fileValue[i]);
    //         }
    //     }

    //     fetch('https://lisquotes-svc.azurewebsites.net/api/Email', {
    //         method: 'POST',
    //         headers: {
    //             'accept': '*/*',
    //             // 'Content-Type': 'multipart/form-data'
    //         },
    //         body: form
    //     })
    //     .then((response) => response.json())
    //     .then((response: any) => {
    //         if (response !== undefined && response !== null && response.code == 200) {
    //             enqueueSnackbar(t('messageSuccessSent'), { variant: "success", anchorOrigin: { horizontal: "right", vertical: "top"} });
    //         }
    //         else {
    //             enqueueSnackbar(t('errorHappened'), { variant: "error", anchorOrigin: { horizontal: "right", vertical: "top"} });
    //         }
    //     });
    // }

    return (
        <div style={{ background: "#fff", borderTopLeftRadius: 20, borderTopRightRadius: 20 }}>
            <SnackbarProvider />
            <Box py={2.5}>
                <Typography variant="h5" sx={{mt: {xs: 4, md: 1.5, lg: 1.5 }}} mx={5}><b>{t('manageRequestQuote')} {id}</b></Typography>
                    <Box>
                        {
                            !load ? 
                            <Grid container spacing={2} mt={1} px={5}>
                                <Grid item xs={12}>
                                    <Typography variant="body2" color="dodgerblue" sx={{ fontWeight: "bold" }}>
                                        {t('quoteNumber')} N° {trackingNumber}
                                    </Typography>
                                </Grid>
                                <Grid item xs={12}>
                                    <Alert 
                                        severity="info" 
                                        sx={{ display: { xs: "block", md: "flex" }, alignItems: "center", justifyContent: "left" }}
                                        action={<Button variant="contained" color="inherit" sx={{ background: "#fff", color: "#333", float: "right", textTransform: "none", position: "relative", bottom: "2px" }} onClick={() => { setModal(true); }}>{t('askMoreInformation')}</Button>}
                                    >
                                        <Typography variant="subtitle1" display="inline">{t('doYouThinkInformation')}</Typography>
                                    </Alert>
                                </Grid>
                                <Grid item xs={12} md={6}>
                                    <InputLabel htmlFor="whatsapp-phone-number" sx={inputLabelStyles}>{t('whatsappNumber')}</InputLabel>
                                    <MuiTelInput id="whatsapp-phone-number" value={phone} onChange={setPhone} defaultCountry="CM" preferredCountries={["CM", "BE", "KE"]} fullWidth sx={{ mt: 1 }} />
                                </Grid>
                                <Grid item xs={12} md={6}>
                                    <InputLabel htmlFor="request-email" sx={inputLabelStyles}>{t('emailAddress')}</InputLabel>
                                    <BootstrapInput id="request-email" type="email" value={email} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)} fullWidth disabled />
                                </Grid>
                                <Grid item xs={12} md={6} mt={1}>
                                    <InputLabel htmlFor="departure" sx={inputLabelStyles}>{t('departure')}</InputLabel>
                                    <AutocompleteSearch id="departure" value={departure} onChange={setDeparture} callBack={getClosestDeparture} fullWidth />
                                </Grid>
                                <Grid item xs={12} md={6} mt={1}>
                                    <InputLabel htmlFor="arrival" sx={inputLabelStyles}>{t('arrival')}</InputLabel>
                                    <AutocompleteSearch id="arrival" value={arrival} onChange={setArrival} callBack={getClosestArrival} fullWidth />
                                </Grid>
                                <Grid item xs={12} md={2} mt={1}>
                                    <InputLabel htmlFor="packing-type" sx={inputLabelStyles}>{t('packingType')}</InputLabel>
                                    <NativeSelect
                                        id="packing-type"
                                        value={packingType}
                                        onChange={handleChangePackingType}
                                        input={<BootstrapInput />}
                                        fullWidth
                                    >
                                        <option value="FCL">{t('fcl')}</option>
                                        <option value="Breakbulk/LCL">{t('breakbulk')}</option>
                                        <option value="Unit RoRo">{t('roro')}</option>
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
                                                    setContainersSelection((prevItems: any) => [...prevItems, { container: containerType, quantity: quantity, id: containers.find((item: any) => item.packageName === containerType).packageId }]);
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
                                    <Grid item xs={12}>
                                        {
                                            containersSelection !== undefined && containersSelection !== null && containersSelection.length !== 0 && containers !== null ? 
                                                <Grid container spacing={2}>
                                                    {
                                                        containersSelection.map((item: any, index: number) => (
                                                            <Grid key={"listitem1-"+index} item xs={12} md={4}>
                                                                <ListItem
                                                                    sx={{ border: "1px solid #e5e5e5" }}
                                                                    secondaryAction={
                                                                        <IconButton edge="end" onClick={() => {
                                                                            setContainersSelection((prevItems: any) => prevItems.filter((item: any, i: number) => i !== index));
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
                                                </Grid>
                                            : null  
                                        }
                                    </Grid>
                                    </> : null
                                }
                                {
                                    packingType === "Breakbulk/LCL" ?
                                    <>
                                    <Grid item xs={12} md={3} mt={1}>
                                        <InputLabel htmlFor="package-name" sx={inputLabelStyles}>{t('packageName')}</InputLabel>
                                        <NativeSelect
                                            id="package-name"
                                            value={packageName}
                                            onChange={(e: any) => { setPackageName(e.target.value) }}
                                            input={<BootstrapInput />}
                                            fullWidth
                                        >
                                            <option key={"option1-x"} value="">{t('notDefined')}</option>
                                            {packingOptions.map((elm: any, i: number) => (
                                                <option key={"elm11-"+i} value={elm}>{elm}</option>
                                            ))}
                                        </NativeSelect>
                                    </Grid>
                                    <Grid item xs={12} md={1} mt={1}>
                                        <InputLabel htmlFor="package-quantity" sx={inputLabelStyles}>{t('quantity')}</InputLabel>
                                        <BootstrapInput id="package-quantity" type="number" inputProps={{ min: 1, max: 100 }} value={packageQuantity} onChange={(e: any) => {setPackageQuantity(e.target.value)}} fullWidth />
                                    </Grid>
                                    <Grid item xs={12} md={1} mt={1}>
                                        <InputLabel htmlFor="package-length" sx={inputLabelStyles}>{t('length')}(cm)</InputLabel>
                                        <BootstrapInput id="package-length" type="number" value={packageLength} onChange={(e: any) => {setPackageLength(e.target.value)}} fullWidth />
                                    </Grid>
                                    <Grid item xs={12} md={1} mt={1}>
                                        <InputLabel htmlFor="package-width" sx={inputLabelStyles}>{t('width')}(cm)</InputLabel>
                                        <BootstrapInput id="package-width" type="number" value={packageWidth} onChange={(e: any) => {setPackageWidth(e.target.value)}} fullWidth />
                                    </Grid>
                                    <Grid item xs={12} md={1} mt={1}>
                                        <InputLabel htmlFor="package-height" sx={inputLabelStyles}>{t('height')}(cm)</InputLabel>
                                        <BootstrapInput id="package-height" type="number" value={packageHeight} onChange={(e: any) => {setPackageHeight(e.target.value)}} fullWidth />
                                    </Grid>
                                    <Grid item xs={12} md={2} mt={1}>
                                        <InputLabel htmlFor="package-weight" sx={inputLabelStyles}>{t('weight')} (Kg)</InputLabel>
                                        <BootstrapInput id="package-weight" type="number" inputProps={{ min: 0, max: 100 }} value={packageWeight} onChange={(e: any) => {setPackageWeight(e.target.value)}} fullWidth />
                                    </Grid>
                                    <Grid item xs={12} md={1} mt={1}>
                                        <Button
                                            variant="contained" color="inherit" fullWidth sx={whiteButtonStyles} 
                                            style={{ marginTop: "30px", height: "42px", float: "right" }} 
                                            onClick={() => {
                                                if (packageName !== "" && packageQuantity > 0 && packageWeight > 0) {
                                                    setPackagesSelection((prevItems: any) => [...prevItems, { 
                                                        name: packageName, quantity: packageQuantity, dimensions: packageLength+"x"+packageWidth+"x"+packageHeight, weight: packageWeight, volume: packageLength*packageWidth*packageHeight
                                                    }]);
                                                    setPackageName(""); setPackageQuantity(1); setPackageLength(0); setPackageWidth(0); setPackageHeight(0); setPackageWeight(0);
                                                } 
                                                else {
                                                    enqueueSnackbar(t('fieldNeedTobeFilled'), { variant: "error", anchorOrigin: { horizontal: "right", vertical: "top"} });
                                                }
                                            }} 
                                        >
                                            {t('add')}
                                        </Button>
                                    </Grid>
                                    <Grid item xs={12}>
                                    {
                                            packagesSelection !== undefined && packagesSelection !== null && packagesSelection.length !== 0 ? 
                                                <Grid container spacing={2}>
                                                    {
                                                        packagesSelection.map((item: any, index: number) => (
                                                            <Grid key={"packageitem1-"+index} item xs={12} md={6}>
                                                                <ListItem
                                                                    sx={{ border: "1px solid #e5e5e5" }}
                                                                    secondaryAction={
                                                                        <IconButton edge="end" onClick={() => {
                                                                            setPackagesSelection((prevItems: any) => prevItems.filter((item: any, i: number) => i !== index));
                                                                        }}>
                                                                            <DeleteIcon />
                                                                        </IconButton>
                                                                    }
                                                                >
                                                                    <ListItemText primary={
                                                                        t('name')+" : "+item.name+" | "+t('quantity')+" : "+item.quantity+" | "+t('dimensions')+" : "+item.dimensions+" | Cubage ("+item.volume+" \u33A5) | "+t('weight')+" : "+item.weight+" Kg"
                                                                    } />
                                                                </ListItem>
                                                            </Grid>
                                                        ))
                                                    }
                                                </Grid>
                                            : null  
                                        }
                                    </Grid>
                                    </> : null
                                }
                                {
                                    packingType === "Unit RoRo" ?
                                    <>
                                    <Grid item xs={12} md={3} mt={1}>
                                        <InputLabel htmlFor="unit-name" sx={inputLabelStyles}>{t('unitName')}</InputLabel>
                                        <NativeSelect
                                            id="unit-name"
                                            value={unitName}
                                            onChange={(e: any) => { setUnitName(e.target.value) }}
                                            input={<BootstrapInput />}
                                            fullWidth
                                        >
                                            <option key={"option2-x"} value="">{t('notDefined')}</option>
                                            {packingOptions.map((elm: any, i: number) => (
                                                <option key={"elm22-"+i} value={elm}>{elm}</option>
                                            ))}
                                        </NativeSelect>
                                    </Grid>
                                    <Grid item xs={12} md={1} mt={1}>
                                        <InputLabel htmlFor="unit-quantity" sx={inputLabelStyles}>{t('quantity')}</InputLabel>
                                        <BootstrapInput id="unit-quantity" type="number" inputProps={{ min: 1, max: 100 }} value={unitQuantity} onChange={(e: any) => {setUnitQuantity(e.target.value)}} fullWidth />
                                    </Grid>
                                    <Grid item xs={12} md={1} mt={1}>
                                        <InputLabel htmlFor="unit-length" sx={inputLabelStyles}>{t('length')}(cm)</InputLabel>
                                        <BootstrapInput id="unit-length" type="number" value={unitLength} onChange={(e: any) => {setUnitLength(e.target.value)}} fullWidth />
                                    </Grid>
                                    <Grid item xs={12} md={1} mt={1}>
                                        <InputLabel htmlFor="unit-width" sx={inputLabelStyles}>{t('width')}(cm)</InputLabel>
                                        <BootstrapInput id="unit-width" type="number" value={unitWidth} onChange={(e: any) => {setUnitWidth(e.target.value)}} fullWidth />
                                    </Grid>
                                    <Grid item xs={12} md={1} mt={1}>
                                        <InputLabel htmlFor="unit-height" sx={inputLabelStyles}>{t('height')}(cm)</InputLabel>
                                        <BootstrapInput id="unit-height" type="number" value={unitHeight} onChange={(e: any) => {setUnitHeight(e.target.value)}} fullWidth />
                                    </Grid>
                                    <Grid item xs={12} md={2} mt={1}>
                                        <InputLabel htmlFor="unit-weight" sx={inputLabelStyles}>{t('weight')} (Kg)</InputLabel>
                                        <BootstrapInput id="unit-weight" type="number" inputProps={{ min: 0, max: 100 }} value={unitWeight} onChange={(e: any) => {setUnitWeight(e.target.value)}} fullWidth />
                                    </Grid>
                                    <Grid item xs={12} md={1} mt={1}>
                                        <Button
                                            variant="contained" color="inherit" fullWidth sx={whiteButtonStyles} 
                                            style={{ marginTop: "30px", height: "42px", float: "right" }} 
                                            onClick={() => {
                                                if (unitName !== "" && unitQuantity > 0 && unitWeight > 0) {
                                                    setUnitsSelection((prevItems: any) => [...prevItems, { 
                                                        name: unitName, quantity: unitQuantity, dimensions: unitLength+"x"+unitWidth+"x"+unitHeight, weight: unitWeight, volume: unitLength*unitWidth*unitHeight
                                                    }]);
                                                    setUnitName(""); setUnitQuantity(1); setUnitLength(0); setUnitWidth(0); setUnitHeight(0); setUnitWeight(0);
                                                } 
                                                else {
                                                    enqueueSnackbar(t('fieldNeedTobeFilled'), { variant: "error", anchorOrigin: { horizontal: "right", vertical: "top"} });
                                                }
                                            }} 
                                        >
                                            {t('add')}
                                        </Button>
                                    </Grid>
                                    <Grid item xs={12}>
                                        {
                                            unitsSelection !== undefined && unitsSelection !== null && unitsSelection.length !== 0 ? 
                                                <Grid container spacing={2}>
                                                    {
                                                        unitsSelection.map((item: any, index: number) => (
                                                            <Grid key={"unititem1-"+index} item xs={12} md={6}>
                                                                <ListItem
                                                                    sx={{ border: "1px solid #e5e5e5" }}
                                                                    secondaryAction={
                                                                        <IconButton edge="end" onClick={() => {
                                                                            setUnitsSelection((prevItems: any) => prevItems.filter((item: any, i: number) => i !== index));
                                                                        }}>
                                                                            <DeleteIcon />
                                                                        </IconButton>
                                                                    }
                                                                >
                                                                    <ListItemText primary={
                                                                        t('name')+" : "+item.name+" | "+t('quantity')+" : "+item.quantity+" | "+t('dimensions')+" : "+item.dimensions+" | Cubage ("+item.volume+" \u33A5) | "+t('weight')+" : "+item.weight+" Kg"
                                                                    } />
                                                                </ListItem>
                                                            </Grid>
                                                        ))
                                                    }
                                                </Grid>
                                            : null  
                                        }
                                    </Grid>
                                    </> : null
                                }

                                <Grid item xs={12} md={6} mt={1}>
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
                                                    return option.productName !== undefined ? option.productName : option;
                                                }
                                                return ""; 
                                            }}
                                            value={tags}
                                            sx={{ mt: 1 }}
                                            renderInput={(params: any) => <TextField {...params} sx={{ textTransform: "lowercase" }} />}
                                            onChange={(e: any, value: any) => { setTags(value); }}
                                            fullWidth
                                        /> : <Skeleton />
                                    }
                                </Grid>
                                <Grid item xs={12} md={6} mt={1}>
                                    <InputLabel htmlFor="client-number" sx={inputLabelStyles}>{t('clientNumber')}</InputLabel>
                                    <ClientSearch id="client-number" value={clientNumber} onChange={setClientNumber} fullWidth />
                                </Grid>
                                
                                <Grid item xs={12} md={6} mt={.5} sx={{ display: { xs: 'none', md: 'block' } }}>
                                    <InputLabel htmlFor="request-message" sx={inputLabelStyles}>{t('details')}</InputLabel>
                                    <BootstrapInput id="request-message" type="text" multiline rows={3.5} value={message} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setMessage(e.target.value)} fullWidth />
                                </Grid>
                                <Grid item xs={12} md={6} mt={1}>
                                    <InputLabel htmlFor="assigned-manager" sx={inputLabelStyles}>{t('assignedManager')}</InputLabel>
                                    {
                                        !loadAssignees ? 
                                        <>
                                            <NativeSelect
                                                id="assigned-manager"
                                                value={assignedManager}
                                                onChange={handleChangeAssignedManager}
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
                                            <Button variant="contained" color="inherit" sx={whiteButtonStyles} style={{ marginRight: "10px" }} onClick={assignManager} >{t('updateManager')}</Button>
                                            <Button variant="contained" color="inherit" sx={whiteButtonStyles} onClick={removeManager} >{t('removeManager')}</Button>
                                        </> : <Skeleton sx={{ mt: 3 }} />   
                                    }
                                </Grid>
                                
                                <Grid item xs={12}>
                                    <Accordion sx={{ backgroundColor: "#fbfbfb" }}>
                                        <AccordionSummary
                                            expandIcon={<ExpandMoreIcon />}
                                            aria-controls="panel1a-content"
                                            id="panel1a-header"
                                        >
                                            <Typography variant="h6" sx={{ mx: 0 }}><b>{t('generatePriceOffer')}</b></Typography>
                                        </AccordionSummary>
                                        <AccordionDetails>
                                            <Box sx={{ px: 0 }}>
                                                <Stepper activeStep={activeStep} sx={{ px: 1 }}>
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
                                                {activeStep === steps.length ? (
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
                                                            activeStep === 0 ?
                                                            <Grid container spacing={2} mt={1} px={2}>
                                                                <Grid item xs={12} md={6} mt={1}>
                                                                    <InputLabel htmlFor="loading-city" sx={inputLabelStyles}>{t('departure')} / {t('loadingCity')}</InputLabel>
                                                                    <AutocompleteSearch id="loading-city" value={loadingCity} onChange={setLoadingCity} fullWidth />
                                                                </Grid>
                                                                <Grid item xs={12} md={6} mt={1}>
                                                                    <InputLabel htmlFor="haulage-type" sx={inputLabelStyles}>{t('haulageType')}</InputLabel>
                                                                    <NativeSelect
                                                                        id="haulage-type"
                                                                        value={haulageType}
                                                                        onChange={handleChangeHaulageType}
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
                                                            </Grid> : null
                                                        }
                                                        {
                                                            activeStep === 1 ?
                                                            <Grid container spacing={2} mt={1} px={2}>
                                                                <Grid item xs={12}>
                                                                    {
                                                                        !loadResults ? 
                                                                        haulages !== null && haulages.length !== 0 ?
                                                                            <Box sx={{ overflow: "auto", width: { xs: "98.5%" } }}>
                                                                                <Grid container>
                                                                                    <Grid item xs={8}>
                                                                                        <Typography variant="h5" sx={{ my: 2, fontSize: 19, fontWeight: "bold" }}>
                                                                                            {t('listHaulagesPricingOffers')+t('fromDotted')+loadingCity.city}
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
                                                                                            onClick={getHaulagePriceOffers}
                                                                                        >
                                                                                            {t('reload')} <RestartAltIcon fontSize='small' />
                                                                                        </Button>
                                                                                        <Button 
                                                                                            variant="contained" 
                                                                                            color="inherit" 
                                                                                            sx={{ 
                                                                                                textTransform: "none", backgroundColor: "#fff", 
                                                                                                color: "#333", float: "right", marginTop: "8px" 
                                                                                            }}
                                                                                            onClick={() => setModal5(true)}
                                                                                        >
                                                                                            {t('requestHaulagePrice')}
                                                                                        </Button>
                                                                                    </Grid>
                                                                                </Grid>
                                                                                
                                                                                <DataGrid
                                                                                    rows={haulages}
                                                                                    columns={columnsHaulages}
                                                                                    hideFooter
                                                                                    getRowId={(row: any) => row?.id}
                                                                                    getRowHeight={() => "auto" }
                                                                                    sx={gridStyles}
                                                                                    onRowSelectionModelChange={(newRowSelectionModel) => {
                                                                                        setRowSelectionModel2(newRowSelectionModel);
                                                                                        setSelectedHaulage(newRowSelectionModel.length !== 0 ? haulages.find((elm: any) => elm.id === newRowSelectionModel[0]) : null);
                                                                                    }}
                                                                                    rowSelectionModel={rowSelectionModel2}
                                                                                    // onRowClick={handleRowHaulagesClick}
                                                                                />
                                                                            </Box> :
                                                                            <Box>
                                                                                <Grid container>
                                                                                    <Grid item xs={8}>
                                                                                        <Typography variant="h5" sx={{ my: 2, fontSize: 19, fontWeight: "bold" }}>
                                                                                            {t('listHaulagesPricingOffers')+t('fromDotted')+loadingCity.city}
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
                                                                                            onClick={getHaulagePriceOffers}
                                                                                        >
                                                                                            {t('reload')} <RestartAltIcon fontSize='small' />
                                                                                        </Button>
                                                                                        <Button 
                                                                                            variant="contained" 
                                                                                            color="inherit" 
                                                                                            sx={{ 
                                                                                                textTransform: "none", backgroundColor: "#fff", 
                                                                                                color: "#333", float: "right", marginTop: "8px" 
                                                                                            }}
                                                                                            onClick={() => setModal5(true)}
                                                                                        >
                                                                                            {t('requestHaulagePrice')}
                                                                                        </Button>
                                                                                    </Grid>
                                                                                </Grid>
                                                                                <Alert severity="error">{t('noResults')}</Alert>
                                                                            </Box> 
                                                                        : <Skeleton />
                                                                    }
                                                                </Grid>
                                                            </Grid> : null
                                                        }
                                                        {
                                                            activeStep === 2 ? 
                                                            <Grid container spacing={2} mt={1} px={2}>
                                                                <Grid item xs={12} md={6} mt={1}>
                                                                    <InputLabel htmlFor="port-departure" sx={inputLabelStyles}>{t('departurePort')}</InputLabel>
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
                                                                            value={portDeparture}
                                                                            disabled={true}
                                                                            sx={{ mt: 1 }}
                                                                            renderInput={(params: any) => <TextField {...params} />}
                                                                            onChange={(e: any, value: any) => { setPortDeparture(value); }}
                                                                            fullWidth
                                                                        /> : <Skeleton />
                                                                    }
                                                                </Grid>
                                                                <Grid item xs={12} md={6} mt={1}>
                                                                    <InputLabel htmlFor="destination-port" sx={inputLabelStyles}>{t('arrivalPort')}</InputLabel>
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
                                                                            value={portDestination}
                                                                            sx={{ mt: 1 }}
                                                                            renderInput={(params: any) => <TextField {...params} />}
                                                                            onChange={(e: any, value: any) => { setPortDestination(value); }}
                                                                            fullWidth
                                                                        /> : <Skeleton />
                                                                    }
                                                                </Grid>
                                                            </Grid>
                                                            : null
                                                        }
                                                        {
                                                            activeStep === 3 ? 
                                                            <Grid container spacing={2} mt={1} px={2}>
                                                                <Grid item xs={12}>
                                                                    <Alert severity="info" sx={{ mb: 2 }}>{t('selectOfferMessage')}</Alert>
                                                                    {
                                                                        !loadResults ? 
                                                                        seafreights !== null && seafreights.length !== 0 ?
                                                                        <Box sx={{ overflow: "auto", width: { xs: "98.5%" } }}>
                                                                            <Grid container>
                                                                                <Grid item xs={8}>
                                                                                    <Typography variant="h5" sx={{ my: 2, fontSize: 19, fontWeight: "bold" }}>
                                                                                        {t('listSeaFreightsPricingOffers')+t('fromDotted')+portDeparture.portName+"-"+portDestination.portName}
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
                                                                                        onClick={getSeaFreightPriceOffers}
                                                                                    >
                                                                                        {t('reload')} <RestartAltIcon fontSize='small' />
                                                                                    </Button>
                                                                                    <Button 
                                                                                        variant="contained" 
                                                                                        color="inherit" 
                                                                                        sx={{ 
                                                                                            textTransform: "none", backgroundColor: "#fff", 
                                                                                            color: "#333", float: "right", marginTop: "8px"
                                                                                        }}
                                                                                        onClick={() => setModal6(true)}
                                                                                    >
                                                                                        {t('requestSeafreightPrice')}
                                                                                    </Button>
                                                                                </Grid>
                                                                            </Grid>
                                                                            <DataGrid
                                                                                rows={seafreights}
                                                                                columns={columnsSeafreights}
                                                                                hideFooter
                                                                                getRowId={(row: any) => row?.seaFreightId}
                                                                                getRowHeight={() => "auto" }
                                                                                sx={gridStyles}
                                                                                onRowSelectionModelChange={(newRowSelectionModel) => {
                                                                                    setRowSelectionModel(newRowSelectionModel);
                                                                                    setSelectedSeafreight(newRowSelectionModel.length !== 0 ? seafreights.find((elm: any) => elm.seaFreightId === newRowSelectionModel[0]) : null);
                                                                                }}
                                                                                rowSelectionModel={rowSelectionModel}
                                                                                // onRowClick={handleRowSeafreightsClick}
                                                                            />
                                                                        </Box> : 
                                                                        <Box>
                                                                            <Grid container>
                                                                                <Grid item xs={8}>
                                                                                    <Typography variant="h5" sx={{ my: 2, fontSize: 19, fontWeight: "bold" }}>
                                                                                        {t('listSeaFreightsPricingOffers')+t('fromDotted')+portDeparture.portName+"-"+portDestination.portName}
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
                                                                                        onClick={getSeaFreightPriceOffers}
                                                                                    >
                                                                                        {t('reload')} <RestartAltIcon fontSize='small' />
                                                                                    </Button>
                                                                                    <Button 
                                                                                        variant="contained" 
                                                                                        color="inherit" 
                                                                                        sx={{ 
                                                                                            textTransform: "none", backgroundColor: "#fff", 
                                                                                            color: "#333", float: "right", marginTop: "8px"
                                                                                        }}
                                                                                        onClick={() => setModal6(true)}
                                                                                    >
                                                                                        {t('requestSeafreightPrice')}
                                                                                    </Button>
                                                                                </Grid>
                                                                            </Grid>
                                                                            <Alert severity="error">{t('noResults')}</Alert>
                                                                        </Box>
                                                                        : <Skeleton />
                                                                    }
                                                                </Grid>
                                                            </Grid>
                                                            : null
                                                        }
                                                        {
                                                            activeStep === 4 ? 
                                                            <Grid container spacing={2} mt={1} px={2}>
                                                                <Grid item xs={12}>
                                                                    {
                                                                        !loadResults ? 
                                                                        miscs !== null && miscs.length !== 0 ?
                                                                            <Box sx={{ overflow: "auto", width: { xs: "98.5%" } }}>
                                                                                <Typography variant="h5" sx={{ my: 2, fontSize: 19, fontWeight: "bold" }}>{t('listMiscPricingOffers')+t('fromDotted')+portDeparture.portName+"-"+portDestination.portName}</Typography>
                                                                                <DataGrid
                                                                                    rows={miscs}
                                                                                    columns={columnsMiscs}
                                                                                    hideFooter
                                                                                    getRowId={(row: any) => row?.id}
                                                                                    getRowHeight={() => "auto" }
                                                                                    sx={gridStyles}
                                                                                    onRowSelectionModelChange={(newRowSelectionModel) => {
                                                                                        setRowSelectionModel3(newRowSelectionModel);
                                                                                        setSelectedMisc(newRowSelectionModel.length !== 0 ? miscs.find((elm: any) => elm.id === newRowSelectionModel[0]) : null);
                                                                                    }}
                                                                                    rowSelectionModel={rowSelectionModel3}
                                                                                    // onRowClick={handleRowMiscsClick}
                                                                                />
                                                                            </Box> : <Alert severity="error">{t('noResults')}</Alert>
                                                                        : <Skeleton />
                                                                    }
                                                                </Grid>
                                                            </Grid>
                                                            : null
                                                        }
                                                        {
                                                            activeStep === 5 ?
                                                            <Grid container spacing={2} mt={1} px={2}>
                                                                <Grid item xs={12}>
                                                                    <Typography variant="h5" sx={{ my: 2, fontSize: 19, fontWeight: "bold" }}>{t('selectedSeafreight')}</Typography>
                                                                    <Box sx={{ overflow: "auto", width: { xs: "98.5%" } }}>
                                                                        <DataGrid
                                                                            rows={[selectedSeafreight]}
                                                                            columns={columnsSeafreights}
                                                                            hideFooter
                                                                            getRowId={(row: any) => row?.seaFreightId}
                                                                            getRowHeight={() => "auto" }
                                                                            sx={gridStyles}
                                                                            isRowSelectable={(params: any) => false}
                                                                        />
                                                                    </Box>
                                                                </Grid>
                                                                {
                                                                    selectedHaulage !== null ? 
                                                                    <Grid item xs={12}>
                                                                        <Typography variant="h5" sx={{ my: 2, fontSize: 19, fontWeight: "bold" }}>{t('selectedHaulage')}</Typography>
                                                                        <Box sx={{ overflow: "auto", width: { xs: "98.5%" } }}>
                                                                            <DataGrid
                                                                                rows={[selectedHaulage]}
                                                                                columns={columnsHaulages}
                                                                                hideFooter
                                                                                getRowId={(row: any) => row?.id}
                                                                                getRowHeight={() => "auto" }
                                                                                sx={gridStyles}
                                                                                isRowSelectable={(params: any) => false}
                                                                            />
                                                                        </Box>
                                                                    </Grid> : null
                                                                }
                                                                {
                                                                    selectedMisc !== null ? 
                                                                    <Grid item xs={12}>
                                                                        <Typography variant="h5" sx={{ my: 2, fontSize: 19, fontWeight: "bold" }}>{t('selectedMisc')}</Typography>
                                                                        <Box sx={{ overflow: "auto", width: { xs: "98.5%" } }}>
                                                                            <DataGrid
                                                                                rows={[selectedMisc]}
                                                                                columns={columnsMiscs}
                                                                                hideFooter
                                                                                getRowId={(row: any) => row?.id}
                                                                                getRowHeight={() => "auto" }
                                                                                sx={gridStyles}
                                                                                isRowSelectable={(params: any) => false}
                                                                            />
                                                                        </Box>
                                                                    </Grid> : null
                                                                }
                                                                <Grid item xs={4}>
                                                                    <InputLabel htmlFor="mailLanguage" sx={inputLabelStyles}>{t('mailLanguage')}</InputLabel>
                                                                    <ToggleButtonGroup
                                                                        color="primary"
                                                                        value={mailLanguage}
                                                                        exclusive
                                                                        size="small"
                                                                        onChange={(event: React.MouseEvent<HTMLElement>, newValue: string,) => { 
                                                                            setMailLanguage(newValue); 
                                                                            if (newValue === "fr") {
                                                                                rteRef.current?.editor?.commands.setContent(
                                                                                `<div>
                                                                                <p>Bonjour ${clientNumber !== null && clientNumber.contactName !== undefined ? clientNumber.contactName : "{clientName}"},</p>
                                                                                <p>Nous vous remercions pour votre demande.</p>
                                                                                <p>En notre qualité de commissionnaire expéditeur nous pouvons organiser votre expédition de ${displayContainers(containersSelection)} conteneur(s) chargé(s) avec des ${tags.map((elm: any) => elm.productName).join(',')}, sur camion depuis ${loadingCity.city} à rendu port de ${selectedSeafreight.destinationPortName} comme suit :</p>
                                                                                ${containersSelection !== null ? containersSelection.map((elm: any) => "<p>"+calculateContainerPrice(elm.container, elm.quantity)+" "+selectedSeafreight.currency+" / "+elm.container+"</p>").join('') : ""}
                                                                                <p>Chargement de ${selectedHaulage.freeTime} heures inclus pour chaque conteneur, ensuite de ${selectedHaulage.overtimeTariff} ${selectedHaulage.currency} par heure indivisible.</p>
                                                                                ${selectedMisc !== null ? selectedMisc.services.map((elm: any) => "<p>- "+elm.service.serviceName+" inclus</p>").join('') : "<br>"}
                                                                                <p>Départs tous les ${selectedSeafreight.frequency} jours.</p>
                                                                                <p>Délai de mer +/- ${selectedSeafreight.transitTime} jours.</p>
                                                                                <p>Tarif valable ce jour. Tarifs à confirmer lors de votre réservation.</p>
                                                                                <p>Ci-joint vous trouverez nos conditions de commande et de facturation qui, ensemble avec nos conditions générales, sont appliqués.</p>
                                                                                <p>Cordialement</p>
                                                                                <p>Jeffry COOLS</p>
                                                                                </div>`);
                                                                            }
                                                                            else {
                                                                                rteRef.current?.editor?.commands.setContent(
                                                                                `<div>
                                                                                <p>Hello ${clientNumber !== null && clientNumber.contactName !== undefined ? clientNumber.contactName : "{clientName}"},</p>
                                                                                <p>We thank you for your request.</p>
                                                                                <p>As a freight forwarder we can organize your shipment of ${displayContainers(containersSelection)} containers loaded with ${tags.map((elm: any) => elm.productName).join(',')}, on truck from ${loadingCity.city} up to arrival at ${selectedSeafreight.destinationPortName} with the following costs :</p>
                                                                                ${containersSelection !== null ? containersSelection.map((elm: any) => "<p>"+calculateContainerPrice(elm.container, elm.quantity)+" "+selectedSeafreight.currency+" / "+elm.container+"</p>").join('') : ""}
                                                                                <p>${selectedHaulage.freeTime} hours loading included for each container, after which ${selectedHaulage.overtimeTariff} ${selectedHaulage.currency} per hour is charged.</p>
                                                                                ${selectedMisc !== null ? selectedMisc.services.map((elm: any) => "<p>- "+elm.service.serviceName+" included</p>").join('') : "<br>"}
                                                                                <p>Departures every ${selectedSeafreight.frequency} days.</p>
                                                                                <p>Sailing time ${selectedSeafreight.departurePortName} to ${selectedSeafreight.destinationPortName} approx. ${selectedSeafreight.transitTime} days.</p>
                                                                                <p>This offer remains valid today, to be confirmed at the time of your booking..</p>
                                                                                <p>We also send per attached pdf our order confirmation and invoice terms & conditions.</p>
                                                                                <p>Best regards,</p>
                                                                                <p>Jeffry COOLS</p>
                                                                                </div>`);
                                                                            }
                                                                        }}
                                                                        aria-label="Platform"
                                                                        fullWidth
                                                                        sx={{ mt: 1 }}
                                                                    >
                                                                        <ToggleButton value="fr"><img src="/assets/img/flags/flag-fr.png" style={{ width: "12px", marginRight: "6px" }} alt="flag english" /> Français</ToggleButton>
                                                                        <ToggleButton value="en"><img src="/assets/img/flags/flag-en.png" style={{ width: "12px", marginRight: "6px" }} alt="flag english" /> English</ToggleButton>
                                                                    </ToggleButtonGroup>
                                                                </Grid>
                                                                <Grid item xs={12}>
                                                                    <InputLabel htmlFor="details" sx={inputLabelStyles}>{t('detailsOffer')}</InputLabel>
                                                                    {
                                                                        selectedSeafreight !== null && selectedHaulage !== null ? 
                                                                        <Box sx={{ mt: 2 }}>
                                                                            <RichTextEditor
                                                                                ref={rteRef}
                                                                                extensions={[StarterKit]}
                                                                                content={
                                                                                    `<div>
                                                                                    <p>Bonjour ${clientNumber !== null && clientNumber.contactName !== undefined ? clientNumber.contactName : "{clientName}"},</p>
                                                                                    <p>Nous vous remercions pour votre demande.</p>
                                                                                    <p>En notre qualité de commissionnaire expéditeur nous pouvons organiser votre expédition de ${displayContainers(containersSelection)} conteneur(s) chargé(s) avec des ${tags.map((elm: any) => elm.productName).join(',')}, sur camion depuis ${loadingCity.city} à rendu port de ${selectedSeafreight.destinationPortName} comme suit :</p>
                                                                                    ${containersSelection !== null ? containersSelection.map((elm: any) => "<p>"+calculateContainerPrice(elm.container, elm.quantity)+" "+selectedSeafreight.currency+" / "+elm.container+"</p>").join('') : ""}
                                                                                    <p>Chargement de ${selectedHaulage.freeTime} heures inclus pour chaque conteneur, ensuite de ${selectedHaulage.overtimeTariff} ${selectedHaulage.currency} par heure indivisible.</p>
                                                                                    ${selectedMisc !== null ? selectedMisc.services.map((elm: any) => "<p>- "+elm.service.serviceName+" inclus</p>").join('') : "<br>"}
                                                                                    <p>Départs tous les ${selectedSeafreight.frequency} jours.</p>
                                                                                    <p>Délai de mer +/- ${selectedSeafreight.transitTime} jours.</p>
                                                                                    <p>Tarif valable ce jour. Tarifs à confirmer lors de votre réservation.</p>
                                                                                    <p>Ci-joint vous trouverez nos conditions de commande et de facturation qui, ensemble avec nos conditions générales, sont appliqués.</p>
                                                                                    <p>Cordialement</p>
                                                                                    <p>Jeffry COOLS</p>
                                                                                    </div>`
                                                                                }
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
                                                                        </Box>   
                                                                        : null
                                                                    }
                                                                </Grid>
                                                            </Grid>
                                                            : null
                                                        }

                                                        <Box sx={{ display: 'flex', flexDirection: 'row', pt: 2, px: 2 }}>
                                                            <Button
                                                                variant="contained" 
                                                                color="inherit" 
                                                                sx={whiteButtonStyles}
                                                                disabled={activeStep === 0}
                                                                onClick={handleBack}
                                                            >
                                                                {t('back')}
                                                            </Button>
                                                            <Box sx={{ flex: '1 1 auto' }} />
                                                            {isStepOptional(activeStep) && (
                                                            <Button variant="contained" color="inherit" sx={whiteButtonStyles} onClick={handleSkip} style={{ marginRight: "10px" }}>
                                                                {t('skip')}
                                                            </Button>
                                                            )}
                                                            <Button variant="contained" color="inherit" sx={whiteButtonStyles} onClick={handleNext}>
                                                                {activeStep === steps.length - 1 ? t('sendOfferValidation') : t('nextStep')}
                                                            </Button>
                                                        </Box>
                                                    </React.Fragment>
                                                )}
                                            </Box>
                                        </AccordionDetails>
                                    </Accordion>
                                </Grid>
                                <Grid item xs={12}>
                                    <Button variant="contained" color="primary" sx={{ mt: 2, mr: 2, textTransform: "none" }} onClick={editRequest} >{t('editRequest')}</Button>
                                    <Button variant="contained" color="inherit" sx={whiteButtonStyles} onClick={() => { setModal2(true); }} >{t('changeStatus')}</Button>
                                    <Button variant="contained" color="inherit" sx={whiteButtonStyles} style={{ float: "right" }} onClick={() => { setModal3(true); }} >{t('addCommentNote')}</Button>
                                    <Button variant="contained" color="inherit" sx={whiteButtonStyles} style={{ float: "right", marginRight: "10px" }} onClick={() => { setModal4(true); /*getNotes(id);*/ }} >{t('listNotes')}</Button>
                                </Grid>
                        </Grid> : <Skeleton sx={{ mx: 5, mt: 3 }} />
                    }
                </Box>
            </Box>
            
            {/* Ask for information */}
            <BootstrapDialog
                onClose={() => setModal(false)}
                aria-labelledby="custom-dialog-title"
                open={modal}
                maxWidth="md"
                fullWidth
            >
                <RequestAskInformation id={id} userId={null} email={email} closeModal={() => setModal(false)} />
            </BootstrapDialog>
            
            {/* Change request status */}
            <BootstrapDialog
                onClose={() => setModal2(false)}
                aria-labelledby="custom-dialog-title2"
                open={modal2}
                maxWidth="md"
                fullWidth
            >
                <RequestChangeStatus id={id} closeModal={() => setModal2(false)} />
            </BootstrapDialog>
            
            {/* Add a comment/note */}
            <BootstrapDialog
                onClose={() => setModal3(false)}
                aria-labelledby="custom-dialog-title3"
                open={modal3}
                maxWidth="md"
                fullWidth
            >
                <RequestAddNote id={id} userId={null} closeModal={() => setModal3(false)} />
            </BootstrapDialog>

            {/* List of notes */}
            <BootstrapDialog
                onClose={() => setModal4(false)}
                aria-labelledby="custom-dialog-title4"
                open={modal4}
                maxWidth="lg"
                fullWidth
            >
                <RequestListNotes id={id} closeModal={() => setModal4(false)} />
            </BootstrapDialog>

            {/* Price request haulage  */}
            <BootstrapDialog
                onClose={() => setModal5(false)}
                aria-labelledby="custom-dialog-title5"
                open={modal5}
                maxWidth="lg"
                fullWidth
            >
                <RequestPriceHaulage
                    token={tempToken} 
                    companies={clients}
                    ports={ports}
                    loadingCity={loadingCity}
                    loadingPort={portDeparture}
                    closeModal={() => setModal5(false)}
                />
            </BootstrapDialog>

            {/* Price request seafreight FCL */}
            <BootstrapDialog
                onClose={() => setModal6(false)}
                aria-labelledby="custom-dialog-title5"
                open={modal6}
                maxWidth="lg"
                fullWidth
            >
                <RequestPriceRequest 
                    token={tempToken} 
                    products={products} 
                    commodities={tags}
                    companies={clients}
                    ports={ports}
                    portLoading={portDeparture}
                    portDischarge={portDestination} 
                    containers={containers} 
                    containersSelection={containersSelection}
                    closeModal={() => setModal6(false)} 
                />
            </BootstrapDialog>
        </div>
    );
}

export default Request;
