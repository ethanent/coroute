#! /usr/bin/env node

const path = require('path')
const args = require('gar')(process.argv.slice(2))

;(async () => {
	const config = await (require(path.join(__dirname, '..', 'util', 'config.js'))(path.resolve(process.cwd(), (args.f || args.config || './config.json'))))
	const CorouteInternalServer = require(path.join(__dirname, '..', 'model', 'CorouteInternalServer.js'))

	const serverNames = Object.keys(config.listen)

	let servers = []

	serverNames.forEach((serverName) => {
		console.log('Starting server ' + serverName + '...')
		servers.push(new CorouteInternalServer(serverName, config.listen[serverName], config.route))
	})
})()