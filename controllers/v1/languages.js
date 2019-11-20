const fs = require("fs");
let listOfLanguages = require(ROOT_PATH + "/generics/languages");
let languagesHelpers = require(ROOT_PATH + "/module/languages/helper.js")

module.exports = class LanguagePack {

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
        return "languagePack";
    }

    /**
    * @api {post} /assessment-design/api/v1/languages/translate?language=:language Translate Language
    * @apiVersion 1.0.0
    * @apiName language Translate Language
    * @apiGroup Language
    * @apiHeader {String} X-authenticated-user-token Authenticity token
    * @apiSampleRequest /assessment-design/api/v1/languages/translate?language=en
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

    /**
* @api {post} /kendra/api/v1/languages/upload Insert Language
* @apiVersion 1.0.0
* @apiName language Insert Language
* @apiGroup Language
* @apiHeader {String} X-authenticated-user-token Authenticity token
* @apiSampleRequest /kendra/api/v1/languages/upload
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

    upload(req) {

        return new Promise(async (resolve, reject) => {

            try {

                if (!req.files || !req.files.language) throw { status: httpStatusCode["bad_request"].status, message: httpStatusCode["bad_request"].message };

                await languagesHelpers.upload(req.files);

                return resolve({
                    message: "Language uploaded successfully"
                })

            } catch (error) {

                return reject({
                    status: error.status || httpStatusCode["internal_server_error"].status,
                    message: error.message || httpStatusCode["internal_server_error"].message
                })

            }


        })
    }

    /**
 * @api {get} /kendra/api/v1/languages/list Notifications List
 * @apiVersion 1.0.0
 * @apiName languages List
 * @apiGroup Language
 * @apiSampleRequest /kendra/api/v1/languages/list
 * @apiHeader {String} X-authenticated-user-token Authenticity token  
 * @apiUse successBody
 * @apiUse errorBody
 */

    list(req) {
        return new Promise(async (resolve, reject) => {

            try {

                let languageLists = await languagesHelpers.list(req.params._id)

                return resolve({
                    result: languageLists.data,
                    message: languageLists.message
                })

            } catch (error) {
                return reject({
                    status: error.status || httpStatusCode["internal_server_error"].status,
                    message: error.message || httpStatusCode["internal_server_error"].message
                })
            }
        })
    }

    /**
 * @api {get} /kendra/api/v1/languages/listAll Notifications List
 * @apiVersion 1.0.0
 * @apiName languages List
 * @apiGroup Language
 * @apiSampleRequest /kendra/api/v1/languages/list
 * @apiHeader {String} X-authenticated-user-token Authenticity token  
 * @apiUse successBody
 * @apiUse errorBody
 */

    listAll(req) {
        return new Promise(async (resolve, reject) => {

            try {

                let languageLists = await languagesHelpers.listAll()

                return resolve({
                    result: languageLists.data,
                    message: languageLists.message
                })

            } catch (error) {
                return reject({
                    status: error.status || httpStatusCode["internal_server_error"].status,
                    message: error.message || httpStatusCode["internal_server_error"].message
                })
            }
        })
    }

};
