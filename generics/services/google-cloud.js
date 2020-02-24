/**
 * name : google-cloud.js
 * author : Aman Jung Karki
 * created-date : 23-feb-2020
 * Description : All google cloud related functionality
 */

const { Storage } = require("@google-cloud/storage");
const BUCKET_NAME = process.env.GCP_BUCKET_NAME;

const storage = new Storage({
  projectId: "shikshalokam",
  keyFilename:
    ROOT_PATH+process.env.GCP_PATH
});

var myBucket = storage.bucket(BUCKET_NAME);

let uploadFile = (file,filePath) => {
  return new Promise(async (resolve,reject)=>{
      try {
          
          let uploadedFile = await myBucket.upload(file,
            {
                destination: filePath,
                gzip : true
            }
          );

          return resolve(
            uploadedFile[0].metadata.mediaLink
          );

      } catch(err) {
          return reject(err);
      }
  })
}

module.exports = {
    uploadFile: uploadFile
};
