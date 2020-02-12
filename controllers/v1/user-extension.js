/**
 * name : user-extensions.js
 * author : Aman Jung Karki
 * created-date : 11-Feb-2020
 * Description : All user extension related information.
 */

/**
    * UserExtension
    * @class
*/

module.exports = class UserExtension extends Abstract {
  
  constructor() {
    super(schemas["user-extension"]);
  }

  static get name() {
    return "user-extension";
  }


};
