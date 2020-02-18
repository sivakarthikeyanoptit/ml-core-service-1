/**
 * name : user-management.js
 * author : Aman Jung Karki
 * Date : 11-Nov-2019
 * Description : All user management related api call.
 */

//dependencies

let urlPrefix = 
process.env.APPLICATION_BASE_HOST + 
process.env.UNNATI_SERVICE_BASE_URL +
process.env.URL_PREFIX; 

const request = require('request');

/*
* GetFilePublicBaseUrl 
*/

var getFilePublicBaseUrl = function ( bodyData,token ) {

    const getPublicBaseUrl = 
    urlPrefix + messageConstants.common.endPoints.getFilePublicBaseUrl;

    return new Promise(async (resolve, reject) => {
        try {

            return resolve("/unnati/Projects/PID1/");

            // const unnatiCallBack = function (err, response) {
            //     if (err) {
            //         logger.error("Failed to connect to unnati service.");
            //     } else {
            //         let unnatiData = JSON.parse(response.body);
            //         return resolve(unnatiData);
            //     }
            // }

            // request.get(getPublicBaseUrl, {
            //     headers: {
            //         "internal-access-token": process.env.INTERNAL_ACCESS_TOKEN,
            //         "X-auth-token" : token 
            //     }
            // },unnatiCallBack);

        } catch (error) {
            return reject(error);
        }
    })

}


module.exports = {
    getFilePublicBaseUrl: getFilePublicBaseUrl
};