import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/items - Ambil semua barang
export async function GET() {
    try {
        const items = await prisma.item.findMany({
            orderBy: {
                nama_barang: 'asc'
            }
        })
        return NextResponse.json(items)
    } catch (error) {
        return NextResponse.json(
            { error: 'Gagal mengambil data barang' },
            { status: 500 }
        )
    }
}

// POST /api/items - Tambah barang baru
export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const { kode_barang, nama_barang, qty, merek, harga } = body

        // Validasi input
        if (!kode_barang || !nama_barang || qty === undefined || !merek || harga === undefined) {
            return NextResponse.json(
                { error: 'Semua field harus diisi' },
                { status: 400 }
            )
        }

        const item = await prisma.item.create({
            data: {
                kode_barang,
                nama_barang,
                qty: parseInt(qty),
                merek,
                harga: parseInt(harga)
            }
        })

        return NextResponse.json(item, { status: 201 })
    } catch (error: any) {
        if (error.code === 'P2002') {
            return NextResponse.json(
                { error: 'Kode barang sudah digunakan' },
                { status: 400 }
            )
        }
        return NextResponse.json(
            { error: 'Gagal menambah barang' },
            { status: 500 }
        )
    }
}
