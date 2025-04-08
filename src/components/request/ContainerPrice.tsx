import { Info } from "@mui/icons-material";
import { IconButton, Popover, Typography } from "@mui/material";
import React from "react";

const ContainerPrice = (props: any) => {
    const [anchorEl, setAnchorEl] = React.useState(null);
    const openPop = Boolean(anchorEl);
    const idPop = openPop ? 'simple-popover' : undefined;
  
    return (
        <>
            <span>
                {props.price} 
                <IconButton 
                    size="small" 
                    sx={{ position: "relative", bottom: "1px" }}
                    aria-owns={openPop ? idPop : undefined}
                    aria-haspopup="true"
                    onMouseEnter={(event: any) => { setAnchorEl(event.currentTarget); }}
                    onMouseLeave={() => { setAnchorEl(null); }} 
                >
                    <Info fontSize="small" />
                </IconButton>
            </span>
            <Popover
                id={idPop}
                open={openPop}
                anchorEl={anchorEl}
                sx={{ pointerEvents: 'none' }}
                anchorOrigin={{
                    vertical: 'top',
                    horizontal: 'right',
                }}
                onClose={() => { setAnchorEl(null); }}
                disableRestoreFocus
            >
                <Typography sx={{ p: 2, fontSize: 13 }}>
                    {props.seafreightPrice}
                </Typography>
            </Popover>
        </>
    );
}

export default ContainerPrice;