import { ColumnDef, createColumnHelper } from "@tanstack/react-table"
import { SeaFreightsViewModel, SupplierSeaFreightViewModel } from '@features/pricing/api'
import EditableTable from '@components/common/EditableTable'
import Checkbox from "@mui/material/Checkbox"
import { Link } from "react-router-dom"

const columnHelper = createColumnHelper<SupplierSeaFreightViewModel>()

type OffersSuppliersType = {
    seafreight: SeaFreightsViewModel,
    getRowsSelected?: (rows: SupplierSeaFreightViewModel[]) => void
}

const OffersSeafreight = ({seafreight, getRowsSelected}:OffersSuppliersType) => {

    const columns: ColumnDef<SupplierSeaFreightViewModel, any>[] = [
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
        columnHelper.accessor('carrierAgentName', {
            header: "Carrier agent",
            cell: ({ row, getValue}) => 
                <Link to={`/seafreight/${row.original.seaFreightId}`} >
                    {getValue<string | null | undefined>()}
                </Link>
        }),
        columnHelper.accessor('frequency', {
            header: "Frequency",
            cell: ({getValue}) => `Every ${getValue<number | undefined>()} days`
        }),
        columnHelper.accessor('transitTime', {
            header: "Transit time",
            cell: ({getValue}) => `${getValue<number | null | undefined>()} days`
        }),
        columnHelper.accessor('total20Dry', {
            header: "20' Dry",
            cell: ({getValue}) => `${getValue<number | undefined>()} €`
        }),
        columnHelper.accessor('total40Dry', {
            header: "40' Dry",
            cell: ({getValue}) => `${getValue<number | undefined>()} €`
        }),
        columnHelper.accessor('total20HCRF', {
            header: "20' HCRF",
            cell: ({getValue}) => `${getValue<number | undefined>()} €`
        }),
        columnHelper.accessor('total40HC', {
            header: "40' HC",
            cell: ({getValue}) => `${getValue<number | undefined>()} €`
        }),
        columnHelper.accessor('total20RF', {
            header: "40' RF",
            cell: ({getValue}) => `${getValue<number | undefined>()} €`
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
        <EditableTable<SupplierSeaFreightViewModel> columns={columns} data={seafreight.suppliers ?? []} 
            enableRowSelection={true} getRowsSelected={getRowsSelected} />
    )
}

export default OffersSeafreight