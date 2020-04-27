/**
 * name : platform.js
 * author : Aman Jung Karki
 * created-date : 11-Feb-2020
 * Description : All bodh platform related information
*/

// Dependencies
let bodhHelpers = require(ROOT_PATH+"/module/bodh/helper");

module.exports = class Platform {

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
     * @api {post} /kendra/api/v1/bodh/platform/generate 
     * Generate qr code information.
     * @apiVersion 1.0.0
     * @apiGroup bodhPlatform
     * @apiHeader {String} X-authenticated-user-token Authenticity token
     * @apiSampleRequest /kendra/api/v1/bodh/platform/generate
     * @apiUse successBody
     * @apiUse errorBody
     * @apiParamExample {json} Request:
     * {
     * "contentData":[
     * {
     * "lastPublishedBy":"",
     * "identifier":"do_2127512157406167041194",
     * "name": "BTextbook"
     * }]}
     * */

    
    /**
      * Generate qr code for bodh.
      * @method
      * @name generate
      * @param  {req}  - requested data.
      * @returns {json} Response consists of all generated qr codes data.
    */

    async generate(req) {
        
        return new Promise(async (resolve, reject) => {
            
            try {
                
                let codes = 
                await bodhHelpers.generateQrCode(
                    req.body.contentData,
                    req.userDetails.userId,
                    req.userDetails.userToken
                );
  
                return resolve(codes);
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
     * @api {post} /kendra/api/v1/bodh/platform/createContent 
     * Create content for bodh platform.
     * @apiVersion 1.0.0
     * @apiGroup bodhPlatform
     * @apiHeader {String} X-authenticated-user-token Authenticity token
     * @apiSampleRequest /kendra/api/v1/bodh/platform/createContent
     * @apiUse successBody
     * @apiUse errorBody
     * @apiParamExample {json} Request:
     * {
     * "code": "d464c257-ed5c-406b-ac95-2a51ecd18753",
     * "contentType": "Resource",
     * "name": "TEST-BODH-SCROM Upload content",
     * "mimeType": "application/pdf",
     * "createdBy": "6e24b29b-8b81-4b70-b1b5-fa430488b1cf",
     * "createdFor": [
     * "0124487522476933120"
     * ],
     * "resourceType": "Learn",
     * "creator": "SL user",
     * "framework": "NCF",
     * "organisation": [
     * "ShikshaLokam"
     * ]
     * }
     * @apiParamExample {json} Response:
     * {
     * "message": "Successfully created bodh content data",
     * "status": 200,
     * "result": {
     * "contentId": "do_31300871795865190421351"
     * }}
     * */

    
    /**
      * Create content for bodh platform.
      * @method
      * @name createContent
      * @param  {req}  - requested data.
      * @returns {json} Response consists of created content id.
    */

   async createContent(req) {
        
    return new Promise(async (resolve, reject) => {
        
        try {

            let contentData = 
            await bodhHelpers.createContent(
                req.body,
                process.env.BODH_TOKEN_FOR_CONTENT ? 
                process.env.BODH_TOKEN_FOR_CONTENT : 
                req.userDetails.userToken
            );

            return resolve(contentData);
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
     * @api {post} /kendra/api/v1/bodh/platform/uploadContent/:contentId 
     * Upload content data for bodh platform.
     * @apiVersion 1.0.0
     * @apiGroup bodhPlatform
     * @apiHeader {String} X-authenticated-user-token Authenticity token
     * @apiSampleRequest /kendra/api/v1/bodh/platform/uploadContent
     * @apiUse successBody
     * @apiUse errorBody
     * @apiParam {File} contentData Mandatory contentData file of type csv.
     * @apiParamExample {json} Response:
     * {
     * "message": "Successfully uploaded content",
     * "status": 200,
     * "result": {
     * "contentUrl": "https://ekstep-public-prod.s3-ap-south-1.amazonaws.com/content/do_31300871795865190421351/artifact/python-essential-reference-fourth-edition_1587988844495.pdf"
     * }
     * }
     * */

    
    /**
      * Create content for bodh platform.
      * @method
      * @name uploadContent
      * @param  {req}  - requested data.
      * @returns {json} Response consists of created content id.
    */

   async uploadContent(req) {
        
    return new Promise(async (resolve, reject) => {
        
        try {

            if ( !req.files || !req.files.contentData ) {
                throw { 
                    status: httpStatusCode["bad_request"].status, 
                    message: constants.apiResponses.CONTENT_FILE_REQUIRED 
                };
            }

            let contentData = 
            await bodhHelpers.uploadContent(
                req.files.contentData,
                req.params._id,
                process.env.BODH_TOKEN_FOR_CONTENT ? 
                process.env.BODH_TOKEN_FOR_CONTENT : 
                req.userDetails.userToken
            );

            return resolve(contentData);
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
}