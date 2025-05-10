import {
    ColumnDef,
    flexRender,
    getCoreRowModel,
    getFilteredRowModel,
    useReactTable,
    FilterFn,
    CellContext,
  } from '@tanstack/react-table'
  import {
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
  } from '@mui/material'
  import TableBodySkeleton from '../skeletons/TableBodySkeleton'
  
  export interface ExtraCellContext {
    updateServiceData: (rowIndex: number, columnId: string, value: unknown) => void
  }
  
  interface Props<T> {
    data: T[]
    columns: ColumnDef<T, any>[]
    onUpdate: (rowIndex: number, columnId: string, value: unknown) => void
    isLoading?: boolean 
    globalFilter?: string
    onGlobalFilterChange?: (value: string) => void
    filterFn?: FilterFn<T>
  }
  
  const EditableTable = <T,>({
    data,
    columns,
    onUpdate,
    isLoading,
    globalFilter,
    onGlobalFilterChange,
    filterFn,
  }: Props<T>) => {
    const table = useReactTable({
      data,
      columns,
      getCoreRowModel: getCoreRowModel(),
      getFilteredRowModel: getFilteredRowModel(),
      state: {
        globalFilter,
      },
      globalFilterFn: filterFn,
      onGlobalFilterChange,
      meta: {
        updateServiceData: onUpdate,
      },
    })
  
    return (
      <TableContainer component={Paper}>
        <Table size="small">
          <TableHead>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableCell key={header.id} sx={{ fontWeight: 'bold',width:`${header.getSize()}px` }}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(header.column.columnDef.header, header.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableHead>
          <TableBody>
            {!isLoading ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, {
                        ...cell.getContext(),
                        updateServiceData: onUpdate,
                      } as CellContext<T, any> & ExtraCellContext)}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableBodySkeleton columns={columns.length} rows={5} />
            )}
          </TableBody>
        </Table>
      </TableContainer>
    )
  }
  
  export default EditableTable
  