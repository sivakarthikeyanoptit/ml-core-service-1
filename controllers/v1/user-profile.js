/**
 * name : user-extensions.js
 * author : Aman Jung Karki
 * created-date : 11-Feb-2020
 * Description : All user extension related information.
 */

const userProfileHelper = require(MODULES_BASE_PATH + "/user-profile/helper.js");

/**
    * UserProfile
    * @class
*/

module.exports = class UserProfile extends Abstract {

  constructor() {
    super(schemas["user-profile"]);
  }


  static get name() {
    return "user-profile";
  }

  /**
    * @api {get} /kendra/api/v1/user-profile/getForm
    * getForm return user profile form
    * @apiVersion 1.0.0
    * @apiGroup user profile
    * @apiHeader {String} X-authenticated-user-token Authenticity token
    * @apiSampleRequest /kendra/api/v1/user-profile/getForm
    * @apiUse successBody
    * @apiUse errorBody
    * @apiParamExample {json} Response:
    * {
    "message": "User Profile  form fetched successfully ",
    "status": 200,
    "result": {
        "form": [
            {
                "label": "firstName",
                "field": "firstName",
                "value": "",
                "visible": true,
                "editable": true,
                "validation": {
                    "required": true,
                    "regex": "/^[A-Za-z]+$/"
                },
                "input": "text"
            },
            {
                "label": "lastName",
                "field": "lastName",
                "value": "",
                "visible": true,
                "editable": true,
                "validation": {
                    "required": true,
                    "regex": "/^[A-Za-z]+$/"
                },
                "input": "text"
            },
            {
                "label": "email",
                "field": "email",
                "value": "",
                "visible": true,
                "editable": true,
                "validation": {
                    "required": true,
                    "regex": "^[_A-Za-z0-9-\\+]+(\\.[_A-Za-z0-9-]+)*@[A-Za-z0-9-]+(\\.[A-Za-z0-9]+)*(\\.[A-Za-z]{2,})$"
                },
                "input": "text"
            },
            {
                "label": "phoneNumber",
                "field": "phoneNumber",
                "value": "",
                "visible": true,
                "editable": true,
                "validation": {
                    "required": true,
                    "regex": "^((+)?(d{2}[-]))?(d{10}){1}?$"
                },
                "input": "text"
            },
            {
                "label": "state",
                "field": "state",
                "value": "",
                "visible": true,
                "editable": true,
                "validation": {
                    "required": true,
                    "regex": ""
                },
                "input": "select",
                "options": [
                    {
                        "label": "",
                        "value": ""
                    }
                ]
            }
        ],
        "statesWithSubEntities": {
            "5da829874c67d63cca1bd9d0": [
                "district",
                "block",
                "cluster",
                "school"
            ]
        }
    }
  }
    */

  getForm(req) {
    return new Promise(async (resolve, reject) => {

      try {

        let userProfileForm = await userProfileHelper.getForm(
          req.userDetails,
          req.headers['appname'],
          req.headers['os']
        );
       
        resolve(userProfileForm);

      } catch (error) {

        return reject({
          status:
            error.status ||
            httpStatusCode["internal_server_error"].status,

          message:
            error.message ||
            httpStatusCode["internal_server_error"].message
        });
      }
    });
  }

   /**
    * @api {post} /kendra/api/v1/user-profile/save
    * save's the user profile data
    * @apiVersion 1.0.0
    * @apiGroup user profile
    * @apiHeader {String} X-authenticated-user-token Authenticity token
    * @apiSampleRequest /kendra/api/v1/user-profile/save
    * @apiUse successBody
    * @apiUse errorBody
    * @apiParamExample {json} Request:
    * {
    * "metaInformation":{
    * "firstName": "",
    * "lastName": "",
    * "email": "",
    * "phoneNumber": "",
    * "district":[{
    * "label":"name",
    * "value":"id"
    * }]
    * }
    * @apiParamExample {json} Response:
    * {
    "message": "User profile Saved successfully",
    "status": 200,
    "result": {
        "createdBy" : "loggedIn user id",
        "updatedBy" : null,
        "status" : "pendingVerification",
        "_id" : "",
        "deleted" : false,
        "metaInformation" : {
            "firstName" : "A",
            "lastName" : "B",
            "email" : "a@b.com",
            "phoneNumber" : "9591553529",
            "district" : [
                {
                    "label": "name",
                    "value": "id"
                }
            ]
        },
        "userId": "",
        "externalId": "",
        "submittedAt": "2020-03-17T05:45:54.456Z",
        "updatedAt": "2020-03-17T05:46:01.672Z",
        "createdAt": "2020-03-17T05:46:01.672Z",
        "__v": 0
    }
  }
}
 */

 save(req) {
  return new Promise(async (resolve, reject) => {

    try {
     
      let userProfileSave = 
      await userProfileHelper.save(
        req.body,
        req.userDetails.userId,
        req.userDetails.userName ? req.userDetails.userName : ""
      );

      resolve( userProfileSave);

    } catch (error) {

      return reject({
        status:
          error.status ||
          httpStatusCode["internal_server_error"].status,

        message:
          error.message ||
          httpStatusCode["internal_server_error"].message
      });
    }
  });
 }

};

