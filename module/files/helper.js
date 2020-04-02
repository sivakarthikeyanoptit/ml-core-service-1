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

   static upload( file,filePathForBucket,bucketName ) {
       return new Promise(async (resolve, reject) => {
           try {

            let result;
            if( process.env.CLOUD_STORAGE === constants.common.AWS_SERVICE ) {
                result = await awsServices.uploadFile(
                    file,
                    filePathForBucket,
                    bucketName
                );
            } else if( process.env.CLOUD_STORAGE === constants.common.GOOGLE_CLOUD_SERVICE ) {
                result = await googleCloudServices.uploadFile(
                    file,
                    filePathForBucket,
                    bucketName
                )
            }

            return resolve(result);
            } catch (error) {
                return reject(error);
            }
        })
   }

   /**
      * Get downloadable url
      * @method
      * @name getDownloadableUrl
      * @param  {filePath}  - File path.
      * @return {String} - Downloadable url link
    */

   static getDownloadableUrl( filePath,bucketName,storageName="" ) {
       return new Promise(async (resolve, reject) => {
           try {
               let result;
              
               let cloudStorage = process.env.CLOUD_STORAGE;

               if(storageName !== "") {
                cloudStorage = storageName;
                }
            
               if(cloudStorage === constants.common.AWS_SERVICE ) {
                   result = await awsServices.getDownloadableUrl(
                       filePath,
                       bucketName
                    );
                } else if(cloudStorage === constants.common.GOOGLE_CLOUD_SERVICE) {
                    result = await googleCloudServices.getDownloadableUrl(
                        filePath,
                        bucketName
                    );
                }
                
                return resolve(result);
            } catch (error) {
                return reject(error);
            }
        })
    }
}