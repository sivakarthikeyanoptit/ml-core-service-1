/**
 * name : search.js
 * author : Akash Shah
 * created-date : 03-Jan-2020
 * Description :  Dictionary Keywords
 */

// dependencies

const bodhHelper = require(MODULES_BASE_PATH + "/bodh/helper");
const dictionaryHelper = require(MODULES_BASE_PATH + "/dictionary/helper");

/**
    * Search
    * @class
*/

module.exports = class Search {

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
     * @api {post} /kendra/api/v1/bodh/search/middleware  
     * Middleware for Bodh Search APIs
     * @apiVersion 1.0.0
     * @apiGroup Bodh
     * @apiHeader {String} X-authenticated-user-token Authenticity token
     * @apiSampleRequest /kendra/api/v1/bodh/search/middleware
     * @apiUse successBody
     * @apiUse errorBody
     */

    /**
      * Middleware for bodh search request.
      * @method
      * @name middleware
      * @param  {Request}  req  request body.
      * @returns {json} Response consists of search results
     */


    async middleware(req) {

        return new Promise(async (resolve, reject) => {

            try {
                let request = req.body;

                let userQueryString;

                let queryString = userQueryString = (request.body.request && request.body.request.query && request.body.request.query != "") ? request.body.request.query : "";

                let spellcheckFromESMiss = false;

                if(queryString != "") {
                    let queryWords = queryString.split(" ");
                    for (let pointerTOQueryWords = 0; pointerTOQueryWords < queryWords.length; pointerTOQueryWords++) {
                        const word = queryWords[pointerTOQueryWords];
                        const correctWord = await dictionaryHelper
                            .spellcheck(word);
                        if(correctWord.data) {
                            queryWords[pointerTOQueryWords] = correctWord.data;
                        } else {
                            spellcheckFromESMiss = true;
                        }
                    }
                    queryString = request.body.request.query = queryWords.join(" ");
                }

                const getBodhServiceResponse = await bodhHelper
                .getSearchResults(request);
                
                if(!getBodhServiceResponse.data) {
                    throw { message: messageConstants.apiResponses.BODH_SEARCH_MIDDLEWARE_FAILURE }
                }

                // Add did you mean if user query is different from searched query.
                if(queryString != userQueryString) {
                    getBodhServiceResponse.data[messageConstants.apiResponses.BODH_SEARCH_MIDDLEWARE_DID_YOU_MEAN_KEY] = `Showing results for ${queryString}`
                }

                // Parse content from Bodh for latest keywords and update ES
                if(getBodhServiceResponse.data.data.result.count > 0) {
                    bodhHelper.parseContentForKeywords(getBodhServiceResponse.data.data.result.content);
                }

                // Parse content from Bodh for updating auto complete
                if(getBodhServiceResponse.data.data.result.count > 0) {
                    bodhHelper.parseContentForAutocomplete(getBodhServiceResponse.data.data.result.content);
                }

                // Log query miss from ES and Bodh
                if(getBodhServiceResponse.data.data.result.count == 0 && spellcheckFromESMiss) {
                    bodhHelper.logQueryMissFromESAndBodh(queryString, request.url);
                }
                
                return resolve({
                    result: getBodhServiceResponse.data,
                    message: messageConstants.apiResponses.BODH_SEARCH_MIDDLEWARE_SUCCESS
                });

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


    /**
     * @api {post} /kendra/api/v1/bodh/search/autocomplete  
     * Autocomplete for Bodh Search
     * @apiVersion 1.0.0
     * @apiGroup Bodh
     * @apiHeader {String} X-authenticated-user-token Authenticity token
     * @apiSampleRequest /kendra/api/v1/bodh/search/autocomplete
     * @apiUse successBody
     * @apiUse errorBody
     */

    /**
      * Autocomplete for bodh search request.
      * @method
      * @name autocomplete
      * @param  {Request}  req  request body.
      * @returns {json} Response consists of search results
     */


    async autocomplete(req) {

        return new Promise(async (resolve, reject) => {

            try {

                let queryString = req.body.request.query;
                let filters = req.body.request.filters;
                let size = req.body.request.limit;

                const searchSuggestions = await bodhHelper
                .getSearchSuggestions(queryString,filters,size);
                
                if(!searchSuggestions.data) {
                    throw { message: messageConstants.apiResponses.BODH_SEARCH_AUTOCOMPLETE_FAILURE };
                }
                
                return resolve({
                    result: { suggestions : searchSuggestions.data },
                    message: messageConstants.apiResponses.BODH_SEARCH_AUTOCOMPLETE_SUCCESS
                });

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

