/**
 * name : user-management.js
 * author : Aman Jung Karki
 * Date : 11-Nov-2019
 * Description : All user management related api call.
 */

//dependencies

const request = require('request');
let fs = require("fs");

/**
  * Create user profile. 
  * @function
  * @name createUserProfile
  * @returns {Promise} returns a Json consisting of created user profile data.
*/

var createQrCode = function ( code ) {

    const createQrCodeUrl = 
    `${process.env.QR_GENERATOR_URL}?data=${code}&size=${process.env.IMAGE_SIZE}`;

    return new Promise(async (resolve, reject) => {
        try {

            let fileName = `${ROOT_PATH}/public/images/${code}.png`;

            const _qrCodeCallBack = function (err, response) {
                if (err) {
                    return resolve({
                        success : false,
                        message : ""
                    })
                } else { 
                    fs.writeFile(fileName,response.body,function(err){
                        if(err) {
                            console.log(err);
                        }
                    });
                }
            }

            request.get(createQrCodeUrl, {
            },_qrCodeCallBack);

        } catch (error) {
            return reject(error);
        }
    })

}

module.exports = {
    createQrCode: createQrCode
};