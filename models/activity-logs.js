/**
 * name : activity-logs.js
 * author : Priyanka
 * Date : 17-11-2020
 * Description : Schema for activity log collection.
 */
module.exports = {
    name: "activityLogs",
    schema: {
      metaInformation : Object,
      userId: {
        type: String,
        required: true
      },
      type : {
          type : String,
          required : true
      },
      docId : {
        type: "ObjectId",
        required: true
      }

    }
  }