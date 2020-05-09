/**
 * name : bodh.js
 * author : Aman Jung Karki
 * Date : 11-Nov-2019
 * Description : All bodh service related information.
 */

//dependencies

const request = require('request');
const shikshalokamService = require(ROOT_PATH+"/generics/helpers/shikshalokam");

/**
  * Generate Dial codes
  * @function
  * @name generateCodes
  * @param dialCodeData - body data for generating dial code.
  * @param dialCodeData.count - Count of dial code required.
  * @param dialCodeData.publisher - Publisher name.
  * @param token - Logged in user token.
  * @returns {Promise}
*/

var generateCodes = async function ( dialCodeData,token ) {

    const generateDialCodeUrl = 
    process.env.sunbird_url+constants.endpoints.SUNBIRD_GENERATE_DIALCODE;

    return new Promise(async (resolve,reject)=>{
        
        let options = {
            "headers":{
            "content-type": "application/json",
            "authorization" :  process.env.AUTHORIZATION,
            "x-authenticated-user-token" : token,
            "x-channel-id" : process.env.SUNBIRD_ORGANISATION_ID 
            },
            json : dialCodeData
        };
        
        request.post(generateDialCodeUrl,options,callback);
        
        function callback(err,data){
            if( err ) {
                return reject({
                    message : constants.apiResponses.SUNBIRD_SERVICE_DOWN
                });
            } else {
                let dialCodeData = data.body;
                return resolve(dialCodeData);
            }
        }
    })
    
}

/**
  * Publish dial code
  * @function
  * @name publishCode
  * @param dialCodeData - body data for generating dial code.
  * @param codeId - publish code based on unique id.
  * @param token - logged in user token .
  * @param dialCodeData
  * @returns {Promise}
*/

var publishCode = async function ( codeId,token,dialCodeData ) {

    const publishDialCodeUrl = 
    process.env.sunbird_url+constants.endpoints.SUNBIRD_PUBLISH_DIALCODE+"/"+codeId;

    return new Promise(async (resolve,reject)=>{
        
        let options = {
            "headers":{
            "content-type": "application/json",
            "authorization" : process.env.AUTHORIZATION,
            "x-authenticated-user-token" : token,
            "x-channel-id" : process.env.SUNBIRD_ORGANISATION_ID 
            },
            json : dialCodeData
        };

        request.post(publishDialCodeUrl,options,callback);
            
        function callback(err,data){
            if( err ) {
                return reject({
                    message : constants.apiResponses.SUNBIRD_SERVICE_DOWN
                });
            } else {
                let dialCodeData = data.body;
                return resolve(dialCodeData);
            }
        }
    })
}

/**
  * Get the status of the published code.
  * @function
  * @name codeStatus
  * @param dialCodeData
  * @param token - logged in user token .
  * @returns {String} status code
*/

var codeStatus = async function ( token,codeData ) {

    const dialCodeStatusUrl = 
    process.env.sunbird_url+constants.endpoints.SUNBIRD_DIALCODE_STATUS;

    return new Promise(async (resolve,reject)=>{
        
        let options = {
            "headers":{
            "content-type": "application/json",
            "authorization" :  process.env.AUTHORIZATION,
            "x-authenticated-user-token" : token,
            "x-channel-id" : process.env.SUNBIRD_ORGANISATION_ID 
            },
            json : codeData
        };

        request.post(dialCodeStatusUrl,options,callback);
            
        function callback(err,data){
            if( err ) {
                return reject({
                    message : constants.apiResponses.SUNBIRD_SERVICE_DOWN
                });
            } else {
                let dialCodeStatus = data.body;
                return resolve(dialCodeStatus);
            }
        }
    })
    
}

/**
  * Link the content data.
  * @function
  * @name linkContent
  * @param contentData - Link content data.
  * @param token - logged in user token.
  * @returns {String} status code
*/

var linkContent = async function ( token,contentData ) {

    const linkContentUrl = 
    process.env.sunbird_url+constants.endpoints.SUNBIRD_CONTENT_LINK;

    return new Promise(async (resolve,reject)=>{
        
        let options = {
            "headers":{
            "content-type": "application/json",
            "authorization" :  process.env.AUTHORIZATION,
            "x-authenticated-user-token" : token,
            "x-channel-id" : process.env.SUNBIRD_ORGANISATION_ID 
            },
            json : contentData
        };

        request.post(linkContentUrl,options,callback);
            
        function callback(err,data){
            if( err ) {
                return reject({
                    message : constants.apiResponses.SUNBIRD_SERVICE_DOWN
                })
            } else {
                let linkContentData = data.body;
                return resolve(linkContentData);
            }
        }
    })
    
}

/**
  * Publish content.
  * @function
  * @name publishContent
  * @param contentData - Content data.
  * @param contentId - Publish content id.
  * @returns {String}
*/

var publishContent = async function ( contentData,contentId ) {

    const publishContentUrl = 
    process.env.sunbird_url+constants.endpoints.SUNBIRD_PUBLISH_CONTENT+"/"+contentId;

    return new Promise(async (resolve,reject)=>{
        try {

            if( !global.publisherToken ) {

                global.publisherToken = 
                await shikshalokamService.generateKeyCloakAccessToken(
                    process.env.SUNBIRD_PUBLISHER_USERNAME,
                    process.env.SUNBIRD_PUBLISHER_PASSWORD 
                );   
            }
            
            let options = {
                "headers":{
                    "content-type": "application/json",
                    "authorization" : process.env.AUTHORIZATION,
                    "x-authenticated-user-token" :  global.publisherToken.token ,
                    "x-channel-id" : process.env.SUNBIRD_ORGANISATION_ID 
                },
                json : contentData
            };

            request.post(publishContentUrl,options,callback);
            
            function callback(err,data){
                if( err ) {
                    throw {
                        message : 
                        constants.apiResponses.SUNBIRD_SERVICE_DOWN
                    };
                } else {
                    let publishContentData = data.body;
                    return resolve(publishContentData)
                }
            }
        } catch(err) {
            return reject(err);
        }
    })
    
}


/**
  * Get user profile information.
  * @function
  * @name getUserProfile
  * @param token - Logged in user token.
  * @param userId - Logged in user id.
  * @returns {JSON} - user profile information
*/

var getUserProfile = async function ( token,userId ) {

    const userProfileUrl = 
    process.env.sunbird_url+constants.endpoints.SUNBIRD_USER_READ+"/"+userId;

    return new Promise(async (resolve,reject)=>{
        try {
            
            let options = {
                "headers": {
                    "content-type" : "application/json",
                    "authorization" : process.env.AUTHORIZATION,
                    "x-authenticated-user-token" :  token
                }
            };

            request.get(userProfileUrl,options,callback);
            
            function callback(err,data) {
                if( err || data.body.responseCode !== constants.common.OK) {
                    throw {
                        message : 
                        constants.apiResponses.SUNBIRD_SERVICE_DOWN
                    };
                } else {
                    let userProfileInformationData = data.body;
                    return resolve(JSON.parse(userProfileInformationData))
                }
            }
        } catch(err) {
            return reject(err);
        }
    })
    
}

/**
  * Sync index
  * @function
  * @name indexSync
  * @param syncData - Sync 
  * @param syncData.requests.objectType
  * @param syncData.requests.userIds {Array} - user ids
  * @param token - Logged in user token.
  * @returns {Promise}
*/

var indexSync = async function ( syncData,token ) {

    const indexSyncUrl = 
    process.env.sunbird_url+constants.endpoints.SUNBIRD_INDEX_SYNC;

    return new Promise(async (resolve,reject)=>{
        
        let options = {
            "headers":{
            "content-type": "application/json",
            "authorization" :  process.env.AUTHORIZATION,
            "x-authenticated-user-token" : token,
            "x-channel-id" : process.env.SUNBIRD_ORGANISATION_ID 
            },
            json : syncData
        };
        
        request.post(indexSyncUrl,options,callback);
        
        function callback(err,data){
            if( err ) {
                return reject({
                    message : constants.apiResponses.SUNBIRD_SERVICE_DOWN
                });
            } else {
                let indexSyncedData = data.body;
                return resolve(indexSyncedData);
            }
        }
    })
    
}

/**
  * Lists of organisations
  * @function
  * @name organisationList
  * @param requestData - requested data
  * @returns {Promise}
*/

var organisationList = async function (requestData) {

    const organisationUrl = 
    process.env.sunbird_url+constants.endpoints.SUNBIRD_ORGANISATION_LISTS;

    return new Promise(async (resolve,reject)=>{
        
        let options = {
            "headers" : {
                "content-type": "application/json",
                "authorization" :  process.env.AUTHORIZATION
            },
            json : requestData
        };
        
        request.post(organisationUrl,options,callback);
        
        function callback(err,data){
            if( err ) {
                return reject({
                    message : constants.apiResponses.SUNBIRD_SERVICE_DOWN
                });
            } else {
                let listOfOrganisations = data.body;
                return resolve(listOfOrganisations);
            }
        }
    })
    
}

module.exports = {
    generateCodes : generateCodes,
    publishCode : publishCode,
    codeStatus : codeStatus,
    linkContent : linkContent,
    publishContent : publishContent,
    getUserProfile : getUserProfile,
    indexSync : indexSync,
    organisationList : organisationList
};