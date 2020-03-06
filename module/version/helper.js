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
                await database.models.appVersion.find(
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
      * Update app version.
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
                
                let sessionPath = `${constants.common.ALL_APP_VERSION}-${data.appName}`;
                let existingVersion = sessionHelpers.get(sessionPath);
                let uploadVersion = 
                await this.createOrUpdateVersion(data,existingVersion);

                return resolve(uploadVersion);

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

    static create( versionData) {
        return new Promise(async (resolve, reject) => {
            try {

                let result = 
                await database.models.appVersion.create(versionData);

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

    /**
      * Update app version.
      * @method
      * @name update
      * @param {id}  String - id to update.
      * @param {updateData} Object - Data to update.  
      * @returns {Object}
     */

    static update( id,updateData ) {
        return new Promise(async (resolve, reject) => {
            try {

                let result = await database.models.appVersion.findOneAndUpdate(
                    {
                        _id : id
                    },
                    { $set : updateData},
                    { new : true } 
                );

                let updateObj = {
                    success : true,
                    message : constants.apiResponses.APP_VERSION_UPDATED
                }

                if ( !result._id ) {
                    updateObj.success = false;
                    updateObj.message = constants.apiResponses.APP_VERSION_NOT_UPDATED;
                }

                return resolve(updateObj);

            } catch (error) {
                return reject(error);
            }
        })
    }

    /**
    * Version can be created or existing version can be updated based on data provided.
    * @method
    * @name createOrUpdateVersion
    * @returns {Object} return version data.
    */
   
    static createOrUpdateVersion( data,existingVersion ) {
        return new Promise( async (resolve,reject)=>{
            try {
                
                let sessionPath = `${constants.common.ALL_APP_VERSION}-${data.appName}`;
                
                if( data._id ) {
                    let updateVersion = await VersionHelper.update(
                        data._id,
                        _.omit(data,[constants.schema.ID])
                    );
                    
                    data[constants.schema.ID] = updateVersion.message;
                    sessionHelpers.set(sessionPath,_.omit(data,[constants.schema.ID]));
                } else {
                    
                    if( 
                        existingVersion !== undefined && 
                        Object.keys(existingVersion).length > 0  && 
                        existingVersion.payload.appVersion ===  data.version
                    ) {
                        data[constants.schema.ID] = data.appName+" "+ 
                        constants.apiResponses.APP_VERSION_EXISTS;
                    } else {
                        
                        let existingCurrentVersion = await this.list(
                            {
                                status : constants.common.ACTIVE,
                                appName : data.appName
                            },[constants.schema.ID]
                        );

                        if( existingCurrentVersion[0]._id ) {
                            await this.update(
                                existingCurrentVersion[0]._id,
                                { status : constants.common.IN_ACTIVE }
                            )
                        }
                        let createAppVersion = await this.create(data);
                        
                        if( createAppVersion.success ) {
                            let versionData = _versionPayload(data);
                            sessionHelpers.set(sessionPath,versionData);
                            data[constants.schema.ID] = createAppVersion.result._id;
                        } else {
                            data[constants.schema.ID] = data.appName + " "+
                            constants.apiResponses.APP_VERSION_NOT_UPDATED;
                        }
                    }
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

