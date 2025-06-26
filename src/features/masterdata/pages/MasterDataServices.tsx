import { useState, useEffect, useCallback } from 'react';
import Box from '@mui/material/Box';
import { Button, IconButton, Stack, TextField } from '@mui/material';
import Grid from '@mui/material/Grid2';
import { Edit, Delete, Save, Cancel, Add, Refresh } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { ServiceViewModel } from '@features/masterdata/api';
import { ColumnDef, createColumnHelper } from '@tanstack/react-table';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {  deleteServiceByIdMutation, getServiceOptions, getServiceQueryKey, postServiceMutation, putServiceByIdMutation } from '@features/masterdata/api/@tanstack/react-query.gen';
import { EditSelectCell, EditTextFieldCell } from '@components/common/EditableCells';
import ConfirmDialogComponent from '@components/common/ConfirmDialogComponent';
import { showSnackbar } from '@components/common/Snackbar';
import EditableTable from '@components/common/EditableTable';
import { ServiceTypeEnum } from '@utils/misc/enumsCommon';

const columnHelper = createColumnHelper<ServiceViewModel>()

const MasterDataServices = () => {
    const { t } = useTranslation();
    const queryClient = useQueryClient();
    
    const [services, setServices] = useState<ServiceViewModel[]>([]);
    const [serviceId, setServiceId] = useState<number>();
    const [editRow, setEditRow] = useState<boolean>(false)
    const [confirmDeleteRow, setConfirmDeleteRow] = useState(false)
    const [savingRow, setSavingRow] = useState(false)
    const [globalFilter, setGlobalFilter] = useState('')

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

    const columns: ColumnDef<ServiceViewModel, any>[] = [
        columnHelper.accessor('serviceName', {
            header: t('serviceName'),
            cell: x => <EditTextFieldCell<ServiceViewModel> {...x}
                    edit={(editRow && serviceId !== undefined && serviceId === x.row.original.serviceId) || 
                    (serviceId === 0 && x.row.original.serviceId === undefined)} />
        }),
        columnHelper.accessor('servicesTypeId', {
            header: t('servicesTypeId'),
            cell: x => <EditSelectCell<ServiceViewModel> {...x} multiple
                options={Object.entries(ServiceTypeEnum).filter(([key])=> !isNaN(Number(key))).map(([key,value])=>{
                    return {
                        id: key,
                        label: value.toString()
                    }
                })}
                edit={(editRow && serviceId !== undefined && serviceId === x.row.original.serviceId) || 
                (serviceId === 0 && x.row.original.serviceId === undefined)} />
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
                                size='small' placeholder="Search services..." />
                        </Stack>
                    
                        <EditableTable data={services} columns={columns}
                            onUpdate={(rowIndex, columnId, value) => {
                                setServices((old) =>
                                old.map((row, index) =>
                                    index === rowIndex ? { ...old[rowIndex], [columnId]: value } : row
                                )
                                );
                            }}
                            isLoading={isFetching} globalFilter={globalFilter} onGlobalFilterChange={setGlobalFilter}
                            />
                    </Grid>
                </Grid>
            </Box>
            { ConfirmDeletion() }
        </div>
        
    );
}

export default MasterDataServices;