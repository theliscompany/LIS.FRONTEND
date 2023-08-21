import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import dayjs, { Dayjs } from 'dayjs';
import { DemoContainer, DemoItem } from '@mui/x-date-pickers/internals/demo';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { MobileDateTimePicker } from '@mui/x-date-pickers/MobileDateTimePicker';
import { DesktopDateTimePicker } from '@mui/x-date-pickers/DesktopDateTimePicker';
import { StaticDateTimePicker } from '@mui/x-date-pickers/StaticDateTimePicker';
import React, { useEffect, useState } from 'react';
import '../../App.css';
import { Button, Chip, Grid, InputLabel, NativeSelect, Skeleton } from '@mui/material';
import PlaceIcon from '@mui/icons-material/Place';
import SearchIcon from '@mui/icons-material/Search';
import AutocompleteSearch from '../shared/AutocompleteSearch';
import { BootstrapInput, datetimeStyles, inputLabelStyles } from '../../misc/styles';
import { protectedResources } from '../../authConfig';
import { enqueueSnackbar, SnackbarProvider } from 'notistack';
import { useAuthorizedBackendApi } from '../../api/api';
import { BackendService } from '../../services/fetch';
import { useParams } from 'react-router-dom';
import { RequestResponseDto } from '../../models/models';
import { useAccount, useMsal } from '@azure/msal-react';

function convertStringToObject(str: string): { city: string, country: string } {
    console.log(str);
    if (str !== undefined) {
        const [city, ...countryArr] = str.split(', ');
        const country = countryArr.join(', ');
        return { city, country };
    }
    return { city: "", country: "" };
}

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

function dateTimeDiff(date_time: string) {
    const now = new Date();
    const datetime = new Date(date_time);
    const diff = now.getTime() - datetime.getTime();
    const diffInDays = Math.floor(diff / (1000 * 60 * 60 * 24));
    const diffInHours = Math.floor(diff / (1000 * 60 * 60));
    const diffInMinutes = Math.floor(diff / (1000 * 60));

    if (diffInDays === 0) {
        if (diffInHours === 0) {
        return diffInMinutes === 0 ? "Just now" : diffInMinutes + " minutes ago";
        } else {
        return diffInHours + " hours ago";
        }
    } else if (diffInDays === 1) {
        return "Yesterday";
    } else {
        return diffInDays + " days ago";
    }
}

function MyRequests() {
    const [notifications, setNotifications] = useState<any>(null);
    const [load, setLoad] = useState<boolean>(true);
    const [currentUser, setCurrentUser] = useState<any>();
    const [status, setStatus] = useState<string>("");
    const [cargoType, setCargoType] = useState<string>("");
    const [packingType, setPackingType] = useState<string>("");
    const [departureTown, setDepartureTown] = useState<any>(null);
    const [arrivalTown, setArrivalTown] = useState<any>(null);
    const [departure, setDeparture] = useState<string>("");
    const [arrival, setArrival] = useState<string>("");
    const [createdDateStart, setCreatedDateStart] = useState<Dayjs | null>(null);
    const [createdDateEnd, setCreatedDateEnd] = useState<Dayjs | null>(null);
    const [updatedDateStart, setUpdatedDateStart] = useState<Dayjs | null>(null);
    const [updatedDateEnd, setUpdatedDateEnd] = useState<Dayjs | null>(null);
    const [assignees, setAssignees] = useState<any>(null);
    //let { search } = useParams();
    const { instance, accounts } = useMsal();
    const account = useAccount(accounts[0] || {});
    
    const context = useAuthorizedBackendApi();
    
    const handleChangeCargoType = (event: { target: { value: string } }) => {
        setCargoType(event.target.value);
    };

    const handleChangePackingType = (event: { target: { value: string } }) => {
        setPackingType(event.target.value);
    };

    const handleChangeStatus = (event: { target: { value: string } }) => {
        setStatus(event.target.value);
    };

    useEffect(() => {
        getAssignees();
    }, [instance, account, context]);

    const getAssignees = async () => {
        if (context) {
            setLoad(true);
            const response = await (context as BackendService<any>).getSingle(protectedResources.apiLisQuotes.endPoint+"/Assignee");
            if (response !== null && response.code !== undefined) {
                if (response.code === 200) {
                    setAssignees(response.data);
                    setCurrentUser(response.data.find((elm: any) => elm.email === account?.username));

                    // Then I can load requests
                    loadRequests(response.data);
                }
                else {
                    setLoad(false);
                }
            }
        }
    }

    const loadRequests = async (assigneesList: any) => {
        if (context) {
            //setLoad(true);
            var auxAssignee = assigneesList.find((elm: any) => elm.email === account?.username);
            if (auxAssignee !== undefined) {
                const response: RequestResponseDto = await (context as BackendService<any>).getSingle(protectedResources.apiLisQuotes.endPoint+"/Request?AssigneeId="+auxAssignee.id);
                if (response !== null && response.code !== undefined && response.data !== undefined) {
                    if (response.code === 200) {
                        setLoad(false);
                        setNotifications(response.data.reverse());
                    }
                    else {
                        setLoad(false);
                        enqueueSnackbar("Error during the loading of the data", { variant: "error", anchorOrigin: { horizontal: "right", vertical: "top"} });
                    }
                }  
            }
            else {
                setLoad(false);
                enqueueSnackbar("We cant find a request assigned to you", { variant: "warning", anchorOrigin: { horizontal: "right", vertical: "top"} });
            }
        }
    }

    const searchRequests = async () => {
        if (context) {
            setLoad(true);
            var idAssignee = currentUser.id;
            var requestFormatted = createGetRequestUrl(departure, arrival, packingType, status, createdDateStart, createdDateEnd, updatedDateStart, updatedDateEnd, idAssignee);
            const response: RequestResponseDto = await (context as BackendService<any>).getSingle(requestFormatted);
            if (response !== null && response.code !== undefined && response.data !== undefined) {
                if (response.code === 200) {
                    setLoad(false);
                    setNotifications(response.data.reverse());
                }
                else {
                    setLoad(false);
                    enqueueSnackbar("Error during the loading of the data.", { variant: "error", anchorOrigin: { horizontal: "right", vertical: "top"} });
                }
            }  
        }
    }

    return (
        <div style={{ background: "#fff", borderTopLeftRadius: 20, borderTopRightRadius: 20, overflowX: "hidden" }}>
            <SnackbarProvider />
            <Box py={2.5}>
                <Typography variant="h5" sx={{mt: {xs: 4, md: 1.5, lg: 1.5 }}} px={5}><b>My requests : {account?.name}</b></Typography>
                <Grid container spacing={1} px={5} mt={2}>
                    <Grid item xs={12} md={3}>
                        <InputLabel htmlFor="departure" sx={inputLabelStyles}>Departure location</InputLabel>
                        <BootstrapInput id="departure" type="text" value={departure} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setDeparture(e.target.value)} fullWidth />
                    </Grid>
                    <Grid item xs={12} md={3}>
                        <InputLabel htmlFor="arrival" sx={inputLabelStyles}>Arrival location</InputLabel>
                        <BootstrapInput id="arrival" type="text" value={arrival} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setArrival(e.target.value)} fullWidth />
                    </Grid>
                    <Grid item xs={12} md={3}>
                        <InputLabel htmlFor="packing-type" sx={inputLabelStyles}>Packing type</InputLabel>
                        <NativeSelect
                            id="packing-type"
                            value={packingType}
                            onChange={handleChangePackingType}
                            input={<BootstrapInput />}
                            fullWidth
                        >
                            <option value="">All types</option>
                            <option value="FCL">FCL</option>
                            <option value="Breakbulk/LCL">Breakbulk/LCL</option>
                            <option value="Unit RoRo">Unit RoRo</option>
                        </NativeSelect>
                    </Grid>
                    <Grid item xs={12} md={3}>
                        <InputLabel htmlFor="status-id" sx={inputLabelStyles}>Status</InputLabel>
                        <NativeSelect
                            id="status-id"
                            value={status}
                            onChange={handleChangeStatus}
                            input={<BootstrapInput />}
                            fullWidth
                        >
                            <option value="">All status</option>
                            <option value="0">En Attente</option>
                            <option value="1">Validé</option>
                            <option value="2">Rejeté</option>
                        </NativeSelect>
                    </Grid>
                    <Grid item xs={12} md={3} mt={1}>
                        <InputLabel htmlFor="created-date-start" sx={inputLabelStyles}>Created date start</InputLabel>
                        <LocalizationProvider dateAdapter={AdapterDayjs}>
                            <DateTimePicker 
                                value={createdDateStart} 
                                onChange={(value: any) => { setCreatedDateStart(value) }}
                                slotProps={{ textField: { id: "created-date-start", fullWidth: true, sx: datetimeStyles }, inputAdornment: { sx: { position: "relative", right: "11.5px" } } }}
                            />
                        </LocalizationProvider>
                    </Grid>
                    <Grid item xs={12} md={3} mt={1}>
                        <InputLabel htmlFor="created-date-end" sx={inputLabelStyles}>Created date end</InputLabel>
                        <LocalizationProvider dateAdapter={AdapterDayjs}>
                            <DateTimePicker 
                                value={createdDateEnd} 
                                onChange={(value: any) => { setCreatedDateEnd(value) }}
                                slotProps={{ textField: { id: "created-date-end", fullWidth: true, sx: datetimeStyles }, inputAdornment: { sx: { position: "relative", right: "11.5px" } } }}
                            />
                        </LocalizationProvider>
                    </Grid>
                    <Grid item xs={12} md={3} mt={1}>
                        <InputLabel htmlFor="updated-date-start" sx={inputLabelStyles}>Updated date start</InputLabel>
                        <LocalizationProvider dateAdapter={AdapterDayjs}>
                            <DateTimePicker 
                                value={updatedDateStart} 
                                onChange={(value: any) => { setUpdatedDateStart(value) }} 
                                slotProps={{ textField: { id: "updated-date-start", fullWidth: true, sx: datetimeStyles }, inputAdornment: { sx: { position: "relative", right: "11.5px" } } }}
                            />
                        </LocalizationProvider>
                    </Grid>
                    <Grid item xs={12} md={3} mt={1}>
                        <InputLabel htmlFor="updated-date-end" sx={inputLabelStyles}>Updated date end</InputLabel>
                        <LocalizationProvider dateAdapter={AdapterDayjs}>
                            <DateTimePicker 
                                value={updatedDateEnd} 
                                onChange={(value: any) => { setUpdatedDateEnd(value) }} 
                                slotProps={{ textField: { id: "updated-date-end", fullWidth: true, sx: datetimeStyles }, inputAdornment: { sx: { position: "relative", right: "11.5px" } } }}
                            />
                        </LocalizationProvider>
                    </Grid>
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
                            Search
                        </Button>
                    </Grid>
                </Grid>

                {
                    !load ? 
                        notifications !== null ? 
                        <List sx={{ 
                            mt: 3 
                        }}>
                            {
                                notifications.map((item: any, i: number) => {
                                    return (
                                        <ListItem
                                            key={"request-"+i}
                                            component="a"
                                            href={"/admin/request/" + item.id}
                                            sx={{ 
                                                '&:hover': {
                                                    backgroundColor: "#fbfbfb"
                                                },
                                                borderTop: "1px solid #e6e6e6", 
                                                px: 5, pt: 1.25, pb: 2 
                                            }}
                                        >
                                            <Grid container sx={{ maxWidth: "600px", color: "#333" }}>
                                                <Grid item xs={12}>
                                                    <ListItemText
                                                        primary={<Typography variant="subtitle1" color="#333"><b>{item.email !== "emailexample@gmail.com" ? "#" + item.id + " New quote request" + " from : " + item.email : "New quote request"}</b></Typography>}
                                                    />        
                                                </Grid>
                                                <Grid item xs={12}>
                                                    {dateTimeDiff(item.createdAt)} <Chip size="small" label={item.status} color={item.status === "EnAttente" ? "warning" : item.status === "Valider" ? "success" : "secondary"} sx={{ ml: 1 }} />
                                                </Grid>
                                                <Grid item xs={12} md={6} mt={1}>
                                                    <Typography variant="subtitle1" display="flex" alignItems="center" justifyContent="left" fontSize={15}>Departure location</Typography>
                                                    <Typography variant="subtitle2" display="flex" alignItems="center" justifyContent="left" fontSize={14}>
                                                        <PlaceIcon sx={{ position: "relative", right: "4px" }} /> <span>{item.departure}</span>
                                                    </Typography>
                                                </Grid>
                                                <Grid item xs={12} md={6} mt={1}>
                                                    <Typography variant="subtitle1" display="flex" alignItems="center" justifyContent="left" fontSize={15}>Arrival location</Typography>
                                                    <Typography variant="subtitle2" display="flex" alignItems="center" justifyContent="left" fontSize={14}>
                                                        <PlaceIcon sx={{ position: "relative", right: "4px" }} /> <span>{item.arrival}</span>
                                                    </Typography>
                                                </Grid>
                                            </Grid>
                                        </ListItem>
                                    )
                                })
                            }
                        </List> : <Typography variant="subtitle1" px={5} my={3}>No requests have been found.</Typography>
                    : <Skeleton sx={{ mt: 3 }} />
                }
                
            </Box>
        </div>
    );
}

export default MyRequests;