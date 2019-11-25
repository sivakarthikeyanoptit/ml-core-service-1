const fs = require("fs");
let listOfLanguages = require(ROOT_PATH + "/generics/languages");

module.exports = class Language {

    /**
     * @apiDefine errorBody
     * @apiError {String} status 4XX,5XX
     * @apiError {String} message Error
     */

    /**
     * @apiDefine successBody
     *  @apiSuccess {String} status 200
     * @apiSuccess {String} result Data
     */


    static get name() {
        return "language";
    }

    /**
 * @api {get} /kendra/api/v1/language/list List Language
 * @apiVersion 1.0.0
 * @apiName List Language
 * @apiGroup Language
 * @apiHeader {String} X-authenticated-user-token Authenticity token
 * @apiSampleRequest /kendra/api/v1/language/list
 * @apiUse successBody
 * @apiUse errorBody
 * @apiParamExample {json} Response:
 *  {
     "message": "Language Set Successfully.",
     "status": 200,
    {
        "message": "Language  Listed Successfully.",
        "status": 200,
        "result": [
            {
                "code": "en",
                "name": "english"
            },
            {
                "code": "hi",
                "name": "hindi"
            },
            {
                "code": "ch",
                "name": "chinese"
            }
        ]
    }
}
 */

    list() {

        return new Promise(async (resolve, reject) => {

            try {

                let languageLists = Object.keys(listOfLanguages).map(eachListOfLanguage => {
                    return {
                        "code": listOfLanguages[eachListOfLanguage],
                        "name": eachListOfLanguage
                    }
                })

                return resolve({
                    message: "Language  Listed Successfully.",
                    result: languageLists
                });

            } catch (error) {

                return reject({
                    status: error.status || 500,
                    message: error.message || "Oops! something went wrong.",
                    errorObject: error
                })

            }


        })
    }

    /**
    * @api {get} /kendra/api/v1/language/translate?language=:language Translate Language
    * @apiVersion 1.0.0
    * @apiName language Translate Language
    * @apiGroup Language
    * @apiHeader {String} X-authenticated-user-token Authenticity token
    * @apiSampleRequest /kendra/api/v1/language/translate?language=en
    * @apiUse successBody
    * @apiUse errorBody
    * @apiParamExample {json} Response:
    *  {
        "message": "Language Set Successfully.",
        "status": 200,
        "result": {
            "language": "hindi"
        }
    }
    */

    translate(req) {

        return new Promise(async (resolve, reject) => {

            try {

                let translationLanguage = req.query.language ? req.query.language : "english";

                if (!listOfLanguages[translationLanguage]) {
                    throw { message: "Language is not found" }
                }

                const checkIfFileExists = fs.existsSync(ROOT_PATH + "/locales/" + listOfLanguages[translationLanguage] + ".json")

                if (!checkIfFileExists) {
                    throw { message: "Json is not found" }
                }

                return resolve({
                    message: "Language Set Successfully.",
                    result: { language: translationLanguage }
                });

            } catch (error) {

                return reject({
                    status: error.status || 500,
                    message: error.message || "Oops! something went wrong.",
                    errorObject: error
                })

            }


        })
    }



};
