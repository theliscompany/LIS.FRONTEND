import { Alert, Box, Chip, Grid, IconButton, Paper, Skeleton, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography } from '@mui/material';
import { useEffect, useState } from 'react';
import '../../App.css';
import { DarkTooltip } from '../../misc/styles';
import { enqueueSnackbar, SnackbarProvider } from 'notistack';
import AssignmentIndIcon from '@mui/icons-material/AssignmentInd';
import AssignmentReturnIcon from '@mui/icons-material/AssignmentReturn';
import { graphRequest, protectedResources } from '../../authConfig';
import { useAuthorizedBackendApi } from '../../api/api';
import { BackendService } from '../../services/fetch';
import { useAccount, useMsal } from '@azure/msal-react';
import { AuthenticationResult } from '@azure/msal-browser';

function UsersAssigment(props: any) {
    const [load, setLoad] = useState<boolean>(false);
    const [showAlert, setShowAlert] = useState<boolean>(false);
    const [users, setUsers] = useState<any>(null);
    const [assignees, setAssignees] = useState<any>(null);

    const { instance, accounts } = useMsal();
    const account = useAccount(accounts[0] || {});
    
    const context = useAuthorizedBackendApi();
    
    
    useEffect(() => {
        getAssignees();
        //loadUsers();
    }, [account, instance]);
    
    const getAssignees = async () => {
        if (context) {
            setLoad(true);
            const response = await (context as BackendService<any>).getSingle(protectedResources.apiLisQuotes.endPoint+"/Assignee");
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
        }
    }

    const resetAssignees = async () => {
        if (context) {
            setLoad(true);
            const response = await (context as BackendService<any>).getSingle(protectedResources.apiLisQuotes.endPoint+"/Assignee");
            if (response !== null && response.code !== undefined) {
                if (response.code === 200) {
                    //console.log(response);
                    setAssignees(response.data);
                }
                else {
                    setLoad(false);
                }
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
            //console.log(data);
            setUsers(data.value);
        })
        .catch(error => { 
            setShowAlert(true);
            setLoad(false);
        });
    }
    
    const loadUsers = async () => {
        if(account) {
            const token = await instance.acquireTokenSilent({
                scopes: graphRequest.scopes,
                account: account
            })
            .then((response: AuthenticationResult)=>{
                return response.accessToken;
            })
            .catch(() => {
                return instance.acquireTokenPopup({
                    ...graphRequest,
                    account: account
                    }).then((response) => {
                        return response.accessToken;
                    });
                }
            );

            getUsersFromAAD(token);
        }
    }

    const removeAsManager = async (email: string) => {
        var assignee = assignees.find((user: any) => user.email === email);
        if (assignee) {
            if (context) {
                setLoad(true);
                const response = await (context as any).delete(protectedResources.apiLisQuotes.endPoint+"/Assignee/"+assignee.id);
                if (response !== null && response.code !== undefined) {
                    if (response.code === 200) {
                        //console.log(response);
                        enqueueSnackbar("Your operation has been done with success.", { variant: "info", anchorOrigin: { horizontal: "right", vertical: "top"} });

                        // Here i refresh the assignees (to do a lot cleaner)
                        const response2 = await (context as BackendService<any>).getSingle(protectedResources.apiLisQuotes.endPoint+"/Assignee");
                        if (response2 !== null && response2.code !== undefined) {
                            if (response2.code === 200) {
                                setAssignees(response2.data);
                            }
                            else {
                                enqueueSnackbar("An error occured during the refresh of your operation.", { variant: "error", anchorOrigin: { horizontal: "right", vertical: "top"} });
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
        if (context) {
            let content = { "name": name, "email": email, "idUser": idUser };
            const response = await (context as BackendService<any>).post(protectedResources.apiLisQuotes.endPoint+"/Assignee", content);
            if (response !== null && response.status === 201) {
                //console.log(response);
                enqueueSnackbar("Your new assignee has been created with success.", { variant: "success", anchorOrigin: { horizontal: "right", vertical: "top"} });

                // Here i refresh the assignees (to do a lot cleaner)
                const response2 = await (context as BackendService<any>).getSingle(protectedResources.apiLisQuotes.endPoint+"/Assignee");
                if (response2 !== null && response2.code !== undefined) {
                    if (response2.code === 200) {
                        setAssignees(response2.data);
                    }
                    else {
                        enqueueSnackbar("An error occured during the refresh of your operation.", { variant: "error", anchorOrigin: { horizontal: "right", vertical: "top"} });
                    }
                }  
            }
            else {
                enqueueSnackbar("An error occured. Please refresh the page or check your internet connection.", { variant: "error", anchorOrigin: { horizontal: "right", vertical: "top"} });
            }
        }
    }
    
    
    return (
        <div style={{ background: "#fff", borderTopLeftRadius: 20, borderTopRightRadius: 20 }}>
            <SnackbarProvider />
            <Box py={4}>
                <Typography variant="h5" mt={3} px={5}><b>Manage users who can assign</b></Typography>
                <Box>
                    <Grid container spacing={1} px={5} mt={2}>
                        <Grid item xs={12}>
                            {
                                users !== null && assignees !== null ?
                                <TableContainer component={Paper}>
                                    <Table sx={{ minWidth: 650 }} aria-label="simple table">
                                        <TableHead>
                                            <TableRow>
                                                <TableCell align="left" sx={{ fontSize: 16, fontWeight: "bolder" }}>Identifier</TableCell>
                                                <TableCell align="left" sx={{ fontSize: 16, fontWeight: "bolder" }}>Name</TableCell>
                                                <TableCell align="left" sx={{ fontSize: 16, fontWeight: "bolder" }}>Email address</TableCell>
                                                <TableCell align="left" sx={{ fontSize: 16, fontWeight: "bolder" }}>Status</TableCell>
                                                <TableCell align="left"><b></b></TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {
                                                users.map((row: any, i: number) => (
                                                    <TableRow key={row.id} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                                                        <TableCell align="left">{ "OmniMember-"+i}</TableCell>
                                                        <TableCell align="left">{row.displayName}</TableCell>
                                                        <TableCell align="left">{row.mail}</TableCell>
                                                        <TableCell align="left">
                                                            { assignees.some((user: any) => user.email === row.mail) ? <Chip label="Can assign" color="success" /> : <Chip label="Cannot assign"  /> }
                                                        </TableCell>
                                                        <TableCell align="left">
                                                            <DarkTooltip title={ assignees.some((user: any) => user.email === row.mail) ? "Cancel assign role" : "Assign as manager"} placement="right" arrow>
                                                                <IconButton 
                                                                    size="medium" 
                                                                    onClick={() => { 
                                                                        // assignAsManager(row.displayName, row.mail, row.id);
                                                                        assignees.some((user: any) => user.email === row.mail) ?
                                                                        removeAsManager(row.mail) : 
                                                                        assignAsManager(row.displayName, row.mail, row.id)
                                                                    }}
                                                                >
                                                                    { assignees.some((user: any) => user.email === row.mail) ? <AssignmentReturnIcon /> : <AssignmentIndIcon /> }
                                                                </IconButton>
                                                            </DarkTooltip>
                                                        </TableCell>
                                                    </TableRow>
                                                ))
                                            }
                                        </TableBody>
                                    </Table>
                                </TableContainer> : <Skeleton sx={{ mt: 3 }} />
                            }
                            {
                                showAlert ?
                                <Alert severity="warning">You cant manage the users because you are not the administrator. Please contact the administrator so he can grant you the desired role.</Alert> : null
                            }
                        </Grid>
                    </Grid>
                 </Box>
            </Box>
        </div>
    );
}

export default UsersAssigment;
