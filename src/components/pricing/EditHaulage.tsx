import { Autocomplete, Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, FormControl, IconButton, InputLabel, MenuItem, Select, SelectChangeEvent, TextField, Tooltip  } from '@mui/material';
import Grid from '@mui/material/Grid2'
import { ChangeEvent, useState } from 'react';
import SelectContact from '../crm/SelectContact';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { getCityOptions, getPackageOptions, getPortOptions } from '../../api/client/masterdata/@tanstack/react-query.gen';
import { CityViewModel, PackageViewModel, PortViewModel } from '../../api/client/masterdata';
import { currencyOptions, haulageTypeOptions } from '../../utils/constants';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { AddCircle, Cancel, Save } from '@mui/icons-material';
import { ContactViewModel } from '../../api/client/crm';
import CreateContactPopover from '../crm/CreateContactPopover';
import { HaulagePostViewModel } from '../../api/client/pricing';
import dayjs from 'dayjs';
import { getApiHaulageHaulagesQueryKey, postApiHaulageHaulageMutation } from '../../api/client/pricing/@tanstack/react-query.gen';
import { showSnackbar } from '../common/Snackbar';
import AutocompleteUI from '../common/AutocompleteUI';

function EditHaulage({open, onClose}:{haulageId?: number,open:boolean, onClose: () => void}) {

    const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);
    const [submitting, setSubmitting] = useState(false)
    const [haulage, setHaulage] = useState<HaulagePostViewModel>({
        currency: currencyOptions[0].code,
        unitTariff:0
    })
    //const [errors, setErrors] = useState<HaulageErrorsType>()

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

    const mutation = useMutation({
        ...postApiHaulageHaulageMutation(),
        onSuccess:() => {
            showSnackbar("Saved with success", "success");
            queryClient.invalidateQueries({ queryKey: getApiHaulageHaulagesQueryKey() });
            //setErrors(undefined)
            setHaulage({
                currency: currencyOptions[0].code,
                unitTariff:0
            })
        },
        onError: () => showSnackbar("An error occurred", "warning"),
        onSettled: () => {
            setSubmitting(false)
        }
    })

    const handleContactSelected = (contact?: ContactViewModel | null) => {
        setHaulage({
            ...haulage,
            haulierId: contact?.contactId,
            haulierName: contact?.contactName
        })
    }

    const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
        setAnchorEl(event.currentTarget);
    }

    const handleSaveHaulage = async () => {

        // if(haulage.haulierId === 0 || haulage.haulierId === undefined){
        //     setErrors({haulier: "Select haulier"})
        //     return;
        // }
        
        setSubmitting(true)
        await mutation.mutateAsync({
            body: haulage
       })
    }

    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth='lg'>
           <DialogTitle>Edit haulage</DialogTitle>
            <DialogContent dividers>
                <Grid container spacing={2}>
                    <Grid size={4}>
                        <Box display='flex'>
                            <SelectContact ContactSelected={handleContactSelected} label='Haulier' />
                            {/* {
                                errors?.haulier && errors.haulier &&
                                <FormHelperText>{errors.haulier}</FormHelperText>
                            } */}
                            <Tooltip title="New haulier" placement='top'>
                                <IconButton size='small' onClick={handleClick}>
                                    <AddCircle />
                                </IconButton>
                            </Tooltip>
                            <CreateContactPopover anchorEl={anchorEl} setAnchorEl={setAnchorEl} />
                        </Box>
                    </Grid>
                     <Grid size={4}>
                        <TextField label="Empty pickup depot" size='small' value={haulage?.emptyPickupDepot ?? ''} fullWidth
                            onChange={(e?:ChangeEvent<HTMLInputElement | HTMLTextAreaElement>)=>setHaulage({
                                ...haulage,
                                emptyPickupDepot: e?.target.value
                            })} />
                    </Grid>
                    <Grid size={2}>
                        <FormControl fullWidth size="small">
                            <InputLabel>Currency</InputLabel>
                            <Select value={haulage.currency ?? currencyOptions[0].code} label='Currency'
                                onChange={(e: SelectChangeEvent<string>)=>setHaulage({
                                ...haulage,
                                currency: e.target.value
                            })}>
                                {
                                    currencyOptions.map(item=>(
                                        <MenuItem key={item.code} value={item.code}>{item.label}</MenuItem>
                                    ))
                                }
                            </Select>
                        </FormControl>
                    </Grid>
                    <Grid size={2}>
                        <TextField value={haulage.unitTariff ?? 0} onChange={(e?:ChangeEvent<HTMLInputElement | HTMLTextAreaElement>)=> setHaulage({
                            ...haulage,
                            unitTariff: e && e.target.value.trim().length > 0 ? Number(e.target.value) : 0
                        })} label="Haulage tariff" size='small' defaultValue='' fullWidth type='number' />
                    </Grid>
                    
                    <Grid size={4}>
                        <AutocompleteUI<CityViewModel> loading={isLoadingCities} label='Loading city' data={cities ?? []} 
                            valueSelected={(city?:CityViewModel | null)=>setHaulage({
                                    ...haulage,
                                    loadingCity: city?.name
                                })} getOptionLabel={(option) => option.name ?? ''} />
                        
                    </Grid>

                    <Grid size={4}>
                        <FormControl fullWidth size="small">
                            <InputLabel>Haulage type (loading timing)</InputLabel>
                            <Select value={haulage.haulageType ?? ''} label='Haulage type (loading timing)'
                                onChange={(e: SelectChangeEvent<string>)=>setHaulage({
                                    ...haulage,
                                    haulageType: e.target.value
                                })}>
                                {
                                    haulageTypeOptions.map(item=>(
                                        <MenuItem key={item.value} value={item.value}>{item.value}</MenuItem>
                                    ))
                                }
                            </Select>
                        </FormControl>
                    </Grid>
                    
                    <Grid size={2}>
                        <TextField value={haulage.freeTime ?? 0} label="Free time (hours)" size='small' fullWidth type='number' 
                            onChange={(e?:ChangeEvent<HTMLInputElement | HTMLTextAreaElement>)=> setHaulage({
                                ...haulage,
                                freeTime: e ? Number(e.target.value) : 0
                            })} />
                    </Grid>
                    <Grid size={2}>
                        <TextField label="Overtime (/hour)" size='small' value={haulage.overtimeTariff ?? 0} fullWidth type='number' 
                            onChange={(e?:ChangeEvent<HTMLInputElement | HTMLTextAreaElement>)=> setHaulage({
                                ...haulage,
                                overtimeTariff: e ? Number(e.target.value) : 0
                            })} />
                    </Grid>
                    <Grid size={4}>
                        <AutocompleteUI<PortViewModel> loading={isLoadingPorts} label='Loading port' data={ports ?? []} 
                            valueSelected={(port?:PortViewModel | null)=>setHaulage({
                                    ...haulage,
                                    loadingPortId: port?.portId,
                                    loadingPort: port?.portName
                                })} getOptionLabel={(option) => option.portName ?? ''} />
                    </Grid>

                    <Grid size={4}>
                        <Autocomplete size='small' multiple value={haulage.containers ?? []} id="tags-standard" options={containers ?? []} getOptionLabel={(option) => option.packageName ?? ''}
                            renderInput={(params) => (
                            <TextField {...params} label="Containers" /> )}
                                onChange={(_:any, value: PackageViewModel[])=> setHaulage({
                                    ...haulage,
                                    containers: value
                                })} />
                    </Grid>
                    
                    <Grid size={2}>
                        <TextField label="Multi stop" size='small' fullWidth type='number' value={haulage.multiStop ?? 0}
                            onChange={(e?:ChangeEvent<HTMLInputElement | HTMLTextAreaElement>)=> setHaulage({
                                ...haulage,
                                multiStop: e ? Number(e.target.value) : 0
                            })} />
                    </Grid>
                    <Grid size={2}>
                        <LocalizationProvider dateAdapter={AdapterDayjs}>
                            <DatePicker format="DD/MM/YYYY" value={dayjs(haulage.validUntil)} disablePast
                            onChange={(value: dayjs.Dayjs | null)=>setHaulage({
                                ...haulage,
                                validUntil:value?.toDate()
                            })}
                            slotProps={{ textField: { id: "valid-until", size: "small", fullWidth: true }, inputAdornment: { sx: { position: "relative", right: "11.5px" } } }} />
                        </LocalizationProvider> 
                    </Grid>
                    

                    <Grid size={12}>
                        <TextField multiline label="Comment or remarks" size='small' fullWidth rows={3} 
                        onChange={(e?:ChangeEvent<HTMLInputElement | HTMLTextAreaElement>)=> setHaulage({
                                ...haulage,
                                comment: e?.target.value
                            })}/>
                    </Grid>
                </Grid>
            </DialogContent>
            <DialogActions>
                <Button variant='contained' color='success' size='small' onClick={handleSaveHaulage} loading={submitting} startIcon={<Save />}>Save</Button>
                <Button onClick={onClose} variant='outlined' color='error' size='small' startIcon={<Cancel />}>Close</Button>
            </DialogActions>
        </Dialog>
    );
}

export default EditHaulage;
