/**
 * name : push-notifications.js
 * author : Aman Jung Karki
 * Date : 07-Nov-2019
 */

const pushNotificationsHelper = require(ROOT_PATH + "/module/push-notifications/helper");

module.exports = class PushNotifications {

    /**
     * @apiDefine errorBody
     * @apiError {String} status 4XX,5XX
     * @apiError {String} message Error
     */

    /**
     * @apiDefine successBody
     * @apiSuccess {String} status 200
     * @apiSuccess {String} result Data
     */

    constructor() {
    }

    static get name() {
        return "push-notifications";
    }

    /**
    * @api {get} /kendra/api/v1/pushNotifications/create Create Push Notifications 
    * @apiVersion 1.0.0
    * @apiName Create Push Notifications 
    * @apiGroup Push Notifications
    * @apiSampleRequest /kendra/api/v1/pushNotifications/create
    * @apiHeader {String} X-authenticated-user-token Authenticity token  
    * @apiUse successBody
    * @apiUse errorBody
    */

    async createNotificationForAllUser(req) {
        return new Promise(async (resolve, reject) => {

            try {

                let pushNotificationDocument = await pushNotificationsHelper.createNotificationForAllUser(req)

                return resolve({
                    // result: pushNotificationDocument,
                    message: pushNotificationDocument.message
                })

            } catch (error) {
                return reject({
                    status: error.status || 500,
                    message: error.message || "Oops! something went wrong."
                })
            }
        })
    }

    async createNotificationInAndroid(req) {
        return new Promise(async (resolve, reject) => {

            try {

                let pushNotificationDocument = await pushNotificationsHelper.createNotificationInAndroid(req)

                return resolve({
                    // result: pushNotificationDocument,
                    message: pushNotificationDocument.message
                })

            } catch (error) {
                return reject({
                    status: error.status || 500,
                    message: error.message || "Oops! something went wrong."
                })
            }
        })
    }

    async createNotificationInIos(req) {
        return new Promise(async (resolve, reject) => {

            try {

                let pushNotificationDocument = await pushNotificationsHelper.createNotificationInIos(req)

                return resolve({
                    // result: pushNotificationDocument,
                    message: pushNotificationDocument.message
                })

            } catch (error) {
                return reject({
                    status: error.status || 500,
                    message: error.message || "Oops! something went wrong."
                })
            }
        })
    }

    async pushToDeviceId(req) {
        return new Promise(async (resolve, reject) => {

            try {

                let pushNotificationDocument = await pushNotificationsHelper.pushToDeviceId(req.params._id)

                return resolve({
                    // result: pushNotificationDocument,
                    message: pushNotificationDocument.message
                })

            } catch (error) {
                return reject({
                    status: error.status || 500,
                    message: error.message || "Oops! something went wrong."
                })
            }
        })
    }

};