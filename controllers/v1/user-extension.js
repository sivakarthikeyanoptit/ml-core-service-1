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
  * @apiSampleRequest /kendra/api/v1/user-extension/getProfile/e97b5582-471c-4649-8401-3cc4249359bb
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

  /**
  * @api {post} /kendra/api/v1/user-extension/updateProfileRoles/{{userId}} Update profile roles.
  * @apiVersion 1.0.0
  * @apiName Update profile roles.
  * @apiGroup User Extension
  * @apiHeader {String} X-authenticated-user-token Authenticity token
  * @apiSampleRequest /kendra/api/v1/user-extension/updateProfileRoles/8f6d6fd2-c069-41f1-b94d-ad2befcc964b
  * @apiParamExample {json} Request-body:
  * {
    "stateId" : "5da829874c67d63cca1bd9d0",
    "roles" : [{
        "_id" : "5d7a2d266371783ceb11064e",
        "entities" : [
            "5da70ff64c67d63cca1b94e0"
        ]
      }
    ]
  }
  * @apiUse successBody
  * @apiUse errorBody
  * @apiParamExample {json} Response:
  * {
    "message": "User extension updated successfully",
    "status": 200,
    "result": {
        "_id": "5f587db299333547476e8f80",
        "externalId": "a1",
        "state": {
            "_id": "5da829874c67d63cca1bd9d0",
            "name": "Punjab"
        },
        "roles": [
            {
                "_id": "5d7a2d266371783ceb11064e",
                "code": "SPD",
                "title": "State Project Director",
                "immediateSubEntityType": "school",
                "entities": [
                    {
                        "_id": "5da70ff64c67d63cca1b94e0",
                        "externalId": "3200100201",
                        "name": "PUNJAB GPS ASPAL KHURD",
                        "childrenCount": 0,
                        "entityType": "school",
                        "entityTypeId": "5d15a959e9185967a6d5e8a6",
                        "subEntityGroups": [],
                        "relatedEntities": [
                            {
                                "_id": "5da829874c67d63cca1bd9d0",
                                "entityTypeId": "5d7a290e6371783ceb11064c",
                                "entityType": "state",
                                "metaInformation": {
                                    "externalId": "PBS",
                                    "name": "Punjab"
                                }
                            },
                            {
                                "_id": "5da829a94c67d63cca1bd9d2",
                                "entityTypeId": "5d15a959e9185967a6d5e8ac",
                                "entityType": "district",
                                "metaInformation": {
                                    "externalId": "BARNALA -3",
                                    "name": "BARNALA"
                                }
                            },
                            {
                                "_id": "5da829f64c67d63cca1bd9f1",
                                "entityTypeId": "5d15a959e9185967a6d5e8ab",
                                "entityType": "block",
                                "metaInformation": {
                                    "externalId": "PJ-BARNALA",
                                    "name": "BARNALA"
                                }
                            },
                            {
                                "_id": "5da82a1c4c67d63cca1bdae8",
                                "entityTypeId": "5d15c4ec03cbf959ccabdd2b",
                                "entityType": "cluster",
                                "metaInformation": {
                                    "externalId": "PJ-GPS KALEKE",
                                    "name": "GPS KALEKE",
                                    "city": ""
                                }
                            }
                        ]
                    }
                ]
            }
        ]
    }
}
  */

  /**
   * Update profile roles.
   * @method
   * @name updateProfileRoles
   * @param {Object} req - request data.
   * @param {String} req.params._id - user id.
   * @returns {JSON} Update profile roles.
   */

  updateProfileRoles(req) {
    return new Promise(async (resolve, reject) => {

      try {

        const userExtensionData = 
        await userExtensionHelper.updateProfileRoles(
          req.body,
          req.params._id ? req.params._id : req.userDetails.userId,
          req.userDetails.userName
        );

        return resolve(userExtensionData);

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
