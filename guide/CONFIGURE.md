<p align="center" style="text-align: center"><img src="https://raw.githubusercontent.com/ethanent/coroute/master/media/logo-core.png" width="500" alt="coroute logo"/></p>

> The awesome Node.js HTTP reverse-proxy server.

[GitHub](https://github.com/ethanent/coroute) | [NPM](https://www.npmjs.com/package/coroute)

## Configuring coroute

This is a list of config options and information about them!

`server` - a list of `servers` to spawn upon coroute start.

`route` - a list of `routes` to use for request routing.

### `server` Configuration

`server`s are named objects. Their names are used to reference them within `route`s.

`server`s in coroute configs have the following properties:

`host` - IP address to bind listener to.

`port` - Port to bind listener to.

`https` - optional. If not present, HTTPS is not enabled.
	`key` - relative path to key file (private)
	`cert` - relative path to SSL cert file (public)

### `route` Configuration

`routes` are instructions to listeners which explain how to route requests.

Routes are used in order of priority, as ordered in config.

`route` properties:

`from` - properties of requests to apply this route to. All are optional.
	`server` - name of `server` to apply route to
	`method` - method of HTTP request to apply route to
	`host` - host to apply route to (HTTP `Host` header)
	`path` - pathname to apply route to
		As String: exact case-sensitive match of pathnames
		As Object:
			`pattern` - Regular expression pattern, as String
			`flags` - Optional. Regular expression flags as string. Ex. 'i' for case-insensitive test.

`to` - defines where to route matching requests. String. Format: origin (Contains protocol and host. ex. `https://ethanent.me`)

## Default coroute configuration

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