/**
 * name : version/helper.js
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
      * Update app version.
      * @method
      * @name update
      * @param {Object} versions - app update data.
      * @param {String} versions.appName - app name of notification. 
      * @param {String} versions.title - title of notification.
      * @param {String} versions.text - text of notification.
      * @param {String} versions.version - version of the app.
      * @param {String} versions.status - status of the update notification.
      * @param {String} versions.os - device os.
      * @param {String} versions.releaseType - release type versions 
      * @returns {Promise} returns a promise.
     */

    static update(versions) {
        return new Promise(async (resolve, reject) => {
            try {

                let result = [];
                let sessionsData = sessions.allAppVersion;

                for ( let version = 0; version < versions.length; version++ ) {

                    let obj = {};
                    let updateVersionData = versions[version];

                    if( sessionsData && 
                        Object.keys(sessionsData).length > 0 
                        && sessionsData[updateVersionData.appName] && 
                        sessionsData[updateVersionData.appName].payload.appVersion ===  
                        updateVersionData.version
                    ) {
                        obj["message"] = 
                        versions[version].appName+" "+
                        constants.apiResponses.APP_VERSION_EXISTS;
                    } else {
                        
                        let updateVersion = await this.create(updateVersionData);

                        if( updateVersion.success ) {
                            let versionData = _versionPayload(updateVersionData);
                            sessionsData[updateVersionData.appName] = versionData;
                            obj["message"] = versions[version].appName + " "+ 
                            constants.apiResponses.APP_VERSION_UPDATED
                        } else {
                            obj["message"] = versions[version].appName + " "+
                            constants.apiResponses.APP_VERSION_NOT_UPDATED;
                        }

                    }

                    result.push(obj)
                }

                return resolve({
                    result : result
                });

            } catch (error) {
                return reject(error);
            }
        })
    }

     /**
      * create app version.
      * @method
      * @name create
      * @param {Object} versionData - version data.
      * @param {String} versionData.appName - app name. 
      * @param {String} versionData.title - title.
      * @param {String} versionData.text - text.
      * @param {String} versionData.version - version of the app.
      * @param {String} versionData.status - status of the update notification.
      * @param {String} versionData.os - device os.
      * @param {String} versionData.releaseType - release type versions 
      * @returns {Object}
     */

    static create( versionData,update = false ) {
        return new Promise(async (resolve, reject) => {
            try {

                let result = await database.models.appVersion.create(versionData);

                if( !result._id ) {
                    return resolve({
                        message : common.apiResponses.APP_VERSION_NOT_UPDATED
                    })
                }

                return resolve({
                    success : true,
                    message : constants.apiResponses.APP_VERSION_CREATED,
                    result : result
                });

            } catch (error) {
                return reject(error);
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
            os : data.os
        },
        appType : data.appType
    };

}