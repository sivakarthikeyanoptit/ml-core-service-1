/**
 * name : user-extensions.js
 * author : Aman Jung Karki
 * created-date : 11-Feb-2020
 * Description : All user extension related information.
 */

/**
    * UserExtension
    * @class
*/

let userExtensionHelper = require(ROOT_PATH+"/module/user-extension/helper");

module.exports = class UserExtension extends Abstract {
  
  constructor() {
    super(schemas["user-extension"]);
  }

  static get name() {
    return "user-extension";
  }

  /**
  * @api {get} /kendra/api/v1/user-extension/getProfile/{{userId}} Get user profile
  * @apiVersion 1.0.0
  * @apiName Get user profile
  * @apiGroup User Extension
  * @apiHeader {String} X-authenticated-user-token Authenticity token
  * @apiSampleRequest /assessment/api/v1/user-extension/getProfile/e97b5582-471c-4649-8401-3cc4249359bb
  * @apiUse successBody
  * @apiUse errorBody
  * @apiParamExample {json} Response:
  * {
  *  "_id": "5d5e4758f89df53a1d26b454",
     "externalId": "a1",
     "roles": [
        {
         "_id": "5d5e47051f5a363a0a187029",
         "code": "HM",
         "title": "Headmaster",
         "immediateSubEntityType": "school",
         "entities": [
          {
            "_id": "5bfe53ea1d0c350d61b78d0f",
            "externalId": "1208138",
            "name": "Shri Shiv Middle School, Shiv Kutti, Teliwara, Delhi",
            "childrenCount": 0,
             "entityType": "school",
             "entityTypeId": "5ce23d633c330302e720e65f",
             "subEntityGroups": [
              "parent"
              ]
            }
          ]
       }
     ]
  * }
  */

  /**
   * Get profile of user.
   * @method
   * @name getProfile
   * @param {Object} req - request data.
   * @param {String} req.params._id - user id.
   * @returns {JSON} User profile data. 
   */

  getProfile(req) {
    return new Promise(async (resolve, reject) => {

      try {

        let result = await userExtensionHelper.profileWithEntityDetails({
          userId: (req.params._id && req.params._id != "") ? req.params._id : req.userDetails.userId,
          status: constants.common.ACTIVE,
          isDeleted: false
        },req.headers.appname);

        return resolve({
          message: constants.apiResponses.USER_EXTENSION_FETCHED,
          result: result
        });

      } catch (error) {

        return reject({
          status: error.status || httpStatusCode.internal_server_error.status,
          message: error.message || httpStatusCode.internal_server_error.message,
          errorObject: error
        })

      }


    })
  }



};
