import Add from "@mui/icons-material/Add";
import Refresh from "@mui/icons-material/Refresh";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { getApiMiscellaneousMiscellaneousWithShipmentOptions } from "../../api/client/pricing/@tanstack/react-query.gen";
import EditableTable from "../../components/common/EditableTable";
import { ColumnDef, createColumnHelper } from "@tanstack/react-table";
import IconButton from "@mui/material/IconButton";
import ExpandMore from "@mui/icons-material/ExpandMore";
import ChevronRight from "@mui/icons-material/ChevronRight";
import OffersMiscellaneous from "../../components/pricing/OffersMiscellaneous";
import Grid from '@mui/material/Grid2'
import { MiscellaneousWithShipmentViewModel } from "../../api/client/pricing";

const columnHelper = createColumnHelper<MiscellaneousWithShipmentViewModel>()
// const columnWithoutShipmentHelper = createColumnHelper<MiscellaneousSupplierViewModel>()

function Miscellaneous() {
    const [globalFilter, setGlobalFilter] = useState('')

    const { data: miscellaneousWithShipment, isLoading:isLoadingWithShipment} = useQuery({
        ...getApiMiscellaneousMiscellaneousWithShipmentOptions()
    })

    // const { data: miscellaneousWithoutShipment, isLoading: isLoadingWithoutShipment } = useQuery({
    //     ...getApiMiscellaneousMiscellaneousWithoutShipmentOptions()
    // })

    const columns: ColumnDef<MiscellaneousWithShipmentViewModel, any>[] = [
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
    
    return (
        <>
            <Stack direction='row' alignItems='center' justifyContent='space-between' mb={2}>
                <Box>
                    <Button variant='contained' sx={{mr:2}} startIcon={<Add />} size='small'>
                        Add miscellaneous price
                    </Button>
                    <Button variant='outlined' startIcon={<Refresh />} size='small'>
                        Refresh
                    </Button>
                </Box>
                <TextField value={globalFilter ?? ''} onChange={(e) => setGlobalFilter(e.target.value)}
                    size='small' placeholder="Search miscellaneous..." />
            </Stack>
            <Grid container spacing={2}>
                <Grid size={6}>
                    <EditableTable<MiscellaneousWithShipmentViewModel> data={miscellaneousWithShipment ?? []} columns={columns} isLoading={isLoadingWithShipment} 
                        globalFilter={globalFilter} onGlobalFilterChange={setGlobalFilter} rowCanExpand
                        subComponent={OffersMiscellaneous} />
                </Grid>
            </Grid>
            
        </>
        
    );
}

export default Miscellaneous;
