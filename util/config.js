const util = require('util')
const fs = require('fs')
const pfs = {
	'readFileSync': util.promisify(fs.readFileSync)
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
				'server': 'my_https'
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
		configData = await pfs.readFileSync(configPath).toString()
	}
	catch (err) {
		await pfs.writeFileSync(configPath, JSON.stringify(defaultConfig, null, '\t'))
	}

	if (configData === false) {
		return defaultConfig
	}
	else {
		try {
			return JSON.parse(defaultConfig)
		}
		catch (err) {
			console.error('Fatal: Failed to parse config as it contains invalid JSON.')
			process.exit(1)
		}
	}
}