/**
 * name : app-releases/helper.js
 * author : Aman
 * created-date : 04-03-2020
 * Description : All version related helper functions.
 */

let sessionHelpers = require(ROOT_PATH+"/generics/helpers/sessions");

/**
    * VersionHelper
    * @class
*/

module.exports = class VersionHelper {

      /**
      * List of version data.
      * @method
      * @name list
      * @param {Object} filterQueryObject - filter query data.
      * @param {Object} [projection = {}] - projected data.
      * @returns {Promise} returns a promise.
     */

    static list( filterQueryObject = {} , fields = "all" ) {
        return new Promise(async (resolve, reject) => {
            try {

                let projection = {};

                if (fields != "all") {
                    fields.forEach(element => {
                        projection[element] = 1;
                    });
                }

                let versionData = 
                await database.models.appReleases.find(
                    filterQueryObject, 
                    projection
                ).lean();

                return resolve(versionData);

            } catch (error) {
                return reject(error);
            }
        })


    }

     /**
      * Upload app release data.
      * @method
      * @name upload
      * @param {Object} data - app update data.
      * @param {String} data.appName - app name of notification. 
      * @param {String} data.title - title of notification.
      * @param {String} data.text - text of notification.
      * @param {String} data.version - version of the app.
      * @param {String} data.status - status of the update notification.
      * @param {String} data.os - device os.
      * @param {String} data.releaseType - release type versions 
      * @returns {Promise} returns a promise.
     */

    static upload( data,userId ) {
        return new Promise(async (resolve, reject) => {
            try {

                let uploadVersion = 
                await this.create(
                    data,
                    userId
                );

                return resolve(uploadVersion);

            } catch (error) {
                return reject(error);
            }
        })
    }

    /**
    * Create app release data.
    * @method
    * @name create
    * @returns {Object} create version data.
    */
   
    static create( data,userId ) {
        return new Promise( async (resolve,reject)=>{
            try {
                
                let sessionPath = 
                `${constants.common.ALL_APP_VERSION}-${gen.utils.lowerCase(data.appName)}-${gen.utils.lowerCase(data.os)}`;

                data.appName = gen.utils.lowerCase(data.appName);
                data.os = gen.utils.lowerCase(data.os);
                data.createdBy = userId;
                data.updatedBy = userId;

                let versionRelease = await database.models.appReleases.findOneAndUpdate({
                    appName : data.appName,
                    os : data.os,
                    version : data.version
                },{ $set : data },{ upsert : true, new: true }).lean();

                if( versionRelease._id ) {
                    
                    if( versionRelease.status === constants.common.ACTIVE ) {
                        
                        await database.models.appReleases.findOneAndUpdate(
                            { 
                                _id : { $ne : versionRelease._id },
                                appName : data.appName,
                                os : data.os
                            },
                            { 
                                status : constants.common.IN_ACTIVE 
                            }
                        );
                        
                        let versionData = _versionPayload(data);
                        sessionHelpers.set(sessionPath,versionData);
                    }
                    data.message = constants.apiResponses.APP_VERSION_UPDATED;
                } else {
                    data.message = constants.apiResponses.APP_VERSION_NOT_UPDATED;
                }

                return resolve(data);
            } catch(e) {
                return reject(e);
            }
        })
    }

    /**
    * Update app release data.
    * @method
    * @name update
    * @param updateData - app version update data 
    * @returns {Object} updated version data.
    */
   
   static update( id,updateData ) {
    return new Promise( async (resolve,reject)=>{
        try {

            let currentAppVersion = await this.list(
                {
                    _id : id
                },["_id","appName","os"]
            );

            if( !currentAppVersion[0] ) {
                return resolve({
                    status : httpStatusCode.bad_request.status,
                    message : constants.apiResponses.APP_VERSION_NOT_FOUND
                })
            }

            let sessionPath = 
            `${constants.common.ALL_APP_VERSION}-${gen.utils.lowerCase(currentAppVersion[0].appName)}-${gen.utils.lowerCase(currentAppVersion[0].os)}`;

            if( updateData.status === constants.common.ACTIVE ) {
                
                await database.models.appReleases.findOneAndUpdate({
                    _id : { $ne : currentAppVersion[0]._id },
                    appName : currentAppVersion[0].appName,
                    os : currentAppVersion[0].os
                },{
                    $set : { 
                        status : constants.common.IN_ACTIVE 
                    }
                })
            }
            
            let updateAppReleaseData = 
            await database.models.appReleases.findOneAndUpdate({ 
                _id : currentAppVersion[0]._id
            },{
                $set : updateData 
            },{ new : true }).lean();

            if( !updateAppReleaseData || !updateAppReleaseData._id ) {
               return resolve({
                   status : httpStatusCode.bad_request.status,
                   message : constants.apiResponses.APP_VERSION_NOT_UPDATED
                })
            }
            
            let versionData = _versionPayload(updateAppReleaseData);
            sessionHelpers.set(sessionPath,versionData);

            return resolve({
                message : constants.apiResponses.APP_VERSION_UPDATED,
                result : updateAppReleaseData
            });
        } catch(e) {
            return reject(e);
        }
    })
   }

   /**
    * List of all version data.
    * @method
    * @name versionDataList
    * @param requestedData - requestedData
    * @returns {Array} List of all app release version.
    */
   
   static versionDataList( filters = {} ) {
    return new Promise( async (resolve,reject)=>{
        try {

            let queryObject = {};

            if( filters.appName ) {
                queryObject["appName"] = filters.appName;
            }

            if( filters.os ) {
                queryObject["os"] = filters.os;
            }

            if( filters.releaseType ) {
                queryObject["releaseType"] = filters.releaseType;
            }

            if( filters.status ) {
                queryObject["status"] = filters.status;
            }

            let versionDataList = await this.list(
                queryObject
            );

            if( versionDataList.length < 1 ) {
                return resolve({
                    status : httpStatusCode.bad_request.status,
                    message : constants.apiResponses.APP_VERSION_NOT_FOUND
                })
            }

            return resolve({
                message : constants.apiResponses.APP_VERSION_LISTS,
                result : versionDataList
            });
        } catch(e) {
            return reject(e);
        }
    })
}
}

/**
  * Version payload data.
  * @method
  * @name _versionPayload
  * @returns {Object} return version data.
*/

function _versionPayload(data) {
    return {
        is_read : false,
        internal : true,
        action : "versionUpdate",
        appName : data.appName,
        created_at : new Date(),
        text : data.text,
        title : data.title,
        type : "Information",
        payload : {
            appVersion : data.version,
            updateType : data.releaseType,
            type : "appUpdate",
            releaseNotes : data.releaseNotes,
            os : data.os
        },
        appType : data.appType
    };

}

