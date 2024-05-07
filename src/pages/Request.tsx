import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Alert, Box, Button, DialogActions, DialogContent, Grid, InputLabel, NativeSelect, Skeleton, Typography } from '@mui/material';
import { inputLabelStyles, BootstrapInput, BootstrapDialog, whiteButtonStyles, BootstrapDialogTitle, buttonCloseStyles } from '../utils/misc/styles';
import { enqueueSnackbar, SnackbarProvider } from 'notistack';
import { protectedResources } from '../config/authConfig';
import { useAuthorizedBackendApi } from '../api/api';
import { BackendService } from '../utils/services/fetch';
import { MuiChipsInputChip } from 'mui-chips-input';
import { useAccount, useMsal } from '@azure/msal-react';
import { useTranslation } from 'react-i18next';
import RequestListNotes from '../components/editRequestPage/RequestListNotes';
import RequestAddNote from '../components/editRequestPage/RequestAddNote';
import RequestAskInformation from '../components/editRequestPage/RequestAskInformation';
import RequestChangeStatus from '../components/editRequestPage/RequestChangeStatus';
import { arePhoneticallyClose, complexEquality, findClosestSeaPort, parseContact, parseLocation, similar, sortByCloseness } from '../utils/functions';
import NewContact from '../components/editRequestPage/NewContact';
import { containerPackages } from '../utils/constants';
// @ts-ignore
import { JSON as seaPorts } from 'sea-ports';
import GeneratePriceOffer from '../components/editRequestPage/GeneratePriceOffer';
import NewPort from '../components/shared/NewPort';
import RequestForm from '../components/editRequestPage/RequestForm';
import NewProduct from '../components/shared/NewProduct';
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
    const [modal, setModal] = useState<boolean>(false);
    const [modal2, setModal2] = useState<boolean>(false);
    const [modal3, setModal3] = useState<boolean>(false);
    const [modal4, setModal4] = useState<boolean>(false);
    const [modal7, setModal7] = useState<boolean>(false);
    const [modal8, setModal8] = useState<boolean>(false);
    const [modal9, setModal9] = useState<boolean>(false);
    const [modal10, setModal10] = useState<boolean>(false);
    const [modal11, setModal11] = useState<boolean>(false);
    
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
    }, [ports, products]);

    const getAssignees = async () => {
        if (account && instance && context) {
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
            const response = await (context?.service as BackendService<any>).getWithToken(protectedResources.apiLisTransport.endPoint+"/Port/Ports?pageSize=2000", context.tokenTransport);
            if (response !== null && response !== undefined) {
                var addedCoordinatesPorts = addedCoordinatesToPorts(response);
                setPorts(addedCoordinatesPorts);
                console.log(response);
                console.log(addedCoordinatesPorts);
            }  
        }
    }
    
    const getProducts = async () => {
        if (account && instance && context) {
            const response = await (context?.service as BackendService<any>).getWithToken(protectedResources.apiLisTransport.endPoint+"/Product?pageSize=500", context.tokenTransport);
            if (response !== null && response !== undefined) {
                setProducts(response);
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
                        <Grid item xs={6}>
                            <Typography variant="body2" color="dodgerblue" sx={{ fontWeight: "bold" }}>
                                <span style={{ color: 'red' }}>{t('quoteNumber')} : </span> N° {trackingNumber}
                            </Typography>
                        </Grid>
                        <Grid item xs={6}>
                            <Button 
                                variant="contained" color="inherit" 
                                sx={{ float: "right", backgroundColor: "#fff", textTransform: "none", ml: 2 }} 
                                onClick={() => { setModal11(true); }}
                            >
                                {t('newProduct')}
                            </Button>
                            <Button 
                                variant="contained" color="inherit" 
                                sx={{ float: "right", backgroundColor: "#fff", textTransform: "none", ml: 2 }} 
                                onClick={() => { setModal9(true); }}
                            >
                                {t('createNewPort')}
                            </Button>
                            <Button 
                                variant="contained" color="inherit" 
                                sx={{ float: "right", backgroundColor: "#fff", textTransform: "none" }} 
                                onClick={() => { setModal7(true); }}
                            >
                                {t('createNewContact')}
                            </Button>
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
                        <Grid item xs={12}>
                            <Button variant="contained" color="primary" sx={{ mt: 2, mr: 2, textTransform: "none" }} onClick={editRequest} >{t('editRequest')}</Button>
                            <Button variant="contained" color="inherit" sx={whiteButtonStyles} onClick={() => { setModal2(true); }} >{t('changeStatus')}</Button>
                            <Button variant="contained" color="inherit" sx={whiteButtonStyles} style={{ float: "right" }} onClick={() => { setModal3(true); }} >{t('addCommentNote')}</Button>
                            <Button variant="contained" color="inherit" sx={whiteButtonStyles} style={{ float: "right", marginRight: "10px" }} onClick={() => { setModal4(true); }} >{t('listNotes')}</Button>
                        </Grid>
                        
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
                                containers={containers}
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
            
            {/* Ask for information */}
            <BootstrapDialog open={modal} onClose={() => setModal(false)} maxWidth="md" fullWidth>
                <RequestAskInformation id={id} userId={null} email={email} closeModal={() => setModal(false)} />
            </BootstrapDialog>
            
            {/* Change request status */}
            <BootstrapDialog open={modal2} onClose={() => setModal2(false)} maxWidth="md" fullWidth>
                <RequestChangeStatus id={id} closeModal={() => setModal2(false)} />
            </BootstrapDialog>
            
            {/* Add a comment/note */}
            <BootstrapDialog open={modal3} onClose={() => setModal3(false)} maxWidth="md" fullWidth>
                <RequestAddNote id={id} userId={null} closeModal={() => setModal3(false)} />
            </BootstrapDialog>

            {/* List of notes */}
            <BootstrapDialog open={modal4} onClose={() => setModal4(false)} maxWidth="lg" fullWidth>
                <RequestListNotes id={id} closeModal={() => setModal4(false)} />
            </BootstrapDialog>

            {/* Add a new contact */}
            <BootstrapDialog open={modal7} onClose={() => setModal7(false)} maxWidth="md" fullWidth>
                <NewContact categories={[""]} closeModal={() => setModal7(false)} />
            </BootstrapDialog>

            {/* Create new port */}
            <BootstrapDialog open={modal9} onClose={() => setModal9(false)} maxWidth="md" fullWidth>
                <NewPort closeModal={() => setModal9(false)} callBack={getPorts} />
            </BootstrapDialog>

            {/* Create new product */}
            <BootstrapDialog open={modal11} onClose={() => setModal11(false)} maxWidth="md" fullWidth>
                <NewProduct closeModal={() => setModal11(false)} callBack={getProducts} />
            </BootstrapDialog>

            {/* New container type */}
            <BootstrapDialog open={modal10} onClose={() => setModal10(false)} maxWidth="lg" fullWidth>
                <BootstrapDialogTitle id="custom-dialog-title" onClose={() => setModal10(false)}>
                    <b>Add a container</b>
                </BootstrapDialogTitle>
                <DialogContent dividers>
                    <Grid container spacing={2}>
                        <Grid item xs={12} md={2} mt={1}>
                            <InputLabel htmlFor="packing-type" sx={inputLabelStyles}>{t('packingType')}</InputLabel>
                            <NativeSelect
                                id="packing-type"
                                value={packingType}
                                onChange={(e: any) => { setPackingType(e.target.value); }}
                                input={<BootstrapInput />}
                                fullWidth
                            >
                                <option value="FCL">{t('fcl')}</option>
                                {/* <option value="Breakbulk/LCL">{t('breakbulk')}</option>
                                <option value="Unit RoRo">{t('roro')}</option> */}
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
                                            setModal10(false);
                                        } 
                                        else {
                                            enqueueSnackbar("You need to select a container type and a good value for quantity.", { variant: "error", anchorOrigin: { horizontal: "right", vertical: "top"} });
                                        }
                                    }} 
                                >
                                    {t('addContainer')}
                                </Button>
                            </Grid>
                            </> : null
                        }
                    </Grid>
                </DialogContent>
                <DialogActions>
                    <Button variant="contained" onClick={() => setModal10(false)} sx={buttonCloseStyles}>{t('close')}</Button>
                </DialogActions>
            </BootstrapDialog>
        </div>
    );
}

export default Request;
