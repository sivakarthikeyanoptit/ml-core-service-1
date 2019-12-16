//dependencies
let kafka = require('kafka-node');

/**
  * Kafka configuration.
  * @function
  * @name connect
  * @param {Object} config all kafka configurations.
  * @returns {Promise} returns a promise.
*/

var connect = function (config) {

  let kafkaProducer = kafka.Producer;
  let keyedMessage = kafka.KeyedMessage;
  let client = new kafka.KafkaClient({
    kafkaHost: config.host
  });

  client.on('error', function (error) {
    logger.error("kafka connection error!");
  });

  producer = new kafkaProducer(client)

  producer.on('ready', function () {
    logger.info('Connected to Kafka');
  });

  producer.on('error', function (err) {
    logger.error("kafka producer creation error!");
  })

  
  // _sendToKafkaConsumers(config.topics["notificationsTopic"],client, true);
  // _sendToKafkaConsumers(config.topics["languagesTopic"],client,true);
  // _sendToKafkaConsumers(config.topics["emailTopic"],client, false);
  _sendToKafkaConsumers(config.topics["appConfigTopic"],client, true);

  return {
    kafkaProducer: producer,
    kafkaConsumer: kafka.Consumer,
    kafkaClient: client,
    kafkaKeyedMessage: keyedMessage
  };

};

/**
  * Send data based on topic to kafka consumers
  * @function
  * @name _sendToKafkaConsumers
  * @param {String} topic - name of kafka topic.
  * @param {Boolean} [commit = false] - kafka commit. By default set to false.
*/

var _sendToKafkaConsumers = function (topic,client, commit = false) {

  let kafkaConsumer = kafka.Consumer;
  if (topic && topic != "") {

    let consumer = new kafkaConsumer(
      client,
      [
        { topic: topic, offset: 0, partition: 0 }
      ],
      {
        autoCommit: commit
      }
    );

    consumer.on('message', async function (message) {

      if (topic === process.env.APPLICATION_CONFIG_TOPIC) {
        applicationconfigConsumer.messageReceived(message);
      }
      else if (topic === process.env.LANGUAGE_TOPIC) {
        languagesConsumer.messageReceived(message)
      } else if (topic === process.env.EMAIL_TOPIC) {
        emailConsumer.messageReceived(message, consumer)
      } else {
        notificationsConsumer.messageReceived(message)
      }
    });

    consumer.on('error', async function (error) {

      if (topic === process.env.LANGUAGE_TOPIC) {
        languagesConsumer.errorTriggered(error);
      } else if (topic === process.env.EMAIL_TOPIC) {
        emailConsumer.errorTriggered(message, consumer)
      }
      else {
        notificationsConsumer.errorTriggered(error);
      }
    });

  }
};

module.exports = connect;