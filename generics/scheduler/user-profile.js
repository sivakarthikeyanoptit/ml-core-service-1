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
        console.log("<-----  profile Pending Verification Notification cron started ---- >", new Date());

        return new Promise(async (resolve, reject) => {

            try {
                let userProfileLists = await userProfileHelper.pendingProfileUsers();
                let userProfileData = {
                    "is_read": false,
                    "action": "Update",
                    // "appName": process.env.ELASTICSEARCH_UNNATI_INDEX,
                    "created_at": new Date(),
                    "text": "text",
                    "type": process.env.ELASTICSEARCH_USER_NOTIFICATIONS_TYPE,
                    "internal": false,
                    "payload": {
                        "type":process.env.ELASTICSEARCH_USER_NOTIFICATIONS_TYPE
                    },
                    "appType": process.env.ELASTICSEARCH_ALL_INDEX
                };

                let response = [];
                if (userProfileLists && userProfileLists.length > 0) {

                    for (let pointerToUserProfileList = 0;
                        pointerToUserProfileList < userProfileLists.length;
                        pointerToUserProfileList++
                    ) {

                        let responseData = {
                            success: false
                        };

                        let userProfileList =
                            userProfileLists[pointerToUserProfileList];


                        let userObj = { ...userProfileData };
                        userObj["user_id"] = userProfileList.userId;
                        userObj["verified"] = userProfileList.verified;
                        userObj["title"] =
                            "Please update your details.Help us make your experience better.";

                        let pushPendingNotificationToKafka = await kafkaCommunication.pushNotificationsDataToKafka(userObj);

                        console.log("pushPendingNotificationToKafka",pushPendingNotificationToKafka);
                        if (pushPendingNotificationToKafka.status && pushPendingNotificationToKafka.status != "success") {
                            throw new Error(`Failed to push user profile notification for user ${userProfileList.userId}`);
                        }

                        responseData.success = true;
                        responseData["message"] = `successfully pushed user profile information to kafka for user ${userProfileList.userId}`;

                        response.push(responseData);
                    }
                }

                return resolve(response);

            } catch (error) {
                return reject(error);
            }

        })

    });
}




module.exports = {
    profilePendingVerificationNotification
}
