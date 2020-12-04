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

const IMPROVEMENT_PROJECT_NOTIFICATIONS_TOPIC = 
process.env.IMPROVEMENT_PROJECT_NOTIFICATIONS_TOPIC;

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
    kafkaHost : config.host
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

  
  _sendToKafkaConsumers(
    config.topics["notificationsTopic"],
    config.host
  );

  _sendToKafkaConsumers(
    config.topics["languagesTopic"],
    config.host
  );

  _sendToKafkaConsumers(
    config.topics["emailTopic"],
    config.host
  );

  _sendToKafkaConsumers(
    config.topics["appConfigTopic"],
    config.host
  );

  _sendToKafkaConsumers(
    config.topics["improvementProjectTopic"],
    config.host
  );
  

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
  * @param {String} host - kafka host
*/

var _sendToKafkaConsumers = function (topic,host) {

  if (topic && topic != "") {

    let consumer = new kafka.ConsumerGroup(
      {
          kafkaHost : host,
          groupId : process.env.KAFKA_GROUP_ID,
          autoCommit : true
      },topic 
    );  

    consumer.on('message', async function (message) {

      if (message && message.topic === APPLICATION_CONFIG_TOPIC) {
        applicationconfigConsumer.messageReceived(message);
      } else if (message && message.topic === LANGUAGE_TOPIC) {
        languagesConsumer.messageReceived(message);
      } else if (message && message.topic === EMAIL_TOPIC) {
        emailConsumer.messageReceived(message, consumer);
      } else if (message && message.topic === NOTIFICATIONS_TOPIC) {
        inappnotificationsConsumer.messageReceived(message);
        pushnotificationsConsumer.messageReceived(message);
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
        inappnotificationsConsumer.errorTriggered(error);
        pushnotificationsConsumer.errorTriggered(error);
      } 
    });

  }
};

module.exports = connect;