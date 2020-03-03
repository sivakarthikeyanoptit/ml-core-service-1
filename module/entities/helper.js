let entityTypesHelper = require(MODULES_BASE_PATH+"/entityTypes/helper");

module.exports = class EntitiesHelper {
    
    /**
   * List entity documents.
   * @method
   * @name entityDocuments
   * @param {Object} [findQuery = "all"] - filter query object if not provide 
   * it will load all the document.
   * @param {Array} [fields = "all"] - All the projected field. If not provided
   * returns all the field
   * @param {Number} [limitingValue = ""] - total data to limit.
   * @param {Number} [skippingValue = ""] - total data to skip.
   * @returns {Array} - returns an array of entities data.
   */

  static entityDocuments(
      findQuery = "all", 
      fields = "all", 
      limitingValue = "", 
      skippingValue = "",
      sortedData = ""
  ) {
    return new Promise(async (resolve, reject) => {
        try {

            let queryObject = {};

            if (findQuery != "all") {
                queryObject = findQuery;
            }

            let projectionObject = {};

            if (fields != "all") {
                fields.forEach(element => {
                    projectionObject[element] = 1;
                });
            }

            let entitiesDocuments;
            
            if( sortedData !== "" ) {
            entitiesDocuments = await database.models.entities
                .find(queryObject, projectionObject)
                .sort(sortedData)
                .limit(limitingValue)
                .skip(skippingValue)
                .lean();
            } else {
                entitiesDocuments = await database.models.entities
                .find(queryObject, projectionObject)
                .limit(limitingValue)
                .skip(skippingValue)
                .lean();
            }
            

            return resolve(entitiesDocuments);
        } catch (error) {
            return reject(error);
        }
    });
  }

  /**
   * List all entities based on type.
   * @method
   * @name listByEntityType
   * @param {Object} data 
   * @param {String} data.entityType - entity type
   * @param {Number} data.pageSize - total page size.
   * @param {Number} data.pageNo - page number.
   * @returns {Array} - List of all entities based on type.
   */

  static listByEntityType(data) {
    return new Promise(async (resolve, reject) => {
        try {

            let entityName = constants.schema.METAINFORMATION+"."+
            constants.schema.NAME;

            let entityExternalId = constants.schema.METAINFORMATION+"."+
            constants.schema.EXTERNALID;

            let projection = [entityName,entityExternalId];
            
            let skippingValue = data.pageSize * (data.pageNo - 1);
    
            let entityDocuments =  await this.entityDocuments({ 
              entityType : data.entityType
            }, 
            projection,
            data.pageSize, 
            skippingValue,
            {
                [entityName] : 1
            }
            );
    
            if ( entityDocuments.length < 1 ) {
              throw { 
                status: httpStatusCode.not_found.status, 
                message: constants.apiResponses.ENTITY_NOT_FOUND
              };
            }
    
            entityDocuments = entityDocuments.map(entityDocument =>{
              return {
                externalId : entityDocument.metaInformation.externalId,
                name : entityDocument.metaInformation.name,
                _id : entityDocument._id
              }
            });

            return resolve({
                message : constants.apiResponses.ENTITIES_FETCHED,
                result : entityDocuments
            });

        } catch(error) {
            reject(error);
        }
    })

  }

   /**
   * Get immediate entities.
   * @method
   * @name listByEntityType
   * @param {Object} entityId
   * @returns {Array} - List of all immediateEntities based on entityId.
   */

  static immediateEntities(entityId) {
    return new Promise(async (resolve, reject) => {

        let projection = [
            constants.schema.ENTITYTYPE,
            constants.schema.GROUPS
        ];

        let entitiesDocument = await this.entityDocuments({
            _id : entityId
        },projection);

        let immediateEntities = [];
        let immediateEntityType = "";

        if(
            entitiesDocument[0].groups && 
            Object.keys(entitiesDocument[0].groups).length > 0
        ) {

            let getEmmediateEntityTypes = 
            await entityTypesHelper.immediateChildrenEntityType(
                entitiesDocument[0].entityType 
            );

            let immediateEntitiesIds;

            Object.keys(entitiesDocument[0].groups).forEach(entityGroup=>{
              if(
                  getEmmediateEntityTypes.immediateChildrenEntityType && 
                  getEmmediateEntityTypes.immediateChildrenEntityType.length > 0 &&
                  getEmmediateEntityTypes.immediateChildrenEntityType.includes(entityGroup)
                ) {
                    immediateEntitiesIds = entitiesDocument[0].groups[entityGroup];
                }
            })

            if( 
                Array.isArray(immediateEntitiesIds) && 
                immediateEntitiesIds.length > 0 
            ) {

                let entityName = constants.schema.METAINFORMATION+"."+
                constants.schema.NAME;

                let entityExternalId = constants.schema.METAINFORMATION+"."+
                constants.schema.EXTERNALID;

                immediateEntities = await this.entityDocuments({
                    _id : { $in: immediateEntitiesIds}
                },[
                    entityName,
                    entityExternalId,
                    constants.schema.ENTITYTYPE
                ]);

                if( immediateEntities.length > 0 ) {
                    immediateEntityType = immediateEntities[0].entityType;
                    immediateEntities = immediateEntities.map(entities =>{
                        return {
                                externalId : entities.metaInformation.externalId,
                                name : entities.metaInformation.name,
                                _id : entities._id
                        }
                      })
                }
            }
        }

        let result = {
            immediateEntityType : immediateEntityType,
            data : immediateEntities,
        }

        resolve({
            message : constants.apiResponses.IMMEDIATE_ENTITIES_FETCHED,
            result : result
        });
    })
  }
}
