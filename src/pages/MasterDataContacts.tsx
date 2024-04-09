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
import { MuiTelInput } from 'mui-tel-input';

const MasterDataContacts: any = (props: any) => {
    const [products, setContacts] = useState<any>(null);
    const [loadResults, setLoadResults] = useState<boolean>(true);
    const [loadEdit, setLoadEdit] = useState<boolean>(false);
    const [modal, setModal] = useState<boolean>(false);
    const [modal2, setModal2] = useState<boolean>(false);
    const [testName, setTestName] = useState<string>("");
    const [country, setCountry] = useState<any>(null);
    const [addressCountry, setAddressCountry] = useState<string>("");
    const [testPhone, setTestPhone] = useState<string>("");
    const [testEmail, setTestEmail] = useState<string>("");
    const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
    const [currentId, setCurrentId] = useState<string>("");
    const [currentEditId, setCurrentEditId] = useState<string>("");
    const [tempToken, setTempToken] = useState<string>("");
    
    const { instance, accounts } = useMsal();
    const account = useAccount(accounts[0] || {});
    const context = useAuthorizedBackendApi();
    
    const categoriesOptions = [
        {value: 1, name: "CUSTOMERS"},
        {value: 2, name: "SUPPLIERS"},
        {value: 3, name: "CHARGEUR"},
        {value: 4, name: "RECEIVER"},
        {value: 5, name: "SHIPPING_LINES"},
        {value: 6, name: "BANK"},
        {value: 7, name: "SHIPPING_AGENCY11"},
    ];

    function getCategoryNames(inputArray: any) {
        return inputArray.map((id: any) => {
            const category = categoriesOptions.find(category => category.value === id);
            return category ? category.name : null;
        }).filter((name: any) => name !== null);
    }
      
    const getContacts = async () => {
        if (context && account) {
            setLoadResults(true);

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
            
            const response = await (context as BackendService<any>).getWithToken(protectedResources.apiLisCrm.endPoint+"/Contact/GetContacts?pageSize=4000", token);
            if (response !== null && response !== undefined) {
                setContacts(response.data);
                setLoadResults(false);
                setTempToken(token);
                // setContacts(response.filter((obj: any) => obj.productsTypeId.includes(5) || obj.productsTypeId.includes(2))); // Filter the products for miscellaneous (MISCELLANEOUS = 5 & HAULAGE = 2)
            }
            else {
                setLoadResults(false);
            }
        }
    }
    
    const deleteContact = async (id: string) => {
        if (context && account) {
            try {
                const response = await (context as BackendService<any>).deleteWithToken(protectedResources.apiLisCrm.endPoint+"/Contact/DeleteContact/"+id, tempToken);
                console.log(response);
                enqueueSnackbar(t('rowDeletedSuccess'), { variant: "success", anchorOrigin: { horizontal: "right", vertical: "top"} });
                setModal2(false);
                getContacts();
            }
            catch (e: any) {
                console.log(e);
                enqueueSnackbar(t('rowDeletedError'), { variant: "error", anchorOrigin: { horizontal: "right", vertical: "top"} });
            }
        }
    }
    
    useEffect(() => {
        getContacts();
    }, []);

    const columnsContacts: GridColDef[] = [
        { field: 'contactId', headerName: t('id'), flex: 0.5 },
        { field: 'contactName', headerName: t('contactName'), flex: 1.75 },
        { field: 'contactNumber', headerName: t('contactNumber'), flex: 0.75 },
        { field: 'phone', headerName: t('phone'), flex: 1 },
        { field: 'email', headerName: t('email'), flex: 1 },
        // { field: 'countryCode', headerName: t('countryCode'), flex: 0.5 },
        { field: 'categories', headerName: t('categories'), renderCell: (params: GridRenderCellParams) => {
            return (
                <Box sx={{ my: 2 }}>
                    {
                        params.row.categories.map((id: any) => categoriesOptions.find((service: any) => service.value === id)?.name)
                        .filter(Boolean)
                        .join(", ")
                    }
                </Box>
            );
        }, flex: 1 },
        { field: 'xxx', headerName: t('Actions'), renderCell: (params: GridRenderCellParams) => {
            return (
                <Box sx={{ my: 1, mr: 1 }}>
                    <IconButton size="small" title={t('editRowContact')} sx={{ mr: 0.5 }} onClick={() => { setCurrentEditId(params.row.contactId); resetForm(); getContact(params.row.contactId); setModal(true); }}>
                        <Edit fontSize="small" />
                    </IconButton>
                    <IconButton size="small" title={t('deleteRowContact')} onClick={() => { setCurrentId(params.row.contactId); setModal2(true); }}>
                        <Delete fontSize="small" />
                    </IconButton>
                </Box>
            );
        }, minWidth: 120, flex: 0.25 },
    ];
    
    const createNewContact = async () => {
        if (country !== null && testName !== "" && testPhone !== "" && testEmail !== "" && addressCountry !== "") {
            if (account && context) {
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
                
                try {
                    var dataSent = null;
                    var response = null;
                    if (currentEditId !== "") {
                        dataSent = {
                            "contactId": currentEditId,
                            "contactName": testName.toUpperCase(),
                            "addressCountry": addressCountry,
                            "createdBy": 5,
                            "countryCode": country.code,
                            "phone": testPhone,
                            "email": testEmail,
                            "categories": getCategoryNames(selectedCategories)
                        };
                        response = await (context as BackendService<any>).putWithToken(protectedResources.apiLisCrm.endPoint+"/Contact/UpdateContact/"+currentEditId, dataSent, token);
                    }
                    else {
                        dataSent = {
                            "contactName": testName.toUpperCase(),
                            "addressCountry": addressCountry,
                            "createdBy": 5,
                            "countryCode": country.code,
                            "phone": testPhone,
                            "email": testEmail,
                            "categories": getCategoryNames(selectedCategories)
                        };
                        response = await (context as BackendService<any>).postWithToken(protectedResources.apiLisCrm.endPoint+"/Contact/CreateContact", dataSent, token);
                    }
                    enqueueSnackbar(currentEditId === "" ? "The port has been added with success!" : "The port has been edited with success!", { variant: "success", anchorOrigin: { horizontal: "right", vertical: "top"} });
                    getContacts();
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
    
    const getContact = async (id: string) => {
        setLoadEdit(true)
        if (context && account) {
            const response = await (context as BackendService<any>).getWithToken(protectedResources.apiLisCrm.endPoint+"/Contact/GetContactById/"+id, tempToken);
            if (response !== null && response !== undefined) {
                console.log(response);
                setTestName(response.data.contactName);
                setCountry(countries.find((elm: any) => elm.label.toUpperCase() === response.data.countryCode));
                setTestPhone(response.data.phone);
                setTestEmail(response.data.email);
                setSelectedCategories(response.data.categories);
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
        setTestPhone("");
        setTestEmail("");
        setSelectedCategories([]);
        setAddressCountry("");
    }
    
    return (
        <div style={{ background: "#fff", borderTopLeftRadius: 20, borderTopRightRadius: 20 }}>
            <SnackbarProvider />
            <Box py={2.5}>
                <Grid container spacing={2} mt={0} px={5}>
                    <Grid item xs={12} md={8}>
                        <Typography sx={{ fontSize: 18, mb: 1 }}><b>{t('listContacts')}</b></Typography>
                    </Grid>
                    <Grid item xs={12} md={4}>
                        <Button 
                            variant="contained" color="inherit" 
                            sx={{ float: "right", backgroundColor: "#fff", textTransform: "none" }} 
                            onClick={() => { setCurrentEditId(""); resetForm(); setModal(true); }} 
                        >
                            {t('newContact')}
                        </Button>
                    </Grid>
                    <Grid item xs={12}>
                        {
                            !loadResults ? 
                            products !== null && products.length !== 0 ?
                            <Box sx={{ overflow: "auto" }}>
                                <DataGrid
                                    rows={products}
                                    columns={columnsContacts}
                                    // hideFooter
                                    initialState={{
                                        pagination: {
                                            paginationModel: {
                                                pageSize: 10,
                                            },
                                        },
                                    }}
                                    pageSizeOptions={[5, 10, 25, 50]}
                                    getRowId={(row: any) => row?.contactId}
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
                    <b>{currentEditId === "" ? t('createRowContact') : t('editRowContact')}</b>
                </BootstrapDialogTitle>
                <DialogContent dividers>
                    {
                        loadEdit === false ?
                        <Grid container spacing={2}>
                            <Grid item xs={12}>
                                <InputLabel htmlFor="test-name" sx={inputLabelStyles}>{t('contactName')}</InputLabel>
                                <BootstrapInput id="test-name" type="text" value={testName} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTestName(e.target.value)} fullWidth />
                            </Grid>
                            <Grid item xs={12}>
                                <InputLabel htmlFor="addressCountry" sx={inputLabelStyles}>{t('addressCountry')}</InputLabel>
                                <BootstrapInput id="addressCountry" type="text" value={addressCountry} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setAddressCountry(e.target.value)} fullWidth />
                            </Grid>
                            <Grid item xs={12}>
                                <InputLabel htmlFor="countryCode" sx={inputLabelStyles}>{t('countryCode')}</InputLabel>
                                <CountrySelect id="countryCode" value={country} onChange={setCountry} fullWidth />
                            </Grid>
                            <Grid item xs={12}>
                                <InputLabel htmlFor="my-email" sx={inputLabelStyles}>{t('emailAddress')}</InputLabel>
                                <BootstrapInput id="my-email" type="email" value={testEmail} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTestEmail(e.target.value)} fullWidth />
                            </Grid>
                            <Grid item xs={12}>
                                <InputLabel htmlFor="phone-number" sx={inputLabelStyles}>{t('whatsappNumber')}</InputLabel>
                                <MuiTelInput id="phone-number" value={testPhone} onChange={setTestPhone} defaultCountry="CM" preferredCountries={["CM", "BE", "KE"]} fullWidth sx={{ mt: 1 }} />
                            </Grid>
                            <Grid item xs={12}>
                                <InputLabel htmlFor="test-categories" sx={inputLabelStyles}>{t('categories')}</InputLabel>
                                <Select
                                    labelId="test-categories"
                                    id="test-selected-categories"
                                    multiple
                                    value={selectedCategories}
                                    onChange={(e: any) => setSelectedCategories(e.target.value as string[])}
                                    fullWidth
                                    input={<BootstrapInput />}
                                    renderValue={(selected: any) => selected.map((value: any) => categoriesOptions.find((type: any) => type.value === value)?.name).join(', ')}
                                >
                                    {categoriesOptions.map((contactType: any) => (
                                        <MenuItem key={contactType.value} value={contactType.value}>
                                            {contactType?.name}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </Grid>
                        </Grid> : <Skeleton />
                    }
                </DialogContent>
                <DialogActions>
                    <Button variant="contained" onClick={() => { createNewContact(); }} sx={actionButtonStyles}>{t('validate')}</Button>
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
                    <b>{t('deleteRowContact')}</b>
                </BootstrapDialogTitle>
                <DialogContent dividers>{t('areYouSureDeleteRow')}</DialogContent>
                <DialogActions>
                    <Button variant="contained" color={"primary"} onClick={() => { deleteContact(currentId); }} sx={{ mr: 1.5, textTransform: "none" }}>{t('accept')}</Button>
                    <Button variant="contained" onClick={() => setModal2(false)} sx={buttonCloseStyles}>{t('close')}</Button>
                </DialogActions>
            </BootstrapDialog>
        </div>
    );
}

export default MasterDataContacts;