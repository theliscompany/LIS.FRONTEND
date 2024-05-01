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
            <Grid item xs={4}>
                <InputLabel htmlFor={"margin-"+props.index} sx={inputLabelStyles}>{t('margin')} %</InputLabel>
                <BootstrapInput 
                    id={"margin-"+props.index} 
                    type="number" fullWidth 
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
            <Grid item xs={4}>
                <InputLabel htmlFor={"adding-"+props.index} sx={inputLabelStyles}>{t('lumpSum')}</InputLabel>
                <BootstrapInput 
                    id={"adding-"+props.index} 
                    type="number" fullWidth 
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
                    <span>{props.elm.quantity+"x"+props.elm.container}</span>
                    <span> | {t('purchasePrice')} : {props.purchasePrice} <IconButton size="small" title="Show details" sx={{ position: "relative", bottom: "1px" }} onClick={(event: any) => { setAnchorEl(event.currentTarget); }}><Info fontSize="small" /></IconButton></span>
                    <span> | {t('profit')} : {props.profit}</span>
                    <span> | {t('salePrice')} : {props.salePrice}</span>
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
                    {t('haulage')} : {props.haulagePrice} <br />
                    {t('seafreight')} : {props.seafreightPrice !== "N/A" ? <><br /> {props.seafreightPrice}</> : props.seafreightPrice}<br />
                    {t('miscellaneous')} : {props.miscellaneousPrice !== "N/A" ? <><br /> {props.miscellaneousPrice}</> : props.miscellaneousPrice}
                </Typography>
            </Popover>
        </Grid>
    );
}

export default ContainerElement;