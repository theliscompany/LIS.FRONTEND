import { useMemo, useState } from 'react';
import { Breadcrumbs, Button, ButtonGroup, Divider, IconButton, Stack, TextField, Typography } from '@mui/material';
import { Add, ChevronRight, DeleteForever, ExpandMore, Refresh } from '@mui/icons-material';
import { ColumnDef, createColumnHelper } from '@tanstack/react-table';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { deleteApiHaulageDeleteHaulageMutation, getApiHaulageHaulagesOptions, getApiHaulageHaulagesQueryKey } from '../../api/client/pricing/@tanstack/react-query.gen';
import EditableTable from '../../components/common/EditableTable';
import { HaulageGridGetViewModel, HaulageSupplierViewModel } from '../../api/client/pricing';
import OffersHauliers from '../../components/pricing/OffersHauliers';
import { useConfirmDialog } from '../../hooks/useConfirmDialog';
import { showSnackbar } from '../../components/common/Snackbar';
import { Link } from 'react-router-dom';

const columnHelper = createColumnHelper<HaulageGridGetViewModel>()

function Haulages() {

    const [globalFilter, setGlobalFilter] = useState('')
    const [allSelectedHaulageIds, setAllSelectedHaulageIds] = useState<Record<string, string[]>>({})
    const [deleting, setDeleting] = useState(false)

    const queryClient = useQueryClient()
    const { confirm, ConfirmDialogComponent } = useConfirmDialog();

    const mutationDeleteHaulages = useMutation({
        ...deleteApiHaulageDeleteHaulageMutation(),
        onSuccess: () => showSnackbar("Deleted with success", "success"),
        onError: () => showSnackbar('An error occurred', "warning"),
        onSettled: () => {
            setDeleting(false)
            setAllSelectedHaulageIds({})
            queryClient.invalidateQueries({ queryKey: getApiHaulageHaulagesQueryKey() });
        }
    })

    const { data: haulages, isLoading } = useQuery({
        ...getApiHaulageHaulagesOptions(),
        staleTime: Infinity
    })

    const refeshHaulages = async () => {
        await queryClient.prefetchQuery({
            ...getApiHaulageHaulagesOptions()
        })
    }

    const columns: ColumnDef<HaulageGridGetViewModel, any>[] = [
        columnHelper.accessor('loadingCity', {
            header: "Loading city",
            cell: ({ row, getValue }) => <>
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
                <span style={{ marginLeft: 2 }}>{getValue<string | null>()}</span>
            </>
        }),
        columnHelper.accessor('loadingPort', {
            header: "Loading port",
            cell: ({ getValue }) => getValue<string | null>()
        })
    ]

    const uniqueSelectedIds = useMemo(() => {
        return Array.from(new Set(Object.values(allSelectedHaulageIds).flat()))
    }, [allSelectedHaulageIds])

    const handleGetRowsSelected = (key: string) => (rows: HaulageSupplierViewModel[]) => {

        setAllSelectedHaulageIds(prev => ({
            ...prev,
            [key]: rows.map(r => r.haulageId ?? '').filter(id => id !== '')
        }))
    }

    const handleDeleteHaulages = async () => {
        const confirmResult = await confirm(
            'Delete haulages',
            `Are you sure you want to delete ${uniqueSelectedIds.length} haulage(s)? This action cannot be undone.`
        );

        if (confirmResult) {
            setDeleting(true)
            mutationDeleteHaulages.mutateAsync({
                query: {
                    ids: uniqueSelectedIds
                }
            })
        }
    }
    return (
        <>
            <Breadcrumbs separator={<ChevronRight fontSize='small' />} aria-label="breadcrumb">
                <Typography key="3" sx={{ color: 'text.primary' }}>
                    Haulages
                </Typography>
            </Breadcrumbs>
            <Divider sx={{ mb: 1 }} />
            <Stack direction='row' alignItems='center' justifyContent='space-between' mb={1}>
                <ButtonGroup color='info' variant='text' size='small' aria-label='text button group'>
                    <Button startIcon={<Add />} to='/haulage' component={Link}>
                        New
                    </Button>
                    <Button disabled={uniqueSelectedIds.length === 0} startIcon={<DeleteForever />} onClick={handleDeleteHaulages} loading={deleting}>
                        Delete
                    </Button>
                    <Button startIcon={<Refresh />} onClick={refeshHaulages}>
                        Refresh
                    </Button>
                </ButtonGroup>
                <TextField value={globalFilter ?? ''} onChange={(e) => setGlobalFilter(e.target.value)}
                    size='small' placeholder="Search haulages..." />
            </Stack>
            <Divider sx={{ mb: 2 }} />
            <EditableTable<HaulageGridGetViewModel> data={haulages ?? []} columns={columns} isLoading={isLoading}
                globalFilter={globalFilter} onGlobalFilterChange={setGlobalFilter} rowCanExpand
                subComponent={(row: HaulageGridGetViewModel) => {
                    return (<OffersHauliers haulage={row} getRowsSelected={handleGetRowsSelected(`${row.loadingCity}_${row.loadingPort}`)} />)
                }}
            />

            {ConfirmDialogComponent}

        </>
    );
}

export default Haulages;
