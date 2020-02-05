//dependencies
let kafka = require('kafka-node');

const LANGUAGE_TOPIC = process.env.LANGUAGE_TOPIC || 
process.env.DEFAULT_LANGUAGE_TOPIC;

const EMAIL_TOPIC = process.env.EMAIL_TOPIC || 
process.env.DEFAULT_EMAIL_TOPIC;

const NOTIFICATIONS_TOPIC = process.env.NOTIFICATIONS_TOPIC || 
process.env.DEFAULT_NOTIFICATIONS_TOPIC;

const APPLICATION_CONFIG_TOPIC = process.env.APPLICATION_CONFIG_TOPIC || 
process.env.DEFAULT_APPLICATION_CONFIG_TOPIC;

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
    logger.error("Kafka connection error!");
  });

  let producer = new kafkaProducer(client);

  producer.on('ready', function () {
    logger.info('Connected to Kafka');
  });

  producer.on('error', function (err) {
    logger.error("Kafka producer creation error!");
  })

  
  _sendToKafkaConsumers(config.topics["notificationsTopic"],client, true);
  _sendToKafkaConsumers(config.topics["languagesTopic"],client,true);
  _sendToKafkaConsumers(config.topics["emailTopic"],client, false);
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

      if (message && message.topic === APPLICATION_CONFIG_TOPIC) {
        applicationconfigConsumer.messageReceived(message);
      } else if (message && message.topic === LANGUAGE_TOPIC) {
        languagesConsumer.messageReceived(message);
      } else if (message && message.topic === EMAIL_TOPIC) {
        emailConsumer.messageReceived(message, consumer);
      } else if (message && message.topic === NOTIFICATIONS_TOPIC) {
        notificationsConsumer.messageReceived(message);
      }
    });

    consumer.on('error', async function (error) {

      if(error.topics && error.topics[0] === APPLICATION_CONFIG_TOPIC) {
        applicationconfigConsumer.errorTriggered(error);
      } else if (error.topics && error.topics[0] === LANGUAGE_TOPIC) {
        languagesConsumer.errorTriggered(error);
      } else if (error.topics && error.topics[0] === EMAIL_TOPIC) {
        emailConsumer.errorTriggered(error);
      } else if(error.topics && error.topics[0] === NOTIFICATIONS_TOPIC){
        notificationsConsumer.errorTriggered(error);
      }
    });

  }
};

module.exports = connect;