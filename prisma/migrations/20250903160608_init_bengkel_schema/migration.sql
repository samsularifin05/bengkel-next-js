-- CreateTable
CREATE TABLE "customers" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "kode_customer" TEXT NOT NULL,
    "nama_customer" TEXT NOT NULL,
    "no_hp" TEXT NOT NULL,
    "alamat_customer" TEXT NOT NULL,
    "tgl_daftar" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "items" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "kode_barang" TEXT NOT NULL,
    "nama_barang" TEXT NOT NULL,
    "qty" INTEGER NOT NULL,
    "merek" TEXT NOT NULL,
    "harga" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "transactions" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "no_transaksi" TEXT NOT NULL,
    "tgl_transaksi" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "type_pelanggan" TEXT NOT NULL,
    "customer_id" INTEGER,
    "no_hp_customer" TEXT,
    CONSTRAINT "transactions_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "customers" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "transaction_services" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "transaksi_id" INTEGER NOT NULL,
    "nama_jasa" TEXT NOT NULL,
    "harga" INTEGER NOT NULL,
    CONSTRAINT "transaction_services_transaksi_id_fkey" FOREIGN KEY ("transaksi_id") REFERENCES "transactions" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "transaction_items" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "transaksi_id" INTEGER NOT NULL,
    "item_id" INTEGER NOT NULL,
    "jumlah" INTEGER NOT NULL,
    "total_harga" INTEGER NOT NULL,
    CONSTRAINT "transaction_items_transaksi_id_fkey" FOREIGN KEY ("transaksi_id") REFERENCES "transactions" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "transaction_items_item_id_fkey" FOREIGN KEY ("item_id") REFERENCES "items" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "customers_kode_customer_key" ON "customers"("kode_customer");

-- CreateIndex
CREATE UNIQUE INDEX "items_kode_barang_key" ON "items"("kode_barang");

-- CreateIndex
CREATE UNIQUE INDEX "transactions_no_transaksi_key" ON "transactions"("no_transaksi");
