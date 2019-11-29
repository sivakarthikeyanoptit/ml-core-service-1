const kafkaCommunication = require(ROOT_PATH + "/generics/helpers/kafka-communications")
let slackClient = require(ROOT_PATH + "/generics/helpers/slack-communications");
const csv = require("csvtojson");
const elasticSearchHelper = require(ROOT_PATH + "/generics/helpers/elastic-search");
const languageIndex = (process.env.ELASTICSEARCH_SHIKSHALOKAM_INDEX && process.env.ELASTICSEARCH_SHIKSHALOKAM_INDEX != "") ? process.env.ELASTICSEARCH_SHIKSHALOKAM_INDEX : "sl-languages-dev";
const languageTypeName = (process.env.ELASTICSEARCH_SHIKSHALOKAM_TYPE && process.env.ELASTICSEARCH_SHIKSHALOKAM_TYPE != "") ? process.env.ELASTICSEARCH_SHIKSHALOKAM_TYPE : "i18next";
const allExistingLanguages = require(ROOT_PATH + "/generics/helpers/languages.json")

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


                    // let pushLanguagesToKafka = await kafkaCommunication.pushLanguagesToKafka(allSetOfLanguages[pointerToAllSetOfLanguage]); --> could not push to kafka
                    let result = {}

                    let languageId = allSetOfLanguages[pointerToAllSetOfLanguage].id; // Not required if kafka works

                    // Since kafka is not working temporary fix.Not required if kafka works 

                    delete allSetOfLanguages[pointerToAllSetOfLanguage].id;
                    delete allSetOfLanguages[pointerToAllSetOfLanguage].action;
                    //

                    // Not required if kafka works 
                    await elasticSearchHelper.pushLanguageData(languageId, allSetOfLanguages[pointerToAllSetOfLanguage])

                    //

                    result["language"] = allSetOfLanguages[pointerToAllSetOfLanguage].id

                    // if (pushLanguagesToKafka.status != "success") {
                    //     let errorObject = {
                    //         message: `Failed to push to kafka`
                    //     }

                    //     result["message"] = "Fail to upload"
                    //     slackClient.kafkaErrorAlert(errorObject)
                    //     return;
                    // } else {
                    //     result["message"] = "Successfully Uploaded"
                    // }

                    result["message"] = "Successfully Uploaded"

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

                let data = [];

                for (let pointerToLanguage = 0; pointerToLanguage < getLanguageDocument.length; pointerToLanguage++) {

                    let languageId = getLanguageDocument[pointerToLanguage].id
                    if (allExistingLanguages[languageId] !== undefined) {
                        data.push({
                            id: languageId,
                            name: allExistingLanguages[languageId]
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