/**
 * name : awsFileUpload.js
 * author : Aman Jung Karki
 * created-date : 03-Dec-2019
 * Description : File upload information.
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
process.env.AWS_BUCKET_NAME : "sl-dev-storage";

const s3 = new AWS.S3({
  accessKeyId: AWS_ACCESS_KEY_ID,
  secretAccessKey: AWS_SECRET_ACCESS_KEY,
  signatureVersion: 'v4',
  // region: "us-east-1",
  endpoint: AWS_BUCKET_ENDPOINT
});


let getFilePublicBaseUrl = function( imageUrlPath ) {
  return `https://${BUCKET_NAME}.${AWS_BUCKET_ENDPOINT}/${imageUrlPath}`;
}


module.exports = {
  getFilePublicBaseUrl : getFilePublicBaseUrl,
  s3: s3,
  bucketName: BUCKET_NAME
};
