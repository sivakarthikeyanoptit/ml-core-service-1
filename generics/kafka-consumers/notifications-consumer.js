/**
 * name : languages-consumer.js
 * author : Aman Jung Karki
 * created-date : 05-Dec-2019
 * Description : consume languages data sent from kafka.
 */

//dependencies

const elasticSearchHelper = require(GENERIC_HELPERS_PATH + "/elastic-search");
let processingUsersTrack = {}
const slackClient = require(ROOT_PATH + "/generics/helpers/slack-communications");
const notificationsHelper = require(MODULES_BASE_PATH + "/notifications/in-app/helper")

/**
  * notification consumer message received.
  * @function
  * @name messageReceived
  * @param {String} message - consumer data
  * @returns {Promise} return a Promise.
*/


var messageReceived = function (message) {

  return new Promise(async function (resolve, reject) {

    try {
      logger.info("---------- In notifications consumer -------------");
      let parsedMessage = JSON.parse(message.value)

      if (parsedMessage.action === "deletion") {

        await elasticSearchHelper.deleteReadOrUnReadNotificationData(parsedMessage.users, parsedMessage)

      } else if (parsedMessage.action === "versionUpdate") {

        delete parsedMessage.action;
        await elasticSearchHelper.updateAppVersion(parsedMessage);

      } else {
        let userId = parsedMessage.user_id
        delete parsedMessage.user_id
        parsedMessage.is_read = false


        let checkifUserIdIsUnderProcessing = function (userId) {
          return (processingUsersTrack[userId]) ? true : false
        }

        let isUserUpdationUnderProcess = checkifUserIdIsUnderProcessing([userId])
        if (!isUserUpdationUnderProcess) {
          processingUsersTrack[userId] = true
          let elasticsearchPushResponse = await elasticSearchHelper.pushNotificationData(userId, parsedMessage)
          await notificationsHelper.pushNotificationMessageToDevice(userId, parsedMessage)
          delete processingUsersTrack[userId]
        } else {
          // repeat with the interval of 1 seconds
          let timerId = setInterval(async () => {
            isUserUpdationUnderProcess = checkifUserIdIsUnderProcessing([userId])
            if (!isUserUpdationUnderProcess) {
              clearInterval(timerId)
              processingUsersTrack[userId] = true
              let elasticsearchPushResponse = await elasticSearchHelper.pushNotificationData(userId, parsedMessage)
              await notificationsHelper.pushNotificationMessageToDevice(userId, parsedMessage)
              delete processingUsersTrack[userId]
            }
          }, 1000);

          // after 50 seconds stop
          setTimeout(() => {
            clearInterval(timerId);
            logger.error(`Failed to process user id - ${userId}`);
          }, 50000);
        }
      }

      return resolve("Message Received");
    } catch (error) {
      return reject(error);
    }

  });
};

/**
  * If message is not received.
  * @function
  * @name errorTriggered
  * @param {Object} error - error object
  * @returns {Promise} return a Promise.
*/

var errorTriggered = function (error) {

  return new Promise(function (resolve, reject) {

    try {
      let errorObject = {
        slackErrorName: gen.utils.checkIfEnvDataExistsOrNot("SLACK_ERROR_NAME"),
        color: gen.utils.checkIfEnvDataExistsOrNot("SLACK_ERROR_MESSAGE_COLOR"),
        message: `Kafka server is down on address ${error.address} and on port ${error.port} for notifications`
      }

      slackClient.sendMessageToSlack(errorObject)
      return resolve(error);
    } catch (error) {
      return reject(error);
    }

  });
};

module.exports = {
  messageReceived: messageReceived,
  errorTriggered: errorTriggered
};
