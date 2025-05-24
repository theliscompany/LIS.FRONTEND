import { ColumnDef, createColumnHelper } from "@tanstack/react-table"
import { MiscellaneousSupplierViewModel, MiscellaneousWithShipmentViewModel } from "../../api/client/pricing"
import EditableTable from "../common/EditableTable"

const columnHelper = createColumnHelper<MiscellaneousSupplierViewModel>()

const OffersMiscellaneous = (miscellaneous: MiscellaneousWithShipmentViewModel) => {

    const columns: ColumnDef<MiscellaneousSupplierViewModel, any>[] = [
        columnHelper.accessor('supplierName', {
            header: "Supplier",
            cell: ({ getValue}) => getValue<string | null | undefined>()
        }),
        columnHelper.accessor('validUntil', {
            header: "Valid until",
            cell: ({getValue}) => {
                const value = getValue<Date | undefined>()
                if(value){
                    const dateString = String(getValue<Date | undefined>())
                    const date = new Date(dateString)

                    return `${date.getDate().toString().padStart(2,'0')}/${(date.getMonth()+1).toString().padStart(2,'0')}/${date.getFullYear()}`
                }
                
            }
        }),
        columnHelper.accessor('created', {
            header: "Created",
            cell: ({getValue}) => {
                const value = getValue<Date | undefined>()
                if(value){
                    const dateString = String(getValue<Date | undefined>())
                    const date = new Date(dateString)

                    return `${date.getDate().toString().padStart(2,'0')}/${(date.getMonth()+1).toString().padStart(2,'0')}/${date.getFullYear()}`
                }
            }
        }),
    ]
    
    return (
        <EditableTable<MiscellaneousSupplierViewModel> columns={columns} data={miscellaneous.suppliers ?? []} />
    )
}

export default OffersMiscellaneous