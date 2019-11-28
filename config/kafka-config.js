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

  sendToKafkaConsumers(Consumer, config.topics["notificationsTopic"]);
  sendToKafkaConsumers(Consumer, config.topics["languagesTopic"]);

  return {
    kafkaProducer: producer,
    kafkaConsumer: kafka.Consumer,
    kafkaClient: client,
    kafkaKeyedMessage: KeyedMessage
  };

};

var sendToKafkaConsumers = function (Consumer, topic) {

  if (topic && topic != "") {

    let consumer = new Consumer(
      client,
      [
        { topic: topic, offset: 0, partition: 0 }
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
}

module.exports = connect;
