/**
 * name : solutions.js
 * author : Aman
 * created-date : 03-Sep-2020
 * Description : Solution related information.
 */
// Dependencies
const solutionsHelper = require(MODULES_BASE_PATH + "/solutions/helper");
module.exports = class Solutions extends Abstract {
    
    constructor() {
        super(schemas["solutions"]);
    }

      /**
    * @api {post} /kendra/api/v1/solutions/create Create solution
    * @apiVersion 1.0.0
    * @apiName Create solution
    * @apiGroup Solutions
    * @apiParamExample {json} Request-Body:
    * {
    * "resourceType" : [],
    * "language" : [],
    * "keywords" : [],
    * "concepts" : [],
    * "createdFor" : ["01305447637218918413"],
    "themes" : [],
    "flattenedThemes" : [],
    "entities" : [ 
        "5beaa888af0065f0e0a10515"
    ],
    "registry" : [],
    "isRubricDriven" : false,
    "enableQuestionReadOut" : false,
    "allowMultipleAssessemts" : false,
    "isDeleted" : false,
    "rootOrganisations" : [ 
        "01305447637218918413"
    ],
    "programExternalId" : "AMAN_TEST_123-1607937244986",
    "entityType" : "school",
    "type" : "improvementProject",
    "subType" : "improvementProject",
    "isReusable" : false,
    "externalId" : "01c04166-a65e-4e92-a87b-a9e4194e771d-1607936956167"
    }
    * @apiHeader {String} internal-access-token internal access token  
    * @apiHeader {String} X-authenticated-user-token Authenticity token
    * @apiSampleRequest /kendra/api/v1/solutions/create
    * @apiUse successBody
    * @apiUse errorBody
    * @apiParamExample {json} Response:
    * {
    "message": "Solution created successfully",
    "status": 200,
    "result": {
        "_id": "5ff447e127ef425953bd8306"
    }}
    */

     /**
   * Create solution.
   * @method
   * @name create
   * @param {Object} req - requested data.
   * @param {String} req.params._id - solution id.
   * @returns {JSON} Created solution data.
   */

  async create(req) {
    return new Promise(async (resolve, reject) => {
      try {

        let solutionData = await solutionsHelper.createSolution(
          req.body
        );

        solutionData["result"] = solutionData.data;

        return resolve(solutionData);

      } catch (error) {
        return reject({
          status: error.status || httpStatusCode.internal_server_error.status,
          message: error.message || httpStatusCode.internal_server_error.message,
          errorObject: error
        });
      }
    });
  }

  /**
  * @api {post} /kendra/api/v1/solutions/update/:solutionId Update Solution
  * @apiVersion 1.0.0
  * @apiName Update Solution
  * @apiGroup Solutions
  * @apiSampleRequest /kendra/api/v1/solutions/update/6006b5cca1a95727dbcdf648
  * @apiHeader {String} internal-access-token internal access token 
  * @apiHeader {String} X-authenticated-user-token Authenticity token  
  * @apiUse successBody
  * @apiUse errorBody
  * @apiParamExample {json} Response:
  * {
  *  "status": 200,
    "message": "Solution updated successfully"
  }
  */

   /**
   * Update solution.
   * @method
   * @name update
   * @param {Object} req - requested data.
   * @param {String} req.params._id -  solution external id.
   * @returns {JSON}
   */

  async update(req) {
    return new Promise(async (resolve, reject) => {
      try {

        let solutionData = await solutionsHelper.update(
          req.params._id, 
          req.body, 
          req.userDetails.id
        );

        return resolve(solutionData);
      }
      catch (error) {
        reject({
          status: error.status || httpStatusCode.internal_server_error.status,
          message: error.message || httpStatusCode.internal_server_error.message,
          errorObject: error
        })
      }
    })
  } 

   /**
  * @api {post} /kendra/api/v1/solutions/list?type=:type&subType=:subType&page=:page&limit=:limit&search=:search List Solutions
  * @apiVersion 1.0.0
  * @apiName List solutions
  * @apiGroup Solutions
  * @apiParamExample {json} Request-Body:
  * {
      "isReusable" : false
    }
  * @apiSampleRequest /kendra/api/v1/solutions/list?type=improvementProject&page=1&limit=5
  * @apiHeader {String} X-authenticated-user-token Authenticity token  
  * @apiUse successBody
  * @apiUse errorBody
  * @apiParamExample {json} Response:
  * {
    "message": "Solutions lists fetched successfully",
    "status": 200,
    "result": {
        "data": [
            {
                "_id": "5d15b0d7463d3a6961f91748",
                "externalId": "LSAS-Dream A Dream-2019-TEMPLATE",
                "name": "Life Skills Assessment Survey",
                "description": "Life Skills Assessment Survey"
            }
        ],
        "count": 71
    }}
  */

   /**
   * List solutions.
   * @method
   * @name list
   * @param {Object} req - requested data.
   * @param {String} req.query.type - solution type.
   * @returns {JSON}
   */

  async list(req) {
    return new Promise(async (resolve, reject) => {
      try {

        let solutionData = await solutionsHelper.list(
          req.query.type,
          req.query.subType ? req.query.subType : "",
          req.body,
          req.pageNo,
          req.pageSize,
          req.searchText
        );

        solutionData["result"] = solutionData.data;

        return resolve(solutionData);
      }
      catch (error) {
        reject({
          status: error.status || httpStatusCode.internal_server_error.status,
          message: error.message || httpStatusCode.internal_server_error.message,
          errorObject: error
        })
      }
    })
  }
  
  /**
    * @api {post} /kendra/api/v1/solutions/forUserRoleAndLocation?programId=:programId&type=:type&subType=:subType&page=:page&limit=:limit Auto targeted solutions
    * @apiVersion 1.0.0
    * @apiName Auto targeted solution
    * @apiGroup Solutions
    * @apiParamExample {json} Request-Body:
    * {
        "role" : "HM",
   		  "state" : "236f5cff-c9af-4366-b0b6-253a1789766a",
        "district" : "1dcbc362-ec4c-4559-9081-e0c2864c2931",
        "school" : "c5726207-4f9f-4f45-91f1-3e9e8e84d824",
        "filter" : {}
      }
    * @apiHeader {String} X-authenticated-user-token Authenticity token
    * @apiSampleRequest /kendra/api/v1/solutions/forUserRoleAndLocation?type=assessment&page=1&limit=5
    * @apiUse successBody
    * @apiUse errorBody
    * @apiParamExample {json} Response:
    * {
    "message": "Successfully targeted solutions fetched",
    "status": 200,
    "result": {
        "data": [
            {
                "_id": "5ff447e127ef425953bd8306",
                "programId": "5ff438b04698083dbfab7284",
                "programName": "TEST scope in program"
            }
        ],
        "count": 1
    }
    }
    */

     /**
   * Auto targeted solution.
   * @method
   * @name forUserRoleAndLocation
   * @param {Object} req - requested data.
   * @returns {JSON} Created solution data.
   */

  async forUserRoleAndLocation(req) {
    return new Promise(async (resolve, reject) => {
      try {

        let targetedSolutions = await solutionsHelper.forUserRoleAndLocation(
          req.body,
          req.query.type ? req.query.type : "",
          req.query.subType ? req.query.subType : "",
          req.query.programId ? req.query.programId : "",
          req.pageSize,
          req.pageNo,
          req.searchText
        );
          
        targetedSolutions["result"] = targetedSolutions.data;
        return resolve(targetedSolutions);

      } catch (error) {
        return reject({
          status: error.status || httpStatusCode.internal_server_error.status,
          message: error.message || httpStatusCode.internal_server_error.message,
          errorObject: error
        });
      }
    });
  }

  /**
    * @api {post} /assessment/api/v1/solutions/detailsBasedOnRoleAndLocation/:solutionId Solution details based on role and location.
    * @apiVersion 1.0.0
    * @apiName Targeted solution details
    * @apiGroup Solutions
    * @apiParamExample {json} Request-Body:
    * {
        "role" : "HM",
   		  "state" : "236f5cff-c9af-4366-b0b6-253a1789766a",
        "district" : "1dcbc362-ec4c-4559-9081-e0c2864c2931",
        "school" : "c5726207-4f9f-4f45-91f1-3e9e8e84d824"
      }
    * @apiHeader {String} X-authenticated-user-token Authenticity token
    * @apiSampleRequest /assessment/api/v1/solutions/detailsBasedOnRoleAndLocation/5fc3dff14ea9b44f3340afe2
    * @apiUse successBody
    * @apiUse errorBody
    * @apiParamExample {json} Response:
    * {
    "message": "Successfully targeted solutions fetched",
    "status": 200,
    "result": {
        "_id": "5fc3dff14ea9b44f3340afe2",
        "isAPrivateProgram": true,
        "programId": "5ff438b04698083dbfab7284",
        "programExternalId": "TEST_SCOPE_PROGRAM",
        "programName": "TEST_SCOPE_PROGRAM",
        "programDescription": "TEST_SCOPE_PROGRAM",
        "entityType": "school",
        "entityTypeId": "5d15a959e9185967a6d5e8a6",
        "externalId": "f449823a-06bb-4a3f-9d49-edbe1524ebbb-1606672337956",
        "projectTemplateId": "5ff4a46aa87a5c721f9eb664"
    }}
    */

     /**
   * Solution details based on role and location.
   * @method
   * @name detailsBasedOnRoleAndLocation
   * @param {Object} req - requested data.
   * @returns {JSON} Created solution data.
   */

  async detailsBasedOnRoleAndLocation(req) {
    return new Promise(async (resolve, reject) => {
      try {

        let solutionDetails = 
        await solutionsHelper.detailsBasedOnRoleAndLocation(
          req.params._id,
          req.body
        );
          
        solutionDetails.result = solutionDetails.data;
        return resolve(solutionDetails);

      } catch (error) {
        return reject({
          status: error.status || httpStatusCode.internal_server_error.status,
          message: error.message || httpStatusCode.internal_server_error.message,
          errorObject: error
        });
      }
    });
  }

}