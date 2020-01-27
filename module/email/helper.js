/**
 * name : email/helper.js
 * author : Aman Jung Karki
 * created-date : 03-Dc-2019
 * Description : Email.
 */


/**
 * Load kafka Producer. 
 */

const kafkaCommunication = require(ROOT_PATH + "/generics/helpers/kafka-communications");
const nodeMailerHelper = require(ROOT_PATH + "/generics/helpers/nodemailer");

/**
    * EmailHelper
    * @class
*/

module.exports = class EmailHelper {


    /**
      * send.
      * @method
      * @name send
      * @param {Object} emailData all email related informations .
      * consists of - from,to,cc(optional),bcc(optional),subject,text,html
      * @returns {Promise} returns a promise.
     */

    static send(emailData) {
        return new Promise(async (resolve, reject) => {
            try {

                await kafkaCommunication.pushEmailToKafka(emailData);

                return resolve();
                
            } catch (error) {
                return reject(error);
            }
        })
    }

};