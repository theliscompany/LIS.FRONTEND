import { ColumnDef, createColumnHelper } from "@tanstack/react-table"
import { GroupedMiscellaneousViewModel, MiscellaneousBaseViewModel } from "../../api/client/pricing"
import EditableTable from "../common/EditableTable"
import { Check, CheckCircle } from "@mui/icons-material"

const columnHelper = createColumnHelper<MiscellaneousBaseViewModel>()

const OffersMiscellaneous = (miscellaneous: GroupedMiscellaneousViewModel) => {

    const columns: ColumnDef<MiscellaneousBaseViewModel, any>[] = [
        columnHelper.accessor('supplierName', {
            header: "Supplier",
            cell: ({ getValue}) => getValue<string | null | undefined>()
        }),
        columnHelper.accessor('container20', {
            header: "20'",
            cell: ({ getValue}) => {
                if(getValue<boolean | null | undefined>()){
                    return <CheckCircle fontSize="small" color="success" />
                }
            }
        }),
        columnHelper.accessor('container40', {
            header: "40'",
            cell: ({ getValue}) => {
                if(getValue<boolean | null | undefined>()){
                    return <CheckCircle fontSize="small" color="success" />
                }
            }
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
        <EditableTable<MiscellaneousBaseViewModel> columns={columns} data={miscellaneous.miscellaneousList ?? []} />
    )
}

export default OffersMiscellaneous