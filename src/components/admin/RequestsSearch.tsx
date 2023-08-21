import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import React, { useEffect } from 'react';
import '../../App.css';
import { Button, Chip, Grid, InputLabel, NativeSelect, Skeleton } from '@mui/material';
import PlaceIcon from '@mui/icons-material/Place';
import SearchIcon from '@mui/icons-material/Search';
import AutocompleteSearch from '../shared/AutocompleteSearch';
import { BootstrapInput, inputLabelStyles } from '../../misc/styles';
import { protectedResources } from '../../authConfig';
import { enqueueSnackbar, SnackbarProvider } from 'notistack';
import { useAuthorizedBackendApi } from '../../api/api';
import { BackendService } from '../../services/fetch';
import { useParams } from 'react-router-dom';
import { RequestResponseDto } from '../../models/models';


function convertStringToObject(str: string): { city: string, country: string } {
    console.log(str);
    if (str !== undefined) {
        const [city, ...countryArr] = str.split(', ');
        const country = countryArr.join(', ');
        return { city, country };
    }
    return { city: "", country: "" };
}

function createGetRequestUrl(variable1: string, variable2: string, variable3: string, variable4: string) {
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

function RequestsSearch() {
    const [notifications, setNotifications] = React.useState<any>(null);
    const [load, setLoad] = React.useState<boolean>(true);
    const [status, setStatus] = React.useState<string>("");
    const [cargoType, setCargoType] = React.useState<string>("");
    const [packingType, setPackingType] = React.useState<string>("");
    const [departureTown, setDepartureTown] = React.useState<any>(null);
    const [arrivalTown, setArrivalTown] = React.useState<any>(null);
    const [departure, setDeparture] = React.useState<string>("");
    const [arrival, setArrival] = React.useState<string>("");
    let { search } = useParams();

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
        loadRequests();
    }, [context, search]);

    const loadRequests = async () => {
        if (context) {
            // console.log(search);
            setLoad(true);
            const response: RequestResponseDto = await (context as BackendService<any>).getSingle(search !== undefined ? protectedResources.apiLisQuotes.endPoint+"/Request?Search="+search : protectedResources.apiLisQuotes.endPoint+"/Request");
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
    }

    const searchRequests = async () => {
        if (context) {
            setLoad(true);
            var requestFormatted = createGetRequestUrl(departure, arrival, cargoType, status);
            const response: RequestResponseDto = await (context as BackendService<any>).getSingle(requestFormatted);
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
    }

    return (
        <div style={{ background: "#fff", borderTopLeftRadius: 20, borderTopRightRadius: 20 }}>
            <SnackbarProvider />
            <Box py={2.5}>
                <Typography variant="h5" sx={{mt: {xs: 4, md: 1.5, lg: 1.5 }}} mx={5}>
                    {
                        search !== undefined ? <b>Search results for : {search}</b> : <b>List of requests for quote</b>
                    }
                </Typography>
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
                    <Grid item xs={12} md={2}>
                        <InputLabel htmlFor="status" sx={inputLabelStyles}>Status</InputLabel>
                        <NativeSelect
                            id="status"
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
                    <Grid item xs={12} md={2} sx={{ display: "flex", alignItems: "end" }}>
                        <Button 
                            variant="contained" 
                            color="inherit"
                            startIcon={<SearchIcon />} 
                            size="large"
                            sx={{ backgroundColor: "#fff", color: "#333", textTransform: "none", mb: 0.15 }}
                            onClick={searchRequests}
                        >
                            Search
                        </Button>
                    </Grid>
                </Grid>

                {
                    !load ? 
                        notifications !== null ? 
                        <List sx={{ mt: 3 }}>
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
                        </List> : <Typography variant="subtitle1" mx={5} my={3}>Error during the loading of the data</Typography>
                    : <Skeleton sx={{ mx: 5, mt: 3 }} />
                }
                
            </Box>
        </div>
    );
}

export default RequestsSearch;