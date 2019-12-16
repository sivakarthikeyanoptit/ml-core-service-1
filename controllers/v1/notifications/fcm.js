/**
 * name : fcm.js
 * author : Aman Jung Karki
 * created-date : 26-Nov-2019
 * Description :  Push notifications using firebase admin.
 */


// dependencies

const csv = require('csvtojson');
const userExtensionHelper = require(ROOT_PATH + "/module/user-extension/helper");
const csvFileStream = require(ROOT_PATH + "/generics/file-stream");
const firebaseHelper = require(ROOT_PATH + "/generics/helpers/fcm");
const fcmHelper = require(ROOT_PATH + "/module/notifications/fcm/helper");

/**
    * Push notifications using firebase-admin.
    * @class
*/

module.exports = class Fcm {

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
        return "fcm";
    }

    /**
     * @api {post} /kendra/api/v1/notifications/fcm/registerDevice  
     * Register device id.
     * @apiVersion 1.0.0
     * @apiGroup Fcm
     * @apiHeader {String} X-authenticated-user-token Authenticity token
     * @apiParam {File} userData Mandatory userData file of type csv.
     * @apiSampleRequest /kendra/api/v1/notifications/fcm/registerDevice
     * @apiUse successBody
     * @apiUse errorBody
     */

    /**
      * Register device id for the particular logged in user.
      * @method
      * @name registerDevice
      * @param  {Request}  req  request body.
      * @returns {JSON} Response with status and message.
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
                };

                let result = await userExtensionHelper.createOrUpdate(
                    deviceData, 
                    _.pick(req.userDetails, ["userId", "email", "userName"]));

                let response = {};

                if (result && result.success) {

                    response["result"] = {};

                    let topicArray = 
                    [
                        "allUsers", 
                        "all-" + deviceData.app + "-users",
                        "all-" + deviceData.app + "-" + deviceData.os + "-users"
                    ];

                    await Promise.all(topicArray.map(async topicName => {

                        let subscribeResult = 
                        await firebaseHelper.subscribeDeviceToTopic(
                            deviceData.deviceId, 
                            topicName);

                        response["result"][topicName] = subscribeResult.success 
                        ? "Subscribed" : "Could not subscribee";

                    }));
                } else {
                    response["status"] = httpStatusCode.ok.status;
                }

                return resolve(response);

            } catch (error) {

                return reject({
                    status: 
                    error.status || 
                    httpStatusCode["internal_server_error"].status,

                    message: 
                    error.message 
                    || httpStatusCode["internal_server_error"].message,

                    errorObject: error
                })

            }
        })

    }

    /**
     * @api {post} /kendra/api/v1/notifications/fcn/pushToUsers  
     * Push Notifications To Users
     * @apiVersion 1.0.0
     * @apiGroup Fcm
     * @apiHeader {String} X-authenticated-user-token Authenticity token
     * @apiParam {File} userData Mandatory userData file of type csv.
     * @apiSampleRequest /kendra/api/v1/notifications/fcm/pushToUsers
     * @apiUse successBody
     * @apiUse errorBody
     */

     /**
      * Push sample data to the particular device id.
      * @method
      * @name pushToUsers
      * @param  {Request} req request body.
      * @returns {csv} csv with pushToUsersData along with status and message.
    */

    async pushToUsers(req) {

        return new Promise(async (resolve, reject) => {

            try {

                if (!req.files || !req.files.userData) {
                    throw { message: "Missing file of type userData" };
                }

                let userData = 
                await csv().fromString(req.files.userData.data.toString());

                const fileName = `push-to-device`;
                let fileStream = new csvFileStream(fileName);
                let input = fileStream.initStream();

                (async function () {
                    await fileStream.getProcessorPromise();
                    return resolve({
                        isResponseAStream: true,
                        fileNameWithPath: fileStream.fileNameWithPath()
                    });
                })();

                await Promise.all(userData.map(async element => {

                    let userProfile = 
                    await userExtensionHelper.userExtensionDocument({
                        userId: element.userId,
                        status: "active",
                        isDeleted: false
                    }, {
                            devices: 1
                        });

                    if (userProfile && userProfile.devices.length > 0) {

                        let matchDeviceData = 
                        userProfile.devices.filter(eachUserDevice => {
                            if (
                                eachUserDevice.app == element.appName 
                                && eachUserDevice.status !== "inactive"
                                ) {
                                return eachUserDevice
                            }
                        })

                        if (matchDeviceData.length > 0) {

                            await Promise.all(matchDeviceData.map(
                                async device => {

                                if (element.message && element.title) {

                                    device.message = element.message;
                                    device.title = element.title;

                                    let notificationResult = 
                                    await fcmHelper.createNotificationInAndroid(device);

                                    if (!notificationResult.success) {

                                        await userExtensionHelper.updateDeviceStatus(
                                            device,
                                            userProfile.devices,
                                            element.userId
                                        );

                                        let topicArray = [
                                            "allUsers",
                                            "all-" + device.app + "-users",
                                            "all-" + device.app + "-" 
                                            + device.os + "-users"
                                        ];

                                        await Promise.all(topicArray.map(async topicName => {

                                            await firebaseHelper.unsubscribeDeviceFromTopic(
                                                device.deviceId, topicName
                                                );
                                        }));

                                        element.status = "Fail";

                                    } else {

                                        element.status = "Success";
                                    }

                                } else {
                                    element.status = 
                                    "Message or title is not present in csv";
                                }
                            }));

                        } else {
                            element.status = 
                            "Device is not there for particular app.";
                        }

                    } else {
                        element.status = 
                        "No devices found.";
                    }


                    input.push(element);

                }))

                input.push(null);

            } catch (error) {

                return reject({
                    status: 
                    error.status || httpStatusCode["internal_server_error"].status,

                    message: 
                    error.message || httpStatusCode["internal_server_error"].message,

                    errorObject: error
                })

            }
        })

    }


    /**
    * @api {post} /kendra/api/v1/notifications/fcm/pushToTopic 
    * Push Notification to topic
    * @apiVersion 1.0.0
    * @apiGroup Fcm
    * @apiSampleRequest /kendra/api/v1/notifications/fcm/pushToTopic
    * @apiParam {File} pushToTopic Mandatory pushToTopic file of type csv.    
    * @apiUse successBody
    * @apiUse errorBody
    */

    /**
      *  Push sample data to the topic given.
      * @method
      * @name pushToTopic
      * @param  {Request} req request body.
      * @returns {csv} csv with pushToTopic data along with status and message. 
    */

    async pushToTopic(req) {
        return new Promise(async (resolve, reject) => {

            try {

                if (!req.files || !req.files.pushToTopic) {
                    throw { message: "Missing file of type pushToTopic" }
                }

                let topicData = 
                await csv().fromString(req.files.pushToTopic.data.toString());

                const fileName = `push-to-topic`;
                let fileStream = new csvFileStream(fileName);
                let input = fileStream.initStream();

                (async function () {
                    await fileStream.getProcessorPromise();
                    return resolve({
                        isResponseAStream: true,
                        fileNameWithPath: fileStream.fileNameWithPath()
                    });
                })();

                await Promise.all(topicData.map(async singleTopicData => {

                    let topicCsvData = await fcmHelper.pushData(singleTopicData);
                    input.push(topicCsvData);
                }))

                input.push(null);

            } catch (error) {

                return reject({
                    status: 
                    error.status ||
                    httpStatusCode["internal_server_error"].status,

                    message: 
                    error.message ||
                    httpStatusCode["internal_server_error"].message,

                    errorObject: error
                })

            }
        })

    }


    /**
    * @api {post} /kendra/api/v1/notifications/fcm/pushToAllUsers  
    * Push Notification To ALL Users
    * @apiVersion 1.0.0
    * @apiGroup Fcm
    * @apiSampleRequest /kendra/api/v1/notifications/fcm/pushToAllUsers
    * @apiHeader {String} X-authenticated-user-token Authenticity token
    * @apiParam {File} pushToAllUsers Mandatory pushToAllUsers file of type csv.        
    * @apiUse successBody
    * @apiUse errorBody
    */

    /**
      * Push sample data to all users.
      * @method
      * @name pushToAllUsers
      * @param  {Request} req - request body.
      * @returns {csv} csv with pushToAllUSers data along with status and message. 
    */

    async pushToAllUsers(req) {
        return new Promise(async (resolve, reject) => {

            try {

                if (!req.files || !req.files.pushToAllUsers) {
                    throw { message: "Missing file of type pushToAllUsers" };
                }

                let pushToAllUsers = 
                await csv().fromString(req.files.pushToAllUsers.data.toString());

                const fileName = `push-to-all-users`;
                let fileStream = new csvFileStream(fileName);
                let input = fileStream.initStream();

                (async function () {
                    await fileStream.getProcessorPromise();
                    return resolve({
                        isResponseAStream: true,
                        fileNameWithPath: fileStream.fileNameWithPath()
                    });
                })();


                await Promise.all(pushToAllUsers.map(async allUserData => {

                    let topicPushStatus = await fcmHelper.pushData(allUserData);
                    input.push(topicPushStatus);
                }));

                input.push(null);

            } catch (error) {

                return reject({
                    status: 
                    error.status || 
                    httpStatusCode["internal_server_error"].status,

                    message: 
                    error.message ||
                    httpStatusCode["internal_server_error"].message,

                    errorObject: error
                })

            }
        })

    }


    /**
    * @api {post} /kendra/api/v1/notifications/fcm/subscribeToTopic 
    * Subscribe To Topic
    * @apiVersion 1.0.0
    * @apiGroup Fcm
    * @apiSampleRequest /kendra/api/v1/notifications/fcm/subscribeToTopic
    * @apiHeader {String} X-authenticated-user-token Authenticity token
    * @apiParam {File} subscribeToTopic Mandatory subscribeToTopic file of type csv.            
    * @apiUse successBody
    * @apiUse errorBody
    */

    /**
      * Subscribe sample data to particular topic.
      * @method
      * @name subscribeToTopic
      * @param  {Request} req request body.
      * @returns {csv} csv with subscribeToTopic data along with status and message.
    */

    async subscribeToTopic(req) {
        return new Promise(async (resolve, reject) => {

            try {

                if (!req.files || !req.files.subscribeToTopic) {
                    throw { message: "Missing file of type subscribeToTopic" };
                }

                let subscribersData = 
                await csv().fromString(req.files.subscribeToTopic.data.toString());

                const fileName = `subscribe-to-topic`;
                let fileStream = new csvFileStream(fileName);
                let input = fileStream.initStream();

                (async function () {
                    await fileStream.getProcessorPromise();
                    return resolve({
                        isResponseAStream: true,
                        fileNameWithPath: fileStream.fileNameWithPath()
                    });
                })();

                await Promise.all(subscribersData.map(async subscriber => {

                    let subscribeStatus = 
                    await fcmHelper.subscribeOrUnSubscribeData(subscriber, true);

                    input.push(subscribeStatus);
                }))

                input.push(null);

            } catch (error) {

                return reject({
                    status: 
                    error.status || 
                    httpStatusCode["internal_server_error"].status,

                    message: 
                    error.message || 
                    httpStatusCode["internal_server_error"].message,

                    errorObject: error
                })

            }
        })

    }

    /**
    * @api {post} /kendra/api/v1/notifications/fcm/unsubscribeFromTopic  
    * Unsubscribe From Topic
    * @apiVersion 1.0.0
    * @apiGroup Fcm
    * @apiSampleRequest /kendra/api/v1/notifications/fcm/unsubscribeFromTopic
    * @apiHeader {String} X-authenticated-user-token Authenticity token
    * @apiParam {File} unsubscribeFromTopic Mandatory unsubscribeFromTopic file of type csv.                
    * @apiUse successBody
    * @apiUse errorBody
    */

    /**
      * UnSubscribe sample data from particular topic.
      * @method
      * @name unsubscribeFromTopic
      * @param  {Request} req request body.
      * @returns {csv} csv with unsubscribeFromTopic data along with status and message.
    */

    async unsubscribeFromTopic(req) {
        return new Promise(async (resolve, reject) => {

            try {

                if (!req.files || !req.files.unsubscribeFromTopic) {
                    throw { message: "Missing file of type unSubscribeFromTopic" };
                }

                let unsubscribersData = 
                await csv().fromString(req.files.unsubscribeFromTopic.data.toString());

                const fileName = `unsubscribe-from-topic`;
                let fileStream = new csvFileStream(fileName);
                let input = fileStream.initStream();

                (async function () {
                    await fileStream.getProcessorPromise();
                    return resolve({
                        isResponseAStream: true,
                        fileNameWithPath: fileStream.fileNameWithPath()
                    });
                })();


                await Promise.all(unsubscribersData.map(async unsubscriber => {

                    let unSubscribeStatus = 
                    await fcmHelper.subscribeOrUnSubscribeData(unsubscriber);

                    input.push(unSubscribeStatus);
                }))

                input.push(null);

            } catch (error) {

                return reject({
                    status: 
                    error.status || 
                    httpStatusCode["internal_server_error"].status,

                    message: 
                    error.message || 
                    httpStatusCode["internal_server_error"].message,
                    
                    errorObject: error
                })

            }
        })

    }

};

