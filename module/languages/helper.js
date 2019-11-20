const kafkaCommunication = require(ROOT_PATH + "/generics/helpers/kafka-communications")
let slackClient = require(ROOT_PATH + "/generics/helpers/slack-communications");
const csv = require("csvtojson");
const elasticSearchHelper = require(ROOT_PATH + "/generics/helpers/elastic-search");

module.exports = class notificationsHelper {

    static upload(files) {
        return new Promise(async (resolve, reject) => {
            try {

                let languageData = await csv().fromString(files.language.data.toString());

                let languageFileName = files.language.name.replace('.csv', '');

                let language = {};

                for (let pointerToLanguage = 0; pointerToLanguage < languageData.length; pointerToLanguage++) {

                    if (!language[languageData[pointerToLanguage].appKey]) {
                        language[languageData[pointerToLanguage].appKey] = {}
                        language[languageData[pointerToLanguage].appKey][languageData[pointerToLanguage].key] = languageData[pointerToLanguage].value
                    } else {
                        language[languageData[pointerToLanguage].appKey][languageData[pointerToLanguage].key] = languageData[pointerToLanguage].value
                    }
                }

                language["id"] = languageFileName;
                language["action"] = "language";

                let pushLanguagesToKafka = await kafkaCommunication.pushLanguagesToKafka(language)

                if (pushLanguagesToKafka.status != "success") {
                    let errorObject = {
                        message: `Failed to push to kafka`
                    }
                    slackClient.kafkaErrorAlert(errorObject)
                    return;
                }

                return resolve()


            } catch (error) {
                return reject(error);
            }
        })
    }

    static list(languageId) {
        return new Promise(async (resolve, reject) => {
            try {
                let getLanguageDocument = await elasticSearchHelper.getLanguageData(languageId)

                let data = {};

                if (getLanguageDocument.statusCode === httpStatusCode.ok.status) {
                    data = getLanguageDocument.body._source.translate
                }

                return resolve({
                    message: `${languageId} fetched successfully`,
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