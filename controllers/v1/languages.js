const fs = require("fs");
let listOfLanguages = require(ROOT_PATH + "/generics/languages");
let languagesHelpers = require(ROOT_PATH + "/module/languages/helper.js")
const FileStream = require(ROOT_PATH + "/generics/file-stream");
const elasticSearchHelper = require(ROOT_PATH + "/generics/helpers/elastic-search");
module.exports = class Languages {

    /**
     * @apiDefine errorBody
     * @apiError {String} status 4XX,5XX
     * @apiError {String} message Error
     */

    /**
     * @apiDefine successBody
     *  @apiSuccess {String} status 200
     * @apiSuccess {String} result Data
     */


    static get name() {
        return "languagePack";
    }

    /**
    * @api {post} /kendra/api/v1/languages/translate?language=:language Translate Language
    * @apiVersion 1.0.0
    * @apiName language Translate Language
    * @apiGroup Language
    * @apiHeader {String} X-authenticated-user-token Authenticity token
    * @apiSampleRequest /kendra/api/v1/languages/translate?language=en
    * @apiUse successBody
    * @apiUse errorBody
    * @apiParamExample {json} Response:
    *  {
        "message": "Language Set Successfully.",
        "status": 200,
        "result": {
            "language": "hindi"
        }
    }
    */

    translate(req) {

        return new Promise(async (resolve, reject) => {

            try {

                let translationLanguage = req.query.language ? req.query.language : "english";

                if (!listOfLanguages[translationLanguage]) {
                    throw { message: "Language is not found" }
                }

                const checkIfFileExists = fs.existsSync(ROOT_PATH + "/locales/" + listOfLanguages[translationLanguage] + ".json")

                if (!checkIfFileExists) {
                    throw { message: "Json is not found" }
                }

                return resolve({
                    message: "Language Set Successfully.",
                    result: { language: translationLanguage }
                });

            } catch (error) {

                return reject({
                    status: error.status || 500,
                    message: error.message || "Oops! something went wrong.",
                    errorObject: error
                })

            }


        })
    }

    /**
* @api {post} /kendra/api/v1/languages/upload Insert Language
* @apiVersion 1.0.0
* @apiName language Insert Language
* @apiGroup Language
* @apiHeader {String} X-authenticated-user-token Authenticity token
* @apiSampleRequest /kendra/api/v1/languages/upload
* @apiParam {File} language Mandatory language file of type CSV.
* @apiUse successBody
* @apiUse errorBody
*/

    upload(req) {

        return new Promise(async (resolve, reject) => {

            try {

                if (!req.files || !req.files.language) throw { status: httpStatusCode["bad_request"].status, message: httpStatusCode["bad_request"].message };

                let languageHelper = await languagesHelpers.upload(req.files);

                return resolve({
                    message: "Language uploaded successfully",
                    result: languageHelper
                })

            } catch (error) {

                return reject({
                    status: error.status || httpStatusCode["internal_server_error"].status,
                    message: error.message || httpStatusCode["internal_server_error"].message
                })

            }


        })
    }

    /**
 * @api {get} /kendra/api/v1/languages/list Notifications List
 * @apiVersion 1.0.0
 * @apiName languages List
 * @apiGroup Language
 * @apiSampleRequest /kendra/api/v1/languages/list
 * @apiHeader {String} X-authenticated-user-token Authenticity token  
 * @apiUse successBody
 * @apiUse errorBody
 */

    list(req) {
        return new Promise(async (resolve, reject) => {

            try {

                let languageLists = await languagesHelpers.list(req.params._id)

                return resolve({
                    result: languageLists.data,
                    message: languageLists.message
                })

            } catch (error) {
                return reject({
                    status: error.status || httpStatusCode["internal_server_error"].status,
                    message: error.message || httpStatusCode["internal_server_error"].message
                })
            }
        })
    }

    /**
 * @api {get} /kendra/api/v1/languages/listAll Notifications List
 * @apiVersion 1.0.0
 * @apiName languages List
 * @apiGroup Language
 * @apiSampleRequest /kendra/api/v1/languages/listAll
 * @apiHeader {String} X-authenticated-user-token Authenticity token  
 * @apiUse successBody
 * @apiUse errorBody
 */

    listAll(req) {
        return new Promise(async (resolve, reject) => {

            try {

                let languageLists = await languagesHelpers.listAll()

                return resolve({
                    result: languageLists.data,
                    message: languageLists.message
                })

            } catch (error) {
                return reject({
                    status: error.status || httpStatusCode["internal_server_error"].status,
                    message: error.message || httpStatusCode["internal_server_error"].message
                })
            }
        })
    }

    /**
* @api {get} /kendra/api/v1/languages/translateIntoCsv Api to translate json into csv
* @apiVersion 1.0.0
* @apiName translate language in csv
* @apiGroup Language
* @apiSampleRequest /kendra/api/v1/languages/translateIntoCsv
* @apiHeader {String} X-authenticated-user-token Authenticity token  
* @apiUse successBody
* @apiUse errorBody
*/

    translateIntoCsv(req) {
        return new Promise(async (resolve, reject) => {

            try {

                const fileName = `translate-language-to-csv`;
                let fileStream = new FileStream(fileName);
                let input = fileStream.initStream();

                (async function () {
                    await fileStream.getProcessorPromise();
                    return resolve({
                        isResponseAStream: true,
                        fileNameWithPath: fileStream.fileNameWithPath()
                    });
                })();

                let jsonKey = Object.keys(req.body)

                for (let pointer = 0; pointer < jsonKey.length; pointer++) {

                    let eachJsonKey = Object.keys(req.body[jsonKey[pointer]])

                    for (let pointerToEachJson = 0; pointerToEachJson < eachJsonKey.length; pointerToEachJson++) {
                        let language = {};

                        language["key"] = jsonKey[pointer] + "_" + eachJsonKey[pointerToEachJson]
                        language["en"] = req.body[jsonKey[pointer]][eachJsonKey[pointerToEachJson]]
                        input.push(language)
                    }

                }

                input.push(null)


            }
            catch (error) {
                return reject(error)
            }
        })
    }

    pushToElasticSearch(req) {
        return new Promise(async (resolve, reject) => {

            try {
                await elasticSearchHelper.pushLanguageData("ka",
                    {
                        ionLabel:
                        {
                            date: 'Date',
                            generalQuestions: 'General Questions',
                            selectObservationType: 'Select a observation Type',
                            selectSolution: 'Select a Solution',
                            selectSchool: 'Select Schools'
                        },
                        actionSheet:
                        {
                            confirmLeave: 'Are you sure to leave.',
                            saveCurrentDataConfirmation:
                                'Old details will be lost ? Are you sure to overwrite the details',
                            edit: 'Edit',
                            delete: 'Delete',
                            confirm: 'Confirm',
                            completeobservation: 'Are you sure to mark this observation as complete?',
                            deleteEntity: 'Are you sure to remove the entity form observation?',
                            deleteSubmission: 'Are you sure to remove the submission ?',
                            surveyAction: 'Survey Actions',
                            restrictAction: "Further you won't be able to do any kind of action.",
                            view: 'View',
                            pleaseEnterPasscode: 'Please enter the passcode.',
                            submit: 'Submit',
                            passcode: 'Passcode',
                            login: 'Login',
                            ecmNotApplicableMessage: 'Do you want mark ECM as not applicable / not allowed?',
                            dataLooseConfirm: 'All your datas will be lost. Do you want to continue?',
                            previousUserName: 'Please enter previous username.',
                            sessionExpired: 'Session has expired. Please login again to continue',
                            slowInternet:
                                'You are connected to a slower data network. Image upload may take longer time. Do you want to continue?',
                            name: 'Name',
                            feedback: 'Feedback',
                            send: 'Send',
                            start: 'Start',
                            warning: 'WARNING!',
                            schoolSurveyEarse:
                                'All schools survey data will be erased. This action is irreversable.Do you want to continue?',
                            appTermination: 'App termination',
                            appTerminationMessage: 'Do you want to close the app?',
                            closeApp: 'Close App',
                            ecmNotApplicable: 'ECM Not Applicable',
                            ecmNotAllowed: 'ECM Not Allowed',
                            confirmDelete: 'Confirm Delete',
                            addImage: 'Add Images',
                            camera: 'Camera',
                            upload: 'Upload',
                            cancel: 'Cancel',
                            confirmDeleteImage: 'Do you want to delete this image?',
                            confirmDeleteInstance: 'Do you want to delete this instance?',
                            entityDelete: 'Are you sure you want to delete the entity?',
                            yes: 'Yes',
                            ok: 'Ok',
                            no: 'No',
                            uploadImage: 'Upload Image',
                            uploadFile: 'Upload File',
                            publish: 'Publish',
                            chooseAction: 'Choose a action',
                            deleteObservation: 'Are you sure you want to delete the observation?',
                            networkSlowAlert:
                                'You are connected to a slower data network. Image upload may take longer time. Do you want to continue?'
                        },
                        buttons:
                        {
                            observeAgain: 'Observe Again',
                            view: 'View',
                            and: 'and',
                            addNew: 'Add New',
                            viewReport: 'View Report',
                            draft: 'Draft',
                            publish: 'Publish',
                            goToEntities: 'Go TO Entitites',
                            active: 'Active',
                            completed: 'Completed',
                            profile: 'Profile',
                            ratings: 'Rate',
                            start: 'Start',
                            survey: 'survey',
                            delete: 'Delete',
                            done: 'Done',
                            previous: 'Previous',
                            today: 'Today',
                            about: 'About',
                            save: 'Save',
                            addSchools: 'Add Schools',
                            next: 'Next',
                            back: 'Back',
                            upload: 'Upload',
                            skip: 'Skip',
                            submit: 'Submit',
                            cancel: 'Cancel',
                            addEntity: 'Add Entity',
                            send: 'Send',
                            yes: 'Yes',
                            no: 'No',
                            login: 'Login',
                            flag: 'Flag',
                            parentInfo: 'Parent Info',
                            add: 'Add',
                            parent: 'Parent',
                            registry: 'Aman',
                            capture: 'Capture',
                            refresh: 'Refresh',
                            feedback: 'Feedback',
                            update: 'Update',
                            Leader: 'School Leader',
                            Teacher: 'Teacher',
                            saveDraft: 'Draft',
                            markAsComplete: 'Mark as completed',
                            preview: 'Preview',
                            viewReports: 'View Reports',
                            viewObservationReport: 'View Observation report',
                            viewEntityReport: 'View Entity Report',
                            edit: 'Edit',
                            observation: 'Observation',
                            loadMore: 'Load More'
                        },
                        tabs:
                        {
                            home: 'Home',
                            view: 'All',
                            mySchool: 'My Schools',
                            faqs: 'FAQs',
                            about: 'About',
                            questions: 'Questions',
                            rate: 'Rate',
                            individual: 'Individual',
                            institutional: 'Institutions',
                            observations: 'Observations',
                            myObservation: 'My Observation',
                            draftObservation: 'Draft Observation',
                            addObservation: 'Add Observation',
                            userRolePage: 'Roles',
                            dashboard: 'Dashboard'
                        },
                        headings:
                        {
                            zone: 'Zones',
                            state: 'State',
                            lastModified: 'Last Modefied at',
                            district: 'District',
                            entities: 'Entities',
                            userRolePage: 'Roles',
                            dashboard: 'Dashboard',
                            cluster: 'Cluster',
                            myActiveAssessment: 'My active asssessments',
                            submissionListPage: 'Submission List',
                            addObservation: 'Add Observation',
                            solutionDetails: 'Solution Details',
                            home: 'Home',
                            observations: 'Observations',
                            myInstitutions: 'My Institutions',
                            mySchool: 'My Schools',
                            faqs: 'FAQs',
                            programList: 'Program List',
                            about: 'About',
                            school: 'School',
                            profile: 'Profile',
                            survey: 'Survey',
                            addSchools: 'Add Schools',
                            surveySections: 'Survey - Sections',
                            evidenceMethods: 'Evidence Methods',
                            sections: 'Sections',
                            questionnaire: 'Questionnaire',
                            feedback: 'Feedback',
                            logout: 'Logout',
                            startDate: 'Start Date',
                            endDate: 'End Date',
                            description: 'Description',
                            criteria: 'Criteria',
                            rate: 'Rate',
                            uplaod: 'Upload',
                            images: 'Images',
                            ratedCriterias: 'Rated Criterias',
                            flagCriteria: 'Flag Criteria',
                            questionMap: 'Question Map',
                            remarks: 'Remarks',
                            editSchoolProfile: 'Edit School Profile',
                            schoolProfile: 'School Profile',
                            surveyEcm: 'Survey - ECM',
                            parentContact: 'Parent Contacts',
                            parentRegistry: 'Parent Registry',
                            schoolLeaderRegistry: 'School Leader Registry',
                            teacherRegistry: 'Teacher Registry',
                            generalQuestions: 'General Questions',
                            individualAssessments: 'Individual Assessments',
                            observationDetails: 'Observation Details',
                            hint: 'Hint',
                            submissionPreview: 'Submission Preview',
                            observationReports: 'Report',
                            observationUpdate: 'Observation Update',
                            notifications: 'Notifications'
                        },
                        labels:
                        {
                            welcome: 'Welcome',
                            assessments: 'Assessments',
                            goTo: 'Goto',
                            name: 'Name',
                            feedback: 'Feedback',
                            choose: 'Choose',
                            language: 'Language',
                            remarks: 'Remarks',
                            image: 'Image',
                            completed: 'Completed',
                            inprogress: 'In Progress',
                            submitted: 'Submitted',
                            notApplicable: 'NA',
                            readytoPublish: 'Ready to Publish',
                            files: 'Files'
                        },
                        languages:
                        {
                            english: 'English',
                            hindi: 'हिंदी',
                            telugu: 'తెలుగు',
                            malayalam: 'മലയാളം',
                            tamil: 'தமிழ்',
                            kannada: 'ಕನ್ನಡ',
                            gujarati: 'ગુજરાતી'
                        },
                        message:
                        {
                            noReportsFound: 'No reports found',
                            noSubmission: 'No Submissions',
                            startSearchSchool: 'search school',
                            noSchoolFound: 'No Schools Found',
                            searchEntities: 'Search for entities',
                            startSearchSolution: 'Search for solutions',
                            dontCloseApp: "Please don't close the app or go back.",
                            of: 'of',
                            noProgram: 'No Program',
                            program: 'Program',
                            images: 'Images',
                            startSearchEntity: 'Start typing entity name',
                            uploading: 'Uploading',
                            completeObservation:
                                'Are you sure you want to mark this observation as complete?',
                            restrictAction: "Further you won't be able to do any kind of action.",
                            noQuestionAvailable: 'No questions available',
                            noDraft: 'No Drafts',
                            noEntity: 'No Entity',
                            no: 'No',
                            noSolutionFound: 'No Solutions',
                            noProgramsFound: 'No Programs found.',
                            deleteObservation: 'Are you sure you want to delete the observation?',
                            confirmDeleteObservation:
                                'You will not see this observation anymore. Do you wish to delete?',
                            viewAll: 'View all',
                            noUnreadNotifications: 'You have no new Notifications!'
                        },
                        toastMessage:
                        {
                            selectSolution: 'Select a Solution',
                            selectObservationType: 'Select a observation Type',
                            networkDisconnected: 'NetWork Disconnected',
                            networkConnected: 'Network Connected',
                            ok: 'OK',
                            allValueAreMandatory: 'Fill Mandatory Field',
                            enableInternet: 'Please enable your internet connection to continue.',
                            connectToInternet: 'Please connect to internet',
                            networkConnectionForAction: 'You need network connection for this action.',
                            noPermissionToPage: 'You dont have permission to view this page.',
                            someThingWentWrong: 'Something went Wrong.',
                            someThingWentWrongTryLater: 'Something went Wrong , Please Try after sometime.',
                            enableToGetGoogleUrls: 'Unable to get google urls',
                            submissionCompleted: 'Submission completed successfully',
                            errorGettingLoaction: 'Error in getting location',
                            fillAllFields: 'Please fill all the fields',
                            loginAgain: 'Please login again.',
                            userNameMisMatch: 'Username didnot match. Please login again.',
                            loactionForAction: 'Location should be turned on for this action.',
                            questionResponseNotRequiredForCompleteAssessment:
                                'This questions response is not required to complete the assessment.'
                        }
                    }

                )

                return resolve()
            }
            catch (error) {
                return reject(error)
            }
        })
    }

};