/**
 * name : pending-assessments.js
 * author : Aman Jung Karki
 * Date : 14-Nov-2019
 * Description : Pending Assessments notification should be showned in the app in every 15 days.
 */

let samikshaService = require(ROOT_PATH + "/generics/helpers/samiksha");
let notificationHelpers = require(ROOT_PATH + "/module/notifications/in-app/helper");


let pendingAssessments = function () {

    nodeScheduler.scheduleJob(process.env.SCHEDULE_FOR_PENDING_ASSESSMENT, () => {

        console.log("<---- Pending Assessment cron started  ---->", new Date());

        return new Promise(async (resolve, reject) => {
            let pendingAssessments = await samikshaService.pendingAssessments()

            if (pendingAssessments.result.length > 0) {

                await notificationHelpers.pendingAssessmentsOrObservations(pendingAssessments.result)
            }

            console.log("<---  Pending Assessment cron ended  ---->", new Date());
            resolve()

        })

    });
}

module.exports = pendingAssessments;