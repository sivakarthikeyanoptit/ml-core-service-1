/**
 * name : programs.js
 * author : Aman
 * created-date : 03-Sep-2020
 * Description : Solution related information.
 */

// Dependencies
const programsHelper = require(MODULES_BASE_PATH + "/programs/helper");

module.exports = class Programs extends Abstract {
    
    constructor() {
        super(schemas["programs"]);
    }

    /**
   * @api {post} /kendra/api/v1/programs/list
   * programs lists.
   * @apiVersion 0.0.1
   * @apiName programs lists.
   * @apiGroup programs
   * @apiHeader {String} X-authenticated-user-token Authenticity token
   * @apiParamExample {json} Request-Body:
   * {
    "query" : {
        "externalId" : "PROGID01"
    },
    "projection" : ["_id","name"]
    }
   * @apiSampleRequest /kendra/api/v1/programs/list
   * @apiUse successBody
   * @apiUse errorBody
   * @apiParamExample {json} Response: 
   * {
   * "message": "Programs fetched successfully",
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
   * List programs.
   * @method
   * @name list
   * @param {Object} req - Requested data.
   * @param {Object} req.body.query - Filtered data.
   * @param {Array} req.body.projection - Projected data.
   * @param {Array} req.body.skipFields - Field to skip.
   * @returns {JSON} List programs data.
  */

 async list(req) {
    return new Promise(async (resolve, reject) => {
      try {
  
        const programs = await programsHelper.list(
            req.body
        );
  
        return resolve(programs);
  
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