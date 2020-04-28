/**
 * name : files/helper.js
 * author : Aman Jung Karki
 * created-date : 11-Feb-2020
 * Description : All files related helper functionality.Including uploading file
 * to cloud service.
 */

// Dependencies
var zipFolder = require('zip-folder');
const unzip = require("unzip");
const fs = require("fs");
let awsServices = require(ROOT_PATH + "/generics/services/aws");
let googleCloudServices = require(ROOT_PATH + "/generics/services/google-cloud");
let azureService = require(ROOT_PATH + "/generics/services/azure");

/**
    * FilesHelper
    * @class
*/

module.exports = class FilesHelper {

    /**
      * Upload file in different services based on cloud storage provide.
      * @method
      * @name upload
      * @param  {file}  - file to upload.
      * @param  {filePathForBucket}  - file path where the file should upload.
      * @param {String} - bucketName
      * @returns {json} Response consists of links of uploaded file.
    */

    static uploadFile(file, filePathForBucket, bucketName) {
        return new Promise(async (resolve, reject) => {
            try {

                let result;
                if (process.env.CLOUD_STORAGE === constants.common.AWS_SERVICE) {
                    result = await awsServices.uploadFile(
                        file,
                        filePathForBucket,
                        bucketName
                    );
                } else if (process.env.CLOUD_STORAGE === constants.common.GOOGLE_CLOUD_SERVICE) {
                    result = await googleCloudServices.uploadFile(
                        file,
                        filePathForBucket,
                        bucketName
                    )
                } else if (process.env.CLOUD_STORAGE === constants.common.AZURE_SERVICE) {
                    result = await azureService.uploadFile(
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
       * @param  {String}  - Bucket name
       * @param  {String}  - Storage name
       * @return {String} - Downloadable url link
     */

    static getDownloadableUrl(filePath, bucketName, storageName = "") {
        return new Promise(async (resolve, reject) => {
            try {

                let cloudStorage = process.env.CLOUD_STORAGE;

                if (storageName !== "") {
                    cloudStorage = storageName;
                }

                if (Array.isArray(filePath) && filePath.length > 0) {

                    let result = [];
                    
                    await Promise.all(filePath.map(async element => {
                        let responseObj = {};
                        responseObj.filePath = element;
                        responseObj.url = 
                        await  _getLinkFromCloudService(
                                element,
                                bucketName,
                                cloudStorage
                            );

                        result.push(responseObj)

                    }));
                    
                    return resolve(result);
                    
                } else {

                    let result;

                    result = await _getLinkFromCloudService(
                        filePath,
                        bucketName,
                        cloudStorage
                    );

                    let responseObj = {
                        filePath: filePath,
                        url: result
                    };

                    return resolve(responseObj);
                }

            } catch (error) {
                return reject(error);
            }
        })
    }

    /**
   * Get all signed urls.
   * @method
   * @name preSignedUrls
   * @param {String} [folderPath] - link to the folder path.
   * @param {Array} [fileNames] - fileNames.
   * @param {Array} [storageName] - Storage name if provided.  
   * @returns {Array} - consists of all signed urls files. 
   */

  static preSignedUrls( path, fileNames,bucket,storageName = "" ) {
    return new Promise(async (resolve, reject) => {
        try {

            if( !path ) {
                throw new Error("File base url not given.");
            }

            if(!Array.isArray(fileNames) || fileNames.length < 1) {
                throw new Error("File names not given.");
            }

            let cloudStorage = process.env.CLOUD_STORAGE;

            if (storageName !== "") {
                cloudStorage = storageName;
            }

            let signedUrls = new Array;

            for (
                let pointerToFileNames = 0; 
                pointerToFileNames < fileNames.length; 
                pointerToFileNames++
            ) {
                const file = fileNames[pointerToFileNames];
                let signedUrlResponse;
                
                if( cloudStorage === constants.common.GOOGLE_CLOUD_SERVICE ) {
                    signedUrlResponse = 
                    await googleCloudServices.signedUrl(
                        path, 
                        file,
                        bucket
                    );

                } else if ( cloudStorage === constants.common.AWS_SERVICE ) {
                    signedUrlResponse = 
                    await awsServices.signedUrl(
                        path, 
                        file,
                        bucket
                    );

                } else if ( cloudStorage === constants.common.AZURE_SERVICE ) {
                    signedUrlResponse = 
                    await azureService.signedUrl(
                        path, 
                        file,
                        bucket
                    );
                }

                if(signedUrlResponse.success) {
                    signedUrls.push({
                        file: file,
                        url: signedUrlResponse.url,
                        payload: { sourcePath: signedUrlResponse.name },
                        cloudStorage : cloudStorage
                    });
                }

            }

            if(signedUrls.length == fileNames.length) {
                return resolve({
                    success : true,
                    message : constants.apiResponses.URL_GENERATED,
                    result : signedUrls
                });
            } else {
                return resolve({
                    success : false,
                    message : constants.apiResponses.FAILED_PRE_SIGNED_URL,
                    result : signedUrls
                });
            }
            

        } catch (error) {
            return reject(error);
        }
    })
}
      /**
       * Unzip file
       * @method
       * @name unzip
       * @param  {String} zipFilePath - Path of zip file.
       * @param  {String} folderToUnZip - Path where file should be unziped.
       * @param  {String} deleteExistingZipFile - delete the existing zip file.
       * @return {Object} - Save unzipped file
     */

    static unzip(zipFilePath, folderToUnZip,deleteExistingZipFile) {
        return new Promise(async (resolve, reject) => {
            try {

                if( !fs.existsSync(`${ROOT_PATH}${process.env.ZIP_PATH}`) ) {
                    fs.mkdirSync(`${ROOT_PATH}${process.env.ZIP_PATH}`);
                }

                const fileContents = fs.createReadStream(zipFilePath);

                fileContents
                .pipe(unzip.Extract({ path : folderToUnZip }))
                .on('close',(err)=>{
                    if(err) {
                        return resolve({
                            success : false
                        })
                    } else {
                        
                        if( deleteExistingZipFile ) {
                            fs.unlinkSync(zipFilePath)
                        }

                        return resolve({
                            success : true
                        })
                    }
                });

            } catch (error) {
                return reject(error);
            }
        })
    }

    /**
       * zip a folder
       * @method
       * @name zip
       * @param  {String} existingName - existing file name.
       * @param  {String} newFileName - new file name to set
       * @return {Object} - Save unzipped file
     */

    static zip( existing, newFolder ) {
        return new Promise(async (resolve, reject) => {
            try {
                
                await zipFolder(existing, newFolder,function(err) {
                    if (err) {

                        return resolve({
                            success : false
                        })
                    } else {

                        return resolve({
                            success : true
                        })
                    }
                });
                  
            } catch (error) {
                return resolve({
                    success : false
                })
            }
        })
    }

     /**
       * Rename file name
       * @method
       * @name rename
       * @param  {String} existingName - existing file name.
       * @param  {String} newFileName - new file name to set
       * @return {Object} - Save unzipped file
     */

    static rename(existingName, newFileName) {
        return new Promise(async (resolve, reject) => {
            try {

                fs.rename( existingName,newFileName, function(err) {
                    if ( err ) {
                        return resolve({
                            success : false
                        })
                    } else {
                        return resolve({
                            success : true
                        })
                    }
                });

            } catch (error) {
                return reject(error);
            }
        })
    }
   
    /**
       * Save zip file in public zip folder
       * @method
       * @name saveZipFile
       * @param  {String} zipFileName  - name of zip file.
       * @param  {String}  zipFileData
       * @return {Object} - Save zip file data.
     */

    static saveZipFile(name, data) {
        return new Promise(async (resolve, reject) => {
            try {

                if( !fs.existsSync(`${ROOT_PATH}${process.env.ZIP_PATH}`) ) {
                    fs.mkdirSync(`${ROOT_PATH}${process.env.ZIP_PATH}`);
                }
                
                let zipFileName = `${ROOT_PATH}${process.env.ZIP_PATH}/${name}`

                fs.writeFile(zipFileName,data,async function(err){
                    if(err) {
                        return resolve({
                            save : false
                        })
                    } else {
                        return resolve({
                            save : true
                        })
                    }
                })

            } catch (error) {
                return reject(error);
            }
        })
    }

    /**
     * Remove folder recursively
     * @function
     * @name removeFolder
     * @param path - folder path.
     * @returns {Promise}
    */

    static removeFolder(path) {
        _removeFolder(path);
        return;
    };

}


/**
       * Get downloadable url
       * @method
       * @name _getLinkFromCloudService
       * @param  {filePath}  - File path.
       * @return {String} - Downloadable url link
     */

function _getLinkFromCloudService(filePath, bucketName, cloudStorage) {

    return new Promise(async function (resolve, reject) {
        try {

            let result;

            if (cloudStorage === constants.common.AWS_SERVICE) {
                result = await awsServices.getDownloadableUrl(
                    filePath,
                    bucketName
                );
            } else if (cloudStorage === constants.common.GOOGLE_CLOUD_SERVICE) {
                result = await googleCloudServices.getDownloadableUrl(
                    filePath,
                    bucketName
                );
            } else if (cloudStorage === constants.common.AZURE_SERVICE) {
                result = await azureService.getDownloadableUrl(
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

/**
 * Remove folder recursively
 * @function
 * @name _removeFolder
 * @param path - folder path.
 * @return
*/

function _removeFolder(path) {
    
    if( fs.existsSync(path) ) {
        fs.readdirSync(path).forEach(function(file,index){
          var currentPath = path + "/" + file;
          if(fs.lstatSync(currentPath).isDirectory()) { // recurse
            _removeFolder(currentPath);
          } else { // delete file
            fs.unlinkSync(currentPath);
          }
        });
        fs.rmdirSync(path);
    }
}