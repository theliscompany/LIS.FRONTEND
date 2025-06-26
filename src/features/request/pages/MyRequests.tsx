import React, { useEffect, useState } from 'react';
import List from '@mui/material/List';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import { Dayjs } from 'dayjs';
import { Alert, Button, Skeleton } from '@mui/material';
import Grid from '@mui/material/Grid2';
import SearchIcon from '@mui/icons-material/Search';
import { enqueueSnackbar, SnackbarProvider } from 'notistack';
import { useAccount, useMsal } from '@azure/msal-react';
import { useTranslation } from 'react-i18next';
import RequestViewItem from '@features/request/components/RequestViewItem';
import SearchZone from '@features/request/components/SearchZone';
import { getApiAssignee, getApiRequest } from '@features/request/api';

const MyRequests = () => {
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

    const { accounts } = useMsal();
    const account = useAccount(accounts[0] || {});    
    
    const handleChangePackingType = (event: { target: { value: string } }) => {
        setPackingType(event.target.value);
    };

    const handleChangeStatus = (event: { target: { value: string } }) => {
        setStatus(event.target.value);
    };

    const { t } = useTranslation();
    
    useEffect(() => {
        getAssignees();
    }, []);

    useEffect(() => {
        if (assignees !== null && assignees !== undefined) {
            loadRequests(assignees)
        }
    }, [assignees]);

    const getAssignees = async () => {
        try {
            setLoad(true);
            const response: any = await getApiAssignee();
            if (response !== null && response !== undefined) {
                setAssignees(response.data.data);
                setLoad(false);
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
    
    const loadRequests = async (assigneesList: any) => {
        try {
            var auxAssignee = assigneesList.find((elm: any) => elm.email === account?.username);
            // console.log("Acc", account);
            // console.log("Auxlist", assigneesList);
            // console.log("Auxass", auxAssignee);
            if (auxAssignee !== undefined) {
                setCurrentUser(auxAssignee)
                const response: any = await getApiRequest({query: {AssigneeId: auxAssignee.id}});
                if (response !== null && response !== undefined) {
                    setLoad(false);
                    setNotifications(response.data.data.reverse());
                }  
                else {
                    setLoad(false);
                    enqueueSnackbar(t('errorHappened'), { variant: "error", anchorOrigin: { horizontal: "right", vertical: "top"} });
                }
            }
            else {
                setLoad(false);
                enqueueSnackbar(t('cantFindRequestAssigned'), { variant: "warning", anchorOrigin: { horizontal: "right", vertical: "top"} });
            }
        }
        catch (err: any) {
            console.log(err);
            setLoad(false);
        }
    }

    const searchRequests = async () => {
        try {
            setLoad(true);
            var idAssignee = currentUser.id;
            var postcode1 = "";
            var postcode2 = "";
            var auxDeparture = departure !== null && departure !== undefined ? [departure.city.toUpperCase(),departure.country,departure.latitude,departure.longitude,postcode1].filter((val: any) => { return val !== "" }).join(', ') : "";
            var auxArrival = arrival !== null && arrival !== undefined ? [arrival.city.toUpperCase(),arrival.country,arrival.latitude,arrival.longitude,postcode2].filter((val: any) => { return val !== "" }).join(', ') : "";
            console.log(auxDeparture, auxArrival);
            
            const response: any = await getApiRequest({query: {Departure: auxDeparture, Arrival: auxArrival, PackingType: packingType, Status: status, CreatedAtStart: createdDateStart?.format('YYYY-MM-DDTHH:mm:ss'), CreatedAtEnd: createdDateEnd?.format('YYYY-MM-DDTHH:mm:ss'), UpdatedAtStart: updatedDateStart?.format('YYYY-MM-DDTHH:mm:ss'), UpdatedAtEnd: updatedDateEnd?.format('YYYY-MM-DDTHH:mm:ss'), AssigneeId: idAssignee}});
            if (response !== null && response !== undefined) {
                setLoad(false);
                setNotifications(response.data.data.reverse());
            }  
            else {
                setLoad(false);
                enqueueSnackbar(t('errorHappened'), { variant: "error", anchorOrigin: { horizontal: "right", vertical: "top"} });
            }
        }
        catch (err: any) {
            console.log(err);
            setLoad(false);
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
                        updatedDateStart={updatedDateStart} setUpdatedDateStart={setUpdatedDateStart}
                        updatedDateEnd={updatedDateEnd} setUpdatedDateEnd={setUpdatedDateEnd}
                        createdDateEnd={createdDateEnd} setCreatedDateEnd={setCreatedDateEnd}
                        createdDateStart={createdDateStart} setCreatedDateStart={setCreatedDateStart}
                    />
                    
                    <Grid size={{ xs: 12, md: 2 }} mt={1} sx={{ display: "flex", alignItems: "end" }}>
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