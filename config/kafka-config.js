//dependencies
const kafka = require('kafka-node')

var connect = function(config) {

    Producer = kafka.Producer
    KeyedMessage = kafka.KeyedMessage
    client = new kafka.KafkaClient({
      kafkaHost:config.host
    })

    client.on('error', function(error) {
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

    if(config.topics["notificationsTopic"] && config.topics["notificationsTopic"] != "") {
 
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

          console.log("reciing ",message);
          const response = await notificationsConsumer.messageReceived(message)
        });

        consumer.on('error', async function (error) {
          console.log(error);
          const response = await notificationsConsumer.errorTriggered(error)
          console.log(response)
          console.log("Error processed.");
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
