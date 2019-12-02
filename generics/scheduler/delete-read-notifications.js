/**
 * name : delete-read-notifications.js
 * author : Aman Jung Karki
 * Date : 15-Nov-2019
 * Description : Delete all read notifications every month for samiksha.
 */

const kafkaCommunication = require(ROOT_PATH + "/generics/helpers/kafka-communications");
let slackClient = require(ROOT_PATH + "/generics/helpers/slack-communications");
let unnatiIndex = process.env.ELASTICSEARCH_UNNATI_INDEX ? process.env.ELASTICSEARCH_UNNATI_INDEX : "unnati"

let deleteReadNotification = function () {
  nodeScheduler.scheduleJob(process.env.SCHEDULE_FOR_READ_NOTIFICATION, () => {

    console.log("<-----  Delete Read Notification cron started ---- >", new Date());

    return new Promise(async (resolve, reject) => {

      try {

        let samikshaReadNotification = {
          "users": "all",
          "internal": true,
          "action": "deletion",
          "condition": {
            is_read: true,
            dateDifference: 30
          }
        }

        let unnatiReadNotification = JSON.parse(JSON.stringify(samikshaReadNotification));
        unnatiReadNotification.condition["index"] = unnatiIndex

        let readNotificationsArray = [samikshaReadNotification, unnatiReadNotification]

        for (let pointerToReadNotifications = 0; pointerToReadNotifications < readNotificationsArray.length; pointerToReadNotifications++) {

          let pushDeleteReadNotificationsToKafka = await kafkaCommunication.pushNotificationsDataToKafka(readNotificationsArray[pointerToReadNotifications]);

          if (pushDeleteReadNotificationsToKafka.status != "success") {
            let errorObject = {
              message: `Failed to push read notifications to kafka`,
            }
            slackClient.kafkaErrorAlert(errorObject)
            return;
          }
        }

        console.log("<-----  Delete Read Notification cron stopped ---- >", new Date());
        return resolve()

      } catch (error) {
        return reject(error)
      }

    })

  });
}

module.exports = deleteReadNotification;