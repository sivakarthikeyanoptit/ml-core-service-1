/**
 * name : apps/helper.js
 * author : Deepa
 * created-date : 27-08-2020
 * Description : All app related helper functions.
 */

//Dependencies
const filesHelper = require(MODULES_BASE_PATH + "/files/helper");
const path = require("path");

/**
    * AppsHelper
    * @class
*/

module.exports = class AppsHelper {

      /**
      * List of app data.
      * @method
      * @name list
      * @param {Object} filterQueryObject - filter query data.
      * @param {Object} [projection = {}] - projected data.
      * @returns {Promise} returns a promise.
     */

    static list( 
        query = "all", 
        fields = "all",
        skipFields = "none", 
        limitingValue = "", 
        skippingValue = "",
        sortedData = "" 
    ) {
        return new Promise(async (resolve, reject) => {
            try {

                let queryObject = {};
                
                if (query != "all") {
                    queryObject = query;
                }
                
                let projectionObject = {};
                
                if (fields != "all") {
                    
                    fields.forEach(element => {
                        projectionObject[element] = 1;
                    });
                }

                if (skipFields != "none") {
                    skipFields.forEach(element => {
                        projectionObject[element] = 0;
                    });
                }
                
                let appDocuments;
                
                if( sortedData !== "" ) {
                    
                    appDocuments = await database.models.apps
                    .find(queryObject, projectionObject)
                    .sort(sortedData)
                    .limit(limitingValue)
                    .skip(skippingValue)
                    .lean();
                } else {
                    
                    appDocuments = await database.models.apps
                    .find(queryObject, projectionObject)
                    .limit(limitingValue)
                    .skip(skippingValue)
                    .lean();
                }

                return resolve({
                    success: true,
                    message: constants.apiResponses.APP_DETAILS_FETCHED,
                    data: appDocuments
                });

            } catch (error) {
                return resolve({
                    success: false,
                    message: error.message,
                    data: false
                });
            }
        })


    }


     /**
      * Get the app details
      * @method
      * @name getDetails
      * @param {String} name - app name. 
      * @returns {Object}  - app details.
     */

    static getDetails(name= "") {
        return new Promise(async (resolve, reject) => {
            try {
                 
                if (name == "") {
                    throw new Error(constants.apiResponses.NAME_FIELD_REQUIRED)
                }

                let appDocument = await this.list(
                    { name: name },
                    [ 
                        "name",
                        "displayName",
                        "description",
                        "logo",
                        "playstoreLink",
                        "appStoreLink"
                    ]
                );

                if (!Array.isArray(appDocument.data) || appDocument.data < 1) {
                    throw new Error(constants.apiResponses.APP_DETAILS_NOT_FOUND)
                }
                 
                let bucketName = "";
                if (process.env.CLOUD_STORAGE == constants.common.GOOGLE_CLOUD_SERVICE) {
                    bucketName = process.env.GCP_BUCKET_NAME
                }
                else if (process.env.CLOUD_STORAGE == constants.common.AWS_SERVICE) {
                    bucketName = process.env.AWS_BUCKET_NAME
                }
                else if (process.env.CLOUD_STORAGE == constants.common.AZURE_SERVICE) {
                    bucketName = process.env.AZURE_STORAGE_CONTAINER
                }

                let getDownloadableUrl = await filesHelper.getDownloadableUrl(
                     appDocument.data[0].logo,
                     bucketName,
                     process.env.CLOUD_STORAGE
                 );
                
                 if (getDownloadableUrl["url"] && getDownloadableUrl.url !== "") {
                     appDocument.data[0].logo = getDownloadableUrl.url;
                 }

                return resolve({
                    success: true,
                    message: constants.apiResponses.APP_DETAILS_FETCHED,
                    data: appDocument.data[0]
                });

            } catch (error) {
                return resolve({
                    success: false,
                    message: error.message,
                    data: false
                });
            }
        })
    }


    /**
      * Create app details
      * @method
      * @name create
      * @param {file} logo - logo of the app
      * @param {Object} appDetails - details of the app 
      * @returns {String}  - message.
     */

    static create(logo= {}, appDetails = {}) {
        return new Promise(async (resolve, reject) => {
            try {
                
                if (!Object.keys(logo).length) {
                    throw new Error(constants.apiResponses.LOGO_REQUIRED)
                }

                if (!appDetails.name) {
                    throw new Error(constants.apiResponses.NAME_FIELD_REQUIRED)
                }

                if (!appDetails.description) {
                    throw new Error(constants.apiResponses.DESCRIPTION_REQUIRED)
                }

                if (!appDetails.displayName) {
                    throw new Error(constants.apiResponses.DiSPLAY_NAME_REQUIRED)
                }

                if (!appDetails.playstoreLink) {
                    throw new Error(constants.apiResponses.PLAYSTORE_LINK_REQUIRED)
                }

                let bucketName = "";
                if (process.env.CLOUD_STORAGE == constants.common.GOOGLE_CLOUD_SERVICE) {
                    bucketName = process.env.GCP_BUCKET_NAME
                }
                else if (process.env.CLOUD_STORAGE == constants.common.AWS_SERVICE) {
                    bucketName = process.env.AWS_BUCKET_NAME
                }
                else if (process.env.CLOUD_STORAGE == constants.common.AZURE_SERVICE) {
                    bucketName = process.env.AZURE_STORAGE_CONTAINER
                }
                
                let filePath = constants.common.APPS_UPLOAD_FILE_PATH + appDetails.name + path.extname(logo.name); 

                let uploadFile =  await filesHelper.upload
                (
                  logo,
                  filePath,
                  bucketName,
                  process.env.CLOUD_STORAGE
                )
                
                if (uploadFile["name"] && uploadFile.name !== "") {
                    appDetails.logo = filePath;
                }

                await database.models.apps.create(
                {
                    name: appDetails.name,
                    displayName: appDetails.displayName,
                    description: appDetails.description,
                    playstoreLink: appDetails.playstoreLink,
                    appStoreLink: appDetails.appStoreLink ? appDetails.appStoreLink : "",
                    logo: appDetails.logo ? appDetails.logo : "",
                    createdAt: new Date(),
                    updatedAt: new Date(),
                    createdBy: appDetails.createdBy ? appDetails.createdBy : "SYSTEM",
                    updatedBy: appDetails.updatedBy ? appDetails.updatedBy : "SYSTEM",
                    status: appDetails.status ? appDetails.status : constants.common.ACTIVE,
                    isDeleted: appDetails.isDeleted
                }
                );
                
                return resolve({
                    success: true,
                    message: constants.apiResponses.APP_DETAILS_CREATED,
                    data: true
                });

            } catch (error) {
                return resolve({
                    success: false,
                    message: error.message,
                    data: false
                });
            }
        })
    }


    /**
      * Update app details
      * @method
      * @name update
      * @param {String} name - app name
      * @param {file} logo - logo of the app
      * @param {Object} appDetails - details of the app to update
      * @param {String} userId - userId
      * @returns {String}  - message.
     */

    static update(name= "", logo = {}, appDetails = {}) {
        return new Promise(async (resolve, reject) => {
            try {
                
                if(name == "") {
                   throw new Error(constants.apiResponses.APP_NAME_REQUIRED)
                }

                if (!Object.keys(appDetails).length) {
                    throw new Error(constants.apiResponses.APP_DETAILS_REQUIRED)
                }

                if (logo !== "") {
                      
                    let bucketName = "";
                    if (process.env.CLOUD_STORAGE == constants.common.GOOGLE_CLOUD_SERVICE) {
                        bucketName = process.env.GCP_BUCKET_NAME
                    }
                    else if (process.env.CLOUD_STORAGE == constants.common.AWS_SERVICE) {
                        bucketName = process.env.AWS_BUCKET_NAME
                    }
                    else if (process.env.CLOUD_STORAGE == constants.common.AZURE_SERVICE) {
                        bucketName = process.env.AZURE_STORAGE_CONTAINER
                    }

                    let filePath = constants.common.APPS_UPLOAD_FILE_PATH + name + path.extname(logo.name);

                    let uploadFile = await filesHelper.upload
                    (
                        logo,
                        filePath,
                        bucketName,
                        process.env.CLOUD_STORAGE
                    )

                    if (uploadFile["name"] && uploadFile.name !== "") {
                        appDetails.logo = filePath;
                    }
                }

                let appDetailsToSet = {};

                Object.keys(appDetails).forEach( key => {
                  appDetailsToSet[key] = appDetails[key]
                })

                await database.models.apps.updateOne(
                    { name: name },
                    {
                        $set : appDetailsToSet
                    }
                );

                return resolve({
                    success: true,
                    message: constants.apiResponses.APP_DETAILS_UPDATED,
                    data: true
                });

            } catch (error) {
                return resolve({
                    success: false,
                    message: error.message,
                    data: false
                });
            }
        })
    }

}

