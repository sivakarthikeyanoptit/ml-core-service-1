/**
 * name : email/helper.js
 * author : Aman Jung Karki
 * created-date : 03-Dc-2019
 * Description : Email.
 */


/**
 * Load kafka Producer. 
 */

 // TODO : Dirty fix . Since kafka is not working for sending email
// const kafkaCommunication = require(ROOT_PATH + "/generics/helpers/kafka-communications");

const smtpHelper = require(ROOT_PATH + "/generics/helpers/email");


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

    static sendJenkinsEmail(emailData) {
        return new Promise(async (resolve, reject) => {
            try {

                let emailDocuments = 
                await smtpHelper.send(emailData);

                return resolve(emailDocuments);
                
            } catch (error) {
                return reject(error);
            }
        })
    }

};