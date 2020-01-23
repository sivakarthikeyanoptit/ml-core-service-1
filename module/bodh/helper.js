/**
 * name : bodh/helper.js
 * author : Akash Shah
 * created-date : 03-Jan-2020
 * Description : All Bodh related helper functions.
 */

// Dependencies
const fs = require("fs");
const { promisify } = require("util");
const httpRequest = require(GENERIC_HELPERS_PATH+'/http-request');
const dictionaryHelper = require(MODULES_BASE_PATH + "/dictionary/helper");
const elasticSearchHelper = require(GENERIC_HELPERS_PATH + "/elastic-search");

// Constants
const bodhContentIndex = gen.utils.checkIfEnvDataExistsOrNot("ELASTICSEARCH_BODH_CONTENT_INDEX");
const bodhContentIndexType = gen.utils.checkIfEnvDataExistsOrNot("ELASTICSEARCH_BODH_CONTENT_INDEX_TYPE");

/**
    * BodhHelper
    * @class
*/

module.exports = class BodhHelper {

     /**
      * Forward search request and retrieve search results.
      * @method
      * @name getSearchResults
      * @param {Object} request Contains request url, headers and body.
      * @returns {Promise} returns a promise.
     */

    static getSearchResults(request) {
        return new Promise(async (resolve, reject) => {
            try {

                
                let reqObj = new httpRequest()

                let response = await reqObj.post(
                    request.url,
                    {
                        json : request.body,
                        headers : request.headers
                    }
                )

                return resolve({
                    success : true,
                    message : "Search results from bodh service.",
                    data : response
                });
                
            } catch (error) {
                return resolve({
                    success : true,
                    message : error.message,
                    data : false
                });
            }
        })
    }


     /**
      * Parse content for keywords and insert in Elastic search.
      * @method
      * @name parseContentForKeywords
      * @param {Array} content Contains array of content.
      * @returns {Promise} returns a promise.
     */

    static parseContentForKeywords(content = []) {
        return new Promise(async (resolve, reject) => {
            try {

                if(content.length < 0) {
                    throw new Error("Missing content details.");
                }

                let keywordsData = new Array

                content.forEach(eachContent => {
                    keywordsData.push(...eachContent.keywords)
                })

                let keywordsUpdateResult = new Array

                for (let pointerToKeywordsData = 0;
                    pointerToKeywordsData < keywordsData.length;
                    pointerToKeywordsData++) {
                        
                        let addKeywordOperation = await dictionaryHelper
                        .addWordToDictionary(keywordsData[pointerToKeywordsData]);

                        if(!addKeywordOperation.data) {
                            keywordsUpdateResult.push({
                                word : keywordsData[pointerToKeywordsData],
                                status : messageConstants.common.FAILED
                            })
                        } else {
                            keywordsUpdateResult.push({
                                word : keywordsData[pointerToKeywordsData],
                                status : "Success."
                            })
                        }
                        
                }

                return resolve({
                    success : true,
                    message : "Updated Keywords in Elastic Search.",
                    data : keywordsUpdateResult
                });
                
            } catch (error) {
                return resolve({
                    success : true,
                    message : error.message,
                    data : false
                });
            }
        })
    }


     /**
      * Parse content insert in Elastic search to use for auto completion.
      * @method
      * @name parseContentForAutocomplete
      * @param {Array} content Contains array of content.
      * @returns {Promise} returns a promise.
     */

    static parseContentForAutocomplete(content = []) {
        return new Promise(async (resolve, reject) => {
            try {

                if(content.length < 0) {
                    throw new Error("Missing content details.");
                }

                let contentUpdateResult = new Array

                let autocompleteContextKeys =  await this.getAutocompleteContextKeys();

                if(autocompleteContextKeys.success && autocompleteContextKeys.data) {
                    autocompleteContextKeys = autocompleteContextKeys.data
                } else {
                    autocompleteContextKeys = [];
                }

                for (let pointerToContentData = 0;
                    pointerToContentData < content.length;
                    pointerToContentData++) {
                        
                        const eachContent = content[pointerToContentData];

                        let suggestContent = {
                            input : [
                                eachContent.name.trim().toLowerCase(),
                                eachContent.description.trim().toLowerCase()
                            ],
                            contexts : {}
                        }

                        autocompleteContextKeys.forEach(contextKey => {
                            if(eachContent[contextKey]) {
                                suggestContent.contexts[contextKey] = eachContent[contextKey];
                            } else {
                                suggestContent.contexts[contextKey] = [];
                            }
                        });

                        const addCourseToAutocomplete = await elasticSearchHelper.createOrUpdateDocumentInIndex(
                            bodhContentIndex,
                            bodhContentIndexType,
                            eachContent.IL_UNIQUE_ID,
                            {
                                suggest : suggestContent,
                                rawContent : eachContent
                            }
                        );

                        if(addCourseToAutocomplete.statusCode != httpStatusCode["ok"].status && addCourseToAutocomplete.statusCode != 201) {
                            throw new Error("Failed to add content to auto complete.")
                        }

                        if(!addCourseToAutocomplete.data) {
                            contentUpdateResult.push({
                                IL_UNIQUE_ID : eachContent.IL_UNIQUE_ID,
                                status : messageConstants.common.FAILED
                            })
                        } else {
                            contentUpdateResult.push({
                                IL_UNIQUE_ID : eachContent.IL_UNIQUE_ID,
                                status : messageConstants.common.SUCCESS
                            })
                        }
                        
                }

                return resolve({
                    success : true,
                    message : "Updated Keywords in Elastic Search.",
                    data : contentUpdateResult
                });
                
            } catch (error) {
                return resolve({
                    success : true,
                    message : error.message,
                    data : false
                });
            }
        })
    }

     /**
      * Log query which missed ES spell check and returned no results from Bodh Service.
      * @method
      * @name logQueryMissFromESAndBodh
      * @param {String} queryString Query typed by user.
      * @param {String} searchServiceUrl Bodh search service URL requested.
      * @returns {Promise} returns a promise.
     */

    static logQueryMissFromESAndBodh(queryString = "", searchServiceUrl = "") {
        return new Promise(async (resolve, reject) => {
            try {

                if(queryString == "" || searchServiceUrl == "") {
                    throw new Error("Missing query string or search service url.");
                }

                let today = new Date();

                let fileName = `${today.getDate()}-${today.getMonth()+1}-${today.getFullYear()}.csv`;
                
                let filePath = ROOT_PATH+"/"+process.env.LOGGER_DIRECTORY+"/bodh/search";
                
                fs.existsSync(filePath) || fs.mkdirSync(filePath, {recursive : true});

                const appendToFile = promisify(fs.appendFile);

                let data = `\n"${queryString}","${searchServiceUrl}"`;
                
                let writeToFilesResponse = await appendToFile(filePath+"/"+fileName, data, 'utf8')

                return resolve({
                    success : true,
                    message : "Updated Keywords in Elastic Search.",
                    data : true
                });
                
            } catch (error) {
                return resolve({
                    success : true,
                    message : error.message,
                    data : false
                });
            }
        })
    }


     /**
      * Check if mapping for dictionary index exists in Elastic search.
      * @method
      * @name autocompleteIndexTypeMapExists
      * @returns {Promise} returns a promise.
     */

    static autocompleteIndexTypeMapExists() {
        return new Promise(async (resolve, reject) => {
            try {

                if(bodhContentIndex == "") {
                    throw new Error("Missing bodh content index name");
                }

                if(bodhContentIndexType == "") {
                    throw new Error("Missing bodh content index type name");
                }

                const bodhIndexMapping = await elasticSearchHelper.getIndexTypeMapping(bodhContentIndex, bodhContentIndexType);

                if(bodhIndexMapping.statusCode != httpStatusCode["ok"].status) {
                    throw new Error("Bodh content index type map does not exist.");
                }
            
                return resolve({
                    success : true,
                    message : "Bodh content index type map exists",
                    data : true
                });
                
            } catch (error) {
                return resolve({
                    success : true,
                    message : error.message,
                    data : false
                });
            }
        })
    }


     /**
      * Get search suggestions for user query string from Elastic search.
      * @method
      * @name getSearchSuggestions
      * @param {String} queryString Query string for auto complete.
      * @param {Object} queryFilters Set of filters for search suggestions.
      * @param {Int} size Limit for search results.
      * @returns {Promise} returns a promise.
     */

    static getSearchSuggestions(queryString = "", queryFilters = {}, size = 10) {
        return new Promise(async (resolve, reject) => {
            try {

                if(queryString == "") throw new Error("Missing query string.");

                let filterConditons =  await this.getAutocompleteContextKeys();

                if(filterConditons.success && filterConditons.data) {
                    filterConditons = filterConditons.data
                } else {
                    filterConditons = [];
                }

                let searchContext = {}

                filterConditons.forEach(filterKey => {
                    if(queryFilters[filterKey]) {
                        searchContext[filterKey] = queryFilters[filterKey];
                    } else {
                        searchContext[filterKey] = [];
                    }
                })

                let queryObject = {
                    _source: "suggest",
                    suggest: {
                        nameSuggestion: {
                            prefix: queryString.trim().toLowerCase(),
                            completion: {
                                field: "suggest",
                                size: size,
                                skip_duplicates : true,
                                fuzzy: true,
                                contexts : searchContext
                            }
                        }
                    }
                }

                const searchResponse = await elasticSearchHelper.searchDocumentFromIndex(bodhContentIndex, bodhContentIndexType, queryObject);

                let suggestions = new Array

                if(searchResponse.nameSuggestion[0].options.length > 0) {
                    searchResponse.nameSuggestion[0].options.forEach(content => {
                        suggestions.push(content.text)
                    })
                }

                return resolve({
                    success : true,
                    message : "Search suggestions fetched successfully.",
                    data : suggestions
                });
                
            } catch (error) {
                return resolve({
                    success : true,
                    message : error.message,
                    data : false
                });
            }
        })
    }



     /**
      * Get context keys for auto complete index.
      * @method
      * @name getAutocompleteContextKeys
      * @returns {Promise} returns a promise.
     */

    static getAutocompleteContextKeys() {
        return new Promise(async (resolve, reject) => {
            try {

                return resolve({
                    success : true,
                    message : "Autocomplete field context keys.",
                    data : [
                        "channel",
                        "contentType",
                        "medium",
                        "gradeLevel",
                        "subject",
                        "board"
                    ]
                });
                
            } catch (error) {
                return resolve({
                    success : true,
                    message : error.message,
                    data : false
                });
            }
        })
    }

};