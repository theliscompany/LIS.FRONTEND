import * as React from 'react';
import { useState, useEffect } from 'react';
import { SnackbarProvider, enqueueSnackbar } from 'notistack';
import { Alert, Box, Button, DialogActions, DialogContent, InputLabel, Skeleton, Typography } from '@mui/material';
import Grid from '@mui/material/Grid2';
import { DataGrid, GridColDef, GridToolbar } from '@mui/x-data-grid';
import { sizingStyles, gridStyles, BootstrapDialog, BootstrapDialogTitle, buttonCloseStyles, BootstrapInput, actionButtonStyles, inputLabelStyles } from '@utils/misc/styles';
import { useTranslation } from 'react-i18next';
import { AxiosError } from 'axios';
import { getApiHsCodeLis, HSCodeLIS, postApiHsCodeLis, putApiHsCodeLisById } from '@features/request/api';

const MasterDataHSCodes: any = () => {
    const { t } = useTranslation();
    
    const [products, setHSCodes] = useState<any>(null);
    const [loadResults, setLoadResults] = useState<boolean>(true);
    // const [loadEdit, setLoadEdit] = useState<boolean>(false);
    const [modal, setModal] = useState<boolean>(false);
    // const [testName, setTestName] = useState<string>("");
    const [category, setCategory] = useState<string>("");
    const [descriptionFr, setDescriptionFr] = useState<string>("");
    const [descriptionEn, setDescriptionEn] = useState<string>("");
    const [descriptionNl, setDescriptionNl] = useState<string>("");
    const [currentEditId, setCurrentEditId] = useState<string>("");
    
    const getHSCodesService = async () => {
        setLoadResults(true);
        try {
            const codes: any = await getApiHsCodeLis();
            setHSCodes(codes.data);
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

    useEffect(() => {
        getHSCodesService();
    }, []);

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
        // { field: 'xxx', headerName: t('Actions'), renderCell: (params: GridRenderCellParams) => {
        //     return (
        //         <Box sx={{ my: 1, mr: 1 }}>
        //             <IconButton size="small" title={t('editRowHSCode')} sx={{ mr: 0.5 }} onClick={() => { setCurrentEditId(params.row.hS_Code); resetForm(); getHSCode(params.row.hS_Code); setModal(true); }}>
        //                 <Edit fontSize="small" />
        //             </IconButton>
        //             <IconButton size="small" title={t('deleteRowHSCode')} onClick={() => { setCurrentId(params.row.hS_Code); setModal2(true); }}>
        //                 <Delete fontSize="small" />
        //             </IconButton>
        //         </Box>
        //     );
        // }, minWidth: 120, flex: 1 },
    ];
    
    const createNewHSCode = async () => {
        if (category !== "" && descriptionFr !== "" && descriptionEn !== "" && descriptionNl !== "") {
            try {
                var dataSent: HSCodeLIS;
                if (currentEditId !== "") {
                    dataSent = {
                        "hS_Code": Number(currentEditId),
                        "_4_digit_categories": category,
                        "product_description_Fr": descriptionFr,
                        "product_description_En": descriptionEn,
                        "product_description_NL": descriptionNl,
                    };
                    await putApiHsCodeLisById({body: dataSent, path: {id: Number(currentEditId)}});
                }
                else {
                    dataSent = {
                        "_4_digit_categories": category,
                        "product_description_Fr": descriptionFr,
                        "product_description_En": descriptionEn,
                        "product_description_NL": descriptionNl,
                    };
                    await postApiHsCodeLis({body: dataSent});
                }
                enqueueSnackbar(currentEditId === "" ? t('hscodeAdded') : t('hscodeEdited'), { variant: "success", anchorOrigin: { horizontal: "right", vertical: "top"} });
                getHSCodesService();
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
    
    const resetForm = () => {
        // setTestName("");
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
                    <Grid size={{ xs: 12, md: 8 }}>
                        <Typography sx={{ fontSize: 18, mb: 1 }}><b>{t('listHSCodes')}</b></Typography>
                    </Grid>
                    <Grid size={{ xs: 12, md: 4 }}>
                        <Button 
                            variant="contained" color="inherit" 
                            sx={{ float: "right", backgroundColor: "#fff", textTransform: "none", ml: 2 }} 
                            onClick={() => { getHSCodesService(); }} 
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
                    <Grid size={{ xs: 12 }}>
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
                open={modal} maxWidth="sm" fullWidth
            >
                <BootstrapDialogTitle id="custom-dialog-title7" onClose={() => setModal(false)}>
                    <b>{currentEditId === "" ? t('createRowHSCode') : t('editRowHSCode')}</b>
                </BootstrapDialogTitle>
                <DialogContent dividers>
                    {
                        true ? // loadEdit === false ?
                        <Grid container spacing={2}>
                            {/* <Grid item xs={12}>
                                <InputLabel htmlFor="test-name" sx={inputLabelStyles}>HSCode name</InputLabel>
                                <BootstrapInput id="test-name" type="text" value={testName} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTestName(e.target.value)} fullWidth />
                            </Grid> */}
                            <Grid size={{ xs: 12 }}>
                                <InputLabel htmlFor="category" sx={inputLabelStyles}>{t('digitCategories')}</InputLabel>
                                <BootstrapInput id="category" type="text" value={category} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCategory(e.target.value)} fullWidth />
                            </Grid>
                            <Grid size={{ xs: 12 }}>
                                <InputLabel htmlFor="descriptionFr" sx={inputLabelStyles}>Description (Fr)</InputLabel>
                                <BootstrapInput id="descriptionFr" type="text" multiline rows={3} value={descriptionFr} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setDescriptionFr(e.target.value)} fullWidth />
                            </Grid>
                            <Grid size={{ xs: 12 }}>
                                <InputLabel htmlFor="descriptionEn" sx={inputLabelStyles}>Description (En)</InputLabel>
                                <BootstrapInput id="descriptionEn" type="text" multiline rows={3} value={descriptionEn} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setDescriptionEn(e.target.value)} fullWidth />
                            </Grid>
                            <Grid size={{ xs: 12 }}>
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

            {/* <BootstrapDialog
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
            </BootstrapDialog> */}
        </div>
    );
}

export default MasterDataHSCodes;