/**
 * name : app-version.js
 * author : Aman Jung Karki
 * Date : 04-03-2020
 * Description : Schema for app version collection.
 */

module.exports = {
    name: "appVersion",
    schema: {
      appName : String,
      status : String,
      os : String,
      version : String,
      releaseNotes : String,
      title : String,
      text : String,
      text : String,
      releaseType : String,
      createdBy: String
    }
  };