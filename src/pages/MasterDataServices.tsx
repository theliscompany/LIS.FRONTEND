import * as React from 'react';
import { useState, useEffect } from 'react';
import Box from '@mui/material/Box';
import { SnackbarProvider, enqueueSnackbar } from 'notistack';
import { useMsal, useAccount } from '@azure/msal-react';
import { useAuthorizedBackendApi } from '../api/api';
import { protectedResources } from '../config/authConfig';
import { BackendService } from '../utils/services/fetch';
import { Alert, Button, DialogActions, DialogContent, Grid, IconButton, InputLabel, MenuItem, Select, Skeleton, Typography } from '@mui/material';
import { DataGrid, GridColDef, GridRenderCellParams, GridToolbar } from '@mui/x-data-grid';
// import { t } from 'i18next';
import { sizingStyles, gridStyles, BootstrapDialog, BootstrapDialogTitle, buttonCloseStyles, BootstrapInput, actionButtonStyles, inputLabelStyles } from '../utils/misc/styles';
import { Edit, Delete } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';

const MasterDataServices: any = (props: any) => {
    const { t } = useTranslation();
    
    const [services, setServices] = useState<any>(null);
    const [loadResults, setLoadResults] = useState<boolean>(true);
    const [loadEdit, setLoadEdit] = useState<boolean>(false);
    const [modal, setModal] = useState<boolean>(false);
    const [modal2, setModal2] = useState<boolean>(false);
    const [testName, setTestName] = useState<string>("");
    const [testDescription, setTestDescription] = useState<string>("");
    const [selectedServiceTypes, setSelectedServiceTypes] = useState<number[]>([]);
    const [currentId, setCurrentId] = useState<string>("");
    const [currentEditId, setCurrentEditId] = useState<string>("");
    
    const { instance, accounts } = useMsal();
    const account = useAccount(accounts[0] || {});
    const context = useAuthorizedBackendApi();
    
    const getServices = async () => {
        if (account && instance && context) {
            setLoadResults(true);
            const response = await (context?.service as BackendService<any>).getWithToken(protectedResources.apiLisTransport.endPoint+"/Service?pageSize=500", context.tokenTransport);
            if (response !== null && response !== undefined) {
                setServices(response);
                setLoadResults(false);
            }
            else {
                setLoadResults(false);
            }
        }
    }
    
    const deleteServicePrice = async (id: string) => {
        if (account && instance && context) {
            try {
                const response = await (context?.service as BackendService<any>).deleteWithToken(protectedResources.apiLisTransport.endPoint+"/Service/"+id, context.tokenTransport);
                console.log(response);
                enqueueSnackbar(t('rowDeletedSuccess'), { variant: "success", anchorOrigin: { horizontal: "right", vertical: "top"} });
                setModal2(false);
                getServices();
            }
            catch (e: any) {
                console.log(e);
                enqueueSnackbar(t('rowDeletedError'), { variant: "error", anchorOrigin: { horizontal: "right", vertical: "top"} });
            }
        }
    }
    
    useEffect(() => {
        getServices();
    }, [account, instance, account]);

    const servicesOptions = [
        {value: 1, name: "SEAFREIGHT"},
        {value: 2, name: "HAULAGE"},
        {value: 5, name: "MISCELLANEOUS"},
    ];

    const columnsServices: GridColDef[] = [
        { field: 'serviceId', headerName: t('id'), flex: 1 },
        { field: 'serviceName', headerName: t('serviceName'), flex: 3 },
        { field: 'servicesTypeId', headerName: t('servicesTypeId'), renderCell: (params: GridRenderCellParams) => {
            return (
                <Box sx={{ my: 2 }}>
                    {
                        params.row.servicesTypeId.map((id: any) => servicesOptions.find((service) => service.value === id)?.name).filter(Boolean).join(", ")
                    }
                </Box>
            );
        }, flex: 2 },
        { field: 'xxx', headerName: t('Actions'), renderCell: (params: GridRenderCellParams) => {
            return (
                <Box sx={{ my: 1, mr: 1 }}>
                    <IconButton size="small" title={t('editRowService')} sx={{ mr: 0.5 }} onClick={() => { setCurrentEditId(params.row.serviceId); resetForm(); getService(params.row.serviceId); setModal(true); }}>
                        <Edit fontSize="small" />
                    </IconButton>
                    <IconButton size="small" title={t('deleteRowService')} onClick={() => { setCurrentId(params.row.serviceId); setModal2(true); }}>
                        <Delete fontSize="small" />
                    </IconButton>
                </Box>
            );
        }, minWidth: 120, flex: 1 },
    ];
    
    const createNewService = async () => {
        if (testName !== "" && selectedServiceTypes.length !== 0) {
            if (account && instance && context) {
                try {
                    var dataSent = null;
                    var response = null;
                    if (currentEditId !== "") {
                        dataSent = {
                            "serviceId": currentEditId,
                            "serviceName": testName,
                            "serviceDescription": testDescription,
                            "servicesTypeId": selectedServiceTypes
                        };
                        response = await (context?.service as BackendService<any>).putWithToken(protectedResources.apiLisTransport.endPoint+"/Service/"+currentEditId, dataSent, context.tokenTransport);
                    }
                    else {
                        dataSent = {
                            "serviceName": testName,
                            "serviceDescription": testDescription,
                            "servicesTypeId": selectedServiceTypes
                        };
                        response = await (context?.service as BackendService<any>).postWithToken(protectedResources.apiLisTransport.endPoint+"/Service", dataSent, context.tokenTransport);
                    }
                    enqueueSnackbar(currentEditId === "" ? "The service has been added with success!" : "The service has been edited with success!", { variant: "success", anchorOrigin: { horizontal: "right", vertical: "top"} });
                    getServices();
                    setModal(false);    
                }
                catch (err: any) {
                    console.log(err);
                    enqueueSnackbar(t('errorHappened'), { variant: "error", anchorOrigin: { horizontal: "right", vertical: "top"} });
                }
            }
        }
        else {
            enqueueSnackbar("One or many the fields are empty, please verify the form and fill everything.", { variant: "warning", anchorOrigin: { horizontal: "right", vertical: "top"} });
        }
    }
    
    const getService = async (id: string) => {
        setLoadEdit(true)
        if (account && instance && context) {
            const response = await (context?.service as BackendService<any>).getWithToken(protectedResources.apiLisTransport.endPoint+"/Service/"+id, context.tokenTransport);
            if (response !== null && response !== undefined) {
                console.log(response);
                setTestName(response.serviceName);
                setSelectedServiceTypes(response.servicesTypeId);
                setLoadEdit(false);
            }
            else {
                setLoadEdit(false);
            }
        }
    }
    
    const resetForm = () => {
        setTestName("");
        setTestDescription("");
        setSelectedServiceTypes([]);
    }
    
    return (
        <div style={{ background: "#fff", borderTopLeftRadius: 20, borderTopRightRadius: 20 }}>
            <SnackbarProvider />
            <Box py={2.5}>
                <Grid container spacing={2} mt={0} px={5}>
                    <Grid item xs={12} md={8}>
                        <Typography sx={{ fontSize: 18, mb: 1 }}><b>{t('listServices')}</b></Typography>
                    </Grid>
                    <Grid item xs={12} md={4}>
                        <Button 
                            variant="contained" color="inherit" 
                            sx={{ float: "right", backgroundColor: "#fff", textTransform: "none", ml: 2 }} 
                            onClick={() => { getServices(); }} 
                        >
                            {t('reload')}
                        </Button>
                        <Button 
                            variant="contained" color="inherit" 
                            sx={{ float: "right", backgroundColor: "#fff", textTransform: "none" }} 
                            onClick={() => { setCurrentEditId(""); resetForm(); setModal(true); }} 
                        >
                            {t('newService')}
                        </Button>
                    </Grid>
                    <Grid item xs={12}>
                        {
                            !loadResults ? 
                            services !== null && services.length !== 0 ?
                            <Box sx={{ overflow: "auto" }}>
                                <DataGrid
                                    rows={services}
                                    columns={columnsServices}
                                    initialState={{
                                        pagination: {
                                            paginationModel: {
                                                pageSize: 10,
                                            },
                                        },
                                    }}
                                    pageSizeOptions={[5, 10, 25, 50]}
                                    getRowId={(row: any) => row?.serviceId}
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
                                    disableRowSelectionOnClick
                                />
                            </Box> : 
                            <Box>
                                <Alert severity="error">{t('noResults')}</Alert>
                            </Box>
                            : <Skeleton />
                        }
                    </Grid>
                </Grid>
            </Box>

            <BootstrapDialog
                onClose={() => setModal(false)}
                aria-labelledby="custom-dialog-title"
                open={modal}
                maxWidth="sm"
                fullWidth
            >
                <BootstrapDialogTitle id="custom-dialog-title7" onClose={() => setModal(false)}>
                    <b>{currentEditId === "" ? t('createRowService') : t('editRowService')}</b>
                </BootstrapDialogTitle>
                <DialogContent dividers>
                    {
                        loadEdit === false ?
                        <Grid container spacing={2}>
                            <Grid item xs={12}>
                                <InputLabel htmlFor="test-name" sx={inputLabelStyles}>{t('serviceName')}</InputLabel>
                                <BootstrapInput id="test-name" type="text" value={testName} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTestName(e.target.value)} fullWidth />
                            </Grid>
                            <Grid item xs={12}>
                                <InputLabel htmlFor="test-description" sx={inputLabelStyles}>Description</InputLabel>
                                <BootstrapInput id="test-description" type="text" multiline rows={3} value={testDescription} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTestDescription(e.target.value)} fullWidth />
                            </Grid>
                            <Grid item xs={12}>
                                <InputLabel htmlFor="test-services-types" sx={inputLabelStyles}>{t('servicesTypesId')}</InputLabel>
                                <Select
                                    labelId="test-services-types"
                                    id="test-selected-services"
                                    multiple
                                    value={selectedServiceTypes}
                                    onChange={(e: any) => setSelectedServiceTypes(e.target.value as number[])}
                                    fullWidth
                                    input={<BootstrapInput />}
                                    renderValue={(selected: any) => selected.map((value: any) => servicesOptions.find((type: any) => type.value === value)?.name).join(', ')}
                                >
                                    {servicesOptions.map((serviceType: any) => (
                                        <MenuItem key={serviceType.value} value={serviceType.value}>
                                            {serviceType?.name}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </Grid>
                        </Grid> : <Skeleton />
                    }
                </DialogContent>
                <DialogActions>
                    <Button variant="contained" onClick={() => { createNewService(); }} sx={actionButtonStyles}>{t('validate')}</Button>
                    <Button variant="contained" onClick={() => setModal(false)} sx={buttonCloseStyles}>{t('close')}</Button>
                </DialogActions>
            </BootstrapDialog>

            <BootstrapDialog
                onClose={() => setModal2(false)}
                aria-labelledby="custom-dialog-title"
                open={modal2}
                maxWidth="sm"
                fullWidth
            >
                <BootstrapDialogTitle id="custom-dialog-title" onClose={() => setModal2(false)}>
                    <b>{t('deleteRowService')}</b>
                </BootstrapDialogTitle>
                <DialogContent dividers>{t('areYouSureDeleteRow')}</DialogContent>
                <DialogActions>
                    <Button variant="contained" color={"primary"} onClick={() => { deleteServicePrice(currentId); }} sx={{ mr: 1.5, textTransform: "none" }}>{t('accept')}</Button>
                    <Button variant="contained" onClick={() => setModal2(false)} sx={buttonCloseStyles}>{t('close')}</Button>
                </DialogActions>
            </BootstrapDialog>
        </div>
    );
}

export default MasterDataServices;