const { createServer } = require('http')
const { parse } = require('url')
const next = require('next')
const dev = process.env.NODE_ENV !== 'production'
const hostname = 'localhost'
const port = process.env.port || 8080
const app = next({ dev, hostname, port })
const handle = app.getRequestHandler()
app.prepare().then(() => {
    createServer(async (req, res) => {
        const parsedUrl = parse(req.url, true)
        await handle(req, res, parsedUrl)
    }).listen(port, () => console.log(`> Ready on http://${hostname}:${port}`))
})
