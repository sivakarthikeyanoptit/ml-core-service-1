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
        firstName: {
          type : String,
          default : null
        },
        lastName: {
          type : String,
           default : null
        },
        emailId: {
          type: String,
           default : null
        },
        phoneNumber: {
          type : String,
          default : null
        },
        state: {
          type : String,
          default : null
        },
        district: {
          type : Array,
          default : null
        },
        block: {
          type: Array,
          default: null
        },
        zone: {
          type : Array,
          default : null
        },
        cluster: {
          type : Array,
          default : null
        },
        taluk: {
          type : Array,
          default : null
        },
        hub: {
          type : Array,
          default : null
        },
        school: {
          type : Array,
          default : null
        }
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