/**
 * name : activity-logs.js
 * author : Priyanka
 * created-date : 17-Nov-2020
 * Description : All user extension related information.
 */

// Dependencies
const activityLogHelper = require(ROOT_PATH+"/module/activity-logs/helper");

/**
    * activityLogs
    * @class
*/
module.exports = class activityLogs extends Abstract {
  
  constructor() {
    super(schemas["activity-logs"]);
  }

  static get name() {
    return "activity-logs";
  }

  /**
   * @api {post} /kendra/api/v1/activity-logs/create 
   * create activity log
   * @apiVersion 1.0.0
   * @apiGroup ActivityLog
   * @apiSampleRequest /kendra/api/v1/users/create
   * @param {Object} data - data
   * @param {String} req.query.type - type of doc ex: entity, user.
   * @param {String} req.query.userId - user id.
   * @param {String} req.query.docId - doc id.
   * @apiUse successBody
   * @apiUse errorBody
   * @apiParamExample {json} Request:
   * {
    "status": 200,
    "result": {
        "remarks": "",
        "_id": "5fb3770c7e93fd062318b91c",
        "deleted": false,
        "type": "entity",
        "docId": "5fb372fc5ec02d0b0dd631d0",
        "userId": "PANJAB_MIS",
        "metaInformation": {
            "entities": [
                "5e26c2b0d007227fb039d994"
            ]
        },
        "updatedAt": "2020-11-17T07:09:00.339Z",
        "createdAt": "2020-11-17T07:09:00.339Z",
        "__v": 0
    }

  * }

  */

  /**
    * Check whether the email id provided is sys admin or not.
    * @method
    * @name create
    * @param  {Request} req request body.
    * @returns {JSON} Returns success as true or false.
   */

  create(req) {

      return new Promise(async (resolve, reject) => {

          try {
              
              let activityLogs = 
              await activityLogHelper.create(req.query.type, req.query.docId, req.query.userId, req.body);

              return resolve(activityLogs);

          } catch (error) {

              return reject({
                  status: 
                  error.status || 
                  httpStatusCode["internal_server_error"].status,

                  message: 
                  error.message || 
                  httpStatusCode["internal_server_error"].message
              })

          }


      })
  }

};
