/**
 * name : v1.js
 * author : Aman
 * created-date : 19-Jan-2021
 * Description : Solutions validation.
 */

module.exports = (req) => {

    let solutionsValidator = {

        create : function () {
            req.checkBody('createdFor').exists().withMessage("required organisation created for id");
            req.checkBody('rootOrganisations').exists().withMessage("required root organisations id");
            req.checkBody('programExternalId').exists().withMessage("required program externalId");
            req.checkBody('entityType').exists().withMessage("required entity type");
            req.checkBody('externalId').exists().withMessage("required solution externalId");
            req.checkBody('name').exists().withMessage("required solution name");
            req.checkBody('type').exists().withMessage("required solution type");
            req.checkBody('subType').exists().withMessage("required solution subType");
        },
        update : function () {
            req.checkParams("_id").exists().withMessage("required solution id");
        },
        forUserRoleAndLocationDetails : function () {
            req.checkParams("_id").exists().withMessage("Required solution id");
        }
    }

    if (solutionsValidator[req.params.method]) {
        solutionsValidator[req.params.method]();
    }

};