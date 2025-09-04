'use client'

import { useState, useEffect } from 'react'
import { generateCustomerCode } from '@/lib/codeGenerator'

interface CustomerFormProps {
    onSuccess?: () => void
}

export default function CustomerForm({ onSuccess }: CustomerFormProps) {
    const [formData, setFormData] = useState({
        kode_customer: '',
        nama_customer: '',
        no_hp: '',
        alamat_customer: ''
    })
    const [loading, setLoading] = useState(false)
    const [message, setMessage] = useState('')
    const [isClient, setIsClient] = useState(false)

    // Generate kode customer otomatis saat komponen dimount di client
    useEffect(() => {
        setIsClient(true)
        const generateCode = async () => {
            const newCode = await generateCustomerCode()
            setFormData(prev => ({ ...prev, kode_customer: newCode }))
        }
        generateCode()
    }, [])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setMessage('')

        try {
            const response = await fetch('/api/customers', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData)
            })

            const data = await response.json()

            if (response.ok) {
                setMessage('Customer berhasil ditambahkan!')
                setFormData({
                    kode_customer: '',
                    nama_customer: '',
                    no_hp: '',
                    alamat_customer: ''
                })

                // Generate kode baru untuk form selanjutnya
                const newCode = await generateCustomerCode()
                setFormData(prev => ({ ...prev, kode_customer: newCode }))

                onSuccess?.()

                // Auto close modal after success
                setTimeout(() => {
                    const closeButton = document.querySelector('[data-close-modal]')
                    if (closeButton && typeof (closeButton as any).click === 'function') {
                        (closeButton as any).click()
                    }
                }, 1500)
            } else {
                // Tampilkan pesan error yang lebih detail
                if (data.code === 'P6001') {
                    setMessage('Error database: Konfigurasi URL database tidak valid');
                } else if (data.message) {
                    setMessage(`${data.error}: ${data.message}`);
                } else {
                    setMessage(data.error || 'Terjadi kesalahan');
                }
                console.error('API Error:', data);
            }
        } catch (error) {
            console.error('Fetch error:', error);
            setMessage('Terjadi kesalahan jaringan. Periksa konsol browser untuk detail.')
        } finally {
            setLoading(false)
        }
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        })
    }

    return (
        <div className="space-y-6">
            <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                    <label htmlFor="kode_customer" className="block text-sm font-semibold text-gray-800 mb-2">
                        Kode Customer <span className="text-gray-500 font-normal">(Otomatis)</span>
                    </label>
                    <input
                        type="text"
                        id="kode_customer"
                        name="kode_customer"
                        value={formData.kode_customer || 'Generating...'}
                        readOnly
                        className="w-full px-4 py-3 border border-gray-200 rounded-lg bg-gray-50 text-gray-800 font-semibold cursor-not-allowed focus:outline-none"
                    />
                </div>

                <div>
                    <label htmlFor="nama_customer" className="block text-sm font-semibold text-gray-800 mb-2">
                        Nama Customer <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="text"
                        id="nama_customer"
                        name="nama_customer"
                        value={formData.nama_customer}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-800 bg-white placeholder-gray-400"
                        placeholder="Masukkan nama lengkap"
                    />
                </div>

                <div>
                    <label htmlFor="no_hp" className="block text-sm font-semibold text-gray-800 mb-2">
                        No. HP <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="tel"
                        id="no_hp"
                        name="no_hp"
                        value={formData.no_hp}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-800 bg-white placeholder-gray-400"
                        placeholder="081234567890"
                    />
                </div>

                <div>
                    <label htmlFor="alamat_customer" className="block text-sm font-semibold text-gray-800 mb-2">
                        Alamat Customer <span className="text-red-500">*</span>
                    </label>
                    <textarea
                        id="alamat_customer"
                        name="alamat_customer"
                        value={formData.alamat_customer}
                        onChange={handleChange}
                        required
                        rows={3}
                        className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-800 bg-white placeholder-gray-400 resize-none"
                        placeholder="Masukkan alamat lengkap"
                    />
                </div>

                <div className="pt-4">
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-6 rounded-lg font-semibold transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
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
                            'Tambah Customer'
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
