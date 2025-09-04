import { PrismaClient } from '@prisma/client'
import { withAccelerate } from '@prisma/extension-accelerate'

const globalForPrisma = globalThis as unknown as {
    prisma: ReturnType<typeof getPrismaClient> | undefined
}

function getPrismaClient() {
    const client = new PrismaClient({
        log: process.env.NODE_ENV === 'development' ? ['query'] : [],
    })

    return client.$extends(withAccelerate())
}

export const prisma = globalForPrisma.prisma ?? getPrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
