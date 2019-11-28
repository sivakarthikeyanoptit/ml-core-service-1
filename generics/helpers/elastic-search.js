const samikshaIndexName = (process.env.ELASTICSEARCH_SAMIKSHA_INDEX && process.env.ELASTICSEARCH_SAMIKSHA_INDEX != "") ? process.env.ELASTICSEARCH_SAMIKSHA_INDEX : "samiksha"
const samikshaNotificationTypeName = (process.env.ELASTICSEARCH_SAMIKSHA_NOTIFICATIONS_TYPE && process.env.ELASTICSEARCH_SAMIKSHA_NOTIFICATIONS_TYPE != "") ? process.env.ELASTICSEARCH_SAMIKSHA_NOTIFICATIONS_TYPE : "user-notification"
const unnatiIndexName = (process.env.ELASTICSEARCH_UNNATI_INDEX && process.env.ELASTICSEARCH_UNNATI_INDEX != "") ? process.env.ELASTICSEARCH_UNNATI_INDEX : "unnati";
const languageIndex = (process.env.ELASTICSEARCH_SHIKSHALOKAM_INDEX && process.env.ELASTICSEARCH_SHIKSHALOKAM_INDEX != "") ? process.env.ELASTICSEARCH_SHIKSHALOKAM_INDEX : "shikshalokam";
const versionIndex = (process.env.ELASTICSEARCH_APP_VERSION_INDEX && process.env.ELASTICSEARCH_APP_VERSION_INDEX != "") ? process.env.ELASTICSEARCH_APP_VERSION_INDEX : "sl-app-version";
const languageTypeName = (process.env.ELASTICSEARCH_SHIKSHALOKAM_TYPE && process.env.ELASTICSEARCH_SHIKSHALOKAM_TYPE != "") ? process.env.ELASTICSEARCH_SHIKSHALOKAM_TYPE : "i18next";
let moment = require("moment-timezone")

var pushNotificationData = function (userId = "", notificatonData = {}) {

  return new Promise(async function (resolve, reject) {
    try {

      if (userId == "") throw "Invalid user id."

      let indexName = samikshaIndexName;

      if (notificatonData.appName && notificatonData.appName == "unnati") {
        indexName = unnatiIndexName
      }

      let userNotificationDocument = await getNotificationData(userId, notificatonData.appName);


      let notificationCreationObj = {
        id: userId,
        index: indexName,
        type: samikshaNotificationTypeName
      }

      if (userNotificationDocument.statusCode == 404) {

        notificatonData.id = 0

        notificationCreationObj["body"] = {
          notificationCount: 1,
          notificationUnreadCount: 1,
          notifications: [
            notificatonData
          ]
        }

        const userNotificationDocCreation = await createOrUpdateData(notificationCreationObj)

        if (!(userNotificationDocCreation.statusCode == 200 || userNotificationDocCreation.statusCode == 201)) {
          throw new Error("Failed to create notifications for user in elastic search.")
        }

      } else if (userNotificationDocument.statusCode == 200) {

        let notificationObject = userNotificationDocument.body._source

        let arrayOfMaximumValue = notificationObject.notifications.map(item => {
          return item.id
        })

        let maximumCount = Math.max(...arrayOfMaximumValue)

        notificatonData.id = maximumCount + 1

        notificationObject.notifications.push(notificatonData)

        notificationCreationObj["body"] = {
          doc: {
            notificationCount: notificationObject.notificationCount + 1,
            notificationUnreadCount: notificationObject.notificationUnreadCount + 1,
            notifications: notificationObject.notifications
          }
        }
        const userNotificationDocUpdation = await createOrUpdateData(notificationCreationObj, true)

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

var updateNotificationData = function (userId = "", notificatonNumber = 0, notificationData = {}, appName = "") {

  return new Promise(async function (resolve, reject) {
    try {

      if (userId == "") throw "Invalid user id."

      let indexName = samikshaIndexName;

      if (appName && appName == "unnati") {
        indexName = unnatiIndexName
      }

      let userNotificationDocument = await getNotificationData(userId, appName)

      if (userNotificationDocument.body.error && userNotificationDocument.statusCode == 404) {

        return resolve({
          success: false,
          message: "No notification document found."
        })

      } else if (userNotificationDocument.statusCode == 200) {

        let notificationObject = userNotificationDocument.body._source

        let matchedNotificationData = notificationObject.notifications.find(singleNotification => {
          return singleNotification.id === notificatonNumber
        })

        Object.keys(notificationData).forEach(keyToBeUpdated => {
          matchedNotificationData[keyToBeUpdated] = notificationData[keyToBeUpdated]
        })

        let updateData = {
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
        }

        const userNotificationDocUpdation = await createOrUpdateData(updateData, true)

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

var getNotificationData = function (userId = "", appName = "") {

  return new Promise(async function (resolve, reject) {
    try {

      if (!elasticsearch.client) throw "Elastic search is down."

      if (userId == "") throw "Invalid user id."


      let notificationInfo = {};

      let indexName = samikshaIndexName;

      if (appName && appName == "unnati") {
        indexName = unnatiIndexName;
      }

      notificationInfo["id"] = userId;
      notificationInfo["index"] = indexName;
      notificationInfo["type"] = samikshaNotificationTypeName;

      const userNotificationDocument = await getData(notificationInfo)

      return resolve(userNotificationDocument)

    } catch (error) {
      return reject(error);
    }
  });
};

var deleteReadOrUnReadNotificationData = function (users = "all", notificationData) {

  return new Promise(async function (resolve, reject) {
    try {

      let appIndex = "";

      if (notificationData.condition.index && notificationData.condition.index !== "") {
        appIndex = notificationData.condition.index
      }

      let indexName = samikshaIndexName;

      if (appIndex === "unnati") {
        indexName = unnatiIndexName
      }

      let allData = await searchForAllData(indexName, samikshaNotificationTypeName);

      let currentDate = moment(new Date());
      let allUserData = allData;

      if (Array.isArray(users) && users.length > 0) {

        allUserData = allData.filter(singleIndexData => {
          if (users.indexOf(singleIndexData.id) !== -1) {
            return singleIndexData.notifications
          }
        })

      }

      for (let pointerToIndexData = 0; pointerToIndexData < allUserData.length; pointerToIndexData++) {

        let userId = allUserData[pointerToIndexData].id;
        let notificationsSize = allUserData[pointerToIndexData].notifications.length

        for (let notificationIndex = 0; notificationIndex < notificationsSize; notificationIndex++) {

          let currentNotificationData = allUserData[pointerToIndexData].notifications[notificationIndex]
          let notificationCreatedDate = moment(currentNotificationData.created_at);
          let dateDifferenceFromTheCreatedDate = currentDate.diff(notificationCreatedDate, 'days');

          if (currentNotificationData.is_read === notificationData.condition.is_read && dateDifferenceFromTheCreatedDate >= notificationData.condition.dateDifference) {
            await deleteNotificationData(userId, currentNotificationData.id, appIndex)
          }
        }
      }
    }

    catch (error) {
      return reject(error);
    }
  });
};

var deleteNotificationData = function (userId, notificationId, appIndex) {
  return new Promise(async function (resolve, reject) {
    try {
      let userNotificationDocument = await getNotificationData(userId, appIndex)

      if (userNotificationDocument.statusCode == 404) {

        return resolve({
          success: false,
          message: "No notification document found."
        })

      } else if (userNotificationDocument.statusCode == 200) {

        let indexName = appIndex !== "" ? appIndex : samikshaIndexName;

        let notificationObject = userNotificationDocument.body._source

        let findIndexOfNotification = notificationObject.notifications.findIndex(item => item.id === notificationId)

        notificationObject.notifications.splice(findIndexOfNotification, 1)

        let userNotificationDocDeletion;

        if (notificationObject.notifications.length > 0) {

          let updateData = {
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
          }

          userNotificationDocDeletion = await createOrUpdateData(updateData, true)

        } else {

          userNotificationDocDeletion = await deleteData({
            id: userId,
            index: indexName,
            type: samikshaNotificationTypeName
          })

        }

        if (userNotificationDocDeletion.statusCode !== 200) {
          throw "Failed to delete notification in elastic search."
        }
        return resolve()
      }
    } catch (error) {
      return reject(error);
    }
  })
}

var pushLanguageData = function (languageId = "", languageData = {}) {

  return new Promise(async function (resolve, reject) {
    try {

      if (languageId == "") throw "Invalid language id."

      let languageInfo = {};

      languageInfo["id"] = languageId
      languageInfo["index"] = languageIndex;
      languageInfo["type"] = languageTypeName;

      let languageDocument = await getData(languageInfo);

      let languageObj = { ...languageInfo }

      if (languageDocument.statusCode === 404) {

        languageObj["body"] = {
          translate: languageData
        }

        const languageDocCreation = await createOrUpdateData(languageObj)

        if (!(languageDocCreation.statusCode == 200 || languageDocCreation.statusCode == 201)) {
          throw new Error(`Failed to push language ${languageId} in elastic search.`)
        }

      } else if (languageDocument.statusCode == 200) {

        languageObj["body"] = {
          doc: {
            translate: languageData
          }
        }

        const languageDocUpdation = await createOrUpdateData(languageObj, true)

        if (languageDocUpdation.statusCode !== 200) {
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

var updateAppVersion = function (versionData) {

  return new Promise(async function (resolve, reject) {
    try {

      if (versionData.appName == "") throw "Invalid appName."

      let versionInfo = {};

      versionInfo["id"] = versionData.appName
      versionInfo["index"] = versionIndex;
      versionInfo["type"] = samikshaNotificationTypeName;

      let appVersionDocument = await getData(versionInfo);

      let versionObj = { ...versionInfo }

      if (appVersionDocument.statusCode === 404) {

        versionData.action = "alertModal";
        versionData.id = 0;

        versionObj["body"] = {
          versions: [versionData]
        }

        const appVersionCreation = await createOrUpdateData(versionObj);

        if (!(appVersionCreation.statusCode == 200 || appVersionCreation.statusCode == 201)) {
          throw new Error(`Failed to push app version in elastic search.`)
        }

      } else if (appVersionDocument.statusCode == 200) {

        let singleVersionObject = appVersionDocument.body._source;

        let checkIfminimumVersionExistsOrNot = singleVersionObject.versions.find(item => item.payload.appVersion === versionData.minimum_version);

        if (checkIfminimumVersionExistsOrNot) {

          let allVersionIds = singleVersionObject.versions.map(item => {
            return item.id
          });

          let maximumAppVersionId = Math.max(...allVersionIds)

          versionData.id = maximumAppVersionId + 1;

          singleVersionObject.versions.push(notificatonData)

          versionObj["body"] = {
            doc: {
              versions: singleVersionObject.versions
            }
          }

          const appVersionUpdation = await createOrUpdateData(versionObj, true)

          if (appVersionUpdation.statusCode !== 200) {
            throw new Error("Failed to push notification to elastic search.")
          }

        }

      } else {
        throw "Something went wrong!"
      }

      return resolve({
        success: true
      })

    } catch (error) {
      return reject(error);
    }
  });
};

var pushAppVersionToLoggedInUser = function (userDetails, headers, appName) {

  return new Promise(async function (resolve, reject) {
    try {

      if (headers.appName == "") throw "Invalid appName."

      let versionInfo = {};

      versionInfo["id"] = headers.appname
      versionInfo["index"] = versionIndex;
      versionInfo["type"] = samikshaNotificationTypeName;

      let appVersionDocument = await getData(versionInfo);

      let versionObj = { ...versionInfo }

      if (appVersionDocument.statusCode === 200) {

        let versionData = appVersionDocument.body._source.versions;
        let updateAppVersion = versionData[versionData.length - 1];

        if (updateAppVersion.payload.platform === headers.platform && updateAppVersion.payload.appVersion !== headers.appversion) {

          const pushAppVersionInNotificationData = await pushNotificationData(userDetails, updateAppVersion);

          if (!pushAppVersionInNotificationData.success) {
            throw new Error(`Failed to push app version for particular user.`)
          }

          console.log("here");
        }

      }

      return resolve({
        success: true
      })

    } catch (error) {
      return reject(error);
    }
  });
};


var getLanguageData = function (languageId = "") {

  return new Promise(async function (resolve, reject) {
    try {

      if (!elasticsearch.client) throw "Elastic search is down."

      if (languageId == "") throw "Invalid language id."

      const languageDocument = await getData(languageId, {
        index: languageIndex,
        type: languageTypeName
      })

      return resolve(languageDocument)

    } catch (error) {
      return reject(error);
    }
  });
};

var getAllLanguagesData = function () {
  return new Promise(async function (resolve, reject) {
    try {

      if (!elasticsearch.client) throw "Elastic search is down."

      const checkIndexExistsOrNot = await indexExistOrNot(languageIndex)

      const checkTypeExistsOrNot = await typeExistsOrNot(languageIndex, languageTypeName)

      if (checkIndexExistsOrNot.statusCode !== 404 && checkTypeExistsOrNot.statusCode !== 404) {

        const userNotificationDocument = await searchForAllData(languageIndex, languageTypeName)
        return resolve(userNotificationDocument)
      }

    } catch (error) {
      return reject(error);
    }
  })
}

var getData = function (data) {

  return new Promise(async function (resolve, reject) {
    try {

      if (!data.id) {
        throw "id is required"
      }

      if (!data.index) {
        throw "index is required"
      }

      if (!data.type) {
        throw "type is required"
      }

      const result = await elasticsearch.client.get({
        id: data.id,
        index: data.index,
        type: data.type
      }, {
          ignore: [404],
          maxRetries: 3
        })

      return resolve(result)

    } catch (error) {
      return reject(error)
    }
  })
}

var createOrUpdateData = function (data, update = false) {

  return new Promise(async function (resolve, reject) {
    try {

      if (!data.id) {
        throw "id is required"
      }

      if (!data.index) {
        throw "index is required"
      }

      if (!data.type) {
        throw "type is required"
      }

      if (!data.body) {
        throw "body is required"
      }

      let result

      if (update) {
        result = await elasticsearch.client.update({
          id: data.id,
          index: data.index,
          type: data.type,
          body: data.body
        })
      } else {
        result = await elasticsearch.client.create({
          id: data.id,
          index: data.index,
          type: data.type,
          body: data.body
        })
      }

      return resolve(result)

    } catch (error) {
      return reject(error)
    }
  })
}

var indexExistOrNot = function (index) {

  return new Promise(async function (resolve, reject) {
    try {

      if (!index) {
        throw "index is not found"
      }

      let result = await elasticsearch.client.indices.exists({
        index: index
      })


      return resolve(result)

    } catch (error) {
      return reject(error)
    }
  })
}

var typeExistsOrNot = function (index, type) {

  return new Promise(async function (resolve, reject) {
    try {

      if (!index) {
        throw "index is required"
      }

      if (!type) {
        throw "type is required"
      }

      let result = await elasticsearch.client.indices.existsType({
        index: index,
        type: type
      })


      return resolve(result)

    } catch (error) {
      return reject(error)
    }
  })
}

var searchForAllData = function (index, type) {

  return new Promise(async function (resolve, reject) {
    try {

      if (!index) {
        throw "index is required"
      }

      if (!type) {
        throw "type is required"
      }

      const result = await elasticsearch.client.search({
        index: index,
        type: type,
        size: 1000
      })

      let response = []

      if (result.statusCode === 200 && result.body.hits.hits.length > 0) {

        result.body.hits.hits.forEach(eachResultData => {
          response.push(_.merge({ id: eachResultData._id }, eachResultData._source))
        })
      }

      return resolve(response)

    } catch (error) {
      return reject(error)
    }
  })
}

var deleteData = function (data) {

  return new Promise(async function (resolve, reject) {
    try {

      if (!data.id) {
        throw "id is required"
      }

      if (!data.index) {
        throw "index is required"
      }

      if (!data.type) {
        throw "type is required"
      }

      let result = await elasticsearch.client.delete({
        id: data.id,
        index: data.index,
        type: data.type
      })

      return resolve(result)

    } catch (error) {
      return reject(error)
    }
  })
}

module.exports = {
  pushNotificationData: pushNotificationData,
  getNotificationData: getNotificationData,
  updateNotificationData: updateNotificationData,
  deleteReadOrUnReadNotificationData: deleteReadOrUnReadNotificationData,
  deleteNotificationData: deleteNotificationData,
  pushLanguageData: pushLanguageData,
  getLanguageData: getLanguageData,
  getAllLanguagesData: getAllLanguagesData,
  getData: getData,
  updateAppVersion: updateAppVersion,
  pushAppVersionToLoggedInUser: pushAppVersionToLoggedInUser
};
