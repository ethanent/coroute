<p align="center" style="text-align: center"><img src="https://raw.githubusercontent.com/ethanent/coroute/master/media/logo-core.png" width="650" alt="coroute logo"/></p>

> The awesome Node.js HTTP reverse-proxy server.

[GitHub](https://github.com/ethanent/coroute) | [NPM](https://www.npmjs.com/package/coroute)

## Configuring coroute

This is a list of config options and information about them!

`server` - a list of `servers` to spawn upon coroute start.

`route` - a list of `routes` to use for request routing.

## `server` Configuration

`server`s are objects with names. Their names are used to reference them within `route`s.

`server`s in coroute configs have the following properties:

`host` - IP address to bind listener to.

`port` - Port to bind listener to.

`https` - optional. If not present, HTTPS is not enabled.
	`key` - relative path to key file (private)
	`cert` - relative path to SSL cert file (public)

## `route` Configuration

`routes` are instructions to listeners which explain how to route requests.

Routes are used in order of priority, as ordered in config.

`route` properties:

`from` - properties of requests to apply this route to. All are optional.
	`server` - name of `server` to apply route to
	`method` - method of HTTP request to apply route to
	`host` - host to apply route to (HTTP `Host` header)

`to` - defines where to route matching requests. String. Format: origin (Contains protocol and host. ex. `https://ethanent.me`)
