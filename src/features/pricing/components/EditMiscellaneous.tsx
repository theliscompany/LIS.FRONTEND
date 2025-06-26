
import Save from "@mui/icons-material/Save";
import Autocomplete from "@mui/material/Autocomplete";
import Button from "@mui/material/Button";
import Grid from "@mui/material/Grid2";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Controller, ControllerRenderProps, useForm } from "react-hook-form";
import { getContactGetContactsOptions } from "@features/crm/api/@tanstack/react-query.gen";
import { ContactViewModel } from "@features/crm/api";
import { ChangeEvent, useCallback, useEffect, useState } from "react";
import { ContainerTypeEnum, MiscellaneousViewModel } from '@features/pricing/api';
import TextField from "@mui/material/TextField";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import Select, { SelectChangeEvent } from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import { currencyOptions } from '@utils/constants';
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import dayjs from "dayjs";
import { PortViewModel, ServiceViewModel } from '@features/masterdata/api';
import { getPortOptions } from '@features/masterdata/api/@tanstack/react-query.gen';
import ServicesMiscellaneous from "./ServicesMiscellaneous";
import { getApiMiscellaneousMiscellaneousByIdOptions, getApiMiscellaneousMiscellaneousQueryKey, postApiMiscellaneousMiscellaneousMutation, putApiMiscellaneousMiscellaneousByIdMutation } from '@features/pricing/api/@tanstack/react-query.gen';
import { showSnackbar } from '@components/common/Snackbar';
import { Link, useNavigate, useParams } from "react-router-dom";
import Breadcrumbs from "@mui/material/Breadcrumbs";
import ChevronRight from "@mui/icons-material/ChevronRight";
import Typography from "@mui/material/Typography";
import Divider from "@mui/material/Divider";
import { Checkbox, FormControlLabel, FormGroup, FormHelperText, Paper, Stack } from "@mui/material";
import SpinningIcon from '@components/common/SpinningIcon';


const EditMiscellaneous = () => {

    const { id: miscellaneousId } = useParams();
    const navigate = useNavigate();

    const [contact, setContact] = useState<ContactViewModel | null>()
    const [departurePort, setDeparturePort] = useState<PortViewModel | null>()
    const [destinationPort, setDestinationPort] = useState<PortViewModel | null>()
    const [isLoading, setIsLoading] = useState(!!miscellaneousId)

    const queryClient = useQueryClient();

    const { data: contacts, isLoading: isLoadingContacts } = useQuery({
        ...getContactGetContactsOptions(),
        staleTime: Infinity
    })

    const { data: ports, isLoading: isLoadingPorts } = useQuery({
        ...getPortOptions()
    })

    const { control, handleSubmit, register, formState: { errors, isSubmitting }, setValue, getValues, watch, reset } = useForm<MiscellaneousViewModel>({
        defaultValues: {
            validUntil: new Date(Date.now()),
            miscellaneousId: miscellaneousId,
            currency: currencyOptions[0].code
        },
    });

    const watchFields = watch(['supplierId', 'departurePortId']);

    const servicesMiscellaneous = useCallback(
        (field: ControllerRenderProps<MiscellaneousViewModel, "services">) => {
            return <ServicesMiscellaneous data={field.value ?? []} currency={watch('currency') ?? currencyOptions[0].code}
                getServicesAdded={(newServices: ServiceViewModel[]) => field.onChange(newServices)} />
        },
        [watch('currency')],
    )

    const mutationPost = useMutation({
        ...postApiMiscellaneousMiscellaneousMutation(),
        onSuccess: () => {
            showSnackbar("Saved with success", "success");

            resetFields();
        },
        onError: () => showSnackbar("An error occurred", "warning")
    })

    const mutationUpdate = useMutation({
        ...putApiMiscellaneousMiscellaneousByIdMutation(),
        onSuccess: () => {
            showSnackbar("Updated with success", "success");

            resetFields();

            navigate("/miscellaneousAll");

        },
        onError: () => showSnackbar("An error occurred", "warning")
    })

    const resetFields = () => {
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
    }

    useEffect(() => {
        if (watch('miscellaneousId')) {
            if (watch('supplierId') && !contact && contacts) {
                setContact(contacts?.data?.find(x => x.contactId === watch('supplierId')) ?? null)
            }

            if (watch('departurePortId') && !departurePort && ports) {
                setDeparturePort(ports?.find(x => x.portId === watch('departurePortId')) ?? null)
                setDestinationPort(ports?.find(x => x.portId === watch('destinationPortId')) ?? null)
            }
        }

    }, [watchFields, contacts, ports])

    useEffect(() => {
        getMiscellaneous()
    }, [])

    const getMiscellaneous = async () => {
        const id = getValues('miscellaneousId')
        if (!id) return;

        const data = await queryClient.fetchQuery({
            ...getApiMiscellaneousMiscellaneousByIdOptions({
                path: {
                    id: id
                }
            })
        })

        reset(data)

        setIsLoading(false)
    }

    const onSubmit = async (data: MiscellaneousViewModel) => {
        const id = getValues('miscellaneousId')
        id ? await mutationUpdate.mutateAsync({ body: data, path: { id: id } }) :
            await mutationPost.mutateAsync({ body: data });
    }

    const handleContainersArray = (checked: boolean, container: ContainerTypeEnum) => {
        if(checked){
            return Array.isArray(watch('containers')) ? [...watch('containers') ?? [], container] : [container]
        }

        const _containersType = watch('containers')
        const values = _containersType ? [..._containersType] : []
        const index = values.findIndex(x=>x === container)
        values.splice(index,1)

        return values
    }

    return (
        <>
            <Breadcrumbs separator={<ChevronRight fontSize='small' />} aria-label="breadcrumb">
                <Link to="/miscellaneousAll">
                    <span>Miscellaneous</span>
                </Link>
                <Typography key="3" sx={{ color: 'text.primary' }}>
                    {miscellaneousId ? "Edit miscellaneous" : "New miscellaneous"}
                </Typography>
            </Breadcrumbs>
            <Divider sx={{ my: 2 }} />
            <Paper sx={{ p: 3 }} elevation={4}>
                <form onSubmit={handleSubmit(onSubmit)}>
                    {
                        isLoading ?
                            <Stack direction='row' alignItems='center' justifyContent='center'>
                                <SpinningIcon />
                                <span style={{ marginLeft: 8 }}>Chargement...</span>
                            </Stack> :

                            <>
                                <Grid container spacing={2}>
                                    <Grid size={6}>
                                        <Controller name='supplierId' control={control} rules={{ required: "Select supplier" }}
                                            render={({ field }) =>
                                                <Autocomplete {...field} fullWidth size='small' value={contact ?? null} options={contacts?.data ?? []}
                                                    getOptionLabel={(option) => option.contactName ?? ''} loading={isLoadingContacts}
                                                    onChange={(_, value: ContactViewModel | null) => {
                                                        field.onChange(value?.contactId);
                                                        setValue('supplierName', value?.contactName);
                                                        setContact(value);
                                                    }}
                                                    renderOption={(props, option) => (
                                                        <li {...props} key={props.id}>
                                                            {option.contactName ?? ''}
                                                        </li>
                                                    )}
                                                    renderInput={(params) => (
                                                        <TextField {...params} label="Supplier"
                                                            error={!!errors.supplierId}
                                                            helperText={errors.supplierId?.message} />)} />

                                            }
                                        />
                                    </Grid>
                                    <Grid size={3}>
                                        <Controller name="departurePortId" control={control}
                                            rules={{
                                                validate: (value) => {
                                                    if (!value && getValues('destinationPortId')) {
                                                        return "You must select a departure port";
                                                    }
                                                    return true;
                                                }
                                            }} render={({ field }) =>
                                                <Autocomplete {...field} fullWidth size='small' value={departurePort ?? null} options={ports ?? []}
                                                    getOptionLabel={(option) => option.portName ?? ''} loading={isLoadingPorts}
                                                    onChange={(_, value: PortViewModel | null) => {
                                                        field.onChange(value?.portId);
                                                        setValue('departurePortName', value?.portName);
                                                        setDeparturePort(value);
                                                    }}
                                                    renderOption={(props, option) => (
                                                        <li {...props} key={props.id}>
                                                            {option.portName ?? ''}
                                                        </li>
                                                    )}
                                                    renderInput={(params) => (
                                                        <TextField {...params} label="Departure port"
                                                            error={!!errors.departurePortId}
                                                            helperText={errors.departurePortId?.message} />)} />
                                            } />
                                    </Grid>
                                    <Grid size={3}>
                                        <Controller name="destinationPortId" control={control}
                                            rules={{
                                                validate: (value) => {
                                                    if (!value && getValues('departurePortId')) {
                                                        return "You must select a destination port";
                                                    }
                                                    return true;
                                                }
                                            }} render={({ field }) =>
                                                <Autocomplete {...field} fullWidth size='small' value={destinationPort ?? null} options={ports ?? []}
                                                    getOptionLabel={(option) => option.portName ?? ''} loading={isLoadingPorts}
                                                    onChange={(_, value: PortViewModel | null) => {
                                                        field.onChange(value?.portId);
                                                        setValue('destinationPortName', value?.portName);
                                                        setDestinationPort(value);
                                                    }}
                                                    renderOption={(props, option) => (
                                                        <li {...props} key={props.id}>
                                                            {option.portName ?? ''}
                                                        </li>
                                                    )}
                                                    renderInput={(params) => (
                                                        <TextField {...params} label="Destination port"
                                                            error={!!errors.destinationPortId}
                                                            helperText={errors.destinationPortId?.message} />)} />
                                            } />
                                    </Grid>
                                    <Grid size={2}>
                                        <FormControl error={!!errors.containers} {...register('containers',{required:"Select at least one container type"})}>
                                            <FormGroup aria-label="position" row >
                                                <FormControlLabel label="20'" control={
                                                    <Checkbox checked={Array.isArray(watch('containers')) && watch('containers')?.includes(ContainerTypeEnum._20)} 
                                                        onChange={(_:any, checked:boolean)=> setValue('containers', handleContainersArray(checked, ContainerTypeEnum._20))} />
                                                    }  />
                                                <FormControlLabel label="40'" control={
                                                    <Checkbox checked={Array.isArray(watch('containers')) && watch('containers')?.includes(ContainerTypeEnum._40)} 
                                                        onChange={(_:any, checked:boolean)=> setValue('containers', handleContainersArray(checked, ContainerTypeEnum._40))} />}  />
                                            </FormGroup>
                                            {
                                                !!errors.containers && <FormHelperText>{errors.containers.message}</FormHelperText>
                                            }
                                        </FormControl>
                                    </Grid>
                                    <Grid size={2}> 
                                        <FormControl fullWidth size="small">
                                            <InputLabel>Currency</InputLabel>
                                            <Select {...register('currency')} value={getValues('currency') ?? currencyOptions[0].code} label='Currency'
                                                onChange={(e: SelectChangeEvent<string>) => setValue('currency', e.target.value)}>
                                                {
                                                    currencyOptions.map(item => (
                                                        <MenuItem key={item.code} value={item.code}>{item.label}</MenuItem>
                                                    ))
                                                }
                                            </Select>
                                        </FormControl>
                                    </Grid>
                                    <Grid size={2}>
                                        <LocalizationProvider dateAdapter={AdapterDayjs}>
                                            <DatePicker {...register('validUntil')} format="DD/MM/YYYY" value={dayjs(getValues('validUntil'))} disablePast
                                                onChange={(value: dayjs.Dayjs | null) => setValue('validUntil', value?.toDate())}
                                                slotProps={{ textField: { id: "valid-until", size: "small", fullWidth: true }, inputAdornment: { sx: { position: "relative", right: "11.5px" } } }} />
                                        </LocalizationProvider>
                                    </Grid>
                                    <Grid size={6}>
                                        <TextField {...register('comment')} value={getValues('comment') ?? ''} multiline label="Comment or remarks" size='small' fullWidth rows={3}
                                            onChange={(e?: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setValue('comment', e?.target.value)} />
                                    </Grid>
                                    <Grid size={12}>
                                        <Controller name='services' control={control} render={({ field }) =>
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
                                <Stack direction='row' alignItems='center' justifyContent='flex-end' mt={2}>
                                    <Button variant='contained' color='success' size='small' type='submit' loading={isSubmitting} startIcon={<Save />}>Save</Button>
                                </Stack>
                            </>
                    }

                </form>
            </Paper>
        </>
    )
}

export default EditMiscellaneous;