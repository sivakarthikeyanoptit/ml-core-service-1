/**
 * name : delete-unread-notifications.js
 * author : Aman Jung Karki
 * Date : 15-Nov-2019
 * Description : Delete all unread notifications in every 3 month.
 */

const kafkaCommunication = require(ROOT_PATH + "/generics/helpers/kafka-communications")
let slackClient = require(ROOT_PATH + "/generics/helpers/slack-communications");

let deleteUnReadNotifications = function () {
  nodeScheduler.scheduleJob(process.env.SCHEDULE_FOR_UNREAD_NOTIFICATION, () => {

    console.log("<-----  Delete UnRead Notification cron started ---- >", new Date());

    return new Promise(async (resolve, reject) => {

      try {

        console.log("Delete unread notifications for samiksha is closed")

        // let deletionOfUnReadNotificationToKafka = {
        //   "users": "all",
        //   "internal": true,
        //   "action": "deletion",
        //   "condition": {
        //     is_read: false,
        //     dateDifference: 90
        //   }
        // }

        // let pushDeleteUnReadNotificationsToKafka = await kafkaCommunication.pushDeletionNotificationsToKafka(deletionOfUnReadNotificationToKafka);

        // if (pushDeleteUnReadNotificationsToKafka.status != "success") {
        //   let errorObject = {
        //     message: `Failed to push unRead notifications to kafka`,
        //   }
        //   slackClient.kafkaErrorAlert(errorObject)
        //   return;
        // }

        console.log("<-----  Delete UnRead Notification cron stopped ---- >", new Date());
        return resolve()

      } catch (error) {
        return reject(error)
      }

    })

  });
}

module.exports = deleteUnReadNotifications;