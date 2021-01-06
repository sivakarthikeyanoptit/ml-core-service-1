/**
 * name : solutions.js
 * author : Aman
 * created-date : 03-Sep-2020
 * Description : Solution related information.
 */

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
    * "createdFor" : [ 
        "01305447637218918413"
      ],
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

        return resolve({
          message : constants.apiResponses.SOLUTION_CREATED,
          result : {
            _id : solutionData._id
          }
        });

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
  * @api {post} /kendra/api/v1/solutions/update?solutionExternalId={solutionExternalId} Update Solutions
  * @apiVersion 1.0.0
  * @apiName updateSolutions Solutions
  * @apiGroup Solutions
  * @apiSampleRequest /kendra/api/v1/solutions/update
  * @apiHeader {String} X-authenticated-user-token Authenticity token  
  * @apiUse successBody
  * @apiUse errorBody
  */

   /**
   * Update solution.
   * @method
   * @name updateSolutions
   * @param {Object} req - requested data.
   * @param {String} req.query.solutionExternalId -  solution external id.
   * @returns {JSON}
   */

  async update(req) {
    return new Promise(async (resolve, reject) => {
      try {

        let solutionData = await solutionsHelper.update(
          req.query.solutionExternalId, req.body, req.userDetails.id
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

}