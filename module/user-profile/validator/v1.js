module.exports = (req) => {

    let userProfileValidator = {

        save: function () {
            req.checkBody('metaInformation').exists().withMessage("Required meta information");
        }

    }

    if (userProfileValidator[req.params.method]) {
        userProfileValidator[req.params.method]();
    }

};