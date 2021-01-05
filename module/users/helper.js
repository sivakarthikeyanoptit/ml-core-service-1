/**
 * name : users/helper.js
 * author : Aman Jung Karki
 * created-date : 03-Dc-2019
 * Description : All User related information including sys_admin.
 */


// Dependencies
const programsHelper = require(MODULES_BASE_PATH + "/programs/helper");
const solutionsHelper = require(MODULES_BASE_PATH + "/solutions/helper");
const sunbirdService = require(ROOT_PATH + "/generics/services/sunbird");
const assessmentService = require(ROOT_PATH + "/generics/services/samiksha");


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
                        email: userData.email
                    }).lean();

                if (checkUserExistence) {
                    throw {
                        message: "User already exists"
                    }
                }

                let createUser =
                    await database.models.users.create(userData)

                let response = {
                    success: true,
                    message: "User created successfully"
                }

                if (!createUser) {
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
                        email: userEmail,
                        role: "SYS_ADMIN"
                    }).lean();

                let response = {
                    success: true
                }

                if (!userDocument) {
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

    static privatePrograms(userId) {
        return new Promise(async (resolve, reject) => {
            try {

                let userPrivatePrograms =
                    await programsHelper.userPrivatePrograms(
                        userId
                    );

                return resolve({
                    message: constants.apiResponses.PRIVATE_PROGRAMS_LIST,
                    result: userPrivatePrograms
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

    static createProgramAndSolution(userId, data, userToken) {
        return new Promise(async (resolve, reject) => {
            try {

                let userPrivateProgram = {};
                let dateFormat = gen.utils.epochTime();

                const organisationAndRootOrganisations =
                    await this.getUserOrganisationsAndRootOrganisations(userId, userToken);

                if (data.programId && data.programId !== "") {

                    userPrivateProgram = await programsHelper.programDocuments(
                        {
                            _id: data.programId,
                            createdBy: userId
                        }
                    );

                    if (!userPrivateProgram.length > 0) {
                        return resolve({
                            status: httpStatusCode['bad_request'].status,
                            message: constants.apiResponses.PROGRAM_NOT_FOUND,
                            result: {}
                        })
                    }

                    userPrivateProgram = userPrivateProgram[0];

                } else {

                    let programData = {
                        name: data.programName,
                        isAPrivateProgram: true,
                        status: constants.common.ACTIVE_STATUS,
                        externalId:
                            data.programExternalId ?
                                data.programExternalId :
                                data.programName + "-" + dateFormat,
                        description:
                            data.programDescription ?
                                data.programDescription :
                                data.programName,
                        userId: userId
                    }

                    programData.createdFor = organisationAndRootOrganisations.result.createdFor;
                    programData.rootOrganisations = organisationAndRootOrganisations.result.rootOrganisations;

                    userPrivateProgram =
                        await programsHelper.create(
                            programData
                        );
                }

                let solutionDataToBeUpdated = {
                    programId: userPrivateProgram._id,
                    programExternalId: userPrivateProgram.externalId,
                    programName: userPrivateProgram.name,
                    programDescription: userPrivateProgram.description,
                    isAPrivateProgram: userPrivateProgram.isAPrivateProgram
                };

                if (data.entities && data.entities.length > 0) {

                    let entityData = await entitiesHelper.entityDocuments(
                        {
                            _id: { $in: data.entities }
                        }, ["entityType", "entityTypeId"]
                    );

                    if (!entityData.length > 0) {
                        return resolve({
                            status: httpStatusCode['bad_request'].status,
                            message: constants.apiResponses.ENTITY_NOT_FOUND,
                            result: {}
                        })
                    }

                    solutionDataToBeUpdated["entities"] = entityData.map(entity => entity._id);
                    solutionDataToBeUpdated["entityType"] = entityData[0].entityType;
                    solutionDataToBeUpdated["entityTypeId"] = entityData[0].entityTypeId;
                }

                let solution = ""

                if (data.solutionId && data.solutionId !== "") {

                    let solutionData =
                        await solutionsHelper.solutionDocuments({
                            _id: data.solutionId,
                            isReusable: false
                        }, ["_id"]);

                    if (!solutionData.length > 0) {

                        return resolve({
                            status: httpStatusCode['bad_request'].status,
                            message: constants.apiResponses.SOLUTION_NOT_FOUND,
                            result: {}
                        })
                    }

                    solution =
                        await database.models.solutions.findOneAndUpdate({
                            _id: solutionData[0]._id
                        }, {
                            $set: solutionDataToBeUpdated
                        }, {
                            new: true
                        });


                } else {

                    solutionDataToBeUpdated["type"] =
                        data.type ? data.type : constants.common.ASSESSMENT;
                    solutionDataToBeUpdated["subType"] =
                        data.subType ? data.subType : constants.common.INSTITUTIONAL;

                    solutionDataToBeUpdated["isReusable"] = false;

                    if (data.solutionName) {
                        solutionDataToBeUpdated["name"] = data.solutionName;
                        solutionDataToBeUpdated["externalId"] =
                            data.solutionExternalId ?
                                data.solutionExternalId : data.solutionName + "-" + dateFormat;
                        solutionDataToBeUpdated["description"] =
                            data.solutionDescription ? data.solutionDescription : data.solutionName;
                    } else {
                        solutionDataToBeUpdated["name"] = userPrivateProgram.programName,
                            solutionDataToBeUpdated["externalId"] = userId + "-" + dateFormat;
                        solutionDataToBeUpdated["description"] = userPrivateProgram.programDescription;
                    }

                    solutionDataToBeUpdated.createdFor = organisationAndRootOrganisations.result.createdFor;
                    solutionDataToBeUpdated.rootOrganisations = organisationAndRootOrganisations.result.rootOrganisations;
                    solutionDataToBeUpdated.updatedBy = userId;

                    solution = await solutionsHelper.create(solutionDataToBeUpdated);
                }

                if (solution._id) {

                    await database.models.programs.findOneAndUpdate(
                        {
                            _id: userPrivateProgram._id
                        }, {
                        $addToSet: { components: ObjectId(solution._id) }
                    });
                }

                return resolve({
                    message: constants.apiResponses.USER_PROGRAM_AND_SOLUTION_CREATED,
                    result: {
                        program: userPrivateProgram,
                        solution: solution
                    }
                });

            } catch (error) {
                console.log(error);
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

    static getUserOrganisationsAndRootOrganisations(userId, userToken) {
        return new Promise(async (resolve, reject) => {
            try {

                const userProfileData =
                    await sunbirdService.userProfile(userId, userToken);

                const createdFor =
                    userProfileData.organisations.map(
                        organisation => {
                            return organisation.organisationId
                        }
                    );

                const rootOrganisations = [userProfileData.rootOrgId];

                return resolve({
                    message: constants.apiResponses.USER_ORGANISATIONS_FETCHED,
                    result: {
                        createdFor: createdFor,
                        rootOrganisations: rootOrganisations
                    }
                });

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

    static entitiesMappingForm(stateId, roleId) {
        return new Promise(async (resolve, reject) => {
            try {

                const rolesData = await userRolesHelper.roleDocuments({
                    _id: roleId
                }, ["entityTypes.entityType"]);

                if (!rolesData.length > 0) {
                    return resolve({
                        message: constants.apiResponses.USER_ROLES_NOT_FOUND,
                        result: []
                    })
                }

                const entitiesData = await entitiesHelper.entityDocuments(
                    {
                        _id: stateId,
                    }, ["childHierarchyPath"]
                );

                if (!entitiesData.length > 0) {
                    return resolve({
                        message: constants.apiResponses.ENTITY_NOT_FOUND,
                        result: []
                    })
                }

                let roleEntityType = "";

                rolesData[0].entityTypes.forEach(roleData => {
                    if (entitiesData[0].childHierarchyPath.includes(roleData.entityType)) {
                        roleEntityType = roleData.entityType;
                    }
                })

                let entityTypeIndex =
                    entitiesData[0].childHierarchyPath.findIndex(path => path === roleEntityType);

                let form = {
                    "field": "",
                    "label": "",
                    "value": "",
                    "visible": true,
                    "editable": true,
                    "input": "text",
                    "validation": {
                        "required": false
                    }
                };

                let forms = [];

                for (
                    let pointerToChildHierarchy = 0;
                    pointerToChildHierarchy < entityTypeIndex + 1;
                    pointerToChildHierarchy++
                ) {
                    let cloneForm = JSON.parse(JSON.stringify(form));
                    let entityType = entitiesData[0].childHierarchyPath[pointerToChildHierarchy];
                    cloneForm["field"] = entityType;
                    cloneForm["label"] = `Select ${gen.utils.camelCaseToTitleCase(entityType)}`;

                    if (roleEntityType === entityType) {
                        cloneForm.validation.required = true;
                    }

                    forms.push(cloneForm);
                }

                return resolve({
                    message: constants.apiResponses.ENTITIES_MAPPING_FORM_FETCHED,
                    result: forms
                });

            } catch (error) {
                return reject(error);
            }
        })
    }

    /**
      * To search the users
      * @method
      * @name isSystemAdmin
      * @param {String} searchText search text
      * @param {String} token user access token
      * @returns {Object} returns a user details.
     */

    static search(searchText, token) {
        return new Promise(async (resolve, reject) => {
            try {

                let searchFields = ['userName', 'email', 'phone'];
                let userInfo;
                for (let index = 0; index < searchFields.length; index++) {
                    let userFilters = {};
                    userFilters[searchFields[index]] = searchText;
                    let userSearchResult =
                        await sunbirdService.userSearch(userFilters, token);
                    if (userSearchResult
                        && userSearchResult.result
                        && userSearchResult.result.count
                        && userSearchResult.result.count > 0) {
                        userInfo = userSearchResult.result.content;
                        break;
                    }
                }
                if (userInfo) {

                    let userData = {
                        lastName:userInfo[0].lastName,
                        maskedPhone:userInfo[0].maskedPhone,
                        email:userInfo[0].email,
                        identifier:userInfo[0].identifier,
                        userName:userInfo[0].userName
                    }
                    
                    return resolve({
                        result: userData,
                        message: constants.apiResponses.USER_EXTENSION_FETCHED
                    });
                } else {
                    return resolve({
                        result: {},
                        message: constants.apiResponses.USER_NOT_FOUND
                    });
                }
            } catch (error) {
                return reject(error);
            }
        })
    }

    /**
    * Get user targeted programs.
    * @method
    * @name programs
    * @param {Object} bodyData - request body data.
    * @param {String} userToken - Logged in user token.
    * @param {String} pageNo - Page number.
    * @param {String} pageSize - Page size.
    * @param {String} searchText - Search text.
    * @returns {Array} - Get user targeted programs.
    */

   static programs(bodyData, userToken, pageNo, pageSize,searchText) {
        return new Promise(async (resolve, reject) => {
            try {


                let filterEntities = Object.values(_.omit(bodyData,["role","filteredData"])).map(entity => {
                    return ObjectId(entity);
                });

                let targetedProgramQuery = {
                    "scope.roles.code" : bodyData.role,
                    "scope.entities" : { $in : filterEntities }
                }

                let targetedPrograms =  await programsHelper.programDocuments(targetedProgramQuery,["_id"]);

                if( !targetedPrograms.length > 0 ) {
                    throw {
                      message : constants.apiResponses.PROGRAM_NOT_FOUND
                    };
                }

                let targetedProgramIds = [];
          
                targetedPrograms.forEach(targetedProgram => {
                    targetedProgramIds.push(targetedProgram._id);
                });
                  
                let matchQuery = {
                    "$match" : {
                      _id : { $in : targetedProgramIds },
                      "isDeleted" : false,
                      status : constants.common.ACTIVE_STATUS
                    }
                };

                let targettedPrograms = await programsHelper.search(
                    matchQuery,
                    pageSize,
                    pageNo,
                    {
                      name : 1,
                      description : 1,
                      externalId: 1,
                      components: 1
                    },
                    searchText
                );

                targettedPrograms[0].description = constants.apiResponses.PROGRAM_DESCRIPTION;
             
                if (targettedPrograms[0].data && targettedPrograms[0].data.length > 0) {
                    targettedPrograms[0].data.map( program => {
                        program.solutions = program.components.length;
                        delete program.components;
                    })
                }

                return resolve({
                    success: true,
                    message: constants.apiResponses.USER_TARGETED_PROGRAMS_FETCHED,
                    result: targettedPrograms[0]
                });

            } catch (error) {
                return resolve({
                    success: false,
                    message: error.message,
                    data: []
                });
            }
        })
    }

    /**
    * Get user targeted solutions.
    * @method
    * @name solutions
    * @param {Object} bodyData - request body data.
    * @param {String} progamId - Program Id.
    * @param {String} userToken - Logged in user token.
    * @returns {Array} - Get user targeted solutions.
    */

   static solutions(bodyData, programId, userToken, pageNo, pageSize,searchText) {
        return new Promise(async (resolve, reject) => {
            try {

                let filterEntities = 
                  Object.values(_.omit(bodyData,["role"])).map(entity => {
                    return ObjectId(entity);
                });

                let targetedSolutionQuery = {
                    "scope.roles.code" : bodyData.role,
                    programId : programId,
                    isReusable : false
                }

                let targetedSolutions =  await solutionsHelper.solutionDocuments(targetedSolutionQuery,["_id"]);

                if( !targetedSolutions.length > 0 ) {
                    throw {
                      message : constants.apiResponses.SOLUTION_NOT_FOUND
                    };
                }

                let targetedSolutionIds = [];
          
                targetedSolutions.forEach(targetedSolution => {
                    targetedSolutionIds.push(targetedSolution._id);
                });
                  
                let matchQuery = {
                    "$match" : {
                      _id : { $in : targetedSolutionIds },
                      "isDeleted" : false,
                      status : constants.common.ACTIVE_STATUS
                    }
                };

                let targettedSolutions = await solutionsHelper.search(
                    matchQuery,
                    pageSize,
                    pageNo,
                    {
                      name : 1,
                      externalId: 1,
                      type: 1,
                      programId: 1,
                      programName: 1,
                      programDescription: 1,
                      "scope.roles": 1,
                    },
                    searchText
                );

                targettedSolutions[0].programName = targettedSolutions[0].data[0]['programName'];
                targettedSolutions[0].description = targettedSolutions[0].data[0]['programDescription'];
             
                if (targettedSolutions[0].data && targettedSolutions[0].data.length > 0) {
                    targettedSolutions[0].data.map( solution => {
                        delete solution.programName;
                        delete solution.programDescription;

                        let role = [];
                        if(solution.scope.roles && solution.scope.roles.length >0){
                          let scope = solution.scope.roles;
                          for (var j = 0 ; j < scope.length ; j++) {
                            role.push(scope[j].code)
                          }
                     
                          solution['roles'] = role;
                        }
            
                        delete solution.scope;
                    })
                }
                 
                return resolve({
                    success: true,
                    message: constants.apiResponses.USER_TARGETED_SOLUTIONS_FETCHED,
                    result: targettedSolutions[0]
                });

            } catch (error) {
                return resolve({
                    success: false,
                    message: error.message,
                    data: []
                });
            }
        })
    }

};