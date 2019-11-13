//dependencies
const { Client } = require('@elastic/elasticsearch')
let slackClient = require("../generics/helpers/slack-communications");

var connect = function (config) {

  const elasticSearchClient = new Client({
    node: config.host,
    maxRetries: 5,
    requestTimeout: 60000,
    sniffOnStart: true
  })

  elasticSearchClient.ping({
  }, function (error) {
    if (error) {
      console.log(error)

      let errorData = {
        host: config.host,
        message: 'Elasticsearch cluster is down!'
      }

      slackClient.elasticSearchErrorAlert(errorData)
      console.error('Elasticsearch cluster is down!');
    } else {
      console.log('Elasticsearch connection established.');
    }
  });

  return {
    client: elasticSearchClient
  };

};

module.exports = connect;
