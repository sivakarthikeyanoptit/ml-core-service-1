/**
 * name : cloud-services/gcp/validator/v1.js
 * author : Deepa
 * created-date : 01-Apr-2020
 * Description : Gcp input validator.
 */

module.exports = (req) => {

    let gcpInputValidator = {
        
        getDownloadableUrl: function () {
            req.checkBody('filePath').exists().withMessage("required filePath field");
            req.checkBody('bucketName').exists().withMessage("required bucketName field");
        }
    }

    if (gcpInputValidator[req.params.method]) {
        gcpInputValidator[req.params.method]();
    }

};