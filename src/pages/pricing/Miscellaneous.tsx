import Add from "@mui/icons-material/Add";
import Refresh from "@mui/icons-material/Refresh";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback, useEffect, useMemo, useState } from "react";
import EditableTable from "../../components/common/EditableTable";
import { ColumnDef, createColumnHelper, Row } from "@tanstack/react-table";
import IconButton from "@mui/material/IconButton";
import ExpandMore from "@mui/icons-material/ExpandMore";
import ChevronRight from "@mui/icons-material/ChevronRight";
import OffersMiscellaneousService from "../../components/pricing/OffersMiscellaneousService";
import { GroupedMiscellaneousViewModel, GroupedServiceMiscellaneousViewModel } from "../../api/client/pricing";
import { deleteApiMiscellaneousDeleteMiscellaneousMutation, getApiMiscellaneousMiscellaneousByPortsOptions, getApiMiscellaneousMiscellaneousOptions, getApiMiscellaneousMiscellaneousQueryKey } from "../../api/client/pricing/@tanstack/react-query.gen";
import Typography from "@mui/material/Typography";
import Divider from "@mui/material/Divider";
import ButtonGroup from "@mui/material/ButtonGroup";
import { Link } from "react-router-dom";
import { DeleteForever } from "@mui/icons-material";
import { useConfirmDialog } from "../../hooks/useConfirmDialog";
import { showSnackbar } from "../../components/common/Snackbar";
import Breadcrumbs from "@mui/material/Breadcrumbs";
import Tabs from "@mui/material/Tabs";
import { Box, Tab } from "@mui/material";
import GeneralMiscellaneous from "../../components/pricing/GeneralMiscellaneous";

const columnHelper = createColumnHelper<GroupedMiscellaneousViewModel>()

function Miscellaneous() {
    const [tabValue, setTabValue] = useState(0)
    const [globalFilter, setGlobalFilter] = useState('')
    const [miscellaneousList, setMiscellaneousList] = useState<GroupedMiscellaneousViewModel[]>([])
    const [deleting, setDeleting] = useState(false)
    const [allSelectedMiscelllaneousIds, setAllSelectedMiscelllaneousIds] = useState<Record<string, string[]>>({})
    const [miscellaneousServices, setMiscellaneousServices] = useState<GroupedServiceMiscellaneousViewModel[]>([])

    const uniqueSelectedIds = useMemo(() => {
        return Array.from(new Set(Object.values(allSelectedMiscelllaneousIds).flat()))
    }, [allSelectedMiscelllaneousIds])

    const queryClient = useQueryClient();

    const { confirm, ConfirmDialogComponent } = useConfirmDialog();

    const miscellaneousServicesFn = useCallback(
      () => <OffersMiscellaneousService miscellaneous={miscellaneousServices} />,
      [miscellaneousServices],
    )
    

    const { data, isFetching} = useQuery({
        ...getApiMiscellaneousMiscellaneousOptions(),
        staleTime: Infinity
    })

    useEffect(() => {
      const miscList = data?.sort((a, b) => a.departurePortName?.localeCompare(b.departurePortName ?? "") ?? -1) ?? [];
      setMiscellaneousList(miscList);
    }, [data])

    const mutationDelete = useMutation({
        ...deleteApiMiscellaneousDeleteMiscellaneousMutation(),
        onSuccess: () => showSnackbar("Deleted with success", "success"),
        onError: () => showSnackbar('An error occurred', "warning"),
        onSettled: () => {
            setDeleting(false)
            setAllSelectedMiscelllaneousIds({})
            queryClient.invalidateQueries({ queryKey: getApiMiscellaneousMiscellaneousQueryKey() });
        }
    })
    
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
    
    const handleRefreshMiscellaneousTable = async () => {
        await queryClient.prefetchQuery({
            ...getApiMiscellaneousMiscellaneousOptions(),
        })
    }

    const handleDeleteMiscellaneous = async () => {
        const confirmResult = await confirm(
            'Delete haulages',
            `Are you sure you want to delete ${uniqueSelectedIds.length} miscellaneous? This action cannot be undone.`
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

    const handleGetRowExpanded = (row?: Row<GroupedMiscellaneousViewModel>) => {
        getMiscellaneousServices(row?.original.departurePortId ?? undefined, row?.original.destinationPortId ?? undefined)
    }

    const getMiscellaneousServices = async (departureId?: number, destinationId?: number) => {
        if(departureId && destinationId){
            const data = await queryClient.ensureQueryData({
                ...getApiMiscellaneousMiscellaneousByPortsOptions({
                    path:{
                        departurePortId: departureId,
                        destinationPortId: destinationId
                    }
                })
            })

            setMiscellaneousServices(data)
        }
        
    }

    const handleChangeTab = (_:any, newValue: number) => {
        setTabValue(newValue)
    }
    
    return (
        <>
            <Breadcrumbs separator={<ChevronRight fontSize='small' />} aria-label="breadcrumb">
                <Typography key="3" sx={{ color: 'text.primary' }}>
                    Miscellaneous
                </Typography>
            </Breadcrumbs>
            <Divider sx={{ mb: 1 }} />
            <Stack direction='row' alignItems='center' justifyContent='space-between' mb={1}>
                <ButtonGroup color='info' variant='text' size='small' aria-label='text button group'>
                    <Button startIcon={<Add />} to='/miscellaneous' component={Link}>
                        New
                    </Button>
                    <Button disabled={uniqueSelectedIds.length === 0} startIcon={<DeleteForever />} onClick={handleDeleteMiscellaneous} loading={deleting}>
                        Delete
                    </Button>
                    <Button startIcon={<Refresh />} onClick={handleRefreshMiscellaneousTable}>
                        Refresh
                    </Button>
                </ButtonGroup>
                <TextField value={globalFilter ?? ''} onChange={(e) => setGlobalFilter(e.target.value)}
                    size='small' placeholder="Search miscellaneous..." />
            </Stack>
            
            <Tabs value={tabValue} onChange={handleChangeTab}>
                <Tab label="By Shipments"  />
                <Tab label="General" />
            </Tabs>
            {
                tabValue === 0 && 
                <Box sx={{mt:2}}>
                    <EditableTable<GroupedMiscellaneousViewModel> data={miscellaneousList} columns={columns} isLoading={isFetching} 
                        globalFilter={globalFilter} onGlobalFilterChange={setGlobalFilter} rowCanExpand
                        subComponent={()=>miscellaneousServicesFn()} getRowExpanded={handleGetRowExpanded}/>
                </Box>
            }
            {
                tabValue === 1 && 
                <Box sx={{mt:2}}>
                    <GeneralMiscellaneous />
                </Box>
            }
            { ConfirmDialogComponent }
        </>
        
    );
}

export default Miscellaneous;
