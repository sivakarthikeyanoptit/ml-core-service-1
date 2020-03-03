/**
 * name : google-cloud.js
 * author : Aman Jung Karki
 * created-date : 23-feb-2020
 * Description : All google cloud related functionality
 */

// Dependencies
const { Storage } = require("@google-cloud/storage");

const storage = new Storage({
  projectId: "shikshalokam",
  keyFilename:
    ROOT_PATH + process.env.GCP_PATH
});

/**
  * Upload file in google cloud.
  * @function
  * @name uploadFile
  * @param file - file to upload.
  * @param filePath - file path
  * @returns {Object} - upload file information
*/

let uploadFile = ( fileName,filePath,bucketName ) => {
  return new Promise(async (resolve,reject)=>{
      try {
          let bucket = bucketName ? bucketName : process.env.DEFAULT_BUCKET_NAME;
          let gcpBucket = storage.bucket(bucket);

          let uploadedFile = await gcpBucket.upload(fileName,
            {
                destination: filePath,
                gzip : true,
                metadata : {}
            }
          );

          return resolve(
            uploadedFile[0].metadata
          );

      } catch(err) {
          return reject(err);
      }
  })
}

/**
  * Get download lik for google cloud data.
  * @function
  * @name downloadUrl
  * @param fileName - Name of the file name.
  * @returns {String} - Url link
*/

let getDownloadableUrl = ( filename,bucketName) =>{
  return new Promise(async (resolve,reject)=>{
    try {

      let bucket = bucketName ? bucketName : process.env.DEFAULT_BUCKET_NAME;
      let gcpBucket = storage.bucket(bucket);
      let downloadableUrl = await gcpBucket.file(filename).getMetadata();
      return resolve(downloadableUrl[0].mediaLink);
      
    } catch(err){
      return reject(err);
    }
  })
}

module.exports = {
    uploadFile: uploadFile,
    getDownloadableUrl : getDownloadableUrl
};
