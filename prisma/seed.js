const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
    console.log('🌱 Seeding database...')

    // Seed Customers
    console.log('📝 Creating customers...')
    const customers = await Promise.all([
        prisma.customer.create({
            data: {
                kode_customer: 'C001',
                nama_customer: 'John Doe',
                no_hp: '081234567890',
                alamat_customer: 'Jl. Sudirman No. 123, Jakarta'
            }
        }),
        prisma.customer.create({
            data: {
                kode_customer: 'C002',
                nama_customer: 'Jane Smith',
                no_hp: '081987654321',
                alamat_customer: 'Jl. Thamrin No. 456, Jakarta'
            }
        }),
        prisma.customer.create({
            data: {
                kode_customer: 'C003',
                nama_customer: 'Bob Johnson',
                no_hp: '081122334455',
                alamat_customer: 'Jl. Kuningan No. 789, Jakarta'
            }
        })
    ])

    // Seed Items
    console.log('📦 Creating items...')
    const items = await Promise.all([
        prisma.item.create({
            data: {
                kode_barang: 'B001',
                nama_barang: 'Oli Mesin Shell Helix',
                qty: 50,
                merek: 'Shell',
                harga: 85000
            }
        }),
        prisma.item.create({
            data: {
                kode_barang: 'B002',
                nama_barang: 'Filter Udara',
                qty: 30,
                merek: 'Sakura',
                harga: 45000
            }
        }),
        prisma.item.create({
            data: {
                kode_barang: 'B003',
                nama_barang: 'Busi NGK',
                qty: 100,
                merek: 'NGK',
                harga: 25000
            }
        }),
        prisma.item.create({
            data: {
                kode_barang: 'B004',
                nama_barang: 'Ban Michelin 185/65R15',
                qty: 20,
                merek: 'Michelin',
                harga: 750000
            }
        }),
        prisma.item.create({
            data: {
                kode_barang: 'B005',
                nama_barang: 'Aki GS Astra 55Ah',
                qty: 15,
                merek: 'GS Astra',
                harga: 650000
            }
        })
    ])

    // Seed Sample Transactions
    console.log('💳 Creating transactions...')

    // Transaction 1 - Member dengan jasa dan barang
    const transaction1 = await prisma.transaction.create({
        data: {
            no_transaksi: 'TRX001',
            type_pelanggan: 'member',
            customer_id: customers[0].id,
            transaction_services: {
                create: [
                    { nama_jasa: 'Ganti Oli Mesin', harga: 50000 },
                    { nama_jasa: 'Tune Up Engine', harga: 150000 }
                ]
            },
            transaction_items: {
                create: [
                    {
                        item_id: items[0].id, // Oli Shell
                        jumlah: 2,
                        total_harga: 170000
                    },
                    {
                        item_id: items[1].id, // Filter Udara
                        jumlah: 1,
                        total_harga: 45000
                    }
                ]
            }
        }
    })

    // Update stok barang setelah transaksi
    await prisma.item.update({
        where: { id: items[0].id },
        data: { qty: { decrement: 2 } }
    })
    await prisma.item.update({
        where: { id: items[1].id },
        data: { qty: { decrement: 1 } }
    })

    // Transaction 2 - Non-member hanya jasa
    const transaction2 = await prisma.transaction.create({
        data: {
            no_transaksi: 'TRX002',
            type_pelanggan: 'nonmember',
            no_hp_customer: '081999888777',
            transaction_services: {
                create: [
                    { nama_jasa: 'Cuci Motor', harga: 25000 },
                    { nama_jasa: 'Ganti Oli', harga: 40000 }
                ]
            }
        }
    })

    // Transaction 3 - Member beli barang saja
    const transaction3 = await prisma.transaction.create({
        data: {
            no_transaksi: 'TRX003',
            type_pelanggan: 'member',
            customer_id: customers[1].id,
            transaction_items: {
                create: [
                    {
                        item_id: items[2].id, // Busi NGK
                        jumlah: 4,
                        total_harga: 100000
                    },
                    {
                        item_id: items[4].id, // Aki GS
                        jumlah: 1,
                        total_harga: 650000
                    }
                ]
            }
        }
    })

    // Update stok barang setelah transaksi
    await prisma.item.update({
        where: { id: items[2].id },
        data: { qty: { decrement: 4 } }
    })
    await prisma.item.update({
        where: { id: items[4].id },
        data: { qty: { decrement: 1 } }
    })

    console.log('✅ Seeding completed!')
    console.log(`📊 Created:`)
    console.log(`   - ${customers.length} customers`)
    console.log(`   - ${items.length} items`)
    console.log(`   - 3 sample transactions`)
}

main()
    .catch((e) => {
        console.error('❌ Error seeding database:', e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
