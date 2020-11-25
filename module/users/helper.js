/**
 * name : users/helper.js
 * author : Aman Jung Karki
 * created-date : 03-Dc-2019
 * Description : All User related information including sys_admin.
 */


// Dependencies
const programsHelper = require(MODULES_BASE_PATH + "/programs/helper");
const solutionsHelper = require(MODULES_BASE_PATH + "/solutions/helper");
const sunbirdService = require(ROOT_PATH+"/generics/services/sunbird");


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
   * List of all private programs created by user
   * @method
   * @name privatePrograms
   * @param {string} userId - logged in user Id.
   * @returns {Array} - List of all private programs created by user.
   */

  static privatePrograms( userId ) {
    return new Promise(async (resolve, reject) => {
        try {

            let userPrivatePrograms = 
            await programsHelper.userPrivatePrograms(
                userId
            );

            return resolve({
                message : constants.apiResponses.PRIVATE_PROGRAMS_LIST,
                result : userPrivatePrograms
            })

        } catch (error) {
            return reject(error);
        }
    })
  }

   /**
   * Create user program and solution
   * @method
   * @name createProgramAndSolution
   * @param {string} userId - logged in user Id.
   * @param {object} programData - data needed for creation of program.
   * @param {object} solutionData - data needed for creation of solution.
   * @returns {Array} - Created user program and solution.
   */

  static createProgramAndSolution( userId,data,userToken ) {
    return new Promise(async (resolve, reject) => {
        try {

            let userPrivateProgram = {};
            let dateFormat = gen.utils.epochTime();

            const organisationAndRootOrganisations = 
            await this.getUserOrganisationsAndRootOrganisations(userId,userToken);

            if( data.programId && data.programId !== "" ) {

                userPrivateProgram =  await programsHelper.programDocuments(
                    {
                        _id : data.programId,
                        createdBy : userId
                    }
                );

                if( !userPrivateProgram.length > 0 ) {
                    return resolve({
                        message : constants.apiResponses.PROGRAM_NOT_FOUND,
                        result : {}
                    })
                }

                userPrivateProgram = userPrivateProgram[0];

            } else {

                let programData = {
                    name : data.programName,
                    isAPrivateProgram : true,
                    status : constants.common.ACTIVE_STATUS,
                    externalId : 
                    data.programExternalId ? 
                    data.programExternalId : 
                    data.programName + "-" + dateFormat,
                    description : 
                    data.programDescription ? 
                    data.programDescription : 
                    data.programName,
                    userId : userId
                }

                programData.createdFor =  organisationAndRootOrganisations.result.createdFor;
                programData.rootOrganisations = organisationAndRootOrganisations.result.rootOrganisations;

                userPrivateProgram = 
                await programsHelper.create(
                    programData
                );
            }

            let solutionData = {
                programId : userPrivateProgram._id,
                programExternalId : userPrivateProgram.externalId,
                programName : userPrivateProgram.name,
                programDescription : userPrivateProgram.description,
                type : data.type ? data.type : constants.common.ASSESSMENT,
                subType : data.subType ? data.subType : constants.common.INSTITUTIONAL
            }

            if( data.project ) {
                solutionData.project = data.project;
                solutionData.project._id = ObjectId(solutionData.project._id);
                solutionData.referenceFrom = constants.common.PROJECT;
            }

            if( data.entities ) {
                solutionData["entities"] = data.entities;
            }

            if( data.solutionName ) {
                solutionData["name"] = data.solutionName;
                solutionData["externalId"] = 
                data.solutionExternalId ? 
                data.solutionExternalId : data.solutionName+ "-" + dateFormat;
                solutionData["description"] = 
                data.solutionDescription ? data.solutionDescription : data.solutionName;
            } else {
                solutionData["name"] = userPrivateProgram.programName,
                solutionData["externalId"] = userId + "-" + dateFormat;
                solutionData["description"] = userPrivateProgram.programDescription;
            }

            solutionData.entities = data.entities;
            
            solutionData.createdFor =  organisationAndRootOrganisations.result.createdFor;
            solutionData.rootOrganisations = organisationAndRootOrganisations.result.rootOrganisations;

            const solution = await solutionsHelper.create(solutionData);

            if( solution._id ) {
                await database.models.programs.updateOne({ 
                    _id : userPrivateProgram._id 
                }, { 
                    $addToSet: { components : ObjectId(solution._id) } 
                });
            }

            return resolve({
                message : constants.apiResponses.USER_PROGRAM_AND_SOLUTION_CREATED,
                result : {
                    program : userPrivateProgram,
                    solution : solution
                }
            });

        } catch (error) {
            return reject(error);
        }
    })
  }

   /**
   * Get user organisations and root organisations.
   * @method
   * @name getUserOrganisationsAndRootOrganisations
   * @param {string} userId - logged in user Id.
   * @param {object} userToken - Logged in user token.
   * @returns {Array} - Get user organisations and root organisations.
   */

  static getUserOrganisationsAndRootOrganisations(userId,userToken) {
    return new Promise(async (resolve, reject) => {
        try {
            
            const userProfileData = 
            await sunbirdService.userProfile(userId,userToken);

            const createdFor = 
            userProfileData.organisations.map(
                organisation => {
                    return organisation.organisationId
                }
            );

            const rootOrganisations = [userProfileData.rootOrgId];

            return resolve({
                message : constants.apiResponses.USER_ORGANISATIONS_FETCHED,
                result : {
                    createdFor : createdFor,
                    rootOrganisations : rootOrganisations
                }
            });

        } catch(error) {
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