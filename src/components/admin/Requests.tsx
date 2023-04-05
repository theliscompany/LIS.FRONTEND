import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import React, { useEffect } from 'react';
import '../../App.css';
import { Button, Chip, Grid } from '@mui/material';
import PlaceIcon from '@mui/icons-material/Place';

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
    const [design, setDesign] = React.useState<string>("List");
    
    useEffect(() => {
        loadRequests();
    }, []);

    function loadRequests() {
        fetch("https://localhost:7089/api/Request")
        .then((response) => response.json())
        .then((data) => {
            console.log(data);
            if(data.code === 200) {
                setNotifications(data.data.reverse());
            }
        });
    }
  
    return (
        <div style={{ background: "#fff", borderTopLeftRadius: 20, borderTopRightRadius: 20 }}>
            <Box py={4}>
                <Typography variant="h5" mt={3} mx={5}><b>List of requests for quote</b></Typography>
                
                {
                    notifications !== null ? 
                    <List sx={{ mt: 3 }}>
                        {
                            notifications.map((item: any, i: number) => {
                                return (
                                    <ListItem
                                        key={"request-"+i}
                                        component="a"
                                        href={"/admin/request/" + item.id}
                                        sx={{ borderTop: "1px solid #e6e6e6", px: 5, pt: 1.25, pb: 2 }}
                                    >
                                        <Grid container sx={{ maxWidth: "600px", color: "#333" }}>
                                            <Grid item xs={12}>
                                                <ListItemText
                                                    primary={<Typography variant="subtitle1" color="#333"><b>{"#" + item.id + " New quote request" + " from : " + item.email}</b></Typography>}
                                                    secondary={<></>}
                                                />        
                                            </Grid>
                                            <Grid item xs={12}>
                                                {dateTimeDiff(item.createdAt)} <Chip size="small" label={item.status} color={item.status === "EnAttente" ? "warning" : "success"} sx={{ ml: 1 }} />
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
                                            {/* <Grid item xs={6}>
                                                <Button variant="contained" color="primary" sx={{ mt: 2, mr: 2, textTransform: "none" }} disabled={item.status === "Valider"} >Validate</Button>
                                                <Button variant="contained" sx={{ mt: 2, textTransform: "none" }}>Reject</Button>
                                            </Grid> */}
                                        </Grid>
                                    </ListItem>
                                )
                            })
                        }
                    </List> : null
                }
            </Box>
        </div>
    );
}

export default Requests;