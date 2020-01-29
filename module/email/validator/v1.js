module.exports = (req) => {

    let emailValidator = {

        send: function () {
            req.checkBody('from').exists().withMessage("required sender name");
            req.checkBody('to').exists().withMessage("required receiver name");
            req.checkBody('subject').exists().withMessage("required subject for mail");
        }

    }

    if (emailValidator[req.params.method]) {
        emailValidator[req.params.method]();
    }
    
};