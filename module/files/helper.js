/**
 * name : files/helper.js
 * author : Aman Jung Karki
 * created-date : 11-Feb-2020
 * Description : All files related helper functionality.Including uploading file
 * to cloud service.
 */

// Dependencies
let awsServices = require(ROOT_PATH+"/generics/services/aws");
let googleCloudServices = require(ROOT_PATH+"/generics/services/google-cloud");

/**
    * FilesHelper
    * @class
*/

module.exports = class FilesHelper{
    
    /**
      * Upload file in different services based on cloud storage provide.
      * @method
      * @name upload
      * @param  {file}  - file to upload.
      * @param  {filePathForBucket}  - file path where the file should upload.
      * @returns {json} Response consists of links of uploaded qr code.
    */

   static upload( file,filePathForBucket ) {
       return new Promise(async (resolve, reject) => {
           try {

            let result;
            if( process.env.CLOUD_STORAGE === "AWS" ) {
                result = await awsServices.uploadFile(
                    file,
                    filePathForBucket
                );
            } else if( process.env.CLOUD_STORAGE === "GC" ) {
                result = await googleCloudServices.uploadFile(
                    file,
                    filePathForBucket
                )
            }

            return resolve(result);
            } catch (error) {
                return reject(error);
            }
        })
   }
}