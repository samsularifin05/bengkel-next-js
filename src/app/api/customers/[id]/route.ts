import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// DELETE /api/customers/[id] - Hapus customer by ID
export async function DELETE(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const id = parseInt(params.id)
        console.log('Attempting to delete customer with ID:', id)

        if (isNaN(id)) {
            return NextResponse.json(
                { success: false, error: 'ID customer tidak valid' },
                { status: 400 }
            )
        }

        // Cek apakah customer masih digunakan di transaksi
        console.log('Checking existing transactions for customer:', id)
        const existingTransactions = await prisma.transaction.findMany({
            where: { customer_id: id }
        })

        if (existingTransactions.length > 0) {
            console.log('Customer has existing transactions, cannot delete')
            return NextResponse.json(
                { success: false, error: 'Customer tidak dapat dihapus karena masih memiliki transaksi' },
                { status: 400 }
            )
        }

        console.log('Proceeding to delete customer:', id)
        const customer = await prisma.customer.delete({
            where: { id }
        })

        console.log('Customer deleted successfully:', customer)

        return NextResponse.json({
            success: true,
            message: 'Customer berhasil dihapus',
            data: customer
        })
    } catch (error: any) {
        console.error('Delete customer error:', error)
        if (error.code === 'P2025') {
            return NextResponse.json(
                { success: false, error: 'Customer tidak ditemukan' },
                { status: 404 }
            )
        }
        return NextResponse.json(
            { success: false, error: 'Gagal menghapus customer', details: error.message },
            { status: 500 }
        )
    }
}
