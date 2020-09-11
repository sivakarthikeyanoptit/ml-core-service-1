module.exports = (req) => {

    let appsValidator = {

        getDetails: function () {
            req.checkParams('_id').exists().withMessage("required app name").notEmpty().withMessage("required app name");
        },

        create: function () {
            req.checkBody('name').exists().withMessage("required name field").notEmpty().withMessage("required name field");
            req.checkBody('displayName').exists().withMessage("required displayName field").notEmpty().withMessage("required name field");
            req.checkBody('description').exists().withMessage("required description field").notEmpty().withMessage("required name field");
            req.checkBody('playstoreLink').exists().withMessage("required playStoreLink field").notEmpty().withMessage("required name field");
        },

        update: function () {
            req.checkParams('_id').exists().withMessage("required app name").notEmpty().withMessage("required app name");
        }

    }

    if (appsValidator[req.params.method]) {
        appsValidator[req.params.method]();
    }

};