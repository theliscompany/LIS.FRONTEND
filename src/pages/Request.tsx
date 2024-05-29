import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Box, Button, Grid, Skeleton, Typography } from '@mui/material';
import { BootstrapDialog, whiteButtonStyles } from '../utils/misc/styles';
import { enqueueSnackbar, SnackbarProvider } from 'notistack';
import { protectedResources } from '../config/authConfig';
import { useAuthorizedBackendApi } from '../api/api';
import { BackendService } from '../utils/services/fetch';
import { MuiChipsInputChip } from 'mui-chips-input';
import { useAccount, useMsal } from '@azure/msal-react';
import { useTranslation } from 'react-i18next';
import { arePhoneticallyClose, complexEquality, findClosestSeaPort, parseContact, parseLocation, similar, sortByCloseness } from '../utils/functions';
import { containerPackages } from '../utils/constants';
// @ts-ignore
import { JSON as seaPorts } from 'sea-ports';
import GeneratePriceOffer from '../components/editRequestPage/GeneratePriceOffer';
import RequestForm from '../components/editRequestPage/RequestForm';
import AddContainer from '../components/editRequestPage/AddContainer';
import RequestFormHeader from '../components/editRequestPage/RequestFormHeader';
import { useSelector } from 'react-redux';
import { useAppDispatch } from '../store';
import { fetchAssignees, fetchPorts, fetchProducts } from '../store/masterdata.slice';
// @ts-ignore

// let packingOptions = ["Unit", "Bundle", "Bag", "Pallet", "Carton", "Lot", "Crate"];

function Request() {
    const [load, setLoad] = useState<boolean>(false);
    const [loadAssignees, setLoadAssignees] = useState<boolean>(true);
    const [requestData, setRequestData] = useState<any>(null);
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
    const [modal10, setModal10] = useState<boolean>(false);
    
    const [assignedManager, setAssignedManager] = useState<string>("");
    const [assignees, setAssignees] = useState<any>(null);
    
    const [containerType, setContainerType] = useState<string>("20' Dry");
    const [quantity, setQuantity] = useState<number>(1);
    const [containersSelection, setContainersSelection] = useState<any>([]);
    
    const [unitsSelection, setUnitsSelection] = useState<any>([]);

    const [packagesSelection, setPackagesSelection] = useState<any>([]);
    
    const [portDestination, setPortDestination] = useState<any>(null);
    const [portDeparture, setPortDeparture] = useState<any>(null);
    const [loadingCity, setLoadingCity] = useState<any>(null);
    const [products, setProducts] = useState<any>(null);
    const [ports, setPorts] = useState<any>(null);
    const [ports1, setPorts1] = useState<any>(null);
    const [ports2, setPorts2] = useState<any>(null);
    const [containers, setContainers] = useState<any>(null);

    let { id } = useParams();
    const navigate = useNavigate();
    const { instance, accounts } = useMsal();
    const account = useAccount(accounts[0] || {});
    const context = useAuthorizedBackendApi();
    const { t } = useTranslation();
    
    var ourPorts: any = useSelector((state: any) => state.masterdata.ports);
    var ourProducts: any = useSelector((state: any) => state.masterdata.products);
    var ourAssignees: any = useSelector((state: any) => state.masterdata.assignees);
        
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
                    coordinates: result.coordinates,
                    distance: 0
                });
            }
        }
        return auxArray;
    }
    
    function addedCoordinatesToPorts(selectedPorts: any) {
        var allMySeaPorts = initializeSeaPorts();
        const updatedLisPorts = selectedPorts.map((lisPort: any) => {
            const matchingSeaPort = allMySeaPorts.find((seaPort: any) => 
                (complexEquality(seaPort.name.toUpperCase(), lisPort.portName.toUpperCase()) || similar(seaPort.name, lisPort.portName) 
                || (arePhoneticallyClose(seaPort.name.toUpperCase(), lisPort.portName.toUpperCase()) && complexEquality(seaPort.country.toUpperCase(), lisPort.country.toUpperCase()))));
            if (matchingSeaPort) {
                return { ...lisPort, name: matchingSeaPort.name, coordinates: matchingSeaPort.coordinates };
            }
            return lisPort;
        });
        
        return updatedLisPorts;
    }
    
    useEffect(() => {
        getContainers();
        getAssignees();
        getPorts();
        getProducts();
        loadRequest();
    }, [account, instance, context]);
    
    useEffect(() => {
        if (ports !== null && products !== null && requestData !== null) {
            setTags(requestData.tags !== null ? products.filter((elm: any) => requestData.tags.includes(elm.productName)) : []);
            const closestDeparturePort = findClosestSeaPort(parseLocation(requestData.departure), ports);
            const closestArrivalPort = findClosestSeaPort(parseLocation(requestData.arrival), ports);
            setPortDeparture(closestDeparturePort);
            setPortDestination(closestArrivalPort);
            setPorts1(sortByCloseness(parseLocation(requestData.departure), ports));
            setPorts2(sortByCloseness(parseLocation(requestData.arrival), ports));
        }
    }, [ports, products, requestData]);

    const getAssignees = async () => {
        if (account && instance && context) {
            if (ourAssignees !== undefined) {
                console.log(ourAssignees);
                setAssignees(ourAssignees.data);
                setLoadAssignees(false);
            }
            else {
                try {
                    setLoadAssignees(true);
                    const response = await (context?.service as BackendService<any>).getWithToken(protectedResources.apiLisQuotes.endPoint+"/Assignee", context.tokenLogin);
                    if (response !== null && response.code !== undefined) {
                        if (response.code === 200) {
                            setAssignees(response.data);
                            setLoadAssignees(false);
                        }
                        else {
                            setLoadAssignees(false);
                        }
                    }
                    else {
                        setLoadAssignees(false);
                    }   
                }
                catch (err: any) {
                    setLoadAssignees(false);
                    console.log(err);
                }
            }    
        }
    }
    
    const loadRequest = async () => {
        if (account && instance && context) {
            try {
                const response = await (context?.service as BackendService<any>).getWithToken(protectedResources.apiLisQuotes.endPoint+"/Request/"+id, context.tokenLogin);
                if (response !== null && response.code !== undefined) {
                    if (response.code === 200) {
                        setRequestData(response.data);
                        setEmail(response.data.email);
                        setPhone(response.data.whatsapp);
                        setDeparture(parseLocation(response.data.departure));
                        setArrival(parseLocation(response.data.arrival));
                        setLoadingCity(parseLocation(response.data.departure));
                        setStatus(response.data.status);
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
                        setAssignedManager(response.data.assigneeId !== null && response.data.assigneeId !== "" ? response.data.assigneeId : "");
                        setTrackingNumber(response.data.trackingNumber);                        
                        setLoad(false);
                    }
                    else {
                        setLoad(false);
                    }
                }
                else {
                    setLoad(false);
                }
            }
            catch (e: any) {
                console.log(e);
                setLoad(false);
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
        
        if (account && instance && context) {
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

            const data = await (context?.service as BackendService<any>).putWithToken(protectedResources.apiLisQuotes.endPoint+"/Request/"+id, body, context.tokenLogin);
            if (data?.status === 200) {
                enqueueSnackbar(t('requestEditedSuccess'), { variant: "success", anchorOrigin: { horizontal: "right", vertical: "top"} });
            }
            else {
                enqueueSnackbar(t('errorHappened'), { variant: "error", anchorOrigin: { horizontal: "right", vertical: "top"} });
            }
        }
    }

    const getContainers = async () => {
        setContainers(containerPackages);
    }
    
    const getPorts = async () => {
        if (account && instance && context) {
            if (ourPorts.length !== 0) {
                console.log(ourPorts);
                var addedCoordinatesPorts = addedCoordinatesToPorts(ourPorts);
                setPorts(addedCoordinatesPorts);
            }
            else {
                const response = await (context?.service as BackendService<any>).getWithToken(protectedResources.apiLisTransport.endPoint+"/Port/Ports?pageSize=2000", context.tokenTransport);
                if (response !== null && response !== undefined) {
                    var addedCoordinatesPorts = addedCoordinatesToPorts(response);
                    setPorts(addedCoordinatesPorts);
                    console.log(response);
                    console.log(addedCoordinatesPorts);
                }
            }
        }
        
        // if (account && instance && context) {
        //     const response = await (context?.service as BackendService<any>).getWithToken(protectedResources.apiLisTransport.endPoint+"/Port/Ports?pageSize=2000", context.tokenTransport);
        //     if (response !== null && response !== undefined) {
        //         var addedCoordinatesPorts = addedCoordinatesToPorts(response);
        //         setPorts(addedCoordinatesPorts);
        //         console.log(response);
        //         console.log(addedCoordinatesPorts);
        //     }  
        // }
    }
    
    const getProducts = async () => {
        if (account && instance && context) {
            if (ourProducts.length !== 0) {
                console.log(ourProducts);
                setProducts(ourProducts);    
            }
            else {
                const response = await (context?.service as BackendService<any>).getWithToken(protectedResources.apiLisTransport.endPoint+"/Product?pageSize=500", context.tokenTransport);
                if (response !== null && response !== undefined) {
                    setProducts(response);
                }      
            }    
        }
    }

    function getClosestDeparture(value: any) {
        if (value !== null && value !== undefined) {
            const closest = findClosestSeaPort(value, ports);
            setPortDeparture(closest);
            setLoadingCity(value);
            setPorts1(sortByCloseness(value, ports));
        }
    }

    function getClosestArrival(value: any) {
        if (value !== null && value !== undefined) {
            const closest = findClosestSeaPort(value, ports);
            setPortDestination(closest);
            setPorts2(sortByCloseness(value, ports));
        }
    }

    return (
        <div style={{ background: "#fff", borderTopLeftRadius: 20, borderTopRightRadius: 20 }}>
            <SnackbarProvider />
            <Box py={2.5}>
                <Typography variant="h5" sx={{mt: {xs: 4, md: 1.5, lg: 1.5 }}} mx={5}><b>{t('manageRequestQuote')} {id}</b></Typography>
                <Box>
                {
                    true ? // !load
                    true ? // clientNumber !== null
                    <Grid container spacing={2} mt={1} px={5}>
                        {/* Form Header COMPONENT */}
                        <RequestFormHeader 
                            id={id} email={email} status={status}
                            trackingNumber={trackingNumber} editRequest={editRequest}
                            getPorts={getPorts} getProducts={getProducts}
                        /> 
                        
                        {/* Request Form COMPONENT */}
                        {
                            context ? 
                            <RequestForm 
                                context={context} account={account} instance={instance}
                                id={id} tempToken={context.tokenLogin}
                                assignedManager={assignedManager} setAssignedManager={setAssignedManager}
                                assignees={assignees} loadAssignees={loadAssignees}
                                message={message} setMessage={setMessage}
                                phone={phone} setPhone={setPhone}
                                packingType={packingType} containers={containers}
                                clientNumber={clientNumber} setClientNumber={setClientNumber}
                                departure={departure} setDeparture={setDeparture}
                                arrival={arrival} setArrival={setArrival} 
                                email={email} setEmail={setEmail}
                                tags={tags} setTags={setTags}
                                containersSelection={containersSelection} setContainersSelection={setContainersSelection}
                                getClosestDeparture={getClosestDeparture} getClosestArrival={getClosestArrival}
                                products={products} openModalContainer={() => setModal10(true)}
                            /> : null
                        }
                        
                        {/* Generate Price Offer COMPONENT */}
                        {
                            ports1 !== null && ports2 !== null && ports !== null && products !== null && requestData !== null ? 
                            <GeneratePriceOffer
                                context={context} account={account} instance={instance} id={id}
                                email={email} tags={tags} clientNumber={clientNumber}
                                departure={departure} setDeparture={setDeparture}
                                loadingCity={loadingCity} setLoadingCity={setLoadingCity}
                                portDestination={portDestination} setPortDestination={setPortDestination}
                                containersSelection={containersSelection}
                                ports={ports} products={products}
                                ports1={ports1} ports2={ports2}
                                containers={containers} status={status}
                                requestData={requestData} type="standard"
                            />
                            : <Grid item xs={12}><Skeleton /></Grid>
                        }

                        <Grid item xs={12}>
                            <Button variant="contained" color="inherit" sx={whiteButtonStyles} onClick={() => { navigate("/admin/requests"); }} >Save and close</Button>
                        </Grid>
                    </Grid> : null
                    : <Skeleton sx={{ mx: 5, mt: 3 }} />
                }
                </Box>
            </Box>
            
            {/* New container type */}
            <BootstrapDialog open={modal10} onClose={() => setModal10(false)} maxWidth="lg" fullWidth>
                <AddContainer 
                    containers={containers} closeModal={() => setModal10(false)}
                    packingType={packingType} setPackingType={setPackingType}
                    containerType={containerType} setContainerType={setContainerType}
                    quantity={quantity} setQuantity={setQuantity}
                    setContainersSelection={setContainersSelection}
                />
            </BootstrapDialog>
        </div>
    );
}

export default Request;
