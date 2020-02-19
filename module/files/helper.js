/**
 * name : files/helper.js
 * author : Aman Jung Karki
 * created-date : 03-Dec-2019
 * Description : File upload helper functionality.
 */

// Dependencies
let unnatiServices = require(ROOT_PATH + "/generics/services/unnati");
let cloudStorage = process.env.CLOUD_STORAGE;
let aws = require(ROOT_PATH + "/generics/cloud-services/aws-file-upload");

module.exports = class FileHelper {
    
    /**
   * Get the url of the image upload.
   * @method
   * @name getFilePublicBaseUrl
   * @param {Object} requestedData -requested Data.
   * @param {String} requestedData.headers - header data
   * @param {String} requestedData.headers.app - app name
   * @returns {JSON} - Response data.
   */

    static getFilePublicBaseUrl( requestedData ) {
        return new Promise( async (resolve,reject) => {
            try {

                let appName = requestedData.headers.app;
                let bucketPath;

                if( appName === messageConstants.common.UNNATI_APP ) {
                    bucketPath = await unnatiServices.getFilePublicBaseUrl(
                        requestedData.body.projectId
                    )
                }

                let result;

                if( cloudStorage === messageConstants.common.AWS_SERVICE ) {
                    
                    result = aws.getFilePublicBaseUrl(
                        bucketPath
                    );
                }

                let response = {
                    filePath : result.getFilePublicBaseUrl()
                };

                return resolve({
                    result : response
                })

            } catch(error) {
                return reject(error);
            }
        })
    }

    /**
   * Get all the signed urls.
   * @method
   * @name getSignedUrls
   * @param {Object} requestedData -requested Data.
   * @param {String} requestedData.headers - header data
   * @param {String} requestedData.headers.app - app name
   * @returns {JSON} - Response data.
   */

    static getSignedUrls( folderPath , fileNames ) {
        return new Promise(async (resolve, reject) => {
            try {

                if( folderPath == "" ) {
                    throw new Error(
                        messageConstants.apiResponses.NO_FOLDER_PATH_FOUND
                    );
                }

                if( !Array.isArray(fileNames) || fileNames.length < 1 ) {
                    throw new Error(
                        messageConstants.apiResponses.NO_FILE_BASE_URL
                    );
                }

                if( cloudStorage == "" ) {
                    throw new Error(
                        messageConstants.apiResponses.MISSING_CLOUD_STORAGE_PROVIDER
                    );
                }

                if( cloudStorage != messageConstants.common.AWS_SERVICE  ) {
                    throw new Error(
                        messageConstants.apiResponses.INVALID_CLOUD_STORAGE_PROVIDER
                    );
                }

                let signedUrls = new Array;

                for (let pointerToFileNames = 0; pointerToFileNames < fileNames.length; pointerToFileNames++) {
                    const file = fileNames[pointerToFileNames];
                    let signedUrlResponse;
                    
                    if ( cloudStorage == messageConstants.common.AWS_SERVICE ) {
                        signedUrlResponse = 
                        await this.getS3SignedUrl(
                            folderPath,
                            file
                        );
                    }

                    if( signedUrlResponse.success ) {
                        signedUrls.push({
                            file: file,
                            url: signedUrlResponse.url,
                            payload: { sourcePath: signedUrlResponse.name },
                            cloudStorage : process.env.CLOUD_STORAGE
                        });
                    }

                }

                if( signedUrls.length == fileNames.length ) {
                    return resolve({
                        success : true,
                        message : messageConstants.apiResponses.URL_GENERATED,
                        files : signedUrls
                    });
                } else {
                    return resolve({
                        success : false,
                        message : messageConstants.apiResponses.FAILED_PRE_SIGNED_URL,
                        files : signedUrls
                    });
                }
                

            } catch (error) {
                return reject(error);
            }
        })
    }

      /**
     * Get aws s3 cloud signed url.
     * @method
     * @name getS3SignedUrl
     * @param {String} folderPath - link to the folder path.
     * @param {Array} fileName - fileName. 
     * @returns {Object} - signed url and s3 file name. 
     */

    static getS3SignedUrl( folderPath, fileName ) {
        return new Promise(async (resolve, reject) => {
            try {

                if( folderPath == "" || fileName == "" ) {
                    throw new Error(httpStatusCode.bad_request.status);
                }

                let noOfMinutes = 30;
                let expiry = 60 * noOfMinutes;

                try {
                    const url = 
                    await aws.s3.getSignedUrlPromise('putObject', {
                        Bucket: aws.bucketName,
                        Key: folderPath + fileName,
                        Expires: expiry
                    });
                    
                    if( url && url != "" ) {
                        return resolve({
                            success : true,
                            message :
                            messageConstants.apiResponses.URL_GENERATED+messageConstants.apiResponses.SIGNED,
                            url : url,
                            name : folderPath + fileName
                        });
                    } else {
                        return resolve({
                            success : false,
                            message : messageConstants.apiResponses.FAILED_SIGNED_URL,
                            response : url
                        });
                    }
                } catch (error) {
                    return resolve({
                        success : false,
                        message : error.message,
                        response : error
                    });
                }
                

            } catch (error) {
                return reject(error);
            }
        })
    }
}