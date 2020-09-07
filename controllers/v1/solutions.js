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
   * @api {post} /kendra/api/v1/solutions/list
   * Solutions lists.
   * @apiVersion 0.0.1
   * @apiName Solutions lists.
   * @apiGroup Solutions
   * @apiHeader {String} X-authenticated-user-token Authenticity token
   * @apiParamExample {json} Request-Body:
   * {
    "query" : {
        "externalId" : "EF-DCPCR-2018-001"
    },
    "projection" : ["_id","name"]
    }
   * @apiSampleRequest /kendra/api/v1/solutions/list
   * @apiUse successBody
   * @apiUse errorBody
   * @apiParamExample {json} Response: 
   * {
   * "message": "Solutions fetched successfully",
   * "status": 200,
    "result": [
        {
            "_id": "5b98fa069f664f7e1ae7498c",
            "name": "DCPCR Assessment Framework 2018"
        }
    ]
    }
   */

  /**
   * List solutions.
   * @method
   * @name list
   * @param {Object} req - Requested data.
   * @param {Object} req.body.query - Filtered data.
   * @param {Array} req.body.projection - Projected data.
   * @param {Array} req.body.skipFields - Field to skip.
   * @returns {JSON} List solutions data.
  */

 async list(req) {
    return new Promise(async (resolve, reject) => {
      try {
  
        const solutions = await solutionsHelper.list(
            req.body
        );
  
        return resolve(solutions);
  
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
  * @api {post} /kendra/api/v1/solutions/updateSolutions?solutionExternalId={solutionExternalId} Update Solutions
  * @apiVersion 1.0.0
  * @apiName updateSolutions Solutions
  * @apiGroup Solutions
  * @apiSampleRequest /kendra/api/v1/solutions/updateSolutions
  * @apiHeader {String} X-authenticated-user-token Authenticity token  
  * @apiUse successBody
  * @apiUse errorBody
  * @apiParamExample {json} Response :
  * {
    "message": "Solution updated successfully",
    "status": 200
  } 
  */

   /**
   * Update solution.
   * @method
   * @name updateSolutions
   * @param {Object} req - requested data.
   * @param {String} req.query.solutionExternalId -  solution external id.
   * @returns {JSON}
   */

  async updateSolutions(req) {
    return new Promise(async (resolve, reject) => {
      try {

        const solutionUpdation = await solutionsHelper.updateSolutions(
          req.query.solutionExternalId,
          req.body,
          req.userDetails.userId
        );

        return resolve(solutionUpdation);
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