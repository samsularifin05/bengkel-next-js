// Ensure environment variables are loaded at the very beginning
try {
    require('dotenv').config()
    console.log('Environment variables loaded from .env file')
} catch (error) {
    console.warn('Failed to load .env file:', error.message)
}

// Set a fallback DATABASE_URL if not defined in environment
if (!process.env.DATABASE_URL) {
    console.warn('DATABASE_URL not found in environment, using hardcoded fallback')
    process.env.DATABASE_URL = 'postgres://27f91cda97116c5c750e8bb46f085615bf165e9e3eb9e3eae566b59f09536cc9:sk_BGOJ2HjrGU4R70JpQAK1D@db.prisma.io:5432/postgres?sslmode=require'
}

const { createServer } = require('http')
const { parse } = require('url')
const next = require('next')
const dev = process.env.NODE_ENV !== 'production'
const hostname = 'localhost'
const port = process.env.PORT || 8080
const app = next({ dev, hostname, port })
const handle = app.getRequestHandler()

app.prepare().then(() => {
    createServer(async (req, res) => {
        const parsedUrl = parse(req.url, true)
        await handle(req, res, parsedUrl)
    }).listen(port, () => console.log(`> Ready on http://${hostname}:${port}`))
})
