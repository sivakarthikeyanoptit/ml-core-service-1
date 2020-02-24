/**
 * name : aws.js
 * author : Aman Jung Karki
 * created-date : 23-feb-2020
 * Description : All aws related functionality
 */

// Dependencies
const AWS = require('aws-sdk');
const AWS_ACCESS_KEY_ID = 
(process.env.AWS_ACCESS_KEY_ID && process.env.AWS_ACCESS_KEY_ID != "") ? 
process.env.AWS_ACCESS_KEY_ID : "";

const AWS_SECRET_ACCESS_KEY = 
(process.env.AWS_SECRET_ACCESS_KEY && process.env.AWS_SECRET_ACCESS_KEY != "") ? 
process.env.AWS_SECRET_ACCESS_KEY : "";

const AWS_BUCKET_REGION = 
(process.env.AWS_BUCKET_REGION && process.env.AWS_BUCKET_REGION != "") ? 
process.env.AWS_BUCKET_REGION : "US East (N. Virginia)";

const AWS_BUCKET_ENDPOINT = 
(process.env.AWS_BUCKET_ENDPOINT && process.env.AWS_BUCKET_ENDPOINT != "") ? 
process.env.AWS_BUCKET_ENDPOINT : "amazonaws.com"

// The name of the bucket that you have created
const BUCKET_NAME = 
(process.env.AWS_BUCKET_NAME && process.env.AWS_BUCKET_NAME != "") ? 
process.env.AWS_BUCKET_NAME : "sl-unnati-storage";

const s3 = new AWS.S3({
  accessKeyId: AWS_ACCESS_KEY_ID,
  secretAccessKey: AWS_SECRET_ACCESS_KEY,
  signatureVersion: 'v4'
});

let uploadFile = function( file,filePathForBucket ) {

    return new Promise( async(resolve,reject)=>{

        try {
            const uploadParams = {
                Bucket: BUCKET_NAME,
                Key: filePathForBucket,
                Body: file,
                ACL: 'public-read'
            };
        
            s3.upload(uploadParams,function(err,data){
                if( err ) {
                    throw {
                        message : "Could not upload file in aws"
                    };
                } else {
                    return resolve(data.Location);
                }
            })
        } catch(error) {
            return reject(error);
        }

    })
}

module.exports = {
  s3: s3,
  uploadFile : uploadFile
};