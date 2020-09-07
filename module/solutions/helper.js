/**
 * name : helper.js
 * author : Aman
 * created-date : 03-sep-2020
 * Description : Solution related helper functionality.
 */

/**
    * SolutionsHelper
    * @class
*/
module.exports = class SolutionsHelper {

    /**
   * Solution Data
   * @method
   * @name solutionDocuments
   * @param {Array} [filterQuery = "all"] - solution ids.
   * @param {Array} [fieldsArray = "all"] - projected fields.
   * @param {Array} [skipFields = "none"] - field not to include
   * @returns {Array} List of solutions. 
   */
  
  static solutionDocuments(
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
    
            let solutionDocuments = 
            await database.models.solutions.find(
              queryObject, 
              projection
            ).lean();
            
            return resolve(solutionDocuments);
            
        } catch (error) {
            return reject(error);
        }
    });
  }

   /**
   * List Solutions
   * @method
   * @name list
   * @param bodyData - Body data.
   * @returns {Array} List of solutions. 
   */
  
  static list( bodyData ) {
    return new Promise(async (resolve, reject) => {
        try {

            let queryData = bodyData.query ? bodyData.query : {};

            queryData["status"] = "active";
            
            const solutions = await this.solutionDocuments(
                queryData,
                bodyData.projection,
                bodyData.skipFields
            );

            return resolve({
                message : constants.apiResponses.SOLUTIONS_FETCHED,
                result : solutions
            });
            
        } catch (error) {
            return reject(error);
        }
    });
  }

  /**
   * Create solution.
   * @method create
   * @name create
   * @param {Object} data - solution creation data.
   * @returns {JSON} solution creation data. 
   */
  
  static create(data) {
    return new Promise(async (resolve, reject) => {
        try {
    
            let solutionData = 
            await database.models.solutions.create(
              data
            );
            
            return resolve(solutionData);
            
        } catch (error) {
            return reject(error);
        }
    });
  }

  /**
   * Update solution.
   * @method 
   * @name updateSolutions
   * @param {String} solutionExternalId - solution external id.
   * @param {String} userId - Logged in user id.
   * @param {Object} data - solution updation data.
   * @returns {JSON} solution updation data. 
   */
  
  static updateSolutions(solutionExternalId,data,userId) {
    return new Promise(async (resolve, reject) => {
        try {
  
          let solutionDocument = 
          await this.solutionDocuments(
            {
              externalId: solutionExternalId
            },["_id"]
          );
  
          if (!solutionDocument[0]) {
            
            return resolve({
              message: constants.apiResponses.SOLUTION_NOT_FOUND,
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
  
          await database.models.solutions.findOneAndUpdate({
            _id: solutionDocument._id
          }, updateObject)
  
          return resolve({
            status: httpStatusCode.ok.status,
            message: constants.apiResponses.SOLUTION_UPDATED
          });
            
        } catch (error) {
            return reject(error);
        }
    });
  }

};
