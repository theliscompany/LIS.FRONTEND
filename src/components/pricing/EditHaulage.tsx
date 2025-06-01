import { Autocomplete, Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, FormControl, FormHelperText, InputLabel, MenuItem, Select, SelectChangeEvent, TextField  } from '@mui/material';
import Grid from '@mui/material/Grid2'
import { ChangeEvent, useEffect, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { getCityOptions, getPackageOptions, getPortOptions } from '../../api/client/masterdata/@tanstack/react-query.gen';
import { CityViewModel, PackageViewModel, PortViewModel } from '../../api/client/masterdata';
import { currencyOptions, haulageTypeOptions } from '../../utils/constants';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { Cancel, Save } from '@mui/icons-material';
import { ContactViewModel } from '../../api/client/crm';
//import CreateContactPopover from '../crm/CreateContactPopover';
import { HaulageViewModel } from '../../api/client/pricing';
import dayjs from 'dayjs';
import { getApiHaulageHaulageByIdOptions, getApiHaulageHaulagesQueryKey, postApiHaulageHaulageMutation, putApiHaulageHaulageByIdMutation } from '../../api/client/pricing/@tanstack/react-query.gen';
import { showSnackbar } from '../common/Snackbar';
import { Controller, SubmitHandler, useForm } from 'react-hook-form';
import { getContactGetContactsOptions } from '../../api/client/crm/@tanstack/react-query.gen';
import SpinningIcon from '../common/SpinningIcon';

type EditHaulageProps = {
    haulageId?: string;
    open:boolean;
    onClose: () => void
}

function EditHaulage({haulageId, open, onClose}:EditHaulageProps) {

    const [city, setCity] = useState<CityViewModel>()
    const [port, setPort] = useState<PortViewModel | null>(null)
    const [contact, setContact] = useState<ContactViewModel | null>(null)
    const [isLoading, setIsLoading] = useState(!!haulageId)

    const queryClient = useQueryClient()

    const {data: cities, isLoading: isLoadingCities} = useQuery({
        ...getCityOptions()
    })

    const {data: ports, isLoading: isLoadingPorts} = useQuery({
        ...getPortOptions()
    })

    const {data: containers} = useQuery({
        ...getPackageOptions({
            query: {
                containerOnly: true
            }
        })
    })

    const {data: contacts, isLoading:isLoadingContacts} = useQuery({
        ...getContactGetContactsOptions(),
        staleTime: Infinity
    })

    const {register, handleSubmit, control, formState:{errors, isSubmitting}, reset, getValues, setValue, watch} = useForm<HaulageViewModel>({
        defaultValues:{
            currency: currencyOptions[0].code,
            haulageId: haulageId,
            validUntil: new Date(Date.now()),
    }})
    const watchFields = watch(['haulageId', 'haulierId', 'loadingCityId', 'loadingPortId']);

    useEffect(() => {
        getHaulier();
    }, [])

    useEffect(() => {
        if(watch('haulageId')){
            if(watch('haulierId') && !contact && contacts){
                setContact(contacts?.data?.find(x=>x.contactId === watch('haulierId')) ?? null)
            }

            if(watch('loadingCityId') && !city && cities){
                setCity(cities?.find(x=>x.id === watch('loadingCityId')))
            }

            if(watch('loadingPortId') && !port && ports){
                setPort(ports?.find(x=>x.portId === watch('loadingPortId')) ?? null)
            }
        }
      
    }, [watchFields, contacts, cities, ports])
    

    const getHaulier = async () => {
        const id = getValues('haulageId');
        if(!id) return;

        const data = await queryClient.fetchQuery({
            ...getApiHaulageHaulageByIdOptions({
                path: {
                    id: id
                }
            })
        })

        reset(data)
        setIsLoading(false)
    }
 
    const mutationPost = useMutation({
        ...postApiHaulageHaulageMutation(),
        onSuccess:() => {
            showSnackbar("Saved with success", "success");

            // Invalidate the haulages query to refresh the list
            // This is important to ensure the new haulage appears in the list
            queryClient.invalidateQueries({ queryKey: getApiHaulageHaulagesQueryKey() });

            // Reset the form after successful submission
            reset()
        },
        onError: () => showSnackbar("An error occurred", "warning")
    })

    const mutationUpdate = useMutation({
        ...putApiHaulageHaulageByIdMutation(),
        onSuccess:() => {
            showSnackbar("Saved with success", "success");

            // Invalidate the haulages query to refresh the list
            // This is important to ensure the updated haulage appears in the list
            queryClient.invalidateQueries({ queryKey: getApiHaulageHaulagesQueryKey() });

            onClose();
        },
        onError: () => showSnackbar("An error occurred", "warning")
    })

    // const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    //     setAnchorEl(event.currentTarget);
    // }

    const onSubmit: SubmitHandler<HaulageViewModel> = async (data) => {

        const id = getValues('haulageId')
        id ? await mutationUpdate.mutateAsync({
            path: {
                id: id
            },
            body: data
        }) : await mutationPost.mutateAsync({
            
            body: data
       })
    }

    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth='lg'>
           <DialogTitle>{getValues('haulageId') ? "Edit" : "New"} haulage</DialogTitle>
           <form onSubmit={handleSubmit(onSubmit)}>
                <DialogContent dividers>
                    {
                        isLoading ? 
                        <div style={{ display: 'flex', alignItems: 'center' }}>
                            <SpinningIcon />
                            <span style={{ marginLeft: 8 }}>Chargement...</span>
                        </div> : 
                         <Grid container spacing={2}>
                            <Grid size={4}>
                                <Box display='flex'>
                                    <Controller name='haulierId' control={control} rules={{required:"Select haulier"}} 
                                        render={({field}) =>  
                                            <Autocomplete {...field} fullWidth size='small' value={contact ?? null} options={contacts?.data ?? []} 
                                            getOptionLabel={(option) => option.contactName ?? ''} loading={isLoadingContacts}
                                            onChange={(_, value: ContactViewModel | null) => {
                                                field.onChange(value?.contactId);
                                                setValue('haulierName', value?.contactName);
                                                setContact(value);
                                            }}
                                            renderOption={(props,option)=>(
                                                <li {...props} key={props.id}>
                                                    {option.contactName ?? ''}
                                                </li>
                                            )}
                                            renderInput={(params) => (
                                                <TextField {...params} label="Haulier" 
                                                    error={!!errors.haulierId} 
                                                    helperText={errors.haulierId?.message} /> )} />

                                            } 
                                    />
                                </Box>
                            </Grid>
                            <Grid size={4}>
                                <Controller name='emptyPickupDepot' control={control}
                                    render={({field}) => 
                                        <TextField {...field} label="Empty pickup depot" size='small' value={field.value ?? ''} fullWidth
                                            onChange={(e?:ChangeEvent<HTMLInputElement | HTMLTextAreaElement>)=>field.onChange(e?.target.value)} />
                                    } 
                                />
                                
                            </Grid>
                            <Grid size={2}>
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
                            <Grid size={2}>
                                <Controller name='unitTariff' control={control} rules={{required:"Enter Haulage tariff", min: 0}}
                                    render={({field}) => 
                                        <TextField {...field}  value={field.value ?? 0} label="Haulage tariff" size='small' fullWidth 
                                            error={!!errors.unitTariff} helperText={errors.unitTariff?.type === 'min' ? "Unit tariff must not be less than 0 hours" : errors.unitTariff?.message} 
                                            onChange={(e?:ChangeEvent<HTMLInputElement | HTMLTextAreaElement>)=> 
                                                field.onChange(e && e.target.value.trim().length > 0 ? Number(e.target.value) : 0)} type='number' />
                                    } 
                                />
                            </Grid>
                            
                            <Grid size={4}>
                                <Controller name='loadingCityId' control={control} rules={{required:"Select loading city"}} 
                                    render={({field})=>
                                        <Autocomplete {...field} size='small' value={city ?? null} options={cities ?? []} 
                                            getOptionLabel={(option) => option.name ?? ''} loading={isLoadingCities}
                                            onChange={(_, value: CityViewModel | null) => {
                                                field.onChange(value?.id);
                                                setValue('loadingCity', value?.name);
                                                setCity(value ?? undefined);
                                            }}
                                            renderInput={(params) => (
                                                <TextField {...params} label="Loading city" 
                                                    error={!!errors.loadingCityId} 
                                                    helperText={errors.loadingCityId?.message} /> )} />
                                    } 
                                />
                            </Grid>
                            <Grid size={4}>
                                <FormControl fullWidth size="small" error={!!errors.haulageType}>
                                    <InputLabel>Haulage type (loading timing)</InputLabel>
                                    <Controller name='haulageType' control={control} rules={{required:"Select haulage type"}}
                                        render={({field})=> 
                                        <Select {...field} label='Haulage type (loading timing)'
                                            value={field.value ?? ''} 
                                            onChange={(e: SelectChangeEvent<string>)=>{
                                            field.onChange(e.target.value)
                                        }}>
                                        {
                                            haulageTypeOptions.map(item=>(
                                                <MenuItem key={item.value} value={item.value}>{item.value}</MenuItem>
                                            ))
                                        }
                                        </Select> } 
                                    />
                                    {
                                        errors.haulageType && <FormHelperText>{errors.haulageType.message}</FormHelperText>
                                    }
                                </FormControl>
                            </Grid> 
                            
                            <Grid size={2}>
                                <Controller name='freeTime' control={control} rules={{required:"Enter free time", min: 0}}
                                    render={({field}) => 
                                        <TextField error={!!errors.freeTime} helperText={errors.freeTime?.type === 'min' ? "Free time must not be less than 0 hours" : errors.freeTime?.message} 
                                            {...field} value={field.value ?? 0} size='small' fullWidth type='number' label="Free time (hours)"
                                            onChange={(e?:ChangeEvent<HTMLInputElement | HTMLTextAreaElement>)=> 
                                                field.onChange(e ? Number(e.target.value) : 0)} />
                                    }
                                />
                            </Grid>
                            <Grid size={2}>
                                <Controller name='overtimeTariff' control={control} rules={{required:"Enter overtime", min: 0}}
                                    render={({field}) => 
                                        <TextField error={!!errors.overtimeTariff} helperText={errors.overtimeTariff?.type === 'min' ? "Overtime must not be less than 0 hours" : errors.overtimeTariff?.message} 
                                            {...field} label="Overtime (/hour)" size='small' value={field.value ?? 0} fullWidth type='number'
                                            onChange={(e?:ChangeEvent<HTMLInputElement | HTMLTextAreaElement>)=> 
                                                field.onChange(e ? Number(e.target.value) : 0)} />
                                    }
                                />
                                
                            </Grid>
                            <Grid size={4}>
                                <Controller name='loadingPortId' control={control} rules={{required:"Select loading port"}} 
                                    render={({field})=>
                                        <Autocomplete {...field} size='small' value={port ?? null} options={ports ?? []} 
                                            getOptionLabel={(option) => option.portName ?? ''} loading={isLoadingPorts}
                                            onChange={(_, value: PortViewModel | null) => {
                                                field.onChange(value?.portId);
                                                setValue('loadingPort', value?.portName);
                                                setPort(value);
                                            }}
                                            renderOption={(props,option)=>(
                                                <li {...props} key={props.id}>
                                                    {option.portName ?? ''}
                                                </li>
                                            )}
                                            renderInput={(params) => (
                                                <TextField {...params} label="Loading port" 
                                                    error={!!errors.loadingPortId} 
                                                    helperText={errors.loadingPortId?.message} /> )} />
                                    } 
                                />

                            </Grid>

                            <Grid size={4}>
                                <Controller name='containers' control={control} 
                                    rules={{required:"Select at least one container"}} 
                                    render={({field})=>
                                    <Autocomplete {...field} size='small' multiple value={field.value ?? []} id="tags-standard" options={containers ?? []} 
                                        getOptionLabel={(option) => option.packageName ?? ''}
                                        onChange={(_, value: PackageViewModel[]) => {
                                            field.onChange(value);
                                        }}
                                        renderInput={(params) => (
                                        <TextField {...params} label="Containers" 
                                            error={!!errors.containers} 
                                            helperText={errors.containers?.message} /> )}
                                            />
                                    } />
                            </Grid>
                            
                            <Grid size={2}>
                                <Controller name='multiStop' control={control} rules={{required:"Enter Multi stop", min: 0}}
                                    render={({field}) => 
                                        <TextField {...field} label="Multi stop" size='small' fullWidth type='number' value={field.value ?? 0}
                                        error={errors.multiStop !== undefined} helperText={errors.multiStop?.type === 'min' ? "Multi stop must not be less than 0 hours" : errors.overtimeTariff?.message}
                                            onChange={(e?:ChangeEvent<HTMLInputElement | HTMLTextAreaElement>)=> field.onChange(e ? Number(e.target.value) : 0)}  />
                                    }
                                />
                            </Grid>
                            <Grid size={2}>
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
                    }
                   
                </DialogContent>
                <DialogActions>
                    <Button variant='contained' color='success' size='small' type='submit' loading={isSubmitting} startIcon={<Save />}>Save</Button>
                    <Button onClick={onClose} variant='outlined' color='error' size='small' startIcon={<Cancel />}>Close</Button>
                </DialogActions>
           </form>
            
        </Dialog>
    );
}

export default EditHaulage;
