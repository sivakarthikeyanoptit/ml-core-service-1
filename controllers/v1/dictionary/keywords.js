/**
 * name : keywords.js
 * author : Akash Shah
 * created-date : 02-Jan-2020
 * Description :  Dictionary Keywords
 */

// dependencies

const csv = require('csvtojson');
const csvFileStream = require(ROOT_PATH + "/generics/file-stream");
const dictionaryHelper = require(MODULES_BASE_PATH + "/dictionary/helper");

/**
    * Keywords
    * @class
*/

module.exports = class Keywords {

    /**
     * @apiDefine errorBody
     * @apiError {String} status 4XX,5XX
     * @apiError {String} message Error
     */

    /**
     * @apiDefine successBody
     * @apiSuccess {String} status 200
     * @apiSuccess {String} result Data
     */


    /**
     * @api {post} /kendra/api/v1/dictionary/keywords/upload  
     * Upload Keywords to Dictionary
     * @apiVersion 1.0.0
     * @apiGroup Dictionary
     * @apiHeader {String} X-authenticated-user-token Authenticity token
     * @apiHeader {String} internal-access-token Internal access token
     * @apiParam {File} keywords Mandatory keywords file of type csv.
     * @apiSampleRequest /kendra/api/v1/dictionary/keywords/upload
     * @apiUse successBody
     * @apiUse errorBody
     */

    /**
      * Push keywords data to the dictionary index.
      * @method
      * @name upload
      * @param  {Request}  req  request body.
      * @returns {csv} Response consists of exactly 
      * the same csv that we upload with extra column status.
     */


    async upload(req) {

        return new Promise(async (resolve, reject) => {

            try {

                if (!req.files || !req.files.keywords) {
                    throw { message: messageConstants.apiResponses.DICTIONARY_KEYWORDS_MISSING_FILE_ERROR };
                }

                const checkIfKeywordsCanBeUploaded = await dictionaryHelper
                .keywordsIndexTypeMapExists();
                
                if(!checkIfKeywordsCanBeUploaded.data) {
                    throw { message: messageConstants.apiResponses.DICTIONARY_KEYWORDS_MAPPING_MISSING_ERROR }
                }

                let keywordsData = 
                await csv().fromString(req.files.keywords.data.toString());

                const fileName = `keywords`;
                let fileStream = new csvFileStream(fileName);
                let input = fileStream.initStream();

                (async function () {
                    await fileStream.getProcessorPromise();
                    return resolve({
                        isResponseAStream: true,
                        fileNameWithPath: fileStream.fileNameWithPath()
                    });
                })();

                for (let pointerToKeywordsData = 0;
                    pointerToKeywordsData < keywordsData.length;
                    pointerToKeywordsData++) {
                        const row = keywordsData[pointerToKeywordsData];
                        row.status = messageConstants.common.FAILED;
                        if(row.word && row.word != "") {
                            let addOrRemoveOperation
                            if(row.action == "remove") {
                                addOrRemoveOperation = await dictionaryHelper.removeWordFromDictionary(row.word);
                            } else {
                                addOrRemoveOperation = await dictionaryHelper.addWordToDictionary(row.word);
                            }
                            if(!addOrRemoveOperation.data) {
                                row.status = messageConstants.common.FAILED;
                            } else {
                                row.status = messageConstants.common.SUCCESS;
                            }
                        }
                        input.push(row);
                }

                input.push(null);

            } catch (error) {

                return reject({
                    status: 
                    error.status || httpStatusCode["internal_server_error"].status,

                    message: 
                    error.message || httpStatusCode["internal_server_error"].message,

                    errorObject: error
                });

            }
        })

    }

};

