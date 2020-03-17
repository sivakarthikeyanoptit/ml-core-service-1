/**
 * name : module/notifications/user-extension/helper.js
 * author : Aman Jung Karki
 * Date : 15-Nov-2019
 * Description : User extension helper.
 */


/**
    * UserExtensionHelper
    * @class
*/

const userProfileHelper = require(MODULES_BASE_PATH + "/user-profile/helper.js");
const entityTypesHelper = require(MODULES_BASE_PATH+"/entityTypes/helper");
const entitiesHelper = require(MODULES_BASE_PATH+"/entities/helper");

module.exports = class UserExtensionHelper {

       /**
      * Get userExtension document based on userid.
      * @method
      * @name userExtensionDocument
      * @name userExtensionDocument
      * @param {Object} filterQueryObject - filter query data.
      * @param {Object} [projection = {}] - projected data.
      * @returns {Promise} returns a promise.
     */

    static userExtensionDocument(filterQueryObject, projection = {}) {
        return new Promise(async (resolve, reject) => {
            try {

                let userExtensionData = await database.models.userExtension.findOne(filterQueryObject, projection).lean();

                return resolve(userExtensionData);

            } catch (error) {
                return reject(error);
            }
        })


    }

     /**
      * Create or update the userExtension document.
      * @method
      * @name createOrUpdate
      * @name createOrUpdate 
      * @param {Object} deviceData - device data.
      * @param {Object} userDetails - User details.
      * @param {String} userDetails.userId - Logged in user id.
      * @param {String} userDetails.userName - Logged in user name.        
      * @returns {Promise} returns a promise.
     */

    static createOrUpdate(deviceData, userDetails) {

        return new Promise(async (resolve, reject) => {
            try {

                let userExtensionData = await this.userExtensionDocument({
                    userId: userDetails.userId,
                    status: "active",
                    isDeleted: false
                }, { devices: 1 });

                let response = {};

                if (userExtensionData) {

                    let deviceNotFound = false;

                    if (userExtensionData.devices && userExtensionData.devices.length > 0) {

                        let matchingDeviceData = 
                        userExtensionData.devices.find(
                            eachDevice => eachDevice.deviceId === deviceData.deviceId
                        );

                        if (!matchingDeviceData) {

                            deviceNotFound = true;
                        }

                    } else {
                        deviceNotFound = true;
                    }

                    if (deviceNotFound) {

                        let updatedData = await database.models.userExtension.findOneAndUpdate({
                            userId: userDetails.userId,
                        }, { $addToSet: { devices: deviceData } }).lean();

                        if (updatedData) {
                            response["success"] = true;
                            response["message"] = 
                            `Added Successfully device id ${deviceData.deviceId} for user ${userDetails.email}`;
                        } else {
                            throw `Could not add device id ${deviceData.deviceId} for user ${userDetails.email}`;
                        }
                    }

                } else {

                    let createUserExtension = await database.models.userExtension.create(
                        {
                            "userId": userDetails.userId,
                            "externalId": userDetails.userName,
                            "devices": [deviceData],
                            "createdBy": "SYSTEM",
                            "updatedBy": "SYSTEM"
                        }
                    );

                    if (createUserExtension) {
                        response["success"] = true;
                        response["message"] = 
                        `Successfully created user ${userDetails.userId} in userExtension`;
                    } else {
                        throw `Could not create user ${userDetails.userId} in userExtension`;
                    }

                }

                await userProfileHelper.create({
                    userId : userDetails.userId
                },userDetails.userToken);

                return resolve(response);

            } catch (error) {
                return reject(error);
            }
        })
    }

     /**
      * Update device status in userExtension document.
      * @method
      * @name updateDeviceStatus
      * @name updateDeviceStatus  
      * @param {Object} deviceData - device data.
      * @param {String} deviceData.title - title of device.
      * @param {Object[]} deviceArray - device array.      * 
      * @param {String} userId - Logged in user id.      
      * @returns {Promise} returns a promise.
     */

    static updateDeviceStatus(deviceId,deviceArray, userId) {

        return new Promise(async (resolve, reject) => {

            try {
                deviceArray.forEach(async devices => {

                    delete devices['message'];
                    delete devices['title'];

                    if (devices.deviceId == deviceId) {
                        devices.status = "inactive";
                        devices.deactivatedAt = new Date();
                    }
                });

                let updateDevice = await database.models.userExtension.findOneAndUpdate(
                    { userId: userId },
                    { $set: { "devices": deviceArray } }
                ).lean();

                if (!updateDevice) {
                    throw "Could not update device.";
                }

                return resolve({
                    success: true,
                    message: "successfuly updated the status to inactive"
                });

            } catch (error) {
                return reject(error);
            }

        })
    }

     /**
   * Get profile with entity details
   * @method
   * @name profileWithEntityDetails
   * @param {Object} filterQueryObject - filtered data.
   * @returns {Object} 
   */

  static profileWithEntityDetails( filterQueryObject, appName ) {
    return new Promise(async (resolve, reject) => {
        try {

            const entityTypesArray = await entityTypesHelper.list({}, {
                name: 1,
                immediateChildrenEntityType: 1
            });

            let enityTypeToImmediateChildrenEntityMap = {};

            if (entityTypesArray.length > 0) {  
                entityTypesArray.forEach(entityType => {
                    enityTypeToImmediateChildrenEntityMap[entityType.name] = (entityType.immediateChildrenEntityType && entityType.immediateChildrenEntityType.length > 0) ? entityType.immediateChildrenEntityType : [];
                })
            }

            let queryObject = [
                {
                    $match: filterQueryObject
                },
                {
                    $lookup: {
                        "from": "entities",
                        "localField": "roles.entities",
                        "foreignField": "_id",
                        "as": "entityDocuments"
                    }
                },
                {
                    $lookup: {
                        "from": "userRoles",
                        "localField": "roles.roleId",
                        "foreignField": "_id",
                        "as": "roleDocuments"
                    }
                },
                {
                    $project: {
                        "externalId": 1,
                        "roles": 1,
                        "roleDocuments._id": 1,
                        "roleDocuments.code": 1,
                        "roleDocuments.title": 1,
                        "entityDocuments._id": 1,
                        "entityDocuments.metaInformation.externalId": 1,
                        "entityDocuments.metaInformation.name": 1,
                        "entityDocuments.groups": 1,
                        "entityDocuments.entityType": 1,
                        "entityDocuments.entityTypeId": 1
                    }
                }
            ];

            let userExtensionData = await database.models.userExtension.aggregate(queryObject);
            let relatedEntities = [];

            if (userExtensionData[0]) {

                let roleMap = {};

                if( userExtensionData[0].entityDocuments && userExtensionData[0].entityDocuments.length >0 ) {
                    
                    let projection = [
                        "metaInformation.externalId", 
                        "metaInformation.name", 
                        "metaInformation.addressLine1",
                        "metaInformation.addressLine2",
                        "metaInformation.administration",
                        "metaInformation.city",
                        "metaInformation.country",
                        "entityTypeId",
                        "entityType"
                    ];

                    relatedEntities = 
                    await entitiesHelper.relatedEntities(
                    userExtensionData[0].entityDocuments[0]._id, 
                    userExtensionData[0].entityDocuments[0].entityTypeId, 
                    userExtensionData[0].entityDocuments[0].entityType, 
                    projection
                    );
                }

                // <- Dirty fix. Profile update for only Goa state. 
                // In future can be removed if required for all state.

                let goaStateExists = false;
                if( relatedEntities.length > 0 ) {
                    let checkGoaStateExistsOrNot = relatedEntities.some(
                        entity=>entity.metaInformation.name === constants.common.GOA_STATE
                    )

                    if( checkGoaStateExistsOrNot && appName === constants.common.UNNATI_APP_NAME ){
                        goaStateExists = true;
                    } 
                    
                }

                if ( userExtensionData[0].roleDocuments && userExtensionData[0].roleDocuments.length > 0 ) {

                    userExtensionData[0].roleDocuments.forEach(role => {
                        roleMap[role._id.toString()] = role;
                    })
                    let entityMap = {};
                    
                    userExtensionData[0].entityDocuments.forEach(entity => {
                        entity.metaInformation.childrenCount = 0;
                        entity.metaInformation.entityType = entity.entityType;
                        entity.metaInformation.entityTypeId = entity.entityTypeId;
                        entity.metaInformation.subEntityGroups = new Array;

                        Array.isArray(enityTypeToImmediateChildrenEntityMap[entity.entityType]) && enityTypeToImmediateChildrenEntityMap[entity.entityType].forEach(immediateChildrenEntityType => {
                            if (entity.groups && entity.groups[immediateChildrenEntityType]) {
                                entity.metaInformation.immediateSubEntityType = immediateChildrenEntityType;
                                entity.metaInformation.childrenCount = entity.groups[immediateChildrenEntityType].length;
                            }
                        })

                        entity.groups && Array.isArray(Object.keys(entity.groups)) && Object.keys(entity.groups).forEach(subEntityType => {
                            entity.metaInformation.subEntityGroups.push(subEntityType);
                        })

                        // <- Dirty fix. Profile update for only Goa state. 
                        // In future can be removed if required for all state.
                        
                        if( 
                            appName === constants.common.UNNATI_APP_NAME && 
                            entity.metaInformation.name === constants.common.GOA_STATE
                        ) {
                            goaStateExists = true;
                        }

                        entityMap[entity._id.toString()] = entity;
                    })

                    for (let userExtensionRoleCounter = 0; userExtensionRoleCounter < userExtensionData[0].roles.length; userExtensionRoleCounter++) {
                        for (let userExtenionRoleEntityCounter = 0; userExtenionRoleEntityCounter < userExtensionData[0].roles[userExtensionRoleCounter].entities.length; userExtenionRoleEntityCounter++) {
                            userExtensionData[0].roles[userExtensionRoleCounter].entities[userExtenionRoleEntityCounter] = {
                                _id: entityMap[userExtensionData[0].roles[userExtensionRoleCounter].entities[userExtenionRoleEntityCounter].toString()]._id,
                                ...entityMap[userExtensionData[0].roles[userExtensionRoleCounter].entities[userExtenionRoleEntityCounter].toString()].metaInformation
                            };
                        }
                        roleMap[userExtensionData[0].roles[userExtensionRoleCounter].roleId.toString()].immediateSubEntityType = (userExtensionData[0].roles[userExtensionRoleCounter].entities[0] && userExtensionData[0].roles[userExtensionRoleCounter].entities[0].entityType) ? userExtensionData[0].roles[userExtensionRoleCounter].entities[0].entityType : "";
                        roleMap[userExtensionData[0].roles[userExtensionRoleCounter].roleId.toString()].entities = userExtensionData[0].roles[userExtensionRoleCounter].entities;
                    }
                }

                let showPopupForm = false;
                let userProfile = await database.models.userProfile.findOne(
                    {
                        userId : filterQueryObject.userId,
                        status : { 
                            $in : [
                                constants.common.USER_PROFILE_VERIFIED_STATUS,
                                constants.common.USER_PROFILE_PENDING_STATUS
                            ]
                        }
                    },{ _id : 1,status:1 }).lean();

                if( userProfile == null ) {
                    showPopupForm = true
                }

                return resolve(
                    _.merge(_.omit(
                        userExtensionData[0], 
                        ["roles","entityDocuments","roleDocuments"]
                        ), 
                    { roles: _.isEmpty(roleMap) ? [] : Object.values(roleMap) },
                    { relatedEntities : relatedEntities },
                    {
                        allowProfileUpdateForm : goaStateExists
                    },{
                        showPopupForm : goaStateExists && showPopupForm ? true : false
                    }
                    )
                );
            } else {
                return resolve({});
            }
        } catch (error) {
            return reject(error);
        }
    })


}


};




