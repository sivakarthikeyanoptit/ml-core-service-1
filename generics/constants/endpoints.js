/**
 * name : constants/endpoints.js
 * author : Aman
 * Date : 28-feb-2020
 * Description : All service endpoints
 */

module.exports = {
    // User management apis endpoints
    CREATE_USER_PROFILE : "/userProfile/create",
    UPDATE_USER_PROFILE : "/userProfile/update",
    VERIFY_USER_PROFILE : "/userProfile/verify",
    PLATFORM_USER_PROFILE : "/platformUserRoles/getProfile",
    USER_PROFILE_DETAILS : "/userProfile/details",

    // Bodh apis endpoints
    SUNBIRD_GENERATE_DIALCODE : "/api/dialcode/v1/generate",
    SUNBIRD_PUBLISH_DIALCODE : "/api/dialcode/v1/publish",
    SUNBIRD_DIALCODE_STATUS : "/api/dialcode/v1/read",
    SUNBIRD_CONTENT_LINK : "/api/dialcode/v1/content/link",
    SUNBIRD_PUBLISH_CONTENT : "/api/content/v1/publish",
    SUNBIRD_USER_READ : "/api/user/v1/read"
}