/**
 * name : userProfile/helper.js
 * author : Aman
 * Date : 10-feb-2019
 * Description : All user profile helper related information.
 */

let userManagementService =
    require(ROOT_PATH + "/generics/services/user-management");
let entitiesHelper = require(ROOT_PATH + "/module/entities/helper");


let shikshlokamhelper =
    require(ROOT_PATH + "/generics/helpers/shikshalokam");

const sunBirdUserName = gen.utils.checkIfEnvDataExistsOrNot("SUNBIRD_PUBLISHER_USERNAME");
const sunBirdPassword = gen.utils.checkIfEnvDataExistsOrNot("SUNBIRD_PUBLISHER_PASSWORD");



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

    static getForm(loggedInUser, appName = "", device = "") {
        return new Promise(async (resolve, reject) => {
            try {

                let userProfileForm =
                    await database.models.forms.findOne({ name: constants.common.USER_PROFILE_FORM_NAME }).lean();

                let name = appName + "." + device;
                let userProfileScreenVisitedTrack = {}
                userProfileScreenVisitedTrack[name] = true;

                let userExt = await database.models.userExtension.findOne({ userId: loggedInUser.userId },
                    { userProfileScreenVisitedTrack: 1 });

                if (userExt) {
                    let updateData = {};
                    if (userExt.userProfileScreenVisitedTrack) {
                        updateData = userExt.userProfileScreenVisitedTrack;
                        updateData[name] = true;
                    } else {
                        updateData = userProfileScreenVisitedTrack;
                    }
                    database.models.userExtension.findOneAndUpdate(
                        { userId: loggedInUser.userId }, { "$set": { userProfileScreenVisitedTrack: updateData } });
                }


                if (userProfileForm) {
                    let stateInfo = await database.models.entities.find({ entityType: constants.common.STATE_ENTITY_TYPE }, 
                        { entityTypeId: 1, _id: 1, metaInformation: 1, groups: 1, childHierarchyPath: 1 }).lean();
                    let states = [];
                    let stateListWithSubEntities = [];
                    let stateInfoWithSub = {};

                    // console.log("stateInfo",stateInfo);
                    if (stateInfo) {
                        await Promise.all(stateInfo.map(async function (state) {
                            if (state.groups) {
                                let found = await checkStateWithSubEntities(state.groups, state.entityTypeId);
                                if (found && state.groups) {
                                    stateInfoWithSub[state._id] = state.childHierarchyPath;
                                }
                            }
                            states.push({
                                label: state.metaInformation.name,
                                value: state._id
                            });
                        }));

                        stateListWithSubEntities.push(stateInfoWithSub);
                        let getUserData = await database.models.userProfile.findOne({ userId: loggedInUser.userId }, 
                            { metaInformation: 1, _id: 1 }).sort({ createdAt: -1 });

                        if (!getUserData) {
                            let profileInfo = await createUserProfile(loggedInUser);
                            getUserData = profileInfo;
                        }

                        await Promise.all(userProfileForm.value.map(async function (fields, index) {
                            if (fields.field == "state") {
                                userProfileForm.value[index].options = states;
                            }
                            userProfileForm.value[index]['placeholder'] = getUserData.metaInformation[fields.field];
                            if (getUserData && getUserData.metaInformation) {
                                if (getUserData.metaInformation[fields.field]) {
                                    userProfileForm.value[index].value = getUserData.metaInformation[fields.field];
                                }
                            }
                        }));

                        let UserForm = {
                            form: userProfileForm.value,
                            stateListWithSubEntities: stateListWithSubEntities
                        }

                        return resolve({ result:UserForm, message:constants.apiResponses.FORM_FETCH });
                    } else {
                        return reject({  message:constants.apiResponses.STATE_LIST_NOT_FOUND });
                    }
                } else {
                    return reject({  message:constants.apiResponses.COULD_NOT_GET_FORM });
                   
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
                    deleted: false
                }, {
                    status: 1,
                    _id: 1
                }).sort({ createdAt: -1 }).lean();

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
                            message: "User Extenstion not found for userId " + userId
                        };
                    }
                    if (!userProfileData) {
                        // await
                    }
                    requestedData['userId'] = userId;
                    requestedData["createdBy"] = userId;
                    requestedData["externalId"] = userExtensionDocument.externalId;
                    requestedData['status'] = constants.common.USER_PROFILE_PENDING_VERIFICATION_STATUS;
                    requestedData['submittedAt'] = new Date();
                   
                    let userProfileCreation = await database.models.userProfile.create(
                        requestedData
                    );
                    return resolve({ result: userProfileCreation,message:constants.apiResponses.PROFILE_SAVED });

                } else {

                    return resolve({
                        success: false,
                        message: constants.apiResponses.PROFILE_UNDER_PENDING_VERIFICATION
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
                        status: constants.common.USER_PROFILE_ACTIVE_STATUS,
                        isDeleted: false
                    }).lean();

                console.log("userProfileDocuments ", userProfileDocuments);
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
                        status: constants.common.USER_PROFILE_VERIFIED_STATUS,
                        isDeleted: false,
                        sentPushNotifications: false,
                        verified: true,
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
    static updatePushNotificationSent(userId) {
        return new Promise(async (resolve, reject) => {
            try {

                let userProfileDocuments =
                    await database.models.userProfile.update({
                        userId: userId,
                        sentPushNotifications: false,
                        verified: true,
                    }, { sentPushNotifications: true }).lean();

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

function checkStateWithSubEntities(groups, entityTypeId) {
    return new Promise(async (resolve, reject) => {
        try {

            // console.log("groups",groups);

            let entityTypeList = Object.keys(groups);
            // console.log("groups", entityTypeList);
            let entityTypeDoc =
                await database.models.entityTypes.findOne({
                    _id: entityTypeId
                }, { immediateChildrenEntityType: 1 }).lean();
            if (entityTypeDoc && entityTypeDoc.immediateChildrenEntityType && entityTypeDoc.immediateChildrenEntityType.length > 0) {

                Promise.all(entityTypeList.map(async function (types) {
                    // console.log(entityTypeDoc.immediateChildrenEntityType,"types", types);
                    if (entityTypeDoc.immediateChildrenEntityType.includes(types)) {
                        resolve(true);
                    }
                }));
                resolve(false)
            } else {
                resolve(false);
            }
        } catch (err) {
            return reject(err);
        }
    });
}

/**
  * to create UserProfile entry
  * @method
  * @name createUserProfile
  * @param { string } userId - user keyclock id.
  * @returns {object}
  * */

function createUserProfile(loggedInUser) {
    return new Promise(async (resolve, reject) => {
        try {
            let userProfile = {
                "userId": loggedInUser.userId,
                metaInformation: {
                },
                "status": constants.common.USER_PROFILE_ACTIVE_STATUS,
                "isDeleted": false,
                "verified": false,
                "updatedBy": false,
                
            }
        
            let state = {};
            let cluster = [];
            let block = [];
            let district = [];
            let taluk = [];
            let zone = [];
            let school = [];
            let hub = [];

            let userExtensionDoc = await database.models.userExtension.findOne({ userId: loggedInUser.userId }, 
                { roles: 1 });
           if (userExtensionDoc && userExtensionDoc.roles) {
                await Promise.all(userExtensionDoc.roles.map(async function (rolesInfo) {
                    let entityDoc = await database.models.entities.findOne({ _id: rolesInfo.entities[0] },
                         { entityType: 1, _id: 1 });
                    if (entityDoc) {

                        let label = "groups." + entityDoc.entityType
                        let query = {}

                       
                        query = {
                            entityType: { $ne: entityDoc.entityType },
                        }
                        query["groups." + entityDoc.entityType] = entityDoc._id;

                        let entityDocs = await database.models.entities.find(query, 
                            { entityType: 1, metaInformation: 1 }).lean();

                        if (entityDocs) {
                            await Promise.all(entityDocs.map(async function (entityDocsInfo) {
                                if (entityDocsInfo && entityDocsInfo.entityType && entityDocsInfo.metaInformation) {
                                    obj = {
                                        label:entityDocsInfo.metaInformation.name,
                                        value:entityDocsInfo._id,
                                        externalId: entityDocsInfo.metaInformation.externalId,
                                    }

                                    // obj[entityDocsInfo.metaInformation.name]=entityDocsInfo._id;

                                   
                                 
                                    
                                    if(obj && obj.label){
                                    if (entityDocsInfo.entityType == "state") {
                                        state = obj;
                                        userProfile.metaInformation.state = state;
                                    } else if (entityDocsInfo.entityType == "hub") {
                                        hub.push(obj);
                                        userProfile.metaInformation.hub = hub;
                                   
                                    } else if (entityDocsInfo.entityType == "taluk") {
                                        taluk.push(obj);
                                        userProfile.metaInformation.taluk = taluk;
                                    
                                    } else if (entityDocsInfo.entityType == "district") {
                                        district.push(obj);
                                        userProfile.metaInformation.district = district;
                                    
                                    } else if (entityDocsInfo.entityType == "school") {
                                        school.push(obj);
                                        userProfile.metaInformation.school = school;

                                    } else if (entityDocsInfo.entityType == "zone") {
                                        zone.push(obj);
                                        userProfile.metaInformation.zone = zone;
                                    
                                    } else if (entityDocsInfo.entityType == "block") {
                                        block.push(obj);
                                        userProfile.metaInformation.block = block;
                                       
                                    } else if (entityDocsInfo.entityType == "cluster") {
                                        cluster.push(obj);
                                        userProfile.metaInformation.cluster = cluster;
                                    }
                                }
                                }
                            }));
                        }
                    }
                }));
            }

            userProfile.metaInformation['firstName'] = loggedInUser.firstName;
            userProfile.metaInformation['lastName'] = loggedInUser.lastName;
            userProfile.metaInformation['email'] = loggedInUser.email;
            userProfile.metaInformation['phoneNumber'] = loggedInUser.phone;
            userProfile['createdBy'] = loggedInUser.userId;
            userProfile['externalId']=loggedInUser.userName;

            let userProfileDoc = await database.models.userProfile.create(userProfile);

            resolve(userProfileDoc);
        } catch (err) {
            return reject(err);
        }
    });

}



