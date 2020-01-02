/**
 * name : notifications.js
 * author : Aman Jung Karki
 * created-date : 06-Nov-2019
 * modified-date:25-Nov-2019
 * Description : Notification related information for samiksha service.
 */


/**
* dependencies
*/
const notificationsHelper = require(MODULES_BASE_PATH + "/notifications/in-app/helper");

/**
    * In-App Notifications
    * @class
*/
module.exports = class InAppNotifications {

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

    constructor() {}

    static get name() {
        return "notifications";
    }

    /**
    * @api {get} /kendra/api/v1/notifications/in-app/list?page=:page&limit=:limit 
    * List in-app Notifications
    * @apiVersion 1.0.0
    * @apiGroup inAppNotifications
    * @apiSampleRequest /kendra/api/v1/notifications/in-app/list?page=1&limit=10
    * @apiHeader {String} X-authenticated-user-token Authenticity token  
    * @apiUse successBody
    * @apiUse errorBody
    */

     /**
      * List all notifications data. 
      * Notifications data may consists of push notifications or in-app notifications.
      * @method
      * @name list
      * @param  {Request} req request body.
      * @returns {JSON} Response with message and result. 
      * Result is an object consisting of data and count.
    */

    async list(req) {
        return new Promise(async (resolve, reject) => {

            try {

                let notificationDocument = 
                await notificationsHelper.list(
                    (req.params._id && req.params._id != "") ? 
                    req.params._id 
                    : req.userDetails.id, 
                    req.pageSize, 
                    req.pageNo, 
                    (req.query.appName && req.query.appName != "") ? 
                    req.query.appName : "",
                    req.headers
                    );

                return resolve({
                    result: notificationDocument,
                    message: req.t('notificationList')
                });

            } catch (error) {
                return reject({
                    status: 
                    error.status || 
                    httpStatusCode["internal_server_error"].status,

                    message: 
                    error.message || 
                    httpStatusCode["internal_server_error"].message
                });
            }
        })
    }

    /**
    * @api {get} /kendra/api/v1/notifications/in-app/unReadCount 
    * Count Unread Notifications
    * @apiVersion 1.0.0
    * @apiGroup inAppNotifications
    * @apiSampleRequest /kendra/api/v1/notifications/in-app/unReadCount
    * @apiHeader {String} X-authenticated-user-token Authenticity token  
    * @apiUse successBody
    * @apiUse errorBody
    */

    /**
      * Get the count of all unRead notifications.
      * @method
      * @name unReadCount
      * @param  {Request} req request body.
      * @returns {JSON} Response consists of count and data (which is an array) of app update.
    */

    async unReadCount(req) {
        return new Promise(async (resolve, reject) => {
            try {

                let unReadCountDocument = 
                await notificationsHelper.unReadCount(
                    req.userDetails.id, 
                    (req.query.appName && req.query.appName != "") ?
                     req.query.appName : "",
                     req.headers);

                return resolve({
                    message: req.t('unreadNotifocation'),
                    status: httpStatusCode.ok.status,
                    result: {
                        count: unReadCountDocument.count,
                        data: unReadCountDocument.data
                    }
                });

            } catch (error) {
                reject({
                    status: 
                    error.status || 
                    httpStatusCode["internal_server_error"].status,

                    message: 
                    error.message 
                    || httpStatusCode["internal_server_error"].message
                });
            }
        })
    }

    /**
     * @api {post} /kendra/api/v1/notifications/in-app/markAsRead/{{notificationId}} 
     * Mark as Notification Read
     * @apiVersion 1.0.0
     * @apiGroup inAppNotifications
     * @apiSampleRequest /kendra/api/v1/notifications/in-app/markAsRead/1
     * @apiUse successBody
     * @apiUse errorBody
     */

    /**
      * mark is_read true for particular notification.
      * @method
      * @name markAsRead
      * @param  {Request} req request body.
      * @returns {JSON} Response consists of message and status code.
    */

    async markAsRead(req) {
        return new Promise(async (resolve, reject) => {

            try {


                await notificationsHelper.markItRead(
                    req.userDetails.id, 
                    req.params._id, 
                    (req.query.appName && req.query.appName != "") ? 
                    req.query.appName : "");

                return resolve({
                    message: req.t('markItReadNotification'),
                    status: httpStatusCode.ok.status
                });
            } catch (error) {
                reject({
                    status: 
                    error.status || 
                    httpStatusCode["internal_server_error"].status,

                    message: 
                    error.message 
                    || httpStatusCode["internal_server_error"].message
                });
            }
        })

    }

    /**
     * @api {post} /kendra/api/v1/notifications/in-app/updateVersion 
     * Upload latest app version
     * @apiVersion 1.0.0
     * @apiGroup inAppNotifications
     * @apiSampleRequest /kendra/api/v1/notifications/in-app/updateVersion
     * @apiParam {File} updateVersion Mandatory updateVersion file of type CSV.     
     * @apiUse successBody
     * @apiUse errorBody
     */

    /**
      * Update existing version.Upload csv to update the version.
      * @method
      * @name updateVersion
      * @param  {Request} req request body.
      * @returns {JSON} Response consists of message and status code.
    */

    async updateVersion(req) {
      return new Promise(async (resolve, reject) => {

          try {

            if (!req.files || !req.files.updateVersion) {
                throw { message: "Missing file of type updateVersion" }
            }

            let updateVersionData = 
            await csv().fromString(req.files.updateVersion.data.toString());

            await notificationsHelper.updateAppVersion(updateVersionData);

            return resolve({
                message: "Successfully Uploaded Version",
                status: httpStatusCode.ok.status
            })
        } catch (error) {
            reject({
                status: 
                error.status || 
                httpStatusCode["internal_server_error"].status,

                message: 
                error.message || 
                httpStatusCode["internal_server_error"].message
            })
        }
    })

    }

    // TODO:: This is a dirty fix.
    // Required only for testing purpose. To clear the index given.

    async deleteBasedOnIndex(req) {
      return new Promise(async (resolve, reject) => {

        try {

            await elasticsearch.client.indices.delete({
                index: req.params._id
            })

            return resolve({
                message: "Successfully deleted",
                status: httpStatusCode.ok.status
            })
        } catch (error) {
            reject({
                status: 
                error.status ||
                httpStatusCode["internal_server_error"].status,

                message: 
                error.message || 
                httpStatusCode["internal_server_error"].message
            })
        }
      })

    }

};

