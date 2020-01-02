const userExtensionHelper = require(MODULES_BASE_PATH + "/user-extension/helper");

module.exports = class UserExtension extends Abstract {
  
  constructor() {
    super(schemas["user-extension"]);
  }

  static get name() {
    return "user-extension";
  }


};
