/**
 * name : helper.js
 * author : Aman
 * created-date : 22-Nov-2020
 * Description : Observation related functionality.
 */

  /**
      * ObservationsHelper
      * @class
  */

  module.exports = class ObservationsHelper {
  
      /**
     * Solution Data
     * @method
     * @name observationDocuments
     * @param {Array} [filterQuery = "all"] - solution ids.
     * @param {Array} [fieldsArray = "all"] - projected fields.
     * @param {Array} [skipFields = "none"] - field not to include
     * @returns {Array} List of solutions. 
     */
    
    static observationDocuments(
      filterQuery = "all", 
      fieldsArray = "all",
      skipFields = "none"
    ) {
      return new Promise(async (resolve, reject) => {
          try {
      
              let queryObject = (filterQuery != "all") ? filterQuery : {};
      
              let projection = {}
      
              if (fieldsArray != "all") {
                  fieldsArray.forEach(field => {
                      projection[field] = 1;
                  });
              }
  
              if( skipFields !== "none" ) {
                skipFields.forEach(field=>{
                  projection[field] = 0;
                })
              }
      
              let observationDocuments = 
              await database.models.observations.find(
                queryObject, 
                projection
              ).lean();
              
              return resolve(observationDocuments);
              
          } catch (error) {
              return reject(error);
          }
      });
    }

  
    /**
     * Update observations.
     * @method 
     * @name update
     * @param {String} observationId - solution external id.
     * @param {String} userId - Logged in user id.
     * @param {Object} data - solution updation data.
     * @returns {JSON} solution updation data. 
     */
    
    static update(observationId,data,userId) {
      return new Promise(async (resolve, reject) => {
          try {
    
            let observation = 
            await this.observationDocuments(
              {
                _id : observationId
              },["_id"]
            );
    
            if (!observation[0]) {
              
              return resolve({
                message: constants.apiResponses.OBSERVATION_NOT_FOUND,
                result : {}
              });
  
            }
    
            let updateObject = {
              "$set" : {}
            };
    
            Object.keys(data).forEach(solutionData=>{
              updateObject["$set"][solutionData] = data[solutionData];
            })
    
            updateObject["$set"]["updatedBy"] = userId;
    
            await database.models.observations.findOneAndUpdate({
              _id : observation[0]._id
            }, updateObject);
    
            return resolve({
              status: httpStatusCode.ok.status,
              message: constants.apiResponses.OBSERVATION_UPDATED
            });
              
          } catch (error) {
              return reject(error);
          }
      });
    }

     /**
   * List observations
   * @method
   * @name list
   * @param bodyData - Body data.
   * @returns {Array} List of solutions. 
   */
  
  static list( bodyData ) {
    return new Promise(async (resolve, reject) => {
        try {

            let queryData = bodyData.query ? bodyData.query : {};

            queryData["status"] = "published";

            console.log(queryData,bodyData.projection,bodyData.skipFields)
            
            const observationData = await this.observationDocuments(
                queryData,
                bodyData.projection,
                bodyData.skipFields
            );

            return resolve({
                message : constants.apiResponses.OBSERVATION_FETCHED,
                result : observationData
            });
            
        } catch (error) {
            return reject(error);
        }
    });
  }

};
  