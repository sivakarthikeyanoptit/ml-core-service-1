/**
 * name : cloud-services/gcp/validator/v1.js
 * author : Deepa
 * created-date : 01-Apr-2020
 * Description : Gcp input validator.
 */

module.exports = (req) => {

    let gcpInputValidator = {
        
        getDownloadableUrl: function () {
            req.checkBody('filePaths').exists().withMessage("required filePaths field");
            req.checkBody('bucketName').exists().withMessage("required bucketName field");
        },
        getSignedUrls : function() {
            req.checkBody('fileNames').exists().withMessage("required file names");
            req.checkBody('bucket').exists().withMessage("required bucket name");
        }
    }

    if (gcpInputValidator[req.params.method]) {
        gcpInputValidator[req.params.method]();
    }

};