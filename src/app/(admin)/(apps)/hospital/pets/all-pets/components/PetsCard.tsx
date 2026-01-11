'use client'

import {
  createColumnHelper,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
} from '@tanstack/react-table'
import { useEffect, useState } from 'react'
import {
  Button,
  Card,
  CardFooter,
  CardHeader,
} from 'react-bootstrap'
import { TbEdit, TbEye } from 'react-icons/tb'
import { LuSearch, LuPlus } from 'react-icons/lu'

import useAxios from '@/hooks/useAxios'
import DataTable from '@/components/table/DataTable'
import TablePagination from '@/components/table/TablePagination'



type ApiPet = {
  id: string
  name: string
  species: string
  breed: string
  gender: string
  birthDate: string
  weight: number
  isActive: boolean
  owners: {
    isPrimary: boolean
    user: { name: string }
  }[]
}

type PetTableRow = {
  name: string
  species: string
  breed: string
  gender: string
  age: string
  weight: string
  owner: string
  isActive: boolean
}


const calculateAge = (birthDate: string) => {
  const birth = new Date(birthDate)
  const today = new Date()
  let age = today.getFullYear() - birth.getFullYear()
  const m = today.getMonth() - birth.getMonth()
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--
  return `${age} años`
}

const mapPetsToRows = (pets: ApiPet[]): PetTableRow[] =>
  pets.map((pet) => ({
    name: pet.name,
    species: pet.species,
    breed: pet.breed,
    gender: pet.gender,
    age: calculateAge(pet.birthDate),
    weight: `${pet.weight} kg`,
    owner: pet.owners.find((o) => o.isPrimary)?.user.name ?? '—',
    isActive: pet.isActive,
  }))



const columnHelper = createColumnHelper<PetTableRow>()

const PetsCard = () => {
  const { data: apiData, loading } = useAxios<ApiPet[]>({
    method: 'get',
    url: '/admin/pets',
  })

  const [data, setData] = useState<PetTableRow[]>([])
  const [globalFilter, setGlobalFilter] = useState('')
  const [sorting, setSorting] = useState<SortingState>([])
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 8 })

  useEffect(() => {
    if (apiData?.length) {
      setData(mapPetsToRows(apiData))
    }
  }, [apiData])

  const columns = [
    columnHelper.accessor('name', { header: 'Name' }),
    columnHelper.accessor('species', { header: 'Species' }),
    columnHelper.accessor('breed', { header: 'Breed' }),
    columnHelper.accessor('gender', { header: 'Gender' }),
    columnHelper.accessor('age', { header: 'Age' }),
    columnHelper.accessor('weight', { header: 'Weight' }),
    columnHelper.accessor('owner', { header: 'Owner' }),
    columnHelper.accessor('isActive', {
      header: 'Status',
      cell: ({ row }) => (
        <span className={`badge ${row.original.isActive ? 'bg-success' : 'bg-secondary'}`}>
          {row.original.isActive ? 'Active' : 'Inactive'}
        </span>
      ),
    }),
    {
      header: 'Actions',
      cell: () => (
        <div className="d-flex gap-1">
          <Button variant="default" size="sm" className="btn-icon rounded-circle">
            <TbEye />
          </Button>
          <Button variant="default" size="sm" className="btn-icon rounded-circle">
            <TbEdit />
          </Button>
        </div>
      ),
    },
  ]

  const table = useReactTable({
    data,
    columns,
    state: { sorting, globalFilter, pagination },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  })

  const totalItems = table.getFilteredRowModel().rows.length
  const start = pagination.pageIndex * pagination.pageSize + 1
  const end = Math.min(start + pagination.pageSize - 1, totalItems)

  return (
    <Card>
      <CardHeader className="d-flex justify-content-between">
        <div className="app-search">
          <input
            type="search"
            className="form-control"
            placeholder="Search pet.."
            value={globalFilter}
            onChange={(e) => setGlobalFilter(e.target.value)}
          />
          <LuSearch className="app-search-icon text-muted" />
        </div>

        <Button variant="primary">
          <LuPlus className="me-1" /> Add Pet
        </Button>
      </CardHeader>

      {loading ? (
        <div className="p-4 text-center text-muted">Cargando mascotas…</div>
      ) : (
        <DataTable table={table} emptyMessage="No pets found" />
      )}

      {totalItems > 0 && (
        <CardFooter>
          <TablePagination
            totalItems={totalItems}
            start={start}
            end={end}
            itemsName="pets"
            pageIndex={pagination.pageIndex}
            pageCount={table.getPageCount()}
            setPageIndex={table.setPageIndex}
            canPreviousPage={table.getCanPreviousPage()}
            canNextPage={table.getCanNextPage()}
            previousPage={table.previousPage}
            nextPage={table.nextPage}
            showInfo
          />
        </CardFooter>
      )}
    </Card>
  )
}

export default PetsCard
