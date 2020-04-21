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
     * @apiParamExample {json} Request:
     * {
     * "file": "",
     * "filePath": "",
     * "bucketName": ""
     }
     * @apiSampleRequest /kendra/api/v1/cloud-services/azure/upload
     * @apiUse successBody
     * @apiUse errorBody
     * @apiParamExample {json} Response:
     * {
     *  "status": "",
     *  "result": ""
     * }
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
     * @apiParamExample {json} Request:
     * {
     * "filePaths": [],
     * "bucketName": ""
     * }
     * @apiSampleRequest /kendra/api/v1/cloud-services/azure/getDownloadableUrl
     * @apiUse successBody
     * @apiUse errorBody
     * @apiParamExample {json} Response:
     * {
     *  "status": 200,
     *  "message": "Url's generated successfully",
     *  "result": [{
     *  "filePath": "5bee56b30cd752559fd13012/f:a8ac51b2-2f8c-4911-b3f3-5f67aa28c644:2b655fd1-201d-4d2a-a1b7-9048a25c0afa/23-Oct-2018-8AM-image121.jpg",
     *  "url": "https://samikshaprod.blob.core.windows.net/samiksha/5bee56b30cd752559fd13012/f:a8ac51b2-2f8c-4911-b3f3-5f67aa28c644:2b655fd1-201d-4d2a-a1b7-9048a25c0afa/23-Oct-2018-8AM-image121.jpg?sv=2019-07-07&st=2020-04-06T11%3A37%3A23Z&se=2020-04-06T11%3A38%3A50Z&sr=b&sp=rw&sig=dcgL4SahoIMtI881bTj2ahii1QhQQhGewDR40sPBL88%3D"
     * }]
     * }
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

     /**
     * @api {post} /kendra/api/v1/cloud-services/azure/preSignedUrls  
     * Get signed URL.
     * @apiVersion 1.0.0
     * @apiGroup Aws
     * @apiHeader {String} X-authenticated-user-token Authenticity token
     * @apiParamExample {json} Request:
     * {
     * "path" : "qrcode/",
     * "fileNames" : [
     * "N4X6E2/N4X6E2.png"
     * ],
     * "bucket":"sl-unnati-storage"
     * }
     * @apiSampleRequest /kendra/api/v1/cloud-services/azure/preSignedUrls
     * @apiUse successBody
     * @apiUse errorBody
     * @apiParamExample {json} Response:
     * {
     * "message": "Url generated successfully",
     * "status": 200,
     * "result": [
     * {
     * "file": "T9R6Y8/T9R6Y8.png",
     * "url": "https://sl-unnati-storage.s3.ap-south-1.amazonaws.com/qrcode/T9R6Y8/T9R6Y8.png?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=AKIAJW4YWQMTNBKD2KTQ%2F20200421%2Fap-south-1%2Fs3%2Faws4_request&X-Amz-Date=20200421T024629Z&X-Amz-Expires=1800&X-Amz-Signature=81d593329c96b318f2924b876854e534bf80aef1f10ca80083d74188b46e69de&X-Amz-SignedHeaders=host",
     * "payload": {
     * "sourcePath": "qrcode/T9R6Y8/T9R6Y8.png"
     * },
     * "cloudStorage": "AZURE"
     * }
     * ]
     * }
     */

    /**
      * Get signed urls.
      * @method
      * @name preSignedUrls
      * @param  {Request}  req  request body.
      * @param  {String}  req.body.path
      * @param  {Array}  req.body.fileNames - list of file names.
      * @param  {String}  req.body.bucket - name of the bucket 
      * @returns {JSON} Response with status and message.
    */

   async preSignedUrls(req) {
    return new Promise(async (resolve, reject) => {

        try {

            let signedUrl =
            await filesHelpers.preSignedUrls(
                 req.body.path, 
                 req.body.fileNames,
                 req.body.bucket,
                 constants.common.AZURE_SERVICE
            );

            return resolve(signedUrl);

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

