'use client'

import Link from 'next/link'

export default function NotFound() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
            <div className="bg-white p-8 rounded-lg shadow-md max-w-lg w-full">
                <h2 className="text-2xl font-bold text-red-600 mb-4">
                    404 - Halaman Tidak Ditemukan
                </h2>
                <p className="mb-6 text-gray-600">
                    Maaf, halaman yang Anda cari tidak ditemukan atau telah dipindahkan.
                </p>
                <div className="flex space-x-4">
                    <Link
                        href="/"
                        className="bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded transition-colors"
                    >
                        Kembali ke Beranda
                    </Link>
                    <button
                        onClick={() => window.history.back()}
                        className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-2 px-4 rounded transition-colors"
                    >
                        Kembali ke Halaman Sebelumnya
                    </button>
                </div>
            </div>
        </div>
    )
}
