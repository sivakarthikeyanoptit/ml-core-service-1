/**
 * name : cloud-services/aws/validator/v1.js
 * author : Deepa
 * created-date : 01-Apr-2020
 * Description : Aws service input validator.
 */

module.exports = (req) => {

    let awsInputValidator = {
        
        getDownloadableUrl: function () {
            req.checkBody('filePaths').exists().withMessage("required filePaths field");
            req.checkBody('bucketName').exists().withMessage("required bucketName field");
        }
    }

    if (awsInputValidator[req.params.method]) {
        awsInputValidator[req.params.method]();
    }

};