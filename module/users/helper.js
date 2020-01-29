/**
 * name : users/helper.js
 * author : Aman Jung Karki
 * created-date : 03-Dc-2019
 * Description : All User related information including sys_admin.
 */


/**
    * UsersHelper
    * @class
*/

module.exports = class UsersHelper {

     /**
      * create user.
      * @method
      * @name create
      * @param {Object} userData user data.
      * @param {String} userData.email email id of the user.
      * @param {String} userData.userName  name of the user.
      * @param {String} userData.role  role of the user.
      * @returns {Promise} returns a promise.
     */

    static create(userData) {
        return new Promise(async (resolve, reject) => {
            try {

                let checkUserExistence = 
                await database.models.users.findOne({
                    email : userData.email
                }).lean();

                if(checkUserExistence) {
                    throw {
                        message : "User already exists"
                    }
                }

                let createUser = 
                await database.models.users.create(userData)

                let response = {
                    success : true,
                    message : "User created successfully"
                }

                if(!createUser) {
                    response["success"] = false;
                    response["message"] = "User could not be created";
                }

                return resolve(response);
                
            } catch (error) {
                return reject(error);
            }
        })
    }
   
    /**
      * check if the provided email is sys admin or not.
      * @method
      * @name isSystemAdmin
      * @param {String} userEmail user email address.
      * @returns {Promise} returns a promise.
     */

    static isSystemAdmin(userEmail) {
        return new Promise(async (resolve, reject) => {
            try {

                let userDocument = 
                await database.models.users.findOne({
                    email : userEmail,
                    role : "SYS_ADMIN"
                }).lean();

                let response = {
                    success : true
                }

                if(!userDocument) {
                    response["success"] = false;
                }

                return resolve(response);
                
            } catch (error) {
                return reject(error);
            }
        })
    }

};