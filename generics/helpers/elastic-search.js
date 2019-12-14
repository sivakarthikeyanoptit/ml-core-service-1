/**
 * name : elastic-search.js
 * author : Aman Jung Karki
 * created-date : 05-Dec-2019
 * Description : elastic search common functionality
 */

//dependencies
const SAMIKSHA_INDEX = 
gen.utils.checkIfEnvDataExistsOrNot("ELASTICSEARCH_SAMIKSHA_INDEX");

const SAMIKSHA_NOTIFICATION_TYPE = 
gen.utils.checkIfEnvDataExistsOrNot("ELASTICSEARCH_SAMIKSHA_NOTIFICATIONS_TYPE");

const UNNATI_INDEX = 
gen.utils.checkIfEnvDataExistsOrNot("ELASTICSEARCH_UNNATI_INDEX");

const DEFAULT_LANGUAGE_INDEX = 
gen.utils.checkIfEnvDataExistsOrNot("SAMIKSHA_LANGUAGE_INDEX");

const DEFAULT_LANGUGAE_TYPE = 
gen.utils.checkIfEnvDataExistsOrNot("SAMIKSHA_LANGUAGE_TYPE");

const UNNATI_LANGUAGE_INDEX = 
gen.utils.checkIfEnvDataExistsOrNot("UNNATI_LANGUAGE_INDEX");

const UNNATI_LANGUAGE_TYPE = 
gen.utils.checkIfEnvDataExistsOrNot("UNNATI_LANGUAGE_TYPE");

const APP_VERSION_INDEX = 
gen.utils.checkIfEnvDataExistsOrNot("ELASTICSEARCH_APP_RELEASES_INDEX");


let moment = require("moment-timezone");

/**
  * Push notification data to elastic search.
  * @function
  * @name pushNotificationData
  * @param {String} userId - logged in user id.
  * @param {Object} [notificatonData = {}] - notification data.
  * @returns {Promise} returns a promise.
*/

var pushNotificationData = function (userId = "", notificatonData = {}) {

  return new Promise(async function (resolve, reject) {
    try {

      if (userId == "") {
        throw "Invalid user id."
      }

      let userNotificationDocument = 
      await getNotificationData(userId, notificatonData.appName);

      if (userNotificationDocument.statusCode == 404) {

        await _createInAppNotification(userId, notificatonData);

      } else if (userNotificationDocument.statusCode == 200) {

        await _updateInAppNotification(userId, notificatonData, userNotificationDocument);

      } else {
        throw "Something went wrong!";
      }

      return resolve({
        success: true,
        message: "Notification successfully pushed to elastic search."
      });

    } catch (error) {
      return reject(error);
    }
  });
};

/**
  * Helper function for pushNotificationData.
  * @function
  * @name _createInAppNotification
  * @param {String} userId - logged in user id.
  * @param {Object} notificatonData  - notification data.
  * @returns {Promise} returns a promise.
*/

var _createInAppNotification = function (userId, notificationData) {
  return new Promise(async function (resolve, reject) {
    try {

      let indexName = SAMIKSHA_INDEX;

      if (notificationData.appName && notificationData.appName === "unnati") {
        indexName = UNNATI_INDEX;
      }

      let notificationCreationObj = {
        id: userId,
        index: indexName,
        type: SAMIKSHA_NOTIFICATION_TYPE
      };

      notificationData.id = 0;

      notificationCreationObj["body"] = {
        notificationCount: 1,
        notificationUnreadCount: 1,
        notifications: [
          notificationData
        ]
      };

      const userNotificationDocCreation = 
      await _createOrUpdateData(notificationCreationObj);

      if (
        !(userNotificationDocCreation.statusCode == 200 || 
          userNotificationDocCreation.statusCode == 201)) {
        throw new Error("Failed to create notifications for user in elastic search.");
      }

      return resolve();
    }
    catch (error) {
      return reject(error);
    }
  })
};

/**
  * Helper function for pushNotificationData.
  * @function
  * @name _updateInAppNotification
  * @param {String} userId - logged in user id.
  * @param {Object} notificationDataToBeAdded  - notification data.
  * @param {Object} currentNotifications  - current notifications. 
  * @returns {Promise} returns a promise.
*/

var _updateInAppNotification = function (
  userId, 
  notificationDataToBeAdded, 
  currentNotifications) {

    return new Promise(async function (resolve, reject) {
      try {

        let indexName = SAMIKSHA_INDEX;

        if (notificationDataToBeAdded.appName && 
          notificationDataToBeAdded.appName == "unnati") {
            indexName = UNNATI_INDEX;
        }

        let notificationUpdationObj = {
          id: userId,
          index: indexName,
          type: SAMIKSHA_NOTIFICATION_TYPE
        };

        let notificationObject = currentNotifications.body._source;

        let arrayOfIds = notificationObject.notifications.map(item => {
          return item.id
        });

        let maximumId = Math.max(...arrayOfIds);

        notificationDataToBeAdded.id = maximumId + 1;

        notificationObject.notifications.push(notificationDataToBeAdded);

        notificationUpdationObj["body"] = {
          doc: {
            notificationCount: notificationObject.notificationCount + 1,
            notificationUnreadCount: notificationObject.notificationUnreadCount + 1,
            notifications: notificationObject.notifications
          }
        };

        const userNotificationDocUpdation = 
        await _createOrUpdateData(notificationUpdationObj, true);

      if (
        userNotificationDocUpdation.statusCode !== 200 || 
        userNotificationDocUpdation.body.result !== "updated") {
          throw new Error("Failed to push notification to elastic search.");
      }

        return resolve();
    }
    catch (error) {
      return reject(error);
    }
  })
};

/**
  * Update notification data.
  * @function
  * @name _updateInAppNotification
  * @param {String} [userId = ""] - logged in user id.
  * @param {Number} [notificatonNumber = 0] - id of notification.
  * @param {Number} [notificationData = {}] - notification data to update.
  * @param {Object} [notificationData = {}] - notification data to update.
  * @param {String} [appName = ""] - app name.
  * @returns {Promise} returns a promise.
*/

var updateNotificationData = function (
  userId = "", 
  notificatonNumber = 0, 
  notificationData = {}, 
  appName = "") {


    return new Promise(async function (resolve, reject) {
      try {

        if (userId == "") {
          throw "Invalid user id."
        }

        let indexName = SAMIKSHA_INDEX;

        if (appName && appName == "unnati") {
          indexName = UNNATI_INDEX;
        }

        let userNotificationDocument = 
        await getNotificationData(userId, appName);

      if (
        userNotificationDocument.body.error && 
        userNotificationDocument.statusCode == 404) {
          
          return resolve({
          success: false,
          message: "No notification document found."
          });

      } else if (userNotificationDocument.statusCode == 200) {

        let notificationObject = userNotificationDocument.body._source;

        let matchedNotificationData = 
        notificationObject.notifications.find(singleNotification => {
          return singleNotification.id === notificatonNumber
        });

        Object.keys(notificationData).forEach(keyToBeUpdated => {
          matchedNotificationData[keyToBeUpdated] = notificationData[keyToBeUpdated];
        });

        let updateData = {
          id: userId,
          index: indexName,
          type: SAMIKSHA_NOTIFICATION_TYPE,
          body: {
            doc: {
              notificationCount: notificationObject.notifications.length,
              notificationUnreadCount: 
              notificationObject.notifications.filter(
                notification => 
                notification.is_read == false).length,
              notifications: notificationObject.notifications
            }
          }
        };

        const userNotificationDocUpdation = 
        await _createOrUpdateData(updateData, true);

        if (userNotificationDocUpdation.statusCode !== 200) {
          throw "Failed to push notification to elastic search.";
        }

      } else {
        throw "Something went wrong!";
      }

      return resolve({
        success: true,
        message: "Notification successfully updated in elastic search."
      });

    } catch (error) {
      return reject(error);
    }
  });
};

/**
  *  Get notification data based on userId.
  * @function
  * @name getNotificationData
  * @param {String} [userId = ""] - logged in user id.
  * @param {String} [appName = ""] - app name.
  * @returns {Promise} returns a promise.
*/

var getNotificationData = function (userId = "", appName = "") {

  return new Promise(async function (resolve, reject) {
    try {

      if (!elasticsearch.client){
        throw "Elastic search is down.";
      }

      if (userId == "") {
        throw "Invalid user id.";
      }

      let notificationInfo = {};

      let indexName = SAMIKSHA_INDEX;

      if (appName && appName == "unnati") {
        indexName = UNNATI_INDEX;
      }

      notificationInfo["id"] = userId;
      notificationInfo["index"] = indexName;
      notificationInfo["type"] = SAMIKSHA_NOTIFICATION_TYPE;

      const userNotificationDocument = await getData(notificationInfo);

      return resolve(userNotificationDocument);

    } catch (error) {
      return reject(error);
    }
  });
};

/**
  * Delete read or unRead notification data.
  * @function
  * @name deleteReadOrUnReadNotificationData
  * @param {String} [users = "all"] 
  * @param {Object} notificationData - notification data to update.
  * @returns {Promise} returns a promise.
*/

var deleteReadOrUnReadNotificationData = function (users = "all", notificationData) {

  return new Promise(async function (resolve, reject) {
    try {

      let appIndex = "";

      if (
        notificationData.condition.index && 
        notificationData.condition.index !== "") {
        appIndex = notificationData.condition.index;
      }

      let indexName = SAMIKSHA_INDEX;

      if (appIndex === "unnati") {
        indexName = UNNATI_INDEX;
      }

      let allData = await _searchForAllData(indexName, SAMIKSHA_NOTIFICATION_TYPE);

      let currentDate = moment(new Date());
      let allUserData = allData;

      if (Array.isArray(users) && users.length > 0) {

        allUserData = allData.filter(singleIndexData => {
          if (users.indexOf(singleIndexData.id) !== -1) {
            return singleIndexData.notifications;
          }
        })

      }

      for (
        let pointerToIndexData = 0; 
        pointerToIndexData < allUserData.length; 
        pointerToIndexData++
        ) {
          
          let userId = allUserData[pointerToIndexData].id;
          let notificationsSize = allUserData[pointerToIndexData].notifications.length;

          for (
            let notificationIndex = 0; 
            notificationIndex < notificationsSize;
            notificationIndex++) {

              let currentNotificationData = 
              allUserData[pointerToIndexData].notifications[notificationIndex];

              let notificationCreatedDate = 
              moment(currentNotificationData.created_at);

              let dateDifferenceFromTheCreatedDate = 
              currentDate.diff(notificationCreatedDate, 'days');

              if (
                currentNotificationData.is_read === notificationData.condition.is_read 
                && dateDifferenceFromTheCreatedDate >= notificationData.condition.dateDifference
                ) {
                await deleteNotificationData(userId, currentNotificationData.id, appIndex);
              }
          }
      }
    }

    catch (error) {
      return reject(error);
    }
  });
};

/**
  * Delete notification data based on userId.
  * @function
  * @name deleteNotificationData
  * @param {String} userId - logged in user id.
  * @param {Number} notificationId - id of notification.
  * @param {String} appIndex - elastic search app index.
  * @returns {Promise} returns a promise.
*/

var deleteNotificationData = function (userId, notificationId, appIndex) {
  return new Promise(async function (resolve, reject) {
    try {
      let userNotificationDocument = await getNotificationData(userId, appIndex);

      if (userNotificationDocument.statusCode == 404) {

        return resolve({
          success: false,
          message: "No notification document found."
        });

      } else if (userNotificationDocument.statusCode == 200) {

        let indexName = appIndex !== "" ? appIndex : SAMIKSHA_INDEX;

        let notificationObject = userNotificationDocument.body._source;

        let findIndexOfNotification = 
        notificationObject.notifications.findIndex(item => item.id === notificationId);

        notificationObject.notifications.splice(findIndexOfNotification, 1);

        let userNotificationDocDeletion;

        if (notificationObject.notifications.length > 0) {

          let updateData = {
            id: userId,
            index: indexName,
            type: SAMIKSHA_NOTIFICATION_TYPE,
            body: {
              doc: {
                notificationCount: notificationObject.notifications.length,
                notificationUnreadCount: 
                notificationObject.notifications.filter(
                  notification => notification.is_read == false
                  ).length,
                notifications: notificationObject.notifications
              }
            }
          };

          userNotificationDocDeletion = await _createOrUpdateData(updateData, true);

        } else {

          userNotificationDocDeletion = await _deleteData({
            id: userId,
            index: indexName,
            type: SAMIKSHA_NOTIFICATION_TYPE
          });

        }

        if (userNotificationDocDeletion.statusCode !== 200) {
          throw "Failed to delete notification in elastic search.";
        }
        return resolve();
      }
    } catch (error) {
      return reject(error);
    }
  })
};

/**
  *  Push language data in elastic search.
  * @function
  * @name deleteNotificationData
  * @param {String} languageId - language id.
  * @param {Object} [languageData = {}] - Language data.
  * @returns {Promise} returns a promise.
*/


var pushLanguageData = function (languageId = "", languageData = {},appName) {

  return new Promise(async function (resolve, reject) {
    try {

      if (languageId == "") {
        throw "Invalid language id.";
      }

      let languageInfo = {};
      languageInfo["index"] = DEFAULT_LANGUAGE_INDEX;
      languageInfo["type"] = DEFAULT_LANGUGAE_TYPE;
      
      if(appName !== "" && appName === "unnati") {
        languageInfo["index"] = UNNATI_LANGUAGE_INDEX;
        languageInfo["type"] = UNNATI_LANGUAGE_TYPE;
      }

      languageInfo["id"] = languageId;

      let languageDocument = await getData(languageInfo);

      let languageObj = { ...languageInfo }

      if (languageDocument.statusCode === 404) {

        languageObj["body"] = {
          translate: languageData
        }

        logger.info("pushed to elastic search");
        const languageDocCreation = await _createOrUpdateData(languageObj)

        if (
          !(languageDocCreation.statusCode == 200 || 
            languageDocCreation.statusCode == 201)
            ) {
          throw new Error(`Failed to push language ${languageId} in elastic search.`)
        }

      } else if (languageDocument.statusCode == 200) {

        languageObj["body"] = {
          doc: {
            translate: languageData
          }
        }

        const languageDocUpdation = await _createOrUpdateData(languageObj, true);

        if (languageDocUpdation.statusCode !== 200) {
          throw new Error("Failed to push notification to elastic search.");
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

/**
  * update app version data and push it to elastic search.
  * @function
  * @name updateAppVersion
  * @param {Object} versionData - Version data.
  * @returns {Promise} returns a promise.
*/

var updateAppVersion = function (versionData) {

  return new Promise(async function (resolve, reject) {
    try {

      if (versionData.appName == "") throw "Invalid appName.";

      let versionInfo = {};

      versionInfo["id"] = versionData.appName;
      versionInfo["index"] = APP_VERSION_INDEX;
      versionInfo["type"] = SAMIKSHA_NOTIFICATION_TYPE;

      let appVersionDocument = await getData(versionInfo);

      let versionObj = { ...versionInfo };

      versionData.action = "alertModal";

      if (appVersionDocument.statusCode === 404) {

        versionObj["body"] = versionData;

        const appVersionCreation = await _createOrUpdateData(versionObj);

        if (
          !(appVersionCreation.statusCode == 200 || 
            appVersionCreation.statusCode == 201)) {
          throw new Error(`Failed to push app version in elastic search.`);
        }

      } else if (appVersionDocument.statusCode == 200) {

        let existingLatestVersion = appVersionDocument.body._source;

        if (existingLatestVersion.payload.appVersion !== versionData.payload.appVersion) {

          versionObj["body"] = {
            doc: versionData
          };

          const appVersionUpdation = await _createOrUpdateData(versionObj, true);

          if (appVersionUpdation.statusCode !== 200) {
            throw new Error("Failed to push notification to elastic search.");
          }

        }

      } else {
        throw "Something went wrong!";
      }

      return resolve({
        success: true
      });

    } catch (error) {
      return reject(error);
    }
  });
};

/**
  * update app version data and push to loggedin user and display as an in-app.
  * @function
  * @name pushAppVersionToLoggedInUser
  * @param {Object} userDetails - logged in user details.
  * @param {Object} headers - headers data.
  * @param {String} headers.appName - name of the app. 
  * @returns {Promise} returns a promise.
*/


var pushAppVersionToLoggedInUser = function (userDetails, headers, appName) {

  return new Promise(async function (resolve, reject) {
    try {

      if (headers.appName == "") throw "Invalid appName.";

      let versionInfo = {};

      versionInfo["id"] = headers.appname;
      versionInfo["index"] = APP_VERSION_INDEX;
      versionInfo["type"] = SAMIKSHA_NOTIFICATION_TYPE;

      let appVersionDocument = await getData(versionInfo);

      if (appVersionDocument.statusCode === 200) {

        let versionData = appVersionDocument.body._source;
        versionData["created_at"] = new Date();

        let userNotificationDocument = 
        await getNotificationData(userDetails, versionData.appName);

        if (userNotificationDocument.statusCode === 404) {
          await _createInAppNotification(userDetails, versionData);
        } else {

          let notificationData = 
          userNotificationDocument.body._source.notifications.find(
            item => item.action === "alertModal" && 
            item.payload.appVersion === versionData.payload.appVersion);

          if (!notificationData) {
            await _updateInAppNotification(userDetails, versionData, userNotificationDocument);
          }

        }

      }

      return resolve({
        success: true
      });

    } catch (error) {
      return reject(error);
    }
  });
};

/**
  * Get the language data based on language id.
  * @function
  * @name getLanguageData
  * @param {String} languageId - Language Id.
  * @returns {Promise} returns a promise.
*/

var getLanguageData = function (languageId = "") {

  return new Promise(async function (resolve, reject) {
    try {

      if (!elasticsearch.client) throw "Elastic search is down.";

      if (languageId == "") throw "Invalid language id.";

      const languageDocument = await getData(languageId, {
        index: LANGUAGE_INDEX,
        type: LANGUGAE_TYPE
      });

      return resolve(languageDocument);

    } catch (error) {
      return reject(error);
    }
  });
};

/**
  *  Get the list of all the languages.
  * @function
  * @name getAllLanguagesData
  * @returns {Promise} returns a promise.
*/

var getAllLanguagesData = function (appName) {
  return new Promise(async function (resolve, reject) {
    try {

      if (!elasticsearch.client) {
        throw "Elastic search is down.";
      }

      let languageIndex = DEFAULT_LANGUAGE_INDEX;
      let languageType = DEFAULT_LANGUGAE_TYPE;

      if(appName === "unnati"){
        languageIndex = UNNATI_LANGUAGE_INDEX;
        languageType = UNNATI_LANGUAGE_TYPE;
      }

      const checkIndexExistsOrNot = await _indexExistOrNot(languageIndex);

      const checkTypeExistsOrNot = 
      await _typeExistsOrNot(languageIndex, languageType);

      let userNotificationDocument = [];

      if (checkIndexExistsOrNot.statusCode !== 404 && 
        checkTypeExistsOrNot.statusCode !== 404) {

          userNotificationDocument = 
          await _searchForAllData(languageIndex, languageType);
      }
      
      return resolve(userNotificationDocument);

    } catch (error) {
      return reject(error);
    }
  })
};

/**
  * Get all data based on id,index and type.
  * @function
  * @name getData
  * @returns {Promise} returns a promise.
*/

var getData = function (data) {

  return new Promise(async function (resolve, reject) {
    try {

      if (!data.id) {
        throw "id is required";
      }

      if (!data.index) {
        throw "index is required";
      }

      if (!data.type) {
        throw "type is required";
      }

      const result = await elasticsearch.client.get({
        id: data.id,
        index: data.index,
        type: data.type
      }, {
          ignore: [404],
          maxRetries: 3
        });

      return resolve(result);

    } catch (error) {
      return reject(error);
    }
  })
};

/**
  * Create Or update operation.
  * @function
  * @name _createOrUpdateData
  * @param {Object} data - Data to be created or updated.
  * @param {String} [update = false] - if update is true update else create.
  * @returns {Promise} returns a promise.
*/

var _createOrUpdateData = function (data, update = false) {

  return new Promise(async function (resolve, reject) {
    try {

      if (!data.id) {
        throw "id is required";
      }

      if (!data.index) {
        throw "index is required";
      }

      if (!data.type) {
        throw "type is required";
      }

      if (!data.body) {
        throw "body is required";
      }

      let result;

      if (update) {
        result = await elasticsearch.client.update({
          id: data.id,
          index: data.index,
          type: data.type,
          body: data.body
        });
      } else {
        result = await elasticsearch.client.create({
          id: data.id,
          index: data.index,
          type: data.type,
          body: data.body
        });
      }

      return resolve(result);

    } catch (error) {
      return reject(error);
    }
  })
};

/**
  * Check for index exists or not.
  * @function
  * @name _indexExistOrNot
  * @param {String} index - name of the index.
  * @returns {Promise} returns a promise.
*/

var _indexExistOrNot = function (index) {

  return new Promise(async function (resolve, reject) {
    try {

      if (!index) {
        throw "index is not found";
      }

      let result = await elasticsearch.client.indices.exists({
        index: index
      });

      return resolve(result);

    } catch (error) {
      return reject(error);
    }
  })
};

/**
  * Check for index exists or not.
  * @function
  * @name _typeExistsOrNot
  * @param {String} index - name of the index for elastic search.
  * @param {String} type - type for elastic search. 
  * @returns {Promise} returns a promise.
*/

var _typeExistsOrNot = function (index, type) {

  return new Promise(async function (resolve, reject) {
    try {

      if (!index) {
        throw "index is required";
      }

      if (!type) {
        throw "type is required";
      }

      let result = await elasticsearch.client.indices.existsType({
        index: index,
        type: type
      });

      return resolve(result);

    } catch (error) {
      return reject(error);
    }
  })
};

/**
  * search operation.
  * @function
  * @name _searchForAllData
  * @param {String} index - name of the index for elastic search.
  * @param {String} type - type for elastic search. 
  * @returns {Promise} returns a promise.
*/

var _searchForAllData = function (index, type) {

  return new Promise(async function (resolve, reject) {
    try {

      if (!index) {
        throw "index is required";
      }

      if (!type) {
        throw "type is required";
      }

      const result = await elasticsearch.client.search({
        index: index,
        type: type,
        size: 1000
      });

      let response = [];

      if (result.statusCode === 200 && result.body.hits.hits.length > 0) {

        result.body.hits.hits.forEach(eachResultData => {
          response.push(_.merge({ id: eachResultData._id }, eachResultData._source));
        })
      }

      return resolve(response);

    } catch (error) {
      return reject(error);
    }
  })
};

/**
  * delete operation.
  * @function
  * @name _deleteData
  * @param {Object} data - delete
  * @returns {Promise} returns a promise.
*/

var _deleteData = function (data) {

  return new Promise(async function (resolve, reject) {
    try {

      if (!data.id) {
        throw "id is required";
      }

      if (!data.index) {
        throw "index is required";
      }

      if (!data.type) {
        throw "type is required";
      }

      let result = await elasticsearch.client.delete({
        id: data.id,
        index: data.index,
        type: data.type
      });

      return resolve(result);

    } catch (error) {
      return reject(error);
    }
  })
};

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