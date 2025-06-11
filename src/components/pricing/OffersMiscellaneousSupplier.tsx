import { ColumnDef, createColumnHelper } from "@tanstack/react-table";
import { GroupedSupplierMiscellaneousViewModel } from "../../api/client/pricing";
import Checkbox from "@mui/material/Checkbox";
import EditableTable from "../common/EditableTable";
import { useQuery } from "@tanstack/react-query";
import { getPackageOptions } from "../../api/client/masterdata/@tanstack/react-query.gen";
import { useEffect, useState } from "react";
import { Currency } from "../../utils/constants";
import { Link } from "react-router-dom";

const columnHelper = createColumnHelper<GroupedSupplierMiscellaneousViewModel>()

const OffersMiscellaneousSupplier = ({suppliers}:{suppliers: GroupedSupplierMiscellaneousViewModel[]}) => {


    const [columns, setColumns] = useState<ColumnDef<GroupedSupplierMiscellaneousViewModel, any>[]>([
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
    ])

    const {data: containers} = useQuery({
        ...getPackageOptions({
            query:{
                containerOnly: true
            }
        }),
        staleTime: Infinity
    })

    useEffect(() => {
        if(containers){
            const _columns: ColumnDef<GroupedSupplierMiscellaneousViewModel, any>[] = []
            containers?.map(item=> {
                _columns.push(columnHelper.display({
                        id: `${item.packageName}`,
                        header: `${item.packageName}`,
                        cell: ({row}) => {
                            const containersPrice = row.original.containers
                            if(item.packageId && containersPrice && item.packageId in containersPrice){
                                return `${containersPrice[item.packageId]} ${row.original.currency ? Currency[row.original.currency] : '€'}`
                            }
                        }
                    }))
            })

            _columns.push(columnHelper.accessor('validUntil', {
                header: "Valid until",
                cell: ({getValue}) => {
                    const value = getValue<Date | undefined>()
                    if(value){
                        const dateString = String(getValue<Date | undefined>())
                        const date = new Date(dateString)

                        return `${date.getDate().toString().padStart(2,'0')}/${(date.getMonth()+1).toString().padStart(2,'0')}/${date.getFullYear()}`
                    }
                    
                }
            }))

            _columns.push(columnHelper.accessor('created', {
                header: "Created",
                cell: ({getValue}) => {
                    const value = getValue<Date | undefined>()
                    if(value){
                        const dateString = String(getValue<Date | undefined>())
                        const date = new Date(dateString)

                        return `${date.getDate().toString().padStart(2,'0')}/${(date.getMonth()+1).toString().padStart(2,'0')}/${date.getFullYear()}`
                    }
                    
                }
            }))

            setColumns([...columns,..._columns])
        }
        
    }, [containers])
    
    return (
        <EditableTable<GroupedSupplierMiscellaneousViewModel> columns={columns} data={suppliers} />
    )
}

export default OffersMiscellaneousSupplier;