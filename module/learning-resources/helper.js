/** 
* name : helper.js
* author : Rakesh Kumar
* created-date : 02-Nov-2020
* Description : Related to learning resources
*/

// Dependencies
const sunbirdService = 
require(ROOT_PATH +"/generics/services/sunbird-application");

/**
* Learning resource related information be here.
* @method
* @class  LearningResourcesHelper
*/

module.exports = class LearningResourcesHelper {

  /**
  * To get list of learning resources
  * @method
  * @name  list
  * @param {String} token - user access token.
  * @param {String} pageSize - page size of the request
  * @param {String} pageNo - page no of the request
  * @param {Object} filters - resource filters
  * @param {Array} filters.category - categories for the learning resource
  * @param {Array} filters.subCategory - subcategories for the learning resource
  * @param {Array} filters.topic - topic's for the learning resource
  * @param {Array} filters.language - language's of the learning resources

  * @returns {json} Response consists of list of learning resources
  */
  static list(token, pageSize, pageNo, filters) {
    return new Promise(async (resolve, reject) => {
        try {

            let learningResources = await sunbirdService.learningResources(token, pageSize, pageNo, filters, "");
            if (learningResources && learningResources.result && learningResources.result.content) {
             
               resolve({
                message: learningResources.message,
                data: {
                    count : learningResources.result.count,
                    content: learningResources.result.content 
                },
                success: true
              });
            } else {
              throw new Error(constants.apiResponses.LEARNING_RESORCES_NOT_FOUND);
            }
          } catch (error) {
            resolve({
              message: error.message,
              data: false,
              success: false
            });
          }
    })

  }
}