import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  useReactTable,
  FilterFn,
  CellContext,
  getExpandedRowModel,
  RowSelectionState,
  ExpandedState,
  Row,
  OnChangeFn,
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
import { useEffect, useState } from 'react'

export interface ExtraCellContext {
  updateServiceData: (rowIndex: number, columnId: string, value: unknown) => void
}

interface Props<T> {
  data: T[]
  columns: ColumnDef<T, any>[]
  rowCanExpand?: boolean
  isLoading?: boolean
  globalFilter?: string,
  enableRowSelection?: boolean,
  onUpdate?: (rowIndex: number, columnId: string, value: unknown) => void
  onGlobalFilterChange?: (value: string) => void
  subComponent?: (row: T) => JSX.Element | null,
  getRowsSelected?: (rows: T[]) => void;
  getRowsIndexSelected?: (index: number[]) => void;
  getTableRef?: (table: import("@tanstack/table-core").Table<T>) => void;
  getRowExpanded?: (row: Row<T> | undefined) => void
}

const EditableTable = <T,>({
  data,
  columns,
  rowCanExpand,
  isLoading,
  globalFilter,
  onUpdate,
  onGlobalFilterChange,
  subComponent,
  enableRowSelection,
  getRowsSelected,
  getRowsIndexSelected,
  getTableRef,
  getRowExpanded
}: Props<T>) => {

  const [rowSelection, setRowSelection] = useState<RowSelectionState>({})
  const [expanded, setExpanded] = useState<ExpandedState>({})

  useEffect(() => {
    if (getTableRef) {
      getTableRef(table)
    }
  }, [])

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

  const handleExpandedChange: OnChangeFn<ExpandedState> = updaterOrValue =>  {
    setExpanded(old => {
      const newExpanded =
        typeof updaterOrValue === 'function'
          ? updaterOrValue(old)
          : updaterOrValue;

      const previousExpanded = old as Record<string, boolean>;
      const currentExpanded = newExpanded as Record<string, boolean>;

      const newlyExpandedIds = Object.keys(currentExpanded).filter(
        id => !previousExpanded[id]
      );

      if (newlyExpandedIds.length > 0) {
        const expandedRowId = newlyExpandedIds[0];
        const expandedRow = table
          .getRowModel()
          .rows.find(row => row.id === expandedRowId);

        if (getRowExpanded) {
          getRowExpanded(expandedRow); // ✅ stocke la ligne dépliée
        }
      }

      return newExpanded;
    });
  };

  const table = useReactTable({
    data,
    columns,
    onExpandedChange: handleExpandedChange,
    getRowCanExpand: rowCanExpand ? () => rowCanExpand : undefined,
    getExpandedRowModel: rowCanExpand ? getExpandedRowModel() : undefined,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    enableRowSelection: !!enableRowSelection,
    state: {
      globalFilter,
      rowSelection,
      expanded
    },
    globalFilterFn: fuzzyFilter,
    onGlobalFilterChange,
    meta: {
      updateServiceData: onUpdate
    },
    onRowSelectionChange: (updaterOrValue) => {
      setRowSelection(updaterOrValue)
      const selection = typeof updaterOrValue === 'function' ? updaterOrValue(rowSelection) : updaterOrValue

      if (getRowsSelected) {
        const selectedRows = table.getRowModel().rows.filter(row => selection[row.id]).map(row => row.original)
        getRowsSelected(selectedRows)
      }

      if (getRowsIndexSelected) {
        const selectedRowIndices = table.getRowModel().rows.filter(row => selection[row.id]).map(row => row.index)
        getRowsIndexSelected(selectedRowIndices)
      }
    },
  })


  return (
    <Paper sx={{ width: '100%', overflow: 'hidden' }}>
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
                    <TableRow>
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
