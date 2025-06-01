import { ColumnDef, createColumnHelper } from "@tanstack/react-table";
import { ServiceViewModel } from "../../api/client/pricing";
import { ChangeEvent, useEffect, useRef, useState } from "react";
import FormControl from "@mui/material/FormControl";
import OutlinedInput from "@mui/material/OutlinedInput";
import Select, { SelectChangeEvent } from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import ListItemText from "@mui/material/ListItemText";
import TextField from "@mui/material/TextField";
import { Currency } from "../../utils/constants";
import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import { Cancel, Check } from "@mui/icons-material";
import { useQuery } from "@tanstack/react-query";
import { getServiceOptions } from "../../api/client/masterdata/@tanstack/react-query.gen";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import Button from "@mui/material/Button";
import AddCircle from "@mui/icons-material/AddCircle";
import Alert from "@mui/material/Alert";
import EditableTable from "../common/EditableTable";

interface ServicesMiscellaneousProps {
    currency: string,
    data: ServiceViewModel[],
    getServicesAdded: (services: ServiceViewModel[]) => void
}

const columnHelper = createColumnHelper<ServiceViewModel>()

const ServicesMiscellaneous = ({data, currency, getServicesAdded}:ServicesMiscellaneousProps) => {

    const [servicesMiscellaneous, setServicesMiscellaneous] = useState<ServiceViewModel[]>(data)
    const [editingRowIndex, setEditingRowIndex] = useState<number | null>(null);

    const rowDraftRef = useRef<ServiceViewModel | null>(null);

    useEffect(() => {
        setServicesMiscellaneous(data);
    }, [data])

    const {data: services} = useQuery({
        ...getServiceOptions()
    })

    const columns: ColumnDef<ServiceViewModel, any>[] = [
        columnHelper.accessor('serviceName', {
            header: "Service",
            cell: ({ row }) => {
                const [local, setlocal] = useState(row.original.serviceId)
                if(editingRowIndex === row.index){
                    return <FormControl fullWidth>
                        <Select displayEmpty size='small' value={local ?? ''} input={<OutlinedInput />}
                        onChange={(e?: SelectChangeEvent<number>)=>{
                            if(!rowDraftRef.current) return;
                            
                            const serviceId = e ? Number(e.target.value) : undefined;
                            const selectedService = services?.find((x) => x.serviceId === serviceId);

                            
                            if (!rowDraftRef.current) rowDraftRef.current = {} as ServiceViewModel;
                            setlocal(serviceId)
                            rowDraftRef.current = {
                                ...rowDraftRef.current,
                                serviceName: selectedService?.serviceName,
                                serviceId: serviceId
                            };
                        }}>
                            {
                                (services ?? []).map((opt) => (
                                    <MenuItem key={opt.serviceId} value={opt.serviceId}>
                                        <ListItemText primary={opt.serviceName} />
                                    </MenuItem>
                                ))
                            }
                        </Select>
                    </FormControl>
                }

                return row.original.serviceName ?? ''
            }
            
        }),
        columnHelper.accessor('price', {
            header: "Price",
            cell: ({row})=> {
                const [local, setlocal] = useState(row.original.price ?? 0)
                if(editingRowIndex === row.index){
                    return <TextField type="number" size="small" value={local ?? 0}
                    onChange={(e?: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => 
                        {
                            if (rowDraftRef.current) {
                                setlocal(e ? Number(e.target.value) : 0)
                                rowDraftRef.current.price = e ? Number(e.target.value) : 0;
                            }
                        }
                    }
                />
                }
                return  `${row.original.price ?? 0} ${Currency[currency]}`
            }
        }),
        columnHelper.display({
            id:"option",
            cell: ({row}) => 
                editingRowIndex === row.index ? (
                <Box>
                    <IconButton size="small" color="success" onClick={()=>handleValidRow()}>
                        <Check />
                    </IconButton>
                    <IconButton size="small" color="error" onClick={()=>handleCancelRow(row.index)}>
                        <Cancel />
                    </IconButton>
                </Box>
            ) : null
        })
    ]

    const handleCancelRow = (index: number) => {
        const values = [...servicesMiscellaneous]
        values.splice(index,1)
        setServicesMiscellaneous(values)
    }

    const handleValidRow = () => {
        if (editingRowIndex !== null && rowDraftRef.current) {
            const updated = [...servicesMiscellaneous];
            updated[editingRowIndex] = rowDraftRef.current;
            setServicesMiscellaneous(updated);
            getServicesAdded(updated);
        }
        setEditingRowIndex(null);
        rowDraftRef.current = null;
    }

    const handleAddService = () => {
        const newService: ServiceViewModel = { serviceName: "", serviceId: undefined, price: 0 };
        setServicesMiscellaneous([...servicesMiscellaneous, newService]);
        setEditingRowIndex(servicesMiscellaneous.length);
        rowDraftRef.current = newService;
    }

    return (
        <Paper sx={{p:2, backgroundColor:"#00404533"}}>
            <Stack direction="row" alignItems="center" justifyContent="space-between" mb={2}>
                <Button sx={{mb:2}} variant="outlined" size="small" onClick={handleAddService} startIcon={<AddCircle />}>Add service</Button>
                {servicesMiscellaneous.length === 0 && <Alert severity="warning">You must add at least one service.</Alert>}
            </Stack>
            
            <EditableTable<ServiceViewModel> data={servicesMiscellaneous} columns={columns} 
                onUpdate={(rowIndex, columnId, value) => {
                    setServicesMiscellaneous((old) =>
                    old.map((row, index) =>
                        index === rowIndex ? { ...old[rowIndex], [columnId]: value } : row
                    )
                    );
                }}  />
        </Paper>
    )
}

export default ServicesMiscellaneous;