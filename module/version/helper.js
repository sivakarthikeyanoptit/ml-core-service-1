/**
 * name : version/helper.js
 * author : Aman
 * created-date : 04-03-2020
 * Description : All version related helper functions.
 */


/**
 * load modules.
 */


const upload_type = 
gen.utils.checkIfEnvDataExistsOrNot("APPLICATION_CONFIG_UPLOAD_TYPE");
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

                let result = {};

                for ( let version = 0; version < versions.length; version++ ) {

                    if( 
                        Object.keys(allAppVersions).length == 0 
                        // && allAppVersions[versions[version].appName] ===  
                        // allAppVersions[versions[version].version]
                    ) {
                        result["message"] = ""
                    }
                    
                    let result = {
                        is_read : false,
                        internal : true,
                        action : "versionUpdate",
                        appName : versions[version].appName,
                        created_at : new Date(),
                        text : versions[version].text,
                        title : versions[version].title,
                        type : "Information",
                        payload : {
                            appVersion : versions[version].version,
                            updateType : versions[version].releaseType,
                            type : "appUpdate",
                            os : versions[version].os
                        }
                    };

                    // await kafkaCommunication.pushNotificationsDataToKafka(result);
                }

                return resolve();

            } catch (error) {
                return reject(error);
            }
        })
    }
}