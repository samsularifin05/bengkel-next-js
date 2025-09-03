'use client'

import { useState, useEffect } from 'react'

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

export default function TransactionList() {
    const [transactions, setTransactions] = useState<Transaction[]>([])
    const [loading, setLoading] = useState(true)
    const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null)

    useEffect(() => {
        fetchTransactions()
    }, [])

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

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR'
        }).format(amount)
    }

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('id-ID', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        })
    }

    const calculateTotal = (transaction: Transaction) => {
        const totalServices = transaction.transaction_services.reduce((sum, service) => sum + service.harga, 0)
        const totalItems = transaction.transaction_items.reduce((sum, item) => sum + item.total_harga, 0)
        return totalServices + totalItems
    }

    const viewDetails = async (id: number) => {
        try {
            const response = await fetch(`/api/transactions/${id}`)
            const data = await response.json()
            setSelectedTransaction(data)
        } catch (error) {
            console.error('Error fetching transaction details:', error)
        }
    }

    if (loading) {
        return <div className="text-center py-8">Loading...</div>
    }

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-800">Daftar Transaksi</h2>

            {/* Transaction List */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                No. Transaksi
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Tanggal
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Customer
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Tipe
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Total
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Aksi
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {transactions.map((transaction) => (
                            <tr key={transaction.id} className="hover:bg-gray-50">
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                    {transaction.no_transaksi}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">
                                    {formatDate(transaction.tgl_transaksi)}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">
                                    {transaction.customer
                                        ? `${transaction.customer.kode_customer} - ${transaction.customer.nama_customer}`
                                        : transaction.no_hp_customer
                                    }
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${transaction.type_pelanggan === 'member'
                                            ? 'bg-green-100 text-green-800'
                                            : 'bg-blue-100 text-blue-800'
                                        }`}>
                                        {transaction.type_pelanggan}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                    {formatCurrency(calculateTotal(transaction))}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                    <button
                                        onClick={() => viewDetails(transaction.id)}
                                        className="text-indigo-600 hover:text-indigo-900"
                                    >
                                        Detail
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                {transactions.length === 0 && (
                    <div className="text-center py-8 text-gray-800">
                        Belum ada transaksi
                    </div>
                )}
            </div>

            {/* Transaction Detail Modal */}
            {selectedTransaction && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-lg max-w-2xl w-full max-h-screen overflow-y-auto">
                        <div className="p-6">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-lg font-medium text-gray-900">
                                    Detail Transaksi {selectedTransaction.no_transaksi}
                                </h3>
                                <button
                                    onClick={() => setSelectedTransaction(null)}
                                    className="text-gray-400 hover:text-gray-600"
                                >
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>

                            <div className="space-y-4">
                                {/* Transaction Info */}
                                <div className="bg-gray-50 p-4 rounded-lg">
                                    <h4 className="font-medium text-gray-900 mb-2">Informasi Transaksi</h4>
                                    <div className="grid grid-cols-2 gap-4 text-sm">
                                        <div>
                                            <span className="text-gray-700 font-medium">No. Transaksi:</span>
                                            <p className="font-semibold text-gray-900">{selectedTransaction.no_transaksi}</p>
                                        </div>
                                        <div>
                                            <span className="text-gray-700 font-medium">Tanggal:</span>
                                            <p className="font-semibold text-gray-900">{formatDate(selectedTransaction.tgl_transaksi)}</p>
                                        </div>
                                        <div>
                                            <span className="text-gray-700 font-medium">Tipe Pelanggan:</span>
                                            <p className="font-semibold text-gray-900 capitalize">{selectedTransaction.type_pelanggan}</p>
                                        </div>
                                        <div>
                                            <span className="text-gray-700 font-medium">Customer:</span>
                                            <p className="font-semibold text-gray-900">
                                                {selectedTransaction.customer
                                                    ? `${selectedTransaction.customer.kode_customer} - ${selectedTransaction.customer.nama_customer}`
                                                    : selectedTransaction.no_hp_customer
                                                }
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Services */}
                                {selectedTransaction.transaction_services.length > 0 && (
                                    <div>
                                        <h4 className="font-medium text-gray-900 mb-2">Detail Jasa</h4>
                                        <div className="space-y-2">
                                            {selectedTransaction.transaction_services.map((service, index) => (
                                                <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded">
                                                    <span className="text-gray-900 font-medium">{service.nama_jasa}</span>
                                                    <span className="font-semibold text-gray-900">{formatCurrency(service.harga)}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Items */}
                                {selectedTransaction.transaction_items.length > 0 && (
                                    <div>
                                        <h4 className="font-medium text-gray-900 mb-2">Detail Barang</h4>
                                        <div className="space-y-2">
                                            {selectedTransaction.transaction_items.map((item, index) => (
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
                                        <span className="text-blue-600">{formatCurrency(calculateTotal(selectedTransaction))}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
