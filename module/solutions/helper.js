/**
 * name : helper.js
 * author : Aman
 * created-date : 03-sep-2020
 * Description : Solution related helper functionality.
 */

// Dependencies

const programsHelper = require(MODULES_BASE_PATH + "/programs/helper");
const entityTypesHelper = require(MODULES_BASE_PATH + "/entityTypes/helper");
const entitiesHelper = require(MODULES_BASE_PATH + "/entities/helper");
const userRolesHelper = require(MODULES_BASE_PATH + "/user-roles/helper");

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
   * Create solution.
   * @method 
   * @name createSolution
   * @param {Object} data - solution creation data.
   * @returns {JSON} solution creation data. 
   */
  
  static createSolution(data) {
    return new Promise(async (resolve, reject) => {
        try {

            if( data.programExternalId ) {

              let programData = await programsHelper.programDocuments({
                externalId : data.programExternalId
              },["name","description"]);

              if ( !programData.length > 0 ) {
                throw {
                  message : constants.apiResponses.PROGRAM_NOT_FOUND
                }
              }

              data.programId = programData[0]._id;
              data.programName = programData[0].name;
              data.programDescription = programData[0].description; 
            }

            if( data.entityType ) {
              
              let entityTypeData = 
              await entityTypesHelper.entityTypesDocument({
                name : data.entityType
              },["_id"]);

              if( !entityTypeData.length > 0 ) {
                throw {
                  message : constants.apiResponses.ENTITY_TYPES_NOT_FOUND
                }
              }
            }

            if( data.entities && data.entities.length > 0 ) {
              
              let entitiesData = 
              await entitiesHelper.entityDocuments({
                _id : { $in : data.entities }
              },["_id"]);

              if( !entitiesData.length > 0 ) {
                throw {
                  message : constants.apiResponses.ENTITIES_NOT_FOUND
                }
              }

              entitiesData = entitiesData.map( entity => {
                return entity._id;
              })
            }

            if( data.type ) {
              
              let solutionTypeList = solutionTypes();
              if( !solutionTypeList.includes(data.type) ) {
                throw {
                  message : constants.apiResponses.SOLUTION_TYPE_INVALID
                }
              }
            }

            data.status = constants.common.ACTIVE_STATUS;
    
            let solutionData = 
            await database.models.solutions.create(
              _.omit(data,["scope"])
            );

            if( !solutionData._id ) {
              throw {
                message : constants.apiResponses.SOLUTION_NOT_CREATED
              }
            }

            if( !solutionData.isReusable ) {

              let updateProgram = 
              await database.models.programs.updateOne(
                { 
                  _id: data.programId
                }, { 
                  $addToSet: { components : solutionData._id } 
              });

              let solutionScope = 
              await this.addScope(
                data.programId,
                solutionData._id,
                data.scope ? data.scope : {}
              );

            }
            
            return resolve(solutionData);
            
        } catch (error) {
            return reject(error);
        }
    });
  }

    /**
   * add scope in solution
   * @method
   * @name addScope
   * @param {String} programId - program id.
   * @param {String} solutionId - solution id.
   * @param {Object} scopeData - scope data. 
   * @returns {JSON} - Added scope in solution.
   */

  static addScope( programId,solutionId,scopeData ) {

    return new Promise(async (resolve, reject) => {

      try {

        let programData = await programsHelper.programDocuments({ _id : programId },["_id","scope"]);
 
        if( !programData.length > 0 ) {
          return resolve({
            status : httpStatusCode.bad_request.status,
            message : constants.apiResponses.PROGRAM_NOT_FOUND
          });
        }

        let solutionData = await this.solutionDocuments({ _id : solutionId },["_id"]);

        if( !solutionData.length > 0 ) {
          return resolve({
            status : httpStatusCode.bad_request.status,
            message : constants.apiResponses.SOLUTION_NOT_FOUND
          });
        }

        if( programData[0].scope ) {
          
          let currentSolutionScope = programData[0].scope;

          if( Object.keys(scopeData).length > 0 ) {

            if( !scopeData.entityType ) {
              return resolve({
                status : httpStatusCode.bad_request.status,
                message : constants.apiResponses.ENTITY_TYPE_REQUIRED_IN_SCOPE
              });
            }

            let entityType =  await entityTypesHelper.entityTypesDocument(
              {
                name : scopeData.entityType
              },
              ["name","_id"]
            );
        
            currentSolutionScope.entityType = entityType[0].name;
            currentSolutionScope.entityTypeId = entityType[0]._id;

            if( !scopeData.entities && !scopeData.entities.length > 0 ) {

              return resolve({
                status : httpStatusCode.bad_request.status,
                message : constants.apiResponses.ENTITIES_REQUIRED_IN_SCOPE
              });

            }
            
            let entities = 
            await entitiesHelper.entityDocuments(
              {
                _id : { $in : scopeData.entities },
                entityTypeId : entityType[0]._id
              },["_id"]
            );

            if( !entities.length > 0 ) {
              return resolve({
                status : httpStatusCode.bad_request.status,
                message : constants.apiResponses.ENTITIES_NOT_FOUND
              });
            }

            let entityIds = [];

            for( let entity = 0; entity < entities.length; entity ++ ) {
              
              let entityQuery = {
                _id : { $in : currentSolutionScope.entities },
                [`groups.${currentSolutionScope.entityType}`] : entities[entity]._id
              }

              let entityInParent = 
              await entitiesHelper.entityDocuments(entityQuery);

              if( entityInParent.length > 0 ) {
                entityIds.push(ObjectId(entities[entity]._id));
              }
            }

            if( !entityIds.length > 0 ) {
              
              return resolve({
                status : httpStatusCode.bad_request.status,
                message : constants.apiResponses.SCOPE_ENTITY_INVALID
              });

            }

            currentSolutionScope.entities = entityIds;

            if( !scopeData.roles.length > 0 ) {
              return resolve({
                status : httpStatusCode.bad_request.status,
                message : constants.apiResponses.ROLE_REQUIRED_IN_SCOPE
              });
            }

            let code = [];
            for(var pointerToCode = 0; pointerToCode < scopeData.roles.length; pointerToCode++){
              code.push(scopeData.roles[pointerToCode].code)
            }

            let userRoles = await userRolesHelper.roleDocuments({
              code : { $in : code }
            },["_id","code"]);

            if( !userRoles.length > 0 ) {
              return resolve({
                status : httpStatusCode.bad_request.status,
                message : constants.apiResponses.INVALID_ROLE_CODE
              });
            }

            currentSolutionScope["roles"] = userRoles;

            let updateSolution = 
            await database.models.solutions.findOneAndUpdate(
              {
                _id : solutionId
              },
              { $set : { scope : currentSolutionScope }},{ new: true }
            ).lean();
    
            if( !updateSolution._id ) {
              throw {
                status : constants.apiResponses.SOLUTION_SCOPE_NOT_ADDED
              };
            }
            solutionData = updateSolution;
          }

        }

        return resolve({
          success : true,
          message : constants.apiResponses.SOLUTION_UPDATED,
          data : solutionData
        });

      } catch (error) {
          return reject(error);
      }

    })
  } 


  /**
   * Update solution.
   * @method 
   * @name update
   * @param {Object} data - solution creation data.
   * @returns {JSON} solution creation data. 
   */
  
  static update(externalId, data, userId) {
    return new Promise(async (resolve, reject) => {
        try {

          let queryObject = {
            externalId: externalId
          };

          let solutionDocument = await database.models.solutions.findOne(queryObject, { _id : 1 }).lean();

          if (!solutionDocument) {
            return resolve({
              status: httpStatusCode.bad_request.status,
              message: constants.apiResponses.SOLUTION_NOT_FOUND
            });
          }

          let updateObject = {
            "$set" : {}
          };

          let solutionUpdateData = data;

          Object.keys(solutionUpdateData).forEach(solutionData=>{
            updateObject["$set"][solutionData] = solutionUpdateData[solutionData];
          });

          updateObject["$set"]["updatedBy"] = userId;

          let solutionData = await database.models.solutions.findOneAndUpdate({
            _id: solutionDocument._id
          }, _.omit(updateObject,["scope"]));

          if( !solutionData._id ) {
            throw {
              message : constants.apiResponses.SOLUTION_NOT_CREATED
            }
          }
            
          if( !solutionData.isReusable ) {

            let solutionScope = 
            await this.addScope(
              data.programId,
              solutionData._id,
              data.scope ? data.scope : {}
            );

          }

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
