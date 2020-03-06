/**
 * name : userProfile/helper.js
 * author : Aman
 * Date : 10-feb-2019
 * Description : All user profile helper related information.
 */

let userManagementService =
    require(ROOT_PATH + "/generics/services/user-management");
let entitiesHelper = require(ROOT_PATH + "/module/entities/helper");
const USER_PROFILE_PENDING_VERIFICATION_STATUS = gen.utils.checkIfEnvDataExistsOrNot("USER_PROFILE_PENDING_VERIFICATION_STATUS");
const USER_PROFILE_ACTIVE_STATUS = gen.utils.checkIfEnvDataExistsOrNot("USER_PROFILE_ACTIVE_STATUS");
const USER_PROFILE_VERIFIED_STATUS = gen.utils.checkIfEnvDataExistsOrNot("USER_PROFILE_VERIFIED_STATUS");

module.exports = class UserProfileHelper {

    /**
   * Create user profile.
   * @method
   * @name create
   * @param  {requestedData}  - requested body.
   * @returns {json} Response consists of created user profile data.
   */

    static create(requestedData, token) {
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

    static update(requestedData, token) {
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

    static verify(userId, token) {
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

    static details(userId, token, pageSize, pageNo) {
        return new Promise(async (resolve, reject) => {
            try {

                let userProfileDetails =
                    await userManagementService.userProfileDetails(
                        userId,
                        token
                    );

                let requestedData = {
                    pageSize: pageSize,
                    pageNo: pageNo,
                    entityType: "state"
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
                        stateList: stateList.result
                    }
                }

                return resolve({
                    result: userProfileDetails
                });

            } catch (error) {
                return reject(error);
            }
        });
    }

    /**
    * Details user profile.
    * @method
    * @name getForm
    * @returns {json} Response consists of user details data.
    */

    static getForm() {
        return new Promise(async (resolve, reject) => {
            try {

                let userProfileForm =
                    await database.models.forms.findOne({ name: "userProfileForm" }).lean();

                if (userProfileForm) {
                    let stateInfo = await database.models.entities.find({ entityType: "state" }).lean();

                    let states = [];

                    if (stateInfo) {
                        await Promise.all(stateInfo.map(async function (state) {
                            states.push(
                                { 
                                  externalId: state.metaInformation.externalId,
                                  name: state.metaInformation.name,
                                  _id: state._id
                                 }
                            );
                        }));


                        await Promise.all(userProfileForm.value.map(async function (fields, index) {
                            if (fields.field == "state") {
                                userProfileForm.value[index].options = states;
                            }
                        }));
                        return resolve(userProfileForm);
                    } else {
                        throw "Could not get sate list";
                    }
                } else {
                    throw "Could not get userProfileForm";
                }
            } catch (error) {
                return reject(error);
            }
        });
    }


    /**
* save user profile data.
* @method
* @name save
* @returns {json} Response consists of user details data.
*/

    static save(requestedData, userId) {
        return new Promise(async (resolve, reject) => {
            try {
                let userProfileData = await database.models.userProfile.findOne({
                    userId: userId,
                    isDeleted:false
                }, {
                    status:1,
                    _id: 1
                }).sort({ createdAt:-1 }).lean();
                // deleteUserId
                // if( userProfileData ) {
                // }

                // console.log("userProfileData",userProfileData.status);

                if (userProfileData && userProfileData.status != USER_PROFILE_PENDING_VERIFICATION_STATUS || !userProfileData) {

                    // console.log("userProfileData", userProfileData);

                    let userExtensionDocument =
                        await database.models.userExtension.findOne(
                            {
                                userId: userId
                            }, {
                            externalId: 1
                        }
                        ).lean();

                    if (!userExtensionDocument) {
                        throw {
                            message : "User Extenstion not found for userId "+userId
                        };
                    }
                    requestedData['status'] = USER_PROFILE_PENDING_VERIFICATION_STATUS;
                    requestedData['userId'] = userId;
                    requestedData["externalId"] = userExtensionDocument.externalId;

                    // console.log("requestedData",requestedData);

                    let userProfileCreation = await database.models.userProfile.create(
                        requestedData
                    );

                    return resolve(userProfileCreation);

                }else{

                    return resolve({
                        success:false,
                        message:"User profile is under Pending for verification"
                    });
                }

            } catch (error) {
                return reject(error);
            }
        });
    }


    /**
    * pending Profile Update users List.
    * @method
    * @name pendingProfileUsers
    * @returns {json} Response consists of user details data.
    */

   static pendingProfileUsers() {
    return new Promise(async (resolve, reject) => {
        try {

            let userProfileDocuments = 
                await database.models.userProfile.find({
                    status : USER_PROFILE_ACTIVE_STATUS,
                    isDeleted :false
                }).lean();

                console.log("userProfileDocuments ",userProfileDocuments);
            // if(userProfileDocuments  && userProfileDocuments.length > 0){
              return resolve(userProfileDocuments);
            // }else{
            //     throw "No pednig for update profile users"
            // }
        } catch (error) {
            return reject(error);
        }
    });
}

  /**
    * verified User Profile List.
    * @method
    * @name verifiedUserProfile
    * @returns {json} Response consists of user details data.
    */

   static verifiedUserProfile() {
    return new Promise(async (resolve, reject) => {
        try {

            let userProfileDocuments = 
                await database.models.userProfile.find({
                    status : USER_PROFILE_VERIFIED_STATUS,
                    isDeleted :false,
                    sentPushNotifications:false,
                    verified:true, 
                }).lean();
             
              return resolve(userProfileDocuments);
           
        } catch (error) {
            return reject(error);
        }
    });
}


  /**
    * update sentPushNotifications as true
    * @method
    * @name updatePushNotificationSent
    * @returns {json} Response updated user details data.
    */
static updatePushNotificationSent(userId){
    return new Promise(async (resolve, reject) => {
        try {

            let userProfileDocuments = 
                await database.models.userProfile.update({
                    userId:userId,
                    sentPushNotifications:false,
                    verified:true, 
                },{ sentPushNotifications:true }).lean();
             
              return resolve(userProfileDocuments);
           
        } catch (error) {
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
    return new Promise(async (resolve, reject) => {
        try {

            let immediateEntitiesData = {};

            let entityTypeList = Object.keys(entities);

            for (
                let pointerToEntityType = 0;
                pointerToEntityType < entityTypeList.length;
                pointerToEntityType++
            ) {

                let entityId = entities[entityTypeList[pointerToEntityType]];
                if (entityId !== null) {

                    let immediateEntities =
                        await entitiesHelper.immediateEntities(
                            entities[entityTypeList[pointerToEntityType]]
                        );

                    immediateEntitiesData[immediateEntities.result.immediateEntityType + "List"] =
                        immediateEntities.result.data;
                }
            }

            return resolve(immediateEntitiesData);
        } catch (err) {
            return reject(err);
        }
    })
}



