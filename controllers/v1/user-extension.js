const userExtensionHelper = require(ROOT_PATH + "/module/user-extension/helper");

module.exports = class UserExtension extends Abstract {
  
  constructor() {
    super(schemas["user-extension"]);
  }

  static get name() {
    return "user-extension";
  }


};
