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

};

