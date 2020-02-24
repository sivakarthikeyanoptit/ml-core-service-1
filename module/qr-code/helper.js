/**
 * name : qr-code/helper.js
 * author : Aman
 * Date : 10-feb-2019
 * Description : All qrCode related information.
 */

// Dependencies

let qrGeneratorService = require(ROOT_PATH+"/generics/services/qr-generator");
let gotenbergService = require(ROOT_PATH+"/generics/services/gotenberg");
const ejs = require('ejs');
let fs = require("fs");
let filesHelper = require(ROOT_PATH+"/module/files/helper");
let bodhServices = require(ROOT_PATH+"/generics/services/bodh");

/**
    * QrCodeHelper
    * @class
*/
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

                let result = [];

                for( 
                    let pointerToQrCodeData = 0; 
                    pointerToQrCodeData < qrCodeData.length;
                    pointerToQrCodeData ++
                ) {

                    let qrCodeDocument = await database.models.qrCode.findOne({
                        code : qrCodeData[pointerToQrCodeData].code,
                        status : "active"
                    },{ _id : 1 }).lean();

                    let qrCodeCreationData = {...qrCodeData[pointerToQrCodeData]};

                    if( qrCodeDocument && qrCodeDocument._id ) {
                        qrCodeCreationData["_id"] = 
                        messageConstants.apiResponses.QR_CODE_EXISTS;
                    } else {
                        
                        let code = qrCodeCreationData.code;
                        qrCodeCreationData["createdBy"] = userId;
                        
                        await qrGeneratorService.createQrCode(
                            code
                        );
                        
                        let data = {    
                            courseName : qrCodeCreationData.courseName,
                            courseId : qrCodeCreationData.courseId,
                            qrCodeImage : "image.png"
                        }
                        
                        await this.createHtmlFromEjs(
                            [ data ],
                            code
                        );
                        
                        let gotenbergFormData = 
                        [
                            {
                                value :
                                fs.createReadStream(`${ROOT_PATH}${process.env.QR_CODE_PATH}/${code}/index.html`),
                                options : {filename: '/index.html'}
                            },{
                                value : 
                                fs.createReadStream(`${ROOT_PATH}${process.env.QR_CODE_PATH}/${code}/image.png`),
                                options : { filename : '/image.png'
                            }
                        }];
                        
                        let pdfPath = 
                        `${ROOT_PATH}${process.env.QR_CODE_PATH}/${code}/qrCode.pdf`;
                        
                        await gotenbergService.generatePdf(
                            gotenbergFormData,
                            pdfPath
                        );
                        
                        let uploadFile = 
                        await this.upload(
                            code
                        );
                        
                        qrCodeCreationData["imageUrl"] = uploadFile.imageUrl;
                        qrCodeCreationData["pdfUrl"] = uploadFile.pdfUrl;
                        
                        let createQrCode = 
                        await database.models.qrCode.create(
                            qrCodeCreationData
                        );

                        if( !createQrCode ) {
                            throw {
                                message : "Something went wrong"
                            }
                        }
                        
                        qrCodeCreationData["_id"] = createQrCode._id;
                    }
                result.push(qrCodeCreationData);
            }
            
            return resolve({
                message : messageConstants.apiResponses.QR_CODE_FETCHED,
                result:result
            });

            } catch (error) {
                return reject(error);
            }
        })
    }

    /**
     * Generate qr code.
     * @method
     * @name generateCodes
     * @param  {lengthOfCodes}  - Count of dial code to generate.
     * @returns { Array } - unique codes generated data. 
    */

    static generateCodes( lengthOfCodes , userToken ) {
        return new Promise(async (resolve, reject) => {
            try { 

                let codes = await bodhServices.generateCodes(
                    {
                        "request" : {
                            "dialcodes" : { 
                                "count" : lengthOfCodes,
                                "publisher" : process.env.SHIKSHALOKAM_PUBLISHER
                            }
                        }
                    },
                    userToken
                );

                return resolve(codes);

            } catch (error) {
                return reject(error);
            }
        })
    }

    static publishCode( dialCode,userToken ) {
        return new Promise(async (resolve, reject) => {
            try { 

                await bodhServices.publishCode(
                    dialCode,
                    userToken,
                    {
                        "request" : {}
                    }
                );

                let codeStatus = await bodhServices.codeStatus(
                    userToken,
                    {
                        "request" : {
                            "dialcode" : {
                                "identifier" : dialCode
                            }
                        }
                    }
                );

                if( 
                    codeStatus !== messageConstants.common.BODH_DIAL_CODE_LIVE_STATUS
                ) {
                    throw {
                        message : 
                        messageConstants.apiResponses.DIAL_CODE_NOT_PUBLISHED
                    }
                }

                return resolve(codeStatus);

            } catch (error) {
                return reject(error);
            }
        })
    }

     /**
      * Create html from ejs.
      * @method
      * @name createHtmlFromEjs
      * @param  {data}  - Data to be sent to ejs.
      * @param  {code}  - unique code data.
      * @return {Promise}
    */

    static createHtmlFromEjs( data,code ) {
        return new Promise(async (resolve, reject) => {
            try {

                let qrCodePath = 
                `${ROOT_PATH}${process.env.QR_CODE_PATH}`;
                
                let pathToEjsFile = ROOT_PATH+"/template/qr-code/index.ejs";

                let ejsData =  await ejs.renderFile(pathToEjsFile,{
                    data : data
                })
                
                fs.appendFile(`${qrCodePath}/${code}/index.html`,ejsData,async function(err){
                    if(err) {
                        throw {
                            message : "Html could not be created for the given ejs"
                        };
                    } else {
                        return resolve({})
                    }
                })


            } catch (error) {
                return reject(error);
            }
        })
    }

     /**
      * Upload images and file in cloud services.
      * @method
      * @name upload
      * @param  {code}  - Code data.
      * @returns {Promise}
    */
   
    static upload( code ) {
        return new Promise(async (resolve, reject) => {
            try {

                let pathToCodeFolder = 
                `${ROOT_PATH}${process.env.QR_CODE_PATH}/${code}`;
                
                let urlPrefix = `${process.env.URL_PREFIX_FOR_STORAGE}/${code}`;
 
                let imageFile;
                let pdfFile;

                if( process.env.CLOUD_STORAGE === "AWS" ) {
                    imageFile = fs.createReadStream(`${pathToCodeFolder}/image.png`);
                    pdfFile = fs.createReadStream(`${pathToCodeFolder}/qrCode.pdf`);
                } else {
                    imageFile = `${pathToCodeFolder}/image.png`;
                    pdfFile = `${pathToCodeFolder}/qrCode.pdf`;
                }

                let uploadedImageUrl = 
                await filesHelper.upload( imageFile, `${urlPrefix}/${code}.png`);
                 
                 let uploadPdfUrl = 
                 await filesHelper.upload( pdfFile, `${urlPrefix}/${code}.pdf`);
                 
                 fs.readdirSync(pathToCodeFolder)
                 .forEach(function(file,index){
                     let filePath = pathToCodeFolder+"/"+file;
                     fs.unlinkSync(filePath);
                 });
                 
                 fs.rmdirSync(pathToCodeFolder);
                 
                 return resolve({
                     imageUrl : uploadedImageUrl,
                     pdfUrl : uploadPdfUrl
                 })

            } catch (error) {
                return reject(error);
            }
        })
    }

    /**
      * Get all the pdfs urls.
      * @method
      * @name pdfs
      * @param  {codes}  - Codes array data.
      * @returns {Array} Response consists of pdf urls.
    */

    static pdfs( codes ) {
        return new Promise(async (resolve, reject) => {
            
            try {

                if( codes.length < 1) {
                    throw {
                        message : messageConstants.apiResponses.QR_CODE_DATA_SIZE
                    }
                }
                let qrCodeDocuments = await database.models.qrCode.find({
                    code : { $in : codes }
                },{ _id : 1,pdfUrl : 1,code : 1 }).lean();

                if( qrCodeDocuments.length < 1 ) {
                    throw { 
                        message : messageConstants.apiResponses.QR_CODE_NOT_FOUND
                    }
                }

                return resolve({
                    message : messageConstants.apiResponses.QR_CODE_FETCHED,
                    result : qrCodeDocuments
                });
            
            } catch (error) {
                return reject(error);
            }
        })
    }
    
};