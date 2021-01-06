/**
 * name : user.js
 * author : Aman Jung Karki
 * created-date : 19-Dec-2019
 * Description : All user related information.
 */


/**
 * dependencies
 */

const usersHelper = require(MODULES_BASE_PATH + "/users/helper.js");

/**
    * User
    * @class
*/

module.exports = class Users extends Abstract {

    constructor() {
        super(schemas["users"]);
    }

    /**
     * @apiDefine errorBody
     * @apiError {String} status 4XX,5XX
     * @apiError {String} message Error
     */

    /**
     * @apiDefine successBody
     *  @apiSuccess {String} status 200
     * @apiSuccess {String} result Data
     */


    static get name() {
        return "users";
    }

    /**
     * @api {post} /kendra/api/v1/users/create 
     * create user
     * @apiVersion 1.0.0
     * @apiGroup Users
     * @apiHeader {String} X-authenticated-user-token Authenticity token
     * @apiSampleRequest /kendra/api/v1/users/create
     * @apiUse successBody
     * @apiUse errorBody
     * @apiParamExample {json} Request:
     * {
      "userName": "a",
      "email": "a@a.com",
      "role": "SYS_ADMIN",
      "createdBy": "SYSTEM",
    }

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

                let systemAdminDocument = 
                await usersHelper.create(req.body);

                return resolve(systemAdminDocument);

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

    /**
     * @api {post} /kendra/api/v1/users/isSystemAdmin 
     * check if user is system admin or not.
     * @apiVersion 1.0.0
     * @apiGroup Users
     * @apiHeader {String} X-authenticated-user-token Authenticity token
     * @apiSampleRequest /kendra/api/v1/users/isSystemAdmin
     * @apiUse successBody
     * @apiUse errorBody
     * @apiParamExample {json} Request:
     * {
     * "email":"a@gmail.com" 
      }
    */

    /**
      * Check whether the email id provided is sys admin or not.
      * @method
      * @name isSystemAdmin
      * @param  {Request} req request body.
      * @returns {JSON} Returns success as true or false.
     */

    isSystemAdmin(req) {

        return new Promise(async (resolve, reject) => {

            try {

                let systemAdminDocument = 
                await usersHelper.isSystemAdmin(req.body.email);

                return resolve(systemAdminDocument);

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

    /**
     * @api {get} /kendra/api/v1/users/privatePrograms/:userId List of user private programs
     * @apiVersion 2.0.0
     * @apiName List of user private programs
     * @apiGroup Programs
     * @apiHeader {String} X-authenticated-user-token Authenticity token
     * @apiSampleRequest /kendra/api/v1/users/privatePrograms/e97b5582-471c-4649-8401-3cc4249359bb
     * @apiParamExample {json} Response:
     * {
     "message": "List of private programs",
     "status": 200,
     "result": [
        {
            "_id": "5edf0d14c57dab7f639f3e0d",
            "externalId": "EF-DCPCR-2018-001-TEMPLATE-2020-06-09 09:46:20",
            "name": "My program",
            "description": "DCPCR Assessment Framework 2018"
        }
     ]}
     * @apiUse successBody
     * @apiUse errorBody
     */

    /**
    * Private Programs .
    * @method
    * @name privatePrograms
    * @param {Object} req -request Data.
    * @param {String} req.params._id - user id
    * @returns {JSON} - List of programs created by user.
    */

    privatePrograms(req) {
        return new Promise(async (resolve, reject) => {
            try {
                
                let programsData = 
                await usersHelper.privatePrograms(
                    (req.params._id && req.params._id != "") ? 
                    req.params._id : 
                    req.userDetails.userId
                );
                
                return resolve(programsData);
            } catch (error) {
                return reject({
                    status: error.status || httpStatusCode.internal_server_error.status,
                    message: error.message || httpStatusCode.internal_server_error.message,
                    errorObject: error
                });
            }
        });
    }

     /**
     * @api {post} /kendra/api/v1/users/createProgram/:userId?programId=:programId Users created program and solution.
     * @apiVersion 2.0.0
     * @apiName Users created program and solution.
     * @apiGroup Users
     * @apiHeader {String} X-authenticated-user-token Authenticity token
     * @apiSampleRequest /kendra/api/v1/users/createProgram/e97b5582-471c-4649-8401-3cc4249359bb?programId=5f44b08cdbe917732246149f
     * @apiParamExample {json} Request-Body:
     * {
     * "programName" : "Test project program",
     * "solutionName" : "Test project solution"
     }
     * @apiUse successBody
     * @apiUse errorBody
     * @apiParamExample {json} Response:
     * {
    "status": 200,
    "result": {
        "program": {
            "resourceType": [
                "Program"
            ],
            "language": [
                "English"
            ],
            "keywords": [
                "keywords 1",
                "keywords 2"
            ],
            "concepts": [],
            "createdFor": [],
            "components": [],
            "isAPrivateProgram": true,
            "rootOrganisations": [],
            "_id": "5f44b08cdbe917732246149f",
            "deleted": false,
            "externalId": "Test project program-1598337164794",
            "name": "Test project program",
            "description": "Test project program",
            "status": "active",
            "imageCompression": {
                "quality": 10
            },
            "updatedAt": "2020-08-25T06:32:44.796Z",
            "createdAt": "2020-08-25T06:32:44.796Z",
            "__v": 0
        },
        "solution": {
            "resourceType": [],
            "language": [],
            "keywords": [],
            "concepts": [],
            "createdFor": [],
            "themes": [],
            "flattenedThemes": [],
            "entities": [],
            "registry": [],
            "isRubricDriven": false,
            "enableQuestionReadOut": false,
            "captureGpsLocationAtQuestionLevel": false,
            "isAPrivateProgram": false,
            "allowMultipleAssessemts": false,
            "isDeleted": false,
            "rootOrganisations": [],
            "_id": "5f44b08cdbe91773224614a0",
            "deleted": false,
            "name": "Test project solution",
            "externalId": "Test project solution-1598337164794",
            "description": "Test project solution",
            "programId": "5f44b08cdbe917732246149f",
            "programExternalId": "Test project program-1598337164794",
            "programName": "Test project program",
            "programDescription": "Test project program",
            "updatedAt": "2020-08-25T06:32:44.801Z",
            "createdAt": "2020-08-25T06:32:44.801Z",
            "__v": 0
        }
    }}
     */

    /**
    * Create user program and solution.
    * @method
    * @name createProgramAndSolution
    * @param {Object} req -request Data.
    * @param {String} req.params._id - user id
    * @returns {JSON} - Created user program and solution.
    */

   createProgramAndSolution(req) {
    return new Promise(async (resolve, reject) => {

        try {

            let createdProgramAndSolution = 
            await usersHelper.createProgramAndSolution(
                (req.params._id && req.params._id != "") ? 
                req.params._id : 
                req.userDetails.id,
                req.body,
                req.userDetails.userToken
            );

            return resolve(createdProgramAndSolution);

        } catch (error) {
            return reject({
                status: error.status || httpStatusCode.internal_server_error.status,
                message: error.message || httpStatusCode.internal_server_error.message,
                errorObject: error
            });
        }

    });
   }
      /**
     * @api {get} /kendra/api/v1/users/entitiesMappingForm/:stateId?roleId=:roleId 
     * Entities mapping form.
     * @apiVersion 1.0.0
     * @apiGroup Users
     * @apiHeader {String} X-authenticated-user-token Authenticity token
     * @apiSampleRequest /kendra/api/v1/users/entitiesMappingForm/5da829874c67d63cca1bd9d0?roleId=5d6e521066a9a45df3aa891e
     * @apiUse successBody
     * @apiUse errorBody
     * @apiParamExample {json} Response:
     * {
     "message": "Entities mapping form fetched successfully",
     "status": 200,
     "result": [
        {
            "field": "district",
            "label": "Select District",
            "value": "",
            "visible": true,
            "editable": true,
            "input": "text",
            "validation": {
                "required": false
            }
        },
        {
            "field": "block",
            "label": "Select Block",
            "value": "",
            "visible": true,
            "editable": true,
            "input": "text",
            "validation": {
                "required": true
            }
        }]}
    */

    /**
      * Lists of entities mapping form
      * @method
      * @name entitiesMappingForm
      * @param  {Request} req request body.
      * @returns {JSON} List of entiites mapping form.
     */

    entitiesMappingForm(req) {

        return new Promise(async (resolve, reject) => {

            try {

                const entitiesMappingData = 
                await usersHelper.entitiesMappingForm(
                    req.params._id,
                    req.query.roleId
                );

                resolve(entitiesMappingData);

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

     /**
     * @api {get} /kendra/api/v1/users/getUserOrganisationsAndRootOrganisations
     * Get organisation and root organisation
     * @apiVersion 1.0.0
     * @apiGroup Users
     * @apiHeader {String} X-authenticated-user-token Authenticity token
     * @apiSampleRequest /kendra/api/v1/users/getUserOrganisationsAndRootOrganisations
     * @apiUse successBody
     * @apiUse errorBody
     * @apiParamExample {json} Response:
     * {
    "message": "User organisations fetched successfully",
    "status": 200,
    "result": {
        "createdFor": [
            "01305447637218918413"
        ],
        "rootOrganisations": [
            "01305447637218918413"
        ]
    }
    }
    */

    /**
      * Organisations and root organisations.
      * @method
      * @name getUserOrganisationsAndRootOrganisations
      * @param  {Request} req request body.
      * @returns {JSON} Organisations and root organisations of user.
     */

    getUserOrganisationsAndRootOrganisations(req) {

        return new Promise(async (resolve, reject) => {

            try {

                const userOrganisations = 
                await usersHelper.getUserOrganisationsAndRootOrganisations(
                    (req.params._id && req.params._id != "") ? 
                    req.params._id : 
                    req.userDetails.id,
                    req.userDetails.userToken
                );

                resolve(userOrganisations);

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


  /**
  * @api {get} /kendra/api/v1/users/search
  * @apiVersion 1.0.0
  * @apiName User Search
  * @apiGroup Users
  * @apiHeader {String} internal-access-token Internal access token
  * @apiHeader {String} X-authenticated-user-token Authenticity token
  * @apiSampleRequest /kendra/api/v1/users/search?search=a1
  * @apiParamExample {json} Response:
  * {
  *   "userName":"a1"
  * }
  * 
  * @apiUse successBody
  * @apiUse errorBody
  * @apiParamExample {json} Response:
  * {
    "message": "User profile fetched successfully.",
    "status": 200,
    "result": {
        "data": [
            {
                "lastName": "Shikhshlokam",
                "maskedPhone": "******0005",
                "rootOrgName": "SLDEV",
                "roles": [
                    "PUBLIC"
                ],
                "channel": "SLDEV",
                "updatedDate": null,
                "prevUsedPhone": "",
                "stateValidated": false,
                "isDeleted": false,
                "organisations": [
                    {
                        "updatedBy": null,
                        "organisationId": "01305447637218918413",
                        "orgName": "SLDEV",
                        "addedByName": null,
                        "addedBy": null,
                        "roles": [
                            "PUBLIC"
                        ],
                        "approvedBy": null,
                        "updatedDate": null,
                        "userId": "01c04166-a65e-4e92-a87b-a9e4194e771d",
                        "approvaldate": null,
                        "isDeleted": false,
                        "parentOrgId": null,
                        "hashTagId": "01305447637218918413",
                        "isRejected": null,
                        "position": null,
                        "id": "0130661229826457602",
                        "orgjoindate": "2020-07-17 11:18:57:674+0000",
                        "isApproved": null,
                        "orgLeftDate": null
                    }
                ],
                "flagsValue": 3,
                "maskedEmail": "a1@shikshalokam.dev",
                "id": "01c04166-a65e-4e92-a87b-a9e4194e771d",
                "tempPassword": null,
                "recoveryEmail": "",
                "email": "a1@shikshalokam.dev",
                "identifier": "01c04166-a65e-4e92-a87b-a9e4194e771d",
                "thumbnail": null,
                "updatedBy": null,
                "profileSummary": null,
                "phoneVerified": true,
                "locationIds": [],
                "registryId": null,
                "recoveryPhone": "",
                "userName": "a1",
                "rootOrgId": "01305447637218918413",
                "prevUsedEmail": "",
                "firstName": "A1",
                "lastLoginTime": null,
                "emailVerified": true,
                "tncAcceptedOn": "2020-11-20T05:49:25.776Z",
                "framework": {},
                "createdDate": "2020-07-17 11:18:57:553+0000",
                "phone": "******0005",
                "createdBy": "47ab2766-7595-4867-bbe3-7c23dc5e4552",
                "currentLoginTime": null,
                "userType": "OTHER",
                "tncAcceptedVersion": "v1",
                "status": 1
            }
        ]
    }
  }
  **/

  /**
  * Get users search.
  * @method
  * @name searchUsers
  * @param  {req}  - requested data.
  * @returns {json} Response consists of user details
  */

   search(req) {
    return new Promise(async (resolve, reject) => {
      try {

       
        let usersList = await usersHelper.search(
            req.query.search,
            req.userDetails.userToken
          );

        return resolve(usersList);

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
    });
  }


/**
     * @api {post} /kendra/api/v1/users/programs?page=:page&limit=:limit&search=:search 
     * Program List
     * @apiVersion 1.0.0
     * @apiGroup Users
     * @apiHeader {String} X-authenticated-user-token Authenticity token
     * @apiSampleRequest /kendra/api/v1/users/programs?page=:page&limit=:limit&search=:search 
     * @apiUse successBody
     * @apiUse errorBody
     * @apiParamExample {json} Request:
     * {
        "role" : "HM",
        "state" : "5c0bbab881bdbe330655da7f",
        "block" : "5c0bbab881bdbe330655da7f",
        "cluster" : "5c0bbab881bdbe330655da7f",
        "school" : "5c0bbab881bdbe330655da7f"
      }
      * @apiParamExample {json} Response:
      * {
         "status" : 200,
         "message" : "Users programs fetched successfully",
         "result" : {
              "description" : "Programs description",
              "data" : 
              [{
                "_id" : "5b98d7b6d4f87f317ff615ee",
                "externalId" : "PROGID01",
                "name" : "DCPCR School Development",
                "solutions" :  4
              }],
            "count" : 1
          }
      }

    */

    /**
      * Get program list
      * @method
      * @name programs
      * @param  {Request} req request body.
      * @param {String} req.pageNo - pageNo
      * @param {String} req.pageSize - pageSize
      * @param {String} req.searchText - searchText
      * @returns {JSON} Returns success as true or false.
     */

    programs(req) {
      return new Promise(async (resolve, reject) => {

        try {
          
          let programs = 
          await usersHelper.programs( 
              req.body, 
              req.userDetails.userToken, 
              req.pageNo,
              req.pageSize,
              req.searchText
          );
         
          return resolve(programs);

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

