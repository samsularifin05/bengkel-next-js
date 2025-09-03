'use client'

import { useState, ReactNode } from 'react'
import GlobalTable from './GlobalTable'
import GlobalModal from './GlobalModal'

interface DataManagerProps {
    title: string
    data: any[]
    columns: any[]
    loading?: boolean
    onAdd?: () => void
    onEdit?: (item: any) => void
    onDelete?: (item: any) => void
    onView?: (item: any) => void
    onReprint?: (item: any) => void
    formComponent?: ReactNode
    viewComponent?: ReactNode
    addButtonText?: string
    emptyMessage?: string
    showAddButton?: boolean
    searchable?: boolean
    pagination?: boolean
    itemsPerPage?: number
}

export default function DataManager({
    title,
    data,
    columns,
    loading = false,
    onAdd,
    onEdit,
    onDelete,
    onView,
    onReprint,
    formComponent,
    viewComponent,
    addButtonText = "Tambah Data",
    emptyMessage = "Tidak ada data",
    showAddButton = true,
    searchable = true,
    pagination = true,
    itemsPerPage = 10
}: DataManagerProps) {
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [modalType, setModalType] = useState<'add' | 'edit' | 'view'>('add')
    const [selectedItem, setSelectedItem] = useState<any>(null)

    const handleAdd = () => {
        setSelectedItem(null)
        setModalType('add')
        setIsModalOpen(true)
        onAdd?.()
    }

    const handleEdit = (item: any) => {
        setSelectedItem(item)
        setModalType('edit')
        setIsModalOpen(true)
        onEdit?.(item)
    }

    const handleView = (item: any) => {
        setSelectedItem(item)
        setModalType('view')
        setIsModalOpen(true)
        onView?.(item)
    }

    const handleDelete = (item: any) => {
        if (window.confirm('Apakah Anda yakin ingin menghapus data ini?')) {
            onDelete?.(item)
        }
    }

    const closeModal = () => {
        setIsModalOpen(false)
        setSelectedItem(null)
        setTimeout(() => setModalType('add'), 300)
    }

    const getModalTitle = () => {
        switch (modalType) {
            case 'add':
                return `Tambah ${title}`
            case 'edit':
                return `Edit ${title}`
            case 'view':
                return `Detail ${title}`
            default:
                return title
        }
    }

    const getModalContent = () => {
        if (modalType === 'view' && viewComponent) {
            return viewComponent
        }
        return formComponent
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
                    <p className="text-gray-600 mt-1">
                        Kelola data {title.toLowerCase()} Anda
                    </p>
                </div>
                {showAddButton && (
                    <button
                        onClick={handleAdd}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        <span>{addButtonText}</span>
                    </button>
                )}
            </div>

            {/* Table */}
            <GlobalTable
                data={data}
                columns={columns}
                loading={loading}
                onEdit={onEdit ? handleEdit : undefined}
                onDelete={onDelete ? handleDelete : undefined}
                onView={onView ? handleView : undefined}
                onReprint={onReprint}
                emptyMessage={emptyMessage}
                searchable={searchable}
                pagination={pagination}
                itemsPerPage={itemsPerPage}
            />

            {/* Modal */}
            <GlobalModal
                isOpen={isModalOpen}
                onClose={closeModal}
                title={getModalTitle()}
                size="lg"
            >
                <div>
                    {getModalContent()}
                </div>
            </GlobalModal>
        </div>
    )
}
