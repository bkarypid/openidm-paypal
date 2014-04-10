'use strict';

var Hapi = require('hapi'),
Q = require('q'),
request = require('request'),
logger = require('../util/logger'),
utils = require('../util/utils');

/**
 * User object constructor
 * @param {object} options [options necessary to make the call to our repo, in order to find or create Users. At the moment OpenIDM is supported, but there might be a need to test with eg. mongodb]
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

//if type of repository is not specify, we set it to openidm by default (since it is the only one supported at the moment.)
	this.repoType = options.repoType || 'openidm';
	this.baseURL = options.baseURL;
	this.requestCredentials = options.requestCredentials;
	this.profile = profile;

	if (this.repoType.toLowerCase() === 'openidm') {
	//parameters specific to openidm rest api.
		this.searchURL = this.baseURL.match(/\/$/g) ? 'openidm/managed/user/' : '/openidm/managed/user/';
		var temp = this.profile.id.split('/');
		this.openidmUserId = temp[temp.length - 1];
		this.discoveryOpts = {
			url: this.baseURL + this.searchURL + this.openidmUserId,
			headers: {
				'X-OpenIDM-Username': this.requestCredentials.username,
				'X-OpenIDM-Password': this.requestCredentials.password,
				'Content-Type': 'application/json'
			},
		};
	}
	//at the moment openidm is only supported, so we throw an error if another repo is specified
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
	
	/**
	 * The search function uses the id of the user's paypal profile (in fact the last substring which has the unique identifier), to query the repo (currently openidm) for a user with a specific id.
	 * We distinguish between 4 different cases based on the outcome of our request. 
	 * Two of them are 'undesired' and as such reject the promise with an error. More specifically, this happens if the connection to the repo fails, or if the response is not what we would normally expect.
	 * The two acceptable responses are: Either the user exists (so its profile is fetched and openidm responds with a 200 status code in this case, or the user does not exist - yet the request was successful - in which case openidm responds with a 404)
	 * @return {promise}
	 */
	search: function () {
		var deferred = Q.defer();
		var errMsg = '';

		request(this.discoveryOpts, function (error, response, body) {
			if (error) {
				logger.log('error', error, {
					tags: ['repo query', 'user'],
					method: 'search'
				});
				deferred.reject(error);
			}
			else if (response.statusCode === 404) {
				logger.log('info', 'user not found', {
					tags: ['repo query', 'user'],
					method: 'search'
				});
				deferred.resolve('404');
			}
			else if (response.statusCode >= 200 && response.statusCode < 309) {
				var userDetails = JSON.parse(body);
				logger.log('info', 'user found', {
					tags: ['repo query', 'user'],
					method: 'search'
				});
				deferred.resolve(userDetails);
			}
			else {
				var errMsg = JSON.parse(body).message || 'check your request parameters';
				logger.log('error', error, {
					tags: ['repo query', 'user'],
					method: 'search'
				});
				deferred.reject(errMsg);
			}
		});

		return deferred.promise;
	},

/**
 * The create function is called when the user is not already present in openidm and needs to be created there. To do that:
 * 1) The user fields must be mapped to the corresponding fields of our repo. In the case of openidm, the mapper function does exactly so. In addition some more fields (such as paypalID) are also created.
 * 2) The request for a user creation is made to eg. openidm. We reject the promise with an error, when the connection cannot be established, or if there is an issue with our create request. 
 * When a user is successfully created, openidm's response is not rich, as it just return's the new user's id. It still returns a status code in the 2xx field (specifically 201) though, so this is therefore the safest bet for determmining if a user has been created, and it is easily generalizable for other external repos as well.
 * 3) Since the user's id was inserted in the user object at the moment of creation, we need to attach it to the object that is going to be passed back for serialization. This avoids making another search call in order to retrieve the object containing the user's id as well.
 * @return {[type]} [description]
 */
	create: function () {
		var deferred = Q.defer();
		var errMsg = '';
		var newUserProfile = this.profile._json;
		if (this.repoType.toLowerCase() === 'openidm') {
			utils.openidmAttributeMapper(newUserProfile);
		}
		this.discoveryOpts.body = JSON.stringify(newUserProfile);
		
		request.put(this.discoveryOpts, function (error, response, body) {
			if (error) {
				logger.log('error', error, {
					tags: ['repo query', 'user'],
					method: 'create'
				});
				deferred.reject(error);
			}
			else if (response.statusCode >= 200 && response.statusCode < 309) {
				logger.log('info', 'user created successfully', {
					tags: ['repo query', 'user'],
					method: 'create'
				});
				newUserProfile._id = JSON.parse(body)._id;
				deferred.resolve(newUserProfile);
			}
			else {
				var errMsg = JSON.parse(body).message || 'check your request parameters';
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



