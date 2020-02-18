/**
 * name : message-constants/common.js
 * author : Akash Shah
 * Date : 09-Dec-2019
 * Description : All common messages.
 */


module.exports = {
  "SUCCESS" : "Success.",
  "FAILED" : "Failed.",
  schema : {
    METAINFORMATION : "metaInformation",
    EXTERNALID : "externalId",
    NAME : "name",
    ENTITYTYPE : "entityType",
    GROUPS : "groups"
  },
  endPoints : {
    createProfile : "/userProfile/create",
    updateProfile : "/userProfile/update",
    verifyProfile : "/userProfile/verify",
    platformUserProfile : "/platformUserRoles/getProfile",
    userProfileDetails : "/userProfile/details",
    getFilePublicBaseUrl : "/files/getFilePublicBaseUrl"
  }
};
