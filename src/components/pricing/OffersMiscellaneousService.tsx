import { ColumnDef, createColumnHelper } from "@tanstack/react-table"
import { GroupedServiceMiscellaneousViewModel } from "../../api/client/pricing"
import EditableTable from "../common/EditableTable"
import OffersMiscellaneousSupplier from "./OffersMiscellaneousSupplier"
import IconButton from "@mui/material/IconButton"
import ExpandMore from "@mui/icons-material/ExpandMore"
import ChevronRight from "@mui/icons-material/ChevronRight"

const columnHelper = createColumnHelper<GroupedServiceMiscellaneousViewModel>()

const OffersMiscellaneousService = ({miscellaneous}: {miscellaneous:GroupedServiceMiscellaneousViewModel[]}) => {

    const columns: ColumnDef<GroupedServiceMiscellaneousViewModel, any>[] = [
        columnHelper.accessor('serviceName', {
            header: "Service",
            cell: ({ row, getValue}) => <>
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
        })
    ]
    
    return (
        <EditableTable<GroupedServiceMiscellaneousViewModel> columns={columns} data={miscellaneous ?? []} rowCanExpand
            subComponent={(row: GroupedServiceMiscellaneousViewModel)=><OffersMiscellaneousSupplier suppliers={row.suppliers ?? []} />} />
    )
}

export default OffersMiscellaneousService