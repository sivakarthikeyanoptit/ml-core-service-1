module.exports = (req) => {

    let observationValidator = {

        update: function () {
            req.checkParams('_id').exists().withMessage("required observation id");
        }
        
    }

    if (observationValidator[req.params.method]) {
        observationValidator[req.params.method]();
    }

};