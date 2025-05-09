import { useState, useEffect, useCallback } from 'react';
import Box from '@mui/material/Box';
import { Button, Checkbox, FormControl, IconButton, ListItemText, MenuItem, OutlinedInput, Paper, Select, SelectChangeEvent, Stack, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField } from '@mui/material';
import Grid from '@mui/material/Grid2';
import { Edit, Delete, Save, Cancel, Add, Refresh } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { ServiceViewModel } from '../../api/client/masterdata';
import { Column, createColumnHelper, FilterFn, flexRender, getCoreRowModel, getFilteredRowModel, Row, useReactTable } from '@tanstack/react-table';
import { ServiceTypeEnum } from '../../utils/misc/enumsCommon';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {  deleteServiceByIdMutation, getServiceOptions, getServiceQueryKey, postServiceMutation, putServiceByIdMutation } from '../../api/client/masterdata/@tanstack/react-query.gen';
import { EditTextFieldCell } from '../../components/common/EditComponentCell';
import {
    rankItem
  } from '@tanstack/match-sorter-utils'
import ConfirmDialogComponent from '../../components/common/ConfirmDialogComponent';
import TableBodySkeleton from '../../components/skeletons/TableBodySkeleton';
import { showSnackbar } from '../../components/common/Snackbar';

const SEAFREIGHT = "SEAFREIGHT";
const HAULAGE = "HAULAGE";
const MISCELLANEOUS = "MISCELLANEOUS";  

const getServicesType = (servicesType:number[]) => {
    return servicesType.map((serviceTypeId: number) => {
        return serviceTypeId === ServiceTypeEnum.SEAFREIGHT ? SEAFREIGHT : 
        serviceTypeId === ServiceTypeEnum.HAULAGE ? HAULAGE : 
        serviceTypeId === ServiceTypeEnum.MISCELLANEOUS ? MISCELLANEOUS : ''
    }).join(", ")
}

interface CustomTableMeta {
    updateServiceData: <TValue>(rowIndex: number, columnId: string, value: TValue) => void;
}

const columnHelper = createColumnHelper<ServiceViewModel>()

const MasterDataServices: any = () => {
    const { t } = useTranslation();
    const queryClient = useQueryClient();
    
    const [services, setServices] = useState<ServiceViewModel[]>([]);
    const [serviceId, setServiceId] = useState<number>();
    const [editRow, setEditRow] = useState<boolean>(false)
    const [confirmDeleteRow, setConfirmDeleteRow] = useState(false)
    const [savingRow, setSavingRow] = useState(false)
    const [globalFilter, setGlobalFilter] = useState('')
    // const [sorting, setSorting] = useState<SortingState>([
    //         {
    //             id: 'serviceName',
    //             desc: false
    //         }
    //     ])

    const {data, isFetching} = useQuery({...getServiceOptions()})

    useEffect(() => {
        setServices(data ?? []);
    }, [data])

    const handleServiceStatusUpdated = () => {
        return {
            onSuccess:() => {
                setServiceId(undefined);
                setEditRow(false);

                showSnackbar("Saved with success", "success");
                queryClient.invalidateQueries({ queryKey: getServiceQueryKey() });
            },
            onError: () => showSnackbar(t('errorHappened'), "warning"),
            onSettled:() => setSavingRow(false)
        }
    }

    const deleteServiceMutation = useMutation({
        ...deleteServiceByIdMutation(),
        onSuccess:() => {
            setServiceId(undefined);
            showSnackbar("Deleted with success", "success");
            queryClient.invalidateQueries({ queryKey: getServiceQueryKey() });
        },
        onError : () => showSnackbar(t('errorHappened'), "warning")
    })

    const updateServiceMutation = useMutation({
        ...putServiceByIdMutation(),
        ...handleServiceStatusUpdated()
   })

   const createServiceMutation = useMutation({
        ...postServiceMutation(),
        ...handleServiceStatusUpdated()
    })

    const handleEditService = (id?: number) => {
        setServiceId(id);
        setEditRow(true);
    }

    const handleSaveService = (index:number) => {
        setSavingRow(true);

        const row = services[index];
        if (serviceId) updateServiceMutation.mutate({ path: { id: serviceId }, body: row });
        else createServiceMutation.mutate({ body: row });
    }

    const handleDeleteService = (id?: number) => {
        setServiceId(id);
        setConfirmDeleteRow(true);
    }

    const handleCancelEditService = () => {
        setServiceId(undefined);
        setEditRow(false);
        setServices(data ?? []);
    }

    const handleAddService = () => {
        setEditRow(true);
        setServiceId(0);
        setServices([{ serviceName: '', servicesTypeId: [] }, ...services]);
    }

    const handleIfConfirmDelete = async (deleted: boolean) => {
        setConfirmDeleteRow(false);
        if(!deleted) {
            setServiceId(undefined);
        }
        else if(serviceId) {
            await deleteServiceMutation.mutateAsync({ path: { id: serviceId }})
        }
    }

    const ConfirmDeletion = useCallback(
      () => {
        return <ConfirmDialogComponent title="Delete service" 
            message="Are you sure you want to delete this service?" 
            open={confirmDeleteRow} onDelete={handleIfConfirmDelete} />},
      [confirmDeleteRow])

    const editSelectCell = ({ getValue, row, column, table }: { 
        getValue: () => number[] | null | undefined,
        row: Row<ServiceViewModel>,
        column: Column<ServiceViewModel, number[] | null | undefined>,
        table: any
    }) => {
        const [servicesTypeValue, setServicesTypeValue] = useState(getValue() ?? [])

        const onBlur = () => {
            (table.options.meta as CustomTableMeta).updateServiceData<number[]>(row.index, column.id, servicesTypeValue)
        }

        const handleServiceTypeChange = (event: SelectChangeEvent<typeof servicesTypeValue>) => {
            const {
              target: { value },
            } = event;
            setServicesTypeValue(
              // On autofill we get a stringified value.
              typeof value === 'string' ? value.split(',').map((v)=>Number(v)) : value,
            );
          };

        if((editRow && serviceId !== undefined && serviceId === row.original.serviceId) || 
        (serviceId === 0 && row.original.serviceId === undefined)) {
            return (
                <FormControl fullWidth>
                    <Select multiple displayEmpty size='small' value={servicesTypeValue} input={<OutlinedInput />}
                    onChange={handleServiceTypeChange} onBlur={onBlur}
                    renderValue={(selected)=>{
                            if (selected && selected.length === 0) {
                                return <em>-- Select service type -- </em>;
                            }
                            return selected ? getServicesType(selected): ""}
                        }>
                        {
                            Object.keys(ServiceTypeEnum).filter(x=> !isNaN(Number(x))).map((type) => {
                                const typeValue = Number(type);
                                return <MenuItem key={typeValue} value={typeValue}>
                                    <Checkbox checked={(servicesTypeValue).includes(typeValue)} />
                                    <ListItemText primary={
                                        typeValue === ServiceTypeEnum.SEAFREIGHT ? SEAFREIGHT : 
                                        typeValue === ServiceTypeEnum.HAULAGE ? HAULAGE : 
                                        typeValue === ServiceTypeEnum.MISCELLANEOUS ? MISCELLANEOUS : ''
                                    } />
                                </MenuItem>
                            })
                        }
                    </Select>
                </FormControl>
            )
        }
        

        return getServicesType(servicesTypeValue);
    }

    const columns = [
        columnHelper.accessor('serviceName', {
            header: t('serviceName'),
            cell: ({getValue, row, column}) => {

                const onBlur = (value: string) => {
                    if(table){
                        (table.options.meta as CustomTableMeta).updateServiceData<string>(row.index, column.id, value)
                    }
                }

                return EditTextFieldCell({
                getValue: getValue,
                edit: (editRow && serviceId !== undefined && serviceId === row.original.serviceId) || 
                (serviceId === 0 && row.original.serviceId === undefined),
                onBlur: onBlur,
            });
        }
        }),
        columnHelper.accessor('servicesTypeId', {
            header: t('servicesTypeId'),
            cell: editSelectCell
        }),
        columnHelper.display({
            id: 'option',
            size: 10,
            enableSorting: false,
            cell: ({row}) => {
                if(row.original.serviceId !== undefined || serviceId === 0) {
                    const _serviceId = row.original.serviceId;
                    return (<Box>
                        {
                            (editRow && (serviceId === _serviceId || (serviceId === 0 && _serviceId === undefined))) ? 
                            <>
                                 <IconButton size="small" title={t('editRowService')} sx={{ mr: 0.5 }} 
                                    onClick={()=>handleSaveService(row.index)} loading={savingRow}>
                                        <Save sx={{color:'green'}} />
                                </IconButton>
                                   
                                <IconButton size="small" title={t('editRowService')} sx={{ mr: 0.5 }} 
                                    onClick={handleCancelEditService}>
                                        <Cancel sx={{color:'red'}} />
                                </IconButton>
                                
                            </> : 
                            <>
                                <IconButton size="small" title={t('editRowService')} sx={{ mr: 0.5 }} onClick={() => handleEditService(_serviceId)}>
                                    <Edit sx={{color:'blue'}} />
                                </IconButton>
                                <IconButton size="small" title={t('deleteRowService')} sx={{ mr: 0.5 }} onClick={() => handleDeleteService(_serviceId)}>
                                    <Delete sx={{color:'red'}} />
                                </IconButton>
                            </>
                        }
                   
                    </Box>)
                }
            }
        })
    ]

    const fuzzyFilter: FilterFn<any> = (row, columnId, value, addMeta) => {
        // Rank the item
        const itemRank = rankItem(row.getValue(columnId), value)
      
        // Store the itemRank info
        addMeta({
          itemRank,
        })
      
        // Return if the item should be filtered in/out
        return itemRank.passed
    }

    const table = useReactTable({
        data: services || [],
        columns,
        filterFns: {
            fuzzy: fuzzyFilter,
        },
        state: {
            globalFilter,
            //sorting
        },
        globalFilterFn: fuzzyFilter,
        getCoreRowModel: getCoreRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        //getSortedRowModel: getSortedRowModel(),
        onGlobalFilterChange: setGlobalFilter,
        //onSortingChange: setSorting,
        meta:{
            updateServiceData: (rowIndex: number, columnId: string, value: unknown) => { 
                setServices((old) =>
                    old.map((row, index) => {
                      if (index === rowIndex) {
                        return {
                          ...old[rowIndex],
                          [columnId]: value,
                        };
                      }
                      return row;
                    })
                  );
            }
        } 
    })

    const handleRefreshTable = () => {
        queryClient.invalidateQueries({ queryKey: getServiceQueryKey() });
    }
    
    return (
        <div style={{ background: "#fff", borderTopLeftRadius: 20, borderTopRightRadius: 20 }}>
            <Box py={2.5}>
                <Grid container spacing={2} mt={0} px={5}>
                    
                    <Grid size={{ xs: 12 }}>
                        <Stack direction='row' alignItems='center' justifyContent='space-between' mb={2}>
                            <Box>
                                <Button variant='contained' sx={{mr:2}} startIcon={<Add />} size='small' onClick={handleAddService}>
                                    Add service
                                </Button>
                                <Button variant='outlined' startIcon={<Refresh />} size='small' onClick={handleRefreshTable}>
                                    Refresh
                                </Button>
                            </Box>
                            <TextField value={globalFilter ?? ''} onChange={(e) => setGlobalFilter(e.target.value)}
                                size='small' placeholder="Search serrvices..." />
                        </Stack>
                    
                        <TableContainer component={Paper}>
                            <Table size='small'>
                                <TableHead>
                                    {
                                        table.getHeaderGroups().map(headerGroup => (
                                            <TableRow key={headerGroup.id}>
                                                {
                                                    headerGroup.headers.map(header => (
                                                        <TableCell key={header.id} sx={{fontWeight: "bold",width:`${header.getSize()}px`}}>
                                                            {header.isPlaceholder ? null : 
                                                                (
                                                                    // <div onClick={header.column.getToggleSortingHandler()} 
                                                                    //     style={{display: 'flex', alignItems: 'center', cursor: 'pointer'}}>
                                                                    //     {
                                                                            flexRender(
                                                                                header.column.columnDef.header,
                                                                                header.getContext()
                                                                            )
                                                                    //     }
                                                                    //     {{
                                                                    //         asc: <ArrowDropUp />,
                                                                    //         desc: <ArrowDropDown />,
                                                                    //     }[header.column.getIsSorted() as string] ?? null}
                                                                    // </div>
                                                                )
                                                            }
                                                        </TableCell>
                                                    ))  
                                                }
                                            </TableRow>
                                        ))
                                    }
                                </TableHead>
                                <TableBody>
                                    {
                                        !isFetching ? 
                                        table.getRowModel().rows.map(row => (
                                            <TableRow key={row.id}>
                                                {
                                                    row.getVisibleCells().map(cell => (
                                                        <TableCell key={cell.id}>
                                                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                                        </TableCell>
                                                    ))
                                                }
                                            </TableRow>
                                        ))  
                                        : 
                                        <TableBodySkeleton columns={columns.length} rows={5} />
                                    }
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </Grid>
                </Grid>
            </Box>
            { ConfirmDeletion() }
        </div>
        
    );
}

export default MasterDataServices;