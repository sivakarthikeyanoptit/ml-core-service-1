/**
 * name : globals.js
 * author : Aman Jung Karki
 * created-date : 05-Dec-2019
 * Description : All globals data.
 */


//dependencies

const fs = require("fs");
const path = require("path");
let requireAll = require("require-all");
var bunyan = require("bunyan"),
  bunyanFormat = require('bunyan-format'),
  formatOut = bunyanFormat({ outputMode: 'short' });

gen = Object.assign(global, {});

/**
 * Expose all globals data .
 */

module.exports = function () {

  global.async = require("async");
  global.ROOT_PATH = path.join(__dirname, '..');
  global.MODULES_BASE_PATH = ROOT_PATH + "/module";
  global.GENERIC_HELPERS_PATH = ROOT_PATH + "/generics/helpers";
  global._ = require("lodash");
  gen.utils = require(ROOT_PATH + "/generics/helpers/utils");
  global.config = require(".");

  global.ENABLE_DEBUG_LOGGING = 
  process.env.ENABLE_DEBUG_LOGGING 
  || process.env.DEFAULT_ENABLE_DEBUG_LOGGING;

  global.locales = [];

  global.httpStatusCode = 
  require(ROOT_PATH + process.env.PATH_TO_HTTP_STATUS_CODE);


  global.REQUEST_TIMEOUT_FOR_REPORTS = 
  process.env.REQUEST_TIMEOUT_FOR_REPORTS || 
  process.env.DEFAULT_REQUEST_TIMEOUT_FOR_REPORTS;

  // bootstrap all models
  global.models = requireAll({
    dirname: ROOT_PATH + process.env.PATH_TO_MODELS,
    filter: /(.+)\.js$/,
    resolve: function (Model) {
      return Model;
    }
  });

  //load base v1 controllers

  let pathToController = ROOT_PATH + process.env.CONTROLLER_PATH;

  fs.readdirSync(pathToController).forEach(function (file) {
    checkWhetherFolderExistsOrNor(ROOT_PATH + process.env.CONTROLLER_PATH, file);
  });

  function checkWhetherFolderExistsOrNor(pathToFolder, file) {

    let folderExists = fs.lstatSync(pathToFolder + file).isDirectory();

    if (folderExists) {
      fs.readdirSync(pathToFolder + file).forEach(function (folderOrFile) {
        checkWhetherFolderExistsOrNor(pathToFolder + file + "/", folderOrFile);
      })

    } else {
      if (file.match(/\.js$/) !== null) {
        var name = file.replace('.js', '');
        global[name + 'BaseController'] = require(pathToFolder + file);
      }
    }

  }

  // load schema files
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
    resolve: function (Controller) {
      return new Controller();
    }
  });

  // load language files
  fs.readdirSync(ROOT_PATH + process.env.LANGUAGE_PATH)
  .forEach(function (file) {
    if (file.match(/\.json$/) !== null) {
      var name = file.replace('.json', '');
      global.locales.push(name)
    }
  });

  // Load all kafka consumer files
  fs.readdirSync(ROOT_PATH + process.env.PATH_TO_KAFKA_CONSUMERS)
  .forEach(function (file) {
    if (file.match(/\.js$/) !== null) {
      var name = file.replace('-consumer.js', '');
      name=name.replace('-','');
       global[name + 'Consumer'] = 
      require(ROOT_PATH + process.env.PATH_TO_KAFKA_CONSUMERS + file);
    }
  });

  // Load all message constants
  global.constants = new Array
  fs.readdirSync(ROOT_PATH + "/generics/constants")
  .forEach(function (file) {
    if (file.match(/\.js$/) !== null) {
      let name = file.replace('.js', '');
      name = gen.utils.hyphenCaseToCamelCase(name);
      global.constants[name] = 
      require(ROOT_PATH + "/generics/constants/" + file);
    }
  });

  let loggerPath = ROOT_PATH + "/logs/" + process.pid + "-all.log";
  // Load logger file
  global.logger = bunyan.createLogger({
    name: 'information',
    level: "debug",
    streams: [{
      stream: formatOut
    }, {
      type: "rotating-file",
      path: loggerPath,
      period: "1d", // daily rotation
      count: 3 // keep 3 back copies
    }]
  });

  global.sessions = {};

  let versions = new Promise(async function(resolve, reject) {
    
    let versions = await database.models.appReleases.find({
      status:"active"
    }).lean();

    resolve(versions);

  });
  
  versions.then(function( versionData ) {
    
    if( versionData.length > 0 ) {
      versionData.forEach(value=>{
        
        global.sessions[`allAppVersion-${value.appName}-${value.os}`] = {
          is_read : false,
          internal : true,
          action : "versionUpdate",
          appName : value.appName,
          text : value.text,
          title : value.title,
          type : "Information",
          payload : {
              appVersion : value.version,
              updateType : value.releaseType,
              type : "appUpdate",
              os : value.os,
              releaseNotes : value.releaseNotes
          },
          appType : value.appType
        };
      })
    }
  });

};
