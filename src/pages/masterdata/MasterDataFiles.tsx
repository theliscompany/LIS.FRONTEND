import { useState, useEffect } from 'react';
import Box from '@mui/material/Box';
import { SnackbarProvider, enqueueSnackbar } from 'notistack';
import { useMsal, useAccount } from '@azure/msal-react';
import { useAuthorizedBackendApi } from '../../api/api';
import { protectedResources } from '../../config/authConfig';
import { BackendService } from '../../utils/services/fetch';
import { Alert, Button, DialogActions, DialogContent, Grid, IconButton, InputLabel, Skeleton, Typography } from '@mui/material';
import { DataGrid, GridColDef, GridRenderCellParams, GridToolbar } from '@mui/x-data-grid';
// import { t } from 'i18next';
import { sizingStyles, gridStyles, BootstrapDialog, BootstrapDialogTitle, buttonCloseStyles, actionButtonStyles, inputLabelStyles } from '../../utils/misc/styles';
import { Delete, Download } from '@mui/icons-material';
import { MuiFileInput } from 'mui-file-input';
import axios, { AxiosResponse } from 'axios';
import { getExtensionFromContentType } from '../../utils/functions';
import { useTranslation } from 'react-i18next';

const MasterDataFiles: any = (props: any) => {
    const { t } = useTranslation();
    
    const [files, setFiles] = useState<any>(null);
    const [loadResults, setLoadResults] = useState<boolean>(true);
    const [loadEdit, setLoadEdit] = useState<boolean>(false);
    const [modal, setModal] = useState<boolean>(false);
    const [modal2, setModal2] = useState<boolean>(false);
    const [currentId, setCurrentId] = useState<string>("");
    const [currentEditId, setCurrentEditId] = useState<string>("");
    const [fileValue, setFileValue] = useState<File[] | undefined>(undefined);
    
    const { instance, accounts } = useMsal();
    const account = useAccount(accounts[0] || {});
    const context = useAuthorizedBackendApi();
    
    const getFiles = async () => {
        if (account && instance && context) {
            setLoadResults(true);
            const response = await (context?.service as BackendService<any>).getSingle(protectedResources.apiLisFiles.endPoint+"/Files");
            if (response !== null && response.data !== undefined && response !== undefined) {
                setFiles(response.data);
                setLoadResults(false);
            }
            else {
                setLoadResults(false);
            }
        }
    }
    
    const deleteFile = async (id: string) => {
        if (account && instance && context) {
            try {
                const response = await (context?.service as BackendService<any>).delete(protectedResources.apiLisFiles.endPoint+"/Files/"+id);
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
    }, [account, instance, account]);

    const columnsFiles: GridColDef[] = [
        // { field: 'id', headerName: t('id'), flex: 1 },
        { field: 'fileName', headerName: t('fileName'), flex: 3 },
        { field: 'contentType', headerName: t('contentType'), flex: 1 },
        { field: 'size', headerName: t('size'), flex: 1 },
        { field: 'uploadedAt', headerName: t('uploadedAt'), renderCell: (params: GridRenderCellParams) => {
            return (
                <Box sx={{ my: 1, mr: 1 }}>
                    {params.row.uploadedAt !== null ? (new Date(params.row.uploadedAt)).toLocaleString() : null}
                </Box>
            );
        }, flex: 1 },
        { field: 'xxx', headerName: t('Actions'), renderCell: (params: GridRenderCellParams) => {
            return (
                <Box sx={{ my: 1, mr: 1 }}>
                    <IconButton size="small" title={t('downloadFile')} sx={{ mr: 0.5 }} onClick={() => { downloadFile(params.row.id, params.row.fileName, params.row.contentType); }}>
                        <Download fontSize="small" />
                    </IconButton>
                    <IconButton size="small" title={t('deleteRowFile')} onClick={() => { setCurrentId(params.row.id); setModal2(true); }}>
                        <Delete fontSize="small" />
                    </IconButton>
                </Box>
            );
        }, minWidth: 120, flex: 1 },
    ];
    
    const uploadFile = async () => {
        if (fileValue !== undefined && fileValue !== null) {
            try {
                const formData = new FormData();
                formData.append('file', fileValue[0]);
            
                const response: AxiosResponse = await axios({
                    url: protectedResources.apiLisFiles.endPoint+"/Files/upload",
                    method: 'POST',
                    data: formData,
                    headers: {
                        'Content-Type': 'multipart/form-data', 
                    },
                });
                
                enqueueSnackbar("The file has been added with success!", { variant: "success", anchorOrigin: { horizontal: "right", vertical: "top"} });
                getFiles();
                setModal(false);
                console.log(response);
            } 
            catch (error) {
                enqueueSnackbar(t('errorHappened'), { variant: "error", anchorOrigin: { horizontal: "right", vertical: "top"} });
                console.log(error);
            }
        }
        else {
            enqueueSnackbar("The file field is empty, please verify it and pick a file.", { variant: "warning", anchorOrigin: { horizontal: "right", vertical: "top"} });
        }
    };

    const downloadFile = async (id: string, name: string, type: string) => {
        try {
            const response = await axios({
                url: protectedResources.apiLisFiles.endPoint+"/Files/"+id+"?download=true", 
                method: 'GET',
                responseType: 'blob', // important for file download
                headers: {
                    'Content-Type': 'multipart/form-data', 
                },
            });
            
            var extension = getExtensionFromContentType(type);
            
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', name+"."+extension); // replace with your file name and extension
            document.body.appendChild(link);
            link.click();
            link.parentNode?.removeChild(link);
        } 
        catch (error) {
            console.log(error);
        }
    };
    
    const resetForm = () => {
        setFileValue(undefined);
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
                            sx={{ float: "right", backgroundColor: "#fff", textTransform: "none", ml: 2 }} 
                            onClick={() => { getFiles(); }} 
                        >
                            {t('reload')}
                        </Button>
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
                            files !== null && files.length !== 0 ?
                            <Box sx={{ overflow: "auto" }}>
                                <DataGrid
                                    rows={files}
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
                                    getRowId={(row: any) => row?.id}
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
                                <InputLabel htmlFor="fileSent" sx={inputLabelStyles}>{t('fileSent')}</InputLabel>
                                <MuiFileInput
                                    id="fileSent" size="small" 
                                    variant="outlined" multiple fullWidth /*inputProps={{ accept: '.pdf' }}*/
                                    value={fileValue} sx={{ mt: 1 }} 
                                    onChange={(newValue: any) => { console.log(newValue); setFileValue(newValue); }}
                                />
                            </Grid>
                        </Grid> : <Skeleton />
                    }
                </DialogContent>
                <DialogActions>
                    <Button variant="contained" onClick={() => { uploadFile(); }} sx={actionButtonStyles}>{t('validate')}</Button>
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