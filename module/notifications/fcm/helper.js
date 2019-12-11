/**
 * name : module/notifications/fcm/helper.js
 * author : Aman Jung Karki
 * Date : 15-Nov-2019
 * Description : FCM helper.
 */

// dependencies
const NOTIFICATION_COLOR = 
gen.utils.checkIfEnvDataExistsOrNot("SAMIKSHA_THEME_COLOR");
const userExtensionsHelper = require(ROOT_PATH + "/module/user-extension/helper");
const firebaseHelper = require(ROOT_PATH + "/generics/helpers/fcm");

/**
    * FcmHelper
    * @class
*/

module.exports = class FcmHelper {

    /**
      * Push device id to topic.
      * @method
      * @name pushToTopic
      * @param {Object} element - element is an object consisting of 
      * topicName,title and message.
      * @returns {Promise} returns a promise.
     */

    static pushToTopic(element) {
        return new Promise(async (resolve, reject) => {
            try {

                let pushNotificationRelatedInformation = {
                    topic: element.topicName,
                    notification: {
                        title: element.title,
                        body: element.message
                    }
                };

                let pushToTopicData = 
                await firebaseHelper.sendToTopic(
                    pushNotificationRelatedInformation.topic, 
                    pushNotificationRelatedInformation.notification
                );

                return resolve(pushToTopicData);

            } catch (error) {
                return reject(error);
            }
        })
    }

    /**
      * Create notification in android.
      * @method
      * @name createNotificationInAndroid
      * @param {Object} notificationData - Notification that need to a given android.
      * @param {Object} notificationData.data - Consists of Notification data.
      * @param {Object} notificationData.title - title of notification.
      * @param {Object} notificationData.text - text of notification.
      * @param {Object} notificationData.color - notification color.    
      * @param {Object} notificationData.deviceId - where to sent the notifications.                                           
      * @returns {Promise} returns a promise.
     */

    static createNotificationInAndroid(notificationData) {
        return new Promise(async (resolve, reject) => {
            try {

                let pushNotificationRelatedInformation = {
                    android: {
                        "data": notificationData.data ? notificationData.data : {},
                        ttl: 3600 * 1000, // 1 hour in milliseconds
                        priority: 'high',
                        notification: {
                            "click_action": "FCM_PLUGIN_ACTIVITY",
                            title: notificationData.title,
                            body: 
                            notificationData.text ? 
                            notificationData.text : notificationData.message,
                            icon: 'stock_ticker_update',
                            color: NOTIFICATION_COLOR
                        },

                    },
                    token: notificationData.deviceId
                }

                let pushToDevice = 
                await firebaseHelper.sendToDevice(
                    notificationData.deviceId,
                     pushNotificationRelatedInformation.android
                );

                return resolve(pushToDevice);

            } catch (error) {
                return reject(error);
            }
        })
    }

     /**
      * Create notification in ios.
      * @method
      * @name createNotificationInIos
      * @param {Object} notificationData - Notification that need to a given android.
      * @param {Object} notificationData.title - title of notification.
      * @param {Object} notificationData.text - text of notification.   
      * @param {Object} notificationData.deviceId - where to sent the notifications.                                           
      * @returns {Promise} returns a promise.
     */


    static createNotificationInIos(notificationData) {
        return new Promise(async (resolve, reject) => {
            try {

                let pushNotificationRelatedInformation = {
                    android: {
                        notification: {
                            "click_action": "FCM_PLUGIN_ACTIVITY",
                            title: notificationData.title,
                            body: notificationData.text ? 
                            notificationData.text : 
                            notificationData.message,
                            icon: 'stock_ticker_update',
                            color: '#f45342'
                        }
                    },
                    token: notificationData.deviceId
                }

                let pushToDevice = 
                await this.sendMessage(pushNotificationRelatedInformation);

                return resolve(pushToDevice);


            } catch (error) {
                return reject(error);
            }
        })
    }

    /**
      * Push data to all users.
      * @method
      * @name pushData
      * @param {Object} allUserData - Notification that need to a given android.
      * @param {String} allUserData.topicName - topicName of notification.
      * @param {String} allUserData.message - message of notification.   
      * @param {String} allUserData.title - title of notifications.                                           
      * @returns {Promise} returns a promise.
     */

    static pushData(allUserData) {
        return new Promise(async (resolve, reject) => {
            try {

                if (!allUserData.topicName) {
                    allUserData.topicName = "allUsers";
                }

                if (allUserData.message && allUserData.title) {
                    let topicResult = await this.pushToTopic(allUserData);

                    if (topicResult !== undefined && topicResult.success) {
                        allUserData.status = "success";
                    } else {
                        allUserData.status = "Fail";
                    }
                }
                else {
                    allUserData.status = "Message or title is not present in csv.";
                }

                return resolve(allUserData);

            } catch (error) {
                return reject(error);
            }
        })
    }

    /**
      * Subscribe or unsubscribe data.
      * @method
      * @name subscribeOrUnSubscribeData
      * @param {Object} subscribeOrUnSubscribeData - Notification that need to a given android.
      * @param {String} subscribeOrUnSubscribeData.userId - Logged in user.
      * @param {String} subscribeOrUnSubscribeData.appName - appName.   
      * @param {String} subscribeOrUnSubscribeData.os - os.
      * @param {String} subscribeOrUnSubscribeData.topicName - topicName.
      * @param {String} [subscribeToTopic = false] - subscribe to topic or not.                                                 
      * @returns {Promise} returns a promise.
     */

    static subscribeOrUnSubscribeData(subscribeOrUnSubscribeData, subscribeToTopic = false) {
        return new Promise(async (resolve, reject) => {
            try {

                let userProfile = await userExtensionsHelper.userExtensionDocument({
                    userId: subscribeOrUnSubscribeData.userId,
                    status: "active",
                    isDeleted: false
                }, {
                        devices: 1
                    });

                let deviceStatus;

                if (subscribeToTopic) {
                    deviceStatus = "active";
                } else {
                    deviceStatus = "inactive";
                }
                
                let subscribedOrUnSubscribed = [];

                if (userProfile && userProfile.devices.length > 0) {

                    let matchedDevices = userProfile.devices.filter(eachUserDevice => {
                        if (eachUserDevice.app == subscribeOrUnSubscribeData.appName && 
                            eachUserDevice.os == subscribeOrUnSubscribeData.os && 
                            eachUserDevice.status === deviceStatus) {
                            return eachUserDevice;
                        }
                    });

                    if (matchedDevices.length > 0) {

                        await Promise.all(userProfile.devices.map(async device => {

                            device.topic = subscribeOrUnSubscribeData.topicName;

                            let result;

                            if (subscribeToTopic) {
                                result = 
                                await firebaseHelper.subscribeDeviceToTopic(
                                    device.deviceId,
                                    device.topic
                                );
                            } else {
                                result = 
                                await firebaseHelper.unsubscribeDeviceFromTopic(
                                    device.deviceId,
                                    device.topic
                                );
                            }

                            if (result !== undefined && result.success) {
                                subscribeOrUnSubscribeData.status = subscribeToTopic ? 
                                "successfully subscribed" : "successfully unsubscribed";
                            } else {
                                subscribeOrUnSubscribeData.status = subscribeToTopic ? 
                                "Fail to subscribe" : "Fail to unsubscribe";
                            }

                            subscribedOrUnSubscribed.push(subscribeOrUnSubscribeData);
                        }))

                    } else {
                        subscribeOrUnSubscribeData.status = 
                        "App name could not be found or status is inactive";
                        subscribedOrUnSubscribed.push(subscribeOrUnSubscribeData);
                    }

                } else {
                    subscribeOrUnSubscribeData.status = "No devices found.";
                    subscribedOrUnSubscribed.push(subscribeOrUnSubscribeData);
                }

                return resolve(subscribeOrUnSubscribeData);

            } catch (error) {
                return reject(error);
            }
        })
    }

};