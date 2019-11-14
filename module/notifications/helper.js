const elasticSearchHelper = require(ROOT_PATH + "/generics/helpers/elastic-search")
let moment = require("moment-timezone")

module.exports = class notificationsHelper {

    static list(userDetails, pageSize, pageNo,appName = "") {
        return new Promise(async (resolve, reject) => {
            try {

                let getNotificationDocument = await elasticSearchHelper.getNotificationData(userDetails,appName)

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

    static markItRead(userDetails, notificatonNumber,appName ="") {
        return new Promise(async (resolve, reject) => {
            try {

                let updateNotificationDocument = await elasticSearchHelper.updateNotificationData(userDetails, Number(notificatonNumber), { is_read: true },appName)

                return resolve(updateNotificationDocument)
            } catch (error) {
                return reject(error);
            }
        })
    }

    static unReadCount(userDetails,appName="") {
        return new Promise(async (resolve, reject) => {
            try {

                let getNotificationDocument = await elasticSearchHelper.getNotificationData(userDetails,appName)

                if (getNotificationDocument.statusCode !== 200) {
                    return resolve({
                        count: 0
                    })
                }

                return resolve({
                    count: getNotificationDocument.body._source.notificationUnreadCount,
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
                    type: "user-notification"
                })

                let notifications = userNotificationDocument.body.hits.hits


                return resolve(notifications)
            }
            catch (error) {
                return reject(error);
            }
        })
    }

    static pendingAssessments(pendingData) {
        return new Promise(async (resolve, reject) => {
            try {

                let currentDate = moment(new Date());

                pendingData = pendingData.filter(eachPendingData => {
                    let createdAtDate = moment(eachPendingData.createdAt)
                    let dateDifference = currentDate.diff(createdAtDate, 'days')

                    // if (dateDifference >= 14) {
                    //     return eachPendingData;
                    // }

                    return eachPendingData

                })

                if (pendingData.length > 0) {

                    let assessment = {
                        is_read: false,
                        payload: {
                            type: "institutional"
                        },
                        action: "pending",
                        internal: false,
                        title: "Pending Assessment!",
                        text: "You have a Pending Assessment",
                        type: "Information",
                        created_at: new Date()
                    }

                    for (let pointerToPendingAssessments = 0; pointerToPendingAssessments < pendingData.length; pointerToPendingAssessments++) {

                        let getNotificationDocument = await elasticSearchHelper.getNotificationData(pendingData[pointerToPendingAssessments].userId)

                        assessment.payload["solution_id"] = pendingData[pointerToPendingAssessments].solutionId;
                        assessment.payload["submission_id"] = pendingData[pointerToPendingAssessments]._id;
                        assessment.payload["entity_id"] = pendingData[pointerToPendingAssessments].entityId;
                        assessment.payload["program_id"] = pendingData[pointerToPendingAssessments].programId;
                        assessment.payload["entity_name"] = pendingData[pointerToPendingAssessments].entityName;

                        if (getNotificationDocument.statusCode !== 404) {

                            let notifications = getNotificationDocument.body._source.notifications

                            let existingNotification = notifications.find(item => {
                                if (item.payload.submission_id === pendingData[pointerToPendingAssessments]._id) {
                                    return item
                                }
                            })


                            if (existingNotification !== undefined) {
                                let dateDifference = currentDate.diff(existingNotification.created_at, 'days')

                                // if (dateDifference >= 14) {
                                    await elasticSearchHelper.updateNotificationData(pendingData[pointerToPendingAssessments].userId, Number(existingNotification.id), { created_at: new Date(),is_read:false })
                                    // await elasticSearchHelper.deleteNotificationData(pendingData[pointerToPendingAssessments].userId, existingNotification.id)
                                    // await elasticSearchHelper.pushNotificationData(pendingData[pointerToPendingAssessments].userId, assessment)
                                // }
                            } else{
                                await elasticSearchHelper.pushNotificationData(pendingData[pointerToPendingAssessments].userId, assessment)
                            }

                        } else{
                            await elasticSearchHelper.pushNotificationData(pendingData[pointerToPendingAssessments].userId, assessment)
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

    static pendingObservations(pendingObservationData) {
        return new Promise(async (resolve, reject) => {
            try {

                let currentDate = moment(new Date());

                pendingObservationData = pendingObservationData.filter(eachPendingData => {
                    let createdAtDate = moment(eachPendingData.createdAt)
                    let dateDifference = currentDate.diff(createdAtDate, 'days')

                    // if (dateDifference >= 14) {
                    //     return eachPendingData;
                    // }

                    return eachPendingData;

                })

                if (pendingObservationData.length > 0) {

                    let observation = {
                        is_read: false,
                        payload: {
                            type: "observation"
                        },
                        action: "pending",
                        internal: false,
                        title: "Pending Observation!",
                        text: "You have a Pending Observation",
                        type: "Information",
                        created_at: new Date()
                    }

                    for (let pointerToPendingAssessments = 0; pointerToPendingAssessments < pendingObservationData.length; pointerToPendingAssessments++) {

                        let getNotificationDocument = await elasticSearchHelper.getNotificationData(pendingObservationData[pointerToPendingAssessments].userId)

                        observation.payload["solution_id"] = pendingObservationData[pointerToPendingAssessments].solutionId;
                        observation.payload["submission_id"] = pendingObservationData[pointerToPendingAssessments]._id;
                        observation.payload["entity_id"] = pendingObservationData[pointerToPendingAssessments].entityId;
                        observation.payload["observation_id"] = pendingObservationData[pointerToPendingAssessments].observationId;
                        observation.payload["entity_name"] = pendingObservationData[pointerToPendingAssessments].entityName;

                        if (getNotificationDocument.statusCode !== 404) {

                            let notifications = getNotificationDocument.body._source.notifications

                            let existingNotification = notifications.find(item => {
                                if (item.payload.submission_id === pendingObservationData[pointerToPendingAssessments]._id) {
                                    return item
                                }
                            })


                            if (existingNotification !== undefined) {
                                let dateDifference = currentDate.diff(existingNotification.created_at, 'days')
                                if (dateDifference >= 14) { // dateDifference>=14 
                                    await elasticSearchHelper.updateNotificationData(pendingObservationData[pointerToPendingAssessments].userId, Number(existingNotification.id), { created_at: new Date(),is_read:false })
                                }
                            } else{
                                await elasticSearchHelper.pushNotificationData(pendingObservationData[pointerToPendingAssessments].userId, observation)
                            }

                        } else{
                            await elasticSearchHelper.pushNotificationData(pendingObservationData[pointerToPendingAssessments].userId, observation)
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

    static completedAssessment(completedData) {
        return new Promise(async (resolve, reject) => {
            try {

                let currentDate = moment(new Date())

                let completedAssessments = {
                    is_read: false,
                    payload: {
                        type: "institutional"
                    },
                    action: "view_only",
                    internal: false,
                    title: "Congratulations!",
                    type: "Information",
                    "created_at": new Date()
                }

                let userDetails = {}

                for (let pointerToCompletedData = 0; pointerToCompletedData < completedData.length; pointerToCompletedData++) {
                    let createdAtDate = moment(completedData[pointerToCompletedData].createdAt).format("YYYY-MM-DD");

                    let checkDate = moment(currentDate).isSame(createdAtDate, 'month');

                    if (checkDate) {

                        if (!userDetails[completedData[pointerToCompletedData].userId]) {
                            userDetails[completedData[pointerToCompletedData].userId] = {}
                            userDetails[completedData[pointerToCompletedData].userId]["count"] = 0;
                        }

                        userDetails[completedData[pointerToCompletedData].userId]["count"] += 1
                    }

                }

                let allUserRoles = Object.keys(userDetails)

                for (let pointerToUserData = 0; pointerToUserData < allUserRoles.length; pointerToUserData++) {
                    completedAssessments.text = `You have Completed ${userDetails[allUserRoles[pointerToUserData]].count} Assessments this month!`
                    await elasticSearchHelper.pushNotificationData(allUserRoles[pointerToUserData], completedAssessments)
                }

                return resolve()
            }
            catch (error) {
                return reject(error);
            }
        })
    }

    static completedObservations(completedData) {
        return new Promise(async (resolve, reject) => {
            try {

                let currentDate = moment(new Date())

                let completedObservations = {
                    is_read: false,
                    payload: {
                        type: "observation"
                    },
                    action: "view_only",
                    internal: false,
                    title: "Congratulations!",
                    type: "Information",
                    "created_at": new Date()
                }

                let userDetails = {}

                for (let pointerToCompletedData = 0; pointerToCompletedData < completedData.length; pointerToCompletedData++) {
                    let createdAtDate = moment(completedData[pointerToCompletedData].createdAt).format("YYYY-MM-DD");

                    let checkDate = moment(currentDate).isSame(createdAtDate, 'month');

                    if (checkDate) {

                        if (!userDetails[completedData[pointerToCompletedData].userId]) {
                            userDetails[completedData[pointerToCompletedData].userId] = {}
                            userDetails[completedData[pointerToCompletedData].userId]["count"] = 0;
                        }

                        userDetails[completedData[pointerToCompletedData].userId]["count"] += 1
                    }

                }

                let allUserRoles = Object.keys(userDetails)

                for (let pointerToUserData = 0; pointerToUserData < allUserRoles.length; pointerToUserData++) {
                    completedObservations.text = `You have Completed ${userDetails[allUserRoles[pointerToUserData]].count} Observations this month!`
                    await elasticSearchHelper.pushNotificationData(allUserRoles[pointerToUserData], completedObservations)
                }

                return resolve()
            }
            catch (error) {
                return reject(error);
            }
        })
    }

    static deleteReadNotification() {
        return new Promise(async (resolve, reject) => {
            try {

                let currentDate = moment(new Date());

                let getAllIndexData = await elasticSearchHelper.getAllIndexData()

                if (getAllIndexData.result.length > 0) {

                    for (let pointerToIndexData = 0; pointerToIndexData < getAllIndexData.result.length; pointerToIndexData++) {

                        let currentIndexData = getAllIndexData.result[pointerToIndexData]
                        let userId = currentIndexData.userId;

                        let getFilteredNotifications = currentIndexData.notifications.filter(item => {

                            let notificationCreatedDate = moment(item.created_at);
                            let dateDifference = currentDate.diff(notificationCreatedDate, 'days');

                            if (item.is_read === true) {
                                return item
                            }
                        })

                        if (getFilteredNotifications.length > 0) {
                            console.log("here")
                            for (let pointerToNotifications = 0; pointerToNotifications < getFilteredNotifications.length; pointerToNotifications++) {
                                await elasticSearchHelper.deleteNotificationData(userId, getFilteredNotifications[pointerToNotifications].id)
                            }
                        }
                    }
                }

                return resolve();
            }
            catch (error) {
                return reject(error)
            }
        })
    }

    static deleteUnReadNotification() {
        return new Promise(async (resolve, reject) => {
            try {

                let currentDate = moment(new Date());

                let getAllIndexData = await elasticSearchHelper.getAllIndexData()

                if (getAllIndexData.result.length > 0) {

                    for (let pointerToIndexData = 0; pointerToIndexData < getAllIndexData.result.length; pointerToIndexData++) {

                        let currentIndexData = getAllIndexData.result[pointerToIndexData]
                        let userId = currentIndexData.userId;

                        let getFilteredNotifications = currentIndexData.notifications.filter(item => {

                            let notificationCreatedDate = moment(item.created_at);
                            let dateDifference = currentDate.diff(notificationCreatedDate, 'days');

                            if (item.is_read === false ) { // jUst for testing purpose
                                return item
                            }
                        })

                        if (getFilteredNotifications.length > 0) {
                            for (let pointerToNotifications = 0; pointerToNotifications < getFilteredNotifications.length; pointerToNotifications++) {
                                await elasticSearchHelper.deleteNotificationData(userId, getFilteredNotifications[pointerToNotifications].id)
                            }
                        }
                    }
                }

                return resolve();
            }
            catch (error) {
                return reject(error)
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
};