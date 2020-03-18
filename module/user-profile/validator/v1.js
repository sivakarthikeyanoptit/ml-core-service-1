module.exports = (req) => {

    let userProfileValidator = {

        save: function () {
            req.checkBody('data').exists().withMessage("Required meta information data");
        }

    }

    if (userProfileValidator[req.params.method]) {
        userProfileValidator[req.params.method]();
    }

};