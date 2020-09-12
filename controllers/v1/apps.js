/**
 * name : apps.js
 * author : Deepa
 * created-date : 27-08-2020
 * Description : App Related information. 
 */

 // Dependencies
 const appsHelper = require(MODULES_BASE_PATH + "/apps/helper");
 
  /**
     * Apps
     * @class
 */
 module.exports = class Apps extends Abstract {
   constructor() {
     super(schemas["apps"]);
   }
 
   static get name() {
     return "apps";
   }

    /**
     * @api {get} /kendra/api/v1/apps/details/{{appName}}
     * Get app details
     * @apiVersion 1.0.0
     * @apiGroup Apps
     * @apiSampleRequest /kendra/api/v1/apps/details/samiksha
     * @apiParamExample {json} Response:
     * {
          "message": "Apps details fetched successfully.",
          "status": 200,
          "result": {
            "name": "samiksha",
            "displayName": "Samiksha",
            "description": "Get the app to discover more",
            "logo": "https://storage.googleapis.com/download/storage/v1/b/sl-dev-storage/o/static%2Fapps%2Fsamiksha.png?alt=media",
            "playstoreLink": "https://play.google.com/store/apps/details?id=org.shikshalokam.samiksha",
            "appStoreLink": "https://apps.apple.com/in/app/shikshalokam-samiksha/id1442066610"
          }
     * }   
     * @apiUse successBody
     * @apiUse errorBody
     */

    /**
      * Get app details.
      * @method
      * @name details
      * @param {String} name - app name
      * @returns {JSON} created app version data.
    */

   async details(req) {
     return new Promise(async (resolve, reject) => {
       try {

          let appDetails = await appsHelper.getDetails(
            req.params._id
          );

          return resolve({
            message : appDetails.message,
            result : appDetails.data
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
     * @api {post} /kendra/api/v1/apps/create
     * Create an app
     * @apiVersion 1.0.0
     * @apiGroup Apps
     * @apiSampleRequest /kendra/api/v1/apps/details/create
     * @apiParamExample {fromData} Request:
     * {
       "name": "samiksha",
       "displayName": "Samiksha",
       "description": "Get the app to discover more",
       "playstoreLink": "https://play.google.com/store/apps/details?id=org.shikshalokam.samiksha",
       "appStoreLink": "https://apps.apple.com/in/app/shikshalokam-samiksha/id1442066610",
       "status": "active"
     * }
     * @apiParamExample {json} Response:
     * {
          "message": "App created successfully.",
          "status": 200
     * }   
     * @apiUse successBody
     * @apiUse errorBody
     */

    /**
      * Create app
      * @method
      * @name create
      * @param {files}  req.files.logo - app logo 
      * @param {String} req.body.name - name of the app
      * @param {String} req.body.displayName - displayName of the app
      * @param {String} req.body.description - description of the app
      * @param {String} req.body.playstoreLink - playstoreLink of the app
      * @param {String} req.body.appStoreLink - appStoreLink of the app
      * @param {String} req.body.status - status
      * @returns {String} - message .
    */

   async create(req) {
    return new Promise(async (resolve, reject) => {
      try {
         
         let createDetails = await appsHelper.create(
          req.files.logo,
          req.body
         );

         return resolve({
           message : createDetails.message,
           result : createDetails.data
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
     * @api {post} /kendra/api/v1/apps/update/{{name}}
     * Update app details
     * @apiVersion 1.0.0
     * @apiGroup Apps
     * @apiSampleRequest /kendra/api/v1/apps/details/update/samiksha
     * @apiParamExample {fromData} Request:
     * {
       "displayName": "Samiksha",
       "description": "Get the app to discover more",
       "playstoreLink": "https://play.google.com/store/apps/details?id=org.shikshalokam.samiksha",
       "appStoreLink": "https://apps.apple.com/in/app/shikshalokam-samiksha/id1442066610",
       "status": "active"
     * }
     * @apiParamExample {json} Response:
     * {
          "message": "App details updated successfully.",
          "status": 200
     * }   
     * @apiUse successBody
     * @apiUse errorBody
     */

    /**
      * Update app details
      * @method
      * @name update
      * @param {String} req.params._id - name of the app
      * @param {files}  req.files.logo - app logo 
      * @param {String} req.body.displayName - displayName of the app
      * @param {String} req.body.description - description of the app
      * @param {String} req.body.playstoreLink - playstoreLink of the app
      * @param {String} req.body.appStoreLink - appStoreLink of the app
      * @param {String} req.body.status - status
      * @returns {String} - message .
    */

   async update(req) {
     return new Promise(async (resolve, reject) => {
       try {

          let file = "";
    
          if(req.files && req.files.logo) {
            file = req.files.logo;
          }

          let updateDetails = await appsHelper.update(
            req.params._id,
            file,
            req.body
         );

         return resolve({
           message: updateDetails.message,
           result: updateDetails.data
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

};
 