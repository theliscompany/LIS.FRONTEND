import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Box, Button, Skeleton, Typography } from '@mui/material';
import Grid from '@mui/material/Grid2';
import { BootstrapDialog, whiteButtonStyles } from '../../utils/misc/styles';
import { enqueueSnackbar, SnackbarProvider } from 'notistack';
import { useTranslation } from 'react-i18next';
import { arePhoneticallyClose, complexEquality, findClosestSeaPort, parseContact2, parseLocation, similar, sortByCloseness } from '../../utils/functions';
import { containerPackages } from '../../utils/constants';
// @ts-ignore
import { JSON as seaPorts } from 'sea-ports';
import GeneratePriceOffer from '../../components/request/GeneratePriceOffer';
import RequestForm from '../../components/request/RequestForm';
import AddContainer from '../../components/request/AddContainer';
import RequestFormHeader from '../../components/request/RequestFormHeader';
import { getApiAssignee, getApiHsCodeLis, getApiRequestById, putApiRequestById } from '../../api/client/quote';
import { getPorts, getProduct } from '../../api/client/transport';


const Request = () => {
    // const [load, setLoad] = useState<boolean>(false);
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
    const [tags, setTags] = useState<any[]>([]);
    const [modal10, setModal10] = useState<boolean>(false);
    const [assignedManager, setAssignedManager] = useState<string>("");
    const [assignees, setAssignees] = useState<any>(null);
    const [containerType, setContainerType] = useState<string>("20' Dry");
    const [quantity, setQuantity] = useState<number>(1);
    const [containersSelection, setContainersSelection] = useState<any>([]);
    const [unitsSelection, setUnitsSelection] = useState<any>([]);
    // const [packagesSelection, setPackagesSelection] = useState<any>([]);
    const [portDestination, setPortDestination] = useState<any>(null);
    // const [portDeparture, setPortDeparture] = useState<any>(null);
    const [loadingCity, setLoadingCity] = useState<any>(null);
    const [products, setProducts] = useState<any>(null);
    const [hscodes, setHSCodes] = useState<any>(null);
    const [ports, setPorts] = useState<any>(null);
    const [ports1, setPorts1] = useState<any>(null);
    const [ports2, setPorts2] = useState<any>(null);
    const [containers, setContainers] = useState<any>(null);
    
    const [canEdit, setCanEdit] = useState<boolean>(true);
    const [valueSpecifics, setValueSpecifics] = useState<string>("products");
    
    let { id } = useParams();
    const navigate = useNavigate();
    
    const { t } = useTranslation();
    
    function initializeSeaPorts() {
        var auxArray = [];
        for (const [_, value] of Object.entries(seaPorts)) {
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
        // console.log(allMySeaPorts);
        const updatedLisPorts = selectedPorts.map((lisPort: any) => {
            // console.log(lisPort);
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
        getPortsService();
        getProductsService();
        getHSCodes();
    }, []);
    
    useEffect(() => {
        if (hscodes !== null && products !== null) {
            loadRequest();
        }
    }, [products, hscodes]);

    useEffect(() => {
        if (ports !== null && products !== null && requestData !== null) {
            // const closestDeparturePort = findClosestSeaPort(parseLocation(requestData.departure), ports);
            const closestArrivalPort = findClosestSeaPort(parseLocation(requestData.arrival), ports);
            // setPortDeparture(closestDeparturePort);
            setPortDestination(closestArrivalPort);
            setPorts1(sortByCloseness(parseLocation(requestData.departure), ports));
            setPorts2(sortByCloseness(parseLocation(requestData.arrival), ports));
        }
    }, [ports, products, requestData]);

    const getAssignees = async () => {
        try {
            setLoadAssignees(true);
            const response: any = await getApiAssignee();
            if (response !== null && response !== undefined) {
                setAssignees(response.data.data);
                setLoadAssignees(false);
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
    
    const getContainers = async () => {
        setContainers(containerPackages);
    }
    
    const getPortsService = async () => {
        try {
            const response = await getPorts({query: { pageSize: 2000 }});
            console.log(response);
            if (response !== null && response !== undefined) {
                var addedCoordinatesPorts = addedCoordinatesToPorts(response.data);
                setPorts(addedCoordinatesPorts);
            }
        }
        catch (err: any) {
            console.log(err);
        }
    }
    
    const getProductsService = async () => {
        try {
            const response = await getProduct({query: { pageSize: 500 }});
            if (response !== null && response !== undefined) {
                setProducts(response.data);
            }   
        }
        catch (err: any) {
            console.log(err);
        }
    }

    const getHSCodes = async () => {
        try {
            const response = await getApiHsCodeLis();
            if (response !== null && response !== undefined) {
                setHSCodes(response.data);
            }
        }
        catch (err: any) {
            console.log(err);
        }
    }

    const loadRequest = async () => {
        try {
            const response: any = await getApiRequestById({path: {id: Number(id)}});
            if (response !== null && response !== undefined) {
                console.log("Saved : ", response.data.data);
                // Parse the saved data string into an array of IDs
                const savedDataArray = response.data.data.tags !== null ? response.data.data.tags.split(',').map(Number) : [];
                // Filter the possibleObjects array to only include objects with matching hS_Code
                const filteredObjects = hscodes.filter((obj: any) => savedDataArray.includes(obj.hS_Code));
                console.log("Array of objs : ", filteredObjects);
                if (filteredObjects.length !== 0) {
                    console.log("HSCODES!!!!");
                    setValueSpecifics("hscodes");
                    setTags(filteredObjects);
                }
                else {
                    console.log("PRODUCTS!!!!");
                    setTags(response.data.data.tags !== null ? products.filter((elm: any) => response.data.data.tags.includes(elm.productName)) : []);
                }
                
                setRequestData(response.data.data);
                setEmail(response.data.data.email);
                setPhone(response.data.data.whatsapp);
                setDeparture(parseLocation(response.data.data.departure));
                setArrival(parseLocation(response.data.data.arrival));
                setLoadingCity(parseLocation(response.data.data.departure));
                setStatus(response.data.data.status);
                setPackingType(response.data.data.packingType !== null ? response.data.data.packingType : "FCL");
                setClientNumber(response.data.data.clientNumber !== null && response.data.data.clientNumber !== "" ? parseContact2(response.data.data.clientNumber) : "");
                setContainersSelection(response.data.data.containers.map((elm: any) => { return {
                    id: elm.id,
                    container: elm.containers, 
                    quantity: elm.quantity 
                } }) || []);
                setUnitsSelection(response.data.data.units.map((elm: any) => { return {
                    name: elm.name,
                    weight: elm.weight,
                    dimensions: elm.dimension,
                    quantity: elm.quantity
                }}) || []);
                setQuantity(response.data.data.quantity);
                setMessage(response.data.data.detail);
                setAssignedManager(response.data.data.assigneeId !== null && response.data.data.assigneeId !== "" ? response.data.data.assigneeId : "");
                setTrackingNumber(response.data.data.trackingNumber);                        
                // setLoad(false);
            }
            else {
                // setLoad(false);
            }
        }
        catch (e: any) {
            console.log(e);
            // setLoad(false);
        }
    }
    
    const editRequest = async () => {
        var tags1 = tags !== null && tags !== undefined && tags.length !== 0 ? tags.map((elm: any) => elm.productName).join(',') : null;
        var tags2 = tags !== null && tags !== undefined && tags.length !== 0 ? tags.map((elm: any) => elm.hS_Code).join(',') : null;
            
        var auxUnits = [];
        if (packingType === "Breakbulk/LCL") {
            // auxUnits = packagesSelection;
        }
        else if (packingType === "Unit RoRo") {
            auxUnits = unitsSelection;
        }
        
        try {
            var postcode1 = departure.postalCode !== null && departure.postalCode !== undefined ? departure.postalCode : "";
            var postcode2 = arrival.postalCode !== null && arrival.postalCode !== undefined ? arrival.postalCode : "";
            console.log("Prods :", tags1);
            console.log("Codes :", tags2);
            
            const body: any = {
                id: Number(id),
                email: email,
                status: status,
                whatsapp: phone,
                departure: departure !== null && departure !== undefined ? [departure.city.toUpperCase(),departure.country,departure.latitude,departure.longitude,postcode1].filter((val: any) => { return val !== "" }).join(', ') : "",
                arrival: arrival !== null && arrival !== undefined ? [arrival.city.toUpperCase(),arrival.country,arrival.latitude,arrival.longitude,postcode2].filter((val: any) => { return val !== "" }).join(', ') : "",
                cargoType: 0,
                packingType: packingType,
                containers: containersSelection.map((elm: any) => { return { 
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
                tags: valueSpecifics !== "hscodes" ? tags1 : tags2,
                assigneeId: Number(assignedManager)
            };

            const data = await putApiRequestById({path: {id: Number(id)}, body: body});
            if (data?.data) {
                enqueueSnackbar(t('requestEditedSuccess'), { variant: "success", anchorOrigin: { horizontal: "right", vertical: "top"} });
            }
            else {
                enqueueSnackbar(t('errorHappened'), { variant: "error", anchorOrigin: { horizontal: "right", vertical: "top"} });
            }
        }
        catch (err: any) {
            console.log(err);
        }
    }

    function getClosestDeparture(value: any) {
        if (value !== null && value !== undefined) {
            // const closest = findClosestSeaPort(value, ports);
            // setPortDeparture(closest);
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
                            getPorts={getPortsService} getProducts={getProductsService}
                        /> 
                        
                        {/* Request Form COMPONENT */}
                        <RequestForm 
                            id={id} assignedManager={assignedManager} setAssignedManager={setAssignedManager}
                            assignees={assignees} loadAssignees={loadAssignees}
                            message={message} setMessage={setMessage}
                            phone={phone} setPhone={setPhone}
                            packingType={packingType} containers={containers}
                            clientNumber={clientNumber} setClientNumber={setClientNumber}
                            departure={departure} setDeparture={setDeparture} arrival={arrival} setArrival={setArrival} 
                            email={email} setEmail={setEmail} tags={tags} setTags={setTags}
                            canEdit={canEdit} setCanEdit={setCanEdit}
                            containersSelection={containersSelection} setContainersSelection={setContainersSelection}
                            getClosestDeparture={getClosestDeparture} getClosestArrival={getClosestArrival}
                            products={products} hscodes={hscodes} 
                            valueSpecifics={valueSpecifics} openModalContainer={() => setModal10(true)}
                        />
                        
                        {/* Generate Price Offer COMPONENT */}
                        {
                            ports1 !== null && ports2 !== null && ports !== null && products !== null && requestData !== null ? 
                            <GeneratePriceOffer
                                id={id} email={email} tags={tags} clientNumber={clientNumber}
                                departure={departure} setDeparture={setDeparture}
                                loadingCity={loadingCity} setLoadingCity={setLoadingCity}
                                portDestination={portDestination} setPortDestination={setPortDestination}
                                containersSelection={containersSelection}
                                ports={ports} products={products} hscodes={hscodes}
                                ports1={ports1} ports2={ports2}
                                containers={containers} status={status}
                                canEdit={canEdit} setCanEdit={setCanEdit}
                                requestData={requestData} type="standard"
                                commodities={valueSpecifics === "products" ? products : hscodes}
                            /> : <Grid size={{ xs: 12 }}><Skeleton /></Grid>
                        }

                        <Grid size={{ xs: 12 }}>
                            <Button variant="contained" color="inherit" sx={whiteButtonStyles} onClick={() => { navigate("/requests"); }} >Save and close</Button>
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
