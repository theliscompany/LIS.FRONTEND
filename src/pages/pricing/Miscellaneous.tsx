import Add from "@mui/icons-material/Add";
import Refresh from "@mui/icons-material/Refresh";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import EditableTable from "../../components/common/EditableTable";
import { ColumnDef, createColumnHelper } from "@tanstack/react-table";
import IconButton from "@mui/material/IconButton";
import ExpandMore from "@mui/icons-material/ExpandMore";
import ChevronRight from "@mui/icons-material/ChevronRight";
import OffersMiscellaneous from "../../components/pricing/OffersMiscellaneous";
import EditMiscellaneous from "../../components/pricing/EditMiscellaneous";
import { GroupedMiscellaneousViewModel } from "../../api/client/pricing";
import { getApiMiscellaneousMiscellaneousOptions } from "../../api/client/pricing/@tanstack/react-query.gen";

const columnHelper = createColumnHelper<GroupedMiscellaneousViewModel>()

function Miscellaneous() {
    const [globalFilter, setGlobalFilter] = useState('')
    const [miscellaneousId, setMiscellaneousId] = useState<string>()
    const [openEditMiscellaneous, setOpenEditMiscellaneous] = useState(false)
    const [miscellaneousList, setMiscellaneousList] = useState<GroupedMiscellaneousViewModel[]>([])

    const queryClient = useQueryClient();

    const { data, isFetching} = useQuery({
        ...getApiMiscellaneousMiscellaneousOptions(),
        staleTime: Infinity
    })

    useEffect(() => {
      const miscList = data?.sort((a, b) => a.departurePortName?.localeCompare(b.departurePortName ?? "") ?? -1) ?? [];
      setMiscellaneousList(miscList);
    }, [data])
    
    const columns: ColumnDef<GroupedMiscellaneousViewModel, any>[] = [
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

    const handleOpenEditMiscellaneous = () => {
        setMiscellaneousId(undefined)
        setOpenEditMiscellaneous(true)
    }
    
    const handleRefreshMiscellaneousTable = async () => {
        await queryClient.prefetchQuery({
            ...getApiMiscellaneousMiscellaneousOptions(),
        })
    }
    return (
        <>
            <Stack direction='row' alignItems='center' justifyContent='space-between' mb={2}>
                <Box>
                    <Button variant='contained' sx={{mr:2}} onClick={handleOpenEditMiscellaneous} startIcon={<Add />} size='small'>
                        Add miscellaneous
                    </Button>
                    <Button variant='outlined' onClick={handleRefreshMiscellaneousTable} startIcon={<Refresh />} size='small'>
                        Refresh
                    </Button>
                </Box>
                <TextField value={globalFilter ?? ''} onChange={(e) => setGlobalFilter(e.target.value)}
                    size='small' placeholder="Search miscellaneous..." />
            </Stack>
            <EditableTable<GroupedMiscellaneousViewModel> data={miscellaneousList} columns={columns} isLoading={isFetching} 
                        globalFilter={globalFilter} onGlobalFilterChange={setGlobalFilter} rowCanExpand
                        subComponent={OffersMiscellaneous} />
            {
                openEditMiscellaneous && <EditMiscellaneous open={openEditMiscellaneous} onClose={() => setOpenEditMiscellaneous(false)} miscellaneousId={miscellaneousId} />
            }
        </>
        
    );
}

export default Miscellaneous;
