/**
 * name : staticLinks.js.
 * author : Rakesh.
 * created-date : 23-Oct-2020
 * Description : Schema for projects.
 */
module.exports = {
    name: "staticLinks",
    schema: {
      value: String,
      title: String,
      link: String,
      createdBy: String,
      updatedBy: String,
      status: String,
      appType: String,
      metaInformation: Object,
      isDeleted: {
        type : Boolean,
        default : false
      },
      appName : String,
      isCommon : {
        type : Boolean,
        default : function() {
          if( this.appName && this.appName !== "") {
            return false;
          } else {
            return true;
          }
        }
      }
    }
  };