/**
 * name : improvement-project-notifications-consumer.js
 * author : Aman Jung Karki
 * created-date : 08-Sep-2020
 * Description : Improvement projects notifications.
 */

// Dependencies 

const pushNotificationsHelper = 
require(MODULES_BASE_PATH + "/notifications/push/helper");

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
      
      let parsedMessage = JSON.parse(message.value);

      let topic = 
      process.env.NODE_ENV + "-" + process.env.UNNATI_APP_NAME + process.env.TOPIC_FOR_ALL_USERS;

      let notification = {
        topicName : topic,
        title : parsedMessage.title,
        message : parsedMessage.text,
        data : {
          "title": parsedMessage.title,
          "text": parsedMessage.text,
          id: "0",
          is_read: JSON.stringify(parsedMessage.is_read),
          payload: JSON.stringify(parsedMessage.payload),
          action: parsedMessage.action,
          internal: JSON.stringify(parsedMessage.internal),
          created_at: parsedMessage.created_at,
          type: parsedMessage.type
        }
      };

      await pushNotificationsHelper.pushToTopic(notification);

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