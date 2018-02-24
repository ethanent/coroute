const path = require('path')
const http = require('http')
const https = require('https')
const util = require('util')
const fs = require('fs')
const pfs = {
	'readFile': util.promisify(fs.readFile)
}
const V = require('vaxic')

module.exports = class CorouteInternalServer {
	constructor (name, options, routes) {
		this.name = name
		this.options = options
		this.routes = routes.filter((route) => !(route.from.hasOwnProperty('server') && route.from.server !== name)) // Filter out routes not delegated to this server.

		this.app = new V()

		this.app.use(V.route)

		this.app.add(async (req, res) => {
			const useRoute = this.routes.find((route) => {
				if (route.from.hasOwnProperty('server') && route.from.server !== this.name) {
					return false
				}

				if (route.from.hasOwnProperty('host') && req.headers.hasOwnProperty('host') && route.from.host.toLowerCase() !== req.headers.host.toLowerCase()) {
					return false
				}

				if (route.from.hasOwnProperty('method') && route.from.method !== req.method) {
					return false
				}

				console.log('actual method: ' + req.method + '   route method: ' + route.from.method)

				return true
			})

			if (useRoute) {
				try {
					await res.route({
						'origin': useRoute.to
					})
				}
				catch (err) {
					console.error('Routing failed: ' + err)
					res.writeHead(500)
					res.end('Coroute 500: Routing failed.')
				}
			}
			else {
				res.writeHead(404)
				res.end('Coroute 404: No route found')
			}
		})

		this.startServer().then(() => {
			console.log('Server ' + name + ' has started.')
		}).catch((err) => {
			console.error('Server ' + name + ' failed to start: ' + err)
		})
	}

	async startServer () {
		if (this.options.hasOwnProperty('https')) {
			this.internalServer = https.createServer({
				'key': await pfs.readFile(path.resolve(process.cwd(), this.options.https.key)),
				'cert': await pfs.readFile(path.resolve(process.cwd(), this.options.https.cert))
			}, this.app.serverHandler)
		}
		else {
			this.internalServer = http.createServer(this.app.serverHandler)
		}

		this.app.internalServer.listen(this.options.port, this.options.host, () => {
			return
		})
	}
}