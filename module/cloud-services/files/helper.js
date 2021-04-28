/**
 * name : files/helper.js
 * author : Aman Jung Karki
 * created-date : 11-Feb-2020
 * Description : All files related helper functionality.Including uploading file
 * to cloud service.
 */

// Dependencies
let filesHelpers = require(ROOT_PATH+"/module/files/helper");

/**
 * FilesHelper
 * @class
 */

module.exports = class FilesHelper {

  /**
   * Get all signed urls.
   * @method
   * @name preSignedUrls
   * @param {Array} payloadData - payload for files data.
   * @param {String} referenceType - reference type
   * @param {String} userId - Logged in user id.
   * @returns {Array} - consists of all signed urls files.
   */

  static preSignedUrls(payloadData, referenceType,userId) {
    return new Promise(async (resolve, reject) => {
      try {
          
          let payloadIds = Object.keys(payloadData);

          let bucketName = "";
          let cloudStorage = process.env.CLOUD_STORAGE;

          if( cloudStorage === "AWS" ) {
              bucketName = process.env.AWS_BUCKET_NAME;
          } else if (cloudStorage === "GC" ) {
            bucketName = process.env.GCP_BUCKET_NAME;
          } else {
            bucketName = process.env.AZURE_STORAGE_CONTAINER;
          }

          let result = {
              [payloadIds[0]] : {}
          };

          if( referenceType === constants.common.PROJECT ) {
              
                for( let pointerToPayload = 0; pointerToPayload < payloadIds.length; pointerToPayload++ ) {
                    
                    let payloadId = payloadIds[pointerToPayload];
                    let folderPath = "project/" + payloadId;
                    
                    let imagePayload = 
                    await filesHelpers.preSignedUrls(
                        payloadData[payloadId].files,
                        bucketName,
                        cloudStorage,
                        folderPath
                    );

                    if( !imagePayload.success ) {
                        return resolve({
                            status : httpStatusCode['bad_request'].status,
                            message : constants.common.FAILED_PRE_SIGNED_URL,
                            result : {}
                        });
                    }

                    if( !result[payloadId] ) {
                        result[payloadId] = {};
                    }

                    result[payloadId]["files"] = imagePayload.result;
                }

          } else {
            let folderPath = "survey/" + payloadIds[0];
            
            let imagePayload = await filesHelpers.preSignedUrls(
                payloadData[payloadIds[0]].files,
                bucketName,
                cloudStorage,
                folderPath
            );

            if( !imagePayload.success ) {
                return resolve({
                    status : httpStatusCode['bad_request'].status,
                    message : constants.common.FAILED_PRE_SIGNED_URL,
                    result : {}
                });
            }

            result[payloadIds[0]]["files"] = imagePayload.result;
          }

          return resolve({
              message : constants.apiResponses.URL_GENERATED,
              data : result
          })
      } catch (error) {
        return reject(error)
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

  static getDownloadableUrl( filePath ) {
    return new Promise(async (resolve, reject) => {
      try {
        
        let cloudStorage = process.env.CLOUD_STORAGE

        if (storageName !== '') {
          cloudStorage = storageName
        }

        if (Array.isArray(filePath) && filePath.length > 0) {
          let result = []

          await Promise.all(
            filePath.map(async element => {
              let responseObj = {}
              responseObj.filePath = element
              responseObj.url = await _getLinkFromCloudService(
                element,
                bucketName,
                cloudStorage
              )

              responseObj["cloudStorage"] = cloudStorage;

              result.push(responseObj)
            })
          )

          return resolve(result)
        } else {
          let result

          result = await _getLinkFromCloudService(
            filePath,
            bucketName,
            cloudStorage
          )

          let responseObj = {
            filePath: filePath,
            url: result
          }

          return resolve(responseObj)
        }
      } catch (error) {
        return reject(error)
      }
    })
  }
}



