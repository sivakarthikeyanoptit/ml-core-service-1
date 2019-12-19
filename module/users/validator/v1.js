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
        }

    }

    if (userValidator[req.params.method]) {
        userValidator[req.params.method]();
    }

};