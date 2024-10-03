import { Delete, Edit, ExpandMore } from '@mui/icons-material';
import { Accordion, AccordionSummary, AccordionDetails, Grid, InputLabel, Autocomplete, TextField, Skeleton, Typography, Divider, Button, Box, IconButton, DialogActions, DialogContent, NativeSelect } from '@mui/material';
import { DataGrid, GridColDef, GridRenderCellParams } from '@mui/x-data-grid';
import { t } from 'i18next';
import React, { useEffect, useState } from 'react';
import { allPackages, CategoryEnum } from '../../utils/constants';
import { calculateTotalQuantity, calculateTotalWeight, calculateTotalVolume } from '../../utils/functions';
import { inputLabelStyles, BootstrapInput, whiteButtonStyles, sizingStyles, actionButtonStyles, BootstrapDialog, BootstrapDialogTitle, buttonCloseStyles } from '../../utils/misc/styles';
import CompanySearch from '../shared/CompanySearch';
import { enqueueSnackbar } from 'notistack';
import { protectedResources } from '../../config/authConfig';
import { BackendService } from '../../utils/services/fetch';
import PortAutocomplete from '../shared/PortAutocomplete';
import { useMsal, useAccount } from '@azure/msal-react';
import { useAuthorizedBackendApi } from '../../api/api';
import DateComplex from '../shared/DateComplex';

const InformationShipments = (props: any) => {
    const [currentCargoId, setCurrentCargoId] = useState<string>("");
    const [loadCargos, setLoadCargos] = useState<boolean>(true);
    const [modalCargo, setModalCargo] = useState<boolean>(false);
    const [cargos, setCargos] = useState<any>(null);
    const [quantity, setQuantity] = useState<number>(1);
    const [weight, setWeight] = useState<number>(0);
    const [volume, setVolume] = useState<number>(30);
    const [marks, setMarks] = useState<string>("");
    const [packageType, setPackageType] = useState<number>(0);
    const [product, setProduct] = useState<any>(null);
    const [number, setNumber] = useState<string>("");
    const [seal, setSeal] = useState<string>("");
    
    const { instance, accounts } = useMsal();
    const account = useAccount(accounts[0] || {});    
    const context = useAuthorizedBackendApi();
    
    const { 
        carrier, setCarrier, carrierAgent, setCarrierAgent, bookingRef, setBookingRef, portLoading, setPortLoading, portDischarge, setPortDischarge, 
        etd, setEtd, eta, setEta, ship, setShip, ships, ports, products, orderData, id
    } = props;

    const columnsCargos: GridColDef[] = [
        { field: 'quantity', headerName: t('Qty'), flex: 0.25 },
        { field: 'packageType', headerName: t('Package'), renderCell: (params: GridRenderCellParams) => {
            return (
                <Box>
                    {params.row.packageType !== null ? allPackages.find((val: any) => val.packageId === params.row.packageType)?.packageName : "N/A"}
                </Box>
            );
        }, flex: 0.75 },
        { field: 'productLine', headerName: t('Product'), renderCell: (params: GridRenderCellParams) => {
            return (
                <Box>
                    {
                        products !== null && products !== undefined && params.row.productLine !== null ? 
                        <>
                            {
                                products.find((val: any) => val.productId === params.row.productLine) !== undefined ? 
                                products.find((val: any) => val.productId === params.row.productLine)?.productName : "N/A"
                            }
                        </> : <span>N/A</span>
                    }
                </Box>
            );
        }, flex: 1 },
        { field: 'weight', headerName: t('Weight (kg)'), renderCell: (params: GridRenderCellParams) => {
            return (<Box><>{params.row.weight}</></Box>);
        }, flex: 0.75 },
        { field: 'volume', headerName: t('Volume (m³)'), renderCell: (params: GridRenderCellParams) => {
            return (<Box><>{params.row.volume}</></Box>);
        }, flex: 0.75 },
        { field: 'www', headerName: t('Actions'), renderCell: (params: GridRenderCellParams) => {
            return (
                <Box sx={{ my: 1 }}>
                    <IconButton 
                        edge="end" 
                        onClick={() => { 
                            setCurrentCargoId(params.row.lineId);
                            setModalCargo(true);
                            setQuantity(params.row.quantity);
                            setWeight(params.row.weight);
                            setVolume(params.row.volume);
                            setPackageType(params.row.packageType);
                            setProduct(products.find((val: any) => val.productId === params.row.productLine));
                            setNumber(params.row.containerNumber);
                            setSeal(params.row.sealNumber);
                            setMarks(params.row.description);
                        }} 
                        sx={{ mr: 0 }}
                    >
                        <Edit fontSize='small' />
                    </IconButton>
                    <IconButton edge="end" onClick={() => { deleteOrderCargo(params.row.lineId); }}>
                        <Delete fontSize='small' />
                    </IconButton>
                </Box>
            );
        } }
    ];

    useEffect(() => {
        getCargos();
    }, [account, instance, context]);

    const getCargos = async () => {
        if (account && instance && context) {
            try {
                if (id !== undefined) {
                    setLoadCargos(true);
                    const response = await (context?.service as BackendService<any>).getSingle(protectedResources.apiLisShipments.endPoint+"/Cargos/GetByOrderId/"+id);
                    if (response !== null && response !== undefined) {
                        console.log("Cargos : ", response);
                        setCargos(response.$values);
                        setLoadCargos(false);
                    }
                    else {
                        setLoadCargos(false);
                    }
                }
            }
            catch (err: any) {
                setLoadCargos(false);
                setCargos([]);
            }
        }
    }

    const addOrderCargo = async () => {
        if (account && instance && context) {
            try {
                // setLoadCreate(true);
                var dataSent = {};
                if (orderData !== null && product !== null) {
                    if (currentCargoId !== "") {
                        dataSent = {
                            "lineId": currentCargoId,
                            "orderId": orderData.orderId,
                            "productLine": product.productId,
                            "containerNumber": number,
                            "sealNumber": seal,
                            "weight": Number(weight),
                            "volume": Number(volume),
                            "quantity": Number(quantity),
                            "numberOfUnits": null,
                            "packageType": Number(packageType),
                            "description": marks
                        };
                        const response = await (context?.service as BackendService<any>).putWithToken(protectedResources.apiLisShipments.endPoint+"/Cargos/"+currentCargoId, dataSent, context.tokenLogin);
                        if (response !== undefined && response !== null) {
                            enqueueSnackbar("The order cargo has been created with success!", { variant: "success", anchorOrigin: { horizontal: "right", vertical: "top"} });
                            setModalCargo(false);
                            getCargos();
                        }
                        else {
                            setModalCargo(false);
                            getCargos();
                        }
                    }
                    else {
                        dataSent = {
                            "orderId": orderData.orderId,
                            "productLine": product.productId,
                            "containerNumber": number,
                            "sealNumber": seal,
                            "weight": Number(weight),
                            "volume": Number(volume),
                            "quantity": Number(quantity),
                            "numberOfUnits": null,
                            "packageType": Number(packageType),
                            "description": marks
                        };
                        const response = await (context?.service as BackendService<any>).postWithToken(protectedResources.apiLisShipments.endPoint+"/Cargos", dataSent, context.tokenLogin);
                        if (response !== undefined && response !== null) {
                            enqueueSnackbar("The order cargo has been edited with success!", { variant: "success", anchorOrigin: { horizontal: "right", vertical: "top"} });
                            setModalCargo(false);
                            getCargos();
                        }
                        else {
                            setModalCargo(false);
                            getCargos();
                        }
                    }
                }
            }
            catch (err: any) {
                enqueueSnackbar(t('errorHappened'), { variant: "error", anchorOrigin: { horizontal: "right", vertical: "top"} });
                console.log(err);
            }
        }
    }

    const deleteOrderCargo = async (lineId: string) => {
        if (account && instance && context) {
            try {
                const response = await (context?.service as BackendService<any>).delete(protectedResources.apiLisShipments.endPoint+"/Cargos/"+lineId);
                console.log(response);
                enqueueSnackbar(t('rowDeletedSuccess'), { variant: "success", anchorOrigin: { horizontal: "right", vertical: "top"} });
                getCargos();
            }
            catch (e: any) {
                console.log(e);
                enqueueSnackbar(t('rowDeletedError'), { variant: "error", anchorOrigin: { horizontal: "right", vertical: "top"} });
            }
        }
    }
    
    return (
        <>
        <Accordion expanded sx={{ width: "100%" }}>
            <AccordionSummary expandIcon={<ExpandMore />} aria-controls="panel2-content" id="panel2-header">
                Shipment Information
            </AccordionSummary>
            <AccordionDetails>
                <Grid container spacing={0.75}>
                    <Grid item xs={5}>
                        <InputLabel htmlFor="carrier" sx={inputLabelStyles}>{t('carrier')}</InputLabel>
                        <CompanySearch id="carrier" value={carrier} onChange={setCarrier} category={CategoryEnum.SHIPPING_LINES} fullWidth />
                    </Grid>
                    <Grid item xs={5}>
                        <InputLabel htmlFor="carrierAgent" sx={inputLabelStyles}>{t('carrierAgent')}</InputLabel>
                        <CompanySearch id="carrierAgent" value={carrierAgent} onChange={setCarrierAgent} category={CategoryEnum.SHIPPING_LINES} fullWidth />
                    </Grid>
                    <Grid item xs={2}>
                        <InputLabel htmlFor="bookingRef" sx={inputLabelStyles}>{t('Booking Ref')}</InputLabel>
                        <BootstrapInput id="bookingRef" type="text" value={bookingRef} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setBookingRef(e.target.value)} fullWidth sx={{ mb: 1 }} />
                    </Grid>
                    <Grid item xs={6}>
                        <InputLabel htmlFor="portLoading" sx={inputLabelStyles}>{t('portLoading')}</InputLabel>
                        {
                            ports !== null ?
                            <PortAutocomplete id="portLoading" options={ports} value={portLoading} onChange={setPortLoading} fullWidth /> : <Skeleton />
                        }
                    </Grid>
                    <Grid item xs={6}>
                        <InputLabel htmlFor="portDischarge" sx={inputLabelStyles}>{t('portDischarge')}</InputLabel>
                        {
                            ports !== null ?
                            <PortAutocomplete id="portDischarge" options={ports} value={portDischarge} onChange={setPortDischarge} fullWidth /> : <Skeleton />
                        }
                    </Grid>
                    <Grid item xs={4} sx={{ mt: 0.875 }}>
                        <InputLabel htmlFor="etd" sx={inputLabelStyles}>{t('ETD')}</InputLabel>
                        <DateComplex id="etd" value={etd} onChange={setEtd} fullWidth />
                    </Grid>
                    <Grid item xs={4} sx={{ mt: 0.875 }}>
                        <InputLabel htmlFor="eta" sx={inputLabelStyles}>{t('ETA')}</InputLabel>
                        <DateComplex id="eta" value={eta} onChange={setEta} fullWidth />
                    </Grid>
                    <Grid item xs={4} sx={{ mt: 0.875 }}>
                        <InputLabel htmlFor="vessel" sx={inputLabelStyles}>{t('vessel')}</InputLabel>
                        {
                            ships !== null ? 
                            <Autocomplete
                                disablePortal
                                id="ship"
                                options={ships}
                                renderOption={(props, option, i) => {
                                    return (
                                        <li {...props} key={option.shipId}>
                                            {option.shipName}
                                        </li>
                                    );
                                }}
                                getOptionLabel={(option: any) => { 
                                    if (option !== null && option !== undefined) {
                                        return option.shipName;
                                    }
                                    return ""; 
                                }}
                                value={ship}
                                sx={{ mt: 1 }}
                                renderInput={(params: any) => <TextField {...params} />}
                                onChange={(e: any, value: any) => { 
                                    setShip(value);
                                }}
                                fullWidth
                            /> : <Skeleton />
                        }
                    </Grid>

                    <Grid item xs={12} sx={{ mt: 0.375 }}>
                        <Typography variant="h6">Cargo Details</Typography>
                        <Divider />
                    </Grid>
                    <Grid item xs={12}>
                        <Button 
                            variant="contained" color="inherit" 
                            sx={whiteButtonStyles} style={{ float: "right" }} 
                            onClick={() => { getCargos(); }}
                        >
                            {t('reload')}
                        </Button>
                        <Button 
                            variant="contained" color="inherit" 
                            sx={whiteButtonStyles} style={{ float: "right", marginRight: "5px" }} 
                            onClick={() => { 
                                setCurrentCargoId(""); 
                                setModalCargo(true); 
                                setQuantity(1);
                                setWeight(0);
                                setVolume(30);
                                setPackageType(0);
                                setProduct(null);
                                setNumber("");
                                setSeal("");
                                setMarks(""); 
                            }}
                        >
                            {t('New cargo')}
                        </Button>
                    </Grid>
                    <Grid item xs={12}>
                        {
                            cargos !== null ?
                            <DataGrid
                                rows={cargos}
                                columns={columnsCargos}
                                getRowId={(row: any) => row?.lineId}
                                getRowHeight={() => "auto" }
                                sx={sizingStyles}
                                disableRowSelectionOnClick
                                style={{ height: "300px", fontSize: "12px" }}
                                pagination
                                slots={{
                                    footer: () => (
                                        <Box sx={{ p: 1, borderTop: "1px solid #e5e5e5", display: 'flex', justifyContent: 'flex-end' }}>
                                            <Typography variant="h6" fontSize={14}>
                                                Quantity : {calculateTotalQuantity(cargos)} | Weight: {calculateTotalWeight(cargos)} kg | Volume : {calculateTotalVolume(cargos)} m³
                                            </Typography>
                                        </Box>
                                    ),
                                }}
                            /> : <Skeleton />
                        }
                    </Grid>
                </Grid>
            </AccordionDetails>
        </Accordion>

        <BootstrapDialog open={modalCargo} onClose={() => setModalCargo(false)} maxWidth="md" fullWidth>
            <BootstrapDialogTitle id="custom-dialog-title" onClose={() => setModalCargo(false)}>
                <b>{currentCargoId !== "" ? t('Edit a cargo') : t('Add a cargo')}</b>
            </BootstrapDialogTitle>
            <DialogContent dividers>
                <Grid container spacing={2}>
                    <Grid item xs={9}>
                        <Grid container spacing={1}>
                            <Grid item xs={6} sx={{ mt: 0.5 }}>
                                <InputLabel htmlFor="packageType" sx={inputLabelStyles}>{t('packageType')}</InputLabel>
                                <NativeSelect
                                    id="packageType"
                                    value={packageType}
                                    onChange={(e: any) => { setPackageType(e.target.value); console.log("Package : ", e.target.value); }}
                                    input={<BootstrapInput />}
                                    fullWidth
                                >
                                    <option></option>
                                    {
                                        allPackages.map((row: any, i: number) => (
                                            <option key={"ptId1-"+i} value={Number(row.packageId)}>{row.packageName}</option>
                                        ))
                                    }
                                </NativeSelect>
                            </Grid>
                            <Grid item xs={6} sx={{ mt: 0.5 }}>
                                <InputLabel htmlFor="product" sx={inputLabelStyles}>{t('Product')}</InputLabel>
                                {
                                    products !== null ?
                                    <Autocomplete
                                        disablePortal
                                        id="product"
                                        options={products}
                                        getOptionLabel={(option: any) => { 
                                            if (option !== null && option !== undefined) {
                                                return option.productName !== undefined ? option.productName : option;
                                            }
                                            return ""; 
                                        }}
                                        value={product}
                                        sx={{ mt: 1 }}
                                        renderInput={(params: any) => <TextField placeholder="Machinery, Household goods, etc" {...params} sx={{ textTransform: "lowercase" }} />}
                                        onChange={(e: any, value: any) => { setProduct(value); }}
                                        fullWidth
                                    /> : <Skeleton />
                                }
                            </Grid>
                            <Grid item xs={4}>
                                <InputLabel htmlFor="quantity" sx={inputLabelStyles}>{t('quantity')}</InputLabel>
                                <BootstrapInput id="quantity" type="number" value={quantity} onChange={(e: any) => setQuantity(e.target.value)} fullWidth />
                            </Grid>
                            <Grid item xs={4}>
                                <InputLabel htmlFor="weight" sx={inputLabelStyles}>{t('Weight (in kg)')}</InputLabel>
                                <BootstrapInput id="weight" type="number" value={weight} onChange={(e: any) => setWeight(e.target.value)} fullWidth />
                            </Grid>
                            <Grid item xs={4}>
                                <InputLabel htmlFor="volume" sx={inputLabelStyles}>{t('Volume (in m³)')}</InputLabel>
                                <BootstrapInput id="volume" type="number" value={volume} onChange={(e: any) => setVolume(e.target.value)} fullWidth />
                            </Grid>
                            {
                                // 8-23 are containers codes
                                packageType !== 0 && packageType < 24 && packageType > 7 ? 
                                <>
                                    <Grid item xs={6}>
                                        <InputLabel htmlFor="numberX" sx={inputLabelStyles}>{t('Number')}</InputLabel>
                                        <BootstrapInput id="numberX" type="text" value={number} onChange={(e: any) => setNumber(e.target.value)} fullWidth />
                                    </Grid>
                                    <Grid item xs={6}>
                                        <InputLabel htmlFor="seal" sx={inputLabelStyles}>{t('Seal')}</InputLabel>
                                        <BootstrapInput id="seal" type="text" value={seal} onChange={(e: any) => setSeal(e.target.value)} fullWidth />
                                    </Grid>
                                </> : null 
                            }
                        </Grid>
                    </Grid>
                    <Grid item xs={3}>
                        <InputLabel htmlFor="marks" sx={inputLabelStyles}>{t('Marks')}</InputLabel>
                        <BootstrapInput id="marks" type="text" multiline rows={8.125} value={marks} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setMarks(e.target.value)} fullWidth />
                    </Grid>
                </Grid>
            </DialogContent>
            <DialogActions>
                <Button variant="contained" onClick={() => addOrderCargo()} sx={actionButtonStyles}>{t('Save')}</Button>
                <Button variant="contained" onClick={() => setModalCargo(false)} sx={buttonCloseStyles}>{t('close')}</Button>
            </DialogActions>
        </BootstrapDialog>
        </>
    );
};

export default InformationShipments;
