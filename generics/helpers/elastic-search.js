const samikshaIndexName = (process.env.ELASTICSEARCH_SAMIKSHA_INDEX && process.env.ELASTICSEARCH_SAMIKSHA_INDEX != "") ? process.env.ELASTICSEARCH_SAMIKSHA_INDEX : "samiksha"
const samikshaNotificationTypeName = (process.env.ELASTICSEARCH_SAMIKSHA_NOTIFICATIONS_TYPE && process.env.ELASTICSEARCH_SAMIKSHA_NOTIFICATIONS_TYPE != "") ? process.env.ELASTICSEARCH_SAMIKSHA_NOTIFICATIONS_TYPE : "user-notification"
const unnatiIndexName = (process.env.ELASTICSEARCH_UNNATI_INDEX && process.env.ELASTICSEARCH_UNNATI_INDEX != "") ? process.env.ELASTICSEARCH_UNNATI_INDEX : "unnati"


var pushNotificationData = function (userId = "", notificatonData = {}) {

  return new Promise(async function (resolve, reject) {
    try {

      if (userId == "") throw "Invalid user id."
      
      let indexName = samikshaIndexName;
      if(notificatonData.appName && notificatonData.appName=="unnati"){
        indexName = unnatiIndexName
      }
      let userNotificationDocument = await getNotificationData(userId,notificatonData.appName);


      if (userNotificationDocument.statusCode == 404) {

        notificatonData.id = 0

        const userNotificationDocCreation = await elasticsearch.client.create({
          id: userId,
          index: indexName,
          type: samikshaNotificationTypeName,
          body: {
            notificationCount: 1,
            notificationUnreadCount: 1,
            notifications: [
              notificatonData
            ]
          }
        })

        if (!(userNotificationDocCreation.statusCode == 200 || userNotificationDocCreation.statusCode == 201)) {
          throw new Error("Failed to create push notification for user in elastic search.")
        }

        console.log(`${userId} Created Successfully`)
      } else if (userNotificationDocument.statusCode == 200) {

        let notificationObject = userNotificationDocument.body._source

        let arrayOfMaximumValue = notificationObject.notifications.map(item => {
          return item.id
        })

        let maximumCount = Math.max(...arrayOfMaximumValue)

        notificatonData.id = maximumCount + 1

        notificationObject.notifications.push(notificatonData)

        const userNotificationDocUpdation = await elasticsearch.client.update({
          id: userId,
          index: indexName,
          type: samikshaNotificationTypeName,
          body: {
            doc: {
              notificationCount: notificationObject.notificationCount + 1,
              notificationUnreadCount: notificationObject.notificationUnreadCount + 1,
              notifications: notificationObject.notifications
            }
          }
        })

        if (userNotificationDocUpdation.statusCode !== 200 || userNotificationDocUpdation.body.result !== "updated") {
          throw new Error("Failed to push notification to elastic search.")
        }

      } else {
        throw "Something went wrong!"
      }

      return resolve({
        success: true,
        message: "Notification successfully pushed to elastic search."
      })

    } catch (error) {
      return reject(error);
    }
  });
};

var updateNotificationData = function (userId = "", notificatonNumber = 0, notificationData = {},appName="") {

  return new Promise(async function (resolve, reject) {
    try {

      if (userId == "") throw "Invalid user id."

      console.log("notificationData",notificationData);
      let indexName = samikshaIndexName;
      if(appName && appName=="unnati"){
        indexName = unnatiIndexName
      }
      
      let userNotificationDocument = await getNotificationData(userId,appName)
     

      if (userNotificationDocument.body.error && userNotificationDocument.statusCode == 404) {

        return resolve({
          success: false,
          message: "No notification document found."
        })

      } else if (userNotificationDocument.statusCode == 200) {

        let notificationObject = userNotificationDocument.body._source

        Object.keys(notificationData).forEach(keyToBeUpdated => {
          notificationObject.notifications[notificatonNumber][keyToBeUpdated] = notificationData[keyToBeUpdated]
        })

        const userNotificationDocUpdation = await elasticsearch.client.update({
          id: userId,
          index: indexName,
          type: samikshaNotificationTypeName,
          body: {
            doc: {
              notificationCount: notificationObject.notifications.length,
              notificationUnreadCount: notificationObject.notifications.filter(notification => notification.is_read == false).length,
              notifications: notificationObject.notifications
            }
          }
        })

        if (userNotificationDocUpdation.statusCode !== 200) {
          throw "Failed to push notification to elastic search."
        }

      } else {
        throw "Something went wrong!"
      }

      return resolve({
        success: true,
        message: "Notification successfully updated in elastic search."
      })

    } catch (error) {
      return reject(error);
    }
  });
};

var getNotificationData = function (userId = "",appName = "") {

  return new Promise(async function (resolve, reject) {
    try {

      if (!elasticsearch.client) throw "Elastic search is down."

      if (userId == "") throw "Invalid user id."


      let indexName= samikshaIndexName;
      if(appName && appName == "unnati"){
        indexName = unnatiIndexName;
      }

      const userNotificationDocument = await elasticsearch.client.get({
        id: userId,
        index: indexName,
        type: samikshaNotificationTypeName
      }, {
          ignore: [404],
          maxRetries: 3
        })

      return resolve(userNotificationDocument)

    } catch (error) {
      return reject(error);
    }
  });
};

var getAllIndexData = function (appName="") {
  return new Promise(async function (resolve, reject) {
    try {

      if (!elasticsearch.client) throw "Elastic search is down."


      let indexName = samikshaIndexName;
      if(appName && appName=="unnati"){
        indexName = unnatiIndexName
      }


      const checkIndexExistsOrNot = await elasticsearch.client.indices.exists({
        index: indexName
      })

      const checkTypeExistsOrNot = await elasticsearch.client.indices.existsType({
        index: indexName,
        type: samikshaNotificationTypeName
      })

      let response = [];

      if (checkIndexExistsOrNot.statusCode !== 404 && checkTypeExistsOrNot.statusCode !== 404) {

        const userNotificationDocument = await elasticsearch.client.search({
          index: indexName,
          type: samikshaNotificationTypeName,
          size:1000
        })

        let allIndexData = [];

        if (userNotificationDocument.statusCode === 200 && userNotificationDocument.body.hits.hits.length > 0) {

          userNotificationDocument.body.hits.hits.forEach(eachUserNotification => {
            let userNotification = _.merge({ userId: eachUserNotification._id }, eachUserNotification._source)

            console.log(eachUserNotification._id)
            allIndexData.push(userNotification)

          })

          response = allIndexData

        }
      }

      return resolve({
        result: response
      })

    } catch (error) {
      return reject(error);
    }
  })
}

var deleteNotificationData = function (userId = "", notificatonNumber = 0,appName = "") {

  return new Promise(async function (resolve, reject) {
    try {

      if (userId == "") throw "Invalid user id."


      let indexName = samikshaIndexName;
      if(appName && appName=="unnati"){
        indexName = unnatiIndexName
      }


      let userNotificationDocument = await getNotificationData(userId,appName)

      if (userNotificationDocument.statusCode == 404) {

        return resolve({
          success: false,
          message: "No notification document found."
        })

      } else if (userNotificationDocument.statusCode == 200) {

        let notificationObject = userNotificationDocument.body._source

        let findIndexOfNotification = notificationObject.notifications.findIndex(item => item.id === notificatonNumber)

        notificationObject.notifications.splice(findIndexOfNotification, 1)

        let userNotificationDocDeletion;

        if (notificationObject.notifications.length > 0) {

          userNotificationDocDeletion = await elasticsearch.client.update({
            id: userId,
            index: indexName,
            type: samikshaNotificationTypeName,
            body: {
              doc: {
                notificationCount: notificationObject.notifications.length,
                notificationUnreadCount: notificationObject.notifications.filter(notification => notification.is_read == false).length,
                notifications: notificationObject.notifications
              }
            }
          })
        } else {

          userNotificationDocDeletion = await elasticsearch.client.delete({
            id: userId,
            index: indexName,
            type: samikshaNotificationTypeName
          })

        }

        if (userNotificationDocDeletion.statusCode !== 200) {
          throw "Failed to delete notification in elastic search."
        }


      } else {
        throw "Something went wrong!"
      }

      return resolve({
        success: true,
        message: "Notification successfully updated in elastic search."
      })

    } catch (error) {
      return reject(error);
    }
  });
};

module.exports = {
  pushNotificationData: pushNotificationData,
  getNotificationData: getNotificationData,
  updateNotificationData: updateNotificationData,
  getAllIndexData: getAllIndexData,
  deleteNotificationData: deleteNotificationData
};
