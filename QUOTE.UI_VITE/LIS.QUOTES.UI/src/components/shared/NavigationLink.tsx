import * as React from 'react';
import { ListItem, ListItemButton, ListItemIcon, ListItemText } from '@mui/material';
import { NavLink } from 'react-router-dom';
import { DarkTooltip } from '../../utils/misc/styles';

interface NavigationLinkProps {
    url: string;
    title: string;
    icon: any,
    nested?: boolean
}

const NavigationLink: React.FC<NavigationLinkProps> = ({url, title, icon, nested}) => {
    return (
        <NavLink to={url} className={({ isActive }) => isActive ? "cs-navlink-active" : "cs-navlink"}>
            <ListItem className="cs-listitem" key={title} disablePadding disableGutters sx={nested ? {pl: 2} : null}>
            <DarkTooltip title={title} placement="right" arrow>
                <ListItemButton className="cs-listitembutton">
                    <ListItemIcon className="cs-listitemicon">
                        {icon}
                    </ListItemIcon>
                    <ListItemText primary={title} slotProps={{ primary: { fontSize: 13 }}} />
                </ListItemButton>
            </DarkTooltip>
            </ListItem>
        </NavLink>
    );
}

export default NavigationLink;