import Avatar from '@mui/material/Avatar';
import IconButton from '@mui/material/IconButton';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import ListItemText from '@mui/material/ListItemText';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import DeleteIcon from '@mui/icons-material/Delete';
import FolderIcon from '@mui/icons-material/Folder';
import VisibilityIcon from '@mui/icons-material/Visibility';
import React, { useEffect } from 'react';
import './App.css';

function Notifications() {
    const [notifications, setNotifications] = React.useState<any>(null);
    
    useEffect(() => {
        fetch("https://random-data-api.com/api/v2/addresses?size=12")
        .then((response) => response.json())
        .then((data) => {
            console.log(data);
            setNotifications(data);
        });
    }, []);
  
    return (
        <div style={{ background: "#fff", borderTopLeftRadius: 20, borderTopRightRadius: 20 }}>
            <Box py={4} sx={{  }}>
                <Typography variant="h5" mt={3} mx={3}><b>Notifications</b></Typography>
                
                {
                    notifications != null ? 
                    <List sx={{ mt: 3 }}>
                        {
                            notifications.map((item: any, i: number) => {
                                return (
                                    <ListItem
                                        component="a"
                                        href={"/request/" + item.id}
                                        sx={{ borderTop: "1px solid #e6e6e6" }}
                                        secondaryAction={
                                            <IconButton edge="end" aria-label="delete">
                                                {item.building_number > 10000 ? <img src="red_dot.png" style={{ width: "8px" }} /> : null}
                                            </IconButton>
                                        }
                                    >
                                        <ListItemAvatar>
                                            <Avatar>
                                                <FolderIcon />
                                            </Avatar>
                                        </ListItemAvatar>
                                        <ListItemText
                                            primary={<Typography variant="subtitle1" color="#333">{"New quote request #" + item.id + " from : " + item.country}</Typography>}
                                            secondary={"4 minutes ago"}
                                        />
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

export default Notifications;

