import * as React from 'react';
import { useState, useEffect } from 'react';
import Box from '@mui/material/Box';
import { SnackbarProvider, enqueueSnackbar } from 'notistack';
import { useMsal, useAccount } from '@azure/msal-react';
import { useAuthorizedBackendApi } from '../api/api';
import { protectedResources, transportRequest } from '../config/authConfig';
import { BackendService } from '../utils/services/fetch';
import { AuthenticationResult } from '@azure/msal-browser';
import { Alert, Button, DialogActions, DialogContent, Grid, IconButton, InputLabel, MenuItem, Select, Skeleton, Typography } from '@mui/material';
import { DataGrid, GridColDef, GridRenderCellParams, GridToolbar } from '@mui/x-data-grid';
import { t } from 'i18next';
import { sizingStyles, gridStyles, BootstrapDialog, BootstrapDialogTitle, buttonCloseStyles, BootstrapInput, actionButtonStyles, inputLabelStyles } from '../utils/misc/styles';
import { Edit, Delete } from '@mui/icons-material';
import CountrySelect from '../components/shared/CountrySelect';
import { countries } from '../utils/constants';
import { getAccessToken } from '../utils/functions';

const MasterDataFiles: any = (props: any) => {
    const [products, setFiles] = useState<any>(null);
    const [loadResults, setLoadResults] = useState<boolean>(true);
    const [loadEdit, setLoadEdit] = useState<boolean>(false);
    const [modal, setModal] = useState<boolean>(false);
    const [modal2, setModal2] = useState<boolean>(false);
    const [testName, setTestName] = useState<string>("");
    const [country, setCountry] = useState<any>(null);
    const [currentId, setCurrentId] = useState<string>("");
    const [currentEditId, setCurrentEditId] = useState<string>("");
    const [tempToken, setTempToken] = useState<string>("");
    
    const { instance, accounts } = useMsal();
    const account = useAccount(accounts[0] || {});
    const context = useAuthorizedBackendApi();
    
    const getFiles = async () => {
        if (context && account) {
            setLoadResults(true);
            const token = await getAccessToken(instance, transportRequest, account);
            const response = await (context as BackendService<any>).getWithToken(protectedResources.apiLisTransport.endPoint+"/File/Files?pageSize=2000", token);
            if (response !== null && response !== undefined) {
                setFiles(response);
                setLoadResults(false);
                setTempToken(token);
                // setFiles(response.filter((obj: any) => obj.productsTypeId.includes(5) || obj.productsTypeId.includes(2))); // Filter the products for miscellaneous (MISCELLANEOUS = 5 & HAULAGE = 2)
            }
            else {
                setLoadResults(false);
            }
        }
    }
    
    const deleteFile = async (id: string) => {
        if (context && account) {
            try {
                const response = await (context as BackendService<any>).deleteWithToken(protectedResources.apiLisTransport.endPoint+"/File/DeleteFile/"+id, tempToken);
                console.log(response);
                enqueueSnackbar(t('rowDeletedSuccess'), { variant: "success", anchorOrigin: { horizontal: "right", vertical: "top"} });
                setModal2(false);
                getFiles();
            }
            catch (e: any) {
                console.log(e);
                enqueueSnackbar(t('rowDeletedError'), { variant: "error", anchorOrigin: { horizontal: "right", vertical: "top"} });
            }
        }
    }
    
    useEffect(() => {
        getFiles();
    }, []);

    const columnsFiles: GridColDef[] = [
        { field: 'portId', headerName: t('id'), flex: 1 },
        { field: 'portName', headerName: t('portName'), flex: 3 },
        { field: 'country', headerName: t('country'), flex: 3 },
        { field: 'xxx', headerName: t('Actions'), renderCell: (params: GridRenderCellParams) => {
            return (
                <Box sx={{ my: 1, mr: 1 }}>
                    <IconButton size="small" title={t('editRowFile')} sx={{ mr: 0.5 }} onClick={() => { setCurrentEditId(params.row.portId); resetForm(); getFile(params.row.portId); setModal(true); }}>
                        <Edit fontSize="small" />
                    </IconButton>
                    <IconButton size="small" title={t('deleteRowFile')} onClick={() => { setCurrentId(params.row.portId); setModal2(true); }}>
                        <Delete fontSize="small" />
                    </IconButton>
                </Box>
            );
        }, minWidth: 120, flex: 1 },
    ];
    
    const createNewFile = async () => {
        if (testName !== "" && country !== null) {
            if (account && context) {
                const token = await getAccessToken(instance, transportRequest, account);
                
                try {
                    var dataSent = null;
                    var response = null;
                    if (currentEditId !== "") {
                        dataSent = {
                            "portId": currentEditId,
                            "portName": testName.toUpperCase(),
                            "country": country.label.toUpperCase(),
                        };
                        response = await (context as BackendService<any>).putWithToken(protectedResources.apiLisTransport.endPoint+"/File/UpdateFile/"+currentEditId, dataSent, token);
                    }
                    else {
                        dataSent = {
                            "portName": testName.toUpperCase(),
                            "country": country.label.toUpperCase(),
                        };
                        response = await (context as BackendService<any>).postWithToken(protectedResources.apiLisTransport.endPoint+"/File/CreateFile", dataSent, token);
                    }
                    enqueueSnackbar(currentEditId === "" ? "The port has been added with success!" : "The port has been edited with success!", { variant: "success", anchorOrigin: { horizontal: "right", vertical: "top"} });
                    getFiles();
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
    
    const getFile = async (id: string) => {
        setLoadEdit(true)
        if (context && account) {
            const response = await (context as BackendService<any>).getWithToken(protectedResources.apiLisTransport.endPoint+"/File/GetFile/"+id, tempToken);
            if (response !== null && response !== undefined) {
                console.log(response);
                setTestName(response.portName);
                setCountry(countries.find((elm: any) => elm.label.toUpperCase() === response.country));
                setLoadEdit(false);
            }
            else {
                setLoadEdit(false);
            }
            // console.log(response);
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
                    <Grid item xs={12} md={8}>
                        <Typography sx={{ fontSize: 18, mb: 1 }}><b>{t('listFiles')}</b></Typography>
                    </Grid>
                    <Grid item xs={12} md={4}>
                        <Button 
                            variant="contained" color="inherit" 
                            sx={{ float: "right", backgroundColor: "#fff", textTransform: "none" }} 
                            onClick={() => { setCurrentEditId(""); resetForm(); setModal(true); }} 
                        >
                            {t('newFile')}
                        </Button>
                    </Grid>
                    <Grid item xs={12}>
                        {
                            !loadResults ? 
                            products !== null && products.length !== 0 ?
                            <Box sx={{ overflow: "auto" }}>
                                <DataGrid
                                    rows={products}
                                    columns={columnsFiles}
                                    // hideFooter
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
                                    // onRowClick={handleRowSeafreightsClick}
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
                    <b>{currentEditId === "" ? t('createRowFile') : t('editRowFile')}</b>
                </BootstrapDialogTitle>
                <DialogContent dividers>
                    {
                        loadEdit === false ?
                        <Grid container spacing={2}>
                            <Grid item xs={12}>
                                <InputLabel htmlFor="test-name" sx={inputLabelStyles}>{t('portName')}</InputLabel>
                                <BootstrapInput id="test-name" type="text" value={testName} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTestName(e.target.value)} fullWidth />
                            </Grid>
                            <Grid item xs={12}>
                                <InputLabel htmlFor="test-country" sx={inputLabelStyles}>{t('country')}</InputLabel>
                                <CountrySelect id="test-country" value={country} onChange={setCountry} fullWidth />
                            </Grid>
                        </Grid> : <Skeleton />
                    }
                </DialogContent>
                <DialogActions>
                    <Button variant="contained" onClick={() => { createNewFile(); }} sx={actionButtonStyles}>{t('validate')}</Button>
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
                    <b>{t('deleteRowFile')}</b>
                </BootstrapDialogTitle>
                <DialogContent dividers>{t('areYouSureDeleteRow')}</DialogContent>
                <DialogActions>
                    <Button variant="contained" color={"primary"} onClick={() => { deleteFile(currentId); }} sx={{ mr: 1.5, textTransform: "none" }}>{t('accept')}</Button>
                    <Button variant="contained" onClick={() => setModal2(false)} sx={buttonCloseStyles}>{t('close')}</Button>
                </DialogActions>
            </BootstrapDialog>
        </div>
    );
}

export default MasterDataFiles;