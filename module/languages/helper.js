const kafkaCommunication = require(ROOT_PATH + "/generics/helpers/kafka-communications")
let slackClient = require(ROOT_PATH + "/generics/helpers/slack-communications");
const csv = require("csvtojson");
const elasticSearchHelper = require(ROOT_PATH + "/generics/helpers/elastic-search");
const languageIndex = (process.env.ELASTICSEARCH_SHIKSHALOKAM_INDEX && process.env.ELASTICSEARCH_SHIKSHALOKAM_INDEX != "") ? process.env.ELASTICSEARCH_SHIKSHALOKAM_INDEX : "shikshalokam";
const languageTypeName = (process.env.ELASTICSEARCH_SHIKSHALOKAM_TYPE && process.env.ELASTICSEARCH_SHIKSHALOKAM_TYPE != "") ? process.env.ELASTICSEARCH_SHIKSHALOKAM_TYPE : "i18next";

module.exports = class notificationsHelper {

    static upload(files) {
        return new Promise(async (resolve, reject) => {
            try {

                let languageData = await csv().fromString(files.language.data.toString());

                let languages = {};

                for (let pointerToLanguage = 0; pointerToLanguage < languageData.length; pointerToLanguage++) {

                    let splitKeyDataToArray = languageData[pointerToLanguage].key.split("_")

                    Object.keys(languageData[pointerToLanguage]).forEach(eachLanguage => {

                        if (eachLanguage !== "key") {

                            if (!languages[eachLanguage]) {
                                languages[eachLanguage] = {};
                                languages[eachLanguage]["id"] = eachLanguage;
                                languages[eachLanguage]["action"] = "language"
                            }

                            if (!languages[eachLanguage][splitKeyDataToArray[0]]) {
                                languages[eachLanguage][splitKeyDataToArray[0]] = {}
                            }

                            languages[eachLanguage][splitKeyDataToArray[0]][splitKeyDataToArray[1]] = languageData[pointerToLanguage][eachLanguage]

                        }
                    })
                }

                let allSetOfLanguages = Object.values(languages)

                let responseData = [];

                for (let pointerToAllSetOfLanguage = 0; pointerToAllSetOfLanguage < allSetOfLanguages.length; pointerToAllSetOfLanguage++) {

                    let pushLanguagesToKafka = await kafkaCommunication.pushLanguagesToKafka(allSetOfLanguages[pointerToAllSetOfLanguage]);
                    let result = {}

                    result["language"] = allSetOfLanguages[pointerToAllSetOfLanguage].id

                    if (pushLanguagesToKafka.status != "success") {
                        let errorObject = {
                            message: `Failed to push to kafka`
                        }

                        result["message"] = "Fail to upload"
                        slackClient.kafkaErrorAlert(errorObject)
                        return;
                    } else {
                        result["message"] = "Successfully Uploaded"
                    }

                    responseData.push(result)
                }


                return resolve(responseData)


            } catch (error) {
                return reject(error);
            }
        })
    }

    static list(languageId) {
        return new Promise(async (resolve, reject) => {
            try {

                let languageInfo = {
                    id: languageId,
                    index: languageIndex,
                    type: languageTypeName
                }

                let getLanguageDocument = await elasticSearchHelper.getData(languageInfo)

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

    static listAll() {
        return new Promise(async (resolve, reject) => {
            try {
                let getLanguageDocument = await elasticSearchHelper.getAllLanguagesData()

                let data = {};

                if (Object.values(getLanguageDocument).length > 0) {
                    data = getLanguageDocument
                }

                return resolve({
                    message: `Languages lists fetched successfully`,
                    data: data
                })

            } catch (error) {
                return reject(error);
            }
        })
    }

};