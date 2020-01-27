/**
 * name : dictionary/helper.js
 * author : Akash Shah
 * created-date : 03-Jan-2020
 * Description : All Dictionary related helper functions.
 */

// Dependencies

const elasticSearchHelper = require(GENERIC_HELPERS_PATH + "/elastic-search");

// Constants
const dictionaryIndex = gen.utils.checkIfEnvDataExistsOrNot("ELASTICSEARCH_DICTIONARY_INDEX");
const dictionaryIndexType = gen.utils.checkIfEnvDataExistsOrNot("ELASTICSEARCH_DICTIONARY_INDEX_TYPE");

/**
    * DictionaryHelper
    * @class
*/

module.exports = class DictionaryHelper {

     /**
      * Find the closest word.
      * @method
      * @name spellcheck
      * @param {String} word word to check for spelling.
      * @returns {Promise} returns a promise.
     */

    static spellcheck(word = "") {
        return new Promise(async (resolve, reject) => {
            try {

                if(word == "") {
                    throw new Error("Missing word.");
                }

                let queryObject = {
                    query : {
                        match : {
                            words : {
                                query : word,
                                fuzziness : 2
                            }
                        }
                    }
                }

                const dictionaryIndexMapping = await elasticSearchHelper.searchDocumentFromIndex(dictionaryIndex, dictionaryIndexType, queryObject);

                return resolve({
                    success : true,
                    message : "Matching keyword found.",
                    data : dictionaryIndexMapping[0].words
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
      * @name keywordsIndexTypeMapExists
      * @returns {Promise} returns a promise.
     */

    static keywordsIndexTypeMapExists() {
        return new Promise(async (resolve, reject) => {
            try {

                if(dictionaryIndex == "") {
                    throw new Error("Missing dictionary index name");
                }

                if(dictionaryIndexType == "") {
                    throw new Error("Missing dictionary index type name");
                }

                const dictionaryIndexMapping = await elasticSearchHelper.getIndexTypeMapping(dictionaryIndex, dictionaryIndexType);

                if(dictionaryIndexMapping.statusCode != httpStatusCode["ok"].status) {
                    throw new Error("Keywords index type map does not exist.");
                }
            
                return resolve({
                    success : true,
                    message : "Keywords index type map exists",
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
      * Remove word from dictionary index.
      * @method
      * @name removeWordFromDictionary
      * @param {String} word word to remove from dictionary index.
      * @returns {Promise} returns a promise.
     */

    static removeWordFromDictionary(word = "") {
        return new Promise(async (resolve, reject) => {
            try {

                if(word == "") {
                    throw new Error("Invalid word value.");
                }
                
                word = word.toLowerCase();
                
                const dictionaryWordRemoval = await elasticSearchHelper
                    .deleteDocumentFromIndex(
                        dictionaryIndex,
                        dictionaryIndexType,
                        encodeURI(word)
                    );

                if(dictionaryWordRemoval.statusCode != httpStatusCode["ok"].status) {
                    throw new Error("Failed to remove word from dictionary.")
                }
            
                return resolve({
                    success : true,
                    message : "Success",
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
      * Add word to dictionary index.
      * @method
      * @name addWordToDictionary
      * @param {String} word word to add to dictionary index.
      * @returns {Promise} returns a promise.
     */

    static addWordToDictionary(word = "") {
        return new Promise(async (resolve, reject) => {
            try {

                if(word == "") {
                    throw new Error("Invalid word value.");
                }

                word = word.toLowerCase();

                const addWordToDictionary = await elasticSearchHelper.createOrUpdateDocumentInIndex(
                    dictionaryIndex,
                    dictionaryIndexType,
                    encodeURI(word),
                    {words : word }
                );

                if(addWordToDictionary.statusCode != httpStatusCode["ok"].status && addWordToDictionary.statusCode != httpStatusCode["created"].status) {
                    throw new Error("Failed to add word to dictionary.")
                }
            
                return resolve({
                    success : true,
                    message : "Success",
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

};