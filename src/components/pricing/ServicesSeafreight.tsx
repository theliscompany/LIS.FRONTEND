import { ColumnDef, createColumnHelper, isNumberArray } from "@tanstack/react-table"
import EditableTable from "../common/EditableTable"
import { Alert, Box, Button, ButtonGroup, Checkbox, Chip, FormControl, IconButton, ListItemText, MenuItem, OutlinedInput, Paper, Select, SelectChangeEvent, Stack, TextField } from "@mui/material"
import { AddCircle, Cancel, Check, DeleteForever } from "@mui/icons-material"
import { useQuery } from "@tanstack/react-query"
import { getPackageOptions, getServiceOptions } from "../../api/client/masterdata/@tanstack/react-query.gen"
import { ChangeEvent, useEffect, useRef, useState } from "react"
import { ServiceSeaFreightViewModel } from "../../api/client/pricing"
import { Currency } from "../../utils/constants"
import { useConfirmDialog } from "../../hooks/useConfirmDialog"

interface ServicesSeafreightProps {
    currency: string,
    data: ServiceSeaFreightViewModel[],
    getServicesAdded: (services: ServiceSeaFreightViewModel[]) => void
}

const columnHelper = createColumnHelper<ServiceSeaFreightViewModel>()

const ServicesSeafreight = ({data, currency, getServicesAdded}:ServicesSeafreightProps) => {

    const [servicesSeafreight, setServicesSeafreight] = useState<ServiceSeaFreightViewModel[]>(data)
    const [editingRowIndex, setEditingRowIndex] = useState<number | null>(null);
    const [allSelectedServices, setAllSelectedServices] = useState<number[]>([])
    const [tableRef, setTableRef] = useState<import("@tanstack/table-core").Table<ServiceSeaFreightViewModel>>()

    const rowDraftRef = useRef<ServiceSeaFreightViewModel | null>(null);

    const { confirm, ConfirmDialogComponent } = useConfirmDialog();

    useEffect(() => {
      setServicesSeafreight(data);
    }, [data])
    

    const {data: services} = useQuery({
        ...getServiceOptions()
    })

    const {data: containers} = useQuery({
        ...getPackageOptions({
            query: {
                containerOnly: true
            }
        }),
        staleTime: Infinity
    })

    const columns: ColumnDef<ServiceSeaFreightViewModel, any>[] = [
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
                        <Select displayEmpty size='small' value={local ?? ''} input={<OutlinedInput />}
                        onChange={(e?: SelectChangeEvent<number>)=>{
                            if(!rowDraftRef.current) return;
                            
                            const serviceId = e ? Number(e.target.value) : undefined;
                            const selectedService = services?.find((x) => x.serviceId === serviceId);

                            
                            if (!rowDraftRef.current.service) rowDraftRef.current.service = {} as any;
                            setlocal(serviceId)
                            rowDraftRef.current = {
                                ...rowDraftRef.current,
                                service: {
                                    ...rowDraftRef.current.service,
                                    serviceId,
                                    serviceName: selectedService?.serviceName,
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
                    return <TextField type="number" size="small" value={local ?? 0}
                    onChange={(e?: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => 
                        {
                            if (rowDraftRef.current?.service) {
                                setlocal(e ? Number(e.target.value) : 0)
                                rowDraftRef.current.service.price = e ? Number(e.target.value) : 0;
                            }
                        }
                    }
                />
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
                                <Select multiple displayEmpty size='small' input={<OutlinedInput />}
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

    const handleAddService = () => {
        const newService: ServiceSeaFreightViewModel = {
            service: { serviceName: "", serviceId: undefined, price: 0 },
            containers: [],
        };
        setServicesSeafreight([...servicesSeafreight, newService]);
        setEditingRowIndex(servicesSeafreight.length);
        rowDraftRef.current = newService;
    }

    const handleCancelRow = (index: number) => {
        const values = [...servicesSeafreight]
        values.splice(index,1)
        setServicesSeafreight(values)
    }

    const handleValidRow = () => {
        if (editingRowIndex !== null && rowDraftRef.current) {
            const updated = [...servicesSeafreight];
            updated[editingRowIndex] = rowDraftRef.current;
            setServicesSeafreight(updated);
            getServicesAdded(updated);
        }
        setEditingRowIndex(null);
        rowDraftRef.current = null;
    }

    const handleGetRowsSelected = (index: number[]) => setAllSelectedServices(index)

    const handleDeleteServices = async () => {
        const confirmResult = await confirm(
            'Delete services',
            `Are you sure you want to delete ${allSelectedServices.length} service(s)? This action cannot be undone.`
        );

        
        if (confirmResult) {
            const values = [...servicesSeafreight]

            const result = values.filter((_,index)=> !allSelectedServices.includes(index))
            setAllSelectedServices([])
            setServicesSeafreight(result) 

            tableRef?.resetRowSelection();
        }
    }

    const getTable = (table: import("@tanstack/table-core").Table<ServiceSeaFreightViewModel>) => {
        setTableRef(table);
    }

    return (
        <>
            <Paper sx={{p:2, backgroundColor:"#00404533"}}>
                <Stack direction="row" alignItems="center" justifyContent="space-between">
                    <ButtonGroup color='info' variant='text' size='small' aria-label='text button group'>
                        <Button onClick={handleAddService} startIcon={<AddCircle />}>Add service</Button>
                        <Button disabled={allSelectedServices.length === 0} startIcon={<DeleteForever />} onClick={handleDeleteServices}>
                            Delete
                        </Button>
                    </ButtonGroup>
                    
                    {servicesSeafreight.length === 0 && <Alert severity="warning">You must add at least one service.</Alert>}
                </Stack>
                
                <EditableTable<ServiceSeaFreightViewModel> data={servicesSeafreight} columns={columns} 
                    enableRowSelection={true} getRowsIndexSelected={handleGetRowsSelected} getTableRef={getTable}
                    onUpdate={(rowIndex, columnId, value) => {
                        setServicesSeafreight((old) =>
                        old.map((row, index) =>
                            index === rowIndex ? { ...old[rowIndex], [columnId]: value } : row
                        ));
                    }}  />
            </Paper>
            {ConfirmDialogComponent}
        </>
        
    )
}

export default ServicesSeafreight