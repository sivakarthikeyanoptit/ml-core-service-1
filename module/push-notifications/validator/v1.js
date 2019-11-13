module.exports = (req) => {

    let pushNotificationsValidator = {

        // TODO : this is a dirty fix.Soon will be using the validator.

    }

    if (pushNotificationsValidator[req.params.method]) pushNotificationsValidator[req.params.method]();

};