'use client'

import { useState, useEffect } from 'react'
import { generateItemCode } from '@/lib/codeGenerator'

interface ItemFormProps {
    onSuccess?: () => void
}

export default function ItemForm({ onSuccess }: ItemFormProps) {
    const [formData, setFormData] = useState({
        kode_barang: '',
        nama_barang: '',
        qty: '',
        merek: '',
        harga: ''
    })
    const [loading, setLoading] = useState(false)
    const [message, setMessage] = useState('')
    const [isClient, setIsClient] = useState(false)

    // Generate kode barang otomatis saat komponen dimount di client
    useEffect(() => {
        setIsClient(true)
        const generateCode = async () => {
            const newCode = await generateItemCode()
            setFormData(prev => ({ ...prev, kode_barang: newCode }))
        }
        generateCode()
    }, [])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setMessage('')

        try {
            const response = await fetch('/api/items', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData)
            })

            const data = await response.json()

            if (response.ok) {
                setMessage('Barang berhasil ditambahkan!')
                setFormData({
                    kode_barang: '',
                    nama_barang: '',
                    qty: '',
                    merek: '',
                    harga: ''
                })
                onSuccess?.()
            } else {
                setMessage(data.error || 'Terjadi kesalahan')
            }
        } catch (error) {
            setMessage('Terjadi kesalahan jaringan')
        } finally {
            setLoading(false)
        }
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        })
    }

    return (
        <div className="space-y-6">
            <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                    <label htmlFor="kode_barang" className="block text-sm font-semibold text-gray-800 mb-2">
                        Kode Barang <span className="text-gray-500 font-normal">(Otomatis)</span>
                    </label>
                    <input
                        type="text"
                        id="kode_barang"
                        name="kode_barang"
                        value={formData.kode_barang || 'Generating...'}
                        readOnly
                        className="w-full px-4 py-3 border border-gray-200 rounded-lg bg-gray-50 text-gray-800 font-semibold cursor-not-allowed focus:outline-none"
                    />
                </div>

                <div>
                    <label htmlFor="nama_barang" className="block text-sm font-semibold text-gray-800 mb-2">
                        Nama Barang <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="text"
                        id="nama_barang"
                        name="nama_barang"
                        value={formData.nama_barang}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-800 bg-white placeholder-gray-400"
                        placeholder="Masukkan nama barang"
                    />
                </div>

                <div>
                    <label htmlFor="qty" className="block text-sm font-semibold text-gray-800 mb-2">
                        Quantity <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="number"
                        id="qty"
                        name="qty"
                        value={formData.qty}
                        onChange={handleChange}
                        required
                        min="0"
                        className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-800 bg-white placeholder-gray-400"
                        placeholder="Masukkan jumlah stok"
                    />
                </div>

                <div>
                    <label htmlFor="merek" className="block text-sm font-semibold text-gray-800 mb-2">
                        Merek <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="text"
                        id="merek"
                        name="merek"
                        value={formData.merek}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-800 bg-white placeholder-gray-400"
                        placeholder="Masukkan merek barang"
                    />
                </div>

                <div>
                    <label htmlFor="harga" className="block text-sm font-semibold text-gray-800 mb-2">
                        Harga <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="number"
                        id="harga"
                        name="harga"
                        value={formData.harga}
                        onChange={handleChange}
                        required
                        min="0"
                        className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-800 bg-white placeholder-gray-400"
                        placeholder="Masukkan harga"
                    />
                </div>

                <div className="pt-4">
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-green-600 hover:bg-green-700 text-white py-3 px-6 rounded-lg font-semibold transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? (
                            <div className="flex items-center justify-center">
                                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Menyimpan...
                            </div>
                        ) : (
                            'Tambah Barang'
                        )}
                    </button>
                </div>
            </form>

            {message && (
                <div className={`p-4 rounded-lg border ${message.includes('berhasil')
                    ? 'bg-green-50 text-green-700 border-green-200'
                    : 'bg-red-50 text-red-700 border-red-200'
                    }`}>
                    <div className="flex items-center">
                        {message.includes('berhasil') ? (
                            <svg className="w-5 h-5 mr-2 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                        ) : (
                            <svg className="w-5 h-5 mr-2 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        )}
                        {message}
                    </div>
                </div>
            )}
        </div>
    )
}
