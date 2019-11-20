let fcmNotification = require('fcm-notification'); // load firebase notification
const fcm_token_path = require(ROOT_PATH + "/config/fcm_keystore.json"); //read firebase token from the file
let FCM = new fcmNotification(fcm_token_path);

module.exports = class notificationsHelper {

    static createNotificationForAllUser(req) {
        return new Promise(async (resolve, reject) => {
            try {

                let pushNotificationRelatedInformation = {
                    topic: "allUsers",
                    notification: {
                        title: "Kendra Service",
                        body: "This is a Kendra service"
                    },
                    data: {
                        welcomeMsg: "Welcome to Kendra "
                    }
                }

                let pushToTopicData = await this.sendMessage(pushNotificationRelatedInformation)

                if (pushToTopicData.success) {
                    return resolve({
                        message: req.t('pushNotificationSuccess')
                    })
                }

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
                        data: {},
                        notification: {
                            title: 'kendra service',
                            body: notificationData.message,
                            icon: 'stock_ticker_update',
                            color: '#f45342'
                        },
                    },
                    token: notificationData.deviceId
                }

                let pushToTopicData = await this.sendMessage(pushNotificationRelatedInformation);

                return resolve(pushToTopicData)

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
                            title: "Kendra Service",
                            body: notificationData.message
                        },
                        data: {
                            welcomeMsg: "Welcome to Kendra "
                        }
                    },
                    token: notificationData.deviceId
                }

                let pushToTopicData = await this.sendMessage(pushNotificationRelatedInformation)

                if (pushToTopicData.success) {
                    return resolve({
                        message: req.t('pushNotificationSuccess')
                    })
                }

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
                        title: "Kendra Service",
                        body: notificationData.message
                    },
                    data: {
                        welcomeMsg: "Welcome to Kendra "
                    }
                }

                let pushToFcmToken = await this.sendMessage(pushNotificationRelatedInformation)

                if (pushToFcmToken.success) {
                    return resolve({
                        message: req.t('pushNotificationSuccess')
                    })
                }

            } catch (error) {
                return reject(error)
            }
        })
    }

    static sendMessage(notificationInformation) {

        return new Promise(async (resolve, reject) => {
            try {

                FCM.send(notificationInformation, (err, response) => {

                    let success;
                    if (err) {
                        //  console.log('error::: ', err)

                        success = false;
                        // throw "Failed to push the notification"
                    } else {
                        console.log('In push notification')
                        console.log('response::: ', response)

                        success = true

                    }

                    return resolve({
                        success: success
                    })
                });

            } catch (error) {
                return reject(error)
            }
        })

    }

};