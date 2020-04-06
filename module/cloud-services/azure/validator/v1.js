/**
 * name : cloud-services/azure/validator/v1.js
 * author : Deepa
 * created-date : 03-Apr-2020
 * Description : Azure service input validator.
 */

module.exports = (req) => {

    let azureInputValidator = {
        
        getDownloadableUrl: function () {
            req.checkBody('filePath').exists().withMessage("required filePath field");
            req.checkBody('bucketName').exists().withMessage("required bucketName field");
        }
    }

    if (azureInputValidator[req.params.method]) {
        azureInputValidator[req.params.method]();
    }

};