# 🔧 Sistem Manajemen Bengkel

Aplikasi web untuk mengelola sistem bengkel yang dibuat menggunakan **Next.js**, **Tailwind CSS**, dan **SQLite** dengan **Prisma ORM**.

## 📋 Fitur Utama

### 1. **Manajemen Customer**
- Tambah customer baru dengan kode unik
- Data lengkap: kode, nama, nomor HP, alamat, tanggal daftar
- Validasi input dan error handling

### 2. **Manajemen Barang (Items)**
- Input data barang dengan kode unik
- Tracking stok barang
- Data: kode barang, nama, quantity, merek, harga
- Auto-update stok saat ada transaksi

### 3. **Sistem Transaksi**
- **Dua tipe pelanggan:**
  - **Member**: Terhubung dengan database customer
  - **Non-member**: Input nomor HP langsung
- **Detail transaksi:**
  - Jasa: Nama jasa dan harga
  - Barang: Pilih dari inventory dengan auto-calculate
- **Fitur tambahan:**
  - Multiple services per transaksi
  - Multiple items per transaksi  
  - Auto-update stok barang
  - Validasi stok tersedia

### 4. **Laporan Transaksi**
- Daftar semua transaksi dengan detail
- Modal detail untuk setiap transaksi
- Format mata uang Rupiah
- Summary total per transaksi

## 🗄️ Struktur Database

### **customers**
```sql
- id (Primary Key, Auto Increment)
- kode_customer (Unique)
- nama_customer
- no_hp  
- alamat_customer
- tgl_daftar (Default: NOW())
```

### **items** (barang)
```sql
- id (Primary Key, Auto Increment)
- kode_barang (Unique)
- nama_barang
- qty (quantity/stok)
- merek
- harga
```

### **transactions**
```sql  
- id (Primary Key, Auto Increment)
- no_transaksi (Unique)
- tgl_transaksi (Default: NOW())
- type_pelanggan (ENUM: 'member', 'nonmember')
- customer_id (Foreign Key ke customers.id, nullable)
- no_hp_customer (untuk non-member)
```

### **transaction_services** (detail jasa)
```sql
- id (Primary Key, Auto Increment) 
- transaksi_id (Foreign Key ke transactions.id)
- nama_jasa
- harga
```

### **transaction_items** (detail barang)
```sql
- id (Primary Key, Auto Increment)
- transaksi_id (Foreign Key ke transactions.id)
- item_id (Foreign Key ke items.id)
- jumlah
- total_harga
```

## 🚀 Instalasi & Setup

### 1. **Clone Repository**
```bash
git clone <repository-url>
cd bengkel
```

### 2. **Install Dependencies**
```bash
npm install
```

### 3. **Setup Database**
```bash
# Generate Prisma Client
npx prisma generate

# Run migrations
npx prisma migrate dev --name init

# Seed data (opsional)
npm run db:seed
```

### 4. **Jalankan Aplikasi**
```bash
npm run dev
```

Aplikasi akan berjalan di `http://localhost:3000`

## 📁 Struktur Folder

```
bengkel/
├── prisma/
│   ├── schema.prisma          # Schema database
│   ├── migrations/            # Migration files
│   ├── seed.js               # Data seed
│   └── dev.db               # SQLite database
├── src/
│   ├── app/
│   │   ├── api/              # API Routes
│   │   │   ├── customers/    # Customer endpoints
│   │   │   ├── items/        # Items endpoints  
│   │   │   └── transactions/ # Transaction endpoints
│   │   ├── layout.tsx        # Root layout
│   │   └── page.tsx          # Homepage
│   ├── components/
│   │   ├── CustomerForm.tsx      # Form input customer
│   │   ├── ItemForm.tsx          # Form input barang
│   │   ├── TransactionForm.tsx   # Form transaksi (kompleks)
│   │   └── TransactionList.tsx   # List & detail transaksi
│   └── lib/
│       └── prisma.ts         # Prisma client instance
├── package.json
└── README.md
```

## 🔧 API Endpoints

### **Customers**
- `GET /api/customers` - Ambil semua customer
- `POST /api/customers` - Tambah customer baru

### **Items**  
- `GET /api/items` - Ambil semua barang
- `POST /api/items` - Tambah barang baru

### **Transactions**
- `GET /api/transactions` - Ambil semua transaksi dengan relasi
- `POST /api/transactions` - Buat transaksi baru dengan detail
- `GET /api/transactions/[id]` - Detail transaksi by ID

## 📊 Contoh Data Seed

Aplikasi menyediakan data contoh:

### **Customers**
- C001 - John Doe
- C002 - Jane Smith  
- C003 - Bob Johnson

### **Items**
- B001 - Oli Mesin Shell Helix (50 pcs) - Rp 85,000
- B002 - Filter Udara Sakura (30 pcs) - Rp 45,000
- B003 - Busi NGK (100 pcs) - Rp 25,000
- B004 - Ban Michelin 185/65R15 (20 pcs) - Rp 750,000
- B005 - Aki GS Astra 55Ah (15 pcs) - Rp 650,000

### **Sample Transactions**
- TRX001 - Member dengan jasa + barang
- TRX002 - Non-member hanya jasa
- TRX003 - Member hanya barang

## 🎯 Fitur Teknis

### **Frontend (Next.js + Tailwind)**
- Server-side rendering (SSR)
- Responsive design dengan Tailwind CSS
- Form validation dan error handling
- Modal untuk detail transaksi
- Loading states dan user feedback

### **Backend (API Routes)**
- RESTful API dengan Next.js API Routes
- Transaction support untuk operasi kompleks
- Input validation dan error handling
- Foreign key relationships
- Auto-increment primary keys

### **Database (SQLite + Prisma)**
- Relational database dengan SQLite
- Type-safe database access dengan Prisma
- Auto-generated migrations
- Database seeding support
- Query logging untuk debugging

## 🔍 Cara Penggunaan

### **1. Tambah Customer**
1. Pilih tab "Customer"  
2. Isi form: Kode Customer, Nama, No HP, Alamat
3. Klik "Tambah Customer"

### **2. Tambah Barang**
1. Pilih tab "Barang"
2. Isi form: Kode Barang, Nama, Quantity, Merek, Harga  
3. Klik "Tambah Barang"

### **3. Buat Transaksi**
1. Pilih tab "Transaksi"
2. Isi nomor transaksi dan tipe pelanggan
3. **Untuk Member**: Pilih customer dari dropdown
4. **Untuk Non-member**: Masukkan nomor HP
5. **Tambah Jasa** (opsional):
   - Klik "+ Tambah Jasa"
   - Isi nama jasa dan harga
6. **Tambah Barang** (opsional):
   - Klik "+ Tambah Barang" 
   - Pilih barang dari dropdown
   - Masukkan jumlah (total harga auto-calculate)
7. Klik "Tambah Transaksi"

### **4. Lihat Daftar Transaksi**
1. Pilih tab "Daftar Transaksi"
2. Klik "Detail" pada transaksi untuk melihat detail lengkap

## 🔒 Validasi & Business Logic

### **Input Validation**
- Kode customer/barang harus unik
- Semua field required harus diisi
- Format nomor HP dan mata uang

### **Business Rules** 
- Stok barang otomatis dikurangi saat transaksi
- Validasi stok tersedia sebelum transaksi
- Member harus memilih customer existing
- Non-member wajib isi nomor HP
- Auto-calculate total harga barang

### **Error Handling**
- Database constraint violations  
- Stok tidak mencukupi
- Network errors
- Form validation errors

## 📈 Pengembangan Lanjutan

Fitur yang bisa dikembangkan:

1. **Authentication & Authorization**
   - Login system untuk operator bengkel
   - Role-based access control

2. **Reporting & Analytics** 
   - Laporan penjualan per periode
   - Grafik revenue dan items terlaris
   - Export data ke Excel/PDF

3. **Inventory Management**
   - Low stock alerts
   - Purchase orders untuk restock
   - Supplier management

4. **Customer Relationship**
   - History transaksi per customer
   - Loyalty program untuk member
   - Reminder service berkala

5. **Payment Integration**
   - Multiple payment methods
   - Payment tracking  
   - Receipt generation

## 🛠️ Teknologi yang Digunakan

- **Frontend**: Next.js 15, React 19, Tailwind CSS
- **Backend**: Next.js API Routes  
- **Database**: SQLite dengan Prisma ORM
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Dev Tools**: ESLint, Turbopack

## 📞 Support

Jika ada pertanyaan atau masalah, silakan buat issue di repository ini.

---

**© 2025 Sistem Manajemen Bengkel - Built with ❤️ using Next.js**
