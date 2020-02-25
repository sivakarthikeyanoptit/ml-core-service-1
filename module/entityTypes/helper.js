/**
 * name : entityTypes/helper.js
 * author : Aman
 * created-date : 22-Feb-2019
 * Description : Entity types related helper functionality.
 */

 /**
    * EntityTypesHelper
    * @class
*/
module.exports = class EntityTypesHelper {

    /**
      * Get immediate children entity type.
      * @method
      * @name immediateChildrenEntityType
      * @param {String} entityType - entity type.
      * @returns {Object} returns immediate children entity type.
     */

    static immediateChildrenEntityType(entityType) {
        return new Promise(async (resolve, reject) => {
            try {

                let entityTypeData = 
                await database.models.entityTypes.findOne({
                    name : entityType
                },{ immediateChildrenEntityType : 1 }).lean();

                return resolve(entityTypeData);

            } catch (error) {
                return reject(error);
            }
        })

    }

};