import { Grid, IconButton, InputLabel, Popover, Typography } from "@mui/material";
import React from "react";
import { inputLabelStyles, BootstrapInput } from "../../utils/misc/styles";
import { useTranslation } from "react-i18next";
import { Info } from "@mui/icons-material";

function ContainerElement(props: any) {
    const [anchorEl, setAnchorEl] = React.useState(null);
    const openPop = Boolean(anchorEl);
    const idPop = openPop ? 'simple-popover' : undefined;
  
    const { t } = useTranslation();
    
    return (
        <Grid container spacing={2} sx={{ my: 1 }}>
            <Grid item xs={6}>
                <InputLabel htmlFor="margin" sx={inputLabelStyles}>{t('margin')} %</InputLabel>
                <BootstrapInput 
                    id="margin" type="number" fullWidth 
                    inputProps={{ min: 0, max: 100 }} 
                    value={props.margin} 
                    onChange={(e: any) => {
                        if (props.adding !== 0) {
                            props.handleAddingChange(props.index, 0);
                        }
                        props.handleMarginChange(props.index, e.target.value);
                    }} 
                />
            </Grid>
            <Grid item xs={6}>
                <InputLabel htmlFor="adding" sx={inputLabelStyles}>{t('lumpSum')}</InputLabel>
                <BootstrapInput 
                    id="adding" type="number" fullWidth 
                    inputProps={{ min: 0 }} 
                    value={props.adding}
                    onChange={(e: any) => {
                        if (props.margin !== 0) {
                            props.handleMarginChange(props.index, 0);
                        }
                        props.handleAddingChange(props.index, e.target.value);
                    }} 
                />
            </Grid>
            <Grid item xs={12}>
                <Typography sx={{ fontSize: 14 }}>
                    <span>Container {props.elm.quantity+"x"+props.elm.container}</span>
                    <span> | Purchase price : {props.purchasePrice} <IconButton size="small" title="Show details" sx={{ position: "relative", bottom: "1px" }} onClick={(event: any) => { setAnchorEl(event.currentTarget); }}><Info fontSize="small" /></IconButton></span>
                    <span> | Profit : {props.profit}</span>
                    <span> | Sale price : {props.salePrice}</span>
                </Typography>
            </Grid>
            <Popover
                id={idPop}
                open={openPop}
                anchorEl={anchorEl}
                onClose={() => {
                    setAnchorEl(null);
                }}
                anchorOrigin={{
                    vertical: 'top',
                    horizontal: 'right',
                }}
            >
                <Typography sx={{ p: 2, fontSize: 13 }}>
                    Haulage : {props.haulagePrice} <br />
                    Seafreight : {props.seafreightPrice !== "N/A" ? <><br /> {props.seafreightPrice}</> : props.seafreightPrice}
                </Typography>
            </Popover>
        </Grid>
    );
}

export default ContainerElement;