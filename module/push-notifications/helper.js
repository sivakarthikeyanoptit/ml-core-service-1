let fcmNotification = require('fcm-notification'); // load firebase notification
// let fcm = new fcmNotification(ROOT_PATH + process.env.FIREBASE_KEYSTORE);

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

    static createNotificationInAndroid(req) {
        return new Promise(async (resolve, reject) => {
            try {

                let pushNotificationRelatedInformation = {
                    android: {
                        ttl: 3600 * 1000, // 1 hour in milliseconds
                        priority: 'normal',
                        notification: {
                            title: 'Android',
                            body: 'For Android phone',
                            icon: 'stock_ticker_update',
                            color: '#f45342'
                        }
                    },
                    topic: "android"
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

    static createNotificationInIos(req) {
        return new Promise(async (resolve, reject) => {
            try {

                let pushNotificationRelatedInformation = {
                    topic: "ios",
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

    static pushToDeviceId(fcm_token) {
        return new Promise(async (resolve, reject) => {
            try {

                var token = fcm_token;

                let pushNotificationRelatedInformation = {
                    token: token,
                    notification: {
                        title: "Kendra Service",
                        body: "This is a Kendra service"
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

    static sendMessage(notificationRelatedInformation) {

        return new Promise(async (resolve, reject) => {
            try {

                fcm.send(notificationRelatedInformation, (err, response) => {
                    if (err) {
                        console.log('error::: ', err)
                        throw "Failed to push the notification"
                    } else {
                        console.log('In push notification')
                        console.log('response::: ', response)
                        return resolve({
                            success: true
                        })
                    }
                });

            } catch (error) {

            }
        })


        // Send a message to devices subscribed to the provided topic.

        // fcm.send(message, function (err, response) {
        //     if (err) {
        //         console.log('error::: ', err);
        //         return "ERROR";
        //     } else {
        //         console.log('response::: ', response);
        //         return response;
        //     }
        // });
    }

};