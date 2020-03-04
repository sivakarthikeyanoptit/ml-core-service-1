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

module.exports = class UserProfile {
  
  constructor() {}

  static get name() {
    return "user-profile";
  }

   /**
     * @api {post} /kendra/api/v1/user-profile/create 
     * Create user profile.
     * @apiVersion 1.0.0
     * @apiGroup user profile
     * @apiHeader {String} X-authenticated-user-token Authenticity token
     * @apiSampleRequest /kendra/api/v1/user-profile/create
     * @apiUse successBody
     * @apiUse errorBody
     * @apiParamExample {json} Response:
     * {
     * "firstName" : "Abc",
     * "lastName" : null,
        "emailId" : null,
        "phoneNumber" : null,
        "state" : "abc",
        "district" : null,
        "block" : null,
        "zone" : null,
        "cluster" : null,
        "taluk" : null,
        "hub" : null,
        "school" : null,
        "status" : "active",
        "isDeleted" : false,
        "verified" : false,
        "updatedBy" : null,
        "updatedAt" : null,
        "userId" : "abc",
        "externalId" : null,
        "createdBy" : "abc"
      }
  */

  /**
   * Create user profile.
   * @method
   * @name create
   * @param  {Request}  req  request body.
   * @returns {json} Created user profile information.
  */

  create(req) {
    return new Promise(async (resolve, reject) => {

      try {

        let createUserProfile = await userProfileHelper.create(
          req.body,
          req.userDetails.userToken
        );

        return resolve(createUserProfile);

      } catch(error) {
        
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
     * @api {post} /kendra/api/v1/user-profile/update 
     * Updated user profile information.
     * @apiVersion 1.0.0
     * @apiGroup user profile
     * @apiHeader {String} X-authenticated-user-token Authenticity token
     * @apiSampleRequest /kendra/api/v1/user-profile/update
     * @apiUse successBody
     * @apiUse errorBody
     * @apiParamExample {json} Response:
     * {
     * "firstName" : "Abc"
      }
  */

    /**
   * Update user profile information.
   * @method
   * @name update
   * @param  {Request}  req  request body.
   * @returns {json} Updated user profile information.
  */

  update(req) {
    return new Promise(async (resolve, reject) => {

      try {

        let updateUserProfile = await userProfileHelper.update(
          req.body,
          req.userDetails.userToken
        );

        return resolve(updateUserProfile);

      } catch(error) {
        
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
   * Verify user profile information based on userId.
   * @method
   * @name verify
   * @param  {Request} req request body.
   * @returns {json} Verify user profile information.
  */

   /**
     * @api {post} /kendra/api/v1/user-profile/verify/:userId 
     * Verify user profile information.
     * @apiVersion 1.0.0
     * @apiGroup user profile
     * @apiHeader {String} X-authenticated-user-token Authenticity token
     * @apiSampleRequest /kendra/api/v1/user-profile/verify/abc
     * @apiUse successBody
     * @apiUse errorBody
  */

  verify(req) {
    return new Promise(async (resolve, reject) => {

      try {

        let verifyUserProfile = await userProfileHelper.verify(
          req.params._id,
          req.userDetails.userToken
        );

        return resolve(verifyUserProfile);

      } catch(error) {
        
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
   * User profile information details.
   * @method
   * @name details
   * @param  {Request} req request body.
   * @returns {json} details user profile information.
  */

   /**
     * @api {post} /kendra/api/v1/user-profile/details
     * details user profile information.
     * @apiVersion 1.0.0
     * @apiGroup user profile
     * @apiHeader {String} X-authenticated-user-token Authenticity token
     * @apiSampleRequest /kendra/api/v1/user-profile/details
     * @apiUse successBody
     * @apiUse errorBody
  */

 details(req) {
  return new Promise(async (resolve, reject) => {

    try {

      let userProfileDocument = await userProfileHelper.details(
        req.params._id ? req.params._id : req.userDetails.userId,
        req.userDetails.userToken,
        req.pageSize,
        req.pageNo
      );

      return resolve(userProfileDocument);

    } catch(error) {
      
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