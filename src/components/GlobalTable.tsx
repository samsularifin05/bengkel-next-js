'use client'

import { ReactNode, useState, useMemo, useEffect } from 'react'

interface Column {
    key: string
    header: string
    render?: (value: any, row: any) => ReactNode
    className?: string
    searchable?: boolean
}

interface TableProps {
    data: any[] | null | undefined;
    columns: Column[]
    loading?: boolean
    onEdit?: (row: any) => void
    onDelete?: (row: any) => void
    onView?: (row: any) => void
    onReprint?: (row: any) => void
    actions?: boolean
    emptyMessage?: string
    searchable?: boolean
    pagination?: boolean
    itemsPerPage?: number
}

export default function GlobalTable({
    data,
    columns,
    loading = false,
    onEdit,
    onDelete,
    onView,
    onReprint,
    actions = true,
    emptyMessage = 'Tidak ada data',
    searchable = true,
    pagination = true,
    itemsPerPage = 2
}: TableProps) {
    const [searchTerm, setSearchTerm] = useState('')
    const [currentPage, setCurrentPage] = useState(1)

    // Filter data based on search term
    const filteredData = useMemo(() => {
        if (!searchTerm || !searchable) return data || []

        return data ? data.filter((row) => {
            return columns.some((column) => {
                if (column.searchable === false) return false

                const value = row[column.key]
                if (value == null) return false

                return String(value).toLowerCase().includes(searchTerm.toLowerCase())
            })
        }) : []
    }, [data, searchTerm, columns, searchable])

    // Pagination logic
    const totalPages = Math.ceil((filteredData?.length || 0) / itemsPerPage)
    const startIndex = (currentPage - 1) * itemsPerPage
    const paginatedData = pagination && Array.isArray(filteredData)
        ? filteredData.slice(startIndex, startIndex + itemsPerPage)
        : filteredData || []

    // Reset current page when search changes
    useEffect(() => {
        setCurrentPage(1)
    }, [searchTerm])

    const handlePageChange = (page: number) => {
        setCurrentPage(page)
    }

    const getPaginationNumbers = () => {
        const delta = 2
        const range = []
        const rangeWithDots = []

        // Handle case when there's only 1 page
        if (totalPages <= 1) {
            return [1]
        }

        // Always include page 1
        if (currentPage - delta > 2) {
            rangeWithDots.push(1, '...')
        } else {
            rangeWithDots.push(1)
        }

        // Add middle pages
        for (let i = Math.max(2, currentPage - delta);
            i <= Math.min(totalPages - 1, currentPage + delta);
            i++) {
            if (i !== 1 && i !== totalPages) {
                range.push(i)
            }
        }

        rangeWithDots.push(...range)

        // Always include last page if more than 1 page
        if (currentPage + delta < totalPages - 1) {
            rangeWithDots.push('...', totalPages)
        } else if (totalPages > 1) {
            rangeWithDots.push(totalPages)
        }

        // Remove duplicates and sort
        const uniquePages = Array.from(new Set(rangeWithDots)).sort((a, b) => {
            if (typeof a === 'number' && typeof b === 'number') {
                return a - b
            }
            return 0
        })

        return uniquePages
    }
    if (loading) {
        return (
            <div className="bg-white rounded-lg shadow-sm p-8">
                <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                    <span className="ml-2 text-gray-600">Loading...</span>
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-4 text-black">
            {/* Search Bar */}
            {process.env.DATABASE_URL} HAI

            {searchable && (
                <div className="bg-white rounded-lg shadow-sm p-4">
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </div>
                        <input
                            type="text"
                            placeholder="Cari data..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="block text-black w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                        />
                        {searchTerm && (
                            <button
                                onClick={() => setSearchTerm('')}
                                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                            >
                                <svg className="h-5 w-5 text-gray-400 hover:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        )}
                    </div>
                    {searchTerm && (
                        <div className="mt-2 text-sm text-gray-600">
                            Menampilkan {filteredData?.length || 0} dari {data?.length || 0} data
                        </div>
                    )}
                </div>
            )}

            {/* Table */}
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                {columns.map((column) => (
                                    <th
                                        key={column.key}
                                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                    >
                                        {column.header}
                                    </th>
                                ))}
                                {actions && (
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Aksi
                                    </th>
                                )}
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {!paginatedData || paginatedData.length === 0 ? (
                                <tr>
                                    <td
                                        colSpan={columns.length + (actions ? 1 : 0)}
                                        className="px-6 py-8 text-center text-gray-500"
                                    >
                                        {searchTerm ? 'Tidak ada data yang sesuai dengan pencarian' : emptyMessage}
                                    </td>
                                </tr>
                            ) : (
                                paginatedData.map((row, index) => (
                                    <tr key={startIndex + index} className="hover:bg-gray-50">
                                        {columns.map((column) => (
                                            <td
                                                key={column.key}
                                                className={`px-6 py-4 whitespace-nowrap text-sm ${column.className || 'text-gray-900'
                                                    }`}
                                            >
                                                {column.render
                                                    ? column.render(row[column.key], row)
                                                    : row[column.key] || '-'
                                                }
                                            </td>
                                        ))}
                                        {actions && (
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                <div className="flex space-x-2">
                                                    {onView && (
                                                        <button
                                                            onClick={() => onView(row)}
                                                            className="text-blue-600 hover:text-blue-900 transition-colors"
                                                        >
                                                            Detail
                                                        </button>
                                                    )}
                                                    {onReprint && (
                                                        <button
                                                            onClick={() => onReprint(row)}
                                                            className="text-green-600 hover:text-green-900 transition-colors"
                                                        >
                                                            Reprint
                                                        </button>
                                                    )}
                                                    {onEdit && (
                                                        <button
                                                            onClick={() => onEdit(row)}
                                                            className="text-indigo-600 hover:text-indigo-900 transition-colors"
                                                        >
                                                            Edit
                                                        </button>
                                                    )}
                                                    {onDelete && (
                                                        <button
                                                            onClick={() => onDelete(row)}
                                                            className="text-red-600 hover:text-red-900 transition-colors"
                                                        >
                                                            Hapus
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        )}
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>



            {/* Pagination */}
            {pagination && (filteredData?.length || 0) > 0 && (
                <div className="bg-white rounded-lg shadow-sm px-6 py-4">
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                        <div className="text-sm text-gray-700">
                            Menampilkan {startIndex + 1} sampai {Math.min(startIndex + itemsPerPage, filteredData?.length || 0)} dari {filteredData?.length || 0} data
                        </div>
                        {totalPages > 1 ? (
                            <div className="flex items-center space-x-2">
                                <button
                                    onClick={() => handlePageChange(currentPage - 1)}
                                    disabled={currentPage === 1}
                                    className="px-3 py-1 text-sm text-gray-500 hover:text-gray-700 disabled:text-gray-300 disabled:cursor-not-allowed transition-colors"
                                >
                                    ← Sebelumnya
                                </button>

                                <div className="flex space-x-1">
                                    {getPaginationNumbers().map((page, index) => (
                                        <button
                                            key={index}
                                            onClick={() => typeof page === 'number' ? handlePageChange(page) : undefined}
                                            disabled={page === '...'}
                                            className={`px-3 py-1 text-sm rounded transition-colors ${page === currentPage
                                                ? 'bg-blue-600 text-white'
                                                : page === '...'
                                                    ? 'text-gray-400 cursor-default'
                                                    : 'text-gray-700 hover:bg-gray-100'
                                                }`}
                                        >
                                            {page}
                                        </button>
                                    ))}
                                </div>

                                <button
                                    onClick={() => handlePageChange(currentPage + 1)}
                                    disabled={currentPage === totalPages}
                                    className="px-3 py-1 text-sm text-gray-500 hover:text-gray-700 disabled:text-gray-300 disabled:cursor-not-allowed transition-colors"
                                >
                                    Selanjutnya →
                                </button>
                            </div>
                        ) : (
                            <div className="text-sm text-gray-500">
                                Halaman 1 dari 1
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    )
}
