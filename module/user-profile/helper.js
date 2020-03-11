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

    static getForm(userId, appName = "", device = "") {
        return new Promise(async (resolve, reject) => {
            try {

                let userProfileForm =
                    await database.models.forms.findOne({ name: constants.common.USER_PROFILE_FORM_NAME }).lean();

                let name = appName + "." + device;
                let userProfileScreenVisitedTrack = {}
                userProfileScreenVisitedTrack[name] = true;

                let userExt = await database.models.userExtension.findOne({ userId: userId },
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
                        { userId: userId }, { "$set": { userProfileScreenVisitedTrack: updateData } });
                }


                if (userProfileForm) {
                    let stateInfo = await database.models.entities.find({ entityType: constants.common.STATE_ENTITY_TYPE }, { entityTypeId: 1, _id: 1, metaInformation: 1, groups: 1, childHierarchyPath: 1 }).lean();
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
                        let getUserData = await database.models.userProfile.findOne({ userId: userId }, { metaInformation: 1, _id: 1 }).sort({ createdAt: -1 });

                        if (!getUserData) {
                            let profileInfo = await createUserProfile(userId);
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
                    isDeleted: false
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
                    requestedData['status'] = constants.common.USER_PROFILE_PENDING_VERIFICATION_STATUS;
                    requestedData['userId'] = userId;
                    requestedData["verified"] = false;
                    requestedData["updatedBy"] = "";
                    requestedData["createdBy"] = "";
                    requestedData["externalId"] = userExtensionDocument.externalId;
                   
                    let userProfileCreation = await database.models.userProfile.create(
                        requestedData
                    );
                    return resolve(userProfileCreation);

                } else {

                    return resolve({
                        success: false,
                        message: "User profile is under Pending for verification"
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

function createUserProfile(userId) {
    return new Promise(async (resolve, reject) => {
        try {
            let userProfile = {
                "userId": userId,
                metaInformation: {
                    "firstName": null,
                    "lastName": null,
                    "phoneNumber": null,
                    "state": null,
                    "district": null,
                    "block": null,
                    "zone": null,
                    "cluster": null,
                    "taluk": null,
                    "hub": null,
                    "school": null,
                    "email":null
                },
                "status": "active",
                "isDeleted": false,
                "verified": false,
                "updatedBy": false,
                "updatedBy": null
            }
            let tokenInfo = await shikshlokamhelper.generateKeyCloakAccessToken(sunBirdUserName, sunBirdPassword);
            let profileInfo = await shikshlokamhelper.userInfo(tokenInfo.token, userId);

            let state = {};
            let cluster = [];
            let block = [];
            let district = [];
            let taluk = [];
            let zone = [];
            let school = [];
            let hub = [];

            let userExtensionDoc = await database.models.userExtension.findOne({ userId: userId }, { roles: 1 });
           if (userExtensionDoc && userExtensionDoc.roles) {
                await Promise.all(userExtensionDoc.roles.map(async function (rolesInfo) {
                    let entityDoc = await database.models.entities.findOne({ _id: rolesInfo.entities[0] }, { entityType: 1, _id: 1 });
                    if (entityDoc) {

                        let label = "groups." + entityDoc.entityType
                        let query = {}

                       
                        query = {
                            entityType: { $ne: entityDoc.entityType },
                        }
                        query["groups." + entityDoc.entityType] = entityDoc._id;

                        let entityDocs = await database.models.entities.find(query, { entityType: 1, metaInformation: 1 }).lean();

                        if (entityDocs) {
                            await Promise.all(entityDocs.map(async function (entityDocsInfo) {
                                if (entityDocsInfo && entityDocsInfo.entityType && entityDocsInfo.metaInformation) {
                                    obj = {
                                        label:entityDocsInfo.metaInformation.name,
                                        value:entityDocsInfo._id,
                                        externalId: entityDocsInfo.metaInformation.externalId,
                                    }

                                    // obj[entityDocsInfo.metaInformation.name]=entityDocsInfo._id;
                                    if (entityDocsInfo.entityType == "state") {
                                        state = obj;
                                    } else if (entityDocsInfo.entityType == "hub") {
                                        hub.push(obj);
                                    } else if (entityDocsInfo.entityType == "taluk") {
                                        taluk.push(obj);
                                    } else if (entityDocsInfo.entityType == "district") {
                                        district.push(obj);
                                    } else if (entityDocsInfo.entityType == "school") {
                                        school.push(obj);
                                    } else if (entityDocsInfo.entityType == "zone") {
                                        zone.push(obj);
                                    } else if (entityDocsInfo.entityType == "block") {
                                        block.push(obj);
                                    } else if (entityDocsInfo.entityType == "cluster") {
                                        cluster.push(obj);
                                    }
                                }
                            }));
                        }
                    }
                }));
            }

            userProfile.metaInformation.firstName = profileInfo.result.response.firstName;
            userProfile.metaInformation.lastName = profileInfo.result.response.lastName;
            userProfile.metaInformation.email = profileInfo.result.response.email;
            userProfile.metaInformation.phoneNumber = profileInfo.result.response.phone;
            userProfile.metaInformation.state = state;
            userProfile.metaInformation.cluster = cluster;
            userProfile.metaInformation.block = block;
            userProfile.metaInformation.district = district;
            userProfile.metaInformation.taluk = taluk;
            userProfile.metaInformation.zone = zone;
            userProfile.metaInformation.hub = hub;
            userProfile.metaInformation.school = school;

            let userProfileDoc = await database.models.userProfile.create(userProfile);

            resolve(userProfileDoc);
        } catch (err) {
            return reject(err);
        }
    });

}



