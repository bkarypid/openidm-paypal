'use strict';

var utils = {

	openidmAttributeMapper: function (newUserProfile) {
		if (newUserProfile.hasOwnProperty('given_name')) {
			newUserProfile.givenName = newUserProfile.given_name;
			delete newUserProfile.given_name;
		}
		if (newUserProfile.hasOwnProperty('family_name')) {
			newUserProfile.familyName = newUserProfile.family_name;
			delete newUserProfile.family_name;
		}
		if (newUserProfile.hasOwnProperty('phone_number')) {
			newUserProfile.phoneNumber = newUserProfile.phone_number;
			delete newUserProfile.phone_number;
		}
		if (newUserProfile.hasOwnProperty('name')) {
			newUserProfile.displayName = newUserProfile.name;
			delete newUserProfile.name;
		}
		if (newUserProfile.hasOwnProperty('user_id')) {
			newUserProfile.paypalID = newUserProfile.user_id;
			delete newUserProfile.user_id;
		}
		if (newUserProfile.hasOwnProperty('givenName') && newUserProfile.hasOwnProperty('familyName')) {
			newUserProfile.userName = newUserProfile.givenName.substring(0, 1).toLowerCase() + newUserProfile.familyName.toLowerCase();
		}
		return newUserProfile;
	}
};

module.exports = utils;