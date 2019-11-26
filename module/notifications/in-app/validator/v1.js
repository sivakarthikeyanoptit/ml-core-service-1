module.exports = (req) => {

    let notificationsValidator = {

        markItRead: function () {
            req.checkParams('_id').exists().withMessage("required notification id")
        },

        registerDevice: function () {
            req.checkBody('deviceId').exists().withMessage("required deviceId"),
            req.checkHeaders('app').exists().withMessage("required app in headers"),
            req.checkHeaders('os').exists().withMessage('required os in headers')
        }

    }

    if (notificationsValidator[req.params.method]) notificationsValidator[req.params.method]();

};