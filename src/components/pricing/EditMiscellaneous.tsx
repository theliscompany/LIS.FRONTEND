
import { Cancel } from "@mui/icons-material";
import Save from "@mui/icons-material/Save";
import Autocomplete from "@mui/material/Autocomplete";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import Grid from "@mui/material/Grid2";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Controller, ControllerRenderProps, useForm } from "react-hook-form";
import { getContactGetContactsOptions } from "../../api/client/crm/@tanstack/react-query.gen";
import { ContactViewModel } from "../../api/client/crm";
import { ChangeEvent, useCallback, useState } from "react";
import { MiscellaneousViewModel } from "../../api/client/pricing";
import TextField from "@mui/material/TextField";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import Select, { SelectChangeEvent } from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import { currencyOptions } from "../../utils/constants";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import dayjs from "dayjs";
import FormGroup from "@mui/material/FormGroup";
import FormControlLabel from "@mui/material/FormControlLabel";
import Checkbox from "@mui/material/Checkbox";
import { PortViewModel, ServiceViewModel } from "../../api/client/masterdata";
import { getPortOptions } from "../../api/client/masterdata/@tanstack/react-query.gen";
import ServicesMiscellaneous from "./ServicesMiscellaneous";
import { getApiMiscellaneousMiscellaneousQueryKey, postApiMiscellaneousMiscellaneousMutation } from "../../api/client/pricing/@tanstack/react-query.gen";
import { showSnackbar } from "../common/Snackbar";

type EditMiscellaneousProps = {
    miscellaneousId?: string;
    open:boolean;
    onClose: () => void
}

const EditMiscellaneous = ({open, onClose}:EditMiscellaneousProps) => {

    const [contact, setContact] = useState<ContactViewModel | null>()
    const [departurePort, setDeparturePort] = useState<PortViewModel | null>()
    const [destinationPort, setDestinationPort] = useState<PortViewModel | null>()

    const queryClient = useQueryClient();

    const {data: contacts, isLoading:isLoadingContacts} = useQuery({
        ...getContactGetContactsOptions(),
        staleTime: Infinity
    })

    const {data: ports, isLoading: isLoadingPorts} = useQuery({
        ...getPortOptions()
    })

    const { control, handleSubmit,register, formState: { errors, isSubmitting }, setValue, getValues, watch, reset } = useForm<MiscellaneousViewModel>({
        defaultValues: {
            validUntil: new Date(Date.now())
        }
    });

    const servicesMiscellaneous = useCallback(
        (field: ControllerRenderProps<MiscellaneousViewModel, "services">) => {
        return <ServicesMiscellaneous data={field.value ?? []} currency={watch('currency') ?? currencyOptions[0].code}
                                        getServicesAdded={(newServices: ServiceViewModel[]) => field.onChange(newServices)} />
        },
        [watch('currency')],
    )

    const mutationPost = useMutation({
        ...postApiMiscellaneousMiscellaneousMutation(),
        onSuccess:() => {
            showSnackbar("Saved with success", "success");

            // If the seafreight was created, we need to invalidate the query to refresh the list
            queryClient.invalidateQueries({ queryKey: getApiMiscellaneousMiscellaneousQueryKey() });

            const _currency = getValues('currency') ?? currencyOptions[0].code 
            // Reset form values and initial currency  
            reset({
                currency: _currency,
            })
            setValue('services', [])

            // Reset state values
            setDeparturePort(undefined)
            setDestinationPort(undefined)
            setContact(undefined)
            
        },
        onError: () => showSnackbar("An error occurred", "warning")
    })

    const onSubmit = async (data: MiscellaneousViewModel) => {
        await mutationPost.mutateAsync({body: data});
    }

    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth='lg'>
            <DialogTitle>Edit miscellaneous</DialogTitle>
            <form onSubmit={handleSubmit(onSubmit)}>
                <DialogContent dividers>
                    <Grid container spacing={2}>
                        <Grid size={6}>
                            <Grid container spacing={2}>
                                <Grid size={12}>
                                    <Controller name='supplierId' control={control} rules={{required:"Select supplier"}} 
                                        render={({field}) =>  
                                            <Autocomplete {...field} fullWidth size='small' value={contact ?? null} options={contacts?.data ?? []} 
                                            getOptionLabel={(option) => option.contactName ?? ''} loading={isLoadingContacts}
                                            onChange={(_, value: ContactViewModel | null) => {
                                                field.onChange(value?.contactId);
                                                setValue('supplierName', value?.contactName);
                                                setContact(value);
                                            }}
                                            renderOption={(props,option)=>(
                                                <li {...props} key={props.id}>
                                                    {option.contactName ?? ''}
                                                </li>
                                            )}
                                            renderInput={(params) => (
                                                <TextField {...params} label="Supplier" 
                                                    error={!!errors.supplierId} 
                                                    helperText={errors.supplierId?.message} /> )} />

                                            } 
                                        />
                                </Grid>
                                <Grid size={6}>
                                    <Controller name="departurePortId" control={control}
                                        rules={{
                                            validate: (value) => {
                                                if (!value && getValues('destinationPortId')) {
                                                    return "You must select a departure port";
                                                }
                                                return true;
                                            }
                                        }} render={({field})=> 
                                            <Autocomplete {...field} fullWidth size='small' value={departurePort ?? null} options={ports ?? []} 
                                                getOptionLabel={(option) => option.portName ?? ''} loading={isLoadingPorts}
                                                onChange={(_, value: PortViewModel | null) => {
                                                    field.onChange(value?.portId);
                                                    setValue('departurePortName', value?.portName);
                                                    setDeparturePort(value);
                                                }}
                                                renderOption={(props,option)=>(
                                                    <li {...props} key={props.id}>
                                                        {option.portName ?? ''}
                                                    </li>
                                                )}
                                                renderInput={(params) => (
                                                    <TextField {...params} label="Departure port" 
                                                        error={!!errors.departurePortId} 
                                                        helperText={errors.departurePortId?.message} /> )} />
                                        } />
                                </Grid>
                                <Grid size={6}>
                                    <Controller name="destinationPortId" control={control}
                                        rules={{
                                            validate: (value) => {
                                                if (!value && getValues('departurePortId')) {
                                                    return "You must select a destination port";
                                                }
                                                return true;
                                            }
                                        }} render={({field})=> 
                                            <Autocomplete {...field} fullWidth size='small' value={destinationPort ?? null} options={ports ?? []} 
                                                getOptionLabel={(option) => option.portName ?? ''} loading={isLoadingPorts}
                                                onChange={(_, value: PortViewModel | null) => {
                                                    field.onChange(value?.portId);
                                                    setValue('destinationPortName', value?.portName);
                                                    setDestinationPort(value);
                                                }}
                                                renderOption={(props,option)=>(
                                                    <li {...props} key={props.id}>
                                                        {option.portName ?? ''}
                                                    </li>
                                                )}
                                                renderInput={(params) => (
                                                    <TextField {...params} label="Destination port" 
                                                        error={!!errors.destinationPortId} 
                                                        helperText={errors.destinationPortId?.message} /> )} />
                                        } />
                                </Grid>
                                <Grid size={3}>
                                    <FormGroup row>
                                        <FormControlLabel control={<Checkbox checked={watch('container20') ?? false} size="small" {...register('container20')}
                                            onChange={(_,checked:boolean)=> setValue('container20', checked)} />} label="20'" />
                                        <FormControlLabel control={<Checkbox checked={watch('container40') ?? false} size="small" {...register('container40')} 
                                            onChange={(_,checked:boolean)=> setValue('container40', checked)} />} label="40'" />
                                    </FormGroup>
                                </Grid>
                                <Grid size={3}>
                                    <FormControl fullWidth size="small">
                                        <InputLabel>Currency</InputLabel>
                                        <Select {...register('currency')} value={getValues('currency') ?? currencyOptions[0].code} label='Currency'
                                            onChange={(e: SelectChangeEvent<string>)=>setValue('currency', e.target.value)}>
                                            {
                                                currencyOptions.map(item=>(
                                                    <MenuItem key={item.code} value={item.code}>{item.label}</MenuItem>
                                                ))
                                            }
                                        </Select> 
                                    </FormControl>
                                </Grid>
                                <Grid size={4}>
                                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                                        <DatePicker {...register('validUntil')} format="DD/MM/YYYY" value={dayjs(getValues('validUntil'))} disablePast
                                        onChange={(value: dayjs.Dayjs | null)=>setValue('validUntil', value?.toDate())}
                                        slotProps={{ textField: { id: "valid-until", size: "small", fullWidth: true }, inputAdornment: { sx: { position: "relative", right: "11.5px" } } }} />
                                    </LocalizationProvider> 
                                </Grid> 
                                <Grid size={12}>
                                    <TextField {...register('comment')} value={getValues('comment') ?? ''} multiline label="Comment or remarks" size='small' fullWidth rows={3} 
                                        onChange={(e?:ChangeEvent<HTMLInputElement | HTMLTextAreaElement>)=> setValue('comment',e?.target.value)}/>
                                </Grid>
                            </Grid>
                            
                        </Grid>
                        <Grid size={6}>
                            <Controller name='services' control={control} render={({field})=> 
                                servicesMiscellaneous(field)
                            } rules={{
                                validate: (value) => {
                                    if (!value || value.length === 0) {
                                        return "You must add at least one service";
                                    }
                                    return true;
                                }
                            }} />
                        </Grid>
                    </Grid>
                    
                </DialogContent>
                <DialogActions>
                    <Button variant='contained' color='success' size='small' type='submit' loading={isSubmitting} startIcon={<Save />}>Save</Button>
                    <Button onClick={onClose} variant='outlined' color='error' size='small' startIcon={<Cancel />}>Close</Button>
                </DialogActions>
            </form>
            
        </Dialog>
    )
}

export default EditMiscellaneous;