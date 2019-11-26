/**
 * name : push.js
 * author : Aman Jung Karki
 * created-date : 25-Nov-2019
 * Description :  Push notifications.
 */

const csv = require('csvtojson');
const userExtensionHelper = require(ROOT_PATH + "/module/user-extension/helper");
const pushNotificationsHelper = require(ROOT_PATH + "/module/notifications/push/helper");
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
        return "push";
    }

    /**
     * @api {post} /kendra/api/v1/notifications/push/registerDevice  Push Notifications To Users
     * @apiVersion 1.0.0
     * @apiName Push Notifications To Users
     * @apiGroup Notifications
     * @apiHeader {String} X-authenticated-user-token Authenticity token
     * @apiParam {File} userData Mandatory userData file of type CSV.
     * @apiSampleRequest /kendra/api/v1/notifications/push/registerDevice
     * @apiUse successBody
     * @apiUse errorBody
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
     * @api {post} /kendra/api/v1/notifications/push/pushToUsers  Push Notifications To Users
     * @apiVersion 1.0.0
     * @apiName Push Notifications To Users
     * @apiGroup Notifications
     * @apiHeader {String} X-authenticated-user-token Authenticity token
     * @apiParam {File} userData Mandatory userData file of type CSV.
     * @apiSampleRequest /kendra/api/v1/notifications/push/pushToUsers
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

                    if (userProfile && userProfile.devices.length > 0) {

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
                                element.status = "App name could not be found or status is inactive"
                            }

                        }));

                    } else {
                        element.status = "No devices found."
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
    * @api {post} /kendra/api/v1/notifications/push/pushToTopic Push Notification to topic
    * @apiVersion 1.0.0
    * @apiName Push Notification to topic
    * @apiGroup Notifications
    * @apiSampleRequest /kendra/api/v1/notifications/push/pushToTopic
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

                await Promise.all(topicData.map(async singleTopicData => {

                    let topicCsvData = await pushNotificationsHelper.pushData(singleTopicData)

                    input.push(topicCsvData)

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
    * @api {post} /kendra/api/v1/notifications/push/pushToAllUsers  Push Notification To ALL Users
    * @apiVersion 1.0.0
    * @apiName Push Notification To ALL Users Topic
    * @apiGroup Notifications
    * @apiSampleRequest /kendra/api/v1/notifications/push/pushToAllUsers
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


                await Promise.all(pushToAllUsers.map(async allUserData => {

                    let topicPushStatus = await pushNotificationsHelper.pushData(allUserData)

                    input.push(topicPushStatus)

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
    * @api {post} /kendra/api/v1/notifications/push/subscribeToTopic  Subscribe To Topic
    * @apiVersion 1.0.0
    * @apiName Subscribe To Topic
    * @apiGroup Notifications
    * @apiSampleRequest /kendra/api/v1/notifications/push/subscribeToTopic
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

                    let subscribeStatus = await pushNotificationsHelper.subscribeOrUnSubscribeData(subscriber, true)

                    input.push(subscribeStatus)
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
    * @api {post} /kendra/api/v1/notifications/push/unsubscribeFromTopic  Unsubscribe From Topic
    * @apiVersion 1.0.0
    * @apiName Unsubscribe From Topic
    * @apiGroup Notifications
    * @apiSampleRequest /kendra/api/v1/notifications/push/unsubscribeFromTopic
    * @apiHeader {String} X-authenticated-user-token Authenticity token
    * @apiParam {File} unsubscribeFromTopic Mandatory unsubscribeFromTopic file of type CSV.                
    * @apiUse successBody
    * @apiUse errorBody
    */

    async unsubscribeFromTopic(req) {
        return new Promise(async (resolve, reject) => {

            try {

                if (!req.files || !req.files.unsubscribeFromTopic) {
                    throw { message: "Missing file of type unSubscribeFromTopic" }
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

                    let unSubscribeStatus = await pushNotificationsHelper.subscribeOrUnSubscribeData(unsubscriber)

                    input.push(unSubscribeStatus)
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

