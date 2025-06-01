import { ColumnDef, createColumnHelper } from "@tanstack/react-table"
import { MiscellaneousWithoutShipmentViewModel, ServiceViewModel } from "../../api/client/pricing"
import EditableTable from "../common/EditableTable"

const columnHelper = createColumnHelper<ServiceViewModel>()

const OffersMiscellaneousWithoutShipment = (miscellaneous: MiscellaneousWithoutShipmentViewModel) => {

    const columns: ColumnDef<ServiceViewModel, any>[] = [
        columnHelper.accessor('serviceName', {
            header: "Service",
            cell: ({ getValue}) => getValue<string | null | undefined>()
        }),
        columnHelper.accessor('price', {
            header: "Price",
            cell: ({ getValue}) => getValue<number | undefined>()
        })
    ]
    
    return (
        <EditableTable<ServiceViewModel> columns={columns} data={miscellaneous.services ?? []} />
    )
}

export default OffersMiscellaneousWithoutShipment