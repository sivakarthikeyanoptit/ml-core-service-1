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


};




