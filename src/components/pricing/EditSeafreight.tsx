import { Button, Dialog, DialogActions, DialogContent, DialogTitle, FormControl, InputLabel, MenuItem, Select, SelectChangeEvent, TextField } from "@mui/material"
import Grid from '@mui/material/Grid2'
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { getApiSeaFreightGetSeaFreightsQueryKey, postApiSeaFreightSeaFreightMutation } from "../../api/client/pricing/@tanstack/react-query.gen"
import { ChangeEvent, useState } from "react"
import { SeaFreightViewModel, ServiceSeaFreightViewModel } from "../../api/client/pricing"
import SelectContact from "../crm/SelectContact"
import { getPortOptions } from "../../api/client/masterdata/@tanstack/react-query.gen"
import { PortViewModel } from "../../api/client/masterdata"
import { currencyOptions } from "../../utils/constants"
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers"
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs"
import dayjs from "dayjs"
import Save from "@mui/icons-material/Save"
import { Cancel } from "@mui/icons-material"
import { showSnackbar } from "../common/Snackbar"
import { ContactViewModel } from "../../api/client/crm"
import ServicesSeafreight from "./ServicesSeafreight"
import AutocompleteUI from "../common/AutocompleteUI"

// export type ServiceSeafreight = {
//     serviceName?: string | null,
//     serviceId?: number,
//     price?: number,
//     containers: Record<number, string>
// }

const EditSeafreight = ({open, onClose}:{open: boolean, onClose: () => void}) => {
    const [seaFreight, setSeaFreight] = useState<SeaFreightViewModel>({
        currency: currencyOptions[0].code,
        validUntil: new Date(Date.now())
    })
    const [submitting, setSubmitting] = useState(false)

    const queryClient = useQueryClient()

    const {data: ports, isLoading: isLoadingPorts} = useQuery({
        ...getPortOptions()
    })

    const mutation = useMutation({
        ...postApiSeaFreightSeaFreightMutation(),
        onSuccess:() => {
            showSnackbar("Saved with success", "success");
            queryClient.invalidateQueries({ queryKey: getApiSeaFreightGetSeaFreightsQueryKey() });
            setSeaFreight({
                currency: currencyOptions[0].code,
                validUntil: new Date(Date.now()),
                services: []
            })
        },
        onError: () => showSnackbar("An error occurred", "warning"),
        onSettled: () => {
            setSubmitting(false)
        }
    })

    const handleSaveSeafreight = async () => {
        setSubmitting(true)
        await mutation.mutateAsync({
            body: seaFreight
        })
    }

    const handleCarrierSelected = (contact?: ContactViewModel | null) => {
        setSeaFreight({
            ...seaFreight,
            carrierId: contact?.contactId,
            carrierName: contact?.contactName
        })
    }

     const handleCarrierAgentSelected = (contact?: ContactViewModel | null) => {
        setSeaFreight({
            ...seaFreight,
            carrierAgentId: contact?.contactId,
            carrierAgentName: contact?.contactName
        })
    }

    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth='lg'>
            <DialogTitle>Edit seafreight</DialogTitle>
            <DialogContent dividers>
                <Grid container spacing={2}>
                    <Grid size={4}>
                        <SelectContact ContactSelected={handleCarrierSelected} label='Carrier' />
                    </Grid>
                    <Grid size={4}>
                        <SelectContact ContactSelected={handleCarrierAgentSelected} label='Carrier agent' />
                    </Grid>
                    <Grid size={2}>
                        <TextField onChange={(e?:ChangeEvent<HTMLInputElement | HTMLTextAreaElement>)=> setSeaFreight({
                            ...seaFreight,
                            transitTime: e ? Number(e.target.value) : undefined
                        })} label="Transit time (in days)" size='small' value={seaFreight?.transitTime ?? 0} fullWidth type='number' />
                    </Grid>
                    <Grid size={2}>
                        <TextField onChange={(e?:ChangeEvent<HTMLInputElement | HTMLTextAreaElement>)=> setSeaFreight({
                            ...seaFreight,
                            frequency: e ? Number(e.target.value) : undefined
                        })} label="Frequency (every x days)" size='small' value={seaFreight?.frequency ?? 0} fullWidth type='number' />
                    </Grid>
                    <Grid size={4}>
                        <AutocompleteUI<PortViewModel> loading={isLoadingPorts} label='Departure port' data={ports ?? []} 
                            valueSelected={(port?:PortViewModel | null)=>setSeaFreight({
                                    ...seaFreight,
                                    departurePortId: port?.portId,
                                    departurePortName: port?.portName
                                })} getOptionLabel={(option) => option.portName ?? ''} />
                    </Grid>
                    <Grid size={4}>
                        <AutocompleteUI<PortViewModel> loading={isLoadingPorts} label='Destination port' data={ports ?? []} 
                            valueSelected={(port?:PortViewModel | null)=>setSeaFreight({
                                    ...seaFreight,
                                    destinationPortId: port?.portId,
                                    destinationPortName: port?.portName
                                })} getOptionLabel={(option) => option.portName ?? ''} />
                    </Grid>
                    <Grid size={2}>
                        <FormControl fullWidth size="small">
                            <InputLabel>Currency</InputLabel>
                            <Select value={seaFreight?.currency ?? currencyOptions[0].code} label='Currency'
                                onChange={(e: SelectChangeEvent<string>)=>setSeaFreight({
                                ...seaFreight,
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
                        <LocalizationProvider dateAdapter={AdapterDayjs}>
                            <DatePicker format="DD/MM/YYYY" value={dayjs(seaFreight?.validUntil)} disablePast
                            onChange={(value: dayjs.Dayjs | null)=>setSeaFreight({
                                ...seaFreight,
                                validUntil:value?.toDate()
                            })}
                            slotProps={{ textField: { id: "valid-until", size: "small", fullWidth: true }, inputAdornment: { sx: { position: "relative", right: "11.5px" } } }} />
                        </LocalizationProvider> 
                    </Grid>
                    <Grid size={10}>
                        <ServicesSeafreight data={seaFreight?.services ?? []} 
                        getServicesAdded={(services: ServiceSeaFreightViewModel[]) => setSeaFreight({
                            ...seaFreight,
                            services: services
                        })} />
                        
                    </Grid>
                    <Grid size={2}>
                        <TextField multiline label="Comment or remarks" size='small' fullWidth rows={5} 
                        onChange={(e?:ChangeEvent<HTMLInputElement | HTMLTextAreaElement>)=> setSeaFreight({
                                ...seaFreight,
                                comment: e?.target.value
                            })}/>
                    </Grid>
                </Grid>
            </DialogContent>
            <DialogActions>
                <Button variant='contained' color='success' size='small' onClick={handleSaveSeafreight} loading={submitting} startIcon={<Save />}>Save</Button>
                <Button onClick={onClose} variant='outlined' color='error' size='small' startIcon={<Cancel />}>Close</Button>
            </DialogActions>
        </Dialog>
    )
}

export default EditSeafreight