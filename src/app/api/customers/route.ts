import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/customers - Ambil semua customer
export async function GET() {
    try {
        const customers = await prisma.customer.findMany({
            orderBy: {
                tgl_daftar: 'desc'
            }
        })
        return NextResponse.json(customers)
    } catch (error: any) {
        console.error('Error fetching customers:', error)
        return NextResponse.json(
            {
                error: 'Gagal mengambil data customer',
                details: process.env.NODE_ENV === 'development' ? error.message : undefined
            },
            { status: 500 }
        )
    }
}

// POST /api/customers - Tambah customer baru
export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const { kode_customer, nama_customer, no_hp, alamat_customer } = body

        // Validasi input
        if (!kode_customer || !nama_customer || !no_hp || !alamat_customer) {
            return NextResponse.json(
                { error: 'Semua field harus diisi' },
                { status: 400 }
            )
        }

        const customer = await prisma.customer.create({
            data: {
                kode_customer,
                nama_customer,
                no_hp,
                alamat_customer
            }
        })

        return NextResponse.json(customer, { status: 201 })
    } catch (error: any) {
        if (error.code === 'P2002') {
            return NextResponse.json(
                { error: 'Kode customer sudah digunakan' },
                { status: 400 }
            )
        }
        return NextResponse.json(
            { error: 'Gagal menambah customer' },
            { status: 500 }
        )
    }
}
