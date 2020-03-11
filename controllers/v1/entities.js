/**
 * name : entities.js
 * author : Aman Jung Karki
 * created-date : 19-Dec-2019
 * Description : All entities related information.
 */


/**
 * dependencies
 */

const entitiesHelper = require(MODULES_BASE_PATH + "/entities/helper.js");

/**
    * Entities
    * @class
*/

module.exports = class Entities extends Abstract {

    constructor() {
        super(schemas["entities"]);
    }

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
        return "entities";
    }

    /**
     * @api {post} /kendra/api/v1/entities/listByEntityType/:entityType 
     * List entities based on type
     * @apiVersion 1.0.0
     * @apiGroup User
     * @apiHeader {String} X-authenticated-user-token Authenticity token
     * @apiSampleRequest /kendra/api/v1/entities/listByEntityType/state
     * @apiUse successBody
     * @apiUse errorBody
     * @apiParamExample {json} Response:
     * {
     * "message": "List of entities fetched successfully",
     * "status": 200,
     * "result": [
     *  {
            "externalId": "AP",
            "name": "Andhra Pradesh",
            "_id": "5e26c2b0d007227fb039d993"
        }
    ]
  }

    */

    /**
      * List of entities based on type.
      * @method
      * @name listByEntityType
      * @param  {Request} req request body.
      * @returns {JSON} Returns list of entities
     */

    listByEntityType(req) {
        
      return new Promise(async (resolve, reject) => {
    
          try {

            let requestedData = {
                entityType : req.params._id,
                pageSize : req.pageSize,
                pageNo : req.pageNo
            }

            let entityDocuments = await entitiesHelper.listByEntityType(
                requestedData
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


    /**
     * @api {post} /kendra/api/v1/entities/sublist/:entityId
     * List entities based on type
     * @apiVersion 1.0.0
     * @apiGroup User
     * @apiHeader {String} X-authenticated-user-token Authenticity token
     * @apiSampleRequest /kendra/api/v1/entities/sublist/5dc92818e153ef2dc4b8cb4a
     * @apiUse successBody
     * @apiUse errorBody
     * @apiParamExample {json} Response:
     * {
     * "message": "List of immediate entities fetched",
     * "status": 200,
     * "result": [
     * {
     * "data": [
     * {
     * "_id": "5d7b91343a0f744513478522",
     * "entityType": "zone",
     * "name": "Zone 1",
     * "externalId": "1"
     * }
     * ],
     * "count": 1
     * }
     * ]
     * }
  }

    /**
      * Get the immediate entities .
      * @method
      * @name subList
      * @param  {Request} req request body.
      * @returns {JSON} Returns list of immediate entities
     */

    subEntityList(req) {
        
      return new Promise(async (resolve, reject) => {

        if( !(req.params._id || req.body.entities) ) {
          return resolve({
            status :  httpStatusCode.bad_request.status,
            message : constants.apiResponses.ENTITY_ID_NOT_FOUND
          })
        }
    
          try {
            
            let entityDocuments = await entitiesHelper.subEntityList(
              req.body.entities ? req.body.entities : "",
              req.params._id ? req.params._id : "",
              req.query.type ? req.query.type : "",
              req.searchText,
              req.pageSize,
              req.pageNo
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

};

