/**
 * name : app-releases.js
 * author : Aman
 * created-date : 04-03-2020
 * Description : App releases. 
 */

 // Dependencies
 const versionHelper = require(MODULES_BASE_PATH + "/app-releases/helper");
 const csv = require('csvtojson');
 const csvFileStream = require(ROOT_PATH + "/generics/file-stream");

 
  /**
     * AppVersion
     * @class
 */
 module.exports = class AppReleases extends Abstract {
   constructor() {
     super(schemas["app-releases"]);
   }
 
   static get name() {
     return "appReleases";
   }

    /**
     * @api {post} /kendra/api/v1/app-releases/upload 
     * Upload latest app release
     * @apiVersion 1.0.0
     * @apiGroup appVersion
     * @apiSampleRequest /kendra/api/v1/app-releases/upload 
     * @apiParam {File} versionUpdate Mandatory versionUpdate file of type CSV.     
     * @apiUse successBody
     * @apiUse errorBody
     */

    /**
      * Upload latest app version.
      * @method
      * @name upload
      * @param  {Request} req request body.
      * @returns {JSON} Response consists of message and status code.
    */

   async upload(req) {
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

          const fileName = `version-update`;
          let fileStream = new csvFileStream(fileName);
          let input = fileStream.initStream();

          (async function () {
              await fileStream.getProcessorPromise();
              return resolve({
                  isResponseAStream: true,
                  fileNameWithPath: fileStream.fileNameWithPath()
              });
          })();

          for( let version = 0; version < versionData.length; version ++) {
            let result = await versionHelper.upload(versionData[version]);
            input.push(result);
          }
          input.push(null);
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
 