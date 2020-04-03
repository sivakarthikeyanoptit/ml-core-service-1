/**
 * name : gcp.js
 * author : Deepa
 * created-date : 01-Apr-2020
 * Description :  Gcp service.
 */


// dependencies
let filesHelpers = require(ROOT_PATH+"/module/files/helper");

/**
    * Gcp service.
    * @class
*/

module.exports = class Gcp {

    /**
     * @apiDefine errorBody
     * @apiError {String} status 4XX,5XX
     * @apiError {String} message Error
     */

    /**
     * @apiDefine successBody
     * @apiSuccess {String} status 200
     * @apiSuccess {String} result Data
     */

    constructor() { }

    static get name() {
        return "gcp";
    }


    /**
     * @api {post} /kendra/api/v1/cloud-services/gcp/getDownloadableUrl  
     * Get downloadable URL.
     * @apiVersion 1.0.0
     * @apiGroup Gcp
     * @apiHeader {String} X-authenticated-user-token Authenticity token
     * @apiParamExample {json} Request-Body:
     * {
     * "filePath": "",
     * "bucketName": ""
  }
     * @apiSampleRequest /kendra/api/v1/cloud-services/gcp/getDownloadableUrl
     * @apiSuccessExample {json} Success-Response:
     * {
     *  "status": "",
     *  "result": ""
     * }
     * @apiUse errorBody
     */

    /**
      * Get Downloadable URL from aws.
      * @method
      * @name getDownloadableUrl
      * @param  {Request}  req  request body.
      * @returns {JSON} Response with status and message.
    */

    async getDownloadableUrl(req) {
        return new Promise(async (resolve, reject) => {

            try {

                let downloadableUrl =
                await filesHelpers.getDownloadableUrl(
                     req.body.filePath, 
                     req.body.bucketName,
                     constants.common.GOOGLE_CLOUD_SERVICE
                );

                return resolve({
                    result: downloadableUrl
                })

            } catch (error) {
                
                console.log(error);
                return reject({
                    status:
                        error.status ||
                        httpStatusCode["internal_server_error"].status,

                    message:
                        error.message
                        || httpStatusCode["internal_server_error"].message,

                    errorObject: error
                })

            }
        })

    }

};

