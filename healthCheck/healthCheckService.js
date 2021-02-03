/**
 * name : healthCheckService.js.
 * author : Aman Karki.
 * created-date : 02-Feb-2021.
 * Description : Health check service helper functionality.
*/

// Dependencies

const mongoose = require("mongoose");
const kafka = require('kafka-node');
const { v1 : uuidv1 } = require('uuid');
const assessmentHealthCheck = require("./assessmentService");
const sunbirdHealthCheck = require("./sunbirdService");

const obj = {
    MONGO_DB: {
        NAME: 'Mongo.db',
        FAILED_CODE: 'MONGODB_HEALTH_FAILED',
        FAILED_MESSAGE: 'Mongo db is not connected'
    },
    KAFKA: {
        NAME: 'kafka',
        FAILED_CODE: 'KAFKA_HEALTH_FAILED',
        FAILED_MESSAGE: 'Kafka is not connected'
    },
    ASSESSMENT_SERVICE: {
      NAME: 'assessmentservice.api',
      FAILED_CODE: 'ASSESSMENT_SERVICE_HEALTH_FAILED',
      FAILED_MESSAGE: 'ASSessment service is not healthy'
    },
    SUNBIRD_SERVICE: {
        NAME: 'sunbirdservice.api',
        FAILED_CODE: 'SUNBIRD_SERVICE_HEALTH_FAILED',
        FAILED_MESSAGE: 'sunbird service is not healthy'
    },
    NAME: 'ImprovementServiceHealthCheck',
    API_VERSION: '1.0'
}

function mongodb_connect() {
    return new Promise( async (resolve,reject) => {

        const db = mongoose.createConnection(process.env.MONGODB_URL + "/" + process.env.DB);
          
        db.on("error", function () {
            return resolve(false)
        });
        db.once("open", function() {
            return resolve(true);    
        });
    })
}

function kafka_connect() {
    return new Promise( async (resolve,reject) => {

        const client = new kafka.KafkaClient({
            kafkaHost : process.env.KAFKA_URL
        });

        const producer = new kafka.Producer(client);

        producer.on("error", function (err) {
            return resolve(false);
        })
        producer.on('ready', function () {
            return resolve(true);
        });
    })
}

let checkHealth = async function(req,res) {

    let checks = [];
    let mongodbConnection = await mongodb_connect();
    let kafkaConnection = await kafka_connect();
    let assessmentServiceStatus = await assessmentHealthCheck.health_check();
    let sunbirdServiceStatus = await sunbirdHealthCheck.health_check();
    checks.push(singleCheckObj("KAFKA",kafkaConnection));
    checks.push(singleCheckObj("MONGO_DB",mongodbConnection));
    checks.push(singleCheckObj("ASSESSMENT_SERVICE",assessmentServiceStatus));
    checks.push(singleCheckObj("SUNBIRD_SERVICE",sunbirdServiceStatus));

    let checkServices = checks.filter( check => check.healthy === false);

    let result = {
        name : obj.NAME,
        version : obj.API_VERSION,
        healthy : checkServices.length > 0 ? false : true,
        checks : checks
    };

    let responseData = response(req,result);
    res.status(200).json(responseData);
}

let singleCheckObj = function( serviceName,isHealthy ) {
    return {
        name : obj[serviceName].NAME,
        healthy : isHealthy,
        err : !isHealthy ?  obj[serviceName].FAILED_CODE : "",
        errMsg : !isHealthy ? obj[serviceName].FAILED_MESSAGE : ""
    }
}

let healthCheckStatus = function(req,res) {
    let responseData = response(req);
    res.status(200).json(responseData);
}

let response = function ( req,result = {} ) {
    return {
        "id" : "kendraService.Health.API",
        "ver" : "1.0",
        "ts" : new Date(),
        "params" : {
            "resmsgid" : uuidv1(),
            "msgid" : req.headers['msgid'] || req.headers.msgid || uuidv1(),
            "status" : "successful",
            "err" : "null",
            "errMsg" : "null"
        },
        "status" : 200,
        result : result
    }
}

module.exports = {
    healthCheckStatus : healthCheckStatus,
    checkHealth: checkHealth
}