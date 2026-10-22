'use client'

import React, { useState } from 'react'
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  getPaginationRowModel,
  flexRender,
  type ColumnDef,
  type SortingState,
  type RowSelectionState,
} from '@tanstack/react-table'
import { ChevronDown, ChevronUp, ChevronsUpDown } from 'lucide-react'

const UI_BORDER = '2px solid var(--color-border-ui)'

interface DataTableProps<TData> {
  columns: ColumnDef<TData, any>[]
  data: TData[]
  /** Show row-selection checkboxes in the first column */
  enableSelection?: boolean
  /** Called with selected row originals when the delete button is pressed */
  onDeleteSelected?: (rows: TData[]) => void
  /** Delete button label */
  deleteLabel?: string
  isLoading?: boolean
  emptyMessage?: string
  enablePagination?: boolean
  pageSize?: number
  onRowClick?: (row: TData) => void
  className?: string
}

export function DataTable<TData>({
  columns,
  data,
  enableSelection = false,
  onDeleteSelected,
  deleteLabel = 'Delete Selected',
  isLoading = false,
  emptyMessage = 'No records found.',
  enablePagination = true,
  pageSize = 50,
  onRowClick,
  className = '',
}: DataTableProps<TData>) {
  const [sorting, setSorting]           = useState<SortingState>([])
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({})

  /* Selection column prepended when enableSelection is true */
  const selectionColumn: ColumnDef<TData, any> = {
    id: '_select',
    size: 40,
    enableSorting: false,
    header: ({ table }) => (
      <input
        type="checkbox"
        checked={table.getIsAllPageRowsSelected()}
        onChange={table.getToggleAllPageRowsSelectedHandler()}
        className="accent-primary w-4 h-4 cursor-pointer"
        aria-label="Select all rows"
      />
    ),
    cell: ({ row }) => (
      <input
        type="checkbox"
        checked={row.getIsSelected()}
        disabled={!row.getCanSelect()}
        onChange={row.getToggleSelectedHandler()}
        className="accent-primary w-4 h-4 cursor-pointer"
        aria-label="Select row"
        onClick={(e) => e.stopPropagation()}
      />
    ),
  }

  const allColumns: ColumnDef<TData, any>[] = enableSelection
    ? [selectionColumn, ...columns]
    : columns

  const table = useReactTable({
    data,
    columns: allColumns,
    state: { sorting, rowSelection },
    onSortingChange: setSorting,
    onRowSelectionChange: setRowSelection,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: enablePagination ? getPaginationRowModel() : undefined,
    initialState: { pagination: { pageSize } },
    enableRowSelection: enableSelection,
  })

  const selectedCount = Object.keys(rowSelection).length

  function handleDeleteSelected() {
    if (!onDeleteSelected) return
    const selected = table
      .getSelectedRowModel()
      .rows.map((r) => r.original)
    onDeleteSelected(selected)
    setRowSelection({})
  }

  return (
    <div
      className={`bg-surface rounded-xl overflow-hidden ${className}`}
      style={{ border: UI_BORDER, boxShadow: '0 1px 2px rgba(0,0,0,0.03)' }}
    >
      {/* Selection action bar */}
      {enableSelection && selectedCount > 0 && (
        <div
          className="flex items-center justify-between px-4 py-2.5 bg-danger-light"
          style={{ borderBottom: UI_BORDER }}
        >
          <span className="text-sm font-medium text-danger">{selectedCount} selected</span>
          <button
            type="button"
            onClick={handleDeleteSelected}
            className="text-xs font-medium text-white bg-danger rounded-lg px-3 py-1.5 cursor-pointer hover:bg-danger-subtle transition-colors"
          >
            {deleteLabel}
          </button>
        </div>
      )}

      {/* Scrollable table */}
      <div className="overflow-x-auto" style={{ scrollbarWidth: 'thin' }}>
        <table className="w-full text-sm" style={{ minWidth: 'max-content' }}>
          <thead className="bg-surface-subtle">
            {table.getHeaderGroups().map((hg) => (
              <tr key={hg.id} style={{ borderBottom: UI_BORDER }}>
                {hg.headers.map((header) => (
                  <th
                    key={header.id}
                    className="px-4 py-3 text-left text-xs font-semibold text-text-muted uppercase tracking-wider whitespace-nowrap"
                    style={{ width: header.getSize() !== 150 ? header.getSize() : undefined }}
                  >
                    {header.isPlaceholder ? null : (
                      <div
                        className={
                          header.column.getCanSort()
                            ? 'flex items-center gap-1 cursor-pointer select-none'
                            : ''
                        }
                        onClick={header.column.getToggleSortingHandler()}
                      >
                        {flexRender(header.column.columnDef.header, header.getContext())}
                        {header.column.getCanSort() && (
                          <span className="text-text-faint">
                            {header.column.getIsSorted() === 'asc'  ? <ChevronUp size={12} />   :
                             header.column.getIsSorted() === 'desc' ? <ChevronDown size={12} /> :
                             <ChevronsUpDown size={12} className="opacity-40" />}
                          </span>
                        )}
                      </div>
                    )}
                  </th>
                ))}
              </tr>
            ))}
          </thead>

          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={allColumns.length} className="px-4 py-8 text-center text-sm text-text-faint">
                  Loading…
                </td>
              </tr>
            ) : table.getRowModel().rows.length === 0 ? (
              <tr>
                <td colSpan={allColumns.length} className="px-4 py-8 text-center text-sm text-text-faint">
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              table.getRowModel().rows.map((row) => (
                <tr
                  key={row.id}
                  className={`hover:bg-surface-subtle ${row.getIsSelected() ? 'bg-primary-light' : ''} ${onRowClick ? 'cursor-pointer' : ''}`}
                  style={{ borderBottom: UI_BORDER }}
                  onClick={onRowClick ? () => onRowClick(row.original) : undefined}
                >
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} className="px-4 py-3 text-text-primary whitespace-nowrap">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {enablePagination && (
        <div className="flex items-center justify-between px-5 py-3" style={{ borderTop: UI_BORDER }}>
          <span className="text-xs text-text-faint">
            Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount() || 1}
          </span>
          <div className="flex gap-2">
            <button
              type="button"
              disabled={!table.getCanPreviousPage()}
              onClick={() => table.previousPage()}
              className="px-3 py-1.5 text-xs font-medium rounded-lg cursor-pointer disabled:opacity-40 hover:bg-surface-subtle whitespace-nowrap"
              style={{ border: UI_BORDER }}
            >
              ← Previous
            </button>
            <button
              type="button"
              disabled={!table.getCanNextPage()}
              onClick={() => table.nextPage()}
              className="px-3 py-1.5 text-xs font-medium rounded-lg cursor-pointer disabled:opacity-40 hover:bg-surface-subtle whitespace-nowrap"
              style={{ border: UI_BORDER }}
            >
              Next →
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
