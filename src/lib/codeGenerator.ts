// Utility functions untuk generate kode otomatis

export const generateCustomerCode = async (): Promise<string> => {
    try {
        const response = await fetch('/api/customers')
        const customers = await response.json()
        const lastCustomer = customers[0] // customers sudah diorder by tgl_daftar desc

        if (!lastCustomer) {
            return 'C001'
        }

        // Extract number dari kode terakhir (misal: C001 -> 001)
        const lastNumber = parseInt(lastCustomer.kode_customer.substring(1))
        const nextNumber = lastNumber + 1

        // Format dengan leading zeros
        return `C${nextNumber.toString().padStart(3, '0')}`
    } catch (error) {
        console.error('Error generating customer code:', error)
        return 'C001'
    }
}

export const generateItemCode = async (): Promise<string> => {
    try {
        const response = await fetch('/api/items')
        const items = await response.json()

        // Sort by kode_barang untuk mendapatkan yang terakhir
        items.sort((a: any, b: any) => b.kode_barang.localeCompare(a.kode_barang))
        const lastItem = items[0]

        if (!lastItem) {
            return 'B001'
        }

        // Extract number dari kode terakhir (misal: B001 -> 001)
        const lastNumber = parseInt(lastItem.kode_barang.substring(1))
        const nextNumber = lastNumber + 1

        // Format dengan leading zeros
        return `B${nextNumber.toString().padStart(3, '0')}`
    } catch (error) {
        console.error('Error generating item code:', error)
        return 'B001'
    }
}

export const generateTransactionCode = async (): Promise<string> => {
    try {
        const response = await fetch('/api/transactions')
        const transactions = await response.json()
        const lastTransaction = transactions[0] // transactions sudah diorder by tgl_transaksi desc

        if (!lastTransaction) {
            return 'TRX001'
        }

        // Extract number dari kode terakhir (misal: TRX001 -> 001)
        const lastNumber = parseInt(lastTransaction.no_transaksi.substring(3))
        const nextNumber = lastNumber + 1

        // Format dengan leading zeros
        return `TRX${nextNumber.toString().padStart(3, '0')}`
    } catch (error) {
        console.error('Error generating transaction code:', error)
        return 'TRX001'
    }
}
