'use strict';

var indexRoute = {
	method: 'GET',
	path: '/{path*}',
	config: {auth: 'passport'},
	handler: {
		directory: { path: '../client/dist/', listing: false, index: true }
	}
};

var loginRoute = {
	method: 'GET',
	path: '/login',
	config: {
		auth: false,
		handler: {
			file: '../client/dist/sahome.html'
		}
	}
};

var cssRoute = {
	method: 'GET',
	path: '/app.css',
	config: {
		auth: false,
		handler: {
			file: '../client/dist/app.css'
		}
	}
};

var registerRoute = {
	method: 'GET',
	path: '/register.html',
	config: {
		auth: false,
		handler: {
			file: '../client/dist/register.html'
		}
	}
};


module.exports = [indexRoute, loginRoute, registerRoute, cssRoute];