import { useState } from 'react';
import { Box, Button, IconButton, Stack, TextField } from '@mui/material';
import { Add, ChevronRight, ExpandMore, Refresh } from '@mui/icons-material';
import { ColumnDef, createColumnHelper } from '@tanstack/react-table';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { getApiHaulageHaulagesOptions } from '../../api/client/pricing/@tanstack/react-query.gen';
import EditableTable from '../../components/common/EditableTable';
import { HaulageGridGetViewModel, HaulageSupplierViewModel } from '../../api/client/pricing';
import OffersHauliers from '../../components/pricing/OffersHauliers';
import EditHaulage from '../../components/pricing/EditHaulage';

const columnHelper = createColumnHelper<HaulageGridGetViewModel>()

function Haulages() {

    const [globalFilter, setGlobalFilter] = useState('')
    const [openEditHaulage, setOpenEditHaulage] = useState(false)
    const [haulageId, setHaulageId] = useState<string>()

    const queryClient = useQueryClient()

    const { data: haulages, isLoading} = useQuery({
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
                <span style={{marginLeft:2}}>{ getValue<string | null>() }</span>
            </>
        }),
        columnHelper.accessor('loadingPort', {
            header: "Loading port",
            cell: ({getValue}) => getValue<string | null>()
        })
    ]

    const handleOpenEditHaulage = () => {
        setHaulageId(undefined)
        setOpenEditHaulage(true)
    }

    const handleEditHaulage = (row: HaulageSupplierViewModel) => {
        setHaulageId(row.haulageId)
        setOpenEditHaulage(true)
    }
    
    return (
        <>
            <Stack direction='row' alignItems='center' justifyContent='space-between' mb={2}>
                <Box>
                    <Button variant='contained' sx={{mr:2}} startIcon={<Add />} size='small' onClick={handleOpenEditHaulage}>
                        Add haulage price
                    </Button>
                    <Button variant='outlined' startIcon={<Refresh />} size='small' onClick={refeshHaulages}>
                        Refresh
                    </Button>
                </Box>
                <TextField value={globalFilter ?? ''} onChange={(e) => setGlobalFilter(e.target.value)}
                    size='small' placeholder="Search haulages..." />
            </Stack>

            <EditableTable<HaulageGridGetViewModel> data={haulages ?? []} columns={columns} isLoading={isLoading} 
                globalFilter={globalFilter} onGlobalFilterChange={setGlobalFilter} rowCanExpand
                subComponent={(row: HaulageGridGetViewModel) =><OffersHauliers haulage={row} getHaulageId={handleEditHaulage} />} />

            {
                openEditHaulage && <EditHaulage open={openEditHaulage} onClose={() => setOpenEditHaulage(false)} haulageId={haulageId} />
            }
        </>
    );
}

export default Haulages;
