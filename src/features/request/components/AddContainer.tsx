import { Button, DialogActions, DialogContent, InputLabel, NativeSelect, Skeleton } from "@mui/material";
import Grid from '@mui/material/Grid2';
import { enqueueSnackbar } from "notistack";
import { useTranslation } from "react-i18next";
import { inputLabelStyles, BootstrapInput, whiteButtonStyles, BootstrapDialogTitle, buttonCloseStyles } from '@utils/misc/styles';

const AddContainer = (props: any) => {
    const { t } = useTranslation();
    
    return (
        <>
            <BootstrapDialogTitle id="custom-dialog-title" onClose={() => props.closeModal()}>
                <b>{t('addContainer')}</b>
            </BootstrapDialogTitle>
            <DialogContent dividers>
                <Grid container spacing={2}>
                    <Grid size={{ xs: 12, md: 2 }} mt={1}>
                        <InputLabel htmlFor="packing-type" sx={inputLabelStyles}>{t('packingType')}</InputLabel>
                        <NativeSelect
                            id="packing-type"
                            value={props.packingType}
                            onChange={(e: any) => { props.setPackingType(e.target.value); }}
                            input={<BootstrapInput />}
                            fullWidth
                        >
                            <option value="FCL">{t('fcl')}</option>
                            {/* <option value="Breakbulk/LCL">{t('breakbulk')}</option>
                            <option value="Unit RoRo">{t('roro')}</option> */}
                        </NativeSelect>
                    </Grid>

                    {
                        props.packingType === "FCL" ?
                        <>
                        <Grid size={{ xs: 12, md: 3 }} mt={1}>
                            <InputLabel htmlFor="container-type" sx={inputLabelStyles}>{t('containerType')}</InputLabel>
                            {
                                props.containers !== null ?
                                <NativeSelect
                                    id="container-type"
                                    value={props.containerType}
                                    onChange={(e: any) => { props.setContainerType(e.target.value) }}
                                    input={<BootstrapInput />}
                                    fullWidth
                                >
                                    <option key={"elm1-x"} value="">{t('notDefined')}</option>
                                    {props.containers.map((elm: any, i: number) => (
                                        <option key={"elm1-"+i} value={elm.packageName}>{elm.packageName}</option>
                                    ))}
                                </NativeSelect>
                                : <Skeleton />
                            }
                        </Grid>
                        <Grid size={{ xs: 12, md: 3 }} mt={1}>
                            <InputLabel htmlFor="quantity" sx={inputLabelStyles}>{t('quantity')}</InputLabel>
                            <BootstrapInput id="quantity" type="number" inputProps={{ min: 1, max: 100 }} value={props.quantity} onChange={(e: any) => {props.setQuantity(e.target.value)}} fullWidth />
                        </Grid>
                        <Grid size={{ xs: 12, md: 4 }} mt={1}>
                            <Button 
                                variant="contained" color="inherit" fullWidth sx={whiteButtonStyles} 
                                style={{ marginTop: "30px", height: "42px", float: "right" }} 
                                onClick={() => {
                                    if (props.containerType !== "" && props.quantity > 0) {
                                        props.setContainersSelection((prevItems: any) => [...prevItems, { container: props.containerType, quantity: props.quantity, id: props.containers.find((item: any) => item.packageName === props.containerType).packageId }]);
                                        props.setContainerType(""); props.setQuantity(1);
                                        props.closeModal();
                                    } 
                                    else {
                                        enqueueSnackbar("You need to select a container type and a good value for quantity.", { variant: "error", anchorOrigin: { horizontal: "right", vertical: "top"} });
                                    }
                                }} 
                            >
                                {t('addContainer')}
                            </Button>
                        </Grid>
                        </> : null
                    }
                </Grid>
            </DialogContent>
            <DialogActions>
                <Button variant="contained" onClick={() => props.closeModal()} sx={buttonCloseStyles}>{t('close')}</Button>
            </DialogActions>
        </>
    );
}

export default AddContainer;