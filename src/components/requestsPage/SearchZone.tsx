import { FormControlLabel, Grid, InputLabel, NativeSelect, Switch } from "@mui/material";
import { LocalizationProvider, DateTimePicker } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { t } from "i18next";
import { useState } from "react";
import { NavLink } from "react-router-dom";
import { inputLabelStyles, BootstrapInput, datetimeStyles } from "../../utils/misc/styles";
import AutocompleteSearch from "../shared/AutocompleteSearch";

function SearchZone(props: any) {
    const [isAdvanced, setIsAdvanced] = useState<boolean>(false); // State to manage search mode
    const {
        departure, arrival, setDeparture, setArrival, packingType, handleChangePackingType, status, handleChangeStatus, 
        updatedDateEnd, setUpdatedDateEnd, createdDateEnd, setCreatedDateEnd, createdDateStart, setCreatedDateStart, updatedDateStart, setUpdatedDateStart
    } = props;

    return (
        <>
            <Grid item xs={12}>
                <FormControlLabel
                    control={<Switch checked={isAdvanced} onChange={() => setIsAdvanced(!isAdvanced)} />}
                    label={isAdvanced ? t('advancedSearch') : t('simpleSearch')}
                />
            </Grid>
            <Grid item xs={12} md={3}>
                <InputLabel htmlFor="departure" sx={inputLabelStyles}>{t('departure')}</InputLabel>
                <AutocompleteSearch id="departure" value={departure} onChange={setDeparture} fullWidth />
            </Grid>
            <Grid item xs={12} md={3}>
                <InputLabel htmlFor="arrival" sx={inputLabelStyles}>{t('arrival')}</InputLabel>
                <AutocompleteSearch id="arrival" value={arrival} onChange={setArrival} fullWidth />
            </Grid>
            
            {isAdvanced && (
                <>
                    <Grid item xs={12} md={3}>
                        <InputLabel htmlFor="packing-type" sx={inputLabelStyles}>{t('packingType')}</InputLabel>
                        <NativeSelect
                            id="packing-type"
                            value={packingType}
                            onChange={handleChangePackingType}
                            input={<BootstrapInput />}
                            fullWidth
                        >
                            <option value="">{t('allTypes')}</option>
                            <option value="FCL">{t('fcl')}</option>
                            <option value="Breakbulk/LCL">{t('breakbulk')}</option>
                            <option value="Unit RoRo">{t('roro')}</option>
                        </NativeSelect>
                    </Grid>
                    <Grid item xs={12} md={3}>
                        <InputLabel htmlFor="status-id" sx={inputLabelStyles}>{t('status')}</InputLabel>
                        <NativeSelect
                            id="status-id"
                            value={status}
                            onChange={handleChangeStatus}
                            input={<BootstrapInput />}
                            fullWidth
                        >
                            <option value="">{t('allStatus')}</option>
                            <option value="New">{t('labelEnAttente')}</option>
                            <option value="Valider">{t('labelValider')}</option>
                            <option value="Rejeter">{t('labelRejeter')}</option>
                        </NativeSelect>
                    </Grid>
                    <Grid item xs={12} md={3} mt={1}>
                        <InputLabel htmlFor="created-date-start" sx={inputLabelStyles}>{t('createdDateStart')}</InputLabel>
                        <LocalizationProvider dateAdapter={AdapterDayjs}>
                            <DateTimePicker 
                                value={createdDateStart} 
                                onChange={(value: any) => { setCreatedDateStart(value) }}
                                slotProps={{ textField: { id: "created-date-start", fullWidth: true, sx: datetimeStyles }, inputAdornment: { sx: { position: "relative", right: "11.5px" } } }}
                            />
                        </LocalizationProvider>
                    </Grid>
                    <Grid item xs={12} md={3} mt={1}>
                        <InputLabel htmlFor="created-date-end" sx={inputLabelStyles}>{t('createdDateEnd')}</InputLabel>
                        <LocalizationProvider dateAdapter={AdapterDayjs}>
                            <DateTimePicker 
                                value={createdDateEnd} 
                                onChange={(value: any) => { setCreatedDateEnd(value) }}
                                slotProps={{ textField: { id: "created-date-end", fullWidth: true, sx: datetimeStyles }, inputAdornment: { sx: { position: "relative", right: "11.5px" } } }}
                            />
                        </LocalizationProvider>
                    </Grid>
                    <Grid item xs={12} md={3} mt={1}>
                        <InputLabel htmlFor="updated-date-start" sx={inputLabelStyles}>{t('updatedDateStart')}</InputLabel>
                        <LocalizationProvider dateAdapter={AdapterDayjs}>
                            <DateTimePicker 
                                value={updatedDateStart} 
                                onChange={(value: any) => { setUpdatedDateStart(value) }} 
                                slotProps={{ textField: { id: "updated-date-start", fullWidth: true, sx: datetimeStyles }, inputAdornment: { sx: { position: "relative", right: "11.5px" } } }}
                            />
                        </LocalizationProvider>
                    </Grid>
                    <Grid item xs={12} md={3} mt={1}>
                        <InputLabel htmlFor="updated-date-end" sx={inputLabelStyles}>{t('updatedDateEnd')}</InputLabel>
                        <LocalizationProvider dateAdapter={AdapterDayjs}>
                            <DateTimePicker 
                                value={updatedDateEnd} 
                                onChange={(value: any) => { setUpdatedDateEnd(value) }} 
                                slotProps={{ textField: { id: "updated-date-end", fullWidth: true, sx: datetimeStyles }, inputAdornment: { sx: { position: "relative", right: "11.5px" } } }}
                            />
                        </LocalizationProvider>
                    </Grid>
                </>
            )}
        </>
    );
}

export default SearchZone;
