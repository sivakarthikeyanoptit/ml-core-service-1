/**
 * name : smtp-config.js
 * author : Aman Jung Karki
 * created-date : 03-Dc-2019
 * Description : smtp server configuration.
 */


/**
 * Module dependencies.
 */

let nodemailer = require("nodemailer");

/**
  * Create an smtp connection.
  * @function
  * @name smtpConnection
  * @param {Object} config all smtp configurations.
*/

var smtpConnection = async function (config) {

    let configurationOptions = {};

    if(process.env.NODE_ENV === "testing") {
        configurationOptions["host"] = process.env.SMTP_GMAIL_HOST;
        configurationOptions["port"] = process.env.SMTP_GMAIL_PORT;
        configurationOptions["secure"] = true;
        configurationOptions["auth"] = {};
        configurationOptions["auth"]["user"] = config.user;
        configurationOptions["auth"]["pass"] = config.password;
    } else {
        configurationOptions["host"] = config.host;
        configurationOptions["secure"] = config.secure;
        configurationOptions["port"] = config.port;
    }

    let transporter = nodemailer.createTransport(configurationOptions);

    transporter.verify(function (error, success) {
        if (error) {
            logger.error('SMTP Server not connected !!!!');
        } else {
            logger.info('SMTP Server is connected!!!');

            if (success) {
                global.smtpServer = transporter;
            }
        }
    });

};


/**
 * Expose `smtpConnection`.
 */

module.exports = smtpConnection;
