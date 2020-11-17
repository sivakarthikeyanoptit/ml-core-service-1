/**
 * name : v1.js
 * author : Priyanka
 * created-date : 17-Nov-2020
 * Description : Activity logs validation.
 */

module.exports = (req) => {

    let validator = {

        create : function () {
            req.checkQuery('userId').exists().withMessage("required userId");
            req.checkQuery('docId').exists().withMessage("required docId");
            req.checkQuery('type').exists().withMessage("required type");
        }

    }

    if (validator[req.params.method]) {
        validator[req.params.method]();
    }

};