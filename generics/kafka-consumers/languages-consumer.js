const elastissearchHelper = require(GENERIC_HELPERS_PATH + "/elastic-search");
let slackClient = require(ROOT_PATH + "/generics/helpers/slack-communications");

var messageReceived = function (message) {

  return new Promise(async function (resolve, reject) {

    try {
      console.log("---------- In Consumer Message Function -------------")
      let parsedMessage = JSON.parse(message.value);

      if (parsedMessage.action === "language") {
        console.log(parsedMessage);
        console.log("elastic search");
        const id = parsedMessage.id;
        delete parsedMessage.id;
        delete parsedMessage.action;

        await elastissearchHelper.pushLanguageData(id, parsedMessage)
      }

      console.log("------------ Language Pack ----------", parsedMessage)
      console.log("In Language pack");
      return resolve("Message Received for language pack");
    } catch (error) {
      return reject(error);
    }

  });
};

var errorTriggered = function (error) {

  return new Promise(function (resolve, reject) {

    try {
      let errorObject = {
        message: `Kafka server is down on address ${error.address} and on port ${error.port} for language pack`
      }
      slackClient.kafkaErrorAlert(errorObject)
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
