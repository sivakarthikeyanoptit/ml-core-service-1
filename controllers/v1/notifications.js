/**
 * name : notifications.js
 * author : Aman Jung Karki
 * Date : 06-Nov-2019
 * Description : Notification related information for samiksha service.
 */
const csv = require('csvtojson');
const notificationsHelper = require(ROOT_PATH + "/module/notifications/helper");
const userExtensionHelper = require(ROOT_PATH + "/module/user-extension/helper");
const pushNotificationsHelper = require(ROOT_PATH + "/module/push-notifications/helper");
const FileStream = require(ROOT_PATH + "/generics/file-stream");

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


    /**
     * @api {post} /kendra/api/v1/notifications/registerDevice Register a Device Id
     * @apiVersion 1.0.0
     * @apiName Register a Device Id
     * @apiGroup Notifications
     * @apiParamExample {json} Request-Body:
     * 
     *   {
     *       "deviceId" : "123123123"
     *   }
     *
     * @apiHeader {String} X-authenticated-user-token Authenticity token
     * @apiHeader {String} app
     * @apiHeader {String} os
     * @apiSampleRequest /kendra/api/v1/notifications/registerDevice  
     * @apiUse successBody
     * @apiUse errorBody
     * @apiParamExample {json} Response:
     * {
      "message": "successfully registered device id",
      "status": 200
       }
    */

    async registerDevice(req) {
        return new Promise(async (resolve, reject) => {

            try {

                let deviceData = {
                    deviceId: req.body.deviceId,
                    app: req.headers.app,
                    os: req.headers.os
                }

                let result = await userExtensionHelper.createOrUpdate(deviceData, req.userDetails);


                return resolve({
                    message: "successfully registered device id",
                });

            } catch (error) {

                return reject({
                    status: error.status || 500,
                    message: error.message || "Oops! something went wrong.",
                    errorObject: error
                })

            }
        })

    }


    /**
     * @api {post} /kendra/api/v1/notifications/pushToUsers  Push Notifications To Users
     * @apiVersion 1.0.0
     * @apiName Push Notifications To Users
     * @apiGroup Notifications
     * @apiHeader {String} X-authenticated-user-token Authenticity token
     * @apiSampleRequest /kendra/api/v1/notifications/pushToUsers
     * @apiUse successBody
     * @apiUse errorBody
     */

    async pushToUsers(req) {

        return new Promise(async (resolve, reject) => {

            try {

                let userData = await csv().fromString(req.files.userData.data.toString());

                const fileName = `status`;
                let fileStream = new FileStream(fileName);
                let input = fileStream.initStream();

                (async function () {
                    await fileStream.getProcessorPromise();
                    return resolve({
                        isResponseAStream: true,
                        fileNameWithPath: fileStream.fileNameWithPath()
                    });
                })();

                await Promise.all(userData.map(async element => {

                    let userProfile = await userExtensionHelper.profileWithEntityDetails({
                        userId: element.userId,
                        status: "active",
                        isDeleted: false
                    })

                    let deviceArray = userProfile.devices;

                    await Promise.all(deviceArray.map(async device => {

                        if (device.app == element.appName && device.status != "inactive") {

                            let message;
                            let notificationResult;

                            if (device.os == "android") {

                                device.message = element.message;
                                notificationResult = await pushNotificationsHelper.createNotificationInAndroid(device);

                            } else if (device.os == "ios") {

                                device.message = element.message;
                                notificationResult = await pushNotificationsHelper.createNotificationInIos(device);
                            }


                            if (notificationResult !== undefined && notificationResult.success === false) {
                                element.status = "fail"
                                input.push(element);
                            } else {
                                element.status = "success"
                                input.push(element);
                            }
                        }

                    }));
                }))

                input.push(null)


            } catch (error) {

                return reject({
                    status: error.status || 500,
                    message: error.message || "Oops! something went wrong.",
                    errorObject: error
                })

            }
        })

    }


    /**
    * @api {post} /kendra/api/v1/notifications/pushToTopic
    * @apiVersion 1.0.0
    * @apiName push notification to topic
    * @apiGroup Notifications
    * @apiSampleRequest /kendra/api/v1/notifications/pushToTopic
    * @apiUse successBody
    * @apiUse errorBody
    */

    async pushToTopic(req) {
        return new Promise(async (resolve, reject) => {

            try {

                let userData = await csv().fromString(req.files.userData.data.toString());

                await Promise.all(userData.map(async element => {

                    let notificationResult = await pushNotificationsHelper.pushToDeviceId(element);

                }))

                return resolve({
                    message: "successfully sent notifications to users",
                });

            } catch (error) {

                return reject({
                    status: error.status || 500,
                    message: error.message || "Oops! something went wrong.",
                    errorObject: error
                })

            }
        })

    }


    /**
    * @api {post} /kendra/api/v1/notifications/pushToAllUsers
    * @apiVersion 1.0.0
    * @apiName push notification to all users
    * @apiGroup Notifications
    * @apiSampleRequest /kendra/api/v1/notifications/pushToAllUsers
    * @apiUse successBody
    * @apiUse errorBody
    */

    async pushToAllUsers(req) {
        return new Promise(async (resolve, reject) => {

            try {

                let userData = await csv().fromString(req.files.userData.data.toString());

                await Promise.all(userData.map(async element => {

                    let notificationResult = await pushNotificationsHelper.pushToDeviceId(element);

                }))

                return resolve({
                    message: "successfully sent notifications to users",
                });

            } catch (error) {

                return reject({
                    status: error.status || 500,
                    message: error.message || "Oops! something went wrong.",
                    errorObject: error
                })

            }
        })

    }

};

