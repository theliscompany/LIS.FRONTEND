import { Autocomplete, Button, Dialog, DialogActions, DialogContent, DialogTitle, FormControl, InputLabel, MenuItem, Select, SelectChangeEvent, Stack, TextField } from "@mui/material"
import Grid from '@mui/material/Grid2'
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { getApiSeaFreightGetSeaFreightsQueryKey, getApiSeaFreightSeaFreightByIdOptions, postApiSeaFreightSeaFreightMutation } from "../../api/client/pricing/@tanstack/react-query.gen"
import { ChangeEvent, useCallback, useEffect, useState } from "react"
import { SeaFreightViewModel, ServiceSeaFreightViewModel } from "../../api/client/pricing"
import { getPortOptions } from "../../api/client/masterdata/@tanstack/react-query.gen"
import { PortViewModel } from "../../api/client/masterdata"
import { currencyOptions } from "../../utils/constants"
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers"
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs"
import dayjs from "dayjs"
import Save from "@mui/icons-material/Save"
import { Cancel, Loop } from "@mui/icons-material"
import { showSnackbar } from "../common/Snackbar"
import { ContactViewModel } from "../../api/client/crm"
import ServicesSeafreight from "./ServicesSeafreight"
import { Controller, ControllerRenderProps, SubmitHandler, useForm } from "react-hook-form"
import { getContactGetContactsOptions } from "../../api/client/crm/@tanstack/react-query.gen"


const EditSeafreight = ({seafreightId, open, onClose}:{seafreightId?: string, open: boolean, onClose: () => void}) => {
    
    const [carrier, setCarrier] = useState<ContactViewModel>()
    const [carrierAgent, setCarrierAgent] = useState<ContactViewModel>()
    const [departurePort, setDeparturePort] = useState<PortViewModel>()
    const [destinationPort, setDestinationPort] = useState<PortViewModel>()
    const [isLoading, setIsLoading] = useState(!!seafreightId)

    const queryClient = useQueryClient()

    const {data: ports, isLoading: isLoadingPorts} = useQuery({
        ...getPortOptions(),
        staleTime: Infinity
    })

    const {data: contacts, isLoading:isLoadingContacts} = useQuery({
        ...getContactGetContactsOptions(),
        staleTime: Infinity
    })

    const {handleSubmit, control, formState:{errors, isSubmitting}, watch, reset, setValue, getValues} = useForm<SeaFreightViewModel>({
        defaultValues: {
            currency: currencyOptions[0].code,
        }
    })

    useEffect(() => {
      getSeafreight()
    }, [])

    useEffect(() => {
      if(getValues('seaFreightId') && !carrier && !carrierAgent && contacts){
        const _carrier = contacts?.data?.find(c => c.contactId === getValues('carrierId'))
        const _carrierAgent = contacts?.data?.find(c => c.contactId === getValues('carrierAgentId'))
        setCarrier(_carrier)
        setCarrierAgent(_carrierAgent)
      }

      if(getValues('departurePortId') && !departurePort && !destinationPort && ports){
        const _departurePort = ports?.find(p => p.portId === getValues('departurePortId'))
        const _destinationPort = ports?.find(p => p.portId === getValues('destinationPortId'))
        setDestinationPort(_destinationPort)
        setDeparturePort(_departurePort)
      }

    }, [getValues('seaFreightId'), contacts, ports])
    

    const getSeafreight = async (id?: string) => {
        if(!id) return;

        const data = await queryClient.fetchQuery({
            ...getApiSeaFreightSeaFreightByIdOptions({
                path: {
                    id: id
                }
            })
        })

        reset(data)

        setIsLoading(false)
    }

    const mutation = useMutation({
        ...postApiSeaFreightSeaFreightMutation(),
        onSuccess:() => {
            showSnackbar("Saved with success", "success");

            // If the seafreight was created, we need to invalidate the query to refresh the list
            queryClient.invalidateQueries({ queryKey: getApiSeaFreightGetSeaFreightsQueryKey() });

            const _currency = getValues('currency') ?? currencyOptions[0].code 
            // Reset form values and initial currency  
            reset({
                currency: _currency,
            })
            setValue('services', [])

            // Reset state values
            setCarrier(undefined)
            setCarrierAgent(undefined)
            setDeparturePort(undefined)
            setDestinationPort(undefined)
            
        },
        onError: () => showSnackbar("An error occurred", "warning")
    })

    const onSubmit:SubmitHandler<SeaFreightViewModel> = async (data) => {
        await mutation.mutateAsync({
            body: data
        })
    }


    const servicesSeafreight = useCallback(
      (field: ControllerRenderProps<SeaFreightViewModel, "services">) => {
        return <ServicesSeafreight data={field.value ?? []} currency={watch('currency') ?? currencyOptions[0].code}
                    getServicesAdded={(newServices: ServiceSeaFreightViewModel[]) => field.onChange(newServices)} />
      },
      [watch('currency')],
    )
    

    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth='lg'>
            <DialogTitle>Edit seafreight</DialogTitle>
            <form onSubmit={handleSubmit(onSubmit)}>
                <DialogContent dividers>
                    {
                        isLoading ? 
                        <Stack direction='row' spacing={2} >
                            <Loop />
                        </Stack> : 
                        <Grid container spacing={2}>
                        
                            <Grid size={4}>
                                <Controller name='carrierId' control={control} rules={{required:"Select carrier"}} 
                                    render={({field}) =>  
                                        <Autocomplete {...field} fullWidth size='small' value={carrier ?? null} options={contacts?.data ?? []} 
                                            getOptionLabel={(option) => option.contactName ?? ''} loading={isLoadingContacts}
                                            onChange={(_, value: ContactViewModel | null) => {
                                                field.onChange(value?.contactId);
                                                setValue('carrierName', value?.contactName)
                                                setCarrier(value ?? undefined)
                                            }}
                                            renderOption={(props,option)=>(
                                                <li {...props} key={props.id}>
                                                    {option.contactName ?? ''}
                                                </li>
                                            )}
                                            renderInput={(params) => (
                                                <TextField {...params} label="Carrier" 
                                                    error={!!errors.carrierId} 
                                                    helperText={errors.carrierId?.message} /> )} />
                                        } 
                                />
                            </Grid>
                            <Grid size={4}>
                                <Controller name='carrierAgentId' control={control} rules={{required:"Select carrier agent"}} 
                                    render={({field}) => 
                                        <Autocomplete {...field} fullWidth size='small' value={carrierAgent ?? null} options={contacts?.data ?? []} 
                                            getOptionLabel={(option) => option.contactName ?? ''} loading={isLoadingContacts}
                                            onChange={(_, value: ContactViewModel | null) => {
                                                field.onChange(value?.contactId);
                                                setValue('carrierAgentName', value?.contactName)
                                                setCarrierAgent(value ?? undefined)
                                            }}
                                            renderOption={(props,option)=>(
                                                <li {...props} key={props.id}>
                                                    {option.contactName ?? ''}
                                                </li>
                                            )}
                                            renderInput={(params) => (
                                                <TextField {...params} label="Carrier agent" 
                                                    error={!!errors.carrierAgentId} 
                                                    helperText={errors.carrierAgentId?.message} /> )} />
                                    }   
                                />
                            </Grid>
                            <Grid size={2}>
                                <Controller name="transitTime" control={control} rules={{required: "Transit time is required", min: {value: 0, message: "Transit time must be at least 0 day"}}} 
                                    render={({field}) => 
                                        <TextField  error={!!errors.transitTime} helperText={errors.transitTime?.message}
                                        onChange={(e?:ChangeEvent<HTMLInputElement | HTMLTextAreaElement>)=> field.onChange(e ? Number(e.target.value) : undefined)} 
                                        label="Transit time (in days)" size='small' value={field.value ?? 0} fullWidth type='number' />} 
                                />
                            </Grid>
                            <Grid size={2}>
                                <Controller name="frequency" control={control} rules={{required: "Frequency is required", min: {value: 0, message: "Frequency must be at least 0 day"}}} 
                                    render={({field}) => 
                                        <TextField  error={!!errors.frequency} helperText={errors.frequency?.message}
                                        onChange={(e?:ChangeEvent<HTMLInputElement | HTMLTextAreaElement>)=> field.onChange(e ? Number(e.target.value) : undefined)} 
                                        label="Frequency (every x days)" size='small' value={field.value ?? 0} fullWidth type='number' />} 
                                />
                            </Grid>
                            <Grid size={4}>
                                <Controller name='departurePortId' control={control} rules={{required:"Select departure port"}} 
                                    render={({field})=>
                                        <Autocomplete {...field} fullWidth size='small' value={departurePort ?? null} options={ports ?? []} 
                                            getOptionLabel={(option) => option.portName ?? ''} loading={isLoadingPorts}
                                            onChange={(_, value: PortViewModel | null) => {
                                                field.onChange(value?.portId);
                                                setValue('departurePortName', value?.portName)
                                                setDeparturePort(value ?? undefined)
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
                                    }
                                />
                            </Grid>
                            <Grid size={4}>
                                <Controller name='destinationPortId' control={control} rules={{required:"Select destination port"}} 
                                    render={({field})=>
                                        <Autocomplete {...field} fullWidth size='small' value={destinationPort ?? null} options={ports ?? []} 
                                            getOptionLabel={(option) => option.portName ?? ''} loading={isLoadingPorts}
                                            onChange={(_, value: PortViewModel | null) => {
                                                field.onChange(value?.portId);
                                                setValue('destinationPortName', value?.portName)
                                                setDestinationPort(value ?? undefined)
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
                                    }
                                />
                            </Grid>
                            <Grid size={2}>
                                <FormControl fullWidth size="small" error={!!errors.currency}>
                                    <InputLabel>Currency</InputLabel>
                                    <Controller name='currency' control={control} rules={{required:"Select currency"}}
                                        render={({field})=>
                                            <Select {...field} value={field.value ?? currencyOptions[0].code} 
                                                label='Currency'
                                                onChange={(e: SelectChangeEvent<string>)=>{
                                                    field.onChange(e.target.value)
                                                }}>
                                                {
                                                    currencyOptions.map(item=>(
                                                        <MenuItem key={item.code} value={item.code}>{item.label}</MenuItem>
                                                    ))
                                                }
                                            </Select>
                                        }
                                    />
                                </FormControl>
                            </Grid>
                            <Grid size={2}>
                                <LocalizationProvider dateAdapter={AdapterDayjs}>
                                    <Controller name='validUntil' control={control} rules={{required:"Select valid until date"}}
                                        render={({field})=>
                                            <DatePicker format="DD/MM/YYYY" value={dayjs(field.value)} disablePast
                                                label="Valid until"
                                                onChange={(value: dayjs.Dayjs | null)=>{
                                                    field.onChange(value?.toDate() ?? new Date(Date.now()))
                                                }}
                                                slotProps={{ 
                                                    textField: { 
                                                        error: !!errors.validUntil,
                                                        helperText: errors.validUntil?.message,
                                                        id: "valid-until", size: "small", fullWidth: true 
                                                    }, 
                                                    inputAdornment: { sx: { position: "relative", right: "11.5px" } } }} />
                                        }
                                    />
                                
                                </LocalizationProvider> 
                            </Grid>
                            <Grid size={10}>
                                <Controller name='services' control={control} render={({field})=> 
                                    servicesSeafreight(field)
                                } />
                            </Grid>
                            <Grid size={2}>
                                <Controller name="comment" control={control} render={({field}) => 
                                        <TextField multiline
                                        onChange={(e?:ChangeEvent<HTMLInputElement | HTMLTextAreaElement>)=> field.onChange(e?.target.value)} 
                                        label="Comment or remarks" rows={5} size='small' value={field.value ?? null} fullWidth />} 
                                />
                            </Grid>
                        </Grid>
                    }
                    
                    
                </DialogContent>
                <DialogActions>
                    <Button variant='contained' color='success' size='small' type="submit" loading={isSubmitting} startIcon={<Save />}>Save</Button>
                    <Button onClick={onClose} variant='outlined' color='error' size='small' startIcon={<Cancel />}>Close</Button>
                </DialogActions>
            </form>
        </Dialog>
    )
}

export default EditSeafreight