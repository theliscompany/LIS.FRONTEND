import { ColumnDef, createColumnHelper } from "@tanstack/react-table";
import { HaulageGridGetViewModel, HaulageSupplierViewModel } from "../../api/client/pricing";
import { Chip, Stack } from "@mui/material";
import EditableTable from "../common/EditableTable";
import { Currency } from "../../utils/constants";

const columnHelper = createColumnHelper<HaulageSupplierViewModel>()

const OffersHauliers = (haulage: HaulageGridGetViewModel) => {

    const columns: ColumnDef<HaulageSupplierViewModel, any>[] = [
        columnHelper.accessor('haulierName', {
            header: "Haulier",
            cell: ({ getValue}) => getValue<string | null | undefined>()
        }),
        columnHelper.accessor('unitTariff', {
            header: "Per unit",
            cell: ({row, getValue}) => {
                const _currency = row.original.currency

                return `${getValue<number | undefined>()} ${_currency ? Currency[_currency] : '€'}`
            }
        }),
        columnHelper.accessor('freeTime', {
            header: "Free time",
            cell: ({getValue}) => `${getValue<number | undefined>()} hours`
        }),
        columnHelper.accessor('overtimeTariff', {
            header: "Overtime",
            cell: ({row, getValue}) => {
                const _currency = row.original.currency

                return `${getValue<number | undefined>()} ${_currency ? Currency[_currency] : '€'} / hour`
            }
        }),
        columnHelper.accessor('multiStop', {
            header: "Multi stop",
            cell: ({row, getValue}) => {
                const _currency = row.original.currency

                return `${getValue<number | undefined>()} ${_currency ? Currency[_currency] : '€'}`
            }
        }),
        columnHelper.accessor('containersType', {
            header: "Containers",
            cell: ({getValue}) => {
                const value = getValue<string[] | null | undefined>()
                return value ? <Stack direction="row" spacing={1}>
                    {
                        value.map((container:string, index:number)=> (
                            <Chip key={index} label={container} variant="outlined" size="small" sx={{px:1}} />))
                    }
                    </Stack> : ''
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
        <EditableTable<HaulageSupplierViewModel> columns={columns} data={haulage.hauliers ?? []} />
    )
}

export default OffersHauliers;