module.exports = (req) => {
    let filesValidator = {
        getFilePublicBaseUrl : function () {
            req.checkQuery('projectId').exists().withMessage("required project id");
        }
    }

    if (filesValidator[req.params.method]) {
        filesValidator[req.params.method]()
    }
}