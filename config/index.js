/**
 * Project          : Shikshalokam-Kendra
 * Module           : Configuration
 * Source filename  : index.js
 * Description      : Environment related configuration variables
 */

let db_connect = function (configData) {
  global.database = require("./db-config")(
    configData.db.connection.mongodb
  );
  global.ObjectId = database.ObjectId;
  global.Abstract = require("../generics/abstract");
};

let kafka_connect = function (configData) {
  global.kafkaConnectionObject = require("./kafka-config")(
    configData.Kafka_Config
  );
};


let elasticsearch_connect = function (configData) {
  global.elasticsearch = require("./elastic-search-config")(
    configData.Elasticsearch_Config
  );
};

const configuration = {
  root: require("path").normalize(__dirname + "/.."),
  app: {
    name: "sl-kendra"
  },
  host: process.env.HOST || "http://localhost",
  port: process.env.PORT || 4401,
  log: process.env.LOG || "debug",
  db: {
    connection: {
      mongodb: {
        host: process.env.MONGODB_URL || "mongodb://localhost:27017",
        user: "",
        pass: "",
        database: process.env.DB || "sl-assessment",
        options: {
          useNewUrlParser: true
        }
      }
    },
    plugins: {
      timestamps: true,
      elasticSearch: false,
      softDelete: true,
      autoPopulate: false,
      timestamps_fields: {
        createdAt: "createdAt",
        updatedAt: "updatedAt"
      }
    }
  },
  Kafka_Config: {
    host: process.env.KAFKA_URL || "10.160.0.8:9092",
    topics: {
      notificationsTopic: process.env.NOTIFICATIONS_TOPIC || "sl-notifications-dev"
    }
  },
  Elasticsearch_Config: {
    host: process.env.ELASTICSEARCH_HOST_URL || "http://10.160.0.3:9092"
  },
  version: "1.0.0",
  URLPrefix: "/api/v1",
  webUrl: "https://dev.shikshalokam.org"
};

db_connect(configuration);

kafka_connect(configuration);

elasticsearch_connect(configuration);

module.exports = configuration;
