/**
 * name : notifications.js
 * author : Aman Jung Karki
 * created-date : 06-Nov-2019
 * modified-date:25-Nov-2019
 * Description : Notification related information for samiksha service.
 */

const notificationsHelper = require(ROOT_PATH + "/module/notifications/in-app/helper");
const csv = require('csvtojson');

module.exports = class InApp {

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
        return "notifications";
    }

    /**
    * @api {get} /kendra/api/v1/notifications/in-app/list?page=:page&limit=:limit Notifications List
    * @apiVersion 1.0.0
    * @apiName Notifications List
    * @apiGroup Notifications
    * @apiSampleRequest /kendra/api/v1/notifications/in-app/list?page=1&limit=10
    * @apiHeader {String} X-authenticated-user-token Authenticity token  
    * @apiUse successBody
    * @apiUse errorBody
    */

    async list(req) {
        return new Promise(async (resolve, reject) => {

            try {

                let notificationDocument = await notificationsHelper.list((req.params._id && req.params._id != "") ? req.params._id : req.userDetails.id, req.pageSize, req.pageNo, (req.query.appName && req.query.appName != "") ? req.query.appName : "", req.headers)

                return resolve({
                    result: notificationDocument,
                    message: req.t('notificationList')
                })

            } catch (error) {
                return reject({
                    status: error.status || httpStatusCode["internal_server_error"].status,
                    message: error.message || httpStatusCode["internal_server_error"].message
                })
            }
        })
    }

    /**
    * @api {get} /kendra/api/v1/notifications/in-app/unReadCount Count of Unread Notifications
    * @apiVersion 1.0.0
    * @apiName Count of Unread Notifications
    * @apiGroup Notifications
    * @apiSampleRequest /kendra/api/v1/notifications/in-app/unReadCount
    * @apiHeader {String} X-authenticated-user-token Authenticity token  
    * @apiUse successBody
    * @apiUse errorBody
    */

    async unReadCount(req) {
        return new Promise(async (resolve, reject) => {
            try {

                let unReadCountDocument = await notificationsHelper.unReadCount(req.userDetails.id, (req.query.appName && req.query.appName != "") ? req.query.appName : "", req.headers)

                return resolve({
                    message: req.t('unreadNotifocation'),
                    status: httpStatusCode.ok.status,
                    result: {
                        count: unReadCountDocument.count,
                        data: unReadCountDocument.data
                    }
                })

            } catch (error) {
                reject({
                    status: error.status || httpStatusCode["internal_server_error"].status,
                    message: error.message || httpStatusCode["internal_server_error"].message
                })
            }
        })
    }

    /**
     * @api {post} /kendra/api/v1/notifications/in-app/markAsRead/{{notificationId}} Mark a Notification Read
     * @apiVersion 1.0.0
     * @apiName Mark a Notification Read
     * @apiGroup Notifications
     * @apiSampleRequest /kendra/api/v1/notifications/in-app/markAsRead/1
     * @apiUse successBody
     * @apiUse errorBody
     */

    async markAsRead(req) {
        return new Promise(async (resolve, reject) => {

            try {


                await notificationsHelper.markAsRead(req.userDetails.id, req.params._id, (req.query.appName && req.query.appName != "") ? req.query.appName : "")

                return resolve({
                    message: req.t('markItReadNotification'),
                    status: httpStatusCode.ok.status
                })
            } catch (error) {
                reject({
                    status: error.status || httpStatusCode["internal_server_error"].status,
                    message: error.message || httpStatusCode["internal_server_error"].message
                })
            }
        })

    }

    /**
     * @api {post} /kendra/api/v1/notifications/in-app/updateVersion Upload app version
     * @apiVersion 1.0.0
     * @apiName Upload app version
     * @apiGroup Notifications
     * @apiSampleRequest /kendra/api/v1/notifications/in-app/updateVersion
     * @apiParam {File} updateVersion Mandatory updateVersion file of type CSV.     
     * @apiUse successBody
     * @apiUse errorBody
     */

    async updateVersion(req) {
        return new Promise(async (resolve, reject) => {

            try {

                if (!req.files || !req.files.updateVersion) {
                    throw { message: "Missing file of type updateVersion" }
                }

                let updateVersionData = await csv().fromString(req.files.updateVersion.data.toString());

                await notificationsHelper.updateAppVersion(updateVersionData)

                return resolve({
                    message: "Successfully Uploaded Version",
                    status: httpStatusCode.ok.status
                })
            } catch (error) {
                reject({
                    status: error.status || httpStatusCode["internal_server_error"].status,
                    message: error.message || httpStatusCode["internal_server_error"].message
                })
            }
        })

    }

};

