'use client'

import {
  createColumnHelper,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  SortingState,
  Row as TableRow,
  Table as TableType,
  useReactTable,
} from '@tanstack/react-table'
import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import {
  Button,
  Card,
  CardFooter,
  CardHeader,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownToggle,
} from 'react-bootstrap'
import { LuDownload, LuPlus, LuSearch } from 'react-icons/lu'
import { TbChevronDown, TbEdit, TbEye, TbTrash } from 'react-icons/tb'

import useAxios from '@/hooks/useAxios'
import DataTable from '@/components/table/DataTable'
import DeleteConfirmationModal from '@/components/table/DeleteConfirmationModal'
import TablePagination from '@/components/table/TablePagination'
import { currency } from '@/helpers'
import defaultAvatar from '@/assets/images/users/user-1.jpg'
import usFlag from '@/assets/images/flags/us.svg'
import { CustomerType } from '../../../../(ecommerce)/customers/data';


type ApiUser = {
  id: string
  name: string
  email: string
  role: string
  createdAt: string
}


const mapUsersToCustomers = (users: ApiUser[]): CustomerType[] => {
  return users.map((u) => {
    const date = new Date(u.createdAt)

    return {
      name: u.name,
      email: u.email,
      avatar: defaultAvatar,
      phone: '—',
      country: 'México',
      countryFlag: usFlag,
      joined: {
        date: date.toLocaleDateString('en-US', {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
        }),
        time: date.toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit',
        }),
      },
      orders: 0,
      totalSpends: 0,
    }
  })
}


const columnHelper = createColumnHelper<CustomerType>()

const CustomersCard = () => {
  const { data: apiData, loading } = useAxios<ApiUser[]>({
    method: 'get',
    url: '/admin/users',
  })

  const [data, setData] = useState<CustomerType[]>([])
  const [globalFilter, setGlobalFilter] = useState('')
  const [sorting, setSorting] = useState<SortingState>([])
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 8 })
  const [selectedRowIds, setSelectedRowIds] = useState<Record<string, boolean>>({})
  const [showDeleteModal, setShowDeleteModal] = useState(false)

  useEffect(() => {
    if (apiData?.length) {
      setData(mapUsersToCustomers(apiData))
    }
  }, [apiData])

  const columns = [
    {
      id: 'select',
      header: ({ table }: { table: TableType<CustomerType> }) => (
        <input
          type="checkbox"
          className="form-check-input form-check-input-light fs-14"
          checked={table.getIsAllRowsSelected()}
          onChange={table.getToggleAllRowsSelectedHandler()}
        />
      ),
      cell: ({ row }: { row: TableRow<CustomerType> }) => (
        <input
          type="checkbox"
          className="form-check-input form-check-input-light fs-14"
          checked={row.getIsSelected()}
          onChange={row.getToggleSelectedHandler()}
        />
      ),
      enableSorting: false,
      enableColumnFilter: false,
    },

    columnHelper.accessor('name', {
      header: 'Nombre del cliente',
      cell: ({ row }) => (
        <div className="d-flex align-items-center gap-2">
          <div className="avatar avatar-sm">
            <Image
              src={row.original.avatar}
              alt=""
              height={32}
              width={32}
              className="img-fluid rounded-circle"
            />
          </div>
          <h5 className="mb-0">
            <Link href="/users/profile" className="link-reset">
              {row.original.name}
            </Link>
          </h5>
        </div>
      ),
    }),

    columnHelper.accessor('email', { header: 'Email' }),
    columnHelper.accessor('phone', { header: 'Teléfono' }),

    columnHelper.accessor('country', {
      header: 'Pais',
      cell: ({ row }) => (
        <>
          <Image
            src={row.original.countryFlag}
            alt=""
            height={16}
            width={16}
            className="rounded-circle me-1"
          />
          {row.original.country}
        </>
      ),
    }),

    columnHelper.accessor('joined.date', {
      header: 'Creación',
      cell: ({ row }) => (
        <>
          {row.original.joined.date}{' '}
          <small className="text-muted">{row.original.joined.time}</small>
        </>
      ),
    }),

    columnHelper.accessor('orders', { header: 'Citas' }),

    columnHelper.accessor('totalSpends', {
      header: 'Gastos totales',
      cell: ({ row }) => (
        <>
          {currency}
          {row.original.totalSpends}
        </>
      ),
    }),

    {
      header: 'Acciones',
      cell: ({ row }: { row: TableRow<CustomerType> }) => (
        <div className="d-flex gap-1">
          <Button variant="default" size="sm" className="btn-icon rounded-circle">
            <TbEye className="fs-lg" />
          </Button>
          <Button variant="default" size="sm" className="btn-icon rounded-circle">
            <TbEdit className="fs-lg" />
          </Button>
          <Button
            variant="default"
            size="sm"
            className="btn-icon rounded-circle"
            onClick={() => {
              setShowDeleteModal(true)
              setSelectedRowIds({ [row.id]: true })
            }}
          >
            <TbTrash className="fs-lg" />
          </Button>
        </div>
      ),
    },
  ]

  const table = useReactTable({
    data,
    columns,
    state: { sorting, globalFilter, pagination, rowSelection: selectedRowIds },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    onPaginationChange: setPagination,
    onRowSelectionChange: setSelectedRowIds,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    globalFilterFn: 'includesString',
    enableRowSelection: true,
  })

  const pageIndex = table.getState().pagination.pageIndex
  const pageSize = table.getState().pagination.pageSize
  const totalItems = table.getFilteredRowModel().rows.length
  const start = pageIndex * pageSize + 1
  const end = Math.min(start + pageSize - 1, totalItems)

  const handleDelete = () => {
    const selectedIds = new Set(Object.keys(selectedRowIds))
    setData((old) => old.filter((_, idx) => !selectedIds.has(idx.toString())))
    setSelectedRowIds({})
    setPagination({ ...pagination, pageIndex: 0 })
    setShowDeleteModal(false)
  }

  return (
    <Card>
      <CardHeader className="border-light d-flex align-items-center justify-content-between flex-wrap gap-2">
        <div className="d-flex gap-2">
          <div className="app-search">
            <input
              type="search"
              className="form-control"
              placeholder="Search customer..."
              value={globalFilter ?? ''}
              onChange={(e) => setGlobalFilter(e.target.value)}
            />
            <LuSearch className="app-search-icon text-muted" />
          </div>

          {Object.keys(selectedRowIds).length > 0 && (
            <Button variant="danger" size="sm" onClick={() => setShowDeleteModal(true)}>
              Delete
            </Button>
          )}
        </div>

        <div className="d-flex align-items-center gap-2">
          <select
            className="form-select"
            value={pageSize}
            onChange={(e) => table.setPageSize(Number(e.target.value))}
          >
            {[5, 8, 10, 15, 20].map((size) => (
              <option key={size} value={size}>
                {size}
              </option>
            ))}
          </select>

          <Dropdown align="end">
            <DropdownToggle className="btn-default drop-arrow-none">
              <LuDownload className="fs-sm me-1 truncate" /> Exportar <TbChevronDown className="ms-1" />
            </DropdownToggle>
            <DropdownMenu>
              <DropdownItem>Export como PDF</DropdownItem>
              <DropdownItem>Export como CSV</DropdownItem>
              <DropdownItem>Export como Excel</DropdownItem>
            </DropdownMenu>
          </Dropdown>

          <Button variant="primary">
            <LuPlus className="me-1" /> Agregar Cliente
          </Button>
        </div>
      </CardHeader>

      {loading ? (
        <div className="p-4 text-center text-muted">Cargando clientes…</div>
      ) : (
        <DataTable table={table} emptyMessage="No records found" />
      )}

      {totalItems > 0 && (
        <CardFooter className="border-0">
          <TablePagination
            totalItems={totalItems}
            start={start}
            end={end}
            itemsName="customers"
            showInfo
            previousPage={table.previousPage}
            canPreviousPage={table.getCanPreviousPage()}
            pageCount={table.getPageCount()}
            pageIndex={pageIndex}
            setPageIndex={table.setPageIndex}
            nextPage={table.nextPage}
            canNextPage={table.getCanNextPage()}
          />
        </CardFooter>
      )}

      <DeleteConfirmationModal
        show={showDeleteModal}
        onHide={() => setShowDeleteModal(false)}
        onConfirm={handleDelete}
        selectedCount={Object.keys(selectedRowIds).length}
        itemName="customers"
      />
    </Card>
  )
}

export default CustomersCard
