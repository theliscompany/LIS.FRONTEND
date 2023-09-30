import { useState, useEffect } from 'react';
import { Accordion, AccordionDetails, AccordionSummary, Alert, Autocomplete, Box, Button, Chip, DialogActions, DialogContent, Grid, IconButton, InputLabel, Skeleton, TextField, Typography } from '@mui/material';
import HelpIcon from '@mui/icons-material/Help';
import SearchIcon from '@mui/icons-material/Search';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { SnackbarProvider } from 'notistack';
import { useTranslation } from 'react-i18next';
import { useAuthorizedBackendApi } from '../api/api';
import { protectedResources } from '../config/authConfig';
import { BackendService } from '../utils/services/fetch';
import { GridColDef, GridValueFormatterParams, GridRenderCellParams, DataGrid } from '@mui/x-data-grid';
import { BootstrapDialog, BootstrapDialogTitle, HtmlTooltip, buttonCloseStyles, gridStyles, inputLabelStyles, whiteButtonStyles } from '../utils/misc/styles';
import CompanySearch from '../components/shared/CompanySearch';

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

function Seafreights() {
    const [load, setLoad] = useState<boolean>(true);
    const [modal, setModal] = useState<boolean>(false);
    const [modal2, setModal2] = useState<boolean>(false);
    const [currentId, setCurrentId] = useState<string>("");
    const [seafreights, setSeafreights] = useState<any>(null);
    const [carrier, setCarrier] = useState<any>(null);
    const [portDeparture, setPortDeparture] = useState<any>(null);
    const [portDestination, setPortDestination] = useState<any>(null);
    const [ports, setPorts] = useState<any>(null);
    
    const { t } = useTranslation();
    
    const context = useAuthorizedBackendApi();

    const columnsSeafreights: GridColDef[] = [
        // { field: 'carrierName', headerName: t('carrier'), minWidth: 150 },
        { field: 'carrierAgentName', headerName: t('carrierAgent'), minWidth: 225 },
        // { field: 'departurePortName', headerName: t('departurePort'), minWidth: 125 },
        // { field: 'destinationPortName', headerName: t('destinationPort'), minWidth: 125 },
        { field: 'frequency', headerName: t('frequency'), valueFormatter: (params: GridValueFormatterParams) => `${t('every')} ${params.value || ''} `+t('days'), minWidth: 125 },
        { field: 'transitTime', headerName: t('transitTime'), valueFormatter: (params: GridValueFormatterParams) => `${params.value || ''} `+t('days'), minWidth: 100 },
        { field: 'currency', headerName: t('prices'), renderCell: (params: GridRenderCellParams) => {
            return (
                <Box sx={{ my: 1, mr: 1 }}>
                    <Box sx={{ my: 1 }} hidden={params.row.total20Dry === 0}>{params.row.total20Dry !== 0 ? "20' Dry : "+params.row.total20Dry+" "+t(params.row.currency) : "20' Dry : N/A"}</Box>
                    <Box sx={{ my: 1 }} hidden={params.row.total20RF === 0}>{params.row.total20RF !== 0 ? "20' Rf : "+params.row.total20RF+" "+t(params.row.currency) : "20' Rf : N/A"}</Box>
                    <Box sx={{ my: 1 }} hidden={params.row.total40Dry === 0}>{params.row.total40Dry !== 0 ? "40' Dry : "+params.row.total40Dry+" "+t(params.row.currency) : "40' Dry : N/A"}</Box>
                    <Box sx={{ my: 1 }} hidden={params.row.total40HC === 0}>{params.row.total40HC !== 0 ? "40' Hc : "+params.row.total40HC+" "+t(params.row.currency) : "40' Hc : N/A"}</Box>
                    <Box sx={{ my: 1 }} hidden={params.row.total20HCRF === 0}>{params.row.total20HCRF !== 0 ? "40' HcRf : "+params.row.total20HCRF+" "+t(params.row.currency) : "40' HcRf : N/A"}</Box>
                </Box>
            );
        }, minWidth: 175 },
        { field: 'validUntil', headerName: t('validUntil'), renderCell: (params: GridRenderCellParams) => {
            return (
                <Box sx={{ my: 1, mr: 1 }}>
                    <Chip label={(new Date(params.row.validUntil)).toLocaleDateString().slice(0,10)} color={(new Date()).getTime() - (new Date(params.row.validUntil)).getTime() > 0 ? "warning" : "success"}></Chip>
                </Box>
            );
        }, minWidth: 100 },
        { field: 'created', headerName: t('created'), renderCell: (params: GridRenderCellParams) => {
            return (
                <Box sx={{ my: 1, mr: 1 }}>
                    <Chip label={(new Date(params.row.created)).toLocaleDateString().slice(0,10)} color={(new Date()).getTime() - (new Date(params.row.created)).getTime() > 0 ? "default" : "default"}></Chip>
                </Box>
            );
        }, minWidth: 100 },
        { field: 'xxx', headerName: t('Actions'), renderCell: (params: GridRenderCellParams) => {
            return (
                <Box sx={{ my: 1, mr: 1 }}>
                    <IconButton size="small" title={t('editRow')} sx={{ mr: 0.5 }}>
                        <EditIcon fontSize="small" />
                    </IconButton>
                    <IconButton size="small" title={t('deleteRow')} onClick={() => { setCurrentId(params.row.seaFreightId); setModal(true); }}>
                        <DeleteIcon fontSize="small" />
                    </IconButton>
                </Box>
            );
        }, minWidth: 100 },
        // { field: 'comment', headerName: "Comment", renderCell: (params: GridRenderCellParams) => {
        //     return (
        //         <Box sx={{ my: 2 }}>
        //             <HtmlTooltip
        //                 title={
        //                     params.row.comment === "" || params.row.comment === null ? 
        //                     <Box sx={{ p: 1 }}>
        //                         <Typography color="inherit" sx={{ fontSize: 13 }}>{t('noComment')}</Typography>
        //                     </Box> : 
        //                     <Box sx={{ p: 1 }}>
        //                         <Typography color="inherit" sx={{ fontSize: 13 }}>{params.row.comment}</Typography>
        //                     </Box>
        //                 }
        //             >
        //                 <IconButton size="small">
        //                     <HelpIcon fontSize="small" />
        //                 </IconButton>
        //             </HtmlTooltip>
        //         </Box>
        //     );
        // }, minWidth: 100 },
    ];
    
    useEffect(() => {
        getPorts();
        getSeafreights();
    }, []);
    
    const getPorts = async () => {
        if (context) {
            const response = await (context as BackendService<any>).getSingle(protectedResources.apiLisTransport.endPoint+"/Port/Ports");
            if (response !== null && response !== undefined) {
                setPorts(response);
            }  
        }
    }
    
    const getSeafreights = async () => {
        if (context) {
            const response = await (context as BackendService<any>).getSingle(protectedResources.apiLisPricing.endPoint+"/SeaFreight/GetSeaFreights");
            if (response !== null && response !== undefined) {
                setSeafreights(response);
                setLoad(false);
            }
            else {
                setLoad(false);
            }
            console.log(response);
        }
    }
    
    const searchSeafreights = async () => {
        if (context) {
            setLoad(true);
            var requestFormatted = createGetRequestUrl(portDeparture?.portId, portDestination?.portId, carrier?.contactId);
            const response = await (context as BackendService<any>).getSingle(requestFormatted);
            if (response !== null && response !== undefined) {
                setSeafreights(response);
                setLoad(false);
            }
            else {
                setLoad(false);
            }
            console.log(response);
        }
    }
    
    return (
        <div style={{ background: "#fff", borderTopLeftRadius: 20, borderTopRightRadius: 20 }}>
            <SnackbarProvider />
            <Box sx={{ py: 2.5 }}>
                <Typography variant="h5" sx={{mt: {xs: 4, md: 1.5, lg: 1.5 }}} mx={5}><b>{t('listSeafreights')}</b></Typography>
                <Grid container spacing={2} mt={1} px={5}>
                    <Grid item xs={12} md={4} mt={1}>
                        <InputLabel htmlFor="company-name" sx={inputLabelStyles}>{t('carrier')}</InputLabel>
                        <CompanySearch id="company-name" value={carrier} onChange={setCarrier} callBack={() => console.log(carrier)} fullWidth />
                    </Grid>
                    <Grid item xs={12} md={3} mt={1}>
                        <InputLabel htmlFor="port-departure" sx={inputLabelStyles}>{t('departurePort')}</InputLabel>
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
                                renderInput={(params: any) => <TextField {...params} />}
                                onChange={(e: any, value: any) => { setPortDeparture(value); }}
                                fullWidth
                            /> : <Skeleton />
                        }
                    </Grid>
                    <Grid item xs={12} md={3} mt={1}>
                        <InputLabel htmlFor="destination-port" sx={inputLabelStyles}>{t('arrivalPort')}</InputLabel>
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
                                value={portDestination}
                                sx={{ mt: 1 }}
                                renderInput={(params: any) => <TextField {...params} />}
                                onChange={(e: any, value: any) => { setPortDestination(value); }}
                                fullWidth
                            /> : <Skeleton />
                        }
                    </Grid>
                    <Grid item xs={12} md={2} mt={1} sx={{ display: "flex", alignItems: "end" }}>
                        <Button 
                            variant="contained" 
                            color="inherit"
                            startIcon={<SearchIcon />} 
                            size="large"
                            sx={{ backgroundColor: "#fff", color: "#333", textTransform: "none", mb: 0.15 }}
                            onClick={searchSeafreights}
                            fullWidth
                        >
                            {t('search')}
                        </Button>
                    </Grid>
                </Grid>
                {
                    !load ? 
                    <Grid container spacing={2} mt={1} px={5}>
                        <Grid item xs={12}>
                            {
                                seafreights !== null ?
                                <Box sx={{ overflow: "auto" }}>
                                    {
                                        seafreights.map((item: any, i: number) => {
                                            return (
                                                <Accordion key={"seaf"+i} sx={{ border: 1, borderColor: "#e5e5e5" }}>
                                                    <AccordionSummary expandIcon={<ExpandMoreIcon />} aria-controls="panel1a-content" id="panel1a-header">
                                                        <Chip variant="outlined" label={item.departurePortName} sx={{ mr: 1 }} />
                                                        <Chip variant="outlined" label={item.destinationPortName} />
                                                        {/* <Typography>{t('from')} {item.departurePortName} {t('to')} {item.destinationPortName}</Typography> */}
                                                    </AccordionSummary>
                                                    <AccordionDetails>
                                                        <DataGrid
                                                            rows={item.suppliers}
                                                            columns={columnsSeafreights}
                                                            hideFooter
                                                            getRowId={(row: any) => row?.seaFreightId}
                                                            getRowHeight={() => "auto" }
                                                            sx={gridStyles}
                                                            disableRowSelectionOnClick
                                                            // onRowSelectionModelChange={(newRowSelectionModel) => {
                                                            //     setRowSelectionModel(newRowSelectionModel);
                                                            //     setSelectedSeafreight(newRowSelectionModel.length !== 0 ? seafreights.find((elm: any) => elm.seaFreightId === newRowSelectionModel[0]) : null);
                                                            // }}
                                                            // rowSelectionModel={rowSelectionModel}
                                                            // onRowClick={handleRowSeafreightsClick}
                                                        />
                                                    </AccordionDetails>
                                                </Accordion>
                                            )
                                        })
                                    }
                                </Box> 
                                : <Alert severity="warning">{t('noResults')}</Alert>
                            }
                        </Grid>
                    </Grid> : <Skeleton sx={{ mx: 5, mt: 3 }} />
                }
            </Box>
            <BootstrapDialog
                onClose={() => setModal(false)}
                aria-labelledby="custom-dialog-title"
                open={modal}
                maxWidth="md"
                fullWidth
            >
                <BootstrapDialogTitle id="custom-dialog-title" onClose={() => setModal(false)}>
                    <b>{t('deleteRow')}</b>
                </BootstrapDialogTitle>
                <DialogContent dividers>{t('areYouSureDeleteRow')}</DialogContent>
                <DialogActions>
                    <Button variant="contained" color={"primary"} onClick={() => { alert("Function not available yet!"); }} sx={{ mr: 3, textTransform: "none" }}>{t('accept')}</Button>
                    <Button variant="contained" onClick={() => setModal(false)} sx={buttonCloseStyles}>{t('close')}</Button>
                </DialogActions>
            </BootstrapDialog>
            <BootstrapDialog
                onClose={() => setModal2(false)}
                aria-labelledby="custom-dialog-title2"
                open={modal2}
                maxWidth="md"
                fullWidth
            >
                <BootstrapDialogTitle id="custom-dialog-title2" onClose={() => setModal2(false)}>
                    <b>{t('editRow')}</b>
                </BootstrapDialogTitle>
                <DialogContent dividers>
                    
                </DialogContent>
                <DialogActions>
                    <Button variant="contained" color={"primary"} onClick={() => { alert("Function not available yet!"); }} sx={{ mr: 3, textTransform: "none" }}>{t('validate')}</Button>
                    <Button variant="contained" onClick={() => setModal2(false)} sx={buttonCloseStyles}>{t('close')}</Button>
                </DialogActions>
            </BootstrapDialog>
        </div>
    );
}

export default Seafreights;
