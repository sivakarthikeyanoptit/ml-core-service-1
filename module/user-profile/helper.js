/**
 * name : userProfile/helper.js
 * author : Aman
 * Date : 10-feb-2019
 * Description : All user profile helper related information.
 */

let userManagementService = 
require(ROOT_PATH +"/generics/services/user-management");
let entitiesHelper = require(ROOT_PATH+"/module/entities/helper");

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

  /**
   * Details user profile.
   * @method
   * @name details
   * @param  {userId} - logged in user id.
   * @param  {token} - logged in user token.
   * @returns {json} Response consists of user details data.
   */

  static details( userId,token,pageSize,pageNo ) {
    return new Promise(async (resolve, reject) => {
        try {
            
            let userProfileDetails = 
            await userManagementService.userProfileDetails(
                userId,
                token
            );
            
            let requestedData = {
                pageSize : pageSize,
                pageNo : pageNo,
                entityType : "state"
            };
            
            let stateList = await entitiesHelper.listByEntityType(requestedData);
            
            let immediateEntities = await _immediateEntities(
                _.pick(userProfileDetails.result,
                    [
                        "state",
                        "district",
                        "block",
                        "zone",
                        "cluster",
                        "taluk",
                        "hub",
                        "school"
                    ])
            );

            userProfileDetails = {
                ...userProfileDetails.result,
                ...immediateEntities,
                ...{
                    stateList : stateList.result
                }
            }

            return resolve({
                result : userProfileDetails
            });

        } catch(error) {
            return reject(error);
        }
    });
  }

};

 /**
   * All immediate entities
   * @method
   * @name _immediateEntities
   * @param {Array} entities - Array of entities.
   * @returns {Object}
   * */

function _immediateEntities(entities) {
    return new Promise(async (resolve,reject)=>{
        try {

            let immediateEntitiesData = {};

            let entityTypeList = Object.keys(entities);

            for( 
                let pointerToEntityType = 0; 
                pointerToEntityType < entityTypeList.length;
                pointerToEntityType ++
            ) {

                let entityId = entities[entityTypeList[pointerToEntityType]];
                if( entityId !== null  ) {
                    
                    let immediateEntities = 
                    await entitiesHelper.immediateEntities(
                        entities[entityTypeList[pointerToEntityType]]
                    );

                    immediateEntitiesData[immediateEntities.result.immediateEntityType+"list"] = 
                    immediateEntities.result.data;
                }
            }

            return resolve(immediateEntitiesData);
        } catch(err) {
            return reject(err);
        }
    })
}