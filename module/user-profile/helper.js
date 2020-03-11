/**
 * name : userProfile/helper.js
 * author : Aman
 * Date : 10-feb-2019
 * Description : All user profile helper related information.
 */

let userManagementService =
    require(ROOT_PATH + "/generics/services/user-management");
let entitiesHelper = require(ROOT_PATH + "/module/entities/helper");

// const USER_PROFILE_FORM_NAME = constants.common.USER_PROFILE_FORM_NAME;
// const STATE_ENTITY_TYPE = constants.common.STATE_ENTITY_TYPE;




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

    static getForm(userId,appName="",device="") {
        return new Promise(async (resolve, reject) => {
            try {

                let userProfileForm =
                    await database.models.forms.findOne({ name: constants.common.USER_PROFILE_FORM_NAME }).lean();


                    // userProfileScreenVisitedTrack

                    // console.log("userId",userId);
                    let name =  appName+"."+device;
                    let userProfileScreenVisitedTrack = {
                       
                    }
                    userProfileScreenVisitedTrack[name]=true;

                    // console.log("userProfileScreenVisitedTrack",userProfileScreenVisitedTrack);

                   let userExt = await database.models.userExtension.findOne({ userId:userId },
                    { userProfileScreenVisitedTrack: 1 });

                    // console.log("userExt",userExt);
                   if(userExt){
                    let updateData = {};
                    if(userExt.userProfileScreenVisitedTrack){
                        updateData =  userExt.userProfileScreenVisitedTrack;
                        updateData[name]=true;
                    }else{
                        updateData = userProfileScreenVisitedTrack;
                    }   

                    database.models.userExtension.findOneAndUpdate(
                        { userId:userId },{ "$set": { userProfileScreenVisitedTrack:updateData } } );
                       
                   }


                if (userProfileForm) {
                    let stateInfo = await database.models.entities.find({ entityType:  constants.common.STATE_ENTITY_TYPE },{ entityTypeId:1,_id:1,metaInformation:1  }).lean();

                    let states = [];


                    let stateListWithSubEntities = [];

                    if (stateInfo) {
                        await Promise.all(stateInfo.map(async function (state) {

                           let found =  await checkStateWithSubEntities(state.entityTypeId);

                           if(found){
                            stateListWithSubEntities.push(state._id);
                           }
                        states.push(
                                { 
                                //   externalId: state.metaInformation.externalId,
                                  label: state.metaInformation.name,
                                  value: state._id
                                 }
                            );
                        }));
                        let getUserData = await database.models.userProfile.findOne({ userId:userId }).sort({ createdAt : -1  });

                        await Promise.all(userProfileForm.value.map(async function (fields, index) {
                            if (fields.field == "state") {

                                // let imidiateEnt = await _immediateEntities(states);
                                // let immediateEntities =
                                // await entitiesHelper.immediateEntities(
                                //     states[0]._id
                                // );

                                // console.log("imidiateEnt",immediateEntities);
                                userProfileForm.value[index].options = states;
                            }
                            if(getUserData && getUserData.metaInformation){
                                if(getUserData.metaInformation[fields.field]){
                                    userProfileForm.value[index].value = getUserData.metaInformation[fields.field];
                                }
                            }
                        }));

                        let UserForm = {
                            form:userProfileForm.value,
                            stateListWithSubEntities:stateListWithSubEntities
                        }

                        return resolve(UserForm);
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

                if (userProfileData && userProfileData.status != constants.common.USER_PROFILE_PENDING_VERIFICATION_STATUS || !userProfileData) {

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
                    requestedData['status'] = constants.common.USER_PROFILE_PENDING_VERIFICATION_STATUS;
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
                    status : constants.common.USER_PROFILE_ACTIVE_STATUS,
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
                    status : constants.common.USER_PROFILE_VERIFIED_STATUS,
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


/**
  * check state has subEntities
  * @method
  * @name checkStateWithSubEntities
  * @param { string } stateId - Array of entities.
  * @returns {boolean}
  * */

function checkStateWithSubEntities(entityTypeId){
    return new Promise(async (resolve, reject) => {
        try {
      let entityTypeDoc = 
            await database.models.entityTypes.findOne({
                _id:entityTypeId
            },{ immediateChildrenEntityType:1 }).lean();
            if( entityTypeDoc && entityTypeDoc.immediateChildrenEntityType && entityTypeDoc.immediateChildrenEntityType.length > 0){
                resolve(true);
            }else{
                resolve(false);
            }
        } catch (err) {
            return reject(err);
        }
    });
}



