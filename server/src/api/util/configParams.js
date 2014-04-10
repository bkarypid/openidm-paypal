'use strict';

var configParams = {

	repoOptions: {
		repoType: 'openidm',
		baseURL: 'http://sso.immediate.capgeminidigital.co.uk:18080',
		requestCredentials: {
			username: 'openidm-admin',
			password: 'posafFIRM365'
		}
	},

	paypalStrategyOptions: {
		clientID: "ARDYdxAiS4uppeKM0xe8m793Z9LCe089FWkrQ9iM09fi2oUMUuF5cXdDDHnS",
		clientSecret: "ELe8-BD2GZv1c6zyMqteHNk6rCS4vXkQJp3J6oWfaSL9Q2yS4pL8KteinwmD",
		callbackURL: "http://1.1.98.24.xip.io:50500/auth/paypal/callback",
		authorizationURL: "https://www.sandbox.paypal.com/webapps/auth/protocol/openidconnect/v1/authorize",
		tokenURL: "https://api.sandbox.paypal.com/v1/identity/openidconnect/tokenservice",
		userInfoURL: "https://api.sandbox.paypal.com/v1/identity/openidconnect/userinfo"
	}
};

module.exports = configParams;