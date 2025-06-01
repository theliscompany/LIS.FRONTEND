import { useQuery, useQueryClient } from "@tanstack/react-query"
import EditableTable from "../../components/common/EditableTable"
import { SeaFreightsViewModel } from "../../api/client/pricing"
import { useState } from "react"
import { getApiSeaFreightGetSeaFreightsOptions } from "../../api/client/pricing/@tanstack/react-query.gen"
import OffersSeafreight from "../../components/pricing/OffersSeafreight"
import { ColumnDef, createColumnHelper } from "@tanstack/react-table"
import { Box, Button, IconButton, Stack, TextField } from "@mui/material"
import Add from "@mui/icons-material/Add"
import Refresh from "@mui/icons-material/Refresh"
import ExpandMore from "@mui/icons-material/ExpandMore"
import ChevronRight from "@mui/icons-material/ChevronRight"
import EditSeafreight from "../../components/pricing/EditSeafreight"

const columnHelper = createColumnHelper<SeaFreightsViewModel>()

const Seafreights = () => {

    const [globalFilter, setGlobalFilter] = useState('')
    const [openEditSeafreight, setOpenEditSeafreight] = useState(false)
    
    const queryClient = useQueryClient()

    const { data: seaFreights, isLoading} = useQuery({
        ...getApiSeaFreightGetSeaFreightsOptions(),
        staleTime: Infinity
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

    const refreshSeaFreightTable = async () => {
        await queryClient.prefetchQuery({
            ...getApiSeaFreightGetSeaFreightsOptions()
        })
    }

    const handleOpenEditSeafreight = () => {
        setOpenEditSeafreight(true)
    }

    return (    
        <>
            <Stack direction='row' alignItems='center' justifyContent='space-between' mb={2}>
                <Box>
                    <Button variant='contained' sx={{mr:2}} startIcon={<Add />} size='small' onClick={handleOpenEditSeafreight}>
                        Add seafreight price
                    </Button>
                    <Button variant='outlined' startIcon={<Refresh />} size='small' onClick={refreshSeaFreightTable}>
                        Refresh
                    </Button>
                </Box>
                <TextField value={globalFilter ?? ''} onChange={(e) => setGlobalFilter(e.target.value)}
                    size='small' placeholder="Search seafreights..." />
            </Stack>
            <EditableTable<SeaFreightsViewModel> data={seaFreights ?? []} columns={columns} isLoading={isLoading} 
                globalFilter={globalFilter} onGlobalFilterChange={setGlobalFilter} rowCanExpand
                subComponent={OffersSeafreight} />

            {
                openEditSeafreight && <EditSeafreight open={openEditSeafreight} onClose={() => setOpenEditSeafreight(false)} />
            }
        </>
    )
}

export default Seafreights;
