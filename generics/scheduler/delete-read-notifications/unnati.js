const kafkaCommunication = require(ROOT_PATH + "/generics/helpers/kafka-communications");
let slackClient = require(ROOT_PATH + "/generics/helpers/slack-communications");

let deleteReadNotificationInUnnati = function () {
    nodeScheduler.scheduleJob(process.env.SCHEDULE_FOR_READ_NOTIFICATION_UNNATI, () => {

        console.log("<-----  Delete Read Notification for unnati cron started ---- >", new Date());

        return new Promise(async (resolve, reject) => {

            let pushReadNotificationForUnnati = {
                "users": "all",
                "internal": true,
                "action": "deletion",
                "condition": {
                    index: "unnati",
                    is_read: true,
                    dateDifference: 30
                }
            }

            let pushDeleteReadNotificationsToKafka = await kafkaCommunication.pushDeletionNotificationsToKafka(pushReadNotificationForUnnati)

            if (pushDeleteReadNotificationsToKafka.status != "success") {
                let errorObject = {
                    message: `Failed to push read notifications to kafka`,
                }
                slackClient.kafkaErrorAlert(errorObject)
                return;
            }

            console.log("<-----  Delete Read Notification for unnati cron stopped ---- >", new Date());
            return resolve()

        })

    });
}

module.exports = deleteReadNotificationInUnnati;