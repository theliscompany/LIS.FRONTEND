import Autocomplete, { AutocompleteRenderInputParams } from "@mui/material/Autocomplete";
import CircularProgress from "@mui/material/CircularProgress";
import TextField from "@mui/material/TextField";
import { useState } from "react";

type AutocompleteUIProps<T> = {
    loading: boolean,
    label: string,
    data: T[],
    valueSelected : (value: T | null) => void,
    getOptionLabel?: (option: T) => string
}

const AutocompleteUI = <T,>({loading, data, label, valueSelected, getOptionLabel}:AutocompleteUIProps<T>) => {
    const [open, setOpen] = useState(false)
    const [valueLocal, setValueLocal] = useState<T | null>(null)

    const handleValueSelected = (_:any, value: T | null) => {
        setValueLocal(value)
        valueSelected(value)
    }
    
    return (
        <Autocomplete loading={loading} size='small' id="tags-standard" options={data} getOptionLabel={getOptionLabel}
            open={open} onOpen={() => { setOpen(true); }} onClose={() => { setOpen(false); }} value={valueLocal}
            renderOption={(props,option)=>(
                <li {...props} key={props.id}>
                    {getOptionLabel ? getOptionLabel(option) : ""}
                </li>
            )}
            onChange={handleValueSelected} fullWidth
            renderInput={(params: AutocompleteRenderInputParams) => ( <TextField {...params} label={label} slotProps={{
                input:{
                    ...params.InputProps,
                    endAdornment:(
                        <>
                            {
                                loading ? <CircularProgress color="inherit" size={20} /> : null
                            }
                            {params.InputProps.endAdornment}
                        </>
                    )
                }}} /> 
            )} 
        />
    )
}

export default AutocompleteUI