import { useCallback, useEffect, useState } from 'react';
import Box from '@mui/material/Box';
import { Button, IconButton, Stack, TextField } from '@mui/material';
import Grid from '@mui/material/Grid2';
import { Edit, Delete, Add, Refresh, Save, Cancel } from '@mui/icons-material';
//import { countries } from '../../utils/constants';
import { useTranslation } from 'react-i18next';
import { PortViewModel } from '@features/transport/api';
//import CountrySelect from '../../components/shared/CountrySelect';
import EditableTable from '@components/common/EditableTable';
import ConfirmDialogComponent from '@components/common/ConfirmDialogComponent';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { deletePortByIdMutation, getPortOptions, getPortQueryKey, postPortMutation, putPortByIdMutation } from '@features/masterdata/api/@tanstack/react-query.gen';
import { showSnackbar } from '@components/common/Snackbar';
import { ColumnDef, createColumnHelper } from '@tanstack/react-table';
import { EditTextFieldCell } from '@components/common/EditableCells';

const columnHelper = createColumnHelper<PortViewModel>()

const MasterDataPorts: any = () => {
    const { t } = useTranslation();

    const queryClient = useQueryClient();

    const {data, isFetching} = useQuery({...getPortOptions()})
    
    const [ports, setPorts] = useState<PortViewModel[]>([])
    const [confirmDeleteRow, setConfirmDeleteRow] = useState(false)
    const [editRow, setEditRow] = useState<boolean>(false)
    const [savingRow, setSavingRow] = useState(false)
    const [portId, setPortId] = useState<number>();
    const [globalFilter, setGlobalFilter] = useState('')

    useEffect(() => {
        setPorts(data ?? []);
    }, [data])
    
    const ConfirmDeletion = useCallback( () => {
    return <ConfirmDialogComponent title="Delete port" 
        message="Are you sure you want to delete this port?" 
        open={confirmDeleteRow} onDelete={handleIfConfirmDelete} />},
    [confirmDeleteRow])

    const deletePortMutation = useMutation({
        ...deletePortByIdMutation(),
        onSuccess:() => {
            setPortId(undefined);
            showSnackbar("Deleted with success", "success");
            queryClient.invalidateQueries({ queryKey: getPortQueryKey() });
        },
        onError : () => showSnackbar(t('errorHappened'), "warning")
    })

    const handlePortStatusUpdated = () => {
        return {
            onSuccess:() => {
                setPortId(undefined);
                setEditRow(false);

                showSnackbar("Saved with success", "success");
                queryClient.invalidateQueries({ queryKey: getPortQueryKey() });
            },
            onError: () => showSnackbar(t('errorHappened'), "warning"),
            onSettled:() => setSavingRow(false)
        }
    }

    const updatePortMutation = useMutation({
            ...putPortByIdMutation(),
            ...handlePortStatusUpdated()
       })
    
       const createPortMutation = useMutation({
            ...postPortMutation(),
            ...handlePortStatusUpdated()
        })

    const columns: ColumnDef<PortViewModel, any>[] = [
        columnHelper.accessor('portName', {
            header: 'Port name',
            cell: x => <EditTextFieldCell<PortViewModel> {...x}
                    edit={(editRow && portId !== undefined && portId === x.row.original.portId) || 
                    (portId === 0 && x.row.original.portId === undefined)} />
        }),
        // columnHelper.accessor('country', {
        //     header: 'Country',
        //     cell: x => <EditSelectCell<PortViewModel> {...x} edit={(editRow && portId !== undefined && portId === x.row.original.portId) || 
        //                 (portId === 0 && x.row.original.portId === undefined)} />
        // }),
        columnHelper.display({
            id: 'option',
            size: 10,
            enableSorting: false,
            cell: ({row}) => {
                if(row.original.portId !== undefined || portId === 0) {
                    const _portId = row.original.portId;
                    return (<Box>
                        {
                            (editRow && (portId === _portId || (portId === 0 && _portId === undefined))) ? 
                            <>
                                    <IconButton size="small" title='Save port' sx={{ mr: 0.5 }} 
                                    onClick={()=>handleSavePort(row.index)} loading={savingRow}>
                                        <Save sx={{color:'green'}} />
                                </IconButton>
                                    
                                <IconButton size="small" title='Cancel port' sx={{ mr: 0.5 }} 
                                    onClick={handleCancelEditPort}>
                                        <Cancel sx={{color:'red'}} />
                                </IconButton>
                                
                            </> : 
                            <>
                                <IconButton size="small" title='Edit port' sx={{ mr: 0.5 }} onClick={() => handleEditPort(_portId)}>
                                    <Edit sx={{color:'blue'}} />
                                </IconButton>
                                <IconButton size="small" title='Delete port' sx={{ mr: 0.5 }} onClick={() => handleDeletePort(_portId)}>
                                    <Delete sx={{color:'red'}} />
                                </IconButton>
                            </>
                        }
                    
                    </Box>)
                }
            }
        })
    ]

    const handleEditPort = (id?: number) => {
        setPortId(id);
        setEditRow(true);
    }

    const handleDeletePort = (id?: number) => {
        setPortId(id);
        setConfirmDeleteRow(true);
    }

    const handleAddPort = () => {
        setEditRow(true);
        setPortId(0);
        setPorts([{ portName: '', country: '' }, ...ports]);
    }

    const handleRefreshTable = () => {
        queryClient.invalidateQueries({ queryKey: getPortQueryKey() });
    }

    const handleIfConfirmDelete = async (deleted: boolean) => {
        setConfirmDeleteRow(false);
        if(!deleted) {
            setPortId(undefined);
        }
        else if(portId) {
            await deletePortMutation.mutateAsync({ path: { id: portId }})
        }
    }

    const handleSavePort = (index:number) => {
        setSavingRow(true);

        const row = ports[index];
        if (portId) updatePortMutation.mutate({ path: { id: portId }, body: row });
        else createPortMutation.mutate({ body: row });
    }

    const handleCancelEditPort = () => {
        setPortId(undefined);
        setEditRow(false);
        setPorts(data ?? []);
    }
    
    return (
        <div style={{ background: "#fff", borderTopLeftRadius: 20, borderTopRightRadius: 20 }}>
        <Box py={2.5}>
            <Grid container spacing={2} mt={0} px={5}>
                
                <Grid size={{ xs: 12 }}>
                    <Stack direction='row' alignItems='center' justifyContent='space-between' mb={2}>
                        <Box>
                            <Button variant='contained' sx={{mr:2}} startIcon={<Add />} size='small' onClick={handleAddPort}>
                                Add port
                            </Button>
                            <Button variant='outlined' startIcon={<Refresh />} size='small' onClick={handleRefreshTable}>
                                Refresh
                            </Button>
                        </Box>
                        <TextField value={globalFilter ?? ''} onChange={(e) => setGlobalFilter(e.target.value)}
                            size='small' placeholder="Search serrvices..." />
                    </Stack>
                
                    <EditableTable data={ports} columns={columns}
                        onUpdate={(rowIndex, columnId, value) => {
                            setPorts((old) =>
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

export default MasterDataPorts;