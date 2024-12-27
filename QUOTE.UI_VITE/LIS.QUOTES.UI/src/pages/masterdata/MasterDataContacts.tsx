import * as React from 'react';
import { useState, useEffect } from 'react';
import Box from '@mui/material/Box';
import { SnackbarProvider, enqueueSnackbar } from 'notistack';
import { Alert, Button, DialogActions, DialogContent, IconButton, InputLabel, MenuItem, Select, Skeleton, Typography } from '@mui/material';
import { DataGrid, GridColDef, GridRenderCellParams, GridToolbar } from '@mui/x-data-grid';
import Grid from '@mui/material/Grid2';
import { sizingStyles, gridStyles, BootstrapDialog, BootstrapDialogTitle, buttonCloseStyles, BootstrapInput, actionButtonStyles, inputLabelStyles, properties } from '../../utils/misc/styles';
import { Edit } from '@mui/icons-material';
import CountrySelect from '../../components/shared/CountrySelect';
import { categoriesOptions } from '../../utils/constants';
import { MuiTelInput } from 'mui-tel-input';
import { useTranslation } from 'react-i18next';
import { AxiosError } from 'axios';
import { CreateContactViewModel, getContactGetContactByIdById, getContactGetContacts, postContactCreateContact, putContactUpdateContactById, UpdateContactViewModel } from '../../api/client/crm';
import { getCategoryNames } from '../../utils/functions';


const MasterDataContacts: any = () => {
    const { t } = useTranslation();
    
    const [contacts, setContacts] = useState<any>(null);
    const [loadResults, setLoadResults] = useState<boolean>(true);
    const [loadEdit, setLoadEdit] = useState<boolean>(false);
    const [modal, setModal] = useState<boolean>(false);
    // const [modal2, setModal2] = useState<boolean>(false);
    const [testName, setTestName] = useState<string>("");
    const [country, setCountry] = useState<any>(null);
    const [addressCountry, setAddressCountry] = useState<string>("");
    const [testPhone, setTestPhone] = useState<string>("");
    const [testEmail, setTestEmail] = useState<string>("");
    const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
    // const [currentId, setCurrentId] = useState<string>("");
    const [currentEditId, setCurrentEditId] = useState<string>("");
    
    const columnsContacts: GridColDef[] = [
        { field: 'contactId', headerName: t('id'), flex: 0.5 },
        { field: 'contactName', headerName: t('contactName'), flex: 1.75 },
        { field: 'contactNumber', headerName: t('contactNumber'), flex: 0.75 },
        { field: 'phone', headerName: t('phone'), flex: 1 },
        { field: 'email', headerName: t('email'), flex: 1 },
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
                    <IconButton size="small" title={t('editRowContact')} sx={{ mr: 0.5 }} onClick={() => { setCurrentEditId(params.row.contactId); resetForm(); getContactService(params.row.contactId); setModal(true); }}>
                        <Edit fontSize="small" />
                    </IconButton>
                    {/* <IconButton size="small" title={t('deleteRowContact')} onClick={() => { setCurrentId(params.row.contactId); setModal2(true); }}>
                        <Delete fontSize="small" />
                    </IconButton> */}
                </Box>
            );
        }, minWidth: 120, flex: 0.25 },
    ];
    
    useEffect(() => {
        getContactsService();
    }, []);

    const getContactsService = async () => {
        setLoadResults(true);
        try {
            const conts = await getContactGetContacts();
            setContacts(conts.data?.data);
            setLoadResults(false);
        }
        catch (err: unknown) {
            if (err instanceof AxiosError) {
                console.log(err.response?.data);
            }
            console.log("An error occured");
            setLoadResults(false);
        }
    }
        
    const getContactService = async (id: number) => {
        setLoadEdit(true);
        try {
            const cont1 = await getContactGetContactByIdById({path: {id: id}});
            var result = cont1.data;
            setTestName(result?.data?.contactName || "");
            // setCountry(countries.find((elm: any) => elm.label.toUpperCase() === result?.data?.countryCode));
            setTestPhone(result?.data?.phone || "");
            setTestEmail(result?.data?.email || "");
            setSelectedCategories(result?.data?.categories || []);
            // setSelectedCategories(getCategoryNames(result.data?.categories));
            setLoadEdit(false);
        }
        catch (err: unknown) {
            if (err instanceof AxiosError) {
                console.log(err.response?.data);
            }
            console.log("An error occured");
            setLoadEdit(false);
        }
    }

    const createNewContact = async () => {
        if (country !== null && testName !== "" && testPhone !== "" && testEmail !== "" && addressCountry !== "") {
            try {
                var response = null;
                if (currentEditId !== "") {
                    var dataSent: UpdateContactViewModel = {
                        // "contactId": Number(currentEditId),
                        "contactName": testName.toUpperCase(),
                        "addressCountry": addressCountry,
                        "createdBy": 5,
                        "countryCode": country.code,
                        "phone": testPhone,
                        "email": testEmail,
                        // "categories": selectedCategories,
                        "categories": getCategoryNames(selectedCategories)
                    };
                    response = await putContactUpdateContactById({body: dataSent, path: {id: Number(currentEditId)}});
                }
                else {
                    var dataSent2: CreateContactViewModel = {
                        "contactName": testName.toUpperCase(),
                        "addressCountry": addressCountry,
                        "createdBy": 5,
                        "countryCode": country.code,
                        "phone": testPhone,
                        "email": testEmail,
                        "categories": selectedCategories,
                        // "categories": getCategoryNames(selectedCategories)
                    };
                    response = await postContactCreateContact({body: dataSent2});
                }
                enqueueSnackbar(currentEditId === "" ? t('contactAdded') : t('contactEdited'), { variant: "success", anchorOrigin: { horizontal: "right", vertical: "top"} });
                getContactsService();
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
    
    // const deleteContactService = async (id: number) => {
    //     try {
    //         await deleteContactDeleteContactById({path: {id: id}});
    //         enqueueSnackbar(t('rowDeletedSuccess'), { variant: "success", anchorOrigin: { horizontal: "right", vertical: "top"} });
    //         setModal2(false);
    //         getContactsService();
    //     }
    //     catch (e: any) {
    //         console.log(e);
    //         enqueueSnackbar(t('rowDeletedError'), { variant: "error", anchorOrigin: { horizontal: "right", vertical: "top"} });
    //     }
    // }

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
                    <Grid size={{xs: 12, md: 8}}>
                        <Typography sx={{ fontSize: 18, mb: 1 }}><b>{t('listContacts')}</b></Typography>
                    </Grid>
                    <Grid size={{xs: 12, md: 4}}>
                        <Button 
                            variant="contained" color="inherit" 
                            sx={{ float: "right", backgroundColor: "#fff", textTransform: "none", ml: 2 }} 
                            onClick={() => { getContactsService(); }} 
                        >
                            {t('reload')}
                        </Button>
                        <Button 
                            variant="contained" color="inherit" 
                            sx={{ float: "right", backgroundColor: "#fff", textTransform: "none" }} 
                            onClick={() => { setCurrentEditId(""); resetForm(); setModal(true); }} 
                        >
                            {t('newContact')}
                        </Button>
                    </Grid>
                    <Grid size={{xs: 12}}>
                        {
                            !loadResults ? 
                            contacts !== null && contacts.length !== 0 ?
                            <Box sx={{ overflow: "auto" }}>
                                <DataGrid
                                    rows={contacts}
                                    columns={columnsContacts}
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
                            <Grid size={{xs: 12}}>
                                <InputLabel htmlFor="test-name" sx={inputLabelStyles}>{t('contactName')}</InputLabel>
                                <BootstrapInput id="test-name" type="text" value={testName} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTestName(e.target.value)} fullWidth />
                            </Grid>
                            <Grid size={{xs: 12}}>
                                <InputLabel htmlFor="addressCountry" sx={inputLabelStyles}>{t('addressCountry')}</InputLabel>
                                <BootstrapInput id="addressCountry" type="text" value={addressCountry} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setAddressCountry(e.target.value)} fullWidth />
                            </Grid>
                            <Grid size={{xs: 12}}>
                                <InputLabel htmlFor="countryCode" sx={inputLabelStyles}>{t('countryCode')}</InputLabel>
                                <CountrySelect id="countryCode" value={country} onChange={setCountry} fullWidth />
                            </Grid>
                            <Grid size={{xs: 12}}>
                                <InputLabel htmlFor="my-email" sx={inputLabelStyles}>{t('emailAddress')}</InputLabel>
                                <BootstrapInput id="my-email" type="email" value={testEmail} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTestEmail(e.target.value)} fullWidth />
                            </Grid>
                            <Grid size={{xs: 12}}>
                                <InputLabel htmlFor="phone-number" sx={inputLabelStyles}>{t('whatsappNumber')}</InputLabel>
                                <MuiTelInput 
                                    id="phone-number" 
                                    value={testPhone} 
                                    size="small"
                                    onChange={setTestPhone} 
                                    defaultCountry="CM" 
                                    preferredCountries={["CM", "BE", "KE"]} 
                                    fullWidth 
                                    sx={{ mt: 1 }}
                                    {...properties} 
                                />
                            </Grid>
                            <Grid size={{xs: 12}}>
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

            {/* <BootstrapDialog open={modal2} onClose={() => setModal2(false)} maxWidth="sm" fullWidth>
                <BootstrapDialogTitle id="custom-dialog-title" onClose={() => setModal2(false)}>
                    <b>{t('deleteRowContact')}</b>
                </BootstrapDialogTitle>
                <DialogContent dividers>{t('areYouSureDeleteRow')}</DialogContent>
                <DialogActions>
                    <Button variant="contained" color={"primary"} onClick={() => { deleteContactService(Number(currentId)); }} sx={{ mr: 1.5, textTransform: "none" }}>{t('accept')}</Button>
                    <Button variant="contained" onClick={() => setModal2(false)} sx={buttonCloseStyles}>{t('close')}</Button>
                </DialogActions>
            </BootstrapDialog> */}
        </div>
    );
}

export default MasterDataContacts;