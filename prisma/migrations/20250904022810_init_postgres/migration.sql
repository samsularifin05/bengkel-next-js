-- CreateEnum
CREATE TYPE "public"."TypePelanggan" AS ENUM ('member', 'nonmember');

-- CreateTable
CREATE TABLE "public"."customers" (
    "id" SERIAL NOT NULL,
    "kode_customer" TEXT NOT NULL,
    "nama_customer" TEXT NOT NULL,
    "no_hp" TEXT NOT NULL,
    "alamat_customer" TEXT NOT NULL,
    "tgl_daftar" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "customers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."items" (
    "id" SERIAL NOT NULL,
    "kode_barang" TEXT NOT NULL,
    "nama_barang" TEXT NOT NULL,
    "qty" INTEGER NOT NULL,
    "merek" TEXT NOT NULL,
    "harga" INTEGER NOT NULL,

    CONSTRAINT "items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."transactions" (
    "id" SERIAL NOT NULL,
    "no_transaksi" TEXT NOT NULL,
    "tgl_transaksi" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "type_pelanggan" "public"."TypePelanggan" NOT NULL,
    "customer_id" INTEGER,
    "no_hp_customer" TEXT,

    CONSTRAINT "transactions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."transaction_services" (
    "id" SERIAL NOT NULL,
    "transaksi_id" INTEGER NOT NULL,
    "nama_jasa" TEXT NOT NULL,
    "harga" INTEGER NOT NULL,

    CONSTRAINT "transaction_services_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."transaction_items" (
    "id" SERIAL NOT NULL,
    "transaksi_id" INTEGER NOT NULL,
    "item_id" INTEGER NOT NULL,
    "jumlah" INTEGER NOT NULL,
    "total_harga" INTEGER NOT NULL,

    CONSTRAINT "transaction_items_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "customers_kode_customer_key" ON "public"."customers"("kode_customer");

-- CreateIndex
CREATE UNIQUE INDEX "items_kode_barang_key" ON "public"."items"("kode_barang");

-- CreateIndex
CREATE UNIQUE INDEX "transactions_no_transaksi_key" ON "public"."transactions"("no_transaksi");

-- AddForeignKey
ALTER TABLE "public"."transactions" ADD CONSTRAINT "transactions_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "public"."customers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."transaction_services" ADD CONSTRAINT "transaction_services_transaksi_id_fkey" FOREIGN KEY ("transaksi_id") REFERENCES "public"."transactions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."transaction_items" ADD CONSTRAINT "transaction_items_transaksi_id_fkey" FOREIGN KEY ("transaksi_id") REFERENCES "public"."transactions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."transaction_items" ADD CONSTRAINT "transaction_items_item_id_fkey" FOREIGN KEY ("item_id") REFERENCES "public"."items"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
