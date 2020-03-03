/**
 * name : user-management.js
 * author : Aman Jung Karki
 * Date : 11-Nov-2019
 * Description : All user management related api call.
 */

//dependencies

let urlPrefix = 
process.env.USER_MANAGEMENT_HOST + 
process.env.USER_MANAGEMENT_BASE_URL +
process.env.URL_PREFIX; 

const request = require('request');

/**
  * Create user profile. 
  * @function
  * @name createUserProfile
  * @returns {Promise} returns a Json consisting of created user profile data.
*/

var createUserProfile = function ( bodyData,token ) {

    const createUserProfileUrl = 
    urlPrefix + constants.endpoints.CREATE_USER_PROFILE;

    return new Promise(async (resolve, reject) => {
        try {

            const _userManagementCallBack = function (err, response) {
                if (err) {
                    logger.error("Failed to connect to user management service.");
                } else {
                    let userManagementData = JSON.parse(response.body);
                    return resolve(userManagementData);
                }
            }

            request.post(createUserProfileUrl, {
                form : bodyData,
                headers: {
                    "internal-access-token": process.env.INTERNAL_ACCESS_TOKEN,
                    "X-authenticated-user-token" : token 
                }
            },_userManagementCallBack);

        } catch (error) {
            return reject(error);
        }
    })

}

/**
  * Update user profile
  * @function
  * @name updateUserProfile
  * @returns {Promise} returns a Json consisting of user profile updated.
*/

var updateUserProfile = function ( bodyData,token ) {

    const updateUserProfileUrl = 
    urlPrefix + constants.endpoints.UPDATE_USER_PROFILE;

    return new Promise(async (resolve, reject) => {
        try {

            const _userManagementCallBack = function (err, response) {
                if (err) {
                    logger.error("Failed to connect to user management service.");
                } else {
                    let userManagementData = JSON.parse(response.body);
                    return resolve(userManagementData);
                }
            }

            await request.post(
                updateUserProfileUrl,
                {
                    form : bodyData,
                    headers: {
                        "internal-access-token": process.env.INTERNAL_ACCESS_TOKEN,
                        "X-authenticated-user-token" : token 
                    }
                },_userManagementCallBack
            )

        } catch (error) {
            return reject(error);
        }
    })

}

/**
  * Verify user profile information
  * @function
  * @name verifyUserProfile
  * @returns {Promise} returns a json indicating whether a user profile is verified or not.
*/

var verifyUserProfile = function ( userId,token ) {

    const verifyUserProfileUrl = 
    urlPrefix + constants.endpoints.VERIFY_USER_PROFILE+"/"+userId;
    
    return new Promise(async (resolve, reject) => {
        try {

            const _userManagementCallBack = function (err, response) {
                if (err) {
                    logger.error("Failed to connect to user management service.");
                } else {
                    let userManagementData = JSON.parse(response.body);
                    return resolve(userManagementData);
                }
            }

            request.get(
                verifyUserProfileUrl,{
                    headers: {
                        "internal-access-token": process.env.INTERNAL_ACCESS_TOKEN,
                        "X-authenticated-user-token" : token 
                    }
                },
                _userManagementCallBack
            )

        } catch (error) {
            return reject(error);
        }
    })

}

/**
  * Get platform user roles
  * @function
  * @name platformUserProfile
  * @returns {Promise} returns a promise.
*/

var platformUserProfile = function ( userId,token ) {

    const platformUserRolesUrl = 
    urlPrefix + constants.endpoints.PLATFORM_USER_PROFILE+"/"+userId;
    
    return new Promise(async (resolve, reject) => {
        try {

            const _userManagementCallBack = function (err, response) {
                if (err) {
                    logger.error("Failed to connect to user management service.");
                } else {
                    let userManagementData = JSON.parse(response.body);
                    return resolve(userManagementData);
                }
            }

            request.get(
                platformUserRolesUrl,{
                    headers: {
                        "internal-access-token": process.env.INTERNAL_ACCESS_TOKEN,
                        "X-authenticated-user-token" : token 
                    }
                },
                _userManagementCallBack
            )

        } catch (error) {
            return reject(error);
        }
    })

}

/**
  * User profile details.
  * @function
  * @name userProfileDetails
  * @returns {JSON} returns a profile details data.
*/

var userProfileDetails = function ( userId,token ) {

    const userProfileDetailsUrl = 
    urlPrefix + constants.endpoints.USER_PROFILE_DETAILS+"/"+userId;
    
    return new Promise(async (resolve, reject) => {
        try {

            const _userManagementCallBack = function (err, response) {
                if (err) {
                    logger.error("Failed to connect to user management service.");
                } else {
                    let userManagementData = JSON.parse(response.body);
                    return resolve(userManagementData);
                }
            }

            request.get(
                userProfileDetailsUrl,{
                    headers: {
                        "internal-access-token": process.env.INTERNAL_ACCESS_TOKEN,
                        "X-authenticated-user-token" : token 
                    }
                },
                _userManagementCallBack
            )

        } catch (error) {
            return reject(error);
        }
    })

}

module.exports = {
    createUserProfile: createUserProfile,
    updateUserProfile: updateUserProfile,
    verifyUserProfile: verifyUserProfile,
    platformUserProfile : platformUserProfile,
    userProfileDetails : userProfileDetails
};