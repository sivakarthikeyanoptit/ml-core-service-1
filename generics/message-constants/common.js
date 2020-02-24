/**
 * name : message-constants/common.js
 * author : Akash Shah
 * Date : 09-Dec-2019
 * Description : All common messages.
 */


module.exports = {
  "SUCCESS" : "Success.",
  "FAILED" : "Failed.",
  "OK" : "OK",
  schema : {
    METAINFORMATION : "metaInformation",
    EXTERNALID : "externalId",
    NAME : "name",
    ENTITYTYPE : "entityType",
    GROUPS : "groups"
  },
  BODH_DIAL_CODE_LIVE_STATUS : "Live",
  endPoints : {
    createProfile : "/userProfile/create",
    updateProfile : "/userProfile/update",
    verifyProfile : "/userProfile/verify",
    platformUserProfile : "/platformUserRoles/getProfile",
    userProfileDetails : "/userProfile/details",
    BODH_GENERATE_DIALCODE : "/api/dialcode/v1/generate",
    BODH_PUBLISH_DIALCODE : "/api/dialcode/v1/publish/",
    BODH_DIALCODE_STATUS : "/api/dialcode/v1/read",
    BODH_CONTENT_LINK : "/api/dialcode/v1/content/link",
    BODH_PUBLISH_CONTENT : "/api/content/v1/publish/"
  }
};
