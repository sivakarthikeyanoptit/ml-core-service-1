const elasticSearchHelper = require(ROOT_PATH + "/generics/helpers/elastic-search");
const kafkaCommunication = require(ROOT_PATH + "/generics/helpers/kafka-communications")
let moment = require("moment-timezone")
let currentDate = moment(new Date());
let slackClient = require(ROOT_PATH + "/generics/helpers/slack-communications");
const userExtensionHelper = require(ROOT_PATH + "/module/user-extension/helper");
const pushNotificationsHelper = require(ROOT_PATH + "/module/notifications/push/helper");

module.exports = class inAppNotificationsHelper {

    static list(userDetails, pageSize, pageNo, appName = "", headers = "") {
        return new Promise(async (resolve, reject) => {
            try {

                await elasticSearchHelper.pushAppVersionToLoggedInUser(userDetails, headers, appName);

                let getNotificationDocument = await elasticSearchHelper.getNotificationData(userDetails, appName);

                if (getNotificationDocument.statusCode !== 200) {
                    return resolve({
                        data: [],
                        count: 0
                    })
                }

                let notificationInDescendingOrder = getNotificationDocument.body._source.notifications.reverse()

                let skippedValue = pageSize * (pageNo - 1);
                let limitingValue = pageSize;

                let paginatedData = notificationInDescendingOrder.splice(skippedValue, limitingValue)

                return resolve({
                    data: paginatedData,
                    count: getNotificationDocument.body._source.notificationCount
                })

            } catch (error) {
                return reject(error);
            }
        })
    }

    static markAsRead(userDetails, notificatonNumber, appName = "") {
        return new Promise(async (resolve, reject) => {
            try {

                let updateNotificationDocument = await elasticSearchHelper.updateNotificationData(userDetails, Number(notificatonNumber), { is_read: true }, appName)

                return resolve(updateNotificationDocument)
            } catch (error) {
                return reject(error);
            }
        })
    }

    static unReadCount(userDetails, appName = "", headers) {
        return new Promise(async (resolve, reject) => {
            try {

                let getNotificationDocument = await elasticSearchHelper.getNotificationData(userDetails, appName)

                let data = [];

                if (headers.platform && headers.appname) {
                    data = getNotificationDocument.body._source.notifications.filter(item => item.payload.type === "appUpdate" && item.is_read === false && item.payload.platform === headers.platform)
                }

                if (getNotificationDocument.statusCode !== 200) {
                    return resolve({
                        count: 0,
                        data: []
                    })
                }

                return resolve({
                    count: getNotificationDocument.body._source.notificationUnreadCount,
                    data: data
                })
            } catch (error) {
                return reject(error);
            }
        })
    }

    static search() {
        return new Promise(async (resolve, reject) => {
            try {
                const userNotificationDocument = await elasticsearch.client.search({
                    index: "samiksha",
                    type: "user-notification",
                    size: 1000
                })

                let notifications = userNotificationDocument.body.hits.hits


                return resolve(notifications)
            }
            catch (error) {
                return reject(error);
            }
        })
    }

    static pendingAssessmentsOrObservations(assessmentOrObservationData, observation = false) {
        return new Promise(async (resolve, reject) => {
            try {

                let pendingData = assessmentOrObservationData.filter(singleData => {
                    let pendingCreatedDate = moment(singleData.createdAt)
                    let dateDifferenceWithPendingAssessment = currentDate.diff(pendingCreatedDate, 'days')

                    if (dateDifferenceWithPendingAssessment >= 14) {
                        return singleData;
                    }
                })

                if (pendingData.length > 0) {

                    let result = {
                        is_read: false,
                        action: "pending",
                        internal: false,
                        type: "Information",
                        created_at: new Date(),
                        payload: {
                            type: "institutional"
                        },
                        title: "Pending Assessment!",
                        text: "You have a Pending Assessment",
                        appName: "samiksha"
                    };

                    if (observation) {
                        result.payload["type"] = "observation";
                        result.title = "Pending Observation!";
                        result.text = "You have a Pending Observation"
                    }

                    for (let pointerToPendingData = 0; pointerToPendingData < pendingData.length; pointerToPendingData++) {

                        result.payload["solution_id"] = pendingData[pointerToPendingData].solutionId;
                        result.payload["submission_id"] = pendingData[pointerToPendingData]._id;
                        result.payload["entity_id"] = pendingData[pointerToPendingData].entityId;
                        result.payload["entity_name"] = pendingData[pointerToPendingData].entityName;
                        result["user_id"] = pendingData[pointerToPendingData].userId

                        if (observation) {
                            result.payload["observation_id"] = pendingData[pointerToPendingData].observationId;
                        } else {
                            result.payload["program_id"] = pendingData[pointerToPendingData].programId;
                        }

                        let pushAssessmentsOrObservationsToKafka = await kafkaCommunication.pushNotificationsDataToKafka(result);

                        if (pushAssessmentsOrObservationsToKafka && pushAssessmentsOrObservationsToKafka.status && pushAssessmentsOrObservationsToKafka.status != "success") {
                            let errorObject = {
                                userId: result.user_id,
                                message: `Failed to push ${result.title} to kafka`,
                                payload: result.payload
                            }
                            slackClient.kafkaErrorAlert(errorObject)
                            return;
                        }
                    }
                }
            }
            catch (error) {
                return reject(error);
            }
        })
    }

    static completedAssessmentsOrObservations(assessmentOrObservationData, observation = false) {
        return new Promise(async (resolve, reject) => {
            try {

                let userCompletionData = {}

                for (let indexToAssessmentOrObservationData = 0; indexToAssessmentOrObservationData < assessmentOrObservationData.length; indexToAssessmentOrObservationData++) {
                    let createdAtDate = moment(assessmentOrObservationData[indexToAssessmentOrObservationData].createdAt).format("YYYY-MM-DD");

                    let checkDate = moment(currentDate).isSame(createdAtDate, 'month');

                    if (checkDate) {

                        if (!userCompletionData[assessmentOrObservationData[indexToAssessmentOrObservationData].userId]) {
                            userCompletionData[assessmentOrObservationData[indexToAssessmentOrObservationData].userId] = {}
                            userCompletionData[assessmentOrObservationData[indexToAssessmentOrObservationData].userId]["count"] = 0;
                        }

                        userCompletionData[assessmentOrObservationData[indexToAssessmentOrObservationData].userId]["count"] += 1
                    }
                }

                let allUserCompletionData = Object.keys(userCompletionData)

                if (allUserCompletionData.length > 0) {

                    let result = {
                        is_read: false,
                        payload: {
                            type: "institutional"
                        },
                        action: "view_only",
                        internal: false,
                        title: "Congratulations!",
                        type: "Information",
                        "created_at": new Date(),
                        appName: "samiksha"
                    }

                    if (observation) {
                        result.payload.type = "observation"
                    }

                    for (let pointerToUserData = 0; pointerToUserData < allUserCompletionData.length; pointerToUserData++) {

                        result.user_id = allUserCompletionData[pointerToUserData]
                        result.text = observation ? `You have Completed ${userCompletionData[allUserCompletionData[pointerToUserData]].count} Observations this month!` : `You have Completed ${userCompletionData[allUserCompletionData[pointerToUserData]].count} Assessments this month!`
                        let pushCompletedAssessmentsOrObservationsToKafka = await kafkaCommunication.pushNotificationsDataToKafka(result);

                        if (pushCompletedAssessmentsOrObservationsToKafka.status && pushCompletedAssessmentsOrObservationsToKafka.status != "success") {
                            let errorObject = {
                                message: observations ? `Failed to push completed observations to kafka` : `Failed to push completed assessments to kafka`,
                                payload: result.payload
                            }
                            slackClient.kafkaErrorAlert(errorObject)
                            return;
                        }
                    }
                }

                return resolve()

            }
            catch (error) {
                return reject(error);
            }
        })
    }

    static create(userId, data) {
        return new Promise(async (resolve, reject) => {
            try {
                const createdDocument = await elasticSearchHelper.pushNotificationData(userId, data)

                return resolve({
                    status: 200,
                    result: "Success"
                })
            }
            catch (error) {
                return reject(error);
            }
        })
    }

    static pushNotificationMessageToDevice(userId, notificationMessage) {
        return new Promise(async (resolve, reject) => {
            try {

                let getAllDevices = await userExtensionHelper.profileWithEntityDetails({
                    userId: userId,
                    status: "active",
                    isDeleted: false
                }, { devices: 1 })

                if (!getAllDevices.devices.length > 0) {
                    throw "No devices found"
                }

                let getSpecificAppData = getAllDevices.devices.filter(eachDeviceName => eachDeviceName.app === notificationMessage.appName && eachDeviceName.status === "active")

                for (let pointerToDevices = 0; pointerToDevices < getSpecificAppData.length; pointerToDevices++) {

                    let notificationDataToBeSent = {
                        deviceId: getSpecificAppData[pointerToDevices].deviceId,
                        title: notificationMessage.title,
                        data: {
                            "title": notificationMessage.title,
                            "text": notificationMessage.text,
                            id: JSON.stringify(notificationMessage.id),
                            is_read: JSON.stringify(notificationMessage.is_read),
                            payload: JSON.stringify(notificationMessage.payload),
                            action: notificationMessage.action,
                            internal: JSON.stringify(notificationMessage.internal),
                            created_at: notificationMessage.created_at,
                            type: notificationMessage.type
                        },
                        text: notificationMessage.text
                    }

                    let pushedData = await pushNotificationsHelper.createNotificationInAndroid(notificationDataToBeSent);

                    if (!pushedData.status) {

                        let errorMsg = {
                            "message": `Cannot sent push notifications to ${getAllDevices.devices[pointerToDevices].deviceId}`
                        }

                        // slackClient.pushNotificationError(errorMsg);
                    }
                }

                return resolve()

            } catch (error) {
                return reject(error);
            }
        })
    }

    static updateAppVersion(updateAppData) {
        return new Promise(async (resolve, reject) => {
            try {


                for (let pointerToUpdateAppData = 0; pointerToUpdateAppData < updateAppData.length; pointerToUpdateAppData++) {

                    let result = {}

                    result["is_read"] = false;
                    result["internal"] = true;
                    result["action"] = "versionUpdate";
                    result["appName"] = updateAppData[pointerToUpdateAppData].appName;
                    result["created_at"] = new Date();
                    result["text"] = updateAppData[pointerToUpdateAppData].text;
                    result["title"] = updateAppData[pointerToUpdateAppData].title;
                    result["type"] = "Information";
                    result["payload"] = {};
                    result["payload"]["appVersion"] = updateAppData[pointerToUpdateAppData].version;
                    result["payload"]["updateType"] = updateAppData[pointerToUpdateAppData].status;
                    result["payload"]["type"] = "appUpdate";
                    result["payload"]["platform"] = updateAppData[pointerToUpdateAppData].platform;

                    // await elasticSearchHelper.updateAppVersion(result);
                    await kafkaCommunication.pushNotificationsDataToKafka(result);
                }

                return resolve()

            } catch (error) {
                return reject(error);
            }
        })
    }

};