import { ColumnDef, createColumnHelper, isNumberArray } from "@tanstack/react-table";
import { MiscellaneousServiceViewModel } from "../../api/client/pricing";
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
import { Cancel, Check, DeleteForever } from "@mui/icons-material";
import { useQuery } from "@tanstack/react-query";
import { getPackageOptions, getServiceOptions } from "../../api/client/masterdata/@tanstack/react-query.gen";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import Button from "@mui/material/Button";
import AddCircle from "@mui/icons-material/AddCircle";
import Alert from "@mui/material/Alert";
import EditableTable from "../common/EditableTable";
import { useConfirmDialog } from "../../hooks/useConfirmDialog";
import Checkbox from "@mui/material/Checkbox";
import ButtonGroup from "@mui/material/ButtonGroup";
import FormHelperText from "@mui/material/FormHelperText";
import Chip from "@mui/material/Chip";

interface ServicesMiscellaneousProps {
    currency: string,
    data: MiscellaneousServiceViewModel[],
    getServicesAdded: (services: MiscellaneousServiceViewModel[]) => void
}

interface ServiceError {
    service?: string;
    price?: string;
    containers?: string;
}

const columnHelper = createColumnHelper<MiscellaneousServiceViewModel>()

const ServicesMiscellaneous = ({data, currency, getServicesAdded}:ServicesMiscellaneousProps) => {

    const [servicesMiscellaneous, setServicesMiscellaneous] = useState<MiscellaneousServiceViewModel[]>(data)
    const [editingRowIndex, setEditingRowIndex] = useState<number | null>(null)
    const [allSelectedServices, setAllSelectedServices] = useState<number[]>([])
    const [tableRef, setTableRef] = useState<import("@tanstack/table-core").Table<MiscellaneousServiceViewModel>>()
    const [errorMessage, setErrorMessage] = useState<ServiceError>()

    const rowDraftRef = useRef<MiscellaneousServiceViewModel | null>(null);

    const { confirm, ConfirmDialogComponent } = useConfirmDialog();

    useEffect(() => {
        setServicesMiscellaneous(data);
    }, [data])

    useEffect(() => {
        if(!errorMessage?.containers && !errorMessage?.price && !errorMessage?.service && 
            editingRowIndex !== null && rowDraftRef.current){
            const updated = [...servicesMiscellaneous];
            updated[editingRowIndex] = rowDraftRef.current;
            setServicesMiscellaneous(updated);
            
            getServicesAdded(updated);

            setEditingRowIndex(null);
            rowDraftRef.current = null;
        }
    }, [errorMessage])

    const {data: containers} = useQuery({
        ...getPackageOptions({
            query: {
                containerOnly: true
            }
        }),
        staleTime: Infinity
    })

    const {data: services} = useQuery({
        ...getServiceOptions()
    })

    const columns: ColumnDef<MiscellaneousServiceViewModel, any>[] = [
        columnHelper.display({
            id: 'select',
            header: ({table})=> (
                <Checkbox size="small"
                    {...{ 
                        checked: table.getIsAllRowsSelected(),
                        indeterminate: table.getIsSomeRowsSelected(),
                        onChange: table.getToggleAllRowsSelectedHandler()
                    }}/>
            ),
            cell: ({row}) => (
                <Checkbox size="small" 
                {...{
                    checked: row.getIsSelected(),
                    disabled: !row.getCanSelect(),
                    indeterminate: row.getIsSomeSelected(),
                    onChange: row.getToggleSelectedHandler()
                }} />
            )
        }),
        columnHelper.accessor('service.serviceName', {
            header: "Service",
            cell: ({ row }) => {
                const [local, setlocal] = useState(row.original.service?.serviceId)
                if(editingRowIndex === row.index){
                    return <FormControl fullWidth>
                        <Select displayEmpty size='small' value={local ?? ''} input={<OutlinedInput />} error={!!errorMessage?.service}
                            onChange={(e?: SelectChangeEvent<number>)=>{
                                if(!rowDraftRef.current) return;
                                
                                const serviceId = e ? Number(e.target.value) : undefined;
                                const selectedService = services?.find((x) => x.serviceId === serviceId);

                                setlocal(serviceId)
                                
                                rowDraftRef.current = {
                                    ...rowDraftRef.current,
                                    service:{
                                        ...rowDraftRef.current.service,
                                        serviceName: selectedService?.serviceName,
                                        serviceId: serviceId
                                    }
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
                        {
                            errorMessage && errorMessage.service && <FormHelperText error={!!errorMessage.service}>{errorMessage.service}</FormHelperText>
                        }
                    </FormControl>
                }

                return row.original.service?.serviceName ?? ''
            }
            
        }),
        columnHelper.accessor('service.price', {
            header: "Price",
            cell: ({row})=> {
                const [local, setlocal] = useState(row.original.service?.price ?? 0)
                if(editingRowIndex === row.index){
                    return <TextField type="number" size="small" value={local ?? 0} helperText={errorMessage?.price}
                    onChange={(e?: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => 
                        {
                            if (rowDraftRef.current) {
                                setlocal(e ? Number(e.target.value) : 0)
                                rowDraftRef.current = {
                                    ...rowDraftRef.current,
                                    service:{
                                        ...rowDraftRef.current.service,
                                        price: e ? Number(e.target.value) : 0
                                    }
                                };
                            }
                        }
                    } error={!!errorMessage?.price} />
                }
                return  `${row.original.service?.price ?? 0} ${Currency[currency]}`
            }
        }),
        columnHelper.accessor('containers', {
            header: "Containers",
            cell: ({row})=> {
                const [local, setlocal] = useState((row.original.containers ?? []).map(x=>x.packageId ?? 0))
                if(editingRowIndex === row.index){
                    return <FormControl fullWidth>
                                <Select multiple displayEmpty size='small' error={!!errorMessage?.containers} input={<OutlinedInput />}
                                    value={local} 
                                    onChange={(e: SelectChangeEvent<number[]>)=>{

                                        const newContainers = isNumberArray(e.target.value)
                                            ? e.target.value.map((x) => ({
                                                packageId: x,
                                                packageName: containers?.find((y) => y.packageId === x)?.packageName,
                                                }))
                                            : [];

                                        setlocal(newContainers.map(x=>x.packageId))

                                        rowDraftRef.current = {
                                            ...rowDraftRef.current,
                                            containers: newContainers,
                                        };
                                    }} 
                                    renderValue={(selected)=> {
                                        if (selected.length === 0) {
                                            return <em>-- Select service type -- </em>;
                                        }
                                            
                                        return selected.map(x=>(containers ?? []).find((opt) => opt.packageId === x)?.packageName).join(', ')
                                        
                                    }}>
                                    {
                                        (containers ?? []).map((opt) => (
                                            <MenuItem key={opt.packageId} value={opt.packageId}>
                                                <Checkbox checked={opt.packageId ? local.includes(opt.packageId) : false} />
                                                <ListItemText primary={opt.packageName} />
                                            </MenuItem>
                                        ))
                                    }
                                </Select>
                                {
                                    errorMessage && errorMessage.containers && <FormHelperText error={!!errorMessage.containers}>{errorMessage.containers}</FormHelperText>
                                }
                            </FormControl>
                } 

                return (row.original.containers ?? []).map(x=> (
                    <Chip size="small" variant="outlined"  label={x.packageName} sx={{ml:1}} />
                )) || ''
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
            const service:MiscellaneousServiceViewModel = rowDraftRef.current;
            setErrorMessage({
                service: service.service?.serviceId === undefined || service.service?.serviceName === '' ? 
                    "Service is required." : undefined,
                price: service.service?.price === undefined || service.service?.serviceName === '' ? 
                    "Price is required." : service.service.price <= 0 ? "Price must not be less than 0." : undefined,
                containers: service.containers === undefined || service.containers?.length === 0 ? 
                    "Select at least one container" : undefined
            })
        }
    }

    const handleAddService = () => {
        const newService: MiscellaneousServiceViewModel = { 
            service: { serviceName: "", serviceId: undefined, price: 0 },
            containers: []
         };
        setServicesMiscellaneous([...servicesMiscellaneous, newService]);
        setEditingRowIndex(servicesMiscellaneous.length);
        rowDraftRef.current = newService;
    }

    const handleGetRowsSelected = (index: number[]) => setAllSelectedServices(index)
    
    const handleDeleteServices = async () => {
        const confirmResult = await confirm(
            'Delete services',
            `Are you sure you want to delete ${allSelectedServices.length} service(s)? This action cannot be undone.`
        );
        
        if (confirmResult) {
            const values = [...servicesMiscellaneous]

            const result = values.filter((_,index)=> !allSelectedServices.includes(index))
            setAllSelectedServices([])
            setServicesMiscellaneous(result) 

            tableRef?.resetRowSelection();
        }
    }

    const getTable = (table: import("@tanstack/table-core").Table<MiscellaneousServiceViewModel>) => {
        setTableRef(table);
    }

    return (
        <>
        
            <Paper sx={{p:2, backgroundColor:"#00404533"}}>
                <Stack direction="row" alignItems="center" justifyContent="space-between" >
                    <ButtonGroup color='info' variant='text' size='small' aria-label='text button group'>
                        <Button onClick={handleAddService} startIcon={<AddCircle />}>Add</Button>
                        <Button disabled={allSelectedServices.length === 0} startIcon={<DeleteForever />} onClick={handleDeleteServices}>
                            Delete
                        </Button>
                    </ButtonGroup>
                    {servicesMiscellaneous.length === 0 && <Alert severity="warning">You must add at least one service.</Alert>}
                </Stack>
                
                <EditableTable<MiscellaneousServiceViewModel> data={servicesMiscellaneous} columns={columns} 
                enableRowSelection={true} getRowsIndexSelected={handleGetRowsSelected} getTableRef={getTable}
                    onUpdate={(rowIndex, columnId, value) => {
                        setServicesMiscellaneous((old) =>
                        old.map((row, index) =>
                            index === rowIndex ? { ...old[rowIndex], [columnId]: value } : row
                        )
                        );
                    }}  />
            </Paper>

            {ConfirmDialogComponent}
        </>
    )
}

export default ServicesMiscellaneous;