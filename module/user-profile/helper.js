/**
 * name : userProfile/helper.js
 * author : Aman
 * Date : 10-feb-2019
 * Description : All user profile helper related information.
 */

let userManagementService = 
require(ROOT_PATH +"/generics/services/user-management");

module.exports = class UserProfileHelper {

    /**
   * Create user profile.
   * @method
   * @name create
   * @param  {requestedData}  - requested body.
   * @returns {json} Response consists of created user profile data.
   */

    static create( requestedData,token ) {
        return new Promise(async (resolve, reject) => {
            try {

                let userProfileCreationData = 
                await userManagementService.createUserProfile(
                    requestedData,
                    token
                )
                
                return resolve(userProfileCreationData);

            } catch (error) {
                return reject(error);
            }
        })
    }

    /**
   * Update user profile.
   * @method
   * @name update
   * @param  {requestedData}  - requested body.
   * @param  {userId}  - logged in user id.
   * @returns {json} Response consists of updated user profile data.
   */

    static update( requestedData,token ) {
        return new Promise(async (resolve, reject) => {
            try {
                
                let updateUserProfileData = 
                await userManagementService.updateUserProfile(
                    requestedData,
                    token
                );
                
                return resolve(updateUserProfileData);
            }
            catch (error) {
                return reject(error);
            }
        })
    }

      /**
   * Verify user profile.
   * @method
   * @name verify
   * @param  {userId}  - logged in user id.
   * @returns {json} Response consists of verified user profile data.
   */

  static verify( userId,token ) {
    return new Promise(async (resolve, reject) => {
        try {
            let verifyUserProfileData = 
            await userManagementService.verifyUserProfile(
                userId,
                token
            );
            
            return resolve(verifyUserProfileData);
        } catch (error) {
            return reject(error);
        }
    })
  }

};