# coroute
> The awesome Node.js HTTP reverse-proxy server.

## Install

```shell
npm i -g coroute
```

## Configure

Learn about configuring coroute with the [configuration guide](https://github.com/ethanent/coroute/blob/master/guide/CONFIGURE.md)!

The default coroute configuration is the following:

```json
{
	"listen": {
		"my_https": {
			"https": {
				"key": "./key.pem",
				"cert": "./cert.pem"
			},
			"port": 443,
			"host": "localhost"
		},
		"my_http": {
			"host": "localhost",
			"port": 80
		}
	},
	"route": [
		{
			"from": {
				"server": "my_http",
				"host": "example.com"
			},
			"to": "http://localhost:5135"
		},
		{
			"from": {
				"server": "my_https",
				"method": "GET"
			},
			"to": "http://localhost:5137"
		},
		{
			"from": {},
			"to": "https://fallback.ethanent.example"
		}
	]
}
```

## Start coroute

coroute
	--f / --config (optional) string - Relative config file location. Default: `./config.json`

If a config doesn't exist at the config location, the default config will be placed there.