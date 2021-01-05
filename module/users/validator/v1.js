module.exports = (req) => {

    let userValidator = {
        create : function () {
            req.checkBody('email').exists().withMessage("required email id");
            req.checkBody('userName').exists()
            .withMessage("required name of the user");

            req.checkBody('role').exists()
            .withMessage("required role of the user");
        },
        isSystemAdmin: function () {
            req.checkBody('email').exists().withMessage("required email id");
        },
        entitiesMappingForm : function () {
            req.checkParams('_id').exists().withMessage("required Entity id");
            req.checkQuery('roleId').exists().withMessage("required role id");
        },
        solutions : function () {
            req.checkParams('_id').exists().withMessage("required Program id");
            req.checkBody('role').exists().withMessage("required roles");
        },
        programs : function () {
            req.checkBody('role').exists().withMessage("required roles");
        }
        

    }

    if (userValidator[req.params.method]) {
        userValidator[req.params.method]();
    }

};