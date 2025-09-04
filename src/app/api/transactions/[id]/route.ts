import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/transactions/[id] - Ambil transaksi by ID dengan semua relasi
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id: idParam } = await params
        const id = parseInt(idParam)

        if (isNaN(id)) {
            return NextResponse.json(
                { error: 'ID transaksi tidak valid' },
                { status: 400 }
            )
        }

        const transaction = await prisma.transaction.findUnique({
            where: { id },
            include: {
                customer: true,
                transaction_services: true,
                transaction_items: {
                    include: {
                        item: true
                    }
                }
            }
        })

        if (!transaction) {
            return NextResponse.json(
                { error: 'Transaksi tidak ditemukan' },
                { status: 404 }
            )
        }

        // Hitung total transaksi
        const totalServices = transaction.transaction_services.reduce(
            (sum, service) => sum + service.harga,
            0
        )
        const totalItems = transaction.transaction_items.reduce(
            (sum, item) => sum + item.total_harga,
            0
        )
        const grandTotal = totalServices + totalItems

        return NextResponse.json({
            ...transaction,
            summary: {
                total_services: totalServices,
                total_items: totalItems,
                grand_total: grandTotal
            }
        })
    } catch (error) {
        return NextResponse.json(
            { error: 'Gagal mengambil data transaksi' },
            { status: 500 }
        )
    }
}

// DELETE /api/transactions/[id] - Hapus transaksi by ID
export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id: paramId } = await params
        const id = parseInt(paramId)

        if (isNaN(id)) {
            return NextResponse.json(
                { error: 'ID transaksi tidak valid' },
                { status: 400 }
            )
        }

        // Ambil data transaksi dan items untuk restore stok
        const transaction = await prisma.transaction.findUnique({
            where: { id },
            include: {
                transaction_items: true
            }
        })

        if (!transaction) {
            return NextResponse.json(
                { error: 'Transaksi tidak ditemukan' },
                { status: 404 }
            )
        }

        // Gunakan transaction untuk memastikan atomicity
        const result = await prisma.$transaction(async (tx) => {
            // Restore stok barang
            for (const transactionItem of transaction.transaction_items) {
                await tx.item.update({
                    where: { id: transactionItem.item_id },
                    data: {
                        qty: {
                            increment: transactionItem.jumlah
                        }
                    }
                })
            }

            // Hapus transaksi (cascade delete akan hapus services dan items)
            const deletedTransaction = await tx.transaction.delete({
                where: { id }
            })

            return deletedTransaction
        })

        return NextResponse.json({
            message: 'Transaksi berhasil dihapus dan stok dikembalikan',
            data: result
        })
    } catch (error: any) {
        if (error.code === 'P2025') {
            return NextResponse.json(
                { error: 'Transaksi tidak ditemukan' },
                { status: 404 }
            )
        }
        return NextResponse.json(
            { error: 'Gagal menghapus transaksi' },
            { status: 500 }
        )
    }
}
