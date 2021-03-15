/**
 * name : improvement-project.js
 * author : Aman Jung Karki
 * Date : 12-Mar-2021
 * Description : All improvement project related api call.
 */

//dependencies
const request = require('request');

/**
  * List of user assigned projects.
  * @function
  * @name assignedProjects
  * @param {String} token - logged in user token.
  * @param {Object} requestedData - Request body data.
  * @param {String} search - search data.
  * @param {String} filter - filter text.
  * @returns {Promise} returns a promise.
*/

var assignedProjects = function ( token,search = "",filter = "" ) {

    const url = 
    process.env.IMPROVEMENT_SERVICE_HOST +
    process.env.IMPROVEMENT_SERVICE_BASE_URL + "api/v1" +
    constants.endpoints.GET_USER_ASSIGNED_PROJECT;

    if( search !== "" ) {
        url += url + "?search=" + search; 
    }

    if( filter !== "" ) {

        if( search !== "" ) {
            url += url + "&filter=" + filter;
        } else {
            url += url + "?filter=" + filter;
        }
    }
    
    return new Promise(async (resolve, reject) => {
        try {

            function improvementProjectCallback(err, data) {

                let result = {
                    success : true
                };

                if (err) {
                    result.success = false;
                } else {
                    
                    let response = JSON.parse(data.body);
                    
                    if( response.status === httpStatusCode['ok'].status ) {
                        result["data"] = response.result;
                    } else {
                        result.success = false;
                    }
                }

                return resolve(result);
            }

            const options = {
                headers : {
                    "content-type": "application/json",
                    "x-authenticated-user-token" : token
                }
            };

            request.get(url,options,improvementProjectCallback)

        } catch (error) {
            return reject(error);
        }
    })

}

module.exports = {
    assignedProjects : assignedProjects
}