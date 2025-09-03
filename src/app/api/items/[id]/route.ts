import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// DELETE /api/items/[id] - Hapus item by ID
export async function DELETE(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const id = parseInt(params.id)

        if (isNaN(id)) {
            return NextResponse.json(
                { error: 'ID item tidak valid' },
                { status: 400 }
            )
        }

        // Cek apakah item masih digunakan di transaction_items
        const existingTransactionItems = await prisma.transactionItem.findMany({
            where: { item_id: id }
        })

        if (existingTransactionItems.length > 0) {
            return NextResponse.json(
                { error: 'Item tidak dapat dihapus karena masih digunakan dalam transaksi' },
                { status: 400 }
            )
        }

        const item = await prisma.item.delete({
            where: { id }
        })

        return NextResponse.json({
            success: true,
            message: 'Item berhasil dihapus',
            data: item
        })
    } catch (error: any) {
        console.error('Delete item error:', error)
        if (error.code === 'P2025') {
            return NextResponse.json(
                { success: false, error: 'Item tidak ditemukan' },
                { status: 404 }
            )
        }
        return NextResponse.json(
            { success: false, error: 'Gagal menghapus item', details: error.message },
            { status: 500 }
        )
    }
}
