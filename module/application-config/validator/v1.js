module.exports = (req) => {

    let validator = {

        upload: function () {
            // req.checkParams('_id').exists().withMessage("required notification id")
        },
        list: function () {
            // req.checkParams('_id').exists().withMessage("required notification id")
        }

    }

    if (validator[req.params.method]) validator[req.params.method]();

};