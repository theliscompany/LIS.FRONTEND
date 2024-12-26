import * as React from 'react';
import { useState, useEffect } from 'react';
import { SnackbarProvider, enqueueSnackbar } from 'notistack';
import { Alert, Box, Button, DialogActions, DialogContent, IconButton, InputLabel, Skeleton, Typography } from '@mui/material';
import Grid from '@mui/material/Grid2';
import { DataGrid, GridColDef, GridRenderCellParams, GridToolbar } from '@mui/x-data-grid';
import { sizingStyles, gridStyles, BootstrapDialog, BootstrapDialogTitle, buttonCloseStyles, BootstrapInput, actionButtonStyles, inputLabelStyles } from '../../utils/misc/styles';
import { Edit, Delete } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { AxiosError } from 'axios';
import { deleteProductById, getProduct, getProductById, postProduct, ProductViewModel, putProductById } from '../../api/client/transport';

const MasterDataProducts: any = () => {
    const { t } = useTranslation();    
    const [products, setProducts] = useState<any>(null);
    const [loadResults, setLoadResults] = useState<boolean>(true);
    const [loadEdit, setLoadEdit] = useState<boolean>(false);
    const [modal, setModal] = useState<boolean>(false);
    const [modal2, setModal2] = useState<boolean>(false);
    const [testName, setTestName] = useState<string>("");
    const [currentId, setCurrentId] = useState<string>("");
    const [currentEditId, setCurrentEditId] = useState<string>("");
    
    const columnsProducts: GridColDef[] = [
        { field: 'productId', headerName: t('id'), flex: 1 },
        { field: 'productName', headerName: t('productName'), flex: 3 },
        { field: 'xxx', headerName: t('Actions'), renderCell: (params: GridRenderCellParams) => {
            return (
                <Box sx={{ my: 1, mr: 1 }}>
                    <IconButton size="small" title={t('editRowProduct')} sx={{ mr: 0.5 }} onClick={() => { setCurrentEditId(params.row.productId); resetForm(); getProductService(params.row.productId); setModal(true); }}>
                        <Edit fontSize="small" />
                    </IconButton>
                    <IconButton size="small" title={t('deleteRowProduct')} onClick={() => { setCurrentId(params.row.productId); setModal2(true); }}>
                        <Delete fontSize="small" />
                    </IconButton>
                </Box>
            );
        }, minWidth: 120, flex: 1 },
    ];
    
    useEffect(() => {
        getProductsService();
    }, []);

    const getProductsService = async () => {
        setLoadResults(true);
        try {
            const products = await getProduct({query: { pageSize: 500 }});
            setProducts(products.data);
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
    
    const getProductService = async (id: number) => {
        setLoadEdit(true);
        try {
            const product = await getProductById({path: {id: id}});
            var result = product.data;
            setTestName(result?.productName ?? "");
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
    
    const createUpdateProductService = async () => {
        if (testName !== "") {
            try {
                var dataSent: ProductViewModel;
                var response = null;
                if (currentEditId !== "") {
                    dataSent = {
                        "productId": Number(currentEditId),
                        "productName": testName,
                    };
                    response = await putProductById({body: dataSent, path: {id: Number(currentEditId)}});
                }
                else {
                    dataSent = {
                        "productName": testName,
                    };
                    response = await postProduct({ body: dataSent });
                }
                enqueueSnackbar(currentEditId === "" ? t('productAdded') : t('productEdited'), { variant: "success", anchorOrigin: { horizontal: "right", vertical: "top"} });
                getProductsService();
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
    
    const deleteProductService = async (id: number) => {
        try {
            await deleteProductById({path: {id: id}});
            enqueueSnackbar(t('rowDeletedSuccess'), { variant: "success", anchorOrigin: { horizontal: "right", vertical: "top"} });
            setModal2(false);
            getProductsService();
        }
        catch (e: any) {
            console.log(e);
            enqueueSnackbar(t('rowDeletedError'), { variant: "error", anchorOrigin: { horizontal: "right", vertical: "top"} });
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
                    <Grid size={{ xs: 12, md: 8 }}>
                        <Typography sx={{ fontSize: 18, mb: 1 }}><b>{t('listProducts')}</b></Typography>
                    </Grid>
                    <Grid size={{ xs: 12, md: 4 }}>
                        <Button 
                            variant="contained" color="inherit" 
                            sx={{ float: "right", backgroundColor: "#fff", textTransform: "none", ml: 2 }} 
                            onClick={() => { getProductsService(); }} 
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
                    <Grid size={{ xs: 12 }}>
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
                            <Grid size={{ xs: 12 }}>
                                <InputLabel htmlFor="test-name" sx={inputLabelStyles}>{t('productName')}</InputLabel>
                                <BootstrapInput id="test-name" type="text" value={testName} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTestName(e.target.value)} fullWidth />
                            </Grid>
                        </Grid> : <Skeleton />
                    }
                </DialogContent>
                <DialogActions>
                    <Button variant="contained" onClick={() => { createUpdateProductService(); }} sx={actionButtonStyles}>{t('validate')}</Button>
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
                    <Button variant="contained" color={"primary"} onClick={() => { deleteProductService(Number(currentId)); }} sx={{ mr: 1.5, textTransform: "none" }}>{t('accept')}</Button>
                    <Button variant="contained" onClick={() => setModal2(false)} sx={buttonCloseStyles}>{t('close')}</Button>
                </DialogActions>
            </BootstrapDialog>
        </div>
    );
}

export default MasterDataProducts;