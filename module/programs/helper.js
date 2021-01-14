/**
 * name : helper.js
 * author : Aman
 * created-date : 03-sep-2020
 * Description : Programs related helper functionality.
 */

// Dependencies 

const entityTypesHelper = require(MODULES_BASE_PATH + "/entityTypes/helper");
const entitiesHelper = require(MODULES_BASE_PATH + "/entities/helper");
const userRolesHelper = require(MODULES_BASE_PATH + "/user-roles/helper");

/**
    * ProgramsHelper
    * @class
*/
module.exports = class ProgramsHelper {

    /**
   * Programs Document.
   * @method
   * @name programDocuments
   * @param {Array} [filterQuery = "all"] - solution ids.
   * @param {Array} [fieldsArray = "all"] - projected fields.
   * @param {Array} [skipFields = "none"] - field not to include
   * @returns {Array} List of programs. 
   */
  
  static programDocuments(
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
    
            let programData = await database.models.programs.find(
              queryObject, 
              projection
            ).lean();
            
            return resolve(programData);
            
        } catch (error) {
            return reject(error);
        }
    });
  }

     /**
   * Create program
   * @method
   * @name create
   * @param {Array} data 
   * @returns {JSON} - create program.
   */

  static create(data) {

    return new Promise(async (resolve, reject) => {

      try {
        
        let programData = {
          "externalId" : data.externalId,
          "name" : data.name,
          "description" : data.description ,
          "owner" : data.userId,
          "createdBy" : data.userId,
          "updatedBy" : data.userId,
          "isDeleted" : false,
          "status" : "active",
          "resourceType" : [ 
              "Program"
          ],
          "language" : [ 
              "English"
          ],
          "keywords" : [
            "keywords 1",
            "keywords 2"
          ],
          "concepts" : [],
          "createdFor" : data.createdFor,
          "rootOrganisations" : data.rootOrganisations,
          "imageCompression" : {
              "quality" : 10
          },
          "components" : [],
          "isAPrivateProgram" : data.isAPrivateProgram ? data.isAPrivateProgram : false  
        }

        let program = await database.models.programs.create(
          programData
        );

        if( !program._id ) {
          throw {
            message : constants.apiResponses.PROGRAM_NOT_CREATED
          };
        }

        if( data.scope ) {
          
          let programScopeUpdated = await this.addScope(
            program._id,
            data.scope
          );

          if( !programScopeUpdated.success ) {
            throw {
              message : constants.apiResponses.SCOPE_NOT_UPDATED_IN_PROGRAM
            }
          }

        }

        return resolve(program);

      } catch (error) {
        return reject(error);
      }

    })
  }

  /**
   * List of user created programs
   * @method
   * @name userPrivatePrograms
   * @param {String} userId
   * @returns {JSON} - List of programs that user created on app.
   */

  static userPrivatePrograms(userId) {

    return new Promise(async (resolve, reject) => {

      try {

        let programsData = await this.programDocuments({
          createdBy : userId,
          isAPrivateProgram : true
        },["name","externalId","description","_id","isAPrivateProgram"]);

        if( !programsData.length > 0 ) {
          return resolve({
            message : constants.apiResponses.PROGRAM_NOT_FOUND,
            result : []
          });
        }

        return resolve(programsData);

      } catch (error) {

        return reject(error);

      }

    })
  }

    /**
   * add scope in program
   * @method
   * @name addScope
   * @param {String} programId - program id.
   * @param {Object} scopeData - scope data. 
   * @returns {JSON} - Added scope data.
   */

  static addScope( programId,scopeData ) {

    return new Promise(async (resolve, reject) => {

      try {

        let programData = await this.programDocuments({ _id : programId },["_id"]);

        if( !programData.length > 0 ) {
          return resolve({
            status : httpStatusCode.bad_request.status,
            message : constants.apiResponses.PROGRAM_NOT_FOUND
          });
        }

        if( !scopeData.entityType ) {
          return resolve({
            status : httpStatusCode.bad_request.status,
            message : constants.apiResponses.ENTITY_TYPE_REQUIRED_IN_SCOPE
          });
        }

        let entityTypeData =  await entityTypesHelper.entityTypesDocument(
          {
            name : scopeData.entityType
          },
          ["name","_id"]
        );
        
        if( !entityTypeData.length > 0 ) {
          return resolve({
            status : httpStatusCode.bad_request.status,
            message : constants.apiResponses.ENTITY_TYPES_NOT_FOUND
          });
        }

        let scope = {
          entityType : entityTypeData[0].name,
          entityTypeId : entityTypeData[0]._id
        }

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
            entityTypeId : entityTypeData[0]._id
          },["_id"]
        );
        
        if( !entities.length > 0 ) {
          return resolve({
            status : httpStatusCode.bad_request.status,
            message : constants.apiResponses.ENTITIES_NOT_FOUND
          });
        }

        scope["entities"] = entities.map(entity => {
          return entity._id;
        });

        if( !scopeData.roles ) {
          return resolve({
            status : httpStatusCode.bad_request.status,
            message : constants.apiResponses.ROLE_REQUIRED_IN_SCOPE
          });
        }
        
        let userRoles = await userRolesHelper.roleDocuments({
          code : { $in : scopeData.roles }
        },["_id","code"]
        );
        
        if( !userRoles.length > 0 ) {
          return resolve({
            status : httpStatusCode.bad_request.status,
            message : constants.apiResponses.INVALID_ROLE_CODE
          });
        }

        scope["roles"] = userRoles;

        let updateProgram = 
        await database.models.programs.findOneAndUpdate(
          {
            _id : programId
          },
          { $set : { scope : scope }},{ new: true }
        ).lean();

        if( !updateProgram._id ) {
          throw {
            status : constants.apiResponses.PROGRAM_SCOPE_NOT_ADDED
          };
        }

        return resolve({
          success : true,
          message : constants.apiResponses.PROGRAM_UPDATED_SUCCESSFULLY,
          data : updateProgram
        });

      } catch (error) {
          return reject(error);
      }

    })
  }

   /**
   * Update program
   * @method
   * @name update
   * @param {String} programId - program id.
   * @param {Array} data 
   * @param {String} userId
   * @returns {JSON} - update program.
   */

  static update(programId,data,userId) {

    return new Promise( async (resolve, reject) => {

      try {

        data.updatedBy = userId;
        data.updatedAt = new Date();

        let program = await database.models.programs.findOneAndUpdate({
          _id : programId
        },{ $set : _.omit(data,["scope"]) }, { new: true });

        if( !program ) {
          throw {
            message : constants.apiResponses.PROGRAM_NOT_UPDATED
          };
        }

        if( data.scope ) {
          
          let programScopeUpdated = await this.addScope(
            programId,
            data.scope
          );

          if( !programScopeUpdated.success ) {
            throw {
              message : constants.apiResponses.SCOPE_NOT_UPDATED_IN_PROGRAM
            }
          }

        }

        return resolve({
          success : true,
          message : constants.apiResponses.PROGRAMS_UPDATED,
          data : {
            _id : programId
          }
        });

      } catch (error) {
          return resolve({
            success : false,
            message : error.message,
            data : {}
          });
      }

    })
  }

};
