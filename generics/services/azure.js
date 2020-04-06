const { BlobServiceClient, generateBlobSASQueryParameters, BlobSASPermissions, StorageSharedKeyCredential } = require('@azure/storage-blob');
const AZURE_ACCOUNT_NAME = (process.env.AZURE_ACCOUNT_NAME && process.env.AZURE_ACCOUNT_NAME != "") ? process.env.AZURE_ACCOUNT_NAME : "";
const AZURE_ACCOUNT_KEY = (process.env.AZURE_ACCOUNT_KEY && process.env.AZURE_ACCOUNT_KEY != "") ? process.env.AZURE_ACCOUNT_KEY : "";

// The name of the container that the files will be uploaded to.
const AZURE_STORAGE_CONTAINER = (process.env.AZURE_STORAGE_CONTAINER && process.env.AZURE_STORAGE_CONTAINER != "") ? process.env.AZURE_STORAGE_CONTAINER : "sl-dev-storage";

let blobServiceClient;

let containerClient;

(async () => {

  const sharedKeyCredential = new StorageSharedKeyCredential(AZURE_ACCOUNT_NAME, AZURE_ACCOUNT_KEY);

  // Create the BlobServiceClient object which will be used to create a container client
  blobServiceClient = new BlobServiceClient(
    `https://${AZURE_ACCOUNT_NAME}.blob.core.windows.net`,
    sharedKeyCredential
  );

  // Get a reference to a container
  containerClient = await blobServiceClient.getContainerClient(AZURE_STORAGE_CONTAINER);

  const checkIfContainerExists = await containerClient.exists();

  if (!checkIfContainerExists) {
    // Create the container
    const createContainerResponse = await containerClient.create();
  }

})();

/**
  * Upload file in azure.
  * @function
  * @name uploadFile
  * @param file - file to upload.
  * @param filePath - file path
  * @returns {Object} - upload file information
*/

let uploadFile = async function (file, fileName, container) {

  return new Promise(async (resolve, reject) => {

    const containerClient = blobServiceClient.getContainerClient(container);
    const content = file;
    const blobName = fileName;
    const blockBlobClient = containerClient.getBlockBlobClient(blobName);
    const uploadBlobResponse = await blockBlobClient.upload(content, content.length);

    if (!uploadBlobResponse['requestId']) {
      return reject({
        message: "Could not upload file in azure"
      });
    } else {

      let result = {
        name: fileName,
        bucket: container,
        location: uploadBlobResponse.requestId
      };
      return resolve(result);

    }

  });
}


/**
  * Get downloadable url.
  * @function
  * @name getDownloadableUrl
  * @param filePath - file path
  * @returns {String} - Get downloadable url link
*/

let getDownloadableUrl = function (filePath, container) {

  return new Promise(async (resolve, reject) => {

    try {

      let sasToken = generateBlobSASQueryParameters({
        containerName: container,
        blobName: filePath,
        permissions: BlobSASPermissions.parse("rw"),
        startsOn: new Date(),
        expiresOn: new Date(new Date().valueOf() + process.env.AZURE_LINK_EXPIRY_TIME)
      },
        blobServiceClient.credential
      ).toString();

      return resolve(containerClient.url + "/" + filePath + "?" + sasToken);

    } catch (error) {
      return reject(error);
    }

  });
}



module.exports = {
  uploadFile: uploadFile,
  getDownloadableUrl: getDownloadableUrl
};
