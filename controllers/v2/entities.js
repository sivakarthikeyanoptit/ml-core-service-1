/**
 * name : entities.js
 * author : Aman Jung Karki
 * created-date : 09-sep-2020
 * Description : All entities v2 related information.
 */


/**
 * dependencies
 */

const entitesV1 = require(ROOT_PATH + "/controllers/v1/entities");
const entitiesHelper = require(MODULES_BASE_PATH + "/entities/helper.js");

/**
    * EntitiesV2
    * @class
*/

module.exports = class EntitiesV2 extends entitesV1 {
    /**
     * @api {get} /kendra/api/v2/entities/listByEntityType/:entityType?page=:page&limit=:limit&search=:searchText 
     * List of entities based on its type
     * @apiVersion 2.0.0
     * @apiGroup Entities
     * @apiHeader {String} X-authenticated-user-token Authenticity token
     * @apiSampleRequest /kendra/api/v2/entities/listByEntityType/state?page=1&limit=1&search=p
     * @apiUse successBody
     * @apiUse errorBody
     * @apiParamExample {json} Response:
     * {
     * "message": "List of entities fetched successfully",
     * "status": 200,
     * "result": {
     * "data": [
            {
                "_id": "5da829874c67d63cca1bd9d0",
                "name": "Punjab",
                "externalId": "PBS"
            }
        ],
        "count": 8
    }
}
  }

    */

    /**
      * List of entities based on its type.
      * @method
      * @name listByEntityType
      * @param  {Request} req request body.
      * @returns {JSON} Returns list of entities
     */

    listByEntityType(req) {
        
        return new Promise(async (resolve, reject) => {
      
            try {
  
              const entityDocuments = await entitiesHelper.listByEntityType(
                req.params._id,
                req.pageSize,
                req.pageNo,
                req.searchText,
                constants.common.VERSION_2
              );
  
              return resolve(entityDocuments);
      
            } catch (error) {
      
              return reject({
                status: error.status || httpStatusCode.internal_server_error.status,
                message: error.message || httpStatusCode.internal_server_error.message,
                errorObject: error
              })
      
            }
        })
    }
}