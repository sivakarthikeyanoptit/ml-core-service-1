/**
 * name : delete-read-notifications.js
 * author : Aman Jung Karki
 * Date : 15-Nov-2019
 * Description : Delete all read notifications every month for samiksha.
 */

// dependencies

const kafkaCommunication = require(ROOT_PATH + "/generics/helpers/kafka-communications");
const slackClient = require(ROOT_PATH + "/generics/helpers/slack-communications");
const UNNATI_INDEX =
    gen.utils.checkIfEnvDataExistsOrNot("ELASTICSEARCH_UNNATI_INDEX");
const userProfileHelper = require(MODULES_BASE_PATH + "/user-profile/helper.js");

/**
  * send notification .
  * @function
  * @name profilePendingVerificationNotification
  * @returns {Promise} return a Promise.
*/

let profilePendingVerificationNotification = function () {
    nodeScheduler.scheduleJob(process.env.SCHEDULE_FOR_PROFILE_PENDING_UPDATE_NOTIFICATION, () => {

        logger.info("<-----  profile Pending Verification Notification cron started ---- >", new Date());
    
        return new Promise(async (resolve, reject) => {

            try {
                
                let userProfiles = 
                await userProfileHelper.userProfileNotVerified();

                let result = [];
                if ( userProfiles && userProfiles.length > 0 ) {

                    let userProfileData = {
                        "is_read" : false,
                        "action" : "Update",
                        "created_at" : new Date(),
                        "text" : "text",
                        "type" : process.env.ELASTICSEARCH_USER_NOTIFICATIONS_TYPE,
                        "internal" : false,
                        "payload" : {
                            "type" : 
                            process.env.ELASTICSEARCH_USER_NOTIFICATIONS_TYPE
                        },
                        "appType" : 
                        [
                            process.env.ASSESSMENT_APPLICATION_APP_TYPE,
                            process.env.IMPROVEMENT_PROJECT_APPLICATION_APP_TYPE
                        ]
                    };

                    for (let userProfile = 0;
                        userProfile < userProfiles.length;
                        userProfile++
                    ) {

                        let response = {
                            success: false
                        };

                        let currentUser = userProfiles[userProfile]

                        let cloneUserProfileData = { ...userProfileData };

                        cloneUserProfileData["user_id"] = currentUser.userId;
                        cloneUserProfileData["verified"] = currentUser.verified;
                        cloneUserProfileData["title"] = 
                        constants.common.PROFILE_UPDATE_NOTIFICATION_MESSAGE;
                            
                        let pushUserNotificationToKafka = 
                        await kafkaCommunication.pushNotificationsDataToKafka(
                            cloneUserProfileData
                        );
                       
                        if (pushUserNotificationToKafka.status && pushUserNotificationToKafka.status != "success") {
                            throw new Error(`Failed to push user profile notification for user ${currentUser.userId}`);
                        }

                        response.success = true;
                        response["message"] = `successfully pushed user profile information to kafka for user ${currentUser.userId}`;
                        result.push(response);
                    }
                }
                return resolve(result);

            } catch (error) {
                return reject(error);
            }

        })

    });
}




module.exports = profilePendingVerificationNotification;
