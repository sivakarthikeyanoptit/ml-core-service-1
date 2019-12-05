
/**
 * name : languages.js
 * author : Aman Jung Karki
 * created-date : 29-Nov-2019
 * Description : Languages related information.
 */


/**
 * load modules.
 */

const languagesHelper = require(ROOT_PATH + "/module/languages/helper.js");
const csvFileStream = require(ROOT_PATH + "/generics/file-stream");
const fs = require("fs");
const listOfLanguages = require(ROOT_PATH + "/generics/languages");

/**
    * Languages
    * @class
*/
module.exports = class Languages {

    constructor() {}

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
    * @api {post} /kendra/api/v1/languages/translate?language=:language 
    * Translate Language
    * @apiVersion 1.0.0
    * @apiGroup Language
    * @apiHeader {String} X-authenticated-user-token Authenticity token
    * @apiSampleRequest /kendra/api/v1/languages/translate?language=en
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


    /**
      * Translate languages.
      * @method
      * @name translate
      * @param  {Request}  req  request body.
      * @returns {JSON} Response consists of message and result.Result consists of data of translated language.
     */

    translate(req) {

        return new Promise(async (resolve, reject) => {

            try {

                let translationLanguage = 
                req.query.language ? req.query.language : "english";

                if (!listOfLanguages[translationLanguage]) {
                    throw { message: "Language is not found" }
                }

                const checkIfFileExists = 
                fs.existsSync(ROOT_PATH + "/locales/" + listOfLanguages[translationLanguage] + ".json");

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
                });

            }


        })
    }

    /**
    * @api {post} /kendra/api/v1/languages/upload 
    * Upload Language
    * @apiVersion 1.0.0
    * @apiGroup Language
    * @apiHeader {String} X-authenticated-user-token Authenticity token
    * @apiSampleRequest /kendra/api/v1/languages/upload
    * @apiParam {File} language Mandatory language file of type CSV.
    * @apiUse successBody
    * @apiUse errorBody
    */

    /**
      * Upload languages via csv.
      * @method
      * @name upload
      * @param  {Request} req request body.Req consists of languages csv to upload.
      * @returns {JSON} Response consists of message and result.Result consists of language data uploaded.
     */

    upload(req) {

        return new Promise(async (resolve, reject) => {

            try {

                if (!req.files || !req.files.language) {
                    throw { 
                        status: httpStatusCode["bad_request"].status, 
                        message: httpStatusCode["bad_request"].message 
                    };
                }

                let languageHelper = await languagesHelper.upload(req.files);

                return resolve({
                    message: "Language uploaded successfully",
                    result: languageHelper
                })

            } catch (error) {

                return reject({
                    status: 
                    error.status || 
                    httpStatusCode["internal_server_error"].status,

                    message: 
                    error.message || 
                    httpStatusCode["internal_server_error"].message
                })

            }


        })
    }

    /**
    * @api {get} /kendra/api/v1/languages/list/:languageId 
    * Languages List
    * @apiVersion 1.0.0
    * @apiGroup Language
    * @apiSampleRequest /kendra/api/v1/languages/list/en
    * @apiHeader {String} X-authenticated-user-token Authenticity token  
    * @apiUse successBody
    * @apiUse errorBody
    */

    /**
      * Details of the specific language.
      * @method
      * @name list
      * @param  {Request} req request body.
      * @returns {JSON} Response consists of details of a language.
     */

    list(req) {
        return new Promise(async (resolve, reject) => {

            try {

                let languageLists = await languagesHelper.list(req.params._id);

                return resolve({
                    result: languageLists.data,
                    message: languageLists.message
                });

            } catch (error) {
                return reject({
                    status: 
                    error.status || 
                    httpStatusCode["internal_server_error"].status,

                    message: 
                    error.message || 
                    httpStatusCode["internal_server_error"].message
                });
            }
        })
    }

    /**
    * @api {get} /kendra/api/v1/languages/listAll 
    * ListAll languages
    * @apiVersion 1.0.0
    * @apiGroup Language
    * @apiSampleRequest /kendra/api/v1/languages/listAll
    * @apiHeader {String} X-authenticated-user-token Authenticity token  
    * @apiUse successBody
    * @apiUse errorBody
    * @apiParamExample {json} Response Body:
    {
    "message": "Languages lists fetched successfully",
    "status": 200,
    "result": [
        {
            "id": "en",
            "name": "english"
        },
        {
            "id": "ml",
            "name": "malayalam"
        }
        ]
    }
    }
    */

      /**
      * List all the languages.
      * @method
      * @name listAll
      * @returns {JSON} Response consists of details of all the language.
     */


    listAll() {
        return new Promise(async (resolve, reject) => {

            try {

                let languageLists = await languagesHelper.listAll();

                return resolve(languageLists);

            } catch (error) {
                return reject({
                    status: 
                    error.status || 
                    httpStatusCode["internal_server_error"].status,

                    message: 
                    error.message || 
                    httpStatusCode["internal_server_error"].message
                })
            }
        })
    }

        /**
      * translate given json into csv.
      * @method
      * @name translateIntoCsv
      * @param  {Request} req - request body.
      * @returns {JSON} Response consists of csv of the json data given.
     */

    translateIntoCsv(req) {
        return new Promise(async (resolve, reject) => {

            try {

                const fileName = `translate-language-to-csv`;
                let fileStream = new csvFileStream(fileName);
                let input = fileStream.initStream();

                (async function () {
                    await fileStream.getProcessorPromise();
                    return resolve({
                        isResponseAStream: true,
                        fileNameWithPath: fileStream.fileNameWithPath()
                    });
                })();

                let jsonKey = Object.keys(req.body);

                for (let pointer = 0; pointer < jsonKey.length; pointer++) {

                    let eachJsonKey = Object.keys(req.body[jsonKey[pointer]]);

                    for (let pointerToEachJson = 0; 
                        pointerToEachJson < eachJsonKey.length; 
                        pointerToEachJson++) {

                            let language = {};

                            language["key"] = 
                            jsonKey[pointer] + "_" + eachJsonKey[pointerToEachJson];

                            language["en"] = 
                            req.body[jsonKey[pointer]][eachJsonKey[pointerToEachJson]];

                            input.push(language);
                    }

                }

                input.push(null);
            }
            catch (error) {
                return reject(error);
            }
        })
    }

};