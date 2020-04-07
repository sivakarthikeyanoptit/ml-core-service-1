/**
 * name : azure.js
 * author : Deepa
 * created-date : 03-Apr-2020
 * Description :  Azure service.
 */


// dependencies
let filesHelpers = require(ROOT_PATH+"/module/files/helper");

/**
    * Azure service.
    * @class
*/

module.exports = class Azure {

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
        return "azure";
    }



    /**
     * @api {post} /kendra/api/v1/cloud-services/azure/upload  
     * Upload
     * @apiVersion 1.0.0
     * @apiGroup Azure
     * @apiHeader {String} X-authenticated-user-token Authenticity token
     * @apiParamExample {json} Request-Body:
     * {
     * "file": "",
     * "filePath": "",
     * "bucketName": ""
  }
     * @apiSuccessExample {json} Success-Response:
     * {
     *  "status": "",
     *  "result": ""
     * }
     * @apiSampleRequest /kendra/api/v1/cloud-services/azure/upload
     * @apiUse successBody
     * @apiUse errorBody
     */

    /**
      * Get Downloadable URL from azure.
      * @method
      * @name upload
      * @param  {Request}  req  request body.
      * @returns {JSON} Response with status and message.
    */

   async upload(req) {
    return new Promise(async (resolve, reject) => {

        try {

            let uploadResponse =
            await filesHelpers.uploadFile(
                 req.files.file.data,
                 req.body.filePath, 
                 req.body.containerName
            );

            return resolve({
                result: uploadResponse
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



    /**
     * @api {post} /kendra/api/v1/cloud-services/azure/getDownloadableUrl  
     * Get downloadable URL.
     * @apiVersion 1.0.0
     * @apiGroup Azure
     * @apiHeader {String} X-authenticated-user-token Authenticity token
     * @apiParamExample {json} Request-Body:
     * {
     * "filePath": "",
     * "bucketName": ""
  }
     * @apiSuccessExample {json} Success-Response:
     * {
     *  "status": "",
     *  "result": ""
     * }
     * @apiSampleRequest /kendra/api/v1/cloud-services/azure/getDownloadableUrl
     * @apiUse successBody
     * @apiUse errorBody
     */

    /**
      * Get Downloadable URL from azure.
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
                     req.body.containerName,
                     constants.common.AZURE_SERVICE
                );

                return resolve({
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

