/**
 * name : userProfile/helper.js
 * author : Aman
 * Date : 10-feb-2019
 * Description : All user profile helper related information.
 */

let entitiesHelper = require(ROOT_PATH + "/module/entities/helper");

module.exports = class UserProfileHelper {

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

                if( !formData ){
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
                    
                let userData = await database.models.userProfile.findOne(
                    { userId: loggedInUser.userId }, { 
                        metaInformation: 1,
                        _id: 1 
                    }).sort({ 
                        createdAt: -1
                }).lean();
                
                if ( !userData ) {
                    let userProfileCreated = await this.create(
                        loggedInUser
                    );

                    userData = userProfileCreated;
                }

                let entityKeyData = _.omit(
                    userData.metaInformation,
                    ["firstName","lastName","email","phoneNumber","state"]
                );

                if( ! _.isEmpty(entityKeyData) ) {

                    Object.keys(entityKeyData).forEach(eachEntityKey=>{
                        
                        let form = { ...formData.value[0] };

                        form.label = 
                        eachEntityKey.charAt(0).toUpperCase() + eachEntityKey.slice(1);
                        form.field = eachEntityKey;
                        form.input = "multiselect";
                        form.value = entityKeyData[eachEntityKey];
                        form.validation = {};
                        formData.value.push(form);
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
                    
                    form.value = 
                    userData.metaInformation[form.field] ? 
                    userData.metaInformation[form.field] : "";
                })

                return resolve({ 
                    result : {
                        form: formData.value,
                        statesWithSubEntities: childHierarchyForState
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
                                            delete userProfileData.metaInformation[updateMetaInformation.entityType];
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

    static save(bodyData, userId,externalId) {
        return new Promise(async (resolve, reject) => {
            try {

                let userProfileData = await database.models.userProfile.findOne({
                    userId: userId,
                    status : 
                    constants.common.USER_PROFILE_PENDING_VERIFICATION_STATUS
                }, {
                    status: 1,
                    _id: 1
                }).sort({ createdAt: -1 }).lean();

                if( userProfileData ) {
                    return resolve({
                        message : 
                        constants.apiResponses.PROFILE_UNDER_PENDING_VERIFICATION
                    });
                }
                
                bodyData['userId'] = userId;
                bodyData['externalId'] = externalId;
                bodyData["createdBy"] = userId;
                bodyData['status'] = 
                constants.common.USER_PROFILE_PENDING_VERIFICATION_STATUS;

                bodyData['submittedAt'] = new Date();
                
                let saveUserProfileInformation = 
                await database.models.userProfile.create(
                    bodyData
                );
                
                return resolve({ 
                    result : saveUserProfileInformation,
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
        label : entity.metaInformation.name,
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

        userProfileData.metaInformation[entityType].push(
            _entitiesLabelValueData(
                entities
            )
        );
    }

    return {
        entityType : entityType
    };
}





