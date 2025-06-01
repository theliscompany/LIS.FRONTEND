import {
    ColumnDef,
    flexRender,
    getCoreRowModel,
    getFilteredRowModel,
    useReactTable,
    FilterFn,
    CellContext,
    getExpandedRowModel,
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
  import { rankItem } from '@tanstack/match-sorter-utils'
import { Fragment } from 'react/jsx-runtime'
  
  export interface ExtraCellContext {
    updateServiceData: (rowIndex: number, columnId: string, value: unknown) => void
  }
  
  interface Props<T> {
    data: T[]
    columns: ColumnDef<T, any>[]
    rowCanExpand?: boolean
    isLoading?: boolean 
    globalFilter?: string
    onUpdate?: (rowIndex: number, columnId: string, value: unknown) => void
    onGlobalFilterChange?: (value: string) => void
    dbClick?: (row: T) => void
    subComponent?: (row: T) => JSX.Element
  }
  
  const EditableTable = <T,>({
    data,
    columns,
    rowCanExpand,
    isLoading,
    globalFilter,
    onUpdate,
    onGlobalFilterChange,
    dbClick,
    subComponent
  }: Props<T>) => {
    const fuzzyFilter: FilterFn<any> = (row, columnId, value, addMeta) => {
      // Rank the item
      const itemRank = rankItem(row.getValue(columnId), value)
    
      // Store the itemRank info
      addMeta({
        itemRank,
      })
    
      // Return if the item should be filtered in/out
      return itemRank.passed
    }

    const table = useReactTable({
      data,
      columns,
      getRowCanExpand: rowCanExpand ? () => rowCanExpand : undefined,
      getExpandedRowModel: rowCanExpand ? getExpandedRowModel() : undefined,
      getCoreRowModel: getCoreRowModel(),
      getFilteredRowModel: getFilteredRowModel(),
      state: {
        globalFilter,
      },
      globalFilterFn: fuzzyFilter,
      onGlobalFilterChange,
      meta: {
        updateServiceData: onUpdate
      },
    })

    
  
    return (
      <Paper sx={{width:'100%', overflow: 'hidden'}}>
        <TableContainer>
          <Table size="small">
            <TableHead>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <TableCell key={header.id} sx={{ fontWeight: 'bold' }}>
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
                table.getRowModel().rows.map((row) => {
                  return (
                    <Fragment key={row.id}>
                      <TableRow onDoubleClick={() => dbClick && dbClick(row.original)}>
                        {row.getVisibleCells().map((cell) => (
                          <TableCell key={cell.id}>
                            {flexRender(cell.column.columnDef.cell, {
                              ...cell.getContext(),
                              updateServiceData: onUpdate,
                            } as CellContext<T, any> & ExtraCellContext)}
                          </TableCell>
                        ))}
                      </TableRow>
                      {
                        row.getIsExpanded() && (
                          <TableRow>
                            {/* 2nd row is a custom 1 cell row */}
                            <TableCell colSpan={row.getVisibleCells().length}>
                              {subComponent && subComponent(row.original)}
                            </TableCell>
                          </TableRow>
                      )}
                    </Fragment>
                  )
                })
              ) : (
                <TableBodySkeleton columns={columns.length} rows={5} />
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
      
    )
  }
  
  export default EditableTable
  