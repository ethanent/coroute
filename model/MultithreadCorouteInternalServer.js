// NOTE: Coroute multithreaded servers are currently experimental.

const path = require('path')
const http = require('http')
const https = require('https')
const util = require('util')
const cluster = require('cluster')
const os = require('os')
const fs = require('fs')
const pfs = {
	'readFile': util.promisify(fs.readFile)
}
const V = require('vaxic')

class CorouteInternalServer {
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

				if (route.from.hasOwnProperty('path')) {
					if (typeof route.from.path === 'object') { // is a regular expression
						const pathRegex = new RegExp(route.from.path.pattern, (route.from.path.flags ? route.from.path.flags : ''))

						if (!pathRegex.test(req.url.pathname)) return false
					}
					else if (route.from.path !== req.url.pathname) return false
				}

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

		if (cluster.isMaster) {
			for (let i = 0; i < os.cpus().length; i++) {
				cluster.fork({
					'name': this.name,
					'options': JSON.stringify(this.options),
					'routes': JSON.stringify(this.routes)
				})
			}
		}
		else {
			this.startServer().then(() => {
				console.log('Server ' + name + ' has started.')
			}).catch((err) => {
				console.error('Server ' + name + ' failed to start: ' + err)
			})
		}
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

module.exports = CorouteInternalServer

if (!cluster.isMaster) {
	console.log('Creating a child...')
	new CorouteInternalServer(process.env.name, JSON.parse(process.env.options), JSON.parse(process.env.routes))
}