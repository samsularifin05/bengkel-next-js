'use client'

import { useState, useEffect } from 'react'
import DataManager from './DataManager'
import CustomerForm from './CustomerForm'

interface Customer {
    id: number
    kode_customer: string
    nama_customer: string
    no_hp: string
    alamat_customer: string
    tgl_daftar: string
}

export default function CustomerManager() {
    const [customers, setCustomers] = useState<Customer[]>([])
    const [loading, setLoading] = useState(true)
    const [refreshTrigger, setRefreshTrigger] = useState(0)
    const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null)

    const fetchCustomers = async () => {
        try {
            const response = await fetch('/api/customers')
            const data = await response.json()
            setCustomers(Array.isArray(data) ? data : [])
        } catch (error) {
            console.error('Error fetching customers:', error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchCustomers()
    }, [refreshTrigger])

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('id-ID', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        })
    }

    const columns = [
        {
            key: 'kode_customer',
            header: 'Kode Customer',
            className: 'font-medium text-gray-900'
        },
        {
            key: 'nama_customer',
            header: 'Nama Customer',
            className: 'text-gray-900'
        },
        {
            key: 'no_hp',
            header: 'No. HP',
            className: 'text-gray-700'
        },
        {
            key: 'alamat_customer',
            header: 'Alamat',
            className: 'text-gray-700 max-w-xs truncate',
            render: (value: string) => (
                <div className="max-w-xs truncate" title={value}>
                    {value}
                </div>
            )
        },
        {
            key: 'tgl_daftar',
            header: 'Tanggal Daftar',
            className: 'text-gray-700',
            render: (value: string) => formatDate(value)
        }
    ]

    const CustomerFormWithCallback = () => (
        <CustomerForm onSuccess={() => {
            setRefreshTrigger(prev => prev + 1)
        }} />
    )

    const CustomerView = ({ customer }: { customer: Customer }) => (
        <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700">Kode Customer</label>
                    <p className="mt-1 text-sm text-gray-900 font-medium">{customer?.kode_customer}</p>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Nama Customer</label>
                    <p className="mt-1 text-sm text-gray-900">{customer?.nama_customer}</p>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">No. HP</label>
                    <p className="mt-1 text-sm text-gray-900">{customer?.no_hp}</p>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Tanggal Daftar</label>
                    <p className="mt-1 text-sm text-gray-900">{customer && formatDate(customer.tgl_daftar)}</p>
                </div>
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700">Alamat</label>
                <p className="mt-1 text-sm text-gray-900">{customer?.alamat_customer}</p>
            </div>
        </div>
    )

    const handleDelete = async (customer: Customer) => {
        if (!window.confirm(`Apakah Anda yakin ingin menghapus customer ${customer.nama_customer}?`)) {
            return
        }

        try {
            const response = await fetch(`/api/customers/${customer.id}`, {
                method: 'DELETE'
            })

            if (response.ok) {
                setRefreshTrigger(prev => prev + 1)
                alert('Customer berhasil dihapus')
            } else {
                let errorMessage = 'Unknown error'
                try {
                    const errorData = await response.json()
                    errorMessage = errorData.error || errorData.message || `HTTP ${response.status}: ${response.statusText}`
                } catch {
                    errorMessage = `HTTP ${response.status}: ${response.statusText}`
                }
                console.error('Delete error response:', response.status, response.statusText)
                alert(`Gagal menghapus customer: ${errorMessage}`)
            }
        } catch (error) {
            console.error('Error deleting customer:', error)
            alert(`Terjadi kesalahan saat menghapus customer: ${error instanceof Error ? error.message : 'Network error'}`)
        }
    }

    const handleView = (customer: Customer) => {
        setSelectedCustomer(customer)
    }

    return (
        <DataManager
            title="Customer"
            data={customers}
            columns={columns}
            loading={loading}
            onAdd={() => { }}
            onView={handleView}
            onDelete={handleDelete}
            formComponent={<CustomerFormWithCallback />}
            viewComponent={selectedCustomer ? <CustomerView customer={selectedCustomer} /> : null}
            addButtonText="Tambah Customer"
            emptyMessage="Belum ada customer yang terdaftar"
        />
    )
}
