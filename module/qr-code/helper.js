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
const request = require('request');
let filesHelper = require(ROOT_PATH+"/module/files/helper");

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
                            courseName : qrCodeCreationData.metaInformation.courseName,
                            courseId : qrCodeCreationData.metaInformation.courseId,
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
      * Generate pdfs from the code.
      * @method
      * @name generatePdfs
      * @param  {codes}  - All body data.
      * @returns {json} Response consists of Array of generated qr code information.
    */

    static generatePdfs( codes ) {
        return new Promise(async (resolve, reject) => {
            
            try {

                let codeString = codes.toString();

                let qrCodeDocument = await database.models.qrCode.findOne({
                    code : codeString
                },{ _id : 1,pdfUrl:1 }).lean();

                let result = {
                    url : ""
                }

                if( !qrCodeDocument ) {

                    let qrCodeDocuments = await database.models.qrCode.find({
                        code : {
                            $in:codes
                        },
                        status : "active"
                    },{
                        "imageUrl" : 1,
                        "metaInformation.courseName" : 1,
                        "metaInformation.courseId" : 1,
                        "code" : 1
                    }).lean();

                    if( qrCodeDocuments.length !== codes.length ) {
                        throw {
                            message : messageConstants.apiResponses.QR_CODE_INCORRECT
                        }
                    }

                    let result = [];
                    let formDataForGotenberg = [];

                    for( let pointerToCode = 0; 
                        pointerToCode < qrCodeDocuments.length;
                        pointerToCode++
                    ) {
                        let saveQrCodeImageLocally = await this.saveQrCode(
                            qrCodeDocuments[pointerToCode].imageUrl,
                            codeString,
                            qrCodeDocuments[pointerToCode].code
                        )

                        let obj = {
                            courseName : qrCodeDocuments[pointerToCode].metaInformation.courseName,
                            courseId : qrCodeDocuments[pointerToCode].metaInformation.courseId
                        }

                        let code = qrCodeDocuments[pointerToCode].code;

                        if( saveQrCodeImageLocally.success ) {
                            obj["qrCodeImage"] = `${code}.png` 
                        }

                        formDataForGotenberg.push({
                            value : 
                            fs.createReadStream(`${ROOT_PATH}${process.env.QR_CODE_PATH}/${codeString}/${code}.png`),
                            options : {
                                filename : `${code}.png`
                            }
                        })

                        result.push(obj);
                    }

                    let htmlGenerated = 
                    await this.createHtmlFromEjs(result,codeString);

                    formDataForGotenberg.push({
                        value : 
                        fs.createReadStream(`${ROOT_PATH}${process.env.QR_CODE_PATH}/${codeString}/index.html`),
                        options : {
                            filename : "index.html"
                        }
                    })

                } else {
                    result.url = qrCodeDocument.pdfUrl;
                }

                return resolve({
                    result : result
                });
            
            } catch (error) {
                return reject(error);
            }
        })
    }

    /**
      * Generate pdfs from the code.
      * @method
      * @name saveQrCode
      * @param  {codes}  - All body data.
      * @returns {json} Response consists of Array of generated qr code information.
    */

   static saveQrCode( imageUrl,pathForMultipleCodes,code ) {
       return new Promise(async (resolve, reject) => {
           try {
               let qrCodePath = `${ROOT_PATH}${process.env.QR_CODE_PATH}`;
               
               if ( !fs.existsSync(qrCodePath) ) {
                   fs.mkdirSync(qrCodePath);
                }
                
                if( !fs.existsSync(`${qrCodePath}/${pathForMultipleCodes}`) ){
                    fs.mkdirSync(`${qrCodePath}/${pathForMultipleCodes}`);
                }

                let options = {
                   url : imageUrl,
                   encoding : null
                }

               function callback(error,response,body) {
                   if(error) {

                   }
                   fs.writeFile(
                       `${ROOT_PATH}${process.env.QR_CODE_PATH}/${pathForMultipleCodes}/${code}.png`,
                       body,
                       function (err,data){
                           if(err) {
                               return resolve({
                                   success : false
                               })
                           } else {
                               return resolve({
                                   success : true
                                })
                           }
                       }
                    )
               }

               request(options,callback);
           } catch (error) {
               return reject(error);
            }
        })
    }
    

};