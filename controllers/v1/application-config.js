/**
 * load modules.
 */

const appConfigHelper = require(ROOT_PATH + "/module/application-config/helper.js");
const csvFileStream = require(ROOT_PATH + "/generics/file-stream");
const fs = require("fs");
/**
    * Languages
    * @class
*/
module.exports = class Languages {
    /**
      * Upload languages via csv.
      * @method
      * @name upload
      * @param  {Request} req request body.Req consists of languages csv to upload.
      * @returns {JSON} Response consists of message and result.Result consists of language data uploaded.
     */

    upload(req) {

        // console.log("upload files");

        return new Promise(async (resolve, reject) => {
            try {

                if (!req.files || !req.files) {
                    throw { 
                        status: httpStatusCode["bad_request"].status, 
                        message: httpStatusCode["bad_request"].message 
                    };
                }
                let data = await appConfigHelper.upload(req);
                return resolve({
                    message: "App config Uploaded succesfully",
                    result: data
                })

            } catch (error) {

                return reject({
                    status: 
                    error.status || 
                    httpStatusCode["internal_server_error"].status,

                    message: 
                    error.message || 
                    httpStatusCode["internal_server_error"].message
                })

            }


        })
    }
        /**
    * @api {get} /kendra/api/v1/application-config/list/:configType 
    * config List
    * @apiVersion 1.0.0
    * @apiGroup Language
    * @apiSampleRequest /kendra/api/v1/application-config/list/category
    * @apiHeader {String} X-authenticated-user-token Authenticity token  
    * @apiUse successBody
    * @apiUse errorBody
    */

    /**
      * Details of the specific application config.
      * @method
      * @name list
      * @param  {Request} req request body.
      * @returns {JSON} Response consists of details of a application config.
     */

    list(req) {
        return new Promise(async (resolve, reject) => {

            try {
                let applicationConfig = await appConfigHelper.listAll();
                return resolve({
                    result: applicationConfig,
                    message: "configaration retrived succesfully"
                });

            } catch (error) {
                return reject({
                    status: 
                    error.status || 
                    httpStatusCode["internal_server_error"].status,

                    message: 
                    error.message || 
                    httpStatusCode["internal_server_error"].message
                });
            }
        })
    }

}