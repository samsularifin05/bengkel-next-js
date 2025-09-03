'use client'

import { useState, useEffect } from 'react'
import DataManager from './DataManager'
import ItemForm from './ItemForm'

interface Item {
    id: number
    kode_barang: string
    nama_barang: string
    qty: number
    merek: string
    harga: number
}

export default function ItemManager() {
    const [items, setItems] = useState<Item[]>([])
    const [loading, setLoading] = useState(true)
    const [refreshTrigger, setRefreshTrigger] = useState(0)
    const [selectedItem, setSelectedItem] = useState<Item | null>(null)

    const fetchItems = async () => {
        try {
            const response = await fetch('/api/items')
            const data = await response.json()
            setItems(data)
        } catch (error) {
            console.error('Error fetching items:', error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchItems()
    }, [refreshTrigger])

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR'
        }).format(amount)
    }

    const columns = [
        {
            key: 'kode_barang',
            header: 'Kode Barang',
            className: 'font-medium text-gray-900'
        },
        {
            key: 'nama_barang',
            header: 'Nama Barang',
            className: 'text-gray-900'
        },
        {
            key: 'merek',
            header: 'Merek',
            className: 'text-gray-700'
        },
        {
            key: 'qty',
            header: 'Stok',
            className: 'text-gray-900 font-medium',
            render: (value: number) => (
                <span className={value <= 5 ? 'text-red-600 font-semibold' : 'text-gray-900'}>
                    {value}
                </span>
            )
        },
        {
            key: 'harga',
            header: 'Harga',
            className: 'text-gray-900',
            render: (value: number) => formatCurrency(value)
        }
    ]

    const ItemFormWithCallback = () => (
        <ItemForm onSuccess={() => {
            setRefreshTrigger(prev => prev + 1)
        }} />
    )

    const ItemView = ({ item }: { item: Item }) => (
        <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700">Kode Barang</label>
                    <p className="mt-1 text-sm text-gray-900 font-medium">{item?.kode_barang}</p>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Nama Barang</label>
                    <p className="mt-1 text-sm text-gray-900">{item?.nama_barang}</p>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Merek</label>
                    <p className="mt-1 text-sm text-gray-900">{item?.merek}</p>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Stok</label>
                    <p className={`mt-1 text-sm font-medium ${item && item.qty <= 5 ? 'text-red-600' : 'text-gray-900'
                        }`}>
                        {item?.qty} {item && item.qty <= 5 && '(Stok Menipis!)'}
                    </p>
                </div>
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700">Harga</label>
                <p className="mt-1 text-lg font-semibold text-gray-900">
                    {item && formatCurrency(item.harga)}
                </p>
            </div>
        </div>
    )

    const handleDelete = async (item: Item) => {
        if (!window.confirm(`Apakah Anda yakin ingin menghapus barang ${item.nama_barang}?`)) {
            return
        }

        try {
            const response = await fetch(`/api/items/${item.id}`, {
                method: 'DELETE'
            })

            if (response.ok) {
                setRefreshTrigger(prev => prev + 1)
                alert('Barang berhasil dihapus')
            } else {
                let errorMessage = 'Unknown error'
                try {
                    const errorData = await response.json()
                    errorMessage = errorData.error || errorData.message || `HTTP ${response.status}: ${response.statusText}`
                } catch {
                    errorMessage = `HTTP ${response.status}: ${response.statusText}`
                }
                console.error('Delete error response:', response.status, response.statusText)
                alert(`Gagal menghapus barang: ${errorMessage}`)
            }
        } catch (error) {
            console.error('Error deleting item:', error)
            alert(`Terjadi kesalahan saat menghapus barang: ${error instanceof Error ? error.message : 'Network error'}`)
        }
    }

    const handleView = (item: Item) => {
        setSelectedItem(item)
    }

    return (
        <DataManager
            title="Barang"
            data={items}
            columns={columns}
            loading={loading}
            onAdd={() => { }}
            onView={handleView}
            onDelete={handleDelete}
            formComponent={<ItemFormWithCallback />}
            viewComponent={selectedItem ? <ItemView item={selectedItem} /> : null}
            addButtonText="Tambah Barang"
            emptyMessage="Belum ada barang yang terdaftar"
        />
    )
}
