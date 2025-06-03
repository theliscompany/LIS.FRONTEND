import { ColumnDef, createColumnHelper } from "@tanstack/react-table"
import { GroupedMiscellaneousViewModel, MiscellaneousBaseViewModel } from "../../api/client/pricing"
import EditableTable from "../common/EditableTable"
import { CheckCircle } from "@mui/icons-material"
import Checkbox from "@mui/material/Checkbox"
import { Link } from "react-router-dom"

const columnHelper = createColumnHelper<MiscellaneousBaseViewModel>()

type OffersMiscellaneousType = {
    miscellaneous: GroupedMiscellaneousViewModel,
    getRowsSelected?: (rows: MiscellaneousBaseViewModel[]) => void
}

const OffersMiscellaneous = ({miscellaneous, getRowsSelected}: OffersMiscellaneousType) => {

    const columns: ColumnDef<MiscellaneousBaseViewModel, any>[] = [
        columnHelper.display({
            id: 'select',
            header: ({table})=> (
                <Checkbox size="small"
                    {...{ 
                        checked: table.getIsAllRowsSelected(),
                        indeterminate: table.getIsSomeRowsSelected(),
                        onChange: table.getToggleAllRowsSelectedHandler()
                    }}/>
            ),
            cell: ({row}) => (
                <Checkbox size="small" 
                {...{
                    checked: row.getIsSelected(),
                    disabled: !row.getCanSelect(),
                    indeterminate: row.getIsSomeSelected(),
                    onChange: row.getToggleSelectedHandler()
                }} />
            )
        }),
        columnHelper.accessor('supplierName', {
            header: "Supplier",
            cell: ({ row, getValue}) => 
                <Link to={`/miscellaneous/${row.original.miscellaneousId}`} >
                    {getValue<string | null | undefined>()}
                </Link>
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
        <EditableTable<MiscellaneousBaseViewModel> columns={columns} data={miscellaneous.miscellaneousList ?? []} 
            enableRowSelection={true} getRowsSelected={getRowsSelected} />
    )
}

export default OffersMiscellaneous