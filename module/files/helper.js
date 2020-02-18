/**
 * name : files/helper.js
 * author : Aman Jung Karki
 * created-date : 03-Dec-2019
 * Description : File upload helper functionality.
 */

// Dependencies
let unnatiServices = require(ROOT_PATH + "/generics/services/unnati");
let cloudStorage = process.env.CLOUD_STORAGE;
let awsFileUploadServices = 
require(ROOT_PATH + "/generics/cloud-services/aws-file-upload");

module.exports = class FileHelper {
    
    static getFilePublicBaseUrl(requestedData) {
        return new Promise( async (resolve,reject) => {
            try {

                let appName = requestedData.headers.app;
                let bucketPath;

                if( appName === "unnati" ) {
                    bucketPath = await unnatiServices.getFilePublicBaseUrl(
                        requestedData.body.projectId
                    )
                }

                let result;

                if(cloudStorage === "AWS") {
                    
                    result = awsFileUploadServices.getFilePublicBaseUrl(
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

    static getSignedUrls(folderPath , fileNames ) {
        return new Promise(async (resolve, reject) => {
            try {

                if(folderPath == "") {
                    throw new Error("File base url not given.");
                }

                if(!Array.isArray(fileNames) || fileNames.length < 1) {
                    throw new Error("File names not given.");
                }

                if(cloudStorage == "") {
                    throw new Error(
                        messageConstants.apiResponses.MISSING_CLOUD_STORAGE_PROVIDER
                    );
                }

                if( cloudStorage != "AWS" ) {
                    throw new Error(
                        messageConstants.apiResponses.INVALID_CLOUD_STORAGE_PROVIDER
                    );
                }

                let signedUrls = new Array;

                for (let pointerToFileNames = 0; pointerToFileNames < fileNames.length; pointerToFileNames++) {
                    const file = fileNames[pointerToFileNames];
                    let signedUrlResponse;
                    
                    if (cloudStorage == "AWS") {
                        signedUrlResponse = await this.getS3SignedUrl(folderPath, file);
                    }

                    if(signedUrlResponse.success) {
                        signedUrls.push({
                            file: file,
                            url: signedUrlResponse.url,
                            payload: { sourcePath: signedUrlResponse.name },
                            cloudStorage : process.env.CLOUD_STORAGE
                        });
                    }

                }

                if(signedUrls.length == fileNames.length) {
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
     * @param {String} [folderPath = ""] - link to the folder path.
     * @param {Array} [fileName = ""] - fileName. 
     * @returns {Object} - signed url and s3 file name. 
     */

    static getS3SignedUrl( folderPath, fileName ) {
        return new Promise(async (resolve, reject) => {
            try {

                if(folderPath == "" || fileName == "") {
                    throw new Error(httpStatusCode.bad_request.status);
                }

                let noOfMinutes = 30;
                let expiry = 60 * noOfMinutes;

                try {
                    const url = 
                    await awsFileUploadServices.s3.getSignedUrlPromise('putObject', {
                        Bucket: awsFileUploadServices.bucketName,
                        Key: folderPath + fileName,
                        Expires: expiry
                    });
                    
                    if(url && url != "") {
                        return resolve({
                            success : true,
                            message : messageConstants.apiResponses.URL_GENERATED+"Signed.",
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