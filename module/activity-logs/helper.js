/**
 * name : module/activityLogs/helper.js
 * author : Priyanka
 * Date : 17-Nov-2020
 * Description : Activity logs helper.
 */


/**
    * ActivityLogsHelper
    * @class
*/

module.exports = class ActivityLogsHelper {

       /**
      * Get activityLog document based on userid.
      * @method
      * @name activityLogDocument
      * @name activityLogDocument
      * @param {Object} filterQueryObject - filter query data.
      * @param {Object} [projection = {}] - projected data.
      * @returns {Promise} returns a promise.
     */

    static activityLogDocument(filterQueryObject, projection = {}) {
        return new Promise(async (resolve, reject) => {
            try {

                let activityLogData = await database.models.activityLogs.findOne(filterQueryObject, projection).lean();

                return resolve(activityLogData);

            } catch (error) {
                return reject(error);
            }
        })


    }


   /**
      * create request tracker document.
      * @method
      * @name create
      * @param {Object} data - All requested data.
      * @param {String} type - type of activity (entity, user).
      * @param {String} docId - mongo Id of type.
      * @param {String} userId - user Id.
      * @returns {Promise} returns a promise.
     */

    static create(type, docId, userId, data) {
        return new Promise(async (resolve, reject) => {
            try {
                
                let activityDoc = {
                  type : type,
                  docId : docId,
                  userId : userId,
                  metaInformation : data
                }

                let activityLogCreation = 
                await database.models.activityLogs.create(activityDoc);

                return resolve({
                    success :true,
                    message : constants.apiResponses.ACTIVITY_LOG_CREATED,
                    result : activityLogCreation
                });

            } catch (error) {
                return reject(error);
            }
        })


    }

};




