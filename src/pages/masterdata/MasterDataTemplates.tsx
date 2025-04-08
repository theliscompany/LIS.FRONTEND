import { useState, useEffect, useRef } from 'react';
import { Alert, Autocomplete, Box, Button, Chip, DialogActions, DialogContent, IconButton, InputLabel, Skeleton, TextField, Typography } from '@mui/material';
import Grid from '@mui/material/Grid2';
import SearchIcon from '@mui/icons-material/Search';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import { SnackbarProvider, enqueueSnackbar } from 'notistack';
import { useTranslation } from 'react-i18next';
import { GridColDef, GridRenderCellParams, DataGrid } from '@mui/x-data-grid';
import { BootstrapDialog, BootstrapDialogTitle, BootstrapInput, buttonCloseStyles, datetimeStyles, gridStyles, inputLabelStyles, sizingStyles } from '../../utils/misc/styles';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { Dayjs } from 'dayjs';
import StarterKit from '@tiptap/starter-kit';
import { 
    RichTextEditor, 
    MenuControlsContainer, 
    MenuSelectHeading, 
    MenuDivider, 
    MenuButtonBold, 
    MenuButtonItalic, 
    MenuButtonStrikethrough, 
    MenuButtonOrderedList, 
    MenuButtonBulletedList, 
    MenuSelectTextAlign, 
    MenuButtonEditLink, 
    MenuButtonHorizontalRule, 
    MenuButtonUndo, 
    MenuButtonRedo, 
    type RichTextEditorRef,
} from 'mui-tiptap';
import { AxiosError } from 'axios';
import { deleteApiTemplateById, getApiTemplate, getApiTemplateById, postApiTemplate, putApiTemplateById } from '../../api/client/template';

const MasterDataTemplates: any = () => {
    const [load, setLoad] = useState<boolean>(true);
    const [loadEdit, setLoadEdit] = useState<boolean>(false);
    const [modal, setModal] = useState<boolean>(false);
    const [modal2, setModal2] = useState<boolean>(false);
    const [currentId, setCurrentId] = useState<string>("");
    const [currentEditId, setCurrentEditId] = useState<string>("");
    const [templates, setTemplates] = useState<any>(null);
    const [searchedName, setSearchedName] = useState<string>("");
    
    const [name, setName] = useState<string>("");
    const [content, setContent] = useState<string>("");
    //const [contentEn, setContentEn] = useState<string>("");
    const [currentVersion, setCurrentVersion] = useState<string>("");
    const [createdAfter, setCreatedAfter] = useState<Dayjs | null>(null);
    const [createdBefore, setCreatedBefore] = useState<Dayjs | null>(null);
    const [tags, setTags] = useState<any[]>([]);
    
    const [mailLanguage] = useState<string>("fr");
    
    const rteRef = useRef<RichTextEditorRef>(null);
    //const rteRef2 = useRef<RichTextEditorRef>(null);
    
    const { t } = useTranslation();
    
    const variableOptions = [
        { label: t('listContainers'), value: "listContainers" },
        { label: t('loadingCity'), value: "loadingCity" },
        { label: t('departurePort'), value: "departurePort" },
        { label: t('destinationPort'), value: "destinationPort" },
        { label: t('emptyPickupDepot'), value: "emptyPickupDepot" },
        { label: t('commodities'), value: "commodities" },
        { label: t('etd'), value: "etd" },
        { label: t('frequency'), value: "frequency" },
        { label: t('transitTime'), value: "transitTime" },
        { label: t('freeTime'), value: "freeTime" },
        { label: t('overtimeTariff2'), value: "overtimeTariff" },
        { label: t('listServices'), value: "listServices" },
        { label: t('containersQuantities'), value: "containersQuantities" },
        { label: t('pricesContainers'), value: "pricesContainers" },
        { label: t('clientName'), value: "clientName" },
        { label: t('haulageType'), value: "haulageType" },
    ];
    
    const columnsTemplates: GridColDef[] = [
        { field: 'name', headerName: t('name'), minWidth: 125, flex: 1 },
        { field: 'tags', headerName: t('tags'), renderCell: (params: GridRenderCellParams) => {
            return (
                <Box sx={{ my: 1, mr: 1 }}>
                    {params.row.tags.join(', ')}
                </Box>
            );
        }, minWidth: 100, flex: 1 },
        // { field: 'createdAfter', headerName: t('createdAfter'), renderCell: (params: GridRenderCellParams) => {
        //     return (
        //         <Box sx={{ my: 1, mr: 1 }}>
        //             <Chip label={(new Date(params.row.createdAfter)).toLocaleDateString().slice(0,10)} color={(new Date()).getTime() - (new Date(params.row.createdAfter)).getTime() > 0 ? "default" : "default"}></Chip>
        //         </Box>
        //     );
        // }, minWidth: 100, flex: 1 },
        // { field: 'createdBefore', headerName: t('createdBefore'), renderCell: (params: GridRenderCellParams) => {
        //     return (
        //         <Box sx={{ my: 1, mr: 1 }}>
        //             <Chip label={(new Date(params.row.createdBefore)).toLocaleDateString().slice(0,10)} color={(new Date()).getTime() - (new Date(params.row.createdBefore)).getTime() > 0 ? "default" : "default"}></Chip>
        //         </Box>
        //     );
        // }, minWidth: 100, flex: 1 },
        { field: 'xxx', headerName: t('Actions'), renderCell: (params: GridRenderCellParams) => {
            return (
                <Box sx={{ my: 1, mr: 1 }}>
                    <IconButton size="small" title={t('editRow')} sx={{ mr: 0.5 }} onClick={() => { setCurrentEditId(params.row.id); getTemplate(params.row.id); setModal2(true); }}>
                        <EditIcon fontSize="small" />
                    </IconButton>
                    <IconButton size="small" title={params.row.tags.includes("default") ? t('cantDelete') : t('deleteRow')} onClick={() => { setCurrentId(params.row.id); setModal(true); }} disabled={params.row.tags.includes("default")}>
                        <DeleteIcon fontSize="small" />
                    </IconButton>
                </Box>
            );
        }, minWidth: 120, flex: 1 },
    ];
    
    useEffect(() => {
        getTemplates();
    }, []);
    
    const getTemplates = async () => {
        setLoad(true);
        try {
            const response:any = await getApiTemplate();
            if (response !== null && response.data !== undefined) {
                setTemplates(response.data?.data);
                setLoad(false);
            }
            else {
                setLoad(false);
            }
        }
        catch (err: unknown) {
            if (err instanceof AxiosError) {
                console.log(err.response?.data);
            }
            console.log("An error occured");
            setLoad(false);
        }
    }
    
    const getTemplate = async (id: string) => {
        setLoadEdit(true)
        try {
            const response:any = await getApiTemplateById({path: {id: id}});
            if (response !== null && response.data !== undefined) {
                var result = response.data;
                setName(result.data?.name);
                setCurrentVersion(result.data?.currentVersion);
                setContent(result.data?.content);
                setTags(result.data?.tags);
                //setContentEn("response.data.contentEn");
                setLoadEdit(false);
            }
            else {
                setLoadEdit(false);
            }
            console.log(response);
        }
        catch (err: unknown) {
            if (err instanceof AxiosError) {
                console.log(err.response?.data);
            }
            console.log("An error occured");
            setLoadEdit(false);
        }
    }
    
    const searchTemplates = async () => {
        try {
            setLoad(true);
            const response:any = await getApiTemplate({query: {name: searchedName}});
            if (response !== null && response !== undefined) {
                setTemplates(response.data?.data);
                setLoad(false);
            }
            else {
                setLoad(false);
            }
            console.log(response);
        }
        catch (err: unknown) {
            if (err instanceof AxiosError) {
                console.log(err.response?.data);
            }
            console.log("An error occured");
            setLoad(false);
        }
    }

    const createUpdateTemplate = async () => {
        if (name !== "" && rteRef.current?.editor?.getHTML() !== "") {
            try {
                var dataSent = null;
                if (currentEditId !== "") {
                    dataSent = {
                        // "id": currentEditId,
                        "name": name,
                        "currentVersion": currentVersion,
                        "content": rteRef.current?.editor?.getHTML(),
                        // "contentEn": rteRef2.current?.editor?.getHTML(),
                        "contentEn": rteRef.current?.editor?.getHTML(),
                        "author": "Cyrille Penaye",
                        "tags": tags
                    };
                    
                    try {
                        const response = await putApiTemplateById({body: dataSent, path: {id: currentEditId}});
                        if (response !== null && response !== undefined) {
                            setModal2(false);
                            enqueueSnackbar(t('successEdited'), { variant: "success", anchorOrigin: { horizontal: "right", vertical: "top"} });
                            searchTemplates();
                        }
                        else {
                            enqueueSnackbar(t('errorHappened'), { variant: "error", anchorOrigin: { horizontal: "right", vertical: "top"} });
                        }
                    }
                    catch (err: any) {
                        enqueueSnackbar(t('errorHappenedVersion'), { variant: "error", anchorOrigin: { horizontal: "right", vertical: "top"} });    
                    }
                }
                else {
                    dataSent = {
                        "name": name,
                        "currentVersion": currentVersion,
                        "content": rteRef.current?.editor?.getHTML(),
                        // "contentEn": rteRef2.current?.editor?.getHTML(),
                        "contentEn": rteRef.current?.editor?.getHTML(),
                        "author": "Cyrille Penaye",
                        "tags": tags
                    };
                    
                    const response = await postApiTemplate({body: dataSent});
                    if (response !== null && response !== undefined) {
                        setModal2(false);
                        enqueueSnackbar(t('successCreated'), { variant: "success", anchorOrigin: { horizontal: "right", vertical: "top"} });
                        searchTemplates();
                    }
                    else {
                        enqueueSnackbar(t('errorHappened'), { variant: "error", anchorOrigin: { horizontal: "right", vertical: "top"} });
                    }
                }
            }
            catch (err: unknown) {
                if (err instanceof AxiosError) {
                    console.log(err.response?.data);
                }
                console.log("An error occured");
                setLoad(false);
            }
        }
        else {
            enqueueSnackbar(t('fieldsEmptyTemplate'), { variant: "error", anchorOrigin: { horizontal: "right", vertical: "top"} });
        }
    }

    const deleteTemplate = async (id: string) => {
        try {
            const response = await deleteApiTemplateById({path: {id: id}});
            if (response !== null && response !== undefined) {
                enqueueSnackbar(t('rowDeletedSuccess'), { variant: "success", anchorOrigin: { horizontal: "right", vertical: "top"} });
                setModal(false);
                searchTemplates();
            }
            else {
                enqueueSnackbar(t('rowDeletedError'), { variant: "success", anchorOrigin: { horizontal: "right", vertical: "top"} });
            }
        }
        catch (err: unknown) {
            if (err instanceof AxiosError) {
                console.log(err.response?.data);
            }
            console.log("An error occured");
        }
    }
    
    const resetForm = () => {
        setName("");
        setCurrentVersion("");
        setContent("");
        setTags([]);
    }
    
    return (
        <div style={{ background: "#fff", borderTopLeftRadius: 20, borderTopRightRadius: 20 }}>
            <SnackbarProvider />
            <Box py={2.5}>
                <Grid container spacing={2} mt={0} px={5}>
                    <Grid size={{ xs: 12, md: 8 }}>
                        <Typography sx={{ fontSize: 18, mb: 1 }}><b>{t('listTemplates')}</b></Typography>
                    </Grid>
                    <Grid size={{ xs: 12, md: 4 }}>
                        <Button 
                            variant="contained" color="inherit" 
                            sx={{ float: "right", backgroundColor: "#fff", textTransform: "none", ml: 2 }} 
                            onClick={() => { getTemplates(); }} 
                        >
                            {t('reload')}
                        </Button>
                        <Button 
                            variant="contained" color="inherit" 
                            sx={{ float: "right", backgroundColor: "#fff", textTransform: "none" }} 
                            onClick={() => { setCurrentEditId(""); resetForm(); setModal2(true); }} 
                        >
                            {t('newTemplate')}
                        </Button>
                    </Grid>
                    <Grid size={{ xs: 12, md: 4 }}>
                        <InputLabel htmlFor="template-name" sx={inputLabelStyles}>{t('name')}</InputLabel>
                        <BootstrapInput id="template-name" type="text" value={searchedName} onChange={(e: any) => setSearchedName(e.target.value)} fullWidth />
                    </Grid>
                    <Grid size={{ xs: 12, md: 3 }}>
                        <InputLabel htmlFor="createdBefore" sx={inputLabelStyles}>{t('createdBefore')}</InputLabel>
                        <LocalizationProvider dateAdapter={AdapterDayjs}>
                            <DatePicker 
                                value={createdBefore}
                                format="DD/MM/YYYY" 
                                onChange={(value: any) => { setCreatedBefore(value) }}
                                slotProps={{ textField: { id: "createdBefore", size: "small", fullWidth: true, sx: datetimeStyles }, inputAdornment: { sx: { position: "relative", right: "11.5px" } } }}
                            />
                        </LocalizationProvider>
                    </Grid>
                    <Grid size={{ xs: 12, md: 3 }}>
                        <InputLabel htmlFor="createdAfter" sx={inputLabelStyles}>{t('createdAfter')}</InputLabel>
                        <LocalizationProvider dateAdapter={AdapterDayjs}>
                            <DatePicker 
                                value={createdAfter}
                                format="DD/MM/YYYY" 
                                onChange={(value: any) => { setCreatedAfter(value) }}
                                slotProps={{ textField: { id: "createdAfter", size: "small", fullWidth: true, sx: datetimeStyles }, inputAdornment: { sx: { position: "relative", right: "11.5px" } } }}
                            />
                        </LocalizationProvider>
                    </Grid>
                    <Grid size={{ xs: 12, md: 2 }} mt={1} sx={{ display: "flex", alignItems: "end" }}>
                        <Button 
                            variant="contained" 
                            color="inherit"
                            startIcon={<SearchIcon />} 
                            size="large"
                            sx={{ backgroundColor: "#fff", color: "#333", textTransform: "none", mb: 0.15 }}
                            onClick={searchTemplates}
                            fullWidth
                        >
                            {t('search')}
                        </Button>
                    </Grid>
                    <Grid size={{ xs: 12 }}>
                        {
                            !load ?
                            templates !== null && templates.length !== 0 ?
                            <Box sx={{ overflow: "hidden" }}>
                                <DataGrid
                                    rows={templates}
                                    columns={columnsTemplates}
                                    getRowId={(row: any) => row?.id}
                                    getRowHeight={() => "auto" }
                                    style={sizingStyles}
                                    sx={gridStyles}
                                    disableRowSelectionOnClick
                                />
                            </Box> : 
                            <Box>
                                <Alert severity="warning">{t('noResults')}</Alert>
                            </Box> : <Skeleton />
                        }
                    </Grid>
                </Grid>
            </Box>
            
            
            {/* <Box sx={{ py: 2.5 }}>
                <Typography variant="h5" sx={{mt: {xs: 4, md: 1.5, lg: 1.5 }}} mx={5}><b>{t('listTemplates')}</b></Typography>
                <Grid container spacing={2} mt={0} px={5}>
                    <Grid size={{ xs: 12 }}>
                        <Button 
                            variant="contained" color="inherit" 
                            sx={{ float: "right", backgroundColor: "#fff", textTransform: "none", ml: 2 }} 
                            onClick={() => { getTemplates(); }} 
                        >
                            {t('reload')}
                        </Button>
                        <Button variant="contained" sx={actionButtonStyles} onClick={() => { setCurrentEditId(""); resetForm(); setModal2(true); }}>
                            {t('newTemplate')} <AddCircleOutlinedIcon sx={{ ml: 0.5, pb: 0.25, justifyContent: "center", alignItems: "center" }} fontSize="small" />
                        </Button>
                    </Grid>
                    <Grid size={{ xs: 12, md: 4 }}>
                        <InputLabel htmlFor="template-name" sx={inputLabelStyles}>{t('name')}</InputLabel>
                        <BootstrapInput id="template-name" type="text" value={searchedName} onChange={(e: any) => setSearchedName(e.target.value)} fullWidth />
                    </Grid>
                    <Grid size={{ xs: 12, md: 3 }}>
                        <InputLabel htmlFor="createdBefore" sx={inputLabelStyles}>{t('createdBefore')}</InputLabel>
                        <LocalizationProvider dateAdapter={AdapterDayjs}>
                            <DatePicker 
                                value={createdBefore}
                                format="DD/MM/YYYY" 
                                onChange={(value: any) => { setCreatedBefore(value) }}
                                slotProps={{ textField: { id: "createdBefore", fullWidth: true, sx: datetimeStyles }, inputAdornment: { sx: { position: "relative", right: "11.5px" } } }}
                            />
                        </LocalizationProvider>
                    </Grid>
                    <Grid size={{ xs: 12, md: 3 }}>
                        <InputLabel htmlFor="createdAfter" sx={inputLabelStyles}>{t('createdAfter')}</InputLabel>
                        <LocalizationProvider dateAdapter={AdapterDayjs}>
                            <DatePicker 
                                value={createdAfter}
                                format="DD/MM/YYYY" 
                                onChange={(value: any) => { setCreatedAfter(value) }}
                                slotProps={{ textField: { id: "createdAfter", fullWidth: true, sx: datetimeStyles }, inputAdornment: { sx: { position: "relative", right: "11.5px" } } }}
                            />
                        </LocalizationProvider>
                    </Grid>
                    <Grid size={{ xs: 12, md: 2 }} mt={1} sx={{ display: "flex", alignItems: "end" }}>
                        <Button 
                            variant="contained" 
                            color="inherit"
                            startIcon={<SearchIcon />} 
                            size="large"
                            sx={{ backgroundColor: "#fff", color: "#333", textTransform: "none", mb: 0.15 }}
                            onClick={searchTemplates}
                            fullWidth
                        >
                            {t('search')}
                        </Button>
                    </Grid>
                </Grid>
                {
                    !load ? 
                    <Grid container spacing={2} mt={1} px={5} sx={{ maxWidth: "xs" }}>
                        <Grid size={{ xs: 12 }}>
                            {
                                templates !== null && templates.length !== 0 ?
                                <Box sx={{ overflow: "auto", width: { xs: "calc(100vw - 80px)", md: "100%" } }}>
                                    <Box sx={{ overflow: "auto" }}>
                                        <Box sx={{ width: "99.9%" }}>
                                            <DataGrid
                                                rows={templates}
                                                columns={columnsTemplates}
                                                // hideFooter
                                                getRowId={(row: any) => row?.id}
                                                // getRowHeight={() => "auto" }
                                                sx={gridStyles}
                                                disableRowSelectionOnClick
                                            />
                                        </Box>
                                    </Box>
                                </Box> : <Alert severity="warning">{t('noResults')}</Alert>
                            }
                        </Grid>
                    </Grid> : <Skeleton sx={{ mx: 5, mt: 3 }} />
                }
            </Box> */}
            <BootstrapDialog
                onClose={() => setModal(false)}
                aria-labelledby="custom-dialog-title"
                open={modal}
                maxWidth="sm"
                fullWidth
            >
                <BootstrapDialogTitle id="custom-dialog-title" onClose={() => setModal(false)}>
                    <b>{t('deleteRow')}</b>
                </BootstrapDialogTitle>
                <DialogContent dividers>{t('areYouSureDeleteRow')}</DialogContent>
                <DialogActions>
                    <Button variant="contained" color={"primary"} onClick={() => { deleteTemplate(currentId); }} sx={{ mr: 1.5, textTransform: "none" }}>{t('accept')}</Button>
                    <Button variant="contained" onClick={() => setModal(false)} sx={buttonCloseStyles}>{t('close')}</Button>
                </DialogActions>
            </BootstrapDialog>
            <BootstrapDialog
                onClose={() => setModal2(false)}
                aria-labelledby="custom-dialog-title2"
                open={modal2}
                maxWidth="lg"
                fullWidth
            >
                <BootstrapDialogTitle id="custom-dialog-title2" onClose={() => setModal2(false)}>
                    <b>{currentEditId === "" ? t('createRow') : t('editRow')}</b>
                </BootstrapDialogTitle>
                <DialogContent dividers>
                    {
                        loadEdit === false ?
                        <Grid container spacing={2}>
                            <Grid size={{ xs: 6 }}>
                                <Grid container spacing={2}>
                                    <Grid size={{ xs: 12, md: 6 }}>
                                        <InputLabel htmlFor="name" sx={inputLabelStyles}>{t('name')}</InputLabel>
                                        <BootstrapInput id="name" type="text" value={name} onChange={(e: any) => setName(e.target.value)} fullWidth />
                                    </Grid>
                                    <Grid size={{ xs: 12, md: 6 }}>
                                        <InputLabel htmlFor="currentVersion" sx={inputLabelStyles}>{t('currentVersion')}</InputLabel>
                                        <BootstrapInput id="currentVersion" type="text" value={currentVersion} onChange={(e: any) => setCurrentVersion(e.target.value)} fullWidth />
                                    </Grid>
                                    <Grid size={{ xs: 12, md: 12 }} mt={1}>
                                        <InputLabel htmlFor="tags" sx={inputLabelStyles}>{t('tags')}</InputLabel>
                                        <Autocomplete
                                            multiple    
                                            freeSolo
                                            disablePortal
                                            id="tags"
                                            options={["pricing", "offer", "request", "default", "seafreight", "haulage"]}
                                            getOptionLabel={(option: any) => { 
                                                if (option !== null && option !== undefined) {
                                                    return option;
                                                }
                                                return ""; 
                                            }}
                                            value={tags}
                                            sx={{ mt: 1 }}
                                            renderInput={(params: any) => <TextField {...params} sx={{ textTransform: "lowercase" }} />}
                                            onChange={(_: any, value: any) => { setTags(value); }}
                                            fullWidth
                                        />
                                    </Grid>
                                    <Grid size={{ xs: 12, md: 12 }} mt={1}>
                                        <InputLabel htmlFor="variables" sx={inputLabelStyles}>{t('variables')}</InputLabel>
                                        {
                                            variableOptions.map((elm: any, i: number) => (
                                                <Chip 
                                                    key={'ChipI'+i}
                                                    label={elm.label} 
                                                    variant='outlined' 
                                                    onClick={() => { 
                                                        rteRef.current?.editor?.commands.insertContent('{{'+elm.value+'}}');
                                                    }} 
                                                    sx={{ my: 1, mr: 0.5 }} 
                                                />
                                            ))
                                        }
                                    </Grid>
                                </Grid>
                            </Grid>
                            
                            <Grid size={{ xs: 6 }}>
                                <Grid container spacing={2}>
                                    {/* <Grid item xs={12}>
                                        <InputLabel htmlFor="mailLanguage" sx={inputLabelStyles}>{t('mailLanguage')}</InputLabel>
                                        <ToggleButtonGroup
                                            color="primary"
                                            value={mailLanguage}
                                            exclusive
                                            onChange={(event: React.MouseEvent<HTMLElement>, newValue: string,) => { 
                                                setMailLanguage(newValue); 
                                            }}
                                            aria-label="Platform"
                                            fullWidth
                                            sx={{ mt: 1, maxHeight: "44px" }}
                                        >
                                            <ToggleButton value="fr"><img src="/assets/img/flags/flag-fr.png" style={{ width: "12px", marginRight: "6px" }} alt="flag english" /> Français</ToggleButton>
                                            <ToggleButton value="en"><img src="/assets/img/flags/flag-en.png" style={{ width: "12px", marginRight: "6px" }} alt="flag english" /> English</ToggleButton>
                                        </ToggleButtonGroup>
                                    </Grid> */}
                                    <Grid size={{ xs: 12 }}>
                                        {
                                            mailLanguage !== "en" ? 
                                            <Box sx={{ mt: 1 }}>
                                                <InputLabel htmlFor="content" sx={inputLabelStyles} style={{ position: "relative", bottom: 6 }}>{t('content')} - FR</InputLabel>
                                                <Box sx={{ mt: 0 }}>
                                                    <RichTextEditor
                                                        ref={rteRef}
                                                        extensions={[StarterKit]}
                                                        content={content}
                                                        renderControls={() => (
                                                        <MenuControlsContainer>
                                                            <MenuSelectHeading />
                                                            <MenuDivider />
                                                            <MenuButtonBold />
                                                            <MenuButtonItalic />
                                                            <MenuButtonStrikethrough />
                                                            <MenuButtonOrderedList />
                                                            <MenuButtonBulletedList />
                                                            <MenuSelectTextAlign />
                                                            <MenuButtonEditLink />
                                                            <MenuButtonHorizontalRule />
                                                            <MenuButtonUndo />
                                                            <MenuButtonRedo />
                                                        </MenuControlsContainer>
                                                        )}
                                                    />
                                                </Box>
                                            </Box> : 
                                            <Box sx={{ mt: 1 }}>
                                                <InputLabel htmlFor="contentEn" sx={inputLabelStyles}>{t('content')} - EN</InputLabel>
                                            </Box>
                                        }
                                    </Grid>
                                </Grid>
                            </Grid>
                        </Grid> : <Skeleton />
                    }
                </DialogContent>
                <DialogActions>
                    <Button variant="contained" color={"primary"} onClick={() => { createUpdateTemplate(); }} sx={{ mr: 1.5, textTransform: "none" }}>{t('validate')}</Button>
                    <Button variant="contained" onClick={() => setModal2(false)} sx={buttonCloseStyles}>{t('close')}</Button>
                </DialogActions>
            </BootstrapDialog>
        </div>
    );
}

export default MasterDataTemplates;
