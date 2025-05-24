import { ColumnDef, createColumnHelper } from "@tanstack/react-table"
import { SeaFreightsViewModel, SupplierSeaFreightViewModel } from "../../api/client/pricing"
import EditableTable from "../common/EditableTable"

const columnHelper = createColumnHelper<SupplierSeaFreightViewModel>()

const OffersSeafreight = (seafreight:SeaFreightsViewModel) => {

    const columns: ColumnDef<SupplierSeaFreightViewModel, any>[] = [
        columnHelper.accessor('carrierAgentName', {
            header: "Carrier agent",
            cell: ({ getValue}) => getValue<string | null | undefined>()
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
        <EditableTable<SupplierSeaFreightViewModel> columns={columns} data={seafreight.suppliers ?? []} />
    )
}

export default OffersSeafreight