/**
 * name : kafka-communications.js
 * author : Aman Jung Karki
 * created-date : 05-Dec-2019
 * Description : Push message to kafka.
 */


//dependencies
const KAFKA_COMMUNICATION_ON_OFF = 
gen.utils.checkIfEnvDataExistsOrNot("KAFKA_COMMUNICATIONS_ON_OFF");

const NOTIFICATION_TOPIC = 
gen.utils.checkIfEnvDataExistsOrNot("NOTIFICATIONS_TOPIC");

const LANGUAGES_TOPIC =
gen.utils.checkIfEnvDataExistsOrNot("LANGUAGE_TOPIC");

const EMAIL_TOPIC = 
gen.utils.checkIfEnvDataExistsOrNot("EMAIL_TOPIC");

/**
  * Push notifications message to kafka.
  * @function
  * @name pushNotificationsDataToKafka
  * @param {Object} message - notification data.
  * @returns {Promise} returns a promise.
*/


let pushNotificationsDataToKafka = function (message) {
  return new Promise(async (resolve, reject) => {
    try {

      let kafkaPushStatus = await _pushMessageToKafka([{
        topic: NOTIFICATION_TOPIC,
        messages: JSON.stringify(message)
      }])

      return resolve(kafkaPushStatus)

    } catch (error) {
      return reject(error);
    }
  })
}

/**
  * Push Languages to kafka.
  * @function
  * @name pushLanguagesToKafka
  * @param {Object} language - language data.
  * @returns {Promise} returns a promise.
*/

let pushLanguagesToKafka = function (language) {
  return new Promise(async (resolve, reject) => {
    try {

      let kafkaPushStatus = await _pushMessageToKafka([{
        topic: LANGUAGES_TOPIC,
        messages: JSON.stringify(language)
      }])

      return resolve(kafkaPushStatus)

    } catch (error) {
      return reject(error);
    }
  })
}

/**
  * Push Email data to kafka.
  * @function
  * @name pushEmailToKafka
  * @param {Object} email - email data.
  * @returns {Promise} returns a promise.
*/

let pushEmailToKafka = function (email) {
  return new Promise(async (resolve, reject) => {
    try {

      let kafkaPushStatus = await _pushMessageToKafka([{
        topic: EMAIL_TOPIC,
        messages: JSON.stringify(email)
      }])

      return resolve(kafkaPushStatus)

    } catch (error) {
      return reject(error);
    }
  })
}

/**
  * Push to producer in kafka.
  * @function
  * @name _pushMessageToKafka
  * @param {Object} payload
  * @returns {Promise} returns a promise.
*/

let _pushMessageToKafka = function (payload) {
  return new Promise((resolve, reject) => {

    if (KAFKA_COMMUNICATION_ON_OFF != "ON") {
      throw reject("Kafka configuration is not done")
    }

    kafkaConnectionObject.kafkaProducer.send(payload, (err, data) => {
      if (err) {
        return reject("Kafka push to topic " + payload[0].topic + " failed.")
      } else {
        logger.info("Pushed to kafka");
        return resolve(data)
      }
    })

  }).then(result => {

    if (result[payload[0].topic][0] > 0) {
      return {
        status: "success",
        message: "Kafka push to topic " + payload[0].topic + " successful with number - " + result[payload[0].topic][0]
      }
    }

  }).catch((err) => {
    return {
      status: "failed",
      message: err
    }
  })
}

module.exports = {
  pushNotificationsDataToKafka: pushNotificationsDataToKafka,
  pushLanguagesToKafka: pushLanguagesToKafka,
  pushEmailToKafka: pushEmailToKafka
};
