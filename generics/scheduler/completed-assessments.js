/**
 * name : pending-observations.js
 * author : Aman Jung Karki
 * Date : 15-Nov-2019
 * Description : All Completed Assessments notifications of samiksha should be showned once in a month.
 */

let samikshaService = require(ROOT_PATH + "/generics/helpers/samiksha");
let notificationHelpers = require(ROOT_PATH + "/module/notifications/helper");

let completedAssessment = function () {
  nodeScheduler.scheduleJob(process.env.SCHEDULE_FOR_COMPLETED_ASSESSMENT, () => {

    console.log("<---- Completed Assessment cron started ---->", new Date());

    return new Promise(async (resolve, reject) => {
      let completedAssessments = await samikshaService.completedAssessments()

      if (completedAssessments.result.length > 0) {

        await notificationHelpers.completedAssessmentsOrObservations(completedAssessments.result)

      }

      console.log("<--- Completed Assessment cron stopped ---->", new Date());
      resolve()

    })

  });
}

module.exports = completedAssessment;