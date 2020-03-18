/**
 * name : userProfile/helper.js
 * author : Aman
 * Date : 10-feb-2019
 * Description : All user profile helper related information.
 */

let entitiesHelper = require(ROOT_PATH + "/module/entities/helper");

module.exports = class UserProfileHelper {

     /**
      * List of user profile.
      * @method
      * @name list
      * @param {Object} [queryParameter = "all"] - Filtered query data.
      * @param {Object} [projection = {}] - Projected data.   
      * @returns {Object} returns a entity types list from the filtered data.
     */

    static list(queryParameter = "all", projection = {}) {
        return new Promise(async (resolve, reject) => {
            try {

                if( queryParameter === "all" ) {
                    queryParameter = {};
                };

                let userProfileData = 
                await database.models.userProfile.find(queryParameter, projection).lean();

                return resolve(userProfileData);

            } catch (error) {
                return reject(error);
            }
        })

    }

    /**
    * Get user profile form data.
    * @method
    * @name getForm
    * @returns {json} Response consists of user form data.
    */

    static getForm(loggedInUser, appName = "", device = "") {
        return new Promise(async (resolve, reject) => {
            try {

                let formData =
                    await database.models.forms.findOne({ 
                        name: constants.common.USER_PROFILE_FORM_NAME 
                    }).lean();

                if( !formData ) {
                    return reject({  
                        message :
                        constants.apiResponses.COULD_NOT_GET_FORM 
                    });
                }

                let name = appName + "." + device;
                let userProfileScreenVisitedTrack = {
                    [name] : true
                };

                let userExtensionData = 
                await database.models.userExtension.findOne(
                    { 
                        userId: loggedInUser.userId 
                    },{ 
                        userProfileScreenVisitedTrack: 1 
                }).lean();

                if ( userExtensionData ) {
                    let updateData = {};
                    
                    if ( userExtensionData.userProfileScreenVisitedTrack ) {
                        updateData = userExtensionData.userProfileScreenVisitedTrack;
                        updateData[name] = true;
                    } else {
                        updateData = userProfileScreenVisitedTrack;
                    }

                    database.models.userExtension.findOneAndUpdate(
                        { 
                            userId: loggedInUser.userId 
                        }, { 
                            "$set": { userProfileScreenVisitedTrack: updateData }
                        }
                    );
                }
                    
                let states = 
                await database.models.entities.find(
                    { 
                        entityType: constants.common.STATE_ENTITY_TYPE 
                    },{ 
                        entityTypeId: 1, 
                        _id: 1, 
                        "metaInformation.name": 1, 
                        groups: 1, 
                        childHierarchyPath: 1 
                    }
                ).lean();
                
                let statesInformation = [];
                let childHierarchyForState = {};
                    
                await Promise.all(states.map(async function (state) {
                    
                    if ( state.groups && Object.keys(state.groups).length > 0) {
                        
                        let stateWithSubEntity = 
                        await _checkStateWithSubEntities(
                            state.groups, 
                            state.entityTypeId
                        );
                            
                        if ( stateWithSubEntity ) {
                            childHierarchyForState[state._id] = 
                            state.childHierarchyPath;
                        }
                    }

                    statesInformation.push({
                        label: state.metaInformation.name,
                        value: state._id
                    });
                }));
                    
                let userData = await database.models.userProfile.find(
                    { 
                        userId : loggedInUser.userId,
                        deleted : false
                    }, { 
                        metaInformation: 1,
                        _id: 1,
                        status : 1 
                    }).sort({ 
                        createdAt: -1
                }).lean();
                
                if ( userData.length < 1 ) {
                    let userProfileCreated = await this.create(
                        loggedInUser
                    );

                    userData = userProfileCreated;
                }

                let canSubmit = true;

                if( Array.isArray(userData) && userData.length > 0 ) {
                    
                    let verifiedUserProfile = userData.find(
                        user=>user.status === 
                        constants.common.USER_PROFILE_VERIFIED_STATUS
                    );

                    let pendingUserProfile = userData.find(
                        user=>user.status === 
                        constants.common.USER_PROFILE_PENDING_STATUS
                    );

                    if( verifiedUserProfile ) {
                        userData = verifiedUserProfile;

                        if( pendingUserProfile ) {
                            canSubmit = false;
                        }

                    } else {
                        userData = userData[0];
                        canSubmit = false;
                    }
                }

                if( ! _.isEmpty(userData.metaInformation.state)) {
                    
                    let entitiesSequence = 
                    childHierarchyForState[userData.metaInformation.state.value.toString()];

                    entitiesSequence.forEach(entitySequence=>{
                        
                        let entityData = userData.metaInformation[entitySequence];

                        if( entityData ) {
                            
                            let form = { ...formData.value[0] };
                            form.label = 
                            entitySequence.charAt(0).toUpperCase() + entitySequence.slice(1);

                            form.editable = canSubmit ? canSubmit : false;
                            form.field = entitySequence;
                            form.input = "multiselect";
                            form.value = entityData;
                            form.validation = {};
                            formData.value.push(form);
                        }
                        
                    })
                }

                formData.value.forEach(form=>{
                    
                    if( form.field == "state" ) {
                        
                        form["options"] = states.map(state=>{
                            return {
                                label : state.metaInformation.name,
                                value : state._id,
                            }
                        });
                    }

                    form.editable = canSubmit ? canSubmit : false;
                    form.value = 
                    userData.metaInformation[form.field] ? 
                    userData.metaInformation[form.field] : "";
                })

                return resolve({ 
                    result : {
                        form: formData.value,
                        statesWithSubEntities: childHierarchyForState,
                        canSubmit : canSubmit
                    }, 
                    message : constants.apiResponses.FORM_FETCH 
                });
            } catch (error) {
                return reject(error);
            }
        });
    }

    /**
     * Create userProfile
     * @method
     * @name create
     * @param { string } userDetails - Logged in user detail information.
     * @return {Object} - create user profile data
    */

   static create(userDetails) {
       return new Promise(async (resolve, reject) => {
           try {
               
            let userProfileData = {
                "userId" : userDetails.userId,
                "createdBy" : userDetails.userId,
                "metaInformation" : {
                    "firstName" : userDetails.firstName,
                    "lastName" : userDetails.lastName,
                    "email" : userDetails.email,
                    "phoneNumber" : userDetails.phone,
                },
                "externalId" : userDetails.userName,
                "status" : constants.common.USER_PROFILE_NOT_VERIFIED_STATUS,
                "updatedBy" : userDetails.userId   
            }

            let userExtensionDocument = 
            await database.models.userExtension.findOne(
                {
                    userId : userDetails.userId 
                },{ 
                    roles: 1 
                }
            ).lean();
            
           if(
               userExtensionDocument && 
               userExtensionDocument.roles && 
               userExtensionDocument.roles.length > 0 &&
               userExtensionDocument.roles[0].entities &&
               userExtensionDocument.roles[0].entities[0]
            ) {

                let projection = [
                    "entityType",
                    "metaInformation.name",
                    "metaInformation.externalId",
                    "entityTypeId"
                ];

                for(
                    let role = 0;
                    role < userExtensionDocument.roles.length;
                    role++
                ) {
                    
                    let userRole = userExtensionDocument.roles[role];
                    
                    let entities = await entitiesHelper.entityDocuments({
                        _id : { $in : userRole.entities }
                    },projection);

                    if( entities && entities.length > 0 ) {

                        for(let entity = 0 ; entity < entities.length ; entity++ ) {

                            let updateMetaInformation = _metaInformationData(
                                userProfileData,
                                entities[entity]
                            );

                            if( updateMetaInformation.entityType !== "state" ) {
                            
                                let relatedEntities = 
                                await entitiesHelper.relatedEntities(
                                    entities[entity]._id, 
                                    entities[entity].entityTypeId, 
                                    entities[entity].entityType, 
                                    projection
                                );
        
                                if( relatedEntities.length > 0 ) {

                                    let updateMetaData = true;

                                    if( userProfileData.metaInformation.state ) {
                                        
                                        let stateExists= relatedEntities.find(
                                            state=>state.metaInformation.externalId ===
                                            userProfileData.metaInformation.state.externalId
                                        );

                                        if( !stateExists ) {
                                            if( userProfileData.metaInformation[updateMetaInformation.entityType].length > 0 ) {
                                                let findIndexEntity = 
                                                userProfileData.metaInformation[updateMetaInformation.entityType].findIndex(
                                                    data => data.value.toString() === entities[entity]._id.toString()
                                                )

                                                userProfileData.metaInformation[updateMetaInformation.entityType].splice(findIndexEntity);
                                            } else {
                                                delete userProfileData.metaInformation[updateMetaInformation.entityType];
                                            }
                                            updateMetaData = false;
                                        } 
                                    }

                                    if( updateMetaData ) {
                                          relatedEntities.forEach(entity => { 
                                            _metaInformationData(
                                                userProfileData,
                                                entity
                                            );
                                        })
                                    }
                                }
                            } else {
                                break;
                            }
                            
                        }

                    }
                }
             }

            let userCreationData = 
            await database.models.userProfile.create(userProfileData);

            return resolve(userCreationData);
           } catch (err) {
            return reject(err);
           }
       });

   }

  /*
   * save user profile data.
   * @method
   * @name save
   * @return {json} Response consists of saved user profile data.
   */

    static save( metaInformationData, userId,externalId ) {
        return new Promise(async (resolve, reject) => {
            try {

                let userProfileData = await this.list({
                    userId: userId,
                    status : 
                    constants.common.USER_PROFILE_PENDING_VERIFICATION_STATUS
                },{
                    status: 1,
                    _id: 1
                });

                if( userProfileData && userProfileData[0] ) {
                    return resolve({
                        message : 
                        constants.apiResponses.PROFILE_UNDER_PENDING_VERIFICATION
                    });
                }


                let updateUserProfileData = {
                    updatedBy : userId,
                    status : 
                    constants.common.USER_PROFILE_PENDING_VERIFICATION_STATUS,
                    submittedAt : new Date(),
                    metaInformation : metaInformationData
                }

                userProfileData = await this.list({
                    userId: userId,
                    status : constants.common.USER_PROFILE_NOT_VERIFIED_STATUS
                },{
                    status: 1,
                    _id: 1
                });

                let saveUserProfileInformation;

                if( userProfileData && userProfileData[0] ) {

                    saveUserProfileInformation = 
                    await database.models.userProfile.findOneAndUpdate(
                        {
                            _id: userProfileData[0]._id
                        },{
                            $set : updateUserProfileData
                        },{ new : true }
                    ).lean();

                } else {
                    
                    updateUserProfileData["userId"] = userId;
                    updateUserProfileData["createdBy"] = userId;
                    updateUserProfileData["externalId"] = externalId;

                    saveUserProfileInformation = 
                    await database.models.userProfile.create(
                        updateUserProfileData
                    );
                }
                
                return resolve({ 
                    result : saveUserProfileInformation.metaInformation,
                    message : constants.apiResponses.USER_PROFILE_SAVED 
                });

            } catch (error) {
                return reject(error);
            }
        });
    }


    /**
    * User profile whose information is not verified or not sent for verification.
    * @method
    * @name  userProfileNotVerified 
    * @returns {json} Response consists of list of user which status is not
    * verified.
    */

    static userProfileNotVerified( userId = false ) {
        return new Promise(async (resolve, reject) => {
            try {

                let findQuery = {
                    status: 
                    constants.common.USER_PROFILE_NOT_VERIFIED_STATUS
                };

                if( userId ) {
                    findQuery["userId"] = userId;
                }

                let userProfileDocuments = 
                await database.models.userProfile.find(findQuery).lean();

                return resolve(userProfileDocuments);
              
            } catch (error) {
                return reject(error);
            }
        });
    }

};

/**
  * check state has subEntities
  * @method
  * @name _checkStateWithSubEntities
  * @param { string } stateId - Array of entities.
  * @returns {boolean}
  * */

function _checkStateWithSubEntities(groups, entityTypeId) {
    return new Promise(async (resolve, reject) => {
        try {

            let entityTypes = Object.keys(groups);

            let entityTypeDoc =
                await database.models.entityTypes.findOne({
                    _id: entityTypeId
                }, { immediateChildrenEntityType: 1 }).lean();
            
            if (
                entityTypeDoc && 
                entityTypeDoc.immediateChildrenEntityType && 
                entityTypeDoc.immediateChildrenEntityType.length > 0
            ) {

                Promise.all(entityTypes.map(async function (types) {

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
   * Based on entities get label value data.
   * @method
   * @name _entitiesLabelValueData
   * @returns {json} Response consists of label and value of entities.
  */

function _entitiesLabelValueData(entity) {
    return {
        label : entity.metaInformation.name ? entity.metaInformation.name : "",
        value : entity._id,
        externalId: entity.metaInformation.externalId,
    }
}

  /**
   * Create metaInformation for the logged in user.
   * @method
   * @name _metaInformationData
   * @returns {json} Response consists of metaInformation data.
  */

function _metaInformationData(userProfileData,entities) {

    let entityType = entities.entityType;

    if( entityType === "state" ) {
                        
        userProfileData.metaInformation[entityType] = 
        _entitiesLabelValueData(
            entities
        );

    } else {

        if( !userProfileData.metaInformation[entityType]) {
            userProfileData.metaInformation[entityType] = [];
        }
        
        let pushToMeta = true;
            
        if( userProfileData.metaInformation[entityType].length > 0 ) {
            
            let checkEntityPresent = 
            userProfileData.metaInformation[entityType].find(entity=>
                entity.value.toString() === entities._id.toString()
            );
            
            if( checkEntityPresent ) {
                pushToMeta = false;
            }
        }

        if( pushToMeta ) {
            userProfileData.metaInformation[entityType].push(
                _entitiesLabelValueData( entities )
            );
        }

    }

    return {
        entityType : entityType
    };
}




