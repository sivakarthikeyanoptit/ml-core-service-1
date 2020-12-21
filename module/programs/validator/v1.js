module.exports = (req) => {

    let programsValidator = {

        create: function () {
            req.checkBody('externalId').exists().withMessage("required external id").notEmpty().withMessage("required external id");
            
        },

        update: function () {
            req.checkParams('_id').exists().withMessage("required program id").notEmpty().withMessage("required program id");
        }

    }

    if (programsValidator[req.params.method]) {
        programsValidator[req.params.method]();
    }

};