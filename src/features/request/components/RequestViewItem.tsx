import { Chip, ListItem, ListItemText, Skeleton, Typography } from "@mui/material";
import Grid from "@mui/material/Grid2";
import { NavLink } from "react-router-dom";
import PlaceIcon from '@mui/icons-material/Place';
import { useTranslation } from 'react-i18next';
import { colorsTypes } from '@utils/functions';
import { statusTypes } from '@utils/constants';

const RequestViewItem = (props: any) => {
    const { t } = useTranslation();
    // Find the status type by type
    const statusType = statusTypes.find((elm) => elm.type === props.item.status);
    // Translate the label
    const label = statusType ? t(statusType.label) : 'Unknown Status';

    function dateTimeDiff(date_time: string) {
        const now = new Date();
        const datetime = new Date(date_time);
        const diff = now.getTime() - datetime.getTime();
    
        const diffInMinutes = Math.floor(diff / (1000 * 60));
        const diffInHours = Math.floor(diff / (1000 * 60 * 60));
        const diffInDays = Math.floor(diff / (1000 * 60 * 60 * 24));
        
        const diffInMonths = now.getMonth() - datetime.getMonth() + (12 * (now.getFullYear() - datetime.getFullYear()));
        const diffInYears = now.getFullYear() - datetime.getFullYear();
    
        if (diffInDays === 0) {
            if (diffInHours === 0) {
                return diffInMinutes === 0 ? t('justNow') : diffInMinutes + " " + t('minutesAgo');
            } else {
                return diffInHours + " " + t('hoursAgo');
            }
        } else if (diffInDays === 1) {
            return t('yesterday');
        } else if (diffInDays < 30) {
            return diffInDays + " " + t('daysAgo');
        } else if (diffInMonths < 12) {
            return diffInMonths === 1 ? t('lastMonth') : diffInMonths + " " + t('monthsAgo');
        } else {
            return diffInYears === 1 ? t('lastYear') : diffInYears + " " + t('yearsAgo');
        }
    }
    
    return (
        <ListItem
            key={"request-"+props.i}
            component={NavLink}
            to={"/request/" + props.item.id}
            sx={{ 
                '&:hover': { backgroundColor: "#fbfbfb" },
                borderTop: "1px solid #e6e6e6", 
                px: { xs: 5, md: 5 }, pt: 1.25, pb: 2 
            }}
        >
            <Grid container sx={{ maxWidth: "600px", color: "#333" }}>
                <Grid size={{ xs: 12 }}>
                    <ListItemText
                        primary={<Typography variant="subtitle1" color="#333"><b>{props.item.email !== "emailexample@gmail.com" ? "#" + props.item.id + " "+ t('newQuoteRequest') + t('fromDotted') + props.item.email : "#" + props.item.id + " " + t('newQuoteRequest')}</b></Typography>}
                    />        
                </Grid>
                {
                    statusTypes !== undefined && statusTypes !== null && statusTypes.length !== 0 ? 
                    <Grid size={{ xs: 12 }}>
                        {dateTimeDiff(props.item.createdAt)} <Chip size="small" label={label} color={colorsTypes(props.item.status)} sx={{ ml: 1 }} />
                    </Grid> : <Skeleton />
                }
                <Grid size={{ xs: 12, md: 6 }} mt={1}>
                    <Typography variant="subtitle1" display="flex" alignItems="center" justifyContent="left" fontSize={15}>{t('departure')}</Typography>
                    <Typography variant="subtitle2" display="flex" alignItems="center" justifyContent="left" fontSize={14}>
                        <PlaceIcon sx={{ position: "relative", right: "4px" }} /> <span>{[props.item.departure.split(', ').slice(0,1),props.item.departure.split(', ').slice(4,5)||"",props.item.departure.split(', ').slice(1,2)].filter((val) => { return val.length !== 0 }).join(', ')}</span>
                    </Typography>
                </Grid>
                <Grid size={{ xs: 12, md: 6 }} mt={1}>
                    <Typography variant="subtitle1" display="flex" alignItems="center" justifyContent="left" fontSize={15}>{t('arrival')}</Typography>
                    <Typography variant="subtitle2" display="flex" alignItems="center" justifyContent="left" fontSize={14}>
                        <PlaceIcon sx={{ position: "relative", right: "4px" }} /> <span>{[props.item.arrival.split(', ').slice(0,1),props.item.arrival.split(', ').slice(4,5)||"",props.item.arrival.split(', ').slice(1,2)].filter((val) => { return val.length !== 0 }).join(', ')}</span>
                    </Typography>
                </Grid>
            </Grid>
        </ListItem>
    );
}

export default RequestViewItem;
