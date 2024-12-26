import * as React from 'react';
import { useState, useEffect } from 'react';
import { SnackbarProvider, enqueueSnackbar } from 'notistack';
import { useMsal, useAccount } from '@azure/msal-react';
import { useAuthorizedBackendApi } from '../../api/api';
import { protectedResources } from '../../config/authConfig';
import { BackendService } from '../../utils/services/fetch';
import { Alert, Box, Button, DialogActions, DialogContent, Grid, IconButton, InputLabel, Skeleton, Typography } from '@mui/material';
import { DataGrid, GridColDef, GridRenderCellParams, GridToolbar } from '@mui/x-data-grid';
// import { t } from 'i18next';
import { sizingStyles, gridStyles, BootstrapDialog, BootstrapDialogTitle, buttonCloseStyles, BootstrapInput, actionButtonStyles, inputLabelStyles } from '../../utils/misc/styles';
import { Edit, Delete } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { CategoryEnum } from '../../utils/constants';
import CompanySearch from '../../components/shared/CompanySearch';

const MasterDataShips: any = (props: any) => {
    const { t } = useTranslation();
    
    const [ships, setShips] = useState<any>(null);
    const [loadResults, setLoadResults] = useState<boolean>(true);
    const [loadEdit, setLoadEdit] = useState<boolean>(false);
    const [modal, setModal] = useState<boolean>(false);
    const [modal2, setModal2] = useState<boolean>(false);
    const [testName, setTestName] = useState<string>("");
    const [contacts, setContacts] = useState<any>(null);
    const [contact, setContact] = useState<any>(null);
    const [currentId, setCurrentId] = useState<string>("");
    const [currentEditId, setCurrentEditId] = useState<string>("");
    
    const { instance, accounts } = useMsal();
    const account = useAccount(accounts[0] || {});
    const context = useAuthorizedBackendApi();
    
    var ourContacts: any = useSelector((state: any) => state.masterdata.contactBusinesses.data);
    
    const getContacts = async () => {
        if (account && instance && context && contacts === null) {
            if (ourContacts !== undefined && ourContacts.length !== 0) {
                console.log(ourContacts);
                setContacts(ourContacts);
            }
            else {
                const response = await (context?.service as BackendService<any>).getWithToken(protectedResources.apiLisCrm.endPoint+"/Contact/GetContacts?pageSize=4000", context.tokenCrm);
                if (response !== null && response !== undefined) {
                    console.log(response);
                    setContacts(response.data);
                }
            }
        }
    }

    const getShips = async () => {
        if (account && instance && context) {
            setLoadResults(true);
            const response = await (context?.service as BackendService<any>).getSingle(protectedResources.apiLisShipments.endPoint+"/Ships?count=1000");
            if (response !== null && response !== undefined) {
                setShips(response.$values);
                setLoadResults(false);
            }
            else {
                setLoadResults(false);
            }
        }
    }
    
    const deleteShipPrice = async (id: string) => {
        if (account && instance && context) {
            try {
                const response = await (context?.service as BackendService<any>).delete(protectedResources.apiLisShipments.endPoint+"/Ships/"+id);
                console.log(response);
                enqueueSnackbar(t('rowDeletedSuccess'), { variant: "success", anchorOrigin: { horizontal: "right", vertical: "top"} });
                setModal2(false);
                getShips();
            }
            catch (e: any) {
                console.log(e);
                enqueueSnackbar(t('rowDeletedError'), { variant: "error", anchorOrigin: { horizontal: "right", vertical: "top"} });
            }
        }
    }
    
    useEffect(() => {
        getShips();
        getContacts();
    }, [account, instance, account]);

    const columnsShips: GridColDef[] = [
        { field: 'shipId', headerName: t('id'), flex: 1 },
        { field: 'shipName', headerName: t('shipName'), flex: 2 },
        { field: 'contactId', headerName: t('contactName'), renderCell: (params: GridRenderCellParams) => {
            return (
                <Box>
                    {
                        contacts !== null && contacts !== undefined && params.row.contactId !== null ? 
                        <>
                            {
                                contacts.find((elm: any) => elm.contactId === params.row.contactId) !== undefined ? 
                                contacts.find((elm: any) => elm.contactId === params.row.contactId).contactName : "N/A"
                            }
                        </> : <span>N/A</span>
                    }
                </Box>
            );
        }, flex: 2 },
        { field: 'xxx', headerName: t('Actions'), renderCell: (params: GridRenderCellParams) => {
            return (
                <Box sx={{ my: 1, mr: 1 }}>
                    <IconButton size="small" title={t('editRowShip')} sx={{ mr: 0.5 }} onClick={() => { setCurrentEditId(params.row.shipId); resetForm(); getShip(params.row.shipId); setModal(true); }}>
                        <Edit fontSize="small" />
                    </IconButton>
                    <IconButton size="small" title={t('deleteRowShip')} onClick={() => { setCurrentId(params.row.shipId); setModal2(true); }}>
                        <Delete fontSize="small" />
                    </IconButton>
                </Box>
            );
        }, minWidth: 120, flex: 1 },
    ];
    
    const createNewShip = async () => {
        if (testName !== "" && contact !== null) {
            if (account && instance && context) {
                try {
                    var dataSent = null;
                    var response = null;
                    if (currentEditId !== "") {
                        dataSent = {
                            "shipId": currentEditId,
                            "shipName": testName,
                            "contactId": contact.contactId,
                            "carrierCode": null
                        };
                        response = await (context?.service as BackendService<any>).putWithToken(protectedResources.apiLisShipments.endPoint+"/Ships/"+currentEditId, dataSent, context.tokenLogin);
                    }
                    else {
                        dataSent = {
                            "shipName": testName,
                            "contactId": contact.contactId,
                            "carrierCode": null
                        };
                        response = await (context?.service as BackendService<any>).postWithToken(protectedResources.apiLisShipments.endPoint+"/Ships", dataSent, context.tokenLogin);
                    }
                    enqueueSnackbar(currentEditId === "" ? "The ship has been added with success!" : "The ship has been edited with success!", { variant: "success", anchorOrigin: { horizontal: "right", vertical: "top"} });
                    getShips();
                    setModal(false);    
                }
                catch (err: any) {
                    console.log(err);
                    enqueueSnackbar(t('errorHappened'), { variant: "error", anchorOrigin: { horizontal: "right", vertical: "top"} });
                }
            }
        }
        else {
            enqueueSnackbar(t('verifyMessage'), { variant: "warning", anchorOrigin: { horizontal: "right", vertical: "top"} });
        }
    }
    
    const getShip = async (id: string) => {
        setLoadEdit(true)
        if (account && instance && context) {
            const response = await (context?.service as BackendService<any>).getSingle(protectedResources.apiLisShipments.endPoint+"/Ships/"+id);
            if (response !== null && response !== undefined) {
                console.log(response);
                setTestName(response.shipName);
                setLoadEdit(false);
            }
            else {
                setLoadEdit(false);
            }
        }
    }
    
    const resetForm = () => {
        setTestName("");
    }
    
    return (
        <div style={{ background: "#fff", borderTopLeftRadius: 20, borderTopRightRadius: 20 }}>
            <SnackbarProvider />
            <Box py={2.5}>
                <Grid container spacing={2} mt={0} px={5}>
                    <Grid item xs={12} md={8}>
                        <Typography sx={{ fontSize: 18, mb: 1 }}><b>{t('listShips')}</b></Typography>
                    </Grid>
                    <Grid item xs={12} md={4}>
                        <Button 
                            variant="contained" color="inherit" 
                            sx={{ float: "right", backgroundColor: "#fff", textTransform: "none", ml: 2 }} 
                            onClick={() => { getShips(); }} 
                        >
                            {t('reload')}
                        </Button>
                        <Button 
                            variant="contained" color="inherit" 
                            sx={{ float: "right", backgroundColor: "#fff", textTransform: "none" }} 
                            onClick={() => { setCurrentEditId(""); resetForm(); setModal(true); }} 
                        >
                            {t('newShip')}
                        </Button>
                    </Grid>
                    <Grid item xs={12}>
                        {
                            !loadResults ? 
                            ships !== null && ships.length !== 0 ?
                            <Box sx={{ overflow: "auto" }}>
                                <DataGrid
                                    rows={ships}
                                    columns={columnsShips}
                                    initialState={{
                                        pagination: {
                                            paginationModel: {
                                                pageSize: 10,
                                            },
                                        },
                                    }}
                                    pageSizeOptions={[5, 10, 25, 50]}
                                    getRowId={(row: any) => row?.shipId}
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
                    <b>{currentEditId === "" ? t('createRowShip') : t('editRowShip')}</b>
                </BootstrapDialogTitle>
                <DialogContent dividers>
                    {
                        loadEdit === false ?
                        <Grid container spacing={2}>
                            <Grid item xs={12}>
                                <InputLabel htmlFor="test-name" sx={inputLabelStyles}>Ship name</InputLabel>
                                <BootstrapInput id="test-name" type="text" value={testName} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTestName(e.target.value)} fullWidth />
                            </Grid>
                            <Grid item xs={12}>
                                <InputLabel htmlFor="contact" sx={inputLabelStyles}>Contact</InputLabel>
                                <CompanySearch id="contact" value={contact} onChange={setContact} category={CategoryEnum.SHIPPING_LINES} fullWidth />
                            </Grid>
                        </Grid> : <Skeleton />
                    }
                </DialogContent>
                <DialogActions>
                    <Button variant="contained" onClick={() => { createNewShip(); }} sx={actionButtonStyles}>{t('validate')}</Button>
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
                    <b>{t('deleteRowShip')}</b>
                </BootstrapDialogTitle>
                <DialogContent dividers>{t('areYouSureDeleteRow')}</DialogContent>
                <DialogActions>
                    <Button variant="contained" color={"primary"} onClick={() => { deleteShipPrice(currentId); }} sx={{ mr: 1.5, textTransform: "none" }}>{t('accept')}</Button>
                    <Button variant="contained" onClick={() => setModal2(false)} sx={buttonCloseStyles}>{t('close')}</Button>
                </DialogActions>
            </BootstrapDialog>
        </div>
    );
}

export default MasterDataShips;