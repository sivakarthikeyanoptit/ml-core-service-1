/**
 * name : routes/index.js
 * author : Aman Jung Karki
 * Date : 15-Nov-2019
 * Description : All routes.
 */


// dependencies
const authenticator = require(ROOT_PATH + "/generics/middleware/authenticator");
const slackClient = require(ROOT_PATH + "/generics/helpers/slack-communications");
const pagination = require(ROOT_PATH + "/generics/middleware/pagination");
const fs = require("fs");
const inputValidator = require(ROOT_PATH + "/generics/middleware/validator");
const dataSetUpload = require(ROOT_PATH + "/generics/middleware/dataSetUpload");
const setLanguage = require(ROOT_PATH + "/generics/middleware/set-language");
var i18next = require("i18next");
var i18NextMiddleware = require("i18next-express-middleware");
let nodeFsBackend = require('i18next-node-fs-backend');

i18next.use(nodeFsBackend).init({
  fallbackLng: global.locales[0],
  lowerCaseLng: true,
  preload: global.locales,
  backend: {
    loadPath: ROOT_PATH + '/locales/{{lng}}.json',
  },
  saveMissing: true
});

module.exports = function (app) {

  const APPLICATION_BASE_URL = 
  gen.utils.checkIfEnvDataExistsOrNot("APPLICATION_BASE_URL");
  
  app.use(
    i18NextMiddleware.handle(i18next, {
      removeLngFromUrl: false
    })
  );

  if (process.env.NODE_ENV !== "testing") {
    app.use(APPLICATION_BASE_URL, authenticator);
  }

  app.use(APPLICATION_BASE_URL, dataSetUpload);
  app.use(APPLICATION_BASE_URL, pagination);
  app.use(APPLICATION_BASE_URL, setLanguage);

  var router = async function (req, res, next) {

    if (!req.params.version) {
      next();
    } else if (!controllers[req.params.version]) {
      next();
    } else if (!controllers[req.params.version][req.params.controller]) {
      next();
    }
    else if (!(controllers[req.params.version][req.params.controller][req.params.method] 
      || controllers[req.params.version][req.params.controller][req.params.file][req.params.method])) {
      next();
    }
    else if (req.params.method.startsWith("_")) {
      next();
    } else {

      try { 

        let validationError = req.validationErrors();

        if (validationError.length){
          throw { status: 400, message: validationError };
        }

        let result;

        if (req.params.file) {
          result = 
          await controllers[req.params.version][req.params.controller][req.params.file][req.params.method](req);
        } else {
          result = 
          await controllers[req.params.version][req.params.controller][req.params.method](req);
        }

        if (result.isResponseAStream == true) {
          fs.exists(result.fileNameWithPath, function (exists) {

            if (exists) {

              res.setHeader(
                'Content-disposition', 
                'attachment; filename=' + result.fileNameWithPath.split('/').pop()
              );
              res.set('Content-Type', 'application/octet-stream');
              fs.createReadStream(result.fileNameWithPath).pipe(res);

            } else {

              throw {
                status: 500,
                message: "Oops! Something went wrong!"
              };

            }

          });

        } else {
          res.status(result.status ? result.status : httpStatusCode["ok"].status).json({
            message: result.message,
            status: result.status ? result.status : httpStatusCode["ok"].status,
            result: result.data,
            result: result.result,
            additionalDetails: result.additionalDetails,
            pagination: result.pagination,
            totalCount: result.totalCount,
            total: result.total,
            count: result.count,
            failed: result.failed
          });
        }

        logger.info("Response:", result);
      }
      catch (error) {
        res.status(error.status ? error.status : 400).json({
          status: error.status ? error.status : 400,
          message: error.message
        });

        let customFields = {
          appDetails: '',
          userDetails: "NON_LOGGED_IN_USER"
        };

        if (req.userDetails) {
          customFields = {
            appDetails: req.headers["user-agent"],
            userDetails: req.userDetails.firstName + " - " + req.userDetails.lastName + " - " + req.userDetails.email
          };
        }

        let toLogObject = {
          slackErrorName: process.env.SLACK_ERROR_NAME,
          color: process.env.SLACK_ERROR_MESSAGE_COLOR,
          method: req.method,
          url: req.url,
          body: req.body && !_.isEmpty(req.body) ? req.body : "not provided",
          errorMsg: "not provided",
          errorStack: "not provided"
        };

        if (error.message) {
          toLogObject["errorMsg"] = JSON.stringify(error.message);
        } else if (error.errorObject) {
          toLogObject["errorMsg"] = error.errorObject.message;
          toLogObject["errorStack"] = error.errorObject.stack;
        }

        slackClient.sendMessageToSlack(_.merge(toLogObject, customFields));

        logger.error("Error Response:", error);
      };
    }
  };

  app.all(APPLICATION_BASE_URL + "api/:version/:controller/:method", inputValidator, router);

  app.all(APPLICATION_BASE_URL + "api/:version/:controller/:file/:method", inputValidator, router);

  app.all(APPLICATION_BASE_URL + "api/:version/:controller/:method/:_id", inputValidator, router);
  app.all(APPLICATION_BASE_URL + "api/:version/:controller/:file/:method/:_id", inputValidator, router);


  app.use((req, res, next) => {
    res.status(httpStatusCode["not_found"].status).send(httpStatusCode["not_found"].message);
  });
};
