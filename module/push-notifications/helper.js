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
                    let message = "";
                    if (err) {
                        if (err.errorInfo && err.errorInfo.message) {
                            if (err.errorInfo.message == "The registration token is not a valid FCM registration token") {
                                message = err.errorInfo.message;
                            }
                        }

                        success = false;
                        // throw "Failed to push the notification"
                    } else {
                      
                        success = true
<<<<<<< HEAD

=======
>>>>>>> 449f564da0b8837335633ef5a29744d74f1a652a
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

};