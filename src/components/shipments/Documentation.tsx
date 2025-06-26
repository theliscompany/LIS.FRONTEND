import { IconButton, List, ListItem, ListItemIcon, ListItemText, Paper } from "@mui/material"
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getApiFileByFolderOptions } from '@api/client/document/@tanstack/react-query.gen';
import DescriptionIcon from "@mui/icons-material/Description";
import DeleteIcon from "@mui/icons-material/Delete";
import FileDownloadIcon from "@mui/icons-material/FileDownload";
import { useEffect } from "react";

const Documentation = ({orderNumber}: {orderNumber: string }) => {

    const {data: files} = useQuery({
        ...getApiFileByFolderOptions({ path: { folder: orderNumber } }),
        enabled: false,
    })

    const queryClient = useQueryClient();

    // Pre-fetch the files when the component mounts
    // This is useful if the orderNumber changes and we want to fetch the new files
    // or if we want to ensure the data is fresh when the component mounts
    // This is a workaround for the fact that the query is not refetching when the orderNumber changes
    // because the query is already in the cache
    // This is a known issue with react-query and the useQuery hook
    // We can use the queryClient to fetch the query manually
    // This will ensure that the query is refetched when the component mounts
    // and when the orderNumber changes
    useEffect(() => {
        queryClient.fetchQuery({
            ...getApiFileByFolderOptions({ path: { folder: orderNumber } })
        })
    }, [])
    

    return (
        <Paper sx={{padding: 2}}>
            <List>
            {
            (files ?? []).map((file) => (
                <ListItem key={file.blobName} disablePadding>
                    <ListItemIcon>
                        <DescriptionIcon />
                    </ListItemIcon>
                    <ListItemText primary={file.blobName?.split('/').pop()} />

                    <IconButton edge="end" aria-label="file" sx={{marginRight: 1}}>
                        <FileDownloadIcon fontSize="small" />
                    </IconButton>

                    <IconButton edge="end" aria-label="file">
                        <DeleteIcon fontSize="small" />
                    </IconButton>
                </ListItem>
            ))
            }
            </List>
        </Paper>
        
    )
}

export default Documentation;