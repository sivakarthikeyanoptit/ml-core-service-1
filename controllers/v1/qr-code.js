/**
 * name : qr-code.js
 * author : Aman Jung Karki
 * created-date : 11-Feb-2020
 * Description : Create qr code.
 */


/**
    * QrCode
    * @class
*/

let qrCodeHelper = require(ROOT_PATH+"/module/qr-code/helper");

module.exports = class QrCode extends Abstract {
  
   /**
     * @apiDefine errorBody
     * @apiError {String} status 4XX,5XX
     * @apiError {String} message Error
     */

    /**
     * @apiDefine successBody
     *  @apiSuccess {String} status 200
     * @apiSuccess {String} result Data
     */

    constructor() {
        super(schemas["qr-code"]);
    }
    
    static get name() {
        return "qr-code";
    }

   /**
     * @api {post} /kendra/api/v1/qr-code/generate 
     * Generate qr code information.
     * @apiVersion 1.0.0
     * @apiGroup qrCode
     * @apiHeader {String} X-authenticated-user-token Authenticity token
     * @apiSampleRequest /kendra/api/v1/qr-code/generate
     * @apiUse successBody
     * @apiUse errorBody
     * @apiParamExample {json} Request:
     * [{
     * "code" : "N7W8L4",
     * "metaInformation": {
     *   "courseId" : "a",
     *   "courseName" : "a" 
     * }
     * }]
     * @apiParamExample {json} Response:
     * {
     * "message": "Qr code generated successfully",
     * "status": 200,
     * "result": [
     * {
     * "code" : "N7W8L4",
     * "imageUrl" : "https://sl-bodh-storage.s3.amazonaws.com/courses/courseId"    
     * } 
    ]
    }
  }
  */

   /**
   * Generate Qr code based on unicode provided.
   * @method
   * @name generate
   * @param  {req}  - requested data.
   * @returns {json} Response consists of all the qr code generated links.
   */

    generate(req) {
        return new Promise(async (resolve, reject) => {
            
            try {

                if( !req.body ) {
                    throw messageConstants.apiResponses.BODY_NOT_FOUND;
                }
                
                let generateQrCode = await qrCodeHelper.generate(
                    req.body,
                    req.userDetails.userId
                );

                return resolve(generateQrCode);
            } catch(error) {
                
                return reject({
                    status: error.status || 
                    httpStatusCode["internal_server_error"].status,
                    
                    message: error.message || 
                    httpStatusCode["internal_server_error"].message
                });
            }
        });
    }

  /**
     * @api {get} /kendra/api/v1/qr-code/image/:uniquecode 
     * Get the image link of the qr code
     * @apiVersion 1.0.0
     * @apiGroup qrCode
     * @apiHeader {String} X-authenticated-user-token Authenticity token
     * @apiSampleRequest /kendra/api/v1/qr-code/image/N7W8L4
     * @apiUse successBody
     * @apiUse errorBody
     * @apiParamExample {json} Response:
     * {
     * "message": "Qr code image generated successfully",
     * "status": 200,
     * "result":
     * {
     * "url" : "https://sl-bodh-storage.s3.amazonaws.com/courses/courseId"    
     * } 
    }
  */

   /**
   * Get qr code image url based on unicode provided.
   * @method
   * @name image
   * @param  {req}  - requested data.
   * @returns {json} Response consists of qr code image url.
   */

  image(req) {
    return new Promise(async (resolve, reject) => {

      try {

        let generateQrCode = "";

        return resolve(generateQrCode);

      } catch(error) {
        
        return reject({
          status: 
          error.status || 
          httpStatusCode["internal_server_error"].status,

          message: 
          error.message || 
          httpStatusCode["internal_server_error"].message
        });
      }
    });
  }



  /**
     * @api {Post} /kendra/api/v1/qr-code/pdfUrl
     * Get qr code pdfs.
     * @apiVersion 1.0.0
     * @apiGroup qrCode
     * @apiHeader {String} X-authenticated-user-token Authenticity token
     * @apiSampleRequest /kendra/api/v1/qr-code/pdfUrl
     * @apiUse successBody
     * @apiUse errorBody
     * @apiParamExample {json} Request:
     * {
     * "codes" : [
     * "N7W8L4"
     * ]    
    }
     * @apiParamExample {json} Request:
     * {
     * "message": "Qr code pdfs generated successfully",
     * "status": 200,
     * "result":[{
     * "url": "https://sl-bodh-storage.s3.amazonaws.com/courses/courseId/a.pdf"
     * }
     * ]
    }
  }
  */

   /**
   * All pdf urls.
   * @method
   * @name pdfUrl
   * @param  {req}  - requested data.
   * @returns {json} Response consists of qr code image url.
   */

  pdfUrl(req) {
    return new Promise(async (resolve, reject) => {

      try {

        let generateQrCode = ""

        return resolve(generateQrCode);

      } catch(error) {
        
        return reject({
          status: 
          error.status || 
          httpStatusCode["internal_server_error"].status,

          message: 
          error.message || 
          httpStatusCode["internal_server_error"].message
        });
      }
    });
  }

};