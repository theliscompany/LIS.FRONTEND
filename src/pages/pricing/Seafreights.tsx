import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import EditableTable from "../../components/common/EditableTable"
import { SeaFreightsViewModel, SupplierSeaFreightViewModel } from "../../api/client/pricing"
import { useMemo, useState } from "react"
import { deleteApiSeaFreightDeleteSeaFreightsMutation, getApiSeaFreightGetSeaFreightsOptions, getApiSeaFreightGetSeaFreightsQueryKey } from "../../api/client/pricing/@tanstack/react-query.gen"
import OffersSeafreight from "../../components/pricing/OffersSeafreight"
import { ColumnDef, createColumnHelper } from "@tanstack/react-table"
import { Breadcrumbs, Button, ButtonGroup, Divider, IconButton, Stack, TextField, Typography } from "@mui/material"
import Add from "@mui/icons-material/Add"
import Refresh from "@mui/icons-material/Refresh"
import ExpandMore from "@mui/icons-material/ExpandMore"
import ChevronRight from "@mui/icons-material/ChevronRight"
import { Link } from "react-router-dom"
import { DeleteForever } from "@mui/icons-material"
import { useConfirmDialog } from "../../hooks/useConfirmDialog"
import { showSnackbar } from "../../components/common/Snackbar"

const columnHelper = createColumnHelper<SeaFreightsViewModel>()

const Seafreights = () => {

    const [globalFilter, setGlobalFilter] = useState('')
    const [allSelectedSeafreightIds, setAllSelectedSeafreightIds] = useState<Record<string, string[]>>({})
    const [deleting, setDeleting] = useState(false)
    
    const uniqueSelectedIds = useMemo(() => {
        return Array.from(new Set(Object.values(allSelectedSeafreightIds).flat()))
    }, [allSelectedSeafreightIds])

    const queryClient = useQueryClient()
    
    const { confirm, ConfirmDialogComponent } = useConfirmDialog();

    const { data: seaFreights, isLoading} = useQuery({
        ...getApiSeaFreightGetSeaFreightsOptions(),
        staleTime: Infinity
    })

    const mutationDelete = useMutation({
        ...deleteApiSeaFreightDeleteSeaFreightsMutation(),
        onSuccess: () => showSnackbar("Deleted with success", "success"),
        onError: () => showSnackbar('An error occurred', "warning"),
        onSettled: () => {
            setDeleting(false)
            setAllSelectedSeafreightIds({})
            queryClient.invalidateQueries({ queryKey: getApiSeaFreightGetSeaFreightsQueryKey() });
        }
    })

    const columns: ColumnDef<SeaFreightsViewModel, any>[] = [
        columnHelper.accessor('departurePortName', {
            header: "Departure port",
            cell: ({row, getValue}) => <>
                {
                    row.getCanExpand() ? (
                        <IconButton size='small'
                        {...{
                            onClick: row.getToggleExpandedHandler(),
                            style: { cursor: 'pointer' },
                        }}
                        >
                        {row.getIsExpanded() ? <ExpandMore /> : <ChevronRight />}
                        </IconButton>
                    ) : (
                        ''
                    )
                }
                <span style={{marginLeft:2}}>{ getValue<string | null | undefined>() }</span>
            </>
        }),
        columnHelper.accessor('destinationPortName', {
            header: "Destination port",
            cell: ({getValue}) => getValue<string | null | undefined>()
        })
    ]

    const refreshSeaFreights = async () => {
        await queryClient.prefetchQuery({
            ...getApiSeaFreightGetSeaFreightsOptions()
        })
    }

    const handleDeleteSeafreights = async () => {
        const confirmResult = await confirm(
            'Delete haulages',
            `Are you sure you want to delete ${uniqueSelectedIds.length} seafreight(s)? This action cannot be undone.`
        );

        if (confirmResult) {
            setDeleting(true)
            mutationDelete.mutateAsync({
                query: {
                    ids: uniqueSelectedIds
                }
            })
        }
    }

    const handleGetRowsSelected = (key: string) => (rows: SupplierSeaFreightViewModel[]) => {
    
        setAllSelectedSeafreightIds(prev => ({
            ...prev,
            [key]: rows.map(r => r.seaFreightId ?? '').filter(id => id !== '')
        }))
    }

    return (    
        <>
            <Breadcrumbs separator={<ChevronRight fontSize='small' />} aria-label="breadcrumb">
                <Typography key="3" sx={{ color: 'text.primary' }}>
                    Seafreights
                </Typography>
            </Breadcrumbs>
            <Divider sx={{ mb: 1 }} />
            <Stack direction='row' alignItems='center' justifyContent='space-between' mb={1}>
                <ButtonGroup color='info' variant='text' size='small' aria-label='text button group'>
                    <Button startIcon={<Add />} to='/seafreight' component={Link}>
                        New
                    </Button>
                    <Button disabled={uniqueSelectedIds.length === 0} startIcon={<DeleteForever />} onClick={handleDeleteSeafreights} loading={deleting}>
                        Delete
                    </Button>
                    <Button startIcon={<Refresh />} onClick={refreshSeaFreights}>
                        Refresh
                    </Button>
                </ButtonGroup>
                <TextField value={globalFilter ?? ''} onChange={(e) => setGlobalFilter(e.target.value)}
                    size='small' placeholder="Search seafreights..." />
            </Stack>
           
            <EditableTable<SeaFreightsViewModel> data={seaFreights ?? []} columns={columns} isLoading={isLoading} 
                globalFilter={globalFilter} onGlobalFilterChange={setGlobalFilter} rowCanExpand
                subComponent={(row: SeaFreightsViewModel)=><OffersSeafreight seafreight={row} 
                    getRowsSelected={handleGetRowsSelected(`${row.departurePortName}_${row.destinationPortName}`)} />} />

            {ConfirmDialogComponent}
        </>
    )
}

export default Seafreights;
