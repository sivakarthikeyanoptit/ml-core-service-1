/**
 * name : cloud-services/azure/validator/v1.js
 * author : Deepa
 * created-date : 03-Apr-2020
 * Description : Azure service input validator.
 */

module.exports = (req) => {

    let azureInputValidator = {
        upload: function () {
            req.checkBody('filePath').exists().withMessage("required filePath field");
            req.checkBody('containerName').exists().withMessage("required containerName field");
        },
        
        getDownloadableUrl: function () {
            req.checkBody('filePaths').exists().withMessage("required filePaths field");
            req.checkBody('containerName').exists().withMessage("required containerName field");
        }
    }

    if (azureInputValidator[req.params.method]) {
        azureInputValidator[req.params.method]();
    }

};