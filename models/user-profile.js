/**
 * name : user-profile.js
 * author : Aman Jung Karki
 * Date : 15-Nov-2019
 * Description : Schema for user Profile collection.
 */

module.exports = {
    name: "userProfile",
    schema: {
      metaInformation:{
      },
      createdBy: {
        type : String,
        default : null
      },
      updatedBy: {
        type : String,
        default : null
      },
      userId : {
        type : String,
        required : true
      },
      externalId: {
        type: String,
        required: true
      },
      status: {
        type : String,
        default : "active"
      },
      isDeleted: {
        type : Boolean,
        default : false
      },
     
      externalId: {
        type : String,
        default : null
      },
     
      verified: {
        type : Boolean,
        default : false
      },
      verifiedAt:{
        type: Date,
        default: null
      },
      submittedAt:{
        type: Date,
        default: Date.now
      },
      sentPushNotifications : {
        type : Boolean,
        default : false
      }
    }
}