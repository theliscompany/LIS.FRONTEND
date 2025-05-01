import { Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from "@mui/material"
import { flexRender } from "@tanstack/react-table"
import { Fragment } from "react"
import { OrdersListDto, OrderStatusEnum } from "../../api/client/shipment";

type ShipmentsListProps = {
    table: import("@tanstack/table-core").Table<OrdersListDto>;
    getTextColor: (orderStatus?: OrderStatusEnum) => string;
}
const ShipmentsList = ({ table, getTextColor }: ShipmentsListProps) => {

    return (
        <TableContainer component={Paper}>
            <Table id="ordersTable" aria-label="Orders table" size='small' {
                ...{
                    style: {
                        width: `${table.getCenterTotalSize()}px`,
                    },
                }
            }>
                <TableHead>
                    {
                        table.getHeaderGroups().map(headerGroup => (
                            <TableRow key={headerGroup.id} >
                                {
                                    headerGroup.headers.map(header => (
                                        <TableCell key={header.id} colSpan={header.colSpan}
                                            style={{ width: `${header.getSize()}px` }} sx={{ fontWeight: "bold" }}>
                                            {header.isPlaceholder ? null :
                                                flexRender(
                                                    header.column.columnDef.header,
                                                    header.getContext())
                                            }
                                        </TableCell>
                                    ))
                                }
                            </TableRow>
                        ))
                    }
                </TableHead>
                <TableBody>
                    {
                        table.getRowModel().rows.map(row => (
                            <Fragment key={row.id}>
                                <TableRow>
                                    {
                                        row.getVisibleCells().map(cell => (
                                            <TableCell key={cell.id} sx={{ fontSize: '0.75rem', color: getTextColor(row.original.orderStatus) }} >
                                                {flexRender(
                                                    cell.column.columnDef.cell,
                                                    cell.getContext())}
                                            </TableCell>
                                        ))
                                    }
                                </TableRow>
                            </Fragment>

                        ))
                    }
                </TableBody>
            </Table>
        </TableContainer>
    )
}

export default ShipmentsList