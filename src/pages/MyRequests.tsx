import React, { useEffect, useState } from 'react';
import List from '@mui/material/List';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import { Dayjs } from 'dayjs';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { Alert, Button, Grid, InputLabel, NativeSelect, Skeleton } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { BootstrapInput, datetimeStyles, inputLabelStyles } from '../utils/misc/styles';
import { protectedResources } from '../config/authConfig';
import { enqueueSnackbar, SnackbarProvider } from 'notistack';
import { useAuthorizedBackendApi } from '../api/api';
import { BackendService } from '../utils/services/fetch';
import { RequestResponseDto } from '../utils/models/models';
import { useAccount, useMsal } from '@azure/msal-react';
import { useTranslation } from 'react-i18next';
import RequestViewItem from '../components/requestsPage/RequestViewItem';
import AutocompleteSearch from '../components/shared/AutocompleteSearch';
import SearchZone from '../components/requestsPage/SearchZone';
import { useSelector } from 'react-redux';

function createGetRequestUrl(variable1: string, variable2: string, variable3: string, variable4: string, variable5: Dayjs|null, variable6: Dayjs|null, variable7: Dayjs|null, variable8: Dayjs|null, assigneeId: number) {
    let url = protectedResources.apiLisQuotes.endPoint+'/Request?';
    if (variable1) {
      url += 'departure=' + encodeURIComponent(variable1) + '&';
    }
    if (variable2) {
      url += 'arrival=' + encodeURIComponent(variable2) + '&';
    }
    if (variable3) {
      url += 'packingType=' + encodeURIComponent(variable3) + '&';
    }
    if (variable4) {
      url += 'status=' + encodeURIComponent(variable4) + '&';
    }
    if (variable5) {
        url += 'createdAtStart=' + encodeURIComponent(variable5.format('YYYY-MM-DDTHH:mm:ss')) + '&';
    }
    if (variable6) {
        url += 'createdAtEnd=' + encodeURIComponent(variable6.format('YYYY-MM-DDTHH:mm:ss')) + '&';
    }
    if (variable7) {
        url += 'updatedAtStart=' + encodeURIComponent(variable7.format('YYYY-MM-DDTHH:mm:ss')) + '&';
    }
    if (variable8) {
        url += 'updatedAtEnd=' + encodeURIComponent(variable8.format('YYYY-MM-DDTHH:mm:ss')) + '&';
    } 
    url+= 'assigneeId=' + assigneeId + '&';
    
    if (url.slice(-1) === '&') {
      url = url.slice(0, -1);
    }
    return url;
}

function MyRequests() {
    const [notifications, setNotifications] = useState<any>(null);
    const [load, setLoad] = useState<boolean>(true);
    const [assignees, setAssignees] = useState<any>(null);
    const [currentUser, setCurrentUser] = useState<any>();
    const [status, setStatus] = useState<string>("");
    const [packingType, setPackingType] = useState<string>("");
    const [departure, setDeparture] = React.useState<any>(null);
    const [arrival, setArrival] = React.useState<any>(null);
    const [createdDateStart, setCreatedDateStart] = useState<Dayjs | null>(null);
    const [createdDateEnd, setCreatedDateEnd] = useState<Dayjs | null>(null);
    const [updatedDateStart, setUpdatedDateStart] = useState<Dayjs | null>(null);
    const [updatedDateEnd, setUpdatedDateEnd] = useState<Dayjs | null>(null);
    //let { search } = useParams();
    const { instance, accounts } = useMsal();
    const account = useAccount(accounts[0] || {});
    
    const context = useAuthorizedBackendApi();
    
    var ourAssignees: any = useSelector((state: any) => state.masterdata.assignees);

    const handleChangePackingType = (event: { target: { value: string } }) => {
        setPackingType(event.target.value);
    };

    const handleChangeStatus = (event: { target: { value: string } }) => {
        setStatus(event.target.value);
    };

    const { t } = useTranslation();
    
    useEffect(() => {
        getAssignees();
    }, [instance, account]);

    useEffect(() => {
        if (assignees !== null && assignees !== undefined) {
            loadRequests(assignees)
        }
    }, [assignees]);

    const getAssignees = async () => {
        if (account && instance && context) {
            if (ourAssignees !== undefined) {
                console.log(ourAssignees);
                setAssignees(ourAssignees.data);
                setLoad(false);
            }
            else {
                try {
                    setLoad(true);
                    const response = await (context?.service as BackendService<any>).getWithToken(protectedResources.apiLisQuotes.endPoint+"/Assignee", context.tokenLogin);
                    if (response !== null && response.code !== undefined) {
                        if (response.code === 200) {
                            setAssignees(response.data);
                            // loadRequests(response.data);
                            setLoad(false);
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
    }
    
    // const getAssignees = async () => {
    //     if (account && instance && context) {
    //         const response = await (context?.service as BackendService<any>).getWithToken(protectedResources.apiLisQuotes.endPoint+"/Assignee", context.tokenLogin);
    //         if (response !== null && response.code !== undefined) {
    //             if (response.code === 200) {
    //                 setCurrentUser(response.data.find((elm: any) => elm.email === account?.username));
    //                 // Then I can load requests
    //                 loadRequests(response.data);
    //             }
    //             else {
    //                 setLoad(false);
    //             }
    //         }
    //     }
    // }

    const loadRequests = async (assigneesList: any) => {
        if (account && instance && context) {
            //setLoad(true);
            var auxAssignee = assigneesList.find((elm: any) => elm.email === account?.username);
            console.log("Acc", account);
            console.log("Auxlist", assigneesList);
            console.log("Auxass", auxAssignee);
            if (auxAssignee !== undefined) {
                const response: RequestResponseDto = await (context?.service as BackendService<any>).getWithToken(protectedResources.apiLisQuotes.endPoint+"/Request?AssigneeId="+auxAssignee.id, context.tokenLogin);
                if (response !== null && response.code !== undefined && response.data !== undefined) {
                    if (response.code === 200) {
                        setLoad(false);
                        setNotifications(response.data.reverse());
                    }
                    else {
                        setLoad(false);
                        enqueueSnackbar(t('errorHappened'), { variant: "error", anchorOrigin: { horizontal: "right", vertical: "top"} });
                    }
                }  
            }
            else {
                setLoad(false);
                enqueueSnackbar(t('cantFindRequestAssigned'), { variant: "warning", anchorOrigin: { horizontal: "right", vertical: "top"} });
            }
        }
    }

    const searchRequests = async () => {
        if (account && instance && context) {
            setLoad(true);
            var idAssignee = currentUser.id;
            
            var postcode1 = "";
            var postcode2 = "";
            var auxDeparture = departure !== null && departure !== undefined ? [departure.city.toUpperCase(),departure.country,departure.latitude,departure.longitude,postcode1].filter((val: any) => { return val !== "" }).join(', ') : "";
            var auxArrival = arrival !== null && arrival !== undefined ? [arrival.city.toUpperCase(),arrival.country,arrival.latitude,arrival.longitude,postcode2].filter((val: any) => { return val !== "" }).join(', ') : "";
            console.log(auxDeparture, auxArrival);

            var requestFormatted = createGetRequestUrl(auxDeparture, auxArrival, packingType, status, createdDateStart, createdDateEnd, updatedDateStart, updatedDateEnd, idAssignee);
            const response: RequestResponseDto = await (context?.service as BackendService<any>).getSingle(requestFormatted);
            if (response !== null && response.code !== undefined && response.data !== undefined) {
                if (response.code === 200) {
                    setLoad(false);
                    setNotifications(response.data.reverse());
                }
                else {
                    setLoad(false);
                    enqueueSnackbar(t('errorHappened'), { variant: "error", anchorOrigin: { horizontal: "right", vertical: "top"} });
                }
            }  
        }
    }

    return (
        <div style={{ background: "#fff", borderTopLeftRadius: 20, borderTopRightRadius: 20, overflowX: "hidden" }}>
            <SnackbarProvider />
            <Box py={2.5}>
                <Typography variant="h5" sx={{mt: {xs: 4, md: 1.5, lg: 1.5 }}} px={5}><b>{t('myRequests')} : {account?.name}</b></Typography>
                <Grid container spacing={1} px={5} mt={2}>
                    <SearchZone 
                        departure={departure} setDeparture={setDeparture}
                        arrival={arrival} setArrival={setArrival}
                        packingType={packingType} handleChangePackingType={handleChangePackingType}
                        status={status} handleChangeStatus={handleChangeStatus}
                        updatedDateStart={updatedDateStart} setUpdatedDateStart
                        updatedDateEnd={updatedDateEnd} setUpdatedDateEnd={setUpdatedDateEnd}
                        createdDateEnd={createdDateEnd} setCreatedDateEnd={setCreatedDateEnd}
                        createdDateStart={createdDateStart} setCreatedDateStart={setCreatedDateStart}
                    />
                    
                    <Grid item xs={12} md={2} mt={1} sx={{ display: "flex", alignItems: "end" }}>
                        <Button 
                            variant="contained" 
                            color="inherit"
                            startIcon={<SearchIcon />} 
                            size="large"
                            sx={{ backgroundColor: "#fff", color: "#333", textTransform: "none", mb: 0.15 }}
                            onClick={searchRequests}
                            fullWidth
                        >
                            {t('search')}
                        </Button>
                    </Grid>
                </Grid>

                {
                    !load ? 
                        notifications !== null && notifications.length !== 0 ? 
                        <List sx={{ mt: 3  }}>
                            {
                                notifications.map((item: any, i: number) => {
                                    return (<RequestViewItem key={"dsd"+i} item={item} i={i} />)
                                })
                            }
                        </List> : <Alert severity="warning" sx={{ mx: 5, mt: 3 }}>{t('noResults')}</Alert>
                    : <Skeleton sx={{ mt: 3 }} />
                }
                
            </Box>
        </div>
    );
}

export default MyRequests;