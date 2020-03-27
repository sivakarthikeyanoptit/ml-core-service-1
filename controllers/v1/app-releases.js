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
     * @api {post} /kendra-service/api/v1/app-releases/create 
     * Add latest app release
     * @apiVersion 1.0.0
     * @apiGroup appVersion
     * @apiSampleRequest /kendra-service/api/v1/app-releases/create 
     * @apiParamExample {json} Request:
     * {
     * "appName":"samiksha",
     * "version" : "2.2.8",
     * "releaseType" : "minor",
     * "os" : "android",
     * "text" : "A new version of app is available !!!",
     * "title" : "New update available!!",
     * "status" : "active",
     * "appType" : "assessment",
     * "releaseNotes":"new feature like image capture is available"
     * } 
     * @apiParamExample {json} Response:
     * {
     * "message": "App version created",
     * "status": 200,
     * "result": {
     * "appName": "samiksha",
     * "version": "2.2.8",
     * "releaseType": "minor",
     * "os": "android",
     * "text": "A new version of app is available !!!",
     * "title": "New update available!!",
     * "status": "active",
     * "appType": "assessment",
     * "createdBy" : "",
     * "updatedBy" : "",
     * "releaseNotes": "new feature like image capture is available",
     * "message": "App version updated"
     * }
     * }   
     * @apiUse successBody
     * @apiUse errorBody
     */

    /**
      * Create app version data.
      * @method
      * @name create
      * @param  {Request} req request body.
      * @returns {JSON} created app version data.
    */

   async create(req) {
     return new Promise(async (resolve, reject) => {
       try {

          let createAppRelease = await versionHelper.create(
            req.body,
            req.userDetails.userId
          );

          return resolve({
            message : constants.apiResponses.APP_VERSION_CREATED,
            result : createAppRelease
          });
        
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

    /**
     * @api {post} /kendra-service/api/v1/app-releases/update 
     * Update app release data
     * @apiVersion 1.0.0
     * @apiGroup appVersion
     * @apiSampleRequest /kendra-service/api/v1/app-releases/update/5e7cb395fb8ce4182f5ffcac
     * @apiParamExample {json} Request:
     * {
     * "appName":"samiksha",
     * "version" : "2.2.8",
     * "releaseType" : "minor",
     * "os" : "android",
     * "text" : "A new version of app is available !!!",
     * "title" : "New update available!!",
     * "status" : "active",
     * "appType" : "assessment",
     * "releaseNotes":"new feature like image capture is available"
     * } 
     * @apiParamExample {json} Response: 
     * {
     * "message": "App version updated",
     * "status": 200,
     * "result": {
     * "appName": "samiksha",
     * "version": "2.2.9",
     * "releaseType": "minor",
     * "os": "android",
     * "text": "A new version of app is available !!!",
     * "title": "New update available!!",
     * "status": "active",
     * "appType": "assessment",
     * "releaseNotes": "new feature like image capture is available",
     * "updatedBy" : "",
     * "createdBy" : ""
     * }
     * }
     * @apiUse successBody
     * @apiUse errorBody
     */

    /**
      * Update app version data.
      * @method
      * @name update
      * @param  {Request} req request body.
      * @returns {JSON} updated app version data.
    */

   async update(req) {
    return new Promise(async (resolve, reject) => {
      try {
        
         req.body.updatedBy = req.userDetails.userId;
         req.body.updatedAt = new Date();

         let updateVersionData = await versionHelper.update(
           req.params._id,
           req.body
         );

         return resolve(updateVersionData);
        
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

   /**
     * @api {get} /kendra-service/api/v1/app-releases/list?appName=:appName&os=:os&releaseType=:releaseType&status=:status
     * List of app releases
     * @apiVersion 1.0.0
     * @apiGroup appVersion
     * @apiSampleRequest /kendra-service/api/v1/app-releases/list?appName=samiksha&os=android&releaseType=minor&status=active 
     * @apiParamExample {json} Response:
     * {
     * "message": "Lists of app version data",
     * "status": 200,
     * "result": [
     * {
     * "_id": "5e664e2437cef27c691183d7",
     * "appName": "samiksha",
     * "os": "android",
     * "version": "2.2.6",
     * "__v": 0,
     * "appType": "assessment",
     * "createdAt": "2020-03-09T14:09:40.940Z",
     * "createdBy" : "",
     * "releaseNotes": "new feature like image capture is available",
     * "releaseType": "minor",
     * "status": "inactive",
     * "text": "A new version of this app is available.",
     * "title": "New update available !",
     * "updatedAt": "2020-03-26T11:04:51.976Z",
     * "updatedBy" : ""
     * }
     * ]
     * }
     * @apiUse successBody
     * @apiUse errorBody
     */

    /**
      * Lists of app version data.
      * @method
      * @name list
      * @param  {Request} req request data.
      * @returns {JSON} App version data lists.
    */

   async list(req) {
    return new Promise(async (resolve, reject) => {
      try {
        
         let listOfVersionData = await versionHelper.versionDataList(
           req.query
         );

         return resolve(listOfVersionData);
        
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

    /**
     * @api {post} /kendra-service/api/v1/app-releases/upload 
     * Upload latest app release
     * @apiVersion 1.0.0
     * @apiGroup appVersion
     * @apiSampleRequest /kendra-service/api/v1/app-releases/upload 
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

          let createdByUser = req.userDetails.userId;

          for( let version = 0; version < versionData.length; version ++) {
            
            let result = await versionHelper.upload(
              versionData[version],
              createdByUser
            );
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
 