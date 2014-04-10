'use strict';

var Hapi = require('hapi'),
util = require('util'),
PayPalStrategy = require('passport-paypal-openidconnect').Strategy,
config = require('./config'),
User = require('./src/api/util/user'),
configParams = require('./src/api/util/configParams'),
indexRoutes = require('./src/api/index/indexRoutes');


//general server options
var options = {
	cors: true,
	cache: {
		engine: 'redis',
		partition: 'cm'
	}
};

//defining travelogue plug-in for hapi
var plugins = {
	yar: {
		cookieOptions: {
			password: 'posafFIRM365', // cookie secret
			isSecure: false // required for non-https applications
		}
	},
	travelogue: config
};

//create hapi server and use the travelogue plugin for passport
var server = Hapi.createServer('0.0.0.0', config.port, options);
server.pack.require(plugins, function (err) {
	if (err) {
		throw err;
	}
});

server.auth.strategy('passport', 'passport');

//by this, we are able to use passport with hapi normally
var Passport = server.plugins.travelogue.passport;

//serializing and deserializing a user, in order to map user to session.
Passport.serializeUser(function (user, done) {
	done(null, user._id);
});
Passport.deserializeUser(function (obj, done) {
	done(null, obj);
});

//initializing the paypal openid-connect strategy for the passport plug-in. TODO: validation function misses the find or create user functionality

Passport.use(new PayPalStrategy(configParams.paypalStrategyOptions, function (accessToken, refreshToken, profile, done) {
	var user = new User(configParams.repoOptions, profile);
	user.search()
	.then(function (searchResult) {
		if (searchResult !== '404') {
			console.log(searchResult);
			return done(null, searchResult);
		}
		else {
			user.create()
			.then(function (newProfile) {
				console.log(newProfile);
				return done(null, newProfile);
			});
		}
	})
	.fail(function (err) {
		console.log('error during validation: ' + err);
	});
}));

//routes used by the strategy

var authRoute = {
	method: 'GET',
	path: '/auth/paypal',
	config: {
		auth: false,
		handler: function (request, reply) {
			Passport.authenticate('paypal', {scope: 'profile email phone address'})(request, reply);
		}
	}
};

var callbackRoute = {
	method: 'GET',
	path: '/auth/paypal/callback',
	config: {
		auth: false,
		handler: function (request, reply) {
			Passport.authenticate('paypal', {
				failureRedirect: '/register.html',
				successRedirect: '/form.html',
				failureFlash: true
			})(request, reply, function (err) {
				if (err && err.isBoom) {
					return reply(err);
				}
				//if user serialization is not done properly, authentication will not take place at all and the flow goes here.
				return reply().redirect('/');
			});
		}
	}
};

var authenticationRoutes = [authRoute, callbackRoute];



//defining our server routes
server.route(indexRoutes);
server.route(authenticationRoutes);

server.start();
console.log('Hapi server running in port ' + config.port);

module.exports = server;
