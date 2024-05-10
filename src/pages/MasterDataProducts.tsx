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

const MasterDataProducts: any = (props: any) => {
    const { t } = useTranslation();
    
    const [products, setProducts] = useState<any>(null);
    const [loadResults, setLoadResults] = useState<boolean>(true);
    const [loadEdit, setLoadEdit] = useState<boolean>(false);
    const [modal, setModal] = useState<boolean>(false);
    const [modal2, setModal2] = useState<boolean>(false);
    const [testName, setTestName] = useState<string>("");
    const [currentId, setCurrentId] = useState<string>("");
    const [currentEditId, setCurrentEditId] = useState<string>("");
    
    const { instance, accounts } = useMsal();
    const account = useAccount(accounts[0] || {});
    const context = useAuthorizedBackendApi();
    
    const getProducts = async () => {
        if (account && instance && context) {
            setLoadResults(true);
            const response = await (context?.service as BackendService<any>).getWithToken(protectedResources.apiLisTransport.endPoint+"/Product?pageSize=500", context.tokenTransport);
            if (response !== null && response !== undefined) {
                setProducts(response);
                setLoadResults(false);
            }
            else {
                setLoadResults(false);
            }
        }
    }
    
    const deleteProductPrice = async (id: string) => {
        if (account && instance && context) {
            try {
                const response = await (context?.service as BackendService<any>).deleteWithToken(protectedResources.apiLisTransport.endPoint+"/Product/"+id, context.tokenTransport);
                console.log(response);
                enqueueSnackbar(t('rowDeletedSuccess'), { variant: "success", anchorOrigin: { horizontal: "right", vertical: "top"} });
                setModal2(false);
                getProducts();
            }
            catch (e: any) {
                console.log(e);
                enqueueSnackbar(t('rowDeletedError'), { variant: "error", anchorOrigin: { horizontal: "right", vertical: "top"} });
            }
        }
    }
    
    useEffect(() => {
        getProducts();
    }, [account, instance, account]);

    const columnsProducts: GridColDef[] = [
        { field: 'productId', headerName: t('id'), flex: 1 },
        { field: 'productName', headerName: t('productName'), flex: 3 },
        { field: 'xxx', headerName: t('Actions'), renderCell: (params: GridRenderCellParams) => {
            return (
                <Box sx={{ my: 1, mr: 1 }}>
                    <IconButton size="small" title={t('editRowProduct')} sx={{ mr: 0.5 }} onClick={() => { setCurrentEditId(params.row.productId); resetForm(); getProduct(params.row.productId); setModal(true); }}>
                        <Edit fontSize="small" />
                    </IconButton>
                    <IconButton size="small" title={t('deleteRowProduct')} onClick={() => { setCurrentId(params.row.productId); setModal2(true); }}>
                        <Delete fontSize="small" />
                    </IconButton>
                </Box>
            );
        }, minWidth: 120, flex: 1 },
    ];
    
    const createNewProduct = async () => {
        if (testName !== "") {
            if (account && instance && context) {
                try {
                    var dataSent = null;
                    var response = null;
                    if (currentEditId !== "") {
                        dataSent = {
                            "productId": currentEditId,
                            "productName": testName,
                        };
                        response = await (context?.service as BackendService<any>).putWithToken(protectedResources.apiLisTransport.endPoint+"/Product/"+currentEditId, dataSent, context.tokenTransport);
                    }
                    else {
                        dataSent = {
                            "productName": testName,
                        };
                        response = await (context?.service as BackendService<any>).postWithToken(protectedResources.apiLisTransport.endPoint+"/Product", dataSent, context.tokenTransport);
                    }
                    enqueueSnackbar(currentEditId === "" ? "The product has been added with success!" : "The product has been edited with success!", { variant: "success", anchorOrigin: { horizontal: "right", vertical: "top"} });
                    getProducts();
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
    
    const getProduct = async (id: string) => {
        setLoadEdit(true)
        if (account && instance && context) {
            const response = await (context?.service as BackendService<any>).getWithToken(protectedResources.apiLisTransport.endPoint+"/Product/"+id, context.tokenTransport);
            if (response !== null && response !== undefined) {
                console.log(response);
                setTestName(response.productName);
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
                        <Typography sx={{ fontSize: 18, mb: 1 }}><b>{t('listProducts')}</b></Typography>
                    </Grid>
                    <Grid item xs={12} md={4}>
                        <Button 
                            variant="contained" color="inherit" 
                            sx={{ float: "right", backgroundColor: "#fff", textTransform: "none", ml: 2 }} 
                            onClick={() => { getProducts(); }} 
                        >
                            {t('reload')}
                        </Button>
                        <Button 
                            variant="contained" color="inherit" 
                            sx={{ float: "right", backgroundColor: "#fff", textTransform: "none" }} 
                            onClick={() => { setCurrentEditId(""); resetForm(); setModal(true); }} 
                        >
                            {t('newProduct')}
                        </Button>
                    </Grid>
                    <Grid item xs={12}>
                        {
                            !loadResults ? 
                            products !== null && products.length !== 0 ?
                            <Box sx={{ overflow: "auto" }}>
                                <DataGrid
                                    rows={products}
                                    columns={columnsProducts}
                                    initialState={{
                                        pagination: {
                                            paginationModel: {
                                                pageSize: 10,
                                            },
                                        },
                                    }}
                                    pageSizeOptions={[5, 10, 25, 50]}
                                    getRowId={(row: any) => row?.productId}
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
                    <b>{currentEditId === "" ? t('createRowProduct') : t('editRowProduct')}</b>
                </BootstrapDialogTitle>
                <DialogContent dividers>
                    {
                        loadEdit === false ?
                        <Grid container spacing={2}>
                            <Grid item xs={12}>
                                <InputLabel htmlFor="test-name" sx={inputLabelStyles}>Product name</InputLabel>
                                <BootstrapInput id="test-name" type="text" value={testName} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTestName(e.target.value)} fullWidth />
                            </Grid>
                        </Grid> : <Skeleton />
                    }
                </DialogContent>
                <DialogActions>
                    <Button variant="contained" onClick={() => { createNewProduct(); }} sx={actionButtonStyles}>{t('validate')}</Button>
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
                    <b>{t('deleteRowProduct')}</b>
                </BootstrapDialogTitle>
                <DialogContent dividers>{t('areYouSureDeleteRow')}</DialogContent>
                <DialogActions>
                    <Button variant="contained" color={"primary"} onClick={() => { deleteProductPrice(currentId); }} sx={{ mr: 1.5, textTransform: "none" }}>{t('accept')}</Button>
                    <Button variant="contained" onClick={() => setModal2(false)} sx={buttonCloseStyles}>{t('close')}</Button>
                </DialogActions>
            </BootstrapDialog>
        </div>
    );
}

export default MasterDataProducts;