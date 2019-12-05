/**
 * name : module/notifications/push/helper.js
 * author : Aman Jung Karki
 * Date : 15-Nov-2019
 * Description : Push Notifications helper.
 */


// dependencies

const fcmNotification = require('fcm-notification');
const FCM_KEY_PATH = gen.utils.checkIfEnvDataExistsOrNot("FCM_KEY_PATH");
const fcm_token_path = require(ROOT_PATH + FCM_KEY_PATH);
const FCM = new fcmNotification(fcm_token_path);
const THEME_COLOR = gen.utils.checkIfEnvDataExistsOrNot("SAMIKSHA_THEME_COLOR");
const NODE_ENV = gen.utils.checkIfEnvDataExistsOrNot("NODE_ENV"); 
const slackClient = require(ROOT_PATH + "/generics/helpers/slack-communications");
const userExtensionHelper = require(ROOT_PATH + "/module/user-extension/helper");

/**
    * PushNotificationsHelper
    * @class
*/

module.exports = class PushNotificationsHelper {

       /**
      * Push data to topic.
      * @method
      * @name pushToTopic
      * @param {Object} element - element 
      * @param {String} element.topicName - topicName
      * @param {String} element.title - title
      * @param {String} element.message - message
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
                await this.sendMessage(pushNotificationRelatedInformation);

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
      * @param {String} notificationData.data - Consists of Notification data.
      * @param {String} notificationData.title - title of notification.
      * @param {String} notificationData.text - text of notification. 
      * @param {String} notificationData.deviceId - where to sent the notifications.                                           
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
                            "click_action" : "FCM_PLUGIN_ACTIVITY",
                            title : notificationData.title,
                            body : notificationData.text ? 
                            notificationData.text : notificationData.message,
                            icon : 'stock_ticker_update',
                            color: gen.utils.checkIfEnvDataExistsOrNot("SLACK_ERROR_MESSAGE_COLOR")                        
                        },

                    },
                    token: notificationData.deviceId
                };

                let pushToDevice = 
                await this.sendMessage(pushNotificationRelatedInformation);

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
      * @param {String} notificationData.title - title of notification.
      * @param {String} notificationData.text - text of notification.   
      * @param {String} notificationData.deviceId - where to sent the notifications.                                           
      * @returns {Promise} returns a promise.
     */

    static createNotificationInIos(notificationData) {
        return new Promise(async (resolve, reject) => {
            try {

                let pushNotificationRelatedInformation = {
                    android: {
                        notification: {
                            "click_action" : "FCM_PLUGIN_ACTIVITY",
                            title : notificationData.title,
                            body : notificationData.text ? 
                            notificationData.text : notificationData.message,
                            icon : 'stock_ticker_update',
                            color : '#f45342'
                        }
                    },
                    token: notificationData.deviceId
                };

                let pushToDevice = await this.sendMessage(pushNotificationRelatedInformation);

                return resolve(pushToDevice);


            } catch (error) {
                return reject(error);
            }
        })
    }

     /**
      * Push to single device.
      * @method
      * @name pushToDeviceId
      * @param {Object} notificationData - Notification that need to a given android.
      * @param {String} notificationData.title - title of notification.
      * @param {String} notificationData.text - text of notification.                                          
      * @returns {Promise} returns a promise.
     */

    static pushToDeviceId(notificationData) {
        return new Promise(async (resolve, reject) => {
            try {

                var token = notificationData.deviceId;

                let pushNotificationRelatedInformation = {
                    token: token,
                    notification: {
                        title: notificationData,
                        body: notificationData.message
                    }
                };

                let pushToFcmToken = await this.sendMessage(pushNotificationRelatedInformation);

                return resolve(pushToFcmToken);

            } catch (error) {
                return reject(error)
            }
        })
    }

    /**
      * FCM send message functionality.
      * @method
      * @name sendMessage
      * @param {Object} notificationInformation - Notification information.                                      
      * @returns {Promise} returns a promise.
     */

    static sendMessage(notificationInformation) {

        return new Promise(async (resolve, reject) => {
            try {

                let deviceId = notificationInformation.token;

                FCM.send(notificationInformation, (err, response) => {

                    let success;
                    let message = "";
                    if (err) {
                        if (err.errorInfo && err.errorInfo.message) {
                            if (err.errorInfo.message === "The registration token is not a valid FCM registration token") {

                                slackClient.sendMessageToSlack({
                                    "code" : err.errorInfo.code,
                                    "message" : err.errorInfo.message,
                                    slackErrorName: 
                                    gen.utils.checkIfEnvDataExistsOrNot("SLACK_ERROR_NAME"),
                                    color: 
                                    gen.utils.checkIfEnvDataExistsOrNot("SLACK_ERROR_MESSAGE_COLOR")
                                });

                                message = err.errorInfo.message;
                            }
                        }

                        success = false;

                    } else {
                        success = true;
                    }

                    return resolve({
                        success: success,
                        message: message
                    });
                });

            } catch (error) {
                return reject(error);
            }
        })

    }


     /**
      * Subscribe to topic.
      * @method
      * @name subscribeToTopic
      * @param {Object} subscribeData - Subscription data.
      * @param {String} subscribeData.deviceId - notification device Id.
      * @param {String} subscribeData.topic - topic of subscription data.                     
      * @returns {Promise} returns a promise.
     */

    static subscribeToTopic(subscribeData) {

        return new Promise(async (resolve, reject) => {

            try {

                let success;

                FCM.subscribeToTopic(subscribeData.deviceId, 
                    NODE_ENV + "-" + subscribeData.topic, 
                    function (err, response) {
                        if (err) {
                            success = false;
                            slackClient.sendMessageToSlack({
                                "code": err.errorInfo.code,
                                "message": err.errorInfo.message,
                                slackErrorName: gen.utils.checkIfEnvDataExistsOrNot("SLACK_ERROR_NAME"),
                                color: gen.utils.checkIfEnvDataExistsOrNot("SLACK_ERROR_MESSAGE_COLOR")
                            });

                    } else {
                        success = true;
                    }

                    return resolve({
                        success: success
                    });
                })

            } catch (error) {
                return reject(error);
            }


        })

    }


    /**
      * UnSubscribe from topic.
      * @method
      * @name unsubscribeFromTopic
      * @param {Object} unsubscribeData - UnSubscription data.
      * @param {String} subscribeData.deviceId - notification device Id.
      * @param {String} subscribeData.topic - topic of subscription data.                     
      * @returns {Promise} returns a promise.
     */

    static unsubscribeFromTopic(unsubscribeData) {

        return new Promise(async (resolve, reject) => {

            try {

                let success;

                FCM.unsubscribeFromTopic(unsubscribeData.deviceId, 
                    NODE_ENV + "-" + unsubscribeData.topic, 
                    function (err, response) {
                        if (err) {
                            success = false;

                            slackClient.sendMessageToSlack({
                                "code": err.errorInfo.code,
                                "message": err.errorInfo.message,
                                slackErrorName: gen.utils.checkIfEnvDataExistsOrNot("SLACK_ERROR_NAME"),
                                color: gen.utils.checkIfEnvDataExistsOrNot("SLACK_ERROR_MESSAGE_COLOR"),
                            });

                    } else {
                        success = true;
                    }

                    return resolve({
                        success: success
                    });
                })


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

                let userProfile = await userExtensionHelper.userExtensionDocument({
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
                    })

                    if (matchedDevices.length > 0) {

                        await Promise.all(userProfile.devices.map(async device => {

                            device.topic = subscribeOrUnSubscribeData.topicName;

                            let result;

                            if (subscribeToTopic) {
                                result = await this.subscribeToTopic(device);
                            } else {
                                result = await this.unsubscribeFromTopic(device);
                            }

                            if (result !== undefined && result.success) {
                                subscribeOrUnSubscribeData.status = subscribeToTopic ? 
                                "successfully subscribed" : 
                                "successfully unsubscribed";

                            } else {
                                subscribeOrUnSubscribeData.status = subscribeToTopic ? 
                                "Fail to subscribe" : 
                                "Fail to unsubscribe";
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