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
      url += 'cargoType=' + encodeURIComponent(variable3) + '&';
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

function Requests() {
    const [notifications, setNotifications] = React.useState<any>(null);
    //const [design, setDesign] = React.useState<string>("List");
    const [load, setLoad] = React.useState<boolean>(true);
    const [status, setStatus] = React.useState<string>("");
    const [cargoType, setCargoType] = React.useState<string>("");
    const [departureTown, setDepartureTown] = React.useState<any>(null);
    const [arrivalTown, setArrivalTown] = React.useState<any>(null);
    const [departure, setDeparture] = React.useState<string>("");
    const [arrival, setArrival] = React.useState<string>("");

    const context = useAuthorizedBackendApi();
    
    const handleChangeCargoType = (event: { target: { value: string } }) => {
        setCargoType(event.target.value);
    };

    const handleChangeStatus = (event: { target: { value: string } }) => {
        setStatus(event.target.value);
    };

    useEffect(() => {
        loadRequests();
    }, [context]);

    const loadRequests = async () => {
        console.log(context);
        if (context) {
            setLoad(true);
            const response:any = await (context as BackendService<any>).getSingle(protectedResources.apiLisQuotes.endPoint+"/Request");
            if (response !== null && response.code !== undefined) {
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
            const response:any = await (context as BackendService<any>).getSingle(requestFormatted);
            if (response !== null && response.code !== undefined) {
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
        <div style={{ background: "#fff", borderTopLeftRadius: 20, borderTopRightRadius: 20, overflowX: "hidden" }}>
            <SnackbarProvider />
            <Box py={4}>
                <Typography variant="h5" mt={3} mx={5}><b>List of requests for quote</b></Typography>
                <Grid container spacing={1} mx={4} mt={2}>
                    <Grid item xs={3}>
                        <InputLabel htmlFor="departure" sx={inputLabelStyles}>Departure location</InputLabel>
                        <AutocompleteSearch id="departure" value={departureTown} onChange={(e: any) => { setDepartureTown(convertStringToObject(e.target.innerText)); setDeparture(e.target.innerText); }} fullWidth disabled={status === "Valider"} />
                    </Grid>
                    <Grid item xs={3}>
                        <InputLabel htmlFor="arrival" sx={inputLabelStyles}>Arrival location</InputLabel>
                        <AutocompleteSearch id="arrival" value={arrivalTown} onChange={(e: any) => { setArrivalTown(convertStringToObject(e.target.innerText)); setArrival(e.target.innerText); }} fullWidth disabled={status === "Valider"} />
                    </Grid>
                    <Grid item xs={2}>
                        <InputLabel htmlFor="cargo-type" sx={inputLabelStyles}>Type of cargo</InputLabel>
                        <NativeSelect
                            id="demo-customized-select-native"
                            value={cargoType}
                            onChange={handleChangeCargoType}
                            input={<BootstrapInput />}
                            fullWidth
                        >
                            <option value="">All types</option>
                            <option value="0">Container</option>
                            <option value="1">Conventional</option>
                            <option value="2">Roll-on/Roll-off</option>
                        </NativeSelect>
                    </Grid>
                    <Grid item xs={2}>
                        <InputLabel htmlFor="cargo-type" sx={inputLabelStyles}>Status</InputLabel>
                        <NativeSelect
                            id="demo-customized-select-native2"
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
                    <Grid item xs={2} sx={{ display: "flex", alignItems: "end" }}>
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
                                                        primary={<Typography variant="subtitle1" color="#333"><b>{"#" + item.id + " New quote request" + " from : " + item.email}</b></Typography>}
                                                    />        
                                                </Grid>
                                                <Grid item xs={12}>
                                                    {dateTimeDiff(item.createdAt)} <Chip size="small" label={item.status} color={item.status === "EnAttente" ? "warning" : item.status === "Valider" ? "success" : "error"} sx={{ ml: 1 }} />
                                                </Grid>
                                                <Grid item xs={6} mt={1}>
                                                    <Typography variant="subtitle1" display="flex" alignItems="center" justifyContent="left" fontSize={15}>Departure location</Typography>
                                                    <Typography variant="subtitle2" display="flex" alignItems="center" justifyContent="left" fontSize={14}>
                                                        <PlaceIcon sx={{ position: "relative", right: "4px" }} /> <span>{item.departure}</span>
                                                    </Typography>
                                                </Grid>
                                                <Grid item xs={6} mt={1}>
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

export default Requests;