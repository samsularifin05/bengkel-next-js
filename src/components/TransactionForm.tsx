'use client'

import { useState, useEffect } from 'react'
import { generateTransactionCode } from '@/lib/codeGenerator'

interface Customer {
    id: number
    kode_customer: string
    nama_customer: string
    no_hp: string
}

interface Item {
    id: number
    kode_barang: string
    nama_barang: string
    qty: number
    harga: number
}

interface Service {
    nama_jasa: string
    harga: string
}

// Used for API data submission
interface TransactionItemData {
    item_id: string
    jumlah: string
    discount: string
    total_harga: string
}

interface CreatedTransaction {
    id: number;
    no_transaksi: string;
    tgl_transaksi: string;
    type_pelanggan: 'member' | 'nonmember';
    nama_customer?: string;
    no_hp_customer?: string;
    customer?: {
        nama_customer: string;
        kode_customer: string;
    };
    transaction_services: Array<{
        nama_jasa: string;
        harga: number;
    }>;
    transaction_items: Array<{
        jumlah: number;
        total_harga: number;
        item: {
            nama_barang: string;
            kode_barang: string;
        }
    }>;
}

interface CartItem {
    id: string
    item_id: string
    kode_barang: string
    nama_barang: string
    harga: number
    jumlah: number
    discount: number // now in Rupiah instead of percentage
    subtotal: number
    total_setelah_discount: number
}

interface TransactionFormProps {
    onSuccess?: () => void
    onTransactionCreated?: (transactionData: CreatedTransaction) => void
}

export default function TransactionForm({ onSuccess, onTransactionCreated }: TransactionFormProps) {
    const [formData, setFormData] = useState({
        no_transaksi: '',
        type_pelanggan: 'member' as 'member' | 'nonmember',
        customer_id: '',
        nama_customer: '',
        no_hp_customer: ''
    })

    const [services, setServices] = useState<Service[]>([{ nama_jasa: '', harga: '' }])

    // Cart state for table-based approach
    const [cart, setCart] = useState<CartItem[]>([])

    // Current item form state
    const [currentItem, setCurrentItem] = useState({
        item_id: '',
        jumlah: '',
        discount: '0' // Discount in Rupiah
    })

    const [customers, setCustomers] = useState<Customer[]>([])
    const [items, setItems] = useState<Item[]>([])
    const [loading, setLoading] = useState(false)
    const [message, setMessage] = useState('')

    useEffect(() => {
        const generateCode = async () => {
            const newCode = await generateTransactionCode()
            setFormData(prev => ({ ...prev, no_transaksi: newCode }))
        }
        generateCode()

        fetchCustomers()
        fetchItems()
    }, [])

    // Keyboard shortcuts untuk scanner workflow
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            // F3 untuk focus ke scanner input
            if (e.key === 'F3') {
                e.preventDefault()
                const scannerInput = document.querySelector('input[placeholder="Scan atau ketik kode barang..."]') as HTMLInputElement
                if (scannerInput) {
                    scannerInput.focus()
                }
            }
        }

        window.addEventListener('keydown', handleKeyDown)
        return () => window.removeEventListener('keydown', handleKeyDown)
    }, [])

    const fetchCustomers = async () => {
        try {
            const response = await fetch('/api/customers')
            const data = await response.json()
            setCustomers(data)
        } catch (err) {
            console.error('Error fetching customers:', err)
        }
    }

    const fetchItems = async () => {
        try {
            const response = await fetch('/api/items')
            const data = await response.json()
            setItems(data)
        } catch (err) {
            console.error('Error fetching items:', err)
        }
    }

    const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        })
    }

    const handleServiceChange = (index: number, field: keyof Service, value: string) => {
        const newServices = [...services]
        newServices[index] = { ...newServices[index], [field]: value }
        setServices(newServices)
    }

    const handleCurrentItemChange = (field: string, value: string) => {
        setCurrentItem(prev => ({ ...prev, [field]: value }))
    }

    const handleBarcodeScanned = (scannedCode: string) => {
        if (!scannedCode.trim()) return

        // Cari barang berdasarkan kode barang
        const foundItem = items.find(item =>
            item.kode_barang.toLowerCase() === scannedCode.trim().toLowerCase()
        )

        if (foundItem) {
            // Cek stok tersedia
            if (foundItem.qty <= 0) {
                setMessage(`Barang "${foundItem.nama_barang}" stok habis!`)
                return
            }

            // Set item yang ditemukan ke current item
            setCurrentItem({
                item_id: foundItem.id.toString(),
                jumlah: '1',
                discount: '0'
            })

            setMessage(`✓ Barang berhasil dipindai: ${foundItem.nama_barang} (Stok: ${foundItem.qty})`)

            // Auto clear message setelah 3 detik
            setTimeout(() => setMessage(''), 3000)

            // Auto focus ke field jumlah setelah scan
            setTimeout(() => {
                const quantityInput = document.querySelector('input[placeholder="1"]') as HTMLInputElement
                if (quantityInput) {
                    quantityInput.focus()
                    quantityInput.select()
                }
            }, 100)

        } else {
            setMessage(`❌ Barang dengan kode "${scannedCode}" tidak ditemukan!`)
            setTimeout(() => setMessage(''), 3000)
        }
    }

    const addItemToCart = () => {
        if (!currentItem.item_id || !currentItem.jumlah) {
            setMessage('Pilih barang dan masukkan jumlah!')
            return
        }

        const item = items.find(i => i.id.toString() === currentItem.item_id)
        if (!item) {
            setMessage('Barang tidak ditemukan!')
            return
        }

        const jumlah = parseInt(currentItem.jumlah)
        const discount = parseFloat(currentItem.discount) || 0 // In Rupiah

        // Cek apakah barang sudah ada di cart
        const existingIndex = cart.findIndex(cartItem => cartItem.item_id === currentItem.item_id)
        const existingQuantity = existingIndex >= 0 ? cart[existingIndex].jumlah : 0
        const totalRequestedQuantity = existingQuantity + jumlah

        // Validasi stok tersedia
        if (totalRequestedQuantity > item.qty) {
            setMessage(`❌ Stok tidak cukup! Stok tersedia: ${item.qty}, di keranjang: ${existingQuantity}, diminta: ${jumlah}`)
            return
        }

        const subtotal = item.harga * jumlah

        // Ensure discount doesn't exceed subtotal
        const validDiscount = Math.min(discount, subtotal)

        const total_setelah_discount = subtotal - validDiscount

        if (existingIndex >= 0) {
            // Update item yang sudah ada
            const newCart = [...cart]
            const newJumlah = newCart[existingIndex].jumlah + jumlah
            const newSubtotal = item.harga * newJumlah

            // Ensure discount doesn't exceed subtotal when updating existing item
            const newValidDiscount = Math.min(validDiscount, newSubtotal)

            const newTotal = newSubtotal - newValidDiscount

            newCart[existingIndex] = {
                ...newCart[existingIndex],
                jumlah: newJumlah,
                discount: newValidDiscount,
                subtotal: newSubtotal,
                total_setelah_discount: newTotal
            }
            setCart(newCart)
        } else {
            // Tambah item baru
            const newCartItem: CartItem = {
                id: Date.now().toString(),
                item_id: currentItem.item_id,
                kode_barang: item.kode_barang,
                nama_barang: item.nama_barang,
                harga: item.harga,
                jumlah: jumlah,
                discount: validDiscount,
                subtotal: subtotal,
                total_setelah_discount: total_setelah_discount
            }
            setCart([...cart, newCartItem])
        }

        // Reset current item
        setCurrentItem({
            item_id: '',
            jumlah: '',
            discount: '0'
        })

        setMessage(`✓ ${item.nama_barang} berhasil ditambahkan ke daftar`)
        setTimeout(() => setMessage(''), 3000)

        // Auto focus ke barcode input
        setTimeout(() => {
            const barcodeInput = document.querySelector('input[placeholder="Scan atau ketik kode barang..."]') as HTMLInputElement
            if (barcodeInput) {
                barcodeInput.focus()
            }
        }, 100)
    }

    const removeFromCart = (id: string) => {
        setCart(cart.filter(item => item.id !== id))
        setMessage('Item berhasil dihapus dari daftar')
        setTimeout(() => setMessage(''), 3000)
    }

    const updateCartItem = (id: string, field: string, value: string | number) => {
        // For quantity updates, check stock limits
        if (field === 'jumlah') {
            const cartItem = cart.find(item => item.id === id)
            if (cartItem) {
                const newQuantity = Number(value)
                const itemData = items.find(i => i.id.toString() === cartItem.item_id)

                // Check if we have the item in our items array and if the quantity exceeds stock
                if (itemData && newQuantity > itemData.qty) {
                    setMessage(`❌ Stok tidak cukup! Stok tersedia: ${itemData.qty}, diminta: ${newQuantity}`)
                    return
                }
            }
        }

        const newCart = cart.map(item => {
            if (item.id === id) {
                // Store the updated field value in the updatedItem
                const updatedItem = { ...item, [field]: value }

                // Recalculate totals if jumlah or discount changed
                if (field === 'jumlah' || field === 'discount') {
                    // Get the updated values, using either the new value or the existing item value
                    const jumlah = field === 'jumlah' ? Number(value) : item.jumlah
                    const discount = field === 'discount' ? Number(value) : item.discount // In Rupiah

                    // Calculate subtotal based on quantity and price
                    const subtotal = item.harga * jumlah

                    // Ensure discount doesn't exceed subtotal
                    const validDiscount = Math.min(discount, subtotal)

                    // Calculate total after discount
                    const total_setelah_discount = subtotal - validDiscount

                    // Return the updated item with all recalculated values
                    return {
                        ...updatedItem,
                        jumlah: jumlah,
                        discount: validDiscount, // Use the validated discount
                        subtotal: subtotal,
                        total_setelah_discount: total_setelah_discount
                    }
                }
                return updatedItem
            }
            return item
        })
        setCart(newCart)
    }

    const addService = () => {
        setServices([...services, { nama_jasa: '', harga: '' }])
    }

    const removeService = (index: number) => {
        const newServices = services.filter((_: Service, i: number) => i !== index)
        setServices(newServices)
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setMessage('')

        try {
            // Convert cart to transaction items format
            const transactionItems = cart.map(cartItem => ({
                item_id: cartItem.item_id,
                jumlah: cartItem.jumlah.toString(),
                discount: cartItem.discount.toString(),
                total_harga: cartItem.total_setelah_discount.toString()
            }))

            const transactionData = {
                ...formData,
                services: services.filter(s => s.nama_jasa && s.harga),
                items: transactionItems
            }

            const response = await fetch('/api/transactions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(transactionData)
            })

            const data = await response.json()

            if (response.ok) {
                setMessage('Transaksi berhasil ditambahkan!')

                // Call the callback with transaction data for slip
                onTransactionCreated?.(data)

                // Reset form
                setFormData({
                    no_transaksi: '',
                    type_pelanggan: 'member',
                    customer_id: '',
                    nama_customer: '',
                    no_hp_customer: ''
                })
                setServices([{ nama_jasa: '', harga: '' }])
                setCart([])
                setCurrentItem({
                    item_id: '',
                    jumlah: '',
                    discount: '0'
                })

                // Generate new code
                const newCode = await generateTransactionCode()
                setFormData(prev => ({ ...prev, no_transaksi: newCode }))

                onSuccess?.()
            } else {
                setMessage(data.error || 'Terjadi kesalahan')
            }
        } catch (err) {
            console.error('Network error:', err);
            setMessage('Terjadi kesalahan jaringan')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="space-y-6">
            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Info Transaksi */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label htmlFor="no_transaksi" className="block text-sm font-semibold text-gray-800 mb-2">
                            No. Transaksi <span className="text-gray-500 font-normal">(Otomatis)</span>
                        </label>
                        <input
                            type="text"
                            id="no_transaksi"
                            name="no_transaksi"
                            value={formData.no_transaksi || 'Generating...'}
                            readOnly
                            className="w-full px-4 py-3 border border-gray-200 rounded-lg bg-gray-50 text-gray-800 font-semibold cursor-not-allowed focus:outline-none"
                        />
                    </div>

                    <div>
                        <label htmlFor="type_pelanggan" className="block text-sm font-semibold text-gray-800 mb-2">
                            Type Pelanggan <span className="text-red-500">*</span>
                        </label>
                        <select
                            id="type_pelanggan"
                            name="type_pelanggan"
                            value={formData.type_pelanggan}
                            onChange={handleFormChange}
                            required
                            className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-800 bg-white"
                        >
                            <option value="member">Member</option>
                            <option value="nonmember">Non-Member</option>
                        </select>
                    </div>
                </div>

                {/* Info Pelanggan */}
                {formData.type_pelanggan === 'member' ? (
                    <div>
                        <label htmlFor="customer_id" className="block text-sm font-semibold text-gray-800 mb-2">
                            Customer <span className="text-red-500">*</span>
                        </label>
                        <select
                            id="customer_id"
                            name="customer_id"
                            value={formData.customer_id}
                            onChange={handleFormChange}
                            required
                            className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-800 bg-white"
                        >
                            <option value="">Pilih Customer</option>
                            {customers.map(customer => (
                                <option key={customer.id} value={customer.id}>
                                    {customer.kode_customer} - {customer.nama_customer}
                                </option>
                            ))}
                        </select>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label htmlFor="nama_customer" className="block text-sm font-semibold text-gray-800 mb-2">
                                Nama Customer <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                id="nama_customer"
                                name="nama_customer"
                                value={formData.nama_customer}
                                onChange={handleFormChange}
                                required
                                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-800 bg-white placeholder-gray-400"
                                placeholder="Masukkan nama customer"
                            />
                        </div>
                        <div>
                            <label htmlFor="no_hp_customer" className="block text-sm font-semibold text-gray-800 mb-2">
                                No. HP Customer <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="tel"
                                id="no_hp_customer"
                                name="no_hp_customer"
                                value={formData.no_hp_customer}
                                onChange={handleFormChange}
                                required
                                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-800 bg-white placeholder-gray-400"
                                placeholder="081234567890"
                            />
                        </div>
                    </div>
                )}

                {/* Services */}
                <div className="border-t pt-6">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-semibold text-gray-800">Jasa</h3>
                        <button
                            type="button"
                            onClick={addService}
                            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
                        >
                            + Tambah Jasa
                        </button>
                    </div>

                    {services.map((service, index) => (
                        <div key={index} className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4 p-4 bg-gray-50 rounded-lg">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Nama Jasa
                                </label>
                                <input
                                    type="text"
                                    value={service.nama_jasa}
                                    onChange={(e) => handleServiceChange(index, 'nama_jasa', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-800 bg-white"
                                    placeholder="Ganti oli"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Harga
                                </label>
                                <input
                                    type="number"
                                    value={service.harga}
                                    onChange={(e) => handleServiceChange(index, 'harga', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-800 bg-white"
                                    placeholder="50000"
                                />
                            </div>
                            <div className="flex items-end">
                                {services.length > 1 && (
                                    <button
                                        type="button"
                                        onClick={() => removeService(index)}
                                        className="px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
                                    >
                                        Hapus
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Items */}
                <div className="border-t pt-6">
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <h3 className="text-lg font-semibold text-gray-800">Barang</h3>
                            <div className="text-sm text-gray-600 mt-1">
                                <p>📷 Scan barcode lalu tekan Enter</p>
                                <p className="text-xs">Shortcuts: F3 (Focus Scanner)</p>
                            </div>
                        </div>
                    </div>

                    {/* Single Item Form */}
                    <div className="mb-6 p-6 bg-blue-50 rounded-lg border border-blue-100 shadow-sm">
                        <div className="grid grid-cols-1 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    📷 Scan Barcode Barang
                                </label>
                                <input
                                    type="text"
                                    placeholder="Scan atau ketik kode barang..."
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') {
                                            e.preventDefault();
                                            handleBarcodeScanned(e.currentTarget.value);
                                            e.currentTarget.value = '';
                                        }
                                    }}
                                    className="w-full px-6 py-4 border-2 border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-2xl font-mono bg-white shadow-sm text-gray-800 tracking-wide"
                                    autoComplete="off"
                                    style={{ letterSpacing: '0.1em' }}
                                />
                            </div>

                            {/* Show selected item details */}
                            {currentItem.item_id && (
                                <div className="bg-white p-4 rounded-lg border border-blue-200">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <h4 className="font-semibold text-lg text-gray-800 flex items-center gap-2">
                                                <span className="text-green-600">✓</span>
                                                {items.find(item => item.id.toString() === currentItem.item_id)?.nama_barang}
                                            </h4>
                                            <p className="text-sm text-gray-600 mt-1 flex items-center gap-4">
                                                <span>📦 Kode: {items.find(item => item.id.toString() === currentItem.item_id)?.kode_barang}</span>
                                                <span>💰 Harga: Rp {items.find(item => item.id.toString() === currentItem.item_id)?.harga.toLocaleString('id-ID')}</span>
                                                <span>📊 Stok: {items.find(item => item.id.toString() === currentItem.item_id)?.qty}</span>
                                            </p>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => setCurrentItem({ item_id: '', jumlah: '', discount: '0' })}
                                            className="text-red-600 hover:text-red-800 p-1"
                                            title="Batal pilih barang"
                                        >
                                            ✕
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* Quantity and Discount inputs */}
                            <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Jumlah
                                        {currentItem.item_id && (
                                            <span className="text-sm font-normal text-gray-500 ml-2">
                                                (Stok: {items.find(item => item.id.toString() === currentItem.item_id)?.qty || 0})
                                            </span>
                                        )}
                                    </label>
                                    <input
                                        type="number"
                                        value={currentItem.jumlah}
                                        onChange={(e) => handleCurrentItemChange('jumlah', e.target.value)}
                                        placeholder="1"
                                        min="1"
                                        max={currentItem.item_id ? items.find(item => item.id.toString() === currentItem.item_id)?.qty || 999 : 999}
                                        className={`w-full px-4 py-4 border ${currentItem.item_id &&
                                            parseInt(currentItem.jumlah) > (items.find(item => item.id.toString() === currentItem.item_id)?.qty || 0)
                                            ? 'border-red-300 bg-red-50'
                                            : 'border-gray-300'
                                            } rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-800 shadow-sm text-lg`}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Discount (Rp)</label>
                                    <div className="relative">
                                        <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-gray-500 font-semibold text-lg">Rp</span>
                                        <input
                                            type="number"
                                            value={currentItem.discount}
                                            onChange={(e) => handleCurrentItemChange('discount', e.target.value)}
                                            placeholder="0"
                                            min="0"
                                            className="w-full pl-12 pr-3 py-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-800 shadow-sm text-lg"
                                        />
                                    </div>
                                </div>
                                <div className="flex items-end col-span-2 md:col-span-1">
                                    <button
                                        type="button"
                                        onClick={addItemToCart}
                                        disabled={!currentItem.item_id || !currentItem.jumlah}
                                        className="w-full px-4 py-4 bg-gray-400 text-white rounded-lg hover:bg-gray-500 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors font-medium text-lg"
                                    >
                                        +
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Cart Table */}
                    {cart.length > 0 && (
                        <div className="mb-6">
                            <h4 className="text-md font-semibold text-gray-800 mb-3 flex items-center gap-2">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                </svg>
                                Daftar Barang
                            </h4>
                            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                                <div className="overflow-x-auto">
                                    <table className="min-w-full divide-y divide-gray-200">
                                        <thead className="bg-blue-500">
                                            <tr>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Kode</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Nama Barang</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Harga</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Jumlah</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Discount (Rp)</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Subtotal</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Setelah Diskon</th>
                                                <th className="px-6 py-3 text-center text-xs font-medium text-white uppercase tracking-wider">Aksi</th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-200">
                                            {cart.map((cartItem) => (
                                                <tr key={cartItem.id} className="hover:bg-gray-50 transition-colors">
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-mono font-semibold text-gray-900">{cartItem.kode_barang}</td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">{cartItem.nama_barang}</td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                                                        <div className="flex items-center">
                                                            <span className="text-gray-500 mr-1">Rp</span>
                                                            {cartItem.harga.toLocaleString('id-ID')}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <input
                                                            type="number"
                                                            value={cartItem.jumlah}
                                                            onChange={(e) => {
                                                                const value = e.target.value === '' ? '1' : e.target.value;
                                                                updateCartItem(cartItem.id, 'jumlah', parseInt(value) || 1);
                                                            }}
                                                            onBlur={(e) => {
                                                                // Ensure value is at least 1 on blur
                                                                if (!e.target.value || parseInt(e.target.value) < 1) {
                                                                    updateCartItem(cartItem.id, 'jumlah', 1);
                                                                }
                                                            }}
                                                            min="1"
                                                            max={items.find(item => item.id.toString() === cartItem.item_id)?.qty || 999}
                                                            className="w-20 px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900"
                                                            title={`Stok tersedia: ${items.find(item => item.id.toString() === cartItem.item_id)?.qty || 'N/A'}`}
                                                        />
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="relative">
                                                            <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500">Rp</span>
                                                            <input
                                                                type="number"
                                                                value={cartItem.discount}
                                                                onChange={(e) => {
                                                                    const value = e.target.value === '' ? '0' : e.target.value;
                                                                    updateCartItem(cartItem.id, 'discount', parseFloat(value) || 0);
                                                                }}
                                                                onBlur={(e) => {
                                                                    // Recalculate on blur to ensure final value is correct
                                                                    updateCartItem(cartItem.id, 'discount', parseFloat(e.target.value) || 0);
                                                                }}
                                                                min="0"
                                                                className="w-32 pl-10 pr-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900"
                                                            />
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                                                        <div className="flex items-center">
                                                            <span className="text-gray-500 mr-1">Rp</span>
                                                            {cartItem.subtotal.toLocaleString('id-ID')}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">
                                                        <div className="flex items-center">
                                                            <span className="text-gray-500 mr-1">Rp</span>
                                                            {cartItem.total_setelah_discount.toLocaleString('id-ID')}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-center">
                                                        <button
                                                            type="button"
                                                            onClick={() => removeFromCart(cartItem.id)}
                                                            className="text-red-600 hover:text-red-900 transition-colors"
                                                            title="Hapus dari daftar"
                                                        >
                                                            Hapus
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                        <tfoot className="bg-green-500">
                                            <tr>
                                                <td colSpan={6} className="px-6 py-3 text-right font-medium text-white">Total Keseluruhan:</td>
                                                <td className="px-6 py-3 font-bold text-white">
                                                    <div className="flex items-center">
                                                        <span className="mr-1">Rp</span>
                                                        {cart.reduce((total, item) => total + item.total_setelah_discount, 0).toLocaleString('id-ID')}
                                                    </div>
                                                </td>
                                                <td></td>
                                            </tr>
                                        </tfoot>
                                    </table>
                                </div>
                            </div>
                        </div>
                    )}
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
                            'Tambah Transaksi'
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
