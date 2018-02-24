#! /usr/bin/env node

const path = require('path')
const args = require('gar')(process.args.slice(2))

const config = require(path.join(__dirname, '..', 'util', 'config.js'))(path.resolve(process.cwd(), (args.d || './config.json')))
const CorouteInternalServer = require(path.join(__dirname, '..', 'model', 'CorouteInternalServer.js'))

const serverNames = Object.keys(config.listen)

let servers = []

serverNames.forEach((serverName) => {
	servers.push(new CorouteInternalServer(serverName, config.listen[serverName], config.route))
})

