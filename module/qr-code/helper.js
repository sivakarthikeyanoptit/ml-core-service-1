/**
 * name : qr-code/helper.js
 * author : Aman
 * Date : 10-feb-2019
 * Description : All qrCode related information.
 */

let qrGeneratorService = require(ROOT_PATH+"/generics/services/qr-generator");

module.exports = class QrCodeHelper {

    /**
     * Generate qr code.
     * @method
     * @name generate
     * @param  {bodyData}  - All body data.
     * @returns {json} Response consists of Array of generated qr code information.
    */

    static generate( qrCodeData,userId ) {
        return new Promise(async (resolve, reject) => {
            try {

                if( qrCodeData.length < 1 ) {
                    throw messageConstants.apiResponses.QR_CODE_DATA_SIZE; 
                } 

                for( 
                    let pointerToQrCodeData = 0; 
                    pointerToQrCodeData < qrCodeData.length;
                    pointerToQrCodeData ++
                ) {

                    let qrCodeDocument = await database.models.qrCode.findOne({
                        code : qrCodeData[pointerToQrCodeData].code
                    },{ _id : 1 }).lean();

                    if( qrCodeDocument && qrCodeDocument._id ) {
                        throw messageConstants.apiResponses.QR_CODE_EXISTS; 
                    }

                    let qrCodeCreationData = {...qrCodeData[pointerToQrCodeData]};
                    qrCodeCreationData["createdBy"] = userId;

                    let imageUrl = await qrGeneratorService.createQrCode(
                        qrCodeData[pointerToQrCodeData].code
                    )

                }
            

                // let qrCodeData = {...}
                
                return resolve(userProfileCreationData);

            } catch (error) {
                return reject(error);
            }
        })
    }

     /**
      * Create image using go-qr-generator.
      * @method
      * @name createImage
      * @param  {bodyData}  - All body data.
      * @returns {json} Response consists of Array of generated qr code information.
    */

    // static createImage( qrCodeData ) {
    //     return new Promise(async (resolve, reject) => {
    //         try {
    //             let qrCodeImageUrl = 
    //         } catch (error) {
    //             return reject(error);
    //         }
    //     })
    // }


};