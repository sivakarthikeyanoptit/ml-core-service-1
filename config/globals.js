const fs = require("fs");
const path = require("path");
const requireAll = require("require-all");

gen = Object.assign(global, {});

module.exports = function () {

  global.async = require("async");
  global.ROOT_PATH = path.join(__dirname, '..')
  global.GENERIC_HELPERS_PATH = ROOT_PATH + "/generics/helpers"
  global._ = require("lodash");
  gen.utils = require(ROOT_PATH + "/generics/helpers/utils");
  global.config = require(".");

  global.ENABLE_CONSOLE_LOGGING = process.env.ENABLE_CONSOLE_LOGGING || "ON";
  global.ENABLE_BUNYAN_LOGGING = process.env.ENABLE_BUNYAN_LOGGING || "ON";

  global.locales = [];

  global.httpStatusCode = require(ROOT_PATH + "/generics/http-status-codes")


  global.REQUEST_TIMEOUT_FOR_REPORTS = process.env.REQUEST_TIMEOUT_FOR_REPORTS || 120000;

  // boostrap all models
  global.models = requireAll({
    dirname: ROOT_PATH + "/models",
    filter: /(.+)\.js$/,
    resolve: function (Model) {
      return Model;
    }
  });

  //load base v1 controllers
  fs.readdirSync(ROOT_PATH + '/controllers/v1/').forEach(function (file) {
    if (file.match(/\.js$/) !== null) {
      var name = file.replace('Controller.js', '');
      global[name + 'BaseController'] = require(ROOT_PATH + '/controllers/v1/' + file);
    }
  });

  //load schema files
  global.schemas = new Array
  fs.readdirSync(ROOT_PATH + '/models/').forEach(function (file) {
    if (file.match(/\.js$/) !== null) {
      var name = file.replace('.js', '');
      global.schemas[name] = require(ROOT_PATH + '/models/' + file);
    }
  });

  // boostrap all controllers
  global.controllers = requireAll({
    dirname: ROOT_PATH + "/controllers",
    // filter: /(.+Controller)\.js$/,
    resolve: function (Controller) {
      // if (Controller.name) return new Controller(models[Controller.name]);
      // else return new Controller();
      return new Controller();
    }
  });

  // load language files

  fs.readdirSync(ROOT_PATH + '/locales/').forEach(function (file) {
    if (file.match(/\.json$/) !== null) {
      var name = file.replace('.json', '');
      // global[name + 'Lang'] = ROOT_PATH + '/locales/' + file;
      global.locales.push(name)
    }
  });


  // Load all kafka consumer files
  fs.readdirSync(ROOT_PATH + '/generics/kafka-consumers/').forEach(function (file) {
    if (file.match(/\.js$/) !== null) {
      var name = file.replace('-consumer.js', '');
      global[name + 'Consumer'] = require(ROOT_PATH + '/generics/kafka-consumers/' + file);
    }
  });

};
