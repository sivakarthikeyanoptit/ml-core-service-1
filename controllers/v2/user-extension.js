/**
 * name : user-extensions.js
 * author : Aman Jung Karki
 * created-date : 09-Sep-2020
 * Description : All user extension v2 related information.
 */

// Dependencies

const UserExtensionV1 = require(ROOT_PATH+"/controllers/v1/user-extension");
const userExtensionHelper = require(MODULES_BASE_PATH+"/user-extension/helper");

/**
    * UserExtensionV2
    * @class
*/

module.exports = class UserExtensionV2 extends UserExtensionV1 {
  
  /**
  * @api {get} /kendra/api/v2/user-extension/getProfile/{{userId}} Get user profile
  * @apiVersion 2.0.0
  * @apiName Get user profile
  * @apiGroup User Extension
  * @apiHeader {String} X-authenticated-user-token Authenticity token
  * @apiSampleRequest /kendra/api/v2/user-extension/getProfile/e97b5582-471c-4649-8401-3cc4249359bb
  * @apiUse successBody
  * @apiUse errorBody
  * @apiParamExample {json} Response:
  * {
    "message": "User profile fetched successfully.",
    "status": 200,
    "result": {
        "_id": "5f33c3fe39a2e7766b1bef9f",
        "externalId": "a1",
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
                ]}]}}
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

        const result = await userExtensionHelper.profileWithEntityDetailsV2({
          userId: (req.params._id && req.params._id != "") ? req.params._id : req.userDetails.userId,
          status: constants.common.ACTIVE,
          isDeleted: false
        });

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
