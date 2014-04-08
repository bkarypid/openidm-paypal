'use strict';

var indexRoute = {
	method: 'GET',
	path: '/{path*}',
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
			file: '../client/dist/register.html'
		}
	}
};

// var cssRoute = {
// 	method: 'GET',
// 	path: '/app.css',
// 	config: {
// 		auth: false,
// 		handler: {
// 			file: '../client/dist/app.css'
// 		}
// 	}
// };

// var registerRoute = {
// 	method: 'GET',
// 	path: '/register.html',
// 	config: {
// 		auth: false,
// 		handler: {
// 			file: '../client/dist/register.html'
// 		}
// 	}
// };

var summaryRoute = {
	method: 'GET',
	path: '/summary.html',
	config: {auth: 'passport'},
	handler: {
		file: '../client/dist/summary.html'
	}
};


module.exports = [indexRoute, summaryRoute, loginRoute];