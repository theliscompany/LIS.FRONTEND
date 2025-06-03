import { ColumnDef, createColumnHelper } from "@tanstack/react-table";
import { HaulageGridGetViewModel, HaulageSupplierViewModel } from "../../api/client/pricing";
import { Checkbox, Chip, Stack } from "@mui/material";
import EditableTable from "../common/EditableTable";
import { Currency } from "../../utils/constants";
import { Link } from "react-router-dom";

const columnHelper = createColumnHelper<HaulageSupplierViewModel>()

type OffersHauliersType = {
    haulage: HaulageGridGetViewModel,
    getRowsSelected?: (rows: HaulageSupplierViewModel[]) => void
}
const OffersHauliers = ({haulage, getRowsSelected}: OffersHauliersType) => {

    const columns: ColumnDef<HaulageSupplierViewModel, any>[] = [
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
        columnHelper.accessor('haulierName', {
            header: "Haulier",
            cell: ({ row, getValue}) => 
                <Link to={`/haulage/${row.original.haulageId}`}>
                    {getValue<string | null | undefined>()}
                </Link>
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
        <EditableTable<HaulageSupplierViewModel> columns={columns} data={haulage.hauliers ?? []} 
         enableRowSelection={true}
      getRowsSelected={getRowsSelected} />
    )
}

export default OffersHauliers;