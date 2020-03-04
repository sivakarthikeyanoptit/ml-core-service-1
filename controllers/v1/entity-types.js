/**
 * name : entityTypesController.js
 * author : Akash
 * created-date : 22-Nov-2018
 * Description : Entity types information. 
 */

 // Dependencies
const entitiyTypesHelper = require(MODULES_BASE_PATH + "/entityTypes/helper");
const entitiesHelper = require(MODULES_BASE_PATH + "/entities/helper");

 /**
    * EntityTypes
    * @class
*/
module.exports = class EntityTypes extends Abstract {
  constructor() {
    super(schemas["entityTypes"]);
  }

  static get name() {
    return "entityTypes";
  }

};
