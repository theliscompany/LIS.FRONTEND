import { Skeleton, TableCell, TableRow } from "@mui/material"

const TableBodySkeleton = ({rows, columns}:{rows:number, columns:number}) => {
    return (
        Array.from({ length: rows }, (_, i) => i + 1).map((_, rowIndex) => (
            <TableRow key={`row-${rowIndex}`}>
              {Array.from({ length: columns }, (_, i) => i + 1).map((_, colIndex) => (
                <TableCell key={`cell-${rowIndex}-${colIndex}`}>
                  <Skeleton variant="text" animation="wave" />
                </TableCell>
              ))}
            </TableRow>
        ))
    )
}

export default TableBodySkeleton