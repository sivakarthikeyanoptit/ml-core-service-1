/**
 * name : qr-code.js
 * author : Aman Jung Karki
 * Date : 15-Nov-2019
 * Description : Schema for qr code collection.
 */

module.exports = {
    name: "qrCodes",
    schema: {
        "code" : {
            type : String,
            required : true,
            index : true,
            unique : true
        },
        "metaInformation" : Object,
        "status" : {
            type : String,
            default : "active",
            index : true
        },
        "isDeleted" : {
            type : Boolean,
            default : false
        },
        "createdBy" : {
            type : String,
            required : true
        },
        "appName" : {
            type : String,
            required : true
        },
        "image" : String,
        "pdf" : String
    }
}