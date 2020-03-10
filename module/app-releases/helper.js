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

    static upload(data) {
        return new Promise(async (resolve, reject) => {
            try {

                let uploadVersion = 
                await this.createOrUpdateRelease(data);

                return resolve(uploadVersion);

            } catch (error) {
                return reject(error);
            }
        })
    }

    /**
    * Create or update app release data.
    * @method
    * @name createOrUpdateRelease
    * @returns {Object} return version data.
    */
   
    static createOrUpdateRelease( data ) {
        return new Promise( async (resolve,reject)=>{
            try {
                
                let sessionPath = 
                `${constants.common.ALL_APP_VERSION}-${gen.utils.lowerCase(data.appName)}-${gen.utils.lowerCase(data.os)}`;

                data.appName = gen.utils.lowerCase(data.appName);
                data.os = gen.utils.lowerCase(data.os);

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

