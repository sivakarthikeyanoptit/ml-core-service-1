/**
 * name : message-constants/api-responses.js
 * author : Akash Shah
 * Date : 09-Dec-2019
 * Description : All api response messages.
 */


module.exports = {
  "BODH_SEARCH_MIDDLEWARE_FAILURE" : "Failed to retrieve search results.",
  "BODH_SEARCH_MIDDLEWARE_DID_YOU_MEAN_KEY" : "did_you_mean",
  "BODH_SEARCH_MIDDLEWARE_SUCCESS" : "Search result fetched successfully.",
  "BODH_SEARCH_AUTOCOMPLETE_SUCCESS" : "Search suggestions fetched successfully.",
  "BODH_SEARCH_AUTOCOMPLETE_FAILURE" : "Failed to retrieve search suggestions.",
  "DICTIONARY_KEYWORDS_MISSING_FILE_ERROR" : "Missing keywords file",
  "DICTIONARY_KEYWORDS_MAPPING_MISSING_ERROR" : "Dictionary keywords mapping is missing.",
  "DICTIONARY_KEYWORDS_UPDATE_SUCCESS" : "Content keywords updated successfully.",

  "ENTITY_NOT_FOUND" : "No entity found",
  "ENTITIES_FETCHED" : "List of entities fetched successfully",
  "IMMEDIATE_ENTITIES_FETCHED" : "List of immediate entities fetched",
  "BODY_NOT_FOUND" : "Body data not found",
  "QR_CODE_EXISTS" : "Qr code alreasy exists",
  "QR_CODE_DATA_SIZE" : "Qr code data should be greater than 0"
};
