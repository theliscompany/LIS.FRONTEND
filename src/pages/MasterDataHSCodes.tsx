import * as React from 'react';
import { useState, useEffect } from 'react';
import { SnackbarProvider, enqueueSnackbar } from 'notistack';
import { useMsal, useAccount } from '@azure/msal-react';
import { useAuthorizedBackendApi } from '../api/api';
import { protectedResources } from '../config/authConfig';
import { BackendService } from '../utils/services/fetch';
import { Alert, Box, Button, DialogActions, DialogContent, Grid, IconButton, InputLabel, Skeleton, Typography } from '@mui/material';
import { DataGrid, GridColDef, GridRenderCellParams, GridToolbar } from '@mui/x-data-grid';
// import { t } from 'i18next';
import { sizingStyles, gridStyles, BootstrapDialog, BootstrapDialogTitle, buttonCloseStyles, BootstrapInput, actionButtonStyles, inputLabelStyles } from '../utils/misc/styles';
import { Edit, Delete } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';

const MasterDataHSCodes: any = (props: any) => {
    const { t } = useTranslation();
    
    const [products, setHSCodes] = useState<any>(null);
    const [loadResults, setLoadResults] = useState<boolean>(true);
    const [loadEdit, setLoadEdit] = useState<boolean>(false);
    const [modal, setModal] = useState<boolean>(false);
    const [modal2, setModal2] = useState<boolean>(false);
    const [testName, setTestName] = useState<string>("");
    const [category, setCategory] = useState<string>("");
    const [descriptionFr, setDescriptionFr] = useState<string>("");
    const [descriptionEn, setDescriptionEn] = useState<string>("");
    const [descriptionNl, setDescriptionNl] = useState<string>("");
    const [currentId, setCurrentId] = useState<string>("");
    const [currentEditId, setCurrentEditId] = useState<string>("");
    
    const { instance, accounts } = useMsal();
    const account = useAccount(accounts[0] || {});
    const context = useAuthorizedBackendApi();
    
    const getHSCodes = async () => {
        if (account && instance && context) {
            setLoadResults(true);
            const response = await (context?.service as BackendService<any>).getWithToken(protectedResources.apiLisQuotes.endPoint+"/HSCodeLIS", context.tokenLogin);
            if (response !== null && response !== undefined) {
                setHSCodes(response);
                setLoadResults(false);
            }
            else {
                setLoadResults(false);
            }
        }
    }
    
    const deleteHSCodePrice = async (id: string) => {
        if (account && instance && context) {
            try {
                const response = await (context?.service as BackendService<any>).deleteWithToken(protectedResources.apiLisQuotes.endPoint+"/HSCodeLIS/"+id, context.tokenLogin);
                console.log(response);
                enqueueSnackbar(t('rowDeletedSuccess'), { variant: "success", anchorOrigin: { horizontal: "right", vertical: "top"} });
                setModal2(false);
                getHSCodes();
            }
            catch (e: any) {
                console.log(e);
                enqueueSnackbar(t('rowDeletedError'), { variant: "error", anchorOrigin: { horizontal: "right", vertical: "top"} });
            }
        }
    }
    
    useEffect(() => {
        getHSCodes();
    }, [account, instance, account]);

    const columnsHSCodes: GridColDef[] = [
        { field: 'hS_Code', headerName: t('id'), flex: 1 },
        // { field: 'productName', headerName: t('productName'), flex: 3 },
        { field: '_4_digit_categories', headerName: t('category'), flex: 1 },
        { field: 'product_description_En', headerName: "Description - EN", flex: 3 },
        { field: 'product_description_Fr', headerName: "Description - FR", flex: 3 },
        { field: 'product_description_NL', headerName: "Description - NL", flex: 3 },
        // { field: 'xxx', headerName: t('Actions'), renderCell: (params: GridRenderCellParams) => {
        //     return (
        //         <Box sx={{ my: 1, mr: 1 }}>
        //             {

        //             }
        //         </Box>
        //     );
        // }, minWidth: 120, flex: 1 },
        { field: 'xxx', headerName: t('Actions'), renderCell: (params: GridRenderCellParams) => {
            return (
                <Box sx={{ my: 1, mr: 1 }}>
                    <IconButton size="small" title={t('editRowHSCode')} sx={{ mr: 0.5 }} onClick={() => { setCurrentEditId(params.row.hS_Code); resetForm(); getHSCode(params.row.hS_Code); setModal(true); }}>
                        <Edit fontSize="small" />
                    </IconButton>
                    <IconButton size="small" title={t('deleteRowHSCode')} onClick={() => { setCurrentId(params.row.hS_Code); setModal2(true); }}>
                        <Delete fontSize="small" />
                    </IconButton>
                </Box>
            );
        }, minWidth: 120, flex: 1 },
    ];
    
    const createNewHSCode = async () => {
        if (category !== "" && descriptionFr !== "" && descriptionEn !== "" && descriptionNl !== "") {
            if (account && instance && context) {
                try {
                    var dataSent = null;
                    var response = null;
                    if (currentEditId !== "") {
                        dataSent = {
                            "hS_Code": currentEditId,
                            "_4_digit_categories": category,
                            "product_description_Fr": descriptionFr,
                            "product_description_En": descriptionEn,
                            "product_description_NL": descriptionNl,
                        };
                        response = await (context?.service as BackendService<any>).putWithToken(protectedResources.apiLisQuotes.endPoint+"/HSCodeLIS/"+currentEditId, dataSent, context.tokenLogin);
                    }
                    else {
                        dataSent = {
                            "_4_digit_categories": category,
                            "product_description_Fr": descriptionFr,
                            "product_description_En": descriptionEn,
                            "product_description_NL": descriptionNl,
                        };
                        response = await (context?.service as BackendService<any>).postWithToken(protectedResources.apiLisQuotes.endPoint+"/HSCodeLIS", dataSent, context.tokenLogin);
                    }
                    enqueueSnackbar(currentEditId === "" ? "The product has been added with success!" : "The product has been edited with success!", { variant: "success", anchorOrigin: { horizontal: "right", vertical: "top"} });
                    getHSCodes();
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
    
    const getHSCode = async (id: string) => {
        setLoadEdit(true)
        if (account && instance && context) {
            const response = await (context?.service as BackendService<any>).getWithToken(protectedResources.apiLisQuotes.endPoint+"/HSCodeLIS/"+id, context.tokenLogin);
            if (response !== null && response !== undefined) {
                console.log(response);
                // setTestName(response.productName);
                setCategory(response._4_digit_categories);
                setDescriptionFr(response.product_description_Fr);
                setDescriptionEn(response.product_description_En);
                setDescriptionNl(response.product_description_NL);
                setLoadEdit(false);
            }
            else {
                setLoadEdit(false);
            }
        }
    }
    
    const resetForm = () => {
        setTestName("");
        setCategory("");
        setDescriptionFr("");
        setDescriptionEn("");
        setDescriptionNl("");
    }
    
    return (
        <div style={{ background: "#fff", borderTopLeftRadius: 20, borderTopRightRadius: 20 }}>
            <SnackbarProvider />
            <Box py={2.5}>
                <Grid container spacing={2} mt={0} px={5}>
                    <Grid item xs={12} md={8}>
                        <Typography sx={{ fontSize: 18, mb: 1 }}><b>{t('listHSCodes')}</b></Typography>
                    </Grid>
                    <Grid item xs={12} md={4}>
                        <Button 
                            variant="contained" color="inherit" 
                            sx={{ float: "right", backgroundColor: "#fff", textTransform: "none", ml: 2 }} 
                            onClick={() => { getHSCodes(); }} 
                        >
                            {t('reload')}
                        </Button>
                        <Button 
                            variant="contained" color="inherit" 
                            sx={{ float: "right", backgroundColor: "#fff", textTransform: "none" }} 
                            onClick={() => { setCurrentEditId(""); resetForm(); setModal(true); }} 
                        >
                            {t('newHSCode')}
                        </Button>
                    </Grid>
                    <Grid item xs={12}>
                        {
                            !loadResults ? 
                            products !== null && products.length !== 0 ?
                            <Box sx={{ overflow: "auto" }}>
                                <DataGrid
                                    rows={products}
                                    columns={columnsHSCodes}
                                    initialState={{
                                        pagination: {
                                            paginationModel: {
                                                pageSize: 10,
                                            },
                                        },
                                    }}
                                    pageSizeOptions={[5, 10, 25, 50]}
                                    getRowId={(row: any) => row?.hS_Code}
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
                    <b>{currentEditId === "" ? t('createRowHSCode') : t('editRowHSCode')}</b>
                </BootstrapDialogTitle>
                <DialogContent dividers>
                    {
                        loadEdit === false ?
                        <Grid container spacing={2}>
                            {/* <Grid item xs={12}>
                                <InputLabel htmlFor="test-name" sx={inputLabelStyles}>HSCode name</InputLabel>
                                <BootstrapInput id="test-name" type="text" value={testName} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTestName(e.target.value)} fullWidth />
                            </Grid> */}
                            <Grid item xs={12}>
                                <InputLabel htmlFor="category" sx={inputLabelStyles}>4 Digit Categories</InputLabel>
                                <BootstrapInput id="category" type="text" value={category} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCategory(e.target.value)} fullWidth />
                            </Grid>
                            <Grid item xs={12}>
                                <InputLabel htmlFor="descriptionFr" sx={inputLabelStyles}>Description (Fr)</InputLabel>
                                <BootstrapInput id="descriptionFr" type="text" multiline rows={3} value={descriptionFr} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setDescriptionFr(e.target.value)} fullWidth />
                            </Grid>
                            <Grid item xs={12}>
                                <InputLabel htmlFor="descriptionEn" sx={inputLabelStyles}>Description (En)</InputLabel>
                                <BootstrapInput id="descriptionEn" type="text" multiline rows={3} value={descriptionEn} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setDescriptionEn(e.target.value)} fullWidth />
                            </Grid>
                            <Grid item xs={12}>
                                <InputLabel htmlFor="descriptionNL" sx={inputLabelStyles}>Description (Nl)</InputLabel>
                                <BootstrapInput id="descriptionNL" type="text" multiline rows={3} value={descriptionNl} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setDescriptionNl(e.target.value)} fullWidth />
                            </Grid>
                        </Grid> : <Skeleton />
                    }
                </DialogContent>
                <DialogActions>
                    <Button variant="contained" onClick={() => { createNewHSCode(); }} sx={actionButtonStyles}>{t('validate')}</Button>
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
                    <b>{t('deleteRowHSCode')}</b>
                </BootstrapDialogTitle>
                <DialogContent dividers>{t('areYouSureDeleteRow')}</DialogContent>
                <DialogActions>
                    <Button variant="contained" color={"primary"} onClick={() => { deleteHSCodePrice(currentId); }} sx={{ mr: 1.5, textTransform: "none" }}>{t('accept')}</Button>
                    <Button variant="contained" onClick={() => setModal2(false)} sx={buttonCloseStyles}>{t('close')}</Button>
                </DialogActions>
            </BootstrapDialog>
        </div>
    );
}

export default MasterDataHSCodes;