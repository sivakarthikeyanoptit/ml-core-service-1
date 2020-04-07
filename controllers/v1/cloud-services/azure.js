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
     * "filePaths": [],
     * "bucketName": ""
  }
     * @apiSuccessExample {json} Success-Response:
     * {
     *  "status": 200,
     *  "message": "Url's generated successfully",
     *  "result": [{
     *  "filePath": "5bee56b30cd752559fd13012/f:a8ac51b2-2f8c-4911-b3f3-5f67aa28c644:2b655fd1-201d-4d2a-a1b7-9048a25c0afa/23-Oct-2018-8AM-image121.jpg",
     *  "url": "https://samikshaprod.blob.core.windows.net/samiksha/5bee56b30cd752559fd13012/f:a8ac51b2-2f8c-4911-b3f3-5f67aa28c644:2b655fd1-201d-4d2a-a1b7-9048a25c0afa/23-Oct-2018-8AM-image121.jpg?sv=2019-07-07&st=2020-04-06T11%3A37%3A23Z&se=2020-04-06T11%3A38%3A50Z&sr=b&sp=rw&sig=dcgL4SahoIMtI881bTj2ahii1QhQQhGewDR40sPBL88%3D"
     * }]
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
                     req.body.filePaths, 
                     req.body.containerName,
                     constants.common.AZURE_SERVICE
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

