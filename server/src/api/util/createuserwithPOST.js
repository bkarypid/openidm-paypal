'use strict';

var Hapi = require('hapi'),
Q = require('q'),
request = require('request'),
logger = require('../util/logger');

/**
 * User object constructor
 * @param {object} options [options necessary to make the call to our repo, in order to find or create Users. At the moment OpenIDM is supported, but there might be a need to test with other repos]
 * @param {object} profile [user's profile as retrieved from paypal REST api]
 */
function User(options, profile) {

	var argErr = 'Incorrect number of arguments. Failed to create User object.';
	var typeErr = 'Both arguments must me objects. Failed to create User object.';
	if (arguments.length !== 2) {
		throw new Error(argErr);
	}
	if (typeof(options) !== 'object' && typeof(profile) !== 'object') {
		throw new Error(typeErr);
	}
	// options = options || {};
	// profile = profile || {};

	this.repoType = options.repoType ? options.repoType : 'openidm';
	this.baseURL = options.baseURL;
	this.requestCredentials = options.requestCredentials;
	this.profile = profile;

	if (this.repoType.toLowerCase() === 'openidm') {
		this.managedURL = this.baseURL.match(/\/$/g) ? 'openidm/managed/user' : '/openidm/managed/user';
		var temp = this.profile.id.split('/');
		this.openidmUserId = temp[temp.length - 1];
		this.discoveryOpts = {
			headers: {
				'X-OpenIDM-Username': this.requestCredentials.username,
				'X-OpenIDM-Password': this.requestCredentials.password,
				'Content-Type': 'application/json'
			},
		};
		console.log('discurl-->' + this.discoveryOpts.url);
	}
	else {
		var errMsg = this.repoType + ' repo is not currently supported';
		logger.log('error', errMsg, {
			tags: ['repo query', 'user'],
			method: 'search'
		});
	}

}

User.prototype = {

	constructor: User,
	

	search: function () {
		var deferred = Q.defer();
		var errMsg = '';
		console.log('search called');
		this.discoveryOpts.url = this.baseURL + this.managedURL + '/' + this.openidmUserId;
		console.log(this.discoveryOpts.url);
		request(this.discoveryOpts, function (error, response, body) {
			if (error) {
				logger.log('error', error, {
					tags: ['repo query', 'user'],
					method: 'search'
				});
				deferred.reject(error);
			}
			else if (response.statusCode === 404) {
				// console.log('body ' + body);
				// console.log('resbody ' + response.body);
				logger.log('info', 'user not found', {
					tags: ['repo query', 'user'],
					method: 'search'
				});
				deferred.resolve('404');
			}
			else if (response.statusCode === 200) {
				var userDetails = JSON.parse(body);
				logger.log('info', 'user found', {
					tags: ['repo query', 'user'],
					method: 'search'
				});
				deferred.resolve(userDetails);
			}
			else {
				var errMsg = JSON.parse(body).message ? JSON.parse(body).message : 'check your request parameters';
				logger.log('error', error, {
					tags: ['repo query', 'user'],
					method: 'search'
				});
				deferred.reject(errMsg);
			}
		});

		return deferred.promise;
	},


	create: function () {
		var deferred = Q.defer();
		var errMsg = '';
		console.log('create called');
		var newUserProfile = this.profile._json;
		if (this.repoType.toLowerCase() === 'openidm') {
			//TODO: create a separate 'mapping' function to satisfy OpenIDM validation policies (i.e. specific fields cannot be missing when creating a new profile). Add hasownproperty check.
			newUserProfile.givenName = newUserProfile.given_name;
			delete newUserProfile.given_name;
			newUserProfile.familyName = newUserProfile.family_name;
			delete newUserProfile.family_name;
			newUserProfile.phoneNumber = newUserProfile.phone_number;
			delete newUserProfile.phone_number;
			newUserProfile.displayName = newUserProfile.name;
			delete newUserProfile.name;
			newUserProfile.paypalID = newUserProfile.user_id;
			delete newUserProfile.user_id;
			newUserProfile._id = this.openidmUserId;
			newUserProfile.userName = newUserProfile.givenName.substring(0, 1).toLowerCase() + newUserProfile.familyName.toLowerCase();
			// delete newUserProfile.address;
			// delete newUserProfile.zoneinfo;
			// delete newUserProfile.user_id;
			this.discoveryOpts.url = this.baseURL + this.managedURL;
			this.discoveryOpts.qs = {'_action': 'create'};
		}
		this.discoveryOpts.body = JSON.stringify(newUserProfile);
		console.log('opts-> ' + this.discoveryOpts.body);
		
		request.post(this.discoveryOpts, function (error, response, body) {
			if (error) {
				logger.log('error', error, {
					tags: ['repo query', 'user'],
					method: 'create'
				});
				deferred.reject(error);
			}
			else if (response.statusCode === 200) {
				logger.log('info', 'user created successfully', {
					tags: ['repo query', 'user'],
					method: 'create'
				});
				deferred.resolve(this.profile);
			}
			else {
				// console.log('resbody2' + response.body);
				console.log('body2' + body);
				// console.log('parsedbody' + JSON.parse(body));
				var errMsg = JSON.parse(body).message ? JSON.parse(body).message : 'check your request parameters';
				logger.log('error', errMsg, {
					tags: ['repo query', 'user'],
					method: 'create'
				});
				deferred.reject(errMsg);
			}
		});

		return deferred.promise;
	}
};

module.exports = User;
