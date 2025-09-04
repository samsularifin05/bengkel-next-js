import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/customers/[id] - Get a specific customer
export async function GET(
    request: NextRequest
) {
    try {
        const id = parseInt(request.nextUrl.pathname.split('/').pop() || '')

        if (isNaN(id)) {
            return NextResponse.json(
                { success: false, error: 'ID customer tidak valid' },
                { status: 400 }
            )
        }

        // Consultar customer por ID
        const customer = await prisma.customer.findUnique({
            where: {
                id: id
            }
        })

        if (!customer) {
            return NextResponse.json(
                { success: false, error: 'Customer tidak ditemukan' },
                { status: 404 }
            )
        }

        return NextResponse.json({
            success: true,
            data: customer
        })
    } catch (error: any) {
        console.error('Get customer error:', error)
        return NextResponse.json(
            { success: false, error: 'Gagal mendapatkan data customer', details: error.message },
            { status: 500 }
        )
    }
}

// PUT /api/customers/[id] - Update a customer
export async function PUT(
    request: NextRequest
) {
    try {
        const id = parseInt(request.nextUrl.pathname.split('/').pop() || '')

        if (isNaN(id)) {
            return NextResponse.json(
                { success: false, error: 'ID customer tidak valid' },
                { status: 400 }
            )
        }

        const body = await request.json()
        const { kode_customer, nama_customer, no_hp, alamat_customer } = body

        // Validasi input
        if (!kode_customer || !nama_customer || !no_hp || !alamat_customer) {
            return NextResponse.json(
                { success: false, error: 'Semua field harus diisi' },
                { status: 400 }
            )
        }

        // Update customer
        const customer = await prisma.customer.update({
            where: {
                id: id
            },
            data: {
                kode_customer: kode_customer,
                nama_customer: nama_customer,
                no_hp: no_hp,
                alamat_customer: alamat_customer
            }
        })

        return NextResponse.json({
            success: true,
            message: 'Customer berhasil diupdate',
            data: customer
        })
    } catch (error: any) {
        console.error('Update customer error:', error)
        if (error.code === 'P2025') {
            return NextResponse.json(
                { success: false, error: 'Customer tidak ditemukan' },
                { status: 404 }
            )
        }
        if (error.code === 'P2002') {
            return NextResponse.json(
                { success: false, error: 'Kode customer sudah digunakan' },
                { status: 400 }
            )
        }
        return NextResponse.json(
            { success: false, error: 'Gagal mengupdate customer', details: error.message },
            { status: 500 }
        )
    }
}

// DELETE /api/customers/[id] - Delete a customer
export async function DELETE(
    request: NextRequest
) {
    try {
        const id = parseInt(request.nextUrl.pathname.split('/').pop() || '')
        console.log('Attempting to delete customer with ID:', id)

        if (isNaN(id)) {
            return NextResponse.json(
                { success: false, error: 'ID customer tidak valid' },
                { status: 400 }
            )
        }

        // Cek apakah customer masih digunakan di transaksi
        console.log('Checking existing transactions for customer:', id)
        // Usar findMany para buscar transacciones
        const existingTransactions = await prisma.transaction.findMany({
            where: {
                customer_id: id
            }
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
            where: {
                id: id
            }
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
