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
        return "user";
    }

    /**
     * @api {post} /kendra/api/v1/users/create 
     * create user
     * @apiVersion 1.0.0
     * @apiGroup User
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
     * @apiGroup User
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
     * @api {get} /kendra/api/v1/users/entitiesMappingForm/:stateId?roleId=:roleId 
     * Entities mapping form.
     * @apiVersion 1.0.0
     * @apiGroup User
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

};

