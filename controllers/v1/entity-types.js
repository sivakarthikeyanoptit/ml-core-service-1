/**
 * name : entityTypesController.js
 * author : Akash
 * created-date : 22-Nov-2018
 * Description : Entity types information. 
 */

 // Dependencies
const entitiyTypesHelper = require(MODULES_BASE_PATH + "/entityTypes/helper");

 /**
    * EntityTypes
    * @class
*/
module.exports = class EntityTypes extends Abstract {
  constructor() {
    super(schemas["entityTypes"]);
  }

  static get name() {
    return "entityTypes";
  }

   /**
   * @api {post} /kendra/api/v1/entity-types/list
   * Lists of entity types.
   * @apiVersion 0.0.1
   * @apiName Lists of entity types.
   * @apiGroup Entity Types
   * @apiHeader {String} X-authenticated-user-token Authenticity token
   * @apiParamExample {json} Request-Body:
   * {
    "query" : {
        "name" : "school"
    },
    "projection" : ["_id","name"]
    }
   * @apiSampleRequest /kendra/api/v1/entity-types/list
   * @apiUse successBody
   * @apiUse errorBody
   * @apiParamExample {json} Response: 
   * {
   * "message": "Entity types fetched successfully",
   * "status": 200,
   * "result" : [
   *  {
   * "_id": "5d15a959e9185967a6d5e8a6",
   *  "name": "school"
   }]
  }
   */

  /**
   * Lists of entity types.
   * @method
   * @name find
   * @param {Object} req - Requested data.
   * @param {Object} req.body.query - Filtered data.
   * @param {Array} req.body.projection - Projected data.
   * @param {Array} req.body.skipFields - Field to skip.
   * @returns {JSON} List entity types.
  */

 async list(req) {
  return new Promise(async (resolve, reject) => {
    try {

      const entityTypes = await entitiyTypesHelper.list(req.body);
      return resolve(entityTypes);

    } catch (error) {
      return reject({
        status: error.status || httpStatusCode.internal_server_error.status,
        message: error.message || httpStatusCode.internal_server_error.message,
        errorObject: error
      });
    }
  });
}

};
