module.exports = (req) => {

    let languagesValidator = {

        list: function () {
            req.checkParams('_id').exists().withMessage("required language id");
        }

    }

    if (languagesValidator[req.params.method]) languagesValidator[req.params.method]();

};