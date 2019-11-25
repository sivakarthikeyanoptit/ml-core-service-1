let fcmNotification = require('fcm-notification'); // load firebase notification
const FCM_KEY_PATH = (process.env.FCM_KEY_PATH && process.env.FCM_KEY_PATH != "") ? process.env.FCM_KEY_PATH : "/config/fcm-keystore.json"
const fcm_token_path = require(ROOT_PATH + FCM_KEY_PATH); //read firebase token from the file
let FCM = new fcmNotification(fcm_token_path);
let samikshaThemeColor = process.env.SAMIKSHA_THEME_COLOR ? process.env.SAMIKSHA_THEME_COLOR : "#A63936"
const nodeEnvironment = process.env.NODE_ENV ? process.env.NODE_ENV : "development";
let slackClient = require(ROOT_PATH + "/generics/helpers/slack-communications");
module.exports = class notificationsHelper {

    static pushToTopic(element) {
        return new Promise(async (resolve, reject) => {
            try {

                let pushNotificationRelatedInformation = {
                    topic: element.topicName,
                    notification: {
                        title: element.title,
                        body: element.message
                    }
                }

                let pushToTopicData = await this.sendMessage(pushNotificationRelatedInformation)

                return resolve(pushToTopicData)

            } catch (error) {
                return reject(error);
            }
        })
    }

    static createNotificationInAndroid(notificationData) {
        return new Promise(async (resolve, reject) => {
            try {

                let pushNotificationRelatedInformation = {
                    android: {
                        ttl: 3600 * 1000, // 1 hour in milliseconds
                        priority: 'high',
                        notification: {
                            "click_action": "FCM_PLUGIN_ACTIVITY",
                            title: notificationData.title,
                            body: notificationData.text ? notificationData.text : notificationData.message,
                            icon: 'stock_ticker_update',
                            color: samikshaThemeColor
                        },

                    },
                    token: notificationData.deviceId
                }

                let pushToDevice = await this.sendMessage(pushNotificationRelatedInformation);

                return resolve(pushToDevice)

            } catch (error) {
                return reject(error);
            }
        })
    }

    static createNotificationInIos(notificationData) {
        return new Promise(async (resolve, reject) => {
            try {

                let pushNotificationRelatedInformation = {
                    android: {
                        notification: {
                            "click_action": "FCM_PLUGIN_ACTIVITY",
                            title: notificationData.title,
                            body: notificationData.text ? notificationData.text : notificationData.message,
                            icon: 'stock_ticker_update',
                            color: '#f45342'
                        }
                    },
                    token: notificationData.deviceId
                }

                let pushToDevice = await this.sendMessage(pushNotificationRelatedInformation)

                return resolve(pushToDevice)


            } catch (error) {
                return reject(error);
            }
        })
    }

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
                }

                let pushToFcmToken = await this.sendMessage(pushNotificationRelatedInformation)

                return resolve(pushToFcmToken);

            } catch (error) {
                return reject(error)
            }
        })
    }

    static sendMessage(notificationInformation) {

        return new Promise(async (resolve, reject) => {
            try {

                let deviceId = notificationInformation.token;

                FCM.send(notificationInformation, (err, response) => {

                    let success;
                    let message = "";
                    if (err) {
                        if (err.errorInfo && err.errorInfo.message) {
                            if (err.errorInfo.message == "The registration token is not a valid FCM registration token") {

                                slackClient.pushNotificationError({
                                    "code": err.errorInfo.code,
                                    "message": err.errorInfo.message,
                                })

                                message = err.errorInfo.message;
                            }
                        }

                        success = false;

                        console.log(`Failed to send to deviceid : ${deviceId}`)

                    } else {
                        success = true
                    }

                    return resolve({
                        success: success,
                        message: message
                    })
                });

            } catch (error) {
                return reject(error)
            }
        })

    }

    static subscribeToTopic(subscribeData) {

        return new Promise(async (resolve, reject) => {

            try {

                let success;

                FCM.subscribeToTopic(subscribeData.deviceId, nodeEnvironment + "-" + subscribeData.topic, function (err, response) {
                    if (err) {
                        success = false;
                        slackClient.pushNotificationError({
                            "code": err.errorInfo.code,
                            "message": err.errorInfo.message
                        })
                    } else {
                        success = true;
                    }

                    return resolve({
                        success: success
                    })
                })



            } catch (error) {
                return reject(error)
            }


        })

    }

    static unsubscribeFromTopic(unsubscribeData) {

        return new Promise(async (resolve, reject) => {

            try {

                let success;

                FCM.unsubscribeFromTopic(unsubscribeData.deviceId, nodeEnvironment + "-" + unsubscribeData.topic, function (err, response) {
                    if (err) {
                        success = false;

                        slackClient.pushNotificationError({
                            "code": err.errorInfo.code,
                            "message": err.errorInfo.message
                        })
                    } else {
                        success = true;
                    }

                    return resolve({
                        success: success
                    })
                })


            } catch (error) {
                return reject(error)
            }


        })

    }

};