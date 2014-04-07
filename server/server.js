'use strict';

var Hapi = require('hapi'),
util = require('util'),
PayPalStrategy = require('passport-paypal-openidconnect').Strategy,
config = require('./config'),
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
			password: 'worldofwalmart', // cookie secret
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

//serializing and deserializing a user, which is a required process by passport
Passport.serializeUser(function (user, done) {
	done(null, user);
});
Passport.deserializeUser(function (obj, done) {
	done(null, obj);
});

//initializing the paypal openid-connect strategy. TODO: validation function misses the find or create user functionality
var PAYPAL_APP_ID = "AcSjoRDN5xk8g9vLVPbGxrvRWejfD2rVTgkvgg67aCLax882mOH4rQlNV4db",
PAYPAL_APP_SECRET = "ENkxixCVBLuGs3aroZzrNDNCoMKThaP0jwJpp8rV-D0_NDxy4PNmK5LRM1Jj";

Passport.use(new PayPalStrategy({
	clientID: PAYPAL_APP_ID,
	clientSecret: PAYPAL_APP_SECRET,
	callbackURL: "https://sa.xgov.capgeminidigital.co.uk/auth/paypal/callback",
	authorizationURL: "https://www.sandbox.paypal.com/webapps/auth/protocol/openidconnect/v1/authorize",
	tokenURL: "https://www.paypal.com/webapps/auth/protocol/openidconnect/v1/tokenservice",
	profileURL: "https://api.sandbox.paypal.com/v1/identity/openidconnect/userinfo"
},
function (accessToken, refreshToken, profile, done) {
	console.log('is it going to be here at any point?');
	console.log(profile, accessToken);
	return done(null, profile);
}
));



var authRoute = {
	method: 'GET',
	path: '/auth/paypal',
	config: {
		auth: false,
		handler: function (request, reply) {
			console.log('its here');
			// reply().redirect('/login');
			Passport.authenticate('paypal')(request, reply);
		}
	}
};

var callbackRoute = {
	method: 'GET',
	path: '/auth/paypal/callback',
	config: {
		auth: false,
		handler: function (request, reply) {
			console.log('its here now');
			Passport.authenticate('paypal', {
				failureRedirect: '/sahome.html'
			})(request, reply, function (err) {
				reply().redirect('/summary.html');
			});
		}
	}
};

var authenticationRoutes = [authRoute, callbackRoute];



//defining our server routes
server.route(indexRoutes);
server.route(authenticationRoutes);

// Hook to provide index.html for any request
// server.ext('onPreResponse', function (request, reply) {
// 	var response = request.response;
// 	if (!response.isBoom || response.output.statusCode !== 404) {
// 		return reply();
// 	}
// 	reply.file('../client/dist/index.html');
// });

server.start();
console.log('Hapi server running in port ' + config.port);

module.exports = server;
