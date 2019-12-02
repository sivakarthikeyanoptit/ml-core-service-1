/**
 * name : pending-observations.js
 * author : Aman Jung Karki
 * Date : 15-Nov-2019
 * Description : Pending Observations notification of samiksha should be showned in the app in every 15 days.
 */

let samikshaService = require(ROOT_PATH + "/generics/helpers/samiksha");
let notificationHelpers = require(ROOT_PATH + "/module/notifications/in-app/helper");

let pendingObservations = function () {
  nodeScheduler.scheduleJob(process.env.SCHEDULE_FOR_PENDING_OBSERVATION, () => {

    console.log("<----- Pending Observations cron started ---->", new Date());

    return new Promise(async (resolve, reject) => {
      let pendingObservations = await samikshaService.pendingObservations()

      if (pendingObservations.result.length > 0) {
        await notificationHelpers.pendingAssessmentsOrObservations(pendingObservations.result, true)
      }

      console.log("<----- Pending Observations cron stopped --->", new Date());
      resolve()

    })

  });
}

module.exports = pendingObservations;