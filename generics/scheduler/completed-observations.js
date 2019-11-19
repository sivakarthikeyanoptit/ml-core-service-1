/**
 * name : completed-observations.js
 * author : Aman Jung Karki
 * Date : 15-Nov-2019
 * Description : All Completed Observations notifications of samiksha should be showned once in a month.
 */

let samikshaService = require(ROOT_PATH + "/generics/helpers/samiksha");
let notificationHelpers = require(ROOT_PATH + "/module/notifications/helper");

let completedObservation = function () {
  nodeScheduler.scheduleJob(process.env.SCHEDULE_FOR_COMPLETED_OBSERVATION, () => {

    console.log("<---- Completed Observations cron started ---->", new Date());

    return new Promise(async (resolve, reject) => {
      let completedObservations = await samikshaService.completedObservations()

      if (completedObservations.result.length > 0) {

        await notificationHelpers.completedAssessmentsOrObservations(completedObservations.result, true)

      }

      console.log("<---- Completed Observations cron stopped --->", new Date());
      resolve()

    })

  });
}

module.exports = completedObservation;