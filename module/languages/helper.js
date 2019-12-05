/**
 * name : languages/helper.js
 * author : Aman Jung Karki
 * created-date : 29-Nov-2019
 * Description : All Languages related information.
 */


/**
 * load modules.
 */


const kafkaCommunication = require(ROOT_PATH + "/generics/helpers/kafka-communications")
let slackClient = require(ROOT_PATH + "/generics/helpers/slack-communications");
const csv = require("csvtojson");
const elasticSearchHelper = require(ROOT_PATH + "/generics/helpers/elastic-search");
const languageIndex = 
gen.utils.checkIfEnvDataExistsOrNot("ELASTICSEARCH_SHIKSHALOKAM_INDEX");
const languageType = 
gen.utils.checkIfEnvDataExistsOrNot("ELASTICSEARCH_SHIKSHALOKAM_TYPE");
const existingLanguages = require(ROOT_PATH + "/generics/helpers/languages.json");

/**
    * LanguagesHelper
    * @class
*/

module.exports = class LanguagesHelper {


    /**
      * upload all the languages.
      * @method
      * @name upload
      * @param {Object[]} files consists array of languages to upload. 
      * @returns {Promise} returns a promise.
     */

    static upload(files) {
        return new Promise(async (resolve, reject) => {
            try {

                let languageData = await csv().fromString(files.language.data.toString());

                let languages = {};

                for (let pointerToLanguage = 0; 
                    pointerToLanguage < languageData.length; 
                    pointerToLanguage++) 
                    {
                        let splitKeyDataToArray = 
                        languageData[pointerToLanguage].key.split("_");

                        Object.keys(languageData[pointerToLanguage])
                        .forEach(eachLanguage => {

                            if (eachLanguage !== "key") {

                                if (!languages[eachLanguage]) {
                                    languages[eachLanguage] = {};
                                    languages[eachLanguage]["id"] = eachLanguage;
                                    languages[eachLanguage]["action"] = "language"
                                }

                                if (!languages[eachLanguage][splitKeyDataToArray[0]]) {
                                    languages[eachLanguage][splitKeyDataToArray[0]] = {};
                                }

                                languages[eachLanguage][splitKeyDataToArray[0]][splitKeyDataToArray[1]] = 
                                languageData[pointerToLanguage][eachLanguage];

                            }
                        })
                    }

                let allSetOfLanguages = Object.values(languages)

                let responseData = [];

                for (let pointerToAllSetOfLanguage = 0; 
                    pointerToAllSetOfLanguage < allSetOfLanguages.length; 
                    pointerToAllSetOfLanguage++) {


                    let pushLanguagesToKafka = 
                    await kafkaCommunication.pushLanguagesToKafka(
                        allSetOfLanguages[pointerToAllSetOfLanguage]
                    );

                    let result = {};

                    result["language"] = allSetOfLanguages[pointerToAllSetOfLanguage].id;

                    if (pushLanguagesToKafka) {
                        if (pushLanguagesToKafka.status != "success") {

                            let errorObject = {
                                slackErrorName: 
                                gen.utils.checkIfEnvDataExistsOrNot("SLACK_ERROR_NAME"),

                                color: 
                                gen.utils.checkIfEnvDataExistsOrNot("SLACK_ERROR_MESSAGE_COLOR"),
                                message: `Fail to upload languages`
                              };

                            result["message"] = "Fail to upload";
                            slackClient.sendMessageToSlack(errorObject)
                            return;
                        } else {
                            result["message"] = "Successfully Uploaded"
                        }
                    } else {
                        result["message"] = "kafka topic created and languages is uploaded"
                    }

                    responseData.push(result)
                }


                return resolve(responseData)


            } catch (error) {
                return reject(error);
            }
        })
    }

     /**
      * List language details.
      * @method
      * @name list
      * @param {String} languageId Specific language id. 
      * @returns {Promise} returns a promise.
     */


    static list(languageId) {
        return new Promise(async (resolve, reject) => {
            try {

                let languageInfo = {
                    id: languageId,
                    index: languageIndex,
                    type: languageType
                }

                let getLanguageDocument = 
                await elasticSearchHelper.getData(languageInfo);

                let data = {};

                if (getLanguageDocument.statusCode === httpStatusCode.ok.status) {
                    data = getLanguageDocument.body._source.translate
                }

                return resolve({
                    message: `${languageId} language data fetched successfully`,
                    data: data
                })

            } catch (error) {
                return reject(error);
            }
        })
    }


     /**
      * List all languages.
      * @method
      * @name listAll
      * @returns {Promise} returns a promise.
     */


    static listAll() {
        return new Promise(async (resolve, reject) => {
            try {
                let getLanguageDocument = 
                await elasticSearchHelper.getAllLanguagesData()

                let data = [];

                for (let pointerToLanguage = 0; 
                    pointerToLanguage < getLanguageDocument.length; 
                    pointerToLanguage++) {

                        let languageId = getLanguageDocument[pointerToLanguage].id;
                        if (existingLanguages[languageId] !== undefined) {
                            data.push({
                                id: languageId,
                                name: existingLanguages[languageId]
                            })
                        }
                }

                return resolve({
                    message: `Languages lists fetched successfully`,
                    result: data
                })

            } catch (error) {
                return reject(error);
            }
        })
    }

};