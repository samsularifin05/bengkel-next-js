import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/transactions - Ambil semua transaksi dengan relasi
export async function GET() {
    try {
        const transactions = await prisma.transaction.findMany({
            include: {
                customer: true,
                transaction_services: true,
                transaction_items: {
                    include: {
                        item: true
                    }
                }
            },
            orderBy: {
                tgl_transaksi: 'desc'
            }
        })
        return NextResponse.json(transactions)
    } catch (error) {
        return NextResponse.json(
            { error: 'Gagal mengambil data transaksi' },
            { status: 500 }
        )
    }
}

// POST /api/transactions - Tambah transaksi baru dengan detail jasa dan barang
export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const {
            no_transaksi,
            type_pelanggan,
            customer_id,
            no_hp_customer,
            services = [],
            items = []
        } = body

        // Validasi input
        if (!no_transaksi || !type_pelanggan) {
            return NextResponse.json(
                { error: 'No transaksi dan tipe pelanggan harus diisi' },
                { status: 400 }
            )
        }

        if (type_pelanggan === 'member' && !customer_id) {
            return NextResponse.json(
                { error: 'Customer ID harus diisi untuk member' },
                { status: 400 }
            )
        }

        if (type_pelanggan === 'nonmember' && !no_hp_customer) {
            return NextResponse.json(
                { error: 'No HP customer harus diisi untuk non-member' },
                { status: 400 }
            )
        }

        // Buat transaksi dengan detail menggunakan transaction
        const transaction = await prisma.$transaction(async (tx) => {
            // Buat transaksi utama
            const newTransaction = await tx.transaction.create({
                data: {
                    no_transaksi,
                    type_pelanggan: type_pelanggan as 'member' | 'nonmember',
                    customer_id: type_pelanggan === 'member' ? parseInt(customer_id) : null,
                    no_hp_customer: type_pelanggan === 'nonmember' ? no_hp_customer : null,
                }
            })

            // Tambah detail jasa jika ada
            if (services.length > 0) {
                await tx.transactionService.createMany({
                    data: services.map((service: any) => ({
                        transaksi_id: newTransaction.id,
                        nama_jasa: service.nama_jasa,
                        harga: parseInt(service.harga)
                    }))
                })
            }

            // Tambah detail barang jika ada dan update stok
            if (items.length > 0) {
                for (const item of items) {
                    // Check stok tersedia
                    const currentItem = await tx.item.findUnique({
                        where: { id: parseInt(item.item_id) }
                    })

                    if (!currentItem || currentItem.qty < parseInt(item.jumlah)) {
                        throw new Error(`Stok barang ${currentItem?.nama_barang || 'tidak ditemukan'} tidak mencukupi`)
                    }

                    // Tambah ke transaction items
                    await tx.transactionItem.create({
                        data: {
                            transaksi_id: newTransaction.id,
                            item_id: parseInt(item.item_id),
                            jumlah: parseInt(item.jumlah),
                            total_harga: parseInt(item.total_harga)
                        }
                    })

                    // Update stok barang
                    await tx.item.update({
                        where: { id: parseInt(item.item_id) },
                        data: {
                            qty: {
                                decrement: parseInt(item.jumlah)
                            }
                        }
                    })
                }
            }

            return newTransaction
        })

        // Ambil data lengkap transaksi yang baru dibuat
        const fullTransaction = await prisma.transaction.findUnique({
            where: { id: transaction.id },
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

        return NextResponse.json(fullTransaction, { status: 201 })
    } catch (error: any) {
        if (error.code === 'P2002') {
            return NextResponse.json(
                { error: 'No transaksi sudah digunakan' },
                { status: 400 }
            )
        }
        return NextResponse.json(
            { error: error.message || 'Gagal menambah transaksi' },
            { status: 500 }
        )
    }
}
