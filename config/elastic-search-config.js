/**
 * name : elastic-search-config.js
 * author : Aman Jung Karki
 * created-date : 05-Dec-2019
 * Description : Elastic search configuration file.
 */


//dependencies
let { Client } = require('@elastic/elasticsearch')
let slackClient = require("../generics/helpers/slack-communications");

/**
 * Elastic search connection.
 * @function
 * @name connect
 * @param {Object} config All elastic search configurations.
 * @return {Object} elastic search client 
 */

var connect = function (config) {

  const elasticSearchClient = new Client({
    node: config.host,
    maxRetries: process.env.ELASTIC_SEARCH_MAX_RETRIES,
    requestTimeout: process.env.ELASTIC_SEARCH_REQUEST_TIMEOUT,
    sniffOnStart: process.env.ELASTIC_SEARCH_SNIFF_ON_START
  });

  elasticSearchClient.ping({
  }, function (error) {
    if (error) {
      logger.error(error);

      let errorMessage = 'Elasticsearch cluster is down!';

      let errorData = {
        slackErrorName: gen.utils.checkIfEnvDataExistsOrNot("SLACK_ERROR_NAME"),
        color: gen.utils.checkIfEnvDataExistsOrNot("SLACK_ERROR_MESSAGE_COLOR"),
        host: config.host,
        message: errorMessage
      };

      slackClient.sendMessageToSlack(errorData);
      logger.error(errorMessage);
    } else {
      logger.info('Elasticsearch connection established.');
    }
  });

  return {
    client: elasticSearchClient
  };

};

module.exports = connect;
