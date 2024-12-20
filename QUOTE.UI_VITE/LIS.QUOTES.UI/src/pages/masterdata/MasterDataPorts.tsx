import * as React from 'react';
import { useState, useEffect } from 'react';
import Box from '@mui/material/Box';
import { SnackbarProvider, enqueueSnackbar } from 'notistack';
import { Alert, Button, DialogActions, DialogContent, IconButton, InputLabel, Skeleton, Typography } from '@mui/material';
import Grid from '@mui/material/Grid2';
import { DataGrid, GridColDef, GridRenderCellParams, GridToolbar } from '@mui/x-data-grid';
import { sizingStyles, gridStyles, BootstrapDialog, BootstrapDialogTitle, buttonCloseStyles, BootstrapInput, actionButtonStyles, inputLabelStyles } from '../../utils/misc/styles';
import { Edit, Delete } from '@mui/icons-material';
import { countries } from '../../utils/constants';
import { useTranslation } from 'react-i18next';
import { AxiosError } from 'axios';
import { createPort, deletePort, getPort, getPorts, PortViewModel, updatePort } from '../../api/client/transport';
import CountrySelect from '../../components/shared/CountrySelect';

const MasterDataPorts: any = () => {
    const { t } = useTranslation();
    const [products, setPorts] = useState<any>(null);
    const [loadResults, setLoadResults] = useState<boolean>(true);
    const [loadEdit, setLoadEdit] = useState<boolean>(false);
    const [modal, setModal] = useState<boolean>(false);
    const [modal2, setModal2] = useState<boolean>(false);
    const [testName, setTestName] = useState<string>("");
    const [country, setCountry] = useState<any>(null);
    const [currentId, setCurrentId] = useState<string>("");
    const [currentEditId, setCurrentEditId] = useState<string>("");
    
    const columnsPorts: GridColDef[] = [
        { field: 'portId', headerName: t('id'), flex: 1 },
        { field: 'portName', headerName: t('portName'), flex: 3 },
        { field: 'country', headerName: t('country'), flex: 3 },
        { field: 'xxx', headerName: t('Actions'), renderCell: (params: GridRenderCellParams) => {
            return (
                <Box sx={{ my: 1, mr: 1 }}>
                    <IconButton size="small" title={t('editRowPort')} sx={{ mr: 0.5 }} onClick={() => { setCurrentEditId(params.row.portId); resetForm(); getPortService(params.row.portId); setModal(true); }}>
                        <Edit fontSize="small" />
                    </IconButton>
                    <IconButton size="small" title={t('deleteRowPort')} onClick={() => { setCurrentId(params.row.portId); setModal2(true); }}>
                        <Delete fontSize="small" />
                    </IconButton>
                </Box>
            );
        }, minWidth: 120, flex: 1 },
    ];
    
    useEffect(() => {
        getPortsService();
    }, []);

    const getPortsService = async () => {
        setLoadResults(true);
        try {
            const ports = await getPorts({query: { pageSize: 2000 }});
            setPorts(ports.data);
            setLoadResults(false);
        }
        catch (err: unknown) {
            if(err instanceof AxiosError) {
                console.log(err.response?.data);
            }
            console.log("An error occured");
            setLoadResults(false);
        }
    }
    
    const getPortService = async (id: number) => {
        setLoadEdit(true);
        try {
            const port = await getPort({path: {id: id}});
            var result = port.data;
            setTestName(result?.portName ?? "");
            setCountry(countries.find((elm: any) => elm.label.toUpperCase() === result?.country));
            setLoadEdit(false);
        }
        catch(err: unknown) {
            if(err instanceof AxiosError) {
                console.log(err.response?.data);
            }
            console.log("An error occured");
            setLoadEdit(false);
        }
    }
    
    const createUpdatePortService = async () => {
        if (testName !== "" && country !== null) {
            try {
                var dataSent: PortViewModel;
                var response: any = null;
                if (currentEditId !== "") {
                    dataSent = {
                        "portId": Number(currentEditId),
                        "portName": testName.toUpperCase() || null,
                        "country": String(country.label.toUpperCase()) || null,
                    };
                    response = await updatePort({ body: dataSent, path: {id: Number(currentEditId)} });
                }
                else {
                    dataSent = {
                        "portName": testName.toUpperCase() || null,
                        "country": String(country.label.toUpperCase()) || null,
                    };
                    response = await createPort({ body: dataSent });
                }
                enqueueSnackbar(currentEditId === "" ? t('portAdded') : t('portEdited'), { variant: "success", anchorOrigin: { horizontal: "right", vertical: "top"} });
                getPortsService();
                setModal(false);    
            }
            catch (err: any) {
                console.log(err);
                enqueueSnackbar(t('errorHappened'), { variant: "error", anchorOrigin: { horizontal: "right", vertical: "top"} });
            }
        }
        else {
            enqueueSnackbar(t('verifyMessage'), { variant: "warning", anchorOrigin: { horizontal: "right", vertical: "top"} });
        }
    }
    
    const deletePortService = async (id: number) => {
        try {
            await deletePort({ path: {id: id} });
            enqueueSnackbar(t('rowDeletedSuccess'), { variant: "success", anchorOrigin: { horizontal: "right", vertical: "top"} });
            setModal2(false);
            getPortsService();
        }
        catch (e: any) {
            console.log(e);
            enqueueSnackbar(t('rowDeletedError'), { variant: "error", anchorOrigin: { horizontal: "right", vertical: "top"} });
        }
    }
    
    const resetForm = () => {
        setTestName("");
        setCountry(null);
    }
    
    return (
        <div style={{ background: "#fff", borderTopLeftRadius: 20, borderTopRightRadius: 20 }}>
            <SnackbarProvider />
            <Box py={2.5}>
                <Grid container spacing={2} mt={0} px={5}>
                    <Grid size={{ xs: 12, md: 8 }}>
                        <Typography sx={{ fontSize: 18, mb: 1 }}><b>{t('listPorts')}</b></Typography>
                    </Grid>
                    <Grid size={{ xs: 12, md: 4 }}>
                        <Button 
                            variant="contained" color="inherit" 
                            sx={{ float: "right", backgroundColor: "#fff", textTransform: "none", ml: 2 }} 
                            onClick={() => { getPortsService(); }} 
                        >
                            {t('reload')}
                        </Button>
                        <Button 
                            variant="contained" color="inherit" 
                            sx={{ float: "right", backgroundColor: "#fff", textTransform: "none" }} 
                            onClick={() => { setCurrentEditId(""); resetForm(); setModal(true); }} 
                        >
                            {t('newPort')}
                        </Button>
                    </Grid>
                    <Grid size={{ xs: 12 }}>
                        {
                            !loadResults ? 
                            products !== null && products.length !== 0 ?
                            <Box sx={{ overflow: "auto" }}>
                                <DataGrid
                                    rows={products}
                                    columns={columnsPorts}
                                    initialState={{
                                        pagination: {
                                            paginationModel: {
                                                pageSize: 10,
                                            },
                                        },
                                    }}
                                    pageSizeOptions={[5, 10, 25, 50]}
                                    getRowId={(row: any) => row?.portId}
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
                    <b>{currentEditId === "" ? t('createRowPort') : t('editRowPort')}</b>
                </BootstrapDialogTitle>
                <DialogContent dividers>
                    {
                        loadEdit === false ?
                        <Grid container spacing={2}>
                            <Grid size={{ xs: 12 }}>
                                <InputLabel htmlFor="test-name" sx={inputLabelStyles}>{t('portName')}</InputLabel>
                                <BootstrapInput id="test-name" type="text" value={testName} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTestName(e.target.value)} fullWidth />
                            </Grid>
                            <Grid size={{ xs: 12 }}>
                                <InputLabel htmlFor="test-country" sx={inputLabelStyles}>{t('country')}</InputLabel>
                                <CountrySelect id="test-country" value={country} onChange={setCountry} fullWidth />
                            </Grid>
                        </Grid> : <Skeleton />
                    }
                </DialogContent>
                <DialogActions>
                    <Button variant="contained" onClick={() => { createUpdatePortService(); }} sx={actionButtonStyles}>{t('validate')}</Button>
                    <Button variant="contained" onClick={() => setModal(false)} sx={buttonCloseStyles}>{t('close')}</Button>
                </DialogActions>
            </BootstrapDialog>

            <BootstrapDialog open={modal2} onClose={() => setModal2(false)} maxWidth="sm" fullWidth>
                <BootstrapDialogTitle id="custom-dialog-title" onClose={() => setModal2(false)}>
                    <b>{t('deleteRowPort')}</b>
                </BootstrapDialogTitle>
                <DialogContent dividers>{t('areYouSureDeleteRow')}</DialogContent>
                <DialogActions>
                    <Button variant="contained" color={"primary"} onClick={() => { deletePortService(Number(currentId)); }} sx={{ mr: 1.5, textTransform: "none" }}>{t('accept')}</Button>
                    <Button variant="contained" onClick={() => setModal2(false)} sx={buttonCloseStyles}>{t('close')}</Button>
                </DialogActions>
            </BootstrapDialog>
        </div>
    );
}

export default MasterDataPorts;