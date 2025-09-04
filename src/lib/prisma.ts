import { PrismaClient } from '@prisma/client'
import { withAccelerate } from '@prisma/extension-accelerate'

// Check if DATABASE_URL is defined and log a warning if it's not
if (!process.env.DATABASE_URL) {
    console.warn('WARNING: DATABASE_URL environment variable is not set. This will cause Prisma to fail.')

    // In production, this is a critical error
    if (process.env.NODE_ENV === 'production') {
        console.error('CRITICAL ERROR: DATABASE_URL must be set in production.')
    }
}

const DATABASE_URL = process.env.DATABASE_URL || 'postgres://27f91cda97116c5c750e8bb46f085615bf165e9e3eb9e3eae566b59f09536cc9:sk_BGOJ2HjrGU4R70JpQAK1D@db.prisma.io:5432/postgres?sslmode=require'

const globalForPrisma = globalThis as unknown as {
    prisma: ReturnType<typeof getPrismaClient> | undefined
}

function getPrismaClient() {
    try {
        const client = new PrismaClient({
            log: process.env.NODE_ENV === 'development' ? ['query'] : [],
            datasources: {
                db: {
                    url: DATABASE_URL,
                }
            }
        })

        // Tambahkan penanganan error khusus untuk Vercel
        const extendedClient = client.$extends(withAccelerate())
        return extendedClient
    } catch (error) {
        console.error('Failed to initialize Prisma client:', error)
        throw error
    }
}

export const prisma = globalForPrisma.prisma ?? getPrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
