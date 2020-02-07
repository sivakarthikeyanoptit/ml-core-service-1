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
    urlPrefix + messageConstants.common.endPoints.createProfile;

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
    urlPrefix + messageConstants.common.endPoints.updateProfile;

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
    urlPrefix + messageConstants.common.endPoints.verifyProfile+"/"+userId;
    
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
    urlPrefix + messageConstants.common.endPoints.platformUserProfile+"/"+userId;
    
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

module.exports = {
    createUserProfile: createUserProfile,
    updateUserProfile: updateUserProfile,
    verifyUserProfile: verifyUserProfile,
    platformUserProfile : platformUserProfile
};