/**
 * name : awsFileUpload.js
 * author : Aman Jung Karki
 * created-date : 03-Dec-2019
 * Description : File upload information.
 */

// Dependencies

let filesHelper = require(ROOT_PATH+"/module/files/helper");

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


      /**
    * @api {get} /kendra/api/v1/files/getFilePublicBaseUrl 
    * All files related upload information
    * @apiVersion 1.0.0
    * @apiGroup files
    * @apiSampleRequest /kendra/api/v1/files/getFilePublicBaseUrl
    * @apiHeader {String} X-authenticated-user-token Authenticity token  
    * @apiUse successBody
    * @apiUse errorBody
    */

     /**
      * All files related upload information
      * @method
      * @name getFilePublicBaseUrl
      * @param  {Request} req requested dagta.
      * @returns {JSON} 
    */

    getFilePublicBaseUrl(req) {
        return new Promise( async (resolve,reject) => {
            try {

                let urlPath = await filesHelper.getFilePublicBaseUrl(req);
                return resolve(urlPath);

            } catch(error) {
                return reject(error);
            }
        })
    }

     /**
  * @api {post} /kendra/api/v1/files/getImageUploadUrl Get File Upload URL
  * @apiVersion 1.0.0
  * @apiName Get File Upload URL
  * @apiGroup Files
  * @apiParamExample {json} Request-Body:
  * 
  *   "files" : [
  *     "23-Oct-2018-8AM-image121.jpg",
  *     "23-Oct-2018-8AM-image222.jpg",
  *     "23-Oct-2018-8AM-image323.jpg"
  *   ],
  *   "folderPath": "https://sl-dev-storage.amazonaws.com//unnati/Projects/PID1/"
  * @apiUse successBody
  * @apiUse errorBody
  */

   /**
   * Get the url of the image upload.
   * @method
   * @name getImageUploadUrl
   * @param {Object} req -request Data.
   * @param {Array} req.body.files - image upload files.
   * @param {String} req.body.submissionId - submission id. 
   * @returns {JSON} - Url generated link. 
   */

  getImageUploadUrl(req) {

    return new Promise(async (resolve, reject) => {

      try {

        if(!Array.isArray(req.body.files) || req.body.files.length < 1) {
          throw new Error(messageConstants.apiResponses.FILES_NAME_NOT_GIVEN);
        }

        let signedUrl = await filesHelper.getSignedUrls(
            req.body.folderPath, 
            req.body.files
        );

        if(signedUrl.success) {
          return resolve({
            message: messageConstants.apiResponses.URL_GENERATED,
            result: signedUrl.files
          });
        } else {
          throw new Error(signedUrl.message);
        }

      } catch (error) {

        return reject({
          status: error.status || httpStatusCode.internal_server_error.status,
          message: error.message || httpStatusCode.internal_server_error.message,
          errorObject: error
        });

      }


    })

  }
}