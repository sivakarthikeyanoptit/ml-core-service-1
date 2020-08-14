module.exports = (req) => {

    let notificationsValidator = {
        registerDevice: function () {
            req.checkBody('deviceId').exists().withMessage("required deviceId"),
            req.checkHeaders('app').exists().withMessage("required app in headers").custom(value => !/\s/.test(value)).withMessage('No spaces are allowed in the app'),
            req.checkHeaders('os').exists().withMessage('required os in headers')
        }
    }

    if (notificationsValidator[req.params.method]) {
        notificationsValidator[req.params.method]();
    }
};