/**
 * name : users.js
 * author : Aman Jung Karki
 * Date : 19-Dec-2019
 * Description : Schema for user collection.
 */

module.exports = {
  name: "users",
  schema: {
    userName : {
      type : String,
      required : true
    },
    email :{
      type : String,
      required : true
    },
    role : {
      type : String,
      required : true
    },
    createdBy: {
      type: String,
      default: "SYSTEM"
    }
  }
}