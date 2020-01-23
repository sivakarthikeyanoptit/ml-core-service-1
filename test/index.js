var chai = require('chai');
var chaiHttp = require('chai-http');
chai.use(chaiHttp);
require("dotenv").config();

global.chai = chai;
global.expect = chai.expect;

global.testUrl = process.env.HOST + ":" + process.env.PORT;

require("./email")();
require("./languages")();
require("./slack")();
