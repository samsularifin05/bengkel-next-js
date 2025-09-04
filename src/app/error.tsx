'use client'

import { useEffect } from 'react'

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string }
    reset: () => void
}) {
    useEffect(() => {
        // Log the error to an error reporting service
        console.error('Application error:', error)
    }, [error])

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
            <div className="bg-white p-8 rounded-lg shadow-md max-w-lg w-full">
                <h2 className="text-2xl font-bold text-red-600 mb-4">
                    Terjadi Kesalahan
                </h2>
                <p className="text-gray-700 mb-4">
                    Mohon maaf, terjadi kesalahan saat memuat aplikasi.
                </p>
                <div className="bg-gray-100 p-4 rounded mb-4 overflow-auto">
                    <p className="font-mono text-sm break-all whitespace-pre-wrap">{error.message}</p>
                </div>
                <button
                    onClick={reset}
                    className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                >
                    Coba Lagi
                </button>
            </div>
        </div>
    )
}
