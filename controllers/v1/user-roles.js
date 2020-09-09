/**
 * name : user-roles.js
 * author : Aman Jung Karki
 * created-date : 11-Feb-2020
 * Description : All user roles related information.
 */


/**
    * UserRoles
    * @class
*/

module.exports = class UserRoles extends Abstract {

  constructor() {
    super(schemas["user-roles"]);
  }

  static get name() {
    return "user-roles";
  }

};

