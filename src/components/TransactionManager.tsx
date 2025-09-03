'use client'

import { useState, useEffect } from 'react'
import DataManager from './DataManager'
import TransactionForm from './TransactionForm'
import TransactionReceipt from './TransactionReceipt'

interface Transaction {
    id: number
    no_transaksi: string
    tgl_transaksi: string
    type_pelanggan: 'member' | 'nonmember'
    customer?: {
        nama_customer: string
        kode_customer: string
    }
    no_hp_customer?: string
    transaction_services: Array<{
        nama_jasa: string
        harga: number
    }>
    transaction_items: Array<{
        jumlah: number
        total_harga: number
        item: {
            nama_barang: string
            kode_barang: string
        }
    }>
}

export default function TransactionManager() {
    const [transactions, setTransactions] = useState<Transaction[]>([])
    const [loading, setLoading] = useState(true)
    const [refreshTrigger, setRefreshTrigger] = useState(0)
    const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null)
    const [receiptData, setReceiptData] = useState<any>(null)
    const [showReceipt, setShowReceipt] = useState(false)

    const fetchTransactions = async () => {
        try {
            const response = await fetch('/api/transactions')
            const data = await response.json()
            setTransactions(data)
        } catch (error) {
            console.error('Error fetching transactions:', error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchTransactions()
    }, [refreshTrigger])

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('id-ID', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        })
    }

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR'
        }).format(amount)
    }

    const calculateTotal = (transaction: Transaction) => {
        const totalServices = transaction.transaction_services.reduce((sum, service) => sum + service.harga, 0)
        const totalItems = transaction.transaction_items.reduce((sum, item) => sum + item.total_harga, 0)
        return totalServices + totalItems
    }

    const columns = [
        {
            key: 'no_transaksi',
            header: 'No. Transaksi',
            className: 'font-medium text-gray-900'
        },
        {
            key: 'tgl_transaksi',
            header: 'Tanggal',
            className: 'text-gray-700',
            render: (value: string) => formatDate(value)
        },
        {
            key: 'type_pelanggan',
            header: 'Tipe',
            render: (value: string) => (
                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${value === 'member'
                    ? 'bg-green-100 text-green-800'
                    : 'bg-blue-100 text-blue-800'
                    }`}>
                    {value}
                </span>
            )
        },
        {
            key: 'customer',
            header: 'Customer',
            className: 'text-gray-700',
            render: (value: any, row: Transaction) => {
                if (row.customer) {
                    return `${row.customer.kode_customer} - ${row.customer.nama_customer}`
                }
                return row.no_hp_customer || '-'
            }
        },
        {
            key: 'total',
            header: 'Total',
            className: 'text-gray-900 font-medium',
            render: (value: any, row: Transaction) => formatCurrency(calculateTotal(row))
        }
    ]

    const TransactionFormWithCallback = () => (
        <TransactionForm
            onSuccess={() => {
                setRefreshTrigger(prev => prev + 1)
            }}
            onTransactionCreated={(createdTransaction) => {
                // Format data untuk receipt
                const receipt = {
                    no_transaksi: createdTransaction.no_transaksi,
                    tanggal_transaksi: createdTransaction.tgl_transaksi || new Date().toISOString(),
                    type_pelanggan: createdTransaction.type_pelanggan,
                    customer_name: createdTransaction.type_pelanggan === 'member'
                        ? createdTransaction.customer?.nama_customer || 'Customer Member'
                        : createdTransaction.nama_customer || 'Customer Nonmember',
                    no_hp_customer: createdTransaction.no_hp_customer,
                    services: (createdTransaction.transaction_services || []).map((service: any) => ({
                        nama_jasa: service.nama_jasa,
                        harga: service.harga
                    })),
                    items: (createdTransaction.transaction_items || []).map((item: any) => ({
                        nama_barang: item.item.nama_barang,
                        quantity: item.jumlah,
                        harga: item.total_harga / item.jumlah // harga per unit
                    })),
                    total_amount: (createdTransaction.transaction_services || []).reduce((sum: number, service: any) => sum + service.harga, 0) +
                        (createdTransaction.transaction_items || []).reduce((sum: number, item: any) => sum + item.total_harga, 0)
                }
                setReceiptData(receipt)
                setShowReceipt(true)
                setRefreshTrigger(prev => prev + 1)
            }}
        />
    )

    const TransactionView = ({ transaction }: { transaction: Transaction }) => (
        <div className="space-y-6">
            {/* Info Transaksi */}
            <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-3">Informasi Transaksi</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                        <span className="text-gray-700 font-medium">No. Transaksi:</span>
                        <p className="font-semibold text-gray-900">{transaction?.no_transaksi}</p>
                    </div>
                    <div>
                        <span className="text-gray-700 font-medium">Tanggal:</span>
                        <p className="font-semibold text-gray-900">{transaction && formatDate(transaction.tgl_transaksi)}</p>
                    </div>
                    <div>
                        <span className="text-gray-700 font-medium">Tipe Pelanggan:</span>
                        <p className="font-semibold text-gray-900 capitalize">{transaction?.type_pelanggan}</p>
                    </div>
                    <div>
                        <span className="text-gray-700 font-medium">Customer:</span>
                        <p className="font-semibold text-gray-900">
                            {transaction?.customer
                                ? `${transaction.customer.kode_customer} - ${transaction.customer.nama_customer}`
                                : transaction?.no_hp_customer
                            }
                        </p>
                    </div>
                </div>
            </div>

            {/* Detail Jasa */}
            {transaction?.transaction_services && transaction.transaction_services.length > 0 && (
                <div>
                    <h4 className="font-medium text-gray-900 mb-3">Detail Jasa</h4>
                    <div className="space-y-2">
                        {transaction.transaction_services.map((service, index) => (
                            <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded">
                                <span className="text-gray-900 font-medium">{service.nama_jasa}</span>
                                <span className="font-semibold text-gray-900">{formatCurrency(service.harga)}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Detail Barang */}
            {transaction?.transaction_items && transaction.transaction_items.length > 0 && (
                <div>
                    <h4 className="font-medium text-gray-900 mb-3">Detail Barang</h4>
                    <div className="space-y-2">
                        {transaction.transaction_items.map((item, index) => (
                            <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded">
                                <div>
                                    <p className="font-semibold text-gray-900">{item.item.nama_barang}</p>
                                    <p className="text-sm text-gray-700 font-medium">
                                        {item.item.kode_barang} - Qty: {item.jumlah}
                                    </p>
                                </div>
                                <span className="font-semibold text-gray-900">{formatCurrency(item.total_harga)}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Total */}
            <div className="border-t pt-4">
                <div className="flex justify-between items-center text-lg font-bold text-gray-900">
                    <span>Total Transaksi:</span>
                    <span className="text-blue-600">{transaction && formatCurrency(calculateTotal(transaction))}</span>
                </div>
            </div>
        </div>
    )

    const handleDelete = async (transaction: Transaction) => {
        if (!window.confirm(`Apakah Anda yakin ingin menghapus transaksi ${transaction.no_transaksi}?`)) {
            return
        }

        try {
            const response = await fetch(`/api/transactions/${transaction.id}`, {
                method: 'DELETE'
            })

            if (response.ok) {
                setRefreshTrigger(prev => prev + 1)
                alert('Transaksi berhasil dihapus')
            } else {
                let errorMessage = 'Unknown error'
                try {
                    const errorData = await response.json()
                    errorMessage = errorData.error || errorData.message || `HTTP ${response.status}: ${response.statusText}`
                } catch {
                    errorMessage = `HTTP ${response.status}: ${response.statusText}`
                }
                console.error('Delete error response:', response.status, response.statusText)
                alert(`Gagal menghapus transaksi: ${errorMessage}`)
            }
        } catch (error) {
            console.error('Error deleting transaction:', error)
            alert(`Terjadi kesalahan saat menghapus transaksi: ${error instanceof Error ? error.message : 'Network error'}`)
        }
    }

    const handleReprint = (transaction: Transaction) => {
        // Format data untuk reprint receipt
        const receipt = {
            no_transaksi: transaction.no_transaksi,
            tanggal_transaksi: transaction.tgl_transaksi,
            type_pelanggan: transaction.type_pelanggan,
            customer_name: transaction.type_pelanggan === 'member'
                ? transaction.customer?.nama_customer || 'Customer Member'
                : transaction.no_hp_customer || 'Customer Nonmember',
            no_hp_customer: transaction.no_hp_customer,
            services: (transaction.transaction_services || []).map((service: any) => ({
                nama_jasa: service.nama_jasa,
                harga: service.harga
            })),
            items: (transaction.transaction_items || []).map((item: any) => ({
                nama_barang: item.item.nama_barang,
                quantity: item.jumlah,
                harga: item.total_harga / item.jumlah
            })),
            total_amount: calculateTotal(transaction)
        }

        setReceiptData(receipt)
        setShowReceipt(true)
    }

    const handleView = (transaction: Transaction) => {
        setSelectedTransaction(transaction)
    }

    return (
        <>
            <DataManager
                title="Transaksi"
                data={transactions}
                columns={columns}
                loading={loading}
                onAdd={() => { }}
                onView={handleView}
                onDelete={handleDelete}
                onReprint={handleReprint}
                formComponent={<TransactionFormWithCallback />}
                viewComponent={selectedTransaction ? <TransactionView transaction={selectedTransaction} /> : null}
                addButtonText="Tambah Transaksi"
                emptyMessage="Belum ada transaksi yang tercatat"
            />

            {/* Transaction Receipt Modal */}
            {showReceipt && receiptData && (
                <TransactionReceipt
                    receiptData={receiptData}
                    onClose={() => {
                        setShowReceipt(false)
                        setReceiptData(null)
                    }}
                />
            )}
        </>
    )
}
