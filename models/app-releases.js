/**
 * name : app-releases.js
 * author : Aman Jung Karki
 * Date : 04-03-2020
 * Description : Schema for app release collection.
 */

module.exports = {
    name: "appReleases",
    schema: {
      appName : String,
      status : String,
      os : String,
      version : String,
      releaseNotes : String,
      title : String,
      text : String,
      releaseType : String,
      createdBy: String,
      updatedBy: String,
      appType : String
    }
  };