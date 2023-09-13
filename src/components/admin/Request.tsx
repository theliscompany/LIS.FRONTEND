import { Alert, Autocomplete, Box, Button, Chip, DialogActions, DialogContent, FormControl, FormControlLabel, FormLabel, Grid, IconButton, InputLabel, ListItem, ListItemText, NativeSelect, Paper, Radio, RadioGroup, Skeleton, Step, StepLabel, Stepper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField, Typography } from '@mui/material';
import { MuiTelInput } from 'mui-tel-input';
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import '../../App.css';
import AutocompleteSearch from '../shared/AutocompleteSearch';
import { inputLabelStyles, BootstrapInput, BootstrapDialogTitle, BootstrapDialog, buttonCloseStyles, DarkTooltip, whiteButtonStyles, datetimeStyles, gridStyles } from '../../misc/styles';
import { enqueueSnackbar, SnackbarProvider } from 'notistack';
import DeleteIcon from '@mui/icons-material/Delete';
import { pricingRequest, protectedResources, transportRequest } from '../../authConfig';
import { useAuthorizedBackendApi } from '../../api/api';
import { BackendService } from '../../services/fetch';
import { MuiChipsInputChip } from 'mui-chips-input';
import { DateTimePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { Dayjs } from 'dayjs';
import { useAccount, useMsal } from '@azure/msal-react';
import { AuthenticationResult } from '@azure/msal-browser';
import { useTranslation } from 'react-i18next';
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

// @ts-ignore
import { JSON as seaPorts } from 'sea-ports';
// @ts-ignore

import { DataGrid, GridColDef, GridEventListener, GridRenderCellParams, GridValueFormatterParams, GridValueGetterParams, GridRowSelectionModel } from '@mui/x-data-grid';
import ClientSearch from '../shared/ClientSearch';

//let statusTypes = ["EnAttente", "Valider", "Rejeter"];
// let cargoTypes = ["Container", "Conventional", "RollOnRollOff"];
// let packingTypes = ["LCL", "Airfreight", "Cars", "Trucks", "Not containerised"];

function createGetRequestUrl(url: string, variable1: string|undefined, variable2: string, variable3: string) {
    if (variable1) {
        url += 'PlannedDeparture=' + encodeURIComponent(variable1) + '&';
    }
    if (variable2) {
        url += 'HaulageType=' + encodeURIComponent(variable2) + '&';
    }
    if (variable3) {
        url += 'LoadingCity=' + encodeURIComponent(variable3) + '&';
    }
    
    if (url.slice(-1) === '&') {
        url = url.slice(0, -1);
    }
    return url;
}

function createGetRequestUrl2(url: string, variable1: string, variable2: string, variable3: string|undefined, variable4: string) {
    if (variable1) {
        url += 'DeparturePortId=' + encodeURIComponent(variable1) + '&';
    }
    if (variable2) {
        url += 'DestinationPortId=' + encodeURIComponent(variable2) + '&';
    }
    if (variable3) {
        url += 'PlannedDeparture=' + encodeURIComponent(variable3) + '&';
    }
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
    
    const locationObject = {
        city: city,
        country: country,
        latitude: latitude,
        longitude: longitude
    };
    
    return locationObject;
}

function removeAccents(input: string) {
    return input.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

function calculateDistance(coord1: any, coord2: any) {
    const [lat1, lon1] = coord1;
    const [lon2, lat2] = coord2;
    const R = 6371; // Radius of the Earth in km
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;
    return distance;
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

function findClosestSeaPort(myPort: any, seaPorts: any) {
    const myCoordinates = [myPort.latitude, myPort.longitude];
    let closestPort = null;
    let minDistance = Infinity;
    
    if (seaPorts !== null && seaPorts !== undefined) {
        const matchingNamePort = seaPorts.find((seaPort: any) => seaPort.portName.toUpperCase() === removeAccents(myPort.city).toUpperCase());
        if (matchingNamePort) {
            return matchingNamePort;
        }
    }

    for (const seaPort of seaPorts) {
        const seaPortCoordinates = seaPort.coordinates;
        if (seaPortCoordinates !== undefined) {
            const distance = calculateDistance(myCoordinates, seaPortCoordinates);
            
            if (distance < minDistance) {
                minDistance = distance;
                closestPort = seaPort;
            }
        }
    }

    return closestPort;
}

function Request() {
    const [load, setLoad] = useState<boolean>(true);
    const [loadAssignees, setLoadAssignees] = useState<boolean>(true);
    const [loadNotes, setLoadNotes] = useState<boolean>(true);
    const [loadResults, setLoadResults] = useState<boolean>(false);
    const [email, setEmail] = useState<string>("");
    const [status, setStatus] = useState<string | null>(null);
    const [trackingNumber, setTrackingNumber] = useState<string>("");
    const [phone, setPhone] = useState<string>("");
    const [message, setMessage] = useState<string>("");
    // const [cargoType, setCargoType] = useState<string>("0");
    // const [cargoProducts, setCargoProducts] = useState<any>([]);
    const [packingType, setPackingType] = useState<string>("FCL");
    const [clientNumber, setClientNumber] = useState<any>(null);
    // const [departureTown, setDepartureTown] = useState<any>(null);
    // const [arrivalTown, setArrivalTown] = useState<any>(null);
    const [departure, setDeparture] = useState<any>(null);
    const [arrival, setArrival] = useState<any>(null);
    const [tags, setTags] = useState<MuiChipsInputChip[]>([]);
    const [modal, setModal] = useState<boolean>(false);
    const [modal2, setModal2] = useState<boolean>(false);
    const [modal3, setModal3] = useState<boolean>(false);
    const [modal4, setModal4] = useState<boolean>(false);
    const [modal5, setModal5] = useState<boolean>(false);
    const [mailSubject, setMailSubject] = useState<string>("");
    const [mailContent, setMailContent] = useState<string>("");
    const [statusMessage, setStatusMessage] = useState<string>("");
    const [generalNote, setGeneralNote] = useState<string>("");
    const [selectedStatus, setSelectedStatus] = React.useState('EnAttente');
    const [assignedManager, setAssignedManager] = useState<string>("");
    const [assignees, setAssignees] = useState<any>(null);
    const [notes, setNotes] = useState<any>(null);
    const [idUser, setIdUser] = useState<any>(null);

    const [containerType, setContainerType] = useState<string>("20' Dry");
    const [quantity, setQuantity] = useState<number>(1);
    const [containersSelection, setContainersSelection] = useState<any>([]);
    
    const [unitName, setUnitName] = useState<string>("");
    const [unitDimensions, setUnitDimensions] = useState<string>("");
    const [unitWeight, setUnitWeight] = useState<number>(0);
    const [unitQuantity, setUnitQuantity] = useState<number>(1);
    const [unitsSelection, setUnitsSelection] = useState<any>([]);

    const [packageName, setPackageName] = useState<string>("");
    const [packageDimensions, setPackageDimensions] = useState<string>("");
    const [packageWeight, setPackageWeight] = useState<number>(0);
    const [packageQuantity, setPackageQuantity] = useState<number>(1);
    const [packagesSelection, setPackagesSelection] = useState<any>([]);
    
    const [departureDate, setDepartureDate] = useState<Dayjs | null>(null);
    const [containersSelected, setContainersSelected] = useState<string[]>([]);
    const [portDestination, setPortDestination] = useState<any>(null);
    const [portDeparture, setPortDeparture] = useState<any>(null);
    const [loadingDate, setLoadingDate] = useState<Dayjs | null>(null);
    const [loadingCity, setLoadingCity] = useState<any>(null);
    const [haulageType, setHaulageType] = useState<string>("");
    const [products, setProducts] = useState<any>(null);
    const [cities, setCities] = useState<any>(null);
    const [ports, setPorts] = useState<any>(null);
    const [ports1, setPorts1] = useState<any>(null);
    const [ports2, setPorts2] = useState<any>(null);
    const [containers, setContainers] = useState<any>(null);
    const [miscs, setMiscs] = useState<any>(null);
    const [haulages, setHaulages] = useState<any>(null);
    const [seafreights, setSeafreights] = useState<any>(null);
    const [selectedHaulage, setSelectedHaulage] = useState<any>(null);
    const [selectedSeafreight, setSelectedSeafreight] = useState<any>(null);
    const [selectedMisc, setSelectedMisc] = useState<any>(null);
    
    const [margin, setMargin] = useState<number>(22);
    const [reduction, setReduction] = useState<number>(0);
    const [adding, setAdding] = useState<number>(0);
    const [details, setDetails] = useState<string>("");
    const [totalPrice, setTotalPrice] = useState<number>(0);

    const [allSeaPorts, setAllSeaPorts] = useState<any>();
    
    const [rowSelectionModel, setRowSelectionModel] = React.useState<GridRowSelectionModel>([]);
    const [rowSelectionModel2, setRowSelectionModel2] = React.useState<GridRowSelectionModel>([]);
    const [rowSelectionModel3, setRowSelectionModel3] = React.useState<GridRowSelectionModel>([]);
    
    let { id } = useParams();

    const { instance, accounts } = useMsal();
    const account = useAccount(accounts[0] || {});
        
    const context = useAuthorizedBackendApi();

    const { t } = useTranslation();
    
    // const steps = [t('searchOffers'), t('listOffers'), t('sendOffer')];
    const steps = [t('searchSeafreight'), t('selectSeafreight'), t('searchHaulage'), t('selectHaulage'), t('selectMisc'), t('sendOffer')];
    const haulageTypes = [t('haulageType1'), t('haulageType2'), t('haulageType3'), t('haulageType4'), t('haulageType5')];
    const statusTypes = [
        { type: "EnAttente", value: "En attente", description: t('descriptionEnAttente') }, 
        { type: "Valider", value: "Validé", description: t('descriptionValider') }, 
        { type: "Rejeter", value: "Rejeté", description: t('descriptionRejeter') }, 
        { type: "EnCoursDeTraitement", value: "En cours de traitement", description: t('descriptionEnCoursDeTraitement') }, 
        { type: "EnTransit", value: "En transit", description: t('descriptionEnTransit') }, 
        { type: "EnDouane", value: "En douane", description: t('descriptionEnDouane') }, 
        { type: "LivraisonEnCours", value: "Livraison en cours", description: t('descriptionLivraisonEnCours') }, 
        { type: "Livre", value: "Livré", description: t('descriptionLivre') }, 
        { type: "Annule", value: "Annulé", description: t('descriptionAnnule') }, 
        { type: "Retour", value: "Retourné", description: t('descriptionRetour') }, 
        { type: "Problème", value: "Problème", description: t('descriptionProbleme') }, 
        { type: "EnAttenteDeFacturation", value: "En attente de facturation", description: t('descriptionEnAttenteDeFacturation') } 
    ];

    const columnsSeafreights: GridColDef[] = [
        { field: 'carrierName', headerName: t('carrier'), width: 150 },
        { field: 'carrierAgentName', headerName: t('carrierAgent'), width: 200 },
        { field: 'departurePortName', headerName: t('departurePort'), width: 150 },
        { field: 'frequency', headerName: t('frequency'), valueFormatter: (params: GridValueFormatterParams) => `${t('every')} ${params.value || ''} `+t('days'), width: 125 },
        { field: 'transitTime', headerName: t('transitTime'), valueFormatter: (params: GridValueFormatterParams) => `${params.value || ''} `+t('days') },
        { field: 'currency', headerName: t('prices'), renderCell: (params: GridRenderCellParams) => {
            return (
                <Box sx={{ my: 1, mr: 1 }}>
                    <Box sx={{ my: 1 }} hidden={!getPackageNamesByIds(containersSelected, containers).includes("20' Dry")}>{params.row.price20dry !== 0 ? "20' Dry : "+params.row.price20dry+" "+params.row.currency : "20' Dry : N/A"}</Box>
                    <Box sx={{ my: 1 }} hidden={!getPackageNamesByIds(containersSelected, containers).includes("20' Rf")}>{params.row.price20rf !== 0 ? "20' Rf : "+params.row.price20rf+" "+params.row.currency : "20' Rf : N/A"}</Box>
                    <Box sx={{ my: 1 }} hidden={!getPackageNamesByIds(containersSelected, containers).includes("40' Dry")}>{params.row.price40dry !== 0 ? "40' Dry : "+params.row.price40dry+" "+params.row.currency : "40' Dry : N/A"}</Box>
                    <Box sx={{ my: 1 }} hidden={!getPackageNamesByIds(containersSelected, containers).includes("40' Hc")}>{params.row.price40hc !== 0 ? "40' Hc : "+params.row.price40hc+" "+params.row.currency : "40' Hc : N/A"}</Box>
                    <Box sx={{ my: 1 }} hidden={!getPackageNamesByIds(containersSelected, containers).includes("40' HcRf")}>{params.row.price40hcrf !== 0 ? "40' HcRf : "+params.row.price40hcrf+" "+params.row.currency : "40' HcRf : N/A"}</Box>
                </Box>
            );
        }, width: 200 },
    ];
    
    const columnsHaulages: GridColDef[] = [
        { field: 'haulierName', headerName: t('haulier'), width: 150 },
        { field: 'loadingPort', headerName: t('loadingPort'), renderCell: (params: GridRenderCellParams) => {
            return (
                <Box sx={{ my: 2 }}>{params.row.loadingPort}</Box>
            );
        }, width: 200 },
        { field: 'unitTariff', headerName: t('unitTariff'), valueGetter: (params: GridValueGetterParams) => `${params.row.unitTariff || ''} ${params.row.currency}` },
        { field: 'freeTime', headerName: t('freeTime'), valueFormatter: (params: GridValueFormatterParams) => `${params.value || ''} ${t('hours')}`, width: 100 },
        { field: 'overtimeTariff', headerName: t('overtimeTariff'), valueGetter: (params: GridValueGetterParams) => `${params.row.overtimeTariff || ''} ${params.row.currency} / ${t('hour')}`, width: 150 },
        { field: 'multiStop', headerName: t('multiStop'), valueGetter: (params: GridValueGetterParams) => `${params.row.multiStop || ''} ${params.row.currency}` },
        { field: 'validUntil', headerName: t('validUntil'), valueFormatter: (params: GridValueFormatterParams) => `${(new Date(params.value)).toLocaleDateString().slice(0,10) || ''}`, width: 150 },
    ];
    
    const columnsMiscs: GridColDef[] = [
        { field: 'supplierName', headerName: t('supplier'), width: 150 },
        { field: 'departurePortName', headerName: t('departurePort'), width: 200, valueFormatter: (params: GridValueFormatterParams) => `${portDeparture.portName || ''}`, },
        { field: 'destinationPortName', headerName: t('destinationPort'), width: 300, valueFormatter: (params: GridValueFormatterParams) => `${portDestination.portName || ''}`, },
        { field: 'currency', headerName: t('prices'), renderCell: (params: GridRenderCellParams) => {
            return (
                <Box sx={{ my: 1, mr: 1 }}>
                    <Box sx={{ my: 1 }} hidden={params.row.price20dry === 0 || !getPackageNamesByIds(containersSelected, containers).includes("20' Dry")}>{params.row.price20dry !== 0 ? "20' Dry : "+params.row.price20dry+" "+params.row.currency : "20' Dry : N/A"}</Box>
                    <Box sx={{ my: 1 }} hidden={params.row.price20rf === 0 || !getPackageNamesByIds(containersSelected, containers).includes("20' Rf")}>{params.row.price20rf !== 0 ? "20' Rf : "+params.row.price20rf+" "+params.row.currency : "20' Rf : N/A"}</Box>
                    <Box sx={{ my: 1 }} hidden={params.row.price40dry === 0 || !getPackageNamesByIds(containersSelected, containers).includes("40' Dry")}>{params.row.price40dry !== 0 ? "40' Dry : "+params.row.price40dry+" "+params.row.currency : "40' Dry : N/A"}</Box>
                    <Box sx={{ my: 1 }} hidden={params.row.price40hc === 0 || !getPackageNamesByIds(containersSelected, containers).includes("40' Hc")}>{params.row.price40hc !== 0 ? "40' Hc : "+params.row.price40hc+" "+params.row.currency : "40' Hc : N/A"}</Box>
                    <Box sx={{ my: 1 }} hidden={params.row.price40hcrf === 0 || !getPackageNamesByIds(containersSelected, containers).includes("40' HcRf")}>{params.row.price40hcrf !== 0 ? "40' HcRf : "+params.row.price40hcrf+" "+params.row.currency : "40' HcRf : N/A"}</Box>
                </Box>
            );
        }, width: 200 },
    ];
    
    const handleChangeHaulageType = (event: { target: { value: string } }) => {
        setHaulageType(event.target.value);
    };
    
    const handleChangePackingType = (event: { target: { value: string } }) => {
        console.log(event.target.value);
        setPackingType(event.target.value);
    };
    
    const handleChangeAssignedManager = (event: { target: { value: string } }) => {
        setAssignedManager(event.target.value);
    };
    
    const handleChangeStatus = (event: React.ChangeEvent<HTMLInputElement>) => {
        setSelectedStatus((event.target as HTMLInputElement).value);
    };

    // Stepper functions
    const [activeStep, setActiveStep] = React.useState(0);
    const [skipped, setSkipped] = React.useState(new Set<number>());

    const isStepOptional = (step: number) => {
        return step === 2 || step === 3 || step === 4;
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
                // console.log(containersSelection);
                setContainersSelected(containersSelection.map((elm: any) => elm.id));
                if (selectedSeafreight === null) {
                    setLoadResults(true);
                    getSeaFreightPriceOffers();
                }
                setActiveStep((prevActiveStep) => prevActiveStep + 1);
                setSkipped(newSkipped);
            }
            else {
                enqueueSnackbar("The fields departure date, containers and destination port cannot be empty, fill them.", { variant: "warning", anchorOrigin: { horizontal: "right", vertical: "top"} });
            }
        }
        if (activeStep === 1) {
            if (selectedSeafreight !== null) {
                // Here we calculate the total price of the offer
                var seafreightPrices = 0;
                if (selectedSeafreight.price20dry !== 0 && getPackageNamesByIds(containersSelected, containers).includes("20' Dry")) {
                    seafreightPrices += selectedSeafreight.price20dry*containersSelection.find((elm: any) => elm.id === 8).quantity;
                }
                if (selectedSeafreight.price20rf !== 0 && getPackageNamesByIds(containersSelected, containers).includes("20' Rf")) {
                    seafreightPrices += selectedSeafreight.price20rf*containersSelection.find((elm: any) => elm.id === 13).quantity;
                }
                if (selectedSeafreight.price40dry !== 0 && getPackageNamesByIds(containersSelected, containers).includes("40' Dry")) {
                    seafreightPrices += selectedSeafreight.price40dry*containersSelection.find((elm: any) => elm.id === 9).quantity;
                }
                if (selectedSeafreight.price40hc !== 0 && getPackageNamesByIds(containersSelected, containers).includes("40' Hc")) {
                    seafreightPrices += selectedSeafreight.price40hc*containersSelection.find((elm: any) => elm.id === 10).quantity;
                }
                if (selectedSeafreight.price40hcrf !== 0 && getPackageNamesByIds(containersSelected, containers).includes("40' HcRf")) {
                    seafreightPrices += selectedSeafreight.price40hcrf*containersSelection.find((elm: any) => elm.id === 15).quantity;
                }
                
                setTotalPrice(seafreightPrices);
                setActiveStep((prevActiveStep) => prevActiveStep + 1);
                setSkipped(newSkipped);
            }
            else {
                enqueueSnackbar("You need to select a sea freight before going to the next step.", { variant: "warning", anchorOrigin: { horizontal: "right", vertical: "top"} });
            }
        }
        if (activeStep === 2) {
            if (selectedHaulage === null) {
                if (loadingCity !== null && haulageType !== "") {
                    setLoadResults(true);
                    getHaulagePriceOffers();
                    setActiveStep((prevActiveStep) => prevActiveStep + 1);
                }
                else {
                    enqueueSnackbar("You need to fill the fields loading city and haulage type.", { variant: "warning", anchorOrigin: { horizontal: "right", vertical: "top"} });
                }
            }
            
            setSkipped(newSkipped);
        }
        if (activeStep === 3) {
            if (selectedMisc === null) {
                setLoadResults(true);
                getMiscellaneousPriceOffers();
            }
            
            var seafreightPrices = 0;
            if (selectedHaulage !== null) {
                seafreightPrices = seafreightPrices + selectedHaulage.unitTariff*containersSelection.reduce((total: any, obj: any) => total + Number(obj.quantity), 0);
            }    
            setTotalPrice(totalPrice+seafreightPrices);
            setActiveStep((prevActiveStep) => prevActiveStep + 1);
            setSkipped(newSkipped);
        }
        if (activeStep === 4) {
            var seafreightPrices = 0;
            if (selectedMisc !== null) {
                if (selectedMisc.price20dry !== 0 && getPackageNamesByIds(containersSelected, containers).includes("20' Dry")) {
                    seafreightPrices += selectedMisc.price20dry*containersSelection.find((elm: any) => elm.id === 8).quantity;
                }
                if (selectedMisc.price20rf !== 0 && getPackageNamesByIds(containersSelected, containers).includes("20' Rf")) {
                    seafreightPrices += selectedMisc.price20rf*containersSelection.find((elm: any) => elm.id === 13).quantity;
                }
                if (selectedMisc.price40dry !== 0 && getPackageNamesByIds(containersSelected, containers).includes("40' Dry")) {
                    seafreightPrices += selectedMisc.price40dry*containersSelection.find((elm: any) => elm.id === 9).quantity;
                }
                if (selectedMisc.price40hc !== 0 && getPackageNamesByIds(containersSelected, containers).includes("40' Hc")) {
                    seafreightPrices += selectedMisc.price40hc*containersSelection.find((elm: any) => elm.id === 10).quantity;
                }
                if (selectedMisc.price40hcrf !== 0 && getPackageNamesByIds(containersSelected, containers).includes("40' HcRf")) {
                    seafreightPrices += selectedMisc.price40hcrf*containersSelection.find((elm: any) => elm.id === 15).quantity;
                }
                setTotalPrice(totalPrice+seafreightPrices);
            }
            else {
                setTotalPrice(totalPrice+seafreightPrices);
            }
            setActiveStep((prevActiveStep) => prevActiveStep + 1);
            setSkipped(newSkipped);
        }
        if (activeStep === 5) {
            createNewOffer();
        }
    };

    const handleBack = () => {
        if (activeStep === 1) {
            setSelectedSeafreight(null);
        }
        if (activeStep === 3) {
            setSelectedHaulage(null);
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
    
    const handleRowHaulagesClick: GridEventListener<'rowClick'> = (params: any) => {
        setSelectedHaulage(params.row);
    };
    
    const handleRowSeafreightsClick: GridEventListener<'rowClick'> = (params: any) => {
        setSelectedSeafreight(params.row);
    };
    
    const handleRowMiscsClick: GridEventListener<'rowClick'> = (params: any) => {
        setSelectedMisc(params.row);
    };

    
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
        setAllSeaPorts(auxArray);
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
        // Here i initialize the sea ports
        initializeSeaPorts();

        getContainers();
        getCities();
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
                    setClientNumber(response.data.clientNumber !== null && response.data.clientNumber !== "" ? { contactId: Number(response.data.clientNumber) } : "");
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
                    setAssignedManager(response.data.assigneeId || "");
                    setTrackingNumber(response.data.trackingNumber);
                    
                    const closestDeparturePort = findClosestSeaPort(parseLocation(response.data.departure), allPorts);
                    const closestArrivalPort = findClosestSeaPort(parseLocation(response.data.arrival), allPorts);
                    setPortDeparture(closestDeparturePort);
                    setPortDestination(closestArrivalPort);
                    setPorts1(sortByCloseness(parseLocation(response.data.departure), allPorts).slice(0, 10));
                    setPorts2(sortByCloseness(parseLocation(response.data.arrival), allPorts).slice(0, 10));
                    
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
        
        if(context) {
            const body: any = {
                id: Number(id),
                email: email,
                status: status,
                whatsapp: phone,
                departure: departure !== null && departure !== undefined ? departure.city.toUpperCase()+', '+departure.country+', '+departure.latitude+', '+departure.longitude : "",
                arrival: arrival !== null && arrival !== undefined ? arrival.city.toUpperCase()+', '+arrival.country+', '+arrival.latitude+', '+arrival.longitude : "",
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
                clientNumber: clientNumber !== null ? String(clientNumber.contactId) : null,
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

    const changeStatusRequest = async () => {
        if(context) {
            const body: any = {
                newStatus: selectedStatus,
                customMessage: statusMessage
            };

            const data = await (context as BackendService<any>).put(protectedResources.apiLisQuotes.endPoint+"/Request/"+id+"/changeStatus", body);
            if (data?.status === 200) {
                setModal2(false);
                enqueueSnackbar(t('requestStatusUpdated'), { variant: "success", anchorOrigin: { horizontal: "right", vertical: "top"} });
            }
            else {
                enqueueSnackbar(t('errorHappened'), { variant: "error", anchorOrigin: { horizontal: "right", vertical: "top"} });
            }
        }
    }

    const askInformations = async () => {
        if (mailContent !== "") {
            if (context) {
                var dataSent = { "content": mailContent, "requestQuoteId": id, "subject": mailSubject, "noteType": "InformationRequest", email: email, "idUser": idUser };
                const response = await (context as BackendService<any>).post(protectedResources.apiLisQuotes.endPoint+"/RequestQuoteNotes", dataSent);
                if (response !== null) {
                    setModal(false);
                    enqueueSnackbar(t('messageSuccessSent'), { variant: "success", anchorOrigin: { horizontal: "right", vertical: "top"} });
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

    const addRequestNote = async () => {
        if (generalNote !== "") {
            if (context) {
                var dataSent = { "content": generalNote, "requestQuoteId": id, "noteType": "General", "idUser": idUser };
                const response = await (context as BackendService<any>).post(protectedResources.apiLisQuotes.endPoint+"/RequestQuoteNotes", dataSent);
                if (response !== null) {
                    setModal3(false);
                    enqueueSnackbar(t('commentSuccessAdded'), { variant: "success", anchorOrigin: { horizontal: "right", vertical: "top"} });
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

    const getNotes = async (idRequest: string|undefined) => {
        if (context) {
            setLoadNotes(true);
            const response = await (context as BackendService<any>).getSingle(protectedResources.apiLisQuotes.endPoint+"/RequestQuoteNotes?requestQuoteId="+idRequest);
            if (response !== null && response.code !== undefined) {
                if (response.code === 200) {
                    // console.log(response.data);
                    setNotes(response.data);
                    setLoadNotes(false);
                }
                else {
                    setLoadNotes(false);
                }
            }
        }
    }
    
    const deleteNote = async (idNote: string) => {
        if (context) {
            const response = await (context as any).delete(protectedResources.apiLisQuotes.endPoint+"/RequestQuoteNotes/"+idNote);
            if (response !== null && response.code !== undefined) {
                if (response.code === 200) {
                    enqueueSnackbar("The note has been deleted with success.", { variant: "success", anchorOrigin: { horizontal: "right", vertical: "top"} });
                    getNotes(id);
                }
                else {
                    enqueueSnackbar("An error happened during this operation.", { variant: "error", anchorOrigin: { horizontal: "right", vertical: "top"} });
                }
            }  
        }
    }

    const getPriceRequests = async () => {
        if (containersSelection.map((elm: any) => elm.container).length !== 0 && portDestination !== null) {
            // alert(containersSelected);
            // console.log(containers.map((elm: any) => elm.packageName));
            setLoadResults(true);
            getSeaFreightPriceOffers();
            getMiscellaneousPriceOffers();
            if (loadingCity !== null && haulageType !== "") {
                getHaulagePriceOffers();
            }
        }
        else {
            enqueueSnackbar(t('priceFieldsEmpty'), { variant: "warning", anchorOrigin: { horizontal: "right", vertical: "top"} });
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
            
            // I removed the loadingDate
            var urlSent = createGetRequestUrl(protectedResources.apiLisPricing.endPoint+"/Pricing/HaulagesOfferRequest?", (new Date("01/01/2022"))?.toISOString(), haulageType, loadingCity.city.toUpperCase());
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
            
            // console.log(containersSelected);
            var containersFormatted = containersSelected.join("&ContainerTypesId=");
            // console.log(containersFormatted);
            
            var urlSent = createGetRequestUrl2(protectedResources.apiLisPricing.endPoint+"/Pricing/SeaFreightsOffersRequest?", portDeparture.portId, portDestination.portId, departureDate?.toISOString(), containersFormatted);
            const response = await (context as BackendService<any>).getWithToken(urlSent, token);
            setLoadResults(false);
            setSeafreights(response);
            // console.log(response);  
        }
    }
    
    const getMiscellaneousPriceOffers = async () => {
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
            
            var containersFormatted = containersSelected.join("&ContainerTypesId=");
            
            var urlSent = createGetRequestUrl2(protectedResources.apiLisPricing.endPoint+"/Pricing/MiscellaneoussOffersRequest?", portDeparture.portId, portDestination.portId, departureDate?.toISOString(), containersFormatted);
            const response = await (context as BackendService<any>).getWithToken(urlSent, token);
            setLoadResults(false);
            setMiscs(response);
            // console.log(response);  
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
    
    const getCities = async () => {
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
            
            const response = await (context as BackendService<any>).getWithToken(protectedResources.apiLisTransport.endPoint+"/City/Cities", token);
            // console.log(response);
            if (response !== null && response !== undefined) {
                setCities(response);
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
                            "price20Dry": selectedMisc.price20dry,
                            "price20Rf": selectedMisc.price20rf,
                            "price40Dry": selectedMisc.price40dry,
                            "price40Hc": selectedMisc.price40hc,
                            "price40HcRf": selectedMisc.price40hcRf
                        }                      
                    ]
                }
                var dataSent = {
                    "requestQuoteId": Number(id),
                    "comment": details,
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
                        "price20Dry": selectedSeafreight.price20dry,
                        "price20Rf": selectedSeafreight.price20rf,
                        "price40Dry": selectedSeafreight.price40dry,
                        "price40Hc": selectedSeafreight.price40hc,
                        "price40HcRf": selectedSeafreight.price40hcrf
                    },
                    "containers": containersSelection.map((elm: any) => { return { "containerId": elm.id, quantity: elm.quantity } }),
                    "departureDate": departureDate || (new Date("01/01/2022")).toISOString(),
                    "departurePortId": portDeparture.portId,
                    "destinationPortId": portDestination.portId,
                    // "haulageType": haulageType,
                    // "plannedLoadingDate": "2023-07-14T08:18:24.720Z",
                    // "loadingCityId": 0,
                    "margin": margin,
                    "reduction": reduction,
                    "extraFee": adding,
                    "totalPrice": totalPrice
                };
                const response = await (context as BackendService<any>).postBasic(protectedResources.apiLisOffer.endPoint+"/QuoteOffer", dataSent);
                // const response = await axios.post(protectedResources.apiLisOffer.endPoint+"/QuoteOffer", dataSent);
                
                if (response !== null) {
                    setModal5(false);
                    enqueueSnackbar(t('offerSuccessSent'), { variant: "success", anchorOrigin: { horizontal: "right", vertical: "top"} });
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
            setPorts1(sortByCloseness(value, ports).slice(0, 10));
        }
    }

    function getClosestArrival(value: any) {
        if (value !== null && value !== undefined) {
            const closest = findClosestSeaPort(value, ports);
            setPortDestination(closest);
            setPorts2(sortByCloseness(value, ports).slice(0, 10));
        }
    }

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
                                        Tracking N° {trackingNumber}
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
                                <Grid item xs={12} md={3} mt={1}>
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
                                    <Grid item xs={12} md={3} mt={1}>
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
                                        <BootstrapInput id="package-name" type="text" value={packageName} onChange={(e: any) => {setPackageName(e.target.value)}} fullWidth />
                                    </Grid>
                                    <Grid item xs={12} md={1} mt={1}>
                                        <InputLabel htmlFor="package-quantity" sx={inputLabelStyles}>{t('quantity')}</InputLabel>
                                        <BootstrapInput id="package-quantity" type="number" inputProps={{ min: 1, max: 100 }} value={packageQuantity} onChange={(e: any) => {setPackageQuantity(e.target.value)}} fullWidth />
                                    </Grid>
                                    <Grid item xs={12} md={2} mt={1}>
                                        <InputLabel htmlFor="package-dimensions" sx={inputLabelStyles}>{t('dimensions')}</InputLabel>
                                        <BootstrapInput id="package-dimensions" type="text" value={packageDimensions} onChange={(e: any) => {setPackageDimensions(e.target.value)}} fullWidth />
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
                                                if (packageName !== "" && packageQuantity > 0 && packageWeight > 0 && packageDimensions !== "") {
                                                    setPackagesSelection((prevItems: any) => [...prevItems, { 
                                                        name: packageName, quantity: packageQuantity, dimensions: packageDimensions, weight: packageWeight
                                                    }]);
                                                    setPackageName(""); setPackageQuantity(1); setPackageDimensions(""); setPackageWeight(0);
                                                } 
                                                else {
                                                    enqueueSnackbar("You need to fill the fields package name, weight and dimensions.", { variant: "error", anchorOrigin: { horizontal: "right", vertical: "top"} });
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
                                                                        t('name')+" : "+item.name+" | "+t('quantity')+" : "+item.quantity+" | "+t('dimensions')+" : "+item.dimensions+" | "+t('weight')+" : "+item.weight+" Kg"
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
                                        <BootstrapInput id="unit-name" type="text" value={unitName} onChange={(e: any) => {setUnitName(e.target.value)}} fullWidth />
                                    </Grid>
                                    <Grid item xs={12} md={1} mt={1}>
                                        <InputLabel htmlFor="unit-quantity" sx={inputLabelStyles}>{t('quantity')}</InputLabel>
                                        <BootstrapInput id="unit-quantity" type="number" inputProps={{ min: 1, max: 100 }} value={unitQuantity} onChange={(e: any) => {setUnitQuantity(e.target.value)}} fullWidth />
                                    </Grid>
                                    <Grid item xs={12} md={2} mt={1}>
                                        <InputLabel htmlFor="unit-dimensions" sx={inputLabelStyles}>{t('dimensions')}</InputLabel>
                                        <BootstrapInput id="unit-dimensions" type="text" value={unitDimensions} onChange={(e: any) => {setUnitDimensions(e.target.value)}} fullWidth />
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
                                                if (unitName !== "" && unitQuantity > 0 && unitWeight > 0 && unitDimensions !== "") {
                                                    setUnitsSelection((prevItems: any) => [...prevItems, { 
                                                        name: unitName, quantity: unitQuantity, dimensions: unitDimensions, weight: unitWeight
                                                    }]);
                                                    setUnitName(""); setUnitQuantity(1); setUnitDimensions(""); setUnitWeight(0);
                                                } 
                                                else {
                                                    enqueueSnackbar("You need to fill the fields unit name, weight and dimensions.", { variant: "error", anchorOrigin: { horizontal: "right", vertical: "top"} });
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
                                                                        t('name')+" : "+item.name+" | "+t('quantity')+" : "+item.quantity+" | "+t('dimensions')+" : "+item.dimensions+" | "+t('weight')+" : "+item.weight+" Kg"
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
                                    {/* <BootstrapInput id="client-number" value={clientNumber} onChange={(e: any) => {setClientNumber(e.target.value)}} fullWidth /> */}
                                    <ClientSearch id="client-number" value={clientNumber} onChange={setClientNumber} callBack={() => console.log(clientNumber)} fullWidth />
                                </Grid>
                                
                                <Grid item xs={12} md={6} mt={.5}>
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
                                                            </Grid> : null
                                                        }
                                                        {
                                                            activeStep === 1 ?
                                                            <Grid container spacing={2} mt={1} px={2}>
                                                                <Grid item xs={12}>
                                                                    <Alert severity="info" sx={{ mb: 2 }}>{t('selectOfferMessage')}</Alert>
                                                                    {
                                                                        !loadResults ? 
                                                                        seafreights !== null && seafreights.length !== 0 ?
                                                                            <Box>
                                                                                <Typography variant="h5" sx={{ my: 2, fontSize: 19, fontWeight: "bold" }}>{t('listSeaFreightsPricingOffers')}</Typography>
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
                                                                            </Box> : <Alert severity="error">{t('noResults')}</Alert>
                                                                        : <Skeleton />
                                                                    }
                                                                </Grid>
                                                            </Grid> : null
                                                        }
                                                        {
                                                            activeStep === 2 ? 
                                                            <Grid container spacing={2} mt={1} px={2}>
                                                                {/* <Grid item xs={12} md={4} mt={1}>
                                                                    <InputLabel htmlFor="departure-date" sx={inputLabelStyles}>{t('departureDate')}</InputLabel>
                                                                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                                                                        <DateTimePicker 
                                                                            value={departureDate} 
                                                                            onChange={(value: any) => { setDepartureDate(value) }}
                                                                            slotProps={{ textField: { id: "departure-date", fullWidth: true, sx: datetimeStyles }, inputAdornment: { sx: { position: "relative", right: "11.5px" } } }}
                                                                        />
                                                                    </LocalizationProvider>
                                                                </Grid> */}
                                                                {/* <Grid item xs={12} md={4} mt={1}>
                                                                    <InputLabel htmlFor="loading-date" sx={inputLabelStyles}>{t('loadingDate')}</InputLabel>
                                                                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                                                                        <DateTimePicker 
                                                                            value={loadingDate} 
                                                                            onChange={(value: any) => { setLoadingDate(value) }}
                                                                            slotProps={{ textField: { id: "loading-date", fullWidth: true, sx: datetimeStyles }, inputAdornment: { sx: { position: "relative", right: "11.5px" } } }}
                                                                        />
                                                                    </LocalizationProvider>
                                                                </Grid> */}
                                                                <Grid item xs={12} md={6} mt={1}>
                                                                    <InputLabel htmlFor="loading-city" sx={inputLabelStyles}>{t('departure')} / {t('loadingCity')}</InputLabel>
                                                                    <AutocompleteSearch id="loading-city" value={loadingCity} onChange={setLoadingCity} fullWidth />
                                                                    {/* {
                                                                        cities !== null ?
                                                                        <Autocomplete
                                                                            disablePortal
                                                                            id="loading-city"
                                                                            options={cities}
                                                                            getOptionLabel={(option: any) => { 
                                                                                if (option !== null && option !== undefined) {
                                                                                    return option.name+', '+option.country;
                                                                                }
                                                                                return ""; 
                                                                            }}
                                                                            value={loadingCity}
                                                                            sx={{ mt: 1 }}
                                                                            renderInput={(params: any) => <TextField {...params} />}
                                                                            onChange={(e: any, value: any) => { setLoadingCity(value); }}
                                                                            fullWidth
                                                                        /> : <Skeleton />
                                                                    } */}
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
                                                                            haulageTypes.map((item: any, i: number) => (
                                                                                <option key={"kdq"+i} value={item}>{item}</option>
                                                                            ))
                                                                        }
                                                                    </NativeSelect>
                                                                </Grid>
                                                            </Grid>
                                                            : null
                                                        }
                                                        {
                                                            activeStep === 3 ? 
                                                            <Grid container spacing={2} mt={1} px={2}>
                                                                <Grid item xs={12}>
                                                                    {
                                                                        !loadResults ? 
                                                                        haulages !== null && haulages.length !== 0 ?
                                                                            <Box>
                                                                                <Typography variant="h5" sx={{ my: 2, fontSize: 19, fontWeight: "bold" }}>{t('listHaulagesPricingOffers')}</Typography>
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
                                                                            </Box> : <Alert severity="error">{t('noResults')}</Alert>
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
                                                                            <Box>
                                                                                <Typography variant="h5" sx={{ my: 2, fontSize: 19, fontWeight: "bold" }}>{t('listMiscPricingOffers')}</Typography>
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
                                                                    <DataGrid
                                                                        rows={[selectedSeafreight]}
                                                                        columns={columnsSeafreights}
                                                                        hideFooter
                                                                        getRowId={(row: any) => row?.seaFreightId}
                                                                        getRowHeight={() => "auto" }
                                                                        sx={gridStyles}
                                                                        isRowSelectable={(params: any) => false}
                                                                    />
                                                                </Grid>
                                                                {
                                                                    selectedHaulage !== null ? 
                                                                    <Grid item xs={12}>
                                                                        <Typography variant="h5" sx={{ my: 2, fontSize: 19, fontWeight: "bold" }}>{t('selectedHaulage')}</Typography>
                                                                        <DataGrid
                                                                            rows={[selectedHaulage]}
                                                                            columns={columnsHaulages}
                                                                            hideFooter
                                                                            getRowId={(row: any) => row?.id}
                                                                            getRowHeight={() => "auto" }
                                                                            sx={gridStyles}
                                                                            isRowSelectable={(params: any) => false}
                                                                        />
                                                                    </Grid> : null
                                                                }
                                                                {
                                                                    selectedMisc !== null ? 
                                                                    <Grid item xs={12}>
                                                                        <Typography variant="h5" sx={{ my: 2, fontSize: 19, fontWeight: "bold" }}>{t('selectedMisc')}</Typography>
                                                                        <DataGrid
                                                                            rows={[selectedMisc]}
                                                                            columns={columnsMiscs}
                                                                            hideFooter
                                                                            getRowId={(row: any) => row?.id}
                                                                            getRowHeight={() => "auto" }
                                                                            sx={gridStyles}
                                                                            isRowSelectable={(params: any) => false}
                                                                        />
                                                                    </Grid> : null
                                                                }
                                                                <Grid item xs={12} md={4}>
                                                                    <InputLabel htmlFor="margin" sx={inputLabelStyles}>{t('margin')} (%)</InputLabel>
                                                                    <BootstrapInput id="margin" type="number" value={margin} onChange={(e: any) => setMargin(e.target.value)} fullWidth />
                                                                </Grid>
                                                                <Grid item xs={12} md={4}>
                                                                    <InputLabel htmlFor="reduction" sx={inputLabelStyles}>{t('reduction')} (%)</InputLabel>
                                                                    <BootstrapInput id="reduction" type="number" value={reduction} onChange={(e: any) => setReduction(e.target.value)} fullWidth />
                                                                </Grid>
                                                                <Grid item xs={12} md={4}>
                                                                    <InputLabel htmlFor="adding" sx={inputLabelStyles}>{t('extraFee')} ({selectedSeafreight !== null ? selectedSeafreight.currency : null})</InputLabel>
                                                                    <BootstrapInput id="adding" type="number" value={adding} onChange={(e: any) => setAdding(e.target.value)} fullWidth />
                                                                </Grid>
                                                                <Grid item xs={12}>
                                                                    <InputLabel htmlFor="details" sx={inputLabelStyles}>{t('detailsOffer')}</InputLabel>
                                                                    <BootstrapInput id="details" type="text" multiline rows={3} value={details} onChange={(e: any) => setDetails(e.target.value)} fullWidth />
                                                                </Grid>
                                                                <Grid item xs={12}>
                                                                    <Typography variant="h6">
                                                                        { 
                                                                            selectedSeafreight !== null ? 
                                                                            <Chip variant="outlined" size="medium"
                                                                                label={t('totalPrice').toUpperCase()+" : "+ Number(totalPrice+totalPrice*margin/100-totalPrice*reduction/100+adding*1).toFixed(2).toString()+" "+selectedSeafreight.currency}
                                                                                sx={{ fontWeight: "bold", fontSize: 16, py: 3 }} 
                                                                            /> : null
                                                                        }
                                                                    </Typography>
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
                                    <Button variant="contained" color="inherit" sx={whiteButtonStyles} style={{ float: "right", marginRight: "10px" }} onClick={() => { setModal4(true); getNotes(id); }} >{t('listNotes')}</Button>
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
                <BootstrapDialogTitle id="custom-dialog-title" onClose={() => setModal(false)}>
                    <b>{t('askInformation')}</b>
                </BootstrapDialogTitle>
                <DialogContent dividers>
                    <Typography variant="subtitle1" gutterBottom px={2}>
                        {t('pleaseFillForm')}
                    </Typography>
                    <Grid container spacing={2} mt={1} px={2}>
                        <Grid item xs={12}>
                            <InputLabel htmlFor="mail-subject" sx={inputLabelStyles}>{t('subject')}</InputLabel>
                            <BootstrapInput id="mail-subject" type="text" inputProps={{ min: 0, max: 100 }} value={mailSubject} onChange={(e: any) => {setMailSubject(e.target.value)}} fullWidth />
                        </Grid>
                        <Grid item xs={12} mt={1}>
                            <InputLabel htmlFor="mail-content" sx={inputLabelStyles}>{t('content')}</InputLabel>
                            <BootstrapInput id="mail-content" type="text" multiline rows={4} value={mailContent} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setMailContent(e.target.value)} fullWidth />
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions>
                    <Button variant="contained" color={!load ? "primary" : "info"} className="mr-3" onClick={askInformations} disabled={load === true} sx={{ textTransform: "none" }}>{t('send')}</Button>
                    <Button variant="contained" onClick={() => setModal(false)} sx={buttonCloseStyles}>{t('close')}</Button>
                </DialogActions>
            </BootstrapDialog>
            
            {/* Change request status */}
            <BootstrapDialog
                onClose={() => setModal2(false)}
                aria-labelledby="custom-dialog-title2"
                open={modal2}
                maxWidth="md"
                fullWidth
            >
                <BootstrapDialogTitle id="custom-dialog-title2" onClose={() => setModal2(false)}>
                    <b>{t('changeRequestStatus')}</b>
                </BootstrapDialogTitle>
                <DialogContent dividers>
                    <Typography variant="subtitle1" gutterBottom px={2}>
                        {t('pleaseChooseOptions')}
                    </Typography>
                    <Grid container spacing={2} mt={1} px={2}>
                        <Grid item xs={12}>
                            <FormControl>
                                <FormLabel id="demo-controlled-radio-buttons-group" sx={{ color: "#333" }}>{t('statusList')}</FormLabel>
                                <RadioGroup
                                    aria-labelledby="demo-controlled-radio-buttons-group"
                                    name="controlled-radio-buttons-group"
                                    row
                                    value={selectedStatus}
                                    onChange={handleChangeStatus}
                                >
                                    {
                                        statusTypes.map((elm) => <DarkTooltip key={"StatusType-"+elm.type} title={elm.description} placement="right" arrow><FormControlLabel value={elm.type} control={<Radio />} label={elm.value} /></DarkTooltip>)
                                    }
                                </RadioGroup>
                            </FormControl>
                        </Grid>
                        <Grid item xs={12} mt={1}>
                            <InputLabel htmlFor="status-message" sx={inputLabelStyles}>{t('statusMessage')}</InputLabel>
                            <BootstrapInput id="status-message" type="text" multiline rows={4} value={statusMessage} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setStatusMessage(e.target.value)} fullWidth />
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions>
                    <Button variant="contained" color={!load ? "primary" : "info"} className="mr-3" onClick={changeStatusRequest} disabled={load === true} sx={{ textTransform: "none" }}>{t('validate')}</Button>
                    <Button variant="contained" onClick={() => setModal2(false)} sx={buttonCloseStyles}>{t('close')}</Button>
                </DialogActions>
            </BootstrapDialog>
            
            {/* Add a comment/note */}
            <BootstrapDialog
                onClose={() => setModal3(false)}
                aria-labelledby="custom-dialog-title3"
                open={modal3}
                maxWidth="md"
                fullWidth
            >
                <BootstrapDialogTitle id="custom-dialog-title3" onClose={() => setModal3(false)}>
                    <b>{t('addCommentNote')}</b>
                </BootstrapDialogTitle>
                <DialogContent dividers>
                    <Typography variant="subtitle1" gutterBottom px={2}>
                        {t('pleaseFillAddNote')}
                    </Typography>
                    <Grid container spacing={2} mt={1} px={2}>
                        <Grid item xs={12} mt={1}>
                            <InputLabel htmlFor="general-note" sx={inputLabelStyles}>{t('generalNote')}</InputLabel>
                            <BootstrapInput id="general-note" type="text" multiline rows={4} value={generalNote} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setGeneralNote(e.target.value)} fullWidth />
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions>
                    <Button variant="contained" color={!load ? "primary" : "info"} className="mr-3" onClick={addRequestNote} disabled={load === true} sx={{ textTransform: "none" }}>{t('validate')}</Button>
                    <Button variant="contained" onClick={() => setModal3(false)} sx={buttonCloseStyles}>{t('close')}</Button>
                </DialogActions>
            </BootstrapDialog>

            {/* List of notes */}
            <BootstrapDialog
                onClose={() => setModal4(false)}
                aria-labelledby="custom-dialog-title4"
                open={modal4}
                maxWidth="lg"
                fullWidth
            >
                <BootstrapDialogTitle id="custom-dialog-title4" onClose={() => setModal4(false)}>
                    <b>{t('listNotesRequest')} {id}</b>
                </BootstrapDialogTitle>
                <DialogContent dividers>
                    <Grid container spacing={2} mt={1} px={2}>
                        <Grid item xs={12}>
                            {
                                !loadNotes && notes !== null ?
                                <TableContainer component={Paper}>
                                    <Table sx={{ minWidth: 650 }} aria-label="simple table" size="small">
                                        <TableHead>
                                            <TableRow>
                                                <TableCell align="left" sx={{ fontSize: 16, fontWeight: "bolder" }}>{t('id')}</TableCell>
                                                <TableCell align="left" sx={{ fontSize: 16, fontWeight: "bolder" }}>{t('content')}</TableCell>
                                                <TableCell align="left" sx={{ fontSize: 16, fontWeight: "bolder" }}>{t('date')}</TableCell>
                                                {/* <TableCell align="left" sx={{ fontSize: 16, fontWeight: "bolder" }}>Request id</TableCell> */}
                                                <TableCell align="left" sx={{ fontSize: 16, fontWeight: "bolder" }}>{t('noteType')}</TableCell>
                                                <TableCell align="left"><b></b></TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {
                                                notes.reverse().map((row: any, i: number) => (
                                                    <TableRow key={"requestNote-"+row.id} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                                                        <TableCell align="left">{row.id}</TableCell>
                                                        <TableCell align="left">{row.content}</TableCell>
                                                        <TableCell align="left">{(new Date(row.createdAt)).toLocaleString()}</TableCell>
                                                        {/* <TableCell align="left">{row.requestQuoteId}</TableCell> */}
                                                        <TableCell align="left">
                                                            <Chip label={row.noteType} color={row.noteType === "General" ? "primary" : "warning" } />
                                                        </TableCell>
                                                        <TableCell align="left">
                                                            <DarkTooltip title={t('deleteNote')} placement="right" arrow>
                                                                <IconButton 
                                                                    size="medium" 
                                                                    onClick={() => { deleteNote(row.id); }}
                                                                    disabled={row.noteType !== "General"}
                                                                >
                                                                    <DeleteIcon />
                                                                </IconButton>
                                                            </DarkTooltip>
                                                        </TableCell>
                                                    </TableRow>
                                                ))
                                            }
                                        </TableBody>
                                    </Table>
                                </TableContainer> : <Skeleton sx={{ mt: 3 }} />
                            }
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions>
                    <Button variant="contained" onClick={() => setModal4(false)} sx={buttonCloseStyles}>{t('close')}</Button>
                </DialogActions>
            </BootstrapDialog>

            {/* Price offer  */}
            <BootstrapDialog
                onClose={() => setModal5(false)}
                aria-labelledby="custom-dialog-title5"
                open={modal5}
                maxWidth="lg"
                fullWidth
            >
                <BootstrapDialogTitle id="custom-dialog-title5" onClose={() => setModal5(false)}>
                    <b>{t('generatePriceOffer')}</b>
                </BootstrapDialogTitle>
                <DialogContent dividers>
                </DialogContent>
                <DialogActions>
                    {/* <Button variant="contained" color={!load ? "primary" : "info"} className="mr-3" onClick={() => { getPriceRequests(); }} sx={{ textTransform: "none" }}>Generate the offer</Button> */}
                    <Button variant="contained" onClick={() => setModal5(false)} sx={buttonCloseStyles}>{t('close')}</Button>
                </DialogActions>
            </BootstrapDialog>
        </div>
    );
}

export default Request;
