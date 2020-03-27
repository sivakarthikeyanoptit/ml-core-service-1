/**
 * name : v1.js
 * author : Aman
 * created-date : 26-03-2020
 * Description : App release validation.
 */

module.exports = (req) => {

    let appReleaseValidator = {

        create : function () {
            req.checkBody('appName').exists().withMessage("Name of the app is required");
            req.checkBody('version').exists().withMessage("Version for the app is required");
            req.checkBody('releaseType').exists().withMessage("App release type is required").isIn(
                ["major","minor"]
            ).withMessage("Release type should be either major or minor");
            req.checkBody('os').exists().withMessage("App os is required").isIn(
                [
                    "android",
                    "ios"
                ]
            ).withMessage("os should be android or ios");

            req.checkBody('text').exists().withMessage("text is required");
            req.checkBody('title').exists().withMessage("App release title is required");
            req.checkBody('status').exists().withMessage("Status of app release is required");
            req.checkBody('releaseNotes').exists().withMessage("Release notes is required");
            req.checkBody('appType').exists().withMessage("App type is required").isIn(
                [
                    process.env.ASSESSMENT_APPLICATION_APP_TYPE,
                    process.env.IMPROVEMENT_PROJECT_APPLICATION_APP_TYPE
                ]
            ).withMessage(`App Type should be one of the following : ${process.env.ASSESSMENT_APPLICATION_APP_TYPE} or ${process.env.IMPROVEMENT_PROJECT_APPLICATION_APP_TYPE}`);
        },
        update : function () {
            req.checkParams('_id').exists().withMessage("required version id");
        }

    }

    if ( appReleaseValidator[req.params.method] ) {
        appReleaseValidator[req.params.method]();
    }

};