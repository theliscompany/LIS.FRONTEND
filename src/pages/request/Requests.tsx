import Add from "@mui/icons-material/Add";
import ChevronRight from "@mui/icons-material/ChevronRight";
import Refresh from "@mui/icons-material/Refresh";
import Breadcrumbs from "@mui/material/Breadcrumbs";
import Button from "@mui/material/Button";
import ButtonGroup from "@mui/material/ButtonGroup";
import Divider from "@mui/material/Divider";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import { ColumnDef, createColumnHelper } from "@tanstack/react-table";
import { useState } from "react";
import { Link } from "react-router-dom";
import { RequestQuoteBaseViewModel, StatusEnum } from "../../api/client/quote";
import Chip from "@mui/material/Chip";
import { useQuery } from "@tanstack/react-query";
import { getApiRequestOptions } from "../../api/client/quote/@tanstack/react-query.gen";
import EditableTable from "../../components/common/EditableTable";
import { Autorenew, Block, DoneAll, NewReleases, RemoveCircle } from "@mui/icons-material";
import { styled } from "@mui/material/styles";

const columnHelper = createColumnHelper<RequestQuoteBaseViewModel>()

const RotatingIcon = styled(Autorenew)`
  animation: spin 1s linear infinite;
  @keyframes spin {
    100% { transform: rotate(360deg); }
  }
`;

const Requests = () => {
    const [globalFilter, setGlobalFilter] = useState('')

    const {data, isLoading, refetch} = useQuery({
        ...getApiRequestOptions(),
        staleTime: Infinity
    })

    const columns: ColumnDef<RequestQuoteBaseViewModel, any>[] = [
        columnHelper.accessor('status', {
            header: "Status",
            cell: ({ getValue }) => {
                let label, color = 'info', icon = <NewReleases />;

                switch(getValue<StatusEnum | undefined>()){
                    case StatusEnum.PENDING:
                        label = "PENDING";
                        color = "warning"
                        icon = <RotatingIcon />
                        break;
                    case StatusEnum.BLOCKED:
                        label = "BLOCKED";
                        color = "error"
                        icon = <Block />
                        break;
                    case StatusEnum.REJECT:
                        label = "REJECTED";
                        color = "error"
                        icon = <RemoveCircle />
                        break;
                    case StatusEnum.VALID:
                        label = "VALIDED";
                        color = "success"
                        icon = <DoneAll />
                        break;
                    default:
                        label = "NEW"
                        break;
                }
                return <Chip icon={icon} size="small" label={label} variant="outlined" 
                    color={color as "default" | "primary" | "secondary" | "error" | "info" | "success" | "warning"} />
            }
        }),
         columnHelper.accessor('trackingNumber', {
            header: "Quote number",
            cell: ({ row, getValue }) => 
                <Link to={`/request/${row.original.requestQuoteId}`}>
                    {getValue<string | null | undefined>()}
                </Link>
        }),
        columnHelper.accessor('customerName', {
            header: "Customer",
            cell: ({ getValue }) => getValue<string | null | undefined>()
        }),
        columnHelper.accessor('departure', {
            header: "Departure",
            cell: ({ getValue }) => getValue<string | null | undefined>()
        }),
        columnHelper.accessor('arrival', {
            header: "Arrival",
            cell: ({ getValue }) => getValue<string | null | undefined>()
        }),
        columnHelper.accessor('assigneeName', {
            header: "Assignee",
            cell: ({ getValue }) => getValue<string | null | undefined>()
        }),
        columnHelper.accessor('created', {
            header: "Created",
            cell: ({ getValue }) => {
                const value = getValue<Date | undefined>()
                if(value){
                    const dateString = String(getValue<Date | undefined>())
                    const date = new Date(dateString)

                    return `${date.getDate().toString().padStart(2,'0')}/${(date.getMonth()+1).toString().padStart(2,'0')}/${date.getFullYear()}`
                }
            }
        })
    ]
    
    return (
        <>
            <Breadcrumbs separator={<ChevronRight fontSize='small' />} aria-label="breadcrumb">
                <Typography key="3" sx={{ color: 'text.primary' }}>
                    Request quotes
                </Typography>
            </Breadcrumbs>
            <Divider sx={{ mb: 1 }} />

            <Stack direction='row' alignItems='center' justifyContent='space-between' mb={1}>
                <ButtonGroup color='info' variant='text' size='small' aria-label='text button group'>
                    <Button startIcon={<Add />} to='/request' component={Link}>
                        New
                    </Button>
                    {/* <Button disabled={uniqueSelectedIds.length === 0} startIcon={<DeleteForever />} onClick={handleDeleteHaulages} loading={deleting}>
                        Delete
                    </Button> */}
                    <Button startIcon={<Refresh />} onClick={()=>refetch()}>
                        Refresh
                    </Button>
                </ButtonGroup>
                <TextField value={globalFilter ?? ''} onChange={(e) => setGlobalFilter(e.target.value)}
                    size='small' placeholder="Search request..." />
            </Stack>

            <Divider sx={{ mb: 2 }} />

            <EditableTable<RequestQuoteBaseViewModel> data={data ?? []} columns={columns} isLoading={isLoading} 
                globalFilter={globalFilter} onGlobalFilterChange={setGlobalFilter} />
        </>
    )
}

export default Requests;