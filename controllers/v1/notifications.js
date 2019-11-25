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
        "status": 200,
        "result": {
            "allUsers": "Subscribed",
            "all-samiksha-users": "Subscribed",
            "all-samiksha-android-users": "Subscribed"
        }
}
    */

    async registerDevice(req) {
        return new Promise(async (resolve, reject) => {

            try {

                let deviceData = {
                    deviceId: req.body.deviceId,
                    app: req.headers.app,
                    os: req.headers.os,
                    status: "active",
                    activatedAt: new Date()
                }

                let result = await userExtensionHelper.createOrUpdate(deviceData, _.pick(req.userDetails, ["userId", "email", "userName"]));

                let response = {};
                if (result && result.success) {

                    response["result"] = {}

                    let topicArray = ["allUsers", "all-" + deviceData.app + "-users", "all-" + deviceData.app + "-" + deviceData.os + "-users"];

                    await Promise.all(topicArray.map(async topicName => {

                        deviceData.topic = topicName;
                        let subscribeResult = await pushNotificationsHelper.subscribeToTopic(_.pick(deviceData, ["deviceId", "topic"]));

                        response["result"][topicName] = subscribeResult.success ? "Subscribed" : "Could not subscribee"

                    }))
                } else {
                    response["status"] = 200
                }

                return resolve(response);

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
     * @apiParam {File} userData Mandatory userData file of type CSV.
     * @apiSampleRequest /kendra/api/v1/notifications/pushToUsers
     * @apiUse successBody
     * @apiUse errorBody
     */

    async pushToUsers(req) {

        return new Promise(async (resolve, reject) => {

            try {

                if (!req.files || !req.files.userData) {
                    throw { message: "Missing file of type userData" }
                }

                let userData = await csv().fromString(req.files.userData.data.toString());

                const fileName = `push-to-device`;
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

                    let userProfile = await userExtensionHelper.userExtensionDocument({
                        userId: element.userId,
                        status: "active",
                        isDeleted: false
                    }, {
                            devices: 1
                        })

                    if (userProfile.devices.length > 0) {

                        let deviceArray = userProfile.devices;

                        await Promise.all(deviceArray.map(async device => {

                            if (device.app == element.appName && device.status !== "inactive") {

                                let notificationResult;

                                device.message = element.message;
                                device.title = element.title;

                                if (element.message && element.title) {
                                    notificationResult = await pushNotificationsHelper.createNotificationInAndroid(device);

                                    if (notificationResult !== undefined && notificationResult.success) {

                                        let updateStatus = await userExtensionHelper.updateDeviceStatus(device, deviceArray, element.userId)

                                        //unsubscribe the deviceId from the topic
                                        let topicArray = ["allUsers", "all-" + device.app + "-users", "all-" + device.app + "-" + device.os + "-users"];

                                        await Promise.all(topicArray.map(async topicName => {

                                            device.topic = topicName;
                                            let unsubscribeResult = await pushNotificationsHelper.unsubscribeFromTopic(device)
                                        }))

                                        element.status = "Success"

                                    }
                                    else {

                                        element.status = "Fail"
                                    }

                                }
                                else {
                                    element.status = "Message or title is not present in csv"
                                }

                            } else {
                                element.status = "App name could not be found and status is inactive"
                            }

                        }));

                    } else {
                        element.status = "Devices could not be found for the given user"
                    }


                    input.push(element)

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
    * @api {post} /kendra/api/v1/notifications/pushToTopic Push Notification to topic
    * @apiVersion 1.0.0
    * @apiName Push Notification to topic
    * @apiGroup Notifications
    * @apiSampleRequest /kendra/api/v1/notifications/pushToTopic
    * @apiParam {File} pushToTopic Mandatory pushToTopic file of type CSV.    
    * @apiUse successBody
    * @apiUse errorBody
    */

    async pushToTopic(req) {
        return new Promise(async (resolve, reject) => {

            try {

                if (!req.files || !req.files.pushToTopic) {
                    throw { message: "Missing file of type pushToTopic" }
                }

                let topicData = await csv().fromString(req.files.pushToTopic.data.toString());

                const fileName = `push-to-topic`;
                let fileStream = new FileStream(fileName);
                let input = fileStream.initStream();

                (async function () {
                    await fileStream.getProcessorPromise();
                    return resolve({
                        isResponseAStream: true,
                        fileNameWithPath: fileStream.fileNameWithPath()
                    });
                })();

                await Promise.all(topicData.map(async element => {

                    if (element.message && element.title) {
                        let topicResult = await pushNotificationsHelper.pushToTopic(element);

                        if (topicResult !== undefined && topicResult.success) {

                            element.status = "success"

                        } else {
                            element.status = "Fail"
                        }

                    } else {

                        element.status = "Fail"
                    }

                    input.push(element)

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
    * @api {post} /kendra/api/v1/notifications/pushToAllUsers  Push Notification To ALL Users
    * @apiVersion 1.0.0
    * @apiName Push Notification To ALL Users Topic
    * @apiGroup Notifications
    * @apiSampleRequest /kendra/api/v1/notifications/pushToAllUsers
    * @apiHeader {String} X-authenticated-user-token Authenticity token
    * @apiParam {File} pushToAllUsers Mandatory pushToAllUsers file of type CSV.        
    * @apiUse successBody
    * @apiUse errorBody
    */

    async pushToAllUsers(req) {
        return new Promise(async (resolve, reject) => {

            try {

                if (!req.files || !req.files.pushToAllUsers) {
                    throw { message: "Missing file of type pushToAllUsers" }
                }

                let pushToAllUsers = await csv().fromString(req.files.pushToAllUsers.data.toString());

                const fileName = `push-to-all-users`;
                let fileStream = new FileStream(fileName);
                let input = fileStream.initStream();

                (async function () {
                    await fileStream.getProcessorPromise();
                    return resolve({
                        isResponseAStream: true,
                        fileNameWithPath: fileStream.fileNameWithPath()
                    });
                })();


                await Promise.all(pushToAllUsers.map(async element => {

                    if (!element.topicName) {
                        element.topicName = "allUsers"
                    }

                    if (element.message && element.title) {
                        let topicResult = await pushNotificationsHelper.pushToTopic(element);

                        if (topicResult !== undefined && topicResult.success) {

                            element.status = "success"

                        } else {
                            element.status = "Fail"
                        }
                    }
                    else {
                        element.status = "Message or title is not present in csv."
                    }

                    input.push(element)

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
    * @api {post} /kendra/api/v1/notifications/subscribeToTopic  Subscribe To Topic
    * @apiVersion 1.0.0
    * @apiName Subscribe To Topic
    * @apiGroup Notifications
    * @apiSampleRequest /kendra/api/v1/notifications/subscribeToTopic
    * @apiHeader {String} X-authenticated-user-token Authenticity token
    * @apiParam {File} subscribeToTopic Mandatory subscribeToTopic file of type CSV.            
    * @apiUse successBody
    * @apiUse errorBody
    */

    async subscribeToTopic(req) {
        return new Promise(async (resolve, reject) => {

            try {

                if (!req.files || !req.files.subscribeToTopic) {
                    throw { message: "Missing file of type subscribeToTopic" }
                }

                let subscribersData = await csv().fromString(req.files.subscribeToTopic.data.toString());

                const fileName = `subscribe-to-topic`;
                let fileStream = new FileStream(fileName);
                let input = fileStream.initStream();

                (async function () {
                    await fileStream.getProcessorPromise();
                    return resolve({
                        isResponseAStream: true,
                        fileNameWithPath: fileStream.fileNameWithPath()
                    });
                })();


                await Promise.all(subscribersData.map(async subscriber => {

                    let userProfile = await userExtensionHelper.userExtensionDocument({
                        userId: subscriber.userId,
                        status: "active",
                        isDeleted: false
                    }, {
                            devices: 1
                        })

                    if (userProfile.devices.length > 0) {

                        let deviceArray = userProfile.devices;

                        await Promise.all(deviceArray.map(async device => {

                            if (device.app == subscriber.appName && device.os == subscriber.os && device.status == "active") {

                                device.topic = subscriber.topicName;

                                let subscribeResult = await pushNotificationsHelper.subscribeToTopic(device)

                                if (subscribeResult !== undefined && subscribeResult.success) {

                                    subscriber.status = "success"

                                } else {
                                    subscriber.status = "Fail"
                                }

                                input.push(subscriber)

                            }
                        }))

                    }
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
    * @api {post} /kendra/api/v1/notifications/unsubscribeFromTopic  Unsubscribe From Topic
    * @apiVersion 1.0.0
    * @apiName Unsubscribe From Topic
    * @apiGroup Notifications
    * @apiSampleRequest /kendra/api/v1/notifications/unsubscribeFromTopic
    * @apiHeader {String} X-authenticated-user-token Authenticity token
    * @apiParam {File} unsubscribeFromTopic Mandatory unsubscribeFromTopic file of type CSV.                
    * @apiUse successBody
    * @apiUse errorBody
    */

    async unsubscribeFromTopic(req) {
        return new Promise(async (resolve, reject) => {

            try {

                if (!req.files || !req.files.unsubscribeFromTopic) {
                    throw { message: "Missing file of type subscribeToTopic" }
                }

                let unsubscribersData = await csv().fromString(req.files.unsubscribeFromTopic.data.toString());

                const fileName = `unsubscribe-from-topic`;
                let fileStream = new FileStream(fileName);
                let input = fileStream.initStream();

                (async function () {
                    await fileStream.getProcessorPromise();
                    return resolve({
                        isResponseAStream: true,
                        fileNameWithPath: fileStream.fileNameWithPath()
                    });
                })();


                await Promise.all(unsubscribersData.map(async unsubscriber => {

                    let userProfile = await userExtensionHelper.userExtensionDocument({
                        userId: unsubscriber.userId,
                        status: "active",
                        isDeleted: false
                    }, {
                            devices: 1
                        })

                    if (userProfile.devices.length > 0) {

                        let deviceArray = userProfile.devices;

                        await Promise.all(deviceArray.map(async device => {

                            if (device.app == unsubscriber.appName && device.os == unsubscriber.os && device.status == "inactive") {

                                device.topic = unsubscriber.topicName;

                                let unsubscribeResult = await pushNotificationsHelper.unsubscribeFromTopic(device);

                                if (unsubscribeResult !== undefined && unsubscribeResult.success) {

                                    unsubscriber.status = "success"

                                } else {
                                    unsubscriber.status = "Fail"
                                }

                                input.push(unsubscriber)

                            }
                        }))

                    }
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

};

