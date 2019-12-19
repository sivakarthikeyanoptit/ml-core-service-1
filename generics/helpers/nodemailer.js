/**
 * name : nodemailer.js
 * author : Aman Jung Karki
 * created-date : 03-Dc-2019
 * Description : Email related helpers.
 */


/**
 * Load Module.
 */

const slackClient = require(ROOT_PATH + "/generics/helpers/slack-communications");

/**
  * Send consumer mail to nodemailer mail functionality.
  * @function
  * @name pushLanguagesToKafka
  * @param {Object} SingleMessage - email data from consumer.
  * @param {String} [consumer = ""] - kafka consumer. 
  * @returns {Promise} returns a promise.
*/

function sendEmail(SingleMessage, consumer = "") {
    return new Promise(async (resolve, reject) => {

        let emailData;

        if (SingleMessage.count) {
            emailData = await _send(_.omit(SingleMessage, ["count"]))
        } else {
            emailData = await _send(SingleMessage)
        };

        let response = {
            success: false
        };

        if (emailData.success) {
            consumer.options.autoCommit = true;
            response.success = true;
        } else {

            if (!SingleMessage.count) {
                SingleMessage["count"] = 1;
            } else {
                SingleMessage["count"] += 1;
            }

            if (SingleMessage.count < 10) {
                await sendEmail(SingleMessage, consumer);

            } else {

                let errorMsg = {};
                errorMsg["slackErrorName"] = "Nodemailer error !!";

                errorMsg["Environment"] = 
                gen.utils.checkIfEnvDataExistsOrNot("NODE_ENV");

                errorMsg["error"] = emailData.error.message;

                errorMsg["color"] = 
                gen.utils.checkIfEnvDataExistsOrNot("SLACK_ERROR_MESSAGE_COLOR");

                slackClient.sendMessageToSlack(errorMsg)
            }
        }

        return resolve(response)

    })
}

/**
  * Nodemailer Send mail functionality.
  * @function
  * @name _send
  * @param {Object} SingleMail - send email data. 
  * @returns {Promise} returns a promise.
*/

function _send(SingleMail) {
    return new Promise(async (resolve, reject) => {

        let message = {
            from: SingleMail.from,
            to: SingleMail.to,
            subject: SingleMail.subject,
            text: SingleMail.text,
            html: SingleMail.html
        }

        if (SingleMail.cc && Array.isArray(SingleMail.cc)) {
            message["cc"] = SingleMail.cc
        }

        if (SingleMail.bcc) {
            message["cc"] = SingleMail.bcc
        }

        smtpTransporter.sendMail(message, (err, info) => {

            let response = {};

            if (err) {
                response["success"] = false;
                response["error"] = err;

                logger.error("Error occurred." + err.message);
            }

            if (info && info.accepted && info.accepted.length > 0) {
                response["success"] = true;
            }

            return resolve(response)
        });

    })
}

module.exports = {
    sendEmail: sendEmail
}
