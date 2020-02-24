/**
 * name : bodh.js
 * author : Aman Jung Karki
 * Date : 11-Nov-2019
 * Description : All bodh service related information.
 */

//dependencies

const request = require('request');
const sunbirdService = require(ROOT_PATH+"/generics/helpers/shikshalokam");

/**
  * Generate Dial codes
  * @function
  * @name generateDialCodes
  * @param dialCodeData - body data for generating dial code.
  * @param dialCodeData.count - Count of dial code required.
  * @param dialCodeData.publisher - Publisher name.
  * @returns {Promise}
*/

var generateCodes = async function ( dialCodeData,token ) {

    const generateDialCodeUrl = 
    process.env.BODH_URL+messageConstants.common.endPoints.BODH_GENERATE_DIALCODE;

    return new Promise(async (resolve,reject)=>{
        try {
            
            let options = {
                "headers":{
                    "content-type": "application/json",
                    "authorization" : process.env.AUTHORIZATION,
                    "x-authenticated-user-token" : token,
                    "x-channel-id" : process.env.BODH_CHANNEL_ID 
                },
                json : dialCodeData
            };

            request.post(generateDialCodeUrl,options,callback);
            
            function callback(err,data){
                if( err ) {
                    throw {
                        message : messageConstants.apiResponses.BODH_SERVICE_DOWN
                    }
                } else {
                    let dialCodeData = data.body.result.dialcodes;
                    return resolve(dialCodeData)
                }
            }
        } catch(err) {
            return reject(err);
        }


    })
    
}

var publishCode = async function ( dialCode,token,dialCodeData ) {

    const publishDialCodeUrl = 
    process.env.BODH_URL+messageConstants.common.endPoints.BODH_PUBLISH_DIALCODE+dialCode;

    return new Promise(async (resolve,reject)=>{
        try {
            
            let options = {
                "headers":{
                    "content-type": "application/json",
                    "authorization" : process.env.AUTHORIZATION,
                    "x-authenticated-user-token" : token,
                    "x-channel-id" : process.env.BODH_CHANNEL_ID 
                },
                json : dialCodeData
            };

            request.post(publishDialCodeUrl,options,callback);
            
            function callback(err,data){
                if( err ) {
                    throw {
                        message : messageConstants.apiResponses.BODH_SERVICE_DOWN
                    }
                } else {
                    let dialCodeData = data.body.result.identifier;
                    return resolve(dialCodeData)
                }
            }
        } catch(err) {
            return reject(err);
        }


    })
    
}

var codeStatus = async function ( token,dialCodeData ) {

    const dialCodeStatusUrl = 
    process.env.BODH_URL+messageConstants.common.endPoints.BODH_DIALCODE_STATUS;

    return new Promise(async (resolve,reject)=>{
        try {
            
            let options = {
                "headers":{
                    "content-type": "application/json",
                    "authorization" : process.env.AUTHORIZATION,
                    "x-authenticated-user-token" : token,
                    "x-channel-id" : process.env.BODH_CHANNEL_ID 
                },
                json : dialCodeData
            };

            request.post(dialCodeStatusUrl,options,callback);
            
            function callback(err,data){
                if( err ) {
                    throw {
                        message : messageConstants.apiResponses.BODH_SERVICE_DOWN
                    }
                } else {
                    let dialCodeStatus = data.body.result.dialcode.status;
                    return resolve(dialCodeStatus)
                }
            }
        } catch(err) {
            return reject(err);
        }


    })
    
}

var linkContent = async function ( token,contentData ) {

    const linkContentUrl = 
    process.env.BODH_URL+messageConstants.common.endPoints.BODH_CONTENT_LINK;

    return new Promise(async (resolve,reject)=>{
        try {
            
            let options = {
                "headers":{
                    "content-type": "application/json",
                    "authorization" : process.env.AUTHORIZATION,
                    "x-authenticated-user-token" : token,
                    "x-channel-id" : process.env.BODH_CHANNEL_ID 
                },
                json : contentData
            };

            request.post(linkContentUrl,options,callback);
            
            function callback(err,data){
                if( err ) {
                    throw {
                        message : messageConstants.apiResponses.BODH_SERVICE_DOWN
                    }
                } else {
                    let linkContentStatus = data.statusMessage;
                    return resolve(linkContentStatus)
                }
            }
        } catch(err) {
            return reject(err);
        }


    })
    
}

var publishContent = async function ( contentData,contentId ) {

    const publishContentUrl = 
    process.env.BODH_URL+messageConstants.common.endPoints.BODH_PUBLISH_CONTENT+contentId;

    return new Promise(async (resolve,reject)=>{
        try {

            if( !global.publisherToken ) {

                let formData = {
                    client_id:"admin-cli",
                    username:process.env.BODH_PUBLISHER_USERNAME,
                    password:process.env.BODH_PUBLISHER_PASSWORD,
                    grant_type:"password"
                }
                global.publisherToken = 
                await sunbirdService.verifyKeyCloakAccessToken( formData );   
            }
            
            let options = {
                "headers":{
                    "content-type": "application/json",
                    "authorization" : process.env.AUTHORIZATION,
                    "x-authenticated-user-token" :  global.publisherToken.token ,
                    "x-channel-id" : process.env.BODH_CHANNEL_ID 
                },
                json : contentData
            };

            request.post(publishContentUrl,options,callback);
            
            function callback(err,data){
                if( err ) {
                    throw {
                        message : 
                        messageConstants.apiResponses.BODH_SERVICE_DOWN
                    };
                } else {
                    let publishContentData = data.statusMessage;
                    return resolve(publishContentData)
                }
            }
        } catch(err) {
            return reject(err);
        }
    })
    
}

module.exports = {
    generateCodes : generateCodes,
    publishCode : publishCode,
    codeStatus : codeStatus,
    linkContent : linkContent,
    publishContent : publishContent
};