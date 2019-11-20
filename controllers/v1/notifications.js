/**
 * name : notifications.js
 * author : Aman Jung Karki
 * Date : 06-Nov-2019
 * Description : Notification related information for samiksha service.
 */

const notificationsHelper = require(ROOT_PATH + "/module/notifications/helper");
const samikshaIndexName = (process.env.ELASTICSEARCH_SAMIKSHA_INDEX && process.env.ELASTICSEARCH_SAMIKSHA_INDEX != "") ? process.env.ELASTICSEARCH_SAMIKSHA_INDEX : "samiksha"


module.exports = class Notifications {

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
    * @api {get} /kendra/api/v1/notifications/list?page=:page&limit=:limit Notifications List
    * @apiVersion 1.0.0
    * @apiName Notifications List
    * @apiGroup Notifications
    * @apiSampleRequest /kendra/api/v1/notifications/list?page=1&limit=10
    * @apiHeader {String} X-authenticated-user-token Authenticity token  
    * @apiUse successBody
    * @apiUse errorBody
    */

    async list(req) {
        return new Promise(async (resolve, reject) => {

            try {

                let notificationDocument = await notificationsHelper.list((req.params._id && req.params._id != "") ? req.params._id : req.userDetails.id, req.pageSize, req.pageNo, (req.query.appName && req.query.appName != "") ? req.query.appName : "")

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
    * @api {get} /kendra/api/v1/notifications/unReadCount Count of Unread Notifications
    * @apiVersion 1.0.0
    * @apiName Count of Unread Notifications
    * @apiGroup Notifications
    * @apiSampleRequest /kendra/api/v1/notifications/unReadCount
    * @apiHeader {String} X-authenticated-user-token Authenticity token  
    * @apiUse successBody
    * @apiUse errorBody
    */

    async unReadCount(req) {
        return new Promise(async (resolve, reject) => {
            try {

                let unReadCountDocument = await notificationsHelper.unReadCount(req.userDetails.id, (req.query.appName && req.query.appName != "") ? req.query.appName : "")

                return resolve({
                    message: req.t('unreadNotifocation'),
                    status: httpStatusCode.ok.status,
                    result: {
                        count: unReadCountDocument.count
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
     * @api {post} /kendra/api/v1/notifications/markItRead/{{notificationId}} Mark a Notification Read
     * @apiVersion 1.0.0
     * @apiName Mark a Notification Read
     * @apiGroup Notifications
     * @apiSampleRequest /kendra/api/v1/notifications/markItRead/1
     * @apiUse successBody
     * @apiUse errorBody
     */

    async markItRead(req) {
        return new Promise(async (resolve, reject) => {

            try {


                await notificationsHelper.markItRead(req.userDetails.id, req.params._id, (req.query.appName && req.query.appName != "") ? req.query.appName : "")

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

    async create(req) {
        return new Promise(async (resolve, reject) => {
            try {
                let createdData = await notificationsHelper.create(req.userDetails.id, req.body)

                return resolve(createdData)
            } catch (error) {
                reject(error)
            }
        })
    }

    async search() {
        return new Promise(async (resolve, reject) => {
            try {
                let searchData = await notificationsHelper.search()

                return resolve({ result: searchData })
            }
            catch (error) {
                reject(error)
            }
        })
    }

    async deleteAllIndex() {
        return new Promise(async (resolve, reject) => {
            try {
                const userNotificationDocCreation = await elasticsearch.client.indices.delete({
                    index: "sl-languages-dev"
                })

                return resolve({
                    status: userNotificationDocCreation.statusCode
                })
            } catch (error) {
                return reject(error)
            }
        })
    }

};



