//dependencies
const kafka = require('kafka-node')

var connect = function (config) {

  Producer = kafka.Producer
  KeyedMessage = kafka.KeyedMessage
  client = new kafka.KafkaClient({
    kafkaHost: config.host
  })

  client.on('error', function (error) {
    console.error.bind(console, "kafka connection error!")
  });

  producer = new Producer(client)

  producer.on('ready', function () {
    console.log("Connected to Kafka");
  });

  producer.on('error', function (err) {
    console.error.bind(console, "kafka producer creation error!")
  })

  Consumer = kafka.Consumer

  if (config.topics["notificationsTopic"] && config.topics["notificationsTopic"] != "") {

    let consumer = new Consumer(
      client,
      [
        { topic: config.topics["notificationsTopic"], offset: 0, partition: 0 }
      ],
      {
        autoCommit: true
      }
    );

    consumer.on('message', async function (message) {
      notificationsConsumer.messageReceived(message)
    });

    consumer.on('error', async function (error) {
      notificationsConsumer.errorTriggered(error)
    });

  }

  if (config.topics["languagesTopic"] && config.topics["languagesTopic"] != "") {

    let languageConsumer = new Consumer(
      client,
      [
        { topic: config.topics["languagesTopic"], offset: 0, partition: 0 }
      ],
      {
        autoCommit: true
      }
    );

    languageConsumer.on('message', async function (message) {
      notificationsConsumer.messageReceived(message)
    });

    languageConsumer.on('error', async function (error) {
      notificationsConsumer.errorTriggered(error)
    });

  }

  return {
    kafkaProducer: producer,
    kafkaConsumer: kafka.Consumer,
    kafkaClient: client,
    kafkaKeyedMessage: KeyedMessage
  };

};

module.exports = connect;
