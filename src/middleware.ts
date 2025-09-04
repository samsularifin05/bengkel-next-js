import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Middleware ini akan dijalankan untuk setiap permintaan
export function middleware(request: NextRequest) {
    // Log permintaan untuk membantu debugging (hilangkan di production)
    if (process.env.NODE_ENV === 'development') {
        console.log(`Middleware handling: ${request.method} ${request.nextUrl.pathname}`)
    }

    // Periksa jika permintaan adalah untuk berkas statis atau API
    const { pathname } = request.nextUrl
    if (
        pathname.startsWith('/_next') ||
        pathname.startsWith('/api/') ||
        pathname.includes('.') // Berkas statis biasanya memiliki ekstensi
    ) {
        return NextResponse.next()
    }

    // Untuk permintaan lainnya, pastikan Next.js menanganinya
    return NextResponse.next()
}

// Tentukan jalur yang perlu dipantau oleh middleware ini
export const config = {
    // Pantau semua permintaan kecuali berkas statis dan API internal Next.js
    matcher: [
        /*
         * Cocokkan semua jalur kecuali untuk:
         * 1. /api/auth (endpoint API Next-Auth.js)
         * 2. /api/ (endpoint API lainnya)
         * 3. /_next (berkas internal Next.js)
         * 4. berkas statis (gambar, favicon, dll)
         */
        '/((?!api/|_next/|.*\\.|favicon.ico).*)',
    ],
}
