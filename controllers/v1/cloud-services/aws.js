/**
 * name : aws.js
 * author : Deepa
 * created-date : 01-Apr-2020
 * Description :  Aws service.
 */


// dependencies
let filesHelpers = require(ROOT_PATH+"/module/files/helper");

/**
    * Aws service.
    * @class
*/

module.exports = class Aws {

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
        return "aws";
    }


    /**
     * @api {post} /kendra/api/v1/cloud-services/aws/getDownloadableUrl  
     * Get downloadable URL.
     * @apiVersion 1.0.0
     * @apiGroup Aws
     * @apiHeader {String} X-authenticated-user-token Authenticity token
     * @apiParamExample {json} Request-Body:
     * {
     * "filePaths": [],
     * "bucketName": ""
  }
     * @apiSuccessExample {json} Success-Response:
     * {
     *  "status": 200,
     *  "message": "Url's generated successfully",
     *  "result": [{
     *  "filePath": "5e1c28a050452374e1cf9841/e97b5582-471c-4649-8401-3cc4249359bb/cdv_photo_117.jpg",
     *  "url": "https://storage.googleapis.com/download/storage/v1/b/sl-dev-storage/o/5e1c28a050452374e1cf9841%2Fe97b5582-471c-4649-8401-3cc4249359bb%2Fcdv_photo_117.jpg?generation=1579240054787924&alt=media"
     * }]
     * @apiSampleRequest /kendra/api/v1/cloud-services/aws/getDownloadableUrl
     * @apiUse successBody
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
                     req.body.filePaths, 
                     req.body.bucketName,
                     constants.common.AWS_SERVICE
                );

                return resolve({
                    message: constants.apiResponses.CLOUD_SERVICE_SUCCESS_MESSAGE,
                    result: downloadableUrl
                })

            } catch (error) {

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

