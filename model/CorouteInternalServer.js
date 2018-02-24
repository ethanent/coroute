const path = require('path')
const http = require('http')
const https = require('https')
const util = require('util')
const fs = require('fs')
const pfs = {
	'readFileSync': util.promisify(fs.readFileSync)
}
const V = require('vaxic')

module.exports = class CorouteInternalServer {
	constructor (name, options, routes) {
		this.name = name
		this.options = options
		this.routes = routes.filter((route) => !(route.from.hasOwnProperty('server') && route.from.server !== name)) // Filter out routes not delegated to this server.

		this.app = new V()

		this.app.use(V.route)

		this.app.add(this.coreHandler)

		this.startServer().then(() => {
			console.log('Server ' + name + ' has started.')
		}).catch((err) => {
			console.error('Server ' + name + 'failed to start: ' + err)
		})
	}

	coreHandler (req, res) {
		const useRoute = routes.find((route) => {
			if (route.from.hasOwnProperty('server') && route.from.server !== this.name) {
				return false
			}

			if (route.from.hasOwnProperty('host') && req.headers.hasOwnProperty('host') && route.from.host.toLowerCase() !== req.headers.host.toLowerCase()) {
				return false
			}

			return true
		})

		if (useRoute) {
			res.route({
				'origin': useRoute.to
			})
		}
		else {
			res.writeHead(404)
			res.end('Coroute 404: No route found')
		}
	}

	async startServer () {
		if (this.options.hasOwnProperty('https')) {
			this.internalServer = https.createServer({
				'key': await pfs.readFileSync(path.resolve(process.cwd(), options.https.key)),
				'cert': await pfs.readFileSync(path.resolve(process.cwd(), options.https.cert))
			}, this.app.serverHandler)
		}
		else {
			this.internalServer = http.createServer(this.app.serverHandler)
		}

		this.app.serverHandler.listen(options.port, options.host, () => {
			return
		})
	}
}