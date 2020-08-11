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
        },
        getSignedUrls : function() {
            req.checkBody('fileNames').exists().withMessage("required file names");
            req.checkBody('bucket').exists().withMessage("required bucket name");
        }
    }

    if (awsInputValidator[req.params.method]) {
        awsInputValidator[req.params.method]();
    }

};