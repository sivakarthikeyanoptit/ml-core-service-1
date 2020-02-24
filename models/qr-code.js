/**
 * name : qr-code.js
 * author : Aman Jung Karki
 * Date : 15-Nov-2019
 * Description : Schema for qr code collection.
 */

module.exports = {
    name: "qrCode",
    schema: {
        "code" : String,
        "metaInformation" : Object,
        "status" : {
            type : String,
            default : "active"
        },
        "isDeleted" : {
            type : Boolean,
            default : false
        },
        "createdBy" : String,
        "appName" : String,
        "imageUrl" : String,
        "pdfUrl" : String
    }
}