/**
 * name : files.js
 * author : Rakesh
 * created-date : 12-Mar-2021
 * Description :  Files Controller.
 */


// dependencies
let filesHelpers = require(ROOT_PATH+"/module/files/helper");

/**
    * Files service.
    * @class
*/

module.exports = class Files {

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
        return "files";
    }


    /**
     * @api {post} /kendra/api/v1/cloud-services/files/preSignedUrls  
     * Get signed URL.
     * @apiVersion 1.0.0
     * @apiGroup Files
     * @apiHeader {String} X-authenticated-user-token Authenticity token
     * @apiParamExample {json} Request:
     * {
     * "fileNames" : [
     * "N4X6E2/N4X6E2.png"
     * ],
     * "bucket":"sl-unnati-storage"
     * }
     * @apiSampleRequest /kendra/api/v1/cloud-services/files/preSignedUrls
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
     * "sourcePath": "T9R6Y8/T9R6Y8.png"
     * }
     * }
     * ]
     * }
     */

    /**
      * Get signed urls.
      * @method
      * @name preSignedUrls
      * @param  {Request}  req  request body.
      * @param  {Array}  req.body.fileNames - list of file names
      * @param  {String}  req.body.bucket - name of the bucket  
      * @returns {JSON} Response with status and message.
    */

   async preSignedUrls(req) {
    return new Promise(async (resolve, reject) => {

        try {
            
            let bucket = req.body.bucket;
            if(req.body.submissionId){
                bucket = req.body.submissionId + "/" + req.userDetails.userId + "/";
            } 

            let signedUrl =
            await filesHelpers.preSignedUrls(
                 req.body.fileNames,
                 bucket
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

