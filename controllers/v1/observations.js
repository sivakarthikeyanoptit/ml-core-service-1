/**
 * name : observations.js
 * author : Aman
 * created-date : 22-Nov-2020
 * Description : Observation related information.
 */

// Dependencies
const observationsHelper = require(MODULES_BASE_PATH + "/observations/helper");

module.exports = class Observations extends Abstract {
    
    constructor() {
        super(schemas["observations"]);
    }

    /**
  * @api {post} /kendra/api/v1/observations/update/:observationId Update Solutions
  * @apiVersion 1.0.0
  * @apiName update
  * @apiGroup Observations
  * @apiSampleRequest /kendra/api/v1/observations/update/5d1a002d2dfd8135bc8e1615
  * @apiHeader {String} X-authenticated-user-token Authenticity token  
  * @apiUse successBody
  * @apiUse errorBody
  * @apiParamExample {json} Response :
  * {
  * "message": "Observations updated successfully",
  * "status": 200
  * } 
  */

   /**
   * Update observations.
   * @method
   * @name update
   * @param {Object} req - requested data.
   * @param {String} req.params._id -  solution external id.
   * @returns {JSON}
   */

  async update(req) {
    return new Promise(async (resolve, reject) => {
      try {

        const observationData = await observationsHelper.update(
          req.params._id,
          req.body,
          req.userDetails.userId
        );

        return resolve(observationData);
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
   * @api {post} /kendra/api/v1/observations/list
   * Observations lists.
   * @apiVersion 0.0.1
   * @apiName Observations lists.
   * @apiGroup Observations
   * @apiHeader {String} X-authenticated-user-token Authenticity token
   * @apiParamExample {json} Request-Body:
   * {
    "query" : {
        "_id" : "5d1a002d2dfd8135bc8e1617"
    },
    "projection" : ["_id","name"]
    }
   * @apiSampleRequest /kendra/api/v1/observations/list
   * @apiUse successBody
   * @apiUse errorBody
   * @apiParamExample {json} Response: 
   * {
   * "message": "Solutions fetched successfully",
   * "status": 200,
    "result": [
        {
            "_id": "5d1a002d2dfd8135bc8e1617",
            "name": "Karnataka Flash Visit-2019-FRAMEWORK"
        }
    ]
    }
   */

  /**
   * List observations.
   * @method
   * @name list
   * @param {Object} req - Requested data.
   * @param {Object} req.body.query - Filtered data.
   * @param {Array} req.body.projection - Projected data.
   * @param {Array} req.body.skipFields - Field to skip.
   * @returns {JSON} List observations data.
  */

 async list(req) {
    return new Promise(async (resolve, reject) => {
      try {
  
        const observations = await observationsHelper.list(
            req.body
        );
  
        return resolve(observations);
  
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