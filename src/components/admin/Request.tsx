import { Alert, Autocomplete, Box, Button, Checkbox, Chip, DialogActions, DialogContent, FormControl, FormControlLabel, FormLabel, Grid, IconButton, InputLabel, List, ListItem, ListItemText, MenuItem, NativeSelect, Paper, Radio, RadioGroup, Select, SelectChangeEvent, Skeleton, Step, StepLabel, Stepper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField, Typography } from '@mui/material';
import { MuiTelInput } from 'mui-tel-input';
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import '../../App.css';
import AutocompleteSearch from '../shared/AutocompleteSearch';
import { inputLabelStyles, BootstrapInput, BootstrapDialogTitle, BootstrapDialog, buttonCloseStyles, DarkTooltip, tagInputStyles, whiteButtonStyles, datetimeStyles } from '../../misc/styles';
import { enqueueSnackbar, SnackbarProvider } from 'notistack';
import DeleteIcon from '@mui/icons-material/Delete';
import { pricingRequest, protectedResources, transportRequest } from '../../authConfig';
import { useAuthorizedBackendApi } from '../../api/api';
import { BackendService } from '../../services/fetch';
import { MuiChipsInput, MuiChipsInputChip } from 'mui-chips-input';
import { MailData, RequestDto } from '../../models/models';
import { DateTimePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { Dayjs } from 'dayjs';
import { useAccount, useMsal } from '@azure/msal-react';
import { AuthenticationResult } from '@azure/msal-browser';

import { DataGrid, GridColDef, GridEventListener, GridRenderCellParams, GridValueFormatterParams, GridValueGetterParams } from '@mui/x-data-grid';

//let statusTypes = ["EnAttente", "Valider", "Rejeter"];
let cargoTypes = ["Container", "Conventional", "RollOnRollOff"];
let packingTypes = ["LCL", "Airfreight", "Cars", "Trucks", "Not containerised"];

let haulageTypes = [
    "On trailer, direct loading", 
    "On trailer, Loading with Interval", 
    "Side loader, direct loading", 
    "Side loader, Loading with Interval, from trailer to floor", 
    "Side loader, Loading with Interval, from floor to trailer"
];
let statusTypes = [
    { type: "EnAttente", value: "En attente", description: "En attente de traitement" }, 
    { type: "Valider", value: "Validé", description: "Devis validé par l'employé" }, 
    { type: "Rejeter", value: "Rejeté", description: "Devis rejeté par l'employé" }, 
    { type: "EnCoursDeTraitement", value: "En cours de traitement", description: "Devis en cours de traitement" }, 
    { type: "EnTransit", value: "En transit", description: "Marchandise en cours de transport" }, 
    { type: "EnDouane", value: "En douane", description: "Marchandise en cours de dédouanement" }, 
    { type: "LivraisonEnCours", value: "Livraison en cours", description: "Marchandise en cours de livraison" }, 
    { type: "Livre", value: "Livré", description: "Marchandise livrée au client" }, 
    { type: "Annule", value: "Annulé", description: "La demande de devis a été annulée" }, 
    { type: "Retour", value: "Retourné", description: "Marchandise retournée à l'expéditeur" }, 
    { type: "Problème", value: "Problème", description: "Problème rencontré lors du transport, à résoudre" }, 
    { type: "EnAttenteDeFacturation", value: "En attente de facturation", description: "En attente de facturation après livraison "} 
];

function convertStringToObject(str: string): { city: string, country: string } {
    if (str !== undefined) {
        const [city, ...countryArr] = str.split(', ');
        const country = countryArr.join(', ');
        return { city, country };
    }
    return { city: "", country: "" };
}

function createGetRequestUrl(url: string, variable1: string|undefined, variable2: string, variable3: string) {
    if (variable1) {
        url += 'PlannedDeparture=' + encodeURIComponent(variable1) + '&';
    }
    if (variable2) {
        url += 'HaulageType=' + encodeURIComponent(variable2) + '&';
    }
    if (variable3) {
        url += 'LoadingCityId=' + encodeURIComponent(variable3) + '&';
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


const steps = ['Search for offers', 'List of offers', 'Send an offer'];

function Request(props: any) {
    const [load, setLoad] = useState<boolean>(true);
    const [loadAssignees, setLoadAssignees] = useState<boolean>(true);
    const [loadNotes, setLoadNotes] = useState<boolean>(true);
    const [loadResults, setLoadResults] = useState<boolean>(false);
    const [email, setEmail] = useState<string>("");
    const [status, setStatus] = useState<string | null>(null);
    const [trackingNumber, setTrackingNumber] = useState<string>("");
    const [phone, setPhone] = useState<string>("");
    const [message, setMessage] = useState<string>("");
    const [containerType, setContainerType] = useState<number>(8);
    const [quantity, setQuantity] = useState<number>(1);
    const [containersSelection, setContainersSelection] = useState<any>([]);
    const [cargoType, setCargoType] = useState<string>("0");
    const [cargoProducts, setCargoProducts] = useState<any>([]);
    const [packingType, setPackingType] = useState<string>("");
    const [departureTown, setDepartureTown] = useState<any>(null);
    const [arrivalTown, setArrivalTown] = useState<any>(null);
    const [departure, setDeparture] = useState<string>("");
    const [arrival, setArrival] = useState<string>("");
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
    const [assignedManager, setAssignedManager] = useState<string>("null");
    const [assignees, setAssignees] = useState<any>(null);
    const [notes, setNotes] = useState<any>(null);
    const [idUser, setIdUser] = useState<any>(null);
    
    const [departureDate, setDepartureDate] = useState<Dayjs | null>(null);
    const [containersSelected, setContainersSelected] = useState<string[]>([]);
    const [destinationPort, setDestinationPort] = useState<any>(null);
    const [portDeparture, setPortDeparture] = useState<any>(null);
    const [loadingDate, setLoadingDate] = useState<Dayjs | null>(null);
    const [loadingCity, setLoadingCity] = useState<any>(null);
    const [haulageType, setHaulageType] = useState<string>("");
    const [products, setProducts] = useState<any>(null);
    const [cities, setCities] = useState<any>(null);
    const [ports, setPorts] = useState<any>(null);
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
    let { id } = useParams();

    const { instance, accounts } = useMsal();
    const account = useAccount(accounts[0] || {});
        
    const context = useAuthorizedBackendApi();
    
    const columnsSeafreights: GridColDef[] = [
        { field: 'carrierName', headerName: 'Carrier', width: 200 },
        { field: 'carrierAgentName', headerName: 'Carrier agent', width: 275 },
        { field: 'departurePortName', headerName: 'Departure port', width: 125 },
        { field: 'frequency', headerName: 'Frequency', valueFormatter: (params: GridValueFormatterParams) => `${params.value || ''} / day`, },
        { field: 'transitTime', headerName: 'Transit time', valueFormatter: (params: GridValueFormatterParams) => `${params.value || ''} days` },
        { field: 'currency', headerName: 'Prices', renderCell: (params: GridRenderCellParams) => {
            return (
                <Box sx={{ my: 1, mr: 1 }}>
                    <Box sx={{ my: 1 }} hidden={params.row.price20dry === 0 || !getPackageNamesByIds(containersSelected, containers).includes("20' Dry")}>{"20' Dry : "+params.row.price20dry+" "+params.row.currency}</Box>
                    <Box sx={{ my: 1 }} hidden={params.row.price20rf === 0 || !getPackageNamesByIds(containersSelected, containers).includes("20' Rf")}>{"20' Rf : "+params.row.price20rf+" "+params.row.currency}</Box>
                    <Box sx={{ my: 1 }} hidden={params.row.price40dry === 0 || !getPackageNamesByIds(containersSelected, containers).includes("40' Dry")}>{"40' Dry : "+params.row.price40dry+" "+params.row.currency}</Box>
                    <Box sx={{ my: 1 }} hidden={params.row.price40hc === 0 || !getPackageNamesByIds(containersSelected, containers).includes("40' Hc")}>{"40' Hc : "+params.row.price40hc+" "+params.row.currency}</Box>
                    <Box sx={{ my: 1 }} hidden={params.row.price40hcrf === 0 || !getPackageNamesByIds(containersSelected, containers).includes("40' HcRf")}>{"40' HcRf : "+params.row.price40hcrf+" "+params.row.currency}</Box>
                </Box>
            );
        }, width: 200 },
    ];
    
    const columnsHaulages: GridColDef[] = [
        { field: 'haulierName', headerName: 'Haulier', width: 200 },
        { field: 'loadingPort', headerName: 'Loading port', renderCell: (params: GridRenderCellParams) => {
            return (
                <Box sx={{ my: 2 }}>{params.row.loadingPort}</Box>
            );
        }, width: 275 },
        { field: 'freeTime', headerName: 'Free time', valueFormatter: (params: GridValueFormatterParams) => `${params.value || ''} days`, width: 125 },
        { field: 'multiStop', headerName: 'Multi stop', valueGetter: (params: GridValueGetterParams) => `${params.row.multiStop || ''} ${params.row.currency}` },
        { field: 'overtimeTariff', headerName: 'Overtime tariff', valueGetter: (params: GridValueGetterParams) => `${params.row.overtimeTariff || ''} ${params.row.currency}` },
        { field: 'unitTariff', headerName: 'Unit tariff', valueGetter: (params: GridValueGetterParams) => `${params.row.unitTariff || ''} ${params.row.currency}` },
        { field: 'validUntil', headerName: 'Valid until', valueFormatter: (params: GridValueFormatterParams) => `${(new Date(params.value)).toLocaleString() || ''}`, width: 200 },
    ];
    
    const columnsMiscs: GridColDef[] = [
        { field: 'supplierName', headerName: 'Supplier', width: 200 },
        { field: 'departurePortName', headerName: 'Departure port', width: 275, valueFormatter: (params: GridValueFormatterParams) => `${portDeparture.portName || ''}`, },
        { field: 'destinationPortName', headerName: 'Destination port', width: 325, valueFormatter: (params: GridValueFormatterParams) => `${destinationPort.portName || ''}`, },
        { field: 'currency', headerName: 'Prices', renderCell: (params: GridRenderCellParams) => {
            return (
                <Box sx={{ my: 1, mr: 1 }}>
                    <Box sx={{ my: 1 }} hidden={params.row.price20dry === 0 || !getPackageNamesByIds(containersSelected, containers).includes("20' Dry")}>{"20' Dry : "+params.row.price20dry+" "+params.row.currency}</Box>
                    <Box sx={{ my: 1 }} hidden={params.row.price20rf === 0 || !getPackageNamesByIds(containersSelected, containers).includes("20' Rf")}>{"20' Rf : "+params.row.price20rf+" "+params.row.currency}</Box>
                    <Box sx={{ my: 1 }} hidden={params.row.price40dry === 0 || !getPackageNamesByIds(containersSelected, containers).includes("40' Dry")}>{"40' Dry : "+params.row.price40dry+" "+params.row.currency}</Box>
                    <Box sx={{ my: 1 }} hidden={params.row.price40hc === 0 || !getPackageNamesByIds(containersSelected, containers).includes("40' Hc")}>{"40' Hc : "+params.row.price40hc+" "+params.row.currency}</Box>
                    <Box sx={{ my: 1 }} hidden={params.row.price40hcrf === 0 || !getPackageNamesByIds(containersSelected, containers).includes("40' HcRf")}>{"40' HcRf : "+params.row.price40hcrf+" "+params.row.currency}</Box>
                </Box>
            );
        }, width: 200 },
    ];
    
    const handleChangeContainers = (event: SelectChangeEvent<typeof containersSelected>) => {
        const {
           target: { value },
        } = event;
        setContainersSelected(
            // On autofill we get a stringified value.
            typeof value === 'string' ? value.split(',') : value,
        );
    };

    const handleChangeHaulageType = (event: { target: { value: string } }) => {
        setHaulageType(event.target.value);
    };
    
    const handleChangeCargoType = (event: { target: { value: string } }) => {
        setCargoType(event.target.value);
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
        return step === 5;
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
            if (departureDate !== null && containersSelected.length !== 0 && destinationPort !== null) {
                getPriceRequests();
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
                    seafreightPrices += selectedSeafreight.price20dry*containersSelection.find((elm: any) => elm.container === 8).quantity;
                }
                if (selectedSeafreight.price20rf !== 0 && getPackageNamesByIds(containersSelected, containers).includes("20' Rf")) {
                    seafreightPrices += selectedSeafreight.price20rf*containersSelection.find((elm: any) => elm.container === 13).quantity;
                }
                if (selectedSeafreight.price40dry !== 0 && getPackageNamesByIds(containersSelected, containers).includes("40' Dry")) {
                    seafreightPrices += selectedSeafreight.price40dry*containersSelection.find((elm: any) => elm.container === 9).quantity;
                }
                if (selectedSeafreight.price40hc !== 0 && getPackageNamesByIds(containersSelected, containers).includes("40' Hc")) {
                    seafreightPrices += selectedSeafreight.price40hc*containersSelection.find((elm: any) => elm.container === 10).quantity;
                }
                if (selectedSeafreight.price40hcrf !== 0 && getPackageNamesByIds(containersSelected, containers).includes("40' HcRf")) {
                    seafreightPrices += selectedSeafreight.price40hcrf*containersSelection.find((elm: any) => elm.container === 15).quantity;
                }
                
                if (selectedHaulage !== null) {
                    seafreightPrices = seafreightPrices + selectedHaulage.unitTariff*containersSelection.reduce((total: any, obj: any) => total + Number(obj.quantity), 0);
                }
                
                if (selectedMisc !== null) {
                    if (selectedMisc.price20dry !== 0 && getPackageNamesByIds(containersSelected, containers).includes("20' Dry")) {
                        seafreightPrices += selectedMisc.price20dry*containersSelection.find((elm: any) => elm.container === 8).quantity;
                    }
                    if (selectedMisc.price20rf !== 0 && getPackageNamesByIds(containersSelected, containers).includes("20' Rf")) {
                        seafreightPrices += selectedMisc.price20rf*containersSelection.find((elm: any) => elm.container === 13).quantity;
                    }
                    if (selectedMisc.price40dry !== 0 && getPackageNamesByIds(containersSelected, containers).includes("40' Dry")) {
                        seafreightPrices += selectedMisc.price40dry*containersSelection.find((elm: any) => elm.container === 9).quantity;
                    }
                    if (selectedMisc.price40hc !== 0 && getPackageNamesByIds(containersSelected, containers).includes("40' Hc")) {
                        seafreightPrices += selectedMisc.price40hc*containersSelection.find((elm: any) => elm.container === 10).quantity;
                    }
                    if (selectedMisc.price40hcrf !== 0 && getPackageNamesByIds(containersSelected, containers).includes("40' HcRf")) {
                        seafreightPrices += selectedMisc.price40hcrf*containersSelection.find((elm: any) => elm.container === 15).quantity;
                    }
                    setTotalPrice(seafreightPrices);
                }
                else {
                    setTotalPrice(seafreightPrices);
                }
                
                console.log("Haulage : ", [selectedHaulage]);
                console.log("SeaFreight : ", [selectedSeafreight]);
                console.log("Misc : ", [selectedMisc]);

                setActiveStep((prevActiveStep) => prevActiveStep + 1);
                setSkipped(newSkipped);
            }
            else {
                enqueueSnackbar("You need to select a sea freight before going to the next step.", { variant: "warning", anchorOrigin: { horizontal: "right", vertical: "top"} });
            }
        }
        if (activeStep === 2) {
            createNewOffer();
        }
    };

    const handleBack = () => {
        if (activeStep === 2) {
            setSelectedHaulage(null);
            setSelectedSeafreight(null);
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
    
    const handleRowHaulagesClick: GridEventListener<'rowClick'> = (params) => {
        setSelectedHaulage(params.row);
    };
    
    const handleRowSeafreightsClick: GridEventListener<'rowClick'> = (params) => {
        setSelectedSeafreight(params.row);
    };
    
    const handleRowMiscsClick: GridEventListener<'rowClick'> = (params) => {
        setSelectedMisc(params.row);
    };
    
    useEffect(() => {
        //loadRequest();
        getContainers();
        getPorts();
        getCities();
        getProducts();
        getAssignees();
    }, [context]);
    
    const getAssignees = async () => {
        if (context) {
            setLoadAssignees(true);
            const response = await (context as BackendService<any>).getSingle(protectedResources.apiLisQuotes.endPoint+"/Assignee");
            if (response !== null && response.code !== undefined) {
                if (response.code === 200) {
                    setAssignees(response.data);
                    setLoadAssignees(false);

                    // Now i can load the user
                    loadRequest();
                }
                else {
                    setLoadAssignees(false);
                }
            }  
        }
    }
    
    const loadRequest = async () => {
        if (context) {
            setLoad(true);
            const response = await (context as BackendService<any>).getSingle(protectedResources.apiLisQuotes.endPoint+"/Request/"+id);
            if (response !== null && response.code !== undefined) {
                if (response.code === 200) {
                    setEmail(response.data.email);
                    setPhone(response.data.whatsapp);
                    setDeparture(response.data.departure);
                    setArrival(response.data.arrival);
                    setDepartureTown(convertStringToObject(response.data.departure));
                    setArrivalTown(convertStringToObject(response.data.arrival));
                    setStatus(response.data.status);
                    setCargoType(String(cargoTypes.indexOf(response.data.cargoType)));
                    setQuantity(response.data.quantity);
                    setMessage(response.data.detail);
                    setTags(response.data.tags !== null ? response.data.tags.split(",") : []);
                    setAssignedManager(response.data.assigneeId);
                    setTrackingNumber(response.data.trackingNumber);
                    setLoad(false);

                    // Now i can get assignees (for synchronisation problems)
                    //getAssignees();
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
                    enqueueSnackbar("The manager has been assigned to this request.", { variant: "success", anchorOrigin: { horizontal: "right", vertical: "top"} });
                }
                else {
                    enqueueSnackbar("An error happened during the operation.", { variant: "error", anchorOrigin: { horizontal: "right", vertical: "top"} });
                }
            }
        }
        else {
            enqueueSnackbar("You must select a request manager first.", { variant: "error", anchorOrigin: { horizontal: "right", vertical: "top"} });
        }
    }

    const removeManager = async () => {
        if (context) {
            const response = await (context as BackendService<any>).put(protectedResources.apiLisQuotes.endPoint+"/Assignee/unassign/"+id, []);
            if (response !== null) {
                enqueueSnackbar("The manager has been removed from this request.", { variant: "success", anchorOrigin: { horizontal: "right", vertical: "top"} });
                setAssignedManager("");
            }
            else {
                enqueueSnackbar("An error happened during the operation.", { variant: "error", anchorOrigin: { horizontal: "right", vertical: "top"} });
            }
        }
    }
    
    const editRequest = async () => {
        if(context) {
            const body: RequestDto = {
                id: Number(id),
                email: email,
                status: status,
                whatsapp: phone,
                departure: departure,
                arrival: arrival,
                cargoType: 0,
                quantity: quantity,
                detail: message,
                tags: tags.length !== 0 ? tags.join(",") : null,
                assigneeId: Number(assignedManager)
            };

            const data = await (context as BackendService<any>).put(protectedResources.apiLisQuotes.endPoint+"/Request/"+id, body);
            if (data?.status === 200) {
                enqueueSnackbar("Your request has been edited with success.", { variant: "success", anchorOrigin: { horizontal: "right", vertical: "top"} });
            }
            else {
                enqueueSnackbar("An error happened during the operation.", { variant: "error", anchorOrigin: { horizontal: "right", vertical: "top"} });
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
                enqueueSnackbar("Your request's status has been updated with success.", { variant: "success", anchorOrigin: { horizontal: "right", vertical: "top"} });
            }
            else {
                enqueueSnackbar("An error happened during the operation.", { variant: "error", anchorOrigin: { horizontal: "right", vertical: "top"} });
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
                    enqueueSnackbar("The message has been successfully sent.", { variant: "success", anchorOrigin: { horizontal: "right", vertical: "top"} });
                }
                else {
                    enqueueSnackbar("An error happened during the operation.", { variant: "error", anchorOrigin: { horizontal: "right", vertical: "top"} });
                }
            }
        }
        else {
            enqueueSnackbar("The content field is empty, please fill it.", { variant: "error", anchorOrigin: { horizontal: "right", vertical: "top"} });
        }
    }

    const addRequestNote = async () => {
        if (generalNote !== "") {
            if (context) {
                var dataSent = { "content": generalNote, "requestQuoteId": id, "noteType": "General", "idUser": idUser };
                const response = await (context as BackendService<any>).post(protectedResources.apiLisQuotes.endPoint+"/RequestQuoteNotes", dataSent);
                if (response !== null) {
                    setModal3(false);
                    enqueueSnackbar("The comment/note has been successfully added.", { variant: "success", anchorOrigin: { horizontal: "right", vertical: "top"} });
                }
                else {
                    enqueueSnackbar("An error happened during the operation.", { variant: "error", anchorOrigin: { horizontal: "right", vertical: "top"} });
                }
            }
        }
        else {
            enqueueSnackbar("The content field is empty, please fill it.", { variant: "error", anchorOrigin: { horizontal: "right", vertical: "top"} });
        }
    }

    const getNotes = async (idRequest: string|undefined) => {
        if (context) {
            setLoadNotes(true);
            const response = await (context as BackendService<any>).getSingle(protectedResources.apiLisQuotes.endPoint+"/RequestQuoteNotes?requestQuoteId="+idRequest);
            if (response !== null && response.code !== undefined) {
                if (response.code === 200) {
                    console.log(response.data);
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
        if (departureDate !== null && containersSelected.length !== 0 && destinationPort !== null) {
            // alert(containersSelected);
            console.log(containers.map((elm: any) => elm.packageName));
            setLoadResults(true);
            getSeaFreightPriceOffers();
            getMiscellaneousPriceOffers();
            if (loadingCity !== null && haulageType !== "") {
                getHaulagePriceOffers();
            }
        }
        else {
            enqueueSnackbar("The fields departure date, containers and destination port cannot be empty, fill them.", { variant: "warning", anchorOrigin: { horizontal: "right", vertical: "top"} });
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
            
            var urlSent = createGetRequestUrl(protectedResources.apiLisPricing.endPoint+"/Pricing/HaulagesOfferRequest?", loadingDate?.toISOString(), haulageType, loadingCity.id);
            const response = await (context as BackendService<any>).getWithToken(urlSent, token);
            setLoadResults(false);
            setHaulages(response);
            console.log(response);  
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
            
            console.log(containersSelected);
            var containersFormatted = containersSelected.join("&ContainerTypesId=");
            console.log(containersFormatted);
            
            var urlSent = createGetRequestUrl2(protectedResources.apiLisPricing.endPoint+"/Pricing/SeaFreightsOffersRequest?", portDeparture.portId, destinationPort.portId, departureDate?.toISOString(), containersFormatted);
            const response = await (context as BackendService<any>).getWithToken(urlSent, token);
            setLoadResults(false);
            setSeafreights(response);
            console.log(response);  
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
            
            var urlSent = createGetRequestUrl2(protectedResources.apiLisPricing.endPoint+"/Pricing/MiscellaneoussOffersRequest?", portDeparture.portId, destinationPort.portId, departureDate?.toISOString(), containersFormatted);
            const response = await (context as BackendService<any>).getWithToken(urlSent, token);
            setMiscs(response);
            console.log(response);  
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
            console.log("Containers", response);
            if (response !== null && response !== undefined) {
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
            console.log(response);
            if (response !== null && response !== undefined) {
                setPorts(response);
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
            console.log(response);
            if (response !== null && response !== undefined) {
                setCities(response);
            }  
        }
    }
    
    const getProducts = async () => {
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
            console.log(response);
            if (response !== null && response !== undefined) {
                setProducts(response);
            }  
        }
    }
    
    const createNewOffer = async () => {
        if (selectedSeafreight !== null) {
            if (context) {
                var dataSent = { 
                    "requestQuoteId": Number(id),
                    "comment": details,
                    "quoteOfferId": 20,
                    "quoteOfferNumber": 10,
                    // "quoteOfferVm": 0,
                    "createdBy": account?.username,
                    "emailUser": email,
                    // "haulage": {
                    //     "id": selectedHaulage.id,
                    //     "haulierId": selectedHaulage.id,
                    //     "haulierName": selectedHaulage.haulierName,
                    //     "currency": selectedHaulage.currency,
                    //     "loadingCityName": selectedHaulage.loadingPort,
                    //     "freeTime": selectedHaulage.freeTime,
                    //     "multiStop": selectedHaulage.multiStop,
                    //     "overtimeTariff": selectedHaulage.overtimeTariff,
                    //     "unitTariff": selectedHaulage.unitTariff,
                    //     "haulageType": haulageType,
                    // },
                    // "miscellaneousList": [
                    //     {
                    //     "id": "string",
                    //     "departurePortId": 0,
                    //     "destinationPortId": 0,
                    //     "departurePortName": "string",
                    //     "destinationPortName": "string",
                    //     "supplierId": 0,
                    //     "supplierName": "string",
                    //     "currency": "string"
                    //     }
                    // ],
                    "seaFreight": {
                        "id": selectedSeafreight.seaFreightId,
                        "departurePortId": portDeparture.portId,
                        "destinationPortId": destinationPort.portId,
                        "departurePortName": selectedSeafreight.departurePortName,
                        "destinationPortName": destinationPort.portName,
                        "carrierId": 0,
                        "carrierName": selectedSeafreight.carrierName,
                        "carrierAgentId": 0,
                        "carrierAgentName": selectedSeafreight.carrierAgentName,
                        "currency": selectedSeafreight.currency,
                        "transitTime": selectedSeafreight.transitTime,
                        "frequency": selectedSeafreight.frequency
                    } 
                };
                const response = await (context as BackendService<any>).post(protectedResources.apiLisOffer.endPoint+"/QuoteOffer", dataSent);
                if (response !== null) {
                    setModal5(false);
                    enqueueSnackbar("The offer has been successfully sent.", { variant: "success", anchorOrigin: { horizontal: "right", vertical: "top"} });
                }
                else {
                    enqueueSnackbar("An error happened during the operation.", { variant: "error", anchorOrigin: { horizontal: "right", vertical: "top"} });
                }
            }
        }
        else {
            enqueueSnackbar("The content field is empty, please fill it.", { variant: "error", anchorOrigin: { horizontal: "right", vertical: "top"} });
        }
    }
    
    return (
        <div style={{ background: "#fff", borderTopLeftRadius: 20, borderTopRightRadius: 20 }}>
            <SnackbarProvider />
            <Box py={4}>
                <Typography variant="h5" mt={3} mx={5}><b>Manage a request for quote N° {id}</b></Typography>
                <Box>
                    {
                        !load ? 
                        <Grid container spacing={2} mt={1} px={5}>
                            <Grid item xs={12}>
                                <Typography variant="body2" color="dodgerblue" sx={{ fontWeight: "bold" }}>Tracking N° {trackingNumber}</Typography>
                            </Grid>
                            <Grid item xs={12}>
                                <Alert 
                                    severity="info" 
                                    sx={{ display: "flex", alignItems: "center", justifyContent: "left" }}
                                    action={<Button variant="contained" color="inherit" sx={{ background: "#fff", color: "#333", float: "right", textTransform: "none", position: "relative", bottom: "2px" }} onClick={() => { setModal(true); }}>Ask for more informations</Button>}
                                >
                                    <Typography variant="subtitle1" display="inline">Do you think this request need more informations?</Typography>
                                </Alert>
                            </Grid>
                            <Grid item xs={6}>
                                <InputLabel htmlFor="whatsapp-phone-number" sx={inputLabelStyles}>Whatsapp number</InputLabel>
                                <MuiTelInput id="whatsapp-phone-number" value={phone} onChange={setPhone} defaultCountry="CM" preferredCountries={["CM", "BE", "KE"]} sx={{ mt: 1, paddingLeft: "4px" }} fullWidth /*disabled={status === "Valider"}*/ />
                            </Grid>
                            <Grid item xs={6}>
                                <InputLabel htmlFor="request-email" sx={inputLabelStyles}>Email</InputLabel>
                                <BootstrapInput id="request-email" type="email" value={email} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)} fullWidth disabled />
                            </Grid>
                            <Grid item xs={6}>
                                <InputLabel htmlFor="departure" sx={inputLabelStyles}>City and country of departure of the goods</InputLabel>
                                <AutocompleteSearch id="departure" value={departureTown} onChange={(e: any) => { setDepartureTown(convertStringToObject(e.target.innerText)); setDeparture(e.target.innerText); }} fullWidth /*disabled={status === "Valider"}*/ />
                            </Grid>
                            <Grid item xs={6}>
                                <InputLabel htmlFor="arrival" sx={inputLabelStyles}>City and country of arrival of the goods</InputLabel>
                                <AutocompleteSearch id="arrival" value={arrivalTown} onChange={(e: any) => { setArrivalTown(convertStringToObject(e.target.innerText)); setArrival(e.target.innerText); }} fullWidth /*disabled={status === "Valider"}*/ />
                            </Grid>
                            {/* <Grid item xs={6}>
                                <InputLabel htmlFor="cargo-type" sx={inputLabelStyles}>Type of cargo</InputLabel>
                                <NativeSelect
                                    id="cargo-type"
                                    value={cargoType}
                                    onChange={handleChangeCargoType}
                                    input={<BootstrapInput />}
                                    fullWidth
                                >
                                    <option value="0">Container</option>
                                    <option value="1">Conventional</option>
                                    <option value="2">Roll-on/Roll-off</option>
                                </NativeSelect>
                            </Grid> */}
                            <Grid item xs={6}>
                                <InputLabel htmlFor="cargo-products" sx={inputLabelStyles}>Type of products</InputLabel>
                                {
                                    products !== null ?
                                    <Autocomplete
                                        multiple    
                                        disablePortal
                                        id="cargo-products"
                                        placeholder="Machinery, Household goods, etc"
                                        options={products}
                                        getOptionLabel={(option: any) => { 
                                            if (option !== null && option !== undefined) {
                                                return option.productName;
                                            }
                                            return ""; 
                                        }}
                                        value={cargoProducts}
                                        sx={{ mt: 1 }}
                                        renderInput={(params) => <TextField {...params} sx={{ textTransform: "lowercase" }} />}
                                        onChange={(e: any, value: any) => { setCargoProducts(value); }}
                                        fullWidth
                                    /> : <Skeleton />
                                }
                            </Grid>
                            <Grid item xs={6}>
                                <InputLabel htmlFor="packing-type" sx={inputLabelStyles}>Type of packing</InputLabel>
                                <NativeSelect
                                    id="packing-type"
                                    value={packingType}
                                    onChange={(event: { target: { value: string } }) => { setPackingType(event.target.value); }}
                                    input={<BootstrapInput />}
                                    fullWidth
                                >
                                    {packingTypes.map((elm: any, i: number) => (
                                        <option key={"elm1-"+i} value={elm}>{elm}</option>
                                    ))}
                                </NativeSelect>
                            </Grid>
                            
                            <Grid item xs={6}>
                                <InputLabel htmlFor="container-type" sx={inputLabelStyles}>Container Type</InputLabel>
                                {
                                    containers !== null ?
                                    <NativeSelect
                                        id="container-type"
                                        value={containerType}
                                        onChange={(event: { target: { value: any } }) => { setContainerType(Number(event.target.value)); }}
                                        input={<BootstrapInput />}
                                        fullWidth
                                    >
                                        <option key={"elm1-x"} value={0}>Not defined</option>
                                        {containers.map((elm: any, i: number) => (
                                            <option key={"elm1-"+i} value={elm.packageId}>{elm.packageName}</option>
                                        ))}
                                    </NativeSelect>
                                    : <Skeleton />
                                }
                            </Grid>
                            <Grid item xs={4}>
                                <InputLabel htmlFor="quantity" sx={inputLabelStyles}>Quantity</InputLabel>
                                <BootstrapInput id="quantity" type="number" inputProps={{ min: 0, max: 100 }} value={quantity} onChange={(e: any) => {console.log(e); setQuantity(e.target.value)}} fullWidth /*disabled={status === "Valider"}*/ />
                            </Grid>
                            <Grid item xs={2}>
                                <Button 
                                    variant="contained" color="inherit" fullWidth sx={whiteButtonStyles} 
                                    style={{ marginTop: "30px", height: "42px", float: "right" }} 
                                    onClick={() => {
                                        if (containerType !== 0 && quantity > 0) {
                                            setContainersSelection((prevItems: any) => [...prevItems, { container: containerType, quantity: quantity }]);
                                            setContainerType(0); setQuantity(1);
                                        } 
                                        else {
                                            enqueueSnackbar("You need to select a container type and a good value for quantity.", { variant: "error", anchorOrigin: { horizontal: "right", vertical: "top"} });
                                        }
                                    }} 
                                >
                                    Add the container
                                </Button>
                            </Grid>
                            <Grid item xs={12}>
                                {
                                    containersSelection !== undefined && containersSelection !== null && containersSelection.length !== 0 && containers !== null ? 
                                        <List>
                                            {
                                                containersSelection.map((item: any, index: number) => (
                                                    <ListItem
                                                        key={"listitem1-"+index}
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
                                                            containers.find((elm: any) => elm.packageId === item.container) !== undefined ?
                                                            "Container : "+containers.find((elm: any) => elm.packageId === item.container).packageName+" | Quantity : "+item.quantity
                                                            : "Container : "+item.container+" | Quantity : "+item.quantity
                                                        } />
                                                    </ListItem>
                                                ))
                                            }
                                        </List>
                                    : null  
                                }
                            </Grid>
                            
                            <Grid item xs={12}>
                                <InputLabel htmlFor="tags" sx={inputLabelStyles}>Tags</InputLabel>
                                <MuiChipsInput 
                                    id="tags" 
                                    placeholder="Type some key words of your request" 
                                    value={tags} variant="outlined" 
                                    onChange={(elm: MuiChipsInputChip[]) => { setTags(elm); }} 
                                    fullWidth 
                                    sx={tagInputStyles} 
                                    renderChip={(Component, key, props) => {
                                        return <Component {...props} key={key} sx={{ mt: .75 }} />
                                    }}
                                />
                            </Grid>
                            <Grid item xs={6} mt={.5}>
                                <InputLabel htmlFor="request-message" sx={inputLabelStyles}>Other details about your need (Optional)</InputLabel>
                                <BootstrapInput id="request-message" type="text" multiline rows={3.5} value={message} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setMessage(e.target.value)} fullWidth /*disabled={status === "Valider"}*/ />
                            </Grid>
                            <Grid item xs={6} mt={1}>
                                <InputLabel htmlFor="assigned-manager" sx={inputLabelStyles}>Assigned manager</InputLabel>
                                {
                                    !loadAssignees ? 
                                    <>
                                        <NativeSelect
                                            id="assigned-manager"
                                            value={assignedManager}
                                            onChange={handleChangeAssignedManager}
                                            input={<BootstrapInput />}
                                            fullWidth
                                            /*disabled={status === "Valider"}*/
                                        >
                                            <option value="">No agent assigned</option>
                                            {
                                                assignees.map((row: any, i: number) => (
                                                    <option key={"assigneeId-"+i} value={String(row.id)}>{row.name}</option>
                                                ))
                                            }
                                        </NativeSelect>
                                        <Button variant="contained" color="inherit" sx={whiteButtonStyles} style={{ marginRight: "10px" }} onClick={assignManager} >Update the manager</Button>
                                        <Button variant="contained" color="inherit" sx={whiteButtonStyles} onClick={removeManager} >Remove the manager</Button>
                                    </> : <Skeleton sx={{ mt: 3 }} />   
                                }
                            </Grid>
                            <Grid item xs={12}>
                                <Button variant="contained" color="primary" sx={{ mt: 2, mr: 2, textTransform: "none" }} onClick={editRequest} >Edit the request</Button>
                                <Button variant="contained" color="inherit" sx={whiteButtonStyles} onClick={() => { setModal2(true); }} >Change the status</Button>
                                <Button variant="contained" color="inherit" sx={whiteButtonStyles} style={{ float: "right" }} onClick={() => { setModal3(true); }} >Add a comment/note</Button>
                                <Button variant="contained" color="inherit" sx={whiteButtonStyles} style={{ float: "right", marginRight: "10px" }} onClick={() => { setModal4(true); getNotes(id); }} >List of notes</Button>
                                <Button 
                                    variant="contained" color="success" 
                                    sx={{ mt: 2, mr: 2, textTransform: "none" }} 
                                    style={{ float: "right", marginRight: "10px" }} 
                                    onClick={() => { 
                                        setModal5(true);
                                        console.log("Containers", containers);
                                        console.log("Containers selection", containersSelection);
                                        console.log("Containers selected", containersSelected);
                                        setContainersSelected(containersSelection.map((elm: any) => elm.container));
                                    }}
                                >
                                    Generate price offer
                                </Button>
                            </Grid>
                        </Grid> : <Skeleton sx={{ mx: 5, mt: 3 }} />
                    }
                </Box>
            </Box>
            
            {/* Ask for informations */}
            <BootstrapDialog
                onClose={() => setModal(false)}
                aria-labelledby="custom-dialog-title"
                open={modal}
                maxWidth="md"
                fullWidth
            >
                <BootstrapDialogTitle id="custom-dialog-title" onClose={() => setModal(false)}>
                    <b>Ask for informations</b>
                </BootstrapDialogTitle>
                <DialogContent dividers>
                    <Typography variant="subtitle1" gutterBottom px={2}>
                        Please fill in the form and click the button to send your message.
                    </Typography>
                    <Grid container spacing={2} mt={1} px={2}>
                        <Grid item xs={12}>
                            <InputLabel htmlFor="mail-subject" sx={inputLabelStyles}>Subject</InputLabel>
                            <BootstrapInput id="mail-subject" type="text" inputProps={{ min: 0, max: 100 }} value={mailSubject} onChange={(e: any) => {console.log(e); setMailSubject(e.target.value)}} fullWidth />
                        </Grid>
                        <Grid item xs={12} mt={1}>
                            <InputLabel htmlFor="mail-content" sx={inputLabelStyles}>Content</InputLabel>
                            <BootstrapInput id="mail-content" type="text" multiline rows={4} value={mailContent} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setMailContent(e.target.value)} fullWidth />
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions>
                    <Button variant="contained" color={!load ? "primary" : "info"} className="mr-3" onClick={askInformations} disabled={load === true} sx={{ textTransform: "none" }}>Send</Button>
                    <Button variant="contained" onClick={() => setModal(false)} sx={buttonCloseStyles}>Close</Button>
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
                    <b>Change the request status</b>
                </BootstrapDialogTitle>
                <DialogContent dividers>
                    <Typography variant="subtitle1" gutterBottom px={2}>
                        Please choose of the following options as the status of the request.
                    </Typography>
                    <Grid container spacing={2} mt={1} px={2}>
                        <Grid item xs={12}>
                            <FormControl>
                                <FormLabel id="demo-controlled-radio-buttons-group" sx={{ color: "#333" }}>Status list</FormLabel>
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
                            <InputLabel htmlFor="status-message" sx={inputLabelStyles}>Status message (this message will be sent to the requester, leave empty to not send a mail)</InputLabel>
                            <BootstrapInput id="status-message" type="text" multiline rows={4} value={statusMessage} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setStatusMessage(e.target.value)} fullWidth />
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions>
                    <Button variant="contained" color={!load ? "primary" : "info"} className="mr-3" onClick={changeStatusRequest} disabled={load === true} sx={{ textTransform: "none" }}>Validate</Button>
                    <Button variant="contained" onClick={() => setModal2(false)} sx={buttonCloseStyles}>Close</Button>
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
                    <b>Add a comment/note</b>
                </BootstrapDialogTitle>
                <DialogContent dividers>
                    <Typography variant="subtitle1" gutterBottom px={2}>
                        Please fill in the field below and click the button to add note.
                    </Typography>
                    <Grid container spacing={2} mt={1} px={2}>
                        <Grid item xs={12} mt={1}>
                            <InputLabel htmlFor="general-note" sx={inputLabelStyles}>General note</InputLabel>
                            <BootstrapInput id="general-note" type="text" multiline rows={4} value={generalNote} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setGeneralNote(e.target.value)} fullWidth />
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions>
                    <Button variant="contained" color={!load ? "primary" : "info"} className="mr-3" onClick={addRequestNote} disabled={load === true} sx={{ textTransform: "none" }}>Validate</Button>
                    <Button variant="contained" onClick={() => setModal3(false)} sx={buttonCloseStyles}>Close</Button>
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
                    <b>List of notes of request N° {id}</b>
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
                                                <TableCell align="left" sx={{ fontSize: 16, fontWeight: "bolder" }}>Id</TableCell>
                                                <TableCell align="left" sx={{ fontSize: 16, fontWeight: "bolder" }}>Content</TableCell>
                                                <TableCell align="left" sx={{ fontSize: 16, fontWeight: "bolder" }}>Date</TableCell>
                                                {/* <TableCell align="left" sx={{ fontSize: 16, fontWeight: "bolder" }}>Request id</TableCell> */}
                                                <TableCell align="left" sx={{ fontSize: 16, fontWeight: "bolder" }}>Note type</TableCell>
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
                                                            <DarkTooltip title="Delete this note" placement="right" arrow>
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
                    <Button variant="contained" onClick={() => setModal4(false)} sx={buttonCloseStyles}>Close</Button>
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
                    <b>Generate a price offer</b>
                </BootstrapDialogTitle>
                <DialogContent dividers>
                    <Box sx={{ width: '100%' }}>
                        <Stepper activeStep={activeStep}>
                            {steps.map((label, index) => {
                            const stepProps: { completed?: boolean } = {};
                            const labelProps: {
                                optional?: React.ReactNode;
                            } = {};
                            if (isStepOptional(index)) {
                                labelProps.optional = (
                                <Typography variant="caption">Optional</Typography>
                                );
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
                                {/* <Typography sx={{ mt: 2, mb: 1 }}>Step {activeStep + 1}</Typography> */}
                                {
                                    activeStep === 0 ?
                                    <Grid container spacing={2} mt={1} px={2}>
                                        <Grid item xs={6} mt={1}>
                                            <InputLabel htmlFor="departure-date" sx={inputLabelStyles}>Departure date</InputLabel>
                                            <LocalizationProvider dateAdapter={AdapterDayjs}>
                                                <DateTimePicker 
                                                    value={departureDate} 
                                                    onChange={(value: any) => { setDepartureDate(value) }}
                                                    slotProps={{ textField: { id: "departure-date", fullWidth: true, sx: datetimeStyles }, inputAdornment: { sx: { position: "relative", right: "11.5px" } } }}
                                                />
                                            </LocalizationProvider>
                                        </Grid>
                                        <Grid item xs={6} mt={1}>
                                            <InputLabel htmlFor="request-containerss" sx={inputLabelStyles}>Containers</InputLabel>
                                            {
                                                containers !== null ?
                                                <Select
                                                    // labelId="request-containers"
                                                    id="request-containers"
                                                    multiple
                                                    value={containersSelected}
                                                    onChange={handleChangeContainers}
                                                    input={<BootstrapInput />}
                                                    renderValue={(selected) => {
                                                        return getPackageNamesByIds(selected, containers).join(', ');
                                                    }}
                                                    disabled
                                                    fullWidth
                                                >
                                                    {containers.map((item: any, i: number) => (
                                                        <MenuItem key={"container-"+i} value={item.packageId}>
                                                            <Checkbox checked={containersSelected.indexOf(item.packageId) > -1} />
                                                            <ListItemText primary={item.packageName} />
                                                        </MenuItem>
                                                    ))}
                                                </Select>
                                                : <Skeleton />
                                            }
                                        </Grid>
                                        <Grid item xs={6} mt={1}>
                                            <InputLabel htmlFor="port-departure" sx={inputLabelStyles}>Departure port</InputLabel>
                                            {
                                                ports !== null ?
                                                <Autocomplete
                                                    disablePortal
                                                    id="port-departure"
                                                    options={ports}
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
                                                    renderInput={(params) => <TextField {...params} />}
                                                    onChange={(e: any, value: any) => { setPortDeparture(value); }}
                                                    fullWidth
                                                /> : <Skeleton />
                                            }
                                        </Grid>
                                        <Grid item xs={6} mt={1}>
                                            <InputLabel htmlFor="destination-port" sx={inputLabelStyles}>Destination port</InputLabel>
                                            {
                                                ports !== null ?
                                                <Autocomplete
                                                    disablePortal
                                                    id="destination-port"
                                                    options={ports}
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
                                                    value={destinationPort}
                                                    sx={{ mt: 1 }}
                                                    renderInput={(params) => <TextField {...params} />}
                                                    onChange={(e: any, value: any) => { setDestinationPort(value); }}
                                                    fullWidth
                                                /> : <Skeleton />
                                            }
                                        </Grid>
                                        <Grid item xs={6} mt={1}>
                                            <InputLabel htmlFor="loading-date" sx={inputLabelStyles}>Loading date</InputLabel>
                                            <LocalizationProvider dateAdapter={AdapterDayjs}>
                                                <DateTimePicker 
                                                    value={loadingDate} 
                                                    onChange={(value: any) => { setLoadingDate(value) }}
                                                    slotProps={{ textField: { id: "loading-date", fullWidth: true, sx: datetimeStyles }, inputAdornment: { sx: { position: "relative", right: "11.5px" } } }}
                                                />
                                            </LocalizationProvider>
                                        </Grid>
                                        <Grid item xs={6} mt={1}>
                                            <InputLabel htmlFor="loading-city" sx={inputLabelStyles}>Loading city (empty if no haulage)</InputLabel>
                                            {
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
                                                    renderInput={(params) => <TextField {...params} />}
                                                    onChange={(e: any, value: any) => { setLoadingCity(value); }}
                                                    fullWidth
                                                /> : <Skeleton />
                                            }
                                        </Grid>
                                        <Grid item xs={6} mt={1}>
                                            <InputLabel htmlFor="haulage-type" sx={inputLabelStyles}>Haulage type (loading timing)</InputLabel>
                                            <NativeSelect
                                                id="haulage-type"
                                                value={haulageType}
                                                onChange={handleChangeHaulageType}
                                                input={<BootstrapInput />}
                                                fullWidth
                                            >
                                                <option key={"kdq-"} value="">Any type</option>
                                                {
                                                    haulageTypes.map((item: any, i: number) => (
                                                        <option key={"kdq"+i} value={item}>{item}</option>
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
                                            <Alert severity="info" sx={{ mb: 2 }}>You can select an offer by clicking on his row. You have to select at least one seafreight for your offer.</Alert>
                                            {
                                                !loadResults ? 
                                                seafreights !== null && seafreights.length !== 0 ?
                                                    <Box>
                                                        <Typography variant="h5" sx={{ my: 2, fontSize: 19, fontWeight: "bold" }}>List of sea freights pricing offers</Typography>
                                                        <DataGrid
                                                            rows={seafreights}
                                                            columns={columnsSeafreights}
                                                            hideFooter
                                                            getRowId={(row) => row?.seaFreightId}
                                                            getRowHeight={() => "auto" }
                                                            sx={{ height: "auto" }}
                                                            onRowClick={handleRowSeafreightsClick}
                                                            // checkboxSelection
                                                        />
                                                    </Box>
                                                    : null
                                                : <Skeleton />
                                            }
                                            {
                                                !loadResults ? 
                                                haulages !== null && haulages.length !== 0 ?
                                                    <Box>
                                                        <Typography variant="h5" sx={{ my: 2, fontSize: 19, fontWeight: "bold" }}>List of haulages pricing offers</Typography>
                                                        <DataGrid
                                                            rows={haulages}
                                                            columns={columnsHaulages}
                                                            hideFooter
                                                            getRowId={(row) => row?.id}
                                                            getRowHeight={() => "auto" }
                                                            sx={{ height: "auto" }}
                                                            onRowClick={handleRowHaulagesClick}
                                                            // checkboxSelection
                                                        />
                                                    </Box>
                                                    : null
                                                : <Skeleton />
                                            }
                                            {
                                                !loadResults ? 
                                                miscs !== null && miscs.length !== 0 ?
                                                    <Box>
                                                        <Typography variant="h5" sx={{ my: 2, fontSize: 19, fontWeight: "bold" }}>List of miscellaneous pricing offers</Typography>
                                                        <DataGrid
                                                            rows={miscs}
                                                            columns={columnsMiscs}
                                                            hideFooter
                                                            getRowId={(row) => row?.id}
                                                            getRowHeight={() => "auto" }
                                                            sx={{ height: "auto" }}
                                                            onRowClick={handleRowMiscsClick}
                                                            // checkboxSelection
                                                        />
                                                    </Box>
                                                    : null
                                                : <Skeleton />
                                            }
                                        </Grid>
                                    </Grid> : null
                                }
                                {
                                    activeStep === 2 ?
                                    <Grid container spacing={2} mt={1} px={2}>
                                        <Grid item xs={12}>
                                            <Typography variant="h5" sx={{ my: 2, fontSize: 19, fontWeight: "bold" }}>Selected sea freight</Typography>
                                            <DataGrid
                                                rows={[selectedSeafreight]}
                                                columns={columnsSeafreights}
                                                hideFooter
                                                getRowId={(row) => row?.seaFreightId}
                                                getRowHeight={() => "auto" }
                                                sx={{ height: "auto" }}
                                                isRowSelectable={(params) => false}
                                                // onRowClick={handleRowSeafreightsClick}
                                                // checkboxSelection
                                            />
                                        </Grid>
                                        {
                                            selectedHaulage !== null ? 
                                            <Grid item xs={12}>
                                                <Typography variant="h5" sx={{ my: 2, fontSize: 19, fontWeight: "bold" }}>Selected haulage</Typography>
                                                <DataGrid
                                                    rows={[selectedHaulage]}
                                                    columns={columnsHaulages}
                                                    hideFooter
                                                    getRowId={(row) => row?.id}
                                                    getRowHeight={() => "auto" }
                                                    sx={{ height: "auto" }}
                                                    isRowSelectable={(params) => false}
                                                    //onRowClick={handleRowSeafreightsClick}
                                                    // checkboxSelection
                                                />
                                            </Grid> : null
                                        }
                                        {
                                            selectedMisc !== null ? 
                                            <Grid item xs={12}>
                                                <Typography variant="h5" sx={{ my: 2, fontSize: 19, fontWeight: "bold" }}>Selected miscellaneous</Typography>
                                                <DataGrid
                                                    rows={[selectedMisc]}
                                                    columns={columnsMiscs}
                                                    hideFooter
                                                    getRowId={(row) => row?.id}
                                                    getRowHeight={() => "auto" }
                                                    sx={{ height: "auto" }}
                                                    isRowSelectable={(params) => false}
                                                    //onRowClick={handleRowSeafreightsClick}
                                                    // checkboxSelection
                                                />
                                            </Grid> : null
                                        }
                                        <Grid item xs={4}>
                                            <InputLabel htmlFor="margin" sx={inputLabelStyles}>Margin (in %)</InputLabel>
                                            <BootstrapInput id="margin" type="number" value={margin} onChange={(e: any) => setMargin(e.target.value)} fullWidth />
                                        </Grid>
                                        <Grid item xs={4}>
                                            <InputLabel htmlFor="reduction" sx={inputLabelStyles}>Reduction (in %)</InputLabel>
                                            <BootstrapInput id="reduction" type="number" value={reduction} onChange={(e: any) => setReduction(e.target.value)} fullWidth />
                                        </Grid>
                                        <Grid item xs={4}>
                                            <InputLabel htmlFor="adding" sx={inputLabelStyles}>Extra Fee (in {selectedSeafreight !== null ? selectedSeafreight.currency : null})</InputLabel>
                                            <BootstrapInput id="adding" type="number" value={adding} onChange={(e: any) => setAdding(e.target.value)} fullWidth />
                                        </Grid>
                                        <Grid item xs={12}>
                                            <InputLabel htmlFor="details" sx={inputLabelStyles}>Details of the offer</InputLabel>
                                            <BootstrapInput id="details" type="text" multiline rows={3} value={details} onChange={(e: any) => setDetails(e.target.value)} fullWidth />
                                        </Grid>
                                        <Grid item xs={12}>
                                            <Typography variant="h6">
                                                { 
                                                    selectedSeafreight !== null ? 
                                                    <Chip variant="outlined" size="medium"
                                                        label={"TOTAL PRICE : "+ Number(totalPrice+totalPrice*margin/100-totalPrice*reduction/100+adding*1).toString()+" "+selectedSeafreight.currency}
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
                                        Back
                                    </Button>
                                    <Box sx={{ flex: '1 1 auto' }} />
                                    {isStepOptional(activeStep) && (
                                    <Button variant="contained" color="inherit" sx={whiteButtonStyles} onClick={handleSkip}>
                                        Skip
                                    </Button>
                                    )}
                                    <Button variant="contained" color="inherit" sx={whiteButtonStyles} onClick={handleNext}>
                                        {activeStep === steps.length - 1 ? 'Send the offer to validation' : 'Next step'}
                                    </Button>
                                </Box>
                            </React.Fragment>
                        )}
                    </Box>
                </DialogContent>
                <DialogActions>
                    {/* <Button variant="contained" color={!load ? "primary" : "info"} className="mr-3" onClick={() => { getPriceRequests(); }} sx={{ textTransform: "none" }}>Generate the offer</Button> */}
                    <Button variant="contained" onClick={() => setModal5(false)} sx={buttonCloseStyles}>Close</Button>
                </DialogActions>
            </BootstrapDialog>
        </div>
    );
}

export default Request;
