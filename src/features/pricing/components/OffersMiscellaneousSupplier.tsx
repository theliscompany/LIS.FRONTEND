import { createColumnHelper } from "@tanstack/react-table";
import { GroupedSupplierMiscellaneousViewModel } from '@features/pricing/api';
import Checkbox from "@mui/material/Checkbox";
import EditableTable from '@components/common/EditableTable';
import { Currency } from '@utils/constants';
import { Link } from "react-router-dom";

const columnHelper = createColumnHelper<GroupedSupplierMiscellaneousViewModel>()

const OffersMiscellaneousSupplier = ({suppliers}:{suppliers: GroupedSupplierMiscellaneousViewModel[]}) => {


    const columns = [
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
                <Link to={`/miscellaneous/${row.original.miscellaneousId}`}>
                    {getValue<string | null | undefined>()}
                </Link>
        }),
        columnHelper.accessor('container20', {
            header: "20'",
            cell: ({ row, getValue}) => `${getValue() ?? 0} ${row.original.currency ? Currency[row.original.currency] : '€'}`
        }),
        columnHelper.accessor('container40', {
            header: "40'",
            cell: ({ row, getValue}) => `${getValue() ?? 0} ${row.original.currency ? Currency[row.original.currency] : '€'}`
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
        })
    ]
    
    return (
        <EditableTable<GroupedSupplierMiscellaneousViewModel> columns={columns} data={suppliers} />
    )
}

export default OffersMiscellaneousSupplier;