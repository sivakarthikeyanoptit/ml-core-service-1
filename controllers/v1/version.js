/**
 * name : app-version.js
 * author : Aman
 * created-date : 04-03-2020
 * Description : App version. 
 */

 // Dependencies
 const versionHelper = require(MODULES_BASE_PATH + "/version/helper");
 const csv = require('csvtojson');

 
  /**
     * AppVersion
     * @class
 */
 module.exports = class Version extends Abstract {
   constructor() {
     super(schemas["appVersion"]);
   }
 
   static get name() {
     return "appVersion";
   }

    /**
     * @api {post} /kendra/api/v1/version/update 
     * Upload latest app version
     * @apiVersion 1.0.0
     * @apiGroup appVersion
     * @apiSampleRequest /kendra/api/v1/version/update 
     * @apiParam {File} versionUpdate Mandatory versionUpdate file of type CSV.     
     * @apiUse successBody
     * @apiUse errorBody
     */

    /**
      * Update existing version.Upload csv to update the version.
      * @method
      * @name update
      * @param  {Request} req request body.
      * @returns {JSON} Response consists of message and status code.
    */

   async update(req) {
    return new Promise(async (resolve, reject) => {

        try {

          if (!req.files || !req.files.versionUpdate) {
            return resolve(
              {
                status : httpStatusCode["bad_request"].status, 
                message : constants.apiResponses.VERSION_UPDATE_FILE_TYPE
              }
            )
          }

          let versionData = 
          await csv().fromString(req.files.versionUpdate.data.toString());

          let version = await versionHelper.update(versionData);

          return resolve(version);
      } catch (error) {
          reject({
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
 
 };
 