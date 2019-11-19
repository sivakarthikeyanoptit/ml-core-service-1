
/**
 * name : delete-unread-notifications/unnati.js
 * author : Rakesh
 * Date :
 * Description : Delete all unread notifications every 3 month in unnati.
 */

const kafkaCommunication = require(ROOT_PATH + "/generics/helpers/kafka-communications")
let slackClient = require(ROOT_PATH + "/generics/helpers/slack-communications");


let deleteUnReadNotificationsForUnnati = function () {
    nodeScheduler.scheduleJob(process.env.SCHEDULE_FOR_UNREAD_NOTIFICATION_UNNATI, () => {

        console.log("<-----  Delete UnRead Notification for Unnati cron started ---- >", new Date());

        return new Promise(async (resolve, reject) => {

            console.log("Delete Unread notifications for unnati is closed");

            // let deletionOfUnReadNotificationToKafka = {
            //     "users": "all",
            //     "internal": true,
            //     "action": "deletion",
            //     "condition": {
            //         index: "unnati",
            //         is_read: false,
            //         dateDifference: 90
            //     }
            // }

            // let pushDeleteUnReadNotificationsToKafka = await kafkaCommunication.pushDeletionNotificationsToKafka(deletionOfUnReadNotificationToKafka);

            // if (pushDeleteUnReadNotificationsToKafka.status != "success") {
            //     let errorObject = {
            //         message: `Failed to push unRead notifications to kafka`,
            //     }
            //     slackClient.kafkaErrorAlert(errorObject)
            //     return;
            // }

            // console.log("<-----  Delete UnRead Notification for Unnati cron stopped ---- >", new Date());
            // return resolve()

        })

    });
}

module.exports = deleteUnReadNotificationsForUnnati;