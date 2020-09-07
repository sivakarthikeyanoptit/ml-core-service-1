/**
 * name : user-roles.js
 * author : Aman
 * created-date : 03-Sep-2020
 * Description : User roles related information.
 */

// Dependencies
const userRolesHelper = require(MODULES_BASE_PATH + "/user-roles/helper");

module.exports = class UserRoles extends Abstract {
    
    constructor() {
        super(schemas["user-roles"]);
    }

    /**
   * @api {post} /kendra/api/v1/user-roles/list
   * Lists user roles.
   * @apiVersion 0.0.1
   * @apiName Lists of user roles.
   * @apiGroup User Roles
   * @apiHeader {String} X-authenticated-user-token Authenticity token
   * @apiParamExample {json} Request-Body:
   * {
    "query" : {
        "code" : "HM"
    },
    "projection" : ["_id","code"]
    }
   * @apiSampleRequest /kendra/api/v1/user-roles/list
   * @apiUse successBody
   * @apiUse errorBody
   * @apiParamExample {json} Response: 
   * {
    "message": "Successfully fetched user roles",
    "status": 200,
    "result": [
        {
            "_id": "5d6e521066a9a45df3aa891e",
            "code": "HM"
        }
    ]
  }
   */

  /**
   * List user roles.
   * @method
   * @name list
   * @param {Object} req - Requested data.
   * @param {Object} req.body.query - Filtered data.
   * @param {Array} req.body.projection - Projected data.
   * @param {Array} req.body.skipFields - Field to skip.
   * @returns {JSON} List user roles.
  */

 async list(req) {
    return new Promise(async (resolve, reject) => {
      try {
  
        const userRoles = await userRolesHelper.list(req.body);
  
        return resolve(userRoles);
  
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