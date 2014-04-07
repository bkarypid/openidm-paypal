// 'use strict';

// var authRoute = {
// 	method: 'GET',
// 	path: '/auth/paypal',
// 	config: {
// 		auth: false,
// 		handler: function (request, reply) {

// 			Passport.authenticate('paypal')(request, reply);
// 		}
// 	}
// };

// var callbackRoute = {
// 	method: 'GET',
// 	path: '/auth/paypal/callback',
// 	config: {
// 		auth: false,
// 		handler: function (request, reply) {

// 			Passport.authenticate('paypal', {
// 				failureRedirect: '/sahome'
// 			})(request, reply, function (err) {
// 				reply().redirect('/summary');
// 			});
// 		}
// 	}
// };



// module.exports = [authRoute, callbackRoute];