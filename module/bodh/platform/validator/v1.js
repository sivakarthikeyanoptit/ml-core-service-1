/**
 * name : bodh/platform/validator/v1.js
 * author : Aman Jung Karki
 * created-date : 27-Feb-2020
 * Description : All bodh platform validation.
 */

module.exports = (req) => {

    let platformValidator = {
        
        generate: function () {
            req.checkBody('contentData').exists().withMessage("required content data");
        },

        createContent : function () {
            req.checkBody('code').exists().withMessage("Required metadata code");
            req.checkBody('contentType').exists().withMessage("Required content type");
            req.checkBody('name').exists().withMessage("Required name");
            req.checkBody('name').exists().withMessage("Required name");
            req.checkBody('mimeType').exists().withMessage("Required mime type");
            req.checkBody('createdBy').exists().withMessage("Required mime type");
        },

        uploadContent : function () {
            req.checkParams('_id').exists().withMessage("required content id")
        }
    }

    if (platformValidator[req.params.method]) {
        platformValidator[req.params.method]();
    }

};