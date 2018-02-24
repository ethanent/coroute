const util = require('util')
const fs = require('fs')
const pfs = {
	'readFile': util.promisify(fs.readFile),
	'writeFile': util.promisify(fs.writeFile)
}

const defaultConfig = {
	'listen': {
		'my_https': {
			'https': {
				'key': './key.pem',
				'cert': './cert.pem'
			},
			'port': 443,
			'host': 'localhost'
		},
		'my_http': {
			'host': 'localhost',
			'port': 80
		}
	},
	'route': [
		{
			'from': {
				'server': 'my_http',
				'host': 'example.com'
			},
			'to': 'http://localhost:5135'
		},
		{
			'from': {
				'server': 'my_https',
				'method': 'GET'
			},
			'to': 'http://localhost:5137'
		},
		{
			'from': {},
			'to': 'https://fallback.ethanent.example'
		}
	]
}

module.exports = async (configPath) => {
	let configData = false
	try {
		configData = await pfs.readFile(configPath)
	}
	catch (err) {
		await pfs.writeFile(configPath, JSON.stringify(defaultConfig, null, '\t'))
	}

	if (configData === false) {
		return defaultConfig
	}
	else {
		try {
			return JSON.parse(configData)
		}
		catch (err) {
			console.error('Fatal: Failed to parse config as it contains invalid JSON.')
			process.exit(1)
		}
	}
}