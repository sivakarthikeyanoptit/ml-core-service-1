/**
 * name : user-extensions.js
 * author : Aman Jung Karki
 * created-date : 11-Feb-2020
 * Description : All user extension related information.
 */

// Dependencies
const userExtensionHelper = require(ROOT_PATH+"/module/user-extension/helper");

/**
    * UserExtension
    * @class
*/
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
  * @api {get} /kendra/api/v1/user-extension/update/{{userId}} Update user profile
  * @apiVersion 1.0.0
  * @apiName Update user profile
  * @apiGroup User Extension
  * @apiHeader {String} X-authenticated-user-token Authenticity token
  * @apiSampleRequest /kendra/api/v1/user-extension/update/e97b5582-471c-4649-8401-3cc4249359bb
  * @apiUse successBody
  * @apiUse errorBody
  * @apiParamExample {json} Response:
  * {
  * "message": "User profile fetched successfully.",
  * "status": 200,
  *  "result": {
        "roles": [],
        "status": "active",
        "isDeleted": false,
        "devices": [
            {
                "deviceId": "eZPYAJ_thEA:APA91bHniRt_Tfax3KIi0yCqykT-w50-KFyhjgBE9derqXRcFuyu2boa8EVcYn1Yt2lan1eoSNlp2hA5h_oRT7W8YAyYKoQAiT6IuYZ9shJKhDNLnCUR2x1cebrJ3JoMwdIoO5H2Oo7T",
                "os": "android, android",
                "app": "diksha survey",
                "appType": "assessment",
                "status": "active",
                "activatedAt": "2020-08-12T10:27:10.888Z"
            },
            {
                "deviceId": "eZPYAJ_thEA:APA91bHniRt_Tfax3KIi0yCqykT-w50-KFyhjgBE9derqXRcFuyu2boa8EVcYn1Yt2lan1eoSNlp2hA5h_oRT7W8YAyYKoQAiT6IuYZ9shJKhDNLnCUR2x1cebrJ3JoMwdIoO5H2Oo7Te",
                "os": "android, android",
                "app": "diksha survey",
                "appType": "assessment",
                "status": "active",
                "activatedAt": "2020-08-12T10:28:38.706Z"
            },
            {
                "deviceId": "abc",
                "os": "android",
                "app": "diksha-survey",
                "appType": "assessment",
                "status": "active",
                "activatedAt": "2020-08-15T07:51:53.303Z"
            }
        ],
        "userProfileScreenVisitedTrack": null,
        "deleted": false,
        "_id": "5f33c3fe39a2e7766b1bef9f",
        "userId": "01c04166-a65e-4e92-a87b-a9e4194e771d",
        "externalId": "a1",
        "createdBy": "SYSTEM",
        "updatedBy": "SYSTEM",
        "updatedAt": "2020-09-07T13:24:32.170Z",
        "createdAt": "2020-08-12T10:27:10.895Z",
        "improvementProjects": [
            {
                "_id": "5f4ce55eb3b81754f08d3528",
                "name": "Test-2",
                "description": "improving school library",
                "externalId": "Test-2",
                "entityType": "school",
                "entityTypeId": "5d15a959e9185967a6d5e8a6",
                "rating": 4
            }
        ],
        "__v": 0
    }
  * }
  */

  /**
   * Update user profile.
   * @method
   * @name update
   * @param {Object} req - request data.
   * @param {String} req.params._id - user id.
   * @returns {JSON} Updated User profile data. 
   */

  update(req) {
    return new Promise(async (resolve, reject) => {

      try {

        let result = await userExtensionHelper.update(
          (req.params._id && req.params._id != "") ? req.params._id : req.userDetails.userId,
          req.body
        );

        return resolve(result);

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
