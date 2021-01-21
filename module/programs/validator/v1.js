/**
 * name : v1.js
 * author : Aman
 * created-date : 19-Jan-2021
 * Description : Programs validation.
 */

module.exports = (req) => {

    let programsValidator = {

        create : function () {
            req.checkBody('createdFor').exists().withMessage("required organisation created for id");
            req.checkBody('rootOrganisations').exists().withMessage("required root organisations id");
            req.checkBody('externalId').exists().withMessage("required program externalId");
            req.checkBody('name').exists().withMessage("required program name");
        },
        update : function () {
            req.checkParams("_id").exists().withMessage("required program id");
        }
    }

    if (programsValidator[req.params.method]) {
        programsValidator[req.params.method]();
    }

};