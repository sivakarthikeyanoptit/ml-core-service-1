module.exports = (req) => {

    let userProfileValidator = {

        verify: function () {
            req.checkParams('_id').exists().withMessage("required user id");
        }

    }

    if (userProfileValidator[req.params.method]) {
        userProfileValidator[req.params.method]();
    }

};