import Autocomplete, { AutocompleteRenderInputParams } from "@mui/material/Autocomplete";
import CircularProgress from "@mui/material/CircularProgress";
import TextField from "@mui/material/TextField";
import { useState } from "react";

type AutocompleteUIProps<T, TFieldValues> = {
    loading: boolean,
    label: string,
    data: T[],
    error?: boolean,
    errorMessage?: string,
    fieldHookForm?: TFieldValues,
    value?: T,
    valueSelected : (value: T | null) => void,
    getOptionLabel?: (option: T) => string
}

const AutocompleteUI = <T,TFieldValues>({loading, data, label,value, error,errorMessage,fieldHookForm, valueSelected, getOptionLabel}:AutocompleteUIProps<T, TFieldValues>) => {
    const [open, setOpen] = useState(false)
    //const [valueLocal, setValueLocal] = useState<T | null>(value ?? null)

    const handleValueSelected = (_:any, value: T | null) => {
        //setValueLocal(value)
        valueSelected(value)
    }
    
    return (
        <Autocomplete {...fieldHookForm} loading={loading} size='small' id="tags-standard" options={data} getOptionLabel={getOptionLabel}
            open={open} onOpen={() => { setOpen(true); }} onClose={() => { setOpen(false); }} value={value} 
            renderOption={(props,option)=>(
                <li {...props} key={props.id}>
                    {getOptionLabel ? getOptionLabel(option as T) : ""}
                </li>
            )}
            onChange={handleValueSelected} fullWidth
            renderInput={(params: AutocompleteRenderInputParams) => ( 
                <TextField {...params} label={label} error={!!error}  helperText={errorMessage}
                    slotProps={{
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