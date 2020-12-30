/**
 * name : helper.js
 * author : Aman
 * created-date : 03-sep-2020
 * Description : Programs related helper functionality.
 */

/**
    * ProgramsHelper
    * @class
*/
const samikshaService = require(ROOT_PATH + "/generics/services/samiksha");
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


        let programsData = await this.programDocuments({
          externalId : data.externalId
        },["_id"]);

        if(programsData && programsData.length > 0) {
          return resolve({
            message : constants.apiResponses.PROGRAM_EXIST,
            result : []
          });
        }

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
          "keywords" : data.keywords ? data.keywords : [
            "keywords 1",
            "keywords 2"
          ],
          "concepts" : [],
          "createdFor" : data.createdFor,
          "rootOrganisations" : data.rootOrganisations,
          "imageCompression" : {
              "quality" : 10
          },
          "components" : data.components,
          "isAPrivateProgram" : data.isAPrivateProgram ? data.isAPrivateProgram : false
        }

        let program = await database.models.programs.create(
          programData
        );

        if(!program){
          throw new Error(constants.apiResponses.ERROR_CREATING_PROGRAM);
        }

        if(data.scope && program.components){
          let scope = {
            "programs": data.scope
          }

          for(var i=0; i < program.components.length; i++){
            let programSolutionMap = await samikshaService.createProgramSolutionMap(program._id,program.components[i],scope);
          }
          
        }

        return resolve({
          message : constants.apiResponses.PROGRAMS_CREATED,
          result : {
            "_id" : program._id
          }
        });

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
        },["name","externalId","description","_id"]);

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
   * Update program
   * @method
   * @name update
   * @param {Array} data 
   * @returns {JSON} - create program.
   */

  static update(programId="", programData) {

    return new Promise(async (resolve, reject) => {

      try {

        let updatedProgramData = programData;
        let reqScope;

        if(programData.scope){
          reqScope = programData.scope;
          delete updatedProgramData.scope;
        }
        
        let program = await database.models.programs.findOneAndUpdate(
          { _id: programId },
          { $set: updatedProgramData }
        );

        if(!program){
          return resolve({
            message : constants.apiResponses.PROGRAM_NOT_FOUND,
            result : []
          });
        }

        if(reqScope && program.components){

          console.log("scope there")

          let scope = {
            "programs": reqScope
          }

          for(var i=0; i < program.components.length; i++){
            let programSolutionMap = await samikshaService.updateProgramSolutionMap(program._id,program.components[i],scope);
          }
        }

        return resolve({
            message: constants.apiResponses.PROGRAMS_UPDATED,
            result: {
              "_id" : program._id
            }
        })

      } catch (error) {
          return reject(error);
      }

    })
  }


  /**
   * Search programs.
   * @method
   * @name search
   * @param {Object} filteredData - Search programs from filtered data.
   * @param {Number} pageSize - page limit.
   * @param {Number} pageNo - No of the page. 
   * @param {Object} projection - Projected data. 
   * @returns {Array} List of programs document. 
   */

  static search(filteredData, pageSize, pageNo,projection) {
    return new Promise(async (resolve, reject) => {
      try {

        let programDocument = [];

        let projection1 = {};

        if( projection ) {
          projection1["$project"] = projection
        } else {
          projection1["$project"] = {
            name: 1,
            externalId: 1,
            components: 1
          };
        }

        let facetQuery = {};
        facetQuery["$facet"] = {};

        facetQuery["$facet"]["totalCount"] = [
          { "$count": "count" }
        ];

        facetQuery["$facet"]["data"] = [
          { $skip: pageSize * (pageNo - 1) },
          { $limit: pageSize }
        ];

        let projection2 = {};
        projection2["$project"] = {
          "data": 1,
          "count": {
            $arrayElemAt: ["$totalCount.count", 0]
          }
        };

        programDocument.push(filteredData, projection1, facetQuery, projection2);

        let programDocuments = 
        await database.models.programs.aggregate(programDocument);

        return resolve(programDocuments);

      } catch (error) {
        return reject(error);
      }
    })
  }

};
