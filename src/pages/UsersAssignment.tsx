import { useEffect, useState } from 'react';
import { Alert, Box, Chip, Grid, IconButton, Skeleton, Typography } from '@mui/material';
import { DarkTooltip, gridStyles } from '../utils/misc/styles';
import { enqueueSnackbar, SnackbarProvider } from 'notistack';
import AssignmentIndIcon from '@mui/icons-material/AssignmentInd';
import AssignmentReturnIcon from '@mui/icons-material/AssignmentReturn';
import { graphRequest, loginRequest, protectedResources } from '../config/authConfig';
import { useAuthorizedBackendApi } from '../api/api';
import { BackendService } from '../utils/services/fetch';
import { useAccount, useMsal } from '@azure/msal-react';
import { useTranslation } from 'react-i18next';
import { DataGrid, GridColDef, GridRenderCellParams } from '@mui/x-data-grid';
import { getAccessToken } from '../utils/functions';

function UsersAssignment(props: any) {
    const [load, setLoad] = useState<boolean>(false);
    const [showAlert, setShowAlert] = useState<boolean>(false);
    const [users, setUsers] = useState<any>(null);
    const [assignees, setAssignees] = useState<any>(null);
    const [tempToken, setTempToken] = useState<string>("");

    const { instance, accounts } = useMsal();
    const account = useAccount(accounts[0] || {});
    
    const context = useAuthorizedBackendApi();
    
    const { t } = useTranslation();
    
    const columnsUsers: GridColDef[] = [
        { field: 'id', headerName: t('id'), minWidth: 100, flex: 1.6 },
        { field: 'displayName', headerName: t('name'), minWidth: 100, flex: 1.2 },
        { field: 'mail', headerName: t('email'), minWidth: 250, flex: 1.2 },
        // { field: 'assignee', headerName: t('assignee'), valueFormatter: (params: GridValueFormatterParams) => `${params.value !== null ? params.value.name+" (#"+params.value.id+")" : "Not defined"}`, minWidth: 100, flex: 1 },
        { field: 'xxx', headerName: t('status'), renderCell: (params: GridRenderCellParams) => {
            return (
                <Box>
                    { assignees.some((user: any) => user.email === params.row.mail) ? <Chip label={t('canAssign')} color="success" /> : <Chip label={t('cannotAssign')} /> }
                </Box>
            );
        }, minWidth: 100, flex: 0.6 },
        { field: 'www', headerName: t('Actions'), renderCell: (params: GridRenderCellParams) => {
            return (
                <Box sx={{ my: 1, mr: 1 }}>
                    <DarkTooltip title={ assignees.some((user: any) => user.email === params.row.mail) ? t('cancelAssign') : t('assignAsManager')} placement="right" arrow>
                        <IconButton 
                            size="medium" 
                            onClick={() => { 
                                assignees.some((user: any) => user.email === params.row.mail) ?
                                removeAsManager(params.row.mail) : 
                                assignAsManager(params.row.displayName, params.row.mail, params.row.id)
                            }}
                        >
                            { assignees.some((user: any) => user.email === params.row.mail) ? <AssignmentReturnIcon /> : <AssignmentIndIcon /> }
                        </IconButton>
                    </DarkTooltip>
                </Box>
            );
        }, minWidth: 100, flex: 0.5 }
    ];
    
    useEffect(() => {
        getAssignees();
        //loadUsers();
    }, [account, instance]);
    
    const getAssignees = async () => {
        if (account && instance) {
            const token = await getAccessToken(instance, loginRequest, account);
            setTempToken(token);
            
            try {
                setLoad(true);
                const response = await (context as BackendService<any>).getWithToken(protectedResources.apiLisQuotes.endPoint+"/Assignee", token);
                if (response !== null && response.code !== undefined) {
                    if (response.code === 200) {
                        //console.log(response);
                        setAssignees(response.data);
                        setLoad(false);

                        // Then I can load users
                        loadUsers();
                    }
                    else {
                        setLoad(false);
                    }
                }
                else {
                    setLoad(false);
                }
            }
            catch (err: any) {
                setLoad(false);
                console.log(err);
            }  
        }
    }

    const getUsersFromAAD = (token: string) => {
        fetch("https://graph.microsoft.com/v1.0/users", {
            method: "GET",
            headers: {
                "Accept": "application/json",
                "Authorization": token
            }
        })
        .then((response: any) => response.json())
        .then((data: any) => {
            if (data.error === undefined) {
                console.log(data);
                setUsers(data.value);
            }
            else {
                setShowAlert(true);
                setLoad(false);
            }
        })
        .catch(error => { 
            setShowAlert(true);
            setLoad(false);
        });
    }
    
    const loadUsers = async () => {
        if(account) {
            const token = await getAccessToken(instance, graphRequest, account);
            getUsersFromAAD(token);
        }
    }

    const removeAsManager = async (email: string) => {
        var assignee = assignees.find((user: any) => user.email === email);
        if (assignee) {
            if (account && instance) {
                setLoad(true);
                const response = await (context as BackendService<any>).deleteWithToken(protectedResources.apiLisQuotes.endPoint+"/Assignee/"+assignee.id, tempToken);
                if (response !== null && response.code !== undefined) {
                    if (response.code === 200) {
                        //console.log(response);
                        enqueueSnackbar(t('operationSuccess'), { variant: "info", anchorOrigin: { horizontal: "right", vertical: "top"} });

                        // Here i refresh the assignees (to do a lot cleaner)
                        const response2 = await (context as BackendService<any>).getWithToken(protectedResources.apiLisQuotes.endPoint+"/Assignee", tempToken);
                        if (response2 !== null && response2.code !== undefined) {
                            if (response2.code === 200) {
                                setAssignees(response2.data);
                            }
                            else {
                                enqueueSnackbar(t('errorHappened'), { variant: "error", anchorOrigin: { horizontal: "right", vertical: "top"} });
                            }
                        }  
                    }
                    else {
                        setLoad(false);
                    }
                }  
            }
        }
        else {
            console.log("Error message : assignee doesnt exist");
        }
    }

    const assignAsManager = async (name: string, email: string, idUser: string) => {
        if (account && instance) {
            let content = { "name": name, "email": email, "idUser": idUser };
            const response = await (context as BackendService<any>).postWithToken(protectedResources.apiLisQuotes.endPoint+"/Assignee", content, tempToken);
            if (response !== null && response.status === 201) {
                //console.log(response);
                enqueueSnackbar(t('assigneeCreatedSuccess'), { variant: "success", anchorOrigin: { horizontal: "right", vertical: "top"} });

                // Here i refresh the assignees (to do a lot cleaner)
                const response2 = await (context as BackendService<any>).getWithToken(protectedResources.apiLisQuotes.endPoint+"/Assignee", tempToken);
                if (response2 !== null && response2.code !== undefined) {
                    if (response2.code === 200) {
                        setAssignees(response2.data);
                    }
                    else {
                        enqueueSnackbar(t('errorHappened'), { variant: "error", anchorOrigin: { horizontal: "right", vertical: "top"} });
                    }
                }  
            }
            else {
                enqueueSnackbar(t('errorHappened'), { variant: "error", anchorOrigin: { horizontal: "right", vertical: "top"} });
            }
        }
    }
    
    
    return (
        <div style={{ background: "#fff", borderTopLeftRadius: 20, borderTopRightRadius: 20 }}>
            <SnackbarProvider />
            <Box py={2.5}>
                <Typography variant="h5" sx={{mt: {xs: 4, md: 1.5, lg: 1.5 }}} px={5}><b>{t('userAssignmentTitle')}</b></Typography>
                <Box>
                    <Grid container spacing={1} px={5} mt={2}>
                        <Grid item xs={12}>
                            {
                                users !== null && users !== undefined && assignees !== null ?
                                <Box sx={{ overflow: "auto" }}>
                                    <Box sx={{ width: "100%", display: "table", tableLayout: "fixed" }}>
                                        <DataGrid
                                            rows={users}
                                            columns={columnsUsers}
                                            // hideFooter
                                            getRowId={(row: any) => row?.id}
                                            getRowHeight={() => "auto" }
                                            sx={gridStyles}
                                            disableRowSelectionOnClick
                                        />
                                    </Box>
                                </Box> : !showAlert ? <Skeleton sx={{ mt: 3 }} /> : null
                            }
                            {
                                showAlert ?<Alert severity="warning">{t('notAdministratorForAssign')}</Alert> : null
                            }
                        </Grid>
                    </Grid>
                 </Box>
            </Box>
        </div>
    );
}

export default UsersAssignment;
