/**
 * name : users/helper.js
 * author : Aman Jung Karki
 * created-date : 03-Dc-2019
 * Description : All User related information including sys_admin.
 */



// Dependencies 

const userRolesHelper = require(MODULES_BASE_PATH + "/user-roles/helper");
const entitiesHelper = require(MODULES_BASE_PATH + "/entities/helper");

/**
    * UsersHelper
    * @class
*/

module.exports = class UsersHelper {

     /**
      * create user.
      * @method
      * @name create
      * @param {Object} userData user data.
      * @param {String} userData.email email id of the user.
      * @param {String} userData.userName  name of the user.
      * @param {String} userData.role  role of the user.
      * @returns {Promise} returns a promise.
     */

    static create(userData) {
        return new Promise(async (resolve, reject) => {
            try {

                let checkUserExistence = 
                await database.models.users.findOne({
                    email : userData.email
                }).lean();

                if(checkUserExistence) {
                    throw {
                        message : "User already exists"
                    }
                }

                let createUser = 
                await database.models.users.create(userData)

                let response = {
                    success : true,
                    message : "User created successfully"
                }

                if(!createUser) {
                    response["success"] = false;
                    response["message"] = "User could not be created";
                }

                return resolve(response);
                
            } catch (error) {
                return reject(error);
            }
        })
    }
   
    /**
      * check if the provided email is sys admin or not.
      * @method
      * @name isSystemAdmin
      * @param {String} userEmail user email address.
      * @returns {Promise} returns a promise.
     */

    static isSystemAdmin(userEmail) {
        return new Promise(async (resolve, reject) => {
            try {

                let userDocument = 
                await database.models.users.findOne({
                    email : userEmail,
                    role : "SYS_ADMIN"
                }).lean();

                let response = {
                    success : true
                }

                if(!userDocument) {
                    response["success"] = false;
                }

                return resolve(response);
                
            } catch (error) {
                return reject(error);
            }
        })
    }

    /**
      * Entities mapping form data.
      * @method
      * @name entitiesMappingForm
      * @param {String} stateId - state id.
      * @param {String} roleId - role id.
      * @returns {Object} returns a list of entitiesMappingForm.
     */

    static entitiesMappingForm(stateId,roleId) {
        return new Promise(async (resolve, reject) => {
            try {

                const rolesData = await userRolesHelper.roleDocuments({
                    _id : roleId
                },["entityTypes.entityType"]);

                if( !rolesData.length > 0 ) {
                    return resolve({
                        message : constants.apiResponses.USER_ROLES_NOT_FOUND,
                        result : []
                    })
                }

                const entitiesData = await entitiesHelper.entityDocuments(
                    {
                        _id : stateId,
                    },["childHierarchyPath"]
                );

                if( !entitiesData.length > 0 ) {
                    return resolve({
                        message : constants.apiResponses.ENTITY_NOT_FOUND,
                        result : []
                    })
                }

                let roleEntityType = "";

                rolesData[0].entityTypes.forEach(roleData=>{
                    if(entitiesData[0].childHierarchyPath.includes(roleData.entityType)) {
                        roleEntityType = roleData.entityType;
                    }
                })

                let entityTypeIndex = 
                entitiesData[0].childHierarchyPath.findIndex(path => path === roleEntityType);

                let form = {
                    "field" : "",
                    "label" : "",
                    "value" : "",
                    "visible" : true,
                    "editable" : true,
                    "input" : "text",
                    "validation" : {
                        "required" : false
                    }
                };

                let forms = [];
                
                for( 
                    let pointerToChildHierarchy = 0; 
                    pointerToChildHierarchy < entityTypeIndex + 1; 
                    pointerToChildHierarchy ++
                ) {
                    let cloneForm = JSON.parse(JSON.stringify(form));
                    let entityType = entitiesData[0].childHierarchyPath[pointerToChildHierarchy];
                    cloneForm["field"] = entityType;
                    cloneForm["label"] = `Select ${gen.utils.camelCaseToTitleCase(entityType)}`;

                    if( roleEntityType === entityType ) {
                        cloneForm.validation.required = true;
                    }

                    forms.push(cloneForm);
                }

                return resolve({
                    message : constants.apiResponses.ENTITIES_MAPPING_FORM_FETCHED,
                    result : forms
                });
                
            } catch (error) {
                return reject(error);
            }
        })
    }

};